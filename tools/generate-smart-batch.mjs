import fs from 'node:fs';
import path from 'node:path';

// 1. krdict 로드
const krdict = JSON.parse(fs.readFileSync('docs/glossary-krdict.json', 'utf8'));
const krMap = new Map();
for (const w of krdict.words) {
  if (w.ko && w.defs && w.defs[0]?.t?.en) {
    let en = w.defs[0].t.en.trim();
    if (w.pos === '동사' || w.pos === '형용사') {
      if (!en.startsWith('to ')) en = 'to ' + en;
    }
    const cleanEn = en.split(';').slice(0, 2).map(s => s.trim()).join('; ');
    if (!krMap.has(w.ko) && cleanEn && !cleanEn.startsWith('(') && cleanEn.length <= 60 && !/[가-힣]/.test(cleanEn)) {
      krMap.set(w.ko, { ko: w.ko, pos: w.pos, en: cleanEn });
    }
  }
}

// 2. 현재 glossary.json 로드
const curGlossary = JSON.parse(fs.readFileSync('docs/glossary.json', 'utf8'));
const knownForms = new Map();
for (const e of curGlossary) {
  knownForms.set(e.ko, e.ko);
  for (const alt of e.alt || []) knownForms.set(alt, e.ko);
}
const curByKo = new Map(curGlossary.map((e, i) => [e.ko, e]));

