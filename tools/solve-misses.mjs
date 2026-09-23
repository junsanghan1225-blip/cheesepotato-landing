import fs from 'node:fs';

const misses = JSON.parse(fs.readFileSync('tools/actual-misses.json', 'utf8'));
const curGlossary = JSON.parse(fs.readFileSync('docs/glossary.json', 'utf8'));

const knownForms = new Map();
for (const e of curGlossary) {
  knownForms.set(e.ko, e.ko);
  for (const alt of e.alt || []) knownForms.set(alt, e.ko);
}

// krdict 사전
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

// 조사 목록
const JOSA = ['으로부터', '에서부터', '이라고', '으로는', '에서는', '에서도', '이라는', '에게', '한테', '까지', '부터', '보다', '처럼', '마다', '조차', '밖에', '이나', '에는', '에도', '에서', '으로', '은', '는', '이', '가', '을', '를', '의', '에', '도', '만', '과', '와', '로'];

// 추가 정밀 단어 맵
const MANUAL_MAP = {
  "써": { ko: "쓰다", en: "to write; to use", alt: ["써"] },
  "빨아들여": { ko: "빨아들이다", en: "to suck in; to absorb", alt: ["빨아들여"] },
  "완성된": { ko: "완성되다", en: "to be completed", alt: ["완성된"] },
  "지킴이": { ko: "지킴이", en: "guardian; protector" },
  "동일한": { ko: "동일하다", en: "to be identical; to be the same", alt: ["동일한"] },
  "순수한": { ko: "순수하다", en: "to be pure", alt: ["순수한"] },
  "전동": { ko: "전동", en: "electric; motorized" },
  "훌륭한": { ko: "훌륭하다", en: "to be excellent; to be splendid", alt: ["훌륭한"] },
  "수입": { ko: "수입", en: "import; income" },
  "순식간에": { ko: "순식간", en: "instant; moment", alt: ["순식간에"] },
  "단단히": { ko: "단단히", en: "firmly; tightly" },
  "누워": { ko: "눕다", en: "to lie down", alt: ["누워"] },
  "빽빽하게": { ko: "빽빽하다", en: "to be dense; to be packed", alt: ["빽빽하게"] },
  "수리할": { ko: "수리하다", en: "to repair; to fix", alt: ["수리할"] },
  "정성껏": { ko: "정성껏", en: "with all one's heart; devotedly" },
  "옹기종기": { ko: "옹기종기", en: "in clusters; huddling" },
  "울창한": { ko: "울창하다", en: "to be heavily forested; to be dense", alt: ["울창한"] },
  "국제적": { ko: "국제적", en: "international; global" },
  "걷어내고": { ko: "걷어내다", en: "to clear away; to remove", alt: ["걷어내고"] },
  "고분자": { ko: "고분자", en: "polymer; macromolecule" },
  "손수": { ko: "손수", en: "with one's own hands; personally" },
  "돋보기안경": { ko: "돋보기안경", en: "reading glasses", alt: ["돋보기안경을", "돋보기안경"] },
  "애틋하다": { ko: "애틋하다", en: "to be affectionate and sorrowful" },
  "고유한": { ko: "고유하다", en: "to be intrinsic; to be unique", alt: ["고유한"] },
  "무사히": { ko: "무사히", en: "safely; without mishap" },
  "샴푸": { ko: "샴푸", en: "shampoo" },
  "어디서나": { ko: "어디서나", en: "everywhere; anywhere" },
  "전자레인지": { ko: "전자레인지", en: "microwave oven" },
  "건조": { ko: "건조", en: "dryness; dehydration" },
  "건조한": { ko: "건조하다", en: "to be dry; to be arid", alt: ["건조한"] },
  "지정된": { ko: "지정되다", en: "to be designated", alt: ["지정된"] },
  "인당": { ko: "인당", en: "per person" },
  "마감": { ko: "마감", en: "deadline; closing" },
  "현지": { ko: "현지", en: "local; actual place" },
  "최신": { ko: "최신", en: "the newest; the latest" },
  "가스": { ko: "가스", en: "gas" },
  "원목": { ko: "원목", en: "solid wood; timber" },
  "장난감": { ko: "장난감", en: "toy" },
  "도서관": { ko: "도서관", en: "library" },
  "연회비": { ko: "연회비", en: "annual fee" },
  "호응": { ko: "호응", en: "positive response; reception" },
  "포인트": { ko: "포인트", en: "point" },
  "적립": { ko: "적립", en: "accumulation; saving" },
  "혜택": { ko: "혜택", en: "benefit; perk" },
  "인증": { ko: "인증", en: "certification; verification" },
  "절차": { ko: "절차", en: "procedure; process" },
  "간소화": { ko: "간소화", en: "simplification" },
  "효율적": { ko: "효율적", en: "efficient" },
  "시스템": { ko: "시스템", en: "system" },
  "네트워크": { ko: "네트워크", en: "network" },
  "데이터": { ko: "데이터", en: "data" },
  "프로그램": { ko: "프로그램", en: "program" },
  "체험": { ko: "체험", en: "hands-on experience" },
  "활동": { ko: "활동", en: "activity" },
  "봉사": { ko: "봉사", en: "volunteer work; service" },
  "주민": { ko: "주민", en: "resident; inhabitant" },
  "센터": { ko: "센터", en: "center" },
  "지원금": { ko: "지원금", en: "subsidy; financial support" },
  "장학금": { ko: "장학금", en: "scholarship" },
  "보조금": { ko: "보조금", en: "grant; subsidy" },
  "청구": { ko: "청구", en: "claim; charge" },
  "서류": { ko: "서류", en: "document; paper" },
  "제출": { ko: "제출", en: "submission" },
  "작성": { ko: "작성", en: "writing; filling out" },
  "접수": { ko: "접수", en: "receipt; registration" },
  "마련": { ko: "마련", en: "preparation; provision" },
  "추천": { ko: "추천", en: "recommendation" },
  "소개": { ko: "소개", en: "introduction" },
  "안내": { ko: "안내", en: "guide; guidance" },
  "설명": { ko: "설명", en: "explanation" },
  "이해": { ko: "이해", en: "understanding; comprehension" },
  "동의": { ko: "동의", en: "agreement; consent" },
  "신청": { ko: "신청", en: "application; request" },
  "등록": { ko: "등록", en: "registration; enrollment" },
  "예약": { ko: "예약", en: "reservation; booking" },
  "취소": { ko: "취소", en: "cancellation" },
  "변경": { ko: "변경", en: "change; alteration" },
  "확인": { ko: "확인", en: "confirmation; verification" },
  "검사": { ko: "검사", en: "examination; inspection" },
  "측정": { ko: "측정", en: "measurement" },
  "비교": { ko: "비교", en: "comparison" },
  "선택": { ko: "선택", en: "choice; selection" },
  "구입": { ko: "구입", en: "purchase; buying" },
  "판매": { ko: "판매", en: "sale; selling" },
  "소비": { ko: "소비", en: "consumption; spending" },
  "생산": { ko: "생산", en: "production" },
  "제조": { ko: "제조", en: "manufacturing" },
  "가공": { ko: "가공", en: "processing" },
  "보존": { ko: "보존", en: "preservation; conservation" },
  "보호": { ko: "보호", en: "protection" },
  "관리": { ko: "관리", en: "management" }
};

