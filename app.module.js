/* 치즈감자 — 단어장 · 커리큘럼 · TOPIK (모듈)

   Supabase 를 브라우저에서 바로 부른다. GitHub Pages 에는 서버가 없지만
   그럴 필요도 없다. 데이터를 지키는 건 키가 아니라 RLS 라서, 로그인한
   본인 행만 돌아온다.

   type="module" 이라 app.js 가 먼저 다 돈 뒤에 실행된다(모듈은 늘
   defer 다). 그래서 ptShow / applyLang 을 여기서 그냥 부를 수 있다. */

/* 예전에는 이 둘을 esm.sh 에서 바로 받아 왔다. 그러면 esm.sh 가 뚫리는
   날 우리 로그인 창 안에서 남의 코드가 돈다 — 서버가 없어도 계정은
   털린다. 게다가 '@2' 는 버전이 아니라 범위라서, 내가 아무것도 안 해도
   어느 날 갑자기 다른 코드가 실려 왔다.
   이제 vendor/ 안에 받아 두고 CSP 로 바깥을 막는다. 버전을 올릴 때는
   tools/vendor.mjs 의 PIN 을 고치고 다시 돌린다. */
import { createClient } from './vendor/supabase-js.js?v=f25cd6fd';
// 앱(package.json)과 같은 줄기를 쓴다. 갈리면 앱에서는 읽히는 파일이
// 여기서는 안 읽히는(또는 그 반대) 일이 생긴다.
/* 엑셀 라이브러리는 422KB — 이 판에서 가장 무거운 조각이다. 그런데 쓰는
   자리는 넷뿐이고 전부 「단추를 눌렀을 때」다 (단어장 내보내기·가져오기,
   자료마당 올리기·받기). 맨 위에 두면 **처음 온 사람도 전부 받는다** —
   첫 화면이 받는 3.3MB 중 422KB 가 눌러 본 적도 없는 단추 몫이었다.

   누를 때 가져온다. 한 번 가져오면 XLSX 에 담아 두므로 두 번 안 받는다.
   자국(?v=)은 tools/stamp.mjs 가 아래 줄에 알아서 붙인다 — 정적으로 쓰든
   동적으로 쓰든 같은 글자를 찾으므로 바꿔도 그대로 찍힌다. */
let XLSX = null;
const needXLSX = async () => (XLSX ??= await import('./vendor/xlsx.js?v=f25cd6fd'));
// 커리큘럼. 내용과 엔진을 갈라 두면 글을 고치다 화면을 깨지 않는다.
import { COURSES } from './courses.js?v=f25cd6fd';
import { GLOSSARY, GLOSS_LANGS } from './glossary.js?v=f25cd6fd';
import { glossFind } from './gloss-find.js?v=f25cd6fd';
import { GRAMMAR } from './grammar.js?v=f25cd6fd';
import { GRAMMAR_EN } from './grammar-en.js?v=f25cd6fd';
import { grammarScan } from './grammar-find.js?v=f25cd6fd';
import { TW_ITEMS, TW_QS } from './topik-writing.js?v=f25cd6fd';
import { TOPIKL_BY_EXAM, TOPIKL_PICTURE_SLOTS } from './topik-listening.js?v=f25cd6fd';
import { SB_CATS, SB_MORE, SB_SEED } from './sentences.js?v=f25cd6fd';
// 읽기 연습 지문. 길이(short·long) × 급수 여섯 칸.
// TOPIK 유형 연습문제. 기출이 아니라 자체 제작이다.
// 숫자 게임의 읽기와 문제 만들기. 화면을 모르는 순수 계산이라 따로 뒀다.
import { makeRound } from './numbers.js?v=f25cd6fd';

// 이 키는 공개돼도 되는 값이다. 이미 APK 안에 같은 것이 들어 있고,
// 접근을 막는 건 키가 아니라 테이블에 걸린 RLS 다.
// service_role 키는 절대 여기 두지 않는다.
const SB_URL = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc';

const sb = createClient(
  SB_URL,
  SB_ANON,
  {
    auth: {
      // 앱은 이 값을 false 로 둔다 — 커스텀 스킴(cheesepotato://)으로 돌아올 때
      // 주소가 잘려서 직접 파싱해야 했기 때문이다. 웹은 평범한 https 라
      // 그 문제가 없으니 SDK 가 ?code= 를 알아서 세션으로 바꾸게 둔다.
      detectSessionInUrl: true,
      // 기본값은 implicit 이라 명시해야 한다. 그 방식은 토큰을 # 뒤에 싣는다.
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

const $ = (id) => document.getElementById(id);
const isEn = () => document.documentElement.lang === 'en';
const t = (ko, en) => (isEn() ? en : ko);

// 한 번에 한 장만 보여준다. 상태를 각자 토글하면 두 개가 겹쳐 뜬다.
const PANELS = ['wbAuth', 'wbLoading', 'wbListWrap', 'wbEmpty', 'wbError'];
function panel(name) {
  PANELS.forEach((k) => $(k).classList.toggle('hidden', k !== name));
}

/* ══ 늦게 받는 자료 ═════════════════════════════════════════════
   시험지와 읽기 지문은 합쳐 438KB 다. 맨 위에서 받으면 첫 화면만 보고
   나가는 사람도 전부 받는데, 그 사람은 TOPIK 을 누르지도 않았다.

   갈래에 들어갈 때 받는다. open('learn') 이 미리 불을 붙여 두므로
   (warmLearn) 갈래 목록을 보는 동안 받아지고, 실제로 기다리는 일은
   거의 없다. 그래도 쓰기 전에 반드시 await 한다 — 「거의 없다」에 기대면
   느린 망에서만 빈 화면이 나오고, 그건 재현이 안 돼서 못 고친다. */
const TQ_DATA = { I: null, II: null };
let tqDataP = null;
const tqNeedData = () => (tqDataP ??= Promise.all([
  import('./topik.js?v=f25cd6fd'), import('./topik2.js?v=f25cd6fd'),
]).then(([a, b]) => {
  TQ_DATA.I  = { reading: a.TOPIK_READING,  blueprint: a.TOPIK_BLUEPRINT,  slots: a.TOPIK_SLOTS };
  TQ_DATA.II = { reading: b.TOPIK2_READING, blueprint: b.TOPIK2_BLUEPRINT, slots: b.TOPIK2_SLOTS };
}));

let READING = null, rdP = null;
const rdNeed = () => (rdP ??= import('./reading.js?v=f25cd6fd').then((m) => { READING = m.READING; }));

/* 배우기를 열면 둘 다 미리 부른다. 기다리지 않는다 — 갈래 목록은 이
   자료가 없어도 그려지고, 사람이 갈래를 고르는 사이에 도착한다. */
const warmLearn = () => { tqNeedData(); rdNeed(); };

// 게임 목록과 그 아래 게임들. 새 게임을 더하면 여기에도 넣는다.
const GAME_VIEWS = ['games', 'claw', 'match', 'quiz', 'num'];

/* 화면 전환. 'home' | 'wordbook' | 'account' 셋을 여기서 다룬다.
   발음 테스트는 위 고전 스크립트의 ptShow 가 주인이라 여기서는 닫기만 한다. */
function open(view) {
  /* 모의고사를 푸는 중이면 먼저 묻는다. 라우터가 몰고 있는 중이면 그쪽에서
     이미 물었으므로 건너뛴다. */
  if (!window.cpRouteBusy?.() && window.cpBlockLeave?.()) return;
  // 발음 테스트가 열려 있었다면 표시를 거둔다.
  $('navBtn').classList.remove('on');

  $('homeView').classList.toggle('hidden', view !== 'home');
  $('testView').classList.add('hidden');
  $('wordbookView').classList.toggle('hidden', view !== 'wordbook');
  $('authView').classList.toggle('hidden', view !== 'account');
  $('libraryView').classList.toggle('hidden', view !== 'library');
  $('dictView').classList.toggle('hidden', view !== 'dictionary');
  $('dashView').classList.toggle('hidden', view !== 'dashboard');
  $('gamesView').classList.toggle('hidden', view !== 'games');
  $('clawView').classList.toggle('hidden', view !== 'claw');
  $('matchView').classList.toggle('hidden', view !== 'match');
  $('quizView').classList.toggle('hidden', view !== 'quiz');
  $('numView').classList.toggle('hidden', view !== 'num');
  $('learnView').classList.toggle('hidden', view !== 'learn');
  $('lessonView').classList.toggle('hidden', view !== 'lesson');

  // 레슨 안에 있는 동안에도 '배우기' 는 켜 둔다. 꺼지면 길을 잃는다.
  $('learnBtn').classList.toggle('on', view === 'learn' || view === 'lesson');
  if (view !== 'lesson') lsLeave();

  $('wbBtn').classList.toggle('on', view === 'wordbook');
  $('authBtn').classList.toggle('on', view === 'account');
  $('libBtn').classList.toggle('on', view === 'library');
  $('dictBtn').classList.toggle('on', view === 'dictionary');
  $('dashBtn').classList.toggle('on', view === 'dashboard');
  // 게임 하나하나도 게임 밑에 있다. 게임 안에 들어가 있는 동안
  // 메뉴에서 게임이 꺼져 보이면 길을 잃는다.
  $('gameBtn').classList.toggle('on', GAME_VIEWS.includes(view));

  /* 나가면 돌던 것을 멈춘다. 집게는 안 보이는 화면에서 매 프레임 돌고,
     퀴즈 시계는 돌아왔을 때 이미 끝나 있게 만든다. */
  if (view !== 'claw') clawStop();
  if (view !== 'quiz') qzStop();
  /* TOPIK 을 풀며 표시해 둔 낱말이 있으면 단어장 맨 위에 내건다.
     여기 두면 단추로 들어오든 메뉴로 들어오든 주소로 들어오든 다 걸린다. */
  if (view === 'wordbook') wbPendingDraw();
  /* 배우기·레슨에 들어오면 시험지와 지문을 미리 부른다. 기다리지 않는다 —
     사람이 갈래를 고르는 사이에 도착한다. */
  if (view === 'learn' || view === 'lesson') warmLearn();
  window.scrollTo({ top: 0, behavior: 'auto' });
  window.cpMark(view);
}

/* 주소로 바로 들어오는 길. 버튼을 눌러 들어올 때 같이 하던 불러오기까지
   여기서 한다 — 안 하면 #dashboard 로 들어온 사람은 빈 대시보드를 본다. */
window.cpOpen = function (view, sub) {
  open(view);
  if (view === 'account') loadAccount();
  if (view === 'library') loadLibrary();
  if (view === 'dashboard') loadDashboard();
  if (view === 'dictionary') dictDraw();
  /* 배우기는 헤더 버튼이 open() 말고 진도 읽기와 갈래 그리기를 더 한다.
     그 둘이 빠지면 갈래 카드가 하나도 없는 빈 배우기가 열린다.
     먼저 그려 두고 진도를 받아 다시 그린다 — 네트워크를 기다리는 동안
     빈 화면을 보이지 않으려는 것이다. 진도를 못 읽어도 화면은 나온다. */
  // 숫자 게임은 판을 도중부터 못 여니 단계 고르기 화면으로 연다.
  if (view === 'num') numSetup();
  if (view === 'learn') {
    backToSections();
    /* 주소에 갈래가 적혀 있으면 그 갈래를 연다. backToSections 뒤에 부르는
       이유 — 먼저 목록으로 돌려 놓아야 앞서 열려 있던 갈래가 안 겹친다. */
    if (sub) openLearnSub(sub);
    /* 진도를 받은 뒤에 화면을 다시 그린다. 여태 무조건 backToSections 였는데,
       그러면 #learn/topik 으로 들어온 사람이 진도가 도착하는 순간 갈래
       목록으로 튕긴다. 갈래 안에 있으면 그 갈래만 새로 그린다. */
    loadProgress().then(() => {
      if (!lsecOpen) backToSections();
      else if (lsecOpen === 'courses') drawCourses();
    }, () => {});
  }
};

const showing = (id) => !$(id).classList.contains('hidden');

$('wbBtn').addEventListener('click', () => open(showing('wordbookView') ? 'home' : 'wordbook'));
$('authBtn').addEventListener('click', () => {
  if (showing('authView')) return open('home');
  open('account');
  loadAccount();   // 로그인 상태면 프로필과 설정을 채운다
});
$('libBtn').addEventListener('click', () => { const go = !showing('libraryView'); open(go ? 'library' : 'home'); if (go) loadLibrary(); });
$('libGoLogin').addEventListener('click', () => open('account'));
$('dictBtn').addEventListener('click', () => { const go = !showing('dictView'); open(go ? 'dictionary' : 'home'); if (go) dictDraw(); });
$('dashBtn').addEventListener('click', () => { const go = !showing('dashView'); open(go ? 'dashboard' : 'home'); if (go) loadDashboard(); });
// 게임 하나에 들어가 있을 때 눌러도 목록으로 돌아온다 — 한 단계 위가
// 홈이 아니라 목록이어야 다른 게임으로 건너갈 수 있다.
$('gameBtn').addEventListener('click', (e) => {
  /* 사이드 메뉴에서는 이 단추가 「펼치기」다 — 안에 게임 넷이 따로 있어서
     굳이 목록 화면을 거칠 이유가 없다. 펼치기는 app.js 가 맡으므로 여기서는
     비켜 준다. 안 비키면 누르는 순간 게임 화면으로 넘어가 버려서 방금 편
     것을 못 본다.
     (머리띠로 다시 옮기면 side-parent 가 아니게 되어 예전처럼 움직인다.) */
  if (e.currentTarget.classList.contains('side-parent')) return;
  // 게임 하나에 들어가 있으면 한 단계 위는 홈이 아니라 목록이다.
  if (showing('clawView') || showing('matchView') || showing('quizView') || showing('numView')) return open('games');
  open(showing('gamesView') ? 'home' : 'games');
});
$('dashGoLogin').addEventListener('click', () => open('account'));
$('dashGoLib').addEventListener('click', () => { open('library'); loadLibrary(); });
$('dashRetry').addEventListener('click', loadDashboard);
$('wbGoLogin').addEventListener('click', () => open('account'));
$('auGoWb').addEventListener('click', () => open('wordbook'));

// 로고를 누르면 어느 화면에 있든 홈으로 돌아온다.
$('brandBtn').addEventListener('click', () => window.ptShow(false));

// 헤더의 다운로드는 홈에 있는 자리를 가리킨다. 단어장이나 발음 테스트에서
// 눌렀을 때 아무 데도 못 가지 않도록 홈을 먼저 연 뒤 내려간다.
$('hdCta').addEventListener('click', (ev) => {
  ev.preventDefault();
  window.ptShow(false);
  setTimeout(() => $('download')?.scrollIntoView({ behavior: 'smooth' }), 60);
});

// ── 오류 문구 ────────────────────────────────────────────────
// 서버가 주는 말은 기술적이라 그대로 보여주지 않는다.
function showErr(text) {
  $('auOk').classList.add('hidden');
  const el = $('wbErr');
  el.textContent = text;
  el.classList.remove('hidden');
}
function showOk(text) {
  $('wbErr').classList.add('hidden');
  const el = $('auOk');
  el.textContent = text;
  el.classList.remove('hidden');
}
function hideErr() {
  $('wbErr').classList.add('hidden');
  $('auOk').classList.add('hidden');
}

function loginMsg(error) {
  const m = (error?.message || '').toLowerCase();
  if (m.includes('invalid login'))
    return t('이메일 또는 비밀번호가 맞지 않아요.', 'Email or password is incorrect.');
  if (m.includes('email not confirmed'))
    return t('이메일 인증을 먼저 마쳐주세요.', 'Please confirm your email first.');
  return t('로그인에 실패했어요. 잠시 후 다시 시도해 주세요.', 'Sign-in failed. Please try again.');
}

function signUpMsg(error) {
  const m = (error?.message || '').toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered'))
    return t('이미 가입된 이메일이에요. 로그인 탭에서 들어와 주세요.',
             'That email is already registered. Use the sign-in tab.');
  if (m.includes('password'))
    return t('비밀번호가 조건에 맞지 않아요.', 'That password does not meet the requirements.');
  if (m.includes('rate limit') || m.includes('too many'))
    return t('잠시 후 다시 시도해 주세요.', 'Too many attempts. Please try again shortly.');
  return t('가입에 실패했어요. 잠시 후 다시 시도해 주세요.', 'Sign-up failed. Please try again.');
}

// ── 사진 ─────────────────────────────────────────────────────
// DB 에는 저장 경로가 들어 있고 볼 때마다 짧게 유효한 주소를 발급받는다.
// 예전 데이터에는 공개 URL 이 그대로 들어 있어 http 로 시작하면 통과시킨다.
// (앱의 src/lib/images.ts getDisplayUrl 과 같은 규칙)
async function signedUrl(stored) {
  if (!stored) return null;
  if (stored.startsWith('http')) return stored;
  const { data, error } = await sb.storage
    .from('word-images')
    .createSignedUrl(stored, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// ── 목록 ─────────────────────────────────────────────────────
let rows = [];

// 품사와 색은 앱 src/lib/tags.ts 의 TAGS · TAG_COLORS 와 같은 값이다.
// 한쪽만 고치면 같은 단어가 앱과 웹에서 다른 색으로 보인다.
const TAGS = ['명사', '동사', '형용사', '부사', '접속사', '관용구'];
const TAG_EN = { '명사':'Noun', '동사':'Verb', '형용사':'Adjective', '부사':'Adverb', '접속사':'Conjunction', '관용구':'Idiom',
  // 고를 수 있는 여섯 가지는 아니지만(TAGS), 모의고사 낱말 표시에서 사전 품사로
  // 자동으로 붙을 수 있어 영어 이름도 마련해 둔다 — 없으면 EN 화면에 한국어가 섞인다.
  '대명사':'Pronoun', '감탄사':'Interjection' };
const TAG_COLORS = {
  '명사':'#FF914D', '동사':'#4CAF50', '형용사':'#2196F3', '부사':'#9C27B0',
  '접속사':'#FF7043', '전치사':'#00897B', '대명사':'#5C6BC0', '감탄사':'#EC407A', '관용구':'#8D6E63',
};
// 목록에서 뺀 품사(전치사 등)나 예전 값이 와도 색이 나오게 기본값을 둔다.
const tagHue = (tag) => TAG_COLORS[tag ?? ''] ?? '#9A8B78';

// 보기 방식은 기억해 둔다. 매번 목록으로 돌아가면 성가시다.
let viewMode = localStorage.getItem('wbView') === 'grid' ? 'grid' : 'list';
let sortType = 'newest';
let query = '';
let tagOn = null;    // null = 전체
let doneOn = null;   // null = 전체, true = 외운 것, false = 학습 중

function setCount(shown) {
  $('wbCount').textContent = shown === rows.length
    ? t(`단어 ${rows.length}개`, `${rows.length} words`)
    : t(`${rows.length}개 중 ${shown}개`, `${shown} of ${rows.length}`);
}

function visibleWords() {
  const q = query.trim().toLowerCase();
  /* TOPIK 풀이 중 담은 단어는 사전 기본형("예쁘다")으로 저장되는데,
     찾을 때는 지문에서 본 활용형("예뻤어요")이 먼저 떠오른다. 그대로
     찾으면 글자가 안 겹쳐 못 찾으므로, 지문 누른 꼴 → 표제어를 찾는
     glossFind 로 한 번 더 풀어서 그 표제어로도 걸리게 한다. */
  const qHead = q && glossFind((k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k), query.trim());
  const out = rows.filter((w) => {
    if (tagOn && w.tag !== tagOn) return false;
    if (doneOn !== null && !!w.is_remembered !== doneOn) return false;
    if (!q) return true;
    if ((w.word ?? '').toLowerCase().includes(q)
        || (w.meaning ?? '').toLowerCase().includes(q)
        || (w.example ?? '').toLowerCase().includes(q)) return true;
    return !!qHead && w.word === qHead;
  });

  // 앱 WordbookScreen 의 정렬과 같은 규칙.
  out.sort((a, b) => {
    if (sortType === 'oldest') return a.id - b.id;
    if (sortType === 'remembered') return (b.is_remembered ? 1 : 0) - (a.is_remembered ? 1 : 0);
    if (sortType === 'most_viewed') return (b.view_count || 0) - (a.view_count || 0);
    if (sortType === 'least_viewed') return (a.view_count || 0) - (b.view_count || 0);
    return b.id - a.id;
  });
  return out;
}

function drawChips() {
  const chip = (on, label, dot) =>
    `<button class="wb-chip${on ? ' on' : ''}" data-chip="${label.key}">` +
    (dot ? `<span class="wb-dot" style="background:${dot}"></span>` : '') +
    `${esc(label.text)}</button>`;

  const parts = [
    chip(!tagOn && doneOn === null, { key: 'all', text: t('전체', 'All') }, null),
    chip(doneOn === true,  { key: 'done',  text: t('외운 단어', 'Memorized') }, null),
    chip(doneOn === false, { key: 'learn', text: t('학습 중', 'Learning') }, null),
    ...TAGS.map((tg) => chip(tagOn === tg, { key: 'tag:' + tg, text: t(tg, TAG_EN[tg] ?? tg) }, tagHue(tg))),
  ];
  $('wbChips').innerHTML = parts.join('');
}

function render() {
  const shown = visibleWords();
  setCount(shown.length);
  drawChips();

  const list = $('wbList');
  list.classList.toggle('grid', viewMode === 'grid');
  $('wbViewList').classList.toggle('on', viewMode === 'list');
  $('wbViewGrid').classList.toggle('on', viewMode === 'grid');
  list.innerHTML = '';

  $('wbNone').classList.toggle('hidden', shown.length > 0);
  if (shown.length === 0) {
    $('wbNone').textContent = query
      ? t(`"${query}" 와 맞는 단어가 없어요.`, `Nothing matches "${query}".`)
      : t('조건에 맞는 단어가 없어요.', 'No words match those filters.');
    return;
  }

  for (const w of shown) {
    const el = document.createElement('div');
    el.className = 'wb-item' + (w.is_remembered ? ' done' : '');
    el.dataset.id = w.id;   // 눌렀을 때 어느 단어인지 찾는다
    el.innerHTML =
      (w.image_url ? '<img class="wb-thumb" alt="">' : '<div class="wb-noimg">🥔</div>') +
      '<div class="wb-main">' +
        `<div class="wb-word">${esc(w.word)}` +
          (w.is_remembered ? `<span class="wb-done">✓</span>` : '') +
        '</div>' +
        /* TOPIK 을 풀며 눌러 담은 낱말은 뜻이 비어 있다 — 우리가 지어내
           넣지 않기 때문이다. 빈 줄로 두면 고장난 것처럼 보이니 채우라고
           말해 준다. 누르면 여느 단어와 똑같이 고치는 자리가 열린다. */
        (w.meaning
          ? `<div class="wb-mean">${esc(w.meaning)}</div>`
          : `<div class="wb-mean wb-nomean">${esc(t('뜻을 채워 주세요', 'Add a meaning'))}</div>`) +
        // 예문과 품사는 나중에 붙은 것이라 예전 단어에는 비어 있다.
        (w.example ? `<div class="wb-ex">${esc(w.example)}</div>` : '') +
        (w.tag ? `<span class="wb-tag" style="color:${tagHue(w.tag)}">${esc(t(w.tag, TAG_EN[w.tag] ?? w.tag))}</span>` : '') +
      '</div>';
    list.appendChild(el);

    // 사진은 한 장씩 따로 발급한다. 한 장이 실패해도 그 자리만 비고
    // 나머지 목록은 그대로 남는다.
    if (w.image_url) {
      const img = el.querySelector('.wb-thumb');
      signedUrl(w.image_url)
        .then((u) => { if (u) img.src = u; else img.replaceWith(Object.assign(document.createElement('div'), { className: 'wb-noimg', textContent: '🥔' })); })
        .catch(() => img.remove());
    }
  }
}

$('wbSearch').addEventListener('input', (e) => { query = e.target.value; render(); });
$('wbSort').addEventListener('change', (e) => { sortType = e.target.value; render(); });
$('wbViewList').addEventListener('click', () => { viewMode = 'list'; localStorage.setItem('wbView', 'list'); render(); });
$('wbViewGrid').addEventListener('click', () => { viewMode = 'grid'; localStorage.setItem('wbView', 'grid'); render(); });

$('wbChips').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-chip]');
  if (!b) return;
  const key = b.dataset.chip;
  if (key === 'all')        { tagOn = null; doneOn = null; }
  else if (key === 'done')  { doneOn = doneOn === true ? null : true; }
  else if (key === 'learn') { doneOn = doneOn === false ? null : false; }
  else if (key.startsWith('tag:')) {
    const tg = key.slice(4);
    tagOn = tagOn === tg ? null : tg;
  }
  render();
});

// ══ 국어사전 ═════════════════════════════════════════════════
// 첫 화면 "낱말·문법 사전" 카드가 예전엔 자료마당(엑셀 내려받기)으로
// 보냈다 — 사전이라 적어 놓고 실제로 찾아볼 사전 화면이 없었다.
// 새 자료를 안 받아 온다: glossary.js 는 이미 늘 받아 두는 파일이라
// (tqGloss 가 동기로 써야 해서 지연 로딩을 안 한다), 여기서 표제어만
// 한 번 추려 쓰면 된다.

/* GLOSSARY 는 활용형까지 다 키로 들어 있다(「아침에」·「아침을」…).
   사전 화면은 활용형이 아니라 표제어를 훑어보는 자리라 한 번만 추린다. */
const DICT_ENTRIES = (() => {
  const byHead = new Map();
  Object.values(GLOSSARY).forEach((v) => { if (!byHead.has(v.head)) byHead.set(v.head, v); });
  return [...byHead.values()].sort((a, b) => a.head.localeCompare(b.head, 'ko'));
})();

let dictQuery = '';
let dictTag = null;   // null = 전체
let dictShown = 60;   // 한 번에 그리는 수 — 4천 개를 한꺼번에 그리면 스크롤이 무거워진다
const DICT_PAGE = 60;
let dictOpen = null;  // 지금 "더 보기"(예문·뜻풀이)를 펼쳐 둔 표제어. 한 번에 하나만.

/* 뜻이 둘 이상인 표제어만 담은 자료(글로서리 전체가 아니라 그 절반쯤).
   glossary.js 처럼 늘 받지 않고 국어사전 화면을 열 때만 따로 받는다 —
   평소엔 안 쓰는 522KB 를 첫 화면 모두에게 물릴 까닭이 없다. */
let dictSensesP = null;
const dictLoadSenses = () => (dictSensesP ??=
  import('./glossary-senses.js?v=f25cd6fd').then((m) => m.SENSES).catch(() => ({})));

/* 예문. 국립국어원 자료엔 없어서 Gemini 로 새로 지은 것이다(있는 만큼만
   — docs/glossary-examples-gemini-prompt.md 참고). 뜻풀이와 같은 자리에서
   같이 받는다 — 펼치는 손짓 하나에 몰아 두는 편이 화면이 덜 복잡하다. */
let dictExamplesP = null;
const dictLoadExamples = () => (dictExamplesP ??=
  import('./glossary-examples.js?v=f25cd6fd').then((m) => m.EXAMPLES).catch(() => ({})));

function dictVisible() {
  const q = dictQuery.trim().toLowerCase();
  const qHead = q && glossFind((k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k), dictQuery.trim());
  return DICT_ENTRIES.filter((v) => {
    if (dictTag && v.pos !== dictTag) return false;
    if (!q) return true;
    if (v.head.toLowerCase().includes(q)) return true;
    const meaning = tqGloss(v.head).meaning || '';
    if (meaning.toLowerCase().includes(q)) return true;
    return !!qHead && v.head === qHead;
  });
}

function dictDrawChips() {
  const posCounts = {};
  DICT_ENTRIES.forEach((v) => { if (v.pos) posCounts[v.pos] = (posCounts[v.pos] || 0) + 1; });
  const chip = (on, label) => `<button class="wb-chip${on ? ' on' : ''}" data-dict-chip="${esc(label.key)}">${esc(label.text)}</button>`;
  $('dictChips').innerHTML =
    chip(!dictTag, { key: 'all', text: t('전체', 'All') }) +
    TAGS.concat(['대명사', '감탄사']).filter((tg) => posCounts[tg]).map((tg) =>
      chip(dictTag === tg, { key: tg, text: t(tg, TAG_EN[tg] ?? tg) })).join('');
}

async function dictAdd(word, meaning, tag, btn) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { open('account'); return; }
  const was = btn.textContent;
  btn.disabled = true;
  try {
    const { data: had, error: e1 } = await sb.from('words').select('id').eq('word', word).maybeSingle();
    if (e1) throw e1;
    if (had) {
      btn.textContent = t('이미 있어요', 'Already saved');
    } else {
      const { error: e2 } = await sb.from('words').insert({
        word, meaning: (meaning || '').slice(0, 120), example: null, tag: tag || null,
        difficulty: 1, image_url: null, is_remembered: false, view_count: 0,
        remembered_at: null, user_id: session.user.id,
      });
      if (e2) throw e2;
      btn.textContent = t('담았어요 ✓', 'Saved ✓');
      loadWords();
    }
  } catch (e) {
    btn.textContent = t('실패 — 다시', 'Failed — retry');
  } finally {
    setTimeout(() => { btn.textContent = was; btn.disabled = false; }, 1600);
  }
}

/* 펼친 표제어의 "더 보기" 칸만 따로 그린다(예문 + 뜻풀이 더 보기).
   목록 전체를 다시 그리면 검색창 포커스가 날아가고 스크롤 자리도 잃는다. */
async function dictDrawMore(head) {
  const box = document.querySelector(`.wb-item[data-head="${CSS.escape(head)}"] .dict-senses`);
  if (!box) return;
  const [examples, senses] = await Promise.all([dictLoadExamples(), dictLoadSenses()]);

  const ex = examples[head];
  const exHtml = ex
    ? `<p class="dict-ex"><span class="dict-ex-ko">${esc(ex.ex)}</span>` +
      `<span class="dict-ex-en">${esc(ex.en)}</span></p>`
    : '';

  const list = senses[head];
  const senseHtml = list && list.length
    ? '<ol class="dict-sense-list">' +
      list.map(([ko, en]) =>
        `<li><span class="dict-sense-ko">${esc(ko)}</span>` +
        (en ? `<span class="dict-sense-en">${esc(en)}</span>` : '') + '</li>').join('') +
      '</ol>'
    : (exHtml ? '' : `<p class="dnote">${esc(t('이 표제어는 뜻이 하나예요.', 'This headword has only one sense.'))}</p>`);

  box.innerHTML = exHtml + senseHtml;
}

function dictDraw() {
  dictDrawChips();
  const active = dictQuery || dictTag;
  $('dictMore').style.display = 'none';

  if (!active) {
    /* 검색바만 보이는 첫 화면. 4천 개를 다 늘어놓지 않는다 — 찾아보는
       화면이지 훑어보는 목록이 아니다. */
    $('dictCount').textContent = t(`표제어 ${DICT_ENTRIES.length}개 · 찾아보세요`, `${DICT_ENTRIES.length} headwords — search to begin`);
    $('dictList').innerHTML = '';
    $('dictNone').classList.add('hidden');
    return;
  }

  const shown = dictVisible();
  $('dictCount').textContent = t(`${shown.length}개 찾음`, `${shown.length} found`);

  const list = $('dictList');
  list.innerHTML = '';
  $('dictNone').classList.toggle('hidden', shown.length > 0);
  if (!shown.length) {
    $('dictNone').textContent = dictQuery
      ? t(`"${dictQuery}" 와 맞는 낱말이 없어요.`, `Nothing matches "${dictQuery}".`)
      : t('조건에 맞는 낱말이 없어요.', 'No words match those filters.');
    return;
  }

  const page = shown.slice(0, dictShown);
  page.forEach((v) => {
    const g = tqGloss(v.head);
    const isOpen = dictOpen === v.head;
    const el = document.createElement('div');
    el.className = 'wb-item';
    el.dataset.head = v.head;
    el.innerHTML =
      '<div class="wb-noimg">🥔</div>' +
      '<div class="wb-main">' +
        `<div class="wb-word">${esc(v.head)}</div>` +
        (g.meaning
          ? `<div class="wb-mean">${esc(g.meaning)}</div>`
          : `<div class="wb-mean wb-nomean">${esc(t('뜻풀이 준비 중', 'Definition not ready yet'))}</div>`) +
        (v.pos ? `<span class="wb-tag" style="color:${tagHue(v.pos)}">${esc(t(v.pos, TAG_EN[v.pos] ?? v.pos))}</span>` : '') +
        `<button class="dict-more" type="button" data-dict-toggle="${esc(v.head)}">${esc(isOpen ? t('접기', 'Hide') : t('더 보기', 'More'))}</button>` +
        (isOpen ? '<div class="dict-senses"></div>' : '') +
      '</div>' +
      `<button class="dict-add" type="button" data-dict-add="${esc(v.head)}">${esc(t('+ 담기', '+ Save'))}</button>`;
    list.appendChild(el);
    if (isOpen) dictDrawMore(v.head);
  });

  if (shown.length > page.length) {
    $('dictMore').style.display = '';
    $('dictMore').textContent = t(`더 보기 (${shown.length - page.length})`, `Show more (${shown.length - page.length})`);
  }
}

$('dictSearch').addEventListener('input', (e) => { dictQuery = e.target.value; dictShown = DICT_PAGE; dictOpen = null; dictDraw(); });
$('dictChips').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-dict-chip]');
  if (!b) return;
  const key = b.dataset.dictChip;
  dictTag = key === 'all' ? null : (dictTag === key ? null : key);
  dictShown = DICT_PAGE;
  dictOpen = null;
  dictDraw();
});
$('dictMore').addEventListener('click', () => { dictShown += DICT_PAGE; dictDraw(); });
$('dictList').addEventListener('click', (ev) => {
  const t1 = ev.target.closest('[data-dict-toggle]');
  if (t1) { dictOpen = dictOpen === t1.dataset.dictToggle ? null : t1.dataset.dictToggle; dictDraw(); return; }
  const b = ev.target.closest('[data-dict-add]');
  if (!b) return;
  const head = b.dataset.dictAdd;
  const g = tqGloss(head);
  const v = DICT_ENTRIES.find((x) => x.head === head);
  dictAdd(head, g.meaning, v?.pos, b);
});

let loading = false;
async function loadWords() {
  if (loading) return;
  loading = true;
  panel('wbLoading');
  try {
    const { data, error } = await sb
      .from('words')
      // 정렬·필터에 쓰이는 값까지 한 번에 받는다. 어차피 전부 불러오므로
      // 거르고 줄 세우는 일은 브라우저에서 한다 — 누를 때마다 서버에
      // 다시 물으면 느리고, 단어 수가 그렇게 많지 않다.
      .select('id, word, meaning, example, tag, image_url, created_at, is_remembered, view_count, difficulty, remembered_at')
      .order('created_at', { ascending: false });
    if (error) throw error;

    rows = data ?? [];
    if (rows.length === 0) { panel('wbEmpty'); return; }
    render();
    panel('wbListWrap');
  } catch (e) {
    panel('wbError');
  } finally {
    loading = false;
  }
}

// ── 비밀번호 규칙 ────────────────────────────────────────────
// 앱의 src/lib/password.ts 와 같은 다섯 가지다. 한쪽만 고치면 웹에서
// 만든 비밀번호를 앱이 거부하는(또는 그 반대) 일이 생긴다.
// 실제 강제는 Supabase 대시보드의 Password Requirements 가 한다.
const PW_RULES = [
  { ko: '8자 이상',      en: 'At least 8 characters', test: (p) => p.length >= 8 },
  { ko: '소문자 포함',   en: 'A lowercase letter',    test: (p) => /[a-z]/.test(p) },
  { ko: '대문자 포함',   en: 'An uppercase letter',   test: (p) => /[A-Z]/.test(p) },
  { ko: '숫자 포함',     en: 'A number',              test: (p) => /[0-9]/.test(p) },
  { ko: '특수문자 포함', en: 'A symbol',              test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function drawRules() {
  const pw = $('wbPw').value;
  $('auRules').innerHTML = PW_RULES.map((r) => {
    const ok = r.test(pw);
    return `<div class="au-rule${ok ? ' ok' : ''}">` +
           `<span class="au-mark">${ok ? '✓' : '○'}</span>` +
           `<span>${t(r.ko, r.en)}</span></div>`;
  }).join('');
}

const pwValid = (p) => PW_RULES.every((r) => r.test(p));

// ── 로그인 / 회원가입 ────────────────────────────────────────
let mode = 'in';   // 'in' = 로그인, 'up' = 회원가입

function syncAuthText() {
  const up = mode === 'up';
  // 로그인한 사람에게는 로그인/회원가입 폼이 아니라 계정이 보인다.
  // 제목이 "로그인" 으로 남아 있으면 화면과 어긋난다.
  const signedIn = !$('auSignedIn').classList.contains('hidden');
  $('auTitle').textContent = signedIn ? t('내 계정', 'My account')
                                      : up ? t('회원가입', 'Sign up') : t('로그인', 'Sign in');
  $('wbSubmit').textContent = up ? t('가입하기', 'Create account') : t('로그인', 'Sign in');
  $('auNote').textContent = up
    ? t('여기서 가입하면 앱에서도 같은 계정으로 로그인됩니다.',
        'The account you create here also works in the app.')
    : t('앱에서 쓰는 계정으로 로그인하세요.', 'Sign in with the account you use in the app.');
  $('wbEmail').placeholder = t('이메일', 'Email');
  $('wbPw').placeholder = t('비밀번호', 'Password');
  $('auPw2').placeholder = t('비밀번호 확인', 'Confirm password');
  $('wbPw').setAttribute('autocomplete', up ? 'new-password' : 'current-password');
}

function setMode(next) {
  mode = next;
  const up = next === 'up';
  $('auTabIn').classList.toggle('on', !up);
  $('auTabUp').classList.toggle('on', up);
  $('auUpOnly').classList.toggle('hidden', !up);
  hideErr();
  syncAuthText();
  if (up) drawRules();
}

$('auTabIn').addEventListener('click', () => setMode('in'));
$('auTabUp').addEventListener('click', () => setMode('up'));
$('wbPw').addEventListener('input', () => { if (mode === 'up') drawRules(); });

$('wbGoogle').addEventListener('click', async () => {
  hideErr();
  // 구글에 다녀오면 페이지가 처음부터 다시 뜬다. 그때 단어장을 도로
  // 열어주려고 표시를 남긴다. 안 하면 로그인하고 홈 화면을 보게 된다.
  sessionStorage.setItem('wbReturning', '1');
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/' },
  });
  if (error) {
    sessionStorage.removeItem('wbReturning');
    showErr(t('구글 로그인을 시작하지 못했어요.', 'Could not start Google sign-in.'));
  }
});

$('wbForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  hideErr();

  const email = $('wbEmail').value.trim();
  const password = $('wbPw').value;

  if (mode === 'up') {
    if (!pwValid(password)) {
      showErr(t('비밀번호 조건을 모두 채워주세요.', 'Please meet all password requirements.'));
      return;
    }
    if (password !== $('auPw2').value) {
      showErr(t('비밀번호 확인이 일치하지 않아요.', 'The two passwords do not match.'));
      return;
    }
  }

  const btn = $('wbSubmit');
  btn.disabled = true;

  if (mode === 'up') {
    const { data, error } = await sb.auth.signUp({ email, password });
    btn.disabled = false;
    if (error) { showErr(signUpMsg(error)); return; }
    // 이메일 확인이 켜져 있으면 세션 없이 돌아온다. 그때는 메일을
    // 열어야 하므로 화면을 넘기지 않고 안내만 남긴다.
    if (!data.session) {
      showOk(t('가입 확인 메일을 보냈어요. 메일을 열어 인증을 마쳐주세요.',
               'We sent a confirmation email. Open it to finish signing up.'));
      return;
    }
    // 세션이 바로 오면 아래 onAuthStateChange 가 화면을 넘긴다.
    return;
  }

  const { error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false;
  if (error) {
    showErr(loginMsg(error));
    // 비밀번호만 비운다. 이메일까지 지우면 다시 다 쳐야 한다.
    $('wbPw').value = '';
  }
});

async function signOut() {
  await sb.auth.signOut();
  open('home');
}
// 로그아웃은 계정 화면에만 둔다. 단어장 자리에는 엑셀이 들어갔다 —
// 단어를 보다가 실수로 누를 만한 곳에 있을 버튼이 아니다.
$('auLogout').addEventListener('click', signOut);

$('wbRetry').addEventListener('click', loadWords);

$('wbDl').addEventListener('click', () => {
  window.ptShow(false);
  setTimeout(() => $('download')?.scrollIntoView({ behavior: 'smooth' }), 60);
});

// ── 로그인 상태 ──────────────────────────────────────────────
// 머리띠(authBtn)와 사이드 메뉴(sideAuthBtn)가 같은 상태를 보여줘야
// 한다 — 폰에서는 머리띠 것이 숨고 사이드 것만 남으므로, 한쪽만 맞추면
// 다른 쪽이 낡은 채로 남는다.
function paintAuthNav(signedIn) {
  [$('authBtn'), $('sideAuthBtn')].forEach((btn) => {
    if (!btn) return;
    btn.querySelector('.nav-ico').textContent = signedIn ? '🧀' : '👤';
    btn.querySelector('.nav-txt').textContent = signedIn ? t('내 계정', 'Account') : t('로그인', 'Sign in');
    btn.setAttribute('aria-label', signedIn ? '내 계정' : '로그인');
  });
}

// 페이지를 처음 열 때도 한 번 불리므로 시작 상태를 따로 챙길 필요가 없다.
sb.auth.onAuthStateChange((_event, session) => {
  hideErr();

  // 헤더와 계정 화면을 상태에 맞춘다.
  paintAuthNav(!!session);
  $('auForms').classList.toggle('hidden', !!session);
  $('auSignedIn').classList.toggle('hidden', !session);
  syncAuthText();   // 제목이 "로그인" ↔ "내 계정" 으로 따라와야 한다
  if (session) $('auWho').textContent = session.user?.email ?? '';

  /* 게임을 열어 둔 채로 로그인 상태가 바뀌었다면 그 자리에서 다시
     판정한다. 로그아웃했는데 앞사람 단어가 그대로 떠 있으면 안 된다.
     (단어는 각 게임이 판마다 다시 읽으므로 여기서 비울 것은 없다.) */
  /* TOPIK 연습은 로그인 없이 맛만 볼 수 있다. 상태가 바뀌면 지금 풀던
     자리에서 바로 반영한다 — 벽에 막혀 있다가 로그인하고 돌아오면
     그 문항이 열려 있어야 한다. */
  tqSignedIn = !!session;
  /* 「로그인하고 담기」를 누르고 돌아왔을 수 있다. 표시해 둔 낱말이
     있으면 단어장 맨 위에 다시 내건다. */
  wbPendingDraw();
  if (tqRound.length && !$('tqPlay').classList.contains('hidden')) {
    // 벽에 막혀 멈춰 두었던 시계를 다시 돌린다.
    if (tqMock && tqSignedIn && !tqTick && tqLeft > 0) tqRunClock();
    tqDraw();
  }
  if (showing('clawView')) clawStart();
  if (showing('matchView')) mtStart();
  if (showing('quizView')) qzStart();

  // 자료마당의 삭제 버튼은 로그인 상태에 따라 붙었다 떨어진다.
  libSession = session;
  if (libRows.length) renderLibrary();
  if (!session) {
    formOpen = false;
    $('libForm').classList.add('hidden');
    $('libNeedLogin').classList.add('hidden');
    dashSettings = null;
    dashAiUsed = null;
    dashPronUsed = null;
    dashPanel('dashNeedLogin');
    // 열려 있던 단어 폼도 닫는다. 남겨두면 로그아웃한 채로 저장을 누르게 된다.
    $('wbForm2').classList.add('hidden');
    editingId = null;
  }

  if (session) {
    $('wbPw').value = '';
    $('auPw2').value = '';
    loadWords();
    // 로그인하려고 계정 화면에 있었다면 곧바로 단어장으로 넘겨준다.
    if (showing('authView')) open('wordbook');
  } else {
    rows = [];
    $('wbPw').value = '';
    $('auPw2').value = '';
    panel('wbAuth');
  }
});

// ── 언어 ─────────────────────────────────────────────────────
// 앱의 ui_lang 을 읽지 않고 이 페이지의 토글을 따른다. 웹에서 언어를
// 바꿨는데 앱 설정으로 되돌아가면 고장으로 보인다.
function syncLang() {
  syncAuthText();
  if (mode === 'up') drawRules();
  // 칩과 품사 이름까지 언어를 따라야 하므로 통째로 다시 그린다.
  if (rows.length) render();
  $('wbSearch').placeholder = t('단어 · 뜻 검색', 'Search words and meanings');
  // 단어 폼 — 품사·난이도 칩은 글이라 다시 그린다.
  $('wfWord').placeholder = t('단어', 'Word');
  $('wfMean').placeholder = t('뜻', 'Meaning');
  $('wfEx').placeholder = t('예문 (선택)', 'Example sentence (optional)');
  if (!$('wbForm2').classList.contains('hidden')) {
    const keepTag = $('wfTag').value;
    drawWfTag(); $('wfTag').value = keepTag;   // 다시 그리면 고른 값이 풀린다
    drawWfDiff();
    syncWfText();
  }
  // 내 계정 — 프로필
  $('acNameIn').placeholder = t('이름', 'Name');
  if (!acAvatarFile) $('acPhotoTxt').textContent = t('사진 고르기', 'Choose a photo');
  if (!$('acNameIn').value.trim() && $('acName').textContent) {
    $('acName').textContent = t('이름 없음', 'No name');
  }
  // 설정 — 언어 목록도 번역된다.
  if (!$('setBody').classList.contains('hidden')) {
    const s = $('stStudy').value, n = $('stNative').value;
    langOptions($('stStudy')); langOptions($('stNative'));
    $('stStudy').value = s; $('stNative').value = n;
    setCalc();
  }
  // 배우기 — 잠금 안내·분·문제 수가 글이라 다시 그린다.
  // 갈래 카드도 글이다. 숨겨져 있어도 내용이 있으면 다시 그린다 —
  // 건너뛰면 다시 열었을 때 예전 언어가 그대로 남는다.
  if ($('lsecList').childElementCount) drawSections();
  if ($('lcList').childElementCount) drawCourses();
  if ($('sbCats').childElementCount) sbShow(sbPoint);
  /* 읽기는 고르개·안내·카드가 전부 자바스크립트가 넣은 글이다.
     펼쳐 둔 글과 이미 낸 답은 다시 그리면 사라지므로, 아직 아무것도
     안 펼쳤을 때만 새로 그린다. */
  if ($('rdList').childElementCount && !rdOpen) drawReading();
  if (!$('llWrap').classList.contains('hidden')) drawLessonRows();
  // 갈래 제목과 "준비 중" 안내도 자바스크립트가 넣은 글이다.
  if (lsecOpen) openSection(lsecOpen);
  // 사용법이 열려 있으면 그 속도 자바스크립트가 넣은 글이다.
  if (guideOpen) drawGuide(guideOpen);
  // 대시보드는 요일·단위까지 글로 되어 있어 통째로 다시 그린다.
  // 숨김 여부가 아니라 내용 유무로 판단한다 — 숨겨져 있을 때 건너뛰면
  // 다시 열었을 때 예전 언어가 그대로 남는다.
  if ($('dashBody').childElementCount && rows.length) renderDashboard();
  // 숫자 게임과 TOPIK 연습도 통째로 자바스크립트가 넣은 글이다.
  numSyncLang();
  tqSyncLang();
  // 자료마당의 받기·삭제 버튼 글자도 같이 바꾼다.
  if (libRows.length) renderLibrary();
  if (!pendingWords) $('libFileLabel').textContent = t('엑셀(.xlsx) 또는 .csv 파일 고르기', 'Choose an .xlsx or .csv file');
  $('libTitle').placeholder = t('제목', 'Title');
  $('libDesc').placeholder = t('한 줄 설명 (선택)', 'One-line description (optional)');
  $('libReportDetail').placeholder = t('덧붙일 말 (선택)', 'Anything to add (optional)');
  // 게임의 안내와 버튼. 문제·답은 사람이 넣은 단어라 번역하지 않는다.
  if (showing('clawView')) {
    clawSyncStatic();
    if (clawDone) clawSyncOver();
  }
  if (showing('matchView')) {
    mtSyncStatic();
    if (mtDone) mtSyncOver();
  }
  if (showing('quizView')) {
    qzSyncStatic();
    if (qzDone) qzSyncOver();
  }

  /* 선택상자와 숫자칸에는 화면에 보이는 이름이 없거나 옆에 떨어져 있다.
     그대로 두면 스크린리더가 "콤보 상자" 라고만 읽는다. 여기서 붙여야
     언어를 바꿀 때 같이 바뀐다. */
  const aria = {
    wbSort:       t('정렬 기준', 'Sort by'),
    wfTag:        t('품사', 'Part of speech'),
    stStudy:      t('공부할 언어', 'Language you are learning'),
    stNative:     t('모국어', 'Your own language'),
    stStudyOther: t('공부할 언어 직접 입력', 'Type the language you are learning'),
    stNativeOther:t('모국어 직접 입력', 'Type your own language'),
    stGoal:       t('하루 목표 단어 수', 'Words per day'),
    stDays:       t('학습 기간 (일)', 'Study period in days'),
    libCat:       t('자료 분류', 'Category'),
    libReason:    t('신고 사유', 'Reason for reporting'),
  };
  Object.entries(aria).forEach(([id, label]) => $(id)?.setAttribute('aria-label', label));
  // 로그인 상태에 따라 글이 다르므로 지금 뭘 보여주고 있는지로 판단한다.
  paintAuthNav(!$('auSignedIn').classList.contains('hidden'));
}
// 위 고전 스크립트가 먼저 등록돼 있어 applyLang 이 끝난 뒤에 불린다.
$('langBtn').addEventListener('click', syncLang);
setMode('in');

// ══ 단어 추가 · 수정 ═════════════════════════════════════════
// 앱 OvenScreen 의 insert 와 같은 모양으로 넣는다. 필드가 어긋나면
// 웹에서 만든 단어가 앱에서 이상하게 보인다.
let editingId = null;      // null = 새로 만들기
let wfPhotoFile = null;    // 새로 고른 사진
let wfPhotoKeep = null;    // 수정 중일 때 원래 사진 경로
let wfDiff = 1;

const wfMsg = (id, text) => { ['wfErr','wfOk'].forEach(k => $(k).classList.add('hidden'));
  if (id) { $(id).textContent = text; $(id).classList.remove('hidden'); } };

function drawWfTag() {
  $('wfTag').innerHTML =
    `<option value="">${t('품사 없음', 'No part of speech')}</option>` +
    TAGS.map((tg) => `<option value="${esc(tg)}">${esc(t(tg, TAG_EN[tg] ?? tg))}</option>`).join('');
}

function drawWfDiff() {
  $('wfDiff').innerHTML = [1, 2, 3].map((n) =>
    `<button class="wb-chip${wfDiff === n ? ' on' : ''}" type="button" data-diff="${n}">` +
    '🧀'.repeat(n) + `</button>`).join('');
}

$('wfDiff').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-diff]');
  if (!b) return;
  wfDiff = Number(b.dataset.diff);
  drawWfDiff();
});

/* 폼 안의 글자를 지금 언어로 맞춘다.
   openWordForm 에서 한 번만 넣으면 도중에 언어를 바꿔도 그대로 남는다. */
function syncWfText() {
  $('wbFormTitle').textContent = editingId ? t('단어 고치기', 'Edit word') : t('새 단어', 'New word');
  if (editingId) {
    const w = rows.find((r) => r.id === editingId);
    $('wfToggle').textContent = w?.is_remembered
      ? t('학습 중으로 되돌리기', 'Mark as still learning')
      : t('외웠다고 표시', 'Mark as memorized');
  }
  // 고른 파일 이름이 들어가 있으면 덮지 않는다.
  if (!wfPhotoFile) $('wfPhotoTxt').textContent = t('사진 고르기', 'Choose a photo');
}

function openWordForm(w) {
  editingId = w?.id ?? null;
  wfPhotoFile = null;
  wfPhotoKeep = w?.image_url ?? null;
  wfDiff = w?.difficulty || 1;

  drawWfTag();
  drawWfDiff();
  $('wfWord').value = w?.word ?? '';
  $('wfMean').value = w?.meaning ?? '';
  $('wfEx').value = w?.example ?? '';
  $('wfTag').value = w?.tag ?? '';
  $('wfPhoto').value = '';
  $('wfPhotoTxt').textContent = t('사진 고르기', 'Choose a photo');
  $('wfDelete').classList.toggle('hidden', !editingId);
  $('wfToggle').classList.toggle('hidden', !editingId);
  syncWfText();

  // 수정 중이면 원래 사진을 먼저 보여준다.
  $('wfPreview').classList.add('hidden');
  if (wfPhotoKeep) {
    signedUrl(wfPhotoKeep).then((u) => {
      if (u && editingId === (w?.id ?? null)) { $('wfPreview').src = u; $('wfPreview').classList.remove('hidden'); }
    }).catch(() => {});
  }

  wfMsg(null);
  $('wbForm2').classList.remove('hidden');
  $('wbForm2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

$('wbAddBtn').addEventListener('click', () => openWordForm(null));
$('wfCancel').addEventListener('click', () => { $('wbForm2').classList.add('hidden'); editingId = null; });

// 목록에서 카드를 누르면 고치기로 들어간다.
$('wbList').addEventListener('click', (ev) => {
  const card = ev.target.closest('.wb-item');
  if (!card) return;
  const w = rows.find((r) => r.id === Number(card.dataset.id));
  if (w) openWordForm(w);
});

/* 사진은 올리기 전에 줄인다.
   요즘 폰 사진은 장당 1~3MB인데 단어 카드 크기로만 보이므로 원본 해상도가
   필요 없다. 앱(src/lib/images.ts)도 같은 값으로 줄인다 — 한쪽만 크게
   올리면 같은 단어장인데 사진 용량이 제각각이 된다. */
const IMG_MAX_W = 1280;

function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, IMG_MAX_W / img.width);
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      cv.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', 0.7);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load')); };
    img.src = url;
  });
}

$('wfPhoto').addEventListener('change', async (ev) => {
  const file = ev.target.files?.[0];
  wfMsg(null);
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    return wfMsg('wfErr', t('사진 파일만 올릴 수 있어요.', 'Images only.'));
  }
  if (file.size > 12 * 1024 * 1024) {
    return wfMsg('wfErr', t('사진이 너무 커요. 12MB 아래로 골라 주세요.', 'That photo is too large (max 12MB).'));
  }
  try {
    wfPhotoFile = await shrinkImage(file);
    $('wfPhotoTxt').textContent = file.name;
    $('wfPreview').src = URL.createObjectURL(wfPhotoFile);
    $('wfPreview').classList.remove('hidden');
  } catch (e) {
    wfPhotoFile = null;
    wfMsg('wfErr', t('사진을 읽지 못했어요. 다른 사진으로 해보세요.', 'Could not read that photo.'));
  }
});

/* 안 쓰게 된 사진을 지운다.
   사진을 바꾸거나 단어를 지울 때 예전 파일을 그대로 두면 스토리지에
   영영 남는다. 앱 src/lib/images.ts removeImage 와 같은 규칙 —
   예전 데이터는 공개 URL(http…)이라 건드리지 않는다. */
async function dropImage(path) {
  if (!path || path.startsWith('http')) return;
  try { await sb.storage.from('word-images').remove([path]); } catch (e) { /* 남아도 화면은 멀쩡하다 */ }
}

$('wfSave').addEventListener('click', async () => {
  wfMsg(null);
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return open('account');

  const word = $('wfWord').value.trim();
  const meaning = $('wfMean').value.trim();
  if (!word || !meaning) {
    return wfMsg('wfErr', t('단어와 뜻은 꼭 넣어 주세요.', 'Word and meaning are required.'));
  }

  const btn = $('wfSave');
  btn.disabled = true;
  try {
    let imagePath = wfPhotoKeep;
    let replaced = null;
    if (wfPhotoFile) {
      // 첫 폴더가 소유자다 — 스토리지 정책이 이걸로 본인 여부를 가린다.
      const path = `${session.user.id}/${Date.now()}.jpg`;
      const up = await sb.storage.from('word-images').upload(path, wfPhotoFile, { contentType: 'image/jpeg' });
      if (up.error) throw up.error;
      replaced = wfPhotoKeep;   // 저장에 성공한 뒤에 지운다
      imagePath = path;
    }

    const body = {
      word, meaning,
      example: $('wfEx').value.trim() || null,
      tag: $('wfTag').value || null,
      difficulty: wfDiff,
      image_url: imagePath,
    };

    if (editingId) {
      const { error } = await sb.from('words').update(body).eq('id', editingId);
      if (error) throw error;
    } else {
      const { error } = await sb.from('words').insert({
        ...body,
        is_remembered: false,
        view_count: 0,
        remembered_at: null,
        user_id: session.user.id,
      });
      if (error) throw error;
    }

    // DB 가 새 경로를 가리킨 뒤에 예전 파일을 지운다. 순서를 바꾸면
    // 저장이 실패했을 때 사진만 사라진다.
    if (replaced) dropImage(replaced);

    $('wbForm2').classList.add('hidden');
    editingId = null;
    await loadWords();
  } catch (e) {
    wfMsg('wfErr', t('저장하지 못했어요. 잠시 후 다시 시도해 주세요.', 'Could not save. Please try again.'));
  } finally {
    btn.disabled = false;
  }
});

$('wfToggle').addEventListener('click', async () => {
  if (!editingId) return;
  const w = rows.find((r) => r.id === editingId);
  if (!w) return;
  const next = !w.is_remembered;
  // 앱 WordbookScreen 과 같이 외운 시각도 같이 남긴다. 안 남기면
  // 대시보드의 7일 추이에 안 잡힌다.
  const { error } = await sb.from('words')
    .update({ is_remembered: next, remembered_at: next ? new Date().toISOString() : null })
    .eq('id', editingId);
  if (error) return wfMsg('wfErr', t('바꾸지 못했어요.', 'Could not change that.'));
  $('wbForm2').classList.add('hidden');
  editingId = null;
  await loadWords();
});

$('wfDelete').addEventListener('click', async () => {
  if (!editingId) return;
  const w = rows.find((r) => r.id === editingId);
  if (!confirm(t(`"${w?.word ?? ''}" 를 지울까요? 되돌릴 수 없어요.`,
                 `Delete "${w?.word ?? ''}"? This cannot be undone.`))) return;
  const { error } = await sb.from('words').delete().eq('id', editingId);
  if (error) return wfMsg('wfErr', t('지우지 못했어요.', 'Could not delete it.'));
  dropImage(w?.image_url);   // 단어가 사라졌으니 사진도 남길 이유가 없다
  $('wbForm2').classList.add('hidden');
  editingId = null;
  await loadWords();
});

// ══ 설정 ═════════════════════════════════════════════════════
// 앱 lib/languages.ts 의 LANGUAGES 와 같은 목록·같은 순서.
// DB 에는 한국어 이름으로 저장한다(앱과 AI 프롬프트가 그 값을 쓴다).
const LANGUAGES = ['한국어','영어','일본어','중국어','스페인어','프랑스어','독일어',
                   '이탈리아어','러시아어','베트남어','태국어','포르투갈어','인도네시아어','아랍어'];
const LANG_EN = { '한국어':'Korean','영어':'English','일본어':'Japanese','중국어':'Chinese',
  '스페인어':'Spanish','프랑스어':'French','독일어':'German','이탈리아어':'Italian',
  '러시아어':'Russian','베트남어':'Vietnamese','태국어':'Thai','포르투갈어':'Portuguese',
  '인도네시아어':'Indonesian','아랍어':'Arabic' };
const OTHER = '기타';

// 설정은 계정 화면 안에 있다. 로그인 안내는 계정 화면이 이미 하므로
// 여기에는 따로 두지 않는다.
const SET_PANELS = ['setLoading', 'setError', 'setBody'];
const setPanel = (name) => SET_PANELS.forEach((k) => $(k).classList.toggle('hidden', k !== name));
const setMsg = (id, text) => { ['stErr','stOk'].forEach(k => $(k).classList.add('hidden'));
  if (id) { $(id).textContent = text; $(id).classList.remove('hidden'); } };

function langOptions(sel) {
  sel.innerHTML = LANGUAGES.map((l) =>
    `<option value="${esc(l)}">${esc(t(l, LANG_EN[l] ?? l))}</option>`).join('') +
    `<option value="${OTHER}">${t('기타 (직접 입력)', 'Other (type it in)')}</option>`;
}

function bindOther(selId, otherId) {
  const sync = () => $(otherId).classList.toggle('hidden', $(selId).value !== OTHER);
  $(selId).addEventListener('change', sync);
  return sync;
}
const syncStudyOther = bindOther('stStudy', 'stStudyOther');
const syncNativeOther = bindOther('stNative', 'stNativeOther');

function setCalc() {
  const g = Number($('stGoal').value) || 0;
  const d = Number($('stDays').value) || 0;
  $('stCalc').textContent = g && d
    ? t(`이 기간에 ${g * d}개를 목표로 합니다.`, `That is ${g * d} words over the period.`)
    : '';
}
$('stGoal').addEventListener('input', setCalc);
$('stDays').addEventListener('input', setCalc);

async function loadSettings() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;
  setPanel('setLoading');
  try {
    const { data, error } = await sb.from('settings')
      .select('title, study_lang, native_lang, daily_goal, study_days')
      .eq('user_id', session.user.id).limit(1).maybeSingle();
    if (error) throw error;

    langOptions($('stStudy'));
    langOptions($('stNative'));

    const put = (selId, otherId, value, fallback) => {
      const v = value || fallback;
      if (v && !LANGUAGES.includes(v)) { $(selId).value = OTHER; $(otherId).value = v; }
      else $(selId).value = v;
    };
    put('stStudy', 'stStudyOther', data?.study_lang, '영어');
    put('stNative', 'stNativeOther', data?.native_lang, '한국어');
    syncStudyOther(); syncNativeOther();

    $('stTitle').value = data?.title ?? '';
    $('stGoal').value = data?.daily_goal ?? 10;
    $('stDays').value = data?.study_days ?? 30;
    setCalc();
    setMsg(null);
    setPanel('setBody');
  } catch (e) {
    setPanel('setError');
  }
}

$('stSave').addEventListener('click', async () => {
  setMsg(null);
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return open('account');

  const title = $('stTitle').value.trim();
  if (!title) return setMsg('stErr', t('단어장 이름을 넣어 주세요.', 'Please name your wordbook.'));

  const pick = (selId, otherId) =>
    ($(selId).value === OTHER ? $(otherId).value.trim() : $(selId).value);
  const study = pick('stStudy', 'stStudyOther');
  const native = pick('stNative', 'stNativeOther');
  if (!study || !native) return setMsg('stErr', t('언어를 골라 주세요.', 'Please pick both languages.'));

  const goal = Math.max(1, Math.min(200, Number($('stGoal').value) || 10));
  const days = Math.max(1, Math.min(365, Number($('stDays').value) || 30));

  const btn = $('stSave');
  btn.disabled = true;
  // 앱과 같이 update 를 쓴다. 설정 행은 가입할 때 이미 만들어져 있다.
  const { error } = await sb.from('settings').update({
    title, study_lang: study, native_lang: native, daily_goal: goal, study_days: days,
  }).eq('user_id', session.user.id);
  btn.disabled = false;

  if (error) return setMsg('stErr', t('저장하지 못했어요. 잠시 후 다시 시도해 주세요.', 'Could not save. Please try again.'));
  $('stGoal').value = goal; $('stDays').value = days; setCalc();
  setMsg('stOk', t('저장했어요. 앱에도 반영됩니다.', 'Saved — the app will pick it up.'));
  // 대시보드가 이 값을 쓰므로 다음에 열 때 새로 읽게 비운다.
  dashSettings = null;
});

$('setRetry').addEventListener('click', loadSettings);

// ══ 프로필 ═══════════════════════════════════════════════════
// 앱은 프로필을 AsyncStorage(기기 안)에 둔다. 폰을 바꾸면 사라지고
// 웹에서는 볼 수 없다. 웹은 settings 표의 display_name / avatar_url 을
// 쓴다(db/add_profile.sql). 앱은 칸이 늘어도 무시하므로 안 깨진다.
let acAvatarPath = null;   // 저장된 경로
let acAvatarFile = null;   // 새로 고른 사진
let acAvatarDrop = false;  // 없애기를 눌렀는지

const acMsg = (id, text) => { ['acErr','acOk'].forEach(k => $(k).classList.add('hidden'));
  if (id) { $(id).textContent = text; $(id).classList.remove('hidden'); } };

function showAvatar(url) {
  if (url) {
    $('acAva').innerHTML = '<img alt="">';
    $('acAva').querySelector('img').src = url;
    $('acPreview').src = url;
    $('acAvaWrap').classList.remove('hidden');
  } else {
    $('acAva').textContent = '🧀';
    $('acAvaWrap').classList.add('hidden');
  }
}

$('acPhoto').addEventListener('change', async (ev) => {
  const file = ev.target.files?.[0];
  acMsg(null);
  if (!file) return;
  if (!file.type.startsWith('image/')) return acMsg('acErr', t('사진 파일만 올릴 수 있어요.', 'Images only.'));
  if (file.size > 12 * 1024 * 1024) return acMsg('acErr', t('사진이 너무 커요. 12MB 아래로 골라 주세요.', 'Max 12MB.'));
  try {
    acAvatarFile = await shrinkImage(file);
    acAvatarDrop = false;
    $('acPhotoTxt').textContent = file.name;
    showAvatar(URL.createObjectURL(acAvatarFile));
  } catch (e) {
    acAvatarFile = null;
    acMsg('acErr', t('사진을 읽지 못했어요.', 'Could not read that photo.'));
  }
});

$('acPhotoClear').addEventListener('click', () => {
  acAvatarFile = null;
  acAvatarDrop = true;
  $('acPhoto').value = '';
  $('acPhotoTxt').textContent = t('사진 고르기', 'Choose a photo');
  showAvatar(null);
});

$('acSave').addEventListener('click', async () => {
  acMsg(null);
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return open('account');

  const btn = $('acSave');
  btn.disabled = true;
  try {
    let path = acAvatarPath;
    let replaced = null;

    if (acAvatarFile) {
      // 프로필 사진도 word-images 버킷을 쓴다. 앱과 같은 규칙이라
      // 첫 폴더가 소유자여야 정책을 통과한다.
      const p = `${session.user.id}/avatar-${Date.now()}.jpg`;
      const up = await sb.storage.from('word-images').upload(p, acAvatarFile, { contentType: 'image/jpeg' });
      if (up.error) throw up.error;
      replaced = acAvatarPath;
      path = p;
    } else if (acAvatarDrop) {
      replaced = acAvatarPath;
      path = null;
    }

    const { error } = await sb.from('settings')
      .update({ display_name: $('acNameIn').value.trim() || null, avatar_url: path })
      .eq('user_id', session.user.id);
    if (error) throw error;

    if (replaced) dropImage(replaced);
    acAvatarPath = path;
    acAvatarFile = null;
    acAvatarDrop = false;
    $('acPhoto').value = '';
    $('acPhotoTxt').textContent = t('사진 고르기', 'Choose a photo');
    $('acName').textContent = $('acNameIn').value.trim() || t('이름 없음', 'No name');
    acMsg('acOk', t('저장했어요.', 'Saved.'));
  } catch (e) {
    // 컬럼이 아직 없으면 여기로 온다. 원인을 알려줘야 헤매지 않는다.
    const missing = /display_name|avatar_url|column/i.test(e?.message || '');
    acMsg('acErr', missing
      ? t('프로필 칸이 아직 없어요. db/add_profile.sql 을 먼저 실행해 주세요.',
          'Profile columns are missing — run db/add_profile.sql first.')
      : t('저장하지 못했어요. 잠시 후 다시 시도해 주세요.', 'Could not save. Please try again.'));
  } finally {
    btn.disabled = false;
  }
});

/* 계정 화면을 열 때 프로필과 설정을 함께 채운다. */
async function loadAccount() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;

  $('acName').textContent = t('불러오는 중…', 'Loading…');
  loadSettings();

  // display_name / avatar_url 이 없는 프로젝트에서도 화면이 살아야 한다.
  const { data, error } = await sb.from('settings')
    .select('display_name, avatar_url').eq('user_id', session.user.id).limit(1).maybeSingle();

  const name = error ? '' : (data?.display_name ?? '');
  acAvatarPath = error ? null : (data?.avatar_url ?? null);
  acAvatarFile = null;
  acAvatarDrop = false;

  $('acNameIn').value = name;
  $('acName').textContent = name || t('이름 없음', 'No name');
  showAvatar(null);
  if (acAvatarPath) signedUrl(acAvatarPath).then((u) => { if (u) showAvatar(u); }).catch(() => {});
}

$('auGoDash').addEventListener('click', () => { open('dashboard'); loadDashboard(); });

// ══ 엑셀 가져오기 · 내보내기 ═════════════════════════════════
// 앱 WordbookScreen 과 같은 형식이다. A열 단어, B열 뜻, C열 난이도.
// 머리글은 '단어' 여야 가져올 때 건너뛴다.
$('wbExp').addEventListener('click', async () => {
  if (!rows.length) return;
  await needXLSX();
  const list = visibleWords();   // 걸러 놓은 상태 그대로 내보낸다
  const aoa = [['단어', '뜻', '난이도'], ...list.map((w) => [String(w.word ?? ''), String(w.meaning ?? ''), Number(w.difficulty) || 1])];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 26 }, { wch: 34 }, { wch: 9 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '단어장');
  const name = (dashSettings?.title || t('단어장', 'wordbook')).replace(/[\\/:*?"<>|]/g, '_');
  XLSX.writeFile(wb, `${name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
});

$('wbImp').addEventListener('change', async (ev) => {
  const file = ev.target.files?.[0];
  ev.target.value = '';
  if (!file) return;

  const { data: { session } } = await sb.auth.getSession();
  if (!session) return open('account');

  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    return alert(t('엑셀(.xlsx, .xls) 또는 .csv 파일만 가져올 수 있어요.', 'Only .xlsx, .xls or .csv files.'));
  }
  if (file.size > 3 * 1024 * 1024) {
    return alert(t('파일이 너무 커요. 3MB 아래로 골라 주세요.', 'Please keep it under 3MB.'));
  }

  try {
    await needXLSX();
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const parsed = parseRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }));
    if (!parsed.length) {
      return alert(t('단어를 찾지 못했어요. A열에 단어, B열에 뜻을 넣어 주세요.',
                     'No words found. Put the word in column A and its meaning in column B.'));
    }
    if (!confirm(t(`${parsed.length}개 단어를 가져올까요?`, `Import ${parsed.length} words?`))) return;

    const { error } = await sb.from('words').insert(parsed.map((w) => ({
      word: w.w, meaning: w.m, difficulty: w.d,
      example: null, tag: null,
      is_remembered: false, image_url: null, view_count: 0, remembered_at: null,
      user_id: session.user.id,
    })));
    if (error) throw error;
    await loadWords();
  } catch (e) {
    alert(t('가져오지 못했어요. 잠시 후 다시 시도해 주세요.', 'Could not import. Please try again.'));
  }
});

// ══ 대시보드 ═════════════════════════════════════════════════
// 계산은 앱 DashboardScreen 과 같은 공식을 쓴다. 같은 숫자가 두 곳에서
// 다르게 나오면 어느 쪽이 맞는지 알 수 없게 된다.
const DASH_PANELS = ['dashNeedLogin', 'dashLoading', 'dashEmpty', 'dashError', 'dashBody'];
const dashPanel = (name) => DASH_PANELS.forEach((k) => $(k).classList.toggle('hidden', k !== name));

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

let dashSettings = null;
let dashAiUsed = null;
let dashPronUsed = null;

async function loadDashboard() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return dashPanel('dashNeedLogin');
  dashPanel('dashLoading');

  try {
    // 단어는 단어장에서 이미 받아 둔 것을 쓴다. 대시보드로 곧장 들어와
    // 아직 비어 있으면 그때 가져온다.
    if (!rows.length) await loadWords();
    // TOPIK 읽기 청사진(유형 이름표)도 필요하다 — 배우기에 한 번도 안
    // 들어가 봤으면 아직 안 왔다. 문제 자료(지문)까지는 필요 없고
    // 이름표만 있으면 되지만, 부르는 값이 이거 하나다.
    await tqNeedData();

    const today = dayKey(new Date());
    const [st, usage] = await Promise.all([
      sb.from('settings').select('title, study_lang, daily_goal, study_days, start_date')
        .eq('user_id', session.user.id).limit(1).maybeSingle(),
      // 사용량은 못 읽어도 화면이 깨지면 안 된다. 정책이 없으면 그냥 감춘다.
      sb.from('ai_usage').select('count')
        .eq('user_id', session.user.id).eq('day', today).maybeSingle(),
    ]);

    dashSettings = st.data ?? null;
    dashAiUsed = usage.data?.count ?? null;

    /* 발음 사용량은 따로 가져온다. pron_count 는 db/add_pron_count.sql 을
       돌려야 생기는 칸이라, 위 조회에 섞으면 마이그레이션 전에는 조회
       전체가 400 으로 죽어 대시보드가 통째로 안 뜬다. 없으면 이 줄만
       조용히 빠진다. */
    dashPronUsed = null;
    try {
      const p = await sb.from('ai_usage').select('pron_count')
        .eq('user_id', session.user.id).eq('day', today).maybeSingle();
      if (!p.error) dashPronUsed = p.data?.pron_count ?? null;
    } catch (e) { /* 칸이 없다 — 발음 줄만 안 보인다 */ }

    if (!rows.length && !dashTopikHasAny()) return dashPanel('dashEmpty');
    renderDashboard();
    dashPanel('dashBody');
  } catch (e) {
    dashPanel('dashError');
  }
}

/* ── 대시보드 계산 ───────────────────────────────────────────
   화면을 그리기 전에 숫자를 먼저 다 낸다. 그리는 코드 안에서 계산까지
   하면 어느 숫자가 어디서 왔는지 나중에 못 찾는다. */
function dashStats() {
  const st = dashSettings;
  const total = rows.length;
  const done = rows.filter((w) => w.is_remembered).length;

  // 날짜별 집계. 하루를 문자열 앞 열 글자로 자른다 — 시간대 계산을
  // 끼우면 기기마다 하루 경계가 달라진다.
  const added = {}, memo = {};
  rows.forEach((w) => {
    const a = String(w.created_at || '').slice(0, 10);
    if (a) added[a] = (added[a] || 0) + 1;
    if (w.is_remembered) {
      const m = String(w.remembered_at || '').slice(0, 10);
      if (m) memo[m] = (memo[m] || 0) + 1;
    }
  });

  const dayAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

  // 연속 학습일. 오늘 아직 안 했을 수 있으므로 어제부터 세도 이어진 것으로 본다.
  let streak = 0;
  for (let i = (memo[dayKey(new Date())] ? 0 : 1); i < 400; i++) {
    if (!memo[dayKey(dayAgo(i))]) break;
    streak++;
  }
  // 최장 기록 — 외운 날들을 줄 세워 이어진 구간 중 가장 긴 것
  const memoDays = Object.keys(memo).sort();
  let best = 0, run = 0, prev = null;
  memoDays.forEach((k) => {
    if (prev && (new Date(k) - new Date(prev)) === 86400000) run++; else run = 1;
    best = Math.max(best, run); prev = k;
  });

  // 최근 14일 속도로 남은 단어를 다 외우는 데 걸릴 날
  let recent = 0;
  for (let i = 0; i < 14; i++) recent += memo[dayKey(dayAgo(i))] || 0;
  const perDay = recent / 14;
  const learning = total - done;
  const etaDays = perDay > 0 ? Math.ceil(learning / perDay) : null;

  return {
    st, total, done, learning, added, memo, streak, best, perDay, etaDays,
    todayMemo: memo[dayKey(new Date())] || 0,
    weekAdded: Object.keys(added).filter((k) => new Date(k) >= dayAgo(6)).reduce((s, k) => s + added[k], 0),
    withExample: rows.filter((w) => (w.example || '').trim()).length,
    withImage: rows.filter((w) => w.image_url).length,
    unseen: rows.filter((w) => !w.is_remembered && !(w.view_count > 0)).length,
  };
}

/** 누적 성장 곡선. 쌓인 단어와 외운 단어를 겹쳐 그린다. */
function dashCurve(s, days = 30) {
  const pts = [];
  let cumT = 0, cumD = 0;
  // 기간 이전에 이미 쌓여 있던 것부터 세어야 선이 0 에서 시작하지 않는다.
  const from = new Date(); from.setDate(from.getDate() - (days - 1));
  const fromKey = dayKey(from);
  Object.keys(s.added).forEach((k) => { if (k < fromKey) cumT += s.added[k]; });
  Object.keys(s.memo).forEach((k) => { if (k < fromKey) cumD += s.memo[k]; });

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = dayKey(d);
    cumT += s.added[k] || 0;
    cumD += s.memo[k] || 0;
    pts.push({ k, d, t: cumT, m: cumD });
  }
  return pts;
}

function renderDashboard() {
  const S = dashStats();
  const st = S.st;
  const total = S.total, done = S.done, learning = S.learning;

  const d1 = rows.filter((w) => (w.difficulty || 1) === 1).length;
  const d2 = rows.filter((w) => w.difficulty === 2).length;
  const d3 = rows.filter((w) => w.difficulty === 3).length;

  const tagCounts = {};
  rows.forEach((w) => { if (w.tag) tagCounts[w.tag] = (tagCounts[w.tag] || 0) + 1; });

  const most = rows.filter((w) => (w.view_count || 0) > 0)
                   .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0] || null;

  // D-day — 앱과 같은 계산
  let dday = null, elapsed = 0, progressPct = 0;
  if (st?.start_date && st?.study_days) {
    const start = new Date(st.start_date);
    const end = new Date(start); end.setDate(end.getDate() + st.study_days);
    const now = new Date();
    dday = Math.ceil((end - now) / 86400000);
    elapsed = Math.max(0, Math.floor((now - start) / 86400000));
    progressPct = Math.min(100, Math.round((elapsed / st.study_days) * 100));
  }
  const goalTotal = (st?.daily_goal || 0) * (st?.study_days || 0);
  const goalPct = goalTotal ? Math.min(100, Math.round((total / goalTotal) * 100)) : 0;

  // 최근 7일 암기 추이
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = dayKey(d);
    days.push({
      label: isEn() ? DAY_EN[d.getDay()] : DAY_KO[d.getDay()],
      n: rows.filter((w) => w.is_remembered && String(w.remembered_at || '').slice(0, 10) === k).length,
    });
  }
  const maxN = Math.max(1, ...days.map((d) => d.n));

  const ddayText = dday === null ? '—'
    : dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day' : '🎉';

  const card = (title, inner) => `<div class="dcard"><div class="dcard-t">${title}</div>${inner}</div>`;
  const sec = (title, inner) => `<div class="dsec"><div class="dsec-h">${title}</div>${inner}</div>`;
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

  const donePct = pct(done, total);

  // ── 누적 곡선 (30일)
  const curve = dashCurve(S, 30);
  const cMax = Math.max(1, curve[curve.length - 1].t);
  const CW = 600, CH = 170, CP = 8;
  const cx = (i) => CP + (i * (CW - CP * 2)) / (curve.length - 1);
  const cy = (v) => CH - 22 - (v / cMax) * (CH - 40);
  const line = (key) => curve.map((p, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(1)},${cy(p[key]).toFixed(1)}`).join('');
  const area = (key) => line(key) + `L${cx(curve.length - 1).toFixed(1)},${CH - 22}L${cx(0).toFixed(1)},${CH - 22}Z`;

  // ── 잔디밭 (12주). 그 날 더한 것과 외운 것을 합쳐 "활동" 으로 본다.
  const heatDays = 84;
  const heatStart = new Date();
  heatStart.setDate(heatStart.getDate() - (heatDays - 1 + ((heatStart.getDay() + 7) % 7)));
  const heatCols = [];
  let hMax = 1;
  for (let c = 0; c < 13; c++) {
    const col = [];
    for (let r = 0; r < 7; r++) {
      const d = new Date(heatStart);
      d.setDate(d.getDate() + c * 7 + r);
      if (d > new Date()) { col.push(null); continue; }
      const k = dayKey(d);
      const n = (S.added[k] || 0) + (S.memo[k] || 0);
      hMax = Math.max(hMax, n);
      col.push({ k, n, d });
    }
    heatCols.push(col);
  }
  const heatLv = (n) => (n === 0 ? '' : n <= hMax * 0.25 ? ' l1' : n <= hMax * 0.5 ? ' l2' : n <= hMax * 0.75 ? ' l3' : ' l4');
  const activeDays = Object.keys(S.memo).length;

  // ── 요일별 패턴
  const wk = [0, 0, 0, 0, 0, 0, 0];
  Object.keys(S.memo).forEach((k) => { wk[new Date(k).getDay()] += S.memo[k]; });
  const wkMax = Math.max(1, ...wk);

  // ── 품사별 암기율
  const tagStat = TAGS.filter((tg) => tagCounts[tg]).map((tg) => {
    const all = rows.filter((w) => w.tag === tg);
    const ok = all.filter((w) => w.is_remembered).length;
    return { tg, all: all.length, ok, pct: pct(ok, all.length) };
  }).sort((a, b) => b.all - a.all);

  // ── 손이 안 간 단어. 아직 못 외웠고 덜 본 것부터, 오래된 순.
  const stale = rows.filter((w) => !w.is_remembered)
    .sort((a, b) => (a.view_count || 0) - (b.view_count || 0) ||
                    String(a.created_at || '').localeCompare(String(b.created_at || '')))
    .slice(0, 5);

  const html = [
    // ── D-day
    st?.start_date
      ? card(t('공부 기간', 'Study period'),
          '<div class="dday-box" style="border:none; padding:0; background:transparent;">' +
            '<div>' +
              `<div class="dday-label">${esc(st.title || t('단어장', 'Wordbook'))}${st.study_lang ? ' · ' + esc(st.study_lang) : ''}</div>` +
              `<div class="dday-num">${ddayText}</div>` +
              `<div class="dday-sub">${elapsed} / ${st.study_days}${t('일', ' days')} (${progressPct}%)</div>` +
            '</div>' +
          '</div>' +
          `<div class="dbar-wrap" style="margin-top:16px;"><div class="dbar" style="width:${progressPct}%"></div></div>`)
      : '',

    // ── 한눈에 : 큰 숫자 넷 + 암기율 링
    sec(t('한눈에', 'At a glance'),
      '<div class="kpis">' +
        `<div class="kpi"><div class="kpi-l">${t('전체 단어', 'Total words')}</div>` +
          `<div class="kpi-v">${total}</div>` +
          `<div class="kpi-d">${S.weekAdded > 0
              ? t(`이번 주 +${S.weekAdded}`, `+${S.weekAdded} this week`)
              : t('이번 주에 더한 단어 없음', 'None added this week')}</div></div>` +

        `<div class="kpi"><div class="kpi-l">${t('외운 단어', 'Memorized')}</div>` +
          `<div class="kpi-v">${done}<small>/ ${total}</small></div>` +
          `<div class="kpi-d${donePct >= 50 ? ' up' : ''}">${t(`암기율 ${donePct}%`, `${donePct}% mastered`)}</div></div>` +

        `<div class="kpi"><div class="kpi-l">${t('오늘 외운 단어', 'Memorized today')}</div>` +
          `<div class="kpi-v">${S.todayMemo}${st?.daily_goal ? `<small>/ ${st.daily_goal}</small>` : ''}</div>` +
          `<div class="kpi-d${st?.daily_goal && S.todayMemo >= st.daily_goal ? ' up' : ''}">${
            !st?.daily_goal ? t('목표를 정하면 여기에 나와요', 'Set a goal to track this')
            : S.todayMemo >= st.daily_goal ? t('오늘 목표 달성 🎉', 'Goal reached 🎉')
            : t(`${st.daily_goal - S.todayMemo}개 남았어요`, `${st.daily_goal - S.todayMemo} to go`)}</div></div>` +

        `<div class="kpi"><div class="kpi-l">${t('연속 학습', 'Streak')}</div>` +
          `<div class="kpi-v">${S.streak}<small>${t('일', 'd')}</small></div>` +
          `<div class="kpi-d${S.streak > 0 && S.streak >= S.best ? ' up' : ''}">${
            S.best > 0 ? t(`최장 ${S.best}일`, `Best ${S.best} days`) : t('오늘부터 시작', 'Start today')}</div></div>` +
      '</div>' +

      card(t('암기율', 'Mastery'),
        '<div class="ring-wrap">' +
          '<div class="ring-box">' +
            '<svg class="ring" viewBox="0 0 132 132" aria-hidden="true">' +
              '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">' +
                '<stop offset="0" stop-color="#FFB570"/><stop offset="1" stop-color="#12704F"/>' +
              '</linearGradient></defs>' +
              '<circle class="ring-bg" cx="66" cy="66" r="52"/>' +
              `<circle class="ring-fg" cx="66" cy="66" r="52" stroke-dasharray="326.7" stroke-dashoffset="${(326.7 * (1 - donePct / 100)).toFixed(1)}"/>` +
            '</svg>' +
            `<div class="ring-num"><b>${donePct}%</b><span>${t('외움', 'Done')}</span></div>` +
          '</div>' +
          '<div class="ring-legend">' +
            `<div class="ring-item"><i style="background:#12704F"></i>${t('외운 단어', 'Memorized')}<b>${done}</b></div>` +
            `<div class="ring-item"><i style="background:#FFB570"></i>${t('학습 중', 'Learning')}<b>${learning}</b></div>` +
            `<div class="ring-item"><i style="background:rgba(27,21,18,.16)"></i>${t('아직 안 본 단어', 'Never opened')}<b>${S.unseen}</b></div>` +
          '</div>' +
        '</div>')),

    // ── 흐름 : 누적 곡선
    sec(t('흐름', 'Progress'),
      card(t('최근 30일 누적', 'Last 30 days, cumulative'),
        `<svg class="spark" viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="none" aria-hidden="true">` +
          '<defs>' +
            '<linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#FF914D" stop-opacity=".22"/><stop offset="1" stop-color="#FF914D" stop-opacity="0"/></linearGradient>' +
            '<linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#12704F" stop-opacity=".2"/><stop offset="1" stop-color="#12704F" stop-opacity="0"/></linearGradient>' +
          '</defs>' +
          [0.25, 0.5, 0.75].map((f) =>
            `<line class="spark-grid" x1="${CP}" y1="${(cy(cMax * f)).toFixed(1)}" x2="${CW - CP}" y2="${(cy(cMax * f)).toFixed(1)}"/>`).join('') +
          `<line class="spark-axis" x1="${CP}" y1="${CH - 22}" x2="${CW - CP}" y2="${CH - 22}"/>` +
          `<path class="spark-fill-a" d="${area('t')}"/>` +
          `<path class="spark-fill-b" d="${area('m')}"/>` +
          `<path class="spark-line-a" d="${line('t')}"/>` +
          `<path class="spark-line-b" d="${line('m')}"/>` +
          `<text class="spark-lbl" x="${CP}" y="${CH - 6}">${curve[0].d.getMonth() + 1}/${curve[0].d.getDate()}</text>` +
          `<text class="spark-lbl" x="${CW - CP}" y="${CH - 6}" text-anchor="end">${t('오늘', 'today')}</text>` +
          `<text class="spark-lbl" x="${CP}" y="${(cy(cMax) - 5).toFixed(1)}">${cMax}</text>` +
        '</svg>' +
        '<div class="legend">' +
          `<span><i style="background:var(--orange-mid)"></i>${t('쌓인 단어', 'Words added')}</span>` +
          `<span><i style="background:var(--green)"></i>${t('외운 단어', 'Memorized')}</span>` +
        '</div>' +
        `<p class="dnote" style="margin-top:10px;">${
          S.etaDays !== null
            ? t(`요즘 하루 ${S.perDay.toFixed(1)}개씩 외우고 있어요. 이 속도면 남은 ${learning}개를 ${S.etaDays}일 뒤에 다 외워요.`,
                `About ${S.perDay.toFixed(1)} words a day lately — at this pace the remaining ${learning} take ${S.etaDays} more days.`)
            : t('최근 2주간 외운 단어가 없어요. 하루 한 개부터 다시 시작해 볼까요?',
                'No words memorized in the last two weeks. One a day is enough to restart.')}</p>`)),

    // ── 꾸준함 : 잔디밭 · 7일 · 요일
    sec(t('꾸준함', 'Consistency'),
      card(t('최근 12주 활동', 'Last 12 weeks'),
        '<div class="heat">' +
          heatCols.map((col) =>
            '<div class="heat-col">' +
            col.map((c) => c === null
              ? '<div class="heat-c" style="visibility:hidden"></div>'
              : `<div class="heat-c${heatLv(c.n)}" title="${c.k} · ${c.n}"></div>`).join('') +
            '</div>').join('') +
        '</div>' +
        '<div class="heat-foot">' +
          `<span>${t(`활동한 날 ${activeDays}일`, `${activeDays} active days`)}</span>` +
          `<span style="margin-left:auto">${t('적음', 'Less')}</span>` +
          '<div class="heat-c"></div><div class="heat-c l1"></div><div class="heat-c l2"></div>' +
          '<div class="heat-c l3"></div><div class="heat-c l4"></div>' +
          `<span>${t('많음', 'More')}</span>` +
        '</div>')),

    // ── 리듬 : 최근 7일 · 요일 습관
    '<div class="dgrid2">' +
      card(t('최근 7일 암기 추이', 'Last 7 days'),
        '<div class="chart-wrap">' +
          days.map((d) =>
            `<div class="bar${d.n === maxN && d.n > 0 ? ' active' : ''}" style="height:${Math.max(4, Math.round((d.n / maxN) * 100))}%">` +
            `<span class="bar-label">${d.label}</span><span class="bar-val">${d.n}</span></div>`
          ).join('') +
        '</div><div style="height:22px"></div>') +

      card(t('요일별 습관', 'By weekday'),
        '<div class="wk">' +
          wk.map((n, i) =>
            '<div class="wk-b">' +
              (n ? `<span class="wk-n">${n}</span>` : '') +
              `<span class="wk-fill${n === wkMax && n > 0 ? ' top' : ''}" style="height:${Math.max(4, Math.round((n / wkMax) * 100))}%"></span>` +
            '</div>').join('') +
        '</div>' +
        '<div class="wk" style="height:auto; align-items:center;">' +
          (isEn() ? DAY_EN : DAY_KO).map((l) => `<div class="wk-b" style="height:auto"><span class="wk-l">${l}</span></div>`).join('') +
        '</div>' +
        `<p class="dnote" style="margin-top:10px;">${
          wkMax > 0
            ? t(`${(isEn() ? DAY_EN : DAY_KO)[wk.indexOf(wkMax)]}요일에 가장 많이 외웠어요.`,
                `You memorize most on ${DAY_EN[wk.indexOf(wkMax)]}.`)
            : t('아직 요일 습관이 쌓이지 않았어요.', 'Not enough data yet.')}</p>`) +
    '</div>',

    // ── 단어 뜯어보기
    sec(t('단어 뜯어보기', 'Your words'),
      '<div class="dgrid2">' +
        card('🧀 ' + t('난이도 분포', 'By difficulty'),
          [[d1, '🧀', '#81C784'], [d2, '🧀🧀', '#F0C24B'], [d3, '🧀🧀🧀', '#FF914D']].map(([n, lbl, col]) =>
            '<div class="diff-row">' +
              `<div class="diff-lbl">${lbl}</div>` +
              `<div class="diff-bar-bg"><div class="diff-bar-fill" style="width:${total ? Math.round((n / total) * 100) : 0}%;background:${col}"></div></div>` +
              `<div class="diff-count">${n}</div>` +
            '</div>').join('')) +

        (tagStat.length
          ? card('🏷️ ' + t('품사별 암기율', 'Mastery by part of speech'),
              tagStat.map((s) =>
                '<div class="drow">' +
                  `<span class="wb-dot" style="background:${tagHue(s.tg)}; flex:0 0 auto"></span>` +
                  `<div class="drow-main"><div class="drow-w" style="font-size:13.5px">${esc(t(s.tg, TAG_EN[s.tg] ?? s.tg))}</div></div>` +
                  `<div class="drow-bar"><i style="width:${s.pct}%"></i></div>` +
                  `<div class="drow-n">${s.ok}/${s.all}</div>` +
                '</div>').join(''))
          : '') +
      '</div>' +

      '<div class="dgrid2">' +
        (most
          ? card(t('가장 많이 본 단어', 'Most viewed'),
              '<div class="dmost">' +
                `<span class="dmost-w">${esc(most.word)}</span>` +
                `<span class="dmost-m">${esc(most.meaning)}</span>` +
                `<span class="dmost-n">🥔 ${most.view_count}${t('회', '×')}</span>` +
              '</div>')
          : '') +

        (stale.length
          ? card(t('손이 덜 간 단어', 'Least touched'),
              stale.map((w) =>
                '<div class="drow">' +
                  '<div class="drow-main">' +
                    `<div class="drow-w">${esc(w.word)}</div>` +
                    `<div class="drow-m">${esc(w.meaning)}</div>` +
                  '</div>' +
                  `<div class="drow-n">${t(`${w.view_count || 0}회`, `${w.view_count || 0}×`)}</div>` +
                '</div>').join('') +
              `<p class="dnote" style="margin-top:12px;">${t('오래 안 본 것부터 다시 보면 가장 빨리 늘어요.', 'Revisiting these first pays off the most.')}</p>`)
          : '') +
      '</div>'),

    // ── 목표와 기록
    sec(t('목표와 기록', 'Goals and records'),
      (goalTotal
        ? card(t('목표 달성률', 'Goal progress'),
            `<div class="dbar-row"><span>${t(`하루 ${st.daily_goal}개 × ${st.study_days}일`, `${st.daily_goal}/day × ${st.study_days} days`)}</span>` +
            `<span><b>${total}</b> / ${goalTotal} (${goalPct}%)</span></div>` +
            `<div class="dbar-wrap"><div class="dbar" style="width:${goalPct}%"></div></div>`)
        : '') +

      card(t('단어 채움 정도', 'How complete your cards are'),
        '<div class="dfill">' +
          `<div class="dfill-item"><div class="dfill-v">${pct(S.withExample, total)}%</div>` +
            `<div class="dfill-l">${t(`예문 있는 단어 ${S.withExample}개`, `${S.withExample} with an example`)}</div></div>` +
          `<div class="dfill-item"><div class="dfill-v">${pct(S.withImage, total)}%</div>` +
            `<div class="dfill-l">${t(`사진 있는 단어 ${S.withImage}개`, `${S.withImage} with a photo`)}</div></div>` +
          `<div class="dfill-item"><div class="dfill-v">${S.unseen}</div>` +
            `<div class="dfill-l">${t('한 번도 안 열어 본 단어', 'Never opened')}</div></div>` +
        '</div>' +
        `<p class="dnote" style="margin-top:12px;">${t('예문이 있으면 뜻만 외울 때보다 오래 남아요.', 'Cards with an example stick longer than a bare meaning.')}</p>`) +

      (dashAiUsed !== null
        ? card(t('오늘 쓴 AI', "Today's AI use"),
            `<div class="dbar-row"><span>${t('사진으로 단어 만들기', 'Photo to word')}</span><span><b>${dashAiUsed}</b> / 30</span></div>` +
            `<div class="dbar-wrap"><div class="dbar" style="width:${Math.min(100, Math.round((dashAiUsed / 30) * 100))}%"></div></div>` +
            (dashPronUsed !== null
              ? `<div class="dbar-row" style="margin-top:16px;"><span>${t('발음 짐작', 'Pronunciation feedback')}</span><span><b>${dashPronUsed}</b> / 30</span></div>` +
                `<div class="dbar-wrap"><div class="dbar" style="width:${Math.min(100, Math.round((dashPronUsed / 30) * 100))}%"></div></div>`
              : '') +
            `<p class="dnote" style="margin-top:12px;">${t('한도는 매일 자정에 다시 채워집니다.', 'The limit resets every midnight.')}</p>`)
        : ''),
    ),

    dashTopikHtml(),
  ].join('');

  $('dashBody').innerHTML = html;
  $('dashBody').querySelectorAll('[data-dash-go]').forEach((b) => {
    b.addEventListener('click', () => {
      const [exam, skill] = b.dataset.dashGo.split(':');
      window.cpOpen('learn', `topik/${exam}/${skill}`);
    });
  });
}

// ══ 대시보드 : TOPIK 풀이 현황 ═══════════════════════════════════
// 읽기·듣기·쓰기는 단어장과 다른 열쇠(cp-topik-*, cp-tl-*, cp-tw-*)에
// 각자 쌓인다. 원본 기록은 그 갈래 화면(유형 연습 기록판)에 이미 있고,
// 여기는 그것을 모아 한눈에 보여줄 뿐이다 — 새로 저장하는 값은 없다.

function dashTopikHasAny() {
  try {
    return Object.keys(localStorage).some((k) =>
      k.startsWith('cp-topik-set-') || k.startsWith('cp-topik-mock-') ||
      k.startsWith('cp-topik-best-') || k.startsWith('cp-tl-set-') ||
      k.startsWith('cp-tl-best-') || k.startsWith('cp-tw-') || k === 'cp-topik-hold');
  } catch (e) { return false; }
}

/* 한 시험의 급수마다 유형별 점수를 모은다. 읽기·듣기가 자료 모양은
   달라도(청사진 안의 type·ko·en) 같은 함수로 다룬다. */
function dashSkillRows(skill, exam, blueprint, setRead) {
  const grades = TQ_EXAMS[exam].grades;
  const types = [...new Set(blueprint.map((b) => b.type))];
  const typeName = Object.fromEntries(blueprint.map((b) => [b.type, { ko: b.ko, en: b.en }]));
  const out = [];
  grades.forEach((g) => types.forEach((ty) => {
    const r = setRead(g, ty);
    if (r && r.n > 0) out.push({ skill, exam, g, type: ty, name: typeName[ty], s: r.s, n: r.n });
  }));
  return out;
}

function dashTopikHtml() {
  const card = (title, inner) => `<div class="dcard"><div class="dcard-t">${title}</div>${inner}</div>`;
  const sec = (title, inner) => `<div class="dsec"><div class="dsec-h">${title}</div>${inner}</div>`;
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

  const readRows = [
    ...dashSkillRows('reading', 'I',  TQ_EXAMS.I.blueprint,  (g, ty) => tqSetRead(g, ty)),
    ...dashSkillRows('reading', 'II', TQ_EXAMS.II.blueprint, (g, ty) => tqSetRead(g, ty)),
  ];
  const listenRows = [
    ...dashSkillRows('listening', 'I',  TOPIKL_BY_EXAM.I.blueprint,  (g, ty) => tlSetRead('I', g, ty)),
    ...dashSkillRows('listening', 'II', TOPIKL_BY_EXAM.II.blueprint, (g, ty) => tlSetRead('II', g, ty)),
  ];
  const allRows = [...readRows, ...listenRows];

  const twRows = [51, 52].map((q) => {
    const items = TW_ITEMS.filter((x) => x.q === q);
    const done = items.map((x) => twSetRead(x.id)).filter(Boolean);
    return { q, items, done };
  }).filter((r) => r.done.length);

  const hold = tqHoldRead();

  if (!allRows.length && !twRows.length && !hold) return '';

  const sumS = allRows.reduce((s, x) => s + x.s, 0);
  const sumN = allRows.reduce((s, x) => s + x.n, 0);
  const overallPct = pct(sumS, sumN);

  const weak = allRows
    .filter((x) => x.n >= 3 && x.s / x.n < TQ_WEAK)
    .sort((a, b) => (a.s / a.n) - (b.s / b.n))
    .slice(0, 3);

  const goBtn = (exam, skill, label) =>
    `<button class="tq-bd-go" type="button" data-dash-go="${exam}:${skill}">${esc(label)}</button>`;

  const holdCard = !hold ? '' : (() => {
    const hx = TQ_EXAMS[hold.exam];
    const done = hold.picks.filter((v) => Number.isInteger(v)).length;
    return card(t('풀다 만 모의고사', 'Mock exam in progress'),
      `<p class="dnote">${esc(t(
        `${t(hx.name.ko, hx.name.en)} · ${hx.gradeTx(hold.grade)} · ${hold.ids.length}문항 중 ${done}개 풀었어요`,
        `${t(hx.name.ko, hx.name.en)} · ${hx.gradeTx(hold.grade)} · ${done} of ${hold.ids.length} answered`
      ))}</p>` +
      goBtn(hold.exam, 'reading', t('이어서 풀기 →', 'Resume →')));
  })();

  const weakCard = !allRows.length ? '' : card(
    t('약한 곳', 'Weakest spots'),
    weak.length
      ? weak.map((r) => {
          const skillTx = TQ_SKILLS[r.skill].name;
          const p = pct(r.s, r.n);
          return '<div class="drow">' +
            `<div class="drow-main"><div class="drow-w">${esc(t(r.name.ko, r.name.en))}</div>` +
            `<div class="drow-m">${esc(t(skillTx.ko, skillTx.en))} · ${esc(TQ_EXAMS[r.exam].gradeTx(r.g))}</div></div>` +
            `<div class="drow-n">${p}%</div>` +
          '</div>';
        }).join('') +
        goBtn(weak[0].exam, weak[0].skill, t(`${t(weak[0].name.ko, weak[0].name.en)} 풀어 보기 →`, `Practise ${t(weak[0].name.ko, weak[0].name.en)} →`))
      : `<p class="dnote">${esc(t('유형별로 고르게 나왔어요.', 'Even across every type.'))}</p>`
  );

  const twCard = !twRows.length ? '' : card(
    t('쓰기 51·52번', 'Writing 51–52'),
    twRows.map((r) => {
      const sumPt = r.done.reduce((s, x) => s + x.pt, 0);
      const sumMax = r.done.reduce((s, x) => s + x.max, 0);
      const p = pct(sumPt, sumMax);
      return `<div class="dbar-row"><span>${r.q}${t('번', '')}</span><span><b>${r.done.length}</b> / ${r.items.length} · ${p}${t('점', '%')}</span></div>` +
        `<div class="dbar-wrap"><div class="dbar" style="width:${p}%"></div></div>`;
    }).join(''));

  return sec(t('TOPIK 풀이', 'TOPIK practice'),
    holdCard +
    (allRows.length
      ? card(t('전체 정답률', 'Overall accuracy'),
          `<div class="kpis" style="grid-template-columns:1fr 1fr;">` +
            `<div class="kpi"><div class="kpi-l">${t('시도한 문제', 'Answered')}</div><div class="kpi-v">${sumN}</div></div>` +
            `<div class="kpi"><div class="kpi-l">${t('정답률', 'Correct')}</div><div class="kpi-v">${overallPct}<small>%</small></div></div>` +
          '</div>')
      : '') +
    weakCard + twCard
  );
}

// ══ 배우기 ═══════════════════════════════════════════════════
// 내용은 courses.js 에 있다. 여기는 그리고 채점하고 진도를 남기는 일만 한다.

let doneSet = new Set();     // 끝낸 lesson id
let doneDays = [];           // 끝낸 날짜(YYYY-MM-DD) 내림차순 — 연속일 계산용
let lsCourse = null, lsLesson = null;
let lsQueue = [], lsSolved = 0, lsTotal = 0;

/* ── Cloze 게임 상태 (Clozemaster Vibe) ── */
let lsHp = 3;                 // 하트 3개
let lsXp = 0;                 // 누적 경험치
let lsCombo = 0;              // 연속 정답 수
let lsWrong = [];             // 틀린 cloze 블록 (복습 챌린지용) — [{sentence, answer, options, meaning, q?}]
let lsMode = 'lesson';        // 'lesson' | 'challenge' (1분 복습 모드)
let lsChallengeTimer = 0;     // 챌린지 setInterval id
let lsChallengeLeft = 60;     // 챌린지 남은 초
let lsChallengeQ = [];        // 챌린지 문제 큐 (틀린 문제들 + 필요하면 부풀림)
let lsChallengeScore = 0;     // 챌린지 점수

/* 글자 안쪽 서식. **굵게** 와 `코드` 만 받는다.
   레슨 글은 우리가 쓰는 것이라 더 넓힐 이유가 없고, 넓히면 그만큼
   깨질 자리가 는다. */
function md(s) {
  return esc(String(s ?? ''))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p class="bk-p">');
}

/* 「A: 저 다음 달에 결혼해요! B: 결혼하신다니! 너무 놀라워요.」처럼 두 사람이
   주고받는 말을 한 줄로 이어 붙이면 어디까지가 A 의 말이고 어디부터가 B 의
   말인지 눈으로 못 가른다. 말하는 사람이 바뀌는 자리에서 줄을 나눈다.

   **자료의 sentence 는 손대지 않는다.** 그 글자가 마스터리 기록의 열쇠라서
   (exBlock 의 audioSlug(senRaw)) 줄바꿈 하나만 넣어도 학습자가 쌓아 둔
   숙달도가 통째로 고아가 된다. 이미 escape 를 마친 HTML 을 받아 그리는
   쪽에서만 나눈다.

   말꼬리가 한 종류뿐이면 대화가 아니므로 손대지 않고 그대로 돌려준다 —
   영어 뜻풀이에 「A: 」 하나가 우연히 들어 있다고 줄을 나누면 안 된다. */
const DLG_WHO = /(^|[\s>])((?:[A-D]|남자|여자|점원|손님|의사|기사)\s*:)\s*/g;
function dlgLines(html) {
  const s = String(html ?? '');
  const at = [...s.matchAll(DLG_WHO)];
  if (new Set(at.map((m) => m[2].replace(/\s/g, ''))).size < 2) return s;
  /* 첫 말꼬리 앞에 남는 것은 「(단톡방)」 같은 상황 설명이다. */
  const scene = s.slice(0, at[0].index + at[0][1].length).trim();
  const turns = at.map((m, i) => {
    const from = m.index + m[0].length;
    const next = at[i + 1];
    const to = next ? next.index + next[1].length : s.length;
    return { who: m[2].replace(/\s*:$/, ''), said: s.slice(from, to).trim() };
  });
  return (scene ? `<span class="dlg-scene">${scene}</span>` : '') +
    turns.map((x) =>
      `<span class="dlg-turn"><b class="dlg-who">${x.who}</b>` +
      `<span class="dlg-said">${x.said}</span></span>`).join('');
}

/* 보기 섞기.
   sort(() => Math.random() - .5) 는 이 파일 곳곳에 쓰지만 여기서는 안 된다.
   그 방법은 자리가 고르게 안 퍼져서, 만 번 돌리면 정답이 첫 자리에 14%,
   가운데에 38% 씩 몰린다. 자리가 단서가 되지 않게 하려고 섞는 것이므로
   치우치면 하나 마나다. 뒤에서부터 하나씩 뽑아 바꾼다(피셔–예이츠). */
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 인라인 서식만. 표 칸이나 <p> 안처럼 문단을 새로 못 여는 자리에 쓴다. */
function mdIn(s) {
  return esc(String(s ?? ''))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/* 레슨 본문. ### 제목, | 표 |, - 목록, 그리고 문단을 만든다.
   md() 로는 이것들을 못 그린다. md() 가 문제 지문과 표 칸에도 쓰이는데,
   <p> 안에 <table> 이나 <h> 를 넣으면 브라우저가 <p> 를 먼저 닫아 버려서
   서식이 통째로 어긋나기 때문이다. 그래서 본문만 여기서 따로 그린다.

   글 하나가 안 읽히면 학습자는 거기서 막힌다. 데이터에 마크다운을 써 놓고
   렌더러가 모르면 화면에 ### 와 파이프가 그대로 나온다 — 실제로 그랬다. */
function mdBlock(src) {
  const lines = String(src ?? '').split('\n');
  let out = '', para = [], list = null, table = null;

  const flushPara = () => {
    // 한 줄 개행은 문단 안의 줄바꿈이다. 예전부터 공백으로 이어 붙여
    // 왔으므로 그대로 둔다 — 여기서 <br> 로 바꾸면 기존 26개 레슨의
    // 생김새가 한꺼번에 달라진다.
    if (para.length) { out += `<p class="bk-p">${mdIn(para.join(' '))}</p>`; para = []; }
  };
  const flushList = () => {
    if (!list) return;
    out += `<${list.tag} class="bk-list">` +
      list.items.map((x) => `<li>${mdIn(x)}</li>`).join('') + `</${list.tag}>`;
    list = null;
  };
  const flushTable = () => {
    if (!table) return;
    const [head, ...rows] = table;
    out += '<div class="bk-tw bk-tw-in"><table><thead><tr>' +
      head.map((h) => `<th>${mdIn(h)}</th>`).join('') + '</tr></thead><tbody>' +
      rows.map((r) => '<tr>' + r.map((c) => `<td>${mdIn(c)}</td>`).join('') + '</tr>').join('') +
      '</tbody></table></div>';
    table = null;
  };
  const flushAll = () => { flushPara(); flushList(); flushTable(); };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushAll(); continue; }

    if (/^\|.*\|$/.test(line)) {
      flushPara(); flushList();
      const cells = line.slice(1, -1).split('|').map((x) => x.trim());
      // |---|---| 구분선은 자리만 잡는 줄이라 버린다.
      if (cells.every((x) => /^:?-{2,}:?$/.test(x))) continue;
      (table ??= []).push(cells);
      continue;
    }
    flushTable();

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushPara(); flushList(); out += `<div class="bk-h bk-h-in">${mdIn(h[2])}</div>`; continue; }

    const ul = line.match(/^[-*]\s+(.*)$/);
    const ol = line.match(/^\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const tag = ul ? 'ul' : 'ol';
      if (list && list.tag !== tag) flushList();
      (list ??= { tag, items: [] }).items.push((ul || ol)[1]);
      continue;
    }
    flushList();

    para.push(line);
  }
  flushAll();
  return out;
}

/* 한국어 음성.
   1순위: 직접 제작한 고품질 MP3 파일 (local assets/audio/ or Supabase Storage URL)
   2순위(Fallback): 브라우저 내장 Web Speech API
   - 코스 블록에서 `audio` 필드로 직접 경로/URL을 지정하거나,
     지정하지 않으면 `audioSlug(텍스트).mp3` 로 자동 생성된 경로를 먼저 탐색
   - MP3가 없거나 로딩/재생 실패시 조용히 Web Speech 로 전환 (오류창 절대 안 띄움) */

/* 오디오 파일명으로 안전하게 쓸 수 있도록 텍스트 정규화.
   한글·영어·숫자는 유지, 그 외 특수문자·공백은 언더바로 치환한다.

   **낱자(ㄱ ㄴ ㅏ ㅓ …)를 빠뜨리면 안 된다.** 낱자는 한글 음절
   (U+AC00~D7AF)이 아니라 호환 자모(U+3130~318F)에 있어서, 음절 범위만
   남기면 「ㄱ」이 통째로 지워져 이름이 빈 문자열이 된다. 그러면
   say('ㄱ') 이 assets/audio/.mp3 를 찾아 영영 못 만난다 — 글자 카드
   39개는 한글을 처음 배우는 사람이 가장 먼저 듣는 소리인데, 녹음을
   올려도 로봇 목소리로만 나오게 된다. tools/tts-manifest.mjs 에 같은
   함수가 있으니 여기를 고치면 그쪽도 고쳐라. */
function audioSlug(text) {
  return String(text ?? '').trim()
    .replace(/[^\u3130-\u318F\uAC00-\uD7AFa-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

/* Supabase Storage public base URL — env나 설정값이 있으면 그걸 우선 사용
   (추후 Supabase CLI로 스토리지 버킷 생성시 여기만 교체하면 됨) */
const AUDIO_BASE = (typeof window !== 'undefined' && window.__AUDIO_BASE__) || 'assets/audio/';
const AUDIO_EXT = '.mp3';

/* 개별 Audio 재생 Promise — 로드/재생 중 에러나면 reject */
function playAudioFile(url) {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 1.0;
      const onEnd = () => { cleanup(); resolve(); };
      const onErr = (e) => { cleanup(); reject(e || new Error('audio error')); };
      const cleanup = () => {
        audio.removeEventListener('ended', onEnd);
        audio.removeEventListener('error', onErr);
        audio.pause();
        try { audio.src = ''; } catch (e) {}
      };
      audio.addEventListener('ended', onEnd, { once: true });
      audio.addEventListener('error', onErr, { once: true });
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(onErr);
    } catch (e) {
      reject(e);
    }
  });
}

/* 브라우저 내장 TTS 재생 (기존 로직 그대로 유지 — Fallback) */
function playWebSpeech(text) {
  try {
    if ('speechSynthesis' in window === false) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.85;   // 배우는 중이라 조금 느리게
    speechSynthesis.speak(u);
  } catch (e) { /* 지원 안 함 — 조용히 넘어간다 */ }
}

/* 모든 TTS 진입점 — MP3 우선, 없으면 Web Speech Fallback
   @param {string} text — 읽을 텍스트 (Web Speech Fallback 용)
   @param {string} [audioUrl] — 직접 지정하는 MP3 경로/URL (없으면 slug 기반 탐색) */
function say(text, audioUrl) {
  try {
    if (!text) return;
    if ('speechSynthesis' in window) speechSynthesis.cancel();

    // 1. 직접 지정한 audioUrl 우선, 없으면 slug 기반 경로 자동 생성
    const mp3 = audioUrl || (AUDIO_BASE + audioSlug(text) + AUDIO_EXT);

    // 2. MP3 시도 — 성공하면 그대로 끝, 실패하면 Fallback
    playAudioFile(mp3).catch(() => playWebSpeech(text));
  } catch (e) {
    // 어떤 오류가 나도 조용히 Fallback
    try { playWebSpeech(text); } catch (e2) {}
  }
}

async function loadProgress() {
  doneSet = new Set(); doneDays = [];
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;
  try {
    const { data, error } = await sb.from('lesson_progress')
      .select('lesson_id, done_at').eq('user_id', session.user.id)
      .order('done_at', { ascending: false });
    if (error || !data) return;
    data.forEach((r) => doneSet.add(r.lesson_id));
    doneDays = [...new Set(data.map((r) => String(r.done_at).slice(0, 10)))];
  } catch (e) { /* 표가 아직 없으면 진도 없이 그냥 쓴다 */ }
}

/* 연속 학습일. 오늘 안 했으면 어제까지의 연속을 보여준다 —
   자정 넘자마자 0 이 되면 어제 한 일이 사라진 것처럼 보인다. */
function streak() {
  if (!doneDays.length) return 0;
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const key = (x) => `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  if (doneDays[0] !== key(d)) d.setDate(d.getDate() - 1);
  let n = 0;
  for (;;) { if (!doneDays.includes(key(d))) break; n++; d.setDate(d.getDate() - 1); }
  return n;
}

const courseDone = (c) => c.lessons.filter((l) => doneSet.has(l.id)).length;

/* ── 배우기 갈래 ────────────────────────────────────────────────
   여기 한 줄을 더하면 갈래가 하나 는다. 화면(HTML)은 안 건드린다 —
   갈래마다 마크업을 따로 두면 하나 고치고 다른 하나가 죽는다.

   ready:false 는 아직 안 채운 갈래다. 카드는 보이되 눌러도 "준비 중" 만
   나온다. 내용이 들어오면 ready 를 켜고 pane 을 이어 붙이면 된다.
   pane 은 그 갈래를 열었을 때 보일 요소의 id 다. */
const LEARN_SECTIONS = [
  {
    id: 'courses', emoji: '📚', ready: true, pane: 'lcWrap',
    lv:    { ko: '코스',            en: 'COURSES' },
    title: { ko: '코스로 배우기',    en: 'Learn by course' },
    tag:   { ko: '한글부터 문장 만들기까지, 순서대로',
             en: 'Hangul to building sentences, in order' },
    blurb: { ko: '읽는 설명과 푸는 문제가 한 레슨 안에 같이 있어요. 처음이라면 여기서 시작하세요.',
             en: 'Each lesson mixes what to read with what to try. Start here if you are new.' },
  },
  {
    id: 'topik', emoji: '📖', ready: true, pane: 'tqWrap',
    lv:    { ko: 'TOPIK',           en: 'TOPIK' },
    title: { ko: 'TOPIK 유형 연습',  en: 'TOPIK-style practice' },
    tag:   { ko: 'TOPIK I·II 를 듣기 · 읽기 · 쓰기로 나눠서',
             en: 'TOPIK I and II, split into listening, reading and writing' },
    blurb: { ko: '시험을 고르고 갈래를 고릅니다. 틀리면 왜 그런지 바로 알려 줘요. (기출이 아닌 창작 문항)',
             en: 'Pick your exam, then pick a skill. A wrong answer tells you why. (Original items, not past papers.)' },
  },
  {
    id: 'reading', emoji: '📝', ready: true, pane: 'rdWrap',
    lv:    { ko: '읽기',            en: 'READING' },
    title: { ko: '읽고 써 보기',     en: 'Read and write it back' },
    tag:   { ko: '읽은 것을 자기 말로 다시',
             en: 'Say it back in your own words' },
    blurb: { ko: '글을 읽고 이해한 것을 직접 써 봅니다. 무엇을 짚었고 무엇을 놓쳤는지 바로 알려 줘요.',
             en: 'Read a passage, then write what you understood. You see at once what you caught and what you missed.' },
  },
  /* TOPIK 쓰기는 별도 갈래였다가 TOPIK 갈래 안(TOPIK II › 쓰기)으로
     들어갔다. 실제 시험에서 쓰기는 TOPIK II 의 한 영역이지 따로 보는
     시험이 아니라, 나란히 두면 시험 구성을 잘못 가르치게 된다.
     옛 주소 #learn/writing 은 openLearnSub 가 새 자리로 넘긴다. */
  {
    id: 'quiz', emoji: '⚡', ready: true, pane: 'dqWrap',
    lv:    { ko: '문제',            en: 'DRILL' },
    title: { ko: '문제만 풀기',      en: 'Just the questions' },
    tag:   { ko: '설명은 건너뛰고 문제만 이어서',
             en: 'Skip the reading, keep the questions coming' },
    blurb: { ko: '레슨에서 문제만 뽑아 섞어 이어서 풉니다. 배운 걸 확인할 때 쓰세요.',
             en: 'Pulls the questions out of the lessons and runs them back to back.' },
  },
  {
    id: 'sentence', emoji: '✍️', ready: true, pane: 'sbWrap',
    lv:    { ko: '예문',            en: 'SENTENCES' },
    title: { ko: '예문 만들기',      en: 'Build a sentence' },
    tag:   { ko: '외운 문장 말고 내 문장',
             en: 'Your own sentence, not a memorised one' },
    blurb: { ko: '배운 조각으로 직접 문장을 만들어 봅니다.',
             en: 'Put the pieces you have learned into sentences of your own.' },
  },
];

const secTx = (o) => (isEn() ? o.en : o.ko);

/* 코스·레슨의 글. 지금은 대부분 그냥 문자열이라 언어를 바꿔도 그대로
   남는다 — 한국어 화면에 「Read Korean」이, 영어 화면에 「중급 02-02」가
   그대로 뜬다. {ko, en} 으로 하나씩 옮기는 중이라 둘 다 받아 준다.
   옮기는 동안 어느 쪽이 와도 화면이 깨지지 않아야 한다.
   다 옮기고 나면 이 함수는 t() 한 줄로 줄어든다. */
const cTx = (v) => (v && typeof v === 'object')
  ? (isEn() ? (v.en ?? v.ko ?? '') : (v.ko ?? v.en ?? ''))
  : (v ?? '');
const LEARN_LEVELS = [
  {
    id: 'beginner',
    ko: '초급',
    en: 'Beginner',
    descKo: '입문, 핵심 문형, 살아남는 표현부터 먼저 익힙니다.',
    descEn: 'Start with Hangul, core patterns, and the phrases you need first.',
  },
  {
    id: 'intermediate',
    ko: '중급',
    en: 'Intermediate',
    descKo: '문장 길이를 늘리고, 이유·추측·조건을 더 자연스럽게 다룹니다.',
    descEn: 'Build longer sentences and handle reasons, guesses, and conditions.',
  },
  {
    id: 'advanced',
    ko: '고급',
    en: 'Advanced',
    descKo: '뉘앙스 차이, 격식, 고급 연결 표현까지 정교하게 다듬습니다.',
    descEn: 'Refine nuance, register, and high-level connections in real Korean.',
  },
];
const COURSE_LEVEL_FALLBACK = {
  hangul: 'beginner',
  'first-words': 'beginner',
  'grammar-core': 'beginner',
};
const COURSE_CURRICULUM_TAG = {
  hangul:            { ko:'입문',        en:'Intro' },
  'first-words':     { ko:'기초 표현',   en:'Core phrases' },
  'grammar-core':    { ko:'문장 기초',   en:'Sentence core' },
  'bg-d-01':         { ko:'활용',        en:'Conjugation' },
  'bg-d-02':         { ko:'희망·계획',   en:'Hope & plans' },
  'bg-04':           { ko:'조사',        en:'Particles' },
  'im-02-02':        { ko:'이유·원인',   en:'Cause' },
  'im-02-03':        { ko:'이유·원인',   en:'Cause' },
  'im-03-01':        { ko:'추측',        en:'Conjecture' },
  'im-03-02':        { ko:'반응 표현',   en:'Reaction' },
  'ad-01-01':        { ko:'관형형',      en:'Adnominal forms' },
  'ad-02-01':        { ko:'화법',        en:'Speech levels' },
  // 초급 1단계 — docs/curriculum-beginner.md
  'bg-05':           { ko:'이에요/예요',  en:'Am / is' },
  'bg-06':           { ko:'있다·자리',    en:'Exist & place' },
  'bg-07':           { ko:'하다 동사',    en:'하다 verbs' },
  'bg-08':           { ko:'조사',         en:'Particles' },
  'bg-09':           { ko:'부정',         en:'Saying no' },
  'bg-irr-01':       { ko:'불규칙',       en:'Irregulars' },
};
const BEGINNER_ROADMAP = [
  {
    id:'intro',
    tag:{ ko:'0. 입문 및 기초', en:'0. Introduction' },
    title:{ ko:'읽기와 생존 표현', en:'Reading and survival phrases' },
    points:[
      { ko:'한국어 소개 · 기초 단어 · 숫자/날짜/시간의 출발점', en:'Korean basics, starter words, numbers, dates, and time foundations' },
      { ko:'N-이다 / 있다·없다 / 첫 대화 만들기', en:'N-ida, existence, and first useful dialogues' },
    ],
    courses:['hangul','first-words'],
  },
  {
    id:'core',
    tag:{ ko:'문장 뼈대', en:'Sentence core' },
    title:{ ko:'문장 구조와 활용', en:'Structure and conjugation' },
    points:[
      { ko:'한국어 문장 구조 · 동사/형용사 활용 · 문장 연결 기초', en:'Sentence structure, verb/adjective conjugation, and basic connectors' },
      { ko:'현재/과거/미래의 핵심 뼈대부터 익히기', en:'Build present, past, and future fundamentals first' },
    ],
    courses:['grammar-core','bg-d-01'],
  },
  {
    id:'expressions',
    tag:{ ko:'표현 확장', en:'Expression builder' },
    title:{ ko:'희망·계획·기초 조사', en:'Hope, plans, and starter particles' },
    points:[
      { ko:'V-고 싶다 / V-(으)ㄹ 거예요 로 바람과 계획 가르기', en:'Separate hope from plan with -go sipda and -(eu)l geoyeyo' },
      { ko:'N이/가 · N은/는으로 문장 초점 잡기', en:'Use subject and topic particles to control focus' },
    ],
    courses:['bg-d-02','bg-04'],
  },
  {
    id:'next',
    tag:{ ko:'다음 빌드', en:'Coming next' },
    title:{ ko:'초급 본편 확장', en:'Next beginner units' },
    points:[
      { ko:'부정 표현, 목적격, 위치/시간 조사, 허락·금지, 이유 표현', en:'Negation, object/location particles, permission, prohibition, and reasons' },
      { ko:'의견 묻기, 부탁, 경험, 조건까지 초급 본편으로 확장', en:'Expand into requests, experiences, opinions, and conditions' },
    ],
    courses:[],
  },
];
let learnLv = { courses: 'beginner', quiz: 'beginner', writing: 'intermediate', sentence: 'beginner', reading: 'beginner' };

const learnLevel = (id) => LEARN_LEVELS.find((x) => x.id === id) || LEARN_LEVELS[0];
const learnLevelText = (id) => (isEn() ? learnLevel(id).en : learnLevel(id).ko);
/* 세그먼트 모양은 발음 테스트의 .pt-lv-row / .pt-lv-desc 를 그대로 쓴다(글씨만
   있는 스타일이라 빌려도 된다). 다만 .pt-lv 는 붙이지 않는다 — 그건 스타일이
   아니라 고전 스크립트의 손잡이다. ptSetLevel() 이 `.pt-lv input[type=radio]`
   을 전부 훑어 값이 easy/normal/hard 가 아닌 것을 꺼 버리므로, 이 라디오에
   그 클래스를 달면 발음 테스트에서 난이도를 한 번 바꾸는 순간 배우기의
   단계 선택이 통째로 풀린다. */
function renderLevelSwitch(section) {
  const cur = learnLevel(learnLv[section]);
  return (
    '<div class="pt-lv-row">' +
      `<div class="diff-seg learn-lv" role="radiogroup" aria-label="${t('단계', 'Level')}">` +
        LEARN_LEVELS.map((lv) =>
          `<label><input type="radio" name="learn_${section}" value="${lv.id}" data-learn-section="${section}" data-learn-level="${lv.id}"${lv.id === cur.id ? ' checked' : ''}><span>${esc(isEn() ? lv.en : lv.ko)}</span></label>`
        ).join('') +
      '</div>' +
      `<div class="pt-lv-desc">${esc(isEn() ? cur.descEn : cur.descKo)}</div>` +
    '</div>'
  );
}
function renderLearnSummary(items) {
  return items.map((item) =>
    '<div class="learn-stat">' +
      `<div class="learn-stat-k">${esc(item.k)}</div>` +
      `<div class="learn-stat-v">${esc(String(item.v))}</div>` +
      `<div class="learn-stat-s">${esc(item.s)}</div>` +
    '</div>'
  ).join('');
}
function courseTier(c) {
  const lv = String(c.level || '').toLowerCase();
  if (lv === 'beginner' || lv === 'intermediate' || lv === 'advanced') return lv;
  return COURSE_LEVEL_FALLBACK[c.id] || 'beginner';
}
function courseLabel(c) {
  const lv = learnLevelText(courseTier(c));
  const unit = COURSE_CURRICULUM_TAG[c.id];
  return unit ? `${lv} · ${t(unit.ko, unit.en)}` : lv;
}
const levelCourses = (level) => COURSES.filter((c) => courseTier(c) === level);
const lessonExercises = (lesson) => lesson.blocks.filter(isEx);
/* 단계는 sentences.js 의 표현마다 붙어 있다. 갈래가 아니라 표현이 가진다 —
   「원인과 이유」 안에 -아서(초급)와 -기로서니(고급)가 같이 있는 것이 정상이다.
   lv 를 빠뜨린 표현은 화면에서 사라지는 대신 중급으로 떨어진다. 놓친 것은
   `node tools/check-sentences.mjs` 가 잡는다. */
const sentenceTier = (p) =>
  (p.lv === 'beginner' || p.lv === 'intermediate' || p.lv === 'advanced') ? p.lv : 'intermediate';

/* ══ TOPIK 유형 연습 ═════════════════════════════════════════
   **기출이 아니다.** 유형만 따라 한 자체 제작 문제이고, 화면에도 그렇게
   적어 둔다. 공식 시험을 사칭하는 것처럼 보이면 저작권보다 스토어 정책에
   먼저 걸린다.

   다른 갈래와 달리 초급·중급·고급이 아니라 **급수(1급·2급)** 로 나눈다.
   TOPIK 을 준비하는 사람은 어차피 급수로 생각하고, 지금 자료가 TOPIK I
   뿐이라 초급·중급·고급으로 나누면 두 탭이 빈다.

   유형별로 골라 풀 수 있게 한 것은, 못 하는 유형이 사람마다 다르기
   때문이다. 순서 배열만 계속 틀리는 사람에게 서른 문제를 통째로 다시
   내밀면 그 사람은 이미 맞히는 문제를 스물다섯 개 더 푼다. */
/* 유형 이름은 topik.js 의 청사진에서 뽑아 쓴다. 여기에 따로 적어 두면
   자료에 유형이 하나 늘 때 화면에서만 조용히 빠진다. 실제로 그랬다 —
   실용문이 「안내문 읽기」로 적혀 있었는데, 시험에서 그 자리는 「맞지
   않는 것」을 고르는 자리라 뜻이 어긋나 있었다. */
/* 시험 두 벌. 화면은 늘 「고른 시험」 하나만 본다 — tqE() 가 그 벌을 준다.
   TOPIK I 은 읽기가 31~70번 40문항 60분, II 는 1~50번 50문항 70분이다.

   급수가 안 겹치는 것(I 은 1·2, II 는 3~6)이 다행이라, 급수를 열쇠로 쓰는
   기록들(최고 점수·세트별 점수·모의고사 이력)은 손대지 않아도 섞이지 않는다. */
const TQ_EXAMS = {
  I: {
    /* 자료가 아직 안 왔으면 빈 것을 준다. 화면이 잠깐 비는 것과
       터지는 것은 다르다 — 부르는 쪽은 tqNeedData 를 await 한다. */
    get reading()   { return TQ_DATA.I?.reading   ?? []; },
    get blueprint() { return TQ_DATA.I?.blueprint ?? []; },
    get slots()     { return TQ_DATA.I?.slots     ?? {}; },
    grades: [1, 2], mockSec: 60 * 60, from: 31, to: 70,
    name: { ko: 'TOPIK I', en: 'TOPIK I' },
    sub: { ko: '1·2급', en: 'Levels 1–2' },
    /* 급수를 부르는 말. II 는 우리가 붙인 난이도 구간이라 「급」이라고
       못 박으면 사칭이 된다 — 실제 3~6급은 총점으로 갈린다. */
    gradeTx: (g) => t(`${g}급`, `Level ${g}`),
    chipTx: (g) => t(`${g}급`, `Lv ${g}`),
    lead: (g) => (g === 1
      ? t('가장 기초. 짧은 글과 안내문을 읽고 고릅니다.', 'The basics — short texts and notices.')
      : t('생활에서 겪는 상황. 글이 조금 길어집니다.', 'Everyday situations, with slightly longer texts.')),
  },
  II: {
    /* 자료가 아직 안 왔으면 빈 것을 준다. 화면이 잠깐 비는 것과
       터지는 것은 다르다 — 부르는 쪽은 tqNeedData 를 await 한다. */
    get reading()   { return TQ_DATA.II?.reading   ?? []; },
    get blueprint() { return TQ_DATA.II?.blueprint ?? []; },
    get slots()     { return TQ_DATA.II?.slots     ?? {}; },
    grades: [3, 4, 5, 6], mockSec: 70 * 60, from: 1, to: 50,
    name: { ko: 'TOPIK II', en: 'TOPIK II' },
    sub: { ko: '3~6급 수준', en: 'Levels 3–6' },
    gradeTx: (g) => t(`${g}급 수준`, `Level ${g}`),
    /* 칩은 짧게. 「3급 수준」 넷을 한 줄에 두면 좁은 화면에서 「3급 수 / 준」
       으로 접힌다. 우리가 나눈 구간이라는 것은 칩 위의 시험 딱지(3~6급 수준)와
       아래 설명·안내문이 이미 말하고 있다. */
    chipTx: (g) => t(`${g}급`, `Lv ${g}`),
    lead: (g) => ({
      3: t('짧은 실용문과 문법. 광고와 안내문을 읽습니다.', 'Short practical texts and grammar — ads and notices.'),
      4: t('순서와 맥락. 설명문과 수필이 나옵니다.', 'Order and context — short essays and explanations.'),
      5: t('신문 제목과 긴 설명문. 추론이 들어갑니다.', 'Headlines and longer texts, with inference.'),
      6: t('논설문과 소설. 필자의 태도와 의도까지 봅니다.', 'Editorials and fiction — the writer\'s stance and intent.'),
    }[g] || ''),
  },
};
const TQ_EXAM_KEY = 'cp-topik-exam';
let tqExam = 'I';
try { const e = localStorage.getItem(TQ_EXAM_KEY); if (TQ_EXAMS[e]) tqExam = e; } catch (e) {}
const tqE = () => TQ_EXAMS[tqExam];

/* ═══════════════════════════════════════════════════════════════
   TOPIK 갈래 — 듣기 · 읽기 · 쓰기
   ───────────────────────────────────────────────────────────────
   시험을 먼저 고르고 그 안에서 갈래를 고른다.

   **TOPIK I 에는 쓰기가 없다.** 실제 시험이 듣기 30 + 읽기 40 이고 쓰기는
   TOPIK II 에만 있다. 있지도 않은 갈래를 연습 시키면 시험장에서 처음
   놀라게 되므로, exams 에 적힌 시험에서만 그 갈래를 낸다.

   쓰기는 예전에 배우기의 별도 갈래(#learn/writing)였다. 주소가 정적 쪽에
   걸려 있어 openLearnSub 가 여기로 넘긴다 — 옛 주소를 죽이면 검색에서
   들어온 사람이 빈 화면을 본다.
   ═══════════════════════════════════════════════════════════════ */
const TQ_SKILLS = {
  listening: { emoji: '🎧', exams: ['I', 'II'], body: 'tqBodyListen',
               name: { ko: '듣기', en: 'Listening' } },
  reading:   { emoji: '📖', exams: ['I', 'II'], body: 'tqBodyRead',
               name: { ko: '읽기', en: 'Reading' } },
  writing:   { emoji: '✍️', exams: ['II'],      body: 'tqBodyWrite',
               name: { ko: '쓰기', en: 'Writing' } },
};
const TQ_SKILL_KEY = 'cp-topik-skill';
let tqSkill = 'reading';
try { const s = localStorage.getItem(TQ_SKILL_KEY); if (TQ_SKILLS[s]) tqSkill = s; } catch (e) {}

const tqSkillsFor = (exam) =>
  Object.entries(TQ_SKILLS).filter(([, v]) => v.exams.includes(exam)).map(([k]) => k);

/* 시험을 바꿨을 때 그 시험에 없는 갈래에 서 있으면 읽기로 물러난다.
   TOPIK II 쓰기를 보다가 TOPIK I 을 누르면 갈 곳이 없어지기 때문이다. */
function tqFixSkill() {
  if (!tqSkillsFor(tqExam).includes(tqSkill)) tqSkill = 'reading';
}

function tqDrawSkillBar() {
  tqFixSkill();
  $('tqSkillBar').className = 'tq-skillbar';
  $('tqSkillBar').innerHTML =
    `<div class="diff-seg tq-lv tq-exam" role="radiogroup" aria-label="${t('시험', 'Exam')}">` +
      Object.entries(TQ_EXAMS).map(([k, v]) =>
        `<label><input type="radio" name="tqExam" value="${k}"${k === tqExam ? ' checked' : ''}>` +
        `<span>${esc(t(v.name.ko, v.name.en))} <b>${esc(t(v.sub.ko, v.sub.en))}</b></span></label>`
      ).join('') +
    '</div>' +
    '<div class="tq-skills">' +
      tqSkillsFor(tqExam).map((k) => {
        const s = TQ_SKILLS[k];
        return `<button class="tq-skill" type="button" data-tqskill="${k}"` +
               ` aria-pressed="${k === tqSkill}">` +
               `<span class="tq-skill-em" aria-hidden="true">${s.emoji}</span>` +
               `${esc(t(s.name.ko, s.name.en))}</button>`;
      }).join('') +
    '</div>';
}

/* 고른 갈래의 판만 보이고 나머지는 닫는다. 목록을 훑어서 닫는 이유는
   갈래를 늘릴 때 여기 한 줄을 빠뜨리면 예전 갈래가 겹쳐 남기 때문이다. */
async function tqShowSkill(quiet) {
  tqFixSkill();
  tlStop();
  /* 시험지가 와야 갈래 목록의 문항 수·회차가 나온다. 안 기다리면 0문항짜리
     빈 카드가 잠깐 보였다가 채워진다 — 느린 망에서만 보이는 종류다. */
  await tqNeedData();
  tqDrawSkillBar();
  Object.values(TQ_SKILLS).forEach((s) => $(s.body)?.classList.add('hidden'));
  const body = $(TQ_SKILLS[tqSkill].body);
  if (body) body.classList.remove('hidden');
  if (tqSkill === 'reading')   drawTopik();
  if (tqSkill === 'listening') tlDraw();
  if (tqSkill === 'writing')   twDraw();
  if (!quiet) window.cpMark('learn', `topik/${tqExam}/${tqSkill}`);
}

function tqSetSkill(k, quiet) {
  if (!TQ_SKILLS[k] || !tqSkillsFor(tqExam).includes(k)) return;
  tqSkill = k;
  try { localStorage.setItem(TQ_SKILL_KEY, k); } catch (e) {}
  tqShowSkill(quiet);
}

/* ═══════════════════════════════════════════════════════════════
   듣기
   ───────────────────────────────────────────────────────────────
   한 문항 = 한 MP3 다 (assets/audio/listen/<id>.mp3). 파일이 없으면
   브라우저 내장 목소리가 대본을 차례로 읽는다 — say() 와 같은 폴백이라
   **파일을 채우면 코드를 안 고쳐도 진짜 목소리로 바뀐다.**

   줄마다 파일을 따로 두지 않는 이유: 실제 시험은 대화가 끊기지 않고
   이어서 들린다. 줄 사이에 로딩 틈이 생기면 난이도가 달라진다.
   ═══════════════════════════════════════════════════════════════ */
const TL_BASE = (window.__AUDIO_BASE__ || 'assets/audio/') + 'listen/';
const TL_WHO = { m: { ko: '남자', en: 'M' }, w: { ko: '여자', en: 'W' }, n: { ko: '안내', en: 'N' } };

let tlRound = [], tlIdx = 0, tlScore = 0, tlWrong = [], tlPlayed = 0;
let tlAudioEl = null, tlSetName = '', tlSet = 'all';

const tlE = () => TOPIKL_BY_EXAM[tqExam] || TOPIKL_BY_EXAM.I;
const tlOf = (grade) => tlE().items.filter((q) => q.grade === grade);

function tlStop() {
  if (tlAudioEl) { try { tlAudioEl.pause(); } catch (e) {} tlAudioEl = null; }
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
}

/* 브라우저 목소리로 대본을 읽는다. **남녀를 갈라야 한다** — 듣기 문항의
   절반이 「여자는 무엇을 합니까」인데 둘이 같은 소리로 나오면 그 문제는
   풀 방법이 아예 없다. 한국어 목소리가 하나뿐인 기기가 많아 음높이로
   가른다. 완벽하진 않아도 누가 말하는지는 구분된다. */
function tlWebSpeech(script, onDone) {
  if (!('speechSynthesis' in window)) { onDone && onDone(); return; }
  speechSynthesis.cancel();
  let i = 0;
  const next = () => {
    if (i >= script.length) { onDone && onDone(); return; }
    const line = script[i++];
    try {
      const u = new SpeechSynthesisUtterance(line.text);
      u.lang = 'ko-KR';
      u.rate = 0.92;
      u.pitch = line.who === 'w' ? 1.35 : line.who === 'm' ? 0.72 : 1;
      u.onend = next;
      u.onerror = next;
      speechSynthesis.speak(u);
    } catch (e) { next(); }
  };
  next();
}

function tlSpeak(q, onDone) {
  tlStop();
  let done = false;
  const finish = () => { if (done) return; done = true; tlAudioEl = null; onDone && onDone(); };
  const fall = () => { if (done) return; done = true; tlAudioEl = null; tlWebSpeech(q.script, onDone); };
  try {
    const a = new Audio(`${TL_BASE}${q.id}.mp3`);
    tlAudioEl = a;
    a.onended = finish;
    a.onerror = fall;
    a.play().catch(fall);
  } catch (e) { fall(); }
}

const tlTypeTx = () => Object.fromEntries(tlE().blueprint.map((b) => [b.type, { ko: b.ko, en: b.en }]));
const tlBestKey = (g) => `cp-tl-best-${tqExam}-${g}`;

/* 세트별 점수 — 읽기의 tqSetKey·tqSetRead·tqSetWrite 와 같은 모양이다.
   급수(1·2=I, 3~6=II)가 시험을 가르므로 tqSetKey 처럼 exam 없이도 안
   섞이지만, tlBestKey 가 이미 exam 을 넣는 규칙이라 그대로 맞춘다. */
const tlSetKey = (exam, g, set) => `cp-tl-set-${exam}-${g}-${set}`;
function tlSetRead(exam, g, set) {
  try {
    const m = /^(\d+)\/(\d+)$/.exec(localStorage.getItem(tlSetKey(exam, g, set)) || '');
    return m ? { s: +m[1], n: +m[2] } : null;
  } catch (e) { return null; }
}
function tlSetWrite(exam, g, set, s, n) {
  const had = tlSetRead(exam, g, set);
  if (had && had.s / had.n >= s / n) return;
  try { localStorage.setItem(tlSetKey(exam, g, set), `${s}/${n}`); } catch (e) {}
}

/* 기록판 — 유형별 점수와 약한 유형 짚어 주기. tqDrawRecord 와 같은 계산을
   tqBar·tqWeakTip(둘 다 순수 함수) 그대로 재사용한다. */
function tlDrawRecord(byType) {
  const box = $('tlRecord');
  const sets = ['all', ...tlE().blueprint.map((b) => b.type).filter((k, i, a) => a.indexOf(k) === i && byType[k])];
  const name = (k) => (k === 'all'
    ? t('전체 이어서 듣기', 'Listen straight through')
    : t(tlTypeTx()[k].ko, tlTypeTx()[k].en));
  const total = (k) => (k === 'all' ? tlOf(tqGrade).length : byType[k].length);

  const rec = sets.map((k) => ({ k, r: tlSetRead(tqExam, tqGrade, k), now: total(k) }));
  if (!rec.some((x) => x.r)) { box.textContent = ''; box.classList.add('hidden'); return; }

  const weak = rec
    .filter((x) => x.k !== 'all' && x.r && x.r.n >= 3 && x.r.s / x.r.n < TQ_WEAK)
    .sort((a, b) => (a.r.s / a.r.n) - (b.r.s / b.r.n));

  box.innerHTML =
    `<div class="tq-bd-h">${esc(t('세트별 점수', 'Your scores'))}</div>` +
    rec.map((x, i) =>
      (i === 1 ? '<div class="tq-rec-sep"></div>' : '') +
      tqBar(name(x.k), x.r ? x.r.s : null, x.r ? x.r.n : x.now,
            x.k === 'all' ? ' tq-rec-row-all' : '')
    ).join('') +
    (weak.length
      ? tqWeakTip(weak.map((x) => x.k), rec.length - 1, name)
      : (rec.every((x) => x.r) ? tqWeakTip([], 0, name) : ''));
  box.classList.remove('hidden');
}

/* 고르기 화면 — 급수와 유형별 카드. */
function tlDraw() {
  $('tlPick').classList.remove('hidden');
  $('tlPlay').classList.add('hidden');
  $('tlOver').classList.add('hidden');

  const ex = tqE();
  const rows = tlOf(tqGrade);
  const byType = {};
  rows.forEach((q) => { (byType[q.type] = byType[q.type] || []).push(q); });

  $('tlLevel').innerHTML =
    '<div class="pt-lv-row">' +
      `<div class="diff-seg tq-lv" role="radiogroup" aria-label="${t('급수', 'Level')}">` +
        tqGrades().map((g) =>
          `<label><input type="radio" name="tqGrade" value="${g}"${g === tqGrade ? ' checked' : ''}><span>${esc(ex.chipTx(g))}</span></label>`
        ).join('') +
      '</div>' +
      `<div class="pt-lv-desc">${esc(ex.lead(tqGrade))}</div>` +
    '</div>';

  $('tlIntro').textContent = t(
    '듣고 보기 넷 중에서 고릅니다. 대본은 답을 고른 뒤에 보여 줘요.',
    'Listen, then pick one of four. The transcript opens after you answer.');

  $('tlSummary').innerHTML = renderLearnSummary([
    { k: t('문항', 'Items'), v: rows.length, s: t('이 급수에서 들을 수 있는 수', 'Available at this level') },
    { k: t('유형', 'Types'), v: Object.keys(byType).length, s: t('골라서 연습할 수 있어요', 'Practise one type at a time') },
    { k: t('최고', 'Best'), v: `${gameBestRead(tlBestKey(tqGrade))} / ${rows.length}`, s: t('한 번에 다 풀었을 때', 'Full run, all items') },
  ]);

  const tx = tlTypeTx();
  const card = (key, emoji, title, tag, blurb, n) =>
    `<button class="lc-card lq-card" data-tl="${esc(key)}">` +
      '<div class="lc-top">' +
        `<div class="lc-mark">${emoji}</div>` +
        '<div style="min-width:0">' +
          `<div class="lc-lv">${esc(ex.gradeTx(tqGrade))}</div>` +
          `<div class="lc-title">${esc(title)}</div>` +
          `<div class="lc-tag">${esc(tag)}</div>` +
        '</div>' +
      '</div>' +
      `<p class="lc-blurb">${esc(blurb)}</p>` +
      `<div class="lq-meta"><span class="lq-chip">${esc(t(`${n}문항`, `${n} items`))}</span></div>` +
    '</button>';

  if (!rows.length) {
    $('tlList').innerHTML = `<div class="learn-empty">${esc(t('이 급수 듣기는 아직 채우는 중이에요.', 'Listening for this level is still being written.'))}</div>`;
  } else {
    const cards = [card('all', '🎧', t('전체 이어서 듣기', 'Listen straight through'),
      t('이 급수 전부', 'Every item at this level'),
      t('유형을 섞어 차례로 듣습니다. 실제 시험처럼 무엇이 나올지 모르는 채로 풀어요.',
        'Types are mixed, as on the real paper — you do not know what is coming.'), rows.length)];
    tlE().blueprint.forEach((b) => {
      const list = byType[b.type];
      if (!list || !list.length) return;
      cards.push(card(b.type, '🔊', t(b.ko, b.en),
        t(`${b.from}~${b.to}번 유형`, `Items ${b.from}–${b.to}`),
        t('같은 유형만 모아서 듣습니다. 무엇을 물을지 알고 들으면 무엇을 놓쳤는지가 보여요.',
          'One type at a time. Knowing what is asked makes it clear what you missed.'), list.length));
    });
    $('tlList').innerHTML = cards.join('');
  }
  tlDrawRecord(byType);

  /* 그림 문항이 있는 자리는 왜 비었는지 적는다. 조용히 빠뜨리면
     학습자는 그 유형이 시험에 없는 줄 안다. */
  const pic = TOPIKL_PICTURE_SLOTS[tqExam];
  $('tlNote').textContent =
    t('TOPIK 형식을 따라 직접 만든 연습 문항이에요. 기출이 아니고 국립국제교육원과 관계가 없습니다.',
      'These are original practice items written in the TOPIK format. They are not past papers and are not affiliated with NIIED.') +
    (pic ? ' ' + t(
      `실제 시험 ${pic.slots.join('·')}번은 「${pic.ko}」인데, 그림이 있어야 성립하는 유형이라 아직 넣지 않았어요.`,
      `Items ${pic.slots.join(', ')} on the real paper are "${pic.en}". That type needs pictures, so it is not here yet.`) : '');
}

/* ── 푸는 화면 ─────────────────────────────────────────── */
function tlStart(key) {
  const rows = tlOf(tqGrade);
  const list = key === 'all' ? rows : rows.filter((q) => q.type === key);
  if (!list.length) return;
  const tx = tlTypeTx()[key];
  tlSetName = key === 'all' ? t('전체 이어서 듣기', 'Listen straight through') : (tx ? t(tx.ko, tx.en) : key);
  /* 전체는 시험 차례대로(자리 번호), 유형별도 자리 번호대로. 섞지 않는다 —
     실제 시험이 쉬운 자리부터 나오므로 그 흐름이 곧 난이도 곡선이다. */
  tlRound = [...list].sort((a, b) => a.slot - b.slot);
  tlSet = key;
  tlIdx = 0; tlScore = 0; tlWrong = [];
  $('tlPick').classList.add('hidden');
  $('tlOver').classList.add('hidden');
  $('tlPlay').classList.remove('hidden');
  $('tlPlayTitle').textContent = tlSetName;
  $('tlQuit').textContent = t('그만두기', 'Quit');
  tlDrawQ();
}

function tlDrawQ() {
  const q = tlRound[tlIdx];
  if (!q) return;
  tlStop();
  tlPlayed = 0;

  $('tlCount').textContent = `${tlIdx + 1} / ${tlRound.length}`;
  $('tlScore').textContent = String(tlScore);
  $('tlFill').style.width = `${(tlIdx / tlRound.length) * 100}%`;

  $('tlSay').classList.remove('on');
  $('tlSay').disabled = false;
  $('tlSay').textContent = '▶  ' + t('듣기', 'Play');
  $('tlPlays').textContent = t('여러 번 들어도 돼요', 'Replay as often as you like');

  $('tlQuestion').textContent = q.q;
  $('tlWhy').classList.add('hidden');
  $('tlScript').classList.add('hidden');
  $('tlNext').classList.add('hidden');
  $('tlChoices').innerHTML = q.options.map((o, i) =>
    `<button class="tq-choice" type="button" data-tlpick="${i}">${esc(o)}</button>`).join('');

  /* 문항이 바뀌면 바로 한 번 들려준다. 누르게만 해 두면 「듣기」를 안 누르고
     보기부터 읽는 사람이 생겨서 듣기 연습이 안 된다. */
  tlPlayNow();
}

function tlPlayNow() {
  const q = tlRound[tlIdx];
  if (!q) return;
  tlPlayed++;
  const b = $('tlSay');
  b.classList.add('on');
  b.textContent = '‖  ' + t('듣는 중…', 'Playing…');
  $('tlPlays').textContent = tlPlayed > 1
    ? t(`${tlPlayed}번째 듣기`, `Play ${tlPlayed}`)
    : t('여러 번 들어도 돼요', 'Replay as often as you like');
  tlSpeak(q, () => {
    b.classList.remove('on');
    b.textContent = '▶  ' + t('다시 듣기', 'Play again');
  });
}

function tlPick(i) {
  const q = tlRound[tlIdx];
  if (!q || $('tlNext').classList.contains('hidden') === false) return;
  tlStop();
  $('tlSay').classList.remove('on');
  $('tlSay').textContent = '▶  ' + t('다시 듣기', 'Play again');

  const ok = i === q.answer;
  if (ok) tlScore++;
  else tlWrong.push({ q, picked: i });

  [...$('tlChoices').querySelectorAll('[data-tlpick]')].forEach((b) => {
    const n = +b.dataset.tlpick;
    b.disabled = true;
    if (n === q.answer) b.classList.add('ok');
    else if (n === i) b.classList.add('no');
  });

  $('tlScore').textContent = String(tlScore);
  $('tlWhy').textContent = q.why;
  $('tlWhy').classList.remove('hidden');

  /* 답을 고른 다음에야 대본을 편다. 앞에 두면 듣기가 아니라 읽기가 된다. */
  $('tlScript').innerHTML =
    `<div class="tl-script-h">${esc(t('들은 내용', 'What you heard'))}</div>` +
    q.script.map((l) => {
      const w = TL_WHO[l.who] || TL_WHO.n;
      return `<div class="tl-line"><span class="tl-who ${l.who}">${esc(t(w.ko, w.en))}</span>` +
             `<span>${esc(l.text)}</span></div>`;
    }).join('');
  $('tlScript').classList.remove('hidden');

  $('tlNext').textContent = tlIdx + 1 >= tlRound.length
    ? t('결과 보기', 'See the result') : t('다음', 'Next');
  $('tlNext').classList.remove('hidden');
}

function tlNext() {
  if (tlIdx + 1 >= tlRound.length) { tlEnd(); return; }
  tlIdx++;
  tlDrawQ();
}

/* 유형별 성적 — 읽기의 tqByType·tqDrawBreak 와 같은 계산이다.
   tlWrong 은 {q, picked} 쌍이라 틀린 문항 id 만 뽑아 쓴다. */
function tlByType() {
  const missed = new Set(tlWrong.map((w) => w.q.id));
  const m = new Map();
  tlRound.forEach((q) => {
    const r = m.get(q.type) || { type: q.type, n: 0, ok: 0 };
    r.n++;
    if (!missed.has(q.id)) r.ok++;
    m.set(q.type, r);
  });
  return [...m.values()].sort((a, b) => (a.ok / a.n) - (b.ok / b.n) || b.n - a.n);
}

function tlDrawBreak() {
  const box = $('tlBreak');
  const rows = tlByType();
  /* 한 유형만 나온 판(유형별 연습)에서는 점수를 한 번 더 적는 것뿐이라 접어 둔다. */
  if (rows.length < 2) { box.textContent = ''; box.classList.add('hidden'); return; }

  const name = (k) => t(tlTypeTx()[k].ko, tlTypeTx()[k].en);
  const weak = rows.filter((r) => r.n >= 3 && r.ok / r.n < TQ_WEAK);

  box.innerHTML =
    `<div class="tq-bd-h">${esc(t('유형별로 보면', 'By type'))}</div>` +
    rows.map((r) => tqBar(name(r.type), r.ok, r.n)).join('') +
    tqWeakTip(weak.map((r) => r.type), rows.length, name);
  box.classList.remove('hidden');
}

function tlEnd() {
  tlStop();
  $('tlPlay').classList.add('hidden');
  $('tlOver').classList.remove('hidden');
  const n = tlRound.length;
  $('tlOverScore').textContent = `${tlScore} / ${n}`;
  const pct = n ? tlScore / n : 0;
  $('tlOverLine').textContent = pct === 1
    ? t('다 맞았어요. 대본 없이도 다 들렸네요.', 'All correct — you caught every one without the transcript.')
    : pct >= 0.7
      ? t('잘 들었어요. 틀린 것만 대본으로 다시 보세요.', 'Good listening. Go back over the ones you missed.')
      : t('한 번 더 들어 보세요. 틀린 문항은 대본이 아래에 있어요.', 'Try another round — the transcripts for your misses are below.');

  /* 최고 기록은 「전체 이어서 듣기」일 때만 남긴다. 유형별 점수를 최고로
     올리면 여덟 문항짜리 만점이 마흔 문항 기록을 덮어쓴다. */
  if (tlRound.length === tlOf(tqGrade).length) gameBest(tlBestKey(tqGrade), tlScore);
  /* 세트별 점수는 항상 남긴다 — 「전체」만 남기면 유형별 약한 곳을 못 짚는다. */
  tlSetWrite(tqExam, tqGrade, tlSet, tlScore, n);
  tlDrawBreak();

  $('tlWrongs').innerHTML = tlWrong.length
    ? tlWrong.map(({ q, picked }) =>
        '<div class="tq-wrong">' +
          `<div class="tq-wrong-q">${esc(q.q)}</div>` +
          `<div class="tq-wrong-a">${esc(t('고른 것', 'You picked'))}: ${esc(q.options[picked])}</div>` +
          `<div class="tq-wrong-a">${esc(t('정답', 'Answer'))}: ${esc(q.options[q.answer])}</div>` +
          `<div class="tq-wrong-w">${esc(q.why)}</div>` +
          '<div style="margin-top:9px">' +
            q.script.map((l) => {
              const w = TL_WHO[l.who] || TL_WHO.n;
              return `<div class="tl-line"><span class="tl-who ${l.who}">${esc(t(w.ko, w.en))}</span>` +
                     `<span>${esc(l.text)}</span></div>`;
            }).join('') +
          '</div>' +
        '</div>').join('')
    : '';

  $('tlAgain').textContent = t('다시 풀기', 'Try again');
  $('tlBack').textContent = t('목록으로', 'Back to the list');
}

function tlBackToPick() {
  tlStop();
  tlDraw();
}

/* 유형 이름은 고른 시험의 청사진에서 뽑는다. 두 시험을 합쳐 두면 TOPIK I
   화면에 II 에만 있는 유형(비슷한 말 고르기 등) 이름이 섞여 들어온다. */
const tqTypeTx = () => Object.fromEntries(
  tqE().blueprint.map((b) => [b.type, { ko: b.ko, en: b.en }])
);
/* 시험에 나오는 차례대로. 문항 번호를 눈으로 훑는 순서와 같다. */
const tqTypeOrder = () => [...new Set(tqE().blueprint.map((b) => b.type))];

/* 문항 번호를 「34~39번」처럼 묶어서 적는다. 잇단 번호는 한 덩어리로 —
   「49, 50, 51, 52」보다 「49~52」가 눈에 한 번에 들어온다. */
const tqRuns = (nums) => {
  const ns = [...nums].sort((a, b) => a - b);
  const runs = [];
  ns.forEach((n) => {
    const last = runs[runs.length - 1];
    if (last && n === last[1] + 1) last[1] = n;
    else runs.push([n, n]);
  });
  return runs;
};
const tqRange = (nums) => {
  const runs = tqRuns(nums);
  if (!runs.length) return '';
  const dash = t('~', '–');
  return runs.map(([a, b]) => (a === b ? `${a}` : `${a}${dash}${b}`)).join(', ') + t('번', '');
};
/* 자리가 흩어져 있는 유형은 번호를 다 적으면 「34~39, 49, 51, 53, 55, 61,
   65, 67, 69번」이 되어 카드 부제가 두 줄로 접힌다. 앞 덩어리만 적고
   나머지는 개수로 접는다 — 몇 자리짜리 유형인지가 사실 더 쓸모 있다. */
const tqRangeShort = (nums) => {
  const runs = tqRuns(nums);
  if (runs.length <= 2) return tqRange(nums) + t(' 자리', '');
  const [a, b] = runs[0];
  const rest = [...nums].length - (b - a + 1);
  return (a === b ? `${a}` : `${a}~${b}`) + t(`번 외 ${rest}자리`, ` and ${rest} more`);
};
/* 이 카드에 실제로 든 문제가 시험에서 몇 번 자리인지. 청사진 전체가 아니라
   **가진 것**을 적는다 — 빈칸 유형은 청사진상 34~39·49·51·53·55·61·65·67·69번
   자리인데 지금 있는 것은 34~39번뿐이라, 청사진을 그대로 적으면 없는 연습을
   있다고 말하게 되고 줄도 두 줄로 접힌다. */
const tqSlotLabel = (rows) => tqRangeShort([...new Set(rows.map((q) => q.slot))]);
/* 이 아래로 떨어지면 「약한 유형」으로 본다. */
const TQ_WEAK = 0.6;
/* 고른 급수는 시험마다 따로 적어 둔다. 한 칸에 넣으면 TOPIK II 에서 5급을
   고른 뒤 I 로 돌아왔을 때 있지도 않은 5급이 골라져 있게 된다. */
const TQ_KEY = (exam) => (exam === 'I' ? 'cp-topik-grade' : `cp-topik-grade-${exam}`);
const tqGrades = () => tqE().grades;

let tqGrade = 1;
const tqLoadGrade = () => {
  const gs = tqGrades();
  let g = gs[0];
  try { const v = parseInt(localStorage.getItem(TQ_KEY(tqExam)), 10); if (gs.includes(v)) g = v; } catch (e) {}
  tqGrade = g;
};
tqLoadGrade();
let tqRound = [], tqIdx = 0, tqScore = 0, tqWrongs = [], tqBusy = false, tqTitle = '', tqSet = 'all';
/* 모의고사용. tqPicks 는 문항마다 무엇을 골랐는지 — 성적표의 정오표가 이걸
   읽는다. 못 푼 문항은 null 로 남아서 「안 냄」과 「틀림」을 가릴 수 있다. */
let tqMock = false, tqPicks = [], tqLeft = 0, tqSpent = 0, tqSaved = false;
/* 지금 푸는 모의고사가 몇 회차인가. 기록·이어하기·성적표가 이것으로 갈린다. */
let tqMockRound = 1;
/* 로그인 없는 사람에게 **첫 판은 끝까지** 열어 준다. 성적표까지 봐야
   이게 무엇인지 알고, 그걸 본 사람만 로그인할 까닭이 생긴다. 중간에서
   끊으면 무엇을 얻는지 모른 채 로그인을 요구받는 셈이라 그냥 나간다.
   두 번째 판부터는 모의고사 10문항, 유형별 연습 3문항까지. */
const TQ_FREE_MOCK = 10;
const TQ_FREE_DRILL = 3;
const TQ_FREE_KEY = 'cp-topik-free-used';
let tqSignedIn = false;
const tqFreeUsed = () => { try { return localStorage.getItem(TQ_FREE_KEY) === '1'; } catch (e) { return false; } };
const tqFreeMark = () => { try { localStorage.setItem(TQ_FREE_KEY, '1'); } catch (e) {} };
const tqFreeLimit = () => (tqMock ? TQ_FREE_MOCK : TQ_FREE_DRILL);
/* 벽을 칠 때인가. 첫 판을 아직 안 썼으면 몇 문항을 풀었든 막지 않는다. */
const tqWalled = () => !tqSignedIn && tqFreeUsed() && tqIdx >= tqFreeLimit();

/* 보기 번호. 자료에는 0부터 세는 자리로 들어 있고 화면에는 이 글자로 나간다.
   성적표와 해설이 쓰는 글자와 같아야 한다. */
const TQ_CIRCLE = ['①', '②', '③', '④'];
const tqOf = (grade) => tqE().reading.filter((q) => q.grade === grade);
const tqPanel = (name) => ['tqPick', 'tqPlay', 'tqOver'].forEach((k) => $(k).classList.toggle('hidden', k !== name));
const tqBestKey = (g) => `cp-topik-best-${g}`;

/* 세트별 최고 기록. 「점수/그때의 문제 수」를 한 칸에 넣는다.
   문제 수를 같이 적어 두는 이유 — 문제는 앞으로도 늘어난다. 점수만 두면
   여덟 문제짜리에서 받은 8점이 나중에 8 / 12 로 보여서 기록이 거짓이 된다. */
const tqSetKey = (g, set) => `cp-topik-set-${g}-${set}`;
/* notice 는 nomatch 로 바뀌었다. 점수를 옮겨 오지는 않는다 — 같은 안내문이지만
   묻는 것이 「같은 것」에서 「맞지 않는 것」으로 뒤집혀서, 예전 점수가 지금
   세트의 점수가 아니다. 다만 열쇠는 지워 둔다. 안 지우면 아무도 읽지 않는
   줄이 브라우저에 영영 남는다. */
[1, 2].forEach((g) => { try { localStorage.removeItem(`cp-topik-set-${g}-notice`); } catch (e) {} });
function tqSetRead(g, set) {
  try {
    const m = /^(\d+)\/(\d+)$/.exec(localStorage.getItem(tqSetKey(g, set)) || '');
    return m ? { s: +m[1], n: +m[2] } : null;
  } catch (e) { return null; }
}
function tqSetWrite(g, set, s, n) {
  const had = tqSetRead(g, set);
  // 비율로 견준다. 문제가 늘어난 뒤의 12 / 20 은 예전 8 / 10 보다 나은 기록이 아니다.
  if (had && had.s / had.n >= s / n) return;
  try { localStorage.setItem(tqSetKey(g, set), `${s}/${n}`); } catch (e) {}
}

/* 고르기 화면 — 급수, 통계, 유형별 카드. */
function drawTopik() {
  const rows = tqOf(tqGrade);
  const byType = {};
  rows.forEach((q) => { (byType[q.type] = byType[q.type] || []).push(q); });

  /* 시험 고르는 줄은 tqSkillBar 로 올라갔다 — 듣기·읽기·쓰기 셋이 같은
     시험을 봐야 하므로 갈래마다 따로 그리면 셋이 어긋난다. 여기는
     급수만 그린다. */
  const ex = tqE();
  $('tqLevel').innerHTML =
    '<div class="pt-lv-row">' +
      `<div class="diff-seg tq-lv" role="radiogroup" aria-label="${t('급수', 'Level')}">` +
        tqGrades().map((g) =>
          `<label><input type="radio" name="tqGrade" value="${g}"${g === tqGrade ? ' checked' : ''}><span>${esc(ex.chipTx(g))}</span></label>`
        ).join('') +
      '</div>' +
      `<div class="pt-lv-desc">${esc(ex.lead(tqGrade))}</div>` +
    '</div>';
  $('tqIntro').textContent = t(
    '지문을 읽고 보기 넷 중에서 고릅니다. 틀리면 왜 그런지 바로 알려 줘요.',
    'Read the passage and pick one of four. A wrong answer tells you why right away.');
  $('tqSummary').innerHTML = renderLearnSummary([
    { k: t('문제', 'Questions'), v: rows.length, s: t('이 급수에서 풀 수 있는 수', 'Available at this level') },
    { k: t('유형', 'Types'), v: Object.keys(byType).length, s: t('골라서 연습할 수 있어요', 'Practise one type at a time') },
    { k: t('최고', 'Best'), v: `${gameBestRead(tqBestKey(tqGrade))} / ${rows.length}`, s: t('한 번에 다 풀었을 때', 'Full run, all questions') },
  ]);

  const card = (key, emoji, title, tag, blurb, n, lv) =>
    `<button class="lc-card lq-card" data-tq="${esc(key)}">` +
      '<div class="lc-top">' +
        `<div class="lc-mark">${emoji}</div>` +
        '<div style="min-width:0">' +
          `<div class="lc-lv">${esc(lv || ex.gradeTx(tqGrade))}</div>` +
          `<div class="lc-title">${esc(title)}</div>` +
          `<div class="lc-tag">${esc(tag)}</div>` +
        '</div>' +
      '</div>' +
      `<p class="lc-blurb">${esc(blurb)}</p>` +
      `<div class="lq-meta"><span class="lq-chip">${esc(t(`${n}문제`, `${n} questions`))}</span></div>` +
    '</button>';

  tqDrawRecord(byType);
  tqDrawLog();

  if (!rows.length) {
    $('tqList').innerHTML = `<div class="learn-empty">${esc(t('이 급수 문제는 아직 채우는 중이에요.', 'Questions for this level are still being written.'))}</div>`;
  } else {
    /* 모의고사는 마흔 자리가 다 찼을 때만 낸다. 한 자리라도 비면 40문항이
       안 되고, 「모의고사」라고 써 놓고 서른아홉 문항을 내면 거짓말이 된다. */
    const filled = new Set(ex.reading.map((q) => q.slot));
    const mockReady = ex.slots.every((s) => filled.has(s.n));
    const span = t(`읽기 ${ex.from}~${ex.to}번`, `Reading ${ex.from}–${ex.to}`);
    const mins = ex.mockSec / 60;

    /* 풀다 만 회차가 있으면 맨 위에 세운다. 아래에 두면 「모의고사 한 회」를
       먼저 눌러 새로 시작하게 되고, 그 순간 붙들어 둔 자리가 사라진다. */
    const hold = tqHoldRead();
    const holdCard = !hold ? '' : (() => {
      const hx = TQ_EXAMS[hold.exam];
      const done = hold.picks.filter((v) => Number.isInteger(v)).length;
      const mm = Math.floor(hold.left / 60);
      return '<div class="tq-hold">' +
        '<button class="lc-card lq-card" data-tq="resume">' +
          '<div class="lc-top">' +
            '<div class="lc-mark">⏳</div>' +
            '<div style="min-width:0">' +
              `<div class="lc-lv">${esc(t(hx.name.ko, hx.name.en))} · ${esc(hx.gradeTx(hold.grade))}</div>` +
              `<div class="lc-title">${esc(t('이어서 풀기', 'Pick up where you left off'))}</div>` +
              `<div class="lc-tag">${esc(t(`${hold.ids.length}문항 중 ${done}개 풀었고 ${mm}분 남았어요`,
                                           `${done} of ${hold.ids.length} answered · ${mm} min left`))}</div>` +
            '</div>' +
          '</div>' +
          `<p class="lc-blurb">${esc(t('나가기 전에 고른 답과 남은 시간이 그대로 있어요. 시계는 이어서 갑니다.',
                                        'Your answers and the clock are exactly where you left them.'))}</p>` +
        '</button>' +
        '<button class="tq-hold-drop" type="button" data-tq-drop="1">' +
          `${esc(t('지우고 새로 시작할래요', 'Discard it and start fresh'))}</button>` +
      '</div>';
    })();

    $('tqList').innerHTML = holdCard +
      /* 모의고사만은 급수를 안 가린다. 실제 TOPIK I 은 1급·2급이 한 장에
         같이 나오는 시험이라 급수로 나누면 시험이 아니게 된다. 다만 1급을
         골라 둔 학습자에게 말없이 2급 지문을 내밀면 속이는 것이므로,
         급수 딱지와 소개글에 섞여 나온다고 적어 둔다. */
      tqRoundCards(ex, span, mins, mockReady) +
      card('all', '📖', t('전체 풀기', 'Full run'), t('유형을 섞어서 처음부터 끝까지', 'Every type, mixed'),
           t('이 급수 문제를 다 풀어 봅니다. 문제마다 바로 해설이 붙어요.', 'Every question at this level, with the answer explained as you go.'), rows.length) +
      tqTypeOrder().filter((k) => byType[k]).map((k) =>
        card(k, '🔎', t(tqTypeTx()[k].ko, tqTypeTx()[k].en),
             t(`읽기 ${tqSlotLabel(byType[k])}`, `Reading ${tqSlotLabel(byType[k])}`),
             t('한 유형만 모아 풀면 약한 곳이 빨리 드러납니다.', 'Drilling one type shows you what is weak.'),
             byType[k].length)
      ).join('');
  }
  /* 사칭으로 보이지 않게 화면에 적어 둔다. 자료 파일에만 적어 두면
     그 파일을 읽는 사람만 알고 학습자는 모른다.
     그리고 어느 자리까지 준비됐는지도 같이 적는다 — 40자리 중 스무 자리만
     차 있는데 「TOPIK 연습」이라고만 써 두면 학습자가 다 있는 줄 안다. */
  /* **고른 급수 안에서** 센다. 전체 문제로 세면 1급 화면에서도 「31~70번을 모두
     연습할 수 있습니다」가 뜨는데, 1급이 실제로 가진 자리는 31~45·57~58번뿐이라
     없는 연습을 있다고 말하게 된다. */
  const filled = new Set(rows.map((q) => q.slot));
  const done = ex.slots.filter((s) => filled.has(s.n)).map((s) => s.n);
  const todo = ex.slots.filter((s) => !filled.has(s.n)).map((s) => s.n);
  $('tqNote').textContent =
    t('TOPIK 유형을 따라 만든 자체 제작 연습문제입니다. 기출문제가 아니며 국립국제교육원과 관계가 없습니다.',
      'These are original practice questions written in the TOPIK format. They are not past exam papers and are not affiliated with NIIED.') +
    (!done.length
      ? ''
      : todo.length
        ? ' ' + t(`${ex.gradeTx(tqGrade)}으로는 읽기 ${tqRange(done)} 자리를 연습할 수 있고, ${tqRange(todo)} 자리는 준비 중입니다.`,
                  `At ${ex.gradeTx(tqGrade)} this covers reading ${tqRange(done)}; ${tqRange(todo)} still being written.`)
        : ' ' + t(`읽기 ${ex.from}~${ex.to}번 자리를 모두 연습할 수 있습니다.`, `Covers all of reading ${ex.from}–${ex.to}.`));
  tqPanel('tqPick');
}

/* 한 줄. 아직 안 푼 세트도 빈 막대와 「— / N」으로 그린다.
   줄마다 칸이 어긋나면 표가 아니라 목록이 되어 견주기가 안 된다. */
function tqBar(label, ok, n, cls) {
  const has = ok !== null;
  const pct = has ? Math.round((ok / n) * 100) : 0;
  const tone = !has ? '' : pct < 60 ? 'low' : pct >= 80 ? 'high' : '';
  return `<div class="tq-bd-row${cls || ''}">` +
      `<span class="tq-bd-name">${esc(label)}</span>` +
      `<span class="tq-bd-bar">${has ? `<i class="${tone}" style="width:${pct}%"></i>` : ''}</span>` +
      `<span class="tq-bd-num${has ? '' : ' none'}"><b>${has ? ok : '—'}</b> / ${n}</span>` +
    '</div>';
}

/* 약한 유형을 짚어 주는 한 줄. 기록판과 결과 화면이 같이 쓴다.
   이름 뒤에 조사를 붙이지 않는다 — 「순서 배열이」와 「빈칸 채우기가」는
   받침에 따라 갈리는데 유형 이름은 앞으로도 늘어난다.
   그리고 **둘까지만 적는다.** 다섯 개를 다 적으면 「전부 약하다」가 되어
   어디부터 손대야 할지 알려 주지 못한다. */
function tqWeakTip(weak, total, name) {
  if (!weak.length) return `<p class="tq-bd-tip">${esc(t('유형별로 고르게 나왔어요.', 'Even across every type.'))}</p>`;
  /* 무슨 유형인지는 단추가 이미 말한다. 설명을 한 줄 더 붙이면 말이 겹친다. */
  const go = `<button class="tq-bd-go" type="button" data-tq-go="${esc(weak[0])}">` +
    `${esc(t(`${name(weak[0])} 풀어 보기 →`, `Practise ${name(weak[0])} →`))}</button>`;
  if (weak.length >= total) {
    return `<p class="tq-bd-tip">${esc(t('아직 전체적으로 낮아요. 낮은 곳부터 하나씩.',
      'Still low across the board — start with the lowest.'))}</p>` + go;
  }
  const shown = weak.slice(0, 2).map(name).join(' · ');
  const more = weak.length > 2 ? t(` 외 ${weak.length - 2}개`, ` and ${weak.length - 2} more`) : '';
  return `<p class="tq-bd-tip">${t('아직 약한 곳', 'Weakest')} &nbsp;<b>${esc(shown)}</b>${esc(more)}</p>` + go;
}

/* ── 회차 카드 ────────────────────────────────────────────────
   「모의고사 한 회」 한 장이던 것을 회차마다 한 장으로 편다. 한 장뿐이면
   눌러 보기 전에는 몇 회를 풀 수 있는지, 다시 누르면 같은 문제가 나오는지
   알 수가 없다. 회차를 펴 두면 「아직 두 회 남았다」가 눌러 보기 전에 보인다.

   **1회차만 열어 둔다.** 나머지는 로그인해야 열린다 — 무엇을 얻는지 한 회
   풀어 보고 나서 정하게 하려는 것이다. 문을 먼저 잠그면 무엇이 있는지 모른
   채 로그인을 요구받는 셈이라 그냥 나간다. */
const TQ_FREE_ROUNDS = 1;

function tqRoundCards(ex, span, mins, mockReady) {
  if (!mockReady) return '';
  const total = tqRoundCount();
  if (total < 1) return '';

  const log = tqLogAll();
  const rows = [];
  for (let r = 1; r <= total; r++) {
    const list = tqBuildMock(r);
    if (!list) continue;
    /* 회차마다 지문 갈래가 어떻게 섞였는지 세어 둔다. 「50문항 70분」만
       적힌 카드는 어느 회차나 똑같아 보여서 고를 거리가 없다. */
    const genres = [...new Set(list.map((q) => q.genre).filter(Boolean))];
    const mine = log.filter((x) => x.exam === tqExam && (x.round || 1) === r);
    const top = mine.length ? Math.max(...mine.map((x) => Math.round((x.score / x.n) * 100))) : null;
    rows.push({ r, n: list.length, genres, top, tries: mine.length,
                locked: r > TQ_FREE_ROUNDS && !tqSignedIn });
  }

  return rows.map((x) => {
    const tag = x.locked
      ? t('로그인하면 열려요', 'Sign in to unlock')
      : t(`${span} · ${mins}분`, `${span} · ${mins} min`);
    /* 갈래 이름을 다 적으면 카드가 글자로 찬다. 넷까지만 보이고 나머지는 수로. */
    const gs = x.genres.slice(0, 4).map((g) => tqGenreTx(g));
    const more = x.genres.length - gs.length;
    const blurb = x.locked
      ? t('한 회는 그냥 풀어 볼 수 있어요. 그다음 회차부터는 로그인하면 열립니다 — 기록이 남아야 회차끼리 견줄 수 있어서예요.',
          'The first round is free. Signing in opens the rest — records need an account before rounds can be compared.')
      : t(`실제 시험 차례대로 ${x.n}문항. 여러 급수가 한 장에 섞여 나오고, 푸는 동안에는 답을 알려 주지 않아요. 끝나면 성적표가 나옵니다.`,
          `All ${x.n} in exam order. Levels are mixed as on the real paper, and no answers until you finish — then a full result sheet.`);

    return `<button class="lc-card lq-card${x.locked ? ' tq-locked' : ''}" data-tq="${x.locked ? 'lock' : `mock:${x.r}`}">` +
      '<div class="lc-top">' +
        `<div class="lc-mark">${x.locked ? '🔒' : '📝'}</div>` +
        '<div style="min-width:0">' +
          `<div class="lc-lv">${esc(t(ex.sub.ko, ex.sub.en))}</div>` +
          `<div class="lc-title">${esc(t(`모의고사 ${x.r}회차`, `Mock exam · Round ${x.r}`))}</div>` +
          `<div class="lc-tag">${esc(tag)}</div>` +
        '</div>' +
      '</div>' +
      `<p class="lc-blurb">${esc(blurb)}</p>` +
      '<div class="lq-meta">' +
        `<span class="lq-chip">${esc(t(`${x.n}문제`, `${x.n} questions`))}</span>` +
        (x.locked ? '' : gs.map((g) => `<span class="lq-chip soft">${esc(g)}</span>`).join('') +
          (more > 0 ? `<span class="lq-chip soft">+${more}</span>` : '')) +
        (x.top === null ? '' : `<span class="lq-chip done">${esc(t(`최고 ${x.top}% · ${x.tries}번 봄`, `Best ${x.top}% · ${x.tries} run${x.tries > 1 ? 's' : ''}`))}</span>`) +
      '</div>' +
    '</button>';
  }).join('');
}

/* 세트별 점수 — 고르기 화면에 붙는 기록판.
   전체 풀기를 맨 위에 두고 유형은 늘 같은 차례로 둔다. 결과 화면의
   유형별 표는 못 맞힌 쪽부터 세우지만 여기는 아니다. 여기는 몇 번씩
   다시 보는 자리라 줄이 매번 움직이면 눈이 자리를 못 외운다. */
function tqDrawRecord(byType) {
  const box = $('tqRecord');
  const sets = ['all', ...tqTypeOrder().filter((k) => byType[k])];
  const name = (k) => (k === 'all'
    ? t('전체 풀기', 'Full run')
    : t(tqTypeTx()[k].ko, tqTypeTx()[k].en));
  const total = (k) => (k === 'all' ? tqOf(tqGrade).length : byType[k].length);

  const rec = sets.map((k) => ({ k, r: tqSetRead(tqGrade, k), now: total(k) }));
  /* 한 판도 안 푼 급수에서는 빈 표를 보여 줄 까닭이 없다. */
  if (!rec.some((x) => x.r)) { box.textContent = ''; box.classList.add('hidden'); return; }

  /* 줄은 늘 같은 차례로 두지만 「약한 곳」은 낮은 쪽부터 세운다 —
     단추가 가리키는 곳이 가장 급한 유형이어야 한다. */
  const weak = rec
    .filter((x) => x.k !== 'all' && x.r && x.r.n >= 3 && x.r.s / x.r.n < TQ_WEAK)
    .sort((a, b) => (a.r.s / a.r.n) - (b.r.s / b.r.n));

  box.innerHTML =
    `<div class="tq-bd-h">${esc(t('세트별 점수', 'Your scores'))}</div>` +
    rec.map((x, i) =>
      (i === 1 ? '<div class="tq-rec-sep"></div>' : '') +
      tqBar(name(x.k), x.r ? x.r.s : null, x.r ? x.r.n : x.now,
            x.k === 'all' ? ' tq-rec-row-all' : '')
    ).join('') +
    /* 아직 안 푼 세트가 있으면 「고르게 나왔어요」라고 할 수 없다.
       그때는 아무 말도 하지 않는다 — 표가 이미 말하고 있다. */
    (weak.length
      ? tqWeakTip(weak.map((x) => x.k), rec.length - 1, name)
      : (rec.every((x) => x.r) ? tqWeakTip([], 0, name) : ''));
  box.classList.remove('hidden');
}

/* ══ 모의고사 ═══════════════════════════════════════════════════
   실제 시험 읽기는 31번부터 70번까지 마흔 문항을 60분에 푼다. 지금까지의
   「전체 풀기」는 유형을 섞어 무작위로 냈는데, 그건 연습이지 시험이 아니다.
   시험은 세 가지가 다르다 —
     차례가 정해져 있다. 쉬운 자리에서 시작해 뒤로 갈수록 글이 길어진다.
     푸는 도중에 답을 알려 주지 않는다. 알려 주면 다음 문제를 푸는 마음이 달라진다.
     시간이 있다. 다 맞혀도 시간을 넘겼으면 시험장에서는 못 맞힌 것이다. */
/* 시험마다 다르다 — TOPIK I 읽기 60분, II 읽기 70분. */
const tqMockSec = () => tqE().mockSec;
const tqMockKey = (g) => `cp-topik-mock-${g}`;

/* 한 회를 뽑는다. 자리마다 하나씩, 청사진 차례대로.
   짝 지문 자리(49~56, 59~70)는 두 문항이 같은 글을 나눠 쓰므로 짝을
   통째로 골라야 한다. 자리마다 따로 뽑으면 49번과 50번이 서로 다른 글에서
   와서, 앞 문제의 지문을 읽고 뒤 문제를 푸는 시험이 되지 않는다. */
/* ── 회차 ─────────────────────────────────────────────────────
   자리(slot)마다 문항이 여러 벌 쌓인다. 그 **n번째 벌만 모으면 한 회차**가
   된다. 자리마다 아무거나 하나씩 집으면 회차라고 부를 수가 없다 — 같은
   「2회차」를 두 번 풀어도 다른 시험이 나오고, 기록을 견줄 수도 없다.

   그래서 id 로 줄을 세워 n번째를 집는다. 언제 풀어도 2회차는 같은 시험이다. */
function tqSlotVersions() {
  const pool = tqE().reading;
  const bySlot = new Map();
  pool.forEach((q) => {
    if (!bySlot.has(q.slot)) bySlot.set(q.slot, []);
    bySlot.get(q.slot).push(q);
  });
  bySlot.forEach((list) => list.sort((a, b) => String(a.id).localeCompare(String(b.id))));

  const sets = new Map();
  pool.filter((q) => q.pair).forEach((q) => {
    const k = `${q.pair}|${(q.passage || '').replace(/\s+/g, '')}`;
    if (!sets.has(k)) sets.set(k, []);
    sets.get(k).push(q);
  });
  const pairSize = new Map();
  tqE().slots.forEach((s) => { if (s.pair) pairSize.set(s.pair, (pairSize.get(s.pair) ?? 0) + 1); });

  const byPair = new Map();
  sets.forEach((list) => {
    const name = list[0].pair;
    if (list.length !== (pairSize.get(name) ?? 2)) return;   // 벌이 안 맞는 것은 쓰지 않는다
    if (!byPair.has(name)) byPair.set(name, []);
    byPair.get(name).push(list.slice().sort((a, b) => a.slot - b.slot));
  });
  byPair.forEach((vers) => vers.sort((a, b) => String(a[0].id).localeCompare(String(b[0].id))));

  return { bySlot, byPair };
}

/* 몇 회차까지 만들 수 있나. **제일 얇은 자리가 정한다** — 한 자리라도 비면
   그 회차는 40문항이 안 되고, 「모의고사」라고 써 놓고 39문항을 내면
   거짓말이 된다. */
function tqRoundCount() {
  const { bySlot, byPair } = tqSlotVersions();
  let min = Infinity;
  const seen = new Set();
  for (const s of tqE().slots) {
    if (s.pair) {
      if (seen.has(s.pair)) continue;
      seen.add(s.pair);
      min = Math.min(min, (byPair.get(s.pair) || []).length);
    } else {
      min = Math.min(min, (bySlot.get(s.n) || []).length);
    }
  }
  return Number.isFinite(min) ? min : 0;
}

/* r회차(1부터) 한 벌. 못 만들면 null. */
function tqBuildMock(r = 1) {
  const { bySlot, byPair } = tqSlotVersions();
  const at = Math.max(0, r - 1);
  const round = [];
  const usedPair = new Set();
  for (const s of tqE().slots) {
    if (s.pair) {
      if (usedPair.has(s.pair)) continue;
      const vers = byPair.get(s.pair);
      if (!vers?.[at]) return null;
      round.push(...vers[at]);
      usedPair.add(s.pair);
    } else {
      const cand = bySlot.get(s.n);
      if (!cand?.[at]) return null;
      round.push(cand[at]);
    }
  }
  return round;
}

let tqTick = null;
function tqStopClock() { if (tqTick) { clearInterval(tqTick); tqTick = null; } }
function tqRunClock() {
  tqStopClock();
  tqTick = setInterval(() => {
    if (!tqMock) return tqStopClock();
    tqLeft--; tqSpent++;
    tqClock();
    /* 시간이 다 되면 남은 문항은 못 푼 것으로 두고 성적표로 간다.
       실제 시험이 그렇다 — 안 낸 답은 틀린 답과 같이 매겨진다. */
    if (tqLeft <= 0) { tqStopClock(); tqFinish(); }
  }, 1000);
}


/* ══ 모의고사 링크 넘기기 ═══════════════════════════════════════
   선생이 풀던 회차를 학생에게 넘긴다. 주소에 **회차만** 싣는다 —
   고른 답과 남은 시간은 안 싣는다.

   답을 실으면 학생이 풀 것이 없어지고, 애초에 그건 선생의 답안지다.
   시계도 마찬가지다 — 남은 25분을 물려받으면 시험이 아니라 벌이 된다.
   학생은 같은 문제를 처음부터 제 시간으로 푼다.

   열자마자 시계를 돌리지도 않는다. 받은 사람이 버스에서 눌러 볼 수도
   있는데 60분짜리가 그 자리에서 시작되면 한 회차를 버리게 된다.
   회차 카드까지만 데려다 놓고 시작은 학생이 누른다. */
function tqShareUrl() {
  if (!tqMock || !tqMockRound) return '';
  return `${location.origin}${location.pathname}#learn/topik/mock/${tqExam}/${tqMockRound}`;
}

async function tqShareCopy() {
  const url = tqShareUrl();
  if (!url) return;
  const btn = $('tqHandoff');
  let done = false;
  try {
    await navigator.clipboard.writeText(url);
    done = true;
  } catch (e) {
    /* 보안 맥락이 아니거나 권한이 없으면 clipboard 가 막힌다. 그때는
       주소를 골라 둔 칸으로 보여 준다 — 「복사 실패」만 띄우면 넘길
       방법이 없어진다. */
    const box = document.createElement('input');
    box.value = url;
    box.setAttribute('readonly', '');
    box.className = 'tq-share-box';
    btn.after(box);
    box.select();
    try { done = document.execCommand('copy'); } catch (e2) {}
    if (done) box.remove();
  }
  btn.textContent = done
    ? t('링크 복사됨 ✓', 'Link copied ✓')
    : t('아래 주소를 복사하세요', 'Copy the address below');
  setTimeout(() => { btn.textContent = t('링크 넘기기', 'Share link'); }, 2600);
}

/* 받은 주소로 들어왔을 때. 회차 카드까지 데려다 놓는다. */
function tqOpenShared(exam, round) {
  if (!TQ_EXAMS[exam]) return;
  const r = parseInt(round, 10);
  if (!(r > 0)) return;
  tqExam = exam;
  try { localStorage.setItem(TQ_EXAM_KEY, exam); } catch (e) {}
  drawTopik();
  /* 그 회차 카드를 찾아 눈에 띄게 하고 그리로 굴린다. 목록이 길어서
     그냥 두면 받은 사람이 어느 것을 눌러야 하는지 모른다. */
  setTimeout(() => {
    /* 카드는 갈래 판(tqWrap) 안에 있다. tqWall 은 로그인 잠금벽이라
       거기서 찾으면 영영 못 만난다. */
    const card = $('tqWrap')?.querySelector(`[data-tq="mock:${r}"]`);
    if (!card) return;
    card.classList.add('tq-shared');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 80);
}

function tqStartMock(r = 1) {
  const round = tqBuildMock(r);
  if (!round) return;
  tqMockRound = r;
  /* 새로 시작하면 붙들어 둔 자리는 버린다. 둘을 같이 들고 있으면
     이어하기 카드가 이미 지나간 회차를 가리킨다. */
  tqHoldClear();
  tqRound = round;
  tqIdx = 0; tqScore = 0; tqWrongs = []; tqBusy = false; tqSet = 'mock';
  tqMock = true; tqPicks = []; tqLeft = tqMockSec(); tqSpent = 0; tqSaved = false;
  tqTitle = t(`${r}회차 · 읽기 ${tqE().from}~${tqE().to}번`, `Round ${r} — reading ${tqE().from}–${tqE().to}`);
  $('tqOmr').classList.remove('hidden');
  $('tqOmr').classList.remove('open');
  /* 글자 크기 단추는 모의고사에서만 나온다. 유형 연습은 몇 분이면 끝나서
     굳이 필요 없고, 늘 보이면 화면만 시끄럽다. */
  window.cpTxtSize?.(true);
  tqClockBuild();
  tqClock();                       // 1초 뒤가 아니라 지금부터 보여야 한다
  tqOmrDraw();
  tqRunClock();
  $('tqWall').classList.add('hidden');
  $('tqExamBody').classList.remove('hidden');
  /* 이름을 tqHandoff 로 둔다. tqShare 는 성적표 화면이 이미 쓰고 있어
     같은 id 를 두면 $() 가 둘 중 하나를 집어 엉뚱한 단추가 움직인다. */
  if ($('tqHandoff')) {
    $('tqHandoff').textContent = t('링크 넘기기', 'Share link');
    $('tqHandoff').classList.remove('hidden');
  }
  tqPanel('tqPlay');
  tqDraw();
}

/* 시험장 벽시계. 한 바퀴가 60분 — 시험 시간과 같다.
   숫자만 있으면 「3200초」가 얼마인지 세어 봐야 알지만, 남은 호가 보이면
   「아직 반 남았다」가 읽기 전에 온다. 초바늘은 시간이 실제로 가고 있다는
   것을 눈에 계속 알려 주는 몫이다.
   판은 한 번만 그리고 초마다 호 길이와 바늘 각도만 바꾼다 — 매초 다시
   그리면 브라우저가 애먼 일을 하고 애니메이션도 끊긴다. */
const TQ_R = 40;
const TQ_C = 2 * Math.PI * TQ_R;
function tqClockBuild() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30) * Math.PI / 180;
    const x1 = 50 + Math.sin(a) * 45, y1 = 50 - Math.cos(a) * 45;
    const x2 = 50 + Math.sin(a) * 40, y2 = 50 - Math.cos(a) * 40;
    return `<line class="tick" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }).join('');
  $('tqClockWrap').innerHTML =
    `<svg class="tq-clock" viewBox="0 0 100 100" role="img" aria-hidden="true">` +
      '<circle class="face" cx="50" cy="50" r="46"/>' + ticks +
      `<circle class="arc" id="tqArc" cx="50" cy="50" r="${TQ_R}" stroke-dasharray="${TQ_C} ${TQ_C}"/>` +
      '<line class="sec" id="tqSec" x1="50" y1="50" x2="50" y2="16"/>' +
      '<circle class="pin" cx="50" cy="50" r="2.6"/>' +
    '</svg>' +
    '<span class="tq-digits" id="tqDigits">60:00</span>';
}
function tqClock() {
  const left = Math.max(0, tqLeft);
  const m = Math.floor(left / 60), s = left % 60;
  const dg = $('tqDigits');
  if (dg) dg.textContent = `${m}:${String(s).padStart(2, '0')}`;
  const arc = $('tqArc');
  if (arc) arc.setAttribute('stroke-dasharray', `${(TQ_C * left / tqMockSec()).toFixed(2)} ${TQ_C}`);
  const sec = $('tqSec');
  if (sec) sec.setAttribute('transform', `rotate(${((tqMockSec() - left) % 60) * 6} 50 50)`);
  $('tqOmr').classList.toggle('low', left <= 300);   // 5분 남으면 붉게
}

/* 답안지. 칸을 누르면 그 문항으로 간다 — 어려운 것을 건너뛰고 나중에
   돌아오는 것까지가 시험 기술이라, 그 연습이 안 되면 시험장에서 처음 해 본다. */
function tqOmrDraw() {
  if (!tqMock) return;
  const done = tqPicks.filter((v) => v != null).length;
  $('tqOmrSum').textContent = t(`${done} / ${tqRound.length} 풀었어요`, `${done} of ${tqRound.length} answered`);
  $('tqOmrGrid').innerHTML = tqRound.map((q, i) =>
    `<button class="tq-omr-cell${tqPicks[i] != null ? ' done' : ''}${i === tqIdx ? ' now' : ''}" ` +
    `type="button" data-go="${i}" aria-label="${esc(t(`${q.slot}번`, `question ${q.slot}`))}">${q.slot}</button>`
  ).join('');
  $('tqSubmit').textContent = done < tqRound.length
    ? t(`제출하기 (${tqRound.length - done}문항 안 풀었어요)`, `Submit (${tqRound.length - done} blank)`)
    : t('제출하기', 'Submit');
}
/* 맛보기를 다 썼을 때. 판은 그대로 두고 문제 자리만 벽으로 바꾼다 —
   로그인하고 돌아오면 이 문항부터 이어서 푼다. */
function tqWall() {
  const lim = tqFreeLimit();
  $('tqExamBody').classList.add('hidden');
  $('tqWall').classList.remove('hidden');
  $('tqWallTitle').textContent = t('여기부터는 로그인이 필요해요', 'Sign in to keep going');
  $('tqWallSub').textContent = tqMock
    ? t('첫 판은 끝까지 보셨어요. 로그인하면 40문항을 다 풀고 성적표를 받을 수 있고, 회차마다 기록이 남아서 늘고 있는지도 보입니다.',
        'Your first run was on us. Sign in to finish all 40, get the full result sheet, and keep every run so you can see yourself improve.')
    : t('첫 판은 끝까지 보셨어요. 로그인하면 이 유형을 끝까지 풀 수 있고, 어느 유형이 약한지도 기록으로 남습니다.',
        'Your first run was on us. Sign in to finish this type and keep track of your weak spots.');
  $('tqGoLogin').textContent = t('로그인하러 가기', 'Go to sign in');
  $('tqWallBack').textContent = t('← 다른 것 고르기', '← Pick something else');
  /* 벽에 막힌 동안에는 시계를 멈춘다. 로그인하는 사이에 시험 시간이
     흘러가면 돌아왔을 때 이미 끝나 있다. */
  tqStopClock();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function tqGoto(i) {
  if (i < 0 || i >= tqRound.length) return;
  tqIdx = i;
  tqDraw();
}

function tqSubmitAsk() {
  const blank = tqRound.length - tqPicks.filter((v) => v != null).length;
  /* 안 푼 문항이 있으면 한 번 묻는다. 낸 답안지는 되돌릴 수 없다. */
  if (blank && !confirm(t(`아직 ${blank}문항을 안 풀었어요. 그대로 제출할까요?`,
                          `${blank} questions are still blank. Submit anyway?`))) return;
  tqFinish();
}

function tqStart(key, round = 1) {
  if (key === 'mock') return tqStartMock(round);
  tqMock = false; tqStopClock();
  $('tqOmr').classList.add('hidden');
  window.cpTxtSize?.(false);
  const rows = tqOf(tqGrade);
  const picked = key === 'all' ? rows : rows.filter((q) => q.type === key);
  if (!picked.length) return;
  // 문제 순서를 섞는다. 늘 같은 차례로 나오면 두 번째 판부터 답을 외운다.
  tqRound = gameShuffle(picked.slice());
  tqIdx = 0; tqScore = 0; tqWrongs = []; tqBusy = false; tqSet = key; tqPicks = []; tqSaved = false;
  tqTitle = key === 'all'
    ? t(`${tqE().gradeTx(tqGrade)} 전체 풀기`, `${tqE().gradeTx(tqGrade)} — full run`)
    : t(`${tqE().gradeTx(tqGrade)} · ${tqTypeTx()[key].ko}`, `${tqE().gradeTx(tqGrade)} · ${tqTypeTx()[key].en}`);
  $('tqWall').classList.add('hidden');
  $('tqExamBody').classList.remove('hidden');
  tqPanel('tqPlay');
  tqDraw();
}

function tqMeta() {
  $('tqPlayTitle').textContent = tqTitle;
  $('tqQuit').textContent = t('← 그만두기', '← Quit');
  /* 모의고사에서는 지금 몇 번 문항인지가 더 쓸모 있다. 실제 시험지의
     번호와 같아야 「나는 뒤쪽이 약하다」를 스스로 알아챌 수 있다. */
  const q = tqRound[Math.min(tqIdx, tqRound.length - 1)];
  $('tqCount').textContent = tqMock && q
    ? t(`${q.slot}번 · ${tqIdx + 1} / ${tqRound.length}`, `Q${q.slot} · ${tqIdx + 1} / ${tqRound.length}`)
    : `${tqIdx} / ${tqRound.length}`;
  // 푸는 도중의 점수는 모의고사에서 감춘다.
  $('tqScore').classList.toggle('hidden', tqMock);
  $('tqScore').textContent = String(tqScore);
  $('tqFill').style.width = `${(tqIdx / tqRound.length) * 100}%`;
}

/* ── 모르는 낱말 표시 ─────────────────────────────────────────────
   읽다 막히는 낱말을 눌러 두면 다 푼 뒤 결과 화면에 모아 준다.

   **누르는 순간에는 아무것도 알려 주지 않는다.** 뜻을 그 자리에서 띄우면
   시험을 보다 말고 사전을 켜는 셈이 되어 점수가 제 실력이 아니게 된다.
   표시만 남기고, 뜻은 다 풀고 나서 단어장에서 채운다.

   **어절(띄어쓰기 단위)로 자른다.** 형태소로 자르지 않는 이유는, 한국어
   어간을 규칙으로 뽑으려 들면 「만들다 + -느라고」를 「만느라고」로 만드는
   식의 잘못이 잦기 때문이다. 틀린 원형을 단어장에 넣는 것보다 어절
   그대로 넣고 학습자가 고치는 편이 낫다 — 단어장에 이미 고치는 자리가
   있고, 무엇이 틀렸는지는 본인이 제일 잘 안다.

   표시해 둔 것은 localStorage 에도 남긴다. 구글 로그인은 페이지를 통째로
   다시 불러오므로 결과 화면이 사라지는데, 그때 표시가 같이 날아가면
   「로그인하고 담기」라는 말이 거짓말이 된다. */
const TQ_UNK_KEY = 'cp_tq_unknown';
/* 다듬은 낱말 → { word, ex }. 같은 낱말을 여러 문항에서 눌러도 하나로 친다. */
let tqUnknown = new Map();

/* 앞뒤에 붙은 문장부호와 ㉠㉡㉢㉣ 따위를 턴다. 가운데 것은 그대로 둔다 —
   「할 수 있다」의 낱말 안에 든 것이 아니라 어절 경계의 군더더기만 뗀다. */
const tqWordKey = (s) => String(s).replace(/^[^0-9A-Za-z가-힣]+|[^0-9A-Za-z가-힣]+$/g, '');
/* 문단에 붙인 번호. (가)(나)(다)(라) 처럼 괄호 안에 딱 한 자만 든 것이다.
   지문에서 낱말처럼 보이지만 담을 말이 아니다.
   한 자로 좁힌 이유 — 두 자까지 막으면 (서울) 같은 진짜 말도 같이 막힌다. */
/* 「(나)-(다)-(가)-(라)」처럼 이어 붙인 것도 함께 막는다. 순서 배열 문항의
   보기가 통째로 한 어절이라, 안 막으면 「나다가라」라는 없는 말이 낱말로
   잡혀 단어장에 담긴다. */
const TQ_MARKER = /^([(（[［〔<〈【{][0-9A-Za-z가-힣][)）\]］〕>〉】}][-–—→,\s]*)+$/;

/* 손으로 고쳐 넣은 말을 다듬는다. 지문에서 집는 tqWordKey 와 달리 앞의
   붙임표와 자모를 남긴다 — 「-ㄹ 수 있어요」처럼 문법 형태를 그대로
   담고 싶어 하기 때문이다. tqWordKey 를 그대로 쓰면 「수 있어요」가 된다
   (붙임표는 군더더기로 떨어지고, ㄹ 은 가-힣 밖이라 함께 잘린다). */
const tqUnkNorm = (s) => String(s).trim()
  .replace(/^[^0-9A-Za-z가-힣ㄱ-ㆎ-]+|[^0-9A-Za-z가-힣ㄱ-ㆎ]+$/g, '');


const tqUnkLoad = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(TQ_UNK_KEY) || '[]');
    if (!Array.isArray(raw)) return;
    /* localStorage 는 학습자가 직접 고칠 수 있는 자리다. 여기서 나온 값이
       화면과 DB 로 바로 가므로 모양이 맞는 것만 들인다. */
    for (const r of raw) {
      /* key 는 지문에서 누른 꼴이고 word 는 단어장에 담길 꼴이다. 둘이
         달라질 수 있게 되면서(「먹었습니다」를 눌러도 「먹다」로 담는다)
         값만 적어서는 안 되고 열쇠도 함께 적는다. key 가 없는 것은 그
         전에 적힌 기록이라 word 를 열쇠로 쓴다. */
      const w = tqUnkNorm(r?.word ?? '');
      const k = tqUnkNorm(r?.key ?? '') || w;
      if (!k || k.length > 40) continue;
      // 모양이 맞는 것만 들인다(위 주석) — tag 도 우리가 아는 값일 때만 받는다.
      const rTag = String(r?.tag ?? '');
      tqUnknown.set(k, {
        word: w || k,
        ex: String(r?.ex ?? '').slice(0, 300),
        mean: String(r?.mean ?? '').slice(0, 120),
        tag: Object.prototype.hasOwnProperty.call(TAG_COLORS, rTag) ? rTag : '',
      });
    }
  } catch (e) { /* 못 읽으면 빈 채로 시작한다 */ }
};
const tqUnkStore = () => {
  try {
    localStorage.setItem(TQ_UNK_KEY, JSON.stringify(
      [...tqUnknown.entries()].map(([key, v]) => ({ key, ...v }))));
  } catch (e) {}
};
tqUnkLoad();

/* 누른 낱말이 있던 문장. 낱말만 덩그러니 있는 단어장보다 문장이 붙은 쪽이
   훨씬 오래 남아서, 예문 칸에 같이 넣어 둔다. */
function tqSentAt(text, at) {
  const lineFrom = text.lastIndexOf('\n', at - 1) + 1;
  let from = lineFrom;
  for (const m of text.slice(lineFrom, at).matchAll(/[.!?…]\s+/g)) from = lineFrom + m.index + m[0].length;
  const rest = text.slice(at);
  const e = rest.search(/[.!?…](\s|$)|\n/);
  return text.slice(from, e >= 0 ? at + e + 1 : text.length).trim();
}

/* 글을 어절마다 누를 수 있는 조각으로 바꿔 담는다. 띄어쓰기와 줄바꿈은
   글자 그대로 남긴다 — 지문은 white-space:pre-line 이라 줄바꿈이 뜻을
   나르고(안내문·순서 배열), 한 줄로 이어 붙으면 표가 표가 아니게 된다. */
/* mark — 「밑줄 친 부분」을 묻는 유형(paraphrase · feeling)에서 그 부분.
   자료에는 mark 칸으로 있었는데 화면이 이 칸을 안 썼다. 그래서 문제는
   「밑줄 친 부분과 의미가 가장 비슷한 것」이라고 묻는데 지문에는 밑줄이
   없었다 — 무엇을 묻는지 알 수 없는 문항이 되어 있었다. */
function tqWordify(el, text, mark) {
  el.textContent = '';
  const s = String(text ?? '');
  if (!s) return;
  /* 글자 위치로 잡는다. 밑줄 칠 곳이 「늦을지도 모른다」처럼 여러 어절에
     걸치므로 어절 단위로는 못 집는다. */
  const mk = String(mark ?? '');
  const mi = mk ? s.indexOf(mk) : -1;
  const mj = mi + mk.length;
  /* 조각 하나를 밑줄 안팎으로 나눠 담는다. 밑줄은 어절 한가운데서 끝나기도
     한다 — 「늘기 마련이다.」의 마침표는 밑줄 밖이다. 어절째로 그으면
     실제 시험지와 달라진다.
     조각을 쪼개 넣되 담는 그릇(into)은 하나로 두는 것이 중요하다. 어절은
     통째로 눌러야 하므로 클릭을 받는 span 을 나눌 수는 없다. */
  const put = (into, piece, here) => {
    const a = Math.max(0, Math.min(piece.length, mi - here));
    const b = Math.max(0, Math.min(piece.length, mj - here));
    if (a > 0) into.appendChild(document.createTextNode(piece.slice(0, a)));
    const u = document.createElement('span');
    u.className = 'tq-mk';
    u.textContent = piece.slice(a, b);
    into.appendChild(u);
    if (b < piece.length) into.appendChild(document.createTextNode(piece.slice(b)));
  };
  let at = 0;
  for (const piece of s.split(/(\s+)/)) {
    if (!piece) continue;
    const here = at;
    at += piece.length;
    const inMark = mi >= 0 && here < mj && at > mi;
    if (/^\s+$/.test(piece)) {
      /* 밑줄 안쪽의 띄어쓰기도 함께 그어야 밑줄이 끊기지 않는다. */
      if (inMark) put(el, piece, here);
      else el.appendChild(document.createTextNode(piece));
      continue;
    }
    const key = tqWordKey(piece);
    /* 한글이 든 어절만 누를 수 있게 한다. 「1.」이나 「㉠」까지 열어 두면
       보기 번호를 눌러 단어장에 「1」이 들어간다. 한국어를 배우는
       화면이라 담을 만한 것은 한글이 든 말뿐이다.

       괄호로 싼 표시도 뺀다 — 순서 배열 지문의 (가)(나)(다)(라) 가
       그렇다. 낱말처럼 생겼지만 문단에 붙인 번호라, 눌러 담으면
       단어장에 「나」가 들어간다. */
    if (!key || !/[가-힣]/.test(key) || TQ_MARKER.test(piece)) {
      if (inMark) put(el, piece, here);
      else el.appendChild(document.createTextNode(piece));
      continue;
    }
    const span = document.createElement('span');
    span.className = 'tq-w' + (tqUnknown.has(key) ? ' on' : '');
    if (inMark) put(span, piece, here);
    else span.textContent = piece;
    span.title = t('모르는 낱말로 표시', 'Mark as unknown');
    span.addEventListener('click', () => {
      if (tqUnknown.has(key)) tqUnknown.delete(key);
      else {
        /* 누른 꼴이 「먹었습니다」여도 단어장에는 「먹다」로 담는다.
           활용형이 그대로 쌓이면 같은 말이 열 번 들어간다. 지문에서
           켜고 끄는 열쇠는 누른 꼴 그대로 두어야 다시 눌러 끌 수 있다. */
        const g = tqGloss(key);
        tqUnknown.set(key, { word: g.head || key, ex: tqSentAt(s, here), mean: g.meaning, tag: g.tag });
      }
      span.classList.toggle('on', tqUnknown.has(key));
      tqUnkStore();
      /* 같은 낱말이 화면 안 다른 곳에도 있으면 같이 켜고 끈다.
         하나만 칠해지면 「눌렀는데 왜 저기는 그대로지」가 된다. */
      document.querySelectorAll('#tqPlay .tq-w, #tqOver .tq-w').forEach((o) => {
        if (tqWordKey(o.textContent) === key) o.classList.toggle('on', tqUnknown.has(key));
      });
    });
    el.appendChild(span);
  }
}

/* 어절을 고쳐 담는다. 형태소 분석은 안 한다 — tqWordify 위의 주석대로
   규칙으로 어간을 뽑으면 「만들다 + -느라고」가 「만느라고」가 되는 식의
   사고가 난다. 대신 학습자가 직접 글자를 지우고 고치게 둔다. 「아침을」
   에서 「을」을 지워 「아침」만 남기거나, 「마실 수 있어요」를 통째로
   「마시다」로 고치고 옆에 「-ㄹ 수 있어요」를 새 낱말로 따로 추가하는
   식이다 — 옳은 원형을 아는 것은 규칙이 아니라 학습자 쪽이다. */
/* 칸 너비를 글자에 맞춘다. ch 는 숫자 「0」의 너비라서 한글을 그대로
   세면 반쯤 잘린다 — 한글·한자·가나는 두 칸으로 친다. */
const tqUnkWidth = (s) => {
  let n = 0;
  for (const c of String(s)) n += /[ᄀ-ᇿ　-〿぀-ヿ㐀-䶿一-鿿가-힯＀-｠]/.test(c) ? 2 : 1;
  return `${Math.max(3, n + 1)}ch`;
};

/* ── 뜻풀이 ───────────────────────────────────────────────────
   눌러 담은 낱말의 뜻 칸이 늘 비어 있었다. 빈 칸을 스무 개 받아 놓고
   하나씩 채우는 사람은 없다 — 그대로 굳은 단어장이 된다.

   사전을 들고 다니는 까닭은 번역기를 부를 수가 없어서다. 열쇠가 있어야
   하는데 이 사이트는 정적이라 열쇠를 둘 데가 없다(코드에 넣으면 그대로
   공개된다). 대신 **우리 지문에 나오는 낱말**만 미리 적어 둔다. 지문에
   없는 말은 눌릴 일이 없으니 온 세상 낱말을 담을 까닭도 없다.

   못 찾은 낱말은 비워 둔다. 지어내 채우면 학습자가 그 틀린 뜻을 외운다 —
   빈 칸은 채우면 되지만 틀린 뜻은 외우고 나서야 안다. */
const LANG_CODE = { '한국어': 'ko', '영어': 'en', '일본어': 'ja', '중국어': 'zh',
  '스페인어': 'es', '프랑스어': 'fr', '독일어': 'de', '이탈리아어': 'it',
  '러시아어': 'ru', '베트남어': 'vi', '태국어': 'th', '포르투갈어': 'pt',
  '인도네시아어': 'id', '아랍어': 'ar' };

const TQ_MEAN_KEY = 'cp-mean-lang';
/* 기본은 영어다. 로그인 전에도 뜻이 붙어야 하고, 사전이 지금 확실히 가진
   말이 영어뿐이다. */
let tqMeanLang = 'en';
try { const v = localStorage.getItem(TQ_MEAN_KEY); if (v) tqMeanLang = v; } catch (e) {}

/* 단어장 설정의 모국어를 따라간다. 설정을 열지 않아도 알아야 해서 여기서
   따로 한 번 읽고, 다음부터는 기기에 적어 둔 것을 쓴다. */
async function tqLoadMeanLang() {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;
    const { data } = await sb.from('settings').select('native_lang')
      .eq('user_id', session.user.id).limit(1).maybeSingle();
    tqMeanLang = LANG_CODE[data?.native_lang] || 'en';
    localStorage.setItem(TQ_MEAN_KEY, tqMeanLang);
  } catch (e) { /* 못 읽으면 영어로 간다 */ }
  tqLoadPack();
}
tqLoadMeanLang();
/* 기기에 적어 둔 말이 있으면 로그인을 기다리지 않고 먼저 받는다. */
tqLoadPack();

/* 고른 말의 뜻풀이 묶음. 필요할 때 한 번만 받아 온다.

   열 나라 말을 glossary.js 에 다 담으면 4.5MB 가 되고 그것을 모든 방문자가
   내려받는다 — 아랍어 뜻풀이를 영어 쓰는 사람에게까지 물리는 셈이다.
   그래서 영어만 늘 담고, 나머지는 그 말을 고른 사람만 받는다. */
let tqPack = null;          // { [낱말]: '뜻' }
let tqPackFor = '';

async function tqLoadPack() {
  const L = tqMeanLang;
  if (L === 'en' || L === 'ko' || !GLOSS_LANGS[L] || tqPackFor === L) return;
  try {
    const mod = await import(GLOSS_LANGS[L]);
    /* 받는 사이에 학습자가 말을 바꿨을 수 있다. 그때 덮어쓰면 고른 말과
       다른 말이 뜬다. */
    if (tqMeanLang !== L) return;
    tqPack = mod.G;
    tqPackFor = L;
    /* 낱말 목록이 이미 그려져 있으면 다시 그린다 — 안 그러면 받아 놓고도
       빈 칸이 그대로 남는다. */
    if (!$('tqUnk').classList.contains('hidden')) tqUnkDraw();
  } catch (e) { /* 못 받으면 영어로 간다 */ }
}

/* 낱말 하나의 뜻과 표제어. 고른 말에 없으면 영어로 물러선다 — 뜻이 아예
   없는 것보다 읽을 수 있는 말로라도 있는 편이 낫다.
   누른 꼴이 사전에 그대로 없으면 gloss-find 가 토씨와 어미를 떼어 준다 —
   사전은 「먹다」인데 지문은 늘 「먹었습니다」다. */
function tqGloss(word) {
  const key = tqUnkNorm(word);
  const inDict = (k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k) ||
    !!(tqPack && tqPackFor === tqMeanLang && Object.prototype.hasOwnProperty.call(tqPack, k));
  const found = glossFind(inDict, key);
  if (!found) return { meaning: '', head: '' };
  const hit = GLOSSARY[found];
  /* 언어팩이 먼저다. 우리가 쓴 뜻풀이에는 영어뿐이라, 일본어를 고른 사람에게
     내줄 것이 거기에는 없다. */
  const packed = tqPack && tqPackFor === tqMeanLang ? tqPack[hit?.head || found] : '';
  return {
    meaning: packed || (hit && (hit[tqMeanLang] || hit.en)) || '',
    head: (hit && hit.head) || found,
    // 국립국어원 품사를 단어장 태그로 옮겨 둔 것(build-glossary.mjs 의
    // POS_TAG). 사전에 없거나 태그로 못 옮기는 품사(관형사·수사 등)면
    // 빈 문자열 — 억지로 채우지 않는다.
    tag: (hit && hit.pos) || '',
  };
}

/* 낱말 칸 하나를 그린다. 눌러서 지우는 자리였던 것을, 클릭하면 바로
   고칠 수 있는 입력칸으로 바꾼다. 지우는 단추(×)는 텍스트와 겹치지
   않게 따로 둔다 — 안 그러면 고치려고 누른 게 지우기가 된다. */
function tqUnkRow(it, wrap) {
  const row = document.createElement('span');
  row.className = 'tq-unk-w';

  const input = document.createElement('input');
  input.className = 'tq-unk-in';
  input.value = it.word;
  input.setAttribute('aria-label', t('낱말 고치기', 'Edit word'));
  input.autocomplete = 'off';
  input.style.width = tqUnkWidth(it.word);
  input.addEventListener('input', () => { input.style.width = tqUnkWidth(input.value); });

  const commit = () => {
    const next = tqUnkNorm(input.value);
    /* 고치기 전 낱말은 무조건 뺀다. 새로 추가하는 칸이면 it.key 가 map 에
       없으므로 그냥 지나간다. */
    tqUnknown.delete(it.key);
    if (!next) { tqUnkStore(); tqUnkDraw(); return; }
    /* 낱말을 고치면 뜻도 다시 찾는다. 다만 **손으로 적은 뜻은 건드리지
       않는다** — 「아침을」을 「아침」으로 다듬었다고 학습자가 적어 둔 뜻이
       사라지면, 다듬는 일 자체를 안 하게 된다.
       사전이 준 그대로였을 때만(=손대지 않았을 때만) 갈아 끼운다. */
    const auto = tqGloss(it.key).meaning;
    const typed = mean.value.trim();
    const keep = typed && typed !== auto;
    const g = tqGloss(next);
    if (next === it.key) {
      tqUnknown.set(it.key, { ...it, mean: keep ? typed : g.meaning, tag: g.tag });
      tqUnkStore();
      tqUnkDraw();
      return;
    }
    /* 이미 있는 낱말로 고치면 하나로 합쳐진다 — 먼저 담긴 예문을 남긴다.
       나중 것으로 덮으면 「아침을」과 「아침」을 각각 다른 문장에서 눌러
       놓고 하나로 합쳤을 때 먼저 고른 문장이 조용히 사라진다. */
    const had = tqUnknown.get(next);
    tqUnknown.set(next, {
      word: g.head || next,
      ex: had ? had.ex : it.ex,
      mean: keep ? typed : (had?.mean || g.meaning),
      tag: had?.tag || g.tag,
    });
    tqUnkStore();
    tqUnkDraw();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = it.word; input.style.width = tqUnkWidth(it.word); input.blur(); }
  });
  row.appendChild(input);

  /* 뜻 칸. 사전에 있으면 채워서 내놓고, 없으면 비워 둔다. 담기 전에
     여기서 고칠 수 있어야 한다 — 사전이 늘 맞을 수는 없고, 지문에서
     쓰인 뜻이 사전의 첫 뜻이 아닐 때도 많다. */
  const mean = document.createElement('input');
  mean.className = 'tq-unk-mean';
  mean.value = it.mean || '';
  mean.placeholder = t('뜻', 'meaning');
  mean.setAttribute('aria-label', t('뜻 고치기', 'Edit meaning'));
  mean.autocomplete = 'off';
  mean.addEventListener('blur', () => {
    const cur = tqUnknown.get(it.key);
    if (!cur) return;
    cur.mean = mean.value.trim().slice(0, 120);
    tqUnkStore();
  });
  mean.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); mean.blur(); } });
  row.appendChild(mean);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'tq-unk-del';
  del.title = t('빼기', 'Remove');
  del.textContent = '×';
  del.addEventListener('click', () => {
    tqUnknown.delete(it.key);
    tqUnkStore();
    tqUnkDraw();
    /* 지문 쪽 표시도 같이 꺼 준다. 안 그러면 뺐는데 아직 칠해져 있다. */
    document.querySelectorAll('#tqPlay .tq-w, #tqOver .tq-w').forEach((o) => {
      if (tqWordKey(o.textContent) === it.key) o.classList.remove('on');
    });
  });
  row.appendChild(del);
  wrap.appendChild(row);
  return input;
}

/* 결과 화면에 모아 보여 준다. */
function tqUnkDraw() {
  const box = $('tqUnk');
  const list = [...tqUnknown.entries()].map(([key, v]) => ({ key, word: v.word, ex: v.ex, mean: v.mean }));
  box.classList.toggle('hidden', list.length === 0);
  if (!list.length) return;

  box.textContent = '';
  const h = document.createElement('div');
  h.className = 'tq-bd-h';
  h.textContent = t(`몰랐던 낱말 ${list.length}개`, `${list.length} words you marked`);
  box.appendChild(h);

  /* 몇 개에 뜻이 붙었는지 적어 둔다. 사전이 우리 지문에 나오는 낱말만
     담고 있어 늘 다 채워지지는 않는데, 아무 말이 없으면 「왜 어떤 건
     비어 있지」가 된다. 빈 것은 직접 적으면 된다는 것도 여기서 알린다. */
  const filled = list.filter((x) => x.mean).length;
  if (filled < list.length) {
    const s = document.createElement('p');
    s.className = 'tq-bd-tip';
    s.textContent = filled
      ? t(`${list.length}개 가운데 ${filled}개에 뜻을 채웠어요. 나머지는 직접 적어 주세요.`,
          `${filled} of ${list.length} came with a meaning — fill in the rest yourself.`)
      : t('아직 뜻이 없는 낱말이에요. 담기 전에 직접 적을 수 있어요.',
          'No meanings found for these. You can type them in before adding.');
    box.appendChild(s);
  }

  const wrap = document.createElement('div');
  wrap.className = 'tq-unk-words';
  for (const it of list) tqUnkRow(it, wrap);

  /* 「-ㄹ 수 있어요」처럼 원래 지문에 없던 조각을 따로 담고 싶을 때 쓴다.
     빈 칸을 하나 열어 두고, 아무것도 안 쓰고 나가면 조용히 사라진다. */
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'tq-unk-add';
  add.textContent = '+ ' + t('낱말 추가', 'Add word');
  add.addEventListener('click', () => {
    const input = tqUnkRow({ key: '⁣new' + Date.now(), word: '', ex: '', mean: '' }, wrap);
    add.before(input.closest('.tq-unk-w'));
    input.focus();
  });
  wrap.appendChild(add);
  box.appendChild(wrap);

  const btns = document.createElement('div');
  btns.className = 'tq-unk-btns';
  const save = document.createElement('button');
  save.className = 'pt-next';
  save.id = 'tqUnkSave';
  save.type = 'button';
  save.textContent = tqSignedIn
    ? t('단어장에 담기', 'Add to my wordbook')
    : t('로그인하고 담기', 'Sign in and add');
  save.addEventListener('click', tqUnkSaveFromOver);
  const clear = document.createElement('button');
  /* 담기와 같은 무게로 두면 안 된다 — 지우기는 되돌릴 수 없는 쪽이라
     실수로 누르기 쉬운 자리에 검은 단추로 세울 일이 아니다. */
  clear.className = 'pt-ghost';
  clear.type = 'button';
  clear.textContent = t('표시 지우기', 'Clear marks');
  clear.addEventListener('click', () => {
    tqUnknown.clear();
    tqUnkStore();
    tqUnkDraw();
    document.querySelectorAll('.tq-w.on').forEach((o) => o.classList.remove('on'));
  });
  btns.append(save, clear);
  box.appendChild(btns);

  const note = document.createElement('p');
  note.className = 'tq-note';
  note.textContent = tqSignedIn
    ? t('낱말을 눌러 고칠 수 있어요 — 「아침을」에서 「을」을 지우거나, 붙어 나온 말을 나눠 새 낱말로 추가해 보세요.',
        'Tap a word to edit it — trim a particle, or split an inflected phrase into a new word.')
    : t('로그인하면 담을 수 있어요. 표시해 둔 낱말은 로그인하고 돌아와도 그대로 있습니다.',
        'Sign in to save these. Your marks stay put while you sign in.');
  box.appendChild(note);
}

/* 단어장 맨 위 줄. 구글 로그인은 페이지를 통째로 다시 불러오므로 결과
   화면이 사라진다 — 「로그인하고 담기」를 누르고 돌아온 사람이 표시해 둔
   낱말을 다시 만나는 자리가 여기다. 로그인한 사람에게만 보인다. */
function wbPendingDraw() {
  const box = $('wbPending');
  if (!box) return;
  const list = [...tqUnknown.values()];
  box.classList.toggle('hidden', !(tqSignedIn && list.length));
  if (!tqSignedIn || !list.length) return;

  box.textContent = '';
  const ttl = document.createElement('div');
  ttl.className = 'wb-pending-t';
  ttl.textContent = t(`표시해 둔 낱말 ${list.length}개`, `${list.length} words you marked`);
  const sub = document.createElement('div');
  sub.className = 'wb-pending-s';
  sub.textContent = t(`TOPIK 을 풀면서 눌러 둔 낱말이에요 — ${list.slice(0, 6).map((x) => x.word).join(', ')}${list.length > 6 ? ' …' : ''}`,
    `You marked these while practising TOPIK — ${list.slice(0, 6).map((x) => x.word).join(', ')}${list.length > 6 ? ' …' : ''}`);
  const btns = document.createElement('div');
  btns.className = 'tq-unk-btns';
  const add = document.createElement('button');
  add.className = 'wb-add';
  add.type = 'button';
  add.textContent = t('단어장에 담기', 'Add to my wordbook');
  add.addEventListener('click', async () => {
    add.disabled = true;
    add.textContent = t('담는 중…', 'Adding…');
    const r = await tqUnkSave('wb');
    if (r.ok) { wbPendingDraw(); return; }
    /* 실패하면 줄을 그대로 두고 까닭을 적는다. 그냥 사라지면 담긴 줄
       알고 넘어가게 된다. */
    add.disabled = false;
    add.textContent = t('단어장에 담기', 'Add to my wordbook');
    const old = box.querySelector('.tq-unk-msg');
    if (old) old.remove();
    const p = document.createElement('p');
    p.className = 'tq-unk-msg no';
    p.textContent = t('담지 못했어요. 잠시 후 다시 해 주세요.', 'Could not add them. Please try again.');
    box.appendChild(p);
  });
  const drop = document.createElement('button');
  drop.className = 'wb-x';
  drop.type = 'button';
  drop.textContent = t('지우기', 'Discard');
  drop.addEventListener('click', () => {
    tqUnknown.clear();
    tqUnkStore();
    wbPendingDraw();
    document.querySelectorAll('.tq-w.on').forEach((o) => o.classList.remove('on'));
  });
  btns.append(add, drop);
  box.append(ttl, sub, btns);
}

/* 담기. 이미 있는 낱말은 빼고 넣는다 — 여러 판을 풀다 보면 같은 낱말을
   또 표시하게 되는데, 그때마다 쌓이면 단어장이 같은 말로 채워진다. */
async function tqUnkSave(where) {
  const list = [...tqUnknown.values()];
  if (!list.length) return { ok: true, added: 0, dup: 0 };

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    /* 표시는 이미 localStorage 에 있다. 구글 로그인이 페이지를 다시
       불러와도 단어장 맨 위에서 다시 만나게 된다. */
    tqUnkStore();
    open('account');
    return { ok: false, needLogin: true };
  }

  try {
    const words = list.map((x) => x.word);
    /* RLS 가 본인 행만 돌려주므로 user_id 를 따로 안 걸어도 남의 단어와
       견주는 일은 없다. */
    const { data: had, error: e1 } = await sb.from('words').select('word').in('word', words);
    if (e1) throw e1;
    const have = new Set((had ?? []).map((r) => r.word));
    const fresh = list.filter((x) => !have.has(x.word));

    if (fresh.length) {
      const { error: e2 } = await sb.from('words').insert(fresh.map((x) => ({
        word: x.word,
        /* 사전에 있는 낱말이면 뜻이 채워져 온다. 없으면 빈 칸 그대로 둔다 —
           여기서 지어내 넣으면 학습자가 그 틀린 뜻을 외우게 된다. 빈 칸은
           채우면 되지만 틀린 뜻은 외우고 나서야 안다. */
        meaning: (x.mean || '').slice(0, 120),
        example: x.ex || null,
        /* 사전 품사를 tqGloss 가 이미 앱 태그로 옮겨 왔다(tag). 뜻과 같은
           원칙 — 사전에 없으면 빈 채로 둔다. 지어낸 품사를 붙이면 학습자가
           동사를 명사로 잘못 외운다. */
        tag: x.tag || null,
        difficulty: 1,
        image_url: null,
        is_remembered: false,
        view_count: 0,
        remembered_at: null,
        user_id: session.user.id,
      })));
      if (e2) throw e2;
    }

    tqUnknown.clear();
    tqUnkStore();
    document.querySelectorAll('.tq-w.on').forEach((o) => o.classList.remove('on'));
    loadWords();
    return { ok: true, added: fresh.length, dup: list.length - fresh.length };
  } catch (e) {
    return { ok: false };
  } finally {
    if (where !== 'wb') tqUnkDraw();
  }
}

/* 결과 화면의 담기 단추. 여기서만 「담는 중」과 결과 줄을 보여 준다 —
   단어장 쪽 줄은 자기 자리에서 따로 알린다. */
async function tqUnkSaveFromOver() {
  const btn = $('tqUnkSave');
  if (btn) { btn.disabled = true; btn.textContent = t('담는 중…', 'Adding…'); }
  const r = await tqUnkSave('over');
  if (r.needLogin) return;
  const box = $('tqUnk');
  box.classList.remove('hidden');
  const old = box.querySelector('.tq-unk-msg');
  if (old) old.remove();
  const p = document.createElement('p');
  p.className = `tq-unk-msg ${r.ok ? 'ok' : 'no'}`;
  p.textContent = r.ok
    ? t(`단어장에 ${r.added}개를 담았어요.`, `Added ${r.added} to your wordbook.`) +
      (r.dup ? t(` ${r.dup}개는 이미 있어서 건너뛰었어요.`, ` ${r.dup} were already there.`) : '')
    : t('담지 못했어요. 잠시 후 다시 해 주세요.', 'Could not add them. Please try again.');
  box.appendChild(p);
  if (!r.ok && btn) { btn.disabled = false; btn.textContent = t('단어장에 담기', 'Add to my wordbook'); }
}

/* TOPIK 읽기 문항의 물음 문구(q.question)는 자료(topik.js·topik2.js)에
   한국어로만 있다 — 지문·보기와 달리 유형마다 정해진 문구 몇 가지뿐이라
   (docs/…-gemini-prompt.md 의 "물음 문구는 유형마다 정해져 있다") 통째로
   번역해 두는 편이 낫다. 영어 화면에서도 한국어만 나오면 "고르십시오"를
   못 읽는 사람은 무엇을 고르라는 건지 전혀 모른다.

   자료의 실제 문구와 **글자까지 그대로** 키를 맞춘다. 새 회차를 넣을 때
   문구가 여기 없으면(청사진과 다르게 썼다는 뜻) 한국어로 조용히
   물러난다 — 지어내지 않는다. */
const TQ_Q_EN = {
  '무엇에 대한 이야기입니까?': 'What is this passage about?',
  '(  )에 들어갈 말로 가장 알맞은 것을 고르십시오.': 'Choose the most appropriate word for the blank.',
  '다음을 읽고 맞지 않는 것을 고르십시오.': 'Read the following and choose the one that does NOT match.',
  '다음 글의 내용과 같은 것을 고르십시오.': 'Choose the option that matches the content of the passage.',
  '다음을 순서대로 맞게 배열한 것을 고르십시오.': 'Choose the option that puts the following in the correct order.',
  '다음 글의 중심 생각으로 가장 알맞은 것을 고르십시오.': 'Choose the most appropriate main idea of the passage.',
  '다음 문장이 들어갈 곳으로 가장 알맞은 것을 고르십시오.': 'Choose the most appropriate place for the following sentence to go.',
  '이 글을 쓴 이유로 가장 알맞은 것을 고르십시오.': 'Choose the most appropriate reason this was written.',
  '(　　　　)에 들어갈 말로 가장 알맞은 것을 고르십시오.': 'Choose the most appropriate word for the blank.',
  '밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오.': 'Choose the option closest in meaning to the underlined part.',
  '다음은 무엇에 대한 글입니까?': 'What is this passage about?',
  '윗글의 내용과 같은 것을 고르십시오.': 'Choose the option that matches the content of the passage above.',
  '다음을 읽고 글의 내용과 같은 것을 고르십시오.': 'Read the following and choose the option that matches its content.',
  '윗글의 내용으로 알 수 있는 것을 고르십시오.': 'Choose what can be inferred from the passage above.',
  '다음을 순서에 맞게 배열한 것을 고르십시오.': 'Choose the option that puts the following in the correct order.',
  '윗글의 주제로 가장 알맞은 것을 고르십시오.': 'Choose the most appropriate theme of the passage above.',
  '다음을 읽고 글의 주제로 가장 알맞은 것을 고르십시오.': 'Read the following and choose the most appropriate theme.',
  "밑줄 친 부분에 나타난 '나'의 심정으로 가장 알맞은 것을 고르십시오.": "Choose the most appropriate feeling of 'I' shown in the underlined part.",
  "밑줄 친 부분에 나타난 '그'의 심정으로 가장 알맞은 것을 고르십시오.": "Choose the most appropriate feeling of 'he' shown in the underlined part.",
  '다음 신문 기사의 제목을 가장 잘 설명한 것을 고르십시오.': 'Choose the option that best explains the following newspaper headline.',
  '주어진 문장이 들어갈 곳으로 가장 알맞은 것을 고르십시오.': 'Choose the most appropriate place for the given sentence to go.',
  '윗글에 나타난 필자의 태도로 가장 알맞은 것을 고르십시오.': "Choose the most appropriate attitude of the writer shown in the passage above.",
  '윗글을 쓴 목적으로 가장 알맞은 것을 고르십시오.': 'Choose the most appropriate purpose for writing the passage above.',
};
const tqQuestionText = (q) => (isEn() && TQ_Q_EN[q.question]) || q.question;

function tqDraw() {
  const q = tqRound[tqIdx];
  if (!q) return tqFinish();
  /* 맛보기를 다 썼으면 문제 대신 벽을 보여 준다. 판을 끝내지는 않는다 —
     로그인하고 돌아오면 이 문항부터 이어서 풀 수 있어야 한다. */
  if (tqWalled()) return tqWall();
  $('tqWall').classList.add('hidden');
  $('tqExamBody').classList.remove('hidden');
  tqMeta();
  $('tqPassage').classList.toggle('hidden', !q.passage);
  /* textContent 대신 어절 조각으로 담는다 — 읽다 막히는 낱말을 눌러
     표시해 둘 수 있게. 글자와 줄바꿈은 그대로다. */
  tqWordify($('tqPassage'), q.passage, q.mark);
  /* 넣을 문장이 없으면 59번 유형은 풀 수가 없다. 자료에만 두고 화면에
     안 그리면 학습자는 ㉠㉡㉢㉣ 만 보고 찍게 된다. */
  $('tqInsert').classList.toggle('hidden', !q.sentence);
  if (q.sentence) {
    /* 점선 상자만 있으면 지문의 일부인지 옮길 문장인지 갈리지 않는다.
       tqWordify 가 상자를 비우고 다시 담으므로 딱지는 그 뒤에 끼운다. */
    tqWordify($('tqInsert'), q.sentence);
    const tag = document.createElement('span');
    tag.className = 'tq-insert-h';
    tag.textContent = t('보기', 'Given sentence');
    $('tqInsert').prepend(tag);
  }
  tqWordify($('tqQuestion'), tqQuestionText(q));
  $('tqWhy').classList.add('hidden');
  $('tqNext').classList.add('hidden');

  const box = $('tqChoices');
  box.textContent = '';
  /* 보기 순서는 섞지 않는다. 자료에서 정답 자리를 넷에 고루 흩어 두었고
     (tools/check-topik.mjs 가 지킨다), 순서 배열 유형은 보기 자체가
     차례라 섞으면 읽기가 어지러워진다. */
  q.options.forEach((text, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'qz-choice';
    /* 되돌아온 문항은 아까 고른 답이 그대로 보여야 한다. 안 그러면
       내가 뭘 골랐는지 모른 채 다시 고르게 된다. */
    if (tqMock && tqPicks[tqIdx] === i) b.classList.add('picked');
    /* ①②③④ — 실제 시험지의 번호다. 해설과 성적표가 이미 이 글자로
       말하고 있어서, 화면만 1234 이면 「③이 답인 까닭」과 「3」이 따로 논다. */
    b.innerHTML = `<span class="tq-num">${TQ_CIRCLE[i]}</span>${esc(text)}`;
    b.addEventListener('click', () => tqPick(i, b));
    box.appendChild(b);
  });
  tqBusy = false;
  if (tqMock) {
    tqOmrDraw();
    /* 마지막 문항에 서 있거나 마흔 문항을 다 골랐으면 보기 바로 아래에
       제출을 띄운다. 답안지 안에만 두면 좁은 화면에서는 서랍을 열기
       전까지 끝낼 방법이 보이지 않는다 — 실제로 70번에서 갇혔다. */
    const allDone = tqPicks.filter((v) => v != null).length === tqRound.length;
    const last = tqIdx === tqRound.length - 1;
    $('tqNext').classList.toggle('hidden', !(allDone || last));
    $('tqNext').textContent = t('제출하기 →', 'Submit →');
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function tqPick(i, btn) {
  if (tqBusy) return;
  tqBusy = true;
  const q = tqRound[tqIdx];
  const right = i === q.answer;
  const all = [...$('tqChoices').children];
  all.forEach((b) => { b.disabled = true; });

  /* 모의고사에서는 채점하지 않고 고른 것만 적어 둔다. 답을 고칠 수 있는데
     그때마다 점수를 더하면 한 문항을 두 번 세게 된다. 채점은 tqFinish 에서
     tqPicks 를 보고 한꺼번에. */
  if (tqMock) {
    const wasBlank = tqPicks[tqIdx] == null;
    tqPicks[tqIdx] = i;
    btn.classList.add('picked');
    tqOmrDraw();
    /* 처음 푸는 문항이면 다음으로 넘어간다. 되돌아와 고친 것이라면
       그 자리에 둔다 — 고치자마자 튕겨 나가면 확인할 틈이 없다. */
    if (wasBlank && tqIdx < tqRound.length - 1) { tqIdx++; return tqDraw(); }
    tqBusy = false;
    [...$('tqChoices').children].forEach((b, k) => {
      b.disabled = false;
      b.classList.toggle('picked', k === i);
    });
    tqMeta(); tqOmrDraw();
    return;
  }

  tqPicks[tqIdx] = i;
  if (right) tqScore++;
  else tqWrongs.push(q);

  if (right) btn.classList.add('right');
  else {
    btn.classList.add('wrong');
    all[q.answer]?.classList.add('right');
  }
  /* 해설은 맞았을 때도 보여 준다. 넷 중 하나라 찍어서 맞히는 사람이 있고,
     그 사람이 다음 판 같은 유형에서 틀린다. */
  $('tqWhy').innerHTML =
    `<span class="tq-chip">${esc(right ? t('정답', 'Correct') : t('정답은 ' + (q.answer + 1) + '번', 'Answer: ' + (q.answer + 1)))}</span> ` +
    esc(q.why);
  $('tqWhy').classList.remove('hidden');

  tqIdx++;
  tqMeta();
  $('tqNext').textContent = tqIdx < tqRound.length ? t('다음 문제 →', 'Next →') : t('결과 보기 →', 'See results →');
  $('tqNext').classList.remove('hidden');
}

/* 유형별 성적. 판을 끝까지 풀어야 tqFinish() 가 불리므로(그만두기는 곧장
   고르기 화면으로 간다) tqRound 를 그대로 「푼 문제」로 세도 된다.
   못 맞힌 쪽이 위로 오게 세워 둔다 — 「부족한 유형」이 물음이기 때문이다. */
function tqByType() {
  const missed = new Set(tqWrongs.map((q) => q.id));
  const m = new Map();
  tqRound.forEach((q) => {
    const r = m.get(q.type) || { type: q.type, n: 0, ok: 0 };
    r.n++;
    if (!missed.has(q.id)) r.ok++;
    m.set(q.type, r);
  });
  return [...m.values()].sort((a, b) => (a.ok / a.n) - (b.ok / b.n) || b.n - a.n);
}

/* ══ 성적표 ═══════════════════════════════════════════════════
   모의고사를 끝냈을 때만 나온다. 「몇 점」만으로는 무엇을 고쳐야 할지
   알 수 없다. 시험지에서 어디가 무너졌는지가 보여야 다음 공부가 정해진다. */

const TQ_GENRE_EN = {
  '서술문': 'Short passage', '실용문': 'Notice', '수필': 'Essay',
  '설명문': 'Explanatory', '매체담화': 'Email / post',
};
const tqGenreTx = (g) => t(g, TQ_GENRE_EN[g] || g);

/* 어떤 잣대로든 묶어서 정답률을 낸다. */
function tqGroupBy(pick) {
  const missed = new Set(tqWrongs.map((q) => q.id));
  const m = new Map();
  tqRound.forEach((q, i) => {
    const k = pick(q, i);
    if (k == null) return;
    const r = m.get(k) || { k, n: 0, ok: 0 };
    r.n++;
    if (tqPicks[i] != null && !missed.has(q.id)) r.ok++;
    m.set(k, r);
  });
  return [...m.values()];
}

/* localStorage 는 학습자가 직접 고칠 수 있는 자리다. 여기서 나온 값이
   아래 성적표에서 그대로 HTML 로 들어가므로(title="…"), 숫자가 아닌 것은
   문 앞에서 걸러 버린다. 읽는 자리마다 esc 를 덧대는 것보다, 들어오는
   문을 하나로 좁히는 편이 빠뜨릴 데가 없다. */
const tqMockRead = (g) => {
  let raw;
  try { raw = JSON.parse(localStorage.getItem(tqMockKey(g)) || '[]'); } catch (e) { return []; }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => ({
      at: Number(r?.at), score: Number(r?.score), n: Number(r?.n), sec: Number(r?.sec),
      /* exam 은 나중에 붙인 칸이다. 그 전에 남긴 기록에는 없으므로 급수로
         메운다 — 3급부터는 II 뿐이고 1·2급은 I 뿐이라 되짚을 수 있다. */
      exam: TQ_EXAMS[r?.exam] ? r.exam : (g >= 3 ? 'II' : 'I'),
      /* 회차도 나중에 붙인 칸이다. 없으면 1회차로 본다. */
      round: Number(r?.round) > 0 ? Number(r.round) : 1,
    }))
    .filter((r) => Number.isFinite(r.score) && Number.isFinite(r.n) && r.n > 0 && r.score >= 0)
    .slice(-10);
};
function tqMockWrite(rec) {
  try {
    // 최근 열 회만 남긴다. 더 남겨도 추이를 읽는 데 보태는 것이 없다.
    const all = [...tqMockRead(tqGrade), rec].slice(-10);
    localStorage.setItem(tqMockKey(tqGrade), JSON.stringify(all));
  } catch (e) {}
}

/* ── 모의고사 기록 ────────────────────────────────────────────
   기록은 급수마다 따로 쌓인다(cp-topik-mock-<급수>). 보는 사람에게는 그게
   한 벌이라 두 시험·여섯 급수를 모아 한 줄로 세운다. */
function tqLogAll() {
  const out = [];
  Object.entries(TQ_EXAMS).forEach(([key, ex]) => {
    ex.grades.forEach((g) => {
      const list = tqMockRead(g);
      list.forEach((r, i) => {
        /* 급수만 보고 시험을 되짚은 옛 기록이 엉뚱한 시험에 붙는 것을 막는다. */
        if (r.exam !== key) return;
        out.push({ ...r, grade: g, no: i + 1, of: list.length });
      });
    });
  });
  // 최근 것이 위로. 지난주 것을 보려고 스크롤을 내리는 일이 없게.
  return out.sort((a, b) => (b.at || 0) - (a.at || 0));
}

const tqPct = (r) => Math.round((r.score / r.n) * 100);
const tqMin = (sec) => Math.max(1, Math.round((Number(sec) || 0) / 60));
/* 날짜는 보는 사람 기기의 방식으로. 한국어 화면이면 2026. 8. 20. 이 되고
   영어면 Aug 20, 2026 이 된다. */
const tqWhen = (at) => (Number.isFinite(at) && at > 0
  ? new Date(at).toLocaleDateString(isEn() ? 'en-US' : 'ko-KR',
      { year: 'numeric', month: 'short', day: 'numeric' })
  : t('날짜 없음', 'No date'));

/* 받는 사람이 무슨 점수인지 알 수 있어야 한다. 점수만 보내면 40점이 40문제
   중 40인지 50문제 중 40인지도 모른다 — 시험·급수·문항 수를 같이 적는다. */
function tqShareText(r) {
  const ex = TQ_EXAMS[r.exam] || tqE();
  const link = `${location.origin}${location.pathname}#learn/topik`;
  return [
    t(`치즈감자 · ${t(ex.name.ko, ex.name.en)} 모의고사 ${r.round || 1}회차 (${ex.gradeTx(r.grade)})`,
      `CheesePotato · ${t(ex.name.ko, ex.name.en)} mock exam, round ${r.round || 1} (${ex.gradeTx(r.grade)})`),
    t(`${r.score} / ${r.n} · 정답률 ${tqPct(r)}% · ${tqMin(r.sec)}분`,
      `${r.score} / ${r.n} · ${tqPct(r)}% correct · ${tqMin(r.sec)} min`),
    link,
  ].join('\n');
}

async function tqShareRec(r, btn) {
  const text = tqShareText(r);
  const was = btn ? btn.textContent : '';
  try {
    if (navigator.share) { await navigator.share({ text }); return; }
    await navigator.clipboard.writeText(text);
    if (!btn) return;
    btn.textContent = t('복사했어요', 'Copied');
    setTimeout(() => { btn.textContent = was; }, 1600);
  } catch (e) {
    /* 공유창을 닫았거나 클립보드를 막아 둔 것이다. 닫은 것까지 「실패」로
       알리면, 마음이 바뀌어 그만둔 사람에게 오류를 보여 주는 꼴이 된다. */
  }
}

let tqLogRows = [];

function tqDrawLog() {
  const box = $('tqLog');
  tqLogRows = tqLogAll();
  if (!tqLogRows.length) { box.textContent = ''; box.classList.add('hidden'); return; }

  /* 최고와 추이는 **같은 시험·급수 안에서만** 잰다. TOPIK I 2급 78% 와
     TOPIK II 3급 74% 를 견주면 「4%p 떨어졌다」가 되는데 둘은 애초에 다른
     시험이다. 어려운 쪽으로 옮겨 간 것을 퇴보라고 읽게 만든다.
     본 횟수만 전부를 센다 — 그건 섞어도 뜻이 안 변한다. */
  const now = tqLogRows[0];
  const same = tqLogRows.filter((r) => r.exam === now.exam && r.grade === now.grade);
  const best = same.reduce((a, b) => (tqPct(b) > tqPct(a) ? b : a));
  /* 회차마다 문항 수가 다를 수 있어 점수가 아니라 정답률로 잰다. */
  const gain = same.length >= 2 ? tqPct(now) - tqPct(same[same.length - 1]) : null;
  const nowEx = TQ_EXAMS[now.exam] || tqE();
  const nowName = `${t(nowEx.name.ko, nowEx.name.en)} ${nowEx.gradeTx(now.grade)}`;

  box.innerHTML =
    `<div class="tq-bd-h">${esc(t('모의고사 기록', 'Mock exam history'))}</div>` +
    '<div class="tq-facts">' +
      `<div><b>${tqLogRows.length}</b><span>${esc(t('본 횟수', 'Runs'))}</span></div>` +
      `<div><b>${tqPct(best)}%</b><span>${esc(t('최고 정답률', 'Best'))}</span></div>` +
      (gain === null ? ''
        : `<div><b class="${gain > 0 ? 'up' : gain < 0 ? 'down' : ''}">${gain > 0 ? '+' : ''}${gain}%p</b>` +
          `<span>${esc(t('처음 대비', 'vs first'))}</span></div>`) +
    '</div>' +
    /* 어느 기준으로 잰 값인지 적어 둔다. 여러 급수를 오간 사람에게는
       숫자만으로 무엇과 무엇을 견줬는지 알 길이 없다. */
    (same.length !== tqLogRows.length
      ? `<p class="tq-bd-tip">${esc(t(`최고와 처음 대비는 ${nowName} 안에서만 견줬어요.`,
                                      `Best and progress compare within ${nowName} only.`))}</p>`
      : '') +
    '<div class="tq-log-rows">' +
      tqLogRows.map((r, i) => {
        const ex = TQ_EXAMS[r.exam] || tqE();
        return '<div class="tq-log-row">' +
          '<div class="tq-log-when">' +
            `<b>${esc(tqWhen(r.at))}</b>` +
            `<span>${esc(t(ex.name.ko, ex.name.en))} · ${esc(ex.gradeTx(r.grade))} · ${esc(t(`${r.round || 1}회차`, `Round ${r.round || 1}`))}</span>` +
          '</div>' +
          '<div class="tq-log-score">' +
            `<b>${r.score} / ${r.n}</b>` +
            `<span>${tqPct(r)}% · ${tqMin(r.sec)}${esc(t('분', 'min'))}</span>` +
          '</div>' +
          `<button class="tq-log-share" type="button" data-share="${i}">` +
            `${esc(t('공유', 'Share'))}</button>` +
        '</div>';
      }).join('') +
    '</div>' +
    `<button class="tq-log-clear" type="button" data-clear="1">${esc(t('기록 지우기', 'Clear history'))}</button>`;
  box.classList.remove('hidden');
}

$('tqLog').addEventListener('click', (ev) => {
  const s = ev.target.closest('[data-share]');
  if (s) { tqShareRec(tqLogRows[Number(s.dataset.share)], s); return; }
  if (!ev.target.closest('[data-clear]')) return;
  if (!confirm(t('모의고사 기록을 모두 지울까요? 되돌릴 수 없어요.',
                 'Clear every mock exam record? This cannot be undone.'))) return;
  try {
    Object.values(TQ_EXAMS).forEach((ex) =>
      ex.grades.forEach((g) => localStorage.removeItem(tqMockKey(g))));
  } catch (e) { /* 못 지워도 화면은 다시 그린다 */ }
  tqDrawLog();
});

$('tqShare').addEventListener('click', (ev) =>
  tqShareRec({ at: Date.now(), score: tqScore, n: tqRound.length, sec: tqSpent, exam: tqExam, grade: tqGrade },
             ev.currentTarget));

function tqDrawSheet() {
  const box = $('tqSheet');
  if (!tqMock) { box.textContent = ''; box.classList.add('hidden'); return; }

  const n = tqRound.length;
  const missed = new Set(tqWrongs.map((q) => q.id));
  const state = (i) => (tqPicks[i] == null ? 'skip' : (missed.has(tqRound[i].id) ? 'no' : 'yes'));
  const skipped = tqRound.filter((_, i) => tqPicks[i] == null).length;

  /* 문항별 정오표. 시험지와 같은 번호로 늘어놓는다 — 어디에서 무너졌는지는
     비율표보다 이 한 줄이 먼저 말해 준다. */
  const grid = tqRound.map((q, i) =>
    `<span class="tq-cell ${state(i)}" title="${esc(t(`${q.slot}번 · ${tqTypeTx()[q.type].ko}`, `Q${q.slot} · ${tqTypeTx()[q.type].en}`))}">${q.slot}</span>`
  ).join('');

  /* 앞뒤 구간. 31~48 은 짧은 글, 49~70 은 한 문단짜리 글에 한 지문 두 문제다.
     같은 정답률이라도 어느 쪽이 무너졌는지에 따라 할 공부가 다르다. */
  const half = tqGroupBy((q) => (q.slot <= 48 ? 'front' : 'back'))
    .sort((a, b) => (a.k === 'front' ? -1 : 1));
  const halfName = (k) => (k === 'front'
    ? t('31~48번 · 짧은 글', 'Q31–48 · short texts')
    : t('49~70번 · 긴 글', 'Q49–70 · longer texts'));

  const genres = tqGroupBy((q) => q.genre).sort((a, b) => (a.ok / a.n) - (b.ok / b.n));

  const mm = Math.floor(tqSpent / 60), ss = tqSpent % 60;
  const per = n ? Math.max(1, Math.round(tqSpent / n)) : 0;

  const past = tqMockRead(tqGrade);
  const prev = past.length ? past[past.length - 1] : null;
  const diff = prev ? tqScore - prev.score : null;

  box.innerHTML =
    `<div class="tq-bd-h">${esc(t('성적표', 'Result sheet'))}</div>` +

    `<div class="tq-cells">${grid}</div>` +
    '<div class="tq-legend">' +
      `<span><i class="yes"></i>${esc(t('맞음', 'Correct'))}</span>` +
      `<span><i class="no"></i>${esc(t('틀림', 'Wrong'))}</span>` +
      (skipped ? `<span><i class="skip"></i>${esc(t(`못 풀고 넘김 ${skipped}`, `Unanswered ${skipped}`))}</span>` : '') +
    '</div>' +

    '<div class="tq-facts">' +
      `<div><b>${Math.round((tqScore / n) * 100)}%</b><span>${esc(t('정답률', 'Correct'))}</span></div>` +
      `<div><b>${mm}:${String(ss).padStart(2, '0')}</b><span>${esc(t('걸린 시간', 'Time taken'))}</span></div>` +
      `<div><b>${per}${esc(t('초', 's'))}</b><span>${esc(t('한 문항 평균', 'Per question'))}</span></div>` +
      (diff === null ? ''
        : `<div><b class="${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">${diff > 0 ? '+' : ''}${diff}</b>` +
          `<span>${esc(t('지난 회 대비', 'vs last time'))}</span></div>`) +
    '</div>' +

    `<div class="tq-bd-h" style="margin-top:22px">${esc(t('구간별', 'By section'))}</div>` +
    half.map((r) => tqBar(halfName(r.k), r.ok, r.n)).join('') +

    `<div class="tq-bd-h" style="margin-top:22px">${esc(t('지문 갈래별', 'By passage type'))}</div>` +
    genres.map((r) => tqBar(tqGenreTx(r.k), r.ok, r.n)).join('') +

    (past.length >= 1
      ? `<div class="tq-bd-h" style="margin-top:22px">${esc(t('회차 추이', 'Over time'))}</div>` +
        '<div class="tq-trend">' +
          [...past, { score: tqScore, n }].map((r, i, a) =>
            `<span class="tq-trend-bar" style="height:${Math.max(6, Math.round((r.score / r.n) * 100))}%"` +
            `${i === a.length - 1 ? ' data-now="1"' : ''} title="${r.score} / ${r.n}"></span>`
          ).join('') +
        '</div>' +
        `<p class="tq-bd-tip">${esc(t(`${past.length + 1}회째. 오른쪽 끝이 이번 회예요.`,
                                       `Run ${past.length + 1}. The last bar is this one.`))}</p>`
      : '');
  box.classList.remove('hidden');
}

function tqDrawBreak() {
  const box = $('tqBreak');
  const rows = tqByType();
  /* 한 유형만 나온 판에서는 점수를 한 번 더 적는 것뿐이라 접어 둔다. */
  if (rows.length < 2) { box.textContent = ''; box.classList.add('hidden'); return; }

  const name = (k) => t(tqTypeTx()[k].ko, tqTypeTx()[k].en);
  /* 문제 수가 적은 유형은 한두 개만 틀려도 비율이 폭삭 내려간다.
     세 문제는 되어야 「약하다」고 말할 수 있다. */
  const weak = rows.filter((r) => r.n >= 3 && r.ok / r.n < TQ_WEAK);

  box.innerHTML =
    `<div class="tq-bd-h">${esc(t('유형별로 보면', 'By type'))}</div>` +
    rows.map((r) => tqBar(name(r.type), r.ok, r.n)).join('') +
    tqWeakTip(weak.map((r) => r.type), rows.length, name);
  box.classList.remove('hidden');
}

function tqFinish() {
  const n = tqRound.length;
  tqStopClock();
  /* 모의고사는 여기서 한꺼번에 채점한다. 푸는 동안에는 tqPicks 만 적어
     두었다 — 답을 고칠 수 있어서 그때그때 더하면 두 번 세게 된다.
     안 푼 문항은 틀린 것으로 센다. 실제 시험도 그렇다. */
  if (tqMock) {
    tqScore = 0; tqWrongs = [];
    tqRound.forEach((q, i) => {
      if (tqPicks[i] === q.answer) tqScore++;
      else tqWrongs.push(q);
    });
  }
  $('tqOmr').classList.add('hidden');
  $('tqOmr').classList.remove('open', 'low');
  /* 언어를 바꾸면 tqSyncLang 이 이 함수를 다시 부른다. 기록은 그때 또
     남으면 안 된다 — 한 판이 회차 목록에 두 번 들어간다. */
  const first = !tqSaved;
  tqSaved = true;
  /* 첫 판을 끝까지 봤다. 다음 판부터는 맛보기 수만큼만 열린다. */
  if (first && !tqSignedIn) tqFreeMark();
  // 최고 기록은 전체를 다 푼 판에만 남긴다. 유형별 판과 견주면 뜻이 없다.
  if (n === tqOf(tqGrade).length) {
    gameBest(tqBestKey(tqGrade), tqScore);
  }
  tqSetWrite(tqGrade, tqSet, tqScore, n);
  /* 전체 풀기는 유형별 점수도 같이 남긴다. 같은 문제를 같은 자리에서 푼
     것이라 유형별 판과 다를 바가 없고, 이걸 안 남기면 40문제를 다 풀고도
     기록판이 「아직 안 풀었어요」만 늘어놓는다 — 정작 알고 싶은 것이
     어느 유형이 약한가인데. */
  if (tqSet === 'all') tqByType().forEach((r) => tqSetWrite(tqGrade, r.type, r.ok, r.n));
  const pct = tqScore / n;
  $('tqOverEmoji').textContent = pct === 1 ? '🏆' : pct >= 0.7 ? '🎉' : '📖';
  $('tqOverScore').textContent = `${tqScore} / ${n}`;
  const rate = t(`정답률 ${Math.round(pct * 100)}%`, `${Math.round(pct * 100)}% correct`);
  $('tqOverLine').textContent = tqWrongs.length
    ? `${rate} · ` + t(`틀린 ${tqWrongs.length}문제를 아래에 모았어요.`, `The ${tqWrongs.length} you missed are below.`)
    : t('전부 맞혔어요.', 'All correct.');
  tqDrawSheet();
  /* 기록은 성적표를 그린 뒤에 남긴다. 먼저 쓰면 성적표가 방금 쓴 자기
     자신을 「지난 회」로 읽어서, 첫 회에 「지난 회 대비 0」이 뜬다. */
  if (first && tqMock) { tqMockWrite({ at: Date.now(), score: tqScore, n, sec: tqSpent, exam: tqExam, round: tqMockRound }); tqHoldClear(); }
  tqDrawBreak();
  /* 틀린 문항 다시 보기. innerHTML 로 찍지 않고 조각으로 쌓는 이유는
     여기서도 낱말을 눌러 표시할 수 있어야 해서다 — 무엇을 몰랐는지는
     해설을 읽다가 비로소 알게 되는 일이 많다. */
  const wrongs = $('tqWrongs');
  wrongs.textContent = '';
  for (const q of tqWrongs) {
    const card = document.createElement('div');
    card.className = 'tq-wrong';
    const lv = document.createElement('div');
    lv.className = 'lc-lv';
    lv.textContent = t(tqTypeTx()[q.type].ko, tqTypeTx()[q.type].en);
    card.appendChild(lv);
    if (q.passage) {
      const p = document.createElement('div');
      p.className = 'tq-wrong-p';
      tqWordify(p, q.passage, q.mark);
      card.appendChild(p);
    }
    const a = document.createElement('div');
    a.className = 'tq-wrong-a';
    tqWordify(a, `${q.answer + 1}. ${q.options[q.answer]}`);
    const w = document.createElement('div');
    w.className = 'tq-wrong-w';
    tqWordify(w, q.why);
    card.append(a, w);
    wrongs.appendChild(card);
  }
  tqUnkDraw();
  $('tqAgain').textContent = t('다시 풀기', 'Try again');
  $('tqBack').textContent = t('다른 유형 고르기', 'Pick another type');
  /* 공유는 모의고사에만. 유형별 연습 점수를 보내면 받는 쪽은 그게 무슨
     점수인지 알 수가 없다. */
  $('tqShare').textContent = t('결과 공유하기', 'Share result');
  $('tqShare').classList.toggle('hidden', !tqMock);
  tqPanel('tqOver');
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* 시험을 바꾸면 급수도 그 시험의 것으로 갈아 끼운다. 안 갈면 TOPIK I 에서
   2급을 고른 채 II 로 넘어가 있지도 않은 2급으로 빈 화면을 보게 된다.
   갈래도 마찬가지다 — tqShowSkill 안의 tqFixSkill 이 TOPIK II 쓰기에서
   TOPIK I 로 넘어갈 때 읽기로 물러나 준다. */
$('tqSkillBar').addEventListener('change', (ev) => {
  const x = ev.target.closest('input[name=tqExam]');
  if (!x || !TQ_EXAMS[x.value]) return;
  tqExam = x.value;
  try { localStorage.setItem(TQ_EXAM_KEY, tqExam); } catch (e) {}
  tqLoadGrade();
  tqShowSkill();
});
$('tqSkillBar').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-tqskill]');
  if (b) tqSetSkill(b.dataset.tqskill);
});

/* 급수 줄은 갈래마다 따로 그려지지만 값은 하나를 나눠 쓴다. 갈래별로
   따로 두면 읽기에서 2급을 고르고 듣기로 갔을 때 1급이 나온다. */
function tqOnGrade(ev) {
  const r = ev.target.closest('input[name=tqGrade]');
  if (!r) return;
  const g = parseInt(r.value, 10);
  if (!tqGrades().includes(g)) return;
  tqGrade = g;
  try { localStorage.setItem(TQ_KEY(tqExam), String(g)); } catch (e) {}
  tqShowSkill(true);
}
$('tqLevel').addEventListener('change', tqOnGrade);
$('tlLevel').addEventListener('change', tqOnGrade);

/* ── 듣기 ── */
$('tlList').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-tl]');
  if (b) tlStart(b.dataset.tl);
});
$('tlSay').addEventListener('click', () => {
  /* 듣는 중에 다시 누르면 멈춘다. 안 그러면 두 벌이 겹쳐 흘러서
     대화가 뭉개진다. */
  if ($('tlSay').classList.contains('on')) {
    tlStop();
    $('tlSay').classList.remove('on');
    $('tlSay').textContent = '▶  ' + t('다시 듣기', 'Play again');
    return;
  }
  tlPlayNow();
});
$('tlChoices').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-tlpick]');
  if (b && !b.disabled) tlPick(+b.dataset.tlpick);
});
$('tlNext').addEventListener('click', tlNext);
$('tlQuit').addEventListener('click', tlBackToPick);
$('tlAgain').addEventListener('click', () => tlStart(
  tlRound.length === tlOf(tqGrade).length ? 'all' : (tlRound[0]?.type || 'all')));
$('tlBack').addEventListener('click', tlBackToPick);
$('tqList').addEventListener('click', (ev) => {
  if (ev.target.closest('[data-tq-drop]')) {
    if (!confirm(t('풀던 모의고사를 지울까요? 되돌릴 수 없어요.',
                   'Discard the mock exam in progress? This cannot be undone.'))) return;
    tqHoldClear();
    drawTopik();
    return;
  }
  const b = ev.target.closest('[data-tq]');
  if (!b) return;
  const key = b.dataset.tq;
  if (key === 'resume') { tqHoldResume(); return; }
  /* 잠긴 회차는 로그인 화면으로 보낸다. 아무 일도 안 일어나면 고장으로
     보이고, 카드에 적힌 「로그인하면 열려요」가 빈말이 된다. */
  if (key === 'lock') { open('account'); return; }
  if (key.startsWith('mock:')) { tqStart('mock', Number(key.slice(5))); return; }
  tqStart(key);
});
/* 「…만 풀어 보기」. 두 자리(기록판·결과 화면)에 같은 단추가 나오므로
   다시 그릴 때마다 붙이지 않도록 바깥 상자에 한 번만 걸어 둔다. */
['tqRecord', 'tqBreak'].forEach((id) => $(id).addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-tq-go]');
  if (b) tqStart(b.dataset.tqGo);
}));
['tlRecord', 'tlBreak'].forEach((id) => $(id).addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-tq-go]');
  if (b) tlStart(b.dataset.tqGo);
}));
$('tqNext').addEventListener('click', () => (tqMock ? tqSubmitAsk() : tqDraw()));

/* 답안지 — 칸을 누르면 그 문항으로 간다. */
$('tqOmrGrid').addEventListener('click', (ev) => {
  const c = ev.target.closest('[data-go]');
  if (c) tqGoto(parseInt(c.dataset.go, 10));
});
/* 좁은 화면에서는 아래 바를 눌러 답안지를 펼친다. 넓은 화면에서는 늘
   펼쳐져 있으므로 이 토글이 아무 일도 하지 않는다(CSS 가 무시한다). */
$('tqOmrBar').addEventListener('click', () => $('tqOmr').classList.toggle('open'));
$('tqGoLogin').addEventListener('click', () => open('account'));
$('tqWallBack').addEventListener('click', () => {
  tqMock = false; tqStopClock();
  $('tqOmr').classList.add('hidden');
  window.cpTxtSize?.(false);
  $('tqWall').classList.add('hidden');
  $('tqExamBody').classList.remove('hidden');
  drawTopik();
});
$('tqSubmit').addEventListener('click', tqSubmitAsk);
/* 그만두기 — 모의고사는 되돌릴 수 없으니 한 번 묻는다. 시계도 멈춘다. */
/* 모의고사를 푸는 중인가. 70분짜리를 실수로 날리지 않게 막는 자리들이
   이것 하나를 본다. */
/* 성적표가 떠 있으면 이미 끝난 것이라 잃을 것이 없다. 이것을 빼먹으면
   다 풀고 결과를 본 뒤 나가려는 사람에게도 「그만둘까요?」를 묻는다. */
const tqRunning = () => tqMock && tqIdx < tqRound.length && !showing('tqOver');

/* ── 풀던 자리 붙들어 두기 ────────────────────────────────────
   70분짜리를 중간에 나가면 통째로 사라졌다. 「그만둘까요? 기록에 남지
   않아요」라고 묻기는 했지만, 묻는다고 사라진 시험이 덜 아깝지는 않다.

   그래서 나갈 때 **푼 답과 남은 시간을 붙들어 둔다.** 나가겠다고만 물어보고,
   저장은 늘 한다 — 「저장할까요 / 버릴까요」를 한 번 더 물으면 나가려는
   사람에게 창을 두 번 띄우는 꼴이고, 버리는 쪽을 고를 까닭도 별로 없다.
   버리고 싶으면 이어하기 카드에서 지우면 된다.

   문항은 id 만 적는다. 지문째로 적으면 localStorage 가 한 회에 수십 KB 를
   먹고, 자료를 고쳤을 때 예전 지문이 되살아난다. */
const TQ_HOLD_KEY = 'cp-topik-hold';
const TQ_HOLD_DAYS = 14;   // 이보다 오래된 것은 이어 풀 마음이 이미 없다

function tqHoldSave() {
  if (!tqRunning()) return;
  try {
    localStorage.setItem(TQ_HOLD_KEY, JSON.stringify({
      exam: tqExam, grade: tqGrade, round: tqMockRound,
      ids: tqRound.map((q) => q.id),
      picks: tqPicks.map((v) => (Number.isInteger(v) ? v : null)),
      idx: tqIdx, left: tqLeft, spent: tqSpent, at: Date.now(),
    }));
  } catch (e) { /* 못 적으면 그만이다 — 나가는 것까지 막을 일은 아니다 */ }
}

function tqHoldRead() {
  try {
    const h = JSON.parse(localStorage.getItem(TQ_HOLD_KEY) || 'null');
    if (!h || !TQ_EXAMS[h.exam] || !Array.isArray(h.ids) || !h.ids.length) return null;
    if (!TQ_EXAMS[h.exam].grades.includes(h.grade)) return null;
    if (!(Date.now() - Number(h.at) < TQ_HOLD_DAYS * 86400000)) return null;
    /* 남은 시간이 없으면 이어 풀 것이 아니라 이미 끝난 시험이다. */
    if (!(Number(h.left) > 0)) return null;
    return h;
  } catch (e) { return null; }
}
const tqHoldClear = () => { try { localStorage.removeItem(TQ_HOLD_KEY); } catch (e) {} };

/* 붙들어 둔 자리로 돌아간다. 자료가 바뀌어 없어진 문항이 있으면 되살리지
   않는다 — 한 문항이 빠진 채로 이어 풀면 번호가 밀려 성적표가 거짓이 된다. */
function tqHoldResume() {
  const h = tqHoldRead();
  if (!h) { drawTopik(); return; }
  tqExam = h.exam;
  try { localStorage.setItem(TQ_EXAM_KEY, tqExam); } catch (e) {}
  tqGrade = h.grade;
  try { localStorage.setItem(TQ_KEY(tqExam), String(tqGrade)); } catch (e) {}

  const byId = new Map(tqE().reading.map((q) => [q.id, q]));
  const round = h.ids.map((id) => byId.get(id));
  if (round.some((q) => !q)) {
    tqHoldClear();
    alert(t('그 사이 문제가 바뀌어서 이어 풀 수 없어요. 새로 시작해 주세요.',
            'The questions changed since then, so this run cannot be resumed. Please start a new one.'));
    drawTopik();
    return;
  }

  tqRound = round;
  tqPicks = round.map((_, i) => (Number.isInteger(h.picks?.[i]) ? h.picks[i] : null));
  tqIdx = Math.min(Math.max(0, Number(h.idx) || 0), round.length - 1);
  tqScore = 0; tqWrongs = []; tqBusy = false; tqSet = 'mock';
  tqMock = true; tqSaved = false;
  tqMockRound = Number(h.round) > 0 ? Number(h.round) : 1;
  tqLeft = Math.min(Number(h.left), tqMockSec());
  tqSpent = Math.max(0, Number(h.spent) || 0);
  tqTitle = t(`${tqMockRound}회차 · 읽기 ${tqE().from}~${tqE().to}번`, `Round ${tqMockRound} — reading ${tqE().from}–${tqE().to}`);

  $('tqOmr').classList.remove('hidden', 'open');
  tqClockBuild(); tqClock(); tqOmrDraw(); tqRunClock();
  $('tqWall').classList.add('hidden');
  $('tqExamBody').classList.remove('hidden');
  tqPanel('tqPlay');
  tqDraw();
}

/* 나가겠느냐고만 묻는다. 저장은 어느 쪽이든 한다. */
function tqAskQuit() {
  const ok = confirm(t('모의고사를 그만둘까요? 지금까지 푼 답과 남은 시간은 저장돼요 — 나중에 이어서 풀 수 있어요.',
                       'Leave the mock exam? Your answers and the time left are saved — you can pick it up later.'));
  if (ok) tqHoldSave();
  return ok;
}

function tqDropMock() {
  tqMock = false; tqStopClock();
  $('tqOmr').classList.add('hidden');
  window.cpTxtSize?.(false);
}

/* 새로고침·창 닫기. 앱 안의 길목은 아래 cpBlockLeave 가 막지만, 새로고침은
   자바스크립트가 못 막으므로 브라우저에게 물어 달라고 부탁하는 수밖에 없다.
   부탁이 통하든 안 통하든 그 전에 붙들어 둔다 — 실수로 새로고침한 사람이
   70분을 잃는 일은 이것으로 끝난다. */
window.addEventListener('beforeunload', (ev) => {
  if (!tqRunning()) return;
  tqHoldSave();
  ev.preventDefault();
  ev.returnValue = '';
});

/* 주소가 바뀌어 화면을 떠나려 할 때 라우터가 묻는다. 「머문다」를 고르면
   true 를 돌려주고, 라우터가 주소를 되돌린다.

   이 자리가 필요한 까닭 — 그만두기 단추에는 확인이 붙어 있는데 뒤로 가기와
   헤더 단추는 그 확인을 건너뛰어서, 다 푼 시험이 소리 없이 사라졌다. */
window.cpBlockLeave = function () {
  if (!tqRunning()) return false;
  if (!tqAskQuit()) return true;
  tqDropMock();
  return false;
};

$('tqQuit').addEventListener('click', () => {
  if (tqRunning() && !tqAskQuit()) return;
  tqDropMock();
  drawTopik();
});
/* 「다시 풀기」는 방금 본 그 회차를 다시 낸다. 회차를 안 넘기면 2회차를
   보고 나서 다시 풀었을 때 1회차가 나온다. */
$('tqAgain').addEventListener('click', () => tqStart(tqSet, tqMockRound));
$('tqBack').addEventListener('click', () => { tqDropMock(); drawTopik(); });

function tqSyncLang() {
  if ($('tqWrap').classList.contains('hidden')) return;
  tqDrawSkillBar();
  /* 갈래마다 「지금 무엇을 보고 있나」가 달라서 각자 맞춘다. 셋을 다
     다시 그리면 풀던 판과 쓰던 글이 사라진다. */
  if (tqSkill === 'listening') { tlSyncLang(); return; }
  if (tqSkill === 'writing') { twDraw(); return; }
  if (!$('tqPick').classList.contains('hidden')) drawTopik();
  else if (!$('tqOver').classList.contains('hidden')) tqFinish();
  else { tqMeta(); $('tqNext').textContent = tqIdx < tqRound.length ? t('다음 문제 →', 'Next →') : t('결과 보기 →', 'See results →'); }
}

function tlSyncLang() {
  if (!$('tlPick').classList.contains('hidden')) { tlDraw(); return; }
  if (!$('tlOver').classList.contains('hidden')) { tlEnd(); return; }
  /* 푸는 중이면 단추 글만 갈아 끼운다. tlDrawQ 를 다시 부르면 소리가
     처음부터 다시 나온다 — 언어를 눌렀다고 대화가 다시 흐르면 놀란다. */
  if (!tlRound[tlIdx]) return;
  $('tlQuit').textContent = t('그만두기', 'Quit');
  $('tlNext').textContent = tlIdx + 1 >= tlRound.length
    ? t('결과 보기', 'See the result') : t('다음', 'Next');
}

function drawSentenceHead() {
  const level = learnLv.sentence;
  const all = SB_POINTS.filter((p) => sentenceTier(p) === level);
  $('sbLevel').innerHTML = renderLevelSwitch('sentence');
  $('sbIntro').textContent = ({
    beginner: t('첫 문장을 만드는 데 꼭 필요한 표현부터 내 문장으로 바꿔 봅니다.', 'Start with the expressions you need to build your very first sentences.'),
    intermediate: t('이유, 조건, 가능성처럼 문장을 길게 만드는 표현을 직접 써 봅니다.', 'Practice the expressions that make sentences longer: reasons, conditions, and possibility.'),
    advanced: t('뉘앙스가 갈리는 고급 표현으로 문장을 세밀하게 다듬습니다.', 'Work on nuance-heavy advanced expressions and make your sentences more precise.'),
  })[level];
  $('sbSummary').innerHTML = renderLearnSummary([
    { k: t('표현', 'Points'), v: all.length, s: t('현재 단계에서 바로 연습할 문형', 'Grammar points in this level') },
    { k: t('갈래', 'Sets'), v: new Set(all.map((p) => p.cat.id)).size, s: t('비슷한 표현끼리 모아 둔 묶음', 'Grouped by similar use') },
    { k: t('목표', 'Goal'), v: learnLevelText(level), s: t('외운 문장이 아니라 내 문장 만들기', 'Make your own sentence, not a memorised one') },
  ]);
}
function drawCourseRoadmap(level, rows) {
  if (level !== 'beginner') {
    $('lcRoadmap').innerHTML = '';
    $('lcRoadmap').classList.add('hidden');
    return;
  }
  $('lcRoadmap').classList.remove('hidden');
  $('lcRoadmap').innerHTML = BEGINNER_ROADMAP.map((part) => {
    const linked = part.courses.map((id) => rows.find((c) => c.id === id)).filter(Boolean);
    const done = linked.reduce((a, c) => a + courseDone(c), 0);
    const total = linked.reduce((a, c) => a + c.lessons.length, 0);
    const meter = total ? `${done} / ${total}` : t('빌드 예정', 'Planned');
    const foot = linked.length
      ? t(`${linked.map((c) => cTx(c.title)).join(' · ')} 로 바로 이어집니다.`, `Flows into ${linked.map((c) => cTx(c.title)).join(' · ')}.`)
      : t('사용자가 준 초급 커리큘럼을 따라 다음 단위로 계속 넓힐 예정입니다.', 'This will expand next using your beginner curriculum outline.');
    return (
      `<div class="roadmap-card">` +
        `<div class="roadmap-top"><div><div class="roadmap-k">${esc(t(part.tag.ko, part.tag.en))}</div><div class="roadmap-t">${esc(t(part.title.ko, part.title.en))}</div></div><div class="roadmap-m">${esc(meter)}</div></div>` +
        `<div class="roadmap-points">${part.points.map((p) => `<div class="roadmap-p">${esc(t(p.ko, p.en))}</div>`).join('')}</div>` +
        `<div class="roadmap-foot">${esc(foot)}</div>` +
      `</div>`
    );
  }).join('');
}

function drawSections() {
  $('lsecList').innerHTML = LEARN_SECTIONS.map((s) => {
    // 코스 갈래만 진도가 있다. 나머지는 아직 셀 것이 없다.
    let foot = '';
    if (s.id === 'courses') {
      const n = COURSES.reduce((a, c) => a + courseDone(c), 0);
      const all = COURSES.reduce((a, c) => a + c.lessons.length, 0);
      foot =
        '<div class="lc-meter">' +
          `<div class="lc-bar"><div class="lc-fill" style="width:${all ? Math.round((n / all) * 100) : 0}%"></div></div>` +
          `<span class="lc-num">${n} / ${all}</span>` +
        '</div>';
    } else if (!s.ready) {
      foot = `<div class="lc-order">${t('아직 준비 중이에요.', 'Not ready yet.')}</div>`;
    }
    return (
      `<button class="lc-card" data-section="${s.id}">` +
        '<div class="lc-top">' +
          `<div class="lc-mark">${esc(s.emoji)}</div>` +
          '<div style="min-width:0">' +
            `<div class="lc-lv">${esc(secTx(s.lv))}</div>` +
            `<div class="lc-title">${esc(secTx(s.title))}</div>` +
            `<div class="lc-tag">${esc(secTx(s.tag))}</div>` +
          '</div>' +
        '</div>' +
        `<p class="lc-blurb">${esc(secTx(s.blurb))}</p>` +
        foot +
      '</button>'
    );
  }).join('');
}

/* 갈래를 열고 닫는 길은 하나로 둔다. 화면마다 따로 토글하면
   갈래 목록과 갈래 속이 같이 떠 있거나 둘 다 사라진다. */
let lsecOpen = null;   // 지금 열린 갈래 id. 언어를 바꿀 때 다시 그리려고 둔다.

/* ══ 읽기 연습 ═══════════════════════════════════════════════════
   읽고, 이해한 것을 자기 말로 다시 쓰는 자리.

   **채점을 무엇이라 부르는가** — 지문마다 「짚어야 할 것」을 여러 표현으로
   정해 두고, 학습자가 쓴 글에서 몇 개를 짚었는지로 100점을 낸다. 이건
   맥락을 재는 것이 아니라 「이해했으면 그 내용이 글에 나온다」는 상관을
   쓴 근사치다. 그래서 화면에서도 「맥락 점수」가 아니라 **내용 점수**라고
   부르고, 놓친 항목이 무엇인지 같이 보여 준다 — 숫자보다 그쪽이 배울
   거리다. 그리고 「다르게 썼다면 틀린 게 아니다」를 반드시 함께 적는다.
   같은 뜻을 다른 말로 쓴 사람을 틀렸다고 하면 안 된다.

   영어 대조(en)는 **답을 낸 뒤에만** 편다. 미리 보이면 읽기 연습이
   아니라 번역문 읽기가 된다. */

const RD_LENS = [
  { id: 'short', ko: '짧은 글', en: 'Short', dKo: '서너 문장. 짬이 날 때 한 편.', dEn: 'Three or four sentences. One when you have a minute.' },
  { id: 'long',  ko: '긴 글',   en: 'Long',  dKo: '한 문단. 흐름을 따라가는 연습.', dEn: 'A full paragraph. Practice following a thread.' },
];
let rdLen = 'short';
let rdOpen = null;          // 지금 펼친 지문 id
const RD_DONE_KEY = 'cp_rd_done';

/* 푼 기록은 브라우저에 둔다. 로그인 없이도 쓸 수 있어야 하는 자리라
   서버를 거치지 않는다. */
const rdDoneRead = () => {
  try {
    const o = JSON.parse(localStorage.getItem(RD_DONE_KEY) || '{}');
    return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
  } catch (e) { return {}; }
};
const rdDoneWrite = (id, score) => {
  try {
    const o = rdDoneRead();
    /* 다시 풀어 더 잘했을 때만 올린다. 한 번 잘 본 것을 나중에 대충
       써서 깎아 내리면 기록이 벌이 된다. */
    o[id] = Math.max(Number(o[id]) || 0, score);
    localStorage.setItem(RD_DONE_KEY, JSON.stringify(o));
  } catch (e) {}
};

const rdRows = () => READING?.[rdLen]?.[learnLv.reading] ?? [];
const rdFind = (id) => Object.values(READING ?? {}).flatMap((g) => Object.values(g)).flat().find((r) => r.id === id);

/* ══ 글 속의 문법 ═══════════════════════════════════════════════
   낱말을 모르면 사전을 찾지만 **어미는 찾을 데가 없다.** 「-는 바람에」를
   처음 본 사람은 그것이 한 덩어리인 줄도 모르고, 「바람」을 사전에서
   찾다가 「wind」를 보고 더 헷갈린다.

   예문 만들기에 그 설명이 290개나 쌓여 있는데 읽는 사람이 그리로 갈 길이
   없었다. 그래서 글에서 아는 문법에 밑줄을 긋고, 누르면 무엇인지 말풍선을
   띄우고, 거기서 바로 그 쪽으로 건너가게 한다.

   무엇을 짚고 무엇을 안 짚는지는 tools/build-grammar.mjs 머리말에 있다 —
   요약하면 **글자만 보고 못 가르는 것과 너무 자주 나오는 것은 안 짚는다.**
   지문의 반이 밑줄이면 짚어 준 것이 아니다. */
function rdGrammarify(el, text) {
  el.textContent = '';
  let hits = [];
  try { hits = grammarScan(text); } catch (e) { /* 못 찾으면 그냥 글로 둔다 */ }
  let at = 0;
  for (const h of hits) {
    if (h.from > at) el.appendChild(document.createTextNode(text.slice(at, h.from)));
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rd-g';
    b.textContent = text.slice(h.from, h.to);
    b.dataset.g = h.id;
    /* 마우스를 얹었을 때 무엇인지 보이게 한다. 누르기 전에 알면 굳이
       안 눌러도 되는 사람이 있다. */
    b.title = h.name;
    el.appendChild(b);
    at = h.to;
  }
  if (at < text.length) el.appendChild(document.createTextNode(text.slice(at)));
}

/* 문법 설명 한 칸. 영어 화면이면 영어로, 아직 안 옮긴 것은 한국어로
   물러선다 — 지어내 채우면 배우는 사람이 그 틀린 설명을 외운다.
   `sentences.js` 의 설명은 한국어뿐이라 옮긴 것은 docs/grammar-en.json 에
   따로 있다. 채우는 길은 docs/grammar-gemini-prompt.md 에. */
const gTx = (id, k, ko) => (isEn() && GRAMMAR_EN[id]?.[k]) || ko || '';

/* 지금 말풍선이 가리키고 있는 낱말. 닫을 때 표시를 지우려고 들고 있다. */
let rdGAt = null;

function rdGClose() {
  $('rdGPop').hidden = true;
  rdGAt?.classList.remove('on');
  rdGAt = null;
}

/* 누른 낱말 위에 말풍선을 놓는다. 위가 좁으면 아래로 내린다 — 지문 첫
   줄에서 누르면 위에 자리가 없어서, 고집하면 화면 밖으로 나간다. */
function rdGPlace(btn) {
  /* 글을 다시 그리면 눌렀던 낱말이 화면에서 사라진다. 그것을 붙들고
     자리를 재면 0 이 나와 말풍선이 구석으로 튄다. */
  if (!btn.isConnected) { rdGClose(); return; }
  const pop = $('rdGPop');
  const r = btn.getBoundingClientRect();
  const p = pop.getBoundingClientRect();
  const gap = 10;
  const up = r.top - p.height - gap >= 8;
  pop.classList.toggle('up', up);
  pop.classList.toggle('down', !up);
  pop.style.top = `${up ? r.top - p.height - gap : r.bottom + gap}px`;
  /* 낱말 가운데에 맞추되 화면 밖으로는 안 나가게 잡아 둔다. */
  const mid = r.left + r.width / 2;
  const left = Math.max(8, Math.min(window.innerWidth - p.width - 8, mid - p.width / 2));
  pop.style.left = `${left}px`;
  /* 꼬리는 말풍선이 밀린 만큼 반대로 옮겨 늘 낱말을 가리키게 한다. */
  const tail = $('rdGTail');
  tail.style.left = `${Math.max(8, Math.min(p.width - 18, mid - left - 5))}px`;
}

function rdGOpen(btn) {
  const g = GRAMMAR.find((x) => x.id === btn.dataset.g);
  if (!g) return;
  rdGClose();
  rdGAt = btn;
  btn.classList.add('on');
  $('rdGName').textContent = g.name;
  $('rdGDesc').textContent = gTx(g.id, 'desc', g.desc);
  $('rdGGo').textContent = t('문법 보기 →', 'See the grammar →');
  $('rdGGo').dataset.g = g.id;
  const pop = $('rdGPop');
  pop.hidden = false;
  /* 자리는 크기를 안 뒤에 잡는다 — 숨어 있는 동안은 높이가 0 이라,
     먼저 잡으면 늘 아래로 붙는다. */
  rdGPlace(btn);
}

$('rdGGo').addEventListener('click', () => {
  const id = $('rdGGo').dataset.g;
  rdGClose();
  if (id) openLearnSub(`sentence/${id}`);
});
document.addEventListener('click', (ev) => {
  const b = ev.target.closest?.('.rd-g');
  if (b) { ev.preventDefault(); rdGOpen(b); return; }
  if (!ev.target.closest?.('#rdGPop')) rdGClose();
});
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') rdGClose(); });
/* 글이 흐르면 말풍선도 따라가야 한다. 그 자리에 남으면 엉뚱한 낱말을
   가리키는 꼴이 된다. */
window.addEventListener('scroll', () => { if (rdGAt) rdGPlace(rdGAt); }, true);
window.addEventListener('resize', () => { if (rdGAt) rdGPlace(rdGAt); });

/* 띄어쓰기를 지우고 견준다. 「지하철로」와 「지하철 로」를 다르게 셀
   까닭이 없다. */
const rdFlat = (s) => String(s ?? '').replace(/\s+/g, '');
const rdHit = (answer, key) => {
  const a = rdFlat(answer);
  return key.k.some((w) => a.includes(rdFlat(w)));
};

function rdLenSwitch() {
  const cur = RD_LENS.find((x) => x.id === rdLen) || RD_LENS[0];
  return (
    '<div class="pt-lv-row">' +
      `<div class="diff-seg learn-lv" role="radiogroup" aria-label="${t('글 길이', 'Passage length')}">` +
        RD_LENS.map((x) =>
          `<label><input type="radio" name="rd_len" value="${x.id}" data-rd-len="${x.id}"${x.id === rdLen ? ' checked' : ''}><span>${esc(isEn() ? x.en : x.ko)}</span></label>`
        ).join('') +
      '</div>' +
      `<div class="pt-lv-desc">${esc(isEn() ? cur.dEn : cur.dKo)}</div>` +
    '</div>'
  );
}

async function drawReading() {
  await rdNeed();
  /* 다시 그리면 밑줄 친 낱말이 새것으로 바뀐다. 말풍선을 열어 둔 채로
     두면 없어진 낱말을 가리키고 있게 된다. */
  rdGClose();
  $('rdLen').innerHTML = rdLenSwitch();
  $('rdLevel').innerHTML = renderLevelSwitch('reading');
  $('rdIntro').textContent = t(
    '글을 읽고, 무슨 이야기였는지 자기 말로 써 보세요. 다 쓰면 무엇을 짚었고 무엇을 놓쳤는지 알려 드립니다. 영어 뜻은 답을 낸 뒤에 펼 수 있어요. 글 속에 밑줄 친 곳은 문법이니 눌러 보세요.',
    'Read the passage, then write what it said in your own words. Once you answer, you will see what you caught and what you missed. The English is there afterwards. The underlined bits are grammar — tap one.');

  const rows = rdRows();
  const done = rdDoneRead();
  const solved = rows.filter((r) => done[r.id] != null);
  const avg = solved.length ? Math.round(solved.reduce((a, r) => a + done[r.id], 0) / solved.length) : 0;
  $('rdSummary').innerHTML = renderLearnSummary([
    { k: t('지문', 'Passages'), v: rows.length, s: t('이 칸에 있는 글', 'Passages in this bucket') },
    { k: t('푼 것', 'Done'), v: solved.length, s: `${rows.length} ${t('편 가운데', 'in this bucket')}` },
    { k: t('평균', 'Average'), v: solved.length ? `${avg}점` : '—', s: t('푼 글의 내용 점수', 'Content score on what you did') },
  ]);

  const box = $('rdList');
  box.textContent = '';
  if (!rows.length) {
    box.innerHTML = `<div class="learn-empty">${esc(t('이 칸은 곧 채울게요.', 'This bucket is coming soon.'))}</div>`;
    return;
  }
  rows.forEach((r) => box.appendChild(rdCard(r, done[r.id])));
}

function rdCard(r, score) {
  const card = document.createElement('div');
  card.className = 'rd-card' + (rdOpen === r.id ? ' on' : '');

  const head = document.createElement('button');
  head.type = 'button';
  head.className = 'rd-head';
  head.setAttribute('aria-expanded', rdOpen === r.id ? 'true' : 'false');
  head.innerHTML =
    '<div class="rd-head-l">' +
      `<div class="rd-title">${esc(r.title)}</div>` +
      `<div class="rd-peek">${esc(r.passage.slice(0, 46))}…</div>` +
    '</div>' +
    (score != null ? `<span class="rd-score-chip">${score}${esc(t('점', ''))}</span>` : '') +
    `<span class="rd-caret" aria-hidden="true">${rdOpen === r.id ? '▴' : '▾'}</span>`;
  head.addEventListener('click', async () => {
    /* 아코디언이다 — 한 번에 하나만 편다. 여럿이 펼쳐져 있으면 어느
       칸에 쓰고 있는지 헷갈리고, 긴 글에서는 화면이 통째로 흐른다. */
    rdOpen = rdOpen === r.id ? null : r.id;
    /* **기다려야 한다.** 아래에서 갓 그려진 카드를 찾아 굴리는데,
       drawReading 이 지문을 받아 오느라 늦어질 수 있어서 안 기다리면
       옛 카드를 집는다. 지문이 이미 와 있으면 이 await 는 한 틱이다. */
    await drawReading();
    if (rdOpen === r.id) {
      const el = [...document.querySelectorAll('.rd-card')].find((c) => c.classList.contains('on'));
      el?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });
  card.appendChild(head);

  if (rdOpen !== r.id) return card;

  const body = document.createElement('div');
  body.className = 'rd-body';

  const p = document.createElement('p');
  p.className = 'rd-passage';
  rdGrammarify(p, r.passage);
  body.appendChild(p);

  /* 지문을 소리로도 들을 수 있게. 녹음된 MP3 는 없지만 say() 가 조용히
     Web Speech 로 넘어가므로 문제없다 — 코스 블록의 「다시 듣기」와 같다. */
  const listen = document.createElement('button');
  listen.type = 'button';
  listen.className = 'rd-say';
  listen.dataset.say = r.passage;
  listen.textContent = `🔊 ${t('지문 듣기', 'Listen to the passage')}`;
  body.appendChild(listen);
  body.addEventListener('click', (ev) => {
    const s = ev.target.closest('[data-say]');
    if (s) say(s.dataset.say, s.dataset.audio);
  });

  /* 낱말 풀이. 사전을 따로 켜지 않게 하려는 것이라 지문 바로 아래 둔다. */
  const words = document.createElement('div');
  words.className = 'rd-words';
  for (const [w, m] of r.words) {
    const chip = document.createElement('span');
    chip.className = 'rd-word';
    chip.innerHTML = `<b>${esc(w)}</b> ${esc(m)}`;
    words.appendChild(chip);
  }
  body.appendChild(words);

  const q = document.createElement('p');
  q.className = 'rd-q';
  q.textContent = r.question;
  body.appendChild(q);

  const ta = document.createElement('textarea');
  ta.className = 'rd-input';
  ta.rows = rdLen === 'long' ? 6 : 4;
  ta.placeholder = t('여기에 한국어로 써 보세요.', 'Write here, in Korean.');
  /* 학습자가 쓴 글이다. 화면 녹화에 남을 자리가 아니다. */
  ta.setAttribute('data-clarity-mask', 'true');
  body.appendChild(ta);

  const btns = document.createElement('div');
  btns.className = 'rd-btns';
  const go = document.createElement('button');
  go.className = 'pt-next';
  go.type = 'button';
  go.textContent = t('확인하기', 'Check my answer');
  const out = document.createElement('div');
  out.className = 'rd-out hidden';
  go.addEventListener('click', () => rdGrade(r, ta.value, out, go));
  btns.appendChild(go);
  body.append(btns, out);

  card.appendChild(body);
  return card;
}

function rdGrade(r, answer, out, btn) {
  const text = String(answer || '').trim();
  if (rdFlat(text).length < 10) {
    out.classList.remove('hidden');
    out.innerHTML = `<p class="rd-msg">${esc(t('조금 더 써 보세요. 한 문장이라도 괜찮아요.', 'Write a little more — even one sentence is fine.'))}</p>`;
    return;
  }

  const marks = r.keys.map((k) => ({ ...k, ok: rdHit(text, k) }));
  const got = marks.filter((m) => m.ok).length;
  const score = Math.round((got / marks.length) * 100);
  rdDoneWrite(r.id, score);
  btn.textContent = t('다시 확인하기', 'Check again');

  /* 카드 머리의 점수 딱지를 그 자리에서 갈아 끼운다. 목록을 통째로 다시
     그리면 지금 펼친 칸이 접히고 방금 쓴 글이 사라진다 — 점수 하나
     보이자고 학습자가 쓴 것을 지울 수는 없다. */
  const head = out.closest('.rd-card')?.querySelector('.rd-head');
  if (head) {
    let chip = head.querySelector('.rd-score-chip');
    if (!chip) {
      chip = document.createElement('span');
      chip.className = 'rd-score-chip';
      head.insertBefore(chip, head.querySelector('.rd-caret'));
    }
    chip.textContent = `${rdDoneRead()[r.id]}${t('점', '')}`;
  }

  const band = score >= 80 ? 'good' : score >= 50 ? 'mid' : 'low';
  const line = score >= 80 ? t('잘 읽으셨어요.', 'You read it well.')
    : score >= 50 ? t('큰 줄기는 잡으셨어요.', 'You got the main thread.')
    : t('한 번 더 읽어 볼까요?', 'Want to read it once more?');

  out.classList.remove('hidden');
  out.textContent = '';

  /* 점수. 이름을 「내용 점수」라고 정확히 부른다 — 맥락을 잰 것이 아니라
     짚어야 할 것을 몇 개 짚었는지를 센 값이다. */
  const top = document.createElement('div');
  top.className = `rd-score ${band}`;
  top.innerHTML =
    `<div class="rd-score-n">${score}</div>` +
    `<div class="rd-score-t"><b>${esc(t('내용 점수', 'Content score'))}</b>` +
    `<span>${esc(t(`짚어야 할 ${marks.length}가지 가운데 ${got}가지 — ${line}`,
                    `${got} of ${marks.length} points — ${line}`))}</span></div>`;
  out.appendChild(top);

  const list = document.createElement('div');
  list.className = 'rd-marks';
  for (const m of marks) {
    const row = document.createElement('div');
    row.className = 'rd-mark' + (m.ok ? ' ok' : '');
    row.innerHTML = `<span class="rd-mark-i" aria-hidden="true">${m.ok ? '✓' : '·'}</span>` +
      `<span>${esc(m.why)}</span>`;
    row.querySelector('.rd-mark-i').setAttribute('aria-label', m.ok ? t('짚음', 'caught') : t('안 보임', 'not found'));
    list.appendChild(row);
  }
  out.appendChild(list);

  /* 같은 뜻을 다른 말로 쓴 사람을 틀렸다고 하면 안 된다. 이 줄이 없으면
     점수가 판결처럼 보인다. */
  const note = document.createElement('p');
  note.className = 'rd-note';
  note.textContent = t(
    '이 점수는 「짚어야 할 것을 몇 개 썼나」를 센 것입니다. 다르게 썼다고 틀린 게 아니니, 아래 모범 답안과 나란히 놓고 견줘 보세요.',
    'This counts how many of the points you mentioned. Saying it differently is not wrong — compare with the model answer below.');
  out.appendChild(note);

  out.appendChild(rdFold(t('모범 답안', 'Model answer'), r.model, true));
  /* 영어는 여기서 처음 열린다. 답을 내기 전에 보이면 읽기 연습이 아니라
     번역문 읽기가 된다. */
  out.appendChild(rdFold(t('영어로 대조하기', 'Compare with the English'), r.en, false));
}

/* 접었다 펴는 칸. 모범 답안은 펴 두고, 영어는 접어 둔다 — 영어를 먼저
   보면 자기 답을 스스로 견줄 기회가 사라진다. */
function rdFold(title, text, open) {
  const wrap = document.createElement('div');
  wrap.className = 'rd-fold';
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'rd-fold-h';
  const body = document.createElement('p');
  body.className = 'rd-fold-b';
  body.textContent = text;
  const sync = () => {
    b.innerHTML = `${esc(title)}<span aria-hidden="true">${open ? '▴' : '▾'}</span>`;
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.classList.toggle('hidden', !open);
  };
  b.addEventListener('click', () => { open = !open; sync(); });
  sync();
  wrap.append(b, body);
  return wrap;
}

/* ── 갈래 사용법 안내 ──────────────────────────────────────────
   갈래마다 「무엇을 하는 곳이고 어떻게 쓰는지」를 세 걸음으로 적는다.

   **처음 한 번만 저절로 뜬다.** 들어올 때마다 띄우면 세 번째 방문쯤에는
   읽지 않고 닫는 단추가 되고, 그러면 정작 처음 온 사람도 그렇게 배운다.
   대신 제목 옆 ? 를 남겨 언제든 다시 볼 수 있게 한다.

   걸음은 셋까지만 쓴다. 넷을 넘으면 첫 화면에 스크롤이 생기는데, 안내를
   스크롤해 가며 읽는 사람은 없다. 꼭 짚어야 하는데 걸음이 아닌 것(모의고사를
   도중에 나가면 기록이 안 남는다 같은 것)은 warn 에 따로 적는다. */
const GUIDES = {
  courses: {
    emoji: '📚',
    steps: [
      { ko: ['순서대로 따라가기', '한글 읽기부터 문장 만들기까지 차례가 정해져 있어요. 처음이라면 맨 위 코스부터 시작하세요.'],
        en: ['Follow the order', 'Courses run from reading Hangul to building sentences. If you are new, start with the first one.'] },
      { ko: ['읽고 그 자리에서 풀기', '레슨 하나 안에 설명과 문제가 같이 있어요. 읽은 것을 바로 확인합니다.'],
        en: ['Read, then try it', 'Each lesson keeps the explanation and the questions in one place.'] },
      { ko: ['하루씩 쌓여요', '끝낸 레슨은 기록에 남고, 며칠을 이어서 했는지 세어 줍니다.'],
        en: ['Your days add up', 'Finished lessons are saved, and we count how many days in a row you keep going.'] },
    ],
  },
  topik: {
    emoji: '📖',
    steps: [
      { ko: ['시험과 급수를 먼저', 'TOPIK I(1·2급)과 TOPIK II(3~6급 수준) 중에서 고르고, 풀 급수를 정하세요.'],
        en: ['Pick the exam and level first', 'TOPIK I (levels 1–2) or TOPIK II (levels 3–6), then the level you want to practise.'] },
      { ko: ['연습은 바로 해설, 모의고사는 끝나고 성적표', '「전체 풀기」와 유형별 연습은 문제마다 왜 그런지 바로 알려 줘요. 「모의고사 한 회」는 시간을 재고, 다 풀어야 성적표가 나옵니다.'],
        en: ['Practice explains as you go — the mock waits', 'Full run and the per-type drills tell you why right away. The full mock is timed and only shows the result sheet at the end.'] },
      { ko: ['모르는 낱말은 짚어 두세요', '지문에서 고른 말이 뜻과 함께 단어장으로 갑니다. 「아침을」은 「아침」으로 다듬고, 「마실 수 있어요」는 「마시다」와 「-ㄹ 수 있어요」로 나눠 담을 수 있어요.'],
        en: ['Mark the words you do not know', 'Picked words go to your wordbook with their meaning — and you can trim, split or reword them first.'] },
    ],
    warn: { ko: '⚠️ 모의고사를 푸는 동안에는 화면을 떠나지 마세요. 나가면 지금까지 푼 것이 기록에 남지 않아요.',
            en: '⚠️ Do not leave the screen during a mock exam — what you have answered so far will not be saved.' },
  },
  reading: {
    emoji: '📝',
    steps: [
      { ko: ['글을 하나 고르기', '길지 않은 글이에요. 끝까지 한 번 읽으세요. 밑줄 친 곳은 문법이니 눌러 보세요.'],
        en: ['Pick a passage', 'They are short. Read one all the way through — the underlined bits are grammar, so tap one.'] },
      { ko: ['자기 말로 다시 쓰기', '외운 문장이 아니라, 이해한 것을 자기 말로 적어 봅니다.'],
        en: ['Say it back in your own words', 'Not a memorised sentence — what you actually understood.'] },
      { ko: ['짚은 것과 놓친 것', '무엇을 맞게 짚었고 무엇을 놓쳤는지 바로 알려 줘요.'],
        en: ['What you caught, what you missed', 'You see both right away.'] },
    ],
  },
  sentence: {
    emoji: '✍️',
    steps: [
      { ko: ['단계와 표현 고르기', '초급·중급·고급 중에서 고르고 갈래에서 표현을 찾으세요. 73갈래에 290개가 있어요.'],
        en: ['Pick a level, then a grammar point', 'Beginner, intermediate or advanced — 290 points across 73 groups.'] },
      { ko: ['뜻과 대화문 읽기', '표현마다 뜻풀이·형태·주의할 점·예문이 있고, 🧀와 🥔의 대화로도 볼 수 있어요.'],
        en: ['Read the meaning and the dialogue', 'Every point has its meaning, form, what to watch out for, examples — and a short 🧀 / 🥔 conversation.'] },
      { ko: ['내 문장 올리기', '읽고 끝내지 말고 한 문장 써 보세요. 다른 사람이 쓴 문장도 같이 보입니다.'],
        en: ['Write your own', 'Do not just read it — post one sentence. You will see what others wrote too.'] },
    ],
  },
};

const guideKey = (id) => `cp-guide-${id}`;
/* localStorage 를 막아 둔 브라우저에서는 「이미 봤다」로 친다. 못 적는데도
   띄우면 들어올 때마다 같은 안내가 뜨는데, 그건 안내가 아니라 방해다. */
const guideSeen = (id) => { try { return localStorage.getItem(guideKey(id)) === '1'; } catch { return true; } };
const guideMark = (id) => { try { localStorage.setItem(guideKey(id), '1'); } catch { /* 못 적어도 그만 */ } };

let guideOpen = null;

function drawGuide(id) {
  const g = GUIDES[id];
  const s = LEARN_SECTIONS.find((x) => x.id === id);
  if (!g || !s) return;
  const pick = (o) => (isEn() ? o.en : o.ko);
  $('cgCard').innerHTML =
    `<div class="cg-emoji" aria-hidden="true">${g.emoji}</div>` +
    `<h3 class="cg-t" id="cgTitle">${esc(secTx(s.title))}</h3>` +
    `<p class="cg-s">${esc(secTx(s.tag))}</p>` +
    '<div class="cg-steps">' +
      g.steps.map((st, i) => {
        const [head, body] = pick(st);
        return '<div class="cg-step">' +
          `<span class="cg-step-n" aria-hidden="true">${i + 1}</span>` +
          `<span><b class="cg-step-b">${esc(head)}</b><span class="cg-step-x">${esc(body)}</span></span>` +
        '</div>';
      }).join('') +
    '</div>' +
    (g.warn ? `<div class="cg-warn">${esc(pick(g.warn))}</div>` : '') +
    `<button class="cg-go" id="cgGo" type="button">${t('알겠어요, 시작할게요', 'Got it — let’s start')}</button>`;
}

function showGuide(id) {
  if (!GUIDES[id]) return;
  guideOpen = id;
  drawGuide(id);
  $('cgWrap').classList.remove('hidden');
  $('cgGo')?.focus();
}

/* 닫는 순간에 「봤다」로 적는다. 열자마자 적으면, 띄워 놓고 아무것도 안 한
   채 새로고침한 사람이 안내를 영영 못 보게 된다. */
function closeGuide() {
  if (!guideOpen) return;
  guideMark(guideOpen);
  guideOpen = null;
  $('cgWrap').classList.add('hidden');
}

$('cgWrap').addEventListener('click', (ev) => {
  // 카드 밖(어두운 바탕)을 눌렀거나, 「알겠어요」를 눌렀을 때
  if (ev.target === $('cgWrap') || ev.target.closest('#cgGo')) closeGuide();
});
/* Escape 는 app.js 가 메뉴 닫기에도 쓴다. 안내가 열려 있을 때만 가로채고,
   그때는 뒤쪽 메뉴까지 같이 닫히지 않도록 여기서 멈춘다. */
addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape' || !guideOpen) return;
  ev.stopPropagation();
  closeGuide();
}, true);
$('lsecHelp').addEventListener('click', () => { if (lsecOpen) showGuide(lsecOpen); });

/* quiet — 사용법을 띄우지 않는다. 남이 보낸 주소로 표현 하나를 콕 집어
   들어온 때에 쓴다. 그 표현을 보러 온 사람 앞을 안내가 가로막으면
   안내가 아니라 문지기가 된다. */
function openSection(id, quiet) {
  const s = LEARN_SECTIONS.find((x) => x.id === id);
  if (!s) return;
  /* 이미 열려 있는 갈래를 다시 여는 경우가 있다 — 언어를 바꾸면 syncLang 이
     openSection(lsecOpen) 을 부른다. 그때 속까지 새로 그리면 풀던 판이나
     성적표가 사라지고 갈래 첫 화면으로 튕긴다. 실제로 모의고사 성적표를
     띄워 놓고 EN 을 누르면 성적이 통째로 날아갔다.
     글자는 갈래마다 …SyncLang 이 따로 맞춰 주므로 여기서 다시 그릴 까닭이 없다. */
  const already = lsecOpen === s.id;
  lsecOpen = s.id;
  /* 갈래도 주소에 남긴다. 안 남기면 새로고침했을 때 갈래 목록으로 튕기고,
     뒤로 가기가 배우기를 통째로 빠져나간다. */
  window.cpMark('learn', s.id);
  $('lsecList').classList.add('hidden');
  $('lsecWrap').classList.remove('hidden');
  $('lsecTitle').textContent = secTx(s.title);
  /* 갈래 속은 전부 닫고 이 갈래 것만 연다. 목록을 훑어서 닫는 이유는
     갈래를 늘릴 때 여기 한 줄을 빠뜨리면 예전 갈래가 새 갈래 위에
     겹쳐 남기 때문이다. */
  /* 갈래를 옮기면 듣던 소리를 끊는다. 안 끊으면 코스 화면으로 가 있는데
     TOPIK 듣기 대화가 계속 흘러나온다. */
  tlStop();
  LEARN_SECTIONS.forEach((x) => { if (x.pane) $(x.pane).classList.add('hidden'); });
  $('lsecSoon').classList.add('hidden');
  if (s.ready && s.pane) {
    $(s.pane).classList.remove('hidden');
    if (!already) {
      if (s.id === 'courses') drawCourses();
      /* TOPIK 은 갈래(듣기·읽기·쓰기)를 거쳐 들어간다. quiet 을 넘기는 이유 —
         openSection 이 이미 주소를 찍었는데 여기서 또 찍으면 뒤로 가기가
         한 칸 더 생겨서 한 번 눌러도 안 빠져나간다. */
      if (s.id === 'topik') tqShowSkill(true);
      if (s.id === 'quiz') dqDraw();
      if (s.id === 'reading') drawReading();
      if (s.id === 'sentence') {
        drawSentenceHead();
        const cur = sbPoint ? sbFind(sbPoint) : null;
        sbShow(cur && sentenceTier(cur) === learnLv.sentence ? sbPoint : null);
      }
    }
  } else {
    $('lsecSoonTxt').textContent = t('이 갈래는 아직 준비 중이에요. 곧 채울게요.',
                                     'This one is not ready yet. Coming soon.');
    $('lsecSoon').classList.remove('hidden');
  }
  /* ? 는 사용법이 있는 갈래에서만 보인다. */
  $('lsecHelp').classList.toggle('hidden', !GUIDES[s.id]);
  /* 처음 여는 갈래면 사용법을 한 번 띄운다. already 를 빼는 이유는
     openSection 이 언어 전환 때도 불리기 때문이다 — EN 을 눌렀다고
     안내가 다시 뜨면 이상하다. */
  if (!already && !quiet && s.ready && !guideSeen(s.id)) showGuide(s.id);
}

/* 레슨에서 나올 때 가는 자리. 갈래가 생기기 전에는 그냥 코스 목록이었다.
   이제는 코스 갈래를 먼저 열어야 카드가 보인다 — 세 곳(✕ · 끝냄 · 이어하기)이
   같은 길로 나와야 한 곳만 고치고 다른 데가 죽는 일이 없다. */
/* 주소에 적힌 배우기 속 자리를 연다.
   `topik` · `sentence` · `sentence/23-1` 꼴을 받는다.

   표현 하나까지 여는 이유 — 문법 표현 쪽은 남에게 건네고 싶어지는 자리다.
   「-길래 설명 여기 있어」 하고 주소를 보냈는데 목록만 열리면 못 쓴다. */
function openLearnSub(sub) {
  let [secId, ...rest] = String(sub).split('/');

  /* 옛 주소 #learn/writing 을 새 자리로 넘긴다. 쓰기가 별도 갈래였을 때
     찍은 정적 쪽과 밖에서 걸린 링크가 그 주소를 쓰고 있어서, 죽이면
     검색으로 들어온 사람이 빈 화면을 본다. */
  if (secId === 'writing') { secId = 'topik'; rest = ['II', 'writing']; }

  if (!LEARN_SECTIONS.some((x) => x.id === secId)) return;

  /* 넘겨받은 모의고사 주소: learn/topik/mock/<시험>/<회차> */
  if (secId === 'topik' && rest[0] === 'mock' && rest[1] && rest[2]) {
    openSection('topik', true);
    tqOpenShared(rest[1], rest[2]);
    return;
  }

  /* learn/topik/<시험>/<갈래> — 시험과 갈래를 함께 지정하는 주소.
     갈래만 적힌 것(learn/topik/listening)도 받는다. */
  if (secId === 'topik' && rest.length) {
    const wantExam  = TQ_EXAMS[rest[0]] ? rest[0] : null;
    const wantSkill = TQ_SKILLS[rest[wantExam ? 1 : 0]] ? rest[wantExam ? 1 : 0] : null;
    if (wantExam || wantSkill) {
      if (wantExam && wantExam !== tqExam) {
        tqExam = wantExam;
        try { localStorage.setItem(TQ_EXAM_KEY, tqExam); } catch (e) {}
        tqLoadGrade();
      }
      /* 그 시험에 없는 갈래면 갈아 끼우지 않는다 — tqFixSkill 이 읽기로
         물러나 준다. TOPIK I 쓰기 주소를 받았을 때가 그렇다. */
      if (wantSkill && tqSkillsFor(tqExam).includes(wantSkill)) tqSkill = wantSkill;
      openSection('topik', true);
      tqShowSkill(true);
      return;
    }
  }
  /* 표현 없이 갈래만 적힌 주소면 열려 있던 표현을 놓는다. 안 놓으면
     openSection 이 「직전에 보던 표현」을 되살려서, 상세에서 뒤로 가기를
     눌러도 같은 상세가 다시 열린다. */
  if (secId === 'sentence' && !rest[0]) sbPoint = null;
  openSection(secId, !!rest[0]);
  if (secId !== 'sentence' || !rest[0]) return;
  const p = sbFind(rest[0]);
  if (!p) return;
  /* 표현마다 단계가 다르다. 단계를 안 맞추면 sbDrawDetail 이 「이 단계 것이
     아니다」로 보고 목록으로 되돌린다. */
  learnLv.sentence = sentenceTier(p);
  drawSentenceHead();
  sbShow(p.id);
}

function backToCourses() {
  open('learn');
  openSection('courses');
  if (lsCourse) openCourse(lsCourse);
}

function backToSections() {
  lsecOpen = null;
  window.cpMark('learn');
  $('lsecWrap').classList.add('hidden');
  $('llWrap').classList.add('hidden');
  $('lsecList').classList.remove('hidden');
  drawSections();
}

$('tqHandoff')?.addEventListener('click', tqShareCopy);

$('lsecList').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-section]');
  if (b) openSection(b.dataset.section);
});
$('lsecBack').addEventListener('click', () => {
  if (window.cpBlockLeave?.()) return;
  backToSections();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
$('lsecWrap').addEventListener('change', (ev) => {
  const r = ev.target.closest('[data-learn-section][data-learn-level]');
  if (!r) return;
  const section = r.dataset.learnSection;
  const level = r.dataset.learnLevel;
  if (!LEARN_LEVELS.some((lv) => lv.id === level)) return;
  learnLv[section] = level;
  if (section === 'courses') {
    lsCourse = null;
    $('llWrap').classList.add('hidden');
    drawCourses();
  } else if (section === 'writing') {
    // 급을 바꾸면 열어 둔 문항은 다른 급 것이라 놓는다
    twStopClock(); twItem = null;
    twDraw();
  } else if (section === 'quiz') {
    /* 급을 바꾸면 시작 화면으로 되돌린다. 다른 급의 문제를 풀던 중이면
       남은 문제가 그 급 것이라 섞이기 때문이다. */
    dqDraw();
  } else if (section === 'sentence') {
    drawSentenceHead();
    const cur = sbPoint ? sbFind(sbPoint) : null;
    if (cur && sentenceTier(cur) !== level) sbPoint = null;
    sbShow(sbPoint);
  } else if (section === 'reading') {
    /* 급수를 바꾸면 펼쳐 둔 글은 다른 칸의 것이라 닫는다. 안 닫으면
       초급을 골랐는데 고급 지문이 펼쳐진 채로 남는다. */
    rdOpen = null;
    drawReading();
  }
});

/* 글 길이 고르개. 급수와 달리 읽기에만 있어서 따로 받는다. */
$('lsecWrap').addEventListener('change', (ev) => {
  const r = ev.target.closest('[data-rd-len]');
  if (!r) return;
  if (!RD_LENS.some((x) => x.id === r.dataset.rdLen)) return;
  rdLen = r.dataset.rdLen;
  rdOpen = null;
  drawReading();
});

/* ══ 예문 게시판 ═══════════════════════════════════════════════
   문법 표현 하나를 고르면 뜻과 선생님 예문을 보여 주고, 그 아래에서
   자기 예문을 올린다. 자료는 sentences.js 에 있다.

   **글은 이 브라우저에만 쌓인다.** 서버에 올리면 다른 학생 글도 보이지만
   그러려면 표를 새로 만들고 신고·숨김을 어떻게 할지부터 정해야 한다
   (자동 숨김은 안 한다는 결정이 이미 있다). 그건 따로 정할 일이라
   여기서는 아티팩트와 같이 localStorage 에만 둔다. 지우면 사라진다는 걸
   화면에 적어 둔다 — 안 적으면 사라졌을 때 버그로 읽힌다. */
const SB_KEY = 'cp-sentences-v1';
/* replies 는 원글 key 로 묶는다(표현 id 가 아니라). 씨앗 글의 key 는
   `${표현id}~s${순번}` 으로 고정이라 씨앗에 단 답장도 그대로 살아남는다. */
let sbStore = { name: '', mine: {}, likes: {}, replies: {} };
let sbPoint = null;   // 지금 열어 둔 표현. null 이면 목록.
let sbSort = 'new';
/* 상세는 무슨 일이 있어도 통째로 다시 그린다. 쓰던 글을 상태에 담아 두지
   않으면 남의 글에 ♥ 를 누르는 순간 내가 쓰던 문장이 날아간다. */
let sbReplyTo = null;   // 답장 칸을 연 원글 key
let sbDraft = '', sbReplyDraft = '';

const SB_POINTS = SB_CATS.flatMap((c) => c.points.map((p) => ({ ...p, cat: c })));
const sbFind = (id) => SB_POINTS.find((p) => p.id === id);

function sbLoad() {
  try { Object.assign(sbStore, JSON.parse(localStorage.getItem(SB_KEY) || '{}')); } catch (e) {}
  sbStore.mine = sbStore.mine || {};
  sbStore.likes = sbStore.likes || {};
  // 답장은 나중에 붙었다. 예전 브라우저에 남은 저장본에는 이 칸이 없다.
  sbStore.replies = sbStore.replies || {};
}
function sbSave() {
  try { localStorage.setItem(SB_KEY, JSON.stringify(sbStore)); } catch (e) {}
}
sbLoad();

// 올린 지 얼마나 됐는지. 씨앗 글은 처음부터 글로 적혀 있어 그대로 쓴다.
function sbAgo(at) {
  const d = (Date.now() - at) / 1000;
  if (d < 60) return t('방금', 'just now');
  if (d < 3600) return t(`${Math.floor(d / 60)}분 전`, `${Math.floor(d / 60)} min ago`);
  if (d < 86400) return t(`${Math.floor(d / 3600)}시간 전`, `${Math.floor(d / 3600)} h ago`);
  return t(`${Math.floor(d / 86400)}일 전`, `${Math.floor(d / 86400)} d ago`);
}

function sbPosts(id) {
  const seed = (SB_SEED[id] || []).map((s, i) => ({
    key: `${id}~s${i}`, by: s[0], text: s[1], base: s[2], when: s[3], at: 0, mine: false,
  }));
  const mine = (sbStore.mine[id] || []).map((p) => ({
    key: p.key, by: p.by, text: p.text, base: 0, when: null, at: p.at, mine: true,
  }));
  const all = seed.concat(mine).map((p) => ({ ...p, likes: p.base + (sbStore.likes[p.key] ? 1 : 0) }));
  return sbSort === 'top'
    ? all.slice().sort((a, b) => b.likes - a.likes || b.at - a.at)
    : all.slice().sort((a, b) => b.at - a.at);   // 씨앗(at=0)은 뒤로 간다
}
const sbCount = (id) => (SB_SEED[id] || []).length + (sbStore.mine[id] || []).length;

/* 답장은 언제나 쓴 순서대로 본다. 위쪽 정렬(최신순·좋아요순)은 원글에만
   건다 — 대화가 거꾸로 뒤집히면 무슨 말에 대한 답인지 못 읽는다. */
const sbReplies = (key) => (sbStore.replies[key] || []).slice().sort((a, b) => a.at - b.at);

/* 다시 그리기 전에 화면에 있던 초안을 상태로 걷어 온다. sbDrawDetail 이
   어디서 불리든 거치므로 초안을 잃는 길이 없다. */
function sbKeepDrafts() {
  const ta = $('sbText'); if (ta) sbDraft = ta.value;
  const rt = $('sbReplyText'); if (rt) sbReplyDraft = rt.value;
  const nm = $('sbName'); if (nm && nm.value.trim()) sbStore.name = nm.value.trim();
}
/* 초안을 버릴 때는 화면의 칸도 같이 비운다. 상태만 비우면 바로 뒤에 도는
   sbKeepDrafts 가 아직 글이 남아 있는 칸을 도로 읽어 와 되살린다. */
function sbDropDraft(which) {
  if (which !== 'reply') { sbDraft = ''; const a = $('sbText'); if (a) a.value = ''; }
  if (which !== 'post') { sbReplyDraft = ''; const b = $('sbReplyText'); if (b) b.value = ''; }
}

function sbDrawList() {
  drawSentenceHead();
  $('sbQ').placeholder = t('문법 표현 검색 — 「-길래」, 이유, 추측…',
                           'Search a grammar point — meaning or form');
  const q = ($('sbQ').value || '').trim().toLowerCase();
  const level = learnLv.sentence;
  /* 갈래 이름도 검색에 넣는다 — 학생은 「-길래」가 아니라 "이유" 로 찾는다.
     갈래는 인자로 받는다. SB_CATS 안의 점에는 갈래가 안 달려 있다
     (달린 건 SB_POINTS 쪽이다). 여기서 p.cat 을 보면 조용히 터진다. */
  const hit = (p, c) => !q ||
    p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) ||
    /* 영어 화면에서는 영어 설명으로도 찾을 수 있어야 한다 — 화면에 영어가
       보이는데 그 말로 못 찾으면 검색이 고장 난 것처럼 보인다. */
    Object.values(GRAMMAR_EN[p.id] || {}).join(' ').toLowerCase().includes(q) ||
    p.ex.toLowerCase().includes(q) ||
    (SB_MORE[p.id] || []).join(' ').toLowerCase().includes(q) ||
    (isEn() ? c.en : c.ko).toLowerCase().includes(q);

  /* 검색어가 없으면(그냥 훑어보는 중) 지금 고른 단계만 보여준다 —
     그건 원래도 그래야 한다(학습 단계 구분).

     검색어가 있으면 **단계를 가리지 않고 전부** 찾는다. 예전에는 검색도
     지금 단계 안에서만 돌아서, 「-게 되다」처럼 같은 이름이 초급·중급
     둘에 걸쳐 있는 표현을 고급 탭에서 찾으면 안 나왔다 — 이름은 하나도
     안 맞는데 자주 함께 쓰는 말 칸에 그 글자가 우연히 섞인 딴 표현만
     뜨고, 정작 찾던 건 "찾는 표현이 없어요"에 가려졌다. 검색은 찾는
     행위지 그 단계를 훑는 행위가 아니므로, 검색 중에는 단계 구분을
     걷어낸다. */
  const html = SB_CATS.map((c) => {
    const pts = c.points.filter((p) => (q || sentenceTier(p) === level) && hit(p, c));
    if (!pts.length) return '';
    return (
      '<div class="sb-cat">' +
        '<div class="sb-cat-h">' +
          /* 화면에 보이는 번호는 c.no — 그 단계 교육과정의 제 번호다.
             c.id 는 학생 글을 묶는 열쇠라 단계를 넘어 안 겹치게 이어 붙이므로
             (초급이 23번부터 시작한다) 그대로 보이면 「23. 시제」가 된다. */
          `<span class="sb-cat-n">${c.no ?? c.id}</span>` +
          (c.emoji ? `<span class="sb-cat-emoji" aria-hidden="true">${c.emoji}</span>` : '') +
          `<span class="sb-cat-t">${esc(isEn() ? c.en : c.ko)}</span>` +
        '</div>' +
        '<div class="sb-pts">' +
          pts.map((p) => {
            const n = sbCount(p.id);
            // 검색 중에 지금 보던 단계가 아닌 것이 섞이면, 어느 단계 것인지 적어 준다.
            const otherLv = q && sentenceTier(p) !== level;
            return `<button class="sb-pt" data-pt="${p.id}">` +
              `<span class="sb-pt-name">${esc(p.name)}</span>` +
              (otherLv ? `<span class="sb-pt-lv">${esc(learnLevelText(sentenceTier(p)))}</span>` : '') +
              (n ? `<span class="sb-pt-n">${n}</span>` : '') +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>'
    );
  }).join('');

  /* 비었을 때 이유가 둘이다. 찾는 말이 없는 것과, 그 단계를 아직 안 채운
     것은 다른 일인데 한 문장으로 뭉치면 학생이 제 검색어를 의심한다. */
  $('sbCats').innerHTML = html || (q
    ? `<p class="sb-none">${t('찾는 표현이 없어요.', 'No grammar point matches that.')}</p>`
    : `<div class="learn-empty">${esc(t('이 단계 표현은 아직 채우는 중이에요.',
                                        'Grammar points for this level are still being filled in.'))}</div>`);
}

function sbDrawDetail() {
  const p = sbPoint && sbFind(sbPoint);
  if (!p) return;
  if (sentenceTier(p) !== learnLv.sentence) { sbShow(null); return; }
  sbKeepDrafts();
  const more = SB_MORE[p.id] || ['', '', '', ''];
  const posts = sbPosts(p.id);
  // 답장 칸을 열어 둔 원글이 사라졌으면(지웠거나 정렬이 바뀌었거나) 닫는다.
  if (sbReplyTo && !posts.some((o) => o.key === sbReplyTo)) { sbReplyTo = null; sbReplyDraft = ''; }

  $('sbDetail').innerHTML =
    `<button class="wb-out" id="sbBack" type="button">← ${t('표현 목록', 'All grammar points')}</button>` +
    '<div class="sb-head" style="margin-top:16px;">' +
      (p.cat.emoji ? `<div class="sb-head-emoji" aria-hidden="true">${p.cat.emoji}</div>` : '') +
      `<div class="sb-head-cat">${esc(isEn() ? p.cat.en : p.cat.ko)}</div>` +
      `<div class="sb-head-name">${esc(p.name)}</div>` +
      `<p class="sb-desc">${esc(gTx(p.id, 'desc', p.desc))}</p>` +
    '</div>' +
    '<div class="sb-facts">' +
      `<div class="sb-fact"><div class="sb-fact-k">${t('형태', 'Form')}</div><div class="sb-fact-v">${esc(gTx(p.id, 'form', more[0]))}</div></div>` +
      `<div class="sb-fact"><div class="sb-fact-k">${t('자주 함께 쓰는 말', 'Often paired with')}</div><div class="sb-fact-v">${esc(more[1])}</div></div>` +
      `<div class="sb-fact"><div class="sb-fact-k">${t('주의할 점', 'Watch out')}</div><div class="sb-fact-v">${esc(gTx(p.id, 'care', more[2]))}</div></div>` +
    '</div>' +
    '<div class="sb-exs">' +
      `<div class="sb-ex">${esc(p.ex)}</div>` +
      (more[3] ? `<div class="sb-ex">${esc(more[3])}</div>` : '') +
    '</div>' +
    /* 대화문. 단문 예문 하나로는 그 표현이 실제 대화에서 어떻게 오가는지
       안 보인다. p.dlg 는 "A: …" / "B: …" 로 시작하는 2~3줄짜리 배열이고,
       없는 표현(아직 대화문을 안 붙인 초급·중급)은 통째로 건너뛴다. */
    (p.dlg && p.dlg.length ?
      '<div class="sb-dlg">' +
        `<div class="sb-dlg-h">${t('대화로 보기', 'In conversation')}</div>` +
        '<div class="sb-dlg-body">' +
          p.dlg.map((line) => {
            /* 자료에는 A/B 로 적혀 있지만 화면에는 치즈와 감자가 선다.
               남녀를 그리지 않아도 두 사람인 것이 보이고, 사이트의 두
               캐릭터가 그대로 말하는 이가 된다. */
            const m = /^([AB]):\s*(.+)$/.exec(line);
            const who = m ? m[1] : 'A';
            const txt = m ? m[2] : line;
            return `<div class="sb-dlg-line ${who === 'A' ? 'a' : 'b'}">` +
              `<span class="sb-dlg-who" aria-hidden="true">${who === 'A' ? '🧀' : '🥔'}</span>` +
              `<span class="sb-dlg-bubble">${esc(txt)}</span>` +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>'
      : '') +

    '<div class="sb-board">' +
      '<div class="sb-board-h">' +
        `<span class="sb-board-t">${t('우리가 만든 예문', 'Sentences we wrote')} ${posts.length}</span>` +
        '<div class="diff-seg" role="radiogroup">' +
          `<label><input type="radio" name="sbSort" value="new"${sbSort === 'new' ? ' checked' : ''}><span>${t('최신순', 'Newest')}</span></label>` +
          `<label><input type="radio" name="sbSort" value="top"${sbSort === 'top' ? ' checked' : ''}><span>${t('좋아요순', 'Most liked')}</span></label>` +
        '</div>' +
      '</div>' +

      '<div class="sb-posts">' +
        (posts.length ? posts.map((o) => {
          const reps = sbReplies(o.key);
          const open = sbReplyTo === o.key;
          return (
            /* 내가 쓴 글만 녹화에서 가린다. 씨앗 글은 우리가 만든 것이라
               가릴 까닭이 없고, 다 가리면 게시판이 어떻게 보이는지조차
               녹화로 확인할 수 없게 된다. */
            `<div class="sb-post"${o.mine ? ' data-clarity-mask="true"' : ''}>` +
              '<div class="sb-post-top">' +
                `<span class="sb-by">${esc(o.by)}</span>` +
                `<span class="sb-when">${esc(o.mine ? sbAgo(o.at) : o.when)}</span>` +
                (o.mine ? `<span class="sb-mine-tag">${t('내 글', 'mine')}</span>` : '') +
              '</div>' +
              `<div class="sb-text">${esc(o.text)}</div>` +
              '<div class="sb-post-bot">' +
                `<button class="sb-like${sbStore.likes[o.key] ? ' on' : ''}" data-like="${esc(o.key)}">♥ ${o.likes}</button>` +
                `<button class="sb-reply-btn" data-reply="${esc(o.key)}">` +
                  `💬 ${esc(open ? t('접기', 'Cancel') : t('답장', 'Reply'))}${reps.length ? ` ${reps.length}` : ''}` +
                '</button>' +
                (o.mine ? `<button class="sb-del" data-del="${esc(o.key)}">${t('지우기', 'Delete')}</button>` : '') +
              '</div>' +

              (reps.length ?
                '<div class="sb-replies">' +
                  reps.map((r) =>
                    '<div>' +
                      '<div class="sb-reply-top">' +
                        `<span class="sb-by">${esc(r.by)}</span>` +
                        `<span class="sb-when">${esc(sbAgo(r.at))}</span>` +
                        `<span class="sb-mine-tag">${t('내 글', 'mine')}</span>` +
                      '</div>' +
                      `<div class="sb-reply-text">${esc(r.text)}</div>` +
                      '<div class="sb-reply-bot">' +
                        `<button class="sb-del" data-delreply="${esc(r.key)}" data-parent="${esc(o.key)}">${t('지우기', 'Delete')}</button>` +
                      '</div>' +
                    '</div>').join('') +
                '</div>'
                : '') +

              (open ?
                '<div class="sb-reply-form">' +
                  `<textarea data-clarity-mask="true" id="sbReplyText" class="sb-in" rows="2" placeholder="${esc(t(`${o.by} 님 문장에 답장하기`, `Reply to ${o.by}`))}">${esc(sbReplyDraft)}</textarea>` +
                  '<div class="sb-reply-row">' +
                    `<button class="sb-reply-send" id="sbReplySend" type="button">${t('답장 올리기', 'Send reply')}</button>` +
                  '</div>' +
                '</div>'
                : '') +
            '</div>'
          );
        }).join('')
          : `<p class="sb-none">${t('아직 아무도 안 썼어요. 첫 예문을 올려 보세요.', 'Nobody has written one yet. Go first.')}</p>`) +
      '</div>' +

      '<div class="sb-write">' +
        `<textarea data-clarity-mask="true" id="sbText" class="sb-in" rows="2" placeholder="${t(`「${esc(p.name)}」로 문장을 만들어 보세요`, `Write a sentence using ${esc(p.name)}`)}">${esc(sbDraft)}</textarea>` +
        '<div class="sb-write-row">' +
          `<input data-clarity-mask="true" id="sbName" class="sb-in" type="text" maxlength="20" placeholder="${t('이름', 'Your name')}" value="${esc(sbStore.name)}">` +
          `<button class="pt-next" id="sbPost" type="button">${t('올리기', 'Post')}</button>` +
        '</div>' +
        `<p class="sb-note">${t('올린 예문은 이 브라우저에만 저장돼요. 방문 기록을 지우면 함께 사라집니다.',
                                'Your sentences stay in this browser only. Clearing site data removes them.')}</p>` +
      '</div>' +
    '</div>';
}

function sbShow(id) {
  // 표현을 갈아탈 때는 초안을 버린다. 남겨 두면 「-길래」에 쓰다 만 문장이
  // 「-더라도」 칸에 그대로 떠 있다.
  if (id !== sbPoint) { sbReplyTo = null; sbDropDraft('both'); }
  sbPoint = id;
  /* 표현 하나하나가 주소를 가진다 — 건네받은 사람이 그 표현을 바로 본다. */
  window.cpMark('learn', id ? `sentence/${id}` : 'sentence');
  $('sbBrowse').classList.toggle('hidden', !!id);
  $('sbDetail').classList.toggle('hidden', !id);
  if (id) sbDrawDetail(); else sbDrawList();
}

$('sbQ').addEventListener('input', sbDrawList);

$('sbCats').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-pt]');
  if (!b) return;
  /* 검색 결과에는 다른 단계 것도 섞여 나온다(위 sbDrawList). sbDrawDetail 은
     지금 고른 단계와 다르면 목록으로 도로 튕겨 낸다 — 그 전에 단계를
     표현이 실제로 있는 쪽으로 맞춰 둔다. */
  const p = sbFind(b.dataset.pt);
  if (!p) return;
  if (sentenceTier(p) !== learnLv.sentence) {
    learnLv.sentence = sentenceTier(p);
    drawSentenceHead();
  }
  sbShow(p.id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* 상세는 통째로 다시 그리므로 버튼마다 리스너를 달면 그릴 때마다 샌다.
   바깥 상자 하나에서 받는다. */
$('sbDetail').addEventListener('click', (ev) => {
  if (ev.target.closest('#sbBack')) { sbShow(null); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

  const like = ev.target.closest('[data-like]');
  if (like) {
    const k = like.dataset.like;
    if (sbStore.likes[k]) delete sbStore.likes[k]; else sbStore.likes[k] = 1;
    sbSave(); sbDrawDetail(); return;
  }

  // 답장 칸 열고 닫기. 같은 글을 다시 누르면 접힌다.
  const rep = ev.target.closest('[data-reply]');
  if (rep) {
    const k = rep.dataset.reply;
    sbKeepDrafts();          // 본문 칸에 쓰던 문장은 지킨다
    sbReplyTo = (sbReplyTo === k) ? null : k;
    sbDropDraft('reply');    // 답장 칸은 다른 글로 옮겨 가므로 비운다
    sbDrawDetail();
    if (sbReplyTo) $('sbReplyText')?.focus();
    return;
  }

  const delRep = ev.target.closest('[data-delreply]');
  if (delRep) {
    const parent = delRep.dataset.parent, k = delRep.dataset.delreply;
    sbStore.replies[parent] = (sbStore.replies[parent] || []).filter((r) => r.key !== k);
    if (!sbStore.replies[parent].length) delete sbStore.replies[parent];
    sbSave(); sbDrawDetail(); return;
  }

  if (ev.target.closest('#sbReplySend')) {
    const ta = $('sbReplyText'), text = (ta.value || '').trim();
    if (!text) { ta.focus(); return; }
    const by = sbStore.name || t('익명', 'Anonymous');
    sbStore.replies[sbReplyTo] = (sbStore.replies[sbReplyTo] || []).concat([
      { key: `r${Date.now()}`, by, text, at: Date.now() },
    ]);
    sbSave();
    sbReplyTo = null;          // 올렸으면 칸을 접는다
    sbDropDraft('reply');
    sbDrawDetail();
    return;
  }

  const del = ev.target.closest('[data-del]');
  if (del) {
    const k = del.dataset.del;
    sbStore.mine[sbPoint] = (sbStore.mine[sbPoint] || []).filter((p) => p.key !== k);
    // 지운 글에 눌러 둔 좋아요와 그 글에 달린 답장도 같이 지운다. 안 그러면
    // 없는 글에 매달린 것들이 저장소에 계속 쌓인다.
    delete sbStore.likes[k];
    delete sbStore.replies[k];
    sbSave(); sbDrawDetail(); return;
  }

  if (ev.target.closest('#sbPost')) {
    const ta = $('sbText'), text = (ta.value || '').trim();
    if (!text) { ta.focus(); return; }
    const by = ($('sbName').value || '').trim() || t('익명', 'Anonymous');
    sbStore.name = by;
    sbStore.mine[sbPoint] = (sbStore.mine[sbPoint] || []).concat([
      { key: `u${Date.now()}`, by, text, at: Date.now() },
    ]);
    sbSave();
    sbDropDraft('post');   // 올렸으니 초안을 비운다
    sbSort = 'new';        // 방금 올린 글이 안 보이면 안 올라간 줄 안다
    sbDrawDetail();
  }
});

$('sbDetail').addEventListener('change', (ev) => {
  const r = ev.target.closest('input[name=sbSort]');
  if (r) { sbSort = r.value; sbDrawDetail(); }
});

function drawCourses() {
  const level = learnLv.courses;
  const rows = levelCourses(level);
  const allLessons = rows.reduce((a, c) => a + c.lessons.length, 0);
  const doneLessons = rows.reduce((a, c) => a + courseDone(c), 0);
  const exCount = rows.reduce((a, c) => a + c.lessons.reduce((n, l) => n + lessonExercises(l).length, 0), 0);
  $('lcLevel').innerHTML = renderLevelSwitch('courses');
  $('lcIntro').textContent = ({
    beginner: t('읽기와 첫 문장을 가장 먼저 잡습니다. 한글, 생존 표현, 문장 뼈대를 여기서 끝냅니다.', 'Start with Hangul, survival phrases, and the bones of Korean sentences.'),
    intermediate: t('이유, 추측, 돌발 상황처럼 말맛이 달라지는 지점을 중급 코스로 묶었습니다.', 'Intermediate focuses on cause, guesswork, and the turns that make Korean feel natural.'),
    advanced: t('반응 표현, 격식, 미묘한 차이를 가르는 고급 문법을 한곳에 모았습니다.', 'Advanced gathers the grammar that separates nuance, register, and reaction.'),
  })[level];
  $('lcSummary').innerHTML = renderLearnSummary([
    { k: t('코스', 'Courses'), v: rows.length, s: t('현재 단계에서 열어 볼 길', 'Available paths in this level') },
    { k: t('레슨', 'Lessons'), v: doneLessons, s: `${allLessons} ${t('개 중 완료', 'completed total')}` },
    { k: t('문제', 'Exercises'), v: exCount, s: t('설명 속에 섞여 있는 연습 문제', 'Exercises mixed into the lessons') },
  ]);
  drawCourseRoadmap(level, rows);
  if (!rows.length) {
    $('lcList').innerHTML = `<div class="learn-empty">${esc(t('이 단계 코스는 곧 채울게요.', 'Courses for this level are coming soon.'))}</div>`;
    return;
  }
  $('lcList').innerHTML = rows.map((c) => {
    const n = courseDone(c), all = c.lessons.length;
    const pct = Math.round((n / all) * 100);
    const need = c.needs ? COURSES.find((x) => x.id === c.needs) : null;
    /* 순서는 알려 주되 막지는 않는다.
       예전에는 앞 코스를 절반 해야 다음이 열렸는데, 코스가 열한 개로 늘고
       뒤쪽 아홉 개가 한 줄로 엮이면서 화면이 자물쇠로 뒤덮였다. 그러면
       무엇을 배우는 곳인지 보이지 않는다.
       그리고 여기 오는 사람이 다 초보가 아니다 — 이미 말은 하는데 문법만
       정리하러 오는 사람에게 자물쇠를 보여 주면 그냥 나간다. 같은 이유로
       grammar-core 는 처음부터 needs 를 비워 뒀다. */
    const early = !!(need && courseDone(need) < Math.ceil(need.lessons.length / 2));
    return (
      `<button class="lc-card" data-course="${c.id}">` +
        '<div class="lc-top">' +
          `<div class="lc-mark">${esc(c.emoji)}</div>` +
          '<div style="min-width:0">' +
            `<div class="lc-lv">${esc(courseLabel(c))}</div>` +
            `<div class="lc-title">${esc(cTx(c.title))}</div>` +
            `<div class="lc-tag">${esc(cTx(c.tagline))}</div>` +
          '</div>' +
        '</div>' +
        `<p class="lc-blurb">${esc(cTx(c.blurb))}</p>` +
        (early
          ? `<div class="lc-order">${t(`순서로는 ‘${esc(need.title)}’ 다음이에요. 먼저 열어 봐도 괜찮아요.`,
                                       `Meant to come after ‘${esc(need.title)}’ — open it early if you like.`)}</div>`
          : '') +
        '<div class="lc-meter">' +
          `<div class="lc-bar"><div class="lc-fill" style="width:${pct}%"></div></div>` +
          `<span class="lc-num">${n} / ${all}</span>` +
        '</div>' +
      '</button>'
    );
  }).join('');
}

$('lcList').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-course]');
  if (!b || b.disabled) return;
  openCourse(COURSES.find((c) => c.id === b.dataset.course));
});

function openCourse(c) {
  lsCourse = c;
  drawLessonRows();
  $('llWrap').classList.remove('hidden');
  $('llWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* 목록만 다시 그린다. 언어를 바꿀 때도 쓰는데, 그때 화면이 튀면
   안 되므로 스크롤은 openCourse 쪽에만 둔다. */
function drawLessonRows() {
  const c = lsCourse;
  if (!c) return;
  $('llTitle').textContent = cTx(c.title);
  $('llRows').innerHTML = c.lessons.map((l, i) => {
    const done = doneSet.has(l.id);
    return (
      `<button class="ll-row${done ? ' done' : ''}" data-lesson="${esc(l.id)}">` +
        `<span class="ll-dot">${done ? '✓' : i + 1}</span>` +
        '<span class="ll-main">' +
          `<span class="ll-t">${esc(cTx(l.title))}</span>` +
          `<span class="ll-m">${l.minutes} ${t('분', 'min')} · ${l.blocks.filter(isEx).length} ${t('문제', 'exercises')}</span>` +
        '</span>' +
        '<span class="ll-go">→</span>' +
      '</button>'
    );
  }).join('');
}

$('llBack').addEventListener('click', () => {
  $('llWrap').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$('llRows').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-lesson]');
  if (!b) return;
  startLesson(lsCourse, lsCourse.lessons.find((l) => l.id === b.dataset.lesson));
});
const isEx = (b) => ['choice','listen','type','order','pair','speak','cloze','build'].includes(b.t);

function startLesson(course, lesson) {
  lsCourse = course; lsLesson = lesson;
  lsQueue = lesson.blocks.slice();
  lsSolved = 0;
  lsTotal = lesson.blocks.filter(isEx).length;

  /* Cloze 게임 상태 초기화 · HUD 보여주기 (문제가 하나라도 있으면) */
  lsHp = 3; lsXp = 0; lsCombo = 0; lsWrong = []; lsMode = 'lesson'; dqFrom = false;
  if (lsChallengeTimer) { clearInterval(lsChallengeTimer); lsChallengeTimer = 0; }
  if (lsTotal > 0) {
    $('lsHud').style.display = '';
    syncHud();
  } else {
    $('lsHud').style.display = 'none';
  }

  $('lsKicker').textContent = cTx(course.title);
  $('lsTitle').textContent = cTx(lesson.title);
  $('lsBlocks').innerHTML = '';
  $('lsNextBar').classList.add('hidden');
  lsMeter();
  open('lesson');
  flow();
}

function lsMeter() {
  const pct = lsTotal ? Math.round((lsSolved / lsTotal) * 100) : 0;
  $('lsProg').style.width = pct + '%';
  $('lsCount').textContent = lsTotal ? `${lsSolved} / ${lsTotal}` : '';
}

/* ── Cloze 게임 · HUD 동기화 ──────────────────────────────── */
function syncHud() {
  if (!$('lsHud') || $('lsHud').style.display === 'none') return;
  $('hudXp').textContent = String(lsXp);
  $('hudCombo').textContent = String(lsCombo);
  $('hudHp').querySelectorAll('.hrt').forEach((el, i) => {
    el.classList.toggle('hrt-gone', i >= lsHp);
    el.textContent = i >= lsHp ? '🤍' : '💖';
  });
}

function showCombo(text) {
  const el = $('comboPop');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('show');
  // 다음 프레임에 재시작해서 리플로우 유발
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.classList.add('show');
    clearTimeout(showCombo._t);
    showCombo._t = setTimeout(() => el.classList.remove('show'), 1150);
  }));
}

function spawnXp(hostEl, amount) {
  if (!hostEl) return;
  const rect = hostEl.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'xp-float';
  f.style.left = (rect.left + rect.width * 0.12) + 'px';
  f.style.top  = (rect.top  + rect.height * 0.22 + window.scrollY) + 'px';
  f.style.position = 'absolute';
  f.textContent = `+${amount} XP`;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 950);
}

function hpDown(n = 1) {
  lsHp = Math.max(0, lsHp - n);
  /* 작은 진동 · 깜빡임 */
  const hpEl = $('hudHp');
  if (hpEl) {
    hpEl.animate(
      [{ transform:'translateX(0)'},{ transform:'translateX(-4px)'},{ transform:'translateX(4px)'},{ transform:'translateX(0)'}],
      { duration: 240, easing: 'ease-in-out' }
    );
  }
  syncHud();
}

/* 한글 초성 19개 (toJamo와 같은 규칙 사용 · 자모 분해 안하고 첫 음절의 초성만 뽑는 힌트용) */
const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function toChosung(word) {
  if (!word) return '';
  const first = String(word).trim().charAt(0);
  const code = first.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    return CHOSUNG[Math.floor((code - 0xAC00) / 588)] ?? first;
  }
  return first;   // 한글 아니면 그냥 첫 글자
}
/* 정답 전체 음절의 초성을 다 뽑아서 "ㅇㅁㄹㅋㄴ" 형태로 반환 (2단계 힌트용) */
function toFullChosung(word) {
  if (!word) return '';
  const s = String(word).trim();
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      out += CHOSUNG[Math.floor((code - 0xAC00) / 588)] ?? s.charAt(i);
    } else {
      out += s.charAt(i);
    }
  }
  return out;
}

/* ── 문장 마스터리 레벨 (1~5단계) · 로컬스토리지 저장 ──
   key: 'cp_m_' + audioSlug(문장원문)
   value: { attempts, correct, streak, typingStreak, level, hintUsed } */
const MST_KEY = 'cp_m_';
function loadMastery(key) {
  try {
    const raw = localStorage.getItem(MST_KEY + key);
    if (!raw) return { attempts:0, correct:0, streak:0, typingStreak:0, level:1, hintUsed:false, mastered:false };
    return Object.assign({ attempts:0, correct:0, streak:0, typingStreak:0, level:1, hintUsed:false, mastered:false }, JSON.parse(raw));
  } catch (e) {
    return { attempts:0, correct:0, streak:0, typingStreak:0, level:1, hintUsed:false, mastered:false };
  }
}
function saveMastery(key, m) {
  try { localStorage.setItem(MST_KEY + key, JSON.stringify(m)); } catch (e) {}
}
/* 마스터리 레벨 자동 계산 (1~5) */
function calcLevel(m) {
  if (!m.attempts) return 1;
  const ratio = m.correct / Math.max(1, m.attempts);
  if (m.attempts >= 10 && ratio >= 0.95 && m.typingStreak >= 3) return 5;
  if (m.attempts >= 7 && ratio >= 0.9 && m.streak >= 5) return 4;
  if (m.attempts >= 4 && ratio >= 0.8 && m.streak >= 3) return 3;
  if (m.correct >= 1) return 2;
  return 1;
}
/* 마스터리 배지 렌더링 HTML */
function renderMasteryBadge(level, mastered) {
  const stars = '★'.repeat(level) + '☆'.repeat(Math.max(0, 5 - level));
  const lvTxt = mastered ? 'MASTERED' : `LV.${level}`;
  const crown = mastered ? '<span class="m-mastered">👑</span>' : '';
  return `<span class="mastery-badge m-lv${level}">${crown}<span>${lvTxt}</span> <span style="opacity:.75">${stars}</span></span>`;
}

/* 읽는 블록은 문제를 만날 때까지 죽 펼치고, 문제가 나오면 멈춘다.
   맞히면 다시 흐른다. 한 번에 다 보여주면 읽지 않고 내려가고,
   한 칸씩 보여주면 앞을 다시 볼 수가 없다. */
function flow() {
  while (lsQueue.length && !isEx(lsQueue[0])) {
    $('lsBlocks').insertAdjacentHTML('beforeend', readBlock(lsQueue.shift()));
  }
  if (!lsQueue.length) return finishLesson();

  const b = lsQueue.shift();
  const host = document.createElement('div');
  $('lsBlocks').appendChild(host);
  exBlock(host, b, () => {
    lsSolved++; lsMeter();
    flow();
    // 새로 나온 곳이 보이게. 맞히고 나서 화면이 그대로면 끝난 줄 안다.
    setTimeout(() => host.nextElementSibling?.scrollIntoView({ behavior:'smooth', block:'center' }), 120);
  });
  setTimeout(() => host.scrollIntoView({ behavior:'smooth', block:'center' }), 60);
}

function readBlock(b) {
  if (b.t === 'text')
    return `<div class="bk">${b.h ? `<div class="bk-h">${esc(b.h)}</div>` : ''}${mdBlock(b.md)}</div>`;
  if (b.t === 'note')
    return `<div class="bk"><div class="bk-note">${mdBlock(b.md)}</div></div>`;
  /* wide 를 주면 한 줄에 하나씩, 글자를 줄여 문장을 담는다.
     기본 카드는 36px 라 낱글자용이다 — 예문을 넣으면 카드 밖으로 넘친다.
     rom 은 없으면 안 그린다. 문장마다 로마자를 다는 건 품이 크고, 없다고
     undefined 가 찍히면 그게 더 나쁘다. */
  if (b.t === 'chars')
    return `<div class="bk"><div class="bk-chars${b.wide ? ' wide' : ''}">` + b.items.map((it) =>
      `<button class="ch-card" data-say="${esc(it.ch)}"${it.audio ? ` data-audio="${esc(it.audio)}"` : ''}>` +
        `<div class="ch-big">${esc(it.ch)}</div>` +
        (it.rom ? `<div class="ch-rom">${esc(it.rom)}</div>` : '') +
        (it.tip ? `<div class="ch-tip">${md(it.tip)}</div>` : '') +
      '</button>').join('') + '</div></div>';
  if (b.t === 'table')
    return '<div class="bk"><div class="bk-tw"><table><thead><tr>' +
      b.head.map((h) => `<th>${md(h)}</th>`).join('') + '</tr></thead><tbody>' +
      b.rows.map((r) => '<tr>' + r.map((c) => `<td>${md(c)}</td>`).join('') + '</tr>').join('') +
      '</tbody></table></div></div>';
  return '';
}

// 글자 카드를 누르면 읽어 준다. (data-audio 속성 있으면 MP3 우선)
$('lsBlocks').addEventListener('click', (ev) => {
  const c = ev.target.closest('[data-say]');
  if (c) say(c.dataset.say, c.dataset.audio);
});



function twDrawHead() {
  const level = learnLv.writing;
  const mine = TW_ITEMS.filter((x) => x.lv === level);
  $('twLevel').innerHTML = renderLevelSwitch('writing');
  $('twIntro').textContent = t(
    '실제 시험처럼 분량과 문체를 지키며 직접 써 봅니다. 쓰는 동안 글자 수와 문체를 알려 줘요.',
    'Write to the real exam’s length and register. Length and register are checked as you type.');
  $('twSummary').innerHTML = renderLearnSummary([
    { k: t('문항', 'Items'), v: mine.length, s: t('이 단계에서 연습할 문항', 'Practice items in this level') },
    { k: t('유형', 'Types'), v: new Set(mine.map((x) => x.q)).size, s: t('51~54번 가운데', 'Of TOPIK II tasks 51–54') },
    { k: t('단계', 'Level'), v: learnLevelText(level), s: t('기출이 아닌 창작 문항', 'Original items, not past papers') },
  ]);
}

/* ══ 배우기 : TOPIK 쓰기 ═══════════════════════════════════════
   1단계는 채점을 하지 않는다. 대신 **쓰는 동안** 두 가지를 알려 준다 —
   글자 수와 문체. 실제 시험에서 가장 흔한 감점 둘이고, 둘 다 다 쓰고
   나서 알면 늦다. 채점(AI)은 3단계이고 없어도 이 화면은 산다.

   설계는 docs/topik-writing-plan.md. */

let twItem = null;       // 지금 열어 둔 문항
let twTick = 0;          // 타이머 setInterval 손잡이
let twLeft = 0;          // 남은 초

/* 글자 수는 **띄어쓰기를 넣어** 센다. 실제 TOPIK 이 원고지 칸을 세기
   때문이다 — 문항 조건에 "600~700자(띄어쓰기 포함)" 이라고 적힌 그것이다.
   처음에 공백을 빼고 셌는데, 그러면 학습자가 600자를 채웠다고 생각할 때
   실제로는 700자를 넘는다. 분량이 이 화면의 본체인데 잣대가 시험과
   다르면 없느니만 못하다.
   줄바꿈만 뺀다. 문단을 나눴다고 칸이 늘지는 않는다. */
const twCount = (s) => String(s).replace(/[\r\n]/g, '').length;

/* ── 문체 검사 ───────────────────────────────────────────────
   AI 가 아니라 규칙이다. 논술에 해요체가 섞이면 무조건 감점이라
   규칙이 틀릴 일이 없다.

   문장을 끝에서 보고 세 갈래로 가른다. 문장 가운데의 -아/어요 는
   인용일 수 있어서 **끝만** 본다. */
const TW_HAEYO   = /(아요|어요|여요|에요|예요|해요|세요|께요|나요|가요|까요|지요|네요|군요|는데요|거든요)$/;
/* 「ㅂ니다」를 글자 그대로 적으면 안 된다. 합니다·입니다·됩니다는 ㅂ 이
   앞 글자에 받침으로 붙어 있어서 낱자 ㅂ 이 문자열에 없다. 처음에 그렇게
   적었다가 합니다체에서 가장 흔한 「합니다」를 통째로 놓쳤다.
   받침을 따지지 말고 「니다·니까」로 끝나는지만 본다. */
const TW_HAPNIDA = /(니다|니까|시오)$/;
const TW_PLAIN   = /(ㄴ다|는다|았다|었다|이다|한다|된다|난다|같다|없다|있다|않다|하다|되다|다)$/;

function twSentences(text) {
  return String(text)
    .split(/[.!?…\n]+/)
    .map((x) => x.trim().replace(/["'’”\)\]]+$/, ''))
    .filter((x) => x.length > 1);
}

/* 목표 문체에 어긋나는 문장들을 돌려준다. */
function twRegisterMiss(text, want) {
  const bad = [];
  for (const sen of twSentences(text)) {
    const haeyo = TW_HAEYO.test(sen);
    const hapnida = TW_HAPNIDA.test(sen);
    const plain = TW_PLAIN.test(sen);
    if (want === 'formal') {
      // 안내문 — 합니다체가 맞고 해요체가 틀리다. -(느)ㄴ다체도 어색하다.
      if (haeyo) bad.push({ sen, why: t('해요체', 'informal 해요') });
      else if (!hapnida && plain) bad.push({ sen, why: t('-(느)ㄴ다체', 'plain -(느)ㄴ다') });
    } else {
      // 설명문·논술 — -(느)ㄴ다체가 맞고 해요체·합니다체 둘 다 틀리다.
      if (haeyo) bad.push({ sen, why: t('해요체', 'informal 해요') });
      else if (hapnida) bad.push({ sen, why: t('합니다체', 'formal 합니다') });
    }
  }
  return bad;
}

const twWant = (it) => (it.register === 'formal'
  ? t('합니다체 (안내문)', '합니다 style (notice)')
  : t('-(느)ㄴ다체 (설명문·논술)', 'plain -(느)ㄴ다 style'));

/* ── 문항별 점수 저장 ────────────────────────────────────────
   51·52 번만 규칙 채점이 있다(twSubmit). 53·54 는 분량·문체만 보고 점수를
   안 매기므로 여기 안 남는다 — 매기지도 않은 점수를 「기록」이라고 보여
   주면 거짓말이 된다. 세트가 아니라 문항 하나하나가 열쇠다(51번은 다섯
   문제가 각자 다른 지문이라 세트로 묶을 수가 없다). */
const twSetKey = (id) => `cp-tw-${id}`;
function twSetRead(id) {
  try {
    const v = JSON.parse(localStorage.getItem(twSetKey(id)) || 'null');
    return v && Number.isFinite(v.pt) && Number.isFinite(v.max) ? v : null;
  } catch (e) { return null; }
}
function twSetWrite(id, pt, max) {
  const had = twSetRead(id);
  if (had && had.pt >= pt) return;
  try { localStorage.setItem(twSetKey(id), JSON.stringify({ pt, max })); } catch (e) {}
}

/* 기록판 — 51·52 번 진행률과 평균 점수. tqBar 를 그대로 쓴다(있는 값이
   s/n 이 아니라 pt/max 라 「초」 자리는 백분율로 맞춰 넘긴다). */
function twDrawRecord() {
  const box = $('twRecord');
  const mine = TW_ITEMS.filter((x) => x.lv === learnLv.writing);
  const rows = [51, 52].map((q) => {
    const items = mine.filter((x) => x.q === q);
    const done = items.map((x) => twSetRead(x.id)).filter(Boolean);
    return { q, items, done };
  }).filter((r) => r.items.length);

  if (!rows.some((r) => r.done.length)) { box.textContent = ''; box.classList.add('hidden'); return; }

  const label = (q) => (TW_QS.find((x) => x.q === q) || {})[isEn() ? 'en' : 'ko'] || String(q);
  box.innerHTML =
    `<div class="tq-bd-h">${esc(t('51·52번 진행', 'Progress on 51–52'))}</div>` +
    rows.map((r) => tqBar(label(r.q), r.done.length, r.items.length, '')).join('') +
    rows.filter((r) => r.done.length).map((r) => {
      const sumPt = r.done.reduce((s, x) => s + x.pt, 0);
      const sumMax = r.done.reduce((s, x) => s + x.max, 0);
      const pct = sumMax ? Math.round((sumPt / sumMax) * 100) : 0;
      return `<p class="tq-bd-tip">${esc(t(`${label(r.q)} 평균 ${pct}점`, `${label(r.q)} averaging ${pct}%`))}</p>`;
    }).join('');
  box.classList.remove('hidden');
}

/* ── 문항 목록 ─────────────────────────────────────────────── */
function twDraw() {
  /* 언어를 바꾸면 openSection 이 갈래 속을 다시 그리는데, 여기서 목록으로
     되돌리면 **쓰던 글이 사라진다.** 600자를 쓰다가 EN 을 눌렀다고 글이
     날아가면 다시는 안 쓴다. 문항이 열려 있으면 손대지 않는다 —
     딱지가 옛 언어로 남는 편이 글을 잃는 것보다 낫다. */
  if (twItem) return;
  twDrawHead();
  twStopClock();
  twItem = null;
  $('twDesk').classList.add('hidden');
  $('twList').classList.remove('hidden');

  const mine = TW_ITEMS.filter((x) => x.lv === learnLv.writing);
  twDrawRecord();
  if (!mine.length) return void ($('twList').innerHTML = lvEmpty());

  // 문항 번호별로 묶는다. 51 다섯 개가 흩어져 있으면 무엇이 무엇인지 모른다.
  let html = '';
  for (const g of TW_QS) {
    const items = mine.filter((x) => x.q === g.q);
    if (!items.length) continue;
    html += `<div class="tw-sec-t">${esc(isEn() ? g.en : g.ko)} · ${g.pt}${t('점', ' pts')}</div>` +
      items.map((it) =>
        `<button class="tw-card" data-tw="${esc(it.id)}">` +
          '<div class="tw-card-top">' +
            `<span class="tw-no">${it.q}</span>` +
            `<span class="tw-pt">${it.min ? `${it.min}~${it.max}${t('자', ' chars')}` : t('빈칸 2곳', '2 blanks')}</span>` +
          '</div>' +
          `<div class="tw-card-t">${esc(it.title)}</div>` +
          `<div class="tw-card-s">${esc(it.cond)}</div>` +
        '</button>').join('');
  }
  $('twList').innerHTML = html +
    `<p class="sb-none" style="margin-top:18px">${t(
      '기출문제가 아니라 같은 유형으로 새로 쓴 연습 문항이에요.',
      'These are original practice items, not past exam papers.')}</p>`;
}

$('twList').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-tw]');
  if (!b) return;
  twOpen(TW_ITEMS.find((x) => x.id === b.dataset.tw));
});

/* ── 쓰기 화면 ─────────────────────────────────────────────── */
function twOpen(it) {
  if (!it) return;
  twItem = it;
  $('twList').classList.add('hidden');
  $('twDesk').classList.remove('hidden');

  const long = !!it.min;   // 53·54 는 긴 글, 51·52 는 빈칸 둘

  $('twDesk').innerHTML =
    `<button class="wb-out" id="twBack" type="button">← ${t('문항 목록', 'All items')}</button>` +
    '<div class="tw-head" style="margin-top:16px">' +
      `<div><span class="tw-no">${it.q}</span> <span class="tw-card-t">${esc(it.title)}</span></div>` +
      (long ? `<button class="wb-out" id="twClock" type="button">⏱ ${t('시간 재기', 'Timer')}</button>` : '') +
    '</div>' +

    `<div class="tw-passage">${esc(it.passage)}</div>` +
    (it.data ? '<ul class="tw-data">' + it.data.map((d) => `<li>${esc(d)}</li>`).join('') + '</ul>' : '') +
    (it.tasks ? '<ol class="tw-tasks">' + it.tasks.map((x) => `<li>${esc(x)}</li>`).join('') + '</ol>' : '') +
    `<p class="tw-cond">${esc(it.cond)} · ${t('문체', 'Register')}: <b>${esc(twWant(it))}</b></p>` +

    (long
      ? '<textarea id="twText" class="tw-in" rows="14" style="margin-top:16px"></textarea>' +
        '<div class="tw-bar">' +
          '<span class="tw-n" id="twN">0</span>' +
          '<div class="tw-gauge"><div class="tw-gauge-f" id="twG" style="width:0%"></div></div>' +
          '<span class="tw-clock" id="twT"></span>' +
        '</div>'
      : it.blanks.map((b, i) =>
          '<div class="tw-blank-row">' +
            `<div class="tw-blank-mark">${esc(b.mark)}</div>` +
            `<textarea class="tw-in tw-blank" data-i="${i}" rows="2"></textarea>` +
          '</div>').join('')) +

    `<div class="tw-warn" id="twW"></div>` +

    '<div class="tw-acts">' +
      (long ? '' : `<button class="btn-retro" id="twSubmit" type="button">${t('제출하기', 'Submit')}</button>`) +
      `<button class="btn-retro green" id="twShow" type="button">${t('모범답안 보기', 'Show a model answer')}</button>` +
      `<button class="wb-out" id="twClear" type="button">${t('지우기', 'Clear')}</button>` +
    '</div>' +
    '<div id="twOut"></div>';

  /* twDraw 는 twItem 이 있으면 그냥 돌아간다(언어를 바꿔도 쓰던 글을
     지키려고). 그래서 여기서 먼저 비우지 않으면 **나가기 버튼이 아무
     일도 안 한다.** 실제로 그랬다 — 문항을 열면 목록으로 못 돌아갔다. */
  $('twBack').addEventListener('click', () => { twItem = null; twDraw(); });
  $('twClear').addEventListener('click', () => {
    $('twDesk').querySelectorAll('.tw-in').forEach((x) => { x.value = ''; });
    $('twOut').innerHTML = '';
    twSync();
  });
  $('twShow').addEventListener('click', twReveal);
  if (!long) $('twSubmit').addEventListener('click', twSubmit);
  $('twDesk').querySelectorAll('.tw-in').forEach((x) => x.addEventListener('input', twSync));
  if (long) $('twClock').addEventListener('click', twToggleClock);

  twSync();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* 쓰는 동안 도는 것 — 글자 수와 문체. */
function twSync() {
  const it = twItem;
  if (!it) return;
  const long = !!it.min;
  const text = long
    ? ($('twText')?.value || '')
    : [...$('twDesk').querySelectorAll('.tw-blank')].map((x) => x.value).join('. ');

  if (long) {
    const n = twCount($('twText').value);
    const el = $('twN'), g = $('twG');
    el.textContent = `${n}${t('자', '')}  /  ${it.min}~${it.max}`;
    const pct = Math.min(100, Math.round((n / it.max) * 100));
    g.style.width = pct + '%';
    const cls = n > it.max ? 'over' : n >= it.min ? 'ok' : 'short';
    el.className = 'tw-n ' + cls;
    g.className = 'tw-gauge-f ' + (cls === 'short' ? '' : cls);
  }

  const miss = twRegisterMiss(text, it.register);
  const w = $('twW');
  if (!text.trim()) {
    w.className = 'tw-warn';
    w.innerHTML = t(`문체는 <b style="color:inherit">${esc(twWant(it))}</b> 로 씁니다. 쓰는 동안 확인해 드려요.`,
                    `Write in <b style="color:inherit">${esc(twWant(it))}</b>. I’ll check as you type.`);
  } else if (!miss.length) {
    w.className = 'tw-warn';
    w.innerHTML = `<span class="good">✓ ${t('문체가 맞아요.', 'Register looks right.')}</span>`;
  } else {
    w.className = 'tw-warn hit';
    w.innerHTML = `<b>${t(`문체가 어긋난 문장 ${miss.length}개`, `${miss.length} sentence(s) in the wrong register`)}</b><br>` +
      miss.slice(0, 3).map((m) => `· ${esc(m.sen.slice(-24))} — ${esc(m.why)}`).join('<br>');
  }
}

/* ── 모범답안 ──────────────────────────────────────────────── */
function twReveal() {
  const it = twItem;
  if (!it) return;
  let html = '';
  if (it.blanks) {
    html += it.blanks.map((b) =>
      `<div class="tw-sec-t">${esc(b.mark)} ${t('모범답안', 'Model answers')}</div>` +
      '<ul class="tw-ul">' + b.answers.map((a) => `<li>${esc(a)}</li>`).join('') + '</ul>' +
      `<p class="tw-cond">${esc(b.point)}</p>`).join('');
  }
  if (it.model) {
    html += `<div class="tw-sec-t">${t('모범답안', 'Model answer')} · ${twCount(it.model)}${t('자', ' chars')}</div>` +
      `<div class="tw-model">${esc(it.model)}</div>`;
  }
  if (it.points) {
    html += `<div class="tw-sec-t">${t('무엇을 보는가', 'What is scored')}</div>` +
      '<ul class="tw-ul">' +
        `<li><b>${t('내용 및 과제 수행', 'Content')}</b> — ${esc(it.points.content)}</li>` +
        `<li><b>${t('글의 전개 구조', 'Structure')}</b> — ${esc(it.points.structure)}</li>` +
        `<li><b>${t('언어 사용', 'Language')}</b> — ${esc(it.points.language)}</li>` +
      '</ul>';
  }
  html += `<div class="tw-sec-t">${t('흔한 감점 요인', 'Common deductions')}</div>` +
    '<ul class="tw-ul">' + it.deduct.map((d) => `<li>${esc(d)}</li>`).join('') + '</ul>';
  $('twOut').innerHTML = html;
  setTimeout(() => $('twOut').scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

/* ── 51·52 채점 (규칙, AI 아님) ────────────────────────────────
   docs/topik-writing-plan.md 2단계. 53·54 는 600~700자 논술이라
   규칙으로 못 매기고(AI 가 필요) 여기서는 안 다룬다.

   answers 에 적힌 2~3개 표현과 글자 그대로(또는 띄어쓰기만 다르게)
   맞아야 5점을 준다. 그 표현들과 다르면 — 한국어는 같은 뜻을 여러
   어순으로 말할 수 있어서 — 맞았는지 규칙으로 확신할 수 없다.
   그래서 "정답"이나 "오답"이라고 단정하지 않고 "표현이 달라요, 모범
   답안과 비교해 보세요"로 되돌린다. 자신 없는 것을 자신 있게 말하지
   않는다 — §5 의 "연습용 참고 점수" 원칙과 같다. */
function twScoreBlank(text, blank, register) {
  const norm = (s) => String(s).trim().replace(/\s+/g, ' ').replace(/[.!?~]+$/, '');
  const bare = (s) => norm(s).replace(/\s/g, '');
  const got = norm(text);
  if (!got) return { pt: 0, tag: 'empty' };

  const miss = twRegisterMiss(got, register);
  if (miss.length) return { pt: 2, tag: 'register', why: miss[0].why };

  const answers = blank.answers.map(norm);
  if (answers.includes(got) || answers.some((a) => bare(a) === bare(got))) return { pt: 5, tag: 'exact' };

  return { pt: 3, tag: 'guess' };
}

/* t() 는 부르는 순간의 언어를 읽는다(isEn() 참고). 모듈 위에서 한 번만
   객체로 굳혀 두면 언어를 나중에 바꿔도 그때 언어로 안 바뀐다 — 그래서
   함수로 두고 twSubmit 이 부를 때마다 새로 구한다. */
function twTagText(tag) {
  switch (tag) {
    case 'empty':    return t('아직 안 썼어요.', 'Not answered yet.');
    case 'register': return t('문체가 달라요', 'Wrong register');
    case 'exact':     return t('정확해요', 'Matches a model answer');
    default:          return t('표현이 달라요 — 모범답안과 비교해 보세요.', 'Different wording — compare with the model answers below.');
  }
}

/* 다음 채점 대상은 같은 문항 번호(51 또는 52)뿐이다. 51 을 풀다가
   갑자기 52 로 넘기면 "51번을 이어서 푼다"는 기대가 깨진다. */
function twNextSameType() {
  const it = twItem;
  if (!it) return;
  const mine = TW_ITEMS.filter((x) => x.lv === learnLv.writing && x.q === it.q);
  const idx = mine.findIndex((x) => x.id === it.id);
  const next = mine[idx + 1];
  if (next) return twOpen(next);
  twItem = null;   // twDraw 는 twItem 이 있으면 되돌아가지 않는다(쓰던 글 보호). 다 풀었으니 비운다.
  twDraw();
}

function twSubmit() {
  const it = twItem;
  if (!it || !it.blanks) return;

  const rows = it.blanks.map((b, i) => {
    const text = $('twDesk').querySelector(`.tw-blank[data-i="${i}"]`)?.value || '';
    const r = twScoreBlank(text, b, it.register);
    return { b, r };
  });
  const total = rows.reduce((s, x) => s + x.r.pt, 0);
  const max = rows.length * 5;
  twSetWrite(it.id, total, max);

  const sameType = TW_ITEMS.filter((x) => x.lv === learnLv.writing && x.q === it.q);
  const isLastOfType = sameType.findIndex((x) => x.id === it.id) >= sameType.length - 1;

  const html =
    `<div class="tw-sec-t">${t('채점 결과 (연습용)', 'Score (practice only)')}</div>` +
    `<p class="tw-score-big">${total} <span>/ ${max}${t('점', ' pts')}</span></p>` +
    '<ul class="tw-ul">' +
      rows.map(({ b, r }) =>
        `<li><b>${esc(b.mark)}</b> ${r.pt}${t('점', 'pt')} — ${esc(twTagText(r.tag))}` +
        (r.tag === 'register' && r.why ? ` (${esc(r.why)})` : '') + '</li>').join('') +
    '</ul>' +
    `<p class="tw-cond">${t(
      '연습용 참고 점수예요. 규칙 기반 채점이라 실제 TOPIK 채점과 다를 수 있어요. ' +
      '"표현이 달라요"는 틀렸다는 뜻이 아니라 규칙으로 확신할 수 없다는 뜻이에요 — 모범답안과 견줘 보세요.',
      'A practice estimate from rule-based matching — it can differ from real TOPIK scoring. ' +
      '"Different wording" does not mean wrong, only that the rules cannot confirm it — compare with the model answers.'
    )}</p>` +
    '<div class="tw-acts">' +
      (isLastOfType
        ? `<p class="tw-cond"><b>${t('이 유형은 다 풀었어요.', 'You’ve done all of this type.')}</b></p>`
        : `<button class="btn-retro" id="twNext" type="button">${t('다음 문제 (같은 유형) →', 'Next (same type) →')}</button>`) +
      `<button class="btn-retro green" id="twShow2" type="button">${t('모범답안 보기', 'Show a model answer')}</button>` +
    '</div>';

  $('twOut').innerHTML = html;
  if (!isLastOfType) $('twNext').addEventListener('click', twNextSameType);
  $('twShow2').addEventListener('click', twReveal);
  setTimeout(() => $('twOut').scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

/* ── 타이머 ────────────────────────────────────────────────
   강제하지 않는다. 처음 쓰는 사람에게 시계를 들이대면 안 쓴다.
   54번 30분, 53번 15분이 시험의 권장 배분이다. */
function twStopClock() {
  if (twTick) { clearInterval(twTick); twTick = 0; }
}
function twToggleClock() {
  if (twTick) {
    twStopClock();
    $('twClock').textContent = `⏱ ${t('시간 재기', 'Timer')}`;
    if ($('twT')) $('twT').textContent = '';
    return;
  }
  twLeft = (twItem?.q === 54 ? 30 : 15) * 60;
  $('twClock').textContent = `⏸ ${t('멈추기', 'Stop')}`;
  const paint = () => {
    if (!$('twT')) return twStopClock();
    const m = Math.floor(twLeft / 60), sec = twLeft % 60;
    $('twT').textContent = `${m}:${String(sec).padStart(2, '0')}`;
  };
  paint();
  twTick = setInterval(() => {
    twLeft--;
    if (twLeft <= 0) { twStopClock(); if ($('twT')) $('twT').textContent = t('시간 끝', 'Time'); return; }
    paint();
  }, 1000);
}

/* ══ 배우기 : 문제만 풀기 ═══════════════════════════════════════
   코스는 읽고 풀지만 여기는 풀기만 한다. 이미 배운 것을 확인하러 오는
   자리라, 설명을 다시 읽히면 두 번은 안 온다.

   문제는 레슨에서 그대로 가져온다. 여기 따로 쓰지 않는 이유는 두 벌이
   되는 순간 한쪽만 고쳐지기 때문이다 — 레슨에서 고친 문제가 여기 옛날
   것으로 남으면 어느 쪽이 맞는지 알 길이 없다.

   이름을 dq 로 짓는다. qz 는 스피드 퀴즈 게임이, tq 는 TOPIK 유형
   연습이 이미 쓰고 있다. */

const DQ_MAX = 15;   // 한 판. 다 맞혀야 끝나므로 길면 끝을 못 보고 나간다.

/* 그 급의 모든 레슨에서 문제 블록만. 어느 코스에서 왔는지 함께 들고
   온다 — 문제만 이어지면 지금 무엇을 확인하는 중인지 알 수 없다. */
function dqPool(level) {
  const out = [];
  COURSES.filter((c) => courseTier(c) === level).forEach((c) => {
    c.lessons.forEach((l) => {
      l.blocks.filter(isEx).forEach((b) => out.push({ b, course: c, lesson: l }));
    });
  });
  return out;
}

let dqQueue = [], dqTotal = 0, dqDone = 0, dqFrom = false;

function dqDraw() {
  const level = learnLv.quiz;
  const pool = dqPool(level);
  $('dqLevel').innerHTML = renderLevelSwitch('quiz');
  $('dqIntro').textContent = t(
    '레슨에서 문제만 뽑아 섞었어요. 설명 없이 문제만 이어집니다.',
    'Questions pulled from the lessons and shuffled. No reading — just questions.');
  $('dqSummary').innerHTML = renderLearnSummary([
    { k: t('문제', 'Questions'), v: pool.length, s: t('이 단계 레슨에 들어 있는 문제', 'Questions in this level’s lessons') },
    { k: t('한 판', 'Per round'), v: Math.min(DQ_MAX, pool.length), s: t('섞어서 이어 푸는 개수', 'Shuffled and run back to back') },
    { k: t('단계', 'Level'), v: learnLevelText(level), s: t('배운 것을 확인하는 자리', 'Check what you have learned') },
  ]);

  if (!pool.length) {
    $('dqBody').innerHTML = `<div class="learn-empty">${esc(t(
      '이 단계 문제는 아직 채우는 중이에요.', 'This level’s questions are still being written.'))}</div>`;
    return;
  }
  $('dqBody').innerHTML =
    '<div class="dq-card">' +
      '<div class="dq-big">⚡</div>' +
      `<div class="dq-t">${esc(t(`문제 ${Math.min(DQ_MAX, pool.length)}개`, `${Math.min(DQ_MAX, pool.length)} questions`))}</div>` +
      `<div class="dq-go"><button type="button" class="btn-retro green" id="dqGo">${esc(t('시작하기', 'Start'))}</button></div>` +
    '</div>';
  $('dqGo').addEventListener('click', dqStart);
}

function dqMeter() {
  $('lsProg').style.width = (dqTotal ? Math.round((dqDone / dqTotal) * 100) : 0) + '%';
  $('lsCount').textContent = dqTotal ? `${dqDone} / ${dqTotal}` : '';
}

function dqStart() {
  const pool = dqPool(learnLv.quiz).slice().sort(() => Math.random() - 0.5);
  dqQueue = pool.slice(0, DQ_MAX);
  dqTotal = dqQueue.length; dqDone = 0;
  if (!dqTotal) return;

  /* 레슨 화면을 빌려 쓰지만 레슨은 아니다. lsCourse/lsLesson 을 비워
     두는 것이 중요하다 — 남아 있으면 나갈 때 엉뚱한 코스로 가고,
     진도(lesson_progress)에 풀지도 않은 레슨이 찍힌다. */
  lsCourse = null; lsLesson = null;
  lsMode = 'quiz'; dqFrom = true;
  lsHp = 3; lsXp = 0; lsCombo = 0; lsWrong = [];
  if (lsChallengeTimer) { clearInterval(lsChallengeTimer); lsChallengeTimer = 0; }

  $('lsKicker').textContent = t('문제만 풀기', 'Just the questions');
  $('lsTitle').textContent = learnLevelText(learnLv.quiz);
  $('lsBlocks').innerHTML = '';
  $('lsNextBar').classList.add('hidden');
  $('lsHud').style.display = '';
  syncHud();
  dqMeter();
  open('lesson');
  dqNext();
}

function dqNext() {
  if (lsMode !== 'quiz') return;       // 나갔는데 예약된 다음 문제가 오는 것 막기
  if (!dqQueue.length) return dqEnd();

  const item = dqQueue.shift();
  const host = document.createElement('div');
  $('lsBlocks').appendChild(host);
  host.insertAdjacentHTML('beforeend', `<div class="dq-from">${esc(cTx(item.course.title))}</div>`);

  exBlock(host, item.b, () => {
    dqDone++; dqMeter();
    setTimeout(dqNext, 420);
  });
  setTimeout(() => host.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
}

function dqEnd() {
  lsMode = 'lesson';
  $('lsProg').style.width = '100%';
  /* 몇 개 틀렸는지는 **말하지 않는다.** lsWrong 에는 빈칸(cloze) 오답만
     담긴다 — 고르기·쓰기·배열·짝 맞추기는 틀려도 어디에도 안 남는다.
     그래서 "한 번도 안 틀렸어요" 를 띄우면 고르기를 다섯 번 틀린
     사람에게도 그 말이 나간다. 다 맞혀야 넘어가므로 "다 풀었다" 는 참이다. */
  const missed = lsWrong.length;
  $('lsBlocks').insertAdjacentHTML('beforeend',
    '<div class="ls-done">' +
      '<div class="ls-done-big">🎉</div>' +
      `<div class="ls-done-t">${esc(t('한 판 끝!', 'Round done!'))}</div>` +
      `<p class="ls-done-s">${esc(missed
        ? t(`${dqTotal}문제를 다 풀었어요. 빈칸에서 틀렸던 ${missed}개는 아래에서 다시 풀 수 있어요.`,
            `${dqTotal} questions done. You can redo the ${missed} cloze answers you missed.`)
        : t(`${dqTotal}문제를 다 풀었어요.`, `${dqTotal} questions done.`))}</p>` +
      '<div class="ls-challenge-btns" style="margin-top:8px">' +
        (missed ? `<button type="button" class="btn-retro green" id="dqCh">⚡ ${esc(t('틀린 것만 1분', '60s on the misses'))}</button>` : '') +
        `<button type="button" class="btn-retro green" id="dqAgain">🔁 ${esc(t('한 판 더', 'One more'))}</button>` +
        `<button type="button" class="btn-retro blue" id="dqBack">${esc(t('배우기로', 'Back to Learn'))}</button>` +
      '</div>' +
    '</div>');
  $('dqCh')?.addEventListener('click', startChallenge);
  $('dqAgain').addEventListener('click', dqStart);
  $('dqBack').addEventListener('click', backToQuiz);
  $('lsNextBar').classList.add('hidden');
  setTimeout(() => $('lsBlocks').lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
}

/* 문제만 풀기에서 시작한 판은 코스 목록이 아니라 여기로 돌아와야 한다.
   챌린지를 거쳐 나올 수도 있어서 lsMode 로는 판별이 안 된다. */
function backToQuiz() {
  if (lsChallengeTimer) { clearInterval(lsChallengeTimer); lsChallengeTimer = 0; }
  lsMode = 'lesson'; dqFrom = false;
  open('learn');
  openSection('quiz');
}

/* 문제 한 개. 맞히면 done() 을 부른다. */
function exBlock(host, b, done) {
  const wrap = document.createElement('div');
  wrap.className = 'ex';
  host.appendChild(wrap);

  const tag = { choice:t('고르기','Choose'), listen:t('듣기','Listen'), type:t('쓰기','Type'),
                order:t('배열','Arrange'), pair:t('짝 맞추기','Match'), speak:t('말하기','Speak'),
                cloze:t('빈칸','Cloze'), build:t('문장 만들기','Build a sentence') }[b.t];
  const head = `<div class="ex-tag">${tag}</div>` + (b.q ? `<div class="ex-q">${md(b.q)}</div>` : '');

  const solve = () => { wrap.classList.add('ok'); done(); };
  const why = () => b.why ? `<div class="ex-why"><b>${t('맞아요','Correct')}</b> — ${md(b.why)}</div>` : '';

  // ── 고르기 · 듣기 ────────────────────────────────────────
  if (b.t === 'choice' || b.t === 'listen') {
    /* 보기를 섞어서 그린다. 데이터에는 정답이 거의 항상 맨 앞에 적혀
       있어서, 그대로 두면 문장을 안 읽고 첫 단추만 눌러도 맞는다.
       자리를 외우는 것은 문법을 아는 것이 아니다.
       원본 b.options 는 건드리지 않고 그릴 순서만 새로 만든다. */
    const ord = shuffled(b.options.map((o, i) => i));
    const ansAt = ord.indexOf(b.answer);
    wrap.innerHTML = head +
      (b.t === 'listen' ? `<button class="ex-say" data-say="${esc(b.say)}"${b.audio ? ` data-audio="${esc(b.audio)}"` : ''}>🔊 ${t('다시 듣기','Play again')}</button>` : '') +
      '<div class="ex-opts">' + ord.map((src, i) =>
        `<button class="ex-opt" data-i="${i}">${esc(b.options[src])}<span class="ex-mark"></span></button>`).join('') + '</div>';
    if (b.t === 'listen') setTimeout(() => say(b.say, b.audio), 350);

    wrap.addEventListener('click', (ev) => {
      const s = ev.target.closest('[data-say]');
      if (s) return say(s.dataset.say, s.dataset.audio);
      const o = ev.target.closest('.ex-opt');
      if (!o || o.disabled) return;
      const i = Number(o.dataset.i);
      if (i === ansAt) {
        wrap.querySelectorAll('.ex-opt').forEach((x) => { x.disabled = true; });
        o.classList.add('right'); o.querySelector('.ex-mark').textContent = '✓';
        wrap.insertAdjacentHTML('beforeend', why());
        solve();
      } else {
        o.classList.add('wrong'); o.querySelector('.ex-mark').textContent = '✕';
        o.disabled = true;
      }
    });
    return;
  }

  // ── 쓰기 ─────────────────────────────────────────────────
  if (b.t === 'type') {
    wrap.innerHTML = head +
      '<input class="ex-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      (b.keys ? '<div class="ex-keys">' + b.keys.map((k) =>
        `<button class="ex-key" data-k="${esc(k)}">${esc(k)}</button>`).join('') + '</div>' : '');
    const input = wrap.querySelector('.ex-in');
    const check = () => {
      if (input.value.trim() === b.answer) {
        input.disabled = true;
        wrap.querySelectorAll('.ex-key').forEach((k) => { k.disabled = true; });
        wrap.insertAdjacentHTML('beforeend', why());
        solve();
      } else {
        input.style.borderColor = 'var(--red)';
        setTimeout(() => { input.style.borderColor = ''; }, 700);
      }
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    input.addEventListener('input', () => { if (input.value.trim() === b.answer) check(); });
    wrap.addEventListener('click', (ev) => {
      const k = ev.target.closest('[data-k]');
      if (!k || k.disabled) return;
      // 자판이 없는 사람을 위한 것이라 누르면 그 글자로 바로 채운다.
      input.value = k.dataset.k;
      check();
    });
    return;
  }

  // ── 배열 ─────────────────────────────────────────────────
  if (b.t === 'order') {
    const bank = b.tokens.map((x, i) => ({ x, i })).sort(() => Math.random() - 0.5);
    wrap.innerHTML = head +
      `<div class="ex-slot" id="sl" data-ph="${t('여기에 놓으세요','Tap the words below')}"></div>` +
      '<div class="ex-bank">' + bank.map((o) =>
        `<button class="tok" data-b="${o.i}">${esc(o.x)}</button>`).join('') + '</div>';
    const slot = wrap.querySelector('.ex-slot');
    const picked = [];
    const check = () => {
      if (picked.length !== b.answer.length) return;
      const got = picked.map((i) => b.tokens[i]);
      if (got.every((v, i) => v === b.answer[i])) {
        wrap.querySelectorAll('.tok').forEach((x) => { x.disabled = true; });
        wrap.insertAdjacentHTML('beforeend', why());
        solve();
      } else {
        slot.style.borderColor = 'var(--red)';
        setTimeout(() => {
          slot.style.borderColor = '';
          picked.length = 0; slot.innerHTML = '';
          wrap.querySelectorAll('.ex-bank .tok').forEach((x) => { x.disabled = false; x.style.display = ''; });
        }, 700);
      }
    };
    wrap.addEventListener('click', (ev) => {
      const from = ev.target.closest('.ex-bank .tok');
      if (from && !from.disabled) {
        const i = Number(from.dataset.b);
        picked.push(i); from.style.display = 'none';
        slot.insertAdjacentHTML('beforeend', `<button class="tok" data-s="${i}">${esc(b.tokens[i])}</button>`);
        return check();
      }
      const back = ev.target.closest('.ex-slot .tok');
      if (back) {
        const i = Number(back.dataset.s);
        picked.splice(picked.indexOf(i), 1); back.remove();
        wrap.querySelector(`.ex-bank [data-b="${i}"]`).style.display = '';
      }
    });
    return;
  }

  // ── 짝 맞추기 ────────────────────────────────────────────
  if (b.t === 'pair') {
    const L = b.pairs.map((p, i) => ({ v:p[0], i })).sort(() => Math.random() - 0.5);
    const R = b.pairs.map((p, i) => ({ v:p[1], i })).sort(() => Math.random() - 0.5);
    wrap.innerHTML = head + '<div class="ex-pair">' +
      L.map((o, n) =>
        `<button class="pc" data-side="l" data-i="${o.i}" style="grid-row:${n+1};grid-column:1">${esc(o.v)}</button>` +
        `<button class="pc" data-side="r" data-i="${R[n].i}" style="grid-row:${n+1};grid-column:2">${esc(R[n].v)}</button>`
      ).join('') + '</div>';
    let sel = null, left = b.pairs.length;
    wrap.addEventListener('click', (ev) => {
      const c = ev.target.closest('.pc');
      if (!c || c.classList.contains('gone')) return;
      if (!sel) { sel = c; c.classList.add('sel'); return; }
      if (sel === c) { sel.classList.remove('sel'); sel = null; return; }
      if (sel.dataset.side === c.dataset.side) { sel.classList.remove('sel'); sel = c; c.classList.add('sel'); return; }
      if (sel.dataset.i === c.dataset.i) {
        sel.classList.remove('sel'); sel.classList.add('gone'); c.classList.add('gone');
        sel = null;
        if (--left === 0) solve();
      } else {
        const a = sel; a.classList.remove('sel');
        a.classList.add('miss'); c.classList.add('miss');
        setTimeout(() => { a.classList.remove('miss'); c.classList.remove('miss'); }, 550);
        sel = null;
      }
    });
    return;
  }

  // ── 말하기 ───────────────────────────────────────────────
  /* ── 문장 만들기 ──────────────────────────────────────────
     보기를 고르는 문제는 답이 화면에 있다. 여기는 빈손에서 짠다 —
     읽을 줄 아는 것과 만들 줄 아는 것 사이가 여기서 갈린다.

     채점에서 띄어쓰기와 문장부호는 뺀다. 조사 자리를 맞혔는데 마침표
     하나로 틀렸다고 하면 무엇을 배웠는지 알 수 없다. 대신 띄어쓰기가
     다르면 바른 모양을 같이 보여 준다.

     answers 는 **여러 개**다. 한국어는 같은 뜻을 여러 어순으로 말할 수
     있어서 하나만 받으면 맞는 문장을 틀렸다고 한다.

     must 는 반드시 들어가야 할 조각이다. 이게 있으면 "틀렸어요" 대신
     「~가 없어요」 라고 짚어 줄 수 있다. 그 한 줄이 이 블록의 값어치다. */
  if (b.t === 'build') {
    wrap.innerHTML = head +
      '<input class="ex-in ex-build-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      (b.bank ? '<div class="ex-bank">' + shuffled(b.bank).map((w) =>
        `<button class="ex-chip" type="button" data-w="${esc(w)}">${esc(w)}</button>`).join('') + '</div>' : '') +
      '<div class="ex-build-row">' +
        `<button class="ex-check" type="button">${t('확인', 'Check')}</button>` +
        `<button class="ex-clear" type="button">${t('지우기', 'Clear')}</button>` +
      '</div>' +
      '<div class="ex-fb"></div>';

    const input = wrap.querySelector('.ex-build-in');
    const fb = wrap.querySelector('.ex-fb');
    let tries = 0;

    const norm = (s) => String(s).trim().replace(/\s+/g, ' ').replace(/[.!?~]+$/, '');
    const bare = (s) => norm(s).replace(/\s/g, '');
    const answers = (b.answers ?? []).map(norm);

    const finish = (msg) => {
      input.disabled = true;
      wrap.querySelectorAll('.ex-chip, .ex-check, .ex-clear, .ex-reveal').forEach((x) => { x.disabled = true; });
      fb.innerHTML = msg;
      wrap.insertAdjacentHTML('beforeend', why());
      solve();
    };

    /* 두 번 틀리면 답을 보여 준다. 막다른 길을 두면 안 되는 자리다 —
       고르기와 달리 찍어서 넘어갈 수가 없어서, 못 만드는 사람은
       레슨 전체가 거기서 끝난다. */
    const nudge = (msg) => {
      input.style.borderColor = 'var(--red)';
      setTimeout(() => { input.style.borderColor = ''; }, 700);
      fb.innerHTML = `<span class="no">${msg}</span>` +
        (tries >= 2 ? `<button class="ex-reveal" type="button">${t('답 보기', 'Show me')}</button>` : '');
    };

    const check = () => {
      const got = norm(input.value);
      if (!got) return;
      tries++;

      if (answers.includes(got)) return finish(`<b class="yes">${t('맞아요', 'Correct')}</b>`);

      const spaced = answers.find((a) => bare(a) === bare(got));
      if (spaced) return finish(
        `<b class="yes">${t('맞아요', 'Correct')}</b> — ` +
        `${t('띄어쓰기만 달라요', 'just the spacing')}: <b>${esc(spaced)}</b>`);

      const missing = (b.must ?? []).find((m) => !bare(got).includes(bare(m)));
      if (missing) return nudge(t(`아직 「${missing}」 이 없어요.`, `“${missing}” is not in there yet.`));

      nudge(b.hint ? md(b.hint) : t('아직 아니에요. 다시 볼까요?', 'Not yet — look again.'));
    };

    input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') check(); });
    wrap.addEventListener('click', (ev) => {
      const chip = ev.target.closest('[data-w]');
      if (chip && !chip.disabled) {
        input.value = (input.value.trim() + ' ' + chip.dataset.w).trim();
        input.focus();
        return;
      }
      if (ev.target.closest('.ex-reveal')) {
        input.value = answers[0] ?? '';
        return finish(`<span class="shown">${t('답', 'Answer')}</span> — <b>${esc(input.value)}</b>`);
      }
      if (ev.target.closest('.ex-check')) return check();
      if (ev.target.closest('.ex-clear')) { input.value = ''; fb.innerHTML = ''; input.focus(); }
    });
    return;
  }

  if (b.t === 'speak') {
    wrap.innerHTML = head +
      `<div style="text-align:center">` +
        `<div class="ex-target" data-say="${esc(b.say)}"${b.audio ? ` data-audio="${esc(b.audio)}"` : ''}>${esc(b.say)}</div>` +
        (b.rom ? `<div class="ex-rom">${esc(b.rom)}</div>` : '') +
        `<button class="ex-say" data-say="${esc(b.say)}"${b.audio ? ` data-audio="${esc(b.audio)}"` : ''} style="margin-top:14px">🔊 ${t('들어보기','Hear it')}</button>` +
        `<button class="ex-mic" type="button">🎙</button>` +
        `<div class="ex-heard"></div>` +
        `<button class="ex-skip" type="button">${t('마이크 없이 넘어가기','Skip — no microphone')}</button>` +
      '</div>';
    const mic = wrap.querySelector('.ex-mic');
    const heard = wrap.querySelector('.ex-heard');
    const SRC = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SRC) { mic.disabled = true; heard.textContent = t('이 브라우저는 음성 인식을 지원하지 않아요. 넘어가도 됩니다.', 'This browser cannot listen. Feel free to skip.'); }

    wrap.addEventListener('click', (ev) => {
      const s = ev.target.closest('[data-say]');
      if (s) return say(s.dataset.say, s.dataset.audio);
      if (ev.target.closest('.ex-skip')) { wrap.insertAdjacentHTML('beforeend', ''); return solve(); }
      if (!ev.target.closest('.ex-mic') || !SRC || mic.dataset.on) return;

      const rec = new SRC();
      lsRec = rec;
      rec.lang = 'ko-KR'; rec.interimResults = true; rec.continuous = false;
      let got = '';
      mic.dataset.on = '1'; mic.classList.add('rec');
      heard.textContent = t('듣고 있어요…', 'Listening…');
      rec.onresult = (e) => {
        got = '';
        for (let i = 0; i < e.results.length; i++) got += e.results[i][0].transcript;
        heard.textContent = got;
      };
      rec.onerror = () => {};
      rec.onend = () => {
        mic.classList.remove('rec'); delete mic.dataset.on; lsRec = null;
        const said = got.trim();
        if (!said) { heard.textContent = t('소리가 안 들렸어요. 다시 눌러 주세요.', 'Nothing came through. Tap again.'); return; }
        // 발음 테스트와 같은 자모 비교를 쓴다. 두 곳에서 다른 잣대를
        // 쓰면 같은 말을 하고도 점수가 달라진다.
        const score = window.accuracy ? window.accuracy(said, b.say) : 0;
        if (score >= 60) {
          heard.innerHTML = `${esc(said)} <b style="color:var(--green)">· ${score}%</b>`;
          mic.disabled = true;
          solve();
        } else {
          heard.innerHTML = `${esc(said)} <b style="color:var(--red)">· ${score}%</b><br>` +
            `<span style="font-size:13px;color:var(--ink-3)">${t('조금만 더 또박또박 해볼까요?', 'Close — try once more, a little clearer.')}</span>`;
        }
      };
      try { rec.start(); } catch (e) { mic.classList.remove('rec'); delete mic.dataset.on; }
    });
    return;
  }

  // ── Cloze · 빈칸 채우기 (Clozemaster Vibe) ────────────
  if (b.t === 'cloze') {
    // [단어] 형태로 빈칸 위치 마킹 → 파싱
    const senRaw = String(b.sentence ?? '');
    let before = '', answer = String(b.answer ?? ''), after = '';
    const m = senRaw.match(/^(.*)\[([^\]]+)\](.*)$/s);
    if (m) { before = m[1]; answer = answer || m[2]; after = m[3]; }
    answer = answer.trim();

    const wrapIn = document.createElement('div');
    wrapIn.className = 'ex-wrap-in';
    wrap.appendChild(wrapIn);

    /* 보기를 섞어서 그린다. 데이터에는 정답이 거의 항상 맨 앞이라, 그대로
       두면 문장을 안 읽고 첫 단추만 눌러도 맞는다. 채점은 글자로 하므로
       (picked === answer) 순서를 바꿔도 안전하다. */
    const shownOpts = shuffled(b.options ?? []);

    const fullSay = b.say || senRaw.replace(/\[([^\]]+)\]/g, '$1');
    const meaningHtml = (b.meaning || b.q)
      ? `<div style="margin:4px 0 10px;color:var(--ink-3);font-size:14px;">${dlgLines(md(b.meaning || b.q))}</div>` : '';

    /* ── 마스터리 레벨 로드 ── */
    const mstKey = audioSlug(senRaw);
    const mst = loadMastery(mstKey);

    wrapIn.innerHTML =
      // ── 상단 헤더: 태그 + 난이도 토글 + 마스터리 배지 ──
      `<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:8px;">` +
        `<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">` +
          head +
          // 난이도 세그먼트 토글 (쉬움 = 4지선다 · 도전 = 직접쓰기)
          `<div class="diff-seg" role="tablist" aria-label="난이도">` +
            `<label><input type="radio" name="cDiff_${mstKey}" value="easy" checked><span>${t('쉬움','Easy')} · 4지선다</span></label>` +
            `<label><input type="radio" name="cDiff_${mstKey}" value="hard"><span>${t('도전','Challenge')} · 직접쓰기</span></label>` +
          `</div>` +
        `</div>` +
        // 마스터리 배지 (오른쪽 끝)
        `<div id="cMst">${renderMasteryBadge(mst.level, mst.mastered)}</div>` +
      `</div>` +
      meaningHtml +
      `<div class="ex-cloze">` +
        `<div class="cloze-sentence" id="cSen">${dlgLines(
            esc(before) + `<span class="cloze-blank" id="cBlank">${'_'.repeat(Math.max(4, answer.length))}</span>` + esc(after)
          )}</div>` +
        // 2단계 초성 힌트 팝업 자리
        `<div id="cHintPop" style="text-align:center"></div>` +
        `<div class="cloze-tools">` +
          // 구버전 토글은 숨기고 (상단 큰 토글이 존재하므로) 호환성 위해 유지
          `<label class="cloze-toggle" style="display:none"><input type="checkbox" id="cMode"><span>${t('직접 쓰기','Type it')}</span></label>` +
          // 색을 인라인으로 박아 두면 스타일시트로는 못 고친다. 클래스로만 둔다.
          `<button class="ex-say cloze-say" data-say="${esc(fullSay)}"${b.audio ? ` data-audio="${esc(b.audio)}"` : ''}>🔊 ${t('문장 듣기','Hear sentence')}</button>` +
          `<button class="cloze-hint" id="cHint" type="button">💡 ${t('첫 자음 힌트','First letter hint')}</button>` +
        `</div>` +
        // 4지선다 모드 (기본 · 쉬움 모드)
        `<div class="cloze-choices" id="cOpts">` +
          shownOpts.map((o, i) =>
            `<button class="ex-opt" data-i="${i}">${esc(o)}<span class="ex-mark"></span></button>`
          ).join('') +
        `</div>` +
        // 직접 쓰기 모드 (도전 모드)
        `<div style="display:none" id="cTypeArea">` +
          `<div class="cloze-input-row">` +
            `<input class="cloze-inp" id="cInp" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t('정답을 적어 보세요','Type the answer')}">` +
          `</div>` +
          (b.keys?.length
            ? `<div class="cloze-keys">` + b.keys.map((k) =>
                `<button class="cloze-key" data-k="${esc(k)}" type="button">${esc(k)}</button>`).join('') +
              `</div>`
            : '') +
        `</div>` +
        `<div id="cMean" style="display:none;margin-top:12px;padding:10px 12px;background:#fff7ed;border-radius:8px;color:var(--orange-deep);font-size:14px;"><b>${t('뜻','Meaning')}:</b> ${dlgLines(md(b.meaning || b.q || ''))}</div>` +
      `</div>`;

    const blankEl = wrapIn.querySelector('#cBlank');
    const optsEl = wrapIn.querySelector('#cOpts');
    const typeEl = wrapIn.querySelector('#cTypeArea');
    const modeCb = wrapIn.querySelector('#cMode');
    const hintBt = wrapIn.querySelector('#cHint');
    const inp = wrapIn.querySelector('#cInp');
    const meanEl = wrapIn.querySelector('#cMean');
    const hintPopEl = wrapIn.querySelector('#cHintPop');
    const mstEl = wrapIn.querySelector('#cMst');
    const diffRadios = wrapIn.querySelectorAll(`input[name="cDiff_${mstKey}"]`);
    let hintStep = 0, solved = false, usedTyping = false;

    /* ── 난이도 세그먼트 토글 로직 ── */
    const setMode = (mode) => {
      const typing = mode === 'hard';
      optsEl.style.display = typing ? 'none' : '';
      typeEl.style.display = typing ? '' : 'none';
      modeCb.checked = typing;  // 구버전 checkbox 와 동기화
      if (typing) setTimeout(() => inp?.focus(), 60);
    };
    diffRadios.forEach((r) => {
      r.addEventListener('change', () => { if (r.checked) setMode(r.value); });
    });

    /* 구버전 토글 호환 */
    modeCb.addEventListener('change', () => {
      const on = modeCb.checked;
      setMode(on ? 'hard' : 'easy');
      diffRadios.forEach((r) => { r.checked = (on ? r.value === 'hard' : r.value === 'easy'); });
    });

    /* ── 초성 힌트 2단계 (유령 텍스트 Ghost text 버전) ──
       Step 1: 첫 글자 초성만 빈칸에 삽입 + 첫 글자 유령 텍스트 연하게 노출
       Step 2: 전체 음절 초성을 핑크색 유령 텍스트로 굵게 노출 */
    hintBt.addEventListener('click', () => {
      if (solved) return;
      hintStep++;
      mst.hintUsed = true;
      if (hintStep === 1) {
        const ch = toChosung(answer);
        blankEl.textContent = `${ch}${'_'.repeat(Math.max(2, answer.length - 1))}`;
        blankEl.classList.add('hint');
        hintPopEl.innerHTML = `<span class="cloze-ghost s1">${esc(ch)}${'　'.repeat(Math.max(1, answer.length - 1))}</span>`;
        hintBt.textContent = '💡 ' + t('전체 초성 유령 보기','Show full chosung ghost');
      } else {
        const full = toFullChosung(answer);
        blankEl.textContent = `${full.charAt(0)}${'_'.repeat(Math.max(2, answer.length - 1))}`;
        hintPopEl.innerHTML = `<span class="cloze-ghost s2">${esc(full)}</span>`;
        hintBt.disabled = true;
        hintBt.textContent = '💡 ' + full;
      }
    });

    /* ── 마스터리 레벨 업데이트 후 배지 리렌더 ── */
    const updateMastery = (correct, isTyping) => {
      mst.attempts++;
      if (correct) {
        mst.correct++;
        mst.streak++;
        if (isTyping) mst.typingStreak++;
        else mst.typingStreak = Math.max(0, mst.typingStreak - 0);  // 객관식이면 타이핑 연속은 유지
      } else {
        mst.streak = 0;
        mst.typingStreak = 0;
      }
      const newLv = calcLevel(mst);
      mst.level = newLv;
      if (newLv >= 5 && mst.attempts >= 10) mst.mastered = true;
      saveMastery(mstKey, mst);
      if (mstEl) mstEl.innerHTML = renderMasteryBadge(mst.level, mst.mastered);
    };

    const markRight = (optBtn) => {
      if (solved) return; solved = true;
      /* ① 0.1초 만에 문장 완성 */
      blankEl.textContent = answer;
      blankEl.classList.remove('hint'); blankEl.classList.add('reveal');
      /* ② 정답 MP3 / TTS 자동 즉시 재생 (MP3 우선 + audioUrl 전달!) */
      say(fullSay, b.audio);
      /* ③ UI 후처리 */
      if (optBtn) {
        wrapIn.querySelectorAll('.ex-opt').forEach((x) => { x.disabled = true; });
        optBtn.classList.add('right'); optBtn.querySelector('.ex-mark')?.remove();
        const span = document.createElement('span'); span.className = 'ex-mark'; span.textContent = '✓'; optBtn.appendChild(span);
      }
      if (inp) { inp.disabled = true; inp.style.borderColor = 'var(--green)'; inp.style.background = '#dcfce7'; }
      wrapIn.querySelectorAll('.cloze-key').forEach((k) => { k.disabled = true; });
      wrapIn.insertAdjacentHTML('beforeend', why());

      /* ── 게임 효과 ── */
      lsCombo++;
      let gain = 10;
      if (hintStep > 0) gain = Math.max(5, gain - 5);   // 힌트 쓰면 XP 감소
      if (usedTyping) gain += 2;                         // 도전 모드(타이핑) 맞추면 보너스
      if (lsCombo >= 5) gain += 5;                    // 5 콤보 보너스
      if (lsCombo >= 10) gain += 5;                   // 10 콤보 추가 보너스
      lsXp += gain;
      spawnXp(wrapIn.querySelector('.ex-cloze'), gain);
      if (lsCombo === 5)  showCombo('🔥 5 COMBO!');
      if (lsCombo === 10) showCombo('🔥🔥 10 COMBO!');
      if (lsCombo >= 15 && lsCombo % 5 === 0) showCombo(`🔥×${Math.floor(lsCombo/5)} ${lsCombo} COMBO!`);
      syncHud();
      /* ── 마스터리 업데이트 ── */
      updateMastery(true, usedTyping);
      setTimeout(solve, 650);
    };

    const markWrong = (optBtn) => {
      if (solved) return;
      lsCombo = 0;
      hpDown(1);
      syncHud();
      /* 마스터리 오답 기록 */
      updateMastery(false, usedTyping);
      /* 틀린 문제 복습 큐에 등록 (중복 방지) */
      /* 문제만 풀기도 모은다 — 끝나고 틀린 것만 다시 푸는 자리가 거기도
         있다. 챌린지는 이 큐로 돌고 있는 중이라 다시 담으면 안 된다. */
      if (lsMode !== 'challenge') {
        const exists = lsWrong.some((w) => w.sentence === senRaw);
        if (!exists) lsWrong.push({
          sentence: senRaw, answer, options: b.options ?? [], keys: b.keys ?? [],
          meaning: b.meaning, q: b.q, say: fullSay
        });
      }
      if (optBtn) { optBtn.classList.add('wrong'); optBtn.disabled = true; optBtn.querySelector('.ex-mark')?.remove();
        const span = document.createElement('span'); span.className='ex-mark'; span.textContent='✕'; optBtn.appendChild(span);
      }
      if (inp) {
        inp.style.borderColor = 'var(--red)';
        inp.animate([{ transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:220});
      }
      if (b.meaning || b.q) { meanEl.style.display = ''; }
    };

    /* 4지선다 */
    optsEl.addEventListener('click', (ev) => {
      if (solved) return;
      usedTyping = false;
      const o = ev.target.closest('.ex-opt');
      if (!o || o.disabled) return;
      const i = Number(o.dataset.i);
      const picked = shownOpts[i];
      if (picked === answer) markRight(o);
      else markWrong(o);
    });

    /* 직접 쓰기 입력 */
    const checkType = () => {
      if (!inp || solved) return;
      const v = inp.value.trim();
      if (!v) return;
      usedTyping = true;
      if (v === answer) markRight(null);
    };
    if (inp) {
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkType(); });
      inp.addEventListener('input', () => { if (inp.value.trim() === answer) checkType(); });
    }
    /* 키패드 (클릭으로 정답 채우기) */
    wrapIn.querySelectorAll('.cloze-key').forEach((k) => {
      k.addEventListener('click', () => {
        if (solved || !inp) return;
        usedTyping = true;
        const val = k.dataset.k;
        inp.value = val;
        checkType();
      });
    });

    /* TTS 듣기 버튼 (lsBlocks global 리스너가 data-say 처리하지만 여기 감싸둔 것도 작동하게 패스) */
    wrapIn.addEventListener('click', (ev) => {
      const s = ev.target.closest('[data-say]');
      if (s && !ev.defaultPrevented) { ev.preventDefault(); say(s.dataset.say, s.dataset.audio); }
    });

    return;
  }
}

let lsRec = null;
/* 레슨을 벗어날 때 듣던 것과 읽던 것을 멈춘다.
   안 그러면 홈에 가서도 마이크가 살아 있고 목소리가 계속 나온다. */
window.lsLeave = function () {
  if (lsRec) { try { lsRec.stop(); } catch (e) {} lsRec = null; }
  try { speechSynthesis.cancel(); } catch (e) {}
};

async function finishLesson() {
  const idx = lsCourse.lessons.indexOf(lsLesson);
  const next = lsCourse.lessons[idx + 1] || null;
  const first = !doneSet.has(lsLesson.id);

  doneSet.add(lsLesson.id);

  // 진도는 남기되, 못 남겨도 화면은 그대로 간다. 다 풀고 나서
  // "저장 실패" 를 보는 것만큼 김빠지는 일이 없다.
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    try {
      await sb.from('lesson_progress')
        .upsert({ user_id: session.user.id, lesson_id: lsLesson.id, done_at: new Date().toISOString() },
                { onConflict: 'user_id,lesson_id' });
      await loadProgress();
    } catch (e) { /* 표가 없거나 잠깐 끊긴 것 */ }
  }

  const n = streak();
  const wrongCount = lsWrong.length;

  $('lsBlocks').insertAdjacentHTML('beforeend',
    '<div class="ls-done">' +
      `<div class="ls-done-big">${first ? '🧀' : '👏'}</div>` +
      `<div class="ls-done-t">${first ? t('레슨 완료','Lesson complete') : t('다시 한 번 완벽하게','Nailed it again')}</div>` +
      `<p class="ls-done-s">${esc(cTx(lsLesson.title))}</p>` +
      (session
        ? (n > 1 ? `<div class="ls-streak">🔥 ${t(`${n}일 연속`, `${n}-day streak`)}</div>` : '')
        : `<p class="ls-done-s" style="color:var(--ink-3)">${t('로그인하면 진도가 저장돼요.','Sign in and your progress is saved.')}</p>`) +
      // ── Cloze 복습 1분 챌린지 (틀린 문제가 있을 때만 노출) ──
      (wrongCount > 0 ?
        `<div class="ls-challenge">
          <h3>⚡ ${t('오늘 틀린 문장', `Missed ${wrongCount} sentence${wrongCount === 1 ? '' : 's'}`)}</h3>
          <p>${t('빈칸으로 1분 동안 빠르게 다시 풀어 볼까요?', `Want to run them back as 60-second cloze drills?`)}</p>
          <div class="ls-challenge-btns">
            <button type="button" class="btn-retro" id="lsGoChallenge">🎯 ${t('1분 챌린지','60s Challenge')}</button>
          </div>
        </div>` : '') +
    '</div>');

  /* 1분 챌린지 버튼 이벤트 (DOM에 있을 때만 붙인다) */
  const bt = $('lsGoChallenge');
  if (bt) bt.addEventListener('click', startChallenge);

  $('lsNext').textContent = next ? t('다음 레슨 →', 'Next lesson →') : t('코스 목록으로', 'Back to the course');
  $('lsNextBar').classList.remove('hidden');
  $('lsNext').onclick = () => {
    if (lsChallengeTimer) { clearInterval(lsChallengeTimer); lsChallengeTimer = 0; }
    if (next) startLesson(lsCourse, next);
    else backToCourses();
  };
  setTimeout(() => $('lsBlocks').lastElementChild?.scrollIntoView({ behavior:'smooth', block:'center' }), 120);
}

/* ── 틀린 Cloze 복습 · 1분 챌린지 모드 ──────────────────── */
function startChallenge() {
  if (lsChallengeTimer) { clearInterval(lsChallengeTimer); lsChallengeTimer = 0; }
  if (!lsWrong.length) return;

  lsMode = 'challenge';
  lsHp = 99;  /* 챌린지에선 HP 개념 끔 · 빈 하트들만 안 깨지게 */
  lsXp = 0; lsCombo = 0; lsChallengeScore = 0;
  lsChallengeLeft = 60;

  /* HUD 유지 + 타이머 표시 추가 (lsCount 자리에 보여줌) */
  $('lsHud').style.display = '';
  $('hudHp').style.opacity = '0.35';
  syncHud();

  /* lsBlocks 지우고 새 제목 + 문제 공간 */
  $('lsBlocks').innerHTML = '';
  /* 문제만 풀기에서 온 판에는 코스가 없다. 예전엔 레슨에서만 챌린지로
     올 수 있어서 lsCourse.title 을 그냥 읽었는데, 이제 여기서 터진다. */
  $('lsKicker').textContent = lsCourse ? cTx(lsCourse.title) : t('문제만 풀기', 'Just the questions');
  $('lsTitle').textContent = t('⚡ 1분 복습 챌린지', '⚡ 60s Review Challenge');
  $('lsNextBar').classList.add('hidden');

  lsProgClock();  /* 진행률 시계를 타이머로 재활용 */

  /* 문제 큐: 틀린 문제들 섞고, 1분 동안 돌게 배열을 3~4배 부풀림 */
  const base = lsWrong.slice().sort(() => Math.random() - 0.5);
  lsChallengeQ = [];
  const copies = Math.max(3, Math.ceil(20 / base.length));
  for (let i = 0; i < copies; i++) lsChallengeQ.push(...base.map((x) => ({...x})));
  lsChallengeQ = lsChallengeQ.slice(0, 40);  /* 상한 40문제 (1분이면 충분) */

  /* 타이머 시작 */
  lsChallengeTimer = setInterval(() => {
    lsChallengeLeft--;
    lsProgClock();
    if (lsChallengeLeft <= 0) endChallenge();
  }, 1000);

  challengeNext();
}

/* 상단 lsProg 바를 타이머 막대로 재활용 */
function lsProgClock() {
  if (lsMode !== 'challenge') return;
  const pct = Math.round(((60 - lsChallengeLeft) / 60) * 100);
  $('lsProg').style.width = Math.max(0, Math.min(100, 100 - pct)) + '%';
  $('lsCount').innerHTML = `<b style="font-family:var(--px-font);color:#${lsChallengeLeft <= 10 ? 'e11d48' : '1a1228'}">⏱ ${lsChallengeLeft}s</b>  ·  ${t('점수','Score')} <b>${lsChallengeScore}</b>`;
}

function challengeNext() {
  if (lsMode !== 'challenge') return;
  if (!lsChallengeQ.length) return endChallenge();

  const b = lsChallengeQ.shift();
  /* 블록 형태로 정규화 → exBlock이 바로 처리할 수 있게 cloze 블록 재조립 */
  const pseudo = {
    t: 'cloze',
    q: b.meaning || b.q || '',
    sentence: b.sentence,
    answer:   b.answer,
    options:  b.options && b.options.length ? b.options : [b.answer, '(A)','(B)','(C)'].slice(0, Math.max(4, b.options?.length || 4)),
    keys:     b.keys || [],
    meaning:  b.meaning,
    say:      b.say
  };

  const host = document.createElement('div');
  $('lsBlocks').appendChild(host);
  $('lsBlocks').insertAdjacentHTML('beforeend', '<div style="height:12px"></div>');

  /* 챌린지 문제는 채점 후 자동 다음 문제 */
  try {
    exBlock(host, pseudo, () => {
      lsChallengeScore++;
      lsProgClock();
      /* 짧은 delay 뒤 다음 문제 (정답 잠시 보여주고) */
      setTimeout(() => {
        host.scrollIntoView({ behavior:'smooth', block:'center' });
        challengeNext();
      }, 520);
    });
    setTimeout(() => host.scrollIntoView({ behavior:'smooth', block:'center' }), 60);
  } catch (e) {
    challengeNext();
  }
}

function endChallenge() {
  if (lsChallengeTimer) { clearInterval(lsChallengeTimer); lsChallengeTimer = 0; }
  lsMode = 'lesson';
  const total = lsChallengeScore + Math.max(0, lsWrong.length - 1);
  $('lsBlocks').insertAdjacentHTML('beforeend',
    `<div class="ls-done">
      <div class="ls-done-big">${lsChallengeScore >= 10 ? '🏆' : lsChallengeScore >= 5 ? '⚡' : '🥔'}</div>
      <div class="ls-done-t">${t('챌린지 종료!', 'Time!')}</div>
      <p class="ls-done-s">${t('60초 동안 총','Scored')} <b>${lsChallengeScore}</b> ${t('문제 맞혔어요','in 60 seconds.')}</p>
      <div class="ls-challenge-btns" style="margin-top:8px">
        <button type="button" class="btn-retro green" id="lsRetryCh">🔁 ${t('한 번 더','Retry')}</button>
        <button type="button" class="btn-retro blue" id="lsBackCourse">${dqFrom ? t('배우기로','Back to Learn') : t('코스로 돌아가기','Back to course')}</button>
      </div>
    </div>`);
  $('hudHp').style.opacity = '';
  $('lsProg').style.width = '100%';
  $('lsCount').textContent = `Score ${lsChallengeScore}`;
  const btR = $('lsRetryCh'), btB = $('lsBackCourse');
  if (btR) btR.addEventListener('click', startChallenge);
  if (btB) btB.addEventListener('click', leaveLesson);
  $('lsNextBar').classList.remove('hidden');
  setTimeout(() => $('lsBlocks').lastElementChild?.scrollIntoView({ behavior:'smooth', block:'center' }), 120);
}

/* 문제만 풀기에서 온 판은 코스가 아니라 그리로 돌아간다. */
const leaveLesson = () => (dqFrom ? backToQuiz() : backToCourses());
$('lsExit').addEventListener('click', leaveLesson);

$('learnBtn').addEventListener('click', async () => {
  if (showing('learnView') || showing('lessonView')) return open('home');
  open('learn');
  await loadProgress();
  backToSections();   // 배우기는 갈래 고르기로 열린다
});

// ══ 자료마당 ═════════════════════════════════════════════════
// 올린 파일을 보관하지 않는다. 여기서 읽어 단어/뜻만 뽑아 저장하고,
// 받을 때 그 목록으로 xlsx 를 새로 만든다. 그래서 올라올 수 있는 건
// 단어 문자열뿐이고, 받는 파일은 항상 앱이 읽을 수 있는 형식이다.
const ADMIN_EMAIL = 'junsanghan1225@gmail.com';
const MAX_WORDS = 2000;

let libRows = [];
let libSession = null;
let pendingWords = null;   // 고른 파일에서 뽑아낸 목록
let formOpen = false;

const libMsg = (id, text) => { ['libErr','libOk'].forEach(k => $(k).classList.add('hidden'));
  if (!id) return; $(id).textContent = text; $(id).classList.remove('hidden'); };

// 앱의 handleImportExcel 과 같은 규칙. A열 단어, B열 뜻, C열 난이도.
// A열이 '단어' 인 행은 머리글이라 버린다.
function parseRows(rows) {
  return rows.map((r) => ({
    w: String(r?.[0] ?? '').trim(),
    m: String(r?.[1] ?? '').trim(),
    d: Math.min(3, Math.max(1, parseInt(String(r?.[2] ?? '1'), 10) || 1)),
  })).filter((x) => x.w && x.m && x.w !== '단어');
}

function resetLibForm() {
  pendingWords = null;
  $('libFile').value = '';
  $('libTitle').value = '';
  $('libDesc').value = '';
  $('libFileLabel').textContent = t('엑셀(.xlsx) 또는 .csv 파일 고르기', 'Choose an .xlsx or .csv file');
  $('libFound').classList.add('hidden');
  libMsg(null);
}

$('libFile').addEventListener('change', async (ev) => {
  const file = ev.target.files?.[0];
  libMsg(null);
  pendingWords = null;
  $('libFound').classList.add('hidden');
  if (!file) return;

  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    return libMsg('libErr', t('엑셀(.xlsx, .xls) 또는 .csv 파일만 올릴 수 있어요.',
                              'Only .xlsx, .xls or .csv files can be shared.'));
  }
  if (file.size > 3 * 1024 * 1024) {
    return libMsg('libErr', t('파일이 너무 커요. 3MB 아래로 올려 주세요.',
                              'That file is too large — please keep it under 3MB.'));
  }

  try {
    await needXLSX();
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const words = parseRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }));

    if (words.length === 0) {
      return libMsg('libErr', t('단어를 찾지 못했어요. A열에 단어, B열에 뜻을 넣어 주세요.',
                                'No words found. Put the word in column A and its meaning in column B.'));
    }
    if (words.length > MAX_WORDS) {
      return libMsg('libErr', t(`한 번에 ${MAX_WORDS}개까지 올릴 수 있어요.`,
                                `Up to ${MAX_WORDS} words per file.`));
    }

    pendingWords = words;
    $('libFileLabel').textContent = file.name;
    $('libFound').textContent = t(`${words.length}개 단어를 찾았어요 — 예) ${words[0].w} : ${words[0].m}`,
                                  `Found ${words.length} words — e.g. ${words[0].w} : ${words[0].m}`);
    $('libFound').classList.remove('hidden');
    if (!$('libTitle').value.trim()) $('libTitle').value = file.name.replace(/\.[^.]+$/, '').slice(0, 60);
  } catch (e) {
    libMsg('libErr', t('파일을 읽지 못했어요. 엑셀에서 다시 저장한 뒤 올려 주세요.',
                       'Could not read that file. Try re-saving it from Excel.'));
  }
});

$('libUploadBtn').addEventListener('click', async () => {
  formOpen = !formOpen;
  const { data: { session } } = await sb.auth.getSession();
  libSession = session;
  $('libNeedLogin').classList.toggle('hidden', !formOpen || !!session);
  $('libForm').classList.toggle('hidden', !formOpen || !session);
});

$('libCancel').addEventListener('click', () => {
  formOpen = false;
  $('libForm').classList.add('hidden');
  $('libNeedLogin').classList.add('hidden');
  resetLibForm();
});

$('libSubmit').addEventListener('click', async () => {
  libMsg(null);
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return open('account');
  if (!pendingWords) return libMsg('libErr', t('먼저 파일을 골라 주세요.', 'Choose a file first.'));

  const title = $('libTitle').value.trim();
  if (!title) return libMsg('libErr', t('제목을 적어 주세요.', 'Please add a title.'));

  const btn = $('libSubmit');
  btn.disabled = true;
  // author · downloads · created_at 은 보내지 않는다. 보내봐야 DB 트리거가
  // 덮어쓴다 — 클라이언트가 정하게 두면 이름을 사칭하거나 날짜를 조작해
  // 목록 맨 위를 영구히 차지할 수 있다.
  const { error } = await sb.from('resources').insert({
    title,
    description: $('libDesc').value.trim() || null,
    category: $('libCat').value,
    words: pendingWords,
    word_count: pendingWords.length,
    user_id: session.user.id,
  });
  btn.disabled = false;

  if (error) {
    return libMsg('libErr', t('올리지 못했어요. 잠시 후 다시 시도해 주세요.',
                              'Could not share it. Please try again.'));
  }
  libMsg('libOk', t('올렸어요. 목록 맨 위에 있어요.', 'Shared — it is at the top of the list.'));
  resetLibForm();
  loadLibrary();
});

function renderLibrary() {
  const list = $('libList');
  list.innerHTML = '';
  $('libEmpty').classList.toggle('hidden', libRows.length > 0);

  const myId = libSession?.user?.id;
  const isAdmin = libSession?.user?.email === ADMIN_EMAIL;

  for (const r of libRows) {
    const el = document.createElement('div');
    el.className = 'bd-row';
    const canDelete = myId && (r.user_id === myId || isAdmin);
    el.innerHTML =
      '<div class="bd-main">' +
        `<div class="bd-cat">${esc(r.category)}</div>` +
        `<div class="bd-title">${esc(r.title)}</div>` +
        (r.description ? `<div class="bd-desc">${esc(r.description)}</div>` : '') +
        '<div class="bd-meta">' +
          `<span>${esc(r.author || '익명')}</span>` +
          `<span>${new Date(r.created_at).toLocaleDateString()}</span>` +
          `<span>↓ ${esc(r.downloads)}</span>` +
        '</div>' +
      '</div>' +
      `<div class="bd-meta">${esc(r.word_count)}` +
        // 신고 수는 관리자에게만 보여준다. 다른 사람에게 보이면
        // "신고 많은 자료"가 오히려 눈에 띄고, 보복 신고도 생긴다.
        (isAdmin && r.report_count > 0 ? ` <span class="bd-flag">🚩 ${esc(r.report_count)}</span>` : '') +
      '</div>' +
      '<div class="bd-actions">' +
        `<button class="bd-dl" data-dl="${esc(r.id)}">⬇ ${t('받기', 'Get')}</button>` +
        (canDelete
          ? `<button class="bd-del" data-del="${esc(r.id)}">${t('삭제', 'Delete')}</button>`
          : `<button class="bd-del" data-report="${esc(r.id)}">${t('신고', 'Report')}</button>`) +
      '</div>';
    list.appendChild(el);
  }
}

async function loadLibrary() {
  $('libLoading').classList.remove('hidden');
  $('libEmpty').classList.add('hidden');
  $('libError').classList.add('hidden');

  const { data: { session } } = await sb.auth.getSession();
  libSession = session;

  try {
    // words 는 무겁다. 목록에는 안 쓰므로 받을 때만 따로 가져온다.
    const { data, error } = await sb
      .from('resources')
      // report_count 는 여기서 읽지 않는다. 이 컬럼은 신고 기능과 함께
      // 나중에 붙는 것이라, 목록 조회에 섞으면 마이그레이션 전에는
      // 조회 전체가 400 으로 죽는다. 배지는 관리자만 보므로 아래에서
      // 따로 가져오고, 실패하면 배지 없이 넘어간다.
      .select('id,title,description,category,word_count,author,downloads,created_at,user_id')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    libRows = data ?? [];
    renderLibrary();
    loadReportCounts();   // 관리자에게만 의미가 있다. 늦게 붙어도 된다.
  } catch (e) {
    $('libError').classList.remove('hidden');
  } finally {
    $('libLoading').classList.add('hidden');
  }
}

$('libRetry').addEventListener('click', loadLibrary);

$('libList').addEventListener('click', async (ev) => {
  const dl = ev.target.closest('[data-dl]');
  if (dl) return downloadResource(Number(dl.dataset.dl), dl);
  const del = ev.target.closest('[data-del]');
  if (del) return deleteResource(Number(del.dataset.del));
  const rep = ev.target.closest('[data-report]');
  if (rep) return openReport(Number(rep.dataset.report));
});

// ── 신고 ─────────────────────────────────────────────────────
let reportingId = null;

/* 신고 수는 따로, 관리자일 때만 가져온다.
   db/resource_reports.sql 을 아직 안 돌렸으면 report_count 컬럼이 없어
   400 이 난다. 그때는 조용히 넘어가면 그만이다 — 배지가 안 보일 뿐
   목록은 멀쩡하다. 목록 조회에 섞었다면 자료마당 전체가 죽었을 것이다. */
async function loadReportCounts() {
  if (libSession?.user?.email !== ADMIN_EMAIL) return;
  try {
    const { data, error } = await sb.from('resources').select('id,report_count');
    if (error || !data) return;
    const map = new Map(data.map((r) => [r.id, r.report_count]));
    let changed = false;
    for (const r of libRows) {
      const n = map.get(r.id) ?? 0;
      if (r.report_count !== n) { r.report_count = n; changed = true; }
    }
    if (changed) renderLibrary();
  } catch (e) {
    // 마이그레이션 전 — 배지 없이 그대로 둔다.
  }
}

const repMsg = (id, text) => { ['libReportErr','libReportOk'].forEach(k => $(k).classList.add('hidden'));
  if (!id) return; $(id).textContent = text; $(id).classList.remove('hidden'); };

async function openReport(id) {
  const { data: { session } } = await sb.auth.getSession();
  // 신고하려면 누가 신고했는지 남아야 한다. 익명 신고는 같은 사람이
  // 몇 번이고 눌러 숫자를 부풀릴 수 있어 받지 않는다.
  if (!session) return open('account');

  reportingId = id;
  const row = libRows.find((r) => r.id === id);
  $('libReportOn').innerHTML = t(`<b>${esc(row?.title ?? '')}</b> 자료를 신고합니다.`,
                                 `Reporting <b>${esc(row?.title ?? '')}</b>.`);
  $('libReportDetail').value = '';
  repMsg(null);
  $('libReport').classList.remove('hidden');
  $('libReport').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

$('libReportCancel').addEventListener('click', () => {
  reportingId = null;
  $('libReport').classList.add('hidden');
});

$('libReportSend').addEventListener('click', async () => {
  if (reportingId == null) return;
  repMsg(null);
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return open('account');

  const btn = $('libReportSend');
  btn.disabled = true;
  const { error } = await sb.from('resource_reports').insert({
    resource_id: reportingId,
    reason: $('libReason').value,
    detail: $('libReportDetail').value.trim() || null,
    user_id: session.user.id,
  });
  btn.disabled = false;

  if (error) {
    // 같은 자료를 두 번 신고하면 unique 제약에 걸린다. 오류로 보이면
    // 안 되고, 이미 접수됐다고 알려주는 게 맞다.
    const dup = (error.code === '23505') || /duplicate|unique/i.test(error.message || '');
    return repMsg('libReportErr', dup
      ? t('이미 신고한 자료예요.', 'You have already reported this one.')
      : t('신고를 보내지 못했어요. 잠시 후 다시 시도해 주세요.', 'Could not send the report. Please try again.'));
  }

  repMsg('libReportOk', t('신고를 받았어요. 확인 후 처리하겠습니다.',
                          'Report received. We will review it.'));
  reportingId = null;
  setTimeout(() => { $('libReport').classList.add('hidden'); loadLibrary(); }, 1600);
});

async function downloadResource(id, btn) {
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = '…';
  try {
    const { data, error } = await sb.from('resources').select('title, words').eq('id', id).single();
    if (error) throw error;

    // 앱 내보내기와 같은 머리글. 이대로 앱의 가져오기에 들어간다.
    // 남이 올린 값이라 그대로 믿지 않는다. 글자와 숫자로 못박아 넣는다.
    // (수식 주입은 해당 없다 — SheetJS 는 문자열 셀로 쓰고, xlsx 는 수식을
    //  별도 <f> 요소에 담아서 Excel 이 문자열을 계산하지 않는다.)
    const aoa = [
      ['단어', '뜻', '난이도'],
      ...(data.words ?? []).map((w) => [String(w?.w ?? ''), String(w?.m ?? ''), Number(w?.d) || 1]),
    ];
    await needXLSX();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 26 }, { wch: 34 }, { wch: 9 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '단어장');
    XLSX.writeFile(wb, `${String(data.title).replace(/[\\/:*?"<>|]/g, '_')}.xlsx`);

    // 세는 데 실패해도 파일은 이미 받았다. 조용히 넘어간다.
    sb.rpc('bump_resource_download', { rid: id }).then(() => {
      const row = libRows.find((r) => r.id === id);
      if (row) { row.downloads += 1; renderLibrary(); }
    }, () => {});
  } catch (e) {
    btn.textContent = t('실패', 'Failed');
    setTimeout(() => { btn.textContent = label; }, 1600);
    return;
  } finally {
    btn.disabled = false;
  }
  btn.textContent = label;
}

async function deleteResource(id) {
  const row = libRows.find((r) => r.id === id);
  const ok = confirm(t(`"${row?.title ?? ''}" 자료를 지울까요? 되돌릴 수 없어요.`,
                       `Delete "${row?.title ?? ''}"? This cannot be undone.`));
  if (!ok) return;
  const { error } = await sb.from('resources').delete().eq('id', id);
  if (error) return;
  libRows = libRows.filter((r) => r.id !== id);
  renderLibrary();
}

/* ══ 게임 : 인형뽑기 ═══════════════════════════════════════════
   뜻을 하나 보여 주고, 그 뜻에 맞는 단어를 쓴 인형을 뽑게 한다.

   ── 내 단어장 단어로만 논다 ──────────────────────────────────
   그래서 로그인이 필요하다. 아무 단어나 내면 그냥 심심풀이지만, 내가
   저장해 둔 단어가 나오면 노는 것이 곧 복습이 된다. 로그인 전에는
   무엇이 기다리는지 알려 주고 로그인으로 보낸다.

   ── 왜 캔버스가 아닌가 ───────────────────────────────────────
   인형 이름은 사람이 넣은 글이다. DOM 이면 textContent 로 넣어 끝이고
   글자 크기·줄바꿈·화면 낭독까지 브라우저가 해 준다. 캔버스로 그리면
   그 전부를 손으로 다시 만들어야 한다. */

const CLAW_ROUNDS = 5;
const CLAW_DOLLS  = 4;
// 집게가 오가는 범위와 속도(% / 프레임). 인형은 이 안에 놓는다.
const CLAW_MIN = 10, CLAW_MAX = 90, CLAW_SPEED = 0.85;
// 앞뒤. 0 이 앞(나에게 가까운 줄), 1 이 뒤. 한쪽 끝에서 끝까지 약 1.2초.
const CLAW_ZSPEED = 0.014;
/* 유리장 안쪽 깊이(px). z(0~1) 를 여기에 곱해 translateZ 로 넣는다.
   좁은 화면에서는 CSS 가 이 값을 줄이므로(뒷줄이 너무 멀어지지 않게)
   상수로 들고 있으면 어긋난다 — 뒷벽보다 인형이 뒤에 서는 꼴이 된다.
   그래서 그때그때 CSS 에서 읽는다. */
function clawDepth() {
  const v = parseFloat(getComputedStyle($('clawMachine')).getPropertyValue('--depth'));
  return v || 210;
}
// 인형이 놓이는 두 줄의 깊이. 둘 다 바닥에 서므로 높이는 하나뿐이다.
const CLAW_ROW_Z = [0, 1];
/* 바닥에서 띄우는 높이. 크게 잡으면 인형이 바닥에 선 게 아니라
   떠 있는 것으로 보인다. 그림자가 잘리지 않을 만큼만 남긴다. */
const CLAW_FLOOR_Y = 8;
const CLAW_RAIL_TOP = 26;     // 레일 높이(면 안에서)
const CLAW_HEAD_H = 30;       // 집게 머리 높이
// 출구 자리. CSS 의 .chute 와 같은 곳을 가리켜야 한다.
const CLAW_EXIT_X = 12, CLAW_EXIT_Z = 0;
const CLAW_BEST_KEY = 'clawBest';
/* 잡히는 거리. 가로는 인형 사이가 25% 안팎이라 9% 면 인형 위에서는
   넉넉히 잡히고 사이에서는 헛집는다. 0 에 가깝게 두면 실력이 아니라
   운이 된다. 깊이는 줄이 앞뒤 둘뿐이라 넉넉히 0.4 를 준다 — 손잡이를
   끝까지 밀지 않아도 그 줄로 읽힌다. */
const CLAW_CATCH = 9, CLAW_ZCATCH = 0.4;
/* 인형 한 마리의 높이(몸 + 이름표). 집게가 얼마나 내려가야 닿는지,
   들어 올렸을 때 어디에 매달리는지를 이 값으로 잰다.

   화면 폭에 따라 인형 크기가 달라지므로 상수로 두면 좁은 화면에서
   집게가 허공에서 멈춘다. 그래서 판에 놓인 것을 직접 잰다. */
const CLAW_DOLL_H = 98;   // 못 재면 쓰는 값
function clawDollH() {
  const d = $('clawStage').querySelector('.doll');
  return d ? d.offsetHeight : CLAW_DOLL_H;
}

let clawPool = [];       // [{word, meaning}] — 내 단어장에서 온 것
let clawRound = 0, clawScore = 0;
let clawTarget = null;
let clawBusy = false;    // 집는 중 — 두 번 눌리면 두 번 내려간다
let clawDone = false;
let clawRaf = 0;
let clawX = 50, clawZ = 0;                  // 가로(%) 와 깊이(0 앞 ~ 1 뒤)
let clawDx = 0, clawDz = 0;                 // 누르고 있는 방향

// 한 번에 하나만 보여 준다. 각자 토글하면 두 개가 겹쳐 뜬다.
const CLAW_PANELS = ['clawLoading', 'clawNeedLogin', 'clawFew', 'clawErr', 'clawPlay', 'clawOver'];
function clawPanel(name) {
  CLAW_PANELS.forEach((k) => $(k).classList.toggle('hidden', k !== name));
}

/* ── 집게 움직임 ─────────────────────────────────────────────
   저절로 오가지 않는다. ◀▶ 를 누르고 있는 동안만 움직이고, 놓으면
   그 자리에 선다 — 진짜 오락실 기계가 그렇다. 조준이 쉬워진 만큼
   승부는 온전히 "이 뜻의 단어가 무엇인가" 로 넘어간다. */
const CLAW_ARROWS = { '-1,0': 'clawLeft', '1,0': 'clawRight', '0,-1': 'clawDown', '0,1': 'clawUp' };

/** 집게를 지금 좌표에 놓는다. 깊이는 translateZ 하나로 끝이고,
 *  얼마나 작아 보일지는 원근이 정한다. */
function clawPlace() {
  const tz = -(clawDepth() * clawZ) + 'px';
  $('clawUnit').style.left = clawX + '%';
  $('clawUnit').style.setProperty('--tz', tz);
  $('clawRail').style.setProperty('--tz', tz);
}

function clawTick() {
  if (!clawDx && !clawDz) { clawRaf = 0; return; }   // 놓으면 루프도 같이 끝난다
  clawX = Math.min(CLAW_MAX, Math.max(CLAW_MIN, clawX + clawDx * CLAW_SPEED));
  clawZ = Math.min(1, Math.max(0, clawZ + clawDz * CLAW_ZSPEED));
  clawPlace();
  clawRaf = requestAnimationFrame(clawTick);
}

function clawStop() {
  clawDx = 0; clawDz = 0;
  if (clawRaf) cancelAnimationFrame(clawRaf);
  clawRaf = 0;
  $('clawStick').className = 'stick';
  Object.values(CLAW_ARROWS).forEach((id) => $(id).classList.remove('on'));
}
// 위 고전 스크립트의 ptShow 가 화면을 넘길 때 부른다.
window.clawStop = clawStop;

/**
 * dx: -1 왼쪽 · 1 오른쪽 / dz: -1 앞으로 · 1 뒤로.
 *
 * 한 번에 한 방향만 간다. 대각선까지 받으면 버튼 넷으로는 낼 수 없는
 * 입력이라 키보드로 하는 사람과 손가락으로 하는 사람의 조작이 갈린다.
 */
function clawHold(dx, dz) {
  if (clawBusy || clawDone || $('clawPlay').classList.contains('hidden')) return;
  if (clawDx === dx && clawDz === dz) return;
  clawDx = dx; clawDz = dz;
  $('clawStick').className = 'stick ' + (dx < 0 ? 'l' : dx > 0 ? 'r' : dz > 0 ? 'u' : 'd');
  // 한쪽을 누른 채 다른 쪽을 누르면 방향은 바뀌는데 눌린 표시가 둘 다
  // 남는다. 먼저 다 지우고 새로 켠다.
  const on = CLAW_ARROWS[dx + ',' + dz];
  Object.values(CLAW_ARROWS).forEach((id) => $(id).classList.toggle('on', id === on));
  if (!clawRaf) clawRaf = requestAnimationFrame(clawTick);
}

/* ── 단어 모으기 (게임 셋이 함께 쓴다) ───────────────────────
   왜 이렇게 됐는지를 돌려준다. 못 놀 때 "안 됩니다" 만 뜨면 로그인을
   해야 하는지, 단어를 더 넣어야 하는지, 잠시 뒤 다시 오면 되는지
   알 수 없다. 돌려주는 값은 'NeedLogin' | 'Few' | 'Err' | 'Play' 이고,
   부르는 쪽이 제 화면 이름(clawFew, quizFew …)에 붙여 쓴다.

   게임마다 필요한 단어 수가 다르다(짝 맞추기는 여섯 쌍). 그래서
   최소 개수를 밖에서 받는다. */
let gameWords = [];
async function gameLoadWords(min) {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return 'NeedLogin';

    const { data, error } = await sb.from('words')
      .select('word, meaning').eq('user_id', session.user.id).limit(300);
    if (error) return 'Err';

    // 단어나 뜻이 빈 줄은 문제로 낼 수 없다.
    const ok = (data || []).filter((w) => w.word?.trim() && w.meaning?.trim());
    if (ok.length < min) return 'Few';

    gameWords = ok;
    return 'Play';
  } catch (e) {
    return 'Err';
  }
}

/** 배열을 뒤섞는다. 원본은 두고 새 배열을 돌려준다. */
function gameShuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 기기에 남기는 최고 기록. 서버에 표를 둘 만큼 중한 값이 아니다. */
function gameBest(key, score) {
  try {
    const had = parseInt(localStorage.getItem(key), 10) || 0;
    if (score > had) { localStorage.setItem(key, String(score)); return score; }
    return had;
  } catch (e) { return 0; }
}
function gameBestRead(key) {
  try { return parseInt(localStorage.getItem(key), 10) || 0; } catch (e) { return 0; }
}

async function clawLoadPool() {
  const where = await gameLoadWords(CLAW_DOLLS);
  if (where === 'Play') clawPool = gameWords;
  return 'claw' + where;
}

/* 한 판에 놓을 인형 수. 좁은 화면에서는 셋만 놓는다.
   360px 에서 넷을 놓으면 인형 중심 사이가 74px 밖에 안 되어
   "perseverance" 같은 이름표가 단어 중간에서 끊긴다. 못 읽는 이름표는
   게임을 망가뜨리지만, 셋 중에 고르는 것은 조금 쉬워질 뿐이다.
   (단어가 넷 이상 있어야 한다는 조건은 그대로 둔다 — 화면을 돌리거나
   창을 늘렸을 때 갑자기 못 놀게 되면 그게 더 이상하다.) */
const clawCount = () => (matchMedia('(max-width:759px)').matches ? 3 : CLAW_DOLLS);

// ── 한 판 깔기 ───────────────────────────────────────────────
function clawDeal() {
  const idx = [...clawPool.keys()];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }

  const want = clawCount();
  const pick = [];
  for (const i of idx) {
    const w = clawPool[i];
    // 같은 이름표가 둘이면 어느 것을 뽑아도 맞아 버려 문제가 성립하지 않는다.
    if (pick.some((p) => p.word === w.word)) continue;
    pick.push(w);
    if (pick.length === want) break;
  }

  clawTarget = pick[Math.floor(Math.random() * pick.length)];

  /* 가로로 고르게 벌려 놓고 앞줄·뒷줄을 번갈아 준다.
     같은 x 에 앞뒤로 겹쳐 놓으면 뒤엣것의 이름표가 앞 인형 몸에 가려
     안 읽힌다. 지그재그로 두면 다 읽히고, 무더기도 더 그럴듯해진다.

     맨 왼쪽을 뒷줄에 주는 것은 앞쪽 왼편이 출구 자리라서다. */
  const n = pick.length;
  const lo = CLAW_MIN + 2, hi = CLAW_MAX - 2;
  const step = n > 1 ? (hi - lo) / (n - 1) : 0;
  const machine = $('clawMachine');
  const stage = $('clawStage');
  const depth = clawDepth();
  machine.querySelectorAll('.doll').forEach((d) => d.remove());

  pick.forEach((w, i) => {
    const at = { x: n > 1 ? lo + step * i : 50, row: i % 2 === 0 ? 1 : 0 };
    const el = document.createElement('div');
    el.className = 'doll';
    el.style.left = at.x + '%';
    el.style.bottom = CLAW_FLOOR_Y + 'px';
    // 깊이만 준다. 크기도 위치도 원근이 알아서 맞춘다.
    el.style.setProperty('--tz', -(depth * CLAW_ROW_Z[at.row]) + 'px');
    el.dataset.z = CLAW_ROW_Z[at.row];
    el.dataset.row = at.row;
    // 치즈와 감자를 번갈아 놓는다. 같은 것만 넷이면 무더기가 심심하다.
    el.innerHTML =
      '<div class="doll-body ' + (i % 2 ? 'potato' : 'cheese') + '">' +
        '<i class="doll-dot a"></i><i class="doll-dot b"></i>' +
        '<i class="doll-blush l"></i><i class="doll-blush r"></i>' +
        '<span class="doll-face"><i class="doll-eye"></i><i class="doll-eye"></i></span>' +
        '<span class="doll-mouth"></span>' +
      '</div><span class="doll-tag"></span><i class="doll-shade"></i>';
    // 사람이 넣은 글이다. innerHTML 로 넣으면 내 단어가 태그가 된다.
    el.querySelector('.doll-tag').textContent = w.word;
    // 무대 안에 넣어야 같은 원근을 받는다. 기계에 바로 붙이면
    // 유리 바깥에 평면으로 떠 버린다.
    stage.appendChild(el);
  });
}

// ── 집기 ─────────────────────────────────────────────────────
function clawGo() {
  if (clawBusy || clawDone) return;
  clawBusy = true;
  clawStop();
  $('clawGrab').disabled = true;
  clawSay('', '');
  clawScreen('', t('내려갑니다', 'LOWERING'));

  const machine = $('clawMachine');
  const unit = $('clawUnit');

  /* 가로와 깊이를 함께 본다. 각 축을 저마다의 허용 거리로 나눠서 재면
     "가로로는 멀지만 깊이로는 딱" 같은 애매한 경우가 한 값으로 정리된다. */
  let hit = null, best = Infinity;
  for (const el of machine.querySelectorAll('.doll')) {
    const dx = (parseFloat(el.style.left) - clawX) / CLAW_CATCH;
    const dz = (parseFloat(el.dataset.z) - clawZ) / CLAW_ZCATCH;
    const d = dx * dx + dz * dz;
    if (d < best) { best = d; hit = el; }
  }
  if (best > 1) hit = null;                          // 둘 다 안 닿으면 빈손

  /* 줄 길이는 깊이와 상관없다. 집게와 인형이 같은 Z 면 위에 있으므로
     그 면 안에서만 재면 되고, 화면에서 얼마나 짧아 보일지는 원근이
     알아서 줄인다. 예전에는 이걸 손으로 보정하느라 식이 길었다. */
  const h = machine.clientHeight;
  const cord = $('clawCord');
  const dollH = clawDollH();
  const reach = h - CLAW_RAIL_TOP - CLAW_HEAD_H - CLAW_FLOOR_Y - dollH;

  cord.style.height = reach + 'px';                   // 내려간다
  setTimeout(() => {                                  // 오므린다
    unit.classList.add('shut');
    if (hit) hit.style.left = clawX + '%';
  }, 470);
  setTimeout(() => {                                  // 올라온다
    cord.style.height = CLAW_RAIL_TOP + 'px';
    if (hit) hit.style.bottom = (h - CLAW_RAIL_TOP - CLAW_HEAD_H - dollH) + 'px';
  }, 700);
  setTimeout(() => clawJudge(hit), 1260);
}

/**
 * 뽑은 인형을 출구까지 옮겨 떨어뜨린다.
 *
 * 집자마자 사라지게 두면 "뽑았다" 는 실감이 안 난다. 기계가 손님 앞으로
 * 물건을 날라다 주는 그 몇 초가 인형뽑기의 값이다.
 */
function clawDeliver(doll) {
  $('clawUnit').classList.add('carry');
  clawX = CLAW_EXIT_X; clawZ = CLAW_EXIT_Z;
  clawPlace();
  doll.style.left = CLAW_EXIT_X + '%';

  // 인형도 집게를 따라 앞으로 나온다 — 같은 Z 에 있어야 매달린 것으로 보인다.
  doll.style.setProperty('--tz', '0px');

  setTimeout(() => {
    $('clawUnit').classList.remove('shut');           // 놓는다
    doll.style.bottom = '10px';
    // 크기는 transform 전체가 아니라 --s 로만 건드린다. 통째로 덮으면
    // 깊이(--tz)까지 지워져 인형이 순간 튄다.
    doll.style.setProperty('--s', '.45');
    doll.classList.add('won');                        // 구멍으로 사라진다
  }, 620);
}

function clawJudge(hit) {
  const answer = clawTarget.word;
  const got = hit ? hit.querySelector('.doll-tag').textContent : null;

  if (got === answer) {
    clawScore++;
    clawDeliver(hit);
    clawSay('good', t('맞았어요! 🎉', 'Got it! 🎉'));
    clawScreen('win', 'WINNER!');
  } else if (got) {
    clawSay('bad', t(`아쉬워요 — 정답은 “${answer}” 였어요.`,
                     `So close — the answer was “${answer}”.`));
    clawScreen('miss', 'TRY AGAIN');
  } else {
    // 양옆만 맞추고 앞뒤를 안 맞춘 경우가 대부분이다. 그 얘기를 해 준다.
    clawSay('bad', t('빈손이에요. 양옆뿐 아니라 앞뒤(▲▼)도 인형에 맞춰 보세요.',
                     'Empty claw — match the depth (▲▼) too, not just left and right.'));
    clawScreen('miss', 'MISSED');
  }
  clawPills();

  // 맞았으면 출구까지 옮겨 떨어뜨리는 시간을 더 준다. 그 장면이
  // 이 게임의 상이라 잘라 먹으면 뽑은 맛이 안 난다.
  setTimeout(() => {
    $('clawUnit').classList.remove('shut');
    if (clawRound >= CLAW_ROUNDS) clawFinish();
    else clawNext();
  }, got === answer ? 2100 : 1500);
}

// ── 판 넘기기 ────────────────────────────────────────────────
function clawNext() {
  clawRound++;
  // 출구까지 실어 나른 뒤라면 집게가 왼쪽 구석에 서 있다. 가운데로
  // 되돌려 어느 줄이든 같은 거리에서 시작하게 한다.
  $('clawUnit').classList.remove('carry');
  clawX = 50; clawZ = 0;
  clawPlace();
  clawDeal();
  clawPills();
  $('clawTarget').textContent = clawTarget.meaning;
  clawSay('', '');
  clawScreen('', 'READY');
  clawBusy = false;
  $('clawGrab').disabled = false;
}

function clawFinish() {
  clawDone = true;
  clawStop();
  // 최고 기록은 이 기기에만 남긴다. 서버에 표를 하나 더 두고 지킬 만큼
  // 중한 값이 아니고, 로그인 없이도 다음에 볼 수 있으면 그만이다.
  try {
    if (clawScore > (parseInt(localStorage.getItem(CLAW_BEST_KEY), 10) || 0)) {
      localStorage.setItem(CLAW_BEST_KEY, String(clawScore));
    }
  } catch (e) { /* 저장을 막아 둔 브라우저 — 기록만 없을 뿐 게임은 멀쩡하다 */ }
  clawSyncBest();    // 방금 세운 기록이 그 자리에서 보여야 한다
  clawPanel('clawOver');
  clawSyncOver();
}

async function clawStart() {
  clawStop();
  clawDone = false; clawBusy = true;
  clawRound = 0; clawScore = 0;
  clawX = 50; clawZ = 0;
  $('clawUnit').classList.remove('shut', 'carry');
  clawPlace();
  $('clawCord').style.height = CLAW_RAIL_TOP + 'px';
  $('clawGrab').disabled = true;
  clawSay('', '');
  clawScreen('', 'READY');
  clawSyncStatic();

  /* 판을 시작할 때마다 다시 읽는다. 한 번 읽어 두면 앱에서 방금 넣은
     단어가 안 나오고, 그 사이 세션이 끊겨도 계속 놀 수 있는 것처럼
     보인다. 조회 한 번 값이라 아낄 이유가 없다. */
  clawPanel('clawLoading');
  const where = await clawLoadPool();
  // 로그인이 필요하거나, 단어가 모자라거나, 못 읽었다.
  if (where !== 'clawPlay') { clawPanel(where); return; }

  clawPanel('clawPlay');
  clawNext();
}

// ── 글 ───────────────────────────────────────────────────────
function clawSay(kind, text) {
  const el = $('clawMsg');
  el.className = 'claw-msg' + (kind ? ' ' + kind : '');
  el.textContent = text;
}

function clawPills() {
  $('clawRound').textContent = `${Math.min(clawRound, CLAW_ROUNDS)} / ${CLAW_ROUNDS}`;
  $('clawScore').textContent = `🧀 ${clawScore}`;
}

/** 전광판. kind 는 '' | 'win' | 'miss'. */
function clawScreen(kind, text) {
  $('clawScreen').className = 'cab-screen' + (kind ? ' ' + kind : '');
  $('clawScreenTxt').textContent = text;
}

function clawSyncBest() {
  let best = 0;
  try { best = parseInt(localStorage.getItem(CLAW_BEST_KEY), 10) || 0; } catch (e) {}
  const el = $('clawBest');
  el.classList.toggle('hidden', best <= 0);
  el.textContent = t(`최고 ${best} / ${CLAW_ROUNDS}`, `Best ${best} / ${CLAW_ROUNDS}`);
}

/* 판과 무관하게 언어만 따라가는 글. applyLang 은 [data-en] 의 innerHTML 을
   통째로 바꾸므로 여기 글에는 data-en 을 달 수 없다. */
function clawSyncStatic() {
  $('clawBackTxt').textContent = t('게임', 'Games');
  $('clawAskLabel').textContent = t('이 뜻을 가진 단어를 뽑으세요', 'Grab the word for this meaning');
  $('clawAgain').textContent = t('다시 하기', 'Play again');
  $('clawToGames').textContent = t('다른 게임 보기', 'Other games');
  $('clawNote').textContent = t('◀ ▶ ▲ ▼ 로 앞뒤·양옆을 맞추고 LOWER CLAW 를 누르세요. 뽑은 인형은 출구로 나옵니다.',
                                'Line it up with ◀ ▶ ▲ ▼, then press LOWER CLAW. What you catch drops out the chute.');
  clawSyncBest();
}

function clawSyncOver() {
  const all = clawScore === CLAW_ROUNDS;
  $('clawOverEmoji').textContent = all ? '🏆' : clawScore >= 3 ? '🧸' : '🥔';
  $('clawOverScore').textContent = `${clawScore} / ${CLAW_ROUNDS}`;
  $('clawOverLine').textContent = all
    ? t('전부 뽑았어요. 단어가 손에 붙었네요.', 'A clean sweep — those words are yours.')
    : clawScore >= 3
      ? t('잘하고 있어요. 한 판 더 해볼까요?', 'Nicely done. One more round?')
      : t('괜찮아요. 틀린 단어일수록 오래 남아요.', 'No worries — the ones you miss are the ones you remember.');
}

$('gcClaw').addEventListener('click', () => { open('claw'); clawStart(); });
$('clawGoLogin').addEventListener('click', () => open('account'));
$('clawGoLib').addEventListener('click', () => { open('library'); loadLibrary(); });
$('clawRetry').addEventListener('click', () => clawStart());
$('clawBack').addEventListener('click', () => open('games'));
$('clawToGames').addEventListener('click', () => open('games'));
$('clawAgain').addEventListener('click', () => clawStart());
$('clawGrab').addEventListener('click', clawGo);
$('clawStart').addEventListener('click', () => clawStart());

/* ── 조작 ────────────────────────────────────────────────────
   누르고 있는 동안 움직이고 놓으면 선다. pointer 이벤트 하나로 마우스와
   손가락을 같이 받는다. pointerleave·pointercancel 까지 놓아 주지 않으면
   버튼 밖에서 손을 떼었을 때 집게가 계속 달린다. */
Object.entries(CLAW_ARROWS).forEach(([dir, id]) => {
  const [dx, dz] = dir.split(',').map(Number);
  const el = $(id);
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); clawHold(dx, dz); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((k) => el.addEventListener(k, clawStop));
});
// 창을 벗어나면 손을 뗀 것으로 본다(탭 전환 등).
addEventListener('blur', clawStop);

// 위/아래 키는 앞뒤다. ▲ 가 뒤(멀어짐)인 것은 화면에서 위가 안쪽이라서다.
const CLAW_KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };

addEventListener('keydown', (e) => {
  if (!showing('clawView') || $('clawPlay').classList.contains('hidden')) return;
  if (e.target.closest('input, textarea, select')) return;
  const dir = CLAW_KEYS[e.key];
  if (dir) { e.preventDefault(); clawHold(dir[0], dir[1]); return; }
  if (e.code === 'Space') {
    // 버튼에 초점이 있으면 브라우저가 이미 누름으로 바꿔 준다. 두 번 집지 않는다.
    if (e.target.closest('button')) return;
    e.preventDefault();
    clawGo();
  }
});
addEventListener('keyup', (e) => { if (CLAW_KEYS[e.key]) clawStop(); });

/* ══ 게임 : 짝 맞추기 ══════════════════════════════════════════
   여섯 쌍, 열두 장. 단어 카드와 뜻 카드를 짝지어 뒤집는다.

   점수는 맞힌 수가 아니라 **뒤집은 횟수**다. 열두 장이니 언젠가는
   다 맞는다 — 재미는 "몇 번 만에 끝냈나" 에 있고, 적을수록 잘한 것이다.
   그래서 최고 기록도 가장 작은 값을 남긴다. */

const MT_PAIRS = 6;
const MT_BEST_KEY = 'matchBest';

let mtCards = [], mtOpen = [];
let mtLeft = 0, mtFlips = 0, mtBusy = false, mtDone = false;

const MT_PANELS = ['matchLoading', 'matchNeedLogin', 'matchFew', 'matchErr', 'matchPlay', 'matchOver'];
function mtPanel(name) { MT_PANELS.forEach((k) => $(k).classList.toggle('hidden', k !== name)); }

async function mtStart() {
  mtDone = false; mtBusy = true; mtFlips = 0; mtOpen = [];
  mtSyncStatic();
  mtPanel('matchLoading');
  // 판마다 다시 읽는다. 앱에서 방금 넣은 단어가 안 나오면 고장으로 보인다.
  const where = await gameLoadWords(MT_PAIRS);
  if (where !== 'Play') { mtPanel('match' + where); return; }
  mtPanel('matchPlay');
  mtDeal();
}

function mtDeal() {
  const pick = [];
  for (const w of gameShuffle(gameWords)) {
    // 같은 단어가 두 쌍이면 어느 것과 맞춰도 맞아 버린다.
    if (pick.some((p) => p.word === w.word || p.meaning === w.meaning)) continue;
    pick.push(w);
    if (pick.length === MT_PAIRS) break;
  }

  const cards = [];
  pick.forEach((w, i) => {
    cards.push({ pair: i, kind: 'word', text: w.word });
    cards.push({ pair: i, kind: 'mean', text: w.meaning });
  });
  mtCards = gameShuffle(cards);
  mtLeft = pick.length;

  const grid = $('matchGrid');
  grid.textContent = '';
  mtCards.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mt-card';
    b.innerHTML = '<span class="mt-inner">' +
      '<span class="mt-face mt-back">🧀</span>' +
      '<span class="mt-face mt-front"></span></span>';
    const front = b.querySelector('.mt-front');
    if (c.kind === 'mean') front.classList.add('mean');
    // 사람이 넣은 글이다. innerHTML 로 넣으면 내 단어가 태그가 된다.
    front.textContent = c.text;
    b.addEventListener('click', () => mtFlip(c));
    c.el = b;
    grid.appendChild(b);
  });

  mtBusy = false;
  mtSay('', '');
  mtCount();
}

function mtFlip(c) {
  if (mtBusy || mtDone || c.done || mtOpen.includes(c)) return;
  c.el.classList.add('open');
  mtOpen.push(c);
  if (mtOpen.length < 2) return;

  mtFlips++;
  const [a, b] = mtOpen;

  if (a.pair === b.pair) {
    a.done = b.done = true;
    a.el.classList.add('done'); b.el.classList.add('done');
    a.el.disabled = b.el.disabled = true;
    mtOpen = [];
    mtLeft--;
    mtSay('good', t('짝을 찾았어요!', 'Pair found!'));
    mtCount();
    if (mtLeft === 0) setTimeout(mtFinish, 800);
    return;
  }

  // 틀린 짝은 잠깐 보여 주고 덮는다. 바로 덮으면 무엇이었는지 못 본다.
  mtBusy = true;
  mtSay('bad', t('짝이 아니에요.', 'Not a pair.'));
  mtCount();
  setTimeout(() => {
    a.el.classList.remove('open');
    b.el.classList.remove('open');
    mtOpen = []; mtBusy = false;
    mtSay('', '');
  }, 900);
}

function mtFinish() {
  mtDone = true;
  try {
    const had = parseInt(localStorage.getItem(MT_BEST_KEY), 10) || 0;
    // 적을수록 잘한 것이라 최솟값을 남긴다.
    if (!had || mtFlips < had) localStorage.setItem(MT_BEST_KEY, String(mtFlips));
  } catch (e) { /* 저장을 막아 둔 브라우저 — 기록만 없을 뿐 게임은 멀쩡하다 */ }
  mtSyncBest();      // 방금 세운 기록이 그 자리에서 보여야 한다
  mtPanel('matchOver');
  mtSyncOver();
}

function mtSyncBest() {
  const best = gameBestRead(MT_BEST_KEY);
  $('matchBest').classList.toggle('hidden', best <= 0);
  $('matchBest').textContent = t(`최소 ${best}번`, `Best ${mtTurn(best)}`);
}

function mtSay(kind, text) {
  const el = $('matchMsg');
  el.className = 'claw-msg' + (kind ? ' ' + kind : '');
  el.textContent = text;
}

// 영어는 하나일 때 s 가 빠진다. "1 pairs left" 는 눈에 걸린다.
const mtPair = (n) => (n === 1 ? '1 pair' : `${n} pairs`);
const mtTurn = (n) => (n === 1 ? '1 turn' : `${n} turns`);

function mtCount() {
  $('matchLeft').textContent = t(`${mtLeft}쌍 남았어요`, `${mtPair(mtLeft)} left`);
  $('matchLabel').textContent = t(`같은 뜻끼리 짝지으세요 · 뒤집은 횟수 ${mtFlips}`,
                                  `Match each word with its meaning · ${mtTurn(mtFlips)}`);
}

function mtSyncStatic() {
  $('matchBackTxt').textContent = t('게임', 'Games');
  $('matchAgain').textContent = t('다시 하기', 'Play again');
  $('matchToGames').textContent = t('다른 게임 보기', 'Other games');
  $('matchNote').textContent = t('카드를 눌러 뒤집으세요. 단어는 내 단어장에서 옵니다.',
                                 'Tap a card to turn it over. The words come from your wordbook.');
  mtSyncBest();
  if (!$('matchPlay').classList.contains('hidden')) mtCount();
}

function mtSyncOver() {
  const perfect = mtFlips === MT_PAIRS;   // 한 번도 안 틀렸다
  $('matchOverEmoji').textContent = perfect ? '🏆' : mtFlips <= MT_PAIRS * 2 ? '🃏' : '🥔';
  $('matchOverScore').textContent = t(`${mtFlips}번`, mtTurn(mtFlips));
  $('matchOverLine').textContent = perfect
    ? t('한 번도 안 틀렸어요. 다 외우고 있었네요.', 'Not one wrong turn — you knew them all.')
    : mtFlips <= MT_PAIRS * 2
      ? t('좋아요. 다음엔 더 줄여 볼까요?', 'Nice. Think you can do it in fewer?')
      : t('괜찮아요. 헤맨 카드일수록 오래 남아요.', 'The ones you hunted for are the ones that stick.');
}

$('gcMatch').addEventListener('click', () => { open('match'); mtStart(); });
$('matchGoLogin').addEventListener('click', () => open('account'));
$('matchGoLib').addEventListener('click', () => { open('library'); loadLibrary(); });
$('matchRetry').addEventListener('click', () => mtStart());
$('matchBack').addEventListener('click', () => open('games'));
$('matchToGames').addEventListener('click', () => open('games'));
$('matchAgain').addEventListener('click', () => mtStart());

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
  for (const w of gameShuffle(gameWords)) {
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
  $('quizOverEmoji').textContent = qzScore >= 20 ? '🏆' : qzScore >= 10 ? '⏱' : '🥔';
  $('quizOverScore').textContent = t(`${qzScore}개`, `${qzScore}`);
  $('quizOverLine').textContent = qzScore >= 20
    ? t('빠르고 정확해요. 이 단어들은 이제 손에 붙었네요.', 'Fast and right — these are yours now.')
    : qzScore >= 10
      ? t('좋아요. 한 번 더 하면 더 빨라져요.', 'Solid. One more run and it gets quicker.')
      : t('괜찮아요. 방금 본 단어부터 다시 보면 돼요.', 'No rush — start with the ones you just saw.');
}

$('gcQuiz').addEventListener('click', () => { open('quiz'); qzStart(); });

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

function numStart() {
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
      ? t(`정답! ${numStreak}연속 🔥`, `Correct! ${numStreak} in a row 🔥`)
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
  $('numOverEmoji').textContent = pct === 1 ? '🏆' : pct >= 0.7 ? '🎉' : '🔢';
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
$('gcNum').addEventListener('click', () => { open('num'); numSetup(); });

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

$('quizGoLogin').addEventListener('click', () => open('account'));
$('quizGoLib').addEventListener('click', () => { open('library'); loadLibrary(); });
$('quizRetry').addEventListener('click', () => qzStart());
$('quizBack').addEventListener('click', () => open('games'));
$('quizToGames').addEventListener('click', () => open('games'));
$('quizAgain').addEventListener('click', () => qzStart());

// ── 헤더 선 ──────────────────────────────────────────────────
// 맨 위에서는 선을 두지 않는다. 스크롤을 내려 내용이 헤더 밑으로
// 지나갈 때만 선이 생겨서 층이 나뉜다.
const hd = document.querySelector('.site-hd');
const syncHd = () => hd.classList.toggle('scrolled', window.scrollY > 8);
addEventListener('scroll', syncHd, { passive: true });
syncHd();

// ── 발음 : AI 짐작 ───────────────────────────────────────────
// 위 고전 스크립트의 ptFinish 가 점수를 다 그린 뒤에 이걸 부른다.
// 점수는 건드리지 않는다 — 여기서 하는 일은 설명을 붙이는 것뿐이다.
// 그래서 이 영역이 통째로 사라져도 결과 화면은 멀쩡하다.
const AI_PANELS = ['ptAiLoad', 'ptAiOut', 'ptAiLogin', 'ptAiLimit'];
function aiPanel(name) {
  $('ptAi').classList.remove('hidden');
  AI_PANELS.forEach((k) => $(k).classList.toggle('hidden', k !== name));
}

$('ptAiLoginBtn').addEventListener('click', () => open('account'));

window.ptAiGuess = async (target, heard, score) => {
  // 만점이면 고칠 게 없다. 호출을 쓸 이유가 없다.
  if (score >= 100) { $('ptAi').classList.add('hidden'); return; }

  const { data: { session } } = await sb.auth.getSession();
  if (!session) { aiPanel('ptAiLogin'); return; }

  aiPanel('ptAiLoad');

  // 응답이 안 오면 점 세 개가 영원히 깜빡인다. 시간을 끊는다.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);

  try {
    const res = await fetch(`${SB_URL}/functions/v1/score-pronunciation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SB_ANON,
        Authorization: `Bearer ${session.access_token}`,
      },
      // 오디오는 보내지 않는다. 지문과 인식된 텍스트만 간다.
      body: JSON.stringify({ target, heard, accuracy: score }),
      signal: ctrl.signal,
    });
    const body = await res.json().catch(() => null);

    if (res.status === 429 || body?.error === 'daily_limit') { aiPanel('ptAiLimit'); return; }
    if (!res.ok || !body?.verdict) throw new Error('bad response');

    $('ptAiVerdict').textContent = body.verdict;
    $('ptAiList').innerHTML = (body.issues ?? []).map((it) =>
      '<div class="pt-ai-item">' +
        `<div class="pt-ai-chars">${esc(it.chars)}</div>` +
        `<div class="pt-ai-why">${esc(it.why)}</div>` +
        (it.tip ? `<div class="pt-ai-tip">💡 ${esc(it.tip)}</div>` : '') +
      '</div>'
    ).join('');
    aiPanel('ptAiOut');
  } catch (e) {
    // 점수는 이미 화면에 있다. 이 자리만 조용히 접는다.
    $('ptAi').classList.add('hidden');
  } finally {
    clearTimeout(timer);
  }
};

/* ══ 한국어 도우미 ═══════════════════════════════════════════════
   docs/ai-sidebar-plan.md 1단계 — 0층 조회만. 사전(GLOSSARY)과 문법
   표현(SB_CATS/SB_MORE)은 이미 누구나 보는 공개 자료라 로그인을 묻지
   않는다. AI(2단계)는 아직 안 부른다 — 자료에 없으면 「없다」고만
   말한다. gloss-find.js 의 원칙 그대로다: "틀린 뜻을 내주느니
   빈 칸을 내준다."

   문항 화면에서 답을 대신 풀어 주는 것을 막는 장치(3단계, where 를
   보고 잠그는 것)는 아직 없다 — 지금은 사전 조회뿐이라 그 문제가
   생기지 않는다. AI 가 붙는 2단계에서 반드시 넣는다. */

let hlpLastQ = '';   // 언어를 바꿨을 때 같은 결과를 다시 그리려고 쥐고 있는다.

/* 표시용 이름 비교를 위해 앞의 품사 표시(V-, A/V- 따위)와 공백을 뗀다.
   "V-(으)ㄹ 수 있다"와 사람이 치는 "을 수 있다"가 같아 보이게 하려는
   것이다. Ⓝ 같은 문자표는 grammar.js 전용(문장 속에서 찾을 때)이라
   여기 이름에는 안 나온다. */
const hlpNormName = (s) => String(s ?? '')
  .replace(/\s+/g, '')
  .replace(/^[AVN/]+-?/, '')
  .replace(/^-/, '');

function hlpFindWord(q) {
  const key = String(q ?? '').trim();
  if (!key) return null;
  const inDict = (k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k);
  const found = glossFind(inDict, key);
  if (!found) return null;
  const hit = GLOSSARY[found];
  return { query: key, head: hit.head || found, en: hit.en || '' };
}

/* 이름이 맞아떨어지는 것을 먼저, 이름 안에 들어 있는 것을 다음으로 —
   "-느니"를 치면 "-느니"가 맨 위에 오고 "-느니만 못하다" 같은 게
   뒤에 붙는 식이다. */
function hlpFindPoints(q) {
  const nq = hlpNormName(q);
  if (!nq) return [];
  const exact = [], partial = [];
  for (const p of SB_POINTS) {
    const nn = hlpNormName(p.name);
    if (nn === nq) exact.push(p);
    else if (nn.includes(nq)) partial.push(p);
  }
  return [...exact, ...partial];
}

function hlpWordCard(w) {
  return '<div class="hlp-card">' +
    `<div class="hlp-card-kind">${t('낱말', 'Word')}</div>` +
    `<div class="hlp-card-head">${esc(w.head)}</div>` +
    (w.head !== w.query ? `<div class="hlp-card-sub">${esc(w.query)}</div>` : '') +
    `<div class="hlp-card-meaning">${esc(w.en) || t('아직 뜻풀이가 없어요.', 'No definition yet.')}</div>` +
  '</div>';
}

function hlpPointCard(p) {
  const more = SB_MORE[p.id] || ['', '', '', ''];
  return '<div class="hlp-card">' +
    `<div class="hlp-card-kind">${t('문법 표현', 'Grammar')}</div>` +
    `<div class="hlp-card-head">${esc(p.name)}</div>` +
    `<div class="hlp-card-sub">${esc(isEn() ? p.cat.en : p.cat.ko)}</div>` +
    `<div class="hlp-card-meaning">${esc(gTx(p.id, 'desc', p.desc))}</div>` +
    (more[0] ? `<div class="hlp-fact"><div class="hlp-fact-k">${t('형태', 'Form')}</div><div class="hlp-fact-v">${esc(gTx(p.id, 'form', more[0]))}</div></div>` : '') +
    (more[2] ? `<div class="hlp-fact"><div class="hlp-fact-k">${t('주의할 점', 'Watch out')}</div><div class="hlp-fact-v">${esc(gTx(p.id, 'care', more[2]))}</div></div>` : '') +
    `<div class="hlp-fact"><div class="hlp-fact-k">${t('예문', 'Example')}</div><div class="hlp-fact-v">${esc(p.ex)}</div></div>` +
    `<a class="hlp-card-link" href="/sentence/${esc(p.id)}.html" target="_blank" rel="noopener">${t('자세히 보기 →', 'See details →')}</a>` +
  '</div>';
}

/* 2단계 — cites 모으기. 직접 이름이 맞은 표현(hlpFindPoints)과, 문장
   속에 섞여 있는 문법을 찾아내는 grammarScan(읽기 지문에서 쓰던 것과
   같은 도구) 을 합친다. "-느니랑 -을 바에야 차이가 뭐예요?" 처럼
   자연스러운 질문에서도 grammarScan 이 두 표현을 다 집어낸다 —
   hlpFindPoints 만으로는(이름 전체가 맞아야 하니) 못 찾는다.
   서버(ask-korean)는 여기서 넘긴 것 밖의 지식을 쓰지 않는다. */
function hlpCites(q) {
  const out = [];
  const seen = new Set();
  const addPoint = (p) => {
    if (!p || seen.has('p:' + p.id) || out.length >= 6) return;
    seen.add('p:' + p.id);
    const more = SB_MORE[p.id] || ['', '', '', ''];
    out.push({
      id: p.id, kind: 'point', name: p.name,
      desc: gTx(p.id, 'desc', p.desc),
      form: more[0] ? gTx(p.id, 'form', more[0]) : '',
      care: more[2] ? gTx(p.id, 'care', more[2]) : '',
      ex: p.ex,
    });
  };
  const word = hlpFindWord(q);
  if (word && out.length < 6) { seen.add('w:' + word.head); out.push({ id: word.head, kind: 'word', name: word.head, en: word.en }); }
  hlpFindPoints(q).forEach(addPoint);
  grammarScan(q).forEach((g) => addPoint(sbFind(g.id)));
  return out;
}

function hlpAiIdle(cites) {
  return '<div class="hlp-ai">' +
    `<button id="hlpAiBtn" class="hlp-ai-btn" type="button">✨ ${t('이 질문을 AI 도우미에게 물어보기', 'Ask the AI helper about this')}</button>` +
    `<p class="hlp-ai-note">${t('로그인이 필요해요. 하루 20번까지 물어볼 수 있어요. 저희 자료에 없는 건 "모른다"고 답해요.', 'Sign-in required, up to 20 questions a day. It says "I don’t know" rather than guessing.')}</p>` +
  '</div>';
}

function hlpDraw() {
  const cardsEl = $('hlpCards');
  if (!cardsEl) return;
  const q = hlpLastQ;
  if (!q) {
    /* Canva AI 같은 가벼운 첫 화면 — 긴 안내문 대신 큰 물음 하나와
       눌러 보는 칸(chip) 몇 개. 규칙은 그대로다: 눌러도 결국 hlpAsk
       로 들어가 같은 검색을 한다. */
    const suggestions = [
      { q: '가지고', label: '가지고' },
      { q: '-느니', label: '-느니' },
      { q: t('가지고랑 -느니 차이가 뭐예요?', "What's the difference between 가지고 and -느니?"),
        label: '✨ ' + t('AI에게 물어보기', 'Ask the AI') },
    ];
    cardsEl.innerHTML =
      `<div class="hlp-empty">${esc(t('오늘은 뭐가 궁금하세요?', "What's on your mind today?"))}` +
      `<span>${esc(t('낱말이나 문법을 물어보세요 — 사전 4,737개, 문법 표현 290개 안에서 찾아요.', 'Ask about a word or grammar point — searched across 4,737 dictionary words and 290 grammar points.'))}</span>` +
      '</div>' +
      '<div class="hlp-suggest">' +
        suggestions.map((s) => `<button type="button" class="hlp-chip" data-q="${esc(s.q)}">${esc(s.label)}</button>`).join('') +
      '</div>';
    cardsEl.querySelectorAll('.hlp-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.q;
        $('hlpInput').value = v;
        hlpAsk(v);
      });
    });
    return;
  }
  const word = hlpFindWord(q);
  const points = hlpFindPoints(q).slice(0, 5);
  const cites = hlpCites(q);

  const cards = (!word && !points.length)
    ? `<div class="hlp-none">${esc(t(
        `"${q}"는 저희 자료에 없어요. 오타는 아닌지, 또는 사전에 나온 기본형으로 다시 써 보세요.`,
        `We couldn't find "${q}" in our material. Check the spelling, or try the dictionary (base) form.`
      ))}</div>`
    : (word ? hlpWordCard(word) : '') + points.map(hlpPointCard).join('');

  cardsEl.innerHTML = cards + hlpAiIdle(cites);
  $('hlpAiBtn').addEventListener('click', () => hlpAskAI(q, cites));
}

function hlpAsk(raw) {
  hlpLastQ = String(raw ?? '').trim();
  hlpDraw();
}

/* 물어본 것들을 말풍선으로 쌓는다. 매 질문은 여전히 따로따로
   서버에 보내 답을 받는다(대화 기억 없음) — 화면만 채팅처럼 보이게
   쌓아 둘 뿐이다. 새로 찾기를 해도(hlpDraw → #hlpCards) 이 자리는
   안 지워지고, 패널을 닫을 때만 비운다(hlpSetOpen). */
let hlpChat = [];

function hlpChatBubble(role, text) {
  return `<div class="hlp-msg ${role === 'user' ? 'hlp-msg-user' : 'hlp-msg-ai'}">${esc(text)}</div>`;
}

function hlpRenderChat() {
  const chat = $('hlpChat');
  if (!chat) return;
  chat.innerHTML = hlpChat.map((m) => hlpChatBubble(m.role, m.text)).join('');
  chat.scrollTop = chat.scrollHeight;
}

/* AI 호출. score-pronunciation 을 부르는 window.ptAiGuess 와 같은 틀 —
   로그인 확인, 15초에서 끊기, 429/daily_limit 처리, 실패하면 조용히
   말풍선 하나로 접는다(이미 0층 결과는 위에 그대로 있으니 여기만
   죽어도 된다). */
async function hlpAskAI(q, cites) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    hlpSetOpen(false);
    open('account');
    return;
  }

  hlpChat.push({ role: 'user', text: q });
  const idx = hlpChat.push({ role: 'ai', text: t('생각하는 중…', 'Thinking…') }) - 1;
  hlpRenderChat();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${SB_URL}/functions/v1/ask-korean`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SB_ANON,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ q, lang: isEn() ? 'en' : 'ko', cites }),
      signal: ctrl.signal,
    });
    const out = await res.json().catch(() => null);

    let reply;
    if (res.status === 429 || out?.error === 'daily_limit') {
      reply = t('오늘 AI 도우미에게 물어볼 수 있는 횟수를 다 썼어요. 내일 다시 써 주세요.', "You've used today's AI questions — try again tomorrow.");
    } else if (!res.ok || out?.grounded === undefined) {
      reply = t('지금은 답할 수 없어요. 잠시 후 다시 시도해 주세요.', "Couldn't get an answer right now — try again in a moment.");
    } else if (!out.grounded || !out.answer) {
      reply = t('이건 저희 자료에 없어요. 표현을 바꿔서 다시 물어봐 주세요.', "This isn't in our material — try rephrasing.");
    } else {
      reply = out.answer;
    }
    hlpChat[idx] = { role: 'ai', text: reply };
  } catch (e) {
    hlpChat[idx] = { role: 'ai', text: t('지금은 답할 수 없어요. 잠시 후 다시 시도해 주세요.', "Couldn't get an answer right now — try again in a moment.") };
  } finally {
    clearTimeout(timer);
    hlpRenderChat();
  }
}

/* 패널의 뼈대(제목·입력칸)를 그린다. 열 때와 언어를 바꿀 때만 부른다 —
   검색할 때마다 다시 그리면 입력칸의 커서 위치가 매번 날아간다. */
function hlpRenderChrome() {
  $('hlpPanel').innerHTML =
    '<div class="hlp-hd">' +
      '<div>' +
        `<div class="hlp-title" id="hlpTitle">${t('한국어 도우미', 'Korean helper')}</div>` +
        `<div class="hlp-sub">${t('낱말이나 문법을 찾아보세요', 'Look up a word or grammar point')}</div>` +
      '</div>' +
      `<button id="hlpClose" class="hlp-x" type="button" aria-label="${t('닫기', 'Close')}">✕</button>` +
    '</div>' +
    '<form id="hlpForm" class="hlp-form">' +
      `<input id="hlpInput" class="hlp-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(t('예: 가지고, -느니', 'e.g. 가지고, -느니'))}">` +
      `<button type="submit" class="hlp-go" aria-label="${esc(t('보내기', 'Send'))}">➤</button>` +
    '</form>' +
    '<div class="hlp-body" id="hlpBody">' +
      '<div id="hlpCards"></div>' +
      '<div id="hlpChat" class="hlp-chat"></div>' +
    '</div>';

  $('hlpClose').addEventListener('click', () => hlpSetOpen(false));
  $('hlpForm').addEventListener('submit', (ev) => { ev.preventDefault(); hlpAsk($('hlpInput').value); });
  $('hlpInput').value = hlpLastQ;
  hlpDraw();
  hlpRenderChat();
}

function hlpSetOpen(open) {
  const panel = $('hlpPanel');
  // side-nav 와 같은 규칙 — aria-hidden 을 걸기 전에 안쪽 포커스부터 뺀다.
  if (!open && panel.contains(document.activeElement)) $('hlpFab').focus();
  panel.classList.toggle('on', open);
  $('hlpScrim').classList.toggle('on', open);
  document.body.classList.toggle('hlp-open', open);
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  $('hlpFab').setAttribute('aria-label', t(open ? '한국어 도우미 닫기' : '한국어 도우미 열기',
                                            open ? 'Close Korean helper' : 'Open Korean helper'));
  if (open) {
    hlpRenderChrome();
    setTimeout(() => $('hlpInput')?.focus(), 60);
  } else {
    // 닫으면 쌓아 둔 말풍선을 비운다 — 서버에도 아무것도 안 남기는
    // 것과 같은 원칙이다. 다음에 열면 늘 새 판으로 시작한다.
    hlpChat = [];
  }
}

$('hlpFab').addEventListener('click', () => hlpSetOpen(!$('hlpPanel').classList.contains('on')));
$('hlpScrim').addEventListener('click', () => hlpSetOpen(false));
addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && $('hlpPanel').classList.contains('on')) hlpSetOpen(false);
});
// langBtn 은 app.js 의 고전 스크립트가 먼저 등록해 두었다. applyLang 이
// 이미 끝난 뒤에 불리므로 isEn()/gTx() 가 새 언어를 보고 다시 그린다.
$('langBtn').addEventListener('click', () => {
  if ($('hlpPanel').classList.contains('on')) hlpRenderChrome();
});

// ── 구글에서 돌아왔을 때 ─────────────────────────────────────
const params = new URLSearchParams(window.location.search);
if (params.get('error')) {
  // 동의 화면에서 취소한 경우가 대부분이다. 오류로 다루지 않고
  // 주소만 깨끗이 지운 뒤 계정 화면을 보여준다.
  history.replaceState({}, '', window.location.pathname);
  sessionStorage.removeItem('wbReturning');
  open('account');
} else if (sessionStorage.getItem('wbReturning')) {
  sessionStorage.removeItem('wbReturning');
  open('wordbook');
}

/* 주소에 적힌 화면을 연다. 맨 끝에서 부른다 — 여기까지 와야 cpOpen 과
   loadAccount / loadLibrary / loadDashboard 가 다 있다. 바로 위의 구글 복귀가
   화면을 정했으면 그쪽이 이미 주소에 남겼으므로 같은 화면이 다시 열릴 뿐이다. */
window.cpStart();
