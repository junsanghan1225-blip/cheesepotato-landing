/* 쇼츠 촬영소 — TOPIK 듣기 · 쓰기 장 · 모의고사 회차 차례(운영자 요청 2026-10-05:
   「TOPIK 읽기 · 듣기 · 쓰기 · 문법 순으로, 가진 자료를 바탕으로」 · 「모의고사 1회 기준으로 쭉 올릴게」).
   그리는 틀(머리 · 진행 막대 · 바닥 크기 · 움직임)은 문법 장과 같다(shorts-grammar.js drawCard).
     듣기: 표지 → 문제(🎧 + 질문 · 보기) → 정답 · 풀이 → 들은 내용(대본)
     쓰기: 표지 → 문제(지문 · 자료) → [51 · 52] 모범 답안  /  [53 · 54] 과제 · 조건 → 모범 답안(길면 여러 장)
   듣기 소리는 녹음 파일을 쓰지 않는다 — 대본은 촬영소 옆 칸에만 띄우고 운영자가 직접 읽어 마이크로 녹음한다(운영자 결정 2026-10-05).
   🎧 장의 막대는 운영자 마이크 크기에 맞춰 움직인다. */
import { TOPIKL_ITEMS, TOPIKL2_ITEMS } from './topik-listening.js';
import { TW_ITEMS } from './topik-writing.js';
import { drawCard, drawCoverCard, cardFits, CARD } from './shorts-grammar.js';

const { C } = CARD;
const CIRCLED = ['①', '②', '③', '④'];
const WHO = { m: '남자', w: '여자', n: '안내' };
const BLANK = '(' + ' '.repeat(8) + ')';
const shown = (t) => String(t ?? '').replace(/\([\s　]*\)/g, BLANK);

/* ── 모의고사 회차 — 사이트(app.module.js tqSlotVersions · tqBuildMock)와 같은 규칙 ──
   자리(slot)마다 id 차례로 줄 세워 n번째를 집으면 n회차. 짝 지문(두 문항이 한 글)은 짝을 통째로.
   slots = [{ n, pair? }] 시험지 차례. 한 자리라도 비면 그 회차는 거기서 끝(모자란 회차는 있는 데까지). */
export function buildRounds(items, slots) {
  const bySlot = new Map();
  for (const q of items) { if (!bySlot.has(q.slot)) bySlot.set(q.slot, []); bySlot.get(q.slot).push(q); }
  bySlot.forEach((l) => l.sort((a, b) => String(a.id).localeCompare(String(b.id))));
  const sets = new Map();
  for (const q of items.filter((x) => x.pair)) { const k = `${q.pair}|${(q.passage || '').replace(/\s+/g, '')}`; if (!sets.has(k)) sets.set(k, []); sets.get(k).push(q); }
  const byPair = new Map();
  sets.forEach((l) => { const name = l[0].pairName || l[0].pair; if (!byPair.has(name)) byPair.set(name, []); byPair.get(name).push(l.slice().sort((a, b) => a.slot - b.slot)); });
  byPair.forEach((v) => v.sort((a, b) => String(a[0].id).localeCompare(String(b[0].id))));
  const rounds = [];
  for (let at = 0; at < 60; at++) {
    const round = [], used = new Set();
    for (const s of slots) {
      if (s.pair) { if (used.has(s.pair)) continue; used.add(s.pair); const v = byPair.get(s.pair)?.[at]; if (v) round.push(...v); }
      else { const v = bySlot.get(s.n)?.[at]; if (v) round.push(v); }
    }
    if (!round.length) break;
    rounds.push(round);
  }
  return rounds;
}

/* 듣기 자리 차례 — 그림 고르기 자리(사이트도 아직 문항 없음)는 빠진다. 짝(긴 담화 두 문제)은 pair 로 묶는다 */
function listenSlots(items) {
  const pairSlots = new Map();
  for (const q of items.filter((x) => x.pair)) { if (!pairSlots.has(q.pair)) pairSlots.set(q.pair, new Set()); pairSlots.get(q.pair).add(q.slot); }
  const nameOf = new Map(); pairSlots.forEach((set) => { const name = [...set].sort((a, b) => a - b).join('-'); for (const n of set) nameOf.set(n, name); });
  for (const q of items) if (q.pair) q.pairName = nameOf.get(q.slot);
  return [...new Set(items.map((q) => q.slot))].sort((a, b) => a - b).map((n) => ({ n, pair: nameOf.get(n) }));
}
export const LISTEN = { I: TOPIKL_ITEMS, II: TOPIKL2_ITEMS };
export const listenRounds = (exam) => buildRounds(LISTEN[exam], listenSlots(LISTEN[exam]));
/* 쓰기 — 51 · 52 · 53 · 54 마다 50벌. n회차 = 번호마다 n번째 */
export const writeRounds = () => { const by = [51, 52, 53, 54].map((n) => TW_ITEMS.filter((x) => x.q === n).sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true })));
  return Array.from({ length: Math.min(...by.map((l) => l.length)) }, (_, i) => by.map((l) => l[i])); };

