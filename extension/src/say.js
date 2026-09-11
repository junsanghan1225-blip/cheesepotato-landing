/* 소리 내어 읽기. 익스텐션 쪽(팝업·새 탭)이 쓴다.
 *
 * 말풍선(content/content.js)은 이걸 못 읽는다 — classic script 라 import 가
 * 없다. 그래서 같은 규칙이 그쪽에도 한 벌 있다. 두 벌인 것이 마음에 안
 * 들지만, 이 열 줄을 나누려고 말풍선에 모듈 체계를 들이는 쪽이 더 비싸다. */
import { settings } from './store.js';

function device(text) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    speechSynthesis.speak(u);
  } catch { /* 목소리가 없는 기기도 있다 */ }
}

/**
 * 읽어 준다.
 * @param {string} text 읽을 글
 * @param {string} [url] 녹음이 있으면 그 주소. 설정이 「사이트 녹음」일 때만 쓴다.
 */
export async function say(text, url) {
  const s = await settings();
  if (s.speak !== 'site' || !url) { device(text); return; }
  const a = new Audio();
  a.referrerPolicy = 'no-referrer';   /* 무엇을 찾았는지는 사이트가 알 일이 아니다 */
  /* 녹음은 표제어 4,200여 개에만 있다. 없으면 기기 목소리로 물러선다 —
     눌렀는데 아무 소리도 안 나는 것이 제일 나쁘다. */
  a.addEventListener('error', () => device(text), { once: true });
  a.src = url;
  a.play().catch(() => device(text));
}
