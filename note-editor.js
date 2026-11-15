/* 블록(섹션) 편집기 — 메모장의 블록 그리기 · 고치기 · 끌어 옮기기 · 그림 · 메뉴(웹 리팩터링 4단계, 2026-11-15 운영자 「블록 편집기 분리도 진행해줘」).
   app.module.js 에 있던 구역을 그대로 옮겼다. 메모장 블록을 처음 그릴 때(nbRender) 받는다.
   본문의 이름(메모 자료 · 상태 · 도우미 · t · esc …)은 G 로 읽고 쓴다 — G 는 본문의 NB_G(읽기 · 쓰기 다리)이고, 이 파일을 받기 전에 window.cpNbG 에 걸어 둔다.
   이 파일이 쓰는 본문 이름이 늘면 본문 NB_G 에 한 줄 더한다(빠지면 그 길에서 G.이름 이 undefined). */
const G = window.cpNbG;

const NB_IND_PX = 28;
const NB_TYPES = [
  { t: 'text',   i: '¶',   ko: '글',        en: 'Text' },
  { t: 'h1',     i: 'H1',  ko: '큰 제목',   en: 'Heading 1' },
  { t: 'h2',     i: 'H2',  ko: '중간 제목', en: 'Heading 2' },
  { t: 'h3',     i: 'H3',  ko: '작은 제목', en: 'Heading 3' },
  { t: 'ul',     i: '•',   ko: '목록',      en: 'Bulleted list' },
  { t: 'ol',     i: '1.',  ko: '번호 목록', en: 'Numbered list' },
  { t: 'todo',   i: '☑',   ko: '할 일',     en: 'To-do' },
  { t: 'quote',  i: '❝',   ko: '인용',      en: 'Quote' },
  { t: 'call',   i: '💡',  ko: '강조 칸',   en: 'Callout' },
  { t: 'warn',   i: '⚠️',  ko: '주의',      en: 'Warning' },
  { t: 'tip',    i: '📌',  ko: '팁',        en: 'Tip' },
  { t: 'ex',     i: '✏️',  ko: '예문',      en: 'Example' },
  { t: 'vocab',  i: '🏷️',  ko: '단어 카드', en: 'Word card' },
  { t: 'wb',     i: '📚',  ko: '단어장 카드', en: 'Wordbook' },
  { t: 'toggle', i: '▶',   ko: '접이식',    en: 'Toggle' },
  { t: 'howto',  i: '📐',  ko: '문형',      en: 'How to' },
  { t: 'qa',     i: '💬',  ko: 'Q&A',       en: 'Q&A' },
  { t: 'code',   i: '</>', ko: '코드',      en: 'Code' },
  { t: 'img',    i: '🖼️',  ko: '사진',      en: 'Image' },
  { t: 'hr',     i: '—',   ko: '구분선',    en: 'Divider' },
];
const NB_COLORS = [
  { k: '',       ko: '기본',   en: 'Default', css: 'transparent' },
  { k: 'gray',   ko: '회색',   en: 'Gray',    css: 'rgba(140,122,102,.5)' },
  { k: 'orange', ko: '주황',   en: 'Orange',  css: '#FF914D' },
  { k: 'green',  ko: '초록',   en: 'Green',   css: '#12704F' },
  { k: 'red',    ko: '빨강',   en: 'Red',     css: '#C43D34' },
  { k: 'blue',   ko: '파랑',   en: 'Blue',    css: '#4A7DB5' },
];

/* 마크다운 지름길. 「글」 블록에서 이 글자만 딱 치면 그 자리에서
   종류가 바뀐다 — 노션·옵시디언과 같은 손놀림이다. 자체 구현이다(다른
   라이브러리를 쓰지 않는다), 이 파일의 나머지 블록 편집기와 같다.

   긴 것부터 둔다 — 「### 」가 먼저 걸려야지 「# 」가 먼저 걸리면
   나머지 # 두 개가 글자로 남는다. */
