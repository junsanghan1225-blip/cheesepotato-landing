/* 게임 둘 — 스피드 퀴즈 · 숫자 읽기(웹 리팩터링 3단계, 2026-11-15 운영자 「app.module.js 쪼개기」).
   app.module.js 에 있던 구역을 그대로 옮겼다. 게임 목록에서 열 때만 받는다(첫 화면 무게에서 빠짐).
   앱의 도우미(t · esc · open · showing · 단어 모으기 · 기록 · 숫자 자료)는 init(deps) 로 받는다 — 이 파일은 app.module.js 를 import 하지 않는다. */
const $ = (id) => document.getElementById(id);
let t, esc, open, showing, gameLoadWords, gameShuffle, gameBest, gameBestRead, needNumbers, gameWordsNow;
let bound = false;
export function init(d) {
  ({ t, esc, open, showing, gameLoadWords, gameShuffle, gameBest, gameBestRead, needNumbers, gameWordsNow } = d);
  if (bound) return;
  bound = true;
  $('numLv').addEventListener('change', (ev) => {
    const r = ev.target.closest('input[name=numLv]');
    if (!r || !NUM_LV_TX[r.value]) return;
    numLevel = r.value;
    try { localStorage.setItem(NUM_LV_KEY, numLevel); } catch (e) {}
    $('numLvDesc').textContent = t(NUM_LV_TX[numLevel].d.ko, NUM_LV_TX[numLevel].d.en);
    numSyncBest();
  });
  $('numGo').addEventListener('click', numStart);
  $('numAgain').addEventListener('click', numStart);
  $('numToGames').addEventListener('click', numSetup);
  $('numBack').addEventListener('click', () => open('games'));
}
export const qzIsDone = () => qzDone;
export { qzStart, qzStop, qzSyncStatic, qzSyncOver, numSetup, numSyncLang };

/* ══ 게임 : 스피드 퀴즈 ════════════════════════════════════════
   60초 동안 뜻을 보고 단어를 고른다.

   시간이 주인공이라 남은 시간을 막대로도 보여 준다. 숫자만 두면 몇 초
   남았는지 매번 읽어야 하는데, 그 사이에 시간이 간다. */

const QZ_SECONDS = 60, QZ_CHOICES = 4;
const QZ_BEST_KEY = 'quizBest';

let qzLeft = QZ_SECONDS, qzScore = 0, qzTimer = 0;
let qzAnswer = null, qzBusy = false, qzDone = false;

const QZ_PANELS = ['quizLoading', 'quizNeedLogin', 'quizFew', 'quizErr', 'quizPlay', 'quizOver'];
function qzPanel(name) { QZ_PANELS.forEach((k) => $(k).classList.toggle('hidden', k !== name)); }

function qzStop() { if (qzTimer) clearInterval(qzTimer); qzTimer = 0; }
// 화면을 벗어나도 시계가 돌면, 돌아왔을 때 이미 끝나 있다.
window.qzStop = qzStop;

async function qzStart() {
  qzStop();
  qzDone = false; qzBusy = true; qzScore = 0; qzLeft = QZ_SECONDS;
  qzSyncStatic();
  qzMeta();
  qzPanel('quizLoading');
  const where = await gameLoadWords(QZ_CHOICES);
  if (where !== 'Play') { qzPanel('quiz' + where); return; }
  qzPanel('quizPlay');
  qzNext();
  qzTimer = setInterval(() => {
    qzLeft--;
    qzMeta();
    if (qzLeft <= 0) qzFinish();
  }, 1000);
}

function qzNext() {
  const pick = [];
  for (const w of gameShuffle(gameWordsNow())) {   // gameWords 는 app.module.js 의 gameLoadWords 가 채운다 — 그때그때 읽는다
    // 보기에 같은 단어가 둘이면 어느 것을 골라도 맞아 버린다.
    if (pick.some((p) => p.word === w.word)) continue;
    pick.push(w);
    if (pick.length === QZ_CHOICES) break;
  }
  qzAnswer = pick[Math.floor(Math.random() * pick.length)];
  $('quizTarget').textContent = qzAnswer.meaning;

  const box = $('quizChoices');
  box.textContent = '';
  gameShuffle(pick).forEach((w) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'qz-choice';
    b.textContent = w.word;                 // 사람이 넣은 글
    b.addEventListener('click', () => qzPick(w, b));
    box.appendChild(b);
  });
  qzBusy = false;
}

