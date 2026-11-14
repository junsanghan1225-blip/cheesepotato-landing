/* 주간 점검 — 사이트를 폰(390) · PC(1280)로 열어 「개선할 곳」을 한 장의 표로 모은다(운영자 2026-11-14 「곳곳에 도구를 설치해 개선점을 찾자 · 유지 보수는 일주일마다」).
   잡는 것: ① 잡히지 않은 JS 오류 ② 깨진 안쪽 링크 ③ 접근성(axe) 심각 · 중대 ④ 가로 스크롤 ⑤ 누르기 작은 단추(24px 미만) ⑥ 쪽 무게(압축해서 1.5MB 넘음) ⑦ 검색 기본(제목 · 설명 · 대표 주소 · h1 · 그림 alt).
   서버 연결(Supabase · 분석) 실패는 오류로 안 센다. 점수(Lighthouse)는 lighthouse.yml 이 따로 낸다.
   사용: node tools/site-audit.mjs [--out 파일.md] [--fast]   (--fast: 주소를 줄여 시험용으로)
   환경: PLAYWRIGHT_PATH(playwright 위치) · CHROMIUM_PATH(없으면 playwright 기본) · AXE_PATH(axe.min.js 위치, 없으면 접근성만 건너뜀) */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const GZ = new Map();
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const FAST = args.includes('--fast');
const PW = process.env.PLAYWRIGHT_PATH || 'playwright';
const { chromium } = await import(PW);
const CHROMIUM = process.env.CHROMIUM_PATH || undefined;
const AXE = process.env.AXE_PATH && fs.existsSync(process.env.AXE_PATH) ? fs.readFileSync(process.env.AXE_PATH, 'utf8') : '';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.pdf': 'application/pdf', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  /* 실제 서비스(GitHub Pages)처럼 글 파일은 gzip 으로 내준다 — 받는 무게를 풀린 크기로 재면 3 배쯤 부풀어 거짓 경고가 난다(2026-11-14) */
  const ext = path.extname(f), text = /\.(html|js|css|json|svg|xml)$/.test(ext);
  const head = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
  if (text && /gzip/.test(req.headers['accept-encoding'] || '')) {
    const z = GZ.get(f) || (GZ.set(f, zlib.gzipSync(fs.readFileSync(f))), GZ.get(f));
    res.writeHead(200, { ...head, 'Content-Encoding': 'gzip', 'Content-Length': z.length }); res.end(z); return;
  }
  res.writeHead(200, { ...head, 'Content-Length': fs.statSync(f).size });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;

