/* 예문 게시판의 씨앗 글 검사.
   씨앗 글은 「다른 학습자가 이 표현으로 쓴 문장」으로 보이는 자리라, 그 표현을
   실제로 쓰지 않은 문장이 하나라도 섞이면 게시판 전체가 못 믿을 것이 된다.

   node tools/check-seeds.mjs */
import { SB_CATS, SB_MORE, SB_SEED } from '../sentences.js';

/* 글쓴이 이름. 실제 TOPIK I 응시자 분포를 따라 열 사람으로 둔다.
   더 늘리면 아는 얼굴이 없어지고, 넷이면 열 표현만 넘겨 봐도 같은 이름만 돈다. */
const CAST = ['하루', '사쿠라', 'Minh', 'Tuan', '리한', '샤오위', 'Emma', 'Daniel', 'Aziz', 'Nisha'];
const WHEN = /^\d+(시간|일|주) 전$/;

const points = new Map();
SB_CATS.forEach((c) => c.points.forEach((p) => points.set(p.id, { ...p, cat: c.ko })));

/* 표현 이름에서 반드시 글에 들어가야 할 글자를 뽑는다.
   「-(으)ㄹ 바에야」→「바에야」, 「-는 바람에」→「바람에」.
   「-아/어요」처럼 남는 글자가 한 자뿐이면 단서가 못 되므로 건너뛴다.
   활용하면서 모양이 바뀌는 말(있다·하다 …)도 글자로는 못 잡으니 뺀다. */
const SKIP_STEM = new Set(['있다', '없다', '하다', '되다', '보다', '주다', '가다', '오다', '싶다', '같다', '이다', '아니다', '말다', '지다']);
function mustHave(name) {
  const runs = String(name).match(/[가-힣]{2,}/g) || [];
  let cand = runs
    .filter((r) => !SKIP_STEM.has(r))
    .sort((a, b) => b.length - a.length)[0];
  if (!cand) return null;
  /* 「-는 셈치다」는 글에서 「셈치고」로 나온다. 기본형의 「다」를 떼고
     줄기만 본다 — 안 그러면 멀쩡한 글이 죄다 걸린다. */
  if (cand.endsWith('다') && cand.length >= 3) cand = cand.slice(0, -1);
  return cand.length >= 2 ? cand : null;
}

const errs = [], warns = [];
const seenText = new Map();
let posts = 0, withSeed = 0;

points.forEach((p, id) => {
  const list = SB_SEED[id];
  if (!list || !list.length) return;
  withSeed++;
  const at = `${id} ${p.name}`;
  if (!Array.isArray(list)) return errs.push(`${at} — 씨앗이 배열이 아니다`);
  const by = new Set();
  list.forEach((s, i) => {
    posts++;
    const where = `${at} #${i + 1}`;
    if (!Array.isArray(s) || s.length !== 4) return errs.push(`${where} — [이름, 글, 좋아요, 때] 넷이 아니다`);
    const [who, text, likes, when] = s;
    if (!CAST.includes(who)) errs.push(`${where} — 모르는 이름 「${who}」`);
    by.add(who);
    if (!Number.isInteger(likes) || likes < 0 || likes > 9) errs.push(`${where} — 좋아요가 0~9 가 아니다 (${likes})`);
    if (!WHEN.test(when)) errs.push(`${where} — 때가 「N시간 전 / N일 전 / N주 전」이 아니다 (${when})`);

    const t = String(text);
    if (t.length < 8) errs.push(`${where} — 너무 짧다 (${t.length}자)`);
    if (t.length > 70) errs.push(`${where} — 너무 길다 (${t.length}자)`);
    if (!/[.?!]$/.test(t)) errs.push(`${where} — 마침표가 없다`);
    if (/[一-鿿]/.test(t)) errs.push(`${where} — 한자`);
    if (/[A-Za-z]{3,}/.test(t)) errs.push(`${where} — 영어 낱말`);
    if (t.includes('**')) errs.push(`${where} — 별표`);
    if (/\s{2,}/.test(t)) errs.push(`${where} — 빈칸이 겹쳤다`);

    /* 이미 화면에 떠 있는 예문을 씨앗으로 또 올리면 「남이 쓴 글」이 아니라
       같은 문장이 두 번 보이는 것이 된다. */
    if (t === p.ex) errs.push(`${where} — 표현의 대표 예문과 같다`);
    if (t === (SB_MORE[id] || [])[3]) errs.push(`${where} — 「예문 하나 더」와 같다`);

    const prev = seenText.get(t);
    if (prev) errs.push(`${where} — ${prev} 와 글이 똑같다`);
    else seenText.set(t, where);

    const need = mustHave(p.name);
    if (need && !t.includes(need)) warns.push(`${where} — 「${need}」가 안 보인다: ${t}`);
  });
  if (list.length >= 2 && by.size < list.length) warns.push(`${at} — 같은 사람이 두 번 썼다`);
});

const total = points.size;
console.log(`표현 ${total}개 · 씨앗이 붙은 표현 ${withSeed}개 · 글 ${posts}개`);
const empty = total - withSeed;
if (empty) console.log(`아직 빈 표현 ${empty}개`);

const tally = {};
Object.values(SB_SEED).forEach((a) => a.forEach((s) => { tally[s[0]] = (tally[s[0]] || 0) + 1; }));
if (posts) console.log('글쓴이:', CAST.map((n) => `${n} ${tally[n] || 0}`).join(' · '));

console.log(`\n■ 고쳐야 할 것 ${errs.length}건`);
errs.slice(0, 60).forEach((x) => console.log('  ' + x));
if (errs.length > 60) console.log(`  … 그리고 ${errs.length - 60}건 더`);
console.log(`\n□ 눈으로 볼 것 ${warns.length}건`);
warns.slice(0, 60).forEach((x) => console.log('  ' + x));
if (warns.length > 60) console.log(`  … 그리고 ${warns.length - 60}건 더`);
if (!errs.length) console.log('\n이상 없음');
process.exit(errs.length ? 1 : 0);
