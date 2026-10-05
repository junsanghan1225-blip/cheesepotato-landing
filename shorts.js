/* 치즈감자 쇼츠 촬영소(shorts.html) — TOPIK 읽기 문제 · 문법 소개를 세로 영상으로 찍는다(운영자 요청 2026-10-05).
   문법은 shorts-grammar.js 가 슬라이드로 만들고, 여기서는 장 넘기기 · 장마다 형광펜 자국만 맡는다.
   「공장처럼 찍어낼 거야 — 간단한 형광펜만 있으면 될 것 같아」

   - 화면은 <canvas> 1080×1920(쇼츠 · 릴스 세로). 영상에 찍히는 것은 이 캔버스 그대로다(다른 창 · 알림은 안 들어간다).
   - 녹화 = 캔버스 영상(captureStream) + 마이크 소리 → MediaRecorder → 파일로 내려받기. 크롬이 되면 mp4, 안 되면 webm.
   - 쇼츠 · 릴스는 아래쪽(제목 · 채널)과 오른쪽(좋아요 단추)을 가린다 → 글은 SAFE 안에만 둔다.
   - 형광펜 자국은 캔버스 좌표로 남긴다. 그래서 정답 · 풀이를 보여도 글 자리가 안 움직이게, 풀이 칸 자리를 처음부터 잡아 둔다.
   - 찍은 문제는 이 브라우저에 적어 두고(localStorage) 「찍은 것 건너뛰기」로 다음 안 찍은 문제로 간다. */
import { TOPIK_READING, TOPIK_SLOTS } from './topik.js';
import { TOPIK2_READING, TOPIK2_SLOTS } from './topik2.js';
import { buildRounds, listenRounds, writeRounds, listenSlides, writeSlides, drawTopikSlide, topikMeta } from './shorts-topik.js';
import { drawCover, COVER_STYLES, shortsMeta } from './shorts-cover.js';
import { GRAMMAR_POINTS, grammarSlides, drawGrammarSlide, grammarMeta, levelOf, STEP, RISE } from './shorts-grammar.js';
import { createClient } from './vendor/supabase-js.js';

/* 사이트와 같은 Supabase(공개 키 — 막는 것은 표의 RLS). 사이트에서 로그인한 세션을 같이 쓴다(같은 주소라 저장 칸이 같다). */
const sb = createClient('https://tjgoevtvobvmlyefgxel.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });

const $ = (id) => document.getElementById(id);
/* 그림은 두 장: master(1080×1920 — 영상 · 표지에 들어가는 원본)와 cv(화면에 보이는 것).
   화면 칸은 폭 400~600 정도라, 원본을 브라우저가 그냥 줄이면 글자가 거칠게 깨져 보인다(운영자 「해상도가 엄청 구려」 2026-10-05).
   그래서 cv 는 화면 크기 × 기기 배율로 만들고, 원본을 고화질로 줄여 옮겨 그린다. 녹화는 원본에서 한다. */
const cv = $('cv'), view = cv.getContext('2d');
const master = document.createElement('canvas'); master.width = 1080; master.height = 1920;
const ctx = master.getContext('2d');
function fitView() {
  const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
}
function blit() {
  view.imageSmoothingEnabled = true; view.imageSmoothingQuality = 'high';
  view.drawImage(master, 0, 0, cv.width, cv.height);
}
new ResizeObserver(() => { fitView(); blit(); }).observe(cv);
const W = 1080, H = 1920;
/* 쇼츠 · 릴스 · 틱톡이 가리는 곳을 비운다: 위 약 220(맨 위 글자 · 카메라 단추), 아래 약 440(제목 · 채널 · 설명), 오른쪽 약 140(좋아요 · 댓글 단추) */
const SAFE = { x: 64, r: W - 140, top: 230, bottom: 1480 };
const FONT = '"Pretendard Variable", Pretendard, sans-serif';
const C = { bg: '#F7F3EA', card: '#FFFFFF', line: '#D9D1C2', ink: '#1B1512', ink2: '#4E3E31', dim: '#8C7A66', or: '#E1682B',
  green: '#2E9B5B', greenBg: '#DDF3E5', red: '#D33A2C' };
const PENS = [['노랑', 'rgba(255, 221, 0, .55)'], ['분홍', 'rgba(255, 110, 170, .45)'], ['초록', 'rgba(80, 220, 120, .45)']];
const INKS = [['빨강', 'rgba(211, 58, 44, 1)'], ['파랑', 'rgba(47, 111, 209, 1)'], ['검정', 'rgba(27, 21, 18, 1)']];   // 펜(동그라미 · 밑줄 · 화살표)
const CIRCLED = ['①', '②', '③', '④'];
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 사생활 창 */ } } };

const ALL = { I: TOPIK_READING, II: TOPIK2_READING };
let done = new Set(store.get('cp-shorts-done', []));
let list = [], idx = 0, q = null;
let coverStyle = store.get('cp-shorts-cover2', 'A'), coverPrev = false, recCover = false;
const logo = new Image(); logo.src = 'logo-clear.png'; logo.decode().then(() => draw()).catch(() => {});
let tool = 'hl';
/* 문법 소개(2026-10-05) — q 는 문법 하나, slides 는 그 슬라이드들. 형광펜 자국은 장마다 따로 남긴다(돌아오면 다시 보인다) */
let mode = store.get('cp-shorts-mode', 'read'), slides = [], slide = 0, slideStrokes = new Map();
const isGram = () => mode === 'gram';
const isDeck = () => mode !== 'read';   // 듣기 · 쓰기 · 문법은 슬라이드(장) 갈래
const keyOf = (x) => (isGram() ? 'g:' + x.id : x.id);   // 찍은 것 · 대기열 qid — 문법은 g: 를 붙여 읽기 id 와 안 섞이게
let strokes = [], cur = null, pen = 1, straight = true, showAns = false, showWhy = false, LA = null, L = null;   // LA 읽기 배치 전체(pages) · L 지금 장

/* ── 글 나누기: 낱말(띄어쓰기) 단위로 줄을 바꾼다. 낱말 하나가 줄보다 길면 글자 단위로 자른다. ── */
function wrap(text, width) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '', start = out.length ? out.at(-1).end + 1 : 0;
    const words = para.split(' ');
    words.forEach((w) => {
      const tryLine = line ? line + ' ' + w : w;
      if (ctx.measureText(tryLine).width <= width || !line) { line = tryLine; }
      else { out.push({ t: line, start, end: start + line.length }); start += line.length + 1; line = w; }
      while (ctx.measureText(line).width > width && line.length > 1) {
        let n = line.length; while (n > 1 && ctx.measureText(line.slice(0, n)).width > width) n--;
        out.push({ t: line.slice(0, n), start, end: start + n }); start += n; line = line.slice(n);
      }
    });
    out.push({ t: line, start, end: start + line.length });
  }
  return out;
}
const font = (size, weight = 500) => { ctx.font = `${weight} ${size}px ${FONT}`; };

