#!/usr/bin/env node
/* 문장 늘리기(expand) 목록 — 안티 그래비티가 틀린 조각(docs/expand-decoys.json)을 쓸 때 보는 판.
   node tools/expand-list.mjs [--todo] [코스 id 앞부분]   — --todo 는 아직 틀린 조각이 없는 단계만 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'docs/lesson-blocks');
const args = process.argv.slice(2), todo = args.includes('--todo'), pre = args.find((a) => !a.startsWith('--')) || '';
const D = fs.existsSync(path.join(ROOT, 'docs/expand-decoys.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/expand-decoys.json'), 'utf8')) : {};
let n = 0, steps = 0, done = 0;
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith('.json') && x.startsWith(pre)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
  for (const [lid, blocks] of Object.entries(d)) {
    const ex = (Array.isArray(blocks) ? blocks : []).find((b) => b?.t === 'expand'); if (!ex) continue;
    n++; const have = D[lid] || [];
    ex.steps.forEach((st, i) => { steps++; if (have[i]?.length) done++; });
    if (todo && ex.steps.every((_, i) => have[i]?.length)) continue;
    console.log(`${lid}  (${ex.steps.length}단계)`);
    console.log(`  시작: ${ex.base.tokens.join(' ')}  = ${ex.base.en}`);
    ex.steps.forEach((st, i) => console.log(`  ${i + 1}단계${have[i]?.length ? ' ✅' : '   '}: [${st.tokens.join(' | ')}]  = ${st.en}${have[i]?.length ? `   틀린 조각: ${have[i].join(' · ')}` : ''}`));
  }
}
console.error(`문장 늘리기 ${n}개 · 단계 ${steps}개 · 틀린 조각 붙은 단계 ${done}개`);
