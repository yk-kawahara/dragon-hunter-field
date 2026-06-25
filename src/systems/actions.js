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
    player.attackCooldown = profile.cooldown;
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
      player.comboTimer = 2400;
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
    const { state, player } = requireActionContext(context);
    const pc = centerOf(player);
    for (const discovery of DISCOVERY_POINTS) {
      if (state.discoveries.has(discovery.id)) continue;
      const dx = (discovery.x + 0.5) * TILE;
      const dy = (discovery.y + 0.5) * TILE;
      if (Math.hypot(pc.x - dx, pc.y - dy) < worldPx(20)) return discovery;
    }
    return null;
  }

  function revealDiscovery(context, discovery) {
    const { state, say, addRing, grantDiscoveryReward } = requireActionContext(context);
    if (state.discoveries.has(discovery.id)) {
      say("既に調べた場所だ");
      return;
    }
    state.discoveries.add(discovery.id);
    const dx = (discovery.x + 0.5) * TILE;
    const dy = (discovery.y + 0.5) * TILE;
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
