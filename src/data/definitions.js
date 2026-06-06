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
  const SAFE_ZONES = [
    { id: "village", name: "村", x1: 5, y1: 39, x2: 18, y2: 55, outerX1: 4, outerY1: 38, outerX2: 19, outerY2: 57 },
    { id: "southwest-camp", name: "前線キャンプ", x1: 25, y1: 56, x2: 35, y2: 61, outerX1: 24, outerY1: 55, outerX2: 36, outerY2: 62 },
  ];
  const HEAL_POINTS = [
    { ...HEAL_CIRCLE, id: "village-circle", name: "村の回復陣" },
    { x: 31, y: 59, id: "southwest-camp-circle", name: "前線キャンプの回復陣" },
  ];
  const TOWN_GATES = [
    { name: "北門", x: 10, y: 39, w: 3, h: 1, axis: "x" },
    { name: "東門", x: 18, y: 48, w: 1, h: 3, axis: "y" },
  ];
  const TREASURE_CHESTS = [
    { id: "town-cache", x: 17, y: 53, reward: "starter" },
    { id: "north-ruin", x: 18, y: 17, reward: "weapon" },
    { id: "river-shrine", x: 42, y: 33, reward: "ward" },
    { id: "east-grove", x: 56, y: 43, reward: "armor" },
    { id: "south-outpost", x: 72, y: 58, reward: "trail" },
    { id: "dragon-cache", x: 50, y: 16, reward: "scale" },
    { id: "southwest-mine-cache", x: 39, y: 67, reward: "mineGold" },
  ];
  const DISCOVERY_POINTS = [
    { id: "river-spring", x: 43, y: 36, kind: "spring" },
    { id: "north-ore", x: 23, y: 20, kind: "ore" },
    { id: "hunter-cache", x: 57, y: 28, kind: "cache" },
  ];
  const GUARDIAN_SITE = { x: 20, y: 16 };
  const WARDEN_SITE = { x: 70, y: 58 };
  const BOSS_REQUIREMENTS = { level: 4, scales: 3 };
  const REGION_SPAWNS = {
    grassland: { danger: 1, maxBonus: 0, pool: ["slime", "slime", "bat"] },
    wilds: { danger: 2, maxBonus: 1, pool: ["bat", "boar", "slime", "wisp"] },
    north: { danger: 2, maxBonus: 2, pool: ["boar", "boar", "bat", "wisp"] },
    east: { danger: 3, maxBonus: 3, pool: ["wisp", "boar", "dragonling", "bat"] },
    mine: { danger: 3, maxBonus: 3, pool: ["bubbler", "bubbler", "wisp", "boar"] },
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
  const weaponCosts = [0, 90, 320, 880, 1120];
  const armorCosts = [0, 60, 290, 660, 900];
  const armorDefense = [0, 5, 12, 26, 38];
  const weaponSellValues = weaponCosts.map((cost) => Math.floor(cost * 0.5));
  const armorSellValues = armorCosts.map((cost) => Math.floor(cost * 0.5));
  const itemOrder = ["potion", "bomb", "ward"];
  const itemNames = {
    potion: "薬草",
    bomb: "火薬壺",
    ward: "護符",
  };
  const itemSellValues = {
    potion: 8,
    bomb: 14,
    ward: 18,
  };
  const accessoryOrder = ["hunter", "regen", "trail", "aegis", "mine"];
  const accessoryData = {
    hunter: {
      name: "狩人の印",
      trait: "スタミナ最大値",
      sell: 110,
      flag: "hunterCharm",
    },
    regen: {
      name: "再生の指輪",
      trait: "HP自動回復",
      sell: 90,
      flag: "regenCharm",
    },
    trail: {
      name: "旅人の鈴",
      trait: "移動とダッシュ",
      sell: 120,
      flag: "trailCharm",
    },
    aegis: {
      name: "守りの護石",
      trait: "火と弾を軽減",
      sell: 150,
      flag: "aegisCharm",
    },
    mine: {
      name: "泡除けの護符",
      trait: "泡と鈍足を軽減",
      sell: 120,
      flag: "mineCharm",
    },
  };

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
      hp: 24,
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
      hp: 54,
      atk: 25,
      def: 6,
      speed: 25 * WORLD_SCALE,
      xp: 24,
      gold: 14,
      color: "#b0652d",
      shadow: "#5a2a16",
      drop: 0.12,
    },
    wisp: {
      name: "火霊",
      hp: 38,
      atk: 27,
      def: 4,
      speed: 22 * WORLD_SCALE,
      xp: 32,
      gold: 18,
      color: "#ffdb52",
      shadow: "#c7431e",
      drop: 0.18,
    },
    bubbler: {
      name: "泡吐き",
      hp: 66,
      atk: 38,
      def: 12,
      speed: 20 * WORLD_SCALE,
      xp: 30,
      gold: 20,
      color: "#8dd7ff",
      shadow: "#1d4f78",
      drop: 0.16,
    },
    dragonling: {
      name: "小竜",
      hp: 158,
      atk: 62,
      def: 25,
      speed: 21 * WORLD_SCALE,
      xp: 62,
      gold: 42,
      color: "#d63d31",
      shadow: "#6b0d0b",
      drop: 0.5,
    },
    guardian: {
      name: "森の守護者",
      hp: 450,
      atk: 52,
      def: 26,
      speed: 24 * WORLD_SCALE,
      xp: 118,
      gold: 340,
      color: "#55c7a0",
      shadow: "#1d5c4b",
      midboss: true,
      drop: 1,
    },
    warden: {
      name: "番人",
      hp: 1450,
      atk: 46,
      def: 60,
      speed: 28 * WORLD_SCALE,
      xp: 1550,
      gold: 125,
      color: "#6de4ff",
      shadow: "#1d4f78",
      midboss: true,
      drop: 0,
    },
    dragon: {
      name: "赤竜",
      hp: 2000,
      atk: 107,
      def: 35,
      speed: 18 * WORLD_SCALE,
      xp: 1500,
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
    SAFE_ZONES,
    HEAL_POINTS,
    TOWN_GATES,
    TREASURE_CHESTS,
    DISCOVERY_POINTS,
    GUARDIAN_SITE,
    WARDEN_SITE,
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
    weaponSellValues,
    armorSellValues,
    itemOrder,
    itemNames,
    itemSellValues,
    accessoryOrder,
    accessoryData,
    monsterTypes,
  };
})();
