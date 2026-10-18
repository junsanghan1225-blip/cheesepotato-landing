#!/usr/bin/env node
/* CI 검사 — docs/grammar-sentences.json (문법별 단계별 연습 문장, 운영자 2026-10-15 「예문 더 많이 · 블럭별 난이도 · 말도 안 되는 예문」)
   모양: { "<문법 id>": [ { ko, en, lv: 1|2|3 } … ] }  (lv 1 쉬움 · 2 보통 · 3 어려움, 단계마다 3개 이상 · 합쳐 9개 이상 — 12개가 목표)
   검사: 그 문법 부분이 문장에 실제로 들어 있나(화면 색칠과 같은 grammar-mark.js) · 「N에서 N까지」처럼 짝으로 쓰는 문법은 짝이 다 있나 ·
   단계별 길이(어절 · 글자) · 위 예문(ex · more · 대화)과 같은 문장이 아닌가(그대로 되풀이) · 한 문법 안에서 겹치지 않나 · 영어 뜻이 있나.
   node tools/check-grammar-sentences.mjs         검사(잘못이 있으면 실패)
   node tools/check-grammar-sentences.mjs --stat  전체 문법의 현황(몇 개가 직접 쓴 문장을 갖췄나)  */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const { SB_CATS, SB_MORE } = await imp('sentences.js');
const { grammarMarkRe } = await imp('grammar-mark.js');
const PTS = SB_CATS.flatMap((c) => c.points);
const FILE = path.join(ROOT, 'docs/grammar-sentences.json');
const D = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
const STAT = process.argv.includes('--stat');
/* 단계별 길이 한도 [어절, 글자(공백 뺀)] */
const LIM = {
  beginner:     { 1: [4, 16], 2: [6, 24], 3: [8, 32] },
  intermediate: { 1: [6, 26], 2: [8, 34], 3: [11, 46] },
  advanced:     { 1: [8, 34], 2: [11, 46], 3: [14, 60] },
};
const words = (k) => k.trim().split(/\s+/).length, chars = (k) => k.replace(/\s/g, '').length;
/* 「N에서 N까지, N부터 N까지」 — 짝으로 쓰는 꼴(앞 · 뒤)을 찾아 둔다. 문장에 짝 하나는 다 있어야 한다 */
const pairsOf = (name) => String(name).split(/,\s*/).map((x) => /^N([가-힣]+)\s+N([가-힣]+)$/.exec(x.trim())).filter(Boolean).map((m) => new RegExp(`${m[1]}.*${m[2]}`));
const bad = [];
const everyWhere = new Map();   // 문장 → 처음 나온 문법 — 다른 문법에 같은 문장이 또 나오면 안 된다(운영자 2026-10-18 「중복 없게」)
let have = 0;
const ids = new Set(PTS.map((p) => p.id));
for (const [id, arr] of Object.entries(D)) {
  if (id.startsWith('_')) continue;
  const p = PTS.find((x) => x.id === id);
  if (!p) { bad.push(`${id}: 이런 문법 id 가 없다`); continue; }
  if (!Array.isArray(arr)) { bad.push(`${id}: 목록이어야 한다`); continue; }
  const at = (i) => `${id} ${p.name} [${i}]`;
  const re = grammarMarkRe(p.name), pairs = pairsOf(p.name);
  const shown = new Set([p.ex, (SB_MORE[id] || [])[3], ...(Array.isArray(p.dlg) ? p.dlg : []).map((l) => String(l).replace(/^\s*[AB]\s*:\s*/, ''))].map((x) => String(x || '').trim()).filter(Boolean));
  const seen = new Set(), perLv = { 1: 0, 2: 0, 3: 0 };
  arr.forEach((x, i) => {
    if (!x || typeof x.ko !== 'string' || !x.ko.trim()) return bad.push(`${at(i)}: ko 가 없다`);
    if (![1, 2, 3].includes(x.lv)) return bad.push(`${at(i)}: lv 는 1 · 2 · 3`);
    perLv[x.lv]++;
    const ko = x.ko.trim();
    if (!x.en || !String(x.en).trim()) bad.push(`${at(i)}: 영어 뜻(en)이 없다`);
    if (!/[.?!]$/.test(ko)) bad.push(`${at(i)}: 문장 끝에 . ? ! 이 있어야 한다 — ${ko}`);
    if (/[　㉠㉡㉢]|\(\s*\)|___|\.\.\./.test(ko)) bad.push(`${at(i)}: 빈칸 표시가 들어 있다 — ${ko}`);
    if (seen.has(ko)) bad.push(`${at(i)}: 같은 문법 안에서 겹친다 — ${ko}`); seen.add(ko);
    if (everyWhere.has(ko) && everyWhere.get(ko) !== id) bad.push(`${at(i)}: 다른 문법(${everyWhere.get(ko)})에도 같은 문장이 있다 — ${ko}`); else everyWhere.set(ko, id);
    if (shown.has(ko)) bad.push(`${at(i)}: 위 예문 · 대화와 같은 문장이다(되풀이) — ${ko}`);
    const [mw, mc] = (LIM[p.lv] || LIM.advanced)[x.lv];
    if (words(ko) > mw || chars(ko) > mc) bad.push(`${at(i)}: 단계 ${x.lv} 는 ${mw}어절 · ${mc}자 안쪽 (지금 ${words(ko)}어절 · ${chars(ko)}자) — ${ko}`);
    if (re) { re.lastIndex = 0; if (![...ko.matchAll(re)].some((m) => m[0])) bad.push(`${at(i)}: 「${p.name}」 꼴이 문장에 없다 — ${ko}`); }
    if (pairs.length && !pairs.some((r) => r.test(ko))) bad.push(`${at(i)}: 짝으로 쓰는 문법인데 짝이 다 들어 있지 않다(${pairs.map((r) => r.source.replace('.*', ' … ')).join(' · ')}) — ${ko}`);
  });
  if (arr.length < 9 || [1, 2, 3].some((l) => perLv[l] < 3)) bad.push(`${id} ${p.name}: 단계마다 3개 이상, 합쳐 9개 이상 (지금 ${perLv[1]}/${perLv[2]}/${perLv[3]})`);
  else have++;
}
if (STAT) {
  const noRe = PTS.filter((p) => !grammarMarkRe(p.name)).length;
  console.log(`문법 ${PTS.length}개 중 직접 쓴 단계별 문장을 갖춘 것 ${have}개 (꼴 검사를 못 하는 문법 ${noRe}개 — 이름에 정규식을 만들 수 없는 것)`);
  const paired = PTS.filter((p) => pairsOf(p.name).length).map((p) => `${p.id} ${p.name}`);
  console.log(`짝 문법 ${paired.length}개: ${paired.join(' | ')}`);
}
if (bad.length) { console.error(`문법 연습 문장에 문제가 있다 (${bad.length}곳):\n  - ${bad.slice(0, 60).join('\n  - ')}${bad.length > 60 ? `\n  … 외 ${bad.length - 60}곳` : ''}`); process.exit(1); }
console.log(`문법 연습 문장 검사 — 통과 (갖춘 문법 ${have}개 / ${PTS.length})`);
