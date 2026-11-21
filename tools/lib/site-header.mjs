/* 사이트 공통 머리글(메뉴줄) — 첫 화면(index.html) 밖의 모든 쪽(생성 쪽 · 손으로 쓴 쪽)이 한 모양을 쓴다.
   CSS 는 이 모듈이 내고, page.css 를 쓰는 쪽은 page.css 에 같은 값을 둔다.
   모바일(≤600px) 메뉴는 <details> 로 열어 인라인 <script> 없이 CSP(script-src 'none' 포함) 를 통과한다. */

export const HEADER_CSS = `
.hd{position:sticky;top:0;z-index:40;background:var(--bg,#F2EEE4);background:color-mix(in srgb,var(--bg,#F2EEE4) 92%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line,rgba(27,21,18,.11));font-family:'Pretendard Variable','Pretendard',-apple-system,BlinkMacSystemFont,sans-serif}
.hd-in{box-sizing:border-box;max-width:1200px;margin:0 auto;padding:0 40px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.hd-brand{display:inline-flex;align-items:center;gap:9px;min-height:44px;color:var(--ink,#1B1512);font-weight:700;font-size:16px;letter-spacing:-.03em;text-decoration:none;white-space:nowrap}
.hd-brand:hover{color:var(--ink,#1B1512)}
.hd-brand img{width:28px;height:28px;border-radius:7px;object-fit:cover;display:block}
.hd-right{display:flex;align-items:center;gap:6px}
.hd-nav{display:flex;align-items:center;gap:2px}
.hd-nav a{font-size:14px;font-weight:500;color:var(--ink-2,var(--ink2,#4E3E31));text-decoration:none;padding:9px 12px;border-radius:8px;white-space:nowrap;transition:background .16s,color .16s}
.hd-nav a:hover{background:var(--line2,var(--line-2,rgba(27,21,18,.06)));color:var(--ink,#1B1512)}
.hd-nav a[aria-current="page"]{color:var(--ink,#1B1512);font-weight:700;text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:2px}
.hd-go{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 15px;margin-left:6px;border-radius:8px;background:var(--cta,var(--ink,#1B1512));color:var(--cta-ink,var(--bg,#F2EEE4));font-size:14px;font-weight:600;letter-spacing:-.01em;text-decoration:none;white-space:nowrap;transition:opacity .16s}
.hd-go:hover{opacity:.88;color:var(--cta-ink,var(--bg,#F2EEE4))}
.hd-m{display:none}
.hd-m-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:1px solid var(--line,rgba(27,21,18,.11));border-radius:8px;background:transparent;color:var(--ink,#1B1512);cursor:pointer;list-style:none}
.hd-m-btn::-webkit-details-marker{display:none}
.hd-m-pop{position:absolute;top:100%;left:0;right:0;background:var(--bg,#F2EEE4);border-bottom:1px solid var(--line,rgba(27,21,18,.11));padding:8px 20px 14px;display:flex;flex-direction:column;gap:2px}
.hd-m-pop a{display:block;padding:11px 10px;border-radius:8px;font-size:15px;font-weight:500;color:var(--ink-2,var(--ink2,#4E3E31));text-decoration:none}
.hd-m-pop a:hover{background:var(--line2,var(--line-2,rgba(27,21,18,.06)));color:var(--ink,#1B1512)}
.hd-m-pop a[aria-current="page"]{color:var(--ink,#1B1512);font-weight:700;text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px}
@media(max-width:600px){.hd-in{padding:0 20px;height:56px}.hd-nav{display:none}.hd-go{margin-left:0;min-height:36px;padding:0 12px;font-size:13.5px}.hd-m{display:block}}
@media print{.hd{display:none!important}}
`.trim();

export function activeForUrl(url = '') {
  if (/^\/(?:(?:en|vi|ja)\/)?(?:topik-(?:writing|reading|listening)|eps-topik)|^\/my\/eps-topik/.test(url)) return 'topik';
  if (/^\/(?:dictionary|topik1-words|topik2-words|korean-word-for|topik-vocabulary-list)/.test(url)) return 'words';
  if (/^\/shop(?:\/|$)/.test(url)) return 'books';
  if (/^\/(?:worksheets|worksheet|numbers-worksheet|hangul-worksheet|[a-z0-9-]+-worksheet)(?:\/|$)/.test(url)) return 'worksheets';
  return '';
}

export function siteHeader({ lang = 'ko', active, url = '' } = {}) {
  const cur = active ?? activeForUrl(url);
  const en = lang !== 'ko';
  const items = en
    ? [['topik', '/#learn/topik', 'TOPIK'], ['words', '/#words', 'Words'], ['books', '/shop/', 'Books'], ['worksheets', '/worksheets/', 'Worksheets']]
    : [['topik', '/#learn/topik', 'TOPIK'], ['words', '/#words', '단어'], ['books', '/shop/', '책'], ['worksheets', '/worksheets/', '학습지']];
  const links = items.map(([id, href, label]) =>
    `<a href="${href}"${cur === id ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const cta = en ? 'Start free' : '무료로 배우기';
  const menuLabel = en ? 'Open menu' : '메뉴 열기';
  return `<header class="hd"><div class="hd-in">` +
    `<a class="hd-brand" href="/"><img src="/logo-256.png" alt="" width="28" height="28"><span>치즈감자</span></a>` +
    `<div class="hd-right">` +
    `<nav class="hd-nav" aria-label="Main">${links}</nav>` +
    `<a class="hd-go" href="/#learn">${cta}</a>` +
    `<details class="hd-m"><summary class="hd-m-btn" aria-label="${menuLabel}"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg></summary><nav class="hd-m-pop" aria-label="Mobile menu">${links}</nav></details>` +
    `</div></div></header>`;
}
