const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const healthEl = document.getElementById("health");
const waveEl = document.getElementById("wave");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const hintEl = document.getElementById("hint");
const missionEl = document.getElementById("mission");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = HEIGHT - 92;
const GRAVITY = 1800;
const PLAYER_SPEED = 220;
const JUMP_FORCE = 650;
const ZOMBIE_BASE_SPEED = 70;
const CHEAT_CODE = ["KeyI", "KeyM", "KeyM", "KeyO", "KeyR", "KeyT", "KeyA", "KeyL"];

const keys = new Set();

const introSteps = [
  {
    until: 3.2,
    title: "יום רגיל בקדם ערד",
    text: "הילד יושב בכיתה בבית הספר קדם בערד, מול המדבר וההרים, בבוקר רגיל לפני האסון.",
  },
  {
    until: 6.4,
    title: "משהו מגיע מהשמיים",
    text: "קרן חייזרית פוגעת בחצר של קדם. המורים והתלמידים קורסים ואז קמים מחדש כזומבים.",
  },
  {
    until: 9.8,
    title: "בריחה לבונקר",
    text: "הילד ננעל במקרה בבונקר יחד עם עוד כמה ניצולים שמנסים להחזיק מעמד.",
  },
  {
    until: 13.2,
    title: "האחרון שנשאר",
    text: "הזומבים מוצאים גם אותם. החברים נופלים, והוא נשאר האדם האחרון.",
  },
];

const stageDefs = [
  {
    name: "חצר קדם בערד",
    status: "בריחה",
    hint: "חסלו 5 תלמידים נגועים ואז ברחו לשער המילוט.",
    objective: "killGate",
    target: 5,
    scenery: "kedemYard",
    zombies: 5,
    aliens: 0,
  },
  {
    name: "מגרש הכדורגל של קדם",
    status: "תאורה",
    hint: "הפעילו 3 עמודי תאורה כדי לראות את הרצים הנגועים.",
    objective: "activate",
    target: 3,
    scenery: "football",
    zombies: 4,
    aliens: 0,
  },
  {
    name: "הגן",
    status: "טיהור",
    hint: "השמידו 3 קינים בין המגלשות והנדנדות.",
    objective: "destroy",
    target: 3,
    scenery: "kindergarten",
    zombies: 5,
    aliens: 0,
  },
  {
    name: "מרחב א-ג",
    status: "פינוי",
    hint: "חסלו 6 נגועים קטנים והגיעו לדלת היציאה.",
    objective: "killGate",
    target: 6,
    scenery: "agClass",
    zombies: 5,
    aliens: 0,
  },
  {
    name: "מרחב ד-ו",
    status: "נעילה",
    hint: "הפעילו 3 לוחות כריזה כדי לאטום את האזור.",
    objective: "activate",
    target: 3,
    scenery: "dvClass",
    zombies: 6,
    aliens: 0,
  },
  {
    name: "התיכון",
    status: "קשר",
    hint: "הדליקו 2 אנטנות, צרו קשר עם שורד, והגיעו אליו.",
    objective: "beaconContact",
    target: 2,
    scenery: "highSchool",
    zombies: 5,
    aliens: 1,
  },
  {
    name: "החצר",
    status: "טיהור",
    hint: "השמידו 3 קיני זוהמה ליד הסככה והעצים.",
    objective: "destroy",
    target: 3,
    scenery: "courtyard",
    zombies: 6,
    aliens: 1,
  },
  {
    name: "המתנ\"ס",
    status: "חילוץ",
    hint: "הפעילו 3 ארונות חילוץ כדי לפתוח את אגף המקלטים.",
    objective: "activate",
    target: 3,
    scenery: "matnas",
    zombies: 6,
    aliens: 1,
  },
  {
    name: "תפוח פיס",
    status: "ניקוי רשת",
    hint: "השמידו 3 קני פלישה בין המחשבים והמסכים.",
    objective: "destroy",
    target: 3,
    scenery: "pis",
    zombies: 5,
    aliens: 2,
  },
  {
    name: "מגרש הספורט",
    status: "הסתערות",
    hint: "חסלו 7 שחקנים נגועים והגיעו לשער.",
    objective: "killGate",
    target: 7,
    scenery: "sportsField",
    zombies: 6,
    aliens: 1,
  },
  {
    name: "הקניון",
    status: "טיהור",
    hint: "השמידו 3 קיני זוהמה בין החנויות.",
    objective: "destroy",
    target: 3,
    scenery: "mall",
    zombies: 6,
    aliens: 2,
  },
  {
    name: "הספריה",
    status: "שחזור מידע",
    hint: "הפעילו 3 עמדות ארכיון כדי לאתר את מקור הפלישה.",
    objective: "activate",
    target: 3,
    scenery: "library",
    zombies: 5,
    aliens: 1,
  },
  {
    name: "חוג רובוטיקה במתנ\"ס",
    status: "הפעלה",
    hint: "הפעילו 3 ספסלי רובוטיקה כדי לייצב את עוזר הקרב.",
    objective: "activate",
    target: 3,
    scenery: "robotics",
    zombies: 6,
    aliens: 2,
  },
  {
    name: "מרכז קניות צים",
    status: "פינוי",
    hint: "חסלו 8 נגועים בין החנויות והגיעו ליציאה.",
    objective: "killGate",
    target: 8,
    scenery: "zim",
    zombies: 7,
    aliens: 1,
  },
  {
    name: "שופרסל",
    status: "אבטחה",
    hint: "השמידו 3 קינים בין המדפים והמקררים.",
    objective: "destroy",
    target: 3,
    scenery: "supermarket",
    zombies: 6,
    aliens: 2,
  },
  {
    name: "פאב המוזה",
    status: "הדיפה",
    hint: "חסלו 8 נגועים סביב הבמה ופתחו את הדרך החוצה.",
    objective: "killGate",
    target: 8,
    scenery: "pub",
    zombies: 7,
    aliens: 2,
  },
  {
    name: "פיצה כפרוצ׳קה",
    status: "קרב אחרון",
    hint: "פוצצו את ליבת החייזרים שנבנתה בתוך הטאבון.",
    objective: "boss",
    target: 16,
    scenery: "pizza",
    zombies: 6,
    aliens: 3,
  },
];

