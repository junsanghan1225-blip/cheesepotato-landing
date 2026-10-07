-- ※ 2026-10-07 같은 날 운영자 결정으로 일정 기능을 뺐다(「스케줄은 빼자 — 숙제 · 복습용으로만」). 운영자가 이미 돌려서 표는 남아 있지만
--   사이트는 더 쓰지 않는다. 표를 지우지 않는다(CLAUDE.md 3). 기록으로만 둔다.
-- 반 수업 일정 — 구글 캘린더 자동 연동(운영자 요청 2026-10-07).
-- 선생님이 반마다 구글 캘린더의 「iCal 형식의 비공개 주소」를 붙여 넣으면, Edge Function class-schedule 이
-- 그 캘린더를 읽어 학생에게 「다음 수업 · 앞으로 몇 번」을 보여 준다.
-- 비공개 주소는 그 캘린더 전체를 읽는 열쇠라 **반 주인(선생님)만** 이 표를 본다. 학생은 함수가 걸러 준 수업 시간만 받는다.
-- 1:1 수업(운영자 2026-10-07 「학생마다 개별 스케줄 — 내 스케줄을 다 보여 주면 안 된다」): per_student 가 켜져 있으면
-- 학생은 **자기 일정만** 받는다 — 구글 캘린더 일정에 손님으로 초대된 메일이 그 학생의 로그인 메일과 같거나,
-- 선생님이 그 학생에게 정해 둔 말(class_member_cal.keyword, 예: 「민수」)이 일정 제목에 들어 있을 때만.
-- 운영자가 Supabase SQL Editor 에서 한 번 돌린다(db/add_classes.sql 다음). 몇 번 돌려도 괜찮다.

create table if not exists class_calendar (
  class_id   bigint primary key references classes(id) on delete cascade,
  ical       text not null check (ical ~ '^https://calendar\.google\.com/calendar/ical/'),
  keyword    text,          -- 비우면 캘린더의 일정 전부, 쓰면 제목에 이 말이 든 일정만(예: 「A반」)
  per_student boolean not null default true,   -- 1:1 수업(기본): 학생마다 자기 수업만 본다(아래 class_member_cal)
  updated_at timestamptz not null default now()
);

alter table class_calendar enable row level security;

drop policy if exists "cal owner read" on class_calendar;
create policy "cal owner read" on class_calendar for select using (cls_is_owner(class_id));
drop policy if exists "cal owner write" on class_calendar;
create policy "cal owner write" on class_calendar for insert with check (cls_is_owner(class_id));
drop policy if exists "cal owner update" on class_calendar;
create policy "cal owner update" on class_calendar for update using (cls_is_owner(class_id)) with check (cls_is_owner(class_id));
drop policy if exists "cal owner delete" on class_calendar;
create policy "cal owner delete" on class_calendar for delete using (cls_is_owner(class_id));

alter table class_calendar add column if not exists per_student boolean not null default true;

-- 학생마다 캘린더에서 그 학생의 수업을 찾는 말(예: 일정 제목 「민수 1:1」 → 「민수」). 선생님만 읽고 쓴다.
create table if not exists class_member_cal (
  class_id bigint not null references classes(id) on delete cascade,
  user_id  uuid   not null,
  keyword  text   not null check (length(trim(keyword)) between 1 and 40),
  primary key (class_id, user_id)
);
alter table class_member_cal enable row level security;
drop policy if exists "mcal owner all" on class_member_cal;
create policy "mcal owner all" on class_member_cal for all using (cls_is_owner(class_id)) with check (cls_is_owner(class_id));
