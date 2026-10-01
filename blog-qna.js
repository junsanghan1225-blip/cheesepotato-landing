/* 블로그 목록 쪽(blog/index.html)의 「묻고 답하기」 칸 — 운영자 결정(2026-10-02): Q&A 는 블로그 안에.
   질문 · 답은 Supabase 표(qa_questions · qa_answers, db/add_community.sql)에서 읽기만 한다 — 읽기는 누구나(RLS).
   질문하기 · 답 달기 · 채택은 사이트 안 화면(/#learn/qna)에서 한다(로그인이 거기 있다).
   열쇠는 브라우저용 공개 값(anon)이다. 막는 것은 표의 RLS 다. */
(function () {
  var SB = 'https://tjgoevtvobvmlyefgxel.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc';
  var BOARDS = { grammar: '문법 · Grammar', words: '낱말 · 표현 · Words', topik: 'TOPIK', speak: '발음 · 말하기 · Speaking', life: '한국 생활 · Life' };
  var tabs = document.querySelectorAll('[data-rb-tab]');
  var panes = { posts: document.getElementById('rbPosts'), qna: document.getElementById('rbQna') };
  if (!panes.qna) return;
  var loaded = false, rows = [], answers = {}, board = 'all';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function body(s) { return esc(s).replace(/\n/g, '<br>'); }
  function get(path) {
    return fetch(SB + '/rest/v1/' + path, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  function show(which) {
    Object.keys(panes).forEach(function (k) { if (panes[k]) panes[k].hidden = k !== which; });
    tabs.forEach(function (b) { var on = b.dataset.rbTab === which; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    if (which === 'qna' && !loaded) load();
  }

  function load() {
    loaded = true;
    var list = document.getElementById('rbQnaList');
    list.innerHTML = '<p class="rb-qna-note">불러오는 중… · Loading…</p>';
    get('qa_questions?select=id,created_at,author,board,title,body,accepted_id&order=created_at.desc&limit=100')
      .then(function (q) {
        rows = q || [];
        if (!rows.length) return [];
        return get('qa_answers?select=id,question_id,author,body,created_at&order=created_at.asc&question_id=in.(' + rows.map(function (r) { return r.id; }).join(',') + ')');
      })
      .then(function (a) {
        answers = {};
        (a || []).forEach(function (x) { (answers[x.question_id] = answers[x.question_id] || []).push(x); });
        draw();
      })
      .catch(function () { list.innerHTML = '<p class="rb-qna-note">지금은 불러오지 못했어요. 잠시 뒤에 다시 열어 주세요. · Couldn’t load right now.</p>'; loaded = false; });
  }

  function draw() {
    var list = document.getElementById('rbQnaList');
    var chips = document.getElementById('rbQnaChips');
    var counts = {};
    rows.forEach(function (r) { counts[r.board] = (counts[r.board] || 0) + 1; });
    chips.innerHTML = '<button type="button" data-qb="all" class="' + (board === 'all' ? 'on' : '') + '">전체 ' + rows.length + '</button>' +
      Object.keys(BOARDS).filter(function (k) { return counts[k]; }).map(function (k) {
        return '<button type="button" data-qb="' + k + '" class="' + (board === k ? 'on' : '') + '">' + esc(BOARDS[k]) + ' ' + counts[k] + '</button>';
      }).join('');
    var shown = rows.filter(function (r) { return board === 'all' || r.board === board; });
    if (!shown.length) { list.innerHTML = '<p class="rb-qna-note">아직 질문이 없어요 — 첫 질문을 남겨 주세요! · No questions yet.</p>'; return; }
    list.innerHTML = shown.map(function (r) {
      var an = answers[r.id] || [];
      return '<details class="rb-q"><summary><span class="rb-q-b">' + esc(BOARDS[r.board] || r.board) + '</span>' +
        '<span class="rb-q-t">' + esc(r.title) + '</span><span class="rb-q-n">' + (an.length ? '답 ' + an.length : '답 기다림') + '</span></summary>' +
        (r.body ? '<div class="rb-q-body">' + body(r.body) + '</div>' : '') +
        an.map(function (a) {
          return '<div class="rb-a' + (a.id === r.accepted_id ? ' ok' : '') + '"><div class="rb-a-who">🧀 ' + esc(a.author) + (a.id === r.accepted_id ? ' · 채택' : '') + '</div>' + body(a.body) + '</div>';
        }).join('') +
        '<a class="rb-q-go" href="/#learn/qna/' + r.id + '">사이트에서 열기 · Open →</a></details>';
    }).join('');
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-rb-tab]');
    if (t) { show(t.dataset.rbTab); history.replaceState(null, '', t.dataset.rbTab === 'qna' ? '#qna' : location.pathname); return; }
    var c = ev.target.closest && ev.target.closest('[data-qb]');
    if (c) { board = c.dataset.qb; draw(); }
  });
  show(location.hash === '#qna' ? 'qna' : 'posts');
})();
