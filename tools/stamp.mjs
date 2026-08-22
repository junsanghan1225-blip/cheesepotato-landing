/* 배포해도 예전 코드가 도는 것을 막는다.
 *
 *   node tools/stamp.mjs           자국을 새로 찍는다
 *   node tools/stamp.mjs --check   찍힌 자국이 지금 내용과 맞는지만 본다
 *
 * GitHub Pages 는 우리가 캐시 머리글을 못 정한다. 그래서 app.js 를 그냥
 * 부르면 배포한 뒤에도 브라우저가 한동안 예전 파일을 쓴다. 실제로 겪었다 —
 * 고쳐서 올렸는데 「그대로인데?」 하는 일이 났다.
 *
 * 주소 뒤에 ?v=… 를 붙이면 내용이 바뀔 때마다 주소가 바뀌므로 브라우저가
 * 새로 받는다. 안 바뀌면 주소도 그대로라 캐시를 그대로 쓴다.
 *
 * **모듈이 부르는 파일까지 같이 찍는다.** app.module.js 만 찍으면 그 안의
 * import './sentences.js' 는 예전 주소 그대로라, 새 코드가 예전 자료를 읽는
 * 어정쩡한 상태가 된다. 그게 더 나쁘다 — 코드는 새것이라 오류도 안 난다.
 *
 * 자국은 **내용에서 뽑는다.** 날짜나 회차로 찍으면 안 바뀐 파일까지 새로
 * 받게 되고, 손으로 올리는 값이면 잊어버린다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* 자국을 찍을 파일. 브라우저가 주소로 받아 가는 것만 넣는다. */
const ASSETS = [
  'app.js', 'app.module.js', 'analytics.js',
  'courses.js', 'courses-grammar.js', 'courses-grammar-beginner.js',
  'glossary.js', 'gloss-find.js',
  'grammar.js', 'grammar-en.js', 'grammar-find.js',
  /* 언어팩. 화면이 필요할 때만 부르지만, 부를 때 자국이 없으면 예전 것을
     쥔 채로 새 뜻풀이를 못 받는다. */
  'glossary-ja.js', 'glossary-zh.js', 'glossary-vi.js', 'glossary-ru.js',
  'glossary-es.js', 'glossary-fr.js', 'glossary-ar.js', 'glossary-mn.js',
  'glossary-id.js',
  'courses-grammar-detailed.js', 'numbers.js', 'reading.js',
  'courses-beginner-stage1.js',
  'sentences.js', 'sentences-beginner.js', 'sentences-intermediate.js',
  /* topik.js 는 TOPIK I 읽기, topik-writing.js 는 TOPIK II 쓰기다.
     이름이 비슷해 한쪽만 넣기 쉬운데, 빠진 쪽은 자국이 안 바뀌어
     고쳐 올려도 예전 문항이 그대로 나온다. */
  'topik.js', 'topik2.js', 'topik-writing.js',
  'vendor/pretendard.css', 'vendor/pressstart2p.css',
  /* 들여온 남의 라이브러리도 넣는다. 자주 안 바뀌지만, 바뀌었을 때 예전
     것이 남아 있으면 원인을 찾기가 제일 어렵다. */
  'vendor/supabase-js.js', 'vendor/xlsx.js',
];
/* 자국이 박히는 파일. index.html 의 script·link 와, 모듈끼리 부르는 import. */
/* glossary.js 도 자국을 박는 자리다 — 그 안의 GLOSS_LANGS 가 언어팩 주소를
   들고 있다. 생성물이라 build-glossary 를 돌린 뒤에 stamp 를 돌려야 한다. */
const HOSTS = ['index.html', 'app.module.js', 'courses.js', 'sentences.js', 'glossary.js',
               'grammar-find.js'];

const V = /\?v=[0-9a-f]{8}/g;
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const bare = (s) => s.replace(V, '');   // 자국을 뗀 알맹이

/* 알맹이만 모아 해시를 낸다. 자국을 뗀 뒤에 재므로 몇 번을 돌려도 같은 값이
   나온다 — 안 그러면 찍을 때마다 값이 바뀌어 영영 안 끝난다. */
const hash = createHash('sha256');
for (const f of ASSETS) { hash.update(f); hash.update(bare(read(f))); }
const stamp = hash.digest('hex').slice(0, 8);

/* 자국을 다시 찍는다. 이미 있던 것은 떼고 새로 붙인다. */
function restamp(text) {
  let out = bare(text);
  for (const f of ASSETS) {
    // index.html 의 src="app.js" · href="vendor/…css"
    out = out.replaceAll(`"${f}"`, `"${f}?v=${stamp}"`);
    // 모듈끼리 부르는 import … from './topik.js'
    out = out.replaceAll(`'./${f}'`, `'./${f}?v=${stamp}'`);
  }
  return out;
}

const check = process.argv.includes('--check');
let stale = [];
for (const f of HOSTS) {
  const now = read(f);
  const next = restamp(now);
  if (now === next) continue;
  if (check) stale.push(f);
  else writeFileSync(join(ROOT, f), next);
}

if (check) {
  if (stale.length) {
    console.error(`자국이 낡았다 (v=${stamp} 이어야 한다): ${stale.join(', ')}`);
    console.error('node tools/stamp.mjs 를 돌리고 함께 커밋할 것.');
    process.exit(1);
  }
  console.log(`자국 v=${stamp} — 맞다.`);
} else {
  console.log(`자국 v=${stamp} 을 ${HOSTS.length}개 파일에 찍었다.`);
}
