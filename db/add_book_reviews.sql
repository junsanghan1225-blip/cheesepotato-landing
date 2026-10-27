-- 책 리뷰 · 별점 (운영자 2026-10-27 「구매가 생기면 리뷰 물어보기」).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
--
-- 누구나(로그인 안 해도) 리뷰를 **쓸 수는** 있지만 처음에는 보이지 않는다(approved = false).
-- 운영자가 Table editor 에서 읽어 보고 approved 를 true 로 바꾼 것만 책 쪽에 나온다(읽기 정책은 approved = true 만).
-- verified = Polar 에서 실제 결제를 확인한 리뷰 — 운영자가 확인한 뒤에만 true 로 바꾼다(손님이 직접 true 로 쓸 수 없다).
-- checkout_id = 결제 완료 쪽 주소의 checkout_id(Polar 에서 그 결제를 찾는 데 쓴다).
create table if not exists book_reviews (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  book_id     text not null check (char_length(book_id) between 2 and 60),
  rating      smallint not null check (rating between 1 and 5),
  name        text check (name is null or char_length(name) <= 40),
  body        text check (body is null or char_length(body) <= 1500),
  checkout_id text check (checkout_id is null or char_length(checkout_id) <= 100),
  approved    boolean not null default false,
  verified    boolean not null default false
);

create index if not exists book_reviews_book_idx on book_reviews (book_id, approved);

alter table book_reviews enable row level security;

drop policy if exists "anyone can write a review" on book_reviews;
create policy "anyone can write a review" on book_reviews
  for insert to anon, authenticated
  with check (approved = false and verified = false);

drop policy if exists "anyone can read approved reviews" on book_reviews;
create policy "anyone can read approved reviews" on book_reviews
  for select to anon, authenticated
  using (approved = true);
