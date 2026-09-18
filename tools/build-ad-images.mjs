/* 구글 애즈에 올릴 그림을 굽는다 — node tools/build-ad-images.mjs
 *
 * 판은 tools/ad-images.html 이고, 여기서는 그 쪽을 열어 칸마다 사진만 찍는다.
 * 그림을 손으로 만들어 두면 사이트 색이나 로고가 바뀌었을 때 광고만 예전
 * 모습으로 남는다 — 그게 이 저장소가 생성물을 늘 도구로 만드는 까닭이다.
 *
 * 판이 /vendor/pretendard.css 와 /logo.png 를 저장소 뿌리 기준으로 부르므로
 * 뿌리에서 서버를 띄운다. 그러지 않으면 글꼴이 빠진 채 찍힌다.
 *
 * 나오는 치수는 구글이 권하는 것이다.
 *   가로 1200×628 (1.91:1) · 정사각 1200×1200 · 세로 960×1200 (4:5)
 *   로고 1200×1200 (1:1) · 1200×300 (4:1)
 * 로고는 그림과 다른 칸에 올린다. 한 장에 5MB 까지라 여유가 많다.
 *
 * ── 이 도구만 남의 것을 쓴다 ──────────────────────────────────
 * 저장소의 다른 도구는 노드에 딸린 것만 쓰는데, 이것은 **playwright** 가
 * 있어야 한다. 글로 쓴 판을 그림으로 굽는 일은 브라우저 없이 안 되기
 * 때문이다. 그래서 굽는 쪽이 아니라 **구운 것을 저장소에 둔다** —
 * assets/ads/ 의 png 를 커밋해 두었으니, 사이트 색이나 로고를 고쳐
 * 다시 구울 때만 이게 필요하다.
 *
 *   npm i playwright && npx playwright install chromium
 *   node tools/build-ad-images.mjs
 *
 * 이미 크로미움이 있으면 받지 않아도 된다 —
 *   CHROME_PATH=/경로/chrome node tools/build-ad-images.mjs
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'ads');
const SHOTS = [
  ['land',  'landscape-1200x628.png'],
  ['sq',    'square-1200x1200.png'],
  ['port',  'portrait-960x1200.png'],
  ['logo1', 'logo-square-1200x1200.png'],
  ['logo4', 'logo-wide-1200x300.png'],
];
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
               '.png':'image/png', '.woff2':'font/woff2', '.woff':'font/woff' };

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

/* 판이 부르는 것을 내주는 작은 서버. file:// 로 열면 canvas 가 logo.png 를
   다른 출신으로 보고 getImageData 를 거부해서 배경을 깎을 수 없다. */
const server = createServer(async (req, res) => {
  const p = join(ROOT, normalize(decodeURIComponent(req.url.split('?')[0])));
  if (!p.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(p);
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

/* 브라우저는 playwright 가 깐 것을 쓴다. 이미 크로미움이 있는 자리에서는
   CHROME_PATH 로 가리켜 주면 또 받지 않는다 (CHROME_PATH=/…/chrome). */
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1400, height: 1400 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/tools/ad-images.html`, { waitUntil: 'load' });

/* 글꼴과 배경 깎기를 둘 다 기다린다. 어느 하나라도 덜 되면 글자가 기본
   글꼴로 찍히거나 마스코트 뒤에 네모가 남는다 — 둘 다 조용한 사고다. */
await page.evaluate(() => document.fonts.ready);
await page.waitForSelector('html[data-mascot="ready"]', { timeout: 30000 });
await page.waitForTimeout(300);

for (const [id, file] of SHOTS) {
  const el = await page.$('#' + id);
  if (!el) throw new Error(`판에 #${id} 칸이 없다`);
  await el.screenshot({ path: join(OUT, file) });
  const b = await el.boundingBox();
  console.log(`  ${file}  ${Math.round(b.width)}×${Math.round(b.height)}`);
}

await browser.close();
server.close();
console.log(`그림 ${SHOTS.length}장 → assets/ads/`);
