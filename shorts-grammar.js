/* 쇼츠 촬영소 — 문법 소개 슬라이드(운영자 요청 2026-10-05: 「문법도 우리가 가진 내용을 바탕으로, 소개하는 느낌으로」)
   한 문법(예문 만들기의 표현 하나)을 세로 슬라이드 몇 장으로 만든다. 운영자는 → 로 넘기며 설명하고, 형광펜 · 펜으로 긋는다.
     0 표지 → 1 뜻 → 2 모양 → 3 예문 → 4 주의 → 5 대화 → 6 직접 해 보기
   자료: sentences.js(이름 · 뜻 · 예문 · more · 대화) · grammar-en.js(영어) · grammar-usage.js(연습 문장) ·
         grammar-words.js(같이 알면 좋은 단어) · grammar-drill.js(바꾸기) · grammar-mark.js(예문 속 문법 칠하기).
   없는 칸은 그 슬라이드를 건너뛴다. 글이 길면 슬라이드마다 글자를 줄여 SAFE 안에 반드시 넣는다. */
import { SB_CATS, SB_MORE } from './sentences.js';
import { GRAMMAR_EN } from './grammar-en.js';
import { GRAMMAR_PRACTICE } from './grammar-usage.js';
import { GRAMMAR_WORDS } from './grammar-words.js';
import { GRAMMAR_DRILL } from './grammar-drill.js';
import { grammarMarkRe } from './grammar-mark.js';

/* 쇼츠 · 릴스 · 틱톡이 가리는 곳(위 약 220 · 아래 약 440 · 오른쪽 약 140)을 비운다 — shorts.js SAFE 와 같다 */
const W = 1080, H = 1920, X = 64, R = W - 140, CW = R - X, TOP = 230, BOTTOM = 1480;
const FONT = '"Pretendard Variable", Pretendard, sans-serif';
const C = { bg: '#F7F3EA', card: '#FFFFFF', line: '#D9D1C2', ink: '#1B1512', ink2: '#4E3E31', dim: '#8C7A66', or: '#E1682B', mark: 'rgba(255, 221, 0, .7)', warnBg: '#FFF1E8' };
const LV = { beginner: ['초급', 'Beginner'], intermediate: ['중급', 'Intermediate'], advanced: ['고급', 'Advanced'] };
const CAT = new Map(SB_CATS.flatMap((c) => c.points.map((p) => [p.id, c])));

export const GRAMMAR_POINTS = SB_CATS.flatMap((c) => c.points.map((p) => ({ ...p, cat: c.ko })));
export const levelOf = (p) => LV[p.lv] || LV.beginner;

/* more[2] 는 「한국어 설명. English explanation.」 — 문장마다 나눠 한글이 영어 글자보다 많은 문장만 남긴다
   (영어가 「-고」 같은 한국어 인용으로 시작하는 문장도 있어서, 대문자 자리로 자르면 영어가 섞인다) */
const koPart = (t) => t.split(/(?<=[.!?])\s+/).filter((x) => (x.match(/[가-힣]/g) || []).length > (x.match(/[A-Za-z]/g) || []).length).join(' ').trim();

export function grammarSlides(p) {
  const en = GRAMMAR_EN[p.id] || {}, more = p.more || SB_MORE?.[p.id] || [];
  const mark = grammarMarkRe(p.name);
  const practice = (GRAMMAR_PRACTICE[p.id] || []).filter((x) => x[0] !== p.ex);
  const S = [{ k: 'cover' }];
  if (p.desc) S.push({ k: 'mean', title: '뜻', en: 'Meaning', ko: p.desc, sub: en.desc });
  const form = more[0] || en.form;
  const drill = GRAMMAR_DRILL[p.id];
  if (form || drill) S.push({ k: 'form', title: '모양', en: 'Form', form, rows: drill ? drill.x.slice(0, 4) : [], with: !drill && more[1] ? more[1] : '' });
  const exs = [[p.ex], ...practice].filter((x) => x[0]).slice(0, 3);
  if (exs.length) S.push({ k: 'ex', title: '예문', en: 'Examples', exs });
  const care = more[2] ? koPart(more[2]) : '';
  if (care || en.care) S.push({ k: 'care', title: '주의', en: 'Watch out', ko: care, sub: en.care });
  if (p.dlg?.length) S.push({ k: 'dlg', title: '대화', en: 'Dialogue', lines: p.dlg });
  const words = (GRAMMAR_WORDS[p.id] || []).slice(0, 4);
  S.push({ k: 'try', title: '직접 해 보세요', en: 'Your turn', words });
  return S.map((s) => ({ ...s, p, mark }));
}

