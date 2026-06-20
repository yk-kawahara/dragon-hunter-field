"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before render helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before render helpers");
  }

  const {
    W: CANVAS_W,
    H: CANVAS_H,
    VIEW_H: CANVAS_VIEW_H,
    HUD_H: CANVAS_HUD_H,
    TILE: WORLD_TILE,
    BASE_TILE,
    WORLD_SCALE,
    HEAL_POINTS,
    TOWN_GATES,
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    GUARDIAN_SITE,
    WARDEN_SITE,
    WARDEN_REQUIREMENTS,
    ASH_KNIGHT_SITE,
    ASH_KNIGHT_REQUIREMENTS,
    ECLIPSE_DRAGON_SITE,
    CHAPTER2_REQUIREMENTS,
    VOID_DRAGON_SITE,
    CHAPTER3_REQUIREMENTS,
    OBSIDIAN_GOLEM_SITE,
    OBSIDIAN_GOLEM_REQUIREMENTS,
    FROST_GOLEM_SITE,
    FROST_GOLEM_REQUIREMENTS,
    FROST_DRAGON_SITE,
    CHAPTER4_REQUIREMENTS,
    weaponNames,
    armorNames,
    weaponTraits,
    armorTraits,
    weaponAttack,
    armorDefense,
    shieldNames,
    shieldTraits,
    shieldGuard,
    itemOrder,
    itemNames,
    itemSellValues,
    weaponSellValues,
    armorSellValues,
    shieldSellValues,
    accessoryData,
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

  const RENDER_SCALE = WORLD_SCALE || (WORLD_TILE / (BASE_TILE || 16)) || 1;
  const W = CANVAS_W / RENDER_SCALE;
  const H = CANVAS_H / RENDER_SCALE;
  const VIEW_H = CANVAS_VIEW_H / RENDER_SCALE;
  const HUD_H = CANVAS_HUD_H / RENDER_SCALE;
  const TILE = WORLD_TILE / RENDER_SCALE;

  function worldToDraw(value) {
    return value / RENDER_SCALE;
  }

  function screenX(worldX, cam) {
    return worldToDraw(worldX) - cam.x;
  }

  function screenY(worldY, cam) {
    return worldToDraw(worldY) - cam.y;
  }

  function worldTileX(worldX) {
    return Math.floor(worldX / WORLD_TILE);
  }

  function worldTileY(worldY) {
    return Math.floor(worldY / WORLD_TILE);
  }

  const {
    clamp,
    hashNoise,
    centerOf,
  } = mathHelpers;

  let canvas;
  let ctx;
  let ui;
  let state;
  let player;
  let getCamera;
  let tileAt;
  let inTownTile;
  let inTown;
  let currentRegion;
  let areaDangerText;
  let objectiveText;
  let guidanceText;
  let contextPromptText;
  let selectedItemCount;

  const PLAYER_SPRITE_SIZE = 32;
  const PLAYER_DRAW_SIZE = 22;
  const NPC_DRAW_SCALE = 1.18;

  // Primary player sprite loading mode:
  //   assets/player/<direction>_<pose>.png
  //
  // This keeps each generated 32x32 frame independent, so the game no longer
  // depends on a perfectly aligned 256x32 sprite strip during development.
  const PLAYER_SPRITE_PATHS = {
    down: { idle: "assets/player/down_idle.png", walk: "assets/player/down_walk.png" },
    left: { idle: "assets/player/left_idle.png", walk: "assets/player/left_walk.png" },
    right: { idle: "assets/player/right_idle.png", walk: "assets/player/right_walk.png" },
    up: { idle: "assets/player/up_idle.png", walk: "assets/player/up_walk.png" },
  };

  const itemRenderDetails = {
    potion: "HP",
    tonic: "ST",
    bomb: "範囲",
    ward: "防御",
    elixir: "全快",
    warp: "帰還",
  };
  const itemRenderFields = {
    potion: "potions",
    tonic: "tonics",
    bomb: "bombs",
    ward: "wards",
    elixir: "elixirs",
    warp: "warps",
  };

function playerItemCount(id) {
  return player?.[itemRenderFields[id]] || 0;
}

function equippedAccessoryIds() {
  if (Array.isArray(player?.equippedAccessories) && player.equippedAccessories.length > 0) {
    return player.equippedAccessories.filter((id) => player.ownedAccessories?.includes(id));
  }
  return player?.equippedAccessory ? [player.equippedAccessory] : [];
}

  // Optional legacy fallback:
  //   assets/player.png
  //   256x32 strip ordered down idle, down walk, left idle, left walk,
  //   right idle, right walk, up idle, up walk.
  const PLAYER_SPRITE_FRAMES = {
    down: { idle: 0, walk: 1 },
    left: { idle: 2, walk: 3 },
    right: { idle: 4, walk: 5 },
    up: { idle: 6, walk: 7 },
  };

  function loadPlayerSpriteFrames(paths) {
    const images = {};
    for (const [dir, poses] of Object.entries(paths)) {
      images[dir] = {};
      for (const [pose, src] of Object.entries(poses)) {
        const image = new Image();
        image.src = src;
        images[dir][pose] = image;
      }
    }
    return images;
  }

  function imageReady(image) {
    return Boolean(image && image.complete && image.naturalWidth > 0);
  }

  const playerSpriteImages = loadPlayerSpriteFrames(PLAYER_SPRITE_PATHS);
  const playerSpriteImage = new Image();
  playerSpriteImage.src = "assets/player.png";


  function useRenderContext(context) {
    if (!context?.canvas || !context?.ctx || !context?.ui || !context?.state || !context?.player) {
      throw new Error("render helpers require { canvas, ctx, ui, state, player }");
    }
    if (!context.getCamera || !context.tileAt || !context.inTownTile || !context.inTown) {
      throw new Error("render helpers require map/camera helpers");
    }
    if (!context.currentRegion || !context.areaDangerText || !context.objectiveText || !context.guidanceText || !context.contextPromptText || !context.selectedItemCount) {
      throw new Error("render helpers require text/status helpers");
    }
    ({
      canvas,
      ctx,
      ui,
      state,
      player,
      getCamera,
      tileAt,
      inTownTile,
      inTown,
      currentRegion,
      areaDangerText,
      objectiveText,
      guidanceText,
      contextPromptText,
      selectedItemCount,
    } = context);
  }

function draw(context) {
  useRenderContext(context);
  const worldCam = getCamera();
  const cam = { x: worldToDraw(worldCam.x), y: worldToDraw(worldCam.y) };

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.save();
  ctx.scale(RENDER_SCALE, RENDER_SCALE);

  drawWorld(cam);
  drawWorldAtmosphere(cam);
  drawCatacombDetails(cam);
  drawFieldDetails(cam);
  drawTownDetails(cam);
  drawFrontierCampDetails(cam);
  drawAshHamletDetails(cam);
  drawMoonCampDetails(cam);
  drawBlackMarketDetails(cam);
  drawBlackFortDetails(cam);
  drawFrostHavenDetails(cam);
  drawVillageRoleMarkers(cam);
  drawTravelMarkers(cam);
  drawHealCircle(cam);
  drawTownFence(cam);
  drawTownGates(cam);
  drawChests(cam);
  drawDiscoveries(cam);
  drawGuardianSite(cam);
  drawWardenSite(cam);
  drawAshKnightSite(cam);
  drawEclipseDragonSite(cam);
  drawObsidianGolemSite(cam);
  drawVoidDragonSite(cam);
  drawFrostGolemSite(cam);
  drawFrostDragonSite(cam);
  drawNpcs(cam);
  drawEntities(cam);
  drawEffects(cam);
  drawScreenGrade(cam);
  drawObjective();
  drawContextPrompt();
  drawHud();
  drawInfoPanel();
  drawShopOverlay();
  drawInventoryOverlay();

  if (state.gameOver) drawOverlay("GAME OVER", "R");
  if ((state.victory && !state.elderReported) || state.chapter2Victory || state.chapter3Victory || state.chapter4Victory) drawVictoryBanner();
  if (state.clearPanelOpen) drawEndingOverlay();

  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawInfoPanel() {
  const panel = state.infoPanel;
  if (!panel || performance.now() > panel.until) return;
  const x = 37;
  const y = 17;
  const w = 166;
  const h = 58;
  ctx.fillStyle = "rgba(5, 8, 18, 0.9)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#6de4ff";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "9px monospace";
  ctx.textAlign = "left";
  ctx.fillText(panel.title, x + 7, y + 12);
  ctx.fillStyle = "#ffffff";
  ctx.font = "8px monospace";
  for (let i = 0; i < panel.lines.length; i += 1) {
    ctx.fillText(panel.lines[i], x + 7, y + 25 + i * 11);
  }
}

function drawShopOverlay() {
  if (!state.shopOpen) return;
  const x = 14;
  const y = 16;
  const w = W - 28;
  const h = VIEW_H - 28;
  const rows = Array.isArray(state.shopRows) ? state.shopRows : [];
  const selected = Math.max(0, Math.min(state.shopIndex || 0, Math.max(0, rows.length - 1)));
  const first = Math.max(0, Math.min(Math.max(0, selected - 4), Math.max(0, rows.length - 7)));
  const selectedRow = rows[selected] || null;

  ctx.fillStyle = "rgba(3, 8, 18, 0.95)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#ffd166";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#fff2a6";
  ctx.font = "9px monospace";
  ctx.textAlign = "left";
  ctx.fillText(state.shopTitle || "店", x + 7, y + 12);
  ctx.fillStyle = "#8dd7ff";
  ctx.fillText(`所持金 ${player.gold}G`, x + w - 80, y + 12);

  ctx.font = "8px monospace";
  for (let i = 0; i < 7; i += 1) {
    const row = rows[first + i];
    const rowY = y + 30 + i * 13;
    if (!row) continue;
    if (first + i === selected) {
      ctx.fillStyle = "rgba(255, 209, 102, 0.25)";
      ctx.fillRect(x + 5, rowY - 9, w - 10, 12);
      ctx.strokeStyle = "#ffd166";
      ctx.strokeRect(x + 5, rowY - 9, w - 10, 12);
    }
    const owned = row.owned || (row.type === "weapon" && player.ownedWeapons?.includes(row.id)) || (row.type === "armor" && player.ownedArmors?.includes(row.id)) || (row.type === "shield" && player.ownedShields?.includes(row.id)) || (row.type === "accessory" && player.ownedAccessories?.includes(row.id));
    ctx.fillStyle = row.available === false ? "#687383" : owned ? "#74ff8f" : "#ffffff";
    ctx.fillText(`${owned ? "済 " : "  "}${row.name}`, x + 9, rowY);
    ctx.fillStyle = row.available === false ? "#6f7780" : "#d7e2ea";
    ctx.fillText(row.available === false ? (row.lockedReason || "") : "", x + 116, rowY, w - 166);
    ctx.fillStyle = player.gold >= row.cost && row.available !== false ? "#fff2a6" : "#ff9a8a";
    ctx.fillText(`${row.cost || 0}G`, x + w - 39, rowY);
  }
  ctx.fillStyle = "#8dd7ff";
  ctx.font = "7px monospace";
  if (selectedRow) {
    ctx.fillStyle = selectedRow.available === false ? "#ff9a8a" : "#d7e2ea";
    ctx.fillText(selectedRow.available === false ? (selectedRow.lockedReason || selectedRow.detail || "") : (selectedRow.detail || ""), x + 7, y + h - 17, w - 14);
  }
  ctx.fillStyle = "#8dd7ff";
  ctx.fillText(selectedRow?.type === "shieldRune" ? "↑↓選択  Enter:刻む  Esc/S:閉じる" : "↑↓選択  Enter:買う  Esc/S:閉じる", x + 7, y + h - 7);
}

function drawInventoryOverlay() {
  if (!state.inventoryOpen) return;
  const x = 12;
  const y = 15;
  const w = W - 24;
  const h = VIEW_H - 25;
  const tabs = ["items", "weapons", "armors", "shields", "accessories"];
  const labels = { items: "道具", weapons: "武器", armors: "防具", accessories: "装飾" };
  if (!tabs.includes(state.inventoryTab)) state.inventoryTab = "items";
  const rows = inventoryRenderRows(state.inventoryTab);
  const selected = Math.max(0, Math.min(state.inventoryIndex || 0, Math.max(0, rows.length - 1)));
  const first = Math.max(0, Math.min(Math.max(0, selected - 3), Math.max(0, rows.length - 6)));

  ctx.fillStyle = "rgba(3, 8, 18, 0.94)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#6de4ff";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#fff2a6";
  ctx.font = "9px monospace";
  ctx.textAlign = "left";
  ctx.fillText("もちもの", x + 7, y + 12);

  for (let i = 0; i < tabs.length; i += 1) {
    const tabX = x + 7 + i * 37;
    const active = tabs[i] === state.inventoryTab;
    ctx.fillStyle = active ? "#ffd166" : "#1a3045";
    ctx.fillRect(tabX, y + 18, 32, 12);
    ctx.fillStyle = active ? "#08111c" : "#d7e2ea";
    ctx.fillText(tabs[i] === "shields" ? "盾" : (labels[tabs[i]] || tabs[i]), tabX + 3, y + 27);
  }

  ctx.font = "8px monospace";
  for (let i = 0; i < 6; i += 1) {
    const row = rows[first + i];
    const rowY = y + 41 + i * 13;
    if (!row) continue;
    if (first + i === selected) {
      ctx.fillStyle = "rgba(255, 209, 102, 0.25)";
      ctx.fillRect(x + 5, rowY - 9, w - 10, 12);
      ctx.strokeStyle = "#ffd166";
      ctx.strokeRect(x + 5, rowY - 9, w - 10, 12);
    }
    ctx.fillStyle = row.equipped ? "#74ff8f" : "#ffffff";
    ctx.fillText(`${row.equipped ? "E " : "  "}${row.name}`, x + 9, rowY);
    ctx.fillStyle = "#d7e2ea";
    ctx.fillText(row.detail, x + 82, rowY, w - 123);
    ctx.fillStyle = row.sell > 0 ? "#fff2a6" : "#687383";
    ctx.fillText(row.sell > 0 ? `${row.sell}G` : "-", x + w - 35, rowY);
  }

  ctx.fillStyle = "#8dd7ff";
  ctx.font = "7px monospace";
  ctx.fillText("←→カテゴリ  ↑↓選択  Enter:使う/装備  S:売る  Esc:閉じる", x + 7, y + h - 7);
}

function inventoryRenderRows(tab) {
  const baseAttack = Number.isFinite(player.strength) ? player.strength : 7 + player.level * 2;
  const baseDefense = Number.isFinite(player.resilience) ? player.resilience : 1 + player.level;
  const currentAttack = baseAttack + (weaponAttack[player.weapon] || 0);
  const currentDefense = baseDefense + (armorDefense[player.armor] || 0);
  const diffText = (value) => value === 0 ? "+0" : value > 0 ? `+${value}` : String(value);
  if (tab === "items") {
    return itemOrder.map((id) => ({
      name: itemNames[id] || id,
      detail: `${itemRenderDetails[id] || ""} x${playerItemCount(id)}`,
      sell: itemSellValues[id] || 0,
    }));
  }
  if (tab === "weapons") {
    const owned = Array.isArray(player.ownedWeapons) ? player.ownedWeapons : [player.weapon || 0];
    return owned.map((rank) => ({
      name: weaponNames[rank] || `武器${rank}`,
      detail: `${weaponTraits[rank] || ""} ATK ${baseAttack + (weaponAttack[rank] || 0)} (${diffText(baseAttack + (weaponAttack[rank] || 0) - currentAttack)})`,
      sell: weaponSellValues[rank] || 0,
      equipped: player.weapon === rank,
    }));
  }
  if (tab === "armors") {
    const owned = Array.isArray(player.ownedArmors) ? player.ownedArmors : [player.armor || 0];
    return owned.map((rank) => ({
      name: armorNames[rank] || `防具${rank}`,
      detail: `${armorTraits[rank] || ""} DEF ${baseDefense + (armorDefense[rank] || 0)} (${diffText(baseDefense + (armorDefense[rank] || 0) - currentDefense)})`,
      sell: armorSellValues[rank] || 0,
      equipped: player.armor === rank,
    }));
  }
  if (tab === "shields") {
    const ownedShields = Array.isArray(player.ownedShields) ? player.ownedShields : [player.shield || 0];
    return ownedShields.map((rank) => ({
      name: shieldNames[rank] || `盾${rank}`,
      detail: `${shieldTraits[rank] || ""} 正面${Math.round((1 - (shieldGuard[rank] || 1)) * 100)}%軽減`,
      sell: shieldSellValues[rank] || 0,
      equipped: player.shield === rank,
    }));
  }
  const owned = Array.isArray(player.ownedAccessories) ? player.ownedAccessories : [];
  const equippedIds = equippedAccessoryIds();
  return owned.map((id) => ({
    name: accessoryData[id]?.name || id,
    detail: accessoryData[id]?.trait || "",
    sell: 0,
    equipped: equippedIds.includes(id),
  }));
}

function drawWorld(cam) {
  const startX = Math.floor(cam.x / TILE);
  const startY = Math.floor(cam.y / TILE);
  const endX = Math.ceil((cam.x + W) / TILE);
  const endY = Math.ceil((cam.y + VIEW_H) / TILE);
  for (let ty = startY; ty <= endY; ty += 1) {
    for (let tx = startX; tx <= endX; tx += 1) {
      drawTile(tileAt(tx, ty), tx * TILE - cam.x, ty * TILE - cam.y, tx, ty);
    }
  }
}

function drawWorldAtmosphere(cam) {
  const time = performance.now();
  const tx = worldTileX(player.x + player.w / 2);
  const ty = worldTileY(player.y + player.h / 2);

  if (ty >= 144) {
    ctx.fillStyle = "rgba(190, 232, 248, 0.22)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 23 + Math.floor(time / 75)) % W;
      const y = (i * 31 + Math.floor(time / 120)) % VIEW_H;
      ctx.fillStyle = i % 3 ? "#d9f7ff" : "#8dd7ff";
      ctx.fillRect(x, y, 1, 1);
    }
  } else if (tx >= 80 && tx <= 119 && ty >= 1 && ty <= 14) {
    ctx.fillStyle = "rgba(18, 9, 14, 0.46)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 12; i += 1) {
      const x = (i * 29 + Math.floor(time / 180)) % W;
      const y = (i * 17 + Math.floor(time / 240)) % VIEW_H;
      ctx.fillStyle = i % 3 ? "#d7b26d" : "#d78ab7";
      ctx.fillRect(x, y, 1, 1);
    }
  } else if (ty >= 128 && tx <= 58) {
    ctx.fillStyle = "rgba(16, 14, 20, 0.28)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 16; i += 1) {
      const x = (i * 19 + Math.floor(time / 95)) % W;
      const y = (i * 31 + Math.floor(time / 145)) % VIEW_H;
      ctx.fillStyle = i % 2 ? "#7f8cff" : "#d7e2ea";
      ctx.fillRect(x, y, 1, 1);
    }
  } else if (ty >= 128) {
    ctx.fillStyle = "rgba(4, 5, 18, 0.38)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 23 + Math.floor(time / 80)) % W;
      const y = (i * 29 + Math.floor(time / 120)) % VIEW_H;
      ctx.fillStyle = i % 3 ? "#d8d8ff" : "#6de4ff";
      ctx.fillRect(x, y, 1, 1);
    }
  } else if (ty >= 112) {
    ctx.fillStyle = "rgba(64, 18, 96, 0.22)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 14; i += 1) {
      const x = (i * 31 + Math.floor(time / 110)) % W;
      const y = (i * 23 + Math.floor(time / 170)) % VIEW_H;
      ctx.fillStyle = i % 2 ? "#e36dff" : "#9fb3ff";
      ctx.fillRect(x, y, 1, 1);
    }
  } else if (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 19) {
    ctx.fillStyle = "rgba(75, 24, 18, 0.22)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 12; i += 1) {
      const x = (i * 29 + Math.floor(time / 90)) % W;
      const y = (i * 17 + Math.floor(time / 140)) % VIEW_H;
      ctx.fillStyle = i % 2 ? "#ff9a3d" : "#ffd166";
      ctx.fillRect(x, y, 1, 1);
    }
  } else if (tx > 38 || ty < 24) {
    ctx.fillStyle = "rgba(8, 40, 24, 0.12)";
    ctx.fillRect(0, 0, W, VIEW_H);
    for (let i = 0; i < 10; i += 1) {
      const x = (i * 37 + Math.floor(time / 130)) % W;
      const y = (i * 19 + Math.floor(time / 210)) % VIEW_H;
      ctx.fillStyle = "#bafc87";
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawCatacombDetails(cam) {
  const tx = worldTileX(player.x + player.w / 2);
  const ty = worldTileY(player.y + player.h / 2);
  if (tx < 80 || tx > 119 || ty < 1 || ty > 14) return;
  drawLamp(85 * TILE - cam.x, 2 * TILE - cam.y);
  drawLamp(101 * TILE - cam.x, 6 * TILE - cam.y);
  drawLamp(114 * TILE - cam.x, 11 * TILE - cam.y);
  drawCrates(90 * TILE - cam.x, 7 * TILE - cam.y);
  drawSign(99 * TILE - cam.x, 10 * TILE - cam.y);
}

function drawFrostHavenDetails(cam) {
  const ty = worldTileY(player.y + player.h / 2);
  if (ty < 144) return;
  drawWell(24 * TILE - cam.x, 152 * TILE - cam.y);
  drawLamp(14 * TILE - cam.x, 153 * TILE - cam.y);
  drawLamp(33 * TILE - cam.x, 153 * TILE - cam.y);
  drawCrates(29 * TILE - cam.x, 151 * TILE - cam.y);
  drawSign(24 * TILE - cam.x, 149 * TILE - cam.y);
  drawCampfire(20 * TILE - cam.x, 154 * TILE - cam.y);
}

function drawTownDetails(cam) {
  drawWell(8 * TILE - cam.x, 46 * TILE - cam.y);
  drawBench(9 * TILE - cam.x, 50 * TILE - cam.y, "x");
  drawBench(14 * TILE - cam.x, 50 * TILE - cam.y, "x");
  drawCrates(16 * TILE - cam.x, 52 * TILE - cam.y);
  drawFlowerBed(6 * TILE - cam.x, 51 * TILE - cam.y);
  drawFlowerBed(14 * TILE - cam.x, 45 * TILE - cam.y);
  drawLamp(17 * TILE - cam.x, 46 * TILE - cam.y);
  drawLamp(6 * TILE - cam.x, 46 * TILE - cam.y);
  drawSign(12 * TILE - cam.x, 48 * TILE - cam.y);
}

function drawFrontierCampDetails(cam) {
  drawCampBoundary(cam);
  drawTent(26 * TILE - cam.x, 57 * TILE - cam.y, "#6de4ff");
  drawTent(33 * TILE - cam.x, 57 * TILE - cam.y, "#c98945");
  drawCrates(25 * TILE - cam.x, 60 * TILE - cam.y);
  drawCampfire(29 * TILE - cam.x, 59 * TILE - cam.y);
  drawLamp(34 * TILE - cam.x, 59 * TILE - cam.y);
  drawRoleMarker(31 * TILE - cam.x, 58 * TILE - cam.y, "回", "#6de4ff");
  drawRoleMarker(33 * TILE - cam.x, 58 * TILE - cam.y, "補", "#fff2a6");
}

function drawAshHamletDetails(cam) {
  drawTent(96 * TILE - cam.x, 54 * TILE - cam.y, "#b990ff");
  drawTent(105 * TILE - cam.x, 54 * TILE - cam.y, "#6de4ff");
  drawCrates(108 * TILE - cam.x, 58 * TILE - cam.y);
  drawCampfire(101 * TILE - cam.x, 57 * TILE - cam.y);
  drawLamp(110 * TILE - cam.x, 57 * TILE - cam.y);
  drawRoleMarker(102 * TILE - cam.x, 57 * TILE - cam.y, "回", "#6de4ff");
  drawRoleMarker(108 * TILE - cam.x, 57 * TILE - cam.y, "星", "#b990ff");
  drawSign(99 * TILE - cam.x, 58 * TILE - cam.y);
}

function drawMoonCampDetails(cam) {
  drawTent(96 * TILE - cam.x, 114 * TILE - cam.y, "#e36dff");
  drawTent(105 * TILE - cam.x, 114 * TILE - cam.y, "#7f8cff");
  drawCrates(108 * TILE - cam.x, 117 * TILE - cam.y);
  drawCampfire(101 * TILE - cam.x, 116 * TILE - cam.y);
  drawLamp(110 * TILE - cam.x, 116 * TILE - cam.y);
  drawRoleMarker(102 * TILE - cam.x, 115 * TILE - cam.y, "回", "#6de4ff");
  drawRoleMarker(108 * TILE - cam.x, 115 * TILE - cam.y, "蝕", "#e36dff");
  drawSign(99 * TILE - cam.x, 117 * TILE - cam.y);
}

function drawBlackMarketDetails(cam) {
  drawTent(24 * TILE - cam.x, 132 * TILE - cam.y, "#5f668f");
  drawTent(31 * TILE - cam.x, 132 * TILE - cam.y, "#ffd166");
  drawTent(39 * TILE - cam.x, 132 * TILE - cam.y, "#b990ff");
  drawTent(45 * TILE - cam.x, 134 * TILE - cam.y, "#8dd7ff");
  drawCrates(27 * TILE - cam.x, 136 * TILE - cam.y);
  drawCrates(36 * TILE - cam.x, 135 * TILE - cam.y);
  drawCampfire(34 * TILE - cam.x, 134 * TILE - cam.y);
  drawLamp(21 * TILE - cam.x, 133 * TILE - cam.y);
  drawLamp(47 * TILE - cam.x, 133 * TILE - cam.y);
  drawRoleMarker(35 * TILE - cam.x, 130 * TILE - cam.y, "B", "#ffd166");
  drawRoleMarker(40 * TILE - cam.x, 131 * TILE - cam.y, "?", "#b990ff");
  drawRoleMarker(35 * TILE - cam.x, 134 * TILE - cam.y, "H", "#6de4ff");
  drawRoleMarker(47 * TILE - cam.x, 134 * TILE - cam.y, "G", "#8dd7ff");
  drawSign(28 * TILE - cam.x, 136 * TILE - cam.y);
}

function drawBlackFortDetails(cam) {
  drawTent(90 * TILE - cam.x, 130 * TILE - cam.y, "#2f335f");
  drawTent(100 * TILE - cam.x, 130 * TILE - cam.y, "#5f668f");
  drawCrates(104 * TILE - cam.x, 133 * TILE - cam.y);
  drawCampfire(97 * TILE - cam.x, 132 * TILE - cam.y);
  drawLamp(106 * TILE - cam.x, 132 * TILE - cam.y);
  drawRoleMarker(98 * TILE - cam.x, 131 * TILE - cam.y, "回", "#6de4ff");
  drawRoleMarker(104 * TILE - cam.x, 131 * TILE - cam.y, "黒", "#d8d8ff");
  drawSign(93 * TILE - cam.x, 133 * TILE - cam.y);
}

function drawCampBoundary(cam) {
  for (let tx = 25; tx <= 35; tx += 1) {
    if (tx < 30 || tx > 32) drawCampStake(tx * TILE - cam.x, 56 * TILE - cam.y);
    drawCampStake(tx * TILE - cam.x, 61 * TILE - cam.y + 7);
  }
  for (let ty = 57; ty <= 60; ty += 1) {
    drawCampStake(25 * TILE - cam.x, ty * TILE - cam.y);
    drawCampStake(35 * TILE - cam.x + 8, ty * TILE - cam.y);
  }
}

function drawCampStake(sx, sy) {
  if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(sx + 2, sy + 7, 10, 2);
  ctx.fillStyle = "#5f371b";
  ctx.fillRect(sx + 4, sy + 2, 3, 8);
  ctx.fillRect(sx + 10, sy + 3, 3, 7);
  ctx.fillStyle = "#c98945";
  ctx.fillRect(sx + 4, sy + 2, 3, 2);
  ctx.fillRect(sx + 10, sy + 3, 3, 2);
}

function drawVillageRoleMarkers(cam) {
  drawRoleMarker(9 * TILE - cam.x, 46 * TILE - cam.y, "長", "#fff2a6");
  drawRoleMarker(15 * TILE - cam.x, 47 * TILE - cam.y, "鍛", "#ffd166");
  drawRoleMarker(13 * TILE - cam.x, 42 * TILE - cam.y, "薬", "#74ff8f");
  const villageHeal = HEAL_POINTS.find((point) => point.id === "village-circle") || HEAL_POINTS[0];
  drawRoleMarker(villageHeal.x * TILE - cam.x, (villageHeal.y - 1) * TILE - cam.y, "回", "#6de4ff");
  for (const gate of TOWN_GATES) {
    drawRoleMarker(gate.x * TILE - cam.x, (gate.y - 1) * TILE - cam.y, state.townGateOpen ? "開" : "門", state.townGateOpen ? "#ffd166" : "#d7e2ea");
  }
}

function drawTravelMarkers(cam) {
  const points = [
    [7, 49],
    [29, 59],
    [98, 57],
    [99, 115],
    [93, 131],
    [31, 134],
  ];
  for (const [x, y] of points) {
    drawRoleMarker(x * TILE - cam.x, y * TILE - cam.y, "W", "#d7e2ea");
  }
}

function drawRoleMarker(sx, sy, text, color) {
  if (sx < -16 || sy < -16 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(5, 8, 18, 0.72)";
  ctx.fillRect(sx + 1, sy + 1, 10, 10);
  ctx.strokeStyle = color;
  ctx.strokeRect(sx + 1, sy + 1, 10, 10);
  ctx.font = "8px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = color;
  ctx.fillText(text, sx + 3, sy + 9);
}

function drawFieldDetails(cam) {
  const startX = Math.floor(cam.x / TILE);
  const startY = Math.floor(cam.y / TILE);
  const endX = Math.ceil((cam.x + W) / TILE);
  const endY = Math.ceil((cam.y + VIEW_H) / TILE);
  for (let ty = startY; ty <= endY; ty += 1) {
    for (let tx = startX; tx <= endX; tx += 1) {
      if (inTownTile(tx, ty)) continue;
      const tile = tileAt(tx, ty);
      const sx = tx * TILE - cam.x;
      const sy = ty * TILE - cam.y;
      const n = hashNoise(tx * 3 + 7, ty * 5 + 11);
      if (tile === TILE_GRASS || tile === TILE_FLOWER) {
        if (n > 0.88) drawRock(sx + 5, sy + 8);
        else if (n > 0.76) drawGrassClump(sx + 3, sy + 7);
        else if (n < 0.08) drawTinyFlowers(sx + 3, sy + 4);
      }
      if (tile === TILE_FIELD && n > 0.7) {
        drawCropBundle(sx + 5, sy + 3);
      }
      if (tile === TILE_WATER) {
        const edge = tileAt(tx - 1, ty) !== TILE_WATER || tileAt(tx + 1, ty) !== TILE_WATER;
        if (edge && n > 0.45) drawReeds(sx + (n > 0.7 ? 2 : 12), sy + 5);
      }
      if (tile === TILE_PATH && n > 0.82) {
        drawPebbles(sx + 3, sy + 6);
      }
    }
  }
}

function drawRock(sx, sy) {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(sx + 1, sy + 4, 7, 2);
  ctx.fillStyle = "#6f7780";
  ctx.fillRect(sx + 1, sy + 1, 7, 4);
  ctx.fillStyle = "#aeb7bf";
  ctx.fillRect(sx + 2, sy, 4, 2);
  ctx.fillStyle = "#3f464d";
  ctx.fillRect(sx + 6, sy + 3, 2, 2);
}

function drawGrassClump(sx, sy) {
  ctx.fillStyle = "#1f7d36";
  ctx.fillRect(sx + 1, sy + 5, 11, 2);
  ctx.fillStyle = "#6dde69";
  ctx.fillRect(sx + 2, sy + 2, 1, 5);
  ctx.fillRect(sx + 5, sy, 1, 7);
  ctx.fillRect(sx + 8, sy + 1, 1, 6);
  ctx.fillRect(sx + 11, sy + 3, 1, 4);
}

function drawTinyFlowers(sx, sy) {
  ctx.fillStyle = "#2d8d30";
  ctx.fillRect(sx + 1, sy + 4, 10, 2);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(sx + 2, sy + 2, 2, 2);
  ctx.fillStyle = "#ff8ab3";
  ctx.fillRect(sx + 7, sy + 3, 2, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(sx + 11, sy + 1, 1, 1);
}

function drawCropBundle(sx, sy) {
  ctx.fillStyle = "#4d9f37";
  ctx.fillRect(sx + 1, sy + 8, 9, 2);
  ctx.fillStyle = "#fff06b";
  ctx.fillRect(sx + 2, sy, 1, 9);
  ctx.fillRect(sx + 5, sy + 1, 1, 8);
  ctx.fillRect(sx + 8, sy, 1, 9);
}

function drawReeds(sx, sy) {
  ctx.fillStyle = "#195f3d";
  ctx.fillRect(sx + 1, sy + 2, 1, 8);
  ctx.fillRect(sx + 4, sy, 1, 10);
  ctx.fillRect(sx + 7, sy + 3, 1, 7);
  ctx.fillStyle = "#c98945";
  ctx.fillRect(sx + 3, sy, 3, 2);
}

function drawPebbles(sx, sy) {
  ctx.fillStyle = "#7c5f41";
  ctx.fillRect(sx, sy + 2, 2, 1);
  ctx.fillRect(sx + 6, sy, 3, 2);
  ctx.fillRect(sx + 11, sy + 5, 2, 1);
}

function drawWell(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(sx + 1, sy + 10, 15, 4);
  ctx.fillStyle = "#66717c";
  ctx.fillRect(sx + 2, sy + 6, 12, 7);
  ctx.fillStyle = "#aeb7bf";
  ctx.fillRect(sx + 3, sy + 5, 10, 2);
  ctx.fillStyle = "#172636";
  ctx.fillRect(sx + 5, sy + 8, 6, 3);
  ctx.fillStyle = "#8b3f32";
  ctx.fillRect(sx + 1, sy + 1, 14, 3);
  ctx.fillStyle = "#d9704c";
  ctx.fillRect(sx + 3, sy, 10, 2);
}

function drawBench(sx, sy, axis) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(sx + 1, sy + 8, 17, 3);
  ctx.fillStyle = "#5f371b";
  ctx.fillRect(sx, sy + 4, 18, 3);
  ctx.fillStyle = "#c98945";
  ctx.fillRect(sx + 1, sy + 2, 16, 2);
  ctx.fillStyle = "#2c2018";
  ctx.fillRect(sx + 3, sy + 7, 2, 3);
  ctx.fillRect(sx + 13, sy + 7, 2, 3);
}

function drawCrates(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  drawCrate(sx, sy + 3);
  drawCrate(sx + 8, sy);
  drawCrate(sx + 9, sy + 9);
}

function drawCrate(sx, sy) {
  ctx.fillStyle = "#7b4b25";
  ctx.fillRect(sx, sy, 7, 7);
  ctx.fillStyle = "#c3853f";
  ctx.fillRect(sx + 1, sy + 1, 5, 1);
  ctx.fillRect(sx + 1, sy + 5, 5, 1);
  ctx.fillStyle = "#4f2e17";
  ctx.fillRect(sx + 3, sy + 1, 1, 5);
}

function drawFlowerBed(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "#3b7b37";
  ctx.fillRect(sx, sy, 16, 8);
  ctx.fillStyle = "#2d5c2b";
  ctx.fillRect(sx, sy + 7, 16, 1);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(sx + 3, sy + 2, 2, 2);
  ctx.fillStyle = "#ff6b8a";
  ctx.fillRect(sx + 8, sy + 3, 2, 2);
  ctx.fillStyle = "#eaffff";
  ctx.fillRect(sx + 12, sy + 1, 2, 2);
}

function drawLamp(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  const flicker = Math.floor(performance.now() / 200 + sx + sy) % 2;
  ctx.fillStyle = "#3a2718";
  ctx.fillRect(sx + 7, sy + 4, 2, 10);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(sx + 5, sy + 1, 6, 5);
  ctx.fillStyle = flicker ? "#fff2a6" : "#ff9a3d";
  ctx.fillRect(sx + 6, sy + 2, 4, 3);
}

function drawTent(sx, sy, color) {
  if (sx < -24 || sy < -24 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(sx + 1, sy + 12, 18, 3);
  ctx.fillStyle = "#4f2e17";
  ctx.fillRect(sx + 2, sy + 11, 15, 3);
  ctx.fillStyle = color;
  ctx.fillRect(sx + 4, sy + 5, 11, 8);
  ctx.fillStyle = "#d7e2ea";
  ctx.fillRect(sx + 6, sy + 3, 7, 3);
  ctx.fillStyle = "#1b2230";
  ctx.fillRect(sx + 9, sy + 8, 2, 5);
}

function drawCampfire(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  const pulse = Math.floor(performance.now() / 150) % 2;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(sx + 2, sy + 11, 12, 3);
  ctx.fillStyle = "#5f371b";
  ctx.fillRect(sx + 3, sy + 9, 10, 2);
  ctx.fillStyle = pulse ? "#ffd166" : "#ff7a3d";
  ctx.fillRect(sx + 6, sy + 4, 4, 6);
  ctx.fillStyle = "#fff2a6";
  ctx.fillRect(sx + 7, sy + 6, 2, 4);
}

function drawSign(sx, sy) {
  if (sx < -20 || sy < -20 || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "#4f2e17";
  ctx.fillRect(sx + 7, sy + 5, 2, 9);
  ctx.fillStyle = "#c98945";
  ctx.fillRect(sx + 2, sy + 1, 12, 6);
  ctx.fillStyle = "#2c2018";
  ctx.fillRect(sx + 4, sy + 3, 8, 1);
}

function drawChests(cam) {
  for (const chest of TREASURE_CHESTS) {
    const sx = chest.x * TILE - cam.x;
    const sy = chest.y * TILE - cam.y;
    if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) continue;
    drawChest(sx + 3, sy + 5, state.chests.has(chest.id));
  }
}

function drawChest(sx, sy, opened) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(sx, sy + 8, 11, 3);
  ctx.fillStyle = opened ? "#5f4630" : "#9f5b28";
  ctx.fillRect(sx, sy + 4, 11, 7);
  ctx.fillStyle = opened ? "#3b2b20" : "#d28a3c";
  ctx.fillRect(sx + 1, sy + 2, 9, 4);
  ctx.fillStyle = "#2c2018";
  ctx.fillRect(sx, sy + 6, 11, 1);
  ctx.fillStyle = opened ? "#1b1410" : "#ffd166";
  ctx.fillRect(sx + 5, sy + 5, 2, 3);
  if (!opened) {
    ctx.fillStyle = "#fff2a6";
    ctx.fillRect(sx + 2, sy + 3, 3, 1);
  }
}

function drawGuardianSite(cam) {
  if (state.guardianDefeated) return;
  const sx = GUARDIAN_SITE.x * TILE - cam.x;
  const sy = GUARDIAN_SITE.y * TILE - cam.y;
  if (sx < -24 || sy < -24 || sx > W || sy > VIEW_H) return;
  const pulse = Math.floor(performance.now() / 260) % 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(sx - 1, sy + 14, 22, 3);
  ctx.fillStyle = "#475569";
  ctx.fillRect(sx + 5, sy + 4, 10, 12);
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(sx + 6, sy + 2, 8, 4);
  ctx.fillStyle = guardianReady() ? "#55c7a0" : "#53606f";
  ctx.fillRect(sx + 8, sy + 7, 4, 5);
  if (guardianReady()) {
    ctx.strokeStyle = pulse ? "#55c7a0" : "#d8fff1";
    ctx.strokeRect(sx + 2, sy, 16, 18);
  }
}

function drawWardenSite(cam) {
  if (state.wardenDefeated) return;
  const sx = WARDEN_SITE.x * TILE - cam.x;
  const sy = WARDEN_SITE.y * TILE - cam.y;
  if (sx < -24 || sy < -24 || sx > W || sy > VIEW_H) return;
  const ready = player.trailCharm && player.level >= WARDEN_REQUIREMENTS.level;
  const pulse = Math.floor(performance.now() / 220) % 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(sx - 1, sy + 14, 22, 3);
  ctx.fillStyle = "#26384a";
  ctx.fillRect(sx + 4, sy + 3, 12, 12);
  ctx.fillStyle = "#6de4ff";
  ctx.fillRect(sx + 7, sy + 5, 6, 7);
  ctx.fillStyle = ready ? "#eaffff" : "#53606f";
  ctx.fillRect(sx + 5, sy + 1, 10, 3);
  ctx.fillRect(sx + 8, sy + 12, 4, 3);
  if (ready) {
    ctx.strokeStyle = pulse ? "#6de4ff" : "#fff2a6";
    ctx.strokeRect(sx + 1, sy, 18, 17);
  }
}

function drawAshKnightSite(cam) {
  if (state.ashKnightDefeated) return;
  const sx = ASH_KNIGHT_SITE.x * TILE - cam.x;
  const sy = ASH_KNIGHT_SITE.y * TILE - cam.y;
  if (sx < -24 || sy < -24 || sx > W || sy > VIEW_H) return;
  const ready = state.wardenDefeated && player.level >= ASH_KNIGHT_REQUIREMENTS.level;
  const pulse = Math.floor(performance.now() / 200) % 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
  ctx.fillRect(sx - 2, sy + 14, 24, 3);
  ctx.fillStyle = "#3b2b5f";
  ctx.fillRect(sx + 4, sy + 2, 12, 14);
  ctx.fillStyle = ready ? "#b990ff" : "#53606f";
  ctx.fillRect(sx + 7, sy, 6, 5);
  ctx.fillRect(sx + 8, sy + 7, 4, 7);
  if (ready) {
    ctx.strokeStyle = pulse ? "#b990ff" : "#fff2a6";
    ctx.strokeRect(sx + 1, sy, 18, 18);
  }
}

function drawEclipseDragonSite(cam) {
  if (state.eclipseDragonDefeated) return;
  const sx = ECLIPSE_DRAGON_SITE.x * TILE - cam.x;
  const sy = ECLIPSE_DRAGON_SITE.y * TILE - cam.y;
  if (sx < -28 || sy < -28 || sx > W || sy > VIEW_H) return;
  const ready = state.elderReported
    && state.ashKnightDefeated
    && state.chests.has("moon-ruin-cache")
    && state.discoveries.has("eclipse-seal")
    && player.level >= CHAPTER2_REQUIREMENTS.level;
  const pulse = Math.floor(performance.now() / 180) % 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(sx - 3, sy + 16, 28, 4);
  ctx.fillStyle = "#24153d";
  ctx.fillRect(sx + 4, sy + 3, 15, 14);
  ctx.fillStyle = ready ? "#e36dff" : "#53606f";
  ctx.fillRect(sx + 7, sy, 9, 5);
  ctx.fillRect(sx + 9, sy + 7, 5, 8);
  ctx.fillStyle = ready ? "#fff2a6" : "#26384a";
  ctx.fillRect(sx + 5, sy + 6, 3, 3);
  ctx.fillRect(sx + 15, sy + 6, 3, 3);
  if (ready) {
    ctx.strokeStyle = pulse ? "#e36dff" : "#fff2a6";
    ctx.strokeRect(sx + 1, sy - 1, 21, 20);
  }
}

function drawVoidDragonSite(cam) {
  if (state.voidDragonDefeated) return;
  const sx = VOID_DRAGON_SITE.x * TILE - cam.x;
  const sy = VOID_DRAGON_SITE.y * TILE - cam.y;
  if (sx < -30 || sy < -30 || sx > W || sy > VIEW_H) return;
  const ready = state.chapter2Reported
    && state.eclipseDragonDefeated
    && state.chests.has("black-fort-armory")
    && state.chests.has("eclipse-castle-cache")
    && state.discoveries.has("void-seal")
    && player.level >= CHAPTER3_REQUIREMENTS.level;
  const pulse = Math.floor(performance.now() / 150) % 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
  ctx.fillRect(sx - 4, sy + 17, 31, 5);
  ctx.fillStyle = "#070817";
  ctx.fillRect(sx + 3, sy + 2, 17, 16);
  ctx.fillStyle = ready ? "#d8d8ff" : "#53606f";
  ctx.fillRect(sx + 6, sy - 1, 11, 5);
  ctx.fillRect(sx + 8, sy + 8, 7, 8);
  ctx.fillStyle = ready ? "#6de4ff" : "#26384a";
  ctx.fillRect(sx + 5, sy + 6, 3, 3);
  ctx.fillRect(sx + 16, sy + 6, 3, 3);
  ctx.fillStyle = ready ? "#fff2a6" : "#1a2440";
  ctx.fillRect(sx + 10, sy + 12, 5, 2);
  if (ready) {
    ctx.strokeStyle = pulse ? "#d8d8ff" : "#6de4ff";
    ctx.strokeRect(sx, sy - 2, 24, 22);
    ctx.strokeRect(sx + 3, sy + 1, 18, 16);
  }
}

function drawObsidianGolemSite(cam) {
  if (state.obsidianGolemDefeated) return;
  const sx = OBSIDIAN_GOLEM_SITE.x * TILE - cam.x;
  const sy = OBSIDIAN_GOLEM_SITE.y * TILE - cam.y;
  if (sx < -32 || sy < -32 || sx > W || sy > VIEW_H) return;
  const ready = state.chapter2Reported
    && state.chests.has("black-fort-armory")
    && player.level >= OBSIDIAN_GOLEM_REQUIREMENTS.level;
  const pulse = Math.floor(performance.now() / 170) % 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
  ctx.fillRect(sx - 5, sy + 17, 30, 4);
  ctx.fillStyle = "#151821";
  ctx.fillRect(sx + 3, sy + 3, 17, 15);
  ctx.fillStyle = ready ? "#8dd7ff" : "#53606f";
  ctx.fillRect(sx + 6, sy, 11, 5);
  ctx.fillRect(sx + 7, sy + 8, 9, 8);
  ctx.fillStyle = ready ? "#d7e2ea" : "#26384a";
  ctx.fillRect(sx + 5, sy + 6, 3, 3);
  ctx.fillRect(sx + 16, sy + 6, 3, 3);
  ctx.fillStyle = ready ? "#ffd166" : "#1a2440";
  ctx.fillRect(sx + 10, sy + 12, 5, 2);
  if (ready) {
    ctx.strokeStyle = pulse ? "#8dd7ff" : "#d7e2ea";
    ctx.strokeRect(sx, sy - 2, 24, 22);
  }
}

function drawFrostGolemSite(cam) {
  if (state.frostGolemDefeated) return;
  const sx = FROST_GOLEM_SITE.x * TILE - cam.x;
  const sy = FROST_GOLEM_SITE.y * TILE - cam.y;
  if (sx < -32 || sy < -32 || sx > W || sy > VIEW_H) return;
  const ready = state.chapter3Reported && player.level >= FROST_GOLEM_REQUIREMENTS.level;
  const pulse = Math.floor(performance.now() / 160) % 2;
  ctx.fillStyle = "rgba(185, 244, 255, 0.28)";
  ctx.fillRect(sx - 4, sy + 1 - pulse, 28, 20);
  ctx.fillStyle = ready ? "#8dd7ff" : "#53606f";
  ctx.fillRect(sx + 3, sy + 3, 17, 15);
  ctx.fillStyle = ready ? "#d9f7ff" : "#26384a";
  ctx.fillRect(sx + 7, sy, 9, 6);
  ctx.fillRect(sx + 8, sy + 9, 7, 8);
  if (ready) {
    ctx.strokeStyle = pulse ? "#d9f7ff" : "#8dd7ff";
    ctx.strokeRect(sx, sy - 2, 24, 22);
  }
}

function drawFrostDragonSite(cam) {
  if (state.frostDragonDefeated) return;
  const sx = FROST_DRAGON_SITE.x * TILE - cam.x;
  const sy = FROST_DRAGON_SITE.y * TILE - cam.y;
  if (sx < -32 || sy < -32 || sx > W || sy > VIEW_H) return;
  const ready = state.chapter3Reported
    && state.frostGolemDefeated
    && state.discoveries.has("frost-seal")
    && player.level >= CHAPTER4_REQUIREMENTS.level;
  const pulse = Math.floor(performance.now() / 140) % 2;
  ctx.fillStyle = "rgba(217, 247, 255, 0.3)";
  ctx.fillRect(sx - 5, sy + 1 - pulse, 31, 22);
  ctx.fillStyle = ready ? "#d9f7ff" : "#53606f";
  ctx.fillRect(sx + 3, sy + 3, 18, 16);
  ctx.fillStyle = ready ? "#8dd7ff" : "#26384a";
  ctx.fillRect(sx + 7, sy, 10, 6);
  ctx.fillRect(sx + 9, sy + 9, 7, 8);
  if (ready) {
    ctx.strokeStyle = pulse ? "#ffffff" : "#8dd7ff";
    ctx.strokeRect(sx, sy - 2, 25, 23);
  }
}

function drawDiscoveries(cam) {
  for (const discovery of DISCOVERY_POINTS) {
    const sx = discovery.x * TILE - cam.x;
    const sy = discovery.y * TILE - cam.y;
    if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) continue;
    const found = state.discoveries.has(discovery.id);
    if (discovery.kind === "spring") {
      if (!found) {
        drawGlint(sx + 7, sy + 9, "#74ff8f");
      } else {
        ctx.fillStyle = "rgba(116, 255, 143, 0.28)";
        ctx.fillRect(sx + 2, sy + 5, 12, 8);
        ctx.strokeStyle = "#74ff8f";
        ctx.strokeRect(sx + 3, sy + 6, 10, 6);
        ctx.fillStyle = "#d8fff1";
        ctx.fillRect(sx + 7, sy + 8, 2, 2);
      }
    } else if (discovery.kind === "ore") {
      ctx.fillStyle = found ? "#6f7780" : "#374151";
      ctx.fillRect(sx + 4, sy + 8, 9, 5);
      drawGlint(sx + 7, sy + 7, found ? "#d7e2ea" : "#8dd7ff");
    } else if (discovery.kind === "cache") {
      ctx.fillStyle = found ? "#4f2e17" : "#7b4b25";
      ctx.fillRect(sx + 4, sy + 7, 8, 6);
      if (!found) drawGlint(sx + 11, sy + 6, "#ffd166");
    } else if (discovery.kind === "waystone") {
      ctx.fillStyle = found ? "#4a5268" : "#65739a";
      ctx.fillRect(sx + 5, sy + 4, 6, 10);
      ctx.fillStyle = found ? "#9fb3ff" : "#dce6ff";
      ctx.fillRect(sx + 7, sy + 6, 2, 5);
      if (!found) drawGlint(sx + 9, sy + 4, "#9fb3ff");
    } else if (discovery.kind === "eclipseSeal") {
      ctx.fillStyle = found ? "#3b2b5f" : "#24153d";
      ctx.fillRect(sx + 3, sy + 3, 10, 12);
      ctx.fillStyle = found ? "#9fb3ff" : "#e36dff";
      ctx.fillRect(sx + 6, sy + 5, 4, 7);
      if (!found) drawGlint(sx + 8, sy + 3, "#e36dff");
    } else if (discovery.kind === "voidSeal") {
      ctx.fillStyle = found ? "#1d2441" : "#070817";
      ctx.fillRect(sx + 3, sy + 2, 11, 13);
      ctx.fillStyle = found ? "#d8d8ff" : "#6de4ff";
      ctx.fillRect(sx + 6, sy + 4, 4, 8);
      ctx.fillStyle = found ? "#6de4ff" : "#fff2a6";
      ctx.fillRect(sx + 8, sy + 1, 2, 2);
      if (!found) drawGlint(sx + 9, sy + 3, "#d8d8ff");
    } else if (discovery.kind === "frostSeal") {
      ctx.fillStyle = found ? "#4d6a78" : "#243f52";
      ctx.fillRect(sx + 3, sy + 2, 11, 13);
      ctx.fillStyle = found ? "#8dd7ff" : "#d9f7ff";
      ctx.fillRect(sx + 6, sy + 4, 4, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx + 8, sy + 1, 2, 2);
      if (!found) drawGlint(sx + 10, sy + 3, "#d9f7ff");
    } else if (discovery.kind === "obsidianWaystone") {
      ctx.fillStyle = found ? "#3d465a" : "#111522";
      ctx.fillRect(sx + 4, sy + 3, 8, 12);
      ctx.fillStyle = found ? "#aab0c8" : "#8dd7ff";
      ctx.fillRect(sx + 6, sy + 5, 4, 7);
      if (!found) drawGlint(sx + 10, sy + 3, "#8dd7ff");
    } else if (discovery.kind === "summonerHint") {
      ctx.fillStyle = found ? "#3b2b4f" : "#271733";
      ctx.fillRect(sx + 3, sy + 4, 10, 10);
      ctx.fillStyle = found ? "#8a6fa8" : "#d678ff";
      ctx.fillRect(sx + 5, sy + 2, 6, 4);
      ctx.fillRect(sx + 7, sy + 7, 2, 5);
      if (!found) drawGlint(sx + 10, sy + 3, "#d678ff");
    } else if (discovery.kind === "trapHint") {
      ctx.fillStyle = found ? "#4a3140" : "#2a1b22";
      ctx.fillRect(sx + 4, sy + 4, 8, 10);
      ctx.fillStyle = found ? "#a8788e" : "#ff5e9f";
      ctx.fillRect(sx + 6, sy + 3, 4, 4);
      ctx.fillRect(sx + 7, sy + 8, 2, 5);
      if (!found) drawGlint(sx + 11, sy + 4, "#ff5e9f");
    } else if (discovery.kind === "routeHint" || discovery.kind === "shortcutHint" || discovery.kind === "smugglerHint" || discovery.kind === "greaterRegenHint" || discovery.kind === "mistHint" || discovery.kind === "cryptHint" || discovery.kind === "frostHint") {
      ctx.fillStyle = found ? "#604622" : "#7b4b25";
      ctx.fillRect(sx + 5, sy + 5, 7, 8);
      ctx.fillStyle = found ? "#b08a54" : discovery.kind === "greaterRegenHint" ? "#74ff8f" : discovery.kind === "mistHint" ? "#9fd6c7" : discovery.kind === "cryptHint" ? "#d7b26d" : discovery.kind === "frostHint" ? "#b9f4ff" : "#ffd166";
      ctx.fillRect(sx + 3, sy + 4, 10, 3);
      ctx.fillStyle = "#2a1d12";
      ctx.fillRect(sx + 8, sy + 8, 2, 6);
      if (!found) drawGlint(sx + 12, sy + 3, discovery.kind === "shortcutHint" || discovery.kind === "smugglerHint" ? "#8dd7ff" : discovery.kind === "greaterRegenHint" ? "#74ff8f" : discovery.kind === "mistHint" ? "#9fd6c7" : discovery.kind === "cryptHint" ? "#d7b26d" : discovery.kind === "frostHint" ? "#b9f4ff" : "#ffd166");
    }
  }
}

function drawGlint(sx, sy, color) {
  const pulse = Math.floor(performance.now() / 240) % 2;
  ctx.fillStyle = color;
  ctx.fillRect(sx, sy + 1, 3, 1);
  ctx.fillRect(sx + 1, sy, 1, 3);
  if (pulse) ctx.fillRect(sx + 1, sy + 1, 1, 1);
}

function drawHealCircle(cam) {
  for (const healPoint of HEAL_POINTS) {
    const sx = healPoint.x * TILE - cam.x;
    const sy = healPoint.y * TILE - cam.y;
    if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) continue;
    const pulse = Math.floor(performance.now() / 180) % 3;
    ctx.fillStyle = "rgba(26, 75, 88, 0.45)";
    ctx.fillRect(sx + 1, sy + 2, 14, 12);
    ctx.strokeStyle = "#6de4ff";
    ctx.strokeRect(sx + 2 - pulse, sy + 3 - pulse, 12 + pulse * 2, 10 + pulse * 2);
    ctx.fillStyle = "#eaffff";
    ctx.fillRect(sx + 7, sy + 4, 2, 8);
    ctx.fillRect(sx + 4, sy + 7, 8, 2);
    ctx.fillStyle = "#74ff8f";
    ctx.fillRect(sx + 3, sy + 3, 2, 2);
    ctx.fillRect(sx + 11, sy + 11, 2, 2);
  }
}

function drawTownFence(cam) {
  const left = 5;
  const right = 18;
  const top = 39;
  const bottom = 55;
  for (let tx = left; tx <= right; tx += 1) {
    if (!tileInGate(tx, top)) drawFenceSegment(tx * TILE - cam.x, top * TILE - cam.y, "x");
    if (!tileInGate(tx, bottom)) drawFenceSegment(tx * TILE - cam.x, bottom * TILE - cam.y + 11, "x");
  }
  for (let ty = top; ty <= bottom; ty += 1) {
    if (!tileInGate(left, ty)) drawFenceSegment(left * TILE - cam.x, ty * TILE - cam.y, "y");
    if (!tileInGate(right, ty)) drawFenceSegment(right * TILE - cam.x + 11, ty * TILE - cam.y, "y");
  }
}

function drawFenceSegment(sx, sy, axis) {
  if (sx < -TILE || sy < -TILE || sx > W || sy > VIEW_H) return;
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  if (axis === "x") {
    ctx.fillRect(sx, sy + 6, TILE, 4);
    ctx.fillStyle = "#394759";
    ctx.fillRect(sx, sy + 2, TILE, 7);
    ctx.fillStyle = "#7c8a99";
    ctx.fillRect(sx, sy + 2, TILE, 2);
    ctx.fillRect(sx + 2, sy + 5, 5, 2);
    ctx.fillRect(sx + 10, sy + 5, 5, 2);
  } else {
    ctx.fillRect(sx + 6, sy, 4, TILE);
    ctx.fillStyle = "#394759";
    ctx.fillRect(sx + 2, sy, 7, TILE);
    ctx.fillStyle = "#7c8a99";
    ctx.fillRect(sx + 2, sy, 2, TILE);
    ctx.fillRect(sx + 5, sy + 2, 2, 5);
    ctx.fillRect(sx + 5, sy + 10, 2, 5);
  }
}

function drawTownGates(cam) {
  for (const gate of TOWN_GATES) {
    const sx = gate.x * TILE - cam.x;
    const sy = gate.y * TILE - cam.y;
    if (sx < -TILE * 2 || sy < -TILE * 2 || sx > W + TILE || sy > VIEW_H + TILE) continue;
    drawGate(gate, sx, sy);
  }
}

function drawGate(gate, sx, sy) {
  const open = state.townGateOpen;
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(sx, sy + gate.h * TILE - 3, gate.w * TILE, 3);
  ctx.fillStyle = "#4b2a16";
  ctx.fillRect(sx, sy, gate.w * TILE, gate.h * TILE);
  ctx.fillStyle = "#9b5c2b";
  if (gate.axis === "x") {
    ctx.fillRect(sx, sy + 2, gate.w * TILE, 3);
    ctx.fillRect(sx, sy + 10, gate.w * TILE, 3);
    ctx.fillStyle = "#d8a04d";
    if (open) {
      ctx.fillRect(sx + 2, sy - 7, 5, TILE + 7);
      ctx.fillRect(sx + gate.w * TILE - 7, sy - 7, 5, TILE + 7);
    } else {
      for (let x = 4; x < gate.w * TILE; x += 9) ctx.fillRect(sx + x, sy - 2, 4, TILE + 4);
    }
  } else {
    ctx.fillRect(sx + 2, sy, 3, gate.h * TILE);
    ctx.fillRect(sx + 10, sy, 3, gate.h * TILE);
    ctx.fillStyle = "#d8a04d";
    if (open) {
      ctx.fillRect(sx - 7, sy + 2, TILE + 7, 5);
      ctx.fillRect(sx - 7, sy + gate.h * TILE - 7, TILE + 7, 5);
    } else {
      for (let y = 4; y < gate.h * TILE; y += 9) ctx.fillRect(sx - 2, sy + y, TILE + 4, 4);
    }
  }
  ctx.fillStyle = open ? "#74ff8f" : "#ff6b5f";
  ctx.fillRect(sx + Math.floor(gate.w * TILE / 2) - 1, sy + Math.floor(gate.h * TILE / 2) - 1, 3, 3);
}

function drawTile(tile, sx, sy, tx, ty) {
  if (sy > VIEW_H || sx > W || sx < -TILE || sy < -TILE) return;
  const n = hashNoise(tx, ty);
  if (tile === TILE_GRASS || tile === TILE_FLOWER || tile === TILE_FIELD) {
    ctx.fillStyle = tile === TILE_FIELD ? "#7bd957" : n > 0.72 ? "#43bf52" : "#3daf49";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = n > 0.5 ? "#2b8a34" : "#6dde69";
    ctx.fillRect(sx + 2, sy + 5, 2, 1);
    ctx.fillRect(sx + 11, sy + 10, 2, 1);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(sx + 5, sy + 2, 1, 1);
    ctx.fillRect(sx + 13, sy + 6, 1, 1);
    if (tile === TILE_FLOWER) {
      ctx.fillStyle = "#ffeb61";
      ctx.fillRect(sx + 5, sy + 6, 2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx + 8, sy + 9, 2, 2);
    }
    if (tile === TILE_FIELD) {
      ctx.fillStyle = "#d7e44d";
      for (let y = 1; y < TILE; y += 4) ctx.fillRect(sx, sy + y, TILE, 1);
      ctx.fillStyle = "#43943b";
      ctx.fillRect(sx + 2, sy, 1, TILE);
      ctx.fillRect(sx + 10, sy, 1, TILE);
    }
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_PATH || tile === TILE_CAVE) {
    ctx.fillStyle = tile === TILE_CAVE ? "#4c3428" : "#b98b55";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = tile === TILE_CAVE ? "#1b1410" : "#8c673d";
    ctx.fillRect(sx + 2, sy + 3, 5, 2);
    ctx.fillRect(sx + 10, sy + 11, 4, 2);
    ctx.fillStyle = tile === TILE_CAVE ? "#0f0b08" : "#d0a86a";
    ctx.fillRect(sx, sy, TILE, 1);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_WATER) {
    ctx.fillStyle = "#1d75d8";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#45b7ff";
    ctx.fillRect(sx, sy, TILE, 4);
    ctx.fillStyle = "#b9f4ff";
    const offset = Math.floor(performance.now() / 180 + tx + ty) % 8;
    ctx.fillRect(sx + offset - 4, sy + 4, 8, 1);
    ctx.fillRect(sx + 9 - offset, sy + 11, 8, 1);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_TREE) {
    ctx.fillStyle = "#2c8933";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#115f25";
    ctx.fillRect(sx + 6, sy + 8, 4, 7);
    ctx.fillStyle = "#177a2c";
    ctx.fillRect(sx + 3, sy + 3, 10, 7);
    ctx.fillStyle = "#31c54a";
    ctx.fillRect(sx + 5, sy + 1, 7, 6);
    ctx.fillStyle = "#7bea73";
    ctx.fillRect(sx + 7, sy + 2, 2, 2);
    ctx.fillStyle = "#0d4119";
    ctx.fillRect(sx + 1, sy + 11, 14, 2);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_WALL) {
    ctx.fillStyle = "#8a8f98";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#3e4148";
    ctx.fillRect(sx, sy + 4, TILE, 1);
    ctx.fillRect(sx, sy + 11, TILE, 1);
    ctx.fillRect(sx + 7, sy, 1, TILE);
    ctx.fillStyle = "#c2c7ce";
    ctx.fillRect(sx + 1, sy + 1, 4, 1);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_ROOF) {
    ctx.fillStyle = "#a61f32";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#681119";
    for (let y = 2; y < TILE; y += 5) ctx.fillRect(sx, sy + y, TILE, 1);
    ctx.fillStyle = "#f07855";
    ctx.fillRect(sx + 2, sy + 2, 12, 2);
    ctx.fillStyle = "#f7b267";
    ctx.fillRect(sx + 4, sy + 7, 8, 1);
    drawTerrainEdges(tile, sx, sy, tx, ty);
    return;
  }

  if (tile === TILE_FLOOR) {
    const floorTone = hashNoise(tx + 101, ty + 203);
    ctx.fillStyle = floorTone > 0.66 ? "#b4ad9b" : floorTone < 0.22 ? "#928b7a" : "#a69d8a";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#756f63";
    ctx.fillRect(sx, sy + 7, TILE, 1);
    ctx.fillRect(sx + 7, sy, 1, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(sx + 2, sy + 2, 4, 1);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    if (floorTone > 0.8) ctx.fillRect(sx + 10, sy + 11, 4, 1);
    if (floorTone < 0.12) ctx.fillRect(sx + 3, sy + 12, 2, 2);
    drawTerrainEdges(tile, sx, sy, tx, ty);
  }
}

function drawTerrainEdges(tile, sx, sy, tx, ty) {
  const n = {
    up: tileAt(tx, ty - 1),
    down: tileAt(tx, ty + 1),
    left: tileAt(tx - 1, ty),
    right: tileAt(tx + 1, ty),
  };
  const water = TILE_WATER;
  const hard = [TILE_WALL, TILE_ROOF, TILE_TREE];
  const paved = [TILE_PATH, TILE_FLOOR, TILE_CAVE];

  if (tile !== water) {
    ctx.fillStyle = "#2c6b48";
    if (n.up === water) ctx.fillRect(sx, sy, TILE, 2);
    if (n.down === water) ctx.fillRect(sx, sy + TILE - 2, TILE, 2);
    if (n.left === water) ctx.fillRect(sx, sy, 2, TILE);
    if (n.right === water) ctx.fillRect(sx + TILE - 2, sy, 2, TILE);
  }

  if (tile === water) {
    ctx.fillStyle = "#b8f4ff";
    if (n.up !== water) ctx.fillRect(sx, sy, TILE, 1);
    if (n.down !== water) ctx.fillRect(sx, sy + TILE - 1, TILE, 1);
    if (n.left !== water) ctx.fillRect(sx, sy, 1, TILE);
    if (n.right !== water) ctx.fillRect(sx + TILE - 1, sy, 1, TILE);
  }

  if (tile === TILE_GRASS || tile === TILE_FLOWER || tile === TILE_FIELD) {
    ctx.fillStyle = "rgba(57, 42, 24, 0.28)";
    if (paved.includes(n.up)) ctx.fillRect(sx, sy, TILE, 1);
    if (paved.includes(n.down)) ctx.fillRect(sx, sy + TILE - 1, TILE, 1);
    if (paved.includes(n.left)) ctx.fillRect(sx, sy, 1, TILE);
    if (paved.includes(n.right)) ctx.fillRect(sx + TILE - 1, sy, 1, TILE);
  }

  if (hard.includes(tile)) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.fillRect(sx + 1, sy + TILE - 2, TILE - 1, 2);
    ctx.fillRect(sx + TILE - 2, sy + 2, 2, TILE - 2);
  }
}

function drawNpcs(cam) {
  for (const npc of state.npcs) {
    const sx = Math.round(screenX(npc.x, cam));
    const sy = Math.round(screenY(npc.y, cam));
    if (sy > VIEW_H || sx < -16 || sx > W) continue;
    drawHumanSprite(sx, sy, npcColor(npc.type), npc.dir, npc.type);
  }
}

function npcColor(type) {
  if (type === "smith") return "#d14f2b";
  if (type === "healer") return "#40c6ff";
  if (type === "frontier") return "#9ad16f";
  if (type === "frostSmith") return "#79d8ff";
  if (type === "merchant") return "#ffd166";
  if (type === "porter") return "#d7e2ea";
  if (type === "guide") return "#b990ff";
  if (type === "guard") return "#8dd7ff";
  if (type === "villager") return "#f0a66a";
  return "#efe35a";
}

function drawEntities(cam) {
  const drawables = [...state.monsters, player].sort((a, b) => a.y + a.h - (b.y + b.h));
  for (const actor of drawables) {
    if (actor === player) drawPlayer(Math.round(screenX(actor.x, cam)), Math.round(screenY(actor.y, cam)));
    else drawMonster(actor, Math.round(screenX(actor.x, cam)), Math.round(screenY(actor.y, cam)));
  }
}

function drawHumanSprite(sx, sy, body, dir, role = "elder") {
  const baseW = 16;
  const baseH = 16;
  ctx.save();
  ctx.translate(
    Math.round(sx + baseW / 2),
    Math.round(sy + baseH),
  );
  ctx.scale(NPC_DRAW_SCALE, NPC_DRAW_SCALE);
  drawHumanSpriteBase(
    Math.round(-baseW / 2),
    -baseH,
    body,
    dir,
    role,
  );
  ctx.restore();
}

function drawHumanSpriteBase(sx, sy, body, dir, role = "elder") {
  drawActorShadow(sx + 2, sy + 14, 12);
  ctx.fillStyle = role === "elder" ? "#f5f5f5" : "#2b1a18";
  ctx.fillRect(sx + 4, sy, 8, 3);
  ctx.fillStyle = "#ffd08a";
  ctx.fillRect(sx + 5, sy + 3, 6, 5);
  ctx.fillStyle = body;
  ctx.fillRect(sx + 4, sy + 8, 8, 6);
  ctx.fillStyle = "#162033";
  ctx.fillRect(sx + 4, sy + 14, 3, 2);
  ctx.fillRect(sx + 9, sy + 14, 3, 2);
  if (role === "smith") {
    ctx.fillStyle = "#4a291d";
    ctx.fillRect(sx + 5, sy + 9, 6, 5);
    ctx.fillStyle = "#d7e2ea";
    ctx.fillRect(sx + 12, sy + 10, 3, 1);
  }
  if (role === "healer") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 7, sy + 9, 2, 5);
    ctx.fillRect(sx + 5, sy + 11, 6, 1);
  }
  if (role === "elder") {
    ctx.fillStyle = "#fff4b0";
    ctx.fillRect(sx + 5, sy + 9, 6, 2);
  }
  ctx.fillStyle = "#111018";
  if (dir === "left") ctx.fillRect(sx + 4, sy + 5, 2, 1);
  else if (dir === "right") ctx.fillRect(sx + 10, sy + 5, 2, 1);
  else ctx.fillRect(sx + 6, sy + 5, 1, 1);
}

