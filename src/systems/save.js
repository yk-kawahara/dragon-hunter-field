"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before save helpers");
  }

  const rewardHelpers = globalThis.DRAGON_HUNTER_REWARDS;
  if (!rewardHelpers) {
    throw new Error("DRAGON_HUNTER_REWARDS must be loaded before save helpers");
  }

  const {
    TILE,
    WORLD_SCALE,
    SAVE_KEY,
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    itemOrder,
    shieldRuneOrder,
  } = definitions;

  const {
    rewardIds,
    savedIdSet,
    normalizeInventory,
  } = rewardHelpers;

  function requireSaveContext(context) {
    if (!context?.state || !context?.player || !context?.say || !context?.refreshDerivedStats || !context?.gameStage || !context?.stageName) {
      throw new Error("save helpers require { state, player, say, refreshDerivedStats, gameStage, stageName }");
    }
    return context;
  }

  function saveGame(context) {
    const { state, player, say, gameStage, stageName } = requireSaveContext(context);
    normalizeInventory(player);
    const data = {
      player: {
        x: player.x,
        y: player.y,
        dir: player.dir,
        hp: player.hp,
        hpMax: player.hpMax,
        level: player.level,
        strength: player.strength,
        resilience: player.resilience,
        xp: player.xp,
        xpNext: player.xpNext,
        gold: player.gold,
        weapon: player.weapon,
        armor: player.armor,
        shield: player.shield,
        shieldRune: player.shieldRune,
        ownedWeapons: player.ownedWeapons,
        ownedArmors: player.ownedArmors,
        ownedShields: player.ownedShields,
        ownedAccessories: player.ownedAccessories,
        equippedAccessory: player.equippedAccessory,
        equippedAccessories: player.equippedAccessories,
        potions: player.potions,
        tonics: player.tonics,
        bombs: player.bombs,
        wards: player.wards,
        elixirs: player.elixirs,
        warps: player.warps,
        selectedItem: player.selectedItem,
        quickItems: player.quickItems,
        activeQuickSlot: player.activeQuickSlot,
        scales: player.scales,
        sealCrest: player.sealCrest,
        hunterCharm: player.hunterCharm,
        regenCharm: player.regenCharm,
        greaterRegenCharm: player.greaterRegenCharm,
        trailCharm: player.trailCharm,
        aegisCharm: player.aegisCharm,
        mineCharm: player.mineCharm,
        mistCharm: player.mistCharm,
        eclipseCharm: player.eclipseCharm,
        voidCharm: player.voidCharm,
        obsidianCharm: player.obsidianCharm,
        deepLampCharm: player.deepLampCharm,
        frostCharm: player.frostCharm,
        skyCharm: player.skyCharm,
        horizonCharm: player.horizonCharm,
      },
      spawnedBoss: state.spawnedBoss,
      bossDefeated: state.bossDefeated,
      spawnedGuardian: state.spawnedGuardian,
      guardianDefeated: state.guardianDefeated,
      spawnedWarden: state.spawnedWarden,
      wardenDefeated: state.wardenDefeated,
      spawnedAshKnight: state.spawnedAshKnight,
      ashKnightDefeated: state.ashKnightDefeated,
      spawnedSmugglerCaptain: state.spawnedSmugglerCaptain,
      smugglerCaptainDefeated: state.smugglerCaptainDefeated,
      spawnedRegenSentinel: state.spawnedRegenSentinel,
      regenSentinelDefeated: state.regenSentinelDefeated,
      spawnedMistKeeper: state.spawnedMistKeeper,
      mistKeeperDefeated: state.mistKeeperDefeated,
      spawnedCryptWarden: state.spawnedCryptWarden,
      cryptWardenDefeated: state.cryptWardenDefeated,
      spawnedFrostGolem: state.spawnedFrostGolem,
      frostGolemDefeated: state.frostGolemDefeated,
      spawnedTowerWarden: state.spawnedTowerWarden,
      towerWardenDefeated: state.towerWardenDefeated,
      spawnedFrostDragon: state.spawnedFrostDragon,
      frostDragonDefeated: state.frostDragonDefeated,
      spawnedSolarWarden: state.spawnedSolarWarden,
      solarWardenDefeated: state.solarWardenDefeated,
      spawnedEmberDragon: state.spawnedEmberDragon,
      emberDragonDefeated: state.emberDragonDefeated,
      spawnedEclipseDragon: state.spawnedEclipseDragon,
      eclipseDragonDefeated: state.eclipseDragonDefeated,
      spawnedVoidDragon: state.spawnedVoidDragon,
      voidDragonDefeated: state.voidDragonDefeated,
      spawnedObsidianGolem: state.spawnedObsidianGolem,
      obsidianGolemDefeated: state.obsidianGolemDefeated,
      elderReported: state.elderReported,
      chapter2Victory: state.chapter2Victory,
      chapter2Reported: state.chapter2Reported,
      chapter3Victory: state.chapter3Victory,
      chapter3Reported: state.chapter3Reported,
      chapter4Victory: state.chapter4Victory,
      chapter4Reported: state.chapter4Reported,
      chapter5Victory: state.chapter5Victory,
      chapter5Reported: state.chapter5Reported,
      chests: Array.from(state.chests),
      discoveries: Array.from(state.discoveries),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    say(`保存しました (${stageName(gameStage())})`);
  }

  function loadGame(context) {
    const { state, player, say, refreshDerivedStats } = requireSaveContext(context);
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (!data?.player) return false;
      Object.assign(player, data.player);
      player.strength = Number.isFinite(data.player.strength) ? data.player.strength : 7 + player.level * 2;
      player.resilience = Number.isFinite(data.player.resilience) ? data.player.resilience : 1 + player.level;
      player.bombs ??= 1;
      player.wards ??= 0;
      player.shield ??= 0;
      player.shieldRune = shieldRuneOrder.includes(player.shieldRune) ? player.shieldRune : "";
      player.ownedShields ??= [player.shield || 0];
      player.tonics ??= 0;
      player.elixirs ??= 0;
      player.warps ??= 0;
      player.sealCrest = Boolean(player.sealCrest);
      player.hunterCharm = Boolean(player.hunterCharm);
      player.regenCharm = Boolean(player.regenCharm);
      player.greaterRegenCharm = Boolean(player.greaterRegenCharm);
      player.trailCharm = Boolean(player.trailCharm);
      player.aegisCharm = Boolean(player.aegisCharm);
      player.mineCharm = Boolean(player.mineCharm);
      player.mistCharm = Boolean(player.mistCharm);
      player.eclipseCharm = Boolean(player.eclipseCharm);
      player.voidCharm = Boolean(player.voidCharm);
      player.obsidianCharm = Boolean(player.obsidianCharm);
      player.deepLampCharm = Boolean(player.deepLampCharm);
      player.frostCharm = Boolean(player.frostCharm);
      player.skyCharm = Boolean(player.skyCharm);
      player.horizonCharm = Boolean(player.horizonCharm);
      normalizeInventory(player);
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
      state.wardenDefeated = Boolean(data.wardenDefeated);
      state.ashKnightDefeated = Boolean(data.ashKnightDefeated);
      state.smugglerCaptainDefeated = Boolean(data.smugglerCaptainDefeated);
      state.regenSentinelDefeated = Boolean(data.regenSentinelDefeated);
      state.mistKeeperDefeated = Boolean(data.mistKeeperDefeated);
      state.cryptWardenDefeated = Boolean(data.cryptWardenDefeated);
      state.frostGolemDefeated = Boolean(data.frostGolemDefeated);
      state.towerWardenDefeated = Boolean(data.towerWardenDefeated);
      state.frostDragonDefeated = Boolean(data.frostDragonDefeated);
      state.solarWardenDefeated = Boolean(data.solarWardenDefeated);
      state.emberDragonDefeated = Boolean(data.emberDragonDefeated);
      state.eclipseDragonDefeated = Boolean(data.eclipseDragonDefeated);
      state.voidDragonDefeated = Boolean(data.voidDragonDefeated);
      state.obsidianGolemDefeated = Boolean(data.obsidianGolemDefeated);
      state.spawnedBoss = state.bossDefeated ? Boolean(data.spawnedBoss) : false;
      state.spawnedGuardian = state.guardianDefeated ? Boolean(data.spawnedGuardian) : false;
      state.spawnedWarden = state.wardenDefeated ? Boolean(data.spawnedWarden) : false;
      state.spawnedAshKnight = state.ashKnightDefeated ? Boolean(data.spawnedAshKnight) : false;
      state.spawnedSmugglerCaptain = state.smugglerCaptainDefeated ? Boolean(data.spawnedSmugglerCaptain) : false;
      state.spawnedRegenSentinel = state.regenSentinelDefeated ? Boolean(data.spawnedRegenSentinel) : false;
      state.spawnedMistKeeper = state.mistKeeperDefeated ? Boolean(data.spawnedMistKeeper) : false;
      state.spawnedCryptWarden = state.cryptWardenDefeated ? Boolean(data.spawnedCryptWarden) : false;
      state.spawnedFrostGolem = state.frostGolemDefeated ? Boolean(data.spawnedFrostGolem) : false;
      state.spawnedTowerWarden = state.towerWardenDefeated ? Boolean(data.spawnedTowerWarden) : false;
      state.spawnedFrostDragon = state.frostDragonDefeated ? Boolean(data.spawnedFrostDragon) : false;
      state.spawnedSolarWarden = state.solarWardenDefeated ? Boolean(data.spawnedSolarWarden) : false;
      state.spawnedEmberDragon = state.emberDragonDefeated ? Boolean(data.spawnedEmberDragon) : false;
      state.spawnedEclipseDragon = state.eclipseDragonDefeated ? Boolean(data.spawnedEclipseDragon) : false;
      state.spawnedVoidDragon = state.voidDragonDefeated ? Boolean(data.spawnedVoidDragon) : false;
      state.spawnedObsidianGolem = state.obsidianGolemDefeated ? Boolean(data.spawnedObsidianGolem) : false;
      state.elderReported = Boolean(data.elderReported);
      state.chapter2Reported = Boolean(data.chapter2Reported);
      state.chapter2Victory = Boolean(data.eclipseDragonDefeated) && !state.chapter2Reported;
      state.chapter3Reported = Boolean(data.chapter3Reported);
      state.chapter3Victory = Boolean(data.voidDragonDefeated) && !state.chapter3Reported;
      state.chapter4Reported = Boolean(data.chapter4Reported);
      state.chapter4Victory = Boolean(data.frostDragonDefeated) && !state.chapter4Reported;
      state.chapter5Reported = Boolean(data.chapter5Reported);
      state.chapter5Victory = Boolean(data.emberDragonDefeated) && !state.chapter5Reported;
      state.clearPanelOpen = false;
      state.gameOver = false;
      state.inventoryOpen = false;
      state.shopOpen = false;
      state.pointerMove = null;
      state.victory = Boolean(data.bossDefeated) && !state.elderReported;
      state.chests = savedIdSet(data.chests, rewardIds(TREASURE_CHESTS));
      state.discoveries = savedIdSet(data.discoveries, rewardIds(DISCOVERY_POINTS));
      say("旅を再開しました");
      return true;
    } catch {
      return false;
    }
  }

  function resetGame(context) {
    const { state, player, say, refreshDerivedStats } = requireSaveContext(context);
    Object.assign(player, {
      x: 10 * TILE,
      y: 48 * TILE,
      w: 10 * WORLD_SCALE,
      h: 12 * WORLD_SCALE,
      dir: "down",
      hp: 26,
      hpMax: 26,
      level: 1,
      strength: 9,
      resilience: 2,
      xp: 0,
      xpNext: 34,
      gold: 18,
      weapon: 0,
      armor: 0,
      shield: 0,
      shieldRune: "",
      ownedWeapons: [0],
      ownedArmors: [0],
      ownedShields: [0],
      ownedAccessories: [],
      equippedAccessory: "",
      equippedAccessories: [],
      potions: 2,
      tonics: 0,
      bombs: 1,
      wards: 0,
      elixirs: 0,
      warps: 0,
      selectedItem: "potion",
      quickItems: ["potion", "bomb", "ward"],
      activeQuickSlot: 0,
      sealCrest: false,
      hunterCharm: false,
      regenCharm: false,
      greaterRegenCharm: false,
      trailCharm: false,
      aegisCharm: false,
      mineCharm: false,
      mistCharm: false,
      eclipseCharm: false,
      voidCharm: false,
      obsidianCharm: false,
      deepLampCharm: false,
      frostCharm: false,
      skyCharm: false,
      horizonCharm: false,
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
      speed: 66 * WORLD_SCALE,
      scales: 0,
    });
    state.monsters = [];
    state.sparks = [];
    state.slashes = [];
    state.rings = [];
    state.floaters = [];
    state.particles = [];
    state.projectiles = [];
    state.chests = new Set();
    state.discoveries = new Set();
    state.spawnedBoss = false;
    state.bossDefeated = false;
    state.spawnedGuardian = false;
    state.guardianDefeated = false;
    state.spawnedWarden = false;
    state.wardenDefeated = false;
    state.spawnedAshKnight = false;
    state.ashKnightDefeated = false;
    state.spawnedSmugglerCaptain = false;
    state.smugglerCaptainDefeated = false;
    state.spawnedRegenSentinel = false;
    state.regenSentinelDefeated = false;
    state.spawnedMistKeeper = false;
    state.mistKeeperDefeated = false;
    state.spawnedCryptWarden = false;
    state.cryptWardenDefeated = false;
    state.spawnedFrostGolem = false;
    state.frostGolemDefeated = false;
    state.spawnedTowerWarden = false;
    state.towerWardenDefeated = false;
    state.spawnedFrostDragon = false;
    state.frostDragonDefeated = false;
    state.spawnedSolarWarden = false;
    state.solarWardenDefeated = false;
    state.spawnedEmberDragon = false;
    state.emberDragonDefeated = false;
    state.spawnedEclipseDragon = false;
    state.eclipseDragonDefeated = false;
    state.spawnedVoidDragon = false;
    state.voidDragonDefeated = false;
    state.spawnedObsidianGolem = false;
    state.obsidianGolemDefeated = false;
    state.elderReported = false;
    state.chapter2Victory = false;
    state.chapter2Reported = false;
    state.chapter3Victory = false;
    state.chapter3Reported = false;
    state.chapter4Victory = false;
    state.chapter4Reported = false;
    state.chapter5Victory = false;
    state.chapter5Reported = false;
    state.clearPanelOpen = false;
    state.gameOver = false;
    state.shopOpen = false;
    state.victory = false;
    state.healCooldown = 0;
    state.townGateOpen = false;
    state.townGateHold = 0;
    state.pointerMove = null;
    state.infoPanel = null;
    state.inventoryOpen = false;
    state.inventoryTab = "items";
    state.inventoryIndex = 0;
    refreshDerivedStats();
    localStorage.removeItem(SAVE_KEY);
    say("新しい旅が始まった");
  }

  globalThis.DRAGON_HUNTER_SAVE = {
    saveGame,
    loadGame,
    resetGame,
  };
})();
