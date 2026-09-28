-- 「단어」 화면(#words)과 내 단어장을 잇는다 — docs/vocab-plan.md 5층 「내 단어장 연동」.
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 괜찮다(if not exists).
--
-- 1) words(내 단어장 — 안드로이드 앱과 같은 표)에 칸 둘을 **더하기만** 한다.
--    기존 칸의 뜻 · 모양은 그대로라 앱은 이 칸을 몰라도 안 깨진다.
--      vocab_id  단어 화면의 원본 낱말 id(vocab/data/topik1.json 의 id). 직접 적은 낱말은 비어 있다.
--      source    어디서 담았나('words' = 단어 화면). 나중에 「어디서 담은 낱말이 잘 외워지나」를 보려고.
alter table words
  add column if not exists vocab_id text,
  add column if not exists source text;

-- 2) 외우기 기록(상자 · 다음 복습 날 · 별표 · 날마다 답한 수)을 기기 사이에 맞춘다.
--    노트(add_notes_sync.sql) · TOPIK 기록(add_progress_sync.sql)과 같은 자리 — 로그인한 사람마다
--    한 줄씩 있는 settings 에 칸 하나. 값은 브라우저에 두던 모양(localStorage 'cp-words-v1') 그대로다.
alter table settings
  add column if not exists vocab jsonb not null default '{}'::jsonb;
