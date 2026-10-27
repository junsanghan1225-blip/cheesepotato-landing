// 책 상세 쪽(/shop/<id>/)에 들어갈 「목차 · 미리보기 · 책 정보」를 완성본 PDF 에서 만들어 docs/shop.json 의 그 책 page 에 넣는다
// (운영자 2026-10-27 「책마다 서점처럼 속지 · 미리보기」). 손으로 쓴 글(한 줄 제목 · 특징 · 문제 · 3단계 …)은 docs/shop-copy.json.
//   node tools/make-book-page.mjs <책 id> --pdf <완성본.pdf(앞표지 + 속지)>
// 하는 일: ① PDF 목차 쪽을 읽어 단원 · 쪽 번호 ② 대표 쪽 8장을 골라 assets/books/<id>/pv-1..8.jpg(749×1058) ③ 책 정보(쪽수 · 단원 수 · ISBN · 발행일 · 가격).
// 완성본은 파는 파일이라 저장소에 없다 — 미리보기는 책 속 8쪽만 그림으로 둔다.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2);
const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
const id = a.find((x) => !x.startsWith('--') && x !== opt('--pdf'));
const pdf = opt('--pdf');
if (!id || !pdf) { console.error('쓰는 법: node tools/make-book-page.mjs <책 id> --pdf <완성본.pdf>'); process.exit(1); }

const shopFile = path.join(ROOT, 'docs/shop.json');
const shop = JSON.parse(fs.readFileSync(shopFile, 'utf8'));
const book = shop.books.find((b) => b.id === id);
if (!book) { console.error(`docs/shop.json 에 「${id}」 없음`); process.exit(1); }
const copy = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop-copy.json'), 'utf8'))[id] || {};
let frame = {}; try { frame = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8')); } catch {}

const n = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }))[1]);
const txt = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\f');
const head3 = (i) => (txt[i] || '').split('\n').filter((l) => l.trim()).slice(0, 4).join(' \n');

/* ① 목차 — 「Contents · 목차」 쪽부터 쪽 번호가 붙은 줄을 모은다. 쪽 번호는 책에 인쇄된 번호(PDF 쪽 − 1) */
const tocStart = txt.findIndex((t, i) => i < 20 && /Contents · 목차/.test(head3(i)));
if (tocStart < 0) { console.error('목차 쪽을 못 찾았다'); process.exit(1); }
const parts = []; let cur = null;
for (let pg = tocStart; pg < n; pg++) {
  const found = []; let c2 = cur; let items = 0;
  for (const l of txt[pg].split('\n').filter((x) => x.trim())) {
    if (/^\s*Contents · 목차/.test(l)) continue;
    const m = /^\s*(.*?\S)\s{2,}(\d{1,3})\s*$/.exec(l);
    if (m) { if (!c2) { c2 = { head: '', items: [] }; found.push(c2); } c2.items.push([m[1].replace(/\s+/g, ' '), String(m[2])]); items++; }
    else if (/^(PART|BACK|BEFORE|Part)\b/i.test(l.trim())) { c2 = { head: l.trim().replace(/\s+/g, ' '), items: [] }; found.push(c2); }
  }
  if (!items) break;
  parts.push(...found); cur = c2;
}
const split2 = (s) => { const m = /[가-힣]/.exec(s); return m ? { en: s.slice(0, m.index).trim().replace(/[·\-–]\s*$/, '').trim(), ko: s.slice(m.index).trim() } : { en: s, ko: '' }; };
const contents = parts.filter((p) => p.items.length).map((p) => ({ part: p.head ? split2(p.head) : { en: 'Front matter', ko: '앞부분' }, items: p.items }));
const unitRe = /^\d{2}\s/;
const units = contents.flatMap((c) => c.items).filter(([t]) => unitRe.test(t)).length;

/* ② 대표 쪽 — 역할마다 첫 번째로 맞는 쪽, 부족하면 책 속을 고르게 */
const find = (re, from = 0, to = n, lines = 4) => { for (let i = from; i < Math.min(to, n); i++) if (re.test(head3(i).replace(/\s+/g, ' ')) && (lines || true)) return i; return -1; };
const findAny = (re, from = 0, to = n) => { for (let i = from; i < Math.min(to, n); i++) if (re.test(txt[i] || '')) return i; return -1; };
const toc = tocStart;
const opener = Math.max(findAny(/UNIT 0?1\b/, toc + 1), 0);
const picks = [
  [toc, ['Contents', '목차']],
  [find(/How to use this book|이 책 쓰는 법/, 0, toc), ['How to use this book', '이 책 쓰는 법']],
  [opener, ['First unit', '첫 단원']],
  [opener + 1, ['Inside a unit', '단원 안']],
  [findAny(/연습 \d+-\d|문제 \d+-\d|Practice [A-D]:|Practice Test/, opener + 2), ['Practice', '연습']],
  [findAny(/점검 \d+-\d|Unit Checkup|Mini test|미니 테스트/, opener + 2), ['Checkup', '점검']],
  [findAny(/Answer Key|정답/, Math.floor(n * 0.5)), ['Answer key', '정답']],
];
const chosen = [];
for (const [p, cap] of picks) if (p > 0 && p < n && !chosen.some((c) => c[0] === p)) chosen.push([p, cap]);
for (let k = 1; chosen.length < 8 && k < 40; k++) { const p = Math.floor((n * k) / 9); if (p > toc && !chosen.some((c) => Math.abs(c[0] - p) < 3)) chosen.push([p, ['More pages', '더 보기']]); }
chosen.sort((x, y) => x[0] - y[0]);
const dir = path.join(ROOT, `assets/books/${id}`);
for (const f of fs.readdirSync(dir)) if (/^pv-\d+\.jpg$/.test(f)) fs.rmSync(path.join(dir, f));
chosen.slice(0, 8).forEach(([p], i) => {
  execFileSync('pdftoppm', ['-f', String(p + 1), '-l', String(p + 1), '-scale-to-x', '749', '-scale-to-y', '1058', '-jpeg', '-jpegopt', 'quality=80', pdf, path.join(dir, `_pv${i + 1}`)], { stdio: 'ignore' });
  const f = fs.readdirSync(dir).find((x) => x.startsWith(`_pv${i + 1}-`));
  fs.renameSync(path.join(dir, f), path.join(dir, `pv-${i + 1}.jpg`));
});

