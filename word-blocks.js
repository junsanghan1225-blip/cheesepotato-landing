/* ══ 게임 : 단어 블록 쌓기 (#blocks) ═══════════════════════════════
   운영자 요청(2026-10-06): 「블록 쌓기나 뿌요뿌요 … 단어를 외우기 위해 최적화」.
   위에서 한국어 낱말 블록이 떨어지고, 아래 뜻 셋 중 하나를 고른다.
   - 맞히면 블록이 터지고 소리가 난다(듣기 + 뜻 + 글자를 한 번에 묶는다).
   - 틀리거나 바닥까지 떨어지면 그 자리에 쌓인다. 쌓인 것이 천장에 닿으면 끝.
   - 쌓인 낱말은 블록 몇 개 뒤에 「다시」 떨어진다 — 이번에 맞히면 쌓인 블록도 같이 사라진다.
     틀린 것을 곧 다시 꺼내 보는 것(간격 두고 다시 떠올리기)이 외우기에 가장 잘 듣는다.
   - 끝나면 틀린 낱말 목록 + 「단어장에 담기」.
   자료는 「단어」의 TOPIK 낱말(vocab-topik1/2.js), 우리 레벨 v(감자 L1~L7)로 쉬움 · 보통 · 어려움을 가른다.
   운영자 요청(2026-10-07): 「이게 게임이냐 — 게임 같은 재미 요소도 있어야지」 → 콤보 배수 · 피버 · 폭탄 ·
   황금 블록 · 번개 보너스 · 단계 올림 · 위험 경고 · 효과음(WebAudio) · 터짐 조각 · 등급 · 최고 기록 축하.
   화면 틀은 index.html #blkView, 화면 전환 · 저장 · 소리는 app.module.js 가 넘겨준다(deps). */

const ROWS = 8;                 // 천장까지 쌓을 수 있는 줄 수
const COLS = 4;                 // 칸 — 블록은 낱말 길이만큼 1~3칸을 차지하고 아무 칸에나 떨어진다(테트리스처럼)
/* 낱말 길이로 블록 폭 — 짧은 낱말은 1칸, 긴 낱말은 3칸. 칸이 들쭉날쭉해야 줄을 채우는 맛이 난다. */
const widthOf = (h) => (h.length <= 2 ? 1 : h.length <= 4 ? 2 : 3);
const BEST_KEY = 'cp_blk_best';
const LV_KEY = 'cp_blk_lv';
const SOUND_KEY = 'cp_blk_sound';
const AGAIN_AFTER = 3;          // 틀린 낱말은 블록 3개 뒤에 다시 떨어진다
const BOMB_EVERY = 5;           // 콤보 5마다 폭탄 하나(쌓인 맨 아래 줄을 날린다)
const BOMB_MAX = 3;
const GOLD_ODDS = 0.12;         // 새 낱말 중 황금 블록(점수 3배)
const FAST = 0.3;               // 떨어지는 길의 30% 안에 맞히면 「번개」 보너스
const LEVELS = [
  { id: 'easy', ko: '쉬움', en: 'Easy', dko: '감자 L1~L2 · 처음 배우는 낱말', den: 'Potato L1–L2 · first words', v: [1, 2] },
  { id: 'mid', ko: '보통', en: 'Medium', dko: '감자 L3~L5 · TOPIK I 낱말', den: 'Potato L3–L5 · TOPIK I words', v: [3, 5] },
  { id: 'hard', ko: '어려움', en: 'Hard', dko: '감자 L6~L7 · TOPIK II 낱말', den: 'Potato L6–L7 · TOPIK II words', v: [6, 7] },
];
/* 품사마다 블록 색 — 색만 보고도 「움직임 말이구나」 하고 감을 잡게. 보기 셋도 같은 품사에서 고르므로 색이 답을 알려 주지는 않는다. */
const POS = { '명사': 'n', '의존 명사': 'n', '대명사': 'n', '수사': 'n', '동사': 'v', '형용사': 'a', '부사': 'd' };
/* 콤보 배수 — 3 · 6 · 10 에서 오른다. 10 부터는 「피버」(배경이 달아오르고 5배). */
const mult = (c) => (c >= 10 ? 5 : c >= 6 ? 3 : c >= 3 ? 2 : 1);

