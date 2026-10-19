#!/usr/bin/env node
/* 매일 사이트 성과 모으기 — GA4(Data API) + Search Console API → CSV 여러 개 + 「일간 성과 요약」 한 장(운영자 2026-10-18 「API 자동 수집 · 진행」).
   node tools/analytics-daily.mjs [--out 폴더] [--date YYYY-MM-DD(GA 기준일, 기본 어제 한국 날짜)] [--fake]
   필요한 값(환경변수 — 비밀은 GitHub Secrets 에만, 채팅 · 코드에 적지 않는다):
     GA_PROPERTY_ID   GA4 속성 번호(숫자, 비밀 아님)
     SC_SITE          Search Console 속성(예: sc-domain:everykoreans.com 또는 https://everykoreans.com/)
     GOOGLE_SA_KEY    서비스 계정 키 JSON 전체(비밀)
     CLARITY_API_TOKEN  (있으면) Clarity 데이터 내보내기 토큰(비밀) — 「최근 24시간」 요약이 붙는다. 없거나 실패해도 위 숫자는 그대로 모인다
   라이브러리 없이 Node 만 쓴다(서비스 계정 JWT → 토큰 → REST). 설정 순서는 docs/ops/analytics-api-setup.md.
   --fake : 가짜 숫자로 모양만 확인(키 없이 시험) */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const arg = (k, d = '') => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FAKE = args.includes('--fake');
const kstDay = (offset = 0) => { const d = new Date(Date.now() + 9 * 3600e3 + offset * 86400e3); return d.toISOString().slice(0, 10); };
const DATE = arg('--date', kstDay(-1));                 // GA 는 어제(하루가 끝난 날)
const SC_END = kstDay(-3);                              // Search Console 은 2~3일 늦게 확정된다
const SC_START = kstDay(-9);                            // 7일 창
const OUT = path.resolve(arg('--out', path.join('docs/ops/analytics', DATE)));

const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const toCsv = (head, rows) => [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
const num = (x) => Number(x || 0);
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pct = (n) => (Math.round(n * 1000) / 10).toFixed(1) + '%';

/* ── 구글 인증: 서비스 계정 JWT → 접근 토큰 ── */
async function token() {
  const key = JSON.parse(process.env.GOOGLE_SA_KEY || '{}');
  if (!key.client_email || !key.private_key) throw new Error('GOOGLE_SA_KEY 가 비어 있거나 서비스 계정 키 JSON 이 아닙니다.');
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
    iss: key.client_email, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3000,
    scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly',
  });
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }) });
  const j = await r.json(); if (!j.access_token) throw new Error('토큰을 못 받았어요: ' + JSON.stringify(j));
  return j.access_token;
}

/* ── GA4 ── */
async function ga(tok, body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA_PROPERTY_ID}:runReport`, {
    method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json(); if (j.error) throw new Error('GA4: ' + j.error.message);
  return (j.rows || []).map((x) => [...(x.dimensionValues || []).map((d) => d.value), ...(x.metricValues || []).map((m) => m.value)]);
}
/* ── Search Console ── */
async function sc(tok, body) {
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(process.env.SC_SITE)}/searchAnalytics/query`, {
    method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json(); if (j.error) throw new Error('Search Console: ' + j.error.message);
  return (j.rows || []).map((x) => [...(x.keys || []), x.clicks, x.impressions, x.ctr, x.position]);
}

/* ── Clarity(데이터 내보내기 API) — 하루 호출이 적고(약 10번) 「최근 24시간」 묶음 숫자만 준다. 녹화 · 히트맵은 못 받는다.
   실패해도 GA4 수집은 계속 간다 — 이유를 요약에 적는다. ── */
