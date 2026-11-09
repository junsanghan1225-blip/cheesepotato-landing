/* 햄스터 OX 퀴즈 (/ox/) — 운영자 2026-11-09 「메타버스처럼 OX 퀴즈 · 모여서 O 가 정답이면 X 에 있으면 죽는 느낌 · 캐릭터는 햄스터」 1단계.
   1단계는 서버 없이 이 기기에서만 돈다: 함께 뛰는 햄스터는 컴퓨터가 움직인다(2단계에서 실제 접속자와 함께).
   문항은 ox-questions.js(우리 TOPIK I 낱말 자료에서 만든 생성물). 3D 는 three.js(vendor, MIT). */
import * as THREE from './vendor/three.module.min.js?v=34ed3d43';
import { OX } from './ox-questions.js?v=34ed3d43';

const $ = (id) => document.getElementById(id);
const dl = (ev, extra) => { try { (window.dataLayer = window.dataLayer || []).push({ event: ev, ...extra }); } catch (e) { /* 기록만 빠진다 */ } };
const N_Q = 15, ASK = 10, REVEAL = 3.4, BOTS = 11;
const FIELD = { x: 7.2, z: 4.6 };   // 운동장 반 폭 · 반 깊이(가운데 줄 x = 0, 왼쪽 O · 오른쪽 X)

/* ── 소리(시작 단추를 누른 뒤에만) ── */
let ac = null;
const audio = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } return ac; };
function tone(f, dur, type = 'sine', vol = 0.12, slide = 0) {
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
}
const sTick = () => tone(880, 0.08, 'square', 0.05);
const sOk = () => { tone(660, 0.14, 'triangle'); setTimeout(() => tone(990, 0.22, 'triangle'), 120); };
const sNg = () => tone(220, 0.45, 'sawtooth', 0.08, -120);
const sFall = () => tone(500, 0.8, 'sine', 0.07, -420);

/* ── 3D ── */
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas: $('scene'), antialias: true }); } catch (e) { renderer = null; }
if (!renderer) $('noGl').classList.add('on');
const fine = matchMedia('(pointer:fine)').matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3f5);
scene.fog = new THREE.Fog(0xbfe3f5, 30, 70);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  if (fine) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
}
scene.add(new THREE.HemisphereLight(0xffffff, 0x7a8a6a, 1.05));
const sun = new THREE.DirectionalLight(0xfff2d8, 1.1); sun.position.set(-6, 12, 8);
if (fine) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); }
scene.add(sun);
const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const cast = (o) => { if (fine) { o.castShadow = true; o.receiveShadow = true; } return o; };
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

/* 풀밭 · 울타리 · 나무 */
{ const g = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mat(0x86c06c)); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; if (fine) g.receiveShadow = true; scene.add(g); }
const fenceM = mat(0xf4efe3);
for (let i = -11; i <= 11; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), fenceM); p.position.set(i, 0.35, -9.5); scene.add(p); }
{ const r = new THREE.Mesh(new THREE.BoxGeometry(22, 0.1, 0.08), fenceM); r.position.set(0, 0.55, -9.5); scene.add(r); }
const treeM = [0x4f8c55, 0x5aa05f, 0x47804c].map((c) => mat(c)), trunkM = mat(0x7a5634);
for (const [x, z, s] of [[-12, -11, 1.4], [-8, -13, 1.1], [-3, -14, 1.5], [3, -13.5, 1.2], [8, -12.5, 1.4], [12.5, -10, 1.2], [-13, -4, 1.1], [13.5, -3, 1.3], [-13, 3, 1.2], [13, 4, 1]]) {
  const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s);
  const tr = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.8, 8), trunkM)); tr.position.y = 0.9; t.add(tr);
  [[0, 2.4, 0, 1.3], [-0.7, 1.9, 0.3, 0.9], [0.8, 2.0, -0.2, 1]].forEach(([dx, dy, dz, r], i) => { const l = cast(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), treeM[i % 3])); l.position.set(dx, dy, dz); t.add(l); });
  scene.add(t);
}

