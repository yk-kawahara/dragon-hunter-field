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
  } = definitions;

  const {
    rewardIds,
    savedIdSet,
  } = rewardHelpers;

  function requireSaveContext(context) {
    if (!context?.state || !context?.player || !context?.say || !context?.refreshDerivedStats || !context?.gameStage || !context?.stageName) {
      throw new Error("save helpers require { state, player, say, refreshDerivedStats, gameStage, stageName }");
    }
    return context;
  }

  function saveGame(context) {
    const { state, player, say, gameStage, stageName } = requireSaveContext(context);
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
        trailCharm: player.trailCharm,
        aegisCharm: player.aegisCharm,
      },
      spawnedBoss: state.spawnedBoss,
      bossDefeated: state.bossDefeated,
      spawnedGuardian: state.spawnedGuardian,
      guardianDefeated: state.guardianDefeated,
      spawnedWarden: state.spawnedWarden,
      wardenDefeated: state.wardenDefeated,
      elderReported: state.elderReported,
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
      player.bombs ??= 1;
      player.wards ??= 0;
      player.sealCrest = Boolean(player.sealCrest);
      player.hunterCharm = Boolean(player.hunterCharm);
      player.regenCharm = Boolean(player.regenCharm);
      player.trailCharm = Boolean(player.trailCharm);
      player.aegisCharm = Boolean(player.aegisCharm);
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
      state.spawnedBoss = state.bossDefeated ? Boolean(data.spawnedBoss) : false;
      state.spawnedGuardian = state.guardianDefeated ? Boolean(data.spawnedGuardian) : false;
      state.spawnedWarden = state.wardenDefeated ? Boolean(data.spawnedWarden) : false;
      state.elderReported = Boolean(data.elderReported);
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
      trailCharm: false,
      aegisCharm: false,
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
    state.discoveries = new Set();
    state.spawnedBoss = false;
    state.bossDefeated = false;
    state.spawnedGuardian = false;
    state.guardianDefeated = false;
    state.spawnedWarden = false;
    state.wardenDefeated = false;
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

  globalThis.DRAGON_HUNTER_SAVE = {
    saveGame,
    loadGame,
    resetGame,
  };
})();
