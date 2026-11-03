#!/usr/bin/env node
/* 「필수 관용 표현」 삽화 파일 검사 — 이름 · 크기가 정확한지(운영자 2026-11-03 「그림 사이즈는 정확히」).
   node tools/check-idioms-art.mjs [폴더=docs/idioms/art]   기준: 1800×1800 px 정사각형 PNG, 이름 idm-exNN-MM.png, 고른 표현(docs/idioms/picks.json)과 번호가 맞아야 함 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.resolve(process.argv[2] || path.join(ROOT, 'docs/idioms/art'));
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/idioms/picks.json'), 'utf8')); const U = P.units || P;
const want = new Set(Object.entries(U).flatMap(([u, hs]) => hs.map((_, i) => `idm-${u.replace('-', '')}-${String(i + 1).padStart(2, '0')}.png`)));
const have = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)) : [];
const bad = [];
for (const f of have) {
  if (!want.has(f)) { bad.push(`${f}: 이름이 목록에 없다(idm-exNN-MM.png)`); continue; }
  const [w, h] = execFileSync('identify', ['-format', '%w %h', path.join(dir, f) + '[0]'], { encoding: 'utf8' }).trim().split(' ').map(Number);
  if (w !== 1800 || h !== 1800) bad.push(`${f}: ${w}×${h} — 1800×1800 이어야 한다`);
}
const left = [...want].filter((f) => !have.includes(f));
console.log(`삽화 ${have.length}/${want.size}장 · 어긋남 ${bad.length} · 남은 것 ${left.length}`);
bad.forEach((b) => console.log('  ✗ ' + b));
if (left.length && left.length <= 20) console.log('  남은 것: ' + left.join(', '));
process.exit(bad.length ? 1 : 0);
