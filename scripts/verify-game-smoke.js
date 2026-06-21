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
  assert((html.match(/data-quick-slot=/g) || []).length === 3, "field UI should expose three configurable quick slots");
  assert(!/data-item=/.test(html), "field UI should not hard-code a fixed subset of item types");
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
    distanceFromVillage: () => 0,
    tileInGate: (tx, ty) => map.tileInGate(contexts.map(), tx, ty),
    isPassableRect: (actor, x, y) => map.isPassableRect(contexts.map(), actor, x, y),
    moveActor: (actor, dx, dy) => playerHelpers.moveActor(contexts.player(), actor, dx, dy),
    facingVector: () => playerHelpers.facingVector(contexts.player()),
    updateHealCircle: () => playerHelpers.updateHealCircle(contexts.player()),
    dash: () => playerHelpers.dash(contexts.player()),
    playerAttack: () => combat.playerAttack(contexts.combat()),
    playerDefense: () => combat.playerDefense(contexts.combat()),
    playerMoveSpeed: () => combat.playerMoveSpeed(contexts.combat()),
    dashCost: () => combat.dashCost(contexts.combat()),
    regenRate: () => combat.regenRate(contexts.combat()),
    refreshDerivedStats: () => combat.refreshDerivedStats(contexts.combat()),
    weaponDamageMultiplier: (monster, pDot, mDot) => combat.weaponDamageMultiplier(contexts.combat(), monster, pDot, mDot),
    armorDamageMultiplier: (monster, pDot, source) => combat.armorDamageMultiplier(contexts.combat(), monster, pDot, source),
    shieldRuneCounterDamage: (pDot) => combat.shieldRuneCounterDamage(contexts.combat(), pDot),
    grantMonsterDefeatDrops: (monster) => rewards.grantMonsterDefeatDrops(contexts.reward(), monster),
    grantChestReward: (reward) => rewards.grantChestReward(contexts.reward(), reward),
    grantDiscoveryReward: (discovery, x, y) => rewards.grantDiscoveryReward(contexts.reward(), discovery, x, y),
    gainFoundItem: (tile) => rewards.gainFoundItem(contexts.reward(), tile),
    spawnMonster: (type, x, y) => spawn.spawnMonster(contexts.spawn(), type, x, y),
    spawnIfClear: (type, x, y) => spawn.spawnIfClear(contexts.spawn(), type, x, y),
    currentRegion: () => spawn.currentRegion(contexts.spawn()),
    updateRegionSpawns: (dt) => spawn.updateRegionSpawns(contexts.spawn(), dt),
    countRegionMonsters: (region) => spawn.countRegionMonsters(contexts.spawn(), region),
    areaDangerText: (region) => spawn.areaDangerText(contexts.spawn(), region),
    guardianReady: () => spawn.guardianReady(contexts.spawn()),
    wardenReady: () => spawn.wardenReady(contexts.spawn()),
    updateStoryEvents: () => spawn.updateStoryEvents(contexts.spawn()),
    shootProjectile: (monster, target, angleOffset, options) => projectiles.shootProjectile(contexts.projectile(), monster, target, angleOffset, options),
    nearestNpc: () => npc.nearestNpc(contexts.npc()),
    handleNpc: (target) => npc.handleNpc(contexts.npc(), target),
    playerNearCave: () => npc.playerNearCave(contexts.npc()),
    handleCave: () => npc.handleCave(contexts.npc()),
    canChallengeDragon: () => npc.canChallengeDragon(contexts.npc()),
    nearestChest: () => actions.nearestChest(contexts.action()),
    nearestPortal: () => actions.nearestPortal(contexts.action()),
    traversePortal: (portal) => actions.traversePortal(contexts.action(), portal),
    openChest: (chest) => actions.openChest(contexts.action(), chest),
    nearestDiscovery: () => actions.nearestDiscovery(contexts.action()),
    searchGround: () => actions.searchGround(contexts.action()),
    objectiveText: () => text.objectiveText(contexts.text()),
    guidanceText: () => text.guidanceText(contexts.text()),
    contextPromptText: () => text.contextPromptText(contexts.text()),
    gameStage: () => text.gameStage(contexts.text()),
    stageName: (stage) => text.stageName(stage),
    saveGame: () => save.saveGame(contexts.save()),
    loadGame: () => save.loadGame(contexts.save()),
    useSelectedItem: () => rewards.useSelectedItem(contexts.reward()),
    useQuickItem: (slot) => rewards.useQuickItem(contexts.reward(), slot),
    cycleItem: (step) => rewards.cycleItem(contexts.reward(), step),
    performAttack: () => actions.performAttack(contexts.action()),
    openInventory: () => ui.openInventory(contexts.ui()),
    closeInventory: () => ui.closeInventory(contexts.ui()),
    moveInventory: (dx, dy) => ui.moveInventory(contexts.ui(), dx, dy),
    confirmInventory: () => ui.confirmInventory(contexts.ui()),
    assignInventoryQuickSlot: (slot) => ui.assignInventoryQuickSlot(contexts.ui(), slot),
    sellInventorySelection: () => ui.sellInventorySelection(contexts.ui()),
    openShop: (title, rows) => ui.openShop(contexts.ui(), title, rows),
    closeShop: () => ui.closeShop(contexts.ui()),
    moveShop: (dy) => ui.moveShop(contexts.ui(), dy),
    confirmShop: () => ui.confirmShop(contexts.ui()),
    updateMonsters: (dt) => monsters.updateMonsters(contexts.monster(), dt),
  });

  map.createMap(contexts.map());
  return { definitions, state, player, runtime, contexts };
}

function openNpcShop(runtime, state, npc) {
  state.shopOpen = false;
  runtime.handleNpc(npc);
  assert(state.shopOpen, `expected ${npc.type} to open a shop`);
}

function buyShopRow(runtime, state, predicate, message) {
  const index = state.shopRows.findIndex(predicate);
  assert(index >= 0, message || "shop row should exist");
  state.shopIndex = index;
  runtime.confirmShop();
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
    for (const portal of d.DUNGEON_PORTALS || []) {
      if (portal.x !== x || portal.y !== y) continue;
      const key = `${portal.toX},${portal.toY}`;
      if (!seen.has(key) && passable(portal.toX, portal.toY)) {
        seen.add(key);
        queue.push([portal.toX, portal.toY]);
      }
    }
  }
  const goals = [
    ...d.TREASURE_CHESTS.map((chest) => [`chest:${chest.id}`, chest.x, chest.y]),
    ...d.DISCOVERY_POINTS.map((discovery) => [`discovery:${discovery.id}`, discovery.x, discovery.y]),
    ["guardian", d.GUARDIAN_SITE.x, d.GUARDIAN_SITE.y],
    ["warden", d.WARDEN_SITE.x, d.WARDEN_SITE.y],
    ["ashKnight", d.ASH_KNIGHT_SITE.x, d.ASH_KNIGHT_SITE.y],
    ["dragon-cave", 51, 18],
    ["east-expansion", 72, 57],
    ["north", 11, 13],
    ["far-east-road", 69, 18],
    ["ash-hamlet", 102, 58],
    ["old-tower", 104, 90],
    ["moon-ruin", 97, 99],
    ["moon-road", 102, 106],
    ["moon-camp", 102, 116],
    ["eclipse-seal", 82, 121],
    ["eclipseDragon", d.ECLIPSE_DRAGON_SITE.x, d.ECLIPSE_DRAGON_SITE.y],
    ["black-fort", 98, 132],
    ["black-market", 35, 135],
    ["old-tower-side-cache", 97, 92],
    ["obsidianGolem", d.OBSIDIAN_GOLEM_SITE.x, d.OBSIDIAN_GOLEM_SITE.y],
    ["black-gate-shield-cache", 73, 134],
    ["void-seal", 82, 138],
    ["voidDragon", d.VOID_DRAGON_SITE.x, d.VOID_DRAGON_SITE.y],
    ["black-market-catacomb-entry", 47, 130],
    ["cryptWarden", d.CRYPT_WARDEN_SITE.x, d.CRYPT_WARDEN_SITE.y],
    ["frost-haven", 24, 154],
    ["frost-cave", d.FROST_GOLEM_SITE.x, d.FROST_GOLEM_SITE.y],
    ["frost-seal", 103, 154],
    ["frostDragon", d.FROST_DRAGON_SITE.x, d.FROST_DRAGON_SITE.y],
    ["frost-tower-entry", 43, 148],
    ["frost-tower-supply", 95, 27],
    ["frost-tower-stairs", 101, 31],
    ["frost-tower-warden", d.FROST_TOWER_WARDEN_SITE.x, d.FROST_TOWER_WARDEN_SITE.y],
    ["frost-tower-reliquary", 115, 29],
    ["frost-tower-lift", 114, 31],
    ["east-harbor", 150, 85],
    ["east-lighthouse", 150, 48],
    ["east-ridge", 168, 105],
    ["southwind-outpost", 168, 169],
    ["south-island-shrine", 57, 209],
  ];
  const unreachable = goals.filter(([, x, y]) => !seen.has(`${x},${y}`));
  assert(unreachable.length === 0, `unreachable map goals: ${JSON.stringify(unreachable)}`);
  assert(d.MAP_W === 192 && d.MAP_H === 224, "continent map should be 192x224");
  const overviewRows = globalThis.DRAGON_HUNTER_WORLD_MAP?.overviewRows;
  assert(Array.isArray(overviewRows) && overviewRows.length === d.MAP_H, "world overview should cover the full continental map");
  assert(overviewRows.every((row) => typeof row === "string" && row.length === d.MAP_W), "world overview rows should match map dimensions");
  assert(!overviewRows.slice(1, 15).some((row) => row.slice(80, 120).includes("_")), "world overview should hide embedded catacomb room layouts");
  assert(state.npcs.length === 84, "expected 84 NPCs after island towns expansion");
  const blockedNpcs = state.npcs.filter((npc) => !passable(Math.floor(npc.x / d.TILE), Math.floor(npc.y / d.TILE)));
  assert(blockedNpcs.length === 0, `NPCs must stand on reachable terrain: ${JSON.stringify(blockedNpcs.map((npc) => ({ type: npc.type, x: Math.floor(npc.x / d.TILE), y: Math.floor(npc.y / d.TILE) })))}`);
  assert(state.npcs.some((entry) => entry.type === "frontier"), "frontier supply NPC should load from WORLD_OBJECTS");
  assert(state.npcs.some((entry) => entry.type === "merchant"), "black market merchant should load from WORLD_OBJECTS");
  assert(state.npcs.some((entry) => entry.type === "porter"), "porter NPCs should load from WORLD_OBJECTS");
  assert(state.npcs.some((entry) => entry.type === "frostSmith"), "Frost Haven shield artisan should load from WORLD_OBJECTS");
  return { reachableTiles: seen.size, npcs: state.npcs.map((entry) => entry.type) };
}

