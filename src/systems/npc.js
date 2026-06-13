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
    ASH_KNIGHT_REQUIREMENTS,
    CHAPTER2_REQUIREMENTS,
    CHAPTER3_REQUIREMENTS,
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
      if (state.voidDragonDefeated && !state.chapter3Reported) {
        state.chapter3Reported = true;
        state.chapter3Victory = false;
        state.clearPanelOpen = true;
        say("長老「黒陽竜まで封じたか。第3章の遠征は伝説になる」", 5600);
      } else if (state.chapter3Reported) {
        say("長老「黒陽の先にあるものは、まだ誰も知らぬ」", 4200);
      } else if (state.eclipseDragonDefeated && !state.chapter2Reported) {
        state.chapter2Reported = true;
        state.chapter2Victory = false;
        state.clearPanelOpen = true;
        say("長老「月蝕竜まで封じたか。第2章の遠征は成った」", 5200);
      } else if (state.chapter2Reported) {
        say(`長老「月蝕城のさらに南、黒陽領へ。黒陽の封印碑とLV${CHAPTER3_REQUIREMENTS.level}が鍵だ」`, 4600);
      } else if (state.bossDefeated && !state.elderReported) {
        state.elderReported = true;
        state.victory = false;
        state.clearPanelOpen = true;
        say("長老「竜は封じられた。村は救われた」", 4200);
      } else if (state.elderReported && state.ashKnightDefeated) {
        say(`長老「月影廃墟のさらに南、月蝕城へ。封印碑とLV${CHAPTER2_REQUIREMENTS.level}が鍵だ」`, 4600);
      } else if (state.elderReported) {
        say(`長老「灰道の宿場から古塔へ進め。灰騎士を越えれば第2章の道が開く」`, 4600);
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
      if (npc.y > 128 * TILE) {
        const kitCost = 110 + player.level * 12;
        const ownsWeapon = (rank) => Array.isArray(player.ownedWeapons) && player.ownedWeapons.includes(rank);
        const ownsArmor = (rank) => Array.isArray(player.ownedArmors) && player.ownedArmors.includes(rank);
        if (player.hp < player.hpMax || player.stamina < player.staminaMax) {
          player.hp = player.hpMax;
          player.stamina = player.staminaMax;
          player.guard = Math.max(player.guard, 1500);
          say("黒門砦で休んだ。黒陽城への最後の足場だ");
        } else if (!state.discoveries.has("void-seal")) {
          say("黒門砦の隊商「南西の黒陽城で封印碑を読め。黒陽竜はさらに奥だ」");
        } else if (!ownsWeapon(10) && player.gold >= weaponCosts[10]) {
          player.gold -= weaponCosts[10];
          addOwnedWeapon(player, 10);
          say(`${weaponNames[10]}を買った。黒陽竜と影に強い`);
        } else if (!ownsWeapon(10)) {
          say(`${weaponNames[10]}は${weaponCosts[10]}G。黒陽領で稼いで戻れ`);
        } else if (!ownsArmor(10) && player.gold >= armorCosts[10]) {
          player.gold -= armorCosts[10];
          addOwnedArmor(player, 10);
          say(`${armorNames[10]}を買った。黒陽圧を軽くする`);
        } else if (!ownsArmor(10)) {
          say(`${armorNames[10]}は${armorCosts[10]}G。黒陽竜の弾幕に備えろ`);
        } else if (!player.voidCharm) {
          grantAccessory(context, "void", "黒陽の護符を授かった。装備すると黒陽圧に強くなる");
          player.wards = Math.min(9, player.wards + 3);
        } else if (player.gold >= kitCost && (player.potions < 9 || player.bombs < 8 || player.wards < 7)) {
          player.gold -= kitCost;
          player.potions = Math.min(9, player.potions + 4);
          player.bombs = Math.min(9, player.bombs + 3);
          player.wards = Math.min(9, player.wards + 4);
          say("黒門砦で第3章遠征の物資を補充した");
        } else {
          say(`黒門砦の隊商「黒陽竜はLV${CHAPTER3_REQUIREMENTS.level}以上、黒陽碑、月蝕城秘庫が条件だ」`);
        }
        return;
      }
      if (npc.y > 110 * TILE) {
        const kitCost = 72 + player.level * 10;
        const ownsWeapon = (rank) => Array.isArray(player.ownedWeapons) && player.ownedWeapons.includes(rank);
        const ownsArmor = (rank) => Array.isArray(player.ownedArmors) && player.ownedArmors.includes(rank);
        if (player.hp < player.hpMax || player.stamina < player.staminaMax) {
          player.hp = player.hpMax;
          player.stamina = player.staminaMax;
          player.guard = Math.max(player.guard, 1200);
          say("月見砦で休んだ。月蝕城への足場ができた");
        } else if (!state.discoveries.has("eclipse-seal")) {
          say("月見砦の隊商「南西の月蝕城で封印碑を読め。竜はその奥に眠る」");
        } else if (!ownsWeapon(9) && player.gold >= weaponCosts[9]) {
          player.gold -= weaponCosts[9];
          addOwnedWeapon(player, 9);
          say(`${weaponNames[9]}を買った。月蝕竜と術師に強い`);
        } else if (!ownsWeapon(9)) {
          say(`${weaponNames[9]}は${weaponCosts[9]}G。月蝕城で稼いで戻れ`);
        } else if (!ownsArmor(9) && player.gold >= armorCosts[9]) {
          player.gold -= armorCosts[9];
          addOwnedArmor(player, 9);
          say(`${armorNames[9]}を買った。月蝕魔法を軽くする`);
        } else if (!ownsArmor(9)) {
          say(`${armorNames[9]}は${armorCosts[9]}G。月蝕竜の弾に備えろ`);
        } else if (!player.eclipseCharm) {
          grantAccessory(context, "eclipse", "月蝕の指輪を授かった。装備すると月蝕魔法に強くなる");
          player.wards = Math.min(9, player.wards + 2);
        } else if (player.gold >= kitCost && (player.potions < 9 || player.bombs < 7 || player.wards < 6)) {
          player.gold -= kitCost;
          player.potions = Math.min(9, player.potions + 3);
          player.bombs = Math.min(9, player.bombs + 2);
          player.wards = Math.min(9, player.wards + 3);
          say("月見砦で第2章遠征の物資を補充した");
        } else {
          say(`月見砦の隊商「月蝕竜はLV${CHAPTER2_REQUIREMENTS.level}以上、封印碑、月影遺物、灰騎士越えが条件だ」`);
        }
        return;
      }
      if (npc.x > 90 * TILE) {
        const kitCost = 48 + player.level * 8;
        const ownsWeapon = (rank) => Array.isArray(player.ownedWeapons) && player.ownedWeapons.includes(rank);
        const ownsArmor = (rank) => Array.isArray(player.ownedArmors) && player.ownedArmors.includes(rank);
        if (player.hp < player.hpMax || player.stamina < player.staminaMax) {
          player.hp = player.hpMax;
          player.stamina = player.staminaMax;
          player.guard = Math.max(player.guard, 900);
          say("灰道の宿場で休んだ。古塔へ向かう準備が整った");
        } else if (state.ashKnightDefeated && !ownsWeapon(8) && player.gold >= weaponCosts[8]) {
          player.gold -= weaponCosts[8];
          addOwnedWeapon(player, 8);
          say(`${weaponNames[8]}を買った。魔術師と灰騎士に強い`);
        } else if (state.ashKnightDefeated && !ownsWeapon(8)) {
          say(`${weaponNames[8]}は${weaponCosts[8]}G。古塔の魔法に備えろ`);
        } else if (state.ashKnightDefeated && !ownsArmor(8) && player.gold >= armorCosts[8]) {
          player.gold -= armorCosts[8];
          addOwnedArmor(player, 8);
          say(`${armorNames[8]}を買った。魔法弾の被害を軽くする`);
        } else if (state.ashKnightDefeated && !ownsArmor(8)) {
          say(`${armorNames[8]}は${armorCosts[8]}G。魔法遠征の守りだ`);
        } else if (!state.ashKnightDefeated) {
          say(`宿場の隊商「古塔の灰騎士はLV${ASH_KNIGHT_REQUIREMENTS.level}以上で挑め。先に南東の番人を越えろ」`);
        } else if (player.gold >= kitCost && (player.potions < 8 || player.bombs < 5 || player.wards < 4)) {
          player.gold -= kitCost;
          player.potions = Math.min(9, player.potions + 2);
          player.bombs = Math.min(9, player.bombs + 2);
          player.wards = Math.min(9, player.wards + 2);
          say("宿場で古塔遠征の道具を補充した");
        } else {
          say("宿場の隊商「古塔と南の採石場は報酬も危険も大きい」");
        }
        return;
      }
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
