#!/usr/bin/env node
/* 묻고 답하기 씨앗 질문 → SQL — docs/qa-seeds.json(안티 그래비티 초안 · Claude 검토 · 운영자 확인)을
   db/add_qa_seeds.sql 로 바꾼다. 운영자가 Supabase SQL Editor 에서 한 번 돌린다.

     node tools/build-qa-seeds-sql.mjs

   - 질문 쓴 사람 이름은 「자주 묻는 질문」 — 실제 학생이 쓴 것처럼 보이지 않게(지어낸 학생 글 아님).
   - SQL Editor 에는 로그인한 사람(auth.uid())이 없어서, 글 주인은 운영자 메일로 찾은 계정으로 넣는다.
   - 여러 번 돌려도 같은 제목의 질문은 다시 넣지 않는다.
   - 「하루 5개」 막이(qa_limit 트리거)는 넣는 동안만 끄고 끝에 다시 켠다 — 안 그러면 6번째에서 멈춘다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seeds = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/qa-seeds.json'), 'utf8'));
const BOARDS = new Set(['grammar', 'words', 'topik', 'speak', 'life']);
const q = (s) => { if (String(s).includes('$t$')) throw new Error('글에 $t$ 가 있다'); return `$t$${s}$t$`; };

for (const [i, s] of seeds.entries()) {
  if (!BOARDS.has(s.board)) throw new Error(`${i}: 게시판 ${s.board}`);
  if (s.title.length < 4 || s.title.length > 120) throw new Error(`${i}: 제목 길이`);
  if (s.body.length > 3000 || !s.answer || s.answer.length > 6000) throw new Error(`${i}: 본문 · 답 길이`);
}

let sql = `-- 묻고 답하기 씨앗 질문 ${seeds.length}개 — 생성물(node tools/build-qa-seeds-sql.mjs). 손으로 고치지 말고 docs/qa-seeds.json 을 고친다.
-- Supabase 대시보드 → SQL Editor 에서 한 번 돌린다. db/add_community.sql 을 먼저 돌려 둔 뒤에.
-- 여러 번 돌려도 괜찮다 — 같은 제목의 질문이 이미 있으면 건너뛴다.
begin;   -- 한 덩어리로 — 중간에 멈추면 막이를 끈 것까지 되돌린다
alter table qa_questions disable trigger qa_limit;

do $do$
declare
  me uuid := (select id from auth.users where email = 'junsanghan1225@gmail.com' limit 1);
  qid bigint;
begin
  if me is null then raise exception '운영자 계정을 못 찾았다 — 사이트에 그 메일로 한 번 로그인한 뒤 다시 돌린다'; end if;
`;
for (const s of seeds) {
  sql += `
  if not exists (select 1 from qa_questions where title = ${q(s.title)}) then
    insert into qa_questions (user_id, author, board, title, body) values (me, '자주 묻는 질문', '${s.board}', ${q(s.title)}, ${q(s.body)}) returning id into qid;
    insert into qa_answers (question_id, user_id, author, body) values (qid, me, '치즈감자', ${q(s.answer)});
  end if;
`;
}
sql += 'end $do$;\n\nalter table qa_questions enable trigger qa_limit;\ncommit;\n';
fs.writeFileSync(path.join(ROOT, 'db/add_qa_seeds.sql'), sql);
console.log(`db/add_qa_seeds.sql — 질문 ${seeds.length}개`);