const state = {
  player: null,
  zombies: [],
  aliens: [],
  shots: [],
  particles: [],
  floatingTexts: [],
  bunkerFriends: [],
  wave: 1,
  score: 0,
  time: 0,
  gameOver: false,
  victory: false,
  mode: "intro",
  introTime: 0,
  introStep: 0,
  stageIndex: -1,
  stageKills: 0,
  spawnTimer: 0,
  alienSpawnTimer: 0,
  invulnerableTimer: 0,
  shotCooldown: 0,
  mission: "",
  transitionTimer: 0,
  transitionText: "",
  generators: [],
  beacons: [],
  nests: [],
  survivor: null,
  ally: null,
  dialogueTimer: 0,
  dialogueText: "",
  exitGate: null,
  core: null,
  immortal: false,
  cheatBuffer: [],
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

function createBunkerFriends() {
  return [
    { x: 308, y: GROUND_Y - 54, infected: false },
    { x: 372, y: GROUND_Y - 54, infected: false },
    { x: 436, y: GROUND_Y - 54, infected: false },
  ];
}

function resetGame() {
  state.player = createPlayer();
  state.zombies = [];
  state.aliens = [];
  state.shots = [];
  state.particles = [];
  state.floatingTexts = [];
  state.bunkerFriends = createBunkerFriends();
  state.wave = 1;
  state.score = 0;
  state.time = 0;
  state.gameOver = false;
  state.victory = false;
  state.mode = "intro";
  state.introTime = 0;
  state.introStep = 0;
  state.stageIndex = -1;
  state.stageKills = 0;
  state.spawnTimer = 0;
  state.alienSpawnTimer = 0;
  state.invulnerableTimer = 0;
  state.shotCooldown = 0;
  state.mission = "התחילו את סצנת הפתיחה";
  state.transitionTimer = 0;
  state.transitionText = "";
  state.generators = [];
  state.beacons = [];
  state.nests = [];
  state.survivor = null;
  state.ally = null;
  state.dialogueTimer = 0;
  state.dialogueText = "";
  state.exitGate = null;
  state.core = null;
  state.immortal = false;
  state.cheatBuffer = [];
  setStatus("פתיחה");
  setHint("לחצו אנטר או לחצו על המסך כדי להתחיל את סצנת הפתיחה.");
  syncHud();
}

function syncHud() {
  healthEl.textContent = "לבבות";
  waveEl.textContent = state.stageIndex >= 0 ? `${state.stageIndex + 1}/${stageDefs.length}` : `0/${stageDefs.length}`;
  scoreEl.textContent = String(state.score);
  missionEl.textContent = state.mission;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setHint(text) {
  hintEl.textContent = text;
}

function setMission(text) {
  state.mission = text;
  missionEl.textContent = text;
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

function resolvePlatformLanding(entity, previousY) {
  const previousBottom = previousY + entity.height;
  const currentBottom = entity.y + entity.height;
  let landingPlatform = null;

  for (const platform of platforms) {
    const crossesPlatformTop =
      entity.x + entity.width > platform.x &&
      entity.x < platform.x + platform.width &&
      previousBottom <= platform.y &&
      currentBottom >= platform.y;

    if (!crossesPlatformTop) {
      continue;
    }

    if (!landingPlatform || platform.y < landingPlatform.y) {
      landingPlatform = platform;
    }
  }

  if (!landingPlatform) {
    return false;
  }

  entity.y = landingPlatform.y - entity.height;
  entity.vy = 0;
  return true;
}

function currentStageDef() {
  return stageDefs[state.stageIndex];
}

function createActivationNodes(count) {
  const positions = [
    { x: 168, y: 300 },
    { x: 390, y: 242 },
    { x: 620, y: 208 },
    { x: 794, y: 288 },
  ];
  return positions.slice(0, count).map((pos) => ({
    x: pos.x,
    y: pos.y,
    width: 32,
    height: 40,
    active: false,
  }));
}

function createNestSet(count) {
  const positions = [
    { x: 214, y: 288 },
    { x: 502, y: 230 },
    { x: 788, y: 288 },
    { x: 650, y: 176 },
  ];
  return positions.slice(0, count).map((pos) => ({
    x: pos.x,
    y: pos.y,
    width: 44,
    height: 38,
    hp: 4,
    maxHp: 4,
  }));
}

function createBeaconSet(count) {
  const positions = [
    { x: 148, y: 248 },
    { x: 694, y: 156 },
    { x: 812, y: 278 },
  ];
  return positions.slice(0, count).map((pos) => ({
    x: pos.x,
    y: pos.y,
    width: 28,
    height: 52,
    active: false,
  }));
}

function getSpawnPoints(index) {
  const sets = [
    [
      { x: 540, y: GROUND_Y - 56, side: 1 },
      { x: 620, y: GROUND_Y - 56, side: 1 },
      { x: 700, y: GROUND_Y - 56, side: 1 },
      { x: 820, y: GROUND_Y - 56, side: 1 },
      { x: 610, y: 192, side: 1 },
    ],
    [
      { x: 760, y: GROUND_Y - 56, side: 1 },
      { x: 640, y: 192, side: 1 },
      { x: 420, y: 226, side: 1 },
      { x: 220, y: 284, side: -1 },
    ],
    [
      { x: 170, y: 284, side: -1 },
      { x: 420, y: 226, side: 1 },
      { x: 648, y: 192, side: 1 },
      { x: 820, y: 284, side: 1 },
    ],
    [
      { x: 180, y: GROUND_Y - 56, side: -1 },
      { x: 420, y: 226, side: 1 },
      { x: 640, y: 192, side: 1 },
      { x: 830, y: GROUND_Y - 56, side: 1 },
    ],
  ];
  return sets[index % sets.length];
}

function configureStage(index) {
  const stage = stageDefs[index];

  state.stageIndex = index;
  state.wave = index + 1;
  state.stageKills = 0;
  state.zombies = [];
  state.aliens = [];
  state.shots = [];
  state.particles = [];
  state.floatingTexts = [];
  state.spawnTimer = 0.6;
  state.alienSpawnTimer = 1.4;
  state.transitionTimer = 0;
  state.transitionText = "";
  state.exitGate = null;
  state.generators = [];
  state.beacons = [];
  state.nests = [];
  const existingAlly = state.ally;
  state.survivor = null;
  state.dialogueTimer = 0;
  state.dialogueText = "";
  state.core = null;
  state.shotCooldown = 0;
  state.invulnerableTimer = 0.4;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.facing = 1;
  state.player.hp = clamp(state.player.hp + (index > 0 ? 1 : 0), 1, 3);

  state.player.x = 120;
  state.player.y = 220;

  if (stage.objective === "killGate") {
    state.exitGate = { x: 892, y: GROUND_Y - 96, width: 42, height: 96, active: false };
    setMission(`חסלו ${stage.target} נגועים ואז עברו לשער.`);
  } else if (stage.objective === "activate") {
    state.generators = createActivationNodes(stage.target);
    setMission(`הפעילו ${stage.target} עמדות במקום.`);
  } else if (stage.objective === "destroy") {
    state.nests = createNestSet(stage.target);
    setMission(`השמידו ${stage.target} מוקדי פלישה.`);
  } else if (stage.objective === "beaconContact") {
    state.beacons = createBeaconSet(stage.target);
    state.survivor = {
      x: 816,
      y: 284,
      width: 26,
      height: 54,
      active: false,
      contacted: false,
      inBunker: false,
      recruited: false,
    };
    setMission(`הדליקו ${stage.target} אנטנות וצאו לקשר.`);
  } else if (stage.objective === "boss") {
    state.core = { x: 758, y: 112, width: 96, height: 96, hp: stage.target, maxHp: stage.target };
    setMission("השמידו את ליבת החייזרים בתוך הטאבון.");
  }

  setStatus(stage.status);
  setHint(stage.hint);
  state.ally = existingAlly?.active
    ? { ...existingAlly, x: state.player.x + 54, y: state.player.y, shootCooldown: 0 }
    : null;
  seedStageEnemies();
  syncHud();
}

function beginSurvivalMode() {
  if (state.mode === "survival") {
    return;
  }

  state.mode = "survival";
  configureStage(0);
}

function spawnZombie(options = {}) {
  const side = options.side ?? (Math.random() < 0.5 ? -1 : 1);
  const stageFactor = 1 + state.stageIndex * 0.15;
  const speed = ZOMBIE_BASE_SPEED * stageFactor + Math.random() * 24;
  const x =
    options.x ??
    (side < 0 ? -40 : WIDTH + 40);
  const y = options.y ?? (GROUND_Y - 56);
  state.zombies.push({
    type: "zombie",
    x,
    y,
    width: 28,
    height: 56,
    vx: side < 0 ? speed : -speed,
    vy: 0,
    speed,
    hp: state.stageIndex >= 8 ? 2 : 1,
    tint: Math.random() < 0.5 ? "#9df57a" : "#89ffd2",
  });
}

function spawnAlienDrone() {
  state.aliens.push({
    type: "alien",
    x: 560 + Math.random() * 260,
    y: 80 + Math.random() * 140,
    width: 30,
    height: 20,
    vx: Math.random() < 0.5 ? -90 : 90,
    hp: 2,
    bob: Math.random() * Math.PI * 2,
  });
}

function seedStageEnemies() {
  const stage = currentStageDef();
  const spawnPoints = getSpawnPoints(state.stageIndex);
  while (state.zombies.length < stage.zombies) {
    spawnZombie(spawnPoints[state.zombies.length % spawnPoints.length]);
  }
  while (state.aliens.length < stage.aliens) {
    spawnAlienDrone();
  }
}

function fireShot() {
  if (
    state.gameOver ||
    state.victory ||
    state.mode !== "survival" ||
    state.transitionTimer > 0 ||
    state.shotCooldown > 0
  ) {
    return;
  }

  const { player } = state;
  state.shots.push({
    source: "player",
    x: player.x + player.width / 2 + player.facing * 18,
    y: player.y + 18,
    vx: player.facing * 520,
    vy: 0,
    width: 18,
    height: 6,
    ttl: 0.55,
  });
  player.shootFlash = 0.12;
  state.shotCooldown = 0.22;
  setHint("ירי בוצע. רווח או קליק ימני לירייה הבאה.");
}

function fireAllyShot(targetX, targetY) {
  if (!state.ally?.active) {
    return;
  }

  const dx = targetX - state.ally.x;
  const dy = targetY - (state.ally.y + 20);
  const distance = Math.max(1, Math.hypot(dx, dy));
  state.ally.facing = dx >= 0 ? 1 : -1;
  state.shots.push({
    source: "ally",
    x: state.ally.x + state.ally.width / 2 + state.ally.facing * 16,
    y: state.ally.y + 18,
    vx: (dx / distance) * 460,
    vy: (dy / distance) * 460,
    width: 16,
    height: 5,
    ttl: 0.7,
  });
  state.ally.shootCooldown = 0.9;
}

function addExplosion(x, y, color, amount = 12) {
  for (let i = 0; i < amount; i += 1) {
    const angle = (Math.PI * 2 * i) / amount;
    const speed = 70 + Math.random() * 90;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      ttl: 0.45 + Math.random() * 0.2,
      color,
      size: 4 + Math.random() * 3,
    });
  }
}

function addFloatingText(x, y, text, color) {
  state.floatingTexts.push({ x, y, text, color, ttl: 0.8 });
}

function damagePlayer() {
  if (
    state.immortal ||
    state.invulnerableTimer > 0 ||
    state.gameOver ||
    state.victory ||
    state.mode !== "survival" ||
    state.transitionTimer > 0
  ) {
    return;
  }

  state.player.hp -= 1;
  state.invulnerableTimer = 1.25;
  addFloatingText(state.player.x, state.player.y - 12, "-1", "#ff5d73");
  syncHud();

  if (state.player.hp <= 0) {
    state.gameOver = true;
    setStatus("האפלה");
    setHint("לחצו ר כדי להתחיל מחדש.");
  } else {
    setStatus("נפגע");
  }
}

function handleCheatCode(code) {
  if (!code.startsWith("Key")) {
    return;
  }

  state.cheatBuffer.push(code);
  if (state.cheatBuffer.length > CHEAT_CODE.length) {
    state.cheatBuffer.shift();
  }

  const matches = CHEAT_CODE.every((key, index) => state.cheatBuffer[index] === key);
  if (!matches) {
    return;
  }

  state.immortal = !state.immortal;
  state.cheatBuffer = [];
  setStatus(state.immortal ? "קוד צ'יט פעיל" : "קוד צ'יט כבוי");
  setHint(state.immortal ? "מצב אלמוות פעיל. הקלידו IMMORTAL שוב כדי לכבות." : "מצב אלמוות כובה.");
}

function jumpPlayer() {
  if (
    state.player.onGround &&
    !state.gameOver &&
    !state.victory &&
    state.mode === "survival" &&
    state.transitionTimer <= 0
  ) {
    state.player.vy = -JUMP_FORCE;
    state.player.onGround = false;
  }
}

function startIntro() {
  if (state.mode !== "intro" || state.introTime > 0) {
    return;
  }

  state.introTime = 0.01;
  setStatus("פלישה");
  setHint("לחצו אנטר כדי לדלג ישירות לשלב הראשון.");
  setMission("צפו בפתיחה או דלגו אל המשחק.");
  syncHud();
}

function completeStage(text) {
  if (state.transitionTimer > 0 || state.victory) {
    return;
  }

  state.transitionTimer = 2.4;
  state.transitionText = text;
  setStatus("משימה הושלמה");
  setHint("המעבר לשלב הבא מתחיל מיד.");
}

function triggerVictory() {
  if (state.victory) {
    return;
  }

  state.victory = true;
  state.transitionTimer = 0;
  state.transitionText = "";
  state.zombies = [];
  state.aliens = [];
  addExplosion(state.core ? state.core.x + 48 : WIDTH / 2, 180, "#ffb347", 18);
  setStatus("ניצחון");
  setMission("הליבה הושמדה. הפלישה קרסה.");
  setHint("ניצחתם. לחצו ר כדי לשחק שוב.");
  syncHud();
}

function updateIntro(dt) {
  if (state.introTime <= 0) {
    return;
  }

  state.introTime += dt;

  for (let i = 0; i < introSteps.length; i += 1) {
    if (state.introTime <= introSteps[i].until) {
      state.introStep = i;
      break;
    }
    state.introStep = introSteps.length - 1;
  }

  if (state.introTime > 8.2) {
    const infection = clamp((state.introTime - 8.2) / 3, 0, 1);
    state.bunkerFriends.forEach((friend, index) => {
      friend.infected = infection > 0.2 + index * 0.18;
    });
  }

  if (state.introTime >= introSteps[introSteps.length - 1].until) {
    beginSurvivalMode();
  }
}

function updatePlayer(dt) {
  const { player } = state;
  const previousY = player.y;
  const moveLeft = keys.has("ArrowLeft") || keys.has("KeyA");
  const moveRight = keys.has("ArrowRight") || keys.has("KeyD");
  const desired = Number(moveRight) - Number(moveLeft);

  player.vx = desired * PLAYER_SPEED;
  if (desired !== 0) {
    player.facing = desired;
  }

  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.x = clamp(player.x, 0, WIDTH - player.width);
  player.onGround = player.vy >= 0 && resolvePlatformLanding(player, previousY);

  if (player.y > HEIGHT + 120) {
    damagePlayer();
    player.x = 120;
    player.y = 220;
    player.vx = 0;
    player.vy = 0;
  }

  player.shootFlash = Math.max(0, player.shootFlash - dt);
}

function updateZombies(dt) {
  const { player } = state;

  for (const zombie of state.zombies) {
    const previousY = zombie.y;
    const direction = zombie.x < player.x ? 1 : -1;
    zombie.vx = direction * zombie.speed;
    zombie.vy += GRAVITY * dt;
    zombie.x += zombie.vx * dt;
    zombie.y += zombie.vy * dt;

    if (zombie.vy >= 0) {
      resolvePlatformLanding(zombie, previousY);
    }

    if (rectsOverlap(player, zombie)) {
      damagePlayer();
    }
  }

  state.zombies = state.zombies.filter((zombie) => zombie.x > -120 && zombie.x < WIDTH + 120);
}

function updateAliens(dt) {
  for (const alien of state.aliens) {
    alien.x += alien.vx * dt;
    alien.bob += dt * 3;
    alien.y += Math.sin(alien.bob) * 24 * dt;

    if (alien.x < 520 || alien.x > WIDTH - 60) {
      alien.vx *= -1;
    }

    if (rectsOverlap(state.player, alien)) {
      damagePlayer();
    }
  }
}

function updateAlly(dt) {
  if (!state.ally?.active) {
    return;
  }

  const ally = state.ally;
  const anchorX = clamp(state.player.x + 54, 40, WIDTH - 80);
  ally.x += (anchorX - ally.x) * Math.min(1, dt * 4);
  ally.y = GROUND_Y - ally.height;
  ally.shootCooldown = Math.max(0, ally.shootCooldown - dt);

  const targets = [...state.zombies, ...state.aliens];
  if (state.core?.hp > 0) {
    targets.push({
      x: state.core.x + state.core.width / 2,
      y: state.core.y + state.core.height / 2,
      width: 1,
      height: 1,
    });
  }

  if (targets.length === 0 || ally.shootCooldown > 0) {
    return;
  }

  let nearest = targets[0];
  let nearestDistance = Infinity;
  for (const target of targets) {
    const tx = target.x + (target.width ?? 0) / 2;
    const ty = target.y + (target.height ?? 0) / 2;
    const distance = Math.hypot(tx - ally.x, ty - ally.y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { x: tx, y: ty };
    }
  }

  fireAllyShot(nearest.x, nearest.y);
}

function updateShots(dt) {
  for (const shot of state.shots) {
    shot.x += shot.vx * dt;
    shot.y += (shot.vy ?? 0) * dt;
    shot.ttl -= dt;
  }

  for (const shot of state.shots) {
    if (shot.ttl <= 0) {
      continue;
    }

    for (const zombie of state.zombies) {
      if (!rectsOverlap(shot, zombie)) {
        continue;
      }

      zombie.hp -= 1;
      shot.ttl = 0;
      addExplosion(shot.x, shot.y, "#ffb347");

      if (zombie.hp <= 0) {
        zombie.dead = true;
        state.score += 1;
        state.stageKills += 1;
        addFloatingText(zombie.x, zombie.y - 8, "+1", "#8fff96");
        addExplosion(zombie.x + zombie.width / 2, zombie.y + 20, zombie.tint);
        syncHud();
      }
      break;
    }

    if (shot.ttl <= 0) {
      continue;
    }

    for (const alien of state.aliens) {
      if (!rectsOverlap(shot, alien)) {
        continue;
      }

      alien.hp -= 1;
      shot.ttl = 0;
      addExplosion(shot.x, shot.y, "#7ffff0", 10);

      if (alien.hp <= 0) {
        alien.dead = true;
        state.score += 2;
        addFloatingText(alien.x, alien.y - 8, "+2", "#7ffff0");
        addExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, "#7ffff0", 14);
        syncHud();
      }
      break;
    }

    if (shot.ttl <= 0) {
      continue;
    }

    if (state.nests.length > 0) {
      for (const nest of state.nests) {
        if (nest.hp <= 0 || !rectsOverlap(shot, nest)) {
          continue;
        }

        nest.hp -= 1;
        shot.ttl = 0;
        addExplosion(shot.x, shot.y, "#d98b63", 8);
        if (nest.hp <= 0) {
          state.score += 3;
          addFloatingText(nest.x, nest.y - 8, "+3", "#ffd38d");
          addExplosion(nest.x + nest.width / 2, nest.y + nest.height / 2, "#ffd38d", 16);
          syncHud();
        }
        break;
      }
    }

    if (shot.ttl <= 0 || !state.core || state.core.hp <= 0) {
      continue;
    }

    if (rectsOverlap(shot, state.core)) {
      state.core.hp -= 1;
      shot.ttl = 0;
      addExplosion(shot.x, shot.y, "#ff5d73", 8);

      if (state.core.hp <= 0) {
        triggerVictory();
      } else {
        setMission(`פוצצו את ליבת החייזרים. נשארו ${state.core.hp} פגיעות.`);
      }
    }
  }

  state.shots = state.shots.filter(
    (shot) => shot.ttl > 0 && shot.x > -40 && shot.x < WIDTH + 40,
  );
  state.zombies = state.zombies.filter((zombie) => !zombie.dead);
  state.aliens = state.aliens.filter((alien) => !alien.dead);
  state.nests = state.nests.filter((nest) => nest.hp > 0);
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
  state.shotCooldown = Math.max(0, state.shotCooldown - dt);
  state.dialogueTimer = Math.max(0, state.dialogueTimer - dt);

  if (state.dialogueTimer === 0 && state.dialogueText) {
    state.dialogueText = "";
  }
}

