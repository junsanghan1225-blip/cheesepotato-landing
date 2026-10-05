/* 치즈감자 쇼츠 촬영소(shorts.html) — TOPIK 읽기 문제를 세로 영상으로 찍는다(운영자 요청 2026-10-05).
   「공장처럼 찍어낼 거야 — 간단한 형광펜만 있으면 될 것 같아」

   - 화면은 <canvas> 1080×1920(쇼츠 · 릴스 세로). 영상에 찍히는 것은 이 캔버스 그대로다(다른 창 · 알림은 안 들어간다).
   - 녹화 = 캔버스 영상(captureStream) + 마이크 소리 → MediaRecorder → 파일로 내려받기. 크롬이 되면 mp4, 안 되면 webm.
   - 쇼츠 · 릴스는 아래쪽(제목 · 채널)과 오른쪽(좋아요 단추)을 가린다 → 글은 SAFE 안에만 둔다.
   - 형광펜 자국은 캔버스 좌표로 남긴다. 그래서 정답 · 풀이를 보여도 글 자리가 안 움직이게, 풀이 칸 자리를 처음부터 잡아 둔다.
   - 찍은 문제는 이 브라우저에 적어 두고(localStorage) 「찍은 것 건너뛰기」로 다음 안 찍은 문제로 간다. */
import { TOPIK_READING } from './topik.js';
import { TOPIK2_READING } from './topik2.js';
import { drawCover, COVER_STYLES, shortsMeta } from './shorts-cover.js';
import { createClient } from './vendor/supabase-js.js';

