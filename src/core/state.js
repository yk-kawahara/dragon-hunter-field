"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before state helpers");
  }

  const { TILE, WORLD_SCALE } = definitions;

  function createInitialState() {
    return {
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
      spawnedWarden: false,
      wardenDefeated: false,
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
  }

  function createInitialPlayer() {
    return {
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
      scales: 0,
      sealCrest: false,
      hunterCharm: false,
      regenCharm: false,
      trailCharm: false,
      aegisCharm: false,
      mineCharm: false,
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
      speed: 66 * WORLD_SCALE,
      step: 0,
    };
  }

  globalThis.DRAGON_HUNTER_STATE = {
    createInitialState,
    createInitialPlayer,
  };
})();