async function clarityCall(dim) {
  const u = 'https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1' + (dim ? '&dimension1=' + encodeURIComponent(dim) : '');
  const r = await fetch(u, { headers: { authorization: 'Bearer ' + process.env.CLARITY_API_TOKEN } });
  const t = await r.text();
  if (!r.ok) throw new Error('Clarity ' + r.status + ': ' + t.slice(0, 160));
  return JSON.parse(t);
}
async function clarity() {
  if (FAKE) return { overall: [{ metricName: 'RageClickCount', information: [{ sessionsCount: '12', sessionsWithMetricPercentage: 1.2 }] }], byUrl: [], note: '' };
  if (!process.env.CLARITY_API_TOKEN) return null;
  const out = { overall: [], byUrl: [], note: '' };
  try { out.overall = await clarityCall(''); } catch (e) { out.note = String(e.message || e); return out; }
  try { out.byUrl = await clarityCall('URL'); } catch (e) { out.note = '쪽별: ' + String(e.message || e); }
  return out;
}
const clInfoLine = (info) => Object.entries(info || {}).filter(([, v]) => v !== null && v !== '').map(([k, v]) => k + ' ' + (typeof v === 'number' ? Math.round(v * 100) / 100 : v)).join(' · ');

async function collect() {
  if (FAKE) {
    return {
      overview: [['1048', '1046', '1563', '4310', '333', '0.41']],
      pages: [['/', '900', '700'], ['/topik-writing/', '300', '220']], sources: [['Direct', '(direct) / (none)', '600'], ['Organic Search', 'google / organic', '400']],
      countries: [['Korea', '300', '400'], ['Vietnam', '200', '260']], events: [['page_view', '4310'], ['lesson_start', '871']], devices: [['mobile', '800', '1100'], ['desktop', '248', '463']],
      scDay: [['0', '0']], scQ: [['토픽 쓰기 연습', '12', '300', '0.04', '6.2']], scP: [['https://everykoreans.com/topik-writing/', '30', '900', '0.033', '7.1']],
    };
  }
  const tok = await token();
  const range = [{ startDate: DATE, endDate: DATE }];
  const q = (dimensions, metrics, limit, extra = {}) => ga(tok, { dateRanges: range, dimensions: dimensions.map((name) => ({ name })), metrics: metrics.map((name) => ({ name })), limit, ...extra });
  const sorted = (metric) => ({ orderBys: [{ metric: { metricName: metric }, desc: true }] });
  const [overview, pages, sources, countries, events, devices, scDay, scQ, scP] = await Promise.all([
    q([], ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'averageSessionDuration', 'engagementRate'], 1),
    q(['pagePath'], ['screenPageViews', 'activeUsers'], 10, sorted('screenPageViews')),
    q(['sessionDefaultChannelGroup', 'sessionSourceMedium'], ['sessions'], 10, sorted('sessions')),
    q(['country'], ['activeUsers', 'sessions'], 10, sorted('activeUsers')),
    q(['eventName'], ['eventCount'], 15, sorted('eventCount')),
    q(['deviceCategory'], ['activeUsers', 'sessions'], 5, sorted('activeUsers')),
    sc(tok, { startDate: SC_END, endDate: SC_END, rowLimit: 1 }),
    sc(tok, { startDate: SC_START, endDate: SC_END, dimensions: ['query'], rowLimit: 20 }),
    sc(tok, { startDate: SC_START, endDate: SC_END, dimensions: ['page'], rowLimit: 10 }),
  ]);
  return { overview, pages, sources, countries, events, devices, scDay, scQ, scP };
}

