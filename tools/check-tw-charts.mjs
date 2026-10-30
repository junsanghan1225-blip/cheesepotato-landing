// 53번 자료 50개가 모두 그래프로 바뀌고, 줄글의 숫자가 그래프에 빠짐없이 들어 있는지 본다(책 PDF 의 그래프). 그림 모양 20가지를 모두 돌려 본다.
import { parseTwData, twChartSvg } from './lib/tw-chart.mjs';
const { TW_ITEMS } = await import('../topik-writing.js');
const bad = [];
for (const x of TW_ITEMS.filter((t) => t.q === 53)) {
  const p = parseTwData(x.data);
  if (!p) { bad.push(`${x.id}: 자료 줄글을 그래프로 읽지 못함`); continue; }
  const nums = (x.data.slice(1).join(' ').replace(/\d위/g, '').match(/\d[\d,.]*/g) || []).map((s) => s.replace(/[.,]+$/, ''));
  for (let v = 0; v < 20; v++) {
    const txt = (twChartSvg(p, { variant: v }).match(/>([^<]+)</g) || []).join(' ');
    const miss = nums.filter((n) => !txt.includes(n));
    if (miss.length) { bad.push(`${x.id} 모양 ${v}: 그래프에 없는 숫자 ${miss.join(', ')}`); break; }
  }
}
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log('쓰기 53번 그래프 검사 통과 — 50개 × 20가지 모양');
