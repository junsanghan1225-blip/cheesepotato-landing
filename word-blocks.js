/* ══ 게임 : 단어 감자 (#blocks) ═══════════════════════════════════
   운영자 요청(2026-10-07): 「사과 게임처럼 재미있게 — 우리는 사과 말고 감자로」 · 블록 쌓기를 이것으로 바꿈.
   판에 감자가 가득하다. 갈색 감자에는 한국어 낱말, 노란 감자에는 영어 뜻.
   - 손가락(마우스)으로 네모를 그려 **짝이 맞는 감자 둘만** 들어가게 묶으면 터진다(사과 게임의 「합이 10」 대신 「낱말 + 뜻」).
     네모 안에 다른 감자가 끼면 안 된다 — 그래서 멀리 있는 짝은 사이 감자를 먼저 치워야 묶인다(사과 게임의 맛).
   - 2분. 판을 다 비우면 +10초 · 새 판. 이어서 빨리 맞히면 콤보(점수 배수). 틀린 짝을 묶으면 −3초.
   - 막히면 「섞기」(−5초), 「힌트」(한 판에 3번).
   - 끝나면 틀렸던 낱말 「다시 볼 낱말」 + 「단어장에 담기」.
   자료는 「단어」의 TOPIK 낱말(vocab-topik1/2.js), 우리 레벨 v(감자 L1~L7)로 쉬움 · 보통 · 어려움을 가른다.
   화면 틀은 index.html #blkView, 화면 전환 · 저장 · 소리는 app.module.js 가 넘겨준다(deps). 함수 이름(blk*)은 그대로 둔다. */

const BEST_KEY = 'cp_pot_best';
const LV_KEY = 'cp_blk_lv';
const SOUND_KEY = 'cp_blk_sound';
const TIME = 120;               // 한 판 2분
const CLEAR_BONUS = 10;         // 판을 다 비우면 +10초
const WRONG_COST = 3;           // 틀린 짝 −3초
const SHUFFLE_COST = 5;
const HINTS = 3;
const COMBO_GAP = 4000;         // 4초 안에 다음 짝을 묶으면 콤보가 이어진다
const LEVELS = [
  { id: 'easy', ko: '쉬움', en: 'Easy', dko: '감자 L1~L2 · 처음 배우는 낱말', den: 'Potato L1–L2 · first words', v: [1, 2] },
  { id: 'mid', ko: '보통', en: 'Medium', dko: '감자 L3~L5 · TOPIK I 낱말', den: 'Potato L3–L5 · TOPIK I words', v: [3, 5] },
  { id: 'hard', ko: '어려움', en: 'Hard', dko: '감자 L6~L7 · TOPIK II 낱말', den: 'Potato L6–L7 · TOPIK II words', v: [6, 7] },
];
const mult = (c) => (c >= 8 ? 4 : c >= 5 ? 3 : c >= 3 ? 2 : 1);

const read = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const mean = (w) => (w.s || w.e || '').split(/[;/(]/)[0].trim();
const $ = (id) => document.getElementById(id);
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let D = null;          // deps: { root, t, esc, say, save, track, vocab() }
let G = null;          // 지금 한 판
let tick = 0;

/* ── 효과음 — 파일 없이 WebAudio 로. ── */
let AC = null;
function tone(freq, dur = 0.12, type = 'sine', vol = 0.18, when = 0, slide = 0) {
  if (!G?.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const t0 = AC.currentTime + when, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  } catch (e) {}
}
const sfx = {
  pop: (c) => { const f = 520 * Math.pow(1.06, Math.min(c, 14)); tone(f, 0.09, 'triangle', 0.2); tone(f * 1.5, 0.12, 'sine', 0.12, 0.05); },
  miss: () => { tone(180, 0.25, 'sawtooth', 0.12, 0, 0.6); },
  clear: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, 'triangle', 0.16, i * 0.08)),
  tick: () => tone(880, 0.05, 'square', 0.05),
  count: (last) => tone(last ? 880 : 440, last ? 0.3 : 0.12, 'triangle', 0.16),
  end: () => [784, 659, 523, 392].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, i * 0.12)),
  win: () => [523, 784, 1047, 1568, 2093].forEach((f, i) => tone(f, 0.12, 'sawtooth', 0.07, i * 0.05)),
  shuffle: () => [300, 400, 500].forEach((f, i) => tone(f, 0.06, 'square', 0.06, i * 0.04)),
};

