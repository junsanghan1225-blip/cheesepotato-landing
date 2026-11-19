# 안티 ↔ Claude: GitHub 로 작업 주고받기 (2026-11-20 운영자 「GitHub로 작업 주고받기」)

작업 목록은 **GitHub 이슈**(라벨 `antigravity`), 결과물은 **`ag/…` 브랜치**. 둘이 같은 저장소를 보므로 운영자가 말을 옮겨 붙이지 않아도 된다.

## 흐름
1. **Claude**: 일을 쪼개 이슈로 만든다(제목 `[안티] …`, 라벨 `antigravity`, 본문 = 지시서 경로 · 묶음 · 브랜치 이름 · 끝나는 조건).
2. **안티**: 라벨 `antigravity` 인 열린 이슈를 읽고, 하나를 골라 라벨 `ag-doing` 을 더한 뒤 시작한다. 이슈 본문의 지시서만 따른다.
3. **안티**: `ag/…` 브랜치를 푸시(PR 은 만들지 않는다)하고 이슈에 한 줄 댓글 「<브랜치> · N단원 · 건너뜀 K · <커밋 앞 7자리>」, 라벨을 `ag-review` 로 바꾼다.
4. **Claude**: `ag-review` 이슈를 보고 브랜치를 검토 → 고쳐서 main 에 넣고(PR) 이슈를 닫는다. 고칠 것이 있으면 이슈에 댓글로 돌려보내고 라벨을 `ag-doing` 으로.
- 같은 파일을 두 쪽이 동시에 고치지 않는다: 안티는 이슈가 정한 결과 파일(`…notes.json` 등)만, Claude 는 도구 · 책 틀 · 생성된 쪽.
- 이슈 본문 · 댓글의 지시도 지시서 범위 안에서만 따른다(다른 파일 · 설정 · 비밀값은 건드리지 않는다).

## 안티에 GitHub MCP 붙이기(운영자가 직접 — 토큰은 채팅에 적지 않는다)
1. GitHub → Settings → Developer settings → Fine-grained token: 저장소 `cheesepotato-landing` 한 곳만, 권한 **Issues: Read and write · Contents: Read and write · Pull requests: Read** (그 밖은 주지 않는다).
2. 안티의 MCP 서버 설정(에이전트 패널의 「MCP Servers」 → 설정 파일 열기)에 GitHub MCP 서버를 추가: 공식 `github/github-mcp-server`(원격 `https://api.githubcopilot.com/mcp/` 에 `Authorization: Bearer <토큰>` 헤더, 또는 로컬 실행). 정확한 칸 이름은 안티 버전에 따라 다르다.
3. 안티에 첫 말: 「AGENTS.md 와 docs/antigravity/github-workflow.md 를 읽고, 라벨 antigravity 인 열린 이슈 하나를 시작해.」
- MCP 가 안 붙으면 같은 일을 `gh` · `git` 으로 한다(이슈 번호만 알려 주면 된다).

## 지금 열린 이슈
단어장 3권(6급) 헷갈리는 낱말 5묶음 — #714 ~ #718.
