/* 반 · 숙제(#learn/class) — 반 화면 · 숙제 고르기 · 선생님 · 학생 화면 · 첫 화면 숙제 카드 · 다음 숙제 알림.
   웹 리팩터링 4단계(2026-11-15 운영자 「반 · 숙제 분리도 진행해줘」): app.module.js 에 있던 구역을 그대로 옮겼다.
   반 화면을 열 때 · 반 학생이 첫 화면을 볼 때만 받는다(app.module.js 의 clsNeed).
   본문의 이름(sb · t · esc · 자료 · 상태 …)은 G 로 읽고 쓴다 — G 는 본문의 CLS_G(읽기 · 쓰기 다리)이고, 이 파일을 받기 전에 window.cpClsG 에 걸어 둔다.
   이 파일이 쓰는 본문 이름이 늘면 tools 로 다시 뽑지 말고, 본문 CLS_G 에 한 줄 더한다(빠지면 그 길에서 G.이름 이 undefined). */
const G = window.cpClsG;
/* ══ 반 · 숙제 (#learn/class) ═════════════════════════════════════════
   운영자 결정(2026-10-02): 반은 운영자만 만든다 · 학생은 반 링크(#learn/class/join/코드)나 코드로 들어온다 ·
   첫 판 숙제는 코스 레슨 · 단어 세션 · 문법(바꿔 쓰기). 표와 권한은 db/add_classes.sql.
   「했음」은 학생 화면이 스스로 적는다 — 레슨을 끝내면(finishLesson) · 단어 세션을 끝내면(words.js sessionEnd) ·
   문법 바꿔 쓰기를 끝까지 하면 clsMark → 서버 cls_mark 가 그 사람이 든 반의 맞는 숙제에만 붙인다. */
const cls = { sub: {}, needSub: false, rows: [], hw: [], done: [], members: [], err: '', busy: false, code: '', msg: '', open: {}, tab: {}, hi: '', auto: '', stu: {}, note: {}, tgt: {}, fb: {}, need: false, pre: {}, due: {}, queue: {}, re: {}, pick: {}, q: {}, fk: {} };
let clsSession = null;
const clsIsAdmin = () => clsSession?.user?.email === G.ADMIN_EMAIL;
/* 선생님 계정(2026-10-06, db/add_class_teachers.sql) — 운영자가 올린 메일도 반을 만든다. 서버 cls_is_admin() 이 정답 */
let clsTeacher = false, clsTeachers = [];
const clsCanMake = () => clsIsAdmin() || clsTeacher;
const CLS_KIND = { lesson: ['', '레슨', 'Lesson'], vocab: ['', '단어 세션', 'Word session'], grammar: ['', '문법', 'Grammar'],
  twrite: ['', 'TOPIK 쓰기 · AI 채점', 'TOPIK writing · AI score'], tread: ['', 'TOPIK 읽기 유형', 'TOPIK reading type'],   // TOPIK 둘은 2026-10-03(db/add_classes_topik.sql)
  /* 2026-10-11 운영자 「숙제 다양하게」 — db/add_classes_more_kinds.sql: 듣기 유형 · 모의고사 회차 · 회화 장면 · 동화책 */
  tlisten: ['', 'TOPIK 듣기 유형', 'TOPIK listening type'], tmock: ['', 'TOPIK 모의고사', 'TOPIK mock exam'], convo: ['', '회화 연습', 'Conversation'], story: ['📗', '동화책', 'Storybook'], free: ['✍️', '글 · 사진 제출', 'Written / photo'],
  translate: ['', '번역 연습', 'Translation practice'] };   // 번역 연습 한 편(2026-10-11 「translate 도」)
const clsLink = (code) => `https://everykoreans.com/#learn/class/join/${code}`;

/* 반에 든 사람만 서버를 부른다 — 모두가 레슨 하나 끝낼 때마다 부르면 쓸데없다. 표시는 로그인할 때 · 반 화면을 열 때 맞춘다.
   (로그인 알림이 이 줄보다 먼저 올 수 있어 상수 대신 글자를 그대로 쓴다) */
/* 반 학생에게는 선생님 쪽(teacher.html — Preply · WhatsApp) 링크를 숨긴다(운영자 2026-10-07 「WhatsApp 링크도 숨겨줘」).
   Preply 학생에게 밖의 연락처가 보이지 않게 — 반은 숙제 · 복습용으로만. 실제 숨기기는 CSS(body.cls-in). */

async function clsDraw(sub) {
  /* 주소(#learn/class…)로 바로 들어오면 이 코드가 다 읽히기 전에 불린다 — 맡겨 두었다가 맨 끝에서 그린다 */
  if (!window.cpClsReady) { window.cpClsPending = sub || ''; return; }
  const [a, b] = String(sub || '').split('/');
  if (a === 'join' && b) { G.clsSetRole('student'); cls.code = b.toUpperCase(); try { sessionStorage.setItem('cp_cls_code', cls.code); } catch (e) {} }
  else { try { cls.code = cls.code || sessionStorage.getItem('cp_cls_code') || ''; } catch (e) {} }
  window.cpMark('learn', cls.code ? `class/join/${cls.code}` : 'class');
  const { data: { session } } = await G.sb.auth.getSession();
  clsSession = session;
  if (!session) { clsPaint(); return; }
  await clsLoad();
}
/* 숙제 고르는 자료(레슨 · 문법 · TOPIK · 회화 · 동화책 · 번역 · 단어 주제) 불러오기 — 반 화면 · 「숙제로 내기」 단추가 같이 쓴다 */
async function clsCatNeed() {
  await Promise.all([G.coursesNeed(), G.sbNeed(), G.tqNeedData(), G.cvNeed(), G.bkNeed(), G.trNeed(), Promise.all([import('./vocab-topik1.js?v=32cde420'), import(G.VOCAB2_URL)]).then(([m, m2]) => { if (!clsVTopics) {
    /* 주제마다 낱말 수(두 과정) — 낱말이 없는 주제는 숙제로 못 고르게(새 작은 주제는 안티 그래비티가 낱말을 붙인 뒤에 채워진다) */
    clsVN = new Map(); for (const w of [...m.VOCAB, ...m2.VOCAB]) for (const x of w.t || []) { clsVN.set(x, (clsVN.get(x) || 0) + 1); const a = x.split('/')[0]; clsVN.set(a, (clsVN.get(a) || 0) + 1); }
    clsVTopics = m.VOCAB_TOPICS; clsCat = null; } })]).catch(() => {});
}
async function clsLoad() {
  cls.err = '';
  try { const tr = await G.sb.rpc('cls_is_admin'); clsTeacher = !tr.error && !!tr.data; } catch (e) { clsTeacher = false; }
  if (clsIsAdmin()) { const tl = await G.sb.from('class_teachers').select('email, name, added_at').order('added_at'); clsTeachers = tl.error ? null : (tl.data || []); }
  const r = await G.sb.from('classes').select('id, name, code, owner, archived, created_at').order('created_at');
  if (r.error) { cls.rows = []; cls.err = clsIsAdmin() ? G.t('반 표가 아직 없어요. Supabase SQL Editor 에서 db/add_classes.sql 을 돌려 주세요.', 'Run db/add_classes.sql first.') : G.t('반 기능을 준비하고 있어요. 조금 뒤에 다시 와 주세요.', 'Classes are coming soon.'); clsPaint(); return; }
  cls.rows = (r.data || []).filter((c) => !c.archived);
  const ids = cls.rows.map((c) => c.id);
  const [h, d, m] = ids.length ? await Promise.all([
    G.sb.from('class_homework').select('*').in('class_id', ids).order('created_at', { ascending: false }),
    G.sb.from('class_done').select('hw_id, user_id, n, score, done_at'),
    clsCanMake() ? G.sb.from('class_members').select('class_id, user_id, name, joined_at').in('class_id', ids).order('joined_at') : { data: [] },
  ]) : [{ data: [] }, { data: [] }, { data: [] }];
  cls.hw = h.data || []; cls.done = d.data || []; cls.members = m.data || [];
  await clsLoadExtra(ids, cls.hw.map((x) => x.id));
  clsApplyLevel();
  try { localStorage.setItem('cp_cls_in', cls.rows.some((c) => c.owner !== clsSession.user.id) ? '1' : ''); } catch (e) {}
  G.clsBodyMark();
  /* QR · 반 링크로 왔고 로그인도 했다 — 이름을 묻지 않고 바로 들어간다(운영자 2026-10-07 「로그인만 하면 바로」).
     이름은 그 계정 이름(없으면 메일 앞부분) — 반 화면에서 언제든 바꿀 수 있게 하지는 않고, 선생님이 리포트에서 메일로도 알아본다. */
  if (cls.code && !cls.rows.some((c) => c.code === cls.code) && cls.auto !== cls.code) {
    cls.auto = cls.code;
    if (await clsJoin(cls.code, clsDefaultName())) return;
  }
  /* 숙제 고르는 칸에 쓸 자료(레슨 · 문법 목록) — 선생님만 */
  if (clsCanMake()) await clsCatNeed();
  clsPaint();
}

/* ── 학생 관리 자료(운영자 2026-10-07 — db/add_class_students.sql) ──
   cls.stu  : `${반}:${학생}` → 선생님이 정한 레벨(lv · goal · grade) · 학생에게 한마디(msg)  — 학생은 자기 줄만 읽는다
   cls.note : `${반}:${학생}` → 선생님만 보는 메모
   cls.tgt  : 숙제 id → 그 숙제를 받는 학생들(Set). 없으면 반 전체 숙제(1:1 반에서 학생마다 다른 숙제를 내려고) */
async function clsLoadExtra(ids, hwIds) {
  cls.stu = {}; cls.note = {}; cls.tgt = {}; cls.fb = {}; cls.need = false;
  /* 선생님 신청(db/add_teacher_requests.sql) — 내 신청 · 운영자는 기다리는 신청 전부 */
  cls.treq = null; cls.reqs = []; cls.needReq = false;
  if (clsSession) {
    const tr0 = await G.sb.from('teacher_request').select('*').order('at', { ascending: false });
    if (tr0.error) cls.needReq = true; else { const all = tr0.data || []; cls.treq = all.find((x) => x.user_id === clsSession.user.id) || null; if (clsIsAdmin()) cls.reqs = all.filter((x) => x.status === 'pending'); }
  }
  if (!ids.length) return;
  /* 선생님 코멘트(db/add_class_feedback.sql) — 표가 없으면 조용히 빈칸 */
  /* 제출(db/add_class_submit.sql) — 표가 없으면 조용히 빈칸 */
  cls.sub = {}; cls.needSub = false;
  if (hwIds.length) { const sr = await G.sb.from('class_submission').select('hw_id, user_id, body, image_path, at, reviewed_at').in('hw_id', hwIds); if (sr.error) cls.needSub = true; else for (const x of sr.data || []) cls.sub[`${x.hw_id}:${x.user_id}`] = x; }
  if (hwIds.length) { const f = await G.sb.from('class_feedback').select('hw_id, user_id, msg, at').in('hw_id', hwIds); if (f.error) cls.needFb = true; else { cls.needFb = false; for (const x of f.data || []) cls.fb[`${x.hw_id}:${x.user_id}`] = x; } }
  const own = cls.rows.filter((c) => c.owner === clsSession?.user?.id).map((c) => c.id);
  const [a, b, c2] = await Promise.all([
    G.sb.from('class_student').select('*').in('class_id', ids),
    own.length ? G.sb.from('class_student_note').select('class_id, user_id, note').in('class_id', own) : { data: [] },
    hwIds.length ? G.sb.from('class_hw_target').select('hw_id, user_id').in('hw_id', hwIds) : { data: [] },
  ]);
  if (a.error || b.error || c2.error) cls.need = true;   // 표가 아직 없다 — 선생님에게 SQL 안내
  for (const x of a.data || []) cls.stu[`${x.class_id}:${x.user_id}`] = x;
  for (const x of b.data || []) cls.note[`${x.class_id}:${x.user_id}`] = x.note;
  for (const x of c2.data || []) (cls.tgt[x.hw_id] ??= new Set()).add(x.user_id);
}
/* 그 학생이 받는 숙제 — 대상이 정해진 숙제는 그 학생들에게만 */
const clsHwFor = (cid, uid, hw = cls.hw, tgt = cls.tgt) => hw.filter((h) => h.class_id === cid && (!tgt[h.id] || tgt[h.id].has(uid)));
const clsIsDone = (h, d) => !!d && d.n >= (h.kind === 'vocab' ? h.goal : 1);
/* 선생님이 정한 레벨 → 이 기기의 내 레벨(레벨테스트 없이 바로 배정, 운영자 2026-10-07).
   선생님이 바꾸면(updated_at 이 달라지면) 다시 맞춘다. 반이 여럿이면 가장 최근에 정한 것. */
function clsApplyLevel(rows) {
  const uid = clsSession?.user?.id; if (!uid) return;
  const mine = (rows || Object.values(cls.stu)).filter((x) => x.user_id === uid && x.lv != null).sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))[0];
  if (!mine) return;
  let seen = ''; try { seen = localStorage.getItem('cp_cls_lv') || ''; } catch (e) {}
  const key = `${mine.class_id}:${mine.updated_at}`;
  if (seen === key) return;
  const cur = G.ltLoadLevel() || {};
  G.ltSaveLevel(mine.lv, mine.goal || null, cur.time || null, { grade: mine.goal === 'topik' ? mine.grade ?? null : null, by: 'teacher' });
  try { localStorage.setItem('cp_cls_lv', key); } catch (e) {}
  G.track('반레벨배정받음');
}
/* 레벨 이름 — 감자 L3 · 아기 감자 / 치즈 2급 · 슬라이스 치즈 */
function clsLvInfo(x) {
  if (!x || x.lv == null) return null;
  const b = G.myLevelBadge({ lv: x.lv, goal: x.goal || null, grade: x.grade ?? null });
  if (!b) return null;
  const name = b.kind === 'cheese' ? G.t(`치즈 ${b.step ? b.step + '급' : '0'} · ${b.ko}`, `Cheese ${b.step} · ${b.en}`) : G.t(`감자 L${b.step} · ${b.ko}`, `Potato L${b.step} · ${b.en}`);
  return { icon: b.icon, name, sub: G.LT_LEVELS[x.lv] ? G.t(G.LT_LEVELS[x.lv].ko, G.LT_LEVELS[x.lv].en) : '' };
}
const clsLvOptions = (x) => {
  const v = !x || x.lv == null ? '' : x.goal === 'topik' ? `c:${x.grade ?? 0}` : `p:${x.lv}`;
  const o = (val, label) => `<option value="${val}"${val === v ? ' selected' : ''}>${G.esc(label)}</option>`;
  return o('', G.t('정하지 않음(레벨테스트로)', 'Not set (level test)')) +
    `<optgroup label="${G.esc(G.t('한국어 배우기 — 감자', 'Learn Korean — potato'))}">${G.LT_LEVELS.map((L) => o(`p:${L.lv}`, G.t(`감자 L${L.lv} · ${L.ko}`, `Potato L${L.lv} · ${L.en}`))).join('')}</optgroup>` +
    `<optgroup label="${G.esc(G.t('TOPIK 준비 — 치즈(넘은 급수)', 'TOPIK prep — cheese (level passed)'))}">${[0, 1, 2, 3, 4, 5, 6].map((g) => o(`c:${g}`, G.t(`치즈 ${g ? g + '급' : '0 (출발)'} · ${G.cheeseLevel(g).ko}`, `Cheese ${g} · ${G.cheeseLevel(g).en}`))).join('')}</optgroup>`;
};
const clsDay = (iso) => iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString(G.isEn() ? 'en-US' : 'ko-KR', { month: 'short', day: 'numeric' }) : '';
/* 기한 글 — D-day · 오늘까지 · 기한 지남 */
/* 학생 줄 오른쪽 알약 — 날짜까지 길게 쓰지 않고 「기한 지남 · 오늘까지 · 내일 · D-3」만(운영자 2026-10-11 「학생들이 정신없대」) */
function clsDueShort(h) {
  const du = clsDue(h); if (!du) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0); const d = Math.round((new Date(`${h.due}T00:00:00`) - today) / 864e5);
  return `<span class="td-due ${du.cls}">${G.esc(d < 0 ? G.t('기한 지남', 'Late') : d === 0 ? G.t('오늘까지', 'Today') : d === 1 ? G.t('내일까지', 'Tomorrow') : `D-${d}`)}</span>`;
}
function clsDue(h) {
  if (!h.due) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = Math.round((new Date(`${h.due}T00:00:00`) - today) / 864e5);
  return d < 0 ? { cls: 'late', txt: G.t(`기한 지남 · ${clsDay(h.due)}`, `Late · ${clsDay(h.due)}`) } : d === 0 ? { cls: 'today', txt: G.t('오늘까지', 'Due today') }
    : { cls: d <= 2 ? 'soon' : '', txt: G.t(`D-${d} · ${clsDay(h.due)}까지`, `D-${d} · due ${clsDay(h.due)}`) };
}
const clsScoreTxt = (d) => !d ? '' : d.score?.max ? G.t(`${d.score.total}/${d.score.max}점`, `${d.score.total}/${d.score.max} pts`) : d.score?.n ? G.t(`${d.score.ok}/${d.score.n} 맞음`, `${d.score.ok}/${d.score.n} right`) : d.score?.wrong != null ? G.t(`틀림 ${d.score.wrong}`, `${d.score.wrong} wrong`) : '';
/* 학생의 「내 반」 패널 — 첫 화면(home)과 반 화면이 같이 쓴다(운영자 2026-10-07 「학생이 느껴도 전문적이구나」).
   머리(반 이름 · 선생님이 정한 레벨) → 선생님 한마디 → 진행 고리(N개 중 M개 · 다음 기한 · 늦은 것) → 할 숙제(기한 순, 상태 칩)
   → 다 했으면 복습 권유 → 끝낸 숙제(점수 · 날짜, 접힘). */
