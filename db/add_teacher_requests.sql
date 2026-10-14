-- 선생님 계정 신청(운영자 결정 2026-10-14 「신청 후 운영자 승인」 — 로그인에서 학생 · 선생님을 나눈다).
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다(db/add_classes.sql · db/add_class_teachers.sql 을 먼저 돌린 뒤). 여러 번 돌려도 괜찮다.
--   하는 일: 신청 표 teacher_request · 신청 함수 cls_teacher_apply(누구나 로그인하면) · 승인 함수 cls_teacher_decide(운영자만).
--   승인하면 class_teachers 에 그 메일이 올라가 바로 반을 만들 수 있다. 학생 개인정보 보호 — 아무나 선생님이 될 수 없다.

create table if not exists teacher_request (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  email    text not null,
  name     text not null check (char_length(name) between 1 and 40),
  note     text not null default '' check (char_length(note) <= 300),
  status   text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  at       timestamptz not null default now()
);
alter table teacher_request enable row level security;
drop policy if exists "treq read" on teacher_request;
create policy "treq read" on teacher_request for select to authenticated
  using (user_id = auth.uid() or cls_is_operator());
-- 쓰기는 아래 함수로만

create or replace function cls_teacher_apply(p_name text, p_note text default '')
returns text
language plpgsql security definer set search_path = public as $$
declare em text := lower(coalesce(auth.jwt() ->> 'email', '')); cur text;
begin
  if auth.uid() is null or em = '' then return 'login'; end if;
  if exists (select 1 from class_teachers where email = em) or cls_is_operator() then return 'approved'; end if;
  select status into cur from teacher_request where user_id = auth.uid();
  if cur = 'pending' then return 'pending'; end if;
  insert into teacher_request (user_id, email, name, note, status, at)
  values (auth.uid(), em, left(coalesce(nullif(trim(p_name), ''), split_part(em, '@', 1)), 40), left(coalesce(p_note, ''), 300), 'pending', now())
  on conflict (user_id) do update set name = excluded.name, note = excluded.note, status = 'pending', at = now();
  return 'pending';
end $$;

create or replace function cls_teacher_decide(p_user uuid, p_ok boolean)
returns boolean
language plpgsql security definer set search_path = public as $$
declare r teacher_request;
begin
  if not cls_is_operator() then return false; end if;
  select * into r from teacher_request where user_id = p_user;
  if not found then return false; end if;
  if p_ok then
    insert into class_teachers (email, name) values (lower(r.email), r.name) on conflict (email) do nothing;
    update teacher_request set status = 'approved' where user_id = p_user;
  else
    update teacher_request set status = 'rejected' where user_id = p_user;
  end if;
  return true;
end $$;

revoke all on function cls_teacher_apply(text, text) from public, anon;
revoke all on function cls_teacher_decide(uuid, boolean) from public, anon;
grant execute on function cls_teacher_apply(text, text) to authenticated;
grant execute on function cls_teacher_decide(uuid, boolean) to authenticated;
