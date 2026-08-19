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
import { createClient } from './vendor/supabase-js.js';
// 앱(package.json)과 같은 줄기를 쓴다. 갈리면 앱에서는 읽히는 파일이
// 여기서는 안 읽히는(또는 그 반대) 일이 생긴다.
import * as XLSX from './vendor/xlsx.js';
// 커리큘럼. 내용과 엔진을 갈라 두면 글을 고치다 화면을 깨지 않는다.
import { COURSES } from './courses.js';
import { SB_CATS, SB_MORE, SB_SEED } from './sentences.js';
// 읽기 연습 지문. 길이(short·long) × 급수 여섯 칸.
import { READING } from './reading.js';
// TOPIK 유형 연습문제. 기출이 아니라 자체 제작이다.
import { TOPIK_READING, TOPIK_BLUEPRINT, TOPIK_SLOTS } from './topik.js';
// 숫자 게임의 읽기와 문제 만들기. 화면을 모르는 순수 계산이라 따로 뒀다.
import { makeRound } from './numbers.js';

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

// 게임 목록과 그 아래 게임들. 새 게임을 더하면 여기에도 넣는다.
const GAME_VIEWS = ['games', 'claw', 'match', 'quiz', 'num'];

/* 화면 전환. 'home' | 'wordbook' | 'account' 셋을 여기서 다룬다.
   발음 테스트는 위 고전 스크립트의 ptShow 가 주인이라 여기서는 닫기만 한다. */
function open(view) {
  // 발음 테스트가 열려 있었다면 표시를 거둔다.
  $('navBtn').classList.remove('on');

  $('homeView').classList.toggle('hidden', view !== 'home');
  $('testView').classList.add('hidden');
  $('wordbookView').classList.toggle('hidden', view !== 'wordbook');
  $('authView').classList.toggle('hidden', view !== 'account');
  $('libraryView').classList.toggle('hidden', view !== 'library');
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
  window.scrollTo({ top: 0, behavior: 'auto' });
  window.cpMark(view);
}

/* 주소로 바로 들어오는 길. 버튼을 눌러 들어올 때 같이 하던 불러오기까지
   여기서 한다 — 안 하면 #dashboard 로 들어온 사람은 빈 대시보드를 본다. */
