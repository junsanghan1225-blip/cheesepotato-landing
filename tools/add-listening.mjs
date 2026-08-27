/* Gemini 가 준 듣기 문항을 자료 파일에 넣는다.
 *
 *   node tools/add-listening.mjs 받은것.json
 *   node tools/add-listening.mjs 받은것.json --dry     # 넣지 않고 보기만
 *
 * 손으로 붙여 넣는 것이 이 일에서 가장 위험한 자리다. 쉼표 하나가 빠지면
 * topik-listening.js 가 통째로 안 읽히고, 그러면 듣기만 죽는 게 아니라
 * app.module.js 가 그 파일을 들여오다 멈춰서 **판 전체가 안 뜬다.**
 * 그래서 사람이 파일을 안 건드려도 되게 했다.
 *
 * 넣기 전에 막는 것:
 *   · id 가 이미 있는 것
 *   · 한 번에 준 것 안에서 id 가 겹치는 것
 *   · exam / slot / answer / options 가 모양이 아닌 것
 *   · 대본이 비었거나 who 가 m·w·n 이 아닌 것
 * 넣은 뒤에는 반드시 `node tools/check-listening.mjs` 를 돌린다 —
 * 여기서는 「모양」만 보고, 「문항으로 말이 되는가」는 그쪽이 본다.
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

/* fileURLToPath 를 꼭 써야 한다 — new URL(...).pathname 은 윈도우에서
   「/C:/Users/…」처럼 드라이브 앞에 슬래시가 하나 더 붙는다. 그걸 그대로
   path.resolve 에 넣으면 현재 드라이브가 또 앞에 붙어 「C:\C:\Users\…」가
   되어 모든 경로가 깨진다. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'topik-listening.js');

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
const DRY = args.includes('--dry');

if (!src) {
  console.error('쓰는 법: node tools/add-listening.mjs 받은것.json [--dry]');
  process.exit(1);
}
if (!fs.existsSync(src)) { console.error(`파일이 없다: ${src}`); process.exit(1); }

/* Gemini 가 ```json 울타리를 붙여 보낼 때가 있다. 벗겨 준다 — 그걸 지우려고
   파일을 열었다가 다른 데를 건드리는 것이 더 위험하다. */
let raw = fs.readFileSync(src, 'utf8').trim();
raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
/* 배열 앞에 「확인했습니다: …」 같은 말을 붙여 보내기도 한다. 첫 [ 부터 마지막 ] 까지만 본다. */
const a = raw.indexOf('['), b = raw.lastIndexOf(']');
if (a < 0 || b < 0) { console.error('JSON 배열을 못 찾았다. [ 로 시작해 ] 로 끝나야 한다.'); process.exit(1); }

let items;
try { items = JSON.parse(raw.slice(a, b + 1)); }
catch (e) {
  console.error('JSON 이 깨졌다: ' + e.message);
  console.error('Gemini 에게 「설명 없이 JSON 배열만」이라고 다시 시켜라.');
  process.exit(1);
}
if (!Array.isArray(items) || !items.length) { console.error('배열이 비었다.'); process.exit(1); }

/* ── 모양 검사 ───────────────────────────────────────────── */
const WHO = ['m', 'w', 'n'];
const bad = [];
const seen = new Set();
const mod = await import(pathToFileURL(FILE).href + '?t=' + Date.now());
const already = new Set([...mod.TOPIKL_ITEMS, ...mod.TOPIKL2_ITEMS].map((q) => q.id));

