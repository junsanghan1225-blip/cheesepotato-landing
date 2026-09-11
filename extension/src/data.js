/* 구운 자료를 읽어 온다.
 *
 * ── 왜 import 가 아니라 fetch 인가 ──────────────────────────
 * 처음에는 자료도 모듈로 굽고 `await import('../data/examples.js')` 로
 * 필요할 때 받았다. 화면에서는 잘 됐고 **서비스 워커에서만 안 됐다** —
 * 서비스 워커 안에서는 동적 import() 가 금지되어 있다(HTML 명세,
 * w3c/ServiceWorker#1356). 찾기를 서비스 워커가 맡고 있으니, 말풍선에서만
 * 「못 찾았습니다」가 뜨고 팝업에서는 멀쩡한 상태가 됐다. 고장 난 자리와
 * 원인이 멀어서 알아보기 어려운 종류였다.
 *
 * fetch 는 서비스 워커에서도 화면에서도 똑같이 된다. eval 도 안 쓴다 —
 * MV3 가 막아 둔 것이다. 그래서 자료는 .json 으로 굽는다.
 *
 * ── 한 번만 받는다 ─────────────────────────────────────────
 * 받아 온 것이 아니라 **받아 오는 약속**을 쟁여 둔다. 그래야 답이 오기
 * 전에 두 번 물어도 한 번만 받는다 — 쪽을 열자마자 낱말 다섯 개를 함께
 * 찾을 때 실제로 그렇게 된다. */

const jobs = new Map();

function load(path) {
  if (!jobs.has(path)) {
    jobs.set(path, fetch(chrome.runtime.getURL(path)).then((r) => {
      if (!r.ok) throw new Error(`${path} — ${r.status}`);
      return r.json();
    }).catch((e) => {
      /* 다음에 다시 해 볼 수 있게 쟁여 둔 것을 버린다. 실패한 약속을
         그대로 두면 한 번 어긋난 뒤로는 영영 안 된다. */
      jobs.delete(path);
      throw e;
    }));
  }
  return jobs.get(path);
}

export const glossary = () => load('data/glossary.json');
export const grammar  = () => load('data/grammar.json');
export const examples = () => load('data/examples.json');
export const cards    = () => load('data/cards.json');

/** 뜻풀이 언어팩. 영어는 사전에 이미 들어 있어서 따로 받을 것이 없다. */
export const langPack = (lang) =>
  (!lang || lang === 'en' ? Promise.resolve(null) : load(`data/lang/${lang}.json`));
