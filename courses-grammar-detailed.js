/*
 * 세분화된 한국어 문법 교육과정 — 초급 / 중급 / 고급
 *
 * 기존 courses-grammar.js (문법 Core 8강좌) 다음 단계로,
 * 미묘한 뉘앙스 차이를 구분하는 Cloze 문제 세트로 구성한다.
 *
 * [스키마 호환 규칙 — 기존 배우기 엔진 그대로 재사용하기 위함]
 *   1. 텍스트 블록:  { t:'text', md:'### 💡 규칙 설명...' }
 *   2. Cloze 블록:  { t:'cloze', sentence:"앞 문장 [정답] 뒷 문장", answer:"정답",
 *                     meaning:"영문 번역 (선택)", options:[정답 + 오답 3개], keys: options 와 동일,
 *                     why:"왜 이 정답이 맞는지 해설" }
 *   3. Speak 블록:  { t:'speak', say:"직접 읽을 문장", rom:"로마자", q:"가이드" }
 */

export const DETAILED_GRAMMAR_COURSES = [

  // ════════════════════════════════════════════════
  // 🟢 BEGINNER (초급) — 2강좌
  // ════════════════════════════════════════════════
  {
    id: 'bg-d-01',
    emoji: '🇰🇷',
    title: '초급 세밀: -아요 / -어요 바르게 쓰기',
    tagline: '모음에 따라 달라지는 어미 자동 구분',
    blurb: '하다·먹다·가다 동사의 모음(ㅏ/ㅗ vs 그 외)을 보고 -아요 / -어요를 정확히 고르는 8문제 훈련입니다.',
    level: 'Beginner',
    needs: 'grammar-core',
    lessons: [
      {
        id: 'bg-d-01-01',
        title: '1강. ㅏ/ㅗ 동사 뒤에는 -아요',
        blocks: [
          { t:'text', md:'### 💡 -아요 / -어요 핵심 규칙\n1. **동사 어간 마지막 모음이 ㅏ 또는 ㅗ** 이면 → **-아요**\n2. 그 외 모든 모음 (ㅓ, ㅜ, ㅡ, ㅣ 등) 이면 → **-어요**\n3. `하다` 동사는 예외적으로 `해요` 로 불규칙 변화합니다.' },

          { t:'cloze', sentence:'오늘 학교에 [가요].', answer:'가요',
            meaning:'I go to school today.',
            options:['가요','가어요','가아요','갸요'],
            keys:['가요','가어요','가아요','갸요'],
            why:'동사 가다 → 어간 "가"의 마지막 모음이 ㅏ 이므로 -아요를 붙여 "가요" 가 됩니다.' },

          { t:'cloze', sentence:'어제 친구를 [만났어요].', answer:'만났어요',
            meaning:'I met a friend yesterday.',
            options:['만났어요','만났아요','만나서요','만낫요'],
            keys:['만났어요','만났아요','만나서요','만낫요'],
            why:'만나다 → 어간 "나"의 모음이 ㅏ이지만, 과거형 ㅏ+ㅓ → ㅐ 으로 합쳐져 "만났어요" 가 됩니다.' },

          { t:'cloze', sentence:'주말에 게임을 [해요].', answer:'해요',
            meaning:'I play games on weekends.',
            options:['해요','하여요','하아요','하어요'],
            keys:['해요','하여요','하아요','하어요'],
            why:'하다 동사는 ㅏ + 여 → 혀 모양으로 변하는 불규칙으로 항상 "해요" 입니다.' },

          { t:'speak', say:'나는 오늘 친구를 만나고 영화를 봐요.', rom:'na-neun o-neul chin-gu-reul man-na-go yeong-hwa-reul bwa-yo',
            q:'자연스러운 리듬으로 한 번 읽어 보세요.' },
        ],
      },
      {
        id: 'bg-d-01-02',
        title: '2강. 그 외 모음은 전부 -어요',
        blocks: [
          { t:'text', md:'### 💡 -어요를 쓰는 대표 동사\n- 먹다 (ㅓ) → 먹어요\n- 배우다 (ㅜ) → 배워요\n- 읽다 (ㅡ) → 읽어요\n- 기다리다 (ㅣ) → 기다려요\n모음 ㅏ/ㅗ 가 **아니라면** 전부 -어요 라고 생각하면 됩니다!' },

          { t:'cloze', sentence:'점심으로 김밥을 [먹어요].', answer:'먹어요',
            meaning:'I eat kimbap for lunch.',
            options:['먹어요','먹아요','먹어요','먹기요'],
            keys:['먹어요','먹아요','먹어요','먹기요'],
            why:'먹다 어간 "먹"의 마지막 모음이 ㅓ 이므로 -어요 를 붙여 "먹어요".' },

          { t:'cloze', sentence:'한국어를 열심히 [배워요].', answer:'배워요',
            meaning:'I study Korean hard.',
            options:['배워요','배와요','배우요','배어요'],
            keys:['배워요','배와요','배우요','배어요'],
            why:'배우다 어간 마지막 모음 ㅜ + 어 → 워 로 합쳐져 "배워요". (우 + 어 = 워 규칙)' },

          { t:'cloze', sentence:'책을 조용히 [읽어요].', answer:'읽어요',
            meaning:'I read a book quietly.',
            options:['읽어요','읽아요','일어요','읽으요'],
            keys:['읽어요','읽아요','일어요','읽으요'],
            why:'읽다 어간 "읽" 모음이 ㅡ 이므로 -어요 를 붙여 "읽어요".' },

          { t:'cloze', sentence:'버스를 30분 동안 [기다려요].', answer:'기다려요',
            meaning:'I wait for the bus for 30 minutes.',
            options:['기다려요','기다라요','기다리요','기다렸요'],
            keys:['기다려요','기다라요','기다리요','기다렸요'],
            why:'기다리다 어간 "리" 모음 ㅣ + 어 → 여 로 합쳐져 "기다려요". (이 + 어 = 여 규칙)' },

          { t:'speak', say:'나는 매일 학교에서 한국어를 배우고 책을 읽어요.', q:'-어요 동사 3개를 자연스럽게 연결해 보세요.' },
        ],
      },
    ],
  },

  {
    id: 'bg-d-02',
    emoji: '🕒',
    title: '초급 세밀: -고 싶다 / -을 거예요 뉘앙스 구분',
    tagline: '단순 희망 vs 확정된 미래 계획',
    blurb: '하고 싶은 막연한 소원 vs 내일 반드시 할 계획. 두 표현을 언제 써야 하는지 문맥으로 구분하는 훈련입니다.',
    level: 'Beginner',
    needs: 'bg-d-01',
    lessons: [
      {
        id: 'bg-d-02-01',
        title: '1강. 막연한 희망 -고 싶다',
        blocks: [
          { t:'text', md:'### 💡 -고 싶다\n**"언젠가 하고 싶어요"** 라는 **막연한 소원/희망**을 말할 때 씁니다.\n실제로 내일 당장 할 일이 아니라, 마음속으로 바라는 일에 써요.\n예: 언젠가 제주도에 가고 싶어요.' },
          { t:'cloze', sentence:'나중에 세계 여행을 [가고 싶어요].', answer:'가고 싶어요',
            meaning:'I want to travel the world someday.',
            options:['가고 싶어요','갈 거예요','가서 싶어요','가겠어요'],
            keys:['가고 싶어요','갈 거예요','가서 싶어요','가겠어요'],
            why:'세계 여행은 당장 내일 할 계획이 아니라 평생의 소원 같은 막연한 희망이므로 -고 싶어요.' },
          { t:'cloze', sentence:'오늘 저녁 피자를 [먹고 싶어요].', answer:'먹고 싶어요',
            meaning:'I want to eat pizza tonight.',
            options:['먹고 싶어요','먹을 거예요','먹으 싶어요','먹었 싶어요'],
            keys:['먹고 싶어요','먹을 거예요','먹으 싶어요','먹었 싶어요'],
            why:'오늘 저녁 메뉴로 "피자가 땡겨" 라는 내 마음속 희망을 말하는 상황이므로 -고 싶어요.' },
          { t:'speak', say:'나는 나중에 한국에서 살고 싶고 유학도 가고 싶어요.', q:'소원을 말할 때는 살짝 들뜬 목소리로요!' },
        ],
      },
      {
        id: 'bg-d-02-02',
        title: '2강. 확정 계획 -을/ㄹ 거예요',
        blocks: [
          { t:'text', md:'### 💡 -을/ㄹ 거예요\n**"내일은 꼭 이렇게 할 거야"** 라는 **이미 정해진 계획/미래**를 말할 때 씁니다.\n보통 시간/장소 약속이 정해져 있을 때 쓰는 표현이에요.\n받침 있으면 -을 거예요, 없으면 -ㄹ 거예요.' },
          { t:'cloze', sentence:'내일 오전 10시에 친구를 [만날 거예요].', answer:'만날 거예요',
            meaning:'I am going to meet a friend tomorrow at 10 AM.',
            options:['만날 거예요','만나고 싶어요','만난 거예요','만나야 거예요'],
            keys:['만날 거예요','만나고 싶어요','만난 거예요','만나야 거예요'],
            why:'내일 10시라는 구체적 시간 약속이 이미 정해진 상황이므로 확정 계획 -ㄹ 거예요.' },
          { t:'cloze', sentence:'이번 주말에는 집에서 영화를 [볼 거예요].', answer:'볼 거예요',
            meaning:'I am going to watch movies at home this weekend.',
            options:['볼 거예요','보고 싶어요','보 거예요','봤을 거예요'],
            keys:['볼 거예요','보고 싶어요','보 거예요','봤을 거예요'],
            why:'이번 주말에 무엇을 할지 계획을 이미 세운 상태라서 "볼 거예요" (보다 + ㄹ 거예요).' },
          { t:'cloze', sentence:'내일 생일이라 케이크를 [살 거예요].', answer:'살 거예요',
            meaning:'Tomorrow is my birthday so I am going to buy a cake.',
            options:['살 거예요','사고 싶어요','샀을 거예요','사서 거예요'],
            keys:['살 거예요','사고 싶어요','샀을 거예요','사서 거예요'],
            why:'생일이 내일이라 케이크 구매는 계획이 확정된 상황. 사다 받침 없으므로 ㄹ 거예요 → 살 거예요.' },
          { t:'speak', say:'다음 주 월요일에는 서울역에서 기차를 타고 부산에 갈 거예요.', q:'확정된 계획을 말할 때는 힘 있는 목소리로!' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // 🟡 INTERMEDIATE (중급) — 4강좌 (핵심 요청 -느라고 / -는 바람에 포함!)
  // ════════════════════════════════════════════════
  {
    id: 'im-02-02',
    emoji: '😵',
    title: '중급 02-02: 집중으로 인한 부정결과 (-느라고)',
    tagline: '하느라 다른 게 밀렸을 때만!',
    blurb: '드라마를 보느라 숙제를 못 했어요. 내가 한 행위에 **집중하느라** 다른 일을 놓친 부정적 결과. 주체는 항상 "나".',
    level: 'Intermediate',
    needs: 'bg-d-02',
    lessons: [
      {
        id: 'im-02-02-01',
        title: '1강. -느라고의 3가지 핵심 조건',
        blocks: [
          { t:'text', md:'### 💡 -느라고 핵심 규칙 3가지\n1. **앞뒤 문장 주체가 동일**: 무조건 "내가 A 하느라 내가 B 를 못했다"\n2. **의도적 집중**: 내가 스스로 시간을 쏟은 행위 (공부, 게임, 드라마, 운동...)\n3. **뒷 문장은 무조건 부정적 결과**: "늦었다 / 못했다 / 까먹었다 / 아프다" 등\n✅ 맞는 예: 어제 시험 공부를 하느라 잠을 못 잤어요\n❌ 틀린 예: (갑자기 비가 오느라) — 비는 내 의지가 아니라 돌발상황이므로 바람에!' },

          { t:'cloze', sentence:'어제 시험 공부를 [하느라고] 잠을 한 시간밖에 못 잤어요.', answer:'하느라고',
            meaning:'I was so focused on studying for the exam yesterday that I only slept one hour.',
            options:['하느라고','하는 바람에','하니까','하지만'],
            keys:['하느라고','하는 바람에','하니까','하지만'],
            why:'시험 공부라는 행위에 "내가" 스스로 집중한 결과 잠을 못 자는 부정적 결과 → -느라고.' },

          { t:'cloze', sentence:'밤새도록 게임을 [하느라고] 오늘 학교에 늦었어요.', answer:'하느라고',
            meaning:'I played games all night long so I was late to school today.',
            options:['하느라고','하는 바람에','해서','하거나'],
            keys:['하느라고','하는 바람에','해서','하거나'],
            why:'밤새도록 게임한 것은 내가 스스로 한 의도적 집중. 그래서 늦었다는 부정결과 → -느라고.' },

          { t:'cloze', sentence:'친구랑 카페에서 수다를 [떨느라고] 숙제를 깜빡했어요.', answer:'떨느라고',
            meaning:'I was so busy chatting with my friend at a café that I forgot my homework.',
            options:['떨느라고','떠는 바람에','떨고','떨어서'],
            keys:['떨느라고','떠는 바람에','떨고','떨어서'],
            why:'수다를 떤 건 내가 친구와 함께 시간을 보낸 집중 행위 → 숙제 깜빡한 부정결과 → -느라고.' },

          { t:'speak', say:'드라마를 10시간이나 보느라고 약속 시간에 한 시간이나 늦었어요.', guide:'후회하는 톤으로 자연스럽게 말해 보세요.' },
        ],
      },
    ],
  },

  {
    id: 'im-02-03',
    emoji: '🌧️',
    title: '중급 02-03: 돌발 상황 부정결과 (-는 바람에)',
    tagline: '예상치 못한 일이 터졌을 때!',
    blurb: '갑자기 비가 오는 바람에 옷이 젖었어요. 내 의지와 상관없는 **예상 밖 돌발사건**으로 생긴 부정적 결과에만 씁니다.',
    level: 'Intermediate',
    needs: 'im-02-02',
    lessons: [
      {
        id: 'im-02-03-01',
        title: '1강. -는 바람에 vs -느라고 100% 구분법',
        blocks: [
          { t:'text', md:'### 💡 -는 바람에 핵심 + 느라고와 비교\n| 구분 | -느라고 | -는 바람에 |\n|---|---|---|\n| 원인 | **내가 스스로 한 의도적 행위** | **내 뜻과 상관없는 돌발사건** (날씨·사고·기계오류·남의 행동) |\n| 주체 | 앞뒤 주체가 같아야 함 | 앞뒤 주체가 **달라도 됨** |\n| 공통 | 둘 다 뒷 문장은 **무조건 부정적 결과** |\n✅ 비가 오느라고 ❌ (비는 내 행위 아님) → 비가 오**는 바람에** ✅\n✅ 시험공부 하는 바람에 ❌ (시험공부는 내 행위) → 시험공부 **하느라고** ✅' },

          { t:'cloze', sentence:'갑자기 비가 [오는 바람에] 옷이 다 젖었어요.', answer:'오는 바람에',
            meaning:'It suddenly started raining, unexpectedly, and all my clothes got wet.',
            options:['오는 바람에','오느라고','오기 때문에','오거든'],
            keys:['오는 바람에','오느라고','오기 때문에','오거든'],
            why:'비가 오는 것은 내 의지와 상관없는 예상 밖 돌발 상황 → -는 바람에.' },

          { t:'cloze', sentence:'지하철이 고장 나는 [바람에] 회의에 20분 늦었어요.', answer:'바람에',
            meaning:'The subway broke down completely out of the blue, and I was 20 min late.',
            options:['바람에','느라고','때문에','서'],
            keys:['바람에','느라고','때문에','서'],
            why:'지하철 고장은 내가 통제할 수 없는 완전한 돌발 사고 → -는 바람에 에서 뒷 부분만 빈칸으로 낸 응용 문제.' },

          { t:'cloze', sentence:'동생이 갑자기 내 노트북을 [떨어뜨리는 바람에] 파일이 다 날아갔어요.', answer:'떨어뜨리는 바람에',
            meaning:'My little sibling suddenly dropped my laptop, and all my files were lost.',
            options:['떨어뜨리는 바람에','떨어뜨리느라고','떨어뜨리고','떨어뜨리니까'],
            keys:['떨어뜨리는 바람에','떨어뜨리느라고','떨어뜨리고','떨어뜨리니까'],
            why:'동생의 행동은 내가 의도한 게 아니라 예상치 못한 남의 행동 → -는 바람에.' },

          { t:'cloze', sentence:'컴퓨터가 꺼지는 [바람에] 저장 안 한 문서가 다 사라졌어요.', answer:'바람에',
            meaning:'The computer turned off out of nowhere and all my unsaved docs vanished.',
            options:['바람에','느라고','것 때문에','길래'],
            keys:['바람에','느라고','것 때문에','길래'],
            why:'컴퓨터 갑자기 꺼진 것은 기계 오류라는 돌발 상황 → -는 바람에.' },

          { t:'speak', say:'어제 급하게 뛰어가다가 넘어지는 바람에 바지가 찢어졌어요.', guide:'어이없다는 톤으로 말해보세요!' },
        ],
      },
    ],
  },

  {
    id: 'im-03-01',
    emoji: '🤔',
    title: '중급 03-01: 추측의 단계 (-ㄹ 것 같다 / -나 보다 / -겠군요)',
    tagline: '약한 추측 → 관찰 추측 → 강한 확신 추측',
    blurb: '비 올 것 같아요 (50%) / 비가 오나 봐요 (70% · 창문 보고) / 비가 오겠군요 (95% · 소리 들림). 단계별 뉘앙스 차이를 Cloze로 완벽 구분!',
    level: 'Intermediate',
    needs: 'im-02-03',
    lessons: [
      {
        id: 'im-03-01-01',
        title: '1강. 추측 강도 3단계 맵',
        blocks: [
          { t:'text', md:'### 💡 추측 강도 레벨 업\n1. **Level 1. -ㄹ/을 것 같다 (50~60%)** — 단순 내 생각 "그럴 것 같은데?" 아무 근거 없이 막연하게 추측\n2. **Level 2. -나 보다 / -는가 보다 (70~80%)** — **눈으로 본 것/직접 관찰**한 근거가 있는 추측. "밖을 보니 우산 쓰는 사람 많네? 비가 오나 보다"\n3. **Level 3. -겠군요 / -겠네요 (90~95%)** — 소리·냄새·상황 종합적으로 **거의 확신**하는 추측. "비 소리가 들려! 비가 오겠군요"' },

          { t:'cloze', sentence:'내일 날씨가 [좋을 것 같아요]. — 그럼 등산 가자!', answer:'좋을 것 같아요',
            meaning:'I think the weather will be nice tomorrow. — Then let\'s go hiking!',
            options:['좋을 것 같아요','좋나 보네요','좋겠군요','좋고 싶어요'],
            keys:['좋을 것 같아요','좋나 보네요','좋겠군요','좋고 싶어요'],
            why:'내일은 미래라 아직 관찰한 근거가 없음. 단순 기상 예보 생각하는 막연 추측 → Level 1.' },

          { t:'cloze', sentence:'밖에 사람들이 전부 우산을 써. 비가 [오나 봐요].', answer:'오나 봐요',
            meaning:'Everyone outside has umbrellas up. I guess it must be raining.',
            options:['오나 봐요','올 것 같아요','오겠군요','올래요'],
            keys:['오나 봐요','올 것 같아요','오겠군요','올래요'],
            why:'사람들이 우산 쓴 것을 **눈으로 직접 보고** 내린 추측 → Level 2 관찰 추측 -나 보다.' },

          { t:'cloze', sentence:'창문 두드리는 소리가 나! 비가 [오겠군요].', answer:'오겠군요',
            meaning:'I hear tapping on the window! It must definitely be raining out there.',
            options:['오겠군요','올 것 같아요','오나 봐요','오래요'],
            keys:['오겠군요','올 것 같아요','오나 봐요','오래요'],
            why:'비 소리라는 **명확한 청각적 증거**로 거의 100% 확신하는 추측 → Level 3 -겠군요.' },

          { t:'speak', say:'저 사람이 주머니를 계속 만지는 걸 보니까 핸드폰을 잃어버렸나 봐요.', guide:'관찰 추측은 "어? 저 사람 보니까~" 하는 수근거리는 톤으로.' },
        ],
      },
    ],
  },

  {
    id: 'im-03-02',
    emoji: '🎭',
    title: '중급 03-02: 반응 표현 (-다니! / -잖아 / -네요 vs -군요)',
    tagline: '놀람 · 상기 · 새로 알게 됐을 때 뉘앙스',
    blurb: '결혼했다니! (최초 충격) / 결혼했잖아! (상기시킴) / 결혼했네요~ (감상) / 결혼했군요! (새로 깨달음). 4가지 반응형 어미를 문맥으로 완벽 구분!',
    level: 'Intermediate',
    needs: 'im-03-01',
    lessons: [
      {
        id: 'im-03-02-01',
        title: '1강. 듣고 놀랐을 때 써야 할 딱 1가지',
        blocks: [
          { t:'text', md:'### 💡 반응형 어미 4종 완벽 가이드\n| 어미 | 뉘앙스 | 언제 써? |\n|---|---|---|\n| -다니! (놀람) | 😱 충격·경악·믿을 수 없음 | 상대방의 말을 **처음 듣고 입이 떡 벌어질 때** |\n| -잖아! (상기) | 😤 뭘 잊고 있냐고 일깨워 줄 때 | 상대방이 이미 알고 있었는데 잊고 있을 때 "잖아 우리가 약속했잖아!" |\n| -네요 (감상) | 😌 자기 혼자 감탄하는 느낌 | 자기가 직접 보고 느낀 개인적 감상. "오늘 날씨 좋네요~" |\n| -군요 (깨달음) | 💡 아하! 이제 알겠다 | 방금 상황 보고 **새로운 사실을 깨달았을 때** |' },

          { t:'cloze', sentence:'A: 저 다음 달에 결혼해요! B: 결혼하신다니! [너무 놀라워요]', answer:'다니',
            meaning:'A: I am getting married next month! B: WHAT?! Married?! That is so shocking!',
            options:['다니','잖아','네','군'],
            keys:['다니','잖아','네','군'],
            why:'상대방이 결혼 발표한 걸 **처음 듣고 경악하는 반응** → -다니!' },

          { t:'cloze', sentence:'야 우리 오늘 영화 보기로 약속했[잖아]! 어디야?!', answer:'잖아',
            meaning:'Hey! We PROMISED we were going to watch a movie today! Where are you?!',
            options:['잖아','다니','네요','군요'],
            keys:['잖아','다니','네요','군요'],
            why:'상대방이 잊고 있는 **기존 약속을 상기시키면서** 따지는 말 → -잖아!' },

          { t:'cloze', sentence:'와, 오늘 경치가 정말 멋지[네요].', answer:'네요',
            meaning:'Wow, the scenery today is really beautiful~ (personal sentiment)',
            options:['네요','군요','잖아요','다니요'],
            keys:['네요','군요','잖아요','다니요'],
            why:'내가 직접 본 풍경에 대해 **혼자 감탄하는 개인적 감상** → -네요' },

          { t:'cloze', sentence:'A: 저는 고기를 안 먹어요. B: 아! 그러시[군요]! 그럼 채소 메뉴로 시킬게요.', answer:'군요',
            meaning:'A: I do not eat meat. B: Oh! I see now! I will order a veggie menu then.',
            options:['군요','네요','잖아요','다니요'],
            keys:['군요','네요','잖아요','다니요'],
            why:'상대방 말을 듣고 **"아 그렇구나" 하고 방금 새로 깨달은 사실** → -군요' },

          { t:'speak', say:'와! 1등 하셨다니! 정말 대단하시네요! 저는 꼴찌 할 줄 알았군요.', guide:'다니 → 네요 → 군요 3가지 어미가 다 들어있어요. 실제 감정 살려서!' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // 🔴 ADVANCED (고급) — 2강좌
  // ════════════════════════════════════════════════
  {
    id: 'ad-01-01',
    emoji: '📚',
    title: '고급 01-01: 관형절연 미묘한 차이 (-는 / -던 / -ㄹ)',
    tagline: '현재진행 · 과거습관 · 미래예정의 시간 뉘앙스',
    blurb: '"내가 만나는 사람 / 만났던 사람 / 만날 사람" — 시제가 아니라 **화자가 바라보는 시간 관점** 차이! 실제 뉴스 기사 문장으로 고급 수준 Cloze 훈련.',
    level: 'Advanced',
    needs: 'im-03-02',
    lessons: [
      {
        id: 'ad-01-01-01',
        title: '1강. 관형절연 3형식 시간 뉘앙스',
        blocks: [
          { t:'text', md:'### 💡 관형절연 V + ㄴ/는/던/ㄹ\n| 형태 | 시간 관점 | 뉘앙스 |\n|---|---|---|\n| **-는** | **현재 반복·진행·사실** | 평범한 일반적 사실. (매일 만나는 친구) |\n| **-던** | **과거 회고·습관·지금과 다름** | 옛날에 자주 했었는데 지금은 아닐 수도. 추억이 느껴지는 어미. (예전에 자주 만나던 친구) |\n| **-(으)ㄹ** | **미래 예정·가능성** | 앞으로 할 일. (내일 만날 친구) |\n\n⚠️ 주의! 단순 과거 "했었다"는 **-ㄴ** 을 써요. (어제 만난 친구)' },

          { t:'cloze', sentence:'우리 회사에서 매일 점심을 같이 먹[는] 대리는 정말 친절해요.', answer:'는',
            meaning:'The assistant manager I eat lunch with every single day at our company is super kind.',
            options:['는','던','ㄹ','나'],
            keys:['는','던','ㄹ','나'],
            why:'"매일" 이라는 현재 반복 플래그가 있으므로 일반적 사실 -는' },

          { t:'cloze', sentence:'대학 시절 매일 밤을 같이 새[던] 친구들은 지금 다 해외에 살아요.', answer:'던',
            meaning:'The friends I used to pull all-nighters with daily back in college all live abroad now.',
            options:['던','는','ㄹ','ㄴ'],
            keys:['던','는','ㄹ','ㄴ'],
            why:'대학 시절 옛 추억 · 지금은 그렇지 않다는 과거 습관 플래그 → -던' },

          { t:'cloze', sentence:'이번 주 금요일 3시에 [만날] 예정인 고객은 일본에서 오신 대표님이세요.', answer:'만날',
            meaning:'The client we are scheduled to meet at 3 PM this coming Friday is a CEO coming from Japan.',
            options:['만날','만나는','만났던','만난'],
            keys:['만날','만나는','만났던','만난'],
            why:'이번 주 금요일은 명백한 미래 예정 → -(으)ㄹ → 만날' },

          { t:'cloze', sentence:'어제 지하철에서 [만난] 사람이 지금 회사 새 팀장님이래요.', answer:'만난',
            meaning:'The person I ran into yesterday on the subway is apparently our new team leader now.',
            options:['만난','만나는','만났던','만날'],
            keys:['만난','만나는','만났던','만날'],
            why:'어제 라는 **단 한 번의 구체적인 과거**는 습관 아님! 단순 완료 → -ㄴ' },

          { t:'speak', say:'예전에 자주 가던 카페가 있었는데, 지금은 내가 매일 가는 카페보다 훨씬 맛있었어. 다음 달에 갈 거리에 새로 생겼다던데 거기 꼭 가볼까.', guide:'던 → 는 → 던 → ㄹ 4가지가 다 섞인 고급 표현!' },
        ],
      },
    ],
  },

  {
    id: 'ad-02-01',
    emoji: '🎯',
    title: '고급 02-01: 격식·비격식 화법 4단계 매칭',
    tagline: '해요체 / 합쇼체 / 해라체 / 하오체 4화법 완벽 구분',
    blurb: '사내 회의 / 친구 술자리 / 신문 사설 / 옛 드라마 대사. 상황에 맞는 화법을 고르는 것은 한국어 실력 최종 단계! 4지선다 고급 Cloze 8문제.',
    level: 'Advanced',
    needs: 'ad-01-01',
    lessons: [
      {
        id: 'ad-02-01-01',
        title: '1강. 화법 4종과 적절한 사용 상황',
        blocks: [
          { t:'text', md:'### 💡 격식도 4단계 화법 매칭표\n| 레벨 | 화법 | 끝말 | 언제 써? |\n|---|---|---|---|\n| Lv1 친절·평범 | **해요체** | -아요/어요/해요 | 일상 대부분 · 가게 · 직장 상사 이외 대인 관계 |\n| Lv2 가장 격식 | **합쇼체** | -ㅂ니다/습니다 | 신문·방송·보고서·회의 공식석상 |\n| Lv3 반말 | **해라체** | -아/어/해 · -ㄴ다 | 친구 사이 · 가족 · 끼리끼리 문자 · 일기 |\n| Lv4 옛날 어른 | **하오체** | -오/소 · -시오 | 요즘은 거의 안 쓰나 옛 드라마·관공서 키오스크에서 종종 출현 |' },

          { t:'cloze', sentence:'[사내 회의록] 금일 제 3차 정기 이사회는 서면으로 진행되었[습니다].', answer:'습니다',
            meaning:'[Company Minutes] The 3rd regular board meeting today was conducted in writing.',
            options:['습니다','어요','다','소'],
            keys:['습니다','어요','다','소'],
            why:'회의록은 가장 격식이 높은 공식 문서. 합쇼체 -ㅂ니다/습니다.' },

          { t:'cloze', sentence:'[단톡방] A: 야 술 한잔 할[래]? B: 좋아! 저녁 7시에 봐!', answer:'래',
            meaning:'[Kakao chat] A: Hey wanna grab a drink? B: Hell yeah! See u 7 PM!',
            options:['래','요','겠습니까','시오'],
            keys:['래','요','겠습니까','시오'],
            why:'친구들 단톡방은 완전 반말 해라체 분위기 → 술 하ㄹ + ㄹ래 → 래' },

          { t:'cloze', sentence:'편의점 점원: 네, 주문하신 메뉴 총 5천 원 되[어요].', answer:'어요',
            meaning:'Clerk: Yes, your total order comes to 5,000 won.',
            options:['어요','습니다','라','시오'],
            keys:['어요','습니다','라','시오'],
            why:'편의점 알바와 고객은 일상적 친절한 관계. 표준 해요체 -어요.' },

          { t:'cloze', sentence:'[사극 드라마 임금님 말씀] 감히 신하가 이런 말을 하[시오]? 용서가 안 되[오].', answer:'시오',
            meaning:'[Historical Drama King Speech] DARE YOU, SUBJECT, UTTER SUCH WORDS? I CANNOT FORGIVE THEE.',
            options:['시오','군요','는데','해'],
            keys:['시오','군요','는데','해'],
            why:'조선시대 왕이 쓰는 격식 높은 하오체. -시오·-오 로 끝나는 게 특징.' },

          { t:'speak', say:'[친구한테] 어제 회의 때 사장님이 내 의견 들어주시고 아주 좋다고 하셨는데, 완전 신이 났어. 내일 기분 좋게 출근할 것 같다!', guide:'해요체와 해라체(-났어 · 같다)가 자연스럽게 섞인 실제 말투로 연습!' },
        ],
      },
    ],
  },

];