function drawPlayer(sx, sy) {
  const blink = player.invuln > 0 && Math.floor(performance.now() / 80) % 2 === 0;
  if (blink) return;

  const bob = Math.floor(player.step % 2);
  const pose = bob ? "walk" : "idle";
  const dirFrames = PLAYER_SPRITE_FRAMES[player.dir] || PLAYER_SPRITE_FRAMES.down;
  const frameIndex = dirFrames[pose];
  const frameImage = playerSpriteImages[player.dir]?.[pose] || playerSpriteImages.down[pose];

  const playerDrawW = Math.max(1, PLAYER_DRAW_SIZE);
  const playerDrawH = Math.max(1, PLAYER_DRAW_SIZE);
  const actorW = worldToDraw(player.w);
  const actorH = worldToDraw(player.h);
  const drawX = sx - Math.floor((playerDrawW - actorW) / 2);
  const drawY = sy - Math.max(0, playerDrawH - actorH);

  if (player.guard > 0) {
    ctx.strokeStyle = "#6de4ff";
    ctx.strokeRect(drawX + 1, drawY + 1, Math.max(1, playerDrawW - 2), Math.max(1, playerDrawH - 2));
    ctx.fillStyle = "rgba(109, 228, 255, 0.24)";
    ctx.fillRect(drawX + 2, drawY + 2, Math.max(1, playerDrawW - 4), Math.max(1, playerDrawH - 4));
  }

  if (imageReady(frameImage)) {
    ctx.drawImage(frameImage, drawX, drawY, playerDrawW, playerDrawH);
    return;
  }

  if (imageReady(playerSpriteImage)) {
    ctx.drawImage(
      playerSpriteImage,
      frameIndex * PLAYER_SPRITE_SIZE,
      0,
      PLAYER_SPRITE_SIZE,
      PLAYER_SPRITE_SIZE,
      drawX,
      drawY,
      playerDrawW,
      playerDrawH,
    );
    return;
  }

  // Fallback: sprite images not loaded yet.
  drawActorShadow(sx + 2, sy + 14, 12);
  ctx.fillStyle = "#2b1a18";
  ctx.fillRect(sx + 4, sy + bob, 8, 3);
  ctx.fillStyle = "#ffd68e";
  ctx.fillRect(sx + 5, sy + 3 + bob, 6, 5);
  ctx.fillStyle = "#d87aa8";
  ctx.fillRect(sx + 4, sy + 8 + bob, 8, 6);
  ctx.fillStyle = "#f5f5ff";
  ctx.fillRect(sx + 3, sy + 9 + bob, 2, 4);
  ctx.fillRect(sx + 11, sy + 9 + bob, 2, 4);
  ctx.fillStyle = "#ff8ab3";
  ctx.fillRect(sx + 11, sy + bob, 3, 2);
  drawWeapon(sx + 2, sy + bob);
}

