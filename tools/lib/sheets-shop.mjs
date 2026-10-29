/* build-sheets.mjs 에서 갈라낸 상점 쪽 — 상점 목록 · 책 쪽 · 감사 쪽 · 샘플 상자(운영자 2026-10-27 「코드 정리」).
   build-sheets 가 init() 로 공통 도구(head · foot · sheets)를 넘겨 주고, 쪽 글은 거기서 받아 쓴다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const esc = (x) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let head, foot, sheets;
export function init(d) { ({ head, foot, sheets } = d); }

/* ── 상점(/shop/) — 1인 출판사 온라인 서점(운영자 2026-10-17 「상점 페이지부터」 · 「1인 출판 온라인 서점 페이지」) ──
   자료는 docs/shop.json, 책 계획은 docs/plans/books.md. 학습지 쪽은 무료 그대로 두고, 파는 것은 인쇄용 PDF(학습지 + 정답지 · 묶음)와 앞으로 낼 책.
   결제는 이미 쓰는 Polar 의 「한 번 사는 상품 + 파일 다운로드」— 링크(buy.polar.sh)가 없는 상품은 「준비 중」으로만 보인다.
   파는 파일(PDF)은 공개 저장소에 두지 않는다(누구나 받아 갈 수 있으니) — Polar 상품에 올린다.
   책 표지는 그림 파일 없이 CSS 로 그린다(제목 · 시리즈 색 · 급) — 진짜 표지가 나오면 cover 칸에 그림 경로를 넣는다. */
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const POLAR = /^https:\/\/buy\.polar\.sh\/[A-Za-z0-9_-]+$/;
const pub = SHOP.publisher;
/* 학습지 쪽 → 그 학습지가 단원으로 들어 있는 책 카드(운영자 2026-10-27 「학습지 받은 사람에게 책 안내」). 책 틀(docs/books/<id>.json)에 학습지 id 가 있으면 그 책. */
const BOOK_AD_CSS = `<style>.bk-ad{display:flex;gap:16px;align-items:center;margin:22px 0;padding:14px 16px;border:1px solid var(--line);border-radius:8px;background:var(--tint)}.bk-ad img{width:84px;height:auto;aspect-ratio:700/995;border-radius:2px 6px 6px 2px;box-shadow:0 6px 14px rgba(0,0,0,.18);flex:none}.bk-ad p{margin:2px 0 8px;font-size:14px;line-height:1.5}.bk-ad .btns{display:flex;gap:8px;flex-wrap:wrap}.bk-ad b.bk-ad-h{font-size:13px;color:var(--orange-deep)}@media print{.bk-ad{display:none}}</style>\n`;
const frameIsbn = (id) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8')).isbn || ''; } catch { return ''; } };
const ADMAP = { 'korean-particles': ['particles-workbook', 'first-steps-workbook'] };
const FRAME_TXT = new Map(SHOP.books.filter((k) => k.status === 'on').map((k) => [k.id, (() => { try { return fs.readFileSync(path.join(ROOT, `docs/books/${k.id}.json`), 'utf8'); } catch { return ''; } })()]));
function bookAd(w) {
  const ids = ADMAP[w.id] || [...FRAME_TXT].filter(([, tx]) => tx.includes(`"${w.id}"`)).map(([id]) => id);
  const k = ids.map((id) => SHOP.books.find((b) => b.id === id)).find((b) => b && b.status === 'on' && b.coverImg);
  if (!k) return '';
  const base = `/shop/${k.id}/`;
  return `<aside class="bk-ad no-print"><img src="${esc(k.coverImg)}" alt="${esc(k.title.en)}" width="700" height="995" loading="lazy"><div><b class="bk-ad-h">PART OF A BOOK · 책으로 보기</b><p>This worksheet is one of the units in <a href="${base}"><b>${esc(k.title.en)}</b></a> — more practice, a study plan and an answer key for every unit, as one PDF.</p><div class="btns">${k.sample ? `<a class="btn main" href="${base}#sample" data-ev="책클릭" data-ev-from="학습지-${esc(w.id)}">Free sample</a>` : ''}<a class="btn sub" href="${base}" data-ev="책클릭" data-ev-from="학습지-${esc(w.id)}">See the book · $${esc(k.price)}</a></div></div></aside>\n`;
}

/* 문법 학습지 묶음(p.ws = beginner · intermediate · advanced) — 목록은 worksheet/list.json(build-worksheets 가 만든다). 학습지 쪽은 /worksheet/<id>.html */
const GRAM = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'worksheet/list.json'), 'utf8')); } catch (e) { return []; } })();
const packSheets = (p) => p.ws
  ? GRAM.filter((x) => x.l === p.ws).map((x) => ({ id: x.id, href: `/worksheet/${x.id}.html`, title: { en: x.n, ko: x.c }, level: p.ws }))
  : sheets.filter((w) => p.level === 'all' || w.level === p.level);
const WS_LV = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
/* 책 목차 — 워크북은 그 급 학습지 제목이 곧 단원(자료에서 바로), 나머지는 shop.json 의 toc */
const bookToc = (k) => k.sheets ? sheets.filter((w) => w.level === k.sheets).map((w, i) => ({ en: `Unit ${i + 1}. ${w.title.en}`, ko: w.title.ko, u: `/${w.id}-worksheet/` })) : (k.toc || []);
const buy = (url, price, label) => url
  ? `<a class="btn main" href="${esc(url)}" rel="noopener">${esc(label)} · $${esc(price)}</a>`
  : `<span class="btn sub shop-soon" aria-disabled="true">Coming soon · 준비 중</span>`;
