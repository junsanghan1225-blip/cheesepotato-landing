-- 반 · 숙제에 TOPIK 쓰기 · 읽기 숙제를 더한다(운영자 결정 2026-10-03, docs/archive/plan-2026-q4.md 6).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다(db/add_classes.sql 을 먼저 돌린 뒤). 여러 번 돌려도 괜찮다.
--   숙제 종류 칸(kind)이 받는 값만 넓힌다 — 이미 낸 숙제 · 기록은 그대로.
--     twrite: TOPIK 쓰기 한 문항(ref = 문항 id, 예: w54-3) — AI 채점을 받으면 「했음」 + 점수(total / max)
--     tread : TOPIK 읽기 한 유형(ref = 시험:유형, 예: I:blank) — 그 유형 연습을 끝내면 「했음」 + 맞힌 수(ok / n)

alter table class_homework drop constraint if exists class_homework_kind_check;
alter table class_homework add constraint class_homework_kind_check
  check (kind in ('lesson', 'vocab', 'grammar', 'twrite', 'tread'));
