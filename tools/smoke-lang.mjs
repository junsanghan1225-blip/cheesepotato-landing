/* 언어 전환 스모크 — 화면 언어 12개마다 (1) 처음부터 그 언어로 연 주요 화면 (2) 첫 화면에서 메뉴로 바꾼 뒤 이동한 화면에서
   잡히지 않은 JS 오류 · 가로 스크롤 · 화면 밖으로 삐져나온 글(390px)을 센다. 사용: node tools/smoke-lang.mjs [언어코드…]
   서버(Supabase) 연결 실패는 오류로 안 센다. 브라우저가 필요해 CI 에는 안 넣었다 — 손으로 돌린다. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const { chromium } = await import(PW);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/`;
const LANGS = process.argv.slice(2).length ? process.argv.slice(2) : ['ko', 'en', 'vi', 'ja', 'zh', 'id', 'ne', 'my', 'ru', 'mn', 'pt', 'uz'];
const ROUTES = ['', '#learn', '#learn/courses', '#learn/mine', '#learn/path', '#learn/topik', '#learn/topik/II/writing', '#learn/sentence', '#learn/qna', '#learn/eps', '#words', '#games', '#pro', '#dictionary'];
const ignore = /Failed to fetch|net::ERR|supabase|NetworkError|Load failed|clarity|googletagmanager|google-analytics|favicon|Failed to load resource|ERR_/i;
const real = /ReferenceError|TypeError|SyntaxError|RangeError|is not defined|is not a function|Cannot read|undefined is not/;
const browser = await chromium.launch({ executablePath: CHROMIUM });
const bad = [];
let n = 0;
const watch = (page, errs) => {
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message.split('\n')[0]}`));
  page.on('console', (m) => { if (m.type() === 'error') { const t = m.text(); if (!ignore.test(t) && real.test(t)) errs.push(`console: ${t.slice(0, 140)}`); } });
  page.on('response', (r) => { if (r.status() === 404 && /i18n-|glossary-|\.js/.test(r.url())) errs.push(`404 ${r.url().replace(BASE, '')}`); });
};
/* 화면 밖으로 삐져나온 글 — 가로 스크롤이 막혀 있어도 오른쪽이 잘려 보이는 것 */
const clipped = (page) => page.evaluate(() => {
  const out = []; const W = innerWidth;
  /* 옆으로 밀어 보게 만든 줄(탭 줄 등)은 일부러 잘려 있는 것이라 세지 않는다 */
  const scrollParent = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) return true; } return false; };
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.childNodes.length) continue;
    const own = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()); if (!own) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (r.right > W + 2 && r.left < W && !el.closest('.lang-menu, [aria-hidden="true"], .sr-only, .marquee') && !scrollParent(el)) out.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} "${el.textContent.trim().slice(0, 24)}" +${Math.round(r.right - W)}px`);
    if (out.length >= 4) break;
  }
  return out;
});
for (const L of LANGS) {
  for (const W of [390]) {
    /* (1) 처음부터 그 언어 */
    for (const r of ROUTES) {
      n++;
      const ctx = await browser.newContext({ viewport: { width: W, height: 900 } });
      await ctx.addInitScript((l) => { try { localStorage.setItem('lang', l); } catch (e) {} }, L);
      const page = await ctx.newPage(); const errs = []; watch(page, errs);
      try {
        await page.goto(BASE + r, { waitUntil: 'load', timeout: 20000 }); await page.waitForTimeout(1500);
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) errs.push('가로 스크롤');
        const cl = await clipped(page); if (cl.length) errs.push('잘린 글: ' + cl.join(' ; '));
        const lang = await page.evaluate(() => document.documentElement.lang); if (lang && lang !== L && !(L === 'zh' && lang.startsWith('zh'))) errs.push(`html lang=${lang} (기대 ${L})`);
      } catch (e) { errs.push(`열기 실패: ${String(e.message).split('\n')[0]}`); }
      if (errs.length) bad.push({ L, r: r || '(첫 화면)', how: '처음부터', errs: [...new Set(errs)] });
      await ctx.close();
    }
    /* (2) 첫 화면에서 메뉴로 바꾼 뒤 이동 */
    n++;
    const ctx = await browser.newContext({ viewport: { width: W, height: 900 } });
    const page = await ctx.newPage(); const errs = []; watch(page, errs);
    try {
      await page.goto(BASE, { waitUntil: 'load', timeout: 20000 }); await page.waitForTimeout(1200);
      await page.click('#langBtn'); await page.click(`#langMenu [data-lang="${L}"]`); await page.waitForTimeout(1500);
      for (const r of ['#learn', '#learn/topik', '#words', '#games', '#pro', '']) { await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(900); if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) errs.push(`가로 스크롤 ${r || '(첫 화면)'}`); }
      const lang = await page.evaluate(() => document.documentElement.lang); if (lang && lang !== L && !(L === 'zh' && lang.startsWith('zh'))) errs.push(`메뉴로 바꾼 뒤 html lang=${lang} (기대 ${L})`);
    } catch (e) { errs.push(`메뉴 전환 실패: ${String(e.message).split('\n')[0]}`); }
    if (errs.length) bad.push({ L, r: '(메뉴로 바꾼 뒤 이동)', how: '메뉴', errs: [...new Set(errs)] });
    await ctx.close();
  }
}
await browser.close(); server.close();
if (!bad.length) { console.log(`언어 스모크 통과 — ${LANGS.length}개 언어 · 열어 본 ${n}곳에서 오류 0`); process.exit(0); }
console.log(`언어 스모크 — ${bad.length}곳에서 문제 (열어 본 ${n}곳)`);
for (const b of bad) console.log(`  [${b.L}] ${b.r}: ${b.errs.join(' | ')}`);
process.exit(1);
