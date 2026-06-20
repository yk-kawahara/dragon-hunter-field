"use strict";

// DOM bindings -------------------------------------------------------------
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
  combo: document.getElementById("comboText"),
  scale: document.getElementById("scaleText"),
  zone: document.getElementById("zoneText"),
  items: Array.from(document.querySelectorAll("[data-quick-slot]")),
};

const startUi = {
  screen: document.getElementById("startScreen"),
  newGame: document.getElementById("newGameButton"),
  continueGame: document.getElementById("continueButton"),
  info: document.getElementById("continueInfo"),
};

// Loaded globals -----------------------------------------------------------
const gameDefinitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
if (!gameDefinitions) {
  throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before src/game.js");
}

const {
  W,
  H,
  VIEW_H,
  TILE,
  WORLD_SCALE,
  MAP_W,
  MAP_H,
  SAVE_KEY,
} = gameDefinitions;

canvas.width = W;
canvas.height = H;
ctx.imageSmoothingEnabled = false;

const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
if (!mathHelpers) {
  throw new Error("DRAGON_HUNTER_MATH must be loaded before src/game.js");
}

const {
  clamp,
  rectsOverlap,
  centerOf,
  normalize,
  facingDot,
  directionFromVector,
} = mathHelpers;

const contextHelpers = globalThis.DRAGON_HUNTER_CONTEXT;
if (!contextHelpers) {
  throw new Error("DRAGON_HUNTER_CONTEXT must be loaded before src/game.js");
}

const mapHelpers = globalThis.DRAGON_HUNTER_MAP;
if (!mapHelpers) {
  throw new Error("DRAGON_HUNTER_MAP must be loaded before src/game.js");
}

const rewardHelpers = globalThis.DRAGON_HUNTER_REWARDS;
if (!rewardHelpers) {
  throw new Error("DRAGON_HUNTER_REWARDS must be loaded before src/game.js");
}

const effectHelpers = globalThis.DRAGON_HUNTER_EFFECTS;
if (!effectHelpers) {
  throw new Error("DRAGON_HUNTER_EFFECTS must be loaded before src/game.js");
}

const textHelpers = globalThis.DRAGON_HUNTER_TEXT;
if (!textHelpers) {
  throw new Error("DRAGON_HUNTER_TEXT must be loaded before src/game.js");
}

const renderHelpers = globalThis.DRAGON_HUNTER_RENDER;
if (!renderHelpers) {
  throw new Error("DRAGON_HUNTER_RENDER must be loaded before src/game.js");
}

const spawnHelpers = globalThis.DRAGON_HUNTER_SPAWN;
if (!spawnHelpers) {
  throw new Error("DRAGON_HUNTER_SPAWN must be loaded before src/game.js");
}

function draw() {
  return renderHelpers.draw(contexts.render());
}

const combatHelpers = globalThis.DRAGON_HUNTER_COMBAT;
if (!combatHelpers) {
  throw new Error("DRAGON_HUNTER_COMBAT must be loaded before src/game.js");
}

const playerHelpers = globalThis.DRAGON_HUNTER_PLAYER;
if (!playerHelpers) {
  throw new Error("DRAGON_HUNTER_PLAYER must be loaded before src/game.js");
}

const projectileHelpers = globalThis.DRAGON_HUNTER_PROJECTILES;
if (!projectileHelpers) {
  throw new Error("DRAGON_HUNTER_PROJECTILES must be loaded before src/game.js");
}


const monsterHelpers = globalThis.DRAGON_HUNTER_MONSTERS;
if (!monsterHelpers) {
  throw new Error("DRAGON_HUNTER_MONSTERS must be loaded before src/game.js");
}

const npcHelpers = globalThis.DRAGON_HUNTER_NPC;
if (!npcHelpers) {
  throw new Error("DRAGON_HUNTER_NPC must be loaded before src/game.js");
}

const actionHelpers = globalThis.DRAGON_HUNTER_ACTIONS;
if (!actionHelpers) {
  throw new Error("DRAGON_HUNTER_ACTIONS must be loaded before src/game.js");
}

