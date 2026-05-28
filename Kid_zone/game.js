'use strict';

// ── DATA ─────────────────────────────────────────────────────────────────────

const CHARS = {
  bunny: { emoji: '🐰', name: 'Benny Bunny' },
  bear:  { emoji: '🐻', name: 'Bruno Bear'  },
};

// Danger escalates every 2 levels
const DANGERS = [
  { emoji: '🦊', name: 'a sneaky Fox'        },  // L 1-2
  { emoji: '🐺', name: 'a howling Wolf'       },  // L 3-4
  { emoji: '👾', name: 'a Space Monster'      },  // L 5-6
  { emoji: '🌪️', name: 'a twisting Tornado'  },  // L 7-8
  { emoji: '🔥', name: 'a blazing Fireball'   },  // L 9-10
  { emoji: '🌋', name: 'a rumbling Volcano'   },  // L 11+
];

// Words organised by level (0-indexed, capped at last list)
const WORDS = [
  /* L1 */ ['cat','dog','hat','run','hop','sit','big','fun','red','box','sun','map','top','cup'],
  /* L2 */ ['jump','frog','bear','bird','duck','fish','bark','swim','play','fast','drum','kite'],
  /* L3 */ ['bunny','happy','funny','candy','juice','brave','fresh','sweet','dance','storm','prize'],
  /* L4 */ ['turtle','rabbit','carrot','joyful','spring','bright','forest','dragon','castle','splash'],
  /* L5 */ ['rainbow','chicken','dolphin','pumpkin','morning','journey','lantern','feather','thunder'],
  /* L6 */ ['computer','elephant','birthday','umbrella','princess','treasure','mountain','sunshine'],
  /* L7 */ ['adventure','chocolate','butterfly','fantastic','fireworks','happiness','strawberry'],
];

// ── QUESTION GENERATORS ──────────────────────────────────────────────────────

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeMath(level) {
  let a, b, op, ans;
  if (level <= 2) {
    a = rand(1, 10); b = rand(1, 10); op = '+'; ans = a + b;
  } else if (level <= 4) {
    if (Math.random() < 0.5) {
      a = rand(5, 25); b = rand(1, a); op = '−'; ans = a - b;
    } else {
      a = rand(1, 20); b = rand(1, 20); op = '+'; ans = a + b;
    }
  } else if (level <= 6) {
    a = rand(1, 10); b = rand(2, 5); op = '×'; ans = a * b;
  } else {
    const r = Math.random();
    if (r < 0.4)      { a = rand(2, 12); b = rand(2, 12); op = '×'; ans = a * b; }
    else if (r < 0.7) { a = rand(1, 50); b = rand(1, 50); op = '+'; ans = a + b; }
    else              { a = rand(15, 70); b = rand(1, a); op = '−'; ans = a - b;  }
  }
  return { prompt: `${a} ${op} ${b} = ?`, answer: String(ans) };
}

function makeTyping(level) {
  const list = WORDS[Math.min(level - 1, WORDS.length - 1)];
  const word = list[rand(0, list.length - 1)];
  return { prompt: word.toUpperCase(), answer: word.toLowerCase() };
}

function dangerForLevel(level) {
  return DANGERS[Math.min(Math.floor((level - 1) / 2), DANGERS.length - 1)];
}

// ── STATE ────────────────────────────────────────────────────────────────────

const G = {
  screen:       'char',
  character:    null,
  mode:         null,
  level:        1,
  score:        0,
  streak:       0,
  streakNeeded: 10,
  gap:          78,    // 0–100: 100 = chaser far away, 0 = caught
  speed:        0.28,  // gap units lost per second
  raf:          null,
  lastT:        null,
  question:     null,
  prevAnswer:   null,
  splashing:    false, // level-up animation playing
};

// ── DOM HELPERS ──────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);
const screenEls = {
  char: $('screen-char'),
  mode: $('screen-mode'),
  game: $('screen-game'),
  over: $('screen-over'),
};

