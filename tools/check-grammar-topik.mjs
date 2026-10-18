#!/usr/bin/env node
/* CI 검사 — docs/grammar-topik.json (문법별 TOPIK 스타일 문항, 운영자 2026-10-18 「문법마다 TOPIK 문장이 있고 없고 → 문법별 TOPIK 스타일 문항」)
   모양: { "<문법 id>": [ { stem, options[4], answer(0~3), sentence, en, why } … ] }
     stem      ( ) 가 하나 있는 한 문장 — TOPIK 「( )에 들어갈 가장 알맞은 것을 고르십시오」 꼴
     sentence  정답을 ( ) 에 넣은 완성 문장(문법 부분이 그대로 들어 있어야 한다)
   검사: 모양 · 보기 넷이 서로 다름 · stem 에 정답을 넣으면 sentence 와 같음(띄어쓰기는 안 따진다) · 그 문법 꼴이 sentence 에 있음(꼴을 못 찾는 문법은 사람이 본다) ·
         그 문법의 위 예문 · 대화 · 연습 문장과 같지 않음 · 문법 안에서 겹치지 않음 · 길이.
   node tools/check-grammar-topik.mjs  — 파일이 없으면 통과 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const { SB_CATS, SB_MORE } = await imp('sentences.js');
const { grammarMarkRe } = await imp('grammar-mark.js');
const PTS = SB_CATS.flatMap((c) => c.points);
const FILE = path.join(ROOT, 'docs/grammar-topik.json');
if (!fs.existsSync(FILE)) { console.log('문법별 TOPIK 문항 검사 — 파일 없음(통과)'); process.exit(0); }
const D = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const SENT = fs.existsSync(path.join(ROOT, 'docs/grammar-sentences.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/grammar-sentences.json'), 'utf8')) : {};
const squash = (x) => String(x || '').replace(/\s+/g, '');
const words = (k) => k.trim().split(/\s+/).length;
const bad = []; let n = 0; const all = new Map();
for (const [id, arr] of Object.entries(D)) {
  if (id.startsWith('_')) continue;
  const p = PTS.find((x) => x.id === id);
  if (!p) { bad.push(`${id}: 이런 문법 id 가 없다`); continue; }
  if (!Array.isArray(arr) || !arr.length) { bad.push(`${id}: 목록이어야 한다`); continue; }
  const re = grammarMarkRe(p.name), max = p.lv === 'beginner' ? 9 : 16;
  const own = new Set([p.ex, (SB_MORE[id] || [])[3], ...(Array.isArray(p.dlg) ? p.dlg : []).map((l) => String(l).replace(/^\s*[AB]\s*:\s*/, '')), ...(SENT[id] || []).map((x) => x.ko)].map(squash));
  const seen = new Set();
  arr.forEach((x, i) => {
    const at = `${id} ${p.name} [${i}]`; n++;
    if (typeof x?.stem !== 'string' || typeof x?.sentence !== 'string') return bad.push(`${at}: stem · sentence 가 있어야 한다`);
    if ((x.stem.match(/\(\s*\)/g) || []).length !== 1) bad.push(`${at}: stem 에 ( ) 가 하나만 있어야 한다 — ${x.stem}`);
    if (!Array.isArray(x.options) || x.options.length !== 4 || new Set(x.options.map(squash)).size !== 4) return bad.push(`${at}: 보기가 서로 다른 네 개여야 한다`);
    if (![0, 1, 2, 3].includes(x.answer)) return bad.push(`${at}: answer 는 0~3`);
    if (!x.en || !x.why) bad.push(`${at}: 영어 뜻(en) · 풀이(why)가 있어야 한다`);
    const filled = x.stem.replace(/\(\s*\)/, x.options[x.answer]);
    if (squash(filled) !== squash(x.sentence)) bad.push(`${at}: stem 에 정답을 넣은 것과 sentence 가 다르다 — ${filled} ≠ ${x.sentence}`);
    if (!/[.?!]$/.test(x.sentence.trim())) bad.push(`${at}: sentence 끝에 . ? ! 이 있어야 한다`);
    if (words(x.sentence) > max) bad.push(`${at}: ${max}어절 안쪽으로 (지금 ${words(x.sentence)}어절)`);
    if (re) { re.lastIndex = 0; if (![...x.sentence.matchAll(re)].some((m) => m[0])) bad.push(`${at}: 「${p.name}」 꼴이 sentence 에 없다 — ${x.sentence}`); }
    if (own.has(squash(x.sentence))) bad.push(`${at}: 이미 있는 예문 · 대화 · 연습 문장과 같다 — ${x.sentence}`);
    if (seen.has(squash(x.sentence))) bad.push(`${at}: 같은 문법 안에서 겹친다 — ${x.sentence}`); seen.add(squash(x.sentence));
    if (all.has(squash(x.sentence)) && all.get(squash(x.sentence)) !== id) bad.push(`${at}: 다른 문법(${all.get(squash(x.sentence))})에도 같은 문장이 있다`); else all.set(squash(x.sentence), id);
  });
}
if (bad.length) { console.error(`문법별 TOPIK 문항에 문제가 있다 (${bad.length}곳):\n  - ${bad.slice(0, 60).join('\n  - ')}`); process.exit(1); }
console.log(`문법별 TOPIK 문항 검사 — 통과 (문법 ${Object.keys(D).filter((k) => !k.startsWith('_')).length}개 · 문항 ${n}개)`);
