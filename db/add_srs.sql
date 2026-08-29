-- 단어장에 간격 반복 복습(SRS)을 얹는다.
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 기존 is_remembered 는 앱(WordbookScreen)과 공유하는 칸이라 뜻도 동작도
-- 그대로 둔다. 여기서는 "다음 복습이 언제인가"만 웹 전용으로 얹는다 —
-- 앱은 이 칸을 몰라도 되고, 몰라도 안 깨진다(칸이 늘어도 무시한다).
--
-- due_at        다음 복습 시각. 기본값이 now() 라 새로 담은 단어는 바로
--               오늘 복습 목록에 뜬다 — "다음에 또" 가 아니라 "지금부터"다.
-- interval_days 지금까지 벌어진 간격(일). 「기억했어요」를 누를 때마다
--               곱절로 늘려 간다(SRS 의 핵심 — 아는 것은 점점 뜸하게).
alter table words
  add column if not exists due_at timestamptz not null default now(),
  add column if not exists interval_days integer not null default 1;

-- 로그인한 사람의 "오늘 복습할 것"을 빠르게 골라내는 용도.
create index if not exists words_due_idx on words (user_id, due_at);
