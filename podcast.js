/* 팟캐스트 올리기 — 녹음 파일 + 저절로 만든 표지 → Supabase 저장 칸 podcast · 표 podcast_queue(운영자만). 순서는 docs/ops/podcast-auto.md.
   에피소드 목록은 podcast-episodes.json(tools/build-podcast.mjs 가 대본에서 만든다). 사이트에서 로그인한 세션을 같이 쓴다. */
import { createClient } from './vendor/supabase-js.js';

const SB = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const sb = createClient(SB,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });

const $ = (id) => document.getElementById(id);
const MAX = 50 * 1048576;
let EPS = [], file = null, seconds = null;

$('rss').textContent = `${SB}/storage/v1/object/public/podcast/feed.xml`;

/* ── 표지: 1280×720 — 크림 바탕 · 말풍선에 그 편의 표현 · 왼쪽 아래 제목 · 오른쪽 아래 마스코트(운영자 2026-10-19 「편별 표지는 D3」) ── */
let mascot = null;
const loadMascot = () => mascot || (mascot = new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'logo-clear.png'; }));
async function cover(e) {
  const c = $('cv'), g = c.getContext('2d');
  try { await document.fonts.load('900 40px "Pretendard Variable"'); await document.fonts.load('800 40px "Pretendard Variable"'); } catch (x) { /* 글꼴이 늦어도 기본 글꼴로 그린다 */ }
  const mas = await loadMascot();
  const F = '"Pretendard Variable", Pretendard, sans-serif';
  const fit = (txt, wt, size, max) => { let z = size; do { g.font = `${wt} ${z}px ${F}`; z -= 2; } while (g.measureText(txt).width > max && z > 16); return z + 2; };
  g.fillStyle = '#F2EEE4'; g.fillRect(0, 0, 1280, 720);
  /* 말풍선 */
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(70, 40, 1140, 360, 70); g.fill();
  g.beginPath(); g.moveTo(330, 392); g.lineTo(450, 392); g.lineTo(380, 470); g.closePath(); g.fill();
  const word = e.exprs[0] ? e.exprs[0] + '?' : '';
  g.fillStyle = '#1B1512'; fit(word, 900, 170, 1000);
  g.fillText(word, (1280 - g.measureText(word).width) / 2, 255);
  /* 제목 · 편 번호 */
  g.fillStyle = '#1B1512'; const z = fit('Expressions', 800, 84, 500); g.fillText('Korean', 70, 535);
  g.fillStyle = '#E1682B'; g.fillText('Expressions', 70, 535 + z * 1.02);
  g.fillStyle = '#8C7A66'; g.font = `700 26px ${F}`; g.fillText('EP ' + e.ep + '  ·  3-min lessons', 74, 690);
  /* 마스코트 */
  if (mas) { const w = 330, h = w * mas.height / mas.width; g.drawImage(mas, 1280 - w - 60, 720 - h - 24, w, h); }
}
const cur = () => EPS.find((x) => x.ep === $('ep').value);
function drawEp() { const e = cur(); if (!e) return; $('epInfo').textContent = e.head; cover(e); }

/* ── 에피소드 목록 ── */
(async () => {
  try {
    EPS = await (await fetch('podcast-episodes.json', { cache: 'no-cache' })).json();
    $('ep').innerHTML = EPS.map((e) => `<option value="${e.ep}">${e.ep} — ${e.head}</option>`).join('');
    drawEp(); queueLoad();   // 번호 바꾸기 목록이 에피소드 목록을 쓰니, 목록이 온 뒤 한 번 더 그린다
  } catch (x) { $('epInfo').textContent = '에피소드 목록을 못 읽었어요(podcast-episodes.json).'; }
})();
$('ep').addEventListener('change', drawEp);

/* ── 파일 고르기 ── */
$('file').addEventListener('change', () => {
  file = $('file').files[0] || null; seconds = null; $('up').disabled = true; $('audio').hidden = true;
  if (!file) return;
  if (file.size > MAX) { $('fileInfo').innerHTML = '<span class="err">50MB 가 넘어요 — mp3 로 줄여서 다시 골라 주세요.</span>'; file = null; return; }
  const url = URL.createObjectURL(file);
  $('audio').src = url; $('audio').hidden = false;
  $('audio').onloadedmetadata = () => {
    seconds = Number.isFinite($('audio').duration) ? Math.round($('audio').duration) : null;
    const m = seconds != null ? `${Math.floor(seconds / 60)}분 ${seconds % 60}초 · ` : '';
    $('fileInfo').textContent = `${file.name} · ${m}${(file.size / 1048576).toFixed(1)}MB — 들어 보고 괜찮으면 올리세요.`;
    $('up').disabled = false;
  };
  $('audio').onerror = () => { $('fileInfo').innerHTML = '<span class="err">이 파일을 읽을 수 없어요 — mp3 나 m4a 로 골라 주세요.</span>'; file = null; };
});

