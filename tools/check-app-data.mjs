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
for (const c of man.courses) { if (!c.title?.ko || !c.title?.en) err(`코스 ${c.id}: 제목이 비었다(ko · en 둘 다 있어야 앱에 보인다)`); for (const l of c.lessons) if (!l.title?.ko || !l.title?.en) err(`레슨 ${l.id}: 제목이 비었다`); }
for (const [k, p] of Object.entries(man.paths)) { if (!p.courses.length) err(`길 ${k} 에 코스가 없다`); for (const id of p.courses) if (!ids.has(id)) err(`길 ${k} 의 코스 ${id} 가 목록에 없다`); }
let nL = 0, nB = 0;
for (const c of want) {
  const f = path.join(ROOT, 'app-data/lessons', `${c.id}.json`);
  if (!fs.existsSync(f)) { err(`lessons/${c.id}.json 이 없다`); continue; }
  const ls = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (ls.length !== c.lessons.length) err(`${c.id}: 레슨 ${ls.length}개 — 원본 ${c.lessons.length}개`);
  for (const l of ls) { nL++; for (const b of l.blocks) { nB++; if (!KNOWN.has(b.t)) err(`${l.id}: 앱이 모르는 블록 「${b.t}」`); } }
}
const { GRAMMAR_PAIRS } = await import(pathToFileURL(path.join(ROOT, 'grammar-pairs.js')).href);
const gpf = path.join(ROOT, 'app-data/grammar-pairs.json');
if (!fs.existsSync(gpf)) err('app-data/grammar-pairs.json 이 없다');
else {
  const gp = JSON.parse(fs.readFileSync(gpf, 'utf8'));
  if (gp.length !== GRAMMAR_PAIRS.length) err(`문법 비교 ${gp.length}짝 — 원본 ${GRAMMAR_PAIRS.length}짝`);
  for (const x of gp) { if (!x.a?.name || !x.b?.name) err(`${x.id}: 문법 이름이 비었다`); for (const q of x.quiz) if (!q.q.includes('___') || (q.ans !== 'a' && q.ans !== 'b')) err(`${x.id}: 퀴즈 모양이 이상하다 — ${q.q}`); }
  if (man.grammarPairs?.n !== gp.length) err('manifest 의 grammarPairs 가 낡았다');
}
const TOPIK_SRC = { 'reading-I': (await import(pathToFileURL(path.join(ROOT, 'topik.js')).href)).TOPIK_READING, 'reading-II': (await import(pathToFileURL(path.join(ROOT, 'topik2.js')).href)).TOPIK2_READING };
const TL = await import(pathToFileURL(path.join(ROOT, 'topik-listening.js')).href);
TOPIK_SRC['listening-I'] = TL.TOPIKL_ITEMS; TOPIK_SRC['listening-II'] = TL.TOPIKL2_ITEMS;
for (const [k, src] of Object.entries(TOPIK_SRC)) {
  const f = path.join(ROOT, `app-data/topik-${k}.json`);
  if (!fs.existsSync(f)) { err(`topik-${k}.json 이 없다`); continue; }
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (d.items.length !== src.length) err(`TOPIK ${k}: ${d.items.length}문항 — 원본 ${src.length}`);
  if (man.topik?.[k]?.n !== d.items.length) err(`manifest 의 topik.${k} 가 낡았다`);
  for (const it of d.items) {
    if (!Array.isArray(it.options) || it.options.length < 2 || !(it.answer >= 0 && it.answer < it.options.length)) err(`TOPIK ${k} ${it.id}: 보기 · 정답이 이상하다`);
    if (k.startsWith('listening') && !Array.isArray(it.script)) err(`TOPIK ${k} ${it.id}: 대본이 없다`);
  }
}
/* 쓰기 · 모의고사 · 낱말 · 게임 */
{
  const { TW_ITEMS } = await import(pathToFileURL(path.join(ROOT, 'topik-writing.js')).href);
  const rd = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, `app-data/${n}.json`), 'utf8'));
  const w = rd('topik-writing');
  if (w.items.length !== TW_ITEMS.length) err(`쓰기 ${w.items.length}문항 — 원본 ${TW_ITEMS.length}`);
  for (const x of w.items) { if ((x.q === 51 || x.q === 52) && !x.blanks?.length) err(`${x.id}: 빈칸이 없다`); if ((x.q === 53 || x.q === 54) && !(x.min && x.max)) err(`${x.id}: 분량(min · max)이 없다`); if ('samples' in x || 'points' in x) err(`${x.id}: 채점 기준(samples · points)이 앱 자료에 들어갔다 — 서버만 들고 있어야 한다`); }
  const mk = rd('topik-mock');
  if (mk.I.slots.length !== 40 || mk.II.slots.length !== 50) err(`모의고사 자리 수가 이상하다(I ${mk.I.slots.length} · II ${mk.II.slots.length})`);
  const v = rd('vocab');
  if (v.length < 9000 || v.some((r) => r.length !== 4 || !r[0] || !r[3])) err('낱말 자료가 이상하다');
  const g = rd('games');
  if (g.potdle.length < 100 || Object.values(g.numbers).some((x) => x.length < 40)) err('게임 자료가 모자라다');
  if (man.writing?.n !== w.items.length || man.vocab?.n !== v.length) err('manifest 의 writing · vocab 이 낡았다');
}
/* 사전 */
{
  const GL = await import(pathToFileURL(path.join(ROOT, 'glossary.js')).href);
  const dr = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-data/dict.json'), 'utf8'));
  if (dr.length !== new Set(Object.values(GL.GLOSSARY).map((w) => w.head)).size) err(`사전 ${dr.length}개 — 원본과 다르다`);
  if (dr.some((r) => r.length !== 8 || !r[0])) err('사전 줄 모양이 이상하다');
  if (man.dict?.n !== dr.length) err('manifest 의 dict 가 낡았다');
  if (!fs.existsSync(path.join(ROOT, 'app-data/dict-senses.json'))) err('dict-senses.json 이 없다');
}
/* 문법 */
{
  const gr = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-data/grammar.json'), 'utf8'));
  const n = gr.reduce((a, c) => a + c.points.length, 0);
  const SBM = await import(pathToFileURL(path.join(ROOT, 'sentences.js')).href);
  if (n !== SBM.SB_CATS.reduce((a, c) => a + c.points.length, 0)) err('문법 개수가 원본과 다르다');
  if (gr.some((c) => c.points.some((p) => !p.id || !p.name || !p.desc))) err('이름 · 뜻이 빈 문법이 있다');
  if (man.grammar?.n !== n) err('manifest 의 grammar 가 낡았다');
}
/* 레슨 ↔ 문법 짝 */
{
  const pg = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-data/path-grammar.json'), 'utf8'));
  const { PATH_GRAMMAR } = await import(pathToFileURL(path.join(ROOT, 'path-map.js')).href);
  if (Object.keys(pg).length !== Object.keys(PATH_GRAMMAR).length || man.pathGrammar?.n !== Object.keys(pg).length) err('path-grammar.json · manifest 의 pathGrammar 가 낡았다');
}
/* 레벨 테스트 */
{
  const lt = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-data/leveltest.json'), 'utf8'));
  const ids = new Set(man.courses.map((c) => c.id));
  for (const l of lt.levels) for (const k of [l.start, l.next]) if (!ids.has(k)) err(`레벨 ${l.lv} 의 코스 ${k} 가 앱 자료에 없다`);
  if (lt.pool.some((r) => r.length !== 6 || !Array.isArray(r[3]) || r[3].length < 2 || !r[3][r[4]] || r[0] < 0 || r[0] > 7)) err('레벨 테스트 문제 모양이 이상하다');
  for (let L = 0; L <= 7; L++) if (lt.pool.filter((r) => r[0] === L).length < 10) err(`레벨 ${L} 문제가 10개보다 적다`);
  if (man.leveltest?.n !== lt.pool.length) err('manifest 의 leveltest 가 낡았다');
}
/* 번역 연습 · 회화 · 동화책 */
{
  const tt = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-data/translate.json'), 'utf8'));
  const cv = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-data/convo.json'), 'utf8'));
  const sb = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-data/stories.json'), 'utf8'));
  if (tt.some((x) => !x.id || !x.lines?.length || x.lines.some((l) => !l.en || !l.ko?.length))) err('번역 연습 모양이 이상하다');
  if (cv.some((x) => !x.id || !x.turns?.length || x.turns.some((t) => !t.npc?.text))) err('회화 모양이 이상하다');
  if (sb.some((x) => !x.id || !x.pages?.length || x.pages.some((p) => !p.ko))) err('동화책 모양이 이상하다');
  for (const [k, n] of [['translate', tt.length], ['convo', cv.length], ['stories', sb.length]]) if (man[k]?.n !== n) err(`manifest 의 ${k} 가 낡았다`);
}
/* 앱 번역 사전: 자리 표시({0}) 가 열쇠와 같은 집합이어야 한다 */
{
  const ph = (t) => (String(t).match(/\{\d+\}/g) || []).sort().join(',');
  for (const lang of ['vi', 'ja', 'zh']) {
    const f = path.join(ROOT, `app-data/ui-${lang}.json`);
    if (!fs.existsSync(f)) { err(`ui-${lang}.json 이 없다`); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const [k, v] of Object.entries(d)) if (ph(k) !== ph(v)) err(`ui-${lang}: 「${k}」 의 자리 표시가 번역과 다르다`);
    const miss = (man.ui?.[lang]?.total ?? 0) - Object.keys(d).length;
    console.log(`  앱 번역 ${lang}: ${Object.keys(d).length}/${man.ui?.[lang]?.total} (English 로 보이는 것 ${miss}개)`);
  }
}
console.log(bad ? `앱 자료 검사 — 문제 ${bad}개` : `앱 자료 검사 — 통과 (코스 ${want.length} · 레슨 ${nL} · 블록 ${nB})`);
process.exit(bad ? 1 : 0);
