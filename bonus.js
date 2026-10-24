/* 책 QR 보너스 연습 쪽(tools/build-bonus.mjs 가 쪽마다 붙인다).
   모드(data-bonus-mode): unit = 단원 쪽(낱말 카드 · 퀴즈 · 빈칸) · hub = 독자 전용 코스(진행률 · 연속 학습 · 이어서) ·
   notebook = 틀린 문제 노트 · challenge = 부 챌린지(그 부의 문제를 섞어 10문항).
   저장은 이 기기의 localStorage 뿐 — bonus:<책>/<단원> 최고 점수, bonusmiss:<책> 틀린 문제, bonusdays:<책> 공부한 날, bonuschal:<책>:<부> 챌린지 최고.
   스크립트가 없어도 쪽은 읽힌다. */
(() => {
  const root = document.querySelector('[data-bonus-mode]');
  if (!root) return;
  const MODE = root.dataset.bonusMode, BOOK = root.dataset.book;
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장이 막힌 기기 */ } };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const markDay = () => { const d = get('bonusdays:' + BOOK, []); const t = ymd(new Date()); if (d[d.length - 1] !== t) { d.push(t); set('bonusdays:' + BOOK, d.slice(-400)); } };
  const streak = () => {
    const d = new Set(get('bonusdays:' + BOOK, [])); let n = 0; const c = new Date();
    if (!d.has(ymd(c))) c.setDate(c.getDate() - 1);
    while (d.has(ymd(c))) { n++; c.setDate(c.getDate() - 1); }
    return n;
  };
  const norm = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[\s.,!?~·'"“”‘’()]/g, '');
  const tts = (text) => {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = 0.9;
      const v = speechSynthesis.getVoices().find((x) => /^ko/i.test(x.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* 소리를 못 내는 기기 */ }
  };
  const bank = () => { try { return JSON.parse(document.getElementById('bk-bank').textContent); } catch (e) { return []; } };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const NUM = ['①', '②', '③', '④'];

  /* ── 채점(단원 · 노트 · 챌린지 공통) ── */
  let done = 0, right = 0, total = 0;
  const board = root.querySelector('.bscore');
  const show = () => {
    if (!board) return;
    board.textContent = done < total ? `${done} / ${total}` : `${right} / ${total}`;
    if (done === total && total) finish();
  };
  function finish() {
    board.parentNode.classList.add('fin');
    const msg = root.querySelector('.bfin'); if (msg) msg.hidden = false;
    if (MODE === 'unit') { const k = 'bonus:' + root.dataset.unitKey; set(k, Math.max(right, get(k, 0))); }
    if (MODE === 'challenge') { const k = 'bonuschal:' + BOOK + ':' + root.dataset.part; set(k, Math.max(right, get(k, 0))); }
    try { (window.dataLayer = window.dataLayer || []).push({ event: 'book_bonus_done', book_unit: root.dataset.unitKey || (MODE + ':' + (root.dataset.part || '')), score: right, total }); } catch (e) {}
  }
  function mark(box, ok) {
    box.classList.add(ok ? 'ok' : 'no'); done++; if (ok) right++;
    markDay();
    const id = box.dataset.id;
    if (id) { const m = get('bonusmiss:' + BOOK, {}); if (ok) delete m[id]; else m[id] = 1; set('bonusmiss:' + BOOK, m); }
    show();
  }
  function check(box) {
    if (box.dataset.done) return;
    const inp = box.querySelector('input'); if (!inp.value.trim()) { inp.focus(); return; }
    box.dataset.done = '1';
    const answers = JSON.parse(box.dataset.a), ok = answers.some((a) => norm(a) === norm(inp.value));
    inp.disabled = true;
    const m = box.querySelector('.bm'); m.hidden = false;
    m.textContent = ok ? '⭕ 정답이에요! · Correct!' : `❌ 정답: ${answers[0]} · Answer: ${answers[0]}`;
    mark(box, ok);
  }
  root.addEventListener('click', (e) => {
    const card = e.target.closest('.bcard');
    if (card) { card.classList.toggle('flip'); if (card.classList.contains('flip')) tts(card.dataset.say); return; }
    const li = e.target.closest('.bo > li');
    if (li) {
      const box = li.closest('.bq'); if (box.dataset.done) return; box.dataset.done = '1';
      const items = [...li.parentNode.children], ans = Number(box.dataset.ans), i = items.indexOf(li);
      items[ans].classList.add('right'); if (i !== ans) li.classList.add('wrong');
      box.querySelector('.bw').hidden = false; mark(box, i === ans); return;
    }
    const btn = e.target.closest('.bf button');
    if (btn) check(btn.closest('.bf'));
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('.bf input')) { e.preventDefault(); check(e.target.closest('.bf')); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.bo > li, .bcard')) { e.preventDefault(); e.target.click(); }
  });

  /* ── 문제 하나를 그린다(노트 · 챌린지) ── */
  function drawQ(q, i) {
    if (q.t === 'q') {
      const b = el('div', 'bq'); b.dataset.ans = q.a; b.dataset.id = q.id;
      const p = el('p', 'bqq'); p.append(el('i', '', 'Q' + (i + 1)), q.q); b.append(p);
      const ul = el('ul', 'bo'); q.opts.forEach((o, k) => { const li = el('li', '', NUM[k] + ' ' + o); li.tabIndex = 0; li.setAttribute('role', 'button'); ul.append(li); });
      b.append(ul); const w = el('p', 'bw', q.why); w.hidden = true; b.append(w); return b;
    }
    const b = el('div', 'bf'); b.dataset.a = JSON.stringify(q.a); b.dataset.id = q.id;
    const p = el('p', 'fq'); const parts = q.q.split('___');
    p.append(parts[0]); const inp = el('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('aria-label', '빈칸 ' + (i + 1)); p.append(inp, parts.slice(1).join('___'));
    const bt = el('button', '', '확인 · Check'); bt.type = 'button'; p.append(bt); b.append(p, el('p', 'fe', q.en));
    const m = el('p', 'bm'); m.hidden = true; b.append(m); return b;
  }
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const startSet = (list, host) => {
    host.textContent = ''; done = 0; right = 0; total = list.length;
    list.forEach((q, i) => host.append(drawQ(q, i)));
    const sc = root.querySelector('.bsc'); if (sc) sc.classList.remove('fin');
    const f = root.querySelector('.bfin'); if (f) f.hidden = true;
    show();
  };

  if (MODE === 'unit') {
    total = root.querySelectorAll('.bq, .bf').length; show();
    const best = get('bonus:' + root.dataset.unitKey, null), b = root.querySelector('.bbest');
    if (best !== null && b) { b.textContent = `내 최고 점수 · Best: ${best} / ${total}`; b.hidden = false; }
  }
  if (MODE === 'notebook') {
    const host = root.querySelector('.bqs'), miss = get('bonusmiss:' + BOOK, {});
    const list = bank().filter((q) => miss[q.id]);
    if (!list.length) { const e = root.querySelector('.bempty'); if (e) e.hidden = false; const s = root.querySelector('.bsc'); if (s) s.hidden = true; }
    else startSet(list, host);
  }
  if (MODE === 'challenge') {
    const host = root.querySelector('.bqs'), all = bank().filter((q) => String(q.p) === root.dataset.part);
    const go = () => startSet(shuffle(all).slice(0, 10), host);
    go();
    const again = root.querySelector('.bagain'); if (again) again.addEventListener('click', go);
    const best = get('bonuschal:' + BOOK + ':' + root.dataset.part, null), b = root.querySelector('.bbest');
    if (best !== null && b) { b.textContent = `내 최고 점수 · Best: ${best} / ${Math.min(10, all.length)}`; b.hidden = false; }
  }
  if (MODE === 'hub') {
    const lis = [...root.querySelectorAll('li[data-u]')]; let finished = 0, next = null, firstReady = null;
    lis.forEach((li) => {
      const t = Number(li.dataset.total || 0), s = li.querySelector('.hs');
      if (!t) return;
      if (!firstReady) firstReady = li;
      const best = get('bonus:' + BOOK + '/' + li.dataset.u, null);
      if (best === null) { s.textContent = '시작 전 · Not started'; if (!next) next = li; return; }
      const ok = best / t >= 0.8; if (ok) finished++; else if (!next) next = li;
      s.textContent = `${ok ? '✅ ' : '🔁 '}${best} / ${t}`; li.classList.add(ok ? 'ok' : 'try');
    });
    const n = lis.length, pct = n ? Math.round((finished / n) * 100) : 0;
    const bar = root.querySelector('.hprog i'); if (bar) bar.style.width = pct + '%';
    const p = root.querySelector('.hpct'); if (p) p.textContent = `${finished} / ${n} 단원 · ${pct}%`;
    const sk = streak(), st = root.querySelector('.hstreak'); if (st) st.textContent = sk ? `🔥 ${sk}일 연속 · ${sk}-day streak` : '🌱 오늘 한 단원부터 · start today';
    const nx = root.querySelector('.hnext');
    if (nx && (next || firstReady)) { const t = next || firstReady; nx.href = t.querySelector('a').href; nx.hidden = false; if (!next) nx.textContent = '모두 끝! 다시 풀어 보기 · All done, review again'; else if (finished) nx.textContent = '이어서 하기 · Continue'; }
    const miss = Object.keys(get('bonusmiss:' + BOOK, {})).length, mc = root.querySelector('.hmiss');
    if (mc) mc.textContent = miss ? `틀린 문제 ${miss}개 · ${miss} to review` : '아직 없어요 · none yet';
    root.querySelectorAll('[data-chal]').forEach((c) => { const b = get('bonuschal:' + BOOK + ':' + c.dataset.chal, null); if (b !== null) c.querySelector('.hcb').textContent = `최고 ${b} / 10 · Best`; });
  }
})();
