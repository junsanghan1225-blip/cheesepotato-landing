-- 내려받기 비공개 저장 칸 (운영자 2026-10-19 「B 로 정확히」) — 운영자가 Supabase SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 된다.
--
--   · 로그인해야 받는 낱말 · 문법 파일(CSV · Anki)은 사이트에 두지 않고 이 비공개 저장 칸 downloads-private 에 둔다.
--   · 파일은 GitHub 액션(.github/workflows/downloads-sync.yml)이 service key 로 올린다(RLS 를 안 탄다).
--   · 로그인한 사람(authenticated)만 읽을 수 있다 — /download/ 쪽이 임시 주소(60초)를 받아 파일을 내려준다. 로그인하지 않으면 읽을 수 없다.
--   · 쓰기 정책은 만들지 않는다(브라우저에서는 아무도 못 올린다).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('downloads-private', 'downloads-private', false, 20971520, array['text/csv', 'text/plain'])
on conflict (id) do update set public = false, file_size_limit = 20971520, allowed_mime_types = array['text/csv', 'text/plain'];

drop policy if exists "downloads read signed in" on storage.objects;
create policy "downloads read signed in" on storage.objects for select to authenticated
  using (bucket_id = 'downloads-private');
