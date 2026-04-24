const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const healthEl = document.getElementById("health");
const waveEl = document.getElementById("wave");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const hintEl = document.getElementById("hint");
const missionEl = document.getElementById("mission");
const modeOneEl = document.getElementById("mode-one");
const modeTwoEl = document.getElementById("mode-two");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = HEIGHT - 86;
const GRAVITY = 1850;
const PLAYER_SPEED = 230;
const JUMP_FORCE = 670;
const URL_PARAMS = new URLSearchParams(window.location.search);
const IMMORTAL_QUERY_ENABLED = ["1", "true", "on"].includes(URL_PARAMS.get("immortal") ?? URL_PARAMS.get("cheat") ?? "");
const CHEAT_CODE = ["KeyI", "KeyM", "KeyM", "KeyO", "KeyR", "KeyT", "KeyA", "KeyL"];

const keys = new Set();

const PLAYER_CONFIGS = [
  {
    id: 1,
    label: "שחקן 1",
    left: ["KeyA"],
    right: ["KeyD"],
    jump: ["KeyW"],
    shoot: ["KeyF", "Space"],
    palette: {
      skin: "#e7b88d",
      shadow: "#b98462",
      hair: "#7c4d32",
      shirt: "#597a95",
      shirtDark: "#40576c",
      pants: "#4c5875",
      boots: "#5a3e2d",
      coat: "#8b7264",
      coatDark: "#604e46",
      heart: "#e83e4d",
      empty: "#4e2529",
    },
  },
  {
    id: 2,
    label: "שחקן 2",
    left: ["ArrowLeft"],
    right: ["ArrowRight"],
    jump: ["ArrowUp"],
    shoot: ["Slash", "ShiftRight"],
    palette: {
      skin: "#ddb18a",
      shadow: "#ad7b5b",
      hair: "#36261f",
      shirt: "#5f8f73",
      shirtDark: "#456b56",
      pants: "#4f6382",
      boots: "#463529",
      coat: "#698a95",
      coatDark: "#4b626a",
      heart: "#4f7bff",
      empty: "#1f2d55",
    },
  },
];

const INTRO_STEPS = [
  {
    title: "יום רגיל בקדם ערד",
    text: "הילד יושב בכיתה עם החברים שלו, מול הלוח והמדבר שמחוץ לחלון.",
  },
  {
    title: "נפילה מהשמיים",
    text: "אור חייזרי פוגע בעיר. אנשים קופאים, מתעוותים, וקמים כזומבים.",
  },
  {
    title: "הבונקר",
    text: "הילד נכנס במקרה לבונקר עם עוד כמה ניצולים, אבל הזומבים מוצאים גם אותם.",
  },
  {
    title: "האדם האחרון",
    text: "כולם נופלים. עכשיו צריך לעבור דרך המקומות של ערד ולסגור את מקור הפלישה.",
  },
];

const STAGES = [
  {
    name: "גן",
    status: "בריחה",
    objective: "killGate",
    target: 5,
    scenery: "kindergarten",
    enemyName: "בובות זומבי",
    weaponName: "קוביות",
    weaponType: "blocks",
    hint: "חסלו 5 בובות זומבי שמטיחות קוביות בין הצעצועים.",
    platforms: [
      [84, 354, 178], [216, 316, 92], [338, 292, 136], [518, 256, 128], [728, 326, 136],
    ],
  },
  {
    name: "מרחב א-ג",
    status: "פינוי",
    objective: "killGate",
    target: 6,
    scenery: "agClass",
    enemyName: "חונכים זומבי",
    weaponName: "סרגלים",
    weaponType: "rulers",
    hint: "חסלו 6 חונכים זומבי שזורקים סרגלים מול הלוח.",
    platforms: [
      [62, 334, 118], [158, 300, 84], [270, 278, 116], [420, 248, 124], [596, 210, 128], [746, 286, 132],
    ],
  },
  {
    name: "מרחב ד-ו",
    status: "חיפוש",
    objective: "activate",
    target: 3,
    scenery: "dvClass",
    enemyName: "",
    weaponName: "",
    weaponType: "",
    hint: "אין זומבים כאן. מצאו 3 עמדות נשק והפעילו אותן כדי לצאת.",
    platforms: [
      [106, 344, 190], [310, 318, 92], [420, 286, 150], [620, 244, 176], [792, 300, 74],
    ],
  },
  {
    name: "תיכון",
    status: "הדיפה",
    objective: "killGate",
    target: 6,
    scenery: "highSchool",
    enemyName: "שחקני כדורסל",
    weaponName: "כדורי כדורסל",
    weaponType: "basketballs",
    hint: "שרדו מול שחקני כדורסל שזורקים כדורים במתחם הגדול.",
    platforms: [
      [88, 360, 188], [306, 322, 132], [500, 276, 142], [704, 222, 154], [718, 336, 128],
    ],
  },
  {
    name: "מגרש",
    status: "ספורט",
    objective: "killGate",
    target: 7,
    scenery: "football",
    enemyName: "שחקני כדורגל",
    weaponName: "כדורי רגל וכדורי סל",
    weaponType: "sports",
    hint: "חסלו שחקני כדורגל זומבים שזורקים כדורי רגל וכדורי סל.",
    platforms: [
      [96, 356, 168], [286, 316, 140], [502, 270, 148], [646, 248, 82], [716, 334, 148],
    ],
  },
  {
    name: "ספריה",
    status: "שקט",
    objective: "killGate",
    target: 5,
    scenery: "library",
    enemyName: "ספרנים זומבים",
    weaponName: "ספרים",
    weaponType: "books",
    hint: "הפילו 5 ספרנים זומבים שמחזיקים ספרים וזורקים אותם מבין המדפים.",
    platforms: [
      [92, 348, 130], [260, 308, 126], [446, 262, 126], [622, 220, 132], [784, 300, 92],
    ],
  },
  {
    name: "בריכת שחייה",
    status: "החלקה",
    objective: "killGate",
    target: 5,
    scenery: "pool",
    enemyName: "שחיינים זומבים",
    weaponName: "מים",
    weaponType: "water",
    hint: "חסלו 5 שחיינים זומבים שמשפריצים גלי מים מהבריכה.",
    platforms: [
      [72, 352, 136], [252, 324, 132], [440, 324, 132], [638, 292, 166], [808, 260, 64],
    ],
  },
  {
    name: "רובוטיקה",
    status: "קצר",
    objective: "destroy",
    target: 3,
    scenery: "robotics",
    enemyName: "רובוטי קוביות",
    weaponName: "קוביות",
    weaponType: "blocks",
    hint: "השמידו 3 רובוטים במעבדה בזמן שרובוטי קוביות מפריעים לכם.",
    platforms: [
      [96, 344, 144], [292, 292, 124], [470, 244, 126], [660, 290, 158], [730, 218, 94],
    ],
  },
  {
    name: "כפרוצקה",
    status: "מטבח",
    objective: "killGate",
    target: 7,
    scenery: "pizza",
    enemyName: "מלצרים ושפים",
    weaponName: "פיצות",
    weaponType: "pizza",
    hint: "שרדו מול מלצרים ושפים שזורקים פיצות ברחבי הפיצרייה.",
    platforms: [
      [110, 350, 170], [332, 304, 134], [520, 260, 130], [708, 214, 134], [710, 334, 120],
    ],
  },
  {
    name: "מגרש ספורט",
    status: "עימות",
    objective: "killGate",
    target: 7,
    scenery: "sportsField",
    enemyName: "ספורטאים זומבים",
    weaponName: "מכות",
    weaponType: "",
    hint: "חסלו 7 ספורטאים שמסתערים במכות בתוך מגרש הספורט.",
    platforms: [
      [84, 358, 182], [322, 314, 144], [516, 274, 154], [668, 252, 74], [732, 336, 118],
    ],
  },
  {
    name: "פאב המוזה",
    status: "הדיפה",
    objective: "killGate",
    target: 8,
    scenery: "pub",
    enemyName: "מלצרים זומבים",
    weaponName: "נשיכות",
    weaponType: "",
    hint: "שרדו מול המלצרים האחרונים בפאב המוזה וסיימו את הפלישה.",
    platforms: [
      [92, 350, 134], [264, 306, 120], [430, 262, 120], [594, 226, 122], [756, 286, 110],
    ],
  },
];

