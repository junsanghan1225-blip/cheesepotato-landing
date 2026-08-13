/*
 * 예문 게시판 데이터 검사기
 *
 * 이 저장소는 푸시하면 1~2분 뒤 everykoreans.com 에 그대로 나간다.
 * 예문 게시판은 단계(초급·중급·고급)로 걸러서 보여 주므로, 표현 하나에
 * lv 가 빠지거나 오타가 나면 그 표현이 학생 화면에서 조용히 사라진다.
 * 아무도 신고하지 않는다 — 없는 걸 없다고 아는 사람이 없기 때문이다.
 *
 * 실행: node tools/check-sentences.mjs
 *
 * 잡아내는 것
 *   - lv 가 없거나 셋 중 하나가 아님 — 중급으로 떨어져 엉뚱한 데 섞인다
 *   - 표현 id 중복 — 학생 글이 localStorage 에서 서로 섞인다
 *   - id 가 '갈래번호-표현번호' 꼴이 아니거나 갈래 번호와 안 맞음
 *   - desc / ex 가 비어 있음 — 상세 화면이 빈칸으로 열린다
 *   - MORE 가 없거나 칸이 4개가 아님 — 형태·주의할 점 자리가 빈다
 *   - MORE / SEED 가 없는 표현 id 를 가리킴 — 영영 안 보이는 자료가 된다
 *   - 한 단계가 통째로 비어 있음 — 그 탭에 들어간 학생이 빈 화면을 본다
 */
import { SB_CATS, SB_MORE, SB_SEED } from '../sentences.js';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const errs = [];
const warns = [];

const seen = new Map();
const tally = { beginner: 0, intermediate: 0, advanced: 0 };

for (const c of SB_CATS) {
  if (!Array.isArray(c.points) || !c.points.length) {
    errs.push(`갈래 ${c.id} (${c.ko}) 에 표현이 하나도 없다`);
    continue;
  }
  for (const p of c.points) {
    const where = `${p.id} (${p.name})`;

    if (seen.has(p.id)) errs.push(`${where} — id 중복. 먼저 나온 곳: ${seen.get(p.id)}`);
    else seen.set(p.id, `갈래 ${c.id} ${c.ko}`);

    if (!/^\d+-\d+$/.test(String(p.id))) {
      errs.push(`${where} — id 가 '갈래번호-표현번호' 꼴이 아니다`);
    } else if (Number(String(p.id).split('-')[0]) !== c.id) {
      errs.push(`${where} — id 앞자리가 갈래 번호 ${c.id} 와 다르다`);
    }

    if (!LEVELS.includes(p.lv)) {
      errs.push(`${where} — lv 가 ${p.lv === undefined ? '없다' : `'${p.lv}' 다`}. ${LEVELS.join(' / ')} 중 하나여야 한다`);
    } else {
      tally[p.lv]++;
    }

    if (!p.name?.trim()) errs.push(`${where} — name 이 비어 있다`);
    if (!p.desc?.trim()) errs.push(`${where} — desc 가 비어 있다`);
    if (!p.ex?.trim()) errs.push(`${where} — ex 가 비어 있다`);

    const more = SB_MORE[p.id];
    if (!more) errs.push(`${where} — MORE 가 없다. 상세 화면의 형태·주의할 점이 빈칸으로 열린다`);
    else if (!Array.isArray(more) || more.length !== 4) {
      errs.push(`${where} — MORE 는 [형태, 자주 함께 쓰는 말, 주의할 점, 예문] 네 칸이어야 한다 (지금 ${Array.isArray(more) ? more.length : typeof more})`);
    } else if (more.slice(0, 3).some((x) => !String(x).trim())) {
      warns.push(`${where} — MORE 앞 세 칸 중 빈 것이 있다`);
    }
  }
}

for (const id of Object.keys(SB_MORE)) {
  if (!seen.has(id)) errs.push(`MORE['${id}'] — 그런 표현이 SB_CATS 에 없다`);
}
for (const id of Object.keys(SB_SEED)) {
  if (!seen.has(id)) errs.push(`SEED['${id}'] — 그런 표현이 SB_CATS 에 없다`);
}

for (const lv of LEVELS) {
  if (!tally[lv]) warns.push(`'${lv}' 단계에 표현이 하나도 없다 — 그 탭은 빈 안내만 보인다`);
}

const seedPts = Object.keys(SB_SEED).length;
console.log(`갈래 ${SB_CATS.length} · 표현 ${seen.size} — 초급 ${tally.beginner} / 중급 ${tally.intermediate} / 고급 ${tally.advanced}`);
console.log(`MORE ${Object.keys(SB_MORE).length}개 · SEED 가 붙은 표현 ${seedPts}개`);

if (warns.length) {
  console.log(`\n짚어 둘 것 ${warns.length}건`);
  warns.forEach((w) => console.log('  · ' + w));
}
if (errs.length) {
  console.log(`\n고쳐야 할 것 ${errs.length}건`);
  errs.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n이상 없음');
