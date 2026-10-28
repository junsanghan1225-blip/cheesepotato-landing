/* 책 쪽 맨 위 표지: 단추(‹ ›) · 쓸어 넘기기로 같은 자리에서 미리보기 쪽을 넘기고, 누르면 큰 화면(구매자가 읽기 알맞은 크기)으로 연다. 주소는 바뀌지 않는다.
   스크립트가 꺼져 있으면 표지만 보이고 아래 「Look inside」 작은 쪽을 누르면 그 쪽의 큰 그림으로 간다. */
(function () {
  var box = document.querySelector('[data-flip]'); if (!box) return;
  var bar = document.querySelector('.flipbar'), n = bar.querySelector('.flipn');
  var im = box.querySelectorAll('.fp'), i = 0, t0 = 0, big = null, bimg, bn;
  function src(c) { if (!c.getAttribute('src')) c.setAttribute('src', c.getAttribute('data-src')); return c.getAttribute('src'); }
  function show(k) {
    i = (k + im.length) % im.length;
    for (var j = 0; j < im.length; j++) im[j].classList.toggle('on', j === i);
    src(im[i]); src(im[(i + 1) % im.length]);
    var label = i === 0 ? 'Cover' : i + ' / ' + (im.length - 1);
    n.textContent = label;
    if (big) { bimg.src = src(im[i]); bimg.alt = im[i].alt; bn.textContent = label; }
  }
  function open(k) {
    if (typeof k === 'number') show(k);
    if (!big) {
      big = document.createElement('div'); big.className = 'fz'; big.setAttribute('role', 'dialog'); big.setAttribute('aria-label', 'Book preview');
      big.innerHTML = '<button type="button" class="fz-x" aria-label="Close">×</button><img alt=""><div class="fz-b"><button type="button" data-z="-1" aria-label="Previous page">‹</button><span></span><button type="button" data-z="1" aria-label="Next page">›</button></div>';
      bimg = big.querySelector('img'); bn = big.querySelector('span');
      big.addEventListener('click', function (e) {
        var b = e.target.closest('[data-z]');
        if (b) show(i + Number(b.getAttribute('data-z')));
        else if (e.target !== bimg) close();
      });
      big.addEventListener('touchstart', function (e) { t0 = e.touches[0].clientX; }, { passive: true });
      big.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - t0; if (Math.abs(d) > 40) show(i + (d < 0 ? 1 : -1)); });
    }
    document.body.appendChild(big); document.body.style.overflow = 'hidden';
    bimg.src = src(im[i]); bimg.alt = im[i].alt; bn.textContent = n.textContent;
  }
  function close() { if (big && big.parentNode) big.parentNode.removeChild(big); document.body.style.overflow = ''; }
  bar.hidden = false;
  box.addEventListener('click', function () { open(); });
  bar.addEventListener('click', function (e) { var b = e.target.closest('[data-fp]'); if (b) show(i + Number(b.getAttribute('data-fp'))); });
  box.addEventListener('touchstart', function (e) { t0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - t0; if (Math.abs(d) > 40) { show(i + (d < 0 ? 1 : -1)); e.preventDefault(); } });
  /* 아래 「Look inside」 작은 쪽을 누르면 그 쪽이 바로 큰 화면으로 열린다 */
  document.querySelectorAll('.pg2-pv a').forEach(function (a, k) { a.addEventListener('click', function (e) { e.preventDefault(); open(k + 1); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(i + 1);
    else if (e.key === 'ArrowLeft') show(i - 1);
  });
})();
