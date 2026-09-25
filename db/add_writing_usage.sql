-- AI 쓰기 채점(grade-writing) 하루 사용 횟수.
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 이름을 writing_usage 로 둔다 — ai_usage 라는 표는 발음 진단 · 한국어 도우미가 이미
-- 다른 모양으로 쓰고 있다(그 표는 건드리지 않는다).
-- 읽고 쓰는 것은 서버 함수(service role)뿐이다. 브라우저에 정책을 하나도 안 준다 —
-- 주면 자기 횟수를 0 으로 되돌려 무제한으로 쓴다.
create table if not exists writing_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default (now() at time zone 'Asia/Seoul')::date,
  n       integer not null default 0,
  primary key (user_id, day)
);
alter table writing_usage enable row level security;

-- 한 번에 늘리고 늘린 값을 돌려준다(두 요청이 동시에 와도 하나씩 센다).
create or replace function writing_usage_bump(uid uuid) returns integer
language sql security definer set search_path = public as $$
  insert into writing_usage (user_id, n) values (uid, 1)
  on conflict (user_id, day) do update set n = writing_usage.n + 1
  returning n;
$$;
revoke all on function writing_usage_bump(uuid) from public, anon, authenticated;
