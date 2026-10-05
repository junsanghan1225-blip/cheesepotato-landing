#!/usr/bin/env node
/* 문법 「쓰임 보기」 — 생성물 grammar-usage.js 를 만든다(손으로 고치지 말 것).

     node tools/build-grammar-usage.mjs [--list]

   우리 자료 전체에서 그 문법이 들어간 문장을 찾아 표현마다 셋까지 고른다(docs/grammar-plan.md 3).
   새로 지어내지 않는다 — 이미 검토해 실은 문장만 옮긴다. 찾는 꼴은 화면 색칠과 같은 grammar-mark.js.
   고르는 차례: TOPIK(읽기 · 듣기 · 쓰기) → 읽기 지문 → 사전 · 낱말 예문. 빈칸(　 · ㉠)이 있는 문장은 뺀다.
   더 긴 문법이 같은 자리를 잡으면(「-기에」 ⊂ 「-기에 망정이지」) 짧은 쪽에서는 그 문장을 쓰지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { grammarMarkRe } from '../grammar-mark.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(path.join(ROOT, f));
const { SB_CATS, SB_MORE, SB_SEED } = await imp('sentences.js');
const PTS = SB_CATS.flatMap((c) => c.points);

const sents = (text) => String(text || '').replace(/\s+/g, ' ').split(/(?<=[.?!])\s+/).map((x) => x.trim())
  .filter((x) => x.length >= 6 && x.length <= 70 && !/[　㉠㉡㉢]|\(\s*\)|___/.test(x) && /[가-힣]/.test(x));
const POOL = [];   // { ko, en, src: [ko, en], href, rank }
const add = (text, en, src, href, rank, only) => { for (const ko of sents(text)) POOL.push({ ko, en: en || '', src, href, rank, only }); };

const { TOPIK_READING } = await imp('topik.js');
const { TOPIK2_READING } = await imp('topik2.js');
for (const it of [...TOPIK_READING, ...TOPIK2_READING]) {
  add(it.passage, '', [`TOPIK ${it.exam === 'I' ? 'Ⅰ' : 'Ⅱ'} 읽기 ${it.slot}번 연습`, `TOPIK ${it.exam} Reading Q${it.slot} practice`], `/topik-reading/${it.id}.html`, 0);
}
const L = await imp('topik-listening.js');
for (const it of [...(L.TOPIKL_ITEMS || []), ...(L.TOPIKL2_ITEMS || [])]) {
  for (const ln of it.script || []) add(ln.text, '', [`TOPIK ${it.exam === 'I' ? 'Ⅰ' : 'Ⅱ'} 듣기 ${it.slot}번 연습`, `TOPIK ${it.exam} Listening Q${it.slot} practice`], `/topik-listening/${it.id}.html`, 0);
}
const { TW_ITEMS } = await imp('topik-writing.js');
for (const it of TW_ITEMS) add(it.passage, '', [`TOPIK Ⅱ 쓰기 ${it.q}번 연습`, `TOPIK II Writing Q${it.q} practice`], `/topik-writing/${it.id}.html`, 0);
const { READING } = await imp('reading.js');
for (const g of Object.values(READING)) for (const list of Object.values(g)) for (const it of list) add(it.passage, '', ['읽기 연습', 'Reading practice'], '', 1);
const { VOCAB } = await imp('vocab-topik1.js');
for (const w of VOCAB) for (const [ko, en] of w.x || []) add(ko, en, [`낱말 「${w.h}」 예문`, `Example for ${w.h}`], `/dictionary/${encodeURIComponent(w.h)}.html`, 2);
/* TOPIK II 낱말 예문(500개씩 조각) — 연습 문장(PRACTICE)에만 쓴다. 쓰임 보기(USAGE)는 예전 그대로 두려고 only 표시. */
{
  const { VOCAB: V2 } = await imp('vocab-topik2.js');
  for (let k = 0; k * 500 < V2.length; k++) {
    const { EX } = await imp(`vocab-topik2-ex/${k}.js`);
    V2.slice(k * 500, (k + 1) * 500).forEach((w, j) => { for (const [ko, en] of EX[j] || []) add(ko, en, ['', ''], '', 3, 'practice'); });
  }
}

