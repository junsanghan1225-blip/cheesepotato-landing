/* ══ 게임 : 초성 퀴즈 (#chosung) ════════════════════════════════
   운영자 요청(2026-10-07): 「초성 퀴즈 좋다」 — TV 예능의 초성 게임. 「ㅎㄱ」을 보고 낱말을 떠올려 쓴다.
   객관식(단어 감자)은 「알아보기」, 이것은 「떠올려 쓰기」 — 같은 낱말을 다른 길로 한 번 더 꺼내야 오래 간다.
   - 한 판 10문제, 문제마다 20초. 시간이 갈수록 힌트가 열린다: 뜻(영어) → 첫 글자.
     힌트 없이 맞히면 30점, 뜻을 보고 20점, 첫 글자까지 보고 10점. 빨리 맞힐수록 +보너스.
   - 같은 초성의 다른 낱말도 정답(TV 규칙처럼) — 우리 낱말 목록에 있는 말이면 된다. 그때 「원래 답」도 보여 준다.
   - 끝나면 못 맞힌 낱말 「단어장에 담기」.
   쉬움 · 보통 · 어려움 = 감자 L1~2 · L3~5 · L6~7(단어 감자와 같다). 쉬움은 뜻을 처음부터 보여 준다. */

const BEST_KEY = 'cp_chs_best';
const LV_KEY = 'cp_blk_lv';
const N = 10, SEC = 20;
const LEVELS = [
  { id: 'easy', ko: '쉬움', en: 'Easy', dko: '감자 L1~L2 · 뜻을 처음부터 보여 줘요', den: 'Potato L1–L2 · meaning shown from the start', v: [1, 2], mean: 0, first: 10 },
  { id: 'mid', ko: '보통', en: 'Medium', dko: '감자 L3~L5 · 6초 뒤 뜻', den: 'Potato L3–L5 · meaning after 6s', v: [3, 5], mean: 6, first: 13 },
  { id: 'hard', ko: '어려움', en: 'Hard', dko: '감자 L6~L7 · 10초 뒤 뜻', den: 'Potato L6–L7 · meaning after 10s', v: [6, 7], mean: 10, first: 15 },
];
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const initials = (s) => [...s].map((ch) => { const c = ch.charCodeAt(0) - 0xac00; return c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : ch; }).join('');
const hangulOnly = (s) => /^[가-힣]+$/.test(s);
const clean = (s) => String(s || '').replace(/[\s.,!?~·]/g, '');

const read = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const mean = (w) => (w.s || w.e || '').split(/[;/]/)[0].trim();
const $ = (id) => document.getElementById(id);

let D = null, G = null, tick = 0;
let AC = null;
function tone(freq, dur = 0.12, type = 'sine', vol = 0.16, when = 0) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const t0 = AC.currentTime + when, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  } catch (e) {}
}
const sfx = {
  ok: () => [660, 880, 1175].forEach((f, i) => tone(f, 0.12, 'triangle', 0.16, i * 0.07)),
  no: () => tone(200, 0.2, 'sawtooth', 0.1),
  hint: () => tone(520, 0.1, 'sine', 0.12),
  out: () => [440, 330].forEach((f, i) => tone(f, 0.2, 'triangle', 0.12, i * 0.12)),
};

export function chsMount(deps) { D = deps; chsSetup(); }
export function chsStop() { if (tick) clearInterval(tick); tick = 0; }