const NB_MD_SHORTCUTS = [
  { re: /^### $/,  type: 'h3' },
  { re: /^## $/,   type: 'h2' },
  { re: /^# $/,    type: 'h1' },
  { re: /^> $/,    type: 'quote' },
  { re: /^\[\] $/, type: 'todo' },
  { re: /^\[ \] $/, type: 'todo' },
  { re: /^[-*] $/, type: 'ul' },
  { re: /^\d+\. $/, type: 'ol' },
  { re: /^! $/,    type: 'warn' },
  { re: /^\? $/,   type: 'tip' },
  { re: /^wb $/,   type: 'wb' },
  { re: /^📚 $/,   type: 'wb' },
  { re: /^--- $/,  type: 'hr' },
];
/* 「글」 블록일 때만 본다 — 이미 종류가 정해진 블록 안에서 우연히
   글자가 이 모양이 돼도 다시 안 바뀐다. */
function nbMdCheck(el, m, b) {
  if (b.t !== 'text') return;
  const hit = NB_MD_SHORTCUTS.find((x) => x.re.test(el.textContent || ''));
  if (!hit) return;
  /* nbRender() 가 새 빈 칸에 포커스를 옮기면 지금 이 el 은 흐려진다(blur).
     같은 b 를 그대로 종류만 바꿔 쓰는 자리라, el 의 blur 손잡이가
     「b.s = 지금 el.innerHTML」을 다시 써 버리면 방금 비운 b.s 가 원래
     글자("# " 따위)로 되돌아간다 — 실제로 겪은 버그다. 자료를 바꾸기
     전에 미리 스스로 blur 를 흘려보내 그 손잡이를 먼저 태워 둔다. */
  el.blur();
  b.t = hit.type; b.s = '';
  G.NB.focus = b.id;
  G.nbSave(m);
}

function nbRender() {
  const m = G.ntMemoCur();
  const box = G.$('ntMemoBlocks');
  if (!m) { box.textContent = ''; return; }
  const blocks = G.nbBlocks(m);
  box.textContent = '';
  blocks.forEach((b, i) => box.appendChild(nbRow(m, b, i)));
  G.$('ntMemoAddEnd').textContent = G.t('+ 블록 더하기', '+ Add a block');

  if (G.NB.focus) {
    const sel = G.NB.focusField
      ? `[data-b="${G.NB.focus}"] [data-f="${G.NB.focusField}"]`
      : `[data-b="${G.NB.focus}"] .nb-txt`;
    const el = box.querySelector(sel);
    if (el) nbCaret(el, G.NB.atEnd);
    G.NB.focus = null;
    G.NB.atEnd = true;
    G.NB.focusField = null;
  }
}

function nbRow(m, b, i) {
  const row = document.createElement('div');
  row.className = `nb-row nb-${b.t}` + (b.done && b.t === 'todo' ? ' done' : '')
    + (b.c ? ` nb-c-${b.c}` : '') + (b.bg ? ` nb-b-${b.bg}` : '');
  row.dataset.b = b.id;
  if (b.ind) row.style.marginLeft = `${Math.min(b.ind, G.NB_IND_MAX) * NB_IND_PX}px`;

  // 손잡이
  const gut = document.createElement('div');
  gut.className = 'nb-gut';
  const plus = document.createElement('button');
  plus.type = 'button'; plus.textContent = '+';
  plus.title = G.t('아래에 블록 더하기', 'Add a block below');
  plus.addEventListener('click', () => nbInsert(m, i + 1));
  const grip = document.createElement('button');
  grip.type = 'button'; grip.className = 'nb-grip'; grip.textContent = '⠿';
  grip.title = G.t('옮기거나 바꾸기', 'Drag to move, click for options');
  grip.draggable = true;
  grip.addEventListener('click', () => nbMenuOpen(grip, m, b));
  grip.addEventListener('dragstart', (ev) => {
    nbDragId = b.id;
    row.classList.add('dragging');
    ev.dataTransfer.effectAllowed = 'move';
    /* 파이어폭스는 자료가 없으면 끌기를 시작하지 않는다. */
    try { ev.dataTransfer.setData('text/plain', b.id); } catch (e) {}
  });
  grip.addEventListener('dragend', () => { nbDragId = null; nbRender(); });
  gut.append(plus, grip);
  row.appendChild(gut);

  const main = document.createElement('div');
  main.className = 'nb-main';

  if (b.t === 'gram' && b.g) {
    const card = document.createElement('div');
    card.className = 'gs';
    card.innerHTML = G.ntGramHtml(b.g, 'gs', true);
    /* 써 보기 칸 — 노트의 다른 칸처럼 바로 저장. 키는 노트 편집기(Enter 로 새 칸 등)까지 올라가지 않게 막는다 */
    const yt = card.querySelector('.gs-yt');
    if (yt) {
      const grow = () => { yt.style.height = 'auto'; yt.style.height = `${yt.scrollHeight}px`; };
      yt.addEventListener('input', () => { b.g.turn = yt.value; grow(); G.ntMemoTouchNow(); });
      ['keydown', 'keyup', 'keypress', 'paste', 'beforeinput'].forEach((ev) => yt.addEventListener(ev, (e) => e.stopPropagation()));
      requestAnimationFrame(grow);
    }
    main.appendChild(card);
    row.appendChild(main);
    nbDropZone(row, m, b);
    return row;
  }
  if (b.t === 'hr') {
    const hr = document.createElement('div');
    hr.className = 'nb-hr-line';   // 줄(row)이 이미 nb-hr 이라 안쪽은 다른 이름 — 같으면 줄 자체가 1px 회색 막대가 됐다
    main.appendChild(hr);
    row.appendChild(main);
    nbDropZone(row, m, b);
    return row;
  }

  /* 사진 칸. contenteditable 이 아니다 — 파일 고르개로 넣고, 설명은
     그냥 <input> 이다(한글 조합은 네이티브 입력칸이 알아서 하니 여기서
     따로 신경 쓸 게 없다). */
  if (b.t === 'img') {
    const wrap = document.createElement('div');
    wrap.className = 'nb-img-wrap';
    const file = document.createElement('input');
    file.type = 'file'; file.accept = 'image/*'; file.className = 'nb-img-file'; file.hidden = true;
    file.addEventListener('change', () => nbImgPick(m, b, file));
    if (b.s) {
      const img = document.createElement('img');
      img.className = 'nb-img-el';
      img.src = b.s;
      img.alt = b.cap || '';
      const chg = document.createElement('button');
      chg.type = 'button'; chg.className = 'nb-img-chg';
      chg.textContent = G.t('사진 바꾸기', 'Replace photo');
      chg.addEventListener('click', () => file.click());
      wrap.append(img, chg, file);
    } else {
      const add = document.createElement('button');
      add.type = 'button'; add.className = 'nb-img-add';
      add.textContent = G.t('사진 추가', 'Add photo');
      add.addEventListener('click', () => file.click());
      wrap.append(add, file);
    }
    main.appendChild(wrap);
    const cap = document.createElement('input');
    cap.type = 'text'; cap.className = 'nb-img-cap'; cap.maxLength = 140;
    cap.placeholder = G.t('설명 (안 써도 돼요)', 'Caption (optional)');
    cap.value = b.cap || '';
    cap.dataset.clarityMask = 'true';
    cap.addEventListener('input', () => { b.cap = cap.value; G.ntMemoTouchNow(); });
    main.appendChild(cap);
    row.appendChild(main);
    nbDropZone(row, m, b);
    return row;
  }

  /* 문답(Q&A). 칸이 하나가 아니라 둘(질문 s · 답 a)이라 사진 칸처럼
     일반 글 칸 흐름 밖에 따로 그린다 — 치즈(질문)·감자(답) 말풍선으로,
     사이트 블로그 글의 대화문과 같은 결이다. */
  if (b.t === 'qa') {
    const wrap = document.createElement('div');
    wrap.className = 'nb-qa-box';   // 줄(row)의 nb-qa 와 겹치면 줄이 세로로 접혀 말풍선이 칸 밖으로 나갔다

    const qLine = document.createElement('div');
    qLine.className = 'nb-qa-line nb-qa-q';
    const qWho = document.createElement('span');
    qWho.className = 'nb-qa-who'; qWho.textContent = '🧀'; qWho.setAttribute('aria-hidden', 'true');
    const qTxt = document.createElement('div');
    qTxt.className = 'nb-qa-bub nb-txt';
    qTxt.contentEditable = 'true'; qTxt.spellcheck = false;
    qTxt.dataset.ph = G.t('질문', 'Question'); qTxt.dataset.f = 's';
    qTxt.innerHTML = G.nbClean(b.s || '');
    nbWireQA(qTxt, m, b, 's', 'a');
    qLine.append(qWho, qTxt);

    const aLine = document.createElement('div');
    aLine.className = 'nb-qa-line nb-qa-a';
    const aTxt = document.createElement('div');
    aTxt.className = 'nb-qa-bub nb-txt';
    aTxt.contentEditable = 'true'; aTxt.spellcheck = false;
    aTxt.dataset.ph = G.t('대답', 'Answer'); aTxt.dataset.f = 'a';
    aTxt.innerHTML = G.nbClean(b.a || '');
    nbWireQA(aTxt, m, b, 'a', null, 's');
    const aWho = document.createElement('span');
    aWho.className = 'nb-qa-who'; aWho.textContent = '🥔'; aWho.setAttribute('aria-hidden', 'true');
    aLine.append(aTxt, aWho);

    wrap.append(qLine, aLine);
    main.appendChild(wrap);
    row.appendChild(main);
    nbDropZone(row, m, b);
    return row;
  }

  /* 어휘/단어 카드 (vocab). 표제어(s)와 뜻풀이(a)를 예쁜 카드로 묶는다. */
  if (b.t === 'vocab') {
    const wrap = document.createElement('div');
    wrap.className = 'nb-vocab-card';

    const top = document.createElement('div');
    top.className = 'nb-vocab-top';
    const tag = document.createElement('span');
    tag.className = 'nb-vocab-tag';
    tag.textContent = '' + G.t('단어', 'Word');
    const word = document.createElement('div');
    word.className = 'nb-vocab-word nb-txt';
    word.contentEditable = 'true';
    word.spellcheck = false;
    word.dataset.ph = G.t('단어 / 발음 (예: 기억나다)', 'Word / Pronunciation');
    word.dataset.f = 's';
    word.innerHTML = G.nbClean(b.s || '');
    nbWireQA(word, m, b, 's', 'a');
    top.append(tag, word);

    const bot = document.createElement('div');
    bot.className = 'nb-vocab-bot';
    const def = document.createElement('div');
    def.className = 'nb-vocab-def nb-txt';
    def.contentEditable = 'true';
    def.spellcheck = false;
    def.dataset.ph = G.t('품사, 뜻풀이 또는 메모 (예: 동사. 머릿속에 떠오르다)', 'Part of speech, definition or notes');
    def.dataset.f = 'a';
    def.innerHTML = G.nbClean(b.a || '');
    nbWireQA(def, m, b, 'a', null, 's');
    bot.appendChild(def);

    wrap.append(top, bot);
    main.appendChild(wrap);
    row.appendChild(main);
    nbDropZone(row, m, b);
    return row;
  }

  /* 예문 (ex). 한국어 문장(s)과 번역/해석(a)을 상하로 깔끔하게 정렬한다. */
  if (b.t === 'ex') {
    const wrap = document.createElement('div');
    wrap.className = 'nb-ex-box';

    const koLine = document.createElement('div');
    koLine.className = 'nb-ex-ko-line';
    const koMark = document.createElement('span');
    koMark.className = 'nb-ex-mark';
    koMark.textContent = 'KO';   // 🇰🇷 은 윈도에서 「KR」 글자로 나오고 폭도 제각각이다
    const koTxt = document.createElement('div');
    koTxt.className = 'nb-ex-ko nb-txt';
    koTxt.contentEditable = 'true';
    koTxt.spellcheck = false;
    koTxt.dataset.ph = G.t('한국어 예문 (예: 비가 와서 우산을 썼어요.)', 'Korean sentence');
    koTxt.dataset.f = 's';
    koTxt.innerHTML = G.nbClean(b.s || '');
    nbWireQA(koTxt, m, b, 's', 'a');
    koLine.append(koMark, koTxt);

    const trLine = document.createElement('div');
    trLine.className = 'nb-ex-tr-line';
    const trMark = document.createElement('span');
    trMark.className = 'nb-ex-mark-sub';
    trMark.textContent = '↳';
    const trTxt = document.createElement('div');
    trTxt.className = 'nb-ex-tr nb-txt';
    trTxt.contentEditable = 'true';
    trTxt.spellcheck = false;
    trTxt.dataset.ph = G.t('해석 / 번역 (예: It rained, so I used an umbrella.)', 'Translation / Meaning');
    trTxt.dataset.f = 'a';
    trTxt.innerHTML = G.nbClean(b.a || '');
    nbWireQA(trTxt, m, b, 'a', null, 's');
    trLine.append(trMark, trTxt);

    wrap.append(koLine, trLine);
    main.appendChild(wrap);
    row.appendChild(main);
    nbDropZone(row, m, b);
    return row;
  }

  /* 단어장 카드 (wb). 치즈감자 단어장 카드 양식. 표제어(s), 뜻(a), 품사(pos), 예문(ex) 및 단어장 담기 단추 */
  if (b.t === 'wb') {
    const wrap = document.createElement('div');
    wrap.className = 'nb-wb-card';

    const head = document.createElement('div');
    head.className = 'nb-wb-head';
    const badges = document.createElement('div');
    badges.className = 'nb-wb-badges';
    const mainBadge = document.createElement('span');
    mainBadge.className = 'nb-wb-badge-main';
    mainBadge.textContent = '' + G.t('단어장', 'Wordbook');

    const pos = document.createElement('span');
    pos.className = 'nb-wb-pos';
    pos.contentEditable = 'true';
    pos.spellcheck = false;
    pos.dataset.ph = G.t('품사', 'POS');
    pos.dataset.f = 'pos';
    pos.textContent = b.pos || '';
    pos.addEventListener('input', () => { b.pos = pos.textContent.trim(); G.ntMemoTouchNow(); });
    pos.addEventListener('blur', () => { b.pos = pos.textContent.trim(); G.ntMemoTouchNow(); });
    pos.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        G.NB.focus = b.id; G.NB.focusField = 's'; nbRender();
      }
    });
    badges.append(mainBadge, pos);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'nb-wb-add-btn';
    addBtn.innerHTML = '<span>+</span> ' + G.t('단어장 담기', 'Add to wordbook');
    addBtn.title = G.t('이 카드를 치즈감자 단어장에 바로 추가해요', 'Save this card to your CheesePotato wordbook');
    addBtn.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      const word = G.nbPlain(b.s || '');
      const mean = G.nbPlain(b.a || '');
      const example = G.nbPlain(b.ex || '');
      const tag = (b.pos || '').trim();
      if (!word) return;
      if (G.ntMemoTimer) G.ntMemoSave();
      const { data: { session } } = await G.sb.auth.getSession();
      if (!session) {
        G.open('account');
        G.showErr(G.t('단어장에 담으려면 로그인이 필요해요.', 'Sign in to add words to your wordbook.'));
        return;
      }
      G.open('wordbook');
      G.openWordForm({
        word: word.slice(0, 200),
        meaning: mean.slice(0, 300),
        example: example.slice(0, 500),
        tag: tag.slice(0, 50),
      });
    });
    head.append(badges, addBtn);

    const word = document.createElement('div');
    word.className = 'nb-wb-word nb-txt';
    word.contentEditable = 'true';
    word.spellcheck = false;
    word.dataset.ph = G.t('표제어 (예: 자전거)', 'Word (e.g. bicycle)');
    word.dataset.f = 's';
    word.innerHTML = G.nbClean(b.s || '');
    nbWireQA(word, m, b, 's', 'a', null);

    const mean = document.createElement('div');
    mean.className = 'nb-wb-mean nb-txt';
    mean.contentEditable = 'true';
    mean.spellcheck = false;
    mean.dataset.ph = G.t('뜻풀이 (예: 두 바퀴로 달리는 탈것)', 'Definition');
    mean.dataset.f = 'a';
    mean.innerHTML = G.nbClean(b.a || '');
    nbWireQA(mean, m, b, 'a', 'ex', 's');

    const exWrap = document.createElement('div');
    exWrap.className = 'nb-wb-ex-wrap';
    const ex = document.createElement('div');
    ex.className = 'nb-wb-ex nb-txt';
    ex.contentEditable = 'true';
    ex.spellcheck = false;
    ex.dataset.ph = G.t('예문 (예: 매일 자전거를 타고 학교에 가요.)', 'Example sentence');
    ex.dataset.f = 'ex';
    ex.innerHTML = G.nbClean(b.ex || '');
    nbWireQA(ex, m, b, 'ex', null, 'a');
    exWrap.appendChild(ex);

    wrap.append(head, word, mean, exWrap);
    main.appendChild(wrap);
    row.appendChild(main);
    nbDropZone(row, m, b);
    return row;
  }

  /* 접이식 토글 (toggle). 질문/제목(s)과 숨길 내용/정답(a) */
  if (b.t === 'toggle') {
    const wrap = document.createElement('div');
    wrap.className = 'nb-toggle-box' + (b.open ? ' open' : '');

    const headLine = document.createElement('div');
    headLine.className = 'nb-toggle-h';
    const tglBtn = document.createElement('button');
    tglBtn.type = 'button';
    tglBtn.className = 'nb-toggle-arrow';
    tglBtn.textContent = b.open ? '▼' : '▶';
    tglBtn.setAttribute('aria-label', G.t('토글 열기/닫기', 'Toggle open/close'));
    tglBtn.addEventListener('click', () => {
      b.open = !b.open;
      G.ntMemoTouchNow();
      nbRender();
    });

    const sumTxt = document.createElement('div');
    sumTxt.className = 'nb-toggle-sum nb-txt';
    sumTxt.contentEditable = 'true';
    sumTxt.spellcheck = false;
    sumTxt.dataset.ph = G.t('토글 제목 / 질문 (항상 보임)', 'Toggle title / Question');
    sumTxt.dataset.f = 's';
    sumTxt.innerHTML = G.nbClean(b.s || '');
    nbWireQA(sumTxt, m, b, 's', 'a');
    headLine.append(tglBtn, sumTxt);

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'nb-toggle-body';
    if (!b.open) bodyWrap.hidden = true;

    const dtlTxt = document.createElement('div');
    dtlTxt.className = 'nb-toggle-dtl nb-txt';
    dtlTxt.contentEditable = 'true';
    dtlTxt.spellcheck = false;
    dtlTxt.dataset.ph = G.t('숨겨질 내용 / 정답 (펼치면 보임)', 'Hidden content / Answer');
    dtlTxt.dataset.f = 'a';
    dtlTxt.innerHTML = G.nbClean(b.a || '');
    nbWireQA(dtlTxt, m, b, 'a', null, 's');
    bodyWrap.appendChild(dtlTxt);

    wrap.append(headLine, bodyWrap);
    main.appendChild(wrap);
    row.appendChild(main);
    nbDropZone(row, m, b);
    return row;
  }

  const inline = document.createElement('div');
  inline.className = 'nb-inline';

  if (b.t === 'ul' || b.t === 'ol' || b.t === 'call' || b.t === 'howto' || b.t === 'warn' || b.t === 'tip') {
    const mark = document.createElement('div');
    mark.className = 'nb-mark';
    mark.textContent = b.t === 'ul' ? '•' : b.t === 'ol' ? `${nbOrd(m, i)}.` : b.t === 'howto' ? '📐' : b.t === 'warn' ? '⚠️' : b.t === 'tip' ? '📌' : '💡';
    inline.appendChild(mark);
  }
  if (b.t === 'todo') {
    const tick = document.createElement('button');
    tick.type = 'button';
    tick.className = 'nb-tick' + (b.done ? ' on' : '');
    tick.textContent = b.done ? '✓' : '';
    tick.setAttribute('aria-label', G.t('할 일 켜고 끄기', 'Toggle to-do'));
    tick.addEventListener('click', () => {
      b.done = !b.done;
      G.ntMemoTouchNow();
      nbRender();
    });
    inline.appendChild(tick);
  }

  const txt = document.createElement('div');
  txt.className = 'nb-txt';
  txt.contentEditable = 'true';
  txt.spellcheck = false;
  txt.dataset.ph = nbPh(b.t);
  txt.innerHTML = G.nbClean(b.s);
  nbWire(txt, m, b);
  inline.appendChild(txt);
  main.appendChild(inline);
  row.appendChild(main);
  nbDropZone(row, m, b);
  return row;
}

