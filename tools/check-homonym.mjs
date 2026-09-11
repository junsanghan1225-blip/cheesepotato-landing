#!/usr/bin/env node
/* 동음이의어 검사기 — node tools/check-homonym.mjs
 *
 * 「다리를 건너다」의 다리를 눌렀을 때 사전이 **leg** 이라고 알려 준다.
 * 「김밥」의 김을 누르면 **steam** 이라고 한다. 「눈이 왔어요」의 눈은
 * 「더 보기」를 눌러도 눈(雪) 이 안 나온다 — 눈(眼) 의 뜻만 셋 나온다.
 *
 * 이것은 맞춤법 검사기가 잡을 수 있는 종류의 잘못이 아니다. **자료가 이미
 * 그렇게 되어 있다.** 그리고 틀린 뜻은 빈 칸보다 나쁘다 — 빈 칸은 채우면
 * 되지만 틀린 뜻은 외우고 나서야 안다.
 *
 * ── 왜 이렇게 됐나 ──────────────────────────────────────────────────
 *
 * 국립국어원 자료는 동음이의어를 **번호로 가른다.** 「눈01」(眼) 과
 * 「눈02」(雪) 는 서로 다른 표제어다. 그런데 tools/build-krdict-glossary.mjs
 * 가 표제어를 받을 때 이렇게 한다.
 *
 *     const bare = word.replace(/[^가-힣]/g, '');    // 「눈01」 → 「눈」
 *
 * 번호가 지워지고 나면 둘이 같은 열쇠가 되어 한 칸에 합쳐진다. 그리고
 * 품사는 먼저 온 것만 남는다(`if (!row.pos && pos)`). 「차」의 품사가
 * 접사(次) 로 적혀 있는 까닭이 이것이다 — 학습자가 누르는 차는 車 나 茶 다.
 *
 * 합쳐진 뒤 뜻이 **셋까지만** 남았다. 우리 자료에 실린 표제어 가운데 뜻이
 * 넷 이상인 것은 하나도 없다. 그래서 뒤쪽에 있던 동음이의어가 통째로
 * 잘려 나갔다 — 눈(雪)·차(車)·김(海苔)·다리(橋)·말(馬) 이 그렇게 없어졌다.
 *
 * ── 여기서 무엇을 하나 ──────────────────────────────────────────────
 *
 * **동음이의어를 갈라 주지는 못한다.** 「배가 아파요」의 배가 腹 인지 舟 인지
 * 기계가 알려면 뜻을 알아야 하고, 그러려면 형태소 분석기와 의미 태그가
 * 있어야 한다. 이 저장소에는 없고, 어설프게 짐작하면 틀린 뜻을 지어낸다.
 *
 * 대신 **자료가 뭉개진 자리를 정확히 짚는다.** 셈으로 확실한 것만 본다.
 *
 *   1) 남의 낱말 자료가 끼어든 표제어 — 「다리」칸에 「다리다」의 활용형
 *   2) 품사가 섞인 표제어 — pos 를 못 믿는다. 검사기들이 그걸 믿고 있었다
 *   3) 뜻이 셋로 꽉 찬 표제어 — 잘렸을 자리다. 지문에 자주 나오는 순으로
 *
 * 1·2 는 못 박는다. 3 은 사람이 봐야 안다.
 *
 *   node tools/check-homonym.mjs            넘어가기로 적어 둔 것은 빼고
 *   node tools/check-homonym.mjs --all      전부
 *   node tools/check-homonym.mjs --accept   지금 나온 것을 넘어가기로
 *   node tools/check-homonym.mjs --limit=60
 */
import { SENSES } from '../glossary-senses.js';
import { GLOSSARY } from '../glossary.js';
import { loadCorpus } from './lib/corpus.mjs';
import { Lint } from './lib/lint.mjs';
import { senseKind, mixedPos } from './lib/dict.mjs';

const CAP_GUESS = 3;
const lint = new Lint('동음이의어');
const corpus = await loadCorpus();

