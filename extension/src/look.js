/* 찾기 엔진. 끌어 놓은 글에서 낱말과 문법을 집어낸다.
 *
 * 화면 세 군데(말풍선·팝업·새 탭)가 이 파일 하나를 같이 쓴다. 사이트에서
 * 배운 것이다 — 재는 쪽과 하는 쪽이 갈라지면 숫자가 일을 안 하고 위로를
 * 한다. 여기서는 팝업에서 찾은 뜻과 말풍선에 뜬 뜻이 갈라지는 일이다.
 *
 * 사전을 찾는 규칙(토씨·활용 떼기)은 사이트의 gloss-find.js 를 그대로
 * 쓴다. 베끼지 않는다 — tools/build-extension.mjs 가 원본을 굽는다.
 *
 * 자료는 src/data.js 가 fetch 로 읽어 온다(그쪽 머리말에 왜 import 가
 * 아닌지 적어 두었다). 그래서 여기 있는 것은 거의 다 async 다. */
import { glossFind } from '../data/gloss-find.js';
import { grammarScan } from '../data/grammar-find.js';
import * as D from './data.js';
import { dictUrl, dictAppUrl, pointUrl, pointAppUrl, sayUrl } from './site.js';

/** 글에서 한글 덩어리만 뽑는다. 「안녕, world!」 → ['안녕'] */
const tokens = (s) => String(s || '').match(/[가-힣]+/g) || [];

/* 한 낱말의 뜻 한 줄. 사전에 없으면 null — 지어내지 않는다. */
function one(G, pack, lang, form) {
  const key = glossFind((k) => Object.prototype.hasOwnProperty.call(G, k), form);
  if (!key) return null;
  const e = G[key];
  const head = e.head || key;
  return {
    form, head, pos: e.pos || '',
    en: e.en || '',
    /* 고른 말에 뜻이 없으면 영어로 물러서고, 영어도 없으면 빈 칸으로 둔다.
       사이트와 같은 규칙이다 — 지어내 채우면 학습자가 그 틀린 뜻을 외운다. */
    gloss: (pack && pack[head]) || e.en || '',
    lang: (pack && pack[head]) ? lang : (e.en ? 'en' : ''),
    url: dictUrl(head), appUrl: dictAppUrl(head),
    /* 소리 주소도 여기서 만들어 보낸다. 부르는 쪽(말풍선은 모듈을 못 읽는
       content script 다)이 제각기 이어 붙이면 규칙이 두 벌이 된다. */
    say: sayUrl(head),
  };
}

/**
 * 끌어 놓은 글을 본다.
 *
 * @param {string} text 끌어 놓은 글
 * @param {object} opt
 * @param {string} opt.lang 뜻풀이 말
 * @param {string} opt.context 그 글이 든 문장. 문법은 여기서 찾는다 —
 *        낱말 하나만 끌어도 그 문장의 문법을 보여 주려는 것이다.
 * @param {boolean} opt.grammar 문법을 찾을까
 * @param {boolean} opt.full  낱말 하나일 때 예문까지 붙일까
 */