export function blkMount(deps) { D = deps; blkSetup(); }

/* 화면을 떠날 때(app.module.js open) — 시계를 멈춘다. */
export function blkStop() { if (tick) clearInterval(tick); tick = 0; if (G && !G.over) G.paused = true; }

export function blkSetup() {
  blkStop(); G = null;
  const { t, esc } = D;
  const lv = read(LV_KEY, 'easy');
  const best = parseInt(read(BEST_KEY, '0'), 10) || 0;
  D.root.innerHTML = `
    <div class="blk-intro">
      <div class="pot-demo" aria-hidden="true"><span class="pot ko"><b>사과</b></span><span class="pot en"><b>apple</b></span><span class="pot ko"><b>학교</b></span></div>
      <h2>${esc(t('단어 감자', 'Word potatoes'))}</h2>
      <p>${esc(t('갈색 감자는 한국어, 노란 감자는 뜻이에요. 짝이 맞는 감자 둘만 들어가게 네모로 쓱 묶으면 터져요. 2분 동안 몇 개나 캘 수 있을까요?', 'Brown potatoes are Korean words, golden ones are meanings. Drag a box around exactly one matching pair to pop it. How many can you dig up in 2 minutes?'))}</p>
      <ul class="blk-rules">
        <li><b>🥔</b>${esc(t('네모 안에 다른 감자가 끼면 안 돼요 — 멀리 있는 짝은 사이 감자부터 치워요', 'No other potato may be inside the box — clear the ones in between first'))}</li>
        <li><b>🔥</b>${esc(t('빨리 이어 맞히면 콤보 — 점수 2배 · 3배 · 4배', 'Quick chains = combo: 2× · 3× · 4× points'))}</li>
        <li><b>⏱</b>${esc(t('판을 다 비우면 +10초 · 틀린 짝은 −3초', 'Clear the board +10s · wrong pair −3s'))}</li>
      </ul>
      <div class="blk-lvs" role="radiogroup" aria-label="${esc(t('난이도', 'Level'))}">
        ${LEVELS.map((L) => `<button type="button" role="radio" class="blk-lv${L.id === lv ? ' on' : ''}" aria-checked="${L.id === lv}" data-blk-lv="${L.id}"><b>${esc(t(L.ko, L.en))}</b><small>${esc(t(L.dko, L.den))}</small></button>`).join('')}
      </div>
      <button type="button" class="pt-next blk-go" data-blk="start">${esc(t('▶ 시작하기', '▶ Start'))}</button>
      <p class="blk-keys">${best ? esc(t(`🏆 최고 ${best}점`, `🏆 Best ${best}`)) : ''}</p>
    </div>`;
}

/* 판 크기 — 폰은 4칸 × 6줄(12쌍), 넓은 화면은 6칸 × 5줄(15쌍). 글자가 감자 안에 들어가야 한다. */
const shape = () => (D.root.clientWidth >= 560 ? [6, 5] : [4, 6]);

