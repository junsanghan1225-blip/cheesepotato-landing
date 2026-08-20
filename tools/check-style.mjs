/* 문항을 출제위원의 눈으로 본다 — 모양이 아니라 **글과 출제**를 본다.
 *
 *   node tools/check-style.mjs <파일.json>
 *
 * check-topik2 는 모양을 본다(칸이 있나, 급수가 맞나, 정답이 쏠렸나).
 * 모양이 다 맞아도 시험으로 못 쓰는 문항이 있다. 2회차가 그랬다 —
 * 「작성해야 하는 법이다」는 비문이었고, 「글입용까」는 물음이 깨져 있었고,
 * 「점각 처리」는 없는 말이었다. 셋 다 check-topik2 를 그냥 통과했다.
 *
 * 여기서 보는 것은 세 갈래다.
 *
 *   1. 출제 원칙  — 지문을 안 읽고도 답이 보이면 시험이 아니다.
 *   2. 문법       — 비문·이중 피동·호응 어긋남.
 *   3. 문체       — 급수에 견주어 문장이 길거나 군더더기가 많은 것.
 *
 * 1·2 는 「고쳐야 할 것」, 3 은 「짚어 둘 것」이다. 문체는 판단이 갈리는
 * 자리라 기계가 못 박으면 안 된다.
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('쓰기: node tools/check-style.mjs <파일.json>'); process.exit(2); }
let rows;
try { rows = JSON.parse(readFileSync(file, 'utf8')); }
catch (e) { console.error('JSON 을 못 읽었다:', e.message); process.exit(2); }
if (!Array.isArray(rows)) { console.error('배열이 아니다.'); process.exit(2); }

const bad = [];
const note = [];
const at = (q, m) => bad.push(`${q.id} — ${m}`);
const hm = (q, m) => note.push(`${q.id} — ${m}`);

/* 문장으로 자른다. 마침표·물음표·느낌표와 줄바꿈에서 끊는다. */
const sentences = (t) => String(t ?? '')
  .split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
const count = (t, re) => (String(t ?? '').match(re) || []).length;

/* ── 1. 출제 원칙 ─────────────────────────────────────────────── */

/* 유형마다 물음 문구가 정해져 있다. 실제 시험지가 그렇고, 무엇보다
   **문구를 못 박아 두면 물음이 깨진 것을 바로 잡는다** — 2회차에서
   「다음은 무엇에 대한 글입용까?」가 그냥 통과했다. */
const ASK = {
  blank: ['(　　　　)에 들어갈 말로 가장 알맞은 것을 고르십시오.'],
  paraphrase: ['밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오.'],
  theme: ['다음은 무엇에 대한 글입니까?'],
  detail: ['다음 글의 내용과 같은 것을 고르십시오.',
           '다음을 읽고 글의 내용과 같은 것을 고르십시오.',
           '윗글의 내용과 같은 것을 고르십시오.',
           '윗글의 내용으로 알 수 있는 것을 고르십시오.'],
  order: ['다음을 순서에 맞게 배열한 것을 고르십시오.'],
  main: ['다음을 읽고 글의 주제로 가장 알맞은 것을 고르십시오.',
         '윗글의 주제로 가장 알맞은 것을 고르십시오.'],
  insert: ['주어진 문장이 들어갈 곳으로 가장 알맞은 것을 고르십시오.'],
  headline: ['다음 신문 기사의 제목을 가장 잘 설명한 것을 고르십시오.'],
  intent: ['윗글을 쓴 목적으로 가장 알맞은 것을 고르십시오.'],
  attitude: ['윗글에 나타난 필자의 태도로 가장 알맞은 것을 고르십시오.'],
  feeling: [/^밑줄 친 부분에 나타난 '.+'의 심정으로 가장 알맞은 것을 고르십시오\.$/],
};

/* 정답에 있으면 안 되는 말. 「모두·항상·절대」로 못 박는 문장은 시험에서
   거의 언제나 오답이라, 정답에 넣으면 학습자가 그 요령을 거꾸로 배운다. */
const EXTREME = /(모든|모두|항상|언제나|절대로?|반드시|오직|전혀|결코|유일)/;

/* ── 2. 문법 ─────────────────────────────────────────────────── */

/* 이중 피동. 「보여지다」는 「보이다」로 충분하다. 한국어 글쓰기에서 가장
   흔한 잘못이고, 시험 지문에 나오면 그대로 배운다. */
const DOUBLE_PASSIVE = /(보여지|불려지|쓰여지|나뉘어지|잊혀지|모여지|짜여지|읽혀지|들려지|놓여지|되어지|찢겨지)/;

/* 「하다」로 충분한데 「시키다」를 쓴 것. 남을 시키는 뜻이 없으면 잘못이다. */
const FAKE_CAUSATIVE = /(소개시키|금지시키|접수시키|등록시키|설득시키|야기시키|제거시키|사용시키|해소시키)/;

