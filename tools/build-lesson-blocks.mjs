#!/usr/bin/env node
/* 레슨별 추가 블록 — docs/lesson-blocks/<코스 id>.json → lesson-extra/<코스 id>.json + lesson-extra/index.json
   (운영자 2026-10-15 「코스 블럭 더 추가 · 레슨별로 학습에 필요한 블럭 개별화」, 계획 docs/plans/course-blocks.md)
   원본 모양: { "<레슨 id>": [ { t:'compare'|'vocab'|'dictate'|'write'|'listen'|'choice'|'cloze'|'correct'|'build', …, at?: 번호 } ] }
   원래 레슨 블록(courses*.js)은 건드리지 않는다 — 레슨 시작할 때 화면이 합친다.
   node tools/build-lesson-blocks.mjs          만들기
   node tools/build-lesson-blocks.mjs --check  모양 검사 + 만든 것이 원본과 같은지(CI) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'docs/lesson-blocks'), OUT = path.join(ROOT, 'lesson-extra');
const CHECK = process.argv.includes('--check');
const bad = [];
const { COURSES } = await import(pathToFileURL(path.join(ROOT, 'courses.js')).href);
const { conjugate } = await import(pathToFileURL(path.join(ROOT, 'tools/ko-conj.mjs')).href);
/* 문장 늘리기를 더 어렵게(운영자 2026-10-21): docs/expand-decoys.json = { "<레슨 id>": [ [단계1 틀린 조각…], [단계2 …] ] } — 틀린 조각을 칩에 섞는다.
   원본(레슨 블록)은 안 건드리고 여기서 단계에 붙인다. 없으면 그대로. */
const DECOYS = fs.existsSync(path.join(ROOT, 'docs/expand-decoys.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/expand-decoys.json'), 'utf8')) : {};
const lessonsOf = new Map(COURSES.map((c) => [c.id, new Set(c.lessons.map((l) => l.id))]));
const str = (x) => typeof x === 'string' && x.trim().length > 0;
const strs = (a, min = 1) => Array.isArray(a) && a.length >= min && a.every(str);

/* 블록 종류마다 꼭 있어야 하는 칸 */
const RULES = {
  compare: (b) => (['a', 'b'].every((k) => b[k] && str(b[k].h) && (!b[k].ex || strs(b[k].ex)))) || '비교는 a · b 에 h(이름)와 ex(예문)',
  vocab: (b) => (Array.isArray(b.items) && b.items.length >= 3 && b.items.length <= 8 && b.items.every((i) => str(i.ko) && str(i.en))) || '낱말 카드는 3~8개, 각각 ko · en',
  dictate: (b) => (str(b.say) && (!b.answers || strs(b.answers))) || '받아쓰기는 say(들려줄 문장), answers(받아들일 쓰기)',
  write: (b) => (str(b.q) && str(b.sample) && (!b.must || strs(b.must))) || '내 문장 쓰기는 q · sample(예시 한 문장), must(꼭 넣을 조각, 선택)',
  listen: (b) => (str(b.say) && strs(b.options, 2) && Number.isInteger(b.answer) && b.answer >= 0 && b.answer < b.options.length) || 'listen 은 say · options · answer',
  choice: (b) => (str(b.q) && strs(b.options, 2) && Number.isInteger(b.answer) && b.answer >= 0 && b.answer < b.options.length) || 'choice 는 q · options · answer',
  cloze: (b) => (str(b.sentence) && str(b.answer) && strs(b.options, 2)) || 'cloze 는 sentence · answer · options',
  correct: (b) => (str(b.wrong) && strs(b.answers)) || 'correct 는 wrong · answers',
  build: (b) => (str(b.q) && strs(b.answers)) || 'build 는 q · answers',
  /* 짧은 글 — ko 줄들(2~5), en 은 같은 줄 수(선택). 뒤에 choice 로 이해 문제를 따로 붙인다 */
  passage: (b) => (Array.isArray(b.ko) && b.ko.length >= 2 && b.ko.length <= 5 && strs(b.ko) && (!b.en || (strs(b.en) && b.en.length === b.ko.length))) || 'passage 는 ko 줄 2~5개, en 은 같은 줄 수',
  /* 문장 늘리기 — base{tokens,en} 에서 steps(2~4)마다 조각을 얹어 점점 길어진다. 화면이 순서 맞추기 여러 칸으로 풀어 쓴다 */
  expand: (b) => {
    if (!(b.base && strs(b.base.tokens, 2) && str(b.base.en) && Array.isArray(b.steps) && b.steps.length >= 2 && b.steps.length <= 4)) return 'expand 는 base{tokens,en} 와 steps 2~4개';
    let prev = b.base.tokens.join('').length;
    for (const st of b.steps) { if (!(strs(st.tokens, 2) && str(st.en))) return 'expand steps 마다 tokens · en'; const n = st.tokens.join('').length; if (n <= prev) return 'expand 는 단계마다 문장이 길어져야 한다'; prev = n; }
    return true;
  },
  cando: (b) => strs(b.items, 2) && b.items.length <= 4 || 'cando 는 items 2~4개(영어 한 줄씩)',
  /* 활용 표 — verbs(3~5)와 forms 만 쓰면 정답은 활용 도구(ko-conj)가 채운다(아래 expandConj) */
  conj: (b) => (Array.isArray(b.verbs) && b.verbs.length >= 3 && b.verbs.length <= 5 && b.verbs.every((v) => str(v.v) && ['동사', '형용사'].includes(v.pos) && str(v.en))
    && Array.isArray(b.forms) && b.forms.length >= 2 && b.forms.every((f) => FORM_LB[f])) || 'conj 는 verbs 3~5개({v,pos:동사|형용사,en})와 forms(present past future and mod)',
};
const FORM_LB = { present: '현재 -아요/어요', past: '과거 -았/었어요', future: '미래 -(으)ㄹ 거예요', and: '-고', mod: '꾸미는 꼴 -는/-(으)ㄴ' };
const FORM_IX = { present: 0, past: 1, future: 2, and: 3, mod: 4 };
function expandConj(b, at) {
  const rows = [];
  for (const v of b.verbs) {
    const c = conjugate(v.v, v.pos);
    if (!c) { bad.push(`${at}: 「${v.v}」 는 활용 도구가 모르는 낱말이다`); return b; }
    rows.push({ ko: v.v, en: v.en, a: Object.fromEntries(b.forms.map((f) => [f, c[FORM_IX[f]][1]])) });
  }
  return { t: 'conj', ...(b.h ? { h: b.h } : {}), ...(b.at != null ? { at: b.at } : {}), cols: b.forms.map((f) => ({ k: f, lb: FORM_LB[f] })), rows };
}

