/* 코스 아이콘 — 이모지 대신 선 아이콘(SVG).
   이모지는 기기마다 모양·색이 달라서(윈도·안드로이드·아이폰이 다 다르다) 목록이
   알록달록 어지러웠다. 코스 데이터의 emoji 는 그대로 두고, 화면에 그릴 때만 여기서
   같은 뜻의 선 아이콘으로 바꾼다. 표에 없는 이모지는 책 아이콘으로, 한글 글자
   (가·말·뼈)는 글자 그대로 둔다.
   24×24, 선 1.8, 색은 currentColor — 둘레 CSS 가 색을 정한다(밝은·어두운 화면 둘 다). */
const P = {
  book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2.5z"/><path d="M8 7h7"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  rewind: '<path d="M11 18 5 12l6-6"/><path d="m19 18-6-6 6-6"/>',
  hourglass: '<path d="M6 3h12M6 21h12"/><path d="M7 3v2a5 5 0 0 0 10 0V3"/><path d="M7 21v-2a5 5 0 0 1 10 0v2"/>',
  pin: '<path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  shuffle: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  thought: '<path d="M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1A4.5 4.5 0 0 1 17 18z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 6a3 3 0 0 0 6 0z"/><path d="m19 7-3 6a3 3 0 0 0 6 0z"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2 2M15 8l2 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21z"/><path d="m8 12 2 2M11 9l2 2M14 6l2 2"/>',
  spark: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7z"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  crown: '<path d="m3 8 4 4 5-7 5 7 4-4-2 11H5z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5v.7M12 17h.01"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>',
  hash: '<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4 3-7 8-7 0 4-3 7-8 7z"/><path d="M12 14c0-3-2-5-6-5 0 3 2 5 6 5z"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  signal: '<rect x="8" y="2.5" width="8" height="19" rx="3"/><circle cx="12" cy="7" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="17" r="1.3"/>',
  door: '<path d="M5 21V4a1 1 0 0 1 1-1h12v18"/><path d="M3 21h18M14 12h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" stroke="none"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  fire: '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-3 5-3 8a6 6 0 0 0 6 6z"/>',
  face: '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01"/><path d="M8.5 16a4 4 0 0 1 7 0"/>',
  rain: '<path d="M7 15a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1A4.5 4.5 0 0 1 17 15z"/><path d="m8 18-1 3M12 18l-1 3M16 18l-1 3"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  gem: '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
};
/* 이모지 → 아이콘. 변형 선택자(U+FE0F)는 떼고 찾는다. */
const E = {
  '📚': 'book', '💬': 'chat', '🕒': 'clock', '⏱': 'clock', '⏰': 'clock', '⏪': 'rewind', '⏳': 'hourglass',
  '📍': 'pin', '🏷': 'tag', '🚫': 'ban', '🙅': 'ban', '🔀': 'shuffle', '🔄': 'repeat', '🔁': 'repeat',
  '🔗': 'link', '💡': 'bulb', '💭': 'thought', '🤔': 'thought', '🎯': 'target', '⚖': 'scale', '✍': 'pen',
  '🔑': 'key', '🗝': 'key', '➕': 'plus', '📏': 'ruler', '🌟': 'spark', '🌈': 'spark', '🏁': 'flag',
  '👥': 'people', '🤝': 'people', '🙇': 'crown', '🎩': 'crown', '🙏': 'crown', '🎙': 'mic', '❓': 'question',
  '❗': 'alert', '💥': 'alert', '🔢': 'hash', '🌱': 'sprout', '🌿': 'sprout', '👶': 'sprout', '🎵': 'music',
  '🇰🇷': 'globe', '🌐': 'globe', '🚦': 'signal', '🚪': 'door', '🚶': 'arrow', '⏭': 'arrow', '🎒': 'arrow',
  '🎭': 'contrast', '🔮': 'eye', '🪞': 'eye', '🎞': 'film', '🛋': 'home', '🔥': 'fire', '😔': 'face',
  '😵': 'face', '🌧': 'rain', '👍': 'check', '📜': 'doc', '📝': 'doc', '💎': 'gem', '💪': 'bolt', '🙋': 'user',
};
const svg = (k) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;
/* 코스 하나의 아이콘 HTML. 한글 글자 표시는 글자로(이미 esc 할 것이 없는 한두 글자). */
export function courseIcon(emoji) {
  const e = String(emoji || '').replace(/️/g, '');
  if (/^[가-힣A-Za-z]{1,2}$/.test(e)) return `<span class="ci-txt">${e}</span>`;
  return svg(E[e] || 'book');
}
export const COURSE_ICON_KEYS = Object.keys(P);
