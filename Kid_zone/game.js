'use strict';

// ── URL PARAMS ───────────────────────────────────────────────────────────────
const params = new URLSearchParams(location.search);
const CHAR   = params.get('char') || 'bunny';
const MODE   = params.get('mode') || 'typing';

const CHAR_DATA = {
  bunny: { emoji: '🐰', name: 'Benny Bunny' },
  bear:  { emoji: '🐻', name: 'Bruno Bear'  },
};
const DANGERS = [
  { emoji: '🦊', name: 'Fox'       },
  { emoji: '🐺', name: 'Wolf'      },
  { emoji: '👾', name: 'Monster'   },
  { emoji: '🌪️', name: 'Tornado'  },
  { emoji: '🔥', name: 'Fireball'  },
  { emoji: '🌋', name: 'Volcano'   },
];

// ── CANVAS ───────────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

const HUD_H   = 48;
const PANEL_H = 164;

let W, H, GROUND_Y, CHAR_X;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  const gameH = H - HUD_H - PANEL_H;
  GROUND_Y = HUD_H + gameH * 0.80;
  CHAR_X   = Math.min(W * 0.18, 210);
}
resize();
window.addEventListener('resize', () => { resize(); });

// ── DATA ─────────────────────────────────────────────────────────────────────
const WORDS = [
  ['cat','dog','hat','run','hop','sit','big','fun','red','box','sun','map','top','cup'],
  ['jump','frog','bear','bird','duck','fish','bark','swim','play','fast','drum','kite'],
  ['bunny','happy','funny','candy','juice','brave','fresh','sweet','dance','storm'],
  ['turtle','rabbit','carrot','joyful','spring','bright','forest','dragon','castle'],
  ['rainbow','chicken','dolphin','pumpkin','morning','journey','lantern','feather'],
  ['computer','elephant','birthday','umbrella','princess','treasure','mountain'],
  ['adventure','chocolate','butterfly','fantastic','fireworks','happiness'],
];

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

// Seeded pseudo-random for consistent background elements
function sr(s) { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); }

function makeMath(level) {
  let a, b, op, ans;
  if (level <= 2) {
    a = rand(1,10); b = rand(1,10); op = '+'; ans = a + b;
  } else if (level <= 4) {
    if (Math.random() < 0.5) { a = rand(6,25); b = rand(1,a); op = '−'; ans = a-b; }
    else                     { a = rand(2,20); b = rand(2,20); op = '+'; ans = a+b; }
  } else if (level <= 6) {
    a = rand(2,12); b = rand(2,6); op = '×'; ans = a*b;
  } else {
    const r = Math.random();
    if      (r < 0.4) { a = rand(2,12);  b = rand(2,12); op = '×'; ans = a*b; }
    else if (r < 0.7) { a = rand(1,50);  b = rand(1,50); op = '+'; ans = a+b; }
    else              { a = rand(15,70); b = rand(1,a);  op = '−'; ans = a-b; }
  }
  return { prompt: `${a} ${op} ${b} = ?`, answer: String(ans) };
}

function makeTyping(level) {
  const list = WORDS[Math.min(level - 1, WORDS.length - 1)];
  const word = list[rand(0, list.length - 1)];
  return { prompt: word.toUpperCase(), answer: word.toLowerCase() };
}

function dangerIdx(level) {
  return Math.min(Math.floor((level - 1) / 2), DANGERS.length - 1);
}

// ── ANIMATION ────────────────────────────────────────────────────────────────
// Vertical bounce offsets for run cycle (12 frames)
const BOUNCE = [0, -2, -6, -11, -14, -11, -6, -2, 0, 3, 5, 3];

let animT  = 0, animF  = 0;
let chasT  = 0, chasF  = 6; // chaser slightly offset in cycle

// ── GAME STATE ───────────────────────────────────────────────────────────────
const G = {
  level: 1, score: 0, streak: 0, streakNeeded: 10,
  scrollX:   0,
  charSpeed: 130,   // pixels/sec base scroll speed
  burst:     0,     // extra pixels/sec (decays away)
  burstDecay:200,   // px/s/s burst fades
  gap:       0,     // screen-pixel gap between chaser and character
  decay:     15,    // gap px/s lost (chaser catching up)
  question:  null,  prevAnswer: null,
  splashing: false, over: false,
  raf: null, lastT: null,
};