const cover = (k, big) => k.coverImg ? `<div class="bk-cover bk-img${big ? ' big' : ''}"><img src="${esc(k.coverImg)}" alt="${esc(k.title.ko)} — ${esc(k.title.en)}" width="700" height="995"${big ? '' : ' loading="lazy"'}></div>` : `<div class="bk-cover${big ? ' big' : ''}" style="--c:${esc(k.color)}"><span class="bk-ser">${esc(k.series === 'topik' ? 'TOPIK SERIES' : 'WORKBOOK SERIES')}</span><b>${esc(k.title.ko)}</b><i>${esc(k.title.en)}</i><span class="bk-lv">${esc(k.level)}</span><span class="bk-pub">${esc(pub.en)}</span></div>`;
const STATUS = { planned: ['Coming soon', '출간 예정'], on: ['Available', '판매 중'] };
const SHOP_CSS = `<style>
.shop-hero{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:6px 0 14px;border-bottom:2px solid var(--ink);margin-bottom:8px}
.shop-hero b{font-size:15px;letter-spacing:.5px}.shop-hero small{color:var(--ink-3)}
.shop-nav{display:flex;gap:14px;flex-wrap:wrap;font-size:14px;font-weight:700;margin:10px 0 4px}.shop-nav a{color:var(--ink);text-decoration:none}
.bk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:22px 18px;margin:18px 0}
.bk-item{text-decoration:none;color:var(--ink)}.bk-item:hover .bk-cover{transform:translateY(-3px)}
.bk-item h3{font-size:15px;margin:10px 0 2px;line-height:1.35}.bk-item p{margin:0;font-size:13px;color:var(--ink-3)}
.bk-badge{display:inline-block;font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;background:var(--tint);margin-top:6px}
.bk-cover{position:relative;aspect-ratio:182/257;border-radius:3px 8px 8px 3px;background:var(--c);color:#fff;padding:16px 14px 14px 20px;display:flex;flex-direction:column;box-shadow:inset 6px 0 0 rgba(0,0,0,.18),0 10px 22px rgba(0,0,0,.18);transition:transform .2s;overflow:hidden}
.bk-cover:after{content:'';position:absolute;right:-30%;bottom:-18%;width:90%;aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.12)}
.bk-cover.bk-img{padding:0;background:none;overflow:hidden}.bk-cover.bk-img:after{display:none}.bk-cover.bk-img img{display:block;width:100%;height:100%;object-fit:cover}
.pg-head{background:var(--tint);border-radius:10px;padding:20px 22px;margin:22px 0}.pg-head h2{border:0;padding:0;margin:0 0 6px;font-size:22px;line-height:1.35;word-break:keep-all}.pg-head p{margin:6px 0 0}
.pg-feat{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}.pg-feat div{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:14px}.pg-feat b{display:block;font-size:15px;margin:6px 0 4px}.pg-feat span{font-size:13px;color:var(--ink-3);line-height:1.55}.pg-feat i{font-style:normal;font-size:24px}
.pg-toc{border:1px solid var(--line);border-radius:8px;overflow:hidden;margin:12px 0}.pg-toc h3{margin:0;padding:10px 16px;background:var(--tint);font-size:14px}.pg-toc div{display:flex;justify-content:space-between;gap:10px;padding:8px 16px;border-top:1px solid var(--line);font-size:14px}.pg-toc em{font-style:normal;color:var(--ink-3);white-space:nowrap}
.pg-pv{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.pg-pv a{display:block;text-decoration:none;color:var(--ink);font-size:12px}.pg-pv img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.08)}.pg-pv span{display:block;margin-top:4px}
.fz{position:fixed;inset:0;z-index:90;background:rgba(10,12,18,.92);display:flex;align-items:center;justify-content:center;padding:16px 16px 76px}.fz img{width:auto;height:auto;max-width:min(100%,900px);max-height:calc(100vh - 100px);object-fit:contain;background:#fff;border-radius:4px}.fz-x{position:absolute;top:10px;right:12px;width:44px;height:44px;border:1px solid rgba(255,255,255,.5);border-radius:8px;background:transparent;color:#fff;font-size:26px;line-height:1;cursor:pointer}.fz-b{position:absolute;bottom:14px;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:16px;color:#fff;font-size:14px}.fz-b button{width:48px;height:44px;border:1px solid rgba(255,255,255,.6);border-radius:8px;background:transparent;color:#fff;font-size:24px;line-height:1;cursor:pointer}
.lb{display:none;position:fixed;inset:0;z-index:50;background:rgba(10,12,18,.88);align-items:center;justify-content:center;padding:16px}.lb:target{display:flex}.lb img{width:auto;height:auto;max-width:100%;max-height:calc(100vh - 90px);object-fit:contain;border-radius:6px;background:#fff}.lb .lbn{position:absolute;bottom:14px;left:0;right:0;display:flex;justify-content:center;gap:10px}.lb .lbn span{color:#fff;align-self:center;font-size:13px}.lb .lbn a{color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:8px;padding:8px 16px;text-decoration:none;font-size:14px}.lb .lbx{position:absolute;top:10px;right:14px;color:#fff;font-size:30px;text-decoration:none;line-height:1}
.pg-author{display:flex;gap:14px;align-items:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:16px;margin:12px 0}.pg-author b{font-size:17px}.pg-author p{margin:4px 0 0}
.pg-faq details{border-top:1px solid var(--line);padding:10px 0}.pg-faq summary{cursor:pointer;font-weight:700}.pg-faq p{margin:8px 0 0}
@media (max-width:700px){.pg-feat{grid-template-columns:1fr}.pg-pv{grid-template-columns:repeat(2,1fr)}.pg-head h2{font-size:19px}}
.bk-ser{font-size:9px;font-weight:800;letter-spacing:1.5px;opacity:.85}
.bk-cover b{font-size:19px;line-height:1.25;margin-top:12px;word-break:keep-all}
.bk-cover i{font-style:normal;font-size:11px;opacity:.9;margin-top:6px;line-height:1.35}
.bk-lv{margin-top:auto;align-self:flex-start;font-size:11px;font-weight:800;background:#fff;color:var(--c);padding:3px 9px;border-radius:8px;position:relative;z-index:1}
.bk-pub{font-size:9px;opacity:.85;margin-top:8px;position:relative;z-index:1}
.bk-cover.big{width:240px;flex:none}.bk-cover.big b{font-size:28px}.bk-cover.big i{font-size:14px}.bk-cover.big .bk-ser,.bk-cover.big .bk-pub{font-size:11px}.bk-cover.big .bk-lv{font-size:13px}
.bk-detail{display:flex;gap:28px;align-items:flex-start;margin:18px 0}
.lead-box{margin:18px 0;padding:14px 16px;border:1px solid var(--line);border-radius:8px;background:var(--tint)}.lead-box>b{font-size:15px}.lead-box p{margin:4px 0 10px;font-size:13.5px;color:var(--ink-2)}.lead-row{display:flex;gap:8px;flex-wrap:wrap}.lead-row input[type=email]{flex:1 1 200px;min-width:0;padding:11px 12px;border:1px solid var(--line);border-radius:7px;font:inherit;font-size:15px;background:var(--surface);color:var(--ink)}.lead-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}.lead-tips{display:flex;gap:8px;align-items:flex-start;margin:10px 0 0;font-size:12.5px;color:var(--ink-3);cursor:pointer}.lead-tips input{margin-top:2px}.lead-msg{min-height:1.2em;margin:8px 0 0!important}.lead-msg.ok{color:#1b7a3a}.lead-msg.bad{color:#b3261e}.lead-dl{display:inline-block;margin-top:6px;font-size:14px;font-weight:700;color:var(--orange-deep)}
.bk-info{flex:1;min-width:0}.bk-info h1{margin:4px 0 2px}.bk-ko{color:var(--ink-3);margin:0 0 10px}
.bk-spec{width:100%;min-width:0 !important;table-layout:fixed;border-collapse:collapse;font-size:14px;margin:14px 0}.bk-spec td{overflow-wrap:anywhere}.bk-spec th{text-align:left;color:var(--ink-3);font-weight:600;width:96px;padding:6px 0}.bk-spec td{padding:6px 0}
.bk-toc{counter-reset:none;padding-left:0;list-style:none}.bk-toc li{padding:9px 0;border-top:1px solid var(--line)}.bk-toc small{display:block;color:var(--ink-3)}
.shop-card{display:flex;gap:20px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:20px;margin:18px 0}
.shop-pk{flex:0 0 110px;height:150px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;background:#C4551C}
.shop-pk.lv-A2,.shop-pk.lv-intermediate{background:#2F6FDB}.shop-pk.lv-advanced{background:#2E7D5B}.shop-pk.lv-all{background:#1F1F1F}.shop-pk b{font-size:40px;line-height:1}.shop-pk small{opacity:.85;margin-top:6px}
.shop-body{flex:1;min-width:0}.shop-body h3{margin:0}.shop-price{font-size:22px;font-weight:800;margin:10px 0}.shop-price small{font-size:13px;font-weight:500;color:var(--ink-3)}
.shop-soon{opacity:.6;cursor:default}
.shop-body details{margin-top:12px}.shop-body ul{margin:8px 0 0;padding-left:18px;columns:2;font-size:14px}
.shop-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)}.shop-row:first-child{border-top:0}
.shop-lv{font-size:12px;font-weight:800;color:var(--ink-3);width:28px}.shop-t{flex:1;min-width:0}.shop-t small{display:block;color:var(--ink-3)}
.shop-row .btn{min-height:40px;padding:8px 14px;font-size:14px;white-space:nowrap}
@media (max-width:600px){.bk-info{width:100%}.bk-info h1{font-size:26px;overflow-wrap:anywhere}.shop-hero .btn{display:none}.bk-spec th{width:84px}.bk-grid{grid-template-columns:repeat(2,1fr);gap:18px 14px}.bk-detail{flex-direction:column}.bk-cover.big{width:200px;align-self:center}.shop-card{flex-direction:column}.shop-pk{flex:none;width:100%;height:96px;flex-direction:row;gap:10px}.shop-body ul{columns:1}}
</style>
`;
const shopHead = () => `<div class="shop-hero"><span><b>${esc(pub.en.toUpperCase())}</b><br><small>${esc(pub.ko)} · Korean books &amp; worksheets by a Korean teacher</small></span><a class="btn sub" href="/worksheets/">Free worksheets</a></div>
<nav class="shop-nav"><a href="/shop/#books">Books · 책</a><a href="/shop/#packs">Worksheet packs · 묶음</a><a href="/shop/#singles">Single sheets · 낱장</a></nav>`;
const shopFoot = `<div class="next">
  <h3>How buying works</h3>
  <p>Payment is handled by Polar, our payment partner. Digital files download right after paying and arrive by email. Printed books will be sold through bookstores when published. See <a href="/refund.html">refunds</a> · <a href="/terms.html">terms</a>.</p>
</div>
<p class="ft">${esc(pub.en)} · ${esc(pub.ko)} · 출판사 신고번호 제 2026-000158 호 · 통신판매업 신고번호 제 2026-수원영통-1263 호 · 사업자등록번호 202-43-01897 · <a href="/about.html">About</a> · <a href="/worksheets/">Free worksheets</a></p>
`;

