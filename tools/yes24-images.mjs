// 예스24 상세이미지 10장 + 카드뉴스 8장을 책 한 권마다 같은 틀로 찍는다(운영자 2026-11-16 「첫걸음 워크북 상세페이지랑 예스24 다시 다 재등록」).
// 하루 한 권 검수 계획(docs/todo.md)의 ⓒ — 조사 워크북 때 손으로 하던 것을 도구로.
//   node tools/yes24-images.mjs <책 id> --cover <앞표지 jpg> --out <폴더>
// 읽는 것: docs/shop.json 의 그 책(title · sub · page.headline · lead · detail · specs · author) — 사이트 책 쪽 「이 책은 이렇게」와 같은 글 · 같은 그림(assets/books/<id>/detail/*.jpg).
// 만드는 것: <out>/detail/01.jpg ~ 10.jpg(가로 940 · 예스24 칸마다 3MB 이하) · <out>/cardnews_<짧은 이름>.zip(안에 폴더 <짧은 이름>_cardnews/ · 01~08.jpg · 1080×1080)
//   · <out>/detail.json(칸마다 「이미지 설명」 — 복사판이 읽는다).
// 모양은 「선생님의 워크북」: 종이 바탕 · 검정 글자 · 책 색은 한 곳만 · 얇은 줄 · 작은 모서리. 이모지 · 그림자 · 그라데이션 없음.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2);
const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
const id = a.find((x) => !x.startsWith('--') && x !== opt('--cover') && x !== opt('--out'));
const OUT = path.resolve(opt('--out') || path.join(ROOT, 'books-out/yes24', id || ''));
if (!id) { console.error('쓰는 법: node tools/yes24-images.mjs <책 id> [--cover <앞표지.jpg>] [--out <폴더>]'); process.exit(1); }
const shop = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const k = shop.books.find((b) => b.id === id); if (!k) { console.error(`docs/shop.json 에 「${id}」 없음`); process.exit(1); }
const g = k.page || {}; if (!g.detail?.length) { console.error(`「${id}」 에 page.detail(이 책은 이렇게)이 없다 — 사이트 책 쪽 구간부터 만든다`); process.exit(1); }
let frame = {}; try { frame = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8')); } catch {}
const INK = frame.coverLevel?.bg || k.color || '#1F1B16';     // 책 색 — 표지 바탕색(포인트 한 곳에만)
const short = id.replace(/-workbook$/, '').replace(/[^a-z0-9]+/g, '_');
const img = (p) => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64');
const cover = img(path.resolve(opt('--cover') || path.join(ROOT, k.coverImg.replace(/^\//, ''))));
const det = (n) => img(path.join(ROOT, `assets/books/${id}/detail/${n}.jpg`));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const spec = Object.fromEntries((g.specs || []).map(([x, y]) => [x.split(' · ')[0], y]));
const units = spec.Units || '', pages = spec.Pages || '';
/* 글꼴: 책과 같은 Pretendard — 설치돼 있지 않은 곳(이 서버 등)은 --font <PretendardVariable.ttf> 로 파일을 넘기면 그림 안에 넣는다 */
const FONT = opt('--font') || process.env.PRETENDARD_TTF;
const fontSrc = FONT && fs.existsSync(FONT) ? `url(data:font/ttf;base64,${fs.readFileSync(FONT).toString('base64')})` : "local('Pretendard Variable'),local('Pretendard'),local('Noto Sans CJK KR')";
if (!FONT) console.warn('⚠ --font 없음 — 설치된 Pretendard 를 찾는다(없으면 다른 글꼴로 찍힌다)');
const ko = (o) => (o && typeof o === 'object' ? o.ko : o) || '';
// 책 정보 표: 「영어 · 한국어」 칸은 한국어만, 숫자 칸(판형 · ISBN)은 그대로
const specKo = ([x, y]) => [x.split(' · ')[1] || x, /^(Format|Language|Publisher)/.test(x) ? y.split(' · ').slice(-1)[0] : /^Size/.test(x) ? y.replace(/, prints on A4 too · /, ' · ') : /^Pages/.test(x) ? `${y}쪽` : y];

const CSS = `@font-face{font-family:'P';font-weight:45 920;src:${fontSrc}}
*{box-sizing:border-box;margin:0;word-break:keep-all}body{background:#F7F3EA;color:#1F1B16;font-family:'P','Pretendard Variable',sans-serif;-webkit-font-smoothing:antialiased}
.s{width:940px;padding:56px 60px;background:#F7F3EA;border-bottom:1px solid #DDD5C4}
.no{display:inline-block;font:700 15px/1 'P';letter-spacing:.08em;border:1.5px solid #1F1B16;border-radius:5px;padding:7px 10px}
h2{font:800 40px/1.25 'P';letter-spacing:-.02em;margin:22px 0 12px}h2 em{font-style:normal;color:${INK}}
.sub{font:500 21px/1.65 'P';color:#4A4237}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:30px}.pair figure{background:#fff;border:1px solid #DDD5C4;border-radius:8px;overflow:hidden}
.pair figcaption{font:700 16px/1.3 'P';padding:12px 14px;border-bottom:1px solid #EAE3D4;display:flex;gap:8px;align-items:center}.pair figcaption i{font-style:normal;font:800 13px/1 'P';color:#fff;background:#1F1B16;border-radius:5px;padding:4px 6px}
.pair img{display:block;width:100%}
table{width:100%;border-collapse:collapse;margin-top:26px;font:500 19px/1.5 'P'}td,th{border-top:1px solid #DDD5C4;padding:14px 8px;text-align:left;vertical-align:top}th{width:30%;font-weight:700;color:#4A4237}tr:last-child td,tr:last-child th{border-bottom:1px solid #DDD5C4}
ol.road{list-style:none;padding:0;margin-top:26px;border-top:1.5px solid #1F1B16}ol.road li{display:grid;grid-template-columns:200px 1fr;gap:16px;padding:16px 4px;border-bottom:1px solid #DDD5C4}ol.road b{font:800 19px/1.4 'P'}ol.road span{font:500 18px/1.55 'P'}ol.road em{display:block;font:600 15px/1.4 'P';font-style:normal;color:${INK};margin-top:4px}
.hero{display:grid;grid-template-columns:330px 1fr;gap:44px;align-items:center}.hero img{width:100%;border-radius:5px;border:1px solid #DDD5C4}
.kick{font:700 16px/1 'P';letter-spacing:.12em;color:#7A705F}.hero h1{font:900 46px/1.2 'P';letter-spacing:-.03em;margin:14px 0 10px}.hero .t2{font:700 24px/1.45 'P';color:${INK};margin-bottom:22px}.hero p{font:500 20px/1.7 'P';color:#4A4237}
.nums{display:grid;grid-template-columns:repeat(4,1fr);border-top:1.5px solid #1F1B16;border-bottom:1px solid #DDD5C4;margin-top:34px}.nums div{padding:18px 6px;border-left:1px solid #DDD5C4}.nums div:first-child{border-left:0}.nums b{display:block;font:900 38px/1.1 'P'}.nums span{font:600 16px/1.4 'P';color:#4A4237}
.bio{display:grid;grid-template-columns:1fr;gap:10px;margin-top:22px;font:500 20px/1.75 'P';color:#2E2820}
.c{width:1080px;height:1080px;padding:84px;background:#F7F3EA;display:flex;flex-direction:column;position:relative;overflow:hidden}
.c .top{display:flex;justify-content:space-between;font:700 20px/1 'P';letter-spacing:.1em;color:#7A705F}.c h3{font:900 64px/1.18 'P';letter-spacing:-.03em;margin:46px 0 22px}.c h3 em{font-style:normal;color:${INK}}.c .cs{font:500 28px/1.6 'P';color:#4A4237}
.c .shot{margin-top:auto;height:520px;border:1px solid #DDD5C4;border-radius:8px;overflow:hidden;background:#fff}.c .shot img{width:100%;display:block}
.c .bar{position:absolute;left:84px;right:84px;bottom:46px;display:flex;justify-content:space-between;font:700 20px/1 'P';color:#7A705F}`;

const D = g.detail;
const pairSec = (d) => `<div class="s"><span class="no">${esc(d.no)}</span><h2>${esc(d.h.ko)}</h2>${d.sub ? `<p class="sub">${esc(d.sub.ko)}</p>` : ''}${d.images ? `<div class="pair">${d.images.map(([n, c], i) => `<figure><figcaption><i>${String(i + 1).padStart(2, '0')}</i>${esc(c.ko)}</figcaption><img src="${det(n)}"></figure>`).join('')}</div>` : ''}${d.road ? `<ol class="road">${d.road.map(([, b, c, e]) => `<li><b>${esc(b)}</b><span>${esc(ko(c))}${e ? `<em>${esc(ko(e))}</em>` : ''}</span></li>`).join('')}</ol>` : ''}</div>`;
const numsOf = () => [[units, '단원'], [pages, '쪽'], [(g.detail.find((d) => d.road)?.road.length || 2) - 2, '부'], ['정답', '찾아보기 · QR']].filter(([x]) => x !== '' && x !== -2);
const DETAIL = [
  [`${ko(k.title)} · ${ko(g.headline) || ko(k.sub)}`, `<div class="s"><div class="hero"><img src="${cover}"><div><div class="kick">EVERYKOREANS · ${esc(k.level || '')}</div><h1>${esc(ko(k.title))}</h1><div class="t2">${esc(ko(g.headline) || ko(k.sub))}</div><p>${esc(ko(g.lead) || ko(k.about))}</p></div></div></div>`],
  ['이 책 한눈에 · 이런 분께', `<div class="s"><span class="no">한눈에</span><h2>이 책 <em>한눈에</em></h2><div class="nums">${numsOf().map(([x, y]) => `<div><b>${esc(x)}</b><span>${esc(y)}</span></div>`).join('')}</div><table>${(k.for?.ko || []).map((x, i) => `<tr><th>이런 분께 ${i + 1}</th><td>${esc(x)}</td></tr>`).join('')}</table></div>`],
  ...D.map((d) => [`${d.h.ko}${d.images ? ' · ' + d.images.map(([, c]) => c.ko).join(' · ') : ''}`, pairSec(d)]),
  ['지은이 소개', `<div class="s"><span class="no">지은이</span><h2>${esc(ko(g.author?.name))} <em>(${esc(g.author?.name?.en || '')})</em></h2><div class="bio"><p>${esc(ko(g.author?.bio))}</p></div></div>`],
  ['책 정보', `<div class="s"><span class="no">책 정보</span><h2>책 정보</h2><table>${(g.specs || []).map(specKo).map(([x, y]) => `<tr><th>${esc(x)}</th><td>${esc(y)}</td></tr>`).join('')}</table></div>`],
].slice(0, 10);
// 구간이 적은 책은 10장보다 적게 — 예스24 상세이미지 칸은 비워 둬도 된다(같은 그림을 두 번 넣지 않는다)

const CARDS = [
  `<div class="c" style="justify-content:center"><div class="top"><span>EVERYKOREANS</span><span>${esc(k.level || '')}</span></div><div style="display:grid;grid-template-columns:400px 1fr;gap:56px;align-items:center;margin-top:60px"><img src="${cover}" style="width:100%;border-radius:5px;border:1px solid #DDD5C4"><div><h3 style="margin:0 0 20px;font-size:54px">${esc(ko(k.title))}</h3><p class="cs">${esc(ko(g.headline) || ko(k.sub))}</p></div></div></div>`,
  `<div class="c"><div class="top"><span>${esc(ko(k.title))}</span><span>02</span></div><h3>이 책 <em>한눈에</em></h3><div class="nums" style="margin-top:20px">${numsOf().map(([x, y]) => `<div><b style="font-size:52px">${esc(x)}</b><span style="font-size:22px">${esc(y)}</span></div>`).join('')}</div><p class="cs" style="margin-top:40px">${esc(ko(g.lead) || ko(k.about))}</p><table style="font-size:25px;margin-top:auto">${(k.for?.ko || []).map((x) => `<tr><th style="width:22%">이런 분께</th><td>${esc(x)}</td></tr>`).join('')}</table></div>`,
  ...D.filter((d) => d.images).slice(0, 5).map((d, i) => `<div class="c"><div class="top"><span>${esc(ko(k.title))}</span><span>${String(i + 3).padStart(2, '0')}</span></div><h3>${esc(d.h.ko)}</h3>${d.sub ? `<p class="cs">${esc(d.sub.ko)}</p>` : ''}<div class="shot"><img src="${det((d.images[1] || d.images[0])[0])}" style="margin-top:-40px"></div></div>`),
  `<div class="c"><div class="top"><span>${esc(ko(k.title))}</span><span>${String(Math.min(D.filter((d) => d.images).length, 5) + 3).padStart(2, '0')}</span></div><h3>책 정보</h3><table style="font-size:26px">${(g.specs || []).slice(0, 7).map(specKo).map(([x, y]) => `<tr><th>${esc(x)}</th><td>${esc(y)}</td></tr>`).join('')}</table><div class="bar"><span>everykoreans.com</span><span>${esc(g.author?.name?.ko || '')} 지음</span></div></div>`,
].slice(0, 8);

fs.rmSync(OUT, { recursive: true, force: true });
const CN = path.join(OUT, `${short}_cardnews`);
fs.mkdirSync(path.join(OUT, 'detail'), { recursive: true }); fs.mkdirSync(CN, { recursive: true });
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');   // smoke.mjs 와 같은 곳
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
const shoot = async (html, w, file, maxKB) => {
  await page.setViewportSize({ width: w, height: 800 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${html}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('body > *');
  for (const q of [88, 80, 70, 60]) {                 // 예스24 크기 제한 안으로(상세 3MB · 카드뉴스 500KB)
    await el.screenshot({ path: file, type: 'jpeg', quality: q });
    if (fs.statSync(file).size <= maxKB * 1024) break;
  }
};
const meta = [];
for (const [i, [desc, html]] of DETAIL.entries()) {
  const f = path.join(OUT, 'detail', `${String(i + 1).padStart(2, '0')}.jpg`); await shoot(html, 940, f, 2900);
  meta.push({ file: path.basename(f), desc, kb: Math.round(fs.statSync(f).size / 1024) });
}
for (const [i, html] of CARDS.entries()) await shoot(html, 1080, path.join(CN, `${short}_cardnews_${String(i + 1).padStart(2, '0')}.jpg`), 490);
await browser.close();
fs.writeFileSync(path.join(OUT, 'detail.json'), JSON.stringify(meta, null, 1) + '\n');
execFileSync('zip', ['-qr', `cardnews_${short}.zip`, `${short}_cardnews`], { cwd: OUT });
console.log(`${id}: 상세이미지 ${meta.length}장 · 카드뉴스 ${CARDS.length}장 → ${OUT}`);
for (const m of meta) console.log(`  ${m.file} ${m.kb}KB · ${m.desc}`);
