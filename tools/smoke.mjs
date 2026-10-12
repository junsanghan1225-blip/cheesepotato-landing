/* 스모크 시험 — 웹 리팩터링의 안전장치(2026-10-12 운영자 「웹쪽은 천천히 단계별로 리펙터링」).
   주요 화면 주소를 폭 390 · 1280 에서 차례로 열어 (1) 잡히지 않은 JS 오류 (2) ReferenceError · TypeError 같은 콘솔 오류 (3) 가로 스크롤 을 센다.
   코드를 옮기거나 지우기 전에 한 번, 후에 한 번 돌려 결과가 같은지 본다(`node tools/smoke.mjs`). 서버(Supabase) 연결 실패는 오류로 안 센다.
   브라우저(Chromium)가 필요해서 CI(check.yml)에는 안 넣었다 — 손으로 돌린다. 끝에 「통과」가 나오면 오류 0.
   사용: node tools/smoke.mjs [--only 주소조각] */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const { chromium } = await import(PW);

/* 같은 폴더의 정적 파일을 내주는 작은 서버 */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };
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

/* 화면 주소(해시). 로그인이 필요한 곳은 로그인 문이 뜨는 것까지만 본다. */
const ROUTES = [
  '', '#learn', '#learn/courses', '#learn/mine', '#learn/path', '#learn/path/basic', '#learn/topik', '#learn/topik/I/reading', '#learn/topik/II/reading', '#learn/topik/I/listening',
  '#learn/topik/mock/I/1', '#learn/sentence', '#learn/reading', '#learn/convo', '#learn/translate', '#learn/qna', '#learn/class', '#learn/lectures', '#learn/stories', '#learn/eps',
  '#words', '#games', '#blocks', '#chosung', '#potdle', '#quiz', '#num', '#pro', '#dictionary', '#learn/report',
];
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : '';
const ignore = /Failed to fetch|net::ERR|supabase|NetworkError|Load failed|clarity|googletagmanager|google-analytics|favicon|Failed to load resource|ERR_/i;
const real = /ReferenceError|TypeError|SyntaxError|RangeError|is not defined|is not a function|Cannot read|undefined is not/;

const browser = await chromium.launch({ executablePath: CHROMIUM });
const bad = [];
let n = 0;
for (const W of [390, 1280]) {
  for (const r of ROUTES) {
    if (only && !r.includes(only)) continue;
    n++;
    const page = await browser.newPage({ viewport: { width: W, height: 900 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push(`pageerror: ${e.message.split('\n')[0]}`));
    page.on('console', (m) => { if (m.type() === 'error') { const t = m.text(); if (!ignore.test(t) && real.test(t)) errs.push(`console: ${t.slice(0, 140)}`); } });
    try {
      await page.goto(BASE + r, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1300);
      const hs = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      if (hs) errs.push('가로 스크롤');
    } catch (e) { errs.push(`열기 실패: ${String(e.message).split('\n')[0]}`); }
    if (errs.length) bad.push({ W, r: r || '(첫 화면)', errs: [...new Set(errs)] });
    await page.close();
  }
}
await browser.close();
server.close();
if (!bad.length) { console.log(`스모크 통과 — 주소 ${n}곳(390 · 1280)에서 오류 0`); process.exit(0); }
console.log(`스모크 — ${bad.length}곳에서 오류 (열어 본 ${n}곳)`);
for (const b of bad) console.log(`  ${b.W}px ${b.r}: ${b.errs.join(' | ')}`);
process.exit(1);
