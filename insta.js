/* 치즈감자 인스타 편집기(insta.html) — 그날의 세 게시물(주제별 단어 1 · 문법 2)을 우리 자료에서 불러와,
   글자 크기와 위치만 손봐서 PNG 로 받는다. 운영자 요청(2026-10-01): 「Canva 처럼 간단하게, 폰트 크기랑 위치 정도만」.

   - 카드는 <canvas> 에 그린다(1080×1350, 인스타 세로). 화면에 보이는 그대로가 받는 그림이다.
   - 글 덩어리를 누르면 고를 수 있다 → 끌어서 옮기고, 아래 막대로 크기를 바꾼다. 위 덩어리를 키우면 아래가 따라 내려간다.
   - 손본 것은 이 브라우저에 남는다(localStorage) — 같은 게시물을 다시 열면 그대로. 「원래대로」로 되돌린다.
   - 무엇을 올릴지는 insta-pick.js 가 날짜로 정한다(tools/insta-cards.mjs 와 같다). 낱말 · 예문 · 문법은 사이트 자료 그대로. */
import { VOCAB, VOCAB_TOPICS } from './vocab-topik1.js';
import { SB_CATS, SB_MORE } from './sentences.js';
import { GRAMMAR_EN } from './grammar-en.js';
import { GRAMMAR_WORDS } from './grammar-words.js';
import { grammarMarkRe } from './grammar-mark.js';
import { makePicker, todayKst, POS_EN, LV, LINK, wordEn, wordEx, wordsCaption, grammarCaption } from './insta-pick.js';

/* 로마자는 활용기에서 빌린다 — 못 부르면 로마자 줄만 빈다 */
let romanize = () => '';
try { ({ romanize } = await import('./tools/ko-conj.mjs')); } catch { /* 로마자 없이 */ }

const pick = makePicker({ VOCAB, VOCAB_TOPICS, SB_CATS, SB_MORE, GRAMMAR_EN, GRAMMAR_WORDS });
const $ = (id) => document.getElementById(id);
const W = 1080, H = 1350;
const C = { bg: '#F2EEE4', ink: '#1B1512', ink2: '#4E3E31', dim: '#8C7A66', or: '#E1682B', brand: '#F0C24B', soft: '#FBF8F1', pill: '#FDF0E2', card: '#FFFFFF' };
const FONT = '"Pretendard Variable", Pretendard, sans-serif';
/* 카드 안 글 자리 — 위아래 끝 */
const X0 = 148, CW = 784, TOP = 254, BOTTOM = 1128;

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 못 해도 편집은 된다 */ } },
};

/* ───────── 글 덩어리 ───────── */
const R = (t, size, weight = 400, color = C.ink, x = {}) => ({ t: String(t ?? ''), size, weight, color, ...x });
/* 문법 부분에 노란 칠 — 사이트 문법 화면과 같은 찾기 규칙 */
function markRuns(p, text, size, weight = 400, color = C.ink) {
  const re = grammarMarkRe(p.name), s = String(text || ''), out = [];
  if (!re) return [R(s, size, weight, color)];
  let at = 0;
  for (const m of s.matchAll(re)) {
    if (!m[0]) continue;
    if (m.index > at) out.push(R(s.slice(at, m.index), size, weight, color));
    out.push(R(m[0], size, weight, color, { mark: true }));
    at = m.index + m[0].length;
  }
  if (at < s.length) out.push(R(s.slice(at), size, weight, color));
  return out;
}
/* 덩어리: blocks = [[run, …], …](문단마다 줄 바꿈). gap = 앞 덩어리와의 틈. deco: box · bar · pill */
const el = (id, name, blocks, o = {}) => ({ id, name, blocks, gap: 0, lh: 1.3, ...o });

const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
const mctx = cv.getContext('2d');
const fontOf = (r, s) => `${r.italic ? 'italic ' : ''}${r.weight} ${Math.round(r.size * s * 10) / 10}px ${FONT}`;
function setFont(ctx, r, s) { ctx.font = fontOf(r, s); try { ctx.letterSpacing = `${(r.ls || 0) * r.size * s}px`; } catch { /* 옛 브라우저 */ } }

