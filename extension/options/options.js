/* 설정.
 *
 * 설정 칸을 손으로 하나씩 붙이지 않고 표 하나에서 그린다. 칸이 열두 개인데
 * HTML 과 JS 두 군데에 나눠 적으면 하나를 더할 때마다 두 군데를 맞춰야
 * 하고, 그러다 「화면에는 있는데 저장은 안 되는 칸」이 생긴다. */
import { settings, saveSettings, wordbook, toTsv, DEFAULTS, GLOSS_LANGS } from '../src/store.js';
import { setUiLang, t, htmlLang } from '../src/i18n.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

let cfg;

/* 칸 하나하나. key 는 저장되는 이름, kind 는 생김새다. */
const FIELDS = () => [
  {
    key: 'gloss', kind: 'select',
    title: t('뜻풀이 말', 'Meaning language'),
    note: t('낱말 뜻을 어느 말로 볼지. 영어는 낱말 4,209개에 다 붙어 있고, 다른 말은 국립국어원 사전에서 온 것이라 조금 적습니다. 고른 말에 뜻이 없으면 영어로, 영어도 없으면 빈 칸으로 둡니다 — 지어내지 않습니다.',
      'Which language to show word meanings in. English covers all 4,209 words; the others come from the national dictionary and cover a little less. If a word has no meaning in your language it falls back to English, and if there is none there either it is left blank — nothing is made up.'),
    options: Object.entries(GLOSS_LANGS).map(([v, label]) => ({ v, label })),
  },
  {
    key: 'ui', kind: 'pills',
    title: t('화면 말', 'Interface language'),
    options: [
      { v: 'auto', label: t('브라우저를 따라', 'Follow the browser') },
      { v: 'ko', label: '한국어' },
      { v: 'en', label: 'English' },
    ],
  },
  {
    key: 'select', kind: 'pills',
    title: t('한국어를 끌었을 때', 'When you select Korean'),
    note: t('아무 쪽에서나 한국어를 끌면 뜻을 띄웁니다. 끌 일이 잦은 쪽에서 말풍선이 자꾸 뜨는 것이 성가시면 「아이콘을 누를 때」로 두세요.',
      'Selecting Korean on any page shows the meaning. If the bubble gets in the way on pages where you select a lot, switch to the icon.'),
    options: [
      { v: 'on', label: t('바로 띄우기', 'Show it right away') },
      { v: 'icon', label: t('아이콘을 누를 때', 'Only when I click the icon') },
      { v: 'off', label: t('안 띄우기', 'Never') },
    ],
  },
  {
    key: 'grammar', kind: 'check',
    title: t('문법도 함께', 'Grammar too'),
    label: t('말풍선에 그 문장의 문법을 함께 보인다', 'Show the grammar inside the sentence in the bubble'),
    note: t('낱말 하나만 끌어도 그 낱말이 든 문장을 함께 봅니다. 「-는 바람에」 같은 것은 낱말을 끌어서는 걸릴 수 없는 것이고, 학습자가 걸려 넘어지는 것은 그쪽입니다.',
      'Even when you select a single word, the sentence around it is read too. Endings like -는 바람에 can never be caught by selecting a word, and those are what trip learners up.'),
  },
  {
    key: 'underline', kind: 'check',
    title: t('문법에 밑줄', 'Underline grammar'),
    label: t('쪽을 열 때부터 아는 문법에 밑줄을 긋는다', 'Underline known grammar as soon as a page opens'),
    note: t('꺼 두어도 Alt+G 로 그때그때 켤 수 있습니다. 밑줄을 누르면 무슨 문법인지 나옵니다. 아는 문법은 197개입니다.',
      'Even with this off you can turn it on per page with Alt+G. Click an underline to see what the grammar is. 197 patterns are known.'),
  },
  {
    key: 'speak', kind: 'pills',
    title: t('발음', 'Pronunciation'),
    note: t('기기 목소리는 인터넷을 안 씁니다. 사이트 녹음은 사람이 읽은 것이라 훨씬 낫지만, 누를 때마다 everykoreans.com 에서 받아 옵니다 — 어느 쪽을 읽다가 눌렀는지는 안 보냅니다. 녹음이 없는 낱말은 기기 목소리로 넘어갑니다.',
      'The device voice needs no internet. The site recordings are read by a person and sound much better, but each play fetches a file from everykoreans.com — the page you were reading is never sent. Words without a recording fall back to the device voice.'),
    options: [
      { v: 'device', label: t('기기 목소리', 'Device voice') },
      { v: 'site', label: t('사이트 녹음', 'Site recordings') },
    ],
  },
  {
    key: 'newtab', kind: 'pills',
    title: t('새 탭 카드', 'New tab card'),
    note: t('새 탭을 열 때마다 카드 하나. 그날 안에는 같은 카드가 뜹니다 — 열 때마다 바뀌면 읽지 않고 넘기게 됩니다.',
      'One card each time you open a new tab. It stays the same all day — a card that changes every time gets skipped, not read.'),
    options: [
      { v: 'mix', label: t('문법과 낱말 섞어', 'Grammar and words') },
      { v: 'grammar', label: t('문법 표현만', 'Grammar only') },
      { v: 'word', label: t('낱말만', 'Words only') },
      { v: 'off', label: t('안 보기', 'None') },
    ],
  },
  {
    key: 'lv', kind: 'multi',
    title: t('새 탭에 낼 급수', 'Levels on the new tab'),
    note: t('문법 표현 290개가 초급 112 · 중급 93 · 고급 85 로 나뉩니다. 하나도 안 고르면 전부에서 냅니다.',
      'The 290 grammar points split into 112 beginner, 93 intermediate and 85 advanced. Choosing none means all of them.'),
    options: [
      { v: 'beginner', label: t('초급', 'Beginner') },
      { v: 'intermediate', label: t('중급', 'Intermediate') },
      { v: 'advanced', label: t('고급', 'Advanced') },
    ],
  },
];

