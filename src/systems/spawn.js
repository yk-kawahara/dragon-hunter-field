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
    SMUGGLER_CAPTAIN_SITE,
    SMUGGLER_CAPTAIN_REQUIREMENTS,
    REGEN_SENTINEL_SITE,
    REGEN_SENTINEL_REQUIREMENTS,
    MIST_KEEPER_SITE,
    MIST_KEEPER_REQUIREMENTS,
    CRYPT_WARDEN_SITE,
    CRYPT_WARDEN_REQUIREMENTS,
    FROST_GOLEM_SITE,
    FROST_GOLEM_REQUIREMENTS,
    FROST_TOWER_WARDEN_SITE,
    FROST_TOWER_WARDEN_REQUIREMENTS,
    FROST_DRAGON_SITE,
    CHAPTER4_REQUIREMENTS,
    SOLAR_WARDEN_SITE,
    SOLAR_WARDEN_REQUIREMENTS,
    SUNSPIRE_KEEPER_SITE,
    SUNSPIRE_KEEPER_REQUIREMENTS,
    EMBER_DRAGON_SITE,
    CHAPTER5_REQUIREMENTS,
    monsterTypes,
  } = definitions;

  const {
    clamp,
    centerOf,
    normalize,
  } = mathHelpers;

  const worldPx = (value) => value * WORLD_SCALE;
  const INTERIOR_REGIONS = new Set(["cave", "undercity", "frostTower1", "frostTower2", "sunspire"]);

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
      spawnRegion: regionAtPosition(x + size / 2, y + size / 2),
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
      patternCooldown: template.boss ? rand(2400, 3600) : 0,
      patternState: "idle",
      patternWindup: 0,
      patternWaveCooldown: 0,
      patternWaves: 0,
      patternIndex: 0,
      patternAim: { x: 0, y: 1 },
      specialState: "idle",
      specialWindup: 0,
      specialIndex: 0,
      specialTargets: [],
      specialAim: { x: 0, y: 1 },
      summonCooldown: typeName === "summoner" ? rand(1800, 3200) : 0,
      summonAnnounced: false,
      trapTimer: 0,
      trapPrimed: false,
      trapAnnounced: false,
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
    return regionAtPosition(player.x + player.w / 2, player.y + player.h / 2);
  }

  function regionAtPosition(x, y) {
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    if (tx >= 190 && ty >= 185) return "emberIsles";
    if (tx >= 160 && tx <= 195 && ty >= 1 && ty <= 23) return "sunspire";
    if (tx >= 198 && ty < 90) return "dawnCoast";
    if (tx >= 190) return "sunriseHighland";
    if (tx >= 132 && ty < 80) return "windCoast";
    if (tx >= 132 && ty < 154) return "eastHighland";
    if (tx >= 132) return "windCoast";
    if (ty >= 160) return "southIsles";
    if (tx >= 80 && tx <= 119 && ty >= 1 && ty <= 14) return "undercity";
    if (tx >= 88 && tx <= 102 && ty >= 18 && ty <= 32) return "frostTower1";
    if (tx >= 104 && tx <= 118 && ty >= 18 && ty <= 32) return "frostTower2";
    if (ty >= 144 && tx >= 90) return "frostCitadel";
    if (ty >= 150 && tx >= 48 && tx <= 70) return "frostCave";
    if (ty >= 144) return "frost";
    if (tx >= 62 && tx <= 84 && ty >= 116 && ty <= 126) return "mistShrine";
    if (tx >= 24 && tx <= 58 && ty >= 120 && ty <= 127) return "regenCave";
    if (tx >= 18 && tx <= 23 && ty >= 95 && ty <= 128) return "smuggler";
    if (ty >= 128 && tx <= 58) return "obsidian";
    if (ty >= 128) return "void";
    if (ty >= 112) return "eclipse";
    if (ty >= 96) return "moon";
    if ((tx >= 90 && tx <= 115 && ty >= 84) || (tx >= 105 && tx <= 116 && ty >= 36 && ty <= 47)) return "tower";
    if (tx >= 24 && tx < 80 && ty >= 72 && ty < 96) return "highland";
    if (tx >= 80 || ty >= 72) return "ash";
    if (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 18) return "cave";
    if (tx >= 20 && tx <= 43 && ty >= 60) return "mine";
    if (tx > 40) return "east";
    if (ty < 25) return "north";
    if (Math.hypot(x - 12 * TILE, y - 48 * TILE) > worldPx(330)) return "wilds";
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
      if (region === "smuggler") return ["boar", "wisp", "shieldSoldier"];
      if (region === "regenCave") return ["bubbler", "wisp", "trapFlower"];
      if (region === "mistShrine") return ["bubbler", "wisp", "trapFlower"];
      if (region === "undercity") return ["shieldSoldier", "wisp", "vaultLeech"];
      if (region === "frostTower1" || region === "frostTower2") return ["frostBeacon", "frostMoth", "shieldSoldier"];
      if (region === "sunspire") return ["prismBeacon", "solarRunner", "shieldSoldier"];
      if (region === "frost" || region === "frostCave" || region === "frostCitadel") return ["frostMoth", "frostBeast", "shieldSoldier"];
      const safePool = region === "grassland" ? ["slime", "slime", "bat"] : pool.filter((type) => !["dragonling", "wisp", "summoner", "trapFlower", "sorcerer", "moonShade", "eclipseMage", "voidWraith", "obsidianCrawler", "shieldSoldier", "mistLancer", "mistKeeper"].includes(type));
      return safePool.length ? safePool : ["bat", "boar"];
    }
    if (lv >= 3 && region === "grassland") pool.push("boar");
    if (lv >= 4 && region !== "grassland") pool.push("dragonling");
    if (lv >= 3 && region === "mine") pool.push("dragonling");
    if (lv >= 8 && (region === "ash" || region === "tower" || region === "moon")) pool.push("sorcerer");
    if (lv >= 12 && region === "moon") pool.push("moonShade");
    if (lv < 14 && (region === "smuggler" || region === "regenCave" || region === "undercity")) {
      const earlyDanger = pool.filter((type) => type !== "summoner" && type !== "obsidianCrawler" && type !== "moonShade");
      earlyDanger.push("boar", "wisp");
      return earlyDanger;
    }
    if (lv < 14) return pool.filter((type) => type !== "summoner" && type !== "trapFlower");
    if (lv < 16 && (region === "moon" || region === "eclipse")) return pool.filter((type) => type !== "trapFlower" && !(region === "eclipse" && type === "summoner"));
    if (lv < 18 && region === "eclipse") return pool.filter((type) => type !== "summoner");
    if (lv < 22 && (region === "obsidian" || region === "void")) return pool.filter((type) => type !== "summoner" && type !== "trapFlower");
    if (lv >= 14 && region === "moon") pool.push("summoner");
    if (lv >= 16 && (region === "moon" || region === "eclipse")) pool.push("trapFlower");
    if (lv >= 16 && region === "eclipse") pool.push("eclipseMage", "moonShade");
    if (lv >= 18 && region === "eclipse") pool.push("summoner");
    if (lv >= 20 && region === "eclipse") pool.push("eclipseMage");
    if (lv >= 22 && region === "void") pool.push("voidWraith", "eclipseMage");
    if (lv >= 22 && (region === "obsidian" || region === "void")) pool.push("summoner");
    if (lv >= 22 && (region === "obsidian" || region === "void")) pool.push("trapFlower");
    if (lv >= 26 && region === "void") pool.push("voidWraith", "voidWraith");
    if (lv >= 22 && region === "obsidian") pool.push("obsidianCrawler", "voidWraith");
    if (lv >= 24 && region === "obsidian") pool.push("obsidianCrawler", "obsidianCrawler");
    if (lv >= 28 && (region === "frost" || region === "frostCave" || region === "frostCitadel")) pool.push("frostMoth", "frostBeast");
    if (lv >= 32 && region === "frostCitadel") pool.push("frostMoth", "summoner");
    if (lv >= 30 && (region === "frostTower1" || region === "frostTower2")) pool.push("frostBeacon", "frostMoth");
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
    const interior = INTERIOR_REGIONS.has(region);
    const population = interior ? countRegionMonsters(context, region) : state.monsters.length;
    if (state.spawnTimer > 0 || population >= maxMonsters) return;
    state.spawnTimer = rand(780, 1320) / regionInfo.danger;

    for (let i = 0; i < 40; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const radius = interior ? rand(worldPx(38), worldPx(98)) : rand(worldPx(92), worldPx(190 + regionInfo.danger * 18));
      const x = clamp(player.x + Math.cos(angle) * radius, TILE, MAP_W * TILE - TILE * 2);
      const y = clamp(player.y + Math.sin(angle) * radius, TILE, MAP_H * TILE - TILE * 2);
      const actor = { x, y, w: worldPx(12), h: worldPx(12), flying: false };
      if (inTown(x, y)) continue;
      if (interior && regionAtPosition(x, y) !== region) continue;
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
    const interior = INTERIOR_REGIONS.has(region);
    const target = region === "grassland" ? 3 : region === "wilds" ? 4 : region === "north" ? 5 : region === "east" ? 6 : region === "ash" ? 7 : region === "tower" ? 8 : region === "moon" ? 9 : region === "eclipse" ? 11 : region === "smuggler" ? 10 : region === "regenCave" ? 11 : region === "mistShrine" ? 11 : region === "undercity" ? 12 : region === "obsidian" ? 12 : region === "void" ? 13 : region === "frost" ? 11 : region === "frostCave" ? 12 : region === "frostCitadel" ? 14 : region === "frostTower1" ? 10 : region === "frostTower2" ? 12 : region === "dawnCoast" ? 12 : region === "sunriseHighland" ? 14 : region === "sunspire" ? 13 : region === "emberIsles" ? 15 : 6;
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
    const localPopulation = interior ? countRegionMonsters(context, region) : state.monsters.length;
    if (state.regionSpawnTimer > 0 || localPopulation >= maxMonsters) return;
    state.regionSpawnTimer = interior ? 900 : 1600;
    for (let i = nearby; i < target && (interior ? countRegionMonsters(context, region) : state.monsters.length) < maxMonsters; i += 1) {
      const minRadius = interior ? worldPx(36 + i * 3) : worldPx(105 + i * 16);
      const maxRadius = interior ? worldPx(92 + i * 4) : worldPx(235 + i * 10);
      spawnNearPlayer(context, region, minRadius, maxRadius);
    }
  }

  function pruneDistantMonsters(context, maxDistance = worldPx(520)) {
    const { state, player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const region = currentRegion(context);
    const interior = INTERIOR_REGIONS.has(region);
    state.monsters = state.monsters.filter((monster) => {
      if (monster.boss || monster.midboss) return true;
      const mc = centerOf(monster);
      if (interior && regionAtPosition(mc.x, mc.y) !== region) return false;
      return Math.hypot(mc.x - pc.x, mc.y - pc.y) < maxDistance;
    });
  }

  function countNearbyMonsters(context, radius) {
    const { state, player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const region = currentRegion(context);
    const interior = INTERIOR_REGIONS.has(region);
    return state.monsters.filter((monster) => {
      if (monster.hp <= 0) return false;
      const mc = centerOf(monster);
      if (interior && regionAtPosition(mc.x, mc.y) !== region) return false;
      return Math.hypot(mc.x - pc.x, mc.y - pc.y) < radius;
    }).length;
  }

  function countRegionMonsters(context, region) {
    const { state } = requireSpawnContext(context);
    return state.monsters.filter((monster) => {
      if (monster.hp <= 0) return false;
      const mc = centerOf(monster);
      return regionAtPosition(mc.x, mc.y) === region;
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
      if (INTERIOR_REGIONS.has(region) && regionAtPosition(x + size / 2, y + size / 2) !== region) continue;
      if (isPassableRect(actor)) {
        spawnMonster(context, type, x, y);
        return true;
      }
    }
    return false;
  }

  function areaDangerText(region) {
    if (region === "frostTower2") return "霜見塔二階: 凍気灯と塔守の領域";
    if (region === "eastHighland") return "蒼風島内陸: 山越えの強敵地帯";
    if (region === "windCoast") return "蒼風海岸: 港から離れるほど危険";
    if (region === "southIsles") return "南岬群島: 退路の長い海辺の遠征";
    if (region === "dawnCoast") return "黎明海岸: 外洋の先で霧槍兵と凍気敵が待つ";
    if (region === "sunriseHighland") return "日出高原: 山脈・谷・都市街道を強敵が巡回する";
    if (region === "sunspire") return "日鏡塔: 反射鏡と閃光走者が光弾を重ねる";
    if (region === "emberIsles") return "熾火群島: 罠・召喚・重圧が重なる最深部";
    if (region === "frostTower1") return "霜見塔一階: 退路を確かめて登れ";
    if (region === "frostCitadel") return "霜冠城: 第4章の最奥";
    if (region === "frostCave") return "氷窟: 巨人と吸命の巣";
    if (region === "frost") return "霜原: 白銀宿より先は凍結地帯";
    if (region === "undercity") return "黒市地下墓所: 吸命鬼と墓守の領域";
    if (region === "obsidian") return "黒曜洞: 黒市の外は巨人の縄張り";
    if (region === "void") return "黒陽領: 第3章の高難度地帯";
    if (region === "eclipse") return "月蝕城: 第2章の最奥";
    if (region === "mistShrine") return "霧灯の祠: 罠と召喚が濃い寄り道";
    if (region === "regenCave") return "再生洞窟: 大再生の指輪を守る危険地帯";
    if (region === "smuggler") return "密輸道: 黒市へ抜ける危険な近道";
    if (region === "moon") return "月影廃墟: 古塔の先の危険地帯";
    if (region === "highland") return "天脊高原: 峠・谷道・危険な近道";
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

  function smugglerCaptainReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.smugglerCaptainDefeated && player.level >= SMUGGLER_CAPTAIN_REQUIREMENTS.level;
  }

  function regenSentinelReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.regenSentinelDefeated && player.level >= REGEN_SENTINEL_REQUIREMENTS.level;
  }

  function mistKeeperReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.mistKeeperDefeated
      && state.regenSentinelDefeated
      && player.level >= MIST_KEEPER_REQUIREMENTS.level;
  }

  function cryptWardenReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.cryptWardenDefeated
      && state.chapter2Reported
      && player.level >= CRYPT_WARDEN_REQUIREMENTS.level;
  }

  function frostGolemReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.frostGolemDefeated
      && state.chapter3Reported
      && player.level >= FROST_GOLEM_REQUIREMENTS.level;
  }

  function towerWardenReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.towerWardenDefeated
      && state.chapter3Reported
      && player.level >= FROST_TOWER_WARDEN_REQUIREMENTS.level;
  }

  function frostDragonReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.frostDragonDefeated
      && state.chapter3Reported
      && state.frostGolemDefeated
      && state.discoveries.has("frost-seal")
      && player.level >= CHAPTER4_REQUIREMENTS.level;
  }

  function solarWardenReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.solarWardenDefeated
      && state.chapter4Reported
      && player.level >= SOLAR_WARDEN_REQUIREMENTS.level;
  }

  function sunspireKeeperReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.sunspireKeeperDefeated
      && state.chapter4Reported
      && state.solarWardenDefeated
      && player.level >= SUNSPIRE_KEEPER_REQUIREMENTS.level;
  }

  function emberDragonReady(context) {
    const { state, player } = requireSpawnContext(context);
    return !state.emberDragonDefeated
      && state.chapter4Reported
      && state.solarWardenDefeated
      && state.sunspireKeeperDefeated
      && state.chests.has("sunspire-reliquary")
      && state.discoveries.has("sunrise-seal")
      && state.chests.has("ember-sanctum-cache")
      && player.level >= CHAPTER5_REQUIREMENTS.level;
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

  function playerNearSmugglerCaptainSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const sx = (SMUGGLER_CAPTAIN_SITE.x + 0.5) * TILE;
    const sy = (SMUGGLER_CAPTAIN_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - sx, pc.y - sy) < worldPx(92);
  }

  function playerNearRegenSentinelSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const rx = (REGEN_SENTINEL_SITE.x + 0.5) * TILE;
    const ry = (REGEN_SENTINEL_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - rx, pc.y - ry) < worldPx(98);
  }

  function playerNearMistKeeperSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const mx = (MIST_KEEPER_SITE.x + 0.5) * TILE;
    const my = (MIST_KEEPER_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - mx, pc.y - my) < worldPx(98);
  }

  function playerNearCryptWardenSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const cx = (CRYPT_WARDEN_SITE.x + 0.5) * TILE;
    const cy = (CRYPT_WARDEN_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - cx, pc.y - cy) < worldPx(98);
  }

  function playerNearFrostGolemSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const gx = (FROST_GOLEM_SITE.x + 0.5) * TILE;
    const gy = (FROST_GOLEM_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - gx, pc.y - gy) < worldPx(104);
  }

  function playerNearTowerWardenSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const wx = (FROST_TOWER_WARDEN_SITE.x + 0.5) * TILE;
    const wy = (FROST_TOWER_WARDEN_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - wx, pc.y - wy) < worldPx(96);
  }

  function playerNearFrostDragonSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const dx = (FROST_DRAGON_SITE.x + 0.5) * TILE;
    const dy = (FROST_DRAGON_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - dx, pc.y - dy) < worldPx(112);
  }

  function playerNearSolarWardenSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const sx = (SOLAR_WARDEN_SITE.x + 0.5) * TILE;
    const sy = (SOLAR_WARDEN_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - sx, pc.y - sy) < worldPx(118);
  }

  function playerNearSunspireKeeperSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const sx = (SUNSPIRE_KEEPER_SITE.x + 0.5) * TILE;
    const sy = (SUNSPIRE_KEEPER_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - sx, pc.y - sy) < worldPx(104);
  }

  function playerNearEmberDragonSite(context) {
    const { player } = requireSpawnContext(context);
    const pc = centerOf(player);
    const ex = (EMBER_DRAGON_SITE.x + 0.5) * TILE;
    const ey = (EMBER_DRAGON_SITE.y + 0.5) * TILE;
    return Math.hypot(pc.x - ex, pc.y - ey) < worldPx(124);
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
    if (state.spawnedSmugglerCaptain && !state.smugglerCaptainDefeated && !hasLiveMonster(context, "smugglerCaptain")) {
      state.spawnedSmugglerCaptain = false;
    }
    if (state.spawnedRegenSentinel && !state.regenSentinelDefeated && !hasLiveMonster(context, "regenSentinel")) {
      state.spawnedRegenSentinel = false;
    }
    if (state.spawnedMistKeeper && !state.mistKeeperDefeated && !hasLiveMonster(context, "mistKeeper")) {
      state.spawnedMistKeeper = false;
    }
    if (state.spawnedCryptWarden && !state.cryptWardenDefeated && !hasLiveMonster(context, "cryptWarden")) {
      state.spawnedCryptWarden = false;
    }
    if (state.spawnedFrostGolem && !state.frostGolemDefeated && !hasLiveMonster(context, "frostGolem")) {
      state.spawnedFrostGolem = false;
    }
    if (state.spawnedTowerWarden && !state.towerWardenDefeated && !hasLiveMonster(context, "towerWarden")) {
      state.spawnedTowerWarden = false;
    }
    if (state.spawnedFrostDragon && !state.frostDragonDefeated && !hasLiveMonster(context, "frostDragon")) {
      state.spawnedFrostDragon = false;
    }
    if (state.spawnedSolarWarden && !state.solarWardenDefeated && !hasLiveMonster(context, "solarWarden")) {
      state.spawnedSolarWarden = false;
    }
    if (state.spawnedSunspireKeeper && !state.sunspireKeeperDefeated && !hasLiveMonster(context, "sunspireKeeper")) {
      state.spawnedSunspireKeeper = false;
    }
    if (state.spawnedEmberDragon && !state.emberDragonDefeated && !hasLiveMonster(context, "emberDragon")) {
      state.spawnedEmberDragon = false;
    }

    if (smugglerCaptainReady(context) && !state.spawnedSmugglerCaptain && playerNearSmugglerCaptainSite(context)) {
      state.spawnedSmugglerCaptain = true;
      spawnMonster(context, "smugglerCaptain", SMUGGLER_CAPTAIN_SITE.x * TILE, SMUGGLER_CAPTAIN_SITE.y * TILE);
      say("密輸道の隊長が退路を塞いだ!", 2600);
    }

    if (regenSentinelReady(context) && !state.spawnedRegenSentinel && playerNearRegenSentinelSite(context)) {
      state.spawnedRegenSentinel = true;
      spawnMonster(context, "regenSentinel", REGEN_SENTINEL_SITE.x * TILE, REGEN_SENTINEL_SITE.y * TILE);
      say("再生洞の守護者が指輪を守っている!", 3000);
    }

    if (mistKeeperReady(context) && !state.spawnedMistKeeper && playerNearMistKeeperSite(context)) {
      state.spawnedMistKeeper = true;
      spawnMonster(context, "mistKeeper", MIST_KEEPER_SITE.x * TILE, MIST_KEEPER_SITE.y * TILE);
      say("霧灯の守が祠の奥に立ちはだかった!", 3000);
    }

    if (cryptWardenReady(context) && !state.spawnedCryptWarden && playerNearCryptWardenSite(context)) {
      state.spawnedCryptWarden = true;
      spawnMonster(context, "cryptWarden", CRYPT_WARDEN_SITE.x * TILE, CRYPT_WARDEN_SITE.y * TILE);
      say("地下墓所の番人が吸命鬼を呼び起こした!", 3200);
    }

    if (frostGolemReady(context) && !state.spawnedFrostGolem && playerNearFrostGolemSite(context)) {
      state.spawnedFrostGolem = true;
      spawnMonster(context, "frostGolem", FROST_GOLEM_SITE.x * TILE, FROST_GOLEM_SITE.y * TILE);
      say("氷窟の奥で氷窟巨人が目覚めた!", 3200);
    }

    if (towerWardenReady(context) && !state.spawnedTowerWarden && playerNearTowerWardenSite(context)) {
      state.spawnedTowerWarden = true;
      spawnMonster(context, "towerWarden", FROST_TOWER_WARDEN_SITE.x * TILE, FROST_TOWER_WARDEN_SITE.y * TILE);
      say("霜見塔の最上階で塔守が目覚めた!", 3400);
    }

    if (frostDragonReady(context) && !state.spawnedFrostDragon && playerNearFrostDragonSite(context)) {
      state.spawnedFrostDragon = true;
      spawnMonster(context, "frostDragon", FROST_DRAGON_SITE.x * TILE, FROST_DRAGON_SITE.y * TILE);
      say("霜冠城の奥で霜冠竜が目覚めた!", 3600);
    }

    if (solarWardenReady(context) && !state.spawnedSolarWarden && playerNearSolarWardenSite(context)) {
      state.spawnedSolarWarden = true;
      spawnMonster(context, "solarWarden", SOLAR_WARDEN_SITE.x * TILE, SOLAR_WARDEN_SITE.y * TILE);
      say("日出高原の砲台から日輪砲台守が起動した!", 3600);
    }

    if (sunspireKeeperReady(context) && !state.spawnedSunspireKeeper && playerNearSunspireKeeperSite(context)) {
      state.spawnedSunspireKeeper = true;
      spawnMonster(context, "sunspireKeeper", SUNSPIRE_KEEPER_SITE.x * TILE, SUNSPIRE_KEEPER_SITE.y * TILE);
      say("日鏡塔の守主が反射水晶を守って現れた!", 3600);
    }

    if (emberDragonReady(context) && !state.spawnedEmberDragon && playerNearEmberDragonSite(context)) {
      state.spawnedEmberDragon = true;
      spawnMonster(context, "emberDragon", EMBER_DRAGON_SITE.x * TILE, EMBER_DRAGON_SITE.y * TILE);
      say("熾火聖域の空を裂いて熾火天竜が降り立った!", 4000);
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
    regionAtPosition,
    distanceFromVillage,
    monsterPoolForRegion,
    trySpawnMonster,
    updateRegionSpawns,
    pruneDistantMonsters,
    countNearbyMonsters,
    countRegionMonsters,
    spawnNearPlayer,
    areaDangerText,
    guardianReady,
    wardenReady,
    ashKnightReady,
    eclipseDragonReady,
    voidDragonReady,
    obsidianGolemReady,
    smugglerCaptainReady,
    regenSentinelReady,
    mistKeeperReady,
    cryptWardenReady,
    frostGolemReady,
    towerWardenReady,
    frostDragonReady,
    solarWardenReady,
    sunspireKeeperReady,
    emberDragonReady,
    hasLiveMonster,
    playerNearGuardianSite,
    playerNearWardenSite,
    playerNearAshKnightSite,
    playerNearEclipseDragonSite,
    playerNearVoidDragonSite,
    playerNearObsidianGolemSite,
    playerNearSmugglerCaptainSite,
    playerNearRegenSentinelSite,
    playerNearMistKeeperSite,
    playerNearCryptWardenSite,
    playerNearFrostGolemSite,
    playerNearTowerWardenSite,
    playerNearFrostDragonSite,
    playerNearSolarWardenSite,
    playerNearSunspireKeeperSite,
    playerNearEmberDragonSite,
    updateStoryEvents,
  };
})();
