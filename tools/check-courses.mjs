/*
 * 코스 데이터 검사기
 *
 * 이 저장소는 푸시하면 1~2분 뒤 everykoreans.com 에 그대로 나간다.
 * 레슨 하나가 풀 수 없는 상태로 올라가면 학습자는 거기서 막히고,
 * 우리는 누가 알려 주기 전까지 모른다. 그래서 올리기 전에 여기서 거른다.
 *
 * 실행: node tools/check-courses.mjs
 *
 * 잡아내는 것
 *   - 레슨 id 중복 — lesson_progress 가 id 로만 기록돼서 진도가 섞인다
 *   - 보기 밖을 가리키는 answer — 무엇을 골라도 오답이 된다
 *   - type 문제의 정답이 keys 에 없음 — 한글 자판 없는 사람은 못 푼다
 *   - order 문제의 tokens 와 answer 조각이 다름 — 맞출 수가 없다
 *   - needs 가 없는 코스를 가리킴 — 영영 안 열린다
 *   - 표의 칸 수가 머리글과 다름 — 칸이 밀린다
 */
import { COURSES } from '../courses.js';

const BLOCK_TYPES = new Set([
  'text', 'note', 'chars', 'table', 'choice', 'listen', 'type', 'order', 'pair', 'speak', 'cloze',
]);

const problems = [];
const lessonIds = new Map();
const courseIds = new Set();
let lessons = 0;
let blocks = 0;

for (const c of COURSES) {
  if (courseIds.has(c.id)) problems.push(`코스 id 중복: ${c.id}`);
  courseIds.add(c.id);

  for (const key of ['id', 'emoji', 'title', 'tagline', 'blurb', 'level']) {
    if (!c[key]) problems.push(`코스 ${c.id}: ${key} 없음`);
  }
  if (c.needs && !COURSES.some((x) => x.id === c.needs)) {
    problems.push(`코스 ${c.id}: needs '${c.needs}' 가 없는 코스를 가리킴 — 영영 안 열린다`);
  }

  for (const l of c.lessons ?? []) {
    lessons++;
    if (lessonIds.has(l.id)) {
      problems.push(`레슨 id 중복: ${l.id} (${lessonIds.get(l.id)} 와 ${c.id}) — 진도가 섞인다`);
    }
    lessonIds.set(l.id, c.id);
    if (!l.title) problems.push(`레슨 ${l.id}: title 없음`);
    if (!l.blocks?.length) problems.push(`레슨 ${l.id}: blocks 없음`);

    for (const [i, b] of (l.blocks ?? []).entries()) {
      blocks++;
      const at = `${l.id} 블록 ${i + 1} (${b.t})`;
      if (!BLOCK_TYPES.has(b.t)) { problems.push(`${at}: 모르는 종류`); continue; }

      if ((b.t === 'text' || b.t === 'note') && !b.md) problems.push(`${at}: md 없음`);
      if (b.t === 'chars' && !b.items?.length) problems.push(`${at}: items 없음`);

      if (b.t === 'table') {
        if (!b.head?.length) problems.push(`${at}: head 없음`);
        else for (const r of b.rows ?? []) {
          if (r.length !== b.head.length) {
            problems.push(`${at}: 칸 수가 머리글과 다름 (${r.length} vs ${b.head.length})`);
          }
        }
      }

      if (b.t === 'choice' || b.t === 'listen') {
        if (!b.options?.length) problems.push(`${at}: options 없음`);
        else if (typeof b.answer !== 'number' || !b.options[b.answer]) {
          problems.push(`${at}: answer 가 보기를 벗어남 (answer=${b.answer}, 보기 ${b.options.length}개)`);
        }
        if (b.t === 'listen' && !b.say) problems.push(`${at}: say 없음`);
      }

      if (b.t === 'type') {
        if (!b.answer) problems.push(`${at}: answer 없음`);
        // 키를 누르면 입력칸이 그 글자로 통째로 바뀐다(index.html 의 type 처리).
        // 조합식 자판이 아니라서 정답이 keys 안에 통째로 있어야 한다.
        else if (b.keys && !b.keys.includes(b.answer)) {
          problems.push(`${at}: 정답 '${b.answer}' 이 keys 안에 없음 — 자판 없는 사람은 못 푼다`);
        }
      }

      if (b.t === 'order') {
        if (!b.tokens?.length || !b.answer?.length) problems.push(`${at}: tokens/answer 없음`);
        else if ([...b.tokens].sort().join('|') !== [...b.answer].sort().join('|')) {
          problems.push(`${at}: tokens 와 answer 의 조각이 다름 — 맞출 수가 없다`);
        }
      }

      if (b.t === 'pair' && !b.pairs?.length) problems.push(`${at}: pairs 없음`);
      if (b.t === 'speak' && !b.say) problems.push(`${at}: say 없음`);

      if (b.t === 'cloze') {
        if (!b.sentence) problems.push(`${at}: sentence 없음`);
        const hasBracket = /\[([^\]]+)\]/.test(b.sentence);
        if (!b.answer && !hasBracket) {
          problems.push(`${at}: answer 없고 sentence 에 [정답] 대괄호 마킹도 없음 — 빈칸과 정답을 알 수 없음`);
        }
        if (!b.options?.length) problems.push(`${at}: options 없음`);
        else if (b.options.length < 2) problems.push(`${at}: options 가 ${b.options.length}개 — 2개 이상 필요`);
        const effectiveAnswer = b.answer ?? (b.sentence.match(/\[([^\]]+)\]/) || [])[1];
        if (effectiveAnswer && !b.options.includes(effectiveAnswer)) {
          problems.push(`${at}: 정답 '${effectiveAnswer}' 이 options 배열 안에 없음 — 무엇을 골라도 오답이 된다`);
        }
        if (b.keys && effectiveAnswer && !b.keys.includes(effectiveAnswer)) {
          problems.push(`${at}: 정답 '${effectiveAnswer}' 이 keys 안에 없음 — 자판 없는 사람은 못 푼다`);
        }
      }
    }
  }
}

console.log(`코스 ${COURSES.length} / 레슨 ${lessons} / 블록 ${blocks}`);
console.log('코스: ' + COURSES.map((c) => `${c.id}(${c.lessons.length})`).join(', '));

if (problems.length) {
  console.error(`\n문제 ${problems.length}개:\n` + problems.join('\n'));
  process.exit(1);
}
console.log('문제 없음');
