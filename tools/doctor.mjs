#!/usr/bin/env node
/* 올리기 전에 한자리에서 다 본다 — node tools/doctor.mjs
 *
 * 검사기가 스무 대가 넘는다. README 「올리기 전에」에 차례가 적혀 있지만,
 * 손으로 열넉 줄을 치다 보면 결국 몇 개를 빼먹는다. **빼먹은 줄은 조용하다.**
 * stamp 를 빼먹었을 때 코드는 멀쩡했고, 브라우저가 예전 파일을 쥐고 있었고,
 * 「고쳤는데 그대로인데?」 하는 말을 들은 뒤에야 알았다.
 *
 * 그리고 이 도구를 처음 돌렸을 때 **이미 두 대가 빨간 채로 있었다**
 * (check-courses · check-geo). 아무도 안 돌리고 있었다는 뜻이다. 열넉 줄을
 * 손으로 치라고 하면 그렇게 된다.
 *
 *   node tools/doctor.mjs           다 본다. 아무것도 안 고친다
 *   node tools/doctor.mjs --fix     구울 것을 굽고 자국을 찍은 뒤 다시 본다
 *   node tools/doctor.mjs --quick   이번에 손댄 파일에 걸리는 검사기만
 *   node tools/doctor.mjs --list    무엇을 돌릴 셈인지만 보여 준다
 *   node tools/doctor.mjs --since <ref>   견줄 자리 (기본 origin/main)
 *
 * 보는 것은 넷이다.
 *
 *   1) 굽기 — 원본을 고쳤는데 생성물이 그대로인가
 *   2) 문법 — node --check. 파일 하나가 통째로 안 붙는 일을 먼저 막는다
 *   3) 검사기 — tools/check-*.mjs 를 전부, 한꺼번에
 *   4) 자국 — ?v= 가 지금 내용과 맞는가
 *
 * **검사기 목록을 손으로 안 적는다.** tools/ 를 읽어서 check-*.mjs 를 그대로
 * 쓴다. 새 검사기를 더하면 다음 번에 저절로 끼어든다 — 목록을 손으로 적으면
 * 그 목록이 낡고, 목록이 낡는 것이 이 도구가 막으려던 바로 그 일이다.
 *
 * 어느 검사기가 어느 파일을 보는지도 손으로 안 적는다. 검사기가 부르는
 * import 를 따라가서 스스로 알아낸다. --quick 이 그것을 쓴다.
 */
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const FIX = has('--fix'), QUICK = has('--quick'), LIST = has('--list');
const SINCE = (() => {
  const i = argv.findIndex((a) => a === '--since' || a.startsWith('--since='));
  if (i < 0) return null;
  return argv[i].includes('=') ? argv[i].split('=')[1] : argv[i + 1];
})();

if (has('-h') || has('--help')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^\/\*|^ \* ?|^ \*/gm, ''));
  process.exit(0);
}

/* 색은 사람이 볼 때만 쓴다. 파이프로 넘기면 그냥 글자만 나간다. */
const ESC = String.fromCharCode(27);
const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (n, s) => (tty ? `${ESC}[${n}m${s}${ESC}[0m` : s);
const red = (s) => c(31, s), green = (s) => c(32, s), yellow = (s) => c(33, s);
const dim = (s) => c(2, s), bold = (s) => c(1, s);
const OK = green('✓'), NO = red('✗');

