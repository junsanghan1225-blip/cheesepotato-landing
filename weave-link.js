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
