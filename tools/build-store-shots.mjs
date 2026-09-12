/* 웹 스토어에 올릴 스크린샷을 찍는다 — 생성물, 손으로 고치지 말 것.
 *
 *   npm i -D playwright        (한 번만. 저장소에는 안 넣는다)
 *   node tools/build-store-shots.mjs
 *
 * ── 왜 손으로 안 찍나 ────────────────────────────────────────
 * 웹 스토어는 1280×800 을 요구하고, 다섯 장이 서로 크기·여백·글자가
 * 맞아야 한 벌로 보인다. 손으로 찍어 손으로 자르면 그게 안 맞고, 화면을
 * 고칠 때마다 다시 다섯 장을 맞춰야 한다.
 *
 * 여기서는 **진짜 익스텐션을 크롬에 올려** 찍는다. 그림을 따로 그리지
 * 않는다 — 그리면 화면이 바뀌어도 그림은 안 바뀌고, 스토어의 그림과
 * 받아서 켠 화면이 다른 물건이 된다.
 *
 * ── 찍은 것은 저장소에 안 넣는다 ────────────────────────────
 * extension/data/ 와 같은 까닭이다. 이 도구로 언제든 다시 나오고,
 * PNG 다섯 장이 판마다 쌓이면 저장소가 그림 창고가 된다.
 */
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXT = join(ROOT, 'extension');
const OUT = join(EXT, 'store', 'shots');

let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  console.error('playwright 가 없다. `npm i -D playwright` 를 한 번 돌리고 다시 할 것.');
  process.exit(1);
}

/* 웹 스토어가 받는 크기. 1280×800 이 큰 쪽이고, 작은 쪽(640×400)은
   요즘 목록에서 흐릿하게 나온다. */
const W = 1280, H = 800;

/* 읽다가 막히는 자리를 보여 줄 글. 어느 신문·블로그를 흉내 내지 않는다 —
   스토어 그림에 남의 상표가 들어가면 심사에서 걸리고, 무엇보다 그건
   우리가 만든 화면이 아니다. */
const ARTICLE = `<!doctype html><meta charset="utf-8"><title>읽기</title>
<style>
 /* 글을 넓게 잡는다. 좁으면 가로로 긴 조각을 잘라 냈을 때 오른쪽이
    허옇게 비고, 그림이 «덜 만든 것»처럼 보인다. */
 body{font:400 19px/2.0 -apple-system,'Segoe UI','Malgun Gothic','Noto Sans KR',sans-serif;
      margin:0;padding:38px 52px;color:#1f1b18;background:#fff;max-width:1150px;word-break:keep-all}
 h1{font-size:30px;line-height:1.4;margin:0 0 7px;letter-spacing:-.01em}
 .by{color:#8b8175;font-size:14px;margin-bottom:26px}
 p{margin:0 0 18px}
</style>
<body>
<h1>주말 장마에 동네 시장이 조용했다</h1>
<div class="by">2026년 9월 12일</div>
<p id="a">비가 오는 바람에 주말 약속이 다 없어졌어요. 아침부터 창밖만 보고 있었습니다.</p>
<p id="b">밥을 먹으려고 시장에 갔는데 문을 닫았더라고요. 사람들이 거의 없었습니다.</p>
<p id="c">우산을 가지고 나왔지만 바지가 다 젖었어요. 버스도 한참을 기다려야 했습니다.</p>
<p id="d">다음 주에는 날씨가 좋았으면 좋겠습니다. 그때 다시 시장에 가 보려고 합니다.</p>
</body>`;

