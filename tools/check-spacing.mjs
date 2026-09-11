#!/usr/bin/env node
/* 띄어쓰기 검사기 — node tools/check-spacing.mjs
 *
 * 띄어쓰기는 맞춤법보다 기계가 잡기 어렵다. 「대로」는 앞이 체언이면 붙고
 * 관형형이면 떨어진다.
 *
 *     법대로 하자        붙는다 — 조사
 *     아는 대로 말해라    떨어진다 — 의존명사
 *
 * 두 「대로」는 글자가 같다. 앞말이 무엇인지 알아야 갈리는데, 그것을 제대로
 * 알려면 형태소 분석기가 있어야 한다. 이 저장소에는 없고, 넣을 것도 아니다.
 *
 * 그래서 **길을 바꾼다.** 규칙으로 다 가르려 들지 않고, 대신 이렇게 묻는다.
 *
 *     우리가 딴 데서는 이 말을 어떻게 썼는가?
 *
 * 「할 수 있다」를 이 사이트가 500번 띄어 썼는데 한 군데만 「할수 있다」면,
 * 그것이 규칙에 맞는지 따질 것도 없이 **우리 글이 어긋난 것이다.** 학습
 * 자료에서는 그것만으로 이미 고칠 까닭이 된다 — 배우는 사람은 둘 중 어느
 * 쪽이 맞는지 모르는 채로 둘 다 본다.
 *
 * 다만 **못 박지는 않는다.** 글자가 같아도 다른 말인 것이 있다.
 *
 *     방 안에   방(房) 안        ← 이 둘을 글자만으로는 못 가른다
 *     방안에    방안(方案)
 *
 * 그래서 여기서 나온 것은 「짚어 둘 것」이다. 사람이 보고 정한다.
 *
 * 이 방법은 사전이 없어도 되고, 자료가 늘수록 정확해진다.
 *
 * 여기에 **셈으로 확실한 것 몇 가지**를 더한다.
 *
 *   · 「-ㄹ 수 있다」의 「수」는 언제나 띄어 쓴다 (의존명사)
 *   · 조사가 홀로 선 낱말이 될 수는 없다 — 「학교 에서」는 언제나 잘못
 *   · 문장부호 앞 공백, 겹공백, 줄 끝 공백
 *
 *   node tools/check-spacing.mjs            넘어가기로 적어 둔 것은 빼고
 *   node tools/check-spacing.mjs --all      전부
 *   node tools/check-spacing.mjs --accept   지금 나온 것을 넘어가기로
 */
import { loadCorpus } from './lib/corpus.mjs';
import { isKnown } from './lib/dict.mjs';
import { glossFind } from '../gloss-find.js';
import { Lint } from './lib/lint.mjs';
import { finalJong } from './lib/hangul.mjs';

const lint = new Lint('띄어쓰기');
const corpus = await loadCorpus();

/* ── 1. 우리 글끼리 견주기 ───────────────────────────────────────────
 *
 * 이웃한 두 낱말을 붙여 본 꼴(띄어 쓴 것)과, 실제로 붙어 있는 낱말(붙여
 * 쓴 것)을 각각 센다. 같은 글자열을 두 가지로 써 왔다면 한쪽이 어긋난
 * 것이다.
 *
 * 「거의」와 「많이」가 아니라 **몇 번인지**로 가른다. 한쪽이 압도적일
 * 때만 짚는다 — 5:1 쯤 되어야 「우리는 이렇게 쓴다」고 말할 수 있다.
 */
const spaced = new Map();     // '할수' → 「할 수」로 쓴 횟수
const joined = new Map();     // '할수' → 붙여 쓴 횟수
const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);

for (const r of corpus) {
  if (r.word) continue;
  const words = r.text.match(/[가-힣]+/g) || [];
  for (const w of words) if (w.length >= 3) bump(joined, w);
  /* 이웃한 짝. 사이에 한글 아닌 것이 끼면(쉼표·괄호) 이웃이 아니다 */
  for (const m of r.text.matchAll(/([가-힣]+) ([가-힣]+)/g)) {
    const k = m[1] + m[2];
    if (k.length >= 3) bump(spaced, k);
  }
}