const read = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const mean = (w) => (w.s || w.e || '').split(/[;/]/)[0].trim();
const $ = (id) => document.getElementById(id);
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let D = null;          // deps: { root, t, esc, say, save, track, vocab() }
let G = null;          // 지금 한 판
let raf = 0;

/* 판 하나의 속도 — 맞힌 수 10개마다 한 단계. 떨어지는 데 9초에서 시작해 3.5초까지 빨라진다. */
/* 운영자 2026-10-07 「더 빨리 내려오게」 — 6초에서 시작해 단계마다 0.6초씩, 2.4초까지. */
const fallMs = (stage) => Math.max(2400, 6000 - stage * 600);

/* 쌓인 블록 — { w, x, wd, row }. 칸마다 높이를 세어 그 위에 앉힌다(블록 아래 빈칸은 그대로 — 테트리스처럼). */
const colH = (stack, x, wd) => { let h = 0; for (const s of stack) if (s.x < x + wd && x < s.x + s.wd) h = Math.max(h, s.row + 1); return h; };
function settle(stack) {
  const out = [];
  [...stack].sort((a, b) => a.row - b.row).forEach((s) => { s.row = colH(out, s.x, s.wd); out.push(s); });
  return out;
}
/* 꽉 찬 줄을 지운다 — 몇 줄을 지웠는지 돌려준다. */
function clearLines() {
  let n = 0;
  for (let r = 0; r < ROWS; r++) {
    const fill = G.stack.filter((s) => s.row === r).reduce((a, s) => a + s.wd, 0);
    if (fill >= COLS) { G.stack = settle(G.stack.filter((s) => s.row !== r)); n++; r = -1; }
  }
  return n;
}
const topH = () => G.stack.reduce((m, s) => Math.max(m, s.row + 1), 0);