function drawActorShadow(sx, sy, w) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(sx, sy, w, 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(sx + 2, sy - 1, Math.max(1, w - 4), 1);
}

function drawWeapon(sx, sy) {
  const colors = ["#a86132", "#c9783d", "#d7e2ea", "#b5f2ff", "#ffd166", "#8dd7ff", "#ff9a3d", "#f8fbff", "#b990ff", "#e36dff", "#d8d8ff", "#b8c0cc"];
  ctx.fillStyle = colors[player.weapon] || "#ffd166";
  if (player.dir === "up") ctx.fillRect(sx + 5, sy - 4, 2, 7);
  if (player.dir === "down") ctx.fillRect(sx + 5, sy + 10, 2, 7);
  if (player.dir === "left") ctx.fillRect(sx - 4, sy + 6, 7, 2);
  if (player.dir === "right") ctx.fillRect(sx + 8, sy + 6, 7, 2);
}

function drawMonster(monster, sx, sy) {
  if (sy > VIEW_H || sx < -30 || sx > W + 10) return;
  const mainColor = monster.hurt > 0 ? "#ffffff" : monster.color;
  const spriteW = worldToDraw(monster.w);
  const spriteH = worldToDraw(monster.h);
  drawActorShadow(sx + 1, sy + spriteH - 1, spriteW);
  if (monster.windup > 0) {
    ctx.strokeStyle = "#ffef8a";
    ctx.strokeRect(sx - 2, sy - 2, spriteW + 4, spriteH + 4);
  }
  if (monster.type === "dragon" || monster.type === "eclipseDragon" || monster.type === "voidDragon" || monster.type === "frostDragon") {
    drawDragon(monster, sx, sy);
    return;
  }
  if (monster.type === "bat") {
    const flap = Math.floor(monster.age / 160) % 2;
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx - 1, sy + 4 + flap, 6, 4);
    ctx.fillRect(sx + 8, sy + 4 + flap, 6, 4);
    ctx.fillRect(sx + 1, sy + 7 + flap, 3, 2);
    ctx.fillRect(sx + 9, sy + 7 + flap, 3, 2);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 2, 6, 7);
    ctx.fillRect(sx + 3, sy, 2, 2);
    ctx.fillRect(sx + 9, sy, 2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 5, sy + 4, 1, 1);
    ctx.fillRect(sx + 8, sy + 4, 1, 1);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(sx + 6, sy + 8, 1, 2);
    ctx.fillRect(sx + 8, sy + 8, 1, 2);
  } else if (monster.type === "frostMoth") {
    const flap = Math.floor(monster.age / 130) % 2;
    ctx.fillStyle = "rgba(185, 244, 255, 0.32)";
    ctx.fillRect(sx - 2, sy + 2 - flap, 16, 11);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx - 1, sy + 4 + flap, 6, 7);
    ctx.fillRect(sx + 9, sy + 4 + flap, 6, 7);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 2, 6, 10);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 5, sy + 5, 2, 2);
    ctx.fillRect(sx + 9, sy + 5, 2, 2);
    ctx.fillStyle = "#8dd7ff";
    ctx.fillRect(sx + 6, sy, 3, 3);
  } else if (monster.type === "wisp") {
    ctx.fillStyle = "rgba(255, 219, 82, 0.36)";
    ctx.fillRect(sx + 1, sy + 3, 10, 9);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 5, 8, 7);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 1, 5, 9);
    ctx.fillStyle = "#ff9a3d";
    ctx.fillRect(sx + 5, sy, 3, 3);
    ctx.fillRect(sx + 7, sy + 7, 2, 4);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 5, sy + 4, 2, 2);
  } else if (monster.type === "bubbler") {
    const pulse = Math.floor(monster.age / 180) % 2;
    ctx.fillStyle = "rgba(141, 215, 255, 0.35)";
    ctx.fillRect(sx + 1, sy + 2 - pulse, 11, 10);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 6, 9, 6);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 3, 8, 8);
    ctx.fillRect(sx + 5, sy + 1, 5, 5);
    ctx.fillStyle = "#eaffff";
    ctx.fillRect(sx + 5, sy + 4, 2, 2);
    ctx.fillRect(sx + 9, sy + 3, 2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 11, sy + 1 - pulse, 3, 3);
    ctx.fillRect(sx + 13, sy + 6, 2, 2);
  } else if (monster.type === "vaultLeech") {
    const pulse = Math.floor(monster.age / 130) % 2;
    ctx.fillStyle = "rgba(215, 138, 183, 0.24)";
    ctx.fillRect(sx - 1 - pulse, sy + 2 - pulse, 15 + pulse * 2, 12 + pulse * 2);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 7, 12, 6);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 2, 8, 10);
    ctx.fillRect(sx + 1, sy + 6, 12, 5);
    ctx.fillStyle = "#fff2ff";
    ctx.fillRect(sx + 4, sy + 5, 2, 2);
    ctx.fillRect(sx + 9, sy + 5, 2, 2);
    ctx.fillStyle = "#ffef8a";
    ctx.fillRect(sx + 5, sy + 10, 2, 3);
    ctx.fillRect(sx + 9, sy + 10, 2, 3);
  } else if (monster.type === "cryptWarden") {
    const pulse = Math.floor(monster.age / 150) % 2;
    ctx.fillStyle = "rgba(215, 178, 109, 0.24)";
    ctx.fillRect(sx - 3 - pulse, sy - pulse, 25 + pulse * 2, 21 + pulse * 2);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 7, 17, 13);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 2, 11, 15);
    ctx.fillRect(sx + 1, sy + 8, 17, 8);
    ctx.fillStyle = "#fff2a6";
    ctx.fillRect(sx + 6, sy + 5, 2, 2);
    ctx.fillRect(sx + 12, sy + 5, 2, 2);
    ctx.fillStyle = "#49351f";
    ctx.fillRect(sx + 4, sy + 17, 5, 3);
    ctx.fillRect(sx + 11, sy + 17, 5, 3);
    ctx.fillStyle = "#d78ab7";
    ctx.fillRect(sx + 18, sy + 3, 2, 14);
    ctx.fillRect(sx + 16, sy + 2 + pulse, 6, 2);
  } else if (monster.type === "shieldSoldier") {
    const guardX = monster.dir === "left" ? sx + 1 : monster.dir === "right" ? sx + 8 : sx + 3;
    const guardY = monster.dir === "up" ? sy + 1 : sy + 5;
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 5, 9, 7);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 2, 6, 4);
    ctx.fillRect(sx + 3, sy + 6, 8, 7);
    ctx.fillStyle = "#202632";
    ctx.fillRect(guardX, guardY, 5, 7);
    ctx.fillStyle = "#d7e2ea";
    ctx.fillRect(guardX + 1, guardY + 1, 3, 5);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(sx + 10, sy + 5, 2, 8);
  } else if (monster.type === "summoner") {
    const pulse = Math.floor(monster.age / 180) % 2;
    ctx.fillStyle = "rgba(214, 120, 255, 0.24)";
    ctx.fillRect(sx, sy + 2 - pulse, 13, 12);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 5, 9, 8);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 3, 7, 9);
    ctx.fillRect(sx + 4, sy + 1, 5, 4);
    ctx.fillStyle = "#fff2ff";
    ctx.fillRect(sx + 5, sy + 5, 2, 2);
    ctx.fillRect(sx + 8, sy + 5, 2, 2);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(sx + 11, sy + 2, 2, 9);
    ctx.fillStyle = "#d678ff";
    ctx.fillRect(sx + 10, sy + pulse, 4, 2);
  } else if (monster.type === "trapFlower") {
    const pulse = monster.trapPrimed ? Math.floor(monster.age / 80) % 2 : Math.floor(monster.age / 220) % 2;
    ctx.fillStyle = monster.trapPrimed ? "rgba(255, 94, 159, 0.42)" : "rgba(255, 94, 159, 0.18)";
    ctx.fillRect(sx - 1 - pulse, sy + 4 - pulse, 15 + pulse * 2, 10 + pulse * 2);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 3, sy + 9, 8, 4);
    ctx.fillStyle = "#315d2c";
    ctx.fillRect(sx + 6, sy + 6, 2, 6);
    ctx.fillRect(sx + 3, sy + 9, 4, 2);
    ctx.fillRect(sx + 8, sy + 8, 4, 2);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 3, 6, 5);
    ctx.fillRect(sx + 2, sy + 5, 10, 3);
    ctx.fillStyle = monster.trapPrimed ? "#fff2a6" : "#ffcee5";
    ctx.fillRect(sx + 6, sy + 4, 2, 2);
    if (monster.trapPrimed) {
      ctx.strokeStyle = pulse ? "#fff2a6" : "#ff5e9f";
      ctx.strokeRect(sx - 2, sy + 1, 16, 14);
    }
  } else if (monster.type === "obsidianCrawler") {
    const pulse = Math.floor(monster.age / 150) % 2;
    ctx.fillStyle = "rgba(141, 215, 255, 0.18)";
    ctx.fillRect(sx, sy + 3 - pulse, 13, 10);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 7, 12, 5);
    ctx.fillRect(sx - 1, sy + 9, 4, 3);
    ctx.fillRect(sx + 10, sy + 9, 4, 3);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 2, sy + 4, 9, 7);
    ctx.fillRect(sx + 4, sy + 1, 5, 5);
    ctx.fillStyle = "#d7e2ea";
    ctx.fillRect(sx + 4, sy + 5, 2, 2);
    ctx.fillRect(sx + 9, sy + 5, 2, 2);
    ctx.fillStyle = "#8dd7ff";
    ctx.fillRect(sx + 6, sy, 3, 2);
    ctx.fillRect(sx + 12, sy + 2 - pulse, 3, 3);
  } else if (monster.type === "voidWraith") {
    const pulse = Math.floor(monster.age / 130) % 2;
    ctx.fillStyle = "rgba(216, 216, 255, 0.22)";
    ctx.fillRect(sx - 1, sy + 1 - pulse, 14, 12);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 4, 10, 9);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 2, 7, 10);
    ctx.fillRect(sx + 1, sy + 8, 11, 4);
    ctx.fillStyle = "#d8d8ff";
    ctx.fillRect(sx + 4, sy + 5, 2, 2);
    ctx.fillRect(sx + 8, sy + 5, 2, 2);
    ctx.fillStyle = "#6de4ff";
    ctx.fillRect(sx + 6, sy, 3, 3);
  } else if (monster.type === "boar") {
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 5, 11, 6);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 2, sy + 3, 9, 7);
    ctx.fillRect(sx + 9, sy + 5, 4, 4);
    ctx.fillStyle = "#f8d4a0";
    ctx.fillRect(sx + 3, sy + 2, 2, 2);
    ctx.fillRect(sx + 8, sy + 2, 2, 2);
    ctx.fillRect(sx + 12, sy + 6, 2, 1);
    ctx.fillRect(sx + 12, sy + 8, 2, 1);
    ctx.fillStyle = "#352013";
    ctx.fillRect(sx + 3, sy + 10, 2, 2);
    ctx.fillRect(sx + 8, sy + 10, 2, 2);
  } else if (monster.type === "frostBeast") {
    ctx.fillStyle = "rgba(185, 244, 255, 0.2)";
    ctx.fillRect(sx - 2, sy + 2, 18, 13);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 6, 13, 8);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 2, sy + 3, 11, 9);
    ctx.fillRect(sx + 11, sy + 5, 5, 5);
    ctx.fillStyle = "#d9f7ff";
    ctx.fillRect(sx + 3, sy, 3, 5);
    ctx.fillRect(sx + 10, sy, 3, 5);
    ctx.fillStyle = "#315d7a";
    ctx.fillRect(sx + 12, sy + 6, 2, 2);
  } else if (monster.type === "guardian") {
    const pulse = Math.floor(monster.age / 180) % 2;
    ctx.fillStyle = "rgba(85, 199, 160, 0.28)";
    ctx.fillRect(sx - 2, sy + 2 - pulse, 22, 17);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 6, 14, 11);
    ctx.fillRect(sx - 1, sy + 9, 5, 5);
    ctx.fillRect(sx + 14, sy + 9, 5, 5);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 2, 12, 13);
    ctx.fillRect(sx + 1, sy + 7, 16, 7);
    ctx.fillStyle = "#d8fff1";
    ctx.fillRect(sx + 5, sy + 5, 2, 2);
    ctx.fillRect(sx + 11, sy + 5, 2, 2);
    ctx.fillStyle = "#1d5c4b";
    ctx.fillRect(sx + 4, sy + 15, 4, 3);
    ctx.fillRect(sx + 11, sy + 15, 4, 3);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(sx + 8, sy, 3, 4);
  } else if (monster.type === "obsidianGolem") {
    const pulse = Math.floor(monster.age / 140) % 2;
    ctx.fillStyle = "rgba(141, 215, 255, 0.22)";
    ctx.fillRect(sx - 4, sy + 1 - pulse, 26, 20);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 7, 15, 13);
    ctx.fillRect(sx - 3, sy + 10, 7, 7);
    ctx.fillRect(sx + 16, sy + 10, 7, 7);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 3, 13, 14);
    ctx.fillRect(sx + 1, sy + 8, 17, 8);
    ctx.fillStyle = "#d7e2ea";
    ctx.fillRect(sx + 6, sy + 6, 2, 2);
    ctx.fillRect(sx + 12, sy + 6, 2, 2);
    ctx.fillStyle = "#111522";
    ctx.fillRect(sx + 4, sy + 17, 5, 3);
    ctx.fillRect(sx + 12, sy + 17, 5, 3);
    ctx.fillStyle = "#8dd7ff";
    ctx.fillRect(sx + 8, sy, 4, 4);
    ctx.fillRect(sx + 19, sy + 8, 4 + pulse, 2);
  } else if (monster.type === "frostGolem") {
    const pulse = Math.floor(monster.age / 130) % 2;
    ctx.fillStyle = "rgba(185, 244, 255, 0.3)";
    ctx.fillRect(sx - 4 - pulse, sy - pulse, 27 + pulse * 2, 22 + pulse * 2);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 2, sy + 7, 16, 14);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 3, 14, 15);
    ctx.fillRect(sx, sy + 9, 21, 8);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 6, sy + 6, 2, 2);
    ctx.fillRect(sx + 13, sy + 6, 2, 2);
    ctx.fillStyle = "#315d7a";
    ctx.fillRect(sx + 4, sy + 18, 5, 3);
    ctx.fillRect(sx + 12, sy + 18, 5, 3);
  } else if (monster.type === "warden") {
    const pulse = Math.floor(monster.age / 150) % 2;
    ctx.fillStyle = "rgba(109, 228, 255, 0.26)";
    ctx.fillRect(sx - 2, sy + 1 - pulse, 22, 18);
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 3, sy + 5, 13, 12);
    ctx.fillRect(sx - 1, sy + 8, 5, 6);
    ctx.fillRect(sx + 14, sy + 8, 5, 6);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 4, sy + 2, 11, 13);
    ctx.fillRect(sx + 2, sy + 7, 15, 7);
    ctx.fillStyle = "#eaffff";
    ctx.fillRect(sx + 6, sy + 5, 2, 2);
    ctx.fillRect(sx + 11, sy + 5, 2, 2);
    ctx.fillStyle = "#1d4f78";
    ctx.fillRect(sx + 4, sy + 15, 4, 3);
    ctx.fillRect(sx + 11, sy + 15, 4, 3);
    ctx.fillStyle = "#fff2a6";
    ctx.fillRect(sx + 8, sy, 3, 4);
  } else if (monster.type === "dragonling") {
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 3, 12, 10);
    ctx.fillRect(sx - 1, sy + 6, 4, 5);
    ctx.fillRect(sx + 11, sy + 6, 4, 5);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 3, sy + 1, 8, 10);
    ctx.fillRect(sx + 9, sy + 4, 5, 4);
    ctx.fillStyle = "#ffcf5a";
    ctx.fillRect(sx + 6, sy + 5, 2, 2);
    ctx.fillStyle = "#ffd6a8";
    ctx.fillRect(sx + 2, sy, 2, 3);
    ctx.fillRect(sx + 10, sy, 2, 3);
    ctx.fillStyle = "#6b0d0b";
    ctx.fillRect(sx + 1, sy + 11, 3, 2);
    ctx.fillRect(sx + 9, sy + 11, 3, 2);
  } else {
    ctx.fillStyle = monster.shadow;
    ctx.fillRect(sx + 1, sy + 7, 10, 4);
    ctx.fillStyle = mainColor;
    ctx.fillRect(sx + 2, sy + 3, 8, 8);
    ctx.fillRect(sx + 4, sy + 1, 4, 3);
    ctx.fillStyle = "#8dff8b";
    ctx.fillRect(sx + 4, sy + 3, 4, 1);
    ctx.fillStyle = "#eafff0";
    ctx.fillRect(sx + 4, sy + 5, 1, 1);
    ctx.fillRect(sx + 7, sy + 5, 1, 1);
  }
  drawMonsterHp(monster, sx, sy);
}

