/* 씨앗 글 지시문 뽑기.  node tools/seed-prompt.mjs 3
   표현이 290개라 한 번에 못 시킨다. 갈래를 쪼개지 않고 여섯 벌로 나눈다 —
   갈래 가운데를 자르면 같은 갈래 안에서 말투가 갈린다. */
import { SB_CATS, SB_MORE, SB_SEED } from '../sentences.js';

const LV = { beginner: '초급', intermediate: '중급', advanced: '고급' };
const rows = [];
SB_CATS.forEach((c) => c.points.forEach((p) => rows.push({ ...p, cat: c.id, catko: c.ko, no: c.no })));

/* 급수마다 갈래를 반씩 갈라 두 벌로. 여섯 벌이 된다. */
const batches = [];
['beginner', 'intermediate', 'advanced'].forEach((lv) => {
  const r = rows.filter((x) => x.lv === lv);
  const cats = [...new Set(r.map((x) => x.cat))];
  const half = Math.ceil(r.length / 2);
  let cut = 0, acc = 0;
  for (const c of cats) {
    const n = r.filter((x) => x.cat === c).length;
    if (acc + n > half) break;
    acc += n; cut++;
  }
  batches.push(r.filter((x) => cats.slice(0, cut).includes(x.cat)));
  batches.push(r.filter((x) => cats.slice(cut).includes(x.cat)));
});

const n = Number(process.argv[2] || 1);
const b = batches[n - 1];
if (!b) {
  batches.forEach((x, i) =>
    console.log(`${i + 1}부 — ${LV[x[0].lv]} · 표현 ${x.length}개 · 갈래 ${new Set(x.map((y) => y.cat)).size}개 · ${x[0].id} ~ ${x[x.length - 1].id}`));
  process.exit(0);
}

const lv = LV[b[0].lv];
const done = b.filter((p) => (SB_SEED[p.id] || []).length);
console.log(`한국어 학습 앱의 「예문 게시판」에 올릴 **학습자 예문** 을 만들어 주세요.
이번 벌은 ${lv} 표현 ${b.length}개, 표현마다 두 문장씩 **${b.length * 2}문장** 입니다.

## 이게 무엇인가

표현마다 이미 뜻풀이와 대표 예문이 있습니다. 여기에 붙일 것은 그 표현으로
**다른 학습자가 직접 써 본 문장** 입니다. 교과서 예문이 아니라 사람이 쓴 말처럼
들려야 합니다 — 자기 하루, 자기 사정이 한 조각 들어간 문장.

  좋음   시끄러운 카페에서 공부하느니 도서관에 가는 게 낫겠어요.
  좋음   비싼 돈을 주고 새 걸 사느니 고쳐 쓰는 게 나아요.
  나쁨   이것은 -느니의 예문입니다.            ← 문법 설명이지 문장이 아님
  나쁨   가느니 안 가느니 하는 것이 좋습니다.   ← 무슨 상황인지 안 보임

## 지켜야 할 것

1. **그 표현을 반드시 쓴다.** 표에 적힌 형태가 문장 안에 실제로 들어가야 합니다.
   활용해서 모양이 바뀌는 건 괜찮습니다(「-는 셈치다」→「셈치고」).
2. **해요체로 끝냅니다.** 「-아/어요」 「-지요」 「-네요」 「-거든요」.
   게시판에 학습자가 올린 글이라 「-습니다」는 어색합니다.
   (단, 그 표현 자체가 「-습니다」류 종결형이면 그건 예외입니다.)
3. **한 문장, 12~45자.** 두 문장으로 늘이지 마세요.
4. 두 문장은 **서로 다른 상황** 이어야 합니다. 같은 말을 낱말만 바꿔 두 번
   쓰지 마세요. 하나는 일상(집·밥·날씨·가족), 하나는 바깥일(학교·회사·가게)
   쪽으로 갈라 주면 좋습니다.
5. **표에 적힌 대표 예문과 겹치지 마세요.** 그 문장은 이미 화면에 떠 있습니다.
6. 한자·영어 낱말·별표·이모지를 쓰지 마세요. 전부 한글과 숫자로.
7. 이름·좋아요·시간은 **넣지 마세요.** 저희가 붙입니다.

## 출력 형식

마크다운 울타리 없이, 표현 id 를 열쇠로 하는 JSON 객체 하나만 주세요.
값은 문장 두 개짜리 배열입니다.

{
  "${b[0].id}": ["첫 번째 문장.", "두 번째 문장."],
  "${b[1] ? b[1].id : 'x-x'}": ["…", "…"]
}

## 만들 표현 ${b.length}개
`);

let cat = null;
b.forEach((p) => {
  if (p.cat !== cat) { cat = p.cat; console.log(`\n### ${p.no}. ${p.catko}`); }
  const m = SB_MORE[p.id] || [];
  console.log(`\n- **${p.id}** 「${p.name}」`);
  console.log(`  뜻   ${p.desc}`);
  if (m[0]) console.log(`  형태  ${m[0]}`);
  if (m[2]) console.log(`  주의  ${m[2]}`);
  console.log(`  이미 있는 예문(겹치지 마세요)  ${p.ex}${m[3] ? ` / ${m[3]}` : ''}`);
});

console.log(`
## 다 만든 뒤 확인할 것

- [ ] 표현 ${b.length}개가 다 있는가, 문장이 ${b.length * 2}개인가
- [ ] 문장마다 그 표현이 실제로 들어 있는가
- [ ] 전부 해요체로 끝나는가
- [ ] 「이미 있는 예문」과 똑같은 문장이 없는가
- [ ] 한 표현의 두 문장이 서로 다른 상황인가
- [ ] 한자·영어 낱말·별표가 없는가`);

if (done.length) console.error(`\n(참고 — 이 벌에서 이미 씨앗이 있는 표현 ${done.length}개: ${done.map((p) => p.id).join(', ')})`);
