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
  } = definitions;

  function requireUiContext(context) {
    if (!context?.ui || !context?.state || !context?.player || !context?.say) {
      throw new Error("ui helpers require { ui, state, player, say }");
    }
    return context;
  }

  function requireUiStatusContext(context) {
    const base = requireUiContext(context);
    if (!base.playerAttack || !base.playerDefense || !base.dashCost || !base.regenRate) {
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
    const { state, say } = requireUiContext(context);
    const page = statsPanelPages(context)[state.statsPage];
    state.infoPanel = { ...page, until: performance.now() + 4200 };
    say(`${page.title}を確認`, 1200);
    state.statsPage = (state.statsPage + 1) % 3;
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
          `状態 ${player.burn > 0 ? "燃焼" : player.slow > 0 ? "鈍足" : player.aegisCharm ? "護石" : player.trailCharm ? "旅鈴" : "通常"}`,
        ],
      },
      {
        title: "所持品",
        lines: [
          `薬${player.potions} 爆${player.bombs} 護${player.wards}`,
          `鱗 ${player.scales}/3 紋 ${player.sealCrest ? "有" : "無"}`,
          `宝箱 ${state.chests.size}/${TREASURE_CHESTS.length} 鈴${player.trailCharm ? "有" : "無"} 石${player.aegisCharm ? "有" : "無"}`,
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
    if (inTown(player.x, player.y)) name = "村";
    else if (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 18) name = "竜洞";
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
    statsPanelPages,
    nextUpgradeText,
    updateZone,
    updateUi,
  };
})();