function drawDragon(monster, sx, sy) {
  const mainColor = monster.hurt > 0 ? "#ffffff" : monster.color;
  const pulse = Math.floor(monster.age / 140) % 2;
  const eclipse = monster.type === "eclipseDragon";
  const voidBoss = monster.type === "voidDragon";
  const frostBoss = monster.type === "frostDragon";
  ctx.fillStyle = frostBoss
    ? (monster.enraged ? "rgba(217, 247, 255, 0.48)" : "rgba(141, 215, 255, 0.3)")
    : voidBoss
    ? (monster.enraged ? "rgba(109, 228, 255, 0.36)" : "rgba(216, 216, 255, 0.22)")
    : eclipse
    ? (monster.enraged ? "rgba(227, 109, 255, 0.42)" : "rgba(127, 140, 255, 0.28)")
    : (monster.enraged ? "rgba(255, 42, 42, 0.38)" : "rgba(255, 88, 42, 0.25)");
  ctx.fillRect(sx - (monster.enraged ? 6 : 3), sy + 4 - pulse, monster.enraged ? 36 : 30, 18);
  ctx.fillStyle = monster.shadow;
  ctx.fillRect(sx - 5, sy + 6, 9, 10);
  ctx.fillRect(sx + 17, sy + 5, 9, 11);
  ctx.fillRect(sx + 1, sy + 7, 22, 13);
  ctx.fillStyle = mainColor;
  ctx.fillRect(sx - 4, sy + 8, 8, 6);
  ctx.fillRect(sx + 18, sy + 7, 8, 7);
  ctx.fillRect(sx + 5, sy + 4, 13, 14);
  ctx.fillRect(sx + 16, sy + 8, 8, 8);
  ctx.fillStyle = frostBoss ? "#b9f4ff" : voidBoss ? "#d8d8ff" : eclipse ? "#7f8cff" : "#ff8c3e";
  ctx.fillRect(sx + 1, sy + 6, 7, 6);
  ctx.fillRect(sx + 10, sy, 3, 5);
  ctx.fillRect(sx + 16, sy, 3, 5);
  ctx.fillStyle = frostBoss ? "#ffffff" : voidBoss ? "#6de4ff" : eclipse ? "#e36dff" : "#ffd166";
  ctx.fillRect(sx + 11, sy - 2, 2, 3);
  ctx.fillRect(sx + 17, sy - 2, 2, 3);
  ctx.fillRect(sx + 9, sy + 9, 2, 2);
  ctx.fillRect(sx + 13, sy + 12, 2, 2);
  ctx.fillStyle = frostBoss ? "#315d7a" : voidBoss ? "#ffffff" : eclipse ? "#fff2ff" : "#fff2a6";
  ctx.fillRect(sx + 18, sy + 10, 2, 2);
  ctx.fillStyle = "#211010";
  ctx.fillRect(sx + 21, sy + 11, 2, 1);
  ctx.fillStyle = frostBoss ? "#8dd7ff" : voidBoss ? "#6de4ff" : eclipse ? "#e36dff" : "#ff4e36";
  ctx.fillRect(sx + 24, sy + 10, 4 + pulse, 2);
  ctx.fillStyle = frostBoss ? "#ffffff" : voidBoss ? "#d8d8ff" : eclipse ? "#9fb3ff" : "#fff2a6";
  ctx.fillRect(sx + 26, sy + 10, 2, 1);
  drawMonsterHp(monster, sx, sy - 3);
}

