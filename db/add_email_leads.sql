-- 이메일 모으기 — 책 「무료 샘플」 · 학습 소식 받기 칸(운영자 2026-10-27).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 누구나(로그인 안 해도) **쓰기만** 한다. 읽기 정책을 일부러 두지 않는다 — 두면 아무나 남의 이메일을 긁어 간다.
-- 이메일 목록은 대시보드(Table editor)에서만 본다. 같은 이메일은 한 줄만(두 번째 신청은 거절돼도 화면은 「감사합니다」로 보인다).
-- marketing_ok = 「가끔 학습 소식 · 새 책 소식도 받겠다」에 체크했는지. false 면 샘플만 받은 사람 — 소식 메일은 보내지 않는다.
create table if not exists email_leads (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  email       text not null check (char_length(email) between 5 and 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  source      text not null default 'unknown' check (char_length(source) <= 80),
  lang        text check (lang is null or char_length(lang) <= 12),
  marketing_ok boolean not null default false
);

create unique index if not exists email_leads_email_uq on email_leads (lower(email));

alter table email_leads enable row level security;

drop policy if exists "anyone can sign up" on email_leads;
create policy "anyone can sign up" on email_leads
  for insert to anon, authenticated
  with check (true);
