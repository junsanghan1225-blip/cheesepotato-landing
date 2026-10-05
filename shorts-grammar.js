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

const W = 1080, H = 1920, X = 64, R = W - 130, CW = R - X, TOP = 120, BOTTOM = 1500;
const FONT = '"Pretendard Variable", Pretendard, sans-serif';
const C = { bg: '#F7F3EA', card: '#FFFFFF', line: '#D9D1C2', ink: '#1B1512', ink2: '#4E3E31', dim: '#8C7A66', or: '#E1682B', mark: 'rgba(255, 221, 0, .7)', warnBg: '#FFF1E8' };
const LV = { beginner: ['초급', 'Beginner'], intermediate: ['중급', 'Intermediate'], advanced: ['고급', 'Advanced'] };
const CAT = new Map(SB_CATS.flatMap((c) => c.points.map((p) => [p.id, c])));

export const GRAMMAR_POINTS = SB_CATS.flatMap((c) => c.points.map((p) => ({ ...p, cat: c.ko })));
export const levelOf = (p) => LV[p.lv] || LV.beginner;

/* more[2] 는 「한국어 설명. English explanation.」 — 영어가 시작하는 곳에서 자른다 */
const koPart = (t) => { const i = t.search(/\s[A-Z][a-z]/); return (i > 0 ? t.slice(0, i) : t).trim(); };

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
function lineWithMark(ctx, l, x, y, size, color, re) {
  if (re) {
    re.lastIndex = 0; let m;
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = C.mark;
    while ((m = re.exec(l))) {
      const a = ctx.measureText(l.slice(0, m.index)).width, b = ctx.measureText(l.slice(0, m.index + m[0].length)).width;
      ctx.beginPath(); ctx.roundRect(x + a - 4, y - size * 0.78, b - a + 8, size * 0.98, 8); ctx.fill();
      if (!m[0].length) re.lastIndex++;
    }
    ctx.restore();
  }
  ctx.fillStyle = color; ctx.fillText(l, x, y);
}

/* 덩어리 목록으로 배치한다 — 글자 배율 s 를 1.3 → 0.35 로 줄여 가며 BOTTOM 안에 드는 첫 배율로 그린다.
   덩어리: { t: 글, size, weight, color, lh, gap, mark, card: 'white'|'warn'|null, pad, align, side } */
function flow(ctx, blocks, y0) {
  for (let s = 1.6; s >= 0.35; s -= 0.03) {
    let y = y0; const laid = [];
    for (const b of blocks) {
      if (b.space) { y += b.space * s; continue; }
      const size = b.size * s, lh = size * (b.lh || 1.45), pad = (b.pad || 0) * s, bw = b.w || CW;
      font(ctx, size, b.weight); const ls = wrap(ctx, b.t, bw - pad * 2);
      const h = ls.length * lh + pad * 2 - (b.card ? lh - size * 1.15 : 0);
      laid.push({ b, ls, size, lh, pad, y, h, bw }); y += h + (b.gap ?? 20) * s;
    }
    if (y <= BOTTOM || s <= 0.36) {
      /* 남는 자리가 있으면 위아래 가운데로 — 짧은 장이 위에만 몰려 아래가 텅 비지 않게 */
      const dy = Math.max(0, (BOTTOM - y) / 2);
      for (const l of laid) l.y += dy;
      laid.fit = y <= BOTTOM; return laid;
    }
  }
}
function paint(ctx, laid) {
  for (const { b, ls, size, lh, pad, y, h, bw } of laid) {
    const x0 = b.side === 'B' ? R - bw : X;
    if (b.card) rr(ctx, x0, y, bw, h, 22, b.card === 'warn' ? C.warnBg : b.card === 'soft' ? '#FBF8F1' : C.card, b.card === 'warn' ? '#F2B48E' : C.line, 3);
    font(ctx, size, b.weight);
    ls.forEach((l, i) => {
      const ty = y + pad + size + i * lh - size * 0.12;
      const lx = b.align === 'center' ? W / 2 - ctx.measureText(l).width / 2 + (X - (W - R)) / 2 : x0 + pad;
      lineWithMark(ctx, l, lx, ty, size, b.color || C.ink, b.mark);
    });
  }
}

