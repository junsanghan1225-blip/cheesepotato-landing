/* 동화책 검사기 — node tools/check-stories.mjs
 *
 * 동화책(stories.js)은 **전부 창작**이어야 한다(운영자 결정 2026-10-03). 저작권에 걸리면 사이트가 끝난다.
 * 이 검사기는 이름난 작품 · 인물 이름이 들어간 것을 막는다 — 다만 줄거리를 베낀 것까지 잡지는 못한다.
 * 그래서 이것은 그물이지 검토를 대신하지 않는다. 사람(Claude · 운영자)이 한 편씩 읽는 것이 먼저다.
 *
 * 모양도 본다: id · 레벨 · 쪽 길이 · 말하는 이 · 낱말이 본문에 있는지 · 이해 문제. */
import { STORIES } from '../stories.js';

const bad = [], warn = [];
const err = (id, m) => bad.push(`${id}: ${m}`);
const soft = (id, m) => warn.push(`${id}: ${m}`);

/* 이름난 동화 · 전래동화 · 그림책 · 만화 · 영화의 제목 · 인물. 「조금 바꿔 쓰기」를 막으려고 넉넉히 둔다.
   전래동화도 넣는다 — 이야기 자체는 오래됐어도 요즘 다시 쓴 판(그림책 · 교과서)마다 저작권이 따로 있고,
   우리가 지은 이야기가 아니면 「창작」이라고 말할 수 없다. */
const BANNED = [
  '흥부', '놀부', '심청', '콩쥐', '팥쥐', '해님 달님', '해님달님', '선녀와 나무꾼', '나무꾼', '혹부리', '도깨비방망이',
  '토끼와 거북', '별주부', '금도끼', '은도끼', '견우', '직녀', '홍길동', '단군', '우렁각시', '청개구리', '해와 달',
  '신데렐라', '백설공주', '일곱 난쟁이', '잠자는 숲', '빨간 모자', '헨젤', '그레텔', '라푼젤', '인어공주', '피노키오',
  '아기 돼지 삼형제', '아기돼지', '미운 오리', '성냥팔이', '엄지공주', '피터 팬', '피터팬', '앨리스', '오즈', '도로시',
  '곰돌이 푸', '푸우', '피터 래빗', '어린 왕자', '어린왕자', '해리 포터', '해리포터', '겨울왕국', '엘사', '디즈니',
  '뽀로로', '크롱', '루피', '타요', '핑크퐁', '아기상어', '아기 상어', '라바', '짱구', '도라에몽', '피카츄', '포켓몬',
  '헬로키티', '헬로 키티', '스누피', '미키', '슈렉', '토토로', '라이언킹', '심바', '알라딘', '지니',
  '이솝', '안데르센', '그림 형제', '배고픈 애벌레', '구름빵', '강아지똥', '마당을 나온 암탉',
];
const LEN = { 1: 70, 2: 100, 3: 140 };   // 레벨마다 한 쪽 글자 수 위 끝 — 입문자 쪽이 길면 넘기지 않는다
const WHO = new Set(['potato', 'cheese', 'n']);

const seen = new Set();
const answerAt = [0, 0, 0, 0];
for (const s of STORIES) {
  const id = s.id || '(id 없음)';
  if (!/^sb-\d{2,3}$/.test(s.id || '')) err(id, 'id 는 sb-01 꼴');
  if (seen.has(s.id)) err(id, 'id 가 겹친다'); seen.add(s.id);
  if (!(Number.isInteger(s.lv) && s.lv >= 1 && s.lv <= 7)) err(id, `lv 가 ${s.lv} — 1 ~ 7`);   // 레벨별 이야기 L1~L7(docs/antigravity/antigravity-stories-more-task.md)
  for (const k of ['title', 'blurb']) if (!s[k]?.ko || !s[k]?.en) err(id, `${k} 의 ko · en 이 다 있어야 한다`);
  if (!Array.isArray(s.pages) || s.pages.length < 5 || s.pages.length > 14) err(id, `쪽이 ${s.pages?.length ?? 0} — 5~14`);

  const all = [s.title?.ko, s.title?.en, s.blurb?.ko, s.blurb?.en,
    ...(s.pages || []).flatMap((p) => [p.ko, p.en]), ...(s.words || []).flatMap((w) => [w.ko, w.en]),
    ...(s.quiz || []).flatMap((q) => [q.q?.ko, q.q?.en, ...(q.options || [])])].join('\n');
  for (const b of BANNED) if (all.includes(b)) err(id, `「${b}」 — 이름난 작품 · 인물 이름이다. 창작 이야기에 쓰지 않는다`);
  if (/기출|출처|원작|각색|retold|adapted from|based on/i.test(all)) err(id, '「원작 · 각색 · 출처」 같은 말 — 창작 이야기에는 원작이 없다');

  (s.pages || []).forEach((p, i) => {
    if (!WHO.has(p.who)) err(id, `${i + 1}쪽 who 가 「${p.who}」 — potato · cheese · n`);
    if (!String(p.ko || '').trim() || !String(p.en || '').trim()) err(id, `${i + 1}쪽 ko · en 이 비었다`);
    if (String(p.ko || '').length > (LEN[s.lv] || 140)) soft(id, `${i + 1}쪽이 ${p.ko.length}자 — L${s.lv} 는 ${LEN[s.lv]}자 안쪽이 읽기 쉽다`);
    if (p.who !== 'n' && !/^["“]/.test(String(p.ko || '').trim())) soft(id, `${i + 1}쪽은 ${p.who} 가 말하는 쪽인데 따옴표로 시작하지 않는다`);
  });

  const text = (s.pages || []).map((p) => p.ko).join(' ');
  for (const w of s.words || []) {
    if (!w.ko || !w.en) { err(id, '낱말에 ko · en 이 다 있어야 한다'); continue; }
    const stem = w.ko.endsWith('다') && w.ko.length > 1 ? w.ko.slice(0, -1).replace(/하$/, '') : w.ko;
    if (!text.includes(stem.slice(0, Math.max(1, stem.length - 1)))) soft(id, `낱말 「${w.ko}」가 본문에 안 보인다`);
  }
  if ((s.words || []).length < 4) soft(id, '낱말이 4개보다 적다');

  for (const [i, q] of (s.quiz || []).entries()) {
    if (!q.q?.ko || !q.q?.en) err(id, `문제 ${i + 1} 의 q.ko · q.en`);
    if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4) err(id, `문제 ${i + 1} 보기는 서로 다른 넷`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(id, `문제 ${i + 1} answer 는 0~3`);
    else answerAt[q.answer]++;
  }
  if ((s.quiz || []).length < 2) soft(id, '이해 문제가 둘보다 적다');
}
const nq = answerAt.reduce((a, b) => a + b, 0);
if (nq >= 8) answerAt.forEach((c, i) => { if (c / nq > 0.4) bad.push(`정답이 ${i + 1}번째 보기에 ${c}/${nq} 몰려 있다`); });

console.log(`동화책 ${STORIES.length}편 · 쪽 ${STORIES.reduce((n, s) => n + (s.pages?.length || 0), 0)} · 문제 ${nq}`);
if (warn.length) { console.log(`\n짚어 볼 것 ${warn.length}개`); warn.forEach((w) => console.log('  · ' + w)); }
if (bad.length) { console.log(`\n고쳐야 할 것 ${bad.length}개`); bad.forEach((b) => console.log('  ✗ ' + b)); process.exit(1); }
console.log('\n문제 없음');
