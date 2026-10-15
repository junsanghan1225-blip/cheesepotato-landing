/* 치즈감자 문제 분석 — admin_answer_overview · admin_answer_item(db/add_answer_events.sql)이 돌려준 숫자를 그린다. 운영자 메일로 로그인했을 때만 숫자가 온다.
   섹션 · 꼬리표 · 기간을 누르면 숫자가 그 범위로 다시 계산되고, 표의 문제를 누르면 오른쪽에 그 문제의 보기 분포 · 하루별 · 걸린 시간 · 고칠 점이 열린다. */
import { createClient } from './vendor/supabase-js.js';

const sb = createClient('https://tjgoevtvobvmlyefgxel.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const sec = (ms) => (ms == null ? '—' : ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}초`);

const SEC = { all: '전체', lesson: '레슨', drill: '집중 훈련', topik_read: 'TOPIK 읽기', topik_listen: 'TOPIK 듣기', topik_write: 'TOPIK 쓰기', mock: '모의고사', leveltest: '레벨 테스트' };
const KIND = { choice: '고르기', listen: '듣기', cloze: '빈칸', type: '쓰기', order: '배열', build: '문장 만들기', translate: '번역', correct: '오류 찾기', conj: '활용 표', pair: '짝', speak: '말하기', ai: 'AI 채점' };
const TAGLAB = (t) => t.startsWith('g:') ? `문법 ${t.slice(2)}` : t.startsWith('k:') ? `종류 · ${KIND[t.slice(2)] || t.slice(2)}` : t;

let days = 28, fSec = 'all', fTag = null, data = null, sortKey = 'rate', sortDir = 1, q = '';

async function load() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    $('who').textContent = '로그인 안 됨';
    $('out').innerHTML = '<p class="msg">everykoreans.com 에서 운영자 메일로 로그인한 뒤 이 쪽을 새로 고쳐 주세요.</p>';
    return;
  }
  $('who').textContent = `로그인: ${session.user.email}`;
  $('out').innerHTML = '<p class="msg">불러오는 중…</p>';
  const { data: d, error } = await sb.rpc('admin_answer_overview', { p_days: days, p_sec: fSec === 'all' ? null : fSec, p_tag: fTag });
  if (error) {
    const m = String(error.message || '');
    $('out').innerHTML = `<p class="msg">${/operator only/.test(m) ? '운영자 메일로 로그인해야 볼 수 있어요.'
      : /admin_answer|does not exist|schema cache/.test(m) ? '아직 준비가 안 됐어요 — Supabase SQL Editor 에서 <b>db/add_answer_events.sql</b> 을 한 번 돌려 주세요.'
      : '숫자를 못 불러왔어요: ' + esc(m)}</p>`;
    return;
  }
  data = d; draw();
}

function chips() {
  $('secs').innerHTML = Object.entries(SEC).map(([k, v]) => `<button type="button" class="chip" data-s="${k}" aria-pressed="${k === fSec}">${v}</button>`).join('');
  $('tagbar').innerHTML = fTag ? `<button type="button" class="chip tag" data-clear="1">${esc(TAGLAB(fTag))} ✕</button>` : '';
}

