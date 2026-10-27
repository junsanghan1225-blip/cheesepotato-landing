// 책 한 권을 Polar 에 상품으로 올린다(운영자 2026-10-27 「API 받아서 편하게」).
// 하는 일: PDF 올리기 → 「파일 다운로드」 혜택 → 상품(한 번 결제 · 달러) → 결제 링크 → docs/shop.json 의 polar 에 적기.
//
// 쓰는 법
//   node tools/polar-publish.mjs <책 id> --pdf <PDF 경로>            ← 점검만(인터넷 안 씀, 아무것도 안 올림)
//   node tools/polar-publish.mjs <책 id> --pdf <PDF 경로> --apply    ← 진짜로 올림
//   node tools/polar-publish.mjs <책 id> --pdf <PDF 경로> --apply --sandbox   ← Polar 연습장(sandbox)에 올림(링크는 shop.json 에 안 적음)
//
// 비밀 값: 토큰은 환경 변수 POLAR_ACCESS_TOKEN 에서만 읽는다. 코드 · 채팅 · 커밋에 적지 않는다(CLAUDE.md §3).
//   필요한 권한(scope): files:write · benefits:write · products:write · checkout_links:write · products:read
//   (주문 · 고객 · 환불 쓰기 권한은 주지 않는다).
// 같은 책을 두 번 올리지 않는다 — 상품 메타데이터 book_id 로 이미 있는지 먼저 본다. 이미 있으면 멈추고 알려 준다.
// 상품이 이미 있는 책의 파일 · 가격 바꾸기는 이 도구가 하지 않는다(Polar 대시보드에서).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const id = args.find((a) => !a.startsWith('--') && a !== opt('--pdf'));
const pdfPath = opt('--pdf');
const APPLY = flag('--apply');
const SANDBOX = flag('--sandbox');
const API = SANDBOX ? 'https://sandbox-api.polar.sh/v1' : 'https://api.polar.sh/v1';
const PART = 10 * 1024 * 1024; // 올릴 때 10MB 씩 나눠 보낸다(S3 규칙: 마지막 조각 말고는 5MB 이상)

const die = (m) => { console.error('✖ ' + m); process.exit(1); };
if (!id || !pdfPath) die('쓰는 법: node tools/polar-publish.mjs <책 id> --pdf <PDF 경로> [--apply] [--sandbox]');

/* 1) 책 정보 — docs/shop.json(상품 목록) + docs/books/<id>.json(ISBN) */
const shopFile = path.join(ROOT, 'docs/shop.json');
const shop = JSON.parse(fs.readFileSync(shopFile, 'utf8'));
const book = shop.books.find((b) => b.id === id);
if (!book) die(`docs/shop.json 에 책 「${id}」 이(가) 없다. 있는 책: ${shop.books.map((b) => b.id).join(', ')}`);
if (book.polar && !SANDBOX) die(`「${id}」 은(는) 이미 Polar 링크가 있다(${book.polar.slice(0, 40)}…). 이 도구는 새 상품만 만든다.`);
const frame = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8')); } catch { return {}; } })();
const cents = Math.round(parseFloat(book.price) * 100);
if (!(cents >= 50)) die(`가격 「${book.price}」 이(가) 이상하다`);
if (!fs.existsSync(pdfPath)) die(`PDF 가 없다: ${pdfPath}`);
const pdf = fs.readFileSync(pdfPath);
if (pdf.slice(0, 5).toString() !== '%PDF-') die('PDF 파일이 아니다(맨 앞이 %PDF- 가 아님)');
const cover = path.join(ROOT, `assets/books/${id}/cover.jpg`);

const description = [
  book.about.en, '',
  '**Who it is for**', ...book.for.en.map((x) => `- ${x}`), '',
  `**Format** · PDF download (${book.pages.replace(/쪽/, ' pages').replace(/\(.*\)/, '').trim()})` + (frame.isbn ? ` · ISBN ${frame.isbn}` : ''),
  '', 'You get the file right after payment and can download it again from your Polar customer portal.',
].join('\n');
const product = {
  name: book.title.en,
  description,
  prices: [{ amount_type: 'fixed', price_amount: cents, price_currency: 'usd' }],
  recurring_interval: null,
  metadata: { book_id: id },
};
const fmt = (n) => (n / 1048576).toFixed(1) + 'MB';
console.log(`${SANDBOX ? '[연습장 sandbox] ' : ''}${APPLY ? '올리기' : '점검만(--apply 가 없어 아무것도 안 올림)'}`);
console.log(`  책: ${id} — ${book.title.ko} / ${book.title.en}`);
console.log(`  가격: $${(cents / 100).toFixed(2)} (한 번 결제) · PDF ${fmt(pdf.length)} · 표지 그림 ${fs.existsSync(cover) ? '있음' : '없음'}${frame.isbn ? ' · ISBN ' + frame.isbn : ''}`);
console.log(`  파일 이름(받는 사람에게 보임): ${path.basename(pdfPath)}`);
console.log('  상품 설명(영어):\n' + description.split('\n').map((l) => '    ' + l).join('\n'));
if (!APPLY) { console.log('\n위 내용이 맞으면 --apply 를 붙여 다시 실행.'); process.exit(0); }