/* 한 문장에 같은 연결어미가 두 번. 「시험공부하느라 밤을 새우느라고
   피곤했다」가 이것이다 — 뜻이 겹쳐 문장이 헛돈다. */
const REPEATED = [
  { re: /느라(고)?/g, name: '-느라(고)' },
  { re: /(?<=[가-힣])(아서|어서|여서)(?=\s)/g, name: '-아서/-어서' },
  { re: /(?<=[가-힣])는데(?=[\s,])/g, name: '-는데' },
  { re: /(?<=[가-힣])지만(?=[\s,])/g, name: '-지만' },
  { re: /(?<=[가-힣])면서(?=[\s,])/g, name: '-면서' },
  { re: /(?<=[가-힣])(으)?므로(?=[\s,])/g, name: '-(으)므로' },
];

/* 앞말이 뒷말을 부른다. 앞만 쓰고 뒤를 안 받으면 문장이 어긋난다. */
const PAIRS = [
  { head: /비록/, tail: /(지만|더라도|라도|ㄹ지언정|으나)/, name: '비록 … -지만/-더라도' },
  { head: /만약|만일/, tail: /(면|거든|ㄹ 경우|을 경우|라면)/, name: '만약 … -면' },
  { head: /왜냐하면/, tail: /때문/, name: '왜냐하면 … 때문이다' },
  { head: /아무리/, tail: /(아도|어도|여도|더라도|ㄹ지라도)/, name: '아무리 … -아도/-더라도' },
  { head: /차라리/, tail: /(느니|는 게 낫|겠)/, name: '차라리 … -느니/-는 게 낫다' },
];
/* 부정을 부르는 말. 「결코 그렇다」처럼 긍정으로 끝나면 어긋난다. */
const NEG_HEAD = /(결코|전혀|절대로|여간)/;
const NEG_TAIL = /(않|없|못|아니|말)/;

/* ── 3. 문체 ─────────────────────────────────────────────────── */
/* 급수별 한 문장 길이 상한. 실제 시험지의 문장 길이를 어림한 값이다.
   3급 지문에 90자짜리 문장이 들어가면 문법이 맞아도 급수가 안 맞는다. */
const MAX_SENT = { 3: 55, 4: 70, 5: 85, 6: 100 };

