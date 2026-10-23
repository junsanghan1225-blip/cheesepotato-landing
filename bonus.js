/* 책 QR 보너스 연습 쪽(tools/build-bonus.mjs 가 쪽마다 붙인다) — 낱말 카드 뒤집기 · 보기 채점 · 빈칸 채점 · 점수.
   스크립트가 없어도 쪽은 읽힌다(카드 뒷면 · 풀이는 글로 들어 있다). */
(() => {
  const root = document.querySelector('[data-bonus]');
  if (!root) return;
  const KEY = 'bonus:' + root.dataset.bonus;
  const norm = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[\s.,!?~·'"“”‘’()]/g, '');
  const total = root.querySelectorAll('.bq, .bf').length;
  let done = 0, right = 0;
  const board = root.querySelector('.bscore');
  const show = () => {
    if (!board) return;
    board.textContent = done < total ? `${done} / ${total}` : `${right} / ${total}`;
    if (done === total && total) {
      board.parentNode.classList.add('fin');
      const msg = root.querySelector('.bfin'); if (msg) msg.hidden = false;
      try { localStorage.setItem(KEY, String(Math.max(right, Number(localStorage.getItem(KEY) || 0)))); } catch (e) {}
      try { (window.dataLayer = window.dataLayer || []).push({ event: 'book_bonus_done', book_unit: root.dataset.bonus, score: right, total }); } catch (e) {}
    }
  };
  const tts = (text) => {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = 0.9;
      const v = speechSynthesis.getVoices().find((x) => /^ko/i.test(x.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* 소리를 못 내는 기기 */ }
  };
  const mark = (box, ok) => { box.classList.add(ok ? 'ok' : 'no'); done++; if (ok) right++; show(); };
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
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('.bf input')) { e.preventDefault(); check(e.target.closest('.bf')); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.bo > li, .bcard')) { e.preventDefault(); e.target.click(); }
  });
  try { const best = localStorage.getItem(KEY); const b = root.querySelector('.bbest'); if (best && b) { b.textContent = `내 최고 점수 · Best: ${best} / ${total}`; b.hidden = false; } } catch (e) {}
  show();
})();
