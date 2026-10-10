/* 한국 나이 계산기(운영자 2026-10-10 「트래픽 A — 무료 도구 쪽」). /korean-age/ 이 부른다.
   만 나이(2023-06-28부터 법 · 행정의 기준) · 연 나이 · 세는 나이, 말하는 법(고유어 + 살 / 한자어 + 세), 띠(해로만 — 설 전 생일은 앞 해일 수 있다고 화면에 적음). */
(function () {
  const $ = (id) => document.getElementById(id);
  const inp = $('agIn'); if (!inp) return;
  const TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
  const ONES = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];   // 「살」 앞의 꼴(하나 → 한)
  const SINO = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const native = (n) => n >= 100 || n < 1 ? null : n === 20 ? '스무' : TENS[Math.floor(n / 10)] + ONES[n % 10];
  const sino = (n) => { if (n >= 100) return null; const t = Math.floor(n / 10), o = n % 10; return (t ? (t > 1 ? SINO[t] : '') + '십' : '') + SINO[o]; };
  const ZOD = [['쥐', 'Rat'], ['소', 'Ox'], ['호랑이', 'Tiger'], ['토끼', 'Rabbit'], ['용', 'Dragon'], ['뱀', 'Snake'], ['말', 'Horse'], ['양', 'Sheep'], ['원숭이', 'Monkey'], ['닭', 'Rooster'], ['개', 'Dog'], ['돼지', 'Pig']];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function draw() {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inp.value), out = $('agOut');
    if (!m) { out.hidden = true; return; }
    const y = +m[1], mo = +m[2], d = +m[3], now = new Date(), ty = now.getFullYear();
    if (y < 1900 || y > ty) { out.hidden = true; return; }
    const had = now.getMonth() + 1 > mo || (now.getMonth() + 1 === mo && now.getDate() >= d);
    const man = ty - y - (had ? 0 : 1), year = ty - y, count = ty - y + 1;
    const z = ZOD[(((y - 4) % 12) + 12) % 12];
    $('agBig').textContent = `만 ${man}세`;
    const nv = native(man);
    $('agSay').textContent = man >= 1 ? `Say it: ${nv ? nv + ' 살' : man + '살'} · formal: ${man}세${sino(man) ? ' (' + sino(man) + ' 세)' : ''}` : 'Under 1 year old';
    $('agRows').innerHTML = [
      ['만 나이 · International age', `${man}`, 'Law and official documents since 2023-06-28'],
      ['연 나이 · Year age', `${year}`, `${ty} − ${y}`],
      ['세는 나이 · Counting age', `${count}`, 'Traditional: 1 at birth, +1 every New Year'],
      ['띠 · Zodiac', `${z[0]}띠 · ${z[1]}`, 'By birth year — if born before Lunar New Year, it may be the year before'],
    ].map((r) => `<tr><th>${esc(r[0])}</th><td><b>${esc(r[1])}</b><br><span class="note">${esc(r[2])}</span></td></tr>`).join('');
    out.hidden = false;
  }
  inp.max = new Date().toISOString().slice(0, 10);
  inp.addEventListener('input', draw);
  inp.addEventListener('change', draw);
})();
