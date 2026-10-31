// TOPIK 쓰기 53번 「자료」 줄글(topik-writing.js 의 data) → 시험지 같은 그래프(SVG, 칸 나뉜 도표).
// 숫자는 줄글에 있는 것만 쓴다. 읽지 못한 줄이 있으면 null — 호출한 쪽이 예전 목록으로 되돌린다.
// 문항마다 모양이 달라지게 variant(번호)로 「변화」 그림 3가지 × 「원인」 그림 4가지를 돌려 쓴다(운영자 2026-10-30 「토픽 스타일로 다양하게 · 너무 일차원적」).
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

const wrap = (s, n) => { const out = []; let cur = ''; for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; };
const F = "font-family:Pretendard Variable,Pretendard,sans-serif";
const T = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'start'}" style="${F};font-size:${o.s || 10.5}px;font-weight:${o.w || 500};fill:${o.c || '#2a2622'}">${esc(t)}</text>`;

// 칸(제목 띠 + 테두리 상자) — 시험지 도표처럼
const panel = (x, y, w, h, title, acc, body) => `<rect x="${x}" y="${y + 11}" width="${w}" height="${h - 11}" rx="9" fill="#fff" stroke="#6e6a82" stroke-width="1.1"/><rect x="${x + 22}" y="${y}" width="${w - 44}" height="23" rx="11.5" fill="${acc}"/>${T(x + w / 2, y + 16, title, { a: 'middle', s: 11.5, w: 800, c: '#fff' })}${body}`;
/* 곡선 화살표: 가는 선 + 끝 방향에 맞춘 삼각 화살촉(운영자 2026-10-31 「화살표가 너무 뭉툭」) */
const head = (x, y, dx, dy, c, size = 9) => { const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux; return `<path d="M${x} ${y} L${x - ux * size + px * size * 0.55} ${y - uy * size + py * size * 0.55} L${x - ux * size - px * size * 0.55} ${y - uy * size - py * size * 0.55} Z" fill="${c}"/>`; };
const arrow = (x1, y1, x2, y2, bend, acc) => { const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - bend, c = '#8f84c4'; return `<path d="M${x1} ${y1} Q${mx} ${my} ${x2 - (x2 - mx) * 0.06} ${y2 - (y2 - my) * 0.06}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>${head(x2, y2, x2 - mx, y2 - my, c)}`; };
const pill = (x, y, t, acc) => { const w = Math.max(50, t.length * 8.4 + 18); return `<rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="22" rx="11" fill="#fff" stroke="${acc}" stroke-width="1.4"/>${T(x, y + 3, t, { a: 'middle', s: 11, w: 800, c: acc })}`; };