async function blkStart() {
  const { t, esc } = D;
  const lv = LEVELS.find((L) => L.id === read(LV_KEY, 'easy')) || LEVELS[0];
  D.root.innerHTML = `<p class="blk-wait">${esc(t('낱말을 불러오는 중…', 'Loading words…'))}</p>`;
  let all = [];
  try { all = await D.vocab(lv.id === 'hard'); } catch (e) {}
  const pool = all.filter((w) => w.v >= lv.v[0] && w.v <= lv.v[1] && mean(w) && mean(w).length <= 14 && w.h.length <= 5);
  if (pool.length < 40) { D.root.innerHTML = `<p class="blk-wait">${esc(t('낱말을 못 불러왔어요. 잠시 뒤 다시 해 주세요.', 'Could not load words. Please try again shortly.'))}</p>`; return; }
  const [cols, rows] = shape();
  G = {
    lv, pool, deck: shuffle(pool), cols, rows, cells: [], left: TIME, score: 0, pairs: 0, tries: 0, combo: 0, maxCombo: 0, lastAt: 0,
    boards: 0, hints: HINTS, missed: new Map(), paused: false, hold: true, over: false,
    best: parseInt(read(BEST_KEY, '0'), 10) || 0, beat: false, sound: read(SOUND_KEY, 'on') !== 'off',
  };
  D.track('단어블록시작');
  D.root.innerHTML = `
    <div class="blk-top">
      <div class="blk-sc"><span class="blk-score" id="blkScore">0</span><small id="blkBest"></small></div>
      <div class="blk-combo" id="blkCombo"></div>
      <button type="button" class="blk-bomb" data-blk="hint" id="blkHint">💡<b id="blkHintN">${HINTS}</b></button>
      <button type="button" class="blk-snd" data-blk="shuffle" aria-label="${esc(t('섞기', 'Shuffle'))}">🔀</button>
      <button type="button" class="blk-snd" data-blk="pause" aria-label="${esc(t('멈춤', 'Pause'))}">⏸</button>
      <button type="button" class="blk-snd" data-blk="sound" aria-pressed="${G.sound}">${G.sound ? '🔊' : '🔇'}</button>
    </div>
    <div class="pot-time"><i id="potBar"></i><span id="potTime"></span></div>
    <div class="pot-board" id="blkBoard" style="--cols:${cols};--rows:${rows}">
      <div class="pot-grid" id="potGrid"></div>
      <div class="pot-sel hidden" id="potSel"></div>
      <div class="blk-fx" id="blkFx"></div>
      <div class="blk-pop hidden" id="blkPop"></div>
      <div class="blk-banner hidden" id="blkBanner"></div>
    </div>
    <p class="pot-tip">${esc(t('짝이 맞는 두 감자를 네모로 묶어요', 'Box exactly one matching pair'))}</p>`;
  potDeal();
  blkMeta();
  blkCount(3);
}

/* 새 판 — 칸 수의 절반만큼 낱말을 뽑아 낱말 감자 · 뜻 감자를 섞어 깐다. 같은 뜻이 둘 있으면 헷갈리므로 뜻이 겹치지 않게. */
function potDeal() {
  const n = (G.cols * G.rows) / 2, pick = [], seen = new Set();
  while (pick.length < n) {
    if (!G.deck.length) G.deck = shuffle(G.pool);
    const w = G.deck.pop(), m = mean(w).toLowerCase();
    if (seen.has(m) || seen.has(w.h)) continue;
    seen.add(m); seen.add(w.h); pick.push(w);
  }
  G.cells = shuffle(pick.flatMap((w, k) => [{ k, w, ko: true }, { k, w, ko: false }]));
  G.boards++;
  potDraw(true);
  if (!potMoves().length) potShuffle(true);
}

function potDraw(fresh) {
  const { esc } = D;
  $('potGrid').innerHTML = G.cells.map((c, i) => c ? `<div class="pot ${c.ko ? 'ko' : 'en'}${fresh && !calm() ? ' in' : ''}" data-i="${i}" style="--d:${(i % 7) * 25}ms"><b>${esc(c.ko ? c.w.h : mean(c.w))}</b></div>` : `<div class="pot-hole" data-i="${i}"></div>`).join('');
}

/* 지금 묶을 수 있는 짝들 — 두 감자를 감싸는 가장 작은 네모 안에 다른 감자가 없으면 된다. */
function potMoves() {
  const out = [], C = G.cols;
  const live = G.cells.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
  for (const a of live) for (const b of live) {
    if (b <= a || G.cells[a].k !== G.cells[b].k) continue;
    const r0 = Math.min(Math.floor(a / C), Math.floor(b / C)), r1 = Math.max(Math.floor(a / C), Math.floor(b / C));
    const c0 = Math.min(a % C, b % C), c1 = Math.max(a % C, b % C);
    let clean = true;
    for (let r = r0; r <= r1 && clean; r++) for (let c = c0; c <= c1; c++) { const i = r * C + c; if (i !== a && i !== b && G.cells[i]) { clean = false; break; } }
    if (clean) out.push([a, b]);
  }
  return out;
}