/* ── 배치(2026-10-05 다시: 운영자 「폰트 보기 편하게 · 쇼츠 · 릴스에서 잘림 없게」) ──
   · 글자 크기는 폰에서 읽히는 만큼 아래로는 안 내린다: 지문 · 보기 42px, 풀이 35px 이 바닥(1080 폭 → 폰에서 약 15pt).
   · 한 장에 다 들어가면 한 장. 안 들어가면 두 장으로 나눈다 — ① 지문 ② 질문 · 보기 · 풀이(Space 로 넘긴다).
   · 그래도 넘치면(거의 없다) 그 장만 바닥 아래로 줄이고, 화면 옆 칸에 빨갛게 알린다. */
const S_MIN = 0.84, S_MAX = 1.25;   // 지문 · 보기 50px × 0.84 = 42px 가 바닥
function brandBlocks(b, y, CW, hook, s) {
  b.push({ k: 'brand', y: y + 34 }); y += 70;
  if (hook) { const hs = Math.round(60 * Math.min(1.1, Math.max(s, 0.9))); font(hs, 900); const ls = wrap(hook, CW); b.push({ k: 'hook', ls, size: hs, y }); y += ls.length * Math.round(hs * 1.25) + 20; }
  b.push({ k: 'chip', y }); return y + 72;
}
function passBlocks(b, y, CW, s) {
  const fs = Math.round(50 * s), lh = Math.round(fs * 1.55), pad = Math.round(36 * s);
  if (q.sentence) { font(fs, 600); const ls = wrap(shown(q.sentence), CW - pad * 2 - 20); b.push({ k: 'sent', ls, fs, lh, pad, y }); y += ls.length * lh + pad * 2 - 10 + 22; }
  font(fs, 500); const pl = wrap(shown(q.passage), CW - pad * 2); b.push({ k: 'pass', ls: pl, fs, lh, pad, y });
  return y + pl.length * lh + pad * 2 + Math.round(30 * s);
}
function optBlocks(b, y, CW, s) {
  const qs = Math.round(48 * s), qlh = Math.round(qs * 1.4); font(qs, 800); const ql = wrap(shown(q.question), CW); b.push({ k: 'q', ls: ql, fs: qs, lh: qlh, y }); y += ql.length * qlh + Math.round(22 * s);
  const os = Math.round(50 * s), olh = Math.round(os * 1.4), opad = Math.round(22 * s);
  /* 오른쪽에 ✓ 자리(os)를 비워 두고 줄을 바꾼다 — 정답을 보여도 글이 안 움직이고 ✓ 와 안 겹친다 */
  const opts = q.options.map((o) => { font(os, 600); const ls = wrap(shown(o), CW - opad * 2 - os * 1.6 - os); const h = ls.length * olh + opad * 2; const r = { ls, y, h }; y += h + Math.round(14 * s); return r; });
  b.push({ k: 'opts', opts, fs: os, lh: olh, pad: opad });
  return y + Math.round(16 * s);
}
/* 「정답은? 댓글로 👇」 — 보기 아래 자리가 남을 때만(없어도 그 장은 들어간 것으로 본다) */
function ctaBlock(b, y, CW, s) { if (y + 80 * s <= SAFE.bottom) b.push({ k: 'cta', y, s }); return y; }
/* 풀이 장 — 정답 한 줄(초록 칸) + 풀이. 늘 마지막 장이고, W 를 누르면 여기로 간다 */
function whyBlocks(b, y, CW, s) {
  const as = Math.round(50 * s), apad = Math.round(24 * s); font(as, 800);
  const al = wrap(`${CIRCLED[q.answer]} ${shown(q.options[q.answer])}`, CW - apad * 2 - as * 2.2);
  const ah = al.length * Math.round(as * 1.4) + apad * 2; b.push({ k: 'ans', ls: al, fs: as, lh: Math.round(as * 1.4), pad: apad, y, h: ah }); y += ah + Math.round(28 * s);
  const ws = Math.round(46 * s), wlh = Math.round(ws * 1.5), wpad = Math.round(30 * s);
  font(ws, 500); const wl = wrap('💡 ' + shown(q.why), CW - wpad * 2);
  const wh = wl.length * wlh + wpad * 2; b.push({ k: 'why', ls: wl, fs: ws, lh: wlh, pad: wpad, y, h: wh, always: true });
  return y + wh;
}
/* 한 장 만들기 — parts 를 S_MAX → lo 로 줄여 가며 들어가는 첫 크기 */
function page(parts, hook, lo, tail = null) {
  const X = SAFE.x, CW = SAFE.r - SAFE.x;
  for (let s = S_MAX; s >= lo - 1e-9; s -= 0.02) {
    const b = []; let y = brandBlocks(b, SAFE.top, CW, hook, s);
    for (const f of parts) y = f(b, y, CW, s);
    if (y <= SAFE.bottom) { if (tail) tail(b, y, CW, s); return { s, b, X, CW, fit: true }; }
  }
  return null;
}
/* 장 나누기(운영자 2026-10-05: 「문제가 만들다 말았다」 — 지문만 있는 장이 문제로 안 보였다)
   ① 지문 · 질문 · 보기를 한 장에 → ② 풀이 장.  한 장에 바닥 크기로 안 들어가는 긴 글만 ①을 「지문」 · 「질문 · 보기」로 나눈다. */
function layout(q, hook) {
  const why = page([whyBlocks], '', S_MIN) || page([whyBlocks], '', 0.6);
  const one = page([passBlocks, optBlocks], hook, S_MIN, ctaBlock) || page([passBlocks, optBlocks], '', S_MIN, ctaBlock);
  if (one) return { pages: [one, why], small: why.s < S_MIN };
  const p1 = page([passBlocks], hook, S_MIN) || page([passBlocks], '', S_MIN) || page([passBlocks], '', 0.6);
  const p2 = page([optBlocks], '', S_MIN, ctaBlock) || page([optBlocks], '', 0.6, ctaBlock);
  const pages = [p1, p2, why];
  return { pages, small: pages.some((x) => x.s < S_MIN) };
}

/* 밑줄 칠 곳(mark) — 지문 안 글자 위치 */
const markRange = (q) => { if (!q.mark) return null; const i = shown(q.passage).indexOf(q.mark); return i < 0 ? null : [i, i + q.mark.length]; };

/* 빈칸 「(  )」 · 「(　　　　)」 — 띄어쓰기 · 전각 공백은 글꼴에 따라 아주 좁게 그려져 빈칸이 안 보인다(운영자 지적 2026-10-05).
   그래서 줄바꿈되지 않는 공백 8칸으로 바꿔 자리를 넓히고, 그릴 때 그 자리에 연한 주황 칸을 깐다. */
const BLANK = '(' + '\u00A0'.repeat(8) + ')';
const shown = (t) => String(t).replace(/\([\s\u3000]*\)/g, BLANK);
function blankBg(t, x, y, fs) {
  if (!t.includes(BLANK)) return;
  const fill = ctx.fillStyle; let i = -1;
  ctx.fillStyle = 'rgba(225, 104, 43, .16)';
  while ((i = t.indexOf(BLANK, i + 1)) >= 0) {
    const a = ctx.measureText(t.slice(0, i)).width, w = ctx.measureText(BLANK).width;
    ctx.beginPath(); ctx.roundRect(x + a, y - fs * 0.85, w, fs * 1.1, 8); ctx.fill();
  }
  ctx.fillStyle = fill;
}

