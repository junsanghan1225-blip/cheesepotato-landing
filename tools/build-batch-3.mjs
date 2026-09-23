import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('tools/batch3-raw.json', 'utf8'));

// 단어별 정확한 기본형과 영어 정의
const MAP = {
  // check-glossary 빈출 미등록 핵심 단어
  "대한": { ko: "대하다", en: "to face; to treat; regarding", alt: ["대한", "대해", "대하여"] },
  "명": { ko: "명", en: "person; counter for people" },
  "천": { ko: "천", en: "cloth; fabric; thousand" },
  "동": { ko: "동", en: "dong; neighborhood administrative unit" },
  "도": { ko: "도", en: "degree; province; also" },
  "텅": { ko: "텅", en: "completely empty; hollowly", alt: ["텅"] },
  "회": { ko: "회", en: "time; round; session" },
  "깊숙이": { ko: "깊숙이", en: "deeply; deep inside", alt: ["깊숙이", "깊숙"] },
  "뚝": { ko: "뚝", en: "suddenly; sharply", alt: ["뚝"] },

  // batch 3 후보 단어 매핑
  "드는": { ko: "들다", en: "to enter; to cost; to hold", alt: ["드는", "든"] },
  "게다": { ko: "게다가", en: "besides; moreover", alt: ["게다", "게다가"] },
  "것도": { ko: "것", en: "thing; fact", alt: ["것도"] },
  "때까지": { ko: "때", en: "time; moment", alt: ["때까지"] },
  "주시기": { ko: "주다", en: "to give", alt: ["주시기"] },
  "횡단보": { ko: "횡단보도", en: "crosswalk", alt: ["횡단보"] },
  "뇌의": { ko: "뇌", en: "brain", alt: ["뇌의"] },
  "깊숙": { ko: "깊숙하다", en: "to be deep", alt: ["깊숙한"] },
  "굳어": { ko: "굳다", en: "to harden; to solidify", alt: ["굳어"] },
  "그치지": { ko: "그치다", en: "to stop; to cease", alt: ["그치지"] },
  "만큼": { ko: "만큼", en: "as much as; to the extent" },
  "그럼": { ko: "그럼", en: "then; in that case" },
  "열로": { ko: "열", en: "heat; fever", alt: ["열로"] },
  "탓에": { ko: "탓", en: "fault; reason", alt: ["탓에"] },
  "취소되었다": { ko: "취소되다", en: "to be cancelled", alt: ["취소되었다"] },
  "먹먹하다": { ko: "먹먹하다", en: "to feel choked up; to feel deafened" },
  "구석": { ko: "구석", en: "corner; nook" },
  "따스한": { ko: "따스하다", en: "to be warm", alt: ["따스한"] },
  "저려왔다": { ko: "저려오다", en: "to go numb; to tingle", alt: ["저려왔다"] },
  "묵직한": { ko: "묵직하다", en: "to be heavy; to be weighty", alt: ["묵직한"] },
  "해진": { ko: "해지다", en: "to become worn out", alt: ["해진"] },
  "돌았다": { ko: "돌다", en: "to turn; to spin", alt: ["돌았다"] },
  "일기장": { ko: "일기장", en: "diary; journal" },
  "소년": { ko: "소년", en: "boy" },
  "야구": { ko: "야구", en: "baseball" },
  "감나무": { ko: "감나무", en: "persimmon tree" },
  "가슴속": { ko: "가슴속", en: "deep in one's heart" },
  "나를": { ko: "나", en: "I; me", alt: ["나를"] },
  "안겨": { ko: "안기다", en: "to be embraced; to be held", alt: ["안겨"] },
  "기쁨": { ko: "기쁨", en: "joy; gladness" },
  "부엌": { ko: "부엌", en: "kitchen" },
  "보관하": { ko: "보관하다", en: "to store; to keep", alt: ["보관하", "보관하는"] },
  "어두운": { ko: "어둡다", en: "to be dark", alt: ["어두운"] },
  "불을": { ko: "불", en: "fire; light", alt: ["불을"] },
  "차려": { ko: "차리다", en: "to prepare; to set", alt: ["차려"] },
  "남겨": { ko: "남기다", en: "to leave behind", alt: ["남겨"] },
  "시민들": { ko: "시민", en: "citizen", alt: ["시민들"] },
  "동네": { ko: "동네", en: "neighborhood; village" },
  "공공": { ko: "공공", en: "public; common" },
  "시설": { ko: "시설", en: "facility" },
  "지하철역": { ko: "지하철역", en: "subway station" },
  "편의": { ko: "편의", en: "convenience" },
  "주민센터": { ko: "주민센터", en: "community service center" },
  "마련된": { ko: "마련되다", en: "to be prepared; to be arranged", alt: ["마련된"] },
  "설치하": { ko: "설치하다", en: "to install", alt: ["설치하", "설치하는"] },
  "추가로": { ko: "추가", en: "addition; extra", alt: ["추가로"] },
  "확인하": { ko: "확인하다", en: "to check; to confirm", alt: ["확인하", "확인하는"] },
  "마련하기": { ko: "마련하다", en: "to prepare; to arrange", alt: ["마련하기"] },
  "제공하": { ko: "제공하다", en: "to provide; to offer", alt: ["제공하", "제공하는"] },
  "이루": { ko: "이루다", en: "to achieve; to form", alt: ["이루", "이루는"] },
  "가두": { ko: "가두다", en: "to lock up; to trap", alt: ["가두", "가두는"] },
  "도포하": { ko: "도포하다", en: "to apply; to spread on", alt: ["도포하", "도포하는"] },
  "저감": { ko: "저감", en: "reduction; decrease" },
  "유해": { ko: "유해", en: "harmful; hazardous" },
  "분해하": { ko: "분해하다", en: "to decompose; to disassemble", alt: ["분해하", "분해하는"] },
  "결합하": { ko: "결합하다", en: "to combine; to unite", alt: ["결합하", "결합하는"] },
  "다공성": { ko: "다공성", en: "porosity; porous nature" },
  "구조": { ko: "구조", en: "structure" },
  "공기": { ko: "공기", en: "air; atmosphere" },
  "정화하": { ko: "정화하다", en: "to purify; to cleanse", alt: ["정화하", "정화하는"] },
  "방출": { ko: "방출", en: "release; discharge" },
  "차단": { ko: "차단", en: "blocking; cutoff" },
  "전력": { ko: "전력", en: "electric power" },
  "소모": { ko: "소모", en: "consumption; dissipation" },
  "친환경": { ko: "친환경", en: "eco-friendly; environmentally friendly" },
  "소재": { ko: "소재", en: "material" },
  "개발하": { ko: "개발하다", en: "to develop", alt: ["개발하", "개발하는"] },
  "폐기물": { ko: "폐기물", en: "waste; trash" },
  "재활용하": { ko: "재활용하다", en: "to recycle", alt: ["재활용하", "재활용하는"] },
  "비용": { ko: "비용", en: "cost; expense" },
  "절감": { ko: "절감", en: "reduction; cut" },
  "효과": { ko: "효과", en: "effect; effectiveness" },
  "기대된": { ko: "기대되다", en: "to be expected", alt: ["기대된", "기대된다"] },
  "나타났다": { ko: "나타나다", en: "to appear; to show up", alt: ["나타났다"] },
  "보였다": { ko: "보이다", en: "to be seen; to show", alt: ["보였다"] },
  "밝혀졌다": { ko: "밝혀지다", en: "to be revealed; to come to light", alt: ["밝혀졌다"] },
  "알려졌다": { ko: "알려지다", en: "to become known", alt: ["알려졌다"] },
  "전해졌다": { ko: "전해지다", en: "to be delivered; to be passed down", alt: ["전해졌다"] },
  "드러났다": { ko: "드러나다", en: "to be revealed; to be exposed", alt: ["드러났다"] },
  "확인되었다": { ko: "확인되다", en: "to be confirmed", alt: ["확인되었다"] },
  "조사되었다": { ko: "조사되다", en: "to be investigated", alt: ["조사되었다"] },
  "분석되었다": { ko: "분석되다", en: "to be analyzed", alt: ["분석되었다"] },
  "평가받": { ko: "평가받다", en: "to be evaluated", alt: ["평가받", "평가받는다", "평가받고"] },
  "주목받": { ko: "주목받다", en: "to receive attention", alt: ["주목받", "주목받는다", "주목받고"] },
  "인정받": { ko: "인정받다", en: "to be recognized", alt: ["인정받", "인정받는다", "인정받고"] },
  "사랑받": { ko: "사랑받다", en: "to be loved", alt: ["사랑받", "사랑받는다", "사랑받고"] },
  "관심을": { ko: "관심", en: "interest; attention", alt: ["관심을"] },
  "호응을": { ko: "호응", en: "positive response", alt: ["호응을"] },
  "인기를": { ko: "인기", en: "popularity", alt: ["인기를"] },
  "성공을": { ko: "성공", en: "success", alt: ["성공을"] },
  "도움을": { ko: "도움", en: "help; assistance", alt: ["도움을"] },
  "역할을": { ko: "역할", en: "role; part", alt: ["역할을"] },
  "영향을": { ko: "영향", en: "influence; impact", alt: ["영향을"] },
  "사고를": { ko: "사고", en: "accident; incident", alt: ["사고를"] },
  "위험을": { ko: "위험", en: "danger; risk", alt: ["위험을"] },
  "문제를": { ko: "문제", en: "problem; issue", alt: ["문제를"] },
  "어려움을": { ko: "어려움", en: "difficulty; hardship", alt: ["어려움을"] },
  "불편을": { ko: "불편", en: "inconvenience", alt: ["불편을"] },
  "부담을": { ko: "부담", en: "burden; load", alt: ["부담을"] },
  "차이를": { ko: "차이", en: "difference", alt: ["차이를"] },
  "변화를": { ko: "변화", en: "change; transformation", alt: ["변화를"] },
  "특징을": { ko: "특징", en: "characteristic; feature", alt: ["특징을"] },
  "목표를": { ko: "목표", en: "goal; target", alt: ["목표를"] },
  "계획을": { ko: "계획", en: "plan", alt: ["계획을"] },
  "시간을": { ko: "시간", en: "time", alt: ["시간을"] },
  "마음을": { ko: "마음", en: "mind; heart", alt: ["마음을"] },
  "생각을": { ko: "생각", en: "thought; idea", alt: ["생각을"] },
  "눈을": { ko: "눈", en: "eye; snow", alt: ["눈을"] },
  "손을": { ko: "손", en: "hand", alt: ["손을"] },
  "발을": { ko: "발", en: "foot", alt: ["발을"] },
  "길을": { ko: "길", en: "way; road", alt: ["길을"] },
  "집을": { ko: "집", en: "house; home", alt: ["집을"] },
  "돈을": { ko: "돈", en: "money", alt: ["돈을"] },
  "밥을": { ko: "밥", en: "meal; cooked rice", alt: ["밥을"] },
  "물을": { ko: "물", en: "water", alt: ["물을"] },
  "옷을": { ko: "옷", en: "clothes; clothing", alt: ["옷을"] },
  "책을": { ko: "책", en: "book", alt: ["책을"] },
  "방을": { ko: "방", en: "room", alt: ["방을"] },
  "문을": { ko: "문", en: "door; gate", alt: ["문을"] },
  "창문을": { ko: "창문", en: "window", alt: ["창문을"] }
};

// raw에서 추가로 매핑 가능한 항목 채우기
for (const [w, c, s] of raw) {
  if (MAP[w]) continue;
  // 단어가 단순 명사이거나 동사인 경우 기본 룰
  if (w.endsWith('하다')) {
    MAP[w] = { ko: w, en: `to do ${w.slice(0, -2)}` };
  } else if (w.endsWith('적')) {
    MAP[w] = { ko: w, en: `${w} related` };
  }
}

const result = [];
const seenKo = new Set();

for (const [key, val] of Object.entries(MAP)) {
  if (seenKo.has(val.ko)) {
    const existing = result.find(r => r.ko === val.ko);
    if (existing && val.alt) {
      existing.alt = [...new Set([...(existing.alt || []), ...val.alt])];
    }
  } else {
    seenKo.add(val.ko);
    const item = { ko: val.ko, en: val.en };
    if (val.alt && val.alt.length) item.alt = val.alt;
    result.push(item);
  }
}

fs.writeFileSync('tools/batch3.json', JSON.stringify(result, null, 2), 'utf8');
console.log('Batch 3 entries prepared:', result.length);
