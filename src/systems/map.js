"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before map helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before map helpers");
  }

  const {
    TILE,
    WORLD_SCALE,
    MAP_W,
    MAP_H,
    TOWN_GATES,
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    GUARDIAN_SITE,
    TILE_GRASS,
    TILE_PATH,
    TILE_WATER,
    TILE_TREE,
    TILE_WALL,
    TILE_ROOF,
    TILE_FLOOR,
    TILE_CAVE,
    TILE_FLOWER,
    TILE_FIELD,
  } = definitions;

  const { hashNoise, centerOf } = mathHelpers;

  function requireMapContext(context) {
    if (!context?.state) {
      throw new Error("map helpers require { state }");
    }
    return context;
  }

  function tileAt(context, tx, ty) {
    const { state } = requireMapContext(context);
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return TILE_WALL;
    return state.map[ty * MAP_W + tx];
  }

  function setTile(context, tx, ty, tile) {
    const { state } = requireMapContext(context);
    if (tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H) {
      state.map[ty * MAP_W + tx] = tile;
    }
  }

  function isBlockedTile(_context, tile, actor) {
    if (tile === TILE_WATER) return !actor?.flying;
    return tile === TILE_TREE || tile === TILE_WALL || tile === TILE_ROOF;
  }

  function inTownTile(_context, tx, ty) {
    return tx >= 5 && tx <= 18 && ty >= 39 && ty <= 55;
  }

  function inTown(_context, x, y) {
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    return tx >= 4 && tx <= 19 && ty >= 38 && ty <= 57;
  }

  function tileInGate(_context, tx, ty) {
    return TOWN_GATES.some((gate) => tx >= gate.x && tx < gate.x + gate.w && ty >= gate.y && ty < gate.y + gate.h);
  }

  function blocksClosedTownGate(context, actor, tx, ty) {
    const { state } = requireMapContext(context);
    if (!actor?.isMonster || state.townGateOpen) return false;
    const current = centerOf(actor);
    const currentTx = Math.floor(current.x / TILE);
    const currentTy = Math.floor(current.y / TILE);
    if (inTownTile(context, currentTx, currentTy)) return false;
    if (!inTownTile(context, tx, ty)) return false;
    return true;
  }

  function blocksTownEntry(context, actor, x, y) {
    const { state } = requireMapContext(context);
    if (!actor?.isMonster) return false;
    const current = centerOf(actor);
    const next = { x: x + actor.w / 2, y: y + actor.h / 2 };
    const currentTile = { x: Math.floor(current.x / TILE), y: Math.floor(current.y / TILE) };
    const nextTile = { x: Math.floor(next.x / TILE), y: Math.floor(next.y / TILE) };
    const wasInside = inTownTile(context, currentTile.x, currentTile.y);
    const willBeInside = inTownTile(context, nextTile.x, nextTile.y);
    if (wasInside === willBeInside) return false;
    if (!state.townGateOpen) return true;
    return !(tileInGate(context, currentTile.x, currentTile.y) || tileInGate(context, nextTile.x, nextTile.y));
  }

  function isPassableRect(context, actor, x = actor.x, y = actor.y) {
    if (blocksTownEntry(context, actor, x, y)) return false;
    const left = Math.floor(x / TILE);
    const right = Math.floor((x + actor.w - 1) / TILE);
    const top = Math.floor(y / TILE);
    const bottom = Math.floor((y + actor.h - 1) / TILE);
    for (let ty = top; ty <= bottom; ty += 1) {
      for (let tx = left; tx <= right; tx += 1) {
        if (isBlockedTile(context, tileAt(context, tx, ty), actor)) return false;
        if (blocksClosedTownGate(context, actor, tx, ty)) return false;
      }
    }
    return true;
  }

  function createMap(context) {
    const { state } = requireMapContext(context);
    state.map = Array.from({ length: MAP_W * MAP_H }, () => TILE_GRASS);

    for (let y = 0; y < MAP_H; y += 1) {
      for (let x = 0; x < MAP_W; x += 1) {
        const n = hashNoise(x, y);
        if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) setTile(context, x, y, TILE_TREE);
        else if (n > 0.86) setTile(context, x, y, TILE_FLOWER);
        else if (n < 0.06) setTile(context, x, y, TILE_FIELD);
      }
    }

    for (let y = 3; y < MAP_H - 2; y += 1) {
      const riverX = 44 + Math.floor(Math.sin(y * 0.37) * 4);
      for (let x = riverX; x < riverX + 4; x += 1) setTile(context, x, y, TILE_WATER);
    }

    fillEllipse(context, 16, 15, 9, 7, TILE_TREE);
    fillEllipse(context, 47, 43, 11, 8, TILE_TREE);
    fillEllipse(context, 55, 15, 8, 7, TILE_WALL);

    for (let x = 7; x <= 55; x += 1) setTile(context, x, 49, TILE_PATH);
    for (let y = 13; y <= 53; y += 1) setTile(context, 11, y, TILE_PATH);
    for (let y = 39; y <= 55; y += 1) {
      for (let x = 5; x <= 17; x += 1) setTile(context, x, y, TILE_FLOOR);
    }
    for (let x = 8; x <= 13; x += 1) setTile(context, x, 49, TILE_PATH);
    for (let y = 44; y <= 51; y += 1) setTile(context, 16, y, TILE_PATH);
    placeHouse(context, 6, 40, 5, 5);
    placeHouse(context, 13, 41, 5, 5);
    placeHouse(context, 7, 52, 6, 4);

    for (let x = 47; x <= 55; x += 1) {
      for (let y = 10; y <= 18; y += 1) {
        if (x === 47 || x === 55 || y === 10 || y === 18) setTile(context, x, y, TILE_WALL);
        else setTile(context, x, y, TILE_PATH);
      }
    }
    setTile(context, 51, 18, TILE_CAVE);
    setTile(context, 51, 17, TILE_CAVE);
    ensureRewardSitesReachable(context);

    state.npcs = [
      { x: 9 * TILE + 3 * WORLD_SCALE, y: 47 * TILE + 2 * WORLD_SCALE, w: 10 * WORLD_SCALE, h: 12 * WORLD_SCALE, dir: "down", type: "elder" },
      { x: 15 * TILE + 4 * WORLD_SCALE, y: 48 * TILE + 1 * WORLD_SCALE, w: 10 * WORLD_SCALE, h: 12 * WORLD_SCALE, dir: "left", type: "smith" },
      { x: 13 * TILE + 3 * WORLD_SCALE, y: 43 * TILE + 2 * WORLD_SCALE, w: 10 * WORLD_SCALE, h: 12 * WORLD_SCALE, dir: "down", type: "healer" },
    ];
  }

  function ensureRewardSitesReachable(context) {
    for (const chest of TREASURE_CHESTS) {
      carveRewardClearing(context, chest.x, chest.y);
    }
    for (const discovery of DISCOVERY_POINTS) {
      carveRewardClearing(context, discovery.x, discovery.y);
    }
    carveRewardClearing(context, GUARDIAN_SITE.x, GUARDIAN_SITE.y);
  }

  function carveRewardClearing(context, cx, cy) {
    for (let y = cy - 1; y <= cy + 1; y += 1) {
      for (let x = cx - 1; x <= cx + 1; x += 1) {
        if (x <= 0 || y <= 0 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
        const tile = tileAt(context, x, y);
        if (tile === TILE_WALL || tile === TILE_ROOF || tile === TILE_TREE || tile === TILE_WATER) {
          setTile(context, x, y, inTownTile(context, x, y) ? TILE_FLOOR : TILE_PATH);
        }
      }
    }
  }

  function fillEllipse(context, cx, cy, rx, ry, tile) {
    for (let y = cy - ry; y <= cy + ry; y += 1) {
      for (let x = cx - rx; x <= cx + rx; x += 1) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) setTile(context, x, y, tile);
      }
    }
  }

  function placeHouse(context, tx, ty, tw, th) {
    for (let y = ty; y < ty + th; y += 1) {
      for (let x = tx; x < tx + tw; x += 1) {
        if (y === ty) setTile(context, x, y, TILE_ROOF);
        else if (x === tx || x === tx + tw - 1 || y === ty + th - 1) setTile(context, x, y, TILE_WALL);
        else setTile(context, x, y, TILE_FLOOR);
      }
    }
    setTile(context, tx + Math.floor(tw / 2), ty + th - 1, TILE_FLOOR);
  }

  globalThis.DRAGON_HUNTER_MAP = {
    tileAt,
    setTile,
    isBlockedTile,
    inTownTile,
    inTown,
    tileInGate,
    isPassableRect,
    createMap,
  };
})();