function drawMonsterHp(monster, sx, sy) {
  if (monster.hp >= monster.hpMax && monster.hurt <= 0) return;
  const w = monster.boss ? 24 : 13;
  ctx.fillStyle = "#111";
  ctx.fillRect(sx, sy - 5, w, 3);
  ctx.fillStyle = monster.boss ? "#ff4949" : "#f8e44a";
  const fill = Math.floor((w - 2) * clamp(monster.hp / monster.hpMax, 0, 1));
  ctx.fillRect(sx + 1, sy - 4, fill, 1);
}

function drawEffects(cam) {
  if (state.pointerMove) {
    const pointerX = Math.round(worldToDraw(state.pointerMove.x));
    const pointerY = Math.round(worldToDraw(state.pointerMove.y));
    ctx.strokeStyle = "rgba(109, 228, 255, 0.9)";
    ctx.strokeRect(pointerX - 4, pointerY - 4, 8, 8);
    ctx.fillStyle = "rgba(109, 228, 255, 0.55)";
    ctx.fillRect(pointerX - 1, pointerY - 1, 2, 2);
  }

  for (const p of state.projectiles) {
    const sx = Math.round(screenX(p.x, cam));
    const sy = Math.round(screenY(p.y, cam));
    const radius = worldToDraw(p.r);
    ctx.fillStyle = "rgba(255, 120, 58, 0.32)";
    ctx.fillRect(sx - radius - 1, sy - radius - 1, radius * 2 + 2, radius * 2 + 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
    ctx.fillStyle = "#fff2a6";
    ctx.fillRect(sx - 1, sy - 1, 2, 2);
  }

  for (const r of state.rings) {
    const t = 1 - r.life / r.max;
    const radius = Math.max(2, Math.floor(worldToDraw(r.radius) * t));
    const x = Math.round(screenX(r.x, cam));
    const y = Math.round(screenY(r.y, cam));
    ctx.globalAlpha = clamp(r.life / r.max, 0, 1);
    ctx.strokeStyle = r.color;
    ctx.strokeRect(x - radius, y - Math.floor(radius * 0.55), radius * 2, Math.max(3, Math.floor(radius * 1.1)));
    ctx.globalAlpha = 1;
  }

  for (const s of state.slashes) {
    const alpha = clamp(s.life / s.max, 0, 1);
    const x = Math.round(screenX(s.x, cam));
    const y = Math.round(screenY(s.y, cam));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    if (s.dir === "left" || s.dir === "right") {
      ctx.fillRect(x - 7, y - 1, 14, 2);
      ctx.fillRect(x - 3, y - 4, 7, 1);
      ctx.fillRect(x - 3, y + 3, 7, 1);
    } else {
      ctx.fillRect(x - 1, y - 7, 2, 14);
      ctx.fillRect(x - 4, y - 3, 1, 7);
      ctx.fillRect(x + 3, y - 3, 1, 7);
    }
    ctx.globalAlpha = 1;
  }

  for (const p of state.particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(screenX(p.x, cam)), Math.round(screenY(p.y, cam)), 2, 2);
  }

  ctx.font = "8px monospace";
  ctx.textAlign = "center";
  for (const f of state.floaters) {
    ctx.globalAlpha = clamp(f.life / f.max, 0, 1);
    ctx.fillStyle = "#000";
    ctx.fillText(f.text, Math.round(screenX(f.x, cam)) + 1, Math.round(screenY(f.y, cam)) + 1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, Math.round(screenX(f.x, cam)), Math.round(screenY(f.y, cam)));
    ctx.globalAlpha = 1;
  }
}

