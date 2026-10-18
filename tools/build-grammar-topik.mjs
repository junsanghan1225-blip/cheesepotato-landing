#!/usr/bin/env node
/* 문법 「TOPIK 스타일 예문」 — docs/grammar-topik.json(안티 · Claude 검토, 검사 check-grammar-topik) → grammar-topik.js (생성물, 손으로 고치지 말 것).
   운영자 2026-10-18 「문제를 풀게 하지 말고 태그만 — TOPIK 에서는 이렇게 쓴다」: 문법 화면에서 이 문법이 TOPIK 스타일 문장에서 어떻게 쓰이는지
   **완성된 문장**(sentence + en)만 보여 준다. 문제(stem · 보기)는 앱에 안 싣는다(파일이 작아지고, 문제 풀이 화면을 따로 만들지 않는다).
   모양: { "<문법 id>": [[한국어 문장, 영어], …] } — 모두 직접 만든 예문이다(실제 TOPIK 기출 아님).
   node tools/build-grammar-topik.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'docs/grammar-topik.json');
const D = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
const out = {}; let n = 0;
for (const [id, arr] of Object.entries(D)) {
  if (id.startsWith('_') || !Array.isArray(arr)) continue;
  out[id] = arr.map((x) => [String(x.sentence).trim(), String(x.en || '').trim()]);
  n += out[id].length;
}
const js = `/* 문법 「TOPIK 스타일 예문」 — 생성물. 손으로 고치지 말 것.
 *   원본 docs/grammar-topik.json → node tools/build-grammar-topik.mjs. 문법 ${Object.keys(out).length}개 · 예문 ${n}개(직접 만든 예문, 실제 TOPIK 기출 아님). */
export const GRAMMAR_TOPIK = ${JSON.stringify(out)};
`;
fs.writeFileSync(path.join(ROOT, 'grammar-topik.js'), js);
console.log(`문법 TOPIK 스타일 예문 — 문법 ${Object.keys(out).length}개 · 예문 ${n}개 → grammar-topik.js`);