/* 더 긴 문법(꼴이 짧은 쪽의 꼴을 품은 것)을 미리 짝지어 둔다 */
const RE = new Map(PTS.map((p) => [p.id, grammarMarkRe(p.name)]));
const core = (re) => (re ? re.source : '');
const longer = new Map(PTS.map((p) => [p.id, PTS.filter((q) => q.id !== p.id && RE.get(q.id) && RE.get(p.id)
  && core(RE.get(q.id)).length > core(RE.get(p.id)).length && core(RE.get(q.id)).includes(core(RE.get(p.id))) && !/^N[(이가-힣]/.test(p.name))
  .map((q) => RE.get(q.id))]));

/* 조사는 낱말 끝 한 글자를 보고 찾으니 「사이다 · 사과 · 얼마나」를 잡는다. 사전으로 거른다:
   어절 통째가 사전 낱말이면(얼마나 · 사이다) 조사가 아니고, 조사를 뗀 앞말이 명사 · 대명사여야 한다. */
const { GLOSSARY } = await imp('glossary.js');
const HEAD = new Map(Object.values(GLOSSARY).map((v) => [v.head, v.pos]));
for (const w of VOCAB) if (!HEAD.has(w.h)) HEAD.set(w.h, w.p);
const NOUNY = new Set(['명사', '대명사', '의존 명사', '의존명사']);
const isParticle = (p) => /^N[(이가-힣]/.test(p.name) && !/-/.test(p.name);
const NUM = new Set(['일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '백', '천', '몇']);
const bare = (x) => x.replace(/[.,!?'"“”‘’()「」]/g, '');
function particleOk(ko, m) {
  const start = ko.lastIndexOf(' ', m.index) + 1;
  const word = bare(ko.slice(start, m.index + m[0].length));
  const stem = ko.slice(start, m.index);
  if (HEAD.has(word) || !NOUNY.has(HEAD.get(stem))) return false;
  if (m[0] === '하고' && HEAD.has(stem + '하다')) return false;      // 편하고 · 조용하고 — 「하다」 낱말
  if (m[0] === '만' && NUM.has(stem.slice(-1))) return false;        // 삼만 원 — 수
  return true;
}
/* 꼬리 쪽: 어절 통째가 사전 낱말이면(하지만 · 그러므로 · 그대로) 그 낱말이다. 앞말에 꼴 첫머리를 붙인 것이
   명사면(바+다 → 바다가, 거+기 → 거기에서, 보+고서 → 보고서) 그것도 낱말이다. 「-는 …」 꼴 앞이 에 · 서 · 씨 면
   「는」은 토씨다(겨울에는 바람, 하루 씨는 한국). */
function endingOk(ko, m) {
  const start = ko.lastIndexOf(' ', m.index - 1) + 1;
  const endSp = ko.indexOf(' ', m.index);
  const word = bare(ko.slice(start, endSp < 0 ? ko.length : endSp));
  const prefix = ko.slice(start, m.index);
  if (!prefix && !/^\s/.test(m[0])) return false;
  if (HEAD.has(word) && HEAD.get(word) !== '동사' && HEAD.get(word) !== '형용사') return false;
  const first = m[0].trim().split(/\s+/)[0];
  /* 앞말 끝 몇 글자 + 꼴 첫머리가 명사면(꼭대 + 기 → 꼭대기에, 정산 + 기 → 정산기에서) 낱말이다 */
  if (first.length >= 2) for (let j = 0; j < prefix.length; j++) for (let k = 1; k <= first.length; k++) if (NOUNY.has(HEAD.get(prefix.slice(j) + first.slice(0, k)))) return false;
  if (/^는\s/.test(m[0]) && /[에서씨께]$/.test(prefix)) return false;
  if (/^는\s/.test(m[0]) && NOUNY.has(HEAD.get(prefix))) return false;
  return true;
}
/* 이름만 다르고 꼴이 같은 짝(「-(으)ㄹ까요? ① 제안 · ② 의향」)은 뜻을 글자로 못 가른다 — 쓰임 보기를 안 붙인다 */
const sameForm = new Set();
for (const p of PTS) for (const q of PTS) if (p.id !== q.id && RE.get(p.id) && String(RE.get(p.id)) === String(RE.get(q.id))) sameForm.add(p.id);

/* 꼴만으로는 다른 말(「한 집안」의 수 · 「바이오」)과 못 가르는 것 — 쓰임 보기를 안 붙인다 */
const SKIP_ID = new Set(['7-1', '3-3', '4-10', '23-1']);   // 23-1 N이다: 찾으면 「마련이다 · 때문이다」뿐이라 초급에 안 맞는다
const USAGE = {};
/* 연습 문장(운영자 요청 2026-10-05) — 「블록으로 맞추기」가 위에 보인 예문 · 대화 · 쓰임 보기를 그대로 다시 내서, 처음 보는 문장으로
   풀게 한다. 같은 꼴을 찾은 문장 가운데 화면에 이미 나온 것을 뺀 것. 3 ~ 10어절 · 영어 뜻이 있는 것 먼저(블록 위에 뜻을 보여 준다) ·
   초급 표현은 짧은 문장 먼저. 표현마다 여덟까지. */
const PRACTICE = {};
/* 손으로 쓴 연습 문장(안티 그래비티 → Claude 검토, docs/grammar-practice.json, 검사 check-grammar-practice) — 있으면 맨 앞에 */
const HAND = fs.existsSync(path.join(ROOT, 'docs/grammar-practice.json'))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/grammar-practice.json'), 'utf8')) : {};
/* 초급 표현은 짧은 문장부터(블록이 적어야 처음 하는 사람이 덜 막힌다) — 안티 문장 중 8어절이 넘는 것이 꽤 있다(2026-10-05 검토) */
const handOf = (id) => (Array.isArray(HAND[id]) ? HAND[id] : []).filter((x) => x?.ko)
  .map((x) => (x.en ? [x.ko.trim(), x.en.trim()] : [x.ko.trim()]))
  .sort((a, b) => (LV.get(id) === 'beginner' ? a[0].split(/\s+/).length - b[0].split(/\s+/).length : 0));
const withHand = (id, auto) => { const h = handOf(id); const out = [...h, ...auto.filter((a) => !h.some((x) => x[0] === a[0]))].slice(0, 8); return out; };
const LV = new Map(PTS.map((p) => [p.id, p.lv]));
/* 게시판 씨앗 글(SB_SEED)도 화면 아래에 보인다 — 연습 문장에서 뺀다 */
const seedOf = (id) => (SB_SEED?.[id] || []).map((r) => String(r[1] || '').trim());
let made = 0;
for (const p of PTS) {
  const re = RE.get(p.id);
  if (!re || sameForm.has(p.id) || SKIP_ID.has(p.id)) { const h = withHand(p.id, []); if (h.length) PRACTICE[p.id] = h; continue; }
  const own = new Set([p.ex, (SB_MORE[p.id] || [])[3], ...(p.dlg || []).map((l) => String(l).replace(/^\s*[AB]\s*:\s*/, ''))].map((x) => String(x || '').trim()));
  const hit = [];
  for (const s of POOL) {
    if (own.has(s.ko)) continue;
    re.lastIndex = 0;
    const m = [...s.ko.matchAll(re)].find((x) => (isParticle(p) ? particleOk(s.ko, x) : endingOk(s.ko, x)));
    if (!m) continue;
    if (longer.get(p.id).some((r) => { r.lastIndex = 0; return r.test(s.ko); })) continue;
    hit.push({ ...s, at: m.index, len: m[0].length });
  }
  const usageHit = hit.filter((s) => !s.only);
  const pick = (shown) => {
    const n = (x) => x.ko.split(/\s+/).length;
    const cand = hit.filter((s) => !shown.has(s.ko) && n(s) >= 3 && n(s) <= 10 && !/["“”'‘’「」()]/.test(s.ko));
    const beg = LV.get(p.id) === 'beginner';
    cand.sort((a, b) => (b.en ? 1 : 0) - (a.en ? 1 : 0) || (beg ? a.ko.length - b.ko.length : a.rank - b.rank || a.ko.length - b.ko.length));
    const out = [];
    for (const s of cand) { if (out.length >= 8) break; if (!out.some((o) => o.ko === s.ko)) out.push(s); }
    return out.map((s) => (s.en ? [s.ko, s.en] : [s.ko]));
  };
  if (!usageHit.length) { const pr = withHand(p.id, pick(new Set([...own, ...seedOf(p.id)]))); if (pr.length) PRACTICE[p.id] = pr; continue; }
  /* 짧고 쉬운 문장부터, 같은 출처 쪽은 한 번만, TOPIK 둘 + 그 밖 하나 */
  usageHit.sort((a, b) => a.rank - b.rank || a.ko.length - b.ko.length);
  const out = [], seen = new Set();
  for (const s of usageHit) {
    if (out.length >= 3) break;
    const key = s.href || s.src[0];
    if (seen.has(key) || out.some((o) => o.ko === s.ko)) continue;
    if (s.rank === 0 && out.filter((o) => o.rank === 0).length >= 2) continue;
    seen.add(key); out.push(s);
  }
  if (out.length < 3) for (const s of usageHit) { if (out.length >= 3) break; if (!out.includes(s) && !out.some((o) => o.ko === s.ko)) out.push(s); }
  USAGE[p.id] = out.map((s) => [s.ko, s.en, s.src[0], s.src[1], s.href, s.at, s.len]);
  const pr = withHand(p.id, pick(new Set([...own, ...out.map((s) => s.ko), ...seedOf(p.id)])));
  if (pr.length) PRACTICE[p.id] = pr;
  made++;
}
fs.writeFileSync(path.join(ROOT, 'grammar-usage.js'), `/* 문법 「쓰임 보기」 — 생성물. 손으로 고치지 말 것.
 *   고칠 때: grammar-mark.js · tools/build-grammar-usage.mjs 를 고치고 다시 돌린다.
 *   ${made}개 표현 · 표현마다 [문장, 영어(있을 때), 출처, 출처(영어), 주소, 칠할 곳, 길이] 셋까지. 우리 자료에서 옮긴 문장만 — 지어낸 것 없음.
 */
export const GRAMMAR_USAGE = ${JSON.stringify(USAGE)};
/* 「블록으로 맞추기」 연습 문장 — 표현마다 [문장, 영어(있을 때)] 여덟까지. 위 예문 · 대화 · 쓰임 보기에 나온 문장은 뺐다. */
export const GRAMMAR_PRACTICE = ${JSON.stringify(PRACTICE)};
`);
console.log(`grammar-usage.js — ${made}개 표현 · 연습 문장 ${Object.keys(PRACTICE).length}개 표현 ${Object.values(PRACTICE).reduce((a, x) => a + x.length, 0)}문장 (문장 풀 ${POOL.length}개)`);
if (process.argv.includes('--list')) for (const p of PTS) if (USAGE[p.id]) console.log(`${p.id}\t${p.name}\n  ` + USAGE[p.id].map((u) => `${u[0].slice(0, u[5])}【${u[0].substr(u[5], u[6])}】${u[0].slice(u[5] + u[6])}  [${u[2]}]`).join('\n  '));