function changePanel(c, kind, acc, X, Y, W, H) {
  const mx = Math.max(c.v1, c.v2), base = Y + H - 34, top = Y + 106, span = base - top;
  const h1 = Math.max(10, (c.v1 / mx) * span), h2 = Math.max(10, (c.v2 / mx) * span);
  const xa = X + W * 0.3, xb = X + W * 0.72, note = c.note || '';
  let b = '';
  if (kind === 0) { // 꺾은선 + 화살표
    b += `<line x1="${X + 22}" y1="${base}" x2="${X + W - 16}" y2="${base}" stroke="#8e8aa0" stroke-width="1.1"/>`;
    b += `<line x1="${xa}" y1="${base - h1}" x2="${xa}" y2="${base}" stroke="#8e8aa0" stroke-dasharray="3 3"/><line x1="${xb}" y1="${base - h2}" x2="${xb}" y2="${base}" stroke="#8e8aa0" stroke-dasharray="3 3"/>`;
    b += `<path d="M${xa} ${base - h1} L${xb} ${base - h2}" stroke="#4a4560" stroke-width="2.2"/><circle cx="${xa}" cy="${base - h1}" r="4.6" fill="#8e8aa0"/><circle cx="${xb}" cy="${base - h2}" r="4.6" fill="#8e8aa0"/>`;
    b += arrow(xa + 6, base - h1 - 16, xb - 10, base - h2 - 16, 26, acc);
    b += T(xa, base - h1 - 24, c.t1, { a: 'middle', s: 12, w: 800 }) + T(xb, base - h2 - 24, c.t2, { a: 'middle', s: 12, w: 800 });
  } else if (kind === 1) { // 세로 막대 + 화살표
    b += `<line x1="${X + 22}" y1="${base}" x2="${X + W - 16}" y2="${base}" stroke="#8e8aa0" stroke-width="1.1"/>`;
    b += `<rect x="${xa - 24}" y="${base - h1}" width="48" height="${h1}" fill="#b9b2c9"/><rect x="${xb - 24}" y="${base - h2}" width="48" height="${h2}" fill="${acc}"/>`;
    b += arrow(xa + 6, base - h1 - 18, xb - 8, base - h2 - 18, 24, acc);
    b += T(xa, base - h1 - 24, c.t1, { a: 'middle', s: 12, w: 800 }) + T(xb, base - h2 - 24, c.t2, { a: 'middle', s: 12, w: 800 });
  } else if (kind === 3) { // 가로 묶음 막대 — 두 해를 범례로(시험지의 남 · 여 막대처럼)
    const x0 = X + 30, bwMax = W - 110, y1 = Y + 70, bh = 26;
    const w1 = Math.max(8, (c.v1 / mx) * bwMax), w2 = Math.max(8, (c.v2 / mx) * bwMax);
    b += `<line x1="${x0}" y1="${Y + 56}" x2="${x0}" y2="${Y + H - 52}" stroke="#4a4560" stroke-width="1.4"/>`;
    b += `<rect x="${x0}" y="${y1}" width="${w1}" height="${bh}" fill="#b9b2c9"/>${T(x0 + w1 + 6, y1 + 18, c.t1, { s: 12, w: 800 })}`;
    b += `<rect x="${x0}" y="${y1 + bh + 6}" width="${w2}" height="${bh}" fill="${acc}"/>${T(x0 + w2 + 6, y1 + bh + 6 + 18, c.t2, { s: 12, w: 800 })}`;
    b += `<rect x="${X + W - 98}" y="${Y + H - 50}" width="84" height="38" rx="3" fill="#fff" stroke="#8e8aa0"/><rect x="${X + W - 90}" y="${Y + H - 43}" width="10" height="10" fill="${acc}"/>${T(X + W - 74, Y + H - 34, `${c.y2}년`, { s: 10.2 })}<rect x="${X + W - 90}" y="${Y + H - 27}" width="10" height="10" fill="#b9b2c9"/>${T(X + W - 74, Y + H - 18, `${c.y1}년`, { s: 10.2 })}`;
    if (note) b += pill(X + W / 2, Y + 44, note, acc);
    return panel(X, Y, W, H, c.label + (c.sub ? ` · ${c.sub}` : ''), acc, b);
  } else { // 원(면적 비교)
    const r1 = 16 + 30 * Math.sqrt(c.v1 / mx), r2 = 16 + 30 * Math.sqrt(c.v2 / mx), cy = Y + 112;
    b += `<circle cx="${xa}" cy="${cy}" r="${r1}" fill="#e6e1ef" stroke="#8e8aa0" stroke-width="1.2"/><circle cx="${xb}" cy="${cy}" r="${r2}" fill="${acc}"/>`;
    b += T(xa, cy + 4, c.t1, { a: 'middle', s: 12, w: 800 }) + T(xb, cy + 4, c.t2, { a: 'middle', s: 12, w: 800, c: '#fff' });
    b += `<path d="M${xa + r1 + 6} ${cy} L${xb - r2 - 10} ${cy}" stroke="#8f84c4" stroke-width="3" stroke-linecap="round"/>${head(xb - r2 - 3, cy, 1, 0, '#8f84c4')}`;
  }
  b += T(xa, base + 17, `${c.y1}년`, { a: 'middle', s: 11, w: 700 }) + T(xb, base + 17, `${c.y2}년`, { a: 'middle', s: 11, w: 700 });
  if (note) b += pill(X + W / 2, Y + 46, note, acc);
  return panel(X, Y, W, H, c.label + (c.sub ? ` · ${c.sub}` : ''), acc, b);
}

