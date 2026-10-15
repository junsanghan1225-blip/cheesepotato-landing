#!/usr/bin/env node
/* 집중 훈련 문제 — docs/drill-blocks/<묶음>.json { "<문법 id>": [ 블록… ] } → drill-extra.json { "<문법 id>": [ 블록… ] }
   약점 지도의 「집중 훈련」이 그 문법의 문제가 모자랄 때 끌어 쓴다(레슨 대격변 5단계, 지시 docs/antigravity/antigravity-drill-blocks-task.md).
   종류는 풀 수 있는 것만: choice · cloze · correct · build · dictate. 문법 하나당 최대 12개.
   node tools/build-drill-blocks.mjs          만들기
   node tools/build-drill-blocks.mjs --check  원본과 같은지(CI) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'docs/drill-blocks'), OUT = path.join(ROOT, 'drill-extra.json'), CHECK = process.argv.includes('--check');
const SBM = await import(pathToFileURL(path.join(ROOT, 'sentences.js')).href);
const known = new Set(SBM.SB_CATS.flatMap((c) => c.points.map((p) => p.id)));
const str = (x) => typeof x === 'string' && x.trim().length > 0;
const strs = (a, min = 1) => Array.isArray(a) && a.length >= min && a.every(str);
const RULES = {
  choice: (b) => (str(b.q) && strs(b.options, 2) && Number.isInteger(b.answer) && b.answer >= 0 && b.answer < b.options.length) || 'choice 는 q · options · answer',
  cloze: (b) => (str(b.sentence) && str(b.answer) && strs(b.options, 2)) || 'cloze 는 sentence · answer · options',
  correct: (b) => (str(b.wrong) && strs(b.answers)) || 'correct 는 wrong · answers',
  build: (b) => (str(b.q) && strs(b.answers)) || 'build 는 q · answers',
  dictate: (b) => (str(b.say) && (!b.answers || strs(b.answers))) || 'dictate 는 say(, answers)',
};
const bad = [], all = {};
const files = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort() : [];
for (const f of files) {
  let d; try { d = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')); } catch (e) { bad.push(`${f}: JSON 이 깨졌다 — ${e.message}`); continue; }
  for (const [g, blocks] of Object.entries(d)) {
    if (!known.has(g)) { bad.push(`${f}: 문법 id 「${g}」 가 없다`); continue; }
    if (!Array.isArray(blocks) || !blocks.length) { bad.push(`${f} ${g}: 블록 목록이 비었다`); continue; }
    blocks.forEach((b, i) => {
      const rule = RULES[b?.t];
      if (!rule) return bad.push(`${f} ${g}[${i}]: 쓸 수 없는 종류 「${b?.t}」 (${Object.keys(RULES).join(' · ')})`);
      const r = rule(b); if (r !== true) bad.push(`${f} ${g}[${i}]: ${r}`);
      if (b.at != null) bad.push(`${f} ${g}[${i}]: at 은 쓰지 않는다`);
    });
    (all[g] ||= []).push(...blocks);
  }
}
for (const [g, bl] of Object.entries(all)) if (bl.length > 12) bad.push(`문법 ${g}: ${bl.length}개 — 최대 12개`);
if (bad.length) { console.error('집중 훈련 문제에 문제가 있다:\n  - ' + bad.join('\n  - ')); process.exit(1); }
const sorted = Object.fromEntries(Object.keys(all).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map((g) => [g, all[g]]));
const body = JSON.stringify(sorted) + '\n';
const n = Object.values(sorted).reduce((a, b) => a + b.length, 0);
if (CHECK) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (have !== body) { console.error('drill-extra.json 이 원본과 다르다 — node tools/build-drill-blocks.mjs'); process.exit(1); }
  console.log(`집중 훈련 문제 검사 — 통과 (문법 ${Object.keys(sorted).length}개 · 문제 ${n}개)`);
} else { fs.writeFileSync(OUT, body); console.log(`집중 훈련 문제 — 문법 ${Object.keys(sorted).length}개 · 문제 ${n}개 → drill-extra.json`); }
