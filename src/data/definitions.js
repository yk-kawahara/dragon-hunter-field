"use strict";

(() => {
  const BASE_TILE = 16;
  const WORLD_SCALE = 2;
  const W = 240 * WORLD_SCALE;
  const H = 176 * WORLD_SCALE;
  const VIEW_H = 144 * WORLD_SCALE;
  const HUD_H = H - VIEW_H;
  const TILE = BASE_TILE * WORLD_SCALE;
  const MAP_W = 80;
  const MAP_H = 72;
  const SAVE_KEY = "dragon-hunter-field-save-v2-32px";
  const HEAL_CIRCLE = { x: 6, y: 48 };
  const TOWN_GATES = [
    { name: "北門", x: 10, y: 39, w: 3, h: 1, axis: "x" },
    { name: "東門", x: 18, y: 48, w: 1, h: 3, axis: "y" },
  ];
  const TREASURE_CHESTS = [
    { id: "town-cache", x: 17, y: 53, reward: "starter" },
    { id: "north-ruin", x: 18, y: 17, reward: "weapon" },
    { id: "river-shrine", x: 42, y: 33, reward: "ward" },
    { id: "east-grove", x: 56, y: 43, reward: "armor" },
    { id: "dragon-cache", x: 50, y: 16, reward: "scale" },
  ];
  const DISCOVERY_POINTS = [
    { id: "river-spring", x: 43, y: 36, kind: "spring" },
    { id: "north-ore", x: 23, y: 20, kind: "ore" },
    { id: "hunter-cache", x: 57, y: 28, kind: "cache" },
  ];
  const GUARDIAN_SITE = { x: 20, y: 16 };
  const BOSS_REQUIREMENTS = { level: 4, scales: 3 };
  const REGION_SPAWNS = {
    grassland: { danger: 1, maxBonus: 0, pool: ["slime", "slime", "bat"] },
    wilds: { danger: 2, maxBonus: 1, pool: ["bat", "boar", "slime", "wisp"] },
    north: { danger: 2, maxBonus: 2, pool: ["boar", "boar", "bat", "wisp"] },
    east: { danger: 3, maxBonus: 3, pool: ["wisp", "boar", "dragonling", "bat"] },
    cave: { danger: 4, maxBonus: 4, pool: ["dragonling", "wisp", "dragonling"] },
  };

  const TILE_GRASS = 0;
  const TILE_PATH = 1;
  const TILE_WATER = 2;
  const TILE_TREE = 3;
  const TILE_WALL = 4;
  const TILE_ROOF = 5;
  const TILE_FLOOR = 6;
  const TILE_CAVE = 7;
  const TILE_FLOWER = 8;
  const TILE_FIELD = 9;

  const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const ATTACK_RANGE = 24 * WORLD_SCALE;
  const ATTACK_WIDTH = 20 * WORLD_SCALE;
  const DASH_COST = 34;

  const weaponNames = ["木剣", "銅剣", "鉄剣", "銀剣", "竜剣"];
  const armorNames = ["布服", "革鎧", "鎖鎧", "鋼鎧", "竜鎧"];
  const weaponTraits = ["基本", "正面", "側撃", "背撃", "竜特効"];
  const armorTraits = ["軽装", "疾走", "受け", "護符", "竜耐性"];
  const weaponCosts = [0, 38, 90, 180, 340];
  const armorCosts = [0, 34, 86, 175, 330];
  const armorDefense = [0, 5, 10, 17, 26];
  const itemOrder = ["potion", "bomb", "ward"];

  const monsterTypes = {
    slime: {
      name: "スライム",
      hp: 18,
      atk: 8,
      def: 0,
      speed: 18 * WORLD_SCALE,
      xp: 10,
      gold: 5,
      color: "#4dd455",
      shadow: "#197a25",
      drop: 0.04,
    },
    bat: {
      name: "コウモリ",
      hp: 14,
      atk: 11,
      def: 0,
      speed: 34 * WORLD_SCALE,
      xp: 14,
      gold: 7,
      color: "#8a52d6",
      shadow: "#3b196c",
      drop: 0.06,
      flying: true,
    },
    boar: {
      name: "突進獣",
      hp: 34,
      atk: 25,
      def: 2,
      speed: 25 * WORLD_SCALE,
      xp: 24,
      gold: 14,
      color: "#b0652d",
      shadow: "#5a2a16",
      drop: 0.12,
    },
    wisp: {
      name: "火霊",
      hp: 28,
      atk: 27,
      def: 1,
      speed: 22 * WORLD_SCALE,
      xp: 32,
      gold: 18,
      color: "#ffdb52",
      shadow: "#c7431e",
      drop: 0.18,
    },
    dragonling: {
      name: "小竜",
      hp: 58,
      atk: 42,
      def: 5,
      speed: 21 * WORLD_SCALE,
      xp: 62,
      gold: 42,
      color: "#d63d31",
      shadow: "#6b0d0b",
      drop: 0.5,
    },
    guardian: {
      name: "森の守護者",
      hp: 150,
      atk: 52,
      def: 6,
      speed: 24 * WORLD_SCALE,
      xp: 180,
      gold: 140,
      color: "#55c7a0",
      shadow: "#1d5c4b",
      midboss: true,
      drop: 1,
    },
    dragon: {
      name: "赤竜",
      hp: 280,
      atk: 107,
      def: 7,
      speed: 18 * WORLD_SCALE,
      xp: 500,
      gold: 500,
      color: "#ec342d",
      shadow: "#7d0808",
      boss: true,
      drop: 1,
    },
  };

  globalThis.DRAGON_HUNTER_DEFINITIONS = {
    BASE_TILE,
    WORLD_SCALE,
    W,
    H,
    VIEW_H,
    HUD_H,
    TILE,
    MAP_W,
    MAP_H,
    SAVE_KEY,
    HEAL_CIRCLE,
    TOWN_GATES,
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    GUARDIAN_SITE,
    BOSS_REQUIREMENTS,
    REGION_SPAWNS,
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
    DIRS,
    ATTACK_RANGE,
    ATTACK_WIDTH,
    DASH_COST,
    weaponNames,
    armorNames,
    weaponTraits,
    armorTraits,
    weaponCosts,
    armorCosts,
    armorDefense,
    itemOrder,
    monsterTypes,
  };
})();
