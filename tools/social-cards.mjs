// 쓰레드 · 인스타 · 커뮤니티에 올릴 책 홍보 그림(1080×1350, 4:5)을 만든다(운영자 2026-10-27 「쓰레드에 책 홍보 글」).
//   node tools/social-cards.mjs <나가는 폴더>
// 책 표지 색 띠 + 표지 + 한 줄 이득 + 주소. 글은 docs/shop-copy.json 의 headline, 표지는 assets/books/<id>/cover.jpg. 생성물은 저장소에 올리지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2];
if (!out) { console.error('쓰는 법: node tools/social-cards.mjs <폴더>'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const shop = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const copy = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop-copy.json'), 'utf8'));
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const img = (id) => `data:image/jpeg;base64,${fs.readFileSync(path.join(ROOT, `assets/books/${id}/cover.jpg`)).toString('base64')}`;
const colors = (id) => { try { const c = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8')).coverLevel; return [c.bg, c.bg2 || c.bg]; } catch { return ['#3B1F6E', '#2A1650']; } };
const book = (id) => shop.books.find((b) => b.id === id);

const CSS = `*{box-sizing:border-box;margin:0}body{width:1080px;height:1350px;font-family:'Pretendard Variable',Pretendard,'Noto Sans KR',sans-serif;letter-spacing:-.01em;color:#fff;position:relative;overflow:hidden}
.top{position:absolute;left:70px;right:70px;top:70px}.k{font-size:30px;font-weight:800;letter-spacing:.12em;opacity:.85}.h{font-size:72px;line-height:1.12;font-weight:900;margin-top:22px;word-break:keep-all}
.cv{position:absolute;left:50%;transform:translateX(-50%);bottom:190px}.cv img{display:block;border-radius:6px 16px 16px 6px;box-shadow:0 30px 70px rgba(0,0,0,.5)}
.ft{position:absolute;left:70px;right:70px;bottom:60px;display:flex;justify-content:space-between;align-items:center;font-size:34px;font-weight:800}.chip{background:#FFD23F;color:#3A2600;border-radius:99px;padding:12px 28px}
.row{position:absolute;left:0;right:0;bottom:190px;display:flex;justify-content:center;gap:26px}.row img{width:300px;border-radius:5px 12px 12px 5px;box-shadow:0 24px 50px rgba(0,0,0,.45)}`;
const FONT = `<link rel="stylesheet" href="file://${path.join(ROOT, 'vendor/pretendard.css')}">`;   // 사이트와 같은 Pretendard(한국어 글꼴) — 없으면 한글이 기본 글꼴로 나와 어색하다
const wrap = (c1, c2, inner) => `<!doctype html><meta charset="utf-8">${FONT}<style>${CSS}body{background:linear-gradient(160deg,${c1},${c2})}</style>${inner}`;
const single = (id, hook, chipText, k) => { const b = book(id); const [c1, c2] = colors(id); const w = id === 'topik2-vocab-lv3' || true ? 470 : 470; return wrap(c1, c2, `<div class="top"><div class="k">${e(k || b.level + ' · PDF WORKBOOK')}</div><div class="h">${e(hook)}</div></div><div class="cv"><img src="${img(id)}" width="${w}"></div><div class="ft"><span>everykoreans.com/shop</span><span class="chip">${e(chipText || '$' + b.price)}</span></div>`); };
const multi = (ids, hook, chipText, k) => { const [c1, c2] = colors(ids[0]); return wrap(c1, c2, `<div class="top"><div class="k">${e(k)}</div><div class="h">${e(hook)}</div></div><div class="row">${ids.map((i) => `<img src="${img(i)}" style="width:${ids.length > 3 ? 228 : 300}px">`).join('')}</div><div class="ft"><span>everykoreans.com/shop</span><span class="chip">${e(chipText)}</span></div>`); };

const cards = {
  '01_intro': multi(['first-steps-workbook', 'particles-workbook', 'topik2-vocab-1000', 'topik2-writing-51-52'], 'Korean workbooks you write in.', 'PDF · from $6.90', 'BY A KOREAN TEACHER'),
  '02_vocab-method': single('topik2-vocab-1000', 'A week later, half of the word list is gone. Write it instead.', '$6.90', 'TOPIK II VOCABULARY'),
  '03_free-sample': single('topik2-vocab-lv3', 'Free sample: 20 pages. No email needed.', 'FREE SAMPLE', 'TOPIK II VOCABULARY 3'),
  '04_particles': single('particles-workbook', '은/는 vs 이/가: one question, not ten rules.', '$9.90', 'KOREAN PARTICLES'),
  '05_writing-51-52': single('topik2-writing-51-52', 'TOPIK II 51 & 52: match the style of the passage exactly.', '$6.90', 'TOPIK II WRITING'),
  '06_bundle': multi(['topik2-vocab-1000', 'topik2-vocab-2000', 'topik2-vocab-lv3'], '3 vocabulary workbooks. 2,940 words.', '$14.90 · save 28%', 'TOPIK II BUNDLE'),
  '08_teachers': wrap('#14264A', '#0B1A33', `<div class="top"><div class="k">FOR KOREAN TEACHERS · 한국어 선생님께</div><div class="h">Free homework &amp; progress tool for your class.</div></div><div style="position:absolute;left:70px;right:70px;top:520px;font-size:44px;line-height:1.5;font-weight:700">📚 Homework in two taps<br>📊 Who did it, at a glance<br>🔗 Students join with one QR scan<br>🆓 Free for teachers · Pro free for your students</div><div class="ft"><span>everykoreans.com/for-teachers.html</span><span class="chip">FREE</span></div>`),
  '07_idioms-soon': single('korean-idioms', '하늘의 별 따기: plucking stars from the sky.', 'COMING SOON', 'ESSENTIAL KOREAN IDIOMS'),
};
const PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);
const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const pg = await br.newPage({ viewport: { width: 1080, height: 1350 } });
for (const [n, html] of Object.entries(cards)) {
  const f = path.join(out, `_${n}.html`); fs.writeFileSync(f, html);
  await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
  await pg.screenshot({ path: path.join(out, `${n}.png`) }); fs.rmSync(f);
}
await br.close();
console.log(`홍보 그림 ${Object.keys(cards).length}장 → ${out}`);
