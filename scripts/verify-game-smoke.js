"use strict";

const fs = require("fs");
const vm = require("vm");

const SCRIPT_ORDER = [
  "src/data/definitions.js",
  "src/data/maps/world.js",
  "src/core/math.js",
  "src/core/state.js",
  "src/core/context.js",
  "src/systems/combat.js",
  "src/systems/player.js",
  "src/systems/map.js",
  "src/systems/rewards.js",
  "src/systems/save.js",
  "src/systems/effects.js",
  "src/systems/text.js",
  "src/systems/spawn.js",
  "src/systems/npc.js",
  "src/systems/actions.js",
  "src/systems/projectiles.js",
  "src/systems/monsters.js",
  "src/systems/render.js",
  "src/systems/ui.js",
  "src/systems/controls.js",
  "src/data/audio.js",
  "src/game.js",
];

const MODULES_FOR_LOGIC = SCRIPT_ORDER.filter((script) => script !== "src/game.js");

function loadScripts(files) {
  for (const file of files) {
    vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertScriptOrder() {
  const html = fs.readFileSync("index.html", "utf8");
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);
  assert(JSON.stringify(scripts) === JSON.stringify(SCRIPT_ORDER), "index.html script order drifted");
}

function installBrowserStubs() {
  const noop = () => {};
  const ctxTarget = {};
  const ctx = new Proxy(ctxTarget, { get: (target, property) => target[property] || noop, set: (target, property, value) => { target[property] = value; return true; } });
  ctx.measureText = (text) => ({ width: String(text).length * 6 });
  ctx.createLinearGradient = () => ({ addColorStop: noop });
  const canvas = {
    width: 0,
    height: 0,
    tabIndex: 0,
    focus: noop,
    getContext: () => ctx,
    addEventListener: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 480, height: 352 }),
  };
  const makeElement = (tag = "div") => ({
    tagName: tag.toUpperCase(),
    textContent: "",
    classList: { add: noop, remove: noop, toggle: noop },
    style: {},
    children: [],
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    load: noop,
    play: () => Promise.resolve(),
    pause: noop,
    addEventListener: noop,
    removeEventListener: noop,
    setAttribute: noop,
  });
  const elements = new Map();

  globalThis.document = {
    getElementById: (id) => {
      if (id === "game") return canvas;
      if (!elements.has(id)) elements.set(id, { ...makeElement("div"), id });
      return elements.get(id);
    },
    querySelectorAll: () => [],
    createElement: makeElement,
    addEventListener: noop,
  };
  globalThis.window = { addEventListener: noop, removeEventListener: noop, AudioContext: undefined, webkitAudioContext: undefined };
  Object.defineProperty(globalThis, "navigator", {
    value: { maxTouchPoints: 0 },
    configurable: true,
  });
  globalThis.localStorage = {
    data: new Map(),
    getItem(key) {
      return this.data.get(key) || null;
    },
    setItem(key, value) {
      this.data.set(key, String(value));
    },
    removeItem(key) {
      this.data.delete(key);
    },
  };
  globalThis.performance = { now: () => 0 };
  globalThis.requestAnimationFrame = noop;
  globalThis.cancelAnimationFrame = noop;
  globalThis.Image = class {
    constructor() {
      this.complete = false;
      this.naturalWidth = 0;
    }
    set src(value) {
      this._src = value;
    }
    get src() {
      return this._src;
    }
  };
  globalThis.Audio = class {
    constructor() {
      this.volume = 1;
      this.loop = false;
      this.currentTime = 0;
    }
    play() {
      return Promise.resolve();
    }
    pause() {}
    addEventListener() {}
    removeEventListener() {}
    appendChild() {}
    load() {}
  };
}