/* 책 묶음(docs/shop.json bundles) — status 가 on 일 때만 보인다(가격은 운영자가 정한 뒤 tools/polar-bundle.mjs) */
function bundlesHtml() {
  const on = (SHOP.bundles || []).filter((b) => b.status === 'on' && b.polar);
  if (!on.length) return '';
  return `<h2 id="bundles">Book bundles · 책 묶음</h2>\n` + on.map((b) => {
    const ks = b.books.map((id) => SHOP.books.find((k) => k.id === id));
    const sum = ks.reduce((a, k) => a + parseFloat(k.price), 0);
    const off = Math.round((1 - parseFloat(b.price) / sum) * 100);
    return `<div class="shop-card"><div class="shop-pk" style="width:auto;height:auto;flex:0 0 auto;align-self:center;flex-direction:row;gap:8px;padding:14px;background:var(--tint);border-radius:8px">${ks.map((k) => `<img src="${esc(k.coverImg)}" alt="" width="92" height="130" loading="lazy" style="width:92px;height:auto;border-radius:2px 5px 5px 2px;box-shadow:0 3px 8px rgba(0,0,0,.16)">`).join('')}</div>
  <div class="shop-body"><h3>${esc(b.title.en)}</h3><p class="bk-ko">${esc(b.title.ko)}</p><p>${esc(b.sub.en)}</p>
    <p class="shop-price">$${esc(b.price)} <small>· <s>$${sum.toFixed(2)}</s> · save ${off}% · ${ks.length} PDF downloads</small></p>
    ${buy(b.polar, b.price, 'Buy the bundle')}</div></div>\n`;
  }).join('');
}
function shopPage() {
  const books = SHOP.books.map((k) => `<a class="bk-item" href="/shop/${k.id}/">${cover(k)}<h3>${esc(k.title.en)}</h3><p>${esc(k.title.ko)}</p><span class="bk-badge">${esc(STATUS[k.status]?.[0] || k.status)} · ${esc(STATUS[k.status]?.[1] || '')}</span></a>`).join('\n');
  const packs = SHOP.packs.map((p) => {
    const ws = packSheets(p);
    return `<div class="shop-card"><div class="shop-pk lv-${esc(p.ws || p.level)}"><b>${ws.length}</b><small>${esc(p.ws ? WS_LV[p.ws] : p.level === 'all' ? 'A1–A2' : p.level)} · PDF</small></div>
  <div class="shop-body"><h3>${esc(p.title.en)}</h3><p class="bk-ko">${esc(p.title.ko)}</p><p>${esc(p.sub.en)}</p>
    <p class="shop-price">$${esc(p.price)} <small>· ${ws.length} sheets + answer keys · PDF download</small></p>
    ${buy(p.polar, p.price, 'Buy the pack')}
    <details><summary>What is inside (${ws.length})</summary><ul>${ws.map((w) => `<li><a href="${esc(w.href || `/${w.id}-worksheet/`)}">${esc(w.title.en)}</a> · ${esc(w.title.ko)}</li>`).join('')}</ul></details></div></div>`;
  }).join('\n');
  const singles = sheets.map((w) => `  <div class="shop-row"><span class="shop-lv">${esc(w.level)}</span><span class="shop-t"><a href="/${w.id}-worksheet/">${esc(w.title.en)}</a><small>${esc(w.title.ko)}</small></span>${buy(SHOP.singles?.[w.id], SHOP.singlePrice, 'PDF')}</div>`).join('\n');
  return head(`${pub.en} — Korean Books & Worksheet Shop`, 'Korean workbooks, TOPIK practice books and printable worksheet PDFs with answer keys — made by a Korean teacher.', '/shop/', SHOP_CSS) +
`${shopHead()}
<h1 id="books">Books</h1>
<p>책 · original Korean workbooks and TOPIK practice books. TOPIK questions are newly written in the official format — not past papers. These books are independent study aids and are not operated, endorsed or certified by NIIED or the TOPIK Center.</p>
<div class="bk-grid">
${books}
</div>
${bundlesHtml()}<h2 id="packs">Worksheet packs · 학습지 묶음</h2>
<p>Every worksheet stays free to use on the site — the packs are clean print-ready PDFs you keep.</p>
${packs}
<h2 id="singles">Single worksheets · 낱장</h2>
<p>$${esc(SHOP.singlePrice)} each · 학습지 한 장(정답지 포함) PDF</p>
<div class="box">
${singles}
</div>
${shopFoot}` + foot;
}
/* Yes24 식 책 쪽(운영자 2026-10-18 「판매페이지 · 미리보기 · 책소개」) — shop.json 책에 page 가 있으면 소개 · 특징 · 미리보기 · 저자 · 책 정보 · 자주 묻는 질문을 더 보여 준다. 미리보기 그림은 assets/books/<id>/pv-N.jpg, 크게 보기는 CSS :target(스크립트 없음). */
/* ── 책 상세 쪽(/shop/<id>/) — 예스24 · 교보문고 식 정보 + 마케팅 랜딩 요소(운영자 2026-10-27 「시안 C 에 B 의 색 있는 윗부분을 섞어서」) ──
   위: 책 표지 색의 큰 띠(제목 · 한 줄 이득 · 별점 · 믿음 줄 · 구매 단추). 아래: 읽을 거리(왜 필요한가 · 3단계 · 특징 · 미리보기 · 샘플 · 이런 분께 · 비교 · 목차 · 지은이 · 정보 · 리뷰 · 질문) + 따라다니는 구매 카드(폰은 아래 고정 줄).
   글은 docs/shop-copy.json · 목차 · 미리보기 · 책 정보는 tools/make-book-page.mjs 가 만든 shop.json 의 page. 별점 · 리뷰는 reviews.js 가 Supabase(book_reviews, 승인된 것만)에서 읽는다 — 리뷰가 없으면 「No reviews yet」, 가짜 별점은 없다. */
