// 선물 · 소개 요청용 Pro 코드 만들기(운영자 2026-10-29 「코드 SQL 이랑 문안 만들어줘」).
//   node tools/gift-codes.mjs [--n 20] [--days 90] [--max 3] [--expires 2027-03-31] [--out 폴더]
// 만드는 것: ① SQL(Supabase SQL Editor 에 붙여 넣기 — book_codes 에 줄을 더한다. 표 · 함수는 db/add_book_codes.sql 이 이미 만든다) ② CSV(받는 사람 적는 표 + 링크).
// ⚠ 코드는 Pro 를 여는 열쇠라 **저장소에 올리지 않는다**(공개 저장소). 나온 파일은 운영자에게만 보낸다. 결과는 --out 폴더(기본: books-out/).
// 코드 모양은 CP-CR-XXXXXX(app.module.js 의 ?bk= 규칙 · 「선물」 환영 카드가 CP-CR- 로 가른다). 헷갈리는 글자(I O 0 1)는 뺀다.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const N = +opt('--n', 20), DAYS = +opt('--days', 90), MAX = +opt('--max', 3), EXP = opt('--expires', '2027-03-31');
const out = path.resolve(opt('--out', path.join(ROOT, 'books-out')));
if (!(N >= 1 && N <= 200) || !(DAYS >= 1 && DAYS <= 365) || !(MAX >= 1 && MAX <= 100) || !/^\d{4}-\d{2}-\d{2}$/.test(EXP)) { console.error('값이 이상해요 (n 1~200 · days 1~365 · max 1~100 · expires YYYY-MM-DD)'); process.exit(1); }
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const make = () => 'CP-CR-' + Array.from(crypto.randomBytes(6), (b) => ALPHA[b % ALPHA.length]).join('');
const codes = new Set(); while (codes.size < N) codes.add(make());
const rows = [...codes].map((c, i) => ({ c, label: `gift-${String(i + 1).padStart(2, '0')}` }));
const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
fs.mkdirSync(out, { recursive: true });
const sql = `-- 선물 · 소개 요청용 Pro 코드 ${N}개 (${stamp}). Supabase 대시보드 → SQL Editor 에 붙여 넣고 Run. 두 번 돌려도 괜찮다.
-- 먼저 돌려 둘 것: db/add_book_codes.sql (표 · redeem_book_code 함수). 이 파일은 저장소에 올리지 않는다(코드는 열쇠다).
-- 코드 하나 = Pro ${DAYS}일 · 한 계정이 한 번 · 총 ${MAX}번까지 · ${EXP} 에 끝.
insert into book_codes (code, book, days, max_uses, expires_at) values
${rows.map((r) => `  ('${r.c}', '${r.label}', ${DAYS}, ${MAX}, '${EXP}')`).join(',\n')}
on conflict (code) do nothing;

-- 쓴 횟수 보기(누가 열었나):  select code, book, uses, max_uses from book_codes where code like 'CP-CR-%' order by book;
-- 코드 막기(잘못 보냈을 때):  update book_codes set active = false where code = 'CP-CR-XXXXXX';
`;
const csv = '﻿번호,코드,링크,받는 사람,보낸 날,답장,메모\n' + rows.map((r) => `${r.label},${r.c},https://everykoreans.com/?bk=${r.c}&utm_source=gift&utm_medium=dm&utm_campaign=${r.label},,,,`).join('\n') + '\n';
const f1 = path.join(out, `에브리코리안즈_선물코드_01_Pro${DAYS}일${N}개_SQL_v1.0_${stamp}.sql`);
const f2 = path.join(out, `에브리코리안즈_선물코드_01_Pro${DAYS}일${N}개_받는사람표_v1.0_${stamp}.csv`);
fs.writeFileSync(f1, sql); fs.writeFileSync(f2, csv);
console.log(`선물 코드 ${N}개 (Pro ${DAYS}일 · 코드당 ${MAX}번 · ~${EXP})\n  ${f1}\n  ${f2}\n⚠ 두 파일은 저장소에 올리지 않는다.`);