/* ③ 책 정보 + 글 합치기 */
const published = frame.published || '';
const specs = [
  ['Format · 형태', 'PDF (digital edition) · 디지털판'],
  ['Pages · 쪽수', String(n - 1)],
  ['Size · 판형', 'B5 182 × 257 mm, prints on A4 too · A4 인쇄 가능'],
  ['Language · 언어', 'English + Korean · 영어 + 한국어'],
  ...(units ? [['Units · 단원', String(units)]] : []),
  ...(frame.isbn ? [['ISBN', `${frame.isbn} (PDF)`]] : []),
  ...(published ? [['Published · 발행', published]] : []),
  ['Publisher · 출판사', `${shop.publisher.en} · ${shop.publisher.ko}`],
];
const AUTHOR = { name: { en: 'Junsang', ko: '준상' }, bio: { en: 'Junsang is a Korean teacher. In about two years he has taught around 100 students for more than 1,700 hours, mostly from Europe and the United States. He runs everykoreans.com, a website for learning Korean.', ko: '준상은 한국어 교사입니다. 약 2년 동안 약 100명의 학생에게 1,700시간이 넘게 한국어를 가르쳤고, 주로 유럽과 미국의 학생들을 만났습니다. 한국어를 가르치는 웹사이트 everykoreans.com 을 운영합니다.' } };
const TOPIKB = /TOPIK/.test(book.title.en);
const faq = [
  [{ en: 'How do I get the file?', ko: '파일은 어떻게 받나요?' }, { en: 'After payment you get a download link right away, and a copy by email. Payment is handled by Polar.', ko: '결제가 끝나면 바로 내려받을 수 있는 링크가 나오고 메일로도 갑니다. 결제는 Polar 가 처리합니다.' }],
  [{ en: 'Can I try it first?', ko: '먼저 볼 수 있나요?' }, { en: 'Yes. Look through the preview pages above, or download the free sample with the cover, contents and the first units.', ko: '네. 위 미리보기 쪽을 보거나, 표지 · 목차 · 앞 단원이 들어 있는 무료 샘플을 받아 보세요.' }],
  [{ en: 'Can I print it?', ko: '인쇄해도 되나요?' }, { en: 'Yes, for your own study or your own class. Please do not share or resell the file.', ko: '네, 본인 학습이나 본인 수업용으로 인쇄할 수 있습니다. 파일을 나누거나 되팔지는 말아 주세요.' }],
  ...(TOPIKB ? [[{ en: 'Are these past exam questions?', ko: '기출 문제인가요?' }, { en: 'No. All questions are newly written in the exam format. TOPIK is a test name of NIIED; this is an independent study book, not operated or endorsed by NIIED or the TOPIK Center.', ko: '아닙니다. 시험 형식에 맞춰 새로 만든 문제입니다. TOPIK 은 국립국제교육원의 시험 이름이며, 이 책은 독자적인 학습서로 국립국제교육원 · 한국어능력시험센터가 운영 · 인증하지 않았습니다.' }]] : []),
  [{ en: 'What if there is a problem with the book?', ko: '책에 이상이 있으면요?' }, { en: 'If the file does not open, pages are missing or it is not the book described, write to cheesepotato@everykoreans.com with the email you paid with. We will send a fixed file, or refund you if that does not solve it.', ko: '파일이 열리지 않거나, 쪽이 빠졌거나, 소개와 다른 책이면 cheesepotato@everykoreans.com 으로 결제에 쓴 이메일을 적어 보내 주세요. 고친 파일을 보내 드리고, 그래도 해결되지 않으면 환불해 드립니다.' }],
  ...(book.status === 'planned' ? [[{ en: 'When will it be available?', ko: '언제 나오나요?' }, { en: 'It is in preparation and we have not set a date. Download a free sample of another book, or check this page again later.', ko: '준비 중이며 날짜는 아직 정하지 않았습니다. 다른 책의 무료 샘플을 받아 보시거나 나중에 이 쪽을 다시 확인해 주세요.' }]] : []),
];
const old = book.page || {};
book.page = {
  headline: copy.headline || old.headline, lead: copy.lead || old.lead, features: copy.features?.length ? copy.features : old.features,
  problem: copy.problem || old.problem, steps: copy.steps || old.steps, notFor: copy.notFor || old.notFor, pick: copy.pick || old.pick, related: copy.related || old.related,
  contents, previewNote: { en: 'Real pages from the book. Tap a page to enlarge.', ko: '책 속 실제 쪽입니다. 누르면 크게 볼 수 있어요.' },
  previews: chosen.slice(0, 8).map(([, cap]) => cap), author: AUTHOR, specs, faq,
};
fs.writeFileSync(shopFile, JSON.stringify(shop, null, 1) + '\n');
console.log(`${id}: 목차 ${contents.length}묶음 · 단원 ${units} · 미리보기 ${Math.min(8, chosen.length)}장(PDF 쪽 ${chosen.slice(0, 8).map((c) => c[0] + 1).join(',')}) · 속지 ${n - 1}쪽`);
