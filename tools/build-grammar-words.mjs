#!/usr/bin/env node
/* 문법 「같이 알면 좋은 단어」 — 생성물 grammar-words.js 를 만든다(손으로 고치지 말 것).

     node tools/build-grammar-words.mjs

   원본은 docs/grammar-words.json(안티 그래비티가 채우고 Claude 가 검토 — docs/antigravity-grammar-words-task.md).
   낱말에 사전 쪽(dictionary/<낱말>.html)이 있으면 주소를 붙인다 — 「시간이 있다」처럼 덩어리면 붙이지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/grammar-words.json'), 'utf8'));
const pages = new Set(fs.readdirSync(path.join(ROOT, 'dictionary')).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5)));
const OUT = {};
let n = 0;
for (const [id, v] of Object.entries(src)) {
  const words = (v.words || []).filter((x) => Array.isArray(x) && x.length >= 3 && x[0] && x[1]);
  if (!words.length) continue;
  OUT[id] = words.map(([w, ex, en]) => [w, ex, en || '', pages.has(w) ? `/dictionary/${encodeURIComponent(w)}.html` : '']);
  n += words.length;
}
fs.writeFileSync(path.join(ROOT, 'grammar-words.js'), `/* 문법 「같이 알면 좋은 단어」 — 생성물. 손으로 고치지 말 것.
 *   고칠 때: docs/grammar-words.json 을 고치고 node tools/build-grammar-words.mjs 를 다시 돌린다.
 *   ${Object.keys(OUT).length}개 표현 · 낱말 ${n}개. 칸은 [낱말, 그 문법을 쓴 예, 영어, 사전 쪽 주소(있을 때)].
 */
export const GRAMMAR_WORDS = ${JSON.stringify(OUT)};
`);
console.log(`grammar-words.js — ${Object.keys(OUT).length}개 표현 · 낱말 ${n}개`);
