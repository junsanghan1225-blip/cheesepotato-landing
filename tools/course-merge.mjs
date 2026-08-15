/* 새 레슨을 코스에 붙인다.  node tools/course-merge.mjs im-02-02 새레슨.json
   붙이기 전에 검사기가 잡는 것과 같은 것을 먼저 본다 — 파일을 건드린 뒤에
   깨진 걸 알면 되돌리기가 번거롭다. */
import fs from 'fs';
import { DETAILED_GRAMMAR_COURSES } from '../courses-grammar-detailed.js';

const [courseId, jsonPath] = process.argv.slice(2);
const course = DETAILED_GRAMMAR_COURSES.find((c) => c.id === courseId);
if (!course) { console.error(`모르는 코스: ${courseId}`); process.exit(1); }
const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const have = new Set(DETAILED_GRAMMAR_COURSES.flatMap((c) => c.lessons.map((l) => l.id)));
const bad = [];
rows.forEach((l, i) => {
  const at = `${i + 1}번째 레슨(${l.id || '(id 없음)'})`;
  if (!l.id) bad.push(`${at}: id 없음`);
  else if (have.has(l.id)) bad.push(`${at}: 이미 있는 id — 진도가 섞인다`);
  else if (!l.id.startsWith(course.id + '-')) bad.push(`${at}: id 가 코스 id 로 시작하지 않는다`);
  if (!l.title) bad.push(`${at}: title 없음`);
  if (!l.blocks?.length) bad.push(`${at}: blocks 없음`);
  (l.blocks || []).forEach((b, j) => {
    const w = `${at} 블록 ${j + 1}(${b.t})`;
    if (b.t === 'choice' && !(Number.isInteger(b.answer) && b.answer >= 0 && b.answer < (b.options || []).length))
      bad.push(`${w}: answer 가 보기 번호가 아니다 (${b.answer})`);
    if (b.t === 'type' && !(b.keys || []).includes(b.answer))
      bad.push(`${w}: 정답이 keys 안에 없다 — 자판 없는 사람은 못 푼다`);
    if (b.t === 'order') {
      const s = (a) => [...(a || [])].sort().join('|');
      if (s(b.tokens) !== s(b.answer)) bad.push(`${w}: tokens 와 answer 의 조각이 다르다`);
    }
    if (b.t === 'table' && (b.rows || []).some((r) => r.length !== (b.head || []).length))
      bad.push(`${w}: 줄의 칸 수가 머리글과 다르다`);
    if (b.t === 'cloze' && !b.sentence) bad.push(`${w}: sentence 없음`);
    if (b.t === 'speak' && !b.say) bad.push(`${w}: say 없음`);
    if (/[一-鿿]/.test(JSON.stringify(b))) bad.push(`${w}: 한자`);
  });
});
if (bad.length) { console.error('■ 못 붙임\n  ' + bad.join('\n  ')); process.exit(1); }

/* 파일에서 그 코스의 lessons 배열 끝을 찾아 그 앞에 끼워 넣는다.
   객체를 다시 찍어 내면 손으로 다듬어 둔 줄바꿈과 주석이 다 날아간다. */
const p = new URL('../courses-grammar-detailed.js', import.meta.url).pathname;
let file = fs.readFileSync(p, 'utf8');
const at = file.indexOf(`id: '${course.id}'`) >= 0
  ? file.indexOf(`id: '${course.id}'`) : file.indexOf(`id: "${course.id}"`);
if (at < 0) throw new Error('코스를 파일에서 못 찾았다');
/* 이 코스 뒤로 나오는 첫 「  ], 」 가 lessons 배열의 끝이다. */
const end = file.indexOf('\n    ],\n', at);
if (end < 0) throw new Error('lessons 배열 끝을 못 찾았다');

const body = rows.map((l) =>
  '      {\n' +
  `        id: ${JSON.stringify(l.id)}, title: ${JSON.stringify(l.title)}, minutes: ${l.minutes ?? 4},\n` +
  '        blocks: [\n' +
  l.blocks.map((b) => '          ' + JSON.stringify(b) + ',').join('\n') + '\n' +
  '        ],\n' +
  '      },').join('\n');

fs.writeFileSync(p, file.slice(0, end + 1) + body + '\n' + file.slice(end + 1));
console.log(`${course.id} 에 레슨 ${rows.length}개 붙임 — ${rows.map((l) => l.id).join(', ')}`);