export function chsSetup() {
  chsStop(); G = null;
  const { t, esc } = D;
  const lv = read(LV_KEY, 'easy');
  const best = parseInt(read(BEST_KEY, '0'), 10) || 0;
  D.root.innerHTML = `
    <div class="blk-intro">
      <div class="chs-demo" aria-hidden="true"><span>ㅎ</span><span>ㄱ</span></div>
      <p class="chs-demo-a" aria-hidden="true">→ 학교 · 한국 · 하고…</p>
      <h2>${esc(t('초성 퀴즈', 'Initial-consonant quiz'))}</h2>
      <p>${esc(t('첫소리(초성)만 보고 낱말을 떠올려 한국어로 써요. 시간이 지나면 뜻 → 첫 글자 힌트가 열려요. 힌트 없이 맞힐수록 점수가 커요!', 'See only the first consonants and type the Korean word. Hints open over time: meaning → first syllable. Fewer hints, more points!'))}</p>
      <div class="blk-lvs" role="radiogroup" aria-label="${esc(t('난이도', 'Level'))}">
        ${LEVELS.map((L) => `<button type="button" role="radio" class="blk-lv${L.id === lv ? ' on' : ''}" aria-checked="${L.id === lv}" data-chs-lv="${L.id}"><b>${esc(t(L.ko, L.en))}</b><small>${esc(t(L.dko, L.den))}</small></button>`).join('')}
      </div>
      <button type="button" class="pt-next blk-go" data-chs="start">${esc(t('▶ 시작하기', '▶ Start'))}</button>
      <p class="blk-keys">${esc(t('한국어 자판이 필요해요 · 같은 초성의 다른 낱말도 정답', 'You need a Korean keyboard · other words with the same initials count too'))}${best ? ` · ${esc(t(`🏆 최고 ${best}점`, `🏆 Best ${best}`))}` : ''}</p>
    </div>`;
}

async function chsStart() {
  const { t, esc } = D;
  const lv = LEVELS.find((L) => L.id === read(LV_KEY, 'easy')) || LEVELS[0];
  D.root.innerHTML = `<p class="blk-wait">${esc(t('낱말을 불러오는 중…', 'Loading words…'))}</p>`;
  let all = [];
  try { all = await D.vocab(lv.id === 'hard'); } catch (e) {}
  // 2~4글자 한글 낱말만 — 한 글자는 초성 하나라 너무 막연하고, 긴 말은 폰에서 치기 어렵다.
  const ok = all.filter((w) => hangulOnly(w.h) && w.h.length >= 2 && w.h.length <= 4 && mean(w));
  const pool = ok.filter((w) => w.v >= lv.v[0] && w.v <= lv.v[1]);
  if (pool.length < N) { D.root.innerHTML = `<p class="blk-wait">${esc(t('낱말을 못 불러왔어요. 잠시 뒤 다시 해 주세요.', 'Could not load words. Please try again shortly.'))}</p>`; return; }
  // 같은 초성의 다른 낱말도 받아 주려고 — 우리 낱말 전부(레벨 상관없이)를 초성으로 묶어 둔다.
  const known = new Set(ok.map((w) => w.h));
  G = { lv, qs: shuffle(pool).slice(0, N), i: -1, score: 0, right: 0, missed: [], log: [], known, t0: 0, done: false, over: false,
    best: parseInt(read(BEST_KEY, '0'), 10) || 0 };
  D.track('초성퀴즈시작');
  D.root.innerHTML = `
    <div class="blk-top">
      <div class="blk-sc"><span class="blk-score" id="chsScore">0</span><small id="chsN"></small></div>
      <div class="blk-combo" id="chsStreak"></div>
    </div>
    <div class="pot-time"><i id="chsBar"></i><span id="chsTime"></span></div>
    <div class="chs-card" id="chsCard">
      <div class="chs-tiles" id="chsTiles"></div>
      <p class="chs-pos" id="chsPos"></p>
      <div class="chs-hints">
        <div class="chs-hint" id="chsH1"></div>
        <div class="chs-hint" id="chsH2"></div>
      </div>
      <div class="chs-res hidden" id="chsRes"></div>
    </div>
    <form class="chs-form" id="chsForm" autocomplete="off">
      <input id="chsIn" lang="ko" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${esc(t('한국어로 쓰기', 'Type in Korean'))}" aria-label="${esc(t('답', 'Answer'))}">
      <button type="submit" class="pt-next">${esc(t('확인', 'Check'))}</button>
    </form>
    <div class="chs-row">
      <button type="button" class="pt-next blk-ghost" data-chs="skip" id="chsSkip">${esc(t('모르겠어요', 'Skip'))}</button>
      <button type="button" class="pt-next hidden" data-chs="next" id="chsNext">${esc(t('다음 →', 'Next →'))}</button>
    </div>`;
  chsNext();
}