const STAGE_QUERY_INDEX = (() => {
  const parsed = Number.parseInt(URL_PARAMS.get("stage") ?? "", 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= STAGES.length ? parsed - 1 : null;
})();

const state = {
  mode: "intro",
  introStarted: false,
  introTime: 0,
  playerCount: 1,
  players: [],
  enemies: [],
  shots: [],
  enemyShots: [],
  particles: [],
  floatingTexts: [],
  activators: [],
  nests: [],
  gate: null,
  stageIndex: -1,
  stageKills: 0,
  stageSpawned: 0,
  stageExtraSpawned: 0,
  spawnTimer: 0,
  attackTimer: 1,
  score: 0,
  transitionTimer: 0,
  transitionText: "",
  gameOver: false,
  victory: false,
  immortal: false,
  cheatBuffer: [],
  time: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentStage() {
  return STAGES[state.stageIndex];
}

function stagePlatforms(stage = currentStage()) {
  return [
    { x: 0, y: GROUND_Y, width: WIDTH, height: HEIGHT - GROUND_Y },
    ...stage.platforms.map(([x, y, width]) => ({ x, y, width, height: 22 })),
  ];
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function isVisible(entity, margin = 30) {
  return entity.x + entity.width > -margin && entity.x < WIDTH + margin && entity.y + entity.height > -margin && entity.y < HEIGHT + margin;
}

function activePlayers() {
  return state.players.filter((player) => player.alive && player.hp > 0);
}

function leadPlayer() {
  return activePlayers()[0] ?? state.players[0];
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setHint(text) {
  hintEl.textContent = text;
}

function setMission(text) {
  missionEl.textContent = text;
}

function syncModeButtons() {
  modeOneEl?.classList.toggle("is-selected", state.playerCount === 1);
  modeTwoEl?.classList.toggle("is-selected", state.playerCount === 2);
}

function syncHud() {
  healthEl.textContent = state.playerCount === 1 ? "לבבות" : "לבבות שני שחקנים";
  waveEl.textContent = state.stageIndex >= 0 ? `${state.stageIndex + 1}/${STAGES.length}` : `0/${STAGES.length}`;
  scoreEl.textContent = String(state.score);
  syncModeButtons();
}

function createPlayer(config, index) {
  const controls =
    state.playerCount === 1 && config.id === 1
      ? {
          ...config,
          left: [...config.left, "ArrowLeft"],
          right: [...config.right, "ArrowRight"],
          jump: [...config.jump, "ArrowUp"],
        }
      : config;

  return {
    id: controls.id,
    label: controls.label,
    config: controls,
    x: 120 + index * 58,
    y: 220,
    width: 26,
    height: 54,
    vx: 0,
    vy: 0,
    facing: 1,
    hp: 3,
    alive: true,
    onGround: false,
    shootCooldown: 0,
    shootFlash: 0,
  };
}

function resetGame() {
  state.mode = "intro";
  state.introStarted = false;
  state.introTime = 0;
  state.players = PLAYER_CONFIGS.slice(0, state.playerCount).map(createPlayer);
  state.enemies = [];
  state.shots = [];
  state.enemyShots = [];
  state.particles = [];
  state.floatingTexts = [];
  state.activators = [];
  state.nests = [];
  state.gate = null;
  state.stageIndex = -1;
  state.stageKills = 0;
  state.stageSpawned = 0;
  state.stageExtraSpawned = 0;
  state.spawnTimer = 0;
  state.attackTimer = 1;
  state.score = 0;
  state.transitionTimer = 0;
  state.transitionText = "";
  state.gameOver = false;
  state.victory = false;
  state.immortal = IMMORTAL_QUERY_ENABLED;
  state.cheatBuffer = [];
  setStatus("פתיחה");
  setMission("בחרו מצב משחק והתחילו.");
  setHint(
    STAGE_QUERY_INDEX === null
      ? "לחצו אנטר או על המסך כדי להתחיל את הסיפור."
      : `נבחר מעבר ישיר לשלב ${STAGE_QUERY_INDEX + 1}: ${STAGES[STAGE_QUERY_INDEX].name}. לחצו אנטר כדי להתחיל.`,
  );
  syncHud();
}

function setPlayerCount(count) {
  state.playerCount = count;
  resetGame();
  setStatus(count === 1 ? "שחקן אחד" : "שני שחקנים");
}

function startIntro() {
  if (STAGE_QUERY_INDEX !== null) {
    beginGame();
    return;
  }

  state.introStarted = true;
  state.introTime = 0.01;
  setStatus("הפלישה מתחילה");
  setMission("צפו בפתיחה או לחצו אנטר כדי לדלג.");
}

function beginGame() {
  state.mode = "playing";
  configureStage(STAGE_QUERY_INDEX ?? 0);
}

function configureStage(index) {
  const stage = STAGES[index];
  state.stageIndex = index;
  state.stageKills = 0;
  state.stageSpawned = 0;
  state.stageExtraSpawned = 0;
  state.enemies = [];
  state.shots = [];
  state.enemyShots = [];
  state.particles = [];
  state.floatingTexts = [];
  state.spawnTimer = 0.7;
  state.attackTimer = 1.2;
  state.transitionTimer = 0;
  state.transitionText = "";
  state.activators = [];
  state.nests = [];
  state.gate = null;
  state.gameOver = false;

  state.players.forEach((player, playerIndex) => {
    player.x = 116 + playerIndex * 58;
    player.y = 220;
    player.vx = 0;
    player.vy = 0;
    player.hp = clamp(player.hp + (index > 0 ? 1 : 0), 1, 3);
    player.alive = true;
    player.facing = 1;
  });

  if (stage.objective === "killGate") {
    state.gate = { x: 895, y: GROUND_Y - 92, width: 44, height: 92, active: false };
    setMission(`חסלו ${stage.target} זומבים ואז עברו לשער.`);
  }
  if (stage.objective === "activate") {
    state.activators = [
      { x: 168, y: 300, width: 34, height: 42, active: false },
      { x: 430, y: 244, width: 34, height: 42, active: false },
      { x: 722, y: 256, width: 34, height: 42, active: false },
    ].slice(0, stage.target);
    setMission(`הפעילו ${stage.target} עמדות נשק במרחב.`);
  }
  if (stage.objective === "destroy") {
    state.nests = [
      { x: 218, y: 288, width: 48, height: 40, hp: 4, maxHp: 4 },
      { x: 506, y: 230, width: 48, height: 40, hp: 4, maxHp: 4 },
      { x: 790, y: 286, width: 48, height: 40, hp: 4, maxHp: 4 },
    ].slice(0, stage.target);
    setMission(`השמידו ${stage.target} רובוטים במעבדה.`);
  }

  setStatus(stage.status);
  setHint(stage.weaponName ? `${stage.hint} הם זורקים: ${stage.weaponName}.` : stage.hint);
  seedStageEnemies();
  syncHud();
}

function spawnPoints() {
  return stagePlatforms()
    .filter((platform) => platform.y < GROUND_Y)
    .map((platform, index) => ({
      x: platform.x + Math.max(12, Math.floor(platform.width / 2) - 14),
      y: platform.y - 56,
      side: index % 2 === 0 ? -1 : 1,
    }));
}

function zombiePalette(stage) {
  const palettes = {
    kindergarten: { skin: "#b9c99a", hair: "#914c4c", shirt: "#e8ca57", pants: "#6c62a5", boots: "#54372a" },
    agClass: { skin: "#abc18d", hair: "#3b472f", shirt: "#d9ca88", pants: "#66524f", boots: "#312823" },
    highSchool: { skin: "#a9bf86", hair: "#5a3521", shirt: "#ce7434", pants: "#5e475d", boots: "#32231f" },
    football: { skin: "#acc884", hair: "#273926", shirt: "#6ac65e", pants: "#e7e2d3", boots: "#252222" },
    library: { skin: "#afbf97", hair: "#4e3d34", shirt: "#6e4f82", pants: "#574a47", boots: "#2f2626" },
    pool: { skin: "#b1bd9b", hair: "#23405a", shirt: "#48a8d5", pants: "#2e5d82", boots: "#254058" },
    robotics: { skin: "#c6c1b0", hair: "#6aa4c6", shirt: "#e7ca51", pants: "#69a866", boots: "#4f3a30" },
    pizza: { skin: "#bcb083", hair: "#6a3c2e", shirt: "#d45142", pants: "#595445", boots: "#342820" },
    sportsField: { skin: "#b0c28a", hair: "#3d2f2b", shirt: "#557fd0", pants: "#294873", boots: "#282321" },
    pub: { skin: "#b8b091", hair: "#33231f", shirt: "#684641", pants: "#403635", boots: "#241c1b" },
  };
  return palettes[stage.scenery] ?? palettes.agClass;
}

function spawnEnemy(reinforcement = false) {
  const stage = currentStage();
  if (!stage.enemyName) {
    return;
  }

  const points = spawnPoints();
  const point = points[(state.stageSpawned + Math.floor(Math.random() * points.length)) % points.length];
  const speedType = Math.random();
  const speedMultiplier = speedType < 0.25 ? 0.72 : speedType < 0.72 ? 1 : 1.38;
  const speed = (58 + state.stageIndex * 7 + Math.random() * 14) * speedMultiplier;

  state.enemies.push({
    x: point.x,
    y: point.y,
    width: 28,
    height: 56,
    vx: speed * point.side,
    vy: 0,
    speed,
    hp: stage.scenery === "robotics" ? 2 : 1,
    facing: point.side,
    palette: zombiePalette(stage),
    attackCooldown: 0.7 + Math.random() * 1.2,
    frameSeed: Math.random() * 10,
    weaponType: stage.weaponType,
  });
  state.stageSpawned += 1;
  if (reinforcement) {
    state.stageExtraSpawned += 1;
  }
}

function seedStageEnemies() {
  const stage = currentStage();
  if (!stage.enemyName) {
    return;
  }

  const base = Math.min(5, stage.target || 5);
  while (state.enemies.length < base && state.stageSpawned < base) {
    spawnEnemy(false);
  }
}

function updateSpawns(dt) {
  const stage = currentStage();
  if (!stage?.enemyName || state.transitionTimer > 0) {
    return;
  }

  const base = Math.min(5, stage.target || 5);
  const extraLimit = (state.stageIndex + 1) * 2;
  state.spawnTimer -= dt;
  if (state.enemies.length < base && state.stageExtraSpawned < extraLimit && state.spawnTimer <= 0) {
    spawnEnemy(true);
    state.spawnTimer = 0.55 + Math.random() * 0.55;
  }
}

function resolveLanding(entity, previousY) {
  const previousBottom = previousY + entity.height;
  const currentBottom = entity.y + entity.height;
  let landing = null;
  for (const platform of stagePlatforms()) {
    const crosses = entity.x + entity.width > platform.x && entity.x < platform.x + platform.width && previousBottom <= platform.y && currentBottom >= platform.y;
    if (crosses && (!landing || platform.y < landing.y)) {
      landing = platform;
    }
  }
  if (!landing) {
    return false;
  }

  entity.y = landing.y - entity.height;
  entity.vy = 0;
  return true;
}

function damagePlayer(player) {
  if (state.immortal || state.transitionTimer > 0 || state.gameOver || state.victory || player.invulnerable > 0) {
    return;
  }

  player.hp -= 1;
  player.invulnerable = 1.1;
  state.floatingTexts.push({ x: player.x, y: player.y - 12, text: "-1", color: "#ff5d73", ttl: 0.8 });
  if (player.hp <= 0) {
    player.alive = false;
    if (activePlayers().length === 0) {
      state.gameOver = true;
      setStatus("נפלתם");
      setHint("לחצו ר כדי להתחיל מחדש.");
    }
  } else {
    setStatus("נפגע");
  }
}

function fireShot(player) {
  if (!player.alive || state.mode !== "playing" || state.transitionTimer > 0 || player.shootCooldown > 0) {
    return;
  }

  state.shots.push({
    owner: player.id,
    x: player.x + player.width / 2 + player.facing * 18,
    y: player.y + 18,
    width: 18,
    height: 6,
    vx: player.facing * 540,
    vy: 0,
    ttl: 0.65,
  });
  player.shootCooldown = 0.22;
  player.shootFlash = 0.13;
}

function spawnEnemyShot(enemy, target) {
  const stage = currentStage();
  if (!stage.weaponType) {
    return;
  }

  const type = stage.weaponType === "sports" ? (Math.random() < 0.5 ? "footballs" : "basketballs") : stage.weaponType;
  const fromX = enemy.x + enemy.width / 2;
  const fromY = enemy.y + 18;
  const toX = target.x + target.width / 2;
  const toY = target.y + 18;
  const distance = Math.max(1, Math.hypot(toX - fromX, toY - fromY));
  const speed = type === "water" ? 260 : 300;
  state.enemyShots.push({
    type,
    x: fromX,
    y: fromY,
    width: type === "rulers" ? 20 : 14,
    height: type === "rulers" ? 4 : 14,
    vx: ((toX - fromX) / distance) * speed,
    vy: ((toY - fromY) / distance) * speed,
    ttl: 2.2,
  });
}

function updatePlayer(player, dt) {
  if (!player.alive) {
    return;
  }

  const previousY = player.y;
  const left = player.config.left.some((code) => keys.has(code));
  const right = player.config.right.some((code) => keys.has(code));
  const desired = Number(right) - Number(left);
  player.vx = desired * PLAYER_SPEED;
  if (desired !== 0) {
    player.facing = desired;
  }

  player.vy += GRAVITY * dt;
  player.x = clamp(player.x + player.vx * dt, 0, WIDTH - player.width);
  player.y += player.vy * dt;
  player.onGround = player.vy >= 0 && resolveLanding(player, previousY);
  player.shootCooldown = Math.max(0, player.shootCooldown - dt);
  player.shootFlash = Math.max(0, player.shootFlash - dt);
  player.invulnerable = Math.max(0, (player.invulnerable ?? 0) - dt);

  if (player.y > HEIGHT + 120) {
    damagePlayer(player);
    player.x = 120;
    player.y = 180;
    player.vx = 0;
    player.vy = 0;
  }
}

function updateEnemies(dt) {
  const players = activePlayers();
  if (players.length === 0) {
    return;
  }

  for (const enemy of state.enemies) {
    const previousY = enemy.y;
    let target = players[0];
    let nearest = Infinity;
    for (const player of players) {
      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (distance < nearest) {
        nearest = distance;
        target = player;
      }
    }

    enemy.facing = enemy.x < target.x ? 1 : -1;
    enemy.vx = enemy.facing * enemy.speed;
    enemy.vy += GRAVITY * dt;
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
    if (enemy.vy >= 0) {
      resolveLanding(enemy, previousY);
    }

    if (enemy.x < -80 || enemy.x > WIDTH + 80) {
      enemy.vx *= -1;
      enemy.x = clamp(enemy.x, 20, WIDTH - 48);
    }

    enemy.attackCooldown -= dt;
    if (enemy.weaponType && enemy.attackCooldown <= 0 && nearest < 330 && isVisible(enemy, 8)) {
      spawnEnemyShot(enemy, target);
      enemy.attackCooldown = 1.1 + Math.random() * 0.85;
    }

    for (const player of players) {
      if (isVisible(enemy, 8) && overlaps(player, enemy)) {
        damagePlayer(player);
      }
    }
  }
}

function updateShots(dt) {
  for (const shot of state.shots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.ttl -= dt;
  }

  for (const shot of state.shots) {
    if (shot.ttl <= 0) {
      continue;
    }

    for (const enemy of state.enemies) {
      if (enemy.dead || !overlaps(shot, enemy)) {
        continue;
      }
      enemy.hp -= 1;
      shot.ttl = 0;
      addBurst(shot.x, shot.y, "#ffb347", 8);
      if (enemy.hp <= 0) {
        enemy.dead = true;
        state.stageKills += 1;
        state.score += 1;
        state.floatingTexts.push({ x: enemy.x, y: enemy.y - 10, text: "+1", color: "#8fff96", ttl: 0.75 });
      }
      break;
    }

    for (const nest of state.nests) {
      if (nest.hp <= 0 || !overlaps(shot, nest)) {
        continue;
      }
      nest.hp -= 1;
      shot.ttl = 0;
      addBurst(shot.x, shot.y, "#8fff96", 8);
      if (nest.hp <= 0) {
        state.score += 2;
      }
      break;
    }
  }

  state.enemies = state.enemies.filter((enemy) => !enemy.dead);
  state.shots = state.shots.filter((shot) => shot.ttl > 0 && shot.x > -80 && shot.x < WIDTH + 80 && shot.y > -80 && shot.y < HEIGHT + 80);
}

function updateEnemyShots(dt) {
  for (const shot of state.enemyShots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.ttl -= dt;

    for (const player of activePlayers()) {
      if (overlaps(shot, player)) {
        shot.ttl = 0;
        damagePlayer(player);
        addBurst(shot.x, shot.y, "#ffd28b", 6);
        break;
      }
    }
  }
  state.enemyShots = state.enemyShots.filter((shot) => shot.ttl > 0 && isVisible(shot, 60));
}

function updateObjectives() {
  const stage = currentStage();
  if (!stage || state.transitionTimer > 0) {
    return;
  }

  if (stage.objective === "killGate") {
    if (state.stageKills >= stage.target && state.gate) {
      state.gate.active = true;
      setMission("השער פתוח. עברו אליו כדי להמשיך.");
      if (activePlayers().some((player) => overlaps(player, state.gate))) {
        completeStage(state.stageIndex === STAGES.length - 1 ? "פאב המוזה טוהר." : `${stage.name} טוהר. ממשיכים.`);
      }
    } else {
      setMission(`חסלו עוד ${Math.max(0, stage.target - state.stageKills)} זומבים ואז עברו לשער.`);
    }
  }

  if (stage.objective === "activate") {
    for (const node of state.activators) {
      if (!node.active && activePlayers().some((player) => overlaps(player, node))) {
        node.active = true;
        addBurst(node.x + 16, node.y + 12, "#8fff96", 8);
      }
    }
    const remaining = state.activators.filter((node) => !node.active).length;
    if (remaining === 0) {
      completeStage("עמדות הנשק הופעלו.");
    } else {
      setMission(`הפעילו עוד ${remaining} עמדות נשק.`);
    }
  }

  if (stage.objective === "destroy") {
    const remaining = state.nests.filter((nest) => nest.hp > 0).length;
    if (remaining === 0) {
      completeStage("רובוטי המעבדה הושמדו.");
    } else {
      setMission(`השמידו עוד ${remaining} רובוטים.`);
    }
  }
}

function completeStage(text) {
  if (state.transitionTimer > 0 || state.victory) {
    return;
  }
  state.transitionTimer = 2.2;
  state.transitionText = text;
  state.enemyShots = [];
  setStatus("משימה הושלמה");
}

function triggerVictory() {
  state.victory = true;
  state.mode = "victory";
  state.enemies = [];
  state.enemyShots = [];
  setStatus("ניצחון");
  setMission("ערד ניצלה. המשחק הושלם.");
  setHint("לחצו ר כדי להתחיל מחדש.");
  addBurst(WIDTH / 2, 170, "#ffdf7b", 24);
}

function updateTransition(dt) {
  if (state.transitionTimer <= 0) {
    return;
  }
  state.transitionTimer -= dt;
  if (state.transitionTimer > 0) {
    return;
  }

  if (state.stageIndex >= STAGES.length - 1) {
    triggerVictory();
  } else {
    configureStage(state.stageIndex + 1);
  }
}

function updateIntro(dt) {
  if (!state.introStarted) {
    return;
  }
  state.introTime += dt;
  if (state.introTime >= INTRO_STEPS.length * 3.15) {
    beginGame();
  }
}

function addBurst(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    const angle = (Math.PI * 2 * i) / amount;
    const speed = 55 + Math.random() * 110;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 20,
      size: 3 + Math.random() * 4,
      ttl: 0.45 + Math.random() * 0.25,
      color,
    });
  }
}

function updateEffects(dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += GRAVITY * 0.18 * dt;
    particle.ttl -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.ttl > 0);

  for (const text of state.floatingTexts) {
    text.y -= 34 * dt;
    text.ttl -= dt;
  }
  state.floatingTexts = state.floatingTexts.filter((text) => text.ttl > 0);
}

