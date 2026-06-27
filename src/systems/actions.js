"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before action helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before action helpers");
  }

  const {
    TILE,
    WORLD_SCALE,
    DUNGEON_PORTALS,
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    TILE_GRASS,
    TILE_FLOWER,
    TILE_FIELD,
    ATTACK_RANGE,
    ATTACK_WIDTH,
    weaponAttackProfiles,
  } = definitions;

  const {
    centerOf,
    facingDot,
    normalize,
  } = mathHelpers;

  const worldPx = (value) => value * WORLD_SCALE;

  function activeAccessory(player, id, legacyFlag) {
    if (Array.isArray(player.equippedAccessories)) return player.equippedAccessories.includes(id);
    if (player.equippedAccessory) return player.equippedAccessory === id;
    return Boolean(player[legacyFlag]);
  }

  function requireActionContext(context) {
    if (!context?.state || !context?.player) {
      throw new Error("action helpers require { state, player }");
    }
    const requiredFns = [
      "rand",
      "say",
      "facingVector",
      "moveActor",
      "playerAttack",
      "weaponDamageMultiplier",
      "nearestNpc",
      "handleNpc",
      "playerNearCave",
      "handleCave",
      "tileAt",
      "setTile",
      "addFloater",
      "addSlash",
      "addRing",
      "burst",
      "grantChestReward",
      "grantDiscoveryReward",
      "gainFoundItem",
    ];
    for (const name of requiredFns) {
      if (typeof context[name] !== "function") {
        throw new Error(`action helpers require function ${name}`);
      }
    }
    return context;
  }

  function contextAction(context) {
    const { state, player, nearestNpc, playerNearCave } = requireActionContext(context);
    if (state.gameOver || player.hp <= 0) return;
    if (nearestAttackTarget(context)) {
      performAttack(context);
      return;
    }
    if (nearestNpc() || nearestPortal(context) || nearestChest(context) || playerNearCave()) {
      interact(context);
      return;
    }
    performAttack(context);
  }

  function nearestAttackTarget(context) {
    const { state, player, facingVector } = requireActionContext(context);
    const pc = centerOf(player);
    const dir = facingVector();
    let best = null;
    let bestScore = Infinity;
    for (const monster of state.monsters) {
      if (monster.hp <= 0) continue;
      const mc = centerOf(monster);
      const relX = mc.x - pc.x;
      const relY = mc.y - pc.y;
      const forward = relX * dir.x + relY * dir.y;
      const side = Math.abs(relX * -dir.y + relY * dir.x);
      if (forward < -worldPx(4) || forward > ATTACK_RANGE + monster.w) continue;
      if (side > ATTACK_WIDTH / 2 + monster.w / 2) continue;
      const score = forward + side * 0.35;
      if (score < bestScore) {
        best = monster;
        bestScore = score;
      }
    }
    return best;
  }

  function performAttack(context) {
    const { state, player, facingVector, moveActor, addSlash, addRing } = requireActionContext(context);
    if (player.attackCooldown > 0 || state.gameOver || player.hp <= 0) return;
    const profile = weaponAttackProfiles[player.weapon] || weaponAttackProfiles[0];
    const duelist = activeAccessory(player, "duelist", "duelistCharm");
    player.attackCooldown = Math.max(92, Math.round(profile.cooldown * (duelist ? 0.84 : 1)));
    const dir = facingVector();
    if (profile.lunge > 0) moveActor(player, dir.x * worldPx(profile.lunge), dir.y * worldPx(profile.lunge));
    const pc = centerOf(player);
    const attackRange = ATTACK_RANGE * profile.range;
    const attackWidth = ATTACK_WIDTH * profile.width;
    const slashX = pc.x + dir.x * Math.min(attackRange, worldPx(28));
    const slashY = pc.y + dir.y * Math.min(attackRange, worldPx(28));
    addSlash(slashX, slashY, player.dir, profile.color);
    if (profile.width >= 1.35 || profile.power >= 1.4) addRing(pc.x, pc.y, profile.color, attackWidth * 0.72);

    let hitCount = 0;
    for (const monster of state.monsters) {
      if (monster.hp <= 0) continue;
      const mc = centerOf(monster);
      const relX = mc.x - pc.x;
      const relY = mc.y - pc.y;
      const forward = relX * dir.x + relY * dir.y;
      const side = Math.abs(relX * -dir.y + relY * dir.x);
      if (forward < -worldPx(2) || forward > attackRange + monster.w) continue;
      if (side > attackWidth / 2 + monster.w / 2) continue;
      hitMonster(context, monster, profile.power * (1 + Math.min(hitCount, 3) * 0.04), profile.color, profile.knockback);
      hitCount += 1;
    }

    if (hitCount) {
      player.combo += hitCount;
      player.comboTimer = duelist ? 3200 : 2400;
      if (duelist) player.stamina = Math.min(player.staminaMax, player.stamina + 2 + hitCount * 3);
      state.shake = Math.max(state.shake, 60);
    } else {
      player.combo = Math.max(0, player.combo - 1);
    }
  }

  function hitMonster(context, monster, power = 1, color = "#ffffff", knockback = 7) {
    const { player, rand, playerAttack, weaponDamageMultiplier, addFloater, burst, moveActor } = requireActionContext(context);
    const pDot = facingDot(player, monster);
    const mDot = facingDot(monster, player);
    const crit = Math.random() < 0.12 + player.weapon * 0.03;
    const critMult = crit ? 1.55 : 1;
    const gearMult = weaponDamageMultiplier(monster, pDot, mDot);
    const hit = Math.max(1, Math.round(((playerAttack() + rand(0, 4)) * gearMult - monster.def) * power * critMult));
    monster.hp -= hit;
    monster.hurt = 150;
    player.stamina = Math.min(player.staminaMax, player.stamina + 5);
    const pc = centerOf(player);
    const mc = centerOf(monster);
    const away = normalize(mc.x - pc.x, mc.y - pc.y);
    addFloater(mc.x, monster.y, crit ? `${hit}!` : String(hit), crit ? "#ffd166" : color);
    burst(mc.x, mc.y, crit ? "#ffd166" : "#f8fbff", monster.boss ? 10 : 6);
    moveActor(monster, away.x * knockback, away.y * knockback);
  }

  function interact(context) {
    const { state, nearestNpc, handleNpc, playerNearCave, handleCave } = requireActionContext(context);
    if (state.gameOver) return;
    const npc = nearestNpc();
    if (npc) {
      handleNpc(npc);
      return;
    }

    const portal = nearestPortal(context);
    if (portal) {
      traversePortal(context, portal);
      return;
    }

    const chest = nearestChest(context);
    if (chest) {
      openChest(context, chest);
      return;
    }

    if (playerNearCave()) {
      handleCave();
      return;
    }

    searchGround(context);
  }

  function nearestPortal(context) {
    const { state, player } = requireActionContext(context);
    const pc = centerOf(player);
    for (const portal of DUNGEON_PORTALS || []) {
      if (portal.unlock === "frostTowerLift" && !state.discoveries.has("frost-tower-lift")) continue;
      const px = (portal.x + 0.5) * TILE;
      const py = (portal.y + 0.5) * TILE;
      if (Math.hypot(pc.x - px, pc.y - py) < worldPx(22)) return portal;
    }
    return null;
  }

  function traversePortal(context, portal) {
    const { state, player, say, addRing, burst } = requireActionContext(context);
    if (portal.unlock === "moonGatekeeper" && !state.moonGatekeeperDefeated) {
      say("月門の護将が出口を封じている。側面か背後から崩そう", 2600);
      return;
    }
    state.monsters = state.monsters.filter((monster) => monster.boss || monster.midboss);
    state.projectiles = [];
    state.regionSpawnTimer = 0;
    state.spawnTimer = 0;
    player.x = Math.floor((portal.toX + 0.5) * TILE - player.w / 2);
    player.y = Math.floor((portal.toY + 0.5) * TILE - player.h / 2);
    player.invuln = Math.max(player.invuln, 900);
    player.slow = 0;
    addRing(player.x + player.w / 2, player.y + player.h / 2, "#d7b26d", worldPx(34));
    burst(player.x + player.w / 2, player.y + player.h / 2, "#d7b26d", 18);
    say(`${portal.name}へ移動した`, 1800);
  }

  function nearestChest(context) {
    const { state, player } = requireActionContext(context);
    const pc = centerOf(player);
    for (const chest of TREASURE_CHESTS) {
      if (state.chests.has(chest.id)) continue;
      const cx = (chest.x + 0.5) * TILE;
      const cy = (chest.y + 0.5) * TILE;
      if (Math.hypot(pc.x - cx, pc.y - cy) < worldPx(22)) return chest;
    }
    return null;
  }

  function openChest(context, chest) {
    const { state, say, addRing, burst, grantChestReward } = requireActionContext(context);
    if (state.chests.has(chest.id)) return;
    if (chest.id === "regen-cave-ring" && !state.regenSentinelDefeated) {
      say("再生洞の守護者を倒さないと宝箱に近づけない", 2200);
      return;
    }
    if (chest.id === "mist-shrine-cache" && !state.mistKeeperDefeated) {
      say("霧灯の守を倒さないと奥の護符に近づけない", 2200);
      return;
    }
    if (chest.id === "undercity-reliquary" && !state.cryptWardenDefeated) {
      say("地下墓所の番人を倒さないと遺物庫は開かない", 2200);
      return;
    }
    if (chest.id === "moon-archive-reliquary" && !state.archiveWardenDefeated) {
      say("月の書庫の番人を倒さないと遺物庫は開かない", 2200);
      return;
    }
    if (chest.id === "moon-cavern-reliquary" && !state.moonGatekeeperDefeated) {
      say("月門の護将を倒さないと月洞印は受け取れない", 2200);
      return;
    }
    if (chest.id === "frost-core-reliquary" && !state.frostGolemDefeated) {
      say("氷窟巨人を倒さないと霜心の遺物庫は開かない", 2200);
      return;
    }
    if (chest.id === "frost-tower-reliquary" && !state.towerWardenDefeated) {
      say("霜見の塔守を倒さないと最上階の遺物庫は開かない", 2200);
      return;
    }
    if (chest.id === "sunspire-reliquary" && !state.sunspireKeeperDefeated) {
      say("日鏡塔の守主を倒さないと反射水晶には触れられない", 2200);
      return;
    }
    if (chest.id === "suncrest-arena-reliquary" && !state.suncrestChampionDefeated) {
      say("陽冠闘技王を倒さないと闘技場の遺物庫は開かない", 2200);
      return;
    }
    state.chests.add(chest.id);
    const cx = (chest.x + 0.5) * TILE;
    const cy = (chest.y + 0.5) * TILE;
    addRing(cx, cy, "#ffd166", 22);
    burst(cx, cy, "#ffd166", 16);
    grantChestReward(chest.reward);
  }

  function searchGround(context) {
    const { state, player, tileAt, setTile, gainFoundItem, say } = requireActionContext(context);
    if (state.searchCooldown > 0) return;
    state.searchCooldown = 700;
    const chest = nearestChest(context);
    if (chest) {
      openChest(context, chest);
      return;
    }
    const discovery = nearestDiscovery(context);
    if (discovery) {
      revealDiscovery(context, discovery);
      return;
    }
    const tx = Math.floor((player.x + player.w / 2) / TILE);
    const ty = Math.floor((player.y + player.h / 2) / TILE);
    const tile = tileAt(tx, ty);
    if ((tile === TILE_FLOWER || tile === TILE_FIELD || tile === TILE_GRASS) && Math.random() < 0.55) {
      gainFoundItem(tile);
      setTile(tx, ty, TILE_GRASS);
    } else {
      say("何も見つからない");
    }
  }

  function nearestDiscovery(context) {
    const { player } = requireActionContext(context);
    const pc = centerOf(player);
    for (const discovery of DISCOVERY_POINTS) {
      const dx = (discovery.x + 0.5) * TILE;
      const dy = (discovery.y + 0.5) * TILE;
      if (Math.hypot(pc.x - dx, pc.y - dy) < worldPx(20)) return discovery;
    }
    return null;
  }

  function rereadDiscoveryMessage(discovery) {
    const messages = {
      waystone: "\u53e4\u3044\u9053\u6a19\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u6708\u5f71\u5ec3\u589f\u3078\u306e\u9053\u7b4b\u304c\u523b\u307e\u308c\u3066\u3044\u308b",
      eclipseSeal: "\u6708\u8755\u306e\u5c01\u5370\u7891\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u6708\u8755\u57ce\u3078\u306e\u9053\u306f\u958b\u304b\u308c\u3066\u3044\u308b",
      voidSeal: "\u9ed2\u967d\u306e\u5c01\u5370\u7891\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u9ed2\u967d\u7adc\u3078\u6311\u3080\u6e96\u5099\u3092\u6574\u3048\u3088\u3046",
      sunriseSeal: "\u967d\u5149\u306e\u5c01\u5370\u7891\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u719f\u706b\u7fa4\u5cf6\u3078\u5411\u304b\u3046\u524d\u54e8\u8def\u304c\u793a\u3055\u308c\u3066\u3044\u308b",
      solarWardenHint: "\u713c\u3051\u305f\u9053\u6a19\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u9ece\u660e\u6e2f\u304b\u3089\u5317\u6771\u9ad8\u539f\u3078\u3001\u7832\u58f0\u3092\u8ffd\u3048",
      suncrestApproachHint: "\u967d\u51a0\u90fd\u5e02\u524d\u54e8\u306e\u672d\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u7832\u53f0\u306e\u5357\u306e\u8c37\u3092\u629c\u3051\u308c\u3070\u90fd\u5e02\u3060",
      dragonCaveHint: "\u7126\u3052\u305f\u77f3\u7891\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u6751\u306e\u5317\u6771\u3001\u5ca9\u5c71\u306e\u71b1\u3044\u6d1e\u304c\u7adc\u306e\u5de3\u3060",
      sunspireHint: "\u65e5\u93e1\u5854\u306e\u8a18\u9332\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u5149\u67f1\u93e1\u3092\u5148\u306b\u58ca\u3059\u3068\u5854\u306e\u5727\u529b\u304c\u843d\u3061\u308b",
      moonArchiveHint: "\u6708\u306e\u66f8\u5eab\u306e\u8a18\u9332\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u53ec\u559a\u58eb\u3092\u653e\u7f6e\u305b\u305a\u756a\u4eba\u3092\u5012\u305b",
      moonCavernHint: "\u6708\u5f71\u6d1e\u7a9f\u306e\u9053\u6a19\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u9014\u4e2d\u306e\u88dc\u7d66\u3092\u62fe\u3044\u3001\u6771\u51fa\u53e3\u3078\u629c\u3051\u308b",
      blackGateHint: "\u9ed2\u9580\u524d\u54e8\u306e\u9053\u6a19\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u5317\u9053\u306f\u76fe\u5175\u3001\u5357\u9053\u306f\u7f60\u306b\u6ce8\u610f",
      suncrestGuide: "\u967d\u51a0\u90fd\u5e02\u306e\u63b2\u793a\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u5317\u6771\u9ad8\u539f\u3001\u65e5\u93e1\u5854\u3001\u5357\u8857\u9053\u306e\u9806\u306b\u9032\u3081",
      suncrestArenaHint: "\u967d\u51a0\u95d8\u6280\u5834\u306e\u672d\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u95d8\u6280\u5834\u306f\u672c\u7dda\u5f8c\u306e\u4efb\u610f\u6311\u6226\u3060",
      frostTowerHint: "\u5854\u306e\u8a18\u9332\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u5149\u67f1\u93e1\u3092\u5148\u306b\u58ca\u3057\u3066\u4e8c\u968e\u306e\u5854\u5b88\u3078\u9032\u3081",
      frostTowerLift: "\u6607\u964d\u6a5f\u306e\u7891\u6587\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u971c\u539f\u304b\u3089\u4e8c\u968e\u3078\u76f4\u884c\u3067\u304d\u308b",
      routeHint: "\u65c5\u306e\u899a\u3048\u66f8\u304d\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u5371\u967a\u306a\u8fd1\u9053\u306b\u306f\u76fe\u3068\u5e30\u9084\u672d\u304c\u5f79\u7acb\u3064",
      smugglerHint: "\u5bc6\u8f38\u9053\u306e\u672d\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u897f\u306e\u7e26\u9053\u306f\u8fd1\u9053\u3060\u304c\u7f60\u3068\u76fe\u5175\u304c\u591a\u3044",
      greaterRegenHint: "\u6d1e\u7a9f\u306e\u30e1\u30e2\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u5927\u518d\u751f\u306e\u6307\u8f2a\u306f\u5965\u306e\u5b88\u306b\u5b88\u3089\u308c\u3066\u3044\u308b",
      shortcutHint: "\u5d29\u308c\u305f\u9580\u306e\u5370\u3092\u8aad\u307f\u8fd4\u3057\u305f\u3002\u629c\u3051\u9053\u3068\u5e30\u9084\u672d\u306e\u4f4d\u7f6e\u3092\u601d\u3044\u51fa\u3057\u305f",
      spring: "\u96a0\u308c\u6cc9\u3092\u3082\u3046\u4e00\u5ea6\u8abf\u3079\u305f\u3002\u3053\u3053\u3067\u56de\u5fa9\u3067\u304d\u308b",
      ore: "\u53e4\u3044\u9271\u8108\u3092\u3082\u3046\u4e00\u5ea6\u8abf\u3079\u305f\u3002\u63a1\u308c\u308b\u3082\u306e\u306f\u3082\u3046\u6b8b\u3063\u3066\u3044\u306a\u3044",
      cache: "\u72e9\u4eba\u306e\u5c0f\u7bb1\u3092\u3082\u3046\u4e00\u5ea6\u8abf\u3079\u305f\u3002\u4e2d\u8eab\u306f\u56de\u53ce\u6e08\u307f\u3060",
    };
    return messages[discovery.kind] || "\u8abf\u3079\u305f\u5185\u5bb9\u3092\u8aad\u307f\u8fd4\u3057\u305f";
  }

  function revealDiscovery(context, discovery) {
    const { state, say, addRing, grantDiscoveryReward } = requireActionContext(context);
    const dx = (discovery.x + 0.5) * TILE;
    const dy = (discovery.y + 0.5) * TILE;
    if (state.discoveries.has(discovery.id)) {
      addRing(dx, dy, "#bafc87", worldPx(14));
      say(rereadDiscoveryMessage(discovery), 2600);
      return;
    }
    state.discoveries.add(discovery.id);
    addRing(dx, dy, "#bafc87", worldPx(24));
    grantDiscoveryReward(discovery, dx, dy);
  }

  globalThis.DRAGON_HUNTER_ACTIONS = {
    contextAction,
    nearestAttackTarget,
    performAttack,
    hitMonster,
    interact,
    nearestPortal,
    traversePortal,
    nearestChest,
    openChest,
    searchGround,
    nearestDiscovery,
    revealDiscovery,
  };
})();
