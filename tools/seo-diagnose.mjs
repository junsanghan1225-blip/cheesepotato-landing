#!/usr/bin/env node
/* 검색 유입이 왜 줄었나 — 한 번 돌려 보는 진단(운영자 2026-11-23 「너가 이유를 찾아」).
   analytics-daily 와 같은 키(GOOGLE_SA_KEY · GA_PROPERTY_ID · SC_SITE, GitHub Secrets/Variables)로
   Search Console · GA4 를 두 기간(줄기 전 A · 줄어든 뒤 B)으로 나눠 비교하고, 많이 빠진 쪽은 색인 상태(URL 검사)와
   지금 사이트의 응답(상태 코드 · noindex · canonical)까지 본다. 결과는 마크다운 한 장(표준 출력).
   node tools/seo-diagnose.mjs [--a 2026-10-01:2026-10-16] [--b 2026-11-06:2026-11-20]
   비밀 값은 읽기만 하고 어디에도 찍지 않는다. */
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [A0, A1] = arg('--a', '2026-10-01:2026-10-16').split(':');
const [B0, B1] = arg('--b', '2026-11-06:2026-11-20').split(':');
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5) + 1;
const DA = days(A0, A1), DB = days(B0, B1);
const SITE = process.env.SC_SITE;
const ORIGIN = 'https://everykoreans.com';
/* --drop-sitemap <주소> : Search Console 에 사이트맵으로 잘못 등록된 것 하나를 지운다(운영자 2026-11-23 「너가 다 해」).
   쓰기 권한(webmasters)이 필요하다 — 서비스 계정이 Search Console 에서 「전체」 사용자가 아니면 거절되고, 그 이유를 찍는다. */
const DROP = arg('--drop-sitemap', '');

