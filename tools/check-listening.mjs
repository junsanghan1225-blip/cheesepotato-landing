/* 듣기 문항 검사기 — node tools/check-listening.mjs
 *
 * 듣기는 눈으로 훑어서 잡기가 특히 어렵다. 화면에 대본이 안 보이기
 * 때문이다. 읽기라면 지문과 보기가 한 화면에 있어 어긋나면 눈에
 * 띄지만, 듣기는 소리로 지나가 버려서 「여자의 중심 생각」을 묻는데
 * 대본에 여자가 없어도 만든 사람조차 모른다.
 *
 * 그래서 여기서 잡는다. */

import { TOPIKL_ITEMS, TOPIKL2_ITEMS, TOPIKL_BLUEPRINT, TOPIKL2_BLUEPRINT,
         TOPIKL_PICTURE_SLOTS } from '../topik-listening.js';

const bad = [];
const warn = [];
const err = (id, m) => bad.push(`${id}: ${m}`);
const soft = (id, m) => warn.push(`${id}: ${m}`);

const WHO = { m: '남자', w: '여자', n: '안내' };

function check(items, blueprint, examKey) {
  const seen = new Set();
  const pairs = {};
  const answerCount = [0, 0, 0, 0];
  const pic = TOPIKL_PICTURE_SLOTS[examKey];

  for (const q of items) {
    const id = q.id || '(id 없음)';

    if (!q.id) err(id, 'id 가 없다. 진도가 id 로 묶이므로 반드시 있어야 한다');
    if (seen.has(q.id)) err(id, 'id 가 겹친다');
    seen.add(q.id);

    if (q.exam !== examKey) err(id, `exam 이 ${q.exam} 이다. ${examKey} 묶음에 들어 있다`);

    /* ── 자리 ── */
    const b = blueprint.find((x) => q.slot >= x.from && q.slot <= x.to);
    if (!b) err(id, `${q.slot}번은 청사진에 없는 자리다`);
    else if (b.type !== q.type) err(id, `${q.slot}번은 ${b.type} 자리인데 type 이 ${q.type} 이다`);

    if (pic && pic.slots.includes(q.slot))
      err(id, `${q.slot}번은 그림이 있어야 하는 자리다. 대본만으로는 그 유형이 안 된다`);

    /* ── 대본 ── */
    if (!Array.isArray(q.script) || !q.script.length) {
      err(id, '대본(script)이 없다. 들려줄 것이 없으면 듣기 문항이 아니다');
    } else {
      q.script.forEach((line, i) => {
        if (!WHO[line.who]) err(id, `${i + 1}번째 줄의 who 가 「${line.who}」다. m·w·n 만 쓴다`);
        if (!String(line.text || '').trim()) err(id, `${i + 1}번째 줄이 비어 있다`);
      });

      /* 발문이 누구를 묻는지와 대본에 그 사람이 있는지 — 듣기에서 가장
         잡기 어려운 어긋남이다. 「여자의 중심 생각」인데 대본에 여자가
         없으면 그 문제는 풀 방법이 아예 없다. */
      const whos = new Set(q.script.map((l) => l.who));
      for (const [key, name] of Object.entries(WHO)) {
        if (key === 'n') continue;
        if (String(q.q || '').includes(name) && !whos.has(key))
          err(id, `발문이 「${name}」을 묻는데 대본에 ${name}가 없다`);
      }

      /* 대화인데 한 사람만 말하면 「두 사람이 이야기한다」는 유형이 안 된다.
         독백·안내 방송(n)은 예외다. */
      if (whos.size === 1 && !whos.has('n') && q.script.length > 1)
        soft(id, '한 사람이 여러 줄을 말한다. 대화 유형이면 상대가 있어야 한다');
    }

    /* ── 보기와 답 ── */
    if (!Array.isArray(q.options) || q.options.length !== 4)
      err(id, `보기가 ${q.options?.length ?? 0}개다. 넷이어야 한다`);
    else {
      const norm = q.options.map((o) => String(o).replace(/\s+/g, ''));
      if (new Set(norm).size !== 4) err(id, '보기 중에 같은 것이 있다');
    }

    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
      err(id, `answer 가 ${q.answer} 다. 0~3 이어야 한다`);
    else answerCount[q.answer]++;

    if (!String(q.q || '').trim()) err(id, '발문(q)이 없다');
    if (!String(q.why || '').trim()) err(id, '해설(why)이 없다. 틀린 사람이 왜 틀렸는지 알 길이 없다');

    /* 해설이 보기를 번호로 가리키면 안 된다. 정답 자리를 고르게 맞추느라
       보기 순서가 바뀌면 번호만 남아 엉뚱한 보기를 가리키게 된다. */
    if (/[①②③④]|[1-4]\s*번(?!째)/.test(String(q.why || '')))
      err(id, '해설이 보기를 번호로 가리킨다. 보기 글자를 그대로 인용해라');

    /* ── 짝 ── */
    if (q.pair) (pairs[q.pair] = pairs[q.pair] || []).push(q);
  }

  /* 짝지은 두 문항은 대본이 글자까지 같아야 한다. 한 번 들려주고 두 문제를
     내는 자리인데 대본이 다르면 두 번 들려줘야 한다. */
  for (const [name, group] of Object.entries(pairs)) {
    if (group.length !== 2) { err(name, `짝인데 ${group.length}개다. 둘이어야 한다`); continue; }
    const [a, b2] = group;
    const s = (x) => x.script.map((l) => `${l.who}:${l.text}`).join('\n');
    if (s(a) !== s(b2)) err(name, `짝(${a.id} · ${b2.id})의 대본이 다르다. 한 번 들려주고 두 문제를 내는 자리다`);
  }

  /* 정답 자리가 몰리면 내용 대신 자리를 외운다. */
  const n = items.length;
  if (n >= 8) {
    answerCount.forEach((c, i) => {
      const share = c / n;
      if (share > 0.4) bad.push(`${examKey}: 정답이 ${i + 1}번째 보기에 ${c}/${n} (${Math.round(share * 100)}%) 몰려 있다`);
      if (c === 0) bad.push(`${examKey}: ${i + 1}번째 보기가 정답인 문항이 하나도 없다`);
    });
  }

  return { n, answerCount };
}

const r1 = check(TOPIKL_ITEMS, TOPIKL_BLUEPRINT, 'I');
const r2 = check(TOPIKL2_ITEMS, TOPIKL2_BLUEPRINT, 'II');

console.log(`TOPIK I  듣기 ${r1.n}문항 · 정답 자리 ${r1.answerCount.join('·')}`);
console.log(`TOPIK II 듣기 ${r2.n}문항 · 정답 자리 ${r2.answerCount.join('·')}`);

if (warn.length) {
  console.log(`\n짚어 볼 것 ${warn.length}개`);
  warn.forEach((w) => console.log('  · ' + w));
}
if (bad.length) {
  console.log(`\n고쳐야 할 것 ${bad.length}개`);
  bad.forEach((b) => console.log('  ✗ ' + b));
  process.exit(1);
}
console.log('\n문제 없음');
