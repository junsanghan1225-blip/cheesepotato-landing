#!/usr/bin/env node
/* 레슨 하나(또는 코스 하나)의 지금 블록을 글로 찍어 본다 — 새 블록을 쓰기 전에 그 레슨이 뭘 가르치는지 보려고(안티 그래비티용).
   node tools/show-lesson.mjs fw-02      레슨 하나
   node tools/show-lesson.mjs first-words 코스 전체 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { COURSES } = await import(pathToFileURL(path.join(ROOT, 'courses.js')).href);
const q = process.argv[2];
if (!q) { console.error('사용: node tools/show-lesson.mjs <레슨 id | 코스 id>'); process.exit(1); }
const pick = COURSES.filter((c) => c.id === q).flatMap((c) => c.lessons.map((l) => [c, l]));
const list = pick.length ? pick : COURSES.flatMap((c) => c.lessons.filter((l) => l.id === q).map((l) => [c, l]));
if (!list.length) { console.error(`없다: ${q}`); process.exit(1); }
for (const [c, l] of list) {
  console.log(`\n=== ${c.id} / ${l.id} — ${l.title?.ko || ''} | ${l.title?.en || ''}`);
  for (const b of l.blocks || []) console.log(`  [${b.t}] ${JSON.stringify(b).slice(0, 260)}`);
}