/* 제목 크기 — 한 줄에 들어가는 만큼(max ~ min 사이) */
function fit(text, weight, max, min, ls = 0) {
  setFont(mctx, { weight, size: 100, ls }, 1);
  const w = Math.max(...String(text).split('\n').map((l) => mctx.measureText(l).width)) || 1;
  return Math.round(Math.max(min, Math.min(max, (CW - 8) * 100 / w)));
}

/* 줄 나누기 — 띄어쓰기에서만 나눈다(keep-all). 한 낱말이 폭보다 길면 글자에서 나눈다 */
function layout(e, s) {
  const pad = (e.pad || 0) * s, inner = e.deco === 'bar' ? 44 * s : 0;
  const maxW = e.w - 2 * pad - inner;
  const lines = []; let y = 0, cw = 0;
  e.blocks.forEach((runs, bi) => {
    if (bi) y += (e.bgap ?? 10) * s;
    /* 낱말 단위로 묶기 — 낱말 안에 여러 run(칠한 부분)이 섞일 수 있다 */
    const words = []; let cur = [];
    for (const r of runs) {
      for (const piece of r.t.split(/( +)/)) {
        if (!piece) continue;
        if (/^ +$/.test(piece)) { cur.push({ ...r, t: piece, sp: true }); words.push(cur); cur = []; }
        else cur.push({ ...r, t: piece });
      }
    }
    if (cur.length) words.push(cur);
    let line = { items: [], w: 0, size: 0 };
    const push = () => {
      const h = (line.size || runs[0]?.size * s || 10) * e.lh;
      lines.push({ ...line, y, h }); y += h; cw = Math.max(cw, line.w); line = { items: [], w: 0, size: 0 };
    };
    const width = (p) => { setFont(mctx, p, s); return mctx.measureText(p.t).width; };
    for (const wd of words) {
      const body = wd.filter((p) => !p.sp), bw = body.reduce((n, p) => n + width(p), 0);
      if (line.items.length && line.w + bw > maxW) push();
      for (const p of wd) {
        if (p.sp && !line.items.length) continue;
        let w = width(p);
        if (!p.sp && w > maxW) {   // 너무 긴 낱말 — 글자에서 나눈다
          for (const ch of p.t) {
            const cw1 = width({ ...p, t: ch });
            if (line.items.length && line.w + cw1 > maxW) push();
            line.items.push({ ...p, t: ch, x: line.w }); line.w += cw1; line.size = Math.max(line.size, p.size * s);
          }
          continue;
        }
        line.items.push({ ...p, x: line.w }); line.w += w; line.size = Math.max(line.size, p.size * s);
      }
    }
    if (line.items.length) push();
  });
  /* 줄 끝 띄어쓰기는 폭에서 뺀다 */
  return { lines, cw, ch: y, pad, inner };
}
const boxW = (e, L) => (e.deco === 'pill' || e.shrink ? Math.min(e.w, L.cw + 2 * L.pad + L.inner) : e.w);

/* 덩어리 하나 그리기 (x, y = 바깥 왼쪽 위) */
function drawEl(ctx, e, L, x, y) {
  const bw = boxW(e, L), bh = L.ch + 2 * L.pad;
  if (e.deco === 'box' || e.deco === 'pill') {
    ctx.fillStyle = e.fill || C.soft;
    ctx.beginPath(); ctx.roundRect(x, y, bw, bh, e.deco === 'pill' ? bh / 2 : (e.r || 28)); ctx.fill();
  }
  if (e.deco === 'bar') { ctx.fillStyle = C.brand; ctx.fillRect(x, y + 4, 10, bh - 8); }
  ctx.textBaseline = 'alphabetic';
  for (const ln of L.lines) {
    const base = y + L.pad + ln.y + ln.h / 2 + ln.size * 0.34;
    for (const it of ln.items) {
      setFont(ctx, it, e.s);
      const tx = x + L.pad + L.inner + it.x, tw = ctx.measureText(it.t).width, sz = it.size * e.s;
      if (it.mark && !it.sp) { ctx.fillStyle = 'rgba(240,194,75,.75)'; ctx.fillRect(tx - 3, base - sz * 0.3, tw + 6, sz * 0.42); }
      ctx.fillStyle = it.color; ctx.fillText(it.t, tx, base);
    }
  }
  return { w: bw, h: bh };
}