function update(dt) {
  state.time += dt;
  if (state.mode === "intro") {
    updateIntro(dt);
  }

  if (state.mode === "playing") {
    for (const player of state.players) {
      updatePlayer(player, dt);
    }
    updateEnemies(dt);
    updateShots(dt);
    updateEnemyShots(dt);
    updateSpawns(dt);
    updateObjectives();
    updateTransition(dt);
  }

  updateEffects(dt);
  syncHud();
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawBackground() {
  const stage = currentStage() ?? STAGES[0];
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#d99a72");
  sky.addColorStop(0.45, "#94616b");
  sky.addColorStop(1, "#242334");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawRect(0, GROUND_Y - 112, WIDTH, 48, "rgba(255, 235, 190, 0.08)");
  drawAradHorizon();
  drawScenery(stage);
  drawPlatforms();
}

function drawAradHorizon() {
  drawRect(0, GROUND_Y - 48, WIDTH, 78, "#72515a");
  ctx.fillStyle = "#8d635b";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 40);
  ctx.lineTo(110, GROUND_Y - 76);
  ctx.lineTo(260, GROUND_Y - 52);
  ctx.lineTo(404, GROUND_Y - 104);
  ctx.lineTo(560, GROUND_Y - 66);
  ctx.lineTo(720, GROUND_Y - 122);
  ctx.lineTo(930, GROUND_Y - 58);
  ctx.lineTo(WIDTH, GROUND_Y - 40);
  ctx.lineTo(WIDTH, GROUND_Y + 32);
  ctx.lineTo(0, GROUND_Y + 32);
  ctx.closePath();
  ctx.fill();

  drawRect(726, GROUND_Y - 34, 150, 10, "rgba(170, 205, 214, 0.35)");
  drawRect(118, GROUND_Y - 62, 38, 8, "#5d4652");
  drawRect(128, GROUND_Y - 54, 8, 10, "#5d4652");
  drawRect(140, GROUND_Y - 54, 8, 10, "#5d4652");
}

