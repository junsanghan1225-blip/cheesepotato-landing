/* 「긴 문장 만들기」 — 학생이 쓴 해요체 문장의 마지막 말을 이음말(-는데 · -지만 · -아서 · -(으)니까 · -고 · -(으)면)로 바꾼다.
   운영자 2026-10-18 「스스로 얘기해 보고 만드는 일을 도와줘야 · 긴 문장을 -는데 -지만 등으로 자연스럽게」.
   브라우저(app.module.js)와 검사(tools/check-weave.mjs)가 같이 쓴다 — 둘이 어긋나지 않게 이 파일 하나만.
   바꾸는 표는 weave.js 의 WEAVE_PRED(낱말 → 이음말 6개, tools/build-weave.mjs 가 활용 도구로 계산).
   **틀린 활용을 보여 주느니 안 보여 준다** — 표에 없고 규칙(이에요 · 예요)도 아니면 null 을 돌려, 화면이 「직접 써 보세요」로 바꾼다. */
export const WV_RELS = [
  { id: 'nde', ko: '-는데', kind: { ko: '뒤와 조금 다를 때 · 배경', en: 'a small contrast or the scene' }, ex: { ko: '서울에 사는데 회사는 멀어요.', en: 'I live in Seoul, but my office is far.' } },
  { id: 'jiman', ko: '-지만', kind: { ko: '반대', en: 'contrast (“but”)' }, ex: { ko: '한국어는 어렵지만 재미있어요.', en: 'Korean is hard, but fun.' } },
  { id: 'aseo', ko: '-아서/어서', kind: { ko: '이유 → 결과', en: 'reason → result' }, ex: { ko: '비가 와서 집에 있어요.', en: 'It rains, so I stay home.' } },
  { id: 'nikka', ko: '-(으)니까', kind: { ko: '이유 (뒤에 권유 · 부탁도 가능)', en: 'reason (can be followed by suggestions)' }, ex: { ko: '추우니까 따뜻하게 입으세요.', en: 'It is cold, so dress warmly.' } },
  { id: 'go', ko: '-고', kind: { ko: '더하기 · 차례', en: 'adding · in order' }, ex: { ko: '밥을 먹고 커피를 마셔요.', en: 'I eat and then drink coffee.' } },
  { id: 'myeon', ko: '-(으)면', kind: { ko: '조건 (만약 ~이면)', en: 'condition (“if”)' }, ex: { ko: '시간이 있으면 같이 가요.', en: 'If you have time, let us go together.' } },
];
const IDX = Object.fromEntries(WV_RELS.map((r, i) => [r.id, i]));
const hasBatchim = (ch) => { const c = ch.charCodeAt(0) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };

/* 문장 → { head: 마지막 말 앞, word: 마지막 말, end: 맺음표 } */
export function lastWord(s) {
  const raw = String(s || '').trim(), t = raw.replace(/[.!?]+$/, '').trim(), m = /(\S+)$/.exec(t);
  return m ? { head: t.slice(0, m.index).trimEnd(), word: m[1], end: (/[.!?]+$/.exec(raw) || [''])[0] } : null;
}
/* 이에요 · 예요 · 이었어요 · 였어요 — 받침에 따라 달라지는 것(학생이에요 → 학생인데 · 의사예요 → 의사라서) */
function copula(noun, rel, past) {
  const b = hasBatchim(noun.slice(-1));
  const P = { nde: '인데', jiman: '이지만', aseo: b ? '이라서' : '라서', nikka: b ? '이니까' : '니까', go: '이고', myeon: '이면' };
  const Q = { nde: b ? '이었는데' : '였는데', jiman: b ? '이었지만' : '였지만', aseo: b ? '이라서' : '라서', nikka: b ? '이었으니까' : '였으니까', go: b ? '이었고' : '였고', myeon: b ? '이었으면' : '였으면' };
  return noun + (past ? Q : P)[rel];
}
/* 마지막 말을 rel 로 바꾼 말. 못 바꾸면 null */
export function linkWord(word, rel, PRED) {
  const i = IDX[rel]; if (i == null) return null;
  const hit = PRED?.[word];
  if (hit) return hit[i] || null;
  let m;
  if ((m = /^(.+?)(이에요|예요)$/.exec(word))) return copula(m[1], rel, false);
  if ((m = /^(.+?)(이었어요|였어요)$/.exec(word))) return copula(m[1], rel, true);
  return null;
}
/* 문장 하나의 마지막 말을 rel 로 바꾼 이음 조각 · 못 바꾸면 null */
export function linkClause(sentence, rel, PRED) {
  const lw = lastWord(sentence); if (!lw) return null;
  const f = linkWord(lw.word, rel, PRED); if (!f) return null;
  return { text: (lw.head ? lw.head + ' ' : '') + f, word: lw.word, form: f };
}
/* 어절 수 */
export const wvWords = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