/* 사이트와 같은 Supabase(공개 키 — 막는 것은 표의 RLS). 사이트에서 로그인한 세션을 같이 쓴다(같은 주소라 저장 칸이 같다). */
const sb = createClient('https://tjgoevtvobvmlyefgxel.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });

const $ = (id) => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const W = 1080, H = 1920;
const SAFE = { x: 64, r: W - 130, top: 120, bottom: 1500 };
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
let strokes = [], cur = null, pen = 1, straight = true, showAns = false, showWhy = false, L = null;

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

/* ── 배치: 글 크기 s 를 1 → 0.55 로 줄여 가며 SAFE 안에 다 들어가는 첫 크기를 쓴다. 풀이 칸 자리도 같이 잡는다. ── */
function layout(q, hook) {
  for (let s = 1.4; s >= 0.3; s -= 0.025) {   // 짧은 문제는 글을 키워 화면을 채운다
    const b = [], X = SAFE.x, CW = SAFE.r - SAFE.x;
    let y = SAFE.top;
    font(30, 800); b.push({ k: 'brand', y: y + 30 }); y += 58;
    if (hook) { const hs = Math.round(56 * Math.min(1.15, Math.max(s, 0.8))); font(hs, 900); const ls = wrap(hook, CW); b.push({ k: 'hook', ls, size: hs, y }); y += ls.length * Math.round(hs * 1.25) + 18; }
    font(28, 700); b.push({ k: 'chip', y }); y += 64;
    const fs = Math.round(40 * s), lh = Math.round(fs * 1.6), pad = Math.round(36 * s);
    if (q.sentence) { font(fs, 600); const ls = wrap(q.sentence, CW - pad * 2 - 20); b.push({ k: 'sent', ls, fs, lh, pad, y }); y += ls.length * lh + pad * 2 - 10 + 22; }
    font(fs, 500); const pl = wrap(q.passage, CW - pad * 2); b.push({ k: 'pass', ls: pl, fs, lh, pad, y }); y += pl.length * lh + pad * 2 + Math.round(30 * s);
    const qs = Math.round(38 * s); font(qs, 800); const ql = wrap(q.question, CW); b.push({ k: 'q', ls: ql, fs: qs, lh: Math.round(qs * 1.45), y }); y += ql.length * Math.round(qs * 1.45) + Math.round(22 * s);
    const os = Math.round(40 * s), olh = Math.round(os * 1.45), opad = Math.round(20 * s);
    const opts = q.options.map((o) => { font(os, 600); const ls = wrap(o, CW - opad * 2 - os * 1.6); const h = ls.length * olh + opad * 2; const r = { ls, y, h }; y += h + Math.round(14 * s); return r; });
    b.push({ k: 'opts', opts, fs: os, lh: olh, pad: opad });
    y += Math.round(16 * s);
    const ws = Math.round(32 * s), wlh = Math.round(ws * 1.5), wpad = Math.round(26 * s);
    font(ws, 500); const wl = wrap('💡 ' + q.why, CW - wpad * 2);
    const wh = wl.length * wlh + wpad * 2; b.push({ k: 'why', ls: wl, fs: ws, lh: wlh, pad: wpad, y, h: wh }); y += wh;
    if (y <= SAFE.bottom || s <= 0.31) return { s, b, X, CW, fit: y <= SAFE.bottom };
  }
}

/* 밑줄 칠 곳(mark) — 지문 안 글자 위치 */
const markRange = (q) => { if (!q.mark) return null; const i = q.passage.indexOf(q.mark); return i < 0 ? null : [i, i + q.mark.length]; };

function roundRect(x, y, w, h, r, fill, stroke, lw = 3) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function draw() {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  if (!q || !L) return;
  if (coverPrev || recCover) { drawCover(ctx, q, coverStyle, { hook: $('hook').value.trim(), logo: logo.complete && logo.naturalWidth ? logo : null }); return; }
  const { X, CW } = L;
  ctx.textBaseline = 'alphabetic';
  for (const b of L.b) {
    if (b.k === 'brand') { font(30, 800); ctx.fillStyle = C.or; if (logo.naturalWidth) ctx.drawImage(logo, X, b.y - 42, 54, 54 * logo.height / logo.width); ctx.fillText('치즈감자', X + (logo.naturalWidth ? 64 : 0), b.y); font(26, 600); ctx.fillStyle = C.dim; ctx.textAlign = 'right'; ctx.fillText('everykoreans.com', SAFE.r, b.y); ctx.textAlign = 'left'; }
    if (b.k === 'hook') { font(b.size, 900); ctx.fillStyle = C.ink; b.ls.forEach((l, i) => ctx.fillText(l.t, X, b.y + b.size + i * Math.round(b.size * 1.25))); }
    if (b.k === 'chip') {
      font(28, 700); const t = `TOPIK ${q.exam} · 읽기 ${q.slot}번 · ${q.grade}급`; const w = ctx.measureText(t).width + 40;
      roundRect(X, b.y, w, 48, 24, C.or); ctx.fillStyle = '#fff'; ctx.fillText(t, X + 20, b.y + 34);
      font(24, 600); ctx.fillStyle = C.dim; ctx.fillText('연습 문제 · 기출 아님', X + w + 16, b.y + 33);
    }
    if (b.k === 'sent') {
      const h = b.ls.length * b.lh + b.pad * 2 - 10; ctx.setLineDash([12, 8]); roundRect(X, b.y, CW, h, 16, C.card, C.ink2, 3); ctx.setLineDash([]);
      font(b.fs, 600); ctx.fillStyle = C.ink; b.ls.forEach((l, i) => ctx.fillText(l.t, X + b.pad, b.y + b.pad - 5 + b.fs + i * b.lh));
    }
    if (b.k === 'pass') {
      const h = b.ls.length * b.lh + b.pad * 2; roundRect(X, b.y, CW, h, 18, C.card, C.line, 3);
      font(b.fs, 500); ctx.fillStyle = C.ink; const mr = markRange(q);
      b.ls.forEach((l, i) => {
        const ty = b.y + b.pad + b.fs + i * b.lh - Math.round(b.fs * 0.1);
        ctx.fillText(l.t, X + b.pad, ty);
        if (mr && mr[0] < l.end && mr[1] > l.start) {
          const a = Math.max(mr[0], l.start) - l.start, z = Math.min(mr[1], l.end) - l.start;
          const x0 = X + b.pad + ctx.measureText(l.t.slice(0, a)).width, x1 = X + b.pad + ctx.measureText(l.t.slice(0, z)).width;
          ctx.fillRect(x0, ty + 8, x1 - x0, 3);
        }
      });
    }
    if (b.k === 'q') { font(b.fs, 800); ctx.fillStyle = C.ink; b.ls.forEach((l, i) => ctx.fillText(l.t, X, b.y + b.fs + i * b.lh)); }
    if (b.k === 'opts') b.opts.forEach((o, i) => {
      const ok = showAns && i === q.answer, dimmed = showAns && i !== q.answer;
      roundRect(X, o.y, CW, o.h, 16, ok ? C.greenBg : C.card, ok ? C.green : C.line, ok ? 5 : 3);
      font(b.fs, 700); ctx.fillStyle = ok ? C.green : dimmed ? C.dim : C.ink;
      ctx.fillText(CIRCLED[i], X + b.pad, o.y + b.pad + b.fs - 4);
      font(b.fs, ok ? 800 : 600);
      o.ls.forEach((l, j) => ctx.fillText(l.t, X + b.pad + b.fs * 1.6, o.y + b.pad + b.fs - 4 + j * b.lh));
      if (ok) { font(b.fs, 900); ctx.textAlign = 'right'; ctx.fillText('✓', X + CW - b.pad, o.y + b.pad + b.fs - 4); ctx.textAlign = 'left'; }
    });
    if (b.k === 'why') {
      if (showWhy) {
        roundRect(X, b.y, CW, b.h, 16, '#FFF6D6', '#E8C969', 3);
        font(b.fs, 500); ctx.fillStyle = C.ink2; b.ls.forEach((l, i) => ctx.fillText(l.t, X + b.pad, b.y + b.pad + b.fs - 4 + i * b.lh));
      } else if (!showAns) {
        font(Math.round(40 * L.s), 800); ctx.fillStyle = C.or; ctx.textAlign = 'center';
        ctx.fillText('정답은? 댓글로 👇', X + CW / 2, b.y + Math.round(60 * L.s)); ctx.textAlign = 'left';
      }
    }
  }
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
const hlW = () => Math.round((L ? L.b.find((b) => b.k === 'pass').fs : 40) * 1.15);
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
const toggleAns = () => { showAns = !showAns; if (!showAns) showWhy = false; paintBtns(); draw(); };
const toggleWhy = () => { showWhy = !showWhy; if (showWhy) showAns = true; paintBtns(); draw(); };
function paintBtns() { $('answer').classList.toggle('on', showAns); $('why').classList.toggle('on', showWhy); }
$('answer').addEventListener('click', toggleAns);
$('why').addEventListener('click', toggleWhy);

/* ── 문제 고르기 ── */
const hookKey = 'cp-shorts-hook';
$('hook').value = store.get(hookKey, '이 문제, 30초 안에 풀 수 있어요?');
$('hook').addEventListener('input', () => { store.set(hookKey, $('hook').value); relayout(); });

function fillGrades() {
  const ex = $('exam').value, gs = [...new Set(ALL[ex].map((x) => x.grade))].sort();
  $('grade').innerHTML = '<option value="">모든 급</option>' + gs.map((g) => `<option value="${g}">${g}급</option>`).join('');
}
function fillList(keepId) {
  const ex = $('exam').value, g = $('grade').value;
  list = ALL[ex].filter((x) => !g || String(x.grade) === g).slice().sort((a, b) => a.slot - b.slot || a.id.localeCompare(b.id));
  $('pick').innerHTML = list.map((x, i) => `<option value="${i}">${done.has(x.id) ? '✓ ' : ''}${x.slot}번 · ${x.topic || x.type} (${x.id})</option>`).join('');
  const k = keepId ? list.findIndex((x) => x.id === keepId) : -1;
  go(k >= 0 ? k : firstTodo(0, 1));
}
function firstTodo(from, dir) {
  if (!$('skipDone').checked) return Math.max(0, Math.min(list.length - 1, from));
  for (let n = 0; n < list.length; n++) { const i = (from + dir * n + list.length * 2) % list.length; if (!done.has(list[i].id)) return i; }
  return Math.max(0, Math.min(list.length - 1, from));
}
async function go(i) {
  if (!list.length) return;
  idx = (i + list.length) % list.length; q = list[idx];
  $('pick').value = idx; strokes = []; showAns = false; showWhy = false; paintBtns();
  store.set('cp-shorts-last', { exam: $('exam').value, id: q.id });
  await fontsReady(q);
  relayout();
  $('info').innerHTML = `${q.genre || ''} · ${q.type} · 정답 ${CIRCLED[q.answer]}` + (done.has(q.id) ? ' · <span class="done">찍음 ✓</span>' : '') + (L && !L.fit ? ' · <b style="color:#D33A2C">글이 길어 아래가 가려질 수 있어요</b>' : '');
  paintStat();
}
function relayout() { if (q) { L = layout(q, $('hook').value.trim()); draw(); } }
const step = (dir) => go(firstTodo(idx + dir, dir));
$('prev').addEventListener('click', () => step(-1));
$('next').addEventListener('click', () => step(1));
$('pick').addEventListener('change', () => go(+$('pick').value));
$('exam').addEventListener('change', () => { fillGrades(); fillList(); });
$('grade').addEventListener('change', () => fillList());
$('skipDone').addEventListener('change', () => fillList(q?.id));

/* 글꼴 — Pretendard 는 글자 범위마다 파일이 나뉘어 있어, 그릴 글자를 먼저 불러 둔다 */
async function fontsReady(q) {
  const text = [q.passage, q.question, q.sentence || '', q.why, ...q.options, $('hook').value, 'TOPIK 읽기 번급 연습 문제 기출 아님 치즈감자 everykoreans.com 정답은? 댓글로 ①②③④✓'].join('');
  try { await Promise.all([500, 600, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px Pretendard`, text))); } catch { /* 그냥 그린다 */ }
}

function paintStat() {
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
  const tick = () => { an.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128)); $('lvl').style.width = Math.min(100, m / 128 * 180) + '%'; $('lvl').style.background = m > 115 ? '#D33A2C' : '#2E9B5B'; meterRaf = requestAnimationFrame(tick); };
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
  const vs = cv.captureStream(30);
  const stream = new MediaStream([...vs.getVideoTracks(), ...mic.getAudioTracks()]);
  /* 3Mbps — 글자 화면은 이 정도로 충분히 또렷하고, 1분 영상이 20MB 쯤이라 저장소 한도(파일 하나 50MB) 안에 든다 */
  rec = new MediaRecorder(stream, { mimeType: MIME, videoBitsPerSecond: 3e6, audioBitsPerSecond: 128e3 });
  chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const snap = { q, hook: $('hook').value.trim(), style: coverStyle };
  rec.onstop = () => takeOpen(snap);
  t0 = Date.now(); recCover = true; rec.start(1000);
  setTimeout(() => { recCover = false; }, COVER_MS);
  /* 캔버스는 바뀔 때만 다시 그려져서, 가만히 있으면 프레임이 비어 영상이 끊겨 보인다 → 녹화 중에는 계속 그린다 */
  const loop = () => { draw(); frameRaf = requestAnimationFrame(loop); }; loop();
  timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('time').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; $('time').classList.toggle('warn', s >= 60); }, 250);
  $('rec').classList.add('live'); $('rec').innerHTML = '■ 멈추기 <kbd style="color:#fff">R</kbd>';
  for (const b of ['prev', 'next', 'pick', 'exam', 'grade', 'coverSel']) $(b).disabled = true;
}
function recStop() {
  if (!rec) return;
  rec.stop(); rec = null; recCover = false; cancelAnimationFrame(frameRaf); clearInterval(timer); draw();
  $('rec').classList.remove('live'); $('rec').innerHTML = '● 녹화 시작 <kbd style="color:#fff">R</kbd>';
  for (const b of ['prev', 'next', 'pick', 'exam', 'grade', 'coverSel']) $(b).disabled = false;
}
$('rec').addEventListener('click', () => { if (counting) return; rec ? recStop() : recStart(); });

/* 표지 그림(cover.jpg) — 영상 첫 장면과 같은 그림 */
async function coverBlob(snap) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  drawCover(c.getContext('2d'), snap.q, snap.style, { hook: snap.hook, logo });
  return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
}

/* ── 찍은 것 확인 — 들어 보고 「대기열에 올리기」 · 「파일 받기」 · 「다시 찍기」 ── */
async function takeOpen(snap) {
  const video = new Blob(chunks, { type: MIME.split(';')[0] });
  take = { ...snap, video, cover: await coverBlob(snap), sec: Math.round((Date.now() - t0) / 1000) };
  $('takeVid').src = URL.createObjectURL(video);
  $('takeInfo').textContent = `${snap.q.id} · ${take.sec}초 · ${(video.size / 1048576).toFixed(1)}MB`;
  $('take').hidden = false; $('takeUp').disabled = false; $('takeMsg').textContent = '';
}
function takeClose() { if (take) URL.revokeObjectURL($('takeVid').src); take = null; $('take').hidden = true; }
function markDone(id) {
  done.add(id); store.set('cp-shorts-done', [...done]);
  const o = $('pick').options[list.findIndex((x) => x.id === id)]; if (o && !o.text.startsWith('✓')) o.text = '✓ ' + o.text;
  paintStat();
}
const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60e3); };
$('takeDl').addEventListener('click', () => { if (!take) return; dl(take.video, `topik-reading-${take.q.id}.${EXT}`); dl(take.cover, `topik-reading-${take.q.id}-cover.jpg`); markDone(take.q.id); });
$('takeRedo').addEventListener('click', () => { takeClose(); });
$('takeUp').addEventListener('click', async () => {
  if (!take) return;
  if (take.video.size > 50 * 1048576) { $('takeMsg').textContent = '50MB 가 넘어요 — 짧게 다시 찍거나 「파일 받기」로 받아 주세요.'; return; }
  $('takeUp').disabled = true; $('takeMsg').textContent = '올리는 중…';
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('로그인이 필요해요 — everykoreans.com 에서 운영자 계정으로 로그인한 뒤 이 쪽을 새로 고쳐 주세요.');
    const base = `${new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10)}/${take.q.id}-${Date.now()}`;
    const up = async (path, blob, type) => { const { error } = await sb.storage.from('shorts').upload(path, blob, { contentType: type, upsert: false }); if (error) throw error; };
    await up(`${base}.${EXT}`, take.video, MIME.split(';')[0]);
    await up(`${base}.jpg`, take.cover, 'image/jpeg');
    const m = shortsMeta(take.q, take.hook);
    const { error } = await sb.from('shorts_queue').insert({ qid: take.q.id, exam: take.q.exam, video_path: `${base}.${EXT}`, cover_path: `${base}.jpg`,
      mime: MIME.split(';')[0], seconds: take.sec, title: m.title, description: m.description, caption: m.caption, tags: m.tags, cover_style: take.style });
    if (error) throw error;
    markDone(take.q.id); $('takeMsg').innerHTML = '<span class="done">대기열에 올렸어요 ✓</span> → 정해진 시각에 액션이 올려요.';
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
  const m = shortsMeta(q, $('hook').value.trim()), d = `${m.title}\n\n${m.description}`;
  try { await navigator.clipboard.writeText(d); $('copy').textContent = '📋 복사했어요'; } catch { prompt('복사해 주세요', d); }
  setTimeout(() => { $('copy').textContent = '📋 제목 · 설명 복사'; }, 1500);
});

/* 글쇠 */
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 'r') { e.preventDefault(); $('rec').click(); }
  else if (rec || counting) { /* 녹화 중에는 문제를 못 바꾼다 */ if (k === 'h') setTool('hl'); else if (k === 'p') setTool('pen'); else if (k === 'a') toggleAns(); else if (k === 'w') toggleWhy(); else if (k === 'z') $('undo').click(); else if (k === 'c') $('clear').click(); else if (['1', '2', '3'].includes(k)) { pen = +k - 1; paintPens(); } }
  else if (k === 't') toggleCover();
  else if (k === 'h') setTool('hl'); else if (k === 'p') setTool('pen');
  else if (k === 'arrowright') step(1); else if (k === 'arrowleft') step(-1);
  else if (k === 'a') toggleAns(); else if (k === 'w') toggleWhy(); else if (k === 'z') $('undo').click(); else if (k === 'c') $('clear').click();
  else if (['1', '2', '3'].includes(k)) { pen = +k - 1; paintPens(); }
});

/* 태블릿 막대 — 화면 위 단추가 옆 칸 단추를 그대로 누른다(글쇠가 없는 태블릿에서도 한 손으로) */
for (const [b, t] of [['bUndo', 'undo'], ['bAns', 'answer'], ['bWhy', 'why'], ['bRec', 'rec'], ['bPrev', 'prev'], ['bNext', 'next']]) $(b).addEventListener('click', () => $(t).click());
new MutationObserver(() => { $('bRec').classList.toggle('live', $('rec').classList.contains('live')); $('bRec').textContent = $('rec').classList.contains('live') ? '■' : '●';
  $('bAns').classList.toggle('on', showAns); $('bWhy').classList.toggle('on', showWhy); $('bPrev').disabled = $('prev').disabled; $('bNext').disabled = $('next').disabled; })
  .observe(document.querySelector('.panel'), { subtree: true, attributes: true, childList: true });

/* 표지 고르기 · 미리 보기 */
$('coverSel').innerHTML = COVER_STYLES.map(([k, n]) => `<option value="${k}"${k === coverStyle ? ' selected' : ''}>${k} ${n}</option>`).join('');
$('coverSel').addEventListener('change', () => { coverStyle = $('coverSel').value; store.set('cp-shorts-cover2', coverStyle); draw(); });
function toggleCover() { coverPrev = !coverPrev; $('coverPrev').classList.toggle('on', coverPrev); draw(); }
$('coverPrev').addEventListener('click', toggleCover);
sb.auth.getSession().then(({ data: { session } }) => { $('who').innerHTML = session ? `로그인: <b>${session.user.email}</b>` : '로그인 안 됨 — everykoreans.com 에서 로그인하고 새로 고쳐 주세요(대기열에 올리려면 필요해요).'; });
queueLoad();

/* 시작 — 지난번 문제로 */
paintPens();
const last = store.get('cp-shorts-last', null);
if (last?.exam) $('exam').value = last.exam;
fillGrades(); fillList(last?.id);
