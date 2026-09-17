/* en/index.html 을 굽는다 — 생성물, 손으로 고치지 말 것.
 *
 *   node tools/build-en-home.mjs
 *
 * 왜 필요한가. 첫 쪽은 지금까지 주소 하나(/)에서 langBtn 하나로 화면만
 * 바꿔치기했다(app.js 의 applyLang). 구글은 주소 하나에 말 하나를
 * 기대하므로, 영어로 찾아온 사람에게 이 쪽이 색인될 일이 드물었다 —
 * blog/ 를 언어별 주소로 가른 것(커밋 4055be33)과 같은 이유다.
 *
 * 블로그와 다른 점: 글마다 새로 써야 했던 블로그와 달리 첫 쪽은 **이미
 * data-en 이 300곳 넘게 달려 있다.** 그래서 새로 번역하지 않고, 화면이
 * 이미 하는 일(langBtn 을 누르면 data-en 으로 바꿔치기하는 것)을 build
 * time 에 그대로 해서 정적 쪽 하나를 뽑는다.
 *
 * data-en 이 없는 자리는 원문(한국어)이 그대로 남는다 — 이건 여기서
 * 새로 생기는 문제가 아니라, 화면의 영어 모드도 이미 그렇게 동작한다
 * (app.js applyLang 주석 참고).
 *
 * ※ FAQPage 의 JSON-LD 는 번역해서 박아 넣지 않는다. data-en 스왑을 마친
 *   뒤의 화면(<details>)에서 다시 뽑아 만든다 — 그래야 이 쪽의 FAQ 글이
 *   달라져도(예: data-en 문구를 고치면) JSON-LD 가 저절로 따라온다.
 *   나머지 JSON-LD(Organization·WebSite·…)는 번역문을 손으로 썼다 —
 *   본문 어디에도 영어 대응이 없는 독립된 문구라서 가져올 데가 없다.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://everykoreans.com';
const load = (f) => import(pathToFileURL(join(ROOT, f)).href);

/* ── 자료에 실제로 있는 수 (check-geo.mjs 와 같은 방식) ─────────── */
const [c, s1, tk, tk2, tw, tl, rd, gl, gr] = await Promise.all(
  ['courses.js', 'sentences.js',
   'topik.js', 'topik2.js', 'topik-writing.js', 'topik-listening.js', 'reading.js',
   'glossary.js', 'grammar.js'].map(load));

const lessons = c.COURSES.reduce((a, x) => a + (x.lessons?.length || 0), 0);
let points = 0;
{
  const arr = Object.values(s1).find((v) => Array.isArray(v) && v[0]?.points);
  if (arr) points = arr.reduce((a, x) => a + (x.points?.length || 0), 0);
}
let passages = 0;
for (const a of Object.values(rd.READING)) for (const b of Object.values(a)) passages += b.length;
const topikQ = tk.TOPIK_READING.length + tk2.TOPIK2_READING.length
             + tl.TOPIKL_ITEMS.length + tl.TOPIKL2_ITEMS.length + tw.TW_ITEMS.length;
const words = Object.keys(gl.GLOSSARY).length;
const grammarN = Object.keys(gr.GRAMMAR).length;
const comma = (n) => n.toLocaleString('en-US');

/* ── HTML 개체 참조 풀기 ───────────────────────────────────────
   data-en="…&lt;br&gt;…" 처럼 이스케이프해 둔 자리와
   data-en="…<br>…" 처럼 그대로 적어 둔 자리가 둘 다 있다(둘 다 이
   저장소에서 실제로 쓰인다). innerHTML 로 넣을 값이므로 브라우저가
   속성을 읽을 때 하는 일(개체 풀기)을 여기서 미리 해 둔다. */
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    const v = NAMED[e.toLowerCase()];
    return v === undefined ? m : v;
  });
}

/* ── data-en 태그 하나의 짝이 되는 닫는 태그를 찾는다 ────────────
   div 안에 div 가 또 있을 수 있어서(중첩) 첫 </div> 를 곧이곧대로
   믿으면 안 된다 — 깊이를 세어 진짜 짝을 찾는다. */
function findMatchingClose(html, tag, fromIdx) {
  const openRe = new RegExp(`<${tag}(?=[\\s>/])`, 'gi');
  const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 1;
  let pos = fromIdx;
  while (depth > 0) {
    openRe.lastIndex = pos;
    closeRe.lastIndex = pos;
    const om = openRe.exec(html);
    const cm = closeRe.exec(html);
    if (!cm) throw new Error(`</${tag}> 짝을 못 찾았다 (자리 ${fromIdx} 부근)`);
    if (om && om.index < cm.index) {
      depth++;
      pos = om.index + om[0].length;
    } else {
      depth--;
      pos = cm.index + cm[0].length;
      if (depth === 0) return { start: cm.index, end: pos };
    }
  }
}