function roundRect(x, y, w, h, r, fill, stroke, lw = 3) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

const logoOk = () => (logo.complete && logo.naturalWidth ? logo : null);
let vTrack = null, frameTimer = 0;   // 녹화 중일 때 원본 한 장을 그릴 때마다 영상에 한 프레임
const pushFrame = () => { if (vTrack && vTrack.readyState === 'live') vTrack.requestFrame?.(); };
function draw() { drawMaster(); pushFrame(); blit(); }
/* ── 움직임(운영자 2026-10-05: 「장마다 애니메이션」) — 장이 뜨면 덩어리가 차례로 아래에서 올라오고, 정답은 초록이 번지며 ✓ 가 톡 ── */
const now = () => performance.now();
const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
let animT0 = -1e9, ansT0 = -1e9, animRaf = 0;
const animP = (k) => ease((now() - animT0 - k * STEP) / RISE);
/* 움직이는 동안만 다시 그린다(녹화 중에는 녹화 고리가 늘 그린다) */
function kick(answer = false) {
  if (answer) ansT0 = now(); else animT0 = now();
  cancelAnimationFrame(animRaf);
  const run = () => { draw(); if (!rec && (now() - animT0 < 3200 || now() - ansT0 < 600)) animRaf = requestAnimationFrame(run); };
  run();
}
/* 슬라이드 갈래 한 장 — 문법 · 듣기 · 쓰기. 듣기 표지는 읽기 표지(고른 모양)를 「듣기」로 */
let micLevel = 0;   // 운영자 마이크 크기(0~1) — 듣기 🎧 장의 막대가 따라 움직인다
function drawDeck(c, m, item, sl, i, hook, t) {
  if (m === 'gram') return drawGrammarSlide(c, sl, i, { logo: logoOk(), hook, t });
  if (m === 'listen' && sl[i].k === 'cover') return drawCover(c, { ...item, kind: '듣기', question: item.q }, coverStyle, { hook: hook || HOOK.listen, logo: logoOk() });
  return drawTopikSlide(c, sl, i, { logo: logoOk(), t, playing: rec ? micLevel : 0 });
}
/* 시리즈 이름 — 제목 맨 앞에 붙고, 유튜브 재생목록 이름이 된다(운영자 2026-10-05: 「시리즈 제목이랑 재생목록」).
   [TOPIK I 모의고사 1회 · 31번 1/40] 처럼 — 다음 편을 찾아보게. 액션(tools/shorts-post.mjs)이 대괄호 안 「· 」 앞을 재생목록으로 쓴다. */
function seriesOf(m, item, roundIdx, pos, total) {
  if (m === 'gram') { const lv = levelOf(item)[0]; return { list: `한국어 ${lv} 문법`, tag: `[한국어 ${lv} 문법 · ${pos}/${total}]` }; }
  const name = m === 'read' ? `TOPIK ${item.exam} 모의고사 ${roundIdx + 1}회` : m === 'listen' ? `TOPIK ${item.exam} 듣기 모의고사 ${roundIdx + 1}회` : `TOPIK II 쓰기 모의고사 ${roundIdx + 1}회`;
  const no = m === 'write' ? item.q : item.slot;
  return { list: name, tag: `[${name} · ${no}번 ${pos}/${total}]` };
}
const metaOf = (m, item, hook, series) => {
  const r = m === 'gram' ? grammarMeta(item, hook) : m === 'read' ? shortsMeta(item, hook) : topikMeta(m, item, hook);
  if (!series) return r;
  /* 시리즈가 있으면 제목은 「[시리즈] 훅 #shorts」만 — 「TOPIK I 읽기 31번」이 두 번 나오지 않게 */
  const WHOOK = { 51: '이 빈칸, 채울 수 있어요?', 52: '이 빈칸, 채울 수 있어요?', 53: '이 자료, 글로 쓸 수 있어요?', 54: '600자 논술, 이렇게 써요' };
  const core = m === 'gram' ? `${item.name} — 1분 정리` : (hook || (m === 'write' ? WHOOK[item.q] : HOOK[m]) || '이 문제, 풀 수 있어요?');
  return { ...r, title: `${series.tag} ${core} #shorts`.slice(0, 100), caption: `${series.tag}\n${r.caption}`, description: `${series.tag}\n${r.description}`, playlist: series.list };
};
/* 지금 고른 것의 시리즈 — 문법은 같은 단계 안에서 몇 번째 */
function seriesNow() {
  if (isGram()) { const same = GRAMMAR_POINTS.filter((x) => x.lv === q.lv); return seriesOf(mode, q, 0, same.indexOf(q) + 1, same.length); }
  return seriesOf(mode, q, +$('grade').value || 0, idx + 1, list.length);
}
function drawMaster() {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  if (isDeck()) { if (q && slides.length) { drawDeck(ctx, mode, q, slides, slide, $('hook').value.trim(), now() - animT0); drawStrokes(); } return; }
  if (!q || !L) return;
  if (coverPrev || recCover) { drawCover(ctx, q, coverStyle, { hook: $('hook').value.trim(), logo: logo.complete && logo.naturalWidth ? logo : null }); return; }
  const { X, CW } = L;
  ctx.textBaseline = 'alphabetic';
  let k = 0;
  for (const b of L.b) {
    /* 머리(로고 · 훅 · 칩)는 그대로, 그 아래 덩어리만 차례로 올라온다. 보기는 한 줄씩 따로(아래에서) */
    const still = ['brand', 'hook', 'chip'].includes(b.k), pa = still || b.k === 'opts' ? 1 : animP(k);
    if (!still && b.k !== 'opts') k++;
    if (pa <= 0) continue;
    ctx.save(); ctx.globalAlpha = pa; ctx.translate(0, (1 - pa) * 46);
    if (b.k === 'brand') { font(34, 800); ctx.fillStyle = C.or; if (logo.naturalWidth) ctx.drawImage(logo, X, b.y - 46, 60, 60 * logo.height / logo.width); ctx.fillText('치즈감자', X + (logo.naturalWidth ? 70 : 0), b.y); font(30, 600); ctx.fillStyle = C.dim; ctx.textAlign = 'right'; ctx.fillText(LA.pages.length > 1 ? `${slide + 1} / ${LA.pages.length}` : 'everykoreans.com', SAFE.r, b.y); ctx.textAlign = 'left'; }
    if (b.k === 'hook') { font(b.size, 900); ctx.fillStyle = C.ink; b.ls.forEach((l, i) => ctx.fillText(l.t, X, b.y + b.size + i * Math.round(b.size * 1.25))); }
    if (b.k === 'chip') {
      font(32, 700); const t = `TOPIK ${q.exam} · 읽기 ${q.slot}번 · ${q.grade}급`; const w = ctx.measureText(t).width + 44;
      roundRect(X, b.y, w, 54, 27, C.or); ctx.fillStyle = '#fff'; ctx.fillText(t, X + 22, b.y + 38);
      font(30, 600); ctx.fillStyle = C.dim; ctx.fillText('기출 아님', X + w + 16, b.y + 38);
    }
    if (b.k === 'sent') {
      const h = b.ls.length * b.lh + b.pad * 2 - 10; ctx.setLineDash([12, 8]); roundRect(X, b.y, CW, h, 16, C.card, C.ink2, 3); ctx.setLineDash([]);
      font(b.fs, 600); ctx.fillStyle = C.ink; b.ls.forEach((l, i) => { const ty = b.y + b.pad - 5 + b.fs + i * b.lh; blankBg(l.t, X + b.pad, ty, b.fs); ctx.fillText(l.t, X + b.pad, ty); });
    }
    if (b.k === 'pass') {
      const h = b.ls.length * b.lh + b.pad * 2; roundRect(X, b.y, CW, h, 18, C.card, C.line, 3);
      font(b.fs, 500); ctx.fillStyle = C.ink; const mr = markRange(q);
      b.ls.forEach((l, i) => {
        const ty = b.y + b.pad + b.fs + i * b.lh - Math.round(b.fs * 0.1);
        blankBg(l.t, X + b.pad, ty, b.fs); ctx.fillText(l.t, X + b.pad, ty);
        if (mr && mr[0] < l.end && mr[1] > l.start) {
          const a = Math.max(mr[0], l.start) - l.start, z = Math.min(mr[1], l.end) - l.start;
          const x0 = X + b.pad + ctx.measureText(l.t.slice(0, a)).width, x1 = X + b.pad + ctx.measureText(l.t.slice(0, z)).width;
          ctx.fillRect(x0, ty + 8, x1 - x0, 3);
        }
      });
    }
    if (b.k === 'q') { font(b.fs, 800); ctx.fillStyle = C.ink; b.ls.forEach((l, i) => { blankBg(l.t, X, b.y + b.fs + i * b.lh, b.fs); ctx.fillText(l.t, X, b.y + b.fs + i * b.lh); }); }
    if (b.k === 'opts') { const k0 = k; k += b.opts.length; b.opts.forEach((o, i) => {
      const po = animP(k0 + i); if (po <= 0) return;
      ctx.save(); ctx.globalAlpha = po; ctx.translate((1 - po) * 60, 0);   // 보기는 오른쪽에서 톡
      const ok = showAns && i === q.answer, dimmed = showAns && i !== q.answer, pk = ok ? ease((now() - ansT0) / 350) : 0;
      roundRect(X, o.y, CW, o.h, 16, C.card, C.line, 3);
      if (ok) { ctx.save(); ctx.globalAlpha *= pk; roundRect(X, o.y, CW, o.h, 16, C.greenBg, C.green, 5); ctx.restore(); }
      font(b.fs, 700); ctx.fillStyle = ok && pk > 0.4 ? C.green : dimmed ? C.dim : C.ink;
      blankBg(o.ls[0]?.t || '', X + b.pad + b.fs * 1.6, o.y + b.pad + b.fs - 4, b.fs);
      ctx.fillText(CIRCLED[i], X + b.pad, o.y + b.pad + b.fs - 4);
      font(b.fs, ok ? 800 : 600);
      o.ls.forEach((l, j) => ctx.fillText(l.t, X + b.pad + b.fs * 1.6, o.y + b.pad + b.fs - 4 + j * b.lh));
      if (ok) { font(Math.round(b.fs * (0.5 + 0.5 * pk)), 900); ctx.fillStyle = C.green; ctx.textAlign = 'right'; ctx.fillText('✓', X + CW - b.pad, o.y + b.pad + b.fs - 4); ctx.textAlign = 'left'; }
      ctx.restore();
    }); }
    if (b.k === 'cta' && !showAns) {
      font(Math.round(46 * b.s), 800); ctx.fillStyle = C.or; ctx.textAlign = 'center';
      ctx.fillText('정답은? 댓글로 👇', X + CW / 2, b.y + Math.round(56 * b.s)); ctx.textAlign = 'left';
    }
    if (b.k === 'ans') {
      roundRect(X, b.y, CW, b.h, 16, C.greenBg, C.green, 5);
      font(Math.round(b.fs * 0.62), 800); ctx.fillStyle = C.green; ctx.fillText('정답', X + b.pad, b.y + b.pad + b.fs * 0.8);
      font(b.fs, 800); b.ls.forEach((l, i) => ctx.fillText(l.t, X + b.pad + b.fs * 2.2, b.y + b.pad + b.fs - 4 + i * b.lh));
    }
    if (b.k === 'why') {
      roundRect(X, b.y, CW, b.h, 16, '#FFF6D6', '#E8C969', 3);
      font(b.fs, 500); ctx.fillStyle = C.ink2; b.ls.forEach((l, i) => { const ty = b.y + b.pad + b.fs - 4 + i * b.lh; blankBg(l.t, X + b.pad, ty, b.fs); ctx.fillText(l.t, X + b.pad, ty); });
    }
    ctx.restore();
  }
  drawStrokes();
}