const heroColors = (k) => { try { const c = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${k.id}.json`), 'utf8')).coverLevel || {}; return [c.bg || k.color, c.bg2 || c.bg || k.color]; } catch { return [k.color || '#3B1F6E', k.color || '#2A1650']; } };
const bundleOf = (k) => (SHOP.bundles || []).find((b) => b.status === 'on' && b.polar && b.books.includes(k.id));
const stars0 = '<span class="stars">☆☆☆☆☆</span>';
const BOOK_CSS = `<style>
main{max-width:none;padding:0 0 70px}.hd-in{max-width:1120px}.pg2 table{min-width:0}
.pg2 .in{max-width:1120px;margin:0 auto;padding:0 20px}.pg2 h2{font-size:24px;line-height:1.3;margin:0 0 14px;border:0;padding:0;color:var(--ink)}.pg2 a{color:var(--orange-deep)}
.pg2-hero{color:#fff;padding:26px 0 70px;background:var(--c1)}.pg2-hg{display:grid;grid-template-columns:1fr 250px;gap:44px;align-items:center}.pg2-hero .crumb{font-size:13px;opacity:.8;margin-bottom:14px}.pg2-hero .crumb a{color:#fff}
.pg2-chip{display:inline-block;font-size:12px;font-weight:800;padding:3px 11px;border-radius:8px;background:rgba(255,255,255,.18);color:#fff}.pg2-hero h1{font-size:38px;line-height:1.2;margin:10px 0 4px;color:#fff;border:0;padding:0}.pg2-ko{font-size:17px;opacity:.85}.pg2-lead{font-size:20px;font-weight:700;line-height:1.45;margin:16px 0 8px;color:#fff;word-break:keep-all}.pg2-sub{opacity:.92;margin:0 0 12px;max-width:640px}
.pg2-hero .rv-hero{color:#fff;text-decoration:none;font-size:14px;opacity:.95}.stars{color:#FFC93C;letter-spacing:2px}.pg2-trust{display:flex;gap:0 16px;flex-wrap:wrap;margin:16px 0 0;font-size:14px;opacity:.95}
.pg2-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.pg2 .btn.yel{background:#FFD23F;border-color:#FFD23F;color:#3A2600}.pg2 .btn.ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.8)}.pg2-hero .flip{position:relative;cursor:zoom-in}.pg2-hero .flip .fp{display:none}.pg2-hero .flip .fp.on{display:block}.pg2-hero .flip .fp:not(:first-child){border-radius:2px;box-shadow:none;background:#fff;border:1px solid rgba(255,255,255,.4)}.pg2-hero .flipbar{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:10px;font-size:13px;color:#fff}.pg2-hero .flipbar[hidden]{display:none}.pg2-hero .flipbar button{width:36px;height:36px;border:1px solid rgba(255,255,255,.6);border-radius:8px;background:transparent;color:#fff;font:inherit;font-size:20px;line-height:1;cursor:pointer}.pg2-hero .cvh{display:block;margin-top:10px;font-size:13px;font-weight:700;color:#fff;text-decoration:underline;text-underline-offset:3px}.pg2-hero .cv img{display:block;width:100%;height:auto;border-radius:3px 9px 9px 3px;box-shadow:0 8px 20px rgba(0,0,0,.28)}
.pg2-lay{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:36px;align-items:start;margin-top:-44px}.pg2-main{min-width:0;margin:0;background:var(--surface);border-radius:12px;padding:6px 28px 24px;box-shadow:0 1px 0 rgba(var(--ink-rgb),.08)}.pg2-sec{padding:30px 0;border-top:1px solid var(--line)}.pg2-sec:first-child{border-top:0}
.pg2-pro{margin:12px 0 0;font-size:12.5px;line-height:1.5;color:var(--ink-3)}.pg2-pro a{color:var(--orange-text,var(--orange-deep));font-weight:700}.pg2-card{position:sticky;top:76px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:18px;box-shadow:0 1px 0 rgba(var(--ink-rgb),.08)}.pg2-card .px{font-size:34px;font-weight:900;color:var(--ink);text-align:center;line-height:1.2}.pg2-card .px small{display:block;font-size:13px;font-weight:500;color:var(--ink-3)}.pg2-card .btn{width:100%;margin-top:8px}.pg2-card ul{list-style:none;margin:14px 0 0;font-size:14px;color:var(--ink-2)}.pg2-card li{padding:3px 0}
.pg2 .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;border-radius:8px;font-weight:800;font-size:16px;text-decoration:none;border:2px solid var(--orange-deep);background:var(--orange-deep);color:#fff;cursor:pointer}.pg2 .btn.sub{background:var(--surface);color:var(--orange-deep)}
.pg2-toc summary{cursor:pointer;font-size:20px;font-weight:800;color:var(--ink);padding:2px 0}.pg2-one{margin:12px 0 0;font-size:13px;color:var(--ink-3);text-align:center}.pg2-prob p.ko{color:var(--ink-3);font-size:14px;margin-top:8px}.pg2-prob{text-align:left;padding:4px 0 0}.pg2-prob h2{font-size:22px;line-height:1.35;margin:0 0 8px}.pg2-prob p{margin:0;color:var(--ink-2);line-height:1.65}.pg2-fl{list-style:none;margin:0;padding:0;display:grid;gap:14px}.pg2-fl li{line-height:1.6;color:var(--ink-2)}.pg2-fl b{color:var(--ink)}.pg2-fl small{display:block;color:var(--ink-3);font-size:13px}.pg2-plain li{padding:5px 0;border-bottom:1px solid var(--line)}.pg2-plain li:last-child{border-bottom:0}.pg2-trust span+span::before{content:'·';margin-right:16px;opacity:.7}.pg2-prob .q{font-size:25px;font-weight:800;line-height:1.35;color:var(--ink);word-break:keep-all}.pg2-prob p{color:var(--ink-2);max-width:640px;margin:8px auto 0}
.pg2-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.pg2-steps div{background:var(--tint);border-radius:8px;padding:16px;font-size:14.5px}.pg2-steps i{font-style:normal;font-size:28px}.pg2-steps b{display:block;font-size:17px;color:var(--ink)}
.pg2-feat{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.pg2-feat div{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:15px}.pg2-feat i{font-style:normal;font-size:26px}.pg2-feat b{display:block;margin:4px 0 2px;color:var(--ink)}.pg2-feat span{font-size:14px;color:var(--ink-2)}.pg2-feat small{color:var(--ink-3)}
.pg2-pv{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.pg2-pv a{display:block;text-decoration:none;color:var(--ink-3);font-size:12px}.pg2-pv img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.1)}
.pg2-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pg2-two>div{border:1px solid var(--line);border-radius:8px;padding:15px;font-size:14.5px}.pg2-two b{color:var(--ink)}.pg2-two ul{margin:6px 0 0 18px}
.pg2-cmp{width:100%;table-layout:fixed;overflow-wrap:anywhere;border-collapse:collapse;margin-top:14px;font-size:14.5px}.pg2-cmp th,.pg2-cmp td{padding:10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}.pg2-cmp th:first-child,.pg2-cmp td:first-child{width:40%}.pg2-cmp tr.me{background:var(--tint);font-weight:700}
.pg2 details.toc{border:1px solid var(--line);border-radius:8px;margin:8px 0;overflow:hidden}.pg2 details.toc summary{cursor:pointer;padding:12px 16px;font-weight:800;color:var(--ink);background:var(--tint);display:flex;justify-content:space-between;gap:10px}.pg2 details.toc summary em{font-style:normal;font-weight:500;color:var(--ink-3);white-space:nowrap}.pg2 details.toc .r{display:flex;justify-content:space-between;gap:10px;padding:8px 16px;border-top:1px solid var(--line);font-size:14px}.pg2 details.toc .r em{font-style:normal;color:var(--ink-3);white-space:nowrap}
.pg2-spec{border-collapse:collapse;width:100%;table-layout:fixed;overflow-wrap:anywhere}.pg2-spec th{text-align:left;width:150px;color:var(--ink-3);font-weight:600;font-size:13.5px;letter-spacing:0;white-space:normal;background:none;padding:11px 16px 11px 0;border-bottom:1px solid var(--line);vertical-align:top}.pg2-spec td{padding:11px 0;border-bottom:1px solid var(--line);line-height:1.5}.pg2-spec tr:last-child th,.pg2-spec tr:last-child td{border-bottom:0}@media(max-width:600px){.pg2-spec th{width:104px;padding-right:10px}}
.pg2-rev{border:1px dashed var(--line);border-radius:8px;padding:20px;text-align:center}.rv-item{border-top:1px solid var(--line);padding:12px 0;text-align:left}.rv-item .who{font-size:13px;color:var(--ink-3)}.rv-sum{font-size:18px;margin-bottom:10px;color:var(--ink)}
.pg2-faq details{border-top:1px solid var(--line);padding:10px 0}.pg2-faq summary{cursor:pointer;font-weight:700;color:var(--ink)}.pg2-faq p{margin:8px 0 0}
.pg2-more{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.pg2-more a{text-decoration:none;color:var(--ink);font-size:13px}.pg2-more img{display:block;width:100%;height:auto;aspect-ratio:700/995;border-radius:2px 6px 6px 2px;box-shadow:0 6px 14px rgba(0,0,0,.18);margin-bottom:6px}
.pg2-bundle{margin-top:14px;padding:12px;border-radius:8px;background:var(--tint);font-size:14px}.pg2-bar{display:none}
@media(max-width:900px){.pg2-hg{grid-template-columns:1fr}.pg2-hero .cv{max-width:180px;order:-1}.pg2-hero h1{font-size:29px}.pg2-lay{grid-template-columns:minmax(0,1fr);margin-top:-34px}.pg2-card{display:none}.pg2-main{padding:4px 16px 18px;border-radius:16px}.pg2-steps,.pg2-feat,.pg2-two{grid-template-columns:1fr}.pg2-pv,.pg2-more{grid-template-columns:repeat(2,1fr)}.pg2-prob .q{font-size:21px}.pg2 h2{font-size:21px}.pg2-spec th{width:110px}
.pg2-bar{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:40;background:var(--surface);border-top:1px solid var(--line);padding:9px 14px;gap:10px;align-items:center}.pg2-bar b{font-size:20px;color:var(--ink)}.pg2-bar .btn{flex:1;padding:11px}}
</style>\n`;


/* 결제 뒤 돌아오는 감사 · 리뷰 쪽(/shop/thanks/) — Polar 결제 링크의 success_url(tools/polar-links.mjs). 검색에는 안 나오게 noindex. */
function thanksPage() {
  const opts = SHOP.books.filter((b) => b.status === 'on').map((b) => `<option value="${esc(b.id)}">${esc(b.title.en)}</option>`).join('');
  return head('Thank you', 'Thank you for your purchase. How to download your files and how to leave a review.', '/shop/thanks/', '<meta name="robots" content="noindex">\n' + BOOK_CSS + SHOP_CSS + '<style>.rate{display:flex;gap:4px;margin:6px 0 12px}.rate button{font-size:34px;line-height:1;background:none;border:0;color:#E0A100;cursor:pointer;padding:2px}.rv-f label{display:block;font-weight:700;color:var(--ink);margin-top:12px}.rv-f select,.rv-f input[type=text],.rv-f textarea{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:7px;font:inherit;background:var(--surface);color:var(--ink)}.rv-f textarea{min-height:110px}</style>\n') +
`<div class="pg2"><div class="in" style="max-width:720px;padding-top:44px">
<h1 style="font-size:34px;line-height:1.2">Thank you! · 감사합니다</h1>
<p style="font-size:18px">Your purchase went through. Here is how to get your file.</p>
<div class="pg2-steps" style="grid-template-columns:1fr"><div><b>1 · Download now</b>Use the download button on the payment confirmation page, or the link in the receipt email Polar sent you.</div><div><b>2 · Download again later</b>You can always get your files again from your <a href="https://polar.sh/everykoreans/portal" rel="noopener">Polar customer portal</a> (sign in with the email you paid with).</div><div><b>3 · Something wrong?</b>Write to <a href="mailto:cheesepotato@everykoreans.com">cheesepotato@everykoreans.com</a> with the email you paid with and we will sort it out.</div></div>
<h2 style="margin-top:34px">Keep practising · 계속 공부해요</h2>
<p>Each unit has a QR code to free practice on everykoreans.com. More free lessons, worksheets and TOPIK practice are on the <a href="/">home page</a>.</p>
<section id="review" style="margin-top:34px"><h2>How is the book? · 책은 어땠나요?</h2>
<p>A few honest words help other learners choose. We read every review before it appears on the book page.</p>
<form class="rv-f" data-review novalidate>
  <label for="rvbook">Which book? · 어떤 책?</label><select id="rvbook" name="book">${opts}</select>
  <label>Your rating · 별점</label><div class="rate">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" aria-label="${n} star${n > 1 ? 's' : ''}" aria-pressed="false">☆</button>`).join('')}</div>
  <label for="rvname">Name (optional, first name or initials) · 이름(선택)</label><input id="rvname" type="text" name="name" maxlength="40" autocomplete="given-name">
  <label for="rvbody">Your review (optional) · 후기(선택)</label><textarea id="rvbody" name="body" maxlength="1500"></textarea>
  <input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" class="lead-hp">
  <label class="lead-tips" style="font-weight:400"><input type="checkbox" name="ok"> <span>You may show my review (with the name above, if I typed one) on everykoreans.com · 리뷰를 사이트에 공개해도 좋아요</span></label>
  <button class="btn" type="submit" style="margin-top:14px">Send my review</button>
  <p class="lead-msg" role="status" aria-live="polite"></p>
</form></section>
<p style="margin-top:30px"><a class="btn sub" href="/shop/">← Back to the shop</a></p></div></div>
<script src="/reviews.js" defer></script>` + foot;
}
function bookPage(k) {
  const g = k.page || {};
  const on = k.status === 'on' && k.polar;
  const base = `/shop/${k.id}/`;
  const [c1, c2] = heroColors(k);
  const bundle = bundleOf(k);
  const isbn = frameIsbn(k.id);
  const level = k.level;
  const stDev = { en: k.pages ? '' : '' };
  const sample = k.sample ? `${base}#sample` : '';
  const ctaMain = on ? `<a class="btn yel" href="${esc(k.polar)}" rel="noopener" data-ev="책구매클릭" data-ev-from="${esc(k.id)}">Buy the PDF · $${esc(k.price)}</a>` : `<a class="btn yel" href="#notify">Tell me when it is out</a>`;
  const ctaSub = k.sample ? `<a class="btn ghost" href="#sample">Free sample</a>` : '';
  const cp = (o) => o ? `${esc(o.en)}${o.ko ? ` <small>· ${esc(o.ko)}</small>` : ''}` : '';
  const pvN = (g.previews || []).length;
  const pv = (g.previews || []).map((c, i) => `<a href="#pv${i + 1}"><img src="/assets/books/${esc(k.id)}/pv-${i + 1}.jpg" alt="${esc(c[0])} — ${esc(c[1])}" loading="lazy" width="1100" height="1554">${esc(c[0])} · ${esc(c[1])}</a>`).join('');
  const lb = (g.previews || []).map((c, i) => `<div class="lb" id="pv${i + 1}"><a class="lbx" href="#preview" aria-label="Close">×</a><img src="/assets/books/${esc(k.id)}/pv-${i + 1}.jpg" alt="${esc(c[0])}" width="1100" height="1554"><div class="lbn"><a href="#pv${i === 0 ? pvN : i}">‹ Prev</a><span>${i + 1} / ${pvN}</span><a href="#pv${i + 2 > pvN ? 1 : i + 2}">Next ›</a></div></div>`).join('');
  const related = (g.related || []).map((id) => SHOP.books.find((b) => b.id === id)).filter((b) => b && b.page?.pick);
  const cmp = related.length > 1 ? `<h3 style="margin:22px 0 4px;color:var(--ink)">Which book is right for you?</h3><table class="pg2-cmp"><tr><th>Book</th><th>Pick it if…</th></tr>${related.map((b) => `<tr${b.id === k.id ? ' class="me"' : ''}><td>${b.id === k.id ? esc(b.title.en) : `<a href="/shop/${b.id}/">${esc(b.title.en)}</a>`}<br><small>${esc(b.level)} · $${esc(b.price)}</small></td><td>${esc(b.page.pick)}</td></tr>`).join('')}</table>` : '';
  const toc = (g.contents || []).map((c, i) => `<details class="toc"${i === 1 || (g.contents.length === 1) ? ' open' : ''}><summary><span>${esc(c.part.en)}${c.part.ko ? ` · ${esc(c.part.ko)}` : ''}</span><em>${c.items.length}</em></summary>${c.items.map(([t, p]) => `<div class="r"><span>${esc(t)}</span><em>p. ${esc(p)}</em></div>`).join('')}</details>`).join('');
  const more = SHOP.books.filter((b) => b.id !== k.id && b.coverImg && b.status === 'on').slice(0, 4).map((b) => `<a href="/shop/${b.id}/"><img src="${esc(b.coverImg)}" alt="" loading="lazy" width="700" height="995"><b>${esc(b.title.en)}</b><br>$${esc(b.price)}</a>`).join('');
  const notify = !on ? `<div class="lead-box" id="notify" style="margin:18px 0 0"><b>Tell me when it is out · 나오면 알려 주세요</b><p>Leave your email and we will write to you once when this book is available.</p><form data-lead="notify-${esc(k.id)}" novalidate><div class="lead-row"><input type="email" name="email" placeholder="you@example.com" autocomplete="email" aria-label="Email" required><input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" class="lead-hp"><input type="checkbox" name="tips" checked hidden><button class="btn main" type="submit">Notify me</button></div><p class="lead-msg" role="status" aria-live="polite"></p></form></div>` : '';
  const ld = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: k.title.en, description: k.sub.en, sku: k.id, ...(k.coverImg ? { image: `https://everykoreans.com${k.coverImg}` } : {}), brand: { '@type': 'Brand', name: pub.en }, ...(isbn ? { isbn } : {}), ...(on ? { offers: { '@type': 'Offer', price: k.price, priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `https://everykoreans.com${base}` } } : {}) })}</script>\n`;
  const head2 = `${BOOK_CSS}<style>.pg2{--c1:${c1};--c2:${c2}}</style>\n${SHOP_CSS}${ld}`;
  const body = `<div class="pg2">
<section class="pg2-hero"><div class="in"><div class="crumb"><a href="/shop/">Books</a> › ${esc(level)} › ${esc(k.title.en)}</div><div class="pg2-hg"><div>
  <span class="pg2-chip">${esc(level)} · PDF${on ? '' : ' · Coming soon'}</span><h1>${esc(k.title.en)}</h1><div class="pg2-ko">${esc(k.title.ko)} · Junsang</div>
  <p class="pg2-lead">${esc(g.headline?.en || k.sub.en)}</p>
  <a class="rv-hero" href="#reviews" data-rv-hero hidden></a>
  <div class="pg2-cta">${ctaMain}${ctaSub}</div></div><div class="cv">${pvN && k.coverImg ? `<div class="flip" data-flip="${pvN}"><img class="fp on" src="${esc(k.coverImg)}" alt="${esc(k.title.en)}" width="700" height="995">${(g.previews || []).map((c, i) => `<img class="fp" data-src="/assets/books/${esc(k.id)}/pv-${i + 1}.jpg" alt="${esc(c[0])}" width="1100" height="1554">`).join('')}</div><div class="flipbar" hidden><button type="button" data-fp="-1" aria-label="Previous page">‹</button><span class="flipn">Cover</span><button type="button" data-fp="1" aria-label="Next page">›</button></div><a class="cvh" href="#preview">Look inside · 미리보기 ${pvN}쪽 ›</a>` : k.coverImg ? `<img src="${esc(k.coverImg)}" alt="${esc(k.title.en)}" width="700" height="995">` : cover(k, true)}</div></div></div></section>
<div class="in"><div class="pg2-lay"><main class="pg2-main">
${notify}
<section class="pg2-sec pg2-prob"><p>${esc(g.lead?.en || k.about.en)}</p><p class="ko">${esc(g.lead?.ko || k.about.ko)}</p></section>
${pvN ? `<section class="pg2-sec" id="preview"><h2>Look inside · 미리보기</h2><p style="color:var(--ink-3);margin:-6px 0 12px">${esc(g.previewNote.en)} <small>· ${esc(g.previewNote.ko)}</small></p><div class="pg2-pv">${pv}</div>${lb}</section>` : ''}
${k.sample ? `<section class="pg2-sec">${sampleBox(k)}</section>` : ''}
<section class="pg2-sec"><h2>Who it is for · 이런 분께</h2><ul class="pg2-fl">${k.for.en.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
${toc ? `<section class="pg2-sec"><details class="pg2-toc"><summary>Contents · 목차</summary>${toc}<p style="color:var(--ink-3);font-size:13px">Page numbers are those printed in the book · 쪽 번호는 책에 인쇄된 번호입니다.</p></details></section>` : ''}
${g.specs ? `<section class="pg2-sec"><h2>Book details · 책 정보</h2><table class="pg2-spec">${g.specs.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}<tr><th>Price · 가격</th><td>$${esc(k.price)}</td></tr></table></section>` : ''}
<section class="pg2-sec" id="reviews" data-reviews="${esc(k.id)}" hidden><h2>Reviews · 리뷰</h2><div class="rv-sum" data-rv-sum></div><div data-rv-list></div></section>
${g.faq ? `<section class="pg2-sec"><h2>FAQ · 자주 묻는 질문</h2><div class="pg2-faq">${g.faq.map(([q, a]) => `<details><summary>${esc(q.en)} · ${esc(q.ko)}</summary><p>${esc(a.en)}</p><p style="color:var(--ink-3)">${esc(a.ko)}</p></details>`).join('')}</div></section>` : ''}
${more ? `<section class="pg2-sec"><h2>More books · 다른 책</h2><div class="pg2-more">${more}</div><p style="margin-top:14px"><a class="btn sub" href="/shop/">← All books</a></p></section>` : ''}
${shopFoot}
</main>
<aside class="pg2-card">
  ${on ? `<div class="px">$${esc(k.price)}<small>PDF · instant download</small></div><a class="btn" href="${esc(k.polar)}" rel="noopener" data-ev="책구매클릭" data-ev-from="${esc(k.id)}-card">Buy the PDF</a>` : `<div class="px">Coming soon<small>${esc(level)}</small></div><a class="btn" href="#notify">Tell me when it is out</a>`}
  ${k.sample ? `<a class="btn sub" href="#sample">Free sample · ${k.sample.pages} pages</a>` : ''}
  <p class="pg2-one">Instant download · answer key included</p>
  ${on ? `<p class="pg2-pro">Included with <a href="/#pro" data-ev="Pro클릭" data-ev-from="책쪽">CheesePotato Pro (Yearly)</a> while you subscribe · 연간 구독 중 포함</p>` : ''}
  ${bundle ? `<div class="pg2-bundle"><b>${esc(bundle.title.en)}</b><br>$${esc(bundle.price)} instead of $${bundle.books.reduce((a, id) => a + parseFloat(SHOP.books.find((b) => b.id === id).price), 0).toFixed(2)} · <a href="${esc(bundle.polar)}" data-ev="책구매클릭" data-ev-from="${esc(k.id)}-bundle">Buy the bundle →</a></div>` : ''}
</aside></div></div>
<div class="pg2-bar">${on ? `<b>$${esc(k.price)}</b><a class="btn" href="${esc(k.polar)}" rel="noopener" data-ev="책구매클릭" data-ev-from="${esc(k.id)}-bar">Buy PDF</a>` : `<b>Soon</b><a class="btn" href="#notify">Notify me</a>`}${k.sample ? '<a class="btn sub" href="#sample">Sample</a>' : ''}</div>
</div>
<script src="/subscribe.js" defer></script><script src="/reviews.js" defer></script><script src="/bookflip.js" defer></script>`;
  return head(`${k.title.en} — ${pub.en}`, `${g.headline?.en || k.sub.en} ${k.sub.en}`.slice(0, 300), base, head2) + body + foot;
}

/* 책 쪽 「무료 샘플」 상자 — 이메일을 내면 db/add_email_leads.sql 의 표에 한 줄(subscribe.js), 이메일 없이도 바로 받을 수 있다. */
function sampleBox(k) {
  if (!k.sample) return '';
  const f = `/assets/books/${k.id}/sample.pdf`;
  const mb = (fs.statSync(path.join(ROOT, f.slice(1))).size / 1048576).toFixed(1);
  return `<div class="lead-box" id="sample" style="margin:0">
  <b>Free sample · 무료 샘플</b>
  <p>The cover, contents and first units of the book (${k.sample.pages} pages, PDF ${mb} MB): see exactly what you get.</p>
  <form data-lead="shop-${esc(k.id)}" novalidate>
    <div class="lead-row"><input type="email" name="email" placeholder="you@example.com" autocomplete="email" aria-label="Email" required><input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" class="lead-hp"><button class="btn main" type="submit">Get the free sample</button></div>
    <label class="lead-tips"><input type="checkbox" name="tips"> <span>Also send me study tips and new-book news (optional) · 학습 소식도 받기 (선택)</span></label>
    <p class="lead-msg" role="status" aria-live="polite"></p>
  </form>
  <a class="lead-dl" href="${f}" download data-ev="샘플받기" data-ev-from="${esc(k.id)}">↓ Download the sample now, no email needed · 이메일 없이 바로 받기</a>
</div>`;
}

/* 상점 자료(docs/shop.json) 모양 검사 — 문제는 bad 에 쌓는다 */
export function checkShop(sheets, bad) {
  for (const p of SHOP.packs) {
    if (!/^[a-z0-9-]+$/.test(p.id) || !p.title?.en || !p.title?.ko || !/^\d+\.\d{2}$/.test(p.price)) bad.push(`docs/shop.json ${p.id}: id · title · price(0.00)`);
    if (p.polar && !POLAR.test(p.polar)) bad.push(`docs/shop.json ${p.id}: polar 는 https://buy.polar.sh/… 링크`);
  }
  for (const [id, u] of Object.entries(SHOP.singles || {})) {
    if (!sheets.some((w) => w.id === id)) bad.push(`docs/shop.json singles: 없는 학습지 ${id}`);
    if (u && !POLAR.test(u)) bad.push(`docs/shop.json singles.${id}: polar 는 https://buy.polar.sh/… 링크`);
  }
  for (const k of SHOP.books) {
    if (!/^[a-z0-9-]+$/.test(k.id) || !k.title?.en || !k.title?.ko || !k.about?.en || !/^#[0-9A-Fa-f]{6}$/.test(k.color || '')) bad.push(`docs/shop.json 책 ${k.id}: id · title · about · color(#RRGGBB)`);
    if (k.polar && !POLAR.test(k.polar)) bad.push(`docs/shop.json 책 ${k.id}: polar 는 https://buy.polar.sh/… 링크`);
  }
}

export { SHOP, shopPage, bookPage, thanksPage, bookAd, BOOK_AD_CSS };