const nbPh = (t0) => ({
  text: G.t('글을 쓰거나 / 를 눌러 보세요', "Write, or press / for blocks"),
  h1: G.t('큰 제목', 'Heading 1'), h2: G.t('중간 제목', 'Heading 2'), h3: G.t('작은 제목', 'Heading 3'),
  ul: G.t('목록', 'List item'), ol: G.t('목록', 'List item'), todo: G.t('할 일', 'To-do'),
  quote: G.t('인용', 'Quote'), call: G.t('강조할 말', 'Callout'), code: G.t('코드', 'Code'),
  warn: G.t('주의할 점이나 자주 하는 실수 (예: -아서/어서 뒤에는 명령문 금지)', 'Watch out (e.g. No imperatives with -아서/어서)'),
  tip: G.t('학습 팁이나 보충 설명 (예: 회화에서는 보통 줄여서 말해요)', 'Study tip or additional note'),
  howto: G.t('동사·형용사에 어떻게 붙는지 (예: 동사 + -는 바람에)', 'How it attaches (e.g. Verb + -는 바람에)'),
  wb: G.t('단어 (예: 자전거)', 'Word (e.g. bicycle)'),
}[t0] || '');

/* "예시" 단추가 채우는 본보기 글. 자리표시글(placeholder)은 눌러 쓰면
   그냥 사라지지만, 이건 진짜 값으로 칸에 들어가서 지우거나 고쳐 쓰는
   시작점이 된다 — 「블록타입을 예시로 바꿔서 직접 고쳐 쓰고 싶다」는
   요청대로다. img·hr 은 채울 말이 없어 목록에서 뺀다. */
