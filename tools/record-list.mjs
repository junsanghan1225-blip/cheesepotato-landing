/* 녹음소(record.html)가 읽을 「녹음할 것」 목록을 만든다.

     node tools/record-list.mjs

   tools/tts-manifest.mjs 가 뽑는 「소리가 나는 자리」 전부에서, 이미 **사람 목소리로
   녹음한 것**을 빼고 record/ 에 갈래별 JSON 으로 쓴다.

   파일이 있다고 끝난 것이 아니다 — 상당수는 기계(ElevenLabs)로 구운 소리다.
   그래서 상태를 셋으로 가른다.
     none  파일이 없다 → 화면에서 브라우저 목소리(로봇)로 나온다. 가장 급하다.
     tts   기계로 구운 파일이 있다 → 바꾸면 좋다.
     (mine 사람이 녹음함 → 목록에서 뺀다)
   「사람이 녹음함」은 assets/audio/recorded/*.txt 에 적힌 파일이다. 녹음소가 내보내는
   ZIP 에 그 묶음의 목록(txt)이 같이 들어 있어서, 풀어서 올리면 저절로 쌓인다.

   녹음을 올린 뒤에는 이것을 다시 돌려 목록을 새로 만든다. */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO = path.join(ROOT, 'assets/audio');
const OUT = path.join(ROOT, 'record');

/* 녹음소에 보일 갈래와 순서 — 급한 것부터. 예문 게시판의 대화(dialogue)는 화면이 아직
   소리를 안 틀어서 뺀다(녹음해도 들을 곳이 없다). */
const GROUPS = [
  { id: 'eps',     src: ['eps'],            ko: 'EPS-TOPIK 듣기',      en: 'EPS-TOPIK listening',
    note: '한 문항에 여러 줄이면 줄마다 녹음합니다. 내보낼 때 한 파일로 이어 붙여요. 「여」 줄은 여자 목소리가 좋아요 — 문제가 「여자는 무엇을…」을 묻기도 해요.' },
  { id: 'listen',  src: ['listen'],         ko: 'TOPIK 듣기',          en: 'TOPIK listening',
    note: '줄마다 녹음하면 내보낼 때 이어 붙입니다. 「여」 줄은 여자 목소리가 좋아요.' },
  { id: 'course',  src: ['course'],         ko: '코스 소리 · 글자 카드', en: 'Course sounds',
    note: '레슨에서 누르면 나오는 소리예요. 또박또박, 보통 빠르기로.' },
  { id: 'writing', src: ['writing'],        ko: 'TOPIK 쓰기 지문',      en: 'TOPIK writing passages',
    note: '안내문 · 설명문을 읽는 톤으로.' },
  { id: 'dict',    src: ['dict', 'dictex'], ko: '사전 낱말 · 예문',     en: 'Dictionary words & examples',
    note: '가나다 순이에요 — 지난번 「나태」까지 하셨어요. 낱말 다음에 그 낱말의 예문이 이어서 나옵니다.' },
  { id: 'example', src: ['example'],        ko: '예문 만들기 예문',      en: 'Grammar examples', note: '' },
  { id: 'reading', src: ['reading'],        ko: '읽기 지문',            en: 'Reading passages',
    note: '긴 글이라 한 번에 읽기 어려우면 끊어 읽어도 됩니다(끝부분 잡음만 조심).' },
];

const jsonl = execFileSync(process.execPath,
  [path.join(ROOT, 'tools/tts-manifest.mjs'), '--only', GROUPS.flatMap((g) => g.src).join(',')],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
const rows = jsonl.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));

const mine = new Set();
const recDir = path.join(AUDIO, 'recorded');
if (fs.existsSync(recDir)) {
  for (const f of fs.readdirSync(recDir)) {
    if (!f.endsWith('.txt')) continue;
    fs.readFileSync(path.join(recDir, f), 'utf8').split(/\r?\n/).map((x) => x.trim()).filter(Boolean).forEach((x) => mine.add(x));
  }
}

const JAMO = /^[ㄱ-ㆎ]$/;
const ko = new Intl.Collator('ko');
fs.mkdirSync(OUT, { recursive: true });
const index = { built: new Date().toISOString().slice(0, 10), groups: [] };

for (const g of GROUPS) {
  let items = rows.filter((r) => g.src.includes(r.group));
  if (g.id === 'dict') {
    // 낱말 → 그 낱말의 예문 순으로, 가나다 차례
    const head = (r) => r.out.replace(/^dict\//, '').replace(/(-ex)?\.mp3$/, '');
    items.sort((a, b) => ko.compare(head(a), head(b)) || (a.group === 'dict' ? -1 : 1));
  }
  const stat = { none: 0, tts: 0, mine: 0 };
  const list = [];
  for (const r of items) {
    if (mine.has(r.out)) { stat.mine++; continue; }
    const st = fs.existsSync(path.join(AUDIO, r.out)) ? 'tts' : 'none';
    stat[st]++;
    const it = { out: r.out, st, parts: r.parts.map((p) => ({ v: p.narration ? 'n' : p.voice, t: p.text })) };
    if (r.group === 'dictex') it.kind = 'ex';
    if (r.parts.length === 1 && JAMO.test(r.parts[0].text.trim())) it.hint = '낱자 — 이름(기역) 말고 소리로(ㄱ → 그, ㅏ → 아)';
    list.push(it);
  }
  fs.writeFileSync(path.join(OUT, `${g.id}.json`), JSON.stringify(list));
  index.groups.push({ id: g.id, ko: g.ko, en: g.en, note: g.note, ...stat });
  console.log(`${g.ko.padEnd(14)} 없음 ${String(stat.none).padStart(5)} · 기계 ${String(stat.tts).padStart(5)} · 내 목소리 ${String(stat.mine).padStart(5)}`);
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));
console.log(`\nrecord/ 에 썼다 (${index.built}).`);
