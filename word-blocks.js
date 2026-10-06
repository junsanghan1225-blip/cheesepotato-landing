/* ══ 게임 : 단어 블록 쌓기 (#blocks) ═══════════════════════════════
   운영자 요청(2026-10-06): 「블록 쌓기나 뿌요뿌요 … 단어를 외우기 위해 최적화」.
   위에서 한국어 낱말 블록이 떨어지고, 아래 뜻 셋 중 하나를 고른다.
   - 맞히면 블록이 터지고 소리가 난다(듣기 + 뜻 + 글자를 한 번에 묶는다).
   - 틀리거나 바닥까지 떨어지면 그 자리에 쌓인다. 쌓인 것이 천장에 닿으면 끝.
   - 쌓인 낱말은 블록 몇 개 뒤에 「다시」 떨어진다 — 이번에 맞히면 쌓인 블록도 같이 사라진다.
     틀린 것을 곧 다시 꺼내 보는 것(간격 두고 다시 떠올리기)이 외우기에 가장 잘 듣는다.
   - 끝나면 틀린 낱말 목록 + 「단어장에 담기」.
   자료는 「단어」의 TOPIK 낱말(vocab-topik1/2.js), 우리 레벨 v(감자 L1~L7)로 쉬움 · 보통 · 어려움을 가른다.
   화면 틀은 index.html #blkView, 화면 전환 · 저장 · 소리는 app.module.js 가 넘겨준다(deps). */

const ROWS = 8;                 // 천장까지 쌓을 수 있는 줄 수
const BEST_KEY = 'cp_blk_best';
const LV_KEY = 'cp_blk_lv';
const SOUND_KEY = 'cp_blk_sound';
const AGAIN_AFTER = 3;          // 틀린 낱말은 블록 3개 뒤에 다시 떨어진다
const LEVELS = [
  { id: 'easy', ko: '쉬움', en: 'Easy', dko: '감자 L1~L2 · 처음 배우는 낱말', den: 'Potato L1–L2 · first words', v: [1, 2] },
  { id: 'mid', ko: '보통', en: 'Medium', dko: '감자 L3~L5 · TOPIK I 낱말', den: 'Potato L3–L5 · TOPIK I words', v: [3, 5] },
  { id: 'hard', ko: '어려움', en: 'Hard', dko: '감자 L6~L7 · TOPIK II 낱말', den: 'Potato L6–L7 · TOPIK II words', v: [6, 7] },
];

const read = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const mean = (w) => (w.s || w.e || '').split(/[;/]/)[0].trim();

let D = null;          // deps: { root, t, esc, say, save, track, vocab() }
let G = null;          // 지금 한 판
let raf = 0;

/* 판 하나의 속도 — 맞힌 수 10개마다 한 단계. 떨어지는 데 9초에서 시작해 3.5초까지 빨라진다. */
const fallMs = (stage) => Math.max(3500, 9000 - stage * 900);

export function blkMount(deps) { D = deps; blkSetup(); }

/* 화면을 떠날 때(app.module.js open) — 시계를 멈춘다. 돌아오면 고르기 화면부터. */
export function blkStop() { if (raf) cancelAnimationFrame(raf); raf = 0; if (G) G.paused = true; }

export function blkSetup() {
  blkStop(); G = null;
  const { t, esc } = D;
  const lv = read(LV_KEY, 'easy');
  const best = parseInt(read(BEST_KEY, '0'), 10) || 0;
  D.root.innerHTML = `
    <div class="blk-intro">
      <div class="blk-demo" aria-hidden="true"><span>사과</span><span>학교</span><span>바다</span></div>
      <h2>${esc(t('단어 블록 쌓기', 'Word blocks'))}</h2>
      <p>${esc(t('낱말 블록이 떨어져요. 바닥에 닿기 전에 맞는 뜻을 고르면 터져요. 틀린 낱말은 쌓였다가 곧 다시 떨어져요 — 그때 맞히면 쌓인 블록도 사라져요.', 'A word block falls. Pick its meaning before it lands and it pops. Missed words stack up and drop again soon — get them right and the stacked block clears too.'))}</p>
      <div class="blk-lvs" role="radiogroup" aria-label="${esc(t('난이도', 'Level'))}">
        ${LEVELS.map((L) => `<button type="button" role="radio" class="blk-lv${L.id === lv ? ' on' : ''}" aria-checked="${L.id === lv}" data-blk-lv="${L.id}"><b>${esc(t(L.ko, L.en))}</b><small>${esc(t(L.dko, L.den))}</small></button>`).join('')}
      </div>
      <button type="button" class="pt-next blk-go" data-blk="start">${esc(t('시작하기', 'Start'))}</button>
      <p class="blk-keys">${esc(t('PC: 숫자 1 · 2 · 3 으로 골라요', 'On a computer: press 1 · 2 · 3'))}${best ? ` · ${esc(t(`최고 ${best}점`, `Best ${best}`))}` : ''}</p>
    </div>`;
}

