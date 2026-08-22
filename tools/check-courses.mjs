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
 *   - 이전 커밋에 있던 레슨 id 가 말없이 사라짐 — 진도가 고아가 된다
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { COURSES } from '../courses.js';

/* 일부러 없앤 레슨 id.
 *
 * lesson_progress 는 lesson_id 문자열 하나로만 기록한다. id 를 바꾸면 그
 * 레슨을 끝낸 사람의 행이 어느 레슨에도 안 붙는 고아가 되고, 화면에는 안 푼
 * 것으로 나온다. 무엇이 무엇으로 바뀌었는지 아무 데도 안 남아서 되돌릴
 * 방법이 없다.
 *
 * 그래서 없어진 id 는 기본이 실패다. 정말 버리기로 했으면 여기에 적고 왜
 * 버렸는지 남긴다. 적는 순간 그건 사고가 아니라 결정이 된다.
 *
 * 형식:  'gr-01',   // 2026-08-06 왜 버렸는지 한 줄
 */
const RETIRED = new Set([
  // 아직 없다. 지금까지 발행한 레슨 id 는 전부 살아 있다.
]);

/* ── 이전 커밋과 견주기 ────────────────────────────────────────
 *
 * HEAD 판 코스 파일을 임시 폴더에 그대로 풀어서 import 한다. 정규식으로
 * id 를 긁으면 주석 안의 id 까지 잡히고, 코스 id 와 레슨 id 를 가릴 수 없어
 * 이름 모양으로 어림잡게 된다. 그 어림이 틀리면 검사기가 조용히 거짓말을
 * 한다 — 실제로 읽어 오면 그럴 일이 없다.
 *
 * git 이 없거나 저장소가 아니면 이 검사만 건너뛴다. 검사기 전체가 다른
 * 이유로 죽기 시작하면 사람들은 검사기를 안 돌린다.
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* 파일 이름을 적어 두지 않고 HEAD 에서 찾는다.
   처음에는 셋을 손으로 적었는데, courses-grammar-beginner.js 가 늘자
   courses.js 가 그 파일을 import 하면서 임시 폴더에서 풀리지 않았고,
   검사는 조용히 "건너뜀" 이 됐다. 지키라고 만든 것이 새 파일 하나에
   꺼지면 없는 것만 못하다. */
