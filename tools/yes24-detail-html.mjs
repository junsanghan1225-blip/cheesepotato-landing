// 예스24에 이미 올린 책의 「표지 · 카드뉴스 · 상세이미지」만 바꿀 때 쓰는 복사판(운영자 2026-11-16 「단어장은 표지만 수정 · 표지 · 카드뉴스 · 상세페이지만」).
//   node tools/yes24-detail-html.mjs <나가는 파일.html> <책 id> [책 id …]
// 책마다: 올릴 파일 이름(표지 · 카드뉴스 zip · 상세이미지 01~NN) + 상세이미지 칸마다 「이미지 설명」(복사 단추).
// 설명은 tools/yes24-images.mjs 가 그림과 같이 만든 books-out/yes24/<id>/detail.json 에서 읽는다(없으면 그 책은 「그림 먼저」 안내).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out, ...ids] = process.argv.slice(2);
if (!out || !ids.length) { console.error('쓰는 법: node tools/yes24-detail-html.mjs <파일.html> <책 id> [책 id …]'); process.exit(1); }
const shop = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/ops/book-ledger.json'), 'utf8')).books;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const field = (label, text, hint = '') => `<div class="f"><div class="fh"><b>${esc(label)}</b>${hint ? `<small>${esc(hint)}</small>` : ''}<button type="button">복사</button></div><pre class="v">${esc(text)}</pre></div>`;
const note = (label, text) => `<div class="f man"><div class="fh"><b>${esc(label)}</b><small>파일 올리기</small></div><pre class="v">${esc(text)}</pre></div>`;
const secs = ids.map((id) => {
  const k = shop.books.find((b) => b.id === id); const L = ledger[id] || {};
  const dj = path.join(ROOT, 'books-out/yes24', id, 'detail.json');
  if (!fs.existsSync(dj)) return `<section><h2>${esc(k?.title.ko || id)}</h2><p>그림이 아직 없다 — node tools/yes24-images.mjs ${esc(id)} 먼저</p></section>`;
  const det = JSON.parse(fs.readFileSync(dj, 'utf8'));
  const isbn = (JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8')).isbn || '').replace(/-/g, '');
  const short = id.replace(/-workbook$/, '').replace(/[^a-z0-9]+/g, '_');
  const reg = L.registered, now = L.last;
  const pdfNote = reg && now && reg.pages !== now.pages
    ? `PDF 는 바꾸지 않습니다 — 올린 판 ${reg.pages}쪽, 새 판 ${now.pages}쪽이라 쪽수가 달라 교체가 안 됩니다(표지 그림 칸만 바꾸기).`
    : reg ? `PDF 도 새 표지판으로 바꿀 수 있습니다(${isbn}.pdf · ${now?.pages ?? '?'}쪽 — 올린 판과 같은 쪽수). 바꾸지 않아도 됩니다.`
    : `PDF: 올린 판의 쪽수가 장부에 없습니다 — 예스24 화면의 쪽수가 ${now?.pages ?? '?'}쪽이면 ${isbn}.pdf 로 바꿀 수 있고, 다르면 바꾸지 않습니다(표지 그림 칸만).`;
  return `<section><h2>${esc(k?.title.ko || id)}</h2>
${note('표지이미지', `파일: ${isbn}_cover.jpg (가로 1500px)`)}
${note('전자책 파일', pdfNote)}
${note('카드뉴스 이미지', `파일: cardnews_${short}.zip (이 zip 하나만) — 안에 폴더 ${short}_cardnews/ · ${short}_cardnews_01.jpg ~ (1080×1080)`)}
${note('상세이미지', `칸 1부터 차례로 상세이미지/01.jpg ~ ${String(det.length).padStart(2, '0')}.jpg (가로 940) — 남는 칸은 비워 둡니다. 칸마다 아래 설명을 붙여 넣으세요.`)}
${det.map((m, i) => field(`상세이미지 ${String(i + 1).padStart(2, '0')} 설명`, m.desc, `칸 ${i + 1} · ${m.file} · 약 ${m.kb}KB`)).join('')}</section>`;
}).join('');
fs.writeFileSync(out, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>예스24 표지 · 카드뉴스 · 상세이미지 바꾸기</title>
<style>:root{--bg:#fafaf7;--fg:#222;--card:#fff;--line:#d9d6cc;--acc:#12704F}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}
header{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;z-index:5}header b{color:var(--acc)}
main{max-width:860px;margin:0 auto;padding:8px 16px 80px}h2{margin:28px 0 6px;font-size:20px;border-bottom:2px solid var(--fg);padding-bottom:6px}
.f{background:var(--card);border:1px solid var(--line);border-radius:8px;margin:8px 0}.fh{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--line)}.fh small{color:#8a8a80;flex:1;margin-left:10px;font-size:12px}
button{background:var(--acc);color:#fff;border:0;border-radius:6px;padding:5px 14px;font-size:13px;cursor:pointer}button.ok{background:#888}
pre.v{margin:0;padding:8px 10px;white-space:pre-wrap;word-break:break-word;font:inherit}.man{border-color:#9bb8d8}.man button{display:none}</style></head><body>
<header><b>예스24 표지 · 카드뉴스 · 상세이미지 바꾸기</b> · 이미 올린 책의 상품 수정 화면에서. 파란 칸은 파일, 흰 칸은 「복사」 → 붙여 넣기.</header>
<main>${secs}</main>
<script>document.addEventListener('click',function(ev){var b=ev.target.closest('button');if(!b)return;var t=b.closest('.f').querySelector('pre').textContent;
function done(){b.textContent='복사됨 ✓';b.className='ok';setTimeout(function(){b.textContent='복사';b.className='';},1500);}
function fb(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');done();}catch(x){}document.body.removeChild(a);}
if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(done,fb);}else fb();});</script></body></html>`);
console.log(out, `${ids.length}권`);
