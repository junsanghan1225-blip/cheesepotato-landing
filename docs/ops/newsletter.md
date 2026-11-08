# 메일 소식(월 1~2회) — 운영 순서와 첫 호 초안 (2026-11-05)

> 메일 보내는 곳은 **Resend**(이미 가입 · `everykoreans.com` 인증 끝 — 운영자 2026-11-05). 받는 사람은 `email_leads`(Supabase)에서 **`marketing_ok` 가 켜진 사람만**. 약속은 「새 무료 샘플 · 학습 소식 가끔」뿐이다.

## 보내는 순서 (운영자 10분)
1. **받는 사람 내보내기** — Supabase → Table editor → `email_leads` → 위쪽 Filter 에서 `marketing_ok` = `true` → 오른쪽 위 「Export」 → CSV. (이메일 칸만 있으면 된다. 새로 들어온 것만 보낼 때는 `created_at` 으로 거른다.)
2. **Resend 에 목록 만들기** — Resend → Audiences → Create audience(이름 「치즈감자 소식」) → 1번 CSV 를 가져오기(Import) 또는 한 명씩 추가. 이미 넣은 사람을 다시 넣어도 같은 사람으로 센다.
3. **보내기** — Resend → Broadcasts → Create → 받는 목록 선택 · 보내는 사람 `Cheesepotato <hello@everykoreans.com>`(알림 메일과 같은 주소) · 제목 · 본문(아래 초안 복사) → **맨 아래에 「그만 받기」 링크가 들어 있는지 확인**(Resend 가 넣어 주는 그만 받기 칸을 켠다. 없으면 보내지 않는다) → 먼저 본인에게 「시험 메일」 → 이상 없으면 Send.
4. 보낸 날 `docs/ops/daily-plan.md` 의 「수」 칸에 한 줄(몇 명에게 · 열람 · 클릭)을 Claude 에게 알려 준다.
- Resend 한도(2026-11-05 Resend 연결로 확인, 무료 요금): 하루 보내기 100 · 한 달 3,000 · 연락처 1,000 · 목록(segment) 3 · 도메인 3 · 한 번에 보내는 소식(broadcast)은 수 제한 없음. 이메일이 1,000명을 넘으면 유료 요금을 본다. 공부 알림 메일도 같은 한도를 나눠 쓴다(하루 100통).
- 받는 사람이 늘면 「그만 받기」가 눌린 사람을 `email_leads` 에서 빼는 일(`marketing_ok` 끄기)이 필요하다 — 그때 자동으로 맞추는 함수를 만든다(지금은 사람이 적어 수동).

## 첫 호 초안 (영어 + 한국어, 2026-11) — 11/11 발송 확정본(2026-11-08: 새 제목 · 블로그 링크 · 예스24 안내를 더함)
**제목(영어)**: Free Korean samples: TOPIK writing and 10 particles done right
**제목(한글)**: 무료 샘플 두 가지 — 토픽 쓰기와 조사

> Hi, this is Jun from Cheesepotato (everykoreans.com).
> 안녕하세요, 치즈감자 준성입니다.
>
> **1. Try the free samples · 무료 샘플 받아 보기**
> Every workbook has a free sample (cover, contents, first units). Two good places to start:
> - Writing Practice 51–52 (for TOPIK II): https://everykoreans.com/shop/topik2-writing-51-52/
> - Korean Particles Workbook: https://everykoreans.com/shop/particles-workbook/
> 책마다 무료 샘플(표지 · 차례 · 첫 단원)이 있어요. 위 두 권부터 보세요.
>
> **2. One tip: 은/는 vs 이/가 · 한 가지 팁**
> Ask 「누가 왔어요?」 (Who came?) and the answer takes **이/가**: 「민수**가** 왔어요.」 Talk about something already known, or compare two things, and use **은/는**: 「커피**는** 좋아해요. 차는 안 좋아해요.」
> 「누가 · 뭐가」로 물으면 **이/가**로 답하고, 이미 아는 것을 말하거나 둘을 견주면 **은/는**을 써요.
>
> **3. More tips on the blog · 블로그에서 더 보기**
> - 은/는 vs 이/가: https://everykoreans.com/blog/eun-neun-vs-i-ga-english.html
> - 에 vs 에서 (where things are, where things happen): https://everykoreans.com/blog/e-vs-eseo-english.html
> - 한국에서는 예스24에서도 PDF 책을 살 수 있어요: https://everykoreans.com/blog/yes24-ebooks-where-to-start.html
>
> **4. Where do you start? · 어디서 시작할까요?**
> Take the 3-minute level test: https://everykoreans.com/?lt=1
> 3분 레벨 테스트로 내 자리를 찾아보세요.
>
> You are getting this because you left your email on everykoreans.com and agreed to study news. Unsubscribe any time with the link below.
> 이 메일은 everykoreans.com 에 이메일을 남기고 학습 소식 받기에 동의하신 분께 보냅니다. 아래 「그만 받기」로 언제든 끊을 수 있어요.

## 다음 호 후보 (한 호에 팁 하나 · 샘플 하나 · 링크 하나)
- 12월 초: 에 vs 에서(장소) — 쓰기 연습 문항 하나 풀이 + 첫걸음 워크북 샘플.
- 이후: TOPIK 쓰기 54번 구조 · 단어장 샘플 · 받침(첫걸음 보강본이 나오면).
