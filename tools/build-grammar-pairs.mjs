#!/usr/bin/env node
/* 「헷갈리는 문법 비교」 — 생성물 grammar-pairs.js 를 만든다(손으로 고치지 말 것). 운영자 요청 2026-10-06.

     node tools/build-grammar-pairs.mjs           만들기
     node tools/build-grammar-pairs.mjs --check   검사만(CI · check-grammar-pairs.mjs 가 부른다)

   원본 docs/grammar-pairs.json(안티 그래비티 초안 · Claude 검토) — 짝마다
     { id, a, b(문법 id), title{ko,en}, gist{ko,en}, diff[{ko,en}], ex{a,b}, quiz[{q(___ 하나), ok(빈칸에 들어갈 말), ans(a|b), why}] }
   퀴즈는 「둘 중 하나만 맞는」 문장이어야 한다 — 둘 다 되는 문장은 넣지 않는다(검토할 때 본다). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const pts = (await Promise.all(['sentences-beginner.js', 'sentences-intermediate.js', 'sentences.js']
  .map(async (f) => (await import(path.join(ROOT, f))).SB_CATS || []))).flat().flatMap((c) => c.points);
const ids = new Set(pts.map((p) => p.id));
const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/grammar-pairs.json'), 'utf8'));

const bad = [], seen = new Set();
const s = (x) => typeof x === 'string' && x.trim().length > 0;
for (const [i, p] of src.entries()) {
  const at = `#${i + 1} ${p?.id || '?'}`;
  if (!s(p?.id) || seen.has(p.id)) bad.push(`${at}: id 가 없거나 겹침`); seen.add(p?.id);
  if (!ids.has(p?.a) || !ids.has(p?.b) || p.a === p.b) bad.push(`${at}: a · b 가 없는 문법 id(${p?.a}, ${p?.b})`);
  if (!s(p?.title?.ko) || !s(p?.gist?.ko) || !s(p?.gist?.en)) bad.push(`${at}: title · gist(ko · en) 빠짐`);
  if (!Array.isArray(p?.diff) || p.diff.length < 1 || p.diff.some((d) => !s(d?.ko) || !s(d?.en))) bad.push(`${at}: diff 는 ko · en 이 있는 줄 1개 이상`);
  if (!s(p?.ex?.a) || !s(p?.ex?.b)) bad.push(`${at}: ex.a · ex.b 예문 빠짐`);
  if (!Array.isArray(p?.quiz) || p.quiz.length < 4 || p.quiz.length > 8) bad.push(`${at}: quiz 는 4~8문제`);
  for (const [j, q] of (p?.quiz || []).entries()) {
    if (!s(q?.q) || (q.q.match(/___/g) || []).length !== 1) bad.push(`${at} 퀴즈 ${j + 1}: 빈칸 ___ 이 꼭 하나`);
    if (!['a', 'b'].includes(q?.ans)) bad.push(`${at} 퀴즈 ${j + 1}: ans 는 a 또는 b`);
    if (!s(q?.ok) || !s(q?.why)) bad.push(`${at} 퀴즈 ${j + 1}: ok(빈칸 말) · why 빠짐`);
  }
}
const nq = src.reduce((n, p) => n + (p.quiz?.length || 0), 0);
if (bad.length) { console.error(`grammar-pairs: ${bad.length}곳 고칠 것\n  ` + bad.join('\n  ')); process.exit(1); }
if (CHECK) { console.log(`grammar-pairs: 이상 없음 — 짝 ${src.length}개 · 퀴즈 ${nq}문제`); process.exit(0); }
fs.writeFileSync(path.join(ROOT, 'grammar-pairs.js'), `/* 헷갈리는 문법 비교 — 생성물. 손으로 고치지 말 것.
 *   고칠 때: docs/grammar-pairs.json 을 고치고 node tools/build-grammar-pairs.mjs
 *   짝 ${src.length}개 · 퀴즈 ${nq}문제
 */
export const GRAMMAR_PAIRS = ${JSON.stringify(src)};
`);
console.log(`grammar-pairs.js — 짝 ${src.length}개 · 퀴즈 ${nq}문제`);
