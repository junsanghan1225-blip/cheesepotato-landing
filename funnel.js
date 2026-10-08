/* 치즈감자 숫자 판 — admin_funnel()(db/add_funnel.sql)이 돌려준 숫자를 그린다. 운영자 메일로 로그인했을 때만 숫자가 온다.
   사이트에서 로그인한 세션을 같이 쓴다(같은 주소라 저장 칸이 같다). 단계 이름 · 차례는 app.module.js FN_STEP 과 맞춘다. */
import { createClient } from './vendor/supabase-js.js';

const sb = createClient('https://tjgoevtvobvmlyefgxel.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

const STEPS = [
  ['visit', '방문', '사이트(앱 화면)를 연 기기'],
  ['learn', '공부 시작', '레슨 · 단어 · 오늘 공부 · 게임 · TOPIK 한 문제'],
  ['lt_done', '레벨테스트 끝', '끝까지 푼 사람'],
  ['signup', '가입', '이 기기에서 새로 가입'],
  ['topik', 'TOPIK 연습', '유형 연습 한 문제라도'],
  ['mock', '모의고사 시작', '미리 보기 말고 진짜 시작'],
  ['pro_view', '가격 화면', 'Pro 안내를 본 사람'],
  ['checkout', '결제 시작', '결제 쪽으로 넘어감'],
  ['paid', '결제 완료', '결제하고 돌아옴'],
];
const SRC = {
  chatgpt: 'ChatGPT', ai_other: '다른 AI', google: '구글', naver: '네이버', search_other: '다른 검색', instagram: '인스타 · 스레드',
  video: '유튜브 · 틱톡', hub: 'TOPIK 모음 쪽', site: '우리 사이트 쪽', other: '그 밖', direct: '바로 · 북마크',
};

let days = 28;

async function load() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    $('who').textContent = '로그인 안 됨';
    $('out').innerHTML = '<p class="msg">everykoreans.com 에서 운영자 메일로 로그인한 뒤 이 쪽을 새로 고쳐 주세요.</p>';
    return;
  }
  $('who').textContent = `로그인: ${session.user.email}`;
  $('out').innerHTML = '<p class="msg">불러오는 중…</p>';
  const { data, error } = await sb.rpc('admin_funnel', { p_days: days });
  if (error) {
    const m = String(error.message || '');
    $('out').innerHTML = `<p class="msg">${/operator only/.test(m) ? '운영자 메일로 로그인해야 볼 수 있어요.'
      : /admin_funnel|does not exist|schema cache/.test(m) ? '아직 준비가 안 됐어요 — Supabase SQL Editor 에서 <b>db/add_funnel.sql</b> 을 한 번 돌려 주세요.'
      : '숫자를 못 불러왔어요: ' + esc(m)}</p>`;
    return;
  }
  draw(data);
}

