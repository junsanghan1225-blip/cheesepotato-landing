/* 구울 소리를 한자리에 모은다 — node tools/tts-manifest.mjs
 *
 * 이 판에서 소리가 나는 자리를 전부 훑어 「무엇을 어떤 목소리로 구워서
 * 어디에 둘 것인가」를 JSONL 로 낸다. tools/tts-build.mjs 가 이것을 읽는다.
 *
 * 목록을 코드에서 뽑는 이유 — 손으로 적으면 문항을 더할 때마다 목록에
 * 넣는 것을 잊는다. 그러면 새 문항만 로봇 목소리로 나오는데, 그건 눈에
 * 잘 안 띈다. 여기서 뽑으면 자료를 고치는 순간 목록도 따라온다.
 *
 * ── 목소리 두 벌이 필요하다 ──────────────────────────────
 * 대화(듣기 대본, 예문 게시판의 A·B)는 두 사람이 말한다. 한 목소리로
 * 둘을 다 읽으면 「여자는 무엇을 합니까」가 성립하지 않는다. m·w 두
 * 벌로 굽고 이어 붙인다.
 *
 * ── 쓰는 법 ──────────────────────────────────────────────
 *   node tools/tts-manifest.mjs              전부
 *   node tools/tts-manifest.mjs --only listen,course
 *   node tools/tts-manifest.mjs --count      갈래별 글자 수만 (돈 계산)
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const load = async (f) => import(pathToFileURL(path.join(ROOT, f)).href);

const args = process.argv.slice(2);
const only = (() => {
  const i = args.indexOf('--only');
  return i >= 0 && args[i + 1] ? new Set(args[i + 1].split(',')) : null;
})();
const countOnly = args.includes('--count');

/* 화면의 audioSlug 와 **글자 하나까지 같아야 한다.** 다르면 파일을 올려도
   화면이 못 찾아서 로봇 목소리가 계속 나온다. app.module.js 를 고치면
   여기도 고쳐라.

   낱자 범위(U+3130~318F)를 반드시 넣어라. ㄱ·ㅏ 같은 낱자는 한글 음절
   범위(U+AC00~D7AF)에 없어서, 빼면 「ㄱ」이 통째로 지워져 이름이 빈
   문자열이 된다. 글자 카드 39개가 통째로 사라진다. */
const audioSlug = (text) => String(text ?? '').trim()
  .replace(/[^\u3130-\u318F\uAC00-\uD7AFa-zA-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .slice(0, 64);

const rows = [];
const add = (group, out, parts) => {
  parts = parts.filter((p) => String(p.text || '').trim());
  if (!parts.length) return;
  rows.push({ group, out, parts });
};
const want = (g) => !only || only.has(g);

/* ── 1. 코스의 소리 · 글자 카드 ─────────────────────────────
   say:'…' 와 글자 카드 ch:'…'. 한글을 처음 배우는 사람이 가장 먼저
   듣는 소리라 여기가 제일 중요하다. */
if (want('course')) {
  const files = fs.readdirSync(ROOT).filter((f) => /^courses.*\.js$/.test(f));
  const seen = new Set();
  for (const f of files) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const re of [/\bsay\s*:\s*'([^']+)'/g, /\bsay\s*:\s*"([^"]+)"/g,
                      /\bch\s*:\s*'([^']+)'/g,  /\bch\s*:\s*"([^"]+)"/g]) {
      for (const m of code.matchAll(re)) {
        const text = m[1].trim();
        if (!text || seen.has(text)) continue;
        seen.add(text);
        add('course', `${audioSlug(text)}.mp3`, [{ voice: 'm', text }]);
      }
    }
  }
}

/* ── 2. 예문 게시판 — 예문과 대화 ───────────────────────────
   ex 는 한 사람이 읽고, dlg 는 A·B 두 사람이 주고받는다.
   **A 를 남자, B 를 여자로 굽는다.** 자료에 성별이 안 적혀 있어 정한
   것이고, 대화가 두 목소리로 들리는 것이 한 목소리보다 늘 낫다. */
if (want('example') || want('dialogue')) {
  const mods = ['sentences.js', 'sentences-beginner.js', 'sentences-intermediate.js'];
  for (const f of mods) {
    const mod = await load(f);
    const cats = Object.values(mod).find((v) => Array.isArray(v) && v[0]?.points);
    if (!cats) continue;
    for (const cat of cats) {
      for (const p of cat.points || []) {
        if (want('example') && p.ex)
          add('example', `${audioSlug(p.ex)}.mp3`, [{ voice: 'm', text: p.ex }]);
        if (want('dialogue') && Array.isArray(p.dlg) && p.dlg.length) {
          add('dialogue', `dlg/${p.id}.mp3`, p.dlg.map((line, i) => ({
            voice: i % 2 === 0 ? 'm' : 'w',
            text: String(line).replace(/^\s*[AB]\s*:\s*/, '').trim(),
          })));
        }
      }
    }
  }
}

