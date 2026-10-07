/* ══ 게임 : 오늘의 감자들 (#potdle) ═════════════════════════════
   운영자 요청(2026-10-07): 워들(Wordle)의 한글판. 하루 한 낱말 — 6번 안에 맞힌다.
   - 낱말은 두 글자, 자모로 풀면 다섯 개(사과 = ㅅ ㅏ ㄱ ㅗ ㅏ). 겹모음 · 겹받침은 두 자모로 푼다(ㅘ = ㅗ+ㅏ).
   - 칸 색: 🥔 갈색 = 자리까지 맞음 · 🧀 노랑 = 낱말 안에 있지만 자리가 다름 · 회색 = 없음.
   - 배우는 사람용이라 아무 자모 다섯 개나 넣어 볼 수 있다(사전에 있는 말만 받지 않는다).
     막히면 「💡 뜻 보기」 — 결과에 💡 가 붙는다.
   - 다 끝나면 결과를 🥔🧀⬜ 모양으로 복사 · 공유(인스타 · 친구) — 입소문이 이 게임의 몫이다.
   - 오늘 것을 끝내면 「연습 한 판」(무작위 낱말)도 할 수 있다.
   낱말은 감자 L1~L4 두 글자 중 자모 다섯 개인 것. 날짜로 고르니 모든 사람이 같은 날 같은 낱말을 푼다. */

const STATE_KEY = 'cp_pdl_state';     // { day, rows:[...], done, win, hint }
const STATS_KEY = 'cp_pdl_stats';     // { played, wins, streak, best, dist:[6] }
const LEN = 5, TRIES = 6;
const EPOCH = Date.UTC(2026, 9, 8);   // 1호 = 2026-10-08
const C = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', V = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const T = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const SPLIT = { ㅘ: 'ㅗㅏ', ㅙ: 'ㅗㅐ', ㅚ: 'ㅗㅣ', ㅝ: 'ㅜㅓ', ㅞ: 'ㅜㅔ', ㅟ: 'ㅜㅣ', ㅢ: 'ㅡㅣ', ㄳ: 'ㄱㅅ', ㄵ: 'ㄴㅈ', ㄶ: 'ㄴㅎ', ㄺ: 'ㄹㄱ', ㄻ: 'ㄹㅁ', ㄼ: 'ㄹㅂ', ㄽ: 'ㄹㅅ', ㄾ: 'ㄹㅌ', ㄿ: 'ㄹㅍ', ㅀ: 'ㄹㅎ', ㅄ: 'ㅂㅅ' };
const jamo = (s) => [...s].flatMap((ch) => {
  const c = ch.charCodeAt(0) - 0xac00;
  if (c < 0 || c >= 11172) return [ch];
  return [C[Math.floor(c / 588)], V[Math.floor((c % 588) / 28)], T[c % 28]].filter(Boolean).flatMap((j) => [...(SPLIT[j] || j)]);
});
/* 두벌식 자판 차례 — 화면 자판과 PC 영문 자판(q → ㅂ …) 둘 다. */
const KEYS = [['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'], ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'], ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'], ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ', 'ㅒ', 'ㅖ']];
const QWERTY = { q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ', a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ', z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ', Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', O: 'ㅒ', P: 'ㅖ' };
/* 받는 한글 자모를 그대로 받기도 한다(폰 한국어 자판에서 낱자로 칠 때) */
const isJamo = (k) => /^[ㄱ-ㅎㅏ-ㅣ]$/.test(k);

const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const mean = (w) => (w.s || w.e || '').split(/[;/]/)[0].trim();
const $ = (id) => document.getElementById(id);
const today = () => Math.max(1, Math.floor((Date.now() + 9 * 3600e3 - EPOCH) / 86400e3) + 1);   // 한국 시간 자정에 바뀐다

let D = null, G = null, WORDS = null;

/* 색 매기기 — 워들 규칙 그대로: 자리까지 맞은 것 먼저, 남은 자모 개수 안에서만 노랑. */
function score(guess, ans) {
  const out = Array(LEN).fill('x'), left = {};
  ans.forEach((a, i) => { if (guess[i] === a) out[i] = 'g'; else left[a] = (left[a] || 0) + 1; });
  guess.forEach((g, i) => { if (out[i] !== 'g' && left[g]) { out[i] = 'y'; left[g]--; } });
  return out;
}