const NB_SAMPLE = (t0) => ({
  text: G.t('여기에 자유롭게 메모를 적어요.', 'Write anything here.'),
  h1: G.t('오늘의 문법', "Today's grammar"),
  h2: G.t('예문 정리', 'Example round-up'),
  h3: G.t('주의할 점', 'Watch out'),
  ul: G.t('예문 하나를 적어요', 'One example sentence'),
  ol: G.t('차례대로 적을 때 써요', 'Use this for steps in order'),
  todo: G.t('오늘 배운 문법 복습하기', "Review today's grammar"),
  quote: G.t('한국의 겨울은 정말 추워요.', 'Korean winters are really cold.'),
  call: G.t('「나의」는 「내」로 줄여 쓰는 게 더 자연스러워요.', "It's more natural to shorten 「나의」 to 「내」."),
  warn: G.t('주의: 「안 되다」와 「안되다」는 띄어쓰기에 따라 뜻이 달라져요.', 'Watch out: 「안 되다」 and 「안되다」 have different meanings based on spacing.'),
  tip: G.t('팁: 비슷한 표현으로 「-기 때문에」를 함께 알아두면 좋아요.', 'Tip: It is great to learn the similar expression 「-기 때문에」 together.'),
  howto: G.t('A/V + 아서/어서', 'A/V + 아서/어서'),
  code: G.t('먹다 → 먹어요', '먹다 → 먹어요'),
}[t0] ?? null);
const NB_SAMPLE_TWO = (t0) => ({
  qa: {
    s: G.t('이 표현은 언제 써요?', 'When do you use this expression?'),
    a: G.t('친한 사이에서 편하게 말할 때 써요.', 'You use it casually between close friends.'),
  },
  vocab: {
    s: G.t('기억나다 [기엉나다]', '기억나다 [to remember]'),
    a: G.t('동사. 잊었던 생각이나 사실이 머릿속에 다시 떠오르다.', 'Verb. To recall or remember something previously forgotten.'),
  },
  ex: {
    s: G.t('한국 친구 덕분에 한국어 실력이 많이 늘었어요.', '한국 친구 덕분에 한국어 실력이 많이 늘었어요.'),
    a: G.t('Thanks to my Korean friend, my Korean skills have improved a lot.', 'Thanks to my Korean friend, my Korean skills have improved a lot.'),
  },
  toggle: {
    s: G.t('복습 퀴즈: \'바람을 쐬다\'는 무슨 뜻일까요?', 'Review Quiz: What does \'바람을 쐬다\' mean?'),
    a: G.t('정답: 기분을 전환하기 위해 바깥에 나가 신선한 공기를 마시다.', 'Answer: To go outside and get some fresh air to refresh oneself.'),
  },
  wb: {
    s: G.t('자전거', 'bicycle'),
    a: G.t('두 바퀴로 달리는 탈것', 'A two-wheeled vehicle'),
    ex: G.t('학교까지 자전거를 타고 가요.', 'I ride a bicycle to school.'),
    pos: G.t('명사', 'noun'),
  },
}[t0] ?? null);

/* 사진은 넣기 전에 줄인다. 단어장 사진(shrinkImage, 1280px)보다 더
   줄인다 — 노트 사진은 브라우저 저장 공간(localStorage)에 글자로
   박혀 들어가서, 서버에 올리는 단어장 사진보다 용량에 더 민감하다. */
const NB_IMG_MAX_W = 1000;
function nbImgShrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, NB_IMG_MAX_W / img.width);
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load')); };
    img.src = url;
  });
}
/* 사진 칸(b)에 file 을 앉힌다. 성공하면 참을 준다 — 실패하면 b 를
   건드리지 않는다(호출한 쪽이 새로 만든 칸을 그때 버릴 수 있게). */
