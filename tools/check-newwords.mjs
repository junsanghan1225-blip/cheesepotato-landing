/* 새로 받은 문항에서 **처음 보는 낱말**을 뽑는다.
 *
 *   node tools/check-newwords.mjs <파일.json>
 *
 * 왜 필요한가. 2회차를 받았을 때 「매립되거나 **점각** 처리되어」, 「비밀
 * **임찰관**」, 「**봉수아**나 마패」가 들어 있었다. 셋 다 없는 말이다.
 * check-topik2 는 이런 것을 못 본다 — 모양도 급수도 정답 자리도 다 맞기
 * 때문이다. 결국 50문항을 사람이 다 읽어서 찾았다.
 *
 * 기계가 「이 말이 있는 말이냐」를 판단할 수는 없다. 사전이 없어서다.
 * 대신 **읽을 것을 줄여 줄 수는 있다.** 이미 사람이 검토한 자료(기존 문항,
 * 예문, 뜻풀이 사전)에 한 번도 안 나온 낱말만 골라 내면, 50문항을 다
 * 읽는 대신 낱말 목록만 훑으면 된다.
 *
 * **없는 말은 대개 한 번만 나온다.** 진짜 소재어(촉매·편광·미닝아웃)는
 * 지문 안에서 되풀이되지만, 잘못 쓴 말은 한 번 나오고 만다. 그래서 딱 한
 * 번 나온 것을 위로 올린다.
 *
 * 이 도구는 「틀렸다」고 말하지 않는다. 「여기부터 보라」고만 말한다.
 */
import { readFileSync, existsSync } from 'node:fs';
import { TOPIK_READING } from '../topik.js';
import { TOPIK2_READING } from '../topik2.js';
import { SB_CATS, SB_MORE } from '../sentences.js';
import { GLOSSARY } from '../glossary.js';

const file = process.argv[2];
if (!file) { console.error('쓰기: node tools/check-newwords.mjs <파일.json>'); process.exit(2); }

/* 국어사전 표제어 목록. 있으면 이 도구가 「처음 보는 말」이 아니라
   **「사전에 없는 말」**을 짚는다 — 목록이 사백 개에서 몇 개로 줄어든다.
   한 줄에 한 낱말, 주석은 # 로 시작한다.

   없어도 돌아간다. 그때는 이미 검토한 자료에 안 나온 말을 모두 보여 주고,
   사람이 눈으로 훑는다. */
