// TOPIK 쓰기 53번 「자료」 줄글(topik-writing.js 의 data) → 그래프(SVG).
// 숫자는 줄글에 있는 것만 쓴다. 읽지 못한 줄이 있으면 null — 호출한 쪽이 예전 목록으로 되돌린다(운영자 2026-10-30 「그래프 다 넣을 거야」).
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = (s) => Number(String(s).replace(/,/g, ''));
const ITEM = /^(?:\d위:\s*)?(.*?)\s*\(?(\d+(?:\.\d+)?)\s*%\)?$/;

export function parseTwData(data) {
  if (!Array.isArray(data) || data.length < 3) return null;
  const meta = data[0];
  const ch = /^(.*?)\s*:\s*(.*?)(\d{4})년\s*(?:평균\s*)?([\d.,]+)\s*([^\s→]*(?:\s(?:명|원|가구))?)\s*→\s*(\d{4})년\s*(?:평균\s*)?([\d.,]+)\s*([^\s(),]*(?:\s(?:명|원|가구))?)\s*(?:[(,]\s*(.*?))?\)?$/.exec(data[1]);
  if (!ch) return null;
  const unit = ch[8] || ch[5] || '';
  const change = { label: ch[1], sub: ch[2].replace(/[(\s]+$/, ''), y1: ch[3], v1: num(ch[4]), t1: ch[4] + (ch[5] || ''), y2: ch[6], v2: num(ch[7]), t2: ch[7] + unit, note: (ch[9] || '').replace(/[)\s]+$/, '') };
  if (!(change.v1 > 0 && change.v2 > 0)) return null;
  const groups = [];
  for (const line of data.slice(2)) {
    const m = /^(.*?)\s*(?:\d위)?\s*:\s*(.*)$/.exec(line);
    if (!m) return null;
    const head = m[1].trim(), body = m[2].trim();
    let g = head ? null : groups[groups.length - 1];
    if (!g) { g = { head: head || '', items: [], ranked: false }; groups.push(g); }
    if (/\d위/.test(line)) g.ranked = true;
    const parts = body.split(/\s*·\s*(?=\d위:)|,\s*(?=[^\d])/);
    for (const p of parts) { const it = ITEM.exec(p.trim()); if (!it) return null; g.items.push({ label: it[1].replace(/^\d위:\s*/, '').trim(), pct: Number(it[2]) }); }
  }
  if (!groups.length || groups.some((g) => !g.items.length)) return null;
  return { meta, change, groups };
}

// 한 줄에 열 글자쯤 — 긴 이름은 두 줄로 접는다
const wrap = (s, n) => { const out = []; let cur = ''; for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; };

export function twChartSvg(p, { acc = '#4a2c8a', tint = '#efecf6' } = {}) {
  const W = 520, f = "font-family:Pretendard Variable,Pretendard,sans-serif";
  const c = p.change, mx = Math.max(c.v1, c.v2);
  let y = 6, out = [];
  // 변화: 두 해 막대
  out.push(`<text x="0" y="${y + 11}" style="${f};font-size:11.5px;font-weight:800;fill:#1d1a17">${esc(c.label)}${c.sub ? ` · ${esc(c.sub)}` : ''}</text>`);
  y += 20;
  [[c.y1, c.t1, c.v1], [c.y2, c.t2, c.v2]].forEach(([yr, t, v], i) => {
    const w = Math.max(6, Math.round((v / mx) * 290));
    out.push(`<text x="0" y="${y + 13}" style="${f};font-size:11px;fill:#5a5348">${yr}년</text><rect x="46" y="${y}" width="${w}" height="18" rx="2" fill="${i ? acc : '#b9b2c9'}"/><text x="${46 + w + 6}" y="${y + 13}" style="${f};font-size:11.5px;font-weight:800;fill:#1d1a17">${esc(t)}</text>`);
    y += 25;
  });
  if (c.note) { out.push(`<text x="46" y="${y + 9}" style="${f};font-size:10px;fill:#5a5348">${esc(c.note)}</text>`); y += 18; }
  y += 8;
  // 순위 · 비율 묶음
  for (const g of p.groups) {
    const pm = Math.max(...g.items.map((i) => i.pct));
    if (g.head) { out.push(`<text x="0" y="${y + 11}" style="${f};font-size:11.5px;font-weight:800;fill:#1d1a17">${esc(g.head)}</text>`); y += 19; }
    g.items.forEach((it, k) => {
      const lines = wrap(it.label, 17), h = Math.max(18, lines.length * 13 + 2), w = Math.max(6, Math.round((it.pct / pm) * 230));
      out.push(`<text x="0" y="${y + 12}" style="${f};font-size:10.5px;font-weight:800;fill:${acc}">${g.ranked ? `${k + 1}위` : ''}</text>${lines.map((ln, j) => `<text x="${g.ranked ? 30 : 0}" y="${y + 12 + j * 13}" style="${f};font-size:10.5px;fill:#2a2622">${esc(ln)}</text>`).join('')}<rect x="190" y="${y + 1}" width="${w}" height="16" rx="2" fill="${k === 0 ? acc : '#b9b2c9'}"/><text x="${190 + w + 6}" y="${y + 13}" style="${f};font-size:11px;font-weight:800;fill:#1d1a17">${it.pct}%</text>`);
      y += h + 5;
    });
    y += 6;
  }
  const H = y + 4;
  // 바깥 상자에서 꾸미고 svg 는 가로 · 세로 비율을 분명히 준다(비율이 없으면 인쇄 때 높이를 못 재서 쪽 나눔이 틀어진다)
  return `<div class="twc" style="background:${tint};border:.25mm solid #c9c2d8;border-radius:1.4mm;padding:3mm 4mm;box-sizing:border-box;max-width:128mm;margin:0 0 3mm;break-inside:avoid"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.label)}" style="display:block;width:100%;height:auto;aspect-ratio:${W}/${H}">${out.join('')}</svg></div>`;
}