// 3. 수작업 고빈도 단어 추가 딕셔너리
const EXTRA_DICT = {
  "써": { ko: "쓰다", en: "to write; to use", alt: ["써"] },
  "나만의": { ko: "나만", en: "only me; my own", alt: ["나만의"] },
  "감싸": { ko: "감싸다", en: "to wrap; to cover", alt: ["감싸"] },
  "지친": { ko: "지치다", en: "to be exhausted; to be tired", alt: ["지친"] },
  "빨아들여": { ko: "빨아들이다", en: "to suck in; to absorb", alt: ["빨아들여"] },
  "교통안전": { ko: "교통안전", en: "traffic safety" },
  "인주시민": { ko: "시민", en: "citizen", alt: ["인주시민"] },
  "성인": { ko: "성인", en: "adult" },
  "선발": { ko: "선발", en: "selection" },
  "전통시장": { ko: "전통시장", en: "traditional market" },
  "유통": { ko: "유통", en: "distribution; circulation" },
  "포장재": { ko: "포장재", en: "packaging material" },
  "신선식품": { ko: "신선식품", en: "fresh food" },
  "물질": { ko: "물질", en: "matter; substance" },
  "화학": { ko: "화학", en: "chemistry" },
  "연료": { ko: "연료", en: "fuel" },
  "단백질": { ko: "단백질", en: "protein" },
  "산소": { ko: "산소", en: "oxygen" },
  "저장": { ko: "저장", en: "storage; preservation" },
  "풍부하다": { ko: "풍부하다", en: "to be rich; to be abundant" },
  "풍부": { ko: "풍부하다", en: "to be rich; to be abundant", alt: ["풍부한", "풍부"] },
  "효율": { ko: "효율", en: "efficiency" },
  "방식": { ko: "방식", en: "method; way" },
  "도입": { ko: "도입", en: "introduction; adoption" },
  "확충": { ko: "확충", en: "expansion" },
  "기부": { ko: "기부", en: "donation; contribution" },
  "활성화": { ko: "활성화", en: "revitalization; activation" },
  "보호구역": { ko: "보호구역", en: "protected zone" },
  "보행자": { ko: "보행자", en: "pedestrian" },
  "단속": { ko: "단속", en: "crackdown; control" },
  "설치": { ko: "설치", en: "installation" },
  "교체": { ko: "교체", en: "replacement" },
  "안전성": { ko: "안전성", en: "safety; stability" },
  "강화": { ko: "강화", en: "reinforcement; strengthening" },
  "개선": { ko: "개선", en: "improvement" },
  "추진": { ko: "추진", en: "propulsion; promotion" },
  "협약": { ko: "협약", en: "agreement; pact" },
  "체결": { ko: "체결", en: "conclusion; signing" },
  "확대": { ko: "확대", en: "expansion; enlargement" },
  "지원": { ko: "지원", en: "support; assistance" },
  "육성": { ko: "육성", en: "fostering; nurturing" },
  "발굴": { ko: "발굴", en: "discovery; excavation" },
  "선정": { ko: "선정", en: "selection; choice" },
  "발표": { ko: "발표", en: "announcement; presentation" },
  "개최": { ko: "개최", en: "hosting; opening" },
  "참가자": { ko: "참가자", en: "participant" },
  "관람객": { ko: "관람객", en: "visitor; spectator" },
  "이용객": { ko: "이용객", en: "user; passenger" },
  "이용료": { ko: "이용료", en: "charge; fee" },
  "입장료": { ko: "입장료", en: "admission fee" },
  "할인": { ko: "할인", en: "discount" },
  "면제": { ko: "면제", en: "exemption" },
  "지급하다": { ko: "지급하다", en: "to pay; to provide" },
  "제공": { ko: "제공", en: "offer; supply" },
  "운영": { ko: "운영", en: "management; operation" },
  "관리": { ko: "관리", en: "management; supervision" },
  "점검": { ko: "점검", en: "inspection; check" },
  "조사": { ko: "조사", en: "investigation; survey" },
  "연구": { ko: "연구", en: "research; study" },
  "분석": { ko: "분석", en: "analysis" },
  "평가": { ko: "평가", en: "evaluation; assessment" },
  "대책": { ko: "대책", en: "measure; countermeasure" },
  "방안": { ko: "방안", en: "plan; scheme" },
  "해결": { ko: "해결", en: "solution; resolution" },
  "극복": { ko: "극복", en: "overcoming; conquest" },
  "예방": { ko: "예방", en: "prevention" },
  "방지": { ko: "방지", en: "prevention; protection" },
  "감소": { ko: "감소", en: "decrease; reduction" },
  "증가": { ko: "증가", en: "increase; growth" },
  "상승": { ko: "상승", en: "rise; ascent" },
  "하락": { ko: "하락", en: "drop; fall" },
  "안정": { ko: "안정", en: "stability; calm" },
  "변화": { ko: "변화", en: "change; transformation" },
  "발전": { ko: "발전", en: "development; progress" },
  "성장": { ko: "성장", en: "growth" },
  "유지": { ko: "유지", en: "maintenance; preservation" },
  "지속": { ko: "지속", en: "continuation; persistence" },
  "형성": { ko: "형성", en: "formation; development" },
  "구성": { ko: "구성", en: "composition; constitution" },
  "포함": { ko: "포함", en: "inclusion; containment" },
  "배제": { ko: "배제", en: "exclusion" },
  "제한": { ko: "제한", en: "limit; restriction" },
  "금지": { ko: "금지", en: "prohibition; ban" },
  "허용": { ko: "허용", en: "permission; allowance" },
  "인정": { ko: "인정", en: "recognition; acknowledgment" },
  "승인": { ko: "승인", en: "approval; authorization" },
  "동의": { ko: "동의", en: "agreement; consent" },
  "거부": { ko: "거부", en: "refusal; rejection" },
  "반대": { ko: "반대", en: "opposition; contrast" },
  "찬성": { ko: "찬성", en: "agreement; approval" },
  "선택": { ko: "선택", en: "choice; selection" },
  "결정": { ko: "결정", en: "decision; determination" },
  "판단": { ko: "판단", en: "judgment; decision" },
  "예측": { ko: "예측", en: "prediction; forecast" },
  "전망": { ko: "전망", en: "outlook; prospect" },
  "추정": { ko: "추정", en: "estimation; presumption" },
  "가정": { ko: "가정", en: "supposition; hypothesis" },
  "조건": { ko: "조건", en: "condition; term" },
  "기준": { ko: "기준", en: "standard; criterion" },
  "원칙": { ko: "원칙", en: "principle; rule" },
  "목적": { ko: "목적", en: "purpose; aim" },
  "이유": { ko: "이유", en: "reason; cause" },
  "원인": { ko: "원인", en: "cause; factor" },
  "결과": { ko: "결과", en: "result; outcome" },
  "영향": { ko: "영향", en: "influence; impact" },
  "역할": { ko: "역할", en: "role; part" },
  "기능": { ko: "기능", en: "function" },
  "작용": { ko: "작용", en: "action; effect" },
  "현상": { ko: "현상", en: "phenomenon" },
  "상태": { ko: "상태", en: "condition; state" },
  "상황": { ko: "상황", en: "situation; circumstance" },
  "환경": { ko: "환경", en: "environment" },
  "자연": { ko: "자연", en: "nature" },
  "사회": { ko: "사회", en: "society" },
  "문화": { ko: "문화", en: "culture" },
  "역사": { ko: "역사", en: "history" },
  "전통": { ko: "전통", en: "tradition" },
  "현대": { ko: "현대", en: "modern times; present day" },
  "미래": { ko: "미래", en: "future" },
  "과거": { ko: "과거", en: "past" },
  "현재": { ko: "현재", en: "present; now" },
  "지역": { ko: "지역", en: "region; area" },
  "도시": { ko: "도시", en: "city" },
  "농촌": { ko: "농촌", en: "rural area; farming village" },
  "국가": { ko: "국가", en: "nation; country" },
  "세계": { ko: "세계", en: "world" },
  "지구": { ko: "지구", en: "earth; globe" },
  "우주": { ko: "우주", en: "universe; space" }
};