/* 지문에 그 꼴 그대로 몇 번 나오는가. 학습자가 누를 수 있는 횟수다 —
   한 번도 안 나오는 낱말이 뭉개진 것은 급할 것이 없다. */
const seen = new Map();
for (const r of corpus) for (const t of r.text.match(/[가-힣]+/g) || []) seen.set(t, (seen.get(t) || 0) + 1);

/* 뜻풀이 자리는 낱말 자체다. 자리 이름을 그 낱말로 적어 준다. */
const at = (w) => ({ file: 'glossary-senses.js', path: `SENSES.${w}`, id: w, text: `${w} — ${GLOSSARY[w]?.en || '뜻 없음'}` });

const defOf = (s) => String(Array.isArray(s) ? s[0] : s);
const kindsOf = (w) => new Set((SENSES[w] || []).map((s) => senseKind(defOf(s))));

/* 학습자가 눌러서 뜻을 볼 만한 낱말인가.
 *
 * 「는」·「가」·「각」도 한 칸에 갈래가 섞여 있지만, 그것은 조사와 어미라
 * 학습자가 눌러서 뜻을 찾는 말이 아니다. 그런 것까지 늘어놓으면 목록이
 * 문법 형태소로 덮이고, 정작 봐야 할 「차」·「배」·「다리」가 묻힌다.
 *
 * 뜻 가운데 하나라도 낱말이고, 카드에 내보낼 영어 뜻이 있는 것만 본다. */
const isContentWord = (w) => kindsOf(w).has('낱말') && !!(GLOSSARY[w]?.en || '').trim();

/* ── 1. 남의 낱말 자료가 끼어든 표제어 ──────────────────────────────
 *
 * 뜻풀이 자리에 이런 것이 들어 있다.
 *
 *     (다리고, 다리는데, 다리니, 다리면, 다린, …)→ 다리다
 *
 * 이것은 뜻이 아니라 **다른 낱말(다리다)의 활용형 안내다.** 「다리」를 찾다가
 * 「다리다」의 어간에 걸린 것이다. 학습자가 「다리를 건너다」의 다리를 누르면
 * 첫 줄에 옷 다리는 법이 나온다. */
for (const [w, ss] of Object.entries(SENSES)) {
  if (!Array.isArray(ss)) continue;
  for (const s of ss) {
    const d = defOf(s);
    const m = d.match(/^\(([^)]*)\)\s*→\s*(\S+)$/);
    if (!m || m[2] === w) continue;
    lint.add('남의 낱말이 끼어들었다', 'bad', at(w), {
      found: `${w} 의 뜻풀이에 「${m[2]}」`, want: null,
      why: `「${w}」 칸에 「${m[2]}」의 활용형 안내가 들어 있다 — 뜻이 아니다`,
    });
    break;
  }
}

/* ── 2. 품사가 섞인 표제어 ──────────────────────────────────────────
 *
 * 한 칸에 접사와 명사가 같이 있으면 그것은 한 낱말이 아니라 **두 낱말이
 * 합쳐진 것이다.** 그리고 pos 는 먼저 온 것 하나만 남아 있으므로 못 믿는다.
 *
 * 이것이 검사기 문제이기도 하다. check-spelling 의 조사 검사는 「앞말이
 * 사전에 있는 명사일 때만」 잘못이라고 못 박는데, 그 판정을 이 pos 로
 * 한다. 「차」가 접사라고 적혀 있으면 「차를」을 아예 안 본다. */
const mixed = [...mixedPos()].filter(isContentWord)
  .map((w) => [w, seen.get(w) || 0]).sort((a, b) => b[1] - a[1]);
for (const [w, n] of mixed) {
  lint.add('품사가 섞였다', 'bad', at(w), {
    found: `${w} — ${[...kindsOf(w)].join('+')} 가 한 칸에 · 지문에 ${n}번 · pos=${GLOSSARY[w]?.pos || '없음'}`,
    want: null,
    why: '한 칸에 갈래가 다른 뜻이 섞였다 — 동음이의어가 합쳐진 자리이고, 그 칸의 pos 는 먼저 온 것일 뿐이라 못 믿는다',
  });
}