function updateStageObjective() {
  const stage = currentStageDef();

  if (stage.objective === "killGate") {
    if (state.stageKills >= stage.target) {
      state.exitGate.active = true;
      setMission("השער נפתח. הגיעו אליו כדי לעבור למסך הבא.");
      if (rectsOverlap(state.player, state.exitGate)) {
        completeStage(`המעבר מ-${stage.name} הושלם...`);
      }
    } else {
      setMission(`חסלו עוד ${stage.target - state.stageKills} נגועים ואז ברחו לשער.`);
    }
  } else if (stage.objective === "activate") {
    for (const generator of state.generators) {
      if (!generator.active && rectsOverlap(state.player, generator)) {
        generator.active = true;
        addFloatingText(generator.x - 10, generator.y - 8, "פועל", "#8fff96");
        addExplosion(generator.x + 16, generator.y + 16, "#8fff96", 8);
      }
    }

    const activeCount = state.generators.filter((generator) => generator.active).length;
    if (activeCount >= state.generators.length) {
      completeStage(`השלב ב-${stage.name} נפתח הלאה...`);
    } else {
      setMission(`הפעילו עוד ${state.generators.length - activeCount} עמדות ב-${stage.name}.`);
    }
  } else if (stage.objective === "beaconContact") {
    for (const beacon of state.beacons) {
      if (!beacon.active && rectsOverlap(state.player, beacon)) {
        beacon.active = true;
        addFloatingText(beacon.x - 6, beacon.y - 8, "שידור", "#ffd38d");
        addExplosion(beacon.x + 14, beacon.y + 16, "#ffd38d", 10);
      }
    }

    const activeCount = state.beacons.filter((beacon) => beacon.active).length;
    if (activeCount >= state.beacons.length) {
      if (!state.survivor.inBunker) {
        state.survivor.active = true;
        state.survivor.inBunker = true;
        state.zombies = [];
        state.aliens = [];
        state.player.x = 220;
        state.player.y = GROUND_Y - state.player.height;
        state.survivor.x = 620;
        state.survivor.y = GROUND_Y - state.survivor.height;
      }

      setMission("הגעתם לחדר הקשר. דברו עם השורד.");
      setHint("התקרבו לשורד כדי לשמוע מה קרה בעיר.");
      if (!state.survivor.contacted && rectsOverlap(state.player, state.survivor)) {
        state.survivor.contacted = true;
        state.survivor.recruited = true;
        state.ally = {
          active: true,
          x: 560,
          y: GROUND_Y - state.player.height,
          width: 26,
          height: 54,
          facing: -1,
          shootCooldown: 0.4,
        };
        state.dialogueTimer = 6.4;
        state.dialogueText =
          "השורד: ערד נפלה כי הקרן שיבשה את כל המערכות. הליבה האחרונה מתחבאת בפיצה כפרוצ׳קה. אני איתך.";
        setStatus("שיחה");
        setHint("אחרי השיחה הוא יצטרף אליכם לקרב.");
        completeStage("השורד הצטרף. ממשיכים יחד דרך אתרי העיר...");
        state.transitionTimer = 6.4;
      }
    } else {
      setMission(`הדליקו עוד ${state.beacons.length - activeCount} אנטנות.`);
    }
  } else if (stage.objective === "destroy") {
    if (state.nests.length === 0) {
      completeStage(`מוקדי הפלישה ב-${stage.name} הושמדו...`);
    } else {
      setMission(`השמידו עוד ${state.nests.length} מוקדי פלישה ב-${stage.name}.`);
    }
  } else if (stage.objective === "boss" && state.core && state.core.hp > 0) {
    setMission(`פוצצו את ליבת החייזרים בטאבון. נשארו ${state.core.hp} פגיעות.`);
  }
}

