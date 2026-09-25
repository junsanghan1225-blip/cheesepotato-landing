/* 치즈감자 — 구글 태그 관리자 (GTM-K4Z87SVS)

   구글이 주는 코드조각은 <head> 안에 바로 박는 인라인 스크립트다. 이
   사이트의 CSP(index.html 머리)는 인라인 스크립트를 막으므로, 그대로
   붙이면 브라우저가 조용히 무시한다. 그래서 같은 코드를 이 파일로 뺐다 —
   'self' 에서 오는 파일이라 CSP 를 통과한다.

   **태그를 새로 걸 때** — GTM 안에서 GA4·구글 애즈 말고 다른 곳으로 가는
   태그를 걸면, 그 주소를 index.html 의 CSP 에도 더해야 한다. 안 그러면
   GTM 미리보기에서는 「실행됨」인데 실제로는 아무것도 안 나간다.
   「맞춤 HTML」 태그와 「맞춤 자바스크립트」 변수는 CSP 가 막는다.

   **이 사이트가 흘리는 이벤트** — 화면이 바뀔 때 cp_screen(아래), 그리고
   app.module.js 의 track() 이 핵심 행동마다 영어 이름으로 흘린다
   (TRACK_EN 표: level_test_start · level_test_complete · lesson_start ·
   lesson_complete · my_course_lesson · my_course_pick_level ·
   recommended_course_click · all_courses_click · drill_complete · word_save ·
   login · sign_up). GTM 에서 「맞춤 이벤트」 트리거로 받는다. */

(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K4Z87SVS');

/* 이 사이트는 주소의 # 뒤만 바뀌는 한 장짜리라, 그냥 두면 GTM 에는 첫
   화면 하나만 보인다. # 이 바뀔 때마다 cp_screen 이벤트를 흘려 둔다 —
   GTM 에서 「맞춤 이벤트: cp_screen」 트리거로 화면마다 태그를 걸 수 있다. */
(function () {
  function push() {
    var h = (location.hash || '').replace(/^#/, '').split('?')[0].split('/')[0];
    window.dataLayer.push({ event: 'cp_screen', cp_screen: h || 'home' });
  }
  window.addEventListener('hashchange', push);
})();
