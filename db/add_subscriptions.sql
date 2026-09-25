-- 구독(결제) 상태. 한 사람에 한 줄.
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 쓰는 것은 결제 서버 함수(supabase/functions/paddle-webhook)뿐이다 — 그 함수는
-- service role 키로 RLS 를 건너뛴다. 브라우저(anon·로그인한 사람)는 **자기 줄을
-- 읽기만** 한다. insert·update 정책을 일부러 두지 않는다: 두면 누구나 자기 줄에
-- status = 'active' 를 써 넣고 공짜로 구독자가 된다.
create table if not exists subscriptions (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  provider           text not null default 'paddle',
  customer_id        text,
  subscription_id    text unique,
  status             text not null,            -- active · trialing · past_due · paused · canceled
  plan               text,                     -- monthly · yearly
  current_period_end timestamptz,
  manage_url         text,                     -- Paddle 이 주는 해지·결제수단 변경 주소
  updated_at         timestamptz not null default now()
);

alter table subscriptions enable row level security;

drop policy if exists "read own subscription" on subscriptions;
create policy "read own subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- 서버 함수(AI 한도 등)에서 「이 사람이 구독 중인가」를 한 줄로 묻는다.
--   select is_pro('…uuid…');
-- billing.js 의 isPro() 와 같은 규칙이다 — 둘을 같이 고친다.
create or replace function is_pro(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from subscriptions
    where user_id = uid
      and (status in ('active', 'trialing', 'past_due')
           or (status = 'canceled' and current_period_end > now()))
  );
$$;