/* ── 그리기 도구 ── */
const font = (ctx, size, weight = 600) => { ctx.font = `${weight} ${Math.round(size)}px ${FONT}`; };
function wrap(ctx, text, width) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width <= width || !line) line = t; else { out.push(line); line = w; }
      while (ctx.measureText(line).width > width && line.length > 1) {   // 띄어쓰기 없이 긴 낱말
        let n = line.length; while (n > 1 && ctx.measureText(line.slice(0, n)).width > width) n--;
        out.push(line.slice(0, n)); line = line.slice(n);
      }
    }
    out.push(line);
  }
  return out;
}
function rr(ctx, x, y, w, h, r, fill, stroke, lw = 3) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
/* 글 한 줄 — mark(정규식)에 걸린 곳 밑에 노란 형광펜을 먼저 깔고 글을 쓴다 */
function lineWithMark(ctx, l, x, y, size, color, re, sweep = 1) {
  if (re && sweep > 0) {
    re.lastIndex = 0; let m;
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = C.mark;
    while ((m = re.exec(l))) {
      const a = ctx.measureText(l.slice(0, m.index)).width, b = ctx.measureText(l.slice(0, m.index + m[0].length)).width;
      /* sweep: 형광펜이 왼쪽에서 오른쪽으로 그어지는 애니메이션(0 → 1) */
      ctx.beginPath(); ctx.roundRect(x + a - 4, y - size * 0.78, (b - a + 8) * sweep, size * 0.98, 8); ctx.fill();
      if (!m[0].length) re.lastIndex++;
    }
    ctx.restore();
  }
  ctx.fillStyle = color; ctx.fillText(l, x, y);
}

/* 덩어리 목록으로 배치한다 — 글자 배율 s 를 1.5 → floor 로 줄여 가며 BOTTOM 안에 드는 첫 배율로 그린다(못 들면 null).
   floor 0.8 = 본문 46px 이상 · 영어 34px 이상(폰에서 약 16pt · 12pt — 운영자 「보기 편하게」).
   덩어리: { t: 글, size, weight, color, lh, gap, mark, card: 'white'|'warn'|null, pad, align, side } */
const FLOOR = 0.8;
function flow(ctx, blocks, y0, floor = FLOOR) {
  for (let s = 1.5; s >= floor - 1e-9; s -= 0.03) {
    let y = y0; const laid = [];
    for (const b of blocks) {
      if (b.space) { y += b.space * s; continue; }
      const size = b.size * s, lh = size * (b.lh || 1.45), pad = (b.pad || 0) * s, bw = b.w || CW;
      font(ctx, size, b.weight); const ls = wrap(ctx, b.t, bw - pad * 2);
      const h = ls.length * lh + pad * 2 - (b.card ? lh - size * 1.15 : 0);
      laid.push({ b, ls, size, lh, pad, y, h, bw }); y += h + (b.gap ?? 20) * s;
    }
    if (y <= BOTTOM) {
      /* 남는 자리가 있으면 위아래 가운데로 — 짧은 장이 위에만 몰려 아래가 텅 비지 않게 */
      const dy = Math.max(0, (BOTTOM - y) / 2);
      for (const l of laid) l.y += dy;
      laid.fit = true; return laid;
    }
  }
  return null;
}
/* ── 애니메이션(운영자 요청 2026-10-05: 「장마다 애니메이션」) ──
   t = 그 장이 뜬 뒤 지난 ms. 덩어리마다 STEP ms 씩 늦게, RISE ms 동안 아래에서 올라오며 나타난다.
   형광펜은 그 덩어리가 다 올라온 뒤 SWEEP ms 동안 왼쪽 → 오른쪽으로 그어진다. t 가 Infinity 면 다 된 그림(표지 사진). */