function qzPick(w, btn) {
  if (qzBusy || qzDone) return;
  qzBusy = true;
  const right = w.word === qzAnswer.word;
  const all = [...$('quizChoices').children];
  all.forEach((b) => { b.disabled = true; });

  if (right) {
    qzScore++;
    btn.classList.add('right');
    qzSay('good', t('정답!', 'Correct!'));
  } else {
    btn.classList.add('wrong');
    // 틀렸을 때 답을 같이 켜 준다. 무엇이 맞는지 모르고 넘어가면
    // 틀린 채로 한 번 더 외운다.
    all.forEach((b) => { if (b.textContent === qzAnswer.word) b.classList.add('right'); });
    qzSay('bad', t(`정답은 “${qzAnswer.word}” 예요.`, `It was “${qzAnswer.word}”.`));
  }
  qzMeta();

  setTimeout(() => {
    if (qzDone) return;
    qzSay('', '');
    qzNext();
  }, right ? 450 : 1000);
}

function qzFinish() {
  qzDone = true;
  qzStop();
  qzLeft = 0;
  qzMeta();
  gameBest(QZ_BEST_KEY, qzScore);
  qzSyncBest();      // 방금 세운 기록이 그 자리에서 보여야 한다
  qzPanel('quizOver');
  qzSyncOver();
}

function qzSyncBest() {
  const best = gameBestRead(QZ_BEST_KEY);
  $('quizBest').classList.toggle('hidden', best <= 0);
  $('quizBest').textContent = t(`최고 ${best}개`, `Best ${best}`);
}

function qzSay(kind, text) {
  const el = $('quizMsg');
  el.className = 'claw-msg' + (kind ? ' ' + kind : '');
  el.textContent = text;
}

function qzMeta() {
  $('quizClock').textContent = Math.max(0, qzLeft);
  $('quizScore').textContent = qzScore;
  $('quizFill').style.transform = 'scaleX(' + Math.max(0, qzLeft / QZ_SECONDS) + ')';
  // 마지막 10초는 색으로 알린다. 숫자를 읽는 데도 시간이 든다.
  $('quizFill').parentElement.classList.toggle('hurry', qzLeft <= 10);
}

function qzSyncStatic() {
  $('quizBackTxt').textContent = t('게임', 'Games');
  $('quizLabel').textContent = t('이 뜻을 가진 단어는?', 'Which word means this?');
  $('quizAgain').textContent = t('다시 하기', 'Play again');
  $('quizToGames').textContent = t('다른 게임 보기', 'Other games');
  $('quizNote').textContent = t('60초 동안 최대한 많이. 단어는 내 단어장에서 옵니다.',
                                'As many as you can in 60 seconds. The words come from your wordbook.');
  qzSyncBest();
}

function qzSyncOver() {
  $('quizOverEmoji').textContent = '';
  $('quizOverScore').textContent = t(`${qzScore}개`, `${qzScore}`);
  $('quizOverLine').textContent = qzScore >= 20
    ? t('빠르고 정확해요. 이 단어들은 이제 손에 붙었네요.', 'Fast and right: these are yours now.')
    : qzScore >= 10
      ? t('좋아요. 한 번 더 하면 더 빨라져요.', 'Solid. One more run and it gets quicker.')
      : t('괜찮아요. 방금 본 단어부터 다시 보면 돼요.', 'No rush: start with the ones you just saw.');
}


/* ══ 게임 : 숫자 읽기 ═════════════════════════════════════════
   한국어 숫자의 어려움은 하나·둘·셋을 외우는 데 있지 않고 **어느 쪽
   체계를 쓰는지 순간에 가르는 데** 있다. 시는 순우리말인데 분은 한자어다.
   그래서 보기를 둘만 두고 나란히 놓는다 — 골라야 견주게 되고, 견주는 것이
   말할 때 실제로 하는 일이다. 오답은 numbers.js 가 그럴 법한 착각으로
   만들어 준다(체계를 바꿔 읽기, 불규칙을 규칙대로 읽기, 자릿수 놓치기).

   **시계를 안 둔 것은 일부러다.** 기르려는 것이 빠르기가 아니라 가르기라,
   시간에 쫓기면 생각하는 대신 찍게 된다. 대신 연속 맞힌 수로 흐름을 준다.
   스피드 퀴즈가 이미 60초짜리라 겹치지도 않는다.

   **로그인도 단어장도 안 쓴다.** 나머지 셋은 모두 저장해 둔 단어가 있어야
   놀 수 있어서, 처음 온 사람은 게임 목록에서 할 수 있는 게 하나도 없었다. */