window.cpOpen = function (view) {
  open(view);
  if (view === 'account') loadAccount();
  if (view === 'library') loadLibrary();
  if (view === 'dashboard') loadDashboard();
  /* 배우기는 헤더 버튼이 open() 말고 진도 읽기와 갈래 그리기를 더 한다.
     그 둘이 빠지면 갈래 카드가 하나도 없는 빈 배우기가 열린다.
     먼저 그려 두고 진도를 받아 다시 그린다 — 네트워크를 기다리는 동안
     빈 화면을 보이지 않으려는 것이다. 진도를 못 읽어도 화면은 나온다. */
  // 숫자 게임은 판을 도중부터 못 여니 단계 고르기 화면으로 연다.
  if (view === 'num') numSetup();
  if (view === 'learn') {
    backToSections();
    loadProgress().then(backToSections, () => {});
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
$('dashBtn').addEventListener('click', () => { const go = !showing('dashView'); open(go ? 'dashboard' : 'home'); if (go) loadDashboard(); });
// 게임 하나에 들어가 있을 때 눌러도 목록으로 돌아온다 — 한 단계 위가
// 홈이 아니라 목록이어야 다른 게임으로 건너갈 수 있다.
$('gameBtn').addEventListener('click', () => {
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
const TAG_EN = { '명사':'Noun', '동사':'Verb', '형용사':'Adjective', '부사':'Adverb', '접속사':'Conjunction', '관용구':'Idiom' };
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
  const out = rows.filter((w) => {
    if (tagOn && w.tag !== tagOn) return false;
    if (doneOn !== null && !!w.is_remembered !== doneOn) return false;
    if (!q) return true;
    return (w.word ?? '').toLowerCase().includes(q)
        || (w.meaning ?? '').toLowerCase().includes(q)
        || (w.example ?? '').toLowerCase().includes(q);
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
// 페이지를 처음 열 때도 한 번 불리므로 시작 상태를 따로 챙길 필요가 없다.
sb.auth.onAuthStateChange((_event, session) => {
  hideErr();

  // 헤더와 계정 화면을 상태에 맞춘다.
  const nav = $('authBtn');
  nav.querySelector('.nav-ico').textContent = session ? '🧀' : '👤';
  nav.querySelector('.nav-txt').textContent = session ? t('내 계정', 'Account') : t('로그인', 'Sign in');
  nav.setAttribute('aria-label', session ? '내 계정' : '로그인');
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
  const nav = $('authBtn').querySelector('.nav-txt');
  // 로그인 상태에 따라 글이 다르므로 지금 뭘 보여주고 있는지로 판단한다.
  if (!$('auSignedIn').classList.contains('hidden')) nav.textContent = t('내 계정', 'Account');
  else nav.textContent = t('로그인', 'Sign in');
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
$('wbExp').addEventListener('click', () => {
  if (!rows.length) return;
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

    if (!rows.length) return dashPanel('dashEmpty');
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
  ].join('');

  $('dashBody').innerHTML = html;
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

/* 오디오 파일명으로 안전하게 쓸 수 있도록 텍스트 정규화
   한글·영어·숫자는 유지, 그 외 특수문자·공백은 언더바로 치환 */
function audioSlug(text) {
  return String(text ?? '').trim()
    .replace(/[^\uAC00-\uD7AFa-zA-Z0-9]+/g, '_')
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
    tag:   { ko: '급수별 읽기 문제를 유형으로 나눠서',
             en: 'Reading questions by level and question type' },
    blurb: { ko: '지문을 읽고 보기 넷에서 고릅니다. 틀리면 왜 그런지 바로 알려 줘요.',
             en: 'Read a passage, pick from four. A wrong answer tells you why.' },
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
let learnLv = { courses: 'beginner', sentence: 'beginner', reading: 'beginner' };

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
const TQ_TYPE_TX = Object.fromEntries(
  TOPIK_BLUEPRINT.map((b) => [b.type, { ko: b.ko, en: b.en }])
);
/* 시험에 나오는 차례대로. 31번부터 70번까지 눈으로 훑는 순서와 같다. */
const TQ_TYPE_ORDER = [...new Set(TOPIK_BLUEPRINT.map((b) => b.type))];

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
const TQ_GRADES = [1, 2];
/* 이 아래로 떨어지면 「약한 유형」으로 본다. */
const TQ_WEAK = 0.6;
const TQ_KEY = 'cp-topik-grade';

let tqGrade = 1;
try { const g = parseInt(localStorage.getItem(TQ_KEY), 10); if (TQ_GRADES.includes(g)) tqGrade = g; } catch (e) {}
let tqRound = [], tqIdx = 0, tqScore = 0, tqWrongs = [], tqBusy = false, tqTitle = '', tqSet = 'all';
/* 모의고사용. tqPicks 는 문항마다 무엇을 골랐는지 — 성적표의 정오표가 이걸
   읽는다. 못 푼 문항은 null 로 남아서 「안 냄」과 「틀림」을 가릴 수 있다. */
let tqMock = false, tqPicks = [], tqLeft = 0, tqSpent = 0, tqSaved = false;
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

const tqOf = (grade) => TOPIK_READING.filter((q) => q.grade === grade);
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
TQ_GRADES.forEach((g) => { try { localStorage.removeItem(`cp-topik-set-${g}-notice`); } catch (e) {} });
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

  $('tqLevel').innerHTML =
    '<div class="pt-lv-row">' +
      `<div class="diff-seg tq-lv" role="radiogroup" aria-label="${t('급수', 'Level')}">` +
        TQ_GRADES.map((g) =>
          `<label><input type="radio" name="tqGrade" value="${g}"${g === tqGrade ? ' checked' : ''}><span>${esc(t(`${g}급`, `Level ${g}`))}</span></label>`
        ).join('') +
      '</div>' +
      `<div class="pt-lv-desc">${esc(tqGrade === 1
        ? t('가장 기초. 짧은 글과 안내문을 읽고 고릅니다.', 'The basics — short texts and notices.')
        : t('생활에서 겪는 상황. 글이 조금 길어집니다.', 'Everyday situations, with slightly longer texts.'))}</div>` +
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
          `<div class="lc-lv">${esc(lv || t(`${tqGrade}급`, `Level ${tqGrade}`))}</div>` +
          `<div class="lc-title">${esc(title)}</div>` +
          `<div class="lc-tag">${esc(tag)}</div>` +
        '</div>' +
      '</div>' +
      `<p class="lc-blurb">${esc(blurb)}</p>` +
      `<div class="lq-meta"><span class="lq-chip">${esc(t(`${n}문제`, `${n} questions`))}</span></div>` +
    '</button>';

  tqDrawRecord(byType);

  if (!rows.length) {
    $('tqList').innerHTML = `<div class="learn-empty">${esc(t('이 급수 문제는 아직 채우는 중이에요.', 'Questions for this level are still being written.'))}</div>`;
  } else {
    /* 모의고사는 마흔 자리가 다 찼을 때만 낸다. 한 자리라도 비면 40문항이
       안 되고, 「모의고사」라고 써 놓고 서른아홉 문항을 내면 거짓말이 된다. */
    const filled = new Set(TOPIK_READING.map((q) => q.slot));
    const mockReady = TOPIK_SLOTS.every((s) => filled.has(s.n));
    $('tqList').innerHTML =
      /* 모의고사만은 급수를 안 가린다. 실제 TOPIK I 은 1급·2급이 한 장에
         같이 나오는 시험이라 급수로 나누면 시험이 아니게 된다. 다만 1급을
         골라 둔 학습자에게 말없이 2급 지문을 내밀면 속이는 것이므로,
         급수 딱지와 소개글에 섞여 나온다고 적어 둔다. */
      (mockReady
        ? card('mock', '📝', t('모의고사 한 회', 'Full mock exam'),
               t('읽기 31~70번 · 60분', 'Reading 31–70 · 60 min'),
               t('실제 시험 차례대로 40문항. 실제 TOPIK I 은 1급과 2급이 한 장에 같이 나오므로 이 모의고사도 급수를 가리지 않습니다. 푸는 동안에는 답을 알려 주지 않고, 끝나면 성적표가 나옵니다.',
                 'All 40 in exam order. The real TOPIK I puts levels 1 and 2 on one paper, so this mock mixes both regardless of the level you picked. No answers until you finish, then a full result sheet.'),
               TOPIK_SLOTS.length, t('1·2급', 'Levels 1–2'))
        : '') +
      card('all', '📖', t('전체 풀기', 'Full run'), t('유형을 섞어서 처음부터 끝까지', 'Every type, mixed'),
           t('이 급수 문제를 다 풀어 봅니다. 문제마다 바로 해설이 붙어요.', 'Every question at this level, with the answer explained as you go.'), rows.length) +
      TQ_TYPE_ORDER.filter((k) => byType[k]).map((k) =>
        card(k, '🔎', t(TQ_TYPE_TX[k].ko, TQ_TYPE_TX[k].en),
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
  const done = TOPIK_SLOTS.filter((s) => filled.has(s.n)).map((s) => s.n);
  const todo = TOPIK_SLOTS.filter((s) => !filled.has(s.n)).map((s) => s.n);
  $('tqNote').textContent =
    t('TOPIK 유형을 따라 만든 자체 제작 연습문제입니다. 기출문제가 아니며 국립국제교육원과 관계가 없습니다.',
      'These are original practice questions written in the TOPIK format. They are not past exam papers and are not affiliated with NIIED.') +
    (!done.length
      ? ''
      : todo.length
        ? ' ' + t(`${tqGrade}급으로는 읽기 ${tqRange(done)} 자리를 연습할 수 있고, ${tqRange(todo)} 자리는 준비 중입니다.`,
                  `At level ${tqGrade} this covers reading ${tqRange(done)}; ${tqRange(todo)} still being written.`)
        : ' ' + t('읽기 31~70번 자리를 모두 연습할 수 있습니다.', 'Covers all of reading 31–70.'));
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

/* 세트별 점수 — 고르기 화면에 붙는 기록판.
   전체 풀기를 맨 위에 두고 유형은 늘 같은 차례로 둔다. 결과 화면의
   유형별 표는 못 맞힌 쪽부터 세우지만 여기는 아니다. 여기는 몇 번씩
   다시 보는 자리라 줄이 매번 움직이면 눈이 자리를 못 외운다. */
function tqDrawRecord(byType) {
  const box = $('tqRecord');
  const sets = ['all', ...TQ_TYPE_ORDER.filter((k) => byType[k])];
  const name = (k) => (k === 'all'
    ? t('전체 풀기', 'Full run')
    : t(TQ_TYPE_TX[k].ko, TQ_TYPE_TX[k].en));
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
const TQ_MOCK_SEC = 60 * 60;   // 읽기 60분
const tqMockKey = (g) => `cp-topik-mock-${g}`;

/* 한 회를 뽑는다. 자리마다 하나씩, 청사진 차례대로.
   짝 지문 자리(49~56, 59~70)는 두 문항이 같은 글을 나눠 쓰므로 짝을
   통째로 골라야 한다. 자리마다 따로 뽑으면 49번과 50번이 서로 다른 글에서
   와서, 앞 문제의 지문을 읽고 뒤 문제를 푸는 시험이 되지 않는다. */
function tqBuildMock() {
  const pool = TOPIK_READING;
  const bySlot = new Map();
  pool.forEach((q) => {
    if (!bySlot.has(q.slot)) bySlot.set(q.slot, []);
    bySlot.get(q.slot).push(q);
  });
  /* 짝은 pair 이름과 지문이 같은 것끼리 한 벌이다. 같은 pair 이름이라도
     지문이 다르면 다른 벌이다 — 회차가 늘면 그렇게 된다. */
  const sets = new Map();
  pool.filter((q) => q.pair).forEach((q) => {
    const k = `${q.pair}|${(q.passage || '').replace(/\s+/g, '')}`;
    if (!sets.has(k)) sets.set(k, []);
    sets.get(k).push(q);
  });
  const byPair = new Map();
  sets.forEach((list, k) => {
    if (list.length !== 2) return;              // 짝이 안 맞는 것은 쓰지 않는다
    const name = list[0].pair;
    if (!byPair.has(name)) byPair.set(name, []);
    byPair.get(name).push(list.slice().sort((a, b) => a.slot - b.slot));
  });

  const round = [];
  const usedPair = new Set();
  for (const s of TOPIK_SLOTS) {
    if (s.pair) {
      if (usedPair.has(s.pair)) continue;       // 앞 자리에서 이미 벌째로 넣었다
      const vers = byPair.get(s.pair);
      if (!vers?.length) return null;           // 한 자리라도 비면 한 회가 안 된다
      round.push(...vers[Math.floor(Math.random() * vers.length)]);
      usedPair.add(s.pair);
    } else {
      const cand = bySlot.get(s.n);
      if (!cand?.length) return null;
      round.push(cand[Math.floor(Math.random() * cand.length)]);
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

function tqStartMock() {
  const round = tqBuildMock();
  if (!round) return;
  tqRound = round;
  tqIdx = 0; tqScore = 0; tqWrongs = []; tqBusy = false; tqSet = 'mock';
  tqMock = true; tqPicks = []; tqLeft = TQ_MOCK_SEC; tqSpent = 0; tqSaved = false;
  tqTitle = t('모의고사 · 읽기 31~70번', 'Mock exam — reading 31–70');
  $('tqOmr').classList.remove('hidden');
  $('tqOmr').classList.remove('open');
  tqClockBuild();
  tqClock();                       // 1초 뒤가 아니라 지금부터 보여야 한다
  tqOmrDraw();
  tqRunClock();
  $('tqWall').classList.add('hidden');
  $('tqExamBody').classList.remove('hidden');
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
  if (arc) arc.setAttribute('stroke-dasharray', `${(TQ_C * left / TQ_MOCK_SEC).toFixed(2)} ${TQ_C}`);
  const sec = $('tqSec');
  if (sec) sec.setAttribute('transform', `rotate(${((TQ_MOCK_SEC - left) % 60) * 6} 50 50)`);
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

function tqStart(key) {
  if (key === 'mock') return tqStartMock();
  tqMock = false; tqStopClock();
  $('tqOmr').classList.add('hidden');
  const rows = tqOf(tqGrade);
  const picked = key === 'all' ? rows : rows.filter((q) => q.type === key);
  if (!picked.length) return;
  // 문제 순서를 섞는다. 늘 같은 차례로 나오면 두 번째 판부터 답을 외운다.
  tqRound = gameShuffle(picked.slice());
  tqIdx = 0; tqScore = 0; tqWrongs = []; tqBusy = false; tqSet = key; tqPicks = []; tqSaved = false;
  tqTitle = key === 'all'
    ? t(`${tqGrade}급 전체 풀기`, `Level ${tqGrade} — full run`)
    : t(`${tqGrade}급 · ${TQ_TYPE_TX[key].ko}`, `Level ${tqGrade} · ${TQ_TYPE_TX[key].en}`);
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
const TQ_MARKER = /^[(（[［〔<〈【{][0-9A-Za-z가-힣][)）\]］〕>〉】}]$/;

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
      const w = tqUnkNorm(r?.word ?? '');
      if (w && w.length <= 40) tqUnknown.set(w, { word: w, ex: String(r?.ex ?? '').slice(0, 300) });
    }
  } catch (e) { /* 못 읽으면 빈 채로 시작한다 */ }
};
const tqUnkStore = () => {
  try { localStorage.setItem(TQ_UNK_KEY, JSON.stringify([...tqUnknown.values()])); } catch (e) {}
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
function tqWordify(el, text) {
  el.textContent = '';
  const s = String(text ?? '');
  if (!s) return;
  let at = 0;
  for (const piece of s.split(/(\s+)/)) {
    if (!piece) continue;
    const here = at;
    at += piece.length;
    if (/^\s+$/.test(piece)) { el.appendChild(document.createTextNode(piece)); continue; }
    const key = tqWordKey(piece);
    /* 한글이 든 어절만 누를 수 있게 한다. 「1.」이나 「㉠」까지 열어 두면
       보기 번호를 눌러 단어장에 「1」이 들어간다. 한국어를 배우는
       화면이라 담을 만한 것은 한글이 든 말뿐이다.

       괄호로 싼 표시도 뺀다 — 순서 배열 지문의 (가)(나)(다)(라) 가
       그렇다. 낱말처럼 생겼지만 문단에 붙인 번호라, 눌러 담으면
       단어장에 「나」가 들어간다. */
    if (!key || !/[가-힣]/.test(key) || TQ_MARKER.test(piece)) {
      el.appendChild(document.createTextNode(piece));
      continue;
    }
    const span = document.createElement('span');
    span.className = 'tq-w' + (tqUnknown.has(key) ? ' on' : '');
    span.textContent = piece;
    span.title = t('모르는 낱말로 표시', 'Mark as unknown');
    span.addEventListener('click', () => {
      if (tqUnknown.has(key)) tqUnknown.delete(key);
      else tqUnknown.set(key, { word: key, ex: tqSentAt(s, here) });
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
    if (next === it.key) { tqUnknown.set(it.key, it); tqUnkStore(); return; }
    /* 이미 있는 낱말로 고치면 하나로 합쳐진다 — 먼저 담긴 예문을 남긴다.
       나중 것으로 덮으면 「아침을」과 「아침」을 각각 다른 문장에서 눌러
       놓고 하나로 합쳤을 때 먼저 고른 문장이 조용히 사라진다. */
    const had = tqUnknown.get(next);
    tqUnknown.set(next, { word: next, ex: had ? had.ex : it.ex });
    tqUnkStore();
    tqUnkDraw();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = it.word; input.style.width = tqUnkWidth(it.word); input.blur(); }
  });
  row.appendChild(input);

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
  const list = [...tqUnknown.entries()].map(([key, v]) => ({ key, word: v.word, ex: v.ex }));
  box.classList.toggle('hidden', list.length === 0);
  if (!list.length) return;

  box.textContent = '';
  const h = document.createElement('div');
  h.className = 'tq-bd-h';
  h.textContent = t(`몰랐던 낱말 ${list.length}개`, `${list.length} words you marked`);
  box.appendChild(h);

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
    const input = tqUnkRow({ key: '⁣new' + Date.now(), word: '', ex: '' }, wrap);
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
        /* 뜻은 비워 둔다. 여기서 지어내 넣으면 학습자가 그 잘못된 뜻을
           외우게 된다 — 빈 칸은 채우면 되지만 틀린 뜻은 지워야 한다. */
        meaning: '',
        example: x.ex || null,
        tag: null,
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
  tqWordify($('tqPassage'), q.passage);
  /* 넣을 문장이 없으면 59번 유형은 풀 수가 없다. 자료에만 두고 화면에
     안 그리면 학습자는 ㉠㉡㉢㉣ 만 보고 찍게 된다. */
  $('tqInsert').classList.toggle('hidden', !q.sentence);
  tqWordify($('tqInsert'), q.sentence);
  tqWordify($('tqQuestion'), q.question);
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
    b.innerHTML = `<span class="tq-num">${i + 1}</span>${esc(text)}`;
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
    .map((r) => ({ at: Number(r?.at), score: Number(r?.score), n: Number(r?.n), sec: Number(r?.sec) }))
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
    `<span class="tq-cell ${state(i)}" title="${esc(t(`${q.slot}번 · ${TQ_TYPE_TX[q.type].ko}`, `Q${q.slot} · ${TQ_TYPE_TX[q.type].en}`))}">${q.slot}</span>`
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

  const name = (k) => t(TQ_TYPE_TX[k].ko, TQ_TYPE_TX[k].en);
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
  if (first && tqMock) tqMockWrite({ at: Date.now(), score: tqScore, n, sec: tqSpent });
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
    lv.textContent = t(TQ_TYPE_TX[q.type].ko, TQ_TYPE_TX[q.type].en);
    card.appendChild(lv);
    if (q.passage) {
      const p = document.createElement('div');
      p.className = 'tq-wrong-p';
      tqWordify(p, q.passage);
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
  tqPanel('tqOver');
  window.scrollTo({ top: 0, behavior: 'auto' });
}

$('tqLevel').addEventListener('change', (ev) => {
  const r = ev.target.closest('input[name=tqGrade]');
  if (!r) return;
  const g = parseInt(r.value, 10);
  if (!TQ_GRADES.includes(g)) return;
  tqGrade = g;
  try { localStorage.setItem(TQ_KEY, String(g)); } catch (e) {}
  drawTopik();
});
$('tqList').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-tq]');
  if (b) tqStart(b.dataset.tq);
});
/* 「…만 풀어 보기」. 두 자리(기록판·결과 화면)에 같은 단추가 나오므로
   다시 그릴 때마다 붙이지 않도록 바깥 상자에 한 번만 걸어 둔다. */
['tqRecord', 'tqBreak'].forEach((id) => $(id).addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-tq-go]');
  if (b) tqStart(b.dataset.tqGo);
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
  $('tqWall').classList.add('hidden');
  $('tqExamBody').classList.remove('hidden');
  drawTopik();
});
$('tqSubmit').addEventListener('click', tqSubmitAsk);
/* 그만두기 — 모의고사는 되돌릴 수 없으니 한 번 묻는다. 시계도 멈춘다. */
$('tqQuit').addEventListener('click', () => {
  if (tqMock && tqIdx < tqRound.length &&
      !confirm(t('모의고사를 그만둘까요? 지금까지 푼 것은 기록에 남지 않아요.',
                 'Quit the mock exam? Nothing so far will be saved.'))) return;
  tqMock = false; tqStopClock();
  $('tqOmr').classList.add('hidden');
  drawTopik();
});
$('tqAgain').addEventListener('click', () => tqStart(tqSet));
$('tqBack').addEventListener('click', () => { tqMock = false; tqStopClock(); $('tqOmr').classList.add('hidden'); drawTopik(); });

function tqSyncLang() {
  if ($('tqWrap').classList.contains('hidden')) return;
  if (!$('tqPick').classList.contains('hidden')) drawTopik();
  else if (!$('tqOver').classList.contains('hidden')) tqFinish();
  else { tqMeta(); $('tqNext').textContent = tqIdx < tqRound.length ? t('다음 문제 →', 'Next →') : t('결과 보기 →', 'See results →'); }
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

const rdRows = () => READING[rdLen]?.[learnLv.reading] ?? [];
const rdFind = (id) => Object.values(READING).flatMap((g) => Object.values(g)).flat().find((r) => r.id === id);

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

function drawReading() {
  $('rdLen').innerHTML = rdLenSwitch();
  $('rdLevel').innerHTML = renderLevelSwitch('reading');
  $('rdIntro').textContent = t(
    '글을 읽고, 무슨 이야기였는지 자기 말로 써 보세요. 다 쓰면 무엇을 짚었고 무엇을 놓쳤는지 알려 드립니다. 영어 뜻은 답을 낸 뒤에 펼 수 있어요.',
    'Read the passage, then write what it said in your own words. Once you answer, you will see what you caught and what you missed. The English is there afterwards.');

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
  head.addEventListener('click', () => {
    /* 아코디언이다 — 한 번에 하나만 편다. 여럿이 펼쳐져 있으면 어느
       칸에 쓰고 있는지 헷갈리고, 긴 글에서는 화면이 통째로 흐른다. */
    rdOpen = rdOpen === r.id ? null : r.id;
    drawReading();
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
  p.textContent = r.passage;
  body.appendChild(p);

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

function openSection(id) {
  const s = LEARN_SECTIONS.find((x) => x.id === id);
  if (!s) return;
  /* 이미 열려 있는 갈래를 다시 여는 경우가 있다 — 언어를 바꾸면 syncLang 이
     openSection(lsecOpen) 을 부른다. 그때 속까지 새로 그리면 풀던 판이나
     성적표가 사라지고 갈래 첫 화면으로 튕긴다. 실제로 모의고사 성적표를
     띄워 놓고 EN 을 누르면 성적이 통째로 날아갔다.
     글자는 갈래마다 …SyncLang 이 따로 맞춰 주므로 여기서 다시 그릴 까닭이 없다. */
  const already = lsecOpen === s.id;
  lsecOpen = s.id;
  $('lsecList').classList.add('hidden');
  $('lsecWrap').classList.remove('hidden');
  $('lsecTitle').textContent = secTx(s.title);
  /* 갈래 속은 전부 닫고 이 갈래 것만 연다. 목록을 훑어서 닫는 이유는
     갈래를 늘릴 때 여기 한 줄을 빠뜨리면 예전 갈래가 새 갈래 위에
     겹쳐 남기 때문이다. */
  LEARN_SECTIONS.forEach((x) => { if (x.pane) $(x.pane).classList.add('hidden'); });
  $('lsecSoon').classList.add('hidden');
  if (s.ready && s.pane) {
    $(s.pane).classList.remove('hidden');
    if (!already) {
      if (s.id === 'courses') drawCourses();
      if (s.id === 'topik') drawTopik();
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
}

/* 레슨에서 나올 때 가는 자리. 갈래가 생기기 전에는 그냥 코스 목록이었다.
   이제는 코스 갈래를 먼저 열어야 카드가 보인다 — 세 곳(✕ · 끝냄 · 이어하기)이
   같은 길로 나와야 한 곳만 고치고 다른 데가 죽는 일이 없다. */
function backToCourses() {
  open('learn');
  openSection('courses');
  if (lsCourse) openCourse(lsCourse);
}

function backToSections() {
  lsecOpen = null;
  $('lsecWrap').classList.add('hidden');
  $('llWrap').classList.add('hidden');
  $('lsecList').classList.remove('hidden');
  drawSections();
}

$('lsecList').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-section]');
  if (b) openSection(b.dataset.section);
});
$('lsecBack').addEventListener('click', () => {
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
    p.ex.toLowerCase().includes(q) ||
    (SB_MORE[p.id] || []).join(' ').toLowerCase().includes(q) ||
    (isEn() ? c.en : c.ko).toLowerCase().includes(q);

  const html = SB_CATS.map((c) => {
    const pts = c.points.filter((p) => sentenceTier(p) === level && hit(p, c));
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
            return `<button class="sb-pt" data-pt="${p.id}">` +
              `<span class="sb-pt-name">${esc(p.name)}</span>` +
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
      `<p class="sb-desc">${esc(p.desc)}</p>` +
    '</div>' +
    '<div class="sb-facts">' +
      `<div class="sb-fact"><div class="sb-fact-k">${t('형태', 'Form')}</div><div class="sb-fact-v">${esc(more[0])}</div></div>` +
      `<div class="sb-fact"><div class="sb-fact-k">${t('자주 함께 쓰는 말', 'Often paired with')}</div><div class="sb-fact-v">${esc(more[1])}</div></div>` +
      `<div class="sb-fact"><div class="sb-fact-k">${t('주의할 점', 'Watch out')}</div><div class="sb-fact-v">${esc(more[2])}</div></div>` +
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
  $('sbBrowse').classList.toggle('hidden', !!id);
  $('sbDetail').classList.toggle('hidden', !id);
  if (id) sbDrawDetail(); else sbDrawList();
}

$('sbQ').addEventListener('input', sbDrawList);

$('sbCats').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-pt]');
  if (!b) return;
  sbShow(b.dataset.pt);
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
const isEx = (b) => ['choice','listen','type','order','pair','speak','cloze'].includes(b.t);

function startLesson(course, lesson) {
  lsCourse = course; lsLesson = lesson;
  lsQueue = lesson.blocks.slice();
  lsSolved = 0;
  lsTotal = lesson.blocks.filter(isEx).length;

  /* Cloze 게임 상태 초기화 · HUD 보여주기 (문제가 하나라도 있으면) */
  lsHp = 3; lsXp = 0; lsCombo = 0; lsWrong = []; lsMode = 'lesson';
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

/* 문제 한 개. 맞히면 done() 을 부른다. */
function exBlock(host, b, done) {
  const wrap = document.createElement('div');
  wrap.className = 'ex';
  host.appendChild(wrap);

  const tag = { choice:t('고르기','Choose'), listen:t('듣기','Listen'), type:t('쓰기','Type'),
                order:t('배열','Arrange'), pair:t('짝 맞추기','Match'), speak:t('말하기','Speak'),
                cloze:t('빈칸','Cloze') }[b.t];
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
      if (lsMode === 'lesson') {
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
  $('lsKicker').textContent = lsCourse.title;
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
        <button type="button" class="btn-retro blue" id="lsBackCourse">${t('코스로 돌아가기','Back to course')}</button>
      </div>
    </div>`);
  $('hudHp').style.opacity = '';
  $('lsProg').style.width = '100%';
  $('lsCount').textContent = `Score ${lsChallengeScore}`;
  const btR = $('lsRetryCh'), btB = $('lsBackCourse');
  if (btR) btR.addEventListener('click', startChallenge);
  if (btB) btB.addEventListener('click', backToCourses);
  $('lsNextBar').classList.remove('hidden');
  setTimeout(() => $('lsBlocks').lastElementChild?.scrollIntoView({ behavior:'smooth', block:'center' }), 120);
}

$('lsExit').addEventListener('click', backToCourses);

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