function drawStrokes() {
  /* 형광펜은 글 위에 곱하기로 겹친다(검은 글씨는 그대로 보인다) · 펜은 그냥 위에 그린다.
     펜 자국은 점 사이를 부드러운 곡선(가운데점 잇기)으로 — 태블릿 펜 글씨가 각지지 않게 */
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const st of cur ? [...strokes, cur] : strokes) {
    const P = st.pts; if (P.length < 1) continue;
    ctx.globalCompositeOperation = st.t === 'pen' ? 'source-over' : 'multiply';
    ctx.strokeStyle = st.c; ctx.lineWidth = st.w; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    if (P.length === 1) ctx.lineTo(P[0][0] + 0.1, P[0][1]);
    else if (P.length === 2) ctx.lineTo(P[1][0], P[1][1]);
    else { for (let i = 1; i < P.length - 1; i++) ctx.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2); ctx.lineTo(P.at(-1)[0], P.at(-1)[1]); }
    ctx.stroke();
  }
  ctx.restore();
}

/* ── 형광펜 · 펜 그리기 — 마우스 · 손가락 · 태블릿 펜(Apple Pencil · S펜) 모두 pointer 이벤트 하나로 ──
   · 펜을 한 번 쓰면 그 뒤로는 손가락 닿음을 무시한다(펜으로 쓰다 손바닥이 닿아도 안 그어지게)
   · 펜은 이벤트가 촘촘히 오므로 getCoalescedEvents 로 사이 점까지 받아 정확하게 따라간다 */
const toCanvas = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
const hlW = () => (isDeck() ? 62 : Math.round(((L && L.b.find((b) => b.fs))?.fs || 46) * 1.15));
let penSeen = false;
cv.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'pen') penSeen = true;
  if (penSeen && e.pointerType === 'touch') return;
  e.preventDefault(); cv.setPointerCapture(e.pointerId);
  const p = toCanvas(e);
  cur = tool === 'pen' ? { t: 'pen', c: INKS[pen][1], w: 7, pts: [p], id: e.pointerId } : { t: 'hl', c: PENS[pen][1], w: hlW(), pts: [p], id: e.pointerId };
  draw();
});
cv.addEventListener('pointermove', (e) => {
  if (!cur || e.pointerId !== cur.id) return;
  if (cur.t === 'hl' && straight) { const p = toCanvas(e); cur.pts = [cur.pts[0], [p[0], cur.pts[0][1]]]; }
  else for (const ev of e.getCoalescedEvents?.() || [e]) cur.pts.push(toCanvas(ev));
  draw();
});
const endStroke = (e) => { if (cur && (!e || e.pointerId === cur.id)) { strokes.push(cur); cur = null; draw(); } };
cv.addEventListener('pointerup', endStroke); cv.addEventListener('pointercancel', endStroke);

