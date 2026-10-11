-- 반 · 숙제에 새 종류를 더한다(운영자 요청 2026-10-11 「숙제 다양하게 줄 수 있게」).
--
--   Supabase 대시보드 → SQL Editor 에서 한 번 돌린다(db/add_classes.sql · db/add_classes_topik.sql 을 먼저 돌린 뒤). 여러 번 돌려도 괜찮다.
--   숙제 종류 칸(kind)이 받는 값만 넓힌다 — 이미 낸 숙제 · 기록은 그대로. cls_mark 함수는 고칠 것이 없다(종류가 달라도 ref 가 같으면 「했음」).
--     tlisten: TOPIK 듣기 한 유형(ref = 시험:유형, 예: I:listen-pic) — 그 유형 연습을 끝내면 「했음」 + 맞힌 수(ok / n)
--     tmock  : TOPIK 읽기 모의고사 한 회차(ref = 시험:회차, 예: II:3) — 끝까지 풀면 「했음」 + 맞힌 수
--     convo  : 회화 연습 한 장면(ref = 장면 id, 예: cv-cafe-b-01) — 끝까지 하면 「했음」
--     story  : 동화책 한 권(ref = 책 id, 예: sb-01) — 마지막 쪽까지 읽으면 「했음」
--     translate: 번역 연습 한 편(ref = 글 id, 예: b-cafe) — 한 편을 끝까지 하면 「했음」 + 맞힌 줄(ok / n)  ← 2026-10-11 더함. 앞서 돌렸어도 한 번 더 돌린다(같은 파일, 몇 번 돌려도 괜찮다)

alter table class_homework drop constraint if exists class_homework_kind_check;
alter table class_homework add constraint class_homework_kind_check
  check (kind in ('lesson', 'vocab', 'grammar', 'twrite', 'tread', 'tlisten', 'tmock', 'convo', 'story', 'translate'));
