// 인스타 자동 올리기 — .github/workflows/insta-post.yml 이 하루 세 번 부른다(운영자 요청 2026-10-02).
//
//   node tools/insta-post.mjs render  --slot 0 --day 2026-10-03 --out media
//     편집기(insta.html)를 머리 없는 브라우저로 열어 그날 게시물 하나(slot 0 · 1 = 단어 1 · 2, 2 = 문법)를
//     JPEG 와 caption 으로 media/<날짜>/<게시물>/ 에 쓴다. 모양은 docs/insta-template.json(편집기 「자동 올리기용 틀 받기」).
//   node tools/insta-post.mjs publish --dir media/<날짜>/<게시물> --base <이미지 주소 앞부분>
//     그 이미지들을 인스타 API 로 여러 장 게시물(캐러셀)로 올리고 posted.json 을 남긴다.
//     열쇠는 환경 변수 IG_TOKEN(GitHub Secrets) — 이 파일 · 로그 어디에도 찍지 않는다.
//
// 이미지는 인스타가 직접 가져가야 해서 공개 주소가 필요하다 — 워크플로가 insta-media 가지(사이트와 따로)에 올리고
// raw.githubusercontent.com 주소를 넘긴다. 사이트(main)에는 아무것도 쓰지 않는다.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const GRAPH = 'https://graph.instagram.com/v23.0';   // 판이 낡으면 이 숫자만 올린다
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const todayKst = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const die = (msg) => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

const cmd = process.argv[2];
if (cmd === 'render') await render();
else if (cmd === 'publish') await publish();
else die('쓰는 법: render --slot 0|1|2 [--day YYYY-MM-DD] [--out media]  /  publish --dir <폴더> --base <주소>');

async function render() {
  const slot = Number(arg('slot', '0')), day = arg('day') || todayKst(), out = arg('out', 'media');
  if (![0, 1, 2, 3].includes(slot)) die('slot 은 0(단어 1) · 1(단어 2) · 2(문법) · 3(TOPIK)');
  const tplPath = join(ROOT, 'docs/insta-template.json');
  const tpl = existsSync(tplPath) ? JSON.parse(readFileSync(tplPath, 'utf8')) : {};

  /* 사이트 폴더를 그대로 내보내는 작은 서버 — 편집기가 자료 파일을 모듈로 불러온다 */
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  const srv = createServer(async (req, res) => {
    try {
      const p = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(ROOT)) throw new Error('out');
      res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p));
    } catch { res.writeHead(404); res.end(); }
  }).listen(0);
  const port = srv.address().port;

  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(e.message));
    await page.addInitScript((t) => {
      if (t.tpl) localStorage.setItem('insta:tpl', JSON.stringify(t.tpl));
      if (t.tags) localStorage.setItem('insta:tags', JSON.stringify(t.tags));
    }, tpl);
    await page.goto(`http://localhost:${port}/insta.html`);
    await page.waitForFunction(() => typeof window.instaExport === 'function', null, { timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const posts = await page.evaluate((d) => window.instaExport(d), day);
    if (errs.length) die(`편집기 오류: ${errs.join(' / ')}`);
    const post = posts[slot];
    const dir = join(out, day, post.file);
    await mkdir(dir, { recursive: true });
    for (let i = 0; i < post.imgs.length; i++) await writeFile(join(dir, `${i + 1}.jpg`), Buffer.from(post.imgs[i].split(',')[1], 'base64'));
    await writeFile(join(dir, 'caption.txt'), post.caption);
    await writeFile(join(dir, 'meta.json'), JSON.stringify({ day, slot, file: post.file, name: post.name, n: post.imgs.length }, null, 1));
    console.log(`✓ ${day} ${post.name} — ${post.imgs.length}장 → ${dir}`);
  } finally { await browser.close(); srv.close(); }
}

async function publish() {
  const dir = arg('dir'), base = arg('base');
  const token = process.env.IG_TOKEN;
  if (!dir || !base) die('--dir 와 --base 가 필요해요');
  if (!token) die('IG_TOKEN 이 없어요 — GitHub → Settings → Secrets → Actions 에 IG_TOKEN 을 넣어 주세요(docs/insta-auto.md).');
  if (existsSync(join(dir, 'posted.json'))) { console.log('이미 올린 게시물 — 건너뜀'); return; }
  const meta = JSON.parse(await readFile(join(dir, 'meta.json'), 'utf8'));
  const caption = await readFile(join(dir, 'caption.txt'), 'utf8');

  /* 열쇠는 API 가 정한 대로 access_token 칸에 담는다. 주소 · 요청을 로그에 찍지 않으므로 열쇠가 남지 않는다 */
  const call = async (method, path, params = {}) => {
    const url = new URL(`${GRAPH}${path}`), all = { ...params, access_token: token };
    let body;
    if (method === 'GET') Object.entries(all).forEach(([k, v]) => url.searchParams.set(k, v));
    else body = new URLSearchParams(all);
    const res = await fetch(url, { method, body });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.error) {
      const e = j.error || {};
      if (e.code === 190) die('열쇠(토큰)가 끝났거나 틀렸어요 — docs/insta-auto.md 「토큰 새로 넣기」대로 새 토큰을 넣어 주세요.');
      die(`인스타 API 오류 ${res.status}: ${e.message || JSON.stringify(j).slice(0, 300)}`);
    }
    return j;
  };

  const me = await call('GET', '/me', { fields: 'user_id,username' });
  const uid = me.user_id || me.id;
  const urls = Array.from({ length: meta.n }, (_, i) => `${base}/${meta.day}/${meta.file}/${i + 1}.jpg`);
  /* 한 장씩 「묶음 안 장」을 만들고 → 묶음(캐러셀)을 만들고 → 준비되면 게시. 한 장뿐이면 그냥 사진 게시물. */
  let creation;
  if (urls.length === 1) creation = (await call('POST', `/${uid}/media`, { image_url: urls[0], caption })).id;
  else {
    const kids = [];
    for (const u of urls) kids.push((await call('POST', `/${uid}/media`, { image_url: u, is_carousel_item: 'true' })).id);
    creation = (await call('POST', `/${uid}/media`, { media_type: 'CAROUSEL', children: kids.join(','), caption })).id;
  }
  for (let i = 0; i < 30; i++) {
    const st = await call('GET', `/${creation}`, { fields: 'status_code' });
    if (st.status_code === 'FINISHED') break;
    if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED') die(`인스타가 이미지를 못 받았어요(${st.status_code}). 이미지 주소: ${urls[0]}`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  const pub = await call('POST', `/${uid}/media_publish`, { creation_id: creation });
  await writeFile(join(dir, 'posted.json'), JSON.stringify({ id: pub.id, at: new Date().toISOString(), user: me.username }, null, 1));
  console.log(`✓ 올렸어요 — @${me.username} ${meta.day} ${meta.name} (${urls.length}장)`);
}
