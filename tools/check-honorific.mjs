/*
 * 존댓말(-(으)시-·겸양) 활용 검사기
 *
 * 표를 손으로 채우다 보면 받침 규칙을 놓치기 쉽다 — 'yes'라고 적어
 * 놓고 정작 결과 칸에는 으를 안 붙이거나, ㄹ 받침인데 탈락을 안 시키는
 * 식이다. 이 검사기는 한글 자모를 직접 풀어서 받침을 계산하고, 존댓말
 * 코스(courses.js 의 hon: true)에 있는 「Dictionary form → 활용형」 표를
 * 그 규칙과 대조한다.
 *
 * 블록 속 글(h/md/q/why/head 등)은 cTx() 를 안 거치는 순수 문자열이라
 * 화면 언어를 못 바꾼다(app.module.js readBlock·exBlock 확인) — 그래서
 * 표의 머리글도 영어(Dictionary form/Plain/Honorific/Humble)로 적는다.
 * 이 검사기가 찾는 문자열도 그 영어를 그대로 쓴다.
 *
 * 실행: node tools/check-honorific.mjs
 *
 * 잡아내는 것
 *   - Dictionary form→활용형 표에서 받침 규칙이 틀린 칸 (으 빠짐·덧붙음, ㄹ 안 탈락)
 *   - 표에 적힌 받침 설명이 실제 계산한 받침과 다른 경우
 *   - 드시다·계시다처럼 이미 -시-를 담은 불규칙 어간을 규칙대로 다시
 *     활용시킨 경우 (예: 드시다인데 '드시으세요'처럼 시가 겹치는 꼴)
 *   - 'Plain → Honorific' 표(주체 높임)와 'Plain → Humble' 표(객체
 *     높임·겸양)에서 불규칙 낱말의 짝이 틀리거나 빠진 경우
 *   - 맨 위 요약표(h 에 'glance' 가 들어간 표)가 뒤 레슨에서 실제로 쓰는
 *     불규칙 낱말·겸양어를 못 담고 있는 경우 — 학습자가 처음 보는 표가
 *     낡아 있으면 안내가 아니라 오해가 된다.
 *
 * 새 존댓말 레슨을 더할 때(단계적으로 계속 늘어날 예정이다) 코스에
 * hon: true 만 붙이면 이 검사기가 자동으로 그 표까지 함께 본다.
 */
import { COURSES } from '../courses.js';

const problems = [];

/* ── 한글 자모 풀기 ────────────────────────────────────────────
   완성형 한글 음절 = ((초성 * 21) + 중성) * 28 + 종성 + 0xAC00.
   종성(받침) 순서: 0=없음,1=ㄱ,2=ㄲ,3=ㄳ,4=ㄴ,5=ㄵ,6=ㄶ,7=ㄷ,8=ㄹ, …
   8번이 ㄹ이라는 것만 이 파일에서 쓴다 — ㄹ 탈락 규칙 때문이다. */
const RIEUL_FINAL = 8;

function decompose(ch) {
  const code = ch.codePointAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;   // 한글 음절이 아님(영문·숫자 등)
  const final = code % 28;
  const medial = Math.floor(code / 28) % 21;
  const initial = Math.floor(code / 28 / 21);
  return { initial, medial, final };
}
function compose(initial, medial, final) {
  return String.fromCodePoint(0xAC00 + (initial * 21 + medial) * 28 + final);
}

/* '가다 — to go' 처럼 영어 뜻이 붙은 사전형에서 어간 정보를 뽑는다.
   이미 -시-로 끝나는 불규칙 존댓말 어간(드시다·계시다·주무시다·
   말씀하시다·편찮으시다)은 따로 표시해 둔다 — 그 어간은 받침 규칙이
   아니라 자기 자신의 시를 떼고 어미를 잇는 다른 규칙을 따른다. */
function stemInfo(dictForm) {
  const dict = String(dictForm).split('—')[0].trim();
  if (!dict.endsWith('다')) return null;
  const stem = dict.slice(0, -1);
  if (!stem) return null;
  const lastCh = stem[stem.length - 1];
  const d = decompose(lastCh);
  if (!d) return null;
  const hasBatchim = d.final !== 0;
  const isRieul = d.final === RIEUL_FINAL;
  const dropped = isRieul ? stem.slice(0, -1) + compose(d.initial, d.medial, 0) : stem;
  const alreadyHonorific = lastCh === '시';   // 드시다·계시다·주무시다 …
  return { dict, stem, hasBatchim, isRieul, dropped, alreadyHonorific };
}

/* -(으)시- 뒤에 붙는 어미들. 전부 시가 이미 녹아든(또는 시로 시작하는)
   글자 그대로다 — 시+어요→세요, 시+었어요→셨어요처럼 모음 줄임이 이미
   끝난 꼴이라, 이 문자열 자체가 정답 활용형의 꼬리다.
   긴 것부터 둔다 — endsWith 로 맞대 볼 때 짧은 게 먼저면 '셨습니다'가
   '습니다' 로도 걸릴 자리가 있다. */
