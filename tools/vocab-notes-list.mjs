#!/usr/bin/env node
/* 단어장 책 단원의 낱말 목록(한자 · 품사 · 뜻 · 비슷한 말/반대말)을 보여 준다 — 안티가 유의어 · 동음이의어 메모를 쓸 때 본다.
   node tools/vocab-notes-list.mjs [단원 id 앞부분, 예: tv-01 (1권) · tw-01 (2권) · tx-01 (3권)]  (docs/vocab-book/…notes.json 에 이미 있는 단원은 ✓) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pre = process.argv[2] || '';
const bid = pre.startsWith('tx') ? 'topik2-vocab-lv3' : pre.startsWith('tw') ? 'topik2-vocab-2000' : 'topik2-vocab-1000';
const book = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${bid}.json`), 'utf8'));
const nf = path.join(ROOT, `docs/vocab-book/${bid}.notes.json`);
const notes = fs.existsSync(nf) ? JSON.parse(fs.readFileSync(nf, 'utf8')) : {};
const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/data/topik2.json'), 'utf8'));
const byHead = new Map(all.map((w) => [w.head, w]));
for (const [id, u] of Object.entries(book.inline)) {
  if (!id.startsWith(pre)) continue;
  const v = u.sections.find((s) => s.type === 'vocab');
  console.log(`\n## ${id} ${notes[id] ? '✓ 있음' : '(아직 없음)'}`);
  for (const e of v.entries) {
    const w = byHead.get(e.ko) || {};
    const rel = w.rel ? Object.entries(w.rel).map(([k, a]) => `${k}:${[].concat(a).join('/')}`).join(' ') : '';
    console.log(`- ${e.ko} [${e.pos}] ${e.en}${w.hanja ? ` · 한자 ${w.hanja}` : ''}${rel ? ` · ${rel}` : ''}`);
  }
}
