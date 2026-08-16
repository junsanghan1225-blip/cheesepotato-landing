#!/usr/bin/env node
/* 받아 온 발음 지문을 app.js 의 PT_SETS 안에 끼워 넣는다.

   쓰기: node tools/pron-merge.mjs easy 받은것.json

   PT_SETS 를 통째로 다시 찍지 않고 해당 단계의 대괄호 안만 갈아 끼운다.
   위아래 주석에 왜 이 치수인지가 적혀 있는데, 다시 찍으면 그게 날아간다.

   넣기 전에 막는 것만 여기서 본다(형태·중복). 치수와 발음 규칙은
   넣은 뒤에 tools/check-pron.mjs 가 본다 — 그래야 무엇이 어떻게
   어긋났는지 한자리에서 보인다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'app.js');
const [LV, FILE] = process.argv.slice(2);

if (!['easy', 'normal', 'hard'].includes(LV) || !FILE) {
  console.error('쓰기: node tools/pron-merge.mjs easy|normal|hard 받은것.json');
  process.exit(1);
}

/* 받은 것 읽기 — 코드펜스가 붙어 와도 벗겨 준다 */
let txt = fs.readFileSync(FILE, 'utf8').trim();
txt = txt.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
let got;
try { got = JSON.parse(txt); } catch (e) { console.error('JSON 이 아니다:', e.message); process.exit(1); }
if (!Array.isArray(got) || got.some((s) => typeof s !== 'string')) {
  console.error('문자열만 든 배열이어야 한다'); process.exit(1);
}

const src = fs.readFileSync(APP, 'utf8');
const head = src.indexOf('const PT_SETS');
const tail = src.indexOf('const PT_LV_NAME');
if (head < 0 || tail < 0) { console.error('app.js 에서 PT_SETS 를 못 찾았다'); process.exit(1); }

/* 그 단계의 대괄호 안만 집어낸다 */
const seg = src.slice(head, tail);
const m = seg.match(new RegExp(`(\\n  ${LV}:\\s*\\[\\n)([\\s\\S]*?)(\\n  \\],)`));
if (!m) { console.error(`PT_SETS 안에서 ${LV} 를 못 찾았다`); process.exit(1); }
const had = [...m[2].matchAll(/'([^']*)'/g)].map((x) => x[1]);

/* 홑따옴표로 감싸므로 안에 홑따옴표가 있으면 코드가 깨진다.
   문장부호는 어차피 채점에서 지워지니 그냥 막는다. */
const quoted = got.filter((s) => s.includes("'") || s.includes('\\'));
if (quoted.length) {
  console.error(`홑따옴표나 역슬래시가 든 지문 ${quoted.length}개 — 빼고 다시 받아라:`);
  quoted.slice(0, 5).forEach((s) => console.error('  ' + s));
  process.exit(1);
}

/* 이미 있는 것과, 받은 것끼리의 중복 */
const clean = (s) => s.normalize('NFC').replace(/[\s.,!?~·"'…]/g, '');
const seen = new Map(had.map((s) => [clean(s), s]));
const fresh = [], dup = [];
for (const s of got) {
  const k = clean(s);
  if (seen.has(k)) { dup.push(s); continue; }
  seen.set(k, s);
  fresh.push(s.trim());
}

const all = [...had, ...fresh];
const body = all.map((s) => `    '${s}',`).join('\n');
fs.writeFileSync(APP, src.slice(0, head) + seg.replace(m[0], m[1] + body + m[3]) + src.slice(tail));

console.log(`${LV}: ${had.length}개 → ${all.length}개 (새로 ${fresh.length}개)`);
if (dup.length) {
  console.log(`겹쳐서 버린 것 ${dup.length}개:`);
  dup.slice(0, 8).forEach((s) => console.log('  ' + s));
}
console.log('\n이제 node tools/check-pron.mjs 로 치수를 본다.');