// ── DOM REFS ─────────────────────────────────────────────────────────────────
const wordBoxes  = document.getElementById('word-boxes');
const typeInput  = document.getElementById('type-input');
const qHint      = document.getElementById('q-hint');
const hudLevel   = document.getElementById('hud-level');
const hudScore   = document.getElementById('hud-score');
const hudStreak  = document.getElementById('hud-streak');
const levelFlash = document.getElementById('level-flash');
const levelFlTxt = document.getElementById('level-flash-text');
const overScreen = document.getElementById('gameover-screen');

// ── INPUT ────────────────────────────────────────────────────────────────────
typeInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') checkAnswer();
});

typeInput.addEventListener('input', () => {
  if (MODE !== 'typing' || !G.question) return;
  const t = typeInput.value.toLowerCase();
  updateLetterBoxes(t);
  if (t === G.question.answer) checkAnswer();
});

document.addEventListener('click', () => {
  if (!G.over) typeInput.focus();
});

// ── WORD DISPLAY ─────────────────────────────────────────────────────────────
function renderWord(prompt) {
  if (MODE === 'typing') {
    wordBoxes.innerHTML = prompt.split('').map(ch =>
      `<span class="lbox">${ch}</span>`
    ).join('');
    qHint.textContent = 'Type the word above!';
  } else {
    wordBoxes.innerHTML = `<span class="math-q">${prompt}</span>`;
    qHint.textContent   = 'Type the answer, then press Enter.';
  }
}

function updateLetterBoxes(typed) {
  const boxes  = wordBoxes.querySelectorAll('.lbox');
  const target = G.question.answer;
  boxes.forEach((box, i) => {
    box.classList.remove('hit', 'miss');
    if (i < typed.length)
      box.classList.add(typed[i] === target[i] ? 'hit' : 'miss');
  });
}

// ── QUESTIONS ────────────────────────────────────────────────────────────────
function nextQuestion() {
  let q, tries = 0;
  do {
    q = MODE === 'math' ? makeMath(G.level) : makeTyping(G.level);
    tries++;
  } while (tries < 8 && q.answer === G.prevAnswer);
  G.question   = q;
  G.prevAnswer = q.answer;
  typeInput.value = '';
  renderWord(q.prompt);
  typeInput.focus();
}

function checkAnswer() {
  if (!G.question || G.over) return;
  const t = typeInput.value.toLowerCase().trim();
  if (t === G.question.answer) onCorrect();
  else if (t.length > 0)      onWrong();
}

function onCorrect() {
  G.score++;
  G.streak++;
  G.burst = Math.min(G.burst + 190, 320);
  G.gap   = Math.min(700, G.gap + 75);
  typeInput.classList.add('flash-ok');
  setTimeout(() => typeInput.classList.remove('flash-ok'), 260);
  updateHUD();
  if (G.streak >= G.streakNeeded) levelUp();
  else nextQuestion();
}

function onWrong() {
  G.gap = Math.max(0, G.gap - 40);
  typeInput.classList.add('flash-bad');
  setTimeout(() => {
    typeInput.classList.remove('flash-bad');
    typeInput.value = '';
    if (MODE === 'typing') updateLetterBoxes('');
    typeInput.focus();
  }, 310);
}

// ── LEVEL UP ─────────────────────────────────────────────────────────────────
function levelUp() {
  G.streak    = 0;
  G.level++;
  G.decay     = 13 + (G.level - 1) * 5;
  G.charSpeed = 128 + (G.level - 1) * 10;
  G.gap       = Math.min(700, G.gap + 90);
  G.splashing = true;

  const d = DANGERS[dangerIdx(G.level)];
  levelFlTxt.innerHTML =
    `🎉 LEVEL ${G.level}!<br><small>Watch out for the ${d.name}!</small>`;
  levelFlash.classList.remove('hidden');
  updateHUD();

  setTimeout(() => {
    levelFlash.classList.add('hidden');
    G.splashing = false;
    nextQuestion();
    typeInput.focus();
  }, 1900);
}

