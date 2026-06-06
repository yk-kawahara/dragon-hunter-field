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
    WORLD_SCALE,
    weaponNames,
    armorNames,
    itemOrder,
  } = definitions;

  const {
    clamp,
    centerOf,
  } = mathHelpers;

  const worldPx = (value) => value * WORLD_SCALE;

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

  function grantWeaponAtLeast(context, rank, upgradedMessage, keptMessage = "既により良い剣を持っている") {
    const { player, say } = requireRewardContext(context);
    const target = clamp(rank, 0, weaponNames.length - 1);
    if (player.weapon >= target) {
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
    if (player.armor >= target) {
      say(keptMessage);
      return false;
    }
    player.armor = target;
    say(upgradedMessage || `${armorNames[player.armor]}を手に入れた`);
    return true;
  }

  function grantChestReward(context, reward) {
    const { player, say, refreshDerivedStats } = requireRewardContext(context);
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
      player.regenCharm = true;
      say("再生の指輪を見つけた");
    } else if (reward === "scale") {
      player.scales = Math.min(3, player.scales + 1);
      say("古い竜の鱗を見つけた");
    } else if (reward === "trail") {
      player.trailCharm = true;
      refreshDerivedStats?.();
      player.stamina = player.staminaMax;
      player.wards = Math.min(9, player.wards + 1);
      say("旅人の鈴を見つけた。遠征の足取りが軽くなった");
    } else if (reward === "mineGold") {
      player.gold += 500;
      say("廃坑の隠し金庫から500Gを見つけた!");
    }
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
      } else if (drop < 0.29) {
        player.bombs = Math.min(9, player.bombs + 1);
        say("火瓶を拾った");
      } else if (drop < 0.36) {
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
      player.hunterCharm = true;
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
    } else if (roll < 0.84) {
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
    if (player.selectedItem === "bomb") useBomb(context);
    if (player.selectedItem === "ward") useWard(context);
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
    player.hp = Math.min(player.hpMax, player.hp + 30 + player.level * 6);
    burst(player.x + player.w / 2, player.y + player.h / 2, "#74ff8f", 10);
    say("薬を使った");
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
    const damage = 30 + player.level * 8 + player.weapon * 5;
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

  function selectItem(context, item) {
    const { player } = requireItemContext(context);
    if (!itemOrder.includes(item)) return;
    player.selectedItem = item;
  }

  function cycleItem(context, step) {
    const { player, say } = requireItemContext(context);
    const index = itemOrder.indexOf(player.selectedItem);
    player.selectedItem = itemOrder[(index + step + itemOrder.length) % itemOrder.length];
    const names = { potion: "薬", bomb: "火瓶", ward: "護符" };
    say(`${names[player.selectedItem]}を選んだ`, 900);
  }

  function selectedItemCount(context) {
    const { player } = requireItemContext(context);
    if (player.selectedItem === "potion") return player.potions;
    if (player.selectedItem === "bomb") return player.bombs;
    return player.wards;
  }

  globalThis.DRAGON_HUNTER_REWARDS = {
    rewardIds,
    savedIdSet,
    grantWeaponAtLeast,
    grantArmorAtLeast,
    grantChestReward,
    grantMonsterDefeatDrops,
    grantDiscoveryReward,
    gainFoundItem,
    useSelectedItem,
    usePotion,
    useBomb,
    useWard,
    selectItem,
    cycleItem,
    selectedItemCount,
  };
})();