/* 섞기 — 남은 감자를 빈칸까지 다시 흩는다. 묶을 짝이 하나도 없으면 저절로 섞는다(무료). */
function potShuffle(free) {
  for (let n = 0; n < 30; n++) {
    G.cells = shuffle(G.cells);
    if (potMoves().length) break;
  }
  if (!free) { G.left = Math.max(1, G.left - SHUFFLE_COST); blkBanner(D.t(`🔀 섞기 −${SHUFFLE_COST}초`, `🔀 Shuffle −${SHUFFLE_COST}s`), 'boom', 700); }
  sfx.shuffle();
  potDraw(true); blkMeta();
}

function blkMeta() {
  const { t, esc } = D;
  $('blkScore').textContent = String(G.score);
  $('blkBest').textContent = G.best ? (G.beat ? t('🏆 신기록 중!', '🏆 New record!') : t(`최고 ${G.best}`, `Best ${G.best}`)) : '';
  const m = mult(G.combo);
  const cb = $('blkCombo');
  cb.className = `blk-combo${G.combo >= 2 ? ' on' : ''}${m === 4 ? ' fever' : ''}`;
  cb.innerHTML = G.combo >= 2 ? `<b>${G.combo}</b> ${esc(t('콤보', 'combo'))}${m > 1 ? ` <i>×${m}</i>` : ''}` : '';
  $('blkHintN').textContent = String(G.hints);
  $('blkHint').disabled = !G.hints;
  $('potBar').style.width = `${Math.min(100, (G.left / TIME) * 100)}%`;
  $('potTime').textContent = `${Math.floor(G.left / 60)}:${String(G.left % 60).padStart(2, '0')}`;
  $('blkBoard').classList.toggle('hurry', G.left <= 10);
  $('blkBoard').classList.toggle('fever', m === 4);
}

/* 3 · 2 · 1 · 시작! */
function blkCount(n) {
  if (!G || G.over) return;
  G.hold = true;
  blkBanner(n ? String(n) : D.t('시작!', 'GO!'), n ? 'count' : 'go', 650);
  sfx.count(!n);
  if (n) setTimeout(() => blkCount(n - 1), 650);
  else setTimeout(() => { if (G) { G.hold = false; potClock(); } }, 400);
}

function potClock() {
  if (tick) clearInterval(tick);
  tick = setInterval(() => {
    if (!G || G.over) { clearInterval(tick); tick = 0; return; }
    if (G.hold || G.paused || !$('blkBoard')?.offsetParent || document.visibilityState !== 'visible') return;
    G.left--;
    if (G.left <= 10 && G.left > 0) sfx.tick();
    blkMeta();
    if (G.left <= 0) blkOver();
  }, 1000);
}

/* ── 네모 그리기 — 누른 곳에서 뗀 곳까지. 감자 가운데가 네모 안에 들면 묶인 것. ── */
let drag = null;
function potCellsIn(x0, y0, x1, y1) {
  const L = Math.min(x0, x1), R = Math.max(x0, x1), T = Math.min(y0, y1), B = Math.max(y0, y1);
  const b = $('blkBoard').getBoundingClientRect(), out = [];
  $('potGrid').querySelectorAll('.pot').forEach((el) => {
    const r = el.getBoundingClientRect(), cx = r.left - b.left + r.width / 2, cy = r.top - b.top + r.height / 2;
    if (cx >= L && cx <= R && cy >= T && cy <= B) out.push(+el.dataset.i);
  });
  return out;
}
function potSelDraw(x0, y0, x1, y1, ids) {
  const s = $('potSel');
  s.classList.remove('hidden');
  s.style.left = `${Math.min(x0, x1)}px`; s.style.top = `${Math.min(y0, y1)}px`;
  s.style.width = `${Math.abs(x1 - x0)}px`; s.style.height = `${Math.abs(y1 - y0)}px`;
  const ok = ids.length === 2 && G.cells[ids[0]].k === G.cells[ids[1]].k;
  s.className = `pot-sel${ids.length > 2 ? ' many' : ok ? ' ok' : ''}`;
  $('potGrid').querySelectorAll('.pot').forEach((el) => el.classList.toggle('sel', ids.includes(+el.dataset.i)));
}
function potRelease(ids) {
  $('potSel').classList.add('hidden');
  $('potGrid').querySelectorAll('.pot.sel').forEach((el) => el.classList.remove('sel'));
  if (!G || G.over || G.hold || G.paused) return;
  if (ids.length !== 2) {
    // 감자 하나만 눌렀다 — 낱말이면 소리를 들려준다(외우는 데 도움)
    if (ids.length === 1 && G.cells[ids[0]].ko && G.sound) D.say(G.cells[ids[0]].w.h);
    return;
  }
  const [a, b] = ids, A = G.cells[a], B = G.cells[b];
  G.tries++;
  if (A.k === B.k) potPop(a, b);
  else potWrong(a, b);
}

