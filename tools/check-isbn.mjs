// ISBN 신청서 · 표지 · 판권지가 서로 어긋나지 않는지 본다.
// 2026-10-26 한국서지표준센터 보완 요청: 부제목(신청서 ≠ 표지) · 저자명(한준상 ≠ 준상(Junsang)) · 발행일(20261110 ≠ 2026.11).
// 한 곳(책 틀 docs/books/<id>.json)에서 나온 값과 docs/ops/isbn-forms.md 의 신청 값이 같아야 한다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const bad = [];
const dir = path.join(ROOT, 'docs/books');
const books = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.endsWith('.think.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

/* 1) 책의 부제목 = 표지에 찍히는 부제목 */
for (const B of books) if (B.coverLevel?.sub && B.sub?.ko !== B.coverLevel.sub) bad.push(`${B.id}: 부제목(sub.ko 「${B.sub?.ko}」)이 표지 부제목(coverLevel.sub 「${B.coverLevel.sub}」)과 다르다`);

/* 1-2) 승인된 ISBN(책 틀 isbn): 13자리 검산 숫자가 맞고, 바코드 그림(assets/books/<id>/isbn-barcode.png)이 있어야 한다 */
for (const B of books) if (B.isbn) {
  const d = B.isbn.replace(/-/g, '');
  const sum = [...d.slice(0, 12)].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0);
  if (!/^979-11-\d+-\d+-\d$/.test(B.isbn) || d.length !== 13 || (10 - (sum % 10)) % 10 !== Number(d[12])) bad.push(`${B.id}: ISBN 「${B.isbn}」 모양 · 검산 숫자가 틀리다`);
  if (!B.isbnPrice) bad.push(`${B.id}: isbn 이 있으면 isbnPrice(정가)도 있어야 한다`);
  if (!fs.existsSync(path.join(ROOT, `assets/books/${B.id}/isbn-barcode.png`))) bad.push(`${B.id}: 바코드 그림 assets/books/${B.id}/isbn-barcode.png 이 없다`);
}

/* 2) 신청서 값 = 책 값 */
const doc = fs.readFileSync(path.join(ROOT, 'docs/ops/isbn-forms.md'), 'utf8');
const date = (doc.match(/\|\s*발행일\s*\|\s*(\d{4})-(\d{2})-(\d{2})\s*\|/) || []);
const want = date.length ? `${date[1]}.${date[2]}.${date[3]}` : null;
if (!want) bad.push('isbn-forms.md: 「| 발행일 | YYYY-MM-DD |」 줄이 없다');
const secs = doc.split(/\n## (?=\d\d\. )/).slice(1);
for (const sec of secs) {
  const title = (sec.match(/^\d\d\.\s*(.+)/) || [])[1]?.trim();
  const B = books.find((b) => b.title?.ko === title);
  if (!B) { bad.push(`isbn-forms.md: 「${title}」에 맞는 책 틀(docs/books)이 없다`); continue; }
  const cell = (k) => (sec.match(new RegExp(`\\|\\s*${k}\\s*\\|\\s*(.*?)\\s*\\|`)) || [])[1];
  const sub = cell('부제목'), au = cell('저자명');
  if (sub !== B.sub.ko) bad.push(`${B.id}: 신청서 부제목 「${sub}」 ≠ 책 부제목 「${B.sub.ko}」`);
  const wantAu = `${B.author.ko}(${B.author.en})`;
  if (au !== wantAu) bad.push(`${B.id}: 신청서 저자명 「${au}」 ≠ 표지 「${wantAu}」`);
  const pk = (sec.match(/지은이\s+(.+)/) || [])[1]?.trim(), pd = (sec.match(/\n발행\s+(\S+)/) || [])[1];
  if (pk !== `${B.author.ko} (${B.author.en})`) bad.push(`${B.id}: 판권지 지은이 「${pk}」 ≠ 「${B.author.ko} (${B.author.en})」`);
  if (want && B.published !== want) bad.push(`${B.id}: 책 틀 published 「${B.published}」 ≠ 신청서 발행일 「${want}」 (판권쪽에 찍히는 발행일)`);
  if (want && pd !== want) bad.push(`${B.id}: 판권지 발행 「${pd}」 ≠ 신청서 발행일 「${want}」`);
}
if (bad.length) { console.error('ISBN 신청서 · 표지 · 판권지 검사 — 어긋남:\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log(`ISBN 검사 — 통과 (책 ${books.length}권 부제목 · 신청서 ${secs.length}권 저자 · 발행일)`);
