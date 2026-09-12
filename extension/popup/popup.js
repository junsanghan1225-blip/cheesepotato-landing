/* 툴바 팝업 — 찾기·단어장·복습.
 *
 * 여기서는 서비스 워커에 안 묻고 look.js 를 직접 부른다. 팝업은 이미
 * 익스텐션 쪽(page)이라 모듈을 그냥 읽을 수 있고, 한 번 더 건너갈 까닭이
 * 없다(src/sw.js 머리말). */
import { look, suggest } from '../src/look.js';
import { settings, wordbook, remove, due, toTsv, BOXES } from '../src/store.js';
import { setUiLang, t, htmlLang } from '../src/i18n.js';
import { say } from '../src/say.js';
import { review } from '../src/review.js';
import { sayUrl } from '../src/site.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

let cfg;

async function start() {
  cfg = await settings();
  setUiLang(cfg.ui);
  document.documentElement.lang = htmlLang();

  const n = (await due()).length;
  label('find', t('찾기', 'Look up'));
  label('book', t('단어장', 'Wordbook'));
  label('review', n ? t(`복습 ${n}`, `Review ${n}`) : t('복습', 'Review'));
  $('q').placeholder = t('낱말이나 문장을 치세요', 'Type a word or a sentence');
  $('filter').placeholder = t('단어장에서 찾기', 'Filter your words');
  $('exportBtn').textContent = t('내보내기', 'Export');

  for (const b of document.querySelectorAll('.tab[data-tab]')) {
    b.addEventListener('click', () => open(b.dataset.tab));
  }
  $('optBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());
  $('exportBtn').addEventListener('click', exportTsv);

  $('q').addEventListener('input', debounce(find, 160));
  $('filter').addEventListener('input', debounce(drawBook, 120));

  /* 복습할 것이 있으면 복습부터 연다. 툴바를 누른 사람이 가장 자주 하려는
     일이 그것이고, 찾기는 한 번 더 누르면 된다. */
  open(n ? 'review' : 'find');
  hint($('findOut'), t('읽다가 만난 말을 그대로 붙여 넣어도 됩니다 — 문장 안의 문법도 함께 찾습니다.',
    'Paste a whole sentence if you like — the grammar inside it is found too.'));
}

const label = (tab, text) => { document.querySelector(`.tab[data-tab="${tab}"]`).textContent = text; };

function open(tab) {
  for (const b of document.querySelectorAll('.tab[data-tab]')) {
    b.setAttribute('aria-selected', String(b.dataset.tab === tab));
  }
  for (const id of ['find', 'book', 'review']) $(id).hidden = id !== tab;
  if (tab === 'find') $('q').focus();
  if (tab === 'book') drawBook();
  if (tab === 'review') openReview();
}

function debounce(fn, ms) {
  let id = 0;
  return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); };
}

function hint(box, text) {
  box.textContent = '';
  box.appendChild(el('div', 'hint', text));
}

/* ── 찾기 ────────────────────────────────────────────────── */

async function find() {
  const q = $('q').value.trim();
  const box = $('findOut');
  if (!q) {
    hint(box, t('읽다가 만난 말을 그대로 붙여 넣어도 됩니다 — 문장 안의 문법도 함께 찾습니다.',
      'Paste a whole sentence if you like — the grammar inside it is found too.'));
    return;
  }

  const res = await look(q, { lang: cfg.gloss, grammar: cfg.grammar });
  box.textContent = '';

  for (const w of res.words) box.appendChild(wordRow(w));

  for (const g of res.grammar) {
    const s = el('div', 'gsect');
    s.appendChild(el('span', 'tag', t('문법', 'Grammar')));
    s.appendChild(el('div', 'gname', g.name));
    if (g.desc) s.appendChild(el('div', 'gdesc', g.desc));
    const l = el('div', 'w-links');
    l.appendChild(link(g.url, t('표현 보기', 'Read the page')));
    l.appendChild(link(g.appUrl, t('직접 써 보기', 'Write your own')));
    s.appendChild(l);
    box.appendChild(s);
  }

  if (!res.words.length && !res.grammar.length) {
    /* 사전에 없으면 앞글자가 같은 표제어라도 내준다. 「먹」까지 친 사람에게
       「없습니다」를 내주면 다 치기 전에 닫는다. */
    const near = await suggest(q, 10, cfg.gloss);
    if (near.length) {
      box.appendChild(el('div', 'hint', t('이런 낱말이 있습니다', 'Words that start like that')));
      for (const w of near) box.appendChild(wordRow(w));
    } else {
      hint(box, t('사전에 없는 말입니다. 이 사전은 치즈감자의 지문에 나오는 낱말 4,209개를 담고 있습니다.',
        'Not in this dictionary. It holds the 4,209 words that appear in Cheesepotato’s own texts.'));
    }
  }
}