export async function look(text, opt = {}) {
  const { lang = 'en', context = '', grammar = true, full = true } = opt;

  const out = { q: String(text || '').trim(), words: [], missed: [], grammar: [] };
  if (!out.q) return out;

  const [G, pack] = await Promise.all([D.glossary(), D.langPack(lang).catch(() => null)]);

  /* 문법을 먼저 찾는다. 낱말보다 앞이어야 하는 까닭은 아래 「가리기」에 있다.

     문장이 함께 오면 문장에서 찾는다. 「-는 바람에」는 낱말 하나를 끌어서는
     걸릴 수 없는 것이고, 학습자가 걸려 넘어지는 것은 그쪽이다. */
  const src = context && context.includes(out.q) ? context : out.q;
  const base = src === out.q ? 0 : src.indexOf(out.q);
  let hits = [];
  if (grammar) {
    hits = (await scan(src)).slice(0, 4);
    out.grammar = hits.map((g) => ({
      id: g.id, name: g.name, desc: g.desc,
      hit: src.slice(g.from, g.to),
      url: pointUrl(g.id), appUrl: pointAppUrl(g.id),
    }));
  }

  /* ── 문법이 집은 자리는 사전을 안 붙인다 ──────────────────────
     「비가 오는 바람에」의 「바람에」를 사전에서 찾으면 wind 가 나온다.
     바람이 분 적이 없는 문장인데도 그렇다 — 여기 「바람」은 문법
     「-는 바람에」의 한 조각이지 낱말이 아니다.

     사이트의 규칙이 여기서도 그대로다: **틀린 뜻을 내주느니 빈 칸을
     내준다.** 빈 칸도 아니다 — 그 자리는 바로 윗줄의 문법이 이미
     설명하고 있다. 그래서 문법이 집은 자리에 통째로 든 낱말은 뺀다.

     문법을 안 보이기로 한 설정에서는 빼지 않는다. 빼 놓고 까닭을
     안 보여 주면 그냥 사라진 것이 된다. */
  const covered = (from, to) => hits.some((g) => from >= g.from && to <= g.to);

  /* 낱말. 같은 표제어로 모이는 것은 한 번만 낸다 — 「집에서 집을」이
     「집」 두 줄이 되면 읽을 것이 아니라 셀 것이 된다. */
  const seen = new Set();
  let n = 0;
  for (const m of out.q.matchAll(/[가-힣]+/g)) {
    if (++n > 40) break;
    const form = m[0];
    if (base >= 0 && covered(base + m.index, base + m.index + form.length)) continue;
    const w = one(G, pack, lang, form);
    if (!w) { if (!seen.has(form)) out.missed.push(form); continue; }
    if (seen.has(w.head)) continue;
    seen.add(w.head);
    out.words.push(w);
  }

  /* 낱말 하나면 예문까지 펼친다. 여럿이면 목록이라 예문 자리가 없다. */
  if (full && out.words.length === 1) {
    const ex = (await D.examples())[out.words[0].head];
    if (ex) Object.assign(out.words[0], {
      ex: ex.ex, exEn: ex.en, sayEx: sayUrl(out.words[0].head, 'ex'),
    });
  }
  return out;
}

/**
 * 표제어 하나를 카드 한 장으로. 새 탭과 팝업이 낱말을 펼쳐 보일 때 쓴다.
 * 끌어 놓은 글이 아니라 **표제어를 이미 알 때** 부르는 자리라 찾기를 건너뛴다.
 */
export async function card(head, lang = 'en') {
  const [G, pack] = await Promise.all([D.glossary(), D.langPack(lang).catch(() => null)]);
  const w = one(G, pack, lang, head);
  if (!w) return null;
  const ex = (await D.examples())[w.head];
  if (ex) Object.assign(w, { ex: ex.ex, exEn: ex.en, sayEx: sayUrl(w.head, 'ex') });
  return w;
}

/** 카드로 낼 만한 표제어. 예문이 붙은 것만 — 예문 없는 카드는 반쪽이다. */
export async function cardHeads() {
  return Object.keys(await D.examples());
}

/**
 * 쪽 전체에 밑줄을 그으려고 문법 자리만 받아 간다.
 * @returns {{from:number,to:number,id:string,name:string,desc:string}[]}
 */
export async function scan(text) {
  return grammarScan(String(text || ''), await D.grammar());
}

/** 팝업의 찾기 칸. 사전에 있는 표제어를 앞글자로 찾는다. */
export async function suggest(q, n = 12, lang = 'en') {
  const s = String(q || '').trim();
  if (!s) return [];
  const [G, pack] = await Promise.all([D.glossary(), D.langPack(lang).catch(() => null)]);

  /* 활용형까지 다 훑는다. 「먹었」을 쳐도 「먹다」가 나오게 하려는 것이다 —
     표제어만 보면 사전에 적힌 꼴을 이미 아는 사람만 찾을 수 있다.
     표제어는 사전에 반드시 제 이름으로도 실려 있어서(4,209개 전부)
     한 번 더 찾을 것 없이 그 자리에서 뜻을 꺼낸다. */
  const heads = new Set();
  for (const k of Object.keys(G)) {
    if (k.startsWith(s)) heads.add(G[k].head || k);
  }

  /* 자른 뒤에 줄 세우면 안 된다 — 앞에서 n 개를 집어 놓고 그것끼리만
     줄 세우면 더 알맞은 것이 뒤에 남아 있어도 못 나온다. 다 모아서
     줄 세우고 그다음에 자른다. 짧은 표제어가 먼저다: 「가」를 치면
     「가다」가 「가지고 있다」보다 위다. */
  return [...heads]
    .sort((a, b) => a.length - b.length || a.localeCompare(b, 'ko'))
    .slice(0, n).map((h) => one(G, pack, lang, h)).filter(Boolean);
}
