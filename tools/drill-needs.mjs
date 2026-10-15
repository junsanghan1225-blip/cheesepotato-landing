/* 집중 훈련 재료 점검(레슨 대격변 5단계) — 문법 id 마다 「그 문법이 붙은 레슨들의 풀 수 있는 문제 수」를 센다(원래 블록 + 레슨별 새 블록).
   8개 밑이면 집중 훈련이 같은 문제를 되풀이하므로 안티 그래비티가 문제를 더 쓴다 → docs/lesson-blocks/_drill.json
   node tools/drill-needs.mjs            요약 + _drill.json 쓰기
   node tools/drill-needs.mjs --todo     모자란 문법만 한 줄씩 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const { COURSES } = await imp('courses.js');
const { PATH_GRAMMAR } = await imp('path-map.js');
const SBM = await imp('sentences.js');
const DRILL_T = new Set(['choice', 'cloze', 'type', 'order', 'build', 'translate', 'correct', 'listen', 'conj', 'dictate']);
const NAME = {}, LV = {};
for (const c of SBM.SB_CATS) for (const p of c.points) { NAME[p.id] = p.name; LV[p.id] = p.lv; }
const extraOf = (cid) => { const f = path.join(ROOT, 'lesson-extra', `${cid}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; };
const count = {}, lessons = {};
for (const c of COURSES) {
  const ex = extraOf(c.id);
  for (const l of c.lessons) {
    const gs = PATH_GRAMMAR[l.id] || [];
    if (!gs.length) continue;
    const n = [...(l.blocks || []), ...(ex[l.id] || [])].filter((b) => DRILL_T.has(b.t)).length;
    for (const g of gs) { count[g] = (count[g] || 0) + n; (lessons[g] ||= []).push(l.id); }
  }
}
const rows = Object.keys(NAME).map((g) => ({ g, name: NAME[g], lv: LV[g], n: count[g] || 0, lessons: lessons[g] || [] }));
const NEED = 8;
const low = rows.filter((r) => r.n < NEED);
if (!process.argv.includes('--todo')) fs.writeFileSync(path.join(ROOT, 'docs/lesson-blocks/_drill.json'), JSON.stringify(rows.map(({ g, name, lv, n, lessons: ls }) => ({ g, name, lv, n, lessons: ls })), null, 1) + '\n');
const by = (f) => rows.filter(f).length;
console.log(`문법 ${rows.length}개 — 레슨이 붙은 것 ${by((r) => r.lessons.length)}개 · 레슨이 아예 없는 것 ${by((r) => !r.lessons.length)}개 · 풀 문제 ${NEED}개 밑 ${low.length}개`);
for (const lv of ['beginner', 'intermediate', 'advanced']) console.log(`  ${lv}: 전체 ${by((r) => r.lv === lv)} · 모자람 ${low.filter((r) => r.lv === lv).length}`);
if (process.argv.includes('--todo')) for (const r of low.slice(0, 400)) console.log(`${r.g}\t${r.n}\t${r.lessons.length}레슨\t${r.name}`);
