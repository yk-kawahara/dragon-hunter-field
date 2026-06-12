"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before ui helpers");
  }

  const {
    TILE,
    TREASURE_CHESTS,
    TILE_WATER,
    weaponNames,
    armorNames,
    weaponTraits,
    armorTraits,
    weaponCosts,
    armorCosts,
    weaponAttack = [0, 5, 10, 15, 20],
    armorDefense,
    weaponSellValues,
    armorSellValues,
    itemNames,
    itemSellValues,
    accessoryOrder,
    accessoryData,
  } = definitions;

  const rewardHelpers = globalThis.DRAGON_HUNTER_REWARDS;
  if (!rewardHelpers) {
    throw new Error("DRAGON_HUNTER_REWARDS must be loaded before ui helpers");
  }

  const { normalizeInventory } = rewardHelpers;

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
    return ["items", "weapons", "armors", "accessories"];
  }

  function inventoryTabLabel(tab) {
    return {
      items: "道具",
      weapons: "武器",
      armors: "防具",
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

  function inventoryRows(context) {
    const { state, player, playerAttack, playerDefense, dashCost, regenRate } = requireUiStatusContext(context);
    normalizeInventory(player);
    const tab = inventoryTabs().includes(state.inventoryTab) ? state.inventoryTab : "items";
    if (tab === "items") {
      return [
        { type: "item", id: "potion", name: itemNames.potion, count: player.potions, detail: "HP回復", sell: itemSellValues.potion },
        { type: "item", id: "bomb", name: itemNames.bomb, count: player.bombs, detail: "周囲攻撃", sell: itemSellValues.bomb },
        { type: "item", id: "ward", name: itemNames.ward, count: player.wards, detail: "一定時間防御", sell: itemSellValues.ward },
      ];
    }
    if (tab === "weapons") {
      return player.ownedWeapons.map((rank) => ({
        type: "weapon",
        id: rank,
        name: weaponNames[rank],
        detail: `${weaponTraits[rank]} 攻${(Number.isFinite(player.strength) ? player.strength : 7 + player.level * 2) + (weaponAttack[rank] || 0)}`,
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
        detail: `${armorTraits[rank]} 防${(Number.isFinite(player.resilience) ? player.resilience : 1 + player.level) + (armorDefense[rank] || 0)}`,
        equipped: player.armor === rank,
        sell: armorSellValues[rank],
        currentValue: playerDefense(),
      }));
    }
    return player.ownedAccessories.map((id) => ({
      type: "accessory",
      id,
      name: accessoryData[id]?.name || id,
      detail: accessoryData[id]?.trait || "",
      equipped: player.equippedAccessory === id,
      sell: 0,
      currentValue: id === "regen" ? `回復${regenRate().toFixed(1)}` : id === "trail" ? `ダッシュ${dashCost()}ST` : "",
    }));
  }

  function openInventory(context) {
    const { state, player, say } = requireUiContext(context);
    normalizeInventory(player);
    state.inventoryOpen = true;
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
    if (row.type === "item") {
      player.selectedItem = row.id;
      useSelectedItem?.();
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
      player.equippedAccessory = row.id;
      refreshDerivedStats();
      player.stamina = Math.min(player.stamina, player.staminaMax);
      say(`${row.name}を装備した`);
    }
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
      const field = row.id === "potion" ? "potions" : row.id === "bomb" ? "bombs" : "wards";
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
    } else if (row.type === "accessory") {
      refreshDerivedStats();
      say("一品物のアクセサリーは売れない");
    }
    clampInventoryIndex(state, inventoryRows(context));
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

    return [
      {
        title: "装備",
        lines: [
          `${weaponNames[player.weapon]} ${weaponTraits[player.weapon]} 攻${playerAttack()}`,
          `${armorNames[player.armor]} ${armorTraits[player.armor]} 防${playerDefense()}`,
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
    if (inTown(player.x, player.y)) name = (tx >= 24 && tx <= 36 && ty >= 55 && ty <= 62) ? "前線キャンプ" : "村";
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
    ui.weapon.textContent = `${weaponNames[player.weapon] || "竜"} ${weaponTraits[player.weapon] || ""}`;
    ui.armor.textContent = `${armorNames[player.armor] || "竜"} ${armorTraits[player.armor] || ""}`;
    ui.potion.textContent = String(player.potions);
    ui.bomb.textContent = String(player.bombs);
    ui.ward.textContent = String(player.wards);
    ui.combo.textContent = player.combo > 0 ? `${player.combo}` : "0";
    ui.scale.textContent = player.sealCrest ? `${player.scales}/3 紋` : `${player.scales}/3`;
    for (const button of ui.items) {
      button.classList.toggle("is-selected", button.dataset.item === player.selectedItem);
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
    moveInventory,
    confirmInventory,
    sellInventorySelection,
    statsPanelPages,
    nextUpgradeText,
    updateZone,
    updateUi,
  };
})();