async function start() {
  cfg = await settings();
  setUiLang(cfg.ui);
  document.documentElement.lang = htmlLang();

  $('h1').textContent = t('치즈감자 설정', 'Cheesepotato settings');
  $('sub').textContent = t('사전도 문법도 익스텐션 안에 들어 있습니다 — 인터넷이 끊겨도 그대로 됩니다.',
    'The dictionary and the grammar live inside the extension — it all works offline.');

  draw();
  await drawBook();
  drawKeys();
  drawFoot();
}

function draw() {
  const form = $('form');
  form.textContent = '';
  for (const f of FIELDS()) form.appendChild(field(f));
}

function field(f) {
  const c = el('section', 'card');
  c.appendChild(el('h2', '', f.title));
  if (f.note) c.appendChild(el('p', 'note', f.note));

  if (f.kind === 'select') {
    const s = el('select');
    for (const o of f.options) {
      const opt = el('option', '', o.label);
      opt.value = o.v;
      if (cfg[f.key] === o.v) opt.selected = true;
      s.appendChild(opt);
    }
    s.addEventListener('change', () => set(f.key, s.value));
    c.appendChild(s);
  }

  if (f.kind === 'pills') {
    const box = el('div', 'opts');
    for (const o of f.options) {
      const b = el('button', 'opt', o.label);
      b.setAttribute('aria-pressed', String(cfg[f.key] === o.v));
      b.addEventListener('click', async () => {
        await set(f.key, o.v);
        for (const sib of box.children) sib.setAttribute('aria-pressed', String(sib === b));
        /* 화면 말을 바꾸면 이 쪽의 글도 같이 바뀌어야 한다 — 설정을 바꿨는데
           바로 앞의 글이 그대로면 안 먹은 줄 안다. */
        if (f.key === 'ui') { setUiLang(o.v); location.reload(); }
      });
      box.appendChild(b);
    }
    c.appendChild(box);
  }

  if (f.kind === 'multi') {
    const box = el('div', 'opts');
    const paint = () => [...box.children].forEach((b, i) =>
      b.setAttribute('aria-pressed', String((cfg[f.key] || []).includes(f.options[i].v))));
    for (const o of f.options) {
      const b = el('button', 'opt', o.label);
      b.addEventListener('click', async () => {
        const cur = cfg[f.key] || [];
        const next = cur.includes(o.v) ? cur.filter((v) => v !== o.v) : [...cur, o.v];
        /* 마지막 하나까지 끄면 아무 카드도 못 낸다. 그럴 때는 전부로
           되돌린다 — 빈 새 탭을 내주느니 고르기 전으로 돌리는 편이 낫다. */
        await set(f.key, next.length ? next : DEFAULTS[f.key]);
        paint();
      });
      box.appendChild(b);
    }
    paint();
    c.appendChild(box);
  }

  if (f.kind === 'check') {
    const lab = el('label', 'check');
    const i = el('input');
    i.type = 'checkbox';
    i.checked = !!cfg[f.key];
    i.addEventListener('change', () => set(f.key, i.checked));
    lab.appendChild(i);
    lab.appendChild(el('span', '', f.label));
    c.appendChild(lab);
  }
  return c;
}

