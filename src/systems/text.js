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
    ASH_KNIGHT_REQUIREMENTS,
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
    if (stage === "cleared") return "CLEAR: ???????";
    if (stage === "report") return "??: ??????????";
    if (stage === "dragon") return "??: ????????";
    if (stage === "cave") return "??: ?????????";
    if (stage === "guardian") return "??: ?????????";
    if (stage === "level") return `??: LV${BOSS_REQUIREMENTS.level}?????`;
    if (stage === "ruin") return "??: ????????";
    const unopened = TREASURE_CHESTS.length - state.chests.size;
    const hidden = DISCOVERY_POINTS.length - state.discoveries.size;
    return `??: ???${player.scales}/${BOSS_REQUIREMENTS.scales} ?${unopened} ?${hidden}`;
  }

  function guidanceText(context) {
    const { state, player, inTown, currentRegion, areaDangerText } = requireTextContext(context);
    if (inTown(player.x, player.y)) {
      if (player.hp < player.hpMax) return "??: ?????????";
      const cost = nextUpgradeCost(context);
      if (state.wardenDefeated && !state.ashKnightDefeated && player.level >= ASH_KNIGHT_REQUIREMENTS.level) return "??????????????????????";
      if (state.wardenDefeated && !state.ashKnightDefeated) return `???????????????LV${ASH_KNIGHT_REQUIREMENTS.level}??????`;
      if (cost > 0 && player.gold < cost) return `??: ${cost}G?????`;
      if (player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level && !state.wardenDefeated) return "???????????";
      if (cost > 0) return "??: ???????????";
      return "??: ????????????";
    }
    const hpRate = player.hp / player.hpMax;
    if (hpRate < 0.35) return "??: ????????????";
    const stage = gameStage(context);
    const region = currentRegion();
    if (state.wardenDefeated && !state.ashKnightDefeated && region === "ash") return "???????????LV14???????????";
    if (state.wardenDefeated && !state.ashKnightDefeated && region === "tower") return "?????????????????";
    if (state.ashKnightDefeated && region === "tower") return "????????????????????????";
    if (region === "moon") return "??????????????????????";
    if (player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level && !state.wardenDefeated) return "??????????????";
    if (stage === "scales") return player.armor === 0 ? "???????????" : "???????????";
    if (stage === "ruin") return "??????????????";
    if (stage === "level") return "???????????";
    if (stage === "guardian") return "?????????";
    if (stage === "cave") return "??????";
    if (stage === "dragon") return "???????";
    if (stage === "report") return "???? ???";
    return areaDangerText(region);
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
