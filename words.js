/* 「단어」 화면(#words) — docs/vocab-plan.md 2단계(1차).
 *
 * 사전은 「찾는」 곳, 내 단어장은 「모으는」 곳이었다. 여기는 **외우는 길**이다:
 *   검색(맨 위) · 오늘 할 일(복습 먼저) · 외우기(주제 → 세션 10개) · 복습(간격 반복) · 별표 · 기록.
 *
 * 자료는 vocab-topik1.js(tools/build-vocab.mjs 가 굽는다). 검색은 거기에 사전(glossary.js)까지 더해
 * 한 겹으로 찾는다 — 활용형 · 영어 · 로마자 · 초성 · 오타 · 예문.
 *
 * 공부 기록은 이 브라우저(localStorage)에만 둔다. 로그인해 계정으로 옮기는 것은 2단계 2차(내 단어장
 * 연동)에서 한다 — 그때 이 모양을 그대로 올린다.
 *
 * app.module.js 가 이 모듈을 화면을 열 때 받아 wordsInit(deps) 로 붙인다. 사이트의 공용 도구(t · esc ·
 * say · track · 사전)는 deps 로 받는다 — 여기서 따로 만들면 언어 · 소리 · 분석이 두 벌이 된다. */

const SESSION = 10;                       // 한 세션 낱말 수 — 하루 분량이 작고 끝이 보이게
const INTERVAL = [1, 1, 3, 7, 14, 30];    // 상자 번호 → 다음 복습까지 날 수 (0 = 새로 · 몰라요)
const KEY = 'cp-words-v1';
const RECENT = 'cp-words-recent';

/* ── 한글 도구 ───────────────────────────────────────────── */
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const R_CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const R_JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const R_JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
const syl = (ch) => { const c = ch.charCodeAt(0) - 0xac00; return c >= 0 && c < 11172 ? c : -1; };

/* 로마자(국어의 로마자 표기법 뼈대 — 소리 바뀜은 안 본다). 찾을 때는 g/k · d/t · b/p · r/l 을 같게 보고
   겹글자를 줄여서 비교한다(romKey) — 「meokda」 「mogda」 어느 쪽으로 쳐도 먹다가 나오게. */
function roman(s) {
  let out = '';
  for (const ch of s) {
    const c = syl(ch);
    if (c < 0) { out += ch; continue; }
    out += R_CHO[Math.floor(c / 588)] + R_JUNG[Math.floor((c % 588) / 28)] + R_JONG[c % 28];
  }
  return out;
}
const romKey = (s) => String(s).toLowerCase().replace(/[^a-z]/g, '')
  .replace(/g/g, 'k').replace(/d/g, 't').replace(/b/g, 'p').replace(/r/g, 'l').replace(/(.)\1+/g, '$1');
const choOf = (s) => [...s].map((ch) => { const c = syl(ch); return c < 0 ? ch : CHO[Math.floor(c / 588)]; }).join('');
const isCho = (q) => /^[ㄱ-ㅎ]+$/.test(q);
/* 자모로 풀기 — 오타 거리를 글자가 아니라 자모로 잰다(먹따 → 먹다 는 한 칸). */
const jamo = (s) => [...s].map((ch) => {
  const c = syl(ch);
  return c < 0 ? ch : String.fromCharCode(0x1100 + Math.floor(c / 588), 0x1161 + Math.floor((c % 588) / 28)) +
    (c % 28 ? String.fromCharCode(0x11a7 + (c % 28)) : '');
}).join('');
function dist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
const norm = (s) => String(s).replace(/[\s.,!?~'"“”‘’·]/g, '');

/* ── 기록(이 브라우저) ─────────────────────────────────────── */
function today() { const d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 60000) / 864e5); }
const dayStr = (n) => new Date(n * 864e5).toISOString().slice(0, 10);
/* 모양: w[낱말 id] = [상자, 다음 복습 날, 맞은 수, 틀린 수, 고친 시각(ms)] · star[id] = 고친 시각(ms, 뺀 것은 음수) ·
   days[날 번호] = 그날 답한 수 · dir = 방향.
   고친 시각을 낱말마다 들고 있는 까닭 — 두 기기의 기록을 합칠 때(syncVocab) 늦게 고친 쪽이 이기게.
   별표를 빼도 지우지 않고 음수로 남긴다 — 그냥 지우면 다른 기기가 가진 별표가 되살아난다. */
function shape(s) {
  s = s && typeof s === 'object' ? s : {};
  let star = s.star || {};
  if (Array.isArray(star)) star = Object.fromEntries(star.map((id) => [id, 1]));   // 2-1 때의 배열 모양
  return { w: s.w && typeof s.w === 'object' ? s.w : {}, star, days: s.days && typeof s.days === 'object' ? s.days : {},
    dir: s.dir === 'en' ? 'en' : 'ko', track: s.track === 'topik2' ? 'topik2' : 'topik1' };
}
function load() {
  try { return shape(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return shape({}); }
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 막힌 브라우저 — 이번 방문 동안만 */ } }

/* 두 기록을 하나로. 낱말 · 별표는 늦게 고친 쪽, 날마다 답한 수는 큰 쪽, 방향은 이 기기 것. */
export function mergeVocab(a, b) {
  a = shape(a); b = shape(b);
  const w = { ...a.w };
  for (const [id, v] of Object.entries(b.w)) if (!w[id] || (v[4] || 0) > (w[id][4] || 0)) w[id] = v;
  const star = { ...a.star };
  for (const [id, v] of Object.entries(b.star)) if (!(id in star) || Math.abs(v) > Math.abs(star[id])) star[id] = v;
  const days = { ...a.days };
  for (const [d, n] of Object.entries(b.days)) days[d] = Math.max(days[d] || 0, n);
  return { w, star, days, dir: a.dir, track: a.track };
}
/* 로그인한 사람의 기록을 서버(settings.vocab)와 맞춘다. get · put 은 app.module.js 가 넘긴다. */
export async function syncVocab(get, put) {
  const server = await get();
  if (server === undefined) return false;   // 표 칸이 아직 없다(db/add_words_vocab.sql 전) — 조용히 넘어간다
  S = mergeVocab(load(), server);
  save();
  await put(S);
  return true;
}

/* 한 낱말을 채점해 상자를 옮긴다. know = 한 칸 위로, unsure = 그 자리(내일 다시), no = 처음으로(내일). */
function grade(id, how) {
  const now = today();
  const [box = 0, , ok = 0, bad = 0] = S.w[id] || [];
  const nb = how === 'know' ? Math.min(box + 1, INTERVAL.length - 1) : how === 'unsure' ? Math.max(box, 1) : 0;
  const due = now + (how === 'know' ? INTERVAL[nb] : 1);
  S.w[id] = [nb, due, ok + (how === 'know' ? 1 : 0), bad + (how === 'no' ? 1 : 0), Date.now()];
  S.days[now] = (S.days[now] || 0) + 1;
  save();
}
const learned = (id) => (S.w[id]?.[0] || 0) >= 1;
const isStar = (id) => (S.star[id] || 0) > 0;
const starIds = () => Object.entries(S.star).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([id]) => id);
function toggleStar(id) { S.star[id] = isStar(id) ? -Date.now() : Date.now(); save(); }
function streak() {
  let d = today();
  if (!S.days[d]) d--;
  let n = 0;
  while (S.days[d]) { n++; d--; }
  return n;
}