const DICT_PATH = new URL('../data/korean-words.txt', import.meta.url);
let dict = null;
if (existsSync(DICT_PATH)) {
  dict = new Set(readFileSync(DICT_PATH, 'utf8').split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#')));
}

/* 조사를 뗀다. 「봉수아나」와 「봉수아」를 따로 세면 목록만 길어진다.
   긴 것부터 떼야 「에서」가 「에」+「서」로 잘리지 않는다. */
const JOSA = ['으로부터', '에서부터', '이라고', '라고는', '에게서', '한테서', '으로는', '까지도',
  '에서는', '에서도', '이라는', '라는', '으로', '에게', '한테', '까지', '부터', '보다', '처럼',
  '마다', '조차', '밖에', '이나', '든지', '라도', '에는', '에도', '에서', '와는', '과는',
  '들이', '들을', '들은', '들의', '들과',
  '은', '는', '이', '가', '을', '를', '의', '에', '도', '만', '과', '와', '로', '나'];
const strip = (w) => {
  for (const j of JOSA) if (w.length > j.length + 1 && w.endsWith(j)) return w.slice(0, -j.length);
  return w;
};
const words = (text) => String(text ?? '').split(/\s+/)
  .map((w) => strip(w.replace(/[^가-힣]/g, '')))
  .filter((w) => w.length >= 2);

const textsOf = (q) => [q.passage, q.sentence, q.question, q.why, q.mark, ...(q.options || [])]
  .filter(Boolean).join(' ');

/* ── 이미 사람이 본 말들 ───────────────────────────────────────
   낱말을 통째로만 담으면 활용형이 전부 「처음 보는 말」이 된다. 「가능성」을
   보았어도 「가능하다고」는 처음 보는 꼴이라, 그렇게 세면 목록이 팔백 개가
   되어 아무도 안 읽는다 — 실제로 그랬다.

   그래서 **앞머리까지 함께 담는다.** 「가능성」을 담을 때 「가능」도 같이
   담아 두면, 나중에 「가능하다고」가 와도 앞머리 「가능」이 아는 말이라
   걸리지 않는다. 반대로 「점각」은 어느 앞머리도 본 적이 없어 걸린다.

   어간을 규칙으로 찾지 않는 까닭 — 한국어 용언 활용은 규칙으로 안 잘린다.
   앞에서부터 아는 데까지만 보는 편이 어설픈 형태소 분석보다 덜 틀린다. */
const known = new Set();
const add = (w) => { for (let n = 2; n <= w.length; n++) known.add(w.slice(0, n)); };
const learn = (text) => words(text).forEach(add);

for (const q of [...TOPIK_READING, ...TOPIK2_READING]) learn(textsOf(q));
for (const c of SB_CATS) {
  learn(c.ko);
  for (const p of c.points) {
    learn(`${p.name} ${p.desc} ${p.ex}`);
    (p.dlg || []).forEach(learn);
    (SB_MORE[p.id] || []).forEach(learn);
  }
}
Object.keys(GLOSSARY).forEach(add);

/* ── 받은 파일 ──────────────────────────────────────────────── */
let rows;
try { rows = JSON.parse(readFileSync(file, 'utf8')); }
catch (e) { console.error('JSON 을 못 읽었다:', e.message); process.exit(2); }
if (!Array.isArray(rows)) { console.error('배열이 아니다.'); process.exit(2); }

/* 새로 받은 문항이 이미 자료에 들어가 있으면 저 자신을 「본 적 있다」고
   세게 된다. id 로 걸러 낸다. */
const incoming = new Set(rows.map((q) => q.id));
if ([...incoming].some((id) => TOPIK2_READING.some((q) => q.id === id))) {
  /* 자기 자신을 뺀 나머지로 다시 센다. 안 그러면 「이미 있는 말」이 되어
     새로 받은 문항의 낱말이 하나도 안 걸린다. */
  known.clear();
  for (const q of [...TOPIK_READING, ...TOPIK2_READING]) {
    if (incoming.has(q.id)) continue;
    learn(textsOf(q));
  }
  for (const c of SB_CATS) {
    learn(c.ko);
    for (const p of c.points) {
      learn(`${p.name} ${p.desc} ${p.ex}`);
      (p.dlg || []).forEach(learn);
      (SB_MORE[p.id] || []).forEach(learn);
    }
  }
  Object.keys(GLOSSARY).forEach(add);
}

const seen = new Map();   // 낱말 → 나온 문항 id 들
for (const q of rows) {
  for (const w of new Set(words(textsOf(q)))) {
    if (!seen.has(w)) seen.set(w, []);
    seen.get(w).push(q.id);
  }
}

/* 앞머리가 하나라도 아는 말이면 넘어간다. 두 글자부터 보는 이유는 한
   글자 앞머리(「가」「점」)까지 아는 말로 치면 무엇이든 다 통과하기 때문이다. */
const rooted = (w) => {
  for (let n = 2; n <= w.length; n++) if (known.has(w.slice(0, n))) return true;
  return false;
};

/* 사전이 있으면 사전이 판단한다. 낱말 그 자체가 사전에 있거나, 앞머리가
   사전에 있으면(「감축하여」의 「감축」) 있는 말로 본다. */
const inDict = (w) => {
  if (!dict) return false;
  for (let n = 2; n <= w.length; n++) if (dict.has(w.slice(0, n))) return true;
  return false;
};

const fresh = [...seen.entries()]
  .filter(([w]) => !rooted(w) && !inDict(w))
  .map(([w, ids]) => ({ w, ids }))
  .sort((a, b) => a.ids.length - b.ids.length || a.w.localeCompare(b.w));

const once = fresh.filter((x) => x.ids.length === 1);
const more = fresh.filter((x) => x.ids.length > 1);

console.log(`문항 ${rows.length}개 · ${dict ? '사전에 없는 낱말' : '처음 보는 낱말'} ${fresh.length}개`);
console.log(dict
  ? `(data/korean-words.txt 의 표제어 ${dict.size}개와 이미 검토한 자료에 견줬다)\n`
  : '(이미 검토한 자료 — 기존 문항·예문·뜻풀이 사전 — 에 한 번도 안 나온 말)\n');

if (once.length) {
  console.log(`── 한 번만 나온 말 ${once.length}개 — 여기부터 보라 ──`);
  console.log('   잘못 쓴 말은 대개 한 번 나오고 만다. 「점각」「임찰관」이 그랬다.\n');
  once.forEach(({ w, ids }) => console.log(`   ${w}  (${ids[0]})`));
}
if (more.length) {
  console.log(`\n── 두 번 이상 나온 말 ${more.length}개 — 대개 소재어다 ──\n`);
  console.log('   ' + more.map(({ w, ids }) => `${w}(${ids.length})`).join(' · '));
}

/* 여기서 종료 코드를 1로 두지 않는다. 처음 보는 말이 있는 것은 잘못이
   아니라 새 지문이라는 뜻이다. 사람이 보라는 말만 하고 물러난다. */
console.log('\n※ 이 목록은 「틀렸다」가 아니라 「눈으로 보라」는 뜻이다.');
if (!dict) {
  console.log('※ data/korean-words.txt (국어사전 표제어, 한 줄에 하나) 를 넣으면');
  console.log('   이 목록이 「사전에 없는 말」만 남아 몇 개로 줄어든다.');
}
