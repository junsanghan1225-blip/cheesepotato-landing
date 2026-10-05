/* 채널 연결(connect.html) — 로그인 주소를 만들고, 돌아오면 일회용 코드를 보여 준다. 공개 값만 다룬다. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var CB = location.origin + location.pathname;   // 구글 · 틱톡 앱에 넣는 리디렉션 주소와 같아야 한다(https://everykoreans.com/connect.html)
  var get = function (k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  var set = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 사생활 창 */ } };
  $('ytId').value = get('cp-yt-client'); $('ttKey').value = get('cp-tt-key');

  $('ytGo').addEventListener('click', function () {
    var id = $('ytId').value.trim(); if (!id) { alert('클라이언트 ID 를 넣어 주세요'); return; } set('cp-yt-client', id);
    location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({ client_id: id, redirect_uri: CB, response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.upload', access_type: 'offline', prompt: 'consent', state: 'yt' });
  });
  $('ttGo').addEventListener('click', function () {
    var key = $('ttKey').value.trim(); if (!key) { alert('Client key 를 넣어 주세요'); return; } set('cp-tt-key', key);
    location.href = 'https://www.tiktok.com/v2/auth/authorize/?' + new URLSearchParams({ client_key: key, redirect_uri: CB, response_type: 'code',
      scope: 'user.info.basic,video.upload,video.publish', state: 'tt' });
  });

  var q = new URLSearchParams(location.search), code = q.get('code'), st = q.get('state');
  if (q.get('error')) { alert('연결을 취소했거나 실패했어요: ' + q.get('error') + ' ' + (q.get('error_description') || '')); }
  if (code) {
    $('got').hidden = false; $('code').textContent = code;
    $('gotTitle').textContent = st === 'tt' ? '틱톡 로그인 끝 ✓' : '구글 로그인 끝 ✓';
    $('what').textContent = st === 'tt' ? 'connect-tt' : 'connect-yt';
    $('copy').addEventListener('click', function () { navigator.clipboard.writeText(code).then(function () { $('copy').textContent = '복사했어요'; }, function () { prompt('복사해 주세요', code); }); });
    history.replaceState(null, '', CB);   // 주소창에서 코드를 지운다
  }
})();
