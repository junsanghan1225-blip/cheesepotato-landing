# 안티 그래비티 작업 지시 — 사자성어 · 속담 · 관용 표현 450개 (150개 한 묶음)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번은 **N묶음**이야.」
> 1묶음 = 사자성어 150 · 2묶음 = 속담 150 · 3묶음 = 관용 표현 150. 브랜치 이름: `expressions`

## 왜
운영자 요청(2026-10-07): 「단어 세션에 사자성어 · 속담 · 관용 표현을 다양하게 — **매핑은 철저하게**」.
지금 낱말 자료에는 한 단어짜리만 있다. 표현은 따로 `vocab/data/expressions.json` 에 모으고, 단어 화면 · 반 숙제에서
주제 · 상황 · 레벨로 찾게 한다. TOPIK 중고급 읽기 · 쓰기, 드라마, 생활에서 **자주 나오는 것부터** 고른다.

## 모양 — `vocab/data/expressions.json` (배열, 한 줄 = 한 표현)
```json
{
  "id": "x4-001",                 // 사자성어 x4-001… · 속담 xp-001… · 관용 표현 xi-001… (세 자리, 바꾸지 않는다)
  "type": "idiom4",               // idiom4(사자성어) · proverb(속담) · idiom(관용 표현)
  "head": "일석이조",              // 표제(속담 · 관용은 기본형: 「발이 넓다」 · 「가는 말이 고와야 오는 말이 곱다」)
  "hanja": "一石二鳥",             // 사자성어만, 글자 수 = 음절 수(4). 속담 · 관용은 ""
  "hanja_each": ["한 일", "돌 석", "두 이", "새 조"],   // 사자성어만 — 한 글자씩 훈과 음
  "literal": "one stone, two birds",   // 글자 그대로의 뜻(영어)
  "meaning": "한 가지 일로 두 가지 이익을 얻음",        // 쉬운 한국어 풀이(한 줄)
  "en": "to kill two birds with one stone",           // 실제 뜻(영어, 짧게)
  "en_equiv": "kill two birds with one stone",        // 영어에 비슷한 관용 표현이 있으면, 없으면 ""
  "lv": 5,                        // 감자 레벨 3~7(쉬운 생활 표현 3~4 · TOPIK II 중급 5~6 · 고급 7)
  "topik": true,                  // TOPIK 읽기 · 쓰기에 나올 만하면 true
  "topics": ["school/study", "concepts/cause-result"],   // vocab/taxonomy.json 의 칸 1~3개(지어내지 않는다)
  "situations": ["praise", "advice"],                   // 아래 상황 꼬리표 1~3개
  "tone": "neutral",              // formal(글 · 뉴스) · neutral · casual(친구 말)
  "examples": [["버스로 가면 운동도 되고 돈도 아끼니 일석이조예요.", "Taking the bus gives you exercise and saves money — two birds with one stone."],
               ["이 정책은 환경도 지키고 일자리도 만드는 일석이조의 효과가 있다.", "This policy has a two-birds-one-stone effect: protecting the environment and creating jobs."]],
  "dialog": [["A", "요즘 자전거로 출근해요."], ["B", "운동도 하고 교통비도 아끼고, 일석이조네요!"]],
  "rel": { "syn": ["일거양득"], "ant": [] },          // 확실한 것만, 모르면 비운다
  "words": ["돌", "새", "이익"],                       // 이 표현 안 · 뜻에 나오는 낱말 중 우리 낱말 자료(topik1/2.json head)에 있는 것
  "note": "칭찬할 때 많이 써요. 글에서는 「일석이조의 효과」 꼴이 흔해요.",   // 쓸 때 주의 · 잘 붙는 말(한 줄, 없으면 "")
  "src": "창작 예문"
}
```
상황 꼬리표(`situations`): `praise` 칭찬 · `advice` 충고 · `warning` 경고 · `comfort` 위로 · `criticism` 비판 · `effort` 노력 · `luck` 운 · `relationship` 사람 사이 ·
`money` 돈 · `work` 일 · `study` 공부 · `time` 시간 · `speech` 말조심 · `emotion` 감정 · `situation` 형편 · 처지 · `news` 뉴스 · 사회

## 지킬 것 — 「철저한 매핑」
1. **사실만**: 실제로 쓰이는 표현만(지어내지 않는다). 한자 · 훈음은 사전대로. 뜻이 둘이면 많이 쓰는 뜻 하나.
2. **예문 2개는 창작**(교과서 · 기출 · 드라마 대사를 베끼지 않는다): 첫째 = 말(생활), 둘째 = 글(뉴스 · 설명문). 20~45자.
3. `topics` 는 `vocab/taxonomy.json` 의 id 만. `words` 는 `vocab/data/topik1.json` · `topik2.json` 의 `head` 에 **실제로 있는** 낱말만.
4. `rel.syn` · `rel.ant` 은 같은 파일 안 표현이나 널리 알려진 표현만, 확실하지 않으면 비운다.
5. 비속어 · 차별 표현(외모 · 장애 · 성별 · 지역 비하)은 넣지 않는다.
6. 묶음 안에서 `head` 가 겹치지 않는다. 이전 묶음 줄은 건드리지 않는다.

## 올리기
- 검사: `node tools/check-expressions.mjs`
- 커밋에는 `vocab/data/expressions.json` 하나만. 한 묶음씩.
- 커밋 메시지: `표현 N묶음 — 사자성어|속담|관용 표현 150개`
