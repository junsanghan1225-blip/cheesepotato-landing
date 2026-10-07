-- 숙제에 선생님 코멘트(운영자 요청 2026-10-07 — 「다른 플랫폼처럼 편하게」: 구글 클래스룸 · Preply 숙제의 피드백).
-- 학생이 끝낸 숙제(특히 TOPIK 쓰기)에 선생님이 한 줄 → 학생 「내 반」의 끝낸 숙제에 뜬다.
-- 학생은 자기 것만 읽고, 쓰기 · 고치기 · 지우기는 그 숙제를 낸 선생님만.
-- 운영자가 Supabase SQL Editor 에서 한 번 돌린다(db/add_classes.sql 다음). 몇 번 돌려도 괜찮다.

create table if not exists class_feedback (
  hw_id   bigint not null references class_homework(id) on delete cascade,
  user_id uuid   not null,
  msg     text   not null check (length(trim(msg)) between 1 and 500),
  at      timestamptz not null default now(),
  primary key (hw_id, user_id)
);
alter table class_feedback enable row level security;
drop policy if exists "cfb read" on class_feedback;
create policy "cfb read" on class_feedback for select to authenticated using (user_id = auth.uid() or cls_hw_owner(hw_id));
drop policy if exists "cfb write" on class_feedback;
create policy "cfb write" on class_feedback for insert to authenticated with check (cls_hw_owner(hw_id));
drop policy if exists "cfb update" on class_feedback;
create policy "cfb update" on class_feedback for update to authenticated using (cls_hw_owner(hw_id)) with check (cls_hw_owner(hw_id));
drop policy if exists "cfb delete" on class_feedback;
create policy "cfb delete" on class_feedback for delete to authenticated using (cls_hw_owner(hw_id));
