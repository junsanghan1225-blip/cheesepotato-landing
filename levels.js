/* 레벨 아이콘 — 감자(일반 한국어, 코스 레벨 L0~L7) · 치즈(TOPIK, 0 · 1~6급).
 * 운영자가 고른 시안(2026-09-29) 그대로. 그림은 SVG 글자열로 만들어 어디든 innerHTML 로 붙인다(파일 · 요청이 따로 없다).
 *   potatoLevel(L)  → { icon, ko, en, desc }    L = 0~7
 *   cheeseLevel(g)  → { icon, ko, en, desc }    g = 0~6
 *   myLevelBadge(rec) → 레벨테스트 기록(cp_level)으로 일반이면 감자, TOPIK 목표면 치즈. */
/* 공통 — 얼굴 · 반짝이 · 왕관 */
const face = (x, y, s = 1, mood = 'smile') => {
  const e = 4.6 * s, r = 2.3 * s;
  const mouth = mood === 'open' ? `<ellipse cx="${x}" cy="${y + 6 * s}" rx="${3.2 * s}" ry="${2.6 * s}" fill="#5A2E1C"/>`
    : mood === 'grin' ? `<path d="M${x - 5 * s} ${y + 4 * s}q${5 * s} ${6 * s} ${10 * s} 0" fill="#5A2E1C"/>`
    : `<path d="M${x - 4 * s} ${y + 4.5 * s}q${4 * s} ${4 * s} ${8 * s} 0" fill="none" stroke="#3A2418" stroke-width="${1.8 * s}" stroke-linecap="round"/>`;
  return `<circle cx="${x - e}" cy="${y}" r="${r}" fill="#2A1A12"/><circle cx="${x + e}" cy="${y}" r="${r}" fill="#2A1A12"/>
    <circle cx="${x - e + .8 * s}" cy="${y - .8 * s}" r="${.8 * s}" fill="#fff"/><circle cx="${x + e + .8 * s}" cy="${y - .8 * s}" r="${.8 * s}" fill="#fff"/>
    <ellipse cx="${x - e - 3.4 * s}" cy="${y + 3.6 * s}" rx="${2.6 * s}" ry="${1.6 * s}" fill="#F39A7E" opacity=".75"/>
    <ellipse cx="${x + e + 3.4 * s}" cy="${y + 3.6 * s}" rx="${2.6 * s}" ry="${1.6 * s}" fill="#F39A7E" opacity=".75"/>${mouth}`;
};
const spark = (x, y, s = 1, c = '#FFD54A') => `<path d="M${x} ${y - 5 * s}l${1.4 * s} ${3.6 * s} ${3.6 * s} ${1.4 * s}-${3.6 * s} ${1.4 * s}-${1.4 * s} ${3.6 * s}-${1.4 * s}-${3.6 * s}-${3.6 * s}-${1.4 * s} ${3.6 * s}-${1.4 * s}z" fill="${c}"/>`;
const crown = (x, y, s = 1) => `<path d="M${x - 11 * s} ${y + 8 * s}l${-2 * s} ${-13 * s} ${7 * s} ${6 * s} ${6 * s} ${-10 * s} ${6 * s} ${10 * s} ${7 * s} ${-6 * s} ${-2 * s} ${13 * s}z" fill="#FFC928" stroke="#C9870E" stroke-width="${1.6 * s}" stroke-linejoin="round"/>
  <circle cx="${x}" cy="${y + 3 * s}" r="${2 * s}" fill="#E5484D"/><circle cx="${x - 8 * s}" cy="${y + 4.5 * s}" r="${1.4 * s}" fill="#4F9BE8"/><circle cx="${x + 8 * s}" cy="${y + 4.5 * s}" r="${1.4 * s}" fill="#4F9BE8"/>`;
const svg = (inner) => `<svg class="lvl-ic" viewBox="0 0 96 96" aria-hidden="true">${inner}</svg>`;

/* 감자 몸 — 크기 s, 색(보통 · 황금) */
const potatoBody = (cx, cy, s, gold) => {
  const f = gold ? '#F6C443' : '#D9A263', st = gold ? '#C9870E' : '#9C6A34', sp = gold ? '#E0A21B' : '#B07A43';
  return `<path d="M${cx - 21 * s} ${cy + 2 * s}c${-1 * s} ${-13 * s} ${9 * s} ${-22 * s} ${22 * s} ${-21 * s}s${22 * s} ${9 * s} ${21 * s} ${22 * s}-${10 * s} ${19 * s}-${23 * s} ${18 * s}-${19 * s} ${-7 * s}-${20 * s} ${-19 * s}z" fill="${f}" stroke="${st}" stroke-width="${2 * s}"/>
    <circle cx="${cx - 12 * s}" cy="${cy - 9 * s}" r="${1.8 * s}" fill="${sp}"/><circle cx="${cx + 13 * s}" cy="${cy + 9 * s}" r="${1.6 * s}" fill="${sp}"/><circle cx="${cx + 9 * s}" cy="${cy - 12 * s}" r="${1.3 * s}" fill="${sp}"/>`;
};
const leaf = (x, y, s = 1, r = 0) => `<path transform="rotate(${r} ${x} ${y})" d="M${x} ${y}c${-2 * s} ${-9 * s} ${4 * s} ${-14 * s} ${10 * s} ${-14 * s}c${0} ${7 * s} ${-4 * s} ${13 * s} ${-10 * s} ${14 * s}z" fill="#6BBF59" stroke="#3E8C3A" stroke-width="${1.4 * s}" stroke-linejoin="round"/>`;
const soil = `<path d="M8 80c10-8 22-10 40-10s30 2 40 10v8H8z" fill="#8B5E3C"/><circle cx="24" cy="80" r="1.6" fill="#6D4529"/><circle cx="70" cy="82" r="1.6" fill="#6D4529"/><circle cx="50" cy="84" r="1.3" fill="#6D4529"/>`;

