# 구독(Paddle) 붙이는 순서

사이트 쪽은 다 되어 있다. **`billing.js` 의 `clientToken` 이 비어 있는 동안은 아무것도 잠기지 않고**
구독 창에는 「곧 열려요」가 뜬다. 아래를 끝내고 값을 채우면 켜진다.

| 어디 | 무엇 |
|---|---|
| `billing.js` | Paddle 설정값(토큰·가격 id), 구독 상태 읽기, 결제 창 |
| `app.module.js` 맨 끝 「구독 (치즈감자 Pro)」 | 구독 팝업, 내 계정의 구독 줄, `?pro=1` |
| `db/add_subscriptions.sql` | 구독 표 + `is_pro()` |
| `supabase/functions/paddle-webhook/` | Paddle → 구독 표에 적는 서버 함수 |
| `tools/build-legal.mjs` | pricing.html · terms.html · refund.html |

---

## 1. Paddle 가입 (직접)

1. https://www.paddle.com 에서 가입. 회사 형태는 **Individual / Sole trader**(개인사업자) 또는
   **Private company**(법인). *Public company 를 고르면 Stock ticker 를 묻는다 — 잘못 고른 것이다.*
2. 웹사이트: `https://everykoreans.com`
   심사가 보는 쪽 — 가격 `https://everykoreans.com/pricing.html` · 약관 `/terms.html` ·
   환불 `/refund.html` · 개인정보 `/privacy.html`
3. **사업자 정보 채우기** — 사업자등록을 마쳤으면 `tools/build-legal.mjs` 의 `SELLER`
   (대표자 · 사업자등록번호 · 통신판매업 신고번호 · 주소)를 채우고
   `node tools/build-legal.mjs` 를 돌린다. 빈 칸은 쪽에 안 나온다.

심사를 기다리는 동안 **Sandbox(시험) 계정**으로 2~5번을 먼저 끝내 둔다:
https://sandbox-vendors.paddle.com

## 2. 상품과 가격 (Paddle 대시보드)

**Catalog → Products → New product**: 이름 `CheesePotato Pro`, 세금 분류 **Standard digital goods**
(또는 SaaS). 가격 두 개:

- `$4.99` · 매월(Monthly)
- `$39` · 매년(Yearly)

만들고 나면 가격마다 `pri_…` id 가 생긴다.

## 3. 토큰

**Developer tools → Authentication → Client-side tokens → New** → `test_…`(샌드박스) 또는 `live_…`.
이것은 브라우저에 보여도 되는 토큰이다(결제 창을 여는 것만 된다). **API key 와 헷갈리지 말 것** —
API key 는 절대 사이트에 넣지 않는다.

**Checkout → Checkout settings → Default payment link** 에 `https://everykoreans.com/` 을 넣는다.
(비어 있으면 결제 창이 안 열린다.)

## 4. 서버 (Supabase)

1. **SQL Editor** 에서 `db/add_subscriptions.sql` 을 통째로 돌린다.
2. 웹훅 함수 배포 — 이 저장소에서:
   ```bash
   supabase functions deploy paddle-webhook --no-verify-jwt --project-ref tjgoevtvobvmlyefgxel
   ```
3. Paddle → **Developer tools → Notifications → New destination**
   - URL: `https://tjgoevtvobvmlyefgxel.supabase.co/functions/v1/paddle-webhook`
   - 이벤트: `subscription.created` · `subscription.updated` · `subscription.activated` ·
     `subscription.canceled` · `subscription.past_due` · `subscription.paused` · `subscription.resumed`
   - 만들면 **secret key**(`pdl_ntfset_…`)가 나온다.
4. 그 비밀을 함수에 넣는다:
   ```bash
   supabase secrets set PADDLE_WEBHOOK_SECRET=pdl_ntfset_… --project-ref tjgoevtvobvmlyefgxel
   ```

## 5. 사이트에 값 넣기

`billing.js`:

```js
env: 'sandbox',
clientToken: 'test_…',
prices: { monthly: 'pri_…', yearly: 'pri_…' },
```

그다음 `node tools/stamp.mjs` → 커밋 → 배포. **이 순간부터 모의고사 2회차 이상이 잠긴다.**

## 6. 시험 결제 (샌드박스)

1. 사이트에서 로그인 → 내 계정 → 「Pro 알아보기」 → 구독하기
2. 카드 `4242 4242 4242 4242`, 만료일은 미래 아무 날, CVC `100`
3. 몇 초 뒤 Supabase **Table editor → subscriptions** 에 한 줄이 생기고, 내 계정에
   「치즈감자 Pro 구독 중」, 모의고사 2회차가 열리면 성공.
4. Paddle → Notifications 에서 전달 기록이 200 인지 본다(401 이면 비밀이 틀렸다).

## 7. 실제로 켜기

심사가 끝나면 **실제 계정(vendors.paddle.com)** 에서 2~4번을 다시 한다(샌드박스의 상품·토큰·
웹훅은 실제로 넘어오지 않는다). `billing.js` 를 `env: 'production'`, `live_…` 토큰, 실제 `pri_…` 로
바꾼다.

## 8. AI 한도 (앱 저장소)

AI 함수(`score-pronunciation` · `ask-korean`)는 앱 저장소의 `supabase/functions` 에 있고 하루 한도를
거기서 센다. 구독자 한도를 늘리려면 두 함수에서 한도를 정하는 곳을 이렇게 바꾼다:

```ts
const { data: pro } = await admin.rpc('is_pro', { uid: user.id });
const DAILY_LIMIT = pro ? 100 : 10;   // 지금 쓰는 무료 한도 값에 맞춰 조정
```

이걸 안 해도 구독은 돌아간다 — 그때는 Pro 혜택이 「모의고사 전 회차」 하나뿐이니, 가격 쪽과
구독 창의 AI 줄(`app.module.js` 의 `PRO_FEATURES`, `tools/build-legal.mjs`)을 빼 두는 게 정직하다.

## 앱(안드로이드)

이번 구독은 **웹에서만** 판다. 앱 안에서 구독을 팔거나 웹 결제로 보내는 링크를 넣으면 구글 플레이
결제 규칙이 걸린다. 같은 계정으로 앱에서도 Pro 를 쓰게 하려면 앱이 `subscriptions` 표(또는
`is_pro`)를 읽기만 하면 된다 — 앱에서 사게 하지만 않으면 된다.