/* ── 효과음 — 파일 없이 WebAudio 로 만든다(받을 것이 없어 바로 울린다). ── */
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
  // 콤보가 오를수록 음이 올라간다 — 이어 맞히는 맛
  pop: (c) => { const f = 520 * Math.pow(1.06, Math.min(c, 16)); tone(f, 0.09, 'triangle', 0.2); tone(f * 1.5, 0.12, 'sine', 0.12, 0.05); },
  gold: () => [880, 1109, 1319, 1760].forEach((f, i) => tone(f, 0.12, 'triangle', 0.14, i * 0.05)),
  miss: () => { tone(180, 0.25, 'sawtooth', 0.12, 0, 0.6); tone(120, 0.3, 'square', 0.06, 0.05, 0.7); },
  land: () => tone(140, 0.16, 'square', 0.1, 0, 0.5),
  up: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.16, i * 0.09)),
  bomb: () => { tone(90, 0.5, 'sawtooth', 0.22, 0, 0.3); tone(60, 0.6, 'square', 0.12, 0.03, 0.4); },
  get: () => [660, 990].forEach((f, i) => tone(f, 0.1, 'square', 0.08, i * 0.07)),
  count: (last) => tone(last ? 880 : 440, last ? 0.3 : 0.12, 'triangle', 0.16),
  fever: () => [523, 784, 1047, 1568, 2093].forEach((f, i) => tone(f, 0.12, 'sawtooth', 0.07, i * 0.05)),
};

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
      <div class="blk-demo" aria-hidden="true"><span class="p-n">사과</span><span class="p-v">먹다</span><span class="gold">⭐ 맛있다</span></div>
      <h2>${esc(t('단어 블록 쌓기', 'Word blocks'))}</h2>
      <p>${esc(t('떨어지는 낱말의 뜻을 바닥에 닿기 전에 고르세요. 틀리면 쌓이고, 천장에 닿으면 끝!', 'Pick the meaning before the word lands. Misses stack up — hit the ceiling and it’s over!'))}</p>
      <ul class="blk-rules">
        <li><b>🔥</b>${esc(t('이어 맞히면 콤보 — 점수 2배 · 3배, 10콤보면 피버 5배', 'Chain answers for combos — 2× · 3×, 10 in a row = FEVER 5×'))}</li>
        <li><b>🧱</b>${esc(t('틀린 블록이 한 줄을 꽉 채우면 줄이 지워져요 — ← → 로 옮겨 자리를 노려요', 'Missed blocks that fill a row clear it — move with ← → to aim'))}</li>
        <li><b>💣</b>${esc(t('5콤보마다 폭탄 — 맨 아래 줄을 날려요', 'Every 5 combo = a bomb that blasts the bottom row'))}</li>
        <li><b>⭐</b>${esc(t('황금 블록은 3배 · 빨리 맞히면 ⚡번개 보너스', 'Gold blocks score 3× · answer fast for a ⚡ bonus'))}</li>
      </ul>
      <div class="blk-lvs" role="radiogroup" aria-label="${esc(t('난이도', 'Level'))}">
        ${LEVELS.map((L) => `<button type="button" role="radio" class="blk-lv${L.id === lv ? ' on' : ''}" aria-checked="${L.id === lv}" data-blk-lv="${L.id}"><b>${esc(t(L.ko, L.en))}</b><small>${esc(t(L.dko, L.den))}</small></button>`).join('')}
      </div>
      <button type="button" class="pt-next blk-go" data-blk="start">${esc(t('▶ 시작하기', '▶ Start'))}</button>
      <p class="blk-keys">${esc(t('PC: 1 · 2 · 3 고르기 · ← → 옮기기 · B 폭탄 · P 멈춤 / 폰: 판 왼쪽 · 오른쪽을 눌러 옮기기', 'Computer: 1 · 2 · 3 pick · ← → move · B bomb · P pause / Phone: tap left · right of the board to move'))}${best ? ` · ${esc(t(`🏆 최고 ${best}점`, `🏆 Best ${best}`))}` : ''}</p>
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
    cur: null, y: 0, t0: 0, score: 0, shown: 0, right: 0, tries: 0, combo: 0, maxCombo: 0, stage: 0,
    bombs: 0, bombsUsed: 0, lines: 0, golds: 0, fasts: 0, paused: false, hold: false, over: false, busy: false,
    best: parseInt(read(BEST_KEY, '0'), 10) || 0, beat: false,
    sound: read(SOUND_KEY, 'on') !== 'off',
  };
  D.track('단어블록시작');
  D.root.innerHTML = `
    <div class="blk-top">
      <div class="blk-sc"><span class="blk-score" id="blkScore">0</span><small id="blkBest"></small></div>
      <div class="blk-combo" id="blkCombo"></div>
      <button type="button" class="blk-bomb" id="blkBomb" data-blk="bomb" disabled>💣<b id="blkBombN">0</b></button>
      <button type="button" class="blk-snd" data-blk="pause" aria-label="${esc(t('멈춤', 'Pause'))}">⏸</button>
      <button type="button" class="blk-snd" data-blk="sound" aria-pressed="${G.sound}">${G.sound ? '🔊' : '🔇'}</button>
    </div>
    <div class="blk-meter"><i id="blkMeter"></i><span id="blkStage"></span></div>
    <div class="blk-board" id="blkBoard">
      <div class="blk-danger" id="blkDanger">${esc(t('⚠ 위험! 천장이 가까워요', '⚠ Danger! Near the top'))}</div>
      <div class="blk-fall" id="blkFall"></div>
      <div class="blk-stack" id="blkStack"></div>
      <div class="blk-fx" id="blkFx"></div>
      <div class="blk-pop hidden" id="blkPop"></div>
      <div class="blk-banner hidden" id="blkBanner"></div>
    </div>
    <div class="blk-picks" id="blkPicks"></div>`;
  blkMeta();
  blkCount(3);
}