function drawScreenGrade(cam) {
  const tx = worldTileX(player.x + player.w / 2);
  const ty = worldTileY(player.y + player.h / 2);
  const inCave = (tx >= 47 && tx <= 55 && ty >= 10 && ty <= 19) || (tx >= 80 && tx <= 119 && ty >= 1 && ty <= 14);
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  gradient.addColorStop(0, inCave ? "rgba(35, 10, 8, 0.18)" : "rgba(255, 244, 192, 0.08)");
  gradient.addColorStop(0.52, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, VIEW_H);

  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, 0, 3, VIEW_H);
  ctx.fillRect(W - 3, 0, 3, VIEW_H);
  ctx.fillRect(0, 0, W, 2);
}

function drawObjective() {
  const text = objectiveText();
  const guide = guidanceText();
  ctx.font = "7px monospace";
  ctx.textAlign = "left";
  const w = Math.min(W - 10, Math.max(132, Math.max(text.length, guide.length) * 7 + 9));
  ctx.fillStyle = "rgba(5, 8, 18, 0.72)";
  ctx.fillRect(5, 5, w, 23);
  ctx.strokeStyle = "rgba(255, 209, 102, 0.74)";
  ctx.strokeRect(5, 5, w, 23);
  ctx.fillStyle = "#fff2a6";
  ctx.fillText(text, 9, 14);
  ctx.fillStyle = inTown(player.x, player.y) ? "#74ff8f" : player.hp / player.hpMax < 0.35 ? "#ff8a3d" : "#d7e2ea";
  ctx.fillText(guide, 9, 24);
}

