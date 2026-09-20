/* ══════════════════════════════════════════════════════════════
   여행 한국어 (Travel Korean) 데이터베이스
   ──────────────────────────────────────────────────────────────
   외국인 여행객이 한국에서 가장 많이 마주치는 7개 핵심 상황과
   43개 실전 생존 구문 목록.
   ══════════════════════════════════════════════════════════════ */

export const TRAVEL_CATEGORIES = [
  { id: 'air',   emoji: '✈️', ko: '공항 & 입국',       en: 'Airport & Arrival',       desc: '입국 심사, 환전, 유심, 짐 찾기' },
  { id: 'trans', emoji: '🚇', ko: '교통 & 길 찾기',     en: 'Transit & Directions',     desc: '지하철, 버스, 택시, 길 묻기' },
  { id: 'hotel', emoji: '🏨', ko: '숙소 & 호텔',       en: 'Hotel & Stay',            desc: '체크인, 짐 보관, 룸 요청' },
  { id: 'dine',  emoji: '🍽️', ko: '식당 & 카페',       en: 'Dining & Cafe',           desc: '주문, 반찬/물 요청, 맵기 조절, 계산' },
  { id: 'shop',  emoji: '🛍️', ko: '쇼핑 & 편의점',     en: 'Shopping & Store',        desc: '가격 묻기, 사이즈, 편의점, 택스프리' },
  { id: 'tour',  emoji: '📸', ko: '관광 & K-컬처',     en: 'Sightseeing & Culture',   desc: '티켓 구매, 사진 부탁, 한복 체험' },
  { id: 'help',  emoji: '🚨', ko: '약국 & 긴급상황',   en: 'Pharmacy & Emergency',    desc: '약국 증상 설명, 분실물, 도움 요청' },
];