export const STEP = 160, RISE = 420, SWEEP = 450;
const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
export const animEnd = (n) => n * STEP + RISE + SWEEP + 100;   // 이 장의 움직임이 끝나는 때(그때까지 다시 그린다)
function paint(ctx, laid, t = Infinity) {
  laid.forEach(({ b, ls, size, lh, pad, y, h, bw }, k) => {
    const p = ease((t - k * STEP) / RISE), sw = ease((t - k * STEP - RISE * 0.8) / SWEEP);
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 46);
    const x0 = b.side === 'B' ? R - bw : X;
    /* 칸 모양: white(기본) · soft(연한) · warn(주의, 주황) · ok(정답, 초록) · note(풀이, 노랑) */
    const CARDS = { warn: [C.warnBg, '#F2B48E', 3], soft: ['#FBF8F1', C.line, 3], ok: ['#DDF3E5', '#2E9B5B', 5], note: ['#FFF6D6', '#E8C969', 3] };
    if (b.card) { const [f, st, lw] = CARDS[b.card] || [C.card, C.line, 3]; rr(ctx, x0, y, bw, h, 22, f, st, lw); }
    if (b.card === 'ok' && !b.color) b = { ...b, color: '#1E7A45' };
    font(ctx, size, b.weight);
    ls.forEach((l, i) => {
      const ty = y + pad + size + i * lh - size * 0.12;
      const lx = b.align === 'center' ? W / 2 - ctx.measureText(l).width / 2 + (X - (W - R)) / 2 : x0 + pad;
      lineWithMark(ctx, l, lx, ty, size, b.color || C.ink, b.mark, sw);
    });
    ctx.restore();
  });
}

function header(ctx, label, idx, n, logo, t = Infinity) {
  font(ctx, 34, 800); ctx.fillStyle = C.or;
  if (logo) ctx.drawImage(logo, X, TOP - 14, 60, 60 * logo.height / logo.width);
  ctx.fillText('치즈감자', X + (logo ? 70 : 0), TOP + 32);
  font(ctx, 32, 700); ctx.fillStyle = C.dim; ctx.textAlign = 'right'; ctx.fillText(`${label} · ${idx} / ${n - 1}`, R, TOP + 32); ctx.textAlign = 'left';
  /* 진행 막대 — 몇 번째 장인지(쇼츠는 길이를 모르고 보므로 「곧 끝난다」가 보이면 끝까지 본다) */
  const gap = 10, bw = (CW - gap * (n - 2)) / Math.max(1, n - 1);
  for (let i = 1; i < n; i++) {
    rr(ctx, X + (i - 1) * (bw + gap), TOP + 60, bw, 10, 5, i < idx ? C.or : C.line);
    if (i === idx) rr(ctx, X + (i - 1) * (bw + gap), TOP + 60, Math.max(10, bw * ease(t / 500)), 10, 5, C.or);   // 이번 칸이 차오른다
  }
}
/* 장 이름(뜻 · 모양 …) 칩 + 문법 이름 — 이름은 한 줄에 다 들어가게 글자를 줄인다(… 로 자르지 않는다) */
function titleRow(ctx, title, name, y) {
  font(ctx, 36, 800); const w = ctx.measureText(title).width + 52;
  rr(ctx, X, y, w, 66, 33, C.or); ctx.fillStyle = '#fff'; ctx.fillText(title, X + 26, y + 46);
  let s = 44; for (; s > 30; s -= 2) { font(ctx, s, 800); if (ctx.measureText(name).width <= CW - w - 24) break; }
  ctx.fillStyle = C.ink2; ctx.textAlign = 'right'; ctx.fillText(name, R, y + 47); ctx.textAlign = 'left';
  return y + 110;
}

