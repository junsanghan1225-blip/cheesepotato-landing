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
   별표를 빼도 지우지 않고 음수로 남긴다 — 그냥 지우면 다른 기기가 가진 별표가 되살아난다.
   fd[폴더 id] = { n 이름, c 색 번호, at 만든 시각, t 이름 · 색 · 지움을 고친 시각, del 지웠나, w{낱말: 넣은 시각(뺀 것은 음수)} } —
   단어장 폴더(운영자 요청, 웹에서만 — 앱과 같은 words 표에는 폴더 칸이 없다). 별표처럼 지워도 흔적을 남긴다. */
function shape(s) {
  s = s && typeof s === 'object' ? s : {};
  let star = s.star || {};
  if (Array.isArray(star)) star = Object.fromEntries(star.map((id) => [id, 1]));   // 2-1 때의 배열 모양
  return { w: s.w && typeof s.w === 'object' ? s.w : {}, star, days: s.days && typeof s.days === 'object' ? s.days : {},
    dir: s.dir === 'en' ? 'en' : 'ko', track: s.track === 'topik2' ? 'topik2' : 'topik1',
    fd: s.fd && typeof s.fd === 'object' ? s.fd : {} };
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
  /* 폴더 — 이름 · 색 · 지움은 늦게 고친 쪽, 안의 낱말은 낱말마다 늦게 고친 쪽(별표와 같은 방식). */
  const fd = { ...a.fd };
  for (const [id, f] of Object.entries(b.fd)) {
    const m = fd[id];
    if (!m) { fd[id] = f; continue; }
    const fw = { ...(m.w || {}) };
    for (const [h, v] of Object.entries(f.w || {})) if (!(h in fw) || Math.abs(v) > Math.abs(fw[h])) fw[h] = v;
    fd[id] = { ...((f.t || 0) > (m.t || 0) ? f : m), w: fw };
  }
  return { w, star, days, dir: a.dir, track: a.track, fd };
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
/* 단어장 폴더 */
const folders = () => Object.entries(S.fd).filter(([, f]) => !f.del).map(([id, f]) => ({ id, ...f })).sort((a, b) => (a.at || 0) - (b.at || 0));
const folderHeads = (f) => Object.entries(f.w || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([h]) => h);
function newFolder(name) {
  const id = 'f' + Date.now().toString(36), now = Date.now();
  S.fd[id] = { n: name, c: folders().length % 6, at: now, t: now, w: {} };
  save(); return id;
}
function putInFolder(id, heads, on) {
  const f = S.fd[id]; if (!f) return;
  f.w = f.w || {}; const now = Date.now();
  heads.forEach((h) => { const cur = f.w[h] || 0; if (on && cur <= 0) f.w[h] = now; if (!on && cur > 0) f.w[h] = -now; });
  save();
}
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
  /* ── 내 길(운영자 결정 2026-09-29: TOPIK 공부하는 학생인지 아닌지로 확실히 나눈다) ────────────
     TOPIK 길 — 내 코스 레벨이 과정을 정한다(L0~L5 TOPIK I 필수 · L6~L7 TOPIK II 필수, 레벨이 없으면 TOPIK I).
     일반 길 — 생활에서 자주 쓰는 낱말(목적 표시 life)을 급수 섞어 자주 나오는 차례로(운영자: 딱 두 길만 — 일반 · TOPIK).
     길은 레벨테스트 목표(cp_level.goal)로만 정한다 — 「TOPIK 준비」면 TOPIK 길, 그 밖 · 테스트 전은 일반 길.
     「오늘」 · 외우기 탭 맨 위 · 내 코스 단어 칸이 모두 이 길 하나를 따른다(입구 하나 → 한 줄 길). */
  const readJSON = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  /* 운영자 결정(2026-09-29): 길은 레벨테스트 목표로만 — TOPIK 준비면 TOPIK 길, 그 밖 · 테스트 전은 일반 길. */
  function myPath() {
    const lv = readJSON('cp_level');
    const p = lv?.goal === 'topik' ? 'topik' : 'gen';
    if (p === 'topik') return { kind: 'topik', topic: `all:${(lv?.lv ?? 0) >= 6 && TRACKS.topik2.length ? 'topik2' : 'topik1'}` };
    return { kind: 'life', topic: 'gen' };   // 예전에 고른 여행 · EPS · 드라마(p:…)도 일반으로
  }
  { const p0 = myPath(); if (p0?.kind === 'topik') setTrack(p0.topic.slice(4)); }   // 둘러보기(외우기 탭)도 처음엔 내 과정으로
  /* TOPIK II 예문은 처음엔 비어 있다 — 낱말 화면 · 카드가 그 낱말을 그릴 때 그 낱말이 든 조각(500개)만 받아 채우고
     다시 그린다. 받는 동안에도 예문 칸만 비고 나머지는 그대로 보인다. 예문으로 찾기(검색 7순위)는 받은 조각만 본다. */
  const EX_N = 500, exGot = new Set(), exWait = new Map();
  TRACKS.topik2.forEach((w) => { if (!w.x) w.x = []; });
  const exOf = (w) => (D.loadEx2 && w.l >= 3 ? Math.floor(TRACKS.topik2.indexOf(w) / EX_N) : -1);
  function exLoad(k) {
    if (k < 0 || exGot.has(k)) return Promise.resolve(false);
    if (!exWait.has(k)) exWait.set(k, D.loadEx2(k).then((EX) => {
      TRACKS.topik2.slice(k * EX_N, (k + 1) * EX_N).forEach((v, j) => { v.x = EX[j] || []; });
      exGot.add(k); return true;
    }).finally(() => exWait.delete(k)));   // 못 받으면 다음에 다시 시도한다
    return exWait.get(k);
  }
  function needEx(w) { exLoad(exOf(w)).then((got) => { if (got) draw(); }).catch(() => {}); }
  /* 여러 낱말의 예문을 한꺼번에 — PDF 로 찍기 전에. 못 받은 조각은 예문 없이 찍는다. */
  const ensureEx = (ws) => Promise.all([...new Set(ws.map(exOf))].map((k) => exLoad(k).catch(() => false)));
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
  const PURP_LOOK = { life: 150, work: 215, medical: 0, campus: 225, travel: 195, kculture: 320 };   // EPS 는 따로 선 갈래라 뺀다(운영자 결정)   // 목적마다 색(hue) — 그림은 IC
  const isPurp = (id) => String(id).startsWith('p:');
  const purpOf = (id) => (D.PURPOSES || []).find((x) => `p:${x.id}` === id);
  const listFor = (topic) => (topic === 'all' ? VOCAB : String(topic).startsWith('all:') ? TRACKS[topic.slice(4)] || []
    : topic === 'gen' ? ALL.filter((w) => w.u.includes('life'))
    : isPurp(topic) ? ALL.filter((w) => w.u.includes(topic.slice(2))) : VOCAB.filter((w) => inTopic(w, topic)));
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

  /* 「내 코스」가 읽는 짧은 요약(cp-words-sum) — 급수별 외운 수 · 전체 수 · 복습 · 연속 일수. 내 코스는 무거운 단어 자료를
     받지 않고 이것만 읽는다(운영자 요청: 내 코스에 단어 진도). 그릴 때마다 새로 쓴다. */
  function writeSum() {
    try {
      const lv = {}, tot = {};
      ALL.forEach((w) => { tot[w.l] = (tot[w.l] || 0) + 1; if (learned(idOf(w))) lv[w.l] = (lv[w.l] || 0) + 1; });
      const p = myPath(), pl = p ? listFor(p.topic) : [];
      const path = p ? { kind: p.kind, name: topicName(p.topic), got: pl.filter((w) => learned(idOf(w))).length, tot: pl.length } : null;
      localStorage.setItem('cp-words-sum', JSON.stringify({ at: Date.now(), lv, tot, due: due().length, streak: streak(), today: S.days[today()] || 0, folders: folders().length, path }));
    } catch (e) { /* 막힌 브라우저 — 내 코스는 요약 없이 그린다 */ }
  }
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
  /* 선 아이콘(SVG) — 이모지는 기기마다 모양 · 색이 달라 화면이 어수선해진다(운영자 요청: 이모지 → SVG). 24칸 · 글자 색을 따른다. */
  const IC = {
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.4 5 2.8 5 5.8"/>',
    daily: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    transport: '<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16M8 21v-4M16 21v-4"/><circle cx="8" cy="14" r=".6"/><circle cx="16" cy="14" r=".6"/>',
    concepts: '<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>',
    food: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M9 7c0-1.5 1-1.5 1-3M14 7c0-1.5 1-1.5 1-3"/>',
    leisure: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.9 1.5-1.6 0-1-.8-1.4-.8-2.4s.8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    feelings: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    talk: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10M10 20v-6h4v6"/>',
    school: '<path d="M4 19V6a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2z"/><path d="M8 8h8"/>',
    society: '<path d="M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"/>',
    body: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
    nature: '<path d="M5 19C5 11 11 5 20 5c0 9-6 15-14 15z"/><path d="M5 19l8-8"/>',
    tech: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17h2"/>',
    culture: '<path d="M12 20L4 9a11 11 0 0 1 16 0z"/><path d="M12 20V8M8.5 15.2L7 8.6M15.5 15.2L17 8.6"/>',
    function: '<path d="M9 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h2M15 4h2a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-2"/>',
    eps: '<path d="M3 20V11l6 4v-4l6 4V4h4v16z"/>',
    life: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    medical: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',
    campus: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
    travel: '<path d="M21 3L3 11l7 3 3 7z"/><path d="M10 14L21 3"/>',
    kculture: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 8l3-4h3L6 8M10 8l3-4h3l-3 4"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M10 17h4v4"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.3L12 17.5l-5.5 2.9 1-6.3L3 9.7l6.2-.9z"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    up: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    book: '<path d="M4 19V6a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2z"/>',
    card: '<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
    learn: '<path d="M4 6h16M4 12h10M4 18h7"/><path d="M15 17l2 2 4-4"/>',
    write: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    dict: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    match: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    test: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4L12 18.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pdf: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    play: '<path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z" fill="currentColor"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    flip: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
    q: '<path d="M9.2 9a3 3 0 1 1 4.3 2.7c-.9.5-1.5 1.2-1.5 2.3"/><path d="M12 18h.01"/>',
    sound: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',
  };
  const ico = (k) => `<svg class="wd-i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[k] || IC.book}</svg>`;
  /* 주제마다 그림 하나와 색 하나(hue) — 카드 목록이 한눈에 갈리게. 색은 --h 로 넘기고 CSS 가 섞는다. */
  const TOPIC_LOOK = {
    people: 20, daily: 40, transport: 205, concepts: 260, food: 15, leisure: 300, feelings: 350, talk: 190, home: 30,
    school: 225, society: 170, body: 0, work: 215, nature: 130, tech: 240, culture: 330, function: 280,
  };
  const look = (id) => {
    if (String(id).startsWith('all')) return [ico('trophy'), 25];
    if (id === 'gen') return [ico('life'), 150];
    const k = isPurp(id) ? id.slice(2) : id, h = isPurp(id) ? PURP_LOOK[k] : TOPIC_LOOK[k];
    return [ico(k), h ?? 25];
  };
  /* 주제 · 목적 · 과정 전체의 이름 하나로 — 세션 제목과 주제 화면이 같이 쓴다. */
  const topicName = (topic) => {
    if (String(topic).startsWith('all:')) { const k = topic.slice(4); return t(`${trackName(k)} 필수`, `${trackName(k)} essentials`); }
    if (topic === 'gen') return t('일반 한국어', 'Everyday Korean');
    const tp = topic === 'all' ? null : isPurp(topic) ? purpOf(topic) : topicOf(topic);
    return tp ? t(tp.ko, tp.en) : t(`${trackName(S.track)} 필수`, `${trackName(S.track)} essentials`);
  };
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
            placeholder="${esc(t('낱말 찾기 — 먹었어요 · eat · meokda · ㅅㄹ', 'Search — 먹었어요, eat, meokda, ㅅㄹ'))}" value="${esc(query)}">
          <button type="button" class="wd-clear" data-act="qclear" aria-label="${esc(t('지우기', 'Clear'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
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
  /* 「오늘」 — ① 복습 → ② 내 길의 다음 역 10개(운영자 결정 A: 섞은 10개 대신). 길이 없으면 먼저 하나만 묻는다.
     레퍼런스(여백 · 큰 글씨 · 카드 하나)를 치즈감자 색(베이지 · 짙은 갈색 띠 · 치즈 주황)으로. */
  function drawHome() {
    const d = due();
    const path = myPath();
    const hr = new Date().getHours();
    const hello = hr < 5 || hr >= 18 ? t('좋은 저녁이에요!', 'Good evening!') : hr < 12 ? t('좋은 아침이에요!', 'Good morning!') : t('좋은 오후예요!', 'Good afternoon!');
    const dueLine = d.length ? `<button type="button" class="wd-due" data-act="review"><span>${esc(t('① 오늘 복습', '① Review today'))}</span><b>${d.length}</b><em>${esc(t('먼저 하기 →', 'Do first →'))}</em></button>` : '';
    if (!path) return `<div class="wd-today"><div class="wd-hello"><p class="wd-hello-k">${esc(hello)}</p></div>${dueLine}</div>`;
    const list = listFor(path.topic), ss = chunk(list), n = nextSession(path.topic);
    const ws = n == null ? [] : ss[n];
    const got = ws.filter((w) => learned(idOf(w))).length;
    const w = ws.find((x) => !learned(idOf(x))) || ws[0];
    const pathName = topicName(path.topic), doneAll = list.filter((x) => learned(idOf(x))).length;
    const tops = TOPICS.map((tp) => [tp, listFor(tp.id)]).filter(([, l]) => l.length).sort((a, b) => b[1].length - a[1].length).slice(0, 4);
    return `<div class="wd-today">
      <div class="wd-hello">
        <p class="wd-hello-k">${esc(hello)}</p>
        <p class="wd-hello-p">${esc(t('내 길', 'My path'))} <b>${esc(pathName)}</b><small> · ${doneAll.toLocaleString()} / ${list.length.toLocaleString()} ${esc(t('낱말', 'words'))}</small>
          <button type="button" class="wd-more wd-path-x" data-act="pathchange">${esc(t('레벨테스트로 바꾸기', 'Change via level test'))}</button></p>
        ${bar(doneAll, list.length)}
      </div>
      ${dueLine}
      ${w ? `<div class="wd-day">
        <span class="wd-day-k">${esc(d.length ? t('② ', '② ') : '')}${esc(t(`오늘의 낱말 · 세션 ${n + 1}`, `Today’s words · session ${n + 1}`))} · ${esc(t(`${w.l}급`, `Lv ${w.l}`))}</span>
        <button type="button" class="wd-day-w" data-word="${esc(w.h)}"><b>${esc(w.h)}</b><span>${esc(roman(w.h))}</span></button>
        <p class="wd-day-m">${esc(mean(w))}</p>
        <div class="wd-day-btns">
          <button type="button" class="dict-say wd-day-say" data-say="${esc(w.h)}" aria-label="${esc(t('발음 듣기', 'Play'))}">${icon}<span>${esc(t('듣기', 'Listen'))}</span></button>
          <button type="button" class="wd-day-go" data-act="session" data-topic="${esc(path.topic)}" data-n="${n}">${esc(got ? t(`이어서 · ${ws.length - got}개 남음`, `Continue · ${ws.length - got} left`) : t(`오늘 ${ws.length}개 시작`, `Start today’s ${ws.length}`))}${ico('arrow')}</button>
        </div>
        <div class="wd-day-rest">${ws.map((x) => `<button type="button" class="${learned(idOf(x)) ? 'ok' : x === w ? 'on' : ''}" data-word="${esc(x.h)}">${esc(x.h)}</button>`).join('')}</div>
      </div>` : `<div class="wd-day"><span class="wd-day-k">${esc(pathName)}</span><b class="wd-choose-t">${esc(t('이 길의 낱말을 다 봤어요!', 'You have seen every word on this path!'))}</b></div>`}
      <div class="wd-sec-hd"><h3 class="wd-h3">${esc(t('둘러보기 — 주제', 'Explore — topics'))}</h3><button type="button" class="wd-more" data-tab="learn">${esc(t('모두 보기', 'See all'))}${ico('chev')}</button></div>
      <div class="wd-themes">${tops.map(([tp, l]) => {
        const g = l.filter((x) => learned(idOf(x))).length, [ic, h] = look(tp.id);
        return `<button type="button" class="wd-theme" style="--h:${h}" data-act="topic" data-topic="${esc(tp.id)}">
          <span class="wd-topic-ico" aria-hidden="true">${ic}</span><b>${esc(t(tp.ko, tp.en))}</b>
          <span class="wd-meta">${esc(t(`${l.length}개 · ${Math.round((g / l.length) * 100)}%`, `${l.length} words · ${Math.round((g / l.length) * 100)}%`))}</span></button>`;
      }).join('')}</div>
    </div>`;
  }

  /* 외우기 탭의 보기 — 주제별(기본) · 목적별. 이 브라우저에만 기억한다. */
  let group = 'topic';
  try { group = localStorage.getItem('cp-words-group') === 'goal' ? 'goal' : 'topic'; } catch (e) {}
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
    /* 목적별 — 10개(한 세션)가 안 되는 목적은 아직 싣지 않는다. 주제 카드와 같은 모양, 토글로 둘 중 하나만 보인다. */
    const purps = Object.keys(PURP_LOOK).map((k) => {
      const id = `p:${k}`, pp = purpOf(id), list = listFor(id);
      if (!pp || list.length < SESSION) return '';
      const g = list.filter((w) => learned(idOf(w))).length;
      const [ico, h] = look(id);
      return `<button type="button" class="wd-topic" style="--h:${h}" data-act="topic" data-topic="${esc(id)}">
        <span class="wd-topic-ico" aria-hidden="true">${ico}</span>
        <b>${esc(t(pp.ko, pp.en))}</b>
        <span class="wd-meta">${esc(t(`${list.length}개 · TOPIK I · II`, `${list.length} words · TOPIK I & II`))}</span>${bar(g, list.length)}</button>`;
    }).join('');
    const byGoal = purps && group === 'goal';
    /* 맨 위는 내 길 로드맵 한 장(운영자 결정 F). 과정 칩은 아래 「둘러보기」에서 주제를 볼 때만(B). */
    const path = myPath();
    const pl = path ? listFor(path.topic) : VOCAB, pg = pl.filter((w) => learned(idOf(w))).length;
    return `<button type="button" class="wd-topic wd-topic-main" style="--h:${path ? look(path.topic)[1] : 25}" data-act="topic" data-topic="${esc(path ? path.topic : 'all')}">
        <span class="wd-topic-ico" aria-hidden="true">${path ? look(path.topic)[0] : ico('trophy')}</span>
        <b>${esc(t('내 길 · ', 'My path · '))}${esc(path ? topicName(path.topic) : t(`${trackName(S.track)} 필수`, `${trackName(S.track)} essentials`))}</b>
        <span class="wd-meta">${esc(t(`${pl.length.toLocaleString()}개 · 세션 ${Math.ceil(pl.length / SESSION)} · 로드맵 보기`, `${pl.length.toLocaleString()} words · ${Math.ceil(pl.length / SESSION)} sessions · open the map`))}</span>${bar(pg, pl.length)}</button>
      <h3 class="wd-h3">${esc(t('둘러보기', 'Explore'))}</h3>
      ${purps ? `<div class="wd-group" role="group" aria-label="${esc(t('보기', 'View'))}">
        <button type="button" class="wd-chip${byGoal ? '' : ' on'}" data-act="group" data-group="topic">${esc(t('주제별', 'By topic'))}</button>
        <button type="button" class="wd-chip${byGoal ? ' on' : ''}" data-act="group" data-group="goal">${esc(t('목적별', 'By goal'))}</button>
      </div>` : ''}
      ${byGoal ? '' : trackBar()}
      <div class="wd-topics">${byGoal ? purps : cards}</div>
      <h3 class="wd-h3">${esc(t('게임으로 연습', 'Practice with games'))}</h3>
      <div class="wd-games">
        <button type="button" class="wd-game" data-act="game-quiz"><b>${ico('timer')}${esc(t('스피드 퀴즈', 'Speed quiz'))}</b><span>${esc(t('60초 동안 뜻 보고 고르기', '60 seconds, pick the word'))}</span></button>
        <button type="button" class="wd-game" data-act="game-match"><b>${ico('grid')}${esc(t('짝 맞추기', 'Match'))}</b><span>${esc(t('오늘의 낱말로 시간 재기', 'Today’s words, against the clock'))}</span></button>
      </div>`;
  }

  /* 주제 · 목적 · 과정 전체 화면 — 위는 표지(큰 제목 · 숫자 둘 · 단추 둘), 아래는 로드맵: 세션을 역처럼 한 줄로 잇고
     10역마다 구간(깃발)으로 끊는다. 지나온 역은 초록, 지금 역은 주황으로 크게, 앞으로 갈 역은 회색. 지금 구간만 펴 둔다 —
     193역을 다 펴면 끝이 안 보인다(운영자 요청: 지하철 · 게임 맵처럼 하나씩 클리어). */
  const STAGE = 10;
  const openStages = new Map();   // 주제 → 사람이 펴거나 접은 구간 번호들
  function drawTopic(topic) {
    const list = listFor(topic), ss = chunk(list);
    const name = topicName(topic);
    const gotW = list.filter((w) => learned(idOf(w))).length;
    const done = ss.map((s) => s.every((w) => learned(idOf(w))));
    const cur = done.indexOf(false);   // -1 이면 다 끝남
    const nStage = Math.ceil(ss.length / STAGE);
    const opened = openStages.get(topic) || new Set([Math.max(0, cur < 0 ? nStage - 1 : Math.floor(cur / STAGE))]);
    openStages.set(topic, opened);
    const [ic, h] = look(topic);
    const pct = list.length ? Math.round((gotW / list.length) * 100) : 0;
    const stop = (s, i) => {
      const g = s.filter((w) => learned(idOf(w))).length, st = done[i] ? 'done' : i === cur ? 'cur' : g ? 'part' : 'todo';
      return `<li class="wd-stop ${st}"><button type="button" data-act="session" data-topic="${esc(topic)}" data-n="${i}">
        <span class="wd-dot">${done[i] ? ico('check') : i + 1}</span>
        <span class="wd-stop-t"><b>${esc(t(`세션 ${i + 1}`, `Session ${i + 1}`))}${i === cur ? `<em>${esc(t('지금 여기', 'You are here'))}</em>` : ''}</b>
          <small>${esc(s.slice(0, 5).map((w) => w.h).join(' · '))}${s.length > 5 ? ' …' : ''}</small></span>
        ${g && !done[i] ? `<span class="wd-stop-c">${g}/${s.length}</span>` : ''}</button></li>`;
    };
    const stages = Array.from({ length: nStage }, (_, k) => {
      const a = k * STAGE, b = Math.min(ss.length, a + STAGE), n = done.slice(a, b).filter(Boolean).length;
      const open = opened.has(k), clear = n === b - a;
      return `<section class="wd-stage${open ? ' open' : ''}${clear ? ' clear' : ''}">
        <button type="button" class="wd-stage-hd" data-act="stage" data-topic="${esc(topic)}" data-k="${k}" aria-expanded="${open}">
          <span class="wd-flag">${clear ? ico('check') : ico('flag')}</span>
          <b>${esc(t(`구간 ${k + 1}`, `Stage ${k + 1}`))}</b><small>${esc(t(`세션 ${a + 1}–${b}`, `Sessions ${a + 1}–${b}`))}</small>
          <span class="wd-stage-dots">${done.slice(a, b).map((x, j) => `<i class="${x ? 'on' : a + j === cur ? 'cur' : ''}"></i>`).join('')}</span>
          <span class="wd-stage-n">${n}/${b - a}</span></button>
        ${open ? `<ol class="wd-line">${ss.slice(a, b).map((s, j) => stop(s, a + j)).join('')}</ol>` : ''}
      </section>`;
    }).join('');
    return `<button type="button" class="wd-back" data-tab="learn">← ${esc(t('주제', 'Topics'))}</button>
      <div class="wd-cover" style="--h:${h}">
        <span class="wd-cover-ico" aria-hidden="true">${ic}</span>
        <h2 class="wd-cover-t">${esc(name)}</h2>
        <div class="wd-cover-nums">
          <div><b>${pct}%</b><span>${esc(t('외운 낱말', 'Words learnt'))}</span></div>
          <div><b>${list.length.toLocaleString()}</b><span>${esc(t('낱말', 'Words'))}</span></div>
          <div><b>${done.filter(Boolean).length}<small>/${ss.length}</small></b><span>${esc(t('클리어한 세션', 'Sessions cleared'))}</span></div>
        </div>
        <div class="wd-cover-btns">
          ${cur >= 0 ? `<button type="button" class="wd-btn wd-btn-big" data-act="session" data-topic="${esc(topic)}" data-n="${cur}">${esc(t(`세션 ${cur + 1} 시작`, `Start session ${cur + 1}`))}${ico('arrow')}</button>` : `<p class="wd-cover-done">${esc(t('모든 세션을 클리어했어요!', 'Every session cleared!'))}</p>`}
        </div>
        <p class="wd-cover-d">${esc(t('자주 나오는 낱말부터 10개씩 한 역이에요. 한 역씩 클리어해 나가요.', 'Ten words per stop, most frequent first. Clear them one stop at a time.'))}</p>
      </div>
      <div class="wd-map">${stages}</div>`;
  }


  /* 세션을 고른 뒤: 낱말 미리 보기 + 공부 방식 셋 + 방향. */
  /* 낱말 묶음 화면 — 위에서부터 「무엇을 · 어떻게 · 무슨 낱말」. 방향(한국어 → 뜻)은 공부 방식의 설정이라 방식 바로 위에
     이름을 붙여 둔다 — 낱말 목록 위에 두었더니 눌러도 목록이 안 바뀌어 고장 난 것처럼 보였다(운영자 지적). */
  function drawPick() {
    const { words, title, back } = view.pick;
    /* 공부 방식은 셋만 크게 — 배우는 차례(보기 → 외우기 → 확인)로 번호를 붙인다(운영자 요청: 여섯은 많다).
       쓰기 · 받아쓰기 · 짝 맞추기는 지우지 않고 아래 「다른 방법」 한 줄로. */
    const MODES = [
      ['card', t('카드로 보기', 'Cards'), t('뒤집어 보며 처음 익히기', 'Flip through to meet the words')],
      ['learn', t('외우기', 'Learn'), t('고르기 → 직접 쓰기로 굳히기', 'Choose, then type to lock them in')],
      words.length >= 2 ? ['test', t('시험 보기', 'Test'), t('섞어서 풀고 점수 확인', 'Mixed questions, scored')] : ['write', t('쓰기', 'Write'), t('뜻 보고 한국어로', 'Type the Korean')],
    ];
    const MORE = [['write', t('쓰기', 'Write')], ['dict', t('받아쓰기', 'Dictation')], ['match', t('짝 맞추기', 'Match')]].filter(([k]) => !MODES.some((m) => m[0] === k));
    const shareable = words.some((w) => byHead.get(w.h) === w);
    return `<button type="button" class="wd-back" ${back}>← ${esc(t('뒤로', 'Back'))}</button>
      <div class="wd-pick-hd">${view.pick.folder ? `<span class="wd-folder-ico c${S.fd[view.pick.folder]?.c || 0}">${FOLDER_SVG}</span>` : ''}<h3 class="wd-h3 wd-h3-big">${esc(title)}</h3>
        ${view.pick.folder ? `<span class="wd-pick-tools"><button type="button" class="wd-link" data-act="frename">${ico('edit')}${esc(t('이름', 'Rename'))}</button><button type="button" class="wd-link" data-act="fdel">${ico('trash')}${esc(t('지우기', 'Delete'))}</button></span>` : ''}</div>
      ${view.pick.folder && !words.length ? `<p class="wd-none">${esc(t('아직 비어 있어요. 낱말 화면이나 세션에서 「+ 내 단어장」을 눌러 이 폴더를 고르세요.', 'Empty for now. Tap “+ My wordbook” on a word or session and pick this folder.'))}</p>` : ''}
      ${view.pick.intro ? `<p class="wd-pick-ask">${esc(t('미리보기 끝! 이제 어떻게 공부할까요?', 'Preview done — how do you want to study?'))}</p>` : ''}
      <div class="wd-pick-set">
        <span>${esc(t('문제 방향', 'Question side'))}</span>
        <div class="wd-seg" role="group" aria-label="${esc(t('문제 방향', 'Question side'))}">
          <button type="button" class="${S.dir === 'ko' ? 'on' : ''}" data-act="dir" data-dir="ko">${esc(t('한국어 → 뜻', 'Korean → meaning'))}</button>
          <button type="button" class="${S.dir === 'en' ? 'on' : ''}" data-act="dir" data-dir="en">${esc(t('뜻 → 한국어', 'Meaning → Korean'))}</button>
        </div>
      </div>
      <div class="wd-modes wd-modes3">${MODES.map(([k, name, sub], i) =>
        `<button type="button" class="wd-mode" data-act="go" data-mode="${k}"><span class="wd-mode-top">${ico(k)}<em>${i + 1}</em></span><b>${esc(name)}</b><span>${esc(sub)}</span></button>`).join('')}</div>
      <p class="wd-more-modes">${esc(t('다른 방법', 'Other ways'))}: ${MORE.map(([k, name]) => `<button type="button" class="wd-link" data-act="go" data-mode="${k}">${esc(name)}</button>`).join('<span aria-hidden="true">·</span>')}</p>
      <p class="wd-pick-n">${esc(t(`낱말 ${words.length}개`, `${words.length} words`))}</p>
      <div class="wd-list">${words.map((w) => wordRow(w, learned(idOf(w)) ? `<span class="wd-ok">${ico('check')}</span>` : '')).join('')}</div>
      <div class="wd-pick-foot">
        ${view.pick.folder ? '' : `<button type="button" class="wd-link" data-act="addall">${ico('plus')}${esc(t('모두 단어장에 담기', 'Save all to a wordbook'))}</button>`}
        <button type="button" class="wd-link" data-act="pdf">${ico('pdf')}${esc(t('PDF로 저장 · 인쇄', 'Save as PDF / print'))}</button>
        ${shareable ? `<button type="button" class="wd-link" data-act="share">${ico('link')}${esc(t('링크로 보내기', 'Share as a link'))}</button>` : ''}
      </div>`;
  }

  /* ── 단어장 폴더(운영자 레퍼런스: 폴더 고르기 창) ─────────────────────
     담기(+ 내 단어장)를 누르면 아래에서 「단어장 선택」 창이 올라와 여러 폴더에 한꺼번에 담는다. 낱말은 예전처럼 계정의
     단어장(words 표)에도 들어가고, 폴더는 외우기 기록(settings.vocab)에 붙어 기기 사이에 맞춰진다. */
  const FOLDER_SVG = '<svg class="wd-fsvg" viewBox="0 0 48 40" aria-hidden="true"><path d="M3 9a4 4 0 0 1 4-4h11.5l4 4.5H41a4 4 0 0 1 4 4V33a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path class="wd-fsvg-front" d="M3 15.5h42V33a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/></svg>';
  let sheet = null;   // { heads, sel:Set(폴더 id), had:Set(처음부터 다 들어 있던 폴더) }
  /* 사이트 안에서 뜨는 작은 창 — 브라우저 prompt · confirm 대신(운영자 요청: 따로 팝업 띄우지 말고 홈페이지 안에서).
     { title, msg?, input?: 처음 값, ro?: 읽기만, ok: 단추 글, danger?: 빨간 단추, done(값) } */
  let dlg = null;
  function ask(o) { dlg = o; draw(); }
  function drawDlg() {
    return `<div class="wd-dlg-bg" data-act="dlgx"></div>
      <div class="wd-dlg" role="dialog" aria-modal="true" aria-label="${esc(dlg.title)}">
        <b class="wd-dlg-t">${esc(dlg.title)}</b>
        ${dlg.msg ? `<p class="wd-dlg-m">${esc(dlg.msg)}</p>` : ''}
        ${dlg.input != null ? `<input class="wd-dlg-in" id="wdDlgIn" type="text" maxlength="${dlg.ro ? 500 : 30}" value="${esc(dlg.input)}"${dlg.ro ? ' readonly' : ''} autocomplete="off">` : ''}
        <div class="wd-dlg-b">
          ${dlg.ro ? '' : `<button type="button" class="wd-btn ghost" data-act="dlgx">${esc(t('취소', 'Cancel'))}</button>`}
          <button type="button" class="wd-btn${dlg.danger ? ' danger' : ''}" data-act="dlgok">${esc(dlg.ok)}</button>
        </div>
      </div>`;
  }
  const wordObj = (h) => byHead.get(h) || mineWords.find((w) => w.h === h) || (() => {
    const g = Object.values(D.gloss()).find((x) => x.head === h);
    return { h, p: g?.pos || '', l: 0, e: g?.en || '', s: '', t: [], u: [], x: [] };
  })();
  function openSheet(heads) {
    const had = new Set(folders().filter((f) => heads.every((h) => (f.w?.[h] || 0) > 0)).map((f) => f.id));
    const ids = heads.map((h) => byHead.get(h)).filter(Boolean).map(idOf);
    if (ids.length && ids.every(isStar)) had.add('*star');   // 별표도 폴더 하나로(운영자 결정 C)
    sheet = { heads, sel: new Set(had), had };
    draw();
  }
  function drawSheet() {
    const fs = folders();
    return `<div class="wd-sheet-bg" data-act="sheetx"></div>
      <div class="wd-sheet" role="dialog" aria-modal="true" aria-label="${esc(t('단어장 선택', 'Choose wordbooks'))}">
        <div class="wd-sheet-hd"><b>${esc(t('단어장 선택', 'Choose wordbooks'))}</b>
          <small>${esc(sheet.heads.length === 1 ? sheet.heads[0] : t(`낱말 ${sheet.heads.length}개`, `${sheet.heads.length} words`))}</small>
          <button type="button" class="wd-sheet-x" data-act="sheetx" aria-label="${esc(t('닫기', 'Close'))}">${ico('x')}</button></div>
        <div class="wd-folders">
          <button type="button" class="wd-folder new" data-act="fnew">${FOLDER_SVG}<span class="wd-fplus">${ico('plus')}</span><b>${esc(t('새 단어장', 'New'))}</b></button>
          ${sheet.heads.some((h) => byHead.has(h)) ? `<button type="button" class="wd-folder cstar${sheet.sel.has('*star') ? ' on' : ''}" data-act="fpick" data-id="*star" aria-pressed="${sheet.sel.has('*star')}">
            ${FOLDER_SVG}<span class="wd-fstar">${ico('star')}</span><span class="wd-fchk">${ico('check')}</span><b>${esc(t('별표', 'Starred'))}</b><small>${starIds().length}</small></button>` : ''}
          ${fs.map((f) => `<button type="button" class="wd-folder c${f.c}${sheet.sel.has(f.id) ? ' on' : ''}" data-act="fpick" data-id="${esc(f.id)}" aria-pressed="${sheet.sel.has(f.id)}">
            ${FOLDER_SVG}<span class="wd-fchk">${ico('check')}</span><b>${esc(f.n)}</b><small>${folderHeads(f).length}</small></button>`).join('')}
        </div>
        ${fs.length ? '' : `<p class="wd-sheet-p">${esc(t('「새 단어장」으로 폴더를 만들어 보세요 — 시험 대비 · 드라마 · 일할 때처럼 나눠 두면 좋아요.', 'Make a folder — e.g. exam prep, dramas, work.'))}</p>`}
        <button type="button" class="wd-btn wd-btn-big wd-sheet-save" data-act="fsave">${esc(t('저장하기', 'Save'))}</button>
      </div>`;
  }
  function toast(msg) {
    root.querySelector('.wd-toast')?.remove();
    const el = document.createElement('div'); el.className = 'wd-toast'; el.textContent = msg;
    root.appendChild(el); setTimeout(() => el.remove(), 2200);
  }
  function openFolder(id) {
    const f = S.fd[id]; if (!f || f.del) return;
    const words = folderHeads(f).map(wordObj).filter((w) => w.h);
    view = { tab: 'pick', pick: { words, from: null, folder: id, title: f.n, back: 'data-tab="mine"' } };
    mark('mine'); draw();
  }
  const folderTiles = () => `<div class="wd-sec-hd"><h3 class="wd-h3">${esc(t('내 단어장 폴더', 'My folders'))}</h3></div>
    <div class="wd-folders wd-folders-mine">
      <button type="button" class="wd-folder new" data-act="fnew">${FOLDER_SVG}<span class="wd-fplus">${ico('plus')}</span><b>${esc(t('새 단어장', 'New'))}</b></button>
      <button type="button" class="wd-folder cstar" data-act="starstudy">${FOLDER_SVG}<span class="wd-fstar">${ico('star')}</span><b>${esc(t('별표', 'Starred'))}</b><small>${esc(t(`${starIds().length}개`, `${starIds().length}`))}</small></button>
      ${folders().map((f) => `<button type="button" class="wd-folder c${f.c}" data-act="fopen" data-id="${esc(f.id)}">${FOLDER_SVG}<b>${esc(f.n)}</b><small>${esc(t(`${folderHeads(f).length}개`, `${folderHeads(f).length}`))}</small></button>`).join('')}
    </div>`;

  /* 낱말 묶음을 PDF(인쇄)로 — 노트 인쇄와 같은 자리(#ntPrintView · body.nt-printing, app.module.js)를 빌린다.
     라이브러리 없이 브라우저 인쇄 창의 「PDF로 저장」으로 — 한글 글꼴을 따로 심지 않아도 된다.
     1쪽 단어장(낱말 · 로마자 · 뜻 · 예문 · 외움 칸), 2쪽 스스로 시험(뜻 → 한국어 빈칸, 정답은 맨 아래 작게). */
  async function printSet(btn) {
    const box = document.getElementById('ntPrintView');
    if (!box) return;
    const { words, title } = view.pick;
    const old = btn.innerHTML;
    btn.innerHTML = ico('pdf') + esc(t('준비하는 중…', 'Preparing…'));
    await ensureEx(words);
    btn.innerHTML = old;
    const heads = words.filter((w) => byHead.get(w.h) === w).slice(0, SET_MAX).map((w) => w.h);
    /* 종이에 찍힐 주소 — 사람이 읽고 칠 수 있게 한글 그대로, 길면(12개 넘게) 「단어」 화면 주소만. */
    const link = heads.length && heads.length <= 12 ? `everykoreans.com/#words/set/${heads.join('.')}` : 'everykoreans.com/#words';
    const lv = (w) => (w.l ? t(`${w.l}급`, `Lv ${w.l}`) : '');
    const rows = words.map((w, i) => `<tr>
        <td class="wdp-n">${i + 1}</td>
        <td class="wdp-w"><b>${esc(w.h)}</b><i>${esc(roman(w.h))}</i><small>${esc([w.p, lv(w)].filter(Boolean).join(' · '))}</small></td>
        <td class="wdp-m">${esc(mean(w))}</td>
        <td class="wdp-x">${w.x?.[0] ? `${esc(w.x[0][0])}<small>${esc(w.x[0][1] || '')}</small>` : ''}</td>
        <td class="wdp-c"><span></span></td></tr>`).join('');
    box.innerHTML = `<div class="wdp">
      <div class="wdp-hd"><span class="wdp-brand">${esc(t('치즈감자 단어장', 'CheesePotato wordbook'))}</span><span>${esc(new Date().toLocaleDateString(t('ko-KR', 'en-US')))}</span></div>
      <h1 class="wdp-title">${esc(title)}</h1>
      <p class="wdp-sub">${esc(t(`낱말 ${words.length}개 · 외운 낱말은 오른쪽 칸에 표시하세요`, `${words.length} words · tick the box when you know it`))}</p>
      <table class="wdp-t"><thead><tr><th></th><th>${esc(t('낱말', 'Word'))}</th><th>${esc(t('뜻', 'Meaning'))}</th><th>${esc(t('예문', 'Example'))}</th><th class="wdp-c">✓</th></tr></thead><tbody>${rows}</tbody></table>
      <section class="wdp-quiz">
        <h2>${esc(t('스스로 시험', 'Self-test'))}</h2>
        <p class="wdp-sub">${esc(t('뜻을 보고 한국어로 써 보세요.', 'Write the Korean word for each meaning.'))}</p>
        <ol>${words.map((w) => `<li><span>${esc(mean(w))}</span><em></em></li>`).join('')}</ol>
        <p class="wdp-ans">${esc(t('정답', 'Answers'))}: ${words.map((w, i) => `${i + 1} ${esc(w.h)}`).join(' · ')}</p>
      </section>
      <div class="wdp-ft"><span>${esc(t('치즈감자에서 소리 듣고 외우기', 'Listen and learn on CheesePotato'))} — ${esc(link)}</span></div>
    </div>`;
    D.track('단어PDF');
    document.body.classList.add('nt-printing');
    window.print();
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
    try { await navigator.clipboard.writeText(url); btn.innerHTML = ico('check') + esc(t('링크를 복사했어요', 'Link copied')); }
    catch (e) { ask({ title: t('이 링크를 복사하세요', 'Copy this link'), input: url, ro: true, ok: t('닫기', 'Close'), done: () => draw() }); }
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
      box.innerHTML = `<div class="wd-sec-hd"><h3 class="wd-h3">${esc(t(`담은 낱말 ${rows.length}개`, `Saved words — ${rows.length}`))}</h3>${res.signedIn ? `<button type="button" class="wd-more" data-act="wordbook">${esc(t('편집하기', 'Edit'))}${ico('chev')}</button>` : ''}</div>` +
        (res.signedIn ? '' : `<div class="wd-card hot"><p>${esc(t('로그인하지 않아도 담을 수 있어요. 로그인하면 계정으로 옮겨져서 다른 기기와 앱에서도 보여요.', 'You can save without signing in. Sign in and they move to your account — on every device and in the app.'))}</p>
          <button type="button" class="wd-btn" data-act="login">${esc(t('로그인', 'Sign in'))}</button></div>`) +
        (rows.length ? `${mineWords.length ? `<button type="button" class="wd-play" data-act="mystudy"><span class="wd-play-i">${ico('play')}</span>${esc(t('공부하기', 'Study'))}</button>` : ''}
          <div class="wd-list">${rows.map((r) => { const w = byHead.get(r.word); return `<button type="button" class="wd-row" data-word="${esc(r.word)}"><b>${esc(r.word)}</b><span class="wd-pos">${esc(r.tag || '')}</span>${w ? `<span class="wd-lv">${trackName(trackOf(w))}</span>` : ''}<span class="wd-mean">${esc(r.meaning || '')}</span></button>`; }).join('')}</div>`
          : `<p class="wd-none">${esc(t('아직 담은 낱말이 없어요. 낱말 화면이나 세션에서 「+ 내 단어장」을 눌러 보세요.', 'Nothing saved yet. Tap “+ My wordbook” on a word or a session.'))}</p>`) +
        '';
    }).catch(() => { const box = root.querySelector('#wdMine'); if (box) box.innerHTML = `<p class="wd-none">${esc(t('단어장을 불러오지 못했어요.', 'Could not load your wordbook.'))}</p>`; });
    return folderTiles() + `<div id="wdMine"><p class="wd-none">${esc(t('불러오는 중…', 'Loading…'))}</p></div>`;
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
        <div class="wd-word-h"><b>${esc(w.h)}</b><button type="button" class="dict-say wd-say-big" data-say="${esc(w.h)}" aria-label="${esc(t('발음 듣기', 'Play'))}">${icon}</button>
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
    <button type="button" class="wd-open-wb" data-act="dash"><b>${esc(t('단어장 대시보드', 'Wordbook dashboard'))}</b><span>${esc(t('담은 낱말 통계 · 목표 D-day · 앱과 같은 기록(로그인)', 'Saved-word stats, goal countdown — same as the app (sign in)'))}</span><em>→</em></button>
    <p class="wd-note">${esc(t('외우기 기록은 로그인하면 다른 기기에서도 이어져요.', 'Sign in and your progress follows you to other devices.'))}</p>`;
  }

  /* ── 공부 판 ───────────────────────────────────────────── */
  /* 판이 끝났다 — 「오늘」 카드(app.module.js tdMark)에 알린다. 내 길 세션(from 이 있는 판)은 「오늘의 낱말」,
     복습 · 별표 · 폴더 판은 「복습」 칸. */
  function sessionEnd() { D.track('단어세션끝'); D.today?.(run?.from ? 'words' : 'review'); }
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
      return `<div class="wd-done"><b class="wd-big wd-big-ico">${ico(isBest ? 'trophy' : 'bolt')}</b>
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
      sessionEnd();
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
    /* 카드 — 틴더처럼(운영자 요청): 겹쳐 쌓인 카드, 오른쪽으로 밀면 알아요 · 왼쪽 몰라요(밀수록 기울고 도장이 진해진다),
       눌러서 뒤집기. 아래 동그란 단추 넷(몰라요 · 헷갈려요 · 듣기 · 알아요). 밀기는 아래 pointer 처리. */
    if (r.mode === 'card') {
      needEx(w);
      /* 두 번째 레퍼런스(틴더 카드) — 어두운 카드 위쪽에 스토리처럼 칸 진도, 낱말은 왼쪽 아래 크게, 급수는 작은 칩. */
      const segN = Math.min(r.total, 20), segOn = Math.round((doneCount() / Math.max(1, r.total)) * segN);
      const segs = `<span class="wd-segs" aria-hidden="true">${Array.from({ length: segN }, (_, i) => `<i class="${i < segOn ? 'on' : ''}"></i>`).join('')}</span>`;
      const meta = `<span class="wd-card-meta">${esc([w.l ? t(`${w.l}급`, `Lv ${w.l}`) : '', w.p || ''].filter(Boolean).join(' · '))}</span>`;
      const front = r.dir === 'ko'
        ? `<span class="wd-card-body">${meta}<b class="wd-big">${esc(w.h)}</b><span class="wd-rom">${esc(roman(w.h))}</span></span>`
        : `<span class="wd-card-body">${meta}<b class="wd-big wd-big-en">${esc(mean(w))}</b></span>`;
      const back = `<span class="wd-card-body">${meta}<b class="wd-big">${esc(w.h)}</b><span class="wd-rom">${esc(roman(w.h))}</span>
        <span class="wd-word-en">${esc(w.e)}</span>
        ${w.x[0] ? `<span class="wd-cex">${esc(w.x[0][0])}<small>${esc(w.x[0][1])}</small></span>` : ''}</span>`;
      const b = (how, k, label, extra = '') => `<span class="wd-act-i"><button type="button" class="wd-act-b ${how}" ${extra || `data-act="rate" data-how="${how}"`} aria-label="${esc(label)}">${ico(k)}</button><small>${esc(label)}</small></span>`;
      return head + `<div class="wd-deck">
          <div class="wd-flash${r.flip ? ' flip' : ''}" id="wdCard" data-act="flip" role="button" tabindex="0" aria-label="${esc(t('카드 뒤집기', 'Flip card'))}">
            ${segs}
            <span class="wd-stamp know">${esc(t('알아요', 'KNOW'))}</span><span class="wd-stamp no">${esc(t('몰라요', 'NOPE'))}</span>
            ${r.flip ? back : front}
            <span class="wd-flipb" aria-hidden="true">${ico('flip')}</span>

          </div>
        </div>
        <div class="wd-acts">
          ${b('no', 'x', t('몰라요', 'Nope'))}${b('unsure', 'q', t('헷갈려요', 'Unsure'))}${b('say', 'sound', t('듣기', 'Listen'), `data-say="${esc(w.h)}"`)}${b('know', 'check', t('알아요', 'Know it'))}
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
      <b class="wd-big wd-big-ico">${ico(r.mode === 'test' ? (pct >= 90 ? 'trophy' : pct >= 70 ? 'spark' : 'up') : 'spark')}</b>
      <h3>${esc(r.mode === 'test' ? t(`${r.score} / ${r.total} · ${pct}점`, `${r.score} / ${r.total} · ${pct}%`) : t('세션 끝!', 'Session done!'))}</h3>
      <p>${esc(r.mode === 'test' ? t(`시험 끝! 틀린 낱말 ${miss.length}개는 내일 다시 불러 드려요.`, `Test done! The ${miss.length} you missed come back tomorrow.`)
        : t(`${r.words.length}개 중 ${r.words.length - miss.length}개를 바로 알았어요. 헷갈린 낱말은 내일 다시 불러 드려요.`, `You knew ${r.words.length - miss.length} of ${r.words.length} right away. The tricky ones come back tomorrow.`))}</p>
      <div class="wd-word-act">
        ${miss.length ? `<button type="button" class="wd-btn ghost" data-act="again">${esc(t(`틀린 ${miss.length}개 다시`, `Redo ${miss.length} missed`))}</button>` : ''}
        ${next != null ? `<button type="button" class="wd-btn" data-act="session" data-topic="${esc(r.from.topic)}" data-n="${next}">${esc(t('다음 세션', 'Next session'))}</button>` : ''}
        ${r.from && r.from.topic != null ? `<button type="button" class="wd-btn ghost" data-act="topic" data-topic="${esc(r.from.topic)}">${esc(t('로드맵으로', 'Back to the map'))}</button>` : `<button type="button" class="wd-btn ghost" data-tab="home">${esc(t('오늘 화면으로', 'Back to Today'))}</button>`}
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
    if (!run.cur) sessionEnd();
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
    else { if (run.mode === 'test') testGrade(); sessionEnd(); }
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
    else if (view.tab === 'intro') body = drawIntro();
    else if (view.tab === 'study') body = drawStudy();
    else if (view.tab === 'review') body = drawReview();
    else if (view.tab === 'star') body = drawStar();
    else if (view.tab === 'stats') body = drawStats();
    else if (view.tab === 'mine') body = drawMine();
    else if (view.tab === 'word') body = drawWord(view.h);
    else body = drawHome();
    const hadFocus = document.activeElement?.id === 'wdQ';
    const pos = hadFocus ? document.activeElement.selectionStart : null;
    root.innerHTML = shell(body) + (sheet ? drawSheet() : '') + (dlg ? drawDlg() : '');
    writeSum();
    if (view.tab === 'intro' && view.intro.said !== view.intro.i) { view.intro.said = view.intro.i; sayWord(view.intro.words[view.intro.i].h); }
    if (dlg) { const inp = root.querySelector('#wdDlgIn'); if (inp) { inp.focus(); inp.select(); } else root.querySelector('.wd-dlg [data-act="dlgok"]')?.focus(); }
    root.classList.toggle('wd-studying', view.tab === 'study' || view.tab === 'intro');
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

  /* 세션 열기 — 먼저 새 낱말을 카드로 한 장씩 미리 보여 주고(운영자 요청: 천천히 소개한 뒤에), 다 보면 「이제 어떻게 공부할까요?」
     (공부 방식 셋), 공부가 끝나면 끝 화면의 「로드맵으로」로 돌아가 다음 역. 미리보기는 「건너뛰기」로 넘길 수 있다. */
  const sessionPick = (topic, n, words, intro) => ({ tab: 'pick', pick: { words, from: { topic, n }, intro,
    title: `${topicName(topic)} · ${t(`세션 ${n + 1}`, `Session ${n + 1}`)}`,
    back: `data-act="topic" data-topic="${esc(topic)}"` } });
  function openSession(topic, n) {
    const ss = chunk(listFor(topic));
    const words = ss[n];
    if (!words) return;
    view = { tab: 'intro', intro: { words, i: 0, topic, n, said: -1 } };
    query = '';
    mark(`topic/${topic}/${n + 1}`);
    window.scrollTo({ top: 0 });
    draw();
  }
  function drawIntro() {
    const it = view.intro, w = it.words[it.i], last = it.i === it.words.length - 1;
    needEx(w);
    return `<div class="wd-study-hd">
        <button type="button" class="wd-x" data-act="topic" data-topic="${esc(it.topic)}" aria-label="${esc(t('로드맵으로', 'Back to the map'))}">✕</button>
        <span class="wd-segs wd-segs-hd" aria-hidden="true">${it.words.map((_, j) => `<i class="${j <= it.i ? 'on' : ''}"></i>`).join('')}</span>
        <button type="button" class="wd-link" data-act="introskip">${esc(t('건너뛰기', 'Skip'))}</button></div>
      <p class="wd-intro-k">${esc(topicName(it.topic))} · ${esc(t(`세션 ${it.n + 1} 새 낱말`, `Session ${it.n + 1} — new words`))} <b>${it.i + 1} / ${it.words.length}</b></p>
      <div class="wd-intro">
        <span class="wd-card-meta">${esc([w.l ? t(`${w.l}급`, `Lv ${w.l}`) : '', w.p || ''].filter(Boolean).join(' · '))}</span>
        <div class="wd-intro-w"><b>${esc(w.h)}</b><button type="button" class="wd-intro-say" data-say="${esc(w.h)}" aria-label="${esc(t('발음 듣기', 'Play'))}">${ico('sound')}</button></div>
        <span class="wd-intro-rom">${esc(roman(w.h))}</span>
        <p class="wd-intro-m">${esc(w.e)}</p>
        ${w.x[0] ? `<div class="wd-intro-x"><p>${esc(w.x[0][0])}<button type="button" class="wd-intro-say sm" data-say="${esc(w.x[0][0])}" aria-label="${esc(t('예문 듣기', 'Play example'))}">${ico('sound')}</button></p><small>${esc(w.x[0][1])}</small></div>` : ''}
      </div>
      <div class="wd-intro-nav">
        <button type="button" class="wd-btn ghost" data-act="introprev"${it.i ? '' : ' disabled'}>← ${esc(t('이전', 'Back'))}</button>
        <button type="button" class="wd-btn wd-btn-big" data-act="intronext">${esc(last ? t('다 봤어요 — 공부 방법 고르기', 'Done — choose how to study') : t('다음', 'Next'))} →</button>
      </div>`;
  }
  function introStep(d) {
    const it = view.intro;
    if (d > 0 && it.i === it.words.length - 1) { view = sessionPick(it.topic, it.n, it.words, true); window.scrollTo({ top: 0 }); return draw(); }
    it.i = Math.max(0, Math.min(it.words.length - 1, it.i + d));
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
      const go = () => { query = ''; run = null; view = { tab: tab.dataset.tab }; mark(view.tab === 'home' ? '' : view.tab); draw(); };
      if (view.tab === 'study' && run?.cur) return ask({ title: t('공부를 그만할까요?', 'Stop now?'), msg: t('푼 것은 기록돼요.', 'What you answered is saved.'), ok: t('그만하기', 'Stop'), done: go });
      return go();
    }
    const wd = ev.target.closest('[data-word]');
    if (wd) return openWord(wd.dataset.word);
    const a = ev.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'wordbook') return D.openWordbook();
    if (act === 'dash') return D.openDashboard?.();
    if (act === 'game-quiz') return D.openQuiz();
    if (act === 'game-match') { const n = nextSession() ?? 0; return startRun(chunk(VOCAB)[n], 'match', { topic: 'all', n }); }
    if (act === 'topic') { query = ''; view = { tab: 'topic', topic: a.dataset.topic }; mark(`topic/${a.dataset.topic}`); return draw(); }
    if (act === 'session') { if (a.dataset.track) setTrack(a.dataset.track); return openSession(a.dataset.topic, +a.dataset.n); }
    if (act === 'track') { setTrack(a.dataset.track); return draw(); }
    if (act === 'dir') { S.dir = a.dataset.dir; save(); return draw(); }
    if (act === 'go') return startRun(view.pick.words, a.dataset.mode, view.pick.from);
    if (act === 'stage') { const o = openStages.get(a.dataset.topic) || new Set(), k = +a.dataset.k; o.has(k) ? o.delete(k) : o.add(k); openStages.set(a.dataset.topic, o); return draw(); }
    if (act === 'qclear') { const q = root.querySelector('#wdQ'); q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true })); q.focus(); return; }
    if (act === 'group') { group = a.dataset.group === 'goal' ? 'goal' : 'topic'; try { localStorage.setItem('cp-words-group', group); } catch (e) {} return draw(); }
    if (act === 'pathchange') return D.openTest?.();   // 길은 레벨테스트 목표로 바꾼다
    if (act === 'review') { const d = due().slice(0, 30); view = { tab: 'pick', pick: { words: d, from: null, title: t(`복습 ${d.length}개`, `Review ${d.length}`), back: 'data-tab="home"' } }; mark('review'); return draw(); }
    if (act === 'starstudy') { const d = starIds().map((id) => byId.get(id)).filter(Boolean); view = { tab: 'pick', pick: { words: d, from: null, title: t(`별표 ${d.length}개`, `Starred ${d.length}`), back: 'data-tab="mine"' } }; return draw(); }
    if (act === 'star') {
      const id = a.dataset.id;
      toggleStar(id);
      if (isStar(id)) D.track('단어별표');
      a.classList.toggle('on', isStar(id)); a.textContent = isStar(id) ? '★' : '☆';
      return;
    }
    if (act === 'add') return openSheet([a.dataset.h]);
    if (act === 'addall') return openSheet(view.pick.words.map((w) => w.h));
    if (act === 'sheetx') { sheet = null; return draw(); }
    if (act === 'fpick') { const id = a.dataset.id; sheet.sel.has(id) ? sheet.sel.delete(id) : sheet.sel.add(id); return draw(); }
    if (act === 'fnew') {
      return ask({ title: t('새 단어장', 'New wordbook'), input: t(`단어장 ${folders().length + 1}`, `Wordbook ${folders().length + 1}`), ok: t('만들기', 'Create'),
        done: (name) => { if (name) { const id = newFolder(name.slice(0, 30)); D.syncSoon?.(); if (sheet) sheet.sel.add(id); } draw(); } });
    }
    if (act === 'fsave') {
      const { heads, sel, had } = sheet;
      sheet = null;
      const ids = heads.map((h) => byHead.get(h)).filter(Boolean).map(idOf);
      if (sel.has('*star') && !had.has('*star')) ids.forEach((id) => { if (!isStar(id)) toggleStar(id); });
      if (had.has('*star') && !sel.has('*star')) ids.forEach((id) => { if (isStar(id)) toggleStar(id); });
      sel.forEach((id) => { if (id !== '*star') putInFolder(id, heads, true); });
      had.forEach((id) => { if (id !== '*star' && !sel.has(id)) putInFolder(id, heads, false); });
      const nSel = [...sel].length;
      D.syncSoon?.();
      draw();
      toast(nSel ? t(`단어장 ${nSel}곳에 담았어요`, `Saved to ${nSel} wordbook${nSel > 1 ? 's' : ''}`) : t('내 단어장에 담았어요', 'Saved to your wordbook'));
      return D.saveWords(heads.map(toSave), null);
    }
    if (act === 'fopen') return openFolder(a.dataset.id);
    if (act === 'frename') {
      const f = S.fd[view.pick.folder]; if (!f) return;
      const id = view.pick.folder;
      return ask({ title: t('단어장 이름 바꾸기', 'Rename wordbook'), input: f.n, ok: t('바꾸기', 'Rename'),
        done: (name) => { if (name) { f.n = name.slice(0, 30); f.t = Date.now(); save(); D.syncSoon?.(); } openFolder(id); } });
    }
    if (act === 'fdel') {
      const f = S.fd[view.pick.folder]; if (!f) return;
      return ask({ title: t(`「${f.n}」 폴더를 지울까요?`, `Delete “${f.n}”?`), msg: t('낱말은 내 단어장에 그대로 남아요.', 'The words stay in your wordbook.'), ok: t('지우기', 'Delete'), danger: true,
        done: () => { f.del = true; f.t = Date.now(); save(); D.syncSoon?.(); view = { tab: 'mine' }; draw(); } });
    }
    if (act === 'share') return shareSet(a);
    if (act === 'pdf') return printSet(a);
    if (act === 'mystudy') { view = { tab: 'pick', pick: { words: mineWords, from: null, title: t(`내 단어장 ${mineWords.length}개`, `My wordbook — ${mineWords.length}`), back: 'data-tab="mine"' } }; return draw(); }
    if (act === 'login') return D.openAccount();
    if (act === 'quit') {
      const stop = () => { run = null; view = { tab: 'home' }; mark(''); draw(); };
      return run?.cur ? ask({ title: t('공부를 그만할까요?', 'Stop now?'), msg: t('푼 것은 기록돼요.', 'What you answered is saved.'), ok: t('그만하기', 'Stop'), done: stop }) : stop();
    }
    if (act === 'intronext') return introStep(1);
    if (act === 'introprev') return introStep(-1);
    if (act === 'introskip') { const it = view.intro; view = sessionPick(it.topic, it.n, it.words, true); return draw(); }
    if (act === 'dlgx') { dlg = null; return draw(); }
    if (act === 'dlgok') { const v = root.querySelector('#wdDlgIn')?.value.trim() ?? ''; const cb = dlg?.done; dlg = null; return cb ? cb(v) : draw(); }
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
    if (dlg && (ev.key === 'Enter' || ev.key === 'Escape') && !ev.isComposing) {
      ev.preventDefault(); root.querySelector(`.wd-dlg [data-act="${ev.key === 'Enter' ? 'dlgok' : 'dlgx'}"]`)?.click(); return;
    }
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
    if (view.tab === 'intro' && !root.closest('.hidden') && !ev.target.matches?.('input, textarea') && !dlg) {
      if (ev.key === 'ArrowRight' || ev.key === 'Enter') { ev.preventDefault(); return introStep(1); }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); return introStep(-1); }
    }
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
  /* 카드 밀기 — 오른쪽 알아요, 왼쪽 몰라요. 끄는 동안 손가락을 따라오며 기울고 도장이 진해진다. 90px 넘게 놓으면 그쪽으로
     날아가고 채점, 덜 끌면 제자리로. 끈 뒤에 따라오는 click(뒤집기)은 한 번 막는다. */
  let sx = null, dragDx = 0, dragged = false;
  const card = () => root.querySelector('#wdCard');
  const paint = (dx) => {
    const c = card(); if (!c) return;
    c.style.transform = dx ? `translateX(${dx}px) rotate(${dx / 18}deg)` : '';
    c.querySelector('.wd-stamp.know')?.style.setProperty('opacity', Math.max(0, Math.min(1, dx / 90)));
    c.querySelector('.wd-stamp.no')?.style.setProperty('opacity', Math.max(0, Math.min(1, -dx / 90)));
  };
  root.addEventListener('pointerdown', (ev) => {
    if (!run || run.mode !== 'card' || !ev.target.closest('#wdCard') || ev.target.closest('[data-say]')) return;
    sx = ev.clientX; dragDx = 0; dragged = false;
    card()?.classList.add('drag');
  });
  root.addEventListener('pointermove', (ev) => {
    if (sx == null) return;
    dragDx = ev.clientX - sx;
    if (Math.abs(dragDx) > 6) dragged = true;
    paint(dragDx);
  });
  const release = () => {
    if (sx == null) return;
    sx = null;
    const c = card(); c?.classList.remove('drag');
    if (Math.abs(dragDx) > 90 && c) {
      const how = dragDx > 0 ? 'know' : 'no';
      c.classList.add('fly');
      c.style.transform = `translateX(${dragDx > 0 ? 140 : -140}%) rotate(${dragDx > 0 ? 24 : -24}deg)`;
      setTimeout(() => rate(how), 180);
    } else paint(0);
    dragDx = 0;
  };
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);
  root.addEventListener('click', (ev) => { if (dragged && ev.target.closest('#wdCard')) { dragged = false; ev.stopPropagation(); ev.preventDefault(); } }, true);

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
      else if (a === 'today') { const p = myPath(); if (p) { openSession(p.topic, nextSession(p.topic) ?? 0); return; } view = { tab: 'home' }; }
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
