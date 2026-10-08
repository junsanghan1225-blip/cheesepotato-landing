-- 숫자 보는 판(깔때기) — 방문 → 공부 시작 → 레벨테스트 → 가입 → TOPIK 연습 → 모의고사 → 가격 화면 → 결제 (2026-10-08 운영자 요청
-- 「수익을 키우려면 — 누가 어디서 떠나는지부터」). 화면은 /funnel.html(운영자만).
--
--   Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다. 이미 있는 표는 건드리지 않는다.
--
-- 기기마다 하루에 단계 하나당 한 줄만 쌓는다(did = 기기에 만든 무작위 id — 이메일 · 이름 · 로그인 id 는 안 싣는다).
-- 브라우저는 넣기만 한다(읽기 정책이 없다). 읽는 것은 admin_funnel() — 운영자 메일일 때만 숫자를 돌려준다.
create table if not exists funnel_events (
  id      bigint generated always as identity primary key,
  day     date not null default (now() at time zone 'Asia/Seoul')::date,
  did     text not null check (char_length(did) between 8 and 40),
  step    text not null check (step in ('visit', 'learn', 'lt_done', 'signup', 'topik', 'mock', 'pro_view', 'checkout', 'paid')),
  src     text not null default 'direct' check (char_length(src) <= 20),
  lang    text check (char_length(lang) <= 8),
  created_at timestamptz not null default now(),
  unique (day, did, step)
);
create index if not exists funnel_events_day_idx on funnel_events (day);

alter table funnel_events enable row level security;
drop policy if exists "funnel insert" on funnel_events;
create policy "funnel insert" on funnel_events for insert to anon, authenticated
  with check (day = (now() at time zone 'Asia/Seoul')::date);

-- 운영자만: 지난 p_days 일(오늘 포함)의 숫자. 서버 쪽 진짜 숫자(가입 · 결제 · 레벨테스트 저장)도 같이 돌려준다.
create or replace function admin_funnel(p_days int default 28) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  d0 date := (now() at time zone 'Asia/Seoul')::date - greatest(1, least(p_days, 365)) + 1;
  t0 timestamptz := (d0::timestamp at time zone 'Asia/Seoul');
  out json;
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'junsanghan1225@gmail.com' then
    raise exception 'operator only';
  end if;
  select json_build_object(
    'from', d0,
    'steps', (select coalesce(json_object_agg(step, n), '{}'::json) from
               (select step, count(distinct did) n from funnel_events where day >= d0 group by step) s),
    'by_src', (select coalesce(json_agg(r order by r.visit desc), '[]'::json) from
               (select src,
                       count(distinct did) filter (where step = 'visit')  visit,
                       count(distinct did) filter (where step = 'learn')  learn,
                       count(distinct did) filter (where step = 'signup') signup,
                       count(distinct did) filter (where step = 'pro_view') pro_view,
                       count(distinct did) filter (where step = 'paid')   paid
                  from funnel_events where day >= d0 group by src) r),
    'daily', (select coalesce(json_agg(r order by r.day), '[]'::json) from
               (select day,
                       count(distinct did) filter (where step = 'visit')  visit,
                       count(distinct did) filter (where step = 'learn')  learn,
                       count(distinct did) filter (where step = 'signup') signup,
                       count(distinct did) filter (where step = 'paid')   paid
                  from funnel_events where day >= d0 group by day) r),
    'server', json_build_object(
      'signups',     (select count(*) from auth.users where created_at >= t0),
      'users_total', (select count(*) from auth.users),
      'lt_saved',    (select count(*) from lt_results where created_at >= t0),
      'pro_now',     (select count(*) from subscriptions
                       where status in ('active', 'trialing', 'past_due')
                          or (status in ('canceled', 'pass') and current_period_end > now())),
      'trial_now',   (select count(*) from subscriptions where status = 'trialing'),
      'paid_recent', (select count(*) from subscriptions
                       where status in ('active', 'pass', 'trialing') and updated_at >= t0)
    )
  ) into out;
  return out;
end $$;

revoke all on function admin_funnel(int) from public;
grant execute on function admin_funnel(int) to authenticated;
