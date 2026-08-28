/* 국어사전 예문을 화면이 읽을 모양으로 굽는다 — 생성물, 손으로 고치지 말 것.
 *
 *   node tools/build-glossary-examples.mjs
 *
 * 원본은 docs/glossary-examples.json 이다(Gemini 로 짓고 사람이 검토한
 * 것 — docs/glossary.json 과 같은 자리). 고칠 일이 있으면 그 JSON 을
 * add-glossary-examples.mjs 로 고치고 이걸 다시 돌린다.
 *
 * glossary-senses.js 처럼 국어사전 화면(#dictionary)을 열 때만 따로
 * 받는다. glossary.js 처럼 늘 받는 자리에는 넣지 않는다 — 대부분의
 * 방문자는 사전 화면을 아예 안 연다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let data = {};
try { data = JSON.parse(readFileSync(join(ROOT, 'docs/glossary-examples.json'), 'utf8')); }
catch (e) { /* 아직 하나도 없으면 빈 것으로 굽는다 */ }

const body = `/* 국어사전 화면의 예문 — 생성물. 손으로 고치지 말 것.
 *
 *   고칠 때: docs/glossary-examples.json 을 add-glossary-examples.mjs 로 고치고
 *            node tools/build-glossary-examples.mjs 를 다시 돌린다.
 *
 * 국립국어원 자료에는 예문이 없어서(뜻풀이·번역만 있다) Gemini 로 새로
 * 지은 것이다 — docs/glossary-examples-gemini-prompt.md 의 절차를 거쳤다.
 * 칸은 { ex: 해요체 예문, en: 그 번역 } 이다.
 */
export const EXAMPLES = ${JSON.stringify(data, null, 1)};
`;

writeFileSync(join(ROOT, 'glossary-examples.js'), body);
console.log(`glossary-examples.js — 예문 ${Object.keys(data).length}개`);
