// 책 묶음을 Polar 에 상품 하나로 올린다(운영자 2026-10-27 「5번 묶음 상품 준비」).
// 이미 올라간 책 상품들의 「파일 다운로드」 혜택을 한 상품에 같이 붙이므로 PDF 를 다시 올리지 않는다 — 책 상품이 먼저 있어야 한다(tools/polar-publish.mjs).
//   node tools/polar-bundle.mjs <묶음 id>            ← 점검만(인터넷 안 씀)
//   node tools/polar-bundle.mjs <묶음 id> --apply    ← 진짜로 올림(상품 + 결제 링크 → docs/shop.json 의 그 묶음 polar · status on)
// 묶음 정의는 docs/shop.json 의 bundles. 인증은 polar-publish.mjs 와 같다(환경 변수 POLAR_ACCESS_TOKEN 또는 환경 시크릿).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
const APPLY = process.argv.includes('--apply');
const die = (m) => { console.error('✖ ' + m); process.exit(1); };
const shopFile = path.join(ROOT, 'docs/shop.json');
const shop = JSON.parse(fs.readFileSync(shopFile, 'utf8'));
const bundle = (shop.bundles || []).find((b) => b.id === id);
if (!bundle) die(`docs/shop.json 의 bundles 에 「${id}」 가 없다. 있는 것: ${(shop.bundles || []).map((b) => b.id).join(', ') || '(없음)'}`);
if (bundle.polar) die('이미 Polar 링크가 있다. 이 도구는 새 묶음만 만든다.');
const books = bundle.books.map((bid) => shop.books.find((k) => k.id === bid) || die(`책 「${bid}」 이(가) shop.json 에 없다`));
const cents = Math.round(parseFloat(bundle.price) * 100);
const sum = books.reduce((a, k) => a + parseFloat(k.price), 0);
const description = [
  bundle.sub.en, '',
  '**Included** (three separate PDF files)', ...books.map((k) => `- ${k.title.en}`), '',
  `Bought separately these cost $${sum.toFixed(2)}.`,
  '', 'You get the files right after payment and can download them again from your Polar customer portal.',
].join('\n');
console.log(`${APPLY ? '올리기' : '점검만(--apply 가 없어 아무것도 안 올림)'}\n  묶음: ${bundle.id} — ${bundle.title.en}\n  가격: $${(cents / 100).toFixed(2)} (따로 사면 $${sum.toFixed(2)}, ${Math.round((1 - cents / 100 / sum) * 100)}% 싸다)\n  들어갈 책: ${books.map((k) => k.id).join(' · ')}\n${description.split('\n').map((l) => '    ' + l).join('\n')}`);
if (!APPLY) process.exit(0);

const TOKEN = process.env.POLAR_ACCESS_TOKEN;
const API = 'https://api.polar.sh/v1';
async function api(method, p, body) {
  const r = await fetch(API + p, { method, headers: { ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}), 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  if (!r.ok) die(`${method} ${p} → ${r.status} ${txt.slice(0, 400)}`);
  return txt ? JSON.parse(txt) : {};
}
const all = [];
for (let page = 1; ; page++) {
  const l = await api('GET', `/products/?limit=100&page=${page}&is_archived=false`);
  all.push(...(l.items || []));
  if (page >= (l.pagination?.max_page || 1)) break;
}
if (all.some((p) => p.metadata?.bundle_id === id)) die(`Polar 에 이미 묶음 「${id}」 상품이 있다.`);
const benefitIds = books.map((k) => {
  const p = all.find((x) => x.metadata?.book_id === k.id) || die(`Polar 에 책 「${k.id}」 상품이 없다 — 먼저 tools/polar-publish.mjs 로 올릴 것`);
  const b = (p.benefits || []).find((x) => x.type === 'downloadables') || die(`책 「${k.id}」 상품에 파일 다운로드 혜택이 없다`);
  return b.id;
});
console.log('① 묶음 상품 만드는 중…');
const made = await api('POST', '/products/', { name: bundle.title.en, description, prices: [{ amount_type: 'fixed', price_amount: cents, price_currency: 'usd' }], recurring_interval: null, metadata: { bundle_id: id } });
await api('POST', `/products/${made.id}/benefits`, { benefits: benefitIds });
console.log('② 결제 링크 만드는 중…');
const link = await api('POST', '/checkout-links/', { payment_processor: 'stripe', products: [made.id], label: id, allow_discount_codes: true, require_billing_address: false, success_url: `https://everykoreans.com/shop/thanks/?book=${id}&checkout_id={CHECKOUT_ID}` });
console.log(`\n✔ 완료  상품 ${made.id}\n  결제 링크: ${link.url}`);
bundle.polar = link.url; bundle.status = 'on';
fs.writeFileSync(shopFile, JSON.stringify(shop, null, 1) + '\n');
console.log('  docs/shop.json 에 적었다 → node tools/build-sheets.mjs 를 돌린 뒤 올리기.');