/* O · X 판(꺼지는 바닥). 판 아래는 깊은 구덩이 */
const pit = new THREE.Mesh(new THREE.BoxGeometry(FIELD.x * 2 + 0.4, 0.1, FIELD.z * 2 + 0.4), mat(0x2a221c)); pit.position.set(0, -4, 0); scene.add(pit);
{ // 구덩이 벽(바닥이 꺼지면 보인다)
  const wm = mat(0x4a3a2c);
  for (const [w, d, x, z] of [[FIELD.x * 2 + 0.4, 0.2, 0, -FIELD.z - 0.1], [FIELD.x * 2 + 0.4, 0.2, 0, FIELD.z + 0.1], [0.2, FIELD.z * 2 + 0.4, -FIELD.x - 0.1, 0], [0.2, FIELD.z * 2 + 0.4, FIELD.x + 0.1, 0]]) {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), wm); o.position.set(x, -2, z); scene.add(o);
  }
}
const panelTex = (letter, bg, fg) => canvasTex(512, 384, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.strokeRect(10 + i * 0, 10, w - 20, h - 20); }
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 8; i++) g.fillRect(i * 64, 0, 32, h);
  g.strokeStyle = fg; g.lineWidth = 46; g.lineCap = 'round';
  if (letter === 'O') { g.beginPath(); g.arc(w / 2, h / 2, 120, 0, Math.PI * 2); g.stroke(); }
  else { g.beginPath(); g.moveTo(w / 2 - 110, h / 2 - 110); g.lineTo(w / 2 + 110, h / 2 + 110); g.moveTo(w / 2 + 110, h / 2 - 110); g.lineTo(w / 2 - 110, h / 2 + 110); g.stroke(); }
});
const mkPanel = (letter, bg, fg, cx) => {
  const m = cast(new THREE.Mesh(new THREE.BoxGeometry(FIELD.x - 0.15, 0.3, FIELD.z * 2), [mat(bg), mat(bg), new THREE.MeshLambertMaterial({ map: panelTex(letter, bg, fg) }), mat(bg), mat(bg), mat(bg)]));
  m.position.set(cx, -0.15, 0); scene.add(m); return m;
};
const panO = mkPanel('O', '#2f6fd6', '#ffffff', -FIELD.x / 2 - 0.075), panX = mkPanel('X', '#d6452f', '#ffffff', FIELD.x / 2 + 0.075);
{ const line = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, FIELD.z * 2), mat(0xf6f1e7)); line.position.set(0, -0.14, 0); scene.add(line); }
/* 관중석(떨어진 햄스터가 앉아서 끝까지 본다) */
const stands = new THREE.Group(); scene.add(stands);
for (let r = 0; r < 2; r++) { const s = cast(new THREE.Mesh(new THREE.BoxGeometry(16, 0.4 + r * 0.4, 1.2), mat(r ? 0xc9b48f : 0xd9c7a2))); s.position.set(0, 0.2 + r * 0.2, -6.6 - r * 1.2); stands.add(s); }
const standSpot = (k) => ({ x: -7 + (k % 12) * 1.25, y: 0.42 + (k >= 12 ? 0.4 : 0), z: k >= 12 ? -7.8 : -6.6 });

