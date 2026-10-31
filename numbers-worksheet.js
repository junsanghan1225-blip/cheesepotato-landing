/* 수사(숫자) 학습지(운영자 2026-10-14 「수사 조금 정리해서 학습지로」) — 손으로 쓴 쪽 numbers-worksheet/ 의 손잡이.
   인쇄는 브라우저 인쇄(PDF 로 저장). 「정답지」를 누르면 정답 쪽만 인쇄한다. CSP 때문에 인라인 스크립트 대신 이 파일. */
(function () {
  const body = document.body;
  /* 파일 이름(운영자 2026-10-15 「받을 때 깔끔하게 · 정렬해서」): Cheesepotato_<단계>_<제목>_<Worksheet | Answers>
     학습지 쪽의 <meta name="ws-file"> 에서 앞부분을 읽는다. .docx 도, 「PDF 로 저장」의 기본 이름(= 문서 제목)도 같은 이름으로. */
  const fileBase = () => document.querySelector('meta[name="ws-file"]')?.content || (location.pathname.replace(/\/+$/, '').split('/').pop() || 'worksheet').replace(/\.html$/, '');
  const fname = (kind, ext) => `${fileBase()}_${kind}${ext || ''}`;
  const oldTitle = document.title;
  /* 앱 안 브라우저(쓰레드 · 인스타 · 페이스북 · 카톡 · 틱톡 · 웹뷰)는 인쇄와 내려받기를 막는 일이 많다 — 쓰레드에서 온 사람이 PDF · 워드 단추를 여러 번 눌러도 안 됐다(Clarity 2026-10-31).
     막혔는지는 앱이 알려 주지 않으니, 앱 안 브라우저로 보이면 단추를 누를 때 「브라우저에서 열어 주세요」를 알려 준다(그래도 인쇄 · 내려받기는 그대로 시도한다). */
  const inApp = /Instagram|FBAN|FBAV|FB_IAB|Barcelona|Threads|KAKAOTALK|NAVER\(inapp|\bLine\/|TikTok|musical_ly|; wv\)/i.test(navigator.userAgent);
  const trk = (ev, extra) => { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, extra)); } catch (e) {} try { window.clarity && window.clarity('event', ev); } catch (e) {} };
  let warned = false;
  const inAppNote = (what) => {
    trk('worksheet_inapp_notice', { what });
    if (!inApp || warned) return;
    warned = true;
    const box = document.createElement('div');
    Object.assign(box.style, { margin: '10px 0', padding: '12px 14px', border: '1px solid #c9b79c', borderRadius: '8px', background: '#fff8ea', color: '#2a2218', fontSize: '14px', lineHeight: '1.55' });
    box.className = 'no-print';
    const en = document.createElement('div'), ko = document.createElement('div'), btn = document.createElement('button');
    en.textContent = 'Printing and downloads often do not work inside this app. Open this page in Chrome or Safari: tap ⋯ (or the share icon) → “Open in browser”.';
    ko.textContent = '이 앱 안에서는 인쇄 · 내려받기가 막힐 수 있어요. 오른쪽 위 ⋯(또는 공유 버튼) → 「브라우저에서 열기」로 열어 주세요.';
    btn.type = 'button'; btn.textContent = 'Copy link · 링크 복사';
    Object.assign(btn.style, { marginTop: '8px', padding: '7px 12px', border: '1px solid #2a2218', borderRadius: '6px', background: '#fff', font: 'inherit', cursor: 'pointer' });
    btn.addEventListener('click', () => { try { navigator.clipboard.writeText(location.href).then(() => { btn.textContent = 'Copied · 복사했어요'; }); } catch (e) { btn.textContent = location.href; } });
    box.append(en, ko, btn);
    const bar = document.querySelector('.nw-bar') || document.querySelector('.ws-bar') || document.body.firstElementChild;
    (bar && bar.parentNode ? bar.parentNode : document.body).insertBefore(box, bar ? bar.nextSibling : document.body.firstChild);
  };
  const printAs = (kind) => { inAppNote('print'); document.title = fname(kind); window.print(); };
  const go = (ans) => { body.classList.toggle('show-ans', ans); printAs(ans ? 'Answers' : 'Worksheet'); };
  document.getElementById('nwPrint')?.addEventListener('click', () => go(false));
  document.getElementById('nwAns')?.addEventListener('click', () => go(true));
  window.addEventListener('afterprint', () => { body.classList.remove('show-ans'); document.title = oldTitle; });

  /* ── 워드(.docx) 로 받기 (운영자 2026-10-15 「PDF 도 좋은데 docx 로도」) ──
     화면에 그려진 학습지(.nw-work / .nw-ans)를 그대로 읽어 .docx 를 만든다 — 별도 자료 · 라이브러리 없이(CSP 때문에 외부 스크립트 대신).
     .docx = zip 안의 xml. 압축 없이(store) 묶는 가장 작은 zip 을 직접 쓴다. 선생님이 고쳐 쓰라고 만든 것이라 글 · 표 · 빈칸만 옮긴다. */
  const enc = new TextEncoder();
  const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (b) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const parts = [], cen = []; let off = 0;
    const u16 = (n) => [n & 255, (n >> 8) & 255], u32 = (n) => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
    for (const [name, text] of files) {
      const nm = enc.encode(name), data = enc.encode(text), crc = crc32(data);
      const loc = new Uint8Array([0x50, 0x4b, 3, 4, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0, ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nm.length), 0, 0]);
      parts.push(loc, nm, data);
      cen.push(new Uint8Array([0x50, 0x4b, 1, 2, 20, 0, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0, ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nm.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(off)]), nm);
      off += loc.length + nm.length + data.length;
    }
    const cl = cen.reduce((a, x) => a + x.length, 0);
    const end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cl), ...u32(off), 0, 0]);
    return new Blob([...parts, ...cen, end], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  const xe = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const FONT = '<w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="Malgun Gothic" w:cs="Malgun Gothic"/>';
  const para = (text, o = {}) => `<w:p><w:pPr>${o.brk ? '<w:pageBreakBefore/>' : ''}<w:spacing w:before="${o.before || 0}" w:after="${o.after ?? 80}"/>${o.jc ? `<w:jc w:val="${o.jc}"/>` : ''}</w:pPr>` +
    `<w:r><w:rPr>${FONT}${o.b ? '<w:b/>' : ''}${o.color ? `<w:color w:val="${o.color}"/>` : ''}<w:sz w:val="${o.sz || 20}"/></w:rPr><w:t xml:space="preserve">${xe(text)}</w:t></w:r></w:p>`;
  /* 빈칸(.nw-line) 은 밑줄 글자로 */
  const txt = (n) => { let r = ''; n.childNodes.forEach((c) => { r += c.nodeType === 3 ? c.textContent : c.classList?.contains('nw-line') || c.classList?.contains('ws-blank') || c.classList?.contains('ws-line') ? '__________' : txt(c); }); return r.replace(/\s+/g, ' ').trim(); };
  const tbl = (t) => {
    const rows = [...t.rows]; const n = Math.max(...rows.map((r) => r.cells.length)), w = Math.floor(10200 / n);
    const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((x) => `<w:${x} w:val="single" w:sz="4" w:color="999999"/>`).join('');
    return `<w:tbl><w:tblPr><w:tblW w:w="10200" w:type="dxa"/><w:tblBorders>${bd}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${'<w:gridCol w:w="' + w + '"/>'.repeat(n)}</w:tblGrid>` +
      rows.map((r, ri) => `<w:tr>${[...r.cells].map((c) => `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${ri === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="EFE7DA"/>' : ''}</w:tcPr>${para(txt(c), { sz: 18, b: ri === 0 || c.classList.contains('k'), after: 20 })}</w:tc>`).join('')}</w:tr>`).join('') + '</w:tbl>' + para('', { after: 60 });
  };
  function body1(paper, brk) {
    let out = '', first = true;
    const P = (t, o = {}) => { out += para(t, { ...o, brk: first && brk }); first = false; };
    const walk = (el) => {
      for (const c of el.children) {
        const k = c.classList;
        if (c.matches('table')) { out += tbl(c); first = false; }
        else if (k.contains('nw-tw')) walk(c);
        else if (k.contains('nw-h') || c.matches('h1')) P(txt(c), { sz: 32, b: 1, after: 60 });
        else if (c.matches('h2')) P(txt(c), { sz: 22, b: 1, before: 180, after: 80 });
        else if (k.contains('ws-kicker')) P(txt(c), { sz: 18, b: 1, color: '9C4A1A', before: 120, after: 40 });
        else if (k.contains('ws-top')) P([...c.children].map(txt).join('        '), { sz: 18, color: '555555', after: 120 });
        else if (k.contains('ws-wl')) P('________________________________________________', { color: 'AAAAAA', after: 120 });
        else if (k.contains('nw-h3')) P(txt(c), { sz: 22, b: 1, before: 180, after: 80 });
        else if (k.contains('nw-g')) P(txt(c), { sz: 20, b: 1, before: 100, after: 40 });
        else if (k.contains('nw-top')) P([...c.children].map(txt).join('        '), { sz: 18, color: '555555', after: 120 });
        else if (k.contains('nw-foot')) P(txt(c), { sz: 16, color: '888888', jc: 'center', before: 200 });
        else if (c.matches('ol,ul')) [...c.children].forEach((li, i) => { const t = txt(li); P(c.matches('ol') && !/^\d/.test(t) ? `${i + 1}. ${t}` : t, { after: 100 }); });
        else if (k.contains('nw-two')) [...c.children].forEach((d) => P(txt(d), { sz: 18, after: 60 }));
        else if (c.children.length && !c.matches('p,li,span,b')) walk(c);
        else if (txt(c)) P(txt(c), { sz: k.contains('nw-sub') ? 18 : 20, color: k.contains('nw-sub') ? '555555' : '', after: 80 });
      }
    };
    walk(paper);
    return out;
  }
  function docx(sel, name) {
    inAppNote('word');
    const papers = [...document.querySelectorAll(sel)];
    if (!papers.length) return;
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      papers.map((p, i) => body1(p, i > 0)).join('') +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="400" w:footer="400" w:gutter="0"/></w:sectPr></w:body></w:document>';
    const blob = zip([
      ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
      ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
      ['word/document.xml', xml],
    ]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  document.getElementById('nwDocx')?.addEventListener('click', () => docx('.nw-work', fname('Worksheet', '.docx')));
  document.getElementById('nwAnsDocx')?.addEventListener('click', () => docx('.nw-ans', fname('Answers', '.docx')));
  /* 문법 학습지(worksheet/<id>.html) — 쪽은 .ws-p, 정답지는 .ws-key, Pro 잠금 안내(.ws-lock)는 뺀다 */
  document.getElementById('wsPrint')?.addEventListener('click', () => printAs('Worksheet'));
  document.getElementById('wsDocx')?.addEventListener('click', () => docx('.ws-p:not(.ws-key):not(.ws-lock)', fname('Worksheet', '.docx')));
  document.getElementById('wsAnsDocx')?.addEventListener('click', () => docx('.ws-p.ws-key', fname('Answers', '.docx')));
})();
