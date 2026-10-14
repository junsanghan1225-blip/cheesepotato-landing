/* 수사(숫자) 학습지(운영자 2026-10-14 「수사 조금 정리해서 학습지로」) — 손으로 쓴 쪽 numbers-worksheet/ 의 손잡이.
   인쇄는 브라우저 인쇄(PDF 로 저장). 「정답지」를 누르면 정답 쪽만 인쇄한다. CSP 때문에 인라인 스크립트 대신 이 파일. */
(function () {
  const body = document.body;
  const go = (ans) => { body.classList.toggle('show-ans', ans); window.print(); };
  document.getElementById('nwPrint')?.addEventListener('click', () => go(false));
  document.getElementById('nwAns')?.addEventListener('click', () => go(true));
  window.addEventListener('afterprint', () => body.classList.remove('show-ans'));

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
  const txt = (n) => { let r = ''; n.childNodes.forEach((c) => { r += c.nodeType === 3 ? c.textContent : c.classList?.contains('nw-line') ? '__________' : txt(c); }); return r.replace(/\s+/g, ' ').trim(); };
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
        else if (k.contains('nw-h')) P(txt(c), { sz: 32, b: 1, after: 60 });
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
  const slug = location.pathname.replace(/\/+$/, '').split('/').pop() || 'worksheet';
  document.getElementById('nwDocx')?.addEventListener('click', () => docx('.nw-work', `${slug}.docx`));
  document.getElementById('nwAnsDocx')?.addEventListener('click', () => docx('.nw-ans', `${slug}-answers.docx`));
})();
