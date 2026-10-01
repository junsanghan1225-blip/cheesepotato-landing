/* 치즈감자 콘텐츠 현황(stats.html) — 섹션마다 자료가 얼마나 있는지 한눈에. 운영자 요청(2026-10-01).
   숫자는 사이트가 실제로 쓰는 자료 파일에서 그 자리에서 센다 — 자료가 늘면 이 쪽도 저절로 맞는다(손으로 적은 숫자 없음).
   녹음 숫자만 record/index.json(node tools/record-list.mjs 가 만든다)에서 읽는다. */
const $ = (id) => document.getElementById(id);
const n = (x) => Number(x || 0).toLocaleString('ko-KR');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sum = (a, f = (x) => x) => a.reduce((s, x) => s + (f(x) || 0), 0);
const LV = { beginner: '초급', intermediate: '중급', advanced: '고급' };
const COURSE_LV = { 'Start here': '시작', 'After Hangul': '한글 다음', 'After First Words': '첫 낱말 다음', Beginner: '초급', Intermediate: '중급', Advanced: '고급' };

const [courses, sentences, drill, usage, gwords, v1, v2, gloss, gex, topik1, topik2, tl, tw, eps, reading, convo, blog, ltO, ltR, ltL, ltW, travel] =
  await Promise.all(['courses.js', 'sentences.js', 'grammar-drill.js', 'grammar-usage.js', 'grammar-words.js', 'vocab-topik1.js', 'vocab-topik2.js',
    'glossary.js', 'glossary-examples.js', 'topik.js', 'topik2.js', 'topik-listening.js', 'topik-writing.js', 'eps.js', 'reading.js', 'convo.js',
    'blog.js', 'leveltest-overall.js', 'leveltest-reading.js', 'leveltest-listening.js', 'leveltest-writing.js', 'travel-data.js']
    .map((f) => import(`./${f}`)));
let rec = null;
try { rec = await (await fetch('record/index.json', { cache: 'no-store' })).json(); } catch { /* 녹음 숫자만 빠진다 */ }

