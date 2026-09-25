-- AI 기능 하루 사용 횟수 (지금은 AI 쓰기 채점 grade-writing 이 쓴다).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 읽고 쓰는 것은 서버 함수(service role)뿐이다. 브라우저에 정책을 하나도 안 준다 —
-- 주면 자기 횟수를 0 으로 되돌려 무제한으로 쓴다.
create table if not exists ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default (now() at time zone 'Asia/Seoul')::date,
  kind    text not null,
  n       integer not null default 0,
  primary key (user_id, day, kind)
);
alter table ai_usage enable row level security;

-- 한 번에 늘리고 늘린 값을 돌려준다(두 요청이 동시에 와도 하나씩 센다).
create or replace function ai_usage_bump(uid uuid, k text) returns integer
language sql security definer set search_path = public as $$
  insert into ai_usage (user_id, kind, n) values (uid, k, 1)
  on conflict (user_id, day, kind) do update set n = ai_usage.n + 1
  returning n;
$$;
revoke all on function ai_usage_bump(uuid, text) from public, anon, authenticated;
