/* 내 이름 따라 쓰기 학습지(운영자 2026-10-10 「B」). 손으로 쓴 쪽 hangul-worksheet/ 의 손잡이.
   한글 이름(또는 영어 이름 → korean-name.js 의 규칙으로 한글) → A4 한 장: 본보기 한 줄 · 흐린 글자 따라 쓰기 세 줄 · 빈칸 두 줄,
   그리고 이름에 든 자음 · 모음(이름 · 소리)을 따라 쓰기. 인쇄는 브라우저 인쇄(PDF 로 저장도 거기서). */
(function () {
  const $ = (id) => document.getElementById(id);
  const inp = $('wsIn'); if (!inp) return;
  const S0 = 0xac00;
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  // 자음 이름 · 소리(첫소리 기준 — ㅇ 은 첫소리에선 소리 없음, 받침에선 ng)
  const CN = { ㄱ: ['기역', 'g / k'], ㄲ: ['쌍기역', 'kk'], ㄴ: ['니은', 'n'], ㄷ: ['디귿', 'd / t'], ㄸ: ['쌍디귿', 'tt'], ㄹ: ['리을', 'r / l'], ㅁ: ['미음', 'm'], ㅂ: ['비읍', 'b / p'], ㅃ: ['쌍비읍', 'pp'],
    ㅅ: ['시옷', 's'], ㅆ: ['쌍시옷', 'ss'], ㅇ: ['이응', 'silent at the start · ng at the end'], ㅈ: ['지읒', 'j'], ㅉ: ['쌍지읒', 'jj'], ㅊ: ['치읓', 'ch'], ㅋ: ['키읔', 'k'], ㅌ: ['티읕', 't'], ㅍ: ['피읖', 'p'], ㅎ: ['히읗', 'h'] };
  const VR = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function ko(v) {
    v = v.trim().slice(0, 20);
    if (/[가-힣]/.test(v)) return [...v].filter((c) => /[가-힣]/.test(c)).join('');
    return (window.cpKoName ? window.cpKoName(v) : '').replace(/\s/g, '');
  }
  function letters(name) {
    const seen = new Set(), out = [];
    const add = (j, kind) => { if (!j || seen.has(j)) return; seen.add(j); out.push([j, kind]); };
    for (const ch of name) { const c = ch.charCodeAt(0) - S0; if (c < 0 || c > 11171) continue;
      add(CHO[Math.floor(c / 588)], 'c'); add(JUNG[Math.floor((c % 588) / 28)], 'v'); const f = JONG[c % 28]; if (f && CN[f]) add(f, 'c'); }
    return out;
  }
  function row(name, kind, n) {
    const cells = []; const sy = [...name];
    while (cells.length < n) { for (const s of sy) cells.push(s); cells.push(''); }
    return `<div class="ws-row">${cells.slice(0, n).map((s) => `<span class="ws-c ${kind}">${kind === 'blank' ? '' : esc(s)}</span>`).join('')}</div>`;
  }
  function paint() {
    const name = ko(inp.value), box = $('wsSheet');
    if (!name) { box.hidden = true; return; }
    box.hidden = false;
    $('wsName').textContent = name;
    $('wsRom').textContent = [...name].map((ch) => { const c = ch.charCodeAt(0) - S0; return c < 0 ? ch : (['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'][Math.floor(c / 588)] + VR[Math.floor((c % 588) / 28)] + ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'][c % 28]); }).join(' · ');
    const N = 8;
    $('wsRows').innerHTML = row(name, 'model', N) + row(name, 'trace', N) + row(name, 'trace', N) + row(name, 'trace', N) + row(name, 'blank', N) + row(name, 'blank', N);
    $('wsLetters').innerHTML = letters(name).map(([j, k]) => {
      const info = k === 'c' ? CN[j] : [j.replace(/./, (x) => String.fromCharCode(S0 + 11 * 588 + JUNG.indexOf(x) * 28)), VR[JUNG.indexOf(j)]];   // 모음 이름 = ㅇ + 모음(아 · 어 …)
      return `<div class="ws-l"><div class="ws-lh"><b>${esc(j)}</b><span>${esc(info[0])}<small>${esc(info[1])}</small></span></div>` +
        `<div class="ws-row">${[0, 1, 2, 3, 4, 5].map((i) => `<span class="ws-c ${i === 0 ? 'model' : i < 4 ? 'trace' : 'blank'}">${i < 4 ? esc(j) : ''}</span>`).join('')}</div></div>`;
    }).join('');
    try { history.replaceState(null, '', '?ko=' + encodeURIComponent(name)); } catch (e) {}
  }
  inp.addEventListener('input', paint);
  $('wsPrint').addEventListener('click', () => { try { window.dataLayer && window.dataLayer.push({ event: 'cp_event', name: '학습지인쇄' }); } catch (e) {} window.print(); });
  const q = new URLSearchParams(location.search); const v = q.get('ko') || q.get('name');
  if (v) inp.value = v.slice(0, 20);
  // korean-name.js(영어 → 한글 규칙)가 늦게 붙어도 다시 그린다
  paint(); window.addEventListener('load', paint);
})();
