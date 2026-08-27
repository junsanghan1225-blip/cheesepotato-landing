/* 코드가 부르는 자리가 화면에 실제로 있는지 — node tools/check-dom.mjs
 *
 * getElementById 가 없는 id 를 받으면 null 을 주고, 바로 다음 줄의
 * addEventListener 에서 멈춘다. **그러면 그 파일의 남은 부분이 통째로
 * 안 붙는다.** 첫 화면 한 구역을 지웠는데 발음 레벨 테스트와 언어 전환이
 * 같이 죽는 식이다 — 지운 자리와 죽은 자리가 멀어서 원인을 찾기 어렵다.
 *
 * 화면을 고칠 때마다 브라우저를 띄워 눌러 보지 않아도 여기서 잡힌다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* fileURLToPath 를 꼭 써야 한다 — new URL(...).pathname 은 윈도우에서
   「/C:/Users/…」처럼 드라이브 앞에 슬래시가 하나 더 붙는다. 그걸 그대로
   path.resolve 에 넣으면 현재 드라이브가 또 앞에 붙어 「C:\C:\Users\…」가
   되어 모든 경로가 깨진다. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

/* 자리는 두 군데서 생긴다 — index.html 에 적혀 있거나, 코드가 innerHTML
   로 지어 넣거나. 뒤엣것을 모르면 「없는 자리를 부른다」고 잘못 짚는다.
   코드 안의 id="…" 를 같이 긁어 오는 것으로 그 둘을 다 센다. */
const SRC = Object.fromEntries(['app.js', 'app.module.js']
  .map((f) => [f, fs.readFileSync(path.join(ROOT, f), 'utf8')]));
const MADE = new Set(Object.values(SRC).flatMap((s) => [
  /* 글로 지어 넣는 것 : `<button id="tqNext">` */
  ...[...s.matchAll(/\bid=\\?["']([A-Za-z][\w-]*)\\?["']/g)].map((m) => m[1]),
  /* 만들어 놓고 붙이는 것 : `save.id = 'tqUnkSave'` */
  ...[...s.matchAll(/\.id\s*=\s*["']([A-Za-z][\w-]*)["']/g)].map((m) => m[1]),
]));

const bad = [];
let checked = 0;

for (const [f, src] of Object.entries(SRC)) {
  const lines = src.split('\n');

  lines.forEach((line, i) => {
    /* $('x') · getElementById('x') · ptId('x') — 이 판이 자리를 찾는 세 가지 길 */
    for (const re of [/\bgetElementById\(\s*'([^']+)'/g, /\bptId\(\s*'([^']+)'/g, /(?<![\w.])\$\(\s*'([^']+)'/g]) {
      for (const m of line.matchAll(re)) {
        const id = m[1];
        checked++;
        if (ids.has(id) || MADE.has(id)) continue;
        bad.push(`${f}:${i + 1}  「${id}」를 부르는데 index.html 에 그 id 가 없다`);
      }
    }
  });
}

/* 반대쪽도 본다 — data-* 로 걸어 둔 것을 코드가 안 읽으면 눌러도 아무
   일이 안 난다. 이건 죽지는 않아서 더 오래 남는다. */
const goKeys = [...html.matchAll(/data-go="([^"]+)"/g)].map((m) => m[1]);
const appjs = SRC['app.js'];
for (const k of new Set(goKeys)) {
  if (!new RegExp(`\\b${k}\\s*:`).test(appjs))
    bad.push(`index.html 의 data-go="${k}" 를 app.js 의 WAY_GO 가 안 받는다 — 눌러도 아무 일이 안 난다`);
}

console.log(`자리 — 화면 ${ids.size}개 · 코드가 지음 ${MADE.size}개`);
console.log(`코드가 부르는 곳 ${checked}곳 · data-go ${new Set(goKeys).size}개`);
if (bad.length) {
  console.log(`\n고쳐야 할 것 ${bad.length}개`);
  bad.forEach((b) => console.log('  ✗ ' + b));
  process.exit(1);
}
console.log('전부 있다');