/* 날마다 같은 낱말 — 낱말 목록을 고정된 차례로 섞어 두고 날짜 번호로 집는다. */
function seeded(list) {
  let s = 20261008;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const a = [...list].sort((x, y) => (x.h < y.h ? -1 : 1));
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function pdlMount(deps) { D = deps; pdlOpen(); }

export async function pdlOpen(practice) {
  const { t, esc } = D;
  if (!WORDS) {
    D.root.innerHTML = `<p class="blk-wait">${esc(t('낱말을 불러오는 중…', 'Loading words…'))}</p>`;
    let all = [];
    try { all = await D.vocab(false); } catch (e) {}
    const seen = new Set();
    WORDS = seeded(all.filter((w) => /^[가-힣]{2}$/.test(w.h) && w.v >= 1 && w.v <= 4 && mean(w) && jamo(w.h).length === LEN && !seen.has(w.h) && seen.add(w.h)));
    if (!WORDS.length) { D.root.innerHTML = `<p class="blk-wait">${esc(t('낱말을 못 불러왔어요.', 'Could not load words.'))}</p>`; WORDS = null; return; }
  }
  const day = today();
  if (practice) {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    G = { day, practice: true, w, ans: jamo(w.h), rows: [], cur: [], done: false, win: false, hint: false };
  } else {
    const w = WORDS[(day - 1) % WORDS.length];
    const st = read(STATE_KEY, null);
    const keep = st && st.day === day;
    G = { day, practice: false, w, ans: jamo(w.h), rows: keep ? st.rows : [], cur: [], done: keep && st.done, win: keep && st.win, hint: keep && st.hint };
  }
  D.track(practice ? '오늘의감자들연습' : '오늘의감자들');
  pdlDraw();
}

function pdlSave() {
  if (G.practice) return;
  write(STATE_KEY, { day: G.day, rows: G.rows, done: G.done, win: G.win, hint: G.hint });
}

function pdlDraw() {
  const { t, esc } = D;
  const rows = [];
  for (let r = 0; r < TRIES; r++) {
    const g = G.rows[r], cur = !g && r === G.rows.length && !G.done ? G.cur : null;
    const sc = g ? score(g, G.ans) : null;
    rows.push(`<div class="pdl-row${cur ? ' cur' : ''}" data-r="${r}">${Array.from({ length: LEN }, (_, i) => {
      const ch = g ? g[i] : cur ? cur[i] || '' : '';
      return `<span class="pdl-c${sc ? ' ' + sc[i] : ch ? ' fill' : ''}" style="--d:${i * 90}ms">${ch}</span>`;
    }).join('')}</div>`);
  }
  // 자판 색 — 가장 좋은 결과로(g > y > x)
  const best = {};
  G.rows.forEach((g) => score(g, G.ans).forEach((s, i) => { const k = g[i], o = best[k]; if (s === 'g' || (s === 'y' && o !== 'g') || (s === 'x' && !o)) best[k] = s; }));
  const st = read(STATS_KEY, { played: 0, wins: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0] });
  D.root.innerHTML = `
    <div class="pdl-head">
      <h2>🥔 ${esc(G.practice ? t('오늘의 감자들 · 연습', 'Potato Wordle · practice') : t(`오늘의 감자들 #${G.day}`, `Potato Wordle #${G.day}`))}</h2>
      <p>${esc(t('두 글자 낱말을 자모 다섯 개로 맞혀요 · 6번 기회', 'Guess the 2-syllable word in 5 jamo · 6 tries'))}</p>
      <p class="pdl-legend"><span class="pdl-c g">ㄱ</span>${esc(t('자리까지 맞음', 'right spot'))} <span class="pdl-c y">ㅏ</span>${esc(t('있지만 다른 자리', 'in the word'))} <span class="pdl-c x">ㅎ</span>${esc(t('없음', 'not in it'))}</p>
    </div>
    <div class="pdl-grid" id="pdlGrid">${rows.join('')}</div>
    <div class="pdl-mid">
      ${G.hint || G.done ? `<p class="pdl-hint">💡 ${esc(mean(G.w))}</p>` : `<button type="button" class="pdl-hbtn" data-pdl="hint">💡 ${esc(t('뜻 보기', 'Show meaning'))}</button>`}
    </div>
    ${G.done ? pdlEnd(st) : `<div class="pdl-kb" id="pdlKb">${KEYS.map((row, ri) => `<div class="pdl-kr">${ri === 2 ? `<button type="button" class="pdl-k wide" data-pdl="enter">${esc(t('확인', 'Enter'))}</button>` : ''}${row.map((k) => `<button type="button" class="pdl-k ${best[k] || ''}" data-k="${k}">${k}</button>`).join('')}${ri === 2 ? `<button type="button" class="pdl-k wide" data-pdl="back" aria-label="${esc(t('지우기', 'Delete'))}">${esc(t('지우기', 'Del'))}</button>` : ''}</div>`).join('')}</div>`}`;
}

function pdlEnd(st) {
  const { t, esc } = D;
  const n = G.rows.length;
  const dist = st.dist.map((v, i) => `<div class="pdl-bar"><span>${i + 1}</span><i style="width:${Math.max(6, (v / Math.max(1, ...st.dist)) * 100)}%"${G.win && i + 1 === n && !G.practice ? ' class="me"' : ''}>${v}</i></div>`).join('');
  return `<div class="pdl-end">
    <p class="pdl-res">${G.win ? esc(t(`🎉 ${n}번 만에 맞혔어요!`, `🎉 Got it in ${n}!`)) : esc(t('아쉬워요 — 정답은', 'So close — the word was'))}</p>
    <button type="button" class="chs-word" data-pdl-say="${esc(G.w.h)}"><b>${esc(G.w.h)}</b> 🔊</button><span class="chs-mean">${esc(mean(G.w))}</span>
    <div class="pdl-share">
      <button type="button" class="pt-next" data-pdl="share">${esc(t('📤 결과 공유하기', '📤 Share result'))}</button>
      <button type="button" class="pt-next blk-ghost" data-pdl="save">${esc(t('📒 단어장에 담기', '📒 Save word'))}</button>
    </div>
    ${G.practice ? '' : `<div class="pdl-stats"><div><b>${st.played}</b><small>${esc(t('플레이', 'Played'))}</small></div><div><b>${st.played ? Math.round((st.wins / st.played) * 100) : 0}%</b><small>${esc(t('성공', 'Win %'))}</small></div><div><b>${st.streak}</b><small>${esc(t('연속', 'Streak'))}</small></div><div><b>${st.best}</b><small>${esc(t('최고 연속', 'Max'))}</small></div></div>
    <div class="pdl-dist">${dist}</div>
    <p class="pdl-next">${esc(t('다음 감자는 한국 시간 자정에 나와요', 'A new potato drops at midnight Korea time'))}</p>`}
    <button type="button" class="pt-next blk-ghost" data-pdl="practice">${esc(t('🔁 연습 한 판(무작위 낱말)', '🔁 Practice round (random word)'))}</button>
  </div>`;
}

function pdlType(k) {
  if (!G || G.done) return;
  if (k === 'back') { G.cur.pop(); return pdlRowOnly(); }
  if (k === 'enter') return pdlEnter();
  if (G.cur.length >= LEN || !isJamo(k)) return;
  G.cur.push(k); pdlRowOnly();
}
/* 한 칸 칠 때마다 판 전체를 다시 그리지 않는다 — 지금 줄만. */
function pdlRowOnly() {
  const row = $('pdlGrid')?.querySelector(`[data-r="${G.rows.length}"]`);
  if (!row) return;
  row.querySelectorAll('.pdl-c').forEach((c, i) => { c.textContent = G.cur[i] || ''; c.classList.toggle('fill', !!G.cur[i]); });
}
function pdlEnter() {
  const { t } = D;
  if (G.cur.length < LEN) {
    const row = $('pdlGrid')?.querySelector(`[data-r="${G.rows.length}"]`);
    if (row) { row.classList.remove('bad'); void row.offsetWidth; row.classList.add('bad'); }
    return D.toast?.(t('자모 다섯 개를 채워요', 'Fill all 5 jamo'));
  }
  const g = G.cur; G.rows.push(g); G.cur = [];
  const win = g.join('') === G.ans.join('');
  if (win || G.rows.length >= TRIES) {
    G.done = true; G.win = win;
    if (!G.practice) {
      const st = read(STATS_KEY, { played: 0, wins: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0], last: 0 });
      st.played++;
      if (win) { st.wins++; st.dist[G.rows.length - 1]++; st.streak = st.last === G.day - 1 ? st.streak + 1 : 1; st.best = Math.max(st.best, st.streak); }
      else st.streak = 0;
      st.last = G.day;
      write(STATS_KEY, st);
    }
    D.say?.(G.w.h);
    D.track(win ? '오늘의감자들성공' : '오늘의감자들실패');
  }
  pdlSave(); pdlDraw();
}

function pdlShareText() {
  const { t } = D;
  const em = { g: '🥔', y: '🧀', x: '⬜' };
  const grid = G.rows.map((g) => score(g, G.ans).map((s) => em[s]).join('')).join('\n');
  const head = G.practice ? t('오늘의 감자들 · 연습', 'Potato Wordle · practice') : t(`오늘의 감자들 #${G.day}`, `Potato Wordle #${G.day}`);
  return `${head} ${G.win ? G.rows.length : 'X'}/${TRIES}${G.hint ? ' 💡' : ''}\n${grid}\neverykoreans.com/#potdle`;
}

