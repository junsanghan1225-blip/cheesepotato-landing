#!/usr/bin/env node
/* 바깥 CDN 을 저장소 안으로 들여오는 스크립트.
   `node tools/vendor.mjs` 하나로 vendor/ 를 통째로 다시 만든다.

   왜 이렇게 하나 — 예전에는 index.html 이 esm.sh · jsdelivr ·
   fonts.googleapis.com 에서 코드를 바로 받아 왔다. 그 말은 저 세 곳 중
   하나라도 뚫리면(또는 도메인이 남의 손에 넘어가면) 그날로 우리 페이지
   안에서 남의 자바스크립트가 돈다는 뜻이다. 로그인 창이 있는 사이트에서
   그건 그대로 계정 유출 경로다. 게다가 '@2' 처럼 버전을 안 박아 두면
   내가 모르는 사이에 코드가 바뀐다.

   그래서 전부 받아서 저장소에 넣고, CSP 로 바깥을 막았다. 이제 남이
   우리 페이지에 코드를 넣으려면 이 저장소를 먼저 뚫어야 한다.

   npm 레지스트리에서 받는 이유 — esm.sh 와 jsdelivr 는 이 스크립트를
   돌리는 망에서 막혀 있기도 하고, 애초에 원본은 npm 이다. 중간을 한 단계
   걷어내는 편이 맞다.

   버전을 올릴 때는 아래 PIN 만 고치고 다시 돌린다. 다만 supabase 는
   앱(cheesepotato-rn2/package.json)과 같은 줄기를 써야 한다. 갈리면
   앱에서 되던 게 웹에서 안 되는 일이 생긴다. */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'vendor');

/* 박아 둔 버전. 범위(^)가 아니라 딱 한 점이어야 한다 — 범위로 두면
   다시 돌릴 때마다 다른 게 나와서 "저장소에 넣어 뒀다"는 말이 무의미해진다. */
const PIN = {
  '@supabase/supabase-js': '2.112.3',  // 앱은 ^2.108.2 — 이 값이 그 범위 안이다
  'xlsx': '0.18.5',                    // 앱과 같은 값
  'pretendard': '1.3.9',
  'esbuild': '0.28.2',
};

/* Press Start 2P 는 npm 에 없어서 구글에서 직접 받는다. 레트로 게임
   글씨에만 쓰는 라틴 문자 폰트라 키릴·그리스 조각은 안 받는다. */
const GF_CSS = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
const GF_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
              '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const GF_KEEP = ['latin', 'latin-ext'];

const say = (...a) => console.log(...a);
const sh = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/* ── 1. npm 에서 받기 ──────────────────────────────────────── */
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'cheese-vendor-'));
say('내려받는 중 …', stage);
fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({ private: true }));
sh('npm', ['i', '--no-audit', '--no-fund', '--silent',
  ...Object.entries(PIN).map(([n, v]) => `${n}@${v}`)], stage);

const nm = (...p) => path.join(stage, 'node_modules', ...p);
for (const [name, want] of Object.entries(PIN)) {
  const got = JSON.parse(fs.readFileSync(nm(name, 'package.json'), 'utf8')).version;
  if (got !== want) throw new Error(`${name}: ${want} 를 박았는데 ${got} 가 왔다`);
}

/* ── 2. 자바스크립트 두 개를 브라우저용 ESM 한 파일로 묶기 ──── */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'pretendard'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'pressstart2p'), { recursive: true });

const bundle = (entry, out) => {
  sh(nm('.bin', 'esbuild'), [
    entry, '--bundle', '--format=esm', '--platform=browser',
    '--target=es2020', '--minify', '--legal-comments=none', `--outfile=${out}`,
  ], stage);
  say(`  ${path.basename(out)} — ${(fs.statSync(out).size / 1024).toFixed(0)}KB`);
};
say('묶는 중 …');
bundle(nm('@supabase', 'supabase-js', 'dist', 'index.mjs'), path.join(OUT, 'supabase-js.js'));
bundle(nm('xlsx', 'xlsx.mjs'), path.join(OUT, 'xlsx.js'));