function assertSaveLoadAndEquipment() {
  const { definitions: d, state, player, runtime } = createRuntime();
  player.weapon = 3;
  player.armor = 3;
  player.shield = 2;
  player.shieldRune = "stride";
  player.ownedWeapons = [0, 1, 2, 3];
  player.ownedArmors = [0, 1, 2, 3];
  player.ownedShields = [0, 1, 2];
  player.gold = 123;
  player.tonics = 3;
  player.elixirs = 2;
  player.warps = 1;
  player.quickItems = ["elixir", "tonic", "warp"];
  player.activeQuickSlot = 1;
  player.selectedItem = "tonic";
  player.scales = 2;
  player.sealCrest = true;
  player.hunterCharm = true;
  player.regenCharm = true;
  player.greaterRegenCharm = true;
  player.trailCharm = true;
  player.aegisCharm = true;
  player.mineCharm = true;
  player.mistCharm = true;
  player.eclipseCharm = true;
  player.voidCharm = true;
  player.obsidianCharm = true;
  player.deepLampCharm = true;
  player.frostCharm = true;
  player.skyCharm = true;
  player.ownedAccessories = ["hunter", "regen", "greaterRegen", "trail", "aegis", "mine", "mist", "eclipse", "void", "obsidian", "deepLamp", "frost", "sky"];
  player.equippedAccessory = "trail";
  player.equippedAccessories = ["trail", "greaterRegen"];
  state.chests.add("town-cache");
  state.chests.add("north-ruin");
  state.chests.add("south-outpost");
  state.discoveries.add("river-spring");
  state.discoveries.add("hunter-cache");
  state.guardianDefeated = true;
  state.spawnedGuardian = true;
  state.wardenDefeated = true;
  state.spawnedWarden = true;
  state.ashKnightDefeated = true;
  state.spawnedAshKnight = true;
  state.smugglerCaptainDefeated = true;
  state.spawnedSmugglerCaptain = true;
  state.regenSentinelDefeated = true;
  state.spawnedRegenSentinel = true;
  state.mistKeeperDefeated = true;
  state.spawnedMistKeeper = true;
  state.cryptWardenDefeated = true;
  state.spawnedCryptWarden = true;
  state.frostGolemDefeated = true;
  state.spawnedFrostGolem = true;
  state.towerWardenDefeated = true;
  state.spawnedTowerWarden = true;
  state.frostDragonDefeated = true;
  state.spawnedFrostDragon = true;
  state.eclipseDragonDefeated = true;
  state.spawnedEclipseDragon = true;
  state.chapter2Reported = true;
  state.voidDragonDefeated = true;
  state.spawnedVoidDragon = true;
  state.obsidianGolemDefeated = true;
  state.spawnedObsidianGolem = true;
  state.chapter3Reported = true;
  state.chapter4Reported = true;
  state.bossDefeated = true;
  state.spawnedBoss = true;
  state.elderReported = true;
  runtime.saveGame();

  const restored = createRuntime();
  assert(restored.runtime.loadGame(), "loadGame should succeed");
  assert(restored.player.weapon === 3, "weapon rank should persist");
  assert(restored.player.armor === 3, "armor rank should persist");
  assert(restored.player.shield === 2, "shield rank should persist");
  assert(restored.player.shieldRune === "stride", "shield rune should persist");
  assert(restored.player.regenCharm, "regen charm should persist");
  assert(restored.player.greaterRegenCharm, "greater regen charm should persist");
  assert(restored.player.trailCharm, "trail charm should persist");
  assert(restored.player.aegisCharm, "aegis charm should persist");
  assert(restored.player.mineCharm, "mine charm should persist");
  assert(restored.player.mistCharm, "mist charm should persist");
  assert(restored.player.eclipseCharm, "eclipse charm should persist");
  assert(restored.player.voidCharm, "void charm should persist");
  assert(restored.player.obsidianCharm, "obsidian charm should persist");
  assert(restored.player.deepLampCharm, "deep lamp charm should persist");
  assert(restored.player.frostCharm, "frost charm should persist");
  assert(restored.player.skyCharm, "sky charm should persist");
  assert(JSON.stringify(restored.player.ownedWeapons) === JSON.stringify([0, 1, 2, 3]), "owned weapons should persist");
  assert(JSON.stringify(restored.player.ownedArmors) === JSON.stringify([0, 1, 2, 3]), "owned armors should persist");
  assert(JSON.stringify(restored.player.ownedShields) === JSON.stringify([0, 1, 2]), "owned shields should persist");
  assert(restored.player.ownedAccessories.includes("trail") && restored.player.ownedAccessories.includes("greaterRegen") && restored.player.ownedAccessories.includes("mine") && restored.player.ownedAccessories.includes("mist") && restored.player.ownedAccessories.includes("eclipse") && restored.player.ownedAccessories.includes("void") && restored.player.ownedAccessories.includes("obsidian") && restored.player.ownedAccessories.includes("deepLamp") && restored.player.ownedAccessories.includes("frost") && restored.player.ownedAccessories.includes("sky"), "owned accessories should persist");
  assert(restored.player.equippedAccessory === "trail", "equipped accessory should persist");
  assert(JSON.stringify(restored.player.equippedAccessories) === JSON.stringify(["trail", "greaterRegen"]), "two equipped accessory slots should persist");
  assert(restored.player.tonics === 3 && restored.player.elixirs === 2 && restored.player.warps === 1, "new premium items should persist");
  assert(JSON.stringify(restored.player.quickItems) === JSON.stringify(["elixir", "tonic", "warp"]) && restored.player.activeQuickSlot === 1 && restored.player.selectedItem === "tonic", `quick item assignments should persist: ${JSON.stringify({ quickItems: restored.player.quickItems, active: restored.player.activeQuickSlot, selected: restored.player.selectedItem })}`);
  const baseline = createRuntime();
  baseline.player.armor = restored.player.armor;
  baseline.player.weapon = restored.player.weapon;
  baseline.runtime.refreshDerivedStats();
  assert(restored.runtime.dashCost() < baseline.runtime.dashCost(), "trail charm should reduce dash cost after load");
  assert(restored.runtime.playerMoveSpeed() > baseline.runtime.playerMoveSpeed(), "trail charm should improve movement speed after load");
  assert(restored.runtime.regenRate() > baseline.runtime.regenRate(), "greater regen charm should improve HP regeneration after load");
  assert(restored.state.chests.size === 3, "opened chests should persist");
  assert(restored.state.discoveries.size === 2, "discoveries should persist");
  assert(restored.state.wardenDefeated, "warden defeat flag should persist");
  assert(restored.state.ashKnightDefeated, "ash knight defeat flag should persist");
  assert(restored.state.smugglerCaptainDefeated, "smuggler captain defeat flag should persist");
  assert(restored.state.regenSentinelDefeated, "regen sentinel defeat flag should persist");
  assert(restored.state.mistKeeperDefeated, "mist keeper defeat flag should persist");
  assert(restored.state.cryptWardenDefeated, "crypt warden defeat flag should persist");
  assert(restored.state.frostGolemDefeated, "frost golem defeat flag should persist");
  assert(restored.state.towerWardenDefeated, "frost tower warden defeat flag should persist");
  assert(restored.state.frostDragonDefeated && restored.state.chapter4Reported, "chapter 4 flags should persist");
  assert(restored.state.eclipseDragonDefeated && restored.state.chapter2Reported, "chapter 2 flags should persist");
  assert(restored.state.voidDragonDefeated && restored.state.chapter3Reported, "chapter 3 flags should persist");
  assert(restored.state.obsidianGolemDefeated, "obsidian golem defeat flag should persist");
  assert(restored.state.guardianDefeated && restored.state.bossDefeated && restored.state.elderReported, "boss/clear flags should persist");

  const rewardHelpers = globalThis.DRAGON_HUNTER_REWARDS;
  const weakerWeapon = rewardHelpers.grantWeaponAtLeast({ player: restored.player, say: () => {} }, 1, "upgrade");
  const weakerArmor = rewardHelpers.grantArmorAtLeast({ player: restored.player, say: () => {} }, 1, "upgrade");
  assert(!weakerWeapon && !weakerArmor, "weaker equipment should not downgrade current gear");
  restored.player.weapon = 4;
  const sidegradeWeapon = rewardHelpers.grantWeaponAtLeast({ player: restored.player, say: () => {} }, 5, "upgrade");
  assert(sidegradeWeapon && restored.player.ownedWeapons.includes(5), "sidegrade weapon should be added to inventory");
  assert(restored.player.weapon === 4, "lower-power sidegrade weapon should not auto-equip over stronger current weapon");
  const weakGear = createRuntime();
  weakGear.player.weapon = 4;
  weakGear.player.armor = 4;
  weakGear.player.shield = 3;
  weakGear.player.ownedWeapons = [0, 4];
  weakGear.player.ownedArmors = [0, 4];
  weakGear.player.ownedShields = [0, 3];
  rewardHelpers.grantWeaponAtLeast({ player: weakGear.player, say: () => {} }, 1, "upgrade");
  rewardHelpers.grantArmorAtLeast({ player: weakGear.player, say: () => {} }, 1, "upgrade");
  rewardHelpers.grantShieldAtLeast({ player: weakGear.player, say: () => {} }, 1, "upgrade");
  assert(weakGear.player.ownedWeapons.includes(1) && weakGear.player.weapon === 4, "weaker found weapon should be kept in inventory without auto-equip");
  assert(weakGear.player.ownedArmors.includes(1) && weakGear.player.armor === 4, "weaker found armor should be kept in inventory without auto-equip");
  assert(weakGear.player.ownedShields.includes(1) && weakGear.player.shield === 3, "weaker found shield should be kept in inventory without auto-equip");

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
  assert(migrated.player.equippedAccessories.includes("trail") && migrated.player.equippedAccessories.includes("regen"), "old saves should migrate to two accessory slots");
  return { saveKey: d.SAVE_KEY, weapon: restored.player.weapon, armor: restored.player.armor };
}