function drawVenueSign(x, y, w, text) {
  drawRect(x, y, w, 27, "#6a4c42");
  drawRect(x + 8, y + 6, w - 16, 13, "#ead8ad");
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = "#47342f";
  ctx.font = '13px "Rubik"';
  ctx.fillText(text, x + w / 2, y + 19);
  ctx.restore();
}

function drawScenery(stage) {
  if (stage.scenery === "kindergarten") {
    drawRect(72, 170, 230, 110, "#c79a6e");
    drawRect(102, 154, 170, 24, "#df6b5f");
    drawRect(560, 220, 120, 16, "#f0c36e");
    drawRect(720, 192, 18, 98, "#6da1c2");
    drawRect(780, 192, 18, 98, "#6da1c2");
    drawRect(372, 280, 18, 18, "#f2d45f");
    drawRect(398, 286, 14, 14, "#e3695d");
    drawVenueSign(118, 136, 138, "הגן");
  } else if (stage.scenery === "agClass" || stage.scenery === "dvClass") {
    drawRect(60, 138, 828, 210, "#7c675c");
    drawRect(84, 160, 780, 168, "#d0bf9c");
    for (const x of [118, 298, 478, 658]) {
      drawRect(x, 236, 130, 24, "#8d715e");
    }
    if (stage.scenery === "agClass") {
      drawRect(146, 176, 180, 72, "#35544a");
      ctx.save();
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.fillStyle = "#f3efcf";
      ctx.font = '18px "Rubik"';
      ctx.fillText("שלום כיתה א", 236, 218);
      ctx.restore();
    } else {
      drawRect(152, 188, 96, 72, "#534440");
      drawRect(662, 188, 96, 72, "#534440");
      drawRect(330, 278, 300, 34, "#7a5a49");
    }
    drawVenueSign(118, 128, 180, stage.name);
  } else if (stage.scenery === "football" || stage.scenery === "sportsField") {
    drawRect(0, 150, WIDTH, 196, "#4f6845");
    drawRect(48, 182, 840, 6, "#dcd6ba");
    drawRect(460, 150, 6, 196, "#dcd6ba");
    drawRect(86, 210, 32, 96, "#c8b692");
    drawRect(822, 210, 32, 96, "#c8b692");
    drawVenueSign(360, 120, 220, stage.name);
  } else if (stage.scenery === "library") {
    drawRect(52, 132, 864, 228, "#5d4b44");
    drawRect(78, 158, 812, 176, "#7b6757");
    for (let i = 0; i < 5; i += 1) {
      drawRect(108 + i * 150, 184, 90, 114, "#5a403a");
      drawRect(116 + i * 150, 194, 74, 10, "#d0b074");
      drawRect(116 + i * 150, 214, 74, 10, "#7ba6bb");
      drawRect(116 + i * 150, 234, 74, 10, "#a75d55");
    }
    drawVenueSign(344, 126, 216, "הספריה");
  } else if (stage.scenery === "pool") {
    drawRect(60, 150, 840, 190, "#6d8a92");
    drawRect(160, 190, 520, 110, "#4fb4d7");
    drawRect(172, 202, 496, 10, "#cfeef2");
    drawVenueSign(700, 172, 110, "בריכה");
  } else if (stage.scenery === "robotics") {
    drawRect(56, 126, 852, 234, "#66554d");
    drawRect(84, 152, 796, 182, "#8b776d");
    drawRect(144, 190, 120, 80, "#4e5b63");
    drawRect(694, 190, 120, 80, "#4e5b63");
    drawRect(378, 208, 164, 72, "#9f8b7a");
    drawVenueSign(332, 132, 256, "חוג רובוטיקה");
  } else if (stage.scenery === "pizza") {
    drawRect(120, 146, 710, 190, "#6a4940");
    drawRect(150, 174, 650, 140, "#9b6a54");
    drawRect(208, 198, 120, 22, "#d9c49f");
    drawRect(226, 202, 16, 10, "#c94f43");
    drawRect(250, 202, 16, 10, "#c94f43");
    drawVenueSign(320, 136, 280, "פיצה כפרוצ׳קה");
  } else if (stage.scenery === "pub") {
    drawRect(92, 154, 780, 178, "#493635");
    drawRect(120, 180, 724, 128, "#6e4b45");
    drawRect(206, 240, 460, 20, "#9c6b4e");
    drawRect(502, 172, 118, 74, "#1e2d32");
    drawRect(516, 186, 90, 46, "#4f8f54");
    drawRect(516, 208, 90, 2, "#e5e6d7");
    for (const [x, color] of [[150, "#b4272d"], [258, "#234aa5"], [372, "#2d7a46"]]) {
      drawRect(x, 176, 88, 12, color);
      drawRect(x + 8, 180, 10, 4, "#f2f2f2");
      drawRect(x + 32, 180, 10, 4, "#f2f2f2");
      drawRect(x + 56, 180, 10, 4, "#f2f2f2");
    }
    drawVenueSign(360, 138, 220, "פאב המוזה");
  } else {
    drawRect(38, 132, 886, 226, "#6c5756");
    drawRect(70, 156, 828, 176, "#8f746a");
    drawVenueSign(360, 126, 220, stage.name);
  }

  drawActivators();
  drawNests();
  drawGate();
}