const POTATO = [
  ['L0', '씨감자', '땅속에서 준비 중', svg(`${soil}<path d="M30 76c0-10 8-16 18-16s18 6 18 16z" fill="#D9A263" stroke="#9C6A34" stroke-width="2"/>${face(48, 70, .7)}${leaf(47, 60, .7, -10)}`)],
  ['L1', '새싹 감자', '첫 싹이 텄어요', svg(`${soil}${potatoBody(48, 62, .72)}${face(48, 62, .75)}${leaf(46, 48, .9, -25)}${leaf(49, 48, .9, 30)}`)],
  ['L2', '아기 감자', '데굴데굴 굴러요', svg(`${potatoBody(48, 56, .82)}${face(48, 56, .85)}<ellipse cx="48" cy="84" rx="20" ry="3" fill="#000" opacity=".08"/>`)],
  ['L3', '알감자', '알차게 여물었어요', svg(`${potatoBody(48, 54, .95)}${face(48, 54, 1)}<ellipse cx="48" cy="86" rx="22" ry="3" fill="#000" opacity=".08"/>${leaf(46, 33, .6, -20)}`)],
  ['L4', '통감자', '든든한 한 알', svg(`${potatoBody(48, 52, 1.08)}${face(48, 52, 1.1, 'grin')}<ellipse cx="48" cy="87" rx="24" ry="3" fill="#000" opacity=".08"/><circle cx="70" cy="68" r="7" fill="#FF914D" stroke="#C4551C" stroke-width="1.6"/><path d="M70 64.5l1 2.2 2.4.3-1.8 1.6.5 2.4-2.1-1.2-2.1 1.2.5-2.4-1.8-1.6 2.4-.3z" fill="#fff"/>`)],
  ['L5', '왕감자', '누구보다 커요', svg(`${potatoBody(48, 50, 1.2)}${face(48, 50, 1.2, 'grin')}<ellipse cx="48" cy="88" rx="26" ry="3" fill="#000" opacity=".08"/><path d="M30 64q18 12 36 0" fill="none" stroke="#E5484D" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="72" r="5" fill="#FFC928" stroke="#C9870E" stroke-width="1.4"/>`)],
  ['L6', '황금 감자', '반짝반짝 빛나요', svg(`${potatoBody(48, 52, 1.12, true)}${face(48, 52, 1.12, 'grin')}${spark(20, 26, 1)}${spark(78, 22, .8)}${spark(80, 64, .7)}<ellipse cx="48" cy="88" rx="24" ry="3" fill="#000" opacity=".08"/>`)],
  ['L7', '감자 왕', '감자 나라의 왕', svg(`${potatoBody(48, 58, 1.08, true)}${face(48, 58, 1.1, 'open')}${crown(48, 26, 1)}${spark(16, 40, .8)}${spark(82, 44, .8)}<ellipse cx="48" cy="92" rx="24" ry="3" fill="#000" opacity=".08"/>`)],
];