async function blkStart() {
  const { t, esc } = D;
  const lv = LEVELS.find((L) => L.id === read(LV_KEY, 'easy')) || LEVELS[0];
  D.root.innerHTML = `<p class="blk-wait">${esc(t('낱말을 불러오는 중…', 'Loading words…'))}</p>`;
  let all = [];
  try { all = await D.vocab(lv.id === 'hard'); } catch (e) {}
  const pool = all.filter((w) => w.v >= lv.v[0] && w.v <= lv.v[1] && mean(w) && w.h.length <= 8);
  if (pool.length < 20) { D.root.innerHTML = `<p class="blk-wait">${esc(t('낱말을 못 불러왔어요. 잠시 뒤 다시 해 주세요.', 'Could not load words. Please try again shortly.'))}</p>`; return; }
  G = {
    lv, pool, deck: shuffle(pool), stack: [], again: [], missed: new Map(),
    cur: null, y: 0, t0: 0, score: 0, right: 0, combo: 0, stage: 0, paused: false, over: false, busy: false,
    sound: read(SOUND_KEY, 'on') !== 'off',
  };
  D.track('단어블록시작');
  D.root.innerHTML = `
    <div class="blk-top">
      <span class="blk-score" id="blkScore">0</span>
      <span class="blk-stage" id="blkStage"></span>
      <button type="button" class="blk-snd" data-blk="sound" aria-pressed="${G.sound}">${G.sound ? '🔊' : '🔇'}</button>
    </div>
    <div class="blk-board" id="blkBoard">
      <div class="blk-fall" id="blkFall"></div>
      <div class="blk-stack" id="blkStack"></div>
      <div class="blk-pop hidden" id="blkPop"></div>
    </div>
    <div class="blk-picks" id="blkPicks"></div>`;
  blkNext();
}

/* 다음 블록 — 쌓인 낱말 중 차례가 된 것(블록 3개를 기다린 것)이 먼저, 아니면 새 낱말. */
function blkNext() {
  if (!G || G.over) return;
  G.again.forEach((a) => a.wait--);
  /* 다시 떨어지는 것은 한 번 걸러 한 번만 — 안 그러면 틀린 것끼리만 돌고 새 낱말이 안 와서 판이 끝나지 않는다. */
  const ready = G.cur?.re ? -1 : G.again.findIndex((a) => a.wait <= 0);
  let w, re = false;
  if (ready >= 0) { w = G.again.splice(ready, 1)[0].w; re = true; }
  else { if (!G.deck.length) G.deck = shuffle(G.pool); w = G.deck.pop(); }
  // 보기 셋 — 같은 품사에서 뜻이 겹치지 않는 둘을 섞는다(품사가 다르면 모양만 보고 맞힌다).
  const m = mean(w);
  const same = shuffle(G.pool.filter((x) => x !== w && x.p === w.p && mean(x) !== m));
  const rest = shuffle(G.pool.filter((x) => x !== w && mean(x) !== m));
  const wrong = [];
  for (const x of [...same, ...rest]) { if (wrong.length >= 2) break; if (!wrong.some((y) => mean(y) === mean(x))) wrong.push(x); }
  G.cur = { w, re, opts: shuffle([w, ...wrong]) };
  G.y = 0; G.t0 = performance.now(); G.busy = false;
  const fall = document.getElementById('blkFall');
  fall.className = 'blk-fall' + (re ? ' re' : '');
  fall.innerHTML = `${re ? `<i>${D.esc(D.t('다시', 'again'))}</i>` : ''}<b>${D.esc(w.h)}</b>`;
  fall.style.transform = 'translateY(0)';
  document.getElementById('blkPicks').innerHTML = G.cur.opts.map((o, i) =>
    `<button type="button" class="blk-pick" data-blk-pick="${i}"><span>${i + 1}</span>${D.esc(mean(o))}</button>`).join('');
  blkMeta();
  if (!raf) raf = requestAnimationFrame(blkTick);
}

