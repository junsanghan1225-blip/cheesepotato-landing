/* 서비스워커 — 오프라인에서도 열리게 한다. 생성물이 아니라 손으로 쓴다.
 *
 * 전략을 셋으로 가른다.
 *
 *   1. 화면 자체(navigate) — 네트워크가 되면 늘 새 걸 받는다(먼저 시도).
 *      안 되면 저번에 받아 둔 화면으로라도 연다 — 지하철 같은 데서 이게
 *      전부다.
 *   2. tools/stamp.mjs 가 붙인 ?v=해시 자료(app.js·app.module.js·
 *      courses.js…) — 해시가 내용에서 나오므로 같은 주소는 같은 내용임이
 *      보장된다. 그래서 한 번 받으면 두고두고 캐시에서 바로 준다(먼저
 *      캐시, 없으면 받아서 캐시에 채운다).
 *   3. 그 외(사진·오디오·Supabase API·분석) — 손대지 않는다. 캐시가 오래된
 *      사진을 보여주거나, 로그인 요청이 캐시에서 나가는 사고를 막는다.
 *
 * 미리 받아 두는(precache) 목록을 안 둔다. 목록에 ?v=해시를 박아 두면
 * 다음 배포 때 그 해시가 예전 것이 되어 install 이 404 를 받는다 — 그래서
 * "방문하면서 그때그때 채우는" 쪽을 쓴다. 처음 한 번은 온라인이어야
 * 오프라인이 되는 게 PWA 의 원래 성격이라, 손해가 아니다.
 *
 * 캐시 이름에 자국을 안 박는다. 이 파일 자체가 바뀌면 브라우저가 알아서
 * 새 워커를 깔고(설치→활성화) activate 에서 예전 캐시를 지운다.
 */
const CACHE = 'cp-cache-v1';
const STAMP_RE = /(\?|&)v=[0-9a-f]{8}(&|$)/;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // 남의 서버(Supabase·분석)는 안 건드린다

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch (err) {
        return (await caches.match(req)) || (await caches.match('/')) || Response.error();
      }
    })());
    return;
  }

  if (STAMP_RE.test(url.search)) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch (err) {
        return cached || Response.error();
      }
    })());
  }
});
