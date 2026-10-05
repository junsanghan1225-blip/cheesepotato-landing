-- 쇼츠 공장 대기열 (운영자 요청 2026-10-05) — 운영자가 Supabase SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 된다.
--
--   · 쇼츠 촬영소(/shorts.html)에서 「대기열에 올리기」를 누르면
--       영상 · 표지 → 저장 칸 shorts(공개 읽기 — 인스타가 주소로 가져가야 해서)
--       제목 · 설명 · 글 → 표 shorts_queue
--   · GitHub 액션(.github/workflows/shorts-post.yml)이 정해진 시각에 한 줄씩 꺼내
--     유튜브 · 인스타 릴스 · 틱톡에 올리고 yt · ig · tt 칸에 결과를 적는다(service key 로 — RLS 를 안 탄다).
--   · 쓰기 · 읽기는 운영자 메일만(shorts_is_admin). 다른 사람은 표를 못 본다. 영상 파일 주소는 공개지만 이름을 짐작할 수 없다.
--   · 다 올린 영상 파일은 액션이 저장 칸에서 지운다(무료 한도 1GB 를 아끼려고). 표의 줄은 남는다.

create or replace function shorts_is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'junsanghan1225@gmail.com'
$$;

create table if not exists shorts_queue (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  qid         text not null,                 -- 문제 id(tr-081 · t2-003 · 문법 g:26-3 …)
  exam        text,
  video_path  text not null,                 -- 저장 칸 shorts 안의 길
  cover_path  text,
  mime        text,
  seconds     int,
  title       text not null,
  description text not null,
  caption     text not null,
  tags        text[] default '{}',
  cover_style text,
  status      text not null default 'ready', -- ready · done · cancel
  yt          jsonb,                         -- {ok, id, url} · {err, tries} · {skip}
  ig          jsonb,
  tt          jsonb,
  posted_at   timestamptz
);
create index if not exists shorts_queue_ready on shorts_queue (status, id);

alter table shorts_queue enable row level security;
drop policy if exists "shorts read" on shorts_queue;
drop policy if exists "shorts add" on shorts_queue;
drop policy if exists "shorts edit" on shorts_queue;
create policy "shorts read" on shorts_queue for select to authenticated using (shorts_is_admin());
create policy "shorts add"  on shorts_queue for insert to authenticated with check (shorts_is_admin());
create policy "shorts edit" on shorts_queue for update to authenticated using (shorts_is_admin()) with check (shorts_is_admin());

-- 액션이 바뀐 열쇠(틱톡 refresh token 은 새로 받을 때마다 바뀔 수 있다)를 적어 두는 곳 — service key 만 읽고 쓴다(정책 없음)
create table if not exists shorts_kv (k text primary key, v text not null, updated_at timestamptz not null default now());
alter table shorts_kv enable row level security;

-- 저장 칸 — 공개 읽기, 파일 하나 50MB, 영상 · 표지 그림만
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shorts', 'shorts', true, 52428800, array['video/mp4', 'video/webm', 'image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 52428800, allowed_mime_types = array['video/mp4', 'video/webm', 'image/jpeg'];

drop policy if exists "shorts upload" on storage.objects;
create policy "shorts upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'shorts' and shorts_is_admin());
