#!/usr/bin/env node
/* TOPIK II 단어장의 「빈출도 판단」 대상 목록(안티가 판단) — 운영자 2026-10-31 「안티한테 판단할 수 있게 시키든가」.
   우리 TOPIK II 자료에서 나온 횟수(freq)가 거의 없어 감자(빈출도)가 비는 낱말(책에서 감자 1개 이하)을 모은다.
   node tools/vocab-judge-list.mjs [--check]   목록 보기 / 결과(docs/vocab-judge/topik2.json) 검사
   결과: { "낱말": { "fq": 1~5, "d": 1~3 } } — fq = 시험 · 일상에서 얼마나 자주 쓰나(5 매우 자주), d = 같은 급 안의 어려움(1 쉬움 · 3 어려움). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const only = false;   // 급수별 3권(3~4급 · 5급 · 6급) 모두
const targets = new Map();
for (const id of only ? ['topik2-vocab-lv3'] : ['topik2-vocab-1000', 'topik2-vocab-2000', 'topik2-vocab-lv3']) {
  for (const u of Object.values(rd(`docs/books/${id}.json`).inline)) for (const s of u.sections) if (s.type === 'vocab') for (const e of s.entries) if (e.fq <= 1 && !targets.has(e.ko)) targets.set(e.ko, e);
}
if (process.argv.includes('--check')) {
  const f = path.join(ROOT, 'docs/vocab-judge/topik2.json');
  if (!fs.existsSync(f)) { console.error('결과 파일이 없다 — docs/vocab-judge/topik2.json'); process.exit(1); }
  const r = JSON.parse(fs.readFileSync(f, 'utf8')); const bad = [];
  for (const k of targets.keys()) { const v = r[k]; if (!v || !Number.isInteger(v.fq) || v.fq < 1 || v.fq > 5 || ![1, 2, 3].includes(v.d)) bad.push(k); }
  const extra = Object.keys(r).filter((k) => !targets.has(k));
  console.log(`${targets.size - bad.length}/${targets.size} 매김${extra.length ? ` · 목록에 없는 낱말 ${extra.length}개(${extra.slice(0, 5).join(', ')})` : ''}`);
  if (bad.length) { console.error(`빠졌거나 값이 이상한 것 ${bad.length}개: ${bad.slice(0, 10).join(', ')}`); process.exit(1); }
} else {
  console.log(`판단할 낱말 ${targets.size}개 (낱말 · 품사 · 급 · 뜻 · 예문)`);
  for (const e of targets.values()) console.log([e.ko, e.pos, e.lv, e.en, e.ex?.ko || ''].join(' | '));
}