function drawPlatforms() {
  for (const platform of stagePlatforms().slice(1)) {
    drawRect(platform.x, platform.y, platform.width, platform.height, "#6f4f3f");
    drawRect(platform.x, platform.y, platform.width, 5, "#c28f64");
    drawRect(platform.x + 8, platform.y + 5, platform.width - 16, 3, "#e1b389");
    drawRect(platform.x + platform.width, platform.y + 8, 12, platform.height, "#50392f");
  }
  drawRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y, "#4c3a34");
  drawRect(0, GROUND_Y, WIDTH, 8, "#9a6f50");
}

function drawActivators() {
  for (const node of state.activators) {
    drawRect(node.x, node.y, node.width, node.height, node.active ? "#e8c579" : "#615953");
    drawRect(node.x + 8, node.y + 8, 18, 13, node.active ? "#fff1b5" : "#2f2a29");
  }
}

function drawNests() {
  for (const nest of state.nests) {
    if (nest.hp <= 0) {
      continue;
    }
    drawRect(nest.x, nest.y, nest.width, nest.height, "#5a2d2c");
    drawRect(nest.x + 8, nest.y + 6, nest.width - 16, nest.height - 12, "#b46e58");
    drawRect(nest.x + 4, nest.y - 8, (nest.width - 8) * (nest.hp / nest.maxHp), 4, "#f0caa0");
  }
}

