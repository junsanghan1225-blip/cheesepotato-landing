/* 난이도 자료 합치기 — docs/difficulty/<묶음>.json(안티 · Claude 검토, 문항 id → 1 쉬움 · 2 보통 · 3 어려움)을 한 파일 difficulty.js 로.
   화면(쓰기 · 유형별 목록)이 이걸 받아 줄에 ●○○ 로 보여 준다. 새 묶음이 들어오면 이 도구를 돌린다: node tools/build-difficulty.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'docs/difficulty');
const out = {};
let n = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const [id, v] of Object.entries(d)) { if (![1, 2, 3].includes(v)) throw new Error(`${f} ${id}: 1·2·3 이 아님`); out[id] = v; n++; }
}
fs.writeFileSync(path.join(ROOT, 'difficulty.js'), `/* 생성물 — node tools/build-difficulty.mjs (원본 docs/difficulty/*.json). 문항 id → 1 쉬움 · 2 보통 · 3 어려움 */\nexport const DIFFICULTY = ${JSON.stringify(out)};\n`);
console.log(`난이도 ${n}개 → difficulty.js`);
