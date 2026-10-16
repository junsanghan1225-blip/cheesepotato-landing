-- 약점 지도 · 학습 스타일 · 빠르게/차근차근을 기기 사이에 이어 준다(운영자 2026-10-17 「서버 저장」, 레슨 대격변 7단계).
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다.
--
-- add_progress_sync.sql · add_notes_sync.sql 과 같은 자리(로그인한 사람마다 한 줄씩 있는 settings)에 칸을 하나 더한다.
-- 값은 { skill: { 꼬리표: { r: '10110…', t: 마지막 시각 } }, style: 'cheese'|'potato', styleAt, pace } 그대로(JSON).
--   · skill 의 r 은 그 꼬리표의 최근 12번 결과(1 맞음 · 0 틀림)뿐 — 문제 내용 · 쓴 글은 없다.
-- 이미 있는 칸은 건드리지 않는다. 내 줄만 읽고 쓸 수 있다는 규칙(RLS)도 settings 것을 그대로 따른다.
alter table settings
  add column if not exists profile jsonb not null default '{}'::jsonb;