function createRuntime() {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  const stateHelpers = globalThis.DRAGON_HUNTER_STATE;
  const contextHelpers = globalThis.DRAGON_HUNTER_CONTEXT;
  const map = globalThis.DRAGON_HUNTER_MAP;
  const combat = globalThis.DRAGON_HUNTER_COMBAT;
  const rewards = globalThis.DRAGON_HUNTER_REWARDS;
  const save = globalThis.DRAGON_HUNTER_SAVE;
  const spawn = globalThis.DRAGON_HUNTER_SPAWN;
  const npc = globalThis.DRAGON_HUNTER_NPC;
  const actions = globalThis.DRAGON_HUNTER_ACTIONS;
  const projectiles = globalThis.DRAGON_HUNTER_PROJECTILES;
  const monsters = globalThis.DRAGON_HUNTER_MONSTERS;
  const text = globalThis.DRAGON_HUNTER_TEXT;
  const ui = globalThis.DRAGON_HUNTER_UI;
  const playerHelpers = globalThis.DRAGON_HUNTER_PLAYER;

  const state = stateHelpers.createInitialState();
  const player = stateHelpers.createInitialPlayer();
  const runtime = {
    state,
    player,
    ui: {},
    canvas: {},
    ctx: {},
    rand: (min, max) => (min + max) / 2,
    irand: (min) => min,
    say: (message) => {
      state.message = message;
      state.messageUntil = 1;
    },
    addFloater: () => {},
    addSlash: () => {},
    addRing: () => {},
    burst: () => {},
    getCamera: () => ({ x: 0, y: 0 }),
    selectedItemCount: () => 0,
  };
  const contexts = contextHelpers.createContextFactory(runtime);

  Object.assign(runtime, {
    tileAt: (tx, ty) => map.tileAt(contexts.map(), tx, ty),
    setTile: (tx, ty, tile) => map.setTile(contexts.map(), tx, ty, tile),
    isBlockedTile: (tile, actor) => map.isBlockedTile(contexts.map(), tile, actor),
    inTownTile: (tx, ty) => map.inTownTile(contexts.map(), tx, ty),
    inTown: (x, y) => map.inTown(contexts.map(), x, y),
    tileInGate: (tx, ty) => map.tileInGate(contexts.map(), tx, ty),
    isPassableRect: (actor, x, y) => map.isPassableRect(contexts.map(), actor, x, y),
    moveActor: (actor, dx, dy) => playerHelpers.moveActor(contexts.player(), actor, dx, dy),
    facingVector: () => playerHelpers.facingVector(contexts.player()),
    updateHealCircle: () => playerHelpers.updateHealCircle(contexts.player()),
    playerAttack: () => combat.playerAttack(contexts.combat()),
    playerDefense: () => combat.playerDefense(contexts.combat()),
    playerMoveSpeed: () => combat.playerMoveSpeed(contexts.combat()),
    dashCost: () => combat.dashCost(contexts.combat()),
    regenRate: () => combat.regenRate(contexts.combat()),
    refreshDerivedStats: () => combat.refreshDerivedStats(contexts.combat()),
    weaponDamageMultiplier: (monster, pDot, mDot) => combat.weaponDamageMultiplier(contexts.combat(), monster, pDot, mDot),
    armorDamageMultiplier: (monster, pDot, source) => combat.armorDamageMultiplier(contexts.combat(), monster, pDot, source),
    grantMonsterDefeatDrops: (monster) => rewards.grantMonsterDefeatDrops(contexts.reward(), monster),
    grantChestReward: (reward) => rewards.grantChestReward(contexts.reward(), reward),
    grantDiscoveryReward: (discovery, x, y) => rewards.grantDiscoveryReward(contexts.reward(), discovery, x, y),
    gainFoundItem: (tile) => rewards.gainFoundItem(contexts.reward(), tile),
    spawnMonster: (type, x, y) => spawn.spawnMonster(contexts.spawn(), type, x, y),
    spawnIfClear: (type, x, y) => spawn.spawnIfClear(contexts.spawn(), type, x, y),
    currentRegion: () => spawn.currentRegion(contexts.spawn()),
    areaDangerText: (region) => spawn.areaDangerText(contexts.spawn(), region),
    guardianReady: () => spawn.guardianReady(contexts.spawn()),
    wardenReady: () => spawn.wardenReady(contexts.spawn()),
    updateStoryEvents: () => spawn.updateStoryEvents(contexts.spawn()),
    shootProjectile: (monster, target, angleOffset) => projectiles.shootProjectile(contexts.projectile(), monster, target, angleOffset),
    nearestNpc: () => npc.nearestNpc(contexts.npc()),
    handleNpc: (target) => npc.handleNpc(contexts.npc(), target),
    playerNearCave: () => npc.playerNearCave(contexts.npc()),
    handleCave: () => npc.handleCave(contexts.npc()),
    canChallengeDragon: () => npc.canChallengeDragon(contexts.npc()),
    nearestChest: () => actions.nearestChest(contexts.action()),
    nearestDiscovery: () => actions.nearestDiscovery(contexts.action()),
    objectiveText: () => text.objectiveText(contexts.text()),
    guidanceText: () => text.guidanceText(contexts.text()),
    contextPromptText: () => text.contextPromptText(contexts.text()),
    gameStage: () => text.gameStage(contexts.text()),
    stageName: (stage) => text.stageName(stage),
    saveGame: () => save.saveGame(contexts.save()),
    loadGame: () => save.loadGame(contexts.save()),
    useSelectedItem: () => rewards.useSelectedItem(contexts.reward()),
    openInventory: () => ui.openInventory(contexts.ui()),
    closeInventory: () => ui.closeInventory(contexts.ui()),
    moveInventory: (dx, dy) => ui.moveInventory(contexts.ui(), dx, dy),
    confirmInventory: () => ui.confirmInventory(contexts.ui()),
    sellInventorySelection: () => ui.sellInventorySelection(contexts.ui()),
    updateMonsters: (dt) => monsters.updateMonsters(contexts.monster(), dt),
  });

  map.createMap(contexts.map());
  return { definitions, state, player, runtime, contexts };
}

