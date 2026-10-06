#!/usr/bin/env node
/* CI 검사 — 첫 화면의 덩어리들이 #homeView 안에 들어 있는가(2026-10-07).
   첫 화면 마크업을 고치다 </div> 가 하나 남으면 그 아래(길 카드 · 자주 묻는 것 …)가 #homeView 밖으로 빠져,
   다른 화면으로 가도 첫 화면 내용이 계속 떠 있다 — 운영자 화면에서 「눌러도 안 넘어간다」로 보였다(#235). */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const start = html.indexOf('<div id="homeView">');
if (start < 0) { console.error('index.html 에 #homeView 가 없다'); process.exit(1); }
/* #homeView 가 닫히는 자리를 div 짝으로 찾는다 */
let depth = 0, end = -1;
for (const m of html.slice(start).matchAll(/<div\b|<\/div>/g)) {
  depth += m[0] === '</div>' ? -1 : 1;
  if (depth === 0) { end = start + m.index; break; }
}
const home = html.slice(start, end);
const need = ['hmPaths', 'faq', 'hmMore', 'hmMe'];
const out = need.filter((id) => html.includes(`id="${id}"`) && !home.includes(`id="${id}"`));
if (out.length) { console.error(`첫 화면 덩어리가 #homeView 밖으로 빠졌다: ${out.join(', ')} — 위쪽 마크업에 </div> 가 남았는지 볼 것`); process.exit(1); }
console.log(`layout: 이상 없음 — ${need.filter((id) => html.includes(`id="${id}"`)).join(' · ')} 모두 #homeView 안`);
