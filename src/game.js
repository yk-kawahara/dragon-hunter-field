"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const ui = {
  toast: document.getElementById("toast"),
  gold: document.getElementById("goldBox"),
  level: document.getElementById("levelText"),
  hp: document.getElementById("hpText"),
  exp: document.getElementById("expText"),
  weapon: document.getElementById("weaponText"),
  armor: document.getElementById("armorText"),
  potion: document.getElementById("potionText"),
  bomb: document.getElementById("bombText"),
  ward: document.getElementById("wardText"),
  combo: document.getElementById("comboText"),
  scale: document.getElementById("scaleText"),
  zone: document.getElementById("zoneText"),
  items: Array.from(document.querySelectorAll("[data-item]")),
};

const gameDefinitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
if (!gameDefinitions) {
  throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before src/game.js");
}

const {
  W,
  H,
  VIEW_H,
  HUD_H,
  TILE,
  MAP_W,
  MAP_H,
  SAVE_KEY,
  HEAL_CIRCLE,
  TOWN_GATES,
  TREASURE_CHESTS,
  DISCOVERY_POINTS,
  GUARDIAN_SITE,
  BOSS_REQUIREMENTS,
  REGION_SPAWNS,
  TILE_GRASS,
  TILE_PATH,
  TILE_WATER,
  TILE_TREE,
  TILE_WALL,
  TILE_ROOF,
  TILE_FLOOR,
  TILE_CAVE,
  TILE_FLOWER,
  TILE_FIELD,
  DIRS,
  ATTACK_RANGE,
  ATTACK_WIDTH,
  DASH_COST,
  weaponNames,
  armorNames,
  weaponTraits,
  armorTraits,
  weaponCosts,
  armorCosts,
  armorDefense,
  itemOrder,
  monsterTypes,
} = gameDefinitions;

const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
if (!mathHelpers) {
  throw new Error("DRAGON_HUNTER_MATH must be loaded before src/game.js");
}

const {
  clamp,
  hashNoise,
  rectsOverlap,
  centerOf,
  normalize,
  facingDot,
  directionFromVector,
  makeRect,
} = mathHelpers;

const mapHelpers = globalThis.DRAGON_HUNTER_MAP;
if (!mapHelpers) {
  throw new Error("DRAGON_HUNTER_MAP must be loaded before src/game.js");
}

function mapContext() {
  return { state };
}

const rewardHelpers = globalThis.DRAGON_HUNTER_REWARDS;
if (!rewardHelpers) {
  throw new Error("DRAGON_HUNTER_REWARDS must be loaded before src/game.js");
}

const {
  rewardIds,
  savedIdSet,
} = rewardHelpers;

function rewardContext() {
  return {
    player,
    state,
    say,
    burst,
    addFloater,
    addRing,
    refreshDerivedStats,
  };
}

const effectHelpers = globalThis.DRAGON_HUNTER_EFFECTS;
if (!effectHelpers) {
  throw new Error("DRAGON_HUNTER_EFFECTS must be loaded before src/game.js");
}

const textHelpers = globalThis.DRAGON_HUNTER_TEXT;
if (!textHelpers) {
  throw new Error("DRAGON_HUNTER_TEXT must be loaded before src/game.js");
}

function effectContext() {
  return { state, ui, rand };
}


const spawnHelpers = globalThis.DRAGON_HUNTER_SPAWN;
if (!spawnHelpers) {
  throw new Error("DRAGON_HUNTER_SPAWN must be loaded before src/game.js");
}

function spawnContext() {
  return {
    state,
    player,
    rand,
    irand,
    isPassableRect,
    inTown,
    say,
    addRing,
  };
}

function textContext() {
  return {
    state,
    player,
    inTown,
    currentRegion,
    areaDangerText,
    canChallengeDragon,
    guardianReady,
    nearestNpc,
    nearestChest,
    nearestDiscovery,
    playerNearCave,
    tileAt,
  };
}

const state = {
  keys: new Set(),
  virtualKeys: new Set(),
  map: [],
  monsters: [],
  sparks: [],
  slashes: [],
  rings: [],
  floaters: [],
  particles: [],
  projectiles: [],
  npcs: [],
  chests: new Set(),
  discoveries: new Set(),
  spawnedBoss: false,
  bossDefeated: false,
  spawnedGuardian: false,
  guardianDefeated: false,
  elderReported: false,
  spawnTimer: 600,
  message: "",
  messageUntil: 0,
  last: performance.now(),
  shake: 0,
  searchCooldown: 0,
  healCooldown: 0,
  townGateOpen: false,
  townGateHold: 0,
  statsFlip: false,
  statsPage: 0,
  infoPanel: null,
  gameOver: false,
  victory: false,
  pointerMove: null,
  regionSpawnTimer: 0,
  lastRegion: "grassland",
};

const player = {
  x: 10 * TILE,
  y: 48 * TILE,
  w: 10,
  h: 12,
  dir: "down",
  hp: 46,
  hpMax: 46,
  level: 1,
  xp: 0,
  xpNext: 34,
  gold: 18,
  weapon: 0,
  armor: 0,
  potions: 2,
  bombs: 1,
  wards: 0,
  selectedItem: "potion",
  scales: 0,
  sealCrest: false,
  hunterCharm: false,
  regenCharm: false,
  stamina: 100,
  staminaMax: 100,
  attackCooldown: 0,
  dashCooldown: 0,
  invuln: 0,
  guard: 0,
  slow: 0,
  burn: 0,
  burnTick: 0,
  combo: 0,
  comboTimer: 0,
  speed: 66,
  step: 0,
};

function rand(min = 0, max = 1) {
  return min + Math.random() * (max - min);
}

function irand(min, max) {
  return Math.floor(rand(min, max + 1));
}

function tileAt(tx, ty) {
  return mapHelpers.tileAt(mapContext(), tx, ty);
}

function setTile(tx, ty, tile) {
  return mapHelpers.setTile(mapContext(), tx, ty, tile);
}

function isBlockedTile(tile, actor) {
  return mapHelpers.isBlockedTile(mapContext(), tile, actor);
}

function inTownTile(tx, ty) {
  return mapHelpers.inTownTile(mapContext(), tx, ty);
}

function tileInGate(tx, ty) {
  return mapHelpers.tileInGate(mapContext(), tx, ty);
}

function isPassableRect(actor, x = actor.x, y = actor.y) {
  return mapHelpers.isPassableRect(mapContext(), actor, x, y);
}

function createMap() {
  return mapHelpers.createMap(mapContext());
}

function spawnMonster(typeName, x, y) {
  return spawnHelpers.spawnMonster(spawnContext(), typeName, x, y);
}

function spawnIfClear(typeName, x, y) {
  return spawnHelpers.spawnIfClear(spawnContext(), typeName, x, y);
}

function monsterChoice() {
  return spawnHelpers.monsterChoice(spawnContext());
}

function currentRegion() {
  return spawnHelpers.currentRegion(spawnContext());
}

function distanceFromVillage() {
  return spawnHelpers.distanceFromVillage(spawnContext());
}

function monsterPoolForRegion(region) {
  return spawnHelpers.monsterPoolForRegion(spawnContext(), region);
}

function trySpawnMonster(dt) {
  return spawnHelpers.trySpawnMonster(spawnContext(), dt);
}

function updateRegionSpawns(dt) {
  return spawnHelpers.updateRegionSpawns(spawnContext(), dt);
}

function pruneDistantMonsters(maxDistance = 520) {
  return spawnHelpers.pruneDistantMonsters(spawnContext(), maxDistance);
}

function countNearbyMonsters(radius) {
  return spawnHelpers.countNearbyMonsters(spawnContext(), radius);
}

function spawnNearPlayer(region, minRadius, maxRadius) {
  return spawnHelpers.spawnNearPlayer(spawnContext(), region, minRadius, maxRadius);
}

function areaDangerText(region) {
  return spawnHelpers.areaDangerText(region);
}

function guardianReady() {
  return spawnHelpers.guardianReady(spawnContext());
}

function playerNearGuardianSite() {
  return spawnHelpers.playerNearGuardianSite(spawnContext());
}

function updateStoryEvents() {
  return spawnHelpers.updateStoryEvents(spawnContext());
}

function inTown(x, y) {
  return mapHelpers.inTown(mapContext(), x, y);
}

function playerAttack() {
  const comboBonus = Math.min(8, Math.floor(player.combo / 2));
  return 7 + player.level * 2 + player.weapon * 5 + comboBonus;
}

function playerDefense() {
  const guardBonus = player.guard > 0 ? 9 + player.armor * 3 : 0;
  return 1 + player.level + (armorDefense[player.armor] || 0) + guardBonus;
}

function playerMoveSpeed() {
  const armorMoveBonus = player.armor >= 1 ? 4 : 0;
  const slowPenalty = player.slow > 0 ? 0.72 : 1;
  return (player.speed + armorMoveBonus) * slowPenalty;
}

function dashCost() {
  const armorDiscount = player.armor >= 1 ? 6 : 0;
  return Math.max(20, DASH_COST - armorDiscount);
}

function weaponDamageMultiplier(monster, pDot, mDot) {
  let mult = 1;
  const flanking = Math.abs(mDot) < 0.35;
  const behind = mDot < -0.55;
  if (player.weapon >= 1 && pDot > 0.58) mult += 0.08;
  if (player.weapon >= 2 && flanking) mult += 0.18;
  if (player.weapon >= 3 && behind) mult += 0.34;
  if (player.weapon >= 4 && (monster.boss || monster.midboss || monster.type === "dragonling")) mult += 0.25;
  return mult;
}

function armorDamageMultiplier(monster, pDot, source = "contact") {
  let mult = 1;
  if (player.armor >= 2 && source === "contact" && pDot > 0.58) mult *= 0.8;
  if (player.armor >= 4 && (monster?.boss || monster?.type === "dragonling" || source === "fire")) mult *= 0.78;
  return mult;
}

function refreshDerivedStats() {
  player.staminaMax = 100 + (player.hunterCharm ? 15 : 0);
  player.stamina = Math.min(player.stamina, player.staminaMax);
}

function regenRate() {
  if (!player.regenCharm) return 0;
  return 0.28 + (player.armor >= 3 ? 0.12 : 0) + (player.armor >= 4 ? 0.18 : 0);
}

function grantWeaponAtLeast(rank, upgradedMessage, keptMessage = "既により良い剣を持っている") {
  return rewardHelpers.grantWeaponAtLeast(rewardContext(), rank, upgradedMessage, keptMessage);
}

function grantArmorAtLeast(rank, upgradedMessage, keptMessage = "既により良い鎧を持っている") {
  return rewardHelpers.grantArmorAtLeast(rewardContext(), rank, upgradedMessage, keptMessage);
}

function grantMonsterDefeatDrops(monster) {
  return rewardHelpers.grantMonsterDefeatDrops(rewardContext(), monster);
}

function levelUp() {
  while (player.xp >= player.xpNext) {
    player.xp -= player.xpNext;
    player.level += 1;
    player.xpNext = Math.floor(player.xpNext * 1.45 + 18);
    player.hpMax += 12;
    player.hp = player.hpMax;
    burst(player.x + 5, player.y + 4, "#fff36b", 18);
    say(`LEVEL UP! LV ${player.level}`);
  }
}

function saveGame() {
  const data = {
    player: {
      x: player.x,
      y: player.y,
      dir: player.dir,
      hp: player.hp,
      hpMax: player.hpMax,
      level: player.level,
      xp: player.xp,
      xpNext: player.xpNext,
      gold: player.gold,
      weapon: player.weapon,
      armor: player.armor,
      potions: player.potions,
      bombs: player.bombs,
      wards: player.wards,
      selectedItem: player.selectedItem,
      scales: player.scales,
      sealCrest: player.sealCrest,
      hunterCharm: player.hunterCharm,
      regenCharm: player.regenCharm,
    },
    spawnedBoss: state.spawnedBoss,
    bossDefeated: state.bossDefeated,
    spawnedGuardian: state.spawnedGuardian,
    guardianDefeated: state.guardianDefeated,
    elderReported: state.elderReported,
    chests: Array.from(state.chests),
    discoveries: Array.from(state.discoveries),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  say(`保存しました (${stageName(gameStage())})`);
}

function loadGame() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (!data?.player) return false;
    Object.assign(player, data.player);
    player.bombs ??= 1;
    player.wards ??= 0;
    player.sealCrest = Boolean(player.sealCrest);
    player.hunterCharm = Boolean(player.hunterCharm);
    player.regenCharm = Boolean(player.regenCharm);
    refreshDerivedStats();
    player.stamina = player.staminaMax;
    player.attackCooldown = 0;
    player.dashCooldown = 0;
    player.selectedItem = itemOrder.includes(player.selectedItem) ? player.selectedItem : "potion";
    player.combo = 0;
    player.comboTimer = 0;
    player.guard = 0;
    player.slow = 0;
    player.burn = 0;
    player.burnTick = 0;
    state.bossDefeated = Boolean(data.bossDefeated);
    state.guardianDefeated = Boolean(data.guardianDefeated);
    state.spawnedBoss = state.bossDefeated ? Boolean(data.spawnedBoss) : false;
    state.spawnedGuardian = state.guardianDefeated ? Boolean(data.spawnedGuardian) : false;
    state.elderReported = Boolean(data.elderReported);
    state.chests = savedIdSet(data.chests, rewardIds(TREASURE_CHESTS));
    state.discoveries = savedIdSet(data.discoveries, rewardIds(DISCOVERY_POINTS));
    say("旅を再開しました");
    return true;
  } catch {
    return false;
  }
}