/* 어느 쪽이 우리의 버릇인가. 5배 넘게 기울고, 드문 쪽이 두 번 이하일 때만. */
const HABIT = new Map();      // 글자열 → { want: 'spaced'|'joined', a, b }
for (const [k, n] of spaced) {
  const j = joined.get(k) || 0;
  if (n >= 5 && j >= 1 && j <= 2 && n >= j * 5) HABIT.set(k, { want: 'spaced', a: n, b: j });
}
for (const [k, n] of joined) {
  const s = spaced.get(k) || 0;
  if (n >= 5 && s >= 1 && s <= 2 && n >= s * 5) HABIT.set(k, { want: 'joined', a: n, b: s });
}

/* 붙여 쓴 것도 낱말이고 떼어 쓴 조각도 낱말이면, 둘은 **서로 다른 말이다.**
 *
 *     방 안에   방(房) 안
 *     방안에    방안(方案)
 *
 * 글자만 보고는 못 가른다. 못 가르는 것은 안 짚는다 — 여기서 「방안에」를
 * 「방 안에」로 고치라고 하면 계획을 방으로 만든다. 동음이의어를 갈라
 * 주려면 자료에 동형어 번호가 있어야 하는데 지금은 지워져 있다
 * (tools/check-homonym.mjs 참고). */
function bothReadingsReal(joined) {
  /* 조사가 붙은 채로는 사전에 안 닿는다 — 「방안에」는 없고 「방안」이 있다.
     gloss-find.js 가 그 떼기를 이미 한다. 우리가 또 만들 까닭이 없다. */
  if (!glossFind(isKnown, joined)) return false;         // 붙인 꼴이 말이 되는가
  for (let i = 1; i < joined.length; i++) {              // 떼어 쓴 꼴도 말이 되는가
    if (isKnown(joined.slice(0, i)) && glossFind(isKnown, joined.slice(i))) return true;
  }
  return false;
}


for (const r of corpus) {
  if (r.word) continue;
  /* 붙여 쓴 자리 가운데 우리 버릇이 「띄어 쓰기」인 것 */
  for (const w of new Set(r.text.match(/[가-힣]+/g) || [])) {
    const h = HABIT.get(w);
    if (!h || h.want !== 'spaced') continue;
    if (bothReadingsReal(w)) continue;
    lint.add('우리 글과 다르게 붙여 썼다', 'warn', r, {
      found: w, want: null,
      why: `딴 데서는 띄어 쓴 것이 ${h.a}번, 붙여 쓴 것이 ${h.b}번이다`,
    });
  }
  /* 띄어 쓴 자리 가운데 우리 버릇이 「붙여 쓰기」인 것 */
  for (const m of r.text.matchAll(/([가-힣]+) ([가-힣]+)/g)) {
    const k = m[1] + m[2];
    const h = HABIT.get(k);
    if (!h || h.want !== 'joined') continue;
    if (bothReadingsReal(k)) continue;
    lint.add('우리 글과 다르게 띄어 썼다', 'warn', r, {
      found: `${m[1]} ${m[2]}`, want: k,
      why: `딴 데서는 붙여 쓴 것이 ${h.a}번, 띄어 쓴 것이 ${h.b}번이다`,
    });
  }
}

/* ── 2. 의존명사 「수」 ───────────────────────────────────────────────
 *
 * 「-ㄹ 수 있다/없다」의 수는 의존명사라 언제나 띄어 쓴다. 앞이 ㄹ 받침이고
 * 뒤가 「있/없」이면 다른 뜻으로 읽힐 길이 없다. 「할수록」은 어미라 뒤가
 * 「록」이므로 여기 안 걸린다. */
