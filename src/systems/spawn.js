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
    WORLD_SCALE,
    MAP_W,
    MAP_H,
    REGION_SPAWNS,
    GUARDIAN_SITE,
    WARDEN_SITE,
    WARDEN_REQUIREMENTS,
    ASH_KNIGHT_SITE,
    ASH_KNIGHT_REQUIREMENTS,
    ECLIPSE_DRAGON_SITE,
    CHAPTER2_REQUIREMENTS,
    VOID_DRAGON_SITE,
    CHAPTER3_REQUIREMENTS,
    OBSIDIAN_GOLEM_SITE,
    OBSIDIAN_GOLEM_REQUIREMENTS,
    monsterTypes,
  } = definitions;

  const {
    clamp,
    centerOf,
    normalize,
  } = mathHelpers;

  const worldPx = (value) => value * WORLD_SCALE;

  function monsterSize(typeName, template) {
    return worldPx(template.boss ? 22 : template.midboss ? 18 : typeName === "dragonling" ? 14 : 11);
  }

  function leashRadiusFor(typeName, template) {
    if (template.boss) return worldPx(360);
    if (template.midboss || typeName === "warden") return worldPx(260);
    return worldPx(220);
  }

  function requireSpawnContext(context) {
    if (!context?.state || !context?.player || !context?.rand || !context?.irand || !context?.isPassableRect || !context?.inTown || !context?.say || !context?.addRing) {
      throw new Error("spawn helpers require { state, player, rand, irand, isPassableRect, inTown, say, addRing }");
    }
    return context;
  }

  function spawnMonster(context, typeName, x, y) {
    const { state, rand } = requireSpawnContext(context);
    const template = monsterTypes[typeName];
    const size = monsterSize(typeName, template);
    const monster = {
      type: typeName,
      name: template.name,
      x,
      y,
      homeX: x,
      homeY: y,
      baseHp: template.hp,
      baseAtk: template.atk,
      baseSpeed: template.speed,
      leashRadius: leashRadiusFor(typeName, template),
      leashed: false,
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
    const size = monsterSize(typeName, template);
    const actor = { x, y, w: size, h: size, flying: Boolean(template.flying), isMonster: true };
    if (isPassableRect(actor)) spawnMonster(context, typeName, x, y);
  }

  function hasLiveMonster(context, typeName) {
    const { state } = requireSpawnContext(context);
    return state.monsters.some((monster) => monster.type === typeName && monster.hp > 0);
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
    if (ty >= 128 && tx <= 58) return "obsidian";
    if (ty >= 128) return "void";
    if (ty >= 112) return "eclipse";
    if (ty >= 96) return "moon";
    if ((tx >= 90 && tx <= 115 && ty >= 84) || (tx >= 105 && tx <= 116 && ty >= 36 && ty <= 47)) return "tower";
    if (tx >= 80 || ty >= 72) return "ash";
    if (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 18) return "cave";
    if (tx >= 20 && tx <= 43 && ty >= 60) return "mine";
    if (tx > 40) return "east";
    if (ty < 25) return "north";
    if (distanceFromVillage(context) > worldPx(330)) return "wilds";
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
    if (lv >= 3 && region === "mine") pool.push("dragonling");
    if (lv >= 8 && (region === "ash" || region === "tower" || region === "moon")) pool.push("sorcerer");
    if (lv >= 12 && region === "moon") pool.push("moonShade");
    if (lv >= 16 && region === "eclipse") pool.push("eclipseMage", "moonShade");
    if (lv >= 20 && region === "eclipse") pool.push("eclipseMage");
    if (lv >= 22 && region === "void") pool.push("voidWraith", "eclipseMage");
    if (lv >= 26 && region === "void") pool.push("voidWraith", "voidWraith");
    if (lv >= 22 && region === "obsidian") pool.push("obsidianCrawler", "voidWraith");
    if (lv >= 24 && region === "obsidian") pool.push("obsidianCrawler", "obsidianCrawler");
    return pool;
  }

  function trySpawnMonster(context, dt) {
    const { state, player, rand, isPassableRect, inTown } = requireSpawnContext(context);
    if (state.gameOver) return;
    pruneDistantMonsters(context);
    state.spawnTimer -= dt;
    const region = currentRegion(context);
    const regionInfo = REGION_SPAWNS[region] || REGION_SPAWNS.grassland;
    const maxMonsters = clamp(6 + player.level * 2 + regionInfo.maxBonus, 8, 20);
    if (state.spawnTimer > 0 || state.monsters.length >= maxMonsters) return;
    state.spawnTimer = rand(780, 1320) / regionInfo.danger;

    for (let i = 0; i < 40; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const radius = rand(worldPx(92), worldPx(190 + regionInfo.danger * 18));
      const x = clamp(player.x + Math.cos(angle) * radius, TILE, MAP_W * TILE - TILE * 2);
      const y = clamp(player.y + Math.sin(angle) * radius, TILE, MAP_H * TILE - TILE * 2);
      const actor = { x, y, w: worldPx(12), h: worldPx(12), flying: false };
      if (inTown(x, y)) continue;
      if (isPassableRect(actor)) {
        spawnMonster(context, monsterChoice(context), x, y);
        return;
      }
    }
  }

  function updateRegionSpawns(context, dt) {
    const { state, player, say, inTown } = requireSpawnContext(context);
    if (state.gameOver || inTown(player.x, player.y)) return;
    pruneDistantMonsters(context);
    state.regionSpawnTimer = Math.max(0, state.regionSpawnTimer - dt);
    const region = currentRegion(context);
    const regionInfo = REGION_SPAWNS[region] || REGION_SPAWNS.grassland;
    const maxMonsters = clamp(6 + player.level * 2 + regionInfo.maxBonus, 8, 20);
    const target = region === "grassland" ? 3 : region === "wilds" ? 4 : region === "north" ? 5 : region === "east" ? 6 : region === "ash" ? 7 : region === "tower" ? 8 : region === "moon" ? 9 : region === "eclipse" ? 11 : region === "obsidian" ? 12 : region === "void" ? 13 : 6;
    if (region !== state.lastRegion) {
      state.lastRegion = region;
      state.regionSpawnTimer = 0;
      say(areaDangerText(region), 1300);
    }
    let nearby = countNearbyMonsters(context, worldPx(210));
    if (nearby < target) {
      pruneDistantMonsters(context, worldPx(230));
      nearby = countNearbyMonsters(context, worldPx(210));
    }
    if (state.regionSpawnTimer > 0 || state.monsters.length >= maxMonsters) return;
    state.regionSpawnTimer = 1600;
    for (let i = nearby; i < target && state.monsters.length < maxMonsters; i += 1) {
      spawnNearPlayer(context, region, worldPx(105 + i * 16), worldPx(235 + i * 10));
    }
  }

  function pruneDistantMonsters(context, maxDistance = worldPx(520)) {
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
      const size = monsterSize(type, template);
      const actor = { x, y, w: size, h: size, flying: Boolean(template.flying), isMonster: true };
      if (isPassableRect(actor)) {
        spawnMonster(context, type, x, y);
        return true;
      }
    }
    return false;
  }

  function areaDangerText(region) {
    if (region === "obsidian") return "黒曜洞: 黒市の外は巨人の縄張り";
    if (region === "void") return "黒陽領: 第3章の高難度地帯";
    if (region === "eclipse") return "月蝕城: 第2章の最奥";
    if (region === "moon") return "月影廃墟: 古塔の先の危険地帯";
    if (region === "north") return "北森: 強敵の気配";
    if (region === "east") return "東の森: 魔力が濃い";
    if (region === "mine") return "廃坑: 泡と魔法の気配";
    if (region === "cave") return "竜洞: 危険";
    if (region === "wilds") return "荒野: 村から遠い";
    return "草原: 村の近く";
  }

  function guardianReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.guardianDefeated && player.level >= 3 && player.scales >= 2;
  }

  function wardenReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.wardenDefeated && player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level;
  }

  function ashKnightReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.ashKnightDefeated && state.wardenDefeated && player.level >= ASH_KNIGHT_REQUIREMENTS.level;
  }

  function eclipseDragonReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.eclipseDragonDefeated
      && state.elderReported
      && state.ashKnightDefeated
      && state.chests.has("moon-ruin-cache")
      && state.discoveries.has("eclipse-seal")
      && player.level >= CHAPTER2_REQUIREMENTS.level;
  }

  function voidDragonReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.voidDragonDefeated
      && state.chapter2Reported
      && state.eclipseDragonDefeated
      && state.obsidianGolemDefeated
      && state.chests.has("black-fort-armory")
      && state.chests.has("eclipse-castle-cache")
      && state.discoveries.has("void-seal")
      && player.level >= CHAPTER3_REQUIREMENTS.level;
  }

  function obsidianGolemReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.obsidianGolemDefeated
      && state.chapter2Reported
      && state.chests.has("black-fort-armory")
      && player.level >= OBSIDIAN_GOLEM_REQUIREMENTS.level;
  }

  function playerNearGuardianSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const gx = (GUARDIAN_SITE.x + 0.5) * TILE;
    const gy = (GUARDIAN_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - gx, pc.y - gy) < worldPx(86);
  }

  function playerNearWardenSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const wx = (WARDEN_SITE.x + 0.5) * TILE;
    const wy = (WARDEN_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - wx, pc.y - wy) < worldPx(86);
  }

  function playerNearAshKnightSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const ax = (ASH_KNIGHT_SITE.x + 0.5) * TILE;
    const ay = (ASH_KNIGHT_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - ax, pc.y - ay) < worldPx(92);
  }

  function playerNearEclipseDragonSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const ex = (ECLIPSE_DRAGON_SITE.x + 0.5) * TILE;
    const ey = (ECLIPSE_DRAGON_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - ex, pc.y - ey) < worldPx(104);
  }

  function playerNearVoidDragonSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const vx = (VOID_DRAGON_SITE.x + 0.5) * TILE;
    const vy = (VOID_DRAGON_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - vx, pc.y - vy) < worldPx(108);
  }

  function playerNearObsidianGolemSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const ox = (OBSIDIAN_GOLEM_SITE.x + 0.5) * TILE;
    const oy = (OBSIDIAN_GOLEM_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - ox, pc.y - oy) < worldPx(96);
  }

  function updateStoryEvents(context) {
    const { state, say } = requireSpawnContext(context);
    if (state.gameOver) return;

    if (state.spawnedWarden && !state.wardenDefeated && !hasLiveMonster(context, "warden")) {
      state.spawnedWarden = false;
    }
    if (state.spawnedGuardian && !state.guardianDefeated && !hasLiveMonster(context, "guardian")) {
      state.spawnedGuardian = false;
    }
    if (state.spawnedAshKnight && !state.ashKnightDefeated && !hasLiveMonster(context, "ashKnight")) {
      state.spawnedAshKnight = false;
    }
    if (state.spawnedEclipseDragon && !state.eclipseDragonDefeated && !hasLiveMonster(context, "eclipseDragon")) {
      state.spawnedEclipseDragon = false;
    }
    if (state.spawnedVoidDragon && !state.voidDragonDefeated && !hasLiveMonster(context, "voidDragon")) {
      state.spawnedVoidDragon = false;
    }
    if (state.spawnedObsidianGolem && !state.obsidianGolemDefeated && !hasLiveMonster(context, "obsidianGolem")) {
      state.spawnedObsidianGolem = false;
    }

    if (ashKnightReady(context) && !state.spawnedAshKnight && playerNearAshKnightSite(context)) {
      state.spawnedAshKnight = true;
      spawnMonster(context, "ashKnight", ASH_KNIGHT_SITE.x * TILE, ASH_KNIGHT_SITE.y * TILE);
      say("古塔の灰騎士が道を塞いだ!", 2600);
    }

    if (eclipseDragonReady(context) && !state.spawnedEclipseDragon && playerNearEclipseDragonSite(context)) {
      state.spawnedEclipseDragon = true;
      spawnMonster(context, "eclipseDragon", ECLIPSE_DRAGON_SITE.x * TILE, ECLIPSE_DRAGON_SITE.y * TILE);
      say("月蝕城の奥で月蝕竜が目覚めた!", 3200);
    }

    if (voidDragonReady(context) && !state.spawnedVoidDragon && playerNearVoidDragonSite(context)) {
      state.spawnedVoidDragon = true;
      spawnMonster(context, "voidDragon", VOID_DRAGON_SITE.x * TILE, VOID_DRAGON_SITE.y * TILE);
      say("黒陽城の奥で黒陽竜が目覚めた!", 3400);
    }

    if (obsidianGolemReady(context) && !state.spawnedObsidianGolem && playerNearObsidianGolemSite(context)) {
      state.spawnedObsidianGolem = true;
      spawnMonster(context, "obsidianGolem", OBSIDIAN_GOLEM_SITE.x * TILE, OBSIDIAN_GOLEM_SITE.y * TILE);
      say("黒曜洞で黒曜巨人が動き出した!", 3000);
    }

    if (state.victory) return;

    if (wardenReady(context) && !state.spawnedWarden && playerNearWardenSite(context)) {
      state.spawnedWarden = true;
      spawnMonster(context, "warden", WARDEN_SITE.x * TILE, WARDEN_SITE.y * TILE);
      say("南東の道番が立ちはだかった!", 2600);
    }
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
    wardenReady,
    ashKnightReady,
    eclipseDragonReady,
    voidDragonReady,
    obsidianGolemReady,
    hasLiveMonster,
    playerNearGuardianSite,
    playerNearWardenSite,
    playerNearAshKnightSite,
    playerNearEclipseDragonSite,
    playerNearVoidDragonSite,
    playerNearObsidianGolemSite,
    updateStoryEvents,
  };
})();