function resetGame() {
  Object.assign(player, {
    x: 10 * TILE,
    y: 48 * TILE,
    w: 10,
    h: 12,
    dir: "down",
    hp: 46,
    hpMax: 46,
    level: 1,
    xp: 0,
    xpNext: 34,
    gold: 18,
    weapon: 0,
    armor: 0,
    potions: 2,
    bombs: 1,
    wards: 0,
    selectedItem: "potion",
    sealCrest: false,
    hunterCharm: false,
    regenCharm: false,
    invuln: 0,
    guard: 0,
    slow: 0,
    burn: 0,
    burnTick: 0,
    stamina: 100,
    staminaMax: 100,
    attackCooldown: 0,
    dashCooldown: 0,
    combo: 0,
    comboTimer: 0,
    speed: 66,
    scales: 0,
  });
  state.monsters = [];
  state.sparks = [];
  state.slashes = [];
  state.rings = [];
  state.floaters = [];
  state.particles = [];
  state.projectiles = [];
  state.discoveries = new Set();
  state.spawnedBoss = false;
  state.bossDefeated = false;
  state.spawnedGuardian = false;
  state.guardianDefeated = false;
  state.elderReported = false;
  state.gameOver = false;
  state.victory = false;
  state.healCooldown = 0;
  state.townGateOpen = false;
  state.townGateHold = 0;
  state.pointerMove = null;
  state.infoPanel = null;
  refreshDerivedStats();
  localStorage.removeItem(SAVE_KEY);
  say("新しい旅が始まった");
}

function say(text, duration = 1800) {
  state.message = text;
  state.messageUntil = performance.now() + duration;
  ui.toast.textContent = text;
  ui.toast.classList.add("show");
}

function getCamera() {
  const x = clamp(player.x + player.w / 2 - W / 2, 0, MAP_W * TILE - W);
  const y = clamp(player.y + player.h / 2 - VIEW_H / 2, 0, MAP_H * TILE - VIEW_H);
  const shakeX = state.shake > 0 ? irand(-1, 1) : 0;
  const shakeY = state.shake > 0 ? irand(-1, 1) : 0;
  return { x: Math.floor(x + shakeX), y: Math.floor(y + shakeY) };
}

function moveActor(actor, dx, dy) {
  if (dx !== 0) {
    const nx = clamp(actor.x + dx, 0, MAP_W * TILE - actor.w);
    if (isPassableRect(actor, nx, actor.y)) actor.x = nx;
  }
  if (dy !== 0) {
    const ny = clamp(actor.y + dy, 0, MAP_H * TILE - actor.h);
    if (isPassableRect(actor, actor.x, ny)) actor.y = ny;
  }
}

function hasKey(code) {
  return state.keys.has(code) || state.virtualKeys.has(code);
}

function pointerMoveVector() {
  if (!state.pointerMove) return { x: 0, y: 0 };
  const cam = getCamera();
  const px = player.x + player.w / 2 - cam.x;
  const py = player.y + player.h / 2 - cam.y;
  const dx = state.pointerMove.x - px;
  const dy = state.pointerMove.y - py;
  if (Math.hypot(dx, dy) < 10) return { x: 0, y: 0 };
  return normalize(dx, dy);
}

function inputMoveVector() {
  let dx = 0;
  let dy = 0;
  if (hasKey("ArrowLeft") || hasKey("KeyA")) dx -= 1;
  if (hasKey("ArrowRight") || hasKey("KeyD")) dx += 1;
  if (hasKey("ArrowUp") || hasKey("KeyW")) dy -= 1;
  if (hasKey("ArrowDown") || hasKey("KeyS")) dy += 1;
  return normalize(dx, dy);
}

function facingVector() {
  return DIRS[player.dir] || DIRS.down;
}

function updatePlayer(dt) {
  let { x: dx, y: dy } = inputMoveVector();
  if (!dx && !dy) {
    const pointer = pointerMoveVector();
    dx = pointer.x;
    dy = pointer.y;
  }

  const n = normalize(dx, dy);
  if (dx || dy) {
    player.dir = directionFromVector(n.x, n.y, player.dir);
    player.step += dt * 0.012;
    moveActor(player, n.x * playerMoveSpeed() * dt * 0.001, n.y * playerMoveSpeed() * dt * 0.001);
  }

  player.invuln = Math.max(0, player.invuln - dt);
  player.guard = Math.max(0, player.guard - dt);
  player.slow = Math.max(0, player.slow - dt);
  player.burn = Math.max(0, player.burn - dt);
  player.burnTick = Math.max(0, player.burnTick - dt);
  if (player.burn > 0 && player.burnTick <= 0 && player.hp > 1) {
    player.burnTick = 620;
    player.hp = Math.max(1, player.hp - 1);
    addFloater(player.x + player.w / 2, player.y - 2, "BURN", "#ff8a3d");
  }
  const regen = regenRate();
  if (regen > 0 && player.burn <= 0 && player.hp > 0 && player.hp < player.hpMax) {
    player.hp = Math.min(player.hpMax, player.hp + regen * dt * 0.001);
  }
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.stamina = Math.min(player.staminaMax, player.stamina + dt * 0.032);
  player.comboTimer = Math.max(0, player.comboTimer - dt);
  if (player.comboTimer <= 0) player.combo = 0;
  state.searchCooldown = Math.max(0, state.searchCooldown - dt);
  state.healCooldown = Math.max(0, state.healCooldown - dt);
  updateTownGate(dt);
  updateHealCircle();
  updateDiscoverySprings();
}

function playerNearTownGate() {
  const pc = centerOf(player);
  return TOWN_GATES.some((gate) => {
    const gx = (gate.x + gate.w / 2) * TILE;
    const gy = (gate.y + gate.h / 2) * TILE;
    return Math.hypot(pc.x - gx, pc.y - gy) < 42;
  });
}

function updateTownGate(dt) {
  const playerInsideTown = inTown(player.x, player.y);
  if (playerNearTownGate() && !playerInsideTown) {
    state.townGateHold = 1300;
  } else {
    state.townGateHold = Math.max(0, state.townGateHold - dt);
  }
  const nextOpen = state.townGateHold > 0;
  if (nextOpen !== state.townGateOpen) {
    state.townGateOpen = nextOpen;
    say(nextOpen ? "門が開いた" : "門が閉じた", 900);
  }
}

function updateHealCircle() {
  const pc = centerOf(player);
  const hx = (HEAL_CIRCLE.x + 0.5) * TILE;
  const hy = (HEAL_CIRCLE.y + 0.5) * TILE;
  if (Math.hypot(pc.x - hx, pc.y - hy) > 11 || state.healCooldown > 0 || player.hp <= 0) return;
  state.healCooldown = 1400;
  if (player.hp < player.hpMax) {
    player.hp = player.hpMax;
    player.guard = Math.max(player.guard, 900);
    addRing(hx, hy, "#6de4ff", 30);
    burst(hx, hy, "#74ff8f", 18);
    say("魔法陣が傷を癒やした");
  }
}

function updateDiscoverySprings() {
  for (const spring of DISCOVERY_POINTS.filter((d) => d.kind === "spring" && state.discoveries.has(d.id))) {
    const pc = centerOf(player);
    const sx = (spring.x + 0.5) * TILE;
    const sy = (spring.y + 0.5) * TILE;
    if (Math.hypot(pc.x - sx, pc.y - sy) > 11 || state.healCooldown > 0 || player.hp <= 0) continue;
    state.healCooldown = 1400;
    player.hp = player.hpMax;
    player.stamina = player.staminaMax;
    player.guard = Math.max(player.guard, 600);
    addRing(sx, sy, "#74ff8f", 24);
    burst(sx, sy, "#74ff8f", 12);
    say("隠し泉で回復した");
  }
}

function updateMonsters(dt) {
  const playerCenter = centerOf(player);
  for (const monster of state.monsters) {
    if (monster.hp <= 0) continue;
    monster.age += dt;
    monster.hurt = Math.max(0, monster.hurt - dt);
    monster.contactTimer = Math.max(0, monster.contactTimer - dt);
    monster.fireCooldown = Math.max(0, monster.fireCooldown - dt);
    monster.windup = Math.max(0, monster.windup - dt);
    monster.chargeTime = Math.max(0, monster.chargeTime - dt);
    monster.chargeCooldown = Math.max(0, monster.chargeCooldown - dt);
    monster.wanderTimer -= dt;

    const c = centerOf(monster);
    const dist = Math.hypot(playerCenter.x - c.x, playerCenter.y - c.y);
    let vx = 0;
    let vy = 0;

    if (monster.boss && !monster.enraged && monster.hp <= monster.hpMax * 0.5) {
      monster.enraged = true;
      monster.speed += 6;
      monster.atk += 4;
      monster.fireCooldown = 120;
      state.shake = Math.max(state.shake, 260);
      addRing(c.x, c.y, "#ff543d", 48);
      say("赤竜が怒り狂う!", 2600);
    }

    if (monster.boss && monster.enraged && !monster.summoned && monster.hp <= monster.hpMax * 0.42) {
      monster.summoned = true;
      spawnIfClear("dragonling", monster.x - 28, monster.y + 26);
      spawnIfClear("wisp", monster.x + 34, monster.y + 20);
      say("赤竜が眷属を呼んだ!", 2200);
    }

    if (monster.type === "boar" && monster.windup <= 0 && monster.chargeTime <= 0 && monster.chargeCooldown <= 0 && dist < 92) {
      monster.chargeVector = normalize(playerCenter.x - c.x, playerCenter.y - c.y);
      monster.windup = 360;
      monster.chargeCooldown = 1700;
      addRing(c.x, c.y, "#ff8a3d", 15);
    }

    if ((monster.type === "wisp" || monster.boss || monster.midboss) && monster.fireCooldown <= 0 && dist < (monster.boss ? 180 : monster.midboss ? 150 : 130)) {
      if (monster.boss && monster.enraged) {
        shootProjectile(monster, playerCenter, -0.28);
        shootProjectile(monster, playerCenter, 0);
        shootProjectile(monster, playerCenter, 0.28);
      } else {
        shootProjectile(monster, playerCenter);
      }
      monster.fireCooldown = monster.boss ? rand(850, 1400) : monster.midboss ? rand(1050, 1700) : rand(1300, 2100);
    }

    if (monster.windup > 0) {
      vx = 0;
      vy = 0;
      if (monster.windup <= 40) monster.chargeTime = 360;
    } else if (monster.chargeTime > 0) {
      vx = monster.chargeVector.x;
      vy = monster.chargeVector.y;
    } else if (monster.boss || dist < 230) {
      const chase = normalize(playerCenter.x - c.x, playerCenter.y - c.y);
      vx = chase.x;
      vy = chase.y;
    } else {
      if (monster.wanderTimer <= 0) {
        monster.wanderTimer = rand(700, 1800);
        const a = rand(0, Math.PI * 2);
        monster.vx = Math.cos(a);
        monster.vy = Math.sin(a);
      }
      vx = monster.vx;
      vy = monster.vy;
    }

    monster.dir = directionFromVector(vx, vy, monster.dir);
    const slow = rectsOverlap(monster, player) ? 0.25 : 1;
    const chargeSpeed = monster.chargeTime > 0 ? 2.55 : 1;
    moveActor(monster, vx * monster.speed * chargeSpeed * slow * dt * 0.001, vy * monster.speed * chargeSpeed * slow * dt * 0.001);
    resolveContact(monster);
  }

  state.monsters = state.monsters.filter((monster) => {
    if (monster.hp > 0) return true;
    defeatMonster(monster);
    return false;
  });
}

