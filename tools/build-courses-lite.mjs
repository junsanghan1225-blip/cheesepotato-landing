/* 앱이 받는 코스 목록(courses-lite.js)을 굽는다 — 생성물, 손으로 고치지 말 것.

     node tools/build-courses-lite.mjs

   코스 자료는 courses.js 한 판에 레슨 본문까지 다 들어 있고, 중·고급 48코스가
   들어온 뒤로 1MB 가 넘었다(courses-grammar-detailed.js). 배우기 첫 화면은 코스
   목록과 진도만 쓰는데 그걸 그리려고 본문 1MB 를 다 받고 있었다.

   그래서 앱에는 중·고급 레슨의 본문(blocks)을 뺀 목록을 준다. 레슨마다 문제 수
   (exN)만 남긴다 — 목록의 「6 문제」가 그걸 쓴다. 본문은 그 레슨을 열 때
   app.module.js 의 upperBlocksNeed() 가 courses-grammar-detailed.js 에서 받아 채운다.
   초급(과 입문)은 대부분의 학습자가 여는 곳이라 본문째 둔다.

   검사기(check-courses.mjs)가 이 파일이 courses.js 와 어긋나면 멈춘다 —
   코스를 고쳤으면 이것도 다시 구울 것. 도구들은 여전히 courses.js 를 쓴다. */
import fs from 'fs';
import { fileURLToPath } from 'url';
import { COURSES } from '../courses.js';

const OUT = fileURLToPath(new URL('../courses-lite.js', import.meta.url));
const EX = new Set(['choice', 'listen', 'type', 'order', 'pair', 'speak', 'cloze', 'build', 'translate', 'correct']);
export const isUpper = (c) => c.level === 'Intermediate' || c.level === 'Advanced';

export function lite() {
  return COURSES.map((c) => !isUpper(c) ? c : {
    ...c,
    lessons: c.lessons.map(({ blocks, ...l }) => ({ ...l, exN: blocks.filter((b) => EX.has(b.t)).length, lazy: true })),
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const body =
    '/* 생성물이다 — node tools/build-courses-lite.mjs 가 courses.js 에서 굽는다. 손으로 고치지 말 것.\n' +
    '   중·고급 레슨은 본문(blocks) 없이 문제 수(exN)만 있다. 본문은 열 때 받는다. */\n' +
    `export const COURSES = ${JSON.stringify(lite())};\n`;
  fs.writeFileSync(OUT, body);
  console.log(`courses-lite.js — ${Math.round(body.length / 1024)}KB (중·고급 ${COURSES.filter(isUpper).length}코스는 본문 뺌)`);
}