function assertMapReachability() {
  const { definitions: d, state, runtime } = createRuntime();
  const blocked = new Set([d.TILE_TREE, d.TILE_WALL, d.TILE_ROOF, d.TILE_WATER]);
  const passable = (x, y) => x >= 0 && y >= 0 && x < d.MAP_W && y < d.MAP_H && !blocked.has(runtime.tileAt(x, y));
  const queue = [[10, 48]];
  const seen = new Set(["10,48"]);
  for (let i = 0; i < queue.length; i += 1) {
    const [x, y] = queue[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (!seen.has(key) && passable(nx, ny)) {
        seen.add(key);
        queue.push([nx, ny]);
      }
    }
  }
  const goals = [
    ...d.TREASURE_CHESTS.map((chest) => [`chest:${chest.id}`, chest.x, chest.y]),
    ...d.DISCOVERY_POINTS.map((discovery) => [`discovery:${discovery.id}`, discovery.x, discovery.y]),
    ["guardian", d.GUARDIAN_SITE.x, d.GUARDIAN_SITE.y],
    ["warden", d.WARDEN_SITE.x, d.WARDEN_SITE.y],
    ["dragon-cave", 51, 18],
    ["east-expansion", 72, 57],
    ["north", 11, 13],
    ["far-east-road", 69, 18],
  ];
  const unreachable = goals.filter(([, x, y]) => !seen.has(`${x},${y}`));
  assert(unreachable.length === 0, `unreachable map goals: ${JSON.stringify(unreachable)}`);
  assert(state.npcs.length === 4, "expected 4 NPCs from WORLD_OBJECTS");
  assert(state.npcs.some((entry) => entry.type === "frontier"), "frontier supply NPC should load from WORLD_OBJECTS");
  return { reachableTiles: seen.size, npcs: state.npcs.map((entry) => entry.type) };
}