for (const q of rows) {
  const lv = Number(q.level ?? q.grade) || 6;
  const passage = String(q.passage ?? '');
  const opts = (q.options || []).map(String);
  /* 해설도 학습자가 읽는 글이다. 지문만 보고 해설을 빼면 「보여지는」이
     해설에 남아 그대로 배워진다. */
  const all = [passage, q.sentence, q.question, ...opts, q.why].filter(Boolean).join('\n');

  /* ── 물음 문구 ── */
  const want = ASK[q.type];
  if (want) {
    const ok = want.some((w) => (w instanceof RegExp ? w.test(q.question) : w === q.question));
    if (!ok) at(q, `물음 문구가 ${q.type} 유형의 표준과 다르다\n        받은 것: 「${q.question}」\n        표준   : 「${want[0] instanceof RegExp ? want[0].source : want[0]}」`);
  }

  /* ── 정답이 지문을 그대로 베꼈나 ──
     일치 유형의 답은 지문의 말을 **바꿔 쓴** 문장이어야 한다. 여섯 글자가
     통째로 같으면 학습자는 글을 읽는 대신 같은 글자를 찾게 된다. */
  if (['detail', 'main', 'intent', 'attitude'].includes(q.type) && passage) {
    const a = opts[q.answer] || '';
    const flat = passage.replace(/\s/g, '');
    const aflat = a.replace(/\s/g, '');
    for (let i = 0; i + 8 <= aflat.length; i++) {
      const chunk = aflat.slice(i, i + 8);
      if (flat.includes(chunk)) {
        at(q, `정답이 지문을 여덟 글자 넘게 그대로 옮겼다 — 「${chunk}」. 바꿔 쓸 것`);
        break;
      }
    }
  }

  /* ── 선택지 길이 ──
     정답만 유독 길면 지문을 안 읽고도 고른다. 실제 출제에서 제일 먼저
     보는 것 가운데 하나다. */
  /* theme 은 보기가 「약국·안경점·안과」처럼 낱말 하나라 길이 비율이 뜻이
     없다. 평균이 여섯 자도 안 되는 짧은 보기도 마찬가지다 — 3자와 5자를
     「1.6배」로 잡으면 소음만 난다. */
  if (opts.length === 4 && !['insert', 'order', 'theme'].includes(q.type)) {
    const len = opts.map((o) => o.replace(/\s/g, '').length);
    const mine = len[q.answer];
    const others = len.filter((_, i) => i !== q.answer);
    const avg = others.reduce((x, y) => x + y, 0) / others.length;
    if (avg >= 6) {
      if (mine >= avg * 1.6) at(q, `정답 선택지가 나머지보다 너무 길다 (${mine}자 대 평균 ${Math.round(avg)}자) — 안 읽고도 고를 수 있다`);
      if (mine <= avg * 0.6) at(q, `정답 선택지가 나머지보다 너무 짧다 (${mine}자 대 평균 ${Math.round(avg)}자)`);
    }
  }

  /* ── 선택지 끝맺음이 하나만 다른가 ──
     넷 중 하나만 「-다」로 안 끝나면 그것만 눈에 띈다. */
  if (opts.length === 4 && !['insert', 'order', 'theme'].includes(q.type)) {
    const ends = opts.map((o) => (/[다요]\.?$/.test(o.trim()) ? 'D' : 'X'));
    const odd = ends.filter((e) => e === 'X').length;
    if (odd === 1) at(q, `선택지 넷 가운데 하나만 끝맺음이 다르다 — 그것만 눈에 띈다: 「${opts[ends.indexOf('X')]}」`);
  }

  /* ── 정답에 극단 표현 ── */
  const ansTxt = opts[q.answer] || '';
  if (EXTREME.test(ansTxt) && !EXTREME.test(passage)) {
    hm(q, `정답에 「${ansTxt.match(EXTREME)[0]}」 같은 못 박는 말이 있다. 시험에서 이런 선택지는 대개 오답이라, 요령을 거꾸로 가르치게 된다`);
  }

  /* ── 문법 ── */
  if (DOUBLE_PASSIVE.test(all)) at(q, `이중 피동 「${all.match(DOUBLE_PASSIVE)[0]}…」 — 「보여지다」가 아니라 「보이다」다`);
  if (FAKE_CAUSATIVE.test(all)) at(q, `「${all.match(FAKE_CAUSATIVE)[0]}…」 — 남을 시키는 뜻이 아니면 「하다」로 쓴다`);

  /* 어미 반복과 호응은 **지문에서만** 본다.
     해설은 설명하는 글이라 「-(으)므로」가 두 번 나와도 잘못이 아니고,
     보기는 「비록」처럼 한 낱말일 수 있어 호응을 따질 문장이 아니다.
     실제로 1회차에서 그 둘이 헛되이 걸렸다. */
  for (const s of sentences([passage, q.sentence].filter(Boolean).join('\n'))) {
    if (s.replace(/\s/g, '').length < 10) continue;   // 토막은 문장으로 안 본다
    for (const { re, name } of REPEATED) {
      const n = count(s, re);
      if (n >= 2) at(q, `한 문장에 ${name} 가 ${n}번 — 뜻이 겹쳐 문장이 헛돈다\n        「${s.slice(0, 60)}${s.length > 60 ? '…' : ''}」`);
    }
    for (const { head, tail, name } of PAIRS) {
      if (head.test(s) && !tail.test(s)) at(q, `「${name}」 호응이 어긋났다\n        「${s.slice(0, 60)}${s.length > 60 ? '…' : ''}」`);
    }
    if (NEG_HEAD.test(s) && !NEG_TAIL.test(s)) {
      at(q, `「${s.match(NEG_HEAD)[0]}」는 부정을 부르는 말인데 문장이 긍정으로 끝났다\n        「${s.slice(0, 60)}${s.length > 60 ? '…' : ''}」`);
    }
  }

  /* ── 문체 ── */
  const cap = MAX_SENT[lv] ?? 100;
  for (const s of sentences(passage)) {
    const n = s.replace(/\s/g, '').length;
    if (n > cap) hm(q, `${lv}급 지문에 ${n}자짜리 문장 (이 급수 상한 ${cap}자)\n        「${s.slice(0, 50)}…」`);
  }
  for (const s of sentences(passage)) {
    if (count(s, /것/g) >= 3) hm(q, `한 문장에 「것」이 세 번 넘는다 — 「${s.slice(0, 45)}…」`);
    if (count(s, /적(?=[\s인으로이었]|$)/g) >= 3) hm(q, `한 문장에 「-적」이 세 번 넘는다 — 「${s.slice(0, 45)}…」`);
    if (count(s, /에 (대한|대해|대하여)/g) >= 2) hm(q, `한 문장에 「-에 대한/대해」가 두 번 넘는다 — 「${s.slice(0, 45)}…」`);
  }
}

console.log(`문항 ${rows.length}개를 출제위원의 눈으로 봤다.\n`);
/* 묶인 문항(19-20, 23-24, 48-50)은 지문을 나눠 쓴다. 같은 지문에 대해
   같은 말을 두세 번 하면 목록만 길어지고 읽는 사람이 지친다. */
const uniq = [...new Set(note.map((m) => m.replace(/^\S+ — /, '')))]
  .map((body) => `${note.filter((m) => m.endsWith(body)).map((m) => m.split(' — ')[0]).join('·')} — ${body}`);
if (uniq.length) {
  console.log(`짚어 둘 것 ${uniq.length}건`);
  uniq.forEach((m) => console.log('  · ' + m));
}
if (bad.length) {
  console.log(`\n고쳐야 할 것 ${bad.length}건`);
  bad.forEach((m) => console.log('  ✗ ' + m));
  process.exit(1);
}
console.log('\n이상 없음');
