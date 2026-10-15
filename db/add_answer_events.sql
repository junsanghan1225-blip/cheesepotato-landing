-- 학생이 문제를 풀 때마다 쌓는 기록 + 운영자 「문제 분석」 판(/insights.html) — 운영자 2026-10-16
-- 「한 문제 한 문제 풀 때마다 데이터를 쌓아 개별화 · 어떤 문제를 푸는지 보고 개선」.
-- 결정: ① 로그인 안 한 사람도(기기에 만든 무작위 id) ② 글로 쓴 답의 내용은 저장하지 않는다(맞음/틀림 · 시간 · 점수만)
--       ③ 운영자 전용 판.
--
--   Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다(if not exists · drop policy if exists).
--   이미 있는 표는 건드리지 않는다. 이 표가 없어도 사이트는 그대로 돌고(기록이 조용히 버려진다), 판만 「준비 안 됐어요」.
--
-- 누가 무엇을 하나
--   · 넣기: 누구나(anon · 로그인) — 한 줄에 「어느 문제 · 맞음/틀림 · 고른 보기 글자 · 걸린 시간 · 꼬리표」. 하루 한 기기당 1,500줄까지.
--   · 읽기: 로그인한 사람은 자기 줄만(나중에 개별화에 씀). 운영자 판은 아래 admin_* 함수가 숫자만 돌려준다.
--   · 고른 보기(pick)는 우리가 낸 보기 중 하나의 글자다. 학생이 직접 쓴 글(쓰기 · 번역 · 내 문장)은 어떤 칸에도 안 담는다.

create table if not exists answer_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  day        date not null default (now() at time zone 'Asia/Seoul')::date,
  did        text not null check (char_length(did) between 8 and 40),
  user_id    uuid default auth.uid(),
  sec        text not null check (sec in ('lesson', 'drill', 'topik_read', 'topik_listen', 'topik_write', 'mock', 'leveltest', 'other')),
  item       text not null check (char_length(item) between 1 and 80),
  kind       text check (char_length(kind) <= 16),
  ok         boolean,
  tries      smallint check (tries is null or tries between 1 and 50),
  ms         int check (ms is null or ms between 0 and 3600000),
  pick       text check (char_length(pick) <= 40),
  ans        text check (char_length(ans) <= 40),
  label      text check (char_length(label) <= 90),
  tags       text[],
  score      smallint,
  max        smallint,
  lang       text check (char_length(lang) <= 8)
);
create index if not exists answer_events_day on answer_events (day);
create index if not exists answer_events_item on answer_events (item, day);
create index if not exists answer_events_did on answer_events (did, day);
create index if not exists answer_events_user on answer_events (user_id, created_at desc);

alter table answer_events enable row level security;

drop policy if exists "ae insert" on answer_events;
create policy "ae insert" on answer_events for insert to anon, authenticated
  with check (day = (now() at time zone 'Asia/Seoul')::date and (user_id is null or user_id = auth.uid()));

drop policy if exists "ae read own" on answer_events;
create policy "ae read own" on answer_events for select to authenticated using (user_id = auth.uid());

-- 도배 막기 — 한 기기 하루 1,500줄
create or replace function ae_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from answer_events where did = new.did and day = new.day) >= 1500 then
    raise exception 'ae_daily_limit';
  end if;
  return new;
end $$;
drop trigger if exists ae_limit on answer_events;
create trigger ae_limit before insert on answer_events for each row execute function ae_limit();

-- 운영자만 — 숫자 한 묶음. p_sec · p_tag 로 거르면 모든 숫자가 그 범위로 좁혀진다.
create or replace function admin_answer_overview(p_days int default 28, p_sec text default null, p_tag text default null) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  d0 date := (now() at time zone 'Asia/Seoul')::date - greatest(1, least(p_days, 365)) + 1;
  out json;
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'junsanghan1225@gmail.com' then raise exception 'operator only'; end if;
  with e as (
    select * from answer_events
    where day >= d0 and (p_sec is null or sec = p_sec) and (p_tag is null or p_tag = any(tags))
  )
  select json_build_object(
    'from', d0,
    'totals', (select json_build_object('n', count(*), 'devices', count(distinct did), 'users', count(distinct user_id),
                  'graded', count(*) filter (where ok is not null), 'ok', count(*) filter (where ok), 'ms', round(avg(ms) filter (where ms is not null))) from e),
    'by_sec', (select coalesce(json_agg(r order by r.n desc), '[]'::json) from
                (select sec, count(*) n, count(*) filter (where ok is not null) graded, count(*) filter (where ok) ok, count(distinct did) devices,
                        round(avg(ms) filter (where ms is not null)) ms from e group by sec) r),
    'by_day', (select coalesce(json_agg(r order by r.day), '[]'::json) from
                (select day, count(*) n, count(*) filter (where ok is not null) graded, count(*) filter (where ok) ok from e group by day) r),
    'items', (select coalesce(json_agg(r), '[]'::json) from
                (select item, max(sec) sec, max(kind) kind, max(label) label, count(*) n, count(*) filter (where ok) ok, count(distinct did) devices,
                        round(avg(ms) filter (where ms is not null)) ms
                   from e where ok is not null group by item having count(*) >= 3
                  order by (count(*) filter (where ok))::float / count(*), count(*) desc limit 80) r),
    'tags', (select coalesce(json_agg(r), '[]'::json) from
                (select t tag, count(*) n, count(*) filter (where ok) ok
                   from e, unnest(tags) t where ok is not null and t not like 'c:%' group by t having count(*) >= 5
                  order by (count(*) filter (where ok))::float / count(*), count(*) desc limit 60) r),
    'write', (select json_build_object('n', count(*), 'score', round(avg(score)::numeric, 1), 'max', round(avg(max)::numeric, 1)) from e where sec = 'topik_write' and score is not null)
  ) into out;
  return out;
end $$;

-- 운영자만 — 문제 하나를 자세히(고른 보기 분포 · 하루별 · 걸린 시간)
create or replace function admin_answer_item(p_item text, p_days int default 90) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  d0 date := (now() at time zone 'Asia/Seoul')::date - greatest(1, least(p_days, 365)) + 1;
  out json;
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'junsanghan1225@gmail.com' then raise exception 'operator only'; end if;
  with e as (select * from answer_events where item = p_item and day >= d0)
  select json_build_object(
    'item', p_item,
    'label', (select max(label) from e), 'ans', (select max(ans) from e), 'sec', (select max(sec) from e), 'kind', (select max(kind) from e),
    'n', (select count(*) from e), 'ok', (select count(*) from e where ok), 'devices', (select count(distinct did) from e),
    'ms50', (select percentile_cont(0.5) within group (order by ms) from e where ms is not null),
    'ms90', (select percentile_cont(0.9) within group (order by ms) from e where ms is not null),
    'picks', (select coalesce(json_agg(r), '[]'::json) from
               (select pick, count(*) n, bool_or(ok) is_ok from e where pick is not null group by pick order by count(*) desc limit 10) r),
    'by_day', (select coalesce(json_agg(r order by r.day), '[]'::json) from
                (select day, count(*) n, count(*) filter (where ok) ok from e group by day) r),
    'tags', (select coalesce(json_agg(distinct t), '[]'::json) from e, unnest(tags) t)
  ) into out;
  return out;
end $$;

-- 오래된 기록 지우기(운영자가 가끔 SQL Editor 에서): delete from answer_events where day < (now() at time zone 'Asia/Seoul')::date - 400;