/* 3 · 2 · 1 · 시작! — 판이 갑자기 시작되지 않게. */
function blkCount(n) {
  if (!G || G.over) return;
  G.hold = true;
  blkBanner(n ? String(n) : D.t('시작!', 'GO!'), n ? 'count' : 'go', 650);
  sfx.count(!n);
  if (n) setTimeout(() => blkCount(n - 1), 650);
  else setTimeout(() => { if (G) { G.hold = false; blkNext(); } }, 450);
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
  const gold = !re && G.right >= 3 && Math.random() < GOLD_ODDS;
  const wd = widthOf(w.h);
  G.cur = { w, re, gold, wd, x: Math.floor(Math.random() * (COLS - wd + 1)), opts: shuffle([w, ...wrong]) };
  G.y = 0; G.t0 = performance.now(); G.busy = false;
  const fall = $('blkFall');
  fall.className = `blk-fall w${widthOf(w.h)} p-${POS[w.p] || 'x'}${re ? ' re' : ''}${gold ? ' gold' : ''}`;
  fall.innerHTML = `${re ? `<i>${D.esc(D.t('다시', 'again'))}</i>` : gold ? '<i>⭐ ×3</i>' : ''}<b>${D.esc(w.h)}</b><em>${D.esc(w.p || '')}</em>`;
  fall.style.transform = 'translateY(0)';
  blkPlace();
  $('blkPicks').innerHTML = G.cur.opts.map((o, i) =>
    `<button type="button" class="blk-pick" data-blk-pick="${i}"><span>${i + 1}</span>${D.esc(mean(o))}</button>`).join('');
  blkMeta();
  if (!raf) raf = requestAnimationFrame(blkTick);
}

/* 떨어지는 블록의 칸 자리. */
function blkPlace() {
  const f = $('blkFall');
  f.style.left = `calc(${(G.cur.x * 100) / COLS}% + 3px)`; f.style.width = `calc(${(G.cur.wd * 100) / COLS}% - 6px)`;
}
/* ← → 로 옮기기 — 옆이 이미 높게 쌓여 지금 높이보다 위면 못 간다. */
function blkMove(d) {
  if (!G || G.busy || G.over || G.hold || !G.cur) return;
  const x = G.cur.x + d;
  if (x < 0 || x + G.cur.wd > COLS) return;
  const board = $('blkBoard'), rowH = board.clientHeight / ROWS;
  const nowRow = ROWS - 1 - Math.ceil(parseFloat(($('blkFall').style.transform.match(/[\d.]+/) || [0])[0]) / rowH - 0.01);
  if (colH(G.stack, x, G.cur.wd) > nowRow) return;
  G.cur.x = x; blkPlace(); tone(300, 0.04, 'square', 0.05);
}

function blkMeta() {
  const { t, esc } = D;
  $('blkStage').textContent = t(`${G.lv.ko} · ${G.stage + 1}단계 · 다음 단계까지 ${10 - (G.right % 10)}`, `${G.lv.en} · stage ${G.stage + 1} · ${10 - (G.right % 10)} to next`);
  $('blkMeter').style.width = `${(G.right % 10) * 10}%`;
  $('blkBest').textContent = G.best ? (G.beat ? t('🏆 신기록 중!', '🏆 New record!') : t(`최고 ${G.best}`, `Best ${G.best}`)) : '';
  const m = mult(G.combo);
  const cb = $('blkCombo');
  cb.className = `blk-combo${G.combo >= 3 ? ' on' : ''}${m === 5 ? ' fever' : ''}`;
  cb.innerHTML = G.combo >= 2 ? `<b>${G.combo}</b> ${esc(t('콤보', 'combo'))}${m > 1 ? ` <i>×${m}</i>` : ''}` : '';
  $('blkBomb').disabled = !G.bombs;
  $('blkBombN').textContent = String(G.bombs);
  $('blkBoard').classList.toggle('fever', m === 5);
  $('blkBoard').classList.toggle('danger', topH() >= ROWS - 3);
  const st = $('blkStack');
  // 쌓인 블록은 아래에서 위로. 맨 아래가 먼저 쌓인 것이다. 뜻은 안 적는다 — 다시 떨어질 때 스스로 떠올려야 외워진다.
  st.innerHTML = G.stack.map((s) => `<div class="blk-row w${s.wd} p-${POS[s.w.p] || 'x'}${s.flash ? ' flash' : ''}" style="left:calc(${(s.x * 100) / COLS}% + 3px);width:calc(${(s.wd * 100) / COLS}% - 6px);bottom:calc(${(s.row * 100) / ROWS}% + 2px)"><b>${esc(s.w.h)}</b></div>`).join('');
  G.stack.forEach((s) => { s.flash = false; });
}

