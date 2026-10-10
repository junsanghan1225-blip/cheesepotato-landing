/* 나의 띠 카드(운영자 2026-10-10 「귀엽고 한국적인 디지털 콘텐츠 — 1번」). 손으로 쓴 쪽 korean-zodiac/ 의 손잡이.
   태어난 해 → 띠 동물 · 한국어 이름 · 「저는 ○○띠예요」 한 문장 · 같은 띠 해들, 그리고 스토리 크기 카드(오방색 띠).
   띠는 해로만 정한다 — 음력 설 전에 태어났으면 앞 해일 수 있다고 화면에 적는다(korean-age 와 같은 셈: (해 − 4) mod 12). */
(function () {
  const K = window.cpCard; if (!K) return;
  const Z = [
    ['쥐', 'Rat', '🐭', '#9AA7B8'], ['소', 'Ox', '🐮', '#C9A27E'], ['호랑이', 'Tiger', '🐯', '#F2A541'], ['토끼', 'Rabbit', '🐰', '#F4B6C2'],
    ['용', 'Dragon', '🐲', '#6CC3A0'], ['뱀', 'Snake', '🐍', '#9BCB6B'], ['말', 'Horse', '🐴', '#C98B5B'], ['양', 'Sheep', '🐑', '#D8CFC2'],
    ['원숭이', 'Monkey', '🐵', '#D9A066'], ['닭', 'Rooster', '🐔', '#F07B5A'], ['개', 'Dog', '🐶', '#E3B778'], ['돼지', 'Pig', '🐷', '#F59FB0'],
  ];
  const OBANG = ['#1F4E9C', '#C8102E', '#F2B705'];   // 오방색(청 · 적 · 황) — 띠를 위아래에 가늘게(무지개처럼 안 보이게 셋만, 사이는 흰 줄)
  const $ = (id) => document.getElementById(id);
  const zOf = (y) => (((y - 4) % 12) + 12) % 12;
  const now = new Date().getFullYear();
  const inp = $('zdIn'); if (!inp) return;
  inp.max = String(now); inp.min = '1920';
  let cur = -1, url = null;

  function years(i) { const out = []; for (let y = 1924; y <= now + 12; y++) if (zOf(y) === i) out.push(y); return out; }
  function paint(i, y) {
    cur = i; const [ko, en, em] = Z[i];
    $('zdEm').textContent = em;
    $('zdBig').textContent = `${ko}띠`;
    $('zdSub').textContent = `${K.roman(ko)}-tti · Year of the ${en}`;
    $('zdSay').innerHTML = `<b>저는 ${ko}띠예요.</b><span>jeoneun ${K.roman(ko)}-tti-yeyo · “I was born in the Year of the ${en}.”</span>`;
    $('zdYears').textContent = `${en} years: ${years(i).filter((x) => x <= now + 1).slice(-8).join(' · ')}`;
    $('zdOut').hidden = false; $('zdAfter').hidden = true;
    document.querySelectorAll('#zdGrid button').forEach((b, k) => b.classList.toggle('on', k === i));
    draw(i, y);
  }
  async function card(i, y) {
    const [ko, en, em, col] = Z[i];
    try { await document.fonts.ready; } catch (e) {}
    const c = K.canvas(), g = c.getContext('2d'), W = 1080;
    g.fillStyle = '#F6EFE2'; g.fillRect(0, 0, W, 1920);
    // 오방색 띠 — 위 · 아래
    const band = (y0) => OBANG.forEach((s, k) => { g.fillStyle = s; g.fillRect(0, y0 + k * 22, W, 14); });
    band(40); band(1920 - 40 - 22 * OBANG.length);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#1B1512'; g.font = `700 54px ${K.FONT}`; g.fillText('My Korean zodiac', W / 2, 270);
    g.fillStyle = '#8C7A66'; g.font = `600 40px ${K.FONT}`; g.fillText('나의 띠', W / 2, 335);
    // 동물 — 띠 색 동그라미 + 흰 테
    g.fillStyle = col; g.beginPath(); g.arc(W / 2, 700, 300, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 18; g.beginPath(); g.arc(W / 2, 700, 272, 0, 7); g.stroke();
    g.textBaseline = 'middle'; g.font = `360px ${K.EMOJI}`; g.fillText(em, W / 2, 720);
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#1B1512'; g.font = `800 150px ${K.FONT}`; g.fillText(`${ko}띠`, W / 2, 1180);
    g.fillStyle = '#4E3E31'; g.font = `600 44px ${K.FONT}`; g.fillText(`${K.roman(ko)}-tti · Year of the ${en}`, W / 2, 1260);
    // 한 문장 상자
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect ? g.roundRect(120, 1330, W - 240, 220, 36) : g.rect(120, 1330, W - 240, 220); g.fill();
    g.fillStyle = '#C8102E'; g.font = `800 62px ${K.FONT}`; g.fillText(`저는 ${ko}띠예요.`, W / 2, 1425);
    g.fillStyle = '#8C7A66'; g.font = `600 34px ${K.FONT}`; g.fillText(`jeoneun ${K.roman(ko)}-tti-yeyo · I'm a ${en.toLowerCase()}`, W / 2, 1495);
    g.fillStyle = '#8C7A66'; g.font = `600 38px ${K.FONT}`; g.fillText("What's yours? 🥔🧀", W / 2, 1660);
    g.fillStyle = '#C4551C'; g.font = `800 44px ${K.FONT}`; g.fillText('everykoreans.com/korean-zodiac', W / 2, 1730);
    return K.blob(c);
  }
  async function draw(i, y) {
    const b = await card(i, y); if (cur !== i || !b) return;
    if (url) URL.revokeObjectURL(url);
    $('zdImg').src = url = URL.createObjectURL(b);
  }
  // 열두 띠 — 눌러서 미리 보기
  $('zdGrid').innerHTML = Z.map(([ko, en, em]) => `<button type="button" aria-label="${en}"><span>${em}</span>${ko}</button>`).join('');
  $('zdGrid').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; paint([...b.parentNode.children].indexOf(b)); });
  const go = () => { const y = Number(inp.value); if (y >= 1900 && y <= now) paint(zOf(y), y); };
  inp.addEventListener('input', go);
  const q = new URLSearchParams(location.search).get('year'); if (q) { inp.value = q; go(); }
  $('zdSave').addEventListener('click', async () => {
    if (cur < 0) return;
    K.save(await card(cur), 'my-korean-zodiac', `I'm ${Z[cur][0]}띠 — Year of the ${Z[cur][1]}! everykoreans.com/korean-zodiac`, 'zdAfter');
  });
})();
