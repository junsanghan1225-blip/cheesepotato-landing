-- 친구 초대 보상(운영자 2026-10-16 「유저 늘리기 — 친구 초대하면 Pro 한 달」).
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다. 이미 있는 표는 건드리지 않는다.
--
-- 흐름: 내 초대 링크(?ref=코드)로 친구가 새로 가입 → 둘 다 Pro 30일.
--   · 코드는 사람마다 하나(ref_codes) · 누가 누구를 초대했나(referrals, 초대받은 사람은 평생 한 번만)
--   · 보너스 기간(pro_bonus)은 is_pro() 가 읽는다 — AI 채점처럼 서버에서 is_pro 를 보는 곳도 함께 풀린다.
--   · 막는 것: 자기 자신 · 이미 가입한 지 3일 지난 계정 · 한 사람이 보상받는 초대 6명까지(그 뒤는 친구만 받는다)
-- 먼저 돌려 둘 것: db/add_subscriptions.sql · db/update_is_pro_pass.sql · db/add_class_pro.sql · db/add_classes.sql
-- billing.js 의 isPro() 와 같은 규칙이다 — 둘을 같이 고친다.

create table if not exists ref_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists referrals (
  invitee uuid primary key references auth.users(id) on delete cascade,
  inviter uuid not null references auth.users(id) on delete cascade,
  rewarded boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists referrals_inviter_idx on referrals (inviter);
create table if not exists pro_bonus (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  until timestamptz not null,
  why text not null,
  created_at timestamptz not null default now()
);
create index if not exists pro_bonus_user_idx on pro_bonus (user_id);

alter table ref_codes enable row level security;
alter table referrals enable row level security;
alter table pro_bonus enable row level security;
-- 읽기만 열고, 쓰는 것은 아래 함수(security definer)만 한다.
drop policy if exists "ref_codes read own" on ref_codes;
create policy "ref_codes read own" on ref_codes for select using (user_id = auth.uid());
drop policy if exists "referrals read mine" on referrals;
create policy "referrals read mine" on referrals for select using (inviter = auth.uid() or invitee = auth.uid());
drop policy if exists "pro_bonus read own" on pro_bonus;
create policy "pro_bonus read own" on pro_bonus for select using (user_id = auth.uid());

-- is_pro: 기존 규칙 + 보너스 기간
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
  )
  or exists (select 1 from pro_bonus where user_id = uid and until > now());
$$;

-- 내 초대 코드(없으면 만든다)
create or replace function my_ref_code() returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); c text; n int := 0;
begin
  if uid is null then return null; end if;
  select code into c from ref_codes where user_id = uid;
  if c is not null then return c; end if;
  loop
    c := substr(md5(random()::text || clock_timestamp()::text), 1, 8);
    begin
      insert into ref_codes (user_id, code) values (uid, c);
      return c;
    exception when unique_violation then
      select code into c from ref_codes where user_id = uid;
      if c is not null then return c; end if;
      n := n + 1; if n > 5 then return null; end if;
    end;
  end loop;
end $$;

-- 초대 링크로 온 사람이 부른다. 결과: { ok, why?, days?, inviter_rewarded? }
create or replace function redeem_referral(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  inv uuid;
  made timestamptz;
  got int;
  rew boolean;
  base timestamptz;
begin
  if uid is null then return jsonb_build_object('ok', false, 'why', 'login'); end if;
  select user_id into inv from ref_codes where code = lower(trim(p_code));
  if inv is null then return jsonb_build_object('ok', false, 'why', 'badcode'); end if;
  if inv = uid then return jsonb_build_object('ok', false, 'why', 'self'); end if;
  if exists (select 1 from referrals where invitee = uid) then return jsonb_build_object('ok', false, 'why', 'already'); end if;
  select created_at into made from auth.users where id = uid;
  if made is null or made < now() - interval '3 days' then return jsonb_build_object('ok', false, 'why', 'old'); end if;

  select count(*) into got from referrals where inviter = inv and rewarded;
  rew := got < 6;
  insert into referrals (invitee, inviter, rewarded) values (uid, inv, rew);

  select greatest(now(), coalesce(max(until), now())) into base from pro_bonus where user_id = uid;
  insert into pro_bonus (user_id, until, why) values (uid, base + interval '30 days', 'invited');
  if rew then
    select greatest(now(), coalesce(max(until), now())) into base from pro_bonus where user_id = inv;
    insert into pro_bonus (user_id, until, why) values (inv, base + interval '30 days', 'invite');
  end if;
  return jsonb_build_object('ok', true, 'days', 30, 'inviter_rewarded', rew);
end $$;

revoke all on function my_ref_code() from public;
revoke all on function redeem_referral(text) from public;
grant execute on function my_ref_code() to authenticated;
grant execute on function redeem_referral(text) to authenticated;