/* ── 햄스터 ── 공처럼 둥근 몸 + 앞쪽 얼굴(+z 를 본다) · 귀 · 볼주머니 · 흰 배 · 분홍 발 */
const sph = new THREE.SphereGeometry(1, 20, 14);
const part = (parent, m, x, y, z, sx, sy, sz) => { const o = cast(new THREE.Mesh(sph, m)); o.position.set(x, y, z); o.scale.set(sx, sy, sz); parent.add(o); return o; };
const LOOK = {
  cheese: { fur: 0xe0a04a, belly: 0xfbf1df, ear: 0xd9a6a0 },
  gamja: { fur: 0x9a9a96, belly: 0xf4f2ee, ear: 0xc9a7a2, stripe: 0x4d4b48 },
  snow: { fur: 0xf6f3ec, belly: 0xffffff, ear: 0xf1c1c1 },
  cocoa: { fur: 0x8a5a3a, belly: 0xf1e4d2, ear: 0xc99a90 },
  cream: { fur: 0xf2d7a8, belly: 0xfffaf0, ear: 0xe8b8b0 },
  panda: { fur: 0x2e2b2a, belly: 0xf6f3ec, ear: 0x6a5a58, patch: 1 },
};
function makeHamster(kind, scale = 1) {
  const L = LOOK[kind], fur = mat(L.fur), belly = mat(L.belly), pink = mat(0xf0a3a3), black = mat(0x141210), white = mat(0xffffff);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.scale.setScalar(scale);
  part(body, fur, 0, 0.42, 0, 0.46, 0.4, 0.5);                 // 몸
  part(body, belly, 0, 0.34, 0.2, 0.34, 0.3, 0.32);             // 흰 배
  if (L.stripe) part(body, mat(L.stripe), 0, 0.8, -0.05, 0.06, 0.04, 0.42);   // 감자(정글리안) 등 줄무늬
  if (L.patch) part(body, belly, 0, 0.62, 0.1, 0.42, 0.24, 0.42);
  const head = new THREE.Group(); head.position.set(0, 0.62, 0.32); body.add(head);
  part(head, fur, 0, 0, 0, 0.32, 0.28, 0.28);
  part(head, belly, 0, -0.08, 0.16, 0.2, 0.14, 0.14);         // 주둥이
  for (const sx of [-1, 1]) {
    part(head, belly, sx * 0.19, -0.06, 0.1, 0.13, 0.11, 0.12);   // 볼주머니
    part(head, fur, sx * 0.17, 0.24, -0.06, 0.09, 0.09, 0.04).rotation.z = -sx * 0.3;   // 귀
    part(head, mat(L.ear), sx * 0.17, 0.24, -0.035, 0.06, 0.06, 0.02).rotation.z = -sx * 0.3;
    part(head, black, sx * 0.12, 0.05, 0.22, 0.045, 0.05, 0.03);  // 눈
    part(head, white, sx * 0.105, 0.07, 0.245, 0.012, 0.012, 0.01);
    const f = part(body, pink, sx * 0.2, 0.05, 0.22, 0.08, 0.05, 0.1);   // 앞발
    f.userData.foot = sx;
    part(body, pink, sx * 0.22, 0.04, -0.2, 0.09, 0.05, 0.12);   // 뒷발
  }
  part(head, pink, 0, -0.02, 0.28, 0.035, 0.03, 0.025);         // 코
  part(body, pink, 0, 0.3, -0.48, 0.05, 0.04, 0.05);            // 꼬리
  return { g, body, head };
}

/* ── 한 판 ── */
const BOT_KINDS = ['snow', 'cocoa', 'cream', 'panda', 'gamja', 'cheese', 'snow', 'cream', 'cocoa', 'gamja', 'panda'];
let me = null, bots = [], round = null, phase = 'intro', meKind = 'cheese', mode = 'solo';
const remotes = new Map();   // 함께 하기: 다른 접속자 햄스터(키 → 햄스터)
const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.72, 32), new THREE.MeshBasicMaterial({ color: 0xff8a3d, side: THREE.DoubleSide }));
ring.rotation.x = -Math.PI / 2; scene.add(ring);
const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 4), new THREE.MeshBasicMaterial({ color: 0xff8a3d })); arrow.rotation.x = Math.PI; scene.add(arrow);

function spawn(nBots = BOTS) {
  for (const h of [me, ...bots]) if (h) scene.remove(h.m.g);
  const mz = mode === 'live' ? -3 + Math.random() * 6 : 2.2;
  me = { m: makeHamster(meKind, 1.05), x: 0, z: mz, tx: 0, tz: mz, y: 0, vy: 0, side: 0, alive: true, isMe: true, hop: 0 };
  bots = BOT_KINDS.slice(0, nBots).map((k, i) => ({ m: makeHamster(k, 0.9 + (i % 3) * 0.06), x: (i % 6 - 2.5) * 0.9, z: -2 + Math.floor(i / 6) * 1.6 + (i % 2) * 0.3, tx: 0, tz: 0, y: 0, vy: 0, side: 0, alive: true, acc: 0.55 + Math.random() * 0.32, decideAt: 0, swapAt: 0, hop: Math.random() * 6, spot: -1 }));
  for (const b of bots) { b.tx = b.x; b.tz = b.z; }
  for (const h of [me, ...bots]) { h.m.g.position.set(h.x, 0, h.z); scene.add(h.m.g); }
}
const sideOf = (x) => (x < -0.4 ? 1 : x > 0.4 ? 2 : 0);   // 1 = O, 2 = X, 0 = 가운데(정하지 않음)
const randIn = (side) => ({ x: (side === 1 ? -1 : 1) * (1.1 + Math.random() * (FIELD.x - 1.8)), z: -FIELD.z + 0.8 + Math.random() * (FIELD.z * 2 - 1.6) });
function goSide(h, side) {
  if (h.side === side) return;
  h.side = side; const p = randIn(side);
  if (h.isMe && mode !== 'live') { p.x = side === 1 ? -FIELD.x / 2 : FIELD.x / 2; p.z = 1.6; }   // 혼자일 때는 늘 같은 자리(찾기 쉽게) · 함께일 때는 겹치지 않게 아무 데나
  h.tx = p.x; h.tz = p.z;
}

