/* 사이트 공통 꼬리말(기본 틀 6번 — 운영자 2026-11-21 시안 「A로 하고 폰은 접기, 첫 화면도 같이」).
   전에는 다섯 가지였다: 첫 화면 · 만든 쪽(.foot) · 상점(.ft + 사업자 정보) · 학습지(.ft) · 약관(사업자 정보). 사업자 정보가 상점 · 약관에만 있었다.
   · PC: 왼쪽 치즈감자 한 줄 + 네 칸(배우기 · 책·학습지 · 치즈감자 · 약관) → 아래 얇은 줄 뒤 작은 글씨(사업자 정보 · 결제 · 뜻풀이 출처 · 언어 · ©)
   · 폰(≤600): 네 칸을 <details> 로 접는다 — 인라인 스크립트 없이(CSP). PC 칸과 폰 접기를 따로 그린다(details 를 CSS 로만 열어 두는 방법은 브라우저마다 달라서)
   · 도구가 만드는 쪽은 siteFooterBlock() 을 붙이고, 손으로 쓴 쪽 · 첫 화면은 node tools/apply-footer.mjs 가 표시 사이를 바꾼다(검사 --check, CI)
   · 색은 그 쪽의 변수(tools/lib/tokens.mjs 이름)를 읽고, 없으면 같은 값으로 */

/* 판매자 정보 — 약관 쪽(build-legal)과 같은 값을 쓴다. 주소는 신고서 소재지가 집 주소라 공개 여부를 운영자가 정한다(비워 둔다) */
export const SELLER = {
  name: '에브리코리안즈 (everykoreans · 치즈감자)',
  short: '에브리코리안즈(Everykoreans)',
  owner: '한준상',   // 대표자 (통신판매업신고증 · 출판사 신고확인증, 2026-10-22)
  bizNo: '202-43-01897',   // 사업자등록번호
  mailOrder: '제 2026-수원영통-1263 호',    // 통신판매업 신고번호(수원시 영통구청, 2026-10-22)
  publisher: '제 2026-000158 호',   // 출판사 신고번호(2026-10-20, docs/shop.json publisher)
  address: '',
  email: 'cheesepotato@everykoreans.com',
};

const COLS = [
  ['배우기', 'Learn', [
    ['TOPIK 쓰기', 'TOPIK writing', '/topik-writing/'], ['TOPIK 읽기', 'TOPIK reading', '/topik-reading/'], ['TOPIK 듣기', 'TOPIK listening', '/topik-listening/'],
    ['TOPIK 낱말', 'TOPIK words', '/topik1-words/'], ['문법 표현', 'Grammar points', '/sentence/'], ['사전', 'Dictionary', '/dictionary/'], ['3분 레벨 테스트', '3-min level test', '/?lt=1'],
  ]],
  ['책 · 학습지', 'Books · worksheets', [
    ['책', 'Books', '/shop/'], ['무료 학습지', 'Free worksheets', '/worksheets/'],
    ['낱말 목록 내려받기', 'Word list download', '/topik-vocabulary-list/'], ['문법 목록 내려받기', 'Grammar list download', '/topik-grammar-list/'],
  ]],
  ['치즈감자', 'CheesePotato', [
    ['소개', 'About', '/about.html'], ['블로그', 'Blog', '/blog/'], ['선생님 · 1:1 수업', '1:1 lessons', '/teacher.html'], ['교사용', 'For teachers', '/for-teachers.html'],
    /* 첫 화면 예전 꼬리말이 걸던 재미 도구 두 개 — 여기서 빠지면 첫 화면에서 이 쪽들로 가는 링크가 없어진다 */
    ['내 이름을 한글로', 'Your name in Korean', '/korean-name/'], ['한국 나이 계산기', 'Korean age calculator', '/korean-age/'],
    ['Instagram', 'Instagram', 'https://www.instagram.com/cheese_p_otato/'],
  ]],
  ['약관', 'Policies', [
    ['가격', 'Pricing', '/pricing.html'], ['이용약관', 'Terms', '/terms.html'], ['환불 규정', 'Refunds', '/refund.html'],
    ['개인정보처리방침', 'Privacy', '/privacy.html'], ['사용한 오픈소스', 'Open-source notices', '/notices.html'],
  ]],
];