/* 점수는 한 번에 바뀌지 않고 올라가며 센다 — 오르는 맛. */
function blkScoreRoll() {
  const el = $('blkScore');
  if (!el || !G) return;
  if (G.shown < G.score) { G.shown = Math.min(G.score, G.shown + Math.max(1, Math.ceil((G.score - G.shown) / 6))); el.textContent = String(G.shown); el.classList.add('bump'); }
  else el.classList.remove('bump');
}

/* 한 장면 — 떨어지는 블록을 내린다. 보드 높이에서 쌓인 줄만큼 뺀 곳이 바닥이다. */
function blkTick(now) {
  raf = 0;
  if (!G || G.over) return;
  const board = $('blkBoard');
  if (!board || !board.offsetParent) { G.paused = true; return; }   // 화면이 숨으면 멈춘다
  blkScoreRoll();
  if (G.hold) { G.t0 = now - G.y * fallMs(G.stage); raf = requestAnimationFrame(blkTick); return; }
  if (G.paused) { G.paused = false; G.t0 = now - G.y * fallMs(G.stage); }
  if (!G.busy && G.cur) {
    G.y = Math.min(1, (now - G.t0) / fallMs(G.stage));
    const rowH = board.clientHeight / ROWS;
    const floor = board.clientHeight - rowH * (colH(G.stack, G.cur.x, G.cur.wd) + 1);
    $('blkFall').style.transform = `translateY(${Math.max(0, floor * G.y)}px)`;
    if (G.y >= 1) { blkLand(null); }
  }
  raf = requestAnimationFrame(blkTick);
}

/* 터짐 조각 · 떠오르는 점수 — 블록이 있던 자리에서. */
function blkBurst(cls, n = 14) {
  const fx = $('blkFx'), board = $('blkBoard'), fall = $('blkFall');
  if (!fx || !board || !fall || calm()) return;
  const b = board.getBoundingClientRect(), r = fall.getBoundingClientRect();
  const x = r.left - b.left + r.width / 2, y = r.top - b.top + r.height / 2;
  let html = '';
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4, d = 50 + Math.random() * 70;
    html += `<s class="${cls}" style="left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px"></s>`;
  }
  fx.insertAdjacentHTML('beforeend', html);
  setTimeout(() => { fx.querySelectorAll(`s.${cls}`).forEach((s, i) => i < n && s.remove()); }, 700);
}
function blkFloat(txt, kind) {
  const fx = $('blkFx'), board = $('blkBoard'), fall = $('blkFall');
  if (!fx || !board || !fall) return;
  const b = board.getBoundingClientRect(), r = fall.getBoundingClientRect();
  const el = document.createElement('u');
  el.className = `blk-float ${kind || ''}`;
  el.textContent = txt;
  el.style.left = `${r.left - b.left + r.width / 2}px`; el.style.top = `${r.top - b.top}px`;
  fx.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
function blkShake(big) {
  const b = $('blkBoard');
  if (!b || calm()) return;
  b.classList.remove('shake', 'shake2'); void b.offsetWidth; b.classList.add(big ? 'shake2' : 'shake');
}
function blkBanner(txt, kind, ms = 1300) {
  const el = $('blkBanner');
  if (!el) return;
  el.textContent = txt; el.className = `blk-banner ${kind}`;
  clearTimeout(blkBanner.t); blkBanner.t = setTimeout(() => el.classList.add('hidden'), ms);
}

function blkPick(i) {
  if (!G || G.busy || G.over || G.hold || !G.cur) return;
  const o = G.cur.opts[i];
  const btns = [...document.querySelectorAll('.blk-pick')];
  G.tries++;
  if (o === G.cur.w) {
    G.busy = true;
    btns[i]?.classList.add('ok');
    const stageWas = G.stage;
    G.right++; G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo);
    const m = mult(G.combo), fast = G.y < FAST;
    let pts = (10 + (G.cur.re ? 10 : 0)) * m;
    if (G.cur.gold) { pts *= 3; G.golds++; }
    if (fast) { pts += 10; G.fasts++; }
    G.score += pts;
    G.stage = Math.floor(G.right / 10);
    // 다시 떨어진 낱말을 맞혔다 — 쌓여 있던 그 블록도 지운다.
    if (G.cur.re) { const k = G.stack.findIndex((s) => s.w === G.cur.w); if (k >= 0) { G.stack.splice(k, 1); G.stack = settle(G.stack); } }
    if (G.sound) D.say(G.cur.w.h);
    G.cur.gold ? sfx.gold() : sfx.pop(G.combo);
    blkBurst(G.cur.gold ? 'gd' : `c${POS[G.cur.w.p] || 'x'}`, G.cur.gold ? 22 : 14);
    blkFloat(`+${pts}${fast ? ' ⚡' : ''}`, G.cur.gold ? 'gd' : '');
    $('blkFall').classList.add('pop');
    blkToast(`${G.cur.w.h} = ${mean(G.cur.w)}`, 'ok');
    // 축하는 한 번에 하나만 — 큰 것부터
    if (G.combo === 10) { sfx.fever(); blkBanner(D.t('🔥 피버! 점수 5배', '🔥 FEVER! 5× points'), 'fever'); }
    else if (G.stage > stageWas) { setTimeout(sfx.up, 150); blkBanner(D.t(`${G.stage + 1}단계! 더 빨라져요 ⚡`, `Stage ${G.stage + 1}! Faster ⚡`), 'up'); }
    else if (G.best && !G.beat && G.score > G.best) { G.beat = true; blkBanner(D.t('🏆 최고 기록 돌파!', '🏆 New best score!'), 'up'); }
    else if (fast && !G.cur.gold) blkBanner(D.t('⚡ 번개!', '⚡ Lightning!'), 'fast', 700);
    if (G.combo % BOMB_EVERY === 0 && G.bombs < BOMB_MAX) { G.bombs++; setTimeout(sfx.get, 200); $('blkBomb').classList.add('got'); setTimeout(() => $('blkBomb')?.classList.remove('got'), 700); }
    blkMeta();
    setTimeout(blkNext, 420);
  } else {
    btns[i]?.classList.add('no');
    btns[G.cur.opts.indexOf(G.cur.w)]?.classList.add('ok');
    blkLand(i);
  }
}