function assertSaveLoadAndEquipment() {
  const { definitions: d, state, player, runtime } = createRuntime();
  player.weapon = 3;
  player.armor = 3;
  player.ownedWeapons = [0, 1, 2, 3];
  player.ownedArmors = [0, 1, 2, 3];
  player.gold = 123;
  player.scales = 2;
  player.sealCrest = true;
  player.hunterCharm = true;
  player.regenCharm = true;
  player.trailCharm = true;
  player.aegisCharm = true;
  player.mineCharm = true;
  player.ownedAccessories = ["hunter", "regen", "trail", "aegis", "mine"];
  player.equippedAccessory = "trail";
  state.chests.add("town-cache");
  state.chests.add("north-ruin");
  state.chests.add("south-outpost");
  state.discoveries.add("river-spring");
  state.discoveries.add("hunter-cache");
  state.guardianDefeated = true;
  state.spawnedGuardian = true;
  state.wardenDefeated = true;
  state.spawnedWarden = true;
  state.bossDefeated = true;
  state.spawnedBoss = true;
  state.elderReported = true;
  runtime.saveGame();

  const restored = createRuntime();
  assert(restored.runtime.loadGame(), "loadGame should succeed");
  assert(restored.player.weapon === 3, "weapon rank should persist");
  assert(restored.player.armor === 3, "armor rank should persist");
  assert(restored.player.regenCharm, "regen charm should persist");
  assert(restored.player.trailCharm, "trail charm should persist");
  assert(restored.player.aegisCharm, "aegis charm should persist");
  assert(restored.player.mineCharm, "mine charm should persist");
  assert(JSON.stringify(restored.player.ownedWeapons) === JSON.stringify([0, 1, 2, 3]), "owned weapons should persist");
  assert(JSON.stringify(restored.player.ownedArmors) === JSON.stringify([0, 1, 2, 3]), "owned armors should persist");
  assert(restored.player.ownedAccessories.includes("trail") && restored.player.ownedAccessories.includes("mine"), "owned accessories should persist");
  assert(restored.player.equippedAccessory === "trail", "equipped accessory should persist");
  const baseline = createRuntime();
  baseline.player.armor = restored.player.armor;
  baseline.player.weapon = restored.player.weapon;
  baseline.runtime.refreshDerivedStats();
  assert(restored.runtime.dashCost() < baseline.runtime.dashCost(), "trail charm should reduce dash cost after load");
  assert(restored.runtime.playerMoveSpeed() > baseline.runtime.playerMoveSpeed(), "trail charm should improve movement speed after load");
  assert(restored.state.chests.size === 3, "opened chests should persist");
  assert(restored.state.discoveries.size === 2, "discoveries should persist");
  assert(restored.state.wardenDefeated, "warden defeat flag should persist");
  assert(restored.state.guardianDefeated && restored.state.bossDefeated && restored.state.elderReported, "boss/clear flags should persist");

  const rewardHelpers = globalThis.DRAGON_HUNTER_REWARDS;
  const weakerWeapon = rewardHelpers.grantWeaponAtLeast({ player: restored.player, say: () => {} }, 1, "upgrade");
  const weakerArmor = rewardHelpers.grantArmorAtLeast({ player: restored.player, say: () => {} }, 1, "upgrade");
  assert(!weakerWeapon && !weakerArmor, "weaker equipment should not downgrade current gear");
  restored.player.weapon = 4;
  const sidegradeWeapon = rewardHelpers.grantWeaponAtLeast({ player: restored.player, say: () => {} }, 5, "upgrade");
  assert(sidegradeWeapon && restored.player.ownedWeapons.includes(5), "sidegrade weapon should be added to inventory");
  assert(restored.player.weapon === 4, "lower-power sidegrade weapon should not auto-equip over stronger current weapon");

  globalThis.localStorage.setItem(d.SAVE_KEY, JSON.stringify({
    player: {
      hp: 12,
      hpMax: 46,
      level: 2,
      xp: 0,
      xpNext: 34,
      gold: 0,
      weapon: 1,
      armor: 1,
      regenCharm: true,
      trailCharm: true,
    },
  }));
  const migrated = createRuntime();
  assert(migrated.runtime.loadGame(), "old charm-flag save should migrate");
  assert(migrated.player.ownedAccessories.includes("regen"), "old regen flag should become owned accessory");
  assert(migrated.player.ownedAccessories.includes("trail"), "old trail flag should become owned accessory");
  assert(migrated.player.equippedAccessory === "trail", "old saves should equip trail by migration priority");
  return { saveKey: d.SAVE_KEY, weapon: restored.player.weapon, armor: restored.player.armor };
}

