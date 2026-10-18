#!/usr/bin/env node
/* 문법 하나(또는 번호 범위 · 단계)의 이름 · 뜻 · 예문 · 지금 연습 문장을 글로 찍는다 — 단계별 연습 문장을 쓰기 전에 보려고(안티 그래비티용).
   node tools/show-grammar.mjs 26-9            문법 하나
   node tools/show-grammar.mjs 26-1..26-20     번호 범위(문법 목록 차례 기준)
   node tools/show-grammar.mjs --todo beginner 아직 단계별 문장이 없는 초급 문법 id 목록(beginner · intermediate · advanced · all) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { SB_CATS, SB_MORE } = await import(pathToFileURL(path.join(ROOT, 'sentences.js')).href);
const PTS = SB_CATS.flatMap((c) => c.points.map((p) => ({ ...p, cat: c.name || c.ko || c.id })));
const FILE = path.join(ROOT, 'docs/grammar-sentences.json');
const D = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
const done = (id) => Array.isArray(D[id]) && D[id].length >= 9;
const a = process.argv[2];
if (!a) { console.error('사용: node tools/show-grammar.mjs <id | id..id | --todo 단계 | --short N [단계]>'); process.exit(1); }
if (a === '--short') {   // 문장이 N개보다 적은 문법(늘리는 일 — 운영자 2026-10-18 「문법마다 50개」 → 우선 30개)
  const n = Number(process.argv[3] || 30), lv = process.argv[4] || 'all';
  const L = PTS.filter((p) => (lv === 'all' || p.lv === lv) && (D[p.id]?.length || 0) < n);
  console.log(`${lv} — ${n}개보다 적은 문법 ${L.length}개: ${L.map((p) => p.id).join(' ')}`);
  process.exit(0);
}
if (a === '--todo') {
  const lv = process.argv[3] || 'all';
  const L = PTS.filter((p) => (lv === 'all' || p.lv === lv) && !done(p.id));
  console.log(`${lv} — 아직 ${L.length}개: ${L.map((p) => p.id).join(' ')}`);
  process.exit(0);
}
let list;
if (a.includes('..')) { const [f, t] = a.split('..'); const i = PTS.findIndex((p) => p.id === f), j = PTS.findIndex((p) => p.id === t); list = i < 0 || j < 0 ? [] : PTS.slice(i, j + 1); }
else list = PTS.filter((p) => p.id === a);
if (!list.length) { console.error(`없다: ${a}`); process.exit(1); }
for (const p of list) {
  const have = (D[p.id] || []).map((x) => `${x.lv}:${x.ko}`);
  console.log(`\n=== ${p.id} [${p.lv}] ${p.name}${done(p.id) ? `  (이미 ${have.length}개 씀)` : ''}\n  뜻: ${p.desc}\n  예문: ${p.ex}\n  더: ${(SB_MORE[p.id] || p.more || []).join(' | ')}\n  대화: ${(Array.isArray(p.dlg) ? p.dlg : []).join(' / ')}`);
  if (have.length) console.log(`  지금 있는 문장(겹치지 말 것): ${have.join(' | ')}`);
}