function blkMeta() {
  document.getElementById('blkScore').textContent = String(G.score);
  document.getElementById('blkStage').textContent = D.t(`${G.lv.ko} · ${G.stage + 1}단계`, `${G.lv.en} · stage ${G.stage + 1}`);
  const st = document.getElementById('blkStack');
  // 쌓인 블록은 아래에서 위로. 맨 아래가 먼저 쌓인 것이다. 뜻은 안 적는다 — 다시 떨어질 때 스스로 떠올려야 외워진다.
  st.innerHTML = G.stack.map((s) => `<div class="blk-row${s.flash ? ' flash' : ''}"><b>${D.esc(s.w.h)}</b></div>`).join('');
  G.stack.forEach((s) => { s.flash = false; });
}

/* 한 장면 — 떨어지는 블록을 내린다. 보드 높이에서 쌓인 줄만큼 뺀 곳이 바닥이다. */
function blkTick(now) {
  raf = 0;
  if (!G || G.over) return;
  const board = document.getElementById('blkBoard');
  if (!board || !board.offsetParent) { G.paused = true; return; }   // 화면이 숨으면 멈춘다
  if (G.paused) { G.paused = false; G.t0 = now - G.y * fallMs(G.stage); }
  if (!G.busy) {
    G.y = Math.min(1, (now - G.t0) / fallMs(G.stage));
    const rowH = board.clientHeight / ROWS;
    const floor = board.clientHeight - rowH * (G.stack.length + 1);
    document.getElementById('blkFall').style.transform = `translateY(${Math.max(0, floor * G.y)}px)`;
    if (G.y >= 1) { blkLand(null); }
  }
  raf = requestAnimationFrame(blkTick);
}

function blkPick(i) {
  if (!G || G.busy || G.over || !G.cur) return;
  const o = G.cur.opts[i];
  const btns = [...document.querySelectorAll('.blk-pick')];
  if (o === G.cur.w) {
    G.busy = true;
    btns[i]?.classList.add('ok');
    G.right++; G.combo++;
    G.score += 10 + Math.min(G.combo, 10) * 2 + (G.cur.re ? 10 : 0);
    G.stage = Math.floor(G.right / 10);
    // 다시 떨어진 낱말을 맞혔다 — 쌓여 있던 그 블록도 지운다.
    if (G.cur.re) { const k = G.stack.findIndex((s) => s.w === G.cur.w); if (k >= 0) G.stack.splice(k, 1); }
    if (G.sound) D.say(G.cur.w.h);
    const fall = document.getElementById('blkFall');
    fall.classList.add('pop');
    blkToast(`+ ${mean(G.cur.w)}`, 'ok');
    blkMeta();
    setTimeout(blkNext, 420);
  } else {
    btns[i]?.classList.add('no');
    btns[G.cur.opts.indexOf(G.cur.w)]?.classList.add('ok');
    blkLand(i);
  }
}

/* 블록이 쌓인다 — 틀렸거나 바닥에 닿았다. 정답을 잠깐 보여 주고, 블록 3개 뒤에 다시 떨어뜨린다. */
function blkLand(wrongIdx) {
  if (!G || G.busy) return;
  G.busy = true; G.combo = 0;
  const w = G.cur.w;
  if (!G.cur.re) G.stack.push({ w, flash: true });
  else { const s = G.stack.find((x) => x.w === w); if (s) s.flash = true; }
  G.missed.set(w.h, w);
  G.again.push({ w, wait: AGAIN_AFTER });
  if (G.sound) D.say(w.h);
  if (wrongIdx === null) document.querySelectorAll('.blk-pick')[G.cur.opts.indexOf(w)]?.classList.add('ok');
  blkToast(`${w.h} = ${mean(w)}`, 'no');
  document.getElementById('blkFall').classList.add('land');
  blkMeta();
  if (G.stack.length >= ROWS) { setTimeout(blkOver, 900); return; }
  setTimeout(blkNext, 1300);   // 정답을 읽을 틈을 준다
}

