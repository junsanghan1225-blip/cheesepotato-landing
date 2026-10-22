-- 책 구매자 혜택(운영자 2026-10-22 「책 구매자 혜택 진행」) — 책에 인쇄된 코드를 입력하면 Pro 30일.
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 두 번 돌려도 괜찮다. 이미 있는 표는 건드리지 않는다.
-- 먼저 돌려 둘 것: db/add_referrals.sql (pro_bonus 표 · is_pro() 를 같이 쓴다).
--
-- 규칙(바꾸려면 아래 book_codes 줄을 update 한다):
--   · 코드 하나는 책 한 권용. 한 계정이 같은 코드를 평생 한 번만 쓴다.
--   · 코드마다 총 사용 한도(max_uses)와 끝나는 날(expires_at)이 있다. 한도가 차면 새 코드를 넣는다.
--   · 보상은 pro_bonus(친구 초대와 같은 표)에 들어가므로 is_pro() · 사이트 · 서버 한도가 모두 같이 풀린다.
create table if not exists book_codes (
  code text primary key,
  book text not null,
  days int not null default 30,
  max_uses int not null default 3000,
  uses int not null default 0,
  expires_at timestamptz not null default '2027-12-31',
  active boolean not null default true
);
create table if not exists book_redemptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null references book_codes(code),
  created_at timestamptz not null default now(),
  primary key (user_id, code)
);
alter table book_codes enable row level security;
alter table book_redemptions enable row level security;
-- 정책을 하나도 만들지 않는다 = 브라우저에서는 읽지도 쓰지도 못하고, 아래 함수(security definer)만 한다.

insert into book_codes (code, book) values
  ('CP-TW-ZSSGZW', 'topik2-writing-51-52'),
  ('CP-FS-342TXN', 'first-steps-workbook'),
  ('CP-PW-5XD5QK', 'particles-workbook')
on conflict (code) do nothing;

-- 코드 입력. 결과: { ok, why?, days? }  why: login · badcode · expired · full · already
create or replace function redeem_book_code(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  c book_codes%rowtype;
  base timestamptz;
begin
  if uid is null then return jsonb_build_object('ok', false, 'why', 'login'); end if;
  select * into c from book_codes where code = upper(trim(p_code)) and active for update;
  if not found then return jsonb_build_object('ok', false, 'why', 'badcode'); end if;
  if c.expires_at < now() then return jsonb_build_object('ok', false, 'why', 'expired'); end if;
  if exists (select 1 from book_redemptions where user_id = uid and code = c.code) then
    return jsonb_build_object('ok', false, 'why', 'already');
  end if;
  if c.uses >= c.max_uses then return jsonb_build_object('ok', false, 'why', 'full'); end if;

  insert into book_redemptions (user_id, code) values (uid, c.code);
  update book_codes set uses = uses + 1 where code = c.code;
  select greatest(now(), coalesce(max(until), now())) into base from pro_bonus where user_id = uid;
  insert into pro_bonus (user_id, until, why) values (uid, base + make_interval(days => c.days), 'book:' || c.book);
  return jsonb_build_object('ok', true, 'days', c.days);
end $$;

revoke all on function redeem_book_code(text) from public;
grant execute on function redeem_book_code(text) to authenticated;
