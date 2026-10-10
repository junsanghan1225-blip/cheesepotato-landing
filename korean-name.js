/* 「내 이름을 한글로」(운영자 2026-10-10 「트래픽 A — 무료 도구 쪽」). /korean-name/ 이 부른다.
   1) 흔한 이름은 표에서(영어 · 베트남어 — 널리 쓰는 한글 표기)
   2) 일본어 로마자처럼 읽히면 일본어 표기 규칙으로(어두 가 · 어중 카, 긴소리는 적지 않음, 촉음은 ㅅ 받침)
   3) 그 밖은 소리 규칙으로 어림 — 화면에 「어림」이라고 적는다. 정답이 하나뿐인 일이 아니라서다.
   끝에 글자마다 로마자(국어의 로마자 표기법, 글자 하나씩 — 소리 바뀜은 반영 안 함)를 붙여 읽는 법을 보인다. */
(function () {
  const NAMES = {
    james: '제임스', john: '존', robert: '로버트', michael: '마이클', william: '윌리엄', david: '데이비드', richard: '리처드',
    joseph: '조지프', thomas: '토머스', charles: '찰스', daniel: '대니얼', matthew: '매슈', anthony: '앤서니', mark: '마크',
    paul: '폴', steven: '스티븐', andrew: '앤드루', kevin: '케빈', brian: '브라이언', george: '조지', edward: '에드워드',
    ryan: '라이언', jacob: '제이컵', nicholas: '니컬러스', eric: '에릭', jonathan: '조너선', justin: '저스틴', brandon: '브랜던',
    samuel: '새뮤얼', benjamin: '벤저민', alexander: '알렉산더', patrick: '패트릭', jack: '잭', peter: '피터', adam: '애덤',
    nathan: '네이선', henry: '헨리', ethan: '이선', noah: '노아', liam: '리엄', lucas: '루커스', mason: '메이슨', logan: '로건',
    oliver: '올리버', leo: '레오', luke: '루크', chris: '크리스', christopher: '크리스토퍼', tom: '톰', sam: '샘', max: '맥스',
    alex: '알렉스', tony: '토니', jason: '제이슨', aaron: '에런', sean: '숀', dylan: '딜런', tyler: '타일러', jose: '호세',
    carlos: '카를로스', luis: '루이스', juan: '후안', diego: '디에고', mohammed: '무함마드', muhammad: '무함마드', ali: '알리', omar: '오마르',
    mary: '메리', patricia: '퍼트리샤', jennifer: '제니퍼', linda: '린다', elizabeth: '엘리자베스', barbara: '바버라', susan: '수전',
    jessica: '제시카', sarah: '세라', karen: '캐런', nancy: '낸시', lisa: '리사', emily: '에밀리', emma: '에마', olivia: '올리비아',
    ava: '에이바', sophia: '소피아', sofia: '소피아', isabella: '이사벨라', mia: '미아', charlotte: '샬럿', amelia: '어밀리아',
    harper: '하퍼', evelyn: '에벌린', abigail: '애비게일', ella: '엘라', grace: '그레이스', chloe: '클로이', lily: '릴리',
    hannah: '해나', anna: '애나', laura: '로라', amy: '에이미', kate: '케이트', rachel: '레이철', rebecca: '리베카', julia: '줄리아',
    maria: '마리아', ana: '아나', lucy: '루시', alice: '앨리스', zoe: '조이', natalie: '내털리', victoria: '빅토리아',
    jasmine: '재스민', megan: '메건', ashley: '애슐리', amanda: '어맨다', stephanie: '스테파니', nicole: '니콜', michelle: '미셸',
    kelly: '켈리', jake: '제이크', mike: '마이크', steve: '스티브', dan: '댄', ben: '벤', joe: '조', jane: '제인', anne: '앤', dave: '데이브',
    pete: '피트', nate: '네이트', jade: '제이드', rose: '로즈', eve: '이브', kyle: '카일', blake: '블레이크', luna: '루나', ruby: '루비', sophie: '소피', ellie: '엘리', fatima: '파티마', aisha: '아이샤', sara: '사라', elena: '엘레나',
    // 베트남어(성 · 흔한 이름) — 소리 기호를 떼고 찾는다
    nguyen: '응우옌', tran: '쩐', le: '레', pham: '팜', hoang: '호앙', huynh: '후인', phan: '판', vu: '부', vo: '보', dang: '당',
    bui: '부이', do: '도', ho: '호', ngo: '응오', duong: '즈엉', ly: '리', anh: '아인', linh: '린', minh: '민', huong: '흐엉',
    hoa: '호아', lan: '란', mai: '마이', nam: '남', hung: '훙', long: '롱', tuan: '뚜언', thao: '타오', trang: '짱', ngoc: '응옥',
    hai: '하이', duc: '득', quang: '꽝', thu: '투', phuong: '프엉', hanh: '하인', khanh: '카인', dung: '중', hieu: '히에우',
    trung: '쭝', vy: '비', nhung: '늉', thanh: '타인', hien: '히엔', yen: '옌', tam: '땀',
  };

  // ── 일본어 로마자 → 한글(어두는 예사소리, 어중 · 어말은 거센소리) ──
  const JA = {
    a: '아', i: '이', u: '우', e: '에', o: '오',
    ka: '가카', ki: '기키', ku: '구쿠', ke: '게케', ko: '고코', ga: '가', gi: '기', gu: '구', ge: '게', go: '고',
    sa: '사', shi: '시', si: '시', su: '스', se: '세', so: '소', za: '자', ji: '지', zi: '지', zu: '즈', ze: '제', zo: '조',
    ta: '다타', chi: '지치', ti: '지치', tsu: '쓰', tu: '쓰', te: '데테', to: '도토', da: '다', de: '데', do: '도',
    na: '나', ni: '니', nu: '누', ne: '네', no: '노', ha: '하', hi: '히', fu: '후', hu: '후', he: '헤', ho: '호',
    ba: '바', bi: '비', bu: '부', be: '베', bo: '보', pa: '파', pi: '피', pu: '푸', pe: '페', po: '포',
    ma: '마', mi: '미', mu: '무', me: '메', mo: '모', ya: '야', yu: '유', yo: '요',
    ra: '라', ri: '리', ru: '루', re: '레', ro: '로', wa: '와', wo: '오',
    kya: '갸캬', kyu: '규큐', kyo: '교쿄', gya: '갸', gyu: '규', gyo: '교', sha: '샤', shu: '슈', sho: '쇼',
    ja: '자', ju: '주', jo: '조', cha: '자차', chu: '주추', cho: '조초', nya: '냐', nyu: '뉴', nyo: '뇨',
    hya: '햐', hyu: '휴', hyo: '효', bya: '뱌', byu: '뷰', byo: '뵤', pya: '퍄', pyu: '퓨', pyo: '표',
    mya: '먀', myu: '뮤', myo: '묘', rya: '랴', ryu: '류', ryo: '료',
  };
  const JA_KEYS = Object.keys(JA).sort((a, b) => b.length - a.length);
  const S0 = 0xac00;
  const addFinal = (syl, f) => { const c = syl.charCodeAt(syl.length - 1) - S0; if (c < 0 || c % 28) return syl; return syl.slice(0, -1) + String.fromCharCode(S0 + c + f); };
  function fromJapanese(w) {
    let out = '', i = 0, first = true;
    while (i < w.length) {
      const c = w[i];
      if (c === 'n' && (i + 1 === w.length || !/[aiueoy]/.test(w[i + 1]))) { if (!out) return null; out = addFinal(out, 4); i++; continue; }   // ㄴ 받침
      if (c === w[i + 1] && /[kstpc]/.test(c)) { if (!out) return null; out = addFinal(out, 19); i++; continue; }                         // 촉음 → ㅅ
      if (/[aiueo]/.test(c) && c === w[i - 1] || (c === 'u' && w[i - 1] === 'o') || (c === 'i' && w[i - 1] === 'e' && out.endsWith('에'))) { i++; continue; }   // 긴소리는 적지 않음
      const k = JA_KEYS.find((x) => w.startsWith(x, i));
      if (!k) return null;
      const v = JA[k];
      out += v.length === 2 ? (first ? v[0] : v[1]) : v;
      first = false; i += k.length;
    }
    return out || null;
  }

  // ── 그 밖 — 소리 규칙 어림 ──
  // 낱말을 「자음 묶음 + 모음」으로 쪼개 한 글자씩. 모음 사이 자음이 둘 이상이면 앞의 것은 받침(ㄴ ㅁ ㄹ ㅇ ㄱ ㅂ ㅅ)이 되거나 「으」를 붙인다.
  const V = { ya: '야', yo: '요', yu: '유', ye: '예', ee: '이', oo: '우', ea: '이', ai: '에이', ay: '에이', ou: '아우', ow: '오', oa: '오', ey: '이', ie: '이에', a: '아', e: '에', i: '이', o: '오', u: '우', y: '이' };
  const C = { b: 'ㅂ', c: 'ㅋ', d: 'ㄷ', f: 'ㅍ', g: 'ㄱ', h: 'ㅎ', j: 'ㅈ', k: 'ㅋ', l: 'ㄹ', m: 'ㅁ', n: 'ㄴ', p: 'ㅍ', q: 'ㅋ', r: 'ㄹ', s: 'ㅅ', t: 'ㅌ', v: 'ㅂ', w: 'ㅇ', x: 'ㅋ', z: 'ㅈ', ch: 'ㅊ', sh: 'ㅅ', th: 'ㅅ', ph: 'ㅍ', ck: 'ㅋ', kh: 'ㅋ', gh: 'ㄱ' };
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const JUNG = { 아: 0, 야: 2, 에: 5, 예: 7, 오: 8, 요: 12, 우: 13, 유: 17, 으: 18, 이: 20 };
  const make = (cho, vow) => String.fromCharCode(S0 + (CHO.indexOf(cho) * 21 + JUNG[vow]) * 28);
  const FIN = { n: 4, m: 16, l: 8, k: 1, c: 1, ck: 1, p: 17, b: 17, t: 19, d: 19 };   // 받침이 되는 자음(t · d 는 ㅅ 받침 — 「왓슨」)
  function fromSound(w0) {
    let w = w0.replace(/([b-df-hj-np-tv-z])\1/g, '$1');                     // 겹자음은 하나로(Isabelle → isabele)
    if (w.length > 3 && /[^aeiouy]e$/.test(w)) w = w.slice(0, -1);         // 끝의 소리 없는 e
    w = w.replace(/ie$/, 'i');
    const parts = w.match(/ch|sh|th|ph|ck|kh|gh|ya|yo|yu|ye|ee|oo|ea|ai|ay|ou|ow|oa|ey|ie|[a-z]/g) || [];
    const isV = (p) => V[p] != null;
    let out = '';
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (isV(p)) {
        const lead = i > 0 && !isV(parts[i - 1]) ? parts[i - 1] : null;
        const v = V[p];
        let cho = lead ? C[lead] || 'ㅇ' : 'ㅇ';
        if (lead === 'w' || lead === 'h' && i > 1 && !isV(parts[i - 2])) cho = 'ㅇ';
        if (lead === 'w') { out += ({ 아: '와', 에: '웨', 이: '위', 오: '워', 우: '우' }[v[0]] || '우') + v.slice(1); continue; }
        if (lead === 'sh') { out += ({ 아: '샤', 에: '셰', 이: '시', 오: '쇼', 우: '슈' }[v[0]] || '시') + v.slice(1); continue; }
        if (lead === 'ch') { out += ({ 아: '차', 에: '체', 이: '치', 오: '초', 우: '추' }[v[0]] || '치') + v.slice(1); continue; }
        if (lead === 'j') { out += ({ 아: '자', 에: '제', 이: '지', 오: '조', 우: '주' }[v[0]] || '지') + v.slice(1); continue; }
        out += make(cho, v[0]) + v.slice(1);
        continue;
      }
      // 자음 — 다음이 모음이면 그 모음의 첫소리(위에서 씀)
      if (i + 1 < parts.length && isV(parts[i + 1])) continue;
      const afterVowel = i > 0 && isV(parts[i - 1]);
      if (p === 'n' && parts[i + 1] === 'g') { out = addFinal(out, 21); continue; }                 // ng → ㅇ 받침
      if (p === 'h' || (p === 'r' && afterVowel && i + 1 === parts.length)) continue;              // 모음 뒤 h · 끝의 r 은 소리 없음
      const next = parts[i + 1], next2 = parts[i + 2];
      if ((next === 'r' || next === 'l') && next2 && isV(next2) && C[p]) {                          // br · pl … 은 한 덩어리(가브리엘 · 파블로)
        out += make(C[p], '으'); if (next === 'l') out = addFinal(out, 8); continue;
      }
      const atEnd = i + 1 === parts.length;
      if (afterVowel && out && FIN[p] != null && !(atEnd && (p === 't' || p === 'd'))) { out = addFinal(out, FIN[p]); continue; }   // 끝의 t · d 는 「트 · 드」
      if (p === 'sh') { out += '시'; continue; }
      if (p === 'ch' || p === 'j') { out += p === 'ch' ? '치' : '지'; continue; }
      if (p === 'x') { out += '크스'; continue; }
      const j = C[p]; if (j) out += make(j, '으');
    }
    return out || null;
  }

  // ── 한글 → 로마자(글자 하나씩) ──
  const RI = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  const RM = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  const RF = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
  const roman = (s) => [...s].map((ch) => { const c = ch.charCodeAt(0) - S0; if (c < 0 || c > 11171) return ch; return RI[Math.floor(c / 588)] + RM[Math.floor((c % 588) / 28)] + RF[c % 28]; });

  function convert(input) {
    const words = String(input || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
      .replace(/[^a-z\s'-]/g, ' ').split(/[\s'-]+/).filter(Boolean).slice(0, 4);
    let guessed = false;
    const out = words.map((w) => {
      if (NAMES[w]) return NAMES[w];
      const ja = fromJapanese(w);
      if (ja) return ja;
      guessed = true;
      return fromSound(w) || '';
    }).filter(Boolean);
    return { ko: out.join(' '), guessed };
  }

  const $ = (id) => document.getElementById(id);
  const inp = $('nmIn'), big = $('nmBig'), sub = $('nmSub'), note = $('nmNote');
  if (!inp) return;
  function draw() {
    const r = convert(inp.value);
    big.textContent = r.ko || '—';
    sub.textContent = r.ko ? roman(r.ko.replace(/\s/g, '')).join(' · ') : '';
    note.hidden = !r.guessed;
    try { if (r.ko) history.replaceState(null, '', '?name=' + encodeURIComponent(inp.value.trim())); } catch (e) {}
  }
  inp.addEventListener('input', draw);
  const q = new URLSearchParams(location.search).get('name');
  if (q) inp.value = q.slice(0, 60);
  draw();
  $('nmCopy')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(big.textContent); $('nmCopy').textContent = 'Copied ✓'; } catch (e) {}
  });

  /* ── 이름 도장 그림(운영자 2026-10-10 「판돈 4」 — 공유하고 싶게) ──
     인스타 스토리 크기(1080×1920). 가운데 빨간 도장(모양은 아래 sealStyle). 아래에 로마자와 사이트 주소 — 받은 사람이 「나도」 해 보게. */
  const FONT = "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
  /* 도장 한 개(S×S). 진짜 새김 도장처럼(운영자 2026-10-10 「더 타이트하게 · 레퍼런스 느낌」):
     굵은 테두리 안을 글자가 **꽉** 채운다 — 글자마다 실제 잉크 상자를 재서 칸에 늘려 맞추고, 칸 사이는 좁게.
     칸: 1자 통째 · 2자 좌우 · 3자는 「인」을 붙여 2×2 · 5자 이상 세 · 네 칸씩 두 줄(왼→오, 위→아래).
     마지막에 이름에서 나온 씨앗으로 잉크 번짐 · 빠진 점을 찍어 손도장 느낌(같은 이름은 늘 같은 그림). */
  const RED = '#C8102E';
  function glyph(t) {
    const P = 400, c = document.createElement('canvas'); c.width = c.height = P;
    const g = c.getContext('2d'); g.fillStyle = RED; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${P * 0.72}px ${FONT}`; g.fillText(t, P / 2, P / 2);
    const d = g.getImageData(0, 0, P, P).data; let x1 = P, y1 = P, x2 = -1, y2 = -1;
    for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) if (d[(y * P + x) * 4 + 3] > 60) {
      if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y;
    }
    return x2 < 0 ? null : { c, x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 };
  }
  /* 모양 넷 — 둥근 · 네모 × 양각(빨간 글자) · 음각(빨간 판에 흰 글자). 글자 수에 맞는 것 중에서 이름 씨앗으로 고른다
     (운영자 2026-10-10 「스타일 다양하게, 글자에 따라 적절하게」). 둥근 것은 4칸일 때만 — 2칸 · 5칸 이상은 원에서 글자가 너무 늘어난다.
     「다른 모양」 단추가 bump 를 하나씩 올려 다음 것으로. */
  const STYLES = [['round', 'yang'], ['square', 'yang'], ['round', 'eum'], ['square', 'eum']];
  function sealStyle(chars, bump) {
    const n = chars.length === 3 ? 4 : chars.length;
    const ok = STYLES.filter(([sh]) => sh === 'square' || n === 4);
    let s = 0; for (const ch of chars.join('')) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return ok[(s + bump) % ok.length];
  }
  function sealCanvas(chars0, S, shape, mode) {
    // 3자 이름은 끝에 「인(印)」을 붙여 4칸으로(홍길동 → 홍길/동인) — 인감처럼. 읽는 차례는 왼→오, 위→아래.
    const chars = chars0.length === 3 ? [...chars0, '인'] : chars0, n = chars.length;
    const cols = n === 1 ? 1 : n <= 4 ? 2 : n <= 6 ? 3 : 4, rows = n <= 2 ? 1 : Math.ceil(n / cols);
    const B = S * 0.045, eum = mode === 'eum';
    // 1) 네모 판에 글자를 칸마다 꽉 채워 그린다
    const A = shape === 'round' ? S : Math.round(S - 2 * (eum ? S * 0.07 : B + S * 0.03));
    const sq = document.createElement('canvas'); sq.width = sq.height = A;
    const q = sq.getContext('2d'), gap = A * 0.03;
    chars.forEach((t, i) => {
      const gl = glyph(t); if (!gl) return;
      const r = Math.floor(i / cols), inRow = r === rows - 1 ? n - cols * r : cols;   // 마지막 줄이 덜 차면 넓게
      const cw = A / inRow, ch = A / rows;
      q.drawImage(gl.c, gl.x, gl.y, gl.w, gl.h, (i - cols * r) * cw + gap / 2, r * ch + gap / 2, cw - gap, ch - gap);
    });
    let ink = sq;
    if (shape === 'round') {
      // 2) 네모 판을 동그라미 안으로 부풀려 옮긴다(원 → 네모 대응) — 글자가 둥근 테두리까지 꽉 찬다
      const Ri = S / 2 - (eum ? S * 0.07 : B + S * 0.03);
      ink = document.createElement('canvas'); ink.width = ink.height = S;
      const w = ink.getContext('2d'), src = q.getImageData(0, 0, A, A).data, out = w.createImageData(S, S), o = out.data, h2 = 2 * Math.SQRT2;
      for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
        const u = (px + .5 - S / 2) / Ri, v = (py + .5 - S / 2) / Ri; if (u * u + v * v > 1) continue;
        const a = 2 + u * u - v * v, b = 2 - u * u + v * v;
        const x = .5 * Math.sqrt(Math.max(0, a + h2 * u)) - .5 * Math.sqrt(Math.max(0, a - h2 * u));
        const y = .5 * Math.sqrt(Math.max(0, b + h2 * v)) - .5 * Math.sqrt(Math.max(0, b - h2 * v));
        const sx = Math.min(A - 1, Math.max(0, Math.round((x + 1) / 2 * A - .5))), sy = Math.min(A - 1, Math.max(0, Math.round((y + 1) / 2 * A - .5)));
        const si = (sy * A + sx) * 4, di = (py * S + px) * 4;
        o[di] = src[si]; o[di + 1] = src[si + 1]; o[di + 2] = src[si + 2]; o[di + 3] = src[si + 3];
      }
      w.putImageData(out, 0, 0);
    }
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'), off = (S - ink.width) / 2;
    const path = () => { g.beginPath(); if (shape === 'round') g.arc(S / 2, S / 2, S / 2 - B / 2, 0, 7); else if (g.roundRect) g.roundRect(B / 2, B / 2, S - B, S - B, S * 0.03); else g.rect(B / 2, B / 2, S - B, S - B); };
    if (eum) {                                                        // 빨간 판을 칠하고 글자 자리를 파낸다
      g.fillStyle = RED; path(); g.lineWidth = B; g.strokeStyle = RED; g.fill(); g.stroke();
      g.globalCompositeOperation = 'destination-out'; g.drawImage(ink, off, off); g.globalCompositeOperation = 'source-over';
    } else {
      g.drawImage(ink, off, off); g.strokeStyle = RED; g.lineWidth = B; path(); g.stroke();
    }
    // 손도장 느낌 — 잉크가 덜 묻은 점 · 긁힌 자국
    let s = 7; for (const ch of chars.join('')) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 900; i++) { g.globalAlpha = .25 + rnd() * .75; g.beginPath(); g.arc(rnd() * S, rnd() * S, .6 + rnd() * rnd() * S * .008, 0, 7); g.fill(); }
    for (let i = 0; i < 14; i++) {
      g.globalAlpha = .15 + rnd() * .25; g.lineWidth = 1 + rnd() * 3; g.beginPath();
      const x = rnd() * S, y = rnd() * S, a = rnd() * 7, l = S * (.03 + rnd() * .08);
      g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 5; i++) {                                     // 잉크가 옅은 큰 얼룩
      const x = rnd() * S, y = rnd() * S, r = S * (.08 + rnd() * .12), gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    return c;
  }
  let bump = 0;
  async function sealBlob(ko, rom) {
    const chars = [...ko.replace(/\s/g, '')].slice(0, 8);
    if (!chars.length) return null;
    try { await document.fonts.ready; } catch (e) {}
    const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#F6EFE2'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1B1512'; g.textAlign = 'center';
    g.font = `700 54px ${FONT}`; g.fillText('My name in Korean', W / 2, 300);
    g.fillStyle = '#8C7A66'; g.font = `600 40px ${FONT}`; g.fillText('한국어로 내 이름', W / 2, 370);
    const S = 720, [shape, mode] = sealStyle(chars, bump), seal = sealCanvas(chars, S, shape, mode);
    g.save(); g.translate(W / 2, 470 + S / 2); g.rotate(-0.03); g.drawImage(seal, -S / 2, -S / 2); g.restore();
    g.textBaseline = 'alphabetic'; g.fillStyle = '#1B1512'; g.font = `800 96px ${FONT}`; g.fillText(ko, W / 2, 1340);
    g.fillStyle = '#4E3E31'; g.font = `600 42px ${FONT}`; g.fillText(rom, W / 2, 1420);
    g.fillStyle = '#8C7A66'; g.font = `600 38px ${FONT}`; g.fillText("What's yours? 🥔🧀", W / 2, 1640);
    g.fillStyle = '#C4551C'; g.font = `800 44px ${FONT}`; g.fillText('everykoreans.com/korean-name', W / 2, 1710);
    return new Promise((res) => c.toBlob(res, 'image/png'));
  }
  let sealUrl = null;
  async function sealPaint() {
    const box = $('nmSeal'), img = $('nmSealImg'); if (!box || !img) return;
    const ko = big.textContent;
    if (!ko || ko === '—') { box.hidden = true; return; }
    const blob = await sealBlob(ko, sub.textContent);
    if (!blob || big.textContent !== ko) return;
    if (sealUrl) URL.revokeObjectURL(sealUrl);
    img.src = sealUrl = URL.createObjectURL(blob); box.hidden = false;
  }
  let sealT = 0;
  inp.addEventListener('input', () => { clearTimeout(sealT); sealT = setTimeout(sealPaint, 350); });
  sealPaint();
  $('nmStyle')?.addEventListener('click', () => { bump++; sealPaint(); });
  inp.addEventListener('input', () => { bump = 0; });
  $('nmSave')?.addEventListener('click', async () => {
    const ko = big.textContent, blob = await sealBlob(ko, sub.textContent); if (!blob) return;
    const file = new File([blob], `my-korean-name-${Date.now()}.png`, { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: `My name in Korean: ${ko} — everykoreans.com/korean-name` }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
})();
