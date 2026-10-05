/* 쇼츠 표지 · 제목 틀(shorts.js 가 쓴다) — 운영자 요청 2026-10-05: 「썸네일부터 전부 정형화해서 공장으로 뽑아낼 거야」
   - 표지는 1080×1920. 영상 첫 1초가 이 그림이고, 같은 그림을 cover.jpg 로도 저장한다(유튜브 · 인스타 표지).
   - 프로필 격자(인스타 · 틱톡)는 가운데 3:4 만 보여서, 중요한 글은 세로 240 ~ 1680 안에 둔다.
   - 모양 셋(A 시험지 · B 색판 · C 도전장) — 바꾸는 것은 문제 정보와 맨 위 한 줄(훅)뿐이다. */
export const COVER_STYLES = [['A', '시험지'], ['B', '색판'], ['C', '도전장']];
const FONT = '"Pretendard Variable", Pretendard, sans-serif';
const CIRCLED = ['①', '②', '③', '④'];
const W = 1080, H = 1920;

function wrap(ctx, text, width) {
  const out = []; let line = '';
  for (const w of String(text).split(/\s+/)) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width <= width || !line) line = t; else { out.push(line); line = w; }
  }
  if (line) out.push(line);
  return out;
}
const font = (ctx, size, weight = 800) => { ctx.font = `${weight} ${size}px ${FONT}`; };
/* 글이 줄 수 안에 들어갈 때까지 줄인다 */
/* 쉼표 · 물음표 뒤에서 먼저 줄을 바꾼다(「이 문제, / 30초 안에 풀 수 있어요?」 — 낱말 중간에 끊긴 것처럼 안 보이게) */
const parts = (text) => String(text).split(/(?<=[,?!.])\s+/);
const wrapP = (ctx, text, width) => parts(text).flatMap((p) => wrap(ctx, p, width));
function fit(ctx, text, width, size, maxLines, weight = 900, min = 40) {
  for (let s = size; s >= min; s -= 4) { font(ctx, s, weight); const ls = wrapP(ctx, text, width); if (ls.length <= maxLines) return { s, ls }; }
  font(ctx, min, weight); return { s: min, ls: wrapP(ctx, text, width).slice(0, maxLines) };
}
function rr(ctx, x, y, w, h, r, fill, stroke, lw = 4) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
/* 형광펜 한 줄 — 촬영소의 형광펜과 같은 느낌(조금 기울고 끝이 둥글다) */
function marker(ctx, x0, x1, y, h, color) {
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = h;
  ctx.beginPath(); ctx.moveTo(x0, y + 4); ctx.lineTo(x1, y - 4); ctx.stroke(); ctx.restore();
}
/* 훅 가운데 강조할 말 — 「30초」 같은 숫자 말, 없으면 마지막 낱말 */
const keyOf = (hook) => (hook.match(/\d+\s*초/) || hook.match(/\S+$/) || [''])[0];
function centerLines(ctx, ls, cx, y, lh, color, keyword, hl) {
  ls.forEach((l, i) => {
    const w = ctx.measureText(l).width, x = cx - w / 2, ty = y + i * lh;
    if (keyword && hl) { const k = l.indexOf(keyword); if (k >= 0) { const a = ctx.measureText(l.slice(0, k)).width, b = ctx.measureText(l.slice(0, k + keyword.length)).width; marker(ctx, x + a - 10, x + b + 10, ty - lh * 0.28, lh * 0.5, hl); } }
    ctx.fillStyle = color; ctx.fillText(l, x, ty);
  });
}
const label = (q) => `TOPIK ${q.exam} · ${q.grade}급`;

export function drawCover(ctx, q, style, { hook = '', logo = null } = {}) {
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const hk = hook || '이 문제, 풀 수 있어요?';
  if (style === 'B') coverB(ctx, q, hk, logo); else if (style === 'C') coverC(ctx, q, hk, logo); else coverA(ctx, q, hk, logo);
  ctx.restore();
}