/* 열 주소: 첫 화면의 큰 길(해시) + 사이트맵에서 갈래마다 몇 개(첫 3개 · 가운데 · 끝) */
const locs = (f) => (fs.existsSync(path.join(ROOT, f)) ? [...fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]) : []);
const pick = (a, k) => (a.length <= k ? a : [...new Set([...a.slice(0, 3), a[Math.floor(a.length / 2)], a[a.length - 1]])].slice(0, k));
const spa = ['/#learn', '/#words', '/#pro', '/#dictionary', '/#quiz'];
const stat = FAST ? ['/', '/shop/'] : ['sitemap-main.xml', 'sitemap-blog.xml', 'sitemap-dictionary.xml', 'sitemap-learn.xml', 'sitemap-topik.xml'].flatMap((f) => pick(locs(f), f === 'sitemap-main.xml' ? 12 : 4));
const URLS = [...new Set(['/', ...spa.slice(0, FAST ? 1 : 5), ...stat])].filter((u) => u.startsWith('/#') || fs.existsSync(path.join(ROOT, u.replace(/[?#].*$/, '').replace(/\/$/, '/index.html').replace(/^\//, '')) ) || u === '/');

const ignoreNet = /Failed to fetch|net::ERR|supabase|NetworkError|Load failed|clarity|googletagmanager|google-analytics|favicon|Failed to load resource|ERR_/i;
const realErr = /ReferenceError|TypeError|SyntaxError|RangeError|is not defined|is not a function|Cannot read|undefined is not/;
const F = []; // {sev:1 오류 · 2 주의 · 3 참고, kind, where, note}
const add = (sev, kind, where, note) => F.push({ sev, kind, where, note });
const fileOf = (u) => path.join(ROOT, u.replace(/[?#].*$/, '').replace(/^\//, '').replace(/\/$/, '/index.html') || 'index.html');

/* 정적 쪽 검색 기본 · 깨진 안쪽 링크(브라우저 없이 글자만 본다) */
const seen = new Set();
for (const u of URLS) {
  if (u.includes('#')) continue;
  const f = fileOf(u); if (!fs.existsSync(f)) continue;
  const h = fs.readFileSync(f, 'utf8');
  const title = (h.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
  if (!title.trim()) add(2, '검색 기본', u, '제목(<title>)이 없음'); else if (title.length > 70) add(3, '검색 기본', u, `제목이 길어요(${title.length}자)`);
  if (!/<meta[^>]+name=["']description["'][^>]*content=["'][^"']{20,}/i.test(h) && !/<meta[^>]+content=["'][^"']{20,}["'][^>]+name=["']description["']/i.test(h)) add(2, '검색 기본', u, '설명(meta description)이 없거나 너무 짧음');
  if (!/<link[^>]+rel=["']canonical["']/i.test(h)) add(3, '검색 기본', u, '대표 주소(canonical)가 없음');
  const h1 = (h.match(/<h1[\s>]/gi) || []).length; if (h1 !== 1 && !/\/dictionary\//.test(u)) add(3, '검색 기본', u, `h1 이 ${h1}개`);
  const noAlt = (h.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length; if (noAlt) add(3, '접근성', u, `alt 없는 그림 ${noAlt}개`);
  for (const m of h.matchAll(/<a\b[^>]*\bhref=["']([^"'#?]+)(?:[?#][^"']*)?["']/gi)) {
    const href = m[1]; if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(href) || seen.has(u + href)) continue; seen.add(u + href);
    const t = href.startsWith('/') ? path.join(ROOT, href.replace(/\/$/, '/index.html')) : path.join(path.dirname(f), href.replace(/\/$/, '/index.html'));
    if (!fs.existsSync(t) && !fs.existsSync(t + '.html') && !fs.existsSync(path.join(t, 'index.html'))) add(1, '깨진 링크', u, `→ ${href}`);
  }
}

/* 브라우저로 열어 보기 */
const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
let opened = 0;
for (const W of [390, 1280]) {
  for (const u of URLS) {
    const ctx = await browser.newContext({ viewport: { width: W, height: 900 }, bypassCSP: true }); const page = await ctx.newPage(); opened++;   // axe 를 끼워 넣으려면 CSP 를 풀어야 한다(점검용 브라우저에서만)
    const errs = []; let bytes = 0;
    page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]));
    page.on('console', (m) => { if (m.type() === 'error') { const t = m.text(); if (!ignoreNet.test(t) && realErr.test(t)) errs.push(t.slice(0, 120)); } });
    let big = ['', 0];
    page.on('response', (r) => { const l = +(r.headers()['content-length'] || 0); if (r.url().startsWith(BASE)) { bytes += l; if (l > big[1]) big = [r.url().replace(BASE, '').replace(/\?.*$/, ''), l]; } });
    try {
      await page.goto(BASE + u, { waitUntil: 'load', timeout: 20000 }); await page.waitForTimeout(1200);
      errs.forEach((e) => add(1, 'JS 오류', `${W}px ${u}`, e));
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) add(2, '가로 스크롤', `${W}px ${u}`, '화면 밖으로 나가는 곳이 있음');
      if (bytes > 1.5 * 1024 * 1024) add(2, '쪽 무게', `${W}px ${u}`, `압축해서 ${(bytes / 1048576).toFixed(1)}MB 받음(가장 큰 것 ${big[0]} ${Math.round(big[1] / 1024)}KB)`);
      if (W === 390) {
        const small = await page.evaluate(() => [...document.querySelectorAll('a[href],button')].filter((e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'inline' && (r.width < 24 || r.height < 24); }).length);
        if (small) add(3, '작은 단추', `390px ${u}`, `누르기 작은 것 ${small}개(24px 미만)`);
      }
      if (AXE && W === 390) {
        await page.addScriptTag({ content: AXE });
        const v = await page.evaluate(async () => (await axe.run({ resultTypes: ['violations'] })).violations.filter((x) => x.impact === 'serious' || x.impact === 'critical').map((x) => ({ id: x.id, n: x.nodes.length, impact: x.impact })));
        v.forEach((x) => add(x.impact === 'critical' ? 1 : 2, '접근성', u, `${x.id} ${x.n}곳(${x.impact})`));
      }
    } catch (e) { add(1, '열기 실패', `${W}px ${u}`, String(e.message).split('\n')[0]); }
    await ctx.close();
  }
}
await browser.close(); server.close();

/* 같은 종류 · 같은 말은 합쳐 쪽 수만 센다 */
const g = new Map();
for (const x of F) { const k = `${x.sev}|${x.kind}|${x.note.replace(/\d+/g, '#')}`; const o = g.get(k) || { ...x, pages: new Set(), ex: x.note }; o.pages.add(x.where); g.set(k, o); }
const rows = [...g.values()].sort((a, b) => a.sev - b.sev || b.pages.size - a.pages.size);
const SEV = { 1: '[고칠 것]', 2: '[살펴볼 것]', 3: '[참고]' };
const L = [`# 주간 점검 — ${new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10)}`, '',
  `열어 본 주소 ${URLS.length}곳 × 폭 2개(390 · 1280) = ${opened}번. ${AXE ? '접근성(axe) 포함.' : '접근성(axe)은 이번에 건너뜀.'} 같은 문제는 합쳐서 「몇 쪽에서」만 셉니다.`, ''];
if (!rows.length) L.push('**문제가 잡히지 않았습니다.**');
for (const sev of [1, 2, 3]) {
  const r = rows.filter((x) => x.sev === sev); if (!r.length) continue;
  L.push(`## ${SEV[sev]} (${r.length}가지)`, '', '| 종류 | 내용 | 쪽 수 | 예 |', '|---|---|---|---|');
  r.slice(0, sev === 3 ? 8 : 20).forEach((x) => L.push(`| ${x.kind} | ${x.ex.replace(/\|/g, '/')} | ${x.pages.size} | ${[...x.pages][0]} |`));
  if (r.length > (sev === 3 ? 8 : 20)) L.push(`| … | 그 밖 ${r.length - (sev === 3 ? 8 : 20)}가지 | | |`);
  L.push('');
}
L.push('> 이 표는 도구가 자동으로 찾은 것이라 거짓 경고가 섞일 수 있습니다. 「고칠 것」 먼저, 같은 문제가 여러 쪽이면 한 곳을 고쳐 퍼지는지 보세요.');
const out = L.join('\n') + '\n';
const o = opt('--out', ''); if (o) fs.writeFileSync(o, out); else console.log(out);
console.log(`주간 점검 끝: 고칠 것 ${rows.filter((x) => x.sev === 1).length} · 살펴볼 것 ${rows.filter((x) => x.sev === 2).length} · 참고 ${rows.filter((x) => x.sev === 3).length}`);
