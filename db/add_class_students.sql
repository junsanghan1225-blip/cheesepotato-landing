-- 반 학생 관리 — 선생님이 정하는 레벨 · 학생에게 한마디 · 선생님만 보는 메모 · 학생별 숙제(운영자 요청 2026-10-07).
-- 「레벨은 선생님이 지정하고, 레벨테스트를 보지 않아도 바로 배정」 · 「1:1 이라 숙제를 학생마다」.
-- 운영자가 Supabase SQL Editor 에서 한 번 돌린다(db/add_classes.sql 다음). 몇 번 돌려도 괜찮다. 있는 표는 바꾸지 않고 새 표만 더한다.

-- ① 학생마다 선생님이 정한 것 — 학생 본인과 반 주인(선생님)만 읽는다. 쓰기는 선생님만.
--    lv: 감자 레벨 L0~L7(사이트 코스 레벨) · goal='topik' 이면 TOPIK 길(치즈) · grade: TOPIK 급수 0~6
--    msg: 학생 첫 화면 「내 반」 카드에 뜨는 선생님 한마디
create table if not exists class_student (
  class_id   bigint not null references classes(id) on delete cascade,
  user_id    uuid   not null,
  lv         smallint check (lv between 0 and 7),
  goal       text check (goal in ('topik')),
  grade      smallint check (grade between 0 and 6),
  msg        text check (length(msg) <= 300),
  updated_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
alter table class_student enable row level security;
drop policy if exists "cst read" on class_student;
create policy "cst read" on class_student for select to authenticated using (user_id = auth.uid() or cls_is_owner(class_id));
drop policy if exists "cst write" on class_student;
create policy "cst write" on class_student for insert to authenticated with check (cls_is_owner(class_id));
drop policy if exists "cst update" on class_student;
create policy "cst update" on class_student for update to authenticated using (cls_is_owner(class_id)) with check (cls_is_owner(class_id));
drop policy if exists "cst delete" on class_student;
create policy "cst delete" on class_student for delete to authenticated using (cls_is_owner(class_id));

-- ② 선생님만 보는 메모(학생은 못 본다)
create table if not exists class_student_note (
  class_id   bigint not null references classes(id) on delete cascade,
  user_id    uuid   not null,
  note       text   not null check (length(note) <= 2000),
  updated_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
alter table class_student_note enable row level security;
drop policy if exists "csn owner" on class_student_note;
create policy "csn owner" on class_student_note for all to authenticated using (cls_is_owner(class_id)) with check (cls_is_owner(class_id));

-- ③ 학생별 숙제 — 이 표에 줄이 있는 숙제는 그 학생들에게만 보인다(없으면 반 전체).
create table if not exists class_hw_target (
  hw_id   bigint not null references class_homework(id) on delete cascade,
  user_id uuid   not null,
  primary key (hw_id, user_id)
);
alter table class_hw_target enable row level security;
drop policy if exists "cht read" on class_hw_target;
create policy "cht read" on class_hw_target for select to authenticated using (user_id = auth.uid() or cls_hw_owner(hw_id));
drop policy if exists "cht write" on class_hw_target;
create policy "cht write" on class_hw_target for insert to authenticated with check (cls_hw_owner(hw_id));
drop policy if exists "cht delete" on class_hw_target;
create policy "cht delete" on class_hw_target for delete to authenticated using (cls_hw_owner(hw_id));