function updateSpawns(dt) {
  if (state.gameOver || state.victory || state.transitionTimer > 0) {
    return;
  }

  const stage = currentStageDef();
  state.spawnTimer -= dt;
  state.alienSpawnTimer -= dt;

  if (stage.objective === "killGate") {
    if (state.zombies.length === 0 && state.stageKills < stage.target) {
      seedStageEnemies();
    }
    if (state.stageKills < stage.target && state.zombies.length < stage.zombies && state.spawnTimer <= 0) {
      spawnZombie();
      state.spawnTimer = 0.7 + Math.random() * 0.45;
    }
  } else if (stage.objective === "activate") {
    const activeCount = state.generators.filter((generator) => generator.active).length;
    if (activeCount < state.generators.length && state.zombies.length === 0) {
      seedStageEnemies();
    }
    if (activeCount < state.generators.length && state.zombies.length < stage.zombies && state.spawnTimer <= 0) {
      spawnZombie();
      state.spawnTimer = 0.95 + Math.random() * 0.55;
    }
    if (stage.aliens > 0 && state.aliens.length < stage.aliens && state.alienSpawnTimer <= 0) {
      spawnAlienDrone();
      state.alienSpawnTimer = 2 + Math.random() * 1.1;
    }
  } else if (stage.objective === "beaconContact") {
    if (state.survivor?.inBunker) {
      state.zombies = [];
      state.aliens = [];
      return;
    }
    if (state.zombies.length === 0 || (stage.aliens > 0 && state.aliens.length === 0)) {
      seedStageEnemies();
    }
    if (state.zombies.length < stage.zombies && state.spawnTimer <= 0) {
      spawnZombie();
      state.spawnTimer = 0.8 + Math.random() * 0.45;
    }
    if (state.aliens.length < stage.aliens && state.alienSpawnTimer <= 0) {
      spawnAlienDrone();
      state.alienSpawnTimer = 2 + Math.random() * 1.1;
    }
  } else if (stage.objective === "destroy") {
    if (state.zombies.length === 0 || (stage.aliens > 0 && state.aliens.length === 0)) {
      seedStageEnemies();
    }
    if (state.zombies.length < stage.zombies && state.spawnTimer <= 0) {
      spawnZombie();
      state.spawnTimer = 0.7 + Math.random() * 0.45;
    }
    if (state.aliens.length < stage.aliens && state.alienSpawnTimer <= 0) {
      spawnAlienDrone();
      state.alienSpawnTimer = 1.8 + Math.random() * 1;
    }
  } else if (stage.objective === "boss") {
    if (state.zombies.length === 0 || (stage.aliens > 0 && state.aliens.length === 0)) {
      seedStageEnemies();
    }
    if (state.zombies.length < stage.zombies && state.spawnTimer <= 0) {
      spawnZombie();
      state.spawnTimer = 0.85 + Math.random() * 0.55;
    }
    if (state.aliens.length < stage.aliens && state.alienSpawnTimer <= 0) {
      spawnAlienDrone();
      state.alienSpawnTimer = 2 + Math.random() * 1.2;
    }
  }
}

function updateTransitions(dt) {
  if (state.transitionTimer <= 0) {
    return;
  }

  state.transitionTimer -= dt;
  if (state.transitionTimer > 0) {
    return;
  }

  if (state.stageIndex < stageDefs.length - 1) {
    configureStage(state.stageIndex + 1);
  }
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

function drawDetailedHuman(x, y, palette, mirrored = false, shooting = false) {
  ctx.save();
  ctx.translate(x, y + 7);
  ctx.scale(0.9, 0.9);
  if (mirrored) {
    ctx.scale(-1, 1);
    ctx.translate(-26, 0);
  }

  ctx.fillStyle = palette.coatShadow ?? "#6f5d58";
  ctx.fillRect(5, 18, 16, 30);
  ctx.fillStyle = palette.skinShadow;
  ctx.fillRect(8, 5, 10, 11);
  ctx.fillStyle = palette.skin;
  ctx.fillRect(9, 6, 8, 9);
  ctx.fillStyle = palette.neck ?? palette.skinShadow;
  ctx.fillRect(11, 15, 4, 3);
  ctx.fillStyle = palette.hair;
  ctx.fillRect(7, 2, 12, 5);
  ctx.fillRect(6, 5, 2, 4);
  ctx.fillRect(18, 5, 2, 4);
  ctx.fillStyle = palette.shirtShadow;
  ctx.fillRect(6, 18, 14, 15);
  ctx.fillStyle = palette.shirt;
  ctx.fillRect(8, 19, 10, 12);
  ctx.fillStyle = palette.collar ?? "#d8d2c3";
  ctx.fillRect(10, 18, 6, 2);
  ctx.fillStyle = palette.coat ?? "#8a756c";
  ctx.fillRect(4, 20, 3, 24);
  ctx.fillRect(19, 20, 3, 24);
  ctx.fillRect(7, 31, 12, 12);
  ctx.fillStyle = palette.arm;
  ctx.fillRect(3, 19, 3, 11);
  if (shooting) {
    ctx.fillRect(18, 19, 7, 3);
    ctx.fillRect(24, 18, 5, 4);
    ctx.fillStyle = palette.hand ?? palette.arm;
    ctx.fillRect(28, 18, 2, 3);
  } else {
    ctx.fillRect(20, 19, 3, 11);
  }
  ctx.fillStyle = palette.pantsShadow;
  ctx.fillRect(8, 33, 4, 15);
  ctx.fillRect(14, 33, 4, 15);
  ctx.fillStyle = palette.pants;
  ctx.fillRect(9, 34, 2, 12);
  ctx.fillRect(15, 34, 2, 12);
  ctx.fillStyle = palette.boots;
  ctx.fillRect(7, 48, 5, 4);
  ctx.fillRect(14, 48, 5, 4);
  ctx.fillStyle = "#f7efcf";
  ctx.fillRect(10, 9, 1, 1);
  ctx.fillRect(15, 9, 1, 1);
  ctx.fillStyle = palette.cheek ?? "rgba(177, 92, 78, 0.55)";
  ctx.fillRect(9, 12, 1, 1);

  ctx.restore();
}

function drawZombieFigure(x, y, palette, mirrored = false) {
  ctx.save();
  ctx.translate(x, y + 18);
  ctx.scale(0.72, 0.72);
  if (mirrored) {
    ctx.scale(-1, 1);
    ctx.translate(-24, 0);
  }

  ctx.fillStyle = "#201717";
  ctx.fillRect(4, 2, 18, 48);

  ctx.fillStyle = palette.skin;
  ctx.fillRect(6, 4, 12, 10);
  ctx.fillStyle = palette.hair;
  ctx.fillRect(6, 4, 12, 4);
  ctx.fillStyle = palette.shirt;
  ctx.fillRect(4, 16, 16, 13);
  ctx.fillStyle = palette.pants;
  ctx.fillRect(5, 29, 6, 13);
  ctx.fillRect(13, 29, 6, 13);
  ctx.fillStyle = palette.arm;
  ctx.fillRect(1, 17, 4, 10);
  ctx.fillRect(19, 18, 4, 10);
  ctx.fillStyle = palette.boots;
  ctx.fillRect(4, 42, 7, 6);
  ctx.fillRect(13, 42, 7, 6);
  ctx.fillStyle = "#e6ffb8";
  ctx.fillRect(8, 8, 2, 2);
  ctx.fillRect(14, 8, 2, 2);

  ctx.restore();
}

function drawBaseBackground(time) {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#f3bf84");
  sky.addColorStop(0.35, "#d68463");
  sky.addColorStop(0.72, "#7a4d55");
  sky.addColorStop(1, "#2b2433");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255, 246, 214, 0.08)";
  ctx.fillRect(0, 0, WIDTH, 140);

  ctx.fillStyle = "rgba(255, 232, 182, 0.34)";
  ctx.beginPath();
  ctx.arc(735, 122, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 225, 178, 0.14)";
  ctx.beginPath();
  ctx.moveTo(520, 0);
  ctx.lineTo(840, 0);
  ctx.lineTo(760, 220);
  ctx.lineTo(600, 220);
  ctx.closePath();
  ctx.fill();

  drawAradVista(time);

  ctx.fillStyle = "rgba(255, 212, 167, 0.13)";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 44);
  ctx.lineTo(WIDTH, GROUND_Y - 112);
  ctx.lineTo(WIDTH, GROUND_Y - 92);
  ctx.lineTo(0, GROUND_Y - 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f3d49c";
  for (let i = 0; i < 26; i += 1) {
    const x = (i * 83 + (time * 9) % 83) % WIDTH;
    const y = 44 + ((i * 29) % 120);
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = "rgba(255, 210, 170, 0.08)";
  ctx.fillRect(0, GROUND_Y - 120, WIDTH, 42);
  ctx.fillStyle = "rgba(255, 236, 214, 0.06)";
  ctx.fillRect(0, GROUND_Y - 82, WIDTH, 22);
}

function drawCamel(x, y, scale = 1, alpha = 0.55) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#493430";
  ctx.fillRect(0, 12, 24, 8);
  ctx.fillRect(6, 6, 7, 8);
  ctx.fillRect(12, 4, 7, 10);
  ctx.fillRect(22, 10, 8, 4);
  ctx.fillRect(27, 6, 5, 10);
  ctx.fillRect(4, 20, 3, 12);
  ctx.fillRect(10, 20, 3, 12);
  ctx.fillRect(17, 20, 3, 12);
  ctx.fillRect(22, 20, 3, 12);
  ctx.restore();
}