/* ── 무엇이 바뀌었나 ─────────────────────────────────────────────── */
const git = (a) => execFileSync('git', ['-c', 'core.quotepath=false', ...a],
  { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const haveRef = (r) => { try { git(['rev-parse', '--verify', '--quiet', r]); return true; } catch { return false; } };

function changedFiles() {
  const set = new Set();
  let base = SINCE || ['origin/main', 'main'].find(haveRef) || null;
  try {
    for (const line of git(['status', '--porcelain']).split('\n')) {
      if (!line.trim()) continue;
      let p = line.slice(3);
      if (p.includes(' -> ')) p = p.split(' -> ').pop();
      set.add(p.trim());
    }
  } catch { /* 저장소가 아니면 그냥 전부 본다 */ }
  if (base && haveRef(base)) {
    /* 세 점이다 — 갈라진 자리부터 견준다. 두 점을 쓰면 main 이 앞서 갔을 때
       내가 안 건드린 남의 파일까지 「바뀐 것」이 된다. */
    try { git(['diff', '--name-only', `${base}...HEAD`]).split('\n').forEach((p) => p && set.add(p.trim())); }
    catch { base = null; }
  } else base = null;

  /* 자국만 바뀐 파일은 「안 바뀐 것」으로 친다.
   *
   * stamp.mjs 는 index.html·app.module.js·sentences.js 같은 데에 ?v= 를
   * 다시 박는다. 그러면 git 은 그 파일들이 바뀌었다고 하고, 여기서는
   * 「sentences.js 를 고쳤는데 grammar.js 는 그대로다 → 다시 구워라」가
   * 된다. **고친 적이 없는데 굽게 만든다.** 실제로 한 번 그랬다.
   *
   * 자국을 떼고 견줘서 같으면 내용은 그대로인 것이다. */
  if (base) {
    const V = /\?v=[0-9a-f]{8}/g;
    for (const f of [...set]) {
      if (!/\.(js|html|css)$/.test(f)) continue;
      let now = '', was = '';
      try { now = readFileSync(join(ROOT, f), 'utf8'); } catch { continue; }
      if (!V.test(now)) continue;
      V.lastIndex = 0;
      try { was = git(['show', `${base}:${f}`]); } catch { continue; }
      /* 끝의 줄바꿈은 떼고 견준다 — git() 이 trim 을 하므로 딸려 온 쪽만
         줄바꿈이 없어 늘 다르다고 나온다. 한 번 그랬다. */
      if (now.replace(V, '').trim() === was.replace(V, '').trim()) set.delete(f);
    }
  }
  return { files: set, base };
}
const { files: CHANGED, base: BASE } = changedFiles();

const hit = (pat) => {
  for (const f of CHANGED) {
    if (pat.endsWith('/')) { if (f.startsWith(pat)) return f; continue; }
    if (pat.includes('*')) {
      if (new RegExp('^' + pat.replace(/\./g, '\\.').replace(/\*/g, '[^/]*') + '$').test(f)) return f;
      continue;
    }
    if (f === pat) return f;
  }
  return null;
};

/* ── 구울 것 ─────────────────────────────────────────────────────────
   README 의 「생성물 — 손으로 고치지 말 것」 표와 같은 내용이다. 이것만은
   손으로 적는다 — 무엇이 무엇에서 나오는지는 코드에서 읽어 낼 수가 없다. */
const BUILDS = [
  { step: 1, cmd: 'tools/build-glossary.mjs', what: '뜻풀이 사전',
    from: ['docs/glossary.json', 'docs/glossary-krdict.json'],
    to: ['glossary.js', 'glossary-ja.js', 'glossary-zh.js', 'glossary-vi.js', 'glossary-ru.js',
      'glossary-es.js', 'glossary-fr.js', 'glossary-ar.js', 'glossary-mn.js', 'glossary-id.js'] },
  { step: 1, cmd: 'tools/build-topik2.mjs', what: 'TOPIK II 문항',
    from: ['docs/topik2-all50.json'], to: ['topik2.js'] },
  { step: 2, cmd: 'tools/build-grammar.mjs', what: '글에서 찾아낼 문법',
    from: ['sentences.js', 'sentences-beginner.js', 'sentences-intermediate.js', 'docs/grammar-en.json'],
    to: ['grammar.js', 'grammar-en.js'] },
  { step: 3, cmd: 'tools/build-pages.mjs', what: '검색용 정적 쪽',
    from: ['sentences.js', 'sentences-beginner.js', 'sentences-intermediate.js', 'courses.js',
      'courses-grammar.js', 'courses-grammar-beginner.js', 'courses-grammar-detailed.js',
      'courses-beginner-stage1.js', 'topik-writing.js', 'topik.js', 'topik2.js',
      'topik-listening.js', 'blog.js'],
    to: ['sentence/', 'compare/', 'course/', 'lesson/', 'topik-writing/', 'topik-reading/',
      'topik-listening/', 'blog/', 'sitemap.xml', 'docs/page-mod.json'] },
];

/* 원본이 바뀌었는데 생성물이 안 바뀐 것 = 아직 안 구운 것.
 *
 * 이것은 짐작이다. 원본을 고쳤어도 생성물이 안 바뀔 수 있다(주석만 고친
 * 경우). 그래서 「고쳐야 할 것」이 아니라 「구울 것」으로 따로 센다.
 * --fix 로 실제로 구워 보면 확실해진다. */
function stale() {
  if (!BASE && !CHANGED.size) return [];
  return BUILDS.filter((b) => b.from.some(hit) && !b.to.some(hit))
    .map((b) => ({ ...b, why: b.from.filter(hit).slice(0, 3).join(' · ') }));
}

/* ── 검사기 ──────────────────────────────────────────────────────────
   목록을 손으로 안 적는다. tools/ 에 있는 것이 곧 목록이다. */
const ARGS = { 'check-topik2': ['docs/topik2-all50.json'] };
/* 회차 파일을 인자로 받아야 하는 것. 새 문항을 받았을 때만 손으로 돌린다 —
   check-newwords 는 「틀렸다」가 아니라 「눈으로 보라」는 뜻이라 종료 코드도
   늘 0 이다. 여기 끼우면 아무 뜻 없는 ✓ 만 한 줄 는다. */
const HAND = new Set(['check-style', 'check-newwords']);

/* 이름표는 검사기가 스스로 맨 위에 적어 둔 첫 줄에서 뽑는다 */
function label(id) {
  const src = readFileSync(join(ROOT, 'tools', `${id}.mjs`), 'utf8').split('\n').slice(0, 8);
  for (let line of src) {
    line = line.replace(/^#!.*/, '').replace(/^\s*\/?\*+\s?/, '').trim();
    if (!/[가-힣]/.test(line)) continue;
    return line.split(/\s—\s|\.\s|\(|:/)[0].trim().replace(/[.·]$/, '').slice(0, 26);
  }
  return id;
}

const CHECKS = readdirSync(join(ROOT, 'tools'))
  .filter((f) => /^check-.*\.mjs$/.test(f)).sort()
  .map((f) => f.replace(/\.mjs$/, ''))
  .filter((id) => !HAND.has(id))
  .map((id) => ({ id, args: ARGS[id] || [], what: label(id) }));

/* 어느 검사기가 어느 파일을 보는가 — 검사기가 부르는 것을 따라간다.
 * 손으로 표를 적어 두면 자료가 늘 때 그 표가 낡는다.
 *
 * 길은 **부르는 파일 자리에서** 푼다. tools/check-data.mjs 의 '../sentences.js'
 * 는 뿌리의 sentences.js 이고, tools/check-spelling.mjs 의 './lib/corpus.mjs'
 * 는 tools/lib/corpus.mjs 다. 뿌리에서만 풀면 뒤엣것을 못 찾아 「이 검사기는
 * 아무 파일도 안 본다」가 되고, --quick 이 그 검사기를 통째로 건너뛴다.
 * 처음에 그렇게 만들었고, 새로 만든 검사기 셋이 조용히 빠졌다.
 */
const PATH_RE = /['"]([A-Za-z0-9_\-.][A-Za-z0-9_\-./]*\.(?:js|mjs|json|html|css|xml))['"]/g;
function deps(entry) {
  const out = new Set(), seen = new Set(), queue = [entry];
  while (queue.length) {
    const rel = queue.shift();
    if (seen.has(rel)) continue;
    seen.add(rel);
    let src = '';
    try { src = readFileSync(join(ROOT, rel), 'utf8'); } catch { continue; }
    const base = dirname(rel);
    for (const m of src.matchAll(PATH_RE)) {
      /* 부르는 자리에서 먼저, 안 되면 뿌리에서 */
      for (const cand of [normalize(join(base, m[1])), normalize(m[1])]) {
        if (cand.startsWith('..') || !existsSync(join(ROOT, cand))) continue;
        if (!cand.startsWith('tools/')) out.add(cand);   // 연장은 자료가 아니다
        if (/\.m?js$/.test(cand)) queue.push(cand);
        break;
      }
    }
  }
  return out;
}
const relevant = (id) => {
  if (!QUICK || !CHANGED.size) return true;
  const d = deps(`tools/${id}.mjs`);
  for (const f of CHANGED) if (d.has(f)) return true;
  return false;
};

/* ── 돌리기 ─────────────────────────────────────────────────────────── */
function run(cmd, args) {
  return new Promise((res) => {
    const t0 = Date.now();
    const p = spawn(process.execPath, [cmd, ...args], { cwd: ROOT });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { out += d; });
    p.on('error', () => res({ code: 1, out: '못 돌렸다', ms: Date.now() - t0 }));
    p.on('close', (code) => res({ code, out, ms: Date.now() - t0 }));
  });
}

/* 한꺼번에 돌리되 너무 많이 띄우지는 않는다 — 검사기 하나가 자료 수 MB 를
   읽어 들이므로 다 띄우면 기계가 헐떡인다. */
async function pool(items, n, fn) {
  const res = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; res[k] = await fn(items[k], k); }
  }));
  return res;
}

