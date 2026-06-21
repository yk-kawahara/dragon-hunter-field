"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS || {};
  const WORLD_SCALE = definitions.WORLD_SCALE || 1;
  const worldPx = (value) => value * WORLD_SCALE;
  const TILE = definitions.TILE || worldPx(16);

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before monster helpers");
  }

  const {
    rectsOverlap,
    centerOf,
    normalize,
    facingDot,
    directionFromVector,
  } = mathHelpers;

  function requireMonsterContext(context) {
    if (!context?.state || !context?.player || !context?.rand) {
      throw new Error("monster helpers require { state, player, rand }");
    }
    const requiredFns = [
      "moveActor",
      "spawnIfClear",
      "shootProjectile",
      "playerAttack",
      "playerDefense",
      "weaponDamageMultiplier",
      "armorDamageMultiplier",
      "grantMonsterDefeatDrops",
      "addFloater",
      "addSlash",
      "addRing",
      "burst",
      "say",
    ];
    for (const name of requiredFns) {
      if (typeof context[name] !== "function") {
        throw new Error(`monster helpers require function ${name}`);
      }
    }
    return context;
  }

  function fallbackLeashRadius(monster) {
    if (monster.boss) return worldPx(360);
    if (monster.midboss || monster.type === "warden") return worldPx(260);
    return worldPx(220);
  }

  function ensureMonsterHome(monster) {
    if (monster.homeX == null) monster.homeX = monster.x;
    if (monster.homeY == null) monster.homeY = monster.y;
    if (monster.baseHp == null) monster.baseHp = monster.hpMax;
    if (monster.baseAtk == null) monster.baseAtk = monster.atk;
    if (monster.baseSpeed == null) monster.baseSpeed = monster.speed;
    if (monster.leashRadius == null) monster.leashRadius = fallbackLeashRadius(monster);
    if (monster.leashed == null) monster.leashed = false;
  }

  function isStrongMonster(monster) {
    return Boolean(monster.boss || monster.midboss || monster.type === "warden");
  }

  function activeAccessory(player, id, legacyFlag) {
    if (Array.isArray(player.equippedAccessories)) {
      return player.equippedAccessories.includes(id);
    }
    if (player.equippedAccessory) return player.equippedAccessory === id;
    return Boolean(player[legacyFlag]);
  }

  function autoEquipAccessoryIfSlotOpen(player, id) {
    const owned = Array.isArray(player.ownedAccessories) ? player.ownedAccessories : [];
    const equipped = Array.isArray(player.equippedAccessories)
      ? player.equippedAccessories.filter((value) => owned.includes(value))
      : (player.equippedAccessory && owned.includes(player.equippedAccessory) ? [player.equippedAccessory] : []);
    if (owned.includes(id) && !equipped.includes(id) && equipped.length < 2) equipped.push(id);
    player.equippedAccessories = equipped.slice(0, 2);
    player.equippedAccessory = player.equippedAccessories[0] || "";
  }

  function resetStrongMonsterToHome(context, monster) {
    const { state, say } = requireMonsterContext(context);
    monster.x = monster.homeX;
    monster.y = monster.homeY;
    monster.hpMax = monster.baseHp ?? monster.hpMax;
    monster.hp = monster.hpMax;
    monster.atk = monster.baseAtk ?? monster.atk;
    monster.speed = monster.baseSpeed ?? monster.speed;
    monster.hurt = 0;
    monster.contactTimer = 0;
    monster.fireCooldown = 700;
    monster.patternCooldown = 1800;
    monster.patternState = "idle";
    monster.patternWindup = 0;
    monster.patternWaveCooldown = 0;
    monster.patternWaves = 0;
    monster.patternTargets = [];
    monster.summonCooldown = monster.type === "summoner" ? 1500 : 0;
    monster.summonAnnounced = false;
    monster.trapTimer = 0;
    monster.trapPrimed = false;
    monster.trapAnnounced = false;
    monster.windup = 0;
    monster.chargeTime = 0;
    monster.chargeCooldown = 0;
    monster.chargeVector = { x: 0, y: 0 };
    monster.wanderTimer = 500;
    monster.vx = 0;
    monster.vy = 0;
    monster.enraged = false;
    monster.summoned = false;
    monster.leashed = false;

    if (Array.isArray(state.projectiles)) {
      state.projectiles = state.projectiles.filter((projectile) => (
        projectile.owner !== monster
        && projectile.source !== monster
        && projectile.monster !== monster
        && projectile.sourceMonster !== monster
      ));
    }

    say(monster.type === "frostDragon" ? "霜冠竜は城の奥へ戻った" : monster.type === "voidDragon" ? "黒陽竜は城の奥へ戻った" : monster.type === "eclipseDragon" ? "月蝕竜は城の奥へ戻った" : monster.boss ? "赤竜は洞窟の奥へ戻った" : "強敵は縄張りへ戻った", 2200);
  }

  function handleLeash(context, monster) {
    ensureMonsterHome(monster);
    const homeDist = Math.hypot(monster.x - monster.homeX, monster.y - monster.homeY);
    if (homeDist <= monster.leashRadius) return false;

    if (isStrongMonster(monster)) {
      resetStrongMonsterToHome(context, monster);
      return true;
    }

    monster.leashed = true;
    monster.hp = 0;
    return true;
  }

  function explodeTrapFlower(context, monster) {
    const {
      state,
      player,
      playerDefense,
      armorDamageMultiplier,
      addFloater,
      addRing,
      burst,
      say,
    } = requireMonsterContext(context);
    const pc = centerOf(player);
    const mc = centerOf(monster);
    const dist = Math.hypot(pc.x - mc.x, pc.y - mc.y);
    const radius = worldPx(58);

    addRing(mc.x, mc.y, "#ff5e9f", radius);
    burst(mc.x, mc.y, "#ff5e9f", 18);
    if (dist <= radius && player.hp > 0 && player.invuln <= 0) {
      let hurt = Math.max(2, Math.round((monster.atk - Math.floor(playerDefense() * 0.45)) * armorDamageMultiplier(monster, 0.4, "trap")));
      if (player.guard > 0) hurt = Math.floor(hurt * 0.32);
      player.hp = Math.max(0, player.hp - hurt);
      player.invuln = 360;
      player.slow = Math.max(player.slow, 1300);
      player.stamina = Math.max(0, player.stamina - 18);
      state.shake = Math.max(state.shake, 170);
      addFloater(player.x + player.w / 2, player.y, `罠 ${hurt}`, "#ff5e9f");
      burst(pc.x, pc.y, "#ff5e9f", 10);
      if (player.hp <= 0) {
        state.gameOver = true;
        say("地雷花の爆発に倒れた... Rで再挑戦", 5000);
      }
    }
    monster.leashed = true;
    monster.hp = 0;
  }

  function startBossPattern(context, monster, playerCenter) {
    const { state, addRing, say } = requireMonsterContext(context);
    const c = centerOf(monster);
    monster.patternAim = normalize(playerCenter.x - c.x, playerCenter.y - c.y);
    monster.patternState = "windup";
    monster.patternIndex = (monster.patternIndex || 0) + 1;
    monster.fireCooldown = Math.max(monster.fireCooldown, 1100);

    if (monster.type === "voidDragon") {
      monster.patternKind = "voidZones";
      monster.patternWindup = 920;
      monster.patternWaves = 3;
      monster.patternTargets = [
        { x: playerCenter.x, y: playerCenter.y },
        { x: playerCenter.x + worldPx(34), y: playerCenter.y - worldPx(22) },
        { x: playerCenter.x - worldPx(34), y: playerCenter.y + worldPx(22) },
      ];
      for (const target of monster.patternTargets) {
        state.telegraphs.push({ kind: "zone", x: target.x, y: target.y, radius: worldPx(15), color: "#b990ff", life: 920, max: 920 });
      }
      say("黒陽竜が足元に虚無を刻む!", 1500);
      return;
    }

    const frostBurst = monster.type === "frostDragon" && monster.patternIndex % 2 === 0;
    monster.patternKind = frostBurst ? "frostBurst" : monster.type === "frostDragon" ? "frostLance" : monster.type === "eclipseDragon" ? "eclipseWaves" : "fireLance";
    monster.patternWindup = monster.type === "frostDragon" ? 720 : monster.type === "eclipseDragon" ? 820 : 760;
    monster.patternWaves = frostBurst ? 4 : monster.type === "eclipseDragon" ? 3 : monster.type === "frostDragon" ? 2 : 1;
    state.telegraphs.push({
      kind: "line",
      x: c.x,
      y: c.y,
      dx: monster.patternAim.x,
      dy: monster.patternAim.y,
      length: worldPx(300),
      width: worldPx(frostBurst ? 8 : 12),
      color: monster.type === "frostDragon" ? "#b9f4ff" : monster.type === "eclipseDragon" ? "#f06dff" : "#ff7a4a",
      life: monster.patternWindup,
      max: monster.patternWindup,
    });
    addRing(c.x, c.y, monster.type === "frostDragon" ? "#b9f4ff" : monster.type === "eclipseDragon" ? "#f06dff" : "#ff7a4a", worldPx(38));
    say(frostBurst ? "霜冠竜が多段吹雪を放つ!" : monster.type === "frostDragon" ? "霜冠竜が貫通氷槍を狙う!" : monster.type === "eclipseDragon" ? "月蝕竜が三連月光を構える!" : "赤竜が貫通火炎を狙う!", 1500);
  }

  function finishBossPattern(monster) {
    monster.patternState = "idle";
    monster.patternCooldown = monster.enraged ? 2300 : 3200;
    monster.patternWaveCooldown = 0;
    monster.patternTargets = [];
  }

  function fireBossPatternWave(context, monster) {
    const { shootProjectile, addRing } = requireMonsterContext(context);
    const c = centerOf(monster);
    const target = {
      x: c.x + monster.patternAim.x * worldPx(420),
      y: c.y + monster.patternAim.y * worldPx(420),
    };
    const wave = monster.patternWaves;

    if (monster.patternKind === "voidZones") {
      const zoneIndex = 3 - wave;
      const zone = monster.patternTargets?.[zoneIndex] || target;
      shootProjectile(monster, zone, 0, { stationary: true, persistent: true, radius: 15, damageMultiplier: 0.58, life: 3200, color: "#7f69d9", pattern: "voidZone" });
      addRing(zone.x, zone.y, "#b990ff", worldPx(22));
    } else if (monster.patternKind === "eclipseWaves") {
      const rotation = (4 - wave) * 0.11;
      for (const offset of [-0.46, -0.16, 0.16, 0.46]) {
        shootProjectile(monster, target, offset + rotation, { speedMultiplier: 1.32, damageMultiplier: 0.78, life: 2100, pattern: "eclipseWave" });
      }
    } else if (monster.patternKind === "frostBurst") {
      const rotation = (5 - wave) * 0.09;
      for (const offset of [-0.58, -0.29, 0, 0.29, 0.58]) {
        shootProjectile(monster, target, offset + rotation, { speedMultiplier: 1.38, damageMultiplier: 0.72, life: 2200, pattern: "frostBurst" });
      }
    } else {
      const frost = monster.patternKind === "frostLance";
      const offset = frost && wave === 1 ? 0.12 : 0;
      shootProjectile(monster, target, offset, {
        speedMultiplier: frost ? 2.05 : 1.85,
        damageMultiplier: frost ? 1.08 : 1.18,
        radius: frost ? 6 : 5,
        life: 2500,
        piercing: true,
        wallPiercing: true,
        color: frost ? "#d9f7ff" : "#ff7a4a",
        pattern: frost ? "frostLance" : "fireLance",
      });
    }

    monster.patternWaves -= 1;
    if (monster.patternWaves <= 0) finishBossPattern(monster);
    else {
      monster.patternState = "waves";
      monster.patternWaveCooldown = monster.patternKind === "voidZones" ? 380 : 220;
    }
  }

  function updateBossPattern(context, monster, playerCenter, dist) {
    if (!monster.boss) return false;
    if (monster.patternState === "idle" && monster.patternCooldown <= 0 && dist < worldPx(245)) {
      startBossPattern(context, monster, playerCenter);
      return true;
    }
    if (monster.patternState === "windup") {
      if (monster.patternWindup <= 0) fireBossPatternWave(context, monster);
      return true;
    }
    if (monster.patternState === "waves") {
      if (monster.patternWaveCooldown <= 0) fireBossPatternWave(context, monster);
      return true;
    }
    return false;
  }

  function updateMonsters(context, dt) {
    const {
      state,
      player,
      rand,
      moveActor,
      spawnIfClear,
      shootProjectile,
      addFloater,
      addRing,
      say,
    } = requireMonsterContext(context);

    const playerCenter = centerOf(player);
    for (const monster of state.monsters) {
      if (monster.hp <= 0) continue;
      monster.age += dt;
      monster.hurt = Math.max(0, monster.hurt - dt);
      monster.contactTimer = Math.max(0, monster.contactTimer - dt);
      monster.fireCooldown = Math.max(0, monster.fireCooldown - dt);
      monster.patternCooldown = Math.max(0, (monster.patternCooldown || 0) - dt);
      monster.patternWindup = Math.max(0, (monster.patternWindup || 0) - dt);
      monster.patternWaveCooldown = Math.max(0, (monster.patternWaveCooldown || 0) - dt);
      monster.summonCooldown = Math.max(0, (monster.summonCooldown || 0) - dt);
      monster.trapTimer = Math.max(0, (monster.trapTimer || 0) - dt);
      monster.windup = Math.max(0, monster.windup - dt);
      monster.chargeTime = Math.max(0, monster.chargeTime - dt);
      monster.chargeCooldown = Math.max(0, monster.chargeCooldown - dt);
      monster.wanderTimer -= dt;

      const c = centerOf(monster);
      const dist = Math.hypot(playerCenter.x - c.x, playerCenter.y - c.y);
      if (handleLeash(context, monster)) continue;
      let vx = 0;
      let vy = 0;

      if (monster.boss && !monster.enraged && monster.hp <= monster.hpMax * 0.5) {
        monster.enraged = true;
        monster.speed += worldPx(monster.type === "frostDragon" ? 12 : monster.type === "voidDragon" ? 11 : monster.type === "eclipseDragon" ? 9 : 6);
        monster.atk += monster.type === "frostDragon" ? 14 : monster.type === "voidDragon" ? 12 : monster.type === "eclipseDragon" ? 8 : 4;
        monster.fireCooldown = 120;
        state.shake = Math.max(state.shake, 260);
        addRing(c.x, c.y, monster.type === "voidDragon" ? "#d8d8ff" : monster.type === "eclipseDragon" ? "#e36dff" : "#ff543d", worldPx(48));
        say(monster.type === "frostDragon" ? "霜冠竜が吹雪をまとった!" : monster.type === "voidDragon" ? "黒陽竜が黒い太陽を背負った!" : monster.type === "eclipseDragon" ? "月蝕竜が月の魔力をまとった!" : "赤竜が怒り狂う!", 2600);
      }

      if (monster.boss && monster.enraged && !monster.summoned && monster.hp <= monster.hpMax * 0.42) {
        monster.summoned = true;
        if (monster.type === "frostDragon") {
          spawnIfClear("frostMoth", monster.x - worldPx(42), monster.y - worldPx(32));
          spawnIfClear("frostBeast", monster.x + worldPx(42), monster.y - worldPx(32));
          say("霜冠竜が氷晶蛾と霜牙獣を呼んだ!", 2600);
        } else if (monster.type === "voidDragon") {
          spawnIfClear("voidWraith", monster.x - worldPx(42), monster.y + worldPx(32));
          spawnIfClear("eclipseMage", monster.x + worldPx(42), monster.y + worldPx(28));
          say("黒陽竜が影と術師を呼び寄せた!", 2500);
        } else if (monster.type === "eclipseDragon") {
          spawnIfClear("eclipseMage", monster.x - worldPx(34), monster.y + worldPx(30));
          spawnIfClear("moonShade", monster.x + worldPx(38), monster.y + worldPx(24));
          say("月蝕竜が術師と亡霊を呼び寄せた!", 2400);
        } else {
          spawnIfClear("dragonling", monster.x - worldPx(28), monster.y + worldPx(26));
          spawnIfClear("wisp", monster.x + worldPx(34), monster.y + worldPx(20));
          say("赤竜が眷属を呼んだ!", 2200);
        }
      }

      if (monster.type === "cryptWarden" && !monster.summoned && monster.hp <= monster.hpMax * 0.55) {
        monster.summoned = true;
        spawnIfClear("vaultLeech", monster.x - worldPx(38), monster.y + worldPx(28));
        spawnIfClear("vaultLeech", monster.x + worldPx(38), monster.y + worldPx(28));
        addRing(c.x, c.y, "#d7b26d", worldPx(38));
        say("墓守が吸命鬼を呼び起こした!", 2400);
      }

      if (monster.type === "towerWarden" && !monster.summoned && monster.hp <= monster.hpMax * 0.55) {
        monster.summoned = true;
        monster.speed += worldPx(6);
        spawnIfClear("frostBeacon", 109 * TILE, 27 * TILE);
        spawnIfClear("frostBeacon", 116 * TILE, 27 * TILE);
        spawnIfClear("frostBeacon", 112 * TILE, 25 * TILE);
        addRing(c.x, c.y, "#d9f7ff", worldPx(42));
        say("霜見の塔守が三つの凍気灯を起動した!", 2600);
      }

      if ((monster.type === "boar" || monster.type === "mistLancer" || monster.type === "frostBeast") && monster.windup <= 0 && monster.chargeTime <= 0 && monster.chargeCooldown <= 0 && dist < worldPx(monster.type === "frostBeast" ? 132 : monster.type === "mistLancer" ? 118 : 92)) {
        monster.chargeVector = normalize(playerCenter.x - c.x, playerCenter.y - c.y);
        monster.windup = monster.type === "frostBeast" ? 640 : monster.type === "mistLancer" ? 520 : 360;
        monster.chargeCooldown = monster.type === "frostBeast" ? 2700 : monster.type === "mistLancer" ? 2300 : 1700;
        addRing(c.x, c.y, monster.type === "frostBeast" ? "#b9f4ff" : monster.type === "mistLancer" ? "#9fd6c7" : "#ff8a3d", worldPx(monster.type === "frostBeast" ? 23 : monster.type === "mistLancer" ? 20 : 15));
      }

      if (monster.type === "summoner" && monster.summonCooldown <= 0 && dist < worldPx(185) && state.monsters.length < 18) {
        const minion = monster.y > worldPx(126 * 16) ? "wisp" : monster.y > worldPx(111 * 16) ? "moonShade" : "bat";
        spawnIfClear(minion, monster.x + worldPx(24), monster.y + worldPx(8));
        spawnIfClear("bat", monster.x - worldPx(24), monster.y + worldPx(8));
        monster.summonCooldown = rand(4300, 6500);
        addRing(c.x, c.y, "#d678ff", worldPx(28));
        if (!monster.summonAnnounced) {
          monster.summonAnnounced = true;
          say("召喚士が仲間を呼んだ!", 1700);
        }
      }

      if (monster.type === "frostBeacon" && monster.summonCooldown <= 0 && dist < worldPx(118)) {
        const frostGuard = player.armor === 12 || activeAccessory(player, "frost", "frostCharm");
        player.slow = Math.max(player.slow, frostGuard ? 420 : 1050);
        player.stamina = Math.max(0, player.stamina - (frostGuard ? 5 : 15));
        monster.summonCooldown = 2100;
        addRing(c.x, c.y, "#9de8ff", worldPx(34));
        addFloater(player.x + player.w / 2, player.y - worldPx(7), "凍気", "#b9f4ff");
        if (!monster.summonAnnounced) {
          monster.summonAnnounced = true;
          say("凍気灯が冷気を放つ。先に壊せ!", 1500);
        }
      }

      if (monster.type === "trapFlower") {
        if (!monster.trapPrimed && dist < worldPx(44)) {
          monster.trapPrimed = true;
          monster.trapTimer = 1040;
          addRing(c.x, c.y, "#ff5e9f", worldPx(25));
          if (!monster.trapAnnounced) {
            monster.trapAnnounced = true;
            say("地雷花がふくらみ始めた!", 1200);
          }
        }
        if (monster.trapPrimed && monster.trapTimer <= 0) {
          explodeTrapFlower(context, monster);
          continue;
        }
      }

      const bossPatternActive = updateBossPattern(context, monster, playerCenter, dist);

      if (!bossPatternActive && (monster.type === "wisp" || monster.type === "bubbler" || monster.type === "frostMoth" || monster.type === "sorcerer" || monster.type === "summoner" || monster.type === "moonShade" || monster.type === "eclipseMage" || monster.type === "voidWraith" || monster.type === "obsidianCrawler" || monster.boss || monster.midboss) && monster.fireCooldown <= 0 && dist < worldPx(monster.type === "frostDragon" ? 235 : monster.type === "voidDragon" ? 225 : monster.type === "eclipseDragon" ? 205 : monster.type === "obsidianGolem" ? 185 : monster.boss ? 180 : monster.midboss ? 150 : monster.type === "frostMoth" ? 195 : monster.type === "bubbler" ? 145 : monster.type === "voidWraith" || monster.type === "obsidianCrawler" ? 185 : monster.type === "eclipseMage" ? 180 : monster.type === "summoner" ? 170 : monster.type === "sorcerer" || monster.type === "moonShade" ? 165 : 130)) {
        if (monster.type === "frostDragon" && monster.enraged) {
          shootProjectile(monster, playerCenter, -0.6);
          shootProjectile(monster, playerCenter, -0.3);
          shootProjectile(monster, playerCenter, 0);
          shootProjectile(monster, playerCenter, 0.3);
          shootProjectile(monster, playerCenter, 0.6);
        } else if (monster.type === "voidDragon" && monster.enraged) {
          shootProjectile(monster, playerCenter, -0.52);
          shootProjectile(monster, playerCenter, -0.26);
          shootProjectile(monster, playerCenter, 0);
          shootProjectile(monster, playerCenter, 0.26);
          shootProjectile(monster, playerCenter, 0.52);
        } else if (monster.type === "eclipseDragon" && monster.enraged) {
          shootProjectile(monster, playerCenter, -0.42);
          shootProjectile(monster, playerCenter, -0.14);
          shootProjectile(monster, playerCenter, 0.14);
          shootProjectile(monster, playerCenter, 0.42);
        } else if (monster.boss && monster.enraged) {
          shootProjectile(monster, playerCenter, -0.28);
          shootProjectile(monster, playerCenter, 0);
          shootProjectile(monster, playerCenter, 0.28);
        } else {
          shootProjectile(monster, playerCenter);
        }
        monster.fireCooldown = monster.type === "frostDragon" ? rand(600, 980) : monster.type === "voidDragon" ? rand(660, 1040) : monster.type === "eclipseDragon" ? rand(760, 1180) : monster.type === "obsidianGolem" ? rand(920, 1450) : monster.boss ? rand(850, 1400) : monster.midboss ? rand(1050, 1700) : monster.type === "frostMoth" ? rand(720, 1160) : monster.type === "bubbler" ? rand(1050, 1650) : monster.type === "voidWraith" || monster.type === "obsidianCrawler" ? rand(760, 1280) : monster.type === "eclipseMage" ? rand(820, 1320) : monster.type === "summoner" ? rand(1100, 1700) : monster.type === "sorcerer" || monster.type === "moonShade" ? rand(900, 1450) : rand(1300, 2100);
      }

      if (monster.type === "trapFlower") {
        vx = 0;
        vy = 0;
      } else if (monster.patternState === "windup") {
        vx = 0;
        vy = 0;
      } else if (monster.windup > 0) {
        vx = 0;
        vy = 0;
        if (monster.windup <= 40) monster.chargeTime = 360;
      } else if (monster.chargeTime > 0) {
        vx = monster.chargeVector.x;
        vy = monster.chargeVector.y;
      } else if (monster.boss || dist < worldPx(230)) {
        const chase = normalize(playerCenter.x - c.x, playerCenter.y - c.y);
        vx = chase.x;
        vy = chase.y;
      } else {
        if (monster.wanderTimer <= 0) {
          monster.wanderTimer = rand(700, 1800);
          const a = rand(0, Math.PI * 2);
          monster.vx = Math.cos(a);
          monster.vy = Math.sin(a);
        }
        vx = monster.vx;
        vy = monster.vy;
      }

      monster.dir = directionFromVector(vx, vy, monster.dir);
      const slow = rectsOverlap(monster, player) ? 0.25 : 1;
      const chargeSpeed = monster.chargeTime > 0 ? 2.55 : 1;
      moveActor(monster, vx * monster.speed * chargeSpeed * slow * dt * 0.001, vy * monster.speed * chargeSpeed * slow * dt * 0.001);
      resolveContact(context, monster);
    }

    state.monsters = state.monsters.filter((monster) => {
      if (monster.hp > 0) return true;
      if (!monster.leashed) {
        defeatMonster(context, monster);
      }
      return false;
    });
  }

  function resolveContact(context, monster) {
    const {
      state,
      player,
      rand,
      moveActor,
      playerAttack,
      playerDefense,
      weaponDamageMultiplier,
      armorDamageMultiplier,
      addFloater,
      addSlash,
      burst,
      say,
    } = requireMonsterContext(context);

    if (!rectsOverlap(player, monster) || monster.contactTimer > 0 || player.hp <= 0) return;
    monster.contactTimer = monster.boss ? 320 : 380;

    const pDot = facingDot(player, monster);
    const mDot = facingDot(monster, player);
    const pMult = pDot > 0.58 ? 1.5 : pDot > -0.18 ? 0.9 : 0.38;
    const mMult = mDot > 0.58 ? 1.25 : mDot > -0.18 ? 0.85 : 0.42;
    const crit = pDot > 0.78 && Math.random() < 0.22 + player.weapon * 0.03;
    const critMult = crit ? 1.55 : 1;
    const gearMult = weaponDamageMultiplier(monster, pDot, mDot);
    const hit = Math.max(1, Math.round((playerAttack() - monster.def + rand(0, 3)) * pMult * critMult * gearMult));
    let hurt = Math.max(0, Math.round((monster.atk - playerDefense() + rand(0, 2)) * mMult * armorDamageMultiplier(monster, pDot)));
    if ((monster.boss || monster.midboss) && hurt < 2) hurt = 2;
    if (player.guard > 0) hurt = Math.floor(hurt * 0.35);

    monster.hp -= hit;
    monster.hurt = 120;
    addFloater(monster.x + monster.w / 2, monster.y, crit ? `${hit}!` : String(hit), crit ? "#ffd166" : "#ffffff");
    addSlash(monster.x + monster.w / 2, monster.y + monster.h / 2, player.dir, crit ? "#ffd166" : "#f8fbff");

    const pc = centerOf(player);
    const mc = centerOf(monster);
    const away = normalize(mc.x - pc.x, mc.y - pc.y);
    moveActor(monster, away.x * worldPx(6), away.y * worldPx(6));

    if (hurt > 0 && player.invuln <= 0) {
      player.hp = Math.max(0, player.hp - hurt);
      player.invuln = 260;
      state.shake = 120;
      addFloater(player.x + player.w / 2, player.y, String(hurt), "#ffeb61");
      burst(player.x + player.w / 2, player.y + player.h / 2, "#ff5444", 5);
      moveActor(player, -away.x * worldPx(4), -away.y * worldPx(4));
      if (player.hp <= 0) {
        state.gameOver = true;
        say("倒れた... Rで再挑戦", 5000);
      }
      applyContactStatus(context, monster);
    }

    if (player.guard > 0 && hurt === 0) {
      addFloater(player.x + player.w / 2, player.y - worldPx(2), "GUARD", "#6de4ff");
      burst(player.x + player.w / 2, player.y + player.h / 2, "#6de4ff", 3);
    }

    if (pDot > 0.58) {
      burst(monster.x + monster.w / 2, monster.y + monster.h / 2, "#fff36b", monster.boss ? 12 : 7);
    } else {
      burst(monster.x + monster.w / 2, monster.y + monster.h / 2, "#ff9c52", 4);
    }
  }

  function applyContactStatus(context, monster) {
    const { player, addFloater } = requireMonsterContext(context);
    if (monster.type === "slime") {
      player.slow = Math.max(player.slow, 1200);
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "SLOW", "#9df27f");
    } else if (monster.type === "bubbler") {
      const mineGuard = player.armor === 5 || activeAccessory(player, "mine", "mineCharm");
      player.slow = Math.max(player.slow, mineGuard ? 520 : 1200);
      player.stamina = Math.max(0, player.stamina - (mineGuard ? 3 : 8));
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "泡", "#8dd7ff");
    } else if (monster.type === "bat") {
      player.stamina = Math.max(0, player.stamina - 12);
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "ST-", "#d7b5ff");
    } else if (monster.type === "warden") {
      player.stamina = Math.max(0, player.stamina - 18);
      player.slow = Math.max(player.slow, 700);
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "ST-", "#8dd7ff");
    } else if (monster.type === "trapFlower") {
      player.slow = Math.max(player.slow, 900);
      player.stamina = Math.max(0, player.stamina - 10);
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "罠", "#ff5e9f");
    } else if (monster.type === "mistLancer") {
      const mistGuard = activeAccessory(player, "mist", "mistCharm");
      player.slow = Math.max(player.slow, mistGuard ? 420 : 900);
      player.stamina = Math.max(0, player.stamina - (mistGuard ? 5 : 13));
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "霧", "#9fd6c7");
    } else if (monster.type === "vaultLeech") {
      const lampGuard = activeAccessory(player, "deepLamp", "deepLampCharm");
      player.slow = Math.max(player.slow, lampGuard ? 360 : 1050);
      player.stamina = Math.max(0, player.stamina - (lampGuard ? 5 : 18));
      monster.hp = Math.min(monster.hpMax, monster.hp + (lampGuard ? 5 : 18));
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "吸命", "#d78ab7");
    } else if (monster.type === "frostMoth" || monster.type === "frostBeast" || monster.type === "frostGolem" || monster.type === "towerWarden" || monster.type === "frostDragon") {
      const frostGuard = player.armor === 12 || activeAccessory(player, "frost", "frostCharm");
      const baseSlow = monster.type === "frostDragon" ? 2100 : monster.type === "towerWarden" ? 1750 : monster.type === "frostGolem" ? 1650 : monster.type === "frostBeast" ? 1300 : 1050;
      const baseStamina = monster.type === "frostDragon" ? 28 : monster.type === "towerWarden" ? 24 : monster.type === "frostGolem" ? 22 : monster.type === "frostBeast" ? 18 : 14;
      player.slow = Math.max(player.slow, Math.round(baseSlow * (frostGuard ? 0.45 : 1)));
      player.stamina = Math.max(0, player.stamina - (frostGuard ? Math.ceil(baseStamina * 0.35) : baseStamina));
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "凍", "#b9f4ff");
    } else if (monster.type === "sorcerer" || monster.type === "summoner" || monster.type === "moonShade" || monster.type === "mistKeeper" || monster.type === "cryptWarden" || monster.type === "eclipseMage" || monster.type === "eclipseDragon" || monster.type === "voidWraith" || monster.type === "voidDragon" || monster.type === "obsidianCrawler" || monster.type === "obsidianGolem") {
      const eclipseGuard = player.armor === 9 || activeAccessory(player, "eclipse", "eclipseCharm");
      const voidGuard = player.armor === 10 || activeAccessory(player, "void", "voidCharm");
      const obsidianGuard = player.armor === 11 || activeAccessory(player, "obsidian", "obsidianCharm");
      const mistGuard = activeAccessory(player, "mist", "mistCharm");
      const lampGuard = activeAccessory(player, "deepLamp", "deepLampCharm");
      const isVoid = monster.type === "voidWraith" || monster.type === "voidDragon";
      const isObsidian = monster.type === "obsidianCrawler" || monster.type === "obsidianGolem";
      const baseSlow = monster.type === "voidDragon" ? 1850 : monster.type === "obsidianGolem" ? 1650 : monster.type === "voidWraith" || monster.type === "obsidianCrawler" ? 1300 : monster.type === "eclipseDragon" ? 1400 : monster.type === "cryptWarden" ? 1380 : monster.type === "mistKeeper" ? 1280 : monster.type === "eclipseMage" ? 1050 : monster.type === "summoner" ? 950 : 800;
      const baseStamina = monster.type === "voidDragon" ? 24 : monster.type === "obsidianGolem" ? 22 : monster.type === "voidWraith" || monster.type === "obsidianCrawler" ? 16 : monster.type === "eclipseDragon" ? 18 : monster.type === "cryptWarden" ? 20 : monster.type === "mistKeeper" ? 17 : monster.type === "eclipseMage" ? 13 : monster.type === "summoner" ? 12 : 10;
      const guard = monster.type === "cryptWarden" ? lampGuard || mistGuard : isObsidian ? obsidianGuard : isVoid ? voidGuard : monster.type === "mistKeeper" || monster.type === "summoner" ? mistGuard || eclipseGuard : eclipseGuard;
      player.slow = Math.max(player.slow, Math.round(baseSlow * (guard ? 0.5 : 1)));
      player.stamina = Math.max(0, player.stamina - (guard ? 5 : baseStamina));
      addFloater(player.x + player.w / 2, player.y - worldPx(7), isObsidian ? "曜" : isVoid ? "黒" : monster.type === "cryptWarden" ? "墓" : monster.type === "mistKeeper" ? "霧" : monster.type === "eclipseMage" || monster.type === "eclipseDragon" ? "蝕" : "MAG", isObsidian ? "#aab0c8" : isVoid ? "#d8d8ff" : monster.type === "cryptWarden" ? "#d7b26d" : monster.type === "mistKeeper" ? "#9fd6c7" : monster.type === "eclipseMage" || monster.type === "eclipseDragon" ? "#e36dff" : "#b990ff");
    } else if (monster.type === "wisp" || monster.type === "dragonling" || monster.boss) {
      const fireGuard = player.armor === 6;
      player.burn = Math.max(player.burn, Math.round((monster.boss ? 2600 : 1500) * (fireGuard ? 0.55 : 1)));
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "BURN", "#ff8a3d");
    }
  }

  function defeatMonster(context, monster) {
    const {
      state,
      player,
      grantMonsterDefeatDrops,
      addFloater,
      addRing,
      burst,
      say,
    } = requireMonsterContext(context);

    player.combo += 1;
    player.comboTimer = 2400;
    const comboGold = Math.floor(monster.gold * Math.min(0.45, player.combo * 0.04));
    const goldGain = monster.gold + comboGold;
    player.xp += monster.xp;
    player.gold += goldGain;
    burst(monster.x + monster.w / 2, monster.y + monster.h / 2, monster.color, monster.boss ? 34 : 14);
    addFloater(monster.x + monster.w / 2, monster.y - worldPx(6), `+${goldGain}G`, "#fff36b");
    if (player.combo >= 2) {
      addFloater(monster.x + monster.w / 2, monster.y - worldPx(14), `${player.combo}連`, "#6de4ff");
    }

    grantMonsterDefeatDrops(monster);

    if (monster.type === "frostDragon") {
      state.frostDragonDefeated = true;
      state.chapter4Victory = true;
      state.spawnedFrostDragon = true;
      player.wards = Math.min(9, player.wards + 5);
      player.elixirs = Math.min(9, (player.elixirs || 0) + 2);
      player.warps = Math.min(9, (player.warps || 0) + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#d9f7ff", 68);
      say("霜冠竜を封じた! 長老へ第4章の報告をしよう", 5800);
    } else if (monster.type === "voidDragon") {
      state.voidDragonDefeated = true;
      state.chapter3Victory = true;
      state.spawnedVoidDragon = true;
      player.scales = 3;
      player.wards = Math.min(9, player.wards + 5);
      player.potions = Math.min(9, player.potions + 4);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#d8d8ff", 64);
      say("黒陽竜を封じた! 長老へ第3章の報告をしよう", 5600);
    } else if (monster.type === "eclipseDragon") {
      state.eclipseDragonDefeated = true;
      state.chapter2Victory = true;
      state.spawnedEclipseDragon = true;
      player.scales = 3;
      player.wards = Math.min(9, player.wards + 4);
      player.potions = Math.min(9, player.potions + 3);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#e36dff", 58);
      say("月蝕竜を封じた! 月見砦か村の長老へ報告しよう", 5200);
    } else if (monster.type === "frostGolem") {
      state.frostGolemDefeated = true;
      state.spawnedFrostGolem = true;
      player.gold += 1400;
      player.potions = Math.min(9, player.potions + 3);
      player.tonics = Math.min(9, (player.tonics || 0) + 2);
      player.wards = Math.min(9, player.wards + 2);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#8dd7ff", 58);
      say("氷窟巨人を倒した。奥の霜心の護符に近づける!", 4800);
    } else if (monster.type === "towerWarden") {
      state.towerWardenDefeated = true;
      state.spawnedTowerWarden = true;
      player.gold += 1700;
      player.tonics = Math.min(9, (player.tonics || 0) + 2);
      player.warps = Math.min(9, (player.warps || 0) + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#d9f7ff", 62);
      say("霜見の塔守を倒した。最上階の遺物庫が開いた!", 5000);
    } else if (monster.type === "obsidianGolem") {
      state.obsidianGolemDefeated = true;
      state.spawnedObsidianGolem = true;
      player.gold += 760;
      player.potions = Math.min(9, player.potions + 2);
      player.wards = Math.min(9, player.wards + 3);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#aab0c8", 52);
      say("黒曜巨人を倒した。黒市に黒曜装備が並ぶ!", 4600);
    } else if (monster.type === "smugglerCaptain") {
      state.smugglerCaptainDefeated = true;
      state.spawnedSmugglerCaptain = true;
      player.gold += 360;
      player.potions = Math.min(9, player.potions + 2);
      player.bombs = Math.min(9, player.bombs + 1);
      player.wards = Math.min(9, player.wards + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#c28b42", 44);
      say("密輸隊長を倒した。黒市への近道が少し安全になった!", 4200);
    } else if (monster.type === "regenSentinel") {
      state.regenSentinelDefeated = true;
      state.spawnedRegenSentinel = true;
      player.gold += 620;
      player.potions = Math.min(9, player.potions + 2);
      player.wards = Math.min(9, player.wards + 3);
      player.warps = Math.min(9, player.warps + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#74ff8f", 54);
      say("再生洞の守護者を倒した。奥の宝箱を開けられる!", 4600);
    } else if (monster.type === "mistKeeper") {
      state.mistKeeperDefeated = true;
      state.spawnedMistKeeper = true;
      player.gold += 760;
      player.potions = Math.min(9, player.potions + 2);
      player.wards = Math.min(9, player.wards + 2);
      player.tonics = Math.min(9, (player.tonics || 0) + 1);
      player.warps = Math.min(9, (player.warps || 0) + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#9fd6c7", 54);
      say("霧灯の守を倒した。奥の護符に近づける!", 4600);
    } else if (monster.type === "cryptWarden") {
      state.cryptWardenDefeated = true;
      state.spawnedCryptWarden = true;
      player.gold += 980;
      player.potions = Math.min(9, player.potions + 3);
      player.tonics = Math.min(9, (player.tonics || 0) + 2);
      player.warps = Math.min(9, (player.warps || 0) + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#d7b26d", 58);
      say("地下墓所の番人を倒した。最奥の遺物庫が開いた!", 4800);
    } else if (monster.type === "ashKnight") {
      state.ashKnightDefeated = true;
      player.gold += 420;
      player.scales = Math.min(3, player.scales + 1);
      player.potions = Math.min(9, player.potions + 2);
      player.wards = Math.min(9, player.wards + 2);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#b990ff", 48);
      say("古塔の灰騎士を倒した。星見の装備が宿場に並ぶ!", 4200);
    } else if (monster.type === "warden") {
      state.wardenDefeated = true;
      player.aegisCharm = true;
      if (!Array.isArray(player.ownedAccessories)) player.ownedAccessories = [];
      if (!player.ownedAccessories.includes("aegis")) player.ownedAccessories.push("aegis");
      autoEquipAccessoryIfSlotOpen(player, "aegis");
      player.wards = Math.min(9, player.wards + 2);
      player.potions = Math.min(9, player.potions + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#6de4ff", 42);
      say("南東の道番を越え、守りの護石を得た!", 4200);
    } else if (monster.midboss && !["obsidianGolem", "smugglerCaptain", "regenSentinel", "mistKeeper", "cryptWarden", "frostGolem", "towerWarden"].includes(monster.type)) {
      state.guardianDefeated = true;
      player.sealCrest = true;
      player.scales = Math.min(3, player.scales + 1);
      player.wards = Math.min(9, player.wards + 2);
      player.bombs = Math.min(9, player.bombs + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#55c7a0", 42);
      say("封印の紋章を手に入れた!", 4200);
    }

    if (monster.boss && monster.type !== "eclipseDragon" && monster.type !== "voidDragon" && monster.type !== "frostDragon") {
      state.bossDefeated = true;
      state.victory = true;
      state.elderReported = false;
      player.scales = 3;
      say("赤竜を封じた!", 5000);
    }

    levelUp(context);
  }

  function levelUp(context) {
    const { player, burst, say } = requireMonsterContext(context);
    player.strength = Number.isFinite(player.strength) ? player.strength : 7 + player.level * 2;
    player.resilience = Number.isFinite(player.resilience) ? player.resilience : 1 + player.level;
    while (player.xp >= player.xpNext) {
      player.xp -= player.xpNext;
      player.level += 1;
      player.xpNext = Math.floor(player.xpNext * 1.15 + 18);
      player.hpMax += 9;
      player.strength += 3;
      player.resilience += 2;
      player.hp = player.hpMax;
      burst(player.x + 5, player.y + 4, "#fff36b", 18);
      say(`LEVEL UP! LV ${player.level}`);
    }
  }

  globalThis.DRAGON_HUNTER_MONSTERS = {
    updateMonsters,
  };
})();
