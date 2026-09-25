# AI 쓰기 채점 켜는 순서 (Supabase 대시보드)

1. **SQL Editor** 에서 `db/add_ai_usage.sql` 을 통째로 돌린다(하루 사용 횟수 표).
   `db/add_subscriptions.sql` 을 아직 안 돌렸으면 그것도 먼저(구독자 판별 `is_pro`).
2. **Edge Functions → Deploy a new function → Via Editor**
   - 이름: `grade-writing` (처음부터 이 이름으로 — 나중에 바꾸면 주소는 안 바뀐다)
   - 코드: `supabase/functions/grade-writing/index.ts` 를 통째로 붙여 넣고 Deploy
   - **Verify JWT 는 켜 둔다**(paddle-webhook 과 반대 — 로그인한 사람만 쓰는 함수다)
3. **Edge Functions → Secrets** 에 `GEMINI_API_KEY` 가 있는지 본다. 발음 진단 · 한국어 도우미가 이미
   쓰고 있으면 있다. 이름이 다르면(예: `GOOGLE_API_KEY`) 그대로 둬도 된다 — 함수가 둘 다 찾는다.
4. 사이트에서 로그인 → TOPIK → TOPIK II → 쓰기 → 54번 문항 → 50자 넘게 쓰고 「🤖 AI 채점」.
   20초 안팎에 점수가 나오면 성공. **Invocations** 에 200 이 찍힌다.
   - 401: 로그인이 안 됐거나 Verify JWT 설정 문제
   - 500: `ai_usage` 표나 `is_pro` 함수가 없다(1번)
   - 502: AI 키 문제(3번) — 이때는 횟수를 되돌려 준다

하루 횟수: 무료 2 · Pro 30 — `index.ts` 맨 위의 `LIMIT` 에서 바꾼다.