/* ── 올리기 ── */
const EXT = { 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/m4a': 'm4a', 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/x-wav': 'wav' };
$('up').addEventListener('click', async () => {
  const e = cur(); if (!e || !file) return;
  $('up').disabled = true; $('msg').textContent = '올리는 중…';
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('로그인이 필요해요 — everykoreans.com 에서 운영자 계정으로 로그인한 뒤 이 쪽을 새로 고쳐 주세요.');
    const mime = (file.type || '').split(';')[0] || 'audio/mpeg';
    if (!EXT[mime]) throw new Error(`이 형식(${mime || '알 수 없음'})은 안 돼요 — mp3 나 m4a 로 골라 주세요.`);
    const base = `${new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10)}/ep${e.ep}-${Date.now()}`;
    const up = async (path, blob, type) => { const { error } = await sb.storage.from('podcast').upload(path, blob, { contentType: type, upsert: false }); if (error) throw error; };
    const coverBlob = await new Promise((res) => $('cv').toBlob(res, 'image/jpeg', 0.92));
    await up(`${base}.${EXT[mime]}`, file, mime);
    await up(`${base}.jpg`, coverBlob, 'image/jpeg');
    const { error } = await sb.from('podcast_queue').insert({ ep: e.ep, audio_path: `${base}.${EXT[mime]}`, cover_path: `${base}.jpg`, mime, seconds, bytes: file.size,
      title: e.title, description: e.description, tags: e.tags });
    if (error) throw error;
    $('msg').innerHTML = '<span class="done">대기열에 올렸어요 ✓</span> → 30분 안에 액션이 유튜브에 올려요.';
    $('file').value = ''; file = null; $('audio').hidden = true; $('fileInfo').textContent = '다음 파일을 고르세요.';
    queueLoad();
  } catch (x) { $('up').disabled = false; $('msg').innerHTML = `<span class="err">못 올렸어요: ${(x.message || x)}</span>`; }
});

/* ── 대기열 — 최근 10개 ── */
const mark = (x) => (!x ? '⏳' : x.ok ? '✅' : x.skip ? '⏭️' : '⚠️');
async function queueLoad() {
  const { data: { session } } = await sb.auth.getSession();
  $('who').textContent = session ? `로그인: ${session.user.email}` : '로그인이 안 돼 있어요 — everykoreans.com 에서 운영자 계정으로 로그인한 뒤 새로 고쳐 주세요.';
  if (!session) { $('queue').textContent = '로그인하면 대기열이 보여요.'; return; }
  const { data, error } = await sb.from('podcast_queue').select('id,ep,status,yt,created_at,title,cover_path').order('id', { ascending: false }).limit(10);
  if (error) { $('queue').textContent = `대기열을 못 읽었어요(${error.message}) — db/add_podcast.sql 을 돌렸는지 봐 주세요.`; return; }
  $('queue').innerHTML = data.length ? data.map((r) => `<div class="q" data-id="${r.id}"><span>EP ${r.ep} · ${r.created_at.slice(5, 10)}</span><span>${r.status === 'cancel' ? '🚫' : `유튜브 ${mark(r.yt)}`}${r.yt?.url ? ` <a href="${r.yt.url}" target="_blank" rel="noopener">보기</a>` : ''}</span>` +
    (r.status === 'cancel' ? '' : `<span class="qa"><select class="qep" aria-label="바꿀 번호">${EPS.map((e) => `<option value="${e.ep}"${e.ep === r.ep ? ' selected' : ''}>${e.ep} — ${e.head}</option>`).join('')}</select> <button type="button" class="qfix" data-id="${r.id}">번호 바꾸기</button> <button type="button" class="qcancel" data-id="${r.id}">취소</button></span>`) + '</div>').join('') : '아직 없어요.';
}
queueLoad();

/* ── 잘못 올렸을 때(운영자 2026-10-21 「배가 아프다인데 번호를 잘못 올렸어」) — 번호 바꾸기 · 취소 ──
   번호를 바꾸면 그 편의 제목 · 설명 · 태그와 표지(번호 · 표현이 들어간 그림)를 새로 맞춘다. 표지는 덮어쓰지 않고 새 파일로 올린다
   (저장 칸 정책이 「올리기」만 허용). 이미 유튜브에 올라갔다면(✅) 유튜브 쪽 제목 · 썸네일은 유튜브 스튜디오에서 직접 고쳐야 한다. */
$('queue').addEventListener('click', async (ev) => {
  const fix = ev.target.closest('.qfix'), cancel = ev.target.closest('.qcancel');
  const btn = fix || cancel; if (!btn) return;
  const row = btn.closest('.q'), id = Number(btn.dataset.id);
  const say = (h) => { $('msg').innerHTML = h; };
  btn.disabled = true;
  try {
    if (cancel) {
      if (!window.confirm('이 줄을 취소할까요? 아직 유튜브에 안 올라갔다면 올라가지 않아요.')) { btn.disabled = false; return; }
      const { error } = await sb.from('podcast_queue').update({ status: 'cancel' }).eq('id', id);
      if (error) throw error;
      say('<span class="done">취소했어요 ✓</span>');
    } else {
      const e = EPS.find((x) => x.ep === row.querySelector('.qep').value); if (!e) throw new Error('번호를 못 찾았어요');
      const { data: r0, error: e0 } = await sb.from('podcast_queue').select('yt').eq('id', id).single();
      if (e0) throw e0;
      const prev = $('ep').value; $('ep').value = e.ep; cover(e);
      const blob = await new Promise((res) => $('cv').toBlob(res, 'image/jpeg', 0.92));
      $('ep').value = prev; drawEp();
      const path = `${new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10)}/ep${e.ep}-${Date.now()}.jpg`;
      const { error: eu } = await sb.storage.from('podcast').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (eu) throw eu;
      const { error } = await sb.from('podcast_queue').update({ ep: e.ep, title: e.title, description: e.description, tags: e.tags, cover_path: path }).eq('id', id);
      if (error) throw error;
      say(`<span class="done">EP ${e.ep} (${e.head}) 로 바꿨어요 ✓</span>` + (r0?.yt?.ok ? ' 이미 유튜브에 올라갔어요 — 유튜브 스튜디오에서 그 영상의 제목 · 설명 · 썸네일을 직접 고쳐 주세요. 스포티파이 목록은 다음 갱신 때 바뀌어요.' : ' 아직 유튜브에 안 올라갔다면 이 번호로 올라가요.'));
    }
    queueLoad();
  } catch (x) { btn.disabled = false; say(`<span class="err">못 했어요: ${(x.message || x)}</span>`); }
});
