-- 반 수업 일정 — 구글 캘린더 자동 연동(운영자 요청 2026-10-07).
-- 선생님이 반마다 구글 캘린더의 「iCal 형식의 비공개 주소」를 붙여 넣으면, Edge Function class-schedule 이
-- 그 캘린더를 읽어 학생에게 「다음 수업 · 앞으로 몇 번」을 보여 준다.
-- 비공개 주소는 그 캘린더 전체를 읽는 열쇠라 **반 주인(선생님)만** 이 표를 본다. 학생은 함수가 걸러 준 수업 시간만 받는다.
-- 운영자가 Supabase SQL Editor 에서 한 번 돌린다(db/add_classes.sql 다음). 몇 번 돌려도 괜찮다.

create table if not exists class_calendar (
  class_id   bigint primary key references classes(id) on delete cascade,
  ical       text not null check (ical ~ '^https://calendar\.google\.com/calendar/ical/'),
  keyword    text,          -- 비우면 캘린더의 일정 전부, 쓰면 제목에 이 말이 든 일정만(예: 「A반」)
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