/* ───────── 카드 틀(못 옮김) ───────── */
const logo = new Image(); logo.src = 'logo-clear.png';
function drawFrame(ctx, tag, page) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  /* 머리 — 꼬리표 · 쪽 */
  setFont(ctx, { weight: 800, size: 30 }, 1);
  const tw = ctx.measureText(tag).width + 26 + 52;
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(84, 84, tw, 62, 31); ctx.fill();
  ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(84 + 26 + 8, 115, 8, 0, 7); ctx.fill();
  ctx.fillStyle = C.bg; ctx.textBaseline = 'middle'; ctx.fillText(tag, 84 + 26 + 26, 116);
  setFont(ctx, { weight: 700, size: 28 }, 1); ctx.fillStyle = C.dim; ctx.textAlign = 'right'; ctx.fillText(page, W - 84, 116); ctx.textAlign = 'left';
  /* 흰 카드 */
  ctx.fillStyle = C.card; ctx.beginPath(); ctx.roundRect(84, 190, W - 168, BOTTOM + 64 - 190, 44); ctx.fill();
  /* 발 — 로고 · 주소 */
  ctx.fillStyle = 'rgba(27,21,18,.1)'; ctx.fillRect(0, H - 118, W, 2);
  if (logo.complete && logo.naturalWidth) { const lh = 62, lw = logo.naturalWidth * lh / logo.naturalHeight; ctx.drawImage(logo, 84, H - 59 - lh / 2, lw, lh); setFont(ctx, { weight: 900, size: 36, ls: -0.03 }, 1); ctx.fillStyle = C.ink; ctx.fillText('치즈감자', 84 + lw + 18, H - 57); }
  else { setFont(ctx, { weight: 900, size: 36 }, 1); ctx.fillStyle = C.ink; ctx.fillText('치즈감자', 84, H - 57); }
  setFont(ctx, { weight: 700, size: 30 }, 1); ctx.fillStyle = C.dim; ctx.textAlign = 'right'; ctx.fillText('everykoreans.com', W - 84, H - 57); ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