/* A 시험지 — 바탕은 촬영소 화면과 같은 미색. 위에 마스코트, 가운데 큰 글, 아래에 문제 맛보기 카드 */
function coverA(ctx, q, hook, logo) {
  ctx.fillStyle = '#F7F3EA'; ctx.fillRect(0, 0, W, H);
  if (logo) ctx.drawImage(logo, W / 2 - 170, 250, 340, 340 * logo.height / logo.width);
  font(ctx, 44, 800); const t = label(q), tw = ctx.measureText(t).width + 64;
  rr(ctx, W / 2 - tw / 2, 560, tw, 76, 38, '#E1682B'); ctx.fillStyle = '#fff'; ctx.fillText(t, W / 2 - tw / 2 + 32, 613);
  font(ctx, 150, 900); ctx.fillStyle = '#1B1512'; const big = `읽기 ${q.slot}번`; ctx.fillText(big, W / 2 - ctx.measureText(big).width / 2, 800);
  const h = fit(ctx, hook, 900, 92, 2);
  centerLines(ctx, h.ls, W / 2, 960, Math.round(h.s * 1.3), '#1B1512', keyOf(hook), 'rgba(255, 221, 0, .75)');
  /* 문제 맛보기 — 질문 한 줄 + 보기 넷(길면 자른다) */
  const y0 = 1170, qq = fit(ctx, q.question, 820, 40, 2, 800, 32);
  rr(ctx, 90, y0, 900, 120 + qq.ls.length * qq.s * 1.35 + 4 * 64 - 30, 28, '#fff', '#D9D1C2', 4);
  font(ctx, qq.s, 800);
  qq.ls.forEach((l, i) => { ctx.fillStyle = '#1B1512'; ctx.fillText(l, 130, y0 + 70 + i * qq.s * 1.35); });
  font(ctx, 38, 600);
  q.options.forEach((o, i) => {
    let s = `${CIRCLED[i]} ${o}`; while (ctx.measureText(s).width > 820 && s.length > 4) s = s.slice(0, -2) + '…';
    ctx.fillStyle = '#4E3E31'; ctx.fillText(s, 130, y0 + 90 + qq.ls.length * qq.s * 1.35 + i * 64);
  });
  font(ctx, 34, 700); ctx.fillStyle = '#8C7A66'; const f = 'everykoreans.com · 연습 문제(기출 아님)'; ctx.fillText(f, W / 2 - ctx.measureText(f).width / 2, 1680);
}

/* B 색판 — 주황 바탕에 흰 큰 글. 급수는 노란 동그라미, 마스코트는 아래에 크게 */
function coverB(ctx, q, hook, logo) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#F07A35'); g.addColorStop(1, '#D9561C'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  font(ctx, 46, 800); ctx.fillStyle = 'rgba(255,255,255,.85)'; const top = '치즈감자 TOPIK 읽기'; ctx.fillText(top, W / 2 - ctx.measureText(top).width / 2, 300);
  font(ctx, 230, 900); ctx.fillStyle = '#fff'; const tk = `TOPIK ${q.exam}`; ctx.fillText(tk, W / 2 - ctx.measureText(tk).width / 2, 530);
  /* 급수 동그라미 + 번호 */
  ctx.beginPath(); ctx.arc(330, 700, 120, 0, Math.PI * 2); ctx.fillStyle = '#FFD84A'; ctx.fill();
  font(ctx, 110, 900); ctx.fillStyle = '#1B1512'; const gr = `${q.grade}급`; ctx.fillText(gr, 330 - ctx.measureText(gr).width / 2, 738);
  font(ctx, 96, 900); ctx.fillStyle = '#fff'; ctx.fillText(`${q.slot}번`, 500, 735);
  const h = fit(ctx, hook, 900, 90, 3);
  centerLines(ctx, h.ls, W / 2, 960, Math.round(h.s * 1.3), '#fff', null, null);
  if (q.topic) { font(ctx, 48, 700); const tp = `# ${q.topic}`, tw = ctx.measureText(tp).width + 60; rr(ctx, W / 2 - tw / 2, 960 + h.ls.length * h.s * 1.3 - 20, tw, 84, 42, 'rgba(0,0,0,.18)'); ctx.fillStyle = '#fff'; ctx.fillText(tp, W / 2 - tw / 2 + 30, 960 + h.ls.length * h.s * 1.3 + 38); }
  if (logo) { const lw = 460; ctx.drawImage(logo, W / 2 - lw / 2, 1290, lw, lw * logo.height / logo.width); }
  font(ctx, 34, 700); ctx.fillStyle = 'rgba(255,255,255,.85)'; const f = 'everykoreans.com · 기출 아님'; ctx.fillText(f, W / 2 - ctx.measureText(f).width / 2, 1680);
}

