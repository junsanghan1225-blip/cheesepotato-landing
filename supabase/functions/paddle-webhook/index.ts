/* Paddle 웹훅 — 구독이 생기거나 바뀌면 subscriptions 표에 적는다.

   배포:  supabase functions deploy paddle-webhook --no-verify-jwt --project-ref tjgoevtvobvmlyefgxel
   비밀:  supabase secrets set PADDLE_WEBHOOK_SECRET=pdl_ntfset_… --project-ref tjgoevtvobvmlyefgxel
   Paddle → Developer tools → Notifications 에 이 주소를 넣는다:
          https://tjgoevtvobvmlyefgxel.supabase.co/functions/v1/paddle-webhook
          보낼 이벤트: subscription.created · subscription.updated · subscription.activated ·
                       subscription.canceled · subscription.past_due · subscription.paused · subscription.resumed

   --no-verify-jwt 인 까닭: Paddle 은 Supabase 로그인 토큰을 모른다. 대신 모든
   요청을 Paddle-Signature(HMAC-SHA256)로 확인하고, 틀리면 아무것도 안 쓴다. */
import { createClient } from 'npm:@supabase/supabase-js@2';

const SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET') ?? '';
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* Paddle-Signature: "ts=1671552777;h1=eb4d0dc8…"  서명 대상은 `${ts}:${본문 그대로}`. */
async function verify(raw: string, header: string | null): Promise<boolean> {
  if (!SECRET || !header) return false;
  const parts = Object.fromEntries(header.split(';').map((kv) => kv.split('=') as [string, string]));
  const ts = Number(parts.ts), h1 = parts.h1;
  if (!ts || !h1) return false;
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;   // 5분 넘은 것은 되풀이 공격으로 본다
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}:${raw}`)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== h1.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ h1.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  const raw = await req.text();
  if (!(await verify(raw, req.headers.get('paddle-signature')))) return new Response('bad signature', { status: 401 });

  const ev = JSON.parse(raw);
  if (!String(ev.event_type ?? '').startsWith('subscription.')) return new Response('ignored');

  const s = ev.data ?? {};
  const uid = s.custom_data?.user_id;
  /* 결제 창에서 customData.user_id 를 넘기지 않은 구독(대시보드에서 손으로 만든 것 등)은
     누구 것인지 모른다. 200 으로 받고 넘긴다 — 에러를 주면 Paddle 이 며칠 동안 되보낸다. */
  if (!UUID.test(String(uid ?? ''))) { console.warn('no user_id', s.id); return new Response('no user'); }

  const interval = s.items?.[0]?.price?.billing_cycle?.interval;
  const row = {
    user_id: uid,
    provider: 'paddle',
    customer_id: s.customer_id ?? null,
    subscription_id: s.id ?? null,
    status: s.status ?? 'active',
    plan: interval === 'year' ? 'yearly' : 'monthly',
    current_period_end: s.current_billing_period?.ends_at ?? s.canceled_at ?? null,
    manage_url: s.management_urls?.cancel ?? null,
    updated_at: ev.occurred_at ?? new Date().toISOString(),
  };

  /* 웹훅은 순서가 뒤바뀌어 올 수 있다. 이미 적힌 것보다 오래된 소식이면 버린다. */
  const { data: old } = await admin.from('subscriptions').select('updated_at').eq('user_id', uid).maybeSingle();
  if (old && Date.parse(old.updated_at) > Date.parse(row.updated_at)) return new Response('stale');

  const { error } = await admin.from('subscriptions').upsert(row, { onConflict: 'user_id' });
  if (error) { console.error(error); return new Response('db error', { status: 500 }); }
  return new Response('ok');
});
