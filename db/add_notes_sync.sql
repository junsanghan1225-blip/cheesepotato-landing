-- 내 노트(My Notes)를 기기 간에 맞춘다.
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 지금까지 노트는 로그인해도 이 브라우저에만 남았다(localStorage 뿐).
-- add_progress_sync.sql 과 같은 자리(로그인한 사람마다 한 줄씩 있는
-- settings)에 칸을 하나 더한다. 값은 노트 배열(JSON) 그대로다.
--
-- 지운 노트는 배열에서 빠지지 않고 delAt(지운 시각)만 찍힌 채로 남는다
-- — 그래야 다른 기기도 "지워졌다"는 사실을 전달받는다(그냥 빼 버리면
-- 다른 기기가 그 노트를 계속 갖고 있다가 되살려 놓는다). app.module.js
-- 의 ntMemoLive() 가 화면에는 안 보이게 거른다.
alter table settings
  add column if not exists notes jsonb not null default '[]'::jsonb;
