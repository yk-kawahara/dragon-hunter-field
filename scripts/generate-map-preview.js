"use strict";

const fs = require("fs");
const vm = require("vm");
const zlib = require("zlib");

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

function rgb(hex) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function writePng(file, width, height, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const rows = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y += 1) {
    pixels.copy(rows, y * (1 + width * 3) + 1, y * width * 3, (y + 1) * width * 3);
  }
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    pngChunk("IHDR", header),
    pngChunk("IDAT", zlib.deflateSync(rows, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]));
}

const imageWidth = data.width * tileSize;
const imageHeight = data.height * tileSize;
const pixels = Buffer.alloc(imageWidth * imageHeight * 3);

function paintTile(tx, ty, fill) {
  const [red, green, blue] = rgb(fill);
  for (let py = ty * tileSize; py < (ty + 1) * tileSize; py += 1) {
    for (let px = tx * tileSize; px < (tx + 1) * tileSize; px += 1) {
      const offset = (py * imageWidth + px) * 3;
      pixels[offset] = red;
      pixels[offset + 1] = green;
      pixels[offset + 2] = blue;
    }
  }
}

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" viewBox="0 0 ${imageWidth} ${imageHeight}">\n`;
for (let y = 0; y < data.height; y += 1) {
  const row = data.rows[y];
  if (typeof row !== "string" || row.length !== data.width) {
    throw new Error(`WORLD_MAP row ${y} must be ${data.width} characters`);
  }
  for (let x = 0; x < data.width; x += 1) {
    const fill = palette[row[x]];
    if (!fill) throw new Error(`Unknown tile '${row[x]}' at ${x},${y}`);
    paintTile(x, y, fill);
    svg += `<rect x="${x * tileSize}" y="${y * tileSize}" width="${tileSize}" height="${tileSize}" fill="${fill}"/>\n`;
  }
}

for (const object of data.objects || []) {
  const fill = object.type === "npc" ? "#ffd166" : "#ffffff";
  paintTile(object.x, object.y, fill);
  svg += `<rect x="${object.x * tileSize}" y="${object.y * tileSize}" width="${tileSize}" height="${tileSize}" fill="${fill}" stroke="#111" stroke-width="1"/>\n`;
}

svg += "</svg>\n";

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/world-map-preview.svg", svg, "utf8");
writePng("docs/world-map-preview.png", imageWidth, imageHeight, pixels);

console.log(JSON.stringify({
  ok: true,
  files: ["docs/world-map-preview.svg", "docs/world-map-preview.png"],
  width: data.width,
  height: data.height,
  objects: (data.objects || []).length,
}));
