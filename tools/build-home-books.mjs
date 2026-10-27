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
const src = (k) => k.coverImg.replace(/^\//, '');

const card = (k, buy) => `<a class="hm-bk" role="listitem" href="shop/${esc(k.id)}/" data-ev="책클릭" data-ev-from="첫화면">
          <img src="${esc(src(k))}" alt="${esc(k.title.en)} — ${esc(k.title.ko)}" width="700" height="995" loading="lazy" decoding="async">
          <b>${esc(k.title.en)}</b><span class="hm-bk-ko">${esc(k.title.ko)}</span>
          ${buy ? `<em class="hm-bk-buy"><span class="hm-bk-px">$${esc(k.price)}</span> <span data-en="PDF · Buy →">PDF · 사기 →</span></em>` : `<em class="hm-bk-soon" data-en="Coming soon">곧 나와요</em>`}
        </a>`;

const posts = BLOG_POSTS.slice(0, 4).map((p) => `<a class="hm-post" role="listitem" href="blog/${esc(p.id)}.html">
          <span class="hm-post-tag">${esc((p.tags || [])[0] || '')}</span>
          <b>${esc(p.title)}</b>
          <span class="hm-post-ex">${esc(p.excerpt || '')}</span>
        </a>`).join('\n        ');

const html = `<!-- hm-books:start — tools/build-home-books.mjs 가 만든다(손으로 고치지 않는다) -->
  <section class="section hm-books" id="hmBooks" aria-labelledby="hmBooksH">
    <div class="label" data-en="BOOKS · PDF WORKBOOKS">책 · PDF 워크북</div>
    <h2 class="section-title" id="hmBooksH" data-en="Workbooks you write in">써 가며 배우는 한국어 워크북</h2>
    <p class="hm-books-sub" data-en="Made by a Korean teacher for people who learn Korean in English. Answers included in every book, free online practice on the site, instant PDF download.">한국어 선생님이 만든 PDF 워크북이에요. 책마다 정답이 들어 있고, 사이트에서 무료로 더 연습할 수 있고, 결제하면 바로 내려받아요.</p>
    <div class="hm-bk-row" role="list" aria-label="판매 중인 책" data-en-aria="Books on sale">
        ${on.map((k) => card(k, true)).join('\n        ')}
    </div>
    <p class="hm-bk-all"><a class="hero-go" href="shop/" data-ev="책클릭" data-ev-from="첫화면-전체" data-en="See all books →">전체 책 보기 →</a></p>
    <h3 class="hm-books-h" data-en="Coming soon">곧 나와요</h3>
    <div class="hm-bk-row hm-bk-row-soon" role="list" aria-label="곧 나올 책" data-en-aria="Coming soon">
        ${soon.map((k) => card(k, false)).join('\n        ')}
    </div>
    <h3 class="hm-books-h" data-en="From the blog">블로그 · 책 이야기</h3>
    <div class="hm-post-row" role="list" aria-label="블로그 최신 글" data-en-aria="Latest blog posts">
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
