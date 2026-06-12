"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before text helpers");
  }

  const {
    TILE,
    TILE_FLOWER,
    TILE_FIELD,
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    BOSS_REQUIREMENTS,
    WARDEN_REQUIREMENTS,
    weaponNames,
    weaponCosts,
    armorCosts,
  } = definitions;

  function requireTextContext(context) {
    if (!context?.state || !context?.player) {
      throw new Error("text helpers require { state, player }");
    }
    return context;
  }

  function objectiveText(context) {
    const { state, player } = requireTextContext(context);
    const stage = gameStage(context);
    if (stage === "cleared") return "CLEAR: 村に朝が戻った";
    if (stage === "report") return "目的: 村へ戻って長老に報告";
    if (stage === "dragon") return "目的: 洞穴の赤竜を倒す";
    if (stage === "cave") return "目的: 北東の竜洞へ向かう";
    if (stage === "guardian") return "目的: 北森の守護者を倒す";
    if (stage === "level") return `目的: LV${BOSS_REQUIREMENTS.level}まで鍛える`;
    if (stage === "ruin") return "目的: 北森の遺跡を探す";
    const unopened = TREASURE_CHESTS.length - state.chests.size;
    const hidden = DISCOVERY_POINTS.length - state.discoveries.size;
    return `目的: 竜の鱗 ${player.scales}/${BOSS_REQUIREMENTS.scales} 宝${unopened} 隠${hidden}`;
  }

  function guidanceText(context) {
    const { state, player, inTown, currentRegion, areaDangerText } = requireTextContext(context);
    if (inTown(player.x, player.y)) {
      if (player.hp < player.hpMax) return "安全: 回復陣で全快できる";
      const cost = nextUpgradeCost(context);
      if (cost > 0 && player.gold < cost) return `準備: ${cost}Gで次の装備`;
      if (player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level && !state.wardenDefeated) return "南東の前線で道番に挑む";
      if (cost > 0) return "準備: 鍛冶屋で生存圏を広げる";
      return "安全: 外へ出てより遠くを目指す";
    }
    const hpRate = player.hp / player.hpMax;
    if (hpRate < 0.35) return "危険: 近い拠点へ戻って立て直す";
    const stage = gameStage(context);
    if (player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level && !state.wardenDefeated) return "南東の道番が守りの護石を持つ";
    if (stage === "scales") return player.armor === 0 ? "近場で稼ぎ 革鎧を買う" : "遠方ほど鱗と報酬が良い";
    if (stage === "ruin") return "北森の遺跡で守護者の手掛かり";
    if (stage === "level") return "強敵で鍛え 装備も更新";
    if (stage === "guardian") return "北森は準備して挑む";
    if (stage === "cave") return "北東の竜洞へ";
    if (stage === "dragon") return "炎と接触に注意";
    if (stage === "report") return "村は安全 長老へ";
    return areaDangerText(currentRegion());
  }

  function nextUpgradeCost(context) {
    const { player } = requireTextContext(context);
    const target = player.armor <= player.weapon ? "armor" : "weapon";
    const rank = player[target] + 1;
    if (rank >= weaponNames.length) return 0;
    return target === "weapon" ? weaponCosts[rank] : armorCosts[rank];
  }

  function gameStage(context) {
    const { state, player, canChallengeDragon, guardianReady } = requireTextContext(context);
    if (state.elderReported) return "cleared";
    if (state.victory || state.bossDefeated) return "report";
    if (state.spawnedBoss) return "dragon";
    if (canChallengeDragon()) return "cave";
    if (!state.guardianDefeated && guardianReady()) return "guardian";
    if (player.scales >= BOSS_REQUIREMENTS.scales && player.level < BOSS_REQUIREMENTS.level) return "level";
    if (player.scales >= 2 && !state.guardianDefeated) return "ruin";
    return "scales";
  }

  function stageName(stage) {
    const names = {
      scales: "鱗集め",
      ruin: "北森探索",
      level: "鍛錬",
      guardian: "守護者",
      cave: "竜洞",
      dragon: "赤竜戦",
      report: "報告",
      cleared: "クリア",
    };
    return names[stage] || "旅";
  }

  function contextPromptText(context) {
    const {
      player,
      nearestNpc,
      nearestChest,
      nearestDiscovery,
      playerNearCave,
      canChallengeDragon,
      tileAt,
    } = requireTextContext(context);
    const npc = nearestNpc();
    if (npc) return `話す: ${npcRoleName(npc.type)}`;
    const chest = nearestChest();
    if (chest) return "調べる: 宝箱";
    if (nearestDiscovery()) return "調べる: 気になる場所";
    if (playerNearCave()) return canChallengeDragon() ? "入る: 竜洞" : "封印: 条件不足";
    const tx = Math.floor((player.x + player.w / 2) / TILE);
    const ty = Math.floor((player.y + player.h / 2) / TILE);
    const tile = tileAt(tx, ty);
    if (tile === TILE_FLOWER || tile === TILE_FIELD) return "採取: 旅道具";
    return "";
  }

  function npcRoleName(type) {
    if (type === "elder") return "長老";
    if (type === "smith") return "鍛冶屋";
    if (type === "healer") return "薬師";
    if (type === "frontier") return "補給隊";
    return "人";
  }


  globalThis.DRAGON_HUNTER_TEXT = {
    objectiveText,
    guidanceText,
    nextUpgradeCost,
    gameStage,
    stageName,
    contextPromptText,
    npcRoleName,
  };
})();
