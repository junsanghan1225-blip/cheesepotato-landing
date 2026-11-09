/* 나갈 때 로그인 안내 — 한 번만(운영자 2026-11-09 「로그인 안 해도 할 수 있게 하고 나갈 때 로그인하도록 한 번만 팝업」).
   3D 시험장 · OX 퀴즈는 손님도 함께 쓴다. 손님이 이 쪽의 「나가기」 링크(첫 화면 · 다른 쪽)를 누르면
   그때 한 번만 로그인하면 좋은 점을 보여 준다. 한 번 보면(로그인 · 그냥 나가기 둘 다) 이 기기에서 다시 안 뜬다.
   뒤로 단추 · 창 닫기는 막지 않는다(막으면 「안 나가진다」가 된다). */
const KEY = 'cp_leave_nudge';
const signedIn = () => { try { const raw = localStorage.getItem('sb-tjgoevtvobvmlyefgxel-auth-token'), j = raw && JSON.parse(raw); return !!(j && (j.access_token || (j.currentSession && j.currentSession.access_token))); } catch (e) { return false; } };
const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return true; } };
const mark = () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} };
const dl = (ev, x) => { try { (window.dataLayer = window.dataLayer || []).push({ event: ev, ...x }); } catch (e) {} };

export function leaveNudge(place) {
  const css = document.createElement('style');
  css.textContent = `.lvn{position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,18,15,.6)}
.lvn[hidden]{display:none}.lvn-c{width:min(420px,100%);background:#f6f1e7;color:#1c1915;border-radius:12px;padding:22px 20px;font-family:inherit}
.lvn-c h2{margin:0 0 6px;font-size:20px}.lvn-c p{margin:0 0 10px;font-size:14.5px;line-height:1.6;color:#4a443d}.lvn-c ol{margin:0 0 14px;padding-left:20px;font-size:14.5px;line-height:1.7;color:#3e3830}
.lvn-c a,.lvn-c button{display:flex;align-items:center;justify-content:center;width:100%;min-height:46px;border-radius:8px;font:inherit;font-size:15px;font-weight:800;text-decoration:none;cursor:pointer;margin-top:8px}
.lvn-go{background:#1c1915;color:#f6f1e7;border:0}.lvn-no{background:#fff;color:#1c1915;border:1px solid #cfc6b4}`;
  document.head.appendChild(css);
  const box = document.createElement('div');
  box.className = 'lvn'; box.hidden = true;
  box.innerHTML = `<div class="lvn-c" role="dialog" aria-labelledby="lvnT"><h2 id="lvnT">나가기 전에 · Before you go</h2>
<p>로그인하면 이런 것이 남아요. 무료예요. <span lang="en">Sign in for free to keep these.</span></p>
<ol><li>모의고사 · 연습 기록과 점수 변화</li><li>TOPIK 쓰기 AI 채점 1번 무료</li><li>AI 발음 진단 · 한국어 도우미 하루 20번</li></ol>
<a class="lvn-go" href="/#account">로그인하기 · Sign in</a><button type="button" class="lvn-no">그냥 나가기 · Leave</button></div>`;
  document.body.appendChild(box);
  let to = '/';
  box.querySelector('.lvn-go').addEventListener('click', () => { mark(); dl('leave_nudge_signin', { cp_place: place }); });
  box.querySelector('.lvn-no').addEventListener('click', () => { mark(); dl('leave_nudge_skip', { cp_place: place }); location.href = to; });
  box.addEventListener('click', (e) => { if (e.target === box) box.hidden = true; });
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || box.contains(a) || a.target === '_blank') return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname) return;   // 같은 쪽 안(반 옮기기 등)은 그대로
    if (signedIn() || seen()) return;
    e.preventDefault(); to = a.href; box.hidden = false; dl('leave_nudge_view', { cp_place: place });
  }, true);
}
