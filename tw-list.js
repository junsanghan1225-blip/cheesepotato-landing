/* /topik-writing/ 문항 고르기 — 번호 탭 · 찾기 · 정렬(번호순 / 안 본 것 / 본 것) · 무작위 · 8개씩 더 보기.
   목록은 build-pages.mjs 가 HTML 로 다 그려 두고, 여기서는 보이고 숨기는 것만 한다(JS 가 없으면 전부 보인다).
   「본 것」은 앱이 문항을 열 때 이 브라우저에 적는 cp-tw-seen(app.module.js twSeenAdd) 을 읽는다. */
(function () {
  var rows = document.getElementById('twRows');
  if (!rows) return;
  var lis = Array.prototype.slice.call(rows.children);
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tw-t'));
  var segs = Array.prototype.slice.call(document.querySelectorAll('.tw-seg button'));
  var find = document.getElementById('twFind');
  var more = document.getElementById('twMore');
  var moreBtn = document.getElementById('twMoreBtn');
  var count = document.getElementById('twCount');
  var empty = document.getElementById('twEmpty');
  var STEP = 8;
  var seen = [];
  try { seen = JSON.parse(localStorage.getItem('cp-tw-seen') || '[]'); if (!Array.isArray(seen)) seen = []; } catch (e) { seen = []; }
  var q = '51', f = 'all', shown = STEP;
  try { var t = sessionStorage.getItem('cp-twl-q'); if (t) q = t; } catch (e) {}

  lis.forEach(function (li) {
    if (seen.indexOf(li.getAttribute('data-id')) >= 0) { li.classList.add('seen'); li.querySelector('.tw-st').textContent = '✓ 본 문항'; li.querySelector('.tw-go').textContent = '다시 쓰기'; }
  });

  function match() {
    var words = (find.value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    return lis.filter(function (li) {
      /* 찾는 말이 있으면 번호 탭과 상관없이 200문항 전체에서 찾는다 */
      if (!words.length && li.getAttribute('data-q') !== q) return false;
      var s = li.classList.contains('seen');
      if (f === 'new' && s) return false;
      if (f === 'seen' && !s) return false;
      var hay = li.getAttribute('data-s') || '';
      return words.every(function (w) { return hay.indexOf(w) >= 0; });
    });
  }
  function paint() {
    var m = match();
    lis.forEach(function (li) { li.hidden = true; });
    m.forEach(function (li, i) { li.hidden = i >= shown; });
    empty.hidden = m.length > 0;
    rows.hidden = m.length === 0;
    more.hidden = m.length === 0;
    count.textContent = m.length + '문항 중 ' + (m.length ? '1~' + Math.min(shown, m.length) : '0');
    moreBtn.hidden = shown >= m.length;
    tabs.forEach(function (b) { var on = b.getAttribute('data-q') === q; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    segs.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-f') === f); });
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      q = b.getAttribute('data-q'); shown = STEP; find.value = '';
      try { sessionStorage.setItem('cp-twl-q', q); } catch (e) {}
      paint();
    });
  });
  segs.forEach(function (b) { b.addEventListener('click', function () { f = b.getAttribute('data-f'); shown = STEP; paint(); }); });
  find.addEventListener('input', function () { shown = STEP; paint(); });
  moreBtn.addEventListener('click', function () { shown += STEP * 2; paint(); });
  /* 무작위 한 문제 — 지금 보이는 조건(번호 · 찾기 · 정렬)에 맞는 것 중 하나, 바로 쓰기로 */
  document.getElementById('twRand').addEventListener('click', function () {
    var m = match(); if (!m.length) return;
    location.href = m[Math.floor(Math.random() * m.length)].querySelector('.tw-go').href;
  });
  paint();
})();