function assertInventoryManagement() {
  const { state, player, runtime } = createRuntime();
  player.ownedWeapons = [0, 1, 3];
  player.ownedArmors = [0, 2];
  player.ownedShields = [0, 1, 2];
  player.ownedAccessories = ["regen", "trail", "mine"];
  player.regenCharm = true;
  player.trailCharm = true;
  player.mineCharm = true;
  player.equippedAccessory = "regen";
  player.equippedAccessories = ["regen"];
  player.weapon = 1;
  player.armor = 0;
  player.shield = 0;
  player.gold = 10;
  runtime.refreshDerivedStats();

  state.inventoryTab = "items";
  state.inventoryIndex = 1;
  player.tonics = 2;
  runtime.openInventory();
  runtime.assignInventoryQuickSlot(2);
  assert(player.quickItems[2] === "tonic" && player.activeQuickSlot === 2, "inventory should assign any item to a chosen quick slot");
  runtime.closeInventory();
  const tonicBeforeQuickUse = player.tonics;
  player.stamina = 0;
  runtime.useQuickItem(2);
  assert(player.tonics === tonicBeforeQuickUse - 1 && player.stamina === player.staminaMax, "quick slot should immediately use its assigned item");
  runtime.cycleItem(-1);
  assert(player.activeQuickSlot === 1 && player.selectedItem === player.quickItems[1], "Q/E item cycling should move between configured quick slots");

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

  state.inventoryTab = "shields";
  state.inventoryIndex = 2;
  runtime.confirmInventory();
  assert(player.shield === 2, "inventory should equip selected shield");
  const withShield = runtime.armorDamageMultiplier({ type: "shieldSoldier" }, 0.8, "contact");
  player.shield = 0;
  const withoutShield = runtime.armorDamageMultiplier({ type: "shieldSoldier" }, 0.8, "contact");
  assert(withShield < withoutShield, "equipped shield should reduce frontal contact damage");

  state.inventoryTab = "accessories";
  state.inventoryIndex = player.ownedAccessories.indexOf("trail");
  runtime.confirmInventory();
  assert(player.equippedAccessories.includes("regen") && player.equippedAccessories.includes("trail"), "inventory should equip selected accessory into second slot");
  assert(runtime.dashCost() < 34, "equipped trail accessory should affect dash cost");
  state.inventoryIndex = player.ownedAccessories.indexOf("mine");
  runtime.confirmInventory();
  assert(player.equippedAccessories.includes("trail") && player.equippedAccessories.includes("mine") && !player.equippedAccessories.includes("regen"), "third accessory should replace oldest equipped slot");
  assert(runtime.dashCost() < 34, "trail should keep affecting dash cost while equipped with mine charm");

  runtime.closeInventory();
  assert(!state.inventoryOpen, "inventory should close");
  return { weapon: player.weapon, equippedAccessories: player.equippedAccessories, gold: player.gold };
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

  player.level = d.ASH_KNIGHT_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.ASH_KNIGHT_SITE.x * d.TILE;
  player.y = d.ASH_KNIGHT_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedAshKnight, "Ash Knight should spawn near old tower after Warden and level gate");
  const ashKnight = state.monsters.find((monster) => monster.type === "ashKnight");
  assert(ashKnight, "Ash Knight monster should exist");
  ashKnight.hp = 0;
  runtime.updateMonsters(16);
  assert(state.ashKnightDefeated, "Ash Knight defeat should set ashKnightDefeated");
  assert(!state.guardianDefeated, "Ash Knight defeat should not count as Guardian defeat");

  player.level = d.SMUGGLER_CAPTAIN_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.SMUGGLER_CAPTAIN_SITE.x * d.TILE;
  player.y = d.SMUGGLER_CAPTAIN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedSmugglerCaptain, "Smuggler Captain should spawn on the dangerous shortcut at its level gate");
  const smugglerCaptain = state.monsters.find((monster) => monster.type === "smugglerCaptain");
  assert(smugglerCaptain, "Smuggler Captain monster should exist");
  smugglerCaptain.hp = 0;
  runtime.updateMonsters(16);
  assert(state.smugglerCaptainDefeated, "Smuggler Captain defeat should persist in state");
  assert(!state.guardianDefeated, "Smuggler Captain defeat should not count as Guardian defeat");

  player.level = d.REGEN_SENTINEL_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.REGEN_SENTINEL_SITE.x * d.TILE;
  player.y = d.REGEN_SENTINEL_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedRegenSentinel, "Regen Sentinel should spawn inside the greater regeneration cave");
  const regenSentinel = state.monsters.find((monster) => monster.type === "regenSentinel");
  assert(regenSentinel, "Regen Sentinel monster should exist");
  regenSentinel.hp = 0;
  runtime.updateMonsters(16);
  assert(state.regenSentinelDefeated, "Regen Sentinel defeat should persist in state");
  assert(!state.guardianDefeated, "Regen Sentinel defeat should not count as Guardian defeat");

  player.level = d.MIST_KEEPER_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.MIST_KEEPER_SITE.x * d.TILE;
  player.y = d.MIST_KEEPER_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedMistKeeper, "Mist Keeper should spawn inside the mist shrine");
  const mistKeeper = state.monsters.find((monster) => monster.type === "mistKeeper");
  assert(mistKeeper, "Mist Keeper monster should exist");
  mistKeeper.hp = 0;
  runtime.updateMonsters(16);
  assert(state.mistKeeperDefeated, "Mist Keeper defeat should persist in state");
  assert(!state.guardianDefeated, "Mist Keeper defeat should not count as Guardian defeat");

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

  state.ashKnightDefeated = false;
  state.spawnedAshKnight = false;
  state.monsters = state.monsters.filter((monster) => monster.type !== "ashKnight");
  player.level = d.ASH_KNIGHT_REQUIREMENTS.level;
  player.x = d.ASH_KNIGHT_SITE.x * d.TILE;
  player.y = d.ASH_KNIGHT_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedAshKnight, "Ash Knight should still spawn after dragon victory when requirements are met");

  const postVictoryAshKnight = state.monsters.find((monster) => monster.type === "ashKnight");
  assert(postVictoryAshKnight, "Ash Knight monster should exist after post-victory spawn");
  postVictoryAshKnight.hp = 0;
  runtime.updateMonsters(16);
  assert(state.ashKnightDefeated, "Post-victory Ash Knight defeat should persist in state");

  const elder = state.npcs.find((entry) => entry.type === "elder");
  runtime.handleNpc(elder);
  assert(state.elderReported, "Elder report should complete clear state");

  state.chests.add("moon-ruin-cache");
  state.discoveries.add("eclipse-seal");
  player.level = d.CHAPTER2_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.ECLIPSE_DRAGON_SITE.x * d.TILE;
  player.y = d.ECLIPSE_DRAGON_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedEclipseDragon, "Eclipse Dragon should spawn after chapter 2 requirements");
  const eclipseDragon = state.monsters.find((monster) => monster.type === "eclipseDragon");
  assert(eclipseDragon, "Eclipse Dragon monster should exist");
  eclipseDragon.hp = 0;
  runtime.updateMonsters(16);
  assert(state.eclipseDragonDefeated && state.chapter2Victory, "Eclipse Dragon defeat should set chapter 2 victory");
  runtime.handleNpc(elder);
  assert(state.chapter2Reported, "Elder report should complete chapter 2 clear state");

  state.chests.add("black-fort-armory");
  state.chests.add("eclipse-castle-cache");
  state.discoveries.add("void-seal");
  player.level = d.OBSIDIAN_GOLEM_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.OBSIDIAN_GOLEM_SITE.x * d.TILE;
  player.y = d.OBSIDIAN_GOLEM_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedObsidianGolem, "Obsidian Golem should spawn before the final black sun route");
  const obsidianGolem = state.monsters.find((monster) => monster.type === "obsidianGolem");
  assert(obsidianGolem, "Obsidian Golem monster should exist");
  obsidianGolem.hp = 0;
  runtime.updateMonsters(16);
  assert(state.obsidianGolemDefeated, "Obsidian Golem defeat should unlock deeper chapter 3 route");

  player.level = d.CHAPTER3_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.VOID_DRAGON_SITE.x * d.TILE;
  player.y = d.VOID_DRAGON_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedVoidDragon, "Void Dragon should spawn after chapter 3 requirements");
  const voidDragon = state.monsters.find((monster) => monster.type === "voidDragon");
  assert(voidDragon, "Void Dragon monster should exist");
  voidDragon.hp = 0;
  runtime.updateMonsters(16);
  assert(state.voidDragonDefeated && state.chapter3Victory, "Void Dragon defeat should set chapter 3 victory");
  runtime.handleNpc(elder);
  assert(state.chapter3Reported, "Elder report should complete chapter 3 clear state");

  player.level = d.FROST_GOLEM_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.FROST_GOLEM_SITE.x * d.TILE;
  player.y = d.FROST_GOLEM_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedFrostGolem, "Frost Golem should spawn after chapter 3 report and level gate");
  const frostGolem = state.monsters.find((monster) => monster.type === "frostGolem");
  assert(frostGolem, "Frost Golem monster should exist");
  frostGolem.hp = 0;
  runtime.updateMonsters(16);
  assert(state.frostGolemDefeated, "Frost Golem defeat should unlock the frost citadel route");

  state.discoveries.add("frost-seal");
  player.level = d.CHAPTER4_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.FROST_DRAGON_SITE.x * d.TILE;
  player.y = d.FROST_DRAGON_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedFrostDragon, "Frost Dragon should spawn after chapter 4 requirements");
  const frostDragon = state.monsters.find((monster) => monster.type === "frostDragon");
  assert(frostDragon, "Frost Dragon monster should exist");
  frostDragon.hp = 0;
  runtime.updateMonsters(16);
  assert(state.frostDragonDefeated && state.chapter4Victory, "Frost Dragon defeat should set chapter 4 victory");
  runtime.handleNpc(elder);
  assert(state.chapter4Reported, "Elder report should complete chapter 4 clear state");
  return { guardianDefeated: state.guardianDefeated, bossDefeated: state.bossDefeated, elderReported: state.elderReported, chapter2Reported: state.chapter2Reported, chapter3Reported: state.chapter3Reported, chapter4Reported: state.chapter4Reported };
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
  player.gold = 400;
  player.potions = 0;
  player.bombs = 0;
  player.wards = 0;
  player.level = 3;
  player.mineCharm = false;
  player.gold = 220;
  openNpcShop(runtime, state, frontier);
  buyShopRow(runtime, state, (row) => row.type === "accessory" && row.id === "mine", "frontier mine charm should be selectable");
  assert(player.mineCharm, "frontier supply NPC should sell mine charm before supplies");
  assert(player.gold === 40, "mine charm should cost 180G");
  const withCharm = runtime.armorDamageMultiplier({ type: "bubbler" }, 0.2, "contact");
  player.mineCharm = false;
  player.equippedAccessory = "";
  player.equippedAccessories = [];
  const withoutCharm = runtime.armorDamageMultiplier({ type: "bubbler" }, 0.2, "contact");
  assert(withCharm < withoutCharm, "mine charm should reduce bubbler contact damage");
  player.mineCharm = true;
  player.equippedAccessory = "mine";
  player.equippedAccessories = ["mine"];
  player.gold = d.weaponCosts[5];
  buyShopRow(runtime, state, (row) => row.type === "weapon" && row.id === 5, "frontier mine weapon should be selectable");
  assert(player.ownedWeapons.includes(5), "frontier supply NPC should sell mine sidegrade weapon");
  assert(player.gold === 0, "mine sidegrade weapon should charge its listed cost");
  const basicDamage = runtime.weaponDamageMultiplier({ type: "bubbler" }, 0.1, 0.1);
  player.weapon = 5;
  const mineWeaponDamage = runtime.weaponDamageMultiplier({ type: "bubbler" }, 0.1, 0.1);
  assert(mineWeaponDamage > basicDamage, "mine sidegrade weapon should improve damage against bubblers");
  player.gold = d.armorCosts[5];
  buyShopRow(runtime, state, (row) => row.type === "armor" && row.id === 5, "frontier mine armor should be selectable");
  assert(player.ownedArmors.includes(5), "frontier supply NPC should sell mine sidegrade armor");
  player.armor = 5;
  const mineArmorDamage = runtime.armorDamageMultiplier({ type: "bubbler" }, 0.2, "bubble");
  player.armor = 0;
  const noMineArmorDamage = runtime.armorDamageMultiplier({ type: "bubbler" }, 0.2, "bubble");
  assert(mineArmorDamage < noMineArmorDamage, "mine sidegrade armor should reduce bubble damage");
  player.level = 8;
  player.gold = d.weaponCosts[6] + d.armorCosts[6];
  runtime.closeShop();
  openNpcShop(runtime, state, frontier);
  buyShopRow(runtime, state, (row) => row.type === "weapon" && row.id === 6, "frontier fire weapon should be selectable at level 8");
  buyShopRow(runtime, state, (row) => row.type === "armor" && row.id === 6, "frontier fire armor should be selectable at level 8");
  assert(player.ownedWeapons.includes(6) && player.ownedArmors.includes(6), "frontier should sell fire-route sidegrades from level 8");
  player.level = 12;
  player.gold = d.weaponCosts[7] + d.armorCosts[7];
  runtime.closeShop();
  openNpcShop(runtime, state, frontier);
  buyShopRow(runtime, state, (row) => row.type === "weapon" && row.id === 7, "frontier dragon weapon should be selectable at level 12");
  buyShopRow(runtime, state, (row) => row.type === "armor" && row.id === 7, "frontier dragon armor should be selectable at level 12");
  assert(player.ownedWeapons.includes(7) && player.ownedArmors.includes(7), "frontier should sell dragon-route sidegrades from level 12");
  player.gold = 400;
  player.potions = 0;
  player.bombs = 0;
  player.wards = 0;
  buyShopRow(runtime, state, (row) => row.type === "item" && row.id === "potion", "frontier potion pack should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "item" && row.id === "bomb", "frontier bomb pack should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "item" && row.id === "ward", "frontier ward pack should be selectable");
  assert(player.potions >= 2 && player.bombs >= 1 && player.wards >= 1, "frontier supply NPC should sell expedition supplies");
  assert(player.gold < 400, "frontier supply NPC should charge gold for supplies");
  return { safe: runtime.inTown(player.x, player.y), mineCharm: player.mineCharm, supplies: { potions: player.potions, bombs: player.bombs, wards: player.wards } };
}

