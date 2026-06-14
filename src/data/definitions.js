"use strict";

(() => {
  const BASE_TILE = 16;
  const WORLD_SCALE = 2;
  const W = 240 * WORLD_SCALE;
  const H = 176 * WORLD_SCALE;
  const VIEW_H = 144 * WORLD_SCALE;
  const HUD_H = H - VIEW_H;
  const TILE = BASE_TILE * WORLD_SCALE;
  const MAP_W = 120;
  const MAP_H = 144;
  const SAVE_KEY = "dragon-hunter-field-save-v2-32px";
  const HEAL_CIRCLE = { x: 6, y: 48 };
  const SAFE_ZONES = [
    { id: "village", name: "村", x1: 5, y1: 39, x2: 18, y2: 55, outerX1: 4, outerY1: 38, outerX2: 19, outerY2: 57 },
    { id: "southwest-camp", name: "前線キャンプ", x1: 25, y1: 56, x2: 35, y2: 61, outerX1: 24, outerY1: 55, outerX2: 36, outerY2: 62 },
    { id: "ash-hamlet", name: "灰道の宿場", x1: 94, y1: 52, x2: 110, y2: 60, outerX1: 93, outerY1: 51, outerX2: 111, outerY2: 61 },
    { id: "moon-camp", name: "月見砦", x1: 94, y1: 113, x2: 110, y2: 118, outerX1: 93, outerY1: 112, outerX2: 111, outerY2: 119 },
    { id: "black-market", name: "黒市", x1: 20, y1: 129, x2: 48, y2: 136, outerX1: 19, outerY1: 128, outerX2: 49, outerY2: 137 },
    { id: "black-fort", name: "黒門砦", x1: 88, y1: 129, x2: 106, y2: 134, outerX1: 87, outerY1: 128, outerX2: 107, outerY2: 135 },
  ];
  const HEAL_POINTS = [
    { ...HEAL_CIRCLE, id: "village-circle", name: "村の回復陣" },
    { x: 31, y: 59, id: "southwest-camp-circle", name: "前線キャンプの回復陣" },
    { x: 102, y: 58, id: "ash-hamlet-circle", name: "灰道の宿場の回復陣" },
    { x: 102, y: 116, id: "moon-camp-circle", name: "月見砦の回復陣" },
    { x: 35, y: 135, id: "black-market-circle", name: "黒市の回復陣" },
    { x: 98, y: 132, id: "black-fort-circle", name: "黒門砦の回復陣" },
  ];
  const TRAVEL_POINTS = [
    { id: "village", name: "村", x: 10, y: 48, cost: 0, unlock: "always" },
    { id: "southwest-camp", name: "前線キャンプ", x: 31, y: 59, cost: 35, unlock: "trail" },
    { id: "ash-hamlet", name: "灰道の宿場", x: 102, y: 58, cost: 90, unlock: "elderReported" },
    { id: "moon-camp", name: "月見砦", x: 102, y: 116, cost: 170, unlock: "ashKnightDefeated" },
    { id: "black-fort", name: "黒門砦", x: 98, y: 132, cost: 260, unlock: "chapter2Reported" },
    { id: "black-market", name: "黒市", x: 35, y: 135, cost: 320, unlock: "blackMarket" },
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
    { id: "mine-armory", x: 32, y: 64, reward: "mineGear" },
    { id: "southwest-mine-cache", x: 39, y: 67, reward: "mineGold" },
    { id: "ash-road-cache", x: 111, y: 41, reward: "ashGear" },
    { id: "ash-watchtower-cache", x: 112, y: 45, reward: "shieldGear" },
    { id: "south-quarry-cache", x: 58, y: 78, reward: "mineGold" },
    { id: "old-tower-cache", x: 104, y: 90, reward: "towerSupply" },
    { id: "old-tower-side-cache", x: 97, y: 92, reward: "shieldSupply" },
    { id: "moon-ruin-cache", x: 97, y: 99, reward: "moonRelic" },
    { id: "moon-road-supply", x: 102, y: 106, reward: "moonSupply" },
    { id: "moon-camp-armory", x: 106, y: 116, reward: "eclipseGear" },
    { id: "eclipse-castle-cache", x: 86, y: 124, reward: "eclipseSupply" },
    { id: "black-fort-armory", x: 103, y: 132, reward: "voidGear" },
    { id: "obsidian-vault-cache", x: 52, y: 133, reward: "obsidianGear" },
    { id: "black-market-supply", x: 28, y: 136, reward: "blackMarketSupply" },
    { id: "black-market-stash", x: 43, y: 135, reward: "blackMarketSupply" },
    { id: "obsidian-side-cache", x: 58, y: 135, reward: "obsidianSupply" },
    { id: "black-gate-shield-cache", x: 73, y: 134, reward: "blackShieldSupply" },
    { id: "black-sun-cache", x: 76, y: 140, reward: "voidSupply" },
  ];
  const DISCOVERY_POINTS = [
    { id: "river-spring", x: 43, y: 36, kind: "spring" },
    { id: "north-ore", x: 23, y: 20, kind: "ore" },
    { id: "hunter-cache", x: 57, y: 28, kind: "cache" },
    { id: "ash-spring", x: 101, y: 55, kind: "spring" },
    { id: "tower-cache", x: 99, y: 88, kind: "cache" },
    { id: "moon-waystone", x: 86, y: 101, kind: "waystone" },
    { id: "moon-field-cache", x: 108, y: 104, kind: "cache" },
    { id: "moon-grave-note", x: 91, y: 103, kind: "routeHint" },
    { id: "eclipse-seal", x: 82, y: 121, kind: "eclipseSeal" },
    { id: "void-seal", x: 82, y: 138, kind: "voidSeal" },
    { id: "obsidian-waystone", x: 52, y: 132, kind: "obsidianWaystone" },
    { id: "black-market-rumor", x: 41, y: 132, kind: "routeHint" },
    { id: "broken-gate-marker", x: 74, y: 136, kind: "shortcutHint" },
  ];
  const GUARDIAN_SITE = { x: 20, y: 16 };
  const WARDEN_SITE = { x: 70, y: 58 };
  const WARDEN_REQUIREMENTS = { level: 10 };
  const ASH_KNIGHT_SITE = { x: 103, y: 89 };
  const ASH_KNIGHT_REQUIREMENTS = { level: 14 };
  const ECLIPSE_DRAGON_SITE = { x: 82, y: 123 };
  const CHAPTER2_REQUIREMENTS = { level: 20 };
  const VOID_DRAGON_SITE = { x: 80, y: 140 };
  const CHAPTER3_REQUIREMENTS = { level: 26 };
  const OBSIDIAN_GOLEM_SITE = { x: 52, y: 132 };
  const OBSIDIAN_GOLEM_REQUIREMENTS = { level: 24 };
  const BOSS_REQUIREMENTS = { level: 15, scales: 3 };
  const REGION_SPAWNS = {
    grassland: { danger: 1, maxBonus: 0, pool: ["slime", "slime", "bat"] },
    wilds: { danger: 2, maxBonus: 1, pool: ["bat", "boar", "slime", "wisp"] },
    north: { danger: 2, maxBonus: 2, pool: ["boar", "boar", "bat", "wisp"] },
    east: { danger: 3, maxBonus: 3, pool: ["wisp", "boar", "dragonling", "bat"] },
    mine: { danger: 3, maxBonus: 3, pool: ["bubbler", "bubbler", "wisp", "boar"] },
    cave: { danger: 4, maxBonus: 4, pool: ["dragonling", "wisp", "dragonling"] },
    ash: { danger: 4, maxBonus: 5, pool: ["sorcerer", "wisp", "dragonling", "boar"] },
    tower: { danger: 5, maxBonus: 6, pool: ["shieldSoldier", "sorcerer", "sorcerer", "dragonling", "wisp"] },
    moon: { danger: 6, maxBonus: 7, pool: ["moonShade", "sorcerer", "dragonling", "wisp"] },
    eclipse: { danger: 7, maxBonus: 8, pool: ["shieldSoldier", "eclipseMage", "moonShade", "sorcerer", "dragonling"] },
    obsidian: { danger: 8, maxBonus: 9, pool: ["shieldSoldier", "obsidianCrawler", "voidWraith", "eclipseMage", "dragonling"] },
    void: { danger: 8, maxBonus: 10, pool: ["shieldSoldier", "voidWraith", "eclipseMage", "moonShade", "dragonling"] },
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

  const weaponNames = ["わりばし", "たけやり", "粘土の剣", "木刀", "鉄の剣", "泡割り槍", "火返しの剣", "竜狩りの刃", "星見の杖", "月蝕の刃", "黒陽の剣", "黒曜の槌"];
  const armorNames = ["綿服", "布鎧", "木鎧", "竹鎧", "鎖鎧", "鉱夫服", "耐火マント", "巡礼鎧", "星織りの衣", "月蝕の外套", "黒陽の鎧", "黒曜重鎧"];
  const weaponTraits = ["基本", "正面", "側撃", "背撃", "特効", "泡特効", "火霊特効", "竜洞特効", "魔術師特効", "月蝕竜特効", "黒竜特効", "重装崩し"];
  const armorTraits = ["軽装", "疾走", "受け", "護符", "耐性", "泡耐性", "火耐性", "遠征防御", "魔法軽減", "月蝕魔法軽減", "黒陽圧軽減", "正面防御"];
  const weaponCosts = [0, 90, 320, 880, 1120, 520, 740, 1450, 2100, 3400, 5600, 9800];
  const weaponAttack = [0, 3, 5, 14, 19, 8, 12, 17, 20, 22, 30, 34];
  const armorCosts = [0, 60, 290, 660, 900, 480, 720, 1320, 1900, 3200, 5200, 9200];
  const armorDefense = [0, 2, 5, 11, 17, 7, 9, 23, 19, 25, 34, 42];
  const weaponSellValues = weaponCosts.map((cost) => Math.floor(cost * 0.5));
  const armorSellValues = armorCosts.map((cost) => Math.floor(cost * 0.5));
  const shieldNames = ["なし", "木盾", "鉄盾", "星盾", "黒陽盾", "黒曜大盾"];
  const shieldTraits = ["盾なし", "正面接触を少し軽減", "正面接触を軽減", "魔法敵にも構えやすい", "黒陽領の正面圧を軽減", "重いが正面戦闘に強い"];
  const shieldCosts = [0, 120, 520, 1700, 3600, 6200];
  const shieldGuard = [0, 0.9, 0.78, 0.68, 0.58, 0.48];
  const shieldSellValues = shieldCosts.map((cost) => Math.floor(cost * 0.45));
  const itemOrder = ["potion", "tonic", "bomb", "ward", "elixir", "warp"];
  const itemNames = {
    tonic: "活力薬",
    elixir: "霊薬",
    warp: "帰還鈴",
    potion: "薬草",
    bomb: "火薬壺",
    ward: "護符",
  };
  const itemSellValues = {
    tonic: 16,
    elixir: 44,
    warp: 62,
    potion: 8,
    bomb: 14,
    ward: 18,
  };
  const accessoryOrder = ["hunter", "regen", "trail", "aegis", "mine", "eclipse", "void", "obsidian"];
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
    eclipse: {
      name: "月蝕の指輪",
      trait: "月蝕魔法を軽減",
      sell: 0,
      flag: "eclipseCharm",
    },
    void: {
      name: "黒陽の護符",
      trait: "黒陽圧と召喚魔法を軽減",
      sell: 0,
      flag: "voidCharm",
    },
    obsidian: {
      name: "黒曜の腕輪",
      trait: "正面接触と黒曜衝撃を軽減",
      sell: 0,
      flag: "obsidianCharm",
    },
  };

  const monsterTypes = {
    slime: {
      name: "スライム",
      hp: 18,
      atk: 8,
      def: 0,
      speed: 18 * WORLD_SCALE,
      xp: 3,
      gold: 1,
      color: "#4dd455",
      shadow: "#197a25",
      drop: 0.04,
    },
    bat: {
      name: "コウモリ",
      hp: 24,
      atk: 17,
      def: 0,
      speed: 34 * WORLD_SCALE,
      xp: 7,
      gold: 2,
      color: "#8a52d6",
      shadow: "#3b196c",
      drop: 0.06,
      flying: true,
    },
    boar: {
      name: "突進獣",
      hp: 54,
      atk: 42,
      def: 6,
      speed: 25 * WORLD_SCALE,
      xp: 22,
      gold: 9,
      color: "#b0652d",
      shadow: "#5a2a16",
      drop: 0.12,
    },
    wisp: {
      name: "火霊",
      hp: 29,
      atk: 51,
      def: 4,
      speed: 22 * WORLD_SCALE,
      xp: 44,
      gold: 15,
      color: "#ffdb52",
      shadow: "#c7431e",
      drop: 0.18,
    },
    sorcerer: {
      name: "灰術師",
      hp: 96,
      atk: 88,
      def: 28,
      speed: 19 * WORLD_SCALE,
      xp: 92,
      gold: 34,
      color: "#b990ff",
      shadow: "#4b2b75",
      drop: 0.22,
    },
    moonShade: {
      name: "月影の亡霊",
      hp: 122,
      atk: 94,
      def: 32,
      speed: 27 * WORLD_SCALE,
      xp: 118,
      gold: 42,
      color: "#7f8cff",
      shadow: "#263064",
      drop: 0.24,
    },
    eclipseMage: {
      name: "月蝕術師",
      hp: 180,
      atk: 106,
      def: 55,
      speed: 22 * WORLD_SCALE,
      xp: 170,
      gold: 58,
      color: "#e36dff",
      shadow: "#4f206e",
      drop: 0.28,
    },
    voidWraith: {
      name: "黒陽の影",
      hp: 260,
      atk: 124,
      def: 58,
      speed: 34 * WORLD_SCALE,
      xp: 245,
      gold: 84,
      color: "#2f335f",
      shadow: "#080816",
      drop: 0.32,
      flying: true,
    },
    obsidianCrawler: {
      name: "黒曜這い",
      hp: 310,
      atk: 132,
      def: 72,
      speed: 30 * WORLD_SCALE,
      xp: 300,
      gold: 98,
      color: "#24242c",
      shadow: "#08080c",
      drop: 0.34,
    },
    bubbler: {
      name: "泡吐き",
      hp: 66,
      atk: 45,
      def: 20,
      speed: 20 * WORLD_SCALE,
      xp: 56,
      gold: 7,
      color: "#8dd7ff",
      shadow: "#1d4f78",
      drop: 0.16,
    },
    shieldSoldier: {
      name: "盾兵",
      hp: 210,
      atk: 96,
      def: 62,
      speed: 17 * WORLD_SCALE,
      xp: 155,
      gold: 54,
      color: "#9aa6b2",
      shadow: "#333a46",
      drop: 0.22,
    },
    dragonling: {
      name: "小竜",
      hp: 158,
      atk: 62,
      def: 25,
      speed: 21 * WORLD_SCALE,
      xp: 70,
      gold: 22,
      color: "#d63d31",
      shadow: "#6b0d0b",
      drop: 0.5,
    },
    guardian: {
      name: "森の守護者",
      hp: 650,
      atk: 52,
      def: 50,
      speed: 24 * WORLD_SCALE,
      xp: 118,
      gold: 140,
      color: "#55c7a0",
      shadow: "#1d5c4b",
      midboss: true,
      drop: 1,
    },
    warden: {
      name: "番人",
      hp: 1450,
      atk: 76,
      def: 42,
      speed: 28 * WORLD_SCALE,
      xp: 550,
      gold: 225,
      color: "#6de4ff",
      shadow: "#1d4f78",
      midboss: true,
      drop: 0,
    },
    ashKnight: {
      name: "古塔の灰騎士",
      hp: 1750,
      atk: 122,
      def: 70,
      speed: 26 * WORLD_SCALE,
      xp: 760,
      gold: 360,
      color: "#c2b7ff",
      shadow: "#33265c",
      midboss: true,
      drop: 0,
    },
    dragon: {
      name: "赤竜",
      hp: 2000,
      atk: 107,
      def: 55,
      speed: 18 * WORLD_SCALE,
      xp: 1500,
      gold: 500,
      color: "#ec342d",
      shadow: "#7d0808",
      boss: true,
      drop: 1,
    },
    eclipseDragon: {
      name: "月蝕竜",
      hp: 3600,
      atk: 126,
      def: 92,
      speed: 20 * WORLD_SCALE,
      xp: 2600,
      gold: 1200,
      color: "#8b5cff",
      shadow: "#24153d",
      boss: true,
      drop: 1,
    },
    obsidianGolem: {
      name: "黒曜巨人",
      hp: 3200,
      atk: 148,
      def: 130,
      speed: 18 * WORLD_SCALE,
      xp: 2100,
      gold: 980,
      color: "#3c3f52",
      shadow: "#090910",
      midboss: true,
      drop: 1,
    },
    voidDragon: {
      name: "黒陽竜",
      hp: 5600,
      atk: 154,
      def: 118,
      speed: 23 * WORLD_SCALE,
      xp: 4200,
      gold: 2200,
      color: "#191c38",
      shadow: "#05040d",
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
    TRAVEL_POINTS,
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
    weaponAttack,
    armorCosts,
    armorDefense,
    weaponSellValues,
    armorSellValues,
    shieldNames,
    shieldTraits,
    shieldCosts,
    shieldGuard,
    shieldSellValues,
    itemOrder,
    itemNames,
    itemSellValues,
    accessoryOrder,
    accessoryData,
    monsterTypes,
  };
})();
