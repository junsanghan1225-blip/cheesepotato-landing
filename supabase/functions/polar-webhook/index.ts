/* Polar 웹훅 — 구독이 생기거나 바뀌면 subscriptions 표에 적는다(2026-10-03, Paddle 에서 옮김).

   배포:  대시보드 → Edge Functions → Deploy a new function → Via Editor → 이름 polar-webhook → 이 파일을 붙여 넣기.
          만든 뒤 함수 설정에서 **Enforce JWT verification(Verify JWT) 을 끈다** — Polar 는 Supabase 로그인 토큰을 모른다.
          대신 모든 요청을 서명(Standard Webhooks, HMAC-SHA256)으로 확인하고, 틀리면 아무것도 안 쓴다.
   비밀:  Edge Functions → Secrets → POLAR_WEBHOOK_SECRET = Polar 웹훅을 만들 때 나온 secret(운영자가 직접).
   Polar → Settings → Webhooks → Add Endpoint:
          URL     https://tjgoevtvobvmlyefgxel.supabase.co/functions/v1/polar-webhook
          Format  Raw
          Events  subscription.created · subscription.updated · subscription.active · subscription.canceled ·
                  subscription.uncanceled · subscription.revoked
   순서 전체는 docs/billing-setup.md. 표는 db/add_subscriptions.sql(이미 있다 — 그대로 쓴다). */
import { createClient } from 'npm:@supabase/supabase-js@2';

const SECRET = Deno.env.get('POLAR_WEBHOOK_SECRET') ?? '';
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/* 구독자가 「구독 관리 · 해지」를 누르면 가는 곳 — Polar 의 고객 포털(결제에 쓴 메일로 들어간다). */
const PORTAL = 'https://polar.sh/everykoreans/portal';

/* Standard Webhooks: 머리 webhook-id · webhook-timestamp · webhook-signature("v1,<base64>" 여러 개는 띄어쓰기로).
   서명 대상은 `${id}.${timestamp}.${본문 그대로}`. Polar 의 secret 은 글자 그대로를 열쇠로 쓴다
   (Polar SDK 가 secret 을 base64 로 바꿔 Standard Webhooks 에 넘기는 것과 같은 결과). */
async function verify(raw: string, h: Headers): Promise<boolean> {
  const id = h.get('webhook-id'), ts = h.get('webhook-timestamp'), sig = h.get('webhook-signature');
  if (!SECRET || !id || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;   // 5분 넘은 것은 되풀이 공격으로 본다
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${ts}.${raw}`)));
  const want = btoa(String.fromCharCode(...mac));
  return sig.split(' ').some((part) => {
    const [ver, val] = part.split(',');
    if (ver !== 'v1' || !val || val.length !== want.length) return false;
    let diff = 0;
    for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ val.charCodeAt(i);
    return diff === 0;
  });
}

/* Polar 의 status → 우리 표의 status(billing.js isPro · db is_pro 가 읽는 말).
   예약 해지(cancel_at_period_end)는 기간 끝까지 active 로 남는다 — Polar 도 그렇게 보낸다.
   기간이 끝나 접근을 거둘 때(subscription.revoked)는 canceled + 지금 시각으로 적어 바로 닫는다. */
function statusOf(type: string, s: any): { status: string; end: string | null } {
  const end = s.current_period_end ?? null;
  if (type === 'subscription.revoked') return { status: 'canceled', end: s.ended_at ?? new Date().toISOString() };
  const st = String(s.status ?? '');
  /* 해지 예약(cancel_at_period_end): Polar 는 active 로 보내지만, 화면에 「해지 예약됨 · 날짜까지」를 정확히 보이려고
     canceled + 기간 끝 날짜로 적는다 — isPro · is_pro 는 그 날까지 Pro 로 본다. 다시 이으면(uncanceled) active 로 돌아온다. */
  if (s.cancel_at_period_end && (st === 'active' || st === 'trialing')) return { status: 'canceled', end };
  if (st === 'active' || st === 'trialing' || st === 'past_due') return { status: st, end };
  if (st === 'canceled') return { status: 'canceled', end: s.ended_at ?? end };
  return { status: 'canceled', end: new Date().toISOString() };   // incomplete · unpaid 등 — 열지 않는다
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  const raw = await req.text();
  if (!(await verify(raw, req.headers))) return new Response('bad signature', { status: 401 });

  const ev = JSON.parse(raw);
  const type = String(ev.type ?? '');
  if (!type.startsWith('subscription.')) return new Response('ignored');

  const s = ev.data ?? {};
  /* 누구 것인지: 결제 링크에 실어 보낸 external_customer_id(= 우리 user id) → 없으면 reference_id 메타데이터.
     둘 다 없으면(대시보드에서 손으로 만든 구독 등) 모른다 — 200 으로 받고 넘긴다(에러를 주면 계속 되보낸다). */
  const uid = s.customer?.external_id ?? s.metadata?.reference_id ?? s.checkout?.metadata?.reference_id;
  if (!UUID.test(String(uid ?? ''))) { console.warn('no user id', s.id, type); return new Response('no user'); }

  const { status, end } = statusOf(type, s);
  const interval = s.recurring_interval ?? s.price?.recurring_interval ?? s.prices?.[0]?.recurring_interval;
  const row = {
    user_id: uid,
    provider: 'polar',
    customer_id: s.customer_id ?? s.customer?.id ?? null,
    subscription_id: s.id ?? null,
    status,
    plan: interval === 'year' ? 'yearly' : 'monthly',
    current_period_end: end,
    manage_url: PORTAL,
    updated_at: s.modified_at ?? ev.timestamp ?? new Date().toISOString(),
  };

  /* 웹훅은 순서가 뒤바뀌어 올 수 있다. 이미 적힌 것보다 오래된 소식이면 버린다.
     다만 같은 시각이면 받는다 — revoked 와 updated 가 같은 modified_at 으로 오기도 한다. */
  const { data: old } = await admin.from('subscriptions').select('updated_at').eq('user_id', uid).maybeSingle();
  if (old && Date.parse(old.updated_at) > Date.parse(row.updated_at)) return new Response('stale');

  const { error } = await admin.from('subscriptions').upsert(row, { onConflict: 'user_id' });
  if (error) { console.error(error); return new Response('db error', { status: 500 }); }
  return new Response('ok');
});
