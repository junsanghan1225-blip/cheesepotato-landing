/* 새 탭 — 오늘의 한 표현.
 *
 * ── 왜 날짜로 고정하나 ───────────────────────────────────────
 * 탭을 열 때마다 다른 카드가 뜨면 하나도 안 읽게 된다. 다음 카드가 한
 * 번의 클릭이면 읽는 것보다 넘기는 것이 쉽기 때문이다. 하루에 하나로
 * 묶어 두면 그날 몇 번을 열든 같은 카드라, 세 번째 열 때쯤에는 읽는다.
 *
 * 그래도 넘기고 싶을 때를 위해 「다른 카드」를 둔다 — 그건 그때뿐이고
 * 다음 날이면 다시 그날의 카드로 돌아온다. */
import { cards } from '../src/data.js';
import { card as wordCard, cardHeads } from '../src/look.js';
import { settings } from '../src/store.js';
import { setUiLang, t, htmlLang, isEn } from '../src/i18n.js';
import { say } from '../src/say.js';
import { review } from '../src/review.js';
import { due } from '../src/store.js';
import { pointUrl, pointAppUrl, dictUrl, sayUrl } from '../src/site.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

let cfg, pool = null, CARDS = [];

/* 그날의 숫자. 날짜 글자에서 뽑으므로 같은 날은 늘 같은 값이고, 기기가
   달라도 같다 — 폰과 노트북에서 다른 카드가 뜨면 「오늘의」가 아니다. */
