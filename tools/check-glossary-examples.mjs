/* 국어사전 예문(docs/glossary-examples.json) 전체를 훑는다.
 *
 *   node tools/check-glossary-examples.mjs
 *
 * add-glossary-examples.mjs 는 "이번에 받은 것"만 본다. 이 도구는 지금까지
 * 쌓인 **전체**를 다시 훑어, 여러 회차에 걸쳐서만 드러나는 것을 잡는다 —
 * 예를 들어 서로 다른 낱말인데 예문이 토씨 하나 안 다르게 똑같다면(Gemini
 * 가 같은 틀을 우려먹은 것) 한 회차 안에서는 안 보이고 전체를 모아야
 * 보인다.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { GLOSSARY } from '../glossary.js';
import { glossFind } from '../gloss-find.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let data = {};
try { data = JSON.parse(readFileSync(join(ROOT, 'docs/glossary-examples.json'), 'utf8')); }
catch (e) { console.log('docs/glossary-examples.json 이 아직 없다 — 예문이 하나도 없다.'); process.exit(0); }

const byHead = new Map();
Object.values(GLOSSARY).forEach((v) => { if (!byHead.has(v.head)) byHead.set(v.head, v); });
const inDict = (k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k);
/* add-glossary-examples.mjs 와 같은 자리 — 두 곳 다 고쳐야 한다. */
const HAEYO = /(아요|어요|여요|워요|꿔요|라요|러요|려요|겨요|쳐요|켜요|셔요|져요|펴요|커요|써요|떠요|꺼요|봐요|와요|돼요|놔요|에요|예요|해요|세요|께요|나요|가요|까요|지요|네요|군요|는데요|거든요)$/;

const bad = [];
const warn = [];

const heads = Object.keys(data);

/* ── 낱말마다 ── */
heads.forEach((head) => {
  const it = data[head];
  const ex = String(it?.ex || '').trim();
  const en = String(it?.en || '').trim();

  if (!byHead.has(head)) { bad.push(`${head}: 지금 사전(GLOSSARY)에 없는 표제어다 — 자료가 바뀌어 없어졌거나 오타`); return; }
  if (!ex) { bad.push(`${head}: 예문이 비었다`); return; }
  if (!en) { bad.push(`${head}: 번역이 비었다`); return; }

  const bare = ex.replace(/[?!.]+$/, '');
  if (!HAEYO.test(bare)) bad.push(`${head}: 해요체로 안 끝난다 — "${ex}"`);
  if (ex.length > 60) warn.push(`${head}: 예문이 길다(${ex.length}자) — "${ex}"`);

  /* gloss-find.js 의 스테머가 모든 불규칙활용을 다 잡지는 못하므로
     (알려진 한계) 막지는 않고 짚어만 준다. */
  const literal = ex.includes(head);
  const words = ex.replace(/[^가-힣\s]/g, ' ').split(/\s+/).filter(Boolean);
  const stemmed = words.some((w) => glossFind((k) => k === head, w) === head);
  if (!literal && !stemmed) warn.push(`${head}: 예문에 그 낱말이 안 보인다(불규칙활용일 수도 있다) — "${ex}"`);

  /* 대상 낱말보다 어려운 낱말이 섞였는가. 예문 속 다른 낱말이 GLOSSARY
     에도 없으면 학습자가 그 자리에서 또 막힌다 — 예문 하나를 보려다
     낱말 두 개를 새로 찾아야 하는 셈이다. 대상 낱말 자신은 빼고 본다. */
  const unknown = words.filter((w) => w !== head && w.length >= 2 && !glossFind(inDict, w));
  if (unknown.length) warn.push(`${head}: 예문 속에 사전에 없는 낱말 — ${[...new Set(unknown)].join(', ')} · "${ex}"`);
});

/* ── 전체를 모아서 ── */
const byEx = new Map();
heads.forEach((head) => {
  const ex = String(data[head]?.ex || '').replace(/\s+/g, '');
  if (!ex) return;
  if (!byEx.has(ex)) byEx.set(ex, []);
  byEx.get(ex).push(head);
});
byEx.forEach((list, ex) => {
  if (list.length > 1) bad.push(`예문이 서로 다른 낱말에 그대로 겹친다(${list.join(', ')}) — "${ex}"`);
});

const total = byHead.size;
const done = heads.filter((h) => byHead.has(h)).length;
console.log(`표제어 ${total}개 중 예문 ${done}개(${Math.round((done / total) * 100)}%)`);

if (warn.length) {
  console.log(`\n짚어 볼 것 ${warn.length}개`);
  warn.slice(0, 80).forEach((w) => console.log('  · ' + w));
  if (warn.length > 80) console.log(`  … 외 ${warn.length - 80}개 더`);
}
if (bad.length) {
  console.log(`\n고쳐야 할 것 ${bad.length}개`);
  bad.slice(0, 80).forEach((b) => console.log('  ✗ ' + b));
  if (bad.length > 80) console.log(`  … 외 ${bad.length - 80}개 더`);
  process.exit(1);
}
console.log('\n문제 없음');