/* 다섯 장. 말은 화면 말(ko·en)을 따라간다. */
const SHOTS = (t) => [
  { id: '1-select', w: 1000,
    head: t('끌면 뜻이 뜬다', 'Select it, see it'),
    sub: t('아무 쪽에서나 한국어를 끌면 뜻·품사·예문이 그 자리에 뜹니다. 「먹었습니다」를 끌어도 「먹다」로 찾습니다.',
           'Select Korean anywhere and the meaning, part of speech and an example appear right there. Select 먹었습니다 and it finds 먹다.') },
  { id: '2-grammar', w: 1120,
    head: t('문장 속 문법까지', 'The grammar too'),
    sub: t('Alt+G 로 그 쪽의 아는 문법 197개에 밑줄. 누르면 무슨 문법인지 나옵니다.',
           'Alt+G underlines all 197 known grammar patterns on the page. Click one to see what it is.') },
  { id: '3-newtab', w: 900,
    head: t('새 탭마다 표현 한 장', 'A card in every new tab'),
    sub: t('문법 표현 290개를 하루에 하나씩. 그날 안에는 같은 카드가 떠서, 세 번째 열 때쯤에는 읽게 됩니다.',
           'One of 290 grammar points a day. It stays the same all day, so by the third tab you actually read it.') },
  { id: '4-review', w: 418,
    head: t('담고, 때가 되면 다시', 'Save it, meet it again'),
    sub: t('읽다가 담은 낱말이 1·3·7·16·35·90일 간격으로 돌아옵니다. 뜻을 떠올려 본 다음에 맞춰 봅니다.',
           'Words you save come back after 1, 3, 7, 16, 35 and 90 days. Recall first, then check.') },
  { id: '5-offline', w: 940,
    head: t('인터넷 없이, 회원가입 없이', 'No internet, no sign-up'),
    sub: t('사전 4,209 표제어와 문법이 익스텐션 안에 들어 있습니다. 뜻풀이는 11개 말 가운데 고릅니다.',
           'All 4,209 dictionary entries and the grammar live inside the extension. Meanings in 11 languages.') },
];

/* 찍은 것을 1280×800 틀에 앉힌다. 사이트와 같은 바탕색이라 스토어
   목록에서 다섯 장이 한 벌로 보인다. */
const frame = (head, sub, png, w, lang) => `<!doctype html><html lang="${lang}"><meta charset="utf-8">
<style>
 *{margin:0;padding:0;box-sizing:border-box}
 body{width:${W}px;height:${H}px;overflow:hidden;background:#F2EEE4;
      font-family:-apple-system,'Segoe UI','Malgun Gothic','Noto Sans KR',sans-serif;
      display:flex;flex-direction:column;align-items:center;
      padding:44px 60px;color:#1B1512;word-break:keep-all}
 h1{font-size:37px;font-weight:800;letter-spacing:-.02em;line-height:1.24;text-align:center}
 p{margin-top:11px;font-size:16.5px;line-height:1.55;color:#4E3E31;
   text-align:center;max-width:800px}
 /* 아래쪽은 틀 밖으로 조금 흘러도 된다 — 일부러 그렇게 두면 «더 있다»로
    읽힌다. 다만 **말풍선이 잘리면 안 된다.** 그건 고장으로 보인다.
    그래서 찍을 때 잘라 낼 자리를 화면마다 따로 정해 둔다(CROP). */
 /* 남은 자리 가운데에 놓는다. 위에 붙여 두었더니 아래가 허옇게 남아
    그림마다 빈 자리 크기가 달랐다 — 다섯 장이 한 벌로 안 보인다. */
 .shot{margin:auto 0;width:${w}px;border-radius:15px;overflow:hidden;
       box-shadow:0 18px 50px rgba(27,21,18,.20),0 0 0 1px rgba(27,21,18,.07);
       background:#fff}
 .shot img{display:block;width:100%}
</style>
<body>
<h1>${head}</h1>
<p>${sub}</p>
<div class="shot"><img src="data:image/png;base64,${png}"></div>
</body></html>`;

/* 화면마다 잘라 낼 자리. 1280×800 틀에 머리글을 얹고 나면 그림에 남는
   높이가 560 안팎이라, **가로로 긴 조각**이라야 안 잘린다. 창을 그냥
   통째로 찍으면 세로가 길어 말풍선 아래가 잘려 나간다 — 한 번 그랬다. */
const CROP = {
  /* 같은 쪽인데 둘로 나눈다. ①은 말풍선에 뜻·예문·문법이 다 들어 커서
     세로가 길어야 하고, ②는 문법 한 조각뿐이라 짧다. 한 크기로 맞추면
     한쪽은 말풍선이 잘리고 다른 쪽은 아래가 허옇게 남는다. */
  read1:   { x: 14, y: 14, width: 1190, height: 664 },
  read2:   { x: 14, y: 14, width: 1190, height: 500 },
  newtab:  { x: 24, y: 24, width: 1072, height: 612 },
  options: { x: 20, y: 20, width: 1000, height: 560 },
  /* 팝업은 380×540 으로 고정이지만 복습 한 장은 그만큼 안 찬다.
     남는 아래를 그대로 찍으면 허연 띠가 그림의 3할이 된다. */
  popup:   { x: 0, y: 0, width: 380, height: 476 },
};