async function lessonIdsAtHead() {
  let tracked;
  try {
    // ls-tree 에 'courses*.js' 를 pathspec 으로 주면 아무것도 안 나온다.
    // 전부 받아서 여기서 거른다.
    tracked = execFileSync('git', ['ls-tree', '--name-only', 'HEAD'],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\n').map((s) => s.trim())
      .filter((f) => /^courses[\w.-]*\.js$/.test(f));
  } catch (e) {
    return null;
  }
  if (!tracked.includes('courses.js')) return null;

  const dir = mkdtempSync(join(tmpdir(), 'cp-courses-'));
  try {
    for (const f of tracked) {
      const src = execFileSync('git', ['show', `HEAD:${f}`],
        { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
      writeFileSync(join(dir, f), src);
    }
    const old = await import(pathToFileURL(join(dir, 'courses.js')).href);
    const ids = new Set();
    for (const c of old.COURSES ?? []) {
      for (const l of c.lessons ?? []) if (l.id) ids.add(l.id);
    }
    return ids;
  } catch (e) {
    // HEAD 판이 읽히지 않는다. 지금 판의 문제는 아니다.
    console.warn(`(이전 커밋을 읽지 못해 레슨 id 유실 검사를 건너뜀: ${e.message})`);
    return null;
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch (e) { /* 임시 폴더 */ }
  }
}

const norm2 = (s) => String(s).trim().replace(/\s+/g, ' ').replace(/[.!?~]+$/, '');

const BLOCK_TYPES = new Set([
  'text', 'note', 'chars', 'table', 'choice', 'listen', 'type', 'order', 'pair', 'speak', 'cloze', 'build',
]);

/* 화면이 실제로 읽는 밭 이름. 여기 없는 이름으로 글을 써 두면 화면은
   그것을 모르므로 **아무 말 없이 버린다.** 실제로 그런 일이 있었다 —
   중급·고급 여섯 레슨의 발음 안내가 speak 블록에 guide 로 적혀 있었는데,
   화면은 q 만 그려서 여섯 줄이 통째로 안 보이고 있었다. 오타 하나로
   글이 조용히 사라지는 길이라 이름을 못박아 둔다. */
const BLOCK_KEYS = new Set([
  't', 'h', 'md', 'q', 'why', 'head', 'rows', 'items', 'wide',
  'options', 'answer', 'keys', 'tokens', 'pairs',
  'say', 'rom', 'audio', 'sentence', 'meaning',
  // 문장 만들기(build) — 허용 답 여럿, 낱말 은행, 꼭 들어갈 조각, 힌트
  'answers', 'bank', 'must', 'hint',
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
      Object.keys(b).forEach((k) => {
        if (!BLOCK_KEYS.has(k)) problems.push(`${at}: 모르는 밭 '${k}' — 화면이 안 읽으므로 글이 그냥 사라진다`);
      });
      /* 굵게 표시가 홀수면 여는 자리만 있고 닫는 자리가 없다. 그러면 그
         뒤가 통째로 굵어져서 어디가 중요한지 못 가른다. 실제로 그런 일이
         있었다 — ad-01-01 의 note 하나가 「사체(사는)**가 되지만」처럼
         닫히지 않은 채 올라올 뻔했다. */
      [b.md, b.why, b.q].filter(Boolean).forEach((str) => {
        if ((String(str).match(/\*\*/g) || []).length % 2)
          problems.push(`${at}: 굵게 표시(**)가 짝이 안 맞는다 — 뒤가 통째로 굵어진다`);
      });

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

      /* 문장 만들기.
         answers 가 비면 무엇을 쳐도 안 맞는다 — 학습자가 레슨 끝에서
         막힌다. must 조각은 answers 안에 실제로 들어 있어야 한다.
         안 그러면 정답을 쳐도 「~가 없어요」 가 뜬다. */
      if (b.t === 'build') {
        if (!b.q) problems.push(`${at}: q 없음 — 무엇을 만들라는 건지 알 수 없다`);
        if (!b.answers?.length) problems.push(`${at}: answers 없음 — 무엇을 쳐도 안 맞는다`);
        const flat = (x) => String(x).replace(/\s/g, '').replace(/[.!?~]+$/, '');
        for (const m of b.must ?? []) {
          if (!(b.answers ?? []).some((a) => flat(a).includes(flat(m)))) {
            problems.push(`${at}: must 조각 '${m}' 이 어느 answers 에도 없다 — 정답을 써도 틀렸다고 한다`);
          }
        }
        for (const w of b.bank ?? []) {
          if (!String(w).trim()) problems.push(`${at}: bank 에 빈 낱말`);
        }
        /* 낱말 은행을 줬으면 정답을 그 조각들로 만들 수 있어야 한다.
           자판 없는 사람은 은행만으로 답해야 하기 때문이다.

           정답을 공백으로 쪼개 견주면 안 된다 — 조각은 '매운 음식을'
           처럼 여러 낱말짜리일 수 있다. 화면에서 조각은 누를 때마다
           공백 하나로 이어 붙으므로, 앞에서부터 조각을 이어 붙여
           정답이 되는 길이 있는지를 본다. */
        if (b.bank?.length && b.answers?.length) {
          const chips = b.bank.map(norm2).filter(Boolean);
          const canBuild = (answer) => {
            const target = norm2(answer);
            const dead = new Set();
            const walk = (pos) => {
              if (pos >= target.length) return true;
              if (dead.has(pos)) return false;
              for (const chip of chips) {
                if (!target.startsWith(chip, pos)) continue;
                const end = pos + chip.length;
                if (end === target.length) return true;
                if (target[end] !== ' ') continue;   // 조각 뒤에는 공백이 온다
                if (walk(end + 1)) return true;
              }
              dead.add(pos);
              return false;
            };
            return walk(0);
          };
          if (!b.answers.some(canBuild)) {
            problems.push(`${at}: bank 조각만으로는 어느 정답도 만들 수 없다 — 자판 없는 사람은 못 푼다`);
          }
        }
      }
      if (b.t === 'speak' && !b.say) problems.push(`${at}: say 없음`);

      if (b.t === 'cloze') {
        if (!b.sentence) problems.push(`${at}: sentence 없음`);
        const hasBracket = /\[([^\]]+)\]/.test(b.sentence);
        if (!b.answer && !hasBracket) {
          problems.push(`${at}: answer 없고 sentence 에 [정답] 대괄호 마킹도 없음 — 빈칸과 정답을 알 수 없음`);
        }
        if (!b.options?.length) problems.push(`${at}: options 없음`);
        else if (b.options.length < 2) problems.push(`${at}: options 가 ${b.options.length}개 — 2개 이상 필요`);

        /* 대괄호 검사.
           화면을 그리는 정규식은 /^(.*)\[([^\]]+)\](.*)$/s 이고 앞의 .* 이
           욕심쟁이라 **마지막 한 쌍**만 빈칸이 된다. 그래서
             · 두 쌍 이상이면 앞의 것은 대괄호째 화면에 남는다.
               상황 설명을 '[사내 회의록]' 처럼 넣으면 여기 걸린다.
             · 마지막 쌍 안의 글과 answer 가 다르면 빈칸은 대괄호 자리에
               뚫리는데 정답은 딴 것이 된다. 최악은 앞 쌍이 정답이라
               답이 화면에 그대로 노출되는 경우다.
           둘 다 실제로 나갔던 사고라 검사기가 막는다. */
        const pairs = [...(b.sentence ?? '').matchAll(/\[([^\]]+)\]/g)];
        if (pairs.length > 1) {
          problems.push(
            `${at}: 대괄호가 ${pairs.length}쌍 (${pairs.map((p) => p[1]).join(' / ')}) — ` +
            '마지막 한 쌍만 빈칸이 되고 나머지는 대괄호째 화면에 남는다.\n' +
            '  → 상황 설명은 대괄호 말고 meaning/q 로 빼거나 () 를 써라.');
        }
        const marked = pairs.length ? pairs[pairs.length - 1][1] : undefined;
        if (b.answer && marked && b.answer !== marked) {
          problems.push(
            `${at}: 빈칸은 '${marked}' 자리에 뚫리는데 answer 는 '${b.answer}' 다 — ` +
            '빈칸과 정답이 다른 자리다.');
        }
        const effectiveAnswer = b.answer ?? marked;
        if (effectiveAnswer && !b.options.includes(effectiveAnswer)) {
          problems.push(`${at}: 정답 '${effectiveAnswer}' 이 options 배열 안에 없음 — 무엇을 골라도 오답이 된다`);
        }
        if (b.keys && effectiveAnswer && !b.keys.includes(effectiveAnswer)) {
          problems.push(`${at}: 정답 '${effectiveAnswer}' 이 keys 안에 없음 — 자판 없는 사람은 못 푼다`);
        }
      }

      if (b.t === 'speak' && !b.say) problems.push(`${at}: say 없음`);

      if (b.t === 'cloze') {
        if (!b.sentence) problems.push(`${at}: sentence 없음`);
        const hasBracket = /\[([^\]]+)\]/.test(b.sentence);
        if (!b.answer && !hasBracket) {
          problems.push(`${at}: answer 없고 sentence 에 [정답] 대괄호 마킹도 없음 — 빈칸과 정답을 알 수 없음`);
        }
        if (!b.options?.length) problems.push(`${at}: options 없음`);
        else if (b.options.length < 2) problems.push(`${at}: options 가 ${b.options.length}개 — 2개 이상 필요`);
        /* 대괄호 검사.
           화면을 그리는 정규식은 /^(.*)\[([^\]]+)\](.*)$/s 이고 앞의 .* 이
           욕심쟁이라 **마지막 한 쌍**만 빈칸이 된다. 그래서
             · 두 쌍 이상이면 앞의 것은 대괄호째 화면에 남는다.
               상황 설명을 '[사내 회의록]' 처럼 넣으면 여기 걸린다.
             · 마지막 쌍 안의 글과 answer 가 다르면 빈칸은 대괄호 자리에
               뚫리는데 정답은 딴 것이 된다. 최악은 앞 쌍이 정답이라
               답이 화면에 그대로 노출되는 경우다.
           둘 다 실제로 나갔던 사고라 검사기가 막는다. */
        const pairs = [...(b.sentence ?? '').matchAll(/\[([^\]]+)\]/g)];
        if (pairs.length > 1) {
          problems.push(
            `${at}: 대괄호가 ${pairs.length}쌍 (${pairs.map((p) => p[1]).join(' / ')}) — ` +
            '마지막 한 쌍만 빈칸이 되고 나머지는 대괄호째 화면에 남는다.\n' +
            '  → 상황 설명은 대괄호 말고 meaning/q 로 빼거나 () 를 써라.');
        }
        const marked = pairs.length ? pairs[pairs.length - 1][1] : undefined;
        if (b.answer && marked && b.answer !== marked) {
          problems.push(
            `${at}: 빈칸은 '${marked}' 자리에 뚫리는데 answer 는 '${b.answer}' 다 — ` +
            '빈칸과 정답이 다른 자리다.');
        }
        const effectiveAnswer = b.answer ?? marked;

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

// ▼ 레슨 id 유실 검사: HEAD 커밋에 있던 id 가 사라졌는지 본다.
const headIds = await lessonIdsAtHead();
let idsIntact = false;
if (headIds) {
  const lost = [...headIds].filter((id) => !lessonIds.has(id) && !RETIRED.has(id));
  idsIntact = lost.length === 0;
  if (lost.length) {
    problems.push(
      `이전 커밋에 있던 레슨 id ${lost.length}개가 사라졌다: ${lost.join(', ')}\n` +
      '  → 그 레슨을 끝낸 사람의 lesson_progress 행이 고아가 된다.\n' +
      '  → 이름만 바꾼 것이면 옛 id 를 그대로 두고, 정말 버리는 것이면\n' +
      '     tools/check-courses.mjs 의 RETIRED 에 이유와 함께 적어라.');
  }
  // 다시 살아난 id 는 지워 준다 — 안 지우면 진짜 사고를 그냥 통과시킨다.
  const zombie = [...RETIRED].filter((id) => lessonIds.has(id));
  if (zombie.length) {
    problems.push(`RETIRED 에 적힌 id 가 다시 쓰이고 있다: ${zombie.join(', ')} — RETIRED 에서 빼라`);
  }
}

console.log(`코스 ${COURSES.length} / 레슨 ${lessons} / 블록 ${blocks}`);
console.log('코스: ' + COURSES.map((c) => `${c.id}(${c.lessons.length})`).join(', '));
console.log(!headIds ? '이전 커밋 견주기 건너뜀'
  : idsIntact ? `이전 커밋 레슨 id ${headIds.size}개 전부 살아 있음`
  : '이전 커밋 대비 레슨 id 유실 있음 — 아래 참고');

if (problems.length) {
  console.error(`\n문제 ${problems.length}개:\n` + problems.join('\n'));
  process.exit(1);
}
console.log('문제 없음');
