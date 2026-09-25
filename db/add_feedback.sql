-- 학생 한 줄 피드백 (레슨 완료 · 레벨테스트 결과 화면의 「지금 가장 필요한 건?」).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 누구나(로그인 안 해도) **쓰기만** 한다. 읽기 정책을 일부러 두지 않는다 —
-- 두면 아무나 남의 답을 긁어 간다. 답은 대시보드(Table editor)에서만 본다.
create table if not exists feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id    uuid references auth.users(id) on delete set null,
  place      text not null check (place in ('lesson', 'leveltest')),
  choice     text not null check (choice in ('practice', 'speaking', 'topik', 'easier', 'other')),
  body       text check (char_length(body) <= 500),
  level      smallint,
  lang       text,
  path       text
);

alter table feedback enable row level security;

drop policy if exists "anyone can send feedback" on feedback;
create policy "anyone can send feedback" on feedback
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
