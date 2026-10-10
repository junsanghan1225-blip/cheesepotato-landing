/* 만들기 도구(띠 카드 · 속담 포춘쿠키 …)가 같이 쓰는 것 — 스토리 크기 그림 그리기 · 저장/공유 · 한글 → 로마자.
   이름 도장(korean-name.js)과 같은 틀: 1080×1920 그림 → 폰은 공유 창, PC 는 내려받기. 저장한 뒤에만 다음 걸음 카드를 연다
   (운영자 2026-10-10 A — 받기는 로그인 없이). */
(function () {
  const FONT = "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
  const EMOJI = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
  const S0 = 0xac00;
  const RI = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  const RM = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  const RF = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
  // 글자 하나씩 옮긴다(소리 바뀜은 따지지 않음) — 낱말 사이는 띄어 쓰고 글자 사이는 붙인다
  const roman = (s) => [...s].map((ch) => { const c = ch.charCodeAt(0) - S0; if (c < 0 || c > 11171) return ch; return RI[Math.floor(c / 588)] + RM[Math.floor((c % 588) / 28)] + RF[c % 28]; }).join('');
  function canvas() { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; return c; }
  // 너비에 맞춰 줄 나누기 — 한국어는 낱말(띄어쓰기) 단위, 너무 긴 낱말은 글자 단위
  function lines(g, text, maxW) {
    const out = []; let cur = '';
    for (const w of String(text).split(' ')) {
      const next = cur ? `${cur} ${w}` : w;
      if (g.measureText(next).width <= maxW) { cur = next; continue; }
      if (cur) out.push(cur);
      if (g.measureText(w).width <= maxW) { cur = w; continue; }
      cur = '';
      for (const ch of w) { if (g.measureText(cur + ch).width > maxW) { out.push(cur); cur = ch; } else cur += ch; }
    }
    if (cur) out.push(cur);
    return out;
  }
  // 줄을 가운데 맞춰 그리고, 다음 줄의 y 를 돌려준다
  function para(g, text, x, y, maxW, lh) { for (const l of lines(g, text, maxW)) { g.fillText(l, x, y); y += lh; } return y; }
  async function save(blob, file, text, afterId) {
    if (!blob) return;
    const f = new File([blob], `${file}-${Date.now()}.png`, { type: 'image/png' });
    const after = afterId && document.getElementById(afterId); if (after) after.hidden = false;
    try {
      if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  const blob = (c) => new Promise((res) => c.toBlob(res, 'image/png'));
  window.cpCard = { FONT, EMOJI, roman, canvas, lines, para, save, blob };
})();
