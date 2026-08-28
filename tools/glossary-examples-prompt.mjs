/* 국어사전 예문 만들기 — Gemini 에게 보낼 주문서를 뽑는다.
 *
 *   node tools/glossary-examples-prompt.mjs           다음 40개
 *   node tools/glossary-examples-prompt.mjs --n=60     한 번에 60개
 *
 * docs/glossary-examples-gemini-prompt.md 의 "보낼 글" 뒤에 이 출력을
 * 그대로 붙여서 Gemini 에 준다.
 *
 * 이미 예문이 있는 표제어는 건너뛴다 — 다시 돌려도 늘 "다음" 40개가
 * 나온다. 순서는 가나다순으로 고정해 둔다. 무작위로 고르면 어디까지
 * 했는지 사람이 기억해야 하는데, 가나다순으로 앞에서부터 밀고 가면
 * "예문 몇 개까지 됐다"가 곧 진도다.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { GLOSSARY } from '../glossary.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const arg = (name, def) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
};
const N = Math.max(1, parseInt(arg('n', '40'), 10) || 40);

let done = {};
try { done = JSON.parse(readFileSync(join(ROOT, 'docs/glossary-examples.json'), 'utf8')); }
catch (e) { /* 아직 한 개도 없으면 빈 것으로 시작 */ }

/* GLOSSARY 는 활용형까지 키로 들어 있다 — 표제어만 한 번 추린다.
   app.module.js 의 DICT_ENTRIES 와 같은 계산이다. */
const byHead = new Map();
Object.values(GLOSSARY).forEach((v) => { if (!byHead.has(v.head)) byHead.set(v.head, v); });
const all = [...byHead.values()].sort((a, b) => a.head.localeCompare(b.head, 'ko'));

const remaining = all.filter((v) => !done[v.head]);
const batch = remaining.slice(0, N);

console.log(`전체 표제어 ${all.length}개 · 예문 있음 ${all.length - remaining.length}개 · 남음 ${remaining.length}개`);
console.log(`이번 주문서: ${batch.length}개\n`);

if (!batch.length) {
  console.log('더 뽑을 낱말이 없다 — 전부 예문이 있다.');
  process.exit(0);
}

console.log('이번에 예문 지을 낱말입니다. 표제어 — 품사 — 뜻풀이:\n');
batch.forEach((v) => {
  console.log(`${v.head} — ${v.pos || '(품사 없음)'} — ${v.en}`);
});
console.log(`\n표제어만 순서대로: ${batch.map((v) => v.head).join(', ')}`);
