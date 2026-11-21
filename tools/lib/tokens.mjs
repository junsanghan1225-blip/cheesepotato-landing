/* 사이트 색 · 모서리 이름 하나(기본 틀 5번 — docs/plans/web-frame.md, 운영자 2026-11-21 「1번 2번 ㄱㄱ」).
   값의 원본은 첫 화면 index.html :root(가장 오래 다듬어진 것 — 대비 점검 2026-10-27 · 11-14). 여기를 고치면 index.html 도 같이 고친다.
   - 만든 쪽(build-pages)은 tokensCss() 로 이 값을 그대로 박는다.
   - 손으로 쓴 CSS(index.html · page.css · privacy · notices · teacher)는 node tools/check-tokens.mjs 가 이름 · 값이 같은지 본다(CI · preflight).
   예전 이름(--ink2 · --dim · --card …)은 만든 쪽 안에서만 별칭으로 남긴다(TOKEN_ALIASES). */
export const TOKENS = {
  light: {
    '--bg': '#F2EEE4', '--bg-rgb': '242,238,228', '--surface': '#FFFFFF', '--surface-2': '#FBF8F1', '--tint': '#FDF0E2', '--ink-bg': '#1B1512',
    '--ink': '#1B1512', '--ink-2': '#4E3E31', '--ink-3': '#78674F', '--ink-rgb': '27,21,18', '--on-ink': '#FFFFFF',
    '--orange': '#FF914D', '--orange-mid': '#E1682B', '--orange-deep': '#AE4710', '--orange-hero': '#DE5C12', '--orange-text': '#A8470F',
    '--yellow': '#F0C24B', '--green': '#12704F', '--red': '#C43D34',
    '--line': 'rgba(var(--ink-rgb),.11)', '--line-2': 'rgba(var(--ink-rgb),.06)',
    '--r-s': '5px', '--r': '8px', '--r-l': '10px', '--r-xl': '12px',
  },
  dark: {
    '--bg': '#17130F', '--bg-rgb': '23,19,15', '--surface': '#221C17', '--surface-2': '#1C1712', '--tint': '#2E2015', '--ink-bg': '#2A2119',
    '--ink': '#F2EAE0', '--ink-2': '#CBB8A6', '--ink-3': '#9C8973', '--ink-rgb': '242,234,224', '--on-ink': '#17130F',
    '--orange': '#FF9E5C', '--orange-mid': '#FF8A47', '--orange-deep': '#FFA05E', '--orange-hero': '#FF9E5C', '--orange-text': '#FFA05E',
    '--green': '#3FBF8F', '--red': '#E1594E',
  },
};
/* 만든 쪽의 예전 이름 → 새 이름(값은 따라간다. 어두운 모드도 같이) */
export const TOKEN_ALIASES = {
  '--ink2': 'var(--ink-2)', '--dim': 'var(--ink-3)', '--line2': 'var(--line-2)', '--card': 'var(--surface)', '--soft': 'var(--surface-2)',
  '--brand': 'var(--yellow)', '--cta': 'var(--ink)', '--cta-ink': 'var(--on-ink)',
};
const decl = (o) => Object.entries(o).map(([k, v]) => `${k}:${v}`).join(';');
export const tokensCss = () =>
  `:root{${decl(TOKENS.light)};${decl(TOKEN_ALIASES)}}\n@media(prefers-color-scheme:dark){:root{${decl(TOKENS.dark)}}}`;