function potPop(a, b) {
  const w = G.cells[a].w, now = performance.now();
  G.combo = now - G.lastAt <= COMBO_GAP ? G.combo + 1 : 1;
  G.lastAt = now; G.maxCombo = Math.max(G.maxCombo, G.combo);
  const pts = 10 * mult(G.combo);
  G.score += pts; G.pairs++;
  sfx.pop(G.combo);
  if (G.sound) D.say(w.h);
  const els = [a, b].map((i) => $('potGrid').querySelector(`[data-i="${i}"]`));
  els.forEach((el) => potBurst(el));
  potFloat(els[0], `+${pts}`);
  blkToast(`${w.h} = ${mean(w)}`, 'ok');
  els.forEach((el) => el?.classList.add('gone'));
  G.cells[a] = null; G.cells[b] = null;
  if (G.combo === 5) blkBanner(D.t('🔥 콤보 5! 점수 3배', '🔥 Combo 5! 3× points'), 'fever', 900);
  if (G.best && !G.beat && G.score > G.best) { G.beat = true; blkBanner(D.t('🏆 최고 기록 돌파!', '🏆 New best score!'), 'up'); }
  blkMeta();
  setTimeout(() => {
    if (!G || G.over) return;
    if (G.cells.every((c) => !c)) {
      G.left += CLEAR_BONUS; G.score += 50;
      sfx.clear(); blkBanner(D.t(`🥔 다 캤다! +${CLEAR_BONUS}초 · +50`, `🥔 Cleared! +${CLEAR_BONUS}s · +50`), 'up', 1100);
      setTimeout(() => { if (G && !G.over) { potDeal(); blkMeta(); } }, 700);
      return;
    }
    potDraw(false);
    if (!potMoves().length) setTimeout(() => G && !G.over && potShuffle(true), 300);
  }, 260);
}

function potWrong(a, b) {
  G.combo = 0;
  G.left = Math.max(1, G.left - WRONG_COST);
  sfx.miss();
  [a, b].forEach((i) => { const c = G.cells[i]; G.missed.set(c.w.h, c.w); });
  const ko = [a, b].map((i) => G.cells[i]).find((c) => c.ko);
  blkToast(ko ? `${ko.w.h} = ${mean(ko.w)}` : D.t(`짝이 아니에요 −${WRONG_COST}초`, `Not a pair −${WRONG_COST}s`), 'no');
  [a, b].forEach((i) => { const el = $('potGrid').querySelector(`[data-i="${i}"]`); if (el) { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); } });
  const bd = $('blkBoard');
  if (!calm()) { bd.classList.remove('shake'); void bd.offsetWidth; bd.classList.add('shake'); }
  blkMeta();
}

function potHint() {
  if (!G || G.over || G.hold || !G.hints) return;
  const m = potMoves();
  if (!m.length) return potShuffle(true);
  G.hints--;
  const [a, b] = m[Math.floor(Math.random() * m.length)];
  [a, b].forEach((i) => $('potGrid').querySelector(`[data-i="${i}"]`)?.classList.add('hint'));
  // 힌트로 찾은 낱말도 「다시 볼 낱말」에 — 혼자 못 찾았으니까
  G.missed.set(G.cells[a].w.h, G.cells[a].w);
  blkMeta();
}