/* ══ 문장 열차 — 학생이 통으로 쓴(말한) 긴 문장을 실시간으로 읽는다 ══════════════════
   운영자 2026-10-18 「다 한 번에 쓰게 · 로직이 너무 쉽다 · 혁신적으로」. 질문을 하나씩 묻는 대신 한 화면에서 한 문장을 통으로 쓰면
   이음말(-는데 · -지만 …)을 찾아 마디로 나누고, 퀘스트 조건(이음말 · 마디 수 · 낱말 · 한 문장 …)을 즉시 채점한다.
   찾는 법: ① WEAVE_PRED 의 이음말 꼴과 정확히 같은 낱말 ② 안 걸리면 끝꼴(-지만 · -는데 · -아서 · -니까 · -으면)로 — 틀리게 잡느니 못 잡는 쪽이 낫다. */
const JONG_N = 4;   // 받침 ㄴ
const jong = (ch) => { const c = (ch || '').charCodeAt(0) - 0xac00; return c >= 0 && c <= 11171 ? c % 28 : -1; };
const NOT_GO = new Set(['냉장고', '창고', '사고', '광고', '고', '비고', '신고', '보고', '통고']);
const NOT_MYEON = new Set(['라면', '냉면', '국면', '화면', '평면', '면', '짜장면', '자장면', '단면', '정면', '표면']);
const NOUN_YO = new Set(['필요', '중요', '수요', '주요', '소요', '개요', '요']);
export function buildForms(PRED) {
  const m = new Map();
  for (const k of Object.keys(PRED || {})) (PRED[k] || []).forEach((f, i) => { if (f && !m.has(f)) m.set(f, WV_RELS[i].id); });
  return m;
}
export function connRel(t, forms) {
  if (!t) return null;
  const hit = forms?.get(t); if (hit) return hit;
  if (/지만$/.test(t) && t.length >= 3) return 'jiman';
  if (/데$/.test(t) && t.length >= 2 && jong(t[t.length - 2]) === JONG_N) return 'nde';
  if (/(아서|어서|여서|해서|워서|라서)$/.test(t) && !/(그래서|그러서)$/.test(t)) return 'aseo';
  if (/니까$/.test(t) && t.length >= 3 && jong(t[t.length - 3]) !== 17) return 'nikka';
  if (/(으면|하면|이면)$/.test(t) && !NOT_MYEON.has(t)) return 'myeon';
  if (/[가-힣]고$/.test(t) && !NOT_GO.has(t)) return 'go';
  return null;
}
const isEnd = (t) => /[가-힣]요$/.test(t) && !NOUN_YO.has(t) || /니다$/.test(t);   // 해요체 · 합쇼체 끝꼴 — 「필요 · 중요」 같은 명사는 뺀다
/* 글 → { words, clauses[{text, conn|null, cut?, last?}], conns[], breaks, polite } */
export function analyze(text, forms) {
  const toks = String(text || '').trim().split(/\s+/).filter(Boolean), clauses = [], conns = [];
  let cur = [], breaks = 0;
  toks.forEach((tok, i) => {
    const t = tok.replace(/[.!?,~…]+$/g, ''), last = i === toks.length - 1;
    cur.push(tok);
    let rel = connRel(t, forms);
    if (rel === 'go' && /^(싶|있|계시)/.test(toks[i + 1] || '')) rel = null;   // 「-고 싶다 · -고 있다」는 마디를 잇는 말이 아니다
    if (rel && !last) { clauses.push({ text: cur.join(' '), conn: rel }); conns.push(rel); cur = []; return; }
    if (!last && (/[.!?]$/.test(tok) || isEnd(t))) { clauses.push({ text: cur.join(' '), conn: null, cut: true }); breaks++; cur = []; }
  });
  if (cur.length) clauses.push({ text: cur.join(' '), conn: null, last: true });
  const lastTok = (toks[toks.length - 1] || '').replace(/[.!?,~…]+$/g, '');
  return { words: toks.length, clauses, conns, breaks, polite: isEnd(lastTok), dangling: !!toks.length && !!connRel(lastTok, forms) };
}
/* 퀘스트 조건 → 확인표 [{id, ko, en, ok}]. req: { conn[], clauses, minConns, words[], one, distinct, minWords, polite } */
export function evalReq(req, a, text) {
  const out = [], T = String(text || '');
  if (req.keep) out.push({ id: 'keep', ko: `첫 마디 「${req.keep}」 살리기`, en: `Keep “${req.keep}” at the start`, ok: T.trim().startsWith(req.keep) });
  for (const c of req.conn || []) { const r = WV_RELS.find((x) => x.id === c); out.push({ id: 'c-' + c, ko: `${r.ko} 쓰기`, en: `Use ${r.ko}`, ok: a.conns.includes(c) }); }
  for (const c of req.no || []) { const r = WV_RELS.find((x) => x.id === c); out.push({ id: 'no-' + c, ko: `${r.ko}는 쓰지 않기`, en: `Do not use ${r.ko}`, ok: !a.conns.includes(c) }); }
  if (req.minConns) out.push({ id: 'minConns', ko: `이음말 ${req.minConns}개 이상`, en: `At least ${req.minConns} linking endings`, ok: a.conns.length >= req.minConns });
  if (req.clauses) out.push({ id: 'clauses', ko: `${req.clauses}마디 이상`, en: `At least ${req.clauses} clauses`, ok: a.clauses.length >= req.clauses });
  for (const w of req.words || []) out.push({ id: 'w-' + w, ko: `낱말 「${w}」`, en: `Word “${w}”`, ok: T.includes(w) });
  if (req.distinct) out.push({ id: 'distinct', ko: '같은 이음말은 한 번씩만', en: 'Each ending only once', ok: a.conns.length > 0 && a.conns.length === new Set(a.conns).size });
  if (req.minWords) out.push({ id: 'minWords', ko: `${req.minWords}어절 이상`, en: `At least ${req.minWords} words`, ok: a.words >= req.minWords });
  if (req.one) out.push({ id: 'one', ko: '한 문장으로 (중간에 끊지 않기)', en: 'One sentence (no stopping)', ok: a.words > 0 && a.breaks === 0 });
  if (req.polite) out.push({ id: 'polite', ko: '해요체(~요)로 끝내기', en: 'End politely (~요)', ok: a.polite });
  return out;
}
/* 소리 인식 글과 내 문장이 얼마나 비슷한가(0~100) — 글자 쌍 겹침 */
export function similarity(a, b) {
  const g = (s) => { const x = String(s || '').replace(/[\s.,!?~…]/g, ''), o = new Map(); for (let i = 0; i < x.length - 1; i++) { const k = x.slice(i, i + 2); o.set(k, (o.get(k) || 0) + 1); } return [o, Math.max(0, x.length - 1)]; };
  const [A, na] = g(a), [B, nb] = g(b); if (!na || !nb) return 0;
  let hit = 0; for (const [k, v] of A) hit += Math.min(v, B.get(k) || 0);
  return Math.round((2 * hit) / (na + nb) * 100);
}
