// 사자성어 · 속담 · 관용 표현 굽기 — vocab/data/expressions.json(안티 · Claude 검토) → expressions.js
// 「단어」 화면의 「표현」 탭이 열 때만 받는다. 짧은 열쇠로 줄여 싣는다(화면이 쓰는 것만).
// node tools/build-expressions.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const X = JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/data/expressions.json'), 'utf8'));
const out = X.map((x) => ({
  id: x.id, ty: x.type, h: x.head, ...(x.hanja ? { hj: x.hanja, he: x.hanja_each } : {}),
  lit: x.literal, m: x.meaning, en: x.en, ...(x.en_equiv && x.en_equiv !== x.en ? { eq: x.en_equiv } : {}),
  lv: x.lv, tk: x.topik ? 1 : 0, tone: x.tone, ex: x.examples, ...(x.dialog?.length ? { dl: x.dialog } : {}),
  ...(x.rel?.syn?.length ? { syn: x.rel.syn } : {}), ...(x.rel?.ant?.length ? { ant: x.rel.ant } : {}),
  ...(x.words?.length ? { wd: x.words } : {}), ...(x.note ? { note: x.note } : {}),
}));
fs.writeFileSync(path.join(ROOT, 'expressions.js'), `/* 만든 것: tools/build-expressions.mjs ← vocab/data/expressions.json — 손으로 고치지 않는다 */\nexport const EXPR = ${JSON.stringify(out)};\n`);
const by = out.reduce((a, x) => ((a[x.ty] = (a[x.ty] || 0) + 1), a), {});
console.log(`표현 ${out.length}개 (${Object.entries(by).map(([k, n]) => `${k} ${n}`).join(' · ')}) → expressions.js`);