/* 한 판에 여러 갈래가 섞이게: 갈래마다 돌아가며 하나씩 뽑는다(낱말 뜻만 계속 나오지 않게). rand 를 주면 그 순서로(함께 하기는 모두 같은 씨앗) */
function buildPool(rand) {
  const sh = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const by = {}; for (const q of OX) (by[q.k] = by[q.k] || []).push(q);
  const kinds = sh(Object.keys(by).sort()), pool = [];
  for (const k of kinds) sh(by[k]);
  for (let i = 0; pool.length < N_Q && i < 300; i++) { const q = by[kinds[i % kinds.length]].pop(); if (q) pool.push(q); }
  return sh(pool);
}
const seeded = (n) => { let x = (n * 2654435761) % 4294967296; return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; }; };
function startRound() {
  audio();
  mode = 'solo';
  round = { qs: buildPool(Math.random), i: -1, score: 0, outAt: 0, t0: 0 };
  spawn();
  $('panel').hidden = true; $('end').hidden = true; $('qWrap').hidden = false; $('pick').hidden = false;
  dl('ox_start', { cp_who: meKind });
  nextQ();
}
function nextQ() {
  round.i++;
  if (round.i >= round.qs.length) return finish();
  const q = round.qs[round.i];
  phase = 'ask'; round.t0 = performance.now(); round.lastTick = 0; round.fallen = false; panO.position.y = panX.position.y = -0.15;
  $('qNo').textContent = `${round.i + 1} / ${round.qs.length}`;
  $('qKind').textContent = KIND[q.k] || '';
  $('qText').innerHTML = q.q.split('\n').map((l) => esc(l).replace(/「([^」]+)」/g, '「<em>$1</em>」')).join('<br>');
  $('qEn').textContent = '맞으면 O, 틀리면 X · True? O · False? X';
  $('bO').disabled = $('bX').disabled = false;
  for (const h of [me, ...bots]) { h.side = 0; }
  /* 모두 가운데 줄 근처로 모였다가 다시 고른다 */
  me.tx = 0; me.tz = mode === 'live' ? me.tz : 1.6;
  bots.filter((b) => b.alive).forEach((b, k) => { b.tx = (Math.random() - 0.5) * 1.2; b.tz = -FIELD.z + 1 + (k / Math.max(1, bots.length)) * (FIELD.z * 2 - 2); b.decideAt = 0.8 + Math.random() * 6.5; b.swapAt = Math.random() < 0.25 ? b.decideAt + 1 + Math.random() * 2 : 0; b.choice = Math.random() < b.acc ? (q.a ? 1 : 2) : (q.a ? 2 : 1); });
  paintPick(); paintStat();
}
/* 갈래 이름(문제 위 작은 글자) */
const KIND = { meaning: '낱말 뜻 · Word meaning', pos: '품사 · Part of speech', grammar: '문법 · Grammar', expr: '속담 · 관용 표현 · Expressions', hanja: '사자성어 한자 · Hanja', number: '숫자 읽기 · Reading numbers', honor: '높임말 · Honorifics' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function paintPick() { $('bO').setAttribute('aria-pressed', String(me.side === 1)); $('bX').setAttribute('aria-pressed', String(me.side === 2)); }
function paintStat() {
  const everyone = [me, ...bots, ...remotes.values()], alive = everyone.filter((h) => h.alive).length;
  $('sAlive').textContent = `${alive} / ${everyone.length}`;
  $('sLive').textContent = mode === 'live' ? `함께 ${remotes.size + 1}명 · 남은 햄스터` : '남은 햄스터'; $('sScore').textContent = String(round ? round.score : 0);
}
function pick(side) { if (phase !== 'ask') return; goSide(me, side); paintPick(); tone(side === 1 ? 520 : 400, 0.08, 'triangle', 0.06); }
$('bO').addEventListener('click', () => pick(1));
$('bX').addEventListener('click', () => pick(2));
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'o') pick(1);
  if (k === 'arrowright' || k === 'x') pick(2);
  if ((k === 'enter' || k === ' ') && !$('panel').hidden) $('bGo').click();
});
/* 운동장을 눌러도 그쪽으로 */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
$('scene').addEventListener('pointerup', (e) => {
  if (phase !== 'ask') return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects([panO, panX], false)[0]; if (hit) pick(hit.object === panO ? 1 : 2);
});