/* data-en 이 붙은 요소는 내용을 통째로 data-en 값으로 바꿔치기한다.
   data-ko 만 붙은 요소(히어로·한 문단 정의·통계 바)는 원문이 이미
   영어라 건드리지 않는다 — app.js 의 applyLang 과 같은 규칙. */
function applyEnglish(html) {
  const attrRe = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?\sdata-en="([^"]*)"[^>]*>/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = attrRe.exec(html))) {
    if (m.index < last) continue;         // 이미 바꿔치기한 자리 안쪽이면 건너뛴다
    const tag = m[1];
    const enRaw = m[2];
    const openEnd = attrRe.lastIndex;
    const { start: closeStart, end: closeEnd } = findMatchingClose(html, tag, openEnd);
    out += html.slice(last, openEnd);
    out += decodeEntities(enRaw);
    last = closeStart;
    attrRe.lastIndex = closeEnd;           // 안쪽에 중첩된 data-en 은 다시 안 본다(이미 버려짐)
  }
  out += html.slice(last);
  return out;
}

/* aria-label 은 innerHTML 이 아니라 속성이라 위 함수가 못 건드린다
   (app.js 의 data-en-aria 처리와 같은 이유). */
function applyEnglishAria(html) {
  return html.replace(
    /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)\sdata-en-aria="([^"]*)"([^>]*)>/g,
    (full, tag, pre, enAria, post) => {
      const val = decodeEntities(enAria).replace(/"/g, '&quot;');
      let rest = pre + post;
      let hit = false;
      rest = rest.replace(/\saria-label="[^"]*"/, () => { hit = true; return ` aria-label="${val}"`; });
      if (!hit) rest += ` aria-label="${val}"`;
      return `<${tag}${rest}>`;
    });
}

const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/* ── 시작 ────────────────────────────────────────────────────── */
let html = readFileSync(join(ROOT, 'index.html'), 'utf8');

html = applyEnglishAria(html);
html = applyEnglish(html);

html = html.replace('<html lang="ko">', '<html lang="en">');
html = html.replace(
  '<link rel="canonical" href="https://everykoreans.com/">',
  '<link rel="canonical" href="https://everykoreans.com/en/">');

/* 제목·설명·og·twitter — 본문과 달리 대응하는 data-en 이 없다(메타
   칸은 애초에 하나만 나갈 수 있어서 한국어로만 적혀 있었다). 실제 수를
   넣어 새로 쓴다. */
const title = 'Cheesepotato — Free Korean Learning & TOPIK Practice';
const desc = `Free Korean learning — Hangul to TOPIK 6. ${c.COURSES.length} courses, ${lessons} lessons, `
  + `${points} grammar points, ${topikQ} TOPIK questions, ${passages} passages, ${comma(words)} words. `
  + `No install, no sign-up.`;
if (desc.length > 180) throw new Error(`en meta description 이 ${desc.length}자다 — 180자 밑으로 줄일 것`);

html = html.replace(
  /<title>[\s\S]*?<\/title>/,
  `<title>${esc(title)}</title>`);
html = html.replace(
  /<meta name="description" content="[\s\S]*?">/,
  `<meta name="description" content="${esc(desc)}">`);
html = html.replace(/<meta property="og:url" content="[^"]*">/,
  `<meta property="og:url" content="${SITE}/en/">`);
html = html.replace(/<meta property="og:title" content="[^"]*">/,
  `<meta property="og:title" content="${esc(title)}">`);
html = html.replace(/<meta property="og:description" content="[^"]*">/,
  `<meta property="og:description" content="${esc(desc)}">`);
html = html.replace(/<meta property="og:locale" content="[^"]*">/,
  '<meta property="og:locale" content="en_US">');
html = html.replace(/<meta property="og:locale:alternate" content="[^"]*">/,
  '<meta property="og:locale:alternate" content="ko_KR">');
html = html.replace(/<meta name="twitter:title" content="[^"]*">/,
  `<meta name="twitter:title" content="${esc(title)}">`);
html = html.replace(/<meta name="twitter:description" content="[^"]*">/,
  `<meta name="twitter:description" content="${esc(desc)}">`);

/* ── JSON-LD ───────────────────────────────────────────────────
   Organization·WebSite·EducationalOrganization·SoftwareApplication 은
   본문에 영어 대응이 없는 독립된 문구라 손으로 옮긴다. 숫자는 위에서
   실제로 센 값을 쓴다. */
