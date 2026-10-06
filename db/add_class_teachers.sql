-- 선생님 계정(운영자 결정 2026-10-06 「기관 · 대학과 파트너십 — 선생님 계정 · 진도 리포트」).
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다. 있던 표는 건드리지 않는다.
--
--   지금까지 반은 운영자만 만들 수 있었다(cls_is_admin). 이제 운영자가 「선생님」으로 올린 메일도 반을 만든다.
--   반을 만든 선생님은 자기 반만 본다 · 고친다(classes 의 owner 규칙 그대로 — 남의 반은 못 본다).
--   주의: 반 학생은 Pro 무료(db/add_class_pro.sql)라서, 선생님은 운영자가 믿는 사람만 올린다.
-- 먼저 돌려 둘 것: db/add_classes.sql

create table if not exists class_teachers (
  email     text primary key,                 -- 소문자로 적는다
  name      text,
  added_at  timestamptz not null default now()
);
alter table class_teachers enable row level security;

-- 운영자 메일인가(선생님 목록을 고치는 사람) — cls_is_admin 과 따로 둔다(그쪽은 이제 선생님도 참)
create or replace function cls_is_operator() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'junsanghan1225@gmail.com'
$$;

drop policy if exists "clt read" on class_teachers;
create policy "clt read" on class_teachers for select to authenticated
  using (cls_is_operator() or email = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "clt add" on class_teachers;
create policy "clt add" on class_teachers for insert to authenticated with check (cls_is_operator());
drop policy if exists "clt drop" on class_teachers;
create policy "clt drop" on class_teachers for delete to authenticated using (cls_is_operator());

-- 반을 만들 수 있는 사람 = 운영자 + 선생님 목록(「cls make」 규칙이 이 함수를 본다)
create or replace function cls_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select cls_is_operator()
      or exists (select 1 from class_teachers where email = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;
