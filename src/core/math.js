"use strict";

(() => {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hashNoise(x, y) {
    let n = x * 374761393 + y * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    n = (n ^ (n >> 16)) >>> 0;
    return n / 4294967295;
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function centerOf(actor) {
    return { x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 };
  }

  function normalize(x, y) {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len, len };
  }

  function facingDot(actor, target) {
    const dirs = globalThis.DRAGON_HUNTER_DEFINITIONS?.DIRS;
    if (!dirs) throw new Error("DRAGON_HUNTER_DEFINITIONS.DIRS must be loaded before math helpers");
    const a = centerOf(actor);
    const b = centerOf(target);
    const toTarget = normalize(b.x - a.x, b.y - a.y);
    const dir = dirs[actor.dir] || dirs.down;
    return dir.x * toTarget.x + dir.y * toTarget.y;
  }

  function directionFromVector(x, y, current = "down") {
    if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) return current;
    return Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : y > 0 ? "down" : "up";
  }

  function makeRect(x, y, w, h) {
    return { x, y, w, h };
  }

  globalThis.DRAGON_HUNTER_MATH = {
    clamp,
    hashNoise,
    rectsOverlap,
    centerOf,
    normalize,
    facingDot,
    directionFromVector,
    makeRect,
  };
})();