function shootProjectile(monster, target, angleOffset = 0) {
  const c = centerOf(monster);
  const baseAim = normalize(target.x - c.x, target.y - c.y);
  const cos = Math.cos(angleOffset);
  const sin = Math.sin(angleOffset);
  const aim = {
    x: baseAim.x * cos - baseAim.y * sin,
    y: baseAim.x * sin + baseAim.y * cos,
  };
  const speed = monster.boss ? 78 : monster.midboss ? 68 : 62;
  state.projectiles.push({
    x: c.x,
    y: c.y,
    vx: aim.x * speed,
    vy: aim.y * speed,
    r: monster.boss ? 4 : monster.midboss ? 3 : 3,
    damage: monster.boss ? 14 : monster.midboss ? 11 : 8,
    color: monster.boss ? "#ff543d" : monster.midboss ? "#55c7a0" : "#ffd166",
    source: monster.boss ? "dragon" : monster.midboss ? "guardian" : monster.type,
    life: monster.boss ? 1500 : monster.midboss ? 1350 : 1200,
  });
  addSlash(c.x + aim.x * 8, c.y + aim.y * 8, monster.dir, monster.boss ? "#ff543d" : monster.midboss ? "#55c7a0" : "#ffd166");
}

function updateProjectiles(dt) {
  state.projectiles = state.projectiles.filter((p) => {
    const prevX = p.x;
    const prevY = p.y;
    p.x += p.vx * dt * 0.001;
    p.y += p.vy * dt * 0.001;
    p.life -= dt;
    if (p.life <= 0) return false;

    const tx = Math.floor(p.x / TILE);
    const ty = Math.floor(p.y / TILE);
    if (blocksProjectileTownEntry(prevX, prevY, p.x, p.y)) {
      burst(p.x, p.y, "#6de4ff", 3);
      return false;
    }
    if (isBlockedTile(tileAt(tx, ty), { flying: false })) {
      burst(p.x, p.y, p.color, 4);
      return false;
    }

    const hitbox = { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 };
    if (rectsOverlap(player, hitbox)) {
      if (player.invuln <= 0 && player.hp > 0) {
        const source = p.source === "wisp" || p.source === "dragon" ? "fire" : "projectile";
        let hurt = Math.max(1, Math.round((p.damage - Math.floor(playerDefense() * 0.45)) * armorDamageMultiplier({ boss: p.source === "dragon" }, 0, source)));
        if (p.source === "dragon" && hurt < 3) hurt = 3;
        if (p.source === "guardian" && hurt < 2) hurt = 2;
        if (player.guard > 0) hurt = Math.floor(hurt * 0.3);
        player.hp = Math.max(0, player.hp - hurt);
        player.invuln = 320;
        state.shake = Math.max(state.shake, 120);
        addFloater(player.x + player.w / 2, player.y, String(hurt), "#ffeb61");
        burst(player.x + player.w / 2, player.y + player.h / 2, p.color, 8);
        if (player.hp <= 0) {
          state.gameOver = true;
          say("倒れた... Rで再挑戦", 5000);
        }
        if (p.source === "wisp" || p.source === "dragon") {
          player.burn = Math.max(player.burn, p.source === "dragon" ? 2600 : 1500);
        } else if (p.source === "guardian") {
          player.slow = Math.max(player.slow, 1500);
        }
      }
      return false;
    }

    return true;
  });
}

function blocksProjectileTownEntry(prevX, prevY, nextX, nextY) {
  const from = { x: Math.floor(prevX / TILE), y: Math.floor(prevY / TILE) };
  const to = { x: Math.floor(nextX / TILE), y: Math.floor(nextY / TILE) };
  const wasInside = inTownTile(from.x, from.y);
  const willBeInside = inTownTile(to.x, to.y);
  if (!willBeInside) return false;
  if (wasInside) return !state.townGateOpen;
  if (!state.townGateOpen) return true;
  return !(tileInGate(from.x, from.y) || tileInGate(to.x, to.y));
}

function resolveContact(monster) {
  if (!rectsOverlap(player, monster) || monster.contactTimer > 0 || player.hp <= 0) return;
  monster.contactTimer = monster.boss ? 320 : 380;

  const pDot = facingDot(player, monster);
  const mDot = facingDot(monster, player);
  const pMult = pDot > 0.58 ? 1.5 : pDot > -0.18 ? 0.9 : 0.38;
  const mMult = mDot > 0.58 ? 1.25 : mDot > -0.18 ? 0.85 : 0.42;
  const crit = pDot > 0.78 && Math.random() < 0.22 + player.weapon * 0.03;
  const critMult = crit ? 1.55 : 1;
  const gearMult = weaponDamageMultiplier(monster, pDot, mDot);
  const hit = Math.max(1, Math.round((playerAttack() - monster.def + rand(0, 3)) * pMult * critMult * gearMult));
  let hurt = Math.max(0, Math.round((monster.atk - playerDefense() + rand(0, 2)) * mMult * armorDamageMultiplier(monster, pDot)));
  if ((monster.boss || monster.midboss) && hurt < 2) hurt = 2;
  if (player.guard > 0) hurt = Math.floor(hurt * 0.35);

  monster.hp -= hit;
  monster.hurt = 120;
  addFloater(monster.x + monster.w / 2, monster.y, crit ? `${hit}!` : String(hit), crit ? "#ffd166" : "#ffffff");
  addSlash(monster.x + monster.w / 2, monster.y + monster.h / 2, player.dir, crit ? "#ffd166" : "#f8fbff");

  const pc = centerOf(player);
  const mc = centerOf(monster);
  const away = normalize(mc.x - pc.x, mc.y - pc.y);
  moveActor(monster, away.x * 6, away.y * 6);

  if (hurt > 0 && player.invuln <= 0) {
    player.hp = Math.max(0, player.hp - hurt);
    player.invuln = 260;
    state.shake = 120;
    addFloater(player.x + player.w / 2, player.y, String(hurt), "#ffeb61");
    burst(player.x + player.w / 2, player.y + player.h / 2, "#ff5444", 5);
    moveActor(player, -away.x * 4, -away.y * 4);
    if (player.hp <= 0) {
      state.gameOver = true;
      say("倒れた... Rで再挑戦", 5000);
    }
    applyContactStatus(monster);
  }

  if (player.guard > 0 && hurt === 0) {
    addFloater(player.x + player.w / 2, player.y - 2, "GUARD", "#6de4ff");
    burst(player.x + player.w / 2, player.y + player.h / 2, "#6de4ff", 3);
  }

  if (pDot > 0.58) {
    burst(monster.x + monster.w / 2, monster.y + monster.h / 2, "#fff36b", monster.boss ? 12 : 7);
  } else {
    burst(monster.x + monster.w / 2, monster.y + monster.h / 2, "#ff9c52", 4);
  }
}

function applyContactStatus(monster) {
  if (monster.type === "slime") {
    player.slow = Math.max(player.slow, 1200);
    addFloater(player.x + player.w / 2, player.y - 7, "SLOW", "#9df27f");
  } else if (monster.type === "bat") {
    player.stamina = Math.max(0, player.stamina - 12);
    addFloater(player.x + player.w / 2, player.y - 7, "ST-", "#d7b5ff");
  } else if (monster.type === "wisp" || monster.type === "dragonling" || monster.boss) {
    player.burn = Math.max(player.burn, monster.boss ? 2600 : 1500);
    addFloater(player.x + player.w / 2, player.y - 7, "BURN", "#ff8a3d");
  }
}

function defeatMonster(monster) {
  player.combo += 1;
  player.comboTimer = 2400;
  const comboGold = Math.floor(monster.gold * Math.min(0.45, player.combo * 0.04));
  const goldGain = monster.gold + comboGold;
  player.xp += monster.xp;
  player.gold += goldGain;
  burst(monster.x + monster.w / 2, monster.y + monster.h / 2, monster.color, monster.boss ? 34 : 14);
  addFloater(monster.x + monster.w / 2, monster.y - 6, `+${goldGain}G`, "#fff36b");
  if (player.combo >= 2) {
    addFloater(monster.x + monster.w / 2, monster.y - 14, `${player.combo}連`, "#6de4ff");
  }

  grantMonsterDefeatDrops(monster);

  if (monster.midboss) {
    state.guardianDefeated = true;
    player.sealCrest = true;
    player.scales = Math.min(3, player.scales + 1);
    player.wards = Math.min(9, player.wards + 2);
    player.bombs = Math.min(9, player.bombs + 1);
    addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#55c7a0", 42);
    say("封印の紋章を手に入れた!", 4200);
  }

  if (monster.boss) {
    state.bossDefeated = true;
    state.victory = true;
    state.elderReported = false;
    player.scales = 3;
    say("赤竜を封じた!", 5000);
  }

  levelUp();
}

function addFloater(x, y, text, color) {
  return effectHelpers.addFloater(effectContext(), x, y, text, color);
}

function addSlash(x, y, dir, color) {
  return effectHelpers.addSlash(effectContext(), x, y, dir, color);
}

function addRing(x, y, color, radius = 32) {
  return effectHelpers.addRing(effectContext(), x, y, color, radius);
}

function burst(x, y, color, count) {
  return effectHelpers.burst(effectContext(), x, y, color, count);
}

function updateEffects(dt) {
  return effectHelpers.updateEffects(effectContext(), dt);
}

function contextAction() {
  if (state.gameOver || player.hp <= 0) return;
  if (nearestAttackTarget()) {
    performAttack();
    return;
  }
  if (nearestNpc() || nearestChest() || playerNearCave()) {
    interact();
    return;
  }
  performAttack();
}

function playerNearCave() {
  const tx = Math.floor((player.x + player.w / 2) / TILE);
  const ty = Math.floor((player.y + player.h / 2) / TILE);
  return Math.abs(tx - 51) <= 1 && Math.abs(ty - 18) <= 1;
}

function nearestAttackTarget() {
  const pc = centerOf(player);
  const dir = facingVector();
  let best = null;
  let bestScore = Infinity;
  for (const monster of state.monsters) {
    if (monster.hp <= 0) continue;
    const mc = centerOf(monster);
    const relX = mc.x - pc.x;
    const relY = mc.y - pc.y;
    const forward = relX * dir.x + relY * dir.y;
    const side = Math.abs(relX * -dir.y + relY * dir.x);
    if (forward < -4 || forward > ATTACK_RANGE + monster.w) continue;
    if (side > ATTACK_WIDTH / 2 + monster.w / 2) continue;
    const score = forward + side * 0.35;
    if (score < bestScore) {
      best = monster;
      bestScore = score;
    }
  }
  return best;
}

function performAttack() {
  if (player.attackCooldown > 0 || state.gameOver || player.hp <= 0) return;
  player.attackCooldown = 230;
  const pc = centerOf(player);
  const dir = facingVector();
  const slashX = pc.x + dir.x * 14;
  const slashY = pc.y + dir.y * 14;
  addSlash(slashX, slashY, player.dir, "#f8fbff");

  let hitCount = 0;
  for (const monster of state.monsters) {
    if (monster.hp <= 0) continue;
    const mc = centerOf(monster);
    const relX = mc.x - pc.x;
    const relY = mc.y - pc.y;
    const forward = relX * dir.x + relY * dir.y;
    const side = Math.abs(relX * -dir.y + relY * dir.x);
    if (forward < -2 || forward > ATTACK_RANGE + monster.w) continue;
    if (side > ATTACK_WIDTH / 2 + monster.w / 2) continue;
    hitMonster(monster, 1.08 + hitCount * 0.08, "#ffffff");
    hitCount += 1;
  }

  if (hitCount) {
    player.comboTimer = 2400;
    state.shake = Math.max(state.shake, 60);
  } else {
    player.combo = Math.max(0, player.combo - 1);
  }
}

function hitMonster(monster, power = 1, color = "#ffffff") {
  const pDot = facingDot(player, monster);
  const mDot = facingDot(monster, player);
  const crit = Math.random() < 0.12 + player.weapon * 0.03;
  const critMult = crit ? 1.55 : 1;
  const hit = Math.max(1, Math.round((playerAttack() - monster.def + rand(0, 4)) * power * critMult * weaponDamageMultiplier(monster, pDot, mDot)));
  monster.hp -= hit;
  monster.hurt = 150;
  player.stamina = Math.min(player.staminaMax, player.stamina + 5);
  const pc = centerOf(player);
  const mc = centerOf(monster);
  const away = normalize(mc.x - pc.x, mc.y - pc.y);
  addFloater(mc.x, monster.y, crit ? `${hit}!` : String(hit), crit ? "#ffd166" : color);
  burst(mc.x, mc.y, crit ? "#ffd166" : "#f8fbff", monster.boss ? 10 : 6);
  moveActor(monster, away.x * 7, away.y * 7);
}

function dash() {
  const cost = dashCost();
  if (state.gameOver || player.hp <= 0 || player.dashCooldown > 0 || player.stamina < cost) return;
  const input = inputMoveVector();
  const dir = input.x || input.y ? input : facingVector();
  player.stamina = Math.max(0, player.stamina - cost);
  player.dashCooldown = 320;
  player.invuln = Math.max(player.invuln, 260);
  player.step += 1;
  for (let i = 0; i < 5; i += 1) {
    moveActor(player, dir.x * 7, dir.y * 7);
    burst(player.x + player.w / 2 - dir.x * 4, player.y + player.h / 2 - dir.y * 4, "#6de4ff", 1);
  }
  addRing(player.x + player.w / 2, player.y + player.h / 2, "#6de4ff", 18);
}