const FAMILIES = [
  '셨습니다', '십니까', '십니다', '십시오', '십시다',
  '셨어요', '실래요', '시겠어요', '실 거예요', '세요',
];

/* 사전형과 어미 이름으로 정답 활용형을 계산한다.
   이미 -시-로 끝나는 어간(드시다 등)은 그 시를 떼고 어미를 바로
   붙인다 — 어미 문자열 자체가 '시+무엇'의 줄임꼴이라, 어간에 시가
   남아 있으면 시가 겹친다(드시다 + 세요 → 드시세요 는 틀린 꼴이고,
   드 + 세요 → 드세요 가 맞다). */
function expectedForm(dictForm, family) {
  const info = stemInfo(dictForm);
  if (!info) return null;
  if (info.alreadyHonorific) return info.stem.slice(0, -1) + family;
  const base = (info.hasBatchim && !info.isRieul) ? info.stem + '으' : info.dropped;
  return base + family;
}

function batchimLabelMatches(label, info) {
  const s = String(label ?? '');
  if (/ㄹ/.test(s)) return info.isRieul;                     // 'ㄹ (drops)'
  if (/^none$/i.test(s.trim())) return !info.hasBatchim;      // 'none'
  if (/^yes/i.test(s.trim())) return info.hasBatchim && !info.isRieul;  // 'yes (ㄴ)' 등
  return true;   // 못 알아본 표기는 통과시킨다 — 오탐이 검사기를 안 믿게 만드는 것보다 낫다
}

/* 반말 → 높임말이 통째로 바뀌는 불규칙 낱말(주체 높임). 여기 없는
   낱말은 규칙 활용(어간 + -(으)시-)이 맞다는 뜻이라 검사 대상이 아니다. */
const IRREGULAR_MAP = {
  '먹다': ['드시다', '잡수시다'],
  '마시다': ['드시다'],
  '자다': ['주무시다'],
  '있다': ['계시다'],
  '아프다': ['편찮으시다'],
  '말하다': ['말씀하시다'],
  '이름': ['성함'],
  '나이': ['연세'],
  '집': ['댁'],
  '생일': ['생신'],
  '밥': ['진지'],
  '식사': ['진지'],
};

/* 반말 → 겸양어가 통째로 바뀌는 낱말(객체 높임 — 나를 낮춰서 상대나
   웃어른을 높인다). -(으)시- 와는 다른 축이라 따로 관리한다. */
const HUMBLE_MAP = {
  '나': ['저'],
  '우리': ['저희'],
  '주다': ['드리다'],
  '묻다': ['여쭙다', '여쭈다'],
  '보다': ['뵙다'],
  '만나다': ['뵙다'],
  '데리고 가다': ['모시다'],
  '데려가다': ['모시다'],
};

/* '반말 → 무엇' 짝 표를 대조하고, 실제로 쓴 낱말을 usedWords 에 모은다.
   plain·hon 칸 둘 다 '·' 로 여러 값을 담을 수 있다(먹다 · 마시다,
   여쭙다 · 여쭈다 같은 자리) — 그래서 양쪽 다 쪼개서 견준다. */
function checkPairTable(b, at, headerName, map, usedWords) {
  const plainCol = b.head.indexOf('Plain');
  const honCol = b.head.indexOf(headerName);
  for (const [ri, row] of (b.rows ?? []).entries()) {
    const plainCell = String(row[plainCol] ?? '');
    const honCell = String(row[honCol] ?? '');
    const honWords = honCell.split('·').map((s) => s.trim()).filter(Boolean);
    for (const plain of plainCell.split('·').map((s) => s.trim())) {
      const want = map[plain];
      if (!want) continue;
      const bad = honWords.filter((h) => !want.includes(h));
      if (bad.length) {
        problems.push(`${at} ${ri + 1}행: '${plain}' 의 ${headerName} 칸에는 ${want.join('/')} 가 와야 하는데 '${bad.join(', ')}' 로 적혀 있다`);
      }
    }
    for (const w of honWords) usedWords.add(w);
  }
}

const HON_COURSES = COURSES.filter((c) => c.hon);
if (!HON_COURSES.length) {
  console.log('hon: true 로 표시된 코스가 없다. 검사할 것이 없어 끝낸다.');
  process.exit(0);
}

const IRREGULAR_WORDS = [...new Set(Object.values(IRREGULAR_MAP).flat())];
const HUMBLE_WORDS = [...new Set(Object.values(HUMBLE_MAP).flat())];

const usedIrregular = new Set();      // '반말→높임말' 표에서 실제로 쓴 낱말
const usedHumble = new Set();         // '반말→겸양어' 표에서 실제로 쓴 낱말
const summaryIrregular = new Set();   // 요약표에 적힌 높임말
const summaryHumble = new Set();      // 요약표에 적힌 겸양어
let tablesChecked = 0;
let cellsChecked = 0;