function updateHUD() {
  hudLevel.textContent  = `Level ${G.level}`;
  hudScore.textContent  = `⭐ ${G.score}`;
  hudStreak.textContent = `🔥 ${G.streak} / ${G.streakNeeded}`;
}

// ── DRAWING ──────────────────────────────────────────────────────────────────

function drawSky() {
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0,    '#0d47a1');
  grad.addColorStop(0.4,  '#1976D2');
  grad.addColorStop(0.75, '#42A5F5');
  grad.addColorStop(1,    '#B3E5FC');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y + 4);

  // Sun
  const sx = W * 0.84, sy = HUD_H + 52;
  ctx.save();
  ctx.shadowColor = 'rgba(255,235,59,0.5)';
  ctx.shadowBlur  = 38;
  ctx.fillStyle   = '#FFF176';
  ctx.beginPath(); ctx.arc(sx, sy, 40, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = 'rgba(255,238,88,0.28)';
  ctx.lineWidth   = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * 50, sy + Math.sin(a) * 50);
    ctx.lineTo(sx + Math.cos(a) * 76, sy + Math.sin(a) * 76);
    ctx.stroke();
  }
  ctx.restore();

  // Three drifting clouds (2% parallax)
  const cs = G.scrollX * 0.02;
  const cw = W + 300;
  drawCloud(((W * 0.08 - cs) % cw + cw) % cw - 150, HUD_H + 30, 110, 32);
  drawCloud(((W * 0.45 - cs) % cw + cw) % cw - 150, HUD_H + 15, 140, 42);
  drawCloud(((W * 0.74 - cs) % cw + cw) % cw - 150, HUD_H + 42, 88, 26);
}

function drawCloud(x, y, w, h) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath(); ctx.ellipse(x,          y,          w,        h,        0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - w * 0.3, y + h * 0.18, w * 0.56, h * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + w * 0.32, y + h * 0.15, w * 0.52, h * 0.72, 0, 0, Math.PI * 2); ctx.fill();
}

function drawMountains() {
  const scroll  = G.scrollX * 0.06;
  const period  = 620;
  const startI  = Math.floor(scroll / period) - 1;
  const count   = Math.ceil(W / period) + 3;

  for (let i = startI; i < startI + count; i++) {
    const bx = i * period + sr(i + 10) * 160 - 80 - scroll;
    const bh = 85  + sr(i + 20) * 90;
    const bw = 320 + sr(i + 30) * 200;
    const lit = 34 + sr(i + 40) * 12;
    ctx.fillStyle = `hsl(214,20%,${lit}%)`;
    ctx.beginPath();
    ctx.moveTo(bx - bw / 2, GROUND_Y);
    ctx.quadraticCurveTo(bx, GROUND_Y - bh, bx + bw / 2, GROUND_Y);
    ctx.fill();
    // Snow
    ctx.fillStyle = 'rgba(220,235,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(bx - bw * 0.11, GROUND_Y - bh * 0.67);
    ctx.quadraticCurveTo(bx, GROUND_Y - bh, bx + bw * 0.11, GROUND_Y - bh * 0.67);
    ctx.fill();
  }
}