function interact() {
  if (state.gameOver) return;
  const npc = nearestNpc();
  if (npc) {
    handleNpc(npc);
    return;
  }

  const chest = nearestChest();
  if (chest) {
    openChest(chest);
    return;
  }

  if (playerNearCave()) {
    handleCave();
    return;
  }

  searchGround();
}

function nearestChest() {
  const pc = centerOf(player);
  for (const chest of TREASURE_CHESTS) {
    if (state.chests.has(chest.id)) continue;
    const cx = (chest.x + 0.5) * TILE;
    const cy = (chest.y + 0.5) * TILE;
    if (Math.hypot(pc.x - cx, pc.y - cy) < 22) return chest;
  }
  return null;
}

function openChest(chest) {
  if (state.chests.has(chest.id)) return;
  state.chests.add(chest.id);
  const cx = (chest.x + 0.5) * TILE;
  const cy = (chest.y + 0.5) * TILE;
  addRing(cx, cy, "#ffd166", 22);
  burst(cx, cy, "#ffd166", 16);
  grantChestReward(chest.reward);
}

function grantChestReward(reward) {
  return rewardHelpers.grantChestReward(rewardContext(), reward);
}

function nearestNpc() {
  for (const npc of state.npcs) {
    const d = Math.hypot(centerOf(player).x - centerOf(npc).x, centerOf(player).y - centerOf(npc).y);
    if (d < 24) return npc;
  }
  return null;
}

function handleNpc(npc) {
  if (npc.type === "elder") {
    if (state.bossDefeated) {
      state.elderReported = true;
      say("長老「竜は封じられた。村は救われた」", 4200);
    } else if (canChallengeDragon()) {
      say("長老「封印は解けた。北東の竜洞へ向かえ」");
    } else if (!state.guardianDefeated && guardianReady()) {
      say("長老「北森の守護者を越え、紋章を得よ」");
    } else if (player.scales < BOSS_REQUIREMENTS.scales) {
      say(`長老「竜の鱗を${BOSS_REQUIREMENTS.scales}枚集めよ」`);
    } else if (player.level < BOSS_REQUIREMENTS.level) {
      say(`長老「赤竜にはLV${BOSS_REQUIREMENTS.level}が要る」`);
    } else {
      say("長老「北森に封印を守る者がいる」");
    }
  }

  if (npc.type === "smith") {
    const target = player.armor <= player.weapon ? "armor" : "weapon";
    const rank = player[target] + 1;
    if (rank >= weaponNames.length) {
      say("鍛冶屋「これ以上は鍛えられん」");
      return;
    }
    const cost = target === "weapon" ? weaponCosts[rank] : armorCosts[rank];
    if (player.gold >= cost) {
      player.gold -= cost;
      player[target] += 1;
      say(target === "weapon" ? `${weaponNames[player.weapon]}: ${weaponTraits[player.weapon]}` : `${armorNames[player.armor]}: ${armorTraits[player.armor]}`);
    } else {
      const name = target === "weapon" ? weaponNames[rank] : armorNames[rank];
      const trait = target === "weapon" ? weaponTraits[rank] : armorTraits[rank];
      say(`鍛冶屋「${name}(${trait})は${cost}G」`);
    }
  }

  if (npc.type === "healer") {
    const cost = player.level * 8;
    if (player.hp === player.hpMax) {
      const kitCost = 18 + player.level * 4;
      if (player.gold >= kitCost && (player.potions < 5 || player.bombs < 2 || player.wards < 1)) {
        player.gold -= kitCost;
        player.potions = Math.min(9, player.potions + 1);
        if (player.level >= 2) player.bombs = Math.min(9, player.bombs + 1);
        if (player.level >= 3) player.wards = Math.min(9, player.wards + 1);
        say("薬師は旅道具を包んだ");
      } else {
        say("薬師「無理は禁物だよ」");
      }
    } else if (player.gold >= cost) {
      player.gold -= cost;
      player.hp = player.hpMax;
      say("薬師は傷を癒やした");
    } else {
      say(`薬師「${cost}Gで癒やせるよ」`);
    }
  }
}

function handleCave() {
  if (state.bossDefeated) {
    say("洞穴は静まり返っている");
    return;
  }
  const missing = bossMissingRequirements();
  if (missing.length > 0) {
    say(`封印が拒む: ${missing.join(" / ")}`, 2600);
    return;
  }
  if (!state.spawnedBoss) {
    state.spawnedBoss = true;
    spawnMonster("dragon", 51 * TILE - 4, 14 * TILE);
    say("赤竜が目覚めた!");
  } else {
    say("洞穴の奥から熱風が来る");
  }
}

function canChallengeDragon() {
  return bossMissingRequirements().length === 0;
}

function bossMissingRequirements() {
  const missing = [];
  if (player.scales < BOSS_REQUIREMENTS.scales) missing.push(`鱗${player.scales}/${BOSS_REQUIREMENTS.scales}`);
  if (player.level < BOSS_REQUIREMENTS.level) missing.push(`LV${player.level}/${BOSS_REQUIREMENTS.level}`);
  if (!player.sealCrest || !state.guardianDefeated) missing.push("紋章");
  return missing;
}

function searchGround() {
  if (state.searchCooldown > 0) return;
  state.searchCooldown = 700;
  const chest = nearestChest();
  if (chest) {
    openChest(chest);
    return;
  }
  const discovery = nearestDiscovery();
  if (discovery) {
    revealDiscovery(discovery);
    return;
  }
  const tx = Math.floor((player.x + player.w / 2) / TILE);
  const ty = Math.floor((player.y + player.h / 2) / TILE);
  const tile = tileAt(tx, ty);
  if ((tile === TILE_FLOWER || tile === TILE_FIELD || tile === TILE_GRASS) && Math.random() < 0.55) {
    gainFoundItem(tile);
    setTile(tx, ty, TILE_GRASS);
  } else {
    say("何も見つからない");
  }
}

function nearestDiscovery() {
  const pc = centerOf(player);
  for (const discovery of DISCOVERY_POINTS) {
    if (state.discoveries.has(discovery.id)) continue;
    const dx = (discovery.x + 0.5) * TILE;
    const dy = (discovery.y + 0.5) * TILE;
    if (Math.hypot(pc.x - dx, pc.y - dy) < 20) return discovery;
  }
  return null;
}

function revealDiscovery(discovery) {
  if (state.discoveries.has(discovery.id)) {
    say("既に調べた場所だ");
    return;
  }
  state.discoveries.add(discovery.id);
  const dx = (discovery.x + 0.5) * TILE;
  const dy = (discovery.y + 0.5) * TILE;
  addRing(dx, dy, "#bafc87", 24);
  grantDiscoveryReward(discovery, dx, dy);
}

function grantDiscoveryReward(discovery, x, y) {
  return rewardHelpers.grantDiscoveryReward(rewardContext(), discovery, x, y);
}

function gainFoundItem(tile) {
  return rewardHelpers.gainFoundItem(rewardContext(), tile);
}
function useSelectedItem() {
  return rewardHelpers.useSelectedItem(rewardContext());
}

function usePotion() {
  return rewardHelpers.usePotion(rewardContext());
}

function useBomb() {
  return rewardHelpers.useBomb(rewardContext());
}

function useWard() {
  return rewardHelpers.useWard(rewardContext());
}

function selectItem(item) {
  return rewardHelpers.selectItem(rewardContext(), item);
}

function cycleItem(step) {
  return rewardHelpers.cycleItem(rewardContext(), step);
}


function showStats() {
  const page = statsPanelPages()[state.statsPage];
  state.infoPanel = { ...page, until: performance.now() + 4200 };
  say(`${page.title}を確認`, 1200);
  state.statsPage = (state.statsPage + 1) % 3;
}

function statsPanelPages() {
  return [
    {
      title: "装備",
      lines: [
        `${weaponNames[player.weapon]} ${weaponTraits[player.weapon]} 攻${playerAttack()}`,
        `${armorNames[player.armor]} ${armorTraits[player.armor]} 防${playerDefense()}`,
        nextUpgradeText(),
      ],
    },
    {
      title: "探索力",
      lines: [
        `HP ${Math.ceil(player.hp)}/${player.hpMax} ST ${Math.floor(player.stamina)}/${player.staminaMax}`,
        `回避 ${dashCost()}ST 再生 ${regenRate().toFixed(1)}/秒`,
        `状態 ${player.burn > 0 ? "燃焼" : player.slow > 0 ? "鈍足" : "通常"}`,
      ],
    },
    {
      title: "所持品",
      lines: [
        `薬${player.potions} 爆${player.bombs} 護${player.wards}`,
        `鱗 ${player.scales}/3 紋 ${player.sealCrest ? "有" : "無"}`,
        `宝箱 ${state.chests.size}/${TREASURE_CHESTS.length}`,
      ],
    },
  ];
}

function nextUpgradeText() {
  const target = player.armor <= player.weapon ? "鎧" : "剣";
  const rank = target === "鎧" ? player.armor + 1 : player.weapon + 1;
  const names = target === "鎧" ? armorNames : weaponNames;
  const costs = target === "鎧" ? armorCosts : weaponCosts;
  if (rank >= names.length) return "鍛冶 強化完了";
  return `次 ${target}:${names[rank]} ${costs[rank]}G`;
}

function updateZone() {
  const tx = Math.floor((player.x + player.w / 2) / TILE);
  const ty = Math.floor((player.y + player.h / 2) / TILE);
  let name = "草原";
  if (inTown(player.x, player.y)) name = "村";
  else if (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 18) name = "竜洞";
  else if (tileAt(tx, ty) === TILE_WATER) name = "水辺";
  else if (tx > 40) name = "東の森";
  else if (ty < 25) name = "北森";
  else if (distanceFromVillage() > 330) name = "荒野";
  ui.zone.textContent = name;
}

function updateUi() {
  ui.gold.textContent = `${player.gold}G`;
  ui.level.textContent = String(player.level);
  ui.hp.textContent = `${Math.ceil(player.hp)}/${player.hpMax}`;
  ui.exp.textContent = `${player.xp}/${player.xpNext}`;
  ui.weapon.textContent = `${weaponNames[player.weapon] || "竜"} ${weaponTraits[player.weapon] || ""}`;
  ui.armor.textContent = `${armorNames[player.armor] || "竜"} ${armorTraits[player.armor] || ""}`;
  ui.potion.textContent = String(player.potions);
  ui.bomb.textContent = String(player.bombs);
  ui.ward.textContent = String(player.wards);
  ui.combo.textContent = player.combo > 0 ? `${player.combo}` : "0";
  ui.scale.textContent = player.sealCrest ? `${player.scales}/3 紋` : `${player.scales}/3`;
  for (const button of ui.items) {
    button.classList.toggle("is-selected", button.dataset.item === player.selectedItem);
  }
  updateZone();
}

function draw() {
  const cam = getCamera();
  ctx.clearRect(0, 0, W, H);
  drawWorld(cam);
  drawWorldAtmosphere(cam);
  drawFieldDetails(cam);
  drawTownDetails(cam);
  drawVillageRoleMarkers(cam);
  drawHealCircle(cam);
  drawTownFence(cam);
  drawTownGates(cam);
  drawChests(cam);
  drawDiscoveries(cam);
  drawGuardianSite(cam);
  drawNpcs(cam);
  drawEntities(cam);
  drawEffects(cam);
  drawScreenGrade(cam);
  drawObjective();
  drawContextPrompt();
  drawHud();
  drawInfoPanel();

  if (state.gameOver) drawOverlay("GAME OVER", "R");
  if (state.victory && !state.elderReported) drawVictoryBanner();
  if (state.elderReported) drawOverlay("QUEST CLEAR", "CLEAR");
}

function drawInfoPanel() {
  const panel = state.infoPanel;
  if (!panel || performance.now() > panel.until) return;
  const x = 37;
  const y = 17;
  const w = 166;
  const h = 58;
  ctx.fillStyle = "rgba(5, 8, 18, 0.9)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#6de4ff";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "9px monospace";
  ctx.textAlign = "left";
  ctx.fillText(panel.title, x + 7, y + 12);
  ctx.fillStyle = "#ffffff";
  ctx.font = "8px monospace";
  for (let i = 0; i < panel.lines.length; i += 1) {
    ctx.fillText(panel.lines[i], x + 7, y + 25 + i * 11);
  }
}

function drawWorld(cam) {
  const startX = Math.floor(cam.x / TILE);
  const startY = Math.floor(cam.y / TILE);
  const endX = Math.ceil((cam.x + W) / TILE);
  const endY = Math.ceil((cam.y + VIEW_H) / TILE);
  for (let ty = startY; ty <= endY; ty += 1) {
    for (let tx = startX; tx <= endX; tx += 1) {
      drawTile(tileAt(tx, ty), tx * TILE - cam.x, ty * TILE - cam.y, tx, ty);
    }
  }
}