async function nbImgSetFromFile(b, file) {
  if (!file.type.startsWith('image/')) {
    G.$('ntMemoSaved').textContent = G.t('사진 파일만 넣을 수 있어요', 'Images only');
    return false;
  }
  if (file.size > 15 * 1024 * 1024) {
    G.$('ntMemoSaved').textContent = G.t('사진이 너무 커요 (15MB까지)', 'Photo too large (max 15MB)');
    return false;
  }
  try {
    const url = await nbImgShrink(file);
    /* 줄여도 이만하면 저장 공간을 너무 먹는다 — 다른 사진을 권한다. */
    if (url.length > 900 * 1024) {
      G.$('ntMemoSaved').textContent = G.t('줄여도 너무 커요. 다른 사진을 써 보세요', 'Still too large: try a different photo');
      return false;
    }
    b.s = url;
    return true;
  } catch (e) {
    G.$('ntMemoSaved').textContent = G.t('사진을 못 읽었어요', "Couldn't read that photo");
    return false;
  }
}
async function nbImgPick(m, b, input) {
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  if (await nbImgSetFromFile(b, file)) G.nbSave(m);
}
/* 글 블록에 사진을 그대로 붙여넣을 때(Cmd/Ctrl+V) 쓴다 — 사진을 넣으려면
   매번 「/」로 종류를 사진으로 바꾸고 파일 고르개까지 눌러야 하는 게
   번거롭다는 제보로 만들었다. 빈 글 블록이면 그 자리에서 사진 칸으로
   바뀌고, 이미 글이 있으면 지우지 않고 바로 아래에 새 사진 칸을 만든다. */
async function nbImgFromClipboard(m, b, el, file) {
  const blocks = G.nbBlocks(m);
  const i = blocks.indexOf(b);
  const reuse = b.t === 'text' && !G.nbPlain(el.innerHTML);
  const target = reuse ? b : G.nbNew('img');
  const ok = await nbImgSetFromFile(target, file);
  if (!ok) return;
  const url = target.s;
  if (reuse) {
    /* nbSave() 가 부를 nbRender() 는 지금 포커스가 가 있는 el 을 통째로
       지운다 — 그러면 el 의 blur 손잡이가 뒤늦게 걸려 b.s 를 (아직
       비어 있던) el.innerHTML 로 되돌려 버린다. 그 blur 를 먼저
       흘려보낸 다음에 사진 주소를 앉힌다 — nbMdCheck 에서 겪은 것과
       같은 버그다. */
    el.blur();
    b.t = 'img'; b.s = url; b.cap = '';
  } else {
    blocks.splice(i + 1, 0, target);
  }
  G.NB.focus = null;
  G.nbSave(m);
}

/* 번호 목록의 번호. 바로 위가 번호 목록이면 이어서 센다. */
function nbOrd(m, i) {
  const blocks = G.nbBlocks(m);
  const ind = blocks[i].ind || 0;
  let n = 1;
  /* 같은 들여쓰기 단계끼리만 센다 — 한 단계 더 들어간(중첩된) 목록은
     건너뛰고, 한 단계 덜 들어간 데까지 올라가면 거기서 멈춘다(그
     위는 이 목록이 아니다). */
  for (let k = i - 1; k >= 0; k--) {
    const bkInd = blocks[k].ind || 0;
    if (bkInd < ind) break;
    if (bkInd > ind) continue;
    if (blocks[k].t !== 'ol') break;
    n++;
  }
  return n;
}

/* ── 글 칸 손잡이 ─────────────────────────────────────────── */
function nbWire(el, m, b) {
  let composing = false;
  el.addEventListener('compositionstart', () => { composing = true; });
  el.addEventListener('compositionend', () => { composing = false; b.s = G.nbClean(el.innerHTML); G.ntMemoTouchNow(); });
  el.addEventListener('input', () => {
    /* 조합 중에도 자료는 담아 둔다. **DOM 은 건드리지 않는다** — 여기서
       다시 그리면 한글 조합이 끊긴다. */
    b.s = composing ? el.innerHTML : G.nbClean(el.innerHTML);
    G.ntMemoTouchNow();
    /* #·-·>·숫자는 한글처럼 조합되는 글자가 아니라 매 키 입력이 바로
       완성된 글자로 온다 — composing 중에 봐도 안전하지만, 그래도
       조합이 막 끝난 다음(즉 composing=false)에만 본다. markdown
       지름길이 도중에 발동해서 조합을 방해할 일을 아예 없앤다. */
    if (!composing) nbMdCheck(el, m, b);
  });
  el.addEventListener('blur', () => { b.s = G.nbClean(el.innerHTML); G.ntMemoTouchNow(); });

  el.addEventListener('keydown', (ev) => {
    if (composing) return;   // 조합 중 엔터는 글자를 고르는 것이지 줄바꿈이 아니다
    const m2 = G.ntMemoCur();
    if (!m2) return;
    const blocks = G.nbBlocks(m2);
    const i = blocks.indexOf(b);

    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      b.s = G.nbClean(el.innerHTML);
      /* 목록·할 일에서 빈 줄에 엔터를 치면 목록을 빠져나온다 — 노션과 같다. */
      if (['ul', 'ol', 'todo'].includes(b.t) && !G.nbPlain(b.s)) {
        b.t = 'text'; b.done = false;
        G.NB.focus = b.id;
        return G.nbSave(m2);
      }
      const next = G.nbNew(['ul', 'ol', 'todo'].includes(b.t) ? b.t : 'text');
      next.c = b.c; next.bg = b.bg; next.ind = b.ind || 0;
      blocks.splice(i + 1, 0, next);
      G.NB.focus = next.id;
      return G.nbSave(m2);
    }
    if (ev.key === 'Backspace' && nbCaretAt0(el)) {
      /* 들여쓴 줄이면 지우기·종류 되돌리기보다 내어쓰기가 먼저다 — 노션과
         같다. 한 번에 확 밀리면(내어쓰기 없이 바로 글로 바뀌거나 지워지면)
         한 단계씩 무르기가 안 된다. */
      if (b.ind) {
        ev.preventDefault();
        b.ind -= 1;
        G.NB.focus = b.id; G.NB.atEnd = false;
        return G.nbSave(m2);
      }
      if (['ul', 'ol', 'todo', 'quote', 'call', 'warn', 'tip', 'howto', 'code', 'h1', 'h2', 'h3'].includes(b.t)) {
        ev.preventDefault();
        b.t = 'text'; b.done = false;
        G.NB.focus = b.id; G.NB.atEnd = false;
        return G.nbSave(m2);
      }
      if (!G.nbPlain(el.innerHTML) && blocks.length > 1) {
        ev.preventDefault();
        blocks.splice(i, 1);
        G.NB.focus = (blocks[i - 1] || blocks[0]).id;
        return G.nbSave(m2);
      }
    }
    /* 들여쓰기(Tab)·내어쓰기(Shift+Tab). 바로 위 블록보다 한 단계 넘게는
       못 들어간다 — 안 그러면 사이가 붕 뜬 들여쓰기가 생긴다. */
    if (ev.key === 'Tab') {
      ev.preventDefault();
      if (ev.shiftKey) {
        if (b.ind) { b.ind -= 1; G.NB.focus = b.id; G.NB.atEnd = true; G.nbSave(m2); }
      } else {
        const prevInd = i > 0 ? (blocks[i - 1].ind || 0) : -1;
        const maxInd = Math.min(prevInd + 1, G.NB_IND_MAX);
        if ((b.ind || 0) < maxInd) { b.ind = (b.ind || 0) + 1; G.NB.focus = b.id; G.NB.atEnd = true; G.nbSave(m2); }
      }
      return;
    }
    if (ev.key === 'ArrowUp' && i > 0 && nbCaretAt0(el)) {
      ev.preventDefault();
      nbFocusBlock(blocks[i - 1].id, true);
    }
    if (ev.key === 'ArrowDown' && i < blocks.length - 1 && nbCaretAtEnd(el)) {
      ev.preventDefault();
      nbFocusBlock(blocks[i + 1].id, false);
    }
    /* 굵게·기울임은 브라우저에 맡긴다 — 한글 조합과 되돌리기를 스스로
       다루지 않아도 되고, 어느 브라우저에서나 같게 움직인다. */
    if ((ev.metaKey || ev.ctrlKey) && ['b', 'i', 'u'].includes(ev.key.toLowerCase())) {
      ev.preventDefault();
      document.execCommand({ b: 'bold', i: 'italic', u: 'underline' }[ev.key.toLowerCase()]);
      b.s = G.nbClean(el.innerHTML);
      G.ntMemoTouchNow();
    }
    /* Cmd/Ctrl+K 로 링크를 건다 — 고른 글자가 있어야 하고, 없다면
       커서가 이미 걸린 링크 위일 때만(그 링크를 고치거나 없애려고) 연다. */
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      const range = G.nbLinkTargetRange(el);
      if (range) G.nbLinkOpen(el, range, b);
    }
    /* 빈 글 블록에서 / 를 누르면 종류 고르개가 뜬다. */
    if (ev.key === '/' && !G.nbPlain(el.innerHTML)) {
      setTimeout(() => nbMenuOpen(el, m2, b, 'type'), 0);
    }
  });

  /* 붙여넣기는 글자만 받는다 — 남의 쪽에서 통째로 끌고 오는 서식이
     노트를 제 마음대로 칠하지 않게. 다만 사진을 복사해 붙여넣은 경우는
     예외 — 그건 글자가 없으니 그냥 두면 아무 일도 안 일어난 것처럼
     보인다("사진을 넣을 수가 없어" 제보의 원인). */
  el.addEventListener('paste', (ev) => {
    const cd = ev.clipboardData || window.clipboardData;
    const imgItem = cd && [...cd.items || []].find((it) => it.kind === 'file' && it.type.startsWith('image/'));
    if (imgItem) {
      ev.preventDefault();
      const file = imgItem.getAsFile();
      const m2 = G.ntMemoCur();
      if (file && m2) nbImgFromClipboard(m2, b, el, file);
      return;
    }
    const txt = cd.getData('text/plain');
    /* 순수 주소만 붙여넣으면 자동으로 링크가 된다(문장 속에 섞여 있으면
       그냥 글자로 받는다 — 마음대로 서식을 입히면 오히려 성가시다).
       고른 글자가 있으면 구글 문서·노션처럼 그 위에 링크를 걸고, 없으면
       주소 자체를 누를 수 있는 글자로 넣는다. */
    if (/^https?:\/\/\S+$/i.test(txt.trim())) {
      const url = G.nbLinkNormalize(txt.trim());
      if (url) {
        ev.preventDefault();
        const sel = getSelection();
        if (sel && sel.rangeCount && !sel.getRangeAt(0).collapsed) {
          document.execCommand('createLink', false, url);
        } else {
          document.execCommand('insertHTML', false,
            `<a href="${url.replace(/"/g, '&quot;')}">${txt.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a>`);
        }
        const node = getSelection().anchorNode;
        const host = node && (node.nodeType === 3 ? node.parentElement : node);
        const a = host && host.closest && host.closest('a[href]');
        if (a) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        b.s = G.nbClean(el.innerHTML);
        G.ntMemoTouchNow();
        return;
      }
    }
    ev.preventDefault();
    document.execCommand('insertText', false, txt);
  });
}

