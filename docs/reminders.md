# 매일 공부 알림 메일 — 운영자 순서

학생이 설정에서 「📧 매일 공부 알림 메일」을 켜면(또는 「오늘 공부」를 다 끝낸 뒤 「내일 이 시간에 알림」을 누르면),
매일 그 사람 시간의 정한 시각에 메일이 한 통 갑니다: 「오늘 돌아온 낱말 N개 — 15분이면 끝나요」 + 「오늘 공부 시작」 단추.
그날 이미 공부했으면 보내지 않고, 메일 맨 아래 「그만 받기」를 누르면 바로 꺼집니다. 기본은 **꺼짐**(학생이 직접 켬).

## 한 번만 하면 되는 것

1. **SQL** — Supabase → SQL Editor 에서 `db/add_reminders.sql` 을 붙여 넣고 Run.
2. **메일 보내는 곳(Resend)** — https://resend.com 가입 → Domains 에 `everykoreans.com` 을 넣고, 알려 주는 DNS 줄(TXT · MX)을 도메인 관리 쪽에 추가 → Verified 가 될 때까지 기다림.
   그다음 API Keys → Create → 키를 복사(채팅에 붙이지 말 것).
3. **Supabase Secrets** — Supabase → Edge Functions → Secrets 에 셋을 넣습니다.
   - `RESEND_API_KEY` = 2번에서 복사한 키
   - `REMINDER_FROM` = `Cheesepotato <hello@everykoreans.com>` (2번에서 인증한 도메인의 주소)
   - `CRON_KEY` = 아무도 모를 긴 글자(예: 비밀번호 만들기로 40자)
4. **함수 배포** — Edge Functions → Deploy new function → 이름 `daily-reminder`, 내용은 `supabase/functions/daily-reminder/index.ts`.
   배포한 뒤 그 함수의 설정에서 **「Enforce JWT verification(Verify JWT)」을 끕니다** — 끄지 않으면 매시 부르는 것과 「그만 받기」 링크가 막힙니다(함수가 스스로 CRON_KEY · 서명으로 확인합니다).
5. **GitHub** — 저장소 Settings → Secrets and variables → Actions
   - Secrets 에 `CRON_KEY`(3번과 **같은 값**)
   - Variables 에 `REMINDER_AUTO` = `on`
6. 시험 — Actions → daily-reminder → Run workflow. 로그에 `{"sent":0,"skipped":…}` 가 나오면 연결된 것입니다.
   본인 계정으로 사이트 설정에서 알림을 켜고, 시각을 지금 시각으로 두면 다음 정각 5분에 메일이 옵니다.

끄고 싶으면 Variables 의 `REMINDER_AUTO` 를 지우면 됩니다(학생 설정은 그대로 남습니다).
