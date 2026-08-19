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

const [from, to] = process.argv.slice(2).map(Number);
if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 50 || from > to) {
  console.error('쓰기: node tools/topik2-prompt.mjs <시작문항> <끝문항>   (예: 13 24)');
  process.exit(2);
}

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

console.log(`## 이번에 낼 것: ${from}~${to}번 (${to - from + 1}문항)

- \`id\` 는 \`t2-${String(from).padStart(3, '0')}\` 부터 이어서 매겨라.
- \`slot\` 은 ${from}부터 ${to}까지.${pairs.length ? `\n- 지문 하나를 나눠 쓰는 자리: ${pairs.map((p) => `\`pair:"${p}"\``).join(', ')} — 묶인 문항은 \`passage\` 를 글자까지 똑같이 넣어라.` : ''}

${out}`);
