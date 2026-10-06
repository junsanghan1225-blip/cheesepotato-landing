/* 치즈감자 — 구독(결제)

   결제는 Polar 가 한다(판매 대행 — 나라별 세금·환불·카드 분쟁을 그쪽이 맡는다).
   이 파일은 사이트 쪽 세 가지만 한다.
     1) 이 사람이 구독 중인가 — Supabase 의 subscriptions 표를 읽는다
        (쓰는 것은 결제 서버 함수 polar-webhook 뿐이다. 브라우저는 읽기만).
     2) 결제 창 열기 — Polar 결제 화면으로 넘긴다(같은 창). 남의 스크립트를 우리 쪽에
        불러오지 않는다.
     3) 결제가 끝나고 돌아오면 표가 바뀔 때까지 몇 번 다시 읽는다(웹훅이 몇 초 늦게 온다).

   **아래 ON 이 false 인 동안은 아무것도 잠그지 않는다.** 잠가 놓고 결제할 길이 없으면
   그냥 막힌 사이트가 된다.
   붙이는 순서는 docs/billing-setup.md. */

/* 결제는 Polar 로 옮겼다(2026-10-03 — Paddle 은 심사에서 거절, Polar 는 승인).
   Polar 의 「결제 링크(Checkout Link)」 하나로 연다 — 월 · 연 두 상품이 한 링크에 들어 있고
   학생이 결제 화면에서 고른다. 링크 주소는 비밀이 아니다(누구나 보는 결제 화면 주소).
   비밀인 Access token · 웹훅 secret 은 여기 절대 넣지 않는다 — secret 은 Supabase secrets 에만.

   **ON 을 true 로 바꾸는 순간 결제가 켜지고 모의고사 2회차부터 잠긴다.** 운영자가
   「결제 켜줘」라고 하기 전에는 false 로 둔다(CLAUDE.md 3장). 켜기 전에 Supabase 쪽
   (polar-webhook 함수 · POLAR_WEBHOOK_SECRET)을 먼저 마친다 — 순서는 docs/billing-setup.md. */
const ON = true;   // 운영자 「결제 켜줘」 2026-10-04
const CHECKOUT_URL = 'https://buy.polar.sh/polar_cl_enjp5pPzR4GNe1QfPIs1Z7tsoQ7tdqa3igOyW2GjisW';

/* 시험 패스 — 한 번 결제 · 3개월 · 자동 갱신 없음(운영자 결정 2026-10-04, $15). Polar 의 한 번 결제 상품 결제 링크.
   운영자가 Polar 에서 상품 · 링크를 만들어 주면 넣는다 — 비어 있으면 구독 쪽에 「곧 열려요」. */
const PASS_URL = 'https://buy.polar.sh/polar_cl_MFDeS9rr2PecjLezT7w7EtdgsrtUZ6JHz9xxb2pf9Vo';

export const BILLING = {
  provider: 'polar',
  checkoutUrl: CHECKOUT_URL,
  passUrl: PASS_URL,
  /* 7일 무료 체험(운영자 결정 2026-10-04) — 실제 체험은 Polar 결제 링크의 「Free trial period」가 정한다. 여기는 화면 글자만. */
  trialDays: 7,
  /* 출시 기념 할인 — 1년 30% · 선착 100명(운영자 결정 2026-10-04). 코드는 Polar → Discounts 에서 운영자가 만든다
     (LAUNCH30 · 30% · 한 번 · 최대 100번 · 1년 상품만). 1년을 고르면 결제 화면에 코드를 미리 채운다. 끝나면 on 을 false 로. */
  launch: { on: true, code: 'LAUNCH30', pct: 30 },
  // 화면에 보이는 값. Polar 의 가격을 바꾸면 여기도 같이 바꾼다.
  show: { monthly: '$4.99', yearly: '$39', yearlyPerMonth: '$3.25', yearlyLaunch: '$27.30', yearlyLaunchPerMonth: '$2.28', pass: '$15', passMonths: 3 },
};

export const billingLive = () => ON && !!BILLING.checkoutUrl;

/* ── 구독 상태 ─────────────────────────────────────────────── */
let sub = null;   // { status, plan, current_period_end, manage_url } | null

/* 표의 status(polar-webhook 이 적는다): active · trialing · past_due(결제 실패, 재시도 중) · canceled.
   예약 해지는 기간이 끝날 때까지 active 로 남고, 끝나야(Polar 의 subscription.revoked) canceled 가 된다.
   past_due 는 며칠 재시도하는 동안이라 막지 않는다 — 카드 한 번 실패로 쓰던
   기능이 사라지면 억울하다. */
export function isPro() {
  if (!sub) return false;
  /* 시험 패스: 기간(current_period_end)이 남아 있는 동안 Pro. db 의 is_pro() 와 같은 규칙. */
  if (sub.status === 'pass') return !!sub.current_period_end && Date.parse(sub.current_period_end) > Date.now();
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
/* Polar 결제 화면으로 넘어간다(같은 창). 남의 스크립트를 우리 쪽에 불러오지 않는다 — 결제 화면은 Polar 의 쪽이다.
   누가 결제했는지는 external_customer_id(= 우리 user id)로 넘긴다 — 웹훅이 이것으로 subscriptions 의 한 줄을
   고른다. 이메일로 찾지 않는 까닭: 결제 화면에서 이메일을 바꿔 쓸 수 있다. reference_id 도 같은 값으로
   한 번 더 싣는다(결제 메타데이터로 들어간다 — 둘 중 하나라도 오면 찾는다).
   plan: monthly · yearly 는 같은 링크(결제 화면에서 고른다, 1년이면 출시 할인 코드를 미리 채운다) · pass 는 시험 패스 링크. 결제가 끝나면 Polar 가
   링크의 Success URL(https://everykoreans.com/?pro=done&checkout_id={CHECKOUT_ID})로 돌려보낸다. */
export async function openCheckout(plan, session, { lang = 'en' } = {}) {
  const u = new URL(plan === 'pass' ? BILLING.passUrl : BILLING.checkoutUrl);
  if (plan === 'yearly' && BILLING.launch.on) u.searchParams.set('discount_code', BILLING.launch.code);
  if (session?.user?.email) u.searchParams.set('customer_email', session.user.email);
  u.searchParams.set('external_customer_id', session.user.id);
  u.searchParams.set('reference_id', session.user.id);
  u.searchParams.set('utm_source', 'everykoreans');
  u.searchParams.set('utm_content', plan || '');
  if (lang) u.searchParams.set('locale', lang);
  location.href = u.toString();
}

/* 결제가 끝난 직후엔 웹훅이 아직 안 왔을 수 있다. 2초 간격으로 열 번까지 읽는다. */
export async function waitPro(sb, session, tries = 10) {
  for (let i = 0; i < tries; i++) {
    if (await loadPro(sb, session)) return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}
