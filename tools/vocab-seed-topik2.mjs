#!/usr/bin/env node
/* 「단어」 5단계 — TOPIK II 낱말 **씨앗** (docs/vocab-plan.md 5층 「2단계 자료」) → vocab/data/topik2.json
 *
 *   node tools/vocab-seed-topik2.mjs
 *
 * TOPIK II 필수 = 국립국어원 표준 교육과정 어휘 **3 ~ 6급**(docs/vocab/std-2017.json, 공공누리 1유형) 중
 * TOPIK I 자료(vocab/data/topik1.json)에 없는 낱말.
 *
 * TOPIK I 때와 다른 점 — **우리 자료에서 낱말을 더하지 않는다.** TOPIK I 씨앗에서 빈도로 더한 217개 중
 * 64개가 활용형 조각 · 사람 이름 · 문법 용어였다(docs/vocab-plan.md 진행 기록). 표준 목록만 쓴다.
 * 우리 자료(TOPIK II 문항 · 중고급 코스)는 **순서**에만 쓴다 — 자주 나오는 것이 앞, 같으면 급수 낮은 것 · 표준 순서.
 *
 * 씨앗은 C급: 표제어 · 품사 · 급수(=표준 급수) · 사전 영어 뜻(있으면) · 길잡이말 · 사전 예문(있으면).
 * 안 그래비티가 500개씩 B급으로 올린다(docs/antigravity-vocab-topik2-task.md).
 * **이미 채운 줄은 덮지 않는다** — 파일이 있으면 표제어가 같은 줄은 그대로 두고 새 낱말만 뒤에 더한다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));

const { GLOSSARY } = await load('glossary.js');
const { EXAMPLES } = await load('glossary-examples.js');
const { glossFind } = await load('gloss-find.js');
const { TOPIK2_READING } = await load('topik2.js');
const { TOPIKL2_ITEMS } = await load('topik-listening.js');
const { COURSES } = await load('courses-lite.js');
const std = read('docs/vocab/std-2017.json');
const t1 = new Set(read('vocab/data/topik1.json').map((w) => w.head));

/* 우리 TOPIK II 쪽 자료의 등장 수 — tools/vocab-draft.mjs 와 같은 방식(해설 · 지시문 칸은 뺀다). */
const SKIP = new Set(['id', 'why', 'why_en', 'en', 'rom', 'tip', 'emoji', 'icon', 'audio', 'img', 'question', 'q', 'genre', 'type', 'topic', 'cond', 'title', 'h']);
const texts = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) texts(x, out);
  return out;
};
const EARLY = new Set(['Start here', 'After Hangul', 'After First Words', 'Beginner']);
const inDict = (k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k);
const freq = new Map();
for (const tok of texts([...TOPIK2_READING, ...TOPIKL2_ITEMS, ...COURSES.filter((c) => !EARLY.has(c.level))]).join(' ').match(/[가-힣]+/g) || []) {
  const k = glossFind(inDict, tok);
  const h = k ? GLOSSARY[k]?.head || k : tok;
  freq.set(h, (freq.get(h) || 0) + 1);
}

const gloss = new Map();
for (const v of Object.values(GLOSSARY)) if (!gloss.has(v.head)) gloss.set(v.head, v);

const pick = std.words.map(([h, g, p, hint], i) => ({ h, g, p, hint, i }))
  .filter((x) => x.g >= 3 && x.g <= 6 && !t1.has(x.h) && x.p !== '품사 없음' && !/^-|-$/.test(x.h) && /^[가-힣 ]+$/.test(x.h))
  .sort((a, b) => (freq.get(b.h) || 0) - (freq.get(a.h) || 0) || a.g - b.g || a.i - b.i);

const OUT = path.join(ROOT, 'vocab/data/topik2.json');
const had = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];
const have = new Set(had.map((w) => w.head));
const fresh = pick.filter((x) => !have.has(x.h)).map((x) => {
  const g = gloss.get(x.h) || {};
  const ex = EXAMPLES[x.h];
  const w = {
    id: x.h, head: x.h, pos: x.p || (g.pos === '품사 없음' ? '' : g.pos) || '', level: x.g, freq: freq.get(x.h) || 0,
    purposes: ['topik2'], topics: [], en: g.en || '',
    examples: ex?.ex ? [{ ko: ex.ex, en: ex.en || '' }] : [],
    rel: {}, grade: 'C', src: [...(g.en ? ['krdict'] : []), 'std2017'], std: x.g,
  };
  if (x.hint) w.hint = x.hint;
  return w;
});
const all = [...had, ...fresh];
fs.writeFileSync(OUT, '[\n' + all.map((w) => ' ' + JSON.stringify(w)).join(',\n') + '\n]\n');
const by = {}; all.forEach((w) => { by[w.level] = (by[w.level] || 0) + 1; });
console.log(`vocab/data/topik2.json — 있던 ${had.length} + 새로 ${fresh.length} = ${all.length}개 · 급수별 ` +
  Object.entries(by).map(([k, v]) => `${k}급 ${v}`).join(' · ') +
  ` · 영어 뜻 없음 ${all.filter((w) => !w.en).length} · 우리 자료에 나온 것 ${all.filter((w) => w.freq).length}`);