/* 치즈 */
const holes = (arr, c = '#E3A12A') => arr.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('');
const CHEESE = [
  ['0', '우유 한 방울', 'TOPIK 을 향해 출발', svg(`<path d="M48 16c10 14 24 28 24 44a24 24 0 0 1-48 0c0-16 14-30 24-44z" fill="#FFFFFF" stroke="#CFC6BA" stroke-width="2.2"/><path d="M36 50q-2 8 3 14" fill="none" stroke="#E9E3DA" stroke-width="3" stroke-linecap="round"/>${face(48, 62, .9)}`)],
  ['1급', '치즈 가루', '첫 조각이 모였어요', svg(`<rect x="22" y="56" width="16" height="16" rx="3" fill="#FFD166" stroke="#D99A1C" stroke-width="1.8" transform="rotate(-8 30 64)"/><rect x="58" y="60" width="13" height="13" rx="3" fill="#FFD166" stroke="#D99A1C" stroke-width="1.8" transform="rotate(10 64 66)"/><rect x="36" y="40" width="24" height="24" rx="4" fill="#FFD166" stroke="#D99A1C" stroke-width="2"/>${holes([[42, 46, 2]])}${face(48, 52, .72)}<ellipse cx="48" cy="82" rx="26" ry="3" fill="#000" opacity=".08"/>`)],
  ['2급', '슬라이스 치즈', '얇지만 탄탄해요', svg(`<path d="M18 30h60v38c-6 4-10-2-16 2s-10-4-16 0-10-4-16 0-8-2-12 0z" fill="#FFD166" stroke="#D99A1C" stroke-width="2.2" stroke-linejoin="round"/>${holes([[28, 40, 3], [70, 44, 2.5], [66, 60, 2]])}${face(48, 50, .95)}`)],
  ['3급', '조각 치즈', '한 조각 제대로', svg(`<path d="M14 64l54-34c8 8 14 18 14 34z" fill="#FFD166" stroke="#D99A1C" stroke-width="2.2" stroke-linejoin="round"/><path d="M14 64h68v14H14z" fill="#F4B63F" stroke="#D99A1C" stroke-width="2.2" stroke-linejoin="round"/>${holes([[62, 44, 3], [30, 72, 2.5], [70, 72, 2]], '#D99A1C')}${face(52, 54, .85)}`)],
  ['4급', '블록 치즈', '묵직하게 쌓였어요', svg(`<path d="M16 42l32-14 32 14v30l-32 14-32-14z" fill="#F4B63F" stroke="#C9870E" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 42l32 14 32-14-32-14z" fill="#FFD166" stroke="#C9870E" stroke-width="2.2" stroke-linejoin="round"/><path d="M48 56v30" stroke="#C9870E" stroke-width="2.2"/>${holes([[40, 40, 2.5], [58, 38, 2]], '#E3A12A')}${holes([[26, 64, 2.4], [70, 70, 2.2]], '#D99A1C')}${face(32, 64, .6)}${face(64, 64, .6, 'grin')}`)],
  ['5급', '치즈 휠', '둥글게 완성', svg(`<ellipse cx="48" cy="62" rx="34" ry="14" fill="#F4B63F" stroke="#C9870E" stroke-width="2.2"/><path d="M14 50v12c0 8 15 14 34 14s34-6 34-14V50" fill="#F4B63F" stroke="#C9870E" stroke-width="2.2"/><ellipse cx="48" cy="50" rx="34" ry="14" fill="#FFD166" stroke="#C9870E" stroke-width="2.2"/><path d="M48 50l30-6" stroke="#C9870E" stroke-width="2"/><path d="M48 50l22 10" stroke="#C9870E" stroke-width="2"/>${holes([[30, 48, 2.6], [58, 56, 2]], '#E3A12A')}${face(38, 66, .7, 'grin')}`)],
  ['6급', '황금 치즈 왕', 'TOPIK 의 왕', svg(`<ellipse cx="48" cy="68" rx="32" ry="13" fill="#E9A51C" stroke="#B87708" stroke-width="2.2"/><path d="M16 56v12c0 7 14 13 32 13s32-6 32-13V56" fill="#E9A51C" stroke="#B87708" stroke-width="2.2"/><ellipse cx="48" cy="56" rx="32" ry="13" fill="#FFC928" stroke="#B87708" stroke-width="2.2"/>${holes([[32, 54, 2.6], [64, 58, 2]], '#E9A51C')}${face(48, 70, .72, 'open')}${crown(48, 30, 1)}${spark(14, 30, .8)}${spark(84, 36, .8)}`)],
];


const POTATO_EN = ['Seed potato', 'Sprout', 'Baby potato', 'Little potato', 'Whole potato', 'Big potato', 'Golden potato', 'Potato King'];
const CHEESE_EN = ['A drop of milk', 'Cheese crumbs', 'Cheese slice', 'Cheese wedge', 'Cheese block', 'Cheese wheel', 'Golden Cheese King'];
export const potatoLevel = (L) => { const [, ko, desc, icon] = POTATO[Math.max(0, Math.min(7, L | 0))]; return { icon, ko, en: POTATO_EN[Math.max(0, Math.min(7, L | 0))], desc }; };
export const cheeseLevel = (g) => { const [, ko, desc, icon] = CHEESE[Math.max(0, Math.min(6, g | 0))]; return { icon, ko, en: CHEESE_EN[Math.max(0, Math.min(6, g | 0))], desc }; };
/* TOPIK 학생의 치즈 — 코스 레벨을 TOPIK 급수로(LT_LEVELS 의 topik 칸과 같은 짝). 레벨테스트로는 3 · 5급까지,
   4 · 6급은 모의고사 점수로 오르게 할 자리(다음에). */
export const CHEESE_OF_LEVEL = [0, 0, 1, 1, 2, 2, 3, 5];
export function myLevelBadge(rec) {
  if (!rec || rec.lv == null) return null;
  if (rec.goal === 'topik') { const g = CHEESE_OF_LEVEL[rec.lv] ?? 0; return { kind: 'cheese', step: g, ...cheeseLevel(g) }; }
  return { kind: 'potato', step: rec.lv, ...potatoLevel(rec.lv) };
}
