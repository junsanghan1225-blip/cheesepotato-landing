/* 낱말 · 문법 내려받기 문 — /download/?f=/downloads/<파일>. 사이트에 로그인한 세션이 있으면 파일을 받게 하고, 없으면 로그인 안내를 보인다.
   소프트 문(운영자 2026-10-19 「A」): 파일은 사이트에 그냥 올라가 있다 — 주소를 아는 사람은 직접 받을 수 있다. 막는 것은 단추 · 검색 노출뿐. */
import { createClient } from './vendor/supabase-js.js';

const sb = createClient('https://tjgoevtvobvmlyefgxel.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
const $ = (id) => document.getElementById(id);
const f = new URLSearchParams(location.search).get('f') || '';
const OK = /^\/downloads\/[a-z0-9-]+\.(csv|txt)$/;   // 이 폴더의 파일만 — 다른 주소로 보내는 장난을 막는다

(async () => {
  if (!OK.test(f)) { $('t').textContent = 'File not found'; $('m').textContent = '파일을 찾을 수 없어요.'; $('go').innerHTML = '<a class="btn sub" href="/topik-vocabulary-list/">← Back to the lists</a>'; return; }
  let session = null;
  try { session = (await sb.auth.getSession()).data.session; } catch (e) { /* 막힌 브라우저 — 로그인 안내로 */ }
  if (session) {
    $('t').textContent = 'Your download is starting…'; $('m').textContent = '다운로드를 시작해요.';
    $('go').innerHTML = `<a class="btn" href="${f}" download>Download again</a><br><a class="btn sub" href="/topik-vocabulary-list/">← Back to the lists</a>`;
    const a = document.createElement('a'); a.href = f; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
    return;
  }
  $('t').textContent = 'Sign in to download';
  $('m').innerHTML = 'This list is free with a <b>free account</b> — it takes a few seconds.<br>무료 가입(로그인)하면 받을 수 있어요.<br><span class="dim">After signing in, come back to this page (Back button) and the download starts.</span>';
  $('go').innerHTML = '<a class="btn" href="/#account">Sign in / Sign up (free)</a><br><a class="btn sub" href="/topik-vocabulary-list/">← Back to the lists</a>';
})();
