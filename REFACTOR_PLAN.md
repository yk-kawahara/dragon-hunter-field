# REFACTOR PLAN

## Goal

Prepare `src/game.js` for safe future splitting without changing gameplay behavior in this pass.

The game is currently one large browser script of about 3180 lines. It contains data definitions, mutable state, map generation, spawning, player control, monster AI, contact combat, rewards, save/load, UI, drawing, input binding, and the main loop. Future refactoring should reduce this coupling while preserving the survival range expansion loop.

## Current Responsibility Map

### Bootstrapping and Browser Bindings

* DOM/canvas setup: `canvas`, `ctx`, `ui`
* Runtime loop: `init`, `loop`
* Browser input wiring: `bindControls`

Risk:

* Medium to high. These depend on real DOM elements, canvas context, pointer events, and requestAnimationFrame.

### Constants and Static Data

* Screen/map constants: `W`, `H`, `VIEW_H`, `TILE`, `MAP_W`, `MAP_H`
* Save key and map landmarks: `SAVE_KEY`, `HEAL_CIRCLE`, `TOWN_GATES`, `GUARDIAN_SITE`, `BOSS_REQUIREMENTS`
* Reward definitions: `TREASURE_CHESTS`, `DISCOVERY_POINTS`
* Region definitions: `REGION_SPAWNS`
* Tile constants: `TILE_GRASS` through `TILE_FIELD`
* Direction constants: `DIRS`
* Tempo constants: `ATTACK_RANGE`, `ATTACK_WIDTH`, `DASH_COST`
* Equipment data: `weaponNames`, `armorNames`, `weaponTraits`, `armorTraits`, `weaponCosts`, `armorCosts`, `armorDefense`
* Item order: `itemOrder`
* Enemy definitions: `monsterTypes`

Risk:

* Low if extracted without changing names or values and re-exported/imported mechanically.

### Mutable State

* Global game state: `state`
* Player state: `player`
* Runtime collections: monsters, projectiles, particles, chests, discoveries, NPCs, UI panel state, gate state

Risk:

* High. Many systems mutate these objects directly. Do not split state until constants and pure helpers are already isolated and verified.

### Pure and Mostly Pure Helpers

* Math/geometry: `clamp`, `rand`, `irand`, `hashNoise`, `rectsOverlap`, `centerOf`, `normalize`, `facingDot`, `directionFromVector`, `makeRect`
* Reward/save helper candidates: `rewardIds`, `savedIdSet`
* Equipment comparison candidates: `grantWeaponAtLeast`, `grantArmorAtLeast` are not pure because they mutate player and call `say`, but their comparison logic can later be split into pure helpers.

Risk:

* Low for pure math helpers.
* Low to medium for reward/equipment helpers if first changed to expose pure comparison functions while leaving mutation wrappers in `game.js`.

### Map, Collision, and Town Rules

* Tile access and blocking: `tileAt`, `setTile`, `isBlockedTile`, `isPassableRect`
* Town/gate checks: `inTownTile`, `tileInGate`, `blocksClosedTownGate`, `blocksTownEntry`, `inTown`
* Map creation: `createMap`, `ensureRewardSitesReachable`, `carveRewardClearing`, `fillEllipse`, `placeHouse`

Risk:

* Medium to high. Collision and village safety are central to the safe-base loop and are used by player, monsters, projectiles, rewards, and drawing.

### Spawning and Regions

* Spawn creation: `spawnMonster`, `spawnIfClear`
* Region selection: `currentRegion`, `distanceFromVillage`, `monsterPoolForRegion`
* Spawn timing/density: `monsterChoice`, `trySpawnMonster`, `updateRegionSpawns`, `pruneDistantMonsters`, `countNearbyMonsters`, `spawnNearPlayer`, `areaDangerText`

Risk:

* Medium. Static region data is low risk to extract, but spawn behavior should stay in `game.js` until region data extraction is proven.

### Player Update and Movement

* Input reading: `hasKey`, `pointerMoveVector`, `inputMoveVector`, `facingVector`
* Player updates: `updatePlayer`, `moveActor`, `playerNearTownGate`, `updateTownGate`, `updateHealCircle`, `updateDiscoverySprings`
* Mobility actions: `dash`

