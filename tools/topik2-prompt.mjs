/* 묶음 하나에 바로 보낼 수 있는 지시문을 뽑는다.
 *
 *   node tools/topik2-prompt.mjs 13 24 > batch2.md
 *
 * docs/topik2-gemini-prompt.md 가 원본이다. 「낼 문항」 표에서 이번 묶음 줄만
 * 남기고, 앞뒤 규칙은 그대로 둔다.
 *
 * 손으로 자르면 반드시 빠뜨린다 — 1차에서 정답 쏠림을 놓친 것도 지시문을
 * 손으로 다루다 규칙이 약해졌기 때문이다. 자르는 일은 기계에 맡긴다.
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
/* 회차. 자리(slot)는 1~50 그대로 두고 id 만 회차마다 밀어서 매긴다 —
   2회차의 1번은 t2-051 이다. 화면은 같은 자리에 여러 벌이 있는 것을
   이미 받아들이고(makeRound 가 자리마다 하나씩 뽑는다), 자리를 그대로
   두어야 설계표 한 장으로 몇 회든 만들 수 있다. */
const rIdx = args.indexOf('--round');
const round = rIdx >= 0 ? Number(args[rIdx + 1]) : 1;
const [from, to] = args.filter((a) => !a.startsWith('--') && a !== String(round)).map(Number);
if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 50 || from > to
    || !Number.isInteger(round) || round < 1) {
  console.error('쓰기: node tools/topik2-prompt.mjs <시작문항> <끝문항> [--round N]   (예: 13 24 --round 2)');
  process.exit(2);
}
const idOf = (slot) => `t2-${String((round - 1) * 50 + slot).padStart(3, '0')}`;

/* 이미 만든 회차의 소재. 같은 자리에 같은 이야기가 또 나오면 두 번째 회차가
   시험이 아니라 복습이 된다. 자리마다 무엇을 이미 썼는지 알려 주고 피하게
   한다 — 안 알려 주면 「도서관에서 책을 빌렸다」가 회차마다 나온다. */
let usedBySlot = new Map();
try {
  const had = JSON.parse(readFileSync(new URL('../docs/topik2-all50.json', import.meta.url), 'utf8'));
  had.forEach((q) => {
    if (!usedBySlot.has(q.slot)) usedBySlot.set(q.slot, []);
    if (q.topic) usedBySlot.get(q.slot).push(q.topic);
  });
} catch (e) { /* 1회차가 아직 없으면 피할 것도 없다 */ }

const src = readFileSync(new URL('../docs/topik2-gemini-prompt.md', import.meta.url), 'utf8');
const lines = src.split('\n');

/* 「낼 문항」 표의 자리를 찾는다. 그 위는 규칙, 아래는 내보낼 모양이다. */
const head = lines.findIndex((l) => l.startsWith('| 문항 | type |'));
if (head < 0) { console.error('「낼 문항」 표를 못 찾았다.'); process.exit(2); }
let tail = head + 2;
while (tail < lines.length && lines[tail].startsWith('|')) tail++;

/* 「1~2」, 「19」 같은 첫 칸을 읽어 이번 묶음과 겹치는 줄만 남긴다. */
const rowsIn = lines.slice(head + 2, tail).filter((l) => {
  const cell = l.split('|')[1]?.trim() ?? '';
  const m = cell.match(/^(\d+)(?:~(\d+))?$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  if (a < from || b > to) return false;   // 묶음을 걸치는 줄은 자르지 않고 뺀다
  return true;
});
if (!rowsIn.length) { console.error(`${from}~${to} 에 해당하는 줄이 없다.`); process.exit(2); }

/* 앞머리에서 「돌리는 순서」 안내는 뺀다 — 보내는 사람이 이미 정한 일이다. */
const rulesStart = lines.findIndex((l) => l.trim() === '---');
const rules = lines.slice(rulesStart + 1, head).join('\n')
  .replace(/<<[^>]*>>\s*/s, '');

const out = [
  ...rules.trimEnd().split('\n'),
  '',
  lines[head],
  lines[head + 1],
  ...rowsIn,
  '',
  ...lines.slice(tail).filter((l) => !l.startsWith('내보내기 전에 스스로 확인해라.') || true),
].join('\n');

/* 이번 묶음에서 이어 쓸 id 와 묶음 목록을 앞에 붙여 준다. */
const pairs = rowsIn
  /* 「19·20 이」, 「21·22 가」처럼 조사가 붙는다. 조사를 하나로 못박으면
     받침에 따라 갈리는 이/가 중 한쪽만 잡힌다. */
  .map((l) => l.match(/(\d+)[·~](\d+)(?:·(\d+))?\s*[이가]?\s*지문 하나를 나눠 쓴다/))
  .filter(Boolean)
  .map((m) => (m[3] ? `${m[1]}-${m[3]}` : `${m[1]}-${m[2]}`));

/* 이번 묶음에서 이미 쓴 소재. 자리 번호와 함께 보여 줘야 「25번에 이미
   있는 이야기」인지 알 수 있다. */
const avoid = [];
for (let s = from; s <= to; s++) {
  const list = usedBySlot.get(s) || [];
  if (list.length) avoid.push(`  - ${s}번: ${[...new Set(list)].join(' · ')}`);
}

console.log(`## 이번에 낼 것: ${round}회차 ${from}~${to}번 (${to - from + 1}문항)

- \`id\` 는 \`${idOf(from)}\` 부터 이어서 매겨라 (${idOf(from)} ~ ${idOf(to)}).
- \`slot\` 은 ${from}부터 ${to}까지. **회차가 달라도 자리 번호는 그대로다** —
  실제 시험의 몇 번 자리인지를 가리키는 값이라 회차마다 새로 매기지 않는다.${pairs.length ? `\n- 지문 하나를 나눠 쓰는 자리: ${pairs.map((p) => `\`pair:"${p}"\``).join(', ')} — 묶인 문항은 \`passage\` 를 글자까지 똑같이 넣어라.` : ''}
${round > 1 && avoid.length ? `
### 이미 쓴 소재 — 다시 쓰지 마라

같은 자리에 같은 이야기가 또 나오면 두 번째 회차가 시험이 아니라 복습이
된다. 아래는 1회차가 그 자리에서 이미 다룬 소재다. **소재도 결론도 겹치지
않게** 새로 잡아라. 유형과 난이도만 같으면 된다.

${avoid.join('\n')}
` : ''}
${out}`);
