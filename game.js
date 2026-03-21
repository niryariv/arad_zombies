const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const healthEl = document.getElementById("health");
const waveEl = document.getElementById("wave");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const hintEl = document.getElementById("hint");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = HEIGHT - 92;
const GRAVITY = 1800;
const PLAYER_SPEED = 220;
const JUMP_FORCE = 650;
const ZOMBIE_BASE_SPEED = 70;

const keys = new Set();

const state = {
  player: null,
  zombies: [],
  shots: [],
  particles: [],
  floatingTexts: [],
  wave: 1,
  score: 0,
  time: 0,
  gameOver: false,
  spawnTimer: 0,
  invulnerableTimer: 0,
  gesture: {
    active: false,
    points: [],
    progress: 0,
    cooldown: 0,
  },
};

const platforms = [
  { x: 0, y: GROUND_Y, width: WIDTH, height: HEIGHT - GROUND_Y },
  { x: 90, y: 340, width: 210, height: 22 },
  { x: 335, y: 282, width: 160, height: 22 },
  { x: 575, y: 248, width: 170, height: 22 },
  { x: 770, y: 330, width: 120, height: 22 },
];

function createPlayer() {
  return {
    x: 160,
    y: 220,
    width: 26,
    height: 54,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    hp: 3,
    shootFlash: 0,
  };
}

function resetGame() {
  state.player = createPlayer();
  state.zombies = [];
  state.shots = [];
  state.particles = [];
  state.floatingTexts = [];
  state.wave = 1;
  state.score = 0;
  state.time = 0;
  state.gameOver = false;
  state.spawnTimer = 1;
  state.invulnerableTimer = 0;
  state.gesture.active = false;
  state.gesture.points = [];
  state.gesture.progress = 0;
  state.gesture.cooldown = 0;
  setStatus("שורד");
  setHint('בצעו מחוות "אקדח": גרירה ימינה ואז למעלה.');
  syncHud();
}

function syncHud() {
  healthEl.textContent = String(state.player.hp);
  waveEl.textContent = String(state.wave);
  scoreEl.textContent = String(state.score);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setHint(text) {
  hintEl.textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function spawnZombie() {
  const side = Math.random() < 0.5 ? -1 : 1;
  const speed = ZOMBIE_BASE_SPEED + state.wave * 8 + Math.random() * 26;
  state.zombies.push({
    x: side < 0 ? -40 : WIDTH + 40,
    y: GROUND_Y - 56,
    width: 28,
    height: 56,
    vx: side < 0 ? speed : -speed,
    vy: 0,
    speed,
    hp: 1 + Math.floor(state.wave / 3),
    tint: Math.random() < 0.5 ? "#9df57a" : "#89ffd2",
  });
}

function fireShot() {
  if (state.gameOver || state.gesture.cooldown > 0) {
    return;
  }

  const { player } = state;
  state.shots.push({
    x: player.x + player.width / 2 + player.facing * 18,
    y: player.y + 18,
    vx: player.facing * 520,
    width: 18,
    height: 6,
    ttl: 0.55,
  });
  player.shootFlash = 0.12;
  state.gesture.cooldown = 0.4;
  setHint("ירייה בוצעה. שוב גרירה ימינה ואז למעלה.");
}

function addExplosion(x, y, color) {
  for (let i = 0; i < 12; i += 1) {
    const angle = (Math.PI * 2 * i) / 12;
    const speed = 70 + Math.random() * 90;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      ttl: 0.45 + Math.random() * 0.15,
      color,
      size: 4 + Math.random() * 3,
    });
  }
}

function addFloatingText(x, y, text, color) {
  state.floatingTexts.push({ x, y, text, color, ttl: 0.8 });
}

function damagePlayer() {
  if (state.invulnerableTimer > 0 || state.gameOver) {
    return;
  }

  state.player.hp -= 1;
  state.invulnerableTimer = 1.25;
  addFloatingText(state.player.x, state.player.y - 12, "-1", "#ff5d73");
  syncHud();

  if (state.player.hp <= 0) {
    state.gameOver = true;
    setStatus("האפלה");
    setHint("R כדי להתחיל מחדש.");
  } else {
    setStatus("נפגע");
  }
}

function jumpPlayer() {
  if (state.player.onGround && !state.gameOver) {
    state.player.vy = -JUMP_FORCE;
    state.player.onGround = false;
  }
}

function updatePlayer(dt) {
  const { player } = state;
  const moveLeft = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
  const moveRight = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
  const desired = Number(moveRight) - Number(moveLeft);

  player.vx = desired * PLAYER_SPEED;
  if (desired !== 0) {
    player.facing = desired;
  }

  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.x = clamp(player.x, 0, WIDTH - player.width);
  player.onGround = false;

  for (const platform of platforms) {
    const playerFeet = player.y + player.height;
    const previousFeet = playerFeet - player.vy * dt;
    const landed =
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width &&
      previousFeet <= platform.y &&
      playerFeet >= platform.y;

    if (landed) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.onGround = true;
    }
  }

  if (player.y > HEIGHT + 120) {
    damagePlayer();
    player.x = 160;
    player.y = 220;
    player.vx = 0;
    player.vy = 0;
  }

  player.shootFlash = Math.max(0, player.shootFlash - dt);
}

