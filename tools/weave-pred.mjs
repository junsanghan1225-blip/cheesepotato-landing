/* 「긴 문장 만들기」 낱말 표(WEAVE_PRED) — tools/build-weave.mjs 와 tools/check-weave.mjs 가 같이 쓴다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { conjugate, attach } from './ko-conj.mjs';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export function buildPred() {
  /* 낱말 표(WEAVE_PRED) — 해요체 낱말(현재 · 과거) → [-는데, -지만, -아서, -(으)니까, -고, -(으)면]. TOPIK I 동사 · 형용사 + TOPIK II 「-하다」 동사.
     활용 도구가 못 만드는 칸은 빈 문자열(화면이 「직접 써 보세요」로 돌린다). 같은 낱말이 둘이면 많이 쓰는 쪽이 이긴다. */
  const V1 = JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/data/topik1.json'), 'utf8'));
  const V2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/data/topik2.json'), 'utf8'));
  const lemmas = [...V1.filter((w) => w.pos === '동사' || w.pos === '형용사'), ...V2.filter((w) => w.pos === '동사' && w.head.endsWith('하다') && /^[가-힣]+하다$/.test(w.head))]
    .sort((a, b) => (b.freq || 0) - (a.freq || 0));
  lemmas.push({ head: '않다', pos: '동사' });
  const PRED = {}, seenForm = new Map(), AMBIG = new Set();
  const ADJ_FIX = new Set(['멀다', '길다', '싸다', '밝다', '적다']);   // 낱말 목록에는 동사로 적혔지만 형용사로 쓰는 말(먼데 · 긴데)
  const PRES_AMBIG = new Set(['늦다']);                                  // 늦는데 · 늦은데 둘 다 쓴다 — 현재는 안 만든다(과거 늦었는데는 같다)
  const put = (key, arr) => {            // 같은 글자가 다른 낱말에서 다른 이음말을 내면(걸어요: 걸다 · 걷다) 틀린 것을 보이느니 뺀다
    const j = arr.join('|');
    if (seenForm.has(key) && seenForm.get(key) !== j) { AMBIG.add(key); return; }
    seenForm.set(key, j); PRED[key] = arr;
  };
  for (const w of lemmas) {
    const c = conjugate(w.head, w.pos); if (!c) continue;
    const present = c.find((x) => x[0] === 'present')?.[1], past = c.find((x) => x[0] === 'past')?.[1];
    if (!present || !past || /^[^가-힣]/.test(present)) continue;
    const stay = /(있|없)다$/.test(w.head), pos = stay ? '동사' : ADJ_FIX.has(w.head) ? '형용사' : w.pos;   // 있다 · 없다 · 맛있다 는 형용사여도 「-는데」
    const A = (tpl) => attach(w.head, pos, tpl) || '';
    const pres = [A('(으)ㄴ/는데'), A('지만'), A('아/어서'), A('(으)니까'), A('고'), A('(으)면')];
    const pas = [A('았/었는데'), A('았/었지만'), pres[2], A('았/었으니까'), A('았/었고'), A('았/었으면')];
    if (!PRES_AMBIG.has(w.head)) put(present, pres);
    put(past, pas);
  }
  for (const k of AMBIG) delete PRED[k];
  PRED['아니에요'] = ['아닌데', '아니지만', '아니라서', '아니니까', '아니고', '아니면'];
  PRED['아니었어요'] = ['아니었는데', '아니었지만', '아니라서', '아니었으니까', '아니었고', '아니었으면'];
  return PRED;
}
