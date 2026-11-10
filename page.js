/* 정적 쪽(사전 · TOPIK · EPS 문제)의 손에 잡히는 것 — tools/build-pages.mjs 가 쪽마다 붙인다.
   검색으로 들어온 사람이 3초 안에 「해 봤다」를 느끼게(운영자 요청 2026-10-01 「훅이라 더 직관적이게」):
   · [data-say] 🔊 — 녹음 파일이 있으면 그 소리, 없으면 기기의 한국어 목소리(speechSynthesis)
   · .opts[data-ans] 보기 — 누르면 그 자리에서 ⭕/❌, 정답과 해설을 펼친다
   스크립트가 없어도 쪽은 다 읽힌다(정답은 「정답과 해설 보기」에 그대로 있다). */
(() => {
  const say = (btn) => {
    const src = btn.dataset.src, text = btn.dataset.say;
    btn.classList.add('on'); setTimeout(() => btn.classList.remove('on'), 900);
    if (src) { const a = new Audio(src); a.play().catch(() => tts(text)); return; }
    tts(text);
  };
  function tts(text) {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR'; u.rate = 0.9;
      const v = speechSynthesis.getVoices().find((x) => /^ko/i.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* 소리를 못 내는 기기 — 조용히 넘어간다 */ }
  }
  const NUM = ['①', '②', '③', '④', '⑤'];
  function pick(li) {
    const ul = li.closest('.opts[data-ans]');
    if (!ul || ul.dataset.done) return;
    ul.dataset.done = '1';
    const ans = Number(ul.dataset.ans), items = [...ul.children], i = items.indexOf(li);
    const ok = i === ans;
    items[ans].classList.add('right');
    if (!ok) li.classList.add('wrong');
    const msg = document.createElement('p');
    msg.className = 'pick-msg ' + (ok ? 'ok' : 'no');
    msg.textContent = ok ? '⭕ 정답이에요! · Correct!' : `❌ 아쉬워요 — 정답은 ${NUM[ans] || ans + 1} · The answer is ${NUM[ans] || ans + 1}`;
    ul.after(msg);
    const box = ul.parentNode.querySelector('details.ans-box');
    if (box) box.open = true;
    document.querySelector('.cta.more')?.classList.add('pulse');
    try { (window.dataLayer = window.dataLayer || []).push({ event: 'static_answer', correct: ok }); } catch (e) {}
  }
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-say]');
    if (s) { say(s); return; }
    const li = e.target.closest('.opts[data-ans] > li');
    if (li) { pick(li); return; }
    /* 예문 상자 · 대화 말풍선을 누르면 읽어 준다 — 상자처럼 생겨서 눌러 보는 사람이 많은데 아무 일도 없었다(데드클릭, 2026-11-10).
       한글이 든 것만, 글을 긁어 고르는 중이면 그대로 둔다. */
    const ex = e.target.closest('.ex, .bub');
    if (ex && !e.target.closest('a, button') && /[가-힣]/.test(ex.textContent) && !String(window.getSelection?.() || '')) {
      tts(ex.textContent.trim().slice(0, 200));
      ex.style.outline = '2px solid #e4631f'; ex.style.outlineOffset = '2px';
      setTimeout(() => { ex.style.outline = ''; ex.style.outlineOffset = ''; }, 900);
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.opts[data-ans] > li')) { e.preventDefault(); pick(e.target); }
  });
})();
