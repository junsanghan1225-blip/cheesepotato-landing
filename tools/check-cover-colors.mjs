#!/usr/bin/env node
/* 책 표지 색이 서로 겹치지 않는지 본다 — 운영자 2026-10-26 「앞으로 표지는 절대로 안 겹치게」.
   표지 색 = 책 틀(docs/books/<id>.json)의 coverLevel.bg(없으면 color). 두 책의 색 차이(CIELAB ΔE)가 MIN 보다 작으면 겹친다고 본다.
   예외 = 이미 같은 보라색으로 나간 TOPIK II 책 셋(쓰기)(LEGACY, 새 책은 넣지 않는다 — 시리즈 색을 통일하자던 옛 결정).
   node tools/check-cover-colors.mjs            → 검사(겹치면 실패)
   node tools/check-cover-colors.mjs --suggest  → 지금 쓰는 색과 가장 멀리 떨어진 빈 색 12개 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN = 22;   // 눈으로 「다른 색」이라고 알아볼 정도(CIELAB ΔE76). 표지 글씨가 같은 크림색이라 어두운 바탕끼리의 차이를 본다
const LEGACY = new Set(['topik2-writing-51-52', 'topik2-writing-53-54', 'topik2-writing-eve']);
const lab = (h) => {
  const n = parseInt(h.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  const X = (0.4124 * c[0] + 0.3576 * c[1] + 0.1805 * c[2]) / 0.95047, Y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], Z = (0.0193 * c[0] + 0.1192 * c[1] + 0.9505 * c[2]) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const dir = path.join(ROOT, 'docs/books');
const books = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.includes('think')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  .filter((b) => b.id && (b.coverLevel?.bg || b.color)).map((b) => ({ id: b.id, bg: (b.coverLevel?.bg || b.color).toUpperCase() }));
if (process.argv.includes('--suggest')) {
  const used = books.map((b) => lab(b.bg)), out = [];
  const cands = [];
  for (let h = 0; h < 360; h += 10) for (const [s, l] of [[0.62, 0.30], [0.55, 0.40], [0.7, 0.22]]) {
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), g = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    cands.push('#' + [g(0), g(8), g(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase());
  }
  let pool = cands.map((c) => ({ c, d: Math.min(...used.map((u) => dE(u, lab(c)))) }));
  while (out.length < 12 && pool.length) { pool.sort((x, y) => y.d - x.d); const best = pool.shift(); out.push(best); used.push(lab(best.c)); pool = pool.map((p) => ({ c: p.c, d: Math.min(p.d, dE(lab(p.c), lab(best.c))) })); }
  console.log('지금 쓰는 색과 가장 멀리 떨어진 빈 색(차례대로 쓰면 서로도 안 겹친다):'); out.forEach((o) => console.log(`  ${o.c}  (가장 가까운 책과 ΔE ${o.d.toFixed(0)})`));
  process.exit(0);
}
const bad = [];
for (let i = 0; i < books.length; i++) for (let j = i + 1; j < books.length; j++) {
  const A = books[i], B = books[j];
  if (LEGACY.has(A.id) && LEGACY.has(B.id)) continue;
  const d = dE(lab(A.bg), lab(B.bg));
  if (d < MIN) bad.push(`${A.id}(${A.bg}) ↔ ${B.id}(${B.bg}) 색 차이 ΔE ${d.toFixed(1)} < ${MIN}`);
}
if (bad.length) { console.error('표지 색이 겹친다:\n  - ' + bad.join('\n  - ') + '\n  → node tools/check-cover-colors.mjs --suggest 로 빈 색을 고른다'); process.exit(1); }
console.log(`표지 색 — 겹침 없음 (책 ${books.length}권, 같은 보라 TOPIK II ${[...LEGACY].filter((x) => books.some((b) => b.id === x)).length}권은 예외)`);
