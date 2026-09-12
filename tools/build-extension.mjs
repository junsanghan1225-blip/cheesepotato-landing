/* 크롬 익스텐션이 쓸 자료를 사이트 자료에서 굽는다.
 *
 *   node tools/build-extension.mjs            굽는다
 *   node tools/build-extension.mjs --check    낡았으면 종료 코드 1
 *
 * ── 왜 베끼는가 ──────────────────────────────────────────────
 * 익스텐션은 GitHub Pages 가 내주는 것이 아니라 사용자 기기에 통째로
 * 설치된다. 그래서 `../glossary.js` 를 가리킬 수가 없고 제 디렉터리 안에
 * 자료를 가지고 있어야 한다.
 *
 * 그렇다고 손으로 베끼면 사이트의 사전을 고쳤을 때 익스텐션만 예전 뜻을
 * 내주는 일이 난다 — 그것도 **틀린 줄 모르는 채로.** 그래서 여기서 굽고,
 * `--check` 가 낡은 것을 잡는다. 사전을 고쳤으면 이 도구를 다시 돌린다.
 *
 * ── 왜 저장소에 안 넣는가 ────────────────────────────────────
 * 구운 것은 `.gitignore` 에 있다. 사이트의 다른 생성물(`sentence/`,
 * `sitemap.xml`)은 Pages 가 그대로 내주므로 저장소에 있어야 하지만, 이것은
 * 꾸릴 때만 쓰는 사본이라 넣으면 같은 2.6MB 가 저장소에 두 벌이 된다.
 * 두 벌이 되면 어느 쪽이 진짜인지 묻게 된다.
 *
 * ── 자료는 JSON, 코드는 모듈 ────────────────────────────────
 * 자료를 `export const X = {…}` 꼴로 구웠다가 도로 물렀다. **서비스 워커
 * 안에서는 동적 import() 가 금지되어 있다**(HTML 명세, w3c/ServiceWorker#1356).
 * 찾기를 서비스 워커가 맡고 있으므로, 필요할 때 받는 자료를 모듈로 두면
 * 「사전은 있는데 뜻이 안 나오는」 상태가 된다 — 실제로 그렇게 났다.
 *
 * JSON 으로 구우면 fetch 한 줄로 서비스 워커에서도 화면에서도 똑같이
 * 읽힌다. 파싱도 더 빠르고 eval 도 안 쓴다(MV3 가 막아 둔 것이다).
 *
 * 그래서 규칙은 하나다 — **자료는 .json, 코드는 .js.**
 *
 * ── 라이선스 ─────────────────────────────────────────────────
 * 뜻풀이 일부는 국립국어원 「한국어기초사전」에서 왔고 CC BY-SA 2.0 KR 이다.
 * 출처를 밝혀야 하고 같은 라이선스로 열어 두어야 한다. JSON 에는 주석을
 * 못 다니 data/README.md 를 함께 굽고, 설정 쪽에도 눈에 보이게 적어 둔다.
 * docs/glossary-license.md.
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'extension', 'data');
const CHECK = process.argv.includes('--check');

/* 그대로 베끼는 것. 이 셋은 import 가 없어서 자국(`?v=`)이 안 붙는다 —
   붙은 파일을 그냥 베끼면 익스텐션 안에서 없는 주소를 부르게 된다. */
const VERBATIM = ['gloss-find.js', 'grammar-find.js', 'grammar.js'];

/* 뜻풀이를 담은 말. glossary.js 의 GLOSS_LANGS 와 같은 목록이어야 한다. */
const LANGS = ['ja', 'zh', 'vi', 'ru', 'es', 'fr', 'ar', 'mn', 'id'];

const HEAD = `/* 이 파일은 tools/build-extension.mjs 가 구운 것이다. 손으로 고치지 말 것.
 * 고칠 곳은 저장소 뿌리의 원본이다.
 */`;

const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

/* 굽는 자리에 실제로 쓴 원본만 센다. 도구 자신도 센다 — 자르는 규칙을
   고치면 결과가 달라지는데 원본은 그대로이기 때문이다. */
async function sources() {
  const names = [
    ...VERBATIM, 'glossary.js', 'glossary-examples.js',
    'sentences.js', 'sentences-beginner.js', 'sentences-intermediate.js',
    ...LANGS.map((l) => `glossary-${l}.js`),
    'tools/build-extension.mjs',
  ];
  const out = {};
  for (const n of names) out[n] = sha(await readFile(join(ROOT, n), 'utf8'));
  return out;
}

/* 표현 카드 290장. 예문 게시판의 학생 글(SEED)은 안 담는다 — 카드 한 장에
   쓰는 것은 이름·뜻풀이·예문·형태·주의할 점·대화문뿐이다. */
async function cards() {
  const { SB_CATS } = await import(join(ROOT, 'sentences.js'));
  const out = [];
  for (const c of SB_CATS) {
    for (const p of c.points || []) {
      const m = p.more || [];
      out.push({
        id: p.id, cat: c.ko, catEn: c.en, lv: p.lv || 'intermediate',
        name: p.name, desc: p.desc, ex: p.ex,
        form: m[0] || '', with: m[1] || '', note: m[2] || '', ex2: m[3] || '',
        dlg: p.dlg || [],
      });
    }
  }
  return out;
}