/* 폭탄 — 쌓인 맨 아래 줄을 날린다. 그 낱말은 「다시 볼 낱말」에 그대로 남고 다시 떨어지지 않는다. */
function blkBomb() {
  if (!G || G.over || G.hold || !G.bombs || !G.stack.length) return;
  G.bombs--; G.bombsUsed++;
  const gone = G.stack.filter((s) => s.row === 0);
  G.stack = settle(G.stack.filter((s) => s.row !== 0));
  G.again = G.again.filter((a) => !gone.some((s) => s.w === a.w));
  G.score += 15;
  sfx.bomb(); blkShake(true);
  const fx = $('blkFx'), board = $('blkBoard');
  if (fx && board && !calm()) {
    const h = board.clientHeight, w = board.clientWidth;
    let html = '';
    for (let i = 0; i < 26; i++) html += `<s class="cb" style="left:${w / 2}px;top:${h - h / ROWS / 2}px;--dx:${(Math.random() - 0.5) * w}px;--dy:${-Math.random() * h * 0.6}px"></s>`;
    fx.insertAdjacentHTML('beforeend', html);
    setTimeout(() => fx.querySelectorAll('s.cb').forEach((x) => x.remove()), 750);
  }
  blkBanner(D.t('💥 펑! +15', '💥 BOOM! +15'), 'boom', 800);
  blkMeta();
}

