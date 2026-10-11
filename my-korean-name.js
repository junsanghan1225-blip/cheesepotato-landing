/* 나의 한국 이름 짓기(운영자 2026-10-10 「A」). 손으로 쓴 쪽 my-korean-name/ 의 손잡이.
   내 이름 + 생일(+ 느낌: 여 · 남 · 아무거나)로 성 하나 · 이름 하나를 고른다 — 같은 입력이면 늘 같은 이름(재미 · 공유용).
   이름 · 한자는 korean-names.js(손으로 고른 자료). 한자는 「한 가지 예」라고 화면 · 카드에 적는다. */
(function () {
  const K = window.cpCard, D = window.KO_NAMES; if (!K || !D) return;
  const $ = (id) => document.getElementById(id);
  const nm = $('mkName'), bd = $('mkBirth'); if (!nm) return;
  let g = 'u', cur = null, url = null, bump = 0;
  const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  function pick() {
    const key = `${nm.value.trim().toLowerCase()}|${bd.value}|${g}|${bump}`;
    if (!nm.value.trim()) return null;
    const h = hash(key), h2 = hash(key + '#');
    const tot = D.surnames.reduce((a, s) => a + s[3], 0); let r = h % tot, sn = D.surnames[0];
    for (const s of D.surnames) { if (r < s[3]) { sn = s; break; } r -= s[3]; }
    const pool = D.given.filter((x) => g === 'u' || x.g === g || x.g === 'u');
    return { sn, gv: pool[h2 % pool.length] };
  }
  const romanGiven = (ko) => { const r = [...ko].map((c) => K.roman(c)); const s = r.join('-'); return s.charAt(0).toUpperCase() + s.slice(1); };
  function paint() {
    cur = pick(); $('mkOut').hidden = !cur; $('mkAfter').hidden = true; if (!cur) return;
    const { sn, gv } = cur;
    $('mkBig').textContent = sn[0] + gv.ko;
    $('mkSub').textContent = `${sn[2]} ${romanGiven(gv.ko)}${gv.hj ? ` · ${sn[1]} ${gv.hj.map((x) => x[0]).join('')}` : ''}`;
    $('mkMean').textContent = `“${gv.en}”`;
    $('mkHj').innerHTML = gv.hj ? gv.hj.map((x) => `<span><b>${x[0]}</b>${x[1]}<small>${x[2]}</small></span>`).join('')
      : `<span class="native">${'A native Korean word — no hanja (Chinese characters).'}</span>`;
    $('mkSeal').href = `/korean-name/`;
    draw();
  }
  async function card() {
    const { sn, gv } = cur;
    try { await document.fonts.ready; } catch (e) {}
    const c = K.canvas(), x = c.getContext('2d'), W = 1080;
    x.fillStyle = '#F6EFE2'; x.fillRect(0, 0, W, 1920);
    // 오방색 띠(띠 카드와 같은 무늬) — 위 · 아래
    const band = (y0) => ['#1F4E9C', '#C8102E', '#F2B705'].forEach((s, k) => { x.fillStyle = s; x.fillRect(0, y0 + k * 22, W, 14); });
    band(40); band(1920 - 40 - 66);
    x.textAlign = 'center';
    x.fillStyle = '#1B1512'; x.font = `700 54px ${K.FONT}`; x.fillText('If I were Korean, my name would be', W / 2, 280);
    x.fillStyle = '#8C7A66'; x.font = `600 40px ${K.FONT}`; x.fillText('나의 한국 이름', W / 2, 345);
    // 이름 — 흰 종이 위에 크게, 오른쪽 아래 작은 빨간 도장(성)
    x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(110, 430, W - 220, 560, 40) : x.rect(110, 430, W - 220, 560); x.fill();
    x.fillStyle = '#1B1512'; x.font = `800 230px ${K.FONT}`; x.fillText(sn[0] + gv.ko, W / 2, 740);
    x.fillStyle = '#4E3E31'; x.font = `600 52px ${K.FONT}`; x.fillText(`${sn[2]} ${romanGiven(gv.ko)}`, W / 2, 840);
    if (gv.hj) { x.fillStyle = '#8C7A66'; x.font = `500 56px ${K.FONT}`; x.fillText(`${sn[1]} ${gv.hj.map((h) => h[0]).join('')}`, W / 2, 925); }
    x.save(); x.translate(W - 200, 880); x.rotate(-0.08);
    x.strokeStyle = '#C8102E'; x.lineWidth = 8; x.strokeRect(-46, -46, 92, 92);
    x.fillStyle = '#C8102E'; x.font = `900 62px ${K.FONT}`; x.textBaseline = 'middle'; x.fillText(sn[0], 0, 4); x.restore(); x.textBaseline = 'alphabetic';
    // 뜻
    x.fillStyle = '#C8102E'; x.font = `800 60px ${K.FONT}`; let y = K.para(x, `“${gv.en}”`, W / 2, 1120, W - 240, 76);
    x.fillStyle = '#4E3E31'; x.font = `600 40px ${K.FONT}`;
    if (gv.hj) for (const h of gv.hj) { x.fillText(`${h[0]}  ${h[1]} — ${h[2]}`, W / 2, y + 30); y += 60; }
    else { x.fillText('A native Korean word', W / 2, y + 30); y += 60; }
    if (gv.hj) { x.fillStyle = '#B5A68F'; x.font = `500 30px ${K.FONT}`; x.fillText('Hanja shown is one common choice for this name', W / 2, y + 40); }
    x.fillStyle = '#8C7A66'; x.font = `600 38px ${K.FONT}`; x.fillText("What's yours? 🥔🧀", W / 2, 1640);
    x.fillStyle = '#C4551C'; x.font = `800 44px ${K.FONT}`; x.fillText('everykoreans.com/my-korean-name', W / 2, 1710);
    return K.blob(c);
  }
  async function draw() { const me = cur, b = await card(); if (cur !== me || !b) return; if (url) URL.revokeObjectURL(url); $('mkImg').src = url = URL.createObjectURL(b); }
  nm.addEventListener('input', () => { bump = 0; paint(); });
  bd.addEventListener('input', () => { bump = 0; paint(); });
  $('mkG').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; g = b.dataset.g; bump = 0;
    $('mkG').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); paint(); });
  $('mkAgain').addEventListener('click', () => { bump++; paint(); });
  $('mkSave').addEventListener('click', async () => { if (cur) K.save(await card(), 'my-korean-name', `If I were Korean, my name would be ${cur.sn[0] + cur.gv.ko}! everykoreans.com/my-korean-name`, 'mkAfter'); });
  $('mkSheet').addEventListener('click', () => { if (cur) location.href = `/hangul-worksheet/?ko=${encodeURIComponent(cur.sn[0] + cur.gv.ko)}`; });
  const q = new URLSearchParams(location.search).get('name'); if (q) { nm.value = q.slice(0, 40); paint(); }
})();
