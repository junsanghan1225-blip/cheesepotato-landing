-- TOPIK 읽기·듣기·쓰기 점수와 읽기 지문 기록을 기기 간에 맞춘다.
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 지금까지 코스 레슨(lesson_progress)만 서버에 있었고, 나머지는 브라우저
-- localStorage 에만 있었다 — 폰에서 풀고 노트북을 열면 기록이 0이었다.
-- 새 표를 만드는 대신 이미 로그인한 사람마다 한 줄씩 있는 settings 에
-- 칸 하나를 더한다. 값은 { "cp-topik-set-...": {...}, "cp_rd_done": {...} }
-- 처럼 관련 localStorage 키를 그대로 담은 JSON 뭉치다 — 표를 새로
-- 설계하느니, 이미 검증된 모양(localStorage)을 그대로 옮기는 편이
-- 안전하다.
alter table settings
  add column if not exists progress jsonb not null default '{}'::jsonb;
