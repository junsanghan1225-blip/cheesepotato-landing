#!/usr/bin/env node
/* 받아 온 읽기 지문을 reading.js 의 해당 칸에 끼워 넣는다.

   쓰기: node tools/reading-merge.mjs short beginner 받은것.json

   READING 을 통째로 다시 찍지 않고 그 칸의 대괄호 안만 갈아 끼운다.
   위에 왜 이 치수인지가 길게 적혀 있는데 다시 찍으면 그게 날아간다.

   넣기 전에는 막을 것만 본다(모양·중복·따옴표). 치수와 채점 가능 여부는
   넣은 뒤 tools/check-reading.mjs 가 한자리에서 본다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'reading.js');
const [LEN, LV, SRC] = process.argv.slice(2);

if (!['short', 'long'].includes(LEN) || !['beginner', 'intermediate', 'advanced'].includes(LV) || !SRC) {
  console.error('쓰기: node tools/reading-merge.mjs short|long beginner|intermediate|advanced 받은것.json');
  process.exit(1);
}

let txt = fs.readFileSync(SRC, 'utf8').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
let got;
try { got = JSON.parse(txt); } catch (e) { console.error('JSON 이 아니다:', e.message); process.exit(1); }
if (!Array.isArray(got)) { console.error('배열이어야 한다'); process.exit(1); }

const { READING } = await import(pathToFileURL(FILE).href);
const had = READING[LEN][LV];
const allIds = new Set();
for (const g of Object.values(READING)) for (const a of Object.values(g)) for (const r of a) allIds.add(r.id);

const fresh = [], skipped = [];
for (const r of got) {
  if (!r?.id || allIds.has(r.id)) { skipped.push(`${r?.id ?? '(id 없음)'} — 이미 있다`); continue; }
  /* 홑따옴표로 감싸 넣으므로 안에 있으면 코드가 깨진다. 겹따옴표는
     지시문에서 금지했지만 그래도 확인한다. */
  const flat = JSON.stringify(r);
  if (flat.includes("'") || flat.includes('\\\\')) { skipped.push(`${r.id} — 홑따옴표나 역슬래시가 들었다`); continue; }
  allIds.add(r.id);
  fresh.push(r);
}

/* reading.js 의 그 칸만 찾아 다시 적는다.

   정규식으로 닫는 대괄호를 찾으려 했더니 keys 의 「], 」를 먼저 물었다 —
   들여쓰기가 다르니 괜찮을 줄 알았는데, 정규식은 줄 첫머리에 매이지
   않아서 여덟 칸 들여쓰기 안에서도 네 칸짜리 무늬를 찾아낸다.
   대괄호를 세는 수밖에 없다. 이건 틀릴 데가 없다. */
const src = fs.readFileSync(FILE, 'utf8');
const lenAt = src.indexOf(`\n  ${LEN}: {`);
if (lenAt < 0) { console.error(`reading.js 에서 ${LEN} 을 못 찾았다`); process.exit(1); }
const openTag = `\n    ${LV}: [`;
const openAt = src.indexOf(openTag, lenAt);
if (openAt < 0) { console.error(`reading.js 에서 ${LEN}.${LV} 를 못 찾았다`); process.exit(1); }
const bodyFrom = openAt + openTag.length;
let depth = 1, at = bodyFrom, inStr = false;
while (at < src.length && depth > 0) {
  const c = src[at];
  if (inStr) { if (c === '\\') at++; else if (c === "'") inStr = false; }
  else if (c === "'") inStr = true;
  else if (c === '[') depth++;
  else if (c === ']') depth--;
  at++;
}
if (depth !== 0) { console.error(`${LEN}.${LV} 의 대괄호가 안 닫힌다`); process.exit(1); }
const bodyTo = at - 1;                       // 닫는 ] 자리
const m = [null, src.slice(openAt, bodyFrom), src.slice(bodyFrom, bodyTo), src.slice(bodyTo)];

const q = (s) => `'${String(s)}'`;
const one = (r) => [
  '      {',
  `        id: ${q(r.id)},`,
  `        title: ${q(r.title)},`,
  `        passage: ${q(r.passage)},`,
  `        en: ${q(r.en)},`,
  `        question: ${q(r.question)},`,
  `        model: ${q(r.model)},`,
  '        keys: [',
  ...r.keys.map((k) => `          { k: [${k.k.map(q).join(', ')}], why: ${q(k.why)} },`),
  '        ],',
  `        words: [${r.words.map((w) => `[${q(w[0])}, ${q(w[1])}]`).join(', ')}],`,
  '      },',
].join('\n');

const kept = m[2].replace(/\s+$/, '');
const added = fresh.map(one).join('\n');
fs.writeFileSync(FILE,
  src.slice(0, openAt) + m[1] + (kept ? kept + '\n' : '\n') + added + '\n    ' + src.slice(bodyTo));

console.log(`${LEN}.${LV}: ${had.length}편 → ${had.length + fresh.length}편 (새로 ${fresh.length}편)`);
if (skipped.length) { console.log(`건너뛴 것 ${skipped.length}개:`); skipped.forEach((s) => console.log('  ' + s)); }
console.log('\n이제 node tools/check-reading.mjs 로 치수와 채점 모양을 본다.');
