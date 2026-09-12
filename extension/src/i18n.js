/* 화면 말. 사이트의 `t(ko, en)` 을 그대로 가져왔다 — 한 화면 안에서 두
   말이 섞이지 않게 하려면 부르는 자리가 사이트와 똑같아야 한다. */
let EN = true;

/** 화면 말을 정한다. 'auto' 면 브라우저 설정을 따른다(사이트와 같은 규칙). */
export function setUiLang(pref) {
  EN = pref === 'en' ? true
     : pref === 'ko' ? false
     : !(navigator.language || '').toLowerCase().startsWith('ko');
}
setUiLang('auto');

export const isEn = () => EN;
export const t = (ko, en) => (EN ? en : ko);

/* 화면 말에 맞춘 <html lang>. 글꼴 고르기와 읽어 주는 기계가 이걸 본다. */
export const htmlLang = () => (EN ? 'en' : 'ko');
