"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before projectile helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before projectile helpers");
  }

  const { TILE, WORLD_SCALE } = definitions;
  const { centerOf, normalize, rectsOverlap } = mathHelpers;

  const worldPx = (value) => value * WORLD_SCALE;

  function requireProjectileContext(context) {
    if (!context?.state || !context?.player) {
      throw new Error("projectile helpers require { state, player }");
    }
    if (!context.tileAt || !context.isBlockedTile || !context.inTownTile || !context.tileInGate) {
      throw new Error("projectile helpers require map helpers");
    }
    if (!context.playerDefense || !context.armorDamageMultiplier) {
      throw new Error("projectile helpers require combat stat helpers");
    }
    if (!context.addFloater || !context.addSlash || !context.burst || !context.say) {
      throw new Error("projectile helpers require effect/message helpers");
    }
    return context;
  }

  function shootProjectile(context, monster, target, angleOffset = 0, options = {}) {
    const { state, addSlash } = requireProjectileContext(context);
    const c = centerOf(monster);
    const solarEnemy = monster.type === "sunLancer" || monster.type === "mirageCaster" || monster.type === "solarRunner" || monster.type === "prismBeacon" || monster.type === "solarWarden" || monster.type === "suncrestChampion" || monster.type === "sunspireKeeper" || monster.type === "emberDragon";
    const midbossColor = monster.type === "solarWarden" || monster.type === "suncrestChampion" ? "#fff0a6" : monster.type === "towerWarden" ? "#d9f7ff" : monster.type === "frostGolem" ? "#8dd7ff" : monster.type === "warden" ? "#6de4ff" : monster.type === "mistKeeper" ? "#9fd6c7" : monster.type === "cryptWarden" ? "#d7b26d" : monster.type === "archiveWarden" ? "#b08cff" : monster.type === "obsidianGolem" ? "#aab0c8" : "#55c7a0";
    const projectileColor = solarEnemy ? (monster.type === "mirageCaster" || monster.type === "prismBeacon" ? "#ff9f5a" : "#fff0a6") : monster.type === "frostDragon" || monster.type === "frostMoth" || monster.type === "frostGolem" || monster.type === "towerWarden" ? "#b9f4ff" : monster.type === "bubbler" ? "#8dd7ff" : monster.type === "voidDragon" ? "#d8d8ff" : monster.type === "voidWraith" ? "#7b80d8" : monster.type === "obsidianCrawler" || monster.type === "obsidianGolem" ? "#aab0c8" : monster.type === "eclipseDragon" ? "#f06dff" : monster.type === "eclipseMage" ? "#e36dff" : monster.type === "summoner" ? "#d678ff" : monster.type === "moonShade" ? "#7f8cff" : monster.type === "sorcerer" ? "#b990ff" : monster.boss ? "#ff543d" : monster.midboss ? midbossColor : "#ffd166";
    const baseAim = normalize(target.x - c.x, target.y - c.y);
    const cos = Math.cos(angleOffset);
    const sin = Math.sin(angleOffset);
    const aim = {
      x: baseAim.x * cos - baseAim.y * sin,
      y: baseAim.x * sin + baseAim.y * cos,
    };
    const baseSpeed = (monster.type === "sunLancer" ? 162 : monster.type === "mirageCaster" || monster.type === "prismBeacon" ? 112 : monster.type === "solarRunner" ? 170 : monster.type === "solarWarden" || monster.type === "suncrestChampion" || monster.type === "sunspireKeeper" ? 148 : monster.type === "emberDragon" ? 138 : monster.type === "frostDragon" ? 98 : monster.type === "frostMoth" ? 90 : monster.type === "towerWarden" ? 82 : monster.type === "voidDragon" ? 94 : monster.type === "voidWraith" || monster.type === "obsidianCrawler" ? 88 : monster.type === "eclipseDragon" ? 86 : monster.boss ? 78 : monster.type === "cryptWarden" ? 76 : monster.type === "frostGolem" ? 64 : monster.type === "obsidianGolem" ? 60 : monster.midboss ? 68 : monster.type === "bubbler" ? 52 : monster.type === "eclipseMage" ? 82 : monster.type === "moonShade" ? 76 : monster.type === "summoner" ? 66 : monster.type === "sorcerer" ? 70 : 62) * WORLD_SCALE;
    const speed = options.stationary ? 0 : baseSpeed * (options.speedMultiplier || 1);
    const baseDamage = monster.type === "sunLancer" ? 25 : monster.type === "mirageCaster" || monster.type === "prismBeacon" ? 23 : monster.type === "solarRunner" ? 24 : monster.type === "solarWarden" || monster.type === "suncrestChampion" || monster.type === "sunspireKeeper" ? 30 : monster.type === "emberDragon" ? 34 : monster.type === "frostDragon" ? 26 : monster.type === "towerWarden" ? 20 : monster.type === "frostGolem" ? 19 : monster.type === "frostMoth" ? 16 : monster.type === "voidDragon" ? 23 : monster.type === "obsidianGolem" ? 18 : monster.type === "cryptWarden" ? 16 : monster.type === "voidWraith" || monster.type === "obsidianCrawler" ? 15 : monster.type === "eclipseDragon" ? 18 : monster.boss ? 14 : monster.midboss ? 11 : monster.type === "bubbler" ? 6 : monster.type === "eclipseMage" ? 13 : monster.type === "moonShade" ? 11 : monster.type === "summoner" ? 10 : monster.type === "sorcerer" ? 10 : 8;
    const spawnX = options.stationary ? target.x : c.x;
    const spawnY = options.stationary ? target.y : c.y;
    state.projectiles.push({
      x: spawnX,
      y: spawnY,
      vx: aim.x * speed,
      vy: aim.y * speed,
      r: worldPx(options.radius || (monster.boss ? 4 : 3)),
      damage: Math.max(1, Math.round(baseDamage * (options.damageMultiplier || 1))),
      color: options.color || projectileColor,
      source: solarEnemy ? monster.type : monster.type === "frostDragon" ? "frostDragon" : monster.type === "voidDragon" ? "voidDragon" : monster.type === "eclipseDragon" ? "eclipseDragon" : monster.boss ? "dragon" : monster.midboss ? monster.type : monster.type,
      life: options.life || (monster.type === "emberDragon" ? 3000 : monster.type === "solarWarden" || monster.type === "suncrestChampion" || monster.type === "sunspireKeeper" || monster.type === "sunLancer" || monster.type === "solarRunner" ? 2600 : monster.type === "mirageCaster" || monster.type === "prismBeacon" ? 2200 : monster.type === "frostDragon" ? 1850 : monster.type === "voidDragon" ? 1750 : monster.type === "eclipseDragon" ? 1650 : monster.boss ? 1500 : monster.midboss ? 1350 : 1200),
      piercing: Boolean(options.piercing),
      wallPiercing: Boolean(options.wallPiercing),
      persistent: Boolean(options.persistent),
      hitCooldown: 0,
      pattern: options.pattern || "",
    });
    addSlash(c.x + aim.x * worldPx(8), c.y + aim.y * worldPx(8), monster.dir, projectileColor);
  }

  function activeAccessory(player, id, legacyFlag) {
    if (Array.isArray(player.equippedAccessories)) {
      return player.equippedAccessories.includes(id);
    }
    if (player.equippedAccessory) return player.equippedAccessory === id;
    return Boolean(player[legacyFlag]);
  }

  function updateProjectiles(context, dt) {
    const {
      state,
      player,
      tileAt,
      isBlockedTile,
      playerDefense,
      armorDamageMultiplier,
      addFloater,
      burst,
      say,
    } = requireProjectileContext(context);

    state.projectiles = state.projectiles.filter((p) => {
      p.hitCooldown = Math.max(0, (p.hitCooldown || 0) - dt);
      const prevX = p.x;
      const prevY = p.y;
      p.x += p.vx * dt * 0.001;
      p.y += p.vy * dt * 0.001;
      p.life -= dt;
      if (p.life <= 0) return false;

      const tx = Math.floor(p.x / TILE);
      const ty = Math.floor(p.y / TILE);
      if (blocksProjectileTownEntry(context, prevX, prevY, p.x, p.y)) {
        burst(p.x, p.y, "#6de4ff", 3);
        return false;
      }
      if (!p.wallPiercing && isBlockedTile(tileAt(tx, ty), { flying: false })) {
        burst(p.x, p.y, p.color, 4);
        return false;
      }

      const hitbox = { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 };
      if (rectsOverlap(player, hitbox)) {
        if (p.hitCooldown <= 0 && player.invuln <= 0 && player.hp > 0) {
          const source = p.source === "sunLancer" || p.source === "mirageCaster" || p.source === "solarRunner" || p.source === "prismBeacon" || p.source === "solarWarden" || p.source === "suncrestChampion" || p.source === "sunspireKeeper" || p.source === "emberDragon" ? "solar" : p.source === "frostDragon" || p.source === "frostGolem" || p.source === "frostMoth" || p.source === "towerWarden" ? "frost" : p.source === "obsidianGolem" || p.source === "obsidianCrawler" ? "obsidian" : p.source === "voidDragon" || p.source === "voidWraith" ? "void" : p.source === "eclipseDragon" || p.source === "eclipseMage" ? "eclipse" : p.source === "wisp" || p.source === "dragon" ? "fire" : p.source === "bubbler" ? "bubble" : p.source === "sorcerer" || p.source === "summoner" || p.source === "moonShade" || p.source === "ashKnight" || p.source === "moonGatekeeper" || p.source === "mistKeeper" || p.source === "cryptWarden" || p.source === "archiveWarden" ? "magic" : "projectile";
          let hurt = Math.max(1, Math.round((p.damage - Math.floor(playerDefense() * 0.45)) * armorDamageMultiplier({ boss: p.source === "dragon" || p.source === "eclipseDragon" || p.source === "voidDragon" || p.source === "frostDragon" || p.source === "emberDragon", midboss: p.source === "ashKnight" || p.source === "moonGatekeeper" || p.source === "mistKeeper" || p.source === "cryptWarden" || p.source === "archiveWarden" || p.source === "frostGolem" || p.source === "solarWarden" || p.source === "suncrestChampion" || p.source === "sunspireKeeper", type: p.source }, 0, source)));
          if (p.source === "dragon" && hurt < 3) hurt = 3;
          if (p.source === "eclipseDragon" && hurt < 4) hurt = 4;
          if (p.source === "voidDragon" && hurt < 5) hurt = 5;
          if (p.source === "obsidianGolem" && hurt < 4) hurt = 4;
          if (p.source === "cryptWarden" && hurt < 4) hurt = 4;
          if (p.source === "archiveWarden" && hurt < 4) hurt = 4;
          if (p.source === "frostDragon" && hurt < 6) hurt = 6;
          if (p.source === "frostGolem" && hurt < 4) hurt = 4;
          if (p.source === "solarWarden" && hurt < 5) hurt = 5;
          if (p.source === "suncrestChampion" && hurt < 5) hurt = 5;
          if (p.source === "sunspireKeeper" && hurt < 5) hurt = 5;
          if (p.source === "emberDragon" && hurt < 8) hurt = 8;
          if (p.source === "guardian" && hurt < 2) hurt = 2;
          if (p.source === "warden" && hurt < 2) hurt = 2;
          if (player.guard > 0) hurt = Math.floor(hurt * 0.3);
          player.hp = Math.max(0, player.hp - hurt);
          player.invuln = 320;
          p.hitCooldown = p.persistent ? 720 : 900;
          state.shake = Math.max(state.shake, 120);
          addFloater(player.x + player.w / 2, player.y, String(hurt), "#ffeb61");
          burst(player.x + player.w / 2, player.y + player.h / 2, p.color, 8);
          if (player.hp <= 0) {
            state.gameOver = true;
            say("倒れた... Rで再挑戦", 5000);
          }
          if (p.source === "wisp" || p.source === "dragon") {
            const fireGuard = player.armor === 6;
            player.burn = Math.max(player.burn, Math.round((p.source === "dragon" ? 2600 : 1500) * (fireGuard ? 0.55 : 1)));
          } else if (p.source === "bubbler") {
            const mineGuard = player.armor === 5 || activeAccessory(player, "mine", "mineCharm");
            player.slow = Math.max(player.slow, mineGuard ? 560 : 1400);
            player.stamina = Math.max(0, player.stamina - (mineGuard ? 2 : 6));
            addFloater(player.x + player.w / 2, player.y - worldPx(7), "泡", "#8dd7ff");
          } else if (p.source === "guardian") {
            player.slow = Math.max(player.slow, 1500);
          } else if (p.source === "warden") {
            player.slow = Math.max(player.slow, 900);
            player.stamina = Math.max(0, player.stamina - 10);
          } else if (p.source === "frostMoth" || p.source === "frostGolem" || p.source === "towerWarden" || p.source === "frostDragon") {
            const frostGuard = player.armor === 12 || activeAccessory(player, "frost", "frostCharm");
            const baseSlow = p.source === "frostDragon" ? 2300 : p.source === "towerWarden" ? 1850 : p.source === "frostGolem" ? 1750 : 1250;
            const baseStamina = p.source === "frostDragon" ? 30 : p.source === "towerWarden" ? 24 : p.source === "frostGolem" ? 22 : 16;
            player.slow = Math.max(player.slow, Math.round(baseSlow * (frostGuard ? 0.42 : 1)));
            player.stamina = Math.max(0, player.stamina - (frostGuard ? Math.ceil(baseStamina * 0.32) : baseStamina));
            addFloater(player.x + player.w / 2, player.y - worldPx(7), "凍", "#b9f4ff");
          } else if (p.source === "sunLancer" || p.source === "mirageCaster" || p.source === "solarRunner" || p.source === "prismBeacon" || p.source === "solarWarden" || p.source === "suncrestChampion" || p.source === "sunspireKeeper" || p.source === "emberDragon") {
            const solarGuard = player.armor === 13 || activeAccessory(player, "horizon", "horizonCharm") || activeAccessory(player, "prismLens", "prismLensCharm") || player.shield === 7;
            const baseSlow = p.source === "emberDragon" ? 1700 : p.source === "solarWarden" || p.source === "suncrestChampion" || p.source === "sunspireKeeper" ? 1350 : 950;
            const baseStamina = p.source === "emberDragon" ? 30 : p.source === "solarWarden" || p.source === "suncrestChampion" || p.source === "sunspireKeeper" ? 24 : 16;
            player.slow = Math.max(player.slow, Math.round(baseSlow * (solarGuard ? 0.35 : 1)));
            player.stamina = Math.max(0, player.stamina - (solarGuard ? Math.ceil(baseStamina * 0.28) : baseStamina));
            addFloater(player.x + player.w / 2, player.y - worldPx(7), "光圧", "#fff0a6");
          } else if (p.source === "sorcerer" || p.source === "summoner" || p.source === "moonShade" || p.source === "ashKnight" || p.source === "mistKeeper" || p.source === "cryptWarden" || p.source === "archiveWarden" || p.source === "eclipseMage" || p.source === "eclipseDragon" || p.source === "voidWraith" || p.source === "voidDragon" || p.source === "obsidianCrawler" || p.source === "obsidianGolem") {
            const eclipseGuard = player.armor === 9 || activeAccessory(player, "eclipse", "eclipseCharm");
            const voidGuard = player.armor === 10 || activeAccessory(player, "void", "voidCharm");
            const obsidianGuard = player.armor === 11 || activeAccessory(player, "obsidian", "obsidianCharm");
            const mistGuard = activeAccessory(player, "mist", "mistCharm");
            const lampGuard = activeAccessory(player, "deepLamp", "deepLampCharm");
            const baseSlow = p.source === "voidDragon" ? 1900 : p.source === "obsidianGolem" ? 1700 : p.source === "voidWraith" || p.source === "obsidianCrawler" ? 1350 : p.source === "eclipseDragon" ? 1500 : p.source === "cryptWarden" ? 1450 : p.source === "archiveWarden" ? 1380 : p.source === "mistKeeper" ? 1320 : p.source === "ashKnight" ? 1200 : p.source === "eclipseMage" ? 1100 : p.source === "summoner" ? 1040 : p.source === "moonShade" ? 980 : 760;
            const baseStamina = p.source === "voidDragon" ? 26 : p.source === "obsidianGolem" ? 22 : p.source === "voidWraith" || p.source === "obsidianCrawler" ? 17 : p.source === "eclipseDragon" ? 18 : p.source === "cryptWarden" ? 21 : p.source === "archiveWarden" ? 18 : p.source === "mistKeeper" ? 16 : p.source === "ashKnight" ? 14 : p.source === "eclipseMage" ? 13 : p.source === "summoner" ? 12 : p.source === "moonShade" ? 11 : 8;
            const guard = p.source === "cryptWarden" ? lampGuard || mistGuard : p.source === "obsidianGolem" || p.source === "obsidianCrawler" ? obsidianGuard : p.source === "voidDragon" || p.source === "voidWraith" ? voidGuard : p.source === "mistKeeper" || p.source === "summoner" || p.source === "archiveWarden" ? mistGuard || eclipseGuard : eclipseGuard;
            player.slow = Math.max(player.slow, Math.round(baseSlow * (guard ? 0.5 : 1)));
            player.stamina = Math.max(0, player.stamina - (guard ? Math.ceil(baseStamina * 0.4) : baseStamina));
          }
        }
        return p.persistent || p.piercing;
      }

      return true;
    });
  }

  function blocksProjectileTownEntry(context, prevX, prevY, nextX, nextY) {
    const { state, inTownTile, tileInGate } = requireProjectileContext(context);
    const from = { x: Math.floor(prevX / TILE), y: Math.floor(prevY / TILE) };
    const to = { x: Math.floor(nextX / TILE), y: Math.floor(nextY / TILE) };
    const wasInside = inTownTile(from.x, from.y);
    const willBeInside = inTownTile(to.x, to.y);
    if (!willBeInside) return false;
    if (wasInside) return !state.townGateOpen;
    if (!state.townGateOpen) return true;
    return !(tileInGate(from.x, from.y) || tileInGate(to.x, to.y));
  }

  globalThis.DRAGON_HUNTER_PROJECTILES = {
    shootProjectile,
    updateProjectiles,
    blocksProjectileTownEntry,
  };
})();
