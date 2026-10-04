-- 시험 패스(한 번 결제 · 3개월)를 Pro 로 보게 is_pro() 를 고친다(2026-10-04).
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다. 표는 건드리지 않는다.
-- billing.js 의 isPro() 와 같은 규칙이다 — 둘을 같이 고친다.
create or replace function is_pro(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from subscriptions
    where user_id = uid
      and (status in ('active', 'trialing', 'past_due')
           or (status in ('canceled', 'pass') and current_period_end > now()))
  );
$$;
