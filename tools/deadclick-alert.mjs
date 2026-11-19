// 데드클릭 알림 — 오늘(한국 날짜) GA4 dead_click 을 요소별로 세어, 기준(기본 5회) 넘는 것을 표로 만든다.
// 환경: GOOGLE_SA_KEY · GA_PROPERTY_ID (analytics-daily 와 같은 값), 선택 DEAD_MIN(기본 5), 출력 파일은 첫 인자.
// 사용: node tools/deadclick-alert.mjs out.md  → 기준 넘는 요소가 있으면 out.md 를 쓰고 "hits=N" 출력, 없으면 hits=0.
// ponytail: GA4 일반 보고서라 몇 시간 늦다(실시간 API 는 맞춤 측정기준을 못 씀). 더 빨라야 하면 Clarity 쪽으로.
import crypto from 'node:crypto';
import fs from 'node:fs';

const key = JSON.parse(process.env.GOOGLE_SA_KEY || '{}');
if (!key.client_email || !key.private_key) throw new Error('GOOGLE_SA_KEY 가 비어 있어요.');
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: key.client_email, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3000, scope: 'https://www.googleapis.com/auth/analytics.readonly' });
const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }) })).json();
if (!t.access_token) throw new Error('토큰을 못 받았어요: ' + JSON.stringify(t));

const r = await (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA_PROPERTY_ID}:runReport`, {
  method: 'POST', headers: { authorization: 'Bearer ' + t.access_token, 'content-type': 'application/json' },
  body: JSON.stringify({ dateRanges: [{ startDate: 'today', endDate: 'today' }], dimensions: [{ name: 'customEvent:cp_el' }, { name: 'customEvent:cp_page' }], metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'dead_click' } } }, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 50 }) })).json();
if (r.error) throw new Error('GA4: ' + r.error.message);

const min = Number(process.env.DEAD_MIN || 5);
const rows = (r.rows || []).map((x) => [x.dimensionValues[0].value, x.dimensionValues[1].value, Number(x.metricValues[0].value)]).filter((x) => x[2] >= min);
if (rows.length) {
  const md = ['오늘(한국 날짜) 눌렀는데 반응이 없는 요소 — 같은 요소가 **' + min + '회 이상**입니다.', '', '| 요소(cp_el) | 쪽(cp_page) | 횟수 |', '|---|---|---|',
    ...rows.map((x) => `| \`${x[0]}\` | ${x[1]} | ${x[2]} |`), '', '원인 후보: 눌러 보이는데 동작이 없는 상자 · 소리만 나는 단추(`data-say` 로 제외) · 느린 응답. Clarity 에서 `deadclick` 딱지로 녹화를 보세요.'].join('\n');
  fs.writeFileSync(process.argv[2] || 'deadclick.md', md);
}
console.log('hits=' + rows.length);