const orgWebEdu = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'Every Koreans', alternateName: '에브리 코리안즈',
      url: `${SITE}/`, logo: `${SITE}/logo.png`, email: 'junsanghan1225@gmail.com' },
    { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Cheesepotato',
      alternateName: ['치즈감자', 'Every Koreans'],
      description: `A free website for learning Korean, from the Hangul letters to TOPIK level 6. `
        + `${c.COURSES.length} courses, ${lessons} lessons, ${points} grammar points, ${topikQ} TOPIK practice `
        + `questions, ${passages} reading passages, ${comma(words)} dictionary words.`,
      inLanguage: ['ko', 'en'], publisher: { '@id': `${SITE}/#org` }, isFamilyFriendly: true },
    { '@type': 'EducationalOrganization', '@id': `${SITE}/#school`, name: 'Cheesepotato', url: `${SITE}/`,
      description: 'A website for learning Korean, offering free TOPIK I/II listening, reading and writing practice, plus grammar and reading study.',
      parentOrganization: { '@id': `${SITE}/#org` } },
  ],
};

const itemList = {
  '@context': 'https://schema.org', '@type': 'ItemList', name: 'What you learn at Cheesepotato',
  numberOfItems: 7, itemListOrder: 'https://schema.org/ItemListOrderAscending',
  itemListElement: [
    { '@type': 'ListItem', position: 1, item: { '@type': 'Course', '@id': `${SITE}/#courses`, name: 'Learn by course',
      alternateName: 'Learn Korean by course',
      description: `A Korean course that starts from the Hangul letters and moves through greetings and sentences. `
        + `${c.COURSES.length} courses across beginner, intermediate and advanced, ${lessons} lessons.`,
      provider: { '@id': `${SITE}/#org` }, inLanguage: 'en', isAccessibleForFree: true,
      teaches: ['Hangul', 'Korean pronunciation', 'Basic Korean grammar', 'Korean conversation'],
      educationalLevel: 'Beginner to Advanced', url: `${SITE}/en/#learn/courses`,
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online',
        courseWorkload: `${c.COURSES.length} courses, ${lessons} lessons`, inLanguage: 'en' } } },
    { '@type': 'ListItem', position: 2, item: { '@type': 'Course', '@id': `${SITE}/#topik`, name: 'TOPIK-style practice',
      alternateName: 'TOPIK practice',
      description: `Practice TOPIK I and II listening, reading and writing in the same structure as the real exam. `
        + `${topikQ} practice questions, plus mock papers with a timer and answer sheet. Original items, not past papers.`,
      provider: { '@id': `${SITE}/#org` }, inLanguage: 'en', isAccessibleForFree: true,
      teaches: ['TOPIK listening', 'TOPIK reading', 'TOPIK writing'],
      educationalLevel: 'TOPIK I (levels 1-2), TOPIK II (levels 3-6)', url: `${SITE}/en/#learn/topik`,
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online',
        courseWorkload: `${topikQ} practice questions`, inLanguage: 'en' } } },
    { '@type': 'ListItem', position: 3, item: { '@type': 'Course', '@id': `${SITE}/#sentence`, name: 'Build a sentence',
      alternateName: 'Build a Korean sentence',
      description: `${points} grammar points, each with a meaning, examples and a dialogue, and a box to write your own sentence and get it checked.`,
      provider: { '@id': `${SITE}/#org` }, inLanguage: 'en', isAccessibleForFree: true,
      teaches: ['Korean grammar points', 'Korean composition'], educationalLevel: 'Beginner to Advanced',
      url: `${SITE}/en/#learn/sentence`, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online',
        courseWorkload: `${points} grammar points`, inLanguage: 'en' } } },
    { '@type': 'ListItem', position: 4, item: { '@type': 'Course', '@id': `${SITE}/#reading`, name: 'Read and write',
      alternateName: 'Korean reading and writing',
      description: `Read ${passages} short and long passages and write about what you read.`,
      provider: { '@id': `${SITE}/#org` }, inLanguage: 'en', isAccessibleForFree: true,
      teaches: ['Korean reading', 'Korean writing'], educationalLevel: 'Beginner to Advanced',
      url: `${SITE}/en/#learn/reading`, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online',
        courseWorkload: `${passages} passages`, inLanguage: 'en' } } },
    { '@type': 'ListItem', position: 5, item: { '@type': 'Course', '@id': `${SITE}/#quiz`, name: 'Practice drills',
      alternateName: 'Korean practice drills',
      description: 'Pull questions straight out of the lessons and keep going. Also has a number-reading and a speed-quiz game.',
      provider: { '@id': `${SITE}/#org` }, inLanguage: 'en', isAccessibleForFree: true,
      teaches: ['Korean vocabulary', 'Korean grammar'], educationalLevel: 'Beginner to Advanced',
      url: `${SITE}/en/#learn/quiz`, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online',
        courseWorkload: 'Drills and 2 games', inLanguage: 'en' } } },
    { '@type': 'ListItem', position: 6, item: { '@type': 'Course', '@id': `${SITE}/#library`, name: 'Word & grammar dictionary',
      alternateName: 'Korean dictionary',
      description: `${comma(words)} words with definitions from the National Institute of Korean Language, plus ${grammarN} grammar entries. Tap an unknown word while studying to see it right away.`,
      provider: { '@id': `${SITE}/#org` }, inLanguage: 'en', isAccessibleForFree: true,
      teaches: ['Korean vocabulary', 'Korean grammar'], educationalLevel: 'All levels',
      url: `${SITE}/en/#learn/library`, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online',
        courseWorkload: `${comma(words)} words, ${grammarN} grammar entries`, inLanguage: 'en' } } },
    { '@type': 'ListItem', position: 7, item: { '@type': 'Course', '@id': `${SITE}/#convo`, name: 'Conversation practice',
      alternateName: 'Practice a Korean conversation',
      description: 'In real-life situations like a café or a clinic, the other side speaks first and you answer in your own words, with no options given.',
      provider: { '@id': `${SITE}/#org` }, inLanguage: 'en', isAccessibleForFree: true,
      teaches: ['Korean conversation', 'Korean composition'], educationalLevel: 'Beginner to Advanced',
      url: `${SITE}/en/#learn/convo`, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online',
        courseWorkload: 'Situational role-play scenarios', inLanguage: 'en' } } },
  ],
};

