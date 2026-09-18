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
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'ads');
/* 글자는 안 굽는다 — 문구는 캔바에서 얹는다. 여기서 나오는 것은 바탕과
   마스코트뿐이다. mascots.png 는 바탕이 없는 투명 png 로, 캔바에서 이것을
   쓰면 바탕을 마음대로 고를 수 있다. */
const SHOTS = [
  ['land',  'landscape-1200x628.png',      false],
  ['sq',    'square-1200x1200.png',        false],
  ['port',  'portrait-960x1200.png',       false],
  ['logo1', 'logo-square-1200x1200.png',   false],
  ['logo4', 'logo-wide-1200x300.png',      false],
  ['sqtext','square-text-1200x1200.png',    false],
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

/* 바탕 없는 마스코트. 칸을 찍는 대신 깎은 캔버스를 그대로 받는다 —
   까닭은 tools/ad-images-cutout.js 의 그 자리에 적어 두었다. */
const dataUrl = await page.evaluate(() => window.__mascotPng);
const png = Buffer.from(dataUrl.split(',')[1], 'base64');
await writeFile(join(OUT, 'mascots.png'), png);
const size = await page.evaluate(() => {
  const i = document.querySelector('img.mascot');
  return [i.naturalWidth, i.naturalHeight];
});
console.log(`  mascots.png  ${size[0]}×${size[1]}  (바탕 없음)`);

await browser.close();
server.close();
console.log(`그림 ${SHOTS.length + 1}장 → assets/ads/  (칸 ${SHOTS.length}개 + 바탕 없는 마스코트)`);