function assertInventoryManagement() {
  const { state, player, runtime } = createRuntime();
  player.ownedWeapons = [0, 1, 3];
  player.ownedArmors = [0, 2];
  player.ownedAccessories = ["regen", "trail", "mine"];
  player.regenCharm = true;
  player.trailCharm = true;
  player.mineCharm = true;
  player.equippedAccessory = "regen";
  player.weapon = 1;
  player.armor = 0;
  player.gold = 10;
  runtime.refreshDerivedStats();

  runtime.openInventory();
  assert(state.inventoryOpen, "inventory should open");
  state.inventoryTab = "weapons";
  state.inventoryIndex = 2;
  runtime.confirmInventory();
  assert(player.weapon === 3, "inventory should equip selected weapon");
  const goldBeforeSellEquipped = player.gold;
  runtime.sellInventorySelection();
  assert(player.ownedWeapons.includes(3) && player.gold === goldBeforeSellEquipped, "equipped weapon should not be sold");
  state.inventoryIndex = 1;
  runtime.sellInventorySelection();
  assert(!player.ownedWeapons.includes(1) && player.gold > goldBeforeSellEquipped, "unequipped weapon should sell for gold");

  state.inventoryTab = "accessories";
  state.inventoryIndex = player.ownedAccessories.indexOf("trail");
  runtime.confirmInventory();
  assert(player.equippedAccessory === "trail", "inventory should equip selected accessory");
  assert(runtime.dashCost() < 34, "equipped trail accessory should affect dash cost");
  state.inventoryIndex = player.ownedAccessories.indexOf("mine");
  runtime.confirmInventory();
  assert(player.equippedAccessory === "mine", "accessory slot should switch to mine charm");
  assert(runtime.dashCost() === 34, "unequipped trail accessory should stop affecting dash cost");

  runtime.closeInventory();
  assert(!state.inventoryOpen, "inventory should close");
  return { weapon: player.weapon, equippedAccessory: player.equippedAccessory, gold: player.gold };
}

function assertStoryClearFlow() {
  const { definitions: d, state, player, runtime } = createRuntime();

  player.level = d.WARDEN_REQUIREMENTS.level;
  player.trailCharm = true;
  player.hp = player.hpMax;
  player.x = d.WARDEN_SITE.x * d.TILE;
  player.y = d.WARDEN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedWarden, `Warden should spawn near southeast site after trail charm and level ${d.WARDEN_REQUIREMENTS.level}`);
  const warden = state.monsters.find((monster) => monster.type === "warden");
  assert(warden, "Warden monster should exist");
  warden.hp = 0;
  runtime.updateMonsters(16);
  assert(state.wardenDefeated, "Warden defeat should set wardenDefeated");
  assert(player.aegisCharm, "Warden defeat should grant aegis charm");
  assert(!state.guardianDefeated, "Warden defeat should not count as Guardian defeat");

  player.level = 3;
  player.scales = 2;
  player.hp = player.hpMax;
  player.x = d.GUARDIAN_SITE.x * d.TILE;
  player.y = d.GUARDIAN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedGuardian, "Guardian should spawn when requirements are met near Guardian site");
  const guardian = state.monsters.find((monster) => monster.midboss);
  assert(guardian, "Guardian monster should exist");
  guardian.hp = 0;
  runtime.updateMonsters(16);
  assert(state.guardianDefeated, "Guardian defeat should set guardianDefeated");
  assert(player.sealCrest, "Guardian defeat should grant seal crest");
  assert(player.scales >= 3, "Guardian defeat should help complete scale requirement");

  player.level = d.BOSS_REQUIREMENTS.level;
  player.scales = 3;
  player.x = 51 * d.TILE;
  player.y = 18 * d.TILE;
  assert(runtime.canChallengeDragon(), "Dragon challenge should be available after requirements");
  runtime.handleCave();
  assert(state.spawnedBoss, "Cave interaction should spawn dragon");
  const dragon = state.monsters.find((monster) => monster.boss);
  assert(dragon, "Dragon monster should exist");
  dragon.hp = 0;
  runtime.updateMonsters(16);
  assert(state.bossDefeated && state.victory, "Dragon defeat should set victory state");
  const elder = state.npcs.find((entry) => entry.type === "elder");
  runtime.handleNpc(elder);
  assert(state.elderReported, "Elder report should complete clear state");
  return { guardianDefeated: state.guardianDefeated, bossDefeated: state.bossDefeated, elderReported: state.elderReported };
}