Risk:

* High. Movement touches collision, stamina, town safety, healing, discoveries, and browser input.

### Combat and Damage

* Player stats: `playerAttack`, `playerDefense`, `playerMoveSpeed`, `dashCost`, `weaponDamageMultiplier`, `armorDamageMultiplier`
* Contact combat: `resolveContact`, `applyContactStatus`
* Player attacks: `nearestAttackTarget`, `performAttack`, `hitMonster`
* Items as combat actions: `useBomb`, `useWard`

Risk:

* High. This is the game core and should not be split until constants, enemy data, and tests are stable.

### Monster AI and Projectiles

* Monster updates: `updateMonsters`
* Projectile creation/update: `shootProjectile`, `updateProjectiles`, `blocksProjectileTownEntry`
* Monster defeat/rewards: `defeatMonster`

Risk:

* High. AI, projectile town safety, drops, and boss behavior are tightly coupled.

### Story, Bosses, and Progression

* Story gates: `guardianReady`, `playerNearGuardianSite`, `updateStoryEvents`
* Cave/boss gates: `playerNearCave`, `handleCave`, `canChallengeDragon`, `bossMissingRequirements`
* Stages/objectives: `objectiveText`, `guidanceText`, `nextUpgradeCost`, `gameStage`, `stageName`
* Victory display: `drawVictoryBanner`

Risk:

* High. These directly control clear flow and boss access.

### Rewards, NPCs, Items, and Save

* Treasure and discoveries: `nearestChest`, `openChest`, `grantChestReward`, `nearestDiscovery`, `revealDiscovery`, `gainFoundItem`
* NPCs and shops: `nearestNpc`, `handleNpc`
* Items: `useSelectedItem`, `usePotion`, `selectItem`, `cycleItem`, `selectedItemCount`
* Save/reset: `saveGame`, `loadGame`, `resetGame`

Risk:

* Reward constants are low risk. Reward behavior, NPC dialogue, and save/load are high risk because they preserve progression and one-time reward safety.

### UI and Drawing

* HUD/objective/context: `updateUi`, `drawObjective`, `drawContextPrompt`, `drawHud`, `drawItemChip`, `drawBar`, `drawMiniCompass`, `drawOverlay`
* Info panel: `showStats`, `statsPanelPages`, `nextUpgradeText`, `drawInfoPanel`
* World rendering: `draw`, `drawWorld`, `drawWorldAtmosphere`, `drawFieldDetails`, `drawTownDetails`, `drawVillageRoleMarkers`, `drawTownFence`, `drawTownGates`, `drawTile`, `drawTerrainEdges`
* Entity rendering: `drawNpcs`, `drawEntities`, `drawPlayer`, `drawMonster`, `drawDragon`, `drawMonsterHp`
* Effects rendering: `addFloater`, `addSlash`, `addRing`, `burst`, `updateEffects`, `drawEffects`

Risk:

* Drawing helpers are medium risk if extracted in groups after tests. The top-level draw pipeline should stay intact until browser QA is reliable.

## Recommended Split Order

1. Extract static constants and data into `src/data/definitions.js`.

   Include equipment definitions, enemy definitions, treasure definitions, discovery definitions, region definitions, tile constants, direction constants, and tempo constants. Keep exported names identical.

   Current status: completed with `src/data/definitions.js`. To preserve direct browser/file loading, definitions are loaded before `src/game.js` and exposed through `globalThis.DRAGON_HUNTER_DEFINITIONS` instead of converting the app to ES modules.

2. Extract pure utility helpers into `src/core/math.js`.

   Include `clamp`, `hashNoise`, `rectsOverlap`, `centerOf`, `normalize`, `facingDot`, `directionFromVector`, and `makeRect`. Keep random helpers in `game.js` at first if deterministic VM tests are not ready.

