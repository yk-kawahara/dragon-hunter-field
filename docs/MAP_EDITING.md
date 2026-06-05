# Map Editing Guide

This project uses a fixed, human-editable world map.

## Main Files

Edit terrain here:

```text
src/data/maps/world.js
```

Preview the current whole map here:

```text
docs/world-map-preview.png
docs/world-map-preview.svg
```

The game loads that file before `src/systems/map.js`.

`src/systems/map.js` should stay focused on loading, validating, collision, town, and gate helpers.

## Terrain

Change `WORLD_MAP` rows directly.

Each row must be exactly 80 characters.
There must be exactly 72 rows.

Legend:

```text
.  grass / open field
+  road or walkable clearing
~  water
T  forest / tree wall
#  stone wall / ridge
^  roof
_  village floor
C  cave entrance
*  flowers
=  harvest field
```

## Objects

Map objects live separately from terrain in `WORLD_OBJECTS`.

Current objects are NPC placements:

```js
{ type: "npc", npcType: "elder", x: 9, y: 47, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" }
```

Future treasure, bosses, landmarks, or entrances can be moved here after their gameplay systems are ready to read from map data.

## After Editing

Run:

```powershell
$node='C:\Users\nanai\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { & $node --check $_.FullName }
git diff --check
```

Then verify:

* The player can leave the village.
* Roads do not feel blocked.
* Treasure and discoveries remain reachable.
* North Forest, East/River, Dragon Cave, and the east/southeast expansion still have walkable spawn space.
* Browser visual QA still passes.

Regenerate the map preview after terrain edits so the whole world can be inspected quickly.
