#!/usr/bin/env node
/* 「단어」 섹션 낱말 자료 검사 — vocab/data/*.json (모양: docs/plans/vocab-schema.md)
 *
 *   node tools/check-vocab.mjs
 *   node tools/check-vocab.mjs --base origin/main   안 그래비티 묶음을 받았을 때 — main 과 견줘 지킬 칸을 봤는지 본다
 *
 * 수천 개를 500개씩 넣을 때 품질이 흐트러지지 않게 막는 문이다(docs/plans/vocab-plan.md 7층).
 * 「고쳐야 할 것」이 하나라도 있으면 실패한다. 「짚어 둘 것」은 실패는 아니지만 사람이 본다.
 *
 * 등급마다 채워야 할 것이 다르다.
 *   C  씨앗 — 표제어 · 품사 · 급수 · 목적 · 뜻(영어)
 *   B  + 주제 하나 이상 · 예문 하나 이상(영어 번역 포함)
 *   A  + 예문 둘 이상 · 쉬운 영어 뜻(en_simple) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'vocab/data');
const TAX = JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/taxonomy.json'), 'utf8'));
const PURPOSES = new Set(TAX.purposes.map((p) => p.id));
const TOPICS = new Set(TAX.topics.flatMap((t) => t.subs.map((s) => `${t.id}/${s.id}`)));
const POS = new Set(['명사', '대명사', '수사', '동사', '형용사', '부사', '관형사', '감탄사', '조사', '의존 명사', '보조 동사', '보조 형용사', '어미', '접사', '']);
const GRADES = new Set(['A', 'B', 'C']);

const err = [], warn = [];
const ALL = process.argv.includes('--all');       // 짚어 둘 것을 전부 보이기(고칠 줄 목록 뽑을 때)
/* 초급 낱말의 예문은 짧고 쉬워야 한다(docs/antigravity/antigravity-vocab-task.md: 8~18글자 안팎, 초급 문법).
   빈칸 · 문장 부호를 뺀 글자 수가 이보다 길거나, 중급 이상 문법이 보이면 짚는다. */
const EX_MAX = 22;
const EX_MAX2 = 32;   // 3~6급 예문 상한
const HARD = /느라|도록|더니|는데도|길래|거든요?|잖아|수록|듯|채로|바람에|던\s/;
const ids = new Map();
const stat = { n: 0, grade: {}, level: {}, purpose: {}, topicless: 0, exless: 0 };

/* 예문에 표제어가 들어 있나. 활용하는 말(-다)은 줄기로 본다 — 「먹다」는 「먹어요」 속의 「먹」.
   ㅂ · ㄷ · 르 불규칙처럼 줄기가 바뀌는 말은 첫 글자만이라도 있으면 넘어간다(짚어 둘 것으로만). */
function hasHead(ko, head) {
  const s = String(ko).replace(/\s+/g, '');
  const h = head.replace(/\s+/g, '');
  if (s.includes(h)) return true;
  if (h.endsWith('다') && h.length >= 2) {
    const stem = h.slice(0, -1);
    if (s.includes(stem)) return true;
    /* 줄기 끝 글자가 모음과 합쳐 모양이 바뀌는 말(하 → 해 · 오 → 와 · 보 → 봐 · 되 → 돼 · 주 → 줘 · 쓰 → 써):
       앞은 그대로, 끝 글자는 첫소리(초성)만 같으면 본다. */
    const cho = (ch) => { const c = ch.charCodeAt(0) - 0xac00; return c >= 0 && c < 11172 ? Math.floor(c / 588) : -1; };
    const front = stem.slice(0, -1), last = cho(stem.slice(-1));
    for (let i = 0; i + stem.length <= s.length; i++) {
      if (s.slice(i, i + front.length) === front && cho(s[i + front.length]) === last) return true;
    }
    if (stem.length >= 2 && s.includes(stem.slice(0, -1))) return true;
    /* 르 불규칙: 앞 글자에 받침 ㄹ 이 붙고 라 · 러 가 온다 — 빠르다 → 빨라, 부르다 → 불러. */
    if (stem.endsWith('르') && front) {
      const p = front.slice(-1).charCodeAt(0) - 0xac00;
      if (p >= 0 && p < 11172 && p % 28 === 0) {
        const ll = front.slice(0, -1) + String.fromCharCode(0xac00 + p + 8);
        if (s.includes(ll + '라') || s.includes(ll + '러')) return true;
      }
    }
  }
  return false;
}