function blkToast(msg, kind) {
  const p = document.getElementById('blkPop');
  if (!p) return;
  p.textContent = msg; p.className = `blk-pop ${kind}`;
  clearTimeout(blkToast.t); blkToast.t = setTimeout(() => p.classList.add('hidden'), 1100);
}

function blkOver() {
  if (!G) return;
  G.over = true; blkStop();
  const { t, esc } = D;
  const had = parseInt(read(BEST_KEY, '0'), 10) || 0;
  if (G.score > had) write(BEST_KEY, String(G.score));
  D.track('단어블록끝');
  const miss = [...G.missed.values()];
  D.root.innerHTML = `
    <div class="blk-end">
      <div class="blk-end-score"><b>${G.score}</b><span>${esc(t('점', 'pts'))}</span></div>
      <p class="blk-end-sub">${esc(t(`맞힌 낱말 ${G.right}개`, `${G.right} words right`))}${G.score > had ? ` · ${esc(t('🏆 새 최고 기록!', '🏆 New best!'))}` : ` · ${esc(t(`최고 ${had}점`, `Best ${had}`))}`}</p>
      ${miss.length ? `
      <h3>${esc(t(`다시 볼 낱말 ${miss.length}개`, `${miss.length} words to review`))}</h3>
      <ul class="blk-miss">${miss.map((w) => `<li><button type="button" class="blk-say" data-blk-say="${esc(w.h)}" aria-label="${esc(t('듣기', 'Listen'))}">🔊</button><b>${esc(w.h)}</b><span>${esc(mean(w))}</span></li>`).join('')}</ul>
      <button type="button" class="pt-next" data-blk="save">${esc(t('📒 내 단어장에 모두 담기', '📒 Save all to my wordbook'))}</button>` : `<p>${esc(t('틀린 낱말이 없어요. 대단해요!', 'No misses. Amazing!'))}</p>`}
      <div class="blk-end-btns">
        <button type="button" class="pt-next" data-blk="start">${esc(t('한 판 더', 'Play again'))}</button>
        <button type="button" class="pt-next blk-ghost" data-blk="setup">${esc(t('난이도 바꾸기', 'Change level'))}</button>
      </div>
    </div>`;
}

/* 누르기 · 키는 한 곳에서 — 화면을 다시 그려도 손잡이가 안 늘어난다. */
export function blkBind(root) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.blkLv) {
      write(LV_KEY, b.dataset.blkLv);
      root.querySelectorAll('.blk-lv').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
      return;
    }
    if (b.dataset.blkPick) return blkPick(+b.dataset.blkPick);
    if (b.dataset.blkSay) return D.say(b.dataset.blkSay);
    const a = b.dataset.blk;
    if (a === 'start') blkStart();
    else if (a === 'setup') blkSetup();
    else if (a === 'sound' && G) { G.sound = !G.sound; write(SOUND_KEY, G.sound ? 'on' : 'off'); b.textContent = G.sound ? '🔊' : '🔇'; b.setAttribute('aria-pressed', G.sound); }
    else if (a === 'save' && G) {
      D.save([...G.missed.values()].map((w) => ({ word: w.h, meaning: mean(w), tag: w.p || null, vocab_id: w.i || w.h, source: 'blocks' })), b);
    }
  });
  addEventListener('keydown', (e) => {
    if (!G || G.over || !root.offsetParent || e.ctrlKey || e.metaKey || e.altKey) return;
    const n = { 1: 0, 2: 1, 3: 2 }[e.key];
    if (n !== undefined) { e.preventDefault(); blkPick(n); }
  });
  // 다른 탭으로 가면 멈춘다 — 돌아오면 이어서 떨어진다.
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && G && !G.over && root.offsetParent && !raf) raf = requestAnimationFrame(blkTick);
  });
}

/* 화면에 다시 들어왔을 때 판이 진행 중이면 이어서 떨어뜨린다. */
export function blkResume() { if (G && !G.over && G.cur && !raf) raf = requestAnimationFrame(blkTick); }