function drawContextPrompt() {
  const text = contextPromptText();
  if (!text) return;
  ctx.font = "7px monospace";
  ctx.textAlign = "left";
  const w = Math.min(W - 10, Math.max(74, text.length * 7 + 12));
  const x = 5;
  const y = 31;
  ctx.fillStyle = "rgba(5, 8, 18, 0.68)";
  ctx.fillRect(x, y, w, 12);
  ctx.strokeStyle = "rgba(109, 228, 255, 0.72)";
  ctx.strokeRect(x, y, w, 12);
  ctx.fillStyle = "#d7e2ea";
  ctx.fillText(text, x + 5, y + 9);
}

function drawHud() {
  ctx.fillStyle = "#07111c";
  ctx.fillRect(0, VIEW_H, W, HUD_H);
  ctx.fillStyle = "#162a3a";
  ctx.fillRect(0, VIEW_H, W, 2);
  ctx.strokeStyle = "#6de4ff";
  ctx.strokeRect(1, VIEW_H + 1, W - 2, HUD_H - 2);

  ctx.font = "8px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`LV ${player.level}`, 5, VIEW_H + 10);
  ctx.fillText(`G ${player.gold}`, 5, VIEW_H + 22);

  drawBar(43, VIEW_H + 5, 68, 7, player.hp / player.hpMax, "#54d66f", "#ff5252");
  drawBar(43, VIEW_H + 18, 68, 5, player.xp / player.xpNext, "#6de4ff", "#1b367e");
  drawBar(43, VIEW_H + 26, 68, 4, player.stamina / player.staminaMax, "#ffd166", "#7d4d20");

  ctx.fillStyle = "#ffffff";
  ctx.fillText(`HP ${Math.ceil(player.hp)}/${player.hpMax}`, 116, VIEW_H + 10);
  ctx.fillText(`EXP ${player.xp}/${player.xpNext}`, 116, VIEW_H + 22);
  const status = player.burn > 0 ? "燃" : player.slow > 0 ? "鈍" : "";
  ctx.fillText(`ST ${Math.floor(player.stamina)}${status}`, 116, VIEW_H + 30);

  drawItemChip(183, VIEW_H + 5);
  drawMiniCompass(216, VIEW_H + 8);
}

