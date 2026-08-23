/* 글에서 문법을 찾는다.
 *
 * 예문 만들기에 문법 290개가 이름·설명·예문까지 갖춰 쌓여 있는데, 읽기
 * 연습에서 「-는 바람에」를 처음 본 사람은 **그것이 문법인 줄도 모른다.**
 * 낱말이면 눌러서 사전을 보겠지만 어미는 눌러 볼 데가 없었다.
 *
 * 여기서 글을 훑어 아는 문법이 있는 자리를 돌려준다. 화면은 그 자리에
 * 밑줄을 긋고, 누르면 무슨 문법인지 말풍선으로 띄운다.
 *
 * ── 겹치면 긴 쪽이 이긴다 ────────────────────────────────────
 * 「-(으)ㄴ/는데도」와 「-(으)ㄴ/는데」는 같은 자리에서 함께 걸린다. 짧은
 * 쪽을 집으면 「-는데도」를 「-는데」라고 가르치게 된다. 그래서 걸린 것을
 * 길이로 줄 세워 긴 것부터 자리를 잡고, 이미 잡힌 자리와 겹치는 것은
 * 버린다.
 */
import { GRAMMAR } from './grammar.js?v=e24e7ef9';

const BASE = 0xac00;

/* 그 받침이 든 글자를 전부 펼친다. 받침 하나에 19×21 = 399자다.
   구운 파일에는 한 글자(Ⓝ)로만 적혀 있다 — 여기 펼쳐 두면 파일이
   통째로 부풀어 오르고, 정작 브라우저가 받는 것은 그 부푼 쪽이다. */
function jong(t) {
  let s = '';
  for (let c = 0; c < 19; c++) for (let v = 0; v < 21; v++) s += String.fromCharCode(BASE + c * 588 + v * 28 + t);
  return '[' + s + ']';
}

/* 「-아/어」가 녹아 붙을 수 있는 글자만 모은다. 받침이 없고 홀소리가
   ㅏ(0) ㅐ(1) ㅓ(4) ㅕ(6) ㅘ(9) ㅙ(10) ㅝ(14) 인 것들이다. */
function merged() {
  const V = [0, 1, 4, 6, 9, 10, 14];
  let s = '';
  for (let c = 0; c < 19; c++) for (const v of V) s += String.fromCharCode(BASE + c * 588 + v * 28);
  return '[' + s + ']';
}

const SUB = {
  'Ⓝ': jong(4),    // ㄴ
  'Ⓡ': jong(8),    // ㄹ
  'Ⓜ': jong(16),   // ㅁ
  'Ⓑ': jong(17),   // ㅂ
  /* 「-았/었」이 녹아 붙은 자리. 「갔」 「먹었」 「했」 「봤」이 다 받침 ㅆ 이다. */
  'Ⓢ': jong(20),   // ㅆ
  /* 「-아/어」가 앞 글자와 녹아 붙은 자리. 「가+아서」는 「가서」,
     「하+아서」는 「해서」, 「보+아」는 「봐」다. 글자는 종잡을 수 없어도
     **꼴은 좁다** — 받침이 없고 홀소리가 ㅏㅐㅓㅕㅘㅙㅝ 가운데 하나다.
     아무 글자로나 열어 두었더니 「길게 내다보는」이 「-아/어 내다」로,
     「비판보다」가 「-아/어 보다」로 걸렸다. */
  'Ⓐ': merged(),
  /* 앞에 말이 온다는 표시. 찾는 데는 쓰고 **밑줄에는 안 넣는다** —
     「일어납니다」의 밑줄이 「어납니다」부터 시작하면 낱말이 잘린 자리라
     무엇을 짚었는지 알 수 없다. */
  'Ⓗ': '[가-힣]',
};

const RE = GRAMMAR.map((g) => ({
  ...g,
  rx: g.re.map((src) => ({
    re: new RegExp(src.replace(/[ⓃⓇⓂⒷⓈⒶⒽ]/g, (c) => SUB[c]), 'g'),
    head: src.startsWith('Ⓗ') ? 1 : 0,
  })),
}));

/**
 * 글에서 아는 문법이 있는 자리를 찾는다.
 *
 * @param {string} text
 * @returns {{from:number,to:number,id:string,name:string,desc:string}[]}
 *          앞에서부터 차례로, 서로 겹치지 않는다.
 */
export function grammarScan(text) {
  const s = String(text || '');
  if (!s) return [];

  const found = [];
  for (const g of RE) {
    for (const { re, head } of g.rx) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(s))) {
        if (!m[0].length) { re.lastIndex++; continue; }
        found.push({ from: m.index + head, to: m.index + m[0].length, id: g.id, name: g.name, desc: g.desc });
      }
    }
  }

  /* 긴 것부터 자리를 잡는다. 같은 길이면 앞에 있는 것이 먼저다. */
  found.sort((a, b) => (b.to - b.from) - (a.to - a.from) || a.from - b.from);
  const taken = [];
  for (const f of found) {
    if (taken.some((t) => f.from < t.to && t.from < f.to)) continue;
    taken.push(f);
  }
  return taken.sort((a, b) => a.from - b.from);
}
