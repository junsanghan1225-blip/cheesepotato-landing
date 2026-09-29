#!/usr/bin/env node
/* 「단어」 화면(#words)이 받는 자료를 만든다 — vocab-topik1.js
 *
 *   node tools/build-vocab.mjs
 *
 * 원본은 vocab/data/topik1.json(한 줄에 낱말 하나, 사람이 고치는 파일)과 vocab/taxonomy.json.
 * 화면은 그 원본을 그대로 받지 않는다 — 1MB 가까이 되고, 화면에 안 쓰는 칸(freq · src · std · hint)이
 * 절반이다. 여기서 쓰는 칸만 짧은 이름으로 추려 JS 모듈 하나로 굽는다(자국은 stamp.mjs 가 찍는다).
 *
 * 순서는 원본 그대로 — 원본이 「우리 자료에 자주 나오는 것 먼저」로 서 있고, 세션도 그 순서로 자른다.
 * B급 이상만 싣는다(C 는 뜻 · 예문이 비어 외울 수가 없다). 생성물이라 손으로 고치지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const tax = read('vocab/taxonomy.json');
/* TOPIK I 은 vocab-topik1.js(주제 · 목적 표도 같이), TOPIK II 는 vocab-topik2.js(낱말만 — 표는 topik1 쪽 것을 쓴다).
   TOPIK II 는 안 그래비티가 500개씩 채우는 중이라, B급이 된 것만 실린다 — 묶음이 들어올 때마다 다시 굽는다. */
for (const [name, withTables] of [['topik1', true], ['topik2', false]]) {
const words = read(`vocab/data/${name}.json`).filter((w) => w.grade === 'B' || w.grade === 'A');

/* 칸 이름: i id · h 표제어 · p 품사 · l 급수 · e 영어 뜻 · s 쉬운 영어 뜻 · t 주제(대분류/소분류) ·
   u 목적 · x 예문 [[한국어, 영어]] · r 관계 {syn, ant, hon} */
const out = words.map((w) => {
  const o = { i: w.id, h: w.head, p: w.pos, l: w.level, e: w.en, s: w.en_simple || '', t: w.topics, u: w.purposes,
    x: (w.examples || []).map((x) => [x.ko, x.en || '']) };
  if (w.id !== w.head) o.i = w.id; else delete o.i;   // 거의 같다 — 다를 때만 싣는다
  const r = {};
  for (const k of ['syn', 'ant', 'hon']) { const v = w.rel?.[k]; if (v && (!Array.isArray(v) || v.length)) r[k] = [].concat(v); }
  if (Object.keys(r).length) o.r = r;
  return o;
});

const topics = tax.topics.map((t) => ({ id: t.id, ko: t.ko, en: t.en, subs: t.subs.map((s) => ({ id: s.id, ko: s.ko, en: s.en })) }));
const purposes = tax.purposes.map((p) => ({ id: p.id, ko: p.ko, en: p.en }));

const src = `/* 생성물 — 손으로 고치지 않는다. 원본 vocab/data/${name}.json · vocab/taxonomy.json → node tools/build-vocab.mjs\n` +
  '   어휘 급수: 국립국어원 「국제 통용 한국어 표준 교육과정」(공공누리 1유형). 뜻 · 예문: 치즈감자. */\n' +
  (withTables ? `export const VOCAB_TOPICS = ${JSON.stringify(topics)};\n` +
  `export const VOCAB_PURPOSES = ${JSON.stringify(purposes)};\n` : '') +
  'export const VOCAB = [\n' + out.map((o) => JSON.stringify(o)).join(',\n') + '\n];\n';
fs.writeFileSync(path.join(ROOT, `vocab-${name}.js`), src);
console.log(`vocab-${name}.js — 낱말 ${out.length}개 · ${(src.length / 1024).toFixed(0)}KB`);
}