function drawItemChip(x, y) {
  const labels = { potion: "薬", bomb: "爆", ward: "護" };
  ctx.fillStyle = "#0d1724";
  ctx.fillRect(x, y, 28, 19);
  ctx.strokeStyle = player.guard > 0 ? "#6de4ff" : "#ffd166";
  ctx.strokeRect(x, y, 28, 19);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(({ tonic: "活", elixir: "霊", warp: "帰" }[player.selectedItem]) || labels[player.selectedItem] || "?", x + 4, y + 8);
  ctx.fillStyle = "#fff2a6";
  ctx.fillText(String(selectedItemCount()), x + 17, y + 17);
  if (player.combo > 0) {
    ctx.fillStyle = "#6de4ff";
    ctx.fillText(`${player.combo}連`, x - 1, y + 28);
  }
}

function drawBar(x, y, w, h, t, good, bad) {
  ctx.fillStyle = "#111827";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#f4f4f4";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = t > 0.28 ? good : bad;
  ctx.fillRect(x + 1, y + 1, Math.max(0, Math.floor((w - 2) * clamp(t, 0, 1))), h - 2);
}

function drawMiniCompass(x, y) {
  ctx.fillStyle = "#0a1038";
  ctx.fillRect(x, y, 20, 18);
  ctx.strokeStyle = "#8dd7ff";
  ctx.strokeRect(x, y, 20, 18);
  ctx.fillStyle = "#ffffff";
  const p = { up: [10, 3], right: [15, 8], down: [10, 13], left: [5, 8] }[player.dir];
  ctx.fillRect(x + p[0] - 1, y + p[1] - 1, 3, 3);
}

function drawOverlay(title, small) {
  ctx.fillStyle = "rgba(0,0,0,0.64)";
  ctx.fillRect(0, 0, W, VIEW_H);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "16px monospace";
  ctx.fillText(title, W / 2, 65);
  ctx.font = "8px monospace";
  ctx.fillText(small === "R" ? "R" : "CLEAR", W / 2, 80);
}

function drawEndingOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, W, VIEW_H);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "16px monospace";
  const title = state.chapter4Reported ? "CHAPTER 4 CLEAR" : state.chapter3Reported ? "CHAPTER 3 CLEAR" : state.chapter2Reported ? "CHAPTER 2 CLEAR" : "QUEST CLEAR";
  const line1 = state.chapter4Reported ? "霜冠竜は封じられた" : state.chapter3Reported ? "黒陽竜は封じられた" : state.chapter2Reported ? "月蝕竜は封じられた" : "赤竜は封じられた";
  const line2 = state.chapter4Reported ? "白銀宿から新たな国への道が続く" : state.chapter3Reported ? "黒門砦からさらに遠征路が開く" : state.chapter2Reported ? "月見砦の灯がさらに南を照らす" : "村に朝が戻り 旅は語り継がれる";
  ctx.fillText(title, W / 2, 52);
  ctx.font = "8px monospace";
  ctx.fillStyle = "#fff2a6";
  ctx.fillText(line1, W / 2, 70);
  ctx.fillStyle = "#d7e2ea";
  ctx.fillText(line2, W / 2, 84);
  ctx.fillStyle = "#74ff8f";
  ctx.fillText("N: 旅を続ける", W / 2, 103);
}

function drawVictoryBanner() {
  ctx.fillStyle = "rgba(5, 8, 18, 0.82)";
  ctx.fillRect(24, 25, W - 48, 34);
  ctx.strokeStyle = "#ffd166";
  ctx.strokeRect(24, 25, W - 48, 34);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff2a6";
  ctx.font = "10px monospace";
  ctx.fillText(state.chapter4Victory ? "FROST CROWN SEALED" : state.chapter3Victory ? "BLACK SUN SEALED" : state.chapter2Victory ? "ECLIPSE SEALED" : "DRAGON SEALED", W / 2, 39);
  ctx.font = "7px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(state.chapter4Victory ? "長老へ第4章の報告" : state.chapter3Victory ? "長老へ第3章の報告" : state.chapter2Victory ? "長老へ第2章の報告" : "村へ戻り長老に報告", W / 2, 52);
}
  globalThis.DRAGON_HUNTER_RENDER = {
    draw,
  };
})();
