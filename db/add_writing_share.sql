-- TOPIK 쓰기(53·54) 답안 공유 — 학생이 동의하면 AI 채점 뒤 익명으로 올리고, 같은 문제 아래에서 다른 학생 답안을 본다.
-- 운영자 결정 2026-10-15 (「문제 아래 · 익명」).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 괜찮다(if not exists · drop policy if exists).
--   이미 있는 표는 건드리지 않는다. (qa_is_admin() 은 db/add_community.sql 에서 만든 함수 — 먼저 돌려 둔 상태여야 한다.)
--
-- 누가 무엇을 하나
--   · 읽기: 누구나. 숨긴 글은 올린 사람과 운영자만.
--   · 올리기: 로그인한 사람. 문제 하나에 글 하나(다시 올리면 덮어씀). 이름은 저장하지 않는다(익명).
--   · 지우기: 올린 사람 · 운영자.   · 숨기기: 운영자.   · 신고: 로그인한 사람, 운영자만 읽는다.

create table if not exists writing_shares (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id    text not null check (char_length(item_id) between 1 and 40),
  body       text not null check (char_length(body) between 30 and 1500),
  hidden     boolean not null default false,
  unique (user_id, item_id)
);
create index if not exists writing_shares_item on writing_shares (item_id, created_at desc);

create table if not exists writing_reports (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  share_id   bigint not null references writing_shares(id) on delete cascade,
  unique (user_id, share_id)
);

alter table writing_shares  enable row level security;
alter table writing_reports enable row level security;

drop policy if exists "ws read" on writing_shares;
create policy "ws read" on writing_shares for select to anon, authenticated
  using (hidden = false or user_id = auth.uid() or qa_is_admin());

drop policy if exists "ws insert" on writing_shares;
create policy "ws insert" on writing_shares for insert to authenticated
  with check (user_id = auth.uid() and hidden = false);

-- 다시 올리기(덮어쓰기) — 숨긴 글은 올린 사람이 못 푼다
drop policy if exists "ws update own" on writing_shares;
create policy "ws update own" on writing_shares for update to authenticated
  using (user_id = auth.uid() and hidden = false) with check (user_id = auth.uid() and hidden = false);

drop policy if exists "ws admin" on writing_shares;
create policy "ws admin" on writing_shares for update to authenticated
  using (qa_is_admin()) with check (qa_is_admin());

drop policy if exists "ws delete" on writing_shares;
create policy "ws delete" on writing_shares for delete to authenticated
  using (user_id = auth.uid() or qa_is_admin());

-- 하루 10개까지 — 도배 막기
create or replace function ws_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from writing_shares where user_id = new.user_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'ws_daily_limit';
  end if;
  return new;
end $$;
drop trigger if exists ws_limit on writing_shares;
create trigger ws_limit before insert on writing_shares for each row execute function ws_limit();

drop policy if exists "wr insert" on writing_reports;
create policy "wr insert" on writing_reports for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "wr read" on writing_reports;
create policy "wr read" on writing_reports for select to authenticated using (qa_is_admin());
