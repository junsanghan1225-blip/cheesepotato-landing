// 이미 있는 Polar 상품의 표지 그림만 바꾼다(운영자 2026-11-11 「폴라도 바꿔줘」 — 새 TOPIK 표지).
//   node tools/polar-cover.mjs <책 id> <표지 그림.jpg>            ← 점검만(어느 상품인지 · 지금 그림 수)
//   node tools/polar-cover.mjs <책 id> <표지 그림.jpg> --apply    ← 그림 올리고 상품 그림을 그것 하나로
// 상품은 metadata.book_id 로 찾는다(polar-publish 가 적어 둔 것). 가격 · 파일 · 설명은 건드리지 않는다.
// 인증은 polar-publish 와 같다 — POLAR_ACCESS_TOKEN 이 있으면 그것, 없으면 환경 시크릿이 api.polar.sh 요청에 붙인다.
import fs from 'fs';
import crypto from 'crypto';
const [id, img] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const APPLY = process.argv.includes('--apply');
const die = (m) => { console.error('✖ ' + m); process.exit(1); };
if (!id || !img || !fs.existsSync(img)) die('쓰는 법: node tools/polar-cover.mjs <책 id> <표지.jpg> [--apply]');
const API = 'https://api.polar.sh/v1', TOKEN = process.env.POLAR_ACCESS_TOKEN;
async function api(method, p, body) {
  const r = await fetch(API + p, { method, headers: { ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}), 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); if (!r.ok) die(`${method} ${p} → ${r.status} ${t.slice(0, 300)}`); return t ? JSON.parse(t) : {};
}
const all = [];
for (let page = 1; ; page++) { const l = await api('GET', `/products/?limit=100&page=${page}&is_archived=false`); all.push(...(l.items || [])); if (page >= (l.pagination?.max_page || 1)) break; }
const hits = all.filter((p) => p.metadata?.book_id === id);
if (hits.length !== 1) die(`book_id 「${id}」 상품이 ${hits.length}개다(하나여야 한다).`);
const prod = hits[0], buf = fs.readFileSync(img);
console.log(`상품: ${prod.name} (${prod.id.slice(0, 8)}) · 지금 그림 ${prod.medias?.length || 0}장 → 새 그림 ${(buf.length / 1024).toFixed(0)}KB`);
if (!APPLY) { console.log('점검만 — 맞으면 --apply'); process.exit(0); }
const sha = (b) => crypto.createHash('sha256').update(b).digest('base64');
const file = await api('POST', '/files/', { service: 'product_media', name: `${id}-cover.jpg`, mime_type: 'image/jpeg', size: buf.length, checksum_sha256_base64: sha(buf), upload: { parts: [{ number: 1, chunk_start: 0, chunk_end: buf.length, checksum_sha256_base64: sha(buf) }] } });
const up = file.upload.parts[0];
const r = await fetch(up.url, { method: 'PUT', headers: up.headers || {}, body: buf });
if (!r.ok) die(`그림 올리기 실패 ${r.status}`);
await api('POST', `/files/${file.id}/uploaded`, { id: file.upload.id, path: file.upload.path, parts: [{ number: 1, checksum_etag: r.headers.get('etag'), checksum_sha256_base64: up.checksum_sha256_base64 }] });
await api('PATCH', `/products/${prod.id}`, { medias: [file.id] });
console.log('✔ 상품 그림을 새 표지로 바꿨다.');