export function wordsInit(D) {
  const { t, esc, TOPICS } = D;
  /* 과정 둘 — TOPIK I(1 · 2급) · TOPIK II(3~6급, 안 그래비티가 채우는 대로 늘어난다). 「오늘」 · 외우기 · 기록은 고른 과정만,
     찾기 · 낱말 화면 · 별표 · 복습은 둘 다 본다. VOCAB 은 지금 고른 과정의 목록이다(고르면 바뀐다). */
  const TRACKS = { topik1: D.VOCAB || [], topik2: D.VOCAB2 || [] };
  const ALL = [...TRACKS.topik1, ...TRACKS.topik2];
  const trackOf = (w) => (w.l >= 3 ? 'topik2' : 'topik1');
  const trackName = (k) => (k === 'topik2' ? 'TOPIK II' : 'TOPIK I');
  if (!TRACKS.topik2.length) S.track = 'topik1';
  let VOCAB = TRACKS[S.track];
  function setTrack(k) { if (!TRACKS[k]?.length) return; S.track = k; save(); VOCAB = TRACKS[k]; }
  /* TOPIK II 예문은 처음엔 비어 있다 — 낱말 화면 · 카드가 그 낱말을 그릴 때 그 낱말이 든 조각(500개)만 받아 채우고
     다시 그린다. 받는 동안에도 예문 칸만 비고 나머지는 그대로 보인다. 예문으로 찾기(검색 7순위)는 받은 조각만 본다. */
  const EX_N = 500, exGot = new Set(), exWait = new Set();
  TRACKS.topik2.forEach((w) => { if (!w.x) w.x = []; });
  function needEx(w) {
    if (!D.loadEx2 || w.l < 3) return;
    const k = Math.floor(TRACKS.topik2.indexOf(w) / EX_N);
    if (k < 0 || exGot.has(k) || exWait.has(k)) return;
    exWait.add(k);
    D.loadEx2(k).then((EX) => {
      TRACKS.topik2.slice(k * EX_N, (k + 1) * EX_N).forEach((v, j) => { v.x = EX[j] || []; });
      exGot.add(k); draw();
    }).catch(() => {}).finally(() => exWait.delete(k));   // 못 받으면 다음에 그릴 때 다시 시도한다
  }
  const root = D.root;
  const idOf = (w) => w.i || w.h;
  const byId = new Map(ALL.map((w) => [idOf(w), w]));
  const byHead = new Map();
  ALL.forEach((w) => { if (!byHead.has(w.h)) byHead.set(w.h, w); });
  const order = new Map(ALL.map((w, i) => [idOf(w), i]));
  const mean = (w) => w.s || w.e;
  const topicOf = (id) => TOPICS.find((x) => x.id === id);
  const inTopic = (w, id) => w.t.some((x) => x.split('/')[0] === id);
  const chunk = (list) => { const out = []; for (let i = 0; i < list.length; i += SESSION) out.push(list.slice(i, i + SESSION)); return out; };
  /* 목적별 단어장(EPS · 생활 · 직장 …) — 「p:<목적>」 꼴의 주제로 다룬다. 목적은 급수를 가리지 않으니 두 과정을 다 본다
     (TOPIK I 먼저 · 자주 나오는 차례). 표시는 안 그래비티가 채울 때 단 purposes(u) 그대로. */
  const PURP_LOOK = { eps: ['🏭', 30], life: ['🏡', 150], work: ['💼', 215], medical: ['🏥', 350], campus: ['🎓', 225], travel: ['✈️', 195], kculture: ['🎬', 320] };
  const isPurp = (id) => String(id).startsWith('p:');
  const purpOf = (id) => (D.PURPOSES || []).find((x) => `p:${x.id}` === id);
  const listFor = (topic) => (topic === 'all' ? VOCAB : isPurp(topic) ? ALL.filter((w) => w.u.includes(topic.slice(2))) : VOCAB.filter((w) => inTopic(w, topic)));
  const sayWord = (h) => D.say(h, D.audioFor(h));
  const icon = D.ICON;

  /* 검색 색인. 사전(glossary.js)은 늦게 오므로 처음 찾을 때 붙인다. */
  let IDX = null;
  function index() {
    if (IDX) return IDX;
    /* stem: 「-다」를 뗀 로마자 — 활용형을 로마자로 친 것(saranghae · meogeoyo)도 줄기로 잡으려고. */
    const make = (h, p, en, w) => ({ h, p, en: String(en || '').toLowerCase(), w, n: norm(h), cho: choOf(h),
      rom: romKey(roman(h)), stem: romKey(roman(h.replace(/다$/, ''))), j: null });
    IDX = ALL.map((w) => make(w.h, w.p, `${w.e}; ${w.s}`, w));
    const G = D.gloss();
    const seen = new Set(ALL.map((w) => w.h));
    Object.values(G).forEach((v) => { if (!seen.has(v.head)) { seen.add(v.head); IDX.push(make(v.head, v.pos, v.en, null)); } });
    return IDX;
  }

  /* 찾기. 순위: 정확히 → 앞부분 → 활용형 → 영어 뜻 → 로마자 → 초성 → 가운데 → 예문.
     같은 순위면 TOPIK I 낱말(자주 나오는 차례)이 먼저, 사전 낱말은 가나다순. */
  function search(raw) {
    const q = raw.trim();
    if (!q) return { list: [], fix: null };
    const idx = index();
    const qn = norm(q), ql = q.toLowerCase();
    const latin = /^[a-z\s'-]+$/i.test(q);
    /* 사전 열쇠에는 활용형 · 토씨 붙은 꼴(집에서)도 있다 — 찾은 열쇠를 표제어로 한 번 더 옮긴다. */
    const G = D.gloss();
    const found = !latin && D.glossFind((k) => byHead.has(k) || Object.prototype.hasOwnProperty.call(G, k), qn);
    const inflect = found && (byHead.has(found) ? found : G[found]?.head || found);
    const qr = latin ? romKey(q) : '';
    /* 영어 뜻은 낱말 단위로 — 「eat」이 「great」 속에서 걸리지 않게. 정규식은 한 번만 만든다. */
    const enRe = latin ? new RegExp(`(^|[^a-z])${ql.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`) : null;
    const hits = [];
    for (const e of idx) {
      let r = -1;
      if (e.n === qn) r = 0;
      else if (!latin && e.n.startsWith(qn)) r = 1;
      else if (inflect && e.h === inflect) r = 2;
      else if (latin && enRe.test(e.en)) r = 3;
      else if (latin && qr.length >= 3 && (e.rom === qr || e.rom.startsWith(qr) || (qr.length >= 6 && e.rom.startsWith(qr.slice(0, -2))) ||
        (e.stem.length >= 4 && qr.startsWith(e.stem)))) r = 4;
      else if (isCho(qn) && e.cho.startsWith(qn)) r = 5;
      else if (!latin && qn.length >= 2 && e.n.includes(qn)) r = 6;
      else if (!latin && qn.length >= 2 && e.w && e.w.x.some(([ko]) => norm(ko).includes(qn))) r = 7;
      if (r >= 0) hits.push([r, e]);
    }
    const rank = (e) => (e.w ? order.get(idOf(e.w)) : 1e5);
    hits.sort((a, b) => a[0] - b[0] || rank(a[1]) - rank(b[1]) || (a[1].w ? 0 : a[1].h.localeCompare(b[1].h, 'ko')));
    let fix = null;
    if (!hits.some(([r]) => r <= 4) && !latin && !isCho(qn) && qn.length >= 2) {
      /* 오타 — 자모로 한두 칸 다른 것 중 가장 가까운 것. 목록이 비었을 때만 묻는다. */
      const qj = jamo(qn);
      let best = 3;
      for (const e of idx) {
        e.j ??= jamo(e.n);
        const d = dist(qj, e.j, 2);
        if (d < best || (d === best && fix && rank(e) < rank(fix))) { best = d; fix = e; }
      }
      if (best > 2) fix = null;
    }
    return { list: hits.map(([, e]) => e), fix };
  }

  /* ── 상태 ─────────────────────────────────────────────── */
  let view = { tab: 'home' };   // home | learn | topic | pick | study | review | star | stats | word | search
  let query = '', sel = -1, lastHits = [];
  let run = null;               // 공부 중인 판
  let tick = null;              // 짝 맞추기 시계

  function mark(sub) { D.mark(sub || ''); }
  function recent() { try { return JSON.parse(localStorage.getItem(RECENT) || '[]'); } catch (e) { return []; } }
  function addRecent(h) { try { localStorage.setItem(RECENT, JSON.stringify([h, ...recent().filter((x) => x !== h)].slice(0, 8))); } catch (e) {} }

  const due = () => Object.entries(S.w).filter(([id, v]) => v[1] <= today() && byId.has(id))
    .sort((a, b) => a[1][1] - b[1][1]).map(([id]) => byId.get(id));
  function nextSession(topic = 'all') {
    const ss = chunk(listFor(topic));
    const i = ss.findIndex((s) => !s.every((w) => learned(idOf(w))));
    return i < 0 ? null : i;
  }

  /* ── 그리기 ───────────────────────────────────────────── */
  /* 탭 이름은 그릴 때마다 만든다 — 한 번만 만들면 언어를 바꿔도 예전 말로 남는다. */
  /* 탭은 넷 — 처음 온 학생이 고민 없이 「오늘」을 누르게(운영자 요청: 덜어내기). 복습은 「오늘」에, 별표는 「내 단어장」에 합쳤다. */
  const tabs = () => [
    ['home', t('오늘', 'Today')], ['learn', t('외우기', 'Learn')],
    ['mine', t('내 단어장', 'My wordbook')], ['stats', t('기록', 'Progress')],
  ];
  /* 주제마다 그림 하나와 색 하나(hue) — 카드 목록이 한눈에 갈리게. 색은 --h 로 넘기고 CSS 가 섞는다. */
  const TOPIC_LOOK = {
    people: ['👪', 20], daily: ['☀️', 40], transport: ['🚌', 205], concepts: ['🔢', 260], food: ['🍚', 15],
    leisure: ['🎨', 300], feelings: ['💛', 45], talk: ['💬', 190], home: ['🏠', 30], school: ['🎒', 225],
    society: ['🏛️', 170], body: ['🩺', 350], work: ['💼', 215], nature: ['🌿', 130], tech: ['📱', 240],
    culture: ['🎎', 330], function: ['🧩', 280],
  };
  const look = (id) => (isPurp(id) ? PURP_LOOK[id.slice(2)] : TOPIC_LOOK[id]) || ['📘', 25];
  /* 주제 · 목적 · 과정 전체의 이름 하나로 — 세션 제목과 주제 화면이 같이 쓴다. */
  const topicName = (topic) => {
    const tp = topic === 'all' ? null : isPurp(topic) ? purpOf(topic) : topicOf(topic);
    return tp ? t(tp.ko, tp.en) : t(`${trackName(S.track)} 필수`, `${trackName(S.track)} essentials`);
  };
  /* 공유 단추의 고리 그림 — 이모지(🔗)는 기기마다 모양이 달라 SVG 로(운영자 요청). 글자 색을 따른다. */
  const LINK_ICON = '<svg class="wd-share-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4L12 18.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  const SEARCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  /* 둥근 진도 — conic-gradient 한 겹. 숫자는 가운데에. */
  const ring = (n, of, label) => {
    const pct = of ? Math.round((n / of) * 100) : 0;
    return `<div class="wd-ring" style="--p:${pct}"><div><b>${pct}%</b><span>${esc(label)}</span></div></div>`;
  };

  function shell(body) {
    const tabOn = view.tab === 'topic' || view.tab === 'pick' ? 'learn' : view.tab === 'review' ? 'home' : view.tab === 'star' ? 'mine' : view.tab;
    return `<div class="wd-top">
      <div class="wd-hero">
        <h2 class="wd-h">${esc(t('단어', 'Words'))}</h2>
        <label class="wd-searchbox">${SEARCH_ICON}
          <input class="wd-search" id="wdQ" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search"
            aria-label="${esc(t('낱말 찾기', 'Search words'))}"
            placeholder="${esc(t('먹었어요 · eat · meokda · ㅅㄹ', 'Try 먹었어요, eat, meokda, ㅅㄹ'))}" value="${esc(query)}">
        </label>
      </div>
      <nav class="wd-tabs" role="tablist">${tabs().map(([k, l]) =>
        `<button type="button" role="tab" class="wd-tab${tabOn === k ? ' on' : ''}" data-tab="${k}" aria-selected="${tabOn === k}">${esc(l)}</button>`).join('')}
      </nav>
    </div>
    <div class="wd-body" id="wdBody">${body}</div>
    <p class="wd-src">${esc(t('어휘 급수: 국립국어원 「국제 통용 한국어 표준 교육과정」(공공누리 1유형) · 뜻풀이 일부: 국립국어원 한국어기초사전(CC BY-SA 2.0 KR) · 예문: 치즈감자',
      'Word levels: National Institute of Korean Language, International Standard Curriculum (KOGL Type 1) · some definitions: Basic Korean Dictionary (CC BY-SA 2.0 KR) · examples: Cheesepotato'))}</p>`;
  }
  const bar = (n, of) => `<span class="wd-bar"><i style="width:${of ? Math.round((n / of) * 100) : 0}%"></i></span>`;
  const wordRow = (w, extra = '') =>
    `<button type="button" class="wd-row" data-word="${esc(w.h)}"><b>${esc(w.h)}</b><span class="wd-pos">${esc(w.p || '')}</span>` +
    `<span class="wd-mean">${esc(mean(w) || '')}</span>${extra}</button>`;

  /* 오늘 — 할 일 하나만 크게: 오늘의 새 낱말 10개와 시작 단추. 복습할 것이 있으면 그 위에 한 줄. */
  function drawHome() {
    const d = due();
    const nx = nextSession();
    const total = VOCAB.length, got = VOCAB.filter((w) => learned(idOf(w))).length;
    const first = !Object.keys(S.w).length;
    const next = nx == null ? [] : chunk(VOCAB)[nx];
    return `<div class="wd-today">
      ${d.length ? `<button type="button" class="wd-due" data-act="review"><span>${esc(t('오늘 복습', 'Review today'))}</span><b>${d.length}</b><em>${esc(t('먼저 하기 →', 'Do first →'))}</em></button>` : ''}
      <div class="wd-focus">
        ${TRACKS.topik2.length ? `<button type="button" class="wd-focus-track" data-act="track" data-track="${S.track === 'topik1' ? 'topik2' : 'topik1'}">${trackName(S.track)} <em>${esc(t('바꾸기', 'switch'))}</em></button>` : ''}
        <p class="wd-focus-k">${esc(nx == null ? t(`${trackName(S.track)} 필수를 다 봤어요!`, `You have seen every ${trackName(S.track)} word!`) : t(`오늘의 새 낱말 ${SESSION}개`, `Today’s ${SESSION} new words`))}</p>
        ${next.length ? `<div class="wd-peek">${next.map((w) => `<button type="button" class="wd-peek-w" data-word="${esc(w.h)}">${esc(w.h)}</button>`).join('')}</div>` : ''}
        ${nx == null ? '' : `<button type="button" class="wd-btn wd-btn-big" data-act="session" data-topic="all" data-n="${nx}">${esc(first ? t('시작하기', 'Start') : t('이어서 외우기', 'Continue'))} →</button>`}
        <p class="wd-focus-p">${esc(t(`${trackName(S.track)} 필수 ${got.toLocaleString()} / ${total.toLocaleString()}`, `${trackName(S.track)} essentials ${got.toLocaleString()} / ${total.toLocaleString()}`))}</p>
        ${bar(got, total)}
      </div>
    </div>`;
  }

  /* 과정 고르기 — TOPIK II 가 채워진 뒤에만 보인다. */
  const trackBar = () => (TRACKS.topik2.length ? `<div class="wd-track" role="group" aria-label="${esc(t('과정', 'Level'))}">${['topik1', 'topik2'].map((k) =>
    `<button type="button" class="wd-chip${S.track === k ? ' on' : ''}" data-act="track" data-track="${k}">${trackName(k)} <small>${TRACKS[k].length.toLocaleString()}</small></button>`).join('')}</div>` : '');
  function drawLearn() {
    const all = VOCAB.length, got = VOCAB.filter((w) => learned(idOf(w))).length;
    const cards = TOPICS.map((tp) => {
      const list = listFor(tp.id);
      if (!list.length) return '';
      const g = list.filter((w) => learned(idOf(w))).length;
      const [ico, h] = look(tp.id);
      return `<button type="button" class="wd-topic" style="--h:${h}" data-act="topic" data-topic="${esc(tp.id)}">
        <span class="wd-topic-ico" aria-hidden="true">${ico}</span>
        <b>${esc(t(tp.ko, tp.en))}</b>
        <span class="wd-meta">${esc(t(`${list.length}개 · 세션 ${Math.ceil(list.length / SESSION)}`, `${list.length} words · ${Math.ceil(list.length / SESSION)} sessions`))}</span>${bar(g, list.length)}</button>`;
    }).join('');
    /* 목적별 — 10개(한 세션)가 안 되는 목적은 아직 싣지 않는다. */
    const purps = Object.keys(PURP_LOOK).map((k) => {
      const id = `p:${k}`, pp = purpOf(id), list = listFor(id);
      if (!pp || list.length < SESSION) return '';
      /* 카드가 아니라 작은 알약 — 주제별 카드를 아래로 밀어내지 않게(운영자 요청: 첫 화면 덜어내기). */
      return `<button type="button" class="wd-chip wd-purp" data-act="topic" data-topic="${esc(id)}"><span aria-hidden="true">${look(id)[0]}</span>${esc(t(pp.ko, pp.en))} <small>${list.length.toLocaleString()}</small></button>`;
    }).join('');
    return trackBar() + `<button type="button" class="wd-topic wd-topic-main" style="--h:25" data-act="topic" data-topic="all">
        <span class="wd-topic-ico" aria-hidden="true">🏆</span>
        <b>${esc(t(`${trackName(S.track)} 필수 — 자주 나오는 차례로`, `${trackName(S.track)} essentials — most frequent first`))}</b>
        <span class="wd-meta">${esc(t(`${all.toLocaleString()}개 · 세션 ${Math.ceil(all / SESSION)}`, `${all.toLocaleString()} words · ${Math.ceil(all / SESSION)} sessions`))}</span>${bar(got, all)}</button>
      ${purps ? `<h3 class="wd-h3">${esc(t('목적별 — TOPIK I · II 함께', 'By goal — TOPIK I & II'))}</h3>
      <div class="wd-purps">${purps}</div>` : ''}
      <h3 class="wd-h3">${esc(t('주제별', 'By topic'))}</h3>
      <div class="wd-topics">${cards}</div>
      <h3 class="wd-h3">${esc(t('게임으로 연습', 'Practice with games'))}</h3>
      <div class="wd-games">
        <button type="button" class="wd-game" data-act="game-quiz"><b>⏱ ${esc(t('스피드 퀴즈', 'Speed quiz'))}</b><span>${esc(t('60초 동안 뜻 보고 고르기', '60 seconds, pick the word'))}</span></button>
        <button type="button" class="wd-game" data-act="game-match"><b>🧩 ${esc(t('짝 맞추기', 'Match'))}</b><span>${esc(t('오늘의 낱말로 시간 재기', 'Today’s words, against the clock'))}</span></button>
      </div>`;
  }

  function drawTopic(topic) {
    const ss = chunk(listFor(topic));
    const name = topicName(topic);
    return `<button type="button" class="wd-back" data-tab="learn">← ${esc(t('주제', 'Topics'))}</button>
      <h3 class="wd-h3 wd-h3-big">${topic === 'all' ? '🏆' : look(topic)[0]} ${esc(name)}</h3>
      <div class="wd-sessions">${ss.map((s, i) => {
        const g = s.filter((w) => learned(idOf(w))).length;
        return `<button type="button" class="wd-sess${g === s.length ? ' done' : g ? ' part' : ''}" data-act="session" data-topic="${esc(topic)}" data-n="${i}">
          <span class="wd-sess-n">${g === s.length ? '✓' : i + 1}</span>
          <b>${esc(t(`세션 ${i + 1}`, `Session ${i + 1}`))}</b>
          <span>${esc(s.slice(0, 4).map((w) => w.h).join(' · '))}${s.length > 4 ? ' …' : ''}</span>${bar(g, s.length)}</button>`;
      }).join('')}</div>`;
  }

  /* 세션을 고른 뒤: 낱말 미리 보기 + 공부 방식 셋 + 방향. */
  function drawPick() {
    const { words, title, back } = view.pick;
    return `<button type="button" class="wd-back" ${back}>← ${esc(t('뒤로', 'Back'))}</button>
      <h3 class="wd-h3">${esc(title)}</h3>
      <div class="wd-modes">
        <button type="button" class="wd-mode" data-act="go" data-mode="card"><b>${esc(t('카드', 'Cards'))}</b><span>${esc(t('뒤집어 보며 「알아요 · 헷갈려요 · 몰라요」', 'Flip and rate: know / unsure / don’t know'))}</span></button>
        <button type="button" class="wd-mode" data-act="go" data-mode="learn"><b>${esc(t('외우기', 'Learn'))}</b><span>${esc(t('보기 고르기 → 익숙해지면 직접 쓰기', 'Multiple choice, then type it yourself'))}</span></button>
        <button type="button" class="wd-mode" data-act="go" data-mode="write"><b>${esc(t('쓰기', 'Write'))}</b><span>${esc(t('뜻을 보고 한국어로 쳐 보기', 'See the meaning, type the Korean'))}</span></button>
        <button type="button" class="wd-mode" data-act="go" data-mode="dict"><b>${esc(t('받아쓰기', 'Dictation'))}</b><span>${esc(t('소리를 듣고 한국어로 쓰기', 'Listen, then type what you hear'))}</span></button>
        <button type="button" class="wd-mode" data-act="go" data-mode="match"><b>${esc(t('짝 맞추기', 'Match'))}</b><span>${esc(t('낱말과 뜻을 짝지어 — 시간을 재요', 'Pair words and meanings against the clock'))}</span></button>
        ${words.length >= 2 ? `<button type="button" class="wd-mode" data-act="go" data-mode="test"><b>${esc(t('시험 보기', 'Test'))}</b><span>${esc(t('유형을 섞은 문제로 점수 내기', 'Mixed questions, scored at the end'))}</span></button>` : ''}
      </div>
      <div class="wd-dir" role="group" aria-label="${esc(t('방향', 'Direction'))}">
        <button type="button" class="wd-chip${S.dir === 'ko' ? ' on' : ''}" data-act="dir" data-dir="ko">${esc(t('한국어 → 뜻', 'Korean → meaning'))}</button>
        <button type="button" class="wd-chip${S.dir === 'en' ? ' on' : ''}" data-act="dir" data-dir="en">${esc(t('뜻 → 한국어', 'Meaning → Korean'))}</button>
      </div>
      <div class="wd-list">${words.map((w) => wordRow(w, learned(idOf(w)) ? '<span class="wd-ok">✓</span>' : '')).join('')}</div>
      ${words.some((w) => byHead.get(w.h) === w) ? `<button type="button" class="wd-btn ghost wd-share" data-act="share">${LINK_ICON}${esc(t('이 낱말들을 링크로 보내기', 'Share these words as a link'))}</button>` : ''}
      ${view.pick.from ? `<button type="button" class="wd-btn ghost wd-addall" data-act="addall">${esc(t(`이 ${words.length}개 모두 내 단어장에 담기`, `Save all ${words.length} to my wordbook`))}</button>` : ''}`;
  }

  /* 낱말 묶음 공유 — 목록에 있는 낱말만 주소에 싣는다(#words/set/<낱말>.<낱말>…). 받은 사람은 로그인 없이 그 묶음을 바로 공부한다.
     서버에 아무것도 남기지 않는다 — 주소가 곧 묶음이다. 주소가 너무 길어지지 않게 SET_MAX 개까지. */
  const SET_MAX = 60;
  async function shareSet(btn) {
    const heads = view.pick.words.filter((w) => byHead.get(w.h) === w).slice(0, SET_MAX).map((w) => w.h);
    const url = `${location.origin}/#words/set/${heads.map(encodeURIComponent).join('.')}`;
    const title = t(`치즈감자 낱말 ${heads.length}개`, `${heads.length} Korean words — 치즈감자`);
    D.track('단어공유');
    try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch (e) { if (e?.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); btn.textContent = t('✓ 링크를 복사했어요', '✓ Link copied'); }
    catch (e) { prompt(t('이 링크를 복사하세요', 'Copy this link'), url); }
  }
  function openSet(raw) {
    const words = [...new Set(raw.split('.').map((x) => { try { return decodeURIComponent(x); } catch (e) { return ''; } }))]
      .map((h) => byHead.get(h)).filter(Boolean).slice(0, SET_MAX);
    if (!words.length) { view = { tab: 'home' }; return; }
    view = { tab: 'pick', pick: { words, from: null, title: t(`받은 낱말 ${words.length}개`, `Shared set — ${words.length} words`), back: 'data-tab="home"' } };
  }

  /* 담을 모양 — 원본 낱말 id(vocab_id)와 담은 곳을 같이 적는다(docs/vocab-plan.md 5층 「내 단어장 연동」). */
  function toSave(h) {
    const w = byHead.get(h), g = w ? null : Object.values(D.gloss()).find((x) => x.head === h);
    return { word: h, meaning: w ? w.e : (g?.en || ''), tag: w?.p || g?.pos || null, vocab_id: w ? idOf(w) : null, source: 'words' };
  }

  /* 내 단어장 탭. 로그인했으면 계정의 단어장(앱과 같은 words 표), 아니면 이 브라우저에 담아 둔 것.
     목록을 받아 오는 동안 자리만 그려 두고, 오면 채운다. */
  let mineWords = [];
  function drawMine() {
    D.myWords().then((res) => {
      const box = root.querySelector('#wdMine');
      if (!box) return;
      const rows = res.rows || [];
      /* 공부 판은 VOCAB 모양을 쓴다. 목록에 있는 낱말은 그대로, 없는 것(직접 적은 낱말)은 뜻만 가진 모양으로. */
      mineWords = rows.map((r) => byHead.get(r.word) || { h: r.word, p: r.tag || '', l: 0, e: r.meaning || '', s: '', t: [], u: [], x: [] })
        .filter((w) => mean(w));
      const stars = starIds().map((id) => byId.get(id)).filter(Boolean);
      box.innerHTML = (res.signedIn ? `<button type="button" class="wd-open-wb" data-act="wordbook"><b>${esc(t('단어장 전체 열기', 'Open full wordbook'))}</b><span>${esc(t('고치기 · 지우기 · 사진 · 엑셀 · 앱과 같은 단어장', 'Edit, delete, photos, Excel — same list as the app'))}</span><em>→</em></button>` :
        `<div class="wd-card hot"><p>${esc(t('로그인하지 않아도 담을 수 있어요. 로그인하면 계정으로 옮겨져서 다른 기기와 앱에서도 보여요.', 'You can save without signing in. Sign in and they move to your account — on every device and in the app.'))}</p>
          <button type="button" class="wd-btn" data-act="login">${esc(t('로그인', 'Sign in'))}</button></div>`) +
        (rows.length ? `<p class="wd-count">${esc(t(`${rows.length}개`, `${rows.length} words`))}</p>
          ${mineWords.length ? `<button type="button" class="wd-btn" data-act="mystudy">${esc(t('카드 · 외우기로 공부하기', 'Study with cards or learn'))}</button>` : ''}
          <div class="wd-list">${rows.map((r) => { const w = byHead.get(r.word); return `<button type="button" class="wd-row" data-word="${esc(r.word)}"><b>${esc(r.word)}</b><span class="wd-pos">${esc(r.tag || '')}</span>${w ? `<span class="wd-lv">${trackName(trackOf(w))}</span>` : ''}<span class="wd-mean">${esc(r.meaning || '')}</span></button>`; }).join('')}</div>`
          : `<p class="wd-none">${esc(t('아직 담은 낱말이 없어요. 낱말 화면이나 세션에서 「+ 내 단어장」을 눌러 보세요.', 'Nothing saved yet. Tap “+ My wordbook” on a word or a session.'))}</p>`) +
        (stars.length ? `<h3 class="wd-h3">⭐ ${esc(t(`별표 ${stars.length}개`, `Starred — ${stars.length}`))}</h3>
          <button type="button" class="wd-btn ghost" data-act="starstudy">${esc(t('별표만 공부하기', 'Study starred'))}</button>
          <div class="wd-list">${stars.map((w) => wordRow(w)).join('')}</div>` : '');
    }).catch(() => { const box = root.querySelector('#wdMine'); if (box) box.innerHTML = `<p class="wd-none">${esc(t('단어장을 불러오지 못했어요.', 'Could not load your wordbook.'))}</p>`; });
    return `<div id="wdMine"><p class="wd-none">${esc(t('불러오는 중…', 'Loading…'))}</p></div>`;
  }

  function drawWord(h) {
    const w = byHead.get(h);
    if (!w) {
      const g = D.gloss();
      const v = Object.values(g).find((x) => x.head === h);
      if (!v) return `<p class="wd-none">${esc(t('이 낱말은 아직 없어요.', 'We don’t have this word yet.'))}</p>`;
      setTimeout(() => moreFromDict(h), 0);
      return `<div class="wd-word">
        <div class="wd-word-h"><b>${esc(h)}</b><button type="button" class="dict-say" data-say="${esc(h)}" aria-label="${esc(t('발음 듣기', 'Play'))}">${icon}</button></div>
        <div class="wd-word-meta">${esc(v.pos || '')}</div>
        <p class="wd-word-en">${esc(v.en || '')}</p>
        <div id="wdMore"></div>
        <div class="wd-word-act"><button type="button" class="wd-btn ghost" data-act="add" data-h="${esc(h)}">${esc(t('+ 내 단어장', '+ My wordbook'))}</button></div>
        <p class="wd-note">${esc(t('사전 낱말이에요. TOPIK 필수 목록에는 없어요.', 'A dictionary word — not on the TOPIK essentials lists.'))}</p>
      </div>`;
    }
    const id = idOf(w);
    needEx(w);
    const rel = w.r ? Object.entries(w.r).map(([k, v]) => `<span class="wd-rel"><em>${esc({ syn: t('비슷한 말', 'Similar'), ant: t('반대말', 'Opposite'), hon: t('높임말', 'Honorific') }[k])}</em>${
      v.map((x) => byHead.has(x) || Object.values(D.gloss()).some((g) => g.head === x) ? `<button type="button" class="wd-chip" data-word="${esc(x)}">${esc(x)}</button>` : `<span>${esc(x)}</span>`).join('')}</span>`).join('') : '';
    const topics = w.t.map((x) => { const [a, b] = x.split('/'); const tp = topicOf(a); const s = tp?.subs.find((y) => y.id === b); return tp ? `<button type="button" class="wd-chip" data-act="topic" data-topic="${esc(a)}">${esc(t(tp.ko, tp.en))}${s ? ' · ' + esc(t(s.ko, s.en)) : ''}</button>` : ''; }).join('');
    const pos = TRACKS[trackOf(w)].indexOf(w);
    const [ico, hue] = look(w.t[0]?.split('/')[0]);
    return `<div class="wd-word" style="--h:${hue}">
      <div class="wd-word-top">
        <div class="wd-word-h"><span class="wd-word-ico" aria-hidden="true">${ico}</span><b>${esc(w.h)}</b><button type="button" class="dict-say wd-say-big" data-say="${esc(w.h)}" aria-label="${esc(t('발음 듣기', 'Play'))}">${icon}</button>
          <button type="button" class="wd-star${isStar(id) ? ' on' : ''}" data-act="star" data-id="${esc(id)}" aria-label="${esc(t('별표', 'Star'))}">${isStar(id) ? '★' : '☆'}</button></div>
        <div class="wd-word-meta"><span class="wd-tagpill">TOPIK ${w.l}${esc(t('급', ''))}</span><span class="wd-tagpill">${esc(w.p || '')}</span><span class="wd-rom">${esc(roman(w.h))}</span>${learned(id) ? `<span class="wd-tagpill ok">✓ ${esc(t('외움', 'Learned'))}</span>` : ''}</div>
        <p class="wd-word-en">${esc(w.e)}</p>
      </div>
      ${w.s && w.s !== w.e ? `<p class="wd-word-s">${esc(w.s)}</p>` : ''}
      <ul class="wd-ex">${w.x.map(([ko, en]) => `<li><span>${esc(ko)}<button type="button" class="dict-say" data-say="${esc(ko)}" aria-label="${esc(t('예문 듣기', 'Play example'))}">${icon}</button></span><small>${esc(en)}</small></li>`).join('')}</ul>
      ${rel ? `<div class="wd-rels">${rel}</div>` : ''}
      ${topics ? `<div class="wd-tags">${topics}</div>` : ''}
      <div class="wd-word-act">
        <button type="button" class="wd-btn" data-act="session" data-topic="all" data-track="${trackOf(w)}" data-n="${Math.floor(pos / SESSION)}">${esc(t('이 낱말이 든 세션 외우기', 'Learn its session'))}</button>
        <button type="button" class="wd-btn ghost" data-act="add" data-h="${esc(w.h)}">${esc(t('+ 내 단어장', '+ My wordbook'))}</button>
      </div>
    </div>`;
  }
  /* 사전 낱말은 국어사전 화면이 쓰던 뜻풀이 · 예문을 그대로 붙인다. */
  async function moreFromDict(h) {
    const [ex, senses] = await Promise.all([D.loadExamples(), D.loadSenses()]);
    const box = root.querySelector('#wdMore');
    if (!box) return;
    const e = ex[h], s = senses[h];
    box.innerHTML = (e ? `<ul class="wd-ex"><li><span>${esc(e.ex)}<button type="button" class="dict-say" data-say="${esc(e.ex)}">${icon}</button></span><small>${esc(e.en)}</small></li></ul>` : '') +
      (s && s.length ? `<ol class="dict-sense-list">${s.map(([ko, en]) => `<li><span class="dict-sense-ko">${esc(ko)}</span>${en ? `<span class="dict-sense-en">${esc(en)}</span>` : ''}</li>`).join('')}</ol>` : '');
  }

  function drawSearch() {
    if (!query.trim()) return drawHome();
    const { list, fix } = search(query);
    lastHits = list.slice(0, 60);
    if (sel >= lastHits.length) sel = lastHits.length - 1;
    /* 친 글자가 표제어 안에 그대로 있으면 그 부분을 칠해 준다 — 왜 이 낱말이 나왔는지 보이게. */
    const qn = norm(query);
    const hl = (h) => { const i = qn ? h.indexOf(qn) : -1; return i < 0 ? esc(h) : `${esc(h.slice(0, i))}<mark>${esc(h.slice(i, i + qn.length))}</mark>${esc(h.slice(i + qn.length))}`; };
    const rows = lastHits.map((e, i) => `<button type="button" class="wd-row${i === sel ? ' sel' : ''}" data-word="${esc(e.h)}">
      <b>${hl(e.h)}</b><span class="wd-pos">${esc(e.p || '')}</span>${e.w ? `<span class="wd-lv">${trackName(trackOf(e.w))}</span>` : ''}
      <span class="wd-mean">${esc(e.w ? mean(e.w) : e.en.split(';')[0])}</span></button>`).join('');
    return (fix ? `<p class="wd-fix">${esc(t('이것을 찾으셨나요?', 'Did you mean'))} <button type="button" class="wd-chip" data-word="${esc(fix.h)}">${esc(fix.h)}</button></p>` : '') +
      (list.length ? `<p class="wd-count">${esc(t(`${list.length}개 찾음`, `${list.length} found`))}${list.length > lastHits.length ? esc(t(' · 앞 60개', ' · first 60')) : ''}</p><div class="wd-list" id="wdHits">${rows}</div>`
        : `<p class="wd-none">${esc(t(`"${query}" 와 맞는 낱말이 없어요.`, `Nothing matches "${query}".`))}</p>`);
  }

  function drawStar() {
    const list = starIds().map((id) => byId.get(id)).filter(Boolean);
    if (!list.length) return `<p class="wd-none">${esc(t('별표한 낱말이 없어요. 카드나 낱말 화면에서 ☆ 를 누르면 여기 모여요.', 'No starred words yet. Tap ☆ on a card or word page to collect hard ones here.'))}</p>`;
    return `<button type="button" class="wd-btn" data-act="starstudy">${esc(t(`별표 ${list.length}개 공부하기`, `Study ${list.length} starred`))}</button>
      <div class="wd-list">${list.map((w) => wordRow(w)).join('')}</div>`;
  }

  function drawReview() {
    const d = due();
    if (!d.length) return `<p class="wd-none">${esc(t('오늘 복습할 낱말이 없어요. 새 낱말을 외우면 1 · 3 · 7 · 14 · 30일 뒤에 다시 불러 드려요.', 'Nothing due today. New words come back after 1, 3, 7, 14 and 30 days.'))}</p>`;
    return `<p class="wd-lead">${esc(t(`오늘 다시 볼 낱말 ${d.length}개`, `${d.length} words due today`))}</p>
      <button type="button" class="wd-btn" data-act="review">${esc(t('복습 시작', 'Start review'))}</button>
      <div class="wd-list">${d.slice(0, 50).map((w) => wordRow(w)).join('')}</div>`;
  }

  function drawStats() {
    const total = VOCAB.length, got = VOCAB.filter((w) => learned(idOf(w))).length;
    const now = today();
    const week = Array.from({ length: 14 }, (_, i) => now - 13 + i);
    const max = Math.max(1, ...week.map((d) => S.days[d] || 0));
    const weak = Object.entries(S.w).filter(([id, v]) => v[3] >= 2 && v[3] > v[2] && byId.has(id))
      .sort((a, b) => b[1][3] - a[1][3]).slice(0, 20).map(([id]) => byId.get(id));
    return `<div class="wd-stats">
      <div><b>${got.toLocaleString()}</b><span>${esc(t('외운 낱말', 'Words learned'))}</span></div>
      <div><b>${streak()}</b><span>${esc(t('연속 일수', 'Day streak'))}</span></div>
      <div><b>${S.days[now] || 0}</b><span>${esc(t('오늘 푼 수', 'Answered today'))}</span></div>
      <div><b>${due().length}</b><span>${esc(t('오늘 복습', 'Due today'))}</span></div>
    </div>
    <div class="wd-week" aria-label="${esc(t('최근 14일', 'Last 14 days'))}">${week.map((d) => `<i style="height:${Math.round(((S.days[d] || 0) / max) * 100)}%" title="${dayStr(d)} · ${S.days[d] || 0}"></i>`).join('')}</div>
    <h3 class="wd-h3">${esc(t('주제별 진도', 'By topic'))}</h3>
    <div class="wd-tprog">${[['all', t(`${trackName(S.track)} 필수`, `${trackName(S.track)} essentials`)], ...TOPICS.map((x) => [x.id, t(x.ko, x.en)])].map(([id, name]) => {
      const list = listFor(id); if (!list.length) return '';
      const g = list.filter((w) => learned(idOf(w))).length;
      return `<button type="button" data-act="topic" data-topic="${esc(id)}"><span>${esc(name)}</span><em>${g} / ${list.length}</em>${bar(g, list.length)}</button>`;
    }).join('')}</div>
    ${weak.length ? `<h3 class="wd-h3">${esc(t('자주 틀리는 낱말', 'Words you often miss'))}</h3><div class="wd-list">${weak.map((w) => wordRow(w)).join('')}</div>` : ''}
    <p class="wd-note">${esc(t('기록은 이 브라우저에만 남아요. 곧 로그인하면 다른 기기에서도 이어지게 바꿀게요.', 'Progress is kept in this browser for now. Syncing to your account is coming soon.'))}</p>`;
  }

  /* ── 공부 판 ───────────────────────────────────────────── */
  function startRun(words, mode, from) {
    if (!words.length) return;
    run = { mode, from, words, dir: S.dir, i: 0, flip: false, res: {}, q: [], cur: null, fb: null, answered: 0, score: 0 };
    if (mode === 'card') run.q = words.map((w) => ({ w }));
    else if (mode === 'test') run.q = makeTest(words);
    else if (mode !== 'match') run.q = words.map((w) => ({ w, stage: mode === 'learn' ? 0 : 1, miss: 0, dict: mode === 'dict' }));
    run.total = mode === 'test' ? run.q.length : words.length;
    if (mode === 'match') run.match = makeMatch(words);
    else { run.cur = run.q.shift(); if (mode !== 'card') makeChoices(); }
    view = { tab: 'study' };
    D.track(from === 'review' ? '단어복습시작' : '단어세션시작');
    draw();
    window.scrollTo({ top: 0 });   // 방식 단추가 아래쪽에 있어서, 안 올리면 판의 머리(✕ · 진도 · 시계)가 화면 밖에서 시작한다
  }
  /* 시험 보기 — 유형을 섞은 문제(뜻 고르기 · 낱말 고르기 · 쓰기 · 받아쓰기). 낱말이 적으면 한 낱말이 두 유형으로
     나온다. 한 번씩만 묻고(틀려도 다시 넣지 않는다) 끝에 점수를 낸다. */
  function makeTest(words) {
    const kinds = ['mc-ko', 'mc-en', 'type', 'dict'];
    const n = words.length >= 10 ? 20 : Math.max(words.length * 2, 4);
    const items = [];
    for (let i = 0; i < n; i++) {
      const w = words[i % words.length], k = kinds[(i + Math.floor(i / words.length)) % 4];
      items.push({ w, stage: k.startsWith('mc') ? 0 : 1, dir: k === 'mc-en' ? 'en' : 'ko', dict: k === 'dict', miss: 0, test: true });
    }
    return items.sort(() => Math.random() - 0.5);
  }
  /* 짝 맞추기 — 낱말 6개(12칸). 시간을 잰다. 외우기 기록(상자)은 건드리지 않는다 — 보고 맞히는 놀이라서. */
  function makeMatch(words) {
    const pick = words.length > 6 ? [...words].sort(() => Math.random() - 0.5).slice(0, 6) : words;
    const tiles = pick.flatMap((w) => [{ k: idOf(w), text: w.h, ko: true }, { k: idOf(w), text: mean(w), ko: false }])
      .sort(() => Math.random() - 0.5);
    return { pick, tiles, sel: -1, gone: new Set(), bad: null, miss: 0, t0: Date.now(), end: 0 };
  }
  function makeChoices() {
    const c = run.cur;
    if (!c || c.stage !== 0 || c.opts) return;
    const w = c.w;
    const same = VOCAB.filter((x) => x !== w && x.p === w.p && mean(x) !== mean(w) && x.h !== w.h);
    const pool = same.length >= 3 ? same : VOCAB.filter((x) => x !== w && mean(x) !== mean(w));
    const pick = [];
    while (pick.length < 3) { const x = pool[Math.floor(Math.random() * pool.length)]; if (!pick.includes(x)) pick.push(x); }
    c.opts = [w, ...pick].sort(() => Math.random() - 0.5);
  }
  /* 진도는 「끝낸 낱말 수」로 센다 — 틀려서 다시 넣은 차례까지 세면 막대가 뒤로 간다. */
  const doneCount = () => (run.mode === 'test' ? run.answered : Object.keys(run.res).length);

  function drawMatch() {
    const m = run.match;
    const secs = ((m.end || Date.now()) - m.t0) / 1000;
    const head = `<div class="wd-study-hd"><button type="button" class="wd-x" data-act="quit" aria-label="${esc(t('그만하기', 'Quit'))}">✕</button>
      ${bar(m.gone.size / 2, m.pick.length)}<span class="wd-n" id="wdTimer">${secs.toFixed(1)}${esc(t('초', 's'))}</span></div>`;
    if (m.end) {
      const key = 'cp-words-match-best';
      let best = null;
      try { best = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
      const isBest = m.newBest;
      return `<div class="wd-done"><b class="wd-big">${isBest ? '🏆' : '⚡'}</b>
        <h3>${esc(t(`${secs.toFixed(1)}초!`, `${secs.toFixed(1)} s!`))}</h3>
        <p>${esc(isBest ? t('새 최고 기록이에요!', 'New personal best!') : best ? t(`최고 기록 ${best.toFixed(1)}초`, `Best: ${best.toFixed(1)} s`) : '')}${m.miss ? esc(t(` · 틀린 짝 ${m.miss}번`, ` · ${m.miss} wrong tries`)) : ''}</p>
        <div class="wd-word-act">
          <button type="button" class="wd-btn" data-act="rematch">${esc(t('한 번 더', 'Play again'))}</button>
          <button type="button" class="wd-btn ghost" data-tab="home">${esc(t('오늘 화면으로', 'Back to Today'))}</button>
        </div></div>`;
    }
    return head + `<p class="wd-lead wd-center">${esc(t('낱말과 뜻을 짝지어 누르세요', 'Tap a word, then its meaning'))}</p>
      <div class="wd-match">${m.tiles.map((x, i) => m.gone.has(i) ? '<span class="wd-tile gone"></span>'
        : `<button type="button" class="wd-tile${x.ko ? ' ko' : ''}${m.sel === i ? ' sel' : ''}${m.bad && m.bad.includes(i) ? ' bad' : ''}" data-act="tile" data-i="${i}">${esc(x.text)}</button>`).join('')}</div>`;
  }
  function tapTile(i) {
    const m = run.match;
    if (!m || m.end || m.gone.has(i)) return;
    m.bad = null;
    if (m.sel < 0 || m.sel === i) { m.sel = m.sel === i ? -1 : i; return draw(); }
    const a = m.tiles[m.sel], b = m.tiles[i];
    if (a.k === b.k && a.ko !== b.ko) {
      m.gone.add(m.sel); m.gone.add(i);
      if ((a.ko ? a : b).text) sayWord((a.ko ? a : b).text);
    } else { m.miss++; m.bad = [m.sel, i]; }
    m.sel = -1;
    if (m.gone.size === m.tiles.length) {
      m.end = Date.now();
      const secs = (m.end - m.t0) / 1000;
      S.days[today()] = (S.days[today()] || 0) + m.pick.length; save();
      try {
        const key = 'cp-words-match-best', best = JSON.parse(localStorage.getItem(key) || 'null');
        if (m.pick.length >= 6 && (best == null || secs < best)) { localStorage.setItem(key, JSON.stringify(secs)); m.newBest = true; }
      } catch (e) {}
      D.track('단어세션끝');
    }
    draw();
  }

  function drawStudy() {
    const r = run;
    if (r.mode === 'match') return drawMatch();
    if (!r.cur) return drawDone();
    const w = r.cur.w, id = idOf(w);
    const head = `<div class="wd-study-hd"><button type="button" class="wd-x" data-act="quit" aria-label="${esc(t('그만하기', 'Quit'))}">✕</button>
      ${bar(doneCount(), r.total)}<span class="wd-n">${doneCount()} / ${r.total}</span>
      <button type="button" class="wd-star${isStar(id) ? ' on' : ''}" data-act="star" data-id="${esc(id)}" aria-label="${esc(t('별표', 'Star'))}">${isStar(id) ? '★' : '☆'}</button></div>`;
    if (r.mode === 'card') {
      needEx(w);
      const front = r.dir === 'ko'
        ? `<b class="wd-big">${esc(w.h)}</b><span class="wd-pos">${esc(w.p || '')}</span>`
        : `<b class="wd-big wd-big-en">${esc(mean(w))}</b><span class="wd-pos">${esc(w.p || '')}</span>`;
      const back = `<b class="wd-big">${esc(w.h)}</b><button type="button" class="dict-say" data-say="${esc(w.h)}">${icon}</button>
        <span class="wd-pos">${esc(w.p || '')} · <span class="wd-rom">${esc(roman(w.h))}</span></span>
        <p class="wd-word-en">${esc(w.e)}</p>
        ${w.x[0] ? `<p class="wd-cex">${esc(w.x[0][0])}<button type="button" class="dict-say" data-say="${esc(w.x[0][0])}">${icon}</button><small>${esc(w.x[0][1])}</small></p>` : ''}`;
      return head + `<div class="wd-flash${r.flip ? ' flip' : ''}" data-act="flip" role="button" tabindex="0" aria-label="${esc(t('카드 뒤집기', 'Flip card'))}">
          ${r.flip ? back : front}${r.flip ? '' : `<span class="wd-hint">${esc(t('눌러서 뒤집기 · Space', 'Tap to flip · Space'))}</span>`}</div>
        <div class="wd-rate">
          <button type="button" class="wd-r no" data-act="rate" data-how="no">${esc(t('몰라요', 'Don’t know'))}<kbd>1</kbd></button>
          <button type="button" class="wd-r unsure" data-act="rate" data-how="unsure">${esc(t('헷갈려요', 'Unsure'))}<kbd>2</kbd></button>
          <button type="button" class="wd-r know" data-act="rate" data-how="know">${esc(t('알아요', 'Know it'))}<kbd>3</kbd></button>
        </div>`;
    }
    const c = r.cur, fb = r.fb;
    const dir = c.dir || r.dir;
    if (c.stage === 0) {
      const prompt = dir === 'ko' ? `<b class="wd-big">${esc(w.h)}</b>` : `<b class="wd-big wd-big-en">${esc(mean(w))}</b>`;
      return head + `<div class="wd-q">${prompt}<span class="wd-pos">${esc(w.p || '')}</span></div>
        <div class="wd-opts">${c.opts.map((o, i) => {
          const cls = fb ? (o === w ? ' right' : fb.pick === i ? ' wrong' : '') : '';
          return `<button type="button" class="wd-opt${cls}" data-act="opt" data-i="${i}" ${fb ? 'disabled' : ''}><kbd>${i + 1}</kbd>${esc(dir === 'ko' ? mean(o) : o.h)}</button>`;
        }).join('')}</div>
        ${fb && !fb.ok ? `<button type="button" class="wd-btn" data-act="next">${esc(t('다음', 'Next'))} ↵</button>` : ''}`;
    }
    /* 받아쓰기는 뜻 대신 소리가 문제다 — 뜻은 답한 뒤에 보인다. */
    const q = c.dict
      ? `<div class="wd-q"><button type="button" class="wd-listen" data-say="${esc(w.h)}" aria-label="${esc(t('다시 듣기', 'Play again'))}">${icon}</button>
          <span class="wd-pos">${fb ? esc(mean(w)) : esc(t('듣고 한국어로 쓰세요 · 눌러서 다시 듣기', 'Listen and type it in Korean · tap to replay'))}</span></div>`
      : `<div class="wd-q"><b class="wd-big wd-big-en">${esc(mean(w))}</b><span class="wd-pos">${esc(w.p || '')}${w.e !== mean(w) ? ' · ' + esc(w.e) : ''}</span></div>`;
    return head + q + `
<form class="wd-type" data-act="type">
        <input id="wdType" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ko"
          aria-label="${esc(t('한국어로 쓰기', 'Type in Korean'))}" placeholder="${esc(t('한국어로 쓰세요', 'Type it in Korean'))}" ${fb ? 'disabled' : ''} value="${esc(fb?.said || '')}">
        ${fb ? '' : `<button type="submit" class="wd-btn">${esc(t('확인', 'Check'))}</button>`}
      </form>
      ${fb ? `<p class="wd-fb ${fb.ok ? 'ok' : 'bad'}">${fb.ok ? (fb.near ? esc(t(`거의 맞았어요 — 「${w.h}」`, `Almost — it’s 「${w.h}」`)) : esc(t('맞았어요!', 'Correct!'))) : esc(t(`정답: ${w.h}`, `Answer: ${w.h}`))}
          <button type="button" class="dict-say" data-say="${esc(w.h)}">${icon}</button></p>
        <button type="button" class="wd-btn" data-act="next">${esc(t('다음', 'Next'))} ↵</button>`
        : `<button type="button" class="wd-link" data-act="giveup">${esc(t('모르겠어요', 'I don’t know'))}</button>`}`;
  }

  function drawDone() {
    const r = run;
    const miss = r.words.filter((w) => r.res[idOf(w)] && r.res[idOf(w)] !== 'know');
    const next = r.from && r.from.topic != null ? nextSession(r.from.topic) : null;
    const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
    return `<div class="wd-done">
      <b class="wd-big">${r.mode === 'test' ? (pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : '💪') : '🎉'}</b>
      <h3>${esc(r.mode === 'test' ? t(`${r.score} / ${r.total} · ${pct}점`, `${r.score} / ${r.total} · ${pct}%`) : t('세션 끝!', 'Session done!'))}</h3>
      <p>${esc(r.mode === 'test' ? t(`시험 끝! 틀린 낱말 ${miss.length}개는 내일 다시 불러 드려요.`, `Test done! The ${miss.length} you missed come back tomorrow.`)
        : t(`${r.words.length}개 중 ${r.words.length - miss.length}개를 바로 알았어요. 헷갈린 낱말은 내일 다시 불러 드려요.`, `You knew ${r.words.length - miss.length} of ${r.words.length} right away. The tricky ones come back tomorrow.`))}</p>
      <div class="wd-word-act">
        ${miss.length ? `<button type="button" class="wd-btn ghost" data-act="again">${esc(t(`틀린 ${miss.length}개 다시`, `Redo ${miss.length} missed`))}</button>` : ''}
        ${next != null ? `<button type="button" class="wd-btn" data-act="session" data-topic="${esc(r.from.topic)}" data-n="${next}">${esc(t('다음 세션', 'Next session'))}</button>` : ''}
        <button type="button" class="wd-btn ghost" data-tab="home">${esc(t('오늘 화면으로', 'Back to Today'))}</button>
      </div>
      ${miss.length ? `<div class="wd-list">${miss.map((w) => wordRow(w)).join('')}</div>` : ''}
    </div>`;
  }

  function finishWord(c) {
    const how = c.miss === 0 ? 'know' : c.miss === 1 ? 'unsure' : 'no';
    run.res[idOf(c.w)] = how;
    grade(idOf(c.w), how);
  }
  function advance() {
    run.fb = null; run.flip = false;
    run.cur = run.q.shift() || null;
    if (run.cur && run.mode !== 'card') makeChoices();
    if (!run.cur) D.track('단어세션끝');
    draw();
  }
  function answerOpt(i) {
    const c = run.cur;
    if (!c || c.stage !== 0 || run.fb) return;
    const ok = c.opts[i] === c.w;
    run.fb = { ok, pick: i };
    if (c.test) {
      testMark(c, ok);
      draw();
      if (ok) setTimeout(() => { if (run && run.fb && run.cur === c) { run.cur = null; run.fb = null; advanceKeep(); } }, 700);
      return;
    }
    if (ok) { c.stage = 1; run.q.push(c); }
    else { c.miss++; run.q.splice(Math.min(3, run.q.length), 0, c); }
    if (ok) { sayIf(c.w); draw(); setTimeout(() => { if (run && run.fb && run.cur === c) { run.cur = null; run.fb = null; advanceKeep(); } }, 700); }
    else draw();
  }
  /* 맞힌 보기 문제는 같은 낱말을 쓰기로 다시 넣었으므로(위 push) 지금 자리를 비우고 넘어간다. */
  function advanceKeep() {
    run.flip = false; run.cur = run.q.shift() || null;
    if (run.cur) makeChoices();
    else { if (run.mode === 'test') testGrade(); D.track('단어세션끝'); }
    draw();
  }
  /* 시험: 문제마다 적고, 끝에 낱말마다 한 번 채점한다(한 낱말이 두 문제로 나와도 기록은 한 번). */
  function testMark(c, ok) {
    run.answered++; if (ok) run.score++;
    const id = idOf(c.w);
    run.res[id] = run.res[id] === 'no' || !ok ? 'no' : 'know';
  }
  function testGrade() { for (const [id, how] of Object.entries(run.res)) grade(id, how); }
  function sayIf(w) { if (run.dir === 'ko' || run.mode !== 'card') sayWord(w.h); }
  function answerType(said) {
    const c = run.cur;
    if (!c || run.fb) return;
    const a = norm(said), h = norm(c.w.h);
    const exact = a === h;
    const near = !exact && a.length > 1 && dist(jamo(a), jamo(h), 1) <= 1;
    const ok = exact || near;
    run.fb = { ok, near, said };
    if (c.test) testMark(c, ok);
    else if (!ok) { c.miss++; run.q.splice(Math.min(3, run.q.length), 0, c); }
    else finishWord(c);
    sayWord(c.w.h);
    draw();
  }
  function nextAfterFb() {
    if (!run?.fb) return;
    const c = run.cur;
    if (c && c.stage === 0 && run.fb.ok) return;   // 보기 맞힘은 저절로 넘어간다
    run.cur = null; run.fb = null; advanceKeep();
  }
  function rate(how) {
    const c = run.cur;
    if (!c) return;
    run.res[idOf(c.w)] = how;
    grade(idOf(c.w), how);
    if (how === 'no') run.q.push({ w: c.w, again: true });
    advance();
  }

  /* ── 한 화면 그리기 ─────────────────────────────────────── */
  function draw() {
    let body;
    if (query.trim() && view.tab !== 'study') body = drawSearch();
    else if (view.tab === 'home') body = drawHome();
    else if (view.tab === 'learn') body = drawLearn();
    else if (view.tab === 'topic') body = drawTopic(view.topic);
    else if (view.tab === 'pick') body = drawPick();
    else if (view.tab === 'study') body = drawStudy();
    else if (view.tab === 'review') body = drawReview();
    else if (view.tab === 'star') body = drawStar();
    else if (view.tab === 'stats') body = drawStats();
    else if (view.tab === 'mine') body = drawMine();
    else if (view.tab === 'word') body = drawWord(view.h);
    else body = drawHome();
    const hadFocus = document.activeElement?.id === 'wdQ';
    const pos = hadFocus ? document.activeElement.selectionStart : null;
    root.innerHTML = shell(body);
    root.classList.toggle('wd-studying', view.tab === 'study');
    if (hadFocus) { const q = root.querySelector('#wdQ'); q.focus(); try { q.setSelectionRange(pos, pos); } catch (e) {} }
    const ty = root.querySelector('#wdType');
    if (ty && !ty.disabled) ty.focus();
    /* 받아쓰기 문제는 나오자마자 한 번 들려준다. */
    if (run?.cur?.dict && !run.cur.played && !run.fb) { run.cur.played = true; sayWord(run.cur.w.h); }
    /* 짝 맞추기 시계 — 판 전체를 다시 그리지 않고 숫자만 바꾼다. */
    clearInterval(tick);
    if (run?.match && !run.match.end && view.tab === 'study') {
      tick = setInterval(() => {
        const el = root.querySelector('#wdTimer');
        if (!el || !run?.match || run.match.end) return clearInterval(tick);
        el.textContent = ((Date.now() - run.match.t0) / 1000).toFixed(1) + t('초', 's');
      }, 200);
    }
  }
  /* 검색 결과만 다시 그린다 — 글자를 칠 때마다 전체를 다시 그리면 IME 조합이 끊긴다. */
  function drawResults() {
    const body = root.querySelector('#wdBody');
    if (!body) return draw();
    body.innerHTML = query.trim() ? drawSearch() : (view.tab === 'study' ? drawStudy() : drawHome());
  }

  function openSession(topic, n) {
    const ss = chunk(listFor(topic));
    const words = ss[n];
    if (!words) return;
    view = { tab: 'pick', pick: { words, from: { topic, n },
      title: `${topicName(topic)} · ${t(`세션 ${n + 1}`, `Session ${n + 1}`)}`,
      back: `data-act="topic" data-topic="${esc(topic)}"` } };
    query = '';
    mark(`topic/${topic}/${n + 1}`);
    draw();
  }
  function openWord(h) {
    addRecent(h);
    query = ''; sel = -1;
    view = { tab: 'word', h };
    mark(`w/${encodeURIComponent(h)}`);
    draw();
    window.scrollTo({ top: 0 });
  }

  /* ── 손짓 ─────────────────────────────────────────────── */
  root.addEventListener('click', (ev) => {
    const say = ev.target.closest('[data-say]');
    if (say) { ev.stopPropagation(); const s = say.dataset.say; return D.say(s, byHead.has(s) || D.gloss()[s] ? D.audioFor(s) : undefined); }
    const tab = ev.target.closest('[data-tab]');
    if (tab) {
      if (view.tab === 'study' && run?.cur && !confirm(t('공부를 그만할까요? 푼 것은 기록돼요.', 'Stop now? What you answered is saved.'))) return;
      query = ''; run = null;
      view = { tab: tab.dataset.tab };
      mark(view.tab === 'home' ? '' : view.tab);
      return draw();
    }
    const wd = ev.target.closest('[data-word]');
    if (wd) return openWord(wd.dataset.word);
    const a = ev.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'wordbook') return D.openWordbook();
    if (act === 'game-quiz') return D.openQuiz();
    if (act === 'game-match') { const n = nextSession() ?? 0; return startRun(chunk(VOCAB)[n], 'match', { topic: 'all', n }); }
    if (act === 'topic') { query = ''; view = { tab: 'topic', topic: a.dataset.topic }; mark(`topic/${a.dataset.topic}`); return draw(); }
    if (act === 'session') { if (a.dataset.track) setTrack(a.dataset.track); return openSession(a.dataset.topic, +a.dataset.n); }
    if (act === 'track') { setTrack(a.dataset.track); return draw(); }
    if (act === 'dir') { S.dir = a.dataset.dir; save(); return draw(); }
    if (act === 'go') return startRun(view.pick.words, a.dataset.mode, view.pick.from);
    if (act === 'review') { const d = due().slice(0, 30); view = { tab: 'pick', pick: { words: d, from: null, title: t(`복습 ${d.length}개`, `Review ${d.length}`), back: 'data-tab="home"' } }; mark('review'); return draw(); }
    if (act === 'starstudy') { const d = starIds().map((id) => byId.get(id)).filter(Boolean); view = { tab: 'pick', pick: { words: d, from: null, title: t(`별표 ${d.length}개`, `Starred ${d.length}`), back: 'data-tab="star"' } }; return draw(); }
    if (act === 'star') {
      const id = a.dataset.id;
      toggleStar(id);
      if (isStar(id)) D.track('단어별표');
      a.classList.toggle('on', isStar(id)); a.textContent = isStar(id) ? '★' : '☆';
      return;
    }
    if (act === 'add') { const h = a.dataset.h; return D.saveWords([toSave(h)], a); }
    if (act === 'addall') return D.saveWords(view.pick.words.map((w) => toSave(w.h)), a);
    if (act === 'share') return shareSet(a);
    if (act === 'mystudy') { view = { tab: 'pick', pick: { words: mineWords, from: null, title: t(`내 단어장 ${mineWords.length}개`, `My wordbook — ${mineWords.length}`), back: 'data-tab="mine"' } }; return draw(); }
    if (act === 'login') return D.openAccount();
    if (act === 'quit') { if (!run?.cur || confirm(t('공부를 그만할까요? 푼 것은 기록돼요.', 'Stop now? What you answered is saved.'))) { run = null; view = { tab: 'home' }; mark(''); draw(); } return; }
    if (act === 'flip') { if (run) { run.flip = !run.flip; if (run.flip) sayIf(run.cur.w); draw(); } return; }
    if (act === 'rate') return rate(a.dataset.how);
    if (act === 'tile') return tapTile(+a.dataset.i);
    if (act === 'rematch') return startRun(run.words, 'match', run.from);
    if (act === 'opt') return answerOpt(+a.dataset.i);
    if (act === 'next') return nextAfterFb();
    if (act === 'giveup') return answerType('');
    if (act === 'again') { const miss = run.words.filter((w) => run.res[idOf(w)] !== 'know'); return startRun(miss, run.mode, run.from); }
  });
  root.addEventListener('submit', (ev) => {
    const f = ev.target.closest('[data-act="type"]');
    if (!f) return;
    ev.preventDefault();
    answerType(root.querySelector('#wdType')?.value || '');
  });
  root.addEventListener('input', (ev) => {
    if (ev.target.id !== 'wdQ') return;
    query = ev.target.value; sel = -1;
    if (view.tab === 'study') { view = { tab: 'home' }; run = null; draw(); return; }
    drawResults();
  });
  root.addEventListener('keydown', (ev) => {
    if (ev.target.id !== 'wdQ') return;
    if (ev.isComposing) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      if (!lastHits.length) return;
      ev.preventDefault();
      sel = ev.key === 'ArrowDown' ? Math.min(lastHits.length - 1, sel + 1) : Math.max(-1, sel - 1);
      root.querySelectorAll('#wdHits .wd-row').forEach((b, i) => b.classList.toggle('sel', i === sel));
      root.querySelector('#wdHits .wd-row.sel')?.scrollIntoView({ block: 'nearest' });
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      const q = query.trim();
      if (!q) return;
      D.track('단어검색');
      const hit = lastHits[sel >= 0 ? sel : 0];
      if (hit && (sel >= 0 || norm(hit.h) === norm(q) || lastHits.length === 1)) openWord(hit.h);
      else mark(`search/${encodeURIComponent(q)}`);
    } else if (ev.key === 'Escape') { query = ''; ev.target.value = ''; drawResults(); }
  });
  /* 공부 판의 손가락 · 글쇠. 글을 치는 칸 안에서는 가로채지 않는다(Enter 제외 — 그건 form 이 받는다). */
  document.addEventListener('keydown', (ev) => {
    if (!run || view.tab !== 'study' || root.closest('.hidden') || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const typing = ev.target.matches?.('input, textarea');
    if (typing && ev.key !== 'Enter') return;
    if (!run.cur) return;
    if (run.mode === 'card') {
      if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); run.flip = !run.flip; if (run.flip) sayIf(run.cur.w); draw(); }
      else if (ev.key === '1' || ev.key === 'ArrowLeft') rate('no');
      else if (ev.key === '2' || ev.key === 'ArrowDown') rate('unsure');
      else if (ev.key === '3' || ev.key === 'ArrowRight') rate('know');
      return;
    }
    if (run.fb && ev.key === 'Enter') { ev.preventDefault(); return nextAfterFb(); }
    if (run.cur.stage === 0 && /^[1-4]$/.test(ev.key)) answerOpt(+ev.key - 1);
  });
  /* 카드 밀기 — 오른쪽 알아요, 왼쪽 몰라요. */
  let sx = null;
  root.addEventListener('pointerdown', (ev) => { if (ev.target.closest('.wd-flash')) sx = ev.clientX; });
  root.addEventListener('pointerup', (ev) => {
    if (sx == null || !run || run.mode !== 'card') { sx = null; return; }
    const dx = ev.clientX - sx; sx = null;
    if (Math.abs(dx) > 70) { ev.preventDefault(); rate(dx > 0 ? 'know' : 'no'); }
  });

  /* 주소 → 화면. sub: '' | learn | review | star | stats | topic/<id>[/<n> | /topik1 | /topik2] | w/<낱말> | search/<검색어> | set/<낱말>.<낱말>… */
  function show(sub) {
    const [a, b, c] = String(sub || '').split('/');
    run = null; query = ''; sel = -1;
    D.track('단어열기');
    const go = () => {
      if (a === 'w' && b) { view = { tab: 'word', h: decodeURIComponent(b) }; addRecent(view.h); }
      else if (a === 'play' && ['match', 'test', 'dict'].includes(b)) {
        /* 게임 화면에서 곧장 — 오늘의 새 낱말(다음 세션)로 바로 판을 연다. */
        const n = nextSession() ?? 0;
        startRun(chunk(VOCAB)[n], b, { topic: 'all', n });
        return;
      }
      else if (a === 'search' && b) { query = decodeURIComponent(b); view = { tab: 'home' }; }
      else if (a === 'set' && b) openSet(b);
      else if (a === 'topic' && b) {
        /* 정적 목록 쪽(/topik1-words/ · /topik2-words/)은 과정을 붙여 보낸다 — 지금 고른 과정과 달라도 그 목록이 열리게. */
        if (c === 'topik1' || c === 'topik2') setTrack(c);
        else if (c) { openSession(b, Math.max(0, +c - 1)); return; }
        view = { tab: 'topic', topic: b };
      } else if (['learn', 'review', 'star', 'stats', 'mine'].includes(a)) view = { tab: a };
      else view = { tab: 'home' };
      draw();
    };
    /* 사전은 검색 · 사전 낱말 화면에만 필요하다. 먼저 그리고, 오면 다시 그린다. */
    go();
    D.glossNeed().then(() => { IDX = null; if (query || view.tab === 'word') draw(); }).catch(() => {});
  }
  /* 기록을 서버와 맞춘 뒤(syncVocab) 새 기록으로 다시 그린다. 공부 판 도중이면 건드리지 않는다. */
  return { show, redraw: () => { if (!root.closest('.hidden') && view.tab !== 'study') draw(); } };
}