/* ── 차림 ───────────────────────────────────────────────────────────── */
const secs = (ms) => (ms / 1000).toFixed(1) + '초';
let bad = 0, note = 0;
const todo = [];

console.log(bold('\n올리기 전 점검') + dim(`  ${new Date().toLocaleString('ko-KR')}`));
console.log(dim('─'.repeat(58)));

/* 1. 바뀐 것 */
if (BASE) {
  const shown = [...CHANGED].filter((f) => /\.(js|mjs|json|html|css)$/.test(f)).slice(0, 6);
  console.log(`\n${bold('바뀐 것')}  ${BASE} 에 견줘 ${CHANGED.size}개`);
  if (shown.length) console.log(dim('  ' + shown.join(' · ') + (CHANGED.size > shown.length ? ' …' : '')));
} else {
  console.log(`\n${bold('바뀐 것')}  ${dim('견줄 자리를 못 찾았다 — 전부 본다')}`);
}

/* 2. 구울 것 */
const need = stale().sort((a, x) => a.step - x.step);
console.log(`\n${bold('구울 것')}`);
if (!need.length) console.log(`  ${OK} 원본과 생성물이 함께 바뀌었다`);
for (const b of need) {
  console.log(`  ${NO} node ${b.cmd}`);
  console.log(dim(`     ${b.why} 를 고쳤는데 ${b.what}은 그대로다`));
  todo.push(`node ${b.cmd}`);
  note++;
}

