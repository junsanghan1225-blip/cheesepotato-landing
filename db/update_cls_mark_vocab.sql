-- 주제별 단어 숙제(운영자 요청 2026-10-07 「단어 세션을 주제별로 — 감정 · 학용품 · 정치 …」).
-- 단어 숙제(kind 'vocab')의 ref 에 주제(예: 'feelings' · 'feelings/joy')가 있으면, 그 주제(또는 그 안의 작은 주제)의 세션을 끝냈을 때만 「했음」이 붙는다.
-- ref 가 비어 있는 단어 숙제는 예전처럼 아무 단어 세션이나 센다.
-- 운영자가 Supabase SQL Editor 에서 한 번 돌린다. 몇 번 돌려도 괜찮다(같은 이름의 함수를 바꿔 쓴다 — 표는 그대로).
create or replace function cls_mark(p_kind text, p_ref text, p_score jsonb default '{}'::jsonb)
returns integer
language plpgsql security definer set search_path = public as $$
declare k integer;
begin
  if auth.uid() is null then return 0; end if;
  insert into class_done (hw_id, user_id, n, score)
  select h.id, auth.uid(), 1, coalesce(p_score, '{}'::jsonb)
  from class_homework h join class_members m on m.class_id = h.class_id and m.user_id = auth.uid()
  where h.kind = p_kind and (
    (h.kind = 'vocab' and (h.ref is null or h.ref = p_ref or p_ref like h.ref || '/%'))
    or (h.kind <> 'vocab' and h.ref = p_ref))
  on conflict (hw_id, user_id) do update
    set n = least(class_done.n + 1, 50), score = excluded.score, done_at = now();
  get diagnostics k = row_count;
  return k;
end $$;
revoke all on function cls_mark(text, text, jsonb) from public, anon;
grant execute on function cls_mark(text, text, jsonb) to authenticated;
