/* TOPIK 3D 시험장 (/exam-room/) — 운영자 2026-11-08 「진짜 교실처럼 시간이랑 띄우고 · 3D 로 아예 개별화면으로」.
   화면 전체가 3D 교실이다: 칠판에 남은 시간, 벽시계(지금 시각), 종소리, 감독관 안내 글.
   문제를 푸는 곳이 아니라 「시간과 분위기」를 재는 도구다 — 문제는 책이나 사이트 모의고사에서 푼다.
   3D 는 three.js(vendor/three.module.min.js, MIT)로 그린다. 3D 를 못 쓰는 기기는 시계만 크게 보여 준다. */
import * as THREE from './vendor/three.module.min.js?v=61473d59';

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');
const fmt = (sec) => { const s = Math.max(0, Math.ceil(sec)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
const dl = (ev, extra) => { try { (window.dataLayer = window.dataLayer || []).push({ event: ev, ...extra }); } catch (e) { /* 기록만 빠진다 */ } };

/* ══ 시험 시계 ═══════════════════════════════════════════════
   벽시계 시간으로 끝나는 때(endAt)를 잡아 둔다 — 탭이 뒤로 가도 시간이 어긋나지 않는다(실제 시험처럼). */
const ex = { name: '', total: 0, left: 0, running: false, over: false, endAt: 0, said: new Set(), began: false };
let ac = null, soundOn = true, voiceOn = false, subTimer = 0;

function audio() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
  return ac;
}
/* 종소리 한 번 — 배음 셋을 겹쳐 맑은 종 같은 소리(파일 없이 합성) */
function tone(freq, when, dur = 1.1, vol = 0.22) {
  const a = ac; if (!a) return;
  for (const [mul, v] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.value = freq * mul;
    g.gain.setValueAtTime(0, a.currentTime + when);
    g.gain.linearRampToValueAtTime(vol * v, a.currentTime + when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, a.currentTime + when + dur);
    o.connect(g).connect(a.destination); o.start(a.currentTime + when); o.stop(a.currentTime + when + dur + 0.05);
  }
}
/* 학교 종 가락(딩동댕동) — 시작 · 끝. 경고는 한 번만 */
function bell(kind) {
  if (!soundOn || !audio()) return;
  if (kind === 'warn') { tone(880, 0, 0.9, 0.16); return; }
  const m = [659.25, 523.25, 587.33, 392.0];   // E5 C5 D5 G4
  m.forEach((f, i) => tone(f, i * 0.62, 1.5, 0.22));
  if (kind === 'end') m.forEach((f, i) => tone(f, 3.2 + i * 0.62, 1.5, 0.22));
}
function speak(text) {
  if (!voiceOn || !('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = 0.92; speechSynthesis.speak(u); } catch (e) { /* 음성이 없으면 글만 */ }
}
function say(text, kind) {
  const el = $('subtitle');
  el.textContent = text; el.classList.add('on');
  clearTimeout(subTimer); subTimer = setTimeout(() => el.classList.remove('on'), kind === 'end' ? 12000 : 6500);
  if (kind) bell(kind);
  speak(text);
}

function setHud() {
  $('hudTime').textContent = ex.began ? fmt(ex.left) : '--:--';
  $('hudLabel').textContent = ex.began ? `${ex.name} · 남은 시간` : '시험을 고르세요';
  $('noGlTime').textContent = ex.began ? fmt(ex.left) : '--:--';
}

function tick() {
  if (ex.running) {
    ex.left = (ex.endAt - Date.now()) / 1000;
    const left = Math.ceil(ex.left);
    const warn = (min, text) => { if (ex.total > min * 60 + 60 && left <= min * 60 && !ex.said.has(min)) { ex.said.add(min); say(text, 'warn'); } };
    warn(10, '종료 10분 전입니다.');
    warn(5, '종료 5분 전입니다.');
    warn(1, '종료 1분 전입니다. 답을 옮겨 적었는지 확인하세요.');
    if (ex.left <= 0) finish(true);
  }
  setHud();
}
setInterval(tick, 250);

function start(name, minutes) {
  audio();
  ex.name = name; ex.total = minutes * 60; ex.left = ex.total; ex.endAt = Date.now() + ex.total * 1000;
  ex.running = true; ex.over = false; ex.began = true; ex.said = new Set();
  $('panel').hidden = true; $('bar').hidden = false; $('bPause').textContent = '일시정지 · Pause';
  say('지금부터 시험을 시작하겠습니다. 문제지를 펴 주세요.', 'start');
  dl('exam_room_start', { cp_exam: name, cp_min: minutes });
  boardDirty = true;
}
function finish(natural) {
  if (!ex.began || ex.over) return;
  ex.running = false; ex.over = true; ex.left = natural ? 0 : ex.left;
  if (natural) say('시험이 끝났습니다. 펜을 내려놓으세요.', 'end'); else say('시험을 끝냈어요.', null);
  dl('exam_room_end', { cp_exam: ex.name, cp_done: natural ? 1 : 0, cp_left: Math.round(ex.left) });
  setTimeout(() => { $('panel').hidden = false; $('bar').hidden = true; }, natural ? 7000 : 1500);
  boardDirty = true;
}
function togglePause() {
  if (!ex.began || ex.over) return;
  if (ex.running) { ex.running = false; ex.left = (ex.endAt - Date.now()) / 1000; $('bPause').textContent = '이어서 · Resume'; say('잠시 멈췄어요. 실제 시험에서는 시간이 멈추지 않아요.', null); }
  else { ex.endAt = Date.now() + ex.left * 1000; ex.running = true; $('bPause').textContent = '일시정지 · Pause'; }
  boardDirty = true;
}

/* ══ 화면 조작 ═════════════════════════════════════════════ */
let picked = { name: 'TOPIK I 읽기', min: 60 };
/* 시간 칸은 늘 보이고, 시험을 고르면 그 시험의 시간으로 바뀐다. 숫자를 직접 고치면 「직접 정하기」가 된다. */
$('opts').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-min]'); if (!b) return;
  document.querySelectorAll('#opts button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  picked = { name: b.dataset.name, min: b.dataset.min };
  if (b.dataset.min === 'custom') { $('customMin').focus(); $('customMin').select(); } else $('customMin').value = b.dataset.min;
});
$('customMin').addEventListener('input', () => {
  const v = String($('customMin').value);
  const hit = [...document.querySelectorAll('#opts button')].find((x) => x.dataset.min === v) || document.querySelector('#opts button[data-min="custom"]');
  document.querySelectorAll('#opts button').forEach((x) => x.setAttribute('aria-pressed', String(x === hit)));
  picked = { name: hit.dataset.name, min: hit.dataset.min };
});
$('bStart').addEventListener('click', () => {
  let min = Number($('customMin').value);
  if (!(min >= 1)) min = 30;
  min = Math.min(180, Math.round(min));
  start(picked.min === 'custom' ? `직접 ${min}분` : picked.name, min);
});
/* 폰(좁은 화면)에서는 아래 단추의 영어 부분을 떼어 한 줄에 더 들어가게 한다 */
{
  const mqS = matchMedia('(max-width:560px)');
  const trim = () => { if (!mqS.matches) return; document.querySelectorAll('#bar button, #online').forEach((b) => { if (b.textContent.includes(' · ')) b.textContent = b.textContent.split(' · ')[0]; }); };
  new MutationObserver(trim).observe(document.body, { childList: true, subtree: true, characterData: true });
  trim();
}
$('bPause').addEventListener('click', togglePause);
$('bEnd').addEventListener('click', () => { if (confirm('시험을 끝낼까요? End the exam?')) finish(false); });
$('bSound').addEventListener('click', (e) => { soundOn = !soundOn; e.currentTarget.setAttribute('aria-pressed', String(soundOn)); e.currentTarget.textContent = soundOn ? '종소리 켬 · Sound on' : '종소리 끔 · Sound off'; });
$('bVoice').addEventListener('click', (e) => { voiceOn = !voiceOn; e.currentTarget.setAttribute('aria-pressed', String(voiceOn)); e.currentTarget.textContent = voiceOn ? '감독관 음성 켬 · Voice on' : '감독관 음성 끔 · Voice off'; if (voiceOn) speak('음성을 켰어요.'); });
$('bFull').addEventListener('click', () => { const d = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (d.requestFullscreen) d.requestFullscreen().catch(() => {}); });
addEventListener('keydown', (ev) => {
  if (ev.target.closest && ev.target.closest('input, select, textarea')) return;
  if (ev.key === ' ' && ex.began && $('panel').hidden) { ev.preventDefault(); togglePause(); }
  if (ev.key.toLowerCase() === 'f') $('bFull').click();
});
/* 주소 ?exam=I-reading 처럼 미리 고르기(책 QR 에서 바로 들어올 때) */
{
  const q = new URLSearchParams(location.search).get('exam');
  const map = { 'I-reading': 0, 'I-listening': 1, 'II-reading': 2, 'II-writing': 3, 'II-listening': 4 };
  if (q in map) { const b = document.querySelectorAll('#opts button')[map[q]]; if (b) b.click(); }
}

/* ══ 3D 교실 ════════════════════════════════════════════════ */
let boardDirty = true, clockSec = -1;
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas: $('scene'), antialias: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (!renderer) { $('noGl').classList.add('on'); }
else buildRoom();

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { c, g, t };
}