const saveHelpers = globalThis.DRAGON_HUNTER_SAVE;
if (!saveHelpers) {
  throw new Error("DRAGON_HUNTER_SAVE must be loaded before src/game.js");
}

function saveGame() {
  return saveHelpers.saveGame(contexts.save());
}

function loadGame() {
  return saveHelpers.loadGame(contexts.save());
}

function resetGame() {
  if (state.gameOver) {
    return respawnAtVillage();
  }
  if (state.clearPanelOpen) {
    return closeClearPanelAfterClear();
  }
  return fullResetGame();
}

function fullResetGame() {
  return saveHelpers.resetGame(contexts.save());
}

function respawnAtVillage() {
  const spawnTile = gameDefinitions.HEAL_CIRCLE || { x: 6, y: 48 };

  state.gameOver = false;
  state.monsters = [];
  state.projectiles = [];
  state.floaters = [];
  state.slashes = [];
  state.rings = [];
  state.particles = [];
  state.shake = 0;
  state.spawnTimer = 0;
  state.regionSpawnTimer = 0;
  state.pointerMove = null;
  state.inventoryOpen = false;
  state.shopOpen = false;
  state.clearPanelOpen = false;

  if (!state.guardianDefeated) state.spawnedGuardian = false;
  if (!state.wardenDefeated) state.spawnedWarden = false;
  if (!state.ashKnightDefeated) state.spawnedAshKnight = false;
  if (!state.smugglerCaptainDefeated) state.spawnedSmugglerCaptain = false;
  if (!state.regenSentinelDefeated) state.spawnedRegenSentinel = false;
  if (!state.mistKeeperDefeated) state.spawnedMistKeeper = false;
  if (!state.cryptWardenDefeated) state.spawnedCryptWarden = false;
  if (!state.frostGolemDefeated) state.spawnedFrostGolem = false;
  if (!state.towerWardenDefeated) state.spawnedTowerWarden = false;
  if (!state.frostDragonDefeated) state.spawnedFrostDragon = false;
  if (!state.eclipseDragonDefeated) state.spawnedEclipseDragon = false;
  if (!state.voidDragonDefeated) state.spawnedVoidDragon = false;
  if (!state.obsidianGolemDefeated) state.spawnedObsidianGolem = false;
  if (!state.bossDefeated) {
    state.spawnedBoss = false;
    state.victory = false;
  }

  state.keys?.clear?.();
  state.virtualKeys?.clear?.();

  player.x = Math.floor((spawnTile.x + 0.5) * TILE - player.w / 2);
  player.y = Math.floor((spawnTile.y + 0.5) * TILE - player.h / 2);
  player.hp = player.hpMax;
  player.stamina = player.staminaMax;
  player.invuln = 1200;
  player.slow = 0;
  player.burn = 0;
  player.guard = 0;
  player.combo = 0;
  player.comboTimer = 0;
  player.attackCooldown = 0;
  player.dashCooldown = 0;

  requestedBgmKey = undefined;
  canvas.focus();
  say("村で目を覚ました", 1800);
}

function closeClearPanelAfterClear() {
  state.clearPanelOpen = false;
  saveGame();

  state.keys?.clear?.();
  state.virtualKeys?.clear?.();
  state.pointerMove = null;
  state.inventoryOpen = false;
  state.shopOpen = false;

  canvas.focus();
  say("クリア状態を保存しました。旅を続けられます", 2200);
}

function refreshStartMenuState(infoText) {
  const hasSave = hasSaveData();
  startUi.continueGame.disabled = !hasSave;
  startUi.info.textContent = infoText || (hasSave ? "Enter: つづき / N: はじめから" : "保存データなし / N または はじめから");
}

const controlsHelpers = globalThis.DRAGON_HUNTER_CONTROLS;
if (!controlsHelpers) {
  throw new Error("DRAGON_HUNTER_CONTROLS must be loaded before src/game.js");
}

