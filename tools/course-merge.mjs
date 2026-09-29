/* 새 레슨을 코스에 붙인다.  node tools/course-merge.mjs im-02-02 새레슨.json
   붙이기 전에 검사기가 잡는 것과 같은 것을 먼저 본다 — 파일을 건드린 뒤에
   깨진 걸 알면 되돌리기가 번거롭다. */
import fs from 'fs';
import { COURSES } from '../courses.js';

/* 코스는 여러 파일에 나뉘어 있다(중·고급은 courses-grammar-detailed.js, 초급은 courses-beginner-stage*.js …).
   그 코스가 적힌 파일을 찾아 그 파일에 끼운다. */
const FILES = ['courses-grammar-detailed.js', 'courses-beginner-stage1.js', 'courses-beginner-stage2.js',
  'courses-beginner-stage3.js', 'courses-beginner-stage4.js', 'courses-beginner-stage5.js', 'courses-beginner-stage6.js',
  'courses-beginner-extra.js', 'courses-grammar-beginner.js', 'courses-grammar.js', 'courses.js'];

const [courseId, jsonPath] = process.argv.slice(2);
const course = COURSES.find((c) => c.id === courseId);
if (!course) { console.error(`모르는 코스: ${courseId}`); process.exit(1); }
const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const have = new Set(COURSES.flatMap((c) => c.lessons.map((l) => l.id)));
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
   객체를 다시 찍어 내면 손으로 다듬어 둔 줄바꿈과 주석이 다 날아간다.
   배열 끝은 괄호를 세어 찾는다 — 따옴표 안(「[가고 싶어요]」 같은 빈칸 표시)과 주석 안의 괄호는 건너뛴다.
   파일마다 들여쓰기가 달라서(초급은 레슨이 두 칸) 줄 모양으로 찾으면 엉뚱한 자리에 붙는다. */
import { fileURLToPath } from 'url';
const idRe = new RegExp(`\\bid:\\s*['"]${courseId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
const name = FILES.find((f) => { try { return idRe.test(fs.readFileSync(fileURLToPath(new URL(`../${f}`, import.meta.url)), 'utf8')); } catch (e) { return false; } });
if (!name) throw new Error('코스를 파일에서 못 찾았다');
const p = fileURLToPath(new URL(`../${name}`, import.meta.url));
let file = fs.readFileSync(p, 'utf8');
const at = file.search(idRe);
const open = file.indexOf('lessons:', at);
const lb = file.indexOf('[', open);
if (open < 0 || lb < 0) throw new Error('lessons 배열을 못 찾았다');
let depth = 0, end = -1;
for (let i = lb; i < file.length; i++) {
  const ch = file[i];
  if (ch === '/' && file[i + 1] === '/') { i = file.indexOf('\n', i); if (i < 0) break; continue; }
  if (ch === '/' && file[i + 1] === '*') { i = file.indexOf('*/', i + 2) + 1; continue; }
  if (ch === '"' || ch === "'" || ch === '`') {
    for (i++; i < file.length && file[i] !== ch; i++) if (file[i] === '\\') i++;
    continue;
  }
  if (ch === '[') depth++;
  else if (ch === ']' && --depth === 0) { end = i; break; }
}
if (end < 0) throw new Error('lessons 배열 끝을 못 찾았다');
const nl = file.includes('\r\n') ? '\r\n' : '\n';
/* 들여쓰기는 그 코스의 첫 레슨을 따른다. 마지막 레슨 뒤에 쉼표가 없으면 붙인다. */
const pad = (file.slice(lb + 1, end).match(/\n([ \t]*)\{/) || [, '      '])[1];
let head = file.slice(0, end).replace(/\s*$/, '');
if (!head.endsWith(',') && !head.endsWith('[')) head += ',';
const body = rows.map((l) =>
  `${pad}{${nl}` +
  `${pad}  id: ${JSON.stringify(l.id)}, title: ${JSON.stringify(l.title)}, minutes: ${l.minutes ?? 4},${nl}` +
  `${pad}  blocks: [${nl}` +
  l.blocks.map((b) => `${pad}    ` + JSON.stringify(b) + ',').join(nl) + nl +
  `${pad}  ],${nl}` +
  `${pad}},`).join(nl);
const tail = file.slice(end);
const close = (file.slice(0, end).match(/\n([ \t]*)$/) || [, ''])[1];
fs.writeFileSync(p, head + nl + nl + body + nl + close + tail);
console.log(`${course.id} 에 레슨 ${rows.length}개 붙임(${name}) — ${rows.map((l) => l.id).join(', ')}`);