const SHADES = (acc) => [acc, '#7d70b5', '#b5accf', '#d8d3e8'];
function causeBody(g, kind, acc, X, Y, W, compact = false) {
  const items = g.items, mx = Math.max(...items.map((i) => i.pct)), sh = SHADES(acc), sum = items.reduce((a, i) => a + i.pct, 0);
  let k = kind;
  if (k === 1 && !(items.length >= 3 && sum <= 100)) k = 0;   // 원그래프는 전체 100% 이내일 때만
  if (k === 3 && !(items.length >= 2 && sum <= 100)) k = 2;
  let b = '', y = Y + 36;
  if (k === 4) { // 순위 표(시험지의 표 칸처럼)
    const cw = g.ranked ? 40 : 0, tx = X + 14, tw = W - 28;
    items.forEach((it, i) => { const ln = wrap(it.label, compact ? 22 : 14), h = Math.max(compact ? 24 : 30, ln.length * 13 + (compact ? 6 : 10));
      b += `<rect x="${tx}" y="${y}" width="${tw}" height="${h}" fill="${i === 0 ? '#f4f1fa' : '#fff'}" stroke="#8e8aa0"/>`;
      if (g.ranked) b += `<line x1="${tx + cw}" y1="${y}" x2="${tx + cw}" y2="${y + h}" stroke="#8e8aa0"/>` + T(tx + cw / 2, y + h / 2 + 4, `${i + 1}위`, { a: 'middle', s: 11, w: 800, c: acc });
      b += `<line x1="${tx + tw - 52}" y1="${y}" x2="${tx + tw - 52}" y2="${y + h}" stroke="#8e8aa0"/>` + ln.map((l, j) => T(tx + cw + (tw - cw - 52) / 2, y + h / 2 - (ln.length - 1) * 6.5 + 4 + j * 13, l, { a: 'middle', s: 10.5 })).join('') + T(tx + tw - 26, y + h / 2 + 4, `${it.pct}%`, { a: 'middle', s: 11.5, w: 800 });
      y += h; });
    y += 6;
  } else if (k === 0) { // 가로 막대 + 순위 동그라미
    items.forEach((it, i) => {
      const ln = wrap(it.label, compact ? 18 : 11), h = Math.max(compact ? 22 : 30, ln.length * 13 + 8), w = Math.max(10, (it.pct / mx) * 96);
      b += g.ranked ? `<circle cx="${X + 18}" cy="${y + h / 2}" r="9" fill="${i === 0 ? acc : '#8e8aa0'}"/>${T(X + 18, y + h / 2 + 4, i + 1, { a: 'middle', s: 10.5, w: 800, c: '#fff' })}` : '';
      b += ln.map((l, j) => T(X + (g.ranked ? 34 : 14), y + h / 2 - (ln.length - 1) * 6.5 + 4 + j * 13, l, { s: 10.5 })).join('');
      b += `<rect x="${X + 150}" y="${y + h / 2 - 8}" width="${w}" height="16" rx="2" fill="${i === 0 ? acc : '#b9b2c9'}"/>` + T(X + 150 + w + 6, y + h / 2 + 4, `${it.pct}%`, { s: 11.5, w: 800 });
      y += h + 2;
    });
  } else if (k === 1) { // 원그래프 + 범례
    const cx = X + 62, cy = y + 52, r = 44; let a0 = -Math.PI / 2;
    items.forEach((it, i) => { const a1 = a0 + (it.pct / 100) * Math.PI * 2, lg = a1 - a0 > Math.PI ? 1 : 0; b += `<path d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${lg} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z" fill="${sh[i % 4]}" stroke="#fff" stroke-width="1.5"/>`; a0 = a1; });
    if (sum < 100) b += `<path d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${(a0 + Math.PI / 2) > Math.PI ? 0 : 1} 1 ${cx} ${cy - r} Z" fill="#eeeaf5" stroke="#fff" stroke-width="1.5"/>`;
    b += `<circle cx="${cx}" cy="${cy}" r="18" fill="#fff"/>`;
    let ly = y + 6; items.forEach((it, i) => { const ln = wrap(it.label, 11); b += `<rect x="${X + 126}" y="${ly}" width="11" height="11" fill="${sh[i % 4]}"/>` + ln.map((l, j) => T(X + 142, ly + 9 + j * 12.5, l, { s: 10.2 })).join('') + T(X + 142, ly + 9 + ln.length * 12.5, `${it.pct}%`, { s: 11, w: 800 }); ly += ln.length * 12.5 + 20; });
    y = Math.max(cy + r + 14, ly);
  } else if (k === 2) { // 세로 막대
    const bw = Math.min(56, (W - 40) / items.length - 18), base = y + 82, gap = (W - 20) / items.length;
    items.forEach((it, i) => { const hh = Math.max(8, (it.pct / mx) * 66), cx = X + 10 + gap * (i + 0.5), ln = wrap(it.label, 9);
      b += `<rect x="${cx - bw / 2}" y="${base - hh}" width="${bw}" height="${hh}" fill="${i === 0 ? acc : '#b9b2c9'}"/>` + T(cx, base - hh - 5, `${it.pct}%`, { a: 'middle', s: 11.5, w: 800 }) + ln.map((l, j) => T(cx, base + 14 + j * 12, l, { a: 'middle', s: 9.6 })).join('');
    });
    b += `<line x1="${X + 12}" y1="${base}" x2="${X + W - 12}" y2="${base}" stroke="#8e8aa0"/>`;
    y = base + 14 + Math.max(...items.map((i) => wrap(i.label, 9).length)) * 12 + 6;
  } else { // 띠그래프(한 줄 쌓은 막대) + 범례
    const bx = X + 14, bw2 = W - 28; let xx = bx;
    items.forEach((it, i) => { const w = (it.pct / 100) * bw2; b += `<rect x="${xx}" y="${y + 4}" width="${w}" height="26" fill="${sh[i % 4]}" stroke="#fff"/>` + T(xx + w / 2, y + 22, `${it.pct}%`, { a: 'middle', s: 11, w: 800, c: i < 2 ? '#fff' : '#2a2622' }); xx += w; });
    if (sum < 100) b += `<rect x="${xx}" y="${y + 4}" width="${bx + bw2 - xx}" height="26" fill="#eeeaf5" stroke="#fff"/>`;
    y += 44; items.forEach((it, i) => { const ln = wrap(it.label, 24); b += `<rect x="${X + 14}" y="${y}" width="11" height="11" fill="${sh[i % 4]}"/>` + T(X + 32, y + 9, ln.join(' '), { s: 10.2 }); y += 18; });
  }
  return { b, h: y - Y + 8 };
}