const uiHelpers = globalThis.DRAGON_HUNTER_UI;
if (!uiHelpers) {
  throw new Error("DRAGON_HUNTER_UI must be loaded before src/game.js");
}

const audioHelpers = globalThis.DRAGON_HUNTER_AUDIO;
if (!audioHelpers) {
  console.warn("DRAGON_HUNTER_AUDIO is not loaded. BGM/SE will be disabled.");
}

const audio = audioHelpers
  ? audioHelpers.createAudioManager({
      masterVolume: 0.9,
      bgmVolume: 0.38,
      seVolume: 0.58,
      bgm: {
        field: {
          src: ["assets/audio/field.ogg", "assets/audio/field.mp3"],
          loop: true,
          volume: 1,
        },
        boss: {
          src: ["assets/audio/boss.ogg", "assets/audio/boss.mp3"],
          loop: true,
          volume: 1,
        },
      },
    })
  : {
      preloadBgm: () => false,
      playBgm: () => Promise.resolve(false),
      pauseBgm: () => false,
      stopBgm: () => false,
      playSe: () => false,
      unlock: () => Promise.resolve(false),
      bindUnlockEvents: () => {},
      setMuted: () => {},
      status: () => ({ currentBgmKey: null }),
    };

globalThis.dragonHunterAudio = audio;

// Runtime state ------------------------------------------------------------
const stateHelpers = globalThis.DRAGON_HUNTER_STATE;
if (!stateHelpers) {
  throw new Error("DRAGON_HUNTER_STATE must be loaded before src/game.js");
}

const state = stateHelpers.createInitialState();
const player = stateHelpers.createInitialPlayer();
let gameStarted = false;

// Context factory ----------------------------------------------------------
const contexts = contextHelpers.createContextFactory({
  canvas,
  ctx,
  ui,
  state,
  player,
  rand,
  irand,
  getCamera,
  tileAt,
  setTile,
  isBlockedTile,
  inTownTile,
  tileInGate,
  isPassableRect,
  inTown,
  currentRegion,
  areaDangerText,
  canChallengeDragon,
  guardianReady,
  nearestNpc,
  nearestPortal,
  nearestChest,
  nearestDiscovery,
  playerNearCave,
  spawnMonster,
  spawnIfClear,
  shootProjectile,
  distanceFromVillage,
  playerAttack,
  playerDefense,
  playerMoveSpeed,
  dashCost,
  weaponDamageMultiplier,
  armorDamageMultiplier,
  shieldRuneCounterDamage,
  regenRate,
  refreshDerivedStats,
  say,
  addFloater,
  addSlash,
  addRing,
  burst,
  facingVector,
  moveActor,
  handleNpc,
  handleCave,
  grantMonsterDefeatDrops,
  grantChestReward,
  grantDiscoveryReward,
  gainFoundItem,
  contextAction,
  dash,
  useSelectedItem,
  useQuickItem,
  cycleItem,
  resetGame,
  interact,
  searchGround,
  showStats,
  toggleInventory,
  closeInventory,
  moveInventory,
  confirmInventory,
  sellInventorySelection,
  assignInventoryQuickSlot,
  closeShop,
  moveShop,
  confirmShop,
  saveGame,
  selectItem,
  gameStage,
  stageName,
  objectiveText,
  guidanceText,
  contextPromptText,
  selectedItemCount,
});

// Local utilities ----------------------------------------------------------
function rand(min = 0, max = 1) {
  return min + Math.random() * (max - min);
}

function irand(min, max) {
  return Math.floor(rand(min, max + 1));
}

// Map facade ---------------------------------------------------------------
function tileAt(tx, ty) {
  return mapHelpers.tileAt(contexts.map(), tx, ty);
}

function setTile(tx, ty, tile) {
  return mapHelpers.setTile(contexts.map(), tx, ty, tile);
}

function isBlockedTile(tile, actor) {
  return mapHelpers.isBlockedTile(contexts.map(), tile, actor);
}

function inTownTile(tx, ty) {
  return mapHelpers.inTownTile(contexts.map(), tx, ty);
}

