-- 강의 영상 — 운영자가 유튜브에 「일부 공개」로 올린 영상을 사이트 「강의」 칸에 건다(운영자 결정 2026-10-03).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 괜찮다(if not exists · drop policy if exists · or replace).
--   이미 있는 표는 건드리지 않는다. 화면은 app.module.js 「강의」(#learn/lectures) — 운영자에게만 「강의 올리기」 칸이 보인다.
--   영상 파일은 여기 두지 않는다(유튜브). 이 표에는 제목 · 설명 · 유튜브 영상 id 만.
--
-- 누가 무엇을 하나
--   · 읽기: 누구나(로그인 안 해도). 숨긴 강의는 운영자만.
--   · 올리기 · 고치기 · 지우기: 운영자만(app.module.js 의 ADMIN_EMAIL 과 같은 메일).

create or replace function lec_is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'junsanghan1225@gmail.com'
$$;

create table if not exists lectures (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  yt          text not null check (yt ~ '^[A-Za-z0-9_-]{11}$'),        -- 유튜브 영상 id(11자)
  title       text not null check (char_length(title) between 1 and 120),
  title_en    text not null default '' check (char_length(title_en) <= 120),
  body        text not null default '' check (char_length(body) <= 2000),  -- 설명 · 오늘 배울 것
  lv          text not null default 'beginner' check (lv in ('beginner', 'intermediate', 'advanced', 'topik')),
  sort        integer not null default 0,                                   -- 작을수록 앞(같으면 새것 먼저)
  hidden      boolean not null default false
);
create index if not exists lectures_order on lectures (sort, created_at desc);

alter table lectures enable row level security;

drop policy if exists "lec read" on lectures;
create policy "lec read" on lectures for select to anon, authenticated using (hidden = false or lec_is_admin());
drop policy if exists "lec make" on lectures;
create policy "lec make" on lectures for insert to authenticated with check (lec_is_admin());
drop policy if exists "lec edit" on lectures;
create policy "lec edit" on lectures for update to authenticated using (lec_is_admin()) with check (lec_is_admin());
drop policy if exists "lec drop" on lectures;
create policy "lec drop" on lectures for delete to authenticated using (lec_is_admin());