function drawJackal(x, y, scale = 1, alpha = 0.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#382a27";
  ctx.fillRect(0, 10, 18, 6);
  ctx.fillRect(16, 8, 8, 5);
  ctx.fillRect(21, 4, 3, 4);
  ctx.fillRect(17, 3, 3, 4);
  ctx.fillRect(3, 16, 2, 8);
  ctx.fillRect(10, 16, 2, 8);
  ctx.fillRect(-5, 8, 6, 2);
  ctx.restore();
}

function drawAradVista(time) {
  ctx.fillStyle = "#b67e68";
  for (let i = 0; i < 6; i += 1) {
    const x = i * 185 - 40;
    const h = 90 + ((i % 3) * 24);
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 18);
    ctx.lineTo(x + 72, GROUND_Y - h - 10);
    ctx.lineTo(x + 132, GROUND_Y - h + 6);
    ctx.lineTo(x + 210, GROUND_Y - 18);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#94645b";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 34);
  ctx.lineTo(120, GROUND_Y - 76);
  ctx.lineTo(250, GROUND_Y - 52);
  ctx.lineTo(380, GROUND_Y - 108);
  ctx.lineTo(550, GROUND_Y - 66);
  ctx.lineTo(700, GROUND_Y - 118);
  ctx.lineTo(860, GROUND_Y - 88);
  ctx.lineTo(WIDTH, GROUND_Y - 36);
  ctx.lineTo(WIDTH, GROUND_Y - 12);
  ctx.lineTo(0, GROUND_Y - 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#705160";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 8);
  ctx.lineTo(86, GROUND_Y - 26);
  ctx.lineTo(166, GROUND_Y - 18);
  ctx.lineTo(230, GROUND_Y - 48);
  ctx.lineTo(340, GROUND_Y - 32);
  ctx.lineTo(420, GROUND_Y - 60);
  ctx.lineTo(520, GROUND_Y - 36);
  ctx.lineTo(640, GROUND_Y - 78);
  ctx.lineTo(760, GROUND_Y - 56);
  ctx.lineTo(860, GROUND_Y - 26);
  ctx.lineTo(WIDTH, GROUND_Y - 10);
  ctx.lineTo(WIDTH, GROUND_Y + 24);
  ctx.lineTo(0, GROUND_Y + 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(146, 176, 192, 0.32)";
  ctx.fillRect(720, GROUND_Y - 34, 150, 10);
  ctx.fillStyle = "rgba(238, 248, 255, 0.16)";
  ctx.fillRect(734, GROUND_Y - 32, 104, 2);

  ctx.fillStyle = "#5f4853";
  ctx.beginPath();
  ctx.moveTo(96, GROUND_Y - 30);
  ctx.lineTo(126, GROUND_Y - 66);
  ctx.lineTo(150, GROUND_Y - 62);
  ctx.lineTo(176, GROUND_Y - 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(118, GROUND_Y - 62, 36, 8);
  ctx.fillRect(126, GROUND_Y - 54, 8, 10);
  ctx.fillRect(140, GROUND_Y - 54, 8, 10);

  ctx.fillStyle = "#5c4353";
  ctx.beginPath();
  ctx.moveTo(764, GROUND_Y - 28);
  ctx.lineTo(804, GROUND_Y - 94);
  ctx.lineTo(840, GROUND_Y - 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(818, GROUND_Y - 34, 22, 8);

  ctx.fillStyle = "#654b55";
  ctx.beginPath();
  ctx.moveTo(590, GROUND_Y - 26);
  ctx.lineTo(630, GROUND_Y - 86);
  ctx.lineTo(665, GROUND_Y - 70);
  ctx.lineTo(706, GROUND_Y - 24);
  ctx.closePath();
  ctx.fill();

  drawCamel(246 + Math.sin(time * 0.5) * 10, GROUND_Y - 62, 1.2, 0.38);
  drawCamel(280 + Math.sin(time * 0.5) * 10, GROUND_Y - 56, 0.92, 0.32);
  drawJackal(612 - Math.sin(time * 0.6) * 8, GROUND_Y - 28, 1.05, 0.34);
  drawJackal(646 - Math.sin(time * 0.6) * 8, GROUND_Y - 24, 0.85, 0.28);
}

function drawPlatforms() {
  ctx.fillStyle = "#6f4f3f";
  for (const platform of platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "#c28f64";
    ctx.fillRect(platform.x, platform.y, platform.width, 5);
    ctx.fillStyle = "#e1b389";
    ctx.fillRect(platform.x + 8, platform.y + 5, platform.width - 16, 3);
    ctx.fillStyle = "#50392f";
    ctx.beginPath();
    ctx.moveTo(platform.x + platform.width, platform.y);
    ctx.lineTo(platform.x + platform.width + 14, platform.y + 10);
    ctx.lineTo(platform.x + platform.width + 14, platform.y + platform.height + 10);
    ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 236, 204, 0.08)";
    ctx.fillRect(platform.x, platform.y + 5, platform.width, 4);
    ctx.fillStyle = "#6f4f3f";
  }
}

function drawGroundShadow(x, width, alpha = 0.2, y = GROUND_Y + 8) {
  ctx.fillStyle = `rgba(38, 25, 28, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, width, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawAtmosphere() {
  ctx.fillStyle = "rgba(255, 232, 208, 0.035)";
  ctx.fillRect(0, GROUND_Y - 150, WIDTH, 54);
  ctx.fillStyle = "rgba(255, 242, 226, 0.028)";
  ctx.fillRect(0, GROUND_Y - 96, WIDTH, 26);

  for (let i = 0; i < 36; i += 1) {
    const x = (i * 47 + (state.time * 4) % 47) % WIDTH;
    const y = GROUND_Y - 168 + ((i * 19) % 110);
    ctx.fillStyle = "rgba(255, 225, 196, 0.06)";
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawVenueSign(x, y, width, text) {
  ctx.fillStyle = "#6b4d43";
  ctx.fillRect(x, y, width, 26);
  ctx.fillStyle = "#ead8ad";
  ctx.fillRect(x + 8, y + 6, width - 16, 12);
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = "#47342f";
  ctx.font = '12px "Rubik"';
  ctx.fillText(text, x + width / 2, y + 18);
  ctx.direction = "ltr";
  ctx.textAlign = "start";
}

function drawActivationNodes() {
  for (const generator of state.generators) {
    ctx.fillStyle = generator.active ? "#e8c579" : "#6f655d";
    ctx.fillRect(generator.x, generator.y, generator.width, generator.height);
    ctx.fillStyle = generator.active ? "#fff2b2" : "#302a29";
    ctx.fillRect(generator.x + 8, generator.y + 8, 16, 12);
    ctx.fillStyle = generator.active ? "rgba(255, 241, 199, 0.18)" : "rgba(0, 0, 0, 0)";
    ctx.fillRect(generator.x - 10, generator.y - 16, 52, 20);
  }
}

function drawBeaconNodes() {
  for (const beacon of state.beacons) {
    ctx.fillStyle = beacon.active ? "#ffd38d" : "#57484a";
    ctx.fillRect(beacon.x, beacon.y, beacon.width, beacon.height);
    ctx.fillStyle = beacon.active ? "#fff1c7" : "#231d20";
    ctx.fillRect(beacon.x + 9, beacon.y + 6, 10, 12);
    ctx.fillStyle = beacon.active ? "rgba(255, 211, 141, 0.18)" : "rgba(0, 0, 0, 0)";
    ctx.fillRect(beacon.x - 10, beacon.y - 24, 48, 28);
  }
}

function drawNestNodes() {
  for (const nest of state.nests) {
    ctx.fillStyle = "#5a2d2c";
    ctx.fillRect(nest.x, nest.y, nest.width, nest.height);
    ctx.fillStyle = "#b46e58";
    ctx.fillRect(nest.x + 8, nest.y + 6, nest.width - 16, nest.height - 12);
    ctx.fillStyle = "#f0caa0";
    const ratio = nest.hp / nest.maxHp;
    ctx.fillRect(nest.x + 4, nest.y - 8, (nest.width - 8) * ratio, 4);
  }
}

function drawStageScenery() {
  const stage = currentStageDef();

  if (stage.objective === "beaconContact" && state.survivor?.inBunker) {
    ctx.fillStyle = "#4d443f";
    ctx.fillRect(48, 118, 864, 242);
    ctx.fillStyle = "#7a6a5e";
    ctx.fillRect(72, 142, 816, 198);
    drawVenueSign(344, 148, 250, "חדר קשר בתיכון");
    ctx.fillStyle = "#65574d";
    ctx.fillRect(98, 180, 220, 18);
    ctx.fillRect(612, 180, 210, 18);
    ctx.fillRect(92, 246, 184, 18);
    ctx.fillRect(668, 246, 154, 18);
    ctx.fillStyle = "#917b69";
    ctx.fillRect(112, 200, 34, 56);
    ctx.fillRect(154, 200, 34, 56);
    ctx.fillRect(196, 200, 34, 56);
    ctx.fillRect(632, 200, 42, 48);
    ctx.fillRect(682, 200, 42, 48);
    ctx.fillRect(734, 200, 42, 48);
    ctx.fillStyle = "#38443d";
    ctx.fillRect(430, 180, 58, 28);
    ctx.fillStyle = "#89a36f";
    ctx.fillRect(438, 188, 42, 12);
    drawDetailedHuman(
      state.survivor.x,
      state.survivor.y,
      {
        skin: "#dcb08a",
        skinShadow: "#b18262",
        neck: "#a77759",
        hair: "#312119",
        shirt: "#8e7d72",
        shirtShadow: "#5d5149",
        collar: "#ddd3c6",
        coat: "#7e6f68",
        coatShadow: "#5c504a",
        pants: "#6f6f88",
        pantsShadow: "#4a4a5e",
        boots: "#3e2f27",
        arm: "#dcb08a",
        hand: "#dcb08a",
      },
      false,
      false,
    );
  } else if (stage.scenery === "kedemYard") {
    ctx.fillStyle = "#8d6953";
    ctx.fillRect(72, 144, 280, 160);
    ctx.fillStyle = "#d9c29e";
    ctx.fillRect(92, 164, 240, 120);
    ctx.fillStyle = "#9fb6c5";
    ctx.fillRect(112, 184, 74, 44);
    ctx.fillRect(206, 184, 74, 44);
    drawVenueSign(132, 124, 162, "בית ספר קדם");
    drawCamel(552, GROUND_Y - 42, 0.88, 0.5);
  } else if (stage.scenery === "football" || stage.scenery === "sportsField") {
    ctx.fillStyle = "#4f6845";
    ctx.fillRect(0, 150, WIDTH, 196);
    ctx.fillStyle = "#dcd6ba";
    ctx.fillRect(48, 182, 840, 6);
    ctx.fillRect(460, 150, 6, 196);
    ctx.fillRect(120, 270, 160, 6);
    ctx.fillRect(650, 270, 160, 6);
    ctx.fillStyle = "#c8b692";
    ctx.fillRect(86, 210, 32, 96);
    ctx.fillRect(822, 210, 32, 96);
    drawVenueSign(360, 120, 220, stage.name);
  } else if (stage.scenery === "kindergarten") {
    ctx.fillStyle = "#c79a6e";
    ctx.fillRect(72, 170, 230, 110);
    ctx.fillStyle = "#df6b5f";
    ctx.fillRect(102, 154, 170, 24);
    ctx.fillStyle = "#f0c36e";
    ctx.fillRect(560, 220, 120, 16);
    ctx.fillRect(590, 192, 60, 28);
    ctx.fillStyle = "#6da1c2";
    ctx.fillRect(720, 192, 18, 98);
    ctx.fillRect(780, 192, 18, 98);
    ctx.fillRect(720, 192, 78, 14);
    drawVenueSign(118, 136, 138, "הגן");
  } else if (stage.scenery === "agClass" || stage.scenery === "dvClass") {
    ctx.fillStyle = "#7c675c";
    ctx.fillRect(60, 138, 828, 210);
    ctx.fillStyle = "#d0bf9c";
    ctx.fillRect(84, 160, 780, 168);
    ctx.fillStyle = "#8d715e";
    ctx.fillRect(118, 236, 130, 24);
    ctx.fillRect(298, 236, 130, 24);
    ctx.fillRect(478, 236, 130, 24);
    ctx.fillRect(658, 236, 130, 24);
    ctx.fillStyle = "#5d7f91";
    ctx.fillRect(692, 176, 110, 36);
    drawVenueSign(118, 128, 180, stage.name);
  } else if (stage.scenery === "highSchool") {
    ctx.fillStyle = "#6c5756";
    ctx.fillRect(38, 132, 886, 226);
    ctx.fillStyle = "#8f746a";
    ctx.fillRect(70, 156, 828, 176);
    ctx.fillStyle = "#b8a38d";
    ctx.fillRect(106, 182, 112, 116);
    ctx.fillRect(744, 182, 112, 116);
    drawVenueSign(360, 126, 220, "התיכון");
  } else if (stage.scenery === "courtyard") {
    ctx.fillStyle = "#8a705a";
    ctx.fillRect(80, 166, 160, 112);
    ctx.fillRect(714, 166, 160, 112);
    ctx.fillStyle = "#9d885e";
    ctx.fillRect(280, 230, 360, 16);
    ctx.fillRect(296, 188, 16, 58);
    ctx.fillRect(608, 188, 16, 58);
    drawVenueSign(352, 140, 156, "החצר");
    drawJackal(820, GROUND_Y - 26, 1.05, 0.42);
  } else if (stage.scenery === "matnas" || stage.scenery === "robotics") {
    ctx.fillStyle = "#66554d";
    ctx.fillRect(56, 126, 852, 234);
    ctx.fillStyle = "#8b776d";
    ctx.fillRect(84, 152, 796, 182);
    ctx.fillStyle = "#4e5b63";
    ctx.fillRect(144, 190, 120, 80);
    ctx.fillRect(694, 190, 120, 80);
    ctx.fillStyle = "#9f8b7a";
    ctx.fillRect(378, 208, 164, 72);
    drawVenueSign(332, 132, 256, stage.name);
  } else if (stage.scenery === "pis") {
    ctx.fillStyle = "#5b4d58";
    ctx.fillRect(54, 132, 860, 228);
    ctx.fillStyle = "#827185";
    ctx.fillRect(78, 154, 812, 182);
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = "#38443d";
      ctx.fillRect(146 + i * 170, 206, 90, 50);
      ctx.fillStyle = "#89a36f";
      ctx.fillRect(154 + i * 170, 214, 74, 34);
    }
    drawVenueSign(360, 128, 220, "תפוח פיס");
  } else if (stage.scenery === "mall" || stage.scenery === "zim") {
    ctx.fillStyle = "#6b5853";
    ctx.fillRect(30, 140, 900, 220);
    ctx.fillStyle = "#9d8374";
    ctx.fillRect(54, 164, 852, 176);
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = "#c3ab92";
      ctx.fillRect(76 + i * 210, 188, 160, 96);
      ctx.fillStyle = "#7f6659";
      ctx.fillRect(96 + i * 210, 176, 120, 18);
    }
    drawVenueSign(332, 132, 256, stage.name);
  } else if (stage.scenery === "library") {
    ctx.fillStyle = "#65544b";
    ctx.fillRect(52, 132, 864, 228);
    ctx.fillStyle = "#857066";
    ctx.fillRect(78, 158, 812, 176);
    for (let i = 0; i < 5; i += 1) {
      ctx.fillStyle = "#6f5949";
      ctx.fillRect(108 + i * 150, 184, 90, 114);
      ctx.fillStyle = "#c8b79a";
      ctx.fillRect(116 + i * 150, 194, 74, 10);
      ctx.fillRect(116 + i * 150, 214, 74, 10);
      ctx.fillRect(116 + i * 150, 234, 74, 10);
    }
    drawVenueSign(366, 130, 188, "הספריה");
  } else if (stage.scenery === "supermarket") {
    ctx.fillStyle = "#5a4f4d";
    ctx.fillRect(46, 136, 874, 224);
    ctx.fillStyle = "#87776e";
    ctx.fillRect(74, 160, 818, 176);
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = "#b8b0a3";
      ctx.fillRect(140 + i * 150, 188, 42, 118);
      ctx.fillRect(182 + i * 150, 188, 42, 118);
    }
    drawVenueSign(364, 128, 194, "שופרסל");
  } else if (stage.scenery === "pub") {
    ctx.fillStyle = "#4d3d3d";
    ctx.fillRect(92, 154, 780, 178);
    ctx.fillStyle = "#725851";
    ctx.fillRect(120, 180, 724, 128);
    ctx.fillStyle = "#8c6a57";
    ctx.fillRect(206, 240, 460, 20);
    ctx.fillStyle = "#463838";
    ctx.fillRect(676, 200, 92, 86);
    drawVenueSign(360, 138, 220, "פאב המוזה");
  } else if (stage.scenery === "pizza") {
    ctx.fillStyle = "#6a4940";
    ctx.fillRect(120, 146, 710, 190);
    ctx.fillStyle = "#9b6a54";
    ctx.fillRect(150, 174, 650, 140);
    ctx.fillStyle = "#7d5248";
    ctx.beginPath();
    ctx.arc(760, 220, 96, Math.PI, Math.PI * 2);
    ctx.fill();
    drawVenueSign(320, 136, 280, "פיצה כפרוצ׳קה");
    if (state.core && state.core.hp > 0) {
      ctx.fillStyle = "#8d4a52";
      ctx.fillRect(state.core.x, state.core.y, state.core.width, state.core.height);
      ctx.fillStyle = "#e08c72";
      ctx.fillRect(state.core.x + 18, state.core.y + 18, 60, 60);
      ctx.fillStyle = "#fff0c0";
      ctx.fillRect(state.core.x + 38, state.core.y + 38, 20, 20);
    }
  }

  if (stage.objective === "activate") {
    drawActivationNodes();
  }
  if (stage.objective === "destroy") {
    drawNestNodes();
  }
  if (stage.objective === "beaconContact" && !state.survivor?.inBunker) {
    drawBeaconNodes();
  }
  if (state.exitGate) {
    ctx.fillStyle = state.exitGate.active ? "#e3d38d" : "#726658";
    ctx.fillRect(state.exitGate.x, state.exitGate.y, state.exitGate.width, state.exitGate.height);
    ctx.fillStyle = "#3a2e2f";
    ctx.fillRect(state.exitGate.x + 8, state.exitGate.y + 10, 8, state.exitGate.height - 20);
    ctx.fillRect(state.exitGate.x + 24, state.exitGate.y + 10, 8, state.exitGate.height - 20);
  }

  drawPlatforms();
}

function drawPlayer() {
  const { player } = state;
  const flash = state.invulnerableTimer > 0 && Math.floor(state.time * 14) % 2 === 0;
  drawGroundShadow(player.x + player.width / 2, 20, 0.22);
  if (!flash) {
    drawDetailedHuman(
      player.x,
      player.y,
      {
        skin: "#efc399",
        skinShadow: "#c89672",
        neck: "#b78360",
        hair: "#8f5e3e",
        shirt: "#6f8397",
        shirtShadow: "#556675",
        collar: "#d8d0bf",
        coat: "#8f786d",
        coatShadow: "#6c5b53",
        pants: "#6c6f86",
        pantsShadow: "#505467",
        boots: "#6a4c37",
        arm: player.shootFlash > 0 ? "#efc399" : "#e7bb90",
        hand: "#efc399",
        cheek: "rgba(188, 120, 94, 0.45)",
      },
      player.facing < 0,
      player.shootFlash > 0,
    );
  }

  if (player.shootFlash > 0) {
    const flashX = player.x + (player.facing > 0 ? 26 : -6);
    const flashY = player.y + 16;
    ctx.fillStyle = "#f5d7a2";
    ctx.fillRect(flashX, flashY + 1, 7, 6);
    ctx.fillStyle = "#e8b774";
    ctx.fillRect(flashX + (player.facing > 0 ? 5 : -1), flashY + 2, 8, 3);
    ctx.fillStyle = "rgba(245, 215, 162, 0.35)";
    ctx.fillRect(flashX + (player.facing > 0 ? 10 : -6), flashY + 1, 6, 5);
  }
}

function drawAlly() {
  if (!state.ally?.active) {
    return;
  }

  drawGroundShadow(state.ally.x + state.ally.width / 2, 18, 0.18);
  drawDetailedHuman(
    state.ally.x,
    state.ally.y,
    {
      skin: "#ddb28d",
      skinShadow: "#ba8a67",
      neck: "#a77759",
      hair: "#4a2f20",
      shirt: "#6a7c63",
      shirtShadow: "#4b5946",
      collar: "#d7cfbf",
      coat: "#8d7f73",
      coatShadow: "#63574f",
      pants: "#70758e",
      pantsShadow: "#50566d",
      boots: "#5c4435",
      arm: "#ddb28d",
      hand: "#ddb28d",
      cheek: "rgba(174, 108, 86, 0.4)",
    },
    state.ally.facing < 0,
    false,
  );
}

function drawZombies() {
  for (const zombie of state.zombies) {
    drawGroundShadow(zombie.x + zombie.width / 2, 18, 0.18, zombie.y + zombie.height + 4);
    drawZombieFigure(
      zombie.x,
      zombie.y,
      {
        skin: "#bac18f",
        hair: "#314026",
        shirt: zombie.tint === "#9df57a" ? "#73cc63" : "#56bca7",
        pants: "#6c4f63",
        boots: "#2d2322",
        arm: "#aab586",
      },
      zombie.vx > 0,
    );
  }
}

function drawAliens() {
  for (const alien of state.aliens) {
    drawGroundShadow(alien.x + alien.width / 2, 16, 0.12);
    ctx.fillStyle = "#8afff0";
    ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
    ctx.fillStyle = "#c6fff6";
    ctx.fillRect(alien.x + 6, alien.y - 4, 18, 6);
    ctx.fillStyle = "#132328";
    ctx.fillRect(alien.x + 8, alien.y + 6, 14, 4);
  }
}

function drawShots() {
  for (const shot of state.shots) {
    ctx.fillStyle = "#ffe6a8";
    ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
    ctx.fillStyle = "#ffb347";
    ctx.fillRect(shot.x - Math.sign(shot.vx) * 8, shot.y + 1, 10, 4);
    ctx.fillStyle = "#fff5cf";
    ctx.fillRect(shot.x + 4, shot.y + 1, 7, 2);
    ctx.fillStyle = "rgba(255, 214, 122, 0.45)";
    ctx.fillRect(shot.x - Math.sign(shot.vx) * 16, shot.y, 8, 6);
  }
}

function drawEffects() {
  for (const particle of state.particles) {
    ctx.globalAlpha = clamp(particle.ttl / 0.6, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;

  ctx.font = '18px "Rubik"';
  for (const text of state.floatingTexts) {
    ctx.globalAlpha = clamp(text.ttl / 0.8, 0, 1);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
  }
  ctx.globalAlpha = 1;
}

function drawSchoolScene() {
  ctx.fillStyle = "#8d6953";
  ctx.fillRect(90, 190, 320, 190);
  ctx.fillStyle = "#d9c29e";
  ctx.fillRect(110, 210, 280, 150);
  ctx.fillStyle = "#9fb6c5";
  ctx.fillRect(128, 230, 88, 52);
  ctx.fillRect(238, 230, 88, 52);
  ctx.fillStyle = "rgba(255, 231, 192, 0.18)";
  ctx.fillRect(100, 288, 300, 14);
  ctx.fillStyle = "#74524a";
  ctx.fillRect(132, 160, 164, 30);
  ctx.fillStyle = "#ead8ad";
  ctx.fillRect(148, 170, 132, 10);
  drawCamel(476, 308, 0.94, 0.42);
  drawJackal(540, 326, 0.9, 0.34);

  drawDetailedHuman(170, 300, {
    skin: "#f8c988",
    skinShadow: "#d6a676",
    neck: "#c79367",
    hair: "#23130b",
    shirt: "#78a6d9",
    shirtShadow: "#4a6d91",
    collar: "#e9dfc9",
    pants: "#baa36c",
    pantsShadow: "#7e6b48",
    boots: "#54351a",
    arm: "#f8c988",
    cheek: "rgba(180, 96, 76, 0.55)",
  });
  drawDetailedHuman(242, 300, {
    skin: "#efc37f",
    skinShadow: "#ca9c64",
    neck: "#b98555",
    hair: "#553015",
    shirt: "#bd6f8d",
    shirtShadow: "#7b465b",
    collar: "#ead5c8",
    pants: "#7fa1c2",
    pantsShadow: "#52697f",
    boots: "#54351a",
    arm: "#efc37f",
    cheek: "rgba(164, 86, 73, 0.48)",
  });
  drawDetailedHuman(314, 300, {
    skin: "#d4a269",
    skinShadow: "#a97d4d",
    neck: "#96693f",
    hair: "#1f1913",
    shirt: "#8ea765",
    shirtShadow: "#5b6942",
    collar: "#dad6c6",
    pants: "#a7a2bc",
    pantsShadow: "#6d687b",
    boots: "#54351a",
    arm: "#d4a269",
    cheek: "rgba(146, 80, 61, 0.4)",
  });
}

function drawAlienStrikeScene() {
  drawSchoolScene();
  const beamWidth = 110 + Math.sin(state.time * 22) * 12;
  ctx.fillStyle = "rgba(241, 202, 161, 0.26)";
  ctx.beginPath();
  ctx.moveTo(750, 30);
  ctx.lineTo(750 - beamWidth, 360);
  ctx.lineTo(750 + beamWidth, 360);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f2d5a8";
  ctx.fillRect(710, 24, 80, 18);
  ctx.fillRect(730, 12, 38, 14);

  drawPixelFigure(242, 300, {
    skin: "#899a79",
    hair: "#2e3c26",
    shirt: "#89ffd2",
    pants: "#5f3d73",
    boots: "#352220",
    arm: "#95a68c",
  });
  drawPixelFigure(314, 300, {
    skin: "#899a79",
    hair: "#2e3c26",
    shirt: "#9df57a",
    pants: "#5f3d73",
    boots: "#352220",
    arm: "#95a68c",
  });
}

function drawBunkerScene() {
  ctx.fillStyle = "#4b423e";
  ctx.fillRect(180, 130, 420, 280);
  ctx.fillStyle = "#78685d";
  ctx.fillRect(210, 160, 360, 220);
  ctx.fillStyle = "#968674";
  ctx.fillRect(470, 180, 54, 120);
  ctx.fillStyle = "#f0c27b";
  ctx.fillRect(495, 210, 8, 8);
  ctx.fillStyle = "rgba(255, 224, 173, 0.1)";
  ctx.fillRect(210, 160, 360, 36);

  drawDetailedHuman(240, GROUND_Y - 54, {
    skin: "#f8c988",
    skinShadow: "#d6a676",
    neck: "#c79367",
    hair: "#23130b",
    shirt: "#78a6d9",
    shirtShadow: "#4a6d91",
    collar: "#e9dfc9",
    pants: "#baa36c",
    pantsShadow: "#7e6b48",
    boots: "#54351a",
    arm: "#f8c988",
    cheek: "rgba(180, 96, 76, 0.55)",
  });

  state.bunkerFriends.forEach((friend, index) => {
    const shirt = friend.infected
      ? index % 2 === 0
        ? "#9df57a"
        : "#89ffd2"
      : ["#f88dad", "#b2ff75", "#ffd36c"][index];
    const skin = friend.infected ? "#899a79" : ["#efc37f", "#d4a269", "#f1c087"][index];
    const hair = friend.infected ? "#2e3c26" : ["#553015", "#1f1913", "#4d3020"][index];

    drawDetailedHuman(friend.x, friend.y, {
      skin,
      skinShadow: friend.infected ? "#71775d" : ["#ca9c64", "#a97d4d", "#bb8b5e"][index],
      neck: friend.infected ? "#687055" : ["#b98555", "#96693f", "#a9754b"][index],
      hair,
      shirt,
      shirtShadow: friend.infected ? "#46705e" : ["#7b465b", "#5b6942", "#8a7040"][index],
      collar: friend.infected ? "#b9c79c" : "#e4ddce",
      pants: friend.infected ? "#6e5c72" : "#a7a2bc",
      pantsShadow: friend.infected ? "#433846" : "#6d687b",
      boots: "#352220",
      arm: skin,
      cheek: friend.infected ? "rgba(120, 146, 93, 0.35)" : "rgba(162, 87, 70, 0.42)",
    });

    if (friend.infected) {
      ctx.fillStyle = "rgba(127, 255, 240, 0.16)";
      ctx.fillRect(friend.x - 8, friend.y - 12, 44, 72);
    }
  });
}

function wrapPixelText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = candidate;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
  }
}

function drawIntroScene() {
  if (state.introTime <= 0) {
    drawSchoolScene();
  } else if (state.introTime <= 6.4) {
    drawAlienStrikeScene();
  } else {
    drawBunkerScene();
  }

  const step = introSteps[state.introStep];
  ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
  ctx.fillRect(36, HEIGHT - 150, WIDTH - 72, 100);
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = 4;
  ctx.strokeRect(36, HEIGHT - 150, WIDTH - 72, 100);

  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = "#f6edcf";
  ctx.font = '18px "Rubik"';
  ctx.fillText(step.title, WIDTH - 70, HEIGHT - 112);
  ctx.font = '14px "Rubik"';
  wrapPixelText(step.text, WIDTH - 70, HEIGHT - 82, WIDTH - 150, 28);
  ctx.direction = "ltr";
  ctx.textAlign = "start";

  if (state.introTime <= 0) {
    ctx.textAlign = "center";
    ctx.font = '18px "Rubik"';
    ctx.fillText("לחצו אנטר", WIDTH / 2, HEIGHT / 2 + 120);
    ctx.textAlign = "start";
  }
}

function drawStageOverlay() {
  if (state.mode !== "survival") {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(18, 16, 380, 48);
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 16, 380, 48);
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = "#f6edcf";
  ctx.font = '14px "Rubik"';
  ctx.fillText(stageDefs[state.stageIndex].name, 380, 46);
  ctx.textAlign = "start";
  ctx.direction = "ltr";

  if (state.core && state.core.hp > 0) {
    drawGroundShadow(state.core.x + state.core.width / 2, 72, 0.16);
    const ratio = state.core.hp / state.core.maxHp;
    ctx.fillStyle = "#250a12";
    ctx.fillRect(620, 18, 230, 20);
    ctx.fillStyle = "#ff5d73";
    ctx.fillRect(620, 18, 230 * ratio, 20);
    ctx.strokeStyle = "#f6edcf";
    ctx.strokeRect(620, 18, 230, 20);
  }

  if (state.immortal) {
    ctx.fillStyle = "rgba(129, 255, 150, 0.18)";
    ctx.fillRect(18, 70, 146, 28);
    ctx.strokeStyle = "#8fff96";
    ctx.strokeRect(18, 70, 146, 28);
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#dfffe5";
    ctx.font = '12px "Rubik"';
    ctx.fillText("אלמוות פעיל", 154, 89);
    ctx.direction = "ltr";
    ctx.textAlign = "start";
  }

  drawHeartHud();
}

function drawHeartHud() {
  const heartSize = 16;
  const startX = 24;
  const y = 76;

  for (let i = 0; i < 3; i += 1) {
    const filled = i < state.player.hp;
    const x = startX + i * 28;
    ctx.fillStyle = filled ? "#d93a4f" : "#4a2329";
    ctx.fillRect(x + 4, y, 8, 8);
    ctx.fillRect(x + 12, y, 8, 8);
    ctx.fillRect(x + 2, y + 6, 18, 8);
    ctx.fillRect(x + 4, y + 14, 14, 8);
    ctx.fillRect(x + 6, y + 22, 10, 6);
    ctx.fillStyle = filled ? "#ff9aa5" : "#6a3a41";
    ctx.fillRect(x + 5, y + 2, 4, 3);
    ctx.fillRect(x + 13, y + 2, 4, 3);
  }
}

function drawTransitionOverlay() {
  if (state.transitionTimer <= 0) {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f6edcf";
  ctx.font = '24px "Rubik"';
  ctx.fillText("המשימה הושלמה", WIDTH / 2, HEIGHT / 2 - 24);
  ctx.direction = "rtl";
  ctx.font = '16px "Rubik"';
  ctx.fillText(state.transitionText, WIDTH / 2, HEIGHT / 2 + 24);
  ctx.direction = "ltr";
  ctx.textAlign = "start";
}

function drawDialogueOverlay() {
  if (!state.dialogueText) {
    return;
  }

  ctx.fillStyle = "rgba(16, 12, 18, 0.74)";
  ctx.fillRect(54, HEIGHT - 170, WIDTH - 108, 84);
  ctx.strokeStyle = "#ffd38d";
  ctx.lineWidth = 3;
  ctx.strokeRect(54, HEIGHT - 170, WIDTH - 108, 84);
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = "#f6edcf";
  ctx.font = '16px "Rubik"';
  wrapPixelText(state.dialogueText, WIDTH - 80, HEIGHT - 138, WIDTH - 160, 22);
  ctx.direction = "ltr";
  ctx.textAlign = "start";
}

function drawEndOverlay() {
  if (!state.gameOver && !state.victory) {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#f6edcf";
  ctx.textAlign = "center";
  ctx.font = '30px "Rubik"';
  ctx.fillText(state.victory ? "ניצחתם" : "המשחק נגמר", WIDTH / 2, HEIGHT / 2 - 28);
  ctx.direction = "rtl";
  ctx.font = '16px "Rubik"';
  ctx.fillText(
    state.victory ? "הילד עצר את הפלישה והחזיר את הלילה." : "האפוקליפסה ניצחה הפעם.",
    WIDTH / 2,
    HEIGHT / 2 + 16,
  );
  ctx.direction = "ltr";
  ctx.fillText("לחצו ר", WIDTH / 2, HEIGHT / 2 + 58);
  ctx.textAlign = "start";
}

function update(dt) {
  if (state.mode === "intro") {
    updateIntro(dt);
    updateEffects(dt);
    return;
  }

  if (!state.gameOver && !state.victory && state.transitionTimer <= 0) {
    updatePlayer(dt);
    updateZombies(dt);
    updateAliens(dt);
    updateAlly(dt);
    updateShots(dt);
    updateStageObjective();
    updateSpawns(dt);
  }

  updateTransitions(dt);
  updateEffects(dt);
}

function render() {
  drawBaseBackground(state.time);
  drawAtmosphere();

  if (state.mode === "intro") {
    drawIntroScene();
  } else {
    drawStageScenery();
    drawZombies();
    drawAliens();
    drawAlly();
    drawPlayer();
    drawShots();
    drawEffects();
    drawStageOverlay();
  }

  drawDialogueOverlay();
  drawTransitionOverlay();
  drawEndOverlay();
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
  handleCheatCode(event.code);

  if (event.key === "Enter" || event.code === "Enter") {
    if (state.mode === "intro" && state.introTime <= 0) {
      startIntro();
    } else if (state.mode === "intro") {
      beginSurvivalMode();
    }
  }

  if (event.key === "ArrowUp" || event.code === "KeyW") {
    jumpPlayer();
  }

  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    fireShot();
  }

  if (event.key === "ר" || event.key === "r" || event.key === "R" || event.code === "KeyR") {
    resetGame();
  }

  keys.add(event.code);
  keys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
  keys.delete(event.key);
});

canvas.addEventListener("pointerdown", () => {
  if (state.mode === "intro") {
    if (state.introTime <= 0) {
      startIntro();
    } else {
      beginSurvivalMode();
    }
  }
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  fireShot();
});

resetGame();
requestAnimationFrame(frame);
