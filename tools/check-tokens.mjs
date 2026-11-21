/* 색 이름 검사 — 손으로 쓴 CSS 의 :root 가 tools/lib/tokens.mjs 와 같은 이름에 같은 값을 쓰는지(기본 틀 5번, 2026-11-21).
   같은 이름이 파일마다 다른 값이면(예전: --orange 가 #FF914D / #E1682B) 실패한다. tokens.mjs 에 없는 이름은 보지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOKENS } from './lib/tokens.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const norm = (v) => v.replace(/\s+/g, '').replace(/\/\*.*?\*\//g, '').toLowerCase()
  .replace(/#([0-9a-f])([0-9a-f])([0-9a-f])(?![0-9a-f])/g, '#$1$1$2$2$3$3');   // #fff = #ffffff
/* 파일 · 어느 블록(밝은 :root 하나 / 어두운 블록) */
const FILES = [
  ['index.html', 'light', /(?:^|\n):root\s*\{([^}]*)\}/],
  ['index.html', 'dark', /:root\[data-theme="dark"\]\s*\{([^}]*)\}/],
  ['page.css', 'light', /:root\s*\{([^}]*)\}/],
  ['privacy.html', 'light', /:root\s*\{([^}]*)\}/],
  ['notices.html', 'light', /:root\s*\{([^}]*)\}/],
  ['teacher.html', 'light', /:root\s*\{([^}]*)\}/],
];
const bad = [];
let n = 0;
for (const [f, mode, re] of FILES) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const m = src.match(re);
  if (!m) { bad.push(`${f}: ${mode} :root 블록을 못 찾았다`); continue; }
  for (const [, k, v] of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) {
    const want = TOKENS[mode][k];
    if (want === undefined) continue;
    n++;
    /* --line 은 손 CSS 에서 rgba(27,21,18,.11) 처럼 풀어 쓴 것도 같다고 본다 */
    const exp = norm(want).replace('var(--ink-rgb)', norm(TOKENS[mode]['--ink-rgb'] || TOKENS.light['--ink-rgb']));
    const got = norm(v).replace('var(--ink-rgb)', norm(TOKENS[mode]['--ink-rgb'] || TOKENS.light['--ink-rgb']));
    if (exp !== got) bad.push(`${f}(${mode}) ${k}: ${v.trim()} ≠ tokens ${want}`);
  }
}
/* 화면 크기 기준점 세 개(기본 틀 3번, 2026-11-21): 폰 ≤600 · 태블릿 ≤900 · PC. 도구가 만드는 쪽의 CSS 는 이 값만 쓴다
   (max-width 600 · 900, min-width 601 · 901). 첫 화면 CSS(index.html · app-views.css)는 아직 옛 값이 많아 보지 않는다. */
const BP_FILES = ['tools/build-pages.mjs', 'tools/lib/sheets-shop.mjs', 'tools/lib/site-header.mjs', 'tools/build-sheets.mjs', 'tools/build-worksheets.mjs',
  'tools/build-downloads.mjs', 'tools/build-legal.mjs', 'tools/build-bonus.mjs', 'page.css', 'sale.js'];
const BP_OK = new Set(['max-width:600', 'max-width:900', 'min-width:601', 'min-width:901']);
let nb = 0;
for (const f of BP_FILES) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of src.matchAll(/@media[^{]*/g)) for (const [, k, v] of m[0].matchAll(/(max-width|min-width)\s*:\s*(\d+)px/g)) {
    nb++;
    if (!BP_OK.has(`${k}:${v}`)) bad.push(`${f}: @media ${k}:${v}px — 기준점은 600 · 900(넘을 때 601 · 901)만`);
  }
}
if (bad.length) { console.error('색 이름 · 화면 기준점이 어긋났다 — tools/lib/tokens.mjs · docs/plans/web-frame.md:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log(`색 이름 맞다 — ${FILES.length}곳 · ${n}개 값 · 화면 기준점 ${nb}곳 600 · 900`);