/* 문답(qa) 블록의 말풍선 하나를 잇는다. nbWire 를 그대로 안 쓰는 것은
   Enter 의 뜻이 다르기 때문이다 — 일반 블록에서 Enter 는 "다음 블록"
   이지만, 질문 칸에서 Enter 는 "답 칸으로"고 답 칸에서 Enter 라야
   비로소 다음 블록을 만든다. 그 밖의 손놀림(굵게·붙여넣기·Tab·화살표로
   블록 넘나들기)은 문답 안에서까지는 안 지원한다 — 말풍선 둘짜리
   작은 칸이라 거기까지는 안 써도 될 거라 보았다. */
function nbWireQA(el, m, b, field, nextField, prevField) {
  let composing = false;
  el.addEventListener('compositionstart', () => { composing = true; });
  el.addEventListener('compositionend', () => { composing = false; b[field] = G.nbClean(el.innerHTML); G.ntMemoTouchNow(); });
  el.addEventListener('input', () => {
    b[field] = composing ? el.innerHTML : G.nbClean(el.innerHTML);
    G.ntMemoTouchNow();
  });
  el.addEventListener('blur', () => { b[field] = G.nbClean(el.innerHTML); G.ntMemoTouchNow(); });
  el.addEventListener('keydown', (ev) => {
    if (composing) return;
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      b[field] = G.nbClean(el.innerHTML);
      const m2 = G.ntMemoCur();
      if (!m2) return;
      const blocks = G.nbBlocks(m2);
      const i = blocks.indexOf(b);
      /* 단어장 카드는 이어서 쓴다(운영자 요청 2026-10-02 「연속으로」) — 예문에서 Enter 면 바로 아래 새 카드,
         빈 카드의 표제어에서 Enter 면 그 빈 카드를 글줄로 바꿔 줄줄이 쓰기를 끝낸다. */
      const wbEmpty = b.t === 'wb' && !G.nbPlain(b.s || '') && !G.nbPlain(b.a || '') && !G.nbPlain(b.ex || '');
      if (b.t === 'wb' && field === 's' && wbEmpty) {
        const txt = G.nbNew('text');
        blocks.splice(i, 1, txt);
        G.NB.focus = txt.id; G.NB.focusField = null;
        return G.nbSave(m2);
      }
      if (nextField) {
        G.NB.focus = b.id; G.NB.focusField = nextField;
        return G.nbSave(m2);
      }
      /* 마지막 칸에서 Enter — 다음 블록(글)을 새로 만든다. 일반 블록의
         Enter 와 같은 결이다. 단어장 카드는 다음 단어장 카드. */
      const next = G.nbNew(b.t === 'wb' ? 'wb' : 'text');
      blocks.splice(i + 1, 0, next);
      G.NB.focus = next.id; G.NB.focusField = b.t === 'wb' ? 's' : null;
      return G.nbSave(m2);
    }
    if (ev.key === 'Backspace' && !G.nbPlain(el.innerHTML) && nbCaretAt0(el)) {
      /* 첫 칸이 비어 있는데 지우면 이 블록째 지운다(다른 칸도 모두 비었을 때만
         — 실수로 첫 칸만 비웠을 때 내용 든 블록이 날아가지 않게).
         뒷 칸이 비어 있으면 앞 칸으로 돌아간다. */
      const m2 = G.ntMemoCur();
      if (!m2) return;
      if (prevField) {
        ev.preventDefault();
        G.NB.focus = b.id; G.NB.focusField = prevField; G.NB.atEnd = true;
        nbRender();
      } else if (!G.nbPlain(b.a || '') && (!b.ex || !G.nbPlain(b.ex))) {
        ev.preventDefault();
        const blocks = G.nbBlocks(m2);
        const i = blocks.indexOf(b);
        if (blocks.length > 1) {
          blocks.splice(i, 1);
          G.NB.focus = (blocks[i - 1] || blocks[0]).id;
          G.nbSave(m2);
        }
      }
    }
  });
}

