# 분석 자동 수집 켜기 — 운영자 한 번만 (약 20분)

**무엇이 되나**: 매일 아침 7시 10분(한국), 어제 하루의 GA4 숫자와 Search Console 검색 숫자가 자동으로 모여
`analytics-data` 가지(`daily/날짜/` 폴더에 CSV 8개 + `일간 성과 요약.md`, 맨 위에는 `latest.md`)에 쌓입니다.
"안티가 올렸어"처럼 「오늘 성과 봐 줘」라고 하시면 Claude 가 그 요약을 읽고 이상한 것 · 고칠 것 1~3개를 말합니다.
> ⚠ 이 저장소는 **공개**라서 `analytics-data` 가지도 누구나 볼 수 있습니다(집계 숫자만 — 개인 정보 없음). 비공개로 두고 싶으면 말씀하세요 — 비공개 저장소를 따로 만드는 방식으로 바꿉니다.

## 순서 (모두 무료)
1. **구글 클라우드 프로젝트** — https://console.cloud.google.com → 위쪽 프로젝트 선택 → 「새 프로젝트」 → 이름 `cheesepotato-analytics` → 만들기.
2. **API 두 개 켜기** — 왼쪽 메뉴 「API 및 서비스」 → 「라이브러리」 → `Google Analytics Data API` 검색 → 「사용」, 같은 방법으로 `Google Search Console API`(이름이 `Search Console API`) → 「사용」.
3. **서비스 계정 만들기** — 「API 및 서비스」 → 「사용자 인증 정보」 → 「사용자 인증 정보 만들기」 → 「서비스 계정」 → 이름 `analytics-reader` → 만들고 계속 → (역할 건너뜀) → 완료. 만들어진 계정의 **이메일 주소**(`…@….iam.gserviceaccount.com`)를 복사해 둡니다.
4. **키 받기** — 그 서비스 계정을 열고 「키」 탭 → 「키 추가」 → 「새 키 만들기」 → `JSON` → 만들기 → 파일이 내려받아집니다. ⚠ **이 파일은 비밀입니다 — 채팅 · 이메일 · 저장소 어디에도 올리지 마세요.**
5. **GA4 에 읽기 권한** — https://analytics.google.com → 왼쪽 아래 톱니바퀴 「관리」 → 「속성 액세스 관리」 → `+` → 「사용자 추가」 → 3번에서 복사한 이메일 → 역할 **뷰어** → 추가. 같은 「관리」 화면의 「속성 설정」에서 **속성 ID**(숫자)를 복사해 둡니다.
6. **Search Console 에 읽기 권한** — https://search.google.com/search-console → 왼쪽 아래 「설정」 → 「사용자 및 권한」 → 「사용자 추가」 → 같은 이메일 → 권한 **제한됨**(읽기) → 추가. 속성 종류가 「도메인」이면 `sc-domain:everykoreans.com`, 「URL 접두어」면 `https://everykoreans.com/` 로 적습니다.
7. **GitHub 에 넣기** — 저장소 → Settings → Secrets and variables → Actions
   - 「Secrets」 탭 → New repository secret → 이름 `GOOGLE_SA_KEY` → 값에 **4번에서 받은 JSON 파일의 내용 전체**를 붙여 넣기.
   - 「Variables」 탭 → New repository variable → `GA_PROPERTY_ID` = 5번의 숫자, `SC_SITE` = 6번의 값.
8. **시험** — 저장소 Actions 탭 → `analytics-daily` → Run workflow. 1분쯤 뒤 초록 체크가 뜨고 `analytics-data` 가지가 생기면 끝입니다. 실패하면 로그의 빨간 줄을 Claude 에게 알려 주세요(비밀 값은 로그에 나오지 않습니다).

## 알아 둘 것
- GA4 는 **어제 하루**, Search Console 은 **2~3일 늦게 확정된 7일**입니다(구글이 그렇게 줍니다).
- 세 값(Secret 1 + Variable 2) 중 하나라도 없으면 그냥 건너뛰니 아무 문제 없습니다.
- 숫자의 기준은 GA4 · Search Console 화면입니다. 자동 수집은 비교 · 추세용입니다.

## Clarity 24시간 요약 붙이기 (선택 · 2026-10-19)
1. Clarity → 설정 → 데이터 내보내기 → 새 API 토큰 만들기.
2. GitHub 저장소 → Settings → Secrets and variables → Actions → **Secrets** 에 `CLARITY_API_TOKEN` 으로 넣는다(채팅 · 코드에 적지 않는다).
3. 매일 수집(`analytics-daily`)이 돌 때 「일간 성과 요약」 맨 아래에 Clarity 24시간 숫자(문제 신호 · 쪽별)가 붙고, 원본은 `clarity-24시간.json` 으로 남는다.
- 한계: Clarity 는 하루 호출이 적고(약 10번) 「최근 24시간」 묶음 숫자만 준다. 녹화 · 히트맵은 못 받는다. 토큰이 없거나 호출이 실패해도 GA4 · Search Console 수집은 그대로 간다(요약에 이유를 적는다).
- 아직 **실제 토큰으로 시험하지 못했다** — 처음 도는 날 요약에 「Clarity 일부를 못 받았어요」가 나오면 그 문장을 Claude 에게 알려 주기(쪽별 묶음 이름이 다를 수 있다).

## Polar 결제 숫자 붙이기 (선택 · 2026-10-19)
1. Polar → 설정 → **Access tokens**(개인 · 조직 토큰) → 새 토큰. **읽기 전용 권한(주문 · 구독 읽기)만** 고른다. 쓰기 권한은 주지 않는다.
2. GitHub → Secrets 에 `POLAR_READ_TOKEN` 으로 넣는다(채팅 · 코드에 적지 않는다).
3. 「일간 성과 요약」에 어제(한국 날짜) 주문 수 · 금액 · 상품별 + 지금 구독 중인 수가 붙는다.
- 아직 **실제 토큰으로 시험하지 못했다** — 요약에 「Polar 일부를 못 받았어요」가 나오면 그 문장을 Claude 에게 알려 주기(필드 이름이 다를 수 있다).