function drawWorldAtmosphere(cam) {
  const time = performance.now();
  const tx = Math.floor((player.x + player.w / 2) / TILE);
  const ty = Math.floor((player.y + player.h / 2) / TILE);

  if (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 19) {
    ctx.fillStyle = "rgba(75, 24, 18, 0.22)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 12; i += 1) {
      const x = (i * 29 + Math.floor(time / 90)) % W;
      const y = (i * 17 + Math.floor(time / 140)) % VIEW_H;
      ctx.fillStyle = i % 2 ? "#ff9a3d" : "#ffd166";
      ctx.fillRect(x, y, 1, 1);
    }
  } else if (tx > 38 || ty < 24) {
    ctx.fillStyle = "rgba(8, 40, 24, 0.12)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 10; i += 1) {
      const x = (i * 37 + Math.floor(time / 130)) % W;
      const y = (i * 19 + Math.floor(time / 210)) % VIEW_H;
      ctx.fillStyle = "#bafc87";
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawTownDetails(cam) {
  drawWell(8 * TILE - cam.x, 46 * TILE - cam.y);
  drawBench(9 * TILE - cam.x, 50 * TILE - cam.y, "x");
  drawBench(14 * TILE - cam.x, 50 * TILE - cam.y, "x");
  drawCrates(16 * TILE - cam.x, 52 * TILE - cam.y);
  drawFlowerBed(6 * TILE - cam.x, 51 * TILE - cam.y);
  drawFlowerBed(14 * TILE - cam.x, 45 * TILE - cam.y);
  drawLamp(17 * TILE - cam.x, 46 * TILE - cam.y);
  drawLamp(6 * TILE - cam.x, 46 * TILE - cam.y);
  drawSign(12 * TILE - cam.x, 48 * TILE - cam.y);
}

function drawVillageRoleMarkers(cam) {
  drawRoleMarker(9 * TILE - cam.x, 46 * TILE - cam.y, "長", "#fff2a6");
  drawRoleMarker(15 * TILE - cam.x, 47 * TILE - cam.y, "鍛", "#ffd166");
  drawRoleMarker(13 * TILE - cam.x, 42 * TILE - cam.y, "薬", "#74ff8f");
  drawRoleMarker(HEAL_CIRCLE.x * TILE - cam.x, (HEAL_CIRCLE.y - 1) * TILE - cam.y, "回", "#6de4ff");
  for (const gate of TOWN_GATES) {
    drawRoleMarker(gate.x * TILE - cam.x, (gate.y - 1) * TILE - cam.y, state.townGateOpen ? "開" : "門", state.townGateOpen ? "#ffd166" : "#d7e2ea");
  }
}

function drawRoleMarker(sx, sy, text, color) {
  if (sx < -16 || sy < -16 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(5, 8, 18, 0.72)";
  ctx.fillRect(sx + 1, sy + 1, 10, 10);
  ctx.strokeStyle = color;
  ctx.strokeRect(sx + 1, sy + 1, 10, 10);
  ctx.font = "8px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = color;
  ctx.fillText(text, sx + 3, sy + 9);
}

function drawFieldDetails(cam) {
  const startX = Math.floor(cam.x / TILE);
  const startY = Math.floor(cam.y / TILE);
  const endX = Math.ceil((cam.x + W) / TILE);
  const endY = Math.ceil((cam.y + VIEW_H) / TILE);
  for (let ty = startY; ty <= endY; ty += 1) {
    for (let tx = startX; tx <= endX; tx += 1) {
      if (inTownTile(tx, ty)) continue;
      const tile = tileAt(tx, ty);
      const sx = tx * TILE - cam.x;
      const sy = ty * TILE - cam.y;
      const n = hashNoise(tx * 3 + 7, ty * 5 + 11);
      if (tile === TILE_GRASS || tile === TILE_FLOWER) {
        if (n > 0.88) drawRock(sx + 5, sy + 8);
        else if (n > 0.76) drawGrassClump(sx + 3, sy + 7);
        else if (n < 0.08) drawTinyFlowers(sx + 3, sy + 4);
      }
      if (tile === TILE_FIELD && n > 0.7) {
        drawCropBundle(sx + 5, sy + 3);
      }
      if (tile === TILE_WATER) {
        const edge = tileAt(tx - 1, ty) !== TILE_WATER || tileAt(tx + 1, ty) !== TILE_WATER;
        if (edge && n > 0.45) drawReeds(sx + (n > 0.7 ? 2 : 12), sy + 5);
      }
      if (tile === TILE_PATH && n > 0.82) {
        drawPebbles(sx + 3, sy + 6);
      }
    }
  }
}

function drawRock(sx, sy) {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(sx + 1, sy + 4, 7, 2);
  ctx.fillStyle = "#6f7780";
  ctx.fillRect(sx + 1, sy + 1, 7, 4);
  ctx.fillStyle = "#aeb7bf";
  ctx.fillRect(sx + 2, sy, 4, 2);
  ctx.fillStyle = "#3f464d";
  ctx.fillRect(sx + 6, sy + 3, 2, 2);
}

function drawGrassClump(sx, sy) {
  ctx.fillStyle = "#1f7d36";
  ctx.fillRect(sx + 1, sy + 5, 11, 2);
  ctx.fillStyle = "#6dde69";
  ctx.fillRect(sx + 2, sy + 2, 1, 5);
  ctx.fillRect(sx + 5, sy, 1, 7);
  ctx.fillRect(sx + 8, sy + 1, 1, 6);
  ctx.fillRect(sx + 11, sy + 3, 1, 4);
}

function drawTinyFlowers(sx, sy) {
  ctx.fillStyle = "#2d8d30";
  ctx.fillRect(sx + 1, sy + 4, 10, 2);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(sx + 2, sy + 2, 2, 2);
  ctx.fillStyle = "#ff8ab3";
  ctx.fillRect(sx + 7, sy + 3, 2, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(sx + 11, sy + 1, 1, 1);
}

function drawCropBundle(sx, sy) {
  ctx.fillStyle = "#4d9f37";
  ctx.fillRect(sx + 1, sy + 8, 9, 2);
  ctx.fillStyle = "#fff06b";
  ctx.fillRect(sx + 2, sy, 1, 9);
  ctx.fillRect(sx + 5, sy + 1, 1, 8);
  ctx.fillRect(sx + 8, sy, 1, 9);
}

function drawReeds(sx, sy) {
  ctx.fillStyle = "#195f3d";
  ctx.fillRect(sx + 1, sy + 2, 1, 8);
  ctx.fillRect(sx + 4, sy, 1, 10);
  ctx.fillRect(sx + 7, sy + 3, 1, 7);
  ctx.fillStyle = "#c98945";
  ctx.fillRect(sx + 3, sy, 3, 2);
}

function drawPebbles(sx, sy) {
  ctx.fillStyle = "#7c5f41";
  ctx.fillRect(sx, sy + 2, 2, 1);
  ctx.fillRect(sx + 6, sy, 3, 2);
  ctx.fillRect(sx + 11, sy + 5, 2, 1);
}

function drawWell(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(sx + 1, sy + 10, 15, 4);
  ctx.fillStyle = "#66717c";
  ctx.fillRect(sx + 2, sy + 6, 12, 7);
  ctx.fillStyle = "#aeb7bf";
  ctx.fillRect(sx + 3, sy + 5, 10, 2);
  ctx.fillStyle = "#172636";
  ctx.fillRect(sx + 5, sy + 8, 6, 3);
  ctx.fillStyle = "#8b3f32";
  ctx.fillRect(sx + 1, sy + 1, 14, 3);
  ctx.fillStyle = "#d9704c";
  ctx.fillRect(sx + 3, sy, 10, 2);
}

function drawBench(sx, sy, axis) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(sx + 1, sy + 8, 17, 3);
  ctx.fillStyle = "#5f371b";
  ctx.fillRect(sx, sy + 4, 18, 3);
  ctx.fillStyle = "#c98945";
  ctx.fillRect(sx + 1, sy + 2, 16, 2);
  ctx.fillStyle = "#2c2018";
  ctx.fillRect(sx + 3, sy + 7, 2, 3);
  ctx.fillRect(sx + 13, sy + 7, 2, 3);
}

function drawCrates(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  drawCrate(sx, sy + 3);
  drawCrate(sx + 8, sy);
  drawCrate(sx + 9, sy + 9);
}

function drawCrate(sx, sy) {
  ctx.fillStyle = "#7b4b25";
  ctx.fillRect(sx, sy, 7, 7);
  ctx.fillStyle = "#c3853f";
  ctx.fillRect(sx + 1, sy + 1, 5, 1);
  ctx.fillRect(sx + 1, sy + 5, 5, 1);
  ctx.fillStyle = "#4f2e17";
  ctx.fillRect(sx + 3, sy + 1, 1, 5);
}

function drawFlowerBed(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "#3b7b37";
  ctx.fillRect(sx, sy, 16, 8);
  ctx.fillStyle = "#2d5c2b";
  ctx.fillRect(sx, sy + 7, 16, 1);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(sx + 3, sy + 2, 2, 2);
  ctx.fillStyle = "#ff6b8a";
  ctx.fillRect(sx + 8, sy + 3, 2, 2);
  ctx.fillStyle = "#eaffff";
  ctx.fillRect(sx + 12, sy + 1, 2, 2);
}

function drawLamp(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  const flicker = Math.floor(performance.now() / 200 + sx + sy) % 2;
  ctx.fillStyle = "#3a2718";
  ctx.fillRect(sx + 7, sy + 4, 2, 10);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(sx + 5, sy + 1, 6, 5);
  ctx.fillStyle = flicker ? "#fff2a6" : "#ff9a3d";
  ctx.fillRect(sx + 6, sy + 2, 4, 3);
}

function drawSign(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "#4f2e17";
  ctx.fillRect(sx + 7, sy + 5, 2, 9);
  ctx.fillStyle = "#c98945";
  ctx.fillRect(sx + 2, sy + 1, 12, 6);
  ctx.fillStyle = "#2c2018";
  ctx.fillRect(sx + 4, sy + 3, 8, 1);
}

function drawChests(cam) {
  for (const chest of TREASURE_CHESTS) {
    const sx = chest.x * TILE - cam.x;
    const sy = chest.y * TILE - cam.y;
    if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) continue;
    drawChest(sx + 3, sy + 5, state.chests.has(chest.id));
  }
}

function drawChest(sx, sy, opened) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(sx, sy + 8, 11, 3);
  ctx.fillStyle = opened ? "#5f4630" : "#9f5b28";
  ctx.fillRect(sx, sy + 4, 11, 7);
  ctx.fillStyle = opened ? "#3b2b20" : "#d28a3c";
  ctx.fillRect(sx + 1, sy + 2, 9, 4);
  ctx.fillStyle = "#2c2018";
  ctx.fillRect(sx, sy + 6, 11, 1);
  ctx.fillStyle = opened ? "#1b1410" : "#ffd166";
  ctx.fillRect(sx + 5, sy + 5, 2, 3);
  if (!opened) {
    ctx.fillStyle = "#fff2a6";
    ctx.fillRect(sx + 2, sy + 3, 3, 1);
  }
}

function drawGuardianSite(cam) {
  if (state.guardianDefeated) return;
  const sx = GUARDIAN_SITE.x * TILE - cam.x;
  const sy = GUARDIAN_SITE.y * TILE - cam.y;
  if (sx < -24 || sy < -24 || sx > W || sy > VIEW_H) return;
  const pulse = Math.floor(performance.now() / 260) % 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(sx - 1, sy + 14, 22, 3);
  ctx.fillStyle = "#475569";
  ctx.fillRect(sx + 5, sy + 4, 10, 12);
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(sx + 6, sy + 2, 8, 4);
  ctx.fillStyle = guardianReady() ? "#55c7a0" : "#53606f";
  ctx.fillRect(sx + 8, sy + 7, 4, 5);
  if (guardianReady()) {
    ctx.strokeStyle = pulse ? "#55c7a0" : "#d8fff1";
    ctx.strokeRect(sx + 2, sy, 16, 18);
  }
}

