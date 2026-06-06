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

  function shootProjectile(context, monster, target, angleOffset = 0) {
    const { state, addSlash } = requireProjectileContext(context);
    const c = centerOf(monster);
    const midbossColor = monster.type === "warden" ? "#6de4ff" : "#55c7a0";
    const projectileColor = monster.type === "bubbler" ? "#8dd7ff" : monster.boss ? "#ff543d" : monster.midboss ? midbossColor : "#ffd166";
    const baseAim = normalize(target.x - c.x, target.y - c.y);
    const cos = Math.cos(angleOffset);
    const sin = Math.sin(angleOffset);
    const aim = {
      x: baseAim.x * cos - baseAim.y * sin,
      y: baseAim.x * sin + baseAim.y * cos,
    };
    const speed = (monster.boss ? 78 : monster.midboss ? 68 : monster.type === "bubbler" ? 52 : 62) * WORLD_SCALE;
    state.projectiles.push({
      x: c.x,
      y: c.y,
      vx: aim.x * speed,
      vy: aim.y * speed,
      r: worldPx(monster.boss ? 4 : monster.midboss ? 3 : 3),
      damage: monster.boss ? 14 : monster.midboss ? 11 : monster.type === "bubbler" ? 6 : 8,
      color: projectileColor,
      source: monster.boss ? "dragon" : monster.midboss ? monster.type : monster.type,
      life: monster.boss ? 1500 : monster.midboss ? 1350 : 1200,
    });
    addSlash(c.x + aim.x * worldPx(8), c.y + aim.y * worldPx(8), monster.dir, projectileColor);
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
      if (isBlockedTile(tileAt(tx, ty), { flying: false })) {
        burst(p.x, p.y, p.color, 4);
        return false;
      }

      const hitbox = { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 };
      if (rectsOverlap(player, hitbox)) {
        if (player.invuln <= 0 && player.hp > 0) {
          const source = p.source === "wisp" || p.source === "dragon" ? "fire" : "projectile";
          let hurt = Math.max(1, Math.round((p.damage - Math.floor(playerDefense() * 0.45)) * armorDamageMultiplier({ boss: p.source === "dragon" }, 0, source)));
          if (p.source === "dragon" && hurt < 3) hurt = 3;
          if (p.source === "guardian" && hurt < 2) hurt = 2;
          if (p.source === "warden" && hurt < 2) hurt = 2;
          if (player.guard > 0) hurt = Math.floor(hurt * 0.3);
          player.hp = Math.max(0, player.hp - hurt);
          player.invuln = 320;
          state.shake = Math.max(state.shake, 120);
          addFloater(player.x + player.w / 2, player.y, String(hurt), "#ffeb61");
          burst(player.x + player.w / 2, player.y + player.h / 2, p.color, 8);
          if (player.hp <= 0) {
            state.gameOver = true;
            say("倒れた... Rで再挑戦", 5000);
          }
          if (p.source === "wisp" || p.source === "dragon") {
            player.burn = Math.max(player.burn, p.source === "dragon" ? 2600 : 1500);
          } else if (p.source === "bubbler") {
            player.slow = Math.max(player.slow, 1400);
            player.stamina = Math.max(0, player.stamina - 6);
            addFloater(player.x + player.w / 2, player.y - worldPx(7), "泡", "#8dd7ff");
          } else if (p.source === "guardian") {
            player.slow = Math.max(player.slow, 1500);
          } else if (p.source === "warden") {
            player.slow = Math.max(player.slow, 900);
            player.stamina = Math.max(0, player.stamina - 10);
          }
        }
        return false;
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