/* 폰 접기 제목은 <summary><span data-en> 으로 — <summary data-en> 이면 build-pages 의 /vi/ · /ja/ 첫 쪽이 자주 묻는 질문으로 잘못 읽는다(FAQ 찾기 패턴) */
/* mode: 'ko' | 'en' — 그 말로 그린다. 'data-en' — 한국어로 그리고 data-en 에 영어를 단다(첫 화면 · 손 쪽: 화면 언어를 바꾸면 앱이 바꿔 끼운다) */
export function siteFooter({ mode = 'ko' } = {}) {
  const T = (ko, en) => mode === 'en' ? en : ko;
  const DE = (ko, en) => mode === 'data-en' && ko !== en ? ` data-en="${en.replace(/"/g, '&quot;')}"` : '';
  const link = ([ko, en, href]) => {
    const ext = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<li><a href="${href}"${ext}${DE(ko, en)}>${T(ko, en)}</a></li>`;
  };
  const cols = COLS.map(([ko, en, ls]) => `<div><h4${DE(ko, en)}>${T(ko, en)}</h4><ul>${ls.map(link).join('')}</ul></div>`).join('');
  const acc = COLS.map(([ko, en, ls]) => `<details><summary><span${DE(ko, en)}>${T(ko, en)}</span></summary><ul>${ls.map(link).join('')}</ul></details>`).join('');
  const S = SELLER;
  const seller = [S.short, `${T('대표', 'Owner')} ${S.owner}`, `${T('사업자등록번호', 'Business reg.')} ${S.bizNo}`,
    `${T('통신판매업 신고', 'Mail-order reg.')} ${S.mailOrder}`, `${T('출판사 신고', 'Publisher reg.')} ${S.publisher}`].join(' · ');
  return `<footer class="sf"><div class="sf-in">` +
    `<div class="sf-top"><div class="sf-brand"><b>치즈감자</b><p${DE('한국어 선생님이 만든 단어 · 문법 · TOPIK 연습', 'Korean words, grammar and TOPIK practice, made by a Korean teacher')}>${T('한국어 선생님이 만든 단어 · 문법 · TOPIK 연습', 'Korean words, grammar and TOPIK practice, made by a Korean teacher')}</p>` +
    `<p><a href="mailto:${S.email}">${S.email}</a></p></div>` +
    `<div class="sf-cols">${cols}</div><div class="sf-acc">${acc}</div></div>` +
    `<div class="sf-legal"><p>${seller} · ${T('문의', 'Contact')} <a href="mailto:${S.email}">${S.email}</a></p>` +
    `<p><span${DE('결제 · 세금 처리 Polar(polar.sh)', 'Payments and tax handled by Polar (polar.sh)')}>${T('결제 · 세금 처리 Polar(polar.sh)', 'Payments and tax handled by Polar (polar.sh)')}</span> · ` +
    `<span${DE('낱말 뜻풀이 출처:', 'Word meanings from')}>${T('낱말 뜻풀이 출처:', 'Word meanings from')}</span> <a href="https://krdict.korean.go.kr" target="_blank" rel="noopener noreferrer">국립국어원 한국어기초사전</a> · ` +
    `<a href="https://creativecommons.org/licenses/by-sa/2.0/kr/" target="_blank" rel="noopener noreferrer">CC BY-SA 2.0 KR</a> · ` +
    `<a href="/about.html#languages"${DE('화면 12개 언어 · 낱말 뜻 10개 언어 · 레슨은 한국어', 'Screen in 12 languages · word meanings in 10 · lessons in Korean')}>${T('화면 12개 언어 · 낱말 뜻 10개 언어 · 레슨은 한국어', 'Screen in 12 languages · word meanings in 10 · lessons in Korean')}</a></p>` +
    `<p>© 2026 치즈감자 · Learn Korean with CheesePotato</p></div>` +
    `</div></footer>`;
}

const INK = 'var(--ink,#1B1512)', INK3 = 'var(--ink-3,var(--dim,#78674F))', INK2 = 'var(--ink-2,var(--ink2,#4E3E31))', LINE = 'var(--line,rgba(27,21,18,.11))';
const HF = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif';
export const SITE_FOOTER_CSS =
  `.sf{margin-top:64px;border-top:1px solid ${LINE};color:${INK2};font-size:14px;line-height:1.7;text-align:left}` +
  `.sf-in{max-width:1200px;margin:0 auto;padding:44px 40px 36px}` +
  `.sf a{color:inherit;text-decoration:none}.sf a:hover{color:${INK};text-decoration:underline}` +
  `.sf-top{display:grid;grid-template-columns:1.3fr 4fr;gap:28px}` +
  `.sf-brand b{display:block;margin-bottom:6px;font-family:${HF};font-size:17px;color:${INK}}.sf-brand p{margin:0 0 10px;color:${INK3}}` +
  `.sf-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}` +
  `.sf h4{margin:0 0 10px;font-family:${HF};font-size:13px;font-weight:700;color:${INK}}` +
  `.sf ul{list-style:none;margin:0;padding:0}.sf li{margin:0 0 6px}` +
  `.sf-acc{display:none}` +
  `.sf-legal{margin-top:28px;padding-top:18px;border-top:1px solid ${LINE};font-size:12.5px;line-height:1.75;color:${INK3}}.sf-legal p{margin:0}` +
  `.sf-legal a{text-decoration:underline;text-underline-offset:2px}` +
  `@media(max-width:900px){.sf-top{grid-template-columns:1fr}}` +
  `@media(max-width:600px){.sf-in{padding:32px 20px 28px}.sf-cols{display:none}.sf-acc{display:block}` +
    `.sf-acc details{border-top:1px solid ${LINE}}.sf-acc details:last-child{border-bottom:1px solid ${LINE}}` +
    `.sf-acc summary{display:flex;justify-content:space-between;padding:13px 0;font-family:${HF};font-weight:700;color:${INK};list-style:none;cursor:pointer}` +
    `.sf-acc summary::-webkit-details-marker{display:none}.sf-acc summary::after{content:"+";font-weight:400;color:${INK3}}.sf-acc details[open] summary::after{content:"−"}` +
    `.sf-acc ul{padding:0 0 12px}.sf-legal{margin-top:20px;padding-top:0;border-top:0}}` +
  `@media print{.sf{display:none}}`;

export const siteFooterBlock = (o) => `<style>${SITE_FOOTER_CSS}</style>\n${siteFooter(o)}`;
