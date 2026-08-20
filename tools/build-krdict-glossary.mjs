/* 국립국어원 「한국어기초사전」 내려받기 자료에서 **우리에게 필요한 것만** 뽑는다.
 *
 *   node tools/build-krdict-glossary.mjs <내려받은_폴더>
 *
 *   보기: node tools/build-krdict-glossary.mjs C:\\Users\\내이름\\Downloads\\krdict
 *         node tools/build-krdict-glossary.mjs ~/Downloads/krdict
 *
 * 왜 걸러 내나. 내려받은 자료는 표제어 5만여 개에 1GB 가까이 된다. 그 전부를
 * 저장소에 넣으면 내려받는 사람마다 1GB를 받게 되고, GitHub Pages 가 그대로
 * 퍼 나른다. **학습자가 누를 수 있는 낱말은 우리 지문에 나오는 것뿐이므로**,
 * 우리 자료에 실제로 나오는 낱말만 남기면 몇 MB로 준다.
 *
 * 자료 모양은 받는 때마다 조금씩 다르다. 그래서 열쇠 이름을 못 박지 않고
 * 트리를 걸으며 「한글 표제어 + 뜻풀이」를 가진 덩이를 찾는다. 못 박아 두면
 * 사전이 한 번 바뀔 때마다 이 도구가 죽는다.
 *
 * ── 저작권 ────────────────────────────────────────────────────
 * 한국어기초사전은 **CC BY-SA 2.0 KR** 이다. 상업적으로 써도 되지만
 *   · 출처를 밝혀야 하고 (BY)
 *   · 여기서 나온 뜻풀이 자료는 같은 라이선스로 열어 두어야 한다 (SA)
 * 이 도구가 만드는 파일에 그 표시를 함께 박아 둔다 — 파일만 보고도 무엇에서
 * 왔는지 알 수 있어야 나중에 지키기 쉽다.
 *
 * **발음(소리) 파일은 재배포가 금지되어 있다.** 여기서는 글자만 뽑는다.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TOPIK_READING } from '../topik.js';
import { TOPIK2_READING } from '../topik2.js';
import { SB_CATS, SB_MORE } from '../sentences.js';

const dir = process.argv[2];
if (!dir) {
  console.error('쓰기: node tools/build-krdict-glossary.mjs <내려받은_폴더>');
  console.error('  한국어기초사전 「Json 전체 내려받기」로 받은 파일들이 든 폴더를 가리킨다.');
  process.exit(2);
}

/* ── 1. 우리가 쓰는 낱말 ─────────────────────────────────────── */
const JOSA = ['으로부터', '에서부터', '이라고', '에게서', '한테서', '으로는', '까지도',
  '에서는', '에서도', '이라는', '라는', '으로', '에게', '한테', '까지', '부터', '보다',
  '처럼', '마다', '조차', '밖에', '이나', '든지', '라도', '에는', '에도', '에서',
  '들이', '들을', '들은', '들의', '들과',
  '은', '는', '이', '가', '을', '를', '의', '에', '도', '만', '과', '와', '로', '나'];
const strip = (w) => {
  for (const j of JOSA) if (w.length > j.length + 1 && w.endsWith(j)) return w.slice(0, -j.length);
  return w;
};

/* 지문에 나오는 꼴을 모은다. 활용형까지 그대로 담아 둔다 — 사전 표제어와
   맞춰 볼 때 「먹었습니다」의 앞머리 「먹」으로도 닿을 수 있어야 한다. */
const need = new Set();
const eat = (text) => String(text ?? '').split(/\s+/).forEach((w) => {
  const k = strip(w.replace(/[^가-힣]/g, ''));
  if (k.length >= 1) need.add(k);
});
for (const q of [...TOPIK_READING, ...TOPIK2_READING]) {
  [q.passage, q.sentence, q.question, q.mark, ...(q.options || [])].forEach(eat);
}
for (const c of SB_CATS) {
  eat(c.ko);
  for (const p of c.points) {
    eat(`${p.name} ${p.desc} ${p.ex}`);
    (p.dlg || []).forEach(eat);
    (SB_MORE[p.id] || []).forEach(eat);
  }
}
/* 표제어가 우리 낱말의 앞머리이기만 해도 쓸모가 있다 — 「먹다」는 지문의
   「먹었습니다」에 닿는다. 그래서 앞머리 집합을 따로 만든다. */
const heads = new Set();
need.forEach((w) => { for (let n = 1; n <= w.length; n++) heads.add(w.slice(0, n)); });
console.log(`우리 자료에 나오는 낱말 ${need.size}개 (앞머리까지 ${heads.size}개)`);

/* ── 2. 사전을 걸으며 뽑는다 ─────────────────────────────────── */
const LANG = {
  영어: 'en', 일본어: 'ja', 중국어: 'zh', 스페인어: 'es', 프랑스어: 'fr',
  독일어: 'de', 러시아어: 'ru', 베트남어: 'vi', 태국어: 'th', 아랍어: 'ar',
  몽골어: 'mn', 인도네시아어: 'id', 포르투갈어: 'pt', 이탈리아어: 'it',
  네덜란드어: 'nl', 터키어: 'tr', 힌디어: 'hi', 미얀마어: 'my',
  크메르어: 'km', 네팔어: 'ne', 우즈베크어: 'uz', 스와힐리어: 'sw',
};