function tileInGate(tx, ty) {
  return mapHelpers.tileInGate(contexts.map(), tx, ty);
}

function isPassableRect(actor, x = actor.x, y = actor.y) {
  return mapHelpers.isPassableRect(contexts.map(), actor, x, y);
}

function createMap() {
  return mapHelpers.createMap(contexts.map());
}

// Spawn facade -------------------------------------------------------------
function spawnMonster(typeName, x, y) {
  return spawnHelpers.spawnMonster(contexts.spawn(), typeName, x, y);
}

function spawnIfClear(typeName, x, y) {
  return spawnHelpers.spawnIfClear(contexts.spawn(), typeName, x, y);
}

function monsterChoice() {
  return spawnHelpers.monsterChoice(contexts.spawn());
}

function currentRegion() {
  return spawnHelpers.currentRegion(contexts.spawn());
}

function distanceFromVillage() {
  return spawnHelpers.distanceFromVillage(contexts.spawn());
}

function monsterPoolForRegion(region) {
  return spawnHelpers.monsterPoolForRegion(contexts.spawn(), region);
}

function trySpawnMonster(dt) {
  return spawnHelpers.trySpawnMonster(contexts.spawn(), dt);
}

function updateRegionSpawns(dt) {
  return spawnHelpers.updateRegionSpawns(contexts.spawn(), dt);
}

function pruneDistantMonsters(maxDistance = 520 * WORLD_SCALE) {
  return spawnHelpers.pruneDistantMonsters(contexts.spawn(), maxDistance);
}

function countNearbyMonsters(radius) {
  return spawnHelpers.countNearbyMonsters(contexts.spawn(), radius);
}

function spawnNearPlayer(region, minRadius, maxRadius) {
  return spawnHelpers.spawnNearPlayer(contexts.spawn(), region, minRadius, maxRadius);
}

function areaDangerText(region) {
  return spawnHelpers.areaDangerText(region);
}

function guardianReady() {
  return spawnHelpers.guardianReady(contexts.spawn());
}

function playerNearGuardianSite() {
  return spawnHelpers.playerNearGuardianSite(contexts.spawn());
}

function updateStoryEvents() {
  return spawnHelpers.updateStoryEvents(contexts.spawn());
}

function inTown(x, y) {
  return mapHelpers.inTown(contexts.map(), x, y);
}

// Combat stat facade -------------------------------------------------------
function playerAttack() {
  return combatHelpers.playerAttack(contexts.combat());
}

function playerDefense() {
  return combatHelpers.playerDefense(contexts.combat());
}

function playerMoveSpeed() {
  return combatHelpers.playerMoveSpeed(contexts.combat());
}

function dashCost() {
  return combatHelpers.dashCost(contexts.combat());
}

function weaponDamageMultiplier(monster, pDot, mDot) {
  return combatHelpers.weaponDamageMultiplier(contexts.combat(), monster, pDot, mDot);
}

function armorDamageMultiplier(monster, pDot, source = "contact") {
  return combatHelpers.armorDamageMultiplier(contexts.combat(), monster, pDot, source);
}

function shieldRuneCounterDamage(pDot) {
  return combatHelpers.shieldRuneCounterDamage(contexts.combat(), pDot);
}

function refreshDerivedStats() {
  return combatHelpers.refreshDerivedStats(contexts.combat());
}

function regenRate() {
  return combatHelpers.regenRate(contexts.combat());
}

// Reward facade ------------------------------------------------------------
function grantWeaponAtLeast(rank, upgradedMessage, keptMessage = "既により良い剣を持っている") {
  return rewardHelpers.grantWeaponAtLeast(contexts.reward(), rank, upgradedMessage, keptMessage);
}

function grantArmorAtLeast(rank, upgradedMessage, keptMessage = "既により良い鎧を持っている") {
  return rewardHelpers.grantArmorAtLeast(contexts.reward(), rank, upgradedMessage, keptMessage);
}

function grantMonsterDefeatDrops(monster) {
  return rewardHelpers.grantMonsterDefeatDrops(contexts.reward(), monster);
}