function drawGate() {
  if (!state.gate) {
    return;
  }
  drawRect(state.gate.x, state.gate.y, state.gate.width, state.gate.height, state.gate.active ? "#e3d38d" : "#726658");
  drawRect(state.gate.x + 8, state.gate.y + 12, 8, state.gate.height - 24, "#3a2e2f");
  drawRect(state.gate.x + 26, state.gate.y + 12, 8, state.gate.height - 24, "#3a2e2f");
}

function walkFrame(speed, seed, zombie = false) {
  if (Math.abs(speed) < 12) {
    return {
      bodyBob: 0,
      frontLeg: 0,
      backLeg: 0,
      frontLegX: 0,
      backLegX: 0,
      frontFootX: 0,
      backFootX: 0,
      frontArm: 0,
      backArm: 0,
      frontArmX: 0,
      backArmX: 0,
      torsoLean: 0,
      shoulderDrop: 0,
      hipShift: 0,
    };
  }
  const frames = zombie
    ? [
        { bodyBob: 0, torsoLean: -0.2, shoulderDrop: 0, hipShift: -0.5, frontLeg: -3, backLeg: 2, frontLegX: 2, backLegX: -1, frontFootX: 3, backFootX: -1, frontArm: 2, backArm: -2, frontArmX: 1, backArmX: -1 },
        { bodyBob: 1, torsoLean: -0.08, shoulderDrop: 1, hipShift: 0, frontLeg: -1, backLeg: 0, frontLegX: 1, backLegX: 0, frontFootX: 1, backFootX: 0, frontArm: 1, backArm: -1, frontArmX: 0, backArmX: 0 },
        { bodyBob: 0, torsoLean: 0.16, shoulderDrop: 0, hipShift: 0.5, frontLeg: 2, backLeg: -3, frontLegX: -1, backLegX: 2, frontFootX: -1, backFootX: 3, frontArm: -2, backArm: 2, frontArmX: -1, backArmX: 1 },
        { bodyBob: 1, torsoLean: 0.04, shoulderDrop: -1, hipShift: 0, frontLeg: 0, backLeg: -1, frontLegX: 0, backLegX: 1, frontFootX: 0, backFootX: 1, frontArm: -1, backArm: 1, frontArmX: 0, backArmX: 0 },
      ]
    : [
        { bodyBob: 0, torsoLean: -0.1, shoulderDrop: -1, hipShift: -0.4, frontLeg: -2, backLeg: 2, frontLegX: 1.4, backLegX: -1, frontFootX: 2.2, backFootX: -1, frontArm: 2, backArm: -2, frontArmX: 1, backArmX: -1 },
        { bodyBob: 1, torsoLean: 0.02, shoulderDrop: 0, hipShift: 0, frontLeg: 0, backLeg: 1, frontLegX: 0.6, backLegX: -0.2, frontFootX: 0.8, backFootX: 0, frontArm: 1, backArm: -1, frontArmX: 0.4, backArmX: -0.4 },
        { bodyBob: 0, torsoLean: 0.12, shoulderDrop: 1, hipShift: 0.4, frontLeg: 2, backLeg: -2, frontLegX: -1, backLegX: 1.4, frontFootX: -1, backFootX: 2.2, frontArm: -2, backArm: 2, frontArmX: -1, backArmX: 1 },
        { bodyBob: 1, torsoLean: 0.02, shoulderDrop: 0, hipShift: 0, frontLeg: 1, backLeg: 0, frontLegX: -0.2, backLegX: 0.6, frontFootX: 0, backFootX: 0.8, frontArm: -1, backArm: 1, frontArmX: -0.4, backArmX: 0.4 },
      ];
  const cadence = zombie ? 7 : 10;
  return frames[Math.floor((state.time + seed) * cadence) % frames.length];
}

