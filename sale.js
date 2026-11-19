/* 책 반값 한 주(운영자 2026-11-17 「D-7 일주일만 50프로 · 구독 말고 책만」).
   기간 안에만 켜진다 — 끝나는 시각이 지나면 아무것도 하지 않아 사이트가 저절로 원래 가격으로 돌아간다.
   · 가격: data-px="9.90" 가 붙은 칸을 「~~$9.90~~ $4.95」 로(상점 목록 · 책 쪽 · 첫 화면 서가 — tools/lib/sheets-shop.mjs · build-home-books.mjs 가 붙인다)
   · 결제: data-sale 가 붙은 책 결제 링크(buy.polar.sh)에 할인 코드를 미리 채운다(Polar 결제 화면이 discount_code 를 받는다 — billing.js 의 LAUNCH30 과 같은 방식)
   · 띠: 상점 · 책 쪽 · 첫 화면 책 코너 맨 위에 「D-n」 한 줄
   할인 코드 자체는 Polar 에 있어야 실제로 깎인다(코드 · 상품 · 기간은 Polar 와 같게). 다음 행사 때는 SALE 만 바꾼다. */
(function () {
  var SALE = { code: 'WEEK50', pct: 50, start: '2026-11-17T00:00:00+09:00', end: '2026-11-24T00:00:00+09:00', until: { en: 'Nov 23', ko: '11월 23일' } };
  var now = Date.now(), s = Date.parse(SALE.start), e = Date.parse(SALE.end);
  if (!(now >= s && now < e)) return;
  var cut = function (p) { return (Math.round(parseFloat(p) * (100 - SALE.pct)) / 100).toFixed(2); };
  var run = function () {
    var ko = (document.documentElement.lang || '').slice(0, 2) === 'ko';
    document.querySelectorAll('[data-px]').forEach(function (el) {
      var p = el.getAttribute('data-px'); if (!/^\d+\.\d{2}$/.test(p) || el.getAttribute('data-sale-done')) return;
      if (el.querySelector('img')) return;   // 첫 화면 서가의 책 링크(a.hm-bk)에도 data-px 가 있어 표지 그림이 가격 글자로 덮이던 것(2026-11-20)
      el.setAttribute('data-sale-done', '1');
      el.innerHTML = '<s class="sale-was">$' + p + '</s> $' + cut(p);
    });
    document.querySelectorAll('a[data-sale]').forEach(function (a) {
      try { var u = new URL(a.href); if (u.hostname !== 'buy.polar.sh') return; u.searchParams.set('discount_code', SALE.code); a.href = u.toString(); } catch (x) {}
    });
    var at = document.querySelector('.pg2-hero, .shop-hero, #hmBooks');
    if (at && !document.querySelector('.sale-bar')) {
      var d = Math.max(1, Math.ceil((e - now) / 864e5));
      var bar = document.createElement('p'); bar.className = 'sale-bar';
      bar.innerHTML = '<b>D-' + d + '</b> ' + (ko ? '모든 PDF 책 ' + SALE.pct + '% 할인 · ' + SALE.until.ko + '까지' : 'All PDF books ' + SALE.pct + '% off · until ' + SALE.until.en) + ' <small>(' + (ko ? '코드 ' + SALE.code + ' — 결제 화면에 자동으로 들어가요. 안 보이면 「Add discount code」에 넣어 주세요' : 'code ' + SALE.code + ' — added at checkout; if not, enter it under “Add discount code”') + ')</small>';
      at.parentNode.insertBefore(bar, at);
    }
  };
  var css = document.createElement('style');
  css.textContent = '.sale-was{opacity:.6;font-weight:500;margin-right:2px}.sale-bar{margin:0;padding:9px 16px;background:#1F1B16;color:#F7F3EA;font:600 14px/1.5 inherit;text-align:left}.sale-bar b{color:#FFB37A;margin-right:6px}.sale-bar small{opacity:.75;font-weight:500}';
  document.head.appendChild(css);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  setTimeout(run, 1500);   // 첫 화면 책 코너가 늦게 그려질 때
})();