export function twChartSvg(p, { acc = '#4a2c8a', tint = '#efecf6', variant = 0 } = {}) {
  const W = 560, PL = 232, PR = 316, gap = 12, c = p.change;
  const ck = variant % 4, multi = p.groups.length > 1, rk = multi ? (variant % 5 === 4 ? 4 : 0) : variant % 5;   // 칸이 둘이면 작게(한 쪽에 안 들어가는 것을 막는다)
  // 오른쪽 칸들(원인 · 이유 …)
  let y = 0; const right = [];
  for (const g of p.groups) {
    const r = causeBody(g, rk, acc, PL + gap, y, PR, multi);
    const h = Math.max(r.h + 4, multi ? 78 : 96);
    right.push({ g, r, y, h }); y += h + 10;
  }
  const H = Math.max(y - 10, multi ? 180 : 210);
  const rp = right.map(({ g, y: yy, h }) => { const rr = causeBody(g, rk, acc, PL + gap, yy, PR, multi); return panel(PL + gap, yy, PR, h, g.head || '이유', acc, rr.b); }).join('');
  const lp = changePanel(c, ck, acc, 0, 0, PL, H);
  // 위쪽 안내(● 조사 기관 / ● 조사 대상) + 바깥 틀
  const info = p.meta.split(' · ').map((m) => m.replace(/:\s*/, ' : ')), HI = 12 + info.length * 19;
  const top = info.map((t, i) => `<circle cx="9" cy="${14 + i * 19}" r="3.6" fill="#4a4560"/>${T(19, 18 + i * 19, t, { s: 11, w: 600 })}`).join('');
  const tall = HI + H + 14;
  return `<div class="twc" style="background:#fff;border:.25mm solid #c9c2d8;border-radius:1.4mm;padding:2.4mm 2.6mm;box-sizing:border-box;max-width:142mm;margin:0 0 3mm;break-inside:avoid"><svg viewBox="0 0 ${W + 16} ${tall}" role="img" aria-label="${esc(c.label)}" style="display:block;width:100%;height:auto;aspect-ratio:${W + 16}/${tall}"><rect x="1" y="1" width="${W + 14}" height="${tall - 2}" rx="5" fill="#fafafa" stroke="#4a4560" stroke-width="1.2"/><g transform="translate(8,6)">${top}</g><g transform="translate(8,${HI + 2})">${lp}${rp}</g></svg></div>`;
}
