"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before combat helpers");
  }

  const {
    DASH_COST,
    WORLD_SCALE,
    weaponAttack = [0, 5, 10, 15, 20],
    armorDefense,
    shieldGuard,
  } = definitions;

  function requireCombatContext(context) {
    if (!context?.player) {
      throw new Error("combat helpers require { player }");
    }
    return context;
  }

  function activeAccessory(player, id, legacyFlag) {
    if (Array.isArray(player.equippedAccessories)) {
      return player.equippedAccessories.includes(id);
    }
    if (player.equippedAccessory) return player.equippedAccessory === id;
    return Boolean(player[legacyFlag]);
  }

  function playerAttack(context) {
    const { player } = requireCombatContext(context);
    const comboBonus = Math.min(8, Math.floor(player.combo / 2));
    const strength = Number.isFinite(player.strength) ? player.strength : 7 + player.level * 2;
    return strength + (weaponAttack[player.weapon] || 0) + comboBonus;
  }

  function playerDefense(context) {
    const { player } = requireCombatContext(context);
    const guardBonus = player.guard > 0 ? 9 + player.armor * 3 : 0;
    const resilience = Number.isFinite(player.resilience) ? player.resilience : 1 + player.level;
    return resilience + (armorDefense[player.armor] || 0) + guardBonus;
  }

  function playerMoveSpeed(context) {
    const { player } = requireCombatContext(context);
    const armorMoveBonus = player.armor >= 1 ? 4 * WORLD_SCALE : 0;
    const trailMoveBonus = activeAccessory(player, "trail", "trailCharm") ? 5 * WORLD_SCALE : 0;
    const shieldRuneMoveBonus = player.shield > 0 && player.shieldRune === "stride" ? 6 * WORLD_SCALE : 0;
    const slowPenalty = player.slow > 0 ? (activeAccessory(player, "frost", "frostCharm") ? 0.9 : activeAccessory(player, "deepLamp", "deepLampCharm") ? 0.86 : 0.72) : 1;
    return (player.speed + armorMoveBonus + trailMoveBonus + shieldRuneMoveBonus) * slowPenalty;
  }

  function dashCost(context) {
    const { player } = requireCombatContext(context);
    const armorDiscount = player.armor >= 1 ? 6 : 0;
    const trailDiscount = activeAccessory(player, "trail", "trailCharm") ? 8 : 0;
    const shieldRuneDiscount = player.shield > 0 && player.shieldRune === "stride" ? 6 : 0;
    return Math.max(18, DASH_COST - armorDiscount - trailDiscount - shieldRuneDiscount);
  }

  function weaponDamageMultiplier(context, monster, pDot, mDot) {
    const { player } = requireCombatContext(context);
    let mult = 1;
    const flanking = Math.abs(mDot) < 0.35;
    const behind = mDot < -0.55;
    if (player.weapon >= 1 && pDot > 0.58) mult += 0.08;
    if (player.weapon >= 2 && flanking) mult += 0.18;
    if (player.weapon >= 3 && behind) mult += 0.34;
    if (player.weapon >= 4 && (monster.boss || monster.midboss || monster.type === "dragonling")) mult += 0.25;
    if (player.weapon === 5 && (monster.type === "bubbler" || monster.type === "slime")) mult += 0.85;
    if (player.weapon === 6 && (monster.type === "wisp" || monster.type === "dragonling" || monster.type === "sorcerer" || monster.type === "moonShade" || monster.type === "trapFlower")) mult += 0.55;
    if (player.weapon === 7 && (monster.boss || monster.type === "dragonling" || monster.type === "ashKnight")) mult += 0.6;
    if (player.weapon === 8 && (monster.type === "sorcerer" || monster.type === "summoner" || monster.type === "moonShade" || monster.type === "ashKnight" || monster.type === "mistLancer" || monster.type === "mistKeeper" || monster.midboss)) mult += 0.75;
    if (player.weapon === 9 && (monster.type === "summoner" || monster.type === "trapFlower" || monster.type === "eclipseMage" || monster.type === "eclipseDragon" || monster.type === "moonShade" || monster.type === "mistLancer" || monster.type === "mistKeeper")) mult += 0.95;
    if (player.weapon === 10 && (monster.type === "summoner" || monster.type === "trapFlower" || monster.type === "voidWraith" || monster.type === "voidDragon" || monster.type === "eclipseMage")) mult += 1.25;
    if (player.weapon === 11 && (monster.type === "obsidianGolem" || monster.type === "obsidianCrawler" || monster.type === "trapFlower" || monster.type === "voidDragon" || monster.type === "voidWraith")) mult += 1.45;
    if (player.weapon === 12 && (monster.type === "frostMoth" || monster.type === "frostBeast" || monster.type === "frostGolem" || monster.type === "frostBeacon" || monster.type === "towerWarden" || monster.type === "frostDragon")) mult += 1.55;
    if (player.weapon === 13 && (monster.type === "sunLancer" || monster.type === "mirageCaster" || monster.type === "solarWarden" || monster.type === "emberDragon")) mult += 1.75;
    if (monster.type === "shieldSoldier") {
      if (behind) mult += 0.75;
      else if (flanking) mult += 0.35;
      else if (mDot > 0.55) mult *= 0.55;
    }
    return mult;
  }

  function armorDamageMultiplier(context, monster, pDot, source = "contact") {
    const { player } = requireCombatContext(context);
    let mult = 1;
    if (player.armor >= 2 && source === "contact" && pDot > 0.58) mult *= 0.8;
    if (player.armor >= 4 && (monster?.boss || monster?.type === "dragonling" || source === "fire")) mult *= 0.78;
    if (player.armor === 5 && (monster?.type === "bubbler" || monster?.type === "trapFlower" || source === "bubble" || source === "trap")) mult *= 0.62;
    if (player.armor === 6 && (monster?.type === "wisp" || monster?.type === "sorcerer" || monster?.type === "moonShade" || source === "fire")) mult *= 0.64;
    if (player.armor === 7 && (monster?.boss || monster?.midboss || monster?.type === "dragonling" || source === "projectile")) mult *= 0.72;
    if (player.armor === 8 && (monster?.type === "sorcerer" || monster?.type === "summoner" || monster?.type === "moonShade" || monster?.type === "ashKnight" || source === "magic" || source === "projectile")) mult *= 0.58;
    if (player.armor === 9 && (monster?.type === "eclipseMage" || monster?.type === "eclipseDragon" || source === "eclipse" || source === "magic" || source === "projectile")) mult *= 0.48;
    if (player.armor === 10 && (monster?.type === "voidWraith" || monster?.type === "voidDragon" || source === "void" || source === "eclipse" || source === "projectile")) mult *= 0.42;
    if (player.armor === 11 && (monster?.type === "obsidianGolem" || monster?.type === "obsidianCrawler" || monster?.type === "trapFlower" || monster?.type === "voidDragon" || source === "obsidian" || source === "void" || source === "trap" || source === "projectile" || source === "contact")) mult *= 0.36;
    if (player.armor === 12 && (monster?.type === "frostMoth" || monster?.type === "frostBeast" || monster?.type === "frostGolem" || monster?.type === "frostBeacon" || monster?.type === "towerWarden" || monster?.type === "frostDragon" || source === "frost")) mult *= 0.34;
    if (player.armor === 13 && (monster?.type === "sunLancer" || monster?.type === "mirageCaster" || monster?.type === "solarWarden" || monster?.type === "emberDragon" || source === "solar")) mult *= 0.3;
    if (source === "contact" && pDot > 0.42 && player.shield > 0) {
      const shieldMult = shieldGuard[player.shield] || 1;
      mult *= shieldMult;
      if (player.shieldRune === "bastion") mult *= 0.82;
      if (monster?.type === "shieldSoldier" && pDot > 0.58) mult *= 0.86;
    }
    if (player.shield === 7 && (source === "solar" || source === "projectile" || monster?.type === "sunLancer" || monster?.type === "solarWarden" || monster?.type === "emberDragon")) mult *= 0.62;
    if (activeAccessory(player, "aegis", "aegisCharm") && (source === "fire" || source === "projectile")) mult *= 0.82;
    if (activeAccessory(player, "mine", "mineCharm") && (monster?.type === "bubbler" || monster?.type === "trapFlower" || source === "bubble" || source === "trap")) mult *= 0.72;
    if (activeAccessory(player, "mist", "mistCharm") && (monster?.type === "mistLancer" || monster?.type === "mistKeeper" || monster?.type === "summoner" || monster?.type === "trapFlower" || source === "magic" || source === "trap" || source === "projectile")) mult *= 0.74;
    if (activeAccessory(player, "eclipse", "eclipseCharm") && (monster?.type === "eclipseMage" || monster?.type === "eclipseDragon" || source === "eclipse" || source === "magic")) mult *= 0.76;
    if (activeAccessory(player, "void", "voidCharm") && (monster?.type === "voidWraith" || monster?.type === "voidDragon" || source === "void")) mult *= 0.7;
    if (activeAccessory(player, "obsidian", "obsidianCharm") && (monster?.type === "obsidianGolem" || monster?.type === "obsidianCrawler" || source === "obsidian" || (source === "contact" && pDot > 0.3))) mult *= 0.68;
    if (activeAccessory(player, "deepLamp", "deepLampCharm") && (monster?.type === "vaultLeech" || monster?.type === "cryptWarden")) mult *= 0.7;
    if (activeAccessory(player, "frost", "frostCharm") && (monster?.type === "frostMoth" || monster?.type === "frostBeast" || monster?.type === "frostGolem" || monster?.type === "frostBeacon" || monster?.type === "towerWarden" || monster?.type === "frostDragon" || source === "frost")) mult *= 0.68;
    if (activeAccessory(player, "horizon", "horizonCharm") && (monster?.type === "sunLancer" || monster?.type === "mirageCaster" || monster?.type === "solarWarden" || monster?.type === "emberDragon" || source === "solar" || source === "projectile")) mult *= 0.58;
    return mult;
  }

  function shieldRuneCounterDamage(context, pDot) {
    const { player } = requireCombatContext(context);
    if (player.shield <= 0 || player.shieldRune !== "counter" || pDot <= 0.42) return 0;
    return Math.max(3, Math.floor(playerDefense(context) * 0.24));
  }

  function refreshDerivedStats(context) {
    const { player } = requireCombatContext(context);
    player.staminaMax = 100
      + (activeAccessory(player, "hunter", "hunterCharm") ? 15 : 0)
      + (activeAccessory(player, "trail", "trailCharm") ? 10 : 0)
      + (activeAccessory(player, "mist", "mistCharm") ? 8 : 0)
      + (activeAccessory(player, "eclipse", "eclipseCharm") ? 8 : 0)
      + (activeAccessory(player, "void", "voidCharm") ? 12 : 0)
      + (activeAccessory(player, "obsidian", "obsidianCharm") ? 8 : 0);
    if (activeAccessory(player, "deepLamp", "deepLampCharm")) player.staminaMax += 6;
    if (activeAccessory(player, "frost", "frostCharm")) player.staminaMax += 10;
    if (activeAccessory(player, "horizon", "horizonCharm")) player.staminaMax += 12;
    player.stamina = Math.min(player.stamina, player.staminaMax);
  }

  function regenRate(context) {
    const { player } = requireCombatContext(context);
    const hasRegen = activeAccessory(player, "regen", "regenCharm");
    const hasGreaterRegen = activeAccessory(player, "greaterRegen", "greaterRegenCharm");
    if (!hasRegen && !hasGreaterRegen) return 0.2 + Math.max(0, (player.level || 1) - 1) * 0.05;
    let rate = 0.2;
    if (hasRegen) rate += 0.55 + (player.armor >= 3 ? 0.35 : 0.1) + (player.armor >= 4 ? 0.5 : 0.05);
    if (hasGreaterRegen) rate += 1.15 + (player.armor >= 8 ? 2.0 : 1.5);
    return rate;
  }

  globalThis.DRAGON_HUNTER_COMBAT = {
    playerAttack,
    playerDefense,
    playerMoveSpeed,
    dashCost,
    weaponDamageMultiplier,
    armorDamageMultiplier,
    shieldRuneCounterDamage,
    refreshDerivedStats,
    regenRate,
  };
})();