function draw() {
  chips();
  const d = data, t = d.totals || {};
  const okRate = pct(t.ok, t.graded);
  const w = d.write || {};
  const tiles = `<div class="tiles">
    <div class="tile"><span>풀이 수</span><b>${fmt(t.n)}</b><small>${fmt(t.devices)}기기 · 로그인 ${fmt(t.users)}명</small></div>
    <div class="tile"><span>첫 답 맞힌 비율</span><b>${t.graded ? okRate + '%' : '—'}</b><small>채점된 ${fmt(t.graded)}개 중</small></div>
    <div class="tile"><span>평균 걸린 시간</span><b>${sec(t.ms)}</b><small>레슨 · 집중 훈련 문제만</small></div>
    <div class="tile"><span>TOPIK 쓰기 AI 점수</span><b>${w.n ? w.score : '—'}</b><small>${w.n ? `평균 / ${w.max}점 · ${fmt(w.n)}번` : '아직 없어요'}</small></div></div>`;
  const dayMax = Math.max(1, ...((d.by_day || []).map((x) => x.n)));
  const dayBars = (d.by_day || []).map((x) => `<div title="${x.day} · ${x.n}개 · 맞힘 ${pct(x.ok, x.graded)}%"><i style="height:${Math.round((x.n / dayMax) * 100)}%"><i class="s" style="height:${x.n ? Math.round((x.ok / x.n) * 100) : 0}%"></i></i></div>`).join('');
  const secRows = (d.by_sec || []).map((x) => `<li data-s="${x.sec}" title="눌러서 이 섹션만 보기"><span class="lab">${SEC[x.sec] || x.sec}<small>${fmt(x.devices)}기기${x.ms ? ' · ' + sec(x.ms) : ''}</small></span>
    <span class="tr"><i class="g" style="width:${pct(x.ok, x.n)}%"></i><i class="b" style="width:${x.graded ? Math.max(0, pct(x.graded - x.ok, x.n)) : 0}%"></i></span><span class="num">${fmt(x.n)}<small>${x.graded ? pct(x.ok, x.graded) + '% 맞힘' : '점수형'}</small></span></li>`).join('');
  const tagRows = (d.tags || []).slice(0, 14).map((x) => `<li data-t="${esc(x.tag)}" title="눌러서 이 꼬리표만 보기"><span class="lab">${esc(TAGLAB(x.tag))}</span>
    <span class="tr"><i class="g" style="width:${pct(x.ok, x.n)}%"></i><i class="b" style="width:${100 - pct(x.ok, x.n)}%"></i></span><span class="num">${100 - pct(x.ok, x.n)}%<small>${fmt(x.n)}번</small></span></li>`).join('');
  $('out').innerHTML = tiles +
    `<div class="grid2"><div class="card"><h2>하루별 풀이</h2><p class="sub">막대 높이 = 푼 수, 초록 = 맞힌 몫 · 막대에 마우스를 올리면 그날 숫자</p><div class="days">${dayBars || '<p class="msg">기록이 아직 없어요</p>'}</div>
      <div class="dlab"><span>${esc(String(d.from || ''))}</span><span>오늘</span></div></div>
     <div class="card"><h2>섹션별</h2><p class="sub">초록 맞힘 · 빨강 틀림. 눌러서 그 섹션만</p><ul class="rows">${secRows || '<li class="msg">—</li>'}</ul></div></div>` +
    `<div class="card"><h2>약한 꼬리표 (틀린 비율 높은 순)</h2><p class="sub">문법 · 문제 종류별. 눌러서 그 꼬리표의 문제만 아래 표에 · 5번 이상 풀린 것만</p><ul class="rows">${tagRows || '<li class="msg">아직 충분히 쌓이지 않았어요</li>'}</ul></div>` +
    `<div class="card"><div class="top"><div><h2>문제별 (틀린 비율 높은 순)</h2><p class="sub">3번 이상 풀린 문제. 머리글을 눌러 정렬 · 문제를 누르면 자세히</p></div><button type="button" class="btn" id="csv">CSV 내려받기</button></div>
      <div class="tblw"><table><thead><tr><th data-k="label">문제</th><th data-k="n">풀이</th><th data-k="rate">틀린 비율</th><th data-k="ms">시간</th><th data-k="devices">기기</th></tr></thead><tbody id="rows"></tbody></table></div></div>`;
  drawRows();
}

function rowsFor() {
  const items = (data.items || []).map((x) => ({ ...x, rate: 100 - pct(x.ok, x.n) }));
  const k = q.trim().toLowerCase();
  const list = k ? items.filter((x) => `${x.label || ''} ${x.item}`.toLowerCase().includes(k)) : items;
  const key = sortKey;
  return list.sort((a, b) => key === 'label' ? String(a.label || '').localeCompare(String(b.label || ''), 'ko') * sortDir : ((a[key] ?? -1) - (b[key] ?? -1)) * -sortDir || b.n - a.n);
}
function drawRows() {
  const list = rowsFor();
  document.querySelectorAll('th[data-k]').forEach((th) => th.classList.toggle('on', th.dataset.k === sortKey));
  $('rows').innerHTML = list.length ? list.map((x) => `<tr data-i="${esc(x.item)}"><td><span class="pill">${SEC[x.sec] || x.sec}</span><span class="pill">${KIND[x.kind] || x.kind || ''}</span>${esc(x.label || x.item)}</td>
    <td>${fmt(x.n)}</td><td class="${x.rate >= 60 ? 'hard' : x.rate <= 10 ? 'easy' : ''}">${x.rate}%</td><td>${sec(x.ms)}</td><td>${fmt(x.devices)}</td></tr>`).join('')
    : '<tr><td colspan="5" class="msg">조건에 맞는 문제가 없어요</td></tr>';
}

