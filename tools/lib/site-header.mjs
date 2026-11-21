/* 사이트 공통 메뉴줄(운영자 2026-11-21 「1번 메뉴줄부터」 — docs/plans/web-frame.md §1-1).
   만든 쪽(사전 · 문법 · 쓰기 · 블로그 …) · 상점 · 책 · 학습지 · 약관 쪽이 모두 이 한 곳의 머리글을 쓴다.
   전에는 세 가지였다: 첫 화면(앱) · 만든 쪽(TOPIK · 단어 · 무료로 배우기) · page.css 쪽(로고만 — 책 쪽에서 갈 곳이 없었다).
   첫 화면(index.html site-hd)은 앱 단추(검색 · 로그인 · 어두운 모드 · 언어)가 있어 따로 둔다(운영자 2026-10-11 머리줄 정리).
   · 폭: 안쪽 1120 + 좌우 40(폰 20) — 넓은 쪽 본문과 같은 선
   · 폰(≤600): 로고 · 「무료로 배우기」 · 메뉴(<details> — 인라인 스크립트 없이 열리고 닫힌다, CSP)
   · 색은 그 쪽의 변수(--bg · --ink · --ink-2/--ink2 · --line)를 읽고, 없으면 같은 값으로. 어두운 모드도 그 변수를 따라간다 */

const L = {
  ko: { topik: 'TOPIK', words: '단어', books: '책', sheets: '학습지', go: '무료로 배우기', menu: '메뉴', home: '치즈감자 첫 화면' },
  en: { topik: 'TOPIK', words: 'Words', books: 'Books', sheets: 'Worksheets', go: 'Start free', menu: 'Menu', home: 'CheesePotato home' },
};
const LINKS = [['topik', '/#learn/topik'], ['words', '/#words'], ['books', '/shop/'], ['sheets', '/worksheets/']];

/** active: 'topik' | 'words' | 'books' | 'sheets' | '' — 지금 쪽이 속한 칸(밑줄) */
export function siteHeader({ lang = 'ko', active = '' } = {}) {
  const t = L[lang === 'ko' ? 'ko' : 'en'];
  const a = (k, href) => `<a href="${href}"${k === active ? ' aria-current="page"' : ''}>${t[k]}</a>`;
  const nav = LINKS.map(([k, h]) => a(k, h)).join('');
  return `<header class="sh"><div class="sh-in">` +
    `<a class="sh-brand" href="/" aria-label="${t.home}"><img src="/logo-256.png" alt="" width="28" height="28"><span>치즈감자</span></a>` +
    `<nav class="sh-nav" aria-label="${t.menu}">${nav}</nav>` +
    `<a class="sh-go" href="/#learn">${t.go}</a>` +
    `<details class="sh-menu"><summary aria-label="${t.menu}"><i></i><i></i></summary><nav aria-label="${t.menu}">${nav}</nav></details>` +
    `</div></header>`;
}

const FF = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif';
const INK = 'var(--ink,#1B1512)', INK2 = 'var(--ink-2,var(--ink2,#4E3E31))', LINE = 'var(--line,rgba(27,21,18,.11))', BG = 'var(--bg,#F2EEE4)';
export const SITE_HEADER_CSS =
  `.sh{position:sticky;top:0;z-index:30;background:${BG};border-bottom:1px solid ${LINE};font-family:${FF}}` +
  `.sh-in{box-sizing:border-box;max-width:1200px;height:64px;margin:0 auto;padding:0 40px;display:flex;align-items:center;gap:6px}` +
  `.sh a{text-decoration:none}` +
  `.sh-brand{display:flex;align-items:center;gap:9px;margin-right:auto;color:${INK};font-size:16px;font-weight:800;letter-spacing:-.02em}` +
  `.sh-brand img{width:28px;height:28px;border-radius:7px}` +
  `.sh-nav{display:flex;gap:2px}.sh-nav a{display:block;padding:8px 12px;border-radius:5px;color:${INK2};font-size:15px;font-weight:600;line-height:1.2}` +
  `.sh-nav a:hover{color:${INK};background:${LINE}}.sh-nav a[aria-current]{color:${INK};box-shadow:inset 0 -2px 0 ${INK};border-radius:0}` +
  `.sh-go{margin-left:10px;padding:9px 14px;border-radius:8px;background:${INK};color:${BG};font-size:14.5px;font-weight:700;line-height:1.2;white-space:nowrap}` +
  `.sh-menu{display:none;position:relative}` +
  `.sh-menu summary{list-style:none;cursor:pointer;width:40px;height:40px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;border:1px solid ${LINE};border-radius:8px}` +
  `.sh-menu summary::-webkit-details-marker{display:none}.sh-menu summary i{display:block;width:16px;height:2px;background:${INK};border-radius:1px}` +
  `.sh-menu[open] summary{border-color:${INK}}` +
  `.sh-menu nav{position:absolute;right:0;top:48px;min-width:190px;display:grid;padding:6px;background:${BG};border:1px solid ${INK};border-radius:8px}` +
  `.sh-menu nav a{padding:11px 12px;border-radius:5px;color:${INK};font-size:15px;font-weight:600}.sh-menu nav a+a{border-top:1px solid ${LINE}}.sh-menu nav a[aria-current]{text-decoration:underline;text-underline-offset:4px}` +
  `@media(max-width:600px){.sh-in{height:56px;padding:0 20px}.sh-nav{display:none}.sh-menu{display:block}.sh-go{padding:8px 12px;font-size:14px;margin-left:0}}` +
  `@media print{.sh{display:none}}`;

/** 머리글 + 스타일 한 번에(쪽 몸통 맨 앞에 넣는 용) */
export const siteHeaderBlock = (o) => `<style>${SITE_HEADER_CSS}</style>\n${siteHeader(o)}`;

/** 주소로 칸 고르기 — 만드는 도구마다 같은 규칙 */
export const activeOf = (url = '') => /^\/(topik-(writing|reading|listening)|en\/topik|eps-topik|topik-grammar)/.test(url) ? 'topik'
  : /^\/(dictionary|topik[12]-words|korean-word-for|topik-vocabulary-list)/.test(url) ? 'words'
  : /^\/shop\//.test(url) ? 'books' : /worksheet/.test(url) ? 'sheets' : '';