const b64 = (buf) => Buffer.from(buf).toString('base64');

async function run(lang) {
  const t = (ko, en) => (lang === 'ko' ? ko : en);
  const dir = join(OUT, lang);
  await mkdir(dir, { recursive: true });

  const tmp = mkdtempSync(join(tmpdir(), 'cp-shot-'));
  const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'cp-prof-')), {
    executablePath: process.env.CHROME_PATH || undefined,
    headless: false,
    args: ['--headless=new', `--disable-extensions-except=${EXT}`,
           `--load-extension=${EXT}`, '--no-sandbox', '--force-color-profile=srgb'],
    deviceScaleFactor: 2,            /* 2배로 찍어야 줄여 앉혔을 때 안 흐리다 */
    /* 창을 넉넉히 잡는다. 말풍선은 max-height:60vh 라 낮은 창에서는
       제 안에 스크롤바가 생기는데, 그건 좁은 창에서 맞는 행동이지
       스토어 그림에 들어갈 모습은 아니다. */
    viewport: { width: 1280, height: 900 },
  });
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  const id = new URL(sw.url()).host;

  /* 설정과 단어장을 미리 채운다. 빈 화면을 찍으면 스토어에서 「받아 봤더니
     아무것도 없더라」가 된다 — 그건 그림이 거짓말을 한 것이다. */
  const seed = await ctx.newPage();
  await seed.goto(`chrome-extension://${id}/options/options.html`);
  await seed.waitForSelector('#form .card');
  await seed.evaluate(([ui, day]) => chrome.storage.local.set({
    settings: { ui, gloss: 'en', select: 'on', grammar: true, underline: false,
                speak: 'device', newtab: 'grammar', lv: ['beginner', 'intermediate', 'advanced'] },
    wordbook: {
      약속: { head: '약속', pos: '명사', gloss: 'appointment; promise', lang: 'en',
             ex: '내일 오후 두 시에 친구와 만나기로 약속을 잡았어요.',
             exEn: 'I made an appointment to meet a friend at two tomorrow afternoon.',
             note: '', box: 2, due: day - 3600e3, seen: 4, ok: 3, at: day - 9 * 864e5, from: 'news' },
      시장: { head: '시장', pos: '명사', gloss: 'market', lang: 'en',
             ex: '주말 아침 시장에는 사람이 아주 많아요.', exEn: 'The market is very crowded on weekend mornings.',
             note: '', box: 0, due: day - 7200e3, seen: 1, ok: 0, at: day - 2 * 864e5, from: 'news' },
      우산: { head: '우산', pos: '명사', gloss: 'umbrella', lang: 'en',
             ex: '비가 오니까 우산을 꼭 가지고 가세요.', exEn: 'It is raining, so be sure to take an umbrella.',
             note: '', box: 1, due: day - 1800e3, seen: 2, ok: 1, at: day - 5 * 864e5, from: 'blog' },
    },
  }), [lang, Date.now()]);
  await seed.close();

  const shots = {};

  /* ① 선택 사전 — 읽던 쪽에서 낱말을 끈다.

     setContent() 로는 안 된다. 그건 about:blank 에 글만 갈아 끼우는
     것이고, content script 는 about:blank 에 안 붙는다 — 말풍선이 영영
     안 뜨는데 화면에는 멀쩡한 글이 보여서 알아보기 어려웠다.
     진짜 주소가 있어야 하므로 파일로 써서 연다. */
  const page = join(tmp, 'read.html');
  await writeFile(page, ARTICLE);
  const pg = await ctx.newPage();
  await pg.goto('file://' + page);
  await pg.waitForTimeout(1500);

  /* 글의 마지막 줄을 끈다. 아래에 자리가 없으면 말풍선이 위로 뒤집혀
     글 위에 통째로 얹히므로, 가로로 긴 자리에 다 담긴다. */
  await pg.evaluate(() => {
    /* 첫 문단의 「약속이」. 낱말 뜻과 그 문장의 문법(-는 바람에)이
       한 말풍선에 같이 뜨는 자리라, 하는 일을 한 장으로 보여 준다. */
    const n = document.getElementById('a').firstChild;
    const i = n.nodeValue.indexOf('약속이');
    const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 3);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });
  await pg.waitForTimeout(1800);
  shots['1-select'] = await pg.screenshot({ clip: CROP.read1 });

  /* ② 문법 밑줄 — Alt+G 가 하는 것 */
  await pg.evaluate(() => getSelection().removeAllRanges());
  await pg.mouse.click(870, 600);
  await pg.waitForTimeout(300);
  await pg.bringToFront();
  await sw.evaluate(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { k: 'toggle-underline' });
  });
  await pg.waitForTimeout(900);
  await pg.evaluate(() => {
    /* 밑줄 하나를 눌러 말풍선까지 함께 보인다 — 밑줄만 있으면 무엇을
       할 수 있는지가 안 보인다. */
    const n = document.getElementById('b').firstChild;
    const i = n.nodeValue.indexOf('더라고요') + 2;
    const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i);
    const box = r.getBoundingClientRect();
    document.elementFromPoint(box.left, box.top)?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: box.left, clientY: box.top }));
  });
  await pg.waitForTimeout(900);
  shots['2-grammar'] = await pg.screenshot({ clip: CROP.read2 });

  /* ③ 새 탭 카드 */
  const nt = await ctx.newPage();
  await nt.setViewportSize({ width: 1120, height: 760 });
  await nt.goto(`chrome-extension://${id}/newtab/newtab.html`);
  await nt.waitForSelector('.card .name');

  /* 카드는 날짜로 정해지므로 찍는 날마다 다른 것이 나온다. 표현 290개
     가운데 85개는 형태·주의할 점이 없어서(사이트 자료가 그렇다) 카드가
     반쪽으로 보인다 — 그런 날 찍으면 스토어 그림이 그날의 운에 걸린다.
     그래서 「다른 카드」를 눌러 **다 갖춘 카드가 나올 때까지** 고른다.
     화면이 실제로 하는 일만 쓴다 — 그림을 위해 따로 만든 길이 아니다. */
  const full = () => nt.evaluate(() =>
    document.querySelectorAll('.card .kv dd').length >= 2
    && document.querySelectorAll('.card details').length >= 2);
  for (let i = 0; i < 40 && !(await full()); i++) {
    await nt.locator('.acts .btn.ghost.grow').click();
    await nt.waitForTimeout(120);
  }
  /* 접힌 것 하나를 펴 둔다 — 다 닫힌 채로 찍으면 카드가 얇아 보인다 */
  await nt.evaluate(() => document.querySelector('details')?.setAttribute('open', ''));
  await nt.waitForTimeout(500);
  shots['3-newtab'] = await nt.screenshot({ clip: CROP.newtab });

  /* ④ 복습 — 뜻을 펼친 자리 */
  const pop = await ctx.newPage();
  await pop.setViewportSize({ width: 380, height: 540 });
  await pop.goto(`chrome-extension://${id}/popup/popup.html`);
  await pop.waitForSelector('.rv-word');
  await pop.locator('.rv-acts .btn').first().click();
  await pop.waitForTimeout(400);
  shots['4-review'] = await pop.screenshot({ clip: CROP.popup });

  /* ⑤ 설정 — 뜻풀이 말과 「바깥으로 안 보낸다」가 보이는 자리 */
  const op = await ctx.newPage();
  await op.setViewportSize({ width: 1040, height: 700 });
  await op.goto(`chrome-extension://${id}/options/options.html`);
  await op.waitForSelector('#form .card');
  await op.evaluate(() => document.querySelector('select')?.focus());
  shots['5-offline'] = await op.screenshot({ clip: CROP.options });

  /* ── 틀에 앉히기 ─────────────────────────────────────────── */
  const stage = await ctx.newPage();
  await stage.setViewportSize({ width: W, height: H });
  for (const s of SHOTS(t)) {
    await stage.setContent(frame(s.head, s.sub, b64(shots[s.id]), s.w, lang));
    await stage.waitForTimeout(320);
    /* 스토어는 알파가 없는 PNG 를 받는다 — 틀에 바탕색을 깔아 두어서
       여기서 통째로 찍으면 투명한 자리가 없다. */
    await writeFile(join(dir, `${s.id}.png`),
      await stage.screenshot({ clip: { x: 0, y: 0, width: W, height: H } }));
    console.log(`  ${lang}/${s.id}.png`);
  }
  await ctx.close();
}

await rm(OUT, { recursive: true, force: true });
for (const lang of ['ko', 'en']) {
  console.log(`${lang} —`);
  await run(lang);
}
console.log(`\n${W}×${H} 열 장. extension/store/shots/ 에 있다.`);
