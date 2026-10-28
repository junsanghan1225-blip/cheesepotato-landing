// KDP 이야기 번역 다듬기 검사 — 안티가 영어만 고쳤는지(한국어 · 구조 그대로) main 과 비교한다.
//   node tools/check-kdp-polish.mjs [기준 브랜치(기본 origin/main)]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const base = process.argv[2] || 'origin/main';
const F = 'docs/kdp-orig/short-stories.json';
const cur = JSON.parse(fs.readFileSync(F, 'utf8')).stories;
const old = JSON.parse(execFileSync('git', ['show', `${base}:${F}`], { encoding: 'utf8', maxBuffer: 1 << 26 })).stories;
const bad = [];
if (cur.length !== old.length) bad.push(`편 수가 다르다: ${old.length} → ${cur.length}`);
let changed = 0;
for (let i = 0; i < Math.min(cur.length, old.length); i++) {
  const a = old[i], b = cur[i], n = a.no;
  if (a.no !== b.no || a.level !== b.level) bad.push(`${n}: 번호 · 레벨이 바뀜`);
  if (a.title.ko !== b.title.ko) bad.push(`${n}: 제목 한국어가 바뀜`);
  for (const k of ['lines', 'vocab', 'check']) if (a[k].length !== b[k].length) bad.push(`${n}: ${k} 개수가 다름 ${a[k].length} → ${b[k].length}`);
  if (bad.length && bad.at(-1).startsWith(`${n}:`)) continue;
  a.lines.forEach((l, j) => { if (l.ko !== b.lines[j].ko) bad.push(`${n}: ${j + 1}번째 줄 한국어가 바뀜`); if (!String(b.lines[j].en || '').trim()) bad.push(`${n}: ${j + 1}번째 줄 영어가 빔`); });
  a.vocab.forEach((v, j) => { if (v.ko !== b.vocab[j].ko) bad.push(`${n}: 낱말 ${j + 1} 한국어가 바뀜`); if (!String(b.vocab[j].en || '').trim()) bad.push(`${n}: 낱말 ${j + 1} 영어가 빔`); });
  b.check.forEach((c, j) => { if (!String(c.q || '').trim() || !String(c.a || '').trim()) bad.push(`${n}: 문제 ${j + 1} 이 빔`); if (/[가-힣]/.test(c.q + c.a)) bad.push(`${n}: 문제 ${j + 1} 에 한글`); });
  if (JSON.stringify([b.title.en, b.lines.map((l) => l.en), b.vocab.map((v) => v.en), b.check]) !== JSON.stringify([a.title.en, a.lines.map((l) => l.en), a.vocab.map((v) => v.en), a.check])) changed++;
}
if (bad.length) { console.error(`✗ ${bad.length}건\n` + bad.slice(0, 30).join('\n')); process.exit(1); }
console.log(`✓ 한국어 · 구조 그대로, 영어가 고쳐진 이야기 ${changed}편 / ${cur.length}편`);
