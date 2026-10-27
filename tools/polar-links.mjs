// 이미 만든 책 결제 링크의 「결제 뒤 돌아올 곳(success_url)」을 감사 · 리뷰 쪽(/shop/thanks/)으로 바꾼다(운영자 2026-10-27 「구매가 생기면 리뷰 물어보기」).
//   node tools/polar-links.mjs           ← 점검만(어느 링크를 바꿀지 보여 줌 — 읽기만 한다)
//   node tools/polar-links.mjs --apply   ← 진짜로 바꿈
// docs/shop.json 의 책 · 묶음 polar 링크와 같은 Polar 결제 링크를 찾아(주소 끝 토큰이 같은 것) success_url 만 바꾼다. 가격 · 상품은 건드리지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const shop = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const items = [...shop.books, ...(shop.bundles || [])].filter((x) => x.polar);
const TOKEN = process.env.POLAR_ACCESS_TOKEN;
const die = (m) => { console.error('✖ ' + m); process.exit(1); };
async function api(method, p, body) {
  const r = await fetch('https://api.polar.sh/v1' + p, { method, headers: { ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}), 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  if (!r.ok) die(`${method} ${p} → ${r.status} ${txt.slice(0, 300)}`);
  return txt ? JSON.parse(txt) : {};
}
const links = [];
for (let page = 1; ; page++) {
  const l = await api('GET', `/checkout-links/?limit=100&page=${page}`);
  links.push(...(l.items || []));
  if (page >= (l.pagination?.max_page || 1)) break;
}
let n = 0;
for (const it of items) {
  const tok = it.polar.split('/').pop();
  const hit = links.find((l) => String(l.url).split('/').pop() === tok);
  if (!hit) { console.log(`- ${it.id}: Polar 에서 링크를 못 찾음(${tok.slice(0, 12)}…)`); continue; }
  const want = `https://everykoreans.com/shop/thanks/?book=${it.id}&checkout_id={CHECKOUT_ID}`;
  if (hit.success_url === want) { console.log(`= ${it.id}: 이미 바뀌어 있음`); continue; }
  console.log(`${APPLY ? '→' : '(바꿀 것)'} ${it.id}: ${hit.success_url || '(없음)'} → ${want}`);
  if (APPLY) { await api('PATCH', `/checkout-links/${hit.id}`, { success_url: want }); n++; }
}
console.log(APPLY ? `바꾼 링크 ${n}개` : '--apply 를 붙이면 실제로 바꿈');
