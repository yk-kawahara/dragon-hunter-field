"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before combat helpers");
  }

  const {
    DASH_COST,
    WORLD_SCALE,
    armorDefense,
  } = definitions;

  function requireCombatContext(context) {
    if (!context?.player) {
      throw new Error("combat helpers require { player }");
    }
    return context;
  }

  function playerAttack(context) {
    const { player } = requireCombatContext(context);
    const comboBonus = Math.min(8, Math.floor(player.combo / 2));
    return 7 + player.level * 2 + player.weapon * 5 + comboBonus;
  }

  function playerDefense(context) {
    const { player } = requireCombatContext(context);
    const guardBonus = player.guard > 0 ? 9 + player.armor * 3 : 0;
    return 1 + player.level + (armorDefense[player.armor] || 0) + guardBonus;
  }

  function playerMoveSpeed(context) {
    const { player } = requireCombatContext(context);
    const armorMoveBonus = player.armor >= 1 ? 4 * WORLD_SCALE : 0;
    const slowPenalty = player.slow > 0 ? 0.72 : 1;
    return (player.speed + armorMoveBonus) * slowPenalty;
  }

  function dashCost(context) {
    const { player } = requireCombatContext(context);
    const armorDiscount = player.armor >= 1 ? 6 : 0;
    return Math.max(20, DASH_COST - armorDiscount);
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
    return mult;
  }

  function armorDamageMultiplier(context, monster, pDot, source = "contact") {
    const { player } = requireCombatContext(context);
    let mult = 1;
    if (player.armor >= 2 && source === "contact" && pDot > 0.58) mult *= 0.8;
    if (player.armor >= 4 && (monster?.boss || monster?.type === "dragonling" || source === "fire")) mult *= 0.78;
    return mult;
  }

  function refreshDerivedStats(context) {
    const { player } = requireCombatContext(context);
    player.staminaMax = 100 + (player.hunterCharm ? 15 : 0);
    player.stamina = Math.min(player.stamina, player.staminaMax);
  }

  function regenRate(context) {
    const { player } = requireCombatContext(context);
    if (!player.regenCharm) return 0;
    return 0.28 + (player.armor >= 3 ? 0.12 : 0) + (player.armor >= 4 ? 0.18 : 0);
  }

  globalThis.DRAGON_HUNTER_COMBAT = {
    playerAttack,
    playerDefense,
    playerMoveSpeed,
    dashCost,
    weaponDamageMultiplier,
    armorDamageMultiplier,
    refreshDerivedStats,
    regenRate,
  };
})();