// Monster facade -----------------------------------------------------------
function levelUp() {
  player.strength = Number.isFinite(player.strength) ? player.strength : 7 + player.level * 2;
  player.resilience = Number.isFinite(player.resilience) ? player.resilience : 1 + player.level;
  while (player.xp >= player.xpNext) {
    player.xp -= player.xpNext;
    player.level += 1;
    player.xpNext = Math.floor(player.xpNext * 1.45 + 18);
    player.hpMax += 12;
    player.strength += 2;
    player.resilience += 1;
    player.hp = player.hpMax;
    burst(player.x + 5 * WORLD_SCALE, player.y + 4 * WORLD_SCALE, "#fff36b", 18);
    say(`LEVEL UP! LV ${player.level}`);
  }
}


// Message and camera -------------------------------------------------------
function say(text, duration = 1800) {
  state.message = text;
  state.messageUntil = performance.now() + duration;
  ui.toast.textContent = text;
  ui.toast.classList.add("show");
}

function getCamera() {
  const x = clamp(player.x + player.w / 2 - W / 2, 0, MAP_W * TILE - W);
  const y = clamp(player.y + player.h / 2 - VIEW_H / 2, 0, MAP_H * TILE - VIEW_H);
  const shakeX = state.shake > 0 ? irand(-WORLD_SCALE, WORLD_SCALE) : 0;
  const shakeY = state.shake > 0 ? irand(-WORLD_SCALE, WORLD_SCALE) : 0;
  return { x: Math.floor(x + shakeX), y: Math.floor(y + shakeY) };
}

// Player facade ------------------------------------------------------------
function moveActor(actor, dx, dy) {
  return playerHelpers.moveActor(contexts.player(), actor, dx, dy);
}

function hasKey(code) {
  return playerHelpers.hasKey(contexts.player(), code);
}

function pointerMoveVector() {
  return playerHelpers.pointerMoveVector(contexts.player());
}

function inputMoveVector() {
  return playerHelpers.inputMoveVector(contexts.player());
}

function facingVector() {
  return playerHelpers.facingVector(contexts.player());
}

function updatePlayer(dt) {
  return playerHelpers.updatePlayer(contexts.player(), dt);
}

function playerNearTownGate() {
  return playerHelpers.playerNearTownGate(contexts.player());
}

function updateTownGate(dt) {
  return playerHelpers.updateTownGate(contexts.player(), dt);
}

function updateHealCircle() {
  return playerHelpers.updateHealCircle(contexts.player());
}

function updateDiscoverySprings() {
  return playerHelpers.updateDiscoverySprings(contexts.player());
}

function updateMonsters(dt) {
  return monsterHelpers.updateMonsters(contexts.monster(), dt);
}

// Projectile facade --------------------------------------------------------
function shootProjectile(monster, target, angleOffset = 0) {
  return projectileHelpers.shootProjectile(contexts.projectile(), monster, target, angleOffset);
}

function updateProjectiles(dt) {
  return projectileHelpers.updateProjectiles(contexts.projectile(), dt);
}