async function token() {
  const key = JSON.parse(process.env.GOOGLE_SA_KEY || '{}');
  if (!key.client_email || !key.private_key) throw new Error('GOOGLE_SA_KEY 가 비어 있습니다.');
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
    iss: key.client_email, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3000,
    scope: 'https://www.googleapis.com/auth/analytics.readonly ' + (DROP ? 'https://www.googleapis.com/auth/webmasters' : 'https://www.googleapis.com/auth/webmasters.readonly'),
  });
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }) });
  const j = await r.json(); if (!j.access_token) throw new Error('토큰 실패: ' + (j.error_description || j.error));
  return j.access_token;
}
let TOK;
const api = async (url, body, method = 'POST') => {
  const r = await fetch(url, { method, headers: { authorization: 'Bearer ' + TOK, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json(); if (j.error) throw new Error(j.error.message); return j;
};
const sc = async (body) => (await api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, { rowLimit: 25000, ...body })).rows || [];
const ga = async (body) => ((await api(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA_PROPERTY_ID}:runReport`, body)).rows || [])
  .map((x) => [...(x.dimensionValues || []).map((d) => d.value), ...(x.metricValues || []).map((m) => Number(m.value))]);

const out = [];
const P = (s = '') => out.push(s);
const n1 = (x) => (Math.round(x * 10) / 10).toString();
const pct = (a, b) => (a ? `${b >= a ? '+' : ''}${Math.round(((b - a) / a) * 100)}%` : (b ? '새로' : '–'));
const cell = (s) => String(s).replace(/\|/g, '/');
const short = (u) => { try { return decodeURIComponent(u.replace(ORIGIN, '').replace('https://www.everykoreans.com', '')) || '/'; } catch (e) { return u; } };

/* 두 기간을 같은 차원으로 받아 하루 평균으로 맞춰 비교 */
async function compare(dim, limit = 25, filter) {
  const q = (s, e) => sc({ startDate: s, endDate: e, dimensions: [dim], ...(filter ? { dimensionFilterGroups: [{ filters: [filter] }] } : {}) });
  const [ra, rb] = await Promise.all([q(A0, A1), q(B0, B1)]);
  const m = new Map();
  for (const r of ra) m.set(r.keys[0], { k: r.keys[0], ca: r.clicks / DA, ia: r.impressions / DA, pa: r.position, cb: 0, ib: 0, pb: null });
  for (const r of rb) { const o = m.get(r.keys[0]) || { k: r.keys[0], ca: 0, ia: 0, pa: null }; Object.assign(o, { cb: r.clicks / DB, ib: r.impressions / DB, pb: r.position }); m.set(r.keys[0], o); }
  const all = [...m.values()];
  const tot = all.reduce((s, o) => ({ ca: s.ca + o.ca, cb: s.cb + o.cb, ia: s.ia + o.ia, ib: s.ib + (o.ib || 0) }), { ca: 0, cb: 0, ia: 0, ib: 0 });
  return { all, tot, losers: all.filter((o) => (o.ib || 0) < o.ia).sort((x, y) => (y.ia - (y.ib || 0)) - (x.ia - (x.ib || 0))).slice(0, limit) };
}
const table = (rows, label) => {
  P(`| ${label} | 클릭/일 A→B | 노출/일 A→B | 노출 변화 | 평균 순위 A→B |`); P('|---|---|---|---|---|');
  for (const o of rows) P(`| ${cell(label === '쪽' ? short(o.k) : o.k)} | ${n1(o.ca)} → ${n1(o.cb || 0)} | ${n1(o.ia)} → ${n1(o.ib || 0)} | ${pct(o.ia, o.ib || 0)} | ${o.pa ? n1(o.pa) : '–'} → ${o.pb ? n1(o.pb) : '빠짐'} |`);
  P();
};

async function main() {
  TOK = await token();
  if (DROP) {
    const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(DROP)}`, { method: 'DELETE', headers: { authorization: 'Bearer ' + TOK } });
    P(r.ok ? `사이트맵 지움: ${DROP}` : `사이트맵 못 지움(${r.status}): ${(await r.text()).slice(0, 300)}`);
    return;
  }
  P(`# 검색 유입 진단 — A ${A0}~${A1}(${DA}일) vs B ${B0}~${B1}(${DB}일)`); P();
  P('> 숫자는 하루 평균. Search Console · GA4 API 에서 바로 받은 값.'); P();

  /* 1. 주별 흐름 */
  const daily = await sc({ startDate: '2026-08-01', endDate: B1, dimensions: ['date'] });
  const wk = new Map();
  for (const r of daily) { const d = new Date(r.keys[0]); const mon = new Date(d - ((d.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10);
    const o = wk.get(mon) || { c: 0, i: 0, pw: 0, n: 0 }; o.c += r.clicks; o.i += r.impressions; o.pw += r.position * r.impressions; o.n++; wk.set(mon, o); }
  P('## 1. 주별 구글 검색 (Search Console)'); P('| 주(월요일) | 날 수 | 클릭 | 노출 | 평균 순위 |'); P('|---|---|---|---|---|');
  for (const [k, o] of wk) P(`| ${k} | ${o.n} | ${o.c} | ${o.i.toLocaleString('en-US')} | ${o.i ? n1(o.pw / o.i) : '–'} |`);
  P();

  /* 2. 쪽 · 검색어 · 나라 · 기기 */
  const pg = await compare('page', 30);
  P(`## 2. 노출이 가장 많이 빠진 쪽 (전체 노출/일 ${n1(pg.tot.ia)} → ${n1(pg.tot.ib)}, 클릭/일 ${n1(pg.tot.ca)} → ${n1(pg.tot.cb)})`);
  table(pg.losers, '쪽');
  const gone = pg.all.filter((o) => o.ia >= 3 && !o.ib).length;
  P(`- A 에 하루 노출 3번 이상이던 쪽 중 B 에 **아예 안 나온 쪽: ${gone}개** / A 에 나온 쪽 ${pg.all.filter((o) => o.ia).length}개 · B 에 나온 쪽 ${pg.all.filter((o) => o.ib).length}개`);
  /* 쪽 갈래(첫 경로)별 */
  const grp = new Map();
  for (const o of pg.all) { const g = '/' + (short(o.k).split('/')[1] || ''); const x = grp.get(g) || { ia: 0, ib: 0, ca: 0, cb: 0, na: 0, nb: 0 };
    x.ia += o.ia; x.ib += o.ib || 0; x.ca += o.ca; x.cb += o.cb || 0; if (o.ia) x.na++; if (o.ib) x.nb++; grp.set(g, x); }
  P(); P('### 쪽 갈래별'); P('| 갈래 | 노출/일 A→B | 변화 | 클릭/일 A→B | 노출된 쪽 수 A→B |'); P('|---|---|---|---|---|');
  for (const [g, x] of [...grp].sort((a, b) => b[1].ia - a[1].ia).slice(0, 20)) P(`| ${cell(g)} | ${n1(x.ia)} → ${n1(x.ib)} | ${pct(x.ia, x.ib)} | ${n1(x.ca)} → ${n1(x.cb)} | ${x.na} → ${x.nb} |`);
  P();
  const qq = await compare('query', 25);
  P('## 3. 노출이 가장 많이 빠진 검색어'); table(qq.losers, '검색어');
  const ct = await compare('country', 12);
  P('## 4. 나라별'); table(ct.all.sort((a, b) => b.ia - a.ia).slice(0, 12), '나라');
  const dv = await compare('device', 5);
  P('## 5. 기기별'); table(dv.all, '기기');

  /* 6. 사이트맵 */
  P('## 6. 사이트맵 (Search Console)');
  try {
    const sm = await api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`, null, 'GET');
    P('| 사이트맵 | 마지막으로 받아 간 때 | 오류 | 경고 | 제출 | 색인 |'); P('|---|---|---|---|---|---|');
    for (const s of sm.sitemap || []) { const c = (s.contents || [])[0] || {};
      P(`| ${cell(s.path.replace(ORIGIN, ''))} | ${(s.lastDownloaded || '').slice(0, 10)} | ${s.errors || 0} | ${s.warnings || 0} | ${c.submitted || '–'} | ${c.indexed || '–'} |`); }
  } catch (e) { P('- 못 받음: ' + e.message); }
  P();

  /* 7. 많이 빠진 쪽의 색인 상태 + 지금 응답 */
  P('## 7. 많이 빠진 쪽 12곳 — 구글 색인 상태 · 지금 사이트 응답');
  P('| 쪽 | 색인 판정 | 구글이 고른 대표 주소 | 마지막 크롤 | 지금 응답 | noindex | canonical |'); P('|---|---|---|---|---|---|---|');
  for (const o of pg.losers.slice(0, 12)) {
    let st = '–', gc = '–', lc = '–';
    try {
      const j = await api('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: o.k, siteUrl: SITE });
      const ir = j.inspectionResult?.indexStatusResult || {};
      st = ir.coverageState || ir.verdict || '–'; gc = ir.googleCanonical ? short(ir.googleCanonical) : '–'; lc = (ir.lastCrawlTime || '').slice(0, 10) || '–';
    } catch (e) { st = '검사 못 함: ' + e.message.slice(0, 60); }
    let code = '–', noidx = '–', canon = '–';
    try {
      const r = await fetch(o.k, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (compatible; site-check)' } });
      code = String(r.status) + (r.headers.get('location') ? ' → ' + short(r.headers.get('location')) : '');
      if (r.status === 200) { const h = await r.text();
        noidx = /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(h) ? '있음' : '없음';
        const m = h.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)/i); canon = m ? short(m[1]) : '없음'; }
    } catch (e) { code = '못 받음'; }
    P(`| ${cell(short(o.k))} | ${cell(st)} | ${cell(gc)} | ${lc} | ${cell(code)} | ${noidx} | ${cell(canon)} |`);
  }
  P();

  /* 8. robots.txt */
  P('## 8. robots.txt (지금)');
  try { const t = await (await fetch(ORIGIN + '/robots.txt')).text(); P('```'); P(t.slice(0, 1500)); P('```'); } catch (e) { P('- 못 받음'); }
  P();

  /* 9. GA4 — 검색으로 들어온 첫 쪽 */
  P('## 9. GA4 — 검색(Organic Search)으로 들어온 첫 쪽, 세션/일');
  const gq = (s, e) => ga({ dateRanges: [{ startDate: s, endDate: e }], dimensions: [{ name: 'landingPage' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }],
    dimensionFilter: { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } } }, limit: 500 });
  const [ga_a, ga_b] = await Promise.all([gq(A0, A1), gq(B0, B1)]);
  const gm = new Map();
  for (const [p, s, en] of ga_a) gm.set(p, { a: s / DA, ea: en / DA, b: 0, eb: 0 });
  for (const [p, s, en] of ga_b) { const o = gm.get(p) || { a: 0, ea: 0 }; o.b = s / DB; o.eb = en / DB; gm.set(p, o); }
  const ta = ga_a.reduce((s, r) => s + r[1], 0) / DA, tb = ga_b.reduce((s, r) => s + r[1], 0) / DB;
  P(`전체 ${n1(ta)} → ${n1(tb)} (${pct(ta, tb)})`); P();
  P('| 첫 쪽 | 세션/일 A→B | 참여 세션/일 A→B |'); P('|---|---|---|');
  for (const [p, o] of [...gm].sort((x, y) => (y[1].a - y[1].b) - (x[1].a - x[1].b)).slice(0, 20)) P(`| ${cell(p)} | ${n1(o.a)} → ${n1(o.b)} | ${n1(o.ea)} → ${n1(o.eb)} |`);
  P();
  const gs = (s, e) => ga({ dateRanges: [{ startDate: s, endDate: e }], dimensions: [{ name: 'sessionSource' }, { name: 'country' }], metrics: [{ name: 'sessions' }, { name: 'averageSessionDuration' }],
    dimensionFilter: { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } } }, limit: 30 });
  const [sa, sb] = await Promise.all([gs(A0, A1), gs(B0, B1)]);
  P('### 검색 출처 × 나라 (세션 합계 · 평균 머문 초)'); P('| 기간 | 출처 | 나라 | 세션 | 머문 초 |'); P('|---|---|---|---|---|');
  for (const [k, rows] of [['A', sa], ['B', sb]]) for (const r of rows.slice(0, 12)) P(`| ${k} | ${r[0]} | ${r[1]} | ${r[2]} | ${Math.round(r[3])} |`);
  P();
}

main().then(() => console.log(out.join('\n'))).catch((e) => { console.log(out.join('\n')); console.log('\n진단 중 멈춤: ' + e.message); process.exitCode = 1; });
