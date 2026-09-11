/* 크롬 익스텐션이 깨진 데 없이 꾸려지는지 본다.
 *
 *   node tools/check-extension.mjs
 *
 * 크롬은 없는 파일을 가리켜도 **설치할 때는 아무 말이 없다.** 그 쪽을
 * 열었을 때에야 빈 화면이 나온다. 그래서 manifest 와 HTML 이 가리키는
 * 파일이 실제로 있는지 여기서 먼저 센다 — 웹 스토어에 올리고 나서
 * 알아차리면 심사를 다시 받는다.
 *
 * 자료가 낡았는지는 tools/build-extension.mjs --check 가 본다. 여기서도
 * 함께 부른다 — 검사를 두 번 돌리게 하면 한 번은 빠뜨린다.
 */
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXT = join(ROOT, 'extension');
const bad = [];

const has = (p) => access(join(EXT, p)).then(() => true, () => false);
const say = (m) => bad.push(m);

/* ── manifest ─────────────────────────────────────────────── */

const mf = JSON.parse(await readFile(join(EXT, 'manifest.json'), 'utf8'));

/* manifest 안에서 파일을 가리키는 자리를 다 훑는다. 손으로 목록을 적어
   두면 manifest 에 칸을 더할 때마다 여기도 고쳐야 하고, 안 고치면
   검사가 조용히 덜 보게 된다. */
const refs = new Set();
(function walk(v, key) {
  if (typeof v === 'string') {
    /* 확장자가 붙은 상대 주소만 파일로 본다. `<all_urls>` 나 https:// 는 아니다. */
    if (/^[\w./-]+\.(js|css|html|png|json)$/.test(v)) refs.add(v);
    return;
  }
  if (Array.isArray(v)) { v.forEach((x) => walk(x, key)); return; }
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) walk(v[k], k); }
})(mf);

for (const r of refs) if (!await has(r)) say(`manifest 가 가리키는 ${r} 가 없다`);

/* ── 말 ───────────────────────────────────────────────────── */

const keys = [...JSON.stringify(mf).matchAll(/__MSG_(\w+)__/g)].map((m) => m[1]);
for (const loc of ['en', 'ko']) {
  const path = `_locales/${loc}/messages.json`;
  if (!await has(path)) { say(`${path} 가 없다`); continue; }
  const msgs = JSON.parse(await readFile(join(EXT, path), 'utf8'));
  for (const k of keys) {
    if (!msgs[k]?.message) say(`${path} 에 ${k} 가 없다 — 그 말로 쓰는 사람에게 빈 이름이 뜬다`);
  }
}
if (!keys.includes('name')) say('manifest 의 name 이 __MSG_…__ 가 아니다');
if (mf.default_locale && !await has(`_locales/${mf.default_locale}/messages.json`)) {
  say(`default_locale 이 ${mf.default_locale} 인데 그 말이 없다 — 크롬이 설치를 거부한다`);
}

/* ── HTML 이 부르는 것 ────────────────────────────────────── */

const PAGES = ['popup/popup.html', 'newtab/newtab.html', 'options/options.html'];
for (const page of PAGES) {
  if (!await has(page)) { say(`${page} 가 없다`); continue; }
  const html = await readFile(join(EXT, page), 'utf8');

  /* MV3 는 쪽 안에 박은 <script> 를 안 돌린다. 박아 두면 그 쪽이 통째로
     안 움직이는데 화면에는 아무 말도 안 나온다. */
  if (/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?\S[\s\S]*?<\/script>/.test(html)) {
    say(`${page} 안에 박은 <script> 가 있다 — MV3 가 안 돌린다`);
  }
  if (/\son\w+\s*=/.test(html)) say(`${page} 에 onclick= 같은 것이 있다 — MV3 가 안 돌린다`);

  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|data:|#|mailto:)/.test(url)) continue;
    const abs = resolve(dirname(join(EXT, page)), url);
    if (!await access(abs).then(() => true, () => false)) {
      say(`${page} 가 부르는 ${url} 가 없다`);
    }
    if (!resolve(abs).startsWith(resolve(EXT))) say(`${page} 가 익스텐션 바깥(${url})을 부른다`);
  }
}

/* ── 코드가 부르는 자료 ───────────────────────────────────── */

/* src/data.js 가 `data/…json` 을 이름으로 부른다. 구운 자료의 이름을
   바꾸면 여기서 걸린다 — 화면에서는 「못 찾았습니다」로만 보인다. */
const dataJs = await readFile(join(EXT, 'src/data.js'), 'utf8');
for (const m of dataJs.matchAll(/'(data\/[\w./-]+\.json)'/g)) {
  if (!await has(m[1])) say(`src/data.js 가 부르는 ${m[1]} 가 없다 — 먼저 구울 것`);
}

/* 뜻풀이 언어팩. store.js 의 목록과 구운 파일이 짝이 맞아야 한다 —
   화면에는 있는데 파일이 없는 말을 고르면 영어로 조용히 물러선다. */
const storeJs = await readFile(join(EXT, 'src/store.js'), 'utf8');
/* GLOSS_LANGS 덩어리만 떼어 본다. 파일 전체에서 `xx: '…'` 를 찾으면
   DEFAULTS 의 `ui: 'auto'` 까지 말로 세어 data/lang/ui.json 을 찾는다 —
   실제로 그랬다. */
const langBlock = storeJs.match(/GLOSS_LANGS\s*=\s*\{([\s\S]*?)\};/)?.[1] || '';
if (!langBlock) say('src/store.js 에서 GLOSS_LANGS 를 못 찾았다');
const listed = [...langBlock.matchAll(/(\w{2}):\s*'/g)].map((m) => m[1]).filter((c) => c !== 'en');
for (const l of listed) {
  if (!await has(`data/lang/${l}.json`)) say(`설정에 ${l} 이 있는데 data/lang/${l}.json 이 없다`);
}

/* ── 구운 자료가 낡지 않았나 ──────────────────────────────── */

const built = await has('data/built.json');
if (!built) {
  say('extension/data/ 가 없다 — node tools/build-extension.mjs');
} else {
  const { execFileSync } = await import('node:child_process');
  try {
    execFileSync(process.execPath, [join(ROOT, 'tools/build-extension.mjs'), '--check'],
      { stdio: 'pipe' });
  } catch (e) {
    say(String(e.stderr || '').trim() || 'extension/data/ 가 낡았다');
  }
}

/* ── ─────────────────────────────────────────────────────── */

if (bad.length) {
  for (const b of bad) console.error(`✕ ${b}`);
  console.error(`\n${bad.length}군데.`);
  process.exit(1);
}
console.log(`extension/ — manifest 가 가리키는 파일 ${refs.size}개 · 쪽 ${PAGES.length}개 ·`
  + ` 뜻풀이 ${listed.length + 1}개 말. 다 있다.`);
