/* 치즈감자 — 구독(결제)

   결제는 Paddle 이 한다(판매 대행 — 나라별 세금·환불·카드 분쟁을 그쪽이 맡는다).
   이 파일은 사이트 쪽 세 가지만 한다.
     1) 이 사람이 구독 중인가 — Supabase 의 subscriptions 표를 읽는다
        (쓰는 것은 결제 서버 함수 paddle-webhook 뿐이다. 브라우저는 읽기만).
     2) 결제 창 열기 — Paddle.js 를 **누를 때만** 불러온다. 첫 화면을 느리게
        만들 까닭이 없고, 결제를 안 하는 사람의 브라우저에 남의 스크립트가
        돌 까닭도 없다.
     3) 결제가 끝나면 표가 바뀔 때까지 몇 번 다시 읽는다(웹훅이 몇 초 늦게 온다).

   **아직 Paddle 을 안 붙였으면(아래 clientToken 이 비었으면) 아무것도 잠그지
   않는다.** 잠가 놓고 결제할 길이 없으면 그냥 막힌 사이트가 된다.
   붙이는 순서는 docs/billing-setup.md. */

export const BILLING = {
  provider: 'paddle',
  env: 'sandbox',        // 'sandbox'(시험) → 심사 끝나면 'production'
  clientToken: '',       // Paddle → Developer tools → Authentication → Client-side tokens (test_… / live_…)
  prices: {
    monthly: '',         // Paddle → Catalog → 상품 → 가격 id (pri_…)
    yearly: '',
  },
  // 화면에 보이는 값. Paddle 의 가격을 바꾸면 여기도 같이 바꾼다.
  show: { monthly: '$4.99', yearly: '$39', yearlyPerMonth: '$3.25' },
};

export const billingLive = () => !!(BILLING.clientToken && BILLING.prices.monthly && BILLING.prices.yearly);

/* ── 구독 상태 ─────────────────────────────────────────────── */
let sub = null;   // { status, plan, current_period_end, manage_url } | null

/* Paddle 의 status: active · trialing · past_due(결제 실패, 재시도 중) · paused · canceled.
   예약 해지는 기간이 끝날 때까지 active 로 남고, 끝나야 canceled 가 된다.
   past_due 는 며칠 재시도하는 동안이라 막지 않는다 — 카드 한 번 실패로 쓰던
   기능이 사라지면 억울하다. */
export function isPro() {
  if (!sub) return false;
  if (['active', 'trialing', 'past_due'].includes(sub.status)) return true;
  return sub.status === 'canceled' && !!sub.current_period_end && Date.parse(sub.current_period_end) > Date.now();
}
export const proInfo = () => sub;

export async function loadPro(sb, session) {
  if (!session) { sub = null; return false; }
  const { data, error } = await sb.from('subscriptions')
    .select('status, plan, current_period_end, manage_url')
    .eq('user_id', session.user.id).maybeSingle();
  /* 표가 아직 없는 프로젝트(db/add_subscriptions.sql 을 안 돌림)에서도 사이트는
     살아 있어야 한다 — 읽기 실패는 「구독 안 함」으로 본다. */
  sub = error ? null : data;
  return isPro();
}

/* ── 결제 창 ───────────────────────────────────────────────── */
let paddleP = null;
let onDone = null;
function paddleNeed() {
  if (paddleP) return paddleP;
  paddleP = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    s.async = true;
    s.onload = () => {
      try {
        const P = window.Paddle;
        if (BILLING.env === 'sandbox') P.Environment.set('sandbox');
        P.Initialize({
          token: BILLING.clientToken,
          eventCallback: (ev) => { if (ev?.name === 'checkout.completed' && onDone) onDone(ev); },
        });
        resolve(P);
      } catch (e) { reject(e); }
    };
    s.onerror = () => { paddleP = null; reject(new Error('paddle.js load failed')); };
    document.head.appendChild(s);
  });
  return paddleP;
}

/* plan: 'monthly' | 'yearly'. 결제한 사람이 누구인지는 customData.user_id 로
   넘긴다 — 웹훅이 이것으로 subscriptions 의 한 줄을 고른다. 이메일로 찾지 않는
   까닭: Paddle 결제 창에서 이메일을 바꿔 쓸 수 있다. */
export async function openCheckout(plan, session, { lang = 'en', done } = {}) {
  const P = await paddleNeed();
  onDone = done || null;
  P.Checkout.open({
    items: [{ priceId: BILLING.prices[plan], quantity: 1 }],
    customer: session?.user?.email ? { email: session.user.email } : undefined,
    customData: { user_id: session.user.id },
    settings: { displayMode: 'overlay', theme: 'light', locale: lang === 'ko' ? 'ko' : 'en', allowLogout: false },
  });
}

/* 결제가 끝난 직후엔 웹훅이 아직 안 왔을 수 있다. 2초 간격으로 열 번까지 읽는다. */
export async function waitPro(sb, session, tries = 10) {
  for (let i = 0; i < tries; i++) {
    if (await loadPro(sb, session)) return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}
