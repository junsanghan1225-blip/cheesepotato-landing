/* 책 쪽 맨 위 표지: 누르면 같은 자리에서 미리보기 쪽이 넘어간다(표지 → 1쪽 → … → 표지). 다른 화면으로 가지 않는다. 스크립트가 꺼져 있으면 표지만 보이고 아래 「Look inside」 로 본다. */
(function () {
  var box = document.querySelector('[data-flip]'); if (!box) return;
  var bar = document.querySelector('.flipbar'), n = box.querySelector('.flipn') || bar.querySelector('.flipn');
  var im = box.querySelectorAll('.fp'), i = 0, t0 = 0;
  function show(k) {
    i = (k + im.length) % im.length;
    for (var j = 0; j < im.length; j++) im[j].classList.toggle('on', j === i);
    var c = im[i]; if (!c.getAttribute('src')) c.setAttribute('src', c.getAttribute('data-src'));
    var nx = im[(i + 1) % im.length]; if (!nx.getAttribute('src')) nx.setAttribute('src', nx.getAttribute('data-src'));
    n.textContent = i === 0 ? 'Cover' : i + ' / ' + (im.length - 1);
  }
  bar.hidden = false;
  box.addEventListener('click', function () { show(i + 1); });
  bar.addEventListener('click', function (e) { var b = e.target.closest('[data-fp]'); if (b) show(i + Number(b.getAttribute('data-fp'))); });
  box.addEventListener('touchstart', function (e) { t0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - t0; if (Math.abs(d) > 40) { show(i + (d < 0 ? 1 : -1)); e.preventDefault(); } });
  /* 아래 「Look inside」 작은 쪽을 눌러도 확대 화면으로 가지 않고 맨 위 표지 자리에서 그 쪽이 열린다 */
  document.querySelectorAll('.pg2-pv a').forEach(function (a, k) { a.addEventListener('click', function (e) { e.preventDefault(); show(k + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(i + 1); else if (e.key === 'ArrowLeft') show(i - 1); });
})();