let msgT = 0;
function say(text, cls, ms = 1800) { const m = $('msg'); m.className = `on ${cls}`; m.textContent = text; clearTimeout(msgT); msgT = setTimeout(() => { m.className = ''; }, ms); }

function reveal() {
  phase = 'reveal'; round.t0 = performance.now();
  const q = round.qs[round.i], good = q.a ? 1 : 2;
  $('bO').disabled = $('bX').disabled = true;
  $('qEn').textContent = `정답 ${q.a ? 'O' : 'X'} · ${q.e}`;
  const meRight = me.side === good;
  if (meRight) { round.score++; sOk(); say(me.alive ? '정답! 살았어요' : '정답!', 'ok'); }
  else { sNg(); say(me.alive ? '앗, 떨어져요!' : '아쉬워요', 'ng'); }
  /* 틀린 쪽 바닥이 꺼진다 */
  round.drop = good === 1 ? panX : panO; round.dropMid = true;
  setTimeout(sFall, 250);
  for (const h of [me, ...bots, ...remotes.values()]) {
    if (!h.alive || h.side === good) continue;
    h.falling = true; h.vy = 0.5;
    if (h.isMe) { h.alive = false; round.outAt = round.outAt || round.i + 1; }
  }
  paintStat();
}
function afterFall() {
  for (const b of bots) if (b.falling) { b.falling = false; b.alive = false; b.spot = bots.filter((x) => !x.alive && x.spot >= 0).length; const s = standSpot(b.spot); b.x = b.tx = s.x; b.z = b.tz = s.z; b.y = s.y; b.vy = 0; b.m.g.rotation.set(0, 0, 0); }
  for (const r of remotes.values()) if (r.falling) { r.falling = false; r.y = 0; r.vy = 0; r.x = r.tx; r.z = r.tz; r.m.g.rotation.set(0, 0, 0); r.alive = false; ghost(r, true); }
  if (me.falling) { me.falling = false; me.y = 0; me.vy = 0; me.x = me.tx = 0; me.z = me.tz = mode === 'live' ? me.tz : 1.6; me.m.g.rotation.set(0, 0, 0); ghost(me, true); }
  sendMe(true);
  paintStat();
}
function ghost(h, on) { h.m.g.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = on; o.material.opacity = on ? 0.45 : 1; } }); }