for (const r of corpus) {
  for (const m of r.text.matchAll(/([가-힣])수\s*(있|없)/g)) {
    if (finalJong(m[1]) !== 'ㄹ') continue;
    if (isKnown(m[1] + '수')) continue;          // 「별수 없다」의 별수 같은 낱말
    lint.add('의존명사 「수」', 'bad', r, {
      found: m[1] + '수', want: `${m[1]} 수`,
      why: '「-ㄹ 수 있다/없다」의 「수」는 의존명사라 띄어 쓴다',
    });
  }
}

/* 「것」이 붙어 한 낱말이 된 것들. 사전에 있어도 우리 뜻풀이 사전에는
   없는 것이 많아 따로 적는다. */
const GEOT_WORDS = ['이것', '그것', '저것', '아무것', '날것', '탈것', '별것',
                    '보잘것', '하잘것', '어느것', '뭇것', '헛것', '잡것'];

/* 「-ㄹ 때」·「-ㄴ/-ㄹ 것」도 같은 갈래다. 앞이 관형형이면 의존명사다. */
for (const r of corpus) {
  for (const m of r.text.matchAll(/([가-힣])때(?![문])/g)) {
    if (finalJong(m[1]) !== 'ㄹ') continue;      // 이때·그때·접때는 여기 안 걸린다
    if (isKnown(m[1] + '때')) continue;
    lint.add('의존명사 「때」', 'bad', r, {
      found: m[1] + '때', want: `${m[1]} 때`,
      why: '관형형 뒤의 「때」는 의존명사라 띄어 쓴다 (이때·그때는 한 낱말)',
    });
  }
  /* 「것」은 낱말 통째로 보고 판단한다. 앞 글자만 보면 「보잘것없는」의
     가운데를 잘라 「보잘 것없는」으로 고치라고 한다. 한 번 그랬다. */
  for (const tok of new Set(r.text.match(/[가-힣]+/g) || [])) {
    const m = tok.match(/([가-힣])것/);
    if (!m) continue;
    if (GEOT_WORDS.some((w) => tok.includes(w))) continue;
    const j = finalJong(m[1]);
    if (m[1] !== '는' && j !== 'ㄴ' && j !== 'ㄹ') continue;
    if (isKnown(tok)) continue;
    lint.add('의존명사 「것」', 'bad', r, {
      found: tok, want: tok.replace(m[0], `${m[1]} 것`),
      why: '관형형 뒤의 「것」은 의존명사라 띄어 쓴다 (이것·그것은 한 낱말)',
    });
  }
}

/* ── 3. 홀로 선 조사 ─────────────────────────────────────────────────
 *
 * 조사는 앞말에 붙여 쓴다. 그래서 조사가 낱말 하나로 떨어져 있으면 언제나
 * 잘못이다. 다만 같은 글자가 딴 품사로도 쓰이는 것은 뺐다 —
 *
 *   이  「이 사람」의 이는 관형사다
 *   만  「만 원」의 만은 수사다
 *   와  「와!」는 감탄사다
 *   보다 「책을 보다」의 보다는 동사다
 *
 * 남은 것들은 조사 말고 다른 것이 될 길이 없다.
 *
 * **그런데 이 규칙을 처음 돌렸더니 488건이 나왔고 거의 다 오탐이었다.**
 * 까닭은 이 사이트가 한국어를 **가르치는** 곳이기 때문이다.
 *
 *     받침 있으면 은 · 없으면 는      조사가 설명의 주인공이다
 *     ① 은  ② 는  ③ 을  ④ 를        객관식 보기다
 *     N + 의 · 소리는 [에]            문법 표다
 *
 * 여기서 조사가 홀로 서는 것은 잘못이 아니라 **당연한 일이다.** 검사기가
 * 자료의 성격을 모르면 이런 일이 난다. 그래서 「진짜 문장 안에서 조사가
 * 떨어져 나온 것」만 본다 — 낱말이 여섯 개 넘고, 종결어미로 끝나고,
 * 설명 표에 쓰는 기호(· / + ___)가 없는 글. */