function blocksProjectileTownEntry(prevX, prevY, nextX, nextY) {
  return projectileHelpers.blocksProjectileTownEntry(contexts.projectile(), prevX, prevY, nextX, nextY);
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
  const runeCounter = shieldRuneCounterDamage(pDot);
  if (runeCounter > 0) {
    monster.hp -= runeCounter;
    addFloater(monster.x + monster.w / 2, monster.y - 7, `反${runeCounter}`, "#8dd7ff");
  }
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
      say("倒れた... Rで村から再開", 5000);
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

// Effect facade ------------------------------------------------------------
function addFloater(x, y, text, color) {
  return effectHelpers.addFloater(contexts.effect(), x, y, text, color);
}

function addSlash(x, y, dir, color) {
  return effectHelpers.addSlash(contexts.effect(), x, y, dir, color);
}

function addRing(x, y, color, radius = 32) {
  return effectHelpers.addRing(contexts.effect(), x, y, color, radius);
}

function burst(x, y, color, count) {
  return effectHelpers.burst(contexts.effect(), x, y, color, count);
}

function updateEffects(dt) {
  return effectHelpers.updateEffects(contexts.effect(), dt);
}

// Action facade ------------------------------------------------------------
function contextAction() {
  return actionHelpers.contextAction(contexts.action());
}
function playerNearCave() {
  return npcHelpers.playerNearCave(contexts.npc());
}

function nearestAttackTarget() {
  return actionHelpers.nearestAttackTarget(contexts.action());
}
function performAttack() {
  return actionHelpers.performAttack(contexts.action());
}
function hitMonster(monster, power = 1, color = "#ffffff") {
  return actionHelpers.hitMonster(contexts.action(), monster, power, color);
}
function dash() {
  return playerHelpers.dash(contexts.player());
}

function interact() {
  return actionHelpers.interact(contexts.action());
}
function nearestChest() {
  return actionHelpers.nearestChest(contexts.action());
}

function nearestPortal() {
  return actionHelpers.nearestPortal(contexts.action());
}
function openChest(chest) {
  return actionHelpers.openChest(contexts.action(), chest);
}
function grantChestReward(reward) {
  return rewardHelpers.grantChestReward(contexts.reward(), reward);
}

function nearestNpc() {
  return npcHelpers.nearestNpc(contexts.npc());
}

function handleNpc(npc) {
  return npcHelpers.handleNpc(contexts.npc(), npc);
}

function handleCave() {
  return npcHelpers.handleCave(contexts.npc());
}

function canChallengeDragon() {
  return npcHelpers.canChallengeDragon(contexts.npc());
}

function bossMissingRequirements() {
  return npcHelpers.bossMissingRequirements(contexts.npc());
}

function searchGround() {
  return actionHelpers.searchGround(contexts.action());
}
function nearestDiscovery() {
  return actionHelpers.nearestDiscovery(contexts.action());
}
function revealDiscovery(discovery) {
  return actionHelpers.revealDiscovery(contexts.action(), discovery);
}
function grantDiscoveryReward(discovery, x, y) {
  return rewardHelpers.grantDiscoveryReward(contexts.reward(), discovery, x, y);
}

function gainFoundItem(tile) {
  return rewardHelpers.gainFoundItem(contexts.reward(), tile);
}
// Item facade --------------------------------------------------------------
function useSelectedItem() {
  return rewardHelpers.useSelectedItem(contexts.reward());
}

function useQuickItem(slot) {
  return rewardHelpers.useQuickItem(contexts.reward(), slot);
}

function usePotion() {
  return rewardHelpers.usePotion(contexts.reward());
}

function useBomb() {
  return rewardHelpers.useBomb(contexts.reward());
}

function useWard() {
  return rewardHelpers.useWard(contexts.reward());
}

function selectItem(item) {
  return rewardHelpers.selectItem(contexts.reward(), item);
}

function cycleItem(step) {
  return rewardHelpers.cycleItem(contexts.reward(), step);
}


// UI facade ----------------------------------------------------------------
function showStats() {
  return uiHelpers.showStats(contexts.ui());
}

function toggleInventory() {
  return uiHelpers.toggleInventory(contexts.ui());
}

function closeInventory() {
  return uiHelpers.closeInventory(contexts.ui());
}

function moveInventory(dx, dy) {
  return uiHelpers.moveInventory(contexts.ui(), dx, dy);
}

function confirmInventory() {
  return uiHelpers.confirmInventory(contexts.ui());
}

function sellInventorySelection() {
  return uiHelpers.sellInventorySelection(contexts.ui());
}

function assignInventoryQuickSlot(slot) {
  return uiHelpers.assignInventoryQuickSlot(contexts.ui(), slot);
}

function closeShop() {
  return uiHelpers.closeShop(contexts.ui());
}

function moveShop(dy) {
  return uiHelpers.moveShop(contexts.ui(), dy);
}

function confirmShop() {
  return uiHelpers.confirmShop(contexts.ui());
}

function statsPanelPages() {
  return uiHelpers.statsPanelPages(contexts.ui());
}

function nextUpgradeText() {
  return uiHelpers.nextUpgradeText(contexts.ui());
}

function updateZone() {
  return uiHelpers.updateZone(contexts.ui());
}

function updateUi() {
  return uiHelpers.updateUi(contexts.ui());
}

// Text facade --------------------------------------------------------------
function objectiveText() {
  return textHelpers.objectiveText(contexts.text());
}

function guidanceText() {
  return textHelpers.guidanceText(contexts.text());
}

function nextUpgradeCost() {
  return textHelpers.nextUpgradeCost(contexts.text());
}

function gameStage() {
  return textHelpers.gameStage(contexts.text());
}

function stageName(stage) {
  return textHelpers.stageName(stage);
}

function contextPromptText() {
  return textHelpers.contextPromptText(contexts.text());
}

function npcRoleName(type) {
  return textHelpers.npcRoleName(type);
}

function selectedItemCount() {
  return rewardHelpers.selectedItemCount(contexts.reward());
}


// Controls facade ----------------------------------------------------------
function command(name) {
  return controlsHelpers.command(contexts.controls(), name);
}

function bindControls() {
  return controlsHelpers.bindControls(contexts.controls());
}

// Audio facade -------------------------------------------------------------
let requestedBgmKey;

function bindAudio() {
  audio.preloadBgm("field");
  audio.preloadBgm("boss");
  audio.bindUnlockEvents(window, { bgmKey: "field", fadeMs: 700 });
}

function desiredBgmKey() {
  if (state.gameOver) return null;
  if (state.monsters.some((monster) => monster.hp > 0 && monster.boss)) return "boss";
  return "field";
}

function syncBgmToState() {
  const key = desiredBgmKey();
  if (key === requestedBgmKey) return;
  requestedBgmKey = key;
  if (!key) {
    audio.pauseBgm({ fadeMs: 450 });
    return;
  }
  audio.playBgm(key, { fadeMs: 700 });
}

// Start menu ---------------------------------------------------------------
function hasSaveData() {
  try {
    return Boolean(localStorage.getItem(SAVE_KEY));
  } catch {
    return false;
  }
}

function setupStartMenu() {
  refreshStartMenuState();
  startUi.newGame.addEventListener("click", () => startGame("new"));
  startUi.continueGame.addEventListener("click", () => startGame("continue"));
  window.addEventListener("keydown", handleStartMenuKey);
  startUi.screen.classList.remove("is-hidden");
}

function handleStartMenuKey(event) {
  if (gameStarted) return;
  if (event.code === "KeyN") {
    event.preventDefault();
    startGame("new");
  } else if (event.code === "Enter" || event.code === "Space") {
    event.preventDefault();
    startGame(hasSaveData() ? "continue" : "new");
  } else if (event.code === "KeyC" && hasSaveData()) {
    event.preventDefault();
    startGame("continue");
  }
}

function startGame(mode) {
  if (gameStarted) return;
  gameStarted = true;
  window.removeEventListener("keydown", handleStartMenuKey);
  startUi.screen.classList.add("is-hidden");
  bindControls();

  if (mode === "continue" && loadGame()) {
    say("つづきから再開", 1200);
  } else {
    fullResetGame();
    say("はじめから開始", 1600);
  }

  seedOpeningMonsters();
  state.last = performance.now();
  canvas.focus();
  requestAnimationFrame(loop);
}

function seedOpeningMonsters() {
  for (let i = 0; i < 4; i += 1) {
    spawnMonster(i % 2 ? "bat" : "slime", (22 + i * 5) * TILE, (43 + (i % 2) * 6) * TILE);
  }
}

// Main loop ----------------------------------------------------------------
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
  syncBgmToState();
  updateUi();
  draw();
  requestAnimationFrame(loop);
}

// Boot ---------------------------------------------------------------------
function init() {
  createMap();
  bindAudio();
  updateUi();
  draw();
  setupStartMenu();
}

init();
