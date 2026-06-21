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
    CHAPTER2_REQUIREMENTS,
    CHAPTER3_REQUIREMENTS,
    CHAPTER4_REQUIREMENTS,
    OBSIDIAN_GOLEM_REQUIREMENTS,
    SMUGGLER_CAPTAIN_REQUIREMENTS,
    REGEN_SENTINEL_REQUIREMENTS,
    MIST_KEEPER_REQUIREMENTS,
    CRYPT_WARDEN_REQUIREMENTS,
    FROST_GOLEM_REQUIREMENTS,
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
    if (stage === "chapter4cleared") return "第4章CLEAR: 霜冠竜を封じた";
    if (stage === "chapter4report") return "目的: 長老へ霜冠竜討伐を報告";
    if (stage === "frostDragon") return "目的: 霜冠竜を倒す";
    if (stage === "frostReady") return "目的: 霜冠城の奥へ進む";
    if (stage === "frostSeal") return "目的: 霜冠城の封印碑を探す";
    if (stage === "frostGolem") return "目的: 氷窟巨人を倒す";
    if (stage === "frostRoute") return `目的: 白銀宿と氷窟へ LV${FROST_GOLEM_REQUIREMENTS.level}`;
    if (stage === "chapter3cleared") return "第3章CLEAR: 黒陽竜を封じた";
    if (stage === "chapter3report") return "目的: 長老へ黒陽竜討伐を報告";
    if (stage === "void") return "目的: 黒陽竜を倒す";
    if (stage === "voidReady") return "目的: 黒陽城の奥へ進む";
    if (stage === "obsidian") return "目的: 黒曜洞の巨人を倒す";
    if (stage === "obsidianReady") return "目的: 黒市の東、黒曜洞へ";
    if (stage === "voidSeal") return "目的: 黒陽城の封印碑を探す";
    if (stage === "voidRoute") return `目的: 黒門砦と黒陽城へ LV${CHAPTER3_REQUIREMENTS.level}`;
    if (stage === "chapter2cleared") return "第2章CLEAR: 月蝕竜を封じた";
    if (stage === "chapter2report") return "目的: 長老へ月蝕竜討伐を報告";
    if (stage === "eclipse") return "目的: 月蝕竜を倒す";
    if (stage === "eclipseReady") return "目的: 月蝕城の奥へ進む";
    if (stage === "eclipseSeal") return "目的: 月蝕城の封印碑を探す";
    if (stage === "moonRoute") return `目的: 月見砦と月蝕城へ LV${CHAPTER2_REQUIREMENTS.level}`;
    if (stage === "postDragon") return "目的: 灰道の宿場から古塔へ";
    if (stage === "cleared") return "第1章CLEAR: 旅は続く";
    if (stage === "report") return "目的: 長老へ赤竜討伐を報告";
    if (stage === "dragon") return "目的: 赤竜を倒す";
    if (stage === "cave") return "目的: 竜洞へ向かう";
    if (stage === "guardian") return "目的: 北森の守護者を倒す";
    if (stage === "level") return `目的: LV${BOSS_REQUIREMENTS.level}まで鍛える`;
    if (stage === "ruin") return "目的: 北森の紋章を探す";
    const unopened = TREASURE_CHESTS.length - state.chests.size;
    const hidden = DISCOVERY_POINTS.length - state.discoveries.size;
    return `目的: 鱗${player.scales}/${BOSS_REQUIREMENTS.scales} 宝${unopened} 発見${hidden}`;
  }

  function guidanceText(context) {
    const { state, player, inTown, currentRegion, areaDangerText } = requireTextContext(context);
    if (inTown(player.x, player.y)) {
      if (state.chapter4Victory) return "霜冠竜討伐を長老へ報告";
      if (state.chapter3Victory) return "黒陽竜討伐を長老へ報告";
      if (state.chapter2Victory) return "月蝕竜討伐を長老へ報告";
      if (player.hp < player.hpMax) return "回復陣か薬師で立て直そう";
      const cost = nextUpgradeCost(context);
      if (state.chapter3Reported && !state.frostGolemDefeated && player.level < FROST_GOLEM_REQUIREMENTS.level) return `氷窟巨人にはLV${FROST_GOLEM_REQUIREMENTS.level}が要る`;
      if (state.chapter3Reported && !state.frostGolemDefeated) return "白銀宿の東、氷窟巨人を倒そう";
      if (state.chapter3Reported && !state.discoveries.has("frost-seal")) return "霜冠城の中庭で封印碑を探そう";
      if (state.chapter3Reported && player.level < CHAPTER4_REQUIREMENTS.level) return `霜冠竜にはLV${CHAPTER4_REQUIREMENTS.level}が要る`;
      if (state.chapter3Reported) return "白銀宿で凍土装備を整えよう";
      if (state.chapter2Reported && !state.discoveries.has("void-seal")) return "黒門砦の南西で黒陽碑を探す";
      if (state.chapter2Reported && !state.chests.has("black-fort-armory")) return "黒門砦の武具箱で黒陽装備を得よう";
      if (state.chapter2Reported && !state.cryptWardenDefeated && player.level >= CRYPT_WARDEN_REQUIREMENTS.level) return "黒市の地下入口から墓所の番人へ挑める";
      if (state.chapter2Reported && !state.obsidianGolemDefeated && player.level < OBSIDIAN_GOLEM_REQUIREMENTS.level) return `黒曜洞の巨人にはLV${OBSIDIAN_GOLEM_REQUIREMENTS.level}が要る`;
      if (state.chapter2Reported && !state.obsidianGolemDefeated) return "黒市の東、黒曜洞の巨人を倒そう";
      if (state.chapter2Reported && player.level < CHAPTER3_REQUIREMENTS.level) return `第3章大ボスにはLV${CHAPTER3_REQUIREMENTS.level}が要る`;
      if (state.chapter2Reported) return "黒門砦で黒陽装備を整えよう";
      if (state.elderReported && state.ashKnightDefeated && !state.discoveries.has("eclipse-seal")) return "月見砦の南西で封印碑を探す";
      if (state.elderReported && state.ashKnightDefeated && player.level < CHAPTER2_REQUIREMENTS.level) return `第2章大ボスにはLV${CHAPTER2_REQUIREMENTS.level}が要る`;
      if (state.elderReported && state.ashKnightDefeated) return "月見砦で月蝕装備を整えよう";
      if (state.elderReported && !state.ashKnightDefeated && player.level >= ASH_KNIGHT_REQUIREMENTS.level) return "灰道の宿場から古塔の灰騎士へ";
      if (state.wardenDefeated && !state.ashKnightDefeated) return `古塔へ向けてLV${ASH_KNIGHT_REQUIREMENTS.level}まで鍛える`;
      if (cost > 0 && player.gold < cost) return `次の装備まで${cost}G`;
      if (player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level && !state.wardenDefeated) return "南東の番人に挑める";
      if (cost > 0) return "装備更新で生存圏を広げよう";
      return "遠くへ進み、危なくなったら戻ろう";
    }
    const hpRate = player.hp / player.hpMax;
    if (hpRate < 0.35) return "危険: 帰還鈴か最寄りの拠点で立て直そう";
    const stage = gameStage(context);
    const region = currentRegion();
    if (region === "windCoast") return "蒼風港を足場に、灯台道か南の海岸道を選ぼう";
    if (region === "eastHighland") return "中央峠は近くて危険。西海岸道なら退路を取りやすい";
    if (region === "southIsles") return "南風岬砦で補給し、小島の橋と古い祠を巡ろう";
    if (region === "dawnCoast") return "黎明港を拠点に、北の山道か西海岸の迂回路を選ぼう";
    if (region === "sunriseHighland") return "陽冠都市を目指せ。中央山道は近いが敵圧が高い";
    if (region === "emberIsles") return "熾火群島は最深部。退路と回復品を確保して祠へ進もう";
    if (region === "frostTower2" && !state.towerWardenDefeated) return "凍気灯を先に壊し、最上階の塔守を倒そう";
    if (region === "frostTower2") return "最上階の遺物庫と昇降機を調べよう";
    if (region === "frostTower1") return "補給庫を探し、南東の階段から二階へ";
    if (region === "frostCave" && !state.frostGolemDefeated && player.level < FROST_GOLEM_REQUIREMENTS.level) return `氷窟巨人にはLV${FROST_GOLEM_REQUIREMENTS.level}ほど欲しい`;
    if (region === "frostCave" && !state.frostGolemDefeated) return "氷窟巨人を倒せば霜心の護符に届く";
    if (region === "frostCave") return "霜心の護符を装備し、霜冠城へ戻ろう";
    if (region === "frostCitadel" && !state.discoveries.has("frost-seal")) return "霜冠城の中庭で封印碑を探そう";
    if (region === "frostCitadel" && !state.frostGolemDefeated) return "先に南西の氷窟巨人を倒そう";
    if (region === "frostCitadel" && player.level < CHAPTER4_REQUIREMENTS.level) return `霜冠竜にはLV${CHAPTER4_REQUIREMENTS.level}ほど欲しい`;
    if (region === "frostCitadel") return "霜冠竜の氷弾は白銀装備と霜心で軽くなる";
    if (region === "frost") return "白銀宿で回復し、本道か南の氷窟道を選ぼう";
    if (region === "undercity" && !state.chapter2Reported) return "黒市地下墓所は終盤級。無理なら入口へ戻ろう";
    if (region === "undercity" && !state.cryptWardenDefeated && player.level < CRYPT_WARDEN_REQUIREMENTS.level) return `墓所の番人にはLV${CRYPT_WARDEN_REQUIREMENTS.level}ほど欲しい`;
    if (region === "undercity" && !state.cryptWardenDefeated) return "吸命鬼を避け、最奥の墓所番人を倒そう";
    if (region === "undercity") return "深層灯の護符は鈍足と薬草運用を改善する";
    if (region === "mistShrine" && !state.regenSentinelDefeated) return "再生洞の守護者を倒すと霧灯の祠へ進める";
    if (region === "mistShrine" && !state.mistKeeperDefeated && player.level < MIST_KEEPER_REQUIREMENTS.level) return `霧灯の守にはLV${MIST_KEEPER_REQUIREMENTS.level}ほど欲しい`;
    if (region === "mistShrine" && !state.mistKeeperDefeated) return "霧灯の守を倒して護符を取ろう";
    if (region === "mistShrine") return "霧灯の護符は罠・召喚・魔法圧を軽くする";
    if (region === "regenCave" && !state.regenSentinelDefeated && player.level < REGEN_SENTINEL_REQUIREMENTS.level) return `再生洞の守護者にはLV${REGEN_SENTINEL_REQUIREMENTS.level}ほど欲しい`;
    if (region === "regenCave" && !state.regenSentinelDefeated) return "再生洞の守護者を倒せば大再生の指輪に近づける";
    if (region === "regenCave") return "大再生の指輪で遠征が伸びる。帰還鈴で拠点へ戻ろう";
    if (region === "smuggler" && !state.smugglerCaptainDefeated && player.level < SMUGGLER_CAPTAIN_REQUIREMENTS.level) return `密輸道は危険な近道。隊長に挑むならLV${SMUGGLER_CAPTAIN_REQUIREMENTS.level}が目安`;
    if (region === "smuggler" && !state.smugglerCaptainDefeated) return "密輸隊長を倒せば黒市への近道が少し安全になる";
    if (region === "smuggler") return "密輸道は黒市への近道。補給箱を拾いながら抜けよう";
    if (region === "obsidian") return "黒曜洞は中ボス級の圧。黒市へ戻る余力を残そう";
    if (region === "void") return "黒陽領は最高危険度。砦へ戻る余力を残そう";
    if (region === "eclipse") return "月蝕魔法が濃い。砦へ戻れるHPを残そう";
    if (state.wardenDefeated && !state.ashKnightDefeated && region === "ash") return "古塔は南。LV14で灰騎士に挑む";
    if (state.wardenDefeated && !state.ashKnightDefeated && region === "tower") return "古塔の灰騎士を探せ";
    if (state.ashKnightDefeated && region === "tower") return "さらに南の月影廃墟へ進める";
    if (region === "moon") return "月影廃墟の南に月見砦がある";
    if (player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level && !state.wardenDefeated) return "南東の番人の気配が近い";
    if (stage === "scales") return player.armor === 0 ? "痛ければ村で防具を買おう" : "外で鱗とゴールドを集めよう";
    if (stage === "ruin") return "北森で守護者の紋章を探す";
    if (stage === "level") return "装備とLVを上げて竜洞へ";
    if (stage === "guardian") return "北森の守護者へ";
    if (stage === "cave") return "北東の竜洞へ";
    if (stage === "dragon") return "赤竜戦: 正面を避けよう";
    if (stage === "report") return "村へ戻って報告";
    if (stage === "chapter2report") return "長老へ第2章の報告";
    if (stage === "chapter3report") return "長老へ第3章の報告";
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
    if (state.chapter4Reported) return "chapter4cleared";
    if (state.chapter4Victory || (state.frostDragonDefeated && !state.chapter4Reported)) return "chapter4report";
    if (state.spawnedFrostDragon) return "frostDragon";
    if (state.spawnedFrostGolem) return "frostGolem";
    if (state.chapter3Reported && state.frostGolemDefeated && state.discoveries.has("frost-seal") && player.level >= CHAPTER4_REQUIREMENTS.level) return "frostReady";
    if (state.chapter3Reported && state.frostGolemDefeated && !state.discoveries.has("frost-seal")) return "frostSeal";
    if (state.chapter3Reported) return "frostRoute";
    if (state.chapter3Victory || (state.voidDragonDefeated && !state.chapter3Reported)) return "chapter3report";
    if (state.spawnedVoidDragon) return "void";
    if (state.spawnedObsidianGolem) return "obsidian";
    if (state.chapter2Reported && state.discoveries.has("void-seal") && state.chests.has("black-fort-armory") && !state.obsidianGolemDefeated && player.level >= OBSIDIAN_GOLEM_REQUIREMENTS.level) return "obsidianReady";
    if (state.chapter2Reported && state.discoveries.has("void-seal") && state.chests.has("black-fort-armory") && state.obsidianGolemDefeated && player.level >= CHAPTER3_REQUIREMENTS.level) return "voidReady";
    if (state.chapter2Reported && !state.discoveries.has("void-seal")) return "voidSeal";
    if (state.chapter2Reported) return "voidRoute";
    if (state.chapter2Victory || (state.eclipseDragonDefeated && !state.chapter2Reported)) return "chapter2report";
    if (state.spawnedEclipseDragon) return "eclipse";
    if (state.elderReported && state.ashKnightDefeated && state.discoveries.has("eclipse-seal") && player.level >= CHAPTER2_REQUIREMENTS.level) return "eclipseReady";
    if (state.elderReported && state.ashKnightDefeated && !state.discoveries.has("eclipse-seal")) return "eclipseSeal";
    if (state.elderReported && state.ashKnightDefeated) return "moonRoute";
    if (state.elderReported) return "postDragon";
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
      cleared: "第1章クリア",
      postDragon: "第2章開始",
      moonRoute: "月影遠征",
      eclipseSeal: "月蝕封印",
      eclipseReady: "月蝕城",
      eclipse: "月蝕竜戦",
      chapter2report: "第2章報告",
      chapter2cleared: "第2章クリア",
      voidRoute: "黒陽遠征",
      voidSeal: "黒陽封印",
      obsidianReady: "黒曜洞",
      obsidian: "黒曜巨人戦",
      voidReady: "黒陽城",
      void: "黒陽竜戦",
      chapter3report: "第3章報告",
      chapter3cleared: "第3章クリア",
      frostRoute: "霜境遠征",
      frostGolem: "氷窟巨人戦",
      frostSeal: "霜冠封印",
      frostReady: "霜冠城",
      frostDragon: "霜冠竜戦",
      chapter4report: "第4章報告",
      chapter4cleared: "第4章クリア",
    };
    return names[stage] || "旅";
  }

  function contextPromptText(context) {
    const {
      player,
      nearestNpc,
      nearestPortal,
      nearestChest,
      nearestDiscovery,
      playerNearCave,
      canChallengeDragon,
      tileAt,
    } = requireTextContext(context);
    const npc = nearestNpc();
    if (npc?.type === "porter") return "話す: 馬車";
    if (npc) return `話す: ${npcRoleName(npc.type)}`;
    const portal = nearestPortal();
    if (portal) return portal.prompt || `移動: ${portal.name}`;
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
    if (type === "frostSmith") return "盾刻師";
    if (type === "merchant") return "商人";
    if (type === "guide") return "案内人";
    if (type === "guard") return "衛兵";
    if (type === "villager") return "住人";
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
