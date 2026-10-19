-- 팟캐스트 대기열 (운영자 요청 2026-10-19 「녹음해서 보내면 바로 올라가게」) — 운영자가 Supabase SQL Editor 에서 한 번 돌린다. 여러 번 돌려도 된다.
--
--   · 팟캐스트 올리기 쪽(/podcast.html)에서 녹음 파일을 올리면
--       소리 · 표지 그림 → 저장 칸 podcast(공개 읽기 — 스포티파이가 주소로 소리를 가져가야 해서, 소리는 지우지 않는다)
--       제목 · 설명 → 표 podcast_queue
--   · GitHub 액션(.github/workflows/podcast-post.yml)이 30분마다 「ready」 줄을 꺼내
--       소리 + 표지로 영상을 만들어 유튜브에 올리고(service key 로 — RLS 를 안 탄다) yt 칸에 결과를 적고,
--       스포티파이가 읽어 가는 방송 목록(feed.xml)을 저장 칸에 다시 써 둔다.
--   · 쓰기 · 읽기는 운영자 메일만(shorts_is_admin 을 그대로 쓴다 — db/add_shorts.sql 을 먼저 돌렸어야 한다). 다른 사람은 표를 못 본다.

create or replace function shorts_is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'junsanghan1225@gmail.com'
$$;

create table if not exists podcast_queue (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  ep          text not null,                 -- 에피소드 번호(01 · 02 …)
  audio_path  text not null,                 -- 저장 칸 podcast 안의 길
  cover_path  text,
  mime        text,
  seconds     int,
  bytes       bigint,
  title       text not null,
  description text not null,
  tags        text[] default '{}',
  status      text not null default 'ready', -- ready · done · cancel
  yt          jsonb,                         -- {ok, id, url} · {err, tries} · {skip}
  posted_at   timestamptz
);
create index if not exists podcast_queue_ready on podcast_queue (status, id);

alter table podcast_queue enable row level security;
drop policy if exists "podcast read" on podcast_queue;
drop policy if exists "podcast add" on podcast_queue;
drop policy if exists "podcast edit" on podcast_queue;
create policy "podcast read" on podcast_queue for select to authenticated using (shorts_is_admin());
create policy "podcast add"  on podcast_queue for insert to authenticated with check (shorts_is_admin());
create policy "podcast edit" on podcast_queue for update to authenticated using (shorts_is_admin()) with check (shorts_is_admin());

-- 저장 칸 — 공개 읽기, 파일 하나 50MB, 소리 · 표지 그림 · 방송 목록(feed.xml)만
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('podcast', 'podcast', true, 52428800, array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'image/jpeg', 'application/rss+xml', 'application/xml', 'text/xml'])
on conflict (id) do update set public = true, file_size_limit = 52428800,
  allowed_mime_types = array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'image/jpeg', 'application/rss+xml', 'application/xml', 'text/xml'];

drop policy if exists "podcast upload" on storage.objects;
create policy "podcast upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'podcast' and shorts_is_admin());
