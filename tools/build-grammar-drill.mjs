#!/usr/bin/env node
/* 문법 「바꾸기」 문항 — 생성물 grammar-drill.js 를 만든다(손으로 고치지 말 것).

     node tools/build-grammar-drill.mjs

   문법 이름(「V-(으)면서」)에서 꼬리를 읽고, 흔한 낱말 넷에 tools/ko-conj.mjs attach 로 붙여 정답을 미리 구해 둔다.
   화면에는 활용 코드를 싣지 않는다 — 정답표(check-conj.mjs)로 지킨 결과만 나간다.
   이름을 못 읽거나(N · 조사 · 불규칙 설명 · 인용 · 문체 …) 한 낱말이라도 못 붙이면 그 표현은 문항을 안 만든다.
   뜻이 이상한 짝(「먹어 있다」)을 피하려고 몇 표현은 낱말 묶음을 따로 준다(POOL_BY). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attach } from './ko-conj.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = async (f) => (await import(path.join(ROOT, f))).SB_CATS || [];
const pts = (await Promise.all(['sentences-beginner.js', 'sentences-intermediate.js', 'sentences.js'].map(load)))
  .flat().flatMap((c) => c.points);

/* 흔하고 뜻이 넓은 낱말. 불규칙(ㄷ · ㅂ · 르 · ㄹ · 으)을 고루 섞었다 — 바꾸기 연습의 알맹이가 거기 있다. */
const VERB = ['가다', '오다', '먹다', '마시다', '보다', '읽다', '만나다', '공부하다', '일하다', '자다', '사다', '배우다',
  '듣다', '걷다', '살다', '만들다', '놀다', '돕다', '부르다', '타다', '기다리다', '운동하다', '찾다', '쉬다', '쓰다', '입다'];
const ADJ = ['좋다', '크다', '작다', '바쁘다', '예쁘다', '춥다', '덥다', '맵다', '쉽다', '어렵다', '길다', '멀다', '많다',
  '싸다', '비싸다', '조용하다', '깨끗하다', '편하다', '빠르다', '다르다'];
/* 목적어를 받는 동사 — 「-아/어 놓다 · 두다」에 「가 놓다」가 나오면 안 된다 */
const TRANS = ['사다', '만들다', '찾다', '읽다', '씻다', '열다', '준비하다', '적다', '닫다', '배우다'];
/* 표현 이름(문법 이름 전체)으로 낱말 묶음을 고른다 */
const POOL_BY = [
  [/-아\/어 있다/, ['앉다', '서다', '눕다', '남다', '붙다', '열리다'], '동사'],
  [/-고 있다 ②/, ['입다', '신다', '쓰다', '끼다'], '동사'],
  [/-아\/어 보이다/, ADJ, '형용사'],
  [/^A-아\/어하다/, ['좋다', '싫다', '무섭다', '귀엽다', '슬프다', '기쁘다', '부끄럽다', '어렵다'], '형용사'],   // 좋아하다 · 무서워하다
  [/-아\/어 (놓다|두다)|-아\/어 (주세요|줄게요)/, TRANS, '동사'],
];
/* 높임 -(으)시- 에는 「자다 → 주무시다」 「먹다 · 마시다 → 드시다」가 따로 있어서 뺀다 */
const NO_HON = new Set(['자다', '먹다', '마시다']);
/* 꼬리 하나로 문항을 만들 수 없는 표현(id) — 「-아/어지다」(피동)는 낱말마다 되는지가 달라 「가지다」가 나온다 */
const SKIP_ID = new Set(['56-2', '22-3']);
/* 이름이 이 말로 시작하면 꼬리를 안 읽는다 — 인용 · 문체 · 불규칙 설명처럼 한 꼬리로 바꿀 수 없는 것 */
const SKIP_NAME = /^(N|숫자|날짜|시간|단어|관형형|직접|간접|'|서술체|반말체|하오체|하게체|피동|사동|안 |못 |아무|만 |만에|조차|마저|보고|치고|스럽다|답다|에 |\(으\)로|\(이\)|을\/를|은\/는 대로|여간|얼마나)/;
const QUOTE = /^(다고|다면|다니|다는|느냐|\(느\)ㄴ다(고|면|는|니|기))/;

function tplOf(name) {
  if (SKIP_NAME.test(name)) return null;
  /* 「N 전에, V-기 전에」 → 「V-기 전에」: 꼬리가 있는 첫 갈래 */
  const part = name.split(/,\s*/).find((x) => /(^|[AV/])-/.test(x));
  if (!part) return null;
  const m = /^(A\/V|A|V)?-(.+)$/.exec(part.trim());
  if (!m) return null;
  const who = m[1] === 'A' ? '형용사' : '동사';
  let tpl = m[2].replace(/\s*[①②③]/g, '').replace(/\s*\([가-힣 ·]+\)\s*$/, '').trim();
  if (QUOTE.test(tpl) || /[-N]| -/.test(tpl)) return null;
  /* 「있다/없다」 · 「가다/오다」 같은 뒤쪽 갈래는 앞의 것 하나로(꼬리 앞머리의 「(으)ㄴ/는」 · 「아/어」 · 「았/었」은 attach 가 읽는다) */
  const head = (/^(\(으\)ㄴ\/는(\/\(으\)ㄹ)?|아\/어|았\/었)/.exec(tpl) || [''])[0];
  tpl = head + tpl.slice(head.length).replace(/([가-힣?]+)\/[가-힣?]+/g, '$1');
  if (/[/()]/.test(tpl.slice(head.length).replace(/^\(으\)/, ''))) return null;
  return { tpl, who, raw: m[2] };
}
/* 표현마다 같은 낱말이 늘 나오지 않게, id 로 씨앗을 삼아 고른다(빌드할 때마다 같은 결과) */
function pick(pool, id, n) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const out = [], a = pool.slice();
  while (out.length < n && a.length) { h = (h * 1103515245 + 12345) >>> 0; out.push(a.splice(h % a.length, 1)[0]); }
  return out;
}

