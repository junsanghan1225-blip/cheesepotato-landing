// TOPIK I 읽기 모의고사 정답 쪽 글(docs/mock/explain.txt) 검사: 문항마다 근거 + 선지 네 개 이유가 있고, 근거는 지문 · 보기에 그대로 있는 말이어야 한다.
//   node tools/check-mock-explain.mjs          (빠진 문항은 알려 주기만)
//   node tools/check-mock-explain.mjs --strict (400문항이 다 있어야 통과)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPIK_READING } from '../topik.js';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const by = Object.fromEntries(TOPIK_READING.map((q) => [q.id, q]));
const bad = []; const seen = new Set();
const f = path.join(ROOT, 'docs/mock/explain.txt');
for (const [i, ln] of (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n') : []).entries()) {
  if (!ln.trim() || ln.startsWith('#')) continue;
  const [id, ev, ...rs] = ln.split('|').map((x) => x.trim());
  const q = by[id]; const at = `줄 ${i + 1} ${id}`;
  if (!q) { bad.push(`${at}: 없는 문항`); continue; }
  if (seen.has(id)) bad.push(`${at}: 두 번 나옴`); seen.add(id);
  if (rs.length !== 4 || rs.some((r) => !r)) bad.push(`${at}: 선지 이유가 네 개가 아니다(${rs.length})`);
  if (!ev) { bad.push(`${at}: 근거가 비었다`); continue; }
  const hay = norm([q.passage, q.sentence || '', ...q.options].join(' '));
  for (const part of ev.split(' / ').map((x) => norm(x.replace(/^…|…$/g, ''))).filter(Boolean)) if (!hay.includes(part)) bad.push(`${at}: 근거 「${part}」가 지문 · 보기에 그대로 없다`);
  if ([...rs.join('')].some((c) => c === '—')) bad.push(`${at}: 긴 줄표(—) 금지`);
}
const missing = TOPIK_READING.filter((q) => !seen.has(q.id)).length;
if (bad.length || (strict && missing)) { console.error(`모의고사 정답 글 검사 — 어긋남:\n  - ${bad.slice(0, 40).join('\n  - ')}${strict && missing ? `\n  - 빠진 문항 ${missing}개` : ''}`); process.exit(1); }
console.log(`모의고사 정답 글 검사 — 통과 (${seen.size}/${TOPIK_READING.length}문항${missing ? `, 빠진 ${missing}개` : ''})`);