function drawHuman(player) {
  const frame = walkFrame(player.vx, player.id * 0.17, false);
  const flash = player.invulnerable > 0 && Math.floor(state.time * 14) % 2 === 0;
  if (flash) {
    return;
  }
  const p = player.config.palette;
  const palette = {
    skin: p.skin,
    skinShadow: p.shadow,
    neck: p.shadow,
    hair: p.hair,
    shirt: p.shirt,
    shirtShadow: p.shirtDark,
    collar: "#d8d0bf",
    coat: p.coat,
    coatShadow: p.coatDark,
    pants: p.pants,
    pantsShadow: "#3f4962",
    boots: p.boots,
    arm: p.skin,
    hand: p.skin,
    cheek: "rgba(188, 120, 94, 0.45)",
  };
  const shootPose = player.shootFlash > 0 ? player.shootFlash / 0.13 : 0;

  ctx.save();
  ctx.translate(player.x, player.y + 7 + frame.bodyBob);
  ctx.scale(0.82, 0.82);
  if (player.facing < 0) {
    ctx.scale(-1, 1);
    ctx.translate(-26, 0);
  }
  ctx.transform(1, 0, frame.torsoLean, 1, 0, 0);

  drawRect(5, 18 + frame.shoulderDrop * 0.25, 16, 30, palette.coatShadow);
  drawRect(8, 5, 10, 11, palette.skinShadow);
  drawRect(9, 6, 8, 9, palette.skin);
  drawRect(11, 15 + frame.shoulderDrop * 0.15, 4, 3, palette.neck);
  drawRect(7, 2, 12, 5, palette.hair);
  drawRect(6, 5, 2, 4, palette.hair);
  drawRect(18, 5, 2, 4, palette.hair);
  drawRect(6, 18 + frame.shoulderDrop * 0.2, 14, 15, palette.shirtShadow);
  drawRect(8, 19 + frame.shoulderDrop * 0.2, 10, 12, palette.shirt);
  drawRect(10, 18 + frame.shoulderDrop * 0.12, 6, 2, palette.collar);
  drawRect(4 + frame.backArmX * 0.2, 20 + frame.backArm * 0.15, 3, 24, palette.coat);
  drawRect(19 + frame.frontArmX * 0.2, 20 + frame.frontArm * 0.15, 3, 24, palette.coat);
  drawRect(7 + frame.hipShift * 0.18, 31, 12, 12, palette.coat);
  drawRect(3 + frame.backArmX, 19 + frame.backArm + shootPose * 0.8, 3, 11, palette.arm);
  if (player.shootFlash > 0) {
    drawRect(18, 17 - shootPose * 1.1, 8, 3, palette.arm);
    drawRect(24, 16 - shootPose * 1.1, 5, 4, palette.arm);
    drawRect(28, 16 - shootPose, 2, 3, palette.hand);
  } else {
    drawRect(20 + frame.frontArmX, 19 + frame.frontArm, 3, 11, palette.arm);
  }
  drawRect(8 + frame.hipShift * 0.2 + frame.frontLegX, 33 + frame.frontLeg, 4, 15, palette.pantsShadow);
  drawRect(14 - frame.hipShift * 0.2 + frame.backLegX, 33 + frame.backLeg, 4, 15, palette.pantsShadow);
  drawRect(9 + frame.hipShift * 0.15 + frame.frontLegX, 34 + frame.frontLeg, 2, 12, palette.pants);
  drawRect(15 - frame.hipShift * 0.15 + frame.backLegX, 34 + frame.backLeg, 2, 12, palette.pants);
  drawRect(7 + frame.hipShift * 0.1 + frame.frontFootX, 48 + frame.frontLeg, 5, 4, palette.boots);
  drawRect(14 - frame.hipShift * 0.1 + frame.backFootX, 48 + frame.backLeg, 5, 4, palette.boots);
  drawRect(10, 9, 1, 1, "#fff3ca");
  drawRect(15, 9, 1, 1, "#fff3ca");
  drawRect(9, 12, 1, 1, palette.cheek);
  ctx.restore();

  if (player.shootFlash > 0) {
    const ratio = player.shootFlash / 0.13;
    const x = player.x + (player.facing > 0 ? 28 : -9);
    const y = player.y + 14 - ratio;
    drawRect(x, y, 10, 7, `rgba(255, 238, 185, ${0.45 + ratio * 0.35})`);
    drawRect(x + (player.facing > 0 ? 8 : -8), y + 2, 10, 3, "#ffb95d");
  }
}

function drawEnemy(enemy) {
  const p = enemy.palette;
  const frame = walkFrame(enemy.vx, enemy.frameSeed, true);
  ctx.save();
  ctx.translate(enemy.x, enemy.y + 18 + frame.bodyBob);
  ctx.scale(0.64, 0.64);
  if (enemy.facing > 0) {
    ctx.scale(-1, 1);
    ctx.translate(-24, 0);
  }
  ctx.transform(1, 0, frame.torsoLean, 1, 0, 0);
  drawRect(4, 2, 18, 48, "rgba(20, 12, 12, 0.5)");
  drawRect(6, 4, 12, 10, p.skin);
  drawRect(6, 4, 12, 4, p.hair);
  drawRect(5, 12, 14, 4, "#6d8a69");
  drawRect(4, 16, 16, 13, p.shirt);
  drawRect(7, 18, 10, 4, "rgba(255,255,255,0.12)");
  drawRect(5 + frame.frontLegX, 29 + frame.frontLeg, 6, 13, p.pants);
  drawRect(13 + frame.backLegX, 29 + frame.backLeg, 6, 13, p.pants);
  drawRect(1 + frame.frontArmX, 17 + frame.frontArm, 4, 10, p.skin);
  drawRect(19 + frame.backArmX, 18 + frame.backArm, 4, 10, p.skin);
  drawRect(4 + frame.frontFootX, 42 + frame.frontLeg, 7, 6, p.boots);
  drawRect(13 + frame.backFootX, 42 + frame.backLeg, 7, 6, p.boots);
  drawRect(8, 8, 2, 2, "#e6ffb8");
  drawRect(14, 8, 2, 2, "#e6ffb8");
  drawRect(10, 12, 5, 2, "#321f1f");
  ctx.restore();
  drawEnemyAccessory(enemy);
}

function drawEnemyAccessory(enemy) {
  const stage = currentStage();
  const x = enemy.x;
  const y = enemy.y;
  if (stage.scenery === "library") {
    drawRect(x + 8, y + 6, 12, 4, "#d8ccb7");
    drawRect(x + 20, y + 16, 12, 10, "#6c4f63");
  } else if (stage.scenery === "robotics") {
    drawRect(x + 8, y + 14, 8, 8, "#e3695d");
    drawRect(x + 17, y + 16, 8, 8, "#7db6d6");
  } else if (stage.scenery === "football") {
    drawRect(x + 22, y + 18, 10, 10, "#e7e7e7");
    drawRect(x + 25, y + 21, 4, 4, "#2f2f2f");
  } else if (stage.scenery === "pizza") {
    drawRect(x + 8, y + 6, 12, 6, "#f0f0f0");
    drawRect(x + 12, y + 18, 12, 10, "#cb4f43");
  } else if (stage.scenery === "pub") {
    drawRect(x + 22, y + 14, 5, 14, "#d6ae59");
  }
}