export const TRAVEL_PHRASES = [
  // ── 1. 공항 & 입국 (Airport & Arrival) ──────────────────────
  {
    id: 'tv-air-01', cat: 'air',
    ko: '여권 여기 있습니다.',
    en: 'Here is my passport.',
    pron: 'Yeogwon yeogi itseumnida.',
    tip: '입국 심사대나 면세점에서 여권을 건넬 때 씁니다.',
  },
  {
    id: 'tv-air-02', cat: 'air',
    ko: '여행하러 왔어요.',
    en: 'I am here for traveling.',
    pron: 'Yeohaenghareo wasseoyo.',
    tip: '입국 목적을 물어볼 때 간단히 답하는 표현입니다.',
  },
  {
    id: 'tv-air-03', cat: 'air',
    ko: '짐은 어디서 찾아요?',
    en: 'Where can I pick up my luggage?',
    pron: 'Jimeun eodiseo chajayo?',
    tip: '수하물 수취대(Baggage Claim)를 찾을 때 묻습니다.',
  },
  {
    id: 'tv-air-04', cat: 'air',
    ko: '유심 카드 어디서 살 수 있어요?',
    en: 'Where can I buy a SIM card?',
    pron: 'Yusim kadeu eodiseo sal su isseoyo?',
    tip: '공항 입국장에서 선불 유심이나 eSIM 안내 데스크를 찾을 때 씁니다.',
  },
  {
    id: 'tv-air-05', cat: 'air',
    ko: '환전소는 어디에 있어요?',
    en: 'Where is the currency exchange?',
    pron: 'Hwanjeonso-neun eodie isseoyo?',
    tip: '원화로 환전하거나 현금을 인출할 때 유용합니다.',
  },
  {
    id: 'tv-air-06', cat: 'air',
    ko: '서울역 가는 공항철도는 어디서 타요?',
    en: 'Where do I take the airport train to Seoul Station?',
    pron: 'Seoul-yeok ganeun gonghang-cheoldo-neun eodiseo tayo?',
    tip: '인천공항에서 AREX 열차를 타러 갈 때 씁니다.',
  },

  // ── 2. 교통 & 길 찾기 (Transit & Directions) ────────────────
  {
    id: 'tv-trans-01', cat: 'trans',
    ko: '티머니 카드 충전해 주세요.',
    en: 'Please top up my T-money card.',
    pron: 'T-meoni kadeu chungjeonhae juseyo.',
    tip: '편의점이나 지하철 역무실에서 교통카드를 충전할 때 씁니다.',
  },
  {
    id: 'tv-trans-02', cat: 'trans',
    ko: '홍대입구역으로 가주세요.',
    en: 'Please take me to Hongik University Station.',
    pron: 'Hongdaeipgu-yeog-euro gajuseyo.',
    tip: '택시를 탔을 때 목적지를 말하는 만능 표현입니다.',
  },
  {
    id: 'tv-trans-03', cat: 'trans',
    ko: '트렁크 좀 열어주실 수 있나요?',
    en: 'Could you please open the trunk?',
    pron: 'Teureongkeu jom yeoreojusil su innayo?',
    tip: '택시에 큰 캐리어를 실어야 할 때 기사님께 부탁합니다.',
  },
  {
    id: 'tv-trans-04', cat: 'trans',
    ko: '여기서 내려주세요.',
    en: 'Please let me off here.',
    pron: 'Yeogiseo naeryeojuseyo.',
    tip: '택시에서 내리고 싶은 지점에 도착했을 때 씁니다.',
  },
  {
    id: 'tv-trans-05', cat: 'trans',
    ko: '화장실이 어디예요?',
    en: 'Where is the restroom?',
    pron: 'Hwajangsil-i eodiyeyo?',
    tip: '여행 중 가장 많이 쓰게 되는 필수 생존 질문입니다.',
  },
  {
    id: 'tv-trans-06', cat: 'trans',
    ko: '여기서 걸어서 갈 수 있어요?',
    en: 'Can I walk there from here?',
    pron: 'Yeogiseo georeoseo gal su isseoyo?',
    tip: '목적지가 도보 거리인지 확인할 때 씁니다.',
  },

  // ── 3. 숙소 & 호텔 (Hotel & Accommodation) ──────────────────
  {
    id: 'tv-hotel-01', cat: 'hotel',
    ko: '체크인하고 싶어요.',
    en: 'I’d like to check in.',
    pron: 'Chekeu-in-hago sipeoyo.',
    tip: '호텔이나 숙소 프론트 데스크에 도착했을 때 첫인사로 씁니다.',
  },
  {
    id: 'tv-hotel-02', cat: 'hotel',
    ko: '체크인 전에 짐 좀 맡길 수 있나요?',
    en: 'Can I leave my luggage before check-in?',
    pron: 'Chekeu-in jeone jim jom matgil su innayo?',
    tip: '체크인 시간 전에 도착해 먼저 짐을 보관하고 싶을 때 씁니다.',
  },
  {
    id: 'tv-hotel-03', cat: 'hotel',
    ko: '와이파이 비밀번호가 뭐예요?',
    en: 'What is the Wi-Fi password?',
    pron: 'Waipai bimilbeonhoga mwoyeyo?',
    tip: '호텔이나 카페에서 인터넷 연결 정보를 물어볼 때 씁니다.',
  },
  {
    id: 'tv-hotel-04', cat: 'hotel',
    ko: '수건 더 주실 수 있나요?',
    en: 'Could I have more towels?',
    pron: 'Sugeon deo jusil su innayo?',
    tip: '객실에 수건이 부족할 때 프론트에 요청하는 말입니다.',
  },
  {
    id: 'tv-hotel-05', cat: 'hotel',
    ko: '방이 좀 추워요 / 더워요.',
    en: 'The room is a bit cold / hot.',
    pron: 'Bangi jom chuwoyo / deowoyo.',
    tip: '온도 조절이나 에어컨/난방 문의 시 씁니다.',
  },
  {
    id: 'tv-hotel-06', cat: 'hotel',
    ko: '체크아웃할게요.',
    en: 'I’d like to check out.',
    pron: 'Chekeu-aut-halgeyo.',
    tip: '숙소를 떠날 때 키를 반납하며 건네는 말입니다.',
  },

  // ── 4. 식당 & 카페 (Dining & Cafe) ──────────────────────────
  {
    id: 'tv-dine-01', cat: 'dine',
    ko: '두 명이에요. 자리 있어요?',
    en: 'Table for two, please. Do you have seats?',
    pron: 'Du myeong-ieyo. Jari isseoyo?',
    tip: '식당에 들어서며 인원수를 알릴 때 씁니다.',
  },
  {
    id: 'tv-dine-02', cat: 'dine',
    ko: '메뉴판 주세요.',
    en: 'Menu, please.',
    pron: 'Menyupan juseyo.',
    tip: '메뉴판을 보고 싶을 때 직원에게 요청합니다.',
  },
  {
    id: 'tv-dine-03', cat: 'dine',
    ko: '이거 하나 주세요.',
    en: 'One of this, please.',
    pron: 'Igeo hana juseyo.',
    tip: '메뉴를 손가락으로 가리키며 주문할 때 가장 유용한 만능 표현입니다.',
  },
  {
    id: 'tv-dine-04', cat: 'dine',
    ko: '덜 맵게 해주세요.',
    en: 'Please make it less spicy.',
    pron: 'Deol maepge haejuseyo.',
    tip: '한국 음식이 매울까 봐 걱정될 때 꼭 써야 하는 필수 표현입니다.',
  },
  {
    id: 'tv-dine-05', cat: 'dine',
    ko: '물 좀 더 주세요.',
    en: 'More water, please.',
    pron: 'Mul jom deo juseyo.',
    tip: '식사 중 물이나 기본 반찬을 더 요청할 때 씁니다.',
  },
  {
    id: 'tv-dine-06', cat: 'dine',
    ko: '앞치마 있어요?',
    en: 'Do you have an apron?',
    pron: 'Apchima isseoyo?',
    tip: '국물 요리나 고기를 먹을 때 옷에 튀지 않게 앞치마를 찾을 때 씁니다.',
  },
  {
    id: 'tv-dine-07', cat: 'dine',
    ko: '아이스 아메리카노 한 잔 포장해 주세요.',
    en: 'One iced Americano to go, please.',
    pron: 'Aiseu Amerikano han jan pojanghae juseyo.',
    tip: '카페에서 테이크아웃 주문할 때 쓰는 정석 표현입니다.',
  },
  {
    id: 'tv-dine-08', cat: 'dine',
    ko: '계산할게요. 영수증은 버려주세요.',
    en: 'Check, please. You can throw away the receipt.',
    pron: 'Gyesanhalgeyo. Yeongsujeung-eun beoryeojuseyo.',
    tip: '식사를 마치고 결제할 때 쓰는 깔끔한 표현입니다.',
  },

  // ── 5. 쇼핑 & 편의점 (Shopping & Store) ─────────────────────
  {
    id: 'tv-shop-01', cat: 'shop',
    ko: '이거 얼마예요?',
    en: 'How much is this?',
    pron: 'Igeo eolmayeyo?',
    tip: '가격을 물어볼 때 쓰는 가장 대표적인 질문입니다.',
  },
  {
    id: 'tv-shop-02', cat: 'shop',
    ko: '입어봐도 돼요?',
    en: 'Can I try this on?',
    pron: 'Ibeobwado dwaeyo?',
    tip: '옷가게 피팅룸에서 옷을 입어보고 싶을 때 물어봅니다.',
  },
  {
    id: 'tv-shop-03', cat: 'shop',
    ko: '다른 색상이나 사이즈 있어요?',
    en: 'Do you have this in another color or size?',
    pron: 'Dareun saeksang-ina sa-ijeu isseoyo?',
    tip: '원하는 옷이나 신발의 다른 옵션을 찾을 때 씁니다.',
  },
  {
    id: 'tv-shop-04', cat: 'shop',
    ko: '봉투는 필요 없어요.',
    en: 'I don’t need a plastic bag.',
    pron: 'Bongtu-neun piryo eopseoyo.',
    tip: '편의점이나 마트 계산대에서 비닐봉투가 필요 없을 때 말합니다.',
  },
  {
    id: 'tv-shop-05', cat: 'shop',
    ko: '전자레인지는 어디에 있어요?',
    en: 'Where is the microwave?',
    pron: 'Jeonjareinji-neun eodie isseoyo?',
    tip: '편의점 도시락이나 음식을 데울 때 위치를 묻습니다.',
  },
  {
    id: 'tv-shop-06', cat: 'shop',
    ko: '택스프리 돼요?',
    en: 'Can I get a tax refund?',
    pron: 'Taekseupeuri dwaeyo?',
    tip: '사후 면세(Tax Free) 혜택을 받을 수 있는지 확인할 때 씁니다.',
  },

  // ── 6. 관광 & K-컬처 (Sightseeing & K-Culture) ──────────────
  {
    id: 'tv-tour-01', cat: 'tour',
    ko: '성인 한 장 주세요.',
    en: 'One adult ticket, please.',
    pron: 'Seong-in han jang juseyo.',
    tip: '궁궐, 미술관, 테마파크 매표소에서 입장권을 살 때 씁니다.',
  },
  {
    id: 'tv-tour-02', cat: 'tour',
    ko: '사진 한 장만 찍어주실 수 있으세요?',
    en: 'Could you please take a photo of me/us?',
    pron: 'Sajin han jangman jjigeojusil su isseuseyo?',
    tip: '지나가는 사람에게 정중하게 사진 촬영을 부탁할 때 씁니다.',
  },
  {
    id: 'tv-tour-03', cat: 'tour',
    ko: '한복 대여하고 싶어요.',
    en: 'I’d like to rent a Hanbok.',
    pron: 'Hanbok daeyeohago sipeoyo.',
    tip: '경복궁이나 전주 한옥마을 등에서 한복을 빌릴 때 씁니다.',
  },
  {
    id: 'tv-tour-04', cat: 'tour',
    ko: '여기서 사진 찍어도 돼요?',
    en: 'Can I take photos here?',
    pron: 'Yeogiseo sajin jjigeodo dwaeyo?',
    tip: '실내나 전시장에서 사진 촬영 가능 여부를 확인할 때 씁니다.',
  },
  {
    id: 'tv-tour-05', cat: 'tour',
    ko: '추천해 주실 만한 곳이 있나요?',
    en: 'Is there any place you would recommend?',
    pron: 'Chucheonhae jusil manhan gosi innayo?',
    tip: '현지인이나 숙소 직원에게 맛집이나 명소를 추천받을 때 씁니다.',
  },

  // ── 7. 약국 & 긴급상황 (Pharmacy & Emergency) ───────────────
  {
    id: 'tv-help-01', cat: 'help',
    ko: '두통약 / 소화제 주세요.',
    en: 'Headache medicine / digestive medicine, please.',
    pron: 'Dutongyak / sohwaje juseyo.',
    tip: '약국에서 가장 많이 찾는 비상약을 요청할 때 씁니다.',
  },
  {
    id: 'tv-help-02', cat: 'help',
    ko: '밴드랑 소독약 주세요.',
    en: 'Adhesive bandages and antiseptic, please.',
    pron: 'Baendeurang sodokyak juseyo.',
    tip: '가벼운 상처가 났을 때 약국에서 치료 약품을 살 때 씁니다.',
  },
  {
    id: 'tv-help-03', cat: 'help',
    ko: '배가 너무 아파요.',
    en: 'My stomach hurts so much.',
    pron: 'Baega neomu apayo.',
    tip: '병원이나 약국에서 증상을 호소할 때 씁니다.',
  },
  {
    id: 'tv-help-04', cat: 'help',
    ko: '지갑을 잃어버렸어요.',
    en: 'I lost my wallet.',
    pron: 'Jigabeul ireobeoryeosseoyo.',
    tip: '분실물 센터나 경찰서에 분실 신고를 할 때 씁니다.',
  },
  {
    id: 'tv-help-05', cat: 'help',
    ko: '핸드폰을 택시에 두고 내렸어요.',
    en: 'I left my phone in the taxi.',
    pron: 'Haendeopon-eul taeksie dugo naeryeosseoyo.',
    tip: '택시 영수증이나 결제 내역과 함께 분실을 알릴 때 씁니다.',
  },
  {
    id: 'tv-help-06', cat: 'help',
    ko: '도와주세요!',
    en: 'Please help me!',
    pron: 'Dowajuseyo!',
    tip: '위급한 상황에서 주변 사람들에게 즉각 도움을 청할 때 씁니다.',
  },
];