/* ───────── 장 만들기 ───────── */
const hint = (t) => el('hint', '넘기기 안내', [[R(t, 34, 700, C.or)]], { bottom: true });
function wordsSlides(t, ws) {
  const tag = '주제별 단어 · Words by topic', n = ws.length + 1;
  return [
    { tag, page: `1 / ${n}`, els: [
      el('hook', '맨 위 한 줄', [[R('한국어 단어 5개 · 5 Korean words', 44, 900, C.or)]]),
      el('topic', '주제', [[R(t.ko, fit(t.ko, 900, 150, 96, -0.04), 900, C.ink, { ls: -0.04 })]], { gap: 14, lh: 1.12 }),
      el('topicEn', '주제 영어', [[R(t.en, 58, 800, C.ink2)]], { gap: 6, lh: 1.2 }),
      ...ws.map((w, i) => el(`w${i}`, `낱말 ${i + 1}`, [[R(`${i + 1}`, 30, 800, C.or), R('   ', 30), R(w.h, 44, 800), R('   ', 30), R(wordEn(w), 30, 400, C.dim)]],
        { deco: 'box', pad: 14, r: 22, gap: i ? 10 : 30, lh: 1.2 })),
      hint('하나씩 보기 → · Swipe'),
    ] },
    ...ws.map((w, i) => ({ tag, page: `${i + 2} / ${n}`, els: [
      el('lv', '주제 이름', [[R(`${t.ko} · ${t.en}`, 30, 700, C.or)]]),
      el('big', '낱말', [[R(w.h, fit(w.h, 900, 230, 110, -0.05), 900, C.ink, { ls: -0.05 })]], { gap: 8, lh: 1.1 }),
      el('rom', '로마자', [[R(romanize(w.h) || '', 46, 400, C.dim, { italic: true })]], { gap: 8 }),
      el('en', '영어 뜻', [[R(wordEn(w), 76, 800)]], { gap: 34, lh: 1.2 }),
      el('pos', '품사', [[R(`${w.p} · ${POS_EN[w.p] || ''}`, 30, 700, C.ink2)]], { deco: 'pill', fill: C.pill, pad: 12, gap: 26 }),
      el('ex', '예문', [[R(wordEx(w)[0], 48, 700)], [R(wordEx(w)[1], 31, 400, C.dim)]], { deco: 'bar', bottom: true, lh: 1.4 }),
    ] })),
  ];
}
function grammarSlides(p) {
  const en = pick.en(p), more = pick.more(p), words = pick.gw(p), tag = '오늘의 문법 · Grammar';
  const names = p.name.split(', ');
  const gs = fit(names.slice().sort((a, b) => b.length - a.length)[0], 900, 180, 84, -0.04);
  const exs = [p.ex, more[3]].filter(Boolean).slice(0, 2);
  return [
    { tag, page: '1 / 3', els: [
      el('lv', '급', [[R(LV[p.lv] || '', 30, 700, C.or)]]),
      el('gname', '문법 이름', names.map((nm, i) => [R(nm + (i < names.length - 1 ? ',' : ''), gs, 900, C.ink, { ls: -0.04 })]), { gap: 14, lh: 1.1, bgap: 0 }),
      ...(en.desc ? [el('gen', '영어 뜻', [[R(en.desc.split(/(?<=\.)\s/)[0], 58, 800)]], { gap: 34, lh: 1.25 })] : []),
      el('gdesc', '한국어 설명', [[R(p.desc, 40, 600, C.ink2)]], { gap: 30, lh: 1.4 }),
      el('form', '형태', [[R(more[0] || en.form || '', 38, 400, C.ink2)]], { deco: 'box', pad: 36, gap: 40, lh: 1.5 }),
      hint('예문 보기 → · Swipe'),
    ] },
    { tag, page: '2 / 3', els: [
      el('h2', '소제목', [[R('예문 · EXAMPLES', 34, 800, C.dim, { ls: 0.04 })]]),
      ...exs.map((x, i) => el(`ex${i}`, `예문 ${i + 1}`, [markRuns(p, x, 46, 700)], { deco: 'bar', gap: i ? 30 : 40, lh: 1.45 })),
      ...(en.care ? [el('care', '주의', [[R(`⚠️ ${en.care}`, 36, 400, C.ink2)]], { deco: 'box', pad: 36, bottom: true, lh: 1.5 })] : []),
    ] },
    { tag, page: '3 / 3', els: [
      el('h2', '소제목', [[R('같이 쓰는 말 · WORDS THAT GO WITH IT', 34, 800, C.dim, { ls: 0.04 })]]),
      ...words.slice(0, 3).map(([w, ex, wen], i) => el(`gw${i}`, `같이 쓰는 말 ${i + 1}`,
        [[R(w, 40, 800), R('   ', 28), R(wen, 28, 400, C.dim)], markRuns(p, ex, 38)], { deco: 'box', pad: 32, gap: i ? 28 : 40, lh: 1.4 })),
    ] },
  ];
}

