// 낱말 → 우리 TOPIK 문항에서 쓰인 문장(운영자 요청 2026-10-07 「우리 TOPIK 문제에서 이런 단어들이 어떻게 쓰이는지」).
// 읽기(topik.js · topik2.js) · 듣기(topik-listening.js) · 쓰기(topik-writing.js)의 지문 · 대본 · 질문 · 보기 · 모범 답을 문장으로 잘라,
// 낱말마다 그 낱말이 든 문장을 최대 3개(서로 다른 문항, 짧은 것 먼저)와 나온 문항 수를 모은다.
// 찾기: 동사 · 형용사는 「-다」를 뗀 줄기로(먹다 → 먹), 나머지는 표제어 그대로. 한 글자 낱말 · 줄기는 다른 말과 너무 많이 겹쳐 뺀다.
// 결과는 topik-refs/<00~39>.js(낱말 이름으로 나눔) — 단어 한 장 화면이 그 낱말 조각만 받는다. 손으로 고치지 않는다.
// node tools/build-topik-refs.mjs (build-vocab · TOPIK 문항이 바뀌면 다시)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const [r1, r2, wr, ls] = await Promise.all([imp('topik.js'), imp('topik2.js'), imp('topik-writing.js'), imp('topik-listening.js')]);
const words = [...JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/data/topik1.json'), 'utf8')), ...JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/data/topik2.json'), 'utf8'))];

/* 문장 하나 = [시험, 갈래, 문항 id, 문장] */
const sents = [];
const cut = (s) => String(s || '').replace(/\(\s*[㉠㉡]\s*\)/g, '( )').split(/(?<=[.?!。])\s+|\n+/).map((x) => x.trim()).filter((x) => x.length >= 6 && x.length <= 90);
const add = (e, sk, id, txt) => { for (const x of cut(txt)) sents.push([e, sk, id, x]); };
for (const q of [...r1.TOPIK_READING, ...r2.TOPIK2_READING]) { add(q.exam, 'reading', q.id, q.passage); (q.options || []).forEach((o) => add(q.exam, 'reading', q.id, o)); }
for (const q of [...(ls.TOPIKL_ITEMS || []), ...(ls.TOPIKL2_ITEMS || [])]) { for (const l of q.script || []) add(q.exam, 'listening', q.id, l.text); (q.options || []).forEach((o) => add(q.exam, 'listening', q.id, o)); }
for (const q of wr.TW_ITEMS) { add('II', 'writing', q.id, q.passage); for (const s of q.samples || q.model ? [].concat(q.model || [], q.samples || []) : []) add('II', 'writing', q.id, typeof s === 'string' ? s : s?.text); }

const out = {};
for (const w of words) {
  const h = w.head; if (!h) continue;
  const verb = /^(동사|형용사)$/.test(w.pos) && h.endsWith('다');
  const key = verb ? h.slice(0, -1) : h;
  if ([...key].length < 2) continue;
  const hit = sents.filter((x) => x[3].includes(key));
  if (!hit.length) continue;
  const items = new Set(hit.map((x) => x[2]));
  const pick = [], seen = new Set(), said = new Set();   // 같은 문항 · 같은 문장은 한 번만
  /* 완전한 문장(다 · 요 · 마침표로 끝남)이 먼저, 그다음 30자 안팎(너무 짧은 보기 조각 · 너무 긴 문장은 뒤로) */
  const rank = (x) => (/[다요.?!]$/.test(x[3]) ? 0 : 100) + Math.abs(x[3].length - 30);
  for (const x of hit.slice().sort((a, b) => rank(a) - rank(b))) { if (seen.has(x[2]) || said.has(x[3])) continue; seen.add(x[2]); said.add(x[3]); pick.push(x); if (pick.length >= 3) break; }
  out[h] = { n: items.size, r: pick };
}
const N = 40, bucket = (h) => { let s = 0; for (const c of h) s = (s * 31 + c.codePointAt(0)) >>> 0; return String(s % N).padStart(2, '0'); };
const parts = {};
for (const [h, v] of Object.entries(out)) (parts[bucket(h)] ??= {})[h] = v;
const dir = path.join(ROOT, 'topik-refs');
fs.mkdirSync(dir, { recursive: true });
for (let i = 0; i < N; i++) {
  const k = String(i).padStart(2, '0');
  fs.writeFileSync(path.join(dir, `${k}.js`), `/* 만든 것: tools/build-topik-refs.mjs — 손으로 고치지 않는다. 낱말 → { n: 나온 문항 수, r: [[시험, 갈래, 문항 id, 문장]] } */\nexport const R = ${JSON.stringify(parts[k] || {})};\n`);
}
console.log(`TOPIK 문장 ${sents.length}개 · 쓰인 낱말 ${Object.keys(out).length}개 → topik-refs/ ${N}조각`);