function show(name) {
  Object.values(screenEls).forEach(s => s.classList.remove('active'));
  screenEls[name].classList.add('active');
  G.screen = name;
}

// ── CHARACTER SELECT ─────────────────────────────────────────────────────────

document.querySelectorAll('#screen-char .pick-card').forEach(card => {
  card.addEventListener('click', () => {
    G.character = card.dataset.pick;
    const ch = CHARS[G.character];
    $('mode-greeting').textContent = `You picked ${ch.name} ${ch.emoji}!`;
    show('mode');
  });
});

// ── MODE SELECT ──────────────────────────────────────────────────────────────

document.querySelectorAll('#screen-mode .pick-card').forEach(card => {
  card.addEventListener('click', () => {
    G.mode = card.dataset.pick;
    startGame();
  });
});

$('btn-back-char').addEventListener('click', () => show('char'));

// ── GAME OVER BUTTONS ────────────────────────────────────────────────────────

$('btn-retry').addEventListener('click', () => show('mode'));
$('btn-menu').addEventListener('click', () => show('char'));

// ── INPUT HANDLING ───────────────────────────────────────────────────────────

const qInput = $('q-input');

qInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') checkAnswer();
});

// Typing mode: live letter colouring + auto-advance on full match
qInput.addEventListener('input', () => {
  if (G.mode !== 'typing' || !G.question) return;
  updateLetterBoxes(qInput.value.toLowerCase());
  if (qInput.value.toLowerCase() === G.question.answer) checkAnswer();
});

// Keep focus on input while playing
document.addEventListener('click', () => {
  if (G.screen === 'game') qInput.focus();
});

// ── LETTER BOXES ─────────────────────────────────────────────────────────────

function renderLetterBoxes(word) {
  $('q-display').innerHTML = word.split('').map(ch =>
    `<span class="lbox">${ch}</span>`
  ).join('');
}

function updateLetterBoxes(typed) {
  const boxes = $('q-display').querySelectorAll('.lbox');
  const target = G.question.answer;
  boxes.forEach((box, i) => {
    box.classList.remove('hit', 'miss');
    if (i < typed.length) {
      box.classList.add(typed[i] === target[i] ? 'hit' : 'miss');
    }
  });
}

// ── QUESTION MANAGEMENT ──────────────────────────────────────────────────────

function nextQuestion() {
  let q, tries = 0;
  do {
    q = G.mode === 'math' ? makeMath(G.level) : makeTyping(G.level);
    tries++;
  } while (tries < 8 && q.answer === G.prevAnswer);

  G.question   = q;
  G.prevAnswer = q.answer;
  qInput.value = '';

  if (G.mode === 'typing') {
    renderLetterBoxes(q.prompt);
    $('q-hint').textContent = 'Type the word above!';
  } else {
    $('q-display').textContent = q.prompt;
    $('q-hint').textContent = 'Type the answer, then press Enter.';
  }
  qInput.focus();
}

function checkAnswer() {
  if (!G.question || G.screen !== 'game') return;
  const typed = qInput.value.toLowerCase().trim();
  if (typed === G.question.answer) {
    onCorrect();
  } else if (typed.length > 0) {
    onWrong();
  }
}

function onCorrect() {
  G.score++;
  G.streak++;
  G.gap = Math.min(100, G.gap + 22);

  qInput.classList.add('flash-ok');
  setTimeout(() => qInput.classList.remove('flash-ok'), 300);
  updateHUD();

  if (G.streak >= G.streakNeeded) levelUp();
  else nextQuestion();
}

function onWrong() {
  G.gap = Math.max(0, G.gap - 12);
  qInput.classList.add('flash-bad');
  setTimeout(() => {
    qInput.classList.remove('flash-bad');
    qInput.value = '';
    if (G.mode === 'typing') updateLetterBoxes('');
    qInput.focus();
  }, 320);
}

// ── LEVEL UP ─────────────────────────────────────────────────────────────────