function drawTree(x, h, far) {
  const tH = h * 0.36, tW = Math.max(6, h * 0.09), lR = h * 0.35;
  ctx.fillStyle = far ? '#4E342E' : '#5D4037';
  ctx.fillRect(x - tW / 2, GROUND_Y - tH, tW, tH);
  ctx.fillStyle = far ? '#1B5E20' : '#2E7D32';
  ctx.beginPath(); ctx.arc(x, GROUND_Y - tH - lR * 0.55, lR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = far ? '#246226' : '#388E3C';
  ctx.beginPath(); ctx.arc(x - lR * 0.25, GROUND_Y - tH - lR * 0.72, lR * 0.58, 0, Math.PI * 2); ctx.fill();
}

function drawTreeLayer(parallax, spacing, seed, far) {
  const scroll = G.scrollX * parallax;
  const startI = Math.floor(scroll / spacing) - 1;
  const count  = Math.ceil(W / spacing) + 3;
  for (let i = startI; i < startI + count; i++) {
    const sx = i * spacing + sr(i + seed) * spacing * 0.55 - spacing * 0.27 - scroll;
    if (sx < -160 || sx > W + 120) continue;
    const h = (far ? 52 : 88) + sr(i + seed + 1) * 55;
    drawTree(sx, h, far);
  }
}

function drawGround() {
  const grad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  grad.addColorStop(0,    '#558B2F');
  grad.addColorStop(0.12, '#33691E');
  grad.addColorStop(1,    '#1B5E20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // Grass edge highlight
  ctx.fillStyle = '#76C442';
  ctx.fillRect(0, GROUND_Y - 3, W, 10);

  // Scrolling ground details
  const scroll = G.scrollX;
  const sp     = 88;
  const startI = Math.floor(scroll / sp) - 1;
  const count  = Math.ceil(W / sp) + 3;

  for (let i = startI; i < startI + count; i++) {
    const sx = i * sp + sr(i + 900) * 38 - scroll;
    if (sx < -40 || sx > W + 40) continue;
    const t = sr(i + 1000);
    if (t < 0.33) {
      // Grass tufts
      ctx.fillStyle = '#66BB6A';
      ctx.fillRect(sx,     GROUND_Y - 5, 3, 9);
      ctx.fillRect(sx + 5, GROUND_Y - 3, 3, 7);
      ctx.fillRect(sx + 10,GROUND_Y - 4, 3, 8);
    } else if (t < 0.62) {
      // Flowers
      ctx.fillStyle = `hsl(${Math.floor(sr(i + 1100) * 60)},88%,58%)`;
      ctx.beginPath(); ctx.arc(sx, GROUND_Y - 9, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(sx - 1, GROUND_Y - 9, 2, 10);
    } else {
      // Pebble
      ctx.fillStyle = '#78909C';
      ctx.beginPath(); ctx.ellipse(sx, GROUND_Y - 3, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Worn dirt track under the characters
  ctx.fillStyle = 'rgba(150,110,50,0.22)';
  ctx.fillRect(0, GROUND_Y + 4, W, 24);
}

function drawSpeedLines() {
  if (G.burst < 60) return;
  const alpha = Math.min(G.burst / 320, 1) * 0.35;
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  ctx.lineWidth   = 1.5;
  for (let i = 0; i < 8; i++) {
    const y  = GROUND_Y - 100 - sr(i + 300) * 120;
    const x1 = CHAR_X - 80 - sr(i + 400) * 60;
    const len = 30 + sr(i + 500) * 50;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x1 - len, y);
    ctx.stroke();
  }
}

function drawCharacter(emoji, x, bounceY, speed, leanForward) {
  ctx.save();
  const lean = leanForward ? -Math.min(speed / 380, 0.2) : 0;
  ctx.translate(x, GROUND_Y + bounceY);
  ctx.rotate(lean);
  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.beginPath();
  ctx.ellipse(leanForward ? 12 : 0, 4, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.font         = '64px serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

function drawDangerGlow(chaserX, bounceY) {
  if (G.gap >= 180) return;
  const intensity = 1 - G.gap / 180;
  ctx.save();
  ctx.globalAlpha  = intensity * 0.55;
  ctx.shadowColor  = '#f44336';
  ctx.shadowBlur   = 50;
  ctx.font         = '64px serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(DANGERS[dangerIdx(G.level)].emoji, chaserX, GROUND_Y + bounceY);
  ctx.restore();

  // Screen flash when very close
  if (G.gap < 60) {
    ctx.fillStyle = `rgba(244,67,54,${(1 - G.gap / 60) * 0.12})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function drawDangerBar() {
  const maxGap  = 500;
  const safeFrac = Math.max(0, Math.min(1, G.gap / maxGap));
  const bw      = Math.min(W * 0.46, 380);
  const bh      = 11;
  const bx      = (W - bw) / 2;
  const by      = GROUND_Y + 38;

  // Track bg
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, bw + 4, bh + 4, 7); ctx.fill();

  // Gradient track (red→orange→green)
  const trackGrad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  trackGrad.addColorStop(0,    '#f44336');
  trackGrad.addColorStop(0.35, '#ff9800');
  trackGrad.addColorStop(1,    '#4caf50');
  ctx.fillStyle = trackGrad;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.fill();

  // Dark overlay from left (hides the "safe" green portion proportional to danger)
  ctx.fillStyle = 'rgba(0,0,0,0.68)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw * (1 - safeFrac), bh, [5, 0, 0, 5]); ctx.fill();

  // Labels
  ctx.font      = 'bold 10px Nunito, sans-serif';
  ctx.fillStyle = '#ef9a9a';
  ctx.textAlign = 'left';
  ctx.fillText('⚠ DANGER', bx, by - 3);
  ctx.fillStyle = '#a5d6a7';
  ctx.textAlign = 'right';
  ctx.fillText('SAFE ✅', bx + bw, by - 3);
}

function drawScene() {
  ctx.clearRect(0, 0, W, H);
  drawSky();
  drawMountains();
  drawTreeLayer(0.22, 215, 200, true);   // far trees
  drawTreeLayer(0.55, 265, 500, false);  // near trees
  drawGround();
  drawSpeedLines();

  const danger   = DANGERS[dangerIdx(G.level)];
  const chaserX  = CHAR_X - G.gap;
  const chaserBy = BOUNCE[chasF];
  const charBy   = BOUNCE[animF];
  const totalSpd = G.charSpeed + G.burst;

  // Chaser (only if on screen)
  if (chaserX > -100) {
    drawDangerGlow(chaserX, chaserBy);
    drawCharacter(danger.emoji, chaserX, chaserBy, G.decay, false);
  }

  // Player character
  drawCharacter(CHAR_DATA[CHAR].emoji, CHAR_X, charBy, totalSpd, true);

  drawDangerBar();
}

// ── GAME LOOP ────────────────────────────────────────────────────────────────
function loop(ts) {
  if (G.over) return;
  if (!G.lastT) G.lastT = ts;
  const dt = Math.min((ts - G.lastT) / 1000, 0.08);
  G.lastT = ts;

  // Advance run animation — faster when bursting
  const totalSpd = G.charSpeed + G.burst;
  const animInterval = 0.082 * (130 / Math.max(totalSpd, 50));
  animT += dt;
  if (animT >= animInterval) { animT -= animInterval; animF = (animF + 1) % BOUNCE.length; }

  const chaserInterval = 0.082 * (13 / Math.max(G.decay, 6));
  chasT += dt;
  if (chasT >= chaserInterval) { chasT -= chaserInterval; chasF = (chasF + 1) % BOUNCE.length; }

  if (!G.splashing) {
    G.scrollX += totalSpd * dt;
    G.burst    = Math.max(0, G.burst - G.burstDecay * dt);
    G.gap     -= G.decay * dt;
    if (G.gap <= 0) { G.gap = 0; endGame(); return; }
    if (G.gap >  700) G.gap = 700;
  }

  drawScene();
  G.raf = requestAnimationFrame(loop);
}

// ── GAME OVER ────────────────────────────────────────────────────────────────
function endGame() {
  G.over = true;
  if (G.raf) cancelAnimationFrame(G.raf);
  drawScene();

  const d = DANGERS[dangerIdx(G.level)];
  document.getElementById('go-emoji').textContent  = CHAR_DATA[CHAR].emoji;
  document.getElementById('go-danger').textContent = `The ${d.name} caught you!`;
  document.getElementById('go-stats').innerHTML = `
    <div class="stat"><span>Score</span>        <strong>${G.score}</strong></div>
    <div class="stat"><span>Level Reached</span><strong>${G.level}</strong></div>
    <div class="stat"><span>Mode</span>         <strong>${MODE === 'math' ? '🔢 Math' : '⌨️ Typing'}</strong></div>
  `;
  overScreen.classList.remove('hidden');
}

// ── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  G.level = 1; G.score = 0; G.streak = 0;
  G.scrollX = 0; G.charSpeed = 130; G.burst = 0;
  G.gap   = Math.round(W * 0.20);
  G.decay = 15; G.over = false; G.splashing = false;
  G.lastT = null; G.question = null; G.prevAnswer = null;

  updateHUD();
  nextQuestion();
  G.raf = requestAnimationFrame(loop);
  setTimeout(() => typeInput.focus(), 80);
}

init();
