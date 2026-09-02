/* Gemini 가 지은 국어사전 예문을 docs/glossary-examples.json 에 넣는다.
 *
 *   node tools/add-glossary-examples.mjs 받은것.json
 *   node tools/add-glossary-examples.mjs 받은것.json --dry   넣지 않고 보기만
 *
 * add-listening.mjs 와 같은 자리다 — 여기서는 "모양"만 본다(개수·표제어
 * 일치·해요체 종결·낱말 포함 여부). "쌓인 전체가 고르게 좋은가"는
 * check-glossary-examples.mjs 몫이다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { GLOSSARY } from '../glossary.js';
import { glossFind } from '../gloss-find.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs/glossary-examples.json');

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
const DRY = args.includes('--dry');

if (!src) {
  console.error('쓰는 법: node tools/add-glossary-examples.mjs 받은것.json [--dry]');
  process.exit(1);
}
if (!existsSync(src)) { console.error(`파일이 없다: ${src}`); process.exit(1); }

/* Gemini 가 ```json 울타리나 「확인했습니다: …」 같은 말을 앞에 붙여
   보낼 때가 있다. 벗겨 준다 — 그걸 지우려고 파일을 열었다가 다른 데를
   건드리는 것이 더 위험하다. */
let raw = readFileSync(src, 'utf8').trim();
raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
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

const byHead = new Map();
Object.values(GLOSSARY).forEach((v) => { if (!byHead.has(v.head)) byHead.set(v.head, v); });
const inDict = (k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k);

/* 해요체 종결. build-writing 쪽(TW_HAEYO)에 ㅂ·르 불규칙 꼴(워요·라요·
   러요 — 가까워요·몰라요·불러요)을 더했고, 여기서는 이→여 축약(려요·
   겨요·쳐요·켜요·셔요·져요·펴요 — 가려요·즐겨요·가르쳐요·가리켜요·
   가셔요·켜져요), ㅜ 축약(꿔요 — 가꿔요), ㅡ 탈락(커요·써요·떠요·꺼요),
   ㅗ/ㅚ 축약(봐요·와요·돼요·놔요 — 봐요·와요·돼요·놔요) 꼴을 더 더했다.
   전부 사전 예문을 짓다가 실제로 걸린 것들이다. 문장 끝의 물음표·
   느낌표·마침표는 먼저 뗀다. */
const HAEYO = /(아요|어요|여요|워요|꿔요|라요|러요|려요|겨요|쳐요|켜요|셔요|져요|펴요|커요|써요|떠요|꺼요|봐요|와요|돼요|놔요|에요|예요|해요|세요|께요|나요|가요|까요|지요|네요|군요|는데요|거든요)$/;

let out = {};
try { out = JSON.parse(readFileSync(OUT, 'utf8')); } catch (e) { /* 처음이면 빈 것으로 시작 */ }

const bad = [];
const warn = [];
const seen = new Set();
const next = { ...out };

items.forEach((it, i) => {
  const at = `${i + 1}번째(${it?.head || '표제어 없음'})`;
  const head = String(it?.head || '').trim();
  const ex = String(it?.ex || '').trim();
  const en = String(it?.en || '').trim();

  if (!head) { bad.push(`${at}: head 가 없다`); return; }
  if (seen.has(head)) { bad.push(`${at}: 받은 것 안에서 표제어가 겹친다`); return; }
  seen.add(head);

  if (!byHead.has(head)) { bad.push(`${at}: "${head}" 는 사전 표제어가 아니다(오타?)`); return; }
  if (!ex) { bad.push(`${at}: ex(예문)가 없다`); return; }
  if (!en) { bad.push(`${at}: en(번역)이 없다`); return; }
  if (ex.length > 60) bad.push(`${at}: 예문이 60자를 넘는다(${ex.length}자) — 한 문장치고 길다`);

  const bare = ex.replace(/[?!.]+$/, '');
  if (!HAEYO.test(bare)) bad.push(`${at}: 해요체로 안 끝난다 — "${ex}"`);

  /* 예문에 그 낱말이 실제로 들어 있는가. 글자 그대로 있거나(활용 안
     한 경우), 예문의 어느 낱말을 표제어로 풀었을 때 이 표제어와
     같아야 한다. gloss-find.js 의 스테머가 모든 불규칙(으-탈락 등)을
     다 잡지는 못하므로(알려진 한계) 여기서는 막지 않고 짚어만 준다 —
     40개를 사람이 눈으로 훑을 때 훨씬 잘 보인다. */
  const literal = ex.includes(head);
  const words = ex.replace(/[^가-힣\s]/g, ' ').split(/\s+/).filter(Boolean);
  const stemmed = words.some((w) => glossFind((k) => k === head, w) === head);
  if (!literal && !stemmed) warn.push(`${at}: 예문에 "${head}"(또는 그 활용형)가 안 보인다(스테머가 못 잡는 불규칙활용일 수도 있다) — "${ex}"`);

  next[head] = { ex, en };
});

if (bad.length) {
  console.error(`넣지 않았다. 고쳐야 할 것 ${bad.length}개\n`);
  bad.forEach((x) => console.error('  ✗ ' + x));
  process.exit(1);
}
if (warn.length) {
  console.log(`짚어 볼 것 ${warn.length}개 (넣기는 한다 — 사람이 눈으로 한 번 봐라)`);
  warn.forEach((x) => console.log('  · ' + x));
  console.log('');
}

const added = Object.keys(next).length - Object.keys(out).length;
const updated = items.length - Math.max(0, added);
console.log(`새로 ${Math.max(0, added)}개 · 이미 있던 것 고침 ${Math.max(0, updated)}개`);

if (DRY) { console.log('\n--dry 라 파일을 안 건드렸다.'); process.exit(0); }

/* 표제어 가나다순으로 정렬해서 쓴다 — diff 가 흩어지지 않게. */
const sortedKeys = Object.keys(next).sort((x, y) => x.localeCompare(y, 'ko'));
const sorted = {};
sortedKeys.forEach((k) => { sorted[k] = next[k]; });
writeFileSync(OUT, JSON.stringify(sorted, null, 1) + '\n', 'utf8');
console.log(`docs/glossary-examples.json — 예문 ${sortedKeys.length}개`);
console.log('다음: node tools/check-glossary-examples.mjs');
