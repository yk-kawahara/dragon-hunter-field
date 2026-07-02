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
    updatePlayer: (dt) => playerHelpers.updatePlayer(contexts.player(), dt),
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
    ["grassland-camp", 35, 35],
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
    ["moon-cavern-entry", 92, 103],
    ["moon-cavern-mid-cache", 136, 34],
    ["moon-cavern-exit-cache", 145, 38],
    ["moon-cavern-exit-note", 148, 38],
    ["moon-cavern-gatekeeper", d.MOON_CAVERN_GATEKEEPER_SITE.x, d.MOON_CAVERN_GATEKEEPER_SITE.y],
    ["moon-cavern-reliquary", 153, 41],
    ["moon-cavern-east-exit", 153, 43],
    ["moon-camp", 102, 116],
    ["moon-archive-entry", 110, 115],
    ["moon-archive", 130, 4],
    ["archiveWarden", d.MOON_ARCHIVE_WARDEN_SITE.x, d.MOON_ARCHIVE_WARDEN_SITE.y],
    ["moon-archive-reliquary", 151, 17],
    ["eclipse-seal", 82, 121],
    ["eclipseDragon", d.ECLIPSE_DRAGON_SITE.x, d.ECLIPSE_DRAGON_SITE.y],
    ["black-fort", 98, 132],
    ["black-market", 35, 135],
    ["old-tower-side-cache", 97, 92],
    ["obsidianGolem", d.OBSIDIAN_GOLEM_SITE.x, d.OBSIDIAN_GOLEM_SITE.y],
    ["black-gate-road-post", 63, 134],
    ["black-gate-forward-cache", 68, 134],
    ["black-gate-lookout", 84, 132],
    ["black-gate-final-cache", 86, 132],
    ["black-gate-shield-cache", 73, 134],
    ["void-seal", 82, 138],
    ["voidDragon", d.VOID_DRAGON_SITE.x, d.VOID_DRAGON_SITE.y],
    ["black-market-catacomb-entry", 47, 130],
    ["cryptWarden", d.CRYPT_WARDEN_SITE.x, d.CRYPT_WARDEN_SITE.y],
    ["frost-haven", 24, 154],
    ["frost-haven-approach-cache", 40, 149],
    ["frost-haven-approach-post", 42, 149],
    ["frost-cave", d.FROST_GOLEM_SITE.x, d.FROST_GOLEM_SITE.y],
    ["frost-seal", 103, 154],
    ["frostDragon", d.FROST_DRAGON_SITE.x, d.FROST_DRAGON_SITE.y],
    ["solarWarden", d.SOLAR_WARDEN_SITE.x, d.SOLAR_WARDEN_SITE.y],
    ["suncrest-approach-cache", 234, 116],
    ["suncrest-approach-post", 235, 117],
    ["suncrest-arena-entry", 229, 131],
    ["suncrest-arena-supply", 205, 8],
    ["suncrestChampion", d.SUNCREST_CHAMPION_SITE.x, d.SUNCREST_CHAMPION_SITE.y],
    ["suncrest-arena-reliquary", 216, 18],
    ["sunspire-entry", 246, 128],
    ["sunspire-observatory", 180, 10],
    ["sunspireKeeper", d.SUNSPIRE_KEEPER_SITE.x, d.SUNSPIRE_KEEPER_SITE.y],
    ["sunspire-reliquary", 190, 17],
    ["emberDragon", d.EMBER_DRAGON_SITE.x, d.EMBER_DRAGON_SITE.y],
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
    ["dawn-harbor", 214, 72],
    ["sunrise-north-ruin", 236, 44],
    ["sunrise-valley-shrine", 211, 110],
    ["suncrest-city", 238, 128],
    ["suncrest-west-gate-sign", 225, 130],
    ["suncrest-east-gate-sign", 249, 130],
    ["suncrest-south-gate-sign", 241, 133],
    ["ember-sanctum", 222, 226],
  ];
  const unreachable = goals.filter(([, x, y]) => !seen.has(`${x},${y}`));
  assert(unreachable.length === 0, `unreachable map goals: ${JSON.stringify(unreachable)}`);
  assert(d.MAP_W === 256 && d.MAP_H === 256, "expanded RPG world should be 256x256");
  const overviewRows = globalThis.DRAGON_HUNTER_WORLD_MAP?.overviewRows;
  assert(Array.isArray(overviewRows) && overviewRows.length === d.MAP_H, "world overview should cover the full continental map");
  assert(overviewRows.every((row) => typeof row === "string" && row.length === d.MAP_W), "world overview rows should match map dimensions");
  assert(!overviewRows.slice(1, 15).some((row) => row.slice(80, 120).includes("_")), "world overview should hide embedded catacomb room layouts");
  assert(!overviewRows.slice(1, 22).some((row) => row.slice(122, 157).includes("_")), "world overview should hide embedded Moon Archive room layouts");
  assert(!overviewRows.slice(24, 46).some((row) => row.slice(122, 157).includes("_")), "world overview should hide embedded Moon Cavern room layouts");
  assert(!overviewRows.slice(1, 23).some((row) => row.slice(198, 227).includes("_")), "world overview should hide embedded Suncrest Arena room layouts");
  assert(state.npcs.length === 125, "expected 125 NPCs after the grassland camp service pass");
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
  player.horizonCharm = true;
  player.prismLensCharm = true;
  player.duelistCharm = true;
  player.ownedAccessories = ["hunter", "regen", "greaterRegen", "trail", "aegis", "mine", "mist", "eclipse", "void", "obsidian", "deepLamp", "frost", "sky", "horizon", "prismLens", "duelist"];
  player.equippedAccessory = "trail";
  player.equippedAccessories = ["trail", "greaterRegen"];
  state.chests.add("town-cache");
  state.chests.add("north-ruin");
  state.chests.add("south-outpost");
  state.discoveries.add("river-spring");
  state.discoveries.add("hunter-cache");
  state.discoveries.add("moon-cavern-way-shrine");
  state.discoveries.add("black-market-expedition-board");
  state.discoveries.add("frost-cave-brazier");
  state.guardianDefeated = true;
  state.spawnedGuardian = true;
  state.wardenDefeated = true;
  state.spawnedWarden = true;
  state.ashKnightDefeated = true;
  state.spawnedAshKnight = true;
  state.moonGatekeeperDefeated = true;
  state.spawnedMoonGatekeeper = true;
  state.archiveWardenDefeated = true;
  state.spawnedArchiveWarden = true;
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
  state.solarWardenDefeated = true;
  state.spawnedSolarWarden = true;
  state.suncrestChampionDefeated = true;
  state.spawnedSuncrestChampion = true;
  state.sunspireKeeperDefeated = true;
  state.spawnedSunspireKeeper = true;
  state.emberDragonDefeated = true;
  state.spawnedEmberDragon = true;
  state.chapter5Reported = true;
  state.bossDefeated = true;
  state.spawnedBoss = true;
  state.elderReported = true;
  state.arrivedSafeBases.add("moon-camp");
  state.arrivedSafeBases.add("suncrest-city");
  player.expeditionBlessing = "ember";
  player.expeditionBlessingTime = 123456;
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
  assert(restored.player.horizonCharm, "horizon charm should persist");
  assert(restored.player.prismLensCharm, "prism lens charm should persist");
  assert(restored.player.duelistCharm, "duelist charm should persist");
  assert(restored.player.expeditionBlessing === "ember" && restored.player.expeditionBlessingTime === 123456, "active expedition preparation should persist with its remaining time");
  assert(JSON.stringify(restored.player.ownedWeapons) === JSON.stringify([0, 1, 2, 3]), "owned weapons should persist");
  assert(JSON.stringify(restored.player.ownedArmors) === JSON.stringify([0, 1, 2, 3]), "owned armors should persist");
  assert(JSON.stringify(restored.player.ownedShields) === JSON.stringify([0, 1, 2]), "owned shields should persist");
  assert(restored.player.ownedAccessories.includes("trail") && restored.player.ownedAccessories.includes("greaterRegen") && restored.player.ownedAccessories.includes("mine") && restored.player.ownedAccessories.includes("mist") && restored.player.ownedAccessories.includes("eclipse") && restored.player.ownedAccessories.includes("void") && restored.player.ownedAccessories.includes("obsidian") && restored.player.ownedAccessories.includes("deepLamp") && restored.player.ownedAccessories.includes("frost") && restored.player.ownedAccessories.includes("sky") && restored.player.ownedAccessories.includes("horizon") && restored.player.ownedAccessories.includes("prismLens") && restored.player.ownedAccessories.includes("duelist"), "owned accessories should persist");
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
  assert(restored.state.discoveries.size === 5 && restored.state.discoveries.has("moon-cavern-way-shrine") && restored.state.discoveries.has("black-market-expedition-board") && restored.state.discoveries.has("frost-cave-brazier"), "discoveries, spent route recovery points, and the expedition board reward should persist");
  assert(restored.state.wardenDefeated, "warden defeat flag should persist");
  assert(restored.state.ashKnightDefeated, "ash knight defeat flag should persist");
  assert(restored.state.moonGatekeeperDefeated && !restored.state.spawnedMoonGatekeeper, "Moon Gatekeeper defeat should persist without restoring a live encounter");
  assert(restored.state.archiveWardenDefeated, "archive warden defeat flag should persist");
  assert(restored.state.smugglerCaptainDefeated, "smuggler captain defeat flag should persist");
  assert(restored.state.regenSentinelDefeated, "regen sentinel defeat flag should persist");
  assert(restored.state.mistKeeperDefeated, "mist keeper defeat flag should persist");
  assert(restored.state.cryptWardenDefeated, "crypt warden defeat flag should persist");
  assert(restored.state.frostGolemDefeated, "frost golem defeat flag should persist");
  assert(restored.state.towerWardenDefeated, "frost tower warden defeat flag should persist");
  assert(restored.state.frostDragonDefeated && restored.state.chapter4Reported, "chapter 4 flags should persist");
  assert(restored.state.solarWardenDefeated && restored.state.suncrestChampionDefeated && restored.state.sunspireKeeperDefeated && restored.state.emberDragonDefeated && restored.state.chapter5Reported, "chapter 5 flags should persist");
  assert(restored.state.eclipseDragonDefeated && restored.state.chapter2Reported, "chapter 2 flags should persist");
  assert(restored.state.voidDragonDefeated && restored.state.chapter3Reported, "chapter 3 flags should persist");
  assert(restored.state.obsidianGolemDefeated, "obsidian golem defeat flag should persist");
  assert(restored.state.guardianDefeated && restored.state.bossDefeated && restored.state.elderReported, "boss/clear flags should persist");
  assert(!restored.state.spawnedBoss && !restored.state.spawnedEmberDragon && !restored.state.spawnedFrostDragon && !restored.state.spawnedVoidDragon && !restored.state.spawnedEclipseDragon, "defeated bosses should not restore as spawned encounters");
  assert(restored.state.arrivedSafeBases.has("village") && restored.state.arrivedSafeBases.has("moon-camp") && restored.state.arrivedSafeBases.has("suncrest-city"), "safe base first-arrival flags should persist");

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
  localStorage.setItem(d.SAVE_KEY, JSON.stringify({
    player: { hp: 60, hpMax: 60, level: 18, xp: 0, xpNext: 100, gold: 100, weapon: 8, armor: 8 },
    chests: ["moon-cavern-reliquary"],
  }));
  const migratedMoonCavern = createRuntime();
  assert(migratedMoonCavern.runtime.loadGame(), "pre-Gatekeeper Moon Cavern save should migrate");
  assert(migratedMoonCavern.state.moonGatekeeperDefeated, "existing Moon Cavern relic owners should not be forced to refight the new Gatekeeper");
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
  dragon.patternCooldown = 0;
  dragon.fireCooldown = 0;
  state.telegraphs = [];
  state.projectiles = [];
  runtime.updateMonsters(16);
  assert(dragon.patternKind === "dragonBreath" && state.telegraphs.some((entry) => entry.kind === "line"), "Red Dragon should open with a readable three-volley breath line");
  dragon.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.filter((projectile) => projectile.pattern === "dragonBreath").length === 3, "Red Dragon breath wave should fire three separated flames");
  dragon.patternWaveCooldown = 0;
  runtime.updateMonsters(16);
  dragon.patternWaveCooldown = 0;
  runtime.updateMonsters(16);
  assert(dragon.patternState === "idle", "Red Dragon breath sequence should finish after three volleys");
  state.telegraphs = [];
  state.projectiles = [];
  dragon.patternCooldown = 0;
  runtime.updateMonsters(16);
  assert(dragon.patternKind === "dragonFirePools" && state.telegraphs.filter((entry) => entry.kind === "zone").length === 3, "Red Dragon should alternate into three warned fire-pool zones");
  dragon.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.pattern === "dragonFirePool" && projectile.persistent), "Red Dragon fire pools should persist after their warning");
  runtime.spawnMonster("dragon", 51 * d.TILE + d.TILE, 14 * d.TILE);
  dragon.hp = 0;
  runtime.updateMonsters(16);
  assert(state.bossDefeated && state.victory, "Dragon defeat should set victory state");
  assert(!state.spawnedBoss && !state.monsters.some((monster) => monster.type === "dragon"), "Red Dragon defeat should clear duplicate live dragons in the same update");

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
  player.level = d.MOON_ARCHIVE_WARDEN_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.MOON_ARCHIVE_WARDEN_SITE.x * d.TILE;
  player.y = d.MOON_ARCHIVE_WARDEN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(!state.spawnedArchiveWarden, "Archive Warden should wait until the Moon Cavern relic is secured");
  state.chests.add("moon-cavern-reliquary");
  runtime.updateStoryEvents();
  assert(state.spawnedArchiveWarden, "Archive Warden should spawn after Moon relic, Moon Cavern relic, and level gate");
  const archiveWarden = state.monsters.find((monster) => monster.type === "archiveWarden");
  assert(archiveWarden, "Archive Warden monster should exist");
  archiveWarden.hp = 0;
  runtime.updateMonsters(16);
  assert(state.archiveWardenDefeated, "Archive Warden defeat should open the Moon Archive reliquary");

  state.chests.add("moon-archive-reliquary");
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
  frostGolem.patternCooldown = 0;
  frostGolem.fireCooldown = 0;
  state.telegraphs = [];
  state.projectiles = [];
  runtime.updateMonsters(16);
  assert(frostGolem.patternKind === "frostGolemShards" && state.telegraphs.filter((entry) => entry.kind === "line").length === 3, "Frost Golem should telegraph three shard lanes with safe gaps");
  frostGolem.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.filter((projectile) => projectile.pattern === "frostGolemShard" && projectile.piercing).length === 3, "Frost Golem shard volley should fire three piercing projectiles");
  frostGolem.patternWaveCooldown = 0;
  runtime.updateMonsters(16);
  frostGolem.patternWaveCooldown = 0;
  runtime.updateMonsters(16);
  assert(frostGolem.patternState === "idle", "Frost Golem shard sequence should finish after three volleys");
  state.telegraphs = [];
  state.projectiles = [];
  frostGolem.patternCooldown = 0;
  runtime.updateMonsters(16);
  assert(frostGolem.patternKind === "frostGolemQuake" && state.telegraphs.filter((entry) => entry.kind === "zone").length === 3, "Frost Golem should alternate into three warned quake zones");
  frostGolem.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.pattern === "frostGolemQuake" && projectile.persistent), "Frost Golem quake zones should persist after their warning");
  frostGolem.hp = frostGolem.hpMax * 0.5;
  frostGolem.summoned = false;
  runtime.updateMonsters(16);
  assert(frostGolem.enraged && state.monsters.filter((monster) => monster.type === "frostBeacon").length === 2, "Frost Golem phase two should activate two frost beacons");
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

  player.level = d.SOLAR_WARDEN_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.SOLAR_WARDEN_SITE.x * d.TILE;
  player.y = d.SOLAR_WARDEN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedSolarWarden, "Solar Warden should spawn after chapter 4 report and level gate");
  const solarWarden = state.monsters.find((monster) => monster.type === "solarWarden");
  assert(solarWarden, "Solar Warden monster should exist");
  solarWarden.hp = 0;
  runtime.updateMonsters(16);
  assert(state.solarWardenDefeated, "Solar Warden defeat should unlock Suncrest decisive gear");

  player.level = d.SUNCREST_CHAMPION_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.SUNCREST_CHAMPION_SITE.x * d.TILE;
  player.y = d.SUNCREST_CHAMPION_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedSuncrestChampion, "Suncrest Champion should spawn after Solar Warden and level gate");
  const suncrestChampion = state.monsters.find((monster) => monster.type === "suncrestChampion");
  assert(suncrestChampion, "Suncrest Champion monster should exist");
  suncrestChampion.hp = 0;
  runtime.updateMonsters(16);
  assert(state.suncrestChampionDefeated, "Suncrest Champion defeat should unlock the arena reliquary");

  player.level = d.SUNSPIRE_KEEPER_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.SUNSPIRE_KEEPER_SITE.x * d.TILE;
  player.y = d.SUNSPIRE_KEEPER_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedSunspireKeeper, "Sunspire Keeper should spawn after Solar Warden and level gate");
  const sunspireKeeper = state.monsters.find((monster) => monster.type === "sunspireKeeper");
  assert(sunspireKeeper, "Sunspire Keeper monster should exist");
  sunspireKeeper.hp = 0;
  runtime.updateMonsters(16);
  assert(state.sunspireKeeperDefeated, "Sunspire Keeper defeat should unlock the prism lens reliquary");

  state.chests.add("sunspire-reliquary");
  state.discoveries.add("sunrise-seal");
  state.chests.add("ember-sanctum-cache");
  player.level = d.CHAPTER5_REQUIREMENTS.level;
  player.hp = player.hpMax;
  player.x = d.EMBER_DRAGON_SITE.x * d.TILE;
  player.y = d.EMBER_DRAGON_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(state.spawnedEmberDragon, "Ember Dragon should spawn after chapter 5 requirements");
  runtime.spawnMonster("emberDragon", d.EMBER_DRAGON_SITE.x * d.TILE + d.TILE, d.EMBER_DRAGON_SITE.y * d.TILE);
  const emberDragon = state.monsters.find((monster) => monster.type === "emberDragon");
  assert(emberDragon, "Ember Dragon monster should exist");
  emberDragon.hp = 0;
  runtime.updateMonsters(16);
  assert(state.emberDragonDefeated && state.chapter5Victory, "Ember Dragon defeat should set chapter 5 victory");
  assert(!state.spawnedEmberDragon && !state.monsters.some((monster) => monster.type === "emberDragon"), "defeated Ember Dragon should not remain spawned or reappear");
  runtime.handleNpc(elder);
  assert(state.chapter5Reported, "Elder report should complete chapter 5 clear state");
  return { guardianDefeated: state.guardianDefeated, bossDefeated: state.bossDefeated, elderReported: state.elderReported, chapter2Reported: state.chapter2Reported, chapter3Reported: state.chapter3Reported, chapter4Reported: state.chapter4Reported, chapter5Reported: state.chapter5Reported };
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
  const { definitions: d, state, player, runtime, contexts } = createRuntime();
  const centerPlayerOnTile = (tx, ty) => {
    player.x = (tx + 0.5) * d.TILE - player.w / 2;
    player.y = (ty + 0.5) * d.TILE - player.h / 2;
  };

  assert(runtime.inTownTile(35, 35), "grassland camp should be a safe-zone tile");
  assert(!globalThis.DRAGON_HUNTER_REWARDS.availableTravelPoints(state, player).some((point) => point.id === "grassland-camp"), "grassland camp wagon should stay locked before first arrival");
  centerPlayerOnTile(35, 35);
  player.hp = 2;
  player.stamina = 9;
  state.projectiles = [{ x: player.x, y: player.y, vx: 0, vy: 0 }];
  globalThis.DRAGON_HUNTER_PLAYER.updateSafeBaseArrival(contexts.player());
  assert(state.arrivedSafeBases.has("grassland-camp"), "first arrival should record the grassland camp as a new safe base");
  assert(/草原野営地/.test(state.message) && player.hp === player.hpMax && player.stamina === player.staminaMax && state.projectiles.length === 0, "grassland camp arrival should announce the first expanded safe radius and fully clear danger");
  assert(globalThis.DRAGON_HUNTER_REWARDS.availableTravelPoints(state, player).some((point) => point.id === "grassland-camp"), "grassland camp wagon should unlock after physical arrival");

  assert(runtime.inTownTile(31, 59), "frontier camp should be a safe-zone tile");
  assert(runtime.inTown(31 * d.TILE, 59 * d.TILE), "frontier camp should count as a safe base");
  assert(!runtime.inTownTile(39, 67), "southwest mine cache should remain outside the safe camp");

  const intruder = { x: 24 * d.TILE, y: 59 * d.TILE, w: 12 * d.WORLD_SCALE, h: 12 * d.WORLD_SCALE, isMonster: true };
  state.townGateOpen = false;
  assert(!runtime.isPassableRect(intruder, 25 * d.TILE, 59 * d.TILE), "closed safe camp should block monster entry");

  centerPlayerOnTile(31, 59);
  player.hp = Math.max(1, player.hpMax - 8);
  player.stamina = 12;
  state.projectiles = [{ x: player.x, y: player.y, vx: 0, vy: 0 }];
  globalThis.DRAGON_HUNTER_PLAYER.updateSafeBaseArrival(contexts.player());
  assert(state.arrivedSafeBases.has("southwest-camp"), "first arrival should record the frontier camp as a new safe base");
  assert(/前線キャンプ/.test(state.message) && player.hp === player.hpMax && player.stamina === player.staminaMax && state.projectiles.length === 0, "first arrival should announce relief, fully recover, and clear incoming danger");
  state.message = "";
  globalThis.DRAGON_HUNTER_PLAYER.updateSafeBaseArrival(contexts.player());
  assert(state.message === "", "safe base first-arrival message should not repeat");

  player.hp = 3;
  runtime.updateHealCircle();
  assert(player.hp === player.hpMax, "frontier camp heal circle should fully heal");

  const trailCampFrontier = state.npcs.find((entry) => entry.type === "frontier" && entry.y < 40 * d.TILE);
  assert(trailCampFrontier, "grassland camp supply NPC should exist");
  player.hp = player.hpMax;
  player.stamina = player.staminaMax;
  player.level = 3;
  player.gold = 200;
  openNpcShop(runtime, state, trailCampFrontier);
  assert(state.shopRows.some((row) => row.type === "shield" && row.id === 1), "grassland camp shop should provide an early shield choice");
  runtime.closeShop();

  const frontier = state.npcs.find((entry) => entry.type === "frontier" && entry.y > 54 * d.TILE && entry.y < 64 * d.TILE);
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
  assert(Boolean(d.monsterTypes.archiveWarden), "Moon Archive Warden monster definition should exist");
  assert(Boolean(d.monsterTypes.frostMoth), "frost moth monster definition should exist");
  assert(Boolean(d.monsterTypes.frostBeast), "frost beast monster definition should exist");
  assert(Boolean(d.monsterTypes.frostGolem), "frost golem monster definition should exist");
  assert(Boolean(d.monsterTypes.frostBeacon), "frost beacon monster definition should exist");
  assert(Boolean(d.monsterTypes.towerWarden), "frost tower warden monster definition should exist");
  assert(Boolean(d.monsterTypes.frostDragon), "frost dragon monster definition should exist");
  assert(Boolean(d.monsterTypes.sunLancer), "sun lancer monster definition should exist");
  assert(Boolean(d.monsterTypes.mirageCaster), "mirage caster monster definition should exist");
  assert(Boolean(d.monsterTypes.solarRunner), "solar runner monster definition should exist");
  assert(Boolean(d.monsterTypes.prismBeacon), "prism beacon monster definition should exist");
  assert(Boolean(d.monsterTypes.solarWarden), "solar warden monster definition should exist");
  assert(Boolean(d.monsterTypes.suncrestChampion), "suncrest arena champion monster definition should exist");
  assert(Boolean(d.monsterTypes.sunspireKeeper), "sunspire keeper monster definition should exist");
  assert(Boolean(d.monsterTypes.emberDragon), "ember dragon monster definition should exist");
  assert(d.weaponNames[13] === "暁光の長槍" && d.armorNames[13] === "陽冠の光鎧" && d.shieldNames[7] === "日輪大盾", "chapter 5 city gear should define all combat slots");
  assert(d.accessoryData.horizon?.name === "遠見の護符", "chapter 5 should define the anti-sniper accessory");
  assert(d.accessoryData.prismLens?.name === "反射水晶", "chapter 5 tower should define the prism lens accessory");
  assert(d.accessoryData.duelist?.name === "陽冠闘士の徽章", "Suncrest Arena should define the duelist accessory");
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

  const duelistAttack = createRuntime();
  duelistAttack.player.x = 30 * d.TILE;
  duelistAttack.player.y = 40 * d.TILE;
  duelistAttack.player.dir = "right";
  duelistAttack.player.weapon = 1;
  duelistAttack.player.ownedAccessories = ["duelist"];
  duelistAttack.player.equippedAccessories = ["duelist"];
  duelistAttack.player.equippedAccessory = "duelist";
  duelistAttack.runtime.refreshDerivedStats();
  duelistAttack.runtime.performAttack();
  assert(duelistAttack.player.attackCooldown < d.weaponAttackProfiles[1].cooldown, "duelist accessory should speed normal attack cadence");

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
  player.x = 92 * d.TILE;
  player.y = 103 * d.TILE;
  const moonCavernPortal = runtime.nearestPortal();
  assert(moonCavernPortal?.id === "moon-cavern-west-entry", "Moon Ruins should expose the Moon Cavern attrition route");
  runtime.traversePortal(moonCavernPortal);
  assert(runtime.currentRegion() === "moonCavern", "Moon Cavern interior should use its own region");
  state.elderReported = true;
  state.ashKnightDefeated = true;
  state.chests.add("moon-ruin-cache");
  player.level = 14;
  const moonCavernPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "moonCavern");
  assert(moonCavernPool.includes("moonShade") && moonCavernPool.includes("summoner") && moonCavernPool.includes("shieldSoldier"), "Moon Cavern should mix moon shades, summoners, and shield soldiers");
  const moonCavernMemo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(contexts.ui()).find((page) => page.title === "旅メモ");
  assert(moonCavernMemo?.lines.some((line) => /出口補給/.test(line)), "Moon Cavern memo should call out the exit supply before Moon Camp");
  player.x = 153 * d.TILE;
  player.y = 43 * d.TILE;
  const moonCavernEastExit = runtime.nearestPortal();
  assert(moonCavernEastExit?.id === "moon-cavern-east-exit", "Moon Cavern should exit near Moon Camp");
  runtime.traversePortal(moonCavernEastExit);
  assert(Math.floor(player.x / d.TILE) === 153 && Math.floor(player.y / d.TILE) === 43, "Moon Cavern east exit should stay sealed before the Gatekeeper is defeated");
  state.moonGatekeeperDefeated = true;
  runtime.traversePortal(moonCavernEastExit);
  assert(Math.floor(player.x / d.TILE) === 95 && Math.floor(player.y / d.TILE) === 115, "Moon Cavern east exit should land at Moon Camp");
  player.x = 110 * d.TILE;
  player.y = 115 * d.TILE;
  const moonArchivePortal = runtime.nearestPortal();
  assert(moonArchivePortal?.id === "moon-archive-entry", "Moon Camp should expose the Moon Archive entrance");
  runtime.traversePortal(moonArchivePortal);
  assert(runtime.currentRegion() === "moonArchive", "Moon Archive interior should use its own region");
  const moonArchivePool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "moonArchive");
  assert(moonArchivePool.includes("eclipseMage") && moonArchivePool.includes("summoner"), "Moon Archive should mix eclipse magic and summoners");
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
  player.x = 214 * d.TILE;
  player.y = 72 * d.TILE;
  assert(runtime.currentRegion() === "dawnCoast", "eastern continent harbor should use dawnCoast region");
  const dawnPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "dawnCoast");
  assert(dawnPool.includes("mistLancer") && dawnPool.includes("frostBeast"), "dawn coast should mix lunges and charge pressure");
  player.x = 238 * d.TILE;
  player.y = 129 * d.TILE;
  assert(runtime.currentRegion() === "sunriseHighland", "eastern continent inland should use sunriseHighland region");
  player.level = d.SOLAR_WARDEN_REQUIREMENTS.level;
  const sunrisePool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "sunriseHighland");
  assert(sunrisePool.includes("solarRunner") && sunrisePool.includes("prismBeacon"), "late Sunrise Highland should add runner and artillery pressure before Suncrest");
  player.x = 180 * d.TILE;
  player.y = 10 * d.TILE;
  assert(runtime.currentRegion() === "sunspire", "Sunspire Tower interior should use its own region");
  const sunspirePool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "sunspire");
  assert(sunspirePool.includes("solarRunner") && sunspirePool.includes("prismBeacon"), "Sunspire Tower should mix charge and artillery pressure");
  player.x = 222 * d.TILE;
  player.y = 226 * d.TILE;
  assert(runtime.currentRegion() === "emberIsles", "southeastern volcanic archipelago should use emberIsles region");
  player.level = d.BOSS_REQUIREMENTS.level;
  player.x = 49 * d.TILE;
  player.y = 27 * d.TILE;
  assert(runtime.currentRegion() === "dragonApproach", "Dragon Cave scorched road should use its own approach region");
  const dragonApproachPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "dragonApproach");
  assert(dragonApproachPool.filter((type) => type === "dragonling").length >= 2 && dragonApproachPool.includes("wisp"), "Dragon Cave approach should emphasize dragonlings and fire spirits");
  player.x = d.ASH_KNIGHT_SITE.x * d.TILE;
  player.y = d.ASH_KNIGHT_SITE.y * d.TILE;
  assert(runtime.currentRegion() === "tower", "old tower should use tower region");
  player.x = 104 * d.TILE;
  player.y = 102 * d.TILE;
  assert(runtime.currentRegion() === "moon", "moon ruins should use moon region");
  player.x = 150 * d.TILE;
  player.y = 17 * d.TILE;
  assert(runtime.currentRegion() === "moonArchive", "Moon Archive should use its own interior spawn region");
  player.x = 136 * d.TILE;
  player.y = 34 * d.TILE;
  assert(runtime.currentRegion() === "moonCavern", "Moon Cavern should use its own interior spawn region");
  player.x = 86 * d.TILE;
  player.y = 123 * d.TILE;
  assert(runtime.currentRegion() === "eclipse", "eclipse castle should use eclipse region");
  player.x = 82 * d.TILE;
  player.y = 139 * d.TILE;
  assert(runtime.currentRegion() === "void", "black sun region should use void region");
  player.x = 52 * d.TILE;
  player.y = 132 * d.TILE;
  assert(runtime.currentRegion() === "obsidian", "black market branch dungeon should use obsidian region");
  player.level = 24;
  player.x = 65 * d.TILE;
  player.y = 131 * d.TILE;
  assert(runtime.currentRegion() === "blackGateNorth", "Black Gate north road should use its shield-route region");
  const blackGateNorthPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "blackGateNorth");
  assert(blackGateNorthPool.filter((type) => type === "shieldSoldier").length >= 2 && !blackGateNorthPool.includes("trapFlower"), "Black Gate north road should emphasize shield soldiers without trap pressure");
  player.y = 136 * d.TILE;
  assert(runtime.currentRegion() === "blackGateSouth", "Black Gate south road should use its trap-route region");
  const blackGateSouthPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "blackGateSouth");
  assert(blackGateSouthPool.filter((type) => type === "trapFlower").length >= 2 && blackGateSouthPool.includes("summoner"), "Black Gate south road should emphasize traps and summoners");
  player.x = 40 * d.TILE;
  player.y = 149 * d.TILE;
  assert(runtime.currentRegion() === "frostApproach", "Frost Haven final approach should use its own pressure region");
  const frostApproachPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "frostApproach");
  assert(frostApproachPool.filter((type) => type === "frostBeast").length >= 2, "Frost Haven approach should emphasize charging frost beasts");
  player.level = 14;
  const towerPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "tower");
  assert(towerPool.includes("sorcerer") && towerPool.includes("shieldSoldier"), "tower spawn pool should include sorcerer and shield soldiers");
  player.weapon = 3;
  const shieldFront = runtime.weaponDamageMultiplier({ type: "shieldSoldier" }, 0.1, 0.7);
  const shieldBack = runtime.weaponDamageMultiplier({ type: "shieldSoldier" }, 0.1, -0.8);
  assert(shieldBack > shieldFront, "shield soldiers should be weaker from back attacks than frontal attacks");
  const gatekeeperFront = runtime.weaponDamageMultiplier({ type: "moonGatekeeper" }, 0.1, 0.7);
  const gatekeeperBack = runtime.weaponDamageMultiplier({ type: "moonGatekeeper" }, 0.1, -0.8);
  assert(gatekeeperBack > gatekeeperFront * 2, "Moon Gatekeeper should strongly reward side and back contact attacks");
  player.level = 14;
  const moonPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "moon");
  assert(moonPool.includes("moonShade") && moonPool.includes("sorcerer") && moonPool.includes("summoner"), "moon spawn pool should include moonShade, sorcerer, and summoner");
  assert(!moonPool.includes("trapFlower"), "moon trap flowers should wait until level 16");
  player.level = 16;
  const moonTrapPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "moon");
  assert(moonTrapPool.includes("trapFlower"), "moon spawn pool should include trap flowers after level 16");
  state.elderReported = true;
  state.ashKnightDefeated = true;
  state.chests.add("moon-ruin-cache");
  state.moonGatekeeperDefeated = false;
  state.spawnedMoonGatekeeper = false;
  state.monsters = [];
  player.level = d.MOON_CAVERN_GATEKEEPER_REQUIREMENTS.level;
  player.x = d.MOON_CAVERN_GATEKEEPER_SITE.x * d.TILE;
  player.y = d.MOON_CAVERN_GATEKEEPER_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  const moonGatekeeper = state.monsters.find((monster) => monster.type === "moonGatekeeper");
  assert(moonGatekeeper, "Moon Cavern should spawn its named gate encounter before Moon Camp");
  moonGatekeeper.patternCooldown = 0;
  moonGatekeeper.fireCooldown = 0;
  state.telegraphs = [];
  state.projectiles = [];
  runtime.updateMonsters(16);
  assert(moonGatekeeper.patternState === "windup" && state.telegraphs.some((entry) => entry.kind === "line"), "Moon Gatekeeper should telegraph its opening triple-lance pattern");
  moonGatekeeper.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.pattern === "moonLance" && projectile.piercing), "Moon Gatekeeper should fire readable piercing moon lances after the warning");
  moonGatekeeper.hp = 0;
  runtime.updateMonsters(16);
  assert(state.moonGatekeeperDefeated, "Moon Gatekeeper defeat should persist in state");
  state.monsters = [];
  player.level = d.MOON_ARCHIVE_WARDEN_REQUIREMENTS.level;
  player.x = d.MOON_ARCHIVE_WARDEN_SITE.x * d.TILE;
  player.y = d.MOON_ARCHIVE_WARDEN_SITE.y * d.TILE;
  runtime.updateStoryEvents();
  assert(!state.spawnedArchiveWarden, "Moon Archive warden should wait for the Moon Cavern relic");
  state.chests.add("moon-cavern-reliquary");
  runtime.updateStoryEvents();
  const archiveWarden = state.monsters.find((monster) => monster.type === "archiveWarden");
  assert(archiveWarden, "Moon Archive should spawn its named warden encounter after the Moon and cavern relics");
  const archiveMemo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(contexts.ui()).find((page) => page.title === "旅メモ");
  assert(archiveMemo?.lines.some((line) => /四方書刃と封書陣/.test(line)) && archiveMemo.lines.some((line) => /召喚士と月影/.test(line)), "Chapter 2 memo should teach both Archive Warden patterns and phase two");
  archiveWarden.patternCooldown = 0;
  archiveWarden.fireCooldown = 0;
  state.telegraphs = [];
  state.projectiles = [];
  runtime.updateMonsters(16);
  assert(archiveWarden.patternKind === "archiveQuills" && state.telegraphs.filter((entry) => entry.kind === "line").length === 4, "Archive Warden should telegraph four-way piercing quills");
  archiveWarden.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.filter((projectile) => projectile.pattern === "archiveQuill" && projectile.piercing).length === 4, "Archive Warden quill volley should fire along all four warned lanes");
  archiveWarden.patternWaveCooldown = 0;
  runtime.updateMonsters(16);
  archiveWarden.patternWaveCooldown = 0;
  runtime.updateMonsters(16);
  assert(archiveWarden.patternState === "idle", "Archive Warden quill sequence should finish after three volleys");
  state.telegraphs = [];
  state.projectiles = [];
  archiveWarden.patternCooldown = 0;
  runtime.updateMonsters(16);
  assert(archiveWarden.patternKind === "archiveSeals" && state.telegraphs.filter((entry) => entry.kind === "zone").length === 4, "Archive Warden should alternate into four-corner seal zones");
  archiveWarden.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.pattern === "archiveSeal" && projectile.persistent), "Archive Warden seal zones should persist after their warning");
  archiveWarden.hp = archiveWarden.hpMax * 0.5;
  archiveWarden.summoned = false;
  runtime.updateMonsters(16);
  assert(archiveWarden.enraged && state.monsters.some((monster) => monster.type === "summoner") && state.monsters.some((monster) => monster.type === "moonShade"), "Archive Warden phase two should add a summoner and moon shade");
  archiveWarden.hp = 0;
  runtime.updateMonsters(16);
  assert(state.archiveWardenDefeated, "archive warden defeat should persist in state");
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
  player.level = 39;
  const suncrestArenaPool = globalThis.DRAGON_HUNTER_SPAWN.monsterPoolForRegion(contexts.spawn(), "suncrestArena");
  assert(suncrestArenaPool.includes("solarRunner") && suncrestArenaPool.includes("sunLancer") && suncrestArenaPool.includes("prismBeacon"), "Suncrest Arena should mix rush, sniper, and artillery pressure in its local spawn pool");

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

  player.x = 232 * d.TILE;
  player.y = 102 * d.TILE;
  runtime.spawnMonster("sunLancer", player.x + d.TILE * 5, player.y);
  const sunLancer = state.monsters.find((monster) => monster.type === "sunLancer");
  sunLancer.fireCooldown = 0;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(sunLancer.specialState === "sniper" && state.telegraphs.some((entry) => entry.kind === "line"), "sun lancer should warn a very long sniper line");
  sunLancer.specialWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.source === "sunLancer" && projectile.pattern === "solarSniper" && projectile.piercing), "sun lancer should fire a piercing ultra-long projectile after warning");

  state.monsters = [];
  state.projectiles = [];
  runtime.spawnMonster("mirageCaster", player.x + d.TILE * 5, player.y);
  const mirageCaster = state.monsters.find((monster) => monster.type === "mirageCaster");
  mirageCaster.fireCooldown = 0;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(mirageCaster.specialState === "artillery" && state.telegraphs.filter((entry) => entry.kind === "zone").length === 3, "mirage caster should mark three artillery impact zones");
  mirageCaster.specialWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.filter((projectile) => projectile.pattern === "solarArtillery" && projectile.persistent).length === 3, "mirage caster should create three persistent impact zones");

  state.monsters = [];
  state.projectiles = [];
  runtime.spawnMonster("solarRunner", player.x + d.TILE * 5, player.y);
  const solarRunner = state.monsters.find((monster) => monster.type === "solarRunner");
  solarRunner.chargeCooldown = 0;
  runtime.updateMonsters(16);
  assert(solarRunner.windup > 0 && solarRunner.chargeVector, "solar runner should telegraph a fast charge");

  state.monsters = [];
  state.projectiles = [];
  runtime.spawnMonster("prismBeacon", player.x + d.TILE * 5, player.y);
  const prismBeacon = state.monsters.find((monster) => monster.type === "prismBeacon");
  prismBeacon.fireCooldown = 0;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(prismBeacon.specialState === "artillery" && state.telegraphs.filter((entry) => entry.kind === "zone").length === 3, "prism beacon should mark three solar artillery zones");
  prismBeacon.specialWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.filter((projectile) => projectile.source === "prismBeacon" && projectile.pattern === "solarArtillery").length === 3, "prism beacon should create solar artillery projectiles");

  state.monsters = [];
  state.projectiles = [];
  player.x = 214 * d.TILE;
  player.y = 17 * d.TILE;
  runtime.spawnMonster("suncrestChampion", d.SUNCREST_CHAMPION_SITE.x * d.TILE, d.SUNCREST_CHAMPION_SITE.y * d.TILE);
  const behaviorSuncrestChampion = state.monsters.find((monster) => monster.type === "suncrestChampion");
  behaviorSuncrestChampion.fireCooldown = 9999;
  behaviorSuncrestChampion.chargeCooldown = 0;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(behaviorSuncrestChampion.windup > 0 && behaviorSuncrestChampion.chargeVector, "Suncrest Champion should open with a charge threat");
  behaviorSuncrestChampion.windup = 0;
  behaviorSuncrestChampion.chargeTime = 0;
  behaviorSuncrestChampion.chargeCooldown = 9999;
  behaviorSuncrestChampion.specialState = "idle";
  behaviorSuncrestChampion.specialWindup = 0;
  behaviorSuncrestChampion.fireCooldown = 0;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(behaviorSuncrestChampion.specialState === "sniper" && state.telegraphs.some((entry) => entry.kind === "line"), "Suncrest Champion should telegraph a triple sniper line");
  behaviorSuncrestChampion.specialWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.filter((projectile) => projectile.source === "suncrestChampion" && projectile.pattern === "solarSniper").length === 3, "Suncrest Champion should fire three piercing sniper shots");
  behaviorSuncrestChampion.fireCooldown = 0;
  behaviorSuncrestChampion.chargeCooldown = 9999;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(behaviorSuncrestChampion.specialState === "artillery" && state.telegraphs.filter((entry) => entry.kind === "zone").length === 3, "Suncrest Champion should alternate into artillery zones");
  behaviorSuncrestChampion.hp = behaviorSuncrestChampion.hpMax * 0.5;
  runtime.updateMonsters(16);
  assert(behaviorSuncrestChampion.summoned && state.monsters.some((monster) => monster.type === "solarRunner") && state.monsters.some((monster) => monster.type === "sunLancer") && state.monsters.some((monster) => monster.type === "prismBeacon"), "Suncrest Champion should call mixed arena reinforcements below half HP");

  state.monsters = [];
  state.projectiles = [];
  player.x = 188 * d.TILE;
  player.y = 17 * d.TILE;
  runtime.spawnMonster("sunspireKeeper", d.SUNSPIRE_KEEPER_SITE.x * d.TILE, d.SUNSPIRE_KEEPER_SITE.y * d.TILE);
  const behaviorSunspireKeeper = state.monsters.find((monster) => monster.type === "sunspireKeeper");
  behaviorSunspireKeeper.fireCooldown = 0;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(behaviorSunspireKeeper.specialState === "sniper" && state.telegraphs.some((entry) => entry.kind === "line" && entry.length >= 500 * d.WORLD_SCALE), "Sunspire Keeper should open with a longer sniper warning");
  behaviorSunspireKeeper.hp = behaviorSunspireKeeper.hpMax * 0.5;
  runtime.updateMonsters(16);
  assert(behaviorSunspireKeeper.summoned && state.monsters.some((monster) => monster.type === "prismBeacon") && state.monsters.some((monster) => monster.type === "solarRunner"), "Sunspire Keeper should summon prism and runner pressure below half HP");

  state.monsters = [];
  state.projectiles = [];
  player.x = 232 * d.TILE;
  player.y = 102 * d.TILE;
  runtime.spawnMonster("emberDragon", 236 * d.TILE, 102 * d.TILE);
  const behaviorEmberDragon = state.monsters.find((monster) => monster.type === "emberDragon");
  behaviorEmberDragon.patternCooldown = 0;
  state.telegraphs = [];
  runtime.updateMonsters(16);
  assert(behaviorEmberDragon.patternKind === "emberSniper" && state.telegraphs.some((entry) => entry.kind === "line" && entry.length >= 400 * d.WORLD_SCALE), "ember dragon should open with a near-screen-edge sniper warning");
  behaviorEmberDragon.patternWindup = 0;
  runtime.updateMonsters(16);
  assert(state.projectiles.some((projectile) => projectile.pattern === "emberSniper" && projectile.piercing && projectile.wallPiercing), "ember dragon sniper should pierce enemies and walls");
  state.monsters = [];
  state.projectiles = [];

  const chapter5Defense = createRuntime();
  const solarThreat = { type: "sunLancer" };
  const unprepared = chapter5Defense.runtime.armorDamageMultiplier(solarThreat, 0, "solar");
  chapter5Defense.player.armor = 13;
  chapter5Defense.player.shield = 7;
  chapter5Defense.player.horizonCharm = true;
  chapter5Defense.player.ownedAccessories = ["horizon"];
  chapter5Defense.player.equippedAccessories = ["horizon"];
  const prepared = chapter5Defense.runtime.armorDamageMultiplier(solarThreat, 0, "solar");
  assert(prepared < unprepared * 0.2, `Suncrest gear should dramatically reduce solar ranged pressure: ${prepared} vs ${unprepared}`);
  chapter5Defense.player.ownedAccessories = ["horizon", "prismLens"];
  chapter5Defense.player.equippedAccessories = ["horizon", "prismLens"];
  const prismPrepared = chapter5Defense.runtime.armorDamageMultiplier({ type: "sunspireKeeper" }, 0, "solar");
  assert(prismPrepared < prepared, "prism lens should further reduce Sunspire and Ember solar pressure when equipped");
  const arenaPrepared = chapter5Defense.runtime.armorDamageMultiplier({ type: "suncrestChampion" }, 0, "solar");
  assert(arenaPrepared <= prismPrepared, "Suncrest arena champion should respect chapter 5 solar counter gear");

  const suncrestShop = createRuntime();
  const suncrestMerchant = suncrestShop.state.npcs.find((npc) => npc.type === "merchant" && npc.x > 240 * d.TILE);
  assert(suncrestMerchant, "Suncrest City should have its own large merchant");
  suncrestShop.state.solarWardenDefeated = true;
  suncrestShop.player.gold = 200000;
  suncrestShop.runtime.handleNpc(suncrestMerchant);
  assert(suncrestShop.state.shopTitle.includes("陽冠都市"), "Suncrest merchant should open the metropolis armament store");
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "weapon" && row.id === 13, "Suncrest weapon should be selectable");
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "armor" && row.id === 13, "Suncrest armor should be selectable");
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "shield" && row.id === 7, "Suncrest shield should be selectable");
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "accessory" && row.id === "horizon", "Suncrest accessory should be selectable");
  assert(suncrestShop.player.ownedWeapons.includes(13) && suncrestShop.player.ownedArmors.includes(13) && suncrestShop.player.ownedShields.includes(7) && suncrestShop.player.ownedAccessories.includes("horizon"), "Suncrest purchases should enter the real equipment inventory");
  const suncrestApothecary = suncrestShop.state.npcs.find((npc) => npc.type === "merchant" && Math.floor(npc.x / d.TILE) === 242);
  assert(suncrestApothecary, "Suncrest City should have a dedicated expedition apothecary");
  suncrestShop.runtime.handleNpc(suncrestApothecary);
  assert(suncrestShop.state.shopTitle.includes("遠征薬舗"), "Suncrest apothecary should be a separate item shop");
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "item" && row.id === "elixir", "Suncrest apothecary should sell elixir packs");
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "item" && row.id === "warp", "Suncrest apothecary should sell warp packs");
  const suncrestGuild = suncrestShop.state.npcs.find((npc) => npc.type === "merchant" && Math.floor(npc.x / d.TILE) === 230);
  assert(suncrestGuild, "Suncrest City should have a travel gear guild");
  suncrestShop.player.shield = 7;
  suncrestShop.state.sunspireKeeperDefeated = true;
  suncrestShop.player.gold = 100000;
  suncrestShop.runtime.handleNpc(suncrestGuild);
  assert(suncrestShop.state.shopRows.filter((row) => row.type === "expeditionKit").length === 3, "Suncrest guild should offer three route-specific expedition preparations");
  assert(suncrestShop.state.shopRows.find((row) => row.type === "expeditionKit" && row.id === "ember")?.available === false, "Ember preparation should stay locked until the reflection crystal is recovered");
  suncrestShop.player.tonics = 0;
  suncrestShop.player.wards = 0;
  suncrestShop.player.warps = 0;
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "expeditionKit" && row.id === "sunspire", "Suncrest guild should sell the Sunspire preparation");
  assert(suncrestShop.player.expeditionBlessing === "sunspire" && suncrestShop.player.expeditionBlessingTime === 180000, "Sunspire preparation should activate a timed blessing");
  assert(suncrestShop.player.tonics === 2 && suncrestShop.player.wards === 3 && suncrestShop.player.warps === 2, "Sunspire preparation should include route supplies");
  suncrestShop.player.ownedAccessories = [];
  suncrestShop.player.equippedAccessories = [];
  const sunspirePreparedDamage = suncrestShop.runtime.armorDamageMultiplier({ type: "sunspireKeeper" }, 0, "solar");
  suncrestShop.player.expeditionBlessing = "";
  suncrestShop.player.expeditionBlessingTime = 0;
  const sunspireUnpreparedDamage = suncrestShop.runtime.armorDamageMultiplier({ type: "sunspireKeeper" }, 0, "solar");
  assert(sunspirePreparedDamage < sunspireUnpreparedDamage, "Sunspire preparation should reduce tower projectile damage");
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "expeditionKit" && row.id === "arena", "Suncrest guild should sell the arena preparation");
  const arenaPreparedAttack = suncrestShop.runtime.weaponDamageMultiplier({ type: "suncrestChampion" }, 0, -0.8);
  suncrestShop.player.expeditionBlessing = "";
  suncrestShop.player.expeditionBlessingTime = 0;
  const arenaUnpreparedAttack = suncrestShop.runtime.weaponDamageMultiplier({ type: "suncrestChampion" }, 0, -0.8);
  assert(arenaPreparedAttack > arenaUnpreparedAttack, "Arena preparation should reward side and back attacks");
  suncrestShop.state.chests.add("sunspire-reliquary");
  suncrestShop.runtime.handleNpc(suncrestGuild);
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "expeditionKit" && row.id === "ember", "Reflection crystal should unlock the Ember preparation");
  const emberPreparedDamage = suncrestShop.runtime.armorDamageMultiplier({ type: "emberDragon" }, 0, "fire");
  suncrestShop.player.expeditionBlessing = "";
  suncrestShop.player.expeditionBlessingTime = 0;
  const emberUnpreparedDamage = suncrestShop.runtime.armorDamageMultiplier({ type: "emberDragon" }, 0, "fire");
  assert(emberPreparedDamage < emberUnpreparedDamage, "Ember preparation should reduce final-route fire damage");
  assert(suncrestShop.state.shopTitle.includes("旅装ギルド"), "Suncrest travel guild should be a separate accessory and shield shop");
  buyShopRow(suncrestShop.runtime, suncrestShop.state, (row) => row.type === "accessory" && row.id === "prismLens", "Suncrest guild should sell high-end prism counter gear after the tower keeper");
  assert(suncrestShop.player.ownedAccessories.includes("prismLens"), "Suncrest guild prism gear should enter accessory inventory");

  const expiringPreparation = createRuntime();
  expiringPreparation.player.expeditionBlessing = "arena";
  expiringPreparation.player.expeditionBlessingTime = 5;
  expiringPreparation.runtime.updatePlayer(16);
  assert(expiringPreparation.player.expeditionBlessing === "" && expiringPreparation.player.expeditionBlessingTime === 0, "expedition preparation should expire during field play");
  const statusPage = globalThis.DRAGON_HUNTER_UI.statsPanelPages(suncrestShop.contexts.ui()).find((page) => page.title === "探索力");
  assert(statusPage?.lines.some((line) => line.includes("遠征加護")), "status UI should display expedition preparation state");

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
  assert(runtime.inTownTile(214, 72) && runtime.inTownTile(238, 129), "dawn harbor and Suncrest City should be safe zones");
  assert(runtime.inTownTile(24, 154), "Frost Haven should be a safe-zone tile");
  player.x = 116 * d.TILE;
  player.y = 65 * d.TILE;
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "western-ferry"));
  assert(Math.floor(player.x / d.TILE) === 139 && Math.floor(player.y / d.TILE) === 87, "western ferry should reach the east island harbor");
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "east-ferry"));
  assert(Math.floor(player.x / d.TILE) === 116 && Math.floor(player.y / d.TILE) === 65, "east ferry should return to the western continent");
  player.x = 185 * d.TILE;
  player.y = 102 * d.TILE;
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "sunrise-ferry"));
  assert(Math.floor(player.x / d.TILE) === 204 && Math.floor(player.y / d.TILE) === 72, "outer-sea ferry should reach Dawn Harbor");
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "dawn-ferry"));
  assert(Math.floor(player.x / d.TILE) === 185 && Math.floor(player.y / d.TILE) === 102, "Dawn Harbor ferry should return to Azure Wind Island");
  player.x = 110 * d.TILE;
  player.y = 115 * d.TILE;
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "moon-archive-entry"));
  assert(runtime.currentRegion() === "moonArchive", "Moon Archive portal should enter the book vault interior");
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "moon-archive-exit"));
  assert(Math.floor(player.x / d.TILE) === 110 && Math.floor(player.y / d.TILE) === 115, "Moon Archive exit should return to Moon Camp");
  player.x = 246 * d.TILE;
  player.y = 128 * d.TILE;
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "sunspire-entry"));
  assert(runtime.currentRegion() === "sunspire", "Suncrest east gate should enter Sunspire Tower");
  runtime.traversePortal(d.DUNGEON_PORTALS.find((portal) => portal.id === "sunspire-exit"));
  assert(Math.floor(player.x / d.TILE) === 246 && Math.floor(player.y / d.TILE) === 128, "Sunspire exit should return to Suncrest east gate");
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
  assert(!state.shopRows.some((row) => row.type === "travel" && row.id === "ash-hamlet"), "porter should not offer story-unlocked bases before first arrival");
  state.arrivedSafeBases.add("ash-hamlet");
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
  assert(memoPages.some((page) => page.title === "旅メモ" && page.lines.some((line) => /本線:/.test(line))), "status panel should include main-route travel memo guidance");

  const routeReadability = createRuntime();
  assert(/草原野営地/.test(routeReadability.runtime.objectiveText()), "fresh Chapter 1 objective should lead to the first grassland safe base");
  const firstCampDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(firstCampDestination?.label === "草原野営地" && firstCampDestination.site.x === 35, "world map should mark the first grassland safe base before early progression");
  const firstCampMemo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(routeReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(firstCampMemo?.lines.some((line) => /村東門.*草原野営地/.test(line)), "fresh travel memo should trace the route to grassland camp");
  routeReadability.state.guardianDefeated = true;
  routeReadability.player.sealCrest = true;
  routeReadability.player.scales = d.BOSS_REQUIREMENTS.scales;
  routeReadability.player.level = d.BOSS_REQUIREMENTS.level;
  assert(/北東の岩山|竜洞/.test(routeReadability.runtime.objectiveText()), "Dragon Cave objective should name the north-east rock landmark");
  const dragonDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(dragonDestination?.label === "竜洞" && dragonDestination.site.x === 51, "world map should mark Dragon Cave when it is the required target");

  routeReadability.state.bossDefeated = true;
  routeReadability.state.elderReported = true;
  routeReadability.state.ashKnightDefeated = true;
  routeReadability.state.archiveWardenDefeated = true;
  routeReadability.state.eclipseDragonDefeated = true;
  routeReadability.state.chapter2Reported = true;
  routeReadability.state.cryptWardenDefeated = true;
  routeReadability.state.obsidianGolemDefeated = true;
  routeReadability.state.voidDragonDefeated = true;
  routeReadability.state.chapter3Reported = true;
  routeReadability.state.frostGolemDefeated = true;
  routeReadability.state.frostDragonDefeated = true;
  routeReadability.state.chapter4Reported = true;
  routeReadability.state.solarWardenDefeated = false;
  routeReadability.player.level = d.SOLAR_WARDEN_REQUIREMENTS.level;
  assert(/黎明港から北東高原|日輪砲台/.test(routeReadability.runtime.objectiveText()), "Solar Warden objective should describe the Dawn Harbor to north-east highland route");
  const solarDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(solarDestination?.label === "日輪砲台守" && solarDestination.site.x === d.SOLAR_WARDEN_SITE.x, "world map should mark Solar Warden as the current required destination");
  const chapter5Memo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(routeReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(chapter5Memo?.lines.some((line) => /本線: 黎明港 -> 北東高原 -> 日輪砲台守/.test(line)), "Chapter 5 travel memo should show the main Solar Warden route");

  routeReadability.state.solarWardenDefeated = true;
  routeReadability.state.suncrestChampionDefeated = false;
  routeReadability.state.sunspireKeeperDefeated = false;
  routeReadability.player.level = d.SUNCREST_CHAMPION_REQUIREMENTS.level;
  const suncrestMemo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(routeReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(suncrestMemo?.lines[0]?.includes("本線: 陽冠都市東門 -> 日鏡塔") && suncrestMemo.lines.some((line) => /任意: 西広場の闘技場/.test(line)), "Suncrest memo should show main tower route before optional arena");
  let chapter5Destination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(chapter5Destination?.label === "陽冠都市" && chapter5Destination.site.x === 238, "world map should mark Suncrest City after Solar Warden until first arrival");
  routeReadability.state.arrivedSafeBases.add("suncrest-city");
  chapter5Destination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(chapter5Destination?.label === "日鏡塔守主" && chapter5Destination.site.x === d.SUNSPIRE_KEEPER_SITE.x, "world map should mark Sunspire Keeper as the main Chapter 5 route before optional arena");
  routeReadability.state.sunspireKeeperDefeated = true;
  chapter5Destination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(chapter5Destination?.label === "反射水晶" && chapter5Destination.site.x === 190, "world map should mark the Sunspire reliquary after the keeper");
  routeReadability.state.chests.add("sunspire-reliquary");
  chapter5Destination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(chapter5Destination?.label === "陽光封印碑" && chapter5Destination.site.y === 165, "world map should mark the sunrise seal after the prism lens");
  routeReadability.state.discoveries.add("sunrise-seal");
  chapter5Destination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(chapter5Destination?.label === "熾火聖域補給箱" && chapter5Destination.site.x === 222, "world map should mark the Ember Sanctum supply cache before the final boss");
  routeReadability.state.chests.add("ember-sanctum-cache");
  chapter5Destination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(routeReadability.state, routeReadability.player);
  assert(chapter5Destination?.label === "熾火天竜" && chapter5Destination.site.x === d.EMBER_DRAGON_SITE.x, "world map should mark Ember Dragon after all Chapter 5 preparation");

  const moonCavernReadability = createRuntime();
  moonCavernReadability.state.elderReported = true;
  moonCavernReadability.state.ashKnightDefeated = true;
  moonCavernReadability.state.chests.add("moon-ruin-cache");
  assert(/月影洞窟/.test(moonCavernReadability.runtime.objectiveText()), "Chapter 2 objective should route through Moon Cavern before Moon Archive");
  const moonCavernDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(moonCavernReadability.state, moonCavernReadability.player);
  assert(moonCavernDestination?.label === "月影洞窟" && moonCavernDestination.site.x === 92, "world map should mark Moon Cavern during the Chapter 2 attrition route");

  const blackRouteReadability = createRuntime();
  blackRouteReadability.state.elderReported = true;
  blackRouteReadability.state.ashKnightDefeated = true;
  blackRouteReadability.state.archiveWardenDefeated = true;
  blackRouteReadability.state.eclipseDragonDefeated = true;
  blackRouteReadability.state.chapter2Reported = true;
  assert(/黒門前哨|黒門砦/.test(blackRouteReadability.runtime.objectiveText()), "Chapter 3 objective should first route through the Black Gate approach");
  const blackRouteMemo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(blackRouteReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(blackRouteMemo?.lines[0]?.includes("本線: 黒市東門 -> 黒門前哨 -> 黒門砦") && blackRouteMemo.lines.some((line) => /任意:.*地下墓所/.test(line)), "Chapter 3 memo should show Black Fort as main route before optional dungeons");
  const blackFortDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(blackRouteReadability.state, blackRouteReadability.player);
  assert(blackFortDestination?.label === "黒門砦" && blackFortDestination.site.x === 98, "world map should mark Black Fort before its armory is secured");
  blackRouteReadability.state.chests.add("black-fort-armory");
  const blackSealDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(blackRouteReadability.state, blackRouteReadability.player);
  assert(blackSealDestination?.label === "黒陽碑" && blackSealDestination.site.x === 82, "world map should mark the Black Sun seal after Black Fort armory");
  blackRouteReadability.state.discoveries.add("void-seal");
  let chapter3Memo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(blackRouteReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(chapter3Memo?.lines[0]?.includes("本線: 黒市東の黒曜洞窟") && chapter3Memo.lines.some((line) => /任意:.*地下墓所/.test(line)), "Chapter 3 memo should keep Obsidian Cave above optional uncleared content");
  let chapter3Destination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(blackRouteReadability.state, blackRouteReadability.player);
  assert(chapter3Destination?.label === "黒曜巨人" && chapter3Destination.site.x === d.OBSIDIAN_GOLEM_SITE.x, "world map should mark Obsidian Golem after the Black Sun seal");
  const blackMarketGuide = blackRouteReadability.state.npcs.find((npc) => npc.type === "guide" && npc.x < 50 * d.TILE && npc.y > 128 * d.TILE);
  assert(blackMarketGuide, "Black Market expedition guide should exist");
  blackRouteReadability.runtime.handleNpc(blackMarketGuide);
  assert(/本線.*黒曜洞|黒曜洞.*任意/.test(blackRouteReadability.state.message), "Black Market guide should explain the required Obsidian route before optional catacombs");
  blackRouteReadability.state.obsidianGolemDefeated = true;
  chapter3Destination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(blackRouteReadability.state, blackRouteReadability.player);
  assert(chapter3Destination?.label === "黒陽竜" && chapter3Destination.site.x === d.VOID_DRAGON_SITE.x, "world map should continue to Black Sun Dragon after Obsidian Golem");
  chapter3Memo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(blackRouteReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(chapter3Memo?.lines[0]?.includes("本線: 黒門砦 -> 黒陽城 -> 黒陽竜"), "Chapter 3 memo should continue from Obsidian Golem to Black Sun Dragon");

  const frostRouteReadability = createRuntime();
  frostRouteReadability.state.bossDefeated = true;
  frostRouteReadability.state.elderReported = true;
  frostRouteReadability.state.ashKnightDefeated = true;
  frostRouteReadability.state.archiveWardenDefeated = true;
  frostRouteReadability.state.eclipseDragonDefeated = true;
  frostRouteReadability.state.chapter2Reported = true;
  frostRouteReadability.state.cryptWardenDefeated = true;
  frostRouteReadability.state.obsidianGolemDefeated = true;
  frostRouteReadability.state.voidDragonDefeated = true;
  frostRouteReadability.state.chapter3Reported = true;
  assert(/白銀宿を拠点に東の氷窟/.test(frostRouteReadability.runtime.objectiveText()), "Chapter 4 objective should present Frost Haven and Ice Cave as one route");
  let frostDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(frostRouteReadability.state, frostRouteReadability.player);
  assert(frostDestination?.label === "白銀宿" && frostDestination.site.x === 24, "world map should first mark Frost Haven before first arrival");
  let frostMemo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(frostRouteReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(frostMemo?.lines[0]?.includes("本線: 黒門砦南門 -> 霜原 -> 白銀宿") && frostMemo.lines.some((line) => /任意: 霜見塔/.test(line)), "Chapter 4 memo should guide first arrival before optional Frost Watchtower");
  frostRouteReadability.state.arrivedSafeBases.add("frost-haven");
  frostDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(frostRouteReadability.state, frostRouteReadability.player);
  assert(frostDestination?.label === "氷窟巨人" && frostDestination.site.x === d.FROST_GOLEM_SITE.x, "world map should mark Frost Golem after Frost Haven arrival");
  frostMemo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(frostRouteReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(frostMemo?.lines[0]?.includes("本線: 白銀宿 -> 東の氷窟 -> 霜心の護符") && frostMemo.lines.some((line) => /氷槍は線の間.*氷震は円外.*凍気灯/.test(line)), "Chapter 4 memo should switch to Ice Cave preparation and teach the boss pattern hierarchy");
  frostRouteReadability.state.frostGolemDefeated = true;
  frostDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(frostRouteReadability.state, frostRouteReadability.player);
  assert(frostDestination?.label === "霜冠封印碑" && frostDestination.site.x === 103, "world map should mark Frost Crown seal after Frost Golem");
  frostRouteReadability.state.discoveries.add("frost-seal");
  frostDestination = globalThis.DRAGON_HUNTER_RENDER.currentWorldMapDestinationFor(frostRouteReadability.state, frostRouteReadability.player);
  assert(frostDestination?.label === "霜冠竜" && frostDestination.site.x === d.FROST_DRAGON_SITE.x, "world map should mark Frost Crown Dragon after the seal");
  frostMemo = globalThis.DRAGON_HUNTER_UI.statsPanelPages(frostRouteReadability.contexts.ui()).find((page) => page.title === "旅メモ");
  assert(frostMemo?.lines[0]?.includes("本線: 氷窟 -> 霜冠城封印碑 -> 霜冠竜") && frostMemo.lines.some((line) => /任意: 霜見塔/.test(line)), "Chapter 4 memo should keep Frost Watchtower optional during dragon preparation");

  const reward = createRuntime();
  reward.runtime.grantChestReward("ashGear");
  assert(reward.player.ownedWeapons.includes(8) && reward.player.ownedArmors.includes(8), "ashGear chest should grant star gear inventory");
  reward.runtime.grantChestReward("moonRelic");
  assert(reward.player.ownedWeapons.includes(8) && reward.player.ownedArmors.includes(8) && reward.player.wards >= 4, "moonRelic chest should reinforce star gear and wards");
  reward.runtime.grantChestReward("moonSupply");
  assert(reward.player.bombs >= 3 && reward.player.wards >= 7, "moonSupply chest should add late expedition supplies");
  reward.runtime.grantChestReward("moonCavernSupply");
  assert(reward.player.tonics >= 2 && reward.player.warps >= 1, "Moon Cavern mid-cache should add retreat supplies");
  reward.runtime.grantChestReward("moonCavernExitSupply");
  assert(reward.player.warps >= 2 && reward.player.wards >= 9, "Moon Cavern exit cache should add final-push supplies");
  reward.runtime.grantChestReward("moonCavernRelic");
  assert(reward.player.ownedShields.includes(3) && reward.player.elixirs >= 1, "Moon Cavern relic should grant the route shield and an elixir");
  reward.player.hp = 1;
  reward.player.stamina = 1;
  reward.player.slow = 900;
  reward.player.burn = 900;
  const warpsBeforeMoonShrine = reward.player.warps;
  reward.runtime.grantDiscoveryReward({ id: "moon-cavern-way-shrine", kind: "moonWayShrine" }, 0, 0);
  assert(reward.player.hp === reward.player.hpMax && reward.player.stamina === reward.player.staminaMax, "Moon Cavern way shrine should fully restore the expedition once");
  assert(reward.player.slow === 0 && reward.player.burn === 0 && reward.player.guard >= 1800 && reward.player.warps === Math.min(9, warpsBeforeMoonShrine + 1), "Moon Cavern way shrine should clear pressure and provide a retreat option");
  reward.runtime.grantChestReward("summonerSupply");
  assert(reward.player.tonics >= 2 && reward.player.warps >= 1 && reward.player.bombs >= 5, "summonerSupply should add route-extension supplies");
  reward.runtime.grantChestReward("trapSupply");
  assert(reward.player.tonics >= 3 && reward.player.warps >= 2 && reward.player.wards >= 9, "trapSupply should add trap-route survival supplies");
  reward.runtime.grantDiscoveryReward({ id: "test-trap", kind: "trapHint" }, 0, 0);
  assert(reward.player.wards >= 9, "trap hint should provide a ward and warning reward");
  reward.runtime.grantDiscoveryReward({ id: "test-waystone", kind: "waystone" }, 0, 0);
  assert(reward.player.wards >= 8 && reward.player.stamina === reward.player.staminaMax, "waystone discovery should restore stamina and add a ward");
  reward.runtime.grantDiscoveryReward({ id: "test-dragon-cave-hint", kind: "dragonCaveHint" }, 0, 0);
  assert(reward.player.wards >= 9, "Dragon Cave hint should provide a small route-preparation ward");
  const warpsBeforeDragonApproach = reward.player.warps;
  reward.runtime.grantChestReward("dragonApproachSupply");
  assert(reward.player.tonics >= 1 && reward.player.warps === Math.min(9, warpsBeforeDragonApproach + 1) && reward.player.potions >= 2, "Dragon Cave approach cache should provide push-or-retreat supplies");
  reward.player.hp = 1;
  reward.player.stamina = 1;
  reward.player.slow = 1200;
  const warpsBeforeFrostBrazier = reward.player.warps;
  reward.runtime.grantDiscoveryReward({ id: "frost-cave-brazier", kind: "frostBrazier" }, 0, 0);
  assert(reward.player.hp > 1 && reward.player.hp < reward.player.hpMax && reward.player.stamina === reward.player.staminaMax, "Ice Cave brazier should restore part of HP and all stamina without erasing attrition");
  assert(reward.player.slow === 0 && reward.player.guard >= 1600 && reward.player.warps === Math.min(9, warpsBeforeFrostBrazier + 1), "Ice Cave brazier should clear frost pressure and provide a retreat option");
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
  reward.runtime.grantChestReward("blackGateSupply");
  assert(reward.player.tonics >= 6 && reward.player.warps >= 3 && reward.player.wards >= 9, "Black Gate supply should extend the Black Fort approach");
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

  const moonArchiveChest = d.TREASURE_CHESTS.find((chest) => chest.id === "moon-archive-reliquary");
  assert(moonArchiveChest, "Moon Archive reliquary should exist");
  const guardedMoonArchiveChest = createRuntime();
  guardedMoonArchiveChest.runtime.openChest(moonArchiveChest);
  assert(!guardedMoonArchiveChest.state.chests.has("moon-archive-reliquary") && !guardedMoonArchiveChest.player.ownedAccessories.includes("eclipse"), "Moon Archive reliquary should stay locked until Archive Warden defeat");
  guardedMoonArchiveChest.state.archiveWardenDefeated = true;
  guardedMoonArchiveChest.runtime.openChest(moonArchiveChest);
  assert(guardedMoonArchiveChest.state.chests.has("moon-archive-reliquary") && guardedMoonArchiveChest.player.ownedAccessories.includes("eclipse"), "Moon Archive reliquary should grant the eclipse accessory after Archive Warden defeat");

  const moonCavernRelic = d.TREASURE_CHESTS.find((chest) => chest.id === "moon-cavern-reliquary");
  assert(moonCavernRelic, "Moon Cavern reliquary should exist");
  const guardedMoonCavernRelic = createRuntime();
  guardedMoonCavernRelic.runtime.openChest(moonCavernRelic);
  assert(!guardedMoonCavernRelic.state.chests.has("moon-cavern-reliquary"), "Moon Cavern relic should stay locked until Gatekeeper defeat");
  guardedMoonCavernRelic.state.moonGatekeeperDefeated = true;
  guardedMoonCavernRelic.runtime.openChest(moonCavernRelic);
  assert(guardedMoonCavernRelic.state.chests.has("moon-cavern-reliquary"), "Moon Cavern relic should open after Gatekeeper defeat");

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

  const sunspireChest = d.TREASURE_CHESTS.find((chest) => chest.id === "sunspire-reliquary");
  assert(sunspireChest, "Sunspire reliquary should exist");
  const guardedSunspireChest = createRuntime();
  guardedSunspireChest.runtime.openChest(sunspireChest);
  assert(!guardedSunspireChest.state.chests.has("sunspire-reliquary") && !guardedSunspireChest.player.ownedAccessories.includes("prismLens"), "Sunspire reliquary should stay locked until Sunspire Keeper defeat");
  guardedSunspireChest.state.sunspireKeeperDefeated = true;
  guardedSunspireChest.runtime.openChest(sunspireChest);
  assert(guardedSunspireChest.state.chests.has("sunspire-reliquary") && guardedSunspireChest.player.ownedAccessories.includes("prismLens"), "Sunspire reliquary should grant the prism lens after Sunspire Keeper defeat");

  const arenaChest = d.TREASURE_CHESTS.find((chest) => chest.id === "suncrest-arena-reliquary");
  assert(arenaChest, "Suncrest Arena reliquary should exist");
  const guardedArenaChest = createRuntime();
  guardedArenaChest.runtime.openChest(arenaChest);
  assert(!guardedArenaChest.state.chests.has("suncrest-arena-reliquary") && !guardedArenaChest.player.ownedAccessories.includes("duelist"), "Suncrest Arena reliquary should stay locked until Champion defeat");
  guardedArenaChest.state.suncrestChampionDefeated = true;
  guardedArenaChest.runtime.openChest(arenaChest);
  assert(guardedArenaChest.state.chests.has("suncrest-arena-reliquary") && guardedArenaChest.player.ownedAccessories.includes("duelist"), "Suncrest Arena reliquary should grant the duelist accessory after Champion defeat");

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
  reward.runtime.grantChestReward("moonArchiveSupply");
  assert(reward.player.tonics >= 9 && reward.player.warps >= 7, "Moon Archive supply should extend the chapter 2 interior expedition");
  reward.runtime.grantChestReward("moonArchiveRelic");
  assert(reward.player.ownedAccessories.includes("eclipse"), "Moon Archive reliquary should grant eclipse counter gear");
  reward.runtime.grantChestReward("suncrestApproachSupply");
  assert(reward.player.elixirs >= 5 && reward.player.warps >= 5, "Suncrest approach supply should let the player push from Solar Warden to the city");
  reward.runtime.grantChestReward("suncrestMarketSupply");
  reward.runtime.grantChestReward("suncrestArsenalSupply");
  assert(reward.player.elixirs >= 7 && reward.player.wards >= 9, "Suncrest city caches should provide chapter 5 expedition supplies");
  reward.runtime.grantChestReward("arenaSupply");
  assert(reward.player.tonics >= 9 && reward.player.warps >= 8, "Suncrest Arena supply should support the optional city challenge");
  reward.runtime.grantChestReward("duelistMedal");
  assert(reward.player.ownedAccessories.includes("duelist"), "Suncrest Arena reliquary should grant the duelist accessory");
  reward.player.ownedAccessories = ["duelist"];
  reward.player.equippedAccessories = ["duelist"];
  reward.player.equippedAccessory = "duelist";
  reward.runtime.refreshDerivedStats();
  const duelistStaminaMax = reward.player.staminaMax;
  assert(duelistStaminaMax > 100, "duelist accessory should raise stamina capacity for combo play");
  reward.runtime.grantChestReward("sunspireSupply");
  assert(reward.player.elixirs >= 6 && reward.player.warps >= 7, "Sunspire supply should support the chapter 5 tower expedition");
  reward.runtime.grantChestReward("prismLens");
  assert(reward.player.ownedAccessories.includes("prismLens"), "Sunspire reliquary should grant the prism lens accessory");
  reward.runtime.grantDiscoveryReward({ id: "test-sunspire-hint", kind: "sunspireHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-suncrest-arena-hint", kind: "suncrestArenaHint" }, 0, 0);
  reward.player.stamina = 1;
  reward.runtime.grantDiscoveryReward({ id: "test-solar-warden-hint", kind: "solarWardenHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-suncrest-approach-hint", kind: "suncrestApproachHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-moon-archive-hint", kind: "moonArchiveHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-moon-cavern-hint", kind: "moonCavernHint" }, 0, 0);
  reward.runtime.grantDiscoveryReward({ id: "test-suncrest-guide", kind: "suncrestGuide" }, 0, 0);
  reward.player.stamina = 1;
  reward.runtime.grantDiscoveryReward({ id: "suncrest-east-gate-sign", kind: "suncrestGateHint" }, 0, 0);
  assert(/日鏡塔/.test(reward.state.message) && reward.player.stamina === reward.player.staminaMax, "Suncrest east gate should identify the main Sunspire route and restore expedition stamina");
  reward.runtime.grantDiscoveryReward({ id: "suncrest-west-gate-sign", kind: "suncrestGateHint" }, 0, 0);
  assert(/任意/.test(reward.state.message), "Suncrest west gate should identify the arena as optional content");
  reward.runtime.grantDiscoveryReward({ id: "suncrest-south-gate-sign", kind: "suncrestGateHint" }, 0, 0);
  assert(/最終遠征/.test(reward.state.message), "Suncrest south gate should identify the final expedition route");
  assert(reward.player.wards >= 9 && reward.player.stamina === reward.player.staminaMax, "Sunspire observation point should provide anti-solar preparation");

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
  reward.runtime.grantDiscoveryReward({ id: "test-black-gate-hint", kind: "blackGateHint" }, 0, 0);
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

function assertDiscoveryReread() {
  const { definitions: d, state, player, runtime } = createRuntime();
  const discovery = d.DISCOVERY_POINTS.find((entry) => entry.kind === "dragonCaveHint");
  assert(discovery, "dragon cave guidance discovery should exist");
  player.x = discovery.x * d.TILE;
  player.y = discovery.y * d.TILE;
  runtime.searchGround();
  assert(state.discoveries.has(discovery.id), "first discovery interaction should record the discovery");
  const afterFirst = { gold: player.gold, wards: player.wards, message: state.message };
  state.searchCooldown = 0;
  runtime.searchGround();
  assert(player.gold === afterFirst.gold && player.wards === afterFirst.wards, "rereading a discovery should not grant rewards again");
  assert(state.message !== afterFirst.message && /読み返/.test(state.message), "rereading a discovery should show guidance again");
  assert(runtime.nearestDiscovery()?.id === discovery.id, "already-read discoveries should remain interactable as field guidance");
  const board = d.DISCOVERY_POINTS.find((entry) => entry.kind === "blackMarketBoard");
  assert(board, "Black Market expedition board should exist");
  state.chapter2Reported = true;
  state.chests.add("black-fort-armory");
  state.discoveries.add("void-seal");
  player.x = board.x * d.TILE;
  player.y = board.y * d.TILE;
  state.searchCooldown = 0;
  runtime.searchGround();
  const boardFirst = { gold: player.gold, tonics: player.tonics, warps: player.warps };
  assert(state.discoveries.has(board.id) && /本線: 黒市東の黒曜巨人/.test(state.message), "expedition board should state the current Chapter 3 main route on first read");
  state.searchCooldown = 0;
  runtime.searchGround();
  assert(player.gold === boardFirst.gold && player.tonics === boardFirst.tonics && player.warps === boardFirst.warps, "rereading the expedition board should not repeat its supply reward");
  assert(/本線: 黒市東 -> 黒曜洞 -> 黒曜巨人/.test(state.message) && /任意:/.test(state.message), "rereadable expedition board should separate current main and optional routes");
  return { discovery: discovery.id, reread: true };
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
  const discovery = assertDiscoveryReread();

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

  console.log(JSON.stringify({ ok: true, map, save, inventory, story, mine, camp, expanded, discovery, scriptLoad }, null, 2));
}

main();