/* C 도전장 — 어두운 바탕, 큰 타이머 고리, 훅의 핵심 말에 노란 형광펜 */
function coverC(ctx, q, hook, logo) {
  ctx.fillStyle = '#1B1512'; ctx.fillRect(0, 0, W, H);
  font(ctx, 44, 800); ctx.fillStyle = '#FFD84A'; const top = '오늘의 TOPIK 도전'; ctx.fillText(top, W / 2 - ctx.measureText(top).width / 2, 300);
  const h = fit(ctx, hook, 920, 112, 2, 900, 64);
  centerLines(ctx, h.ls, W / 2, 470, Math.round(h.s * 1.25), '#fff', keyOf(hook), 'rgba(255, 216, 74, .9)');
  /* 타이머 고리 — 4분의 3만 칠해 「시간이 흐른다」는 느낌 */
  const cy = 1080, R = 230;
  ctx.lineWidth = 34; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#E1682B'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(W / 2, cy, R, -Math.PI / 2, Math.PI); ctx.stroke();
  const sec = (hook.match(/(\d+)\s*초/) || [0, '?'])[1];
  font(ctx, 200, 900); ctx.fillStyle = '#fff'; ctx.fillText(sec, W / 2 - ctx.measureText(sec).width / 2, cy + 60);
  font(ctx, 56, 800); ctx.fillStyle = '#E1682B'; ctx.fillText('초', W / 2 - ctx.measureText('초').width / 2, cy + 140);
  font(ctx, 58, 800); ctx.fillStyle = '#fff'; const t = `${label(q)} · 읽기 ${q.slot}번`; ctx.fillText(t, W / 2 - ctx.measureText(t).width / 2, 1440);
  font(ctx, 36, 600); ctx.fillStyle = 'rgba(255,255,255,.6)'; const f = '연습 문제(기출 아님) · everykoreans.com'; ctx.fillText(f, W / 2 - ctx.measureText(f).width / 2, 1520);
  if (logo) { const lw = 300; ctx.drawImage(logo, W - lw - 60, 1600, lw, lw * logo.height / logo.width); }
}

/* 제목 · 설명 — 유튜브 · 인스타 · 틱톡이 같은 틀을 쓴다(대기열에 같이 저장해 액션이 그대로 올린다) */
export function shortsMeta(q, hook = '') {
  const hk = hook || '이 문제, 풀 수 있어요?';
  const title = `${hk} | TOPIK ${q.exam} ${q.grade}급 읽기 ${q.slot}번 #shorts`.slice(0, 100);
  const tags = '#TOPIK #토픽 #한국어 #한국어공부 #learnkorean #studykorean #koreanlanguage';
  const body = `${q.question}\n${q.options.map((o, i) => `${CIRCLED[i]} ${o}`).join('\n')}\n\n정답은 영상 끝에 👀 댓글로 먼저 맞혀 보세요!\n` +
    `※ 치즈감자가 만든 연습 문제예요(기출 아님).\n무료 TOPIK 연습 → https://everykoreans.com/?utm_source=shorts&utm_medium=video`;
  return { title, description: `${body}\n\n${tags} #shorts`, caption: `${hk} TOPIK ${q.exam} ${q.grade}급 읽기 ${q.slot}번\n\n${body}\n\n${tags}`,
    tags: ['TOPIK', '토픽', '한국어', '한국어공부', 'learn korean', 'study korean', `TOPIK ${q.exam}`] };
}
