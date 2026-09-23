/* 중·고급 레슨 제목에 영어를 붙인다.

     node tools/lesson-titles.mjs dump [N]        아직 영어가 없는 레슨 제목 N개(기본 전부)를 JSON 으로 찍는다
     node tools/lesson-titles.mjs apply 받은것.json   { "레슨 id": "English title", … } 를 붙인다

   course-merge.mjs 가 레슨 제목을 한국어 문자열 하나로 넣어서, 영어 화면에서도
   레슨 목록이 한국어로 나왔다. 코스 파일은 3천 줄이 넘어서 손으로 고치면
   괄호 하나로 통째로 깨진다 — 그래서 제목 칸만 이 도구로 바꾼다.

   apply 는 `id: "…", title: "…"` 한 줄만 `title: { ko: "…", en: "…" }` 로 바꾼다.
   한국어 제목은 그대로 둔다. 모르는 id · 빈 영어 · 한글이 섞인 영어는 거절한다. */
import fs from 'fs';
import { fileURLToPath } from 'url';

const FILE = fileURLToPath(new URL('../courses-grammar-detailed.js', import.meta.url));
const LINE = /(id: "([a-z]+-c\d+-\d+)", title: )("(?:[^"\\]|\\.)*")/g;
const [mode, arg] = process.argv.slice(2);
/* 괄호·낫표 밖의 글. 문법 이름은 「-(으)ㄹ 텐데」처럼 괄호가 겹치므로 안쪽부터 벗긴다. */
function outside(s) {
  let t = s.replace(/「[^」]*」/g, '');
  for (let prev; prev !== t;) { prev = t; t = t.replace(/\([^()]*\)/g, ''); }
  return t;
}
const src = fs.readFileSync(FILE, 'utf8');

if (mode === 'dump') {
  const out = {};
  for (const m of src.matchAll(LINE)) out[m[2]] = JSON.parse(m[3]);
  const ids = Object.keys(out).slice(0, arg ? Number(arg) : undefined);
  console.log(JSON.stringify(Object.fromEntries(ids.map((k) => [k, out[k]])), null, 1));
  console.error(`영어가 없는 레슨 ${Object.keys(out).length}개 가운데 ${ids.length}개를 찍었다.`);
} else if (mode === 'apply') {
  const map = JSON.parse(fs.readFileSync(arg, 'utf8'));
  const have = new Set([...src.matchAll(LINE)].map((m) => m[2]));
  const bad = [];
  for (const [id, en] of Object.entries(map)) {
    if (!have.has(id)) bad.push(`${id}: 영어가 없는 레슨 목록에 없다 (이미 붙였거나 id 오타)`);
    else if (typeof en !== 'string' || !en.trim()) bad.push(`${id}: 영어 제목이 비었다`);
    else if (/[가-힣]/.test(outside(en))) bad.push(`${id}: 괄호·낫표 밖에 한글이 있다 — 「${en}」`);
    else if (en.length > 90) bad.push(`${id}: 90자가 넘는다 (${en.length}자)`);
  }
  if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
  let n = 0;
  const out = src.replace(LINE, (m, head, id, ko) => {
    if (!(id in map)) return m;
    n++;
    return `${head}{ ko: ${ko}, en: ${JSON.stringify(map[id].trim())} }`;
  });
  fs.writeFileSync(FILE, out);
  console.log(`레슨 제목 ${n}개에 영어를 붙였다. 남은 것: ${have.size - n}개`);
} else {
  console.log('쓰는 법: node tools/lesson-titles.mjs dump [N] | apply 받은것.json');
}