if (LIST) {
  const on = CHECKS.filter((k) => relevant(k.id));
  console.log(`\n${bold('돌릴 검사기')} ${on.length}대`);
  for (const k of CHECKS) {
    const mark = relevant(k.id) ? '  ' : dim('건너뜀');
    console.log(`  ${mark} ${k.id.padEnd(24)} ${dim(k.what)}`);
  }
  console.log(`\n${bold('손으로 돌릴 것')} ${dim('(새 회차를 받았을 때)')}`);
  for (const id of HAND) console.log(`  node tools/${id}.mjs docs/topik2-roundN.json   ${dim(label(id))}`);
  console.log('');
  process.exit(0);
}

/* 3. --fix — 굽고 나서 다시 본다 */
if (FIX && need.length) {
  console.log(`\n${bold('굽는 중')}`);
  for (const b of need) {
    process.stdout.write(`  node ${b.cmd} … `);
    const r = await run(b.cmd, []);
    console.log(r.code ? red('안 됐다') : green(`됐다 (${secs(r.ms)})`));
    if (r.code) {
      console.log(dim(r.out.split('\n').filter((l) => l.trim()).slice(-6).map((l) => '     ' + l).join('\n')));
      bad++;
    }
  }
  todo.length = 0;
  note = 0;
}

