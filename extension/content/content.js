/* 읽던 쪽에서 한국어를 끌면 뜻을 띄운다.
 *
 * ── 여기서 사전을 안 읽는다 ──────────────────────────────────
 * 이 파일은 사람이 여는 모든 쪽에 들어간다. 사전 360KB 를 여기서 읽으면
 * 한국어가 한 글자도 없는 쪽에서도 그 값을 물고, 탭이 스무 개면 스무
 * 번이다. 그래서 여기는 **끌어 놓은 글만 보내고** 찾기는 서비스 워커가
 * 한다(src/sw.js 머리말).
 *
 * 모듈을 못 읽는 것도 그 때문이다 — content script 는 classic script 라
 * import 가 없다. 그래서 주소 만들기·사전 규칙 같은 것을 여기 베끼지 않고
 * 서비스 워커가 답에 실어 보내게 했다.
 *
 * ── 남의 쪽을 안 건드린다 ────────────────────────────────────
 * 말풍선은 Shadow DOM 안에 있다. 읽던 쪽의 CSS 가 말풍선을 망가뜨리지도,
 * 우리 CSS 가 읽던 쪽으로 새지도 않는다. 문법 밑줄은 CSS Custom Highlight
 * 라 DOM 을 한 글자도 안 고친다(content.css 머리말). */