/* 블록이 쌓인다 — 틀렸거나 바닥에 닿았다. 정답을 잠깐 보여 주고, 블록 3개 뒤에 다시 떨어뜨린다. */
function blkLand(wrongIdx) {
  if (!G || G.busy) return;
  G.busy = true;
  const lost = G.combo;
  G.combo = 0;
  const w = G.cur.w;
  if (!G.cur.re) G.stack.push({ w, x: G.cur.x, wd: G.cur.wd, row: colH(G.stack, G.cur.x, G.cur.wd), flash: true });
  else { const s = G.stack.find((x) => x.w === w); if (s) s.flash = true; }
  // 줄이 꽉 찼다 — 지우고 점수. 지운 줄의 낱말은 다시 떨어지지 않는다(「다시 볼 낱말」에는 남는다).
  const before = G.stack;
  const n = clearLines();
  if (n) {
    const gone = before.filter((s) => !G.stack.includes(s));
    G.again = G.again.filter((a) => !gone.some((s) => s.w === a.w));
    G.lines += n; G.score += 50 * n * n;
    setTimeout(() => { sfx.up(); blkShake(true); blkBanner(D.t(n > 1 ? `🧱 ${n}줄 지우기! +${50 * n * n}` : `🧱 줄 지우기! +50`, n > 1 ? `🧱 ${n} lines! +${50 * n * n}` : '🧱 Line clear! +50'), 'up'); }, 300);
  }
  G.missed.set(w.h, w);
  G.again.push({ w, wait: AGAIN_AFTER });
  wrongIdx === null ? sfx.land() : sfx.miss();
  if (G.sound) setTimeout(() => D.say(w.h), 250);
  blkShake(false);
  $('blkBoard').classList.remove('hurt'); void $('blkBoard').offsetWidth; $('blkBoard').classList.add('hurt');
  if (wrongIdx === null) document.querySelectorAll('.blk-pick')[G.cur.opts.indexOf(w)]?.classList.add('ok');
  blkToast(`${w.h} = ${mean(w)}`, 'no');
  if (lost >= 3) blkBanner(D.t(`콤보 ${lost} 끊김 💔`, `Combo ${lost} lost 💔`), 'lost', 900);
  $('blkFall').classList.add('land');
  blkMeta();
  if (topH() >= ROWS) { setTimeout(blkOver, 900); return; }
  setTimeout(blkNext, 1300);   // 정답을 읽을 틈을 준다
}

function blkToast(msg, kind) {
  const p = $('blkPop');
  if (!p) return;
  p.textContent = msg; p.className = `blk-pop ${kind}`;
  clearTimeout(blkToast.t); blkToast.t = setTimeout(() => p.classList.add('hidden'), 1100);
}

function blkPause() {
  if (!G || G.over) return;
  const { t, esc } = D;
  G.hold = !G.hold;
  const ov = document.querySelector('.blk-paused');
  if (G.hold) {
    $('blkBoard').insertAdjacentHTML('beforeend', `<div class="blk-paused"><b>⏸ ${esc(t('잠깐 멈춤', 'Paused'))}</b><button type="button" class="pt-next" data-blk="pause">${esc(t('▶ 이어서 하기', '▶ Resume'))}</button></div>`);
  } else ov?.remove();
}

/* 등급 — 점수만이 아니라 「얼마나 정확했나」도 본다. */
function blkGrade() {
  const acc = G.tries ? G.right / G.tries : 0;
  if (G.right >= 40 && acc >= 0.9) return ['S', '🏆'];
  if (G.right >= 25 && acc >= 0.8) return ['A', '🥇'];
  if (G.right >= 12 && acc >= 0.65) return ['B', '🥈'];
  return ['C', '🥉'];
}

