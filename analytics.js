/* 치즈감자 — 방문 기록 (Microsoft Clarity)

   쿠키를 쓰지 않고, 화면 녹화와 방문 수를 같이 본다.

   **왜 defer 인가** — 이 스크립트가 불러오는 건 남의 서버에서 온다.
   먼저 돌게 두면 그쪽이 느린 날 우리 화면이 같이 늦게 뜬다. defer 로
   두면 사이트가 다 그려진 뒤에 붙으므로 학습자가 기다리는 시간이
   늘지 않는다. clarity.ms 가 통째로 죽어도 화면은 멀쩡하다.

   **개인 정보** — Clarity 는 화면을 녹화한다. 그래서 학습자가 친 글과
   저장해 둔 단어가 그대로 찍힐 수 있다. index.html 의 clarity-mask 로
   그런 자리를 가려 둔다(모양은 남고 글자만 별표가 된다 — 어디를
   눌렀는지는 보이되 무엇을 썼는지는 안 보인다). */

  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "y2rlymno2u");

(function () {
  /* 이 사이트는 주소의 # 뒤만 바뀌는 한 장짜리다. 그래서 그냥 두면
     한 번 들어온 사람이 배우기·숫자·게임을 다 돌아다녀도 방문 하나로만
     남는다. 「몇 명 왔나」는 알 수 있어도 「무엇을 보러 왔나」는 못 본다.
     # 이 바뀔 때마다 어느 화면인지 딱지를 달아 둔다 — Clarity 에서
     그 딱지로 녹화를 걸러 볼 수 있다. */
  var NAME = {
    '': '홈', 'download': '내려받기', 'learn': '배우기', 'num': '숫자',
    'games': '놀이', 'lesson': '레슨', 'quiz': '단어 시험', 'test': '발음 시험',
    'wordbook': '내 단어장', 'library': '자료마당', 'dash': '내 정보',
    'auth': '로그인', 'claw': '인형뽑기', 'match': '짝 맞추기',
  };
  function mark() {
    var h = (location.hash || '').replace(/^#/, '').split('?')[0];
    /* 모르는 해시는 그대로 흘리지 않는다 — 남이 주소에 아무 말이나 넣어
       보낼 수 있고, 그게 대시보드 딱지 목록을 어지럽힌다. */
    var name = Object.prototype.hasOwnProperty.call(NAME, h) ? NAME[h] : '기타';
    try { window.clarity && window.clarity('set', '화면', name); } catch (e) {}
  }
  window.addEventListener('hashchange', mark);
  mark();
})();