function drawDiscoveries(cam) {
  for (const discovery of DISCOVERY_POINTS) {
    const sx = discovery.x * TILE - cam.x;
    const sy = discovery.y * TILE - cam.y;
    if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) continue;
    const found = state.discoveries.has(discovery.id);
    if (discovery.kind === "spring") {
      if (!found) {
        drawGlint(sx + 7, sy + 9, "#74ff8f");
      } else {
        ctx.fillStyle = "rgba(116, 255, 143, 0.28)";
        ctx.fillRect(sx + 2, sy + 5, 12, 8);
        ctx.strokeStyle = "#74ff8f";
        ctx.strokeRect(sx + 3, sy + 6, 10, 6);
        ctx.fillStyle = "#d8fff1";
        ctx.fillRect(sx + 7, sy + 8, 2, 2);
      }
    } else if (discovery.kind === "ore") {
      ctx.fillStyle = found ? "#6f7780" : "#374151";
      ctx.fillRect(sx + 4, sy + 8, 9, 5);
      drawGlint(sx + 7, sy + 7, found ? "#d7e2ea" : "#8dd7ff");
    } else if (discovery.kind === "cache") {
      ctx.fillStyle = found ? "#4f2e17" : "#7b4b25";
      ctx.fillRect(sx + 4, sy + 7, 8, 6);
      if (!found) drawGlint(sx + 11, sy + 6, "#ffd166");
    }
  }
}

function drawGlint(sx, sy, color) {
  const pulse = Math.floor(performance.now() / 240) % 2;
  ctx.fillStyle = color;
  ctx.fillRect(sx, sy + 1, 3, 1);
  ctx.fillRect(sx + 1, sy, 1, 3);
  if (pulse) ctx.fillRect(sx + 1, sy + 1, 1, 1);
}

function drawHealCircle(cam) {
  const sx = HEAL_CIRCLE.x * TILE - cam.x;
  const sy = HEAL_CIRCLE.y * TILE - cam.y;
  if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) return;
  const pulse = Math.floor(performance.now() / 180) % 3;
  ctx.fillStyle = "rgba(26, 75, 88, 0.45)";
  ctx.fillRect(sx + 1, sy + 2, 14, 12);
  ctx.strokeStyle = "#6de4ff";
  ctx.strokeRect(sx + 2 - pulse, sy + 3 - pulse, 12 + pulse * 2, 10 + pulse * 2);
  ctx.fillStyle = "#eaffff";
  ctx.fillRect(sx + 7, sy + 4, 2, 8);
  ctx.fillRect(sx + 4, sy + 7, 8, 2);
  ctx.fillStyle = "#74ff8f";
  ctx.fillRect(sx + 3, sy + 3, 2, 2);
  ctx.fillRect(sx + 11, sy + 11, 2, 2);
}

function drawTownFence(cam) {
  const left = 5;
  const right = 18;
  const top = 39;
  const bottom = 55;
  for (let tx = left; tx <= right; tx += 1) {
    if (!tileInGate(tx, top)) drawFenceSegment(tx * TILE - cam.x, top * TILE - cam.y, "x");
    if (!tileInGate(tx, bottom)) drawFenceSegment(tx * TILE - cam.x, bottom * TILE - cam.y + 11, "x");
  }
  for (let ty = top; ty <= bottom; ty += 1) {
    if (!tileInGate(left, ty)) drawFenceSegment(left * TILE - cam.x, ty * TILE - cam.y, "y");
    if (!tileInGate(right, ty)) drawFenceSegment(right * TILE - cam.x + 11, ty * TILE - cam.y, "y");
  }
}

function drawFenceSegment(sx, sy, axis) {
  if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  if (axis === "x") {
    ctx.fillRect(sx, sy + 6, TILE, 4);
    ctx.fillStyle = "#394759";
    ctx.fillRect(sx, sy + 2, TILE, 7);
    ctx.fillStyle = "#7c8a99";
    ctx.fillRect(sx, sy + 2, TILE, 2);
    ctx.fillRect(sx + 2, sy + 5, 5, 2);
    ctx.fillRect(sx + 10, sy + 5, 5, 2);
  } else {
    ctx.fillRect(sx + 6, sy, 4, TILE);
    ctx.fillStyle = "#394759";
    ctx.fillRect(sx + 2, sy, 7, TILE);
    ctx.fillStyle = "#7c8a99";
    ctx.fillRect(sx + 2, sy, 2, TILE);
    ctx.fillRect(sx + 5, sy + 2, 2, 5);
    ctx.fillRect(sx + 5, sy + 10, 2, 5);
  }
}

function drawTownGates(cam) {
  for (const gate of TOWN_GATES) {
    const sx = gate.x * TILE - cam.x;
    const sy = gate.y * TILE - cam.y;
    if (sx < -TILE * 2 || sy < -TILE * 2 || sx > W + TILE || sy > VIEW_H + TILE) continue;
    drawGate(gate, sx, sy);
  }
}

function drawGate(gate, sx, sy) {
  const open = state.townGateOpen;
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(sx, sy + gate.h * TILE - 3, gate.w * TILE, 3);
  ctx.fillStyle = "#4b2a16";
  ctx.fillRect(sx, sy, gate.w * TILE, gate.h * TILE);
  ctx.fillStyle = "#9b5c2b";
  if (gate.axis === "x") {
    ctx.fillRect(sx, sy + 2, gate.w * TILE, 3);
    ctx.fillRect(sx, sy + 10, gate.w * TILE, 3);
    ctx.fillStyle = "#d8a04d";
    if (open) {
      ctx.fillRect(sx + 2, sy - 7, 5, TILE + 7);
      ctx.fillRect(sx + gate.w * TILE - 7, sy - 7, 5, TILE + 7);
    } else {
      for (let x = 4; x < gate.w * TILE; x += 9) ctx.fillRect(sx + x, sy - 2, 4, TILE + 4);
    }
  } else {
    ctx.fillRect(sx + 2, sy, 3, gate.h * TILE);
    ctx.fillRect(sx + 10, sy, 3, gate.h * TILE);
    ctx.fillStyle = "#d8a04d";
    if (open) {
      ctx.fillRect(sx - 7, sy + 2, TILE + 7, 5);
      ctx.fillRect(sx - 7, sy + gate.h * TILE - 7, TILE + 7, 5);
    } else {
      for (let y = 4; y < gate.h * TILE; y += 9) ctx.fillRect(sx - 2, sy + y, TILE + 4, 4);
    }
  }
  ctx.fillStyle = open ? "#74ff8f" : "#ff6b5f";
  ctx.fillRect(sx + Math.floor(gate.w * TILE / 2) - 1, sy + Math.floor(gate.h * TILE / 2) - 1, 3, 3);
}

function drawTile(tile, sx, sy, tx, ty) {
  if (sy > VIEW_H || sx > W || sx < -TILE || sy < -TILE) return;
  const n = hashNoise(tx, ty);
  if (tile === TILE_GRASS || tile === TILE_FLOWER || tile === TILE_FIELD) {
    ctx.fillStyle = tile === TILE_FIELD ? "#7bd957" : n > 0.72 ? "#43bf52" : "#3daf49";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = n > 0.5 ? "#2b8a34" : "#6dde69";
    ctx.fillRect(sx + 2, sy + 5, 2, 1);
    ctx.fillRect(sx + 11, sy + 10, 2, 1);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(sx + 5, sy + 2, 1, 1);
    ctx.fillRect(sx + 13, sy + 6, 1, 1);
    if (tile === TILE_FLOWER) {
      ctx.fillStyle = "#ffeb61";
      ctx.fillRect(sx + 5, sy + 6, 2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx + 8, sy + 9, 2, 2);
    }
    if (tile === TILE_FIELD) {
      ctx.fillStyle = "#d7e44d";
      for (let y = 1; y < TILE; y += 4) ctx.fillRect(sx, sy + y, TILE, 1);
      ctx.fillStyle = "#43943b";
      ctx.fillRect(sx + 2, sy, 1, TILE);
      ctx.fillRect(sx + 10, sy, 1, TILE);
    }
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_PATH || tile === TILE_CAVE) {
    ctx.fillStyle = tile === TILE_CAVE ? "#4c3428" : "#b98b55";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = tile === TILE_CAVE ? "#1b1410" : "#8c673d";
    ctx.fillRect(sx + 2, sy + 3, 5, 2);
    ctx.fillRect(sx + 10, sy + 11, 4, 2);
    ctx.fillStyle = tile === TILE_CAVE ? "#0f0b08" : "#d0a86a";
    ctx.fillRect(sx, sy, TILE, 1);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_WATER) {
    ctx.fillStyle = "#1d75d8";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#45b7ff";
    ctx.fillRect(sx, sy, TILE, 4);
    ctx.fillStyle = "#b9f4ff";
    const offset = Math.floor(performance.now() / 180 + tx + ty) % 8;
    ctx.fillRect(sx + offset - 4, sy + 4, 8, 1);
    ctx.fillRect(sx + 9 - offset, sy + 11, 8, 1);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_TREE) {
    ctx.fillStyle = "#2c8933";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#115f25";
    ctx.fillRect(sx + 6, sy + 8, 4, 7);
    ctx.fillStyle = "#177a2c";
    ctx.fillRect(sx + 3, sy + 3, 10, 7);
    ctx.fillStyle = "#31c54a";
    ctx.fillRect(sx + 5, sy + 1, 7, 6);
    ctx.fillStyle = "#7bea73";
    ctx.fillRect(sx + 7, sy + 2, 2, 2);
    ctx.fillStyle = "#0d4119";
    ctx.fillRect(sx + 1, sy + 11, 14, 2);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_WALL) {
    ctx.fillStyle = "#8a8f98";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#3e4148";
    ctx.fillRect(sx, sy + 4, TILE, 1);
    ctx.fillRect(sx, sy + 11, TILE, 1);
    ctx.fillRect(sx + 7, sy, 1, TILE);
    ctx.fillStyle = "#c2c7ce";
    ctx.fillRect(sx + 1, sy + 1, 4, 1);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_ROOF) {
    ctx.fillStyle = "#a61f32";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#681119";
    for (let y = 2; y < TILE; y += 5) ctx.fillRect(sx, sy + y, TILE, 1);
    ctx.fillStyle = "#f07855";
    ctx.fillRect(sx + 2, sy + 2, 12, 2);
    ctx.fillStyle = "#f7b267";
    ctx.fillRect(sx + 4, sy + 7, 8, 1);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_FLOOR) {
    const floorTone = hashNoise(tx + 101, ty + 203);
    ctx.fillStyle = floorTone > 0.66 ? "#b4ad9b" : floorTone < 0.22 ? "#928b7a" : "#a69d8a";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#756f63";
    ctx.fillRect(sx, sy + 7, TILE, 1);
    ctx.fillRect(sx + 7, sy, 1, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(sx + 2, sy + 2, 4, 1);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    if (floorTone > 0.8) ctx.fillRect(sx + 10, sy + 11, 4, 1);
    if (floorTone < 0.12) ctx.fillRect(sx + 3, sy + 12, 2, 2);
    drawTerrainEdges(tile, sx, sy, tx, ty);
  }
}

function drawTerrainEdges(tile, sx, sy, tx, ty) {
  const n = {
    up: tileAt(tx, ty - 1),
    down: tileAt(tx, ty + 1),
    left: tileAt(tx - 1, ty),
    right: tileAt(tx + 1, ty),
  };
  const water = TILE_WATER;
  const hard = [TILE_WALL, TILE_ROOF, TILE_TREE];
  const paved = [TILE_PATH, TILE_FLOOR, TILE_CAVE];

  if (tile !== water) {
    ctx.fillStyle = "#2c6b48";
    if (n.up === water) ctx.fillRect(sx, sy, TILE, 2);
    if (n.down === water) ctx.fillRect(sx, sy + TILE - 2, TILE, 2);
    if (n.left === water) ctx.fillRect(sx, sy, 2, TILE);
    if (n.right === water) ctx.fillRect(sx + TILE - 2, sy, 2, TILE);
  }

  if (tile === water) {
    ctx.fillStyle = "#b8f4ff";
    if (n.up !== water) ctx.fillRect(sx, sy, TILE, 1);
    if (n.down !== water) ctx.fillRect(sx, sy + TILE - 1, TILE, 1);
    if (n.left !== water) ctx.fillRect(sx, sy, 1, TILE);
    if (n.right !== water) ctx.fillRect(sx + TILE - 1, sy, 1, TILE);
  }

  if (tile === TILE_GRASS || tile === TILE_FLOWER || tile === TILE_FIELD) {
    ctx.fillStyle = "rgba(57, 42, 24, 0.28)";
    if (paved.includes(n.up)) ctx.fillRect(sx, sy, TILE, 1);
    if (paved.includes(n.down)) ctx.fillRect(sx, sy + TILE - 1, TILE, 1);
    if (paved.includes(n.left)) ctx.fillRect(sx, sy, 1, TILE);
    if (paved.includes(n.right)) ctx.fillRect(sx + TILE - 1, sy, 1, TILE);
  }

  if (hard.includes(tile)) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.fillRect(sx + 1, sy + TILE - 2, TILE - 1, 2);
    ctx.fillRect(sx + TILE - 2, sy + 2, 2, TILE - 2);
  }
}