function blkOver() {
  if (!G) return;
  G.over = true; blkStop();
  const { t, esc } = D;
  const had = G.best;
  const rec = G.score > had;
  if (rec) write(BEST_KEY, String(G.score));
  D.track('단어블록끝');
  const miss = [...G.missed.values()];
  const [gr, gi] = blkGrade();
  const acc = G.tries ? Math.round((G.right / G.tries) * 100) : 0;
  D.root.innerHTML = `
    <div class="blk-end">
      ${rec ? `<div class="blk-confetti" aria-hidden="true">${Array.from({ length: 40 }, (_, i) => `<s style="left:${(i * 37) % 100}%;--d:${(i % 7) * 0.15}s;--c:${i % 5}"></s>`).join('')}</div>` : ''}
      <div class="blk-grade g-${gr}"><span>${gi}</span><b>${gr}</b></div>
      <div class="blk-end-score"><b id="blkEndN">0</b><span>${esc(t('점', 'pts'))}</span></div>
      <p class="blk-end-sub">${rec ? esc(t('🏆 새 최고 기록!', '🏆 New best!')) : esc(t(`최고 ${had}점`, `Best ${had}`))}</p>
      <div class="blk-stats">
        <div><b>${G.right}</b><small>${esc(t('맞힌 낱말', 'Words right'))}</small></div>
        <div><b>${acc}%</b><small>${esc(t('정확도', 'Accuracy'))}</small></div>
        <div><b>${G.maxCombo}</b><small>${esc(t('최대 콤보', 'Best combo'))}</small></div>
        <div><b>${G.lines}</b><small>${esc(t('🧱 지운 줄', '🧱 Lines'))}</small></div>
      </div>
      ${miss.length ? `
      <h3>${esc(t(`다시 볼 낱말 ${miss.length}개`, `${miss.length} words to review`))}</h3>
      <ul class="blk-miss">${miss.map((w) => `<li><button type="button" class="blk-say" data-blk-say="${esc(w.h)}" aria-label="${esc(t('듣기', 'Listen'))}">🔊</button><b>${esc(w.h)}</b><span>${esc(mean(w))}</span></li>`).join('')}</ul>
      <button type="button" class="pt-next" data-blk="save">${esc(t('📒 내 단어장에 모두 담기', '📒 Save all to my wordbook'))}</button>` : `<p>${esc(t('틀린 낱말이 없어요. 대단해요!', 'No misses. Amazing!'))}</p>`}
      <div class="blk-end-btns">
        <button type="button" class="pt-next" data-blk="start">${esc(t('🔁 한 판 더', '🔁 Play again'))}</button>
        <button type="button" class="pt-next blk-ghost" data-blk="setup">${esc(t('난이도 바꾸기', 'Change level'))}</button>
      </div>
    </div>`;
  if (rec) sfx.fever(); else sfx.up();
  // 점수가 0 에서 올라간다
  const el = $('blkEndN'), goal = G.score, t0 = performance.now();
  const roll = (now) => { const k = Math.min(1, (now - t0) / 900); el.textContent = String(Math.round(goal * (1 - Math.pow(1 - k, 3)))); if (k < 1 && el.isConnected) requestAnimationFrame(roll); };
  requestAnimationFrame(roll);
}

/* 누르기 · 키는 한 곳에서 — 화면을 다시 그려도 손잡이가 안 늘어난다. */
export function blkBind(root) {
  // 폰: 판의 왼쪽 · 오른쪽 절반을 누르면 그쪽으로 한 칸
  root.addEventListener('pointerdown', (e) => {
    const board = e.target.closest('#blkBoard');
    if (!board || e.target.closest('button')) return;
    const r = board.getBoundingClientRect();
    blkMove(e.clientX < r.left + r.width / 2 ? -1 : 1);
  });
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
    else if (a === 'bomb') blkBomb();
    else if (a === 'pause') blkPause();
    else if (a === 'sound' && G) { G.sound = !G.sound; write(SOUND_KEY, G.sound ? 'on' : 'off'); b.textContent = G.sound ? '🔊' : '🔇'; b.setAttribute('aria-pressed', G.sound); }
    else if (a === 'save' && G) {
      D.save([...G.missed.values()].map((w) => ({ word: w.h, meaning: mean(w), tag: w.p || null, vocab_id: w.i || w.h, source: 'blocks' })), b);
    }
  });
  addEventListener('keydown', (e) => {
    if (!G || G.over || !root.offsetParent || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '')) return;
    const n = { 1: 0, 2: 1, 3: 2 }[e.key];
    if (n !== undefined) { e.preventDefault(); blkPick(n); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); blkMove(e.key === 'ArrowLeft' ? -1 : 1); }
    else if (e.key === 'b' || e.key === 'B') { e.preventDefault(); blkBomb(); }
    else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { e.preventDefault(); blkPause(); }
  });
  // 다른 탭으로 가면 멈춘다 — 돌아오면 이어서 떨어진다.
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && G && !G.over && root.offsetParent && !raf) raf = requestAnimationFrame(blkTick);
  });
}

/* 화면에 다시 들어왔을 때 판이 진행 중이면 이어서 떨어뜨린다. */
export function blkResume() { if (G && !G.over && G.cur && !raf) raf = requestAnimationFrame(blkTick); }