const softwareApp = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Cheesepotato Wordbook',
  applicationCategory: 'EducationalApplication', operatingSystem: 'Android', inLanguage: ['ko', 'en'],
  description: 'The Cheesepotato wordbook app. Take a photo and AI fills in the word, meaning and an example sentence; review by flipping through cards.',
  publisher: { '@id': `${SITE}/#org` },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  installUrl: 'https://play.google.com/store/apps/details?id=com.cheesepotato.app',
  downloadUrl: 'https://play.google.com/store/apps/details?id=com.cheesepotato.app',
};

/* FAQPage 는 번역해서 새로 안 쓴다 — data-en 스왑을 이미 마친 화면에서
   다시 뽑는다. 그래야 화면과 JSON-LD 가 항상 같은 말을 한다. */
const faqBox = html.match(/<div class="faq-list">([\s\S]*?)<\/details>\s*<\/div>/);
if (!faqBox) throw new Error('영어로 바꾼 쪽에서 FAQ 목록을 못 찾았다');
const faqPairs = [...faqBox[1].matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/g)]
  .map((m) => ({ q: strip(m[1]), a: strip(m[2]) }));
if (!faqPairs.length) throw new Error('영어로 바꾼 쪽에서 FAQ 문답을 못 찾았다');
const faqPage = {
  '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${SITE}/en/#faq`,
  mainEntity: faqPairs.map((p) => ({ '@type': 'Question', name: p.q,
    acceptedAnswer: { '@type': 'Answer', text: p.a } })),
};

/* 한국어 쪽의 JSON-LD 네 덩이(Org+WebSite+Edu 한 덩이 · ItemList · FAQPage ·
   SoftwareApplication)를 순서 그대로 영어 덩이로 바꿔 끼운다. 덩이 수가
   다르면(첫 쪽에 JSON-LD 가 새로 생기거나 지워진 것) 여기서 멈춘다 —
   조용히 어긋난 채로 굽는 것보다 낫다. */
const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g)];
const newLd = [orgWebEdu, itemList, faqPage, softwareApp];
if (ldBlocks.length !== newLd.length)
  throw new Error(`JSON-LD 가 ${newLd.length}덩이가 아니라 ${ldBlocks.length}덩이다 — index.html 구조가 바뀐 것 같다`);
let li = 0;
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, () => {
  const d = newLd[li++];
  return `<script type="application/ld+json">${JSON.stringify(d)}</script>`;
});

mkdirSync(join(ROOT, 'en'), { recursive: true });
writeFileSync(join(ROOT, 'en', 'index.html'), html);
console.log(`en/index.html 을 썼다 (${html.length.toLocaleString()}자) · 제목 ${title.length}자 · 설명 ${desc.length}자 · FAQ ${faqPairs.length}개`);