function levelUp() {
  G.streak    = 0;
  G.level++;
  G.speed     = 0.25 + (G.level - 1) * 0.09;
  G.gap       = Math.min(100, G.gap + 28);
  G.splashing = true;

  const d = dangerForLevel(G.level);
  $('chaser-emoji').textContent = d.emoji;

  const splash = $('level-splash');
  $('level-splash-text').innerHTML =
    `🎉 Level ${G.level}!<br><small style="font-size:0.55em">Watch out for ${d.name}!</small>`;
  splash.classList.add('show');

  updateHUD();
  setTimeout(() => {
    splash.classList.remove('show');
    G.splashing = false;
    nextQuestion();
    qInput.focus();
  }, 1800);
}

// ── HUD ──────────────────────────────────────────────────────────────────────

function updateHUD() {
  $('hud-level').textContent  = `Level ${G.level}`;
  $('hud-score').textContent  = `⭐ ${G.score}`;
  $('hud-streak').textContent = `🔥 ${G.streak} / ${G.streakNeeded}`;
}

// ── VISUAL UPDATE ─────────────────────────────────────────────────────────────

function updateScene() {
  // Chaser position: gap 100 → left 82%; gap 0 → left 18% (same as runner)
  const chaserLeft = 18 + (G.gap / 100) * 64;
  $('chaser').style.left = `${chaserLeft}%`;

  // Gap bar: dark overlay covers from the right; less gap = more covered
  $('gap-fill').style.width = `${100 - G.gap}%`;

  // Panic glow on chaser when close
  if (G.gap < 22) {
    const glow = Math.round((22 - G.gap) * 1.4);
    $('chaser').style.filter = `drop-shadow(0 0 ${glow}px #ff1744)`;
    $('chaser').style.animationDuration = '0.2s';
  } else {
    $('chaser').style.filter = '';
    $('chaser').style.animationDuration = '';
  }
}

// ── GAME LOOP ─────────────────────────────────────────────────────────────────

function gameLoop(ts) {
  if (G.screen !== 'game') return;

  if (G.lastT === null) G.lastT = ts;
  const dt = Math.min((ts - G.lastT) / 1000, 0.1); // cap dt at 100ms
  G.lastT = ts;

  if (!G.splashing) {
    G.gap -= G.speed * dt;
  }

  if (G.gap <= 0) {
    G.gap = 0;
    gameOver();
    return;
  }
  if (G.gap > 100) G.gap = 100;

  updateScene();
  G.raf = requestAnimationFrame(gameLoop);
}

// ── START GAME ────────────────────────────────────────────────────────────────

function startGame() {
  if (G.raf) cancelAnimationFrame(G.raf);

  G.level      = 1;
  G.score      = 0;
  G.streak     = 0;
  G.gap        = 78;
  G.speed      = 0.28;
  G.lastT      = null;
  G.question   = null;
  G.prevAnswer = null;
  G.splashing  = false;

  $('runner-emoji').textContent = CHARS[G.character].emoji;
  $('chaser-emoji').textContent = dangerForLevel(1).emoji;

  updateHUD();
  updateScene();
  show('game');
  nextQuestion();

  G.raf = requestAnimationFrame(gameLoop);
  setTimeout(() => qInput.focus(), 80);
}

// ── GAME OVER ─────────────────────────────────────────────────────────────────

function gameOver() {
  if (G.raf) cancelAnimationFrame(G.raf);
  G.raf = null;

  const danger = dangerForLevel(G.level);
  $('over-emoji').textContent = CHARS[G.character].emoji;
  $('over-flavor').textContent = `${danger.name} caught you!`;
  $('over-stats').innerHTML = `
    <div class="stat"><span class="sl">Score</span> <span class="sv">${G.score}</span></div>
    <div class="stat"><span class="sl">Level Reached</span> <span class="sv">${G.level}</span></div>
    <div class="stat"><span class="sl">Mode</span> <span class="sv">${G.mode === 'math' ? '🔢 Math' : '⌨️ Typing'}</span></div>
  `;
  show('over');
}
