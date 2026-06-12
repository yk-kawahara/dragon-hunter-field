"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before npc helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before npc helpers");
  }

  const rewardHelpers = globalThis.DRAGON_HUNTER_REWARDS;
  if (!rewardHelpers) {
    throw new Error("DRAGON_HUNTER_REWARDS must be loaded before npc helpers");
  }

  const {
    TILE,
    WORLD_SCALE,
    BOSS_REQUIREMENTS,
    weaponNames,
    armorNames,
    weaponTraits,
    armorTraits,
    weaponCosts,
    armorCosts,
  } = definitions;

  const { centerOf } = mathHelpers;
  const { addOwnedWeapon, addOwnedArmor, grantAccessory } = rewardHelpers;

  const worldPx = (value) => value * WORLD_SCALE;

  function requireNpcContext(context) {
    if (!context?.state || !context?.player || !context?.say || !context?.spawnMonster || !context?.guardianReady) {
      throw new Error("npc helpers require { state, player, say, spawnMonster, guardianReady }");
    }
    return context;
  }

  function playerNearCave(context) {
    const { player } = requireNpcContext(context);
    const tx = Math.floor((player.x + player.w / 2) / TILE);
    const ty = Math.floor((player.y + player.h / 2) / TILE);
    return Math.abs(tx - 51) <= 1 && Math.abs(ty - 18) <= 1;
  }

  function nearestNpc(context) {
    const { state, player } = requireNpcContext(context);
    for (const npc of state.npcs) {
      const d = Math.hypot(centerOf(player).x - centerOf(npc).x, centerOf(player).y - centerOf(npc).y);
      if (d < worldPx(24)) return npc;
    }
    return null;
  }

  function handleNpc(context, npc) {
    const { state, player, say, guardianReady } = requireNpcContext(context);
    if (npc.type === "elder") {
      if (state.bossDefeated) {
        state.elderReported = true;
        state.clearPanelOpen = true;
        say("長老「竜は封じられた。村は救われた」", 4200);
      } else if (canChallengeDragon(context)) {
        say("長老「封印は解けた。北東の竜洞へ向かえ」");
      } else if (!state.guardianDefeated && guardianReady()) {
        say("長老「北森の守護者を越え、紋章を得よ」");
      } else if (player.scales < BOSS_REQUIREMENTS.scales) {
        say(`長老「竜の鱗を${BOSS_REQUIREMENTS.scales}枚集めよ」`);
      } else if (player.level < BOSS_REQUIREMENTS.level) {
        say(`長老「赤竜にはLV${BOSS_REQUIREMENTS.level}が要る」`);
      } else {
        say("長老「北森に封印を守る者がいる」");
      }
    }

    if (npc.type === "smith") {
      const target = player.armor <= player.weapon ? "armor" : "weapon";
      const rank = player[target] + 1;
      if (rank >= weaponNames.length) {
        say("鍛冶屋「これ以上は鍛えられん」");
        return;
      }
      const cost = target === "weapon" ? weaponCosts[rank] : armorCosts[rank];
      if (player.gold >= cost) {
        player.gold -= cost;
        player[target] += 1;
        if (target === "weapon") addOwnedWeapon(player, player.weapon);
        else addOwnedArmor(player, player.armor);
        say(target === "weapon" ? `${weaponNames[player.weapon]}: ${weaponTraits[player.weapon]}` : `${armorNames[player.armor]}: ${armorTraits[player.armor]}`);
      } else {
        const name = target === "weapon" ? weaponNames[rank] : armorNames[rank];
        const trait = target === "weapon" ? weaponTraits[rank] : armorTraits[rank];
        say(`鍛冶屋「${name}(${trait})は${cost}G」`);
      }
    }

    if (npc.type === "healer") {
      const cost = player.level * 8;
      if (player.hp === player.hpMax) {
        const kitCost = 18 + player.level * 4;
        if (player.gold >= kitCost && (player.potions < 5 || player.bombs < 2 || player.wards < 1)) {
          player.gold -= kitCost;
          player.potions = Math.min(9, player.potions + 1);
          if (player.level >= 2) player.bombs = Math.min(9, player.bombs + 1);
          if (player.level >= 3) player.wards = Math.min(9, player.wards + 1);
          say("薬師は旅道具を包んだ");
        } else {
          say("薬師「無理は禁物だよ」");
        }
      } else if (player.gold >= cost) {
        player.gold -= cost;
        player.hp = player.hpMax;
        say("薬師は傷を癒やした");
      } else {
        say(`薬師「${cost}Gで癒やせるよ」`);
      }
    }

    if (npc.type === "frontier") {
      const charmCost = 180;
      const kitCost = 28 + player.level * 6;
      const ownsWeapon = (rank) => Array.isArray(player.ownedWeapons) && player.ownedWeapons.includes(rank);
      const ownsArmor = (rank) => Array.isArray(player.ownedArmors) && player.ownedArmors.includes(rank);
      if (player.hp < player.hpMax || player.stamina < player.staminaMax) {
        player.hp = player.hpMax;
        player.stamina = player.staminaMax;
        player.guard = Math.max(player.guard, 700);
        say("補給隊「ここで立て直せ。廃坑は泡に足を取られる」");
      } else if (!player.mineCharm && player.gold >= charmCost) {
        player.gold -= charmCost;
        grantAccessory(context, "mine", "泡除けの護符を買った。装備すると鉱山の泡に強くなる");
        player.wards = Math.min(9, player.wards + 1);
        say("補給隊から泡除けの護符を買った。廃坑で足を取られにくい");
      } else if (!player.mineCharm) {
        say(`補給隊「泡除けの護符は${charmCost}Gだ。廃坑で稼いで戻れ」`);
      } else if (!ownsWeapon(5) && player.gold >= weaponCosts[5]) {
        player.gold -= weaponCosts[5];
        addOwnedWeapon(player, 5);
        say(`補給隊から${weaponNames[5]}を買った。もちもので装備できる`);
      } else if (!ownsWeapon(5)) {
        say(`補給隊「${weaponNames[5]}は${weaponCosts[5]}Gだ。泡吐きに強い」`);
      } else if (!ownsArmor(5) && player.gold >= armorCosts[5]) {
        player.gold -= armorCosts[5];
        addOwnedArmor(player, 5);
        say(`補給隊から${armorNames[5]}を買った。泡と鈍足に強い`);
      } else if (!ownsArmor(5)) {
        say(`補給隊「${armorNames[5]}は${armorCosts[5]}Gだ。廃坑を歩きやすい」`);
      } else if (player.level >= 8 && !ownsWeapon(6) && player.gold >= weaponCosts[6]) {
        player.gold -= weaponCosts[6];
        addOwnedWeapon(player, 6);
        say(`補給隊から${weaponNames[6]}を買った。火霊と小竜に強い`);
      } else if (player.level >= 8 && !ownsWeapon(6)) {
        say(`補給隊「${weaponNames[6]}は${weaponCosts[6]}Gだ。東の火霊に備えろ」`);
      } else if (player.level >= 8 && !ownsArmor(6) && player.gold >= armorCosts[6]) {
        player.gold -= armorCosts[6];
        addOwnedArmor(player, 6);
        say(`補給隊から${armorNames[6]}を買った。炎の遠征に備えられる`);
      } else if (player.level >= 8 && !ownsArmor(6)) {
        say(`補給隊「${armorNames[6]}は${armorCosts[6]}Gだ。火傷を軽くする」`);
      } else if (player.level >= 12 && !ownsWeapon(7) && player.gold >= weaponCosts[7]) {
        player.gold -= weaponCosts[7];
        addOwnedWeapon(player, 7);
        say(`補給隊から${weaponNames[7]}を買った。竜洞のための刃だ`);
      } else if (player.level >= 12 && !ownsWeapon(7)) {
        say(`補給隊「${weaponNames[7]}は${weaponCosts[7]}G。赤竜を狩る覚悟が要る」`);
      } else if (player.level >= 12 && !ownsArmor(7) && player.gold >= armorCosts[7]) {
        player.gold -= armorCosts[7];
        addOwnedArmor(player, 7);
        say(`補給隊から${armorNames[7]}を買った。竜洞遠征の守りだ`);
      } else if (player.level >= 12 && !ownsArmor(7)) {
        say(`補給隊「${armorNames[7]}は${armorCosts[7]}G。竜洞前の最後の備えだ」`);
      } else if (player.gold >= kitCost && (player.potions < 7 || player.bombs < 4 || player.wards < 3)) {
        player.gold -= kitCost;
        player.potions = Math.min(9, player.potions + 2);
        if (player.level >= 2) player.bombs = Math.min(9, player.bombs + 1);
        if (player.level >= 3) player.wards = Math.min(9, player.wards + 1);
        say("補給隊は遠征道具を渡した");
      } else {
        say("補給隊「南の廃坑で稼ぎ、危なくなったらこの陣へ戻れ」");
      }
    }
  }

  function handleCave(context) {
    const { state, say, spawnMonster } = requireNpcContext(context);
    if (state.bossDefeated) {
      say("洞穴は静まり返っている");
      return;
    }
    const missing = bossMissingRequirements(context);
    if (missing.length > 0) {
      say(`封印が拒む: ${missing.join(" / ")}`, 2600);
      return;
    }

    const dragonAlive = state.monsters.some((monster) => monster.type === "dragon" && monster.hp > 0);
    if (!state.spawnedBoss || !dragonAlive) {
      state.spawnedBoss = true;
      spawnMonster("dragon", 51 * TILE - worldPx(4), 14 * TILE);
      say(dragonAlive ? "赤竜が目覚めた!" : "赤竜が再び姿を現した!");
    } else {
      say("洞穴の奥から熱風が来る");
    }
  }

  function canChallengeDragon(context) {
    return bossMissingRequirements(context).length === 0;
  }

  function bossMissingRequirements(context) {
    const { state, player } = requireNpcContext(context);
    const missing = [];
    if (player.scales < BOSS_REQUIREMENTS.scales) missing.push(`鱗${player.scales}/${BOSS_REQUIREMENTS.scales}`);
    if (player.level < BOSS_REQUIREMENTS.level) missing.push(`LV${player.level}/${BOSS_REQUIREMENTS.level}`);
    if (!player.sealCrest || !state.guardianDefeated) missing.push("紋章");
    return missing;
  }

  globalThis.DRAGON_HUNTER_NPC = {
    playerNearCave,
    nearestNpc,
    handleNpc,
    handleCave,
    canChallengeDragon,
    bossMissingRequirements,
  };
})();
