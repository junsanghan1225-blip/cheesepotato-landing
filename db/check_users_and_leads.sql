-- 확인용(읽기만 한다 — 아무것도 바꾸지 않는다). 운영자 2026-11-09 「로그인 몇 명 했는지」.
--   Supabase 대시보드 → SQL Editor 에 붙여 넣고 Run. 결과는 한 줄씩 나온다.
--   이메일 주소는 꺼내지 않는다(숫자만).

-- ① 가입한 계정 수 · 최근 7일 가입 · 최근 7일에 로그인한 계정 수
select
  count(*)                                                        as 전체_계정,
  count(*) filter (where created_at   > now() - interval '7 days') as 최근7일_가입,
  count(*) filter (where last_sign_in_at > now() - interval '7 days') as 최근7일_로그인,
  count(*) filter (where last_sign_in_at > now() - interval '1 day')  as 어제오늘_로그인
from auth.users;

-- ② 날짜별 가입 수(최근 30일, 한국 날짜)
select (created_at at time zone 'Asia/Seoul')::date as 날짜, count(*) as 가입
from auth.users
where created_at > now() - interval '30 days'
group by 1 order by 1 desc;

-- ③ 이메일 모으기(email_leads) — 어느 상자에서 왔는지
select source as 상자, count(*) as 수, max(created_at) as 마지막
from email_leads
group by 1 order by 2 desc;