/* ── 3. TOPIK 듣기 대본 ─────────────────────────────────────
   **한 문항 = 한 파일.** 실제 시험은 대화가 끊기지 않고 이어서 들리므로
   줄마다 파일을 두면 사이에 로딩 틈이 생겨 난이도가 달라진다.
   who 를 그대로 목소리로 옮긴다 — 안내 방송(n)은 남자 목소리로 읽되
   조금 또박또박하게(build 쪽에서 setting 을 달리한다). */
if (want('listen')) {
  const { TOPIKL_ITEMS, TOPIKL2_ITEMS } = await load('topik-listening.js');
  for (const q of [...TOPIKL_ITEMS, ...TOPIKL2_ITEMS]) {
    add('listen', `listen/${q.id}.mp3`,
      q.script.map((l) => ({ voice: l.who === 'w' ? 'w' : 'm', text: l.text, narration: l.who === 'n' })));
  }
}

/* ── 4. 읽기 지문 ───────────────────────────────────────────
   읽고 쓰는 갈래라 소리가 꼭 필요하진 않지만, 읽으면서 같이 들으면
   낭독 연습이 된다. 글자 수가 가장 많은 묶음이라 예산을 볼 때 여기를
   먼저 뺀다. */
if (want('reading')) {
  const { READING } = await load('reading.js');
  for (const len of Object.values(READING)) {
    for (const lv of Object.values(len)) {
      for (const p of lv) {
        if (p.passage) add('reading', `read/${p.id}.mp3`, [{ voice: 'm', text: p.passage }]);
      }
    }
  }
}

/* ── 5. TOPIK 쓰기 지문 ─────────────────────────────────────
   51·52 의 안내문·설명문. 빈칸 표시 ( ㉠ ) 는 읽으면 안 되므로 뺀다 —
   「동그라미 기역」이라고 읽어 버린다. */
if (want('writing')) {
  const { TW_ITEMS } = await load('topik-writing.js');
  for (const w of TW_ITEMS) {
    if (!w.passage) continue;
    const text = w.passage.replace(/\(\s*[㉠-㉿]\s*\)/g, ' ').replace(/\s{2,}/g, ' ').trim();
    add('writing', `write/${w.id}.mp3`, [{ voice: 'm', text }]);
  }
}

/* ── 이름이 겹치면 나중 것이 앞 것을 덮는다 ────────────────
   audioSlug 가 64자에서 자르기 때문에 긴 문장 둘이 앞 64자가 같으면
   같은 파일이 된다. 조용히 덮이면 엉뚱한 문장이 재생되므로 짚어 둔다. */
const byOut = new Map();
const clash = [];
/* 마침표·느낌표만 다른 같은 문장은 충돌이 아니다 — 한 녹음이 둘을 다
   맡으면 되고, 실제로 그게 맞다. 읽을 말이 정말 다를 때만 짚는다. */
const bare = (r) => r.parts.map((p) => `${p.voice}:${p.text.replace(/[\s.,!?~…·"'「」]/g, '')}`).join('|');
for (const r of rows) {
  const had = byOut.get(r.out);
  if (had && bare(had) !== bare(r)) clash.push({ out: r.out, a: had, b: r });
  byOut.set(r.out, r);
}
const uniq = [...byOut.values()];

const chars = (r) => r.parts.reduce((a, p) => a + p.text.length, 0);
const stat = {};
uniq.forEach((r) => {
  const s = (stat[r.group] = stat[r.group] || { n: 0, c: 0, parts: 0 });
  s.n++; s.c += chars(r); s.parts += r.parts.length;
});

const line = (k, s) =>
  `  ${k.padEnd(9)} ${String(s.n).padStart(5)}개  ${String(s.c).padStart(7)}자` +
  (s.parts > s.n ? `  (조각 ${s.parts}개 — 이어 붙임)` : '');

const total = { n: uniq.length, c: uniq.reduce((a, r) => a + chars(r), 0),
                parts: uniq.reduce((a, r) => a + r.parts.length, 0) };

if (countOnly || !process.stdout.isTTY === false) { /* 표는 늘 stderr 로 */ }
console.error('구울 소리');
Object.entries(stat).forEach(([k, s]) => console.error(line(k, s)));
console.error('  ' + '─'.repeat(46));
console.error(line('합계', total));
console.error(`\n  ElevenLabs 크레딧은 글자 수로 나간다. Creator 요금제가 달마다 100,000자다.`);
console.error(`  지금 목록은 ${total.c.toLocaleString()}자 — 한도의 ${Math.round(total.c / 1000)}%.`);
if (clash.length) {
  console.error(`\n  ⚠ 이름이 같은데 읽을 말이 다른 것 ${clash.length}개.`);
  console.error('    나중 것이 앞 것을 덮어써서 엉뚱한 문장이 재생된다.');
  clash.slice(0, 5).forEach((c) => {
    console.error(`    · ${c.out}`);
    console.error(`        A: ${c.a.parts.map((p) => p.text).join(' / ').slice(0, 60)}`);
    console.error(`        B: ${c.b.parts.map((p) => p.text).join(' / ').slice(0, 60)}`);
  });
}

if (!countOnly) uniq.forEach((r) => console.log(JSON.stringify(r)));