const LONE = new Set(['은', '는', '을', '를', '의', '에서', '에게', '부터', '까지', '처럼', '으로', '께서', '한테', '에게서']);
const TABLE_MARK = /[·/+]|_{2,}|[①-⑳]/;
const looksLikeSentence = (t) => {
  const s = t.trim();
  if (TABLE_MARK.test(s)) return false;
  /* 낱자(ㄱ·ㅣ)가 보이면 형태소를 뜯어 보이는 설명글이다. 거기서는 조사가
     홀로 서는 것이 정상이다 — 「먹 ends in ㄱ → 을 거예요」 */
  if (/[\u3131-\u318e]/.test(s)) return false;
  /* 영어가 섞인 줄은 설명글이다 — 「읽 ends in a consonant, so 을 거예요」
     처럼 조사를 낱말로 세워 놓고 가리킨다 */
  if (/[A-Za-z]/.test(s)) return false;
  /* 굵게 표시 뒤의 조사는 일부러 떼어 놓는다 — 「**-고 싶다** 는」 */
  if (/\*\*/.test(s)) return false;
  if ((s.match(/\S+/g) || []).length < 6) return false;
  return /[다요까죠네](?:[.!?」』"']*)$/.test(s);
};
for (const r of corpus) {
  if (!looksLikeSentence(r.text)) continue;
  for (const m of r.text.matchAll(/(?:^|\s)([가-힣]+)(?=\s|$)/g)) {
    if (!LONE.has(m[1])) continue;
    lint.add('홀로 선 조사', 'warn', r, {
      found: m[1], want: `앞말에 붙일 것`,
      why: '조사는 앞말에 붙여 쓴다 — 낱말 하나로 설 수 없다',
    });
  }
}

/* ── 4. 눈에 잘 안 띄는 공백 ────────────────────────────────────────
   사람 눈은 겹공백을 못 본다. 화면에서는 HTML 이 하나로 줄여 버려서
   더 안 보인다. 그런데 검색 결과나 카드에는 그대로 나간다. */
/* 겹공백과 앞뒤 공백은 맞고 틀리고가 아니라 **매무새**다. 한 건씩 늘어놓으면
   수백 줄이 되어 진짜 잘못을 덮는다. 세어서 한 줄로만 알린다. */
const tidy = { 겹공백: 0, 앞뒤공백: 0 };
for (const r of corpus) {
  if (/ {2,}/.test(r.text)) tidy.겹공백++;
  if (/^\s|\s$/.test(r.text)) tidy.앞뒤공백++;
  /* 빈칸 채우기 틀의 「___ .」 은 일부러 띄운 것이다 */
  if (/\s+[,.!?;:]/.test(r.text) && !/[_→]/.test(r.text))
    lint.add('문장부호 앞 공백', 'bad', r, { found: (r.text.match(/\s+[,.!?;:]/) || [''])[0].trim(), want: null, why: '쉼표·마침표 앞은 띄우지 않는다' });
  /* 「」 짝 — 이 저장소는 낫표를 강조에 쓴다. 한쪽만 있으면 화면이 깨진다 */
  const open = (r.text.match(/[「『]/g) || []).length, close = (r.text.match(/[」』]/g) || []).length;
  if (open !== close)
    lint.add('낫표 짝', 'bad', r, { found: `여는 것 ${open}개 · 닫는 것 ${close}개`, want: null, why: '낫표 한쪽이 빠지면 강조가 글 끝까지 번진다' });
}

const chars = corpus.reduce((a, r) => a + r.text.length, 0);
const rc = lint.report(
  `글 조각 ${corpus.length.toLocaleString()}개 · ${chars.toLocaleString()}자를 봤다.\n` +
  `우리 버릇으로 굳은 띄어쓰기 ${HABIT.size}가지를 자료에서 뽑아 견줬다.`);
if (!lint.accept && (tidy.겹공백 || tidy.앞뒤공백)) {
  console.log(`\n매무새 — 겹공백 ${tidy.겹공백}곳 · 글 앞뒤에 남은 공백 ${tidy.앞뒤공백}곳`);
  console.log('  틀린 것은 아니다. 화면에서는 줄지만 검색 결과와 카드에는 그대로 나간다.');
}
process.exit(rc);