function updateZombies(dt) {
  const { player } = state;

  for (const zombie of state.zombies) {
    const direction = zombie.x < player.x ? 1 : -1;
    zombie.vx = direction * zombie.speed;
    zombie.vy += GRAVITY * dt;
    zombie.x += zombie.vx * dt;
    zombie.y += zombie.vy * dt;

    for (const platform of platforms) {
      const feet = zombie.y + zombie.height;
      const previousFeet = feet - zombie.vy * dt;
      const landed =
        zombie.x + zombie.width > platform.x &&
        zombie.x < platform.x + platform.width &&
        previousFeet <= platform.y &&
        feet >= platform.y;

      if (landed) {
        zombie.y = platform.y - zombie.height;
        zombie.vy = 0;
      }
    }

    if (rectsOverlap(player, zombie)) {
      damagePlayer();
    }
  }

  state.zombies = state.zombies.filter((zombie) => zombie.x > -120 && zombie.x < WIDTH + 120);
}

function updateShots(dt) {
  for (const shot of state.shots) {
    shot.x += shot.vx * dt;
    shot.ttl -= dt;
  }

  for (const shot of state.shots) {
    for (const zombie of state.zombies) {
      if (shot.ttl <= 0) {
        continue;
      }

      if (rectsOverlap(shot, zombie)) {
        zombie.hp -= 1;
        shot.ttl = 0;
        addExplosion(shot.x, shot.y, "#ffb347");

        if (zombie.hp <= 0) {
          zombie.dead = true;
          state.score += 1;
          addFloatingText(zombie.x, zombie.y - 8, "+1", "#8fff96");
          addExplosion(zombie.x + zombie.width / 2, zombie.y + 20, zombie.tint);
          syncHud();
          if (state.score > 0 && state.score % 6 === 0) {
            state.wave += 1;
            setStatus(`גל ${state.wave}`);
            syncHud();
          }
        }
      }
    }
  }

  state.shots = state.shots.filter(
    (shot) => shot.ttl > 0 && shot.x > -40 && shot.x < WIDTH + 40,
  );
  state.zombies = state.zombies.filter((zombie) => !zombie.dead);
}

function updateEffects(dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 260 * dt;
    particle.ttl -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.ttl > 0);

  for (const text of state.floatingTexts) {
    text.y -= 32 * dt;
    text.ttl -= dt;
  }
  state.floatingTexts = state.floatingTexts.filter((text) => text.ttl > 0);

  state.invulnerableTimer = Math.max(0, state.invulnerableTimer - dt);
  state.gesture.cooldown = Math.max(0, state.gesture.cooldown - dt);
}

function updateSpawns(dt) {
  if (state.gameOver) {
    return;
  }

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnZombie();
    const min = Math.max(0.55, 1.9 - state.wave * 0.12);
    const max = Math.max(0.95, 2.8 - state.wave * 0.1);
    state.spawnTimer = min + Math.random() * (max - min);
  }
}

function trackGesturePoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * WIDTH;
  const y = ((clientY - rect.top) / rect.height) * HEIGHT;
  const points = state.gesture.points;
  const last = points[points.length - 1];

  if (!last || Math.hypot(x - last.x, y - last.y) > 14) {
    points.push({ x, y });
  }

  const start = points[0];
  if (!start) {
    return;
  }

  const dx = x - start.x;
  const dy = y - start.y;

  if (state.gesture.progress === 0 && dx > 60 && Math.abs(dy) < 40) {
    state.gesture.progress = 1;
    setHint("מעולה. עכשיו גררו למעלה כדי להשלים את תנועת האקדח.");
  } else if (state.gesture.progress === 1 && dx > 45 && dy < -55) {
    fireShot();
    state.gesture.progress = 2;
  }
}

function beginGesture(clientX, clientY) {
  state.gesture.active = true;
  state.gesture.points = [];
  state.gesture.progress = 0;
  trackGesturePoint(clientX, clientY);
}

function moveGesture(clientX, clientY) {
  if (!state.gesture.active) {
    return;
  }
  trackGesturePoint(clientX, clientY);
}

function endGesture() {
  state.gesture.active = false;
  state.gesture.points = [];
  if (state.gesture.progress < 2) {
    setHint('המחווה לא הושלמה. נסו שוב: ימינה ואז למעלה.');
  }
  state.gesture.progress = 0;
}

function drawPixelFigure(x, y, palette, mirrored = false) {
  const pixels = [
    [2, 0, 3, 3, palette.skin],
    [2, 3, 3, 2, palette.hair],
    [1, 5, 5, 4, palette.shirt],
    [0, 9, 2, 4, palette.pants],
    [4, 9, 2, 4, palette.pants],
    [0, 13, 2, 3, palette.boots],
    [4, 13, 2, 3, palette.boots],
    [5, 6, 2, 2, palette.arm],
  ];

  ctx.save();
  ctx.translate(x, y);
  if (mirrored) {
    ctx.scale(-1, 1);
    ctx.translate(-24, 0);
  }
  for (const [px, py, pw, ph, color] of pixels) {
    ctx.fillStyle = color;
    ctx.fillRect(px * 3, py * 3, pw * 3, ph * 3);
  }
  ctx.restore();
}