const entries = [];
const seenKo = new Set();
const ignore = /^[가나다라마바사]{3,5}$/;

for (const [rawWord, count] of misses) {
  if (entries.length >= 350) break;
  if (!rawWord || ignore.test(rawWord) || rawWord.length < 2) continue;
  if (['인주', '인주시', '일토', '일까지', '리가', '것을', '고르십시오', '알맞은'].includes(rawWord)) continue;

  let candidate = null;

  // 1. 수작업 매핑
  if (MANUAL_MAP[rawWord]) {
    candidate = { ...MANUAL_MAP[rawWord] };
  }
  // 2. krMap 직접
  else if (krMap.has(rawWord)) {
    const kr = krMap.get(rawWord);
    candidate = { ko: kr.ko, en: kr.en };
  }
  // 3. 조사 떼고 krMap 조회
  else {
    for (const j of JOSA) {
      if (rawWord.endsWith(j) && rawWord.length > j.length + 1) {
        const stem = rawWord.slice(0, -j.length);
        if (krMap.has(stem)) {
          const kr = krMap.get(stem);
          candidate = { ko: kr.ko, en: kr.en, alt: [rawWord] };
          break;
        }
      }
    }
  }

  // 4. 동사/형용사 활용 복원
  if (!candidate) {
    if (rawWord.endsWith('한') && rawWord.length >= 3) {
      const base = rawWord.slice(0, -1) + '하다';
      if (krMap.has(base)) candidate = { ko: base, en: krMap.get(base).en, alt: [rawWord] };
    } else if (rawWord.endsWith('된') && rawWord.length >= 3) {
      const base = rawWord.slice(0, -1) + '되다';
      if (krMap.has(base)) candidate = { ko: base, en: krMap.get(base).en, alt: [rawWord] };
    } else if (rawWord.endsWith('하는') && rawWord.length >= 4) {
      const base = rawWord.slice(0, -2) + '하다';
      if (krMap.has(base)) candidate = { ko: base, en: krMap.get(base).en, alt: [rawWord] };
    } else if (rawWord.endsWith('되는') && rawWord.length >= 4) {
      const base = rawWord.slice(0, -2) + '되다';
      if (krMap.has(base)) candidate = { ko: base, en: krMap.get(base).en, alt: [rawWord] };
    }
  }

  if (candidate) {
    // 이미 batch에 들어간 ko인지 확인
    if (seenKo.has(candidate.ko)) {
      const ex = entries.find(e => e.ko === candidate.ko);
      if (ex && candidate.alt) {
        ex.alt = [...new Set([...(ex.alt || []), ...candidate.alt])];
      }
    } else {
      // alt 충돌 확인
      const safeAlt = [];
      for (const a of candidate.alt || []) {
        const owner = knownForms.get(a);
        if (!owner || owner === candidate.ko) safeAlt.push(a);
      }
      seenKo.add(candidate.ko);
      const item = { ko: candidate.ko, en: candidate.en };
      if (safeAlt.length) item.alt = safeAlt;
      entries.push(item);
    }
  }
}

fs.writeFileSync('tools/batch-misses.json', JSON.stringify(entries, null, 2), 'utf8');
console.log(`Misses 기반 배치 완료: ${entries.length}개 표제어`);
