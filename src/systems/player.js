"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before player helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before player helpers");
  }

  const {
    TILE,
    WORLD_SCALE,
    MAP_W,
    MAP_H,
    SAFE_ZONES,
    HEAL_POINTS,
    TOWN_GATES,
    DISCOVERY_POINTS,
    DIRS,
  } = definitions;

  const {
    clamp,
    centerOf,
    normalize,
    directionFromVector,
  } = mathHelpers;

  const worldPx = (value) => value * WORLD_SCALE;
  const safeBaseArrivalMessages = {
    "southwest-camp": "前線キャンプに辿り着いた。新しい安全圏を確保した。廃坑遠征はここから再出発できる",
    "ash-hamlet": "灰道の宿場に辿り着いた。古塔へ向かうための足場ができた",
    "moon-camp": "月見砦に辿り着いた。月影の遠征路に新しい安全圏を確保した",
    "black-market": "黒市都に辿り着いた。危険な裏道の先に大きな補給拠点を得た",
    "black-fort": "黒門砦に辿り着いた。黒陽城へ挑む最後の足場を確保した",
    "frost-haven": "白銀宿に辿り着いた。黒門砦から続く凍土を越え、氷窟と霜冠城へ挑む暖かい安全圏を確保した",
    "east-harbor": "蒼風港に辿り着いた。外洋遠征の補給港を確保した",
    "southwind-outpost": "南風岬砦に辿り着いた。島道の南側に退避拠点を得た",
    "dawn-harbor": "黎明港に辿り着いた。日出大陸への橋頭堡を確保した",
    "suncrest-city": "陽冠都市に辿り着いた。過酷な高原を越え、大遠征の安全圏が広がった",
  };

  function accessoryActive(player, id, legacyFlag) {
    if (Array.isArray(player.equippedAccessories)) return player.equippedAccessories.includes(id);
    if (player.equippedAccessory) return player.equippedAccessory === id;
    return Boolean(player[legacyFlag]);
  }

  function requirePlayerContext(context) {
    if (!context?.state || !context?.player) {
      throw new Error("player helpers require { state, player }");
    }
    if (!context.getCamera || !context.isPassableRect || !context.inTown) {
      throw new Error("player helpers require map/camera helpers");
    }
    if (!context.playerMoveSpeed || !context.regenRate || !context.dashCost) {
      throw new Error("player helpers require combat stat helpers");
    }
    if (!context.addFloater || !context.addRing || !context.burst || !context.say) {
      throw new Error("player helpers require effect/message helpers");
    }
    return context;
  }

  function moveActor(context, actor, dx, dy) {
    const { isPassableRect } = requirePlayerContext(context);
    if (dx !== 0) {
      const nx = clamp(actor.x + dx, 0, MAP_W * TILE - actor.w);
      if (isPassableRect(actor, nx, actor.y)) actor.x = nx;
    }
    if (dy !== 0) {
      const ny = clamp(actor.y + dy, 0, MAP_H * TILE - actor.h);
      if (isPassableRect(actor, actor.x, ny)) actor.y = ny;
    }
  }

  function hasKey(context, code) {
    const { state } = requirePlayerContext(context);
    return state.keys.has(code) || state.virtualKeys.has(code);
  }

  function pointerMoveVector(context) {
    const { state, player, getCamera } = requirePlayerContext(context);
    if (!state.pointerMove) return { x: 0, y: 0 };
    const cam = getCamera();
    const px = player.x + player.w / 2 - cam.x;
    const py = player.y + player.h / 2 - cam.y;
    const dx = state.pointerMove.x - px;
    const dy = state.pointerMove.y - py;
    if (Math.hypot(dx, dy) < worldPx(10)) return { x: 0, y: 0 };
    return normalize(dx, dy);
  }

  function inputMoveVector(context) {
    let dx = 0;
    let dy = 0;
    if (hasKey(context, "ArrowLeft") || hasKey(context, "KeyA")) dx -= 1;
    if (hasKey(context, "ArrowRight") || hasKey(context, "KeyD")) dx += 1;
    if (hasKey(context, "ArrowUp") || hasKey(context, "KeyW")) dy -= 1;
    if (hasKey(context, "ArrowDown") || hasKey(context, "KeyS")) dy += 1;
    return normalize(dx, dy);
  }

  function facingVector(context) {
    const { player } = requirePlayerContext(context);
    return DIRS[player.dir] || DIRS.down;
  }

  function activeAccessory(player, id, legacyFlag) {
    if (Array.isArray(player.equippedAccessories) && player.equippedAccessories.length > 0) {
      return player.equippedAccessories.includes(id);
    }
    if (player.equippedAccessory) return player.equippedAccessory === id;
    return Boolean(player[legacyFlag]);
  }

  function updatePlayer(context, dt) {
    const { state, player, playerMoveSpeed, regenRate, addFloater } = requirePlayerContext(context);
    let { x: dx, y: dy } = inputMoveVector(context);
    if (!dx && !dy) {
      const pointer = pointerMoveVector(context);
      dx = pointer.x;
      dy = pointer.y;
    }

    const n = normalize(dx, dy);
    if (dx || dy) {
      player.dir = directionFromVector(n.x, n.y, player.dir);
      player.step += dt * 0.012;
      moveActor(context, player, n.x * playerMoveSpeed() * dt * 0.001, n.y * playerMoveSpeed() * dt * 0.001);
    }

    player.invuln = Math.max(0, player.invuln - dt);
    player.guard = Math.max(0, player.guard - dt);
    player.slow = Math.max(0, player.slow - dt);
    player.burn = Math.max(0, player.burn - dt);
    player.burnTick = Math.max(0, player.burnTick - dt);
    if (player.burn > 0 && player.burnTick <= 0 && player.hp > 1) {
      player.burnTick = 620;
      player.hp = Math.max(1, player.hp - 1);
      addFloater(player.x + player.w / 2, player.y - 2, "BURN", "#ff8a3d");
    }
    const regen = regenRate();
    if (regen > 0 && player.burn <= 0 && player.hp > 0 && player.hp < player.hpMax) {
      player.hp = Math.min(player.hpMax, player.hp + regen * dt * 0.001);
    }
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    const staminaRegen = activeAccessory(player, "trail", "trailCharm") ? 0.043 : 0.032;
    player.stamina = Math.min(player.staminaMax, player.stamina + dt * staminaRegen);
    player.comboTimer = Math.max(0, player.comboTimer - dt);
    if (player.comboTimer <= 0) player.combo = 0;
    state.searchCooldown = Math.max(0, state.searchCooldown - dt);
    state.healCooldown = Math.max(0, state.healCooldown - dt);
    updateTownGate(context, dt);
    updateSafeBaseArrival(context);
    updateHealCircle(context);
    updateDiscoverySprings(context);
  }

  function safeZoneAtPlayer(player) {
    const tx = Math.floor((player.x + player.w / 2) / TILE);
    const ty = Math.floor((player.y + player.h / 2) / TILE);
    return SAFE_ZONES.find((zone) => (
      tx >= zone.x1 && tx <= zone.x2 && ty >= zone.y1 && ty <= zone.y2
    )) || null;
  }

  function updateSafeBaseArrival(context) {
    const { state, player, addRing, burst, say } = requirePlayerContext(context);
    if (state.gameOver || player.hp <= 0) return;
    const zone = safeZoneAtPlayer(player);
    if (!zone || zone.id === "village") return;
    if (!(state.arrivedSafeBases instanceof Set)) state.arrivedSafeBases = new Set(["village"]);
    if (state.arrivedSafeBases.has(zone.id)) return;
    state.arrivedSafeBases.add(zone.id);
    state.projectiles = [];
    player.stamina = player.staminaMax;
    player.guard = Math.max(player.guard, 1200);
    player.invuln = Math.max(player.invuln, 900);
    const cx = (zone.x1 + zone.x2 + 1) * TILE / 2;
    const cy = (zone.y1 + zone.y2 + 1) * TILE / 2;
    addRing(cx, cy, "#74ff8f", worldPx(44));
    burst(cx, cy, "#fff2a6", 22);
    say(safeBaseArrivalMessages[zone.id] || `${zone.name}に辿り着いた。新しい安全圏を確保した`, 4400);
  }

  function playerNearTownGate(context) {
    const { player } = requirePlayerContext(context);
    const pc = centerOf(player);
    return TOWN_GATES.some((gate) => {
      const gx = (gate.x + gate.w / 2) * TILE;
      const gy = (gate.y + gate.h / 2) * TILE;
      return Math.hypot(pc.x - gx, pc.y - gy) < worldPx(42);
    });
  }

  function updateTownGate(context, dt) {
    const { state, player, inTown, say } = requirePlayerContext(context);
    const playerInsideTown = inTown(player.x, player.y);
    if (playerNearTownGate(context) && !playerInsideTown) {
      state.townGateHold = 1300;
    } else {
      state.townGateHold = Math.max(0, state.townGateHold - dt);
    }
    const nextOpen = state.townGateHold > 0;
    if (nextOpen !== state.townGateOpen) {
      state.townGateOpen = nextOpen;
      say(nextOpen ? "門が開いた" : "門が閉じた", 900);
    }
  }

  function updateHealCircle(context) {
    const { state, player, addRing, burst, say } = requirePlayerContext(context);
    const pc = centerOf(player);
    if (state.healCooldown > 0 || player.hp <= 0) return;
    for (const healPoint of HEAL_POINTS) {
      const hx = (healPoint.x + 0.5) * TILE;
      const hy = (healPoint.y + 0.5) * TILE;
      if (Math.hypot(pc.x - hx, pc.y - hy) > worldPx(11)) continue;
      state.healCooldown = 1400;
      if (player.hp < player.hpMax) {
        player.hp = player.hpMax;
        player.guard = Math.max(player.guard, 900);
        addRing(hx, hy, "#6de4ff", worldPx(30));
        burst(hx, hy, "#74ff8f", 18);
        say(`${healPoint.name}で全回復した`);
      }
      return;
    }
  }

  function updateDiscoverySprings(context) {
    const { state, player, addRing, burst, say } = requirePlayerContext(context);
    for (const spring of DISCOVERY_POINTS.filter((d) => d.kind === "spring" && state.discoveries.has(d.id))) {
      const pc = centerOf(player);
      const sx = (spring.x + 0.5) * TILE;
      const sy = (spring.y + 0.5) * TILE;
      if (Math.hypot(pc.x - sx, pc.y - sy) > worldPx(11) || state.healCooldown > 0 || player.hp <= 0) continue;
      state.healCooldown = 1400;
      player.hp = player.hpMax;
      player.stamina = player.staminaMax;
      player.guard = Math.max(player.guard, 600);
      addRing(sx, sy, "#74ff8f", worldPx(24));
      burst(sx, sy, "#74ff8f", 12);
      say("隠し泉で回復した");
    }
  }

  function dash(context) {
    const { state, player, dashCost, burst, addRing } = requirePlayerContext(context);
    const cost = dashCost();
    if (state.gameOver || player.hp <= 0 || player.dashCooldown > 0 || player.stamina < cost) return;
    const input = inputMoveVector(context);
    const dir = input.x || input.y ? input : facingVector(context);
    const skyStep = accessoryActive(player, "sky", "skyCharm");
    player.stamina = Math.max(0, player.stamina - cost);
    player.dashCooldown = skyStep ? 220 : 320;
    player.invuln = Math.max(player.invuln, skyStep ? 300 : 260);
    player.step += 1;
    for (let i = 0; i < (skyStep ? 7 : 5); i += 1) {
      moveActor(context, player, dir.x * worldPx(7), dir.y * worldPx(7));
      burst(player.x + player.w / 2 - dir.x * worldPx(4), player.y + player.h / 2 - dir.y * worldPx(4), "#6de4ff", 1);
    }
    addRing(player.x + player.w / 2, player.y + player.h / 2, skyStep ? "#d9f7ff" : "#6de4ff", worldPx(skyStep ? 24 : 18));
  }

  globalThis.DRAGON_HUNTER_PLAYER = {
    moveActor,
    hasKey,
    pointerMoveVector,
    inputMoveVector,
    facingVector,
    updatePlayer,
    updateSafeBaseArrival,
    playerNearTownGate,
    updateTownGate,
    updateHealCircle,
    updateDiscoverySprings,
    dash,
  };
})();