/* ── 다른 갈래(TOPIK 듣기 · 쓰기)도 같은 틀로 그린다 — 머리 · 진행 막대 · 장 이름 칩 · 덩어리 · 움직임 · 바닥 크기 ──
   card = { label: '듣기 15번', title: '문제', name: 'TOPIK I 듣기', variants: [덩어리 목록, 더 줄인 목록 …], extra(ctx, t, laid) } */
export const CARD = { X, R, CW, TOP, BOTTOM, C };
export function cardFits(ctx, blocks) { return !!flow(ctx, blocks, TOP + 210); }
export function drawCard(ctx, card, idx, n, { logo = null, t = Infinity } = {}) {
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  header(ctx, card.label, idx, n, logo, t);
  const y = titleRow(ctx, card.title, card.name, TOP + 100);
  let laid = null, ok = true;
  for (const B of card.variants) if ((laid = flow(ctx, B, y))) break;
  if (!laid) { ok = false; laid = flow(ctx, card.variants.at(-1), y, 0.4) || []; }
  paint(ctx, laid, t);
  card.extra?.(ctx, t, laid);
  ctx.restore();
  return ok;
}
/* 표지(문법 표지와 같은 틀) — { chip, name, hook, card(맛보기 글), mark, foot } */
export function drawCoverCard(ctx, c, { logo = null, t = Infinity } = {}) {
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const ok = coverDraw(ctx, c, logo, t);
  ctx.restore(); return ok;
}

/* 장마다 덩어리 — lean 0 은 다 넣고, 1 은 영어 줄을 빼고, 2 는 개수를 줄인다(그래도 바닥 크기 아래로는 안 줄인다) */
function blocksFor(sl, lean) {
  /* 영어 줄은 넣지 않는다(운영자 2026-10-05: 「영어는 있다 말고 — 내가 말할 테니 빼」). 낱말 뜻(meal 등)만 남긴다 — 모든 낱말에 있다 */
  /* 초급만 「뜻」 · 「주의」 장에 영어 한 줄(운영자 2026-10-06: 「초급은 문법 설명이랑 주의할 부분만 영어」) — 112개 모두 영어가 있어 빠지는 장이 없다.
     예문 · 대화는 한국어만. 넘치면(lean 1 부터) 영어 줄을 덜어 낸다 */
  const p = sl.p, B = [], en = false, enHelp = p.lv === 'beginner' && lean < 1, few = lean >= 2;
  if (sl.k === 'mean') {
    B.push({ t: p.name, size: 100, weight: 900, gap: 34 });
    B.push({ t: sl.ko, size: 62, weight: 700, lh: 1.5, gap: 36 });
    if (sl.sub && enHelp) B.push({ t: sl.sub, size: 44, weight: 500, color: C.dim });
  } else if (sl.k === 'form') {
    if (sl.form) B.push({ t: sl.form, size: 66, weight: 800, card: 'white', pad: 40, gap: 34 });
    for (const [a, b] of sl.rows.slice(0, few ? 3 : 4)) B.push({ t: `${a}  →  ${b}`, size: 60, weight: 700, card: 'soft', pad: 26, gap: 14, mark: sl.mark });
    if (sl.with && !few) B.push({ space: 20 }, { t: '자주 같이 쓰는 말', size: 44, weight: 800, color: C.dim, gap: 10 }, { t: sl.with, size: 56, weight: 700 });
  } else if (sl.k === 'ex') {
    const exs = sl.exs.slice(0, few ? 2 : 3);
    exs.forEach(([ko, e], i) => {
      B.push({ t: ko, size: 60, weight: 700, card: 'white', pad: 34, gap: e && en ? 10 : 30, mark: sl.mark });
      if (e && en) B.push({ t: e, size: 42, weight: 500, color: C.dim, gap: i < exs.length - 1 ? 30 : 0 });
    });
  } else if (sl.k === 'care') {
    if (sl.ko) B.push({ t: '⚠️ ' + sl.ko, size: 60, weight: 700, card: 'warn', pad: 40, lh: 1.5, gap: 30, mark: sl.mark });
    if (sl.sub && enHelp) B.push({ t: sl.sub, size: 44, weight: 500, color: C.dim });
  } else if (sl.k === 'dlg') {
    sl.lines.forEach((l) => { const m = l.match(/^([AB])\s*[:：]\s*/); const who = m?.[1] || 'A';
      B.push({ t: l.replace(/^[AB]\s*[:：]\s*/, ''), size: 58, weight: 600, card: who === 'B' ? 'soft' : 'white', pad: 32, w: CW * 0.88, side: who, gap: 24, mark: sl.mark }); });
  } else if (sl.k === 'try') {
    B.push({ t: sl.words.length ? '이 낱말로 문장을 만들어 보세요' : '이 문법으로 문장을 만들어 보세요', size: 64, weight: 800, gap: 30 });
    for (const w of sl.words.slice(0, few ? 3 : 4)) B.push({ t: w[2] ? `${w[0]}  ·  ${w[2]}` : w[0], size: 58, weight: 700, card: 'white', pad: 28, gap: 14 });
    B.push({ space: 30 }, { t: '댓글로 남겨 주면 확인해 줄게요 👇', size: 54, weight: 800, color: C.or, gap: 20 },
      { t: 'everykoreans.com', size: 44, weight: 700, color: C.dim });
  }
  return B;
}