function drawBackground(time) {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#251333");
  sky.addColorStop(0.55, "#120b20");
  sky.addColorStop(1, "#06050a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#472c68";
  for (let i = 0; i < 7; i += 1) {
    const x = i * 170 - 30;
    const h = 100 + ((i % 3) * 28);
    ctx.fillRect(x, GROUND_Y - h - 30, 90, h);
    ctx.fillRect(x + 18, GROUND_Y - h - 80, 20, 50);
  }

  const riftY = 88 + Math.sin(time * 1.2) * 8;
  ctx.fillStyle = "#7ffff0";
  ctx.fillRect(650, riftY, 110, 8);
  ctx.fillRect(690, riftY - 18, 30, 20);

  ctx.fillStyle = "#1f7a72";
  for (let i = 0; i < 42; i += 1) {
    const x = (i * 61 + (time * 18) % 61) % WIDTH;
    const y = (i * 37) % 170;
    ctx.fillRect(x, y, 3, 3);
  }

  ctx.fillStyle = "#4d3e2a";
  for (const platform of platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "#90714a";
    ctx.fillRect(platform.x, platform.y, platform.width, 5);
    ctx.fillStyle = "#4d3e2a";
  }
}

function drawPlayer() {
  const { player } = state;
  const flash = state.invulnerableTimer > 0 && Math.floor(state.time * 14) % 2 === 0;
  if (!flash) {
    drawPixelFigure(
      player.x,
      player.y,
      {
        skin: "#f8c988",
        hair: "#23130b",
        shirt: "#6cc6ff",
        pants: "#f1e0a6",
        boots: "#54351a",
        arm: player.shootFlash > 0 ? "#ffb347" : "#f8c988",
      },
      player.facing < 0,
    );
  }

  if (player.shootFlash > 0) {
    ctx.fillStyle = "#ffef83";
    ctx.fillRect(
      player.x + (player.facing > 0 ? 28 : -10),
      player.y + 20,
      10,
      6,
    );
  }
}

function drawZombies() {
  for (const zombie of state.zombies) {
    drawPixelFigure(
      zombie.x,
      zombie.y,
      {
        skin: "#899a79",
        hair: "#2e3c26",
        shirt: zombie.tint,
        pants: "#5f3d73",
        boots: "#352220",
        arm: "#95a68c",
      },
      zombie.vx > 0,
    );
  }
}

function drawShots() {
  for (const shot of state.shots) {
    ctx.fillStyle = "#ffb347";
    ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
    ctx.fillStyle = "#fff5cf";
    ctx.fillRect(shot.x + 3, shot.y + 1, 6, 2);
  }
}

function drawEffects() {
  for (const particle of state.particles) {
    ctx.globalAlpha = clamp(particle.ttl / 0.6, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;

  ctx.font = '16px "Press Start 2P"';
  for (const text of state.floatingTexts) {
    ctx.globalAlpha = clamp(text.ttl / 0.8, 0, 1);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
  }
  ctx.globalAlpha = 1;
}

function drawGestureTrail() {
  const points = state.gesture.points;
  if (points.length < 2) {
    return;
  }

  ctx.strokeStyle = state.gesture.progress > 0 ? "#8fff96" : "#ffb347";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function drawOverlay() {
  if (!state.gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#f6edcf";
  ctx.textAlign = "center";
  ctx.font = '26px "Press Start 2P"';
  ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 22);
  ctx.font = '14px "Press Start 2P"';
  ctx.fillText(`Kills ${state.score}`, WIDTH / 2, HEIGHT / 2 + 24);
  ctx.fillText("Press R", WIDTH / 2, HEIGHT / 2 + 56);
  ctx.textAlign = "start";
}

function update(dt) {
  if (!state.gameOver) {
    updatePlayer(dt);
    updateZombies(dt);
    updateShots(dt);
    updateSpawns(dt);
  }
  updateEffects(dt);
}

function render() {
  drawBackground(state.time);
  drawZombies();
  drawPlayer();
  drawShots();
  drawEffects();
  drawGestureTrail();
  drawOverlay();
}

let lastFrame = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - lastFrame) / 1000);
  lastFrame = now;
  state.time += dt;

  update(dt);
  render();

  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "w", "W", " "].includes(event.key)) {
    jumpPlayer();
  }

  if (event.key === "r" || event.key === "R") {
    resetGame();
  }

  keys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

canvas.addEventListener("pointerdown", (event) => {
  beginGesture(event.clientX, event.clientY);
});

canvas.addEventListener("pointermove", (event) => {
  moveGesture(event.clientX, event.clientY);
});

canvas.addEventListener("pointerup", endGesture);
canvas.addEventListener("pointerleave", endGesture);
canvas.addEventListener("pointercancel", endGesture);

resetGame();
requestAnimationFrame(frame);
