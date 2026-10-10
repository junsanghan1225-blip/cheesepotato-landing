-- 묻고 답하기(커뮤니티) — 지식iN 처럼 질문 → 답 → 채택. docs/plans/community-plan.md (운영자 결정 2026-10-01).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 괜찮다(if not exists · drop policy if exists).
--
-- 누가 무엇을 하나
--   · 읽기: 누구나(로그인 안 해도). 숨긴 글은 운영자와 쓴 사람만.
--   · 질문: 로그인한 사람. 하루 5개까지(도배 막기).
--   · 답: **지금은 운영자만**(「일단 나부터」). 나중에 누구나 답하게 하려면 맨 아래 「답 쓰기」 정책 하나만 바꾼다.
--   · 채택: 질문한 사람이 답 하나를 고른다.
--   · 도움돼요: 로그인한 사람이 답마다 한 번.
--   · 신고: 로그인한 사람. 운영자만 읽는다.
-- 이미 있는 표는 건드리지 않는다.

-- 운영자인가 — 로그인한 사람의 메일로 가른다(app.module.js 의 ADMIN_EMAIL 과 같은 값).
create or replace function qa_is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'junsanghan1225@gmail.com'
$$;

create table if not exists qa_questions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author      text not null default '학생' check (char_length(author) between 1 and 20),
  board       text not null check (board in ('grammar', 'words', 'topik', 'speak', 'life')),
  title       text not null check (char_length(title) between 4 and 120),
  body        text not null default '' check (char_length(body) <= 3000),
  accepted_id bigint,
  hidden      boolean not null default false
);
create index if not exists qa_questions_created on qa_questions (created_at desc);

create table if not exists qa_answers (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  question_id bigint not null references qa_questions(id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author      text not null default '치즈감자' check (char_length(author) between 1 and 20),
  body        text not null check (char_length(body) between 1 and 6000),
  hidden      boolean not null default false
);
create index if not exists qa_answers_q on qa_answers (question_id);

create table if not exists qa_helpful (
  answer_id  bigint not null references qa_answers(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (answer_id, user_id)
);

create table if not exists qa_reports (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  question_id bigint references qa_questions(id) on delete cascade,
  answer_id   bigint references qa_answers(id) on delete cascade,
  reason      text check (char_length(reason) <= 300)
);

alter table qa_questions enable row level security;
alter table qa_answers   enable row level security;
alter table qa_helpful   enable row level security;
alter table qa_reports   enable row level security;

-- 질문
drop policy if exists "qa q read" on qa_questions;
create policy "qa q read" on qa_questions for select to anon, authenticated
  using (hidden = false or user_id = auth.uid() or qa_is_admin());

drop policy if exists "qa q write" on qa_questions;
create policy "qa q write" on qa_questions for insert to authenticated
  with check (user_id = auth.uid() and accepted_id is null and hidden = false);

-- 쓴 사람은 고치기 · 채택만(숨김은 못 푼다 — 숨긴 글은 using 에서 걸린다). 운영자는 무엇이든.
drop policy if exists "qa q edit own" on qa_questions;
create policy "qa q edit own" on qa_questions for update to authenticated
  using (user_id = auth.uid() and hidden = false)
  with check (user_id = auth.uid() and hidden = false);

drop policy if exists "qa q admin" on qa_questions;
create policy "qa q admin" on qa_questions for update to authenticated
  using (qa_is_admin()) with check (qa_is_admin());

drop policy if exists "qa q delete" on qa_questions;
create policy "qa q delete" on qa_questions for delete to authenticated
  using (user_id = auth.uid() or qa_is_admin());

-- 하루 5개 — 도배 막기
create or replace function qa_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from qa_questions where user_id = new.user_id and created_at > now() - interval '1 day') >= 5 then
    raise exception 'qa_daily_limit';
  end if;
  return new;
end $$;
drop trigger if exists qa_limit on qa_questions;
create trigger qa_limit before insert on qa_questions for each row execute function qa_limit();

-- 답
drop policy if exists "qa a read" on qa_answers;
create policy "qa a read" on qa_answers for select to anon, authenticated
  using (hidden = false or qa_is_admin());

-- 답 쓰기 — 지금은 운영자만. 학생도 답하게 하려면 with check 를 (user_id = auth.uid()) 로 바꾼다.
drop policy if exists "qa a write" on qa_answers;
create policy "qa a write" on qa_answers for insert to authenticated
  with check (user_id = auth.uid() and qa_is_admin());

drop policy if exists "qa a admin" on qa_answers;
create policy "qa a admin" on qa_answers for update to authenticated
  using (qa_is_admin()) with check (qa_is_admin());

drop policy if exists "qa a delete" on qa_answers;
create policy "qa a delete" on qa_answers for delete to authenticated
  using (user_id = auth.uid() or qa_is_admin());

-- 도움돼요
drop policy if exists "qa h read" on qa_helpful;
create policy "qa h read" on qa_helpful for select to anon, authenticated using (true);
drop policy if exists "qa h write" on qa_helpful;
create policy "qa h write" on qa_helpful for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "qa h delete" on qa_helpful;
create policy "qa h delete" on qa_helpful for delete to authenticated using (user_id = auth.uid());

-- 신고 — 운영자만 읽는다
drop policy if exists "qa r write" on qa_reports;
create policy "qa r write" on qa_reports for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "qa r read" on qa_reports;
create policy "qa r read" on qa_reports for select to authenticated using (qa_is_admin());