function drawNpcs(cam) {
  for (const npc of state.npcs) {
    const sx = Math.round(npc.x - cam.x);
    const sy = Math.round(npc.y - cam.y);
    if (sy > VIEW_H || sx < -16 || sx > W) continue;
    drawHumanSprite(sx, sy, npc.type === "smith" ? "#d14f2b" : npc.type === "healer" ? "#40c6ff" : "#efe35a", npc.dir, npc.type);
  }
}

function drawEntities(cam) {
  const drawables = [...state.monsters, player].sort((a, b) => a.y + a.h - (b.y + b.h));
  for (const actor of drawables) {
    if (actor === player) drawPlayer(Math.round(actor.x - cam.x), Math.round(actor.y - cam.y));
    else drawMonster(actor, Math.round(actor.x - cam.x), Math.round(actor.y - cam.y));
  }
}

function drawHumanSprite(sx, sy, body, dir, role = "elder") {
  drawActorShadow(sx + 1, sy + 12, 10);
  ctx.fillStyle = role === "elder" ? "#f5f5f5" : "#2b1a18";
  ctx.fillRect(sx + 2, sy - 1, 8, 3);
  ctx.fillStyle = "#ffd08a";
  ctx.fillRect(sx + 3, sy, 6, 5);
  ctx.fillStyle = body;
  ctx.fillRect(sx + 2, sy + 5, 8, 7);
  ctx.fillStyle = "#162033";
  ctx.fillRect(sx + 2, sy + 11, 3, 2);
  ctx.fillRect(sx + 7, sy + 11, 3, 2);
  if (role === "smith") {
    ctx.fillStyle = "#4a291d";
    ctx.fillRect(sx + 4, sy + 6, 4, 5);
    ctx.fillStyle = "#d7e2ea";
    ctx.fillRect(sx + 9, sy + 7, 3, 1);
  }
  if (role === "healer") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 5, sy + 6, 2, 5);
    ctx.fillRect(sx + 3, sy + 8, 6, 1);
  }
  if (role === "elder") {
    ctx.fillStyle = "#fff4b0";
    ctx.fillRect(sx + 3, sy + 6, 6, 2);
  }
  ctx.fillStyle = "#111018";
  if (dir === "left") ctx.fillRect(sx + 2, sy + 2, 2, 1);
  else if (dir === "right") ctx.fillRect(sx + 8, sy + 2, 2, 1);
  else ctx.fillRect(sx + 4, sy + 2, 1, 1);
}

function drawPlayer(sx, sy) {
  const blink = player.invuln > 0 && Math.floor(performance.now() / 80) % 2 === 0;
  if (blink) return;
  if (player.guard > 0) {
    ctx.strokeStyle = "#6de4ff";
    ctx.strokeRect(sx - 2, sy - 2, 15, 16);
    ctx.fillStyle = "rgba(109, 228, 255, 0.32)";
    ctx.fillRect(sx - 1, sy - 1, 13, 14);
  }
  drawActorShadow(sx, sy + 12, 12);
  const bob = Math.floor(player.step % 2);
  ctx.fillStyle = "#2b1a18";
  ctx.fillRect(sx + 2, sy - 1 + bob, 8, 3);
  ctx.fillStyle = "#ffd68e";
  ctx.fillRect(sx + 3, sy + bob, 6, 5);
  if (player.dir === "up") {
    ctx.fillStyle = "#3d231b";
    ctx.fillRect(sx + 3, sy + bob, 6, 5);
    ctx.fillStyle = "#2b1a18";
    ctx.fillRect(sx + 2, sy + 1 + bob, 8, 2);
  }
  ctx.fillStyle = player.armor >= 2 ? "#4b6c8f" : "#1956d2";
  ctx.fillRect(sx + 2, sy + 5 + bob, 8, 7);
  ctx.fillStyle = "#69d7ff";
  ctx.fillRect(sx + 2, sy + 5 + bob, 8, 1);
  ctx.fillStyle = player.armor >= 3 ? "#d7e2ea" : "#0f348f";
  ctx.fillRect(sx + 1, sy + 6 + bob, 2, 4);
  ctx.fillRect(sx + 9, sy + 6 + bob, 2, 4);
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(sx + 4, sy + 7 + bob, 4, 2);
  ctx.fillStyle = "#0e1624";
  ctx.fillRect(sx + 2, sy + 11 + bob, 3, 2);
  ctx.fillRect(sx + 7, sy + 11 + bob, 3, 2);
  ctx.fillStyle = "#1b1230";
  if (player.dir === "down") {
    ctx.fillRect(sx + 4, sy + 2 + bob, 1, 1);
    ctx.fillRect(sx + 7, sy + 2 + bob, 1, 1);
  } else if (player.dir === "left") {
    ctx.fillRect(sx + 3, sy + 2 + bob, 1, 1);
  } else if (player.dir === "right") {
    ctx.fillRect(sx + 8, sy + 2 + bob, 1, 1);
  }
  drawWeapon(sx, sy + bob);
}

function drawActorShadow(sx, sy, w) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(sx, sy, w, 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(sx + 2, sy - 1, Math.max(1, w - 4), 1);
}

function drawWeapon(sx, sy) {
  const colors = ["#a86132", "#c9783d", "#d7e2ea", "#b5f2ff", "#ffd166"];
  ctx.fillStyle = colors[player.weapon] || "#ffd166";
  if (player.dir === "up") ctx.fillRect(sx + 5, sy - 4, 2, 7);
  if (player.dir === "down") ctx.fillRect(sx + 5, sy + 10, 2, 7);
  if (player.dir === "left") ctx.fillRect(sx - 4, sy + 6, 7, 2);
  if (player.dir === "right") ctx.fillRect(sx + 8, sy + 6, 7, 2);
}

function drawMonster(monster, sx, sy) {
  if (sy > VIEW_H || sx < -30 || sx > W + 10) return;
  const mainColor = monster.hurt > 0 ? "#ffffff" : monster.color;
  drawActorShadow(sx + 1, sy + monster.h - 1, monster.w);
  if (monster.windup > 0) {
    ctx.strokeStyle = "#ffef8a";
    ctx.strokeRect(sx - 2, sy - 2, monster.w + 4, monster.h + 4);
  }
  if (monster.type === "dragon") {
    drawDragon(monster, sx, sy);
    return;
  }
  if (monster.type === "bat") {
    const flap = Math.floor(monster.age / 160) % 2;
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx - 1, sy + 4 + flap, 6, 4);
    ctx.fillRect(sx + 8, sy + 4 + flap, 6, 4);
    ctx.fillRect(sx + 1, sy + 7 + flap, 3, 2);
    ctx.fillRect(sx + 9, sy + 7 + flap, 3, 2);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 2, 6, 7);
    ctx.fillRect(sx + 3, sy, 2, 2);
    ctx.fillRect(sx + 9, sy, 2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 5, sy + 4, 1, 1);
    ctx.fillRect(sx + 8, sy + 4, 1, 1);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(sx + 6, sy + 8, 1, 2);
    ctx.fillRect(sx + 8, sy + 8, 1, 2);
  } else if (monster.type === "wisp") {
    ctx.fillStyle = "rgba(255, 219, 82, 0.36)";
    ctx.fillRect(sx + 1, sy + 3, 10, 9);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 5, 8, 7);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 1, 5, 9);
    ctx.fillStyle = "#ff9a3d";
    ctx.fillRect(sx + 5, sy, 3, 3);
    ctx.fillRect(sx + 7, sy + 7, 2, 4);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 5, sy + 4, 2, 2);
  } else if (monster.type === "boar") {
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 5, 11, 6);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 2, sy + 3, 9, 7);
    ctx.fillRect(sx + 9, sy + 5, 4, 4);
    ctx.fillStyle = "#f8d4a0";
    ctx.fillRect(sx + 3, sy + 2, 2, 2);
    ctx.fillRect(sx + 8, sy + 2, 2, 2);
    ctx.fillRect(sx + 12, sy + 6, 2, 1);
    ctx.fillRect(sx + 12, sy + 8, 2, 1);
    ctx.fillStyle = "#352013";
    ctx.fillRect(sx + 3, sy + 10, 2, 2);
    ctx.fillRect(sx + 8, sy + 10, 2, 2);
  } else if (monster.type === "guardian") {
    const pulse = Math.floor(monster.age / 180) % 2;
    ctx.fillStyle = "rgba(85, 199, 160, 0.28)";
    ctx.fillRect(sx - 2, sy + 2 - pulse, 22, 17);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 6, 14, 11);
    ctx.fillRect(sx - 1, sy + 9, 5, 5);
    ctx.fillRect(sx + 14, sy + 9, 5, 5);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 2, 12, 13);
    ctx.fillRect(sx + 1, sy + 7, 16, 7);
    ctx.fillStyle = "#d8fff1";
    ctx.fillRect(sx + 5, sy + 5, 2, 2);
    ctx.fillRect(sx + 11, sy + 5, 2, 2);
    ctx.fillStyle = "#1d5c4b";
    ctx.fillRect(sx + 4, sy + 15, 4, 3);
    ctx.fillRect(sx + 11, sy + 15, 4, 3);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(sx + 8, sy, 3, 4);
  } else if (monster.type === "dragonling") {
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 3, 12, 10);
    ctx.fillRect(sx - 1, sy + 6, 4, 5);
    ctx.fillRect(sx + 11, sy + 6, 4, 5);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 1, 8, 10);
    ctx.fillRect(sx + 9, sy + 4, 5, 4);
    ctx.fillStyle = "#ffcf5a";
    ctx.fillRect(sx + 6, sy + 5, 2, 2);
    ctx.fillStyle = "#ffd6a8";
    ctx.fillRect(sx + 2, sy, 2, 3);
    ctx.fillRect(sx + 10, sy, 2, 3);
    ctx.fillStyle = "#6b0d0b";
    ctx.fillRect(sx + 1, sy + 11, 3, 2);
    ctx.fillRect(sx + 9, sy + 11, 3, 2);
  } else {
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 7, 10, 4);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 2, sy + 3, 8, 8);
    ctx.fillRect(sx + 4, sy + 1, 4, 3);
    ctx.fillStyle = "#8dff8b";
    ctx.fillRect(sx + 4, sy + 3, 4, 1);
    ctx.fillStyle = "#eafff0";
    ctx.fillRect(sx + 4, sy + 5, 1, 1);
    ctx.fillRect(sx + 7, sy + 5, 1, 1);
  }
  drawMonsterHp(monster, sx, sy);
}

function drawDragon(monster, sx, sy) {
  const mainColor = monster.hurt > 0 ? "#ffffff" : monster.color;
  const pulse = Math.floor(monster.age / 140) % 2;
  ctx.fillStyle = monster.enraged ? "rgba(255, 42, 42, 0.38)" : "rgba(255, 88, 42, 0.25)";
  ctx.fillRect(sx - (monster.enraged ? 6 : 3), sy + 4 - pulse, monster.enraged ? 36 : 30, 18);
  ctx.fillStyle = monster.shadow;
  ctx.fillRect(sx - 5, sy + 6, 9, 10);
  ctx.fillRect(sx + 17, sy + 5, 9, 11);
  ctx.fillRect(sx + 1, sy + 7, 22, 13);
  ctx.fillStyle = mainColor;
  ctx.fillRect(sx - 4, sy + 8, 8, 6);
  ctx.fillRect(sx + 18, sy + 7, 8, 7);
  ctx.fillRect(sx + 5, sy + 4, 13, 14);
  ctx.fillRect(sx + 16, sy + 8, 8, 8);
  ctx.fillStyle = "#ff8c3e";
  ctx.fillRect(sx + 1, sy + 6, 7, 6);
  ctx.fillRect(sx + 10, sy, 3, 5);
  ctx.fillRect(sx + 16, sy, 3, 5);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(sx + 11, sy - 2, 2, 3);
  ctx.fillRect(sx + 17, sy - 2, 2, 3);
  ctx.fillRect(sx + 9, sy + 9, 2, 2);
  ctx.fillRect(sx + 13, sy + 12, 2, 2);
  ctx.fillStyle = "#fff2a6";
  ctx.fillRect(sx + 18, sy + 10, 2, 2);
  ctx.fillStyle = "#211010";
  ctx.fillRect(sx + 21, sy + 11, 2, 1);
  ctx.fillStyle = "#ff4e36";
  ctx.fillRect(sx + 24, sy + 10, 4 + pulse, 2);
  ctx.fillStyle = "#fff2a6";
  ctx.fillRect(sx + 26, sy + 10, 2, 1);
  drawMonsterHp(monster, sx, sy - 3);
}

function drawMonsterHp(monster, sx, sy) {
  if (monster.hp >= monster.hpMax && monster.hurt <= 0) return;
  const w = monster.boss ? 24 : 13;
  ctx.fillStyle = "#111";
  ctx.fillRect(sx, sy - 5, w, 3);
  ctx.fillStyle = monster.boss ? "#ff4949" : "#f8e44a";
  const fill = Math.floor((w - 2) * clamp(monster.hp / monster.hpMax, 0, 1));
  ctx.fillRect(sx + 1, sy - 4, fill, 1);
}

