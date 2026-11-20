/* 학습지 목록 쪽(/worksheets/ · /worksheet/) → 그 학습지들이 묶인 책 한 줄(운영자 2026-11-20 「2번 3번 ㄱㄱ」).
   GA4: 학습지 목록이 첫 화면 다음으로 많이 열리는데(11-19) 목록 두 곳에만 책으로 가는 길이 없었다(낱장 학습지 23쪽에는 bk-ad 가 있다).
   책 · 가격 · 표지는 docs/shop.json 에서 읽는다(판매 중 status on 만). 가격 칸의 data-px 는 행사 때 sale.js 가 반값으로 바꾼다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const HUB_BOOKS_CSS = '.hb{margin:18px 0 22px;padding:14px 16px;border:1px solid var(--line,#e2d9c8);border-radius:8px;background:var(--card,#fff)}' +
  '.hb h2{margin:0 0 4px!important;font-size:15px!important;border:0!important;padding:0!important}.hb p{margin:0 0 10px;font-size:13.5px;color:var(--dim,#6b5d4f);line-height:1.5}' +
  '.hb-l{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}' +
  '.hb-b{display:flex;gap:10px;align-items:center;padding:8px;border:1px solid var(--line,#e2d9c8);border-radius:5px;color:inherit;text-decoration:none}.hb-b:hover{border-color:var(--ink,#1c1915)}' +
  '.hb-b img{width:40px;height:auto;aspect-ratio:700/995;border-radius:2px;flex:none}.hb-b span{display:grid;gap:1px;font-size:13.5px;line-height:1.35}.hb-b small{color:var(--dim,#6b5d4f);font-size:12px}.hb-b em{font-style:normal;font-weight:700;font-size:13px}.hb-b em span{display:inline}' +
  '@media print{.hb{display:none}}';

/** ids: 보여 줄 책 id(차례대로). from: GA4 book_click 의 from(utm_content) 값. lead: 소개 한 줄(HTML) — 그 학습지가 책에 실제로 들어 있지 않으면 꼭 따로 쓴다 */
export function hubBooks(ids, from, lead) {
  const bs = ids.map((id) => SHOP.books.find((b) => b.id === id)).filter((b) => b && b.status === 'on' && b.coverImg);
  if (!bs.length) return '';
  return `<aside class="hb no-print" aria-label="Books">
<h2>인쇄해서 쓰는 분께 · For printing</h2>
<p>${lead || '이 학습지들을 단원 순서대로 묶은 책이 있어요. 정답 · 복습 · 쓰기 칸까지 PDF 한 파일. <small>The same worksheets as one book, with answer keys.</small>'}</p>
<div class="hb-l">${bs.map((b) => `<a class="hb-b" href="/shop/${esc(b.id)}/?utm_content=${esc(from)}"><img src="${esc(b.coverImg)}" alt="" width="700" height="995" loading="lazy"><span><b>${esc(b.title.ko || b.title.en)}</b><small>${esc(b.title.en)}</small><em>PDF · <span data-px="${esc(b.price)}">$${esc(b.price)}</span></em></span></a>`).join('')}</div>
</aside>
<script src="/sale.js" defer></script>`;
}

/** 학습지 id 가 책 틀(docs/books/<id>.json)에 들어 있는 판매 중 책 id 들 */
export function booksWithSheets(sheetIds) {
  return SHOP.books.filter((b) => b.status === 'on').filter((b) => {
    let tx = ''; try { tx = fs.readFileSync(path.join(ROOT, `docs/books/${b.id}.json`), 'utf8'); } catch { return false; }
    return sheetIds.some((id) => tx.includes(`"${id}"`));
  }).map((b) => b.id);
}