const C = courses.COURSES, points = sentences.SB_CATS.flatMap((c) => c.points);
const byKey = (arr, key) => arr.reduce((m, x) => { const k = key(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const lessonsBy = C.reduce((m, c) => { m[c.level] = (m[c.level] || 0) + (c.lessons?.length || 0); return m; }, {});
const passages = Object.values(reading.READING).flatMap((a) => Object.values(a)).flat();
const topikR = topik1.TOPIK_READING.length + topik2.TOPIK2_READING.length;
const topikL = tl.TOPIKL_ITEMS.length + tl.TOPIKL2_ITEMS.length;
const topikAll = topikR + topikL + tw.TW_ITEMS.length;
const epsTopic = { daily: '일상', work: '일터', safety: '안전', culture: '문화' };

/* 섹션: big = 큰 숫자, rows = [이름, 수] (막대는 그 섹션 안에서의 비율) */
const SECTIONS = [
  { icon: '📚', name: '코스', en: 'Courses', big: sum(C, (c) => c.lessons?.length), unit: '레슨', sub: `코스 ${n(C.length)}개`,
    rows: Object.entries(lessonsBy).map(([k, v]) => [COURSE_LV[k] || k, v]) },
  { icon: '✍️', name: '문법', en: 'Grammar', big: points.length, unit: '표현',
    rows: [...Object.entries(byKey(points, (p) => LV[p.lv] || p.lv)),
      ['바꿔 쓰기 문항', Object.keys(drill.GRAMMAR_DRILL).length], ['쓰임 보기', Object.keys(usage.GRAMMAR_USAGE).length],
      ['같이 알면 좋은 단어', sum(Object.values(gwords.GRAMMAR_WORDS), (a) => a.length)]], split: 3 },
  { icon: '🔤', name: '단어', en: 'Words', big: v1.VOCAB.length + v2.VOCAB.length, unit: '낱말',
    rows: [['TOPIK I', v1.VOCAB.length], ['TOPIK II', v2.VOCAB.length], ['TOPIK I 예문', sum(v1.VOCAB, (w) => w.x?.length)]], split: 2 },
  { icon: '📖', name: '사전', en: 'Dictionary', big: Object.keys(gloss.GLOSSARY).length, unit: '낱말',
    rows: [['예문', Object.keys(gex.EXAMPLES).length], ['뜻 번역 언어(영어 말고)', Object.keys(gloss.GLOSS_LANGS || {}).length]] },
  { icon: '📝', name: 'TOPIK', en: 'TOPIK practice', big: topikAll, unit: '문항', sub: '전부 창작 · 기출 아님',
    rows: [['TOPIK I 읽기', topik1.TOPIK_READING.length], ['TOPIK II 읽기', topik2.TOPIK2_READING.length],
      ['TOPIK I 듣기', tl.TOPIKL_ITEMS.length], ['TOPIK II 듣기', tl.TOPIKL2_ITEMS.length], ['쓰기', tw.TW_ITEMS.length]] },
  { icon: '🏭', name: 'EPS-TOPIK', en: 'Work in Korea', big: eps.EPS_ITEMS.length, unit: '문항',
    rows: Object.entries(byKey(eps.EPS_ITEMS, (q) => epsTopic[q.topic] || q.topic)) },
  { icon: '📰', name: '읽기', en: 'Reading', big: passages.length, unit: '지문',
    rows: Object.entries(reading.READING).flatMap(([len, a]) => Object.entries(a).map(([lv, b]) => [`${len === 'short' ? '짧은' : '긴'} 글 · ${LV[lv] || lv}`, b.length])) },
  { icon: '💬', name: '말하기 대화', en: 'Conversations', big: convo.CONVO.length, unit: '장면',
    rows: Object.entries(byKey(convo.CONVO, (c) => LV[c.lv] || c.lv)) },
  { icon: '🎯', name: '레벨 테스트', en: 'Level test', big: ltO.LT_CUSTOM_OVERALL.length + ltR.LT_CUSTOM_READING.length + ltL.LT_CUSTOM_LISTENING.length + ltW.LT_CUSTOM_WRITING.length, unit: '문항',
    rows: [['종합', ltO.LT_CUSTOM_OVERALL.length], ['쓰기', ltW.LT_CUSTOM_WRITING.length], ['읽기', ltR.LT_CUSTOM_READING.length], ['듣기', ltL.LT_CUSTOM_LISTENING.length]] },
  { icon: '✈️', name: '여행 한국어', en: 'Travel', big: travel.TRAVEL_PHRASES.length, unit: '표현',
    rows: [['주제', travel.TRAVEL_CATEGORIES.length], ['낱말', sum(Object.values(travel.TRAVEL_VOCAB), (a) => (Array.isArray(a) ? a.length : Object.keys(a || {}).length))]] },
  { icon: '🗞️', name: '블로그', en: 'Blog', big: blog.BLOG_POSTS.length, unit: '편',
    /* lang 이 없는 글은 한국어 글이다 */
    rows: Object.entries(byKey(blog.BLOG_POSTS, (p) => (p.lang === 'en' ? '영어' : '한국어'))) },
];

function card(s) {
  /* 막대 — 같은 묶음(split 앞쪽 줄들)끼리의 비율. 뒤쪽 줄(보조 숫자)은 막대 없이 숫자만 */
  const main = s.split ? s.rows.slice(0, s.split) : s.rows, extra = s.split ? s.rows.slice(s.split) : [];
  const max = Math.max(1, ...main.map((r) => r[1]));
  return `<article class="card">
    <header><span class="ic" aria-hidden="true">${s.icon}</span><div><h2>${esc(s.name)}</h2><small>${esc(s.en)}</small></div></header>
    <p class="big"><b>${n(s.big)}</b><span>${esc(s.unit)}</span></p>${s.sub ? `<p class="sub">${esc(s.sub)}</p>` : ''}
    <ul class="bars">${main.map(([k, v]) => `<li title="${esc(k)} ${n(v)}"><span class="k">${esc(k)}</span><span class="bar"><i style="width:${(v / max) * 100}%"></i></span><span class="v">${n(v)}</span></li>`).join('')}</ul>
    ${extra.length ? `<ul class="extra">${extra.map(([k, v]) => `<li><span>${esc(k)}</span><b>${n(v)}</b></li>`).join('')}</ul>` : ''}
  </article>`;
}

/* 맨 위 — 가장 많이 묻는 네 숫자 */
$('hero').innerHTML = [
  ['단어', v1.VOCAB.length + v2.VOCAB.length, '낱말'], ['TOPIK 연습', topikAll, '문항'],
  ['코스', sum(C, (c) => c.lessons?.length), '레슨'], ['문법', points.length, '표현'],
].map(([k, v, u]) => `<div class="tile"><span>${k}</span><b>${n(v)}</b><small>${u}</small></div>`).join('');
$('grid').innerHTML = SECTIONS.map(card).join('');

/* 녹음 — 사람 목소리 · 기계 목소리 · 아직 없음 */
if (rec?.groups) {
  const T = { mine: sum(rec.groups, (g) => g.mine), tts: sum(rec.groups, (g) => g.tts), none: sum(rec.groups, (g) => g.none) };
  const all = T.mine + T.tts + T.none || 1, pct = (x) => `${((x / all) * 100).toFixed(1)}%`;
  $('rec').innerHTML = `<h2>🎙️ 소리 <small>Audio</small></h2>
    <p class="sub">소리가 나는 자리 ${n(all)}곳 · ${esc(rec.built || '')} 기준</p>
    <div class="stack" role="img" aria-label="사람 목소리 ${n(T.mine)}, 기계 목소리 ${n(T.tts)}, 소리 없음 ${n(T.none)}">
      <i class="mine" style="width:${pct(T.mine)}" title="사람 목소리 ${n(T.mine)}"></i><i class="tts" style="width:${pct(T.tts)}" title="기계 목소리 ${n(T.tts)}"></i><i class="none" style="width:${pct(T.none)}" title="아직 소리 없음 ${n(T.none)}"></i>
    </div>
    <ul class="legend"><li><i class="mine"></i>사람 목소리 <b>${n(T.mine)}</b></li><li><i class="tts"></i>기계 목소리 <b>${n(T.tts)}</b></li><li><i class="none"></i>아직 없음 <b>${n(T.none)}</b></li></ul>
    <table><thead><tr><th>자리</th><th>사람</th><th>기계</th><th>없음</th></tr></thead><tbody>
    ${rec.groups.map((g) => `<tr><td>${esc(g.ko)}</td><td>${n(g.mine)}</td><td>${n(g.tts)}</td><td>${n(g.none)}</td></tr>`).join('')}</tbody></table>`;
} else $('rec').hidden = true;

$('when').textContent = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
