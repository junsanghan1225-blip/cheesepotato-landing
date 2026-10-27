/* 책 리뷰 · 별점(운영자 2026-10-27). 책 쪽: 승인된 리뷰(book_reviews, approved = true)만 읽어 별점 · 글을 보인다 — 없으면 아무것도 바꾸지 않는다(「No reviews yet」 그대로, 가짜 별점 없음).
   감사 쪽(/shop/thanks/): form[data-review] 로 리뷰를 보낸다(승인 전에는 안 보임, db/add_book_reviews.sql). 글은 textContent 로만 넣는다(HTML 로 안 읽힘). */
(function () {
  var BASE = 'https://tjgoevtvobvmlyefgxel.supabase.co/rest/v1/book_reviews';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc';
  var H = { apikey: KEY, Authorization: 'Bearer ' + KEY };
  var stars = function (n) { return new Array(n + 1).join('★') + new Array(6 - n).join('☆'); };

  var sec = document.querySelector('[data-reviews]');
  if (sec) {
    var id = sec.getAttribute('data-reviews');
    fetch(BASE + '?select=rating,name,body,created_at,verified&approved=eq.true&order=created_at.desc&limit=50&book_id=eq.' + encodeURIComponent(id), { headers: H })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        if (!list || !list.length) return;
        var avg = list.reduce(function (a, x) { return a + x.rating; }, 0) / list.length;
        var line = avg.toFixed(1) + ' · ' + list.length + (list.length === 1 ? ' review' : ' reviews');
        var put = function (el) { if (!el) return; el.textContent = ''; var s = document.createElement('span'); s.className = 'stars'; s.textContent = stars(Math.round(avg)); el.appendChild(s); el.appendChild(document.createTextNode(' ' + line)); };
        put(sec.querySelector('[data-rv-sum]'));
        var hero = document.querySelector('[data-rv-hero]'); if (hero) { hero.textContent = ''; var s2 = document.createElement('span'); s2.className = 'stars'; s2.textContent = stars(Math.round(avg)); hero.appendChild(s2); hero.appendChild(document.createTextNode(' ' + line)); }
        var box = sec.querySelector('[data-rv-list]');
        list.forEach(function (x) {
          var d = document.createElement('div'); d.className = 'rv-item';
          var st = document.createElement('div'); var ss = document.createElement('span'); ss.className = 'stars'; ss.textContent = stars(x.rating); st.appendChild(ss); d.appendChild(st);
          if (x.body) { var p = document.createElement('p'); p.textContent = x.body; d.appendChild(p); }
          var w = document.createElement('div'); w.className = 'who'; w.textContent = (x.name || 'A learner') + (x.verified ? ' · verified purchase' : '') + ' · ' + String(x.created_at).slice(0, 10); d.appendChild(w);
          box.appendChild(d);
        });
      }).catch(function () {});
  }

  var form = document.querySelector('form[data-review]');
  if (form) {
    var q = new URLSearchParams(location.search);
    var want = q.get('book'); if (want && form.elements.book) { for (var i = 0; i < form.elements.book.options.length; i++) if (form.elements.book.options[i].value === want) form.elements.book.selectedIndex = i; }
    var co = (q.get('checkout_id') || '').slice(0, 100); if (/^\{/.test(co)) co = '';
    var rating = 0; var btns = form.querySelectorAll('[data-star]');
    var paint = function () { Array.prototype.forEach.call(btns, function (b) { var on = Number(b.getAttribute('data-star')) <= rating; b.textContent = on ? '★' : '☆'; b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); };
    Array.prototype.forEach.call(btns, function (b) { b.addEventListener('click', function () { rating = Number(b.getAttribute('data-star')); paint(); }); });
    var msg = form.querySelector('.lead-msg'); var say = function (t, bad) { msg.textContent = t; msg.className = 'lead-msg' + (bad ? ' bad' : ' ok'); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.company && form.elements.company.value) return;
      if (!rating) { say('Please choose 1 to 5 stars. · 별점을 골라 주세요.', true); return; }
      if (!form.elements.ok.checked) { say('Please tick the box so we may show your review. · 리뷰 공개에 동의해 주세요.', true); return; }
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
      var body = { book_id: form.elements.book.value, rating: rating, name: (form.elements.name.value || '').trim().slice(0, 40) || null, body: (form.elements.body.value || '').trim().slice(0, 1500) || null, checkout_id: co || null };
      fetch(BASE, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H), body: JSON.stringify(body) })
        .then(function (r) {
          if (r.ok) { try { (window.dataLayer = window.dataLayer || []).push({ event: '리뷰남김', book: body.book_id, rating: rating }); } catch (e2) {} say('Thank you! We read every review before it appears on the book page. · 감사합니다. 확인한 뒤 책 쪽에 올라갑니다.', false); form.classList.add('done'); }
          else { say('Could not send your review. Please try again later or write to cheesepotato@everykoreans.com. · 보내지 못했어요. 잠시 뒤 다시 해 주세요.', true); btn.disabled = false; }
        }).catch(function () { say('Could not send your review. Please try again later. · 보내지 못했어요.', true); btn.disabled = false; });
    });
  }
})();