function drawProjectile(shot) {
  if (shot.type === "books") {
    drawRect(shot.x, shot.y, 15, 11, "#7e4d3f");
    drawRect(shot.x + 2, shot.y + 2, 10, 2, "#e8d8b5");
  } else if (shot.type === "rulers") {
    drawRect(shot.x, shot.y, 20, 4, "#e9d79d");
    drawRect(shot.x + 4, shot.y + 1, 1, 2, "#6e5d35");
    drawRect(shot.x + 10, shot.y + 1, 1, 2, "#6e5d35");
  } else if (shot.type === "basketballs") {
    ctx.fillStyle = "#d47a36";
    ctx.beginPath();
    ctx.arc(shot.x + 7, shot.y + 7, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (shot.type === "footballs") {
    drawRect(shot.x, shot.y, 14, 14, "#f0f0f0");
    drawRect(shot.x + 5, shot.y + 5, 4, 4, "#222");
  } else if (shot.type === "water") {
    drawRect(shot.x, shot.y, 14, 8, "#78d6ff");
  } else if (shot.type === "pizza") {
    ctx.fillStyle = "#e6c06f";
    ctx.beginPath();
    ctx.moveTo(shot.x, shot.y);
    ctx.lineTo(shot.x + 16, shot.y + 5);
    ctx.lineTo(shot.x + 2, shot.y + 14);
    ctx.closePath();
    ctx.fill();
  } else {
    drawRect(shot.x, shot.y, shot.width, shot.height, "#e3695d");
  }
}

function drawHearts() {
  let y = 18;
  for (const player of state.players) {
    for (let i = 0; i < 3; i += 1) {
      const x = 20 + i * 28;
      drawHeart(x, y, i < player.hp ? player.config.palette.heart : player.config.palette.empty);
    }
    if (state.playerCount > 1) {
      ctx.fillStyle = "#f6edcf";
      ctx.font = '13px "Rubik"';
      ctx.fillText(player.label, 112, y + 15);
    }
    y += 30;
  }
  if (state.immortal) {
    ctx.fillStyle = "#8fff96";
    ctx.font = '16px "Rubik"';
    ctx.fillText("אלמוות פעיל", 20, y + 10);
  }
}

function drawHeart(x, y, color) {
  drawRect(x + 4, y, 8, 8, color);
  drawRect(x + 12, y, 8, 8, color);
  drawRect(x + 2, y + 6, 18, 8, color);
  drawRect(x + 5, y + 14, 12, 8, color);
  drawRect(x + 8, y + 22, 6, 5, color);
}

function drawOverlayText() {
  if (state.transitionTimer > 0) {
    drawRect(130, 196, 700, 96, "rgba(24, 18, 28, 0.82)");
    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff1c7";
    ctx.font = '28px "Rubik"';
    ctx.fillText(state.transitionText, WIDTH / 2, 252);
    ctx.restore();
  }

  if (state.gameOver) {
    drawEndScreen("המשחק נגמר", "לחצו ר כדי להתחיל מחדש");
  }
  if (state.victory) {
    drawEndScreen("ניצחתם את הפלישה", "ערד חזרה לחיים. לחצו ר למשחק חדש");
  }
}

function drawEndScreen(title, subtitle) {
  drawRect(0, 0, WIDTH, HEIGHT, "rgba(8, 6, 12, 0.72)");
  drawRect(110, 128, 740, 260, "rgba(42, 30, 38, 0.92)");
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd38d";
  ctx.font = '38px "Rubik"';
  ctx.fillText(title, WIDTH / 2, 224);
  ctx.fillStyle = "#f6edcf";
  ctx.font = '22px "Rubik"';
  ctx.fillText(subtitle, WIDTH / 2, 274);
  ctx.restore();
}

function drawIntro() {
  drawBackground();
  drawRect(52, 372, 856, 118, "rgba(22, 15, 26, 0.82)");
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  const stepIndex = state.introStarted ? clamp(Math.floor(state.introTime / 3.15), 0, INTRO_STEPS.length - 1) : 0;
  const step = INTRO_STEPS[stepIndex];
  ctx.fillStyle = "#ffd38d";
  ctx.font = '28px "Rubik"';
  ctx.fillText(step.title, WIDTH / 2, 418);
  ctx.fillStyle = "#f6edcf";
  ctx.font = '20px "Rubik"';
  ctx.fillText(step.text, WIDTH / 2, 456);
  ctx.fillStyle = "#8fff96";
  ctx.font = '17px "Rubik"';
  ctx.fillText(state.introStarted ? "אנטר מדלג למשחק" : "אנטר מתחיל", WIDTH / 2, 482);
  ctx.restore();
}

function drawGame() {
  drawBackground();
  for (const enemy of state.enemies) {
    drawShadow(enemy.x + enemy.width / 2, enemy.y + enemy.height + 4, 18, 0.18);
    drawEnemy(enemy);
  }
  for (const player of state.players) {
    if (player.alive) {
      drawShadow(player.x + player.width / 2, player.y + player.height + 5, 20, 0.2);
      drawHuman(player);
    }
  }
  for (const shot of state.shots) {
    drawRect(shot.x, shot.y, shot.width, shot.height, "#ffe6a8");
    drawRect(shot.x - Math.sign(shot.vx) * 8, shot.y + 1, 10, 4, "#ffb347");
  }
  for (const shot of state.enemyShots) {
    drawProjectile(shot);
  }
  for (const particle of state.particles) {
    drawRect(particle.x, particle.y, particle.size, particle.size, particle.color);
  }
  for (const text of state.floatingTexts) {
    ctx.fillStyle = text.color;
    ctx.font = '18px "Rubik"';
    ctx.fillText(text.text, text.x, text.y);
  }
  drawHearts();
  drawOverlayText();
}

function drawShadow(x, y, width, alpha) {
  ctx.fillStyle = `rgba(25, 18, 20, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, width, 7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  if (state.mode === "intro") {
    drawIntro();
  } else {
    drawGame();
  }
}

function handleCheat(code) {
  if (!code.startsWith("Key")) {
    return;
  }
  state.cheatBuffer.push(code);
  if (state.cheatBuffer.length > CHEAT_CODE.length) {
    state.cheatBuffer.shift();
  }
  if (CHEAT_CODE.every((key, index) => state.cheatBuffer[index] === key)) {
    state.immortal = !state.immortal;
    state.cheatBuffer = [];
    setStatus(state.immortal ? "אלמוות פעיל" : "אלמוות כבוי");
  }
}

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  handleCheat(event.code);

  if (event.code === "Digit1") {
    setPlayerCount(1);
    return;
  }
  if (event.code === "Digit2") {
    setPlayerCount(2);
    return;
  }
  if (event.code === "KeyR") {
    resetGame();
    return;
  }
  if (event.code === "Enter") {
    if (state.mode === "intro" && state.introStarted) {
      beginGame();
    } else if (state.mode === "intro") {
      startIntro();
    }
    return;
  }

  if (state.mode !== "playing") {
    return;
  }

  for (const player of activePlayers()) {
    if (player.config.jump.includes(event.code) && player.onGround) {
      player.vy = -JUMP_FORCE;
      player.onGround = false;
    }
    if (player.config.shoot.includes(event.code)) {
      fireShot(player);
    }
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

canvas.addEventListener("pointerdown", () => {
  if (state.mode === "intro") {
    startIntro();
  }
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  if (state.mode === "playing") {
    fireShot(activePlayers()[0] ?? state.players[0]);
  }
});

modeOneEl?.addEventListener("click", () => setPlayerCount(1));
modeTwoEl?.addEventListener("click", () => setPlayerCount(2));

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

resetGame();
requestAnimationFrame(loop);
