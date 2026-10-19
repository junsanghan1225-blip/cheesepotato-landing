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

/* ── 표지: 1280×720 — 크림 바탕 · 큰 제목 · 오른쪽 흰 카드에 표현 5개 ── */
async function cover(e) {
  const c = $('cv'), g = c.getContext('2d');
  try { await document.fonts.load('800 40px "Pretendard Variable"'); await document.fonts.load('600 30px "Pretendard Variable"'); } catch (x) { /* 글꼴이 늦어도 기본 글꼴로 그린다 */ }
  const F = '"Pretendard Variable", Pretendard, sans-serif';
  g.fillStyle = '#F2EEE4'; g.fillRect(0, 0, 1280, 720);
  g.fillStyle = '#E1682B'; g.fillRect(0, 0, 18, 720);
  g.fillStyle = '#1B1512'; g.textBaseline = 'alphabetic';
  /* 글자가 칸을 넘으면 크기를 줄여 맞춘다 */
  const fit = (txt, wt, size, max) => { let z = size; do { g.font = `${wt} ${z}px ${F}`; z -= 2; } while (g.measureText(txt).width > max && z > 20); };
  fit('Expressions', 800, 120, 540); g.fillText('Korean', 70, 250); g.fillText('Expressions', 70, 380);
  g.fillStyle = '#E1682B'; g.beginPath(); g.roundRect(70, 430, 190, 62, 31); g.fill();
  g.fillStyle = '#fff'; g.font = `800 34px ${F}`; g.fillText(`EP ${e.ep}`, 104, 473);
  g.fillStyle = '#1B1512'; g.font = `600 30px ${F}`; g.fillText('everykoreans.com', 70, 640);
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(640, 70, 570, 580, 28); g.fill();
  g.strokeStyle = '#E4DED1'; g.lineWidth = 2; g.stroke();
  const list = e.exprs.slice(0, 6);
  const step = Math.min(92, 500 / Math.max(1, list.length));
  list.forEach((t, i) => {
    g.fillStyle = '#E1682B'; g.font = `800 46px ${F}`; g.fillText(String(i + 1), 684, 168 + i * step + 12);
    g.fillStyle = '#1B1512'; fit(t, 800, 46, 440); g.fillText(t, 740, 168 + i * step + 12);
  });
}
const cur = () => EPS.find((x) => x.ep === $('ep').value);
function drawEp() { const e = cur(); if (!e) return; $('epInfo').textContent = e.head; cover(e); }

/* ── 에피소드 목록 ── */
(async () => {
  try {
    EPS = await (await fetch('podcast-episodes.json', { cache: 'no-cache' })).json();
    $('ep').innerHTML = EPS.map((e) => `<option value="${e.ep}">${e.ep} — ${e.head}</option>`).join('');
    drawEp();
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
  const { data, error } = await sb.from('podcast_queue').select('id,ep,status,yt,created_at,title').order('id', { ascending: false }).limit(10);
  if (error) { $('queue').textContent = `대기열을 못 읽었어요(${error.message}) — db/add_podcast.sql 을 돌렸는지 봐 주세요.`; return; }
  $('queue').innerHTML = data.length ? data.map((r) => `<div class="q"><span>EP ${r.ep} · ${r.created_at.slice(5, 10)}</span><span>${r.status === 'cancel' ? '🚫' : `유튜브 ${mark(r.yt)}`}${r.yt?.url ? ` <a href="${r.yt.url}" target="_blank" rel="noopener">보기</a>` : ''}</span></div>`).join('') : '아직 없어요.';
}
queueLoad();