/* 2) 진짜로 올리기 */
const TOKEN = process.env.POLAR_ACCESS_TOKEN;
if (!TOKEN) die('환경 변수 POLAR_ACCESS_TOKEN 이 없다(환경 설정에서 넣어야 한다. 채팅에 적지 말 것).');

async function api(method, p, body) {
  const r = await fetch(API + p, { method, headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  if (!r.ok) die(`${method} ${p} → ${r.status} ${txt.slice(0, 400)}`);
  return txt ? JSON.parse(txt) : {};
}

/** 파일을 나눠서 올리고 Polar 에 「다 올렸다」고 알린다. service: downloadable | product_media */
async function upload(buf, name, mime, service) {
  const parts = [];
  for (let s = 0, n = 1; s < buf.length; s += PART, n++) {
    const e = Math.min(s + PART, buf.length);
    parts.push({ number: n, chunk_start: s, chunk_end: e, checksum_sha256_base64: crypto.createHash('sha256').update(buf.subarray(s, e)).digest('base64') });
  }
  const file = await api('POST', '/files/', {
    service, name, mime_type: mime, size: buf.length,
    checksum_sha256_base64: crypto.createHash('sha256').update(buf).digest('base64'),
    upload: { parts },
  });
  const done = [];
  for (const up of file.upload.parts) {
    const r = await fetch(up.url, { method: 'PUT', headers: up.headers || {}, body: buf.subarray(up.chunk_start, up.chunk_end) });
    if (!r.ok) die(`조각 ${up.number} 올리기 실패 ${r.status}`);
    done.push({ number: up.number, checksum_etag: r.headers.get('etag'), checksum_sha256_base64: up.checksum_sha256_base64 });
  }
  await api('POST', `/files/${file.id}/uploaded`, { id: file.upload.id, path: file.upload.path, parts: done });
  return file.id;
}

// 같은 책이 이미 있으면 멈춘다(두 번 만들지 않기)
for (let page = 1; ; page++) {
  const list = await api('GET', `/products/?limit=100&page=${page}&is_archived=false`);
  const hit = (list.items || []).find((p) => p.metadata?.book_id === id);
  if (hit) die(`Polar 에 이미 「${id}」 상품이 있다(${hit.id}). 파일 · 가격을 바꾸려면 Polar 대시보드에서.`);
  if (page >= (list.pagination?.max_page || 1)) break;
}

console.log('① PDF 올리는 중…');
const fileId = await upload(pdf, path.basename(pdfPath), 'application/pdf', 'downloadable');
let mediaId = null;
if (fs.existsSync(cover)) { console.log('② 표지 그림 올리는 중…'); mediaId = await upload(fs.readFileSync(cover), `${id}-cover.jpg`, 'image/jpeg', 'product_media'); }
console.log('③ 「파일 다운로드」 혜택 만드는 중…');
const benefit = await api('POST', '/benefits/', { type: 'downloadables', description: `${book.title.en} (PDF)`, properties: { files: [fileId] } });
console.log('④ 상품 만드는 중…');
const made = await api('POST', '/products/', { ...product, ...(mediaId ? { medias: [mediaId] } : {}) });
await api('POST', `/products/${made.id}/benefits`, { benefits: [benefit.id] });
console.log('⑤ 결제 링크 만드는 중…');
const link = await api('POST', '/checkout-links/', { payment_processor: 'stripe', products: [made.id], label: id, allow_discount_codes: true, require_billing_address: false, success_url: 'https://everykoreans.com/shop/' });
console.log(`\n✔ 완료  상품 ${made.id}\n  결제 링크: ${link.url}`);

/* 3) 연습장이 아니면 shop.json 에 링크 적기(상태 「판매 중」) */
if (SANDBOX) console.log('  (연습장이라 docs/shop.json 은 건드리지 않음)');
else {
  book.polar = link.url;
  book.status = 'on';
  fs.writeFileSync(shopFile, JSON.stringify(shop, null, 1) + '\n');
  console.log('  docs/shop.json 에 적었다 → node tools/build-sheets.mjs 를 돌린 뒤 올리기.');
}
