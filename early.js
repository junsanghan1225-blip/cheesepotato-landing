/* 레벨 테스트를 본 사람(이 기기의 localStorage cp_level)에게는 첫 화면의 소개(.hm-intro)가 숨는다(html[data-lv]).
   그 표시를 큰 화면 코드(app.module.js, 1.3MB)가 돌 때까지 기다리면 처음엔 소개가 보였다가 사라지며 화면 전체가 밀려
   Clarity 의 CLS 가 0.46 ~ 0.77(나쁨)이었다(2026-11-20). 그래서 이 한 줄을 head 에서 먼저 돌린다.
   app.module.js 의 applyTrack 이 같은 표시를 다시 붙이고, 읽을 수 없는 값이면 지운다. */
try { var v = JSON.parse(localStorage.getItem('cp_level') || 'null'); if (v && typeof v.lv === 'number') document.documentElement.dataset.lv = '1'; } catch (e) {}
