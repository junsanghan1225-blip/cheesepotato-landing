/* 사이트에 실린 한국어 글을 한자리에 모은다 — 검사기들이 함께 쓴다.
 *
 * 자료 파일마다 모양이 다르다. 예문은 points 안에 있고, 블로그는 blocks
 * 안에 있고, 회화는 turns 안에 있다. 그 모양을 손으로 적어 두면 자료가
 * 늘 때마다 여기를 같이 고쳐야 하고, 안 고치면 **새 자료만 조용히 검사에서
 * 빠진다.** 검사기가 빠뜨리는 것은 잘못을 놓치는 것보다 나쁘다 — 통과했다고
 * 믿게 되기 때문이다.
 *
 * 그래서 모양을 안 적는다. 내보낸 것을 통째로 깊이 훑어 **한글이 든 문자열을
 * 전부** 줍는다. 새 파일을 더할 때 아래 FILES 에 이름 한 줄만 적으면 된다.
 *
 * 주는 것 (record):
 *   file  'sentences.js'
 *   path  'SB_CATS[12].points[3].desc'   — 어디를 고쳐야 하는지
 *   id    '25-1'                          — 가장 가까운 조상의 id
 *   key   'desc'
 *   text  '「안」을 붙이지 않고 …'
 *   word  true 면 낱말 하나 (띄어쓰기 검사는 건너뛴다)
 *   distractor true 면 **일부러 틀리게 둔 객관식 오답 보기**
 *
 * 마지막 것이 중요하다. 문법 문제의 오답 보기는 「저는 일본 사람를 아니에요」
 * 처럼 일부러 틀려 있다. 검사기가 그것을 모르면 우리가 애써 만든 오답을
 * 매번 잘못이라고 짚는다. 자료에 answer 가 있으면 그 번호가 아닌 보기는
 * 오답이라는 뜻이니, 굳이 사람이 적어 주지 않아도 알 수 있다.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { hasHangul } from './hangul.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/* 학습자가 읽는 글이 실린 파일. 생성물(topik2.js·grammar.js)도 넣는다 —
   원본이 docs/ 에 있어도 잘못은 구운 쪽에서 눈에 띄고, 어차피 같은 글이다. */
export const FILES = [
  'sentences.js', 'sentences-beginner.js', 'sentences-intermediate.js',
  'courses.js', 'courses-beginner-stage1.js',
  'courses-grammar.js', 'courses-grammar-beginner.js', 'courses-grammar-detailed.js',
  'reading.js', 'convo.js', 'numbers.js',
  'topik.js', 'topik2.js', 'topik-writing.js', 'topik-listening.js',
  'blog.js', 'grammar.js', 'glossary-senses.js', 'glossary-examples.js',
];

/* 글이 아닌 칸. 값에 한글이 들어도 검사할 것이 아니다.
   id·태그·파일 이름 따위 — 「듣기-3과」 같은 것이 조사 검사에 걸린다. */
const SKIP_KEYS = new Set([
  'id', 'lv', 'no', 'date', 'updated', 'audio', 'img', 'src', 'href', 'url',
  'slug', 'file', 'voice', 'tag', 'tags', 'cat', 'slot', 'kind', 'type',
  'level', 'stage', 'video', 'youtube', 'alt',
]);

/* 영어 칸. 한글이 섞여 있어도(「-(으)ㄴ 뒤에 씁니다」 같은 설명) 한국어
   맞춤법으로 잴 글이 아니다. */
const EN_KEYS = new Set(['en', 'eng', 'english', 'trans', 'translation', 'romaja', 'romanized']);

const looksLikeWord = (s) => !/\s/.test(s) && s.length <= 8;

/* 깊이 훑기. 배열이면 [i], 객체면 .key 로 길을 잇는다. */
function walk(node, path, id, key, out, seen, distractor = false) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') {
    if (!hasHangul(node)) return;
    if (key && SKIP_KEYS.has(key)) return;
    if (key && EN_KEYS.has(key)) return;
    out.push({ path, id, key: key || '', text: node, word: looksLikeWord(node), distractor });
    return;
  }
  if (typeof node !== 'object') return;
  /* 같은 것을 두 자리에서 부르는 자료가 있다(코스가 예문을 다시 건다).
     그대로 두면 같은 잘못이 두 번 나온다. */
  if (seen.has(node)) return;
  seen.add(node);

  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`, id, key, out, seen, distractor));
    return;
  }
  const myId = typeof node.id === 'string' ? node.id : id;
  /* answer 가 가리키지 않는 보기는 오답이다 — 일부러 틀려 있을 수 있다.
     answer 가 글자('B')로 적힌 자료도 있어 번호로 되돌린다. */
  const ans = typeof node.answer === 'number' ? node.answer
    : (typeof node.answer === 'string' && /^[A-Da-d]$/.test(node.answer)
        ? node.answer.toUpperCase().charCodeAt(0) - 65 : null);
  for (const [k, v] of Object.entries(node)) {
    if (SKIP_KEYS.has(k)) continue;
    if (k === 'options' && Array.isArray(v) && ans !== null) {
      v.forEach((o, i) => walk(o, `${path}.options[${i}]`, myId, k, out, seen, i !== ans));
      continue;
    }
    walk(v, `${path}.${k}`, myId, k, out, seen, distractor);
  }
}

/* 파일 하나를 읽어 글 조각으로 편다. */
export async function loadFile(file) {
  const mod = await import(pathToFileURL(join(ROOT, file)).href);
  const out = [];
  const seen = new WeakSet();
  for (const [name, val] of Object.entries(mod)) {
    walk(val, name, null, '', out, seen);
  }
  return out.map((r) => ({ file, ...r }));
}

/* 사이트 전체. files 를 주면 그것만 읽는다. */
export async function loadCorpus(files = FILES) {
  const all = [];
  for (const f of files) {
    try { all.push(...(await loadFile(f))); }
    catch (e) { all.push({ file: f, path: '', id: null, key: '', text: '', word: false, error: e.message }); }
  }
  return all.filter((r) => !r.error || (console.error(`! ${r.file} 을 못 읽었다: ${r.error}`), false));
}

/* 글 한 덩이를 문장으로 자른다.
 *
 * 마침표만 보고 자르면 「1. 먼저」나 「오전 9.30」에서 잘못 잘린다.
 * 뒤에 공백이나 줄바꿈이 오는 문장부호에서만 자른다. */
export function sentences(text) {
  return text
    .split(/(?<=[.!?。？！])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* 「」 안의 글은 **일부러 틀리게 적어 둔 것일 수 있다.**
   「「안 알아요」는 쓰지 않습니다」처럼 못 쓸 말을 보여 주는 자리다.
   검사기가 이것을 모르면 가르치려고 적어 둔 잘못을 잘못이라고 짚는다. */
export const QUOTED = /[「『"'“‘]([^」』"'”’]{1,60})[」』"'”’]/g;
export function quotedSpans(text) {
  const spans = [];
  for (const m of text.matchAll(QUOTED)) spans.push([m.index, m.index + m[0].length]);
  return spans;
}
export const inSpans = (spans, i) => spans.some(([a, b]) => i >= a && i < b);

/* 사람이 읽는 자리 이름 — 「sentences.js SB_CATS[3].points[1].desc (25-1)」 */
export const where = (r) => `${r.file} ${r.path}${r.id ? ` (${r.id})` : ''}`;

export { ROOT };