const NUM_TOTAL = 12;
const NUM_LV_TX = {
  beginner:     { ko: '초급', en: 'Beginner',
                  d: { ko: '열까지 세기, 시각, 나이, 가게에서 쓰는 값.',
                       en: 'Counting to ten, clock times, ages, everyday prices.' } },
  intermediate: { ko: '중급', en: 'Intermediate',
                  d: { ko: '단위 명사를 넓히고 날짜와 만 단위 값까지 갑니다.',
                       en: 'More counters, dates, and prices past ten thousand.' } },
  advanced:     { ko: '고급', en: 'Advanced',
                  d: { ko: '큰 수, 개월과 달, 횟수의 번과 번호의 번을 가릅니다.',
                       en: 'Big numbers, 개월 vs 달, and the two kinds of 번.' } },
};
const NUM_LV_KEY = 'cp-num-lv';
let numLevel = 'beginner';
try { const s = localStorage.getItem(NUM_LV_KEY); if (NUM_LV_TX[s]) numLevel = s; } catch (e) {}

let numRound = [], numIdx = 0, numScore = 0, numStreak = 0, numBusy = false;
let numWrongs = [];

const NUM_PANELS = ['numSetup', 'numPlay', 'numOver'];
function numPanel(name) { NUM_PANELS.forEach((k) => $(k).classList.toggle('hidden', k !== name)); }
const numBestKey = (lv) => `cp-num-best-${lv}`;
const numLvName = () => t(NUM_LV_TX[numLevel].ko, NUM_LV_TX[numLevel].en);

function numSyncBest() {
  const best = gameBestRead(numBestKey(numLevel));
  $('numBest').classList.toggle('hidden', best <= 0);
  $('numBest').textContent = t(`최고 ${best} / ${NUM_TOTAL}`, `Best ${best} / ${NUM_TOTAL}`);
}

/* 고르기 화면. 단계는 기억해 두고 다음에 다시 고르게 하지 않는다. */
function numSetup() {
  $('numBackTxt').textContent = t('게임', 'Games');
  $('numSetupLabel').textContent = t('어떤 단계로 풀어 볼까요?', 'Which level?');
  $('numGo').textContent = t('시작하기', 'Start');
  $('numSetupNote').textContent = t(
    `${NUM_TOTAL}문제. 보기 둘 중에 맞는 읽기를 고르면 됩니다. 로그인 없이 바로 돼요.`,
    `${NUM_TOTAL} questions. Two readings, pick the right one. No sign-in needed.`);
  $('numLv').innerHTML = Object.entries(NUM_LV_TX).map(([id, x]) =>
    `<label><input type="radio" name="numLv" value="${id}"${id === numLevel ? ' checked' : ''}><span>${esc(t(x.ko, x.en))}</span></label>`
  ).join('');
  $('numLvDesc').textContent = t(NUM_LV_TX[numLevel].d.ko, NUM_LV_TX[numLevel].d.en);
  numSyncBest();
  numPanel('numSetup');
}

async function numStart() {
  const makeRound = await needNumbers();
  numRound = makeRound(numLevel, NUM_TOTAL);
  numIdx = 0; numScore = 0; numStreak = 0; numWrongs = []; numBusy = false;
  numPanel('numPlay');
  numDraw();
}

function numMeta() {
  $('numCount').textContent = `${numIdx} / ${NUM_TOTAL}`;
  $('numScore').textContent = numStreak > 1
    ? t(`${numScore} · ${numStreak}연속`, `${numScore} · ${numStreak} in a row`)
    : String(numScore);
  $('numFill').style.width = `${(numIdx / NUM_TOTAL) * 100}%`;
}

