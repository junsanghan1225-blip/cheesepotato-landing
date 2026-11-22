/* 정적 쪽(사전 · TOPIK · EPS 문제)의 손에 잡히는 것 — tools/build-pages.mjs 가 쪽마다 붙인다.
   검색으로 들어온 사람이 3초 안에 「해 봤다」를 느끼게(운영자 요청 2026-10-01 「훅이라 더 직관적이게」):
   · [data-say] 🔊 — 녹음 파일이 있으면 그 소리, 없으면 기기의 한국어 목소리(speechSynthesis)
   · .opts[data-ans] 보기 — 누르면 그 자리에서 ⭕/❌, 정답과 해설을 펼친다
   · form[data-find] 사전 찾기 — 앱 사전 검색으로
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
  /* 코스 목록(/course/) 진도 — 앱이 이 브라우저에 남긴 끝낸 레슨(localStorage cp_done_local)을 읽어
     카드 · 레벨 막대 · 「이어서 하기」를 채운다(2026-11-22 시안 G). 기록이 없으면 손대지 않는다 */
  const cards = document.querySelectorAll('.cg-u[data-cg-ids]');
  if (cards.length) {
    let done = new Set();
    try { done = new Set(JSON.parse(localStorage.getItem('cp_done_local') || '[]')); } catch (e) {}
    let allN = 0, allT = 0;
    document.querySelectorAll('.cg-lv').forEach((lv) => {
      let n = 0, tot = 0, next = '';
      lv.querySelectorAll('.cg-u[data-cg-ids]').forEach((c) => {
        const ids = c.dataset.cgIds.split(' ');
        const k = ids.filter((id) => done.has(id)).length;
        n += k; tot += ids.length;
        if (!next && k && k < ids.length) next = ids.find((id) => !done.has(id));
        if (!k) return;
        c.classList.add(k === ids.length ? 'done' : 'on');
        c.querySelector('.cg-bar i').style.width = Math.round((k / ids.length) * 100) + '%';
        c.querySelector('.cg-n').textContent = k + ' / ' + ids.length + '강';
      });
      allN += n; allT += tot;
      if (!n) return;
      lv.querySelector('.cg-l .cg-bar i').style.width = Math.round((n / tot) * 100) + '%';
      lv.querySelector('.cg-m').textContent = n + '강 끝냄 · ' + Math.round((n / tot) * 100) + '%';
      if (!next) { const first = [...lv.querySelectorAll('.cg-u[data-cg-ids]')].map((c) => c.dataset.cgIds.split(' ')).flat().find((id) => !done.has(id)); next = first || ''; }
      const go = lv.querySelector('.cg-go');
      if (next && go) { go.href = '/lesson/' + next + '.html'; go.textContent = '이어서 하기 →'; }
    });
    const me = document.getElementById('cgMe');
    if (allN && me) me.querySelector('span').innerHTML = '지금까지 <b>' + allN + '강</b> 끝냈어요 · 전체 ' + allT + '강 중 ' + Math.round((allN / allT) * 100) + '% <small>(이 기기 기록)</small>';
  }
  /* 레슨 쪽 「이 코스 길」 — 끝낸 레슨에 채운 점(같은 기록) */
  const steps = document.querySelectorAll('.lx-ol li[data-lid]');
  if (steps.length) {
    let done = new Set();
    try { done = new Set(JSON.parse(localStorage.getItem('cp_done_local') || '[]')); } catch (e) {}
    steps.forEach((li) => { if (done.has(li.dataset.lid)) li.classList.add('done'); });
  }
  /* 사전 찾기 칸(낱말 쪽 · 사전 첫 쪽, 2026-11-22) — 앱 사전 검색(/#dictionary/<낱말>)으로 보낸다. 한국어 · 영어 모두 */
  document.addEventListener('submit', (e) => {
    const f = e.target.closest?.('form[data-find]'); if (!f) return;
    e.preventDefault();
    const q = (f.querySelector('input[name="q"]')?.value || '').trim();
    location.href = q ? '/#dictionary/' + encodeURIComponent(q) : '/#dictionary';
  });
})();
