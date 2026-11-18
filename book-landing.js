/* 책 체험 랜딩 쪽(/book/<책 id>/ — tools/build-book-landing.mjs 가 만든다)의 움직임과 연습실.
   학습에 효과가 있는 것만(운영자 2026-11-18 「학습에 효과적인 툴만 골라 인터랙티브하게」):
   ① 빈칸 쓰기 — 먼저 떠올려 쓰고(인출 연습) 바로 확인. 틀리면 「해요체 · 반말」처럼 51번에서 감점되는 까닭을 짚는다.
   ② 고르기 — 보기를 고르면 맞고 틀린 이유(책의 풀이)를 바로 보여 준다.
   ③ 표현 카드 — 뒤집어 보고 「알아요 / 다시」. 「다시」 는 줄 뒤로 돌아와 다 알 때까지 나온다(간격을 둔 반복).
   채점은 정답 비교(책의 정답 목록) — AI 채점이 아니다. 기록은 이 기기의 localStorage 에만(blab:<책>).
   스크립트가 없어도 쪽의 글 · 그림은 다 보인다. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let D = {}; try { D = JSON.parse($('#bl-data').textContent); } catch (e) { /* 자료 없음 */ }
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'blab:' + (D.book || '');
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const put = (o) => { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(get(), o))); } catch (e) { /* 저장 막힘 */ } };
  const ev = (name, extra) => { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name, book_id: D.book }, extra || {})); } catch (e) {} };

  /* 맨 위 읽은 만큼 줄 · 나타나기 · 숫자 세기 */
  const prog = $('.bl-prog');
  const onScroll = () => { if (prog) { const h = document.documentElement; prog.style.width = Math.min(100, (h.scrollTop / Math.max(1, h.scrollHeight - innerHeight)) * 100) + '%'; } };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const count = (el) => { const n = parseInt(el.dataset.count, 10); if (!n || RM) return; let t0; const run = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(run); }; requestAnimationFrame(run); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('on'); const c = e.target.querySelector('[data-count]'); if (c) count(c); io.unobserve(e.target); } }), { threshold: 0.2 });
    $$('.rv').forEach((el) => io.observe(el));
    /* 책 속 넘겨 보기: 글 칸이 화면 가운데에 오면 그 쪽 그림으로 */
    const imgs = $$('.story .stage img');
    const so = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; const i = e.target.dataset.i; $$('.story li').forEach((li) => li.classList.toggle('on', li === e.target)); imgs.forEach((im) => im.classList.toggle('on', im.dataset.i === i)); }), { rootMargin: '-45% 0px -45% 0px' });
    $$('.story li').forEach((li) => so.observe(li));
  } else $$('.rv').forEach((el) => el.classList.add('on'));

  /* 입체 책: 마우스 · 손가락 위치에 따라 조금 돈다 */
  const bk = $('#bk3d');
  if (bk && !RM) {
    const base = { y: -24, x: 6 };
    addEventListener('pointermove', (e) => { const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5; bk.style.transform = `rotateY(${base.y + dx * 22}deg) rotateX(${base.x - dy * 10}deg)`; }, { passive: true });
    addEventListener('scroll', () => { const r = Math.min(1, scrollY / 600); bk.style.transform = `rotateY(${base.y + r * 18}deg) rotateX(${base.x - r * 4}deg)`; }, { passive: true });
  }

  /* 연습실 탭 */
  const tabs = $$('.bl-tabs [role="tab"]');
  const show = (t) => { tabs.forEach((b) => { const on = b === t; b.setAttribute('aria-selected', on); $('#' + b.getAttribute('aria-controls')).hidden = !on; }); };
  tabs.forEach((b, i) => { b.addEventListener('click', () => { show(b); ev('book_lab_tab', { cp_area: String(i + 1) }); }); b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n); } }); });
  const done = (pane, title, body, next) => { pane.innerHTML = `<div class="bl-done"><h3>${title}</h3><p>${body}</p><div class="bl-cta">${next}</div></div>`; };
  const nextTab = (i, label) => tabs[i] ? `<button class="bl-btn main" type="button" data-go="${i}">${label} →</button>` : '';
  document.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) { show(tabs[+g.dataset.go]); tabs[+g.dataset.go].scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } });
  const meter = (i, n, score) => `<div class="bl-meter"><span>${i + 1} / ${n}</span><span>Correct · 맞음 <b>${score}</b></span></div>`;
  const norm = (s) => String(s || '').normalize('NFC').replace(/[\s.,!?~·'"“”‘’()]/g, '');

  /* ① 빈칸 쓰기 */
  const pF = $('#p-fill');
  if (pF && D.fill?.length) {
    let i = 0, score = 0;
    const draw = () => {
      if (i >= D.fill.length) { put({ fill: score }); ev('book_lab_done', { cp_area: 'fill', cp_q: score }); done(pF, `${score} / ${D.fill.length} · Done · 끝`, 'In the book, every unit has blanks like these, with model answers and the answers that lose points. · 책의 단원마다 이런 빈칸이 있고, 정답 쪽에 모범 답안과 감점되는 답이 있어요.', nextTab(1, 'Next: choose the ending · 다음: 문체 고르기')); return; }
      const f = D.fill[i], q = esc(f.q).replace(/_{2,}/, '<mark>　?　</mark>');
      pF.innerHTML = `${meter(i, D.fill.length, score)}<p class="bl-q">${q}</p><p class="bl-en">${esc(f.en)}</p><form class="bl-row"><input autocomplete="off" lang="ko" aria-label="Your answer · 답" placeholder="Type the missing words · 빈칸에 들어갈 말"><button class="bl-btn main" type="submit">Check · 확인</button></form><div class="bl-fb" role="status" aria-live="polite"></div>`;
      const inp = $('input', pF), fb = $('.bl-fb', pF); inp.focus({ preventScroll: true });
      $('form', pF).addEventListener('submit', (e) => {
        e.preventDefault(); const v = inp.value.trim(); if (!v) { inp.focus(); return; }
        if (fb.dataset.done) { i++; draw(); return; }
        const ok = f.a.some((a) => norm(a) === norm(v));
        const why = ok ? '' : /요$/.test(v.replace(/[.!?\s]+$/, '')) ? 'Ends in 해요체 (-요). A notice like this is written in -습니다 style, so 51 takes points off. · 끝이 해요체(-요)예요. 안내문은 -습니다 체로 써야 해서 51번에서 감점돼요.' : /[다]$/.test(v.replace(/[.!?\s]+$/, '')) && !/니다$/.test(v.replace(/[.!?\s]+$/, '')) ? 'Ends in plain -다 style. Notices use -습니다 / -시기 바랍니다. · 끝이 -다 체예요. 안내문은 -습니다 · -시기 바랍니다로 써요.' : 'Check the meaning and the ending against the answer below. · 뜻과 끝말을 아래 답과 견줘 보세요.';
        if (ok) score++;
        fb.className = 'bl-fb show ' + (ok ? 'ok' : 'no'); fb.dataset.done = '1';
        fb.innerHTML = `<b>${ok ? 'Correct · 맞았어요' : 'Not quite · 다시 볼까요'}</b>${ok ? '' : `<span>${why}</span><br>`}Answer · 답: <strong>${esc(f.a.join(' / '))}</strong>`;
        $('button', pF).textContent = i + 1 < D.fill.length ? 'Next · 다음' : 'Finish · 끝'; inp.readOnly = true; $('button', pF).focus();
        ev('book_lab_answer', { cp_area: 'fill', cp_q: String(i + 1), cp_ok: ok ? 'y' : 'n' });
      });
    };
    draw();
  }

  /* ② 고르기 */
  const pQ = $('#p-quiz');
  if (pQ && D.quiz?.length) {
    let i = 0, score = 0;
    const draw = () => {
      if (i >= D.quiz.length) { put({ quiz: score }); ev('book_lab_done', { cp_area: 'quiz', cp_q: score }); done(pQ, `${score} / ${D.quiz.length} · Done · 끝`, 'The book explains every answer like this, in English and Korean. · 책은 모든 문제를 이렇게 영어 · 한국어로 풀어 줘요.', nextTab(2, 'Next: key expressions · 다음: 표현 카드')); return; }
      const q = D.quiz[i];
      pQ.innerHTML = `${meter(i, D.quiz.length, score)}<p class="bl-q" style="font-size:19px">${esc(q.q)}</p><div class="bl-opts">${q.opts.map((o, j) => `<button type="button" data-j="${j}" lang="ko">${j + 1}. ${esc(o)}</button>`).join('')}</div><div class="bl-fb" role="status" aria-live="polite"></div>`;
      $$('.bl-opts button', pQ).forEach((b) => b.addEventListener('click', () => {
        const fb = $('.bl-fb', pQ); if (fb.dataset.done) return;
        const j = +b.dataset.j, ok = j === q.a; if (ok) score++;
        $$('.bl-opts button', pQ).forEach((x) => { x.disabled = true; if (+x.dataset.j === q.a) x.classList.add('ok'); });
        if (!ok) b.classList.add('no');
        fb.dataset.done = '1'; fb.className = 'bl-fb show ' + (ok ? 'ok' : 'no');
        fb.innerHTML = `<b>${ok ? 'Correct · 맞았어요' : 'Not quite · 아쉬워요'}</b>${esc(q.why)}<div style="margin-top:10px"><button class="bl-btn" type="button">${i + 1 < D.quiz.length ? 'Next · 다음' : 'Finish · 끝'}</button></div>`;
        $('.bl-fb button', pQ).addEventListener('click', () => { i++; draw(); }); $('.bl-fb button', pQ).focus();
        ev('book_lab_answer', { cp_area: 'quiz', cp_q: String(i + 1), cp_ok: ok ? 'y' : 'n' });
      }));
    };
    draw();
  }

  /* ③ 표현 카드: 알아요 / 다시 — 「다시」 는 줄 뒤로 */
  const pC = $('#p-cards');
  if (pC && D.cards?.length) {
    let queue = D.cards.map((_, j) => j), known = 0, seen = 0;
    const tts = (t) => { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) {} };
    const draw = () => {
      if (!queue.length) { put({ cards: known }); ev('book_lab_done', { cp_area: 'cards', cp_q: seen }); done(pC, `All ${D.cards.length} known · ${D.cards.length}개 모두 알아요`, `You needed ${seen} flips. Each unit in the book starts with expressions like these. · 모두 ${seen}번 뒤집었어요. 책의 단원마다 이런 표현으로 시작해요.`, ''); return; }
      const c = D.cards[queue[0]];
      pC.innerHTML = `<div class="bl-meter"><span>Left · 남은 카드 <b>${queue.length}</b></span><span>Known · 알아요 <b>${known}</b></span></div>
        <div class="bl-card" tabindex="0" role="button" aria-label="Flip the card · 카드 뒤집기"><div><div class="fa" lang="ko"><b>${esc(c.ko)}</b><small>Tap to see the meaning · 눌러서 뜻 보기</small></div><div class="ba">${esc(c.en)}</div></div></div>
        <div class="bl-row" style="justify-content:space-between"><button class="bl-btn" type="button" data-a="say">Listen · 듣기</button><span style="display:flex;gap:8px"><button class="bl-btn" type="button" data-a="again">Again · 다시</button><button class="bl-btn main" type="button" data-a="know">I know it · 알아요</button></span></div>`;
      const card = $('.bl-card', pC); const flip = () => { card.classList.toggle('flip'); seen++; };
      card.addEventListener('click', flip); card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      $('[data-a="say"]', pC).addEventListener('click', () => tts(c.ko));
      $('[data-a="again"]', pC).addEventListener('click', () => { queue.push(queue.shift()); draw(); });
      $('[data-a="know"]', pC).addEventListener('click', () => { queue.shift(); known++; draw(); });
    };
    draw();
  }
})();
