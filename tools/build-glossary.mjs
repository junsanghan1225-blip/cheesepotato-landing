/* 뜻풀이 사전을 화면이 읽을 모양으로 굽는다 — 생성물, 손으로 고치지 말 것.
 *
 *   고칠 때: docs/glossary.json 을 고치고 이것을 다시 돌린다.
 *
 * 왜 있나. 시험을 풀다 모르는 낱말을 눌러 단어장에 담을 때, 뜻 칸이 늘
 * 비어 있었다. 빈 칸을 200개 받아 놓고 하나씩 채우는 사람은 없다.
 *
 * 왜 사전을 들고 있나. 번역기를 부르려면 열쇠가 있어야 하는데 이 사이트는
 * 정적이라 열쇠를 둘 데가 없다(코드에 넣으면 그대로 공개된다). 그래서
 * **우리 지문에 나오는 낱말**만 미리 적어 둔다. 지문에 없는 말은 눌릴 일이
 * 없으니, 사전이 온 세상 낱말을 담을 까닭도 없다.
 *
 * 활용형을 alt 로 함께 적는다. 학습자가 「먹었습니다」를 눌렀을 때 「먹다」로
 * 고쳐 주기를 기다리면 대개 그냥 담고 만다. 규칙으로 어간을 찾으려다
 * 없는 말을 만드는 것보다, 실제로 나오는 꼴을 적어 두는 편이 안전하다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rows = JSON.parse(readFileSync(join(ROOT, 'docs/glossary.json'), 'utf8'));

/* 표제어와 활용형을 한 표에 넣는다. 찾는 쪽은 무엇이 표제어인지 모르므로
   어느 꼴로 눌러도 한 번에 닿아야 한다. */
const table = {};
const langs = new Set();
for (const e of rows) {
  const val = {};
  for (const [k, v] of Object.entries(e)) {
    if (k === 'ko' || k === 'alt') continue;
    val[k] = v;
    langs.add(k);
  }
  /* 표제어 자체도 뜻이 필요하다 — 한국어를 모국어로 둔 사람에게. */
  for (const key of [e.ko, ...(e.alt || [])]) {
    if (!table[key]) table[key] = { head: e.ko, ...val };
  }
}

const body = JSON.stringify(table, null, 0);
writeFileSync(join(ROOT, 'glossary.js'),
`/* 낱말 뜻풀이 — 생성물. 손으로 고치지 말 것.
 *
 *   고칠 때: docs/glossary.json 을 고치고
 *            node tools/build-glossary.mjs 를 다시 돌린다.
 *
 * 표제어 ${rows.length}개, 찾을 수 있는 꼴 ${Object.keys(table).length}개.
 * 담고 있는 말: ${[...langs].join(', ')}
 *
 * head 는 표제어다. 「먹었습니다」로 찾아도 단어장에는 「먹다」로 담기게
 * 하려고 같이 넣는다 — 활용형이 그대로 쌓이면 같은 말이 열 번 들어간다.
 */
export const GLOSSARY = ${body};
`);

console.log(`표제어 ${rows.length}개 · 찾을 수 있는 꼴 ${Object.keys(table).length}개`);
console.log(`담고 있는 말: ${[...langs].join(', ')}`);
