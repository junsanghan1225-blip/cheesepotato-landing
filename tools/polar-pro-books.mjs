#!/usr/bin/env node
// Pro 연간 요금제에 책 PDF 를 「혜택」으로 붙인다(운영자 2026-10-28 「프로 사면 우리 책에 접근 · 프로 사는 동안에 책을 가질 수 있게」 — 연간만 · 전체 10권).
// 책 상품(Polar)마다 이미 「파일 다운로드」 혜택이 있다 — 그 혜택을 Pro 연간 상품에 더 붙인다(새로 올리지 않는다). 구독이 끝나면 Polar 가 자동으로 받기를 막는다.
//   node tools/polar-pro-books.mjs            ← 점검만(아무것도 안 바꿈)
//   node tools/polar-pro-books.mjs --apply    ← Pro 연간 상품의 혜택 목록을 바꿈(기존 혜택은 그대로 두고 책 혜택을 더한다)
// 비밀 값: POLAR_ACCESS_TOKEN 또는 환경 시크릿(api.polar.sh 로 가는 요청에 헤더가 붙음). Node 에는 NODE_USE_ENV_PROXY=1.
//   필요한 권한: products:read · products:write.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.polar.sh/v1';
const APPLY = process.argv.includes('--apply');
const H = { accept: 'application/json', 'content-type': 'application/json' };
if (process.env.POLAR_ACCESS_TOKEN) H.authorization = `Bearer ${process.env.POLAR_ACCESS_TOKEN}`;
const call = async (method, p, body) => {
  const r = await fetch(API + p, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${method} ${p}: ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : {};
};
const shop = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const books = shop.books.filter((k) => k.status === 'on' && k.polar).map((k) => k.id);
const all = [];
for (let page = 1; page < 6; page++) {
  const d = await call('GET', `/products/?limit=100&page=${page}&is_archived=false`);
  all.push(...d.items);
  if (page >= d.pagination.max_page) break;
}
const pro = all.filter((p) => p.is_recurring && p.recurring_interval === 'year' && /Pro/i.test(p.name));
if (pro.length !== 1) { console.error(`Pro 연간 상품이 ${pro.length}개라 멈춘다(1개여야 한다):`, pro.map((p) => p.name)); process.exit(1); }
const target = pro[0];
const bookProducts = books.map((id) => all.find((p) => !p.is_recurring && p.metadata?.book_id === id)).filter(Boolean);
const missing = books.filter((id) => !bookProducts.some((p) => p.metadata?.book_id === id));
if (missing.length) console.log('Polar 상품이 없는 책(건너뜀):', missing.join(', '));
const bookBenefits = [...new Set(bookProducts.flatMap((p) => p.benefits.filter((b) => b.type === 'downloadables').map((b) => b.id)))];
const have = target.benefits.map((b) => b.id);
const next = [...new Set([...have, ...bookBenefits])];
console.log(`대상: ${target.name} (${target.id.slice(0, 8)}) · 지금 혜택 ${have.length}개 → ${next.length}개 (책 ${bookBenefits.length}권 몫 · 묶음 상품은 책 혜택이 겹쳐 따로 안 붙임)`);
for (const p of bookProducts) console.log(`  + ${p.name}`);
if (!APPLY) { console.log('\n위 내용이 맞으면 --apply 를 붙여 다시 실행.'); process.exit(0); }
/* Polar 의 「상품 혜택 바꾸기」 — 목록 전체를 보낸다(그래서 기존 혜택을 먼저 합쳤다) */
const res = await call('POST', `/products/${target.id}/benefits`, { benefits: next });
console.log(`\n✔ 완료 — ${res.name || target.name} 혜택 ${(res.benefits || []).length}개`);
