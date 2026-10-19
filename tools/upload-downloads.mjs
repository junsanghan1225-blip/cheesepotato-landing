// private-downloads/ 의 파일을 Supabase 비공개 저장 칸 downloads-private 에 올린다(운영자 2026-10-19 「B」). .github/workflows/downloads-sync.yml 이 부른다.
//   node tools/build-downloads.mjs && node tools/upload-downloads.mjs
// 열쇠는 환경 변수 SUPABASE_SERVICE_KEY 로만 받는다(로그 · 파일에 안 찍는다).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SB = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_KEY;
if (!KEY) { console.error('✗ SUPABASE_SERVICE_KEY 가 없어요 — GitHub Secrets 에 넣어 주세요(docs/ops/shorts-auto.md 0-2).'); process.exit(1); }
const dir = 'private-downloads';
const files = readdirSync(dir).filter((f) => /\.(csv|txt)$/.test(f));
if (!files.length) { console.error('✗ private-downloads/ 가 비어 있어요 — 먼저 node tools/build-downloads.mjs'); process.exit(1); }
let bad = 0;
for (const f of files) {
  const r = await fetch(`${SB}/storage/v1/object/downloads-private/${f}`, { method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': f.endsWith('.csv') ? 'text/csv' : 'text/plain', 'x-upsert': 'true' }, body: readFileSync(join(dir, f)) });
  if (!r.ok) { bad++; console.error(`✗ ${f}: ${r.status} ${(await r.text()).slice(0, 160)}`); } else console.log(`✓ ${f}`);
}
if (bad) process.exit(1);
console.log(`비공개 저장 칸에 ${files.length}개 올림`);