const DRILL = {};
let made = 0, skipped = 0;
for (const p of pts) {
  const t = tplOf(p.name);
  if (!t || SKIP_ID.has(p.id)) { skipped++; continue; }
  const by = POOL_BY.find(([re]) => re.test(p.name));
  const pos = by ? by[2] : t.who;
  let pool = by ? by[1] : pos === '형용사' ? ADJ : VERB;
  if (/시/.test(t.tpl.replace(/^\(으\)/, '').slice(0, 2)) || /세요/.test(t.tpl)) pool = pool.filter((w) => !NO_HON.has(w));
  /* 「-군요/는군요」 — 동사는 「는군요」(운동하는군요) */
  if (pos === '동사' && /^군요/.test(t.tpl) && /는군요/.test(t.raw)) t.tpl = '는' + t.tpl;
  const items = [];
  for (const w of pick(pool, p.id, 8)) {
    const a = attach(w, pos, t.tpl);
    if (!a) continue;
    items.push([w, a]);
    if (items.length === 4) break;
  }
  if (items.length < 3) { skipped++; continue; }
  DRILL[p.id] = { t: `-${t.tpl}`, x: items };
  made++;
}

const out = `/* 문법 「바꾸기」 문항 — 생성물. 손으로 고치지 말 것.
 *   고칠 때: tools/ko-conj.mjs(attach) · tools/build-grammar-drill.mjs 를 고치고 다시 돌린다.
 *   ${made}개 표현 · 표현마다 [기본형, 정답] 3~4개. 꼬리를 못 읽은 ${skipped}개는 문항이 없다(화면에서 칸을 뺀다).
 */
export const GRAMMAR_DRILL = ${JSON.stringify(DRILL)};
`;
fs.writeFileSync(path.join(ROOT, 'grammar-drill.js'), out);
console.log(`grammar-drill.js — ${made}개 표현에 문항, ${skipped}개는 건너뜀`);
if (process.argv.includes('--list')) for (const [id, d] of Object.entries(DRILL)) console.log(id, pts.find((p) => p.id === id).name, '→', d.t, d.x.map((x) => x.join('→')).join(' · '));