function assertMineContent() {
  const { definitions: d, state, player, runtime } = createRuntime();
  assert(Boolean(d.monsterTypes.bubbler), "bubbler monster definition should exist");
  player.x = 39 * d.TILE;
  player.y = 67 * d.TILE;
  assert(runtime.currentRegion() === "mine", "southwest mine area should use mine region");
  const minePool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(
    globalThis.DRAGON_HUNTER_CONTEXT.createContextFactory(runtime).spawn(),
    "mine",
  );
  assert(minePool.includes("bubbler"), "mine spawn pool should include bubbler");
  runtime.spawnMonster("bubbler", player.x + d.TILE * 2, player.y);
  const bubbler = state.monsters.find((monster) => monster.type === "bubbler");
  assert(bubbler && bubbler.name === "泡吐き", "bubbler should spawn with readable name");
  return { region: runtime.currentRegion(), minePool, bubbler: bubbler.name };
}

function assertFrontierCamp() {
  const { definitions: d, state, player, runtime } = createRuntime();
  const centerPlayerOnTile = (tx, ty) => {
    player.x = (tx + 0.5) * d.TILE - player.w / 2;
    player.y = (ty + 0.5) * d.TILE - player.h / 2;
  };

  assert(runtime.inTownTile(31, 59), "frontier camp should be a safe-zone tile");
  assert(runtime.inTown(31 * d.TILE, 59 * d.TILE), "frontier camp should count as a safe base");
  assert(!runtime.inTownTile(39, 67), "southwest mine cache should remain outside the safe camp");

  const intruder = { x: 24 * d.TILE, y: 59 * d.TILE, w: 12 * d.WORLD_SCALE, h: 12 * d.WORLD_SCALE, isMonster: true };
  state.townGateOpen = false;
  assert(!runtime.isPassableRect(intruder, 25 * d.TILE, 59 * d.TILE), "closed safe camp should block monster entry");

  centerPlayerOnTile(31, 59);
  player.hp = 3;
  runtime.updateHealCircle();
  assert(player.hp === player.hpMax, "frontier camp heal circle should fully heal");

  const frontier = state.npcs.find((entry) => entry.type === "frontier");
  assert(frontier, "frontier supply NPC should exist");
  player.hp = player.hpMax;
  player.stamina = player.staminaMax;
  player.gold = 120;
  player.potions = 0;
  player.bombs = 0;
  player.wards = 0;
  player.level = 3;
  player.mineCharm = false;
  player.gold = 220;
  runtime.handleNpc(frontier);
  assert(player.mineCharm, "frontier supply NPC should sell mine charm before supplies");
  assert(player.gold === 40, "mine charm should cost 180G");
  const withCharm = runtime.armorDamageMultiplier({ type: "bubbler" }, 0.2, "contact");
  player.mineCharm = false;
  player.equippedAccessory = "";
  const withoutCharm = runtime.armorDamageMultiplier({ type: "bubbler" }, 0.2, "contact");
  assert(withCharm < withoutCharm, "mine charm should reduce bubbler contact damage");
  player.mineCharm = true;
  player.equippedAccessory = "mine";
  player.gold = d.weaponCosts[5];
  runtime.handleNpc(frontier);
  assert(player.ownedWeapons.includes(5), "frontier supply NPC should sell mine sidegrade weapon");
  assert(player.gold === 0, "mine sidegrade weapon should charge its listed cost");
  const basicDamage = runtime.weaponDamageMultiplier({ type: "bubbler" }, 0.1, 0.1);
  player.weapon = 5;
  const mineWeaponDamage = runtime.weaponDamageMultiplier({ type: "bubbler" }, 0.1, 0.1);
  assert(mineWeaponDamage > basicDamage, "mine sidegrade weapon should improve damage against bubblers");
  player.gold = d.armorCosts[5];
  runtime.handleNpc(frontier);
  assert(player.ownedArmors.includes(5), "frontier supply NPC should sell mine sidegrade armor");
  player.armor = 5;
  const mineArmorDamage = runtime.armorDamageMultiplier({ type: "bubbler" }, 0.2, "bubble");
  player.armor = 0;
  const noMineArmorDamage = runtime.armorDamageMultiplier({ type: "bubbler" }, 0.2, "bubble");
  assert(mineArmorDamage < noMineArmorDamage, "mine sidegrade armor should reduce bubble damage");
  player.level = 8;
  player.gold = d.weaponCosts[6] + d.armorCosts[6];
  runtime.handleNpc(frontier);
  runtime.handleNpc(frontier);
  assert(player.ownedWeapons.includes(6) && player.ownedArmors.includes(6), "frontier should sell fire-route sidegrades from level 8");
  player.level = 12;
  player.gold = d.weaponCosts[7] + d.armorCosts[7];
  runtime.handleNpc(frontier);
  runtime.handleNpc(frontier);
  assert(player.ownedWeapons.includes(7) && player.ownedArmors.includes(7), "frontier should sell dragon-route sidegrades from level 12");
  player.gold = 120;
  player.potions = 0;
  player.bombs = 0;
  player.wards = 0;
  runtime.handleNpc(frontier);
  assert(player.potions >= 2 && player.bombs >= 1 && player.wards >= 1, "frontier supply NPC should sell expedition supplies");
  assert(player.gold < 120, "frontier supply NPC should charge gold for supplies");
  return { safe: runtime.inTown(player.x, player.y), mineCharm: player.mineCharm, supplies: { potions: player.potions, bombs: player.bombs, wards: player.wards } };
}

