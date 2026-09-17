/* 치즈감자 — 구글 애즈 전환 추적 (gtag.js)

   **왜 따로 두는가** — analytics.js(Clarity)는 「무엇을 봤나」를 본다.
   이쪽은 「광고비를 낸 클릭이 무엇으로 이어졌나」만 본다. 둘은 보는 눈이
   다르고 꺼야 할 때도 따로라서 파일을 가른다. 광고를 안 돌리는 동안에는
   아래 ADS_ID 만 비워 두면 이 파일은 통째로 아무 일도 하지 않는다 —
   스크립트 한 줄도 안 받고, 쿠키도 안 생긴다.

   **왜 defer 인가** — analytics.js 와 같은 이유다. 남의 서버에서 오는 것을
   먼저 돌게 두면 그쪽이 느린 날 우리 화면이 같이 늦는다.

   **무엇을 전환으로 세는가** — 이 사이트는 파는 것이 없어서 「결제」가
   없다. 그래서 광고가 데려온 사람이 실제로 뭔가를 했다는 신호를 전환으로
   삼는다. 아래 LABEL 의 이름들이 그것이고, 앱 받기를 뺀 나머지는
   app.module.js 의 track() 이 이미 남기고 있던 이름을 그대로 쓴다 —
   Clarity 에 찍히던 것과 같은 사건을 구글 애즈에도 함께 보내는 꼴이다.

   ※ 개인정보처리방침과 어긋나면 이 파일을 켜면 안 된다. privacy.html 은
     지금 「광고 및 분석 도구를 일절 사용하지 않습니다」라고 적고 있다.
     그 문장을 먼저 고칠 것(원본은 앱 저장소의 docs/privacy-policy.md).

   ※ EEA·영국에서 오는 사람에게는 구글이 동의 모드(Consent Mode v2)를
     요구한다. 동의 배너가 없으면 그쪽 전환은 집계에서 빠진다. 한국·
     동남아만 겨냥해 돌리는 동안에는 문제가 없고, 유럽을 켤 때 배너를
     함께 붙일 것. */

(function () {
  /* ── 여기 둘만 채우면 된다 ──────────────────────────────────────
     ADS_ID   구글 애즈 > 도구 > 전환 > 태그 설정에 있는 'AW-' 로 시작하는 번호.
     LABEL    전환 하나를 만들 때마다 같이 나오는 전환 라벨.
              (구글 애즈가 주는 코드조각의 send_to: 'AW-123.../XXXX' 에서
               빗금 뒤쪽이 라벨이다.)

     라벨을 안 채운 줄은 그냥 안 보낸다. 그래서 전환을 하나씩 만들어
     가며 채워도 되고, 잠시 끄고 싶으면 그 줄만 비우면 된다. */
  var ADS_ID = '';

  var LABEL = {
    '앱받기':   '',   // Play 스토어로 나가는 클릭 (이 파일이 직접 잡는다)
    '가입완료': '',   // 회원가입 완료
    '로그인':   '',   // 로그인 (가입한 적 있는 사람이 돌아온 것)
    '레슨완료': '',   // 레슨을 처음 끝까지 푼 순간
  };

  /* ── 여기부터는 건드릴 일이 없다 ────────────────────────────── */

  /* 번호가 비었거나 꼴이 틀리면 아무것도 안 한다. 틀린 번호로 부르면
     구글에 요청만 나가고 전환은 안 잡히는, 가장 알아채기 어려운 상태가
     된다. 아예 안 부르는 편이 낫다. */
  if (!/^AW-\d{6,}$/.test(ADS_ID)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  /* 이 사이트는 주소의 # 뒤만 바뀌는 한 장짜리다. gtag 가 알아서 화면
     넘김을 잡아 주지 않는데, 전환을 재는 데는 필요 없다 — 화면별 방문은
     Clarity 쪽에서 본다. */
  gtag('config', ADS_ID);

  var s = document.createElement('script');
  s.async = 1;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ADS_ID);
  document.head.appendChild(s);

  /* 같은 전환을 한 번만 보낸다. 이 사이트는 화면을 새로 받지 않는
     한 장짜리라, 막지 않으면 다운로드 단추를 두 번 누른 사람이 전환 둘로
     세어진다. 「몇 명이 받으러 갔나」를 보려는 것이므로 한 번이 맞다.
     방문이 끝나면(탭을 닫으면) 초기화된다. */
  var sent = {};

  function fire(name) {
    var label = LABEL[name];
    if (!label || sent[name]) return;
    sent[name] = 1;
    try { gtag('event', 'conversion', { send_to: ADS_ID + '/' + label }); } catch (e) {}
  }

  /* app.module.js 의 track() 이 이걸 부른다. 이름이 LABEL 에 없으면
     조용히 넘어가므로, 저쪽에 이벤트가 늘어도 이 파일은 안 건드려도 된다. */
  window.adsTrack = fire;

  /* Play 스토어로 나가는 클릭. 단추가 헤더·옆 서랍·다운로드 구역·단어장
     소개까지 네 군데에 흩어져 있고 앞으로 더 늘 수 있어서, 단추마다
     붙이지 않고 문서 하나에서 받는다 — 주소가 play.google.com 이면 그게
     앱 받으러 가는 길이다.

     캡처 단계에서 받는다. 중간에 누가 전파를 멈춰도 놓치지 않는다.
     새 탭으로 열리는 링크(target="_blank")뿐이라 이 페이지가 닫히지
     않으므로, 요청이 나갈 때까지 기다리게 붙잡을 필요는 없다. */
  document.addEventListener('click', function (e) {
    var el = e.target;
    if (!el || !el.closest) return;
    if (el.closest('a[href*="play.google.com"]')) fire('앱받기');
  }, true);
})();
