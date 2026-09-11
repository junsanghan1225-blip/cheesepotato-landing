/* 검사기가 기대는 사전.
 *
 * 맞춤법 검사에서 가장 위험한 것은 못 잡는 것이 아니라 **없는 잘못을 지어
 * 내는 것이다.** 「학교을」을 놓치면 오타 하나가 남지만, 멀쩡한 말을
 * 스무 번 틀렸다고 하면 사람이 검사기를 통째로 안 보게 된다. 그때부터
 * 검사기는 없는 것만 못하다.
 *
 * 그래서 이 파일은 「이 말이 진짜 있는 말인가」에만 답한다. 모르면 모른다고
 * 한다. 검사기는 아는 말에만 잘못을 매긴다.
 *
 * 사전은 세 겹이다.
 *
 *   1) glossary.js — 국립국어원 뜻풀이에서 온 표제어 (활용형까지 5,358)
 *   2) 우리 말뭉치 — 사이트에 실제로 쓰인 말과 그 횟수
 *   3) data/korean-words.json — 있으면 쓴다. 없어도 1·2 로 돈다
 *
 * 3 번이 없어도 검사기는 돈다. 다만 잡는 범위가 우리가 쓴 말 안으로 준다.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GLOSSARY } from '../../glossary.js';
import { SENSES } from '../../glossary-senses.js';
import { ROOT } from './corpus.mjs';

/* 표제어. GLOSSARY 의 열쇠에는 「아침에」·「아침을」 같은 활용형도 있고,
   값의 head 에 원래 꼴이 있다. 둘 다 「아는 말」로 친다. */
let _known = null;
export function knownWords() {
  if (_known) return _known;
  const s = new Set();
  for (const [k, v] of Object.entries(GLOSSARY)) {
    s.add(k);
    if (v && typeof v.head === 'string') s.add(v.head);
  }
  /* 사람이 넣어 주는 큰 사전. 국립국어원 표제어 목록을 여기 두면
     검사 범위가 우리 말뭉치 밖까지 넓어진다.
     꼴: ["가다","가방",…] 또는 줄마다 낱말 하나인 .txt */
  for (const f of ['data/korean-words.json', 'data/korean-words.txt']) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    const raw = readFileSync(p, 'utf8');
    const list = f.endsWith('.json') ? JSON.parse(raw) : raw.split('\n');
    for (const w of list) { const t = String(w).trim(); if (t) s.add(t); }
  }
  _known = s;
  return s;
}

/* 바깥 사전을 실제로 들여왔는가 — 검사기가 끝에 「자료를 넣으면 더
   잡는다」고 알려 주려고 쓴다. */
export const bigDictLoaded = () =>
  ['data/korean-words.json', 'data/korean-words.txt'].some((f) => existsSync(join(ROOT, f)));

export const isKnown = (w) => knownWords().has(w);

/* 뜻풀이 한 줄이 무슨 갈래인가. 국립국어원 뜻풀이는 갈래를 글 끝에 적는다 —
   「‘무리를 이룬 사람’의 뜻을 더하는 접미사.」 */
export function senseKind(def) {
  if (/접미사\.|접두사\.|접사\./.test(def)) return '접사';
  if (/어미\./.test(def)) return '어미';
  if (/조사\./.test(def)) return '조사';
  if (/의존 명사/.test(def)) return '의존명사';
  return '낱말';
}

/* 한 표제어 칸에 갈래가 다른 뜻이 섞인 것 = 동음이의어가 합쳐진 자리.
 *
 * 「차」 한 칸에 접미사(次) 와 명사(茶) 가 같이 있다. 그러면 그 칸의 pos 는
 * 둘 중 먼저 온 것일 뿐이라 **아무 말도 아니다.** check-homonym.mjs 가
 * 이것을 세고, 아래 isNoun 이 이것을 피한다. */
let _mixed = null;
export function mixedPos() {
  if (_mixed) return _mixed;
  _mixed = new Set();
  for (const [w, ss] of Object.entries(SENSES)) {
    if (!Array.isArray(ss) || ss.length < 2) continue;
    const kinds = new Set(ss.map((s) => senseKind(String(Array.isArray(s) ? s[0] : s))));
    if (kinds.size > 1) _mixed.add(w);
  }
  return _mixed;
}

/* 명사인가 — 조사 검사는 명사 뒤에서만 뜻이 있다.
   모르면 null. 「알 수 없다」와 「명사가 아니다」는 다르다.
 *
 * **동음이의어가 합쳐진 칸의 pos 는 안 믿는다.** 국립국어원 자료의 동형어
 * 번호가 사전을 굽는 자리에서 지워지는 바람에, 「차01」(次·접사) 과
 * 「차02」(車) 가 한 칸에 들어가고 pos 는 앞엣것만 남았다. 그 pos 를 믿고
 * 「이건 명사가 아니다」라고 하면 멀쩡한 조사 검사가 통째로 빗나간다.
 * 자세한 것은 tools/check-homonym.mjs 머리말에 적어 두었다. */
export function isNoun(w) {
  const e = GLOSSARY[w];
  if (!e) return null;
  const head = GLOSSARY[e.head] || e;
  if (!head.pos) return null;
  if (mixedPos().has(e.head || w)) return null;   // 합쳐진 칸 — 모른다
  return /명사|대명사|수사/.test(head.pos);
}

/* 우리 말뭉치가 실제로 쓴 말과 횟수.
 *
 * 이것이 두 번째 사전이다. 바깥 사전이 없어도 「우리가 딴 데서는 '학교를'
 * 이라고 쉰 번 썼는데 여기서만 '학교을'」을 잡을 수 있다. 우리 글이 우리
 * 글을 검사한다. */
export function tally(corpus) {
  const n = new Map();
  for (const r of corpus) {
    for (const w of r.text.match(/[가-힣]+/g) || []) n.set(w, (n.get(w) || 0) + 1);
  }
  return n;
}
