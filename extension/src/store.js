/* 설정과 단어장. chrome.storage.local 하나에 다 들어간다.
 *
 * 서버에 안 둔다. 사이트가 회원가입 없이 열리는 것과 같은 까닭이고,
 * 「어느 쪽에서 무슨 낱말을 눌렀나」는 우리가 알 까닭이 없는 것이다.
 *
 * 기본 설정으로는 익스텐션이 바깥에 아무것도 안 보낸다 — 사전도 문법도
 * 다 안에 들어 있어서 인터넷이 끊겨도 그대로 된다. 딱 하나, 발음을
 * 「사이트 녹음」으로 바꾸면 그때만 everykoreans.com 에서 mp3 를 받아
 * 온다. 그 요청에는 referrer 를 안 붙인다 — 어느 쪽을 읽다가 눌렀는지는
 * 우리가 알 일이 아니다. */

/* 단어장 낱말이 기다리는 날수. 상자 하나를 올릴 때마다 다음 칸으로 간다.
   1 → 3 → 7 → 16 → 35 → 90. 마지막을 지나면 졸업이고 다시 안 묻는다.
   외운 것을 계속 물으면 복습이 벌이 된다 — 벌이 되면 안 열게 된다. */
export const BOXES = [1, 3, 7, 16, 35, 90];
const DAY = 86400000;

export const DEFAULTS = {
  ui: 'auto',        /* 화면 말 — 'auto' | 'ko' | 'en' */
  gloss: 'en',       /* 뜻풀이 말 — 'en' 과 사전이 있는 9개 말 */
  select: 'on',      /* 끌었을 때 — 'on' 바로 | 'icon' 아이콘을 눌러야 | 'off' */
  grammar: true,     /* 말풍선에 그 문장의 문법도 보일까 */
  underline: false,  /* 쪽을 열 때부터 문법에 밑줄을 그을까 (Alt+G 로도 켠다) */
  /* 발음 — 'device' 기기 목소리 | 'site' 사이트 녹음.
     기본을 기기 목소리로 둔다. 녹음이 더 낫지만 그건 받아 와야 하는
     것이고, 아무 설정도 안 건드린 사람의 브라우저가 바깥으로 나가는
     일은 그 사람이 골라서 켜는 것이어야 한다. */
  speak: 'device',
  newtab: 'mix',     /* 새 탭 카드 — 'grammar' | 'word' | 'mix' | 'off' */
  lv: ['beginner', 'intermediate', 'advanced'],  /* 새 탭에 낼 급수 */
};

/* 뜻풀이가 있는 말. data/lang/<코드>.js 와 짝이 맞아야 한다. */
export const GLOSS_LANGS = {
  en: 'English',  ja: '日本語',   zh: '中文',      vi: 'Tiếng Việt',
  ru: 'Русский',  es: 'Español',  fr: 'Français',  ar: 'العربية',
  mn: 'Монгол',   id: 'Indonesia',
};

const get = (k, d) => new Promise((r) => chrome.storage.local.get({ [k]: d }, (o) => r(o[k])));
const set = (k, v) => new Promise((r) => chrome.storage.local.set({ [k]: v }, r));

/* ── 설정 ───────────────────────────────────────────────────── */

export async function settings() {
  const s = await get('settings', {});
  /* 빠진 칸은 기본값으로 채운다. 설정을 새로 더했을 때 예전부터 쓰던
     사람의 화면이 undefined 로 깨지지 않게 하려는 것이다. */
  return { ...DEFAULTS, ...s, lv: s.lv?.length ? s.lv : DEFAULTS.lv };
}

export async function saveSettings(patch) {
  const next = { ...(await settings()), ...patch };
  await set('settings', next);
  return next;
}

/* ── 단어장 ─────────────────────────────────────────────────── */

/** 표제어 → 담은 낱말. 표제어로 묶으므로 「먹었습니다」를 열 번 눌러도 한 줄이다. */
export const wordbook = () => get('wordbook', {});

/** 지금 복습할 차례인 것. 오래 기다린 것부터. */
export async function due(now = Date.now()) {
  const wb = await wordbook();
  return Object.values(wb).filter((w) => w.due != null && w.due <= now)
    .sort((a, b) => a.due - b.due);
}

/** 담는다. 이미 있으면 뜻만 새로 하고 복습 진도는 건드리지 않는다. */
export async function add(item) {
  const wb = await wordbook();
  const old = wb[item.head];
  wb[item.head] = old
    ? { ...old, ...item, note: old.note, box: old.box, due: old.due, at: old.at }
    : { ...item, note: '', box: 0, due: Date.now(), seen: 0, ok: 0, at: Date.now() };
  await set('wordbook', wb);
  return wb[item.head];
}

export async function remove(head) {
  const wb = await wordbook();
  delete wb[head];
  await set('wordbook', wb);
}

/** 손으로 적은 뜻·메모. 사이트와 같은 규칙으로, 다듬어도 안 지워진다. */
export async function annotate(head, note) {
  const wb = await wordbook();
  if (wb[head]) { wb[head].note = note; await set('wordbook', wb); }
}

/**
 * 복습 한 번의 결과를 적는다.
 * @param {string} head 표제어
 * @param {boolean} ok  알았으면 true
 */
export async function grade(head, ok) {
  const wb = await wordbook();
  const w = wb[head];
  if (!w) return null;
  w.seen = (w.seen || 0) + 1;
  if (ok) {
    w.ok = (w.ok || 0) + 1;
    w.box = (w.box || 0) + 1;
    /* 마지막 상자를 지나면 졸업이다. due 를 비워 두면 다시 안 묻는다. */
    w.due = w.box > BOXES.length ? null : Date.now() + BOXES[w.box - 1] * DAY;
  } else {
    /* 처음 칸으로 돌린다. 오늘 안에 다시 만난다 — 틀린 것을 사흘 뒤에
       다시 보면 그 사흘 동안 틀린 채로 있는다. */
    w.box = 0;
    w.due = Date.now();
  }
  await set('wordbook', wb);
  return w;
}

/* ── 내보내기 ───────────────────────────────────────────────── */

/** 단어장을 TSV 로. 안키·구글 스프레드시트가 그대로 받는 꼴이다. */
export async function toTsv() {
  const wb = await wordbook();
  const rows = Object.values(wb).sort((a, b) => a.at - b.at);
  const cell = (v) => String(v ?? '').replace(/[\t\r\n]+/g, ' ');
  return ['표제어\t뜻\t품사\t예문\t예문 뜻\t메모\t담은 날',
    ...rows.map((w) => [w.head, w.note || w.gloss, w.pos, w.ex, w.exEn, w.note,
      new Date(w.at).toISOString().slice(0, 10)].map(cell).join('\t'))].join('\n');
}