/* ── 3. 셈으로 못 가르는 것 ────────────────────────────────────────
 *
 * 여기서 한 번 더 해 보려 했고, 두 번 다 헛짚었다. 남겨 둔다 — 다음 사람이
 * 같은 길을 또 가지 않도록.
 *
 * **시도 1: 뜻이 셋으로 꽉 찬 표제어를 잘린 자리로 본다.**
 * 우리 자료에 뜻이 넷 이상인 표제어는 하나도 없다. 그러니 셋인 것은 끊긴
 * 것이 맞다. 그런데 그런 표제어가 903개다. 지문에 자주 나오는 차례로
 * 늘어놓으니 「때」(1016번)·「어떤」(849번)·「것」(568번)이 앞에 섰다.
 * 자주 나오는 것과 뜻이 뭉개진 것은 아무 상관이 없었다.
 *
 * **시도 2: 손으로 적은 en 을 뜻풀이가 받치는지 본다.**
 * 「눈 = eye; snow」인데 뜻풀이에는 eye 밖에 없다. 이거다 싶었는데, 같은
 * 잣대로 281개가 걸렸고 앞줄은 이랬다.
 *
 *     때   en="time; moment"   뜻풀이에 moment 가 없다
 *     집   en="house; home"    뜻풀이에 home 이 없다
 *
 * 「moment」가 없는 것은 동음이의어라서가 아니라 **영어를 달리 적었을
 * 뿐이다.** 이 잣대는 동음이의어를 재는 것이 아니라 번역 표현의 차이를
 * 재고 있었다.
 *
 * ── 그래서 결론 ──
 *
 * **글자만 가지고는 동음이의어를 못 가른다.** 「배가 아파요」의 배와
 * 「배를 타요」의 배는 글자가 같고 앞뒤도 비슷하다. 사람은 뜻으로 가르고,
 * 기계는 뜻을 모른다.
 *
 * 가르려면 자료에 **동형어 번호**가 있어야 한다. 국립국어원 자료에는 있고,
 * 우리가 굽는 자리에서 지웠다(맨 위 참고). 없는 근거로 짐작해서 찍으면
 * 틀린 뜻을 지어내는 것이고, 그것은 지금 상태보다 나쁘다.
 *
 * 그래서 아래는 **찾은 잘못이 아니라 알아 둘 셈이다.** */
const capped = Object.entries(SENSES)
  .filter(([w, ss]) => Array.isArray(ss) && ss.length === CAP_GUESS && isContentWord(w) && (seen.get(w) || 0) > 0);
const CAP_GUESS_NOTE = capped.length;

/* ── 끝 ──────────────────────────────────────────────────────────── */
const rc = lint.report(
  `뜻이 여럿인 표제어 ${Object.keys(SENSES).length.toLocaleString()}개를 봤다.\n` +
  `뜻이 넷 이상인 표제어는 하나도 없다 — 어딘가에서 셋에서 끊었다는 뜻이다.\n` +
  `학습자가 누를 만한 낱말 가운데 ${CAP_GUESS_NOTE}개가 그렇게 셋으로 꽉 차 있다.`);

if (!lint.accept) {
  console.log('\n뿌리를 고치려면 — 이 검사기는 증상만 센다');
  console.log('  1. tools/build-krdict-glossary.mjs 의 `word.replace(/[^가-힣]/g, \'\')` 가');
  console.log('     「눈01」의 동형어 번호를 지운다. 번호를 살려 열쇠로 쓰면 동음이의어가 안 합쳐진다.');
  console.log('  2. 그러려면 국립국어원 「한국어기초사전」 내려받기 폴더가 있어야 한다.');
  console.log('     node tools/build-krdict-glossary.mjs <내려받은_폴더>');
  console.log('  3. 화면도 손봐야 한다 — 한 낱말에 뜻 묶음이 여럿이라는 것을 보여 줘야 하고,');
  console.log('     지금은 뜻을 한 줄로 이어 붙여 「eye; snow」처럼 내보내고 있다.');
}
process.exit(rc);
