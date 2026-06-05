"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before spawn helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before spawn helpers");
  }

  const {
    TILE,
    MAP_W,
    MAP_H,
    REGION_SPAWNS,
    GUARDIAN_SITE,
    monsterTypes,
  } = definitions;

  const {
    clamp,
    centerOf,
    normalize,
  } = mathHelpers;

  function requireSpawnContext(context) {
    if (!context?.state || !context?.player || !context?.rand || !context?.irand || !context?.isPassableRect || !context?.inTown || !context?.say || !context?.addRing) {
      throw new Error("spawn helpers require { state, player, rand, irand, isPassableRect, inTown, say, addRing }");
    }
    return context;
  }

  function spawnMonster(context, typeName, x, y) {
    const { state, rand } = requireSpawnContext(context);
    const template = monsterTypes[typeName];
    const size = template.boss ? 22 : template.midboss ? 18 : typeName === "dragonling" ? 14 : 11;
    const monster = {
      type: typeName,
      name: template.name,
      x,
      y,
      w: size,
      h: size,
      dir: "down",
      hp: template.hp,
      hpMax: template.hp,
      atk: template.atk,
      def: template.def,
      speed: template.speed,
      xp: template.xp,
      gold: template.gold,
      color: template.color,
      shadow: template.shadow,
      drop: template.drop,
      flying: Boolean(template.flying),
      boss: Boolean(template.boss),
      midboss: Boolean(template.midboss),
      isMonster: true,
      contactTimer: rand(0, 300),
      fireCooldown: rand(900, 1800),
      windup: 0,
      chargeTime: 0,
      chargeCooldown: rand(500, 1200),
      chargeVector: { x: 0, y: 0 },
      wanderTimer: rand(500, 1600),
      vx: 0,
      vy: 0,
      hurt: 0,
      enraged: false,
      summoned: false,
      age: 0,
    };
    state.monsters.push(monster);
  }

  function spawnIfClear(context, typeName, x, y) {
    const { isPassableRect } = requireSpawnContext(context);
    const template = monsterTypes[typeName];
    const size = template.boss ? 22 : template.midboss ? 18 : typeName === "dragonling" ? 14 : 11;
    const actor = { x, y, w: size, h: size, flying: Boolean(template.flying), isMonster: true };
    if (isPassableRect(actor)) spawnMonster(context, typeName, x, y);
  }

  function monsterChoice(context) {
    const { irand } = requireSpawnContext(context);
    const pool = monsterPoolForRegion(context, currentRegion(context));
    return pool[irand(0, pool.length - 1)];
  }

  function currentRegion(context) {
    const { player } = requireSpawnContext(context);
    const tx = Math.floor((player.x + player.w / 2) / TILE);
    const ty = Math.floor((player.y + player.h / 2) / TILE);
    if (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 18) return "cave";
    if (tx > 40) return "east";
    if (ty < 25) return "north";
    if (distanceFromVillage(context) > 330) return "wilds";
    return "grassland";
  }

  function distanceFromVillage(context) {
    const { player } = requireSpawnContext(context);
    const townCenterX = 12 * TILE;
    const townCenterY = 48 * TILE;
    const pc = centerOf(player);
    return Math.hypot(pc.x - townCenterX, pc.y - townCenterY);
  }

  function monsterPoolForRegion(context, region) {
    const { player } = requireSpawnContext(context);
    const lv = player.level;
    const pool = [...(REGION_SPAWNS[region] || REGION_SPAWNS.grassland).pool];
    if (lv <= 1) {
      const safePool = region === "grassland" ? ["slime", "slime", "bat"] : pool.filter((type) => type !== "dragonling" && type !== "wisp");
      return safePool.length ? safePool : ["bat", "boar"];
    }
    if (lv >= 3 && region === "grassland") pool.push("boar");
    if (lv >= 4 && region !== "grassland") pool.push("dragonling");
    return pool;
  }

  function trySpawnMonster(context, dt) {
    const { state, player, rand, isPassableRect, inTown } = requireSpawnContext(context);
    if (state.gameOver || state.victory) return;
    pruneDistantMonsters(context);
    state.spawnTimer -= dt;
    const region = currentRegion(context);
    const regionInfo = REGION_SPAWNS[region] || REGION_SPAWNS.grassland;
    const maxMonsters = clamp(5 + player.level * 2 + regionInfo.maxBonus, 7, 16);
    if (state.spawnTimer > 0 || state.monsters.length >= maxMonsters) return;
    state.spawnTimer = rand(780, 1320) / regionInfo.danger;

    for (let i = 0; i < 40; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const radius = rand(92, 190 + regionInfo.danger * 18);
      const x = clamp(player.x + Math.cos(angle) * radius, TILE, MAP_W * TILE - TILE * 2);
      const y = clamp(player.y + Math.sin(angle) * radius, TILE, MAP_H * TILE - TILE * 2);
      const actor = { x, y, w: 12, h: 12, flying: false };
      if (inTown(x, y)) continue;
      if (isPassableRect(actor)) {
        spawnMonster(context, monsterChoice(context), x, y);
        return;
      }
    }
  }

  function updateRegionSpawns(context, dt) {
    const { state, player, say, inTown } = requireSpawnContext(context);
    if (state.gameOver || state.victory || inTown(player.x, player.y)) return;
    pruneDistantMonsters(context);
    state.regionSpawnTimer = Math.max(0, state.regionSpawnTimer - dt);
    const region = currentRegion(context);
    const regionInfo = REGION_SPAWNS[region] || REGION_SPAWNS.grassland;
    const maxMonsters = clamp(5 + player.level * 2 + regionInfo.maxBonus, 7, 16);
    const target = region === "grassland" ? 3 : region === "wilds" ? 4 : region === "north" ? 4 : region === "east" ? 5 : 5;
    if (region !== state.lastRegion) {
      state.lastRegion = region;
      state.regionSpawnTimer = 0;
      say(areaDangerText(region), 1300);
    }
    let nearby = countNearbyMonsters(context, 210);
    if (nearby < target) {
      pruneDistantMonsters(context, 230);
      nearby = countNearbyMonsters(context, 210);
    }
    if (state.regionSpawnTimer > 0 || state.monsters.length >= maxMonsters) return;
    state.regionSpawnTimer = 1600;
    for (let i = nearby; i < target && state.monsters.length < maxMonsters; i += 1) {
      spawnNearPlayer(context, region, 105 + i * 16, 235 + i * 10);
    }
  }

  function pruneDistantMonsters(context, maxDistance = 520) {
    const { state, player } = requireSpawnContext(context);
    const pc = centerOf(player);
    state.monsters = state.monsters.filter((monster) => {
      if (monster.boss || monster.midboss) return true;
      const mc = centerOf(monster);
      return Math.hypot(mc.x - pc.x, mc.y - pc.y) < maxDistance;
    });
  }

  function countNearbyMonsters(context, radius) {
    const { state, player } = requireSpawnContext(context);
    const pc = centerOf(player);
    return state.monsters.filter((monster) => {
      if (monster.hp <= 0) return false;
      const mc = centerOf(monster);
      return Math.hypot(mc.x - pc.x, mc.y - pc.y) < radius;
    }).length;
  }

  function spawnNearPlayer(context, region, minRadius, maxRadius) {
    const { state, player, rand, irand, isPassableRect, inTown } = requireSpawnContext(context);
    const pool = monsterPoolForRegion(context, region);
    for (let i = 0; i < 35; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const radius = rand(minRadius, maxRadius);
      const x = clamp(player.x + Math.cos(angle) * radius, TILE, MAP_W * TILE - TILE * 2);
      const y = clamp(player.y + Math.sin(angle) * radius, TILE, MAP_H * TILE - TILE * 2);
      if (inTown(x, y)) continue;
      const type = pool[irand(0, pool.length - 1)];
      const template = monsterTypes[type];
      const size = type === "dragonling" ? 14 : 11;
      const actor = { x, y, w: size, h: size, flying: Boolean(template.flying), isMonster: true };
      if (isPassableRect(actor)) {
        spawnMonster(context, type, x, y);
        return true;
      }
    }
    return false;
  }

  function areaDangerText(region) {
    if (region === "north") return "北森: 強敵の気配";
    if (region === "east") return "東の森: 魔力が濃い";
    if (region === "cave") return "竜洞: 危険";
    if (region === "wilds") return "荒野: 村から遠い";
    return "草原: 村の近く";
  }

  function guardianReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.guardianDefeated && player.level >= 3 && player.scales >= 2;
  }

  function playerNearGuardianSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const gx = (GUARDIAN_SITE.x + 0.5) * TILE;
    const gy = (GUARDIAN_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - gx, pc.y - gy) < 86;
  }

  function updateStoryEvents(context) {
    const { state, say } = requireSpawnContext(context);
    if (state.gameOver || state.victory) return;
    if (guardianReady(context) && !state.spawnedGuardian && playerNearGuardianSite(context)) {
      state.spawnedGuardian = true;
      spawnMonster(context, "guardian", GUARDIAN_SITE.x * TILE, GUARDIAN_SITE.y * TILE);
      say("北森の守護者が現れた!", 2600);
    }
  }

  globalThis.DRAGON_HUNTER_SPAWN = {
    spawnMonster,
    spawnIfClear,
    monsterChoice,
    currentRegion,
    distanceFromVillage,
    monsterPoolForRegion,
    trySpawnMonster,
    updateRegionSpawns,
    pruneDistantMonsters,
    countNearbyMonsters,
    spawnNearPlayer,
    areaDangerText,
    guardianReady,
    playerNearGuardianSite,
    updateStoryEvents,
  };
})();
