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
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    TILE_GRASS,
    TILE_FLOWER,
    TILE_FIELD,
    ATTACK_RANGE,
    ATTACK_WIDTH,
  } = definitions;

  const {
    centerOf,
    facingDot,
    normalize,
  } = mathHelpers;

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
    if (nearestNpc() || nearestChest(context) || playerNearCave()) {
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
      if (forward < -4 || forward > ATTACK_RANGE + monster.w) continue;
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
    const { state, player, facingVector, addSlash } = requireActionContext(context);
    if (player.attackCooldown > 0 || state.gameOver || player.hp <= 0) return;
    player.attackCooldown = 230;
    const pc = centerOf(player);
    const dir = facingVector();
    const slashX = pc.x + dir.x * 14;
    const slashY = pc.y + dir.y * 14;
    addSlash(slashX, slashY, player.dir, "#f8fbff");

    let hitCount = 0;
    for (const monster of state.monsters) {
      if (monster.hp <= 0) continue;
      const mc = centerOf(monster);
      const relX = mc.x - pc.x;
      const relY = mc.y - pc.y;
      const forward = relX * dir.x + relY * dir.y;
      const side = Math.abs(relX * -dir.y + relY * dir.x);
      if (forward < -2 || forward > ATTACK_RANGE + monster.w) continue;
      if (side > ATTACK_WIDTH / 2 + monster.w / 2) continue;
      hitMonster(context, monster, 1.08 + hitCount * 0.08, "#ffffff");
      hitCount += 1;
    }

    if (hitCount) {
      player.comboTimer = 2400;
      state.shake = Math.max(state.shake, 60);
    } else {
      player.combo = Math.max(0, player.combo - 1);
    }
  }

  function hitMonster(context, monster, power = 1, color = "#ffffff") {
    const { player, rand, playerAttack, weaponDamageMultiplier, addFloater, burst, moveActor } = requireActionContext(context);
    const pDot = facingDot(player, monster);
    const mDot = facingDot(monster, player);
    const crit = Math.random() < 0.12 + player.weapon * 0.03;
    const critMult = crit ? 1.55 : 1;
    const hit = Math.max(1, Math.round((playerAttack() - monster.def + rand(0, 4)) * power * critMult * weaponDamageMultiplier(monster, pDot, mDot)));
    monster.hp -= hit;
    monster.hurt = 150;
    player.stamina = Math.min(player.staminaMax, player.stamina + 5);
    const pc = centerOf(player);
    const mc = centerOf(monster);
    const away = normalize(mc.x - pc.x, mc.y - pc.y);
    addFloater(mc.x, monster.y, crit ? `${hit}!` : String(hit), crit ? "#ffd166" : color);
    burst(mc.x, mc.y, crit ? "#ffd166" : "#f8fbff", monster.boss ? 10 : 6);
    moveActor(monster, away.x * 7, away.y * 7);
  }

  function interact(context) {
    const { state, nearestNpc, handleNpc, playerNearCave, handleCave } = requireActionContext(context);
    if (state.gameOver) return;
    const npc = nearestNpc();
    if (npc) {
      handleNpc(npc);
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

  function nearestChest(context) {
    const { state, player } = requireActionContext(context);
    const pc = centerOf(player);
    for (const chest of TREASURE_CHESTS) {
      if (state.chests.has(chest.id)) continue;
      const cx = (chest.x + 0.5) * TILE;
      const cy = (chest.y + 0.5) * TILE;
      if (Math.hypot(pc.x - cx, pc.y - cy) < 22) return chest;
    }
    return null;
  }

  function openChest(context, chest) {
    const { state, addRing, burst, grantChestReward } = requireActionContext(context);
    if (state.chests.has(chest.id)) return;
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
      if (Math.hypot(pc.x - dx, pc.y - dy) < 20) return discovery;
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
    addRing(dx, dy, "#bafc87", 24);
    grantDiscoveryReward(discovery, dx, dy);
  }

  globalThis.DRAGON_HUNTER_ACTIONS = {
    contextAction,
    nearestAttackTarget,
    performAttack,
    hitMonster,
    interact,
    nearestChest,
    openChest,
    searchGround,
    nearestDiscovery,
    revealDiscovery,
  };
})();
