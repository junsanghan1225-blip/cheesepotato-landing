/* 난이도 매기기 도우미 — 안티 그래비티가 문항을 한 줄씩 보고 난이도를 매기도록 목록을 뽑고, 다 매겼는지 검사한다.
   사용: node tools/difficulty-list.mjs <묶음>           → 문항 한 줄씩(id · 번호/유형 · 급 · 글 앞부분)
         node tools/difficulty-list.mjs <묶음> --check   → docs/difficulty/<묶음>.json 이 모든 id 를 1·2·3 으로 채웠는지
   묶음: writing(200) · listening(165) · reading-i(400) · reading-ii-a(앞 305) · reading-ii-b(뒤 300) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const SETS = {
  'writing': async () => (await imp('topik-writing.js')).TW_ITEMS.map((x) => ({ id: x.id, tag: `${x.q}번 ${x.lv}`, text: `${x.title} — ${x.passage}` })),
  'listening': async () => { const m = await imp('topik-listening.js'); return [...m.TOPIKL_ITEMS, ...m.TOPIKL2_ITEMS].map((x) => ({ id: x.id, tag: `${x.exam || ''} ${x.slot}번 ${x.type} ${x.grade}급`, text: `${x.q} / ${(Array.isArray(x.script) ? x.script.map((l) => l.text).join(' ') : x.script)}` })); },
  'reading-i': async () => (await imp('topik.js')).TOPIK_READING.map((x) => ({ id: x.id, tag: `${x.slot}번 ${x.type} ${x.grade}급`, text: `${x.question} / ${x.passage}` })),
  'reading-ii-a': async () => (await imp('topik2.js')).TOPIK2_READING.slice(0, 305).map((x) => ({ id: x.id, tag: `${x.slot}번 ${x.type} ${x.grade}급`, text: `${x.question} / ${x.passage}` })),
  'reading-ii-b': async () => (await imp('topik2.js')).TOPIK2_READING.slice(305).map((x) => ({ id: x.id, tag: `${x.slot}번 ${x.type} ${x.grade}급`, text: `${x.question} / ${x.passage}` })),
};
const set = process.argv[2];
if (!SETS[set]) { console.log('묶음: ' + Object.keys(SETS).join(' · ')); process.exit(1); }
const items = await SETS[set]();
if (process.argv.includes('--check')) {
  const f = path.join(ROOT, `docs/difficulty/${set}.json`);
  if (!fs.existsSync(f)) { console.log(`없음: docs/difficulty/${set}.json (문항 ${items.length}개)`); process.exit(1); }
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const miss = items.filter((x) => ![1, 2, 3].includes(d[x.id])).map((x) => x.id);
  const extra = Object.keys(d).filter((k) => !items.some((x) => x.id === k));
  console.log(`${set}: ${items.length - miss.length}/${items.length} 매김${miss.length ? ` · 빠진 것 ${miss.slice(0, 8).join(' ')}${miss.length > 8 ? ' …' : ''}` : ''}${extra.length ? ` · 없는 id ${extra.slice(0, 5).join(' ')}` : ''}`);
  process.exit(miss.length || extra.length ? 1 : 0);
}
for (const x of items) console.log(`${x.id}\t${x.tag}\t${String(x.text).replace(/\s+/g, ' ').slice(0, 140)}`);