function chsNext() {
  if (!G) return;
  G.i++;
  if (G.i >= G.qs.length) return chsOver();
  const w = G.qs[G.i], { t, esc } = D;
  G.done = false; G.hint = 0; G.t0 = performance.now();
  $('chsTiles').innerHTML = [...initials(w.h)].map((c, k) => `<span style="--d:${k * 70}ms">${c}</span>`).join('');
  $('chsPos').textContent = t(`${w.p || ''} · ${w.h.length}글자`, `${w.p || ''} · ${w.h.length} syllables`);
  $('chsH1').innerHTML = `<small>${esc(t('뜻', 'Meaning'))}</small><b>${G.lv.mean === 0 ? esc(mean(w)) : '🔒'}</b>`;
  $('chsH1').classList.toggle('open', G.lv.mean === 0);
  $('chsH2').innerHTML = `<small>${esc(t('첫 글자', 'First syllable'))}</small><b>🔒</b>`;
  $('chsH2').classList.remove('open');
  if (G.lv.mean === 0) G.hint = 1;
  $('chsRes').classList.add('hidden');
  $('chsIn').value = ''; $('chsIn').disabled = false; $('chsForm').classList.remove('bad');
  $('chsSkip').classList.remove('hidden'); $('chsNext').classList.add('hidden');
  $('chsN').textContent = `${G.i + 1} / ${G.qs.length}`;
  $('chsScore').textContent = String(G.score);
  try { $('chsIn').focus({ preventScroll: true }); } catch (e) {}
  if (tick) clearInterval(tick);
  tick = setInterval(chsTick, 100);
  chsTick();
}

function chsTick() {
  if (!G || G.done) return;
  if (!$('chsCard')?.offsetParent) return;
  const el = (performance.now() - G.t0) / 1000, left = Math.max(0, SEC - el), w = G.qs[G.i];
  $('chsBar').style.width = `${(left / SEC) * 100}%`;
  $('chsTime').textContent = `${Math.ceil(left)}`;
  if (G.hint < 1 && el >= G.lv.mean) { G.hint = 1; sfx.hint(); $('chsH1').querySelector('b').textContent = mean(w); $('chsH1').classList.add('open'); }
  if (G.hint < 2 && el >= G.lv.first) { G.hint = 2; sfx.hint(); $('chsH2').querySelector('b').textContent = `${w.h[0]}${'○'.repeat(w.h.length - 1)}`; $('chsH2').classList.add('open'); }
  if (left <= 0) chsReveal(false, null);
}

function chsCheck() {
  if (!G || G.done) return;
  const w = G.qs[G.i], a = clean($('chsIn').value);
  if (!a) return;
  if (a === w.h || (initials(a) === initials(w.h) && a.length === w.h.length && G.known.has(a))) return chsReveal(true, a);
  sfx.no();
  const f = $('chsForm'); f.classList.remove('bad'); void f.offsetWidth; f.classList.add('bad');
  // 초성이 다르면 그것도 알려 준다 — 무엇이 틀렸는지 알아야 고친다
  D.toast?.(initials(a) !== initials(w.h) ? D.t(`초성이 달라요: ${initials(a)}`, `Different initials: ${initials(a)}`) : D.t('우리 낱말 목록에 없는 말이에요', 'Not in our word list'));
}

