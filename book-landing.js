/* 책 독자 학습 쪽(/book/<책 id>/ — tools/build-book-landing.mjs)의 문 · 공부 화면.
   문: 책의 Reader bonus 쪽 독자 코드를 넣으면 sha256 지문을 쪽의 data-lock 과 견줘 연다(?code= 로 와도 연다). 연 기기는 기억한다.
   공부(책 순서 그대로, 운영자 2026-11-18 「책에 있는 문제도 풀고 정답도 체크하고 단어 학습부터 전부」):
   · 연습(practice) — 써서 「확인」 → 책 정답과 비교. 보기가 있는 문항은 누르는 단추로. 정답 목록과 다르게 쓴 맞는 답은 「맞게 썼어요」로 스스로 인정.
   · 표 — 칸 하나를 가리고 말해 보기(누르면 보임) · 글자 카드 · 핵심 표현 — 소리 듣기 · 짝 잇기 — 누르고 누르기 · 대화 — 줄마다 듣기 · 영어 숨기기 · 내 말로 대답 — 예시와 견주기
   · 낱말 카드 — 단원 표 · 카드 · 핵심 표현에서 모은 덱, 「알아요 / 다시」(다시는 다 알 때까지 돌아옴)
   · 틀린 문제 — 틀린 연습 문항만 모아 다시
   기록은 이 기기의 localStorage 에만(blk:<책> 열쇠 · bls:<책> 진행 · blm:<책> 틀린 문제). 서버로 보내지 않는다. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = $('#bl'); if (!M) return;
  const BOOK = M.dataset.book, LOCK = M.dataset.lock;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 막힘 */ } };
  const ev = (name, extra) => { try { (window.cpGa || ((n, p) => (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: n }, p))))(name, Object.assign({ book_id: BOOK }, extra || {})); } catch (e) {} };
  const tts = (t) => { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(t).replace(/\s*\([^)]*\)/g, '')); u.lang = 'ko-KR'; u.rate = 0.88; const v = speechSynthesis.getVoices().find((x) => /^ko/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {} };
  const bi = (o) => (o && typeof o === 'object' ? `${esc(o.en)}<small>${esc(o.ko)}</small>` : esc(o));
  const norm = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[\s.,!?~·'"“”‘’()\[\]→]/g, '');

  /* 위 읽은 만큼 줄 · 입체 책 */
  const prog = $('.bl-prog');
  addEventListener('scroll', () => { if (prog) { const h = document.documentElement; prog.style.width = Math.min(100, (h.scrollTop / Math.max(1, h.scrollHeight - innerHeight)) * 100) + '%'; } }, { passive: true });
  const bk = $('#bk3d');
  if (bk && !RM) addEventListener('pointermove', (e) => { bk.style.transform = `rotateY(${-24 + (e.clientX / innerWidth - 0.5) * 22}deg) rotateX(${6 - (e.clientY / innerHeight - 0.5) * 10}deg)`; }, { passive: true });

  /* ── 문 ── */
  const sha = async (s) => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); };
  const tryCode = async (raw) => { if (!window.crypto?.subtle) return false; const h = await sha(String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '')); return h === LOCK; };
  let D = null;
  const open = async () => {
    set('blk:' + BOOK, LOCK);
    $('#gate').hidden = true; const app = $('#app'); app.hidden = false; app.classList.add('bl-app');
    app.innerHTML = '<p class="bl-empty">Loading · 불러오는 중…</p>';
    try { D = await (await fetch(M.dataset.data, { cache: 'no-cache' })).json(); } catch (e) { app.innerHTML = '<p class="bl-msg no">Could not load. Check your connection and reload. · 불러오지 못했어요. 인터넷을 확인하고 새로고침해 주세요.</p>'; return; }
    route(); addEventListener('hashchange', route);
  };
  $('#gateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const v = $('#gateIn').value.trim(); const msg = $('#gateMsg');
    if (await tryCode(v)) { ev('book_room_open', { cp_area: 'code' }); open(); }
    else { msg.className = 'bl-msg no'; msg.textContent = 'That code does not match this book. Check the Reader bonus page. · 이 책의 코드가 아니에요. 책 뒤쪽 Reader bonus 쪽을 확인해 주세요.'; ev('book_room_wrong'); }
  });
  (async () => {
    const q = new URLSearchParams(location.search).get('code');
    if (get('blk:' + BOOK, '') === LOCK) open();
    else if (q && await tryCode(q)) { ev('book_room_open', { cp_area: 'link' }); history.replaceState(null, '', location.pathname + location.hash); open(); }
  })();

  /* ── 진행 · 틀린 문제 ── */
  const S = () => get('bls:' + BOOK, {}), saveS = (uid, k, v) => { const s = S(); s[uid] = Object.assign(s[uid] || {}, { [k]: v }); set('bls:' + BOOK, s); };
  const MISS = () => get('blm:' + BOOK, {}), miss = (key, item, on) => { const m = MISS(); if (on) m[key] = item; else delete m[key]; set('blm:' + BOOK, m); };
  const units = () => D.parts.flatMap((p) => p.units);
  const doable = (u) => u.secs.filter((s) => ['practice', 'matchlines'].includes(s.type)).length;
  const pct = (u) => { const n = doable(u); if (!n) return (S()[u.id]?.seen ? 100 : 0); const d = Object.keys(S()[u.id] || {}).filter((k) => k.startsWith('s')).length; return Math.round(Math.min(1, d / n) * 100); };

  /* ── 화면 길: #  /  #u/<단원>  /  #u/<단원>/words  /  #missed ── */
  const route = () => {
    const h = location.hash.slice(1).split('/'); const app = $('#app');
    if (h[0] === 'u') { const u = units().find((x) => x.id === h[1]); if (u) { unitView(app, u, h[2] === 'words'); return; } }
    if (h[0] === 'missed') { missedView(app); return; }
    homeView(app);
  };
  const go = (h) => { location.hash = h; scrollTo({ top: $('#app').offsetTop - 70, behavior: RM ? 'auto' : 'smooth' }); };

  function homeView(app) {
    const s = S(), last = get('bll:' + BOOK, ''), lu = units().find((u) => u.id === last), nm = Object.keys(MISS()).length;
    const all = units(), done = all.filter((u) => pct(u) >= 100).length;
    app.innerHTML = `<h2>Your study room<span class="ko">내 공부방 · ${done} / ${all.length} 단원 끝</span></h2>
      <div class="bl-bar">${lu ? `<a class="bl-btn main" href="#u/${esc(lu.id)}">Continue · 이어서: ${String(lu.no).padStart(2, '0')} ${esc(lu.title.ko)} →</a>` : `<a class="bl-btn main" href="#u/${esc(all[0].id)}">Start · 1단원부터 →</a>`}
      <a class="bl-btn" href="#missed">Missed · 틀린 문제 ${nm}</a></div>
      ${D.parts.map((p, i) => `<div class="bl-part"><h3>Part ${i + 1} · ${esc(p.title.en)} · ${esc(p.title.ko)}</h3><ul class="bl-units">${p.units.map((u) => { const v = pct(u); return `<li><a href="#u/${esc(u.id)}"><i>${String(u.no).padStart(2, '0')}</i><span><b>${esc(u.title.ko)}</b><small>${esc(u.title.en)} · ${u.deck.length} words · 낱말</small></span><span class="bl-meterbar" title="${v}%"><span style="width:${v}%"></span></span></a></li>`; }).join('')}</ul></div>`).join('')}`;
    void s;
  }

  function unitView(app, u, words) {
    set('bll:' + BOOK, u.id); saveS(u.id, 'seen', 1);
    const all = units(), i = all.indexOf(u), prev = all[i - 1], next = all[i + 1];
    app.innerHTML = `<div class="bl-unit-hd"><div><div class="kick">Unit ${String(u.no).padStart(2, '0')} · 단원</div><h2>${esc(u.title.ko)}<span class="ko">${esc(u.title.en)}</span></h2></div><a class="bl-btn sm" href="#">All units · 단원 목록</a></div>
      <div class="bl-tabs" role="tablist"><button role="tab" aria-selected="${!words}" data-t="ex">Exercises · 연습</button><button role="tab" aria-selected="${words}" data-t="words">Word cards · 낱말 카드 ${u.deck.length}</button></div>
      <div id="ub"></div>
      <div class="bl-bar" style="margin-top:30px;justify-content:space-between">${prev ? `<a class="bl-btn" href="#u/${esc(prev.id)}">← ${String(prev.no).padStart(2, '0')} ${esc(prev.title.ko)}</a>` : '<span></span>'}${next ? `<a class="bl-btn main" href="#u/${esc(next.id)}">${String(next.no).padStart(2, '0')} ${esc(next.title.ko)} →</a>` : ''}</div>`;
    $$('.bl-tabs button', app).forEach((b) => b.addEventListener('click', () => { location.hash = `u/${u.id}${b.dataset.t === 'words' ? '/words' : ''}`; }));
    const ub = $('#ub', app);
    if (words) { deckView(ub, u.deck, u.id); return; }
    ub.innerHTML = u.secs.map((s, j) => `<section class="bl-sec ${s.type === 'book' ? 'book' : ''}" data-j="${j}"></section>`).join('');
    u.secs.forEach((s, j) => renderSec($(`[data-j="${j}"]`, ub), s, u, j));
    ev('book_room_unit', { cp_q: String(u.no) });
  }

  const head = (s) => `<h4>${esc(s.title?.en || '')}<small>${esc(s.title?.ko || '')}</small></h4>${s.hint ? `<p class="bl-hint">${esc(s.hint)}</p>` : ''}`;
  /* 정답 풀기: 「(b) 보」 → [b, 보] · 「아래 / 밑」 → 둘 다 · 「(b) 간. 곧 ends…」 → 설명은 떼어 둔다 */
  const parseA = (a) => {
    a = String(a || ''); const m = /^\(([a-e])\)\s*([^.]*)(?:\.\s*(.*))?$/.exec(a);
    if (m) return { ok: [m[1], `(${m[1]})`, m[2].trim(), `(${m[1]}) ${m[2].trim()}`].filter(Boolean), show: `(${m[1]}) ${m[2].trim()}`, why: m[3] || '', letter: m[1] };
    const parts = a.split(/\s*\/\s*/).map((x) => x.trim()).filter(Boolean);
    return { ok: parts.length ? parts : [a], show: a, why: '' };
  };
  const opts = (q) => { const r = []; const re = /\(([a-e])\)\s*([^()]+?)(?=\s*\(|$)/g; let m; while ((m = re.exec(q))) r.push([m[1], m[2].trim()]); return r.length >= 2 ? r : null; };
  /* 보기 문항의 맨 끝 괄호 도움말 「(Combine consonant and vowel.)」 — 보기가 아니면 문제 옆에 남긴다 */
  const qHint = (q) => { const m = /\(([^()]*)\)\s*$/.exec(q); return m && !/^[a-e]$/.test(m[1].trim()) ? m[1] : ''; };

  function renderSec(el, s, u, j) {
    const key = 's' + j;
    if (s.type === 'book') { el.innerHTML = `<b>${esc(s.title?.en || '')} · ${esc(s.title?.ko || '')}</b> — in the book · 이 칸은 책에서 해요`; return; }
    if (s.type === 'text') { el.innerHTML = head(s) + String(s.text || '').split('\n').map((l) => `<p>${esc(l)}</p>`).join(''); return; }
    if (s.type === 'table') {
      el.innerHTML = head(s) + `<div class="bl-tw"><table><tr>${(s.cols || []).map((c, ci) => `<th>${esc(c)} <button class="bl-btn sm" type="button" data-c="${ci}" aria-pressed="false">Cover · 가리기</button></th>`).join('')}</tr>${(s.rows || []).map((r) => `<tr>${r.map((c, ci) => `<td data-c="${ci}">${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>${s.note ? `<p class="bl-hint">${esc(s.note)}</p>` : ''}<p class="bl-hint">Cover a column, say it aloud, then tap a cell to check. · 칸을 가리고 소리 내어 말한 다음, 눌러서 확인해요.</p>`;
      $$('th button', el).forEach((b) => b.addEventListener('click', () => { const c = b.dataset.c, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.textContent = on ? 'Show · 보이기' : 'Cover · 가리기'; $$(`td[data-c="${c}"]`, el).forEach((td) => td.classList.toggle('hide', on)); }));
      el.addEventListener('click', (e) => { const td = e.target.closest('td.hide'); if (td) td.classList.remove('hide'); });
      return;
    }
    if (s.type === 'practice') {
      const its = (s.items || []).map((it, k) => ({ it, k, a: parseA(it.a), op: opts(it.q) }));
      el.innerHTML = head(s) + `<div class="bl-items">${its.map(({ it, k, op }) => `<div class="bl-it" data-k="${k}"><span class="q" lang="ko">${k + 1}. ${esc(op ? it.q.replace(/\s*\([a-e]\)[\s\S]*$/, '') : it.q)}${op && qHint(it.q) ? ` <small style="color:var(--ink3);font-weight:500">(${esc(qHint(it.q))})</small>` : ''}</span>${op ? `<span class="bl-acts" style="margin:0">${op.map(([l, t]) => `<button class="bl-btn sm" type="button" data-l="${l}">${l}) ${esc(t)}</button>`).join('')}</span>` : `<input autocomplete="off" lang="ko" aria-label="Answer ${k + 1}">`}<span class="fb" role="status"></span></div>`).join('')}</div>
        <div class="bl-acts"><button class="bl-btn main" type="button" data-a="check">Check · 확인</button><button class="bl-btn" type="button" data-a="reset">Try again · 다시 풀기</button><span class="res"></span></div>`;
      $$('.bl-it [data-l]', el).forEach((b) => b.addEventListener('click', () => { $$('[data-l]', b.parentNode).forEach((x) => x.classList.toggle('main', x === b)); b.parentNode.dataset.pick = b.dataset.l; }));
      $$('.bl-it input', el).forEach((inp) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const n = inp.closest('.bl-it').nextElementSibling?.querySelector('input'); if (n) n.focus(); else $('[data-a="check"]', el).click(); } }));
      $('[data-a="check"]', el).addEventListener('click', () => {
        let ok = 0;
        its.forEach(({ it, k, a, op }) => {
          const row = $(`.bl-it[data-k="${k}"]`, el); const v = op ? ($('.bl-acts', row).dataset.pick || '') : $('input', row).value;
          const good = v && (op ? v === a.letter : a.ok.some((x) => norm(x) === norm(v)));
          row.classList.toggle('ok', !!good); row.classList.toggle('no', !good);
          const fb = $('.fb', row);
          if (good) { ok++; fb.textContent = 'Correct · 맞았어요' + (a.why ? ' — ' + a.why : ''); miss(`${u.id}:${j}:${k}`, null, false); }
          else { fb.innerHTML = `Answer · 답: <b>${esc(a.show)}</b>${a.why ? ' — ' + esc(a.why) : ''} ${!op && v ? '<button class="bl-btn sm" type="button" data-self>I wrote it correctly · 맞게 썼어요</button>' : ''}`; miss(`${u.id}:${j}:${k}`, { u: u.id, no: u.no, t: u.title.ko, q: it.q, a: it.a }, true); }
        });
        $('.res', el).textContent = `${ok} / ${its.length}`; saveS(u.id, key, ok / its.length);
        ev('book_room_check', { cp_q: String(u.no), cp_area: `${ok}/${its.length}` });
      });
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-self]'); if (!b) return; const row = b.closest('.bl-it'); row.classList.remove('no'); row.classList.add('ok'); miss(`${u.id}:${j}:${row.dataset.k}`, null, false); b.remove(); });
      $('[data-a="reset"]', el).addEventListener('click', () => { $$('.bl-it', el).forEach((r) => { r.classList.remove('ok', 'no'); const i = $('input', r); if (i) i.value = ''; $('.fb', r).textContent = ''; const o = $('.bl-acts', r); if (o) { delete o.dataset.pick; $$('[data-l]', o).forEach((x) => x.classList.remove('main')); } }); $('.res', el).textContent = ''; });
      return;
    }
    if (s.type === 'cards') {
      el.innerHTML = head(s) + `<div class="bl-cards">${(s.items || []).map((c) => `<button type="button" data-say="${esc(c.big)}"><b lang="ko">${esc(c.big)}</b><span>${esc(c.name || '')}</span>${c.ex ? `<span class="ex" lang="ko">${esc(c.ex[0])} · ${esc(c.ex[1])}</span>` : ''}</button>`).join('')}</div>${s.tip ? `<p class="bl-hint">${esc(s.tip)}</p>` : ''}<p class="bl-hint">Tap a card to hear it and see an example. · 카드를 누르면 소리와 예가 나와요.</p>`;
      $$('.bl-cards button', el).forEach((b) => b.addEventListener('click', () => { b.classList.toggle('on'); const ex = $('.ex', b); tts(ex && b.classList.contains('on') ? ex.textContent.split('·')[0] : b.dataset.say); }));
      return;
    }
    if (s.type === 'keyexp') {
      el.innerHTML = head(s) + `<ul class="bl-key">${(s.items || []).map((it) => `<li><span><b lang="ko">${esc(it[0])}</b><small>${esc(it[2])} · ${esc(it[1])}</small><small lang="ko">e.g. ${esc(it[3])}</small></span><button class="bl-btn sm" type="button" data-say="${esc(it[0])} ${esc(it[3])}">Listen · 듣기</button></li>`).join('')}</ul>`;
      $$('[data-say]', el).forEach((b) => b.addEventListener('click', () => tts(b.dataset.say)));
      return;
    }
    if (s.type === 'matchlines') {
      const P = s.pairs || [], ord = (s.order && s.order.length === P.length) ? s.order : P.map((_, k) => k);
      el.innerHTML = head(s) + `<div class="bl-match"><div>${P.map((p, k) => `<button type="button" data-l="${k}" lang="ko">${esc(p[0])}</button>`).join('')}</div><div>${ord.map((k) => `<button type="button" data-r="${k}" lang="ko">${esc(P[k][1])}</button>`).join('')}</div></div><div class="bl-acts"><span class="res"></span></div>`;
      let sel = null, got = 0;
      el.addEventListener('click', (e) => {
        const l = e.target.closest('[data-l]'), r = e.target.closest('[data-r]');
        if (l && !l.classList.contains('ok')) { $$('[data-l]', el).forEach((x) => x.classList.remove('sel')); l.classList.add('sel'); sel = l; }
        if (r && sel && !r.classList.contains('ok')) {
          if (r.dataset.r === sel.dataset.l) { r.classList.add('ok'); sel.classList.add('ok'); sel.classList.remove('sel'); sel = null; got++; tts(r.textContent); if (got === P.length) { $('.res', el).textContent = 'All matched · 다 맞혔어요'; saveS(u.id, key, 1); } }
          else { r.classList.add('no'); setTimeout(() => r.classList.remove('no'), 600); }
        }
      });
      return;
    }
    if (s.type === 'dialog') {
      el.innerHTML = head(s) + `<div class="bl-dlg">${(s.lines || []).map((l) => `<p><b>${esc(l.who)}</b><span lang="ko">${esc(l.ko)}<small>${esc(l.en || '')}</small></span><button class="bl-btn sm" type="button" data-say="${esc(l.ko)}" aria-label="Listen">▶</button></p>`).join('')}</div><div class="bl-acts"><button class="bl-btn" type="button" data-a="all">Play all · 모두 듣기</button><button class="bl-btn" type="button" data-a="en" aria-pressed="false">Hide English · 영어 숨기기</button></div>`;
      $$('[data-say]', el).forEach((b) => b.addEventListener('click', () => tts(b.dataset.say)));
      $('[data-a="all"]', el).addEventListener('click', () => tts((s.lines || []).map((l) => l.ko).join(' ')));
      $('[data-a="en"]', el).addEventListener('click', (e) => { const on = $('.bl-dlg', el).classList.toggle('noen'); e.currentTarget.setAttribute('aria-pressed', on); });
      return;
    }
    if (s.type === 'dlgfill') {
      el.innerHTML = head(s) + `<div class="bl-items">${(s.items || []).map((it, k) => `<div class="bl-it" data-k="${k}"><span class="q" lang="ko">${esc(it.a)} <small style="color:var(--ink3)">(${esc(it.hint || '')})</small></span><span style="display:flex;gap:6px;align-items:center">${esc(it.pre || '')}<input autocomplete="off" lang="ko" aria-label="Your answer">${esc(it.post || '')}</span><span class="fb" role="status"></span></div>`).join('')}</div><div class="bl-acts"><button class="bl-btn main" type="button">Compare · 예시와 견주기</button></div>`;
      $('.bl-acts button', el).addEventListener('click', () => { $$('.bl-it', el).forEach((row) => { const it = s.items[+row.dataset.k]; $('.fb', row).innerHTML = `Example · 예: <b lang="ko">${esc(it.pre || '')}${esc(it.ans)}${esc(it.post || '')}</b> — any true answer about you is fine · 내 이야기면 다 좋아요`; row.classList.add('ok'); }); saveS(u.id, key, 1); });
      return;
    }
  }

  /* 낱말 카드: 알아요 / 다시 */
  function deckView(el, deck, uid) {
    if (!deck.length) { el.innerHTML = '<p class="bl-empty">No word cards in this unit. · 이 단원에는 낱말 카드가 없어요.</p>'; return; }
    let q = deck.map((_, k) => k), known = 0, flips = 0;
    const draw = () => {
      if (!q.length) { el.innerHTML = `<div class="bl-sec"><h4>All ${deck.length} known · ${deck.length}개 모두 알아요<small>${flips} flips · 뒤집은 수</small></h4><div class="bl-acts"><button class="bl-btn" type="button">Again from the start · 처음부터</button></div></div>`; $('button', el).addEventListener('click', () => { q = deck.map((_, k) => k); known = 0; flips = 0; draw(); }); saveS(uid, 'words', 1); ev('book_room_words', { cp_area: String(deck.length) }); return; }
      const c = deck[q[0]];
      el.innerHTML = `<div class="bl-sec"><div class="bl-meter"><span>Left · 남은 카드 <b>${q.length}</b></span><span>Known · 알아요 <b>${known}</b></span></div>
        <div class="bl-card" tabindex="0" role="button" aria-label="Flip · 뒤집기"><div><div class="fa" lang="ko"><b>${esc(c.ko)}</b><small>Tap to see the meaning · 눌러서 뜻 보기</small></div><div class="ba">${esc(c.en)}</div></div></div>
        <div class="bl-acts"><button class="bl-btn" type="button" data-a="say">Listen · 듣기</button><button class="bl-btn" type="button" data-a="again">Again · 다시</button><button class="bl-btn main" type="button" data-a="know">I know it · 알아요</button></div></div>`;
      const card = $('.bl-card', el); const flip = () => { card.classList.toggle('flip'); flips++; };
      card.addEventListener('click', flip); card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      $('[data-a="say"]', el).addEventListener('click', () => tts(c.ko));
      $('[data-a="again"]', el).addEventListener('click', () => { q.push(q.shift()); draw(); });
      $('[data-a="know"]', el).addEventListener('click', () => { q.shift(); known++; draw(); });
    };
    draw();
  }

  function missedView(app) {
    const m = Object.entries(MISS());
    app.innerHTML = `<div class="bl-unit-hd"><div><div class="kick">Missed · 틀린 문제</div><h2>Questions to try again<span class="ko">다시 풀 문제 ${m.length}개</span></h2></div><a class="bl-btn sm" href="#">All units · 단원 목록</a></div>` +
      (m.length ? `<section class="bl-sec"><div class="bl-items">${m.map(([k, x]) => `<div class="bl-it" data-key="${esc(k)}"><span class="q" lang="ko"><small style="color:var(--ink3)">${String(x.no).padStart(2, '0')} ${esc(x.t)}</small><br>${esc(x.q)}</span><input autocomplete="off" lang="ko" aria-label="Answer"><span class="fb" role="status"></span></div>`).join('')}</div><div class="bl-acts"><button class="bl-btn main" type="button">Check · 확인</button><span class="res"></span></div></section>` : '<p class="bl-empty">Nothing here yet — questions you miss will appear here. · 아직 없어요. 틀린 문제가 여기 모여요.</p>');
    $('.bl-acts button', app)?.addEventListener('click', () => {
      let ok = 0; $$('.bl-it', app).forEach((row) => { const x = MISS()[row.dataset.key]; if (!x) return; const a = parseA(x.a), v = $('input', row).value; const good = v && (a.letter ? norm(v) === norm(a.letter) || a.ok.some((y) => norm(y) === norm(v)) : a.ok.some((y) => norm(y) === norm(v)));
        row.classList.toggle('ok', !!good); row.classList.toggle('no', !good); $('.fb', row).innerHTML = good ? 'Correct — removed from the list · 맞았어요, 목록에서 뺐어요' : `Answer · 답: <b>${esc(a.show)}</b>`; if (good) { ok++; miss(row.dataset.key, null, false); } });
      $('.res', app).textContent = `${ok} / ${$$('.bl-it', app).length}`;
    });
  }
})();
