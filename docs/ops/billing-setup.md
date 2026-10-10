# 구독(치즈감자 Pro) 붙이는 순서 — Polar

> 2026-10-03: Paddle 은 심사에서 거절돼 **Polar** 로 옮겼다(Polar 는 계정 승인 · 본인 확인 · 우리은행 계좌 연결 끝).
> 옛 Paddle 쪽 코드(`supabase/functions/paddle-webhook/`)는 지우지 않고 남겨 두었지만 더는 쓰지 않는다.

사이트 쪽은 다 되어 있다. **`billing.js` 의 `ON` 이 `false` 인 동안은 아무것도 잠기지 않고** 구독 창에는 「곧 열려요」가 뜬다.
아래 1~5 를 운영자가 마친 뒤 「결제 켜줘」라고 하면 Claude 가 `ON = true` 로 바꾼다 — **그 순간 TOPIK 모의고사 2회차부터 잠긴다.**

| 어디 | 무엇 |
|---|---|
| `billing.js` | 켜기 스위치(`ON`) · Polar 결제 링크 · 구독 상태 읽기 · 결제 쪽으로 보내기 |
| `app.module.js` 「구독 (치즈감자 Pro)」 | 구독 팝업 · 내 계정의 구독 줄 · `?pro=1`(가격 쪽에서 옴) · `?pro=done`(결제 마치고 돌아옴) |
| `db/add_subscriptions.sql` | 구독 표 + `is_pro()`(AI 한도 함수들이 쓴다) |
| `supabase/functions/polar-webhook/` | Polar → 구독 표에 적는 서버 함수 |
| `tools/build-legal.mjs` | pricing.html · terms.html · refund.html(판매 대행사 Polar) |

결제 링크: `https://buy.polar.sh/polar_cl_enjp5pPzR4GNe1QfPIs1Z7tsoQ7tdqa3igOyW2GjisW`(월 $4.99 · 연 $39 두 상품, 결제 화면에서 고른다).
누가 결제했는지는 링크에 `external_customer_id`(= 사이트 계정 id)를 붙여 보내서 안다 — 사이트에서 로그인한 뒤 「구독하기」로 가야 한다.

---

## 1. 구독 표 (Supabase SQL Editor) — 이미 돌렸으면 건너뛴다

`db/add_subscriptions.sql` 을 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다.
(Table editor 에 `subscriptions` 표가 보이면 이미 돌린 것이다.)

## 2. 서버 함수 배포 (Supabase 대시보드)

1. **Edge Functions → Deploy a new function → Via Editor** → 이름 **`polar-webhook`**.
2. 코드 칸을 비우고 `supabase/functions/polar-webhook/index.ts` 내용을 **전부** 붙여 넣기 → **Deploy**.
3. 그 함수의 **Details(설정)** → **Enforce JWT verification(Verify JWT)** 을 **끈다** → 저장.
   Polar 는 Supabase 로그인 토큰이 없어서, 켜 두면 모든 알림이 401 로 막힌다(대신 함수가 서명으로 확인한다).

## 3. Polar 웹훅 만들기 (Polar 대시보드)

1. **Settings → Webhooks → Add Endpoint**
2. URL: `https://tjgoevtvobvmlyefgxel.supabase.co/functions/v1/polar-webhook`
3. Format: **Raw**
4. Events: `subscription.created` · `subscription.updated` · `subscription.active` · `subscription.canceled` ·
   `subscription.uncanceled` · `subscription.revoked` (subscription 으로 시작하는 것 전부 골라도 된다)
5. 만들면 나오는 **Secret** 을 복사 — **Claude 에게 보내지 않는다.**

## 4. 비밀 넣기 (Supabase 대시보드)

**Edge Functions → Secrets → Add new secret** → Name `POLAR_WEBHOOK_SECRET` · Value: 3번에서 복사한 secret → Save.

## 5. 결제 링크의 돌아올 곳 (Polar 대시보드)

**Products → Checkout Links → CheesePotato Pro → 고치기**
- Success URL: `https://everykoreans.com/?pro=done&checkout_id={CHECKOUT_ID}`
  (결제를 마치고 돌아오면 사이트가 「결제를 확인하는 중」을 띄우고, 몇 초 뒤 「구독 중」으로 바꾼다.)
- Return URL: `https://everykoreans.com/`