function header(ctx, sl, idx, n, logo) {
  font(ctx, 30, 800); ctx.fillStyle = C.or;
  if (logo) ctx.drawImage(logo, X, TOP - 12, 54, 54 * logo.height / logo.width);
  ctx.fillText('치즈감자', X + (logo ? 64 : 0), TOP + 30);
  const [ko, en] = levelOf(sl.p);
  font(ctx, 26, 600); ctx.fillStyle = C.dim; ctx.textAlign = 'right'; ctx.fillText(`한국어 문법 · ${ko} ${en}`, R, TOP + 30); ctx.textAlign = 'left';
  /* 진행 막대 — 몇 번째 장인지(쇼츠는 길이를 모르고 보므로 「곧 끝난다」가 보이면 끝까지 본다) */
  const gap = 10, bw = (CW - gap * (n - 2)) / Math.max(1, n - 1);
  for (let i = 1; i < n; i++) rr(ctx, X + (i - 1) * (bw + gap), TOP + 56, bw, 8, 4, i <= idx ? C.or : C.line);
}
function titleRow(ctx, sl, y) {
  font(ctx, 30, 800); const t = `${sl.title} · ${sl.en}`, w = ctx.measureText(t).width + 44;
  rr(ctx, X, y, w, 56, 28, C.or); ctx.fillStyle = '#fff'; ctx.fillText(t, X + 22, y + 39);
  font(ctx, 30, 800); ctx.fillStyle = C.ink2; ctx.textAlign = 'right';
  let name = sl.p.name; while (ctx.measureText(name).width > CW - w - 20 && name.length > 3) name = name.slice(0, -2) + '…';
  ctx.fillText(name, R, y + 39); ctx.textAlign = 'left';
  return y + 96;
}

/* 한 장 그리기 — 다 들어갔으면 true(검사가 290개 × 모든 장을 센다) */
export function drawGrammarSlide(ctx, slides, idx, { logo = null, hook = '' } = {}) {
  const sl = slides[idx], p = sl.p;
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  if (sl.k === 'cover') { const ok = cover(ctx, sl, logo, hook); ctx.restore(); return ok; }
  header(ctx, sl, idx, slides.length, logo);
  const y = titleRow(ctx, sl, TOP + 100);
  const B = [];
  if (sl.k === 'mean') {
    B.push({ t: p.name, size: 96, weight: 900, gap: 30 });
    B.push({ t: sl.ko, size: 58, weight: 700, lh: 1.5, gap: 34 });
    if (sl.sub) B.push({ t: sl.sub, size: 40, weight: 500, color: C.dim });
  } else if (sl.k === 'form') {
    if (sl.form) B.push({ t: sl.form, size: 64, weight: 800, card: 'white', pad: 40, gap: 34 });
    for (const [a, b] of sl.rows) B.push({ t: `${a}  →  ${b}`, size: 56, weight: 700, card: 'soft', pad: 26, gap: 14, mark: sl.mark });
    if (sl.with) B.push({ space: 20 }, { t: '자주 같이 쓰는 말', size: 34, weight: 800, color: C.dim, gap: 10 }, { t: sl.with, size: 50, weight: 700 });
  } else if (sl.k === 'ex') {
    sl.exs.forEach(([ko, en], i) => {
      B.push({ t: ko, size: 58, weight: 700, card: 'white', pad: 34, gap: en ? 10 : 30, mark: sl.mark });
      if (en) B.push({ t: en, size: 36, weight: 500, color: C.dim, gap: i < sl.exs.length - 1 ? 30 : 0 });
    });
  } else if (sl.k === 'care') {
    if (sl.ko) B.push({ t: '⚠️ ' + sl.ko, size: 54, weight: 700, card: 'warn', pad: 40, lh: 1.55, gap: 30, mark: sl.mark });
    if (sl.sub) B.push({ t: sl.sub, size: 38, weight: 500, color: C.dim });
  } else if (sl.k === 'dlg') {
    sl.lines.forEach((l) => { const m = l.match(/^([AB])\s*[:：]\s*/); const who = m?.[1] || 'A';
      B.push({ t: l.replace(/^[AB]\s*[:：]\s*/, ''), size: 54, weight: 600, card: who === 'B' ? 'soft' : 'white', pad: 32, w: CW * 0.86, side: who, gap: 24, mark: sl.mark }); });
  } else if (sl.k === 'try') {
    B.push({ t: sl.words.length ? '이 낱말로 문장을 만들어 보세요' : '이 문법으로 문장을 만들어 보세요', size: 60, weight: 800, gap: 30 });
    for (const w of sl.words) B.push({ t: `${w[0]}  ·  ${w[2] || ''}`, size: 54, weight: 700, card: 'white', pad: 28, gap: 14 });
    B.push({ space: 30 }, { t: '댓글로 남겨 주면 확인해 줄게요 👇', size: 50, weight: 800, color: C.or, gap: 20 },
      { t: '무료 문법 연습 · everykoreans.com', size: 38, weight: 600, color: C.dim });
  }
  const laid = flow(ctx, B, y);
  paint(ctx, laid);
  ctx.restore();
  return laid.fit;
}