function paintPens() {
  const set = tool === 'pen' ? INKS : PENS;
  $('colors').innerHTML = set.map(([n, c], i) => `<button class="sw${i === pen ? ' on' : ''}" data-i="${i}" title="${n} (${i + 1})" style="background:${c.replace(/[\d.]+\)$/, '1)')}"></button>`).join('') + `<span class="muted">${set[pen][0]}</span>`;
  $('barColors').innerHTML = set.map(([n, c], i) => `<button class="sw${i === pen ? ' on' : ''}" data-i="${i}" title="${n}" style="background:${c.replace(/[\d.]+\)$/, '1)')}"></button>`).join('');
  for (const id of ['toolHl', 'bHl']) $(id).classList.toggle('on', tool === 'hl');
  for (const id of ['toolPen', 'bPen']) $(id).classList.toggle('on', tool === 'pen');
}
const pickColor = (e) => { const i = e.target.closest('[data-i]')?.dataset.i; if (i != null) { pen = +i; paintPens(); } };
$('colors').addEventListener('click', pickColor); $('barColors').addEventListener('click', pickColor);
const setTool = (t) => { tool = t; paintPens(); };
for (const id of ['toolHl', 'bHl']) $(id).addEventListener('click', () => setTool('hl'));
for (const id of ['toolPen', 'bPen']) $(id).addEventListener('click', () => setTool('pen'));
$('straight').addEventListener('click', () => { straight = !straight; $('straight').classList.toggle('on', straight); $('straight').textContent = straight ? '곧은 줄' : '손으로 긋기'; });
$('undo').addEventListener('click', () => { strokes.pop(); draw(); });
$('clear').addEventListener('click', () => { strokes = []; draw(); });
const toggleAns = () => { showAns = !showAns; if (!showAns) showWhy = false; paintBtns(); kick(true); };
/* 풀이 = 마지막 장(정답 + 풀이). W 로 가고, 다시 W 면 앞 장(보기)으로 돌아온다 */
const toggleWhy = () => {
  if (isDeck() || !LA) return;
  const last = LA.pages.length - 1;
  if (slide === last) slideGo(last - 1); else { showAns = true; slideGo(last); }
  paintBtns(); draw();
};
function paintBtns() { showWhy = !isDeck() && !!LA && slide === LA.pages.length - 1; $('answer').classList.toggle('on', showAns); $('why').classList.toggle('on', showWhy); }
$('answer').addEventListener('click', toggleAns);
$('why').addEventListener('click', toggleWhy);

/* ── 문제 고르기 ── */
/* 훅(맨 위 한 줄)은 읽기 · 문법이 따로 기억한다 */
/* 훅(맨 위 한 줄)은 갈래마다 따로 기억한다 */
const HOOK = { read: '이 문제, 30초 안에 풀 수 있어요?', listen: '이 문제, 듣고 풀 수 있어요?', write: '', gram: '이 문법, 1분이면 끝!' };
const hookKey = () => (mode === 'read' ? 'cp-shorts-hook' : mode === 'gram' ? 'cp-shorts-hook-g' : `cp-shorts-hook-${mode}`);
const hookDefault = () => HOOK[mode];
$('hook').addEventListener('input', () => { store.set(hookKey(), $('hook').value); relayout(); });

/* 회차 — 읽기 · 듣기 · 쓰기는 「모의고사 n회」 차례로 번호마다 하나씩(운영자 2026-10-05: 「모의고사 1회 기준으로 쭉 올릴게」).
   읽기는 사이트 모의고사와 같은 규칙이라 촬영소 1회 = 사이트 모의고사 1회차다. */
const SLOTS = { I: TOPIK_SLOTS, II: TOPIK2_SLOTS };
const roundsCache = new Map();
function roundsOf() {
  const k = `${mode}|${$('exam').value}`;
  if (!roundsCache.has(k)) roundsCache.set(k, mode === 'read' ? buildRounds(ALL[$('exam').value], SLOTS[$('exam').value]) : mode === 'listen' ? listenRounds($('exam').value) : writeRounds());
  return roundsCache.get(k);
}
function fillGrades() {
  if (isGram()) {
    $('grade').innerHTML = '<option value="">모든 단계</option>' + ['beginner', 'intermediate', 'advanced'].map((l) => `<option value="${l}">${levelOf({ lv: l })[0]}</option>`).join('');
    return;
  }
  const R = roundsOf(), keep = store.get(`cp-shorts-round-${mode}-${$('exam').value}`, 0);
  $('grade').innerHTML = R.map((r, i) => `<option value="${i}">모의고사 ${i + 1}회 · ${r.length}문항</option>`).join('');
  $('grade').value = Math.min(keep, R.length - 1);
}
const itemText = (x) => (mode === 'read' ? `${x.slot}번 · ${x.topic || x.type}` : mode === 'listen' ? `${x.slot}번 · ${x.q}` : mode === 'write' ? `${x.q}번 · ${x.title}` : `${x.name} · ${levelOf(x)[0]}`);
function fillList(keepId) {
  const g = $('grade').value;
  if (isGram()) list = GRAMMAR_POINTS.filter((x) => !g || x.lv === g);
  else { store.set(`cp-shorts-round-${mode}-${$('exam').value}`, +g || 0); list = roundsOf()[+g || 0] || []; }
  $('pick').innerHTML = list.map((x, i) => `<option value="${i}">${done.has(keyOf(x)) ? '✓ ' : ''}${itemText(x)} (${x.id})</option>`).join('');
  const k = keepId ? list.findIndex((x) => x.id === keepId) : -1;
  go(k >= 0 ? k : firstTodo(0, 1));
}
function firstTodo(from, dir) {
  if (!$('skipDone').checked) return Math.max(0, Math.min(list.length - 1, from));
  for (let n = 0; n < list.length; n++) { const i = (from + dir * n + list.length * 2) % list.length; if (!done.has(keyOf(list[i]))) return i; }
  return Math.max(0, Math.min(list.length - 1, from));
}
async function go(i) {
  if (!list.length) return;
  idx = (i + list.length) % list.length; q = list[idx];
  $('pick').value = idx; strokes = []; showAns = false; showWhy = false;
  slide = 0; slideStrokes = new Map();
  store.set(`cp-shorts-last-${mode}`, { exam: $('exam').value, id: q.id });
  const doneTag = done.has(keyOf(q)) ? ' · <span class="done">찍음 ✓</span>' : '';
  if (isDeck()) {
    await fontsReady(JSON.stringify(q));
    slides = isGram() ? grammarSlides(q) : mode === 'listen' ? listenSlides(ctx, q) : writeSlides(ctx, q);
    relayout(); paintSlide(); kick();
    $('info').innerHTML = (isGram() ? `${q.cat} · ` : mode === 'listen' ? `${q.type} · 정답 ${CIRCLED[q.answer]} · ` : '') + `${slides.length}장 — Space 로 넘겨요` + doneTag;
  } else {
    await fontsReady([q.passage, q.question, q.sentence || '', q.why, ...q.options].join(''));
    relayout(); paintSlide(); kick();
    $('info').innerHTML = `${q.genre || ''} · ${q.type} · 정답 ${CIRCLED[q.answer]}` + doneTag +
      ` · <b>${LA.pages.length}장 — Space 로 넘겨요</b>` + (LA.small ? ' · <b style="color:#D33A2C">글이 길어 글자가 작아요 — 다른 문제를 권해요</b>' : '');
  }
  paintScript();
  paintStat();
}
/* 듣기 대본 — 옆 칸에만(영상에는 안 찍힌다). 운영자가 이걸 읽어 녹음한다 */
function paintScript() {
  const on = mode === 'listen' && q?.script;
  $('scriptBox').hidden = !on;
  if (!on) return;
  const WHO = { m: '👨 남자', w: '👩 여자', n: '📢 안내' };
  $('scriptBox').innerHTML = '<b>🎙️ 대본 — 직접 읽어 주세요(영상에는 안 나와요)</b>' +
    q.script.map((l) => `<p><span>${WHO[l.who] || ''}</span> ${l.text.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</p>`).join('');
}
function relayout() {
  if (!q) return;
  if (!isDeck()) { LA = layout(q, $('hook').value.trim()); slide = Math.min(slide, LA.pages.length - 1); L = LA.pages[slide]; }
  draw();
}

