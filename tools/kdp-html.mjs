// 아마존 KDP 칸마다 「복사」 단추가 있는 HTML 한 장(운영자 2026-10-27 「KDP 올리기 준비」). KDP 에는 올리기 API 가 없어 운영자가 화면에서 직접 올린다 — 붙여 넣을 글만 쉽게.
//   node tools/kdp-html.mjs <나가는 파일.html>
// 글의 출처: docs/shop.json(제목 · 소개 · 대상 · 가격) + docs/books/<id>.json(부제 · ISBN) + docs/ops/kdp-fields.json(키워드 · 분류). 생성물은 저장소에 올리지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2];
if (!out) { console.error('쓰는 법: node tools/kdp-html.mjs <나가는 파일.html>'); process.exit(1); }
const shop = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const F = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/ops/kdp-fields.json'), 'utf8'));
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const QR = new Set(['first-steps-workbook', 'particles-workbook', 'topik2-vocab-1000', 'topik2-vocab-2000', 'topik2-vocab-lv3']);
const TOPIK = (k) => k.series === 'topik' || /TOPIK/.test(k.title.en);
const NOTE_TOPIK = 'TOPIK is the name of a test run by the National Institute for International Education (NIIED). This is an independent study book and is not operated, endorsed or certified by NIIED or the TOPIK Center. All questions are newly written and are not past exam papers.';
const NOTE_PLAIN = 'All sentences are newly written for this book.';

const cards = Object.keys(F.books).map((id) => {
  const k = shop.books.find((b) => b.id === id);
  const fr = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8'));
  const desc = [
    `<p><b>${e(k.sub.en)}</b></p>`,
    `<p>${e(k.about.en)}</p>`,
    '<p><b>Who it is for</b></p>',
    `<ul>${k.for.en.map((x) => `<li>${e(x)}</li>`).join('')}</ul>`,
    `<p>Answer key at the back${QR.has(id) ? ', a QR code in each unit to free online practice on everykoreans.com' : ''}, and a reader bonus for free Pro access on everykoreans.com. Written by a Korean teacher.</p>`,
    `<p><i>${e(TOPIK(k) ? NOTE_TOPIK : NOTE_PLAIN)}</i></p>`,
  ].join('\n');
  const f = (label, val, mode = 'text') => `<div class="f"><div class="fh"><b>${e(label)}</b><button type="button" data-c>복사</button></div>${mode === 'code' ? `<pre>${e(val)}</pre>` : `<div class="v">${e(val)}</div>`}</div>`;
  return `<section><h2>${e(k.title.en)} <small>${e(k.title.ko)} · ${e(id)}</small></h2>
${f('Book title', k.title.en)}
${f('Subtitle', k.sub.en)}
${f('Author', 'Junsang')}
${f('Description (HTML — 「HTML」 편집 모드가 아니면 보이는 글만 복사됨)', desc, 'code')}
${F.books[id].map((w, i) => f(`Keyword ${i + 1}`, w)).join('\n')}
${f('List price (USD)', k.price)}
<p class="n">ISBN: ${e(fr.isbn || '없음')}${fr.isbn ? ' — 한국 ISBN 은 PDF 판에 붙은 것이라 KDP ePub 에는 쓰지 않는다(KDP 가 주는 ASIN 으로 판다 — 확인 못 함)' : ''} · 올릴 파일: ePub(<code>에브리코리안즈_도서_…_ePub판_v2.0_…epub</code>) + 앞표지 큰 그림 JPG</p></section>`;
}).join('\n');
fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KDP 칸 채우기</title><style>
body{font:15px/1.5 system-ui,'Noto Sans KR',sans-serif;max-width:860px;margin:0 auto;padding:18px;background:#faf6ef;color:#1b1512}h1{font-size:22px}h2{font-size:18px;margin:34px 0 8px;border-top:2px solid #1b1512;padding-top:14px}h2 small{color:#8c7a66;font-weight:400;font-size:13px}
.f{margin:8px 0;padding:8px 10px;background:#fff;border:1px solid #e6dccb;border-radius:8px}.fh{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:#6b5844}.fh button{padding:3px 10px;border:1px solid #c4551c;background:#fff;color:#c4551c;border-radius:6px;font-weight:700;cursor:pointer}.fh button.ok{background:#c4551c;color:#fff}
.v{margin-top:4px;word-break:break-word}pre{margin:4px 0 0;white-space:pre-wrap;font:12.5px/1.45 ui-monospace,monospace}.n{font-size:12.5px;color:#6b5844}.top{background:#fff;border:1px solid #e6dccb;border-radius:10px;padding:10px 14px;font-size:13.5px}</style>
<h1>아마존 KDP — 칸마다 복사해서 붙여 넣기</h1>
<div class="top"><b>공통</b>: 언어 English · DRM 끄기 권장(정하는 것은 운영자) · AI 사용 표시는 사실대로 · 분류 2개 —
${F.categories.map((c) => `<br>· ${e(c)}`).join('')}<br>· KDP 로열티 70%는 판매가가 2.99~9.99달러일 때라고 알고 있다(우리 가격 9.90 · 6.90 은 그 안) — 화면의 안내로 확인. 파일 전송비는 용량 기준이라 ePub 이 작을수록 유리.</div>
${cards}
<script>document.addEventListener('click',function(ev){var b=ev.target.closest('[data-c]');if(!b)return;var f=b.closest('.f');var t=(f.querySelector('pre')||f.querySelector('.v')).innerText;navigator.clipboard.writeText(t).then(function(){b.textContent='복사됨';b.classList.add('ok');setTimeout(function(){b.textContent='복사';b.classList.remove('ok')},1500)})});</script>`);
console.log(`KDP 칸 채우기 ${Object.keys(F.books).length}권 → ${out}`);
