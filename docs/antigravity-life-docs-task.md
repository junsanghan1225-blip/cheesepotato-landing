# 안티 그래비티 작업 지시 — 「한국에서 사는 순간」 실물 문서 읽기 10편

> 이 파일 전체를 안티 그래비티에 붙여 넣는다.

## 왜

EPS(고용허가제)와 KIIP(사회통합프로그램)로 오는 사람은 한국어 **시험**보다 한국에서 **살고 일하는 것**이
목적이다. 이들이 가장 막히는 곳은 교과서가 아니라 **서류**다 — 근로계약서, 급여명세서, 월세 계약서,
병원 문진표. 이걸 칸마다 풀어 주는 곳이 거의 없다. 치즈감자가 그 자리를 맡는다.

블로그에 **실물 문서 블록(`doc`)** 이 새로 생겼다. 서류를 종이 모양 그대로 보여 주고, 짚어야 할 칸에 번호를
붙여 아래에 설명한다.

```json
{ "t": "doc", "title": "급여명세서", "sub": "(Example — made-up values)",
  "rows": [
    { "k": "기본급", "v": "2,100,000원", "tip": "Your base pay before anything is taken out." },
    { "k": "국민연금", "v": "-94,500원", "tip": "National pension. …" },
    { "k": "실수령액", "v": "1,850,000원" }
  ] }
```

- `k`(칸 이름) · `v`(값)는 **실제 서류처럼 한국어로**. `tip` 은 글의 말(영어)로 「이 칸에서 무엇을 보나」.
- `tip` 을 단 칸에만 번호가 붙는다. 한 문서에 tip 은 **4~7개** — 전부 달면 아무것도 안 짚은 것과 같다.
- `rows` 는 셋 이상. 값은 **지어낸 것**이고 `sub` 에 그렇다고 적는다. 실제 회사 · 사람 · 주소를 쓰지 않는다.

## 만들 것 — 영어 글 10편 (`lang: 'en'`)

| id | 문서 | 꼭 들어갈 것 |
|---|---|---|
| `korean-employment-contract-english` | 근로계약서 | 근로기간 · 근무 장소 · 업무 · 근로시간 · 휴게 · 휴일 · 임금 · 지급일 · 사회보험 |
| `korean-pay-slip-english` | 급여명세서 | 기본급 · 연장/야간/휴일 수당 · 4대 보험 · 소득세 · 실수령액 |
| `korean-lease-contract-english` | 월세 계약서 | 보증금 · 월세 · 관리비 · 계약 기간 · 특약 |
| `korean-hospital-form-english` | 병원 문진표 | 증상 · 언제부터 · 복용 중인 약 · 알레르기 · 과거 병력 + 증상 말하기 대화 |
| `korean-bank-account-form-english` | 계좌 개설 신청서 | 이름(여권 영문) · 외국인등록번호 · 주소 · 직업 · 용도 |
| `korean-maintenance-bill-english` | 관리비 고지서 | 일반관리비 · 전기 · 수도 · 난방 · 납부 기한 |
| `korean-delivery-text-english` | 택배 문자 · 부재 안내 | 송장번호 · 배송 예정 · 경비실/문 앞 · 반송 |
| `korean-phone-contract-english` | 휴대폰 약정서 | 요금제 · 약정 기간 · 위약금 · 자동이체 |
| `korean-work-safety-form-english` | 안전 교육 확인서 · 작업 지시서 | 보호구 · 작업 내용 · 위험 요소 · 서명 (EPS 와 이어진다) |
| `korean-visa-extension-form-english` | 체류기간 연장 신청서 | 신청 종류 · 체류 자격 · 근무처 · 연락처 |

글 하나의 짜임(600~1,000낱말):
1. 누가 언제 이 서류를 받나 — 한두 문단
2. **`doc` 블록** — 문서 전체
3. 칸마다 더 풀어야 할 것은 `h` 소제목 + `p` 로
4. 이 서류 앞에서 쓰는 **짧은 대화(`dlg`)** 하나 — 예) 급여명세서: 「사장님, 이번 달 야간 수당이 빠진 것 같아요.」
5. 자주 쓰는 낱말 **`ex` 대여섯 개**(한국어 + 영어 뜻)
6. **`note` 하나 — 확인할 곳.** 아래 「사실 확인」 참고
7. 문법 카드 `gram` 하나 이상(`blog-prompt.mjs` 가 준 목록의 id 만)과 `link` 하나 — EPS 글이면 `/eps-topik/`

`tags: ['Life in Korea', 'English']` — 이 두 갈래만. `date` · `updated` 는 올리는 날.

## 사실 확인 — 가장 중요

서류 글은 **틀리면 사람이 손해를 본다**(임금 · 보증금 · 체류).
- **해마다 바뀌는 숫자는 「지금 값」으로 쓰지 않는다.** 최저임금 · 4대 보험 요율 · 수수료 · 과태료는
  「이 예시에서는 4.5%」처럼 **예시로만** 쓰고, `note` 에 「Check this year's rate at 최저임금위원회 /
  국민연금공단 / 하이코리아(hikorea.go.kr)」처럼 **공식 확인처**를 적는다.
- 법 · 제도(체류 자격, 보증금 반환, 퇴직금 조건)는 **확실한 것만** 쓴다. 모르면 쓰지 말고 「ask 1350
  (고용노동부 상담) / 1345 (외국인종합안내센터)」로 보낸다.
- 전화번호 · 기관 이름은 **실제로 있는 것만**. 지어내지 않는다.
- 운영자가 확인할 곳에 `note` 를 `"title": "운영자 확인"` 으로 달아 둔다(올리기 전에 운영자가 보고 지운다).

## 순서

```bash
git checkout main && git pull origin main
git checkout -b blog-life-docs
node tools/blog-prompt.mjs --en beginner "reading a Korean pay slip" > /tmp/rules.txt   # 블록 모양 · gram id · 걸 수 있는 주소
```

글 하나마다: `/tmp/<id>.json` 에 쓰고

```bash
node tools/blog-merge.mjs /tmp/<id>.json
node tools/check-blog.mjs
```

**글 하나 = 커밋 하나.** 열 편을 한 번에 쓰면 뒤로 갈수록 짧아지고 흐려진다.

다 쓰면:

```bash
node tools/build-pages.mjs
git pull origin main          # 올리기 직전에 main 을 한 번 더
node tools/stamp.mjs && node tools/stamp.mjs --check
git push -u origin blog-life-docs
```

## 하지 말 것

- `tools/` 를 고치지 않는다. 검사에 막히면 글을 고친다.
- 실제 회사 · 사람 · 주소 · 계좌번호 · 외국인등록번호를 쓰지 않는다(`123456-7******` 처럼 가린 모양만).
- 이미 있는 글을 고치지 않는다.
- `stamp.mjs --check` 를 건너뛰지 않는다.

PR 설명에 글마다 낱말 수, tip 수, 「운영자 확인」 note 가 붙은 곳을 적는다.