/* 학생 「내 반」 패널 — 「오늘 할 일」 카드(.td-*)와 같은 틀로(운영자 2026-10-07 「UI 통일 — 동떨어진 느낌」 · 「XP 는 빼고 해야 한다는 느낌만」).
   머리(반 이름 · 레벨 배지) → 선생님 한마디(말풍선) → 지금 할 숙제(치즈 큰 단추) → 진행 막대 → 남은 숙제 줄(체크 줄) → 끝낸 숙제. */
function clsStudentPanel(c, D, home) {
  const hw = clsHwFor(c.id, D.uid, D.hw, D.tgt).slice().sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  const dn = (h) => D.done.find((x) => x.hw_id === h.id);
  const isFin = (h) => clsIsDone(h, dn(h));
  const todo = hw.filter((h) => !isFin(h)).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  const fin = hw.filter(isFin);
  const late = todo.filter((h) => clsDue(h)?.cls === 'late').length;
  const st = D.stu?.[`${c.id}:${D.uid}`], lv = clsLvInfo(st), msg = st?.msg;
  const now = todo[0], rest = todo.slice(1);
  const kindTx = (h) => { const [, ko, en] = CLS_KIND[h.kind] || ['', '', '']; const d = dn(h); return `${G.t(ko, en)}${h.kind === 'vocab' ? ` · ${G.t(`${d?.n || 0} / ${h.goal}번`, `${d?.n || 0} / ${h.goal}`)}` : ''}`; };
  const dueTx = () => '';
  /* 선생님 코멘트 — 끝낸 숙제 줄 아래에. 새로 온 것(이 기기에서 아직 안 본 것)이 있으면 위에 한 줄 알리고 끝낸 숙제를 펼쳐 둔다 */
  const fbOf = (h) => D.fb?.[`${h.id}:${D.uid}`];
  let fbSeen = {}; try { fbSeen = JSON.parse(localStorage.getItem('cp_cls_fb') || '{}'); } catch (e) {}
  const fbNew = fin.filter((h) => fbOf(h) && fbSeen[h.id] !== fbOf(h).at);
  if (fbNew.length) { fbNew.forEach((h) => { fbSeen[h.id] = fbOf(h).at; }); try { localStorage.setItem('cp_cls_fb', JSON.stringify(fbSeen)); } catch (e) {} }
  const slot = (h, done) => `<button type="button" class="td-slot${done ? ' done' : ''}${done && fbOf(h) ? ' has-fb' : ''}"${done ? ' disabled' : ` data-clsgo="${h.id}"`}>` +
    `<span class="td-chk" aria-hidden="true">${done ? G.TD_CHECK : ''}</span>` +
    `<span class="td-txt"><span class="td-t">${(CLS_KIND[h.kind] || [''])[0]} ${G.esc(h.title)}</span><span class="td-k">${done ? G.esc(`${clsDay(dn(h)?.done_at)}${clsScoreTxt(dn(h)) ? ` · ${clsScoreTxt(dn(h))}` : ''}`) : G.esc(kindTx(h)) + dueTx(h)}</span></span>` +
    `<span class="td-end">${done ? '' : clsDueShort(h) || '<span aria-hidden="true">›</span>'}</span>${done && fbOf(h) ? `<span class="ck-fb">${G.esc(fbOf(h).msg)}</span>` : ''}</button>`;
  const shownRest = home ? rest.slice(0, 3) : rest;
  const pct = hw.length ? Math.round((fin.length / hw.length) * 100) : 0;
  const nd = now && clsDue(now);
  const hero = !hw.length ? `<div class="td-now done"><div class="td-now-txt"><span class="td-now-k">${G.esc(G.t('선생님 숙제', 'Homework'))}</span><span class="td-now-t">${G.esc(G.t('아직 받은 숙제가 없어요', 'No homework yet'))}</span><span class="td-now-s">${G.esc(G.t('선생님이 숙제를 내면 여기에 떠요', 'It shows up here when your teacher gives some'))}</span></div></div>`
    : !now ? `<div class="td-now done"><div class="td-now-txt"><span class="td-now-k">${G.esc(G.t('숙제 끝!', 'All done!'))}</span><span class="td-now-t">${G.esc(G.t('숙제를 다 했어요. 복습으로 굳혀요.', 'All homework done: lock it in with a review.'))}</span></div>` +
        `<span class="ck-done-btns"><button type="button" class="td-now-go" data-ckgo="wrong">${G.esc(G.t('오답 노트', 'My mistakes'))}</button><button type="button" class="td-now-go" data-ckgo="words">${G.esc(G.t('단어 복습', 'Words'))}</button></span></div>`
    : `<button type="button" class="td-now${nd?.cls === 'late' ? ' ck-late' : ''}" data-clsgo="${now.id}"><div class="td-now-txt"><span class="td-now-k">${G.esc(G.t('지금 할 숙제', 'Do this now'))}${nd ? ` · ${G.esc(nd.cls === 'late' ? G.t('기한 지남', 'Late') : nd.cls === 'today' ? G.t('오늘까지', 'Due today') : nd.txt)}` : ''}</span>` +
      `<span class="td-now-t">${(CLS_KIND[now.kind] || [''])[0]} ${G.esc(now.title)}</span><span class="td-now-s">${G.esc(kindTx(now))}</span></div><span class="td-now-go">${G.esc(G.t('시작', 'Start'))} →</span></button>`;
  return `<div class="td-card ck">` +
    `<div class="td-head"><div><div class="td-kicker">${G.esc(G.t('내 반 · 선생님 숙제', 'My class · homework'))}</div><div class="td-title">${G.esc(c.name)}</div></div>` +
      (lv ? `<span class="td-badge">${lv.icon}<span>${G.esc(lv.name)}</span></span>` : '') + '</div>' +
    (msg ? `<div class="td-buddy"><img class="ck-teach" src="logo-256.png" alt="" width="44" height="44"><p class="td-bubble"><small class="ck-from">${G.esc(G.t('선생님 한마디', 'From your teacher'))}</small>${G.esc(msg)}</p></div>` : '') +
    `<div class="td-top">${hero}</div>` +
    (hw.length ? `<p class="td-count">${G.esc(G.t(`숙제 ${hw.length}개 중 ${fin.length}개 했어요`, `${fin.length} of ${hw.length} done`))}${late ? ` · <em class="ck-d late">${G.esc(G.t(`기한 지남 ${late}`, `${late} late`))}</em>` : ''}</p>` : '') +
    (rest.length ? `<div class="td-next-h">${G.esc(G.t('그다음 숙제', 'Next'))}</div>` : '') +
    (shownRest.length ? `<div class="td-slots">${shownRest.map((h) => slot(h, false)).join('')}</div>` : '') +
    (home && rest.length > shownRest.length ? `<button type="button" class="ck-more" data-clsopen>${G.esc(G.t(`숙제 ${rest.length - shownRest.length}개 더 보기`, `${rest.length - shownRest.length} more`))} →</button>` : '') +
    (fin.length ? `<details class="ck-fin"><summary>${G.esc(G.t(`끝낸 숙제 ${fin.length}개`, `${fin.length} finished`))}${fbNew.length ? ` <em class="ck-newc">${G.esc(G.t('새 코멘트', 'New comment'))}</em>` : ''}</summary><div class="td-slots">${fin.map((h) => slot(h, true)).join('')}</div></details>` : '') +
    (home ? `<button type="button" class="ck-open" data-clsopen>${G.esc(G.t('반 화면 열기', 'Open class'))} →</button>` : '') + '</div>';
}

/* 오늘 챙길 학생(운영자 2026-10-07 — 구글 클래스룸 · 듀오링고 스쿨의 「주의가 필요한 학생」처럼): 내 반 전체에서
   ① 기한 지난 숙제가 있는 학생 ② 받은 숙제가 남았는데 3일 넘게 숙제 기록이 없는 학생 ③ 이틀 안에 숙제를 끝냈는데 아직 코멘트를 안 단 것.
   누르면 그 반의 「학생 관리」 탭 · 그 학생 카드가 열린다. */
function clsCareHtml() {
  const uid = clsSession.user.id, mine = cls.rows.filter((c) => c.owner === uid);
  const late = [], quiet = [], fresh = [];
  const now = Date.now();
  for (const c of mine) for (const m of cls.members.filter((x) => x.class_id === c.id)) {
    const hw = clsHwFor(c.id, m.user_id), dn = (h) => cls.done.find((x) => x.hw_id === h.id && x.user_id === m.user_id);
    const todo = hw.filter((h) => !clsIsDone(h, dn(h)));
    const nl = todo.filter((h) => clsDue(h)?.cls === 'late').length;
    if (nl) late.push({ c, m, n: nl });
    const last = hw.map((h) => dn(h)?.done_at).filter(Boolean).sort().pop() || m.joined_at;
    if (todo.length && !nl && last && now - Date.parse(last) > 3 * 864e5) quiet.push({ c, m, days: Math.floor((now - Date.parse(last)) / 864e5) });
    for (const h of hw) { const d = dn(h); if (clsIsDone(h, d) && d.done_at && now - Date.parse(d.done_at) < 2 * 864e5 && !cls.fb[`${h.id}:${m.user_id}`]) fresh.push({ c, m, h, d }); }
  }
  if (!mine.length || !cls.members.some((x) => mine.some((c) => c.id === x.class_id))) return '';
  const it = (x, txt, tone) => `<li><button type="button" class="cls-care-i ${tone}" data-clsfocus="${x.c.id}:${x.m.user_id}"><b>${G.esc(x.m.name)}</b><span>${txt}</span>${mine.length > 1 ? `<small>${G.esc(x.c.name)}</small>` : ''}<i>›</i></button></li>`;
  const items = [...late.map((x) => it(x, G.esc(G.t(`기한 지난 숙제 ${x.n}개`, `${x.n} overdue`)), 'late')),
    ...quiet.map((x) => it(x, G.esc(G.t(`${x.days}일째 숙제 기록 없음`, `no homework for ${x.days} days`)), 'quiet')),
    ...fresh.slice(0, 6).map((x) => it(x, `${G.esc(G.t(`「${x.h.title}」 끝냄`, `finished “${x.h.title}”`))}${clsScoreTxt(x.d) ? ` · ${G.esc(clsScoreTxt(x.d))}` : ''} · <em>${G.esc(G.t('코멘트 남기기', 'Comment'))}</em>`, 'fresh'))];
  return `<section class="cls-care"><div class="cls-care-h"><b>${G.esc(G.t('오늘 챙길 학생', 'Needs attention today'))}</b><span>${G.esc(items.length ? G.t(`${items.length}건`, `${items.length}`) : G.t('모두 잘하고 있어요', 'Everyone is on track'))}</span></div>` +
    (items.length ? `<ul>${items.join('')}</ul>` : '') + '</section>';
}
/* 숙제 폼 → 숙제 한 개(종류 · 대상 자료 · 횟수 · 제목) */
function clsFormItem(f) {
  const pk = cls.pick[f.dataset.clsformcid];
  if (!pk) return null;
  if (pk.kind === 'free' && !pk.free) return null;
  const title = pk.kind === 'free' ? pk.free : pk.kind === 'vocab' ? (pk.ref ? `${pk.title} — ${G.t(`세션 ${pk.goal}번`, `${pk.goal} sessions`)}` : G.t(`단어 세션 ${pk.goal}번`, `${pk.goal} word sessions`)) : pk.title;
  return { kind: pk.kind, ref: pk.ref, goal: pk.kind === 'vocab' ? pk.goal : 1, title: title.slice(0, 120) };
}
const clsYmd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/* 학생 리포트 PDF(운영자 2026-10-07 — 클래스카드 · 듀오링고 스쿨의 학습 리포트처럼): 학생 한 명 한 장 —
   레벨 · 완료율 · 평균 점수 · 기한 지남 · 숙제별 결과 · 선생님 코멘트 · 선생님 한마디. 학생에게 보내거나 기관에 보여 줄 때. */
function clsStuPrint(c, m) {
  const k = `${c.id}:${m.user_id}`, lv = clsLvInfo(cls.stu[k]), hw = clsHwFor(c.id, m.user_id).slice().reverse();
  const rows = hw.map((h) => { const d = cls.done.find((x) => x.hw_id === h.id && x.user_id === m.user_id), ok = clsIsDone(h, d), du = clsDue(h);
    return { h, d, ok, late: !ok && du?.cls === 'late', pct: d?.score?.max ? d.score.total / d.score.max : d?.score?.n ? d.score.ok / d.score.n : null }; });
  const done = rows.filter((r) => r.ok).length, ps = rows.map((r) => r.pct).filter((x) => x != null);
  const avg = ps.length ? Math.round((ps.reduce((a, b) => a + b, 0) / ps.length) * 100) : null, late = rows.filter((r) => r.late).length;
  const today = new Date().toLocaleDateString(G.isEn() ? 'en-US' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  G.track('반학생리포트PDF');
  G.$('ntPrintView').innerHTML = `<div class="ws cls-pr"><div class="ws-run"><b>치즈감자</b><span>${G.esc(G.t('학생 학습 리포트', 'Student learning report'))}</span></div>` +
    `<div class="cls-pr-head"><img src="logo-256.png" alt="" width="64" height="64"><div><h1>${G.esc(m.name)}</h1><p>${G.esc(c.name)} · ${G.esc(today)}</p></div>${lv ? `<div class="cls-pr-lv">${lv.icon}<span>${G.esc(lv.name)}</span></div>` : ''}</div>` +
    `<div class="cls-pr-stats"><div><b>${hw.length ? Math.round((done / hw.length) * 100) : 0}%</b><span>${G.esc(G.t('숙제 완료', 'Homework done'))}</span><small>${done} / ${hw.length}</small></div>` +
      `<div><b>${avg != null ? avg + '%' : '–'}</b><span>${G.esc(G.t('평균 점수', 'Average score'))}</span></div><div><b>${late}</b><span>${G.esc(G.t('기한 지난 숙제', 'Overdue'))}</span></div></div>` +
    (cls.stu[k]?.msg ? `<div class="cls-pr-msg"><b>${G.esc(G.t('선생님 한마디', 'From the teacher'))}</b><p>${G.esc(cls.stu[k].msg)}</p></div>` : '') +
    `<table class="cls-pr-t"><thead><tr><th>${G.esc(G.t('숙제', 'Homework'))}</th><th>${G.esc(G.t('기한', 'Due'))}</th><th>${G.esc(G.t('결과', 'Result'))}</th><th>${G.esc(G.t('한 날', 'Done'))}</th></tr></thead><tbody>` +
    rows.map((r) => { const fb = cls.fb[`${r.h.id}:${m.user_id}`];
      return `<tr><td>${(CLS_KIND[r.h.kind] || [''])[0]} ${G.esc(r.h.title)}${fb ? `<div class="cls-pr-fb">${G.esc(fb.msg)}</div>` : ''}</td><td>${G.esc(clsDay(r.h.due) || '–')}</td>` +
        `<td class="${r.ok ? 'ok' : r.late ? 'late' : ''}">${G.esc(r.ok ? (clsScoreTxt(r.d) || G.t('완료', 'Done')) : r.d ? `${r.d.n}/${r.h.goal}` : r.late ? G.t('기한 지남', 'Overdue') : G.t('아직', 'Not yet'))}</td><td>${G.esc(clsDay(r.d?.done_at) || '–')}</td></tr>`; }).join('') +
    `</tbody></table><p class="ws-key-n">everykoreans.com</p></div>`;
  document.body.classList.add('nt-printing', 'ws-printing');
  window.print();
}

/* 개인정보 안내 한 줄(운영자 2026-10-07) — 반에 들어오기 전(초대 · 코드 칸)과 들어온 뒤(반가운 말)에 같은 글 */
const clsPrivacy = () => `<p class="cls-privacy">${G.esc(G.t('선생님은 내 이름(계정 이름)과 숙제 기록(한 날 · 점수)만 봐요. 숙제 · 복습에만 쓰고, 언제든 「반 나가기」로 나갈 수 있어요.', 'Your teacher sees only your name (account name) and homework records (dates, scores): used only for homework and review. Leave anytime.'))} <a href="privacy.html">${G.esc(G.t('개인정보처리방침', 'Privacy policy'))}</a></p>`;
const clsDefaultName = () => {
  let n = ''; try { n = localStorage.getItem(G.QA_NAME_KEY) || ''; } catch (e) {}
  const u = clsSession?.user;
  return (n || u?.user_metadata?.full_name || u?.user_metadata?.name || String(u?.email || '').split('@')[0] || G.t('학생', 'Student')).slice(0, 20);
};
/* 반에 들어간다 — 들어갔으면 true. 들어가면 반 화면을 다시 읽고 반가운 말 한 줄을 띄운다. */
async function clsJoin(code, name) {
  const { data, error } = await G.sb.rpc('cls_join', { p_code: code, p_name: name });
  if (error || !data?.length) { cls.msg = G.t('그 코드의 반을 찾지 못했어요. 선생님께 코드를 다시 확인해 주세요.', 'No class with that code.'); return false; }
  G.track('반들어감'); cls.msg = ''; cls.code = ''; cls.hi = G.t('반에 들어왔어요! 아래 숙제부터 해 볼까요? 숙제는 첫 화면 맨 위에도 떠요.', 'You joined the class! Start with the homework below: it also shows at the top of the home screen.');
  try { sessionStorage.removeItem('cp_cls_code'); localStorage.setItem('cp_cls_in', '1'); } catch (e) {}
  clsHomeAt = 0;
  window.cpMark('learn', 'class'); await clsLoad();
  /* 반에 들면 바로 Pro(반 학생 무료, 2026-10-06) — 다시 읽어 잠긴 것들을 연다 */
  try { const { data: { session } } = await G.sb.auth.getSession(); if (session) { await G.loadPro(G.sb, session); G.proPaintAccount(); } } catch (e) {}
  return true;
}
/* QR — qrcode-lib.js(MIT, Kazuhiko Arase)를 이 칸을 열 때만 받는다. CSP 때문에 우리 도메인에 둔다 */
let clsQrLib = null;
const clsQrNeed = () => (clsQrLib ??= new Promise((ok, no) => {
  const sc = document.createElement('script'); sc.src = './qrcode-lib.js?v=32cde420'; sc.onload = () => ok(window.qrcode); sc.onerror = no; document.head.appendChild(sc);
}));
/* 치즈감자 QR 카드(운영자 2026-10-07 「QR 을 귀엽게 — 치즈감자 스타일로」): 둥근 점 · 갈색 둥근 모서리 눈 · 가운데 치즈감자 얼굴 ·
   위에 주황 띠와 반 이름, 아래 「찍고 로그인하면 바로」. 보이는 그림과 저장하는 PNG 가 같은 캔버스 하나다.
   가운데 얼굴이 점을 가리므로 오류 고침은 가장 센 H(30%)로 만든다. 점은 진한 갈색 · 바탕은 흰색 — 카메라가 읽는 대비는 지킨다. */
let clsLogoImg = null;
const clsLogoNeed = () => (clsLogoImg ??= new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = 'logo-256.png'; }));
function clsRound(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function clsQrCard(qr, c, logo) {
  /* QR 만(운영자 2026-10-07 「그냥 QR 만 뜨게」) — 둥근 점 · 갈색 둥근 눈(가운데 주황) · 가운데 치즈감자 얼굴. 둘레는 카메라가 읽게 흰 여백 4칸 */
  const q = qr(0, 'H'); q.addData(clsLink(c.code)); q.make();
  const n = q.getModuleCount(), cell = Math.floor(720 / (n + 8)), QS = n * cell, pad = 4 * cell, W = QS + pad * 2;
  const INK = '#3B2A1E', ORANGE = '#FF914D', DEEP = '#C4561F';
  const cv = document.createElement('canvas'); cv.width = W; cv.height = W;
  const g = cv.getContext('2d'), ox = pad, oy = pad;
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, W);
  const eye = (r, cc) => (r < 7 && cc < 7) || (r < 7 && cc >= n - 7) || (r >= n - 7 && cc < 7);
  const k = Math.round(n * 0.24) | 1, k0 = (n - k) / 2;
  const mid = (r, cc) => r >= k0 - 0.5 && r < k0 + k - 0.5 && cc >= k0 - 0.5 && cc < k0 + k - 0.5;
  g.fillStyle = INK;
  for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) {
    if (!q.isDark(r, cc) || eye(r, cc) || mid(r, cc)) continue;
    g.beginPath(); g.arc(ox + (cc + 0.5) * cell, oy + (r + 0.5) * cell, cell * 0.43, 0, Math.PI * 2); g.fill();
  }
  for (const [r, cc] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    const x = ox + cc * cell, y = oy + r * cell;
    g.fillStyle = INK; clsRound(g, x, y, 7 * cell, 7 * cell, cell * 2.2); g.fill();
    g.fillStyle = '#fff'; clsRound(g, x + cell, y + cell, 5 * cell, 5 * cell, cell * 1.5); g.fill();
    g.fillStyle = DEEP; clsRound(g, x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell, cell); g.fill();
  }
  const lx = ox + k0 * cell, ly = oy + k0 * cell, ls = k * cell;
  g.fillStyle = '#fff'; clsRound(g, lx - 4, ly - 4, ls + 8, ls + 8, ls * 0.28); g.fill();
  if (logo) { g.save(); clsRound(g, lx + 4, ly + 4, ls - 8, ls - 8, ls * 0.24); g.clip(); g.drawImage(logo, lx + 4, ly + 4, ls - 8, ls - 8); g.restore(); }
  g.strokeStyle = ORANGE; g.lineWidth = Math.max(3, cell * 0.35); clsRound(g, lx + 2, ly + 2, ls - 4, ls - 4, ls * 0.25); g.stroke();
  return cv;
}
async function clsQrFill() {
  const boxes = document.querySelectorAll('[data-clsqrbox]');
  if (!boxes.length) return;
  let qr, logo; try { [qr, logo] = await Promise.all([clsQrNeed(), clsLogoNeed()]); } catch (e) { return; }
  boxes.forEach((b) => {
    const c = cls.rows.find((x) => x.code === b.dataset.clsqrbox); if (!c) return;
    const url = clsQrCard(qr, c, logo).toDataURL('image/png');
    b.querySelector('.cls-qr-img').innerHTML = `<img src="${url}" alt="${G.esc(G.t(`${c.name} 반 QR`, `${c.name} class QR`))}">`;
    b.querySelector('[data-clsqrsave]').dataset.url = url;
  });
}
function clsQrHtml(c) {
  return `<div class="cls-qr" data-clsqrbox="${G.esc(c.code)}"><div class="cls-qr-img" aria-label="QR"></div>` +
    `<p class="cls-qr-cap">${G.esc(G.t('학생이 카메라로 찍고 로그인만 하면 바로 들어와요', 'Students scan and sign in: that’s it'))}</p>` +
    `<div class="cls-row cls-qr-btns"><button type="button" class="pt-next" data-clsqrsave="" data-name="${G.esc(c.code)}">${G.esc(G.t('QR 저장', 'Save QR'))}</button>` +
    `<button type="button" class="pt-ghost" data-clscopy="${G.esc(c.code)}">${G.esc(G.t('링크 복사', 'Copy link'))}</button></div></div>`;
}