const json = (p, v) => writeFile(join(OUT, p), JSON.stringify(v));

async function build() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, 'lang'), { recursive: true });

  /* 코드는 모듈 그대로. 화면과 서비스 워커가 위에서 static import 로 읽는다. */
  for (const n of VERBATIM.filter((n) => n.endsWith('-find.js'))) {
    await writeFile(join(OUT, n), `${HEAD}\n${await readFile(join(ROOT, n), 'utf8')}`);
  }

  /* 사전. GLOSS_LANGS 는 안 가져온다 — 그 안의 주소(`./glossary-ja.js?v=…`)는
     사이트 뿌리 기준이라 익스텐션 안에서는 아무 데도 안 닿는다. 익스텐션은
     data/lang/<말>.json 을 제 규칙으로 부른다. */
  const { GLOSSARY } = await import(join(ROOT, 'glossary.js'));
  await json('glossary.json', GLOSSARY);

  const { GRAMMAR } = await import(join(ROOT, 'grammar.js'));
  await json('grammar.json', GRAMMAR);

  const { EXAMPLES } = await import(join(ROOT, 'glossary-examples.js'));
  await json('examples.json', EXAMPLES);

  for (const l of LANGS) {
    const { G } = await import(join(ROOT, `glossary-${l}.js`));
    await json(`lang/${l}.json`, G);
  }

  const C = await cards();
  await json('cards.json', C);

  await writeFile(join(OUT, 'built.json'),
    `${JSON.stringify({ at: new Date().toISOString().slice(0, 10), src: await sources() }, null, 1)}\n`);

  await writeFile(join(OUT, 'README.md'), readme(LANGS));

  const heads = new Set(Object.values(GLOSSARY).map((v) => v.head));
  console.log(`extension/data/ — 찾을 수 있는 꼴 ${Object.keys(GLOSSARY).length}개(표제어 ${heads.size}) ·`
    + ` 문법 ${GRAMMAR.length}개 · 예문 ${Object.keys(EXAMPLES).length}개 ·`
    + ` 표현 카드 ${C.length}장 · 뜻풀이 ${LANGS.length}개 말`);
}

/* JSON 에는 주석을 못 단다. 라이선스 고지를 둘 데가 없으므로 옆에 쪽을
   하나 굽는다 — 자료만 떠서 돌아다닐 때 출처가 따라가게 하려는 것이다. */
const readme = (langs) => `<!-- tools/build-extension.mjs 가 구운 것이다. 손으로 고치지 말 것. -->
# extension/data — 구운 자료

저장소 뿌리의 사이트 자료에서 \`node tools/build-extension.mjs\` 가 굽는다.
**손으로 고치지 말 것** — 고칠 곳은 뿌리의 원본이다.

| 파일 | 원본 |
|---|---|
| \`glossary.json\` | \`glossary.js\` (뜻풀이, 영어) |
| \`lang/{${langs.join(',')}}.json\` | \`glossary-<말>.js\` |
| \`examples.json\` | \`glossary-examples.js\` |
| \`grammar.json\` | \`grammar.js\` |
| \`cards.json\` | \`sentences*.js\` 의 표현 290개 |
| \`gloss-find.js\` · \`grammar-find.js\` | 같은 이름의 원본 (그대로) |

자료는 \`.json\`, 코드는 \`.js\` 다. 서비스 워커 안에서는 동적 \`import()\` 가
금지되어 있어서(HTML 명세) 필요할 때 받는 자료는 모듈로 둘 수 없다.

## 라이선스

낱말 뜻풀이 일부(\`glossary.json\` 과 \`lang/\` 전부)는 국립국어원
「한국어기초사전」 https://krdict.korean.go.kr 에서 왔다.

**CC BY-SA 2.0 KR** — https://creativecommons.org/licenses/by-sa/2.0/kr/
출처를 밝혀야 하고, 거기서 나온 자료는 같은 라이선스로 열어 두어야 한다.
자세한 것은 저장소의 \`docs/glossary-license.md\`.

\`cards.json\` 과 \`examples.json\`, \`grammar.json\` 은 치즈감자가 만든 것이다.
`;

async function check() {
  let built;
  try { built = JSON.parse(await readFile(join(OUT, 'built.json'), 'utf8')); }
  catch { console.error('extension/data/ 가 아직 없다 — node tools/build-extension.mjs'); process.exit(1); }
  const now = await sources();
  const stale = Object.keys(now).filter((n) => now[n] !== built.src?.[n]);
  if (stale.length) {
    console.error(`extension/data/ 가 낡았다 — ${stale.join(' · ')} 가 그 뒤로 바뀌었다.`);
    console.error('node tools/build-extension.mjs');
    process.exit(1);
  }
  console.log(`extension/data/ 는 최신이다 (${built.at}).`);
}

await (CHECK ? check() : build());