/* 장 넘기기 — 듣기 · 쓰기 · 문법은 슬라이드, 읽기는 문제 · 풀이 장. 지금 장의 자국을 맡겨 두고, 갈 장의 자국을 꺼낸다 */
const pageCount = () => (isDeck() ? slides.length : LA?.pages.length || 1);
function slideGo(n) {
  if (!q) return;
  const to = Math.max(0, Math.min(pageCount() - 1, n)); if (to === slide) return;
  slideStrokes.set(slide, strokes); slide = to; strokes = slideStrokes.get(slide) || []; cur = null; animT0 = now();
  if (!isDeck()) L = LA.pages[slide];
  paintSlide(); draw();
}
function paintSlide() {
  const n = pageCount();
  $('slideRow').hidden = n < 2;
  $('slNo').textContent = `${slide + 1} / ${n}`; $('slPrev').disabled = slide === 0; $('slNext').disabled = slide >= n - 1;
  paintBtns();
}
$('slPrev').addEventListener('click', () => slideGo(slide - 1));
$('slNext').addEventListener('click', () => slideGo(slide + 1));

/* 갈래 바꾸기 — 보이는 칸을 바꾸고 그 갈래의 지난번 것으로 */
function applyMode() {
  const d = isDeck();
  $('exam').hidden = mode === 'write' || mode === 'gram'; $('ansRow').hidden = d; $('coverRow').hidden = d;
  $('bAns').hidden = d; $('bWhy').hidden = d;
  $('bPrev').title = d ? '앞 장' : '이전 문제'; $('bNext').title = d ? '다음 장' : '다음 문제';
  $('coverNote').textContent = d ? '첫 장(표지)부터 찍혀요. 같은 그림을 표지 사진으로도 올려요.' : '영상 첫 1초가 표지예요. 같은 그림을 표지 사진으로도 올려요.';
  $('hook').value = store.get(hookKey(), hookDefault());
  coverPrev = false; $('coverPrev').classList.remove('on');
  const last = store.get(`cp-shorts-last-${mode}`, null) || (mode === 'read' ? store.get('cp-shorts-last', null) : null);
  if (last?.exam && !$('exam').hidden) $('exam').value = last.exam;
  fillGrades();
  fillList(last?.id ?? (mode === 'gram' ? store.get('cp-shorts-last-g', null) : null));
}
$('mode').addEventListener('change', () => { mode = $('mode').value; store.set('cp-shorts-mode', mode); applyMode(); });
const step = (dir) => go(firstTodo(idx + dir, dir));
$('prev').addEventListener('click', () => step(-1));
$('next').addEventListener('click', () => step(1));
$('pick').addEventListener('change', () => go(+$('pick').value));
$('exam').addEventListener('change', () => { fillGrades(); fillList(); });
$('grade').addEventListener('change', () => fillList());
$('skipDone').addEventListener('change', () => fillList(q?.id));