/* ── 커서 다루기 ──────────────────────────────────────────── */
function nbCaret(el, atEnd) {
  el.focus();
  const r = document.createRange();
  r.selectNodeContents(el);
  r.collapse(!atEnd);
  const sel = getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
}
function nbFocusBlock(id, atEnd) {
  const el = G.$('ntMemoBlocks').querySelector(`[data-b="${id}"] .nb-txt`);
  if (el) nbCaret(el, atEnd);
}
const nbCaretAt0 = (el) => {
  const s = getSelection();
  if (!s.rangeCount) return false;
  const r = s.getRangeAt(0).cloneRange();
  r.selectNodeContents(el);
  r.setEnd(s.getRangeAt(0).startContainer, s.getRangeAt(0).startOffset);
  return r.toString().length === 0;
};
const nbCaretAtEnd = (el) => {
  const s = getSelection();
  if (!s.rangeCount) return false;
  const r = s.getRangeAt(0).cloneRange();
  r.selectNodeContents(el);
  r.setStart(s.getRangeAt(0).endContainer, s.getRangeAt(0).endOffset);
  return r.toString().length === 0;
};
function nbInsert(m, at, type = 'text') {
  const blocks = G.nbBlocks(m);
  const b = G.nbNew(type);
  blocks.splice(at, 0, b);
  G.NB.focus = b.id;
  G.nbSave(m);
}

/* ── 끌어 옮기기 ──────────────────────────────────────────── */
let nbDragId = null;
/* dataTransfer 에 「Files」가 있으면(바탕화면 등 바깥에서 끌어온 것)
   드래그다. 우리 끼리 블록을 끌 때(nbDragId)는 이 종류가 없다. */
const nbIsFileDrag = (ev) => !!(ev.dataTransfer && [...ev.dataTransfer.types || []].includes('Files'));
function nbDropZone(row, m, b) {
  row.addEventListener('dragover', (ev) => {
    if (nbIsFileDrag(ev)) { ev.preventDefault(); return; }
    if (!nbDragId || nbDragId === b.id) return;
    ev.preventDefault();
    row.classList.add('drag-over');
  });
  row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
  row.addEventListener('drop', (ev) => {
    /* 바깥에서 사진 파일을 끌어다 놓은 경우. 여기서 막지 않으면 브라우저가
       이 탭을 그 파일로 통째로 옮겨 가 버린다(편집 중이던 노트가 눈앞에서
       사라진 것처럼 보인다) — 반드시 preventDefault 부터 한다. */
    if (nbIsFileDrag(ev)) {
      ev.preventDefault();
      row.classList.remove('drag-over');
      const file = [...(ev.dataTransfer.files || [])].find((f) => f.type.startsWith('image/'));
      if (file) nbImgFromClipboard(m, b, row.querySelector('.nb-txt'), file);
      else G.$('ntMemoSaved').textContent = G.t('사진 파일만 끌어다 놓을 수 있어요', 'Only photo files can be dropped here');
      return;
    }
    if (!nbDragId || nbDragId === b.id) return;
    ev.preventDefault();
    row.classList.remove('drag-over');
    const blocks = G.nbBlocks(m);
    const from = blocks.findIndex((x) => x.id === nbDragId);
    const to = blocks.findIndex((x) => x.id === b.id);
    if (from < 0 || to < 0) return;
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    nbDragId = null;
    G.nbSave(m);
  });
}
/* 블록 줄 사이 틈이나 목록 쪽처럼, 위의 row 손잡이가 없는 자리에 사진을
   떨어뜨려도 페이지가 그 파일로 튀어 나가지 않게 문서 전체에 한 번 더
   막아 둔다(각 row 의 처리기가 먼저 붙잡으면 여기까진 안 온다). */
document.addEventListener('dragover', (ev) => { if (nbIsFileDrag(ev)) ev.preventDefault(); });
document.addEventListener('drop', (ev) => { if (nbIsFileDrag(ev)) ev.preventDefault(); });