/* 표현(사자성어 · 속담 · 관용, expressions.json)은 모양이 달라 check-expressions 가 본다 */
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'expressions.json').sort() : [];
for (const f of files) {
  let list;
  try { list = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }
  catch (e) { err.push(`${f} — JSON 이 깨졌다: ${e.message}`); continue; }
  if (!Array.isArray(list)) { err.push(`${f} — 맨 바깥이 배열이어야 한다`); continue; }
  list.forEach((w, i) => {
    const at = `${f} #${i + 1} ${w?.head ?? '?'}`;
    if (!w || typeof w !== 'object') { err.push(`${at} — 객체가 아니다`); return; }
    stat.n++;
    for (const k of ['id', 'head']) if (typeof w[k] !== 'string' || !w[k].trim()) err.push(`${at} — ${k} 가 비었다`);
    if (ids.has(w.id)) err.push(`${at} — id 「${w.id}」가 ${ids.get(w.id)} 와 겹친다(같은 꼴의 다른 낱말이면 「${w.id}#2」처럼)`);
    else ids.set(w.id, at);
    if (!POS.has(w.pos ?? '')) err.push(`${at} — 품사 「${w.pos}」를 모른다`);
    if (!w.pos) warn.push(`${at} — 품사가 비었다`);
    if (!Number.isInteger(w.level) || w.level < 1 || w.level > 6) err.push(`${at} — level 은 1~6 (TOPIK 급수)`);
    if (!GRADES.has(w.grade)) err.push(`${at} — grade 는 A · B · C`);
    if (!Array.isArray(w.purposes) || !w.purposes.length) err.push(`${at} — purposes 가 하나 이상`);
    else w.purposes.forEach((p) => { if (!PURPOSES.has(p)) err.push(`${at} — 목적 「${p}」 가 taxonomy 에 없다`); });
    if (!Array.isArray(w.topics)) err.push(`${at} — topics 는 배열`);
    /* 우리 레벨(감자 L1 ~ L7) — tools/vocab-level.mjs 가 넣는다. 빠지면 「내 길」 · 레벨별 단어장에서 낱말이 사라진다. */
    if (w.grade !== 'C' && !(Number.isInteger(w.lv) && w.lv >= 1 && w.lv <= 7)) err.push(`${at} — lv(우리 레벨 1~7)가 없다 — node tools/vocab-level.mjs`);
    /* 콩글리시(kg) — 영어처럼 보이는 말(like)과 영어로 실제 하는 말(say). 둘 다 있어야 화면에 「헷갈림 주의」가 바로 선다. */
    if (w.kg !== undefined && !(w.kg && typeof w.kg.like === 'string' && w.kg.like.trim() && typeof w.kg.say === 'string' && w.kg.say.trim()))
      err.push(`${at} — kg 는 { like, say } 둘 다 글자로`);
    if (w.kg && !w.topics?.some((t) => t.startsWith('konglish/'))) warn.push(`${at} — kg 가 있는데 콩글리시 주제가 없다`);
    else w.topics.forEach((t) => { if (!TOPICS.has(t)) err.push(`${at} — 주제 「${t}」 가 taxonomy 에 없다(「대분류/소분류」 꼴)`); });
    /* 씨앗(C)에는 영어 뜻이 없을 수 있다 — 표준 목록에만 있고 우리 사전에 없는 낱말. B 부터는 꼭. */
    if (typeof w.en !== 'string') err.push(`${at} — en(영어 뜻)은 글자`);
    else if (!w.en.trim()) (w.grade === 'C' ? (stat.enless = (stat.enless || 0) + 1) : err.push(`${at} — ${w.grade}급은 en(영어 뜻)이 있어야`));
    if (w.std != null && !(Number.isInteger(w.std) && w.std >= 1 && w.std <= 6)) err.push(`${at} — std(표준 급수)는 1~6`);
    if (!Array.isArray(w.examples)) err.push(`${at} — examples 는 배열`);
    else w.examples.forEach((x, j) => {
      if (!x || typeof x.ko !== 'string' || !x.ko.trim()) { err.push(`${at} — 예문 ${j + 1} 에 ko 가 없다`); return; }
      if (w.grade !== 'C' && !String(x.en || '').trim()) err.push(`${at} — 예문 ${j + 1} 에 영어 번역(en)이 없다`);
      if (!hasHead(x.ko, w.head)) warn.push(`${at} — 예문 ${j + 1} 에 표제어가 안 보인다: ${x.ko.slice(0, 30)}`);
      if (w.level <= 2 && w.grade !== 'C') {
        const len = x.ko.replace(/[\s.,!?~…「」'"]/g, '').length;
        if (len > EX_MAX) warn.push(`${at} — 예문 ${j + 1} 이 길다(${len}자 · 초급은 18자 안팎): ${x.ko}`);
        else if (HARD.test(x.ko + ' ')) warn.push(`${at} — 예문 ${j + 1} 문법이 초급보다 어렵다: ${x.ko}`);
      } else if (w.grade !== 'C') {
        /* TOPIK II(3~6급)는 중고급 문법 · 글말을 쓰되, 낱말 하나를 배우는 문장이라 길이는 막는다
           (docs/antigravity/antigravity-vocab-topik2-task.md: 30글자 안팎). */
        const len = x.ko.replace(/[\s.,!?~…「」'"]/g, '').length;
        if (len > EX_MAX2) warn.push(`${at} — 예문 ${j + 1} 이 길다(${len}자 · 중고급은 30자 안팎): ${x.ko}`);
      }
      if (w.hanja && !/^[㐀-鿿豈-﫿]+$/.test(w.hanja)) err.push(`${at} — hanja 는 한자만(${w.hanja})`);
    });
    /* 한자어는 글자 수가 음절 수와 같다(경제 → 經濟, 경제적 → 經濟的). 다르면 고유어에 뜻 한자를 붙였을 가능성이 크다
       (TOPIK II 1묶음: 먼지 → 埃 · 뿌리 → 根). 「-하다 · -되다」 같은 꼬리는 떼고 센다. */
    if (w.hanja) {
      const stem = w.head.replace(/(하다|되다|시키다|스럽다|롭다|히|이다)$/, '');
      if (![w.head.length, stem.length].includes([...w.hanja].length)) warn.push(`${at} — 한자 글자 수가 음절과 다르다(${w.head} · ${w.hanja}) — 고유어면 비운다`);
    }
    if (w.rel != null && (typeof w.rel !== 'object' || Array.isArray(w.rel))) err.push(`${at} — rel 은 객체`);
    else for (const [k, v] of Object.entries(w.rel || {})) {
      if (!(typeof v === 'string' || (Array.isArray(v) && v.every((x) => typeof x === 'string')))) err.push(`${at} — rel.${k} 는 글자나 글자 배열`);
    }
    const nTopic = w.topics?.length || 0, nEx = (w.examples || []).filter((x) => x?.ko).length;
    if (w.grade === 'B' || w.grade === 'A') {
      if (!nTopic) err.push(`${at} — ${w.grade}급은 주제가 하나 이상`);
      if (!nEx) err.push(`${at} — ${w.grade}급은 예문이 하나 이상`);
    }
    if (w.grade === 'A') {
      if (nEx < 2) err.push(`${at} — A급은 예문이 둘 이상`);
      if (!String(w.en_simple || '').trim()) err.push(`${at} — A급은 en_simple(쉬운 영어 뜻)이 있어야`);
    }
    stat.grade[w.grade] = (stat.grade[w.grade] || 0) + 1;
    stat.level[w.level] = (stat.level[w.level] || 0) + 1;
    (w.purposes || []).forEach((p) => { stat.purpose[p] = (stat.purpose[p] || 0) + 1; });
    if (!nTopic) stat.topicless++;
    if (!nEx) stat.exless++;
  });
}

/* 화면 자료(vocab-topik1.js, tools/build-vocab.mjs 생성물)가 원본과 맞나 — 원본만 고치고 안 구우면
   화면에는 예전 낱말이 그대로 남는다. 낱말 수(B · A급)와 표제어 차례로 본다. */
for (const name of ['topik1', 'topik2']) {
  const BUILT = path.join(ROOT, `vocab-${name}.js`);
  if (!fs.existsSync(BUILT) || !files.includes(`${name}.json`)) continue;
  const src = JSON.parse(fs.readFileSync(path.join(DIR, `${name}.json`), 'utf8')).filter((w) => w.grade === 'B' || w.grade === 'A');
  const heads = [...fs.readFileSync(BUILT, 'utf8').matchAll(/^\{.*?"h":("(?:[^"\\]|\\.)*")/gm)].map((m) => JSON.parse(m[1]));
  if (heads.length !== src.length || heads.some((h, k) => h !== src[k].head))
    err.push(`vocab-${name}.js 가 원본과 다르다(구운 것 ${heads.length} · 원본 B급 이상 ${src.length}) — node tools/build-vocab.mjs`);
  /* TOPIK II 예문 조각(500개씩) — 모자라면 뒤쪽 낱말의 예문이 화면에서 영영 비어 있다. */
  const exDir = path.join(ROOT, `vocab-${name}-ex`);
  if (fs.existsSync(exDir)) {
    const need = Math.ceil(src.length / 500);
    for (let k = 0; k < need; k++) if (!fs.existsSync(path.join(exDir, `${k}.js`)))
      err.push(`vocab-${name}-ex/${k}.js 가 없다(예문 조각 ${need}개가 있어야 한다) — node tools/build-vocab.mjs`);
  }
}

/* --base <git 주소> — 묶음 검토. 안 그래비티가 거듭 어긴 것(급수 · 출처 · 채워진 영어 뜻 · 이미 B 인 줄 · 이번 묶음 밖의 C 줄)을
   main 과 줄마다 견준다(docs/antigravity/antigravity-vocab-topik2-task.md). 바뀐 곳은 「고쳐야 할 것」, 반대말 · 비슷한 말은 사람이 보게 뽑는다. */
const bi = process.argv.indexOf('--base');
if (bi > 0) {
  const ref = process.argv[bi + 1];
  const { execFileSync } = await import('node:child_process');
  const KEEP = ['id', 'head', 'level', 'freq', 'src', 'std', 'hint'];
  for (const f of files) {
    let base;
    try { base = JSON.parse(execFileSync('git', ['show', `${ref}:vocab/data/${f}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 })); }
    catch (e) { continue; }   // main 에 없는 새 파일
    const now = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    if (now.length !== base.length) { err.push(`${f}: 줄 수가 바뀌었다(${base.length} → ${now.length}) — 줄을 더하거나 빼지 않는다`); continue; }
    const bad = {}, put = (k, h) => (bad[k] ||= []).push(h);
    const fresh = [];
    now.forEach((w, i) => {
      const p = base[i];
      for (const k of KEEP) if (JSON.stringify(p[k]) !== JSON.stringify(w[k])) put(k, p.head);
      if (p.en && p.en !== w.en) put('en(채워진 것)', p.head);
      if (p.grade !== 'C' && JSON.stringify(p) !== JSON.stringify(w)) put('이미 B 인 줄', p.head);
      else if (p.grade === 'C' && w.grade === 'C' && JSON.stringify(p) !== JSON.stringify(w)) put('C 로 남은 줄', p.head);
      if (p.grade === 'C' && w.grade !== 'C') fresh.push(w);
    });
    for (const [k, hs] of Object.entries(bad)) err.push(`${f}: ${k} 을(를) ${hs.length}곳 바꿨다 — ${hs.slice(0, 8).join(' · ')}${hs.length > 8 ? ' …' : ''}`);
    const rel = (k) => fresh.filter((w) => w.rel?.[k]?.length).map((w) => `${w.head}${k === 'ant' ? '↔' : '='}${w.rel[k].join('/')}`);
    for (const w of fresh) for (const k of ['syn', 'ant']) for (const x of w.rel?.[k] || [])
      if (x === w.head || !/^[가-힣 ]+$/.test(x)) err.push(`${f}: ${w.head} 의 ${k} 에 「${x}」 — 표제어 자신 · 한글 아닌 것은 넣지 않는다`);
    console.log(`\n[묶음 검토 ${f}] ${ref} 에 견줘 B급이 된 줄 ${fresh.length}개` +
      (fresh.length ? `\n  반대말 ${rel('ant').length}: ${rel('ant').join('  ')}\n  비슷한 말 ${rel('syn').length}: ${rel('syn').join('  ')}` : ''));
  }
}

const kv = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(' · ') || '-';
console.log(`낱말 자료 ${stat.n}개 (${files.length}개 파일)`);
console.log(`  등급 ${kv(stat.grade)} | 급수 ${kv(stat.level)}`);
console.log(`  목적 ${kv(stat.purpose)}`);
console.log(`  주제 없음 ${stat.topicless} · 예문 없음 ${stat.exless} · 영어 뜻 없음 ${stat.enless || 0}`);
const shown = ALL ? warn : warn.slice(0, 15);
if (warn.length) console.log(`\n짚어 둘 것 ${warn.length}건` + (shown.length < warn.length ? ' (앞 15 · 전부: --all)' : '') + '\n  · ' + shown.join('\n  · '));
if (err.length) { console.error(`\n고쳐야 할 것 ${err.length}건\n  ✗ ` + err.slice(0, 40).join('\n  ✗ ')); process.exit(1); }
console.log('\n이상 없음');