/* ── 덩어리 만들기 ── */
const txt = (t, size, extra = {}) => ({ t: shown(t), size, weight: 600, ...extra });
const optCards = (opts, few) => opts.map((o, i) => ({ t: `${CIRCLED[i]}  ${shown(o)}`, size: few ? 52 : 56, weight: 700, card: 'white', pad: 26, gap: 14 }));
/* 긴 글을 바닥 크기로 들어가는 만큼씩 여러 장으로 — 문장 단위로 채운다 */
function paginate(ctx, sentences, make) {
  const pages = []; let cur = [];
  for (const s of sentences) {
    const tryB = make([...cur, s]);
    if (cur.length && !cardFits(ctx, tryB)) { pages.push(cur); cur = [s]; } else cur.push(s);
  }
  if (cur.length) pages.push(cur);
  return pages;
}
const sentencesOf = (t) => String(t).split(/\n+/).flatMap((p, i, a) => { const ss = p.split(/(?<=[.!?。])\s+/).filter(Boolean); if (i < a.length - 1 && ss.length) ss[ss.length - 1] += '\n'; return ss; });

/* 듣기 한 문항의 장들 */
export function listenSlides(ctx, q) {
  const tag = `TOPIK ${q.exam} 듣기`, label = `듣기 ${q.slot}번`;
  const S = [{ k: 'cover', q }];
  S.push({ k: 'card', listen: true, card: { label, title: '문제', name: tag, variants: [
    [{ t: '🎧 잘 듣고 고르세요', size: 50, weight: 800, color: C.or, gap: 24 }, txt(q.q, 52, { weight: 800, gap: 28 }), ...optCards(q.options)],
    [{ t: '🎧 잘 듣고 고르세요', size: 46, weight: 800, color: C.or, gap: 18 }, txt(q.q, 48, { weight: 800, gap: 22 }), ...optCards(q.options, true)]] } });
  S.push({ k: 'card', card: { label, title: '정답', name: tag, variants: [[
    { t: `정답  ${CIRCLED[q.answer]}  ${shown(q.options[q.answer])}`, size: 58, weight: 800, card: 'ok', pad: 32, gap: 30 },
    { t: '💡 ' + shown(q.why), size: 50, weight: 500, card: 'note', pad: 34, lh: 1.5 }]] } });
  /* 들은 내용 — 줄마다 누가 말했는지. 길면 여러 장 */
  const lines = q.script.map((l) => `${WHO[l.who] || ''}${WHO[l.who] ? ': ' : ''}${l.text}`);
  const make = (ls) => ls.map((l) => ({ t: l, size: 50, weight: 600, card: /^여자/.test(l) ? 'soft' : 'white', pad: 30, gap: 18 }));
  const pages = paginate(ctx, lines, make);
  pages.forEach((p, i) => S.push({ k: 'card', card: { label, title: pages.length > 1 ? `들은 내용 ${i + 1}` : '들은 내용', name: tag, variants: [make(p)] } }));
  return S;
}

/* 쓰기 한 문항의 장들 */
const BLANK_MARK = /\(\s*[㉠㉡]\s*\)/g;
export function writeSlides(ctx, w) {
  const tag = `TOPIK II 쓰기`, label = `쓰기 ${w.q}번`;
  const hook = { 51: '이 빈칸, 채울 수 있어요?', 52: '이 빈칸, 채울 수 있어요?', 53: '이 자료, 글로 쓸 수 있어요?', 54: '600자 논술, 이렇게 써요' }[w.q];
  const S = [{ k: 'wcover', w, hook }];
  /* 「( ㉠ )」 안의 띄어쓰기를 줄바꿈 안 되는 공백으로 — 빈칸이 줄 끝에서 둘로 쪼개지지 않게 */
  const passage = w.passage.replace(/\(\s*([㉠㉡])\s*\)/g, '( $1 )');
  const prob = [{ t: passage, size: 52, weight: 600, card: 'white', pad: 34, lh: 1.55, gap: 24, mark: BLANK_MARK }];
  if (w.data) prob.push(...w.data.map((d) => ({ t: '· ' + d, size: 46, weight: 600, gap: 10 })));
  if (w.q <= 52) prob.push({ t: '조건 · ' + w.cond, size: 42, weight: 600, color: C.dim, gap: 0 });
  S.push({ k: 'card', card: { label, title: '문제', name: w.title, variants: [prob, prob.map((b) => ({ ...b, size: b.size * 0.9 }))] } });
  if (w.blanks) {
    const B = w.blanks.flatMap((b) => [
      { t: `${b.mark}  ${b.answers[0]}`, size: 58, weight: 800, card: 'ok', pad: 30, gap: 10 },
      ...(b.answers.length > 1 ? [{ t: '다른 답 · ' + b.answers.slice(1).join(' / '), size: 44, weight: 600, color: C.dim, gap: 30 }] : [])]);
    S.push({ k: 'card', card: { label, title: '모범 답안', name: w.title, variants: [B, B.filter((b) => !b.t.startsWith('다른 답'))] } });
  } else {
    const T = [{ t: '이렇게 쓰세요', size: 50, weight: 800, color: C.or, gap: 18 },
      ...(w.tasks || []).map((x, i) => ({ t: `${i + 1}. ${x}`, size: 52, weight: 700, card: 'white', pad: 28, gap: 14 })),
      { t: '조건 · ' + w.cond, size: 44, weight: 600, color: C.dim, gap: 0 }];
    S.push({ k: 'card', card: { label, title: '과제 · 조건', name: w.title, variants: [T] } });
    const make = (ss) => [{ t: ss.join(' ').replace(/\n /g, '\n'), size: 50, weight: 500, card: 'note', pad: 34, lh: 1.6 }];
    const pages = paginate(ctx, sentencesOf(w.model || ''), make);
    pages.forEach((p, i) => S.push({ k: 'card', card: { label, title: pages.length > 1 ? `모범 답안 ${i + 1}/${pages.length}` : '모범 답안', name: w.title, variants: [make(p)] } }));
  }
  return S;
}

