// 아마존 KDP 칸마다 「복사」 단추가 있는 HTML 한 장(운영자 2026-10-27 「KDP 올리기 준비」). KDP 에는 올리기 API 가 없어 운영자가 화면에서 직접 올린다 — 붙여 넣을 글만 쉽게.
//   node tools/kdp-html.mjs <나가는 파일.html>
// 글의 출처: docs/shop.json(제목 · 소개 · 대상 · 가격) + docs/books/<id>.json(부제 · ISBN) + docs/ops/kdp-fields.json(키워드 · 분류). 생성물은 저장소에 올리지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, copyPage } from './lib/copy-page.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2];
if (!out) { console.error('쓰는 법: node tools/kdp-html.mjs <나가는 파일.html>'); process.exit(1); }
const shop = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const F = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/ops/kdp-fields.json'), 'utf8'));
const e = (s) => esc(s).replace(/"/g, '&quot;');
const QR = new Set(['first-steps-workbook', 'particles-workbook', 'topik2-vocab-1000', 'topik2-vocab-2000', 'topik2-vocab-lv3']);
const TOPIK = (k) => k.series === 'topik' || /TOPIK/.test(k.title.en);
const NOTE_TOPIK = 'TOPIK is the name of a test run by the National Institute for International Education (NIIED). This is an independent study book and is not operated, endorsed or certified by NIIED or the TOPIK Center. All questions are newly written and are not past exam papers.';
const NOTE_PLAIN = 'All sentences are newly written for this book.';

/* KDP 가 상호작용형 책(QR · 쓰기 줄 · 웹 연습)을 내렸다(2026-10-28) — 책 틀에 kdp 칸이 있는 KDP 전용 판만 올린다. 나머지는 KDP 판을 만들 때까지 뺀다. */
const cards = Object.keys(F.books).filter((id) => JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8')).kdp).map((id) => {
  const k = shop.books.find((b) => b.id === id);
  const fr = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8'));
  const kd = fr.kdp;   // KDP 전용 판(책 틀 kdp 칸): 제목 · 소개 · 키워드가 따로고 QR · 웹 혜택 문장이 없다(KDP 가 상호작용형 책을 막아서)
  const L = kd?.listing;
  const desc = [
    `<p><b>${e(kd?.sub?.en || k.sub.en)}</b></p>`,
    `<p>${e(L?.about || k.about.en)}</p>`,
    '<p><b>Who it is for</b></p>',
    `<ul>${(L?.for || k.for.en).map((x) => `<li>${e(x)}</li>`).join('')}</ul>`,
    kd ? '<p>Answer key at the back. Written by a Korean teacher.</p>' : `<p>Answer key at the back${QR.has(id) ? ', a QR code in each unit to free online practice on everykoreans.com' : ''}, and a reader bonus for free Pro access on everykoreans.com. Written by a Korean teacher.</p>`,
    `<p><i>${e(TOPIK(k) ? NOTE_TOPIK : NOTE_PLAIN)}</i></p>`,
  ].join('\n');
  const kw = L?.keywords || F.books[id];
  const f = (label, val, mode = 'text') => `<div class="f"><div class="fh"><b>${e(label)}</b><button type="button" data-c>복사</button></div>${mode === 'code' ? `<pre>${e(val)}</pre>` : `<div class="v">${e(val)}</div>`}</div>`;
  return `<section><h2>${e(kd?.title?.en || k.title.en)} <small>${e(k.title.ko)} · ${e(id)}</small></h2>
${f('Book title', kd?.title?.en || k.title.en)}
${f('Subtitle', kd?.sub?.en || k.sub.en)}
${f('Author', 'Junsang')}
${f('Description (HTML — 「HTML」 편집 모드가 아니면 보이는 글만 복사됨)', desc, 'code')}
${kw.map((w, i) => f(`Keyword ${i + 1}`, w)).join('\n')}
${f('List price (USD)', k.price)}
<p class="n">ISBN: ${e(fr.isbn || '없음')}${fr.isbn ? ' — 한국 ISBN 은 PDF 판에 붙은 것이라 KDP ePub 에는 쓰지 않는다(KDP 가 주는 ASIN 으로 판다 — 확인 못 함)' : ''} · 올릴 파일: ePub(<code>에브리코리안즈_도서_…_ePub판_v2.0_…epub</code>) + 앞표지 큰 그림 JPG</p></section>`;
}).join('\n');
fs.writeFileSync(out, copyPage({ title: 'KDP 칸 채우기', width: 860, h2: [34, 14], css: 'h2 small{color:#8c7a66;font-weight:400;font-size:13px}.v{margin-top:4px;word-break:break-word}pre{margin:4px 0 0;white-space:pre-wrap;font:12.5px/1.45 ui-monospace,monospace}.n{font-size:12.5px;color:#6b5844}', body: `<h1>아마존 KDP — 칸마다 복사해서 붙여 넣기</h1>
<div class="top"><b>공통</b>: 언어 English · DRM 끄기 권장(정하는 것은 운영자) · AI 사용 표시는 사실대로 · 분류 2개 —
${F.categories.map((c) => `<br>· ${e(c)}`).join('')}<br>· KDP 로열티 70%는 판매가가 2.99~9.99달러일 때라고 알고 있다(우리 가격 9.90 · 6.90 은 그 안) — 화면의 안내로 확인. 파일 전송비는 용량 기준이라 ePub 이 작을수록 유리.</div>
${cards}` }));
console.log(`KDP 칸 채우기 ${cards.split("<section>").length - 1}권(KDP 전용 판만) → ${out}`);