function potBurst(el) {
  const fx = $('blkFx'), board = $('blkBoard');
  if (!fx || !board || !el || calm()) return;
  const b = board.getBoundingClientRect(), r = el.getBoundingClientRect();
  const x = r.left - b.left + r.width / 2, y = r.top - b.top + r.height / 2;
  let html = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.5, d = 30 + Math.random() * 45;
    html += `<s class="${el.classList.contains('ko') ? 'cn' : 'cx'}" style="left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px"></s>`;
  }
  fx.insertAdjacentHTML('beforeend', html);
  setTimeout(() => fx.querySelectorAll('s').forEach((s, i) => i < 10 && s.remove()), 700);
}
function potFloat(el, txt) {
  const fx = $('blkFx'), board = $('blkBoard');
  if (!fx || !board || !el) return;
  const b = board.getBoundingClientRect(), r = el.getBoundingClientRect();
  const u = document.createElement('u');
  u.className = 'blk-float'; u.textContent = txt;
  u.style.left = `${r.left - b.left + r.width / 2}px`; u.style.top = `${r.top - b.top}px`;
  fx.appendChild(u);
  setTimeout(() => u.remove(), 1000);
}
function blkBanner(txt, kind, ms = 1300) {
  const el = $('blkBanner');
  if (!el) return;
  el.textContent = txt; el.className = `blk-banner ${kind}`;
  clearTimeout(blkBanner.t); blkBanner.t = setTimeout(() => el.classList.add('hidden'), ms);
}
function blkToast(msg, kind) {
  const p = $('blkPop');
  if (!p) return;
  p.textContent = msg; p.className = `blk-pop ${kind}`;
  clearTimeout(blkToast.t); blkToast.t = setTimeout(() => p.classList.add('hidden'), 1300);
}

function blkPause() {
  if (!G || G.over || G.hold && !G.paused) return;
  const { t, esc } = D;
  G.paused = !G.paused;
  if (G.paused) $('blkBoard').insertAdjacentHTML('beforeend', `<div class="blk-paused"><b>⏸ ${esc(t('잠깐 멈춤', 'Paused'))}</b><button type="button" class="pt-next" data-blk="pause">${esc(t('▶ 이어서 하기', '▶ Resume'))}</button></div>`);
  else document.querySelector('.blk-paused')?.remove();
}

/* 등급 — 캔 짝 수와 정확도. */
function blkGrade() {
  const acc = G.tries ? G.pairs / G.tries : 0;
  if (G.pairs >= 30 && acc >= 0.9) return ['S', '🏆'];
  if (G.pairs >= 20 && acc >= 0.8) return ['A', '🥇'];
  if (G.pairs >= 10 && acc >= 0.65) return ['B', '🥈'];
  return ['C', '🥉'];
}

function blkOver() {
  if (!G || G.over) return;
  G.over = true; blkStop();
  const { t, esc } = D;
  const had = G.best, rec = G.score > had;
  if (rec) write(BEST_KEY, String(G.score));
  D.track('단어블록끝');
  const miss = [...G.missed.values()];
  const [gr, gi] = blkGrade();
  const acc = G.tries ? Math.round((G.pairs / G.tries) * 100) : 0;
  rec ? sfx.win() : sfx.end();
  D.root.innerHTML = `
    <div class="blk-end">
      ${rec ? `<div class="blk-confetti" aria-hidden="true">${Array.from({ length: 40 }, (_, i) => `<s style="left:${(i * 37) % 100}%;--d:${(i % 7) * 0.15}s;--c:${i % 5}"></s>`).join('')}</div>` : ''}
      <p class="pot-end-h">⏰ ${esc(t('시간 끝!', 'Time’s up!'))}</p>
      <div class="blk-grade g-${gr}"><span>${gi}</span><b>${gr}</b></div>
      <div class="blk-end-score"><b id="blkEndN">0</b><span>${esc(t('점', 'pts'))}</span></div>
      <p class="blk-end-sub">${rec ? esc(t('🏆 새 최고 기록!', '🏆 New best!')) : had ? esc(t(`최고 ${had}점`, `Best ${had}`)) : ''}</p>
      <div class="blk-stats">
        <div><b>${G.pairs}</b><small>${esc(t('캔 감자 짝', 'Pairs'))}</small></div>
        <div><b>${acc}%</b><small>${esc(t('정확도', 'Accuracy'))}</small></div>
        <div><b>${G.maxCombo}</b><small>${esc(t('최대 콤보', 'Best combo'))}</small></div>
        <div><b>${G.boards - 1}</b><small>${esc(t('🥔 다 캔 판', '🥔 Boards'))}</small></div>
      </div>
      ${miss.length ? `
      <h3>${esc(t(`다시 볼 낱말 ${miss.length}개`, `${miss.length} words to review`))}</h3>
      <ul class="blk-miss">${miss.map((w) => `<li><button type="button" class="blk-say" data-blk-say="${esc(w.h)}" aria-label="${esc(t('듣기', 'Listen'))}">🔊</button><b>${esc(w.h)}</b><span>${esc(mean(w))}</span></li>`).join('')}</ul>
      <button type="button" class="pt-next" data-blk="save">${esc(t('📒 내 단어장에 모두 담기', '📒 Save all to my wordbook'))}</button>` : `<p>${esc(t('틀린 짝이 없어요. 대단해요!', 'No wrong pairs. Amazing!'))}</p>`}
      <div class="blk-end-btns">
        <button type="button" class="pt-next" data-blk="start">${esc(t('🔁 한 판 더', '🔁 Play again'))}</button>
        <button type="button" class="pt-next blk-ghost" data-blk="setup">${esc(t('난이도 바꾸기', 'Change level'))}</button>
      </div>
    </div>`;
  const el = $('blkEndN'), goal = G.score, t0 = performance.now();
  const roll = (now) => { const k = Math.min(1, (now - t0) / 900); el.textContent = String(Math.round(goal * (1 - Math.pow(1 - k, 3)))); if (k < 1 && el.isConnected) requestAnimationFrame(roll); };
  requestAnimationFrame(roll);
}