## 6. 켜기 (Claude)

운영자가 「결제 켜줘」 → Claude 가 `billing.js` 의 `ON = true` · 자국(stamp) · FAQ · `llms.txt` 의
「가입하면 모의고사 여러 회차」를 「1회차 무료 · 전 회차 Pro」로 고쳐 머지.

## 7. 시험 결제 (운영자, 실제 카드)

1. 사이트에서 로그인 → 내 계정 → 「Pro 알아보기」 → 구독하기 → Polar 결제 화면 → 월 $4.99 로 결제.
2. 사이트로 돌아와 몇 초 뒤 「구독 중이에요 🎉」, 모의고사 2회차가 열리면 성공.
   Supabase **Table editor → subscriptions** 에 `provider = polar` 한 줄이 생긴다.
3. Polar → **Settings → Webhooks → 그 Endpoint → Deliveries** 에서 응답이 **200** 인지 본다
   (401 = secret 이 틀렸거나 JWT 확인을 안 껐다 · `no user` = 로그인하지 않은 채 링크로 바로 결제했다).
4. 확인했으면 Polar → **Sales(Orders) → 그 주문 → Refund** 로 환불하고, 구독도 **Cancel** — 기간이 끝나면 Pro 가 닫힌다.

## 구독자가 해지할 때

내 계정 → 구독 정보 → 「구독 관리 · 해지」 → Polar 고객 포털(`https://polar.sh/everykoreans/portal`, 결제한 메일로 들어감).
해지하면 낸 기간이 끝날 때까지 Pro 가 열려 있고, 끝나면(웹훅 `subscription.revoked`) 닫힌다.

## AI 한도 (앱 저장소 · 끝)

`score-pronunciation` · `ask-korean`(앱 저장소 cheesepotatoapp#3 · #4)과 `grade-writing` 이 `is_pro()` 로 한도를 가른다 —
무료 20 · Pro 100(발음 · 도우미), 무료 2 · Pro 30(쓰기 채점). 구독 표가 채워지면 저절로 따라간다.

## 앱(안드로이드)

구독은 **웹에서만** 판다. 앱 안에서 구독을 팔거나 웹 결제로 보내는 링크를 넣으면 구글 플레이 결제 규칙이 걸린다.
같은 계정으로 앱에서도 Pro 를 쓰게 하려면 앱이 `subscriptions` 표(또는 `is_pro`)를 읽기만 하면 된다.

## 무료 체험 · 출시 할인 · 시험 패스 (2026-10-04, 운영자 결정)

사이트 쪽은 다 되어 있다(구독 쪽 #pro 의 세 장 · 잠긴 모의고사 3문제 미리 보기 · PDF 인쇄본 3회부터 Pro · 무료 횟수를 다 쓰면 체험 권유).
운영자가 Polar · Supabase 에서 할 일:

1. **7일 무료 체험** — Products → Checkout Links → CheesePotato Pro → **Free trial period 켜기 · 7 days** → 저장.
2. **출시 할인** — Products → Discounts → 새 할인: 이름 `Launch 30%` · 코드 **`LAUNCH30`** · **30%** · Duration **Once** ·
   Max redemptions **100** · Products **Yearly 만**. (사이트가 1년을 고르면 코드를 미리 채운다. 끝나면 billing.js `launch.on = false`)
3. **시험 패스 상품** — Products → 새 상품: `CheesePotato Exam Pass (3 months)` · **One-time** · **$15** → 그 상품만 넣은 새 Checkout Link
   (Success URL `https://everykoreans.com/?pro=done&checkout_id={CHECKOUT_ID}`, Return URL `https://everykoreans.com/`) → **링크를 Claude 에게**
   (비밀 아님 — billing.js `PASS_URL` 에 넣는다. 그 전에는 카드에 「곧 열려요」).
4. **웹훅 이벤트 더하기** — Settings → Webhooks → 그 Endpoint → Events 에 **`order.paid` · `order.refunded`** 체크 → 저장.
5. **서버 함수 다시 배포** — polar-webhook 을 main 의 새 코드로(시험 패스 처리).
6. **SQL** — `db/update_is_pro_pass.sql` 을 SQL Editor 에서 Run(시험 패스를 is_pro 가 Pro 로 보게 — AI 한도가 따라간다).
