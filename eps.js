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
export const EPS_ITEMS = [
  {
    "id": "eps-r-001",
    "sec": "reading",
    "type": "vocab",
    "topic": "safety",
    "pic": "⛑️",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "안전모",
      "안전화",
      "보안경",
      "귀마개"
    ],
    "answer": 0,
    "why": "머리를 보호하기 위해 작업장에서 쓰는 보호구는 안전모입니다.",
    "why_en": "A hard hat ('안전모') is protective headgear worn at work sites."
  },
  {
    "id": "eps-r-002",
    "sec": "reading",
    "type": "vocab",
    "topic": "safety",
    "pic": "🧯",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "구급함",
      "소화기",
      "비상벨",
      "손전등"
    ],
    "answer": 1,
    "why": "불이 났을 때 불을 끄기 위해 사용하는 기구는 소화기입니다.",
    "why_en": "A fire extinguisher ('소화기') is used to put out fires."
  },
  {
    "id": "eps-r-003",
    "sec": "reading",
    "type": "vocab",
    "topic": "work",
    "pic": "🔨",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "톱",
      "줄자",
      "망치",
      "드릴"
    ],
    "answer": 2,
    "why": "못을 박거나 두드릴 때 사용하는 수공구는 망치입니다.",
    "why_en": "A hammer ('망치') is a hand tool used for pounding nails."
  },
  {
    "id": "eps-r-004",
    "sec": "reading",
    "type": "vocab",
    "topic": "work",
    "pic": "📦",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "자루",
      "바구니",
      "비닐봉지",
      "상자"
    ],
    "answer": 3,
    "why": "물건을 담아 포장하고 보관하는 네모난 용기는 상자입니다.",
    "why_en": "A box ('상자') is a container used for packing and storage."
  },
  {
    "id": "eps-r-005",
    "sec": "reading",
    "type": "vocab",
    "topic": "safety",
    "pic": "🧤",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "목장갑",
      "마스크",
      "앞치마",
      "팔토시"
    ],
    "answer": 0,
    "why": "작업할 때 손을 다치지 않게 보호하는 면장갑은 목장갑입니다.",
    "why_en": "Cotton work gloves ('목장갑') protect hands during manual tasks."
  },
  {
    "id": "eps-r-006",
    "sec": "reading",
    "type": "vocab",
    "topic": "daily",
    "pic": "💊",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "반창고",
      "알약",
      "물약",
      "파스"
    ],
    "answer": 1,
    "why": "물과 함께 삼켜서 복용하는 둥근 형태의 약은 알약입니다.",
    "why_en": "Pills or tablets ('알약') are medicine swallowed with water."
  },
  {
    "id": "eps-r-007",
    "sec": "reading",
    "type": "vocab",
    "topic": "daily",
    "pic": "🚌",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "기차",
      "비행기",
      "버스",
      "자전거"
    ],
    "answer": 2,
    "why": "도로에서 정류장마다 정차하며 승객을 태우는 대중교통은 버스입니다.",
    "why_en": "A bus ('버스') is road-based public transit stopping at bus stops."
  },
  {
    "id": "eps-r-008",
    "sec": "reading",
    "type": "vocab",
    "topic": "culture",
    "pic": "🥢",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "숟가락",
      "포크",
      "나이프",
      "젓가락"
    ],
    "answer": 3,
    "why": "반찬이나 면 요리를 집어 먹을 때 쓰는 두 짝의 막대는 젓가락입니다.",
    "why_en": "Chopsticks ('젓가락') are two thin sticks used to pick up food."
  },
  {
    "id": "eps-r-009",
    "sec": "reading",
    "type": "vocab",
    "topic": "work",
    "pic": "🚜",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "트랙터",
      "지게차",
      "크레인",
      "덤프트럭"
    ],
    "answer": 0,
    "why": "농촌에서 밭을 갈거나 무거운 짐을 끌 때 쓰는 농기계는 트랙터입니다.",
    "why_en": "A tractor ('트랙터') is a heavy farm vehicle used in agriculture."
  },
  {
    "id": "eps-r-010",
    "sec": "reading",
    "type": "vocab",
    "topic": "safety",
    "pic": "🥾",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "슬리퍼",
      "안전화",
      "운동화",
      "구두"
    ],
    "answer": 1,
    "why": "무거운 물체 낙하로부터 발을 보호하는 특수 작업 신발은 안전화입니다.",
    "why_en": "Safety shoes ('안전화') protect feet from falling heavy objects."
  },
  {
    "id": "eps-r-011",
    "sec": "reading",
    "type": "vocab",
    "topic": "daily",
    "pic": "🧹",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "걸레",
      "쓰레받기",
      "빗자루",
      "청소기"
    ],
    "answer": 2,
    "why": "바닥의 먼지와 쓰레기를 쓸어 내는 청소 도구는 빗자루입니다.",
    "why_en": "A broom ('빗자루') is used for sweeping dust off floors."
  },
  {
    "id": "eps-r-012",
    "sec": "reading",
    "type": "vocab",
    "topic": "daily",
    "pic": "🍚",
    "question": "다음 그림을 보고 맞는 단어를 고르십시오.",
    "options": [
      "국",
      "반찬",
      "찌개",
      "밥"
    ],
    "answer": 3,
    "why": "쌀을 씻어 물을 붓고 솥에 끓여 지은 한국인의 주식은 밥입니다.",
    "why_en": "Steamed rice ('밥') is the staple food in Korean cuisine."
  },
  {
    "id": "eps-r-013",
    "sec": "reading",
    "type": "grammar",
    "topic": "work",
    "passage": "저는 매일 아침 8시___ 회사에 출근합니다.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "에",
      "에서",
      "을",
      "로"
    ],
    "answer": 0,
    "why": "구체적인 시각이나 때를 나타낼 때는 조사 「에」를 씁니다.",
    "why_en": "The time particle 「에」 indicates a specific point in time."
  },
  {
    "id": "eps-r-014",
    "sec": "reading",
    "type": "grammar",
    "topic": "daily",
    "passage": "한국 친구와 이야기하___ 한국어를 열심히 공부해요.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "거나",
      "려고",
      "지만",
      "는데"
    ],
    "answer": 1,
    "why": "어떤 행동의 목적이나 의도를 나타낼 때는 연결 어미 「-(으)려고」를 씁니다.",
    "why_en": "「-(으)려고」 expresses intention or purpose to do something."
  },
  {
    "id": "eps-r-015",
    "sec": "reading",
    "type": "grammar",
    "topic": "daily",
    "passage": "작업장에서는 머리를 보호하기 위해 안전모를 반드시 ___.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "신어야 합니다",
      "입어야 합니다",
      "써야 합니다",
      "끼어야 합니다"
    ],
    "answer": 2,
    "why": "모자나 헬멧 등 머리에 착용하는 물건은 동사 「쓰다」를 씁니다.",
    "why_en": "The verb 「쓰다」 is used for items worn on the head."
  },
  {
    "id": "eps-r-016",
    "sec": "reading",
    "type": "grammar",
    "topic": "daily",
    "passage": "주말에는 보통 기숙사에서 쉬___ 친구를 만나요.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "지만",
      "니까",
      "려고",
      "거나"
    ],
    "answer": 3,
    "why": "둘 이상의 행동 중 하나를 선택하는 상황에서는 연결 어미 「-거나」를 씁니다.",
    "why_en": "「-거나」 links alternative actions equivalent to \"or\"."
  },
  {
    "id": "eps-r-017",
    "sec": "reading",
    "type": "grammar",
    "topic": "work",
    "passage": "기계에 문제가 생기면 즉시 반장님께 보고___ 합니다.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "해야",
      "해도",
      "하면",
      "해서"
    ],
    "answer": 0,
    "why": "반드시 지켜야 하는 의무나 규정을 나타낼 때는 「-해야 하다」를 씁니다.",
    "why_en": "「-해야 하다」 expresses an obligation or required action."
  },
  {
    "id": "eps-r-018",
    "sec": "reading",
    "type": "grammar",
    "topic": "work",
    "passage": "위험한 프레스 기계를 다룰 때는 언제나 ___ 작업하세요.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "급하게",
      "조심해서",
      "빠르게",
      "신나게"
    ],
    "answer": 1,
    "why": "사고가 나지 않도록 주의를 기울여 행동할 때는 부사구 「조심해서」를 씁니다.",
    "why_en": "「조심해서」 means carefully and attentively to avoid danger."
  },
  {
    "id": "eps-r-019",
    "sec": "reading",
    "type": "grammar",
    "topic": "culture",
    "passage": "한국에서는 어른보다 숟가락을 먼저 들면 ___.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "좋습니다",
      "됩니다",
      "안 됩니다",
      "편합니다"
    ],
    "answer": 2,
    "why": "식사 예절상 금지되거나 어긋나는 행동에는 「-(으)면 안 되다」를 씁니다.",
    "why_en": "「-(으)면 안 되다」 denotes prohibited or improper behavior."
  },
  {
    "id": "eps-r-020",
    "sec": "reading",
    "type": "grammar",
    "topic": "work",
    "passage": "매달 25일이 되면 은행 통장으로 월급이 ___.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "나갑니다",
      "보냅니다",
      "빠집니다",
      "들어옵니다"
    ],
    "answer": 3,
    "why": "돈이나 급여가 계좌로 입금될 때는 「들어오다」를 씁니다.",
    "why_en": "When money is deposited into an account, Koreans say it 「들어오다」."
  },
  {
    "id": "eps-r-021",
    "sec": "reading",
    "type": "grammar",
    "topic": "safety",
    "passage": "작업장에 먼지가 많으면 창문을 ___ 공기를 환기하세요.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "열어서",
      "닫아서",
      "잠가서",
      "막아서"
    ],
    "answer": 0,
    "why": "환기(바람 통함)를 시키려면 창문을 「열다」를 써야 합니다.",
    "why_en": "To ventilate ('환기하다'), one must open ('열어서') the window."
  },
  {
    "id": "eps-r-022",
    "sec": "reading",
    "type": "grammar",
    "topic": "daily",
    "passage": "뚜안 씨는 한국에 온 지 1년밖에 안 됐는데 한국어를 아주 ___ 해요.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "느리게",
      "잘",
      "어렵게",
      "모자라게"
    ],
    "answer": 1,
    "why": "능숙하게 해내는 모습을 긍정적으로 칭찬할 때는 부사 「잘」을 씁니다.",
    "why_en": "The adverb 「잘」 (well) indicates competence and skill."
  },
  {
    "id": "eps-r-023",
    "sec": "reading",
    "type": "grammar",
    "topic": "daily",
    "passage": "병원에 가서 주사를 맞고 약을 먹었더니 감기가 다 ___.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "걸렸어요",
      "심해졌어요",
      "나았어요",
      "아팠어요"
    ],
    "answer": 2,
    "why": "병이나 아픔이 치료되어 정상으로 회복되었을 때는 「낫다」의 과거형 「나았어요」를 씁니다.",
    "why_en": "「나았어요」 is the past tense of 「낫다」, meaning cured or recovered."
  },
  {
    "id": "eps-r-024",
    "sec": "reading",
    "type": "grammar",
    "topic": "culture",
    "passage": "직장 상사나 어른께 결재 서류를 드릴 때는 ___ 손으로 건넵니다.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "한",
      "왼",
      "아무",
      "두"
    ],
    "answer": 3,
    "why": "한국 문화에서 웃어른이나 직장 상사에게 물건을 건넬 때는 두 손을 씁니다.",
    "why_en": "Handing items to seniors with both hands ('두' '손') shows proper respect."
  },
  {
    "id": "eps-r-025",
    "sec": "reading",
    "type": "grammar",
    "topic": "work",
    "passage": "오늘 납품 물량이 많아서 저녁 8시까지 잔업을 ___ 합니다.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "해야",
      "해도",
      "하면",
      "해서"
    ],
    "answer": 0,
    "why": "꼭 처리해야 하는 업무상 의무에는 「-해야 하다」를 씁니다.",
    "why_en": "「-해야 하다」 expresses duty or operational necessity."
  },
  {
    "id": "eps-r-026",
    "sec": "reading",
    "type": "grammar",
    "topic": "safety",
    "passage": "작업장 통로에 물건을 쌓아 두면 발에 걸려 ___ 수 있습니다.",
    "question": "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    "options": [
      "달릴",
      "넘어질",
      "일어날",
      "올라갈"
    ],
    "answer": 1,
    "why": "통로의 장애물에 발이 걸렸을 때 일어나는 사고는 「넘어지다」입니다.",
    "why_en": "Tripping on pathway obstacles causes a fall ('넘어지다')."
  },
  {
    "id": "eps-r-027",
    "sec": "reading",
    "type": "sign",
    "topic": "safety",
    "passage": "[금연] 이 건물 전체는 금연 구역입니다. 흡연 시 과태료가 부과됩니다.",
    "question": "이 표지판은 무슨 뜻입니까?",
    "options": [
      "담배를 피우지 마십시오.",
      "쓰레기를 버리지 마십시오.",
      "음식을 먹지 마십시오.",
      "휴대전화를 끄십시오."
    ],
    "answer": 0,
    "why": "「금연」은 담배를 피우지 말라는 경고입니다.",
    "why_en": "「금연」 means No Smoking."
  },
  {
    "id": "eps-r-028",
    "sec": "reading",
    "type": "sign",
    "topic": "safety",
    "passage": "[위험] 고전압 전선 작업 중! 감전 위험 주의.",
    "question": "이 표지판이 있는 곳에서 주의해야 할 위험은 무엇입니까?",
    "options": [
      "화재 사고",
      "감전 사고",
      "추락 사고",
      "충돌 사고"
    ],
    "answer": 1,
    "why": "고전압 전선 근처에서는 전기에 감전되는 사고를 조심해야 합니다.",
    "why_en": "High voltage warnings alert workers against electrical shocks ('감전')."
  },
  {
    "id": "eps-r-029",
    "sec": "reading",
    "type": "sign",
    "topic": "work",
    "passage": "[사내 식당 안내]\n점심시간: 12:00 ~ 13:00\n저녁시간: 18:00 ~ 19:00\n* 식사를 마친 후 식판은 퇴식구에 직접 반납해 주세요.",
    "question": "이 식당에서 식사를 마친 후 해야 할 일은 무엇입니까?",
    "options": [
      "식탁 위에 식판을 둡니다.",
      "식당 밖으로 식판을 가져갑니다.",
      "퇴식구에 식판을 직접 반납합니다.",
      "주방에 들어가서 설거지합니다."
    ],
    "answer": 2,
    "why": "안내문에 식판을 퇴식구에 직접 반납하라고 적혀 있습니다.",
    "why_en": "Trays must be returned directly to the return counter."
  },
  {
    "id": "eps-r-030",
    "sec": "reading",
    "type": "sign",
    "topic": "daily",
    "passage": "[지하철 막차 안내]\n서울역 방면: 23시 40분\n인천역 방면: 23시 55분",
    "question": "인천역으로 가는 마지막 지하철 시간은 언제입니까?",
    "options": [
      "오후 11시 정각",
      "오후 11시 20분",
      "오후 11시 40분",
      "오후 11시 55분"
    ],
    "answer": 3,
    "why": "인천역 방면 막차 시간은 23시 55분(밤 11시 55분)입니다.",
    "why_en": "The last train for Incheon departs at 23:55 (11:55 PM)."
  },
  {
    "id": "eps-r-031",
    "sec": "reading",
    "type": "sign",
    "topic": "safety",
    "passage": "[보호구 필수 착용]\n안전모와 보안경을 착용하지 않은 작업자는 공사 현장에 출입할 수 없습니다.",
    "question": "이 공사 현장에 들어가려면 반드시 착용해야 하는 것은 무엇입니까?",
    "options": [
      "안전모와 보안경",
      "슬리퍼와 반바지",
      "목장갑과 귀마개",
      "작업복과 우비"
    ],
    "answer": 0,
    "why": "출입 조건으로 안전모와 보안경 착용이 명시되어 있습니다.",
    "why_en": "Hard hats and safety glasses are strictly mandatory for entry."
  },
  {
    "id": "eps-r-032",
    "sec": "reading",
    "type": "sign",
    "topic": "work",
    "passage": "[작업장 정리정돈 수칙]\n작업이 끝난 후 사용한 공구는 반드시 제자리에 걸어 두고 바닥을 청소하십시오.",
    "question": "작업이 끝난 후 올바른 행동은 무엇입니까?",
    "options": [
      "공구를 바닥에 두고 퇴근합니다.",
      "공구를 제자리에 정리하고 청소합니다.",
      "공구를 기숙사로 가져갑니다.",
      "기계를 켜 둔 채로 나갑니다."
    ],
    "answer": 1,
    "why": "사용한 공구를 제자리에 두고 바닥을 청소하라는 수칙입니다.",
    "why_en": "Tools must be returned to their designated places and floors swept."
  },
  {
    "id": "eps-r-033",
    "sec": "reading",
    "type": "sign",
    "topic": "daily",
    "passage": "[하나약국 영업 안내]\n평일: 오전 9시 ~ 오후 7시\n토요일: 오전 9시 ~ 오후 1시\n* 일요일 및 공휴일 휴무",
    "question": "이 약국이 문을 여는 시간은 언제입니까?",
    "options": [
      "일요일 오후 2시",
      "공휴일 오전 10시",
      "토요일 오전 11시",
      "월요일 저녁 8시"
    ],
    "answer": 2,
    "why": "토요일 오전 9시부터 오후 1시까지 영업하므로 토요일 오전 11시에 엽니다.",
    "why_en": "The pharmacy is open on Saturday morning from 9 AM to 1 PM."
  },
  {
    "id": "eps-r-034",
    "sec": "reading",
    "type": "sign",
    "topic": "culture",
    "passage": "[기숙사 분리배출 안내]\n- 월요일·목요일: 재활용품 (캔, 병, 플라스틱, 종이)\n- 화요일·금요일: 일반 쓰레기 (종량제 봉투)",
    "question": "재활용 쓰레기를 버릴 수 있는 요일은 언제입니까?",
    "options": [
      "화요일, 수요일",
      "금요일, 토요일",
      "토요일, 일요일",
      "월요일, 목요일"
    ],
    "answer": 3,
    "why": "재활용품은 월요일과 목요일에 배출하도록 안내되어 있습니다.",
    "why_en": "Recyclables are collected on Mondays and Thursdays."
  },
  {
    "id": "eps-r-035",
    "sec": "reading",
    "type": "sign",
    "topic": "safety",
    "passage": "[비상구 및 비상계단]\n화재 발생 시 엘리베이터를 타지 말고 비상계단을 이용하여 지상으로 대피하십시오.",
    "question": "불이 났을 때 대피하는 올바른 방법은 무엇입니까?",
    "options": [
      "비상계단으로 걸어서 내려갑니다.",
      "엘리베이터를 타고 신속히 이동합니다.",
      "옥상으로 올라가 문을 잠급니다.",
      "기숙사 방 안에서 숨어 있습니다."
    ],
    "answer": 0,
    "why": "화재 시 승강기 탑승은 위험하므로 비상계단으로 대피해야 합니다.",
    "why_en": "Evacuate using emergency stairs, never elevators during a fire."
  },
  {
    "id": "eps-r-036",
    "sec": "reading",
    "type": "sign",
    "topic": "culture",
    "passage": "[안전 경고] 드릴 및 선반 등 회전 기계 작업 시 면장갑 착용 절대 금지!\n장갑이 회전체에 말려 들어갈 위험이 있습니다.",
    "question": "회전 기계 작업 시 면장갑을 끼면 안 되는 이유는 무엇입니까?",
    "options": [
      "손에 땀이 많이 나서",
      "장갑이 기계에 말려 들어갈 수 있어서",
      "기계에 기름이 묻어서",
      "제품에 흠집이 생겨서"
    ],
    "answer": 1,
    "why": "장갑 천이 회전축에 끼어 손가락이 말려 들어갈 위험이 있기 때문입니다.",
    "why_en": "Gloves can get caught in rotating machine parts, causing severe injuries."
  },
  {
    "id": "eps-r-037",
    "sec": "reading",
    "type": "sign",
    "topic": "daily",
    "passage": "[외국인력지원센터 한국어 주말반]\n- 교육 기간: 10월 5일 ~ 12월 21일 (매주 일요일)\n- 수업 시간: 14:00 ~ 17:00\n- 교육비: 전액 무료",
    "question": "이 한국어 교육 프로그램의 특징은 무엇입니까?",
    "options": [
      "평일 야간에 수업합니다.",
      "매달 수업료를 내야 합니다.",
      "교육비가 전액 무료입니다.",
      "토요일 오전에 진행합니다."
    ],
    "answer": 2,
    "why": "안내문에 교육비가 전액 무료라고 명시되어 있습니다.",
    "why_en": "The Korean language weekend program is completely free of charge."
  },
  {
    "id": "eps-r-038",
    "sec": "reading",
    "type": "sign",
    "topic": "safety",
    "passage": "[탑승 금지] 지게차 포크나 화물 적재대에는 절대 사람을 태우고 운행하지 마십시오.",
    "question": "이 표지판이 금지하는 위험 행동은 무엇입니까?",
    "options": [
      "지게차로 화물을 나르는 것",
      "지게차를 천천히 운전하는 것",
      "지게차에 안전벨트를 매는 것",
      "지게차 짐칸에 사람이 타는 것"
    ],
    "answer": 3,
    "why": "지게차 짐칸이나 포크에 탑승하면 추락 사고가 발생하므로 탑승이 금지됩니다.",
    "why_en": "Riding on the forklift fork or cargo bed is strictly prohibited."
  },
  {
    "id": "eps-r-039",
    "sec": "reading",
    "type": "text",
    "topic": "work",
    "passage": "[9월 급여 명세 요약]\n- 기본급: 2,060,740원\n- 연장근로수당: 350,000원\n- 공제 총액(세금 및 4대보험): 220,000원\n- 차인지급액(실수령액): 2,190,740원",
    "question": "이번 달 근로자의 통장에 실제로 입금되는 금액은 얼마입니까?",
    "options": [
      "2,190,740원",
      "2,060,740원",
      "350,000원",
      "220,000원"
    ],
    "answer": 0,
    "why": "공제 총액을 뺀 후 실제로 입금되는 실수령액은 2,190,740원입니다.",
    "why_en": "The net salary actually deposited after deductions is 2,190,740 KRW."
  },
  {
    "id": "eps-r-040",
    "sec": "reading",
    "type": "text",
    "topic": "work",
    "passage": "뚜안 씨, 오늘 오후 2시에 출하할 부품 40상자를 트럭에 적재해야 합니다. 점심 식사 후 1시 30분까지 2번 창고 앞으로 와 주십시오. - 생산과 김 반장",
    "question": "뚜안 씨가 1시 30분까지 가야 할 장소는 어디입니까?",
    "options": [
      "직원 식당 앞",
      "2번 창고 앞",
      "공장 정문 앞",
      "본관 사무실 앞"
    ],
    "answer": 1,
    "why": "반장의 메시지에서 「1시 30분까지 2번 창고 앞으로 와 주십시오」라고 요청했습니다.",
    "why_en": "The supervisor asked Tuan to report to Warehouse No. 2 by 1:30 PM."
  },
  {
    "id": "eps-r-041",
    "sec": "reading",
    "type": "text",
    "topic": "safety",
    "passage": "용접 작업 중에는 고열의 불꽃과 강한 빛이 발생합니다. 눈과 얼굴을 보호하려면 차광 보안면을 써야 하며, 손에는 열에 강한 가죽 장갑을 착용해야 화상을 막을 수 있습니다.",
    "question": "용접 작업 시 눈과 얼굴을 보호하기 위해 쓰는 장비는 무엇입니까?",
    "options": [
      "안전화",
      "방진마스크",
      "차광 보안면",
      "면장갑"
    ],
    "answer": 2,
    "why": "용접 시 눈과 얼굴 보호를 위해 차광 보안면을 착용해야 합니다.",
    "why_en": "A welding face shield ('차광' '보안면') protects the eyes and face from intense radiation."
  },
  {
    "id": "eps-r-042",
    "sec": "reading",
    "type": "text",
    "topic": "culture",
    "passage": "한국의 대표적인 명절인 추석에는 온 가족이 모여 한 해 농사의 수확을 감사하며 햅쌀로 빚은 송편을 나누어 먹습니다. 또한 조상님께 차례를 올리고 성묘를 갑니다.",
    "question": "추석에 가족들과 함께 만들어 먹는 전통 음식은 무엇입니까?",
    "options": [
      "떡국",
      "삼계탕",
      "냉면",
      "송편"
    ],
    "answer": 3,
    "why": "추석 명절의 대표적인 전통 음식은 송편입니다.",
    "why_en": "Songpyeon ('송편') is the half-moon rice cake traditionally eaten on Chuseok."
  },
  {
    "id": "eps-r-043",
    "sec": "reading",
    "type": "text",
    "topic": "daily",
    "passage": "라주 씨는 며칠 전부터 목이 아프고 기침이 심했습니다. 어제 퇴근 후 내과에 가서 진료를 받고 약을 지어 먹었더니 오늘은 몸이 훨씬 가벼워졌습니다.",
    "question": "라주 씨가 어제 병원에 다녀온 이유는 무엇입니까?",
    "options": [
      "몸이 아파서",
      "친구 병문안을 가려고",
      "예방접종을 맞으려고",
      "건강검진 날짜를 잡으려고"
    ],
    "answer": 0,
    "why": "목이 아프고 기침 증상이 있어 치료를 받기 위해 병원에 갔습니다.",
    "why_en": "Raju visited the internal medicine clinic because he felt sick with a sore throat."
  },
  {
    "id": "eps-r-044",
    "sec": "reading",
    "type": "text",
    "topic": "work",
    "passage": "[연차 유급휴가 신청 절차]\n휴가를 사용하려는 근로자는 휴가 시작일 최소 3일 전까지 부서 관리자에게 구두로 보고하고, 사내 양식에 맞춰 휴가 신청서를 총무과에 제출해야 합니다.",
    "question": "휴가를 신청할 때 가장 먼저 해야 할 일은 무엇입니까?",
    "options": [
      "총무과에 신청서를 냅니다.",
      "부서 관리자에게 먼저 보고합니다.",
      "휴가 날짜에 출근하지 않습니다.",
      "동료에게 업무 인계를 마칩니다."
    ],
    "answer": 1,
    "why": "신청서 제출 전 최소 3일 전까지 부서 관리자에게 구두 보고를 먼저 해야 합니다.",
    "why_en": "Workers must first verbally inform their department manager before submitting forms."
  },
  {
    "id": "eps-r-045",
    "sec": "reading",
    "type": "text",
    "topic": "culture",
    "passage": "한국 직장의 회식 문화는 동료들과 식사를 하며 유대감을 다지는 중요한 자리입니다. 어른이나 직장 상사가 술이나 음료를 따라 줄 때는 잔을 두 손으로 잡고 공손히 받는 것이 예절입니다.",
    "question": "직장 상사가 음료를 따라 줄 때 지켜야 할 올바른 예절은 무엇입니까?",
    "options": [
      "한 손으로 잔을 잡습니다.",
      "탁자에 잔을 내려놓습니다.",
      "두 손으로 잔을 받습니다.",
      "고개를 똑바로 들고 마십니다."
    ],
    "answer": 2,
    "why": "어른이나 직장 상사로부터 음료를 받을 때는 공경의 뜻으로 두 손으로 잔을 받습니다.",
    "why_en": "Polite dining manners require receiving poured beverages with both hands from superiors."
  },
  {
    "id": "eps-r-046",
    "sec": "reading",
    "type": "text",
    "topic": "daily",
    "passage": "[외국인 기숙사 관리 규칙]\n쾌적한 공동생활을 위해 실내 금연을 준수해 주십시오. 화재 위험이 있는 전열기구는 방에서 사용할 수 없으며, 야간 11시 이후에는 세탁기 사용과 고성방가를 금지합니다.",
    "question": "기숙사 방 안에서 금지된 행동은 무엇입니까?",
    "options": [
      "책을 읽는 것",
      "음악을 조용히 듣는 것",
      "친구와 대화하는 것",
      "방 안에서 전기난로를 쓰는 것"
    ],
    "answer": 3,
    "why": "화재 예방을 위해 방 안에서 전열기구(전기난로 등) 사용이 엄격히 금지됩니다.",
    "why_en": "Operating heating appliances like electric heaters inside dormitory rooms is banned."
  },
  {
    "id": "eps-r-047",
    "sec": "reading",
    "type": "text",
    "topic": "safety",
    "passage": "화재가 발생했을 때는 젖은 수건으로 코와 입을 막아 유독가스 흡입을 피해야 합니다. 연기는 위로 올라가므로 자세를 최대한 낮추고 벽을 짚으며 유도등을 따라 비상구로 신속히 탈출하십시오.",
    "question": "화재 대피 시 연기를 피하는 올바른 행동은 무엇입니까?",
    "options": [
      "젖은 수건으로 코와 입을 가립니다.",
      "서서 빠르게 뛰어갑니다.",
      "숨을 깊이 들이마십니다.",
      "엘리베이터를 부릅니다."
    ],
    "answer": 0,
    "why": "유독가스 흡입을 막기 위해 젖은 수건으로 호흡기를 가리고 몸을 낮춥니다.",
    "why_en": "Cover your nose and mouth with a wet towel and crawl low under smoke."
  },
  {
    "id": "eps-r-048",
    "sec": "reading",
    "type": "text",
    "topic": "work",
    "passage": "아궁 씨는 부품 제조 공장에서 포장 업무를 담당합니다. 출근하면 가장 먼저 탈의실에서 작업복과 안전화를 착용합니다. 그 후 게시판의 생산 목표를 확인하고 자재를 준비합니다.",
    "question": "아궁 씨가 출근한 직후 가장 먼저 하는 일은 무엇입니까?",
    "options": [
      "기계를 점검합니다.",
      "작업복과 안전화로 갈아입습니다.",
      "부품을 포장합니다.",
      "상자를 트럭에 싣습니다."
    ],
    "answer": 1,
    "why": "출근 후 제일 먼저 작업복과 안전화를 갈아입는다고 설명되어 있습니다.",
    "why_en": "Agung changes into his work clothes and safety boots first upon arrival."
  },
  {
    "id": "eps-r-049",
    "sec": "reading",
    "type": "text",
    "topic": "daily",
    "passage": "대한민국에 90일을 초과하여 체류하려는 외국인은 입국한 날부터 90일 이내에 관할 출입국·외국인관서에 방문하여 외국인등록을 해야 합니다. 외국인등록증은 한국 생활에서 공식 신분증 역할을 합니다.",
    "question": "외국인등록증은 입국 후 얼마 이내에 신청해야 합니까?",
    "options": [
      "30일 이내",
      "60일 이내",
      "90일 이내",
      "180일 이내"
    ],
    "answer": 2,
    "why": "입국일로부터 90일 이내에 관할 기관에 등록해야 합니다.",
    "why_en": "Alien registration must be completed within 90 days of arriving in South Korea."
  },
  {
    "id": "eps-r-050",
    "sec": "reading",
    "type": "text",
    "topic": "culture",
    "passage": "새해 첫날 설날 아침에는 떡국을 먹고 집안 어른들께 큰절로 세배를 올립니다. 세배를 받은 어른들은 올 한 해 건강하고 일이 잘되기를 바라는 따뜻한 덕담을 건넵니다.",
    "question": "설날에 세배를 마친 후 어른들이 건네는 좋은 말을 무엇이라고 합니까?",
    "options": [
      "인사",
      "부탁",
      "안내",
      "덕담"
    ],
    "answer": 3,
    "why": "새해 세배 후 잘되기를 바라며 건네는 축복의 말을 덕담이라고 부릅니다.",
    "why_en": "Benevolent well-wishing words given by elders on New Year are called '덕담'."
  },
  {
    "id": "eps-l-001",
    "sec": "listening",
    "type": "pic",
    "topic": "safety",
    "pic": "🚭",
    "script": [
      "여: 이곳은 담배를 피울 수 없는 구역입니다."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "금연",
      "주차 금지",
      "보행 금지",
      "음식물 반입 금지"
    ],
    "answer": 0,
    "why": "담배를 피울 수 없는 구역을 알리는 표지는 금연입니다.",
    "why_en": "The sign prohibiting smoking is '금연' (No Smoking)."
  },
  {
    "id": "eps-l-002",
    "sec": "listening",
    "type": "pic",
    "topic": "safety",
    "pic": "⚠️",
    "script": [
      "남: 공사 중이라 위험하니 발밑을 주의하십시오."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "안전 통행",
      "위험 주의",
      "출입 가능",
      "비상 대피"
    ],
    "answer": 1,
    "why": "위험한 장소에서 주의를 당부하는 표지는 위험 주의 표지입니다.",
    "why_en": "The triangle warning symbol denotes danger and caution ('위험' '주의')."
  },
  {
    "id": "eps-l-003",
    "sec": "listening",
    "type": "pic",
    "topic": "work",
    "pic": "✂️",
    "script": [
      "여: 포장 끈을 가위로 잘라 주세요."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "칼",
      "풀",
      "가위",
      "자"
    ],
    "answer": 2,
    "why": "끈이나 얇은 판을 자르는 데 쓰는 도구는 가위입니다.",
    "why_en": "Scissors ('가위') are used to cut strings or packing bands."
  },
  {
    "id": "eps-l-004",
    "sec": "listening",
    "type": "pic",
    "topic": "daily",
    "pic": "☕",
    "script": [
      "남: 점심 식사 후에 따뜻한 커피를 한잔 마셨어요."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "물",
      "우유",
      "주스",
      "커피"
    ],
    "answer": 3,
    "why": "식사 후에 마신 따뜻한 음료는 커피입니다.",
    "why_en": "The beverage mentioned in the sentence is coffee ('커피')."
  },
  {
    "id": "eps-l-005",
    "sec": "listening",
    "type": "pic",
    "topic": "work",
    "pic": "🪜",
    "script": [
      "남: 높은 곳에 있는 전등을 교체하려면 사다리가 필요해요."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "사다리",
      "의자",
      "상자",
      "책상"
    ],
    "answer": 0,
    "why": "높은 곳에 올라가 작업할 때 디딤대로 쓰는 도구는 사다리입니다.",
    "why_en": "A ladder ('사다리') is used to reach elevated fixtures like light bulbs."
  },
  {
    "id": "eps-l-006",
    "sec": "listening",
    "type": "pic",
    "topic": "safety",
    "pic": "🥽",
    "script": [
      "여: 쇠를 깎을 때는 파편이 튈 수 있으니 보안경을 착용하세요."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "안전모",
      "보안경",
      "귀마개",
      "안전대"
    ],
    "answer": 1,
    "why": "눈으로 이물질이 날아드는 것을 막는 보호 안경은 보안경입니다.",
    "why_en": "Protective goggles ('보안경') shield eyes against flying chips."
  },
  {
    "id": "eps-l-007",
    "sec": "listening",
    "type": "pic",
    "topic": "daily",
    "pic": "🚇",
    "script": [
      "남: 퇴근 시간에는 도로가 너무 혼잡해서 지하철을 탔어요."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "택시",
      "비행기",
      "지하철",
      "오토바이"
    ],
    "answer": 2,
    "why": "혼잡한 도로 대신 지하 선로를 이용해 이동한 교통수단은 지하철입니다.",
    "why_en": "The speaker chose the underground metro subway ('지하철')."
  },
  {
    "id": "eps-l-008",
    "sec": "listening",
    "type": "pic",
    "topic": "culture",
    "pic": "🍲",
    "script": [
      "여: 추운 겨울철에는 따뜻한 국물이 있는 찌개가 인기 있어요."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "비빔밥",
      "김밥",
      "불고기",
      "찌개"
    ],
    "answer": 3,
    "why": "뚝배기에 고기, 채소 등을 넣고 얼큰하게 끓인 국물 요리는 찌개입니다.",
    "why_en": "Jjigae ('찌개') is a hot stew widely enjoyed in cold weather."
  },
  {
    "id": "eps-l-009",
    "sec": "listening",
    "type": "pic",
    "topic": "work",
    "pic": "📦",
    "script": [
      "남: 검수가 끝난 제품을 상자에 넣고 테이프로 포장했습니다."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "포장",
      "운반",
      "세척",
      "폐기"
    ],
    "answer": 0,
    "why": "상자에 담아 테이프를 붙여 출하 준비를 하는 작업은 포장입니다.",
    "why_en": "Boxing and taping finished products refers to packaging ('포장')."
  },
  {
    "id": "eps-l-010",
    "sec": "listening",
    "type": "pic",
    "topic": "safety",
    "pic": "🧯",
    "script": [
      "여: 작업장 한구석에 소화기가 잘 비치되어 있습니다."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "구급함",
      "소화기",
      "비상벨",
      "손전등"
    ],
    "answer": 1,
    "why": "초기 진화를 위해 작업장에 놓아두는 빨간 소방 기구는 소화기입니다.",
    "why_en": "The emergency firefighting apparatus mentioned is a fire extinguisher ('소화기')."
  },
  {
    "id": "eps-l-011",
    "sec": "listening",
    "type": "pic",
    "topic": "daily",
    "pic": "🏥",
    "script": [
      "남: 팔을 다쳐서 의사 선생님께 진료를 받으러 병원에 갔습니다."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "약국",
      "은행",
      "병원",
      "우체국"
    ],
    "answer": 2,
    "why": "의사에게 다친 부위를 진찰받고 치료하는 의료 기관은 병원입니다.",
    "why_en": "The medical facility for doctor consultations is a hospital or clinic ('병원')."
  },
  {
    "id": "eps-l-012",
    "sec": "listening",
    "type": "pic",
    "topic": "daily",
    "pic": "🧹",
    "script": [
      "여: 퇴근하기 전에 바닥에 떨어진 먼지를 깨끗하게 청소합시다."
    ],
    "question": "들려주는 내용과 관계있는 그림을 고르십시오.",
    "options": [
      "식사",
      "휴식",
      "조립",
      "청소"
    ],
    "answer": 3,
    "why": "바닥의 먼지를 쓸고 닦는 행동은 청소입니다.",
    "why_en": "Sweeping dust off the floor before leaving is cleaning ('청소')."
  },
  {
    "id": "eps-l-013",
    "sec": "listening",
    "type": "reply",
    "topic": "daily",
    "script": [
      "남: 안녕하세요! 새로 입사한 뚜안입니다. 처음 뵙겠습니다."
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "반갑습니다. 저는 김민수입니다.",
      "안녕히 계세요. 내일 뵙겠습니다.",
      "수고하셨습니다. 먼저 가세요.",
      "아닙니다. 제가 직접 했습니다."
    ],
    "answer": 0,
    "why": "처음 만나는 인사말에는 「반갑습니다」로 화답하는 것이 자연스럽습니다.",
    "why_en": "To the first greeting, reply with 「반갑습니다」 (Pleased to meet you)."
  },
  {
    "id": "eps-l-014",
    "sec": "listening",
    "type": "reply",
    "topic": "work",
    "script": [
      "여: 지현 씨, 오늘 납품할 물량이 많은데 야근할 수 있어요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "네, 이미 퇴근했습니다.",
      "네, 오늘 2시간 정도 가능해요.",
      "아니요, 일찍 출근했습니다.",
      "아니요, 내일이 휴일입니다."
    ],
    "answer": 1,
    "why": "야근 가능 여부를 묻는 질문에는 가능한 시간으로 답하는 것이 적절합니다.",
    "why_en": "Confirming overtime work availability matches the supervisor query."
  },
  {
    "id": "eps-l-015",
    "sec": "listening",
    "type": "reply",
    "topic": "daily",
    "script": [
      "남: 수미 씨는 이번 주말에 쉬는 날 뭐 할 거예요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "지난주에 친구를 만났어요.",
      "어제 영화를 재미있게 봤어요.",
      "기숙사에서 밀린 빨래를 하려고 해요.",
      "작년에 한국에 입국했습니다."
    ],
    "answer": 2,
    "why": "이번 주말 계획을 묻는 질문에는 미래 계획을 나타내는 3번이 맞습니다.",
    "why_en": "Option 3 answers with plans for the upcoming weekend."
  },
  {
    "id": "eps-l-016",
    "sec": "listening",
    "type": "reply",
    "topic": "safety",
    "script": [
      "여: 아궁 씨, 작업장에 들어올 때 왜 안전모를 안 썼어요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "안전모가 아주 튼튼해요.",
      "어제 퇴근하고 샀습니다.",
      "안전화는 잘 신었습니다.",
      "죄송합니다. 깜빡 잊었는데 바로 쓰겠습니다."
    ],
    "answer": 3,
    "why": "안전모 미착용 지적에 사과하고 즉시 착용하겠다고 답하는 것이 올바릅니다.",
    "why_en": "Apologizing for forgetting and putting on the helmet immediately is correct."
  },
  {
    "id": "eps-l-017",
    "sec": "listening",
    "type": "reply",
    "topic": "work",
    "script": [
      "남: 반장님, 포장 완료된 이 완제품 상자들은 어디로 옮길까요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "저쪽 2번 적재 창고로 옮겨 놓으세요.",
      "어제 오전에 모두 조립했습니다.",
      "상자 크기가 생각보다 큽니다.",
      "지게차를 타고 공장 밖으로 가세요."
    ],
    "answer": 0,
    "why": "운반 장소를 묻는 질문에 적재 위치(2번 적재 창고)를 지시하는 대답이 맞습니다.",
    "why_en": "Directing the items to Warehouse 2 directly answers where to move them."
  },
  {
    "id": "eps-l-018",
    "sec": "listening",
    "type": "reply",
    "topic": "daily",
    "script": [
      "여: 라주 씨, 오늘 구내식당 점심 메뉴 맛있게 드셨어요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "지금 식사하러 가려고 해요.",
      "네, 불고기가 나와서 아주 맛있게 먹었어요.",
      "아니요, 저녁을 준비하고 있어요.",
      "내일 점심을 같이 먹어요."
    ],
    "answer": 1,
    "why": "점심 식사를 마쳤는지와 맛을 묻는 질문에 알맞은 과거 완료 응답입니다.",
    "why_en": "Option 2 answers whether the lunch was enjoyable."
  },
  {
    "id": "eps-l-019",
    "sec": "listening",
    "type": "reply",
    "topic": "culture",
    "script": [
      "남: 뚜안 씨, 한국 음식 중에 김치찌개처럼 매운 요리도 잘 먹어요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "한국 음식은 가격이 저렴해요.",
      "어제 저녁에 식당에서 먹었어요.",
      "처음에는 조금 매웠는데 지금은 아주 좋아해요.",
      "다음 주말에 요리를 배울 거예요."
    ],
    "answer": 2,
    "why": "매운 음식을 잘 먹는지 취향을 묻는 말에 적응하여 잘 먹는다고 답했습니다.",
    "why_en": "Option 3 answers regarding personal ability and taste for spicy dishes."
  },
  {
    "id": "eps-l-020",
    "sec": "listening",
    "type": "reply",
    "topic": "work",
    "script": [
      "여: 지현 씨, 절단 기계에서 이상한 소리가 나면서 덜컹거리는데 어쩌죠?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "소리를 무시하고 계속 자르세요.",
      "기계 속도를 더 빠르게 올리세요.",
      "퇴근 시간까지 그냥 두세요.",
      "빨리 비상정지 버튼을 누르고 반장님께 알리세요."
    ],
    "answer": 3,
    "why": "기계 이상 시 비상정지 버튼을 누르고 관리자에게 보고해야 안전합니다.",
    "why_en": "Immediately hit the emergency stop button and inform the manager upon abnormalities."
  },
  {
    "id": "eps-l-021",
    "sec": "listening",
    "type": "reply",
    "topic": "work",
    "script": [
      "남: 아궁 씨, 고용허가제로 한국 제조 공장에 온 지 얼마나 되었어요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "한국에 온 지 8개월 정도 되었습니다.",
      "한국어를 유창하게 하고 싶어요.",
      "인천공항으로 비행기를 탔습니다.",
      "기숙사에서 동료와 생활합니다."
    ],
    "answer": 0,
    "why": "체류 기간을 물었으므로 「8개월 정도 되었습니다」가 정확한 답변입니다.",
    "why_en": "Stating the duration of stay (about 8 months) answers the question directly."
  },
  {
    "id": "eps-l-022",
    "sec": "listening",
    "type": "reply",
    "topic": "daily",
    "script": [
      "여: 이 감기약은 식사를 마치고 30분 뒤에 하루 세 번 복용하세요."
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "약값이 얼마나 나왔나요?",
      "네, 복약 방법 설명해 주셔서 감사합니다.",
      "약국이 어디에 있습니까?",
      "어제부터 열이 조금 납니다."
    ],
    "answer": 1,
    "why": "약사의 복약 지도를 듣고 이해하며 감사 인사를 전하는 표현입니다.",
    "why_en": "Thanking the pharmacist for the usage instruction is the appropriate reply."
  },
  {
    "id": "eps-l-023",
    "sec": "listening",
    "type": "reply",
    "topic": "safety",
    "script": [
      "남: 높은 곳 전등 교체할 동안 사다리 아래를 꽉 잡아 줄 수 있어요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "사다리가 고장 났습니다.",
      "안전모를 벗고 올라가세요.",
      "네, 흔들리지 않게 두 손으로 잡고 있을게요.",
      "이미 작업을 다 마쳤습니다."
    ],
    "answer": 2,
    "why": "사다리를 안전하게 잡아 달라는 요청에 승낙하고 행동을 약속하는 대답입니다.",
    "why_en": "Agreeing to hold the ladder tightly with both hands ensures safety."
  },
  {
    "id": "eps-l-024",
    "sec": "listening",
    "type": "reply",
    "topic": "work",
    "script": [
      "여: 라주 씨, 오늘 오전 중에 배정된 부품 포장 작업은 다 끝났나요?"
    ],
    "question": "질문을 듣고 알맞은 대답을 고르십시오.",
    "options": [
      "내일 오전에 시작하겠습니다.",
      "작업복을 세탁실에 넣었습니다.",
      "식당에서 밥을 먹고 있습니다.",
      "네, 방금 마지막 상자까지 테이프를 다 붙였습니다."
    ],
    "answer": 3,
    "why": "작업 완료 여부를 물었으므로 마지막 상자까지 마쳤다고 답하는 것이 적절합니다.",
    "why_en": "Confirming that the final box was taped completes the assigned status inquiry."
  },
  {
    "id": "eps-l-025",
    "sec": "listening",
    "type": "talk",
    "topic": "daily",
    "script": [
      "남: 라주 씨, 내일 오전에 거래처로 납품할 상자들을 미리 포장해 두어야 해요.",
      "여: 네, 반장님. 1층 자재실에서 포장용 테이프와 완충재를 가져와 바로 시작하겠습니다."
    ],
    "question": "여자가 지금부터 할 작업은 무엇입니까?",
    "options": [
      "물품 포장하기",
      "트럭 운전하기",
      "공구 세척하기",
      "기계 도색하기"
    ],
    "answer": 0,
    "why": "납품할 상자를 포장하기 위해 자재를 가져와 시작하겠다고 했습니다.",
    "why_en": "The woman is starting the packaging of goods for delivery."
  },
  {
    "id": "eps-l-026",
    "sec": "listening",
    "type": "talk",
    "topic": "daily",
    "script": [
      "여: 민수 씨, 이번 주 일요일 오후에 외국인 동료들과 축구 모임이 있는데 같이 가실래요?",
      "남: 좋아요! 주말에 운동하고 싶었는데 몇 시에 어디로 가면 되나요?",
      "여: 일요일 오후 3시까지 시민체육공원 축구장으로 오시면 돼요."
    ],
    "question": "두 사람은 이번 주 일요일에 무엇을 하기로 했습니까?",
    "options": [
      "영화 관람",
      "축구 경기",
      "도서관 방문",
      "자전거 여행"
    ],
    "answer": 1,
    "why": "일요일 오후에 시민체육공원에서 축구를 하기로 약속했습니다.",
    "why_en": "The speakers planned to play soccer on Sunday afternoon."
  },
  {
    "id": "eps-l-027",
    "sec": "listening",
    "type": "talk",
    "topic": "safety",
    "script": [
      "남: 반장님, 바닥에 물청소 후 물기가 많이 남아 있어서 미끄럽습니다.",
      "여: 그렇네요. 미끄러져서 넘어질 수 있으니 마른걸레를 가져와서 깨끗이 닦아 냅시다."
    ],
    "question": "두 사람이 지금 할 행동은 무엇입니까?",
    "options": [
      "바닥에 물을 뿌린다.",
      "청소 도구를 버린다.",
      "마른걸레로 물기를 닦는다.",
      "작업장을 나간다."
    ],
    "answer": 2,
    "why": "미끄럼 사고를 방지하기 위해 마른걸레로 물기를 닦기로 했습니다.",
    "why_en": "They will wipe the wet floor dry with a mop to prevent slip accidents."
  },
  {
    "id": "eps-l-028",
    "sec": "listening",
    "type": "talk",
    "topic": "work",
    "script": [
      "여: 뚜안 씨, 지난달 급여 명세서 확인해 보셨어요?",
      "남: 네, 그런데 주말에 특근했던 수당이 계산에서 빠진 것 같아요.",
      "여: 그래요? 그럼 총무과 담당자님께 급여 내역서를 보여드리고 확인해 보세요."
    ],
    "question": "남자가 총무과에 가려는 이유는 무엇입니까?",
    "options": [
      "기숙사를 바꾸려고",
      "휴가를 신청하려고",
      "퇴직금을 정산하려고",
      "특근 수당을 확인하려고"
    ],
    "answer": 3,
    "why": "주말 특근 수당이 누락된 것 같아 이를 확인하러 총무과에 갑니다.",
    "why_en": "The man intends to verify his missing weekend overtime allowance."
  },
  {
    "id": "eps-l-029",
    "sec": "listening",
    "type": "talk",
    "topic": "daily",
    "script": [
      "남: 어서 오세요. 어디가 불편해서 오셨나요?",
      "여: 어제 회식하고 나서 소화가 안 되고 속이 계속 더부룩해요.",
      "남: 소화제 알약과 위장약을 드릴 테니 식후에 물과 함께 복용하세요."
    ],
    "question": "이 대화가 이루어지는 장소는 어디입니까?",
    "options": [
      "약국",
      "은행",
      "식당",
      "우체국"
    ],
    "answer": 0,
    "why": "소화불량 증상을 듣고 소화제 알약을 지어 주는 곳은 약국입니다.",
    "why_en": "The conversation takes place at a pharmacy where medicine is dispensed."
  },
  {
    "id": "eps-l-030",
    "sec": "listening",
    "type": "talk",
    "topic": "safety",
    "script": [
      "여: 도색 작업장 안에는 페인트 유기용제 냄새가 독하니까 방독마스크를 꼭 착용하세요.",
      "남: 네, 알겠습니다. 그리고 공기 순환을 위해 환풍기도 바로 가동하겠습니다."
    ],
    "question": "남자가 지금 바로 할 일은 무엇입니까?",
    "options": [
      "조명을 끈다.",
      "환풍기를 켠다.",
      "창문을 닫는다.",
      "도색을 멈춘다."
    ],
    "answer": 1,
    "why": "유해 냄새를 배출하기 위해 환풍기를 가동하겠다고 말했습니다.",
    "why_en": "The man will turn on the exhaust fan to circulate clean air."
  },
  {
    "id": "eps-l-031",
    "sec": "listening",
    "type": "talk",
    "topic": "culture",
    "script": [
      "남: 한국 지하철 전동차 안에서는 노약자석에 젊은 승객이 앉지 않나요?",
      "여: 네, 노약자석은 어르신이나 임산부, 장애인을 배려해 항상 비워 두는 문화가 있습니다."
    ],
    "question": "한국 지하철의 노약자석 이용 예절로 올바른 것은 무엇입니까?",
    "options": [
      "누구나 먼저 앉으면 된다.",
      "항상 가방을 올려 둔다.",
      "교통약자를 위해 비워 둔다.",
      "청소년 전용 좌석이다."
    ],
    "answer": 2,
    "why": "노약자석은 어르신이나 임산부 등 교통약자를 위해 비워 두는 자리입니다.",
    "why_en": "Reserved seating on subways is kept vacant for mobility-impaired passengers."
  },
  {
    "id": "eps-l-032",
    "sec": "listening",
    "type": "talk",
    "topic": "work",
    "script": [
      "여: 지현 씨, 오늘 출하할 박스에 넣은 나사못 수량을 확인했나요?",
      "남: 네, 한 상자에 정확히 300개씩 포장하여 총 10상자 준비를 마쳤습니다.",
      "여: 꼼꼼하게 잘 챙겨 주셨네요. 수고하셨어요."
    ],
    "question": "한 상자에 들어간 나사못은 몇 개입니까?",
    "options": [
      "100개",
      "200개",
      "250개",
      "300개"
    ],
    "answer": 3,
    "why": "대화에서 한 상자에 정확히 300개씩 포장했다고 언급했습니다.",
    "why_en": "The dialogue specifically stated each box contains 300 screws."
  },
  {
    "id": "eps-l-033",
    "sec": "listening",
    "type": "talk",
    "topic": "safety",
    "script": [
      "남: 3미터 높이의 작업대 위로 올라갈 때는 안전대를 안전난간 줄에 걸어야 합니다.",
      "여: 네, 반장님. 추락 방지용 안전대 걸쇠를 단단히 체결하고 작업하겠습니다."
    ],
    "question": "여자가 높은 곳에서 일할 때 착용하는 보호구는 무엇입니까?",
    "options": [
      "안전대",
      "귀마개",
      "용접면",
      "방진마스크"
    ],
    "answer": 0,
    "why": "고소 작업 시 추락을 방지하기 위해 착용하는 장비는 안전대입니다.",
    "why_en": "A safety harness ('안전대') prevents fatal falls during elevated work."
  },
  {
    "id": "eps-l-034",
    "sec": "listening",
    "type": "talk",
    "topic": "daily",
    "script": [
      "여: 안녕하세요. 외국인등록증 주소지 변경 신고를 하러 왔습니다.",
      "남: 네, 체류지 변경 신고서와 임대차 계약서를 작성하셔서 3번 창구에 제출하세요."
    ],
    "question": "여자가 서류를 제출해야 할 창구는 어디입니까?",
    "options": [
      "1번 창구",
      "3번 창구",
      "4번 창구",
      "5번 창구"
    ],
    "answer": 1,
    "why": "신고서와 계약서를 3번 창구로 제출하라고 안내했습니다.",
    "why_en": "The clerk instructed the woman to submit her documents to counter 3."
  },
  {
    "id": "eps-l-035",
    "sec": "listening",
    "type": "talk",
    "topic": "work",
    "script": [
      "남: 이번 연휴에 고향 가족들을 만나러 베트남에 다녀오려고 합니다.",
      "여: 정말 좋으시겠어요! 관리자 서명받은 재입국 휴가원은 미리 내셨나요?",
      "남: 네, 지난주에 총무과에 승인 서류를 모두 제출했습니다."
    ],
    "question": "남자가 연휴 기간에 할 일은 무엇입니까?",
    "options": [
      "기숙사 대청소",
      "공장 특근 근무",
      "고향 가족 방문",
      "한국어 시험 준비"
    ],
    "answer": 2,
    "why": "연휴에 고향 베트남에 가서 가족들을 만나고 오겠다고 했습니다.",
    "why_en": "The man plans to visit his family in his home country during the vacation."
  },
  {
    "id": "eps-l-036",
    "sec": "listening",
    "type": "talk",
    "topic": "culture",
    "script": [
      "여: 용접 불꽃이 튀는 자리 바로 옆에 페인트 신나 통이 놓여 있어요!",
      "남: 어이쿠, 화재가 발생할 수 있으니 당장 위험물 보관함으로 옮기겠습니다."
    ],
    "question": "남자가 인화물 통을 즉시 치우는 이유는 무엇입니까?",
    "options": [
      "작업 공간이 좁아서",
      "도료가 굳을까 봐",
      "냄새가 지독해서",
      "불이 날 수 있어서"
    ],
    "answer": 3,
    "why": "용접 불꽃으로 인한 화재 위험을 방지하기 위해 치웁니다.",
    "why_en": "Flammable thinners must be moved away from welding sparks to prevent fire."
  },
  {
    "id": "eps-l-037",
    "sec": "listening",
    "type": "talk",
    "topic": "culture",
    "script": [
      "남: 한국 친구의 집에 초대받았는데 주의할 예절이 있나요?",
      "여: 현관에서 반드시 신발을 벗고 들어가야 하며, 어른께 두 손으로 인사드리면 좋습니다."
    ],
    "question": "한국 가정집에 들어갈 때 지켜야 할 기본 예절은 무엇입니까?",
    "options": [
      "신발을 신고 방에 들어간다.",
      "외투를 현관 바닥에 둔다.",
      "현관에서 신발을 벗고 들어간다.",
      "모자를 쓴 채로 인사한다."
    ],
    "answer": 2,
    "why": "한국의 주거 문화는 온돌식이라 현관에서 신발을 벗고 실내로 들어갑니다.",
    "why_en": "Koreans always take off outdoor shoes at the entryway when entering a home."
  },
  {
    "id": "eps-l-038",
    "sec": "listening",
    "type": "talk",
    "topic": "work",
    "script": [
      "여: 아궁 씨, 무거운 짐을 지게차로 나르려면 면허가 있어야 하지 않나요?",
      "남: 네, 그래서 지난달에 한국산업인력공단에서 지게차 운전 자격증을 취득했습니다."
    ],
    "question": "남자가 지난달에 취득한 자격증은 무엇입니까?",
    "options": [
      "대형 버스 면허",
      "전기 용접 자격증",
      "배관 기능사",
      "지게차 운전 자격증"
    ],
    "answer": 3,
    "why": "남자는 지난달에 지게차 운전 자격증을 취득했다고 말했습니다.",
    "why_en": "The man obtained his forklift driving license ('지게차' '운전' '자격증') last month."
  },
  {
    "id": "eps-l-039",
    "sec": "listening",
    "type": "notice",
    "topic": "work",
    "script": [
      "안내: 공장 직원 여러분께 안내 말씀 드립니다. 오늘 오후 4시부터 전 사원 정기 소방 안전 교육이 본관 2층 대강당에서 진행되오니 한 분도 빠짐없이 참석해 주시기 바랍니다."
    ],
    "question": "안전 교육이 열리는 장소는 어디입니까?",
    "options": [
      "운동장",
      "기숙사 식당",
      "본관 2층 대강당",
      "1공장 작업실"
    ],
    "answer": 2,
    "why": "안내 방송에서 소방 안전 교육이 본관 2층 대강당에서 열린다고 밝혔습니다.",
    "why_en": "The training takes place in the main building 2nd-floor auditorium."
  },
  {
    "id": "eps-l-040",
    "sec": "listening",
    "type": "notice",
    "topic": "daily",
    "script": [
      "안내: 이번 역은 신도림, 신도림역입니다. 내리실 문은 오른쪽입니다. 1호선 인천이나 수원 방면으로 갈아타실 고객께서는 이번 역에서 환승하시기 바랍니다."
    ],
    "question": "이 열차가 지금 도착하는 지하철역은 어디입니까?",
    "options": [
      "서울역",
      "시청역",
      "강남역",
      "신도림역"
    ],
    "answer": 3,
    "why": "안내 방송에서 이번 역은 신도림역이라고 명확히 전달했습니다.",
    "why_en": "The train announcement identifies the current stop as Sindorim Station."
  },
  {
    "id": "eps-l-041",
    "sec": "listening",
    "type": "notice",
    "topic": "safety",
    "script": [
      "안내: 생산관리실에서 긴급 공지합니다. 제2라인 컨베이어 벨트 모터 수리 작업 중이므로 라인 전원을 차단했습니다. 수리가 끝날 때까지 임의로 스위치를 켜지 마십시오."
    ],
    "question": "작업자가 지켜야 할 주의사항은 무엇입니까?",
    "options": [
      "임의로 전원 스위치를 켜지 않는다.",
      "기계 속도를 높인다.",
      "작업장 밖으로 대피한다.",
      "컨베이어 벨트에 올라탄다."
    ],
    "answer": 0,
    "why": "수리 중 감전이나 기계 사고를 방지하기 위해 스위치를 임의로 켜지 말라고 지시했습니다.",
    "why_en": "Workers are instructed not to turn on the power switch arbitrarily during maintenance."
  },
  {
    "id": "eps-l-042",
    "sec": "listening",
    "type": "notice",
    "topic": "work",
    "script": [
      "안내: 총무부에서 알립니다. 이번 주 금요일은 당사 창립기념일 휴무로 전 공장 가동을 중단합니다. 모든 직원은 출근하지 않고 휴식을 취하시기 바랍니다."
    ],
    "question": "이번 주 금요일에 출근하지 않는 이유는 무엇입니까?",
    "options": [
      "기계가 침수되어서",
      "회사 창립기념일이라서",
      "원자재 배송이 늦어져서",
      "태풍 피해가 심해서"
    ],
    "answer": 1,
    "why": "회사 창립기념일로 지정된 사내 휴무일이기 때문입니다.",
    "why_en": "Work is off on Friday due to the company founding anniversary."
  },
  {
    "id": "eps-l-043",
    "sec": "listening",
    "type": "notice",
    "topic": "daily",
    "script": [
      "안내: 고객 여러분 안녕하십니까. 저희 대형마트의 마감 시간은 밤 10시입니다. 아직 쇼핑 중이신 분들은 물품을 고르신 후 1층 계산대로 이동해 주시기 바랍니다."
    ],
    "question": "이 마트의 영업 종료 시각은 언제입니까?",
    "options": [
      "저녁 8시",
      "저녁 9시",
      "밤 10시",
      "밤 11시"
    ],
    "answer": 2,
    "why": "마트 마감 시간은 밤 10시라고 방송했습니다.",
    "why_en": "The supermarket closes at 10:00 PM."
  },
  {
    "id": "eps-l-044",
    "sec": "listening",
    "type": "notice",
    "topic": "safety",
    "script": [
      "안내: 안전관리팀 안내 방송입니다. 오늘 밤 강풍을 동반한 폭우가 예상됩니다. 외부 자재 적재장의 방수포를 단단히 고정하고 옥외 크레인 작업을 전면 중단하십시오."
    ],
    "question": "강풍에 대비하여 옥외에서 해야 할 조치는 무엇입니까?",
    "options": [
      "크레인 작업을 재촉한다.",
      "외부 조명을 더 켠다.",
      "창문을 열어 둔다.",
      "자재 방수포를 단단히 묶는다."
    ],
    "answer": 3,
    "why": "강풍 피해 방지를 위해 야외 자재의 방수포를 단단히 묶어 고정해야 합니다.",
    "why_en": "Tarpaulins over outdoor materials must be tied down tightly against storm winds."
  },
  {
    "id": "eps-l-045",
    "sec": "listening",
    "type": "notice",
    "topic": "work",
    "script": [
      "안내: 사우회에서 전달합니다. 추석 연휴 귀향 버스를 이용하실 근로자께서는 오늘 오후 5시까지 복지과로 신청서를 제출해 주시기 바랍니다."
    ],
    "question": "귀향 버스 신청서를 제출해야 하는 곳은 어디입니까?",
    "options": [
      "복지과",
      "기숙사 사감실",
      "정문 수위실",
      "구내식당 카운터"
    ],
    "answer": 0,
    "why": "오후 5시까지 복지과로 신청서를 접수하라고 안내했습니다.",
    "why_en": "Homebound holiday bus applications must be submitted to the Welfare Department ('복지과')."
  },
  {
    "id": "eps-l-046",
    "sec": "listening",
    "type": "notice",
    "topic": "culture",
    "script": [
      "안내: 지역 주민센터에서 안내 말씀 드립니다. 오늘 저녁 7시 복지관 강당에서 외국인 이웃과 함께하는 김장 담그기 체험 행사가 개최됩니다. 많은 관심 바랍니다."
    ],
    "question": "오늘 저녁에 열리는 문화 체험 행사는 무엇입니까?",
    "options": [
      "민속 씨름 대회",
      "김장 담그기 체험",
      "풍물놀이 공연",
      "도자기 만들기"
    ],
    "answer": 1,
    "why": "외국인 이웃과 함께하는 김장 담그기 체험 행사가 열립니다.",
    "why_en": "The evening cultural program is a kimchi-making event ('김장' '담그기' '체험')."
  },
  {
    "id": "eps-l-047",
    "sec": "listening",
    "type": "notice",
    "topic": "safety",
    "script": [
      "안내: 민방위 소방 훈련 안내입니다. 잠시 후 화재 경보 사이렌이 울리면 엘리베이터를 타지 마시고 유도 요원의 지시에 따라 1층 야외 공터로 대피하십시오."
    ],
    "question": "경보 사이렌이 울린 후 승객과 직원이 대피해야 할 장소는 어디입니까?",
    "options": [
      "지하 주차장",
      "옥상 헬기장",
      "1층 야외 공터",
      "3층 복도 화장실"
    ],
    "answer": 2,
    "why": "안내 요원의 지시에 따라 1층 야외 공터로 대피하라고 방송했습니다.",
    "why_en": "Personnel are instructed to evacuate to the 1st-floor outdoor clearing upon sirens."
  },
  {
    "id": "eps-l-048",
    "sec": "listening",
    "type": "notice",
    "topic": "work",
    "script": [
      "안내: 품질검사팀 공지입니다. 최근 수출 포장 상자의 제조일자 표기가 누락되는 사례가 발견되었습니다. 포장 담당자는 도장이 선명하게 찍혔는지 반드시 확인하십시오."
    ],
    "question": "포장 작업자가 상자에서 최종 확인해야 하는 사항은 무엇입니까?",
    "options": [
      "상자 테이프 색상",
      "납품 기사 전화번호",
      "회사 로고 모양",
      "제조일자 도장 표기"
    ],
    "answer": 3,
    "why": "상자에 제조일자 도장이 제대로 찍혔는지 확인할 것을 지시했습니다.",
    "why_en": "Packaging operators must verify clear stamping of the manufacturing date ('제조일자')."
  },
  {
    "id": "eps-l-049",
    "sec": "listening",
    "type": "notice",
    "topic": "daily",
    "script": [
      "안내: 코레일에서 알립니다. 부산행 KTX 105 열차가 3번 승강장으로 진입하고 있습니다. 승차권 번호를 확인하시고 노란색 안전선 뒤로 물러서 주십시오."
    ],
    "question": "열차가 승강장으로 들어올 때 승객이 취해야 할 행동은 무엇입니까?",
    "options": [
      "노란색 안전선 뒤로 물러선다.",
      "철로 안쪽으로 뛰어내린다.",
      "선로를 건너 반대편으로 간다.",
      "열차 유리창을 손으로 두드린다."
    ],
    "answer": 0,
    "why": "열차 진입 시에는 안전사고 방지를 위해 노란색 안전선 뒤로 물러서야 합니다.",
    "why_en": "Passengers must step back behind the yellow safety line when trains approach."
  },
  {
    "id": "eps-l-050",
    "sec": "listening",
    "type": "notice",
    "topic": "culture",
    "script": [
      "안내: 국립박물관 관람객 여러분께 알려 드립니다. 전시실 내 유물 보호를 위해 플래시를 켠 촬영과 음식물 섭취는 금지되어 있으니 협조해 주시기 바랍니다."
    ],
    "question": "박물관 전시실 안에서 금지된 행동은 무엇입니까?",
    "options": [
      "조용히 걷는 것",
      "플래시를 켜고 사진을 찍는 것",
      "안내 팜플렛을 읽는 것",
      "전시 설명을 듣는 것"
    ],
    "answer": 1,
    "why": "유물 보존을 위해 플래시 촬영 및 음식물 섭취가 금지되어 있습니다.",
    "why_en": "Using flash photography is prohibited to preserve museum relics."
  }
];
