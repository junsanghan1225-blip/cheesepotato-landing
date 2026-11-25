#!/usr/bin/env node
/* TOPIK 쓰기 깔때기 — 쓰기 쪽 → 샘플 → 책 쪽 → 사기(Polar · 예스24)까지 몇 명이 가나(운영자 2026-11-25 「토픽 쓰기 집중 · 학생에게 묻지 않고」).
   analytics-daily 와 같은 키(GOOGLE_SA_KEY · GA_PROPERTY_ID)로 GA4 를 읽어 마크다운 한 장(표준 출력). 기간 기본 최근 28일.
   node tools/writing-funnel.mjs [--days 28]   ·   비밀 값은 읽기만, 어디에도 찍지 않는다. */
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const DAYS = Number((args[args.indexOf('--days') + 1]) || 28) || 28;
const RANGE = [{ startDate: `${DAYS}daysAgo`, endDate: 'yesterday' }];

async function token() {
  const key = JSON.parse(process.env.GOOGLE_SA_KEY || '{}');
  if (!key.client_email || !key.private_key) throw new Error('GOOGLE_SA_KEY 가 비어 있습니다.');
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: key.client_email, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3000, scope: 'https://www.googleapis.com/auth/analytics.readonly' });
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }) });
  const j = await r.json(); if (!j.access_token) throw new Error('토큰 실패: ' + (j.error_description || j.error)); return j.access_token;
}
let TOK;
async function ga(body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA_PROPERTY_ID}:runReport`, {
    method: 'POST', headers: { authorization: 'Bearer ' + TOK, 'content-type': 'application/json' }, body: JSON.stringify({ dateRanges: RANGE, limit: 200, ...body }) });
  const j = await r.json(); if (j.error) throw new Error('GA4: ' + j.error.message);
  return (j.rows || []).map((x) => [...(x.dimensionValues || []).map((d) => d.value), ...(x.metricValues || []).map((m) => Number(m.value))]);
}
const f = (field, value, matchType = 'BEGINS_WITH') => ({ filter: { fieldName: field, stringFilter: { value, matchType } } });
const and = (...e) => ({ andGroup: { expressions: e } });
const out = []; const P = (s = '') => out.push(s);
const n0 = (x) => Math.round(x).toLocaleString('en-US');

async function main() {
  TOK = await token();
  P(`# TOPIK 쓰기 깔때기 — 최근 ${DAYS}일`); P();

  /* 1. 쓰기 쪽 전체 — 정적 쪽(/topik-writing/) */
  const [w] = await ga({ metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'userEngagementDuration' }], dimensionFilter: f('pagePath', '/topik-writing') });
  P('## 1. 쓰기 쪽(/topik-writing/…) 전체');
  P(w ? `본 횟수 ${n0(w[0])} · 본 사람 ${n0(w[1])} · 한 사람 평균 머문 시간 ${n0(w[2] / Math.max(1, w[1]))}초` : '- 숫자 없음'); P();

  /* 2. 단계별 — 쓰기 쪽에서 일어난 이벤트 */
  const ev = await ga({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }], dimensionFilter: f('pagePath', '/topik-writing') });
  const E = Object.fromEntries(ev.map(([k, c, u]) => [k, { c, u }]));
  P('## 2. 쓰기 쪽 안에서 한 일 (이벤트 · 사람 수)'); P('| 이벤트 | 횟수 | 사람 |'); P('|---|---|---|');
  for (const [k, v] of Object.entries(E).sort((a, b) => b[1].c - a[1].c).slice(0, 25)) P(`| ${k} | ${n0(v.c)} | ${n0(v.u)} |`);
  P();

  /* 3. 쓰기 책 쪽 · 사기 */
  const shop = await ga({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }], dimensionFilter: f('pagePath', '/shop/topik2-writing') });
  P('## 3. 쓰기 책 쪽(/shop/topik2-writing-…)'); P('| 쪽 | 본 횟수 | 사람 |'); P('|---|---|---|');
  for (const r of shop) P(`| ${r[0]} | ${n0(r[1])} | ${n0(r[2])} |`); P();
  const sev = await ga({ dimensions: [{ name: 'pagePath' }, { name: 'eventName' }], metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: and(f('pagePath', '/shop/topik2-writing'), { orGroup: { expressions: ['buy_click', 'sample_click', 'outbound_click', 'scroll_depth'].map((x) => f('eventName', x, 'EXACT')) } }) });
  P('### 책 쪽에서 누른 것'); P('| 쪽 | 이벤트 | 횟수 | 사람 |'); P('|---|---|---|---|');
  for (const r of sev) P(`| ${r[0]} | ${r[1]} | ${n0(r[2])} | ${n0(r[3])} |`); P();

  /* 4. 쓰기 쪽에서 책 쪽으로 넘어간 길 — 책 쪽에 들어오기 전 쪽(pageReferrer) */
  const ref = await ga({ dimensions: [{ name: 'pageReferrer' }], metrics: [{ name: 'screenPageViews' }], dimensionFilter: f('pagePath', '/shop/topik2-writing') });
  P('## 4. 쓰기 책 쪽에 어디서 왔나 (바로 앞 쪽)'); P('| 앞 쪽 | 본 횟수 |'); P('|---|---|');
  for (const r of ref.sort((a, b) => b[1] - a[1]).slice(0, 15)) P(`| ${r[0] || '(없음)'} | ${n0(r[1])} |`); P();

  /* 5. 쓰기 쪽 중 많이 본 쪽 · 머문 시간 · 스크롤 */
  const pg = await ga({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'userEngagementDuration' }], dimensionFilter: f('pagePath', '/topik-writing'), orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] });
  P('## 5. 많이 본 쓰기 쪽 TOP 20'); P('| 쪽 | 본 횟수 | 사람 | 평균 머문 초 |'); P('|---|---|---|---|');
  for (const r of pg.slice(0, 20)) P(`| ${r[0]} | ${n0(r[1])} | ${n0(r[2])} | ${n0(r[3] / Math.max(1, r[2]))} |`); P();

  /* 6. 쓰기 쪽 손님은 어디서 오나 */
  const src = await ga({ dimensions: [{ name: 'sessionSource' }, { name: 'country' }], metrics: [{ name: 'sessions' }, { name: 'averageSessionDuration' }], dimensionFilter: f('landingPage', '/topik-writing'), orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] });
  P('## 6. 쓰기 쪽으로 처음 들어온 손님 — 출처 × 나라'); P('| 출처 | 나라 | 방문 | 평균 머문 초 |'); P('|---|---|---|---|');
  for (const r of src.slice(0, 20)) P(`| ${r[0]} | ${r[1]} | ${n0(r[2])} | ${n0(r[3])} |`); P();

  /* 8. 쓰기 쪽 헛누름 — 어디를 눌렀나(cp_el 맞춤 측정기준) */
  try {
    const dc = await ga({ dimensions: [{ name: 'pagePath' }, { name: 'customEvent:cp_el' }], metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      dimensionFilter: and(f('pagePath', '/topik-writing'), f('eventName', 'dead_click', 'EXACT')), orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }] });
    P('## 8. 쓰기 쪽 헛누름 — 누른 곳'); P('| 쪽 | 누른 곳 | 횟수 | 사람 |'); P('|---|---|---|---|');
    for (const r of dc.slice(0, 30)) P(`| ${r[0]} | ${String(r[1]).replace(/\|/g, '/')} | ${n0(r[2])} | ${n0(r[3])} |`); P();
  } catch (e) { P('- 8번 못 받음: ' + e.message); }
  /* 7. 앱 안 쓰기 화면 — cp_screen 맞춤 측정기준이 있으면 */
  try {
    const app = await ga({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      dimensionFilter: { orGroup: { expressions: ['tw_open', 'tw_submit', 'tw_grade', 'writing_grade', 'grade_writing', 'pro_view', 'buy_click', 'sample_click', 'book_click'].map((x) => f('eventName', x, 'EXACT')) } } });
    P('## 7. 사이트 전체 — 사기 · 샘플 · 채점 관련 이벤트'); P('| 이벤트 | 횟수 | 사람 |'); P('|---|---|---|');
    for (const r of app) P(`| ${r[0]} | ${n0(r[1])} | ${n0(r[2])} |`); P();
  } catch (e) { P('- 7번 못 받음: ' + e.message); }
}
main().then(() => console.log(out.join('\n'))).catch((e) => { console.log(out.join('\n')); console.log('\n멈춤: ' + e.message); process.exitCode = 1; });