items.forEach((q, i) => {
  const at = `${i + 1}번째(${q.id || 'id 없음'})`;
  if (!q.id) bad.push(`${at}: id 가 없다`);
  else if (already.has(q.id)) bad.push(`${at}: 이미 있는 id 다`);
  else if (seen.has(q.id)) bad.push(`${at}: 준 것 안에서 id 가 겹친다`);
  if (q.id) seen.add(q.id);

  if (q.exam !== 'I' && q.exam !== 'II') bad.push(`${at}: exam 이 「${q.exam}」이다. I 나 II 여야 한다`);
  if (!Number.isInteger(q.slot)) bad.push(`${at}: slot 이 숫자가 아니다`);
  if (!Number.isInteger(q.grade)) bad.push(`${at}: grade 가 숫자가 아니다`);
  if (!q.type) bad.push(`${at}: type 이 없다`);
  if (!String(q.q || '').trim()) bad.push(`${at}: 발문(q)이 없다`);
  if (!String(q.why || '').trim()) bad.push(`${at}: 해설(why)이 없다`);

  if (!Array.isArray(q.options) || q.options.length !== 4)
    bad.push(`${at}: 보기가 ${q.options?.length ?? 0}개다. 넷이어야 한다`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
    bad.push(`${at}: answer 가 ${q.answer} 다. 0~3 이어야 한다`);

  if (!Array.isArray(q.script) || !q.script.length) bad.push(`${at}: 대본(script)이 없다`);
  else q.script.forEach((l, j) => {
    if (!WHO.includes(l?.who)) bad.push(`${at}: 대본 ${j + 1}째 줄 who 가 「${l?.who}」다. m·w·n 만 쓴다`);
    if (!String(l?.text || '').trim()) bad.push(`${at}: 대본 ${j + 1}째 줄이 비었다`);
  });

  /* id 끝 두 자리와 slot 을 맞춰 둔 규칙이 있다. 어긋나면 나중에 어느 자리
     문항인지 id 만 보고 알 수 없게 된다. */
  const want = `l${q.exam}-${String(q.slot).padStart(2, '0')}`;
  if (q.id && q.exam && Number.isInteger(q.slot) && q.id !== want)
    bad.push(`${at}: id 가 slot 과 안 맞는다. ${want} 여야 한다`);
});

if (bad.length) {
  console.error(`넣지 않았다. 고쳐야 할 것 ${bad.length}개\n`);
  bad.forEach((x) => console.error('  ✗ ' + x));
  process.exit(1);
}

/* ── 파일에 넣을 글로 바꾼다 ─────────────────────────────── */
const s = (v) => "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const fmt = (q) => {
  const head = `  { id: ${s(q.id)}, exam: ${s(q.exam)}, slot: ${q.slot}, grade: ${q.grade}, type: ${s(q.type)}` +
               (q.pair ? `, pair: ${s(q.pair)}` : '');
  return head + ',\n' +
    '    script: [\n' +
    q.script.map((l) => `      { who: ${s(l.who)}, text: ${s(l.text)} },`).join('\n') + '\n' +
    '    ],\n' +
    `    q: ${s(q.q)},\n` +
    '    options: [\n' +
    q.options.map((o) => `      ${s(o)},`).join('\n') + '\n' +
    '    ],\n' +
    `    answer: ${q.answer},\n` +
    `    why: ${s(q.why)} },`;
};

const byExam = { I: [], II: [] };
items.forEach((q) => byExam[q.exam].push(q));
Object.values(byExam).forEach((list) => list.sort((x, y) => x.slot - y.slot));

let text = fs.readFileSync(FILE, 'utf8');
const ARR = { I: 'TOPIKL_ITEMS', II: 'TOPIKL2_ITEMS' };

for (const [exam, list] of Object.entries(byExam)) {
  if (!list.length) continue;
  const name = ARR[exam];
  const start = text.indexOf(`export const ${name} = [`);
  if (start < 0) { console.error(`${name} 을 못 찾았다`); process.exit(1); }
  /* 그 배열의 닫는 「\n];」 를 찾는다. 항목 안에도 ] 가 있으므로 줄 맨 앞의 것만 본다. */
  const end = text.indexOf('\n];', start);
  if (end < 0) { console.error(`${name} 의 끝을 못 찾았다`); process.exit(1); }
  const block = '\n' + list.map(fmt).join('\n\n') + '\n';
  text = text.slice(0, end) + block + text.slice(end);
  console.log(`${name} 에 ${list.length}문항 — ${list.map((q) => q.id).join(', ')}`);
}

if (DRY) {
  console.log('\n--dry 라 파일을 안 건드렸다.');
  process.exit(0);
}

fs.writeFileSync(FILE, text, 'utf8');
console.log('\ntopik-listening.js 에 넣었다.');
console.log('다음: node tools/check-listening.mjs');
