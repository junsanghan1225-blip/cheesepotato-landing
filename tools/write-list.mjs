#!/usr/bin/env node
/* 쓰기 칸(write) 지시문 목록 — 안티 그래비티가 정답 활용형을 뺀 새 지시문(docs/write-prompts.json)을 쓸 때 보는 판.
   node tools/write-list.mjs [--todo] [코스 id 앞부분]   — --todo 는 아직 새 지시문이 없는 레슨만
   레슨마다: 지금 지시문(q) · 꼭 들어갈 조각(must) · 예시 답(sample) · 이 레슨 낱말(기본형 참고) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'docs/lesson-blocks');
const args = process.argv.slice(2), todo = args.includes('--todo'), pre = args.find((a) => !a.startsWith('--')) || '';
const D = fs.existsSync(path.join(ROOT, 'docs/write-prompts.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/write-prompts.json'), 'utf8')) : {};
let n = 0, done = 0;
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith('.json') && x.startsWith(pre)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
  for (const [lid, blocks] of Object.entries(d)) {
    const w = (Array.isArray(blocks) ? blocks : []).find((b) => b?.t === 'write'); if (!w) continue;
    n++; if (D[lid]) done++;
    if (todo && D[lid]) continue;
    const v = (blocks.find((b) => b.t === 'vocab')?.items || []).map((i) => i.ko).join(' · ');
    console.log(`${lid}${D[lid] ? ' ✅' : ''}\n  지금: ${w.q}\n  must: ${(w.must || []).join(' | ')}   sample: ${w.sample}${v ? `\n  낱말: ${v}` : ''}${D[lid] ? `\n  새 지시문: ${D[lid]}` : ''}`);
  }
}
console.error(`쓰기 칸 ${n}개 · 새 지시문이 붙은 칸 ${done}개`);