function finish() {
  phase = 'end'; $('qWrap').hidden = true; $('pick').hidden = true;
  const n = round.qs.length, alive = bots.filter((b) => b.alive).length;
  $('eT').textContent = me.alive ? '끝까지 살아남았어요!' : '끝!';
  $('eRes').innerHTML = `맞힌 문제 <b>${round.score}</b> / ${n}<br>${me.alive ? `같이 살아남은 햄스터 ${alive}마리` : `${round.outAt}번 문제에서 떨어졌지만 끝까지 풀었어요`}`;
  $('end').hidden = false;
  dl('ox_end', { cp_score: round.score, cp_alive: me.alive ? 1 : 0 });
}
$('bGo').addEventListener('click', startRound);
$('bAgain').addEventListener('click', startRound);
document.querySelectorAll('#who button').forEach((b) => b.addEventListener('click', () => {
  meKind = b.dataset.who; document.querySelectorAll('#who button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  if (phase === 'intro') { spawn(); }
}));

/* ── 함께 하기(2단계) — 서버 없이 모두가 같은 시계로 같은 문제를 본다 ──
   14초 한 칸(10초 고르기 + 4초 정답), 16칸이 한 판(15문제 + 쉬는 칸). 판 번호가 씨앗이라 누구나 같은 순서.
   다른 접속자는 Supabase 실시간(presence)으로 — 로그인한 사람만, 이름 없이. 새 표 · SQL 은 필요 없다. */
const SLOT = 14000, RLEN = 16;
const SB_URL = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc';
let chan = null, myKey = '', lastSent = '', lastSendAt = 0;
const signedIn = () => { try { const raw = localStorage.getItem('sb-tjgoevtvobvmlyefgxel-auth-token'), j = raw && JSON.parse(raw); return !!(j && (j.access_token || (j.currentSession && j.currentSession.access_token))); } catch (e) { return false; } };
const botsFor = () => Math.max(0, 6 - remotes.size);   // 사람이 적으면 컴퓨터 햄스터로 채운다(내 화면에만)
function newLiveRound(r) {
  round = { r, qs: buildPool(seeded(r)), i: -1, score: 0, outAt: 0, t0: 0, live: true };
  spawn(botsFor()); phase = 'wait'; paintStat(); sendMe(true);
}
function liveTick() {
  const ms = Date.now(), s = Math.floor(ms / SLOT), r = Math.floor(s / RLEN), i = s % RLEN, el = (ms % SLOT) / 1000;
  if (!round || round.r !== r) newLiveRound(r);
  if (i === RLEN - 1) {   // 쉬는 칸: 이번 판 점수 · 다음 판까지
    if (phase !== 'break') {
      phase = 'break'; $('qKind').textContent = '쉬는 시간 · Break'; $('qNo').textContent = '';
      $('qText').innerHTML = `이번 판 맞힌 문제 <em>${round.score}</em> / ${round.qs.length}`;
      $('bO').disabled = $('bX').disabled = true; dl('ox_live_end', { cp_score: round.score });
    }
    $('qEn').textContent = `다음 판까지 ${Math.ceil(14 - el)}초 · Next round soon`; $('qSec').textContent = '';
    return;
  }
  if (round.i !== i) {
    if (el < ASK - 1.5) { round.i = i - 1; nextQ(); round.t0 = performance.now() - el * 1000; }
    else if (round.waitI !== i) {   // 문제 중간에 들어왔다 — 다음 문제부터
      round.waitI = i; phase = 'wait'; $('qKind').textContent = ''; $('qNo').textContent = `${i + 1} / ${N_Q}`;
      $('qText').textContent = '다음 문제부터 같이 풀어요'; $('qEn').textContent = 'Joining from the next question'; $('bO').disabled = $('bX').disabled = true;
    }
  }
}
const cur = () => ({ k: meKind, s: me ? me.side : 0, x: me ? +me.tx.toFixed(2) : 0, z: me ? +me.tz.toFixed(2) : 0, al: me && me.alive ? 1 : 0 });
function sendMe(force) {
  if (!chan) return;
  const now = performance.now(); if (!force && now - lastSendAt < 300) return;
  const c = cur(), j = JSON.stringify(c); if (j === lastSent) return;
  lastSent = j; lastSendAt = now; try { chan.track(c); } catch (e) { /* 다음에 다시 */ }
}
function onSync() {
  const st = chan.presenceState();
  for (const key of [...remotes.keys()]) if (!st[key]) { scene.remove(remotes.get(key).m.g); remotes.delete(key); }
  for (const key of Object.keys(st)) {
    if (key === myKey) continue;
    const m = st[key][st[key].length - 1]; if (!m) continue;
    let r = remotes.get(key);
    if (!r) { r = { m: makeHamster(LOOK[m.k] ? m.k : 'cheese', 1), x: m.x, z: m.z, tx: m.x, tz: m.z, y: 0, vy: 0, side: m.s, alive: !!m.al, hop: 0, remote: true }; r.m.g.position.set(r.x, 0, r.z); scene.add(r.m.g); remotes.set(key, r); if (!r.alive) ghost(r, true); }
    r.tx = m.x; r.tz = m.z; r.side = m.s;
    if (!r.falling && !!m.al !== r.alive) { r.alive = !!m.al; ghost(r, !r.alive); }
  }
  paintStat();
}
async function startLive() {
  audio();
  if (!signedIn()) { $('liveNote').hidden = false; return; }
  mode = 'live'; round = null;
  $('panel').hidden = true; $('end').hidden = true; $('qWrap').hidden = false; $('pick').hidden = false;
  dl('ox_live_join', { cp_who: meKind });
  liveTick();
  try {
    const { createClient } = await import('./vendor/supabase-js.js?v=34ed3d43');
    // 이 화면은 보기만 한다 — 로그인 세션은 건드리지 않는다(갱신 토큰 충돌 방지).
    const sb = createClient(SB_URL, SB_ANON, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    myKey = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)).slice(0, 12);
    chan = sb.channel('ox-live-1', { config: { presence: { key: myKey } } });
    chan.on('presence', { event: 'sync' }, onSync).subscribe((status) => { if (status === 'SUBSCRIBED') sendMe(true); });
  } catch (e) { chan = null; }   // 연결이 안 돼도 같은 시계로 혼자(컴퓨터 햄스터와) 계속된다
}
$('bLive').addEventListener('click', startLive);

