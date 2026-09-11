/* 복습 한 판. 팝업과 새 탭이 같은 것을 쓴다.
 *
 * ── 왜 뜻을 가렸다가 보여 주나 ───────────────────────────────
 * 낱말과 뜻을 나란히 놓고 「알아요」를 누르면 그건 복습이 아니라 읽기다.
 * 떠올려 본 다음에 맞춰 봐야 그 낱말이 어디쯤 있는지 알 수 있다.
 *
 * ── 왜 「몰라요」가 왼쪽인가 ─────────────────────────────────
 * 누르기 쉬운 자리에 「알아요」를 두면 헷갈린 것도 알아요가 된다. 그러면
 * 단어장이 「다 외웠다」고 말해 주는 기계가 된다. */
import { due, grade, BOXES } from './store.js';
import { t } from './i18n.js';
import { say } from './say.js';
import { dictUrl, sayUrl } from './site.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/**
 * 복습판을 그린다.
 * @param {HTMLElement} root 그려 넣을 자리 (안을 비우고 쓴다)
 * @param {object} opt
 * @param {Function} [opt.onDone] 다 끝났을 때
 * @param {Function} [opt.onCount] 남은 개수가 바뀔 때마다
 */
export async function review(root, opt = {}) {
  let queue = await due();
  let shown = false;
  const total = queue.length;
  let done = 0;

  if (!queue.length) { empty(root); opt.onDone?.(0); return; }

  step();

  function step() {
    opt.onCount?.(queue.length);
    if (!queue.length) { finished(root, total); opt.onDone?.(total); return; }
    draw(queue[0]);
  }

  function draw(w) {
    shown = false;
    root.textContent = '';

    const bar = el('div', 'rv-bar');
    const fill = el('div', 'rv-fill');
    fill.style.width = (total ? (done / total) * 100 : 0) + '%';
    bar.appendChild(fill);
    root.appendChild(bar);
    root.appendChild(el('div', 'rv-count', `${done + 1} / ${total}`));

    const head = el('div', 'rv-head');
    head.appendChild(el('span', 'rv-word', w.head));
    const sayBtn = el('button', 'ic', '♪');
    sayBtn.title = t('발음 듣기', 'Play pronunciation');
    sayBtn.setAttribute('aria-label', sayBtn.title);
    /* 소리 주소는 단어장에 안 담는다. 표제어만 있으면 만들 수 있는 것을
       줄마다 적어 두면 단어장이 그만큼 무거워지고, 규칙이 바뀌면 담아 둔
       것만 낡은 주소로 남는다. */
    sayBtn.addEventListener('click', () => say(w.head, sayUrl(w.head)));
    head.appendChild(sayBtn);
    root.appendChild(head);

    /* 상자. 몇 번째 칸에 있는지 보이면 「이건 아직 새것」이 눈에 들어온다. */
    root.appendChild(el('div', 'rv-box',
      (w.box || 0) >= BOXES.length ? t('마지막 칸', 'last box')
        : t(`${(w.box || 0) + 1}번 칸 · 다음은 ${BOXES[w.box || 0]}일 뒤`,
             `box ${(w.box || 0) + 1} · next in ${BOXES[w.box || 0]}d`)));

    const back = el('div', 'rv-back');
    back.hidden = true;
    back.appendChild(el('div', 'rv-gloss', w.note || w.gloss || t('뜻이 없습니다.', 'No meaning yet.')));
    if (w.pos) back.appendChild(el('div', 'rv-pos', w.pos));
    if (w.ex) {
      const ex = el('div', 'rv-ex');
      ex.appendChild(el('div', '', w.ex));
      if (w.exEn) ex.appendChild(el('div', 'rv-en', w.exEn));
      ex.title = t('눌러서 듣기', 'Click to listen');
      ex.addEventListener('click', () => say(w.ex, sayUrl(w.head, 'ex')));
      back.appendChild(ex);
    }
    const a = el('a', 'rv-link', t('사전에서 보기', 'See in the dictionary'));
    a.href = dictUrl(w.head); a.target = '_blank'; a.rel = 'noopener noreferrer';
    back.appendChild(a);
    root.appendChild(back);

    const acts = el('div', 'rv-acts');
    const reveal = el('button', 'btn', t('뜻 보기', 'Show meaning'));
    reveal.addEventListener('click', flip);
    const no = el('button', 'btn ghost', t('몰라요', "Didn't know"));
    const yes = el('button', 'btn warm', t('알아요', 'Knew it'));
    no.hidden = yes.hidden = true;
    no.addEventListener('click', () => mark(w, false));
    yes.addEventListener('click', () => mark(w, true));
    acts.append(reveal, no, yes);
    root.appendChild(acts);

    function flip() {
      shown = true;
      back.hidden = false;
      reveal.hidden = true;
      no.hidden = yes.hidden = false;
      no.focus();
    }

    /* 자판만으로도 넘긴다. 스무 개를 복습하려면 마우스로 예순 번 누른다. */
    const keys = (e) => {
      if (e.key === ' ' || e.key === 'Enter') { if (!shown) { e.preventDefault(); flip(); } }
      else if (shown && (e.key === '1' || e.key === 'ArrowLeft')) mark(w, false);
      else if (shown && (e.key === '2' || e.key === 'ArrowRight')) mark(w, true);
      else return;
    };
    document.addEventListener('keydown', keys);
    root.__keys && document.removeEventListener('keydown', root.__keys);
    root.__keys = keys;
  }

  async function mark(w, ok) {
    document.removeEventListener('keydown', root.__keys);
    await grade(w.head, ok);
    done++;
    /* 모르는 것은 줄 맨 뒤로 보낸다 — 오늘 안에 한 번 더 만난다. 틀린 것을
       사흘 뒤에 다시 보면 그 사흘 동안 틀린 채로 있는다. */
    const w0 = queue.shift();
    if (!ok) queue.push(w0);
    step();
  }
}

function empty(root) {
  root.textContent = '';
  root.appendChild(el('div', 'rv-empty', t('오늘 복습할 낱말이 없습니다.',
    'Nothing to review today.')));
  root.appendChild(el('div', 'rv-note', t('읽다가 만난 낱말을 담아 두면 여기로 옵니다.',
    'Words you save while reading show up here.')));
}

function finished(root, n) {
  root.textContent = '';
  root.appendChild(el('div', 'rv-empty', t('다 했습니다.', 'All done.')));
  root.appendChild(el('div', 'rv-note',
    t(`낱말 ${n}개를 봤습니다. 다음 차례가 되면 다시 알려 드립니다.`,
      `You went through ${n} words. They will come back when they are due.`)));
}