function draw(d) {
  const st = d.steps || {}, sv = d.server || {};
  const visit = st.visit || 0;
  /* 단계 막대 — 길이 · 작은 글씨 모두 방문 대비(단계가 한 줄로 이어지지 않는다 — TOPIK 연습은 레벨테스트 없이도 한다).
     「가장 많이 떠나는 곳」은 큰 줄기(방문 → 공부 → 가입 → 가격 화면 → 결제 시작 → 결제)에서만 찾는다 */
  const rows = STEPS.map(([k, name, help], i) => ({ k, name, help, n: st[k] || 0, i }));
  const MAIN = ['visit', 'learn', 'signup', 'pro_view', 'checkout', 'paid'];
  let worst = null;
  for (let j = 1; j < MAIN.length; j++) {
    const a = st[MAIN[j - 1]] || 0, n = st[MAIN[j]] || 0;
    if (a >= 5 && (!worst || pct(n, a) < worst.rate)) worst = { from: MAIN[j - 1], k: MAIN[j], rate: pct(n, a) };
  }
  const nameOf = (k) => STEPS.find((x) => x[0] === k)[1];
  const fn = rows.map((r) => `<li class="${worst && worst.k === r.k ? 'drop' : ''}"><span class="lab">${esc(r.name)}<small>${esc(r.help)}</small></span>` +
    `<span class="tr"><i style="width:${visit ? Math.max(0.5, pct(r.n, visit)) : 0}%"></i></span>` +
    `<span class="num">${fmt(r.n)}<small>${r.i ? `방문의 ${pct(r.n, visit)}%` : '기준'}</small></span></li>`).join('');

  const learn = st.learn || 0, signup = st.signup || 0, paid = st.paid || 0;
  const notes = [];
  if (!visit) notes.push('아직 쌓인 숫자가 없어요. SQL 을 돌린 뒤부터 쌓이기 시작해요 — 하루 이틀 뒤에 다시 보세요.');
  else {
    notes.push(`방문한 사람 100명 중 <b>${pct(learn, visit)}명</b>이 공부를 시작하고, <b>${pct(signup, visit)}명</b>이 가입하고, <b>${pct(paid, visit)}명</b>이 결제했어요.`);
    if (worst) notes.push(`가장 많이 떠나는 곳: <b>${esc(nameOf(worst.from))} → ${esc(nameOf(worst.k))}</b> (${worst.rate}% 만 넘어감). 여기를 먼저 고치면 효과가 커요.`);
  }

  const src = (d.by_src || []).map((r) => `<tr><td>${esc(SRC[r.src] || r.src)}</td><td>${fmt(r.visit)}</td>` +
    `<td>${fmt(r.learn)} <small>(${pct(r.learn, r.visit)}%)</small></td><td>${fmt(r.signup)} <small>(${pct(r.signup, r.visit)}%)</small></td>` +
    `<td>${fmt(r.pro_view)}</td><td>${fmt(r.paid)}</td></tr>`).join('');

  const dl = d.daily || [], top = Math.max(1, ...dl.map((x) => x.visit || 0));
  const bars = dl.map((x) => `<div title="${esc(x.day)} — 방문 ${x.visit} · 공부 ${x.learn} · 가입 ${x.signup} · 결제 ${x.paid}">` +
    `<i style="height:${((x.visit - x.learn) / top) * 100}%"></i><i class="s" style="height:${(x.learn / top) * 100}%"></i></div>`).join('');

  $('out').innerHTML =
    `<div class="tiles">` +
      `<div class="tile"><span>방문 기기</span><b>${fmt(visit)}</b><small>지난 ${days}일 · 앱 화면 기준</small></div>` +
      `<div class="tile"><span>새 가입</span><b>${fmt(sv.signups)}</b><small>서버 기준 · 모두 ${fmt(sv.users_total)}명</small></div>` +
      `<div class="tile"><span>지금 Pro</span><b>${fmt(sv.pro_now)}</b><small>결제한 사람(체험 ${fmt(sv.trial_now)} 포함)</small></div>` +
      `<div class="tile"><span>레벨테스트 저장</span><b>${fmt(sv.lt_saved)}</b><small>로그인하고 끝낸 것</small></div>` +
    `</div>` +
    `<section class="card"><h2>단계마다 몇 명이 넘어가나</h2><p class="sub">${esc(d.from)} 부터 · 같은 기기는 하루에 한 번만 셉니다 · 막대와 % 는 방문 대비</p>` +
      `<ul class="fn">${fn}</ul><div class="note">${notes.join('<br>')}</div></section>` +
    `<section class="card"><h2>어디서 왔나 — 들어온 곳마다</h2><p class="sub">어디서 온 사람이 공부 · 가입까지 가는지. 괄호는 그 곳 방문 대비</p>` +
      `<div class="tblw"><table><thead><tr><th>들어온 곳</th><th>방문</th><th>공부 시작</th><th>가입</th><th>가격 화면</th><th>결제</th></tr></thead>` +
      `<tbody>${src || '<tr><td colspan="6">아직 없어요</td></tr>'}</tbody></table></div></section>` +
    `<section class="card"><h2>날마다</h2><p class="sub">막대 = 방문, 아래 초록 = 그중 공부를 시작한 기기</p>` +
      `<div class="days">${bars}</div>` +
      `<div class="dlab"><span>${esc(dl[0]?.day || '')}</span><span>${esc(dl[dl.length - 1]?.day || '')}</span></div>` +
      `<div class="key"><span>방문만</span><span class="s">공부 시작</span></div></section>` +
    `<p class="sub">· 결제 · 가입 타일은 서버 숫자라 가장 정확해요. 단계 막대는 앱 화면에서 센 것이라, 사전 · 문항 쪽만 보고 나간 방문은 GA 에만 있어요.<br>` +
    `· 운영자 본인 기기(운영자 메일로 로그인한 상태)는 세지 않아요.</p>`;
}

$('seg').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-d]'); if (!b) return;
  days = Number(b.dataset.d);
  $('seg').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  load();
});
load();