/* ── 그리기 ── */
function resize() {
  if (!renderer) return;
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  const narrow = w / h < 0.8; camera.fov = narrow ? 62 : 48;
  camera.position.set(0, narrow ? 22 : 10.5, narrow ? 15 : 11.5); camera.lookAt(0, 0, narrow ? 0.6 : -0.8);   // 폰(세로)은 운동장 양 끝이 다 보이게 더 멀리서
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  if (mode === 'live') liveTick();
  if (round && phase === 'ask') {
    const el = (now - round.t0) / 1000, left = Math.max(0, ASK - el);
    $('qSec').textContent = `${Math.ceil(left)}초`; $('qBar').style.transform = `scaleX(${left / ASK})`;
    if (left <= 3 && Math.ceil(left) !== round.lastTick && left > 0) { round.lastTick = Math.ceil(left); sTick(); }
    for (const b of bots) { if (!b.alive) continue; if (!b.side && el > b.decideAt) goSide(b, b.choice); if (b.swapAt && el > b.swapAt) { b.swapAt = 0; goSide(b, b.side === 1 ? 2 : 1); b.choice = b.side; } }
    if (left <= 0) reveal();
  } else if (round && phase === 'reveal') {
    const el = (now - round.t0) / 1000;
    const d = round.drop, k = Math.min(1, el / 0.5);
    if (el < 2.2) d.position.y = -0.15 - 6 * k * k; else d.position.y += (-0.15 - d.position.y) * Math.min(1, dt * 6);
    if (el > 1.9 && !round.fallen) { round.fallen = true; afterFall(); }
    if (mode === 'solo' && el > REVEAL) nextQ();
  }
  /* 햄스터 움직임: 목표로 종종걸음(통통 튀며) · 떨어지면 빙글 */
  const all = me ? [me, ...bots, ...remotes.values()] : [];
  for (const h of all) {
    const g = h.m.g;
    if (h.falling) { h.vy -= 18 * dt; h.y += h.vy * dt; g.rotation.x += dt * 5; g.rotation.z += dt * 3; g.position.set(h.x, h.y, h.z); continue; }
    const dx = h.tx - h.x, dz = h.tz - h.z, dist = Math.hypot(dx, dz), sp = (h.isMe ? 6 : 4.6) * dt;
    if (dist > 0.03) { const s = Math.min(1, sp / dist); h.x += dx * s; h.z += dz * s; h.hop += dt * 14; g.rotation.y = Math.atan2(dx, dz); }
    else { h.hop += dt * 2; g.rotation.y += (0 - g.rotation.y) * Math.min(1, dt * 4); }   // 멈추면 앞(화면 쪽)을 본다
    const bounce = dist > 0.03 ? Math.abs(Math.sin(h.hop)) * 0.18 : Math.abs(Math.sin(h.hop)) * 0.02;
    g.position.set(h.x, (h.y || 0) + bounce, h.z);
    h.m.body.scale.set(1 + bounce * 0.3, 1 - bounce * 0.5, 1 + bounce * 0.3);   // 착지할 때 찌그러짐
    h.m.head.rotation.x = Math.sin(t * 2 + h.hop) * 0.05;
  }
  if (me) { sendMe(false); ring.position.set(me.x, 0.02 + (me.falling ? me.y : 0), me.z); ring.visible = !me.falling; arrow.position.set(me.x, 1.6 + Math.sin(t * 4) * 0.08 + (me.falling ? me.y : 0), me.z); }
  if (renderer) renderer.render(scene, camera);
}
spawn();
requestAnimationFrame(frame);
