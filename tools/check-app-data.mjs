/* app-data/(앱이 읽는 자료) 검사 — 원본(courses.js)과 맞는지, 앱이 모르는 블록이 없는지.
   앱이 그릴 수 있는 블록: text note chars table choice listen type order pair speak cloze build translate correct */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { COURSES } = await import(pathToFileURL(path.join(ROOT, 'courses.js')).href);
const KNOWN = new Set('text note chars table choice listen type order pair speak cloze build translate correct'.split(' '));
let bad = 0; const err = (s) => { bad++; console.log('✗ ' + s); };
const mf = path.join(ROOT, 'app-data/manifest.json');
if (!fs.existsSync(mf)) { err('app-data/manifest.json 이 없다 — node tools/build-app-data.mjs'); process.exit(1); }
const man = JSON.parse(fs.readFileSync(mf, 'utf8'));
const want = COURSES.filter((c) => c.lessons.length);
if (man.courses.length !== want.length) err(`코스 ${man.courses.length}개 — 원본은 ${want.length}개(자료가 바뀌었으면 node tools/build-app-data.mjs)`);
const ids = new Set(man.courses.map((c) => c.id));
for (const [k, p] of Object.entries(man.paths)) { if (!p.courses.length) err(`길 ${k} 에 코스가 없다`); for (const id of p.courses) if (!ids.has(id)) err(`길 ${k} 의 코스 ${id} 가 목록에 없다`); }
let nL = 0, nB = 0;
for (const c of want) {
  const f = path.join(ROOT, 'app-data/lessons', `${c.id}.json`);
  if (!fs.existsSync(f)) { err(`lessons/${c.id}.json 이 없다`); continue; }
  const ls = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (ls.length !== c.lessons.length) err(`${c.id}: 레슨 ${ls.length}개 — 원본 ${c.lessons.length}개`);
  for (const l of ls) { nL++; for (const b of l.blocks) { nB++; if (!KNOWN.has(b.t)) err(`${l.id}: 앱이 모르는 블록 「${b.t}」`); } }
}
console.log(bad ? `앱 자료 검사 — 문제 ${bad}개` : `앱 자료 검사 — 통과 (코스 ${want.length} · 레슨 ${nL} · 블록 ${nB})`);
process.exit(bad ? 1 : 0);