// 4. words.tsv 읽기
const lines = fs.readFileSync('tools/words.tsv', 'utf8').split(/\r?\n/).filter(Boolean);
const ignorePattern = /^[가나다라마바사]{3,5}$/;
const ignoreWords = new Set(['인주', '인주시', '일토', '일까지', '리가', '것을', '고르십시오', '알맞은']);

const BATCH_SIZE = 300;
const candidates = [];

for (const line of lines) {
  if (candidates.length >= BATCH_SIZE) break;
  const [w, c, s] = line.split('\t');
  if (!w || ignorePattern.test(w) || ignoreWords.has(w)) continue;

  // 1) EXTRA_DICT 매칭
  if (EXTRA_DICT[w]) {
    candidates.push({ ...EXTRA_DICT[w], source: w });
    continue;
  }

  // 2) krdict 직접 매칭
  if (krMap.has(w)) {
    const kr = krMap.get(w);
    candidates.push({ ko: kr.ko, en: kr.en, source: w });
    continue;
  }

  // 3) ~하다 형태 매칭
  if (w.endsWith('한') && w.length >= 3) {
    const base = w.slice(0, -1) + '하다';
    if (krMap.has(base)) {
      candidates.push({ ko: base, en: krMap.get(base).en, alt: [w], source: w });
      continue;
    }
  }
  if (w.endsWith('하는') && w.length >= 4) {
    const base = w.slice(0, -2) + '하다';
    if (krMap.has(base)) {
      candidates.push({ ko: base, en: krMap.get(base).en, alt: [w], source: w });
      continue;
    }
  }
  if (w.endsWith('된') && w.length >= 3) {
    const base = w.slice(0, -1) + '되다';
    if (krMap.has(base)) {
      candidates.push({ ko: base, en: krMap.get(base).en, alt: [w], source: w });
      continue;
    }
  }
  if (w.endsWith('되는') && w.length >= 4) {
    const base = w.slice(0, -2) + '되다';
    if (krMap.has(base)) {
      candidates.push({ ko: base, en: krMap.get(base).en, alt: [w], source: w });
      continue;
    }
  }

  // 4) 기존 glossary에 이미 있는 단어의 변형인 경우
  if (knownForms.has(w)) {
    continue; // 이미 등록됨
  }
}

// 5. 충돌 검사 및 최종 JSON 구성
const finalEntries = [];
const seenInBatch = new Set();
const batchForms = new Map();

for (const c of candidates) {
  if (seenInBatch.has(c.ko)) {
    const existing = finalEntries.find(e => e.ko === c.ko);
    if (existing && c.alt) {
      existing.alt = [...new Set([...(existing.alt || []), ...c.alt])];
    }
    continue;
  }

  // alt 중 충돌하는 항목 제거
  const safeAlt = [];
  for (const alt of c.alt || []) {
    const existingOwner = knownForms.get(alt);
    if (existingOwner && existingOwner !== c.ko) {
      continue; // 다른 단어의 alt와 충돌
    }
    safeAlt.push(alt);
  }

  seenInBatch.add(c.ko);
  const item = { ko: c.ko, en: c.en };
  if (safeAlt.length) item.alt = safeAlt;
  finalEntries.push(item);
}

fs.writeFileSync('tools/smart-batch.json', JSON.stringify(finalEntries, null, 2), 'utf8');
console.log(`스마트 배치 준비 완료: ${finalEntries.length}개 표제어`);
