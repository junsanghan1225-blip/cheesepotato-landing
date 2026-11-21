// 첫 화면(index.html)의 「책 코너」를 docs/shop.json 과 blog.js 에서 만든다(운영자 2026-10-27 「홈페이지 메인에 책 라인업 · 블로그」).
// index.html 의 <!-- hm-books:start --> ~ <!-- hm-books:end --> 사이만 바꾼다. 손으로 고치지 않는다 —
// 책 · 가격 · 링크는 docs/shop.json, 블로그 카드는 blog.js(앞에서 네 편)에서 온다. 고친 뒤 `node tools/build-home-books.mjs`
// (build-sheets · build-pages 가 끝에 같이 부른다).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOG_POSTS } from '../blog.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* 표지가 있는 책만 — 지금 살 수 있는 것(status on) 먼저, 곧 나올 것(planned)은 뒤에 */
const hasCover = (k) => k.coverImg && fs.existsSync(path.join(ROOT, k.coverImg.replace(/^\//, '')));
const on = SHOP.books.filter((k) => k.status === 'on' && hasCover(k));
const soon = SHOP.books.filter((k) => k.status === 'planned' && hasCover(k));
/* 첫 화면 카드는 148px 폭이라 300px 작은 표지(cover-sm.jpg, 약 16KB)를 쓴다 — 700px 원본(약 50KB)을 열 장 받던 것을 줄임(2026-10-27) */
const smPath = (k) => k.coverImg.replace(/^\//, '').replace(/cover\.jpg$/, 'cover-sm.jpg');
const src = (k) => (fs.existsSync(path.join(ROOT, smPath(k))) ? smPath(k) : k.coverImg.replace(/^\//, ''));

const card = (k, buy) => `<a class="hm-bk" href="shop/${esc(k.id)}/" data-ev="책클릭" data-ev-from="첫화면">
          <img src="${esc(src(k))}" alt="${esc(k.title.en)} — ${esc(k.title.ko)}" width="300" height="426" loading="lazy" decoding="async">
          <b>${esc(k.title.en)}</b><span class="hm-bk-ko">${esc(k.title.ko)}</span>
          ${buy ? `<em class="hm-bk-buy"><span class="hm-bk-px" data-px="${esc(k.price)}">$${esc(k.price)}</span> <span data-en="PDF · Buy →">PDF · 사기 →</span></em>` : `<em class="hm-bk-soon" data-en="Coming soon">곧 나와요</em>`}
        </a>`;

/* 갈래 = 시리즈(docs/shop.json series) — 책장 한 줄의 차례(운영자 2026-11-11 「시리즈별로 나열」) */
const GROUPS = (SHOP.series || []).map((g) => [g.id, g.title.ko, g.title.en, g.books]);

/* 책 묶음(status on)이 있으면 한 줄 안내 */
const bundle = (SHOP.bundles || []).filter((b) => b.status === 'on' && b.polar).map((b) => {
  const sum = b.books.reduce((a, id) => a + parseFloat(SHOP.books.find((k) => k.id === id).price), 0);
  return `<p class="hm-bundle"><a href="shop/#bundles" data-ev="책클릭" data-ev-from="첫화면-묶음"><b>${esc(b.title.en)}</b><span class="hm-bundle-r"><span class="hm-bk-px">$${esc(b.price)}</span> <s>$${sum.toFixed(2)}</s> · <span data-en="Buy the bundle →">묶음으로 사기 →</span></span></a></p>`;
}).join('');

const posts = BLOG_POSTS.slice(0, 4).map((p) => `<a class="hm-post" href="blog/${esc(p.id)}.html">
          <span class="hm-post-tag">${esc((p.tags || [])[0] || '')}</span>
          <b>${esc(p.title)}</b>
          <span class="hm-post-ex">${esc(p.excerpt || '')}</span>
        </a>`).join('\n        ');

/* 첫 화면 시안 3A(운영자 2026-11-21 「2B 3A 6 7」): 시리즈 서가 · 접은 시리즈 · 아래 상세 칸(같은 첫 책이 세 번 보였다)을 걷고
   판매 중인 책을 시리즈 차례대로 한 줄(가로로 넘김)에 — 표지 · 제목 · 가격. 누르면 책 쪽으로 바로(상세 칸이 없어 app.js 서가 클릭은 그냥 지나간다).
   예전 서가 · 상세 칸 코드는 git 기록에 있다(2026-11-21 앞) */
const order = [...new Set([...GROUPS.flatMap(([, , , ids]) => ids), ...on.map((k) => k.id)])].map((id) => on.find((k) => k.id === id)).filter(Boolean);
const shelf1 = `<div class="hm-shelf1" aria-label="한국어 워크북 ${order.length}권" data-en-aria="${order.length} Korean workbooks">
        ${order.map((k) => `<a class="hm-bk1" href="shop/${esc(k.id)}/" data-ev="책클릭" data-ev-from="첫화면-서가"><img src="${esc(src(k))}" alt="" width="300" height="426" loading="lazy" decoding="async"><b data-en="${esc(k.title.en)}">${esc(k.title.ko)}</b><span class="hm-bk-px" data-px="${esc(k.price)}">$${esc(k.price)}</span></a>`).join('\n        ')}
      </div>`;

const html = `<!-- hm-books:start — tools/build-home-books.mjs 가 만든다(손으로 고치지 않는다) -->
  <section class="section hm-books" id="hmBooks" aria-labelledby="hmBooksH">
    <div class="label" data-en="BOOKS · PDF WORKBOOKS">책 · PDF 워크북</div>
    <h2 class="section-title" id="hmBooksH" data-en="Workbooks you write in">써 가며 배우는 한국어 워크북</h2>
    <p class="hm-books-sub" data-en="Made by a Korean teacher for people who learn Korean in English. Answers included in every book, free online practice on the site, instant PDF download.">한국어 선생님이 만든 PDF 워크북이에요. 책마다 정답이 들어 있고, 사이트에서 무료로 더 연습할 수 있고, 결제하면 바로 내려받아요.</p>
    ${shelf1}
    <form class="lt-mail hm-lead" data-app-lead="home-books" novalidate>
      <div class="lt-mail-t" data-en="Three free sample PDFs. Leave your email to get them now and to hear when a new one is out.">무료 샘플 PDF 3권을 받아 보세요. 이메일을 남기면 바로 받고, 새 샘플이 나올 때도 알려 드려요.</div>
      <div class="lt-mail-r"><input type="email" name="email" autocomplete="email" inputmode="email" placeholder="이메일 주소" data-en-placeholder="Email address" aria-label="이메일 주소" data-en-aria="Email address" required><button type="submit" data-en="Get the samples">샘플 받기</button></div>
      <label class="lt-mail-c"><input type="checkbox" name="tips" checked> <span data-en="Free samples and study news now and then (stop any time)">새 무료 샘플 · 학습 소식을 가끔 받아요(언제든 그만 받기)</span></label>
      <p class="lt-mail-m" aria-live="polite"></p>
      <p class="hm-lead-dl"><span data-en="No email needed. Download now:">이메일 없이 바로 받기:</span> <a href="assets/books/first-steps-workbook/sample.pdf" download data-ev="샘플받기" data-ev-from="첫화면-첫걸음">첫걸음 · First Steps</a> · <a href="assets/books/topik1-vocab/sample.pdf" download data-ev="샘플받기" data-ev-from="첫화면-TOPIK1단어">TOPIK I 단어장</a> · <a href="assets/books/topik2-writing-51-52/sample.pdf" download data-ev="샘플받기" data-ev-from="첫화면-쓰기">TOPIK II 쓰기 51~52</a></p>
    </form>
    ${bundle}
    <p class="hm-bk-all"><a class="hm-bk-link" href="shop/" data-ev="책클릭" data-ev-from="첫화면-전체" data-en="See all books →">전체 책 보기 →</a></p>
    ${soon.length ? `<h3 class="hm-books-h" data-en="Coming soon">곧 나와요</h3>
    <div class="hm-bk-row hm-bk-row-soon" aria-label="곧 나올 책" data-en-aria="Coming soon">
        ${soon.map((k) => card(k, false)).join('\n        ')}
    </div>` : ''}
    <h3 class="hm-books-h" data-en="From the blog">블로그 · 책 이야기</h3>
    <div class="hm-post-row" aria-label="블로그 최신 글" data-en-aria="Latest blog posts">
        ${posts}
    </div>
    <p class="hm-bk-all"><a class="hm-bk-link" href="blog/" data-en="More articles →">블로그 더 보기 →</a></p>
  </section>
  <!-- hm-books:end -->`;

const file = path.join(ROOT, 'index.html');
const idx = fs.readFileSync(file, 'utf8');
const re = /<!-- hm-books:start[\s\S]*?<!-- hm-books:end -->/;
if (!re.test(idx)) throw new Error('index.html 에 hm-books:start ~ hm-books:end 표시가 없다');
const next = idx.replace(re, () => html);
if (process.argv.includes('--check')) {
  if (next !== idx) { console.error('index.html 의 책 코너가 자료(docs/shop.json · blog.js)와 다르다 — node tools/build-home-books.mjs'); process.exit(1); }
  console.log('첫 화면 책 코너 검사 — 통과');
  process.exit(0);
}
if (next !== idx) fs.writeFileSync(file, next);
console.log(`첫 화면 책 코너: 판매 ${on.length}권 · 곧 ${soon.length}권 · 블로그 카드 4장${next !== idx ? ' (index.html 고침)' : ' (그대로)'}`);