function wordRow(w, opt = {}) {
  const row = el('div', 'w');

  const head = el('div', 'w-head');
  head.appendChild(el('span', 'w-word', w.head));
  if (w.pos) head.appendChild(el('span', 'w-pos', w.pos));
  if (opt.boxes) head.appendChild(boxes(w));

  const acts = el('div', 'w-acts');
  acts.appendChild(icon('♪', t('발음 듣기', 'Play'), () => say(w.head, sayUrl(w.head))));
  acts.appendChild(opt.remove ? delBtn(w, row) : saveBtn(w));
  head.appendChild(acts);
  row.appendChild(head);

  row.appendChild(el('div', 'w-gloss', w.note || w.gloss
    || t('뜻이 아직 없습니다.', 'No meaning yet.')));

  if (w.ex) {
    const ex = el('div', 'w-ex');
    ex.appendChild(el('div', '', w.ex));
    if (w.exEn) ex.appendChild(el('div', 'w-en', w.exEn));
    ex.title = t('눌러서 듣기', 'Click to listen');
    ex.addEventListener('click', () => say(w.ex, sayUrl(w.head, 'ex')));
    row.appendChild(ex);
  }

  const links = el('div', 'w-links');
  links.appendChild(link(w.url || `https://everykoreans.com/dictionary/${encodeURIComponent(w.head)}.html`,
    t('사전에서 보기', 'Dictionary')));
  if (w.from && opt.remove) links.appendChild(el('span', 'w-from', w.from));
  row.appendChild(links);
  return row;
}

function boxes(w) {
  const b = el('span', 'boxes');
  for (let i = 0; i < BOXES.length; i++) {
    const d = el('i');
    if (i < (w.box || 0)) d.classList.add('on');
    b.appendChild(d);
  }
  const wrap = el('span');
  wrap.appendChild(b);
  if (w.due != null && w.due <= Date.now()) {
    wrap.appendChild(el('span', 'due', ' ' + t('복습', 'due')));
  }
  return wrap;
}

function icon(glyph, label, fn, cls) {
  const b = el('button', 'ic' + (cls ? ' ' + cls : ''), glyph);
  b.title = label;
  b.setAttribute('aria-label', label);
  b.addEventListener('click', fn);
  return b;
}

function saveBtn(w) {
  return icon('＋', t('단어장에 담기', 'Save to wordbook'), async (e) => {
    const b = e.currentTarget;
    b.disabled = true;
    await chrome.runtime.sendMessage({ k: 'save', item: {
      head: w.head, pos: w.pos, gloss: w.gloss, lang: w.lang,
      ex: w.ex || '', exEn: w.exEn || '', from: 'popup',
    } });
    b.textContent = '✓';
    b.classList.add('on');
    toast(t('담았습니다', 'Saved'));
  });
}

function delBtn(w, row) {
  return icon('×', t('단어장에서 빼기', 'Remove'), async () => {
    await remove(w.head);
    row.remove();
    toast(t('뺐습니다', 'Removed'));
  }, 'del');
}

function link(href, text) {
  const a = el('a', '', text);
  a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
  return a;
}

/* ── 단어장 ──────────────────────────────────────────────── */

async function drawBook() {
  const box = $('bookOut');
  const q = $('filter').value.trim();
  const all = Object.values(await wordbook()).sort((a, b) => b.at - a.at);
  const rows = q ? all.filter((w) => w.head.includes(q)
    || (w.gloss || '').toLowerCase().includes(q.toLowerCase())
    || (w.note || '').toLowerCase().includes(q.toLowerCase())) : all;

  box.textContent = '';
  if (!all.length) {
    hint(box, t('아직 담은 낱말이 없습니다. 아무 쪽에서나 한국어를 끌어 «＋» 를 누르면 여기로 옵니다.',
      'No words yet. Select Korean on any page and press «＋» to put it here.'));
    return;
  }
  if (!rows.length) { hint(box, t('그런 낱말이 없습니다.', 'No match.')); return; }
  for (const w of rows) box.appendChild(wordRow(w, { remove: true, boxes: true }));
}

async function exportTsv() {
  const tsv = await toTsv();
  const n = tsv.split('\n').length - 1;
  if (!n) { toast(t('담은 낱말이 없습니다', 'Nothing to export')); return; }
  try {
    await navigator.clipboard.writeText(tsv);
    toast(t(`낱말 ${n}개를 복사했습니다`, `Copied ${n} words`));
  } catch {
    toast(t('복사하지 못했습니다', 'Could not copy'));
  }
}

/* ── 복습 ────────────────────────────────────────────────── */

async function openReview() {
  await review($('rv'), {
    onCount: (n) => label('review', n ? t(`복습 ${n}`, `Review ${n}`) : t('복습', 'Review')),
    onDone: () => label('review', t('복습', 'Review')),
  });
}

function toast(text) {
  document.querySelector('.toast')?.remove();
  const n = el('div', 'toast', text);
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2300);
}

start();