function drawEffects(cam) {
  if (state.pointerMove) {
    ctx.strokeStyle = "rgba(109, 228, 255, 0.9)";
    ctx.strokeRect(Math.round(state.pointerMove.x) - 4, Math.round(state.pointerMove.y) - 4, 8, 8);
    ctx.fillStyle = "rgba(109, 228, 255, 0.55)";
    ctx.fillRect(Math.round(state.pointerMove.x) - 1, Math.round(state.pointerMove.y) - 1, 2, 2);
  }

  for (const p of state.projectiles) {
    const sx = Math.round(p.x - cam.x);
    const sy = Math.round(p.y - cam.y);
    ctx.fillStyle = "rgba(255, 120, 58, 0.32)";
    ctx.fillRect(sx - p.r - 1, sy - p.r - 1, p.r * 2 + 2, p.r * 2 + 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(sx - p.r, sy - p.r, p.r * 2, p.r * 2);
    ctx.fillStyle = "#fff2a6";
    ctx.fillRect(sx - 1, sy - 1, 2, 2);
  }

  for (const r of state.rings) {
    const t = 1 - r.life / r.max;
    const radius = Math.max(2, Math.floor(r.radius * t));
    const x = Math.round(r.x - cam.x);
    const y = Math.round(r.y - cam.y);
    ctx.globalAlpha = clamp(r.life / r.max, 0, 1);
    ctx.strokeStyle = r.color;
    ctx.strokeRect(x - radius, y - Math.floor(radius * 0.55), radius * 2, Math.max(3, Math.floor(radius * 1.1)));
    ctx.globalAlpha = 1;
  }

  for (const s of state.slashes) {
    const alpha = clamp(s.life / s.max, 0, 1);
    const x = Math.round(s.x - cam.x);
    const y = Math.round(s.y - cam.y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    if (s.dir === "left" || s.dir === "right") {
      ctx.fillRect(x - 7, y - 1, 14, 2);
      ctx.fillRect(x - 3, y - 4, 7, 1);
      ctx.fillRect(x - 3, y + 3, 7, 1);
    } else {
      ctx.fillRect(x - 1, y - 7, 2, 14);
      ctx.fillRect(x - 4, y - 3, 1, 7);
      ctx.fillRect(x + 3, y - 3, 1, 7);
    }
    ctx.globalAlpha = 1;
  }

  for (const p of state.particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - cam.x), Math.round(p.y - cam.y), 2, 2);
  }

  ctx.font = "8px monospace";
  ctx.textAlign = "center";
  for (const f of state.floaters) {
    ctx.globalAlpha = clamp(f.life / f.max, 0, 1);
    ctx.fillStyle = "#000";
    ctx.fillText(f.text, Math.round(f.x - cam.x) + 1, Math.round(f.y - cam.y) + 1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, Math.round(f.x - cam.x), Math.round(f.y - cam.y));
    ctx.globalAlpha = 1;
  }
}

function drawScreenGrade(cam) {
  const tx = Math.floor((player.x + player.w / 2) / TILE);
  const ty = Math.floor((player.y + player.h / 2) / TILE);
  const inCave = tx >= 47 && tx <= 55 && ty >= 10 && ty <= 19;
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  gradient.addColorStop(0, inCave ? "rgba(35, 10, 8, 0.18)" : "rgba(255, 244, 192, 0.08)");
  gradient.addColorStop(0.52, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, VIEW_H);

  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, 0, 3, VIEW_H);
  ctx.fillRect(W - 3, 0, 3, VIEW_H);
  ctx.fillRect(0, 0, W, 2);
}

function objectiveText() {
  return textHelpers.objectiveText(textContext());
}

function guidanceText() {
  return textHelpers.guidanceText(textContext());
}

function nextUpgradeCost() {
  return textHelpers.nextUpgradeCost(textContext());
}

function gameStage() {
  return textHelpers.gameStage(textContext());
}

function stageName(stage) {
  return textHelpers.stageName(stage);
}

function contextPromptText() {
  return textHelpers.contextPromptText(textContext());
}

function npcRoleName(type) {
  return textHelpers.npcRoleName(type);
}

function drawObjective() {
  const text = objectiveText();
  const guide = guidanceText();
  ctx.font = "7px monospace";
  ctx.textAlign = "left";
  const w = Math.min(W - 10, Math.max(132, Math.max(text.length, guide.length) * 7 + 9));
  ctx.fillStyle = "rgba(5, 8, 18, 0.72)";
  ctx.fillRect(5, 5, w, 23);
  ctx.strokeStyle = "rgba(255, 209, 102, 0.74)";
  ctx.strokeRect(5, 5, w, 23);
  ctx.fillStyle = "#fff2a6";
  ctx.fillText(text, 9, 14);
  ctx.fillStyle = inTown(player.x, player.y) ? "#74ff8f" : player.hp / player.hpMax < 0.35 ? "#ff8a3d" : "#d7e2ea";
  ctx.fillText(guide, 9, 24);
}

function drawContextPrompt() {
  const text = contextPromptText();
  if (!text) return;
  ctx.font = "7px monospace";
  ctx.textAlign = "left";
  const w = Math.min(W - 10, Math.max(74, text.length * 7 + 12));
  const x = 5;
  const y = 31;
  ctx.fillStyle = "rgba(5, 8, 18, 0.68)";
  ctx.fillRect(x, y, w, 12);
  ctx.strokeStyle = "rgba(109, 228, 255, 0.72)";
  ctx.strokeRect(x, y, w, 12);
  ctx.fillStyle = "#d7e2ea";
  ctx.fillText(text, x + 5, y + 9);
}

function drawHud() {
  ctx.fillStyle = "#07111c";
  ctx.fillRect(0, VIEW_H, W, HUD_H);
  ctx.fillStyle = "#162a3a";
  ctx.fillRect(0, VIEW_H, W, 2);
  ctx.strokeStyle = "#6de4ff";
  ctx.strokeRect(1, VIEW_H + 1, W - 2, HUD_H - 2);

  ctx.font = "8px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`LV ${player.level}`, 5, VIEW_H + 10);
  ctx.fillText(`G ${player.gold}`, 5, VIEW_H + 22);

  drawBar(43, VIEW_H + 5, 68, 7, player.hp / player.hpMax, "#54d66f", "#ff5252");
  drawBar(43, VIEW_H + 18, 68, 5, player.xp / player.xpNext, "#6de4ff", "#1b367e");
  drawBar(43, VIEW_H + 26, 68, 4, player.stamina / player.staminaMax, "#ffd166", "#7d4d20");

  ctx.fillStyle = "#ffffff";
  ctx.fillText(`HP ${Math.ceil(player.hp)}/${player.hpMax}`, 116, VIEW_H + 10);
  ctx.fillText(`EXP ${player.xp}/${player.xpNext}`, 116, VIEW_H + 22);
  const status = player.burn > 0 ? "燃" : player.slow > 0 ? "鈍" : "";
  ctx.fillText(`ST ${Math.floor(player.stamina)}${status}`, 116, VIEW_H + 30);

  drawItemChip(183, VIEW_H + 5);
  drawMiniCompass(216, VIEW_H + 8);
}
function selectedItemCount() {
  return rewardHelpers.selectedItemCount(rewardContext());
}


function drawItemChip(x, y) {
  const labels = { potion: "薬", bomb: "爆", ward: "護" };
  ctx.fillStyle = "#0d1724";
  ctx.fillRect(x, y, 28, 19);
  ctx.strokeStyle = player.guard > 0 ? "#6de4ff" : "#ffd166";
  ctx.strokeRect(x, y, 28, 19);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(labels[player.selectedItem], x + 4, y + 8);
  ctx.fillStyle = "#fff2a6";
  ctx.fillText(String(selectedItemCount()), x + 17, y + 17);
  if (player.combo > 0) {
    ctx.fillStyle = "#6de4ff";
    ctx.fillText(`${player.combo}連`, x - 1, y + 28);
  }
}

function drawBar(x, y, w, h, t, good, bad) {
  ctx.fillStyle = "#111827";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#f4f4f4";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = t > 0.28 ? good : bad;
  ctx.fillRect(x + 1, y + 1, Math.max(0, Math.floor((w - 2) * clamp(t, 0, 1))), h - 2);
}

function drawMiniCompass(x, y) {
  ctx.fillStyle = "#0a1038";
  ctx.fillRect(x, y, 20, 18);
  ctx.strokeStyle = "#8dd7ff";
  ctx.strokeRect(x, y, 20, 18);
  ctx.fillStyle = "#ffffff";
  const p = { up: [10, 3], right: [15, 8], down: [10, 13], left: [5, 8] }[player.dir];
  ctx.fillRect(x + p[0] - 1, y + p[1] - 1, 3, 3);
}

function drawOverlay(title, small) {
  ctx.fillStyle = "rgba(0,0,0,0.64)";
  ctx.fillRect(0, 0, W, VIEW_H);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "16px monospace";
  ctx.fillText(title, W / 2, 65);
  ctx.font = "8px monospace";
  ctx.fillText(small === "R" ? "R" : "CLEAR", W / 2, 80);
}

function drawVictoryBanner() {
  ctx.fillStyle = "rgba(5, 8, 18, 0.82)";
  ctx.fillRect(24, 25, W - 48, 34);
  ctx.strokeStyle = "#ffd166";
  ctx.strokeRect(24, 25, W - 48, 34);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff2a6";
  ctx.font = "10px monospace";
  ctx.fillText("DRAGON SEALED", W / 2, 39);
  ctx.font = "7px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("村へ戻り長老に報告", W / 2, 52);
}

function command(name) {
  if (name === "talk") interact();
  if (name === "search") searchGround();
  if (name === "items") useSelectedItem();
  if (name === "stats") showStats();
  if (name === "save") saveGame();
}

function bindControls() {
  window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight"].includes(event.code)) {
      event.preventDefault();
    }
    state.keys.add(event.code);
    if (event.code === "Enter" || event.code === "Space") contextAction();
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") dash();
    if (event.code === "KeyH") useSelectedItem();
    if (event.code === "KeyQ") cycleItem(-1);
    if (event.code === "KeyE") cycleItem(1);
    if (event.code === "KeyR" && state.gameOver) resetGame();
  });

  window.addEventListener("keyup", (event) => {
    state.keys.delete(event.code);
  });

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => command(button.dataset.command));
  });

  document.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => selectItem(button.dataset.item));
  });

  document.querySelectorAll("[data-key], [data-keys]").forEach((button) => {
    const codes = (button.dataset.keys || button.dataset.key || "").split(/\s+/).filter(Boolean);
    const start = (event) => {
      event.preventDefault();
      button.classList.add("is-active");
      for (const code of codes) state.virtualKeys.add(code);
      if (codes.includes("Enter")) contextAction();
      if (codes.includes("ShiftLeft") || codes.includes("ShiftRight")) dash();
      if (codes.includes("KeyH")) useSelectedItem();
    };
    const end = () => {
      button.classList.remove("is-active");
      for (const code of codes) state.virtualKeys.delete(code);
    };
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", end);
    button.addEventListener("pointerleave", end);
    button.addEventListener("pointercancel", end);
  });

  const setPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    state.pointerMove = {
      x: clamp(((event.clientX - rect.left) / rect.width) * W, 0, W),
      y: clamp(((event.clientY - rect.top) / rect.height) * H, 0, VIEW_H - 2),
    };
  };
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    canvas.focus();
    canvas.setPointerCapture?.(event.pointerId);
    setPointerMove(event);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (state.pointerMove) setPointerMove(event);
  });
  const stopPointerMove = (event) => {
    try {
      canvas.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
    state.pointerMove = null;
  };
  canvas.addEventListener("pointerup", stopPointerMove);
  canvas.addEventListener("pointercancel", stopPointerMove);
  canvas.addEventListener("lostpointercapture", () => {
    state.pointerMove = null;
  });
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
}

function loop(now) {
  const dt = Math.min(40, now - state.last);
  state.last = now;

  if (!state.gameOver) {
    updatePlayer(dt);
    updateStoryEvents();
    updateRegionSpawns(dt);
    updateMonsters(dt);
    updateProjectiles(dt);
    trySpawnMonster(dt);
  }
  updateEffects(dt);
  updateUi();
  draw();
  requestAnimationFrame(loop);
}

function init() {
  createMap();
  bindControls();
  if (!loadGame()) {
    say("長老が竜の鱗を求めている", 2600);
  }
  for (let i = 0; i < 4; i += 1) {
    spawnMonster(i % 2 ? "bat" : "slime", (22 + i * 5) * TILE, (43 + (i % 2) * 6) * TILE);
  }
  requestAnimationFrame(loop);
}

init();