/* 한 장 그리기 — 표지는 읽기 표지(drawCover)를 쓰는 쪽(shorts.js)에서, 쓰기 표지는 여기서 */
export function drawTopikSlide(ctx, slides, idx, { logo = null, t = Infinity, playing = 0 } = {}) {
  const sl = slides[idx];
  if (sl.k === 'wcover') {
    const w = sl.w;
    return drawCoverCard(ctx, { chip: `TOPIK II 쓰기 · ${w.q}번`, name: w.title, hook: sl.hook, card: w.passage.replace(/\s+/g, ' ').slice(0, 90) + '…', mark: BLANK_MARK, foot: 'everykoreans.com · 연습 문제(기출 아님)' }, { logo, t });
  }
  const card = sl.listen && playing ? { ...sl.card, extra: (c, tt) => soundBars(c, tt, playing) } : sl.card;
  return drawCard(ctx, card, idx, slides.length, { logo, t });
}
/* 운영자가 말하는 동안(마이크 크기 level 0~1) 머리 오른쪽에 막대가 춤춘다(🎧 장) */
function soundBars(ctx, t, level) {
  const x0 = CARD.R - 150, y0 = CARD.TOP + 180;
  for (let i = 0; i < 7; i++) {
    const h = 16 + Math.abs(Math.sin(t / 140 + i * 0.9)) * 50 * Math.min(1, level);
    ctx.fillStyle = C.or; ctx.beginPath(); ctx.roundRect(x0 + i * 22, y0 - h / 2, 12, h, 6); ctx.fill();
  }
}

/* 제목 · 설명 · 글 — 듣기 · 쓰기판 */
export function topikMeta(kind, x, hook = '') {
  const tags = '#TOPIK #토픽 #한국어 #한국어공부 #learnkorean #studykorean #koreanlanguage';
  const link = '무료 TOPIK 연습 → https://everykoreans.com/?utm_source=shorts&utm_medium=video';
  if (kind === 'listen') {
    const hk = hook || '이 문제, 듣고 풀 수 있어요?';
    const body = `${x.q}\n${x.options.map((o, i) => `${CIRCLED[i]} ${o}`).join('\n')}\n\n정답은 영상 끝에 👀 댓글로 먼저 맞혀 보세요!\n※ 치즈감자가 만든 연습 문제예요(기출 아님).\n${link}`;
    const title = `${hk} | TOPIK ${x.exam} 듣기 ${x.slot}번 #shorts`.slice(0, 100);
    return { title, description: `${body}\n\n${tags} #shorts`, caption: `${hk} TOPIK ${x.exam} 듣기 ${x.slot}번\n\n${body}\n\n${tags}`, tags: ['TOPIK', '토픽', '한국어', 'TOPIK listening', `TOPIK ${x.exam}`] };
  }
  const hk = hook || '이 문제, 쓸 수 있어요?';
  const body = `TOPIK II 쓰기 ${x.q}번 · ${x.title}\n\n모범 답안까지 영상에 있어요 ✍️\n※ 치즈감자가 만든 연습 문제예요(기출 아님).\n${link}`;
  const title = `${hk} | TOPIK II 쓰기 ${x.q}번 ${x.title} #shorts`.slice(0, 100);
  return { title, description: `${body}\n\n${tags} #shorts`, caption: `${hk}\n\n${body}\n\n${tags}`, tags: ['TOPIK', '토픽', 'TOPIK writing', 'TOPIK II', '한국어 쓰기'] };
}
