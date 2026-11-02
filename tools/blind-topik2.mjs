#!/usr/bin/env node
/* 정답 가린 채 풀이(전수 검수) — 운영자 2026-11-02 「크레딧 써도돼」.
   node tools/blind-topik2.mjs export <입력.json|all> <나갈 폴더> [--chunk 50]   → 정답 · 해설을 뺀 풀이용 파일을 N문항씩 나눠 쓴다
   node tools/blind-topik2.mjs compare <입력.json|all> <풀이 폴더>               → 풀이 결과(chunk-NN.answers.json)와 정답을 비교해 안 맞는 문항 · 「애매」 표시 문항을 낸다
   풀이하는 쪽은 정답을 모른 채 문제만 읽고 하나를 고른다 — 정답이 둘로 읽히거나(복수 정답) 하나도 안 맞는 문항이 여기서 드러난다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [cmd, src, dir] = process.argv.slice(2);
const chunk = Number(process.argv[process.argv.indexOf('--chunk') + 1]) || 50;
const load = async () => src === 'all' ? (await import(pathToFileURL(path.join(ROOT, 'topik2.js')).href)).TOPIK2_READING : JSON.parse(fs.readFileSync(src, 'utf8'));
const rows = await load();
if (cmd === 'export') {
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i * chunk < rows.length; i++) {
    const part = rows.slice(i * chunk, (i + 1) * chunk).map((q) => ({ id: q.id, type: q.type, question: q.question, ...(q.sentence ? { sentence: q.sentence } : {}), ...(q.mark ? { underlined: q.mark } : {}), passage: q.passage, options: q.options }));
    fs.writeFileSync(path.join(dir, `chunk-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(part, null, 1));
  }
  console.log(`${rows.length}문항 → ${Math.ceil(rows.length / chunk)}개 파일(${dir})`);
} else if (cmd === 'compare') {
  const by = new Map(rows.map((q) => [q.id, q])); const got = new Map(); const unsure = new Map();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.answers.json'))) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const [id, v] of Object.entries(j.answers || {})) got.set(id, v);
    for (const u of j.unsure || []) unsure.set(u.id, u.note || '');
  }
  const miss = [], bad = [];
  for (const q of rows) { if (!got.has(q.id)) { miss.push(q.id); continue; } if (got.get(q.id) !== q.answer) bad.push(q); }
  console.log(`풀이 ${got.size}/${rows.length}문항 · 안 맞음 ${bad.length} · 애매 표시 ${unsure.size} · 풀이 없음 ${miss.length}`);
  bad.forEach((q) => console.log(`  ✗ ${q.id} slot ${q.slot ?? ''} ${q.type}: 정답 ${'①②③④'[q.answer]} ← 풀이 ${'①②③④'[got.get(q.id)]}${unsure.has(q.id) ? ' (애매: ' + unsure.get(q.id) + ')' : ''}`));
  [...unsure].filter(([id]) => !bad.some((q) => q.id === id)).forEach(([id, n]) => console.log(`  ? ${id} 애매: ${n}`));
  if (miss.length) console.log('  풀이 없음:', miss.slice(0, 20).join(', '));
} else { console.error('쓰는 법: export | compare'); process.exit(2); }