/* ── 3. Pretendard ────────────────────────────────────────────
   통짜 파일(2.0MB)이 아니라 조각난 쪽을 쓴다. 통짜는 첫 방문마다 2MB 를
   통째로 받지만, 조각난 쪽은 unicode-range 를 보고 화면에 실제로 나온
   글자가 든 조각만 받는다. 한국어 페이지면 보통 그 10분의 1이다.
   글꼴 이름('Pretendard Variable')은 둘이 같아서 CSS 는 안 고쳐도 된다. */
const pv = nm('pretendard', 'dist', 'web', 'variable');
let pCss = fs.readFileSync(path.join(pv, 'pretendardvariable-dynamic-subset.css'), 'utf8');
pCss = pCss.replace(/\.\/woff2-dynamic-subset\//g, './pretendard/');
if (pCss.includes('woff2-dynamic-subset')) throw new Error('Pretendard 경로가 덜 바뀌었다');
fs.writeFileSync(path.join(OUT, 'pretendard.css'), pCss);

let n = 0;
for (const f of fs.readdirSync(path.join(pv, 'woff2-dynamic-subset'))) {
  fs.copyFileSync(path.join(pv, 'woff2-dynamic-subset', f), path.join(OUT, 'pretendard', f));
  n++;
}
/* CSS 가 가리키는 파일이 다 있는지. 하나라도 없으면 그 글자만 조용히
   다른 글꼴로 나와서 눈치채기 어렵다. */
for (const m of pCss.matchAll(/url\(\.\/pretendard\/([^)]+)\)/g)) {
  if (!fs.existsSync(path.join(OUT, 'pretendard', m[1]))) throw new Error(`빠진 조각: ${m[1]}`);
}
say(`  pretendard.css + 조각 ${n}개`);

/* ── 4. Press Start 2P ────────────────────────────────────────
   구글이 주는 CSS 는 @font-face 를 언어 조각별로 나눠 준다. 우리가 쓰는
   건 라틴뿐이라 그 두 덩이만 남기고 woff2 를 받아 경로를 바꿔 끼운다. */
const gf = sh('curl', ['-sS', '-A', GF_UA, GF_CSS]);
const blocks = gf.split(/(?=\/\* )/).filter((b) => b.trim());
const keep = [];
for (const b of blocks) {
  const name = b.match(/^\/\*\s*([\w-]+)\s*\*\//)?.[1];
  if (!GF_KEEP.includes(name)) continue;
  const url = b.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
  if (!url) throw new Error(`${name}: woff2 주소를 못 찾았다`);
  const file = `pressstart2p-${name}.woff2`;
  sh('curl', ['-sS', '-o', path.join(OUT, 'pressstart2p', file), url]);
  keep.push(b.replace(url, `./pressstart2p/${file}`).trimEnd());
}
if (keep.length !== GF_KEEP.length) throw new Error(`라틴 조각 ${GF_KEEP.length}개를 못 채웠다`);
fs.writeFileSync(path.join(OUT, 'pressstart2p.css'),
  '/* Press Start 2P — SIL Open Font License 1.1\n' +
  '   fonts.google.com/specimen/Press+Start+2P\n' +
  '   tools/vendor.mjs 가 만든다. 손으로 고치지 말 것. */\n' + keep.join('\n') + '\n');
say(`  pressstart2p.css + 조각 ${keep.length}개`);

/* ── 5. 받은 그대로인지 적어 두기 ─────────────────────────── */
fs.writeFileSync(path.join(OUT, 'VERSIONS.json'), JSON.stringify({
  만든날: new Date().toISOString().slice(0, 10),
  만든것: 'tools/vendor.mjs',
  버전: PIN,
  글꼴: { 'Press Start 2P': `google fonts, ${GF_KEEP.join(' + ')}` },
}, null, 2) + '\n');

fs.rmSync(stage, { recursive: true, force: true });

const total = (function size(d) {
  return fs.readdirSync(d, { withFileTypes: true }).reduce((s, e) =>
    s + (e.isDirectory() ? size(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
})(OUT);
say(`\nvendor/ 다시 만듦 — ${(total / 1024 / 1024).toFixed(1)}MB`);