function summary(d) {
  const o = (d.overview[0] || []).map(num);
  const L = [`# 일간 사이트 성과 — ${DATE}`, '',
    `> 자동으로 모은 숫자입니다(GA4 · Search Console). GA4 는 ${DATE} 하루, Search Console 은 ${SC_START} ~ ${SC_END}(7일, 2~3일 늦게 확정). **숫자의 기준은 GA4 / Search Console 화면입니다.**`, '',
    '## 한눈에 (GA4, 하루)', '', '| 방문자 | 새 방문자 | 방문(세션) | 본 쪽 수 | 평균 머문 시간 | 참여율 |', '|---|---|---|---|---|---|',
    `| ${fmt(o[0])} | ${fmt(o[1])} | ${fmt(o[2])} | ${fmt(o[3])} | ${fmt(o[4])}초 | ${pct(o[5])} |`, ''];
  const table = (title, head, rows) => rows.length ? [`## ${title}`, '', `| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map((c) => String(c).replace(/\|/g, '/')).join(' | ')} |`), ''] : [];
  L.push(...table('많이 본 쪽 TOP 10', ['쪽', '본 횟수', '방문자'], d.pages.map((r) => [r[0], fmt(r[1]), fmt(r[2])])));
  L.push(...table('어디서 왔나 (유입)', ['채널', '출처 / 매체', '방문'], d.sources.map((r) => [r[0], r[1], fmt(r[2])])));
  L.push(...table('나라별', ['나라', '방문자', '방문'], d.countries.map((r) => [r[0], fmt(r[1]), fmt(r[2])])));
  L.push(...table('기기별', ['기기', '방문자', '방문'], d.devices.map((r) => [r[0], fmt(r[1]), fmt(r[2])])));
  L.push(...table('이벤트 TOP 15', ['이벤트', '횟수'], d.events.map((r) => [r[0], fmt(r[1])])));
  const sd = d.scDay[0] || [0, 0];
  L.push('## 검색 (Search Console)', '', `확정된 가장 최근 하루(${SC_END}): 클릭 ${fmt(sd[0])} · 노출 ${fmt(sd[1])}`, '');
  L.push(...table(`검색어 TOP 20 (${SC_START} ~ ${SC_END})`, ['검색어', '클릭', '노출', '클릭률', '평균 순위'], d.scQ.map((r) => [r[0], fmt(r[1]), fmt(r[2]), pct(num(r[3])), num(r[4]).toFixed(1)])));
  L.push(...table('검색에서 많이 열린 쪽 TOP 10', ['쪽', '클릭', '노출', '클릭률', '평균 순위'], d.scP.map((r) => [r[0], fmt(r[1]), fmt(r[2]), pct(num(r[3])), num(r[4]).toFixed(1)])));
  if (d.cl) {
    L.push('## Clarity (최근 24시간 — 날짜 기준이 아니라 호출한 시각 기준)', '');
    if (d.cl.note) L.push(`> Clarity 일부를 못 받았어요: ${d.cl.note}`, '');
    const block = (title, arr) => { for (const m of arr || []) { const rows = (m.information || []).slice(0, title ? 6 : 3); if (!rows.length) continue; L.push(`- **${m.metricName}**${title ? ' (' + title + ')' : ''}`); rows.forEach((i) => L.push('  - ' + clInfoLine(i))); } };
    block('', d.cl.overall); L.push('');
    if (d.cl.byUrl?.length) { L.push('### 쪽(URL)별', ''); block('쪽별', d.cl.byUrl); L.push(''); }
    L.push('> 참고: 이 숫자는 Clarity 화면의 요약과 같은 기준이며, 녹화 · 히트맵은 Clarity 화면에서 직접 보세요.', '');
  }
  L.push('> 주의: 한국 · 베트남 등에서 오는 자동 접속(봇)이 숫자에 섞일 수 있습니다. 이상하게 높은 날은 나라 · 기기 · 이벤트 표를 같이 보세요.');
  return L.join('\n') + '\n';
}

const d = await collect();
d.cl = await clarity();
fs.mkdirSync(OUT, { recursive: true });
const w = (name, head, rows) => fs.writeFileSync(path.join(OUT, name), toCsv(head, rows));
w('ga-개요.csv', ['방문자', '새방문자', '세션', '조회수', '평균참여시간(초)', '참여율'], d.overview);
w('ga-쪽별.csv', ['쪽', '조회수', '방문자'], d.pages);
w('ga-유입.csv', ['채널', '출처/매체', '세션'], d.sources);
w('ga-나라.csv', ['나라', '방문자', '세션'], d.countries);
w('ga-기기.csv', ['기기', '방문자', '세션'], d.devices);
w('ga-이벤트.csv', ['이벤트', '횟수'], d.events);
w('sc-검색어.csv', ['검색어', '클릭', '노출', '클릭률', '평균순위'], d.scQ);
w('sc-쪽.csv', ['쪽', '클릭', '노출', '클릭률', '평균순위'], d.scP);
if (d.cl) fs.writeFileSync(path.join(OUT, 'clarity-24시간.json'), JSON.stringify(d.cl, null, 1));
fs.writeFileSync(path.join(OUT, '일간 성과 요약.md'), summary(d));
console.log(`분석 수집 ${DATE}${FAKE ? ' (가짜 숫자)' : ''} → ${path.relative(process.cwd(), OUT)}`);