/* ───────── 상태 ───────── */
const S = { day: todayKst(), post: 0, slide: 0, sel: null, posts: [], ov: {} };
const ovKey = (post) => `insta:ov:${post.key}`;
function loadPosts() {
  const d = pick.day(S.day), choice = store.get(`insta:choice:${S.day}`, {});
  const topic = pick.TOPICS.find((t) => t.key === choice.topic) || d.topic;
  const page = choice.page ?? (topic === d.topic ? null : 0);
  const ws = page == null ? d.words : pick.topicWords(topic, page);
  const g = [0, 1].map((i) => pick.ALL_GRAMS.find((p) => p.id === choice[`g${i}`]) || d.grams[i]);
  S.posts = [
    { name: `단어 · ${topic.ko}`, file: '1-words', key: `w:${topic.key}:${ws.map((w) => w.h).join(',')}`, topic, words: ws, slides: wordsSlides(topic, ws), caption: wordsCaption(topic, ws, romanize) },
    ...g.map((p, i) => ({ name: `문법 ${i + 1} · ${p.name}`, file: `${i + 2}-grammar`, key: `g:${p.id}`, gram: p, slides: grammarSlides(p), caption: grammarCaption(p, pick) })),
  ];
  S.posts.forEach((p) => { S.ov[p.key] = store.get(ovKey(p), {}); });
}
const ovOf = (post, si, id) => ((S.ov[post.key] ||= {})[si] ||= {})[id] ||= { dx: 0, dy: 0, s: 1 };
const ovPeek = (post, si, id) => S.ov[post.key]?.[si]?.[id] || { dx: 0, dy: 0, s: 1 };
const saveOv = (post) => store.set(ovKey(post), S.ov[post.key] || {});

/* 자리 잡기 — 위에서부터 쌓고(크기 바꾼 것을 따라), 아래 붙은 것은 아래에서부터. 그다음 옮긴 만큼 더한다 */
function place(post, si) {
  const sl = post.slides[si], out = [];
  let y = TOP;
  for (const e0 of sl.els.filter((e) => !e.bottom)) {
    const o = ovPeek(post, si, e0.id), e = { ...e0, w: CW, s: o.s }, L = layout(e, e.s);
    y += (e.gap || 0) * 1; out.push({ e, L, x: X0 + o.dx, y: y + o.dy }); y += L.ch + 2 * L.pad;
  }
  /* 아래 붙은 것 — 위 글이 길어 닿으면 위 글 바로 밑으로 밀린다(겹치지 않게) */
  const bot = sl.els.filter((e) => e.bottom).map((e0) => { const o = ovPeek(post, si, e0.id), e = { ...e0, w: CW, s: o.s }; return { e, o, L: layout(e, e.s) }; });
  const total = bot.reduce((n, b) => n + b.L.ch + 2 * b.L.pad, 0) + 24 * Math.max(0, bot.length - 1);
  let yb = Math.max(BOTTOM - total, y + 28);
  for (const { e, o, L } of bot) { out.push({ e, L, x: X0 + o.dx, y: yb + o.dy }); yb += L.ch + 2 * L.pad + 24; }
  return out;
}

/* 글꼴 — Pretendard 는 글자 범위마다 파일이 나뉘어 있어, 그릴 글자를 먼저 불러 둔다 */
async function fontsFor(post) {
  const need = new Map();
  for (const sl of post.slides) for (const e of sl.els) for (const b of e.blocks) for (const r of b) {
    const f = fontOf(r, 1); need.set(f, (need.get(f) || '') + r.t);
  }
  need.set(fontOf({ weight: 800, size: 30 }, 1), post.slides.map((s) => s.tag).join('') + '치즈감자everykoreans.com0123456789/ ');
  need.set(fontOf({ weight: 900, size: 36 }, 1), '치즈감자');
  await Promise.all([...need].map(([f, t]) => document.fonts.load(f, t).catch(() => null)));
}

function render(ctx, post, si, withSel) {
  const sl = post.slides[si];
  drawFrame(ctx, sl.tag, sl.page);
  const placed = place(post, si);
  for (const p of placed) p.box = { x: p.x, y: p.y, ...drawEl(ctx, p.e, p.L, p.x, p.y) };
  if (withSel && S.sel) {
    const p = placed.find((q) => q.e.id === S.sel);
    if (p) { ctx.save(); ctx.strokeStyle = '#2F6FD1'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.strokeRect(p.box.x - 10, p.box.y - 10, p.box.w + 20, p.box.h + 20); ctx.restore(); }
  }
  return placed;
}

/* ───────── 화면 ───────── */
const main = $('cv'), ctx = main.getContext('2d');
main.width = W; main.height = H;
let placed = [];
const cur = () => S.posts[S.post];

