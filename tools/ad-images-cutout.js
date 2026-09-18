/* logo.png 의 배경을 투명하게 깎아 마스코트만 남긴다 — 브라우저 안에서 한다.
 *
 * **왜 여기서 하나** — 광고 그림의 바탕은 사이트 색(#F2EEE4)이고 logo.png 의
 * 바탕은 그보다 조금 어두운 베이지(231,224,204)다. 그냥 얹으면 마스코트 뒤에
 * 네모가 보인다. 파이썬 이미지 라이브러리를 새로 들이지 않으려고 canvas 로
 * 한다 — 어차피 그림을 찍으려고 브라우저를 띄우는 참이다.
 *
 * **두 번 지운다.**
 *   ① 테두리에서 번져 들어가며(flood fill) — 넉넉한 너비로 잡아 오른쪽 아래
 *      워터마크 자국(배경보다 살짝 밝다)까지 같이 뺀다. 번져 들어가는 방식이라
 *      장갑과 눈의 흰색은 팔다리에 갇혀 있어 안 지워진다.
 *   ② 남은 조각을 전역으로 — 팔다리 사이에 갇혀 ①이 못 닿은 배경이 있다.
 *      그 조각은 배경색과 거리가 1~2 라, 좁은 너비(22)로 전역 처리해도
 *      장갑(거리 51)·치즈(104)는 건드리지 않는다.
 */
(function () {
  var BG = [231, 224, 204];
  var TOL = 34, SOFT = 20;        // ① 테두리에서
  var G_TOL = 22, G_SOFT = 12;    // ② 갇힌 조각

  function dist(d, i) {
    return Math.max(Math.abs(d[i] - BG[0]), Math.abs(d[i+1] - BG[1]), Math.abs(d[i+2] - BG[2]));
  }

  var img = new Image();
  img.onload = function () {
    var w = img.width, h = img.height;
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var cx = cv.getContext('2d');
    cx.drawImage(img, 0, 0);
    var id = cx.getImageData(0, 0, w, h), d = id.data;

    /* ① 테두리에서 번져 들어간다. 재귀 대신 쌓아 두고 꺼낸다 — 60만 화소라
          재귀로 하면 호출 깊이에서 터진다. */
    var seen = new Uint8Array(w * h);
    var stack = [];
    for (var x = 0; x < w; x++) { stack.push(x, 0); stack.push(x, h - 1); }
    for (var y = 0; y < h; y++) { stack.push(0, y); stack.push(w - 1, y); }
    while (stack.length) {
      var py = stack.pop(), pxx = stack.pop();
      var k = py * w + pxx;
      if (seen[k]) continue;
      seen[k] = 1;
      var i = k * 4, dd = dist(d, i);
      if (dd > TOL) continue;
      d[i + 3] = dd <= SOFT ? 0 : Math.round(255 * (dd - SOFT) / (TOL - SOFT));
      if (pxx > 0) stack.push(pxx - 1, py);
      if (pxx < w - 1) stack.push(pxx + 1, py);
      if (py > 0) stack.push(pxx, py - 1);
      if (py < h - 1) stack.push(pxx, py + 1);
    }

    /* ② 갇힌 조각 */
    for (var j = 0; j < w * h; j++) {
      var q = j * 4;
      if (d[q + 3] === 0) continue;
      var e = dist(d, q);
      if (e <= G_SOFT) d[q + 3] = 0;
      else if (e <= G_TOL) d[q + 3] = Math.round(255 * (e - G_SOFT) / (G_TOL - G_SOFT));
    }

    cx.putImageData(id, 0, 0);

    /* 남은 여백을 잘라 마스코트가 칸을 꽉 채우게 한다 */
    var minX = w, minY = h, maxX = 0, maxY = 0;
    for (var yy = 0; yy < h; yy++) {
      for (var xx = 0; xx < w; xx++) {
        if (d[(yy * w + xx) * 4 + 3] > 8) {
          if (xx < minX) minX = xx; if (xx > maxX) maxX = xx;
          if (yy < minY) minY = yy; if (yy > maxY) maxY = yy;
        }
      }
    }
    var cw = maxX - minX + 1, ch = maxY - minY + 1;
    var out = document.createElement('canvas');
    out.width = cw; out.height = ch;
    out.getContext('2d').drawImage(cv, minX, minY, cw, ch, 0, 0, cw, ch);

    var url = out.toDataURL('image/png');
    var list = document.querySelectorAll('img.mascot');
    for (var n = 0; n < list.length; n++) list[n].src = url;

    /* 깎은 것을 그대로 내놓는다. build-ad-images.mjs 가 이것을 받아
       assets/ads/mascots.png 로 쓴다 — 캔바에서 쓸 투명 png 다.

       사진을 찍어서 뽑지 않는 까닭: 칸을 찍으면 뒤에 깔린 바탕이 같이
       찍힌다. omitBackground 는 쪽 자체에 바탕이 없을 때만 듣는데, 이
       판은 칸이 보이게 body 에 회색을 깔아 두었다. 캔버스에서 바로
       가져오면 그 문제가 아예 없고 원본 해상도로 무손실이다. */
    window.__mascotPng = url;

    /* build-ad-images.mjs 가 이 자국을 기다린다 */
    document.documentElement.setAttribute('data-mascot', 'ready');
  };
  img.src = '/logo.png';
})();
