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

  const worldMapData = globalThis.DRAGON_HUNTER_WORLD_MAP;
  if (!worldMapData) {
    throw new Error("DRAGON_HUNTER_WORLD_MAP must be loaded before map helpers");
  }

  const {
    TILE,
    WORLD_SCALE,
    MAP_W,
    MAP_H,
    TOWN_GATES,
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

  const { centerOf } = mathHelpers;
  const { rows: WORLD_MAP, objects: WORLD_OBJECTS = [] } = worldMapData;
  const TILE_BY_CHAR = {
    ".": TILE_GRASS,
    "+": TILE_PATH,
    "~": TILE_WATER,
    "T": TILE_TREE,
    "#": TILE_WALL,
    "^": TILE_ROOF,
    "_": TILE_FLOOR,
    "C": TILE_CAVE,
    "*": TILE_FLOWER,
    "=": TILE_FIELD,
  };

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
    validateWorldMap();
    state.map = [];
    for (let y = 0; y < MAP_H; y += 1) {
      const row = WORLD_MAP[y];
      for (let x = 0; x < MAP_W; x += 1) {
        state.map.push(TILE_BY_CHAR[row[x]] ?? TILE_GRASS);
      }
    }
    state.npcs = WORLD_OBJECTS.filter((object) => object.type === "npc").map(objectToNpc);
  }

  function validateWorldMap() {
    if (worldMapData.width !== MAP_W || worldMapData.height !== MAP_H) {
      throw new Error(`WORLD_MAP size ${worldMapData.width}x${worldMapData.height} must match definitions ${MAP_W}x${MAP_H}`);
    }
    if (!Array.isArray(WORLD_MAP) || WORLD_MAP.length !== MAP_H) {
      throw new Error(`WORLD_MAP must contain ${MAP_H} rows`);
    }
    for (let y = 0; y < MAP_H; y += 1) {
      const row = WORLD_MAP[y];
      if (typeof row !== "string" || row.length !== MAP_W) {
        throw new Error(`WORLD_MAP row ${y} must be a ${MAP_W}-character string`);
      }
      for (let x = 0; x < MAP_W; x += 1) {
        if (!(row[x] in TILE_BY_CHAR)) {
          throw new Error(`WORLD_MAP has unknown tile '${row[x]}' at ${x},${y}`);
        }
      }
    }
  }

  function objectToNpc(object) {
    return {
      x: object.x * TILE + (object.offsetX || 0) * WORLD_SCALE,
      y: object.y * TILE + (object.offsetY || 0) * WORLD_SCALE,
      w: (object.w || 10) * WORLD_SCALE,
      h: (object.h || 12) * WORLD_SCALE,
      dir: object.dir || "down",
      type: object.npcType,
    };
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