function draw() {
  placed = render(ctx, cur(), S.slide, true);
  drawThumbs();
  drawControls();
}
function drawThumbs() {
  const post = cur(), box = $('thumbs');
  if (box.children.length !== post.slides.length || box.dataset.key !== post.key) {
    box.dataset.key = post.key;
    box.innerHTML = post.slides.map((_, i) => `<button class="th" data-i="${i}"><canvas width="216" height="270"></canvas><span>${i + 1}</span></button>`).join('');
  }
  [...box.children].forEach((b, i) => {
    b.classList.toggle('on', i === S.slide);
    const c = b.querySelector('canvas').getContext('2d');
    c.save(); c.scale(216 / W, 270 / H); render(c, post, i, false); c.restore();
  });
}
function drawControls() {
  const p = placed.find((q) => q.e.id === S.sel);
  $('selbox').hidden = !p; $('nosel').hidden = !!p;
  if (!p) return;
  const o = ovPeek(cur(), S.slide, S.sel);
  $('selname').textContent = p.e.name;
  $('size').value = Math.round(o.s * 100);
  $('sizev').textContent = `${Math.round(o.s * 100)}% · ${Math.round(Math.max(...p.e.blocks.flat().map((r) => r.size)) * o.s)}px`;
}
function drawTabs() {
  $('tabs').innerHTML = S.posts.map((p, i) => {
    const done = store.get(`insta:done:${S.day}:${p.file}`, false);
    return `<button class="tab${i === S.post ? ' on' : ''}" data-i="${i}">${done ? '✅ ' : ''}${esc(p.name)}</button>`;
  }).join('');
  const post = cur();
  /* 바꾸기 — 단어는 주제 · 다른 다섯 낱말, 문법은 표현 */
  $('swap').innerHTML = post.topic
    ? `<label>주제 <select id="pickTopic">${pick.TOPICS.map((t) => `<option value="${t.key}"${t === post.topic ? ' selected' : ''}>${esc(t.ko)} · ${esc(t.en)} (${t.words.length})</option>`).join('')}</select></label>
       <button id="nextWords" class="ghost">다른 낱말 5개</button>`
    : `<label>문법 <select id="pickGram">${['beginner', 'intermediate', 'advanced'].map((lv) => `<optgroup label="${LV[lv]}">${pick.ALL_GRAMS.filter((g) => g.lv === lv).map((g) => `<option value="${g.id}"${g === post.gram ? ' selected' : ''}>${esc(g.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>`;
  $('caption').value = `${post.caption}`;
  $('done').checked = store.get(`insta:done:${S.day}:${post.file}`, false);
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function open() {
  loadPosts();
  S.post = Math.min(S.post, 2); S.slide = 0; S.sel = null;
  drawTabs();
  await Promise.all(S.posts.map(fontsFor));
  draw();
}

/* 끌어서 옮기기 */
let drag = null;
const toCanvas = (ev) => { const r = main.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height }; };
main.addEventListener('pointerdown', (ev) => {
  const { x, y } = toCanvas(ev);
  const hit = placed.slice().reverse().find((p) => x >= p.box.x - 10 && x <= p.box.x + p.box.w + 10 && y >= p.box.y - 10 && y <= p.box.y + p.box.h + 10);
  S.sel = hit ? hit.e.id : null;
  if (hit) { const o = ovOf(cur(), S.slide, S.sel); drag = { x, y, dx: o.dx, dy: o.dy }; main.setPointerCapture(ev.pointerId); }
  draw();
});
main.addEventListener('pointermove', (ev) => {
  if (!drag) return;
  const { x, y } = toCanvas(ev), o = ovOf(cur(), S.slide, S.sel);
  o.dx = Math.round(drag.dx + x - drag.x); o.dy = Math.round(drag.dy + y - drag.y);
  if (Math.abs(o.dx) < 8) o.dx = 0;   // 왼쪽 줄에 착 붙게
  draw();
});
const endDrag = () => { if (drag) { drag = null; saveOv(cur()); } };
main.addEventListener('pointerup', endDrag); main.addEventListener('pointercancel', endDrag);

/* 화살표로 1px(Shift 10px) */
document.addEventListener('keydown', (ev) => {
  if (!S.sel || /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName)) return;
  const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
  if (!k) { if (ev.key === 'Escape') { S.sel = null; draw(); } return; }
  ev.preventDefault();
  const o = ovOf(cur(), S.slide, S.sel), n = ev.shiftKey ? 10 : 1;
  o.dx += k[0] * n; o.dy += k[1] * n; saveOv(cur()); draw();
});

function setSize(pct) {
  const o = ovOf(cur(), S.slide, S.sel);
  o.s = Math.max(0.4, Math.min(2.5, pct / 100)); saveOv(cur()); draw();
}
$('size').addEventListener('input', (ev) => setSize(+ev.target.value));
$('smaller').onclick = () => setSize(Math.round(ovPeek(cur(), S.slide, S.sel).s * 100) - 5);
$('bigger').onclick = () => setSize(Math.round(ovPeek(cur(), S.slide, S.sel).s * 100) + 5);
$('resetEl').onclick = () => { delete S.ov[cur().key]?.[S.slide]?.[S.sel]; saveOv(cur()); draw(); };
$('resetSlide').onclick = () => { if (S.ov[cur().key]) delete S.ov[cur().key][S.slide]; saveOv(cur()); S.sel = null; draw(); };

$('tabs').addEventListener('click', (ev) => {
  const b = ev.target.closest('.tab'); if (!b) return;
  S.post = +b.dataset.i; S.slide = 0; S.sel = null; drawTabs(); draw();
});
$('thumbs').addEventListener('click', (ev) => {
  const b = ev.target.closest('.th'); if (!b) return;
  S.slide = +b.dataset.i; S.sel = null; draw();
});
$('swap').addEventListener('change', async (ev) => {
  const c = store.get(`insta:choice:${S.day}`, {});
  if (ev.target.id === 'pickTopic') { c.topic = ev.target.value; c.page = 0; }
  if (ev.target.id === 'pickGram') c[`g${S.post - 1}`] = ev.target.value;
  store.set(`insta:choice:${S.day}`, c); await open();
});
$('swap').addEventListener('click', async (ev) => {
  if (ev.target.id !== 'nextWords') return;
  const c = store.get(`insta:choice:${S.day}`, {});
  const t = cur().topic, i = t.words.indexOf(cur().words[0]);
  c.topic = t.key; c.page = Math.floor(Math.max(0, i) / 5) + 1;
  store.set(`insta:choice:${S.day}`, c); await open();
});
$('resetDay').onclick = async () => { store.set(`insta:choice:${S.day}`, {}); await open(); };
$('day').value = S.day;
$('day').addEventListener('change', async (ev) => { S.day = ev.target.value || todayKst(); S.post = 0; await open(); });
$('done').addEventListener('change', (ev) => { store.set(`insta:done:${S.day}:${cur().file}`, ev.target.checked); drawTabs(); });
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText($('caption').value); $('copy').textContent = '복사했어요 ✓'; }
  catch { $('caption').select(); document.execCommand('copy'); $('copy').textContent = '복사했어요 ✓'; }
  setTimeout(() => { $('copy').textContent = '캡션 복사'; }, 1500);
};
$('link').textContent = LINK;

/* 받기 — 지금 장 PNG, 또는 이 게시물 전부 ZIP */
const pngOf = (post, si) => new Promise((ok) => {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  render(c.getContext('2d'), post, si, false); c.toBlob(ok, 'image/png');
});
const save = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
$('png').onclick = async () => save(await pngOf(cur(), S.slide), `${S.day}-${cur().file}-${S.slide + 1}.png`);
$('zip').onclick = async () => {
  const post = cur(), zip = new window.JSZip();
  for (let i = 0; i < post.slides.length; i++) zip.file(`${S.day}-${post.file}-${i + 1}.png`, await pngOf(post, i));
  zip.file(`${S.day}-${post.file}-caption.txt`, $('caption').value);
  save(await zip.generateAsync({ type: 'blob' }), `${S.day}-${post.file}.zip`);
};

logo.onload = () => { if (S.posts.length) draw(); };
await open();