/* 표지 — 읽기 쇼츠의 A 시험지와 같은 틀(운영자가 고른 것): 마스코트 · 주황 칩 · 큰 이름 · 훅 · 예문 맛보기 */
function cover(ctx, sl, logo, hook) {
  const p = sl.p, [ko, en] = levelOf(p);
  if (logo) ctx.drawImage(logo, W / 2 - 170, 250, 340, 340 * logo.height / logo.width);
  font(ctx, 44, 800); const t = `${ko} 문법 · ${en}`, tw = ctx.measureText(t).width + 64;
  rr(ctx, W / 2 - tw / 2, 560, tw, 76, 38, C.or); ctx.fillStyle = '#fff'; ctx.fillText(t, W / 2 - tw / 2 + 32, 613);
  let s = 150, ls; for (; s >= 64; s -= 6) { font(ctx, s, 900); ls = wrap(ctx, p.name, 940); if (ls.length <= 2) break; }
  ls.forEach((l, i) => { ctx.fillStyle = C.ink; ctx.fillText(l, W / 2 - ctx.measureText(l).width / 2, 640 + s + i * s * 1.15); });
  let y = 640 + s + (ls.length - 1) * s * 1.15 + 120;
  const hk = hook || '이 문법, 1분이면 끝!';
  font(ctx, 80, 900); const hl = wrap(ctx, hk, 920).slice(0, 2);
  hl.forEach((l, i) => { const w = ctx.measureText(l).width; lineWithMark(ctx, l, W / 2 - w / 2, y + i * 100, 80, C.ink, /\d+\s*분|끝|쉽게/g); });
  y += hl.length * 100 + 40;
  font(ctx, 46, 700); const ex = wrap(ctx, p.ex || '', 820).slice(0, 3);
  const ch = ex.length * 66 + 70;
  rr(ctx, 90, y, 900, ch, 28, C.card, C.line, 4);
  ex.forEach((l, i) => lineWithMark(ctx, l, 130, y + 70 + i * 66, 46, C.ink2, sl.mark));
  font(ctx, 34, 700); ctx.fillStyle = C.dim; const f = `everykoreans.com · ${CAT.get(p.id)?.ko || ''}`; ctx.fillText(f, W / 2 - ctx.measureText(f).width / 2, Math.max(y + ch + 80, 1680));
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
