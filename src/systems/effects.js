"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS || {};
  const WORLD_SCALE = definitions.WORLD_SCALE || 1;
  const worldPx = (value) => value * WORLD_SCALE;

  function addFloater(context, x, y, text, color) {
    const { state } = context;
    state.floaters.push({ x, y, text, color, life: 700, max: 700 });
  }

  function addSlash(context, x, y, dir, color) {
    const { state } = context;
    state.slashes.push({ x, y, dir, color, life: 180, max: 180 });
  }

  function addRing(context, x, y, color, radius = worldPx(32)) {
    const { state } = context;
    state.rings.push({ x, y, color, radius, life: 360, max: 360 });
  }

  function burst(context, x, y, color, count) {
    const { state, rand } = context;
    for (let i = 0; i < count; i += 1) {
      const a = rand(0, Math.PI * 2);
      const speed = rand(worldPx(12), worldPx(42));
      state.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        color,
        life: rand(240, 640),
      });
    }
  }

  function updateEffects(context, dt) {
    const { state, ui } = context;
    state.shake = Math.max(0, state.shake - dt);
    state.floaters = state.floaters.filter((f) => {
      f.y -= dt * 0.023 * WORLD_SCALE;
      f.life -= dt;
      return f.life > 0;
    });
    state.slashes = state.slashes.filter((s) => {
      s.life -= dt;
      return s.life > 0;
    });
    state.rings = state.rings.filter((r) => {
      r.life -= dt;
      return r.life > 0;
    });
    state.telegraphs = (state.telegraphs || []).filter((telegraph) => {
      telegraph.life -= dt;
      return telegraph.life > 0;
    });
    state.particles = state.particles.filter((p) => {
      p.x += p.vx * dt * 0.001;
      p.y += p.vy * dt * 0.001;
      p.vy += 28 * WORLD_SCALE * dt * 0.001;
      p.life -= dt;
      return p.life > 0;
    });

    if (performance.now() > state.messageUntil) {
      ui.toast.classList.remove("show");
    }
  }

  globalThis.DRAGON_HUNTER_EFFECTS = {
    addFloater,
    addSlash,
    addRing,
    burst,
    updateEffects,
  };
})();
