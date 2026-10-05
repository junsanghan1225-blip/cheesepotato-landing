#!/usr/bin/env node
/* 낱말마다 우리 레벨(감자 L1 ~ L7)을 넣는다 — vocab/data/*.json 의 `lv` 칸 (운영자 요청 2026-10-05: 「우리 레벨에 맞게 재조정」)
 *
 *   node tools/vocab-level.mjs          넣고 → node tools/build-vocab.mjs
 *   node tools/vocab-level.mjs --dry    세어 보기만
 *
 * 기준은 levels.js 의 감자 ↔ 치즈 짝(CHEESE_OF_LEVEL = [0, 0, 1, 1, 2, 2, 3, 5])을 낱말 쪽으로 뒤집은 것이다.
 *   L1 새싹 감자 — 첫 낱말(목적 intro)
 *   L2 아기 감자 · L3 알감자 — TOPIK 1급을 자주 나오는 차례로 반씩(앞 반 L2 · 뒤 반 L3)
 *   L4 통감자 · L5 왕감자   — TOPIK 2급을 같은 식으로 반씩
 *   L6 황금 감자            — 3 · 4급
 *   L7 감자 왕              — 5 · 6급
 * TOPIK 급은 국립국어원 표준 교육과정 급수(std). std 가 없는 낱말(우리가 더한 것)은 이렇게 본다 —
 *   · 「공부하다 · 따뜻해지다 · 좋아지다」처럼 표준 목록 낱말에서 나온 말은 그 낱말의 급수
 *   · 그 밖은 자료의 level(우리가 정한 대략의 급수)
 * 「자주 나오는 차례」는 파일 순서다(씨앗 도구가 우리 자료 빈도로 줄 세웠다).
 * 손으로 정한 낱말은 `lv_hand: true` 를 달면 이 도구가 덮지 않는다(콩글리시처럼 TOPIK 목록에 없는 말). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const STD = new Map(read('docs/vocab/std-2017.json').words.map(([h, g]) => [h, g]));
const files = ['topik1', 'topik2'].map((n) => ({ n, f: `vocab/data/${n}.json`, words: read(`vocab/data/${n}.json`) }));
const all = files.flatMap((x) => x.words);

/* 표준 목록 낱말에서 나온 말 — 앞의 것부터 맞춰 본다. */
const FROM = [[/하다$/, ''], [/되다$/, ''], [/드리다$/, ''], [/시키다$/, ''], [/해지다$/, '하다'], [/(아|어)지다$/, '다'], [/지다$/, '다']];
function grade(w) {
  if (Number.isInteger(w.std)) return w.std;
  if (STD.has(w.head)) return STD.get(w.head);
  for (const [re, to] of FROM) {
    if (!re.test(w.head)) continue;
    const base = w.head.replace(re, to);
    if (base && STD.has(base)) return STD.get(base);
  }
  return w.level;
}

/* 1 · 2급은 파일 순서(빈도)로 앞 반 · 뒤 반. 급마다 따로 센다. */
const byGrade = new Map();
for (const w of all) {
  if (w.lv_hand || w.purposes?.includes('intro')) continue;
  const g = grade(w);
  if (g === 1 || g === 2) { if (!byGrade.has(g)) byGrade.set(g, []); byGrade.get(g).push(w); }
}
const half = new Map();
for (const [g, list] of byGrade) list.forEach((w, i) => half.set(w, i < Math.ceil(list.length / 2) ? 0 : 1));

const count = {};
let changed = 0;
for (const w of all) {
  let lv = w.lv;
  if (!w.lv_hand) {
    const g = grade(w);
    lv = w.purposes?.includes('intro') ? 1 : g <= 1 ? 2 + half.get(w) : g === 2 ? 4 + half.get(w) : g <= 4 ? 6 : 7;
  }
  if (!Number.isInteger(lv)) throw new Error(`레벨을 못 정했다: ${w.id}`);
  if (w.lv !== lv) { w.lv = lv; changed++; }
  count[`L${lv}`] = (count[`L${lv}`] || 0) + 1;
}
console.log(Object.keys(count).sort().map((k) => `${k} ${count[k]}`).join(' · '), `| 바뀐 낱말 ${changed}`);
if (DRY) process.exit(0);
for (const { f, words } of files)
  fs.writeFileSync(path.join(ROOT, f), '[\n' + words.map((w) => ' ' + JSON.stringify(w)).join(',\n') + '\n]\n');
console.log('넣었다 → node tools/build-vocab.mjs');