function chsReveal(ok, ans) {
  if (!G || G.done) return;
  G.done = true;
  if (tick) clearInterval(tick); tick = 0;
  const w = G.qs[G.i], { t, esc } = D;
  const el = (performance.now() - G.t0) / 1000;
  let pts = 0;
  if (ok) {
    pts = [30, 20, 10][G.hint] + Math.max(0, Math.round((SEC - el) / 2));
    G.score += pts; G.right++; sfx.ok();
  } else { G.missed.push(w); sfx.out(); }
  G.log.push({ w, ok });
  D.say?.(w.h);
  const other = ok && ans !== w.h;
  $('chsRes').innerHTML = `${ok ? `<p class="chs-ok">${esc(t(`정답! +${pts}`, `Correct! +${pts}`))}</p>` : `<p class="chs-no">${esc(t('아쉬워요', 'So close'))}</p>`}
    ${other ? `<p class="chs-other">${esc(t(`「${ans}」도 정답 — 원래 답은`, `“${ans}” works too — the planned word was`))}</p>` : ''}
    <button type="button" class="chs-word" data-chs-say="${esc(w.h)}"><b>${esc(w.h)}</b> 🔊</button><span class="chs-mean">${esc(mean(w))}</span>`;
  $('chsRes').classList.remove('hidden');
  $('chsIn').disabled = true; $('chsForm').classList.remove('bad');
  $('chsSkip').classList.add('hidden'); $('chsNext').classList.remove('hidden');
  $('chsScore').textContent = String(G.score);
  $('chsStreak').innerHTML = G.right ? `<b>${G.right}</b> ${esc(t('개 맞힘', 'right'))}` : '';
  try { $('chsNext').focus({ preventScroll: true }); } catch (e) {}
}

function chsOver() {
  G.over = true; chsStop();
  const { t, esc } = D;
  const had = G.best, rec = G.score > had;
  if (rec) write(BEST_KEY, String(G.score));
  D.track('초성퀴즈끝');
  D.root.innerHTML = `
    <div class="blk-end">
      <p class="pot-end-h">${esc(t(`${G.qs.length}문제 중 ${G.right}개`, `${G.right} of ${G.qs.length}`))}</p>
      <div class="blk-end-score"><b>${G.score}</b><span>${esc(t('점', 'pts'))}</span></div>
      <p class="blk-end-sub">${rec ? esc(t('🏆 새 최고 기록!', '🏆 New best!')) : had ? esc(t(`최고 ${had}점`, `Best ${had}`)) : ''}</p>
      <ul class="blk-miss">${G.log.map(({ w, ok }) => `<li><button type="button" class="blk-say" data-chs-say="${esc(w.h)}" aria-label="${esc(t('듣기', 'Listen'))}">🔊</button><span class="chs-ini">${initials(w.h)}</span><b>${esc(w.h)}</b><span>${esc(mean(w))}</span><i>${ok ? '✅' : '❌'}</i></li>`).join('')}</ul>
      ${G.missed.length ? `<button type="button" class="pt-next" data-chs="save">${esc(t(`📒 못 맞힌 ${G.missed.length}개 단어장에 담기`, `📒 Save ${G.missed.length} missed words`))}</button>` : ''}
      <div class="blk-end-btns">
        <button type="button" class="pt-next" data-chs="start">${esc(t('🔁 한 판 더', '🔁 Play again'))}</button>
        <button type="button" class="pt-next blk-ghost" data-chs="setup">${esc(t('난이도 바꾸기', 'Change level'))}</button>
      </div>
    </div>`;
}

export function chsBind(root) {
  root.addEventListener('submit', (e) => { if (e.target.id === 'chsForm') { e.preventDefault(); chsCheck(); } });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.chsLv) {
      write(LV_KEY, b.dataset.chsLv);
      root.querySelectorAll('.blk-lv').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
      return;
    }
    if (b.dataset.chsSay) return D.say?.(b.dataset.chsSay);
    const a = b.dataset.chs;
    if (a === 'start') chsStart();
    else if (a === 'setup') chsSetup();
    else if (a === 'skip') chsReveal(false, null);
    else if (a === 'next') chsNext();
    else if (a === 'save' && G) D.save(G.missed.map((w) => ({ word: w.h, meaning: mean(w), tag: w.p || null, vocab_id: w.i || w.h, source: 'chosung' })), b);
  });
  addEventListener('keydown', (e) => {
    if (!G || G.over || !root.offsetParent) return;
    if (e.key === 'Enter' && G.done && !/^(INPUT|BUTTON)$/.test(e.target?.tagName || '')) { e.preventDefault(); chsNext(); }
  });
}
