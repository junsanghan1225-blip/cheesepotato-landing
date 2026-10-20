/* 낱말 · 문법 내려받기 문 — /download/?f=/downloads/<파일>. 사이트에 로그인한 세션이 있으면 파일을 받게 하고, 없으면 로그인 안내를 보인다.
   진짜 문(B, 운영자 2026-10-19): 파일은 사이트에 없다 — Supabase 비공개 저장 칸(downloads-private)에만 있고, 로그인한 사람만 임시 주소(60초)를 받아 내려받는다(db/add_downloads.sql). */
import { createClient } from './vendor/supabase-js.js';

const sb = createClient('https://tjgoevtvobvmlyefgxel.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
const $ = (id) => document.getElementById(id);
const f = new URLSearchParams(location.search).get('f') || '';
// 측정 — 내려받기 문이 가입을 얼마나 늘리는지 보려는 것. GTM 이벤트(dataLayer) + Clarity 이벤트. 파일 이름만 보낸다(개인 정보 없음).
const track = (ev, extra) => {
  try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev, file: f.split('/').pop() }, extra)); } catch (e) {}
  try { window.clarity && window.clarity('event', ev); } catch (e) {}
};
const OK = /^\/downloads\/[a-z0-9-]+\.(csv|txt)$/;   // 이 폴더의 파일만 — 다른 주소로 보내는 장난을 막는다

(async () => {
  if (!OK.test(f)) { $('t').textContent = 'File not found'; $('m').textContent = '파일을 찾을 수 없어요.'; $('go').innerHTML = '<a class="btn sub" href="/topik-vocabulary-list/">← Back to the lists</a>'; return; }
  let session = null;
  try { session = (await sb.auth.getSession()).data.session; } catch (e) { /* 막힌 브라우저 — 로그인 안내로 */ }
  if (session) {
    track('download_start');
    $('t').textContent = 'Preparing your download…'; $('m').textContent = '다운로드를 준비하는 중이에요.';
    const name = f.split('/').pop();
    const { data, error } = await sb.storage.from('downloads-private').createSignedUrl(name, 60, { download: name });
    if (error || !data?.signedUrl) {
      track('download_error');
      $('t').textContent = 'Could not start the download';
      $('m').innerHTML = 'Please try again in a minute. If it keeps failing, tell us at <b>cheesepotato@everykoreans.com</b>.<br>잠시 뒤 다시 해 주세요.';
      $('go').innerHTML = `<a class="btn" href="/download/?f=${encodeURIComponent(f).replace(/%2F/g, '/')}">Try again</a><br><a class="btn sub" href="/topik-vocabulary-list/">← Back to the lists</a>`;
      return;
    }
    $('t').textContent = 'Your download is starting…'; $('m').textContent = '다운로드를 시작해요.';
    $('go').innerHTML = `<a class="btn sub" href="/topik-vocabulary-list/">← Back to the lists</a>`;
    const a = document.createElement('a'); a.href = data.signedUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    return;
  }
  track('download_gate_view');   // 로그인 안 한 채로 문 앞에 선 사람
  $('t').textContent = 'Sign in to download';
  $('m').innerHTML = 'This list is free with a <b>free account</b> — it takes a few seconds.<br>무료 가입(로그인)하면 받을 수 있어요.<br><span class="dim">After signing in, come back to this page (Back button) and the download starts.</span>';
  $('go').innerHTML = '<a class="btn" id="gl" href="/#account">Sign in / Sign up (free)</a><br><a class="btn sub" href="/topik-vocabulary-list/">← Back to the lists</a>';
  const gl = $('gl'); if (gl) gl.addEventListener('click', () => track('download_gate_click'));
})();
