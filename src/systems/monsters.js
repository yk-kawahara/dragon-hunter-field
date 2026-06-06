"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS || {};
  const WORLD_SCALE = definitions.WORLD_SCALE || 1;
  const worldPx = (value) => value * WORLD_SCALE;

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

    say(monster.boss ? "赤竜は洞窟の奥へ戻った" : "強敵は縄張りへ戻った", 2200);
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

  function updateMonsters(context, dt) {
    const {
      state,
      player,
      rand,
      moveActor,
      spawnIfClear,
      shootProjectile,
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
        monster.speed += worldPx(6);
        monster.atk += 4;
        monster.fireCooldown = 120;
        state.shake = Math.max(state.shake, 260);
        addRing(c.x, c.y, "#ff543d", worldPx(48));
        say("赤竜が怒り狂う!", 2600);
      }

      if (monster.boss && monster.enraged && !monster.summoned && monster.hp <= monster.hpMax * 0.42) {
        monster.summoned = true;
        spawnIfClear("dragonling", monster.x - worldPx(28), monster.y + worldPx(26));
        spawnIfClear("wisp", monster.x + worldPx(34), monster.y + worldPx(20));
        say("赤竜が眷属を呼んだ!", 2200);
      }

      if (monster.type === "boar" && monster.windup <= 0 && monster.chargeTime <= 0 && monster.chargeCooldown <= 0 && dist < worldPx(92)) {
        monster.chargeVector = normalize(playerCenter.x - c.x, playerCenter.y - c.y);
        monster.windup = 360;
        monster.chargeCooldown = 1700;
        addRing(c.x, c.y, "#ff8a3d", worldPx(15));
      }

      if ((monster.type === "wisp" || monster.type === "bubbler" || monster.boss || monster.midboss) && monster.fireCooldown <= 0 && dist < worldPx(monster.boss ? 180 : monster.midboss ? 150 : monster.type === "bubbler" ? 145 : 130)) {
        if (monster.boss && monster.enraged) {
          shootProjectile(monster, playerCenter, -0.28);
          shootProjectile(monster, playerCenter, 0);
          shootProjectile(monster, playerCenter, 0.28);
        } else {
          shootProjectile(monster, playerCenter);
        }
        monster.fireCooldown = monster.boss ? rand(850, 1400) : monster.midboss ? rand(1050, 1700) : monster.type === "bubbler" ? rand(1050, 1650) : rand(1300, 2100);
      }

      if (monster.windup > 0) {
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
      player.slow = Math.max(player.slow, 1200);
      player.stamina = Math.max(0, player.stamina - 8);
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "泡", "#8dd7ff");
    } else if (monster.type === "bat") {
      player.stamina = Math.max(0, player.stamina - 12);
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "ST-", "#d7b5ff");
    } else if (monster.type === "warden") {
      player.stamina = Math.max(0, player.stamina - 18);
      player.slow = Math.max(player.slow, 700);
      addFloater(player.x + player.w / 2, player.y - worldPx(7), "ST-", "#8dd7ff");
    } else if (monster.type === "wisp" || monster.type === "dragonling" || monster.boss) {
      player.burn = Math.max(player.burn, monster.boss ? 2600 : 1500);
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

    if (monster.type === "warden") {
      state.wardenDefeated = true;
      player.aegisCharm = true;
      player.wards = Math.min(9, player.wards + 2);
      player.potions = Math.min(9, player.potions + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#6de4ff", 42);
      say("南東の道番を越え、守りの護石を得た!", 4200);
    } else if (monster.midboss) {
      state.guardianDefeated = true;
      player.sealCrest = true;
      player.scales = Math.min(3, player.scales + 1);
      player.wards = Math.min(9, player.wards + 2);
      player.bombs = Math.min(9, player.bombs + 1);
      addRing(monster.x + monster.w / 2, monster.y + monster.h / 2, "#55c7a0", 42);
      say("封印の紋章を手に入れた!", 4200);
    }

    if (monster.boss) {
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
    while (player.xp >= player.xpNext) {
      player.xp -= player.xpNext;
      player.level += 1;
      player.xpNext = Math.floor(player.xpNext * 1.45 + 18);
      player.hpMax += 12;
      player.hp = player.hpMax;
      burst(player.x + 5, player.y + 4, "#fff36b", 18);
      say(`LEVEL UP! LV ${player.level}`);
    }
  }

  globalThis.DRAGON_HUNTER_MONSTERS = {
    updateMonsters,
  };
})();