3. Extract pure reward/equipment comparison helpers.

   Create pure helpers such as `isEquipmentUpgrade(currentRank, rewardRank, maxRank)` and `savedKnownIdSet(ids, validEntries)`. Keep mutation wrappers (`grantWeaponAtLeast`, `grantArmorAtLeast`, `openChest`, `revealDiscovery`) in `game.js`.

4. Extract map tile constants and static map helper functions only after steps 1-3 pass.

   Do not move `createMap` or collision behavior yet. Start with tile IDs and maybe `isKnownTile`.

5. Extract enemy spawn data separately from spawn behavior.

   `REGION_SPAWNS` and `monsterTypes` can move before `trySpawnMonster`, `updateRegionSpawns`, or `spawnNearPlayer`.

6. Only after repeated green checks, consider splitting rendering helpers by visual area.

   Start with decorative drawing helpers such as `drawRock`, `drawGrassClump`, `drawTinyFlowers`, `drawCrate`, and `drawGlint`. Keep `draw`, camera, HUD, and entity rendering orchestration in `game.js`.

## First Low-Risk Split Candidate

Best first target:

* `weaponNames`
* `armorNames`
* `weaponTraits`
* `armorTraits`
* `weaponCosts`
* `armorCosts`
* `armorDefense`
* `itemOrder`
* `TREASURE_CHESTS`
* `DISCOVERY_POINTS`
* `REGION_SPAWNS`
* `monsterTypes`
* `BOSS_REQUIREMENTS`
* `GUARDIAN_SITE`

Why:

* They are static data.
* They are read by many systems but do not mutate themselves.
* Moving them first lowers file size without changing gameplay algorithms.

Implementation guard:

* Completed in one small extraction.
* Names remain the same inside `src/game.js` through destructuring from the definitions object.
* Syntax check, VM reward persistence checks, region spawn checks, clear-flow checks, and `git diff --check` must remain green.

## Next Low-Risk Split Candidate

Next target:

* `clamp`
* `hashNoise`
* `rectsOverlap`
* `centerOf`
* `normalize`
* `facingDot`
* `directionFromVector`
* `makeRect`

Recommended file:

* `src/core/math.js`

Guard:

* Keep `rand` and `irand` in `src/game.js` during the next pass unless deterministic spawn tests are strengthened.
* Keep all behavior hubs in `src/game.js`.
* Run the same VM smoke checks after extraction.

## Do Not Split Yet

Do not split these in the first refactor:

* `updatePlayer`
* `updateMonsters`
* `resolveContact`
* `performAttack`
* `hitMonster`
* `updateProjectiles`
* `blocksProjectileTownEntry`
* `defeatMonster`
* `updateStoryEvents`
* `handleCave`
* `handleNpc`
* `saveGame`
* `loadGame`
* `draw`
* `drawHud`
* `drawObjective`
* `drawEntities`
* `bindControls`
* `loop`
* `init`

Why:

* These functions are high-coupling behavior hubs.
* They encode the village safety rule, progression persistence, contact combat feel, boss access, and browser input.
* Moving them before module boundaries and VM checks are stable would make regressions hard to diagnose.

## Required Behavior Checks During Refactoring

Run these after every extraction:

* `node --check src/game.js`
* `git diff --check`
* Static reward reachability check for all treasure, discoveries, and Guardian site
* Region spawn check for grassland, Wilds, North Forest, East Forest/River, and Dragon Cave
* Stale-cap spawn check to ensure distant areas do not become empty
* Closed-gate projectile blocking check
* Monster gate rule check: closed gates block, open gates allow gate entry, walls still block
* Info panel page cycling check
* Chest save/load persistence check
* Hidden discovery save/load persistence check
* Equipment anti-downgrade check
* Dragon spawn, defeat, elder report, and save/load clear-state smoke test

## Refactor Safety Rules

* Do not combine behavior changes with file extraction.
* Do not rename gameplay data while moving it.
* Do not change save data shape during extraction.
* Do not move a behavior hub until its dependencies are already isolated.
* Prefer one extracted responsibility per commit.
* If a VM check fails after extraction, revert the extraction commit rather than patching gameplay behavior blindly.
* Browser QA remains required before visual/drawing module splits are considered complete.