/* ── 첫 화면 「반 숙제」 — 반 학생이면 오늘 할 일보다 위에(운영자 2026-10-07 「반 학생이면 숙제부터」).
   반이 아니면 숨는다 — 첫 화면은 그대로. 서버는 1분에 한 번만 묻는다. */
let clsHomeAt = 0, clsHomeData = null;
async function clsHomeRender() {
  const box = G.$('clsHome'); if (!box) return;
  let inCls = false; try { inCls = localStorage.getItem('cp_cls_in') === '1'; } catch (e) {}
  if (!inCls) { box.hidden = true; box.innerHTML = ''; return; }
  if (Date.now() - clsHomeAt > 60e3) {
    clsHomeAt = Date.now();
    try {
      const { data: { session } } = await G.sb.auth.getSession();
      if (!session) { box.hidden = true; return; }
      clsSession = session;
      const r = await G.sb.from('classes').select('id, name, code, owner, archived').order('created_at');
      const rows = (r.data || []).filter((c) => !c.archived && c.owner !== session.user.id);
      const ids = rows.map((c) => c.id);
      const [h, d, st] = ids.length ? await Promise.all([
        G.sb.from('class_homework').select('*').in('class_id', ids).order('created_at', { ascending: false }),
        G.sb.from('class_done').select('hw_id, user_id, n, score, done_at').eq('user_id', session.user.id),
        G.sb.from('class_student').select('*').in('class_id', ids).eq('user_id', session.user.id),
      ]) : [{ data: [] }, { data: [] }, { data: [] }];
      const hwIds = (h.data || []).map((x) => x.id), tg = hwIds.length ? await G.sb.from('class_hw_target').select('hw_id, user_id').in('hw_id', hwIds) : { data: [] };
      const tgt = {}; for (const x of tg.data || []) (tgt[x.hw_id] ??= new Set()).add(x.user_id);
      const stu = {}; for (const x of st.data || []) stu[`${x.class_id}:${x.user_id}`] = x;
      const fbr = hwIds.length ? await G.sb.from('class_feedback').select('hw_id, user_id, msg, at').in('hw_id', hwIds).eq('user_id', session.user.id) : { data: [] };
      const fb = {}; for (const x of fbr.data || []) fb[`${x.hw_id}:${x.user_id}`] = x;
      clsHomeData = { rows, hw: h.data || [], done: d.data || [], uid: session.user.id, tgt, stu, fb };
      clsApplyLevel(st.data || []);
      /* 숙제 「하러 가기」가 반 화면과 같은 길을 쓰게 */
      cls.hw = [...new Map([...cls.hw, ...clsHomeData.hw].map((x) => [x.id, x])).values()];
    } catch (e) { clsHomeData = null; }
  }
  const D = clsHomeData;
  if (!D?.rows.length) { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  box.innerHTML = D.rows.map((c) => clsStudentPanel(c, D, true)).join('');
}
/* 다 했을 때의 복습 단추 — 오답 노트 · 단어 복습 */
function clsCkGo(ev) {
  const b = ev.target.closest('[data-ckgo]'); if (!b) return false;
  G.track('반복습권유클릭');
  if (b.dataset.ckgo === 'wrong') window.cpOpen('learn', 'wrong'); else { window.cpOpen('words', ''); }
  return true;
}
G.$('clsHome')?.addEventListener('click', (ev) => {
  if (ev.target.closest('[data-clsopen]')) { window.cpOpen('learn', 'class'); return; }
  if (clsCkGo(ev)) return;
  const go = ev.target.closest('[data-clsgo]');
  if (go) clsGo(Number(go.dataset.clsgo));
});

function clsHwRow(c, h) {
  const [ic, ko, en] = CLS_KIND[h.kind] || ['', '', ''];
  const due = h.due ? new Date(`${h.due}T00:00:00`).toLocaleDateString(G.isEn() ? 'en-US' : 'ko-KR', { month: 'short', day: 'numeric' }) : '';
  const late = h.due && h.due < new Date().toISOString().slice(0, 10);
  const head = `<span class="cls-hw-ic">${ic}</span><div class="cls-hw-t"><b>${G.esc(h.title)}</b><small>${G.esc(G.t(ko, en))}${h.kind === 'vocab' ? ` · ${h.goal}${G.t('번', '×')}` : ''}${due ? ` · ${G.esc(G.t(`${due}까지`, `due ${due}`))}` : ''}</small></div>`;
  if (c.owner === clsSession.user.id) {
    const tg = cls.tgt[h.id];
    const mem = cls.members.filter((x) => x.class_id === c.id && (!tg || tg.has(x.user_id)));
    const fin = (u) => { const d = cls.done.find((x) => x.hw_id === h.id && x.user_id === u); return d && d.n >= (h.kind === 'vocab' ? h.goal : 1) ? d : null; };
    const k = mem.filter((x) => fin(x.user_id)).length;
    const who = mem.map((x) => {
      const d = cls.done.find((y) => y.hw_id === h.id && y.user_id === x.user_id), ok = fin(x.user_id);
      const sc = d?.score?.max ? ` ${d.score.total}/${d.score.max}${G.t('점', ' pts')}` : d?.score?.n ? ` ${d.score.ok}/${d.score.n}` : d?.score?.wrong != null ? ` ${G.t(`틀림 ${d.score.wrong}`, `${d.score.wrong} wrong`)}` : '';
      const sb2 = clsSubOf(h.id, x.user_id);
      return `<li class="${ok ? 'ok' : ''}">${ok ? '✓' : d ? `${d.n}/${h.goal}` : '·'} ${G.esc(x.name)}<em>${G.esc(sc)}</em>${sb2 ? `<button type="button" class="cls-sub-chip${sb2.reviewed_at ? ' ok' : ''}" data-clsview="${h.id}:${x.user_id}">${sb2.reviewed_at ? '✓ ' : ''}${G.esc(G.t('제출', 'Submission'))}</button>` : ''}</li>`;
    }).join('');
    const du = clsDue(h);
    return `<li class="cls-hw"><div class="cls-hw-top">${head}<button type="button" class="cls-re" data-clsre="${h.id}" title="${G.esc(G.t('다시 내기', 'Give again'))}" aria-label="${G.esc(G.t('다시 내기', 'Give again'))}">↻<span> ${G.esc(G.t('다시 내기', 'Again'))}</span></button><button type="button" class="cls-x" data-clsdel="${h.id}" aria-label="${G.esc(G.t('숙제 지우기', 'Delete'))}">✕</button></div>` +
      `<div class="cls-hw-meta">${tg ? `<span class="cls-hw-to">${G.esc(mem.map((x) => x.name).join(', ') || G.t('대상 없음', 'nobody'))}</span>` : `<span class="cls-hw-to all">${G.esc(G.t('반 전체', 'Whole class'))}</span>`}` +
      `${du ? `<span class="ck-due ${du.cls}">${G.esc(du.txt)}</span>` : ''}<span class="cls-hw-n">${G.esc(G.t(`${k} / ${mem.length}명 했음`, `${k} / ${mem.length} done`))}</span></div>` +
      (mem.length ? `<ul class="cls-who">${who}</ul>` : '') +
      (mem.some((x) => clsSubOf(h.id, x.user_id)) ? `<button type="button" class="cls-view-all" data-clsview="${h.id}:">${G.esc(G.t(`제출 보기 · ${mem.filter((x) => clsSubOf(h.id, x.user_id)).length}명 · 수업에서 보여주기`, `View submissions · ${mem.filter((x) => clsSubOf(h.id, x.user_id)).length} · present`))}</button>` : '') + '</li>';
  }
  const d = cls.done.find((x) => x.hw_id === h.id && x.user_id === clsSession.user.id);
  const ok = d && d.n >= (h.kind === 'vocab' ? h.goal : 1);
  return `<li class="cls-hw${ok ? ' ok' : ''}"><div class="cls-hw-top">${head}` +
    (ok ? `<span class="cls-hw-ok">✓ ${G.esc(G.t('했음', 'Done'))}</span>`
      : `${h.kind === 'vocab' && d ? `<span class="cls-hw-n">${d.n} / ${h.goal}</span>` : late ? `<span class="cls-hw-late">${G.esc(G.t('기한 지남', 'Late'))}</span>` : ''}` +
        (h.kind === 'free' ? '' : `<button type="button" class="pt-next cls-go" data-clsgo="${h.id}">${G.esc(G.t('하러 가기', 'Start'))} →</button>`)) +
    clsSubBtn(h) + '</div></li>';
}
/* ── 제출(2026-10-14 「구글 클래스룸처럼 · 제출 버튼」, db/add_class_submit.sql) ──
   학생: 숙제마다 「제출」 — 글(4,000자) + 사진 한 장(폰 사진은 1280px · JPEG 로 줄여 올린다). 다시 내면 고친다.
   선생님: 숙제 줄의 「제출 보기」 → 큰 글씨 한 화면(수업에서 화면 공유) — 학생 넘기기 · 「확인했어요」 · 코멘트. */
const clsSubOf = (hw, uid) => cls.sub?.[`${hw}:${uid}`];
function clsSubBtn(h) {
  if (cls.needSub) return '';
  const s = clsSubOf(h.id, clsSession.user.id);
  if (s) return `<button type="button" class="cls-sub-btn done" data-clssub="${h.id}">${G.esc(s.reviewed_at ? G.t('✓ 선생님이 확인했어요', '✓ Checked by teacher') : G.t('✓ 제출함 · 고치기', '✓ Submitted · edit'))}</button>`;
  return `<button type="button" class="cls-sub-btn${h.kind === 'free' ? ' main' : ''}" data-clssub="${h.id}">${G.esc(h.kind === 'free' ? G.t('제출하기', 'Submit') : G.t('글 · 사진 제출', 'Submit text / photo'))}</button>`;
}
async function clsShrink(file) {
  const bmp = await createImageBitmap(file), k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
  cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
  return new Promise((ok) => cv.toBlob(ok, 'image/jpeg', 0.82));
}
function clsSubOpen(hwId) {
  const h = cls.hw.find((x) => x.id === hwId); if (!h) return;
  const old = clsSubOf(hwId, clsSession.user.id);
  document.getElementById('clsDlg')?.remove();
  const d = document.createElement('div'); d.id = 'clsDlg'; d.className = 'cls-dlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.innerHTML = `<div class="cls-dlg-box"><button type="button" class="cls-dlg-x" data-clsdlgx aria-label="${G.esc(G.t('닫기', 'Close'))}">✕</button>` +
    `<h3>${G.esc(h.title)}</h3><textarea class="cls-dlg-ta" maxlength="4000" rows="6" placeholder="${G.esc(G.t('여기에 답을 써요', 'Write your answer here'))}">${G.esc(old?.body || '')}</textarea>` +
    `<label class="cls-dlg-ph"><input type="file" accept="image/*" hidden><span>${G.esc(G.t('사진 올리기(선택)', 'Add a photo (optional)'))}</span></label><img class="cls-dlg-pv" alt="" hidden>` +
    `<p class="cls-dlg-msg" hidden></p><button type="button" class="pt-next cls-dlg-go">${G.esc(old ? G.t('고쳐서 다시 제출', 'Submit again') : G.t('제출', 'Submit'))}</button></div>`;
  document.body.appendChild(d);
  let blob = null;
  const msg = (x) => { const m = d.querySelector('.cls-dlg-msg'); m.textContent = x; m.hidden = !x; };
  d.querySelector('input[type=file]').addEventListener('change', async (ev) => {
    const f = ev.target.files?.[0]; if (!f) return;
    try { blob = await clsShrink(f); const pv = d.querySelector('.cls-dlg-pv'); pv.src = URL.createObjectURL(blob); pv.hidden = false; msg(''); } catch (e) { blob = null; msg(G.t('사진을 읽지 못했어요. 다른 사진으로 해 보세요.', 'Could not read that photo.')); }
  });
  d.addEventListener('click', (ev) => { if (ev.target === d || ev.target.closest('[data-clsdlgx]')) d.remove(); });
  d.querySelector('.cls-dlg-go').addEventListener('click', async (ev) => {
    const body = d.querySelector('.cls-dlg-ta').value.trim();
    if (!body && !blob && !old?.image_path) { msg(G.t('글을 쓰거나 사진을 올려 주세요.', 'Write something or add a photo.')); return; }
    const btn = ev.currentTarget; btn.disabled = true; msg('');
    let path = old?.image_path || null;
    if (blob) {
      const np = `${clsSession.user.id}/${hwId}/${Date.now()}.jpg`;
      const up = await G.sb.storage.from('class-submissions').upload(np, blob, { contentType: 'image/jpeg' });
      if (up.error) { btn.disabled = false; msg(G.t('사진을 올리지 못했어요. 조금 뒤에 다시 해 주세요.', 'Photo upload failed: try again.')); return; }
      path = np;
    }
    const r = await G.sb.rpc('cls_submit', { p_hw: hwId, p_body: body, p_image: path });
    if (r.error || !r.data) { btn.disabled = false; msg(G.t('제출하지 못했어요. 선생님께 알려 주세요.', 'Could not submit: please tell your teacher.')); return; }
    G.track('숙제제출'); d.remove(); await clsLoad();
  });
  d.querySelector('.cls-dlg-ta').focus();
}
/* 선생님 — 숙제 하나의 제출을 큰 화면으로 넘겨 보며 확인(수업에서 바로 보여 주기) */
let clsPres = null;   // { hw, list: [{ user_id, name }], i }
async function clsPresOpen(hwId, uid) {
  const h = cls.hw.find((x) => x.id === hwId); if (!h) return;
  const c = cls.rows.find((x) => x.id === h.class_id);
  const list = cls.members.filter((m) => m.class_id === h.class_id && clsSubOf(hwId, m.user_id)).map((m) => ({ user_id: m.user_id, name: m.name }));
  if (!list.length) return;
  clsPres = { hw: h, cname: c?.name || '', list, i: Math.max(0, list.findIndex((x) => x.user_id === uid)) };
  document.getElementById('clsPres')?.remove();
  const d = document.createElement('div'); d.id = 'clsPres'; d.className = 'cls-pres'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  document.body.appendChild(d); document.body.classList.add('cls-pres-on');
  d.addEventListener('click', clsPresClick);
  await clsPresDraw();
}
async function clsPresDraw() {
  const d = document.getElementById('clsPres'); if (!d || !clsPres) return;
  const { hw, list, i } = clsPres, m = list[i], s = clsSubOf(hw.id, m.user_id), fb = cls.fb[`${hw.id}:${m.user_id}`];
  let img = '';
  if (s?.image_path) { const u = await G.sb.storage.from('class-submissions').createSignedUrl(s.image_path, 3600); if (u.data?.signedUrl) img = `<img class="cls-pres-img" src="${G.esc(u.data.signedUrl)}" alt="">`; }
  d.innerHTML = `<div class="cls-pres-top"><span>${G.esc(clsPres.cname)} · ${G.esc(hw.title)}</span><span>${i + 1} / ${list.length}</span>` +
    `<button type="button" data-prfs>${G.esc(G.t('전체 화면', 'Full screen'))}</button><button type="button" data-prx aria-label="${G.esc(G.t('닫기', 'Close'))}">✕</button></div>` +
    `<div class="cls-pres-main"><h2>${G.esc(m.name)}</h2>${s?.body ? `<p class="cls-pres-body">${G.esc(s.body).replace(/\n/g, '<br>')}</p>` : ''}${img}` +
    `<small>${G.esc(new Date(s.at).toLocaleString(G.isEn() ? 'en-US' : 'ko-KR'))}</small></div>` +
    `<div class="cls-pres-bar"><button type="button" data-prprev${i === 0 ? ' disabled' : ''}>←</button>` +
    `<input type="text" class="cls-pres-fb" maxlength="500" value="${G.esc(fb?.msg || '')}" placeholder="${G.esc(G.t('한 줄 코멘트(학생에게 보여요)', 'One-line comment (the student sees it)'))}">` +
    `<button type="button" data-prfb>${G.esc(G.t('코멘트 저장', 'Save comment'))}</button>` +
    `<button type="button" class="${s?.reviewed_at ? 'on' : ''}" data-prok>${G.esc(s?.reviewed_at ? G.t('✓ 확인함', '✓ Checked') : G.t('확인했어요', 'Mark checked'))}</button>` +
    `<button type="button" data-prnext${i >= list.length - 1 ? ' disabled' : ''}>→</button></div>`;
}
async function clsPresClick(ev) {
  if (!clsPres) return;
  const el = (q) => ev.target.closest(q), { hw, list } = clsPres, m = list[clsPres.i];
  if (el('[data-prx]')) { document.getElementById('clsPres')?.remove(); document.body.classList.remove('cls-pres-on'); clsPres = null; if (document.fullscreenElement) document.exitFullscreen?.(); return; }
  if (el('[data-prfs]')) { const d = document.getElementById('clsPres'); if (document.fullscreenElement) document.exitFullscreen?.(); else d?.requestFullscreen?.(); return; }
  if (el('[data-prprev]') && clsPres.i > 0) { clsPres.i--; await clsPresDraw(); return; }
  if (el('[data-prnext]') && clsPres.i < list.length - 1) { clsPres.i++; await clsPresDraw(); return; }
  if (el('[data-prok]')) {
    const s = clsSubOf(hw.id, m.user_id), on = !s.reviewed_at;
    const r = await G.sb.rpc('cls_review', { p_hw: hw.id, p_user: m.user_id, p_on: on });
    if (!r.error && r.data) { s.reviewed_at = on ? new Date().toISOString() : null; G.track('숙제확인'); if (on && clsPres.i < list.length - 1) clsPres.i++; await clsPresDraw(); }
    return;
  }
  if (el('[data-prfb]')) {
    const msg = (document.querySelector('.cls-pres-fb')?.value || '').trim().slice(0, 500), key = `${hw.id}:${m.user_id}`;
    const q2 = msg ? G.sb.from('class_feedback').upsert({ hw_id: hw.id, user_id: m.user_id, msg, at: new Date().toISOString() }) : G.sb.from('class_feedback').delete().eq('hw_id', hw.id).eq('user_id', m.user_id);
    const { error } = await q2; if (!error) { if (msg) cls.fb[key] = { hw_id: hw.id, user_id: m.user_id, msg }; else delete cls.fb[key]; G.track('숙제코멘트'); await clsPresDraw(); }
  }
}
document.addEventListener('keydown', (ev) => {
  if (!clsPres || ev.target.closest?.('input,textarea')) return;
  if (ev.key === 'Escape') document.querySelector('#clsPres [data-prx]')?.click();
  else if (ev.key === 'ArrowRight') document.querySelector('#clsPres [data-prnext]')?.click();
  else if (ev.key === 'ArrowLeft') document.querySelector('#clsPres [data-prprev]')?.click();
});
/* 숙제 고르기 — 검색 한 칸(운영자 2026-10-07 「검색해서 바로 찾게 · 선생님이 편하게」).
   레슨 · 문법 · TOPIK 쓰기 · TOPIK 읽기 · 단어 세션을 한 목록(clsCatalog)에서 낱말로 찾는다(띄어쓰기 · 대소문자 무시).
   종류 칩으로 좁히고, 「최근에 낸 숙제」는 한 번 눌러 다시 고른다. 고른 것은 cls.pick[반] — 단어 세션은 −/+ 로 횟수. */
let clsCat = null, clsCatLang = '', clsVTopics = null, clsVN = new Map();   // 단어 주제(vocab/taxonomy.json) — 주제별 단어 숙제
const clsNorm = (x) => String(x || '').toLowerCase().replace(/[\s·\-–—_.,()「」"']/g, '');
/* 목록 글(제목 · 설명)은 t() 로 한 번 굳혀 둔다 — 화면 언어를 바꾸면(예: 네팔어 → 한국어) 새로 만들어야 한다. 안 그러면 한국어 화면에 예전 언어가 남는다(운영자 2026-10-15 보고) */
function clsCatalog() {
  const lk = `${document.documentElement.lang}|${window.cpI18n?.lang || ''}`;
  if (clsCat && clsCatLang === lk) return clsCat;
  const out = [{ kind: 'free', ref: null, title: G.t('글 · 사진으로 내는 숙제', 'Written / photo homework'), sub: G.t('내용을 직접 쓰면 학생이 글이나 사진으로 제출해요', 'You write the task; the student submits text or a photo'), alt: '제출 submit 글쓰기 작문 사진 photo writing' },
    { kind: 'vocab', ref: null, title: G.t('단어 세션', 'Word session'), sub: G.t('「단어」에서 아무 세션이나 N번', 'Any N sessions in Words') }];
  /* 주제별 단어 세션 — 큰 주제 · 작은 주제(감정 · 기쁨, 학교 · 학용품 …). 그 주제 세션을 끝내야 「했음」(db/update_cls_mark_vocab.sql) */
  for (const tp of clsVTopics || []) {
    if (!clsVN.get(tp.id)) continue;
    out.push({ kind: 'vocab', ref: tp.id, title: G.t(`단어 · ${tp.ko}`, `Words · ${tp.en}`), sub: G.t(`이 주제 단어 세션 · 낱말 ${clsVN.get(tp.id)}개`, `Word sessions · ${clsVN.get(tp.id)} words`), alt: `${tp.ko} ${tp.en} 단어 낱말 words` });
    for (const sb of tp.subs) if (clsVN.get(`${tp.id}/${sb.id}`) >= 10) out.push({ kind: 'vocab', ref: `${tp.id}/${sb.id}`, title: G.t(`단어 · ${tp.ko} · ${sb.ko}`, `Words · ${tp.en} · ${sb.en}`), sub: G.t(`작은 주제 단어 세션 · 낱말 ${clsVN.get(`${tp.id}/${sb.id}`)}개`, `Subtopic sessions · ${clsVN.get(`${tp.id}/${sb.id}`)} words`), alt: `${tp.ko} ${sb.ko} ${tp.en} ${sb.en} 단어 낱말 words` });
  }
  for (const co of G.COURSES) for (const l of co.lessons) out.push({ kind: 'lesson', ref: l.id, title: G.cTx(l.title), sub: G.cTx(co.title) });
  for (const p of G.SB_POINTS) if (G.GRAMMAR_DRILL[p.id]?.x?.length) out.push({ kind: 'grammar', ref: p.id, title: `${p.name} — ${G.t('바꿔 쓰기', 'drill')}`, sub: G.t('문법 바꿔 쓰기', 'Grammar drill') + (p.en ? ` · ${p.en}` : '') });
  for (const x of G.TW_ITEMS) out.push({ kind: 'twrite', ref: x.id, title: `TOPIK ${x.q}${G.t('번', '')} ${x.title || x.id}`, sub: G.t('TOPIK 쓰기 · AI 점수', 'TOPIK writing · AI score'), alt: x.id });
  for (const e of ['I', 'II']) for (const b of G.TQ_EXAMS[e]?.blueprint || []) if (G.TQ_EXAMS[e].reading.some((q) => q.type === b.type))
    out.push({ kind: 'tread', ref: `${e}:${b.type}`, title: `TOPIK ${e} ${G.t('읽기', 'reading')} · ${G.t(b.ko, b.en)}`, sub: G.t('TOPIK 읽기 유형 연습', 'TOPIK reading type practice') });
  for (const e of ['I', 'II']) for (const b of G.TOPIKL_BY_EXAM[e]?.blueprint || []) if (G.TOPIKL_BY_EXAM[e].items.some((q) => q.type === b.type))
    out.push({ kind: 'tlisten', ref: `${e}:${b.type}`, title: `TOPIK ${e} ${G.t('듣기', 'listening')} · ${G.t(b.ko, b.en)}`, sub: G.t('TOPIK 듣기 유형 연습', 'TOPIK listening type practice') });
  for (const e of ['I', 'II']) for (let r = 1, n = G.mkCount(e); r <= n; r++)
    out.push({ kind: 'tmock', ref: `${e}:${r}`, title: `TOPIK ${e} ${G.t(`모의고사 ${r}회차`, `mock exam · round ${r}`)}`, sub: G.t('TOPIK 읽기 모의고사 한 회차 · 점수', 'One full reading mock exam · scored'), alt: `모의고사 mock 시험 ${r}회` });
  for (const c of G.CONVO || []) out.push({ kind: 'convo', ref: c.id, title: `${G.t('회화', 'Conversation')} · ${c.title}`, sub: `${G.t('회화 연습', 'Conversation practice')}${c.en ? ` · ${c.en}` : ''}`, alt: `${c.en || ''} 회화 대화 conversation` });
  for (const s of G.TRANSLATE_SETS || []) out.push({ kind: 'translate', ref: s.id, title: `${G.t('번역', 'Translation')} · ${G.t(s.title.ko, s.title.en)}`, sub: G.t(`영어 → 한국어 ${s.lines.length}줄`, `English → Korean · ${s.lines.length} lines`), alt: `번역 translate translation ${s.tier} ${s.id}` });
  for (const s of G.STORIES) out.push({ kind: 'story', ref: s.id, title: `${G.t('동화책', 'Storybook')} · ${G.cTx(s.title)}`, sub: G.t('동화책 한 권 끝까지 읽기', 'Read one storybook to the end'), alt: '동화책 이야기 story storybook' });
  out.forEach((x) => { x.tkey = clsNorm(x.title); x.key = clsNorm(`${x.title} ${x.sub} ${x.ref || ''} ${x.alt || ''}`); });   // alt — 한국어 · 영어 이름을 다 찾게
  clsCatLang = lk;
  return (clsCat = out);
}
function clsPickResults(cid) {
  const q = clsNorm(cls.q[cid]), fk = cls.fk[cid] || '';
  /* 제목에 맞는 것이 먼저(제목 첫머리 → 제목 안 → 설명 · id 안) — 「54」면 TOPIK 54번이 레슨보다 위 */
  const rank = (x) => (!q ? 0 : x.tkey.startsWith(q) ? 0 : x.tkey.includes(q) ? 1 : 2);
  const list = clsCatalog().filter((x) => (!fk || x.kind === fk) && (!q || x.key.includes(q))).map((x, i) => [rank(x), i, x]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((r) => r[2]);
  if (!list.length) return `<p class="cls-pick-none">${G.esc(G.t('찾는 숙제가 없어요. 다른 낱말로 찾아보세요.', 'Nothing found: try another word.'))}</p>`;
  return list.slice(0, 40).map((x, i) => `<button type="button" class="cls-pick-i" data-clspick="${cid}:${clsCatalog().indexOf(x)}"><span class="cls-pick-ic">${(CLS_KIND[x.kind] || [''])[0]}</span>` +
    `<span class="cls-pick-t"><b>${G.esc(x.title)}</b><small>${G.esc(x.sub)}</small></span><span class="cls-pick-go" aria-label="${G.esc(G.t('고르기', 'Pick'))}">＋</span></button>`).join('') +
    (list.length > 40 ? `<p class="cls-pick-none">${G.esc(G.t(`${list.length - 40}개 더 있어요 — 낱말을 더 넣어 좁혀 보세요`, `${list.length - 40} more — type more to narrow down`))}</p>` : '');
}
/* 숙제 내기 — 세 걸음(운영자 2026-10-10 「단체로 보낼 일 없으니 학생한테 숙제 배정 · 만드는 과정 심플하게」).
   ① 학생 한 명 고르기(반에 한 명이면 저절로) → ② 숙제 찾아 고르기 → ③ 기한(기본 1주 뒤) → 「○○에게 내기」.
   고른 학생 · 기한은 cls.pre · cls.due 에 둔다 — 숙제를 고르며 다시 그려도 풀리지 않게(예전엔 체크가 풀려 반 전체로 나갔다).
   반 전체 · 묶음 · 매주 반복은 뺐다(1:1 수업에는 안 쓴다). 늘 펼쳐 둔다. */
function clsDueIn(n) { const d = new Date(); d.setDate(d.getDate() + n); return clsYmd(d); }
function clsAddForm(c) {
  const mem = cls.members.filter((x) => x.class_id === c.id);
  if (!mem.length) return `<div class="cls-add2" data-clsadd="${c.id}"><p class="cls-empty">${G.esc(G.t('숙제를 내려면 먼저 학생을 초대해 주세요. 「학생 초대」 탭의 QR · 링크.', 'Invite a student first: use the QR or link in “Invite”.'))}</p></div>`;
  if (!mem.some((m) => m.user_id === cls.pre[c.id])) cls.pre[c.id] = mem.length === 1 ? mem[0].user_id : '';
  if (cls.due[c.id] === undefined) cls.due[c.id] = clsDueIn(7);
  const who = mem.find((m) => m.user_id === cls.pre[c.id]), due = cls.due[c.id];
  const re = cls.re[c.id], pk = cls.pick[c.id], fk = cls.fk[c.id] || '';
  /* 최근에 낸 숙제(같은 것은 한 번) — 한 번 눌러 다시 고른다 */
  const seen = new Set(), recent = cls.hw.filter((h) => h.class_id === c.id).filter((h) => { const k = `${h.kind}:${h.ref}:${h.goal}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 6);
  const kinds = [['', G.t('전체', 'All')], ['lesson', G.t('레슨', 'Lessons')], ['vocab', G.t('단어', 'Words')], ['grammar', G.t('문법', 'Grammar')], ['twrite', G.t('TOPIK 쓰기', 'TOPIK writing')], ['tread', G.t('TOPIK 읽기', 'TOPIK reading')],
    ['tlisten', G.t('TOPIK 듣기', 'TOPIK listening')], ['tmock', G.t('모의고사', 'Mock exam')], ['convo', G.t('회화', 'Conversation')], ['story', G.t('동화책', 'Storybook')], ['translate', G.t('번역', 'Translation')], ['free', G.t('글 · 사진 제출', 'Submit')]];
  const picked = pk ? `<div class="cls-picked"><span class="cls-pick-ic">${(CLS_KIND[pk.kind] || [''])[0]}</span><span class="cls-pick-t"><small>${G.esc(G.t('고른 숙제', 'Selected'))}</small><b>${G.esc(pk.kind === 'vocab' ? (pk.ref ? `${pk.title} — ${G.t(`세션 ${pk.goal}번`, `${pk.goal} sessions`)}` : G.t(`단어 세션 ${pk.goal}번`, `${pk.goal} word sessions`)) : pk.title)}</b></span>` +
    (pk.kind === 'vocab' ? `<span class="cls-step"><button type="button" data-clsstep="${c.id}:-1" aria-label="−">−</button><b>${pk.goal}</b><button type="button" data-clsstep="${c.id}:1" aria-label="+">+</button></span>` : '') +
    `<button type="button" class="cls-small" data-clsunpick="${c.id}">${G.esc(G.t('바꾸기', 'Change'))}</button></div>` : '';
  const step = (n, l, okv) => `<div class="cls-st2${okv ? ' ok' : ''}"><b>${okv ? '✓' : n}</b>${G.esc(l)}</div>`;
  const pres = [[0, G.t('오늘', 'Today')], [1, G.t('내일', 'Tomorrow')], [3, G.t('3일 뒤', '+3 days')], [7, G.t('1주 뒤', '+1 week')], [-1, G.t('기한 없음', 'No due')]];
  return `<div class="cls-add2" data-clsadd="${c.id}"><h4>＋ ${G.esc(G.t('숙제 내기', 'Give homework'))}</h4>` +
    (re ? `<p class="cls-re-note">↻ ${G.esc(G.t(`「${re.title}」를 다시 내요`, `Giving “${re.title}” again`))} <button type="button" class="cls-small" data-clsrex="${c.id}">${G.esc(G.t('그만', 'Cancel'))}</button></p>` : '') +
    `<div class="cls-form" data-clsformcid="${c.id}">` +
      step(1, G.t('누구에게', 'Who'), !!who) +
      `<div class="cls-whos">${mem.map((m) => `<button type="button" class="${m.user_id === cls.pre[c.id] ? 'on' : ''}" data-clswho="${c.id}:${G.esc(m.user_id)}">${G.esc(m.name)}</button>`).join('')}</div>` +
      step(2, G.t('어떤 숙제', 'What'), !!pk) +
      (picked || `<div class="cls-pick"><div class="cls-search"><input type="search" data-clssearch="${c.id}" value="${G.esc(cls.q[c.id] || '')}" placeholder="${G.esc(G.t('숙제 찾기 — 예: 인사, -아서, 54번, 쓰기', 'Find homework — e.g. greetings, -아서, Q54'))}" autocomplete="off"></div>` +
        `<div class="cls-kchips">${kinds.map(([k, l]) => `<button type="button" class="${k === fk ? 'on' : ''}" data-clsfk="${c.id}:${k}">${G.esc(l)}</button>`).join('')}</div>` +
        (recent.length && !cls.q[c.id] && !fk ? `<div class="cls-recent"><small>${G.esc(G.t('최근에 낸 숙제', 'Recently given'))}</small>${recent.map((h) => `<button type="button" data-clsrecent="${h.id}">${(CLS_KIND[h.kind] || [''])[0]} ${G.esc(h.title.replace(/ · (\d+주차|week \d+)$/, ''))}</button>`).join('')}</div>` : '') +
        `<div class="cls-pick-list" data-clspicklist="${c.id}">${clsPickResults(c.id)}</div></div>`) +
      (pk?.kind === 'free' ? `<input type="text" class="cls-free-in" data-clsfree="${c.id}" maxlength="120" value="${G.esc(pk.free || '')}" placeholder="${G.esc(G.t('학생에게 보여 줄 숙제 내용 — 예: 주말에 한 일을 세 줄로 써 오기', 'What the student should do — e.g. write three lines about your weekend'))}">` : '') +
      step(3, G.t('언제까지', 'Due'), true) +
      `<div class="cls-due-pre">${pres.map(([d, l]) => `<button type="button" class="${(d < 0 ? !due : due === clsDueIn(d)) ? 'on' : ''}" data-clsduepre="${c.id}:${d}">${G.esc(l)}</button>`).join('')}` +
        `<input type="date" data-clsdue="${c.id}" value="${G.esc(due || '')}" aria-label="${G.esc(G.t('날짜 고르기', 'Pick a date'))}"></div>` +
      `<button type="button" class="pt-next cls-give2" data-clsgive="${c.id}"${who && pk && (pk.kind !== 'free' || pk.free) ? '' : ' disabled'}>${G.esc(who ? G.t(`${who.name}에게 숙제 내기`, `Give to ${who.name}`) : G.t('학생을 먼저 골라 주세요', 'Pick a student first'))}</button>` +
    '</div></div>';
}
/* ── 진도 리포트(2026-10-06) — 반 학생 × 숙제 한 표, CSV(엑셀)로 받기. 기관 · 학교에 결과를 보여 줄 때 ── */
function clsReportData(c) {
  const hw = cls.hw.filter((h) => h.class_id === c.id).slice().reverse();   // 낸 차례대로
  const mem = cls.members.filter((x) => x.class_id === c.id);
  const cell = (h, u) => {
    const d = cls.done.find((x) => x.hw_id === h.id && x.user_id === u);
    if (!d) return { ok: false, txt: '' };
    const ok = d.n >= (h.kind === 'vocab' ? h.goal : 1);
    const sc = d.score?.max ? `${d.score.total}/${d.score.max}` : d.score?.n ? `${d.score.ok}/${d.score.n}` : d.score?.wrong != null ? G.t(`틀림 ${d.score.wrong}`, `${d.score.wrong} wrong`) : '';
    return { ok, txt: ok ? (sc || '✓') : `${d.n}/${h.goal}` };
  };
  const rows = mem.map((m) => { const cells = hw.map((h) => (cls.tgt[h.id] && !cls.tgt[h.id].has(m.user_id) ? { ok: false, txt: '–', na: true } : cell(h, m.user_id)));
    const lv = clsLvInfo(cls.stu[`${c.id}:${m.user_id}`]);
    return { name: m.name, joined: (m.joined_at || '').slice(0, 10), lv: lv ? lv.name : '', cells, done: cells.filter((x) => x.ok).length, all: cells.filter((x) => !x.na).length }; });
  return { hw, rows };
}
function clsReportHtml(c) {
  const { hw, rows } = clsReportData(c);
  if (!rows.length || !hw.length) return `<p class="cls-empty">${G.esc(G.t('학생과 숙제가 있으면 여기에 표가 나와요.', 'The table appears once there are students and homework.'))}</p>`;
  const tot = rows.reduce((a, r) => a + r.all, 0), avg = tot ? Math.round((rows.reduce((a, r) => a + r.done, 0) / tot) * 100) : 0;
  return `<div class="cls-rep"><p class="cls-rep-sum">${G.esc(G.t(`학생 ${rows.length}명 · 숙제 ${hw.length}개 · 평균 완료 ${avg}%`, `${rows.length} students · ${hw.length} tasks · ${avg}% done on average`))}</p>` +
    clsStuHtml(c) +
    `<details class="cls-rep-tbl"><summary>${G.esc(G.t('표로 한눈에 보기', 'See as a table'))}</summary>` +
    '<div class="cls-rep-scroll"><table class="cls-rep-t"><thead><tr><th>' + G.esc(G.t('학생', 'Student')) + '</th>' +
    hw.map((h) => `<th title="${G.esc(h.title)}">${G.esc((CLS_KIND[h.kind] || [''])[0])} ${G.esc(h.title.slice(0, 14))}</th>`).join('') + `<th>${G.esc(G.t('완료', 'Done'))}</th></tr></thead><tbody>` +
    rows.map((r) => `<tr><th>${G.esc(r.name)}</th>${r.cells.map((x) => `<td class="${x.ok ? 'ok' : x.na ? 'na' : x.txt ? 'part' : ''}">${G.esc(x.txt || '·')}</td>`).join('')}<td><b>${r.done}/${r.all}</b></td></tr>`).join('') +
    '</tbody></table></div>' +
    `</details><button type="button" class="pt-ghost" data-clscsv="${c.id}">⬇ ${G.esc(G.t('엑셀(CSV)로 받기', 'Download CSV'))}</button></div>`;
}
/* 학생별 진도 · 숙제 결과(운영자 2026-10-07 「선생님 탭에서 학생 진행상황 · 숙제 결과」) — 학생마다 카드 하나:
   완료율 막대 · 기한 지난 숙제 · 평균 점수 · 마지막으로 한 날. 누르면 숙제마다 결과(점수 · 몇 번 · 안 함 · 기한 지남).
   챙겨야 할 학생(기한 지난 숙제가 있거나 완료율이 낮은)이 위로 온다. */
/* 숙제 결과 줄의 코멘트 — 기록이 있는 숙제에만(끝냈거나 하는 중). 단 것은 보이고, 「💬」로 쓰기 · 고치기 */
function clsFbHtml(h, m, d) {
  if (!d) return '';
  const key = `${h.id}:${m.user_id}`, fb = cls.fb[key], open = cls.open['fb' + key];
  return (fb && !open ? `<div class="cls-fb-txt">${G.esc(fb.msg)}</div>` : '') +
    (open ? `<div class="cls-fb-ed"><textarea data-clsfbtxt="${key}" rows="2" maxlength="500" placeholder="${G.esc(G.t('예: 문단 연결이 좋아요! 「-기 때문에」를 한 번 더 써 봐요.', 'e.g. Great flow! Try using “-기 때문에” once more.'))}">${G.esc(fb?.msg || '')}</textarea>` +
      `<button type="button" class="pt-next" data-clsfbsave="${key}">${G.esc(G.t('코멘트 저장', 'Save comment'))}</button></div>`
      : `<button type="button" class="cls-fb-btn" data-clsfbopen="${key}">${G.esc(fb ? G.t('코멘트 고치기', 'Edit comment') : G.t('코멘트 달기', 'Comment'))}</button>`);
}
function clsStuHtml(c) {
  const list = cls.members.filter((x) => x.class_id === c.id).map((m) => {
    const hw = clsHwFor(c.id, m.user_id).slice().reverse();
    const res = hw.map((h) => {
      const d = cls.done.find((x) => x.hw_id === h.id && x.user_id === m.user_id);
      const ok = clsIsDone(h, d), du = clsDue(h), late = !ok && du?.cls === 'late';
      const pct = d?.score?.max ? d.score.total / d.score.max : d?.score?.n ? d.score.ok / d.score.n : null;
      return { h, d, ok, late, pct, sc: clsScoreTxt(d) };
    });
    const done = res.filter((r) => r.ok).length, late = res.filter((r) => r.late).length;
    const ps = res.map((r) => r.pct).filter((x) => x != null), avg = ps.length ? Math.round((ps.reduce((a, b) => a + b, 0) / ps.length) * 100) : null;
    const last = res.map((r) => r.d?.done_at).filter(Boolean).sort().pop() || '';
    return { m, hw, res, done, late, avg, last, rate: hw.length ? done / hw.length : 0 };
  }).sort((a, b) => b.late - a.late || a.rate - b.rate);
  return '<ul class="cls-stu">' + list.map((x) => {
    const k = `${c.id}:${x.m.user_id}`, st = cls.stu[k], lv = clsLvInfo(st), open = cls.open['s' + k];
    const tone = x.late ? 'warn' : x.hw.length && x.rate >= 1 ? 'good' : '';
    return `<li class="${tone}"><details${open ? ' open' : ''} data-clsstu="${k}"><summary>` +
      `<span class="cls-stu-av">${G.esc((x.m.name || '?').slice(0, 1).toUpperCase())}</span>` +
      `<span class="cls-stu-who"><b>${G.esc(x.m.name)}</b><small>${lv ? `<span class="cls-stu-lvic">${lv.icon}</span>${G.esc(lv.name)}` : G.esc(G.t('레벨 미정', 'Level not set'))}</small></span>` +
      `<span class="cls-stu-bar"><i style="width:${Math.round(x.rate * 100)}%"></i></span><span class="cls-stu-n">${x.done}/${x.hw.length}</span>` +
      `<span class="cls-stu-tags">${x.late ? `<em class="late">${G.esc(G.t(`기한 지남 ${x.late}`, `${x.late} late`))}</em>` : ''}${x.avg != null ? `<em>${G.esc(G.t(`평균 ${x.avg}%`, `avg ${x.avg}%`))}</em>` : ''}` +
      `<em class="mute">${G.esc(x.last ? G.t(`마지막 ${clsDay(x.last)}`, `last ${clsDay(x.last)}`) : G.t('아직 안 함', 'not started'))}</em></span></summary>` +
      `<div class="cls-stu-body">` +
        `<div class="cls-stu-form">` +
          `<label>${G.esc(G.t('레벨, 정하면 학생은 레벨테스트 없이 이 레벨로 시작해요', 'Level: the student starts here without a level test'))}<select data-clsstulv>${clsLvOptions(st)}</select></label>` +
          `<label>${G.esc(G.t('학생에게 한마디, 학생 첫 화면 「내 반」에 떠요', 'Message to the student: shows on their home screen'))}<textarea data-clsstumsg rows="2" maxlength="300" placeholder="${G.esc(G.t('예: 이번 주는 받침 발음을 매일 10분!', 'e.g. 10 minutes of batchim pronunciation daily this week!'))}">${G.esc(st?.msg || '')}</textarea></label>` +
          `<label>${G.esc(G.t('내 메모, 선생님만 봐요', 'Private note: only you see this'))}<textarea data-clsstunote rows="2" maxlength="2000" placeholder="${G.esc(G.t('예: 목표 TOPIK 3급 · 듣기 약함 · 화/목 수업', 'e.g. Goal TOPIK 3 · weak listening · Tue/Thu'))}">${G.esc(cls.note[k] || '')}</textarea></label>` +
          `<div class="cls-stu-act"><button type="button" class="pt-next" data-clsstusave="${k}">${G.esc(G.t('저장', 'Save'))}</button>` +
          `<button type="button" class="pt-ghost" data-clsstuhw="${k}">＋ ${G.esc(G.t('이 학생에게만 숙제', 'Homework just for them'))}</button>` +
          `<button type="button" class="pt-ghost" data-clsstupdf="${k}">${G.esc(G.t('리포트 PDF', 'Report PDF'))}</button></div>` +
        `</div>` +
        (x.res.length ? '<ol class="cls-stu-hw">' + x.res.map((r) => `<li class="${r.ok ? 'ok' : r.late ? 'late' : ''}"><span>${(CLS_KIND[r.h.kind] || [''])[0]} ${G.esc(r.h.title)}${cls.tgt[r.h.id] ? ` <i></i>` : ''}</span>` +
          `<b>${r.ok ? `✓ ${G.esc(r.sc || G.t('했음', 'done'))}` : r.d ? G.esc(`${r.d.n}/${r.h.goal}${r.sc ? ` · ${r.sc}` : ''}`) : r.late ? G.esc(G.t('기한 지남', 'late')) : G.esc(G.t('아직', 'not yet'))}</b>` +
          `${r.d?.done_at ? `<small>${G.esc(clsDay(r.d.done_at))}</small>` : ''}` + clsFbHtml(r.h, x.m, r.d) + '</li>').join('') + '</ol>' : `<p class="cls-empty">${G.esc(G.t('이 학생이 받은 숙제가 아직 없어요.', 'No homework for this student yet.'))}</p>`) +
        `<button type="button" class="cls-small cls-stu-out" data-clskick="${k}">${G.esc(G.t('반에서 빼기(수업을 그만둔 학생)', 'Remove from class'))}</button>` +
      '</div></details></li>';
  }).join('') + '</ul>';
}
function clsReportCsv(c) {
  const { hw, rows } = clsReportData(c);
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [[G.t('학생', 'Student'), G.t('레벨', 'Level'), G.t('들어온 날', 'Joined'), ...hw.map((h) => h.title), G.t('완료', 'Done')].map(q).join(',')]
    .concat(rows.map((r) => [r.name, r.lv, r.joined, ...r.cells.map((x) => x.txt), `${r.done}/${r.all}`].map(q).join(',')));
  /* 엑셀이 한글을 깨뜨리지 않게 BOM 을 붙인다 */
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `${c.name.replace(/[\\/:*?"<>|]/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  G.track('반리포트받기');
}
/* ── 선생님 목록(운영자만) — 메일을 올리면 그 사람도 반을 만든다 ── */
function clsTeacherHtml() {
  if (clsTeachers === null) return `<div class="cls-card"><b>${G.esc(G.t('선생님 계정', 'Teachers'))}</b><p class="cls-empty">${G.esc(G.t('선생님 표가 아직 없어요. Supabase SQL Editor 에서 db/add_class_teachers.sql 을 돌려 주세요.', 'Run db/add_class_teachers.sql first.'))}</p></div>`;
  return `<div class="cls-card"><b>${G.esc(G.t('선생님 계정', 'Teachers'))}</b>` +
    `<p class="cls-empty">${G.esc(G.t('여기 올린 메일로 로그인한 사람은 자기 반을 만들고 숙제 · 진도를 볼 수 있어요. 반 학생은 Pro 무료라 믿는 분만 올려 주세요.', 'People signed in with these emails can create their own classes. Class students get Pro free: add only people you trust.'))}</p>` +
    (clsTeachers.length ? `<ul class="cls-teach">${clsTeachers.map((x) => `<li><span>${G.esc(x.name || '')} <small>${G.esc(x.email)}</small></span><button type="button" class="cls-small" data-clsteachdel="${G.esc(x.email)}">${G.esc(G.t('빼기', 'Remove'))}</button></li>`).join('')}</ul>` : '') +
    `<div class="cls-row"><input id="clsTeachEmail" class="sb-in" type="email" placeholder="${G.esc(G.t('선생님 메일', 'Teacher email'))}"><input id="clsTeachName" class="sb-in" maxlength="30" placeholder="${G.esc(G.t('이름 · 기관', 'Name · school'))}">` +
    `<button type="button" class="pt-next" data-clsteachadd>${G.esc(G.t('올리기', 'Add'))}</button></div></div>`;
}
/* ── 학생 · 선생님 탭 + 선생님 신청(2026-10-14, db/add_teacher_requests.sql) ──
   로그인 화면에서 고른 쪽(cp_role)이 처음 탭. 선생님이 아닌 사람이 「선생님」 탭을 열면 신청 카드가 나온다(운영자 승인 뒤 켜짐). */
/* 「학생이에요 · 선생님이에요」(CLS_ROLE_KEY · clsSetRole · auRolePaint)는 로그인 화면에서도 쓰여서 본문에 남겼다 — 여기서는 G 로 부른다 */
function clsRole() {
  let r = ''; try { r = localStorage.getItem(G.CLS_ROLE_KEY) || ''; } catch (e) {}
  if (r === 'student' || r === 'teacher') return r;
  return clsCanMake() && cls.rows.some((c) => c.owner === clsSession?.user?.id) ? 'teacher' : 'student';
}
function clsApplyHtml() {
  const q = cls.treq;
  const head = `<h3>${G.esc(G.t('선생님 계정', 'Teacher account'))}</h3><p class="cls-ap-lead">${G.esc(G.t('선생님 계정은 운영자가 확인한 뒤에 열려요. 학생 이름과 제출물을 보는 기능이라서요.', 'Teacher accounts open after a quick review: teachers can see student names and submissions.'))}</p>`;
  if (cls.needReq) return `<section class="cls-card cls-apply">${head}<p>${G.esc(G.t('신청 기능을 준비하고 있어요. 운영자에게 이메일로 문의해 주세요.', 'Applications are being set up: please email the operator.'))}</p></section>`;
  if (q?.status === 'pending') return `<section class="cls-card cls-apply">${head}<div class="cls-ap-st">${G.esc(G.t('신청했어요. 운영자가 확인하면 이 화면이 선생님 화면으로 바뀌어요.', 'Application sent. This screen turns into the teacher screen once approved.'))}</div></section>`;
  return `<section class="cls-card cls-apply">${head}` +
    (q?.status === 'rejected' ? `<p class="cls-msg">${G.esc(G.t('이번에는 열리지 않았어요. 아래에 설명을 더 적어서 다시 신청할 수 있어요.', 'Not approved this time: add more detail and apply again.'))}</p>` : '') +
    `<input id="clsApName" class="sb-in" maxlength="40" placeholder="${G.esc(G.t('이름', 'Your name'))}" value="${G.esc(q?.name || clsDefaultName())}">` +
    `<input id="clsApNote" class="sb-in" maxlength="300" placeholder="${G.esc(G.t('어디서 가르치세요? 예: Preply · 학교 · 학원', 'Where do you teach? e.g. Preply, a school'))}" value="${G.esc(q?.note || '')}">` +
    `<button type="button" class="pt-next" data-clsapply>${G.esc(G.t('선생님 계정 신청', 'Apply for a teacher account'))}</button></section>`;
}
function clsReqHtml() {
  const list = cls.reqs || [];
  if (!list.length) return '';
  return `<div class="cls-reqs"><b>${G.esc(G.t(`선생님 신청 ${list.length}건`, `${list.length} teacher request(s)`))}</b>` +
    list.map((x) => `<div class="cls-req"><div><b>${G.esc(x.name)}</b> <small>${G.esc(x.email)}</small><p>${G.esc(x.note || '')}</p></div>` +
      `<button type="button" class="pt-next" data-clsreq="${G.esc(x.user_id)}:1">${G.esc(G.t('승인', 'Approve'))}</button><button type="button" class="pt-ghost" data-clsreq="${G.esc(x.user_id)}:0">${G.esc(G.t('거절', 'Decline'))}</button></div>`).join('') + '</div>';
}
/* 선생님 첫 화면 위의 두 칸(2026-10-14 「선생님 · 학생 모두 어떻게 하는지 바로 알 수 있게」):
   ① 확인할 제출 — 구글 클래스룸의 「검토할 것」. 아직 「확인했어요」를 안 누른 제출을 최근 순으로, 눌러서 바로 발표 화면으로.
   ② 시작 안내 — 반 만들기 → 학생 초대 → 숙제 내기 → 제출 확인, 네 걸음. 다 하면 사라진다. */
function clsTeacherTop() {
  const uid = clsSession.user.id, mine = cls.rows.filter((c) => c.owner === uid);
  if (!mine.length) return '';
  const ids = new Set(mine.map((c) => c.id)), hws = cls.hw.filter((h) => ids.has(h.class_id));
  const subs = Object.values(cls.sub || {}).filter((x) => hws.some((h) => h.id === x.hw_id));
  const pend = subs.filter((x) => !x.reviewed_at).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const nameOf = (x) => cls.members.find((m) => m.user_id === x.user_id && hws.find((h) => h.id === x.hw_id)?.class_id === m.class_id)?.name || '';
  let inbox = '';
  if (!cls.needSub && subs.length) {
    inbox = pend.length
      ? `<section class="cls-card cls-inbox"><div class="cls-inbox-h"><h3>${G.esc(G.t(`확인할 제출 ${pend.length}개`, `${pend.length} to check`))}</h3><button type="button" class="pt-next" data-clsview="${pend[0].hw_id}:${pend[0].user_id}">${G.esc(G.t('바로 확인하기', 'Start checking'))} →</button></div>` +
        `<ul>${pend.slice(0, 5).map((x) => `<li><button type="button" data-clsview="${x.hw_id}:${x.user_id}"><b>${G.esc(nameOf(x))}</b><span>${G.esc(hws.find((h) => h.id === x.hw_id)?.title || '')}</span><em>${G.esc(new Date(x.at).toLocaleDateString(G.isEn() ? 'en-US' : 'ko-KR', { month: 'short', day: 'numeric' }))}</em></button></li>`).join('')}</ul></section>`
      : `<section class="cls-card cls-inbox ok"><p>✓ ${G.esc(G.t('받은 제출을 모두 확인했어요.', 'You have checked every submission.'))}</p></section>`;
  }
  const steps = [
    [true, G.t('반 만들기', 'Create a class'), ''],
    [cls.members.some((m) => ids.has(m.class_id)), G.t('학생 초대 · 링크 · QR · 코드', 'Invite students: link, QR or code'), `<button type="button" class="cls-small" data-clscopy="${G.esc(mine[0].code)}">${G.esc(G.t('초대 링크 복사', 'Copy invite link'))}</button>`],
    [hws.length > 0, G.t('숙제 내기, 「글 · 사진 제출」도 돼요', 'Give homework: “written / photo” works too'), ''],
    [subs.length > 0, G.t('제출이 오면 여기서 확인하고 수업에서 보여 주기', 'Check submissions here and show them in class'), ''],
  ];
  const left = steps.findIndex((x) => !x[0]);
  const guide = left < 0 ? '' : `<section class="cls-card cls-guide"><h3>${G.esc(G.t('이렇게 시작해요', 'Getting started'))}</h3><ol>${steps.map((x, i) => `<li class="${x[0] ? 'ok' : i === left ? 'now' : ''}"><b>${x[0] ? '✓' : i + 1}</b><span>${G.esc(x[1])}</span>${i === left ? x[2] : ''}</li>`).join('')}</ol></section>`;
  return inbox + guide;
}
function clsPaint() {
  const box = G.$('clsWrap'); if (!box) return;
  const teach = !!clsSession && clsCanMake();
  const asT = !!clsSession && clsRole() === 'teacher';   // 지금 보는 탭
  /* 선생님 화면은 관리 대시보드처럼(운영자 2026-10-07 「더 깔끔하게 · 전문적으로」): 요약 숫자 → 반 카드(탭: 숙제 · 학생 진도 · 학생 초대)
     → 맨 아래 관리(선생님 계정)는 접어 둔다. 학생 화면은 반마다 「숙제 N개 중 M개」 막대 + 숙제 목록. */
  const head = `<div class="cls-head"><div><h2 class="qa-h">${G.esc(G.t('반 · 숙제', 'Class & homework'))}</h2>` +
    `<p class="qa-lead">${G.esc(teach ? G.t('숙제를 내고, 학생 진도를 한눈에 봐요. 숙제 · 복습용이에요.', 'Give homework and see every student’s progress at a glance. For homework and review.') : G.t('선생님이 낸 숙제를 하면 저절로 「했어요」가 돼요.', 'Do the homework your teacher gives: it’s checked off automatically.'))}</p></div>` +
    (teach ? `<button type="button" class="pt-next cls-newbtn" data-clsnew>＋ ${G.esc(G.t('새 반', 'New class'))}</button>` : '') + '</div>';
  if (!clsSession) {
    /* QR · 반 링크로 막 들어온 사람의 첫 화면(운영자 2026-10-07 「촌스럽다 — 깔끔하게」): 가운데 초대 카드 하나 — 얼굴 · 한 줄 제목 ·
       반 코드 · 구글로 한 번에 · 세 걸음 · 작은 개인정보 안내. 위의 「반 · 숙제」 제목 줄은 CSS(:has(.cls-inv))가 숨긴다. */
    if (cls.code) {
      box.innerHTML = `<div class="cls-inv"><img class="cls-inv-logo" src="logo-256.png" alt="" width="88" height="88">` +
        `<span class="cls-inv-kick">${G.esc(G.t('숙제 · 복습 반 초대', 'Homework & review class'))}</span>` +
        `<h2>${G.esc(G.t('선생님이 반에 초대했어요', 'Your teacher invited you'))}</h2>` +
        `<p class="cls-inv-lead">${G.esc(G.t('로그인만 하면 바로 들어가요. 이름이나 코드를 넣을 필요 없어요.', 'Just sign in and you’re in: no name or code to type.'))}</p>` +
        `<div class="cls-inv-code">${G.esc(G.t('반 코드', 'Class code'))} <b>${G.esc(cls.code)}</b></div>` +
        `<button type="button" class="cls-inv-google" data-clsgoogle><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>${G.esc(G.t('Google로 계속하기', 'Continue with Google'))}</button>` +
        `<button type="button" class="cls-inv-mail" data-clslogin>${G.esc(G.t('이메일로 로그인', 'Sign in with email'))}</button>` +
        `<ol class="cls-inv-steps"><li><b>1</b>${G.esc(G.t('로그인', 'Sign in'))}</li><li><b>2</b>${G.esc(G.t('반에 저절로', 'Joined automatically'))}</li><li><b>3</b>${G.esc(G.t('첫 화면에 숙제', 'Homework on your home'))}</li></ol>` +
        clsPrivacy() + '</div>';
      return;
    }
    box.innerHTML = head + `<div class="cls-card cls-invite"><p>${G.esc(G.t('반에 들어가려면 로그인해 주세요.', 'Sign in to join a class.'))}</p>` +
      `<div class="cls-two"><button type="button" class="pt-next" data-clslogin="student">${G.esc(G.t('학생으로 로그인', 'Sign in as a student'))}</button><button type="button" class="pt-ghost" data-clslogin="teacher">${G.esc(G.t('선생님으로 로그인', 'Sign in as a teacher'))}</button></div></div>`;
    return;
  }
  if (cls.err) { box.innerHTML = head + `<div class="cls-card"><p>${G.esc(cls.err)}</p></div>`; return; }
  const roleBar = `<div class="cls-role" role="tablist"><button type="button" role="tab" aria-selected="${!asT}" class="${asT ? '' : 'on'}" data-clsrole="student">${G.esc(G.t('학생', 'Student'))}</button><button type="button" role="tab" aria-selected="${asT}" class="${asT ? 'on' : ''}" data-clsrole="teacher">${G.esc(G.t('선생님', 'Teacher'))}</button></div>`;
  const hi = cls.hi ? `<div class="cls-card cls-hi">${G.esc(cls.hi)}${clsPrivacy()}</div>` : '';
  let name = ''; try { name = localStorage.getItem(G.QA_NAME_KEY) || ''; } catch (e) {}
  const joined = cls.code && cls.rows.some((c) => c.code === cls.code);
  const join = `<div class="cls-card cls-join"><b>${G.esc(cls.code && !joined ? G.t(`반 코드 ${cls.code} 에 들어가기`, `Join class ${cls.code}`) : G.t('코드로 반 들어가기', 'Join with a code'))}</b>` +
    `<div class="cls-row">${cls.code && !joined ? '' : `<input id="clsCode" class="sb-in" maxlength="6" placeholder="${G.esc(G.t('반 코드 6자리', '6-letter code'))}" autocapitalize="characters">`}` +
    `<input id="clsName" class="sb-in" maxlength="20" placeholder="${G.esc(G.t('반에서 보일 이름', 'Your name in class'))}" value="${G.esc(name)}">` +
    `<button type="button" class="pt-next" data-clsjoin>${G.esc(G.t('들어가기', 'Join'))}</button></div>${cls.msg ? `<p class="cls-msg">${G.esc(cls.msg)}</p>` : ''}${clsPrivacy()}</div>`;
  const done = (h, u) => { const d = cls.done.find((x) => x.hw_id === h.id && x.user_id === u); return !!d && d.n >= (h.kind === 'vocab' ? h.goal : 1); };
  /* 요약 숫자(선생님) — 반 · 학생 · 숙제 · 평균 완료 */
  let stats = '';
  if (teach && asT) {
    const mine = cls.rows.filter((c) => c.owner === clsSession.user.id);
    let cells = 0, ok = 0;
    for (const c of mine) { const hw = cls.hw.filter((h) => h.class_id === c.id), mem = cls.members.filter((x) => x.class_id === c.id);
      for (const m of mem) for (const h of clsHwFor(c.id, m.user_id)) { cells++; if (done(h, m.user_id)) ok++; } }
    const st = [[mine.length, G.t('반', 'Classes')], [cls.members.filter((x) => mine.some((c) => c.id === x.class_id)).length, G.t('학생', 'Students')],
      [cls.hw.filter((h) => mine.some((c) => c.id === h.class_id)).length, G.t('낸 숙제', 'Homework')], [cells ? `${Math.round((ok / cells) * 100)}%` : '–', G.t('평균 완료', 'Avg. done')]];
    stats = `<div class="cls-stats">${st.map(([v, k]) => `<div><b>${G.esc(String(v))}</b><span>${G.esc(k)}</span></div>`).join('')}</div>`;
  }
  const newc = teach && asT && (cls.open.newc || !cls.rows.some((c) => c.owner === clsSession.user.id)) ? `<div class="cls-card cls-newc"><b>${G.esc(G.t('새 반 만들기', 'New class'))}</b><div class="cls-row"><input id="clsNew" class="sb-in" maxlength="40" placeholder="${G.esc(G.t('예: Preply 1:1 · TOPIK 쓰기 8주 반', 'e.g. Preply 1:1 · TOPIK writing, 8 weeks'))}">` +
    `<button type="button" class="pt-next" data-clsmake>${G.esc(G.t('만들기', 'Create'))}</button></div></div>` : '';
  const cards = cls.rows.filter((c) => asT ? c.owner === clsSession.user.id : c.owner !== clsSession.user.id).map((c) => {
    const mine = c.owner === clsSession.user.id;
    const hw = cls.hw.filter((h) => h.class_id === c.id);
    const mem = cls.members.filter((x) => x.class_id === c.id);
    if (!mine) return `<div class="ck-wrap">${clsStudentPanel(c, { uid: clsSession.user.id, hw: cls.hw, done: cls.done, tgt: cls.tgt, stu: cls.stu, fb: cls.fb }, false)}` +
      `<div class="ck-leave"><button type="button" class="cls-small" data-clsleave="${c.id}">${G.esc(G.t('반 나가기', 'Leave class'))}</button></div></div>`;
    const tab = cls.tab?.[c.id] || (mem.length ? 'hw' : 'inv');   // 학생이 아직 없으면 초대 탭부터
    const tabs = [['hw', G.t('숙제', 'Homework'), hw.length], ['stu', G.t('학생 관리', 'Students'), mem.length], ['inv', G.t('학생 초대', 'Invite'), '']];
    const empty = (ic, msg, btn) => `<div class="cls-blank"><span>${ic}</span><p>${G.esc(msg)}</p>${btn || ''}</div>`;
    let body = '';
    // 숙제 내기를 위에(늘 펼침), 낸 숙제 목록은 그 아래
    if (tab === 'hw') body = clsAddForm(c) + (hw.length ? `<ul class="cls-hws">${hw.map((h) => clsHwRow(c, h)).join('')}</ul>` : empty('', G.t('아직 낸 숙제가 없어요. 위에서 학생 · 숙제를 골라 내 보세요.', 'No homework yet: pick a student and homework above.')));
    if (tab === 'stu') body = mem.length ? clsReportHtml(c) : empty('', G.t('아직 들어온 학생이 없어요. 「학생 초대」의 QR을 보내 주세요.', 'No students yet: send them the QR from “Invite”.'), `<button type="button" class="pt-ghost" data-clstab="${c.id}:inv">${G.esc(G.t('학생 초대 열기', 'Open invite'))}</button>`);
    if (tab === 'inv') body = clsQrHtml(c);
    return `<section class="cls-card cls-class"><div class="cls-c-top"><div class="cls-c-name"><h3>${G.esc(c.name)}</h3>` +
      `<span class="cls-meta">${G.esc(G.t('코드', 'Code'))} <b>${G.esc(c.code)}</b> · ${G.esc(G.t(`학생 ${mem.length}명 · 숙제 ${hw.length}개`, `${mem.length} students · ${hw.length} homework`))}</span></div>` +
      `<button type="button" class="pt-ghost cls-mini" data-clscopy="${G.esc(c.code)}">${G.esc(G.t('링크 복사', 'Copy link'))}</button></div>` +
      `<div class="cls-tabs" role="tablist">${tabs.map(([k, l, n]) => `<button type="button" role="tab" aria-selected="${k === tab}" class="${k === tab ? 'on' : ''}" data-clstab="${c.id}:${k}">${G.esc(l)}${n !== '' ? ` <em>${n}</em>` : ''}</button>`).join('')}</div>` +
      `<div class="cls-tabbody">${body}</div>` +
      `<div class="cls-foot"><button type="button" class="cls-small" data-clsren="${c.id}">${G.esc(G.t('반 이름 바꾸기', 'Rename class'))}</button><button type="button" class="cls-small" data-clsarch="${c.id}">${G.esc(G.t('반 닫기', 'Close class'))}</button></div></section>`;
  }).join('');
  const admin = asT && clsIsAdmin() ? clsReqHtml() + `<details class="cls-admin"${cls.open.admin ? ' open' : ''} data-clsadmin><summary>${G.esc(G.t(`선생님 계정 관리 · ${(clsTeachers || []).length}명`, `Manage teachers · ${(clsTeachers || []).length}`))}</summary>${clsTeacherHtml()}</details>` : '';
  const need = (teach && cls.need ? `<div class="cls-card cls-need">${G.esc(G.t('학생 관리(레벨 · 한마디 · 메모 · 학생별 숙제)를 쓰려면 Supabase SQL Editor 에서 db/add_class_students.sql 을 한 번 돌려 주세요.', 'Run db/add_class_students.sql once to enable student management.'))}</div>` : '') +
    (teach && cls.needFb ? `<div class="cls-card cls-need">${G.esc(G.t('숙제 코멘트를 쓰려면 Supabase SQL Editor 에서 db/add_class_feedback.sql 을 한 번 돌려 주세요.', 'Run db/add_class_feedback.sql once to enable homework comments.'))}</div>` : '');
  const stuEmpty = `<p class="cls-empty">${G.esc(G.t('아직 들어간 반이 없어요. 선생님께 받은 링크를 누르거나 코드를 넣어 주세요.', 'You haven’t joined a class yet. Open the link from your teacher or enter the code.'))}</p>`;
  const stuJoin = (!cls.code || joined) ? (cls.rows.some((c) => c.owner !== clsSession.user.id) ? `<details class="cls-more-join"><summary>${G.esc(G.t('다른 반 코드가 있어요', 'I have another class code'))}</summary>${join}</details>` : join) : '';
  const body = asT
    ? (teach ? need + stats + clsTeacherTop() + clsCareHtml() + newc + cards + admin : clsApplyHtml())
    : ((cls.code && !joined) ? join : '') + (cards || stuEmpty) + stuJoin;
  box.innerHTML = head + hi + roleBar + body;
  clsQrFill();
}
G.$('clsWrap')?.addEventListener('input', (ev) => {
  const fr = ev.target.closest?.('[data-clsfree]');
  if (fr) { const cid = fr.dataset.clsfree; if (cls.pick[cid]) cls.pick[cid].free = fr.value.trim(); const g = fr.closest('.cls-form')?.querySelector('.cls-give2'); if (g) g.disabled = !(cls.pre[cid] && cls.pick[cid]?.free); return; }
  const sIn = ev.target.closest?.('[data-clssearch]'); if (!sIn) return;
  const cid = sIn.dataset.clssearch; cls.q[cid] = sIn.value;
  const box = document.querySelector(`[data-clspicklist="${cid}"]`); if (box) box.innerHTML = clsPickResults(cid);
  sIn.closest('.cls-pick')?.querySelector('.cls-recent')?.toggleAttribute('hidden', !!sIn.value);
});
G.$('clsWrap')?.addEventListener('keydown', (ev) => {
  /* 검색 칸에서 Enter — 맨 위 결과를 고른다 */
  if (ev.key !== 'Enter' || !ev.target.matches?.('[data-clssearch]')) return;
  ev.preventDefault(); ev.target.closest('.cls-pick')?.querySelector('[data-clspick]')?.click();
});
G.$('clsWrap')?.addEventListener('change', (ev) => {
  const di = ev.target.closest?.('[data-clsdue]');
  if (di) { cls.due[di.dataset.clsdue] = di.value || ''; clsPaint(); return; }
  const k = ev.target.closest('[data-clskind]');
  if (!k) return;
  const f = k.closest('.cls-form');
  for (const x of ['lesson', 'grammar', 'vocab', 'twrite', 'tread']) f.querySelector(`.cls-f-${x}`).hidden = k.value !== x;
});
G.$('clsWrap')?.addEventListener('toggle', (ev) => { const d = ev.target.closest?.('[data-clsadd]'); if (d) cls.open[d.dataset.clsadd] = d.open; if (ev.target.matches?.('[data-clsadmin]')) cls.open.admin = ev.target.open; if (ev.target.matches?.('[data-clsstu]')) cls.open['s' + ev.target.dataset.clsstu] = ev.target.open; }, true);
G.$('clsWrap')?.addEventListener('click', async (ev) => {
  const el = (s) => ev.target.closest(s);
  const lg = el('[data-clslogin]'); if (lg) { if (lg.dataset.clslogin) G.clsSetRole(lg.dataset.clslogin); G.auRolePaint(); G.open('account'); return; }
  const rl = el('[data-clsrole]'); if (rl) { G.clsSetRole(rl.dataset.clsrole); clsPaint(); return; }
  if (el('[data-clsapply]')) {
    const nm = (G.$('clsApName')?.value || '').trim(), nt = (G.$('clsApNote')?.value || '').trim();
    if (!nm) { G.$('clsApName')?.focus(); return; }
    const r = await G.sb.rpc('cls_teacher_apply', { p_name: nm, p_note: nt });
    if (r.error) { cls.err = G.t('신청하지 못했어요. 조금 뒤에 다시 해 주세요.', 'Could not send: try again shortly.'); clsPaint(); return; }
    G.track('선생님신청'); await clsLoad(); return;
  }
  const rq = el('[data-clsreq]'); if (rq) { const [uid, ok] = rq.dataset.clsreq.split(':'); const r = await G.sb.rpc('cls_teacher_decide', { p_user: uid, p_ok: ok === '1' }); if (!r.error) { G.track(ok === '1' ? '선생님승인' : '선생님거절'); await clsLoad(); } return; }
  const sbm = el('[data-clssub]'); if (sbm) { clsSubOpen(Number(sbm.dataset.clssub)); return; }
  const vw = el('[data-clsview]'); if (vw) { const [hid, uid] = vw.dataset.clsview.split(':'); clsPresOpen(Number(hid), uid || ''); return; }
  if (el('[data-clsgoogle]')) { G.track('반초대구글'); G.$('wbGoogle')?.click(); return; }
  if (el('[data-clsjoin]')) {
    const code = (cls.code && !cls.rows.some((c) => c.code === cls.code) ? cls.code : (G.$('clsCode')?.value || '')).trim().toUpperCase();
    const name = (G.$('clsName')?.value || '').trim().slice(0, 20) || G.t('학생', 'Student');
    if (code.length !== 6) { cls.msg = G.t('반 코드 6자리를 넣어 주세요.', 'Enter the 6-letter code.'); clsPaint(); return; }
    try { localStorage.setItem(G.QA_NAME_KEY, name); } catch (e) {}
    if (!(await clsJoin(code, name))) clsPaint();
    return;
  }
  if (clsCkGo(ev)) return;
  const dp = el('[data-clsduepre]');
  if (dp) { const [cid, n] = dp.dataset.clsduepre.split(':'); cls.due[cid] = Number(n) < 0 ? '' : clsDueIn(Number(n)); clsPaint(); return; }
  const wb = el('[data-clswho]');
  if (wb) { const [cid, uid] = wb.dataset.clswho.split(':'); cls.pre[cid] = uid; clsPaint(); return; }
  const ss = el('[data-clsstusave]');
  if (ss) {
    const [cid, uid] = ss.dataset.clsstusave.split(':'), box2 = ss.closest('.cls-stu-form');
    const lvv = box2.querySelector('[data-clsstulv]').value, msg = box2.querySelector('[data-clsstumsg]').value.trim().slice(0, 300), note = box2.querySelector('[data-clsstunote]').value.trim().slice(0, 2000);
    const [kind, num] = lvv.split(':'), g = Number(num);
    const row = { class_id: Number(cid), user_id: uid, msg: msg || null, updated_at: new Date().toISOString(),
      lv: !lvv ? null : kind === 'c' ? G.LT_GRADE_TO_LEVEL[g] : g, goal: kind === 'c' ? 'topik' : null, grade: kind === 'c' ? g : null };
    ss.disabled = true;
    const [r1, r2] = await Promise.all([G.sb.from('class_student').upsert(row),
      note ? G.sb.from('class_student_note').upsert({ class_id: Number(cid), user_id: uid, note, updated_at: row.updated_at }) : G.sb.from('class_student_note').delete().eq('class_id', Number(cid)).eq('user_id', uid)]);
    if (r1.error || r2.error) { cls.err = G.t('학생 관리 표가 아직 없어요. Supabase SQL Editor 에서 db/add_class_students.sql 을 돌려 주세요.', 'Run db/add_class_students.sql first.'); clsPaint(); return; }
    G.track(lvv ? '반레벨지정' : '반학생저장'); cls.open['s' + ss.dataset.clsstusave] = true; await clsLoad();
    const b2 = document.querySelector(`[data-clsstusave="${ss.dataset.clsstusave}"]`); if (b2) { b2.textContent = G.t('저장했어요 ✓', 'Saved ✓'); setTimeout(() => { b2.textContent = G.t('저장', 'Save'); }, 1600); }
    return;
  }
  const sh = el('[data-clsstuhw]');
  if (sh) { const [cid, uid] = sh.dataset.clsstuhw.split(':'); cls.pre[cid] = uid; cls.open[cid] = true; cls.tab[cid] = 'hw'; clsPaint();
    document.querySelector(`[data-clsadd="${cid}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const tb = el('[data-clstab]');
  if (tb) { const [cid, k] = tb.dataset.clstab.split(':'); cls.tab[cid] = k; if (k === 'inv') G.track('반QR열기'); if (k === 'stu') G.track('반리포트열기'); clsPaint(); return; }
  if (el('[data-clsnew]')) { cls.open.newc = !cls.open.newc; clsPaint(); if (cls.open.newc) G.$('clsNew')?.focus(); return; }
  const qb = el('[data-clsqr]');
  if (qb) { const k = 'qr' + qb.dataset.clsqr; cls.open[k] = !cls.open[k]; if (cls.open[k]) G.track('반QR열기'); clsPaint(); return; }
  const qs = el('[data-clsqrsave]');
  if (qs) { if (!qs.dataset.url) return; const a = document.createElement('a'); a.href = qs.dataset.url; a.download = `cheesepotato-class-${qs.dataset.name}.png`; a.click(); return; }
  const rp = el('[data-clsrep]');
  if (rp) { const k = 'rep' + rp.dataset.clsrep; cls.open[k] = !cls.open[k]; if (cls.open[k]) G.track('반리포트열기'); clsPaint();
    return; }
  const kk = el('[data-clskick]');
  if (kk) {
    const [cid, uid] = kk.dataset.clskick.split(':');   // 「반:학생」
    if (!confirm(G.t('이 학생을 반에서 뺄까요? 숙제 기록은 남고, QR 로 다시 들어올 수 있어요.', 'Remove this student? Their homework records stay and they can rejoin with the QR.'))) return;
    await G.sb.from('class_members').delete().eq('class_id', Number(cid)).eq('user_id', uid); G.track('반학생뺌'); await clsLoad(); return;
  }
  const cv = el('[data-clscsv]');
  if (cv) { const c = cls.rows.find((x) => x.id === Number(cv.dataset.clscsv)); if (c) clsReportCsv(c); return; }
  if (el('[data-clsteachadd]')) {
    const email = (G.$('clsTeachEmail')?.value || '').trim().toLowerCase(), name = (G.$('clsTeachName')?.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    const { error } = await G.sb.from('class_teachers').insert({ email, name: name || null });
    if (error) cls.err = G.t('선생님을 올리지 못했어요.', 'Could not add the teacher.');
    await clsLoad(); return;
  }
  const td = el('[data-clsteachdel]');
  if (td) { if (!window.confirm(G.t('이 선생님을 뺄까요? 이미 만든 반은 그대로 남아요.', 'Remove this teacher? Their classes stay.'))) return; await G.sb.from('class_teachers').delete().eq('email', td.dataset.clsteachdel); await clsLoad(); return; }
  if (el('[data-clsmake]')) {
    const name = (G.$('clsNew')?.value || '').trim();
    if (!name) return;
    const { error } = await G.sb.from('classes').insert({ name });
    if (error) { cls.err = G.t('반을 만들지 못했어요.', 'Could not create the class.'); }
    else cls.open.newc = false;
    await clsLoad(); return;
  }
  const cp = el('[data-clscopy]');
  if (cp) { try { await navigator.clipboard.writeText(clsLink(cp.dataset.clscopy)); cp.textContent = G.t('복사했어요 ✓', 'Copied ✓'); } catch (e) { cp.textContent = clsLink(cp.dataset.clscopy); } return; }
  const qa = el('[data-clsqadd]');
  if (qa) { const cid = Number(qa.dataset.clsqadd), it = clsFormItem(qa.closest('.cls-form')); if (!it) return;
    (cls.queue[cid] ??= []).push(it); cls.pick[cid] = null; cls.q[cid] = ''; cls.open[cid] = true; clsPaint(); document.querySelector(`[data-clssearch="${cid}"]`)?.focus(); return; }
  /* 숙제 고르기 — 검색 결과 · 종류 칩 · 최근 숙제 · 횟수 · 바꾸기 */
  const pi = el('[data-clspick]');
  if (pi) { const [cid, i] = pi.dataset.clspick.split(':').map(Number), x = clsCatalog()[i]; if (!x) return;
    cls.pick[cid] = { kind: x.kind, ref: x.ref, goal: x.kind === 'vocab' ? 3 : 1, title: x.title, free: '' }; clsPaint(); if (x.kind === 'free') document.querySelector(`[data-clsfree="${cid}"]`)?.focus(); return; }
  const fkb = el('[data-clsfk]');
  if (fkb) { const [cid, k] = fkb.dataset.clsfk.split(':'); cls.fk[cid] = k; clsPaint(); document.querySelector(`[data-clssearch="${cid}"]`)?.focus(); return; }
  const rc = el('[data-clsrecent]');
  if (rc) { const h = cls.hw.find((x) => x.id === Number(rc.dataset.clsrecent)); if (!h) return;
    cls.pick[h.class_id] = { kind: h.kind, ref: h.ref, goal: h.goal || 1, title: h.title.replace(/ · (\d+주차|week \d+)$/, '').replace(/ — (세션 \d+번|\d+ sessions)$/, '') }; clsPaint(); return; }
  const sp = el('[data-clsstep]');
  if (sp) { const [cid, d] = sp.dataset.clsstep.split(':').map(Number), pk = cls.pick[cid]; if (!pk) return; pk.goal = Math.max(1, Math.min(20, pk.goal + d)); clsPaint(); return; }
  const up = el('[data-clsunpick]');
  if (up) { const cid = up.dataset.clsunpick; cls.pick[cid] = null; clsPaint(); document.querySelector(`[data-clssearch="${cid}"]`)?.focus(); return; }
  const qd = el('[data-clsqdel]');
  if (qd) { const [cid, i] = qd.dataset.clsqdel.split(':').map(Number); cls.queue[cid]?.splice(i, 1); clsPaint(); return; }
  const rx = el('[data-clsrex]');
  if (rx) { cls.re[rx.dataset.clsrex] = null; clsPaint(); return; }
  const rg = el('[data-clsre]');
  if (rg) { const h = cls.hw.find((x) => x.id === Number(rg.dataset.clsre)); if (!h) return;
    cls.re[h.class_id] = h; cls.open[h.class_id] = true; cls.tab[h.class_id] = 'hw';
    cls.pick[h.class_id] = { kind: h.kind, ref: h.ref, goal: h.goal || 1, title: h.title.replace(/ · (\d+주차|week \d+)$/, '').replace(/ — (세션 \d+번|\d+ sessions)$/, '') }; clsPaint();
    document.querySelector(`[data-clsformcid="${h.class_id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return; }
  const give = el('[data-clsgive]');
  if (give) {
    /* 묶음(목록에 담은 것) + 지금 폼 하나를 같은 학생 · 같은 기한으로. 매주 반복이면 N주 치를 기한 1주씩 늘려 한 번에 */
    const f = give.closest('.cls-form'), cid = Number(give.dataset.clsgive);
    const due = cls.due[cid] || null, weeks = 1;
    const to = cls.pre[cid] ? [cls.pre[cid]] : [];
    if (!to.length) return;
    const items = [...(cls.queue[cid] || []), clsFormItem(f)].filter(Boolean);
    if (!items.length) return;
    const base = due ? new Date(`${due}T00:00:00`) : (weeks > 1 ? (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d; })() : null);
    const rows = [];
    for (let w = 0; w < weeks; w++) for (const it of items) {
      const d = base ? new Date(base) : null; if (d) d.setDate(d.getDate() + 7 * w);
      rows.push({ class_id: cid, kind: it.kind, ref: it.ref, goal: it.goal, title: (weeks > 1 ? `${it.title} · ${G.t(`${w + 1}주차`, `week ${w + 1}`)}` : it.title).slice(0, 120), due: d ? clsYmd(d) : null });
    }
    give.disabled = true;
    const { data: made, error } = await G.sb.from('class_homework').insert(rows).select('id');
    if (error) { cls.err = error.code === '23514' && rows.some((r) => r.kind === 'free') ? G.t('「글 · 사진 제출」 숙제를 쓰려면 Supabase SQL Editor 에서 db/add_class_submit.sql 을 한 번 돌려 주세요.', 'To use written / photo homework, run db/add_class_submit.sql once in the Supabase SQL Editor.') : error.code === '23514' ? G.t('새 숙제 종류(듣기 · 모의고사 · 회화 · 동화책 · 번역)를 쓰려면 Supabase SQL Editor 에서 db/add_classes_more_kinds.sql 을 한 번 돌려 주세요.', 'Run db/add_classes_more_kinds.sql once to enable the new homework types.') : G.t('숙제를 내지 못했어요.', 'Could not save the homework.'); }
    else if (to.length) {
      const r2 = await G.sb.from('class_hw_target').insert(made.flatMap((x) => to.map((u) => ({ hw_id: x.id, user_id: u }))));
      if (r2.error) { await G.sb.from('class_homework').delete().in('id', made.map((x) => x.id)); cls.err = G.t('학생별 숙제 표가 아직 없어요. Supabase SQL Editor 에서 db/add_class_students.sql 을 돌려 주세요.', 'Run db/add_class_students.sql first.'); }
    }
    cls.open[cid] = false; cls.queue[cid] = []; cls.re[cid] = null; cls.pick[cid] = null; cls.q[cid] = ''; cls.fk[cid] = ''; cls.due[cid] = undefined;   // 학생은 그대로 — 같은 학생에게 이어서 낸다
    G.track(rows.length > 1 ? '숙제냄_묶음' : to.length ? '숙제냄_학생별' : '숙제냄'); await clsLoad(); return;
  }
  /* 오늘 챙길 학생 → 그 반 「학생 관리」 · 그 학생 카드 */
  const fo = el('[data-clsfocus]');
  if (fo) { const [cid] = fo.dataset.clsfocus.split(':'); cls.tab[cid] = 'stu'; cls.open['s' + fo.dataset.clsfocus] = true; clsPaint();
    document.querySelector(`[data-clsstu="${fo.dataset.clsfocus}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  /* 숙제 코멘트 — 열기 · 저장 · 지우기 */
  const fbo = el('[data-clsfbopen]');
  if (fbo) { const k = 'fb' + fbo.dataset.clsfbopen; cls.open[k] = !cls.open[k]; clsPaint(); document.querySelector(`[data-clsfbtxt="${fbo.dataset.clsfbopen}"]`)?.focus(); return; }
  const fbs = el('[data-clsfbsave]');
  if (fbs) { const key = fbs.dataset.clsfbsave, [hw, uid] = key.split(':'), msg = (document.querySelector(`[data-clsfbtxt="${key}"]`)?.value || '').trim().slice(0, 500);
    const q2 = msg ? G.sb.from('class_feedback').upsert({ hw_id: Number(hw), user_id: uid, msg, at: new Date().toISOString() }) : G.sb.from('class_feedback').delete().eq('hw_id', Number(hw)).eq('user_id', uid);
    const { error } = await q2;
    if (error) { cls.err = G.t('코멘트 표가 아직 없어요. Supabase SQL Editor 에서 db/add_class_feedback.sql 을 돌려 주세요.', 'Run db/add_class_feedback.sql first.'); clsPaint(); return; }
    G.track('숙제코멘트'); cls.open['fb' + key] = false; await clsLoad(); return; }
  const pdf = el('[data-clsstupdf]');
  if (pdf) { const [cid, uid] = pdf.dataset.clsstupdf.split(':'); const c = cls.rows.find((x) => x.id === Number(cid)), m = cls.members.find((x) => x.class_id === Number(cid) && x.user_id === uid); if (c && m) clsStuPrint(c, m); return; }
  const del = el('[data-clsdel]');
  if (del) { if (!confirm(G.t('이 숙제를 지울까요? 학생 기록도 같이 지워져요.', 'Delete this homework and its records?'))) return; await G.sb.from('class_homework').delete().eq('id', Number(del.dataset.clsdel)); await clsLoad(); return; }
  /* 반 이름 바꾸기 — 학생 「내 반」 카드 제목이 이 이름이다(운영자 2026-10-07 「Preply 같은 건 빼고 반 이름만」) */
  const rn = el('[data-clsren]');
  if (rn) { const c = cls.rows.find((x) => x.id === Number(rn.dataset.clsren)); if (!c) return;
    const nm = (window.prompt(G.t('학생에게 보일 반 이름', 'Class name students will see'), c.name) || '').trim().slice(0, 40);
    if (!nm || nm === c.name) return;
    const { error } = await G.sb.from('classes').update({ name: nm }).eq('id', c.id);
    if (error) { cls.err = G.t('반 이름을 바꾸지 못했어요.', 'Could not rename the class.'); }
    G.track('반이름바꿈'); clsHomeAt = 0; await clsLoad(); return; }
  const ar = el('[data-clsarch]');
  if (ar) { if (!confirm(G.t('이 반을 닫을까요? 학생에게 더 보이지 않아요.', 'Close this class? Students will no longer see it.'))) return; await G.sb.from('classes').update({ archived: true }).eq('id', Number(ar.dataset.clsarch)); await clsLoad(); return; }
  const lv = el('[data-clsleave]');
  if (lv) { if (!confirm(G.t('이 반에서 나갈까요?', 'Leave this class?'))) return; await G.sb.from('class_members').delete().eq('class_id', Number(lv.dataset.clsleave)).eq('user_id', clsSession.user.id); await clsLoad();
    try { await G.loadPro(G.sb, clsSession); G.proPaintAccount(); } catch (e) {}   // 반을 나가면 반 학생 Pro 도 끝
    return; }
  const go = el('[data-clsgo]');
  if (go) clsGo(Number(go.dataset.clsgo));
});
/* 숙제 「하러 가기」 — 반 화면 · 첫 화면 숙제 카드가 같이 쓴다 */
async function clsGo(id) {
    const h = cls.hw.find((x) => x.id === id);
    if (!h) return;
    G.track('숙제하러감');
    if (h.kind === 'free') { clsSubOpen(h.id); return; }
    if (h.kind === 'vocab') { window.cpOpen('words', h.ref ? `topic/${String(h.ref).replace('/', '~')}` : ''); return; }
    if (h.kind === 'grammar') { window.cpOpen('learn', `sentence/${h.ref}`); return; }
    if (h.kind === 'twrite') { window.cpOpen('learn', `writing/${h.ref}`); return; }
    if (h.kind === 'tlisten') { const [e, ty] = String(h.ref).split(':'); window.cpOpen('learn', `topik/${e}/listening/set-${ty}`); return; }
    if (h.kind === 'tmock') { const [e, r] = String(h.ref).split(':'); window.cpOpen('learn', `topik/mock/${e}/${r}/start`); return; }
    if (h.kind === 'convo') { window.cpOpen('learn', `convo/${h.ref}`); return; }
    if (h.kind === 'story') { window.cpOpen('learn', `stories/${h.ref}`); return; }
    if (h.kind === 'translate') { window.cpOpen('learn', `translate/${h.ref}`); return; }
    if (h.kind === 'tread') {
      /* 그 시험 · 그 유형이 있는 급수로 바꾼 뒤 유형 연습을 바로 연다 */
      const [e, ty] = String(h.ref).split(':');
      window.cpOpen('learn', 'topik');
      await G.tqNeedData();
      if (!G.TQ_EXAMS[e]) return;
      G.tqExam = e; try { localStorage.setItem(G.TQ_EXAM_KEY, e); } catch (x) {}
      const g = G.TQ_EXAMS[e].grades.find((gg) => G.TQ_EXAMS[e].reading.some((q) => q.grade === gg && q.type === ty));
      if (g) G.tqGrade = g;
      G.drawTopik(); G.tqStart(ty); return;
    }
    await G.coursesNeed();
    const co = G.COURSES.find((c) => c.lessons.some((l) => l.id === h.ref));
    if (co) G.startLesson(co, co.lessons.find((l) => l.id === h.ref));
}

/* ── 콘텐츠에서 바로 숙제로 내기 · 끝나면 다음 숙제로 (2026-10-14 「컨텐츠간 연결 · 바로 숙제를 풀거 낼 수 있게」) ──
   선생님: 문법 · 레슨 · 회화 · 동화책 · 번역 · TOPIK 쓰기 · 듣기 · 모의고사를 보다가 오른쪽 아래 「📌 숙제로 내기」 한 번 → 반 · 학생 · 기한 → 끝.
   학생: 숙제를 끝내면 「✓ 숙제 완료 — 다음 숙제」 가 떠서 한 번 눌러 이어 푼다. */
let clsFabTeacher = null;   // null: 아직 모름
function clsFabContent() {
  const h = (() => { try { return decodeURIComponent(window.location.hash || ''); } catch (e) { return window.location.hash || ''; } })();
  let m;
  if ((m = h.match(/^#learn\/sentence\/([^/?]+)/))) return { kind: 'grammar', ref: m[1] };
  if ((m = h.match(/^#learn\/convo\/([^/?]+)/))) return { kind: 'convo', ref: m[1] };
  if ((m = h.match(/^#learn\/stories\/([^/?]+)/))) return { kind: 'story', ref: m[1] };
  if ((m = h.match(/^#learn\/translate\/([^/?]+)/))) return { kind: 'translate', ref: m[1] };
  if ((m = h.match(/^#learn\/writing\/([^/?]+)/))) return { kind: 'twrite', ref: m[1] };
  if ((m = h.match(/^#learn\/topik\/mock\/([^/]+)\/([^/]+)/))) return { kind: 'tmock', ref: `${m[1]}:${m[2]}` };
  if ((m = h.match(/^#learn\/topik\/([^/]+)\/listening\/set-([^/?]+)/))) return { kind: 'tlisten', ref: `${m[1]}:${m[2]}` };
  if (G.lsLesson && !G.$('lessonView')?.classList.contains('hidden')) return { kind: 'lesson', ref: G.lsLesson.id, title: G.cTx(G.lsLesson.title) };
  return null;
}
async function clsFabUpdate() {
  let fab = document.getElementById('clsFab');
  const it = clsFabContent();
  if (!it) { if (fab) fab.hidden = true; return; }
  if (clsFabTeacher === null) {
    clsFabTeacher = false;   // 물어보는 동안 또 묻지 않게
    try { const { data: { session } } = await G.sb.auth.getSession(); if (session) { const r = await G.sb.rpc('cls_is_admin'); clsFabTeacher = !r.error && !!r.data; } else clsFabTeacher = null; } catch (e) { clsFabTeacher = false; }
  }
  if (!clsFabTeacher) { if (fab) fab.hidden = true; return; }
  if (!fab) { fab = document.createElement('button'); fab.id = 'clsFab'; fab.type = 'button'; fab.className = 'cls-fab'; fab.textContent = `${G.t('숙제로 내기', 'Give as homework')}`; fab.addEventListener('click', clsQuickOpen); document.body.appendChild(fab); }
  fab.hidden = false;
}
setInterval(() => { clsFabUpdate().catch(() => {}); }, 1500);
G.sb.auth.onAuthStateChange(() => { clsFabTeacher = null; });
async function clsQuickOpen() {
  const it = clsFabContent(); if (!it) return;
  const { data: { session } } = await G.sb.auth.getSession(); if (!session) return;
  clsSession = session;
  if (!cls.rows.length) await clsLoad();
  const mine = cls.rows.filter((c) => c.owner === session.user.id);
  if (!mine.length) { window.location.hash = '#learn/class'; return; }
  await clsCatNeed().catch(() => {});
  const x = clsCatalog().find((c) => c.kind === it.kind && c.ref === it.ref);
  const title = (x?.title || it.title || document.title).slice(0, 120);
  let last = 0; try { last = Number(localStorage.getItem('cp_cls_last')) || 0; } catch (e) {}
  const q = { cid: (mine.find((c) => c.id === last) || mine[0]).id, who: new Set(), due: clsDueIn(7) };
  document.getElementById('clsQuick')?.remove();
  const d = document.createElement('div'); d.id = 'clsQuick'; d.className = 'cls-dlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  document.body.appendChild(d);
  const draw = () => {
    const mem = cls.members.filter((m) => m.class_id === q.cid);
    const pres = [[0, G.t('오늘', 'Today')], [1, G.t('내일', 'Tomorrow')], [3, G.t('3일 뒤', '+3 days')], [7, G.t('1주 뒤', '+1 week')], [-1, G.t('기한 없음', 'No due')]];
    d.innerHTML = `<div class="cls-dlg-box"><button type="button" class="cls-dlg-x" data-qx aria-label="${G.esc(G.t('닫기', 'Close'))}">✕</button><h3>${G.esc(title)}</h3>` +
      (mine.length > 1 ? `<div class="cls-whos">${mine.map((c) => `<button type="button" class="${c.id === q.cid ? 'on' : ''}" data-qc="${c.id}">${G.esc(c.name)}</button>`).join('')}</div>` : `<p class="cls-q-cls">${G.esc(mine[0].name)}</p>`) +
      `<small>${G.esc(G.t('누구에게', 'Who'))}</small><div class="cls-whos"><button type="button" class="${q.who.size ? '' : 'on'}" data-qw="all">${G.esc(G.t('반 전체', 'Whole class'))}</button>${mem.map((m) => `<button type="button" class="${q.who.has(m.user_id) ? 'on' : ''}" data-qw="${G.esc(m.user_id)}">${G.esc(m.name)}</button>`).join('')}</div>` +
      `<small>${G.esc(G.t('언제까지', 'Due'))}</small><div class="cls-due-pre">${pres.map(([n, l]) => `<button type="button" class="${(n < 0 ? !q.due : q.due === clsDueIn(n)) ? 'on' : ''}" data-qd="${n}">${G.esc(l)}</button>`).join('')}</div>` +
      `<p class="cls-dlg-msg" hidden></p><button type="button" class="pt-next cls-dlg-go" data-qgo>${G.esc(G.t('숙제 내기', 'Give homework'))}</button></div>`;
  };
  draw();
  d.addEventListener('click', async (ev) => {
    const el = (sel) => ev.target.closest(sel);
    if (ev.target === d || el('[data-qx]')) { d.remove(); return; }
    const qc = el('[data-qc]'); if (qc) { q.cid = Number(qc.dataset.qc); q.who = new Set(); draw(); return; }
    const qw = el('[data-qw]'); if (qw) { const v = qw.dataset.qw; if (v === 'all') q.who = new Set(); else if (q.who.has(v)) q.who.delete(v); else q.who.add(v); draw(); return; }
    const qd = el('[data-qd]'); if (qd) { const n = Number(qd.dataset.qd); q.due = n < 0 ? '' : clsDueIn(n); draw(); return; }
    if (el('[data-qgo]')) {
      const go = el('[data-qgo]'); go.disabled = true;
      const ins = await G.sb.from('class_homework').insert({ class_id: q.cid, kind: it.kind, ref: it.ref, goal: 1, title, due: q.due || null }).select('id');
      const msg = (x) => { const m = d.querySelector('.cls-dlg-msg'); m.textContent = x; m.hidden = !x; go.disabled = false; };
      if (ins.error) { msg(G.t('숙제를 내지 못했어요. 반 화면에서 다시 해 보세요.', 'Could not give it: try from the class screen.')); return; }
      if (q.who.size) {
        const r2 = await G.sb.from('class_hw_target').insert([...q.who].map((u) => ({ hw_id: ins.data[0].id, user_id: u })));
        if (r2.error) { await G.sb.from('class_homework').delete().eq('id', ins.data[0].id); msg(G.t('학생별 숙제는 db/add_class_students.sql 을 먼저 돌려야 해요.', 'Run db/add_class_students.sql first for per-student homework.')); return; }
      }
      try { localStorage.setItem('cp_cls_last', String(q.cid)); } catch (e) {}
      G.track('숙제냄_바로'); d.remove();
      clsToast(`✓ ${G.t('숙제를 냈어요', 'Homework given')}`, [[G.t('반 화면 보기', 'View class'), () => { window.location.hash = '#learn/class'; }]]);
      clsLoad().catch(() => {});
    }
  });
}
function clsToast(text, actions) {
  document.getElementById('clsToast')?.remove();
  const b = document.createElement('div'); b.id = 'clsToast'; b.className = 'cls-toast'; b.setAttribute('role', 'status');
  b.innerHTML = `<span>${G.esc(text)}</span>` + (actions || []).map((a, i) => `<button type="button" data-ta="${i}">${G.esc(a[0])}</button>`).join('') + `<button type="button" class="x" data-ta="x" aria-label="${G.esc(G.t('닫기', 'Close'))}">✕</button>`;
  b.addEventListener('click', (ev) => { const a = ev.target.closest('[data-ta]'); if (!a) return; if (a.dataset.ta !== 'x') actions[Number(a.dataset.ta)][1](); b.remove(); });
  document.body.appendChild(b); setTimeout(() => b.remove(), 12000);
}
/* 학생: 숙제를 끝냈다 — 다음 숙제를 바로 권한다 */
async function clsNextToast() {
  try {
    const { data: { session } } = await G.sb.auth.getSession(); if (!session) return;
    const uid = session.user.id;
    const r = await G.sb.from('classes').select('id, owner, archived');
    const ids = (r.data || []).filter((c) => !c.archived && c.owner !== uid).map((c) => c.id); if (!ids.length) return;
    const [h, d, tg] = await Promise.all([
      G.sb.from('class_homework').select('*').in('class_id', ids).order('created_at', { ascending: false }),
      G.sb.from('class_done').select('hw_id, n').eq('user_id', uid),
      G.sb.from('class_hw_target').select('hw_id, user_id'),
    ]);
    const done = new Map((d.data || []).map((x) => [x.hw_id, x.n])), tgt = {};
    for (const x of tg.data || []) (tgt[x.hw_id] ??= new Set()).add(x.user_id);
    const left = (h.data || []).filter((x) => (!tgt[x.id] || tgt[x.id].has(uid)) && (done.get(x.id) || 0) < (x.kind === 'vocab' ? x.goal : 1));
    if (!left.length) { clsToast(`${G.t('오늘 숙제를 모두 끝냈어요!', 'All homework done!')}`, []); return; }
    const nx = left[0];
    cls.hw = [...new Map([...cls.hw, ...(h.data || [])].map((x) => [x.id, x])).values()];
    clsToast(`✓ ${G.t('숙제 완료!', 'Homework done!')} ${G.t('다음', 'Next')}: ${nx.title}`, [[G.t('이어서 하기', 'Continue'), () => { clsGo(nx.id); }]]);
  } catch (e) { /* 알림만 못 띄운다 */ }
}

const clsHomeReset = () => { clsHomeAt = 0; };
export { clsDraw, clsHomeRender, clsHomeReset, clsNextToast };
