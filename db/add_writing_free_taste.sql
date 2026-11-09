-- TOPIK 쓰기 AI 채점 무료 맛보기 — 무료 회원은 평생 딱 1번(운영자 2026-11-09 「쓰기 수익성 개선 1~5」).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다. 그다음 grade-writing 함수를 다시 배포한다.
--   (돌리기 전에는 함수가 예전처럼 무료 회원을 막는다 — 순서가 바뀌어도 문제없다.)
--
-- 읽고 쓰는 것은 서버 함수(service role)뿐. 브라우저 정책은 주지 않는다 — 주면 자기 줄을 지워 또 받는다.
-- 이미 있는 표(writing_usage · ai_usage)는 건드리지 않는다.
create table if not exists writing_free_taste (
  user_id uuid primary key references auth.users(id) on delete cascade,
  used_at timestamptz not null default now()
);
alter table writing_free_taste enable row level security;

-- 처음이면 줄을 넣고 true, 이미 썼으면 false(동시에 두 번 와도 하나만 true).
create or replace function writing_free_taste_take(uid uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  insert into writing_free_taste (user_id) values (uid) on conflict (user_id) do nothing;
  return found;
end;
$$;
revoke all on function writing_free_taste_take(uuid) from public, anon, authenticated;