/* 4. 문법 — 파일 하나가 통째로 안 붙는 일을 먼저 막는다.
   자료 파일 하나에 쉼표가 빠지면 그 파일을 부르는 화면이 통째로 안 뜬다.
   검사기보다 먼저 본다 — 여기가 깨졌으면 아래는 다 헛돈다. */
const jsFiles = readdirSync(ROOT).filter((f) => f.endsWith('.js'));
const syntax = await pool(jsFiles, 8, (f) => run('--check', [f]));
const broken = jsFiles.filter((_, i) => syntax[i].code);
console.log(`\n${bold('문법')}  node --check ${jsFiles.length}개`);
if (!broken.length) console.log(`  ${OK} 이상 없음`);
for (const f of broken) {
  const r = syntax[jsFiles.indexOf(f)];
  console.log(`  ${NO} ${f}`);
  console.log(dim(r.out.split('\n').filter((l) => l.trim()).slice(0, 3).map((l) => '     ' + l).join('\n')));
  bad++;
}

/* 5. 검사기 */
const runList = CHECKS.filter((k) => relevant(k.id));
const skipped = CHECKS.length - runList.length;
console.log(`\n${bold('검사기')}  ${runList.length}대${skipped ? dim(` (--quick — ${skipped}대는 건너뛴다)`) : ''}`);
const results = await pool(runList, 4, (k) => run(`tools/${k.id}.mjs`, k.args));
for (let i = 0; i < runList.length; i++) {
  const k = runList[i], r = results[i];
  console.log(`  ${r.code === 0 ? OK : NO} ${k.what.padEnd(26)} ${dim(k.id.padEnd(24) + secs(r.ms))}`);
  if (r.code) {
    bad++;
    todo.push(`node tools/${k.id}.mjs ${k.args.join(' ')}`.trim());
    const lines = r.out.split('\n').filter((l) => l.trim());
    console.log(dim(lines.slice(-8).map((l) => '      ' + l).join('\n')));
  }
}

/* 6. 자국 — 맨 나중이다. 굽고 나서 찍어야 구운 것까지 자국이 든다. */
const st = await run('tools/stamp.mjs', FIX ? [] : ['--check']);
console.log(`\n${bold('자국')}  ?v=`);
const stLine = st.out.trim().split('\n')[0] || '';
if (st.code === 0) console.log(`  ${OK} ${stLine}`);
else { console.log(`  ${NO} ${stLine}`); bad++; todo.push('node tools/stamp.mjs'); }

/* 7. 끝 */
console.log('\n' + dim('─'.repeat(58)));
if (!bad && !note) {
  console.log(green('올려도 된다.') + dim('  고쳐야 할 것 없음'));
} else {
  const left = bad ? red(`고쳐야 할 것 ${bad}건`) : green('고쳐야 할 것 없음');
  console.log(left + (note ? ` · ${yellow(`구울 것 ${note}건`)}` : ''));
  if (todo.length) {
    console.log(`\n${bold('다음에 할 일')} ${dim('(이 차례로)')}`);
    for (const t of [...new Set(todo)]) console.log(`  ${t}`);
    if (need.length) console.log(dim('\n  굽는 것은 node tools/doctor.mjs --fix 가 대신 해 준다.'));
  }
}
console.log('');
process.exit(bad ? 1 : 0);
