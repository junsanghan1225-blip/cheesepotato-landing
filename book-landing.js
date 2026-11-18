/* 책 독자 공부방(/book/<책 id>/ — tools/build-book-landing.mjs) — 게임처럼(운영자 2026-11-18 「너무 뻔해 · 요즘 스타일로 게임이나 다른 스타일로」).
   문: 책 Reader bonus 쪽 독자 코드 → sha256 지문을 data-lock 과 비교(?code= 로 와도 열림, 연 기기는 기억).
   지도: 단원 37개가 구불구불한 길의 정거장. 단원마다 별 0~3, 다음 정거장이 깜박인다. XP · 연속 공부일.
   판(단원 하나): 책 내용으로 문제를 만들어 한 장씩 — 학습 효과가 있는 것만:
     · 글자 조각 맞추기(책 연습 정답을 음절 조각 + 헷갈리는 조각으로) · 듣고 뜻 고르기 · 뜻 보고 한국어 고르기(단원 낱말)
     · 책 보기 문제(미니 테스트) · 빠른 짝 맞추기(시계) · 긴 답은 직접 쓰기
     맞히면 콤보 · XP, 틀리면 아래에서 정답 패널이 올라오고 그 문제는 판 끝 「다시 도전」에 다시 나온다(다 맞힐 때까지).
     미니 테스트 단원은 「보스 판」 — 시계가 돈다.
   기록은 이 기기의 localStorage 에만(blk 열쇠 · blg 별 · XP · 연속일). 서버로 보내지 않는다. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = $('#bl'); if (!M) return;
  const BOOK = M.dataset.book, LOCK = M.dataset.lock;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 막힘 */ } };
  const ev = (name, extra) => { try { (window.cpGa || ((n, p) => (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: n }, p))))(name, Object.assign({ book_id: BOOK }, extra || {})); } catch (e) {} };
  const tts = (t) => { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(t).replace(/\s*\([^)]*\)/g, '')); u.lang = 'ko-KR'; u.rate = 0.85; const v = speechSynthesis.getVoices().find((x) => /^ko/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {} };
  const norm = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[\s.,!?~·'"“”‘’()\[\]→]/g, '');
  const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuf(a).slice(0, n);
  /* 짧은 소리(파일 없이) — 맞음 · 틀림 · 판 끝 */
  let AC = null; const beep = (kind) => { if (get('blmute', false)) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime; const tone = (f, at, d) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(0.18, t + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + at + d); o.connect(g).connect(AC.destination); o.start(t + at); o.stop(t + at + d + 0.02); };
    if (kind === 'ok') { tone(660, 0, 0.12); tone(990, 0.09, 0.16); } else if (kind === 'no') { tone(220, 0, 0.22); } else { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22)); } } catch (e) {} };
  const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  /* 위 읽은 만큼 줄 · 입체 책 */
  const prog = $('.bl-prog');
  addEventListener('scroll', () => { if (prog) { const h = document.documentElement; prog.style.width = Math.min(100, (h.scrollTop / Math.max(1, h.scrollHeight - innerHeight)) * 100) + '%'; } }, { passive: true });
  const bk = $('#bk3d');
  if (bk && !RM) addEventListener('pointermove', (e) => { bk.style.transform = `rotateY(${-24 + (e.clientX / innerWidth - 0.5) * 22}deg) rotateX(${6 - (e.clientY / innerHeight - 0.5) * 10}deg)`; }, { passive: true });

  /* ── 문 ── */
  const sha = async (s) => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); };
  const tryCode = async (raw) => { if (!window.crypto?.subtle) return false; return (await sha(String(raw).toUpperCase().replace(/[^A-Z0-9]/g, ''))) === LOCK; };
  let D = null;
  const open = async () => {
    set('blk:' + BOOK, LOCK);
    $('#gate').hidden = true; const app = $('#app'); app.hidden = false; app.classList.add('bl-app');
    app.innerHTML = '<p class="bl-empty">Loading · 불러오는 중…</p>';
    try { D = await (await fetch(M.dataset.data, { cache: 'no-cache' })).json(); } catch (e) { app.innerHTML = '<p class="bl-msg no">Could not load. Check your connection and reload. · 불러오지 못했어요. 인터넷을 확인하고 새로고침해 주세요.</p>'; return; }
    route(); addEventListener('hashchange', route);
  };
  $('#gateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const msg = $('#gateMsg');
    if (await tryCode($('#gateIn').value.trim())) { ev('book_room_open', { cp_area: 'code' }); open(); }
    else { msg.className = 'bl-msg no'; msg.textContent = 'That code does not match this book. Check the Reader bonus page. · 이 책의 코드가 아니에요. 책 뒤쪽 Reader bonus 쪽을 확인해 주세요.'; ev('book_room_wrong'); }
  });
  (async () => {
    const q = new URLSearchParams(location.search).get('code');
    if (get('blk:' + BOOK, '') === LOCK) open();
    else if (q && await tryCode(q)) { ev('book_room_open', { cp_area: 'link' }); history.replaceState(null, '', location.pathname + location.hash); open(); }
  })();

  /* ── 기록: 별 · XP · 연속일 ── */
  const G = () => Object.assign({ stars: {}, xp: 0, days: [], daily: {} }, get('blg:' + BOOK, {}));
  const GOAL = 50;   // 하루 목표 XP — 짧게 매일(약 5분)
  /* 간격 반복: 틀린 문제는 1 · 3 · 7 · 21일 뒤 다시. blr:<책> = { 열쇠: { q, due, step } } */
  const STEPS = [1, 3, 7, 21];
  const R = () => get('blr:' + BOOK, {}), saveR = (r) => set('blr:' + BOOK, r);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
  const rkey = (q) => (q.unit || '') + '|' + q.kind + '|' + (q.prompt || q.say || '');
  const schedule = (q, ok) => { const r = R(), k = rkey(q), it = r[k];
    if (!ok) r[k] = { q, due: addDays(STEPS[0]), step: 0 };
    else if (it) { if (it.step + 1 >= STEPS.length) delete r[k]; else { it.step++; it.due = addDays(STEPS[it.step]); } }
    saveR(r); };
  const dueList = () => Object.values(R()).filter((x) => x.due <= ymd(new Date()));
  const saveG = (f) => { const g = G(); f(g); set('blg:' + BOOK, g); };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const streak = () => { const s = new Set(G().days); let n = 0; const c = new Date(); if (!s.has(ymd(c))) c.setDate(c.getDate() - 1); while (s.has(ymd(c))) { n++; c.setDate(c.getDate() - 1); } return n; };
  const units = () => D.parts.flatMap((p) => p.units);
  const isBoss = (u) => /^ft-|mini test|미니 테스트/i.test(u.id + ' ' + u.title.en + ' ' + u.title.ko);

  const route = () => {
    const h = location.hash.slice(1).split('/'); const app = $('#app');
    if (h[0] === 'play') { const u = units().find((x) => x.id === h[1]); if (u) { play(app, u); return; } }
    if (h[0] === 'review') { const list = dueList(); if (list.length) { play(app, { id: '_review', no: 0, title: { en: "Today's review", ko: '오늘의 복습' }, secs: [], deck: [], _q: list.map((x) => x.q) }); return; } }
    mapView(app);
  };

  /* ── 지도 ── */
  function mapView(app) {
    document.body.classList.remove('bl-playing');
    const g = G(), all = units(), next = all.find((u) => !g.stars[u.id]) || all[0];
    const total = all.reduce((a, u) => a + (g.stars[u.id] || 0), 0);
    let n = 0;
    const today = g.daily[ymd(new Date())] || 0, ring = Math.min(1, today / GOAL), due = dueList().length;
    app.innerHTML = `<div class="bl-hud"><div class="bl-ring" title="Daily goal · 하루 목표"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.5" class="bg"/><circle cx="18" cy="18" r="15.5" class="fg" stroke-dasharray="${(ring * 97.4).toFixed(1)} 97.4"/></svg><b>${today}<small>/${GOAL}</small></b><span>today · 오늘 XP</span></div><div><b>${g.xp}</b><span>XP</span></div><div><b>${streak()}</b><span>day streak · 연속</span></div><div><b>${total}<small>/${all.length * 3}</small></b><span>stars · 별</span></div><button class="bl-btn sm" type="button" id="mute" aria-pressed="${get('blmute', false)}">${get('blmute', false) ? 'Sound off · 소리 끔' : 'Sound on · 소리 켬'}</button></div>
      <div class="bl-go"><a class="bl-btn main big" href="#play/${esc(next.id)}">Play · ${String(next.no).padStart(2, '0')} ${esc(next.title.ko)} →</a>${due ? `<a class="bl-btn big rev" href="#review">Today's review · 오늘의 복습 <b>${due}</b></a>` : '<span class="bl-note">No review due today · 오늘 복습할 것 없음</span>'}</div>
      ${D.parts.map((p, pi) => `<div class="bl-zone"><div class="bl-zone-h"><i>PART ${pi + 1}</i><b>${esc(p.title.ko)}</b><span>${esc(p.title.en)}</span></div><ol class="bl-path">${p.units.map((u) => { const st = g.stars[u.id] || 0, k = n++; const pos = [0, 1, 2, 1][k % 4];
        return `<li class="pos${pos}${u === next ? ' now' : ''}${st ? ' done' : ''}${isBoss(u) ? ' boss' : ''}"><a href="#play/${esc(u.id)}" aria-label="Unit ${u.no} ${esc(u.title.en)}"><span class="node">${isBoss(u) ? 'BOSS' : String(u.no).padStart(2, '0')}</span><span class="lbl"><b>${esc(u.title.ko)}</b><small>~${Math.max(2, Math.min(6, Math.round(((u.secs.filter((s) => s.type === 'practice').reduce((a, s) => a + s.items.length, 0)) + Math.min(6, u.deck.length)) * 0.25)))} min</small><span class="st" aria-label="${st} stars">${'<i class="on"></i>'.repeat(st)}${'<i></i>'.repeat(3 - st)}</span></span></a></li>`; }).join('')}</ol></div>`).join('')}`;
    $('#mute', app).addEventListener('click', (e) => { const m = !get('blmute', false); set('blmute', m); e.currentTarget.setAttribute('aria-pressed', m); e.currentTarget.textContent = m ? 'Sound off · 소리 끔' : 'Sound on · 소리 켬'; });
    const now = $('.bl-path li.now', app); if (now && !RM && location.hash === '') setTimeout(() => now.scrollIntoView({ block: 'center', behavior: 'smooth' }), 200);
  }

  /* ── 판 만들기: 단원 내용 → 문제 줄 ── */
  const parseA = (a) => { a = String(a || ''); const m = /^\(([a-e])\)\s*([^.]*)(?:\.\s*(.*))?$/.exec(a); if (m) return { ok: [m[2].trim()], show: m[2].trim(), why: m[3] || '', letter: m[1] }; const ps = a.split(/\s*\/\s*/).map((x) => x.trim()).filter(Boolean); return { ok: ps.length ? ps : [a], show: a, why: '' }; };
  const opts = (q) => { const r = []; const re = /\(([a-e])\)\s*([^()]+?)(?=\s*\(|$)/g; let m; while ((m = re.exec(q))) r.push([m[1], m[2].trim()]); return r.length >= 2 ? r : null; };
  const qHint = (q) => { const m = /\(([^()]*)\)\s*$/.exec(q); return m && !/^[a-e]$/.test(m[1].trim()) ? m[1] : ''; };
  const syl = (s) => [...String(s).replace(/\s+/g, ' ')].filter((c) => c !== ' ');
  function buildRound(u) {
    const Q = [];
    const pool = []; u.secs.forEach((s) => { if (s.type === 'practice') s.items.forEach((it) => pool.push(...parseA(it.a).ok)); });
    const allSyl = [...new Set(pool.flatMap(syl).concat(u.deck.flatMap((d) => syl(d.ko))))].filter((c) => /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(c));
    u.secs.forEach((s) => {
      if (s.type === 'practice') s.items.forEach((it) => {
        const a = parseA(it.a), op = opts(it.q), stem = op ? it.q.replace(/\s*\([a-e]\)[\s\S]*$/, '') : it.q;
        if (op) Q.push({ kind: 'choice', prompt: stem, hint: qHint(it.q) || s.title.en, options: op.map(([l, t]) => ({ t, ok: l === a.letter })), answer: a.show, why: a.why });
        else { const target = a.ok[0]; const ch = syl(target);
          if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(target) && ch.length >= 1 && ch.length <= 7 && !/[A-Za-z]/.test(target)) Q.push({ kind: 'tiles', prompt: it.q, hint: s.title.en, answer: a.show, accept: a.ok, tiles: shuf(ch.concat(pick(allSyl.filter((c) => !ch.includes(c)), Math.min(4, Math.max(2, 8 - ch.length))))) });
          else Q.push({ kind: 'type', prompt: it.q, hint: s.title.en, answer: a.show, accept: a.ok }); }
      });
      if (s.type === 'matchlines' && (s.pairs || []).length >= 3) Q.push({ kind: 'match', prompt: s.title.en, hint: s.title.ko, pairs: s.pairs.slice(0, 6) });
      if (s.type === 'dialog' && (s.lines || []).length >= 2) { const L = s.lines; const i = 1 + Math.floor(Math.random() * (L.length - 1)); const others = L.filter((_, k) => k !== i).map((l) => l.ko); Q.push({ kind: 'choice', prompt: `${L[i - 1].who}: ${L[i - 1].ko}`, hint: 'What comes next? · 다음 말은?', say: L[i - 1].ko, options: shuf([{ t: L[i].ko, ok: true }, ...pick(others, 2).map((t) => ({ t, ok: false }))]), answer: L[i].ko }); }
    });
    /* 단원 낱말 — 듣고 뜻 · 뜻 보고 한국어 */
    const deck = u.deck.filter((d) => d.ko.length <= 12);
    pick(deck, Math.min(6, deck.length)).forEach((d, k) => {
      const wrong = pick(deck.filter((x) => x !== d), 3);
      if (wrong.length < 2) return;
      if (k % 2 === 0) Q.push({ kind: 'listen', prompt: 'Listen and choose the meaning', hint: '듣고 뜻을 골라요', say: d.ko, options: shuf([{ t: d.en, ok: true }, ...wrong.map((w) => ({ t: w.en, ok: false }))]), answer: `${d.ko} = ${d.en}` });
      else Q.push({ kind: 'choice', prompt: d.en, hint: 'Choose the Korean · 한국어를 골라요', options: shuf([{ t: d.ko, ok: true }, ...wrong.map((w) => ({ t: w.ko, ok: false }))]), answer: d.ko, sayAfter: d.ko });
    });
    /* 말하기: 브라우저가 한국어 음성 인식을 지원하면 낱말 두 개를 소리 내어 말하기(크롬 등). 안 되면 넣지 않는다 */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) pick(deck.filter((d) => d.ko.length >= 2 && d.ko.length <= 8 && /[가-힣]/.test(d.ko)), 2).forEach((d) => Q.push({ kind: 'speak', prompt: d.ko, hint: 'Say it aloud · 소리 내어 말해요', say: d.ko, answer: `${d.ko} (${d.en})`, mean: d.en }));
    const MAX = isBoss(u) ? 20 : 14;
    const book = Q.filter((q) => q.kind !== 'listen' && !(q.kind === 'choice' && q.sayAfter)), words = Q.filter((q) => !book.includes(q));
    return shuf(book.slice(0, MAX - Math.min(words.length, 5)).concat(words.slice(0, 5))).slice(0, MAX);
  }

  /* ── 판 ── */
  function play(app, u) {
    document.body.classList.add('bl-playing');
    let Q = u._q ? shuf(u._q).slice(0, 20) : buildRound(u).map((q) => Object.assign(q, { unit: u.id }));
    if (!Q.length) { app.innerHTML = `<div class="bl-stage"><p class="bl-empty">This unit is done in the book (plans and writing). · 이 단원은 책에서 해요(계획 · 쓰기).</p><a class="bl-btn main" href="#">Back to the map · 지도로</a></div>`; saveG((g) => { g.stars[u.id] = Math.max(g.stars[u.id] || 0, 1); }); return; }
    const total = Q.length, boss = isBoss(u); let i = 0, right = 0, combo = 0, best = 0, xp = 0, firstTry = new Set(), retry = [], t0 = Date.now(), timer = null, left = boss ? 30 * total : 0;
    app.innerHTML = `<div class="bl-stage${boss ? ' is-boss' : ''}"><div class="bl-top"><a class="bl-x" href="#" aria-label="Quit · 그만하기">✕</a><div class="bl-pbar"><span></span></div><span class="bl-combo" aria-live="polite"></span>${boss ? '<span class="bl-clock">--:--</span>' : ''}</div><div class="bl-q" id="card"></div><div class="bl-panel" id="panel" aria-live="assertive"></div></div>`;
    const bar = $('.bl-pbar span', app), card = $('#card', app), panel = $('#panel', app), cmb = $('.bl-combo', app);
    if (boss) { const clk = $('.bl-clock', app); timer = setInterval(() => { left--; clk.textContent = `${String(Math.max(0, Math.floor(left / 60))).padStart(2, '0')}:${String(Math.max(0, left % 60)).padStart(2, '0')}`; clk.classList.toggle('low', left <= 30); if (left <= 0) { clearInterval(timer); finish(true); } }, 1000); }
    addEventListener('hashchange', () => clearInterval(timer), { once: true });
    const step = () => { bar.style.width = `${Math.round((i / (total + retry.length)) * 100)}%`; };
    const answer = (ok, q, shown) => {
      if (!firstTry.has(q) || !ok) schedule(q, ok && !firstTry.has(q));
      if (ok) { right += firstTry.has(q) ? 0 : 1; combo++; best = Math.max(best, combo); xp += 10 + Math.min(combo - 1, 5) * 2; beep('ok'); buzz(15); }
      else { combo = 0; if (!retry.includes(q) && !firstTry.has(q)) retry.push(q); firstTry.add(q); beep('no'); buzz([30, 40, 30]); }
      cmb.textContent = combo >= 2 ? `${combo} COMBO` : ''; cmb.classList.toggle('hot', combo >= 2); if (combo >= 2 && !RM) { cmb.classList.remove('pop'); void cmb.offsetWidth; cmb.classList.add('pop'); }
      panel.className = 'bl-panel show ' + (ok ? 'ok' : 'no');
      panel.innerHTML = `<div class="in2"><div><b>${ok ? (combo >= 3 ? 'Great! · 잘했어요!' : 'Correct · 맞았어요') : 'Not quite · 아쉬워요'}</b>${ok ? '' : `<span>Answer · 정답: <strong lang="ko">${esc(shown)}</strong></span>`}${q.why ? `<span>${esc(q.why)}</span>` : ''}${!ok ? `<span class="sm">${firstTry.has(q) && !retry.includes(q) ? 'It will come back in your review tomorrow. · 내일 복습에 다시 나와요.' : 'You will see it again at the end. · 판 끝에 다시 나와요.'}</span>` : ''}</div><button class="bl-btn main big" type="button" id="nx">Continue · 계속</button></div>`;
      if (q.sayAfter && ok) tts(q.sayAfter);
      const nx = $('#nx', panel); nx.focus(); nx.addEventListener('click', () => { panel.className = 'bl-panel'; i++; next(); });
    };
    const next = () => {
      step();
      if (i >= Q.length) { if (retry.length) { Q = Q.concat(retry.splice(0)); card.insertAdjacentHTML('afterbegin', ''); } else { finish(false); return; } }
      const q = Q[i]; const again = firstTry.has(q);
      const top = `<div class="bl-kind">${again ? '<i class="re">TRY AGAIN · 다시 도전</i>' : ''}<span>${esc(q.hint || '')}</span></div>`;
      if (!RM) { card.classList.remove('in'); void card.offsetWidth; card.classList.add('in'); }
      if (q.kind === 'choice' || q.kind === 'listen') {
        card.innerHTML = `${top}<h3 lang="ko">${q.kind === 'listen' ? '<button class="bl-say" type="button" aria-label="Play again · 다시 듣기">▶</button>' : esc(q.prompt)}</h3>${q.say && q.kind !== 'listen' ? '<button class="bl-btn sm" type="button" data-say>Listen · 듣기</button>' : ''}<div class="bl-opts">${q.options.map((o, k) => `<button type="button" data-k="${k}" lang="ko"><i>${k + 1}</i>${esc(o.t)}</button>`).join('')}</div>`;
        if (q.say) { tts(q.say); $('.bl-say, [data-say]', card)?.addEventListener('click', () => tts(q.say)); }
        const btns = $$('.bl-opts button', card);
        btns.forEach((b) => b.addEventListener('click', () => { if (card.dataset.done) return; card.dataset.done = 1; const o = q.options[+b.dataset.k]; btns.forEach((x) => { x.disabled = true; if (q.options[+x.dataset.k].ok) x.classList.add('ok'); }); if (!o.ok) b.classList.add('no'); answer(o.ok, q, q.answer); }));
      } else if (q.kind === 'tiles') {
        card.innerHTML = `${top}<h3 lang="ko">${esc(q.prompt)}</h3><div class="bl-slot" aria-label="Your answer · 내 답" lang="ko"></div><div class="bl-tiles">${q.tiles.map((t, k) => `<button type="button" data-k="${k}" lang="ko">${esc(t)}</button>`).join('')}</div><div class="bl-acts"><button class="bl-btn" type="button" data-a="clr">Clear · 지우기</button><button class="bl-btn main" type="button" data-a="chk" disabled>Check · 확인</button></div>`;
        const slot = $('.bl-slot', card), chk = $('[data-a="chk"]', card); let built = [];
        const draw = () => { slot.innerHTML = built.map((k, n) => `<button type="button" data-n="${n}">${esc(q.tiles[k])}</button>`).join(''); chk.disabled = !built.length; $$('.bl-tiles button', card).forEach((b) => { b.classList.toggle('used', built.includes(+b.dataset.k)); }); };
        $$('.bl-tiles button', card).forEach((b) => b.addEventListener('click', () => { if (card.dataset.done || built.includes(+b.dataset.k)) return; built.push(+b.dataset.k); draw(); }));
        slot.addEventListener('click', (e) => { const b = e.target.closest('[data-n]'); if (!b || card.dataset.done) return; built.splice(+b.dataset.n, 1); draw(); });
        $('[data-a="clr"]', card).addEventListener('click', () => { if (!card.dataset.done) { built = []; draw(); } });
        chk.addEventListener('click', () => { if (card.dataset.done) return; card.dataset.done = 1; const v = built.map((k) => q.tiles[k]).join(''); const ok = q.accept.some((a) => norm(a) === norm(v)); slot.classList.add(ok ? 'ok' : 'no'); if (ok) tts(v); answer(ok, q, q.answer); });
      } else if (q.kind === 'type') {
        card.innerHTML = `${top}<h3 lang="ko">${esc(q.prompt)}</h3><form class="bl-row"><input autocomplete="off" lang="ko" aria-label="Your answer · 내 답" placeholder="Type your answer · 답을 써요"><button class="bl-btn main" type="submit">Check · 확인</button></form>`;
        const inp = $('input', card); inp.focus({ preventScroll: true });
        $('form', card).addEventListener('submit', (e) => { e.preventDefault(); if (card.dataset.done || !inp.value.trim()) return; card.dataset.done = 1; inp.readOnly = true; const ok = q.accept.some((a) => norm(a) === norm(inp.value)); answer(ok, q, q.answer); });
      } else if (q.kind === 'speak') {
        card.innerHTML = `${top}<h3 lang="ko">${esc(q.prompt)}</h3><p class="bl-sub">${esc(q.mean || '')}</p><div class="bl-acts"><button class="bl-btn" type="button" data-a="hear">Listen first · 먼저 듣기</button><button class="bl-btn main big" type="button" data-a="mic">Hold on — speak now · 말하기</button><button class="bl-btn" type="button" data-a="skip">Can't talk now · 지금은 못 해요</button></div><p class="bl-heard" aria-live="polite"></p>`;
        $('[data-a="hear"]', card).addEventListener('click', () => tts(q.say));
        $('[data-a="skip"]', card).addEventListener('click', () => { if (card.dataset.done) return; card.dataset.done = 1; panel.className = 'bl-panel'; i++; next(); });
        $('[data-a="mic"]', card).addEventListener('click', (e) => {
          if (card.dataset.done) return; const SRc = window.SpeechRecognition || window.webkitSpeechRecognition; const r = new SRc(); r.lang = 'ko-KR'; r.maxAlternatives = 5; r.interimResults = false;
          const btn = e.currentTarget; btn.textContent = 'Listening… · 듣는 중'; btn.disabled = true; const heard = $('.bl-heard', card);
          r.onresult = (x) => { const alts = [...x.results[0]].map((a) => a.transcript); const ok = alts.some((t) => norm(t).includes(norm(q.prompt))); heard.textContent = `Heard · 들은 말: ${alts[0]}`; card.dataset.done = 1; answer(ok, q, q.answer); };
          r.onerror = () => { btn.disabled = false; btn.textContent = 'Try again · 다시 말하기'; heard.textContent = 'Could not hear you — check the microphone. · 소리를 못 들었어요. 마이크를 확인해 주세요.'; };
          r.onend = () => { if (!card.dataset.done) { btn.disabled = false; btn.textContent = 'Try again · 다시 말하기'; } };
          try { r.start(); } catch (err) { r.onerror(); }
        });
      } else if (q.kind === 'match') {
        const P = q.pairs, R = shuf(P.map((_, k) => k)); let sel = null, got = 0, miss = 0, mt = Date.now();
        card.innerHTML = `${top}<h3>Speed match · 빠른 짝 맞추기</h3><p class="bl-sub">${esc(q.prompt)}</p><div class="bl-match"><div>${P.map((p, k) => `<button type="button" data-l="${k}" lang="ko">${esc(p[0])}</button>`).join('')}</div><div>${R.map((k) => `<button type="button" data-r="${k}" lang="ko">${esc(P[k][1])}</button>`).join('')}</div></div>`;
        card.addEventListener('click', (e) => { const l = e.target.closest('[data-l]'), r = e.target.closest('[data-r]'); if (card.dataset.done) return;
          if (l && !l.classList.contains('ok')) { $$('[data-l]', card).forEach((x) => x.classList.remove('sel')); l.classList.add('sel'); sel = l; }
          if (r && sel && !r.classList.contains('ok')) { if (r.dataset.r === sel.dataset.l) { r.classList.add('ok'); sel.classList.add('ok'); sel.classList.remove('sel'); sel = null; got++; beep('ok'); tts(r.textContent); if (got === P.length) { card.dataset.done = 1; const sec = Math.round((Date.now() - mt) / 1000); q.why = `${sec}s · ${miss} miss${miss === 1 ? '' : 'es'}`; answer(miss <= 1, q, P.map((p) => `${p[0]} – ${p[1]}`).join(' · ')); } } else { miss++; r.classList.add('no'); beep('no'); setTimeout(() => r.classList.remove('no'), 500); } } });
      }
      delete card.dataset.done;
    };
    const finish = (timeUp) => {
      clearInterval(timer); bar.style.width = '100%';
      const acc = right / total, stars = timeUp ? (acc >= 0.5 ? 1 : 0) : acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1, sec = Math.round((Date.now() - t0) / 1000);
      const bonus = stars * 10; xp += bonus;
      saveG((g) => { g.xp += xp; const td = ymd(new Date()); g.daily[td] = (g.daily[td] || 0) + xp; if (u.id !== '_review') g.stars[u.id] = Math.max(g.stars[u.id] || 0, stars); const d = ymd(new Date()); if (g.days[g.days.length - 1] !== d) g.days.push(d); g.days = g.days.slice(-400); });
      beep('win'); ev('book_room_clear', { cp_q: String(u.no), cp_area: `${stars}★ ${Math.round(acc * 100)}%` });
      const all = units(), nu = all[all.indexOf(u) + 1];
      panel.className = 'bl-panel';
      card.innerHTML = `<div class="bl-win"><div class="kick">${timeUp ? "TIME'S UP · 시간 끝" : 'UNIT CLEAR · 단원 끝'}</div><div class="bl-stars" aria-label="${stars} stars">${[1, 2, 3].map((s) => `<i class="${s <= stars ? 'on' : ''}" style="animation-delay:${s * 0.18}s"></i>`).join('')}</div>
        <ul class="bl-res"><li><b>${Math.round(acc * 100)}%</b>first-try · 한 번에 맞힘</li><li><b>+${xp}</b>XP</li><li><b>${best}</b>best combo · 최고 콤보</li><li><b>${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}</b>time · 시간</li></ul>
        <div class="bl-acts">${nu ? `<a class="bl-btn main big" href="#play/${esc(nu.id)}">Next · ${String(nu.no).padStart(2, '0')} ${esc(nu.title.ko)} →</a>` : ''}<button class="bl-btn" type="button" data-again>Play again · 다시 하기</button><a class="bl-btn" href="#">Map · 지도</a></div></div>`;
    };
    app.addEventListener('click', (e) => { if (e.target.closest('[data-again]')) play(app, u); });
    next();
  }
})();
