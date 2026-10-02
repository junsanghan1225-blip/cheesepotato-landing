-- 반 · 숙제 — 선생님(지금은 운영자만)이 반을 만들고, 학생은 반 링크 · 코드로 들어와 숙제를 한다(운영자 결정 2026-10-02).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 괜찮다(if not exists · drop policy if exists · or replace).
--   이미 있는 표는 건드리지 않는다. 화면은 app.module.js 「반 · 숙제」(#learn/class).
--
-- 누가 무엇을 하나
--   · 반 만들기 · 숙제 내기 · 지우기: 운영자만(cls_is_admin — app.module.js 의 ADMIN_EMAIL 과 같은 메일).
--     나중에 다른 선생님에게 열려면 cls_is_admin() 하나만 바꾼다.
--   · 반 들어가기: 로그인한 사람이 코드로(cls_join). 코드를 모르면 반이 보이지 않는다.
--   · 숙제 했음: 학생이 레슨 · 단어 세션 · 문법 바꿔 쓰기를 끝내면 화면이 cls_mark 를 부른다 —
--     그 사람이 들어간 반의 맞는 숙제에만 「했음」이 붙는다(남의 기록은 못 쓴다).
--   · 읽기: 학생은 자기 반 · 숙제 · 자기 기록, 선생님은 자기 반의 학생 · 기록 전부.

create or replace function cls_is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'junsanghan1225@gmail.com'
$$;

-- 반 코드 — 헷갈리는 글자(0 O 1 I)를 뺀 6자. 학생에게 주는 링크에 붙는다.
create or replace function cls_new_code() returns text
language sql volatile as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, 6)
$$;

create table if not exists classes (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  code        text not null unique default cls_new_code(),
  archived    boolean not null default false
);

create table if not exists class_members (
  class_id   bigint not null references classes(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null default '학생' check (char_length(name) between 1 and 20),
  joined_at  timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table if not exists class_homework (
  id          bigint generated always as identity primary key,
  class_id    bigint not null references classes(id) on delete cascade,
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('lesson', 'vocab', 'grammar')),
  ref         text,                                   -- lesson: 레슨 id · grammar: 문법 id · vocab: 비움
  goal        smallint not null default 1 check (goal between 1 and 50),   -- vocab: 세션 몇 번
  title       text not null check (char_length(title) between 1 and 120),
  due         date
);
create index if not exists class_homework_class on class_homework (class_id, created_at desc);

create table if not exists class_done (
  hw_id    bigint not null references class_homework(id) on delete cascade,
  user_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  n        smallint not null default 1,               -- 몇 번 했나(vocab 은 goal 에 닿으면 끝)
  score    jsonb not null default '{}'::jsonb,        -- 마지막 결과(레슨: 틀린 수 · 문법: 맞힌 수 / 문항 수)
  done_at  timestamptz not null default now(),
  primary key (hw_id, user_id)
);

-- 정책 안에서 표끼리 서로 묻지 않게(무한 되돌이) 작은 함수로 가른다.
create or replace function cls_is_member(cid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from class_members where class_id = cid and user_id = auth.uid())
$$;
create or replace function cls_is_owner(cid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from classes where id = cid and owner = auth.uid())
$$;
create or replace function cls_hw_owner(hid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from class_homework h join classes c on c.id = h.class_id where h.id = hid and c.owner = auth.uid())
$$;

alter table classes enable row level security;
alter table class_members enable row level security;
alter table class_homework enable row level security;
alter table class_done enable row level security;

drop policy if exists "cls read" on classes;
create policy "cls read" on classes for select to authenticated using (owner = auth.uid() or cls_is_member(id));
drop policy if exists "cls make" on classes;
create policy "cls make" on classes for insert to authenticated with check (owner = auth.uid() and cls_is_admin());
drop policy if exists "cls edit" on classes;
create policy "cls edit" on classes for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists "cls drop" on classes;
create policy "cls drop" on classes for delete to authenticated using (owner = auth.uid());

-- 학생 목록 — 들어오기는 cls_join 으로만(코드 확인), 나가기는 스스로 또는 선생님이
drop policy if exists "clm read" on class_members;
create policy "clm read" on class_members for select to authenticated using (user_id = auth.uid() or cls_is_owner(class_id));
drop policy if exists "clm leave" on class_members;
create policy "clm leave" on class_members for delete to authenticated using (user_id = auth.uid() or cls_is_owner(class_id));

drop policy if exists "clh read" on class_homework;
create policy "clh read" on class_homework for select to authenticated using (cls_is_owner(class_id) or cls_is_member(class_id));
drop policy if exists "clh make" on class_homework;
create policy "clh make" on class_homework for insert to authenticated with check (cls_is_owner(class_id));
drop policy if exists "clh edit" on class_homework;
create policy "clh edit" on class_homework for update to authenticated using (cls_is_owner(class_id)) with check (cls_is_owner(class_id));
drop policy if exists "clh drop" on class_homework;
create policy "clh drop" on class_homework for delete to authenticated using (cls_is_owner(class_id));

-- 기록 — 쓰기는 cls_mark 로만
drop policy if exists "cld read" on class_done;
create policy "cld read" on class_done for select to authenticated using (user_id = auth.uid() or cls_hw_owner(hw_id));

-- 코드로 반 들어가기. 이미 들어가 있으면 이름만 바꾼다. 없는 코드 · 닫은 반이면 아무것도 안 돌려준다.
create or replace function cls_join(p_code text, p_name text)
returns table (id bigint, name text)
language plpgsql security definer set search_path = public as $$
declare c classes;
begin
  if auth.uid() is null then return; end if;
  select * into c from classes where code = upper(trim(p_code)) and not archived;
  if not found then return; end if;
  insert into class_members (class_id, user_id, name)
  values (c.id, auth.uid(), coalesce(nullif(left(trim(p_name), 20), ''), '학생'))
  on conflict (class_id, user_id) do update set name = excluded.name;
  return query select c.id, c.name;
end $$;

-- 숙제 했음 — 이 사람이 들어간 반의, 이 종류 · 이 대상 숙제에 한 번 더한다(vocab 은 대상이 없다).
-- 레슨 · 문법은 한 번이면 끝, 단어 세션은 goal 번까지 센다. 몇 개에 붙었는지 돌려준다.
create or replace function cls_mark(p_kind text, p_ref text, p_score jsonb default '{}'::jsonb)
returns integer
language plpgsql security definer set search_path = public as $$
declare k integer;
begin
  if auth.uid() is null then return 0; end if;
  insert into class_done (hw_id, user_id, n, score)
  select h.id, auth.uid(), 1, coalesce(p_score, '{}'::jsonb)
  from class_homework h join class_members m on m.class_id = h.class_id and m.user_id = auth.uid()
  where h.kind = p_kind and (h.kind = 'vocab' or h.ref = p_ref)
  on conflict (hw_id, user_id) do update
    set n = least(class_done.n + 1, 50), score = excluded.score, done_at = now();
  get diagnostics k = row_count;
  return k;
end $$;

revoke all on function cls_join(text, text) from public, anon;
revoke all on function cls_mark(text, text, jsonb) from public, anon;
grant execute on function cls_join(text, text) to authenticated;
grant execute on function cls_mark(text, text, jsonb) to authenticated;