function assertExpandedWorldContent() {
  const { definitions: d, state, player, runtime, contexts } = createRuntime();
  assert(Boolean(d.monsterTypes.sorcerer), "sorcerer monster definition should exist");
  assert(Boolean(d.monsterTypes.ashKnight), "ash knight monster definition should exist");
  assert(Boolean(d.monsterTypes.eclipseMage), "eclipse mage monster definition should exist");
  assert(Boolean(d.monsterTypes.eclipseDragon), "eclipse dragon monster definition should exist");
  assert(Boolean(d.monsterTypes.voidWraith), "void wraith monster definition should exist");
  assert(Boolean(d.monsterTypes.voidDragon), "void dragon monster definition should exist");
  assert(Boolean(d.monsterTypes.obsidianCrawler), "obsidian crawler monster definition should exist");
  assert(Boolean(d.monsterTypes.obsidianGolem), "obsidian golem monster definition should exist");
  assert(Boolean(d.monsterTypes.shieldSoldier), "shield soldier monster definition should exist");
  assert(Boolean(d.monsterTypes.summoner), "summoner monster definition should exist");
  assert(Boolean(d.monsterTypes.trapFlower), "trap flower monster definition should exist");
  assert(Boolean(d.monsterTypes.smugglerCaptain), "smuggler captain monster definition should exist");
  assert(Boolean(d.monsterTypes.regenSentinel), "regen sentinel monster definition should exist");
  assert(Boolean(d.monsterTypes.mistLancer), "mist lancer monster definition should exist");
  assert(Boolean(d.monsterTypes.mistKeeper), "mist keeper monster definition should exist");
  assert(Boolean(d.monsterTypes.vaultLeech), "vault leech monster definition should exist");
  assert(Boolean(d.monsterTypes.cryptWarden), "crypt warden monster definition should exist");
  assert(Boolean(d.monsterTypes.frostMoth), "frost moth monster definition should exist");
  assert(Boolean(d.monsterTypes.frostBeast), "frost beast monster definition should exist");
  assert(Boolean(d.monsterTypes.frostGolem), "frost golem monster definition should exist");
  assert(Boolean(d.monsterTypes.frostBeacon), "frost beacon monster definition should exist");
  assert(Boolean(d.monsterTypes.towerWarden), "frost tower warden monster definition should exist");
  assert(Boolean(d.monsterTypes.frostDragon), "frost dragon monster definition should exist");
  assert(d.weaponAttackProfiles.length === d.weaponNames.length, "every weapon should define an attack profile");
  assert(d.weaponAttackProfiles[1].cooldown < d.weaponAttackProfiles[11].cooldown && d.weaponAttackProfiles[8].range > d.weaponAttackProfiles[2].range, "weapon profiles should create visible speed and reach tradeoffs");

  const attackStyle = createRuntime();
  attackStyle.player.x = 30 * d.TILE;
  attackStyle.player.y = 40 * d.TILE;
  attackStyle.player.dir = "right";
  attackStyle.player.weapon = 1;
  const attackStartX = attackStyle.player.x;
  attackStyle.runtime.performAttack();
  assert(attackStyle.player.attackCooldown === d.weaponAttackProfiles[1].cooldown && attackStyle.player.x > attackStartX, "spear attack should use its quick lunging profile");

  const interiorSpawn = createRuntime();
  interiorSpawn.player.level = 30;
  interiorSpawn.player.x = 96 * d.TILE;
  interiorSpawn.player.y = 25 * d.TILE;
  interiorSpawn.runtime.spawnMonster("slime", 86 * d.TILE, 25 * d.TILE);
  assert(interiorSpawn.runtime.currentRegion() === "frostTower1", "interior spawn test should begin on Frost Watchtower floor one");
  interiorSpawn.runtime.updateRegionSpawns(1000);
  assert(!interiorSpawn.state.monsters.some((monster) => monster.type === "slime"), "exterior monsters should be pruned when they would consume an interior spawn budget");
  assert(interiorSpawn.runtime.countRegionMonsters("frostTower1") >= 6, "interior should rapidly populate with monsters from its own floor");

  const marketDialogue = createRuntime();
  const marketPeople = marketDialogue.state.npcs.filter((npc) => npc.type === "villager" && npc.y > 128 * d.TILE && npc.x < 48 * d.TILE);
  marketDialogue.runtime.handleNpc(marketPeople[0]);
  const firstMarketLine = marketDialogue.state.message;
  marketDialogue.runtime.handleNpc(marketPeople[marketPeople.length - 1]);
  assert(firstMarketLine !== marketDialogue.state.message, "residents in the same town should not all repeat one generic line");

  player.x = 47 * d.TILE;
  player.y = 130 * d.TILE;
  const catacombPortal = runtime.nearestPortal();
  assert(catacombPortal?.id === "black-market-catacomb-entry", "black market should expose the catacomb entrance portal");
  runtime.traversePortal(catacombPortal);
  assert(Math.floor(player.x / d.TILE) === 83 && Math.floor(player.y / d.TILE) === 2, "catacomb portal should move the player into the interior");
  assert(runtime.currentRegion() === "undercity", "catacomb interior should use undercity region");
  player.x = 43 * d.TILE;
  player.y = 148 * d.TILE;
  const towerEntry = runtime.nearestPortal();
  assert(towerEntry?.id === "frost-tower-entry", "Frost Frontier should expose the Frost Watchtower entrance");
  runtime.traversePortal(towerEntry);
  assert(runtime.currentRegion() === "frostTower1", "Frost Watchtower first floor should use its own region");
  player.x = 101 * d.TILE;
  player.y = 31 * d.TILE;
  const towerStairs = runtime.nearestPortal();
  assert(towerStairs?.id === "frost-tower-up", "first-floor stairs should lead upward");
  runtime.traversePortal(towerStairs);
  assert(runtime.currentRegion() === "frostTower2", "Frost Watchtower second floor should use its own region");
  player.x = 46 * d.TILE;
  player.y = 148 * d.TILE;
  assert(runtime.nearestPortal() === null, "tower lift should remain unavailable before activation");
  state.discoveries.add("frost-tower-lift");
  const towerLift = runtime.nearestPortal();
  assert(towerLift?.id === "frost-tower-lift-entry", "activated tower lift should be usable from Frost Frontier");
  runtime.traversePortal(towerLift);
  assert(runtime.currentRegion() === "frostTower2", "tower lift should shortcut directly to the second floor");
  player.x = 24 * d.TILE;
  player.y = 148 * d.TILE;
  assert(runtime.currentRegion() === "frost", "Frost Haven approach should use frost region");
  player.x = 64 * d.TILE;
  player.y = 155 * d.TILE;
  assert(runtime.currentRegion() === "frostCave", "ice cave should use frost cave region");
  player.x = 108 * d.TILE;
  player.y = 156 * d.TILE;
  assert(runtime.currentRegion() === "frostCitadel", "Frost Crown Citadel should use frost citadel region");

  player.x = 20 * d.TILE;
  player.y = 100 * d.TILE;
  assert(runtime.currentRegion() === "smuggler", "western shortcut should use smuggler region");
  player.x = 54 * d.TILE;
  player.y = 124 * d.TILE;
  assert(runtime.currentRegion() === "regenCave", "black market north dungeon should use regen cave region");
  player.x = 72 * d.TILE;
  player.y = 122 * d.TILE;
  assert(runtime.currentRegion() === "mistShrine", "mist shrine should use its own region");
  player.x = 90 * d.TILE;
  player.y = 60 * d.TILE;
  assert(runtime.currentRegion() === "ash", "expanded east road should use ash region");
  player.x = 48 * d.TILE;
  player.y = 84 * d.TILE;
  assert(runtime.currentRegion() === "highland", "three-route mountain crossing should use the highland region");
  player.level = 14;
  const highlandPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "highland");
  assert(highlandPool.includes("shieldSoldier") && highlandPool.includes("sorcerer") && highlandPool.includes("boar"), "highland routes should mix frontal guards, magic, and chargers");
  player.x = 150 * d.TILE;
  player.y = 60 * d.TILE;
  assert(runtime.currentRegion() === "windCoast", "east island north coast should use windCoast region");
  const windCoastPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "windCoast");
  assert(windCoastPool.includes("mistLancer") && windCoastPool.includes("frostMoth"), "wind coast should mix lunges and ranged pressure");
  player.x = 165 * d.TILE;
  player.y = 105 * d.TILE;
  assert(runtime.currentRegion() === "eastHighland", "east island interior should use eastHighland region");
  player.x = 58 * d.TILE;
  player.y = 209 * d.TILE;
  assert(runtime.currentRegion() === "southIsles", "southern archipelago should use southIsles region");
  player.x = d.ASH_KNIGHT_SITE.x * d.TILE;
  player.y = d.ASH_KNIGHT_SITE.y * d.TILE;
  assert(runtime.currentRegion() === "tower", "old tower should use tower region");
  player.x = 104 * d.TILE;
  player.y = 102 * d.TILE;
  assert(runtime.currentRegion() === "moon", "moon ruins should use moon region");
  player.x = 86 * d.TILE;
  player.y = 123 * d.TILE;
  assert(runtime.currentRegion() === "eclipse", "eclipse castle should use eclipse region");
  player.x = 82 * d.TILE;
  player.y = 139 * d.TILE;
  assert(runtime.currentRegion() === "void", "black sun region should use void region");
  player.x = 52 * d.TILE;
  player.y = 132 * d.TILE;
  assert(runtime.currentRegion() === "obsidian", "black market branch dungeon should use obsidian region");
  player.level = 14;
  const towerPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "tower");
  assert(towerPool.includes("sorcerer") && towerPool.includes("shieldSoldier"), "tower spawn pool should include sorcerer and shield soldiers");
  player.weapon = 3;
  const shieldFront = runtime.weaponDamageMultiplier({ type: "shieldSoldier" }, 0.1, 0.7);
  const shieldBack = runtime.weaponDamageMultiplier({ type: "shieldSoldier" }, 0.1, -0.8);
  assert(shieldBack > shieldFront, "shield soldiers should be weaker from back attacks than frontal attacks");
  player.level = 14;
  const moonPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "moon");
  assert(moonPool.includes("moonShade") && moonPool.includes("sorcerer") && moonPool.includes("summoner"), "moon spawn pool should include moonShade, sorcerer, and summoner");
  assert(!moonPool.includes("trapFlower"), "moon trap flowers should wait until level 16");
  player.level = 16;
  const moonTrapPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "moon");
  assert(moonTrapPool.includes("trapFlower"), "moon spawn pool should include trap flowers after level 16");
  player.level = 1;
  const smugglerLowPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "smuggler");
  assert(smugglerLowPool.includes("shieldSoldier") && smugglerLowPool.includes("wisp"), "smuggler shortcut should remain dangerous even at low level");
  const regenLowPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "regenCave");
  assert(regenLowPool.includes("bubbler") && regenLowPool.includes("trapFlower"), "regen cave should have special hazards even at low level");
  player.level = d.SMUGGLER_CAPTAIN_REQUIREMENTS.level;
  player.x = d.SMUGGLER_CAPTAIN_SITE.x * d.TILE;
  player.y = d.SMUGGLER_CAPTAIN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.monsters.some((monster) => monster.type === "smugglerCaptain"), "smuggler shortcut should spawn its named captain encounter");
  state.monsters = [];
  player.level = d.REGEN_SENTINEL_REQUIREMENTS.level;
  player.x = d.REGEN_SENTINEL_SITE.x * d.TILE;
  player.y = d.REGEN_SENTINEL_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.monsters.some((monster) => monster.type === "regenSentinel"), "greater regen cave should spawn its guardian encounter");
  state.monsters = [];
  state.regenSentinelDefeated = true;
  state.spawnedRegenSentinel = true;
  player.level = d.MIST_KEEPER_REQUIREMENTS.level;
  player.x = d.MIST_KEEPER_SITE.x * d.TILE;
  player.y = d.MIST_KEEPER_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.monsters.some((monster) => monster.type === "mistKeeper"), "mist shrine should spawn its guardian encounter after regeneration cave");
  state.monsters = [];
  const mistPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "mistShrine");
  assert(mistPool.includes("mistLancer") && mistPool.includes("summoner") && mistPool.includes("trapFlower"), "mist shrine spawn pool should include mist lancers, summoners, and trap flowers");
  player.level = d.CRYPT_WARDEN_REQUIREMENTS.level;
  const cryptPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "undercity");
  assert(cryptPool.includes("vaultLeech") && cryptPool.includes("shieldSoldier") && cryptPool.includes("summoner"), "catacomb spawn pool should mix life drain, frontal guard, and summoning pressure");
  state.chapter2Reported = true;
  player.x = d.CRYPT_WARDEN_SITE.x * d.TILE;
  player.y = d.CRYPT_WARDEN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  const cryptWarden = state.monsters.find((monster) => monster.type === "cryptWarden");
  assert(cryptWarden, "catacomb should spawn its named warden encounter after chapter 2 report");
  cryptWarden.hp = 0;
  runtime.updateMonsters(16);
  assert(state.cryptWardenDefeated, "crypt warden defeat should persist in state");
  state.monsters = [];
  player.level = d.CHAPTER4_REQUIREMENTS.level;
  const frostPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "frost");
  const frostCavePool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "frostCave");
  const frostCitadelPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "frostCitadel");
  const frostTowerPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "frostTower2");
  assert(frostPool.includes("frostMoth") && frostPool.includes("frostBeast"), "frost field should use its new enemy family");
  assert(frostCavePool.includes("frostBeast") && frostCavePool.includes("vaultLeech"), "ice cave should mix charge and drain pressure");
  assert(frostCitadelPool.includes("frostMoth") && frostCitadelPool.includes("summoner"), "frost citadel should mix ice projectiles and summons");
  assert(frostTowerPool.includes("frostBeacon") && frostTowerPool.includes("frostBeast"), "frost tower should mix aura hazards and charge pressure");

  state.monsters = [];
  state.chapter3Reported = true;
  player.level = d.FROST_TOWER_WARDEN_REQUIREMENTS.level;
  player.x = d.FROST_TOWER_WARDEN_SITE.x * d.TILE;
  player.y = d.FROST_TOWER_WARDEN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  const towerWarden = state.monsters.find((monster) => monster.type === "towerWarden");
  assert(towerWarden, "Frost Watchtower should spawn its named warden encounter");
  towerWarden.hp = towerWarden.hpMax * 0.5;
  runtime.updateMonsters(16);
  assert(towerWarden.summoned && state.monsters.some((monster) => monster.type === "frostBeacon"), "tower warden should activate frost beacons below half HP");
  towerWarden.hp = 0;
  runtime.updateMonsters(16);
  assert(state.towerWardenDefeated, "tower warden defeat should persist in state");

  state.monsters = [];
  player.armor = 0;
  player.equippedAccessories = [];
  player.stamina = player.staminaMax;
  player.slow = 0;
  player.x = 110 * d.TILE;
  player.y = 27 * d.TILE;
  runtime.spawnMonster("frostBeacon", player.x + d.TILE, player.y);
  const beacon = state.monsters.find((monster) => monster.type === "frostBeacon");
  beacon.summonCooldown = 0;
  const staminaBeforeBeacon = player.stamina;
  runtime.updateMonsters(16);
  assert(player.stamina < staminaBeforeBeacon && player.slow > 0, "frost beacon should pulse stamina and slow pressure at close range");
  player.level = 20;
  const eclipsePool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "eclipse");
  assert(eclipsePool.includes("eclipseMage") && eclipsePool.includes("moonShade") && eclipsePool.includes("summoner") && eclipsePool.includes("trapFlower"), "eclipse spawn pool should include eclipse mage, moon shade, summoner, and trap flowers");
  player.level = 26;
  const voidPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "void");
  assert(voidPool.includes("voidWraith") && voidPool.includes("eclipseMage") && voidPool.includes("summoner") && voidPool.includes("trapFlower"), "void spawn pool should include void wraith, eclipse mage, summoner, and trap flowers");
  const obsidianPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "obsidian");
  assert(obsidianPool.includes("obsidianCrawler") && obsidianPool.includes("voidWraith") && obsidianPool.includes("summoner") && obsidianPool.includes("trapFlower"), "obsidian spawn pool should include crawler, summoner, trap flowers, and void pressure");

  state.monsters = [];
  player.level = 18;
  player.x = 84 * d.TILE;
  player.y = 106 * d.TILE;
  runtime.spawnMonster("summoner", player.x + d.TILE * 2, player.y);
  const summoner = state.monsters.find((monster) => monster.type === "summoner");
  assert(summoner, "summoner should spawn for behavior verification");
  summoner.summonCooldown = 0;
  const beforeSummon = state.monsters.length;
  runtime.updateMonsters(16);
  assert(state.monsters.length > beforeSummon, "summoner should call reinforcements when close to the player");

  state.monsters = [];
  state.gameOver = false;
  player.level = 18;
  player.armor = 0;
  player.shield = 0;
  player.equippedAccessory = "";
  player.equippedAccessories = [];
  player.hpMax = 260;
  player.hp = player.hpMax;
  player.invuln = 0;
  player.stamina = player.staminaMax;
  player.x = 86 * d.TILE;
  player.y = 105 * d.TILE;
  runtime.spawnMonster("trapFlower", player.x + d.TILE, player.y);
  const trap = state.monsters.find((monster) => monster.type === "trapFlower");
  assert(trap, "trap flower should spawn for behavior verification");
  runtime.updateMonsters(16);
  assert(trap.trapPrimed && trap.trapTimer > 900, "trap flower should give roughly double warning time before exploding");
  trap.trapPrimed = true;
  trap.trapTimer = 0;
  runtime.updateMonsters(16);
  assert(player.hp < player.hpMax && player.slow > 0, "armed trap flower should explode, damage, and slow nearby player");
  assert(!state.monsters.some((monster) => monster.type === "trapFlower"), "trap flower should be removed after exploding");
  state.gameOver = false;

  state.monsters = [];
  state.projectiles = [];
  player.x = 82 * d.TILE;
  player.y = 148 * d.TILE;
  runtime.spawnMonster("frostMoth", player.x + d.TILE * 2, player.y);
  const frostMoth = state.monsters.find((monster) => monster.type === "frostMoth");
  frostMoth.fireCooldown = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.source === "frostMoth"), "frost moth should fire freezing projectiles from range");

  state.monsters = [];
  state.projectiles = [];
  runtime.spawnMonster("frostBeast", player.x + d.TILE * 2, player.y);
  const frostBeast = state.monsters.find((monster) => monster.type === "frostBeast");
  frostBeast.chargeCooldown = 0;
  runtime.updateMonsters(16);
  assert(frostBeast.windup > 0, "frost beast should telegraph its long charge");

  state.monsters = [];
  player.x = 104 * d.TILE;
  player.y = 156 * d.TILE;
  runtime.spawnMonster("frostDragon", 108 * d.TILE, 156 * d.TILE);
  const behaviorFrostDragon = state.monsters.find((monster) => monster.type === "frostDragon");
  behaviorFrostDragon.hp = behaviorFrostDragon.hpMax * 0.4;
  runtime.updateMonsters(16);
  assert(behaviorFrostDragon.enraged && behaviorFrostDragon.summoned, "frost dragon should enrage and call frost reinforcements below half HP");
  assert(state.monsters.some((monster) => monster.type === "frostMoth") && state.monsters.some((monster) => monster.type === "frostBeast"), "frost dragon should summon both frost enemy behaviors");
  behaviorFrostDragon.patternCooldown = 0;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(behaviorFrostDragon.patternState === "windup" && state.telegraphs.some((entry) => entry.kind === "line"), "frost dragon should telegraph its advanced boss pattern");
  behaviorFrostDragon.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.pattern === "frostLance" && projectile.piercing), "frost dragon should fire a piercing ice lance after its warning");
  state.monsters = [];
  state.projectiles = [];

  player.x = 78 * d.TILE;
  player.y = 140 * d.TILE;
  runtime.spawnMonster("voidDragon", 80 * d.TILE, 140 * d.TILE);
  const behaviorVoidDragon = state.monsters.find((monster) => monster.type === "voidDragon");
  behaviorVoidDragon.patternCooldown = 0;
  runtime.updateMonsters(16);
  assert(behaviorVoidDragon.patternState === "windup" && state.telegraphs.filter((entry) => entry.kind === "zone").length === 3, "void dragon should mark three delayed danger zones");
  behaviorVoidDragon.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.pattern === "voidZone" && projectile.persistent), "void dragon danger zones should persist after activation");
  state.monsters = [];
  state.projectiles = [];

  globalThis.DRAGON_HUNTER_UI.openWorldMap(contexts.ui());
  assert(state.worldMapOpen && !state.inventoryOpen && !state.shopOpen, "world map should open as an exclusive paused overlay");
  globalThis.DRAGON_HUNTER_UI.closeWorldMap(contexts.ui());
  assert(!state.worldMapOpen, "world map should close cleanly");

  assert(runtime.inTownTile(102, 58), "ash hamlet should be a safe-zone tile");
  assert(runtime.inTownTile(102, 116), "moon camp should be a safe-zone tile");
  assert(runtime.inTownTile(98, 132), "black fort should be a safe-zone tile");
  assert(runtime.inTownTile(35, 135), "black market should be a safe-zone tile");
  assert(runtime.inTownTile(20, 140) && runtime.inTownTile(47, 137), "expanded Black Market city districts should remain safe");
  assert(runtime.inTownTile(150, 85) && runtime.inTownTile(168, 169), "east island harbor and cape outpost should be safe zones");
  assert(runtime.inTownTile(24, 154), "Frost Haven should be a safe-zone tile");
  player.x = 116 * d.TILE;
  player.y = 65 * d.TILE;
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "western-ferry"));
  assert(Math.floor(player.x / d.TILE) === 139 && Math.floor(player.y / d.TILE) === 87, "western ferry should reach the east island harbor");
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "east-ferry"));
  assert(Math.floor(player.x / d.TILE) === 116 && Math.floor(player.y / d.TILE) === 65, "east ferry should return to the western continent");
  runtime.ui.zone = { textContent: "" };
  player.x = 24 * d.TILE;
  player.y = 154 * d.TILE;
  globalThis.DRAGON_HUNTER_UI.updateZone(contexts.ui());
  assert(runtime.ui.zone.textContent === "白銀宿", "Frost Haven should have its own visible zone name");
  player.x = 42 * d.TILE;
  player.y = 147 * d.TILE;
  globalThis.DRAGON_HUNTER_UI.updateZone(contexts.ui());
  assert(runtime.ui.zone.textContent === "霜原", "Frost Frontier should not be mislabeled as Black Sun Castle");
  player.hp = 5;
  player.x = 24 * d.TILE;
  player.y = 154 * d.TILE;
  runtime.updateHealCircle();
  assert(player.hp === player.hpMax, "Frost Haven heal circle should fully heal");
  state.healCooldown = 0;
  player.hp = 5;
  player.x = 102 * d.TILE;
  player.y = 58 * d.TILE;
  runtime.updateHealCircle();
  assert(player.hp === player.hpMax, "ash hamlet heal circle should fully heal");
  player.stamina = player.staminaMax;

  const ashFrontier = state.npcs.find((entry) => entry.type === "frontier" && entry.x > 90 * d.TILE);
  assert(ashFrontier, "ash hamlet frontier NPC should exist");
  state.ashKnightDefeated = true;
  player.gold = d.weaponCosts[8] + d.armorCosts[8] + d.shieldCosts[3];
  openNpcShop(runtime, state, ashFrontier);
  buyShopRow(runtime, state, (row) => row.type === "weapon" && row.id === 8, "ash hamlet weapon should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "armor" && row.id === 8, "ash hamlet armor should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "shield" && row.id === 3, "ash hamlet shield should be selectable");
  assert(player.ownedWeapons.includes(8) && player.ownedArmors.includes(8) && player.ownedShields.includes(3), "ash hamlet should sell star gear and shield after ash knight defeat");

  const moonFrontier = state.npcs.find((entry) => entry.type === "frontier" && entry.y > 110 * d.TILE);
  assert(moonFrontier, "moon camp frontier NPC should exist");
  state.discoveries.add("eclipse-seal");
  player.hp = player.hpMax;
  player.stamina = player.staminaMax;
  player.gold = d.weaponCosts[9] + d.armorCosts[9] + d.shieldCosts[3];
  runtime.closeShop();
  openNpcShop(runtime, state, moonFrontier);
  buyShopRow(runtime, state, (row) => row.type === "weapon" && row.id === 9, "moon camp weapon should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "armor" && row.id === 9, "moon camp armor should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "shield" && row.id === 3, "moon camp shield should be selectable");
  assert(player.ownedWeapons.includes(9) && player.ownedArmors.includes(9) && player.ownedShields.includes(3), "moon camp should sell eclipse gear and shields after seal discovery");
  player.gold = 1200;
  buyShopRow(runtime, state, (row) => row.type === "accessory" && row.id === "eclipse", "moon camp accessory should be selectable");
  assert(player.ownedAccessories.includes("eclipse"), "moon camp should grant eclipse accessory after gear");

  const blackFortFrontier = state.npcs.find((entry) => entry.type === "frontier" && entry.y > 128 * d.TILE);
  assert(blackFortFrontier, "black fort frontier NPC should exist");
  state.discoveries.add("void-seal");
  state.chests.add("black-fort-armory");
  player.hp = player.hpMax;
  player.stamina = player.staminaMax;
  player.gold = d.weaponCosts[10] + d.armorCosts[10] + d.shieldCosts[4];
  runtime.closeShop();
  openNpcShop(runtime, state, blackFortFrontier);
  buyShopRow(runtime, state, (row) => row.type === "weapon" && row.id === 10, "black fort weapon should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "armor" && row.id === 10, "black fort armor should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "shield" && row.id === 4, "black fort shield should be selectable");
  assert(player.ownedWeapons.includes(10) && player.ownedArmors.includes(10) && player.ownedShields.includes(4), "black fort should sell black sun gear and shield after void seal discovery");
  player.gold = 1800;
  buyShopRow(runtime, state, (row) => row.type === "accessory" && row.id === "void", "black fort accessory should be selectable");
  assert(player.ownedAccessories.includes("void"), "black fort should grant void accessory after gear");

  const merchant = state.npcs.find((entry) => entry.type === "merchant");
  assert(merchant, "black market merchant NPC should exist");
  state.obsidianGolemDefeated = true;
  player.gold = d.weaponCosts[11] + d.armorCosts[11] + d.shieldCosts[5] + 2600;
  runtime.closeShop();
  openNpcShop(runtime, state, merchant);
  buyShopRow(runtime, state, (row) => row.type === "weapon" && row.id === 11, "black market weapon should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "armor" && row.id === 11, "black market armor should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "shield" && row.id === 5, "black market shield should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "accessory" && row.id === "obsidian", "black market accessory should be selectable");
  assert(player.ownedWeapons.includes(11) && player.ownedArmors.includes(11) && player.ownedShields.includes(5), "black market should sell obsidian gear after golem defeat");
  assert(player.ownedAccessories.includes("obsidian"), "black market should sell obsidian accessory after golem defeat");
  player.gold = 2500;
  buyShopRow(runtime, state, (row) => row.type === "item" && row.id === "elixir", "black market should sell elixir supplies");
  buyShopRow(runtime, state, (row) => row.type === "item" && row.id === "warp", "black market should sell return bells");
  assert(player.elixirs >= 2 && player.warps >= 2, "black market premium items should enter inventory");

  const frostFrontier = state.npcs.find((entry) => entry.type === "frontier" && entry.y > 144 * d.TILE);
  assert(frostFrontier, "Frost Haven frontier NPC should exist");
  state.chapter3Reported = true;
  player.hp = player.hpMax;
  player.stamina = player.staminaMax;
  player.gold = d.weaponCosts[12] + d.armorCosts[12] + d.shieldCosts[6] + 2000;
  runtime.closeShop();
  openNpcShop(runtime, state, frostFrontier);
  buyShopRow(runtime, state, (row) => row.type === "weapon" && row.id === 12, "Frost Haven weapon should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "armor" && row.id === 12, "Frost Haven armor should be selectable");
  buyShopRow(runtime, state, (row) => row.type === "shield" && row.id === 6, "Frost Haven shield should be selectable");
  assert(player.ownedWeapons.includes(12) && player.ownedArmors.includes(12) && player.ownedShields.includes(6), "Frost Haven should sell complete frost-route gear");

  const frostSmith = state.npcs.find((entry) => entry.type === "frostSmith");
  assert(frostSmith, "Frost Haven shield artisan should exist");
  player.shield = 6;
  player.gold = d.shieldRuneData.bastion.cost + d.shieldRuneData.stride.cost + d.shieldRuneData.counter.cost;
  runtime.closeShop();
  openNpcShop(runtime, state, frostSmith);
  const lockedCounter = state.shopRows.find((row) => row.type === "shieldRune" && row.id === "counter");
  assert(lockedCounter && lockedCounter.available === false, "counter rune should be locked before Frost Golem defeat");
  buyShopRow(runtime, state, (row) => row.type === "shieldRune" && row.id === "bastion", "bastion rune should be selectable");
  const bastionFront = runtime.armorDamageMultiplier({ type: "frostBeast" }, 0.8, "contact");
  player.shieldRune = "";
  const plainFront = runtime.armorDamageMultiplier({ type: "frostBeast" }, 0.8, "contact");
  assert(bastionFront < plainFront, "bastion rune should further reduce frontal contact damage");
  runtime.closeShop();
  openNpcShop(runtime, state, frostSmith);
  buyShopRow(runtime, state, (row) => row.type === "shieldRune" && row.id === "stride", "stride rune should be selectable");
  const strideSpeed = runtime.playerMoveSpeed();
  const strideDash = runtime.dashCost();
  player.shieldRune = "";
  assert(strideSpeed > runtime.playerMoveSpeed() && strideDash < runtime.dashCost(), "stride rune should improve shield traversal tempo");
  state.frostGolemDefeated = true;
  runtime.closeShop();
  openNpcShop(runtime, state, frostSmith);
  buyShopRow(runtime, state, (row) => row.type === "shieldRune" && row.id === "counter", "counter rune should unlock after Frost Golem defeat");
  assert(runtime.shieldRuneCounterDamage(0.8) > 0 && runtime.shieldRuneCounterDamage(-0.2) === 0, "counter rune should retaliate only on frontal contact");

  const porter = state.npcs.find((entry) => entry.type === "porter");
  assert(porter, "porter NPC should exist for base travel");
  state.elderReported = true;
  player.gold = 500;
  runtime.closeShop();
  openNpcShop(runtime, state, porter);
  buyShopRow(runtime, state, (row) => row.type === "travel" && row.id === "ash-hamlet", "porter should offer unlocked base travel");
  assert(Math.floor(player.x / d.TILE) === 102 && Math.floor(player.y / d.TILE) === 58, "porter travel should move player to selected base");

  state.inventoryOpen = true;
  state.inventoryTab = "weapons";
  const weaponRows = globalThis.DRAGON_HUNTER_UI.inventoryRows(contexts.ui());
  assert(weaponRows.some((row) => row.id === 8 && /ATK/.test(row.detail) && /\(/.test(row.detail)), "weapon inventory rows should show ATK comparison");
  state.inventoryTab = "armors";
  const armorRows = globalThis.DRAGON_HUNTER_UI.inventoryRows(contexts.ui());
  assert(armorRows.some((row) => row.id === 8 && /DEF/.test(row.detail) && /\(/.test(row.detail)), "armor inventory rows should show DEF comparison");
  const memoPages = globalThis.DRAGON_HUNTER_UI.statsPanelPages(contexts.ui());
  assert(memoPages.some((page) => page.title === "旅メモ" && page.lines.some((line) => /召喚士|黒市|古塔/.test(line))), "status panel should include travel memo guidance");

  const reward = createRuntime();
  reward.runtime.grantChestReward("ashGear");
  assert(reward.player.ownedWeapons.includes(8) && reward.player.ownedArmors.includes(8), "ashGear chest should grant star gear inventory");
  reward.runtime.grantChestReward("moonRelic");
  assert(reward.player.ownedWeapons.includes(8) && reward.player.ownedArmors.includes(8) && reward.player.wards >= 4, "moonRelic chest should reinforce star gear and wards");
  reward.runtime.grantChestReward("moonSupply");
  assert(reward.player.bombs >= 3 && reward.player.wards >= 7, "moonSupply chest should add late expedition supplies");
  reward.runtime.grantChestReward("summonerSupply");
  assert(reward.player.tonics >= 2 && reward.player.warps >= 1 && reward.player.bombs >= 5, "summonerSupply should add route-extension supplies");
  reward.runtime.grantChestReward("trapSupply");
  assert(reward.player.tonics >= 3 && reward.player.warps >= 2 && reward.player.wards >= 9, "trapSupply should add trap-route survival supplies");
  reward.runtime.grantDiscoveryReward({ id: "test-trap", kind: "trapHint" }, 0, 0);
  assert(reward.player.wards >= 9, "trap hint should provide a ward and warning reward");
  reward.runtime.grantDiscoveryReward({ id: "test-waystone", kind: "waystone" }, 0, 0);
  assert(reward.player.wards >= 8 && reward.player.stamina === reward.player.staminaMax, "waystone discovery should restore stamina and add a ward");
  reward.runtime.grantChestReward("eclipseGear");
  assert(reward.player.ownedWeapons.includes(9) && reward.player.ownedArmors.includes(9), "eclipseGear chest should grant eclipse gear");
  reward.runtime.grantChestReward("eclipseSupply");
  assert(reward.player.ownedAccessories.includes("eclipse") && reward.player.wards >= 9, "eclipseSupply chest should grant eclipse accessory and wards");
  reward.runtime.grantDiscoveryReward({ id: "test-eclipse", kind: "eclipseSeal" }, 0, 0);
  assert(reward.player.wards >= 9 && reward.player.stamina === reward.player.staminaMax, "eclipse seal discovery should support chapter 2 route");
  reward.runtime.grantChestReward("voidGear");
  assert(reward.player.ownedWeapons.includes(10) && reward.player.ownedArmors.includes(10), "voidGear chest should grant black sun gear");
  reward.runtime.grantChestReward("voidSupply");
  assert(reward.player.ownedAccessories.includes("void") && reward.player.wards >= 9, "voidSupply chest should grant void accessory and wards");
  reward.runtime.grantDiscoveryReward({ id: "test-void", kind: "voidSeal" }, 0, 0);
  assert(reward.player.wards >= 9 && reward.player.stamina === reward.player.staminaMax, "void seal discovery should support chapter 3 route");
  reward.runtime.grantChestReward("obsidianGear");
  assert(!reward.player.ownedWeapons.includes(11) && !reward.player.ownedArmors.includes(11), "obsidianGear chest should not bypass black market obsidian gear purchase");
  assert(reward.player.ownedAccessories.includes("obsidian") && reward.player.elixirs >= 2 && reward.player.warps >= 1, "obsidianGear chest should grant obsidian accessory and premium supplies");
  reward.runtime.grantChestReward("obsidianSupply");
  assert(reward.player.elixirs >= 3 && reward.player.tonics >= 4 && reward.player.warps >= 2, "obsidianSupply chest should add route-extension supplies");
  reward.runtime.grantChestReward("smugglerSupply");
  assert(reward.player.warps >= 3 && reward.player.bombs >= 4, "smugglerSupply should add shortcut-route supplies");

  const guardedChest = createRuntime();
  const regenChest = d.TREASURE_CHESTS.find((chest) => chest.id === "regen-cave-ring");
  assert(regenChest, "greater regen cave chest should exist");
  guardedChest.runtime.openChest(regenChest);
  assert(!guardedChest.state.chests.has("regen-cave-ring") && !guardedChest.player.ownedAccessories.includes("greaterRegen"), "greater regen chest should stay locked until its guardian is defeated");
  guardedChest.state.regenSentinelDefeated = true;
  guardedChest.runtime.openChest(regenChest);
  assert(guardedChest.state.chests.has("regen-cave-ring") && guardedChest.player.ownedAccessories.includes("greaterRegen"), "greater regen chest should open after Regen Sentinel defeat");

  const mistChest = d.TREASURE_CHESTS.find((chest) => chest.id === "mist-shrine-cache");
  assert(mistChest, "mist shrine accessory chest should exist");
  const guardedMistChest = createRuntime();
  guardedMistChest.runtime.openChest(mistChest);
  assert(!guardedMistChest.state.chests.has("mist-shrine-cache") && !guardedMistChest.player.ownedAccessories.includes("mist"), "mist shrine cache should stay locked until Mist Keeper is defeated");
  guardedMistChest.state.mistKeeperDefeated = true;
  guardedMistChest.runtime.openChest(mistChest);
  assert(guardedMistChest.state.chests.has("mist-shrine-cache") && guardedMistChest.player.ownedAccessories.includes("mist"), "mist shrine cache should open after Mist Keeper defeat");

  const cryptChest = d.TREASURE_CHESTS.find((chest) => chest.id === "undercity-reliquary");
  assert(cryptChest, "catacomb reliquary should exist");
  const guardedCryptChest = createRuntime();
  guardedCryptChest.runtime.openChest(cryptChest);
  assert(!guardedCryptChest.state.chests.has("undercity-reliquary") && !guardedCryptChest.player.ownedAccessories.includes("deepLamp"), "catacomb reliquary should stay locked until Crypt Warden defeat");
  guardedCryptChest.state.cryptWardenDefeated = true;
  guardedCryptChest.runtime.openChest(cryptChest);
  assert(guardedCryptChest.state.chests.has("undercity-reliquary") && guardedCryptChest.player.ownedAccessories.includes("deepLamp"), "catacomb reliquary should open after Crypt Warden defeat");

  const frostChest = d.TREASURE_CHESTS.find((chest) => chest.id === "frost-core-reliquary");
  assert(frostChest, "frost core reliquary should exist");
  const guardedFrostChest = createRuntime();
  guardedFrostChest.runtime.openChest(frostChest);
  assert(!guardedFrostChest.state.chests.has("frost-core-reliquary") && !guardedFrostChest.player.ownedAccessories.includes("frost"), "frost reliquary should stay locked until Frost Golem defeat");
  guardedFrostChest.state.frostGolemDefeated = true;
  guardedFrostChest.runtime.openChest(frostChest);
  assert(guardedFrostChest.state.chests.has("frost-core-reliquary") && guardedFrostChest.player.ownedAccessories.includes("frost"), "frost reliquary should open after Frost Golem defeat");

  const towerChest = d.TREASURE_CHESTS.find((chest) => chest.id === "frost-tower-reliquary");
  assert(towerChest, "frost tower reliquary should exist");
  const guardedTowerChest = createRuntime();
  guardedTowerChest.runtime.openChest(towerChest);
  assert(!guardedTowerChest.state.chests.has("frost-tower-reliquary") && !guardedTowerChest.player.ownedAccessories.includes("sky"), "tower reliquary should stay locked until Tower Warden defeat");
  guardedTowerChest.state.towerWardenDefeated = true;
  guardedTowerChest.runtime.openChest(towerChest);
  assert(guardedTowerChest.state.chests.has("frost-tower-reliquary") && guardedTowerChest.player.ownedAccessories.includes("sky"), "tower reliquary should grant the sky accessory after Tower Warden defeat");

  const regenBefore = reward.runtime.regenRate();
  reward.runtime.grantChestReward("greaterRegen");
  globalThis.DRAGON_HUNTER_REWARDS.equipAccessory(reward.player, "greaterRegen");
  reward.runtime.refreshDerivedStats();
  assert(reward.player.ownedAccessories.includes("greaterRegen") && reward.runtime.regenRate() > regenBefore && reward.player.warps >= 3, "greaterRegen chest should grant the large regen accessory and return supplies");
  reward.runtime.grantChestReward("mistSupply");
  assert(reward.player.tonics >= 5 && reward.player.warps >= 4 && reward.player.bombs >= 6, "mist shrine supply should add route-extension supplies");
  reward.runtime.grantChestReward("mistCharm");
  assert(reward.player.ownedAccessories.includes("mist") && reward.player.warps >= 5, "mist shrine cache should grant the mist accessory");
  reward.runtime.grantChestReward("cryptSupply");
  assert(reward.player.elixirs >= 4 && reward.player.tonics >= 7, "catacomb supply should support a long interior expedition");
  reward.runtime.grantChestReward("deepLamp");
  assert(reward.player.ownedAccessories.includes("deepLamp"), "catacomb reliquary should grant the deep lamp accessory");
  reward.player.equippedAccessories = ["deepLamp"];
  reward.player.equippedAccessory = "deepLamp";
  reward.runtime.refreshDerivedStats();
  reward.player.slow = 1000;
  const lampSlowSpeed = reward.runtime.playerMoveSpeed();
  reward.player.equippedAccessories = [];
  reward.player.equippedAccessory = "";
  reward.runtime.refreshDerivedStats();
  const normalSlowSpeed = reward.runtime.playerMoveSpeed();
  assert(lampSlowSpeed > normalSlowSpeed, "deep lamp should reduce slow movement penalty");
  reward.player.equippedAccessories = ["deepLamp"];
  reward.player.equippedAccessory = "deepLamp";
  reward.player.hpMax = 500;
  reward.player.hp = 1;
  reward.player.potions = 1;
  reward.player.selectedItem = "potion";
  const hpBeforeLampPotion = reward.player.hp;
  reward.runtime.useSelectedItem();
  assert(reward.player.hp - hpBeforeLampPotion > 30 + reward.player.level * 6, "deep lamp should strengthen herb healing");
  reward.runtime.grantChestReward("frostSupply");
  assert(reward.player.elixirs >= 5 && reward.player.warps >= 5, "frost supply should extend the new region expedition");
  reward.runtime.grantChestReward("frostCharm");
  assert(reward.player.ownedAccessories.includes("frost"), "ice cave reliquary should grant the frost accessory");
  reward.runtime.grantChestReward("towerExpeditionSupply");
  assert(reward.player.tonics >= 9 && reward.player.warps >= 6, "frost tower supply should support the two-floor expedition");
  reward.runtime.grantChestReward("skyCharm");
  assert(reward.player.ownedAccessories.includes("sky"), "frost tower reliquary should grant the sky accessory");

  const normalDash = createRuntime();
  normalDash.player.x = 24 * d.TILE;
  normalDash.player.y = 148 * d.TILE;
  normalDash.player.dir = "right";
  normalDash.player.stamina = normalDash.player.staminaMax;
  const normalDashStart = normalDash.player.x;
  normalDash.runtime.dash();
  const normalDashDistance = normalDash.player.x - normalDashStart;
  const skyDash = createRuntime();
  skyDash.player.x = 24 * d.TILE;
  skyDash.player.y = 148 * d.TILE;
  skyDash.player.dir = "right";
  skyDash.player.skyCharm = true;
  skyDash.player.ownedAccessories = ["sky"];
  skyDash.player.equippedAccessory = "sky";
  skyDash.player.equippedAccessories = ["sky"];
  skyDash.player.stamina = skyDash.player.staminaMax;
  const skyDashStart = skyDash.player.x;
  skyDash.runtime.dash();
  assert(skyDash.player.x - skyDashStart > normalDashDistance && skyDash.player.dashCooldown < normalDash.player.dashCooldown, "sky accessory should extend dash distance and shorten cooldown");
  reward.player.armor = 0;
  reward.player.equippedAccessories = ["frost"];
  reward.player.equippedAccessory = "frost";
  const frostGuardedDamage = reward.runtime.armorDamageMultiplier({ type: "frostMoth" }, 0.2, "frost");
  reward.player.equippedAccessories = [];
  reward.player.equippedAccessory = "";
  const frostUnguardedDamage = reward.runtime.armorDamageMultiplier({ type: "frostMoth" }, 0.2, "frost");
  assert(frostGuardedDamage < frostUnguardedDamage, "frost charm should reduce frost-route damage when equipped");
  reward.runtime.grantChestReward("shieldGear");
  assert(reward.player.ownedShields.includes(3), "shieldGear chest should grant a route shield");
  reward.runtime.grantChestReward("blackShieldSupply");
  assert(reward.player.ownedShields.includes(4) && reward.player.elixirs >= 4, "blackShieldSupply should grant black-route shield supplies");
  reward.runtime.grantDiscoveryReward({ id: "test-route-hint", kind: "routeHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-shortcut-hint", kind: "shortcutHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-smuggler-hint", kind: "smugglerHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-greater-regen-hint", kind: "greaterRegenHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-mist-hint", kind: "mistHint" }, 0, 0);
  assert(reward.player.warps >= 5 && reward.player.tonics >= 6 && reward.player.wards >= 9, "route, shortcut, and cave hints should provide travel supplies");
  reward.runtime.grantChestReward("blackMarketSupply");
  assert(reward.player.potions >= 4 && reward.player.bombs >= 3 && reward.player.wards >= 9 && reward.player.warps >= 3, "blackMarketSupply chest should add deep-route supplies");
  return { ashRegion: "ash", towerRegion: "tower", moonRegion: "moon", eclipseRegion: "eclipse", undercityRegion: "undercity", obsidianRegion: "obsidian", voidRegion: "void", frostRegion: "frost", blackSunGear: true, frostGear: true };
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
  const expanded = assertExpandedWorldContent();

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

  console.log(JSON.stringify({ ok: true, map, save, inventory, story, mine, camp, expanded, scriptLoad }, null, 2));
}

main();