(() => {
  'use strict';
  if (window.__cheesepotato) return;   /* 같은 쪽에 두 번 들어가는 일을 막는다 */
  window.__cheesepotato = true;

  const HANGUL = /[가-힣]/;
  const MAX_SEL = 300;      /* 이보다 길게 끌면 찾을 뜻이 아니라 복사할 글이다 */
  const MAX_CTX = 400;      /* 문법을 찾아볼 문장의 길이 */

  let cfg = null;           /* 설정. 서비스 워커가 주인이고 여기서는 받아만 쓴다 */
  let EN = !(navigator.language || '').toLowerCase().startsWith('ko');
  /* src/i18n.js 와 같은 규칙. 그쪽을 못 읽어서(classic script 다) 세 줄만
     여기 다시 적었다 — 말풍선만 딴 말로 뜨면 그것대로 고장으로 보인다. */
  const t = (ko, en) => (EN ? en : ko);
  let sel = null;           /* 지금 끌어 놓은 것 {text, context, rect} */
  let host, shade, bubble, dot;
  let gram = [];            /* 밑줄 그은 문법 자리 [{range, name, desc, id, url}] */

  /* ── 설정 ─────────────────────────────────────────────────── */

  const ask = (msg) => new Promise((r) => {
    try {
      chrome.runtime.sendMessage(msg, (v) => {
        /* 읽어 두지 않으면 크롬이 「Unchecked runtime.lastError」를 남의 쪽
           콘솔에 찍는다. 우리 잘못을 남의 콘솔에 흘리지 않는다. */
        void chrome.runtime.lastError;
        r(v);
      });
    } catch { r(null); }   /* 익스텐션이 막 새로 깔린 참이면 길이 잠깐 끊긴다 */
  });

  async function loadCfg() {
    cfg = (await ask({ k: 'settings' })) || {};
    EN = cfg.ui === 'en' ? true
       : cfg.ui === 'ko' ? false
       : !(navigator.language || '').toLowerCase().startsWith('ko');
    return cfg;
  }

  chrome.storage.onChanged.addListener((c, area) => {
    if (area !== 'local' || !c.settings) return;
    /* 기본값 채우기는 서비스 워커가 한다 — 여기서 또 하면 두 벌이 된다. */
    loadCfg().then(() => { if (!cfg.underline && gram.length) underline(false); });
  });

  /* ── 말풍선 그릇 ──────────────────────────────────────────── */

  function ensureHost() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'cheesepotato-root';
    /* 읽던 쪽이 * { position:static } 같은 것을 걸어 두었을 수 있다. 자리와
       쌓임만은 뺏기면 안 되므로 이 넷만 !important 로 박는다. */
    host.style.cssText = 'all:initial;position:fixed!important;inset:0!important;'
      + 'z-index:2147483647!important;pointer-events:none!important;';
    (document.body || document.documentElement).appendChild(host);
    shade = host.attachShadow({ mode: 'closed' });
    shade.appendChild(style());
  }

  function style() {
    const s = document.createElement('style');
    s.textContent = `
:host, * { box-sizing:border-box; margin:0; padding:0; }
.wrap { position:absolute; pointer-events:auto;
  font:14px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI','Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',sans-serif;
  color:#1B1512; }
.card { width:320px; max-width:calc(100vw - 24px); max-height:60vh; overflow:auto;
  background:#fff; border:1px solid rgba(27,21,18,.11); border-radius:14px;
  box-shadow:0 10px 34px rgba(27,21,18,.17); padding:14px 15px;
  animation:pop .13s cubic-bezier(.22,1,.36,1); }
@keyframes pop { from { opacity:0; transform:translateY(-4px) } }
@media (prefers-color-scheme:dark) {
  .wrap { color:#F2EAE0 }
  .card { background:#221C17; border-color:rgba(242,234,224,.13);
          box-shadow:0 10px 34px rgba(0,0,0,.5) }
  .row+.row, .sect { border-color:rgba(242,234,224,.1) }
  .ex { background:#1C1712 }
  .dot { background:#221C17; border-color:rgba(242,234,224,.15) }
}
.row+.row, .sect { border-top:1px solid rgba(27,21,18,.08); margin-top:10px; padding-top:10px; }
.head { display:flex; align-items:baseline; gap:7px; flex-wrap:wrap; }
.word { font-size:17px; font-weight:700; word-break:keep-all; }
.pos { font-size:11px; color:#8C7A66; }
.form { font-size:11px; color:#8C7A66; }
.gloss { margin-top:2px; color:#4E3E31; word-break:break-word; }
@media (prefers-color-scheme:dark) { .gloss { color:#CBB8A6 } .pos,.form,.note,.miss { color:#9C8973 } }
.ex { margin-top:8px; padding:8px 10px; background:#FBF8F1; border-radius:9px; font-size:13px; }
.ex .en { color:#8C7A66; margin-top:3px; font-size:12px; }
.acts { display:flex; gap:6px; margin-left:auto; }
.ic { width:26px; height:26px; display:grid; place-items:center; border-radius:8px;
  border:1px solid rgba(27,21,18,.12); background:transparent; cursor:pointer;
  font-size:13px; line-height:1; color:inherit; flex:none; }
.ic:hover { background:rgba(255,145,77,.16); border-color:#FF914D; }
.ic[disabled] { opacity:.45; cursor:default; }
.ic.on { background:#12704F; border-color:#12704F; color:#fff; }
.tag { display:inline-block; font-size:10px; font-weight:700; letter-spacing:.04em;
  color:#C4551C; background:rgba(255,145,77,.16); border-radius:999px; padding:2px 7px; }
.gname { font-weight:700; margin-top:5px; word-break:keep-all; }
.note { font-size:12.5px; color:#4E3E31; margin-top:2px; word-break:keep-all; }
.miss { font-size:12px; color:#8C7A66; margin-top:8px; word-break:keep-all; }
.foot { display:flex; gap:10px; margin-top:11px; padding-top:10px;
  border-top:1px solid rgba(27,21,18,.08); font-size:12px; }
.foot a { color:#C4551C; text-decoration:none; font-weight:600; }
.foot a:hover { text-decoration:underline; }
@media (prefers-color-scheme:dark) { .foot a { color:#FFA05E } }
.dot { pointer-events:auto; width:28px; height:28px; border-radius:50%; cursor:pointer;
  background:#fff; border:1px solid rgba(27,21,18,.14); box-shadow:0 3px 12px rgba(27,21,18,.2);
  display:grid; place-items:center; padding:0; animation:pop .13s; }
.dot img { width:18px; height:18px; }
.load { color:#8C7A66; font-size:13px; }
`;
    return s;
  }

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;   /* 남의 쪽 글은 언제나 textContent 로 */
    return n;
  };

  function close() {
    bubble?.remove(); bubble = null;
    dot?.remove(); dot = null;
  }

  /* 끌어 놓은 자리 옆에 붙인다. 아래에 자리가 없으면 위로 뒤집고,
     옆으로 넘치면 화면 안으로 당긴다. */
  function place(node, rect, w, h) {
    const gap = 8, pad = 12;
    let top = rect.bottom + gap;
    if (top + h > innerHeight - pad) {
      const up = rect.top - gap - h;
      top = up > pad ? up : Math.max(pad, innerHeight - h - pad);
    }
    let left = rect.left;
    left = Math.min(left, innerWidth - w - pad);
    node.style.left = Math.max(pad, left) + 'px';
    node.style.top = top + 'px';
  }

  /* ── 끌어 놓기 ────────────────────────────────────────────── */

  function read() {
    const s = getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) return null;
    const text = s.toString().trim();
    if (!text || text.length > MAX_SEL || !HANGUL.test(text)) return null;

    const range = s.getRangeAt(0);
    if (host && host.contains(range.commonAncestorContainer)) return null;
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) return null;

    return { text, rect, context: sentenceAround(range, text) };
  }

  /* 끌어 놓은 것이 든 문장. 낱말 하나만 끌어도 그 문장의 문법을 보여 주려고
     함께 보낸다 — 「-는 바람에」는 낱말 하나를 끌어서는 걸릴 수 없다. */
  function sentenceAround(range, text) {
    let n = range.commonAncestorContainer;
    while (n && n.nodeType !== 1) n = n.parentNode;
    let block = n;
    while (block && block !== document.body) {
      const d = getComputedStyle(block).display;
      if (d && !d.startsWith('inline')) break;
      block = block.parentElement;
    }
    const all = (block?.textContent || '').replace(/\s+/g, ' ').trim();
    const i = all.indexOf(text);
    if (i < 0 || all.length > 20000) return text;

    const stop = (c) => c === '.' || c === '!' || c === '?' || c === '。'
      || c === '！' || c === '？' || c === '…';
    let a = i, b = i + text.length;
    while (a > 0 && !stop(all[a - 1]) && i - a < MAX_CTX) a--;
    while (b < all.length && !stop(all[b]) && b - i < MAX_CTX) b++;
    return all.slice(a, Math.min(b + 1, all.length)).trim() || text;
  }

  let timer = 0;
  function onSelect() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!cfg) await loadCfg();
      if (cfg.select === 'off') return;
      const got = read();
      if (!got) { close(); return; }
      sel = got;
      close();
      if (cfg.select === 'icon') showDot(); else show();
    }, 120);
  }

  document.addEventListener('mouseup', onSelect, true);
  /* 자판으로 끄는 것(shift + 화살표)도 받는다. Escape 는 여기 없다 —
     아래에서 닫아 놓고 여기서 다시 열면 영영 안 닫힌다. */
  document.addEventListener('keyup', (e) => { if (e.shiftKey) onSelect(); }, true);

  document.addEventListener('mousedown', (e) => {
    /* 말풍선 안을 누른 것이면 닫지 않는다. Shadow DOM 이라 target 은
       언제나 host 로 나온다 — composedPath 로 봐야 안쪽이 보인다. */
    if (host && e.composedPath().includes(host)) return;
    close();
  }, true);

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, true);

  /* 쪽을 굴리면 끌어 놓은 자리와 말풍선이 어긋나므로 닫는다. 그런데
     말풍선 **안**을 굴리는 것도 이 귀에 걸린다 — 긴 카드를 읽으려고
     굴리면 읽던 것이 닫혔다. 안쪽에서 난 것은 흘려보낸다. */
  addEventListener('scroll', (e) => {
    if (host && e.composedPath?.().includes(host)) return;
    close();
  }, true);
  addEventListener('resize', close);

  /* ── 아이콘만 먼저 (설정이 'icon' 일 때) ──────────────────── */

  function showDot() {
    ensureHost();
    dot = el('button', 'dot');
    dot.title = t('치즈감자에서 찾기', 'Look up in Cheesepotato');
    dot.setAttribute('aria-label', t('치즈감자에서 찾기', 'Look up in Cheesepotato'));
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('icons/icon-32.png');
    img.alt = '';
    dot.appendChild(img);
    dot.style.position = 'absolute';
    shade.appendChild(dot);
    place(dot, sel.rect, 28, 28);
    dot.addEventListener('click', () => { dot.remove(); dot = null; show(); });
  }

  /* ── 말풍선 ──────────────────────────────────────────────── */

  async function show() {
    ensureHost();
    close();
    const wrap = el('div', 'wrap');
    wrap.style.position = 'absolute';
    const card = el('div', 'card');
    card.appendChild(el('div', 'load', t('찾는 중…', 'Looking…')));
    wrap.appendChild(card);
    shade.appendChild(wrap);
    bubble = wrap;
    place(wrap, sel.rect, 320, 120);

    const at = sel;
    const res = await ask({ k: 'look', text: at.text, context: at.context });
    if (bubble !== wrap) return;          /* 기다리는 동안 다른 것을 끌었다 */
    card.textContent = '';
    draw(card, res, at.text);
    /* 내용이 다 들어간 뒤에 다시 재어 놓는다 — 처음 자리는 120px 로 잡은
       어림이라, 긴 카드가 화면 밖으로 나가 있을 수 있다. */
    place(wrap, at.rect, card.offsetWidth || 320, card.offsetHeight || 120);
  }

  function draw(card, res, q) {
    if (!res || res.error) {
      card.appendChild(el('div', 'load', t('못 찾았습니다.', 'Could not look that up.')));
      return;
    }
    for (const w of res.words || []) card.appendChild(word(w));

    for (const g of res.grammar || []) {
      const s = el('div', 'sect');
      s.appendChild(el('span', 'tag', t('문법', 'Grammar')));
      s.appendChild(el('div', 'gname', g.name));
      if (g.desc) s.appendChild(el('div', 'note', g.desc));
      const f = el('div', 'foot');
      f.appendChild(link(g.url, t('표현 보기', 'Read the page')));
      f.appendChild(link(g.appUrl, t('직접 써 보기', 'Write your own')));
      s.appendChild(f);
      card.appendChild(s);
    }

    if (!res.words?.length && !res.grammar?.length) {
      card.appendChild(el('div', 'load', t('사전에 없는 말입니다.', 'Not in this dictionary.')));
      /* 어떤 말이 없었는지 밝혀 둔다. 「없다」만 내놓으면 익스텐션이 고장
         났는지 그 말이 정말 없는지 알 수가 없다. */
      if (res.missed?.length) {
        card.appendChild(el('div', 'miss', res.missed.slice(0, 6).join(' · ')));
      }
      const f = el('div', 'foot');
      f.appendChild(link('https://everykoreans.com/dictionary/', t('사전에서 찾아보기', 'Search the dictionary')));
      card.appendChild(f);
    } else if (res.missed?.length) {
      card.appendChild(el('div', 'miss',
        t('사전에 없음 — ', 'Not in the dictionary — ') + res.missed.slice(0, 6).join(' · ')));
    }
  }

  function word(w) {
    const row = el('div', 'row');
    const head = el('div', 'head');
    head.appendChild(el('span', 'word', w.head));
    if (w.pos) head.appendChild(el('span', 'pos', w.pos));
    /* 끌어 놓은 꼴이 표제어와 다르면 그것도 보인다. 「먹었습니다」를 끌어
       「먹다」가 떴을 때 왜 그 말이 떴는지 알 수 있어야 한다. */
    if (w.form && w.form !== w.head) head.appendChild(el('span', 'form', '← ' + w.form));

    const acts = el('div', 'acts');
    acts.appendChild(icon('♪', t('발음 듣기', 'Play pronunciation'), () => say(w.head, w.say)));
    acts.appendChild(saveBtn(w));
    head.appendChild(acts);
    row.appendChild(head);

    row.appendChild(el('div', 'gloss', w.gloss || '뜻이 아직 없습니다.'));

    if (w.ex) {
      const ex = el('div', 'ex');
      const line = el('div', '', w.ex);
      ex.appendChild(line);
      if (w.exEn) ex.appendChild(el('div', 'en', w.exEn));
      ex.addEventListener('click', () => say(w.ex, w.sayEx));
      ex.style.cursor = 'pointer';
      ex.title = t('눌러서 듣기', 'Click to listen');
      row.appendChild(ex);
    }

    const f = el('div', 'foot');
    f.appendChild(link(w.url, t('사전에서 보기', 'Dictionary')));
    f.appendChild(link(w.appUrl, t('발음 듣고 담기', 'Listen and save')));
    row.appendChild(f);
    return row;
  }

  function icon(glyph, label, fn) {
    const b = el('button', 'ic', glyph);
    b.title = label;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', fn);
    return b;
  }

  function saveBtn(w) {
    const b = icon('＋', t('단어장에 담기', 'Save to wordbook'), async () => {
      b.disabled = true;
      const r = await ask({ k: 'save', item: {
        head: w.head, pos: w.pos, gloss: w.gloss, lang: w.lang,
        ex: w.ex || '', exEn: w.exEn || '',
        from: location.hostname,
      } });
      b.textContent = r?.ok ? '✓' : '✕';
      b.classList.toggle('on', !!r?.ok);
      b.title = r?.ok ? '단어장에 담았습니다' : '못 담았습니다';
    });
    return b;
  }

  function link(href, text) {
    const a = el('a', '', text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }

  /* ── 발음 ────────────────────────────────────────────────── */

  function device(text) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR';
      speechSynthesis.speak(u);
    } catch { /* 목소리가 없는 기기도 있다. 조용히 넘어간다 */ }
  }

  function say(text, url) {
    if (cfg?.speak !== 'site' || !url) { device(text); return; }
    const a = new Audio();
    /* 어느 쪽을 읽다가 눌렀는지는 사이트가 알 일이 아니다. */
    a.referrerPolicy = 'no-referrer';
    a.crossOrigin = 'anonymous';
    /* 녹음은 표제어 4,200여 개에만 있고, 읽던 쪽의 CSP 가 바깥 소리를
       막아 두었을 수도 있다. 어느 쪽이든 기기 목소리로 물러선다 —
       눌렀는데 아무 소리도 안 나는 것이 제일 나쁘다. */
    a.addEventListener('error', () => device(text), { once: true });
    a.src = url;
    a.play().catch(() => device(text));
  }

  /* ── 쪽 전체 문법 밑줄 ───────────────────────────────────── */

  async function underline(on) {
    if (!('highlights' in CSS)) return false;
    if (!on) { CSS.highlights.delete('cp-gram'); gram = []; return false; }

    const nodes = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || n.nodeValue.length < 3 || !HANGUL.test(n.nodeValue)) {
          return NodeFilter.FILTER_REJECT;
        }
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE)$/.test(p.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (host && host.contains(p)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    for (let n = walk.nextNode(); n && nodes.length < 600; n = walk.nextNode()) nodes.push(n);
    if (!nodes.length) return false;

    /* 글월 하나하나 물어보지 않고 한 번에 보낸다. 600번 오가면 서비스
       워커를 깨웠다 재웠다 하느라 찾는 시간보다 오가는 시간이 길어진다. */
    const found = await ask({ k: 'scan-many', texts: nodes.map((n) => n.nodeValue) });
    if (!Array.isArray(found)) return false;

    const ranges = [];
    gram = [];
    found.forEach((hits, i) => {
      for (const g of hits || []) {
        const r = document.createRange();
        try { r.setStart(nodes[i], g.from); r.setEnd(nodes[i], g.to); }
        catch { continue; }   /* 훑는 사이에 쪽이 바뀌었다 */
        ranges.push(r);
        gram.push({ range: r, id: g.id, name: g.name, desc: g.desc });
      }
    });
    if (!ranges.length) { CSS.highlights.delete('cp-gram'); return false; }
    CSS.highlights.set('cp-gram', new Highlight(...ranges));
    return true;
  }

  /* 밑줄을 눌렀을 때. Highlight 는 그림일 뿐이라 누를 수가 없다 —
     누른 자리가 어느 Range 안에 드는지 좌표로 되짚는다. */
  document.addEventListener('click', (e) => {
    if (!gram.length) return;
    if (host && e.composedPath().includes(host)) return;
    if (!getSelection()?.isCollapsed) return;    /* 끌어 놓은 중이면 그쪽이 먼저다 */
    const pos = caretFrom(e.clientX, e.clientY);
    if (!pos) return;
    const hit = gram.find((g) => inRange(g.range, pos.node, pos.offset));
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    sel = { text: hit.name, rect: hit.range.getBoundingClientRect(), context: '' };
    showGrammar(hit);
  }, true);

  function caretFrom(x, y) {
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      return p && { node: p.offsetNode, offset: p.offset };
    }
    const r = document.caretRangeFromPoint?.(x, y);
    return r && { node: r.startContainer, offset: r.startOffset };
  }

  const inRange = (r, node, off) =>
    r.startContainer === node && off >= r.startOffset && off <= r.endOffset;

  function showGrammar(g) {
    ensureHost();
    close();
    const wrap = el('div', 'wrap');
    wrap.style.position = 'absolute';
    const card = el('div', 'card');
    card.appendChild(el('span', 'tag', t('문법', 'Grammar')));
    card.appendChild(el('div', 'gname', g.name));
    if (g.desc) card.appendChild(el('div', 'note', g.desc));
    const f = el('div', 'foot');
    f.appendChild(link('https://everykoreans.com/sentence/' + encodeURIComponent(g.id) + '.html', t('표현 보기', 'Read the page')));
    f.appendChild(link('https://everykoreans.com/#learn/sentence/' + encodeURIComponent(g.id), t('직접 써 보기', 'Write your own')));
    card.appendChild(f);
    wrap.appendChild(card);
    shade.appendChild(wrap);
    bubble = wrap;
    place(wrap, sel.rect, card.offsetWidth || 320, card.offsetHeight || 120);
  }

  /* ── 서비스 워커가 시키는 것 ─────────────────────────────── */

  chrome.runtime.onMessage.addListener((msg, s, reply) => {
    if (msg?.k === 'show-selection') {
      const got = read();
      if (got) { sel = got; show(); }
      reply({ ok: !!got });
      return;
    }
    if (msg?.k === 'toggle-underline') {
      underline(!gram.length).then((on) => reply({ on }));
      return true;
    }
    reply(null);
  });

  /* 쪽을 열 때부터 밑줄을 긋기로 해 두었으면 그렇게 한다. 다 그려진 뒤라야
     훑을 것이 있으므로 한 박자 늦춘다. */
  loadCfg().then(() => { if (cfg.underline) setTimeout(() => underline(true), 600); });
})();
