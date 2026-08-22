/* 1,030개 텍스트를 구울 목록으로 추출
   출력: JSONL (한 줄 = 한 항목) */

import fs from 'fs';
const courses = ['courses.js', 'courses-beginner-stage1.js', 'courses-grammar.js', 'courses-grammar-beginner.js', 'courses-grammar-detailed.js'];
const set = new Map(); // text -> {source, type}

const add = (text, source, type) => {
  text = String(text).trim();
  if (!text || text.length > 200) return;
  if (!set.has(text)) set.set(text, { source, type });
};

// 1. 코스 say/글자
for (const file of courses) {
  const code = fs.readFileSync(file, 'utf8');
  for (const m of code.matchAll(/\bsay\s*:\s*['"]([^'"]+)['"]/g)) add(m[1], file, 'say');
  for (const m of code.matchAll(/\bch\s*:\s*['"]([^'"]+)['"]/g)) add(m[1], file, 'char');
}

// 2. 예문과 대화 (sentences*.js)
const parseS = (f) => {
  const code = fs.readFileSync(f, 'utf8');
  const ex = [...code.matchAll(/\bex\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const dlg = [...code.matchAll(/\bdlg\s*:\s*\[([\s\S]*?)\]/g)].flatMap(m => {
    return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]).map(s => s.replace(/^[AB]:\s*/, '').trim());
  });
  return { ex, dlg };
};

const { ex: ex1, dlg: dlg1 } = parseS('sentences.js');
const { ex: ex2, dlg: dlg2 } = parseS('sentences-beginner.js');
const { ex: ex3, dlg: dlg3 } = parseS('sentences-intermediate.js');
const allEx = [...ex1, ...ex2, ...ex3];
const allDlg = [...dlg1, ...dlg2, ...dlg3];

allEx.forEach(t => add(t, 'sentences', 'example'));
allDlg.forEach(t => add(t, 'sentences', 'dialogue'));

// JSONL 출력
const items = [...set.entries()].map(([text, meta], i) => ({
  id: i + 1,
  text,
  ...meta
}));

console.log(`${items.length} 항목 추출`);
items.forEach(item => console.log(JSON.stringify(item)));
