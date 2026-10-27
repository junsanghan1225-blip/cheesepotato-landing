# 책 리뷰 · 별점 — 운영자 순서 (2026-10-27)

> 책 쪽(/shop/<id>/)의 별점 · 리뷰는 **구매자가 쓴 것을 운영자가 확인해 승인한 것만** 보입니다. 가짜 별점은 없고, 리뷰가 없으면 「No reviews yet」으로 나옵니다.

## 한 번만 하면 되는 것
1. **SQL** — Supabase → SQL Editor 에서 `db/add_book_reviews.sql` 붙여 넣고 Run.
2. **머지한 뒤 결제 링크의 돌아올 곳 바꾸기**(Claude 가 함) — `node tools/polar-links.mjs --apply`. 결제가 끝나면 손님이 `/shop/thanks/`(감사 · 리뷰 쪽)로 오게 됩니다. 머지 전에 바꾸면 없는 쪽으로 가니 **머지한 뒤에** 합니다.

## 리뷰가 들어오면
1. Supabase → Table editor → `book_reviews`. 새 줄은 `approved = false` 로 들어옵니다.
2. 내용을 읽고 괜찮으면 `approved` 를 **true** 로. (욕설 · 광고 · 개인정보가 있으면 그대로 두거나 줄을 지웁니다.)
3. 실제 구매자인지 확인하고 싶으면 `checkout_id` 를 Polar → Sales(Orders) 에서 찾아 보고, 맞으면 `verified` 도 **true** — 그러면 책 쪽에 「verified purchase」가 붙습니다. 확인하지 않은 리뷰는 붙지 않습니다.

## 리뷰를 더 받으려면 (운영자가 하는 일)
- 감사 쪽이 결제 직후 「책은 어땠나요?」를 한 번 묻습니다(별점 + 한 줄).
- **일주일쯤 뒤 한 번 더 메일**: Polar → Customers 에서 구매한 사람 이메일을 보고 아래 글을 보냅니다(구독 광고가 아니라 구매 안내 후속이라 한 통만).
  > 제목: How is {책 이름}? / Hi, thank you again for buying {책 이름}. If it is helpful, a short review (one line is fine) helps other learners find the right book: https://everykoreans.com/shop/thanks/?book={책 id}#review — Junsang, Everykoreans
- 다음 책 PDF 판(v3.1 이후) 맨 끝 쪽에 「리뷰 남기기」 QR 한 줄을 넣는 것도 방법입니다(지금 PDF 는 이미 팔고 있어 바꾸지 않았습니다).