/* 한 장 그리기 — 다 들어갔으면 true(검사가 290개 × 모든 장을 센다) */
export function drawGrammarSlide(ctx, slides, idx, { logo = null, hook = '', t = Infinity } = {}) {
  const sl = slides[idx], p = sl.p;
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  if (sl.k === 'cover') { const [ko, en] = levelOf(p);
    const ok = coverDraw(ctx, { chip: `${ko} 문법 · ${en}`, name: p.name, hook: hook || '이 문법, 1분이면 끝!', card: p.ex || '', mark: sl.mark, foot: `everykoreans.com · ${CAT.get(p.id)?.ko || ''}` }, logo, t);
    ctx.restore(); return ok; }
  header(ctx, `${levelOf(p)[0]} 문법`, idx, slides.length, logo, t);
  const y = titleRow(ctx, sl.title, p.name, TOP + 100);
  /* 다 넣은 것부터 바닥 크기로 들어가는 첫 판 — 셋 다 안 되면(검사로는 0개) 마지막 판을 더 작게 */
  let laid = null, ok = true;
  for (const lean of [0, 1, 2]) if ((laid = flow(ctx, blocksFor(sl, lean), y))) break;
  if (!laid) { ok = false; laid = flow(ctx, blocksFor(sl, 2), y, 0.4) || []; }
  paint(ctx, laid, t);
  ctx.restore();
  return ok;
}