/* ── 메뉴 (종류·색·복제·지우기) ───────────────────────────── */
let nbMenuAt = null;
function nbMenuClose() {
  G.$('nbMenu').hidden = true;
  nbMenuAt = null;
}
function nbMenuOpen(anchor, m, b, only) {
  const box = G.$('nbMenu');
  box.textContent = '';
  nbMenuAt = b.id;

  const head = (label) => {
    const h = document.createElement('div');
    h.className = 'nb-menu-h';
    h.textContent = label;
    box.appendChild(h);
  };
  const item = (icon, label, fn, on, extra) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    if (on) btn.classList.add('on');
    const i = document.createElement('span');
    i.className = 'nb-menu-i';
    i.textContent = icon;
    const s = document.createElement('span');
    s.textContent = label;
    btn.append(i, s);
    if (extra) {
      const x = document.createElement('span');
      x.className = 'nb-menu-x';
      x.textContent = extra;
      btn.appendChild(x);
    }
    btn.addEventListener('click', () => { fn(); });
    box.appendChild(btn);
    return btn;
  };
  const sep = () => { const d = document.createElement('div'); d.className = 'nb-menu-sep'; box.appendChild(d); };
  const swatches = (list, cur, fn) => {
    const wrap = document.createElement('div');
    wrap.className = 'nb-swatches';
    list.forEach((c) => {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'nb-sw' + (cur === c.k ? ' on' : '');
      sw.style.background = c.css;
      sw.title = G.t(c.ko, c.en);
      sw.setAttribute('aria-label', G.t(c.ko, c.en));
      sw.addEventListener('click', () => fn(c.k));
      wrap.appendChild(sw);
    });
    box.appendChild(wrap);
  };

  head(G.t('블록 종류', 'Turn into'));
  /* 사진 칸은 s 에 주소를, 문답 칸은 s·a 에 질문·답을 담는다 — 다른
     종류(글자 하나만 쓰는 칸)와 그 경계를 넘으면 헌 값이 다음 칸에서
     그대로 깨진 채 쓰이니 비운다. */
  const switchType = (ty) => {
    if ((ty.t === 'img') !== (b.t === 'img')) { b.s = ''; b.cap = ''; }
    const isMulti = (t) => ['qa', 'vocab', 'ex', 'toggle', 'wb'].includes(t);
    if (!isMulti(ty.t) && isMulti(b.t)) {
      b.s = b.s || b.a || '';
      delete b.a;
      delete b.ex;
      delete b.pos;
    } else if (isMulti(ty.t) && !isMulti(b.t)) {
      b.a = '';
      if (ty.t === 'wb') { b.ex = ''; b.pos = ''; }
    }
    b.t = ty.t;
    if (ty.t !== 'todo') b.done = false;
    if (ty.t === 'toggle') b.open = true;
  };
  NB_TYPES.forEach((ty) => {
    const row = document.createElement('div');
    row.className = 'nb-menu-row';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nb-menu-type';
    if (b.t === ty.t) btn.classList.add('on');
    const i = document.createElement('span');
    i.className = 'nb-menu-i';
    i.textContent = ty.i;
    const s = document.createElement('span');
    s.textContent = G.t(ty.ko, ty.en);
    btn.append(i, s);
    btn.addEventListener('click', () => {
      switchType(ty);
      G.NB.focus = ty.t === 'hr' || ty.t === 'img' ? null : b.id;
      nbMenuClose();
      G.nbSave(m);
    });
    row.appendChild(btn);
    const sample = ['qa', 'vocab', 'ex', 'toggle', 'wb'].includes(ty.t) ? NB_SAMPLE_TWO(ty.t) : NB_SAMPLE(ty.t);
    if (sample) {
      const sm = document.createElement('button');
      sm.type = 'button';
      sm.className = 'nb-menu-sample';
      sm.textContent = G.t('예시', 'Sample');
      sm.title = G.t('이 종류로 바꾸고 본보기 글을 채워요', 'Turn into this type and fill in an example');
      sm.addEventListener('click', (ev) => {
        ev.stopPropagation();
        switchType(ty);
        if (ty.t === 'wb') {
          b.s = G.esc(sample.s);
          b.a = G.esc(sample.a);
          b.ex = G.esc(sample.ex || '');
          b.pos = G.esc(sample.pos || '');
        } else if (['qa', 'vocab', 'ex', 'toggle'].includes(ty.t)) {
          b.s = G.esc(sample.s);
          b.a = G.esc(sample.a);
          if (ty.t === 'toggle') b.open = true;
        } else {
          b.s = G.esc(sample);
        }
        G.NB.focus = b.id;
        G.NB.focusField = ['qa', 'vocab', 'ex', 'toggle', 'wb'].includes(ty.t) ? 's' : null;
        G.NB.atEnd = true;
        nbMenuClose();
        G.nbSave(m);
      });
      row.appendChild(sm);
    }
    box.appendChild(row);
  });

  if (only !== 'type') {
    sep();
    head(G.t('글자색', 'Text colour'));
    swatches(NB_COLORS, b.c, (k) => { b.c = k; nbMenuClose(); G.nbSave(m); });
    head(G.t('바탕색', 'Background'));
    swatches(G.NB_BGS, b.bg, (k) => { b.bg = k; nbMenuClose(); G.nbSave(m); });
    sep();
    /* Tab·Shift+Tab 은 키보드가 있어야 편하다 — 폰 화면 키보드는 Tab이
       없거나 포커스만 옮기는 경우가 많아서, 손잡이 메뉴에도 같은 일을
       하는 단추를 둔다. 지금 물릴 수 없는 쪽(맨 위 단계에서 내어쓰기,
       위 블록보다 더 들어갈 수 없을 때 들여쓰기)은 아예 안 보여준다. */
    const blocksN = G.nbBlocks(m);
    const iN = blocksN.indexOf(b);
    const prevIndN = iN > 0 ? (blocksN[iN - 1].ind || 0) : -1;
    const maxIndN = Math.min(prevIndN + 1, G.NB_IND_MAX);
    if (b.ind) item('⇤', G.t('내어쓰기', 'Outdent'), () => { b.ind -= 1; nbMenuClose(); G.nbSave(m); });
    if ((b.ind || 0) < maxIndN) item('⇥', G.t('들여쓰기', 'Indent'), () => { b.ind = (b.ind || 0) + 1; nbMenuClose(); G.nbSave(m); });
    if (b.ind || (b.ind || 0) < maxIndN) sep();
    /* 블록 안에 이모지 넣기. 커서 자리에 꽂고, 커서가 없으면 뒤에 붙인다. */
    const emo = item('🙂', G.t('이모지 넣기', 'Insert emoji'), () => {
      const el = G.$('ntMemoBlocks').querySelector(`[data-b="${b.id}"] .nb-txt`);
      G.nbEmoOpen(emo, (e) => {
        if (el && document.activeElement === el) {
          document.execCommand('insertText', false, e);
          b.s = G.nbClean(el.innerHTML);
        } else {
          b.s = G.nbClean((b.s || '') + e);
        }
        nbMenuClose();
        G.nbSave(m);
      });
    });
    emo.dataset.emo = '1';
    item('⧉', G.t('블록 복제', 'Duplicate'), () => {
      const blocks = G.nbBlocks(m);
      const i = blocks.findIndex((x) => x.id === b.id);
      const copy = { ...b, id: G.nbId() };
      blocks.splice(i + 1, 0, copy);
      G.NB.focus = copy.id;
      nbMenuClose();
      G.nbSave(m);
    });
    item('🗑', G.t('블록 지우기', 'Delete'), async () => {
      /* 노트 전체를 지울 때는 물어보면서, 블록 하나를 지울 때는 안 물어봤다
         — 되돌릴 방법이 똑같이 없는데(되돌리기 없음, 서버 백업 없음)
         내용이 든 블록은 그냥 사라져 버렸다. 빈 블록은 여전히 바로
         지운다(백스페이스로 지울 때와 같다 — 그것까지 물어보면 성가시다). */
      const hasContent = b.t === 'img' ? !!(b.s || b.cap)
        : ['qa', 'vocab', 'ex', 'toggle'].includes(b.t) ? !!(G.nbPlain(b.s) || G.nbPlain(b.a || ''))
        : b.t === 'wb' ? !!(G.nbPlain(b.s) || G.nbPlain(b.a || '') || G.nbPlain(b.ex || '') || (b.pos && b.pos.trim()))
        : !!G.nbPlain(b.s);
      if (hasContent && !(await confirmAsync(G.t('이 블록을 지울까요? 되돌릴 수 없어요.',
                                                'Delete this block? This cannot be undone.')))) return;
      const blocks = G.nbBlocks(m);
      const i = blocks.findIndex((x) => x.id === b.id);
      blocks.splice(i, 1);
      if (!blocks.length) blocks.push(G.nbNew());
      G.NB.focus = (blocks[i - 1] || blocks[0]).id;
      nbMenuClose();
      G.nbSave(m);
    });
  }

  box.hidden = false;
  /* 자리는 크기를 안 뒤에 잡는다 — 아래가 좁으면 위로 올린다. */
  const r = anchor.getBoundingClientRect();
  const p = box.getBoundingClientRect();
  const top = r.bottom + 6 + p.height > window.innerHeight - 8
    ? Math.max(8, r.top - p.height - 6) : r.bottom + 6;
  box.style.top = `${top}px`;
  box.style.left = `${Math.max(8, Math.min(window.innerWidth - p.width - 8, r.left))}px`;
}
document.addEventListener('click', (ev) => {
  if (!nbMenuAt) return;
  if (ev.target.closest('#nbMenu') || ev.target.closest('.nb-grip')) return;
  nbMenuClose();
});
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && nbMenuAt) nbMenuClose(); });
/* 페이지가 스크롤돼 손잡이(anchor)가 움직이면 뜬 메뉴가 엉뚱한 자리에
   남으니 닫는다. 그런데 이 메뉴 자신도 목록이 길면 overflow-y:auto 로
   제 안에서 스크롤한다 — capture:true 로 window 에 걸어 두면 그 스크롤도
   똑같이 걸려서, 메뉴를 내리려고 하는 순간 메뉴가 저 스스로를 닫아
   버렸다(실제로 겪은 버그 — 목록 아래쪽 항목에 닿지도 못했다). 스크롤이
   일어난 자리가 메뉴 자신이면 넘어간다. */
window.addEventListener('scroll', (ev) => { if (nbMenuAt && ev.target !== G.$('nbMenu')) nbMenuClose(); }, true);

G.$('ntMemoAddEnd').addEventListener('click', () => {
  const m = G.ntMemoCur();
  if (!m) return;
  nbInsert(m, G.nbBlocks(m).length);
});




export { nbRender };
