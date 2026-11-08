/* TOPIK 3D 시험장 (/exam-room/) — 운영자 2026-11-08 「진짜 교실처럼 시간이랑 띄우고 · 3D 로 아예 개별화면으로」.
   화면 전체가 3D 교실이다: 칠판에 남은 시간, 벽시계(지금 시각), 종소리, 감독관 안내 글.
   문제를 푸는 곳이 아니라 「시간과 분위기」를 재는 도구다 — 문제는 책이나 사이트 모의고사에서 푼다.
   3D 는 three.js(vendor/three.module.min.js, MIT)로 그린다. 3D 를 못 쓰는 기기는 시계만 크게 보여 준다. */
import * as THREE from './vendor/three.module.min.js?v=ccd5780a';

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
function paintOpts() {
  const custom = document.querySelector('#opts [aria-pressed="true"]')?.dataset.min === 'custom';
  $('customRow').hidden = !custom;
}
$('opts').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-min]'); if (!b) return;
  document.querySelectorAll('#opts button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  picked = { name: b.dataset.name, min: b.dataset.min };
  paintOpts();
});
$('bStart').addEventListener('click', () => {
  let min = picked.min === 'custom' ? Number($('customMin').value) : Number(picked.min);
  if (!(min >= 1)) min = 30;
  min = Math.min(180, Math.round(min));
  start(picked.min === 'custom' ? `직접 ${min}분` : picked.name, min);
});
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
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(66, 1, 0.05, 40);
  const SEATZ = 2.6, SEATX = 0;
  camera.position.set(SEATX, 1.16, SEATZ + 0.62);

  /* 불빛 — 단순한 면 재질이라 환경 빛 + 한 줄기 방향 빛이면 충분하다 */
  scene.add(new THREE.AmbientLight(0xfff4e0, 1.05));
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x8a7a62, 0.7));
  const sun = new THREE.DirectionalLight(0xfff0d0, 0.9); sun.position.set(-5, 4, 2); scene.add(sun);

  const mat = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o });
  const box = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); scene.add(o); return o; };

  /* 바닥(나무 마루 무늬) · 벽 · 천장 */
  const floorTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#c79d63'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(${90 + (i * 7) % 40},${60 + (i * 5) % 30},30,.16)`; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(60,40,20,.35)'; g.fillRect(0, i * 32, w, 2); }
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(60,40,20,.28)'; g.fillRect((i * 97) % w, ((i * 53) % 16) * 32, 2, 32); }
  }).t;
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(6, 8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 16), new THREE.MeshLambertMaterial({ map: floorTex }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0.5); scene.add(floor);
  const wallM = mat(0xefe8d6), woodM = mat(0x7a5632), greenM = mat(0x5f8b6f);
  const wall = (w, h, x, y, z, ry = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallM); o.position.set(x, y, z); o.rotation.y = ry; scene.add(o); return o; };
  wall(12, 3.5, 0, 1.75, -7.5);                 // 앞(칠판)
  wall(12, 3.5, 0, 1.75, 8.5, Math.PI);         // 뒤
  wall(16, 3.5, -6, 1.75, 0.5, Math.PI / 2);    // 왼쪽(창)
  wall(16, 3.5, 6, 1.75, 0.5, -Math.PI / 2);    // 오른쪽
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 16), mat(0xf7f4ec)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.5, 0.5); scene.add(ceil);
  for (const [w, x, z, ry] of [[12, 0, -7.49, 0], [16, -5.99, 0.5, Math.PI / 2], [16, 5.99, 0.5, -Math.PI / 2]]) {   // 아래 초록 띠
    const o = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), greenM); o.position.set(x, 0.45, z); o.rotation.y = ry; scene.add(o);
  }

  /* 천장 형광등 */
  const lampM = new THREE.MeshBasicMaterial({ color: 0xfffbe8 });
  for (const z of [-4.5, -0.5, 3.5, 7]) for (const x of [-2.6, 2.6]) box(1.9, 0.05, 0.3, lampM, x, 3.47, z);

  /* 칠판(남은 시간) */
  box(6.9, 1.62, 0.06, woodM, 0, 1.78, -7.46);
  const board = canvasTex(1024, 256, () => {});
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.5), new THREE.MeshBasicMaterial({ map: board.t }));
  boardMesh.position.set(0, 1.78, -7.425); scene.add(boardMesh);
  box(6.7, 0.07, 0.14, woodM, 0, 1.0, -7.4);   // 분필 받침
  for (const [x, c] of [[-2.6, 0xf5f5f0], [-2.3, 0xf2d86a], [-2.0, 0xe8a0a8]]) box(0.12, 0.03, 0.03, mat(c), x, 1.05, -7.38);

  /* 벽시계(지금 시각) */
  const clock = canvasTex(256, 256, () => {});
  { const rim = new THREE.Mesh(new THREE.CircleGeometry(0.325, 40), mat(0x2b2b2b)); rim.position.set(3.85, 3.0, -7.43); scene.add(rim); }
  const clockMesh = new THREE.Mesh(new THREE.CircleGeometry(0.28, 40), new THREE.MeshBasicMaterial({ map: clock.t }));
  clockMesh.position.set(3.85, 3.0, -7.425); scene.add(clockMesh);

  /* 교탁 */
  box(1.5, 0.9, 0.7, woodM, 2.6, 0.45, -6.4);
  box(1.56, 0.06, 0.76, mat(0x9a7448), 2.6, 0.93, -6.4);

  /* 창(왼쪽 벽) — 밝은 하늘색 면 + 틀 */
  const glassM = new THREE.MeshBasicMaterial({ color: 0xcfe6f7 });
  for (const z of [-4.6, -1.6, 1.4, 4.4]) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.6), glassM); g.position.set(-5.98, 2.0, z); g.rotation.y = Math.PI / 2; scene.add(g);
    box(0.05, 1.7, 0.06, mat(0xffffff), -5.97, 2.0, z); box(0.05, 0.06, 2.4, mat(0xffffff), -5.97, 1.18, z); box(0.05, 0.06, 2.4, mat(0xffffff), -5.97, 2.82, z); box(0.05, 1.7, 0.05, mat(0xffffff), -5.97, 2.0, z - 1.17); box(0.05, 1.7, 0.05, mat(0xffffff), -5.97, 2.0, z + 1.17);
  }
  /* 오른쪽 벽 게시판 */
  box(0.04, 1.2, 4.2, mat(0xc89a5a), 5.97, 1.9, -2.2);
  const paperCols = [0xfff2a8, 0xbfe3c8, 0xf7c4c4, 0xc9d9f2, 0xfff2a8, 0xf3d9ff];
  paperCols.forEach((c, i) => box(0.02, 0.5, 0.55, mat(c), 5.94, 1.85 + ((i % 2) ? 0.22 : -0.12), -3.9 + i * 0.68));

  /* 책상 · 의자(여러 줄) */
  const rows = [-1.2, 0.7, SEATZ, 4.5, 6.3], cols = [-3.9, -2.0, SEATX, 2.0, 3.9];
  const topM = mat(0xd8c19a), legM = mat(0x555a60), seatM = mat(0x4a6fa5), backM = mat(0x3d5d8c);
  const desks = [];
  for (const z of rows) for (const x of cols) desks.push([x, z]);
  const topG = new THREE.BoxGeometry(0.72, 0.04, 0.5), legG = new THREE.BoxGeometry(0.04, 0.72, 0.04);
  const seatG = new THREE.BoxGeometry(0.42, 0.04, 0.42), backG = new THREE.BoxGeometry(0.42, 0.34, 0.04);
  const tops = new THREE.InstancedMesh(topG, topM, desks.length), legs = new THREE.InstancedMesh(legG, legM, desks.length * 4);
  const seats = new THREE.InstancedMesh(seatG, seatM, desks.length), backs = new THREE.InstancedMesh(backG, backM, desks.length);
  const m4 = new THREE.Matrix4();
  desks.forEach(([x, z], i) => {
    tops.setMatrixAt(i, m4.makeTranslation(x, 0.74, z));
    [[-0.32, -0.2], [0.32, -0.2], [-0.32, 0.2], [0.32, 0.2]].forEach(([dx, dz], k) => legs.setMatrixAt(i * 4 + k, m4.makeTranslation(x + dx, 0.37, z + dz)));
    seats.setMatrixAt(i, m4.makeTranslation(x, 0.45, z + 0.55));
    backs.setMatrixAt(i, m4.makeTranslation(x, 0.68, z + 0.75));
  });
  [tops, legs, seats, backs].forEach((o) => scene.add(o));

  /* 앞자리 수험생들 — 둥근 몸 + 머리(내 자리 앞쪽 줄만, 칠판을 보고 있다) */
  const skin = [0xf0c9a5, 0xe6b894, 0xd9a47c], cloth = [0x2f3d57, 0x6b4a63, 0x3d5b4b, 0x7a6a3a, 0x4a4a52, 0x8a4b3b];
  desks.forEach(([x, z], i) => {
    if (z >= SEATZ - 0.01 || (Math.abs(x - SEATX) < 0.1 && z === SEATZ)) return;
    if ((i * 7) % 5 === 0) return;   // 빈자리도 섞는다
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.5, 10), mat(cloth[i % cloth.length])); body.position.set(x, 0.78, z + 0.5); scene.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 10), mat(skin[i % skin.length])); head.position.set(x, 1.14, z + 0.5); scene.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(0x2a2320)); hair.position.set(x, 1.15, z + 0.51); scene.add(hair);
  });

  /* 내 책상 위 시험지 */
  const paper = canvasTex(256, 360, (g, w, h) => {
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1c1915'; g.font = 'bold 20px sans-serif'; g.fillText('TOPIK 연습', 18, 34);
    g.font = '13px sans-serif'; g.fillStyle = '#5c564c'; g.fillText('수험번호 ______  이름 ______', 18, 58);
    g.strokeStyle = '#b9b09c'; g.lineWidth = 1;
    for (let y = 90; y < 340; y += 24) { g.beginPath(); g.moveTo(18, y); g.lineTo(w - 18, y); g.stroke(); }
    g.fillStyle = '#1c1915'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(30, 100 + i * 40, 5, 0, 7); g.stroke(); g.fillRect(48, 96 + i * 40, 150 - (i % 3) * 20, 3); }
  }).t;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), new THREE.MeshLambertMaterial({ map: paper }));
  sheet.rotation.x = -Math.PI / 2 + 0.05; sheet.rotation.z = 0.05; sheet.position.set(SEATX, 0.765, SEATZ - 0.02); scene.add(sheet);
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.17, 8), mat(0xf2c744)); pencil.rotation.z = Math.PI / 2 - 0.3; pencil.rotation.y = 0.4; pencil.position.set(SEATX + 0.24, 0.77, SEATZ + 0.06); scene.add(pencil);

  /* 칠판 · 시계 그리기 */
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

  /* 둘러보기 — 끌어서 고개를 돌린다(좌우 ±57° · 위아래 ±26°), 휠로 시야 넓이 */
  let yaw = 0, pitch = -0.04, vYaw = 0, vPitch = 0, drag = null;
  const cv = $('scene');
  cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => { if (!drag) return; vYaw += (e.clientX - drag.x) * 0.00035; vPitch += (e.clientY - drag.y) * 0.00025; drag = { x: e.clientX, y: e.clientY }; });
  const up = () => { drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', (e) => { e.preventDefault(); camera.fov = Math.min(82, Math.max(44, camera.fov + e.deltaY * 0.03)); camera.updateProjectionMatrix(); }, { passive: false });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 78 : 66;   // 세로 화면은 시야를 넓힌다
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  let t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const t = (now - t0) / 1000;
    yaw = Math.max(-1, Math.min(1, yaw + vYaw)); pitch = Math.max(-0.45, Math.min(0.45, pitch + vPitch));
    vYaw *= 0.82; vPitch *= 0.82;
    camera.rotation.set(0, 0, 0);
    camera.rotateY(yaw + Math.sin(t * 0.18) * 0.006); camera.rotateX(pitch + Math.sin(t * 0.23) * 0.004);
    const secNow = Math.floor(Date.now() / 1000);
    if (secNow !== clockSec) { clockSec = secNow; drawClock(); boardDirty = true; }
    if (boardDirty) { drawBoard(); boardDirty = false; }
    renderer.render(scene, camera);
  }
  drawBoard(); drawClock();
  requestAnimationFrame(frame);
}
