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
    MOON_CAVERN_GATEKEEPER_REQUIREMENTS,
    MOON_ARCHIVE_WARDEN_REQUIREMENTS,
    CHAPTER2_REQUIREMENTS,
    CHAPTER3_REQUIREMENTS,
    CHAPTER4_REQUIREMENTS,
    CHAPTER5_REQUIREMENTS,
    SOLAR_WARDEN_REQUIREMENTS,
    SUNCREST_CHAMPION_REQUIREMENTS,
    SUNSPIRE_KEEPER_REQUIREMENTS,
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
    if (stage === "chapter5cleared") return "第5章CLEAR: 熾火天竜を封じた";
    if (stage === "chapter5report") return "目的: 長老へ熾火天竜討伐を報告";
    if (stage === "emberDragon") return "目的: 熾火天竜を倒す";
    if (stage === "emberReady") return "目的: 熾火聖域の最奥へ進む";
    if (stage === "emberSupply") return "目的: 熾火聖域の補給箱を確保";
    if (stage === "sunriseSeal") return "目的: 日出高原南の陽光封印碑を読む";
    if (stage === "sunspireReward") return "目的: 日鏡塔の反射水晶を受け取る";
    if (stage === "sunspireKeeper") return "目的: 日鏡塔の守主を倒す";
    if (stage === "sunspireRoute") return `目的: 陽冠都市東の日鏡塔へ LV${SUNSPIRE_KEEPER_REQUIREMENTS.level}`;
    if (stage === "suncrestArenaReward") return "目的: 闘技場奥の遺物庫を開ける";
    if (stage === "suncrestChampion") return "目的: 陽冠闘技王を倒す";
    if (stage === "suncrestArena") return `目的: 陽冠都市西の闘技場へ LV${SUNCREST_CHAMPION_REQUIREMENTS.level}`;
    if (stage === "solarWarden") return "目的: 北東高原の日輪砲台守を破壊";
    if (stage === "sunriseRoute") return `目的: 黎明港から北東高原の日輪砲台へ LV${SOLAR_WARDEN_REQUIREMENTS.level}`;
    if (stage === "chapter4report") return "目的: 長老へ霜冠竜討伐を報告";
    if (stage === "frostDragon") return "目的: 霜冠竜を倒す";
    if (stage === "frostReady") return "目的: 霜冠城の奥へ進む";
    if (stage === "frostSeal") return "目的: 霜冠城の封印碑を探す";
    if (stage === "frostGolem") return "目的: 氷窟巨人を倒す";
    if (stage === "frostRoute") return `目的: 白銀宿を拠点に東の氷窟へ LV${FROST_GOLEM_REQUIREMENTS.level}`;
    if (stage === "chapter3cleared") return "第3章CLEAR: 黒陽竜を封じた";
    if (stage === "chapter3report") return "目的: 長老へ黒陽竜討伐を報告";
    if (stage === "void") return "目的: 黒陽竜を倒す";
    if (stage === "voidReady") return "目的: 黒陽城の奥へ進む";
    if (stage === "obsidian") return "目的: 黒曜洞の巨人を倒す";
    if (stage === "obsidianReady") return "目的: 黒市の東、黒曜洞へ";
    if (stage === "blackFortRoute") return "目的: 黒市から黒門前哨を越えて黒門砦へ";
    if (stage === "voidSeal") return "目的: 黒陽城の封印碑を探す";
    if (stage === "voidRoute") return `目的: 黒門砦と黒陽城へ LV${CHAPTER3_REQUIREMENTS.level}`;
    if (stage === "chapter2cleared") return "第2章CLEAR: 月蝕竜を封じた";
    if (stage === "chapter2report") return "目的: 長老へ月蝕竜討伐を報告";
    if (stage === "eclipse") return "目的: 月蝕竜を倒す";
    if (stage === "eclipseReady") return "目的: 月蝕城の奥へ進む";
    if (stage === "eclipseSeal") return "目的: 月蝕城の封印碑を探す";
    if (stage === "moonArchiveReward") return "目的: 月の書庫の遺物庫を開ける";
    if (stage === "moonArchiveWarden") return "目的: 月の書庫の番人を倒す";
    if (stage === "moonArchive") return `目的: 月見砦東の月の書庫へ LV${MOON_ARCHIVE_WARDEN_REQUIREMENTS.level}`;
    if (stage === "moonCavern") return state.moonGatekeeperDefeated
      ? "目的: 月洞印を得て東出口から月見砦へ"
      : `目的: 月影洞窟の月門の護将を倒す LV${MOON_CAVERN_GATEKEEPER_REQUIREMENTS.level}`;
    if (stage === "moonRelic") return "目的: 月影廃墟で月影遺物を探す";
    if (stage === "moonRoute") return `目的: 月見砦と月蝕城へ LV${CHAPTER2_REQUIREMENTS.level}`;
    if (stage === "postDragon") return "目的: 灰道の宿場から古塔へ";
    if (stage === "cleared") return "第1章CLEAR: 旅は続く";
    if (stage === "report") return "目的: 長老へ赤竜討伐を報告";
    if (stage === "dragon") return "目的: 竜洞の赤竜を倒す";
    if (stage === "cave") return "目的: 北東の岩山にある竜洞へ向かう";
    if (stage === "guardian") return "目的: 北森の守護者を倒す";
    if (stage === "level") return `目的: LV${BOSS_REQUIREMENTS.level}まで鍛える`;
    if (stage === "ruin") return "目的: 北森の紋章を探す";
    if (stage === "firstCamp") return "目的: 村の東門から北東の草原野営地へ";
    const unopened = TREASURE_CHESTS.length - state.chests.size;
    const hidden = DISCOVERY_POINTS.length - state.discoveries.size;
    return `目的: 鱗${player.scales}/${BOSS_REQUIREMENTS.scales} 宝${unopened} 発見${hidden}`;
  }

  function guidanceText(context) {
    const { state, player, inTown, currentRegion, areaDangerText } = requireTextContext(context);
    if (inTown(player.x, player.y)) {
      if (state.chapter5Victory) return "熾火天竜討伐を長老へ報告";
      if (state.chapter4Victory) return "霜冠竜討伐を長老へ報告";
      if (state.chapter3Victory) return "黒陽竜討伐を長老へ報告";
      if (state.chapter2Victory) return "月蝕竜討伐を長老へ報告";
      if (player.hp < player.hpMax) return "回復陣か薬師で立て直そう";
      if (!state.elderReported && !state.arrivedSafeBases?.has("grassland-camp")) return "焚火と青い回復陣を目印に、村外の安全圏を確保しよう";
      const cost = nextUpgradeCost(context);
      if (state.chapter4Reported && !state.solarWardenDefeated && player.level < SOLAR_WARDEN_REQUIREMENTS.level) return `日輪砲台守にはLV${SOLAR_WARDEN_REQUIREMENTS.level}が要る`;
      if (state.chapter4Reported && !state.solarWardenDefeated) return "黎明港から北東高原の日輪砲台へ";
      if (state.chapter4Reported && state.solarWardenDefeated && !state.sunspireKeeperDefeated && player.level < SUNSPIRE_KEEPER_REQUIREMENTS.level) return `日鏡塔の守主にはLV${SUNSPIRE_KEEPER_REQUIREMENTS.level}が要る`;
      if (state.chapter4Reported && state.solarWardenDefeated && !state.sunspireKeeperDefeated) return "陽冠都市の東門から日鏡塔へ";
      if (state.chapter4Reported && state.solarWardenDefeated && !state.suncrestChampionDefeated && player.level >= SUNCREST_CHAMPION_REQUIREMENTS.level) return "任意: 西広場の闘技場で連撃装飾を狙える";
      if (state.chapter4Reported && state.sunspireKeeperDefeated && !state.chests.has("sunspire-reliquary")) return "日鏡塔奥で反射水晶を受け取る";
      if (state.chapter4Reported && !state.discoveries.has("sunrise-seal")) return "陽冠都市の南街道で陽光封印碑を探す";
      if (state.chapter4Reported && !state.chests.has("ember-sanctum-cache")) return "熾火聖域で決戦物資を確保する";
      if (state.chapter4Reported && player.level < CHAPTER5_REQUIREMENTS.level) return `熾火天竜にはLV${CHAPTER5_REQUIREMENTS.level}が要る`;
      if (state.chapter4Reported) return "陽冠都市で光砲対策装備を整える";
      if (state.chapter3Reported && !state.frostGolemDefeated && !state.arrivedSafeBases?.has("frost-haven")) return "黒門砦から南の霜原を越え、白銀宿を目指そう";
      if (state.chapter3Reported && !state.frostGolemDefeated && player.level < FROST_GOLEM_REQUIREMENTS.level) return `白銀宿を拠点に氷窟へ。巨人にはLV${FROST_GOLEM_REQUIREMENTS.level}が要る`;
      if (state.chapter3Reported && !state.frostGolemDefeated) return "白銀宿の東、氷窟巨人を倒そう";
      if (state.chapter3Reported && !state.discoveries.has("frost-seal")) return "霜冠城の中庭で封印碑を探そう";
      if (state.chapter3Reported && player.level < CHAPTER4_REQUIREMENTS.level) return `霜冠竜にはLV${CHAPTER4_REQUIREMENTS.level}が要る`;
      if (state.chapter3Reported) return "白銀宿で凍土装備を整えよう";
      if (state.chapter2Reported && !state.chests.has("black-fort-armory")) return "黒門砦の武具箱で黒陽装備を得よう";
      if (state.chapter2Reported && !state.discoveries.has("void-seal")) return "黒門砦の南西で黒陽碑を探す";
      if (state.chapter2Reported && !state.obsidianGolemDefeated && player.level < OBSIDIAN_GOLEM_REQUIREMENTS.level) return `黒曜洞の巨人にはLV${OBSIDIAN_GOLEM_REQUIREMENTS.level}が要る`;
      if (state.chapter2Reported && !state.obsidianGolemDefeated) return "黒市の東、黒曜洞の巨人を倒そう";
      if (state.chapter2Reported && player.level < CHAPTER3_REQUIREMENTS.level) return `第3章大ボスにはLV${CHAPTER3_REQUIREMENTS.level}が要る`;
      if (state.chapter2Reported) return "黒門砦で黒陽装備を整えよう";
      if (state.elderReported && state.ashKnightDefeated && !state.chests.has("moon-ruin-cache")) return "月影廃墟で月影遺物を探す";
      if (state.elderReported && state.ashKnightDefeated && state.chests.has("moon-ruin-cache") && !state.moonGatekeeperDefeated) return `月影洞窟の護将はLV${MOON_CAVERN_GATEKEEPER_REQUIREMENTS.level}。正面を避けて突破しよう`;
      if (state.elderReported && state.ashKnightDefeated && state.chests.has("moon-ruin-cache") && !state.chests.has("moon-cavern-reliquary")) return "護将の先で月洞印を得て、東出口から月見砦へ";
      if (state.elderReported && state.ashKnightDefeated && state.chests.has("moon-ruin-cache") && !state.archiveWardenDefeated && player.level < MOON_ARCHIVE_WARDEN_REQUIREMENTS.level) return `月の書庫の番人にはLV${MOON_ARCHIVE_WARDEN_REQUIREMENTS.level}が要る`;
      if (state.elderReported && state.ashKnightDefeated && state.chests.has("moon-ruin-cache") && !state.archiveWardenDefeated) return "月見砦の東、月の書庫へ";
      if (state.elderReported && state.archiveWardenDefeated && !state.chests.has("moon-archive-reliquary")) return "月の書庫の奥で遺物庫を開ける";
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
    if (region === "sunriseHighland" && !state.solarWardenDefeated) return "焼けた街道と光の砲声を追い、北東高原の日輪砲台へ";
    if (region === "suncrestArena" && !state.suncrestChampionDefeated && player.level < SUNCREST_CHAMPION_REQUIREMENTS.level) return `陽冠闘技場はLV${SUNCREST_CHAMPION_REQUIREMENTS.level}級。都市で装備と霊薬を整えよう`;
    if (region === "suncrestArena" && !state.suncrestChampionDefeated) return "走者の突進と光砲の着弾円を避け、中央の闘技王へ詰めろ";
    if (region === "suncrestArena" && !state.chests.has("suncrest-arena-reliquary")) return "闘技王撃破後は奥の遺物庫で陽冠闘士の徽章を受け取ろう";
    if (region === "suncrestArena") return "連撃装飾を装備し、日鏡塔や熾火群島の長期戦に備えよう";
    if (region === "sunspire" && !state.sunspireKeeperDefeated && player.level < SUNSPIRE_KEEPER_REQUIREMENTS.level) return `日鏡塔はLV${SUNSPIRE_KEEPER_REQUIREMENTS.level}級。無理なら陽冠都市へ戻ろう`;
    if (region === "sunspire" && !state.sunspireKeeperDefeated) return "反射鏡の着弾円を避け、塔奥の日鏡塔の守主へ";
    if (region === "sunspire" && !state.chests.has("sunspire-reliquary")) return "守主の奥の遺物庫で反射水晶を取ろう";
    if (region === "sunspire") return "反射水晶を装備し、南の陽光封印碑と熾火聖域へ備えよう";
    if (region === "sunriseHighland" && !state.discoveries.has("sunrise-seal")) return "陽冠都市の南街道で陽光封印碑を探そう";
    if (region === "sunriseHighland") return "陽冠都市の高額装備で狙撃と着弾術を軽減できる";
    if (region === "emberIsles" && !state.chests.has("ember-sanctum-cache")) return "熾火聖域の補給箱を確保して退路を作ろう";
    if (region === "emberIsles" && player.level < CHAPTER5_REQUIREMENTS.level) return `熾火天竜にはLV${CHAPTER5_REQUIREMENTS.level}ほど欲しい`;
    if (region === "emberIsles") return "射線・着弾円・扇状弾を見て熾火天竜へ踏み込もう";
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
    if (region === "frost" && !state.frostGolemDefeated) return "白銀宿で回復し、東の氷窟で霜心を狙おう。霜見塔は寄り道";
    if (region === "frost") return "霜心を持って霜冠城へ。霜見塔は移動報酬の寄り道";
    if (region === "undercity" && !state.chapter2Reported) return "黒市地下墓所は終盤級。無理なら入口へ戻ろう";
    if (region === "moonArchive" && !state.archiveWardenDefeated && player.level < MOON_ARCHIVE_WARDEN_REQUIREMENTS.level) return `月の書庫はLV${MOON_ARCHIVE_WARDEN_REQUIREMENTS.level}級。無理なら月見砦へ戻ろう`;
    if (region === "moonArchive" && !state.archiveWardenDefeated) return "召喚士を先に倒し、奥の月書庫の番人へ進もう";
    if (region === "moonArchive" && !state.chests.has("moon-archive-reliquary")) return "番人の奥の遺物庫で月蝕の指輪を取ろう";
    if (region === "moonArchive") return "月蝕の備えを整え、月見砦南西の封印碑へ戻ろう";
    if (region === "moonCavern" && !state.chests.has("moon-cavern-mid-cache")) return "月影洞窟の中継補給を探せ。帰還札を残すと撤退しやすい";
    if (region === "moonCavern" && !state.discoveries.has("moon-cavern-way-shrine")) return "中央水路の月泉は一度だけ全快できる。使い時を選ぼう";
    if (region === "moonCavern" && !state.chests.has("moon-cavern-exit-cache")) return "出口前の補給を拾い、護将戦へ備えよう";
    if (region === "moonCavern" && !state.moonGatekeeperDefeated && player.level < MOON_CAVERN_GATEKEEPER_REQUIREMENTS.level) return `月門の護将はLV${MOON_CAVERN_GATEKEEPER_REQUIREMENTS.level}級。西出口へ退いて装備を整えよう`;
    if (region === "moonCavern" && !state.moonGatekeeperDefeated) return "月門の護将は正面が硬い。月影を先に倒し、側面か背後へ回れ";
    if (region === "moonCavern" && !state.chests.has("moon-cavern-reliquary")) return "護将の奥で月洞印を得て、東の出口から月見砦へ抜けろ";
    if (region === "moonCavern") return "月洞印は得た。東は月見砦、西は月影廃墟へ戻れる";
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
    if (region === "obsidian" && state.chapter2Reported && !state.chests.has("black-fort-armory")) return "黒門前哨の補給を拾い、東の黒門砦まで押し切ろう";
    if (region === "obsidian") return "黒曜洞は中ボス級の圧。黒市へ戻る余力を残そう";
    if (region === "blackGateNorth") return "北道は盾兵中心。遠回りだが側面を取れば安定する";
    if (region === "blackGateSouth") return "南道は罠と術師の近道。護符とダッシュで一気に抜けよう";
    if (region === "void" && state.chapter2Reported && !state.chests.has("black-fort-armory")) return "黒門砦が近い。南道の罠か北道の盾兵を見て進もう";
    if (region === "void") return "黒陽領は最高危険度。砦へ戻る余力を残そう";
    if (region === "eclipse") return "月蝕魔法が濃い。砦へ戻れるHPを残そう";
    if (region === "frostApproach" && !state.arrivedSafeBases?.has("frost-haven")) return "白銀宿の灯が見える。前進補給を拾い、最後の吹雪を越えよう";
    if (state.wardenDefeated && !state.ashKnightDefeated && region === "ash") return "古塔は南。LV14で灰騎士に挑む";
    if (state.wardenDefeated && !state.ashKnightDefeated && region === "tower") return "古塔の灰騎士を探せ";
    if (state.ashKnightDefeated && region === "tower") return "さらに南の月影廃墟へ進める";
    if (region === "moon" && !state.chests.has("moon-ruin-cache")) return "月影廃墟の星遺物を探し、月見砦で補給しよう";
    if (region === "moon" && state.chests.has("moon-ruin-cache") && !state.chests.has("moon-cavern-reliquary")) return "月影廃墟の西門から月影洞窟へ。奥で月洞印を取れば月見砦へ抜けられる";
    if (region === "moon") return "月影廃墟の南に月見砦、東に月の書庫がある";
    if (region === "dragonApproach" && !state.chests.has("dragon-approach-cache")) return "焦げ道の竜狩人補給を探せ。帰還鈴を残せば撤退して装備を整えられる";
    if (region === "dragonApproach") return "小竜と火霊を抜け、北の熱い岩穴へ。HPが減ったら補給の帰還鈴で戻ろう";
    if (player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level && !state.wardenDefeated) return "南東の番人の気配が近い";
    if (stage === "scales") return player.armor === 0 ? "痛ければ村で防具を買おう" : "外で鱗とゴールドを集めよう";
    if (stage === "ruin") return "北森で守護者の紋章を探す";
    if (stage === "level") return "装備とLVを上げて竜洞へ";
    if (stage === "guardian") return "北森の守護者へ";
    if (stage === "cave") return "村の北東、岩山の焦げた道標から竜洞へ";
    if (stage === "dragon") return "赤竜戦: 三連火炎は横へ、火床から離れて側背面へ";
    if (stage === "report") return "村へ戻って報告";
    if (stage === "chapter2report") return "長老へ第2章の報告";
    if (stage === "chapter3report") return "長老へ第3章の報告";
    if (stage === "chapter4report") return "長老へ第4章の報告";
    if (stage === "chapter5report") return "長老へ第5章の報告";
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
    const region = typeof context.currentRegion === "function" ? context.currentRegion() : "";
    if (state.chapter5Reported) return "chapter5cleared";
    if (state.chapter5Victory || (state.emberDragonDefeated && !state.chapter5Reported)) return "chapter5report";
    if (state.spawnedEmberDragon) return "emberDragon";
    if (state.chapter4Reported && state.solarWardenDefeated && state.sunspireKeeperDefeated && state.chests.has("sunspire-reliquary") && state.discoveries.has("sunrise-seal") && state.chests.has("ember-sanctum-cache") && player.level >= CHAPTER5_REQUIREMENTS.level) return "emberReady";
    if (state.chapter4Reported && state.solarWardenDefeated && state.sunspireKeeperDefeated && state.chests.has("sunspire-reliquary") && state.discoveries.has("sunrise-seal") && !state.chests.has("ember-sanctum-cache")) return "emberSupply";
    if (state.chapter4Reported && state.solarWardenDefeated && state.sunspireKeeperDefeated && state.chests.has("sunspire-reliquary") && !state.discoveries.has("sunrise-seal")) return "sunriseSeal";
    if (state.spawnedSunspireKeeper) return "sunspireKeeper";
    if (state.chapter4Reported && state.solarWardenDefeated && state.sunspireKeeperDefeated && !state.chests.has("sunspire-reliquary")) return "sunspireReward";
    if (state.spawnedSuncrestChampion && !state.suncrestChampionDefeated) return "suncrestChampion";
    if (region === "suncrestArena" && state.chapter4Reported && state.solarWardenDefeated && state.suncrestChampionDefeated && !state.chests.has("suncrest-arena-reliquary")) return "suncrestArenaReward";
    if (region === "suncrestArena" && state.chapter4Reported && state.solarWardenDefeated && !state.suncrestChampionDefeated) return "suncrestArena";
    if (state.chapter4Reported && state.solarWardenDefeated && !state.sunspireKeeperDefeated) return "sunspireRoute";
    if (state.spawnedSolarWarden) return "solarWarden";
    if (state.chapter4Reported) return "sunriseRoute";
    if (state.chapter4Victory || (state.frostDragonDefeated && !state.chapter4Reported)) return "chapter4report";
    if (state.spawnedFrostDragon) return "frostDragon";
    if (state.spawnedFrostGolem) return "frostGolem";
    if (state.chapter3Reported && state.frostGolemDefeated && state.discoveries.has("frost-seal") && player.level >= CHAPTER4_REQUIREMENTS.level) return "frostReady";
    if (state.chapter3Reported && state.frostGolemDefeated && !state.discoveries.has("frost-seal")) return "frostSeal";
    if (state.chapter3Reported) return "frostRoute";
    if (state.chapter3Victory || (state.voidDragonDefeated && !state.chapter3Reported)) return "chapter3report";
    if (state.spawnedVoidDragon) return "void";
    if (state.spawnedObsidianGolem) return "obsidian";
    if (state.chapter2Reported && !state.chests.has("black-fort-armory")) return "blackFortRoute";
    if (state.chapter2Reported && state.discoveries.has("void-seal") && state.chests.has("black-fort-armory") && !state.obsidianGolemDefeated && player.level >= OBSIDIAN_GOLEM_REQUIREMENTS.level) return "obsidianReady";
    if (state.chapter2Reported && state.discoveries.has("void-seal") && state.chests.has("black-fort-armory") && state.obsidianGolemDefeated && player.level >= CHAPTER3_REQUIREMENTS.level) return "voidReady";
    if (state.chapter2Reported && !state.discoveries.has("void-seal")) return "voidSeal";
    if (state.chapter2Reported) return "voidRoute";
    if (state.chapter2Victory || (state.eclipseDragonDefeated && !state.chapter2Reported)) return "chapter2report";
    if (state.spawnedEclipseDragon) return "eclipse";
    if (state.elderReported && state.ashKnightDefeated && state.archiveWardenDefeated && state.chests.has("moon-archive-reliquary") && state.discoveries.has("eclipse-seal") && player.level >= CHAPTER2_REQUIREMENTS.level) return "eclipseReady";
    if (state.spawnedArchiveWarden) return "moonArchiveWarden";
    if (state.elderReported && state.ashKnightDefeated && state.archiveWardenDefeated && !state.chests.has("moon-archive-reliquary")) return "moonArchiveReward";
    if (state.elderReported && state.ashKnightDefeated && state.chests.has("moon-ruin-cache") && !state.chests.has("moon-cavern-reliquary")) return "moonCavern";
    if (state.elderReported && state.ashKnightDefeated && state.chests.has("moon-ruin-cache") && !state.archiveWardenDefeated) return "moonArchive";
    if (state.elderReported && state.ashKnightDefeated && !state.chests.has("moon-ruin-cache")) return "moonRelic";
    if (state.elderReported && state.ashKnightDefeated && !state.discoveries.has("eclipse-seal")) return "eclipseSeal";
    if (state.elderReported && state.ashKnightDefeated) return "moonRoute";
    if (state.elderReported) return "postDragon";
    if (state.victory || state.bossDefeated) return "report";
    if (state.spawnedBoss) return "dragon";
    if (canChallengeDragon()) return "cave";
    if (!state.guardianDefeated && guardianReady()) return "guardian";
    if (player.scales >= BOSS_REQUIREMENTS.scales && player.level < BOSS_REQUIREMENTS.level) return "level";
    if (player.scales >= 2 && !state.guardianDefeated) return "ruin";
    if (!state.arrivedSafeBases?.has("grassland-camp")) return "firstCamp";
    return "scales";
  }

  function stageName(stage) {
    const names = {
      scales: "鱗集め",
      firstCamp: "最初の遠征",
      ruin: "北森探索",
      level: "鍛錬",
      guardian: "守護者",
      cave: "竜洞",
      dragon: "赤竜戦",
      report: "報告",
      cleared: "第1章クリア",
      postDragon: "第2章開始",
      moonRoute: "月影遠征",
      moonRelic: "月影遺物",
      moonCavern: "月影洞窟",
      moonArchive: "月の書庫",
      moonArchiveWarden: "書庫番戦",
      moonArchiveReward: "月蝕遺物庫",
      eclipseSeal: "月蝕封印",
      eclipseReady: "月蝕城",
      eclipse: "月蝕竜戦",
      chapter2report: "第2章報告",
      chapter2cleared: "第2章クリア",
      voidRoute: "黒陽遠征",
      blackFortRoute: "黒門砦への遠征",
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
      sunriseRoute: "日出高原遠征",
      solarWarden: "日輪砲台戦",
      sunspireRoute: "日鏡塔遠征",
      sunspireKeeper: "日鏡塔守主戦",
      sunspireReward: "反射水晶",
      suncrestArena: "陽冠闘技場",
      suncrestChampion: "陽冠闘技王戦",
      suncrestArenaReward: "闘技場遺物庫",
      sunriseSeal: "陽光封印",
      emberSupply: "熾火聖域探索",
      emberReady: "熾火天竜の聖域",
      emberDragon: "熾火天竜戦",
      chapter5report: "第5章報告",
      chapter5cleared: "第5章クリア",
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
