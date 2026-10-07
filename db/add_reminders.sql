-- 매일 공부 알림 메일(운영자 요청 2026-10-07 「학생 트래픽 — 다시 오게」, 재방문 8%).
-- 학생이 설정에서 켜면(기본은 꺼짐 — 본인이 고른다) 매일 그 사람 시간의 정한 때에 「오늘 복습 N개 · 15분 공부」 메일 하나.
-- 그날 이미 공부했으면 안 보낸다. 보내는 일은 Edge Function daily-reminder(서비스 키로 읽음)가 한다.
-- 운영자가 Supabase SQL Editor 에서 한 번 돌린다. 몇 번 돌려도 괜찮다. 있는 표는 건드리지 않는다.
create table if not exists reminder_prefs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email_on   boolean  not null default false,
  hour       smallint not null default 19 check (hour between 0 and 23),   -- 그 사람 시간으로 몇 시에
  tz_min     smallint not null default 0 check (tz_min between -840 and 840), -- UTC 와의 차이(분) — 브라우저가 적는다
  lang       text     not null default 'en' check (lang in ('ko', 'en', 'vi', 'ja', 'zh')),
  last_sent  date,
  updated_at timestamptz not null default now()
);
alter table reminder_prefs enable row level security;
drop policy if exists "rem own read" on reminder_prefs;
create policy "rem own read" on reminder_prefs for select to authenticated using (user_id = auth.uid());
drop policy if exists "rem own write" on reminder_prefs;
create policy "rem own write" on reminder_prefs for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "rem own update" on reminder_prefs;
create policy "rem own update" on reminder_prefs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "rem own delete" on reminder_prefs;
create policy "rem own delete" on reminder_prefs for delete to authenticated using (user_id = auth.uid());
