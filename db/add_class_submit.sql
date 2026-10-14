-- 숙제 「제출」 — 학생이 글 · 사진을 내고, 선생님이 확인하고, 수업에서 바로 보여 준다(운영자 요청 2026-10-14 「구글 클래스룸처럼」).
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다(db/add_classes.sql · add_classes_more_kinds.sql · add_class_feedback.sql 을 먼저 돌린 뒤). 여러 번 돌려도 괜찮다.
--   하는 일: ① 숙제 종류 「free」(글 · 사진으로 내는 숙제) 더함 ② 제출 표 class_submission ③ 제출 함수 cls_submit · 확인 함수 cls_review
--            ④ 사진 저장소(비공개 버킷 class-submissions, 장당 4MB, 사진만) + 읽고 쓰는 규칙
--   학생은 자기 제출만 읽고, 선생님은 자기 반 숙제의 제출만 읽는다. 쓰기는 함수로만(반 학생인지 서버가 확인).

-- ① 숙제 종류에 free 를 더한다 — 이미 낸 숙제 · 기록은 그대로
alter table class_homework drop constraint if exists class_homework_kind_check;
alter table class_homework add constraint class_homework_kind_check
  check (kind in ('lesson', 'vocab', 'grammar', 'twrite', 'tread', 'tlisten', 'tmock', 'convo', 'story', 'translate', 'free'));

-- ② 제출 표 — 숙제 하나에 학생 한 명이 하나(다시 내면 고친다)
create table if not exists class_submission (
  hw_id       bigint not null references class_homework(id) on delete cascade,
  user_id     uuid   not null references auth.users(id) on delete cascade,
  body        text   not null default '' check (char_length(body) <= 4000),
  image_path  text   check (image_path is null or char_length(image_path) <= 200),
  at          timestamptz not null default now(),
  reviewed_at timestamptz,
  primary key (hw_id, user_id)
);
alter table class_submission enable row level security;
drop policy if exists "cls_sub read" on class_submission;
create policy "cls_sub read" on class_submission for select to authenticated
  using (user_id = auth.uid() or cls_hw_owner(hw_id));
-- insert · update · delete 정책은 두지 않는다 — 아래 함수(security definer)로만 쓴다.

-- ③ 제출 — 그 숙제가 있는 반의 학생만. 제출하면 「했음」(class_done)에도 적는다.
create or replace function cls_submit(p_hw bigint, p_body text, p_image text default null)
returns boolean
language plpgsql security definer set search_path = public as $$
declare cid bigint;
begin
  if auth.uid() is null then return false; end if;
  select class_id into cid from class_homework where id = p_hw;
  if cid is null or not cls_is_member(cid) then return false; end if;
  if coalesce(trim(p_body), '') = '' and p_image is null then return false; end if;
  insert into class_submission (hw_id, user_id, body, image_path, at, reviewed_at)
  values (p_hw, auth.uid(), left(coalesce(p_body, ''), 4000), p_image, now(), null)
  on conflict (hw_id, user_id) do update
    set body = excluded.body, image_path = excluded.image_path, at = now(), reviewed_at = null;
  insert into class_done (hw_id, user_id, n, score, done_at)
  values (p_hw, auth.uid(), 1, jsonb_build_object('submitted', true), now())
  on conflict (hw_id, user_id) do update set score = class_done.score || jsonb_build_object('submitted', true), done_at = now();
  return true;
end $$;

-- 확인 — 그 숙제를 낸 선생님만(p_on = false 면 확인을 거둔다)
create or replace function cls_review(p_hw bigint, p_user uuid, p_on boolean default true)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not cls_hw_owner(p_hw) then return false; end if;
  update class_submission set reviewed_at = case when p_on then now() else null end
  where hw_id = p_hw and user_id = p_user;
  return found;
end $$;

revoke all on function cls_submit(bigint, text, text) from public, anon;
revoke all on function cls_review(bigint, uuid, boolean) from public, anon;
grant execute on function cls_submit(bigint, text, text) to authenticated;
grant execute on function cls_review(bigint, uuid, boolean) to authenticated;

-- ④ 사진 저장소 — 길은 「학생id/숙제id/파일」. 비공개 버킷이라 선생님은 임시 주소(signed URL)로 본다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('class-submissions', 'class-submissions', false, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cls_sub_img insert" on storage.objects;
create policy "cls_sub_img insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'class-submissions' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "cls_sub_img read" on storage.objects;
create policy "cls_sub_img read" on storage.objects for select to authenticated
  using (bucket_id = 'class-submissions' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or ((storage.foldername(name))[2] ~ '^[0-9]+$' and cls_hw_owner(((storage.foldername(name))[2])::bigint))
  ));
drop policy if exists "cls_sub_img delete" on storage.objects;
create policy "cls_sub_img delete" on storage.objects for delete to authenticated
  using (bucket_id = 'class-submissions' and (storage.foldername(name))[1] = auth.uid()::text);
