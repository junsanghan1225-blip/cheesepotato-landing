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
    if (at && !document.querySelector('.sale-promo')) {
      var d = Math.max(1, Math.ceil((e - now) / 864e5));
      var seen = {}, ps = [];   // 이 쪽에 나온 정가(9.90 · 6.90 …)마다 반값을 한 줄씩 — 가격을 지어내지 않고 쪽의 data-px 에서 읽는다
      document.querySelectorAll('[data-px]').forEach(function (x) { var p = x.getAttribute('data-px'); if (/^\d+\.\d{2}$/.test(p) && !seen[p]) { seen[p] = 1; ps.push(p); } });
      ps = ps.sort(function (a, b) { return b - a; }).slice(0, 2);
      var rows = ps.map(function (p) { return '<div class="sp-r"><s>$' + p + '</s><i>→</i><b>$' + cut(p) + '</b></div>'; }).join('');
      var bar = document.createElement('div'); bar.className = 'sale-promo';
      bar.innerHTML = '<div class="sp-t"><span class="sp-d">D-' + d + '</span><b>' + (ko ? '모든 PDF 책 ' + SALE.pct + '% 할인' : 'All PDF books ' + SALE.pct + '% off') + '</b>' +
        '<span>' + (ko ? SALE.until.ko + '까지 · 코드 ' + SALE.code : 'Until ' + SALE.until.en + ' · code ' + SALE.code) + '</span></div>' +
        (rows ? '<div class="sp-p">' + rows + '</div>' : '') +
        '<p class="sp-n">' + (ko ? '결제 화면에 코드가 자동으로 들어가요. 안 보이면 「Add discount code」 칸에 ' + SALE.code + ' 를 넣어 주세요.' : 'The code is added at checkout. If it is not, enter ' + SALE.code + ' under “Add discount code”.') + '</p>';
      if (at.id === 'hmBooks') at.insertBefore(bar, at.firstChild); else at.parentNode.insertBefore(bar, at);   // 첫 화면은 책 코너 안쪽 첫 줄(다른 상자와 폭 맞춤), 상점 쪽은 머리 위
    }
  };
  var css = document.createElement('style');
  css.textContent = '.sale-was{opacity:.6;font-weight:500;margin-right:2px}' +
    /* 반값 알림 상자 — 「선생님의 워크북」: 종이 바탕 · 얇은 줄 · 점선 · 작은 모서리, 주황은 반값 가격 한 곳. 알림 띠(검정 · 전체 폭)는 다른 상자와 폭이 안 맞고 긴 글이 두 줄로 꺾여 뺐다(2026-11-20) */
    '.sale-promo{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 24px;align-items:center;margin:0 0 18px;padding:16px 20px;border:1px solid var(--ink,#1c1915);border-radius:8px;background:var(--surface,#fff);color:var(--ink,#1c1915);font-family:inherit;text-align:left}' +
    '.sp-t{display:grid;gap:2px}.sp-t b{font-size:19px;font-weight:800;letter-spacing:-.01em;word-break:keep-all}.sp-t span:last-child{font-size:13.5px;color:var(--ink-2,#4E3E31)}' +
    '.sp-d{justify-self:start;font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--orange-text,var(--orange-deep,#B4460F));border-bottom:2px solid currentColor;padding-bottom:1px;margin-bottom:4px}' +
    '.sp-p{display:grid;gap:4px;padding-left:24px;border-left:1px dashed var(--line,#cfc6b4)}' +
    '.sp-r{display:flex;align-items:baseline;gap:10px;font-variant-numeric:tabular-nums}.sp-r s{font-size:14px;color:var(--ink-3,#8C7A66)}.sp-r i{font-style:normal;color:var(--ink-3,#8C7A66)}.sp-r b{font-size:26px;line-height:1.1;font-weight:800;color:var(--orange-text,var(--orange-deep,#B4460F))}' +
    '.sp-n{grid-column:1/-1;margin:6px 0 0;padding-top:8px;border-top:1px dashed var(--line,#cfc6b4);font-size:12.5px;line-height:1.5;color:var(--ink-3,#8C7A66)}' +
    '@media (max-width:560px){.sale-promo{grid-template-columns:minmax(0,1fr);padding:14px}.sp-p{padding:8px 0 0;border-left:0;border-top:1px dashed var(--line,#cfc6b4)}.sp-r b{font-size:22px}}';
  document.head.appendChild(css);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  setTimeout(run, 1500);   // 첫 화면 책 코너가 늦게 그려질 때
})();