/* 누르기 · 끌기 · 키는 한 곳에서 — 화면을 다시 그려도 손잡이가 안 늘어난다. */
export function blkBind(root) {
  root.addEventListener('pointerdown', (e) => {
    const board = e.target.closest('#blkBoard');
    if (!board || e.target.closest('button') || !G || G.over) return;
    e.preventDefault();
    const b = board.getBoundingClientRect();
    drag = { x0: e.clientX - b.left, y0: e.clientY - b.top, ids: [] };
    try { board.setPointerCapture(e.pointerId); } catch (err) {}
    drag.ids = potCellsIn(drag.x0, drag.y0, drag.x0, drag.y0);
    // 누른 감자 하나는 네모가 작아도 잡히게 — 손가락 끝이 감자 가운데를 안 덮어도
    const p = e.target.closest('.pot');
    if (p && !drag.ids.length) drag.ids = [+p.dataset.i];
    drag.tap = p ? +p.dataset.i : null;
  });
  root.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const b = $('blkBoard').getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top;
    drag.ids = potCellsIn(drag.x0, drag.y0, x, y);
    if (drag.tap != null && !drag.ids.includes(drag.tap)) drag.ids.unshift(drag.tap);
    potSelDraw(drag.x0, drag.y0, x, y, drag.ids);
  });
  const end = () => { if (!drag) return; const ids = drag.ids; drag = null; potRelease(ids); };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', () => { drag = null; $('potSel')?.classList.add('hidden'); });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.blkLv) {
      write(LV_KEY, b.dataset.blkLv);
      root.querySelectorAll('.blk-lv').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
      return;
    }
    if (b.dataset.blkSay) return D.say(b.dataset.blkSay);
    const a = b.dataset.blk;
    if (a === 'start') blkStart();
    else if (a === 'setup') blkSetup();
    else if (a === 'hint') potHint();
    else if (a === 'shuffle' && G && !G.over && !G.hold) potShuffle(false);
    else if (a === 'pause') blkPause();
    else if (a === 'sound' && G) { G.sound = !G.sound; write(SOUND_KEY, G.sound ? 'on' : 'off'); b.textContent = G.sound ? '🔊' : '🔇'; b.setAttribute('aria-pressed', G.sound); }
    else if (a === 'save' && G) {
      D.save([...G.missed.values()].map((w) => ({ word: w.h, meaning: mean(w), tag: w.p || null, vocab_id: w.i || w.h, source: 'blocks' })), b);
    }
  });
  addEventListener('keydown', (e) => {
    if (!G || G.over || !root.offsetParent || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '')) return;
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { e.preventDefault(); blkPause(); }
    else if (e.key === 'h' || e.key === 'H') { e.preventDefault(); potHint(); }
  });
}

/* 화면에 다시 들어왔을 때 판이 진행 중이면 이어서 센다. */
export function blkResume() { if (G && !G.over && !G.hold) { G.paused = false; document.querySelector('.blk-paused')?.remove(); potClock(); } }
