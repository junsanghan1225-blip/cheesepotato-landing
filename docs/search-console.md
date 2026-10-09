# 검색 엔진에 알리기 — Google Search Console · Bing Webmaster Tools (운영자 순서, 2026-10-09)

사이트맵 주소: `https://everykoreans.com/sitemap.xml` (갈래별 사이트맵 다섯 개를 가리키는 목록 — 언어별 쪽 /vi/ · /ja/ 도 들어 있다)

## 1. Google Search Console
1. https://search.google.com/search-console 에 운영자 구글 계정으로 들어간다.
2. 이미 everykoreans.com 이 있으면 3번으로. 없으면 「속성 추가」 → **도메인** 에 `everykoreans.com` → 안내대로 도메인 관리 쪽(DNS)에 TXT 한 줄을 넣는다.
   DNS 가 어려우면 「URL 접두어」 → `https://everykoreans.com/` → **HTML 태그** 를 고르고, 나온 `<meta name="google-site-verification" content="…">` 한 줄을 Claude 에게 준다(이 값은 비밀이 아니다 — Claude 가 index.html 에 넣는다).
3. 왼쪽 **Sitemaps** → `sitemap.xml` 입력 → 제출. 이미 냈으면 다시 낼 필요 없다(새 쪽은 저절로 읽는다).
4. 왼쪽 **URL 검사** 에 `https://everykoreans.com/vi/` 를 넣고 「색인 생성 요청」, `/ja/` 도 똑같이 — 새 쪽을 빨리 읽어 가게 한다.
5. 1~2주 뒤 **실적** → 「국가」 탭: 베트남 · 일본에서 어떤 검색어로 보였는지 본다. 캡처해서 Claude 에게 주면 다음 쪽을 정한다.

## 2. Bing Webmaster Tools (ChatGPT 검색 · Copilot 쪽)
ChatGPT 의 검색은 Bing 자료를 많이 쓴다고 알려져 있다 — ChatGPT 로 많이 들어오는 우리에게 중요하다.
1. https://www.bing.com/webmasters 에 마이크로소프트(또는 구글) 계정으로 들어간다.
2. **Google Search Console 에서 가져오기(Import)** 를 고르면 사이트 · 사이트맵이 한 번에 넘어온다(가장 쉬움).
3. 가져오기가 안 되면 「사이트 추가」 → `https://everykoreans.com/` → 확인 방법 **HTML 메타 태그** → 나온 `<meta name="msvalidate.01" content="…">` 한 줄을 Claude 에게 준다.
4. **Sitemaps** 에 `https://everykoreans.com/sitemap.xml` 제출.
5. **IndexNow** 가 보이면 켜 둔다(새 쪽을 Bing 에 바로 알리는 기능).

## 3. 하지 않는 것
- 중국 Baidu 는 지금 하지 않는다 — 중국 안 서버 · 허가가 필요하다.
- 검색 순위를 「사 준다」는 서비스 · 링크 판매는 쓰지 않는다(구글이 벌을 준다).
