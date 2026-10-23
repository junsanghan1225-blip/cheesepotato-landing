#!/usr/bin/env node
/* 책 전용 「생각해 보는 칸」 만들 단원 목록 — node tools/think-list.mjs <책 id> [--todo] [단원 id 앞부분]
   단원마다: id · 제목 · 이미 있는 칸 제목 · 「Watch out」 글 · 표 앞 3줄. --todo 는 docs/books/<책 id>.think.json 에 아직 없는 단원만.
   안티 그래비티가 이 목록을 보고 칸을 쓴다(지시 docs/antigravity/antigravity-particles-think-task.md). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const rest = args.filter((a) => !a.startsWith('--') && a !== id)[0] || '';
if (!id) { console.error('사용: node tools/think-list.mjs <책 id> [--todo] [단원 id 앞부분]'); process.exit(1); }
const B = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8'));
const tf = path.join(ROOT, `docs/books/${id}.think.json`);
const T = fs.existsSync(tf) ? JSON.parse(fs.readFileSync(tf, 'utf8')) : {};
let n = 0;
for (const p of B.parts) for (const u of p.units) {
  const s = B.inline?.[u]; if (!s || !u.startsWith(rest)) continue;
  if (args.includes('--todo') && T[u]) continue;
  n++;
  console.log(`\n## ${u} · ${s.title.en} / ${s.title.ko}   [${p.title.en}]${T[u] ? '   (이미 있음)' : ''}`);
  console.log('칸: ' + s.sections.map((x) => `${x.type}:${x.title.en}`).join(' | '));
  const w = s.sections.find((x) => x.type === 'text' && /watch out/i.test(x.title.en)); if (w) console.log('Watch out: ' + w.text);
  const t = s.sections.find((x) => x.type === 'table'); if (t) console.log('표: ' + t.rows.slice(0, 3).map((r) => r.join(' / ')).join('  ||  '));
}
console.log(`\n단원 ${n}개`);
