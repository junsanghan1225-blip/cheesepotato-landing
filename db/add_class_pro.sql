-- 반 학생은 Pro 무료(운영자 결정 2026-10-06: 「우리 학생들도 쓰고 있으니까 학생들은 무료로」).
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다. 표는 건드리지 않는다.
--
--   is_pro() 에 한 줄을 더한다 — 보관(archived)하지 않은 반의 학생(class_members)이면 Pro.
--   AI 쓰기 채점(grade-writing)처럼 서버에서 is_pro 를 읽는 곳은 이것으로 함께 풀린다.
--   반에서 나가거나 반을 보관하면 그날부터 다시 무료.
--   billing.js 의 isPro() 와 같은 규칙이다 — 둘을 같이 고친다(시험 패스 규칙은 db/update_is_pro_pass.sql 그대로).
-- 먼저 돌려 둘 것: db/add_subscriptions.sql · db/update_is_pro_pass.sql · db/add_classes.sql

create or replace function is_pro(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from subscriptions
    where user_id = uid
      and (status in ('active', 'trialing', 'past_due')
           or (status in ('canceled', 'pass') and current_period_end > now()))
  )
  or exists (
    select 1 from class_members m join classes c on c.id = m.class_id
    where m.user_id = uid and not c.archived
  );
$$;
