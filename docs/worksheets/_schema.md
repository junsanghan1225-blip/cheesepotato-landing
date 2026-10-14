# 학습지 자료 모양 (docs/worksheets/<id>.json)
`node tools/build-sheets.mjs` 가 이 파일 하나로 `/<id>-worksheet/` 인쇄 쪽(학습지 + 정답지)을 만든다. 쪽은 손으로 고치지 않는다.
```json
{
  "id": "days-months-dates",                    // 영문 소문자 · 숫자 · - (파일 이름 = <id>.json, 주소 = /<id>-worksheet/)
  "title": { "en": "Days, months & dates", "ko": "요일 · 월 · 날짜" },
  "sub":   { "en": "…한 줄 설명(영어)", "ko": "…한 줄 설명(한국어)" },
  "desc":  { "en": "검색 결과에 보일 설명 — 영어 300자 이내" },
  "level": "A1",                                // A1 A2 B1 B2 all
  "sections": [
    { "type": "table", "title": { "en": "Weekdays", "ko": "요일" }, "cols": ["Korean","English","Reading"], "rows": [["월요일","Monday","워료일"]], "note": "선택" },
    { "type": "text", "title": { "en": "Tip" }, "text": "설명 한두 문장" },
    { "type": "practice", "title": { "en": "Practice A — …", "ko": "…" }, "hint": "선택", "items": [{ "q": "3월 14일 →", "a": "삼월 십사일" }] }
  ],
  "howto": ["How to use it 한 줄(영어)", "…"],
  "koSummary": "한국어 요약 한두 문장"
}
```
- 표는 줄마다 칸 수가 `cols` 와 같아야 한다. 칸 4개면 너비가 고정된다. 첫 칸은 굵게.
- 연습(practice)은 3~12문제, 문제마다 `q`(문제) · `a`(정답). 정답지는 연습에서 저절로 만든다.
- 문장 · 낱말은 전부 창작 · 사실 확인(수사 · 날짜 · 제도 …). 실제 기출 문항을 쓰지 않는다.