async function set(key, value) {
  cfg = await saveSettings({ [key]: value });
  toast(t('저장했습니다', 'Saved'));
}

/* ── 단어장 ──────────────────────────────────────────────── */

async function drawBook() {
  const wb = await wordbook();
  const n = Object.keys(wb).length;
  const learned = Object.values(wb).filter((w) => w.due == null).length;

  $('bookH').textContent = t('단어장', 'Wordbook');
  $('bookCount').textContent = n
    ? t(`낱말 ${n}개 · 다 외운 것 ${learned}개. 이 기기 안에만 있고 어디로도 안 나갑니다.`,
        `${n} words · ${learned} finished. They live on this computer only and go nowhere else.`)
    : t('아직 담은 낱말이 없습니다.', 'No words saved yet.');

  $('exportBtn').textContent = t('TSV 로 복사', 'Copy as TSV');
  $('clearBtn').textContent = t('다 지우기', 'Delete all');

  $('exportBtn').onclick = async () => {
    const tsv = await toTsv();
    if (!n) { toast(t('담은 낱말이 없습니다', 'Nothing to export')); return; }
    try {
      await navigator.clipboard.writeText(tsv);
      toast(t(`낱말 ${n}개를 복사했습니다 — 안키·스프레드시트에 그대로 붙습니다`,
        `Copied ${n} words — paste straight into Anki or a spreadsheet`));
    } catch { toast(t('복사하지 못했습니다', 'Could not copy')); }
  };

  $('clearBtn').onclick = async () => {
    if (!n) return;
    /* 되돌릴 수 없는 것은 한 번 묻는다. 물어 두지 않으면 잘못 눌러 몇 달
       모은 것이 날아간다. */
    const ok = confirm(t(`낱말 ${n}개를 다 지웁니다. 되돌릴 수 없습니다. 먼저 복사해 두시겠습니까?`,
      `This deletes all ${n} words and cannot be undone. Copy them first?`));
    if (!ok) return;
    await chrome.storage.local.set({ wordbook: {} });
    await drawBook();
    toast(t('다 지웠습니다', 'Deleted'));
  };
}

/* ── 단축키 ──────────────────────────────────────────────── */

function drawKeys() {
  $('keysH').textContent = t('단축키', 'Keyboard');
  const dl = $('keys');
  dl.textContent = '';
  const rows = [
    ['Alt + K', t('치즈감자 열기', 'Open Cheesepotato')],
    ['Alt + G', t('이 쪽의 아는 문법에 밑줄 (한 번 더 누르면 지움)',
      'Underline known grammar on this page (press again to clear)')],
    [t('space / enter', 'space / enter'), t('복습에서 뜻 뒤집기', 'Flip the card while reviewing')],
    ['1 · 2', t('복습에서 몰라요 · 알아요', 'Review: didn’t know · knew it')],
  ];
  for (const [k, d] of rows) {
    const dt = el('dt');
    dt.appendChild(el('kbd', '', k));
    dl.appendChild(dt);
    dl.appendChild(el('dd', '', d));
  }
  const dt = el('dt', '', '');
  dl.appendChild(dt);
  dl.appendChild(el('dd', '', t('바꾸려면 주소창에 chrome://extensions/shortcuts 를 치세요 — 크롬이 익스텐션에서 그 쪽으로 바로 잇는 것을 막아 두었습니다.',
    'To change them, type chrome://extensions/shortcuts in the address bar — Chrome does not let an extension link there directly.')));
}

function drawFoot() {
  const f = $('foot');
  f.textContent = '';
  f.appendChild(document.createTextNode(t(
    '낱말 뜻풀이 일부는 국립국어원 「한국어기초사전」에서 왔습니다. ',
    'Some word meanings come from the Korean Basic Dictionary of the National Institute of Korean Language. ')));
  const a = el('a', '', 'CC BY-SA 2.0 KR');
  a.href = 'https://creativecommons.org/licenses/by-sa/2.0/kr/';
  a.target = '_blank'; a.rel = 'noopener noreferrer';
  f.appendChild(a);
  f.appendChild(document.createTextNode(t(
    ' — 같은 라이선스로 열어 둡니다. 문법 표현·예문·카드는 치즈감자가 만든 것입니다. ',
    ' — shared under the same licence. The grammar points, examples and cards are Cheesepotato’s own. ')));
  const b = el('a', '', 'everykoreans.com');
  b.href = 'https://everykoreans.com/';
  b.target = '_blank'; b.rel = 'noopener noreferrer';
  f.appendChild(b);
}

function toast(text) {
  document.querySelector('.toast')?.remove();
  const n = el('div', 'toast', text);
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2500);
}

start();
