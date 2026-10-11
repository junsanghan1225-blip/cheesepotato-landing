/* 한국어 생일 축하 카드(운영자 2026-10-10 「D」). 손으로 쓴 쪽 korean-birthday/ 의 손잡이.
   받는 사람 이름(영어면 korean-name.js 규칙으로 한글) + 누구에게(친구 · 윗사람 · 정중하게) → 그 말씨의 한 문장 + 스토리 카드.
   친구: 「○○아/야, 생일 축하해!」(받침 있으면 아, 없으면 야) · 윗사람: 「생신 축하드려요!」 · 정중: 「○○ 님, 생일 축하드려요!」 */
(function () {
  const K = window.cpCard; if (!K) return;
  const $ = (id) => document.getElementById(id);
  const inp = $('bdIn'); if (!inp) return;
  let who = 'friend', url = null, cur = null;
  const S0 = 0xac00;
  const hasFinal = (s) => { const c = s.charCodeAt(s.length - 1) - S0; return c >= 0 && c <= 11171 && c % 28 !== 0; };
  function koName(v) {
    v = v.trim().slice(0, 20); if (!v) return '';
    if (/[가-힣]/.test(v)) return v.replace(/[^가-힣\s]/g, '').trim();
    return window.cpKoName ? window.cpKoName(v) : '';
  }
  function line(n, orig) {
    const nm = n.replace(/\s/g, ''); n = orig || n;   // 영어 문장에는 친 이름 그대로(Emily), 한국어 문장에는 한글(에밀리)
    if (who === 'elder') return { ko: '생신 축하드려요!', rom: 'saengsin chukhadeuryeoyo!', en: 'Happy birthday! (to an older person — 생신 is the honorific word for birthday)' };
    if (who === 'polite') return { ko: nm ? `${nm} 님, 생일 축하드려요!` : '생일 축하드려요!', rom: `${nm ? K.roman(nm) + ' nim, ' : ''}saengil chukhadeuryeoyo!`, en: `Happy birthday${nm ? `, ${n}` : ''}! (polite)` };
    const p = nm ? (hasFinal(nm) ? '아' : '야') : '';
    return { ko: nm ? `${nm}${p}, 생일 축하해!` : '생일 축하해!', rom: `${nm ? K.roman(nm + p) + ', ' : ''}saengil chukhahae!`, en: `Happy birthday${nm ? `, ${n}` : ''}! (to a friend)` };
  }
  function paint() {
    const n = koName(inp.value); cur = { n, l: line(n, inp.value.trim()) };
    $('bdKo').textContent = cur.l.ko; $('bdRom').textContent = cur.l.rom; $('bdEn').textContent = cur.l.en;
    $('bdOut').hidden = false; $('bdAfter').hidden = true; draw();
  }
  async function card() {
    const { l } = cur;
    try { await document.fonts.ready; } catch (e) {}
    const c = K.canvas(), g = c.getContext('2d'), W = 1080;
    g.fillStyle = '#FFF4E6'; g.fillRect(0, 0, W, 1920);
    // 색종이 조각 — 같은 자리(무작위 아님, 카드가 늘 같게)
    const cf = ['#FF914D', '#F2B705', '#C8102E', '#6CC3A0', '#2E6FD8', '#F59FB0'];
    // 위(케이크 둘레)와 맨 아래에만 — 글자 위에는 안 떨어지게
    for (let i = 0; i < 40; i++) { const x = 40 + (i * 197) % (W - 80), top = i % 4 !== 3, y = top ? 70 + ((i * 331) % 640) : 1800 + ((i * 53) % 90);
      if (top && y > 360 && x > 300 && x < 780) continue;   // 케이크 자리는 비운다
      g.save(); g.translate(x, y); g.rotate(i); g.fillStyle = cf[i % cf.length]; g.fillRect(-10, -5, 22, 10); g.restore(); }
    g.textAlign = 'center';
    g.textBaseline = 'middle'; g.font = `300px ${K.EMOJI}`; g.fillText('🎂', W / 2, 560); g.textBaseline = 'alphabetic';
    // 말 — 길면 글자를 줄여 두 줄까지
    // 한 줄에 안 들어가면 쉼표 뒤에서 나눈다(「지민아, / 생일 축하해!」) — 낱말 가운데서 끊기지 않게
    let fs = 120, ls; for (;;) { g.font = `800 ${fs}px ${K.FONT}`;
      ls = g.measureText(l.ko).width <= W - 160 ? [l.ko] : l.ko.includes(', ') ? l.ko.split(/(?<=,) /) : K.lines(g, l.ko, W - 160);
      if (ls.every((s) => g.measureText(s).width <= W - 160) || fs <= 70) break; fs -= 8; }
    let y = 920; g.fillStyle = '#C8102E'; for (const s of ls) { g.fillText(s, W / 2, y); y += fs * 1.2; }
    g.fillStyle = '#4E3E31'; g.font = `600 42px ${K.FONT}`; y = K.para(g, l.rom, W / 2, y + 10, W - 200, 54);
    g.fillStyle = '#8C7A66'; g.font = `500 36px ${K.FONT}`; y = K.para(g, l.en.replace(/ \(.*\)$/, ''), W / 2, y + 10, W - 200, 48);
    // 생일 노래 첫 줄 · 미역국
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect ? g.roundRect(120, 1310, W - 240, 230, 32) : g.rect(120, 1310, W - 240, 230); g.fill();
    g.fillStyle = '#1B1512'; g.font = `700 46px ${K.FONT}`; g.fillText('♪ 생일 축하합니다 ♪', W / 2, 1390);
    g.fillStyle = '#8C7A66'; g.font = `500 32px ${K.FONT}`; K.para(g, 'In Korea, people eat 미역국 (seaweed soup) on their birthday 🍲', W / 2, 1450, W - 320, 44);
    g.fillStyle = '#8C7A66'; g.font = `600 38px ${K.FONT}`; g.fillText('Send one in Korean 🥔🧀', W / 2, 1660);
    g.fillStyle = '#C4551C'; g.font = `800 44px ${K.FONT}`; g.fillText('everykoreans.com/korean-birthday', W / 2, 1730);
    return K.blob(c);
  }
  async function draw() { const me = cur, b = await card(); if (cur !== me || !b) return; if (url) URL.revokeObjectURL(url); $('bdImg').src = url = URL.createObjectURL(b); }
  inp.addEventListener('input', paint);
  $('bdWho').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; who = b.dataset.who;
    $('bdWho').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); paint(); });
  $('bdSave').addEventListener('click', async () => { if (cur) K.save(await card(), 'korean-birthday-card', `${cur.l.ko} 🎂 everykoreans.com/korean-birthday`, 'bdAfter'); });
  const q = new URLSearchParams(location.search).get('name'); if (q) inp.value = q.slice(0, 20);
  paint(); window.addEventListener('load', paint);   // korean-name.js(영어 → 한글)가 늦게 붙어도
})();
