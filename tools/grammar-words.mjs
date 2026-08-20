/* 영어 설명이 아직 없는 문법을 뽑아 Gemini 에 붙일 꼴로 낸다.
 *
 *   node tools/grammar-words.mjs 40 > /tmp/batch.txt
 *
 * 받는 쪽 지시문은 docs/grammar-gemini-prompt.md 에 있다.
 *
 * ── 왜 나눠 보내나 ──────────────────────────────────────────
 * 290개를 한 번에 보내면 한국어만 23,000자다. 뒤로 갈수록 성의가 빠져서
 * 「Used to say something.」 같은 줄이 늘어난다. 마흔 개씩 끊어 보내면
 * 마지막 줄까지 앞줄과 같은 품이 들어간다.
 *
 * 이미 채운 것은 빠진다. 그래서 같은 명령을 여덟 번 돌리면 여덟 묶음이
 * 겹치지 않고 나온다 — 어디까지 했는지 따로 적어 둘 것이 없다.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SB_CATS, SB_MORE } from '../sentences.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const want = Math.max(1, Number(process.argv[2]) || 40);

let done = new Set();
try {
  const en = JSON.parse(readFileSync(join(ROOT, 'docs/grammar-en.json'), 'utf8'));
  done = new Set(en.map((e) => e.id));
} catch (e) { /* 아직 없으면 처음부터 */ }

const rows = [];
for (const c of SB_CATS) {
  for (const p of c.points || []) {
    if (done.has(p.id)) continue;
    rows.push([p, c]);
  }
}

const take = rows.slice(0, want);
for (const [p, c] of take) {
  const more = SB_MORE[p.id] || [];
  console.log(`## ${p.id}  |  ${p.name}  |  ${p.lv}  |  ${c.ko}`);
  console.log(`desc: ${p.desc}`);
  if (more[0]) console.log(`form: ${more[0]}`);
  if (more[2]) console.log(`care: ${more[2]}`);
  console.log(`ex:   ${p.ex}`);
  console.log('');
}

console.error(`${take.length}개를 냈다. 아직 남은 것 ${rows.length - take.length}개 · 이미 채운 것 ${done.size}개.`);
