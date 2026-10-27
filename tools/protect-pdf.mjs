// 파는 책 PDF 에 「저작권 · 개인 사용 허가」 줄을 쪽마다 찍고, 고치기 · 베끼기를 막는 권한을 건다(운영자 2026-10-27 「불법 공유 처단 — 워터마크 · 수정 불가」).
//   node tools/protect-pdf.mjs <in.pdf> <out.pdf> [--buyer "구매자 이메일"]
// - 쪽마다 맨 아래 가장자리에 작은 글씨(출력해도 거슬리지 않게 연한 회색). --buyer 를 주면 「Licensed to …」 줄이 더해진다(구매자별 판 — 아래 한계 참고).
// - 권한(AES-256): 인쇄 · 주석(태블릿에 손글씨) · 화면 읽기 도구는 허용, 내용 고치기 · 글자 복사 · 쪽 뽑기는 막는다. 열 때 비밀번호는 없다.
//   소유자 비밀번호는 매번 무작위로 만들고 어디에도 적지 않는다(권한을 푸는 열쇠를 아무도 갖지 않는다 — 원본은 저장소 밖에 따로 있다).
// 한계(솔직하게): 권한은 「정중한 부탁」이라 일부 프로그램은 무시한다. 같은 글줄은 모든 사본에 똑같아 **누가 퍼뜨렸는지는 알 수 없다** —
// 그건 구매마다 이메일을 찍어 주는 구매자별 판(결제 알림 → 서버 함수)이 필요하다. --buyer 는 그때 쓸 부품이다.
import { execFileSync } from 'node:child_process';
const a = process.argv.slice(2);
const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : ''; };
const [src, out] = a.filter((x) => !x.startsWith('--') && x !== opt('--buyer'));
if (!src || !out) { console.error('쓰는 법: node tools/protect-pdf.mjs <in.pdf> <out.pdf> [--buyer "email"]'); process.exit(1); }
execFileSync('python3', ['-W', 'ignore', '-c', `
import sys, secrets, fitz
src, out, buyer = sys.argv[1], sys.argv[2], sys.argv[3]
d = fitz.open(src)
line1 = 'Copyright Everykoreans · everykoreans.com · Personal-use license · Do not share or resell'
for i, pg in enumerate(d):
    r = pg.rect
    pg.insert_text(fitz.Point(r.width / 2 - 150, r.height - 9), line1, fontsize=5.6, fontname='helv', color=(0.62, 0.6, 0.58), overlay=True)
    if buyer:
        pg.insert_text(fitz.Point(r.width / 2 - 150, r.height - 3.2), 'Licensed to ' + buyer, fontsize=5.0, fontname='helv', color=(0.62, 0.6, 0.58), overlay=True)
m = dict(d.metadata or {})
m['subject'] = 'Personal-use license. Do not share or resell. everykoreans.com'
if buyer: m['keywords'] = 'licensed to ' + buyer
d.set_metadata(m)
perm = fitz.PDF_PERM_PRINT | fitz.PDF_PERM_ANNOTATE | fitz.PDF_PERM_ACCESSIBILITY
d.save(out, encryption=fitz.PDF_ENCRYPT_AES_256, owner_pw=secrets.token_hex(16), user_pw='', permissions=perm, garbage=3, deflate=True)
`, src, out, opt('--buyer')]);
console.log(`보호한 PDF → ${out}`);
