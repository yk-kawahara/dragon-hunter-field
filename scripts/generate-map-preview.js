"use strict";

const fs = require("fs");
const vm = require("vm");

vm.runInThisContext(fs.readFileSync("src/data/maps/world.js", "utf8"), { filename: "src/data/maps/world.js" });

const data = globalThis.DRAGON_HUNTER_WORLD_MAP;
if (!data || !Array.isArray(data.rows)) {
  throw new Error("DRAGON_HUNTER_WORLD_MAP rows not found");
}

const tileSize = 8;
const palette = {
  ".": "#45a653",
  "+": "#b5a67a",
  "~": "#2f8ed8",
  T: "#186b34",
  "#": "#696763",
  "^": "#a63732",
  _: "#9d9784",
  C: "#171717",
  "*": "#7fcc4a",
  "=": "#b7cc45",
};

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${data.width * tileSize}" height="${data.height * tileSize}" viewBox="0 0 ${data.width * tileSize} ${data.height * tileSize}">\n`;
for (let y = 0; y < data.height; y += 1) {
  const row = data.rows[y];
  if (typeof row !== "string" || row.length !== data.width) {
    throw new Error(`WORLD_MAP row ${y} must be ${data.width} characters`);
  }
  for (let x = 0; x < data.width; x += 1) {
    const fill = palette[row[x]];
    if (!fill) throw new Error(`Unknown tile '${row[x]}' at ${x},${y}`);
    svg += `<rect x="${x * tileSize}" y="${y * tileSize}" width="${tileSize}" height="${tileSize}" fill="${fill}"/>\n`;
  }
}

for (const object of data.objects || []) {
  const fill = object.type === "npc" ? "#ffd166" : "#ffffff";
  svg += `<rect x="${object.x * tileSize}" y="${object.y * tileSize}" width="${tileSize}" height="${tileSize}" fill="${fill}" stroke="#111" stroke-width="1"/>\n`;
}

svg += "</svg>\n";

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/world-map-preview.svg", svg, "utf8");

console.log(JSON.stringify({
  ok: true,
  file: "docs/world-map-preview.svg",
  width: data.width,
  height: data.height,
  objects: (data.objects || []).length,
}));