function numDraw() {
  const q = numRound[numIdx];
  if (!q) return numFinish();
  numMeta();
  $('numAskLabel').textContent = t('이 숫자는 어떻게 읽을까요?', 'How do you read this?');
  $('numAsk').textContent = q.ask;
  $('numMsg').textContent = '';
  $('numMsg').className = 'claw-msg';
  $('numWhy').classList.add('hidden');

  const box = $('numChoices');
  box.textContent = '';
  // 정답이 늘 왼쪽에 있으면 두 판째부터는 읽지도 않고 왼쪽을 누른다.
  gameShuffle([q.answer, q.wrong]).forEach((text) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'qz-choice';
    b.textContent = text;
    b.addEventListener('click', () => numPick(text, b));
    box.appendChild(b);
  });
  numBusy = false;
}

function numPick(text, btn) {
  if (numBusy) return;
  numBusy = true;
  const q = numRound[numIdx];
  const right = text === q.answer;
  const all = [...$('numChoices').children];
  all.forEach((b) => { b.disabled = true; });

  if (right) {
    numScore++; numStreak++;
    btn.classList.add('right');
    $('numMsg').className = 'claw-msg good';
    $('numMsg').textContent = numStreak >= 3
      ? t(`정답! ${numStreak}연속`, `Correct! ${numStreak} in a row`)
      : t('정답!', 'Correct!');
  } else {
    numStreak = 0;
    numWrongs.push(q);
    btn.classList.add('wrong');
    all.forEach((b) => { if (b.textContent === q.answer) b.classList.add('right'); });
    $('numMsg').className = 'claw-msg bad';
    $('numMsg').textContent = t(`「${q.answer}」 예요.`, `It is “${q.answer}”.`);
  }
  /* 규칙은 맞았을 때도 보여 준다. 둘 중 하나라 찍어서 맞히는 사람이 많고,
     그 사람이 바로 다음 판 같은 자리에서 틀린다. */
  $('numWhy').textContent = q.why;
  $('numWhy').classList.remove('hidden');

  numIdx++;
  numMeta();
  setTimeout(() => {
    // 그새 화면을 떠났으면 그만둔다. 안 보이는 곳에서 다음 문제를 그리면
    // 돌아왔을 때 판이 저 혼자 끝나 있다.
    if ($('numPlay').classList.contains('hidden')) return;
    numDraw();
  }, right ? 900 : 2300);
}

function numFinish() {
  gameBest(numBestKey(numLevel), numScore);
  numSyncBest();
  const pct = numScore / NUM_TOTAL;
  $('numOverEmoji').textContent = '';
  $('numOverScore').textContent = `${numScore} / ${NUM_TOTAL}`;
  $('numOverLine').textContent = pct === 1
    ? t('전부 맞혔어요. 다음 단계로 올려 볼까요?', 'All correct. Ready for the next level?')
    : t(`${numLvName()} 단계`, `${numLvName()} level`);
  // 틀린 것만 모아 다시 보여 준다. 점수만 보고 나가면 무엇을 틀렸는지 모른다.
  $('numWrongs').innerHTML = numWrongs.map((q) =>
    '<div class="num-wrong-row">' +
      `<div class="num-wrong-q">${esc(q.ask)}</div>` +
      `<div class="num-wrong-a">${esc(q.answer)}</div>` +
      `<div class="num-wrong-w">${esc(q.why)}</div>` +
    '</div>').join('');
  $('numAgain').textContent = t('다시 하기', 'Play again');
  $('numToGames').textContent = t('단계 바꾸기', 'Change level');
  numPanel('numOver');
}


/* 언어를 바꾸면 보고 있던 칸을 다시 그린다. 전부 자바스크립트가 넣은 글이라
   data-en 이 못 붙는다. */
function numSyncLang() {
  if (!showing('numView')) return;
  if (!$('numSetup').classList.contains('hidden')) numSetup();
  else if (!$('numOver').classList.contains('hidden')) numFinish();
  else {
    $('numBackTxt').textContent = t('게임', 'Games');
    $('numAskLabel').textContent = t('이 숫자는 어떻게 읽을까요?', 'How do you read this?');
    numMeta(); numSyncBest();
  }
}