async function openItem(item) {
  $('shade').classList.add('on'); $('drawer').classList.add('on'); $('drawer').innerHTML = '<p class="msg">불러오는 중…</p>';
  const { data: d, error } = await sb.rpc('admin_answer_item', { p_item: item, p_days: Math.max(days, 90) });
  if (error) { $('drawer').innerHTML = `<button class="x" type="button" data-close="1">✕</button><p class="msg">${esc(error.message)}</p>`; return; }
  const n = d.n || 0, okn = d.ok || 0, miss = n - okn, rate = 100 - pct(okn, n);
  const picks = (d.picks || []).map((p) => `<div class="pick${p.is_ok ? ' ok' : ''}"><span title="${esc(p.pick)}">${esc(p.pick)}${p.is_ok ? ' ✓' : ''}</span><span class="tr"><i style="width:${pct(p.n, n)}%"></i></span><span>${pct(p.n, n)}%</span></div>`).join('');
  const wrong = (d.picks || []).filter((p) => !p.is_ok);
  const top = wrong[0], tips = [];
  if (n >= 10 && rate >= 70) tips.push('<b>너무 어려워요</b> — 틀린 비율 ' + rate + '%. 설명 블록 · 쉬운 문제 순서를 앞에 두거나 보기를 점검하세요.');
  if (top && miss >= 5 && top.n / miss >= 0.55) tips.push(`<b>틀린 답이 한 보기에 몰려요</b> — 「${esc(top.pick)}」(틀린 것의 ${pct(top.n, miss)}%). 그 보기가 실제로 맞는 말은 아닌지, 정답 설명이 그 실수를 짚는지 보세요.`);
  if (d.ms90 && d.ms90 > 60000) tips.push('<b>오래 걸려요</b> — 열에 아홉이 ' + sec(d.ms90) + ' 안에 못 풀어요. 문제가 길거나 헷갈립니다.');
  if (n >= 15 && rate <= 8) tips.push('<b>너무 쉬워요</b> — 거의 다 맞혀요. 이 문제는 줄이거나 더 어려운 것으로 바꿔도 돼요(빠르게 모드가 건너뛰는 종류).');
  if (!tips.length) tips.push('아직 뚜렷한 문제는 없어요. 풀이가 더 쌓이면 다시 보세요.');
  const spark = (d.by_day || []).map((x) => `<div title="${x.day} · ${x.n}개 · 틀림 ${100 - pct(x.ok, x.n)}%" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:60px"><i style="display:block;height:${Math.max(4, 100 - pct(x.ok, x.n))}%;background:var(--bad);opacity:.8;border-radius:2px"></i></div>`).join('');
  $('drawer').innerHTML = `<button class="x" type="button" data-close="1" aria-label="닫기">✕</button><span class="pill">${SEC[d.sec] || d.sec}</span><span class="pill">${KIND[d.kind] || d.kind || ''}</span>
    <h3>${esc(d.label || item)}</h3><p class="sub">정답: <b>${esc(d.ans || '—')}</b> · 문제 번호 ${esc(item)}</p>
    <div class="kv"><div><b>${fmt(n)}</b><span>풀이</span></div><div><b>${rate}%</b><span>틀린 비율</span></div><div><b>${sec(d.ms50)}</b><span>중간 시간</span></div></div>
    <div class="tips">${tips.map((x) => `<div>• ${x}</div>`).join('')}</div>
    <h2 style="font-size:15px">고른 보기</h2>${picks || '<p class="sub">보기를 고르는 문제가 아니에요</p>'}
    <h2 style="font-size:15px;margin-top:16px">하루별 틀린 비율</h2><div style="display:flex;gap:2px;align-items:flex-end">${spark}</div>
    <h2 style="font-size:15px;margin-top:16px">꼬리표(눌러서 거르기)</h2><div class="chips">${(d.tags || []).filter((t) => !t.startsWith('c:')).map((t) => `<button type="button" class="chip" data-t="${esc(t)}">${esc(TAGLAB(t))}</button>`).join('')}</div>`;
}
function closeItem() { $('shade').classList.remove('on'); $('drawer').classList.remove('on'); }

function csv() {
  const rows = [['문제', '섹션', '종류', '풀이', '틀린 비율(%)', '평균 시간(ms)', '기기', '문제 번호']].concat(rowsFor().map((x) => [x.label || '', SEC[x.sec] || x.sec, KIND[x.kind] || x.kind || '', x.n, x.rate, x.ms ?? '', x.devices, x.item]));
  const body = '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv;charset=utf-8' })); a.download = `문제분석_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
}

document.addEventListener('click', (ev) => {
  const t = ev.target;
  const dBtn = t.closest('#days button'); if (dBtn) { days = +dBtn.dataset.d; document.querySelectorAll('#days button').forEach((b) => b.setAttribute('aria-pressed', String(b === dBtn))); return load(); }
  if (t.closest('[data-close]') || t.closest('#shade')) return closeItem();
  const clr = t.closest('[data-clear]'); if (clr) { fTag = null; return load(); }
  const s = t.closest('[data-s]'); if (s) { fSec = s.dataset.s; closeItem(); return load(); }
  const tg = t.closest('[data-t]'); if (tg) { fTag = tg.dataset.t; closeItem(); return load(); }
  const th = t.closest('th[data-k]'); if (th) { const k = th.dataset.k; sortDir = sortKey === k ? -sortDir : 1; sortKey = k; return drawRows(); }
  if (t.closest('#csv')) return csv();
  const tr = t.closest('tr[data-i]'); if (tr) return openItem(tr.dataset.i);
});
$('q').addEventListener('input', (e) => { q = e.target.value; if (data) drawRows(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeItem(); });
load();
