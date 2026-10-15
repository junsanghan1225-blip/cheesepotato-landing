# iOS 앱 내기 — 준비 (2026-10-16, 아직 시작 전)

> 안드로이드 앱은 출시됨. iOS 는 **운영자가 정해야 할 것**이 먼저다. 아래 숫자 · 규칙 중 ⚠ 는 애플이 자주 바꾸므로 시작 전에 공식 문서로 다시 확인한다(Claude 가 직접 확인하지 못했다).

## 운영자가 정할 것
1. **애플 개발자 계정**(Apple Developer Program, 개인 / 사업자). ⚠ 유료(연회비), 승인에 며칠 걸릴 수 있다. 사업자로 내려면 D-U-N-S 번호가 필요할 수 있다.
2. 맥이 없어도 된다 — 빌드는 EAS(클라우드)가 한다. 대신 올리기(`eas submit`)에 애플 계정 로그인이 필요하다.
3. 아이폰 시험 기기 1대 이상(없으면 TestFlight 로 지인).

## 지금 앱 상태 (cheesepotatoapp `app.json`)
- `ios.bundleIdentifier = com.cheesepotato.app` · `ITSAppUsesNonExemptEncryption = false` · 카메라 설명 글 있음.
- 로그인: 이메일 + 구글(브라우저 방식). ⚠ **애플은 구글 같은 다른 회사 로그인을 넣으면 「Apple로 로그인」(또는 같은 수준의 개인정보 보호 로그인)도 요구하는 경우가 많다** — 심사 전에 규칙(App Store 심사 지침 4.8)을 확인하고, 필요하면 Supabase 에 Apple 로그인을 켠다(운영자 작업: 애플 개발자 계정에서 Service ID · 키 → Supabase Auth Providers → Apple).
- 결제: 앱은 가격 · 결제 단추를 숨기고 웹에서 산 Pro 의 **상태만** 보여 준다(구글 플레이 규칙 때문). ⚠ 애플은 앱 안에서 쓰는 디지털 기능을 앱 밖에서 팔 때의 규칙(3.1.1 · 3.1.3)이 나라 · 시기마다 달라서 **심사에서 걸릴 수 있다**. 걸리면 iOS 에서는 Pro 를 보여 주기만 하거나 앱 내 구매(IAP)를 붙여야 한다 → 그때 따로 의논.
- 친구 초대 보너스(Pro 30일)는 서버 기능이라 iOS 에서도 그대로 보인다.

## 순서 (정하면 Claude 가 코드 쪽을 먼저 준비)
1. 애플 개발자 계정 만들기 → 알려 주기.
2. Claude: 앱 `app.json` iOS 항목 점검(아이콘 1024 · 화면 방향 · 권한 글) + 로그인(4.8) 대응 + `npx tsc --noEmit`.
3. 운영자: `npx.cmd eas-cli build -p ios --profile production` → `eas submit -p ios`(애플 계정 로그인) → TestFlight 로 아이폰 확인.
4. 스토어 글 · 스크린샷(아이폰 6.7인치 / 6.5인치 ⚠ 크기 규칙 확인) · 개인정보(App Privacy) 답변은 앱 저장소(cheesepotatoapp)의 store-listing · data-safety 문서를 바탕으로 Claude 가 초안.
5. 심사 제출 → 걸리면 이유 알려 주기.