for (const c of HON_COURSES) {
  for (const l of c.lessons ?? []) {
    for (const [bi, b] of (l.blocks ?? []).entries()) {
      if (b.t !== 'table') continue;
      const at = `${c.id}/${l.id} 표 ${bi + 1}`;

      // ── 사전형 → 활용형 표: 받침 규칙 대조 ──────────────────
      if (b.head?.[0] === 'Dictionary form') {
        tablesChecked++;
        for (const [ri, row] of (b.rows ?? []).entries()) {
          const dict = row[0];
          const info = stemInfo(dict);
          const where = `${at} ${ri + 1}행 (${dict})`;
          if (!info) { problems.push(`${where}: 사전형을 못 읽음 — '다'로 끝나야 한다`); continue; }

          const resultRaw = row[row.length - 1];
          const result = String(resultRaw).replace(/\*\*/g, '').replace(/\?$/, '');
          const family = FAMILIES.find((f) => result.endsWith(f));
          if (!family) {
            problems.push(`${where}: 결과 칸 '${resultRaw}' 이 아는 존댓말 어미로 안 끝남 (${FAMILIES.join('/')})`);
            continue;
          }
          cellsChecked++;
          const expected = expectedForm(dict, family) + (String(resultRaw).trim().endsWith('?') ? '?' : '');
          const actual = String(resultRaw).replace(/\*\*/g, '');
          if (expected !== actual) {
            problems.push(`${where}: '${dict}' + -${family} 는 '${expected}' 여야 하는데 표에는 '${actual}' 로 적혀 있다`);
          }

          if (row.length >= 3 && !info.alreadyHonorific) {
            const label = row[1];
            if (!batchimLabelMatches(label, info)) {
              problems.push(`${where}: 받침 칸 '${label}' 이 실제 받침과 안 맞는다 (어간 '${info.stem}')`);
            }
          }

          // 불규칙 낱말을 사전형 칸에 '규칙 활용 대상'으로 잘못 올린 경우.
          // (드시다처럼 이미 불규칙 어간 자체를 적은 것은 정상이라 건드리지 않는다.)
          const plainRoot = dict.split('—')[0].trim();
          if (IRREGULAR_MAP[plainRoot]) {
            problems.push(`${where}: '${plainRoot}'는 불규칙 낱말이다 — 사전형 칸에는 ` +
              `${IRREGULAR_MAP[plainRoot].join('/')} 같은 불규칙 어간을 적어야 한다`);
          }
        }
      }

      // ── Plain → Honorific / Plain → Humble 목록 표: 짝이 맞는지 대조 ──
      if (b.head?.includes('Plain') && b.head?.includes('Honorific')) {
        checkPairTable(b, at, 'Honorific', IRREGULAR_MAP, usedIrregular);
      }
      if (b.head?.includes('Plain') && b.head?.includes('Humble')) {
        checkPairTable(b, at, 'Humble', HUMBLE_MAP, usedHumble);
      }

      // ── 요약표('… at a glance')가 담은 낱말 모으기 ──────────
      if (/glance/i.test(b.h ?? '')) {
        const flat = JSON.stringify(b.rows);
        for (const w of IRREGULAR_WORDS) if (flat.includes(w)) summaryIrregular.add(w);
        for (const w of HUMBLE_WORDS) if (flat.includes(w)) summaryHumble.add(w);
      }
    }
  }
}

// ── 요약표 완결성: 실제로 가르치는 낱말이 요약표에도 있는가 ──────
for (const w of usedIrregular) {
  if (!summaryIrregular.has(w)) {
    problems.push(`요약표('한눈에 보는 …')에 높임말 '${w}' 가 안 보인다 — 반말→높임말 표에서는 가르치는데 ` +
      '맨 위 요약에는 빠져 있다. 학습자가 처음 보는 표가 낡아 있는 것이다.');
  }
}
for (const w of usedHumble) {
  if (!summaryHumble.has(w)) {
    problems.push(`요약표('한눈에 보는 …')에 겸양어 '${w}' 가 안 보인다 — 반말→겸양어 표에서는 가르치는데 ` +
      '맨 위 요약에는 빠져 있다. 학습자가 처음 보는 표가 낡아 있는 것이다.');
  }
}

console.log(`존댓말 코스 ${HON_COURSES.length}개, 사전형→활용형 표 ${tablesChecked}개, 칸 ${cellsChecked}개 확인.`);
console.log(`높임말 — 쓰는 곳 ${usedIrregular.size}개 / 요약표 ${summaryIrregular.size}개.` +
  `  겸양어 — 쓰는 곳 ${usedHumble.size}개 / 요약표 ${summaryHumble.size}개.`);

if (problems.length) {
  console.error(`\n문제 ${problems.length}개:\n` + problems.join('\n'));
  process.exit(1);
}
console.log('문제 없음');