/* 글꼴 — Pretendard 는 글자 범위마다 파일이 나뉘어 있어, 그릴 글자를 먼저 불러 둔다 */
async function fontsReady(more) {
  const text = more + $('hook').value + 'TOPIK 읽기 번급 연습 문제 기출 아님 치즈감자 everykoreans.com 정답은? 댓글로 ①②③④✓ 한국어 문법 초급 중급 고급 뜻 모양 예문 주의 대화 직접 해 보세요 Meaning Form Examples Watch out Dialogue Your turn 👇⚠️→…';
  try { await Promise.all([500, 600, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px Pretendard`, text))); } catch { /* 그냥 그린다 */ }
}

function paintStat() {
  if (isGram()) { $('stat').textContent = `문법 — 찍은 것 ${GRAMMAR_POINTS.filter((x) => done.has('g:' + x.id)).length} / ${GRAMMAR_POINTS.length}`; return; }
  if (mode !== 'read') { const all = roundsOf().flat(); $('stat').textContent = `${mode === 'listen' ? `TOPIK ${$('exam').value} 듣기` : 'TOPIK II 쓰기'} — 찍은 것 ${all.filter((x) => done.has(x.id)).length} / ${all.length}`; return; }
  const n = ALL[$('exam').value].filter((x) => done.has(x.id)).length;
  $('stat').textContent = `TOPIK ${$('exam').value} 읽기 — 찍은 문제 ${n} / ${ALL[$('exam').value].length}`;
}

/* ── 마이크 ── */
let mic = null, meterRaf = 0;
async function micStart(deviceId) {
  mic?.getTracks().forEach((t) => t.stop());
  mic = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId ? { exact: deviceId } : undefined, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const ac = new AudioContext(), an = ac.createAnalyser(); an.fftSize = 512; ac.createMediaStreamSource(mic).connect(an);
  const buf = new Uint8Array(an.fftSize); cancelAnimationFrame(meterRaf);
  const tick = () => { an.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128)); micLevel = Math.min(1, m / 128 * 2.2); $('lvl').style.width = Math.min(100, m / 128 * 180) + '%'; $('lvl').style.background = m > 115 ? '#D33A2C' : '#2E9B5B'; meterRaf = requestAnimationFrame(tick); };
  tick();
  const devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput');
  const now = mic.getAudioTracks()[0].getSettings().deviceId;
  $('micSel').innerHTML = devs.map((d, i) => `<option value="${d.deviceId}"${d.deviceId === now ? ' selected' : ''}>${d.label || '마이크 ' + (i + 1)}</option>`).join('');
  $('micSel').hidden = false; $('micOn').textContent = '🎙️ 켜짐'; $('micOn').classList.add('on');
}
$('micOn').addEventListener('click', () => micStart().catch((e) => alert('마이크를 못 켰어요: ' + e.message)));
$('micSel').addEventListener('change', () => micStart($('micSel').value).catch((e) => alert(e.message)));

/* ── 녹화 ── */
const MIME = ['video/mp4;codecs="avc1.640028,mp4a.40.2"', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
  .find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';
const EXT = MIME.startsWith('video/mp4') ? 'mp4' : 'webm';
const COVER_MS = 1000;   // 영상 첫 1초는 표지 — 틱톡 · 쇼츠가 영상 속 장면을 표지로 쓸 때 이 장면이 잡힌다
let rec = null, chunks = [], t0 = 0, timer = 0, frameRaf = 0, counting = false, take = null;
$('recInfo').insertAdjacentHTML('beforeend', `<br>파일 형식: <b>${EXT}</b>` + (EXT === 'mp4' ? '' : ' — 올릴 때 액션이 mp4 로 바꿔요'));

async function recStart() {
  if (!mic) { try { await micStart(); } catch (e) { alert('마이크를 못 켰어요: ' + e.message); return; } }
  takeClose();
  counting = true; $('count').hidden = false;
  for (const n of [3, 2, 1]) { $('count').textContent = n; await new Promise((r) => setTimeout(r, 800)); }
  $('count').hidden = true; counting = false;
  /* 원본(master)은 화면에 안 붙어 있어서 저절로는 프레임이 안 나온다(시험에서 4초에 2장) → 그릴 때마다 한 장씩 직접 보낸다 */
  const vs = master.captureStream(0); vTrack = vs.getVideoTracks()[0];
  const stream = new MediaStream([...vs.getVideoTracks(), ...mic.getAudioTracks()]);
  /* 3Mbps — 글자 화면은 이 정도로 충분히 또렷하고, 1분 영상이 20MB 쯤이라 저장소 한도(파일 하나 50MB) 안에 든다 */
  rec = new MediaRecorder(stream, { mimeType: MIME, videoBitsPerSecond: 3e6, audioBitsPerSecond: 128e3 });
  chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const snap = { q, hook: $('hook').value.trim(), style: coverStyle, mode, deck: isDeck(), slides, key: keyOf(q), series: seriesNow() };
  rec.onstop = () => takeOpen(snap);
  /* 읽기는 첫 1초를 표지로 끼우고, 문법은 첫 장(0장)이 표지라 그 장부터 찍는다 */
  slideGo(0);
  t0 = Date.now(); recCover = !snap.deck; rec.start(1000);
  if (recCover) setTimeout(() => { recCover = false; }, COVER_MS);
  /* 캔버스는 바뀔 때만 다시 그려져서, 가만히 있으면 프레임이 비어 영상이 끊겨 보인다 → 녹화 중에는 계속 그린다 */
  const loop = () => { draw(); frameRaf = requestAnimationFrame(loop); }; loop();
  /* 30fps 로 고르게 — 탭이 뒤로 가 requestAnimationFrame 이 멈춰도 영상은 끊기지 않게 타이머로 */
  frameTimer = setInterval(() => { if (document.hidden) { drawMaster(); pushFrame(); } }, 1000 / 30);
  timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('time').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; $('time').classList.toggle('warn', s >= 60); }, 250);
  $('rec').classList.add('live'); $('rec').innerHTML = '■ 멈추기 <kbd style="color:#fff">R</kbd>';
  for (const b of ['prev', 'next', 'pick', 'exam', 'grade', 'coverSel', 'mode']) $(b).disabled = true;
}
function recStop() {
  if (!rec) return;
  rec.stop(); rec = null; recCover = false; cancelAnimationFrame(frameRaf); clearInterval(timer); clearInterval(frameTimer); vTrack = null; draw();
  $('rec').classList.remove('live'); $('rec').innerHTML = '● 녹화 시작 <kbd style="color:#fff">R</kbd>';
  for (const b of ['prev', 'next', 'pick', 'exam', 'grade', 'coverSel', 'mode']) $(b).disabled = false;
}
$('rec').addEventListener('click', () => { if (counting) return; rec ? recStop() : recStart(); });

/* 표지 그림(cover.jpg) — 영상 첫 장면과 같은 그림 */
async function coverBlob(snap) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  if (snap.deck) drawDeck(c.getContext('2d'), snap.mode, snap.q, snap.slides, 0, snap.hook, Infinity);
  else drawCover(c.getContext('2d'), snap.q, snap.style, { hook: snap.hook, logo: logoOk() });
  return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
}

/* ── 찍은 것 확인 — 들어 보고 「대기열에 올리기」 · 「파일 받기」 · 「다시 찍기」 ── */
async function takeOpen(snap) {
  const video = new Blob(chunks, { type: MIME.split(';')[0] });
  take = { ...snap, video, cover: await coverBlob(snap), sec: Math.round((Date.now() - t0) / 1000) };
  $('takeVid').src = URL.createObjectURL(video);
  $('takeInfo').textContent = `${snap.mode === 'gram' ? snap.q.name : snap.q.id} · ${take.sec}초 · ${(video.size / 1048576).toFixed(1)}MB`;
  $('take').hidden = false; $('takeUp').disabled = false; $('takeMsg').textContent = '';
}
function takeClose() { if (take) URL.revokeObjectURL($('takeVid').src); take = null; $('take').hidden = true; }
function markDone(key) {
  done.add(key); store.set('cp-shorts-done', [...done]);
  const o = $('pick').options[list.findIndex((x) => keyOf(x) === key)]; if (o && !o.text.startsWith('✓')) o.text = '✓ ' + o.text;
  paintStat();
}
const fileOf = (t) => `${{ read: 'topik-reading', listen: 'topik-listening', write: 'topik-writing', gram: 'korean-grammar' }[t.mode]}-${t.q.id}`;
const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60e3); };
$('takeDl').addEventListener('click', () => { if (!take) return; dl(take.video, `${fileOf(take)}.${EXT}`); dl(take.cover, `${fileOf(take)}-cover.jpg`); markDone(take.key); });
$('takeRedo').addEventListener('click', () => { takeClose(); });
$('takeUp').addEventListener('click', async () => {
  if (!take) return;
  if (take.video.size > 50 * 1048576) { $('takeMsg').textContent = '50MB 가 넘어요 — 짧게 다시 찍거나 「파일 받기」로 받아 주세요.'; return; }
  $('takeUp').disabled = true; $('takeMsg').textContent = '올리는 중…';
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('로그인이 필요해요 — everykoreans.com 에서 운영자 계정으로 로그인한 뒤 이 쪽을 새로 고쳐 주세요.');
    const base = `${new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10)}/${take.mode === 'gram' ? 'g' : ''}${take.q.id}-${Date.now()}`;
    const up = async (path, blob, type) => { const { error } = await sb.storage.from('shorts').upload(path, blob, { contentType: type, upsert: false }); if (error) throw error; };
    await up(`${base}.${EXT}`, take.video, MIME.split(';')[0]);
    await up(`${base}.jpg`, take.cover, 'image/jpeg');
    const m = metaOf(take.mode, take.q, take.hook, take.series);
    const { error } = await sb.from('shorts_queue').insert({ qid: take.key, exam: take.mode === 'read' ? take.q.exam : take.mode === 'listen' ? `listen-${take.q.exam}` : take.mode, video_path: `${base}.${EXT}`, cover_path: `${base}.jpg`,
      mime: MIME.split(';')[0], seconds: take.sec, title: m.title, description: m.description, caption: m.caption, tags: m.tags, cover_style: take.deck ? take.mode : take.style });
    if (error) throw error;
    markDone(take.key); $('takeMsg').innerHTML = '<span class="done">대기열에 올렸어요 ✓</span> → 정해진 시각에 액션이 올려요.';
    setTimeout(() => { takeClose(); step(1); }, 900);
    queueLoad();
  } catch (e) { $('takeUp').disabled = false; $('takeMsg').textContent = '못 올렸어요: ' + (e.message || e); }
});

/* ── 대기열 — 최근 12개, 곳마다 올림 / 기다림 / 실패 ── */
const mark = (x) => (!x ? '⏳' : x.ok ? '✅' : x.skip ? '⏭️' : '⚠️');
async function queueLoad() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { $('queue').innerHTML = '<span class="muted">사이트에서 운영자 계정으로 로그인하면 대기열이 보여요.</span>'; return; }
  const { data, error } = await sb.from('shorts_queue').select('id,qid,status,yt,ig,tt,caption,created_at').order('id', { ascending: false }).limit(12);
  if (error) { $('queue').innerHTML = `<span class="muted">대기열을 못 읽었어요(${error.message}) — db/add_shorts.sql 을 돌렸는지 봐 주세요.</span>`; return; }
  $('queue').innerHTML = data.length ? data.map((r) => `<div class="qrow"><b>${r.qid}</b><span class="muted">${r.status}</span>
    <span title="유튜브 · 인스타 · 틱톡">▶️${mark(r.yt)} 📷${mark(r.ig)} 🎵${mark(r.tt)}</span>
    <button class="btn" data-cap="${r.id}">글 복사</button>${r.status === 'ready' ? `<button class="btn" data-cancel="${r.id}">빼기</button>` : ''}</div>`).join('')
    : '<span class="muted">아직 없어요.</span>';
  queueRows = data;
}
let queueRows = [];
$('queue').addEventListener('click', async (e) => {
  const cap = e.target.closest('[data-cap]')?.dataset.cap, cancel = e.target.closest('[data-cancel]')?.dataset.cancel;
  if (cap) { const r = queueRows.find((x) => String(x.id) === cap); try { await navigator.clipboard.writeText(r.caption); e.target.textContent = '복사됨'; } catch { prompt('복사해 주세요', r.caption); } }
  if (cancel && confirm('이 영상을 대기열에서 뺄까요? (올리지 않아요)')) { await sb.from('shorts_queue').update({ status: 'cancel' }).eq('id', cancel); queueLoad(); }
});
$('queueRe').addEventListener('click', queueLoad);

/* 제목 · 설명 — 대기열과 같은 틀(shorts-cover.js shortsMeta) */
$('copy').addEventListener('click', async () => {
  const m = metaOf(mode, q, $('hook').value.trim(), seriesNow()), d = `${m.title}\n\n${m.description}`;
  try { await navigator.clipboard.writeText(d); $('copy').textContent = '📋 복사했어요'; } catch { prompt('복사해 주세요', d); }
  setTimeout(() => { $('copy').textContent = '📋 제목 · 설명 복사'; }, 1500);
});

/* 글쇠 */
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  /* 문법: → · Space · PageDown 다음 장, ← · PageUp 앞 장 — 녹화 중에도(넘기며 설명한다) */
  if ([' ', 'pagedown', 'arrowdown'].includes(k) || (isDeck() && k === 'arrowright')) { e.preventDefault(); slideGo(slide + 1); return; }
  if (['pageup', 'arrowup'].includes(k) || (isDeck() && k === 'arrowleft')) { e.preventDefault(); slideGo(slide - 1); return; }
  if (k === 'r') { e.preventDefault(); $('rec').click(); }
  else if (rec || counting) { /* 녹화 중에는 문제를 못 바꾼다 */ if (k === 'h') setTool('hl'); else if (k === 'p') setTool('pen'); else if (k === 'a') toggleAns(); else if (k === 'w') toggleWhy(); else if (k === 'z') $('undo').click(); else if (k === 'c') $('clear').click(); else if (['1', '2', '3'].includes(k)) { pen = +k - 1; paintPens(); } }
  else if (k === 't') toggleCover();
  else if (k === 'h') setTool('hl'); else if (k === 'p') setTool('pen');
  else if (k === 'arrowright') step(1); else if (k === 'arrowleft') step(-1);
  else if (k === 'a') toggleAns(); else if (k === 'w') toggleWhy(); else if (k === 'z') $('undo').click(); else if (k === 'c') $('clear').click();
  else if (['1', '2', '3'].includes(k)) { pen = +k - 1; paintPens(); }
});

/* 태블릿 막대 — 화면 위 단추가 옆 칸 단추를 그대로 누른다(글쇠가 없는 태블릿에서도 한 손으로) */
for (const [b, t] of [['bUndo', 'undo'], ['bAns', 'answer'], ['bWhy', 'why'], ['bRec', 'rec']]) $(b).addEventListener('click', () => $(t).click());
/* ← → : 문법은 장 넘기기, 읽기는 문제 바꾸기 — 다만 녹화 중에는(문제를 못 바꾸므로) 긴 문제의 두 장 넘기기 */
const pagesNow = () => isDeck() || (rec && pageCount() > 1);
$('bPrev').addEventListener('click', () => (pagesNow() ? slideGo(slide - 1) : $('prev').click()));
$('bNext').addEventListener('click', () => (pagesNow() ? slideGo(slide + 1) : $('next').click()));
new MutationObserver(() => { $('bRec').classList.toggle('live', $('rec').classList.contains('live')); $('bRec').textContent = $('rec').classList.contains('live') ? '■' : '●';
  $('bAns').classList.toggle('on', showAns); $('bWhy').classList.toggle('on', showWhy);
  if (!isDeck() && !(rec && pageCount() > 1)) { $('bPrev').disabled = $('prev').disabled; $('bNext').disabled = $('next').disabled; } else { $('bPrev').disabled = $('bNext').disabled = false; } })
  .observe(document.querySelector('.panel'), { subtree: true, attributes: true, childList: true });

/* 표지 고르기 · 미리 보기 */
$('coverSel').innerHTML = COVER_STYLES.map(([k, n]) => `<option value="${k}"${k === coverStyle ? ' selected' : ''}>${k} ${n}</option>`).join('');
$('coverSel').addEventListener('change', () => { coverStyle = $('coverSel').value; store.set('cp-shorts-cover2', coverStyle); draw(); });
function toggleCover() { coverPrev = !coverPrev; $('coverPrev').classList.toggle('on', coverPrev); draw(); }
$('coverPrev').addEventListener('click', toggleCover);
sb.auth.getSession().then(({ data: { session } }) => { $('who').innerHTML = session ? `로그인: <b>${session.user.email}</b>` : '로그인 안 됨 — everykoreans.com 에서 로그인하고 새로 고쳐 주세요(대기열에 올리려면 필요해요).'; });
queueLoad();

/* 시작 — 지난번 갈래 · 지난번 문제로 */
paintPens();
const last = store.get('cp-shorts-last', null);
if (last?.exam) $('exam').value = last.exam;
$('mode').value = mode;
applyMode();
