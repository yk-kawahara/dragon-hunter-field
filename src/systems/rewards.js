"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before rewards helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before rewards helpers");
  }

  const {
    TILE_FIELD,
    TRAVEL_POINTS,
    WORLD_SCALE,
    weaponNames,
    armorNames,
    weaponAttack = [0, 5, 10, 15, 20],
    armorDefense,
    weaponSellValues,
    armorSellValues,
    shieldNames,
    shieldGuard,
    shieldSellValues,
    itemOrder,
    itemNames,
    accessoryOrder,
    accessoryData,
  } = definitions;

  const {
    clamp,
    centerOf,
  } = mathHelpers;

  const worldPx = (value) => value * WORLD_SCALE;
  const itemFields = {
    potion: "potions",
    tonic: "tonics",
    bomb: "bombs",
    ward: "wards",
    elixir: "elixirs",
    warp: "warps",
  };

  function itemField(id) {
    return itemFields[id] || "potions";
  }

  function addItem(player, id, amount = 1) {
    const field = itemField(id);
    player[field] = Math.min(9, Math.max(0, player[field] || 0) + amount);
    return player[field];
  }

  function travelPointUnlocked(point, state, player) {
    if (!point || point.unlock === "always") return true;
    if (point.unlock === "trail") return Boolean(player.trailCharm || state.wardenDefeated || state.elderReported);
    if (point.unlock === "elderReported") return Boolean(state.elderReported || state.chapter2Reported || state.chapter3Reported);
    if (point.unlock === "ashKnightDefeated") return Boolean(state.ashKnightDefeated || state.chapter2Reported || state.chapter3Reported);
    if (point.unlock === "chapter2Reported") return Boolean(state.chapter2Reported || state.chapter3Reported);
    if (point.unlock === "blackMarket") return Boolean(state.chapter2Reported && (state.chests?.has?.("black-fort-armory") || state.obsidianGolemDefeated || state.chapter3Reported));
    return false;
  }

  function availableTravelPoints(state, player) {
    return (TRAVEL_POINTS || []).filter((point) => travelPointUnlocked(point, state, player));
  }

  function rewardIds(list) {
    return new Set(list.map((entry) => entry.id));
  }

  function savedIdSet(ids, validIds) {
    return new Set((Array.isArray(ids) ? ids : []).filter((id) => validIds.has(id)));
  }

  function requireRewardContext(context) {
    if (!context?.player || !context?.say) {
      throw new Error("reward helpers require { player, say }");
    }
    return context;
  }

  function normalizedRank(value, max) {
    const rank = Number(value);
    if (!Number.isFinite(rank)) return 0;
    return clamp(Math.floor(rank), 0, max - 1);
  }

  function normalizeRankInventory(list, equipped, max) {
    const owned = new Set([0, normalizedRank(equipped, max)]);
    if (Array.isArray(list)) {
      for (const value of list) owned.add(normalizedRank(value, max));
    }
    return Array.from(owned).sort((a, b) => a - b);
  }

  const ACCESSORY_SLOT_COUNT = 2;

  function uniqueAccessoryIds(ids) {
    const unique = [];
    for (const id of Array.isArray(ids) ? ids : []) {
      if (!accessoryOrder.includes(id) || unique.includes(id)) continue;
      unique.push(id);
      if (unique.length >= ACCESSORY_SLOT_COUNT) break;
    }
    return unique;
  }

  function equippedAccessoryIds(player) {
    const equipped = uniqueAccessoryIds(player.equippedAccessories);
    if (equipped.length > 0) return equipped;
    if (accessoryOrder.includes(player.equippedAccessory)) return [player.equippedAccessory];
    return [];
  }

  function setEquippedAccessories(player, ids) {
    const owned = new Set(Array.isArray(player.ownedAccessories) ? player.ownedAccessories : []);
    const equipped = uniqueAccessoryIds(ids).filter((id) => owned.has(id));
    player.equippedAccessories = equipped;
    player.equippedAccessory = equipped[0] || "";
    return equipped;
  }

  function accessoryActive(player, id, legacyFlag) {
    if (Array.isArray(player.equippedAccessories)) return player.equippedAccessories.includes(id);
    const equipped = equippedAccessoryIds(player);
    if (equipped.length > 0) return equipped.includes(id);
    return Boolean(player[legacyFlag]);
  }

  function equipAccessory(player, id) {
    normalizeInventory(player);
    if (!accessoryOrder.includes(id) || !player.ownedAccessories.includes(id)) {
      return { ok: false, equipped: equippedAccessoryIds(player), changed: false, replaced: "" };
    }
    const current = equippedAccessoryIds(player);
    if (current.includes(id)) {
      const next = setEquippedAccessories(player, current.filter((value) => value !== id));
      return { ok: true, equipped: next, changed: true, unequipped: id, replaced: "" };
    }
    const replaced = current.length >= ACCESSORY_SLOT_COUNT ? current[0] : "";
    const next = current.length >= ACCESSORY_SLOT_COUNT ? [...current.slice(1), id] : [...current, id];
    return { ok: true, equipped: setEquippedAccessories(player, next), changed: true, replaced };
  }

  function normalizeAccessoryInventory(player) {
    const owned = new Set();
    if (Array.isArray(player.ownedAccessories)) {
      for (const id of player.ownedAccessories) {
        if (accessoryOrder.includes(id)) owned.add(id);
      }
    }
    for (const id of accessoryOrder) {
      const flag = accessoryData[id]?.flag;
      if (flag && player[flag]) owned.add(id);
    }
    player.ownedAccessories = accessoryOrder.filter((id) => owned.has(id));
    for (const id of accessoryOrder) {
      const flag = accessoryData[id]?.flag;
      if (flag) player[flag] = owned.has(id);
    }
    const desired = equippedAccessoryIds(player).filter((id) => owned.has(id));
    if (desired.length <= 0) {
      desired.push(...["trail", "regen", "greaterRegen", "aegis", "mine", "mist", "deepLamp", "eclipse", "void", "obsidian", "hunter"].filter((id) => owned.has(id)).slice(0, ACCESSORY_SLOT_COUNT));
    }
    setEquippedAccessories(player, desired);
  }

  function normalizeInventory(player) {
    player.weapon = normalizedRank(player.weapon, weaponNames.length);
    player.armor = normalizedRank(player.armor, armorNames.length);
    player.shield = normalizedRank(player.shield, shieldNames.length);
    player.ownedWeapons = normalizeRankInventory(player.ownedWeapons, player.weapon, weaponNames.length);
    player.ownedArmors = normalizeRankInventory(player.ownedArmors, player.armor, armorNames.length);
    player.ownedShields = normalizeRankInventory(player.ownedShields, player.shield, shieldNames.length);
    normalizeAccessoryInventory(player);
    return player;
  }

  function addOwnedWeapon(player, rank) {
    normalizeInventory(player);
    const target = normalizedRank(rank, weaponNames.length);
    if (!player.ownedWeapons.includes(target)) player.ownedWeapons.push(target);
    player.ownedWeapons.sort((a, b) => a - b);
    return target;
  }

  function addOwnedArmor(player, rank) {
    normalizeInventory(player);
    const target = normalizedRank(rank, armorNames.length);
    if (!player.ownedArmors.includes(target)) player.ownedArmors.push(target);
    player.ownedArmors.sort((a, b) => a - b);
    return target;
  }

  function addOwnedShield(player, rank) {
    normalizeInventory(player);
    const target = normalizedRank(rank, shieldNames.length);
    if (!player.ownedShields.includes(target)) player.ownedShields.push(target);
    player.ownedShields.sort((a, b) => a - b);
    return target;
  }

  function grantShieldAtLeast(context, rank, upgradedMessage, keptMessage = "既により良い盾を持っている") {
    const { player, say } = requireRewardContext(context);
    const target = clamp(rank, 0, shieldNames.length - 1);
    const ownedBefore = Array.isArray(player.ownedShields) && player.ownedShields.includes(target);
    addOwnedShield(player, target);
    const currentPower = 1 - (shieldGuard[player.shield] || 1);
    const targetPower = 1 - (shieldGuard[target] || 1);
    if (player.shield === target || currentPower >= targetPower) {
      if (!ownedBefore && player.shield !== target) {
        say(`${shieldNames[target]}を入手した。もちもので装備できる`);
        return true;
      }
      say(keptMessage);
      return false;
    }
    player.shield = target;
    say(upgradedMessage || `${shieldNames[player.shield]}を装備した`);
    return true;
  }

  function grantAccessory(context, id, message) {
    const { player, say, refreshDerivedStats } = requireRewardContext(context);
    if (!accessoryOrder.includes(id)) return false;
    normalizeInventory(player);
    if (player.ownedAccessories.includes(id)) {
      say("既に同じアクセサリーを持っている");
      return false;
    }
    player.ownedAccessories.push(id);
    player[accessoryData[id].flag] = true;
    if (equippedAccessoryIds(player).length < ACCESSORY_SLOT_COUNT) {
      setEquippedAccessories(player, [...equippedAccessoryIds(player), id]);
    }
    refreshDerivedStats?.();
    say(message || `${accessoryData[id].name}を手に入れた`);
    return true;
  }

  function grantWeaponAtLeast(context, rank, upgradedMessage, keptMessage = "既により良い剣を持っている") {
    const { player, say } = requireRewardContext(context);
    const target = clamp(rank, 0, weaponNames.length - 1);
    const ownedBefore = Array.isArray(player.ownedWeapons) && player.ownedWeapons.includes(target);
    addOwnedWeapon(player, target);
    const currentPower = weaponAttack[player.weapon] || 0;
    const targetPower = weaponAttack[target] || 0;
    if (player.weapon === target || currentPower >= targetPower) {
      if (!ownedBefore && player.weapon !== target) {
        say(`${weaponNames[target]}を手に入れた。もちもので装備できる`);
        return true;
      }
      say(keptMessage);
      return false;
    }
    player.weapon = target;
    say(upgradedMessage || `${weaponNames[player.weapon]}を手に入れた`);
    return true;
  }

  function grantArmorAtLeast(context, rank, upgradedMessage, keptMessage = "既により良い鎧を持っている") {
    const { player, say } = requireRewardContext(context);
    const target = clamp(rank, 0, armorNames.length - 1);
    const ownedBefore = Array.isArray(player.ownedArmors) && player.ownedArmors.includes(target);
    addOwnedArmor(player, target);
    const currentPower = armorDefense[player.armor] || 0;
    const targetPower = armorDefense[target] || 0;
    if (player.armor === target || currentPower >= targetPower) {
      if (!ownedBefore && player.armor !== target) {
        say(`${armorNames[target]}を手に入れた。もちもので装備できる`);
        return true;
      }
      say(keptMessage);
      return false;
    }
    player.armor = target;
    say(upgradedMessage || `${armorNames[player.armor]}を手に入れた`);
    return true;
  }

  function grantChestReward(context, reward) {
    const { player, say, refreshDerivedStats } = requireRewardContext(context);
    if (reward === "moonRelic" || reward === "moonSupply" || reward === "summonerSupply" || reward === "trapSupply" || reward === "eclipseGear" || reward === "eclipseSupply" || reward === "voidGear" || reward === "voidSupply" || reward === "obsidianGear" || reward === "obsidianSupply" || reward === "blackMarketSupply" || reward === "smugglerSupply" || reward === "shieldSupply" || reward === "blackShieldSupply" || reward === "greaterRegen" || reward === "mistCharm" || reward === "mistSupply" || reward === "cryptSupply" || reward === "deepLamp") {
      grantMoonChestReward(context, reward);
      return;
    }
    if (reward === "starter") {
      player.gold += 45;
      player.potions = Math.min(9, player.potions + 2);
      say("宝箱から45Gと薬を見つけた");
    } else if (reward === "weapon") {
      player.gold += 30;
      const rank = Math.min(weaponNames.length - 1, player.weapon + 1);
      grantWeaponAtLeast(context, rank, `${weaponNames[rank]}を手に入れた`, "既により良い剣を持っている (+30G)");
    } else if (reward === "armor") {
      player.wards = Math.min(9, player.wards + 1);
      const rank = Math.min(armorNames.length - 1, player.armor + 1);
      grantArmorAtLeast(context, rank, `${armorNames[rank]}を手に入れた`, "既により良い鎧を持っている (+護符)");
    } else if (reward === "ward") {
      player.bombs = Math.min(9, player.bombs + 2);
      player.wards = Math.min(9, player.wards + 2);
      grantAccessory(context, "regen", "再生の指輪を見つけた");
      say("再生の指輪を見つけた");
    } else if (reward === "scale") {
      player.scales = Math.min(3, player.scales + 1);
      say("古い竜の鱗を見つけた");
    } else if (reward === "trail") {
      grantAccessory(context, "trail", "旅人の鈴を見つけた。足取りが軽くなった");
      refreshDerivedStats?.();
      player.stamina = player.staminaMax;
      player.wards = Math.min(9, player.wards + 1);
      say("旅人の鈴を見つけた。遠征の足取りが軽くなった");
    } else if (reward === "mineGear") {
      addOwnedWeapon(player, 5);
      addOwnedArmor(player, 5);
      player.wards = Math.min(9, player.wards + 1);
      say("鉱山装備を見つけた。もちもので泡割り槍と鉱夫服を選べる");
    } else if (reward === "mineGold") {
      player.gold += 500;
      say("廃坑の隠し金庫から500Gを見つけた!");
    } else if (reward === "ashGear") {
      addOwnedWeapon(player, 8);
      addOwnedArmor(player, 8);
      player.wards = Math.min(9, player.wards + 2);
      say("星見の装備を見つけた。魔法に備えてもちもので選べる");
    } else if (reward === "shieldGear") {
      player.gold += 260;
      grantShieldAtLeast(context, 3, "星盾を見つけた。正面から受ける遠征が楽になる");
      addItem(player, "tonic", 1);
      player.wards = Math.min(9, player.wards + 1);
    } else if (reward === "towerSupply") {
      player.gold += 680;
      player.potions = Math.min(9, player.potions + 3);
      player.bombs = Math.min(9, player.bombs + 2);
      player.wards = Math.min(9, player.wards + 2);
      say("古塔の遠征物資を回収した");
    }
  }

  function grantMoonChestReward(context, reward) {
    const { player, say } = requireRewardContext(context);
    if (reward === "moonRelic") {
      player.gold += 980;
      player.wards = Math.min(9, player.wards + 4);
      addOwnedWeapon(player, 8);
      addOwnedArmor(player, 8);
      say("月影廃墟の星遺物を得た。星装備と護符でさらに遠征できる");
      return true;
    }
    if (reward === "moonSupply") {
      player.gold += 520;
      player.potions = Math.min(9, player.potions + 2);
      player.bombs = Math.min(9, player.bombs + 3);
      player.wards = Math.min(9, player.wards + 3);
      say("月影街道の補給箱を回収した");
      return true;
    }
    if (reward === "summonerSupply") {
      player.gold += 620;
      addItem(player, "tonic", 2);
      addItem(player, "warp", 1);
      player.bombs = Math.min(9, player.bombs + 2);
      player.wards = Math.min(9, player.wards + 2);
      say("召喚士対策の補給を得た。活力薬と帰還鈴で遠征を伸ばせる");
      return true;
    }
    if (reward === "trapSupply") {
      player.gold += 540;
      addItem(player, "tonic", 1);
      addItem(player, "ward", 2);
      addItem(player, "warp", 1);
      say("地雷花地帯の迂回補給を得た。護符と帰還鈴で危険な近道を抜けやすくなる");
      return true;
    }
    if (reward === "eclipseGear") {
      player.gold += 760;
      addOwnedWeapon(player, 9);
      addOwnedArmor(player, 9);
      player.wards = Math.min(9, player.wards + 3);
      say("月蝕装備を得た。もちもので月蝕竜への備えを選べる");
      return true;
    }
    if (reward === "eclipseSupply") {
      player.gold += 1180;
      player.potions = Math.min(9, player.potions + 4);
      player.bombs = Math.min(9, player.bombs + 3);
      player.wards = Math.min(9, player.wards + 4);
      grantAccessory(context, "eclipse", "月蝕の指輪を見つけた。装備すると月蝕魔法を軽くする");
      say("月蝕城の秘庫から決戦物資を得た");
      return true;
    }
    if (reward === "voidGear") {
      player.gold += 1260;
      addOwnedWeapon(player, 10);
      addOwnedArmor(player, 10);
      player.wards = Math.min(9, player.wards + 4);
      say("黒陽装備を得た。黒陽領の圧に備えられる");
      return true;
    }
    if (reward === "voidSupply") {
      player.gold += 1880;
      player.potions = Math.min(9, player.potions + 5);
      player.bombs = Math.min(9, player.bombs + 4);
      player.wards = Math.min(9, player.wards + 5);
      grantAccessory(context, "void", "黒陽の護符を見つけた。装備すると黒陽圧を軽くする");
      say("黒陽城の秘庫から最終遠征物資を得た");
      return true;
    }
    if (reward === "obsidianGear") {
      player.gold += 900;
      addItem(player, "elixir", 2);
      addItem(player, "tonic", 2);
      addItem(player, "warp", 1);
      player.wards = Math.min(9, player.wards + 4);
      grantAccessory(context, "obsidian", "黒曜の腕輪を見つけた。正面戦闘に強い");
      say("黒曜洞の腕輪と遠征物資を得た。黒曜装備は黒市で買おう");
      return true;
    }
    if (reward === "obsidianSupply") {
      player.gold += 720;
      addItem(player, "tonic", 2);
      addItem(player, "elixir", 1);
      addItem(player, "warp", 1);
      player.bombs = Math.min(9, player.bombs + 2);
      player.wards = Math.min(9, player.wards + 2);
      say("黒曜路の遠征物資を見つけた");
      return true;
    }
    if (reward === "greaterRegen") {
      player.gold += 1280;
      addItem(player, "elixir", 1);
      addItem(player, "warp", 1);
      player.wards = Math.min(9, player.wards + 3);
      grantAccessory(context, "greaterRegen", "大再生の指輪を見つけた。装備すると遠征中のHP回復が大きく伸びる");
      say("黒市北の再生洞窟で大再生の指輪と遠征物資を得た");
      return true;
    }
    if (reward === "mistCharm") {
      player.gold += 980;
      addItem(player, "tonic", 2);
      addItem(player, "ward", 2);
      addItem(player, "warp", 1);
      grantAccessory(context, "mist", "霧灯の護符を見つけた。装備すると罠・召喚・魔法圧を軽くする");
      say("霧灯の祠で護符と遠征物資を得た");
      return true;
    }
    if (reward === "mistSupply") {
      player.gold += 620;
      addItem(player, "tonic", 1);
      addItem(player, "ward", 2);
      addItem(player, "warp", 1);
      player.bombs = Math.min(9, player.bombs + 2);
      say("霧灯の祠の補給箱から遠征物資を得た");
      return true;
    }
    if (reward === "cryptSupply") {
      player.gold += 780;
      addItem(player, "tonic", 2);
      addItem(player, "elixir", 1);
      addItem(player, "warp", 1);
      player.potions = Math.min(9, player.potions + 3);
      say("地下墓所の補給庫から長期遠征用の物資を得た");
      return true;
    }
    if (reward === "deepLamp") {
      player.gold += 1200;
      addItem(player, "elixir", 1);
      addItem(player, "warp", 1);
      grantAccessory(context, "deepLamp", "深層灯の護符を得た。装備すると鈍足を軽くし、薬草回復が強くなる");
      say("地下墓所の遺物庫から深層灯の護符を得た");
      return true;
    }
    if (reward === "shieldSupply") {
      player.gold += 520;
      grantShieldAtLeast(context, 3, "星盾を手に入れた。盾兵や魔法道を正面から受けやすい");
      addItem(player, "tonic", 2);
      player.wards = Math.min(9, player.wards + 2);
      return true;
    }
    if (reward === "blackShieldSupply") {
      player.gold += 820;
      grantShieldAtLeast(context, 4, "黒陽盾を手に入れた。黒陽城の正面圧に備えられる");
      addItem(player, "elixir", 1);
      addItem(player, "warp", 1);
      return true;
    }
    if (reward === "blackMarketSupply") {
      player.gold += 900;
      player.potions = Math.min(9, player.potions + 4);
      player.bombs = Math.min(9, player.bombs + 3);
      player.wards = Math.min(9, player.wards + 4);
      addItem(player, "tonic", 1);
      addItem(player, "warp", 1);
      say("黒市の隠し倉庫から遠征物資を得た");
      return true;
    }
    if (reward === "smugglerSupply") {
      player.gold += 360;
      addItem(player, "tonic", 1);
      addItem(player, "warp", 1);
      player.bombs = Math.min(9, player.bombs + 2);
      player.wards = Math.min(9, player.wards + 2);
      say("密輸道の隠し荷を見つけた。危険な近道用の物資を得た");
      return true;
    }
    return false;
  }

  function grantMonsterDefeatDrops(context, monster) {
    const { player, say } = requireRewardContext(context);
    if (Math.random() < monster.drop && !monster.boss) {
      player.scales = Math.min(3, player.scales + 1);
      say("竜の鱗を拾った");
    }

    if (!monster.boss && !monster.midboss) {
      const drop = Math.random();
      if (drop < 0.18) {
        player.potions = Math.min(9, player.potions + 1);
        say("薬草を拾った");
      } else if (drop < 0.25) {
        addItem(player, "tonic", 1);
        say("活力薬を拾った");
      } else if (drop < 0.33) {
        player.bombs = Math.min(9, player.bombs + 1);
        say("火瓶を拾った");
      } else if (drop < 0.40) {
        player.wards = Math.min(9, player.wards + 1);
        say("護符を拾った");
      }
    }
  }

  function requireDiscoveryContext(context) {
    const base = requireRewardContext(context);
    if (!base.burst || !base.refreshDerivedStats) {
      throw new Error("discovery reward helpers require { player, say, burst, refreshDerivedStats }");
    }
    return base;
  }

  function grantDiscoveryReward(context, discovery, x, y) {
    const { player, say, burst, refreshDerivedStats } = requireDiscoveryContext(context);
    if (discovery.kind === "waystone") {
      player.gold += 180;
      player.stamina = player.staminaMax;
      player.wards = Math.min(9, player.wards + 1);
      burst(x, y, "#9fb3ff", 20);
      say("古い道標を調べた。月影廃墟への道筋が見えた");
      return;
    }
    if (discovery.kind === "eclipseSeal") {
      player.gold += 360;
      player.stamina = player.staminaMax;
      player.wards = Math.min(9, player.wards + 2);
      burst(x, y, "#e36dff", 22);
      say("月蝕の封印碑を読んだ。月蝕竜への道が開いた");
      return;
    }
    if (discovery.kind === "voidSeal") {
      player.gold += 640;
      player.stamina = player.staminaMax;
      player.wards = Math.min(9, player.wards + 3);
      burst(x, y, "#2f335f", 24);
      say("黒陽の封印碑を読んだ。黒陽竜への道が開いた");
      return;
    }
    if (discovery.kind === "obsidianWaystone") {
      player.gold += 320;
      player.stamina = player.staminaMax;
      addItem(player, "warp", 1);
      addItem(player, "tonic", 1);
      burst(x, y, "#8dd7ff", 24);
      say("黒曜の道標を読んだ。帰還の物資を得た");
      return;
    }
    if (discovery.kind === "summonerHint") {
      player.gold += 160;
      addItem(player, "tonic", 1);
      addItem(player, "ward", 1);
      burst(x, y, "#d678ff", 18);
      say("石碑: 召喚士は放置するな。先に倒すか、帰還鈴を残せ");
      return;
    }
    if (discovery.kind === "trapHint") {
      player.gold += 120;
      addItem(player, "ward", 1);
      burst(x, y, "#ff5e9f", 18);
      say("石碑: 地雷花は近づくと爆ぜる。先に斬るか広く避けろ");
      return;
    }
    if (discovery.kind === "mistHint") {
      player.gold += 200;
      addItem(player, "ward", 1);
      addItem(player, "tonic", 1);
      burst(x, y, "#9fd6c7", 18);
      say("霧灯の碑文: 召喚と罠をしのぎ、守を倒せば護符に届く");
      return;
    }
    if (discovery.kind === "cryptHint") {
      player.gold += 260;
      addItem(player, "tonic", 1);
      addItem(player, "warp", 1);
      burst(x, y, "#d7b26d", 20);
      say("墓碑: 吸命鬼は接触で力を奪う。薬草と帰還鈴を残して墓守へ挑め");
      return;
    }
    if (discovery.kind === "routeHint") {
      player.gold += 120;
      addItem(player, "tonic", 1);
      burst(x, y, "#ffd166", 16);
      say("旅の噂を手帳に書き留めた。危険な近道には盾と帰還鈴が役立つ");
      return;
    }
    if (discovery.kind === "smugglerHint") {
      player.gold += 220;
      addItem(player, "warp", 1);
      addItem(player, "tonic", 1);
      burst(x, y, "#ffd166", 18);
      say("密輸道の札: 西の縦道は黒市へ抜ける近道。ただし盾兵と地雷花が多い");
      return;
    }
    if (discovery.kind === "greaterRegenHint") {
      player.gold += 160;
      addItem(player, "ward", 1);
      player.stamina = player.staminaMax;
      burst(x, y, "#74ff8f", 20);
      say("洞窟のメモ: 黒市北の奥に大再生の指輪。毒花と泡を避け、帰還鈴を残せ");
      return;
    }
    if (discovery.kind === "shortcutHint") {
      player.gold += 180;
      addItem(player, "warp", 1);
      player.stamina = player.staminaMax;
      burst(x, y, "#8dd7ff", 18);
      say("崩れた門の抜け道を見つけた。帰還鈴を補給した");
      return;
    }
    if (discovery.kind === "spring") {
      player.hp = player.hpMax;
      player.stamina = player.staminaMax;
      burst(x, y, "#74ff8f", 18);
      say("隠し泉を見つけた。ここで回復できる");
    } else if (discovery.kind === "ore") {
      player.gold += 90;
      burst(x, y, "#d7e2ea", 16);
      grantWeaponAtLeast(context, 2, "古鉄鉱を見つけ、鉄剣を得た", "古鉄鉱を見つけた。既により良い剣を持っている");
    } else if (discovery.kind === "cache") {
      grantAccessory(context, "hunter", "狩人の印を手に入れた");
      refreshDerivedStats();
      player.stamina = player.staminaMax;
      player.bombs = Math.min(9, player.bombs + 1);
      player.wards = Math.min(9, player.wards + 1);
      burst(x, y, "#ffd166", 18);
      say("狩人の小箱から俊足の印を得た");
    }
  }

  function gainFoundItem(context, tile) {
    const { player, say } = requireRewardContext(context);
    const roll = Math.random();
    if (tile === TILE_FIELD || roll < 0.58) {
      player.potions = Math.min(9, player.potions + 1);
      say("薬草を見つけた");
    } else if (roll < 0.76) {
      addItem(player, "tonic", 1);
      say("活力薬を見つけた");
    } else if (roll < 0.88) {
      player.bombs = Math.min(9, player.bombs + 1);
      say("火瓶を見つけた");
    } else {
      player.wards = Math.min(9, player.wards + 1);
      say("護符を見つけた");
    }
  }

  function requireItemContext(context) {
    const base = requireRewardContext(context);
    if (!base.state || !base.addFloater || !base.addRing || !base.burst) {
      throw new Error("item reward helpers require { player, state, say, addFloater, addRing, burst }");
    }
    return base;
  }

  function useSelectedItem(context) {
    const { player } = requireItemContext(context);
    if (player.selectedItem === "potion") usePotion(context);
    if (player.selectedItem === "tonic") useTonic(context);
    if (player.selectedItem === "bomb") useBomb(context);
    if (player.selectedItem === "ward") useWard(context);
    if (player.selectedItem === "elixir") useElixir(context);
    if (player.selectedItem === "warp") useWarp(context);
  }

  function usePotion(context) {
    const { player, say, burst } = requireItemContext(context);
    if (player.hp <= 0) return;
    if (player.hp >= player.hpMax) {
      say("HPは満タンだ");
      return;
    }
    if (player.potions <= 0) {
      say("薬がない");
      return;
    }
    player.potions -= 1;
    const deepLampBonus = accessoryActive(player, "deepLamp", "deepLampCharm") ? 18 + player.level * 2 : 0;
    player.hp = Math.min(player.hpMax, player.hp + 30 + player.level * 6 + deepLampBonus);
    burst(player.x + player.w / 2, player.y + player.h / 2, "#74ff8f", 10);
    say("薬を使った");
  }

  function useTonic(context) {
    const { player, say, burst } = requireItemContext(context);
    if (player.hp <= 0) return;
    if ((player.tonics || 0) <= 0) {
      say("活力薬がない");
      return;
    }
    player.tonics -= 1;
    player.stamina = player.staminaMax;
    player.slow = 0;
    player.guard = Math.max(player.guard, 1200 + player.level * 40);
    burst(player.x + player.w / 2, player.y + player.h / 2, "#ffd166", 12);
    say("活力薬を使った。スタミナと構えを整えた");
  }

  function useBomb(context) {
    const { player, state, say, addFloater, addRing, burst } = requireItemContext(context);
    if (player.hp <= 0) return;
    if (player.bombs <= 0) {
      say("火瓶がない");
      return;
    }
    player.bombs -= 1;
    const pc = centerOf(player);
    const radius = worldPx(46);
    const damage = 30 + player.level * 8 + (weaponAttack[player.weapon] || 0);
    let hitCount = 0;
    for (const monster of state.monsters) {
      const mc = centerOf(monster);
      const dist = Math.hypot(mc.x - pc.x, mc.y - pc.y);
      if (dist <= radius) {
        const dealt = Math.max(8, Math.round(damage * (1 - dist / (radius * 1.8))));
        monster.hp -= dealt;
        monster.hurt = 180;
        hitCount += 1;
        addFloater(mc.x, mc.y - worldPx(4), String(dealt), "#ffef8a");
        burst(mc.x, mc.y, "#ff8a3d", monster.boss ? 12 : 8);
      }
    }
    state.shake = 180;
    addRing(pc.x, pc.y, "#ff8a3d", radius);
    burst(pc.x, pc.y, "#ff8a3d", 26);
    say(hitCount ? `火瓶が${hitCount}体を巻き込んだ` : "火瓶が炸裂した");
  }

  function useWard(context) {
    const { player, say, addRing, burst } = requireItemContext(context);
    if (player.hp <= 0) return;
    if (player.wards <= 0) {
      say("護符がない");
      return;
    }
    player.wards -= 1;
    player.guard = 5200 + (player.armor >= 3 ? 1400 : 0);
    player.invuln = Math.max(player.invuln, 500);
    addRing(player.x + player.w / 2, player.y + player.h / 2, "#6de4ff", worldPx(28));
    burst(player.x + player.w / 2, player.y + player.h / 2, "#6de4ff", 16);
    say("護符をかざした");
  }

  function useElixir(context) {
    const { player, say, burst, addRing } = requireItemContext(context);
    if (player.hp <= 0) return;
    if ((player.elixirs || 0) <= 0) {
      say("霊薬がない");
      return;
    }
    player.elixirs -= 1;
    player.hp = player.hpMax;
    player.stamina = player.staminaMax;
    player.slow = 0;
    player.burn = 0;
    player.guard = Math.max(player.guard, 2200 + player.level * 60);
    addRing(player.x + player.w / 2, player.y + player.h / 2, "#fff2a6", worldPx(34));
    burst(player.x + player.w / 2, player.y + player.h / 2, "#fff2a6", 22);
    say("霊薬を使った。完全に回復した");
  }

  function useWarp(context) {
    const { player, state, say, burst, addRing } = requireItemContext(context);
    if (player.hp <= 0) return;
    if ((player.warps || 0) <= 0) {
      say("帰還鈴がない");
      return;
    }
    const points = availableTravelPoints(state, player);
    if (points.length <= 0) {
      say("まだ帰れる拠点がつながっていない");
      return;
    }
    const tileSize = worldPx(16);
    const pc = centerOf(player);
    let best = points[0];
    let bestDistance = Infinity;
    for (const point of points) {
      const px = (point.x + 0.5) * tileSize;
      const py = (point.y + 0.5) * tileSize;
      const distance = Math.hypot(pc.x - px, pc.y - py);
      if (distance < bestDistance) {
        best = point;
        bestDistance = distance;
      }
    }
    player.warps -= 1;
    player.x = best.x * tileSize;
    player.y = best.y * tileSize;
    player.stamina = player.staminaMax;
    player.invuln = Math.max(player.invuln, 900);
    player.slow = 0;
    player.burn = 0;
    state.projectiles = [];
    addRing(player.x + player.w / 2, player.y + player.h / 2, "#8dd7ff", worldPx(42));
    burst(player.x + player.w / 2, player.y + player.h / 2, "#8dd7ff", 24);
    say(`${best.name}へ帰還した`);
  }

  function selectItem(context, item) {
    const { player } = requireItemContext(context);
    if (!itemOrder.includes(item)) return;
    player.selectedItem = item;
  }

  function cycleItem(context, step) {
    const { player, say } = requireItemContext(context);
    const index = itemOrder.indexOf(player.selectedItem);
    player.selectedItem = itemOrder[(index + step + itemOrder.length) % itemOrder.length];
    const names = { potion: "薬", tonic: "活力薬", bomb: "火瓶", ward: "護符", elixir: "霊薬", warp: "帰還鈴" };
    say(`${names[player.selectedItem]}を選んだ`, 900);
  }

  function selectedItemCount(context) {
    const { player } = requireItemContext(context);
    return player[itemField(player.selectedItem)] || 0;
  }

  globalThis.DRAGON_HUNTER_REWARDS = {
    rewardIds,
    savedIdSet,
    normalizeInventory,
    addOwnedWeapon,
    addOwnedArmor,
    addOwnedShield,
    grantAccessory,
    equippedAccessoryIds,
    accessoryActive,
    equipAccessory,
    grantWeaponAtLeast,
    grantArmorAtLeast,
    grantShieldAtLeast,
    grantChestReward,
    grantMonsterDefeatDrops,
    grantDiscoveryReward,
    gainFoundItem,
    useSelectedItem,
    usePotion,
    useTonic,
    useBomb,
    useWard,
    useElixir,
    useWarp,
    selectItem,
    cycleItem,
    selectedItemCount,
    itemField,
    addItem,
    availableTravelPoints,
    travelPointUnlocked,
  };
})();
