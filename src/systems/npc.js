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
      if (player.hp < player.hpMax || player.stamina < player.staminaMax) {
        player.hp = player.hpMax;
        player.stamina = player.staminaMax;
        player.guard = Math.max(player.guard, 700);
        say("補給隊「ここで立て直せ。廃坑は泡に足を取られる」");
      } else if (!player.mineCharm && player.gold >= charmCost) {
        player.gold -= charmCost;
        player.mineCharm = true;
        player.wards = Math.min(9, player.wards + 1);
        say("補給隊から泡除けの護符を買った。廃坑で足を取られにくい");
      } else if (!player.mineCharm) {
        say(`補給隊「泡除けの護符は${charmCost}Gだ。廃坑で稼いで戻れ」`);
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
    if (!state.spawnedBoss) {
      state.spawnedBoss = true;
      spawnMonster("dragon", 51 * TILE - worldPx(4), 14 * TILE);
      say("赤竜が目覚めた!");
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