function buildRoom() {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x1c1915);
  const fine = matchMedia('(pointer:fine)').matches;   // 마우스가 있는 기기만 그림자(폰은 가볍게)
  if (fine) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xdfeaf2, 70, 300);
  const camera = new THREE.PerspectiveCamera(66, 1, 0.05, 500);

  /* 불빛 — 환경 빛 + 창에서 들어오는 햇빛(그림자) */
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.95));
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x8a7a62, 0.65));
  const sun = new THREE.DirectionalLight(0xfff0d0, 0.95); sun.position.set(-7, 5, 1.5);
  if (fine) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 24; sun.shadow.bias = -0.0008; sun.shadow.radius = 3; }
  scene.add(sun);

  const mat = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o });
  const cast = (o) => { if (fine) { o.castShadow = true; o.receiveShadow = true; } return o; };
  const box = (w, h, d, m, x, y, z, shadow = false) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (shadow) cast(o); scene.add(o); return o; };
  const plane = (w, h, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.y = ry; scene.add(o); return o; };

  /* ── 바닥(나무 마루) · 벽 · 천장(격자) ── */
  const floorTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#c79d63'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(${90 + (i * 7) % 40},${60 + (i * 5) % 30},30,.16)`; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(60,40,20,.35)'; g.fillRect(0, i * 32, w, 2); }
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(60,40,20,.28)'; g.fillRect((i * 97) % w, ((i * 53) % 16) * 32, 2, 32); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect((i * 131) % w, (i * 29) % h, 70, 3); }
  }).t;
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(6, 8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 16), new THREE.MeshLambertMaterial({ map: floorTex }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0.5); if (fine) floor.receiveShadow = true; scene.add(floor);
  const wallM = mat(0xefe8d6), woodM = mat(0x7a5632), greenM = mat(0x5f8b6f), baseM = mat(0x4a3a2a);
  plane(12, 3.5, wallM, 0, 1.75, -7.5); plane(12, 3.5, wallM, 0, 1.75, 8.5, Math.PI); {   // 왼쪽 벽 — 창 네 개가 진짜로 뚫려 있어서 바깥(3D 풍경)이 보인다
    const WX = -6.0, seg = (z0, z1, y0, y1) => box(0.04, y1 - y0, z1 - z0, wallM, WX, (y0 + y1) / 2, (z0 + z1) / 2);
    seg(-7.5, 8.5, 0, 1.2); seg(-7.5, 8.5, 2.8, 3.5);
    [[-7.5, -5.75], [-3.45, -2.75], [-0.45, 0.25], [2.55, 3.25], [5.55, 8.5]].forEach(([a, b]) => seg(a, b, 1.2, 2.8));
  } plane(16, 3.5, wallM, 6, 1.75, 0.5, -Math.PI / 2);
  const ceilTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f5f2ea'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,115,100,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(150,145,130,.12)'; g.fillRect((i * 37) % w, (i * 71) % h, 3, 3); } }).t;
  ceilTex.wrapS = ceilTex.wrapT = THREE.RepeatWrapping; ceilTex.repeat.set(10, 13);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 16), new THREE.MeshLambertMaterial({ map: ceilTex })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.5, 0.5); scene.add(ceil);
  for (const [w, x, z, ry] of [[12, 0, -7.49, 0], [16, -5.99, 0.5, Math.PI / 2], [16, 5.99, 0.5, -Math.PI / 2], [12, 0, 8.49, Math.PI]]) {   // 아래 초록 띠 + 걸레받이
    plane(w, 0.9, greenM, x, 0.45, z, ry);
    const bx = ry === 0 || ry === Math.PI ? new THREE.BoxGeometry(w, 0.1, 0.03) : new THREE.BoxGeometry(0.03, 0.1, w);
    const b = new THREE.Mesh(bx, baseM); b.position.set(x * 0.998, 0.05, z * 0.998); scene.add(b);
  }

  /* ── 천장: 형광등 · 에어컨 · 스피커 · 감지기 ── */
  const lampM = new THREE.MeshBasicMaterial({ color: 0xfffbe8 });
  for (const z of [-4.5, -0.5, 3.5, 7]) for (const x of [-2.6, 2.6]) box(1.9, 0.05, 0.3, lampM, x, 3.47, z);
  for (const [x, z] of [[-3.6, 1.2], [3.6, 1.2]]) { box(0.9, 0.12, 0.9, mat(0xf2f2ee), x, 3.44, z); box(0.55, 0.02, 0.55, mat(0xd8d8d2), x, 3.375, z); }   // 천장 에어컨
  for (const [x, z] of [[-4.6, -6.6], [4.6, -6.6]]) { box(0.3, 0.45, 0.28, mat(0x2b2b2b), x, 2.95, z); const sp = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), mat(0x555555)); sp.position.set(x, 2.93, z + 0.145); scene.add(sp); }   // 듣기 시험 스피커
  for (const [x, z] of [[0, -2], [0, 4]]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), mat(0xf5f5f5)); d.position.set(x, 3.47, z); scene.add(d); }

  /* ── 앞쪽: 칠판 · 시계 · 교탁 · 모니터 · 한글 표 · 정숙 팻말 ── */
  box(6.9, 1.62, 0.06, woodM, 0, 1.78, -7.46);
  const board = canvasTex(1024, 256, () => {});
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.5), new THREE.MeshBasicMaterial({ map: board.t }));
  boardMesh.position.set(0, 1.78, -7.425); scene.add(boardMesh);
  box(6.7, 0.07, 0.14, woodM, 0, 1.0, -7.4);
  for (const [x, c] of [[-2.6, 0xf5f5f0], [-2.3, 0xf2d86a], [-2.0, 0xe8a0a8]]) box(0.12, 0.03, 0.03, mat(c), x, 1.05, -7.38);
  const clock = canvasTex(256, 256, () => {});
  { const rim = new THREE.Mesh(new THREE.CircleGeometry(0.325, 40), mat(0x2b2b2b)); rim.position.set(3.85, 3.0, -7.43); scene.add(rim); }
  const clockMesh = new THREE.Mesh(new THREE.CircleGeometry(0.28, 40), new THREE.MeshBasicMaterial({ map: clock.t }));
  clockMesh.position.set(3.85, 3.0, -7.425); scene.add(clockMesh);
  /* 한글 자모 표(왼쪽 앞벽) */
  const poster = canvasTex(256, 360, (g, w, h) => {
    g.fillStyle = '#fff8e1'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d9a441'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#1c1915'; g.textAlign = 'center'; g.font = '800 26px "Pretendard Variable",sans-serif'; g.fillText('한글 자모', w / 2, 44);
    g.font = '700 28px "Pretendard Variable",sans-serif';
    const cons = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'], vow = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
    cons.forEach((c, i) => g.fillText(c, 40 + (i % 4) * 58, 100 + Math.floor(i / 4) * 40)); g.fillStyle = '#c0392b';
    vow.forEach((c, i) => g.fillText(c, 40 + (i % 4) * 58, 262 + Math.floor(i / 4) * 40));
  }).t;
  plane(0.78, 1.1, new THREE.MeshBasicMaterial({ map: poster }), -4.8, 1.9, -7.45);
  /* 「시험 중 · 정숙」 팻말(오른쪽 앞벽) */
  const sign = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#b3261e'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 44px "Pretendard Variable",sans-serif'; g.fillText('시험 중', w / 2, 62); g.font = '700 28px "Pretendard Variable",sans-serif'; g.fillText('정숙 · 휴대전화 끔', w / 2, 104); }).t;
  plane(0.9, 0.45, new THREE.MeshBasicMaterial({ map: sign }), 5.2, 2.2, -7.45);
  /* 교탁 + 노트북 + 서류 + 듣기 시험용 작은 스피커 */
  box(1.5, 0.9, 0.7, woodM, 2.6, 0.45, -6.4, true); box(1.56, 0.06, 0.76, mat(0x9a7448), 2.6, 0.93, -6.4);
  box(0.36, 0.015, 0.25, mat(0x888888), 2.35, 0.97, -6.45); { const sc = box(0.36, 0.23, 0.012, mat(0x222222), 2.35, 1.08, -6.57); sc.rotation.x = -0.2; }
  box(0.28, 0.03, 0.2, mat(0xffffff), 2.95, 0.97, -6.4); box(0.26, 0.02, 0.18, mat(0xf3efe0), 2.97, 1.0, -6.38);
  box(0.16, 0.14, 0.14, mat(0x222222), 3.2, 1.0, -6.55);
  /* 사물함(뒤쪽 벽) */
  const lockCols = [0xc9d3dd, 0xb8c4d0, 0xc9d3dd, 0xb8c4d0, 0xc9d3dd, 0xb8c4d0];
  lockCols.forEach((c, i) => { box(0.62, 1.5, 0.4, mat(c), -3.4 + i * 0.64, 0.75, 8.28); box(0.02, 0.1, 0.02, mat(0x444444), -3.4 + i * 0.64 + 0.2, 0.9, 8.07); });
  /* 오른쪽: 문(작은 창 · 팻말) + 소화기 + 쓰레기통 */
  box(0.06, 2.1, 1.0, mat(0x8a6a44), 5.96, 1.05, 5.8); { const win = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.5), new THREE.MeshBasicMaterial({ color: 0xcfe6f7 })); win.position.set(5.925, 1.5, 5.8); win.rotation.y = -Math.PI / 2; scene.add(win); }
  box(0.14, 0.4, 0.14, mat(0xcf2b2b), 5.9, 0.35, 4.6); box(0.05, 0.08, 0.05, mat(0x222222), 5.9, 0.6, 4.6);
  { const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.38, 14), mat(0x6c757d)); bin.position.set(5.5, 0.19, -6.9); scene.add(bin); }

  /* ── 창(왼쪽 벽): 바깥 풍경 · 커튼 · 틀 ── */
  /* 창밖 풍경 — 시험이 흐를수록 아침 → 한낮 → 노을로 바뀐다(p: 0~1). 햇빛 색 · 방향도 같이. */
  const lerpC = (a, b, k) => { const A = new THREE.Color(a), B = new THREE.Color(b); return '#' + A.lerp(B, k).getHexString(); };
  const SKY = [[0, '#8ec9f0', '#e6f4fb'], [0.45, '#5aaeee', '#dff0fa'], [0.8, '#f2b774', '#ffe3b8'], [1, '#e8805a', '#fbc99a']];
  const skyAt = (p) => { for (let i = 1; i < SKY.length; i++) if (p <= SKY[i][0]) { const k = (p - SKY[i - 1][0]) / (SKY[i][0] - SKY[i - 1][0]); return [lerpC(SKY[i - 1][1], SKY[i][1], k), lerpC(SKY[i - 1][2], SKY[i][2], k)]; } return [SKY[3][1], SKY[3][2]]; };
  /* ── 창밖: 진짜 3D 풍경(2층 높이에서 본 운동장 · 가로수 · 도로 · 건물 · 산). 몸을 움직이면 시차가 생겨 그림이 아니라 바깥으로 보인다. ── */
  const G = -3.2;   // 땅 높이(교실이 2층)
  const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const skyC = canvasTex(8, 256, () => {});
  const skyM = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 16), new THREE.MeshBasicMaterial({ map: skyC.t, side: THREE.BackSide, fog: false, depthWrite: false }));
  skyM.renderOrder = -2; scene.add(skyM);
  const groundM = new THREE.MeshLambertMaterial({ color: 0x79ad6f });
  { const gr = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), groundM); gr.rotation.x = -Math.PI / 2; gr.position.set(-300, G, 0); scene.add(gr); }
  const strip = (xc, w, col, y = 0.02) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, 900), mat(col)); o.rotation.x = -Math.PI / 2; o.position.set(xc, G + y, 0); scene.add(o); return o; };
  strip(-10, 3.2, 0xc79a72); strip(-18.6, 2.4, 0xbdb7aa); strip(-24, 8, 0x5f6368, 0.03); strip(-30.2, 2.4, 0xbdb7aa);
  { const dm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.02, 1.6), mat(0xf2f2ee), 160), mm = new THREE.Matrix4(); for (let i = 0; i < 160; i++) { mm.makeTranslation(-24, G + 0.06, -300 + i * 3.8); dm.setMatrixAt(i, mm); } scene.add(dm); }
  { const fm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 1.2, 0.06), mat(0x3f4a42), 240), mm = new THREE.Matrix4(); for (let i = 0; i < 240; i++) { mm.makeTranslation(-7.5, G + 0.6, -60 + i * 0.5); fm.setMatrixAt(i, mm); } scene.add(fm);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 120), mat(0x3f4a42)); rail.position.set(-7.5, G + 1.05, 0); scene.add(rail); }
  /* 가로수 · 나무 */
  const trunkG = new THREE.CylinderGeometry(0.22, 0.3, 3.2, 8), leafG = new THREE.IcosahedronGeometry(1.7, 1), leafMats = [0x4f8c55, 0x47804c, 0x58985c].map((c) => mat(c)), trunkM = mat(0x6b4c32), swayers = [];
  const addTree = (x, z, sc) => {
    const t = new THREE.Group(); t.position.set(x, G, z); t.scale.setScalar(sc);
    const tr = new THREE.Mesh(trunkG, trunkM); tr.position.y = 1.6; t.add(tr);
    const crown = new THREE.Group(); crown.position.y = 3.2; t.add(crown);
    [[0, 1.2, 0, 1], [-1.1, 0.4, 0.3, 0.8], [1.1, 0.5, -0.2, 0.85], [0.2, 0.3, 1, 0.75]].forEach(([dx, dy, dz, sc2], i) => { const l = new THREE.Mesh(leafG, leafMats[i % 3]); l.position.set(dx, dy, dz); l.scale.setScalar(sc2); crown.add(l); });
    scene.add(t); swayers.push({ crown, ph: rnd(x * 3 + z) * 6 });
  };
  for (let z = -60; z <= 60; z += 6.5) addTree(-20 + rnd(z) * 1.5, z + rnd(z + 3) * 2, 0.8 + rnd(z + 9) * 0.25);
  for (let z = -70; z <= 70; z += 9) addTree(-40 + rnd(z + 1) * 4, z + rnd(z + 5) * 3, 1.4 + rnd(z + 2) * 0.5);
  /* 건물(창에 불이 켜짐 — 해질 무렵) */
  const facade = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#c4ccd6'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.fillStyle = '#7d93ab'; g.fillRect(c * 64 + 12, r * 64 + 14, 40, 36); g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(c * 64 + 12, r * 64 + 14, 40, 8); }
  }), lit = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (rnd(r * 4 + c + 7) > 0.45) { g.fillStyle = '#ffd98a'; g.fillRect(c * 64 + 12, r * 64 + 14, 40, 36); }
  }), bMats = [];
  for (let z = -260, i = 0; z < 260; i++) {
    const bw = 16 + rnd(i + 11) * 18, bh = 22 + rnd(i + 21) * 55, bd = 18, x = -105 - rnd(i + 31) * 40;
    const tx = facade.t.clone(), tl = lit.t.clone(); tx.needsUpdate = tl.needsUpdate = true; tx.wrapS = tx.wrapT = tl.wrapS = tl.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(Math.round(bw / 4), Math.round(bh / 4)); tl.repeat.copy(tx.repeat);
    const bm = new THREE.MeshLambertMaterial({ map: tx, emissiveMap: tl, emissive: 0xffffff, emissiveIntensity: 0, color: new THREE.Color().setHSL(0.58 + rnd(i) * 0.05, 0.08, 0.75 + rnd(i + 5) * 0.15) }); bMats.push(bm);
    const b = new THREE.Mesh(new THREE.BoxGeometry(bd, bh, bw), bm); b.position.set(x, G + bh / 2, z + bw / 2); scene.add(b);
    z += bw + 3 + rnd(i + 41) * 6;
  }
  /* 먼 산 */
  const mtn = canvasTex(1024, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9db7c9'); gr.addColorStop(1, '#c9dbe6'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h - 30 - 60 * (0.5 + 0.5 * Math.sin(x * 0.011)) * (0.6 + 0.4 * Math.sin(x * 0.037 + 1)) - 12 * Math.sin(x * 0.09)); g.lineTo(w, h); g.fill(); });
  const mtnM = new THREE.MeshBasicMaterial({ map: mtn.t, transparent: true, fog: false }); { const m = new THREE.Mesh(new THREE.PlaneGeometry(900, 110), mtnM); m.position.set(-300, G + 50, 0); m.rotation.y = Math.PI / 2; scene.add(m); }
  /* 자동차(도로를 오간다) */
  const carG = new THREE.BoxGeometry(1.8, 0.7, 4.2), cabG = new THREE.BoxGeometry(1.5, 0.6, 2.2), whG = new THREE.CylinderGeometry(0.34, 0.34, 0.25, 12); whG.rotateZ(Math.PI / 2);
  const cars = [0xc0392b, 0x2c3e50, 0xefefef, 0xe0a800, 0x4a7fb5, 0x2e8b57].map((c, i) => {
    const g = new THREE.Group(), cm = mat(c), body = new THREE.Mesh(carG, cm); body.position.y = 0.75; g.add(body);
    const cab = new THREE.Mesh(cabG, mat(0x9fc5dc)); cab.position.set(0, 1.35, -0.2); g.add(cab);
    for (const [wx, wz] of [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]]) { const w = new THREE.Mesh(whG, mat(0x222222)); w.position.set(wx, 0.34, wz); g.add(w); }
    const dir = i % 2 ? -1 : 1; g.position.set(dir > 0 ? -22.2 : -25.8, G + 0.04, -100 + rnd(i + 70) * 200); g.rotation.y = dir > 0 ? Math.PI : 0;
    scene.add(g); return { g, v: dir * (7 + rnd(i + 90) * 6) };
  });
  /* 구름 · 해 · 새 */
  const cloudTex = canvasTex(256, 128, (g) => { g.fillStyle = 'rgba(255,255,255,.95)'; for (const [x, y, r] of [[70, 76, 34], [110, 60, 40], [155, 70, 36], [195, 80, 26], [40, 84, 22]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }).t;
  const cloudS = Array.from({ length: 9 }, (_, i) => { const m = new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, opacity: 0.9 }), sp = new THREE.Sprite(m); sp.scale.set(90 + rnd(i) * 60, 45 + rnd(i + 3) * 25, 1); sp.position.set(-250 - rnd(i + 5) * 60, 40 + rnd(i + 9) * 70, -260 + rnd(i + 13) * 520); scene.add(sp); return { sp, v: 1.2 + rnd(i + 17) * 1.8 }; });
  const sunTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(255,250,215,1)'); r.addColorStop(0.18, 'rgba(255,240,180,.9)'); r.addColorStop(0.3, 'rgba(255,230,160,.25)'); r.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }).t;
  const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, fog: false, transparent: true, depthWrite: false })); sunS.scale.set(120, 120, 1); scene.add(sunS);
  const birdG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.2, 0, 0), new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(1.2, 0, 0)]);
  const birds = Array.from({ length: 6 }, (_, i) => { const l = new THREE.Line(birdG, new THREE.LineBasicMaterial({ color: 0x2d2d33 })); l.position.set(-60 - rnd(i + 120) * 40, 6 + rnd(i + 130) * 14, -60 + rnd(i + 140) * 120); scene.add(l); return { l, v: 4 + rnd(i + 150) * 3, ph: rnd(i + 160) * 6 }; });
  function applySky(p) {
    const [top, bot] = skyAt(p), dusk = Math.max(0, (p - 0.75) / 0.25), g = skyC.g;
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, top); gr.addColorStop(0.5, bot); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); skyC.t.needsUpdate = true;
    scene.fog.color.set(bot); groundM.color.set(lerpC('#79ad6f', '#587a54', p * 0.7));
    bMats.forEach((m) => { m.emissiveIntensity = dusk * 0.9; }); mtnM.color.set(lerpC('#ffffff', '#e8b8a8', dusk));
    sunS.position.set(-260, 25 + Math.sin(Math.PI * Math.min(1, 0.12 + p * 0.78)) * 70, 90 - p * 180); sunS.material.color.set(lerpC('#ffffff', '#ffb878', dusk));
  }
  function outsideTick(t, dt) {
    for (const s of swayers) s.crown.rotation.z = Math.sin(t * 1.1 + s.ph) * 0.03, s.crown.rotation.x = Math.cos(t * 0.9 + s.ph) * 0.02;
    for (const c of cars) { c.g.position.z += c.v * dt; if (c.g.position.z > 110) c.g.position.z = -110; if (c.g.position.z < -110) c.g.position.z = 110; }
    for (const c of cloudS) { c.sp.position.z += c.v * dt; if (c.sp.position.z > 300) c.sp.position.z = -300; }
    for (const b of birds) { b.l.position.z += b.v * dt; if (b.l.position.z > 70) b.l.position.z = -70; b.l.scale.y = 0.6 + Math.sin(t * 9 + b.ph) * 0.9; }
  }
  applySky(0);
  const curM = mat(0xd9e3d4);
  for (const z of [-4.6, -1.6, 1.4, 4.4]) {
    const fr = mat(0xffffff);
    box(0.05, 1.7, 0.06, fr, -5.97, 2.0, z); box(0.05, 0.06, 2.4, fr, -5.97, 1.18, z); box(0.05, 0.06, 2.4, fr, -5.97, 2.82, z); box(0.05, 1.7, 0.05, fr, -5.97, 2.0, z - 1.17); box(0.05, 1.7, 0.05, fr, -5.97, 2.0, z + 1.17);
    box(0.06, 1.9, 0.34, curM, -5.9, 2.0, z - 1.0); box(0.06, 1.9, 0.34, curM, -5.9, 2.0, z + 1.0);   // 커튼
  }
  /* 오른쪽 벽 게시판 */
  box(0.04, 1.2, 4.2, mat(0xc89a5a), 5.97, 1.9, -2.2);
  [0xfff2a8, 0xbfe3c8, 0xf7c4c4, 0xc9d9f2, 0xfff2a8, 0xf3d9ff].forEach((c, i) => box(0.02, 0.5, 0.55, mat(c), 5.94, 1.85 + ((i % 2) ? 0.22 : -0.12), -3.9 + i * 0.68));

  /* ── 책상 · 의자 · 시험지(자리마다) ── */
  const rows = [-1.2, 0.7, 2.6, 4.5, 6.3], cols = [-3.9, -2.0, 0, 2.0, 3.9];
  const desks = []; for (const z of rows) for (const x of cols) desks.push([x, z]);
  /* 학교 책상 · 의자(철제 틀 + 합판) — 의자는 등받이가 약간 젖혀지고 다리 사이에 가로대가 있다 */
  const N = desks.length, steel = mat(0x6b7077), wood = mat(0xb98a52), lam = mat(0xdcc7a0);
  const inst = (g, m, n) => new THREE.InstancedMesh(g, m, n);
  const topsI = inst(new THREE.BoxGeometry(0.72, 0.035, 0.5), lam, N), topEdge = inst(new THREE.BoxGeometry(0.73, 0.012, 0.51), mat(0x9a8260), N);
  const dLegs = inst(new THREE.CylinderGeometry(0.014, 0.014, 0.72, 8), steel, N * 4), dRail = inst(new THREE.BoxGeometry(0.025, 0.025, 0.44), steel, N * 2), dBar = inst(new THREE.BoxGeometry(0.6, 0.02, 0.02), steel, N * 2);
  const trayB = inst(new THREE.BoxGeometry(0.6, 0.014, 0.38), mat(0x8a8f96), N), trayBack = inst(new THREE.BoxGeometry(0.6, 0.09, 0.014), mat(0x8a8f96), N), traySide = inst(new THREE.BoxGeometry(0.014, 0.09, 0.38), mat(0x8a8f96), N * 2);
  const seatsI = inst(new THREE.BoxGeometry(0.42, 0.03, 0.4), wood, N), backsI = inst(new THREE.BoxGeometry(0.4, 0.17, 0.022), wood, N);
  const postG = new THREE.BoxGeometry(0.022, 0.36, 0.022), posts = inst(postG, steel, N * 2);
  const cLegs = inst(new THREE.CylinderGeometry(0.013, 0.013, 0.45, 8), steel, N * 4), cRail = inst(new THREE.BoxGeometry(0.02, 0.02, 0.34), steel, N * 2), cBar = inst(new THREE.BoxGeometry(0.36, 0.02, 0.02), steel, N);
  const tops = topsI, seats = seatsI, backs = backsI;   // 눌러서 앉기(raycast) 대상
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3();
  const tilt = (a) => q.setFromEuler(new THREE.Euler(a, 0, 0));
  const put = (mesh, k, x, y, z, ang = 0) => { mesh.setMatrixAt(k, m4.compose(pos.set(x, y, z), tilt(ang), sc)); };
  desks.forEach(([x, z], i) => {
    put(topsI, i, x, 0.74, z); put(topEdge, i, x, 0.7225, z);
    [[-0.3, -0.19], [0.3, -0.19], [-0.3, 0.19], [0.3, 0.19]].forEach(([dx, dz], k) => put(dLegs, i * 4 + k, x + dx, 0.36, z + dz));
    [-0.3, 0.3].forEach((dx, k) => put(dRail, i * 2 + k, x + dx, 0.7, z)); [-0.19, 0.19].forEach((dz, k) => put(dBar, i * 2 + k, x, 0.25, z + dz));
    put(trayB, i, x, 0.62, z); put(trayBack, i, x, 0.665, z + 0.19); put(traySide, i * 2, x - 0.3, 0.665, z); put(traySide, i * 2 + 1, x + 0.3, 0.665, z);
    const cz = z + 0.55;
    put(seatsI, i, x, 0.45, cz, 0.04); put(backsI, i, x, 0.7, cz + 0.2, 0.14);
    [-0.17, 0.17].forEach((dx, k) => put(posts, i * 2 + k, x + dx, 0.62, cz + 0.2, 0.14));
    [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]].forEach(([dx, dz], k) => put(cLegs, i * 4 + k, x + dx, 0.225, cz + dz));
    [-0.18, 0.18].forEach((dx, k) => put(cRail, i * 2 + k, x + dx, 0.2, cz)); put(cBar, i, x, 0.2, cz - 0.17);
  });
  [topsI, topEdge, dLegs, dRail, dBar, trayB, trayBack, traySide, seatsI, backsI, posts, cLegs, cRail, cBar].forEach((o) => { o.instanceMatrix.needsUpdate = true; if (fine) { o.castShadow = true; o.receiveShadow = true; } scene.add(o); });
  /* 시험지(OMR 답안지 느낌) — 자리마다 한 장 + 연필 */
  const paper = canvasTex(256, 360, (g, w, h) => {
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1c1915'; g.font = 'bold 20px sans-serif'; g.fillText('TOPIK 연습', 18, 34);
    g.font = '13px sans-serif'; g.fillStyle = '#5c564c'; g.fillText('수험번호 ______  이름 ______', 18, 58);
    g.strokeStyle = '#b9b09c'; g.lineWidth = 1;
    for (let y = 90; y < 340; y += 24) { g.beginPath(); g.moveTo(18, y); g.lineTo(w - 18, y); g.stroke(); }
    g.fillStyle = '#1c1915'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(30, 100 + i * 40, 5, 0, 7); g.stroke(); g.fillRect(48, 96 + i * 40, 150 - (i % 3) * 20, 3); }
  }).t;
  const sheetG = new THREE.PlaneGeometry(0.3, 0.42); sheetG.rotateX(-Math.PI / 2);
  const sheets = new THREE.InstancedMesh(sheetG, new THREE.MeshLambertMaterial({ map: paper }), desks.length);
  const pencilG = new THREE.CylinderGeometry(0.006, 0.006, 0.17, 8); pencilG.rotateZ(Math.PI / 2);
  const pencils = new THREE.InstancedMesh(pencilG, mat(0xf2c744), desks.length);
  desks.forEach(([x, z], i) => { sheets.setMatrixAt(i, m4.makeTranslation(x - 0.04 + ((i * 7) % 5) * 0.01, 0.763, z - 0.02)); pencils.setMatrixAt(i, m4.makeTranslation(x + 0.24, 0.766, z + 0.06)); });
  scene.add(sheets, pencils);
  /* 가방(몇몇 책상 옆 바닥) */
  desks.forEach(([x, z], i) => { if ((i * 5) % 4 === 0) box(0.3, 0.34, 0.16, mat([0x5b6c8f, 0x8f5b5b, 0x4e7a63, 0x444444][i % 4]), x + 0.5, 0.17, z + 0.62, true); });

  /* ── 사람 만들기: 머리 · 눈 · 머리카락 · 목 · 몸통 · 팔 · 다리 · 신발 ── */
  const matCache = new Map(), M = (c) => { if (!matCache.has(c)) matCache.set(c, mat(c)); return matCache.get(c); };
  const UP = new THREE.Vector3(0, 1, 0);
  function limb(parent, p1, p2, r, m) {
    const a = new THREE.Vector3(...p1), b = new THREE.Vector3(...p2), len = a.distanceTo(b);
    const o = cast(new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.88, len, 8), m));
    o.position.copy(a).add(b).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize()); parent.add(o); return o;
  }
  const ball = (parent, r, m, x, y, z, sy = 1) => { const o = cast(new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), m)); o.position.set(x, y, z); o.scale.y = sy; parent.add(o); return o; };
  /* o: {skin, cloth, pants, hair, style('short'|'long'|'bun'), seated}. 얼굴은 -z 쪽(칠판 쪽)을 본다. */
  function makePerson(o) {
    const g = new THREE.Group(), sit = !!o.seated, sk = M(o.skin), cl = M(o.cloth), pn = M(o.pants), hr = M(o.hair), shoe = M(0x2a2523);
    const hipY = sit ? 0.53 : 0.86, shY = sit ? 0.93 : 1.36, out = { g, sit, lp: [], ap: [] };
    const torso = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.14, shY - hipY + 0.06 - 0.28, 4, 10), cl));
    torso.scale.set(1.12, 1, 0.72); torso.position.y = (hipY + shY) / 2; torso.rotation.x = sit ? -0.12 : 0; g.add(torso);
    const pelvis = cast(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), pn)); pelvis.position.y = hipY; g.add(pelvis);
    const neck = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.048, 0.09, 8), sk)); neck.position.set(0, shY + 0.03, sit ? -0.02 : 0); g.add(neck);
    /* 머리 */
    const head = new THREE.Group(); head.position.set(0, shY + 0.17, sit ? -0.04 : 0); g.add(head); out.head = head;
    ball(head, 0.108, sk, 0, 0, 0, 1.1);
    for (const sx of [-1, 1]) {
      ball(head, 0.014, M(0x1c1815), sx * 0.037, 0.008, -0.098);   // 눈
      ball(head, 0.02, sk, sx * 0.107, -0.005, 0.004);              // 귀
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.007, 0.006), hr); br.position.set(sx * 0.037, 0.042, -0.099); head.add(br);   // 눈썹
    }
    ball(head, 0.014, sk, 0, -0.018, -0.108);                       // 코
    { const mo = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.007, 0.006), M(0xb5524a)); mo.position.set(0, -0.056, -0.102); head.add(mo); }   // 입
    { const cap = new THREE.Mesh(new THREE.SphereGeometry(0.117, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.43), hr); cap.position.set(0, 0.014, 0.012); cap.scale.y = 1.08; head.add(cap);
      const bk = new THREE.Mesh(new THREE.SphereGeometry(0.117, 14, 10, 0, Math.PI, 0, Math.PI * 0.72), hr); bk.position.set(0, 0.006, 0.012); bk.rotation.y = 0; bk.scale.y = 1.08; head.add(bk); }
    if (o.style === 'long') { const lh = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 4, 8), hr)); lh.position.set(0, -0.14, 0.075); lh.scale.z = 0.55; head.add(lh); }
    if (o.style === 'bun') ball(head, 0.05, hr, 0, 0.115, 0.07);
    /* 다리 · 팔 */
    for (const sx of [-1, 1]) {
      if (sit) {
        limb(g, [sx * 0.09, 0.53, 0], [sx * 0.09, 0.53, -0.4], 0.062, pn); limb(g, [sx * 0.09, 0.53, -0.4], [sx * 0.09, 0.07, -0.43], 0.05, pn);
        const sh = cast(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 0.17), shoe)); sh.position.set(sx * 0.09, 0.03, -0.49); g.add(sh);
        const hand = sx > 0 ? [0.09, 0.79, -0.5] : [-0.12, 0.78, -0.44];
        limb(g, [sx * 0.2, 0.9, -0.05], [sx * 0.25, 0.72, -0.2], 0.045, cl); limb(g, [sx * 0.25, 0.72, -0.2], hand, 0.036, sk); ball(g, 0.033, sk, ...hand);
      } else {
        const lg = new THREE.Group(); lg.position.set(sx * 0.09, hipY, 0); g.add(lg); out.lp.push(lg);
        limb(lg, [0, 0, 0], [0, -0.78, 0], 0.058, pn); const sh = cast(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 0.17), shoe)); sh.position.set(0, -0.83, -0.03); lg.add(sh);
        const ag = new THREE.Group(); ag.position.set(sx * 0.2, shY - 0.04, 0); g.add(ag); out.ap.push(ag);
        limb(ag, [0, 0, 0], [0, -0.27, 0], 0.045, cl); limb(ag, [0, -0.27, 0], [0, -0.55, 0], 0.036, sk); ball(ag, 0.033, sk, 0, -0.57, 0);
      }
    }
    return out;
  }
  const skin = [0xf0c9a5, 0xe6b894, 0xd9a47c, 0xc58c63, 0xf5d3b8], cloth = [0x2f3d57, 0x6b4a63, 0x3d5b4b, 0x7a6a3a, 0x4a4a52, 0x8a4b3b, 0xb6b0a2, 0x5a7aa0], pants = [0x2a2f3a, 0x3b3a3a, 0x4a5568, 0x5a4a3a];
  const hairC = [0x1f1a17, 0x2a2320, 0x4a3426, 0x151515, 0x6b5a3e], styles = ['short', 'long', 'short', 'bun', 'long'];
  const looks = (i) => ({ skin: skin[i % skin.length], cloth: cloth[(i * 3) % cloth.length], pants: pants[i % pants.length], hair: hairC[(i * 2) % hairC.length], style: styles[(i * 7) % styles.length] });
  const occupied = new Set(), heads = [], fakeBySeat = new Map(), remoteSeats = new Map();
  desks.forEach(([x, z], i) => {
    if (z === 2.6 && x === 0) return;   // 처음 내 자리는 비워 둔다
    if ((i * 7) % 5 === 0) return;      // 빈자리도 섞는다
    occupied.add(i);
    const p = makePerson({ ...looks(i), seated: true }); p.g.position.set(x, 0, z + 0.55); scene.add(p.g);
    fakeBySeat.set(i, p.g); heads.push({ head: p.head, baseY: p.head.position.y, phase: (i * 0.9) % 6 });
  });
  const proctor = makePerson({ skin: 0xe6b894, cloth: 0x2c3340, pants: 0x22262e, hair: 0x1f1b18, style: 'short', seated: false });
  { const tag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.01), mat(0xf4efe0)); tag.position.set(0.08, 1.2, -0.11); proctor.g.add(tag); }
  proctor.g.position.set(-1, 0, -5.6); scene.add(proctor.g);
  let pDir = 1;
  const swing = (p, ph, amp) => { if (p.lp.length) { p.lp[0].rotation.x = Math.sin(ph) * amp; p.lp[1].rotation.x = -Math.sin(ph) * amp; p.ap[0].rotation.x = -Math.sin(ph) * amp * 0.8; p.ap[1].rotation.x = Math.sin(ph) * amp * 0.8; } };

  /* ── 움직임: 내 자리 · 걷기 · 충돌 ── */
  const mySeat = desks.findIndex(([x, z]) => x === 0 && z === 2.6);
  const me = { x: 0, z: 3.22, eye: 1.16, seated: true, seat: mySeat, yaw: 0, pitch: -0.04 };
  const goal = { x: me.x, z: me.z, eye: me.eye, t: 1 };   // 자리 옮길 때 부드럽게
  const seatPos = (i) => ({ x: desks[i][0], z: desks[i][1] + 0.62 });
  const rects = desks.map(([x, z]) => [x - 0.4, x + 0.4, z - 0.28, z + 0.82]);
  rects.push([1.8, 3.4, -6.8, -6.0]);   // 교탁
  const keys = {};
  const R = 0.26, LIM = { x0: -5.5, x1: 5.5, z0: -6.1, z1: 8.0 };
  function collide(nx, nz) {
    nx = Math.max(LIM.x0, Math.min(LIM.x1, nx)); nz = Math.max(LIM.z0, Math.min(LIM.z1, nz));
    for (const [x0, x1, z0, z1] of rects) {
      if (nx > x0 - R && nx < x1 + R && nz > z0 - R && nz < z1 + R) {
        const dl = nx - (x0 - R), dr = (x1 + R) - nx, df = nz - (z0 - R), db = (z1 + R) - nz, m = Math.min(dl, dr, df, db);
        if (m === dl) nx = x0 - R; else if (m === dr) nx = x1 + R; else if (m === df) nz = z0 - R; else nz = z1 + R;
      }
    }
    return [nx, nz];
  }
  function sitAt(i) {
    const p = seatPos(i);
    Object.assign(goal, { x: p.x, z: p.z, eye: 1.16, t: 0 }); me.seated = true; me.seat = i; me.yaw = 0; me.pitch = -0.04; vYaw = vPitch = 0;
    updateSeatBtn();
  }
  function standUp() {
    if (!me.seated) return;
    const [x, z] = collide(me.x + (me.x > 3 ? -0.75 : 0.75), me.z - 0.1);
    Object.assign(goal, { x, z, eye: 1.62, t: 0 }); me.seated = false; updateSeatBtn();
  }
  const freeSeatNear = () => {
    let best = -1, bd = 1.25;
    desks.forEach(([x, z], i) => { if (occupied.has(i)) return; const p = seatPos(i), d = Math.hypot(p.x - me.x, p.z - me.z); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  function updateSeatBtn() {
    const b = $('bSeat'); if (!b) return;
    const near = !me.seated ? freeSeatNear() : -1;
    b.textContent = me.seated ? '일어나기 · Stand up' : (near >= 0 ? '여기 앉기 · Sit here' : '자리 찾기 · Find a seat');
    b.dataset.near = String(near);
  }
  $('bSeat').addEventListener('click', () => {
    if (me.seated) { standUp(); return; }
    const near = freeSeatNear();
    if (near >= 0) sitAt(near); else say('빈 자리 가까이에서 눌러 주세요. 또는 의자를 눌러도 돼요.', null);
  });
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, select, textarea')) return;
    const k = e.key.toLowerCase();
    if ('wasd'.includes(k) && k.length === 1 || k.startsWith('arrow')) { keys[k] = true; if (me.seated && ex.began && $('panel').hidden) standUp(); else if (me.seated && $('panel').hidden) standUp(); }
    if (k === 'e') $('bSeat').click();
  });
  addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  /* 화면 속 방향 단추(폰) — 누르고 있는 동안 이동 */
  document.querySelectorAll('#pad button').forEach((b) => {
    const k = b.dataset.k, on = (e) => { e.preventDefault(); keys[k] = true; if (me.seated) standUp(); }, off = () => { keys[k] = false; };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
  });
  /* 시험지 풀기: 사이트의 실제 모의고사를 큰 화면(iframe)으로 연다 — 칠판 시간은 계속 간다 */
  function openPaper() {
    const ii = /II/.test(ex.name) ? 'II' : 'I', reading = /읽기/.test(ex.name) || !ex.began;
    $('paperF').src = reading ? `/#learn/topik/mock/${ii}/1` : '/#learn/topik';
    $('paperT').textContent = reading ? `TOPIK ${ii} 모의고사 1회` : 'TOPIK 연습';
    $('paperV').hidden = false;
  }
  $('bPaper').addEventListener('click', openPaper);
  $('paperClose').addEventListener('click', () => { $('paperV').hidden = true; });
  $('paperV').addEventListener('click', (e) => { if (e.target === $('paperV')) $('paperV').hidden = true; });   // 바깥(교실)을 누르면 접기
  setInterval(() => { if (!$('paperV').hidden) $('paperTime').textContent = ex.began ? fmt(ex.left) : ''; }, 500);
  const mq = matchMedia('(pointer:coarse)'); const padShow = () => { $('pad').hidden = !(mq.matches && !$('bar').hidden); }; setInterval(padShow, 600);

  /* ── 다른 수험생(로그인한 사람만, 이름 없이) — Supabase 실시간(presence). 새 표 · SQL 은 필요 없다. ── */
  const remotes = new Map(), SB_URL = 'https://tjgoevtvobvmlyefgxel.supabase.co';
  const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc';
  let chan = null, myKey = '', lastSent = '', lastSendAt = 0, firstSync = true;
  const cur = () => ({ s: me.seated ? me.seat : -1, x: +me.x.toFixed(2), z: +me.z.toFixed(2), y: +me.yaw.toFixed(2) });
  const setOnline = (txt) => { const e = $('online'); if (e) { e.textContent = txt; e.hidden = !txt; } };
  function dropRemote(key) {
    const r = remotes.get(key); if (!r) return;
    scene.remove(r.p.g); remotes.delete(key);
    if (r.seat >= 0) { remoteSeats.delete(r.seat); if (fakeBySeat.has(r.seat)) fakeBySeat.get(r.seat).visible = true; else occupied.delete(r.seat); }
  }
  function onSync() {
    const st = chan.presenceState(), keys = Object.keys(st);
    setOnline(`지금 ${keys.length}명 접속 중 · ${keys.length} online`);
    for (const key of [...remotes.keys()]) if (!st[key]) dropRemote(key);
    keys.forEach((key, n) => {
      if (key === myKey) return;
      const m = st[key][st[key].length - 1]; if (!m) return;
      let r = remotes.get(key);
      if (r && (r.seat >= 0) !== (m.s >= 0)) { dropRemote(key); r = null; }   // 앉았다 일어났다 — 모습을 바꿔 만든다
      if (!r) {
        const look = looks(100 + n * 7 + key.charCodeAt(0));
        const p = makePerson({ ...look, seated: m.s >= 0 }); scene.add(p.g);
        r = { p, seat: -1, x: m.x, z: m.z, yaw: m.y, tx: m.x, tz: m.z, ty: m.y, ph: 0 }; remotes.set(key, r);
        if (m.s >= 0) { r.seat = m.s; remoteSeats.set(m.s, key); occupied.add(m.s); if (fakeBySeat.has(m.s)) fakeBySeat.get(m.s).visible = false; const sp = seatPos(m.s); p.g.position.set(sp.x, 0, sp.z - 0.07); heads.push({ head: p.head, baseY: p.head.position.y, phase: n, remoteKey: key }); }
        else p.g.position.set(m.x, 0, m.z);
      }
      if (m.s < 0) { r.tx = m.x; r.tz = m.z; r.ty = m.y; }
      else if (m.s !== r.seat) { dropRemote(key); onSync(); }
    });
    for (let i = heads.length - 1; i >= 0; i--) if (heads[i].remoteKey && !remotes.has(heads[i].remoteKey)) heads.splice(i, 1);
    if (firstSync) {   // 처음 들어왔을 때 내 자리를 누가 쓰고 있으면 빈 자리로 옮긴다
      firstSync = false;
      if (me.seated && occupied.has(me.seat)) { const free = desks.map((_, i) => i).filter((i) => !occupied.has(i)); if (free.length) { const i = free[Math.floor(Math.random() * free.length)], p = seatPos(i); me.seat = i; me.x = goal.x = p.x; me.z = goal.z = p.z; } }
    }
    updateSeatBtn();
  }
  async function joinPresence() {
    let ok = false;
    try { const raw = localStorage.getItem('sb-tjgoevtvobvmlyefgxel-auth-token'), j = raw && JSON.parse(raw); ok = !!(j && (j.access_token || (j.currentSession && j.currentSession.access_token))); } catch (e) {}
    if (!ok) { setOnline('로그인하면 다른 수험생과 함께 앉을 수 있어요 · Sign in to see others'); return; }
    try {
      const { createClient } = await import('./vendor/supabase-js.js?v=61473d59');
      // 이 화면은 보기만 한다 — 로그인 세션은 건드리지 않는다(갱신 토큰 충돌 방지).
      const sb = createClient(SB_URL, SB_ANON, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
      myKey = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)).slice(0, 12);
      chan = sb.channel('exam-room-1', { config: { presence: { key: myKey } } });
      chan.on('presence', { event: 'sync' }, onSync).subscribe((status) => { if (status === 'SUBSCRIBED') chan.track(cur()); });
    } catch (e) { chan = null; setOnline(''); }
  }
  function presenceTick(now, dt, t) {
    if (chan && now - lastSendAt > 300) {
      lastSendAt = now; const c = cur(), j = JSON.stringify(c);
      if (j !== lastSent) { lastSent = j; try { chan.track(c); } catch (e) {} }
    }
    for (const r of remotes.values()) {
      if (r.seat >= 0) continue;
      const dx = r.tx - r.x, dz = r.tz - r.z, d = Math.hypot(dx, dz), k = Math.min(1, dt * 5);
      r.x += dx * k; r.z += dz * k; let dy = r.ty - r.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); r.yaw += dy * k;
      r.p.g.position.set(r.x, 0, r.z); r.p.g.rotation.y = r.yaw;
      if (d > 0.03) { r.ph += dt * 7; swing(r.p, r.ph, 0.45); } else swing(r.p, 0, 0);
    }
  }
  /* ── 칠판 · 시계 그리기 ── */
  function drawBoard() {
    const { g } = board, w = 1024, h = 256;
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#2f4d3f'); grd.addColorStop(1, '#294236');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.04)'; for (let i = 0; i < 30; i++) g.fillRect((i * 173) % w, (i * 61) % h, 140, 7);
    g.textAlign = 'center'; g.fillStyle = '#f3f1e6';
    if (!ex.began) {
      g.font = '700 54px "Pretendard Variable",sans-serif'; g.fillText('TOPIK 시험장', w / 2, 104);
      g.font = '600 30px "Pretendard Variable",sans-serif'; g.fillStyle = '#d9d6c4'; g.fillText('시험을 고르고 시작을 눌러요', w / 2, 160);
    } else {
      g.font = '600 32px "Pretendard Variable",sans-serif'; g.fillStyle = '#d9d6c4'; g.fillText(`${ex.name}  ·  ${ex.over ? '시험 종료' : '남은 시간'}`, w / 2, 52);
      g.font = '800 132px "Pretendard Variable",sans-serif'; g.fillStyle = ex.left <= 300 && !ex.over ? '#f6b8a8' : '#fbfaf2';
      g.fillText(fmt(ex.left), w / 2, 178);
      g.fillStyle = 'rgba(243,241,230,.28)'; g.fillRect(96, 214, w - 192, 10);
      g.fillStyle = '#f3f1e6'; g.fillRect(96, 214, (w - 192) * Math.min(1, Math.max(0, 1 - ex.left / Math.max(1, ex.total))), 10);
      g.font = '600 22px "Pretendard Variable",sans-serif'; g.fillStyle = 'rgba(243,241,230,.6)'; g.textAlign = 'left'; g.fillText('휴대전화 전원 끔 · 정숙', 30, 36); g.textAlign = 'right'; g.fillText(`종료 ${new Date(ex.endAt || Date.now()).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`, w - 30, 36);
    }
    board.t.needsUpdate = true;
  }
  function drawClock() {
    const { g } = clock, s = 256, c = s / 2, now = new Date();
    g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, s, s);
    g.strokeStyle = '#222'; g.lineWidth = 6; g.beginPath(); g.arc(c, c, c - 6, 0, 7); g.stroke();
    g.fillStyle = '#222'; g.font = 'bold 28px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; g.fillText(String(i), c + Math.cos(a) * 92, c + Math.sin(a) * 92); }
    const hand = (ang, len, wd, col) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.sin(ang) * len, c - Math.cos(ang) * len); g.stroke(); };
    const sec = now.getSeconds(), min = now.getMinutes() + sec / 60, hr = (now.getHours() % 12) + min / 60;
    hand((hr / 12) * Math.PI * 2, 58, 9, '#222'); hand((min / 60) * Math.PI * 2, 84, 6, '#222'); hand((sec / 60) * Math.PI * 2, 96, 2.5, '#c0392b');
    g.fillStyle = '#222'; g.beginPath(); g.arc(c, c, 6, 0, 7); g.fill();
    clock.t.needsUpdate = true;
  }

  /* ── 둘러보기(끌기) · 의자 누르기 · 휠 ── */
  let vYaw = 0, vPitch = 0, drag = null, moved = 0;
  const cv = $('scene'), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; moved = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); vYaw += dx * 0.00035; vPitch += dy * 0.00025; drag = { x: e.clientX, y: e.clientY }; });
  cv.addEventListener('pointerup', (e) => {
    if (drag && moved < 7 && $('panel').hidden) {   // 끌지 않고 눌렀다 — 의자 · 책상을 눌렀으면 그 자리로
      const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects([sheets, seats, backs, tops], false)[0];
      if (hit && hit.instanceId != null) {
        if (hit.instanceId === me.seat && me.seated) { if (hit.object === sheets || hit.object === tops) openPaper(); }
        else if (!occupied.has(hit.instanceId)) sitAt(hit.instanceId);
      }
    }
    drag = null;
  });
  cv.addEventListener('pointercancel', () => { drag = null; });
  cv.addEventListener('wheel', (e) => { e.preventDefault(); camera.fov = Math.min(82, Math.max(44, camera.fov + e.deltaY * 0.03)); camera.updateProjectionMatrix(); }, { passive: false });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 78 : 66; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  /* ── 배경 소리: 교실 공기(낮은 소음) · 연필 · 종이 넘기는 소리(시험 중에만) ── */
  let noiseBuf = null, scratchAt = 0;
  function noise() {
    if (!ac) return null;
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = noiseBuf.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { b = 0.97 * b + 0.03 * (Math.random() * 2 - 1); d[i] = b * 6; } }
    return noiseBuf;
  }
  let hum = null;
  function ambience(on) {
    if (!ac || !noise()) return;
    if (on && !hum) { const src = ac.createBufferSource(); src.buffer = noise(); src.loop = true; const g = ac.createGain(); g.gain.value = 0.05; src.connect(g).connect(ac.destination); src.start(); hum = { src, g }; }
    if (hum) hum.g.gain.setTargetAtTime(on ? 0.05 : 0, ac.currentTime, 0.4);
  }
  function scratch(kind) {   // 연필 사각거림 / 종이 소리
    if (!ac || !noise()) return;
    const src = ac.createBufferSource(); src.buffer = noise(); const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = kind === 'page' ? 1800 : 3600; f.Q.value = 0.9;
    const g = ac.createGain(); const t = ac.currentTime, dur = kind === 'page' ? 0.5 : 0.22 + Math.random() * 0.25;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'page' ? 0.05 : 0.035, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(ac.destination); src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }

  /* ── 한 프레임 ── */
  let t0 = performance.now(), last = t0, skyP = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    /* 걷기 */
    if (!me.seated && goal.t >= 1) {
      const f = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0), sd = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
      if (f || sd) {
        const sp = 1.7 * dt, cy = Math.cos(me.yaw), sy = Math.sin(me.yaw);
        const dx = (-sy * f + cy * sd) * sp, dz = (-cy * f - sy * sd) * sp;
        const [nx, nz] = collide(me.x + dx, me.z + dz); me.x = nx; me.z = nz; goal.x = nx; goal.z = nz; updateSeatBtn();
      }
    }
    /* 자리 옮기는 중(부드럽게) */
    if (goal.t < 1) {
      goal.t = Math.min(1, goal.t + dt / 0.9); const e = goal.t * goal.t * (3 - 2 * goal.t);
      me.x += (goal.x - me.x) * (0.08 + 0.2 * e); me.z += (goal.z - me.z) * (0.08 + 0.2 * e); me.eye += (goal.eye - me.eye) * (0.08 + 0.2 * e);
      if (goal.t >= 1) { me.x = goal.x; me.z = goal.z; me.eye = goal.eye; }
    }
    me.yaw = Math.max(me.seated ? -1.1 : -Math.PI * 4, Math.min(me.seated ? 1.1 : Math.PI * 4, me.yaw + vYaw)); me.pitch = Math.max(-0.5, Math.min(0.5, me.pitch + vPitch));
    vYaw *= 0.82; vPitch *= 0.82;
    camera.position.set(me.x, me.eye + (me.seated ? 0 : Math.sin(t * 6) * 0.0 ), me.z);
    camera.rotation.set(0, 0, 0); camera.rotateY(me.yaw + Math.sin(t * 0.18) * 0.005); camera.rotateX(me.pitch + Math.sin(t * 0.23) * 0.004);
    /* 감독관 천천히 오가기 · 수험생 고개 끄덕임 */
    proctor.g.position.z += pDir * 0.32 * dt; if (proctor.g.position.z > 7.2) pDir = -1; if (proctor.g.position.z < -5.6) pDir = 1;
    proctor.g.rotation.y = pDir > 0 ? Math.PI : 0; swing(proctor, t * 3.2, 0.42); proctor.g.position.y = Math.abs(Math.sin(t * 3.2)) * 0.012;
    for (const h of heads) { h.head.position.y = h.baseY - (Math.sin(t * 0.6 + h.phase) > 0.85 ? 0.025 : 0); h.head.rotation.x = -0.3 + Math.sin(t * 0.5 + h.phase) * 0.1; }
    presenceTick(now, dt, t);
    outsideTick(t, dt);   // 창밖은 계속 움직인다
    const prog = ex.began ? Math.min(1, Math.max(0, 1 - ex.left / Math.max(1, ex.total))) : 0;
    if (Math.abs(prog - skyP) > 0.004) {   // 창밖 시간 변화 + 햇빛
      skyP = prog; applySky(prog);
      sun.color.set(lerpC('#fff3d6', '#ffa86a', Math.max(0, (prog - 0.5) / 0.5))); sun.intensity = 0.95 - prog * 0.3; sun.position.set(-7, 5.2 - prog * 3, 1.5 - prog * 3);
    }
    /* 소리: 시험 중 공기 + 연필 + 가끔 종이 */
    const live = ex.began && ex.running && soundOn && !!ac;
    ambience(live);
    if (live && now > scratchAt) { scratch(Math.random() < 0.18 ? 'page' : 'pencil'); scratchAt = now + 700 + Math.random() * 3200; }
    const secNow = Math.floor(Date.now() / 1000);
    if (secNow !== clockSec) { clockSec = secNow; drawClock(); boardDirty = true; updateSeatBtn(); }
    if (boardDirty) { drawBoard(); boardDirty = false; }
    renderer.render(scene, camera);
  }
  camera.position.set(me.x, me.eye, me.z);
  drawBoard(); drawClock(); updateSeatBtn();
  joinPresence();
  requestAnimationFrame(frame);
}