export function pdlBind(root) {
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.k) return pdlType(b.dataset.k);
    if (b.dataset.pdlSay) return D.say?.(b.dataset.pdlSay);
    const a = b.dataset.pdl;
    if (a === 'enter' || a === 'back') pdlType(a);
    else if (a === 'hint') { G.hint = true; pdlSave(); pdlDraw(); D.track('오늘의감자들힌트'); }
    else if (a === 'practice') pdlOpen(true);
    else if (a === 'save') D.save([{ word: G.w.h, meaning: mean(G.w), tag: G.w.p || null, vocab_id: G.w.i || G.w.h, source: 'potdle' }], b);
    else if (a === 'share') {
      const txt = pdlShareText();
      D.track('오늘의감자들공유');
      try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch (err) { if (err?.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(txt); D.toast?.(D.t('결과를 복사했어요 — 붙여 넣어 공유해요', 'Copied — paste it anywhere')); } catch (err) { D.toast?.(txt); }
    }
  });
  addEventListener('keydown', (e) => {
    if (!G || G.done || !root.offsetParent || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '')) return;
    if (e.key === 'Enter') { e.preventDefault(); return pdlType('enter'); }
    if (e.key === 'Backspace') { e.preventDefault(); return pdlType('back'); }
    const k = isJamo(e.key) ? e.key : QWERTY[e.key];
    if (k) { e.preventDefault(); pdlType(k); }
  });
}
