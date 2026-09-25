/* EPS-TOPIK(고용허가제 한국어능력시험) 연습 문항.

   실제 시험: 읽기 25 + 듣기 25 = 50문항 · 200점 · 70분(읽기 40분, 듣기 30분).
   응시자는 베트남 · 인도네시아 · 네팔 · 필리핀 · 캄보디아 · 미얀마 · 스리랑카 · 우즈베키스탄 등에서
   한국에서 일하려는 사람이다. 수준은 TOPIK I(1~2급) 안팎이고, 일상 · 직장 생활 · 산업 안전 ·
   한국 문화를 묻는다.

   문항은 안티 그래비티가 채운다(docs/antigravity-eps-task.md). 모양 검사: tools/check-eps.mjs.
   한 문항:
   {
     id: 'eps-r-001',              // 읽기 eps-r-… · 듣기 eps-l-…
     sec: 'reading',               // 'reading' | 'listening'
     type: 'vocab',                // 아래 EPS_TYPES 의 키
     topic: 'safety',              // 'daily' | 'work' | 'safety' | 'culture'
     pic: '🧤',                    // 그림 문항만 — 이모지 하나(그림을 대신한다). 없으면 빼기
     passage: '…',                 // 읽을 글(표지판 · 안내문 · 짧은 글). 없으면 빼기
     script: ['남: …', '여: …'],    // 듣기만 — 들려줄 말. 읽기에는 빼기
     question: '…',                // 물음
     options: ['…', '…', '…', '…'],// 꼭 넷
     answer: 0,                    // 정답 자리(0~3)
     why: '…',                     // 한국어 해설 한두 문장
     why_en: '…',                  // 영어 해설(베트남어 등은 나중에)
   } */
export const EPS_TYPES = {
  reading: {
    vocab:   { ko: '그림 보고 낱말 고르기', en: 'Picture → word' },
    grammar: { ko: '빈칸에 알맞은 말', en: 'Fill the blank' },
    sign:    { ko: '표지판 · 안내문', en: 'Signs and notices' },
    text:    { ko: '짧은 글 읽기', en: 'Short passages' },
  },
  listening: {
    pic:     { ko: '듣고 그림(낱말) 고르기', en: 'Listen → picture' },
    reply:   { ko: '이어질 말 고르기', en: 'Choose the reply' },
    talk:    { ko: '대화 듣고 답하기', en: 'Conversations' },
    notice:  { ko: '안내 방송 듣기', en: 'Announcements' },
  },
};
export const EPS_TOPICS = ['daily', 'work', 'safety', 'culture'];
export const EPS_ITEMS = [];
