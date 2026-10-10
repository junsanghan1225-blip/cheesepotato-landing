/* 치즈감자 — 방문 기록 (Microsoft Clarity)

   화면 녹화와 방문 수를 같이 본다. 유럽 방문자는 동의를 받은 뒤에만 기억 쿠키를 쓴다(아래 동의 줄).

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

/* 유럽 방문자 쿠키 동의 줄(2026-10-10, 운영자 「쿠키 동의 줄을 띄우자」).
   Clarity 는 유럽(EEA · 영국 · 스위스) 방문자에게 동의 신호가 없으면 기억 쿠키를 쓰지 않는다 —
   그래서 한 사람이 쪽마다 새 사람으로 잡혔다(Clarity 10/8~10/10, 독일 1명 → 46번).
   나라는 서버 없이 시간대(Europe/…)로 어림한다. 고른 것은 이 기기에만(cp_consent y · n), 밖으로 안 나간다.
   앱 안(WebView)에서는 띄우지 않는다 — 아래 탭을 가리므로. 유럽 밖은 지금까지처럼 그대로. */
(function () {
  function grant(ok) {
    try {
      var v = ok ? 'granted' : 'denied';
      window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: v });
      if (ok) window.clarity('consent'); // 옛 방식 — 새 방식을 모르는 버전 대비
    } catch (e) {}
  }
  var tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  if (!/^Europe\//.test(tz) || /CheesePotatoApp/.test(navigator.userAgent)) return;
  var saved = null;
  try { saved = localStorage.getItem('cp_consent'); } catch (e) {}
  if (saved === 'y' || saved === 'n') { grant(saved === 'y'); return; }

  function show() {
    // 쪽의 말(문항 쪽은 lang=ko)이 아니라 방문자 브라우저의 말로 — 유럽 방문자는 대개 한국어를 못 읽는다.
    var ko = /^ko/i.test(navigator.language || '');
    var bar = document.createElement('div');
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', ko ? '쿠키 동의' : 'Cookie consent');
    bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:560px;margin:0 auto;' +
      'background:#2A1E12;color:#FFF6E0;border-radius:16px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.3);' +
      'font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;flex-wrap:wrap;gap:10px;align-items:center';
    var p = document.createElement('div');
    p.style.cssText = 'flex:1 1 260px';
    p.textContent = ko
      ? '어느 화면이 불편한지 보고 고치려고 Microsoft Clarity 쿠키를 써도 될까요? 입력한 글은 기록하지 않아요. '
      : 'May we use Microsoft Clarity cookies to see which screens are hard to use, so we can fix them? What you type is never recorded. ';
    var a = document.createElement('a');
    a.href = '/privacy.html';
    a.textContent = ko ? '개인정보처리방침' : 'Privacy policy';
    a.style.cssText = 'color:#FFD36B;text-decoration:underline';
    p.appendChild(a);
    function btn(label, ok, main) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = 'border:0;border-radius:999px;padding:9px 16px;font:600 14px system-ui,sans-serif;cursor:pointer;' +
        (main ? 'background:#FFC24D;color:#2A1E12' : 'background:transparent;color:#FFF6E0;border:1px solid rgba(255,246,224,.4)');
      b.addEventListener('click', function () {
        try { localStorage.setItem('cp_consent', ok ? 'y' : 'n'); } catch (e) {}
        grant(ok);
        bar.remove();
      });
      return b;
    }
    bar.appendChild(p);
    bar.appendChild(btn(ko ? '거절' : 'No thanks', false, false));
    bar.appendChild(btn(ko ? '괜찮아요' : 'OK', true, true));
    document.body.appendChild(bar);
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();

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
    'auth': '로그인', 'words': '단어',
  };
  /* 문법·블로그·사전 같은 만들어 둔 쪽(tools/build-pages.mjs)에서도 이 파일이 돈다.
     거기엔 # 이 없으니 주소의 첫 칸으로 딱지를 단다 — 「검색으로 온 사람이 어느 갈래
     쪽에서 들어왔나」를 Clarity 에서 걸러 보려고. */
  var PAGE = {
    'sentence': '문법쪽', 'blog': '블로그쪽', 'dictionary': '사전쪽', 'course': '코스쪽',
    'lesson': '레슨쪽', 'compare': '비교쪽', 'topik-reading': 'TOPIK쪽',
    'topik-writing': 'TOPIK쪽', 'topik-listening': 'TOPIK쪽', 'eps-topik': 'EPS쪽',
  };
  var seg = location.pathname.replace(/^\/+/, '').split('/')[0];
  if (seg && seg !== 'index.html') {
    try { window.clarity && window.clarity('set', '화면', Object.prototype.hasOwnProperty.call(PAGE, seg) ? PAGE[seg] : '기타쪽'); } catch (e) {}
    return;
  }
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

/* 다시 오는가 — 쓸모를 재는 가장 정직한 숫자다. 마지막으로 온 날만
   이 기기에 적어 두고(밖으로는 안 나간다), 「첫 방문 / 재방문」과
   몇 날 만에 왔는지를 딱지로 단다. 저장소가 막힌 브라우저면 그냥 넘어간다. */
(function () {
  try {
    var KEY = 'cp_last_visit', today = new Date().toISOString().slice(0, 10);
    var last = localStorage.getItem(KEY);
    var gap = last ? Math.round((Date.parse(today) - Date.parse(last)) / 864e5) : null;
    var kind = last === null ? '첫방문' : gap === 0 ? '같은날' : '재방문';
    var bucket = gap === null ? '-' : gap <= 1 ? '1일' : gap <= 7 ? '1주' : gap <= 30 ? '1달' : '1달+';
    if (window.clarity) {
      window.clarity('set', '방문', kind);
      window.clarity('set', '지난방문', bucket);
      if (kind === '재방문') window.clarity('event', '재방문');
    }
    localStorage.setItem(KEY, today);
  } catch (e) {}
})();

/* 밖으로 나가는 단추 세기 — data-ev 를 단 링크를 누르면 Clarity 이벤트 · GTM 이벤트를 남긴다(2026-10-03).
   수업 신청(Preply) · WhatsApp 처럼 「사이트가 돈으로 이어지는 곳」이 몇 번 눌렸는지 보려고.
   teacher.html 처럼 app.module.js 가 없는 쪽에서도 돌아야 해서 여기 둔다. 링크는 그대로 열린다. */
(function () {
  var EN = { '수업신청클릭': 'lesson_booking_click', '왓츠앱클릭': 'whatsapp_click', '선생님쪽열기': 'teacher_page_click' };
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[data-ev]') : null;
    if (!a) return;
    var name = a.getAttribute('data-ev'), from = a.getAttribute('data-ev-from') || location.pathname;
    try { if (window.clarity) { window.clarity('event', name); window.clarity('set', '수업단추자리', from); } } catch (e) {}
    try { if (EN[name]) (window.dataLayer = window.dataLayer || []).push({ event: EN[name], cp_event: name, cp_from: from }); } catch (e) {}
  }, true);
})();