const out = new Map(), index = {};
const files = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort() : [];
for (const f of files) {
  const cid = f.replace(/\.json$/, '');
  let d;
  try { d = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')); } catch (e) { bad.push(`${f}: JSON 이 깨졌다 — ${e.message}`); continue; }
  if (!lessonsOf.has(cid)) { bad.push(`${f}: 이런 코스 id 가 없다(파일 이름 = 코스 id)`); continue; }
  for (const [lid, blocks] of Object.entries(d)) {
    if (!lessonsOf.get(cid).has(lid)) bad.push(`${f}: 코스 ${cid} 에 레슨 ${lid} 가 없다`);
    if (!Array.isArray(blocks) || !blocks.length) { bad.push(`${f} ${lid}: 블록 목록이 비었다`); continue; }
    blocks.forEach((b, i) => {
      const at = `${f} ${lid}[${i}]`;
      const rule = RULES[b?.t];
      if (!rule) return bad.push(`${at}: 쓸 수 없는 종류 「${b?.t}」 (${Object.keys(RULES).join(' · ')})`);
      const r = rule(b); if (r !== true) bad.push(`${at}: ${r}`);
      if (b.at != null && !(Number.isInteger(b.at) && b.at >= 0)) bad.push(`${at}: at 은 0 이상의 정수`);
    });
  }
  const dd = {};
  for (const [lid, blocks] of Object.entries(d)) dd[lid] = (Array.isArray(blocks) ? blocks : []).map((b, i) => (b?.t === 'conj' && RULES.conj(b) === true ? expandConj(b, `${f} ${lid}[${i}]`) : b));
  for (const [lid, blocks] of Object.entries(dd)) {
    const dl = DECOYS[lid]; if (!dl) continue;
    const ex = blocks.find((b) => b?.t === 'expand'); if (!ex) { bad.push(`docs/expand-decoys.json ${lid}: 이 레슨에 expand 가 없다`); continue; }
    ex.steps = ex.steps.map((st, si) => {
      const x = dl[si]; if (!x || !x.length) return st;
      if (!strs(x) || x.length > 2) { bad.push(`docs/expand-decoys.json ${lid}[${si}]: 틀린 조각은 문자열 1~2개`); return st; }
      if (x.some((y) => st.tokens.includes(y))) { bad.push(`docs/expand-decoys.json ${lid}[${si}]: 틀린 조각이 정답 조각과 같다`); return st; }
      return { ...st, decoys: x };
    });
  }
  out.set(`${cid}.json`, JSON.stringify(dd) + '\n');
  index[cid] = Object.keys(d).length;
}
out.set('index.json', JSON.stringify(index) + '\n');

if (bad.length) { console.error('레슨 추가 블록에 문제가 있다:\n  - ' + bad.join('\n  - ')); process.exit(1); }
let diff = 0;
if (CHECK) {
  for (const [f, body] of out) { const p = path.join(OUT, f); if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== body) { console.error(`lesson-extra/${f} 가 원본과 다르다 — node tools/build-lesson-blocks.mjs`); diff++; } }
  const have = fs.existsSync(OUT) ? fs.readdirSync(OUT) : [];
  for (const f of have) if (!out.has(f)) { console.error(`lesson-extra/${f} 는 원본이 없다 — 지운다`); diff++; }
  if (diff) process.exit(1);
  console.log(`레슨 추가 블록 검사 — 통과 (코스 ${files.length}개 · 레슨 ${Object.values(index).reduce((a, b) => a + b, 0)}개)`);
} else {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (!out.has(f)) fs.rmSync(path.join(OUT, f));
  for (const [f, body] of out) fs.writeFileSync(path.join(OUT, f), body);
  console.log(`레슨 추가 블록 — 코스 ${files.length}개 · 레슨 ${Object.values(index).reduce((a, b) => a + b, 0)}개 → lesson-extra/`);
}