function daySeed(d = new Date()) {
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

async function start() {
  cfg = await settings();
  setUiLang(cfg.ui);
  document.documentElement.lang = htmlLang();
  $('siteLink').textContent = t('사이트 열기', 'Open the site');
  $('optBtn').textContent = t('설정', 'Settings');
  $('optBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());

  const n = (await due()).length;
  if (n) {
    const b = $('reviewBtn');
    b.hidden = false;
    b.textContent = t(`복습 ${n}`, `Review ${n}`);
    b.addEventListener('click', showReview);
  }

  if (cfg.newtab === 'off') { quiet(); return; }
  CARDS = await cards();
  render(await pickCard(daySeed()));
}

/* 새 탭을 안 바꾸기로 한 사람. 크롬은 「원래 새 탭으로 돌려 달라」는 길을
   익스텐션에 안 열어 준다 — 끄려면 익스텐션을 꺼야 한다. 그래서 여기서는
   빈 쪽을 내고 그 말을 적어 둔다. 아무 설명 없이 빈 쪽을 내면 고장이다. */
function quiet() {
  const c = el('div', 'card');
  c.appendChild(el('div', 'name', t('조용한 새 탭', 'A quiet new tab')));
  c.appendChild(el('div', 'desc', t(
    '카드를 안 보기로 하셨습니다. 크롬은 새 탭을 원래대로 되돌리는 길을 익스텐션에 열어 주지 않아서, 이 쪽이 대신 비어 있습니다. 완전히 되돌리려면 chrome://extensions 에서 이 익스텐션을 끄시면 됩니다.',
    'You turned the cards off. Chrome gives extensions no way to hand the new tab back, so this page stands in for it, empty. To get the real one back, disable this extension in chrome://extensions.')));
  const a = el('div', 'acts');
  a.appendChild(btn(t('설정 열기', 'Open settings'), () => chrome.runtime.openOptionsPage(), 'ghost'));
  c.appendChild(a);
  swap(c);
}

/* ── 카드 고르기 ─────────────────────────────────────────── */

async function pickCard(seed) {
  const mode = cfg.newtab;
  const lv = new Set(cfg.lv || []);
  const grammar = CARDS.filter((c) => lv.has(c.lv));

  /* 고른 급수에 표현이 하나도 없으면 급수를 무시한다. 설정을 잘못 건드린
     사람에게 빈 쪽을 내주느니 아무 카드라도 내주는 편이 낫다. */
  const deck = grammar.length ? grammar : CARDS;

  const wordTurn = mode === 'word' || (mode === 'mix' && (seed & 1));
  if (wordTurn) {
    if (!pool) pool = await cardHeads();
    const w = await wordCard(pool[seed % pool.length], cfg.gloss);
    if (w) return { kind: 'word', w };
    /* 그 표제어에 뜻이 없으면 표현 카드로 물러선다 */
  }
  return { kind: 'grammar', g: deck[seed % deck.length] };
}

function swap(node) {
  const stage = $('stage');
  stage.textContent = '';
  stage.appendChild(node);
}

/* ── 그리기 ──────────────────────────────────────────────── */

function render(pick) {
  swap(pick.kind === 'word' ? wordView(pick.w) : grammarView(pick.g));
  $('footNote').textContent = pick.kind === 'word'
    ? t('낱말 뜻풀이는 국립국어원 한국어기초사전 (CC BY-SA 2.0 KR)',
        'Word meanings from the National Institute of Korean Language (CC BY-SA 2.0 KR)')
    : t('치즈감자의 문법 표현 290개 가운데 하나',
        'One of the 290 grammar points on Cheesepotato');
}

function grammarView(g) {
  const c = el('div', 'card');

  const top = el('div', 'top');
  top.appendChild(el('span', `lv ${g.lv}`, lvName(g.lv)));
  top.appendChild(el('span', 'cat', isEn() ? g.catEn : g.cat));
  c.appendChild(top);

  c.appendChild(el('h1', 'name', g.name));
  if (g.desc) c.appendChild(el('p', 'desc', g.desc));

  if (g.ex) c.appendChild(exBlock(g.ex, '', () => say(g.ex)));

  if (g.form || g.with) {
    const dl = el('dl', 'kv');
    if (g.form) { dl.appendChild(el('dt', '', t('형태', 'Form'))); dl.appendChild(el('dd', '', g.form)); }
    if (g.with) { dl.appendChild(el('dt', '', t('함께', 'Goes with'))); dl.appendChild(el('dd', '', g.with)); }
    c.appendChild(dl);
  }

  if (g.note) c.appendChild(fold(t('주의할 점', 'Watch out'), el('div', 'body', g.note)));
  if (g.ex2) c.appendChild(fold(t('예문 하나 더', 'One more example'),
    exBlock(g.ex2, '', () => say(g.ex2))));
  if (g.dlg?.length) {
    const box = el('div', 'dlg');
    for (const line of g.dlg) {
      const d = el('div', '', line);
      d.title = t('눌러서 듣기', 'Click to listen');
      d.style.cursor = 'pointer';
      d.addEventListener('click', () => say(line.replace(/^[AB]:\s*/, '')));
      box.appendChild(d);
    }
    c.appendChild(fold(t('대화문', 'Dialogue'), box));
  }

  const acts = el('div', 'acts');
  acts.appendChild(link(pointUrl(g.id), t('표현 보기', 'Read the page'), 'ghost'));
  acts.appendChild(link(pointAppUrl(g.id), t('직접 써 보기', 'Write your own'), 'warm'));
  acts.appendChild(nextBtn());
  c.appendChild(acts);
  return c;
}

function wordView(w) {
  const c = el('div', 'card');

  const top = el('div', 'top');
  top.appendChild(el('span', 'lv beginner', t('낱말', 'Word')));
  if (w.pos) top.appendChild(el('span', 'cat', w.pos));
  c.appendChild(top);

  const h = el('h1', 'name', w.head);
  c.appendChild(h);
  c.appendChild(el('p', 'desc', w.gloss || t('뜻이 아직 없습니다.', 'No meaning yet.')));

  /* 고른 말과 영어가 다르면 영어도 함께 보인다. 모국어 뜻만 보고 넘어가면
     영어 쪽 시험지에서 그 낱말을 다시 못 알아본다. */
  if (w.lang && w.lang !== 'en' && w.en) {
    const dl = el('dl', 'kv');
    dl.appendChild(el('dt', '', 'English'));
    dl.appendChild(el('dd', '', w.en));
    c.appendChild(dl);
  }

  if (w.ex) c.appendChild(exBlock(w.ex, w.exEn, () => say(w.ex, sayUrl(w.head, 'ex'))));

  const acts = el('div', 'acts');
  acts.appendChild(btn('♪ ' + t('발음', 'Say it'), () => say(w.head, sayUrl(w.head)), 'ghost'));
  acts.appendChild(saveBtn(w));
  acts.appendChild(link(dictUrl(w.head), t('사전에서 보기', 'Dictionary'), 'ghost'));
  acts.appendChild(nextBtn());
  c.appendChild(acts);
  return c;
}

function exBlock(ko, en, onSay) {
  const box = el('div', 'ex');
  box.appendChild(el('div', 'ko', ko));
  if (en) box.appendChild(el('div', 'en', en));
  const b = el('button', 'ic say', '♪');
  b.title = t('발음 듣기', 'Play');
  b.setAttribute('aria-label', b.title);
  b.addEventListener('click', onSay);
  box.appendChild(b);
  return box;
}

function fold(title, body) {
  const d = el('details');
  d.appendChild(el('summary', '', title));
  d.appendChild(body);
  return d;
}

function btn(text, fn, cls) {
  const b = el('button', 'btn' + (cls ? ' ' + cls : ''), text);
  b.addEventListener('click', fn);
  return b;
}

function link(href, text, cls) {
  const a = el('a', 'btn' + (cls ? ' ' + cls : ''), text);
  a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
  return a;
}

function saveBtn(w) {
  const b = btn('＋ ' + t('담기', 'Save'), async () => {
    b.disabled = true;
    await chrome.runtime.sendMessage({ k: 'save', item: {
      head: w.head, pos: w.pos, gloss: w.gloss, lang: w.lang,
      ex: w.ex || '', exEn: w.exEn || '', from: 'newtab',
    } });
    b.textContent = '✓ ' + t('담았습니다', 'Saved');
  }, 'ghost');
  return b;
}

/* 「다른 카드」는 그때뿐이다 — 어디까지 봤는지 적어 두지 않는다. 적어
   두면 다음 날 여는 카드가 어제 넘긴 자리부터라, 「오늘의」가 아니게 된다. */
function nextBtn() {
  const b = btn(t('다른 카드', 'Another'), async () => {
    render(await pickCard((Math.random() * 0xffffffff) >>> 0));
  }, 'ghost');
  b.classList.add('grow');
  return b;
}

const lvName = (lv) => ({
  beginner: t('초급', 'Beginner'),
  intermediate: t('중급', 'Intermediate'),
  advanced: t('고급', 'Advanced'),
}[lv] || lv);

/* ── 복습 ────────────────────────────────────────────────── */

async function showReview() {
  const box = el('div', 'rv');
  swap(box);
  $('footNote').textContent = t('뜻을 떠올려 본 다음에 보기 — 스페이스로 뒤집고 1·2 로 답합니다.',
    'Recall first, then reveal — space to flip, 1 and 2 to answer.');
  await review(box, {
    onCount: (n) => { $('reviewBtn').textContent = t(`복습 ${n}`, `Review ${n}`); },
    onDone: () => { $('reviewBtn').hidden = true; },
  });
}

start();
