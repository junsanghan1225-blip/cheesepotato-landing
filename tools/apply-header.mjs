/* 공통 메뉴줄(tools/lib/site-header.mjs)을 이미 박혀 있는 쪽에 다시 맞춘다 — 손으로 쓴 쪽(소개 · 개인정보 · 이름 도장 …)은
   만드는 도구가 없어서, 메뉴줄을 고치면 이 도구로 같이 고친다(운영자 2026-11-22 ☰ 큰 메뉴). 만든 쪽은 도구를 다시 돌리면 같아진다.
   찾는 것: <style>.sh{…}</style> 바로 뒤 <header class="sh">…</header>. 말(ko/en)은 지금 ☰ 이름(메뉴/Menu), 밑줄 칸은 지금 aria-current 로.
   node tools/apply-header.mjs          ← 고치기
   node tools/apply-header.mjs --check  ← site-header.mjs 와 같은지만 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { siteHeader, SITE_HEADER_CSS } from './lib/site-header.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const RE = /<style>\.sh\{[\s\S]*?<\/style>(\s*)<header class="sh">[\s\S]*?<\/header>/;
const KEY = { '/#learn/topik': 'topik', '/#words': 'words', '/shop/': 'books', '/worksheets/': 'sheets' };

const files = execFileSync('git', ['ls-files', '-z', '*.html'], { cwd: ROOT }).toString().split('\0').filter(Boolean);
let bad = 0, done = 0, seen = 0;
for (const f of files) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  const m = src.match(RE); if (!m) continue;
  seen++;
  const lang = /<summary aria-label="메뉴"/.test(m[0]) ? 'ko' : 'en';
  const cur = (m[0].match(/<nav class="sh-nav"[^>]*>[\s\S]*?<a href="([^"]+)" aria-current/) || [])[1];
  const block = `<style>${SITE_HEADER_CSS}</style>${m[1]}${siteHeader({ lang, active: KEY[cur] || '' })}`;
  if (block === m[0]) continue;
  if (CHECK) { if (bad++ < 5) console.error(`메뉴줄이 site-header.mjs 와 다르다: ${f}`); continue; }
  fs.writeFileSync(p, src.replace(RE, () => block)); done++;
}
if (CHECK) {
  if (bad) { console.error(`${bad}곳 — node tools/apply-header.mjs`); process.exit(1); }
  console.log(`메뉴줄 검사 — ${seen}쪽 통과`);
} else console.log(`메뉴줄: ${seen}쪽 중 ${done}쪽 고침`);
