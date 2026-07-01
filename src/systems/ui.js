"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before ui helpers");
  }

  const {
    TILE,
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    TILE_WATER,
    BOSS_REQUIREMENTS,
    MOON_CAVERN_GATEKEEPER_REQUIREMENTS,
    MOON_ARCHIVE_WARDEN_REQUIREMENTS,
    CHAPTER2_REQUIREMENTS,
    SOLAR_WARDEN_REQUIREMENTS,
    SUNCREST_CHAMPION_REQUIREMENTS,
    SUNSPIRE_KEEPER_REQUIREMENTS,
    CHAPTER5_REQUIREMENTS,
    weaponNames,
    armorNames,
    weaponTraits,
    weaponAttackProfiles,
    armorTraits,
    weaponCosts,
    armorCosts,
    weaponAttack = [0, 5, 10, 15, 20],
    armorDefense,
    weaponSellValues,
    armorSellValues,
    shieldNames,
    shieldTraits,
    shieldCosts,
    shieldGuard,
    shieldSellValues,
    shieldRuneData,
    itemOrder,
    itemNames,
    itemSellValues,
    accessoryOrder,
    accessoryData,
  } = definitions;

  const rewardHelpers = globalThis.DRAGON_HUNTER_REWARDS;
  if (!rewardHelpers) {
    throw new Error("DRAGON_HUNTER_REWARDS must be loaded before ui helpers");
  }

  const {
    normalizeInventory,
    addOwnedWeapon,
    addOwnedArmor,
    addOwnedShield,
    grantAccessory,
    equippedAccessoryIds,
    equipAccessory,
    itemField,
    setQuickItem,
  } = rewardHelpers;

  const itemDetails = {
    potion: "HP回復",
    tonic: "ST回復/防御",
    bomb: "周囲攻撃",
    ward: "一定時間防御",
    elixir: "全回復",
    warp: "拠点へ帰還",
  };

  function requireUiContext(context) {
    if (!context?.ui || !context?.state || !context?.player || !context?.say) {
      throw new Error("ui helpers require { ui, state, player, say }");
    }
    return context;
  }

  function requireUiStatusContext(context) {
    const base = requireUiContext(context);
    if (!base.playerAttack || !base.playerDefense || !base.dashCost || !base.regenRate || !base.refreshDerivedStats) {
      throw new Error("ui status helpers require combat stat helpers");
    }
    return base;
  }

  function requireUiZoneContext(context) {
    const base = requireUiContext(context);
    if (!base.inTown || !base.tileAt || !base.distanceFromVillage) {
      throw new Error("ui zone helpers require map/region helpers");
    }
    return base;
  }

  function showStats(context) {
    toggleInventory(context);
  }

  function inventoryTabs() {
    return ["items", "weapons", "armors", "shields", "accessories"];
  }

  function inventoryTabLabel(tab) {
    return {
      items: "道具",
      weapons: "武器",
      armors: "防具",
      shields: "盾",
      accessories: "装飾",
    }[tab] || "道具";
  }

  function clampInventoryIndex(state, rows) {
    if (rows.length <= 0) {
      state.inventoryIndex = 0;
      return;
    }
    state.inventoryIndex = Math.max(0, Math.min(state.inventoryIndex || 0, rows.length - 1));
  }

  function clampShopIndex(state) {
    const rows = Array.isArray(state.shopRows) ? state.shopRows : [];
    if (rows.length <= 0) {
      state.shopIndex = 0;
      return;
    }
    state.shopIndex = Math.max(0, Math.min(state.shopIndex || 0, rows.length - 1));
  }

  function openShop(context, title, rows) {
    const { state, say } = requireUiContext(context);
    state.shopOpen = true;
    state.inventoryOpen = false;
    state.worldMapOpen = false;
    state.infoPanel = null;
    state.shopTitle = title || "店";
    state.shopRows = Array.isArray(rows) ? rows : [];
    state.shopIndex = 0;
    state.keys?.clear?.();
    state.virtualKeys?.clear?.();
    state.pointerMove = null;
    clampShopIndex(state);
    say(`${state.shopTitle}を開いた`, 900);
  }

  function closeShop(context) {
    const { state, say } = requireUiContext(context);
    if (!state.shopOpen) return;
    state.shopOpen = false;
    say("店を閉じた", 700);
  }

  function moveShop(context, dy) {
    const { state } = requireUiContext(context);
    if (!state.shopOpen) return;
    state.shopIndex += dy;
    clampShopIndex(state);
  }

  function selectedShopRow(context) {
    const { state } = requireUiContext(context);
    clampShopIndex(state);
    return (Array.isArray(state.shopRows) ? state.shopRows : [])[state.shopIndex] || null;
  }

  function confirmShop(context) {
    const { state, player, say, refreshDerivedStats } = requireUiStatusContext(context);
    const row = selectedShopRow(context);
    if (!row) return;
    normalizeInventory(player);
    if (row.available === false) {
      say(row.lockedReason || "まだ買えない");
      return;
    }
    if (row.type === "item") {
      const field = itemField(row.id);
      const amount = row.amount || 1;
      if ((player[field] || 0) >= 9) {
        say(`${row.name}はこれ以上持てない`);
        return;
      }
      if (player.gold < row.cost) {
        say(`${row.name}は${row.cost}G`);
        return;
      }
      player.gold -= row.cost;
      player[field] = Math.min(9, (player[field] || 0) + amount);
      say(`${row.name}を買った`);
      return;
    }
    if (row.type === "travel") {
      if (player.gold < row.cost) {
        say(`${row.name} ${row.cost}G`);
        return;
      }
      player.gold -= row.cost || 0;
      player.x = row.x * TILE;
      player.y = row.y * TILE;
      player.stamina = player.staminaMax;
      player.invuln = Math.max(player.invuln, 900);
      state.projectiles = [];
      state.shopOpen = false;
      say(`${row.name}へ移動した`);
      return;
    }
    if (row.type === "shieldRune") {
      if (player.shield <= 0) {
        say("盾を装備してから刻印を選ぼう");
        return;
      }
      if (player.shieldRune === row.id) {
        say(`${row.name}は既に刻まれている`);
        return;
      }
      if (player.gold < row.cost) {
        say(`${row.name}は${row.cost}G`);
        return;
      }
      player.gold -= row.cost;
      player.shieldRune = row.id;
      for (const candidate of state.shopRows) {
        if (candidate.type === "shieldRune") candidate.owned = candidate.id === row.id;
      }
      say(`${row.name}を盾へ刻んだ`);
      return;
    }
    if (row.type === "weapon") {
      if (player.ownedWeapons.includes(row.id)) {
        say(`${row.name}は既に持っている`);
        return;
      }
      if (player.gold < row.cost) {
        say(`${row.name}は${row.cost}G`);
        return;
      }
      player.gold -= row.cost;
      addOwnedWeapon(player, row.id);
      say(`${row.name}を買った。もちもので装備できる`);
      return;
    }
    if (row.type === "armor") {
      if (player.ownedArmors.includes(row.id)) {
        say(`${row.name}は既に持っている`);
        return;
      }
      if (player.gold < row.cost) {
        say(`${row.name}は${row.cost}G`);
        return;
      }
      player.gold -= row.cost;
      addOwnedArmor(player, row.id);
      say(`${row.name}を買った。もちもので装備できる`);
      return;
    }
    if (row.type === "shield") {
      if (player.ownedShields.includes(row.id)) {
        say(`${row.name}は既に持っている`);
        return;
      }
      if (player.gold < row.cost) {
        say(`${row.name}は${row.cost}G`);
        return;
      }
      player.gold -= row.cost;
      addOwnedShield(player, row.id);
      say(`${row.name}を買った。もちもので装備できる`);
      return;
    }
    if (row.type === "accessory") {
      if (player.ownedAccessories.includes(row.id)) {
        say(`${row.name}は既に持っている`);
        return;
      }
      if (player.gold < row.cost) {
        say(`${row.name}は${row.cost}G`);
        return;
      }
      player.gold -= row.cost;
      grantAccessory(context, row.id, `${row.name}を買った。もちもので装備できる`);
      refreshDerivedStats();
    }
  }

  function inventoryRows(context) {
    const { state, player, playerAttack, playerDefense, dashCost, regenRate } = requireUiStatusContext(context);
    normalizeInventory(player);
    const baseAttack = Number.isFinite(player.strength) ? player.strength : 7 + player.level * 2;
    const baseDefense = Number.isFinite(player.resilience) ? player.resilience : 1 + player.level;
    const attackWithoutCombo = baseAttack + (weaponAttack[player.weapon] || 0);
    const defenseWithoutGuard = baseDefense + (armorDefense[player.armor] || 0);
    const diffText = (value) => value === 0 ? "+0" : value > 0 ? `+${value}` : String(value);
    const tab = inventoryTabs().includes(state.inventoryTab) ? state.inventoryTab : "items";
    if (tab === "items") {
      return itemOrder.map((id) => ({
        type: "item",
        id,
        name: itemNames[id] || id,
        count: player[itemField(id)] || 0,
        detail: `${itemDetails[id] || ""} x${player[itemField(id)] || 0}`,
        sell: itemSellValues[id] || 0,
      }));
    }
    if (tab === "weapons") {
      return player.ownedWeapons.map((rank) => ({
        type: "weapon",
        id: rank,
        name: weaponNames[rank],
        detail: `${weaponAttackProfiles[rank]?.style || weaponTraits[rank]} / ${weaponTraits[rank]} ATK ${baseAttack + (weaponAttack[rank] || 0)} (${diffText(baseAttack + (weaponAttack[rank] || 0) - attackWithoutCombo)})`,
        equipped: player.weapon === rank,
        sell: weaponSellValues[rank],
        currentValue: playerAttack(),
      }));
    }
    if (tab === "armors") {
      return player.ownedArmors.map((rank) => ({
        type: "armor",
        id: rank,
        name: armorNames[rank],
        detail: `${armorTraits[rank]} DEF ${baseDefense + (armorDefense[rank] || 0)} (${diffText(baseDefense + (armorDefense[rank] || 0) - defenseWithoutGuard)})`,
        equipped: player.armor === rank,
        sell: armorSellValues[rank],
        currentValue: playerDefense(),
      }));
    }
    if (tab === "shields") {
      return player.ownedShields.map((rank) => ({
        type: "shield",
        id: rank,
        name: shieldNames[rank],
        detail: `${shieldTraits[rank]} 正面${Math.round((1 - (shieldGuard[rank] || 1)) * 100)}%軽減${player.shield === rank && player.shieldRune ? ` 刻印:${shieldRuneData[player.shieldRune]?.name || "なし"}` : ""}`,
        equipped: player.shield === rank,
        sell: shieldSellValues[rank],
      }));
    }
    const equippedIds = equippedAccessoryIds(player);
    return player.ownedAccessories.map((id) => ({
      type: "accessory",
      id,
      name: accessoryData[id]?.name || id,
      detail: `${accessoryData[id]?.trait || ""} ${equippedIds.includes(id) ? `装備中 ${equippedIds.indexOf(id) + 1}/2` : "未装備"}`,
      equipped: equippedIds.includes(id),
      sell: 0,
      currentValue: id === "regen" || id === "greaterRegen" ? `回復${regenRate().toFixed(1)}` : id === "trail" ? `ダッシュ${dashCost()}ST` : id === "mist" ? "罠/召喚耐性" : id === "deepLamp" ? "鈍足軽減/薬草+" : id === "frost" ? "凍結/氷弾耐性" : id === "eclipse" ? "月蝕耐性" : id === "void" ? "黒陽耐性" : id === "obsidian" ? "黒陽/接触耐性" : id === "horizon" ? "光弾耐性" : id === "prismLens" ? "反射光耐性" : id === "duelist" ? "攻撃テンポ/連撃ST" : "",
    }));
  }

  function openInventory(context) {
    const { state, player, say } = requireUiContext(context);
    normalizeInventory(player);
    state.inventoryOpen = true;
    state.worldMapOpen = false;
    state.infoPanel = null;
    if (!inventoryTabs().includes(state.inventoryTab)) state.inventoryTab = "items";
    clampInventoryIndex(state, inventoryRows(context));
    state.keys?.clear?.();
    state.virtualKeys?.clear?.();
    state.pointerMove = null;
    say("もちものを開いた", 900);
  }

  function closeInventory(context) {
    const { state, say } = requireUiContext(context);
    if (!state.inventoryOpen) return;
    state.inventoryOpen = false;
    say("もちものを閉じた", 700);
  }

  function toggleInventory(context) {
    const { state } = requireUiContext(context);
    if (state.inventoryOpen) closeInventory(context);
    else openInventory(context);
  }

  function openWorldMap(context) {
    const { state, say } = requireUiContext(context);
    state.worldMapOpen = true;
    state.inventoryOpen = false;
    state.shopOpen = false;
    state.infoPanel = null;
    state.keys?.clear?.();
    state.virtualKeys?.clear?.();
    state.pointerMove = null;
    say("全体地図を開いた", 700);
  }

  function closeWorldMap(context) {
    const { state } = requireUiContext(context);
    state.worldMapOpen = false;
  }

  function toggleWorldMap(context) {
    const { state } = requireUiContext(context);
    if (state.worldMapOpen) closeWorldMap(context);
    else openWorldMap(context);
  }

  function moveInventory(context, dx, dy) {
    const { state } = requireUiContext(context);
    if (!state.inventoryOpen) return;
    const tabs = inventoryTabs();
    if (dx !== 0) {
      const index = tabs.indexOf(state.inventoryTab);
      state.inventoryTab = tabs[(index + dx + tabs.length) % tabs.length];
      state.inventoryIndex = 0;
    }
    const rows = inventoryRows(context);
    state.inventoryIndex += dy;
    clampInventoryIndex(state, rows);
  }

  function selectedInventoryRow(context) {
    const { state } = requireUiContext(context);
    const rows = inventoryRows(context);
    clampInventoryIndex(state, rows);
    return rows[state.inventoryIndex] || null;
  }

  function confirmInventory(context) {
    const { player, say, refreshDerivedStats, useSelectedItem } = requireUiStatusContext(context);
    const row = selectedInventoryRow(context);
    if (!row) return;
    normalizeInventory(player);
    if (row.type === "shield") {
      player.shield = row.id;
      say(`${row.name}を構えた`);
      return;
    }
    if (row.type === "item") {
      const slot = Number.isFinite(player.activeQuickSlot) ? player.activeQuickSlot : 0;
      setQuickItem(player, row.id, slot);
      say(`${row.name}を短縮${slot + 1}に登録した`);
      return;
    }
    if (row.type === "weapon") {
      player.weapon = row.id;
      say(`${row.name}を装備した`);
      return;
    }
    if (row.type === "armor") {
      player.armor = row.id;
      say(`${row.name}を装備した`);
      return;
    }
    if (row.type === "accessory") {
      const before = equippedAccessoryIds(player);
      const result = equipAccessory(player, row.id);
      refreshDerivedStats();
      player.stamina = Math.min(player.stamina, player.staminaMax);
      if (result.unequipped) {
        say(`${row.name}を外した`);
      } else if (result.replaced) {
        say(`${row.name}を装備した。${accessoryData[result.replaced]?.name || result.replaced}を外した`);
      } else if (result.changed && before.length < 2) {
        say(`${row.name}を装備した (${result.equipped.length}/2)`);
      } else {
        say(`${row.name}を装備した`);
      }
    }
  }

  function assignInventoryQuickSlot(context, slot) {
    const { state, player, say } = requireUiStatusContext(context);
    if (!state.inventoryOpen || state.inventoryTab !== "items") return;
    const row = selectedInventoryRow(context);
    if (!row || row.type !== "item") return;
    setQuickItem(player, row.id, slot);
    say(`${row.name}を短縮${Number(slot) + 1}に登録した`);
  }

  function sellInventorySelection(context) {
    const { state, player, say, refreshDerivedStats } = requireUiStatusContext(context);
    const row = selectedInventoryRow(context);
    if (!row) return;
    normalizeInventory(player);
    if (row.sell <= 0) {
      say("これは売れない");
      return;
    }
    if (row.type === "item") {
      const field = itemField(row.id);
      if (player[field] <= 0) {
        say("売る分がない");
        return;
      }
      player[field] -= 1;
      player.gold += row.sell;
      say(`${row.name}を${row.sell}Gで売った`);
    } else if (row.type === "weapon") {
      if (player.weapon === row.id || row.id === 0 || player.ownedWeapons.length <= 1) {
        say("装備中または最後の武器は売れない");
        return;
      }
      player.ownedWeapons = player.ownedWeapons.filter((rank) => rank !== row.id);
      player.gold += row.sell;
      say(`${row.name}を${row.sell}Gで売った`);
    } else if (row.type === "armor") {
      if (player.armor === row.id || row.id === 0 || player.ownedArmors.length <= 1) {
        say("装備中または最後の防具は売れない");
        return;
      }
      player.ownedArmors = player.ownedArmors.filter((rank) => rank !== row.id);
      player.gold += row.sell;
      say(`${row.name}を${row.sell}Gで売った`);
    } else if (row.type === "shield") {
      if (player.shield === row.id || row.id === 0 || player.ownedShields.length <= 1) {
        say("装備中または最後の盾は売れない");
        return;
      }
      player.ownedShields = player.ownedShields.filter((rank) => rank !== row.id);
      player.gold += row.sell;
      say(`${row.name}を${row.sell}Gで売った`);
    } else if (row.type === "accessory") {
      refreshDerivedStats();
      say("一品物のアクセサリーは売れない");
    }
    clampInventoryIndex(state, inventoryRows(context));
  }

  function travelMemoLines(context) {
    const { state, player } = requireUiStatusContext(context);
    if (!state.elderReported) {
      if (!state.arrivedSafeBases?.has("grassland-camp")) {
        return [
          "本線: 村東門 -> 草原野営地",
          "今: 焚火と青い回復陣まで進み、危なければ村へ戻る",
          "準備: 到達後は補給と村への馬車が使える",
        ];
      }
      return [
        state.bossDefeated ? "本線: 村へ戻って長老に報告" : "本線: 北森の紋章 -> 北東岩山の竜洞",
        state.spawnedBoss ? "今: 赤竜の正面を避けて接触" : `今: 鱗${player.scales}/${BOSS_REQUIREMENTS.scales} LV${player.level}/${BOSS_REQUIREMENTS.level}`,
        "準備: 焦げた道標を追い、薬と防具を整える",
      ];
    }
    if (!state.ashKnightDefeated) {
      return [
        `灰道の宿場から南の古塔へ LV${player.level}/14`,
        "盾兵は正面を避けて側面へ",
        "星装備と盾があると楽",
      ];
    }
    if (!state.chapter2Reported) {
      if (!state.chests.has("moon-ruin-cache")) {
        return [
          "本線: 古塔南 -> 月影廃墟の遺物",
          "召喚士は放置せず先に倒す",
          "地雷花は近づく前に斬る",
        ];
      }
      if (!state.chests.has("moon-cavern-reliquary")) {
        return [
          "本線: 月影廃墟西門 -> 月影洞窟 -> 月見砦",
          state.moonGatekeeperDefeated ? "今: 護将の先で月洞印を得て東出口へ" : `今: 中継補給と出口補給を拾い、月門の護将LV${MOON_CAVERN_GATEKEEPER_REQUIREMENTS.level}を側背面から倒す`,
          "準備: 帰還鈴・護符・星盾を残して消耗路へ",
          state.discoveries.has("moon-cavern-way-shrine") ? "任意: 中央の月泉は使用済み" : "任意: 中央の月泉は一度だけ全快できる",
        ];
      }
      if (!state.archiveWardenDefeated) {
        return [
          "本線: 月見砦東 -> 月の書庫",
          `今: 書庫番LV${MOON_ARCHIVE_WARDEN_REQUIREMENTS.level}に備える`,
          "準備: 月洞印と星盾で正面被害を抑える",
        ];
      }
      return [
        "本線: 月蝕城の封印碑と月蝕竜",
        `今: LV${player.level}/${CHAPTER2_REQUIREMENTS.level}で砦から南西へ`,
        "準備: 書庫遺物と護符を確認",
      ];
    }
    if (!state.chapter3Reported && !state.chests.has("black-fort-armory")) {
      return [
        "本線: 黒市東門 -> 黒門前哨 -> 黒門砦",
        "今: 北の盾兵本道 / 南の罠近道を選んで砦へ",
        "準備: 北は側面攻撃、南は護符とダッシュ",
        "任意: 黒市地下墓所 / 密輸道 / 再生洞窟",
      ];
    }
    if (!state.chapter3Reported && !state.discoveries.has("void-seal")) {
      return [
        "本線: 黒門砦南西の黒陽碑",
        "今: 砦を拠点に黒陽城の封印を読む",
        "準備: 黒陽装備と帰還鈴を確認",
      ];
    }
    if (state.regenSentinelDefeated && !state.mistKeeperDefeated) {
      return [
        "黒市北東の霧灯の祠へ",
        "霧槍兵は突進前に横へ抜ける",
        "護符は罠と召喚の圧を軽くする",
      ];
    }
    if (!state.cryptWardenDefeated) {
      return [
        `黒市東端の地下入口へ LV${player.level}/22`,
        "吸命鬼は接触で回復しスタミナを奪う",
        "墓守の先に深層灯の護符",
      ];
    }
    if (!state.obsidianGolemDefeated) {
      return [
        "本線: 黒市東の黒曜洞窟",
        "今: 帰還鈴を残して巨人の深部へ進む",
        `黒曜巨人はLV${player.level}/24目安`,
      ];
    }
    if (!state.chapter3Reported) {
      return [
        "本線: 黒門砦 -> 黒陽城 -> 黒陽竜",
        "準備: 黒市で最終装備を選ぶ",
        "任意: 地下墓所・密輸道・霧灯の祠で遠征補助",
      ];
    }
    if (!state.frostGolemDefeated) {
      return [
        state.arrivedSafeBases?.has("frost-haven") ? "本線: 白銀宿 -> 東の氷窟 -> 霜心の護符" : "本線: 黒門砦南門 -> 霜原 -> 白銀宿",
        state.arrivedSafeBases?.has("frost-haven") ? `今: 氷窟巨人へ LV${player.level}/30` : "今: 宿の灯を目印に前進補給から最後の吹雪へ",
        state.towerWardenDefeated ? "任意: 霜見塔の昇降機は開通済み" : "任意: 霜見塔はLV32の移動報酬",
      ];
    }
    if (!state.frostDragonDefeated) {
      return [
        "本線: 氷窟 -> 霜冠城封印碑 -> 霜冠竜",
        `今: 封印碑とLV${player.level}/34`,
        "霜心の護符は氷弾と凍結を軽減",
        state.towerWardenDefeated ? "任意報酬: 天駆けの徽章で氷弾回避" : "任意: 霜見塔の塔守はLV32の寄り道",
      ];
    }
    if (!state.chapter4Reported) {
      return [
        "霜冠竜撃破を長老へ報告",
        "白銀宿の馬車で村へ戻れる",
        "第4章の遠征記録を完成させる",
      ];
    }
    if (!state.solarWardenDefeated) {
      return [
        "本線: 黎明港 -> 北東高原 -> 日輪砲台守",
        `今: 焼けた街道と光の砲声を追う LV${player.level}/${SOLAR_WARDEN_REQUIREMENTS.level}`,
        "準備: 帰還鈴・護符・霊薬を残して高原へ",
      ];
    }
    if (!state.sunspireKeeperDefeated) {
      return [
        "本線: 陽冠都市東門 -> 日鏡塔",
        `今: 守主LV${SUNSPIRE_KEEPER_REQUIREMENTS.level} 光砲対策を確認`,
        !state.suncrestChampionDefeated && player.level >= SUNCREST_CHAMPION_REQUIREMENTS.level ? `任意: 西広場の闘技場LV${SUNCREST_CHAMPION_REQUIREMENTS.level}` : "準備: 大武装商会/遠征薬舗で補給",
      ];
    }
    if (!state.chests.has("sunspire-reliquary")) {
      return [
        "本線: 日鏡塔奥の遺物庫",
        "今: 反射水晶を受け取る",
        "準備: 受け取ったら南街道の封印碑へ",
      ];
    }
    if (!state.discoveries.has("sunrise-seal")) {
      return [
        "本線: 陽冠都市南街道 -> 陽光封印碑",
        "今: 南へ下り、碑を読んで聖域を開く",
        "準備: 光弾耐性と帰還鈴を確認",
      ];
    }
    if (!state.chests.has("ember-sanctum-cache")) {
      return [
        "本線: 熾火聖域の補給箱",
        "今: 天竜戦前の物資を確保",
        "任意: 闘技場の連撃装飾で火力を補う",
      ];
    }
    if (!state.emberDragonDefeated) {
      return [
        "本線: 熾火群島 -> 熾火天竜",
        `今: LV${player.level}/${CHAPTER5_REQUIREMENTS.level}で最奥へ`,
        "準備: 反射水晶・陽冠装備・霊薬を確認",
      ];
    }
    if (!state.chapter5Reported) {
      return [
        "本線: 村へ戻って長老に報告",
        "今: 熾火天竜討伐を伝える",
        "陽冠都市の馬車で長距離帰還できる",
      ];
    }
    return [
      "未開封宝箱と噂を探す",
      `宝箱 ${state.chests.size}/${TREASURE_CHESTS.length}`,
      `発見 ${state.discoveries.size}/${DISCOVERY_POINTS.length}`,
    ];
  }

  function statsPanelPages(context) {
    const {
      state,
      player,
      playerAttack,
      playerDefense,
      dashCost,
      regenRate,
    } = requireUiStatusContext(context);
    const baseAttack = Number.isFinite(player.strength) ? player.strength : 7 + player.level * 2;
    const baseDefense = Number.isFinite(player.resilience) ? player.resilience : 1 + player.level;
    const weaponBonus = weaponAttack[player.weapon] || 0;
    const armorBonus = armorDefense[player.armor] || 0;
    const shieldCut = Math.round((1 - (shieldGuard[player.shield] || 1)) * 100);
    const shieldRuneName = player.shieldRune ? shieldRuneData[player.shieldRune]?.name || "不明" : "なし";
    const equippedAccessories = equippedAccessoryIds(player)
      .map((id) => accessoryData[id]?.name || id)
      .join(" / ") || "なし";

    return [
      {
        title: "装備",
        lines: [
          `${weaponNames[player.weapon]} ${weaponAttackProfiles[player.weapon]?.style || weaponTraits[player.weapon]} ATK ${baseAttack}+${weaponBonus}=${baseAttack + weaponBonus}`,
          `${armorNames[player.armor]} ${armorTraits[player.armor]} DEF ${baseDefense}+${armorBonus}=${baseDefense + armorBonus}`,
          `戦闘中: ATK ${playerAttack()} / DEF ${playerDefense()}`,
          `盾 ${shieldNames[player.shield]} 正面${shieldCut}%軽減 刻印:${shieldRuneName}`,
          `装飾 ${equippedAccessories}`,
          nextUpgradeText(context),
        ],
      },
      {
        title: "探索力",
        lines: [
          `HP ${Math.ceil(player.hp)}/${player.hpMax} ST ${Math.floor(player.stamina)}/${player.staminaMax}`,
          `回避 ${dashCost()}ST 再生 ${regenRate().toFixed(1)}/秒`,
          `状態 ${player.burn > 0 ? "燃焼" : player.slow > 0 ? "鈍足" : player.mineCharm ? "泡護符" : player.aegisCharm ? "護石" : player.trailCharm ? "旅鈴" : "通常"}`,
        ],
      },
      {
        title: "所持品",
        lines: [
          `薬${player.potions} 爆${player.bombs} 護${player.wards}`,
          `鱗 ${player.scales}/3 紋 ${player.sealCrest ? "有" : "無"}`,
          `宝箱 ${state.chests.size}/${TREASURE_CHESTS.length} 鈴${player.trailCharm ? "有" : "無"} 石${player.aegisCharm ? "有" : "無"} 泡${player.mineCharm ? "有" : "無"}`,
        ],
      },
      {
        title: "旅メモ",
        lines: travelMemoLines(context),
      },
    ];
  }

  function nextUpgradeText(context) {
    const { player } = requireUiContext(context);
    const target = player.armor <= player.weapon ? "鎧" : "剣";
    const rank = target === "鎧" ? player.armor + 1 : player.weapon + 1;
    const names = target === "鎧" ? armorNames : weaponNames;
    const costs = target === "鎧" ? armorCosts : weaponCosts;
    if (rank >= names.length) return "鍛冶 強化完了";
    return `次 ${target}:${names[rank]} ${costs[rank]}G`;
  }

  function updateZone(context) {
    const { ui, player, inTown, tileAt, distanceFromVillage } = requireUiZoneContext(context);
    const tx = Math.floor((player.x + player.w / 2) / TILE);
    const ty = Math.floor((player.y + player.h / 2) / TILE);
    let name = "草原";
    if (inTown(player.x, player.y)) name = (tx >= 203 && tx <= 225 && ty >= 65 && ty <= 77) ? "黎明港" : (tx >= 225 && tx <= 252 && ty >= 121 && ty <= 134) ? "陽冠都市" : (tx >= 137 && tx <= 160 && ty >= 79 && ty <= 94) ? "蒼風港" : (tx >= 160 && tx <= 176 && ty >= 165 && ty <= 173) ? "南風岬砦" : (tx >= 12 && tx <= 34 && ty >= 150 && ty <= 156) ? "白銀宿" : (tx >= 15 && tx <= 49 && ty >= 128 && ty <= 142) ? "黒市都" : (tx >= 88 && tx <= 106 && ty >= 129 && ty <= 134) ? "黒門砦" : (tx >= 94 && tx <= 110 && ty >= 113 && ty <= 118) ? "月見砦" : (tx >= 94 && tx <= 110 && ty >= 52 && ty <= 60) ? "灰道の宿場" : (tx >= 24 && tx <= 36 && ty >= 55 && ty <= 62) ? "前線キャンプ" : "村";
    else if (tx >= 190 && ty >= 185) name = "熾火群島";
    else if (tx >= 122 && tx <= 156 && ty >= 24 && ty <= 45) name = "月影洞窟";
    else if (tx >= 122 && tx <= 156 && ty >= 1 && ty <= 22) name = "月の書庫";
    else if (tx >= 198 && ty < 90) name = "黎明海岸";
    else if (tx >= 190) name = "日出高原";
    else if (tx >= 132 && ty < 80) name = "蒼風島北岸";
    else if (tx >= 132 && ty < 154) name = "蒼風島高原";
    else if (tx >= 132) name = "蒼風島南岸";
    else if (ty >= 160) name = "南岬群島";
    else if (tx >= 104 && tx <= 118 && ty >= 18 && ty <= 32) name = "霜見塔二階";
    else if (tx >= 88 && tx <= 102 && ty >= 18 && ty <= 32) name = "霜見塔一階";
    else if (ty >= 144 && tx >= 90) name = "霜冠城";
    else if (ty >= 150 && tx >= 48 && tx <= 70) name = "氷窟";
    else if (ty >= 144) name = "霜原";
    else if (tx >= 62 && tx <= 84 && ty >= 116 && ty <= 126) name = "霧灯の祠";
    else if (tx >= 24 && tx <= 58 && ty >= 120 && ty <= 127) name = "再生洞窟";
    else if (tx >= 18 && tx <= 23 && ty >= 95 && ty <= 128) name = "密輸道";
    else if (ty >= 128 && tx <= 58) name = "黒曜洞";
    else if (ty >= 128) name = "黒陽城";
    else if (ty >= 112) name = "月蝕城";
    else if (ty >= 96) name = "月影廃墟";
    else if (tx >= 24 && tx < 80 && ty >= 72) name = "天脊高原";
    else if ((tx >= 90 && tx <= 115 && ty >= 84) || (tx >= 105 && tx <= 116 && ty >= 36 && ty <= 47)) name = "古塔";
    else if (tx >= 80 || ty >= 72) name = "灰の街道";
    else if (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 18) name = "竜洞";
    else if (tx >= 20 && tx <= 43 && ty >= 60) name = "廃坑";
    else if (tileAt(tx, ty) === TILE_WATER) name = "水辺";
    else if (tx > 40) name = "東の森";
    else if (ty < 25) name = "北森";
    else if (distanceFromVillage() > 330) name = "荒野";
    ui.zone.textContent = name;
  }

  function updateUi(context) {
    const { ui, player } = requireUiContext(context);
    ui.gold.textContent = `${player.gold}G`;
    ui.level.textContent = String(player.level);
    ui.hp.textContent = `${Math.ceil(player.hp)}/${player.hpMax}`;
    ui.exp.textContent = `${player.xp}/${player.xpNext}`;
    ui.weapon.textContent = `${weaponNames[player.weapon] || "竜"} +${weaponAttack[player.weapon] || 0}`;
    ui.armor.textContent = `${armorNames[player.armor] || "竜"} +${armorDefense[player.armor] || 0}`;
    ui.combo.textContent = player.combo > 0 ? `${player.combo}` : "0";
    ui.scale.textContent = player.sealCrest ? `${player.scales}/3 紋` : `${player.scales}/3`;
    const shortNames = { potion: "薬", tonic: "活", bomb: "爆", ward: "護", elixir: "霊", warp: "帰" };
    for (const button of ui.items) {
      const slot = Number(button.dataset.quickSlot || 0);
      const item = player.quickItems?.[slot] || ["potion", "bomb", "ward"][slot];
      const name = button.querySelector?.(".quick-name");
      const count = button.querySelector?.(".quick-count");
      if (name) name.textContent = shortNames[item] || "?";
      if (count) count.textContent = String(player[itemField(item)] || 0);
      button.classList.toggle("is-selected", slot === player.activeQuickSlot);
      button.setAttribute?.("aria-label", `短縮${slot + 1}: ${itemNames[item] || item}`);
    }
    updateZone(context);
  }

  globalThis.DRAGON_HUNTER_UI = {
    showStats,
    inventoryTabs,
    inventoryTabLabel,
    inventoryRows,
    openInventory,
    closeInventory,
    toggleInventory,
    openWorldMap,
    closeWorldMap,
    toggleWorldMap,
    moveInventory,
    confirmInventory,
    assignInventoryQuickSlot,
    sellInventorySelection,
    openShop,
    closeShop,
    moveShop,
    confirmShop,
    statsPanelPages,
    nextUpgradeText,
    updateZone,
    updateUi,
  };
})();