/* 표지 — 읽기 쇼츠의 A 시험지와 같은 틀(운영자가 고른 것): 마스코트 · 주황 칩 · 큰 이름 · 훅 · 예문 맛보기 */
function coverDraw(ctx, c, logo, t = Infinity) {
  /* 표지 움직임: 마스코트가 통 튀어 내려오고 → 칩 → 이름 → 훅(형광펜이 그어짐) → 예문 카드 차례로 */
  const part = (k, fn) => { const q = ease((t - k * 220) / 460); if (q <= 0) return; ctx.save(); ctx.globalAlpha = q; ctx.translate(0, (1 - q) * 50); fn(q); ctx.restore(); };
  if (logo) { const q = Math.min(1, Math.max(0, t / 520)), bounce = q < 1 ? Math.sin(q * Math.PI) * -40 * (1 - q) - (1 - ease(q)) * 160 : 0;
    ctx.save(); ctx.globalAlpha = Math.min(1, q * 2); ctx.drawImage(logo, W / 2 - 170, 250 + bounce, 340, 340 * logo.height / logo.width); ctx.restore(); }
  part(1, () => { font(ctx, 44, 800); const tx = c.chip, tw = ctx.measureText(tx).width + 64;
    rr(ctx, W / 2 - tw / 2, 560, tw, 76, 38, C.or); ctx.fillStyle = '#fff'; ctx.fillText(tx, W / 2 - tw / 2 + 32, 613); });
  let s = 150, ls; for (; s >= 64; s -= 6) { font(ctx, s, 900); ls = wrap(ctx, c.name, 940); if (ls.length <= 2) break; }
  part(2, () => { font(ctx, s, 900); ls.forEach((l, i) => { ctx.fillStyle = C.ink; ctx.fillText(l, W / 2 - ctx.measureText(l).width / 2, 640 + s + i * s * 1.15); }); });
  let y = 640 + s + (ls.length - 1) * s * 1.15 + 120;
  const hk = c.hook;
  font(ctx, 80, 900); const hl = wrap(ctx, hk, 920).slice(0, 2);
  const sw = ease((t - 3 * 220 - 300) / SWEEP);
  part(3, () => { font(ctx, 80, 900); hl.forEach((l, i) => { const w = ctx.measureText(l).width; lineWithMark(ctx, l, W / 2 - w / 2, y + i * 100, 80, C.ink, /\d+\s*분|끝|쉽게/g, sw); }); });
  y += hl.length * 100 + 40;
  font(ctx, 46, 700); const ex = wrap(ctx, c.card || '', 820).slice(0, 3);
  const ch = ex.length * 66 + 70;
  part(4, () => { rr(ctx, 90, y, 900, ch, 28, C.card, C.line, 4); font(ctx, 46, 700); ex.forEach((l, i) => lineWithMark(ctx, l, 130, y + 70 + i * 66, 46, C.ink2, c.mark, ease((t - 4 * 220 - 400) / SWEEP))); });
  part(5, () => { font(ctx, 34, 700); ctx.fillStyle = C.dim; const f = c.foot || 'everykoreans.com'; ctx.fillText(f, W / 2 - ctx.measureText(f).width / 2, Math.max(y + ch + 80, 1680)); });
  return y + ch + 80 <= 1720;
}

/* 제목 · 설명 · 글 — 읽기와 같은 틀(shortsMeta)의 문법판 */
export function grammarMeta(p, hook = '') {
  const [ko, en] = levelOf(p), e = GRAMMAR_EN[p.id] || {};
  const hk = hook || '이 문법, 1분이면 끝!';
  const title = `${p.name} | 한국어 ${ko} 문법 1분 정리 #shorts`.slice(0, 100);
  const tags = '#한국어 #한국어문법 #한국어공부 #learnkorean #koreangrammar #studykorean #TOPIK';
  const body = `${p.name} — ${p.desc}\n${e.desc ? e.desc + '\n' : ''}\n예) ${p.ex}\n\n이 문법으로 문장을 만들어 댓글로 남겨 주세요 👇\n무료 문법 연습 → https://everykoreans.com/?utm_source=shorts&utm_medium=video`;
  return { title, description: `${body}\n\n${tags} #shorts`, caption: `${hk} ${p.name} (${ko} · ${en})\n\n${body}\n\n${tags}`,
    tags: ['한국어', '한국어 문법', 'Korean grammar', 'learn korean', p.name] };
}
