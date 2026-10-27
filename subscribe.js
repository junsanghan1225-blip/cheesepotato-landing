/* 이메일 모으기 — 책 쪽 · 학습지 쪽의 「무료 샘플」 칸(운영자 2026-10-27).
   form[data-lead="<어디서>"] 안에 input[type=email] · 체크박스 · 단추가 있고, 같은 칸 안의 .lead-after 가 받기 링크(처음엔 보이고, 이메일 없이도 받을 수 있다).
   이메일을 내면 Supabase `email_leads` 에 한 줄(쓰기만 되는 표 — db/add_email_leads.sql). 실패해도 샘플은 막지 않는다 — 받기 링크는 항상 열려 있다.
   주의: 이메일 · 동의 여부만 보낸다. 파일 이름 · 쪽 주소는 source 에만. 브라우저 저장소를 쓰지 않는다. */
(function () {
  var URL = 'https://tjgoevtvobvmlyefgxel.supabase.co/rest/v1/email_leads';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc';
  var OK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function track(ev, extra) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, extra)); } catch (e) {} }
  Array.prototype.forEach.call(document.querySelectorAll('form[data-lead]'), function (form) {
    var msg = form.querySelector('.lead-msg');
    var say = function (t, bad) { if (msg) { msg.textContent = t; msg.className = 'lead-msg' + (bad ? ' bad' : ' ok'); } };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (form.elements.email.value || '').trim();
      if (form.elements.company && form.elements.company.value) return;   // 사람이 안 보는 칸이 채워지면 봇 — 조용히 무시
      if (!OK.test(email) || email.length > 254) { say('Please enter a valid email. · 이메일을 확인해 주세요.', true); return; }
      var btn = form.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
      var body = JSON.stringify({ email: email, source: form.getAttribute('data-lead').slice(0, 80), lang: (document.documentElement.lang || '').slice(0, 12), marketing_ok: !!(form.elements.tips && form.elements.tips.checked) });
      fetch(URL, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: body })
        .then(function (r) {
          /* 201 = 새로 받음, 409 = 이미 있는 이메일 — 둘 다 「됐다」로 보인다(누가 신청했는지 드러내지 않는다) */
          if (r.ok || r.status === 409) { track('이메일신청', { place: form.getAttribute('data-lead') }); say('Thank you! Your sample is ready below. · 감사합니다. 아래에서 샘플을 받으세요.', false); form.classList.add('done'); }
          else { say('Could not save your email, but you can still download the sample below. · 이메일 저장은 못 했지만 아래에서 샘플을 받을 수 있어요.', true); if (btn) btn.disabled = false; }
        })
        .catch(function () { say('Could not save your email, but you can still download the sample below. · 이메일 저장은 못 했지만 아래에서 샘플을 받을 수 있어요.', true); if (btn) btn.disabled = false; });
    });
  });
})();
