-- 레벨 테스트 결과(분석 테스트) — 계정에 남겨 두고 다음에 「지난번보다 듣기 +20%p」처럼 견준다(운영자 요청 2026-10-02).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 괜찮다(if not exists · drop policy if exists).
--   이미 있는 표는 건드리지 않는다. 이 표가 없어도 사이트는 그대로 돌고, 「지난번과 견주기」만 빠진다.
--
-- 누가 무엇을 하나: 로그인한 사람이 자기 결과만 넣고 자기 결과만 읽는다.

create table if not exists lt_results (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  mode        text not null check (mode in ('full', 'quick')),
  track       text not null default 'general' check (track in ('general', 'topik')),
  level       smallint not null check (level between 0 and 7),
  grade       smallint check (grade between 0 and 6),
  areas       jsonb not null default '{}'::jsonb,   -- { listening: { c, n, L, grade }, reading: …, writing: …, vocab: … }
  score       smallint not null default 0,
  total       smallint not null default 0
);
create index if not exists lt_results_user on lt_results (user_id, created_at desc);

alter table lt_results enable row level security;

drop policy if exists "lt results read own" on lt_results;
create policy "lt results read own" on lt_results for select to authenticated using (user_id = auth.uid());

drop policy if exists "lt results write own" on lt_results;
create policy "lt results write own" on lt_results for insert to authenticated with check (user_id = auth.uid());