function assertScriptLoadSmoke() {
  installBrowserStubs();
  loadScripts(SCRIPT_ORDER);
  assert(Boolean(globalThis.DRAGON_HUNTER_MAP), "map helpers should load");
  return {
    scripts: SCRIPT_ORDER.length,
    saveKey: globalThis.DRAGON_HUNTER_DEFINITIONS.SAVE_KEY,
    mapSize: [globalThis.DRAGON_HUNTER_WORLD_MAP.width, globalThis.DRAGON_HUNTER_WORLD_MAP.height],
  };
}

function main() {
  assertScriptOrder();
  installBrowserStubs();
  loadScripts(MODULES_FOR_LOGIC);
  const map = assertMapReachability();
  const save = assertSaveLoadAndEquipment();
  const inventory = assertInventoryManagement();
  const story = assertStoryClearFlow();
  const mine = assertMineContent();
  const camp = assertFrontierCamp();

  // Run full script-load smoke last in a fresh Node process context is not possible here,
  // but it is useful after the logic-only tests because it also loads src/game.js.
  const smokeScript = `
    const fs = require("fs");
    const vm = require("vm");
    (${installBrowserStubs.toString()})();
    for (const file of ${JSON.stringify(SCRIPT_ORDER)}) vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file });
    const key = globalThis.DRAGON_HUNTER_DEFINITIONS.SAVE_KEY;
    if (document.getElementById("continueButton").disabled !== true) throw new Error("Continue should be disabled without save data");
    localStorage.setItem(key, JSON.stringify({ player: { hp: 1 } }));
    startGame("new");
    if (localStorage.getItem(key) !== null) throw new Error("New Game should clear save data");
    console.log(JSON.stringify({ scripts: ${SCRIPT_ORDER.length}, saveKey: key, mapSize: [globalThis.DRAGON_HUNTER_WORLD_MAP.width, globalThis.DRAGON_HUNTER_WORLD_MAP.height], loaded: Boolean(globalThis.DRAGON_HUNTER_MAP), startMenu: true }));
  `;
  const child = require("child_process").spawnSync(process.execPath, ["-e", smokeScript], { encoding: "utf8" });
  assert(child.status === 0, child.stderr || child.stdout || "script load smoke failed");
  const scriptLoad = JSON.parse(child.stdout.trim());

  console.log(JSON.stringify({ ok: true, map, save, inventory, story, mine, camp, scriptLoad }, null, 2));
}

main();
