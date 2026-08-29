#!/usr/bin/env node
/* 받아 온 회화 시나리오를 convo.js 의 CONVO 배열 끝에 붙인다.

   쓰기: node tools/convo-merge.mjs 받은것.json

   reading-merge.mjs 와 같은 방식 — CONVO 를 통째로 다시 찍지 않고
   대괄호 안(배열 끝)만 갈아 끼운다. 머리말이 날아가지 않는다.

   여기서 하는 일은 두 가지뿐이다.
   ① 모양 확인(JSON 인지, 배열인지, id 가 안 겹치는지, 홑따옴표/역슬래시가
      없는지) — 이게 깨지면 convo.js 자체가 안 열린다.
   ② **turn 마다 accept: [] 를 강제로 붙인다.** Gemini 가 뭘 넣어왔든
      버리고 빈 배열로 갈아 끼운다 — accept 는 사람이 직접 채우는
      자리이기 때문이다(convo.js 머리말 참고).

   급수·문체·턴 수 같은 치수 확인은 넣은 뒤 tools/check-convo.mjs 가 본다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'convo.js');
const SRC = process.argv[2];

if (!SRC) {
  console.error('쓰기: node tools/convo-merge.mjs 받은것.json');
  process.exit(1);
}

let txt = fs.readFileSync(SRC, 'utf8').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
let got;
try { got = JSON.parse(txt); } catch (e) { console.error('JSON 이 아니다:', e.message); process.exit(1); }
if (!Array.isArray(got)) { console.error('배열이어야 한다'); process.exit(1); }

const { CONVO } = await import(pathToFileURL(FILE).href);
const allIds = new Set(CONVO.map((c) => c.id));

const fresh = [], skipped = [];
for (const c of got) {
  if (!c?.id || allIds.has(c.id)) { skipped.push(`${c?.id ?? '(id 없음)'} — 이미 있다`); continue; }
  const flat = JSON.stringify(c);
  if (flat.includes("'") || flat.includes('\\\\')) { skipped.push(`${c.id} — 홑따옴표나 역슬래시가 들었다`); continue; }
  if (!Array.isArray(c.turns) || !c.turns.length) { skipped.push(`${c.id} — turns 가 비었다`); continue; }
  /* accept 는 Gemini 가 뭘 채워왔든 버리고 빈 자리로 만든다. */
  c.turns = c.turns.map((t) => ({ ...t, accept: [] }));
  allIds.add(c.id);
  fresh.push(c);
}

const q = (s) => `'${String(s)}'`;
const qOrNull = (v) => (v == null ? 'null' : q(v));
const line = (text) => (text == null ? 'null' : `{ text: ${q(text.text)}, en: ${q(text.en)} }`);
const oneTurn = (t) => [
  '      {',
  `        id: ${q(t.id)},`,
  `        npc: { text: ${q(t.npc.text)}, en: ${q(t.npc.en)} },`,
  `        userPrompt: ${q(t.userPrompt)},`,
  '        accept: [],',
  `        model: ${q(t.model)},`,
  `        tip: ${qOrNull(t.tip)},`,
  `        onMiss: ${line(t.onMiss)},`,
  '      },',
].join('\n');
const one = (c) => [
  '  {',
  `    id: ${q(c.id)},`,
  `    category: ${q(c.category)},`,
  `    title: ${q(c.title)},`,
  `    en: ${q(c.en)},`,
  `    lv: ${q(c.lv)},`,
  `    register: ${q(c.register)},`,
  `    roleUser: ${q(c.roleUser)},`,
  `    roleOther: ${q(c.roleOther)},`,
  `    setting: ${q(c.setting)},`,
  `    vocab: [${(c.vocab || []).map((w) => `[${q(w[0])}, ${q(w[1])}]`).join(', ')}],`,
  `    grammarRefs: [${(c.grammarRefs || []).map(q).join(', ')}],`,
  '    turns: [',
  ...c.turns.map(oneTurn),
  '    ],',
  `    outro: ${line(c.outro)},`,
  '  },',
].join('\n');

/* CONVO 배열의 열고 닫는 대괄호를 찾는다 — reading-merge.mjs 와 같은
   방식(따옴표 안의 대괄호 무늬는 세지 않는다). CONVO 는 단일 배열이라
   깊이 하나만 추적하면 된다. */
const src = fs.readFileSync(FILE, 'utf8');
const openTag = 'export const CONVO = [';
const openAt = src.indexOf(openTag);
if (openAt < 0) { console.error('convo.js 에서 CONVO 를 못 찾았다'); process.exit(1); }
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
if (depth !== 0) { console.error('CONVO 의 대괄호가 안 닫힌다'); process.exit(1); }
const bodyTo = at - 1;

const kept = src.slice(bodyFrom, bodyTo).replace(/\s+$/, '');
const added = fresh.map(one).join('\n');
fs.writeFileSync(FILE,
  src.slice(0, bodyFrom) + (kept ? kept + '\n' : '\n') + added + '\n' + src.slice(bodyTo));

console.log(`CONVO: ${CONVO.length}개 → ${CONVO.length + fresh.length}개 (새로 ${fresh.length}개)`);
if (skipped.length) { console.log(`건너뛴 것 ${skipped.length}개:`); skipped.forEach((s) => console.log('  ' + s)); }
console.log('\n이제 node tools/check-convo.mjs 로 모양을 본다. accept 는 아직 비어 있으니 직접 채운 다음 다시 돌려서 확인할 것.');
