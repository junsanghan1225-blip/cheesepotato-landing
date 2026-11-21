/* TOPIK 쓰기 · 읽기 · 듣기 모음 쪽(/topik-writing/ · /topik-reading/ · /topik-listening/) 문항 고르기 —
   탭(번호 · 시험) · 유형 칩 · 찾기 · 정렬(번호순 / 안 본 것 / 본 것) · 무작위 · 8개씩 더 보기.
   목록은 build-pages.mjs 가 HTML 로 다 그려 두고, 여기서는 보이고 숨기는 것만 한다(JS 가 없으면 전부 보인다).
   「본 것」은 목록에 data-seen(localStorage 열쇠)이 있을 때만 — 쓰기는 앱이 문항을 열 때 적는 cp-tw-seen(app.module.js twSeenAdd). */
(function () {
  var rows = document.getElementById('twRows');
  if (!rows) return;
  var lis = Array.prototype.slice.call(rows.children);
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var tabs = $$('.tw-t'), segs = $$('.tw-seg button'), chipSets = $$('.tw-chips');
  var find = document.getElementById('twFind');
  var more = document.getElementById('twMore');
  var moreBtn = document.getElementById('twMoreBtn');
  var count = document.getElementById('twCount');
  var empty = document.getElementById('twEmpty');
  var STEP = 8;
  var KEY = 'cp-twl-q:' + location.pathname;
  var q = tabs.length ? tabs[0].getAttribute('data-q') : '', t = '', f = 'all', shown = STEP;
  try { var s0 = sessionStorage.getItem(KEY); if (s0 && tabs.some(function (b) { return b.getAttribute('data-q') === s0; })) q = s0; } catch (e) {}

  /* 짧게 그린 줄(읽기): 유형 글자 · 「풀기」 단추를 채운다 — 유형 이름은 칩 글자에서 */
  var goTpl = rows.getAttribute('data-go'), goTxt = rows.getAttribute('data-go-txt') || '';
  var tyName = {};
  chipSets.forEach(function (c) { Array.prototype.forEach.call(c.querySelectorAll('button[data-t]'), function (b) { var k = b.getAttribute('data-t'); if (k) tyName[c.getAttribute('data-q') + ':' + k] = b.firstChild.nodeValue; }); });
  lis.forEach(function (li) {
    if (!goTpl || li.querySelector('.tw-go')) return;
    var q0 = li.getAttribute('data-q'), ty = document.createElement('span'), go = document.createElement('a');
    ty.className = 'tw-st ty'; ty.textContent = tyName[q0 + ':' + li.getAttribute('data-t')] || '';
    go.className = 'tw-go'; go.textContent = goTxt; go.href = goTpl.replace('{q}', q0).replace('{id}', li.getAttribute('data-id'));
    li.appendChild(ty); li.appendChild(go);
  });

  var seenKey = rows.getAttribute('data-seen');
  if (seenKey) {
    var seen = [];
    try { seen = JSON.parse(localStorage.getItem(seenKey) || '[]'); if (!Array.isArray(seen)) seen = []; } catch (e) { seen = []; }
    lis.forEach(function (li) {
      if (seen.indexOf(li.getAttribute('data-id')) >= 0) {
        li.classList.add('seen'); li.querySelector('.tw-st').textContent = '✓ 본 문항';
        var go = li.querySelector('.tw-go'); go.textContent = '다시 ' + go.textContent;
      }
    });
  }

  function match() {
    var words = (find.value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    return lis.filter(function (li) {
      /* 찾는 말이 있으면 탭 · 칩과 상관없이 전체에서 찾는다 */
      if (!words.length) {
        if (q && li.getAttribute('data-q') !== q) return false;
        if (t && li.getAttribute('data-t') !== t) return false;
      }
      var s = li.classList.contains('seen');
      if (f === 'new' && s) return false;
      if (f === 'seen' && !s) return false;
      /* 찾을 글: data-s(쓰기 · 듣기 — 지문 · 대본까지), 없으면 줄에 보이는 글(번호 · 주제 · 유형) */
      var hay = li.getAttribute('data-s') || (li.__s || (li.__s = li.textContent.toLowerCase()));
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
    chipSets.forEach(function (c) {
      c.hidden = c.getAttribute('data-q') !== q;
      Array.prototype.forEach.call(c.querySelectorAll('button'), function (b) { b.classList.toggle('on', (b.getAttribute('data-t') || '') === t); });
    });
    segs.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-f') === f); });
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      q = b.getAttribute('data-q'); t = ''; shown = STEP; find.value = '';
      try { sessionStorage.setItem(KEY, q); } catch (e) {}
      paint();
    });
  });
  chipSets.forEach(function (c) {
    Array.prototype.forEach.call(c.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () { t = b.getAttribute('data-t') || ''; shown = STEP; find.value = ''; paint(); });
    });
  });
  segs.forEach(function (b) { b.addEventListener('click', function () { f = b.getAttribute('data-f'); shown = STEP; paint(); }); });
  find.addEventListener('input', function () { shown = STEP; paint(); });
  moreBtn.addEventListener('click', function () { shown += STEP * 2; paint(); });
  /* 무작위 한 문제 — 지금 보이는 조건(탭 · 칩 · 찾기 · 정렬)에 맞는 것 중 하나, 바로 풀기로 */
  document.getElementById('twRand').addEventListener('click', function () {
    var m = match(); if (!m.length) return;
    location.href = m[Math.floor(Math.random() * m.length)].querySelector('.tw-go').href;
  });
  paint();
})();