const out = new Map();          // 표제어 → 줄
const langSeen = new Map();     // 어느 말이 몇 개나 있나

const txt = (v) => (typeof v === 'string' ? v.trim() : '');
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

/* 한 표제어 덩이를 받아 필요한 것만 남긴다. */
function take(node) {
  const word = txt(node.word ?? node.표제어 ?? node.lemma);
  if (!word) return;
  const bare = word.replace(/[^가-힣]/g, '');
  if (bare.length < 1) return;
  /* 우리 자료에 안 닿는 표제어는 버린다. 이 한 줄이 5만 개를 몇 천 개로
     줄인다 — 학습자가 누를 수 없는 낱말에 자리를 내줄 까닭이 없다.

     **표제어는 기본형이고 지문은 활용형이다.** 사전에는 「마시다」로 실려
     있는데 지문에는 「마십니다」만 나온다. 표제어를 그대로 찾으면 용언이
     통째로 빠진다 — 시험해 보고서야 알았다. 그래서 끝의 「다」를 뗀 어간으로도
     찾아본다. 「마시다」 → 「마시」 → 지문의 「마십니다」에 닿는다. */
  const stem = bare.endsWith('다') && bare.length > 1 ? bare.slice(0, -1) : '';
  if (!heads.has(bare) && !(stem && heads.has(stem))) return;

  const pos = txt(node.pos ?? node.품사);
  const row = out.get(bare) || { ko: bare, pos, defs: [] };

  for (const sense of arr(node.sense ?? node.sense_info ?? node.senseInfo ?? node.의미)) {
    const def = txt(sense.definition ?? sense.뜻풀이 ?? sense.def);
    const one = { ko: def, t: {} };
    for (const tr of arr(sense.translation ?? sense.translation_info ?? sense.translationInfo ?? sense.번역)) {
      const langName = txt(tr.trans_lang ?? tr.language ?? tr.언어);
      const code = LANG[langName] || (langName ? langName : null);
      if (!code) continue;
      const w = txt(tr.trans_word ?? tr.word ?? tr.대역어);
      const d = txt(tr.trans_dfn ?? tr.definition ?? tr.뜻풀이);
      if (!w && !d) continue;
      one.t[code] = w || d;
      langSeen.set(code, (langSeen.get(code) ?? 0) + 1);
    }
    if (one.ko || Object.keys(one.t).length) row.defs.push(one);
  }
  if (!row.pos && pos) row.pos = pos;
  if (row.defs.length) out.set(bare, row);
}

/* 열쇠 이름을 못 박지 않고 트리를 걷는다. 「word 를 가진 객체」를 만나면
   표제어 덩이로 본다. */
function walk(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 12) return;
  if (Array.isArray(node)) { for (const v of node) walk(v, depth + 1); return; }
  if (node.word ?? node.표제어 ?? node.lemma) take(node);
  for (const v of Object.values(node)) walk(v, depth + 1);
}

const files = readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith('.json'))
  .map((f) => join(dir, f))
  .filter((f) => statSync(f).isFile());
if (!files.length) { console.error(`${dir} 안에 .json 파일이 없다.`); process.exit(2); }

console.log(`사전 파일 ${files.length}개를 읽는다. 파일이 커서 몇 분 걸린다.\n`);
for (const f of files) {
  process.stdout.write(`  ${f.split(/[\\/]/).pop()} … `);
  try {
    walk(JSON.parse(readFileSync(f, 'utf8')));
    console.log(`누적 ${out.size}개`);
  } catch (e) {
    console.log(`건너뜀 (${e.message.slice(0, 60)})`);
  }
}

/* ── 3. 내보낸다 ────────────────────────────────────────────── */
const rows = [...out.values()].sort((a, b) => a.ko.localeCompare(b.ko));
const payload = {
  _출처: '국립국어원 「한국어기초사전」 https://krdict.korean.go.kr',
  _라이선스: 'CC BY-SA 2.0 KR https://creativecommons.org/licenses/by-sa/2.0/kr/',
  _만든것: 'tools/build-krdict-glossary.mjs — 우리 지문에 나오는 낱말만 골라 담았다',
  _주의: '발음(소리) 파일은 재배포가 금지되어 있어 담지 않았다. 글자만 있다.',
  words: rows,
};
const dest = new URL('../docs/glossary-krdict.json', import.meta.url);
writeFileSync(dest, JSON.stringify(payload, null, 1) + '\n');

const mb = (JSON.stringify(payload).length / 1024 / 1024).toFixed(1);
console.log(`\n표제어 ${rows.length}개를 docs/glossary-krdict.json 에 썼다 (${mb} MB).`);
if (langSeen.size) {
  console.log('담긴 말: ' + [...langSeen.entries()].sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${k} ${n}`).join(' · '));
} else {
  console.log('⚠ 번역이 하나도 안 잡혔다. 파일 첫 40줄을 보여 주면 열쇠 이름을 맞추겠다.');
}
console.log('\n이 파일을 저장소에 커밋하면 된다. 원본 1GB는 올릴 필요가 없다.');
