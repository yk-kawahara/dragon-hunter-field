# DEVELOPMENT_LOG.md

Current status and historical implementation record.

This file is **not** the active task list. Use `IMPROVEMENT_PLAN.md` for planning.

## Current status summary

Active documents:

* `AGENTS.md` — workflow and development rules.
* `GAME_DESIGN_NOTES.md` — design truth.
* `IMPROVEMENT_PLAN.md` — current roadmap and next work order.
* `DEVELOPMENT_LOG.md` — current status plus historical record.

Deprecated documents:

* `TODO.md`
* `NEXT_CODEX_TASK.md`

Current project status:

* Browser-based contact-combat action RPG.
* Current village -> Guardian -> Red Dragon route is Chapter 1 scale.
* Core design: survival-range expansion.
* Code structure is split across `src/data`, `src/core`, and `src/systems`.
* Fixed hand-editable world map lives in `src/data/maps/world.js`.
* Current map size is `256x256`; it now reads as a western continent, 蒼風島, 日出大陸, and multiple island chains rather than one rectangular route stack.
* Real `もちもの` inventory exists with item, weapon, armor, and accessory handling.
* Accessories are moving from permanent passive flags into equipment choices.
* Southwest mine + southwest frontier camp are the first concrete volume-expansion pilot.
* Southeast outpost + traveler bell + Southeast Warden + Aegis Charm make the southeast route a meaningful optional direction.
* Ash Road + Ash Hamlet + Old Tower are the first larger map-size expansion beyond the old `80x72` footprint.
* Ash Sorcerer and Old Tower Ash Knight add magic-pressure content beyond the Southeast Warden route.
* Moon Ruins extend the Old Tower route southward with Moon Shade pressure, late supplies, and moon relic rewards.
* Moon Camp + Eclipse Castle are the first Chapter 2 boss route beyond Moon Ruins.
* Moon Archive is now a Chapter 2 interior from Moon Camp, with a LV18 Archive Warden, guarded reliquary, Eclipse Ring reward, and a required step before Eclipse Dragon.
* Eclipse Mage, eclipse gear, Eclipse Ring, and Eclipse Dragon add the first post-Red-Dragon major boss arc.
* Black Gate + Black Fort + Black Sun Castle are the first Chapter 3 route beyond Eclipse Castle.
* Void Wraith, Black Sun gear, Void Charm, and Black Sun Dragon add a harder post-Chapter-2 major boss arc.
* Black Market is now a Chapter 3 second town with recovery, selectable shop stock, guide/guards/villagers, and supplies.
* Obsidian Cave + Obsidian Crawler + Obsidian Golem add a Chapter 3 branch dungeon and midboss before the Black Sun Dragon route.
* Black Market Catacombs add the first portal-linked compact interior dungeon, with Vault Leech pressure, Crypt Warden, and Deep Lamp Charm progression.
* Western Smuggler Road now has Smuggler Captain, extra supply caches, and route guidance so the early Black Market shortcut has a danger climax and reward reason.
* Black Market north regeneration cave now has Regen Sentinel guarding the Greater Regeneration Ring, turning the strongest sustain accessory into an earned side-dungeon reward.
* A density pass has added hand-authored small terrain landmarks, extra caches, discovery points, and more NPCs around remote bases to reduce sparse walking.
* Shops now use selectable buy menus instead of fixed-order auto-buying.
* Equipment/HUD now exposes ATK/DEF values and inventory comparison deltas.
* Frost Frontier + Frost Haven + Ice Cave + Frost Crown Citadel form a complete Chapter 4 route after the Chapter 3 report.
* Frost Moth, Frost Beast, Frost Golem, frost equipment, Frost Heart Charm, and Frost Crown Dragon add a higher-difficulty frozen expedition arc.
* Frost Haven now has a unique shield-engraving service with defensive, traversal, and counterattack build choices.
* Frost Watchtower adds a two-floor Chapter 4 side dungeon with Frost Beacon aura hazards, a named warden, a persistent elevator shortcut, and the dash-focused Sky Emblem reward.
* All weapons now have distinct attack profiles, the field UI has three configurable all-item quick slots, and interior enemy density is isolated from exterior spawn budgets.
* Settlement NPC dialogue now varies by location and resident instead of repeating one generic line.
* Major bosses now use telegraphed piercing attacks, delayed multi-wave patterns, or persistent arena zones in addition to their previous spreads and summons.
* A live whole-world map can be opened with `P` or the command panel; it reflects fixed terrain and marks the player, bases, and major bosses.
* Skyspine Highlands replaces a large straight/corridor section with mountain ridges, a meandering river, three crossing routes, route rewards, and a distinct enemy mix.
* Black Market is now Black Market City: a larger multi-district safe zone with streets, buildings, several entrances, and eight additional residents/guards.
* 蒼風島 adds a second major landmass with a mountain spine, lighthouse coast, river valley, terraces, multiple crossing routes, 蒼風港, and 南風岬砦.
* Southern capes and island routes add bridges, a causeway, shrine island, caches, and a second long-range direction beyond the western chapter corridor.
* The world now uses editable polygon coastlines, naturalized curved roads, and a cartographic overview layer that hides embedded interior mazes behind readable terrain/landmark symbols.
* 日出大陸 adds 黎明港, 陽冠都市, a northern mountain route, western coast road, central ridge shortcut, valley shrine, southern road, and access to 熾火群島.
* The world now contains 121 NPCs and 11 safe/travel anchors, allowing recovery and restock radius to move across the outer sea.
* Chapter 5 now runs from the Chapter 4 report through 日出高原, 日輪砲台守, 陽冠都市's high-price countermeasure shop, 日鏡塔, 反射水晶, 熾火群島, 熾火天竜, and an elder-report ending.
* 陽冠都市 now functions more like a metropolis: separate armament, expedition apothecary, and travel-gear guild shops, extra city NPCs, city caches, and route-specific guide/resident information.
* 光槍兵, 陽炎術師, 閃光走者, 光柱鏡, 日輪砲台守, 日鏡塔の守主, and 熾火天竜 introduce long sniper lines, delayed artillery zones, charges, piercing shots, broad multi-wave attacks, and mixed reinforcements.

Current high-priority risks:

* Full real-browser desktop/mobile play QA is still needed.
* Browser QA in this session was blocked by the in-app browser local-file URL policy; VM smoke coverage is current, but real visual/mobile checks remain needed.
* Full fresh-save manual playthrough to elder report is still needed.
* Mobile UI and inventory overlay need real-browser confirmation.
* Future map expansion must avoid empty terrain and preserve reachability; the new `256x256` space now needs complete 蒼風島 / 日出大陸 enemy, reward, dungeon, and boss arcs rather than another size increase.
* Gold/EXP/shop price balance should be checked after route expansion.
* Chapter 4 LV30/LV34 pacing, rank-12 gear economy, and boss reinforcement pressure need a real playtest from a Chapter 3 clear save.
* Frost Watchtower attrition, beacon pulse pressure, warden phase pacing, elevator usefulness, and Sky Emblem strength need a real Chapter 4 playtest.
* Existing routes and dungeons are often too short and too wall-corridor-heavy to create a convincing journey through a world.
* Black Market City now provides the physical urban footprint and whole-world navigation, but specialist shops, optional city activities, and progression-sensitive urban services still need expansion.
* New weapon profiles, quick-slot UX, interior population, and settlement dialogue variation need hands-on browser playtesting after this pass.
* New boss movement checks need hands-on balance testing so warnings are readable and defense/level cannot trivialize every pattern.

Next verification target:

1. Syntax checks for `src/` and `scripts/`.
2. `scripts/verify-game-smoke.js`.
3. `git diff --check`.
4. Browser desktop/mobile smoke QA if possible.
5. Fresh-save route playthrough when feasible.

## Log maintenance rule

Append new meaningful passes under **New entries**.

For each pass, record:

* Date.
* Goal.
* Implemented changes.
* Verification performed.
* Known risks or unverified items.
* Whether docs or map previews were updated.

Keep new entries concise. For deep historical detail, use git history instead of expanding this file indefinitely.

---

## New entries

### 2026-06-26: Chapter 1-5 guidance, Chapter 2 Moon Archive, and Suncrest metropolis pass

Goal: reduce route confusion across Chapters 1-5, make the thin Chapter 2 arc more substantial, and turn the Chapter 5 super-city into a more useful and memorable preparation hub.

Implemented:

* Added 月の書庫 as a portal-linked Chapter 2 interior entered from 月見砦.
* Added `月書庫の番人`, a LV18 midboss that gates the new Moon Archive reliquary.
* Made 月蝕竜 readiness require 灰騎士, 月影遺物, 月書庫の番人, 月蝕遺物庫, 月蝕封印碑, and LV20.
* Added Moon Archive supply/reliquary chests, two discovery hints, an independent `moonArchive` region/spawn pool, guarded chest lock, save/load/reset state, objective/guidance text, and smoke coverage.
* Split 陽冠都市 into multiple services: `大武装商会`, `遠征薬舗`, and `旅装ギルド`.
* Added more Suncrest merchants, guides, residents, guards, city caches, city guide discoveries, and city-specific dialogue so Chapter 5 has a richer urban preparation step.
* Updated map overview hiding for the new interior and regenerated `docs/world-map-preview.png` / `docs/world-map-preview.svg`.

Verification:

* Syntax checked all `src/` and `scripts/` JavaScript files with bundled Node.js.
* `scripts/verify-game-smoke.js`: PASS, including reachability, 121 NPC placements, Moon Archive portal/region/spawn/reliquary, Archive Warden save/story flow, Suncrest shop purchases, full Chapter 1-5 story flow, save/load migration, and script-load smoke.
* `scripts/generate-map-preview.ps1`: PASS.

Known risks / next work:

* Real-browser visual QA remains needed for the new Suncrest shop menus and dense NPC placement.
* Manual Chapter 2 playtest is needed to tune 月の書庫 attrition and confirm the added step feels like adventure volume rather than a checklist.
* Manual Chapter 5 playtest is needed to tune city prices, item-pack value, and whether guides clearly communicate the highland -> tower -> seal -> sanctum route.

### 2026-06-25: Chapter 5 日鏡塔 quality and volume pass

Goal: make Chapter 5 feel more deliberate and substantial by adding a real high-level interior expedition between the super-city preparation step and the final 熾火群島 boss route.

Implemented:

* Added 日鏡塔 as a portal-linked Chapter 5 interior entered from 陽冠都市's east gate.
* Added tower supply and observation rewards, plus a guarded reliquary reward.
* Added `閃光走者`, a fast charge enemy that pressures side-steps rather than only projectile dodging.
* Added `光柱鏡`, a stationary artillery enemy that creates persistent solar danger zones.
* Added LV40 `日鏡塔の守主`, a midboss with long sniper lines, multi-zone artillery, and half-HP mirror/runner reinforcements.
* Added `反射水晶` as the tower reward and a new prerequisite/countermeasure before 熾火天竜.
* Updated Chapter 5 objective text, town/field guidance, Suncrest guide dialogue, world-map marker, region danger text, save/load/reset state, reward locks, and smoke coverage.
* Moved the tower interior after verification found it overlapped 蒼風島's lighthouse route; fixed two Suncrest NPCs that were standing on blocked city tiles.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

Verification:

* Syntax checked all `src/` and `scripts/` JavaScript files with bundled Node.js.
* `scripts/verify-game-smoke.js`: PASS, including reachability, 114 NPC placements, portal travel, save/load migration, guarded 日鏡塔 reliquary, story flow through Chapter 5 report, and behavior checks for 閃光走者 / 光柱鏡 / 日鏡塔の守主.
* `scripts/generate-map-preview.ps1`: PASS.
* Real-browser QA attempted through the in-app browser, but local `file://` navigation was blocked by browser URL policy. Standalone Playwright was also unavailable because the bundled package lacked `playwright-core` in ordinary Node resolution.

Known risks / next work:

* Manual playtest is still needed for 日鏡塔 attrition, boss readability, 反射水晶 strength, and Chapter 5 gold/equipment pacing.
* Desktop/mobile visual QA remains needed because this session could not load the local page in a browser surface.

### 2026-06-22: Chapter 5 horizon-fire expedition

Goal: create a complete high-difficulty chapter where entering a hostile continent exposes the player to ultra-long-range attacks, while expensive equipment from a super-city visibly expands survivable range and enables the final boss push.

Implemented:

* Added the Chapter 5 progression chain: Chapter 4 report -> LV38 日輪砲台守 -> 陽光封印碑 -> 熾火聖域 cache -> LV42 熾火天竜 -> elder report.
* Added 光槍兵's telegraphed piercing sniper line and 陽炎術師's three delayed persistent artillery zones to 日出高原 / 熾火群島 spawn pools.
* Added 日輪砲台守, alternating between triple sniping and artillery, as the equipment-stock unlock midboss.
* Added 熾火天竜 with three rotating pattern families, enrage, and mixed Chapter 5 reinforcements.
* Added selectable expensive 陽冠都市 equipment: 暁光の長槍, 陽冠の光鎧, 日輪大盾, and 遠見の護符, plus premium consumable packs.
* Added two one-time Chapter 5 supply caches, the 陽光封印碑 discovery, objective/guidance text, world-map boss marker, ending overlay, and state/save/load/reset migration.
* Fixed Chapter 4-report wagon unlock evaluation so 黎明港 and 陽冠都市 travel points actually become available.
* Extended VM smoke coverage for reachability, story clear flow, save migration, inventory purchases, prepared/unprepared solar damage, sniper/artillery behavior, and boss piercing patterns.

Verification:

* Syntax checked all changed JavaScript files with the bundled Node.js runtime.
* `scripts/verify-game-smoke.js`: PASS, including 32,867 reachable tiles, all Chapter 5 locations, full boss/report flow, save/load, city purchases, and attack-pattern assertions.
* Real-browser QA was attempted but not completed: local HTTP server startup was denied by the current execution allowance, and direct `file://` navigation was blocked by browser policy. Remaining visual risk is shop-overlay fit and telegraph readability at desktop/mobile-like viewports.
* Map preview regeneration was not required because this pass added object/data placements but did not change terrain.

Known balance risk:

* Chapter 5 prices and LV38/LV42 gates are structurally tested but still need a Chapter 4-clear manual playtest to measure real gold income, retreat frequency, and whether one defensive purchase is naturally affordable.

### 2026-06-22: 256x256 three-continent world expansion

Goal: move beyond a two-column continent/island layout and create a broad classic-RPG world with multiple seas, continents, cities, mountain routes, coasts, and island chains.

Implemented:

* Expanded the fixed world definition from `192x224` to `256x256` without moving existing progression coordinates.
* Added 日出大陸 as a third major landmass with an irregular coast, crown mountain range, western/eastern forests, river system, cultivated north/valley regions, and dangerous southern heath.
* Added northern sea island and 熾火群島, producing a world silhouette with multiple oceans, island chains, and long-range destinations instead of two parallel vertical landmasses.
* Added seven named routes: outer-sea ferry, main highland road, northern pilgrimage loop, west-coast road, ridge shortcut, southern road, and ember-island causeway/loop.
* Added 黎明港 and 陽冠都市 as full safe settlements with recovery, merchants, porters, guidance, guards, residents, cartographic landmarks, and wagon destinations.
* Added seven new chests, seven discoveries, a north ruin, valley shrine, ember sanctum, and outer-sea ferry round trip.
* Added `dawnCoast`, `sunriseHighland`, and `emberIsles` spawn identities with progressively higher enemy pressure and mixed behavior pools.
* Expanded map/UI/guidance/NPC dialogue to identify the eastern continent and route choices without coordinate instructions.

Verification:

* Map preview regenerated at `256x256` and visually inspected. Western continent, 蒼風島, 日出大陸, northern island, southern islands, and 熾火群島 are separately readable.
* `scripts/verify-game-smoke.js` passes with 32,867 reachable tiles, 106 reachable NPCs, all chests/discoveries/bosses/towns reachable, safe-zone checks, both ferry round trips, region pools, save/load, inventory, and Chapter 1-4 flow.

Known risks / next work:

* The new eastern geography is intentionally playable immediately after Chapter 4 report, but still needs unique enemies, equipment, dungeon progression, named midboss, and chapter boss.
* Manual browser traversal is needed to tune voyage pacing, road travel time, spawn density, and whether the ridge shortcut feels meaningfully dangerous.

### 2026-06-22: Organic continent and cartographic world-map pass

Goal: correct the artificial, rough appearance of the 192x224 expansion and make the world read like a broad RPG continent/island map rather than a collection of rectangular corridors and exposed room layouts.

Implemented:

* Replaced brush-stroke landmass construction with four explicit human-editable coastline polygons: western continent, 蒼風島, shrine island, and middle sea isle.
* Cut the old rectangular western-map boundary into bays, capes, and irregular coasts while preserving all existing gameplay coordinates and portals.
* Naturalized oversized legacy path blocks into open terrain, then redrew named curved roads for the village, north forest, dragon cave, southwest camp, river fork, highlands, frost frontier, and ferry routes.
* Broke old horizontal chapter seams into valleys, fragmented woods, and mountain passes instead of continuous artificial wall bands.
* Expanded 蒼風島 route structure with a lighthouse loop, west-coast road, mountain pass, east-river road, ridge shortcut, inland lake, south-cape loop, and cross-island route.
* Added `overviewRows`, a cartographic layer used by the in-game whole-world map and generated previews. Embedded catacomb/watchtower floors are replaced by mountains, while towns, forts, caves, towers, and castles use compact landmark symbols.
* Removed NPC dots from the generated cartographic preview so geography and route structure remain readable.
* Moved one Frost Haven resident off the new windbreak forest and opened a frost-waystone plaza so dash/traversal behavior remains valid.

Verification:

* All treasure, discovery, NPC, boss, dungeon, port, town, and Chapter 1-4 reachability checks pass after coastline changes.
* `scripts/verify-game-smoke.js` passes with 23,986 reachable tiles and validates the full-size overview plus hidden embedded catacomb layout.
* `docs/world-map-preview.png` and `.svg` were regenerated and inspected at original resolution; continent silhouettes, seas, mountain systems, route loops, settlements, and southern islands are now visually distinct.
* In-app browser QA was attempted, but the isolated browser environment refused both the reachable localhost server and direct `file:` navigation. The generated preview remains the visual verification artifact for this pass.

Known risks / next work:

* Manual field-scale travel timing and mobile browser rendering still need hands-on QA.
* Several legacy western encounter spaces remain physically rectangular at local gameplay scale even though the whole-world map now represents them cleanly. Future passes should reshape them one region at a time without returning to corridor mazes.
* 蒼風島 now has strong geography but still needs unique route populations, rewards, an interior dungeon, and a chapter boss arc.

### 2026-06-21: Continental world expansion pass

Goal: replace the impression of a rectangular corridor collection with a world whose continent, island, sea, mountain, river, coast, and settlements are readable at a glance.

Implemented:

* Expanded the fixed hand-editable overworld from `120x160` to `192x224`, increasing total map area by approximately 2.24 times while preserving all western-continent coordinates.
* Added a broad sea channel, 蒼風島, a western south cape, middle isle, shrine island, and southern cape routes.
* Built 蒼風島 around a north lighthouse coast, central mountain spine, western terraces, river valley, eastern coast road, ridge shortcut, southern heath, and multiple route choices.
* Added 蒼風港 and 南風岬砦 as safe recovery/restock/travel anchors with healer/merchant/porter/frontier roles, guards, guides, residents, props, and settlement-specific dialogue.
* Added ferry traversal between the continents, new travel points, seven one-time chests, six discoveries, regional guidance, and whole-world-map labels.
* Added `windCoast`, `eastHighland`, and `southIsles` spawn regions so the new land is populated by increasingly dangerous mixed-behavior enemies instead of remaining empty scenery.
* Added automated validation that every NPC stands on passable terrain, then fixed six western/eastern NPCs that had been placed on roofs or walls.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg` from the assembled `192x224` world and visually confirmed the continent/island silhouettes.

Verification:

* Syntax checks passed for all 24 JavaScript files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed with 26,689 reachable tiles, 84 reachable NPCs, new-region spawn checks, safe-zone checks, ferry round trip, important destination reachability, save/load, inventory, and Chapter 1-4 story flow.
* The generated map preview was inspected at original resolution and confirms readable landmasses, coastlines, mountain spine, river routes, ports, and southern islands.
* In-app browser QA could not start because the local browser integration lacked required sandbox metadata. Field-scale visual balance and manual travel times remain unverified in this environment.

Known risks / next work:

* 蒼風島 is geographically complete but not yet a complete chapter. It needs unique local enemies, an interior dungeon, named midboss, region equipment, and a major destination/boss.
* Enemy density, ferry timing, shop value, and route duration on the new island need a real post-Chapter-3 playtest.
* Several legacy western interiors still retain rectangular wall-maze silhouettes; future terrain passes should reshape them without undoing the new continental structure.

### 2026-06-21: Boss action, world map, and Skyspine geography pass

Goal: respond to playtest feedback with more skill-based bosses and transform the central overworld from straight wall corridors into a memorable mountain journey.

Implemented:

* Added boss attack infrastructure for telegraphed lines/zones, piercing and wall-piercing shots, delayed waves, and persistent damaging fields.
* Red Dragon now aims a piercing fire lane; Eclipse Dragon uses rotating delayed volleys; Black Sun Dragon marks persistent void zones; Frost Crown Dragon alternates piercing ice lances and multi-wave blizzards.
* Added a live whole-world map opened with `P` or the command panel. It reads current fixed terrain and marks current position, safe bases, and major bosses while pausing field simulation.
* Added fixed, human-editable geography feature data for named ridges, rivers, and roads. It remains deterministic and can be changed by editing polyline points in `src/data/maps/world.js`.
* Rebuilt the Skyspine crossing with two mountain ridges, a meandering river, a main road, a longer valley road, and a dangerous ridge shortcut.
* Added the `highland` region with shield soldiers, chargers, sorcerers, wisps, and dragonlings, plus three new caches/discoveries on alternate routes.
* Expanded Black Market into Black Market City: a 35x15 safe urban district with central avenues, building blocks, multiple approaches, props, and eight additional residents/guards.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

Verification:

* Syntax checks passed for all changed JavaScript files.
* `scripts/verify-game-smoke.js` passed with 12,938 reachable tiles and all NPCs, bosses, portals, treasures, and discoveries reachable.
* Smoke coverage verifies boss telegraph/piercing/persistent behavior, world-map state exclusivity, highland region composition, and expanded Black Market safety.
* `git diff --check` passed except expected CRLF conversion warnings.
* In-app browser visual QA could not initialize because the local browser integration lacked required sandbox metadata. The generated map preview was inspected directly and confirms the central world now reads as a mountain/river region rather than parallel rectangular corridors.

Known risks / next work:

* Boss warning timing, persistent-zone damage cadence, and shield counterplay need hands-on playtesting.
* The new three-route highland crossing needs manual traversal to tune enemy density and compare route travel times.
* Black Market City has the physical scale and population of a city, but still needs more specialist services and optional urban activities.
* The northern Chapter 1 landmass and some southern castles still retain rectangular edges; the next geography pass should add coast/island structure and terrain-led castle approaches.

### 2026-06-21: Playtest-response combat, dungeon population, and quick-slot pass

Goal: turn direct playtest feedback into immediate improvements while resetting the roadmap toward action depth, meaningful geography, a major city, and a world map.

Implemented:

* Revised active design/planning documents around action depth, weapon viability, dungeon-local population, believable geography, varied town dialogue, configurable item access, boss patterns, and a future major city.
* Added 13 weapon attack profiles with distinct cooldown, reach, arc width, power, lunge, knockback, color, and inventory description.
* Changed active-attack damage so route/position multipliers apply before enemy defense; intended sidegrades now remain functional against high-defense targets.
* Fixed interior spawn accounting: exterior/other-floor monsters no longer consume dungeon population, interior spawn radii are tighter, and each floor receives its own rapid population pass.
* Replaced the fixed herb/bomb/ward dock with three configurable slots supporting all six consumables, keyboard/click use, Q/E selection, inventory assignment, and save migration.
* Added settlement-specific dialogue pools for seven safe locations, producing distinct local life, service, route, and danger lines.
* Preserved and incorporated the user's uncommitted higher late-enemy stats and additional Frost Frontier path openings.

Verification:

* VM smoke coverage now checks quick-slot HTML, assignment/use/cycling/save persistence, attack-profile speed/reach/lunge differences, interior-local population, exterior pruning, and non-repeating town dialogue.
* `scripts/verify-game-smoke.js` passes with 13,401 reachable tiles.
* Real-browser QA was attempted through the available in-app browser, but its local runtime could not initialize under the current Windows sandbox. Visual quick-slot fit remains a manual QA item.

Known risks / next work:

* Weapon profile power and the user's stronger late-game enemy stats need hands-on balance testing together.
* Bosses still need piercing, delayed multi-wave, and persistent-zone attacks to make movement skill matter more than level.
* The next map expansion should establish mountain/highland/coast geography and a true major city, accompanied by a whole-world map rather than more wall corridors.

### 2026-06-20: Frost Watchtower multi-floor dungeon

Goal: add a structurally distinct optional expedition that increases Chapter 4 volume and rewards mastery with both a new movement build and a permanent return shortcut.

Implemented:

* Added `霜見塔` as two fixed, hand-editable interior floors with an overworld entrance, inter-floor stairs, floor-specific spawn identity, supplies, discoveries, and a guarded reliquary.
* Added an elevator activated from the far side; its discovery persists and allows direct future travel from Frost Frontier to floor two.
* Added `凍気灯`, a stationary aura enemy that drains stamina and slows nearby players, plus frost-equipment mitigation.
* Added the LV32 `霜見の塔守`; below 55% HP it accelerates and activates three arena beacons.
* Added `天駆けの徽章`, which extends dash distance and shortens dash cooldown while equipped.
* Added save/load/reset fields, guidance, UI labels, rendering, projectile/contact handling, reward locks, and extensive VM checks.
* Corrected map-preview generation so both PNG and SVG are built from the fully assembled map including `TERRAIN_DETAILS`.

Verification:

* Syntax checks passed for all JavaScript under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed, including tower portal traversal, floor regions, reachability, elevator lock/unlock, enemy behavior, boss phase/defeat, reward guard, Sky Emblem effect, and save/load persistence.
* `git diff --check` passed with expected line-ending warnings only.
* `docs/world-map-preview.png` and `docs/world-map-preview.svg` were regenerated from the actual assembled `120x160` map and visually inspected.

Known risks:

* Real-browser QA remains unavailable because the Windows browser sandbox fails with `CreateProcessAsUserW failed: 5`.
* Tower combat density, beacon aura strength, LV32 timing, and Sky Emblem feel still need hands-on Chapter 4 balance testing.

### 2026-06-20: Frost Haven shield-engraving pass

Goal: make Frost Haven mechanically distinct and give late-game gold and shields a new contact-combat decision.

Implemented:

* Added a visible `盾刻師` NPC and selectable shield-engraving service in Frost Haven.
* Added `城壁の刻印` for additional frontal contact reduction, `疾走の刻印` for movement/dash efficiency, and `反撃の刻印` for defense-scaled frontal retaliation.
* Locked the counter engraving behind Frost Golem defeat so Ice Cave progression changes what the town can do.
* Added engraving costs as a late-game gold sink; only one engraving can be active and changing builds costs gold.
* Added engraving status to shield inventory rows and the equipment panel.
* Added save/load/new-game handling and old-save validation for the selected engraving.
* Fixed zone naming so Frost Haven, Frost Frontier, Ice Cave, and Frost Crown Citadel display their actual region names.
* Preserved the pre-existing local one-tile Frost Frontier terrain opening instead of reverting the user's map edit.

Verification:

* Syntax checks passed for all 24 JavaScript files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* VM checks cover artisan placement/reachability, lock state before Frost Golem, all three purchases, frontal reduction, movement/dash changes, counter direction, save/load persistence, and Frost region labels.
* `git diff --check` passed with expected LF-to-CRLF conversion warnings only.

Known risks:

* Real-browser overlay fit and hands-on combat feel remain unverified; the browser runtime was retried in this pass and still failed to start with Windows sandbox error `CreateProcessAsUserW failed: 5`.
* Engraving costs and effect strength need manual Chapter 4 playtesting against current gold income and Frost Crown Dragon pressure.


### 2026-06-20: Chapter 4 Frost Frontier expansion

Goal: add a full post-Chapter-3 survival-range arc with a moved safe radius, route choice, new behavior pressure, a preparation dungeon, and a major boss rather than another isolated reward pocket.

Implemented:

* Expanded the hand-authored fixed world from `120x144` to `120x160` with Frost Frontier, Frost Haven, Ice Cave, and Frost Crown Citadel.
* Added Frost Haven as a true remote safe town with recovery circle, wagon travel, merchant, guide, guards, residents, props, and premium expedition stock.
* Added two route profiles: a faster northern road to the citadel and a denser southern Ice Cave route that earns the chapter resistance accessory.
* Added Frost Moth ranged slow/stamina pressure and Frost Beast telegraphed charges.
* Added the LV30 Frost Golem midboss, guarded Frost Heart reliquary, frost supplies, route discoveries, and frost seal.
* Added rank-12 frost weapon/armor, rank-6 shield, and `霜心の護符` equipment preparation.
* Added the LV34 Frost Crown Dragon with enrage, five-way frost shots, and Frost Moth/Frost Beast reinforcements.
* Added Chapter 4 objective/guidance text, elder report, clear presentation, save/load/reset fields, map rendering/atmosphere, and region-aware enemy density.

Verification:

* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg` at `120x160`; the new town, road, cave, river crossings, and citadel are visible in the preview.
* `scripts/verify-game-smoke.js` passed after adding reachability, regional spawn, town safety/heal, selectable shop, reward lock, accessory mitigation, save/load, boss behavior, and complete Chapter 4 report-flow checks.
* VM behavior checks confirmed Frost Moth projectiles, Frost Beast charge telegraph, Frost Dragon enrage spread, and mixed reinforcements.
* Syntax checks passed for all 24 JavaScript files under `src/` and `scripts/`.
* `git diff --check` passed; only the repository's expected LF-to-CRLF conversion warnings were reported.

Known risks:

* Real-browser interactive QA is unavailable in the current Windows sandbox because browser startup fails with `CreateProcessAsUserW failed: 5`.
* A real Chapter 3-clear playtest is still needed for LV30/LV34 timing, gold versus frost gear prices, Ice Cave retreat feel, and Frost Crown Dragon balance.
* Frost Haven's services are useful but should gain a more distinct crafting/reforging identity in a later content pass.


### 2026-06-20: Black Market Catacombs interior-dungeon pass

Goal: add a substantial playable expedition with its own entrance, terrain, enemy behavior, midboss, reward, and retreat decision rather than another isolated map pickup.

Implemented:

* Converted unused enclosed upper-map terrain into `黒市地下墓所`, a dense stone-floor interior entered from Black Market and exited through the same stair route.
* Added portal interaction, prompts, projectile cleanup, temporary entry protection, and portal-aware map reachability.
* Added `吸命鬼`, which drains stamina, slows, and heals itself on contact.
* Added `地下墓所の番人`, a LV22 optional midboss after Chapter 2 report that fires grave magic and summons two leeches below half HP.
* Added a guarded reliquary, supply cache, grave inscription, Black Market guide/guard hints, catacomb lighting/props, and distinct dark atmosphere.
* Added `深層灯の護符`: slow movement penalty is reduced and herb healing is strengthened while equipped.
* Fixed an existing equipment-choice regression where owned legacy accessory flags could remain active after all accessories were unequipped.
* Added save/load/reset persistence for the new boss and accessory.

Verification:

* JavaScript syntax checks passed for all `src/` and `scripts/` JavaScript files.
* `scripts/verify-game-smoke.js` passed.
* Smoke coverage now verifies portal traversal, portal-aware dungeon reachability, region/spawn identity, boss spawn/defeat, guarded reliquary behavior, Deep Lamp effects, and save/load persistence.
* `docs/world-map-preview.png` and `docs/world-map-preview.svg` were regenerated and visually inspected; the first preview exposed grass-like interior flooring, which was corrected to stone floor.

Known risks:

* Real-browser QA could not be started because the available browser runtime failed to launch under the Windows sandbox (`CreateProcessAsUserW failed: 5`).
* Crypt Warden, Vault Leech, and Deep Lamp values still need fresh-save manual balance testing.
* The next volume pass should be chapter-sized: a new safe town, multiple routes, a different interior structure, and a major boss rather than another single optional pocket.

### 2026-06-18: Mist Shrine side-dungeon volume pass

Goal: increase playable volume with a new optional expedition layer instead of only adding planning text or empty map space.

Implemented:

* Added the Mist Shrine as a Black Market north side route beyond the regeneration cave.
* Added Mist Lancer, a windup-and-lunge enemy that asks the player to sidestep rather than tank direct contact.
* Added Mist Keeper as a named LV18 midboss gated behind Regen Sentinel defeat.
* Added `霧灯の護符`, which reduces trap, summon, and magic pressure when equipped.
* Added shrine supply chest, shrine hint discoveries, guarded accessory chest behavior, region guidance, zone naming, accessory UI copy, and visible field marker coloring.
* Added save/load/reset support for Mist Charm and Mist Keeper flags.
* Added a hand-authored shrine court terrain overlay and regenerated `docs/world-map-preview.png` / `docs/world-map-preview.svg`.

Verification:

* `node --check` passed for changed source files and `scripts/verify-game-smoke.js`.
* `node scripts/verify-game-smoke.js` passed using the bundled Node runtime.
* `git diff --check` passed with CRLF line-ending warnings only.
* The smoke test caught an initial terrain reachability regression around an existing Eclipse side cache; the shrine terrain was adjusted and the test then passed.
* Map preview was regenerated and visually inspected.

Known risks:

* Real browser/manual play QA was not performed in this pass.
* Mist Keeper and Mist Lancer balance needs fresh-save playtesting against current Black Market / Chapter 2-3 progression.
* The world still needs larger-volume content such as interior dungeons, richer town districts, and more multi-step regional arcs.

### 2026-06-18: World density pass

Goal: reduce sparse-feeling map travel without expanding map size or adding empty walking space.

Implemented:

* Added `TERRAIN_DETAILS` in `src/data/maps/world.js` for fixed, hand-authored small landmark overlays.
* Added camp remains, shrine/marker grounds, thorn fields, moss patches, old stalls, and muster-ground details across sparse areas.
* Added seven additional treasure caches across grassland, river fork, ash road, moon west route, regeneration cave side route, eclipse approach, and Black Sun approach.
* Added seven additional discovery points that provide route hints, shortcut hints, trap warnings, waystone support, and regeneration-cave guidance.
* Added nine NPCs across Black Market, Ash Hamlet, Moon Camp, and Black Fort to make remote bases feel more inhabited.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

Verification:

* `node --check src/data/maps/world.js`
* `node --check src/data/definitions.js`
* `node --check scripts/verify-game-smoke.js`
* `node scripts/verify-game-smoke.js` passed.
* Map preview was regenerated and visually inspected.

Known risks:

* Real browser/manual play QA was not performed in this pass.
* This pass improves density in representative areas, but the world still needs region-by-region landmark and route-choice passes.
* Added rewards may slightly accelerate gold/item economy and should be checked in a fresh-save playthrough.

### 2026-06-18: Smuggler shortcut and regeneration cave climax

Goal: make existing optional routes more interesting without broad refactoring or empty map expansion.

Implemented:

* Added Smuggler Captain as a named midboss on the western shortcut toward Black Market.
* Added two smuggler supply caches and another smuggler hint so the shortcut has tangible risk/reward value.
* Added Regen Sentinel as the guardian of the Black Market north regeneration cave.
* Locked the Greater Regeneration Ring chest until Regen Sentinel is defeated.
* Added save/load/reset state for Smuggler Captain and Regen Sentinel flags.
* Updated regional guidance for the smuggler road and regeneration cave.
* Extended smoke verification for named midboss spawn/defeat, save/load persistence, shortcut rewards, and the guarded Greater Regeneration Ring chest.

Verification:

* `node --check` for changed source files and `src/game.js`.
* `node scripts/verify-game-smoke.js` passed.

Known risks:

* Real browser/manual QA was not performed in this pass.
* Smuggler Captain and Regen Sentinel difficulty still need manual tuning against fresh-save progression and current late-shop prices.
* The new encounters improve optional-route purpose, but the western shortcut and Black Market north terrain still need more landmark/route variety.

### 2026-06-14: Smuggler shortcut, two accessory slots, and regeneration cave

Goal:

* Reduce the overworld's一本道 feel and add a high-risk shortcut / side-dungeon reward loop.
* Make accessories less dead by allowing two equipped accessories.
* Make Trap Flowers readable enough to react to.

Implemented changes:

* Added a western smuggler road through the southern map that can lead toward Black Market earlier than the normal route.
* Added the Black Market north regeneration cave with a one-time `大再生の指輪` chest and a cave hint discovery.
* Added `smuggler` and `regenCave` spawn regions with stronger shortcut/dungeon pressure.
* Added `大再生の指輪` as a large regeneration accessory.
* Added two equipped accessory slots with legacy `equippedAccessory` save compatibility.
* Updated inventory/status UI to show two equipped accessories and support accessory equip/unequip/replacement.
* Extended save/load and smoke tests for `equippedAccessories`, `greaterRegenCharm`, new route rewards, and old save migration.
* Doubled Trap Flower priming time from `520ms` to `1040ms`.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

Verification performed:

* `node --check src/game.js`
* `node --check src/systems/rewards.js`
* `node --check src/systems/ui.js`
* `node --check src/systems/spawn.js`
* `node --check src/systems/monsters.js`
* `node --check src/systems/save.js`
* `node --check scripts/verify-game-smoke.js`
* `node scripts/verify-game-smoke.js`
* `git diff --check` passed with CRLF warnings only.
* Map preview visually checked after regeneration.
* In-app Browser QA was attempted but failed in this environment with `CreateProcessAsUserW failed: 5`.

Known risks:

* Real browser/manual play QA for the new smuggler road, regeneration cave, and two-accessory UI is still pending.
* New shortcut enemy pressure and large regeneration balance need fresh-save playtesting.
* The smuggler road currently improves route choice, but it still needs more landmark pockets or a named elite to feel fully authored.

### 2026-06-14: Trap Flower Area-Denial Route Pass

Goal: make late routes more interesting to traverse by adding a danger that changes movement decisions, not only enemy stats. The target was survival-range expansion through risky shortcuts, visible warnings, and route-extension supplies.

Key work:

* Added Trap Flower / `地雷花` as a stationary late-route enemy in Moon Ruins, Eclipse, Obsidian, and Black Sun spawn pressure.
* Trap Flowers now warn briefly, then explode for HP damage, stamina loss, and slow pressure; players can cut them early, route around them, or prepare with wards/return bells.
* Added trap-warning discoveries and trap-route caches around Moon Ruins and Black Sun approaches.
* Added `trapSupply` and `trapHint` rewards that provide wards, tonics, return bells, and warning text.
* Added field rendering for trap-warning markers and Trap Flower sprites, including a primed warning flash.
* Updated travel memo guidance so late-route notes mention how to handle Trap Flowers.
* Updated VM smoke coverage for trap definition, level-gated spawn pools, explosion behavior, trap-route rewards, and travel memo guidance.

Verification:

* JavaScript syntax checks passed for all files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* `git diff --check` passed with CRLF warnings only.

Known risks:

* Real browser QA was attempted, but the browser runtime failed with Windows `CreateProcessAsUserW failed: 5`.
* Browser readability is still pending for the new Trap Flower sprite/priming warning and route feel.
* Manual balance is still needed for Trap Flower density, explosion damage, and whether the Moon Ruins first exposure feels fair.

### 2026-06-14: Summoner, Travel Memo, and Late-Route Density Pass

Goal: make the existing `120x144` overworld more worth exploring without another size jump. Focus was route density, readable landmarks, behaviorally distinct enemies, destination guidance, and late-route survival-range expansion.

Key work:

* Added Summoner / `召喚士` as a late-route enemy that calls reinforcements when ignored.
* Added Summoners to Moon Ruins, Eclipse, Obsidian, and Black Sun spawn pools with level gating.
* Added Moon/Eclipse/Black Market side caches and route discoveries that reward tonics, return bells, wards, bombs, and gold.
* Added visible field markers for route hints, shortcut hints, obsidian waystones, and summoner warnings.
* Added `旅メモ` to the status panel so players can understand the next route and preparation target without coordinate-style instructions.
* Roughened selected Eclipse Castle and Black Sun Castle wall rows into broken courts and side paths.
* Added four more NPCs to remote bases / Black Market areas to make bases feel more inhabited.
* Localized remaining visible item-detail labels and the return-bell message into Japanese-facing text.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

Verification:

* JavaScript syntax checks passed for all files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* `git diff --check` passed with CRLF warnings only.
* Map preview generation passed at `120x144`.
* VM smoke now verifies 40 NPCs, Summoner definition/spawn-pool membership, Summoner reinforcement behavior, `旅メモ` status-page presence, new summoner supply reward, and reachability for all chests/discoveries.

Known risks:

* Real in-app Browser QA was attempted, but the browser runtime failed again with Windows `CreateProcessAsUserW failed: 5`.
* Manual balance is still needed for Summoner frequency, reinforcement pressure, late-route reward value, and whether the new side paths feel clear during actual play.

### 2026-06-14: Dense Route, Shield Slot, and Landmark Side-Rewards Pass

Goal: improve the existing `120x144` overworld as an RPG world rather than expanding map size again. Focus areas were sparse/linear route feel, wall-corridor terrain, remote-base life, side rewards, enemy behavior difference, equipment choice, and readable preparation.

Key work:

* Added a formal shield slot:
  * `shield`, `ownedShields`, save/load migration, reset handling.
  * Shield inventory tab, equip behavior, sell guards, shop purchases, status display.
  * Shield definitions from wooden shields through Black Sun / Obsidian shields.
* Added shield combat behavior:
  * Shields reduce frontal contact damage.
  * Shield Soldier is weak to side/back attacks but inefficient to attack from the front.
* Added Shield Soldier to old tower, eclipse, obsidian, and void route spawn pressure.
* Added shield route rewards:
  * Ash Watchtower cache.
  * Old Tower side cache.
  * Black Gate shield cache.
* Added route-hint and shortcut-hint discovery rewards that provide tonics/return bells and teach preparation.
* Roughened selected old-tower / eastern-ruin map walls into broken wall openings and side pockets to reduce the sealed-corridor feeling.
* Added more NPCs to Black Market, Ash Hamlet, Moon Camp, and Black Fort.
* Localized newly added English-facing names/messages for Tonic, Elixir, Return Bell, Base Wagon, and obsidian supply text.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.
* Expanded VM smoke coverage for NPC count, shield save/load, shield inventory equip, frontal shield mitigation, Shield Soldier spawn/combat behavior, shield shop stock, and shield reward chests.

Verification:

* `node --check` passed for all JavaScript files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* Map preview generation passed at `120x144`.
* VM smoke verifies reachability for new shield reward locations and existing major route goals.

Known risks:

* Real in-app Browser QA was attempted, but the browser runtime failed with Windows `CreateProcessAsUserW failed: 5`.
* Manual balance is still needed for shield prices, shield mitigation strength, Shield Soldier density, and whether heavy shields should eventually reduce movement.
* Terrain improvements are intentionally focused and safe; more large-scale hand-authored terrainization is still needed for Moon Ruins, Black Market outskirts, and Black Sun Castle.

### 2026-06-13: Base Travel, Shop Economy, and Late-Route Density Pass

Goal: address playtest feedback that the strongest weapon could be found without buying gear, gold had too few uses, bases felt lonely, late maps felt sparse/over-walled, walking from the first village to late areas was tedious, and shop item rows overlapped.

Key work:

* Changed Obsidian Vault reward so it no longer grants rank 11 weapon/armor directly.
* Kept the Obsidian Bracelet as a meaningful exploration reward and added premium route supplies instead.
* Raised rank 11 weapon/armor prices so Black Market gear remains a real late-game gold sink.
* Added new consumables:
  * Tonic: restores stamina, clears slow, and gives a small guard buffer.
  * Elixir: fully restores HP/stamina and clears slow/burn.
  * Return Bell: returns to the nearest unlocked safe base.
* Added Base Wagon travel through new porter NPCs at village and remote bases.
* Added more guards/villagers/porters to village, southwest camp, Ash Hamlet, Moon Camp, Black Fort, and Black Market.
* Expanded remote shop lineups with tonics, elixirs, return bells, bombs, wards, and premium Black Market supplies.
* Added Black Market and Obsidian route supply rewards.
* Increased late-region spawn density targets and max monster cap.
* Opened an extra Black Sun Castle wall route to reduce the over-walled, single-corridor feel.
* Updated shop rendering so row descriptions move to the bottom help line instead of overlapping item names and prices.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

Verification:

* `node --check` passed for changed JS files using bundled Node.
* `scripts/verify-game-smoke.js` passed.
* `git diff --check` passed with CRLF warnings only.
* Map preview generation passed at `120x144`.
* VM smoke verifies 30 NPCs, porter loading, base travel, premium item purchases, updated Obsidian Vault reward, Obsidian route supply rewards, save/load for new items, and reachability for new rewards/discoveries.

Known risks:

* Real-browser QA was attempted, but the in-app browser runtime failed with Windows `CreateProcessAsUserW failed: 5`.
* Manual balance is still needed for late-game gold income versus rank 11 gear, elixir/return bell prices, and denser Chapter 3 enemy pressure.
* Bases are more populated, but Black Market should still gain unique conversations/errands and more city identity in a future content pass.

### 2026-06-13: Selectable Shops and Obsidian Branch Expedition

Goal: address playtest issues with equipment acquisition/shop flow and make the Chapter 3 route feel like a longer expedition toward Black Sun Castle.

Key work:

* Replaced fixed-order NPC auto-buy behavior with selectable shop menus for smith, healer, frontier bases, and Black Market.
* Added shop controls for up/down selection, confirm purchase, and close.
* Added shop overlay rendering with cost, owned state, lock reason, and player gold.
* Preserved the rule that weaker found equipment is added to inventory if new but does not auto-equip over stronger current gear.
* Added Black Market as a Chapter 3 second town with safe-zone handling, recovery point, merchant, guide, guards, villagers, supplies, and map/readability details.
* Added Obsidian Cave as a Chapter 3 branch region with Obsidian Crawler spawns.
* Added Obsidian Golem as a Chapter 3 midboss before the Black Sun Dragon route.
* Added obsidian weapon/armor/accessory rewards and Black Market shop stock after the Obsidian Golem is defeated.
* Updated Chapter 3 objective/guidance, region text, save/load fields, combat modifiers, projectile/status handling, render markers, and VM smoke coverage.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

Verification:

* JavaScript syntax checks passed for all files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* `git diff --check` passed with line-ending warnings only.
* Map preview generation passed at `120x144`.
* VM smoke now verifies:
  * reachability for Black Market, Obsidian Golem site, Black Sun route, chests, and discoveries,
  * 15 NPCs loaded from `WORLD_OBJECTS`,
  * selectable shop purchasing for route gear, accessories, and supplies,
  * weaker found equipment is kept without auto-equipping,
  * Obsidian Golem spawn/defeat before Black Sun Dragon,
  * obsidian rewards and save/load persistence.

Known risks:

* Real-browser visual QA is still pending. Browser connection was attempted, but this environment failed with Windows `CreateProcessAsUserW failed: 5`.
* Chapter 3 balance after adding selectable shops and Obsidian Golem needs manual playtesting.
* Black Market is functional, but should gain more city content, unique conversations, and optional side rewards in a later content pass.

### 2026-06-13: Chapter 3 Black Sun Dragon Boss Route

Goal: add a harder Chapter 3 arc after the Eclipse Dragon route, increasing volume while preserving survival-range expansion.

Key work:

* Expanded the fixed overworld from `120x128` to `120x144`.
* Added Black Gate, Black Fort, and Black Sun Castle as a southern Chapter 3 route.
* Added Black Fort as a new remote safe base with full recovery, supplies, Black Sun gear, and Void Charm progression.
* Added Void Wraith / `黒陽の影` as a high-pressure late caster with stronger slow/stamina projectile pressure.
* Added Black Sun Dragon / `黒陽竜` as a Chapter 3 major boss after:
  * Chapter 2 elder report,
  * Eclipse Castle cache,
  * Black Fort armory,
  * Black Sun seal discovery,
  * level 26.
* Added Chapter 3 rewards:
  * `black-fort-armory`,
  * `black-sun-cache`,
  * `void-seal`,
  * `黒陽の剣`,
  * `黒陽の鎧`,
  * `黒陽の護符`.
* Added Chapter 3 save/load fields, objective text, elder report flow, boss marker, ending banner, region UI, dark-region atmosphere, and boss/enemy rendering.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg` at `120x144`.

Verification:

* JavaScript syntax checks passed for all files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* VM smoke now verifies:
  * `120x144` map size,
  * reachability for Black Fort, Black Sun seal, Black Sun cache, and Black Sun Dragon,
  * Black Fort safe-zone behavior,
  * void region detection and spawn pool,
  * Black Sun gear/accessory rewards,
  * Black Sun Dragon spawn, defeat, save flags, and elder report.
* Map preview generation passed at `120x144`.

Known risks:

* Real-browser interactive QA for walking from Eclipse Castle through Black Fort to Black Sun Castle is still pending.
* In-app Browser QA was attempted, but the browser runtime failed with Windows `CreateProcessAsUserW failed: 5`.
* Chapter 3 combat balance, especially Void Wraith projectile pressure and Black Sun Dragon HP/spread/summon pacing, needs manual playtesting.
* The new Chapter 3 route is playable and VM-verified, but it should be deepened with more landmarks, enemies, optional rewards, and another remote town/dungeon in future passes.

### 2026-06-12: Chapter 2 Eclipse Dragon Boss Route

Goal: increase game volume beyond the Red Dragon / Moon Ruins route by adding a Chapter 2 major boss story that extends survival-range expansion farther south.

Key work:

* Expanded the fixed overworld from `120x112` to `120x128`.
* Added Moon Camp / `月見砦` as a new remote safe base with recovery, supplies, and eclipse preparation.
* Added Eclipse Castle / `月蝕城` as the Chapter 2 final danger pocket.
* Added Eclipse Mage / `月蝕術師` as a stronger late magic enemy in the new `eclipse` region.
* Added Eclipse Dragon / `月蝕竜` as a Chapter 2 major boss after:
  * Red Dragon elder report,
  * Ash Knight defeat,
  * Moon Ruins relic chest,
  * Eclipse Seal discovery,
  * level 20.
* Added eclipse gear and rewards:
  * `月蝕の刃`,
  * `月蝕の外套`,
  * `月蝕の指輪`,
  * `moon-camp-armory`,
  * `eclipse-castle-cache`,
  * `eclipse-seal`.
* Added Chapter 2 save/load fields, objective text, elder report flow, boss marker, ending banner, and region UI.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg` at `120x128`.

Verification:

* JavaScript syntax checks passed for all files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* VM smoke now verifies:
  * `120x128` map size,
  * reachability for Moon Camp, Eclipse Seal, Eclipse Castle cache, and Eclipse Dragon,
  * eclipse region detection and spawn pool,
  * Moon Camp safe-zone/heal/shop behavior,
  * eclipse gear/accessory rewards,
  * Eclipse Dragon spawn, defeat, save flags, and elder report.
* Map preview generation passed at `120x128`.

Known risks:

* Real-browser interactive QA for walking from Moon Ruins to Moon Camp and fighting Eclipse Dragon is still pending.
* In-app Browser QA was attempted, but the browser runtime failed with Windows `CreateProcessAsUserW failed: 5`.
* Chapter 2 combat balance, especially Eclipse Dragon HP/projectile pressure and level 20 pacing, needs manual playtesting.
* The new Chapter 2 route is playable and VM-verified, but it should be deepened with more landmarks, enemies, and side rewards in future passes.

### 2026-06-12: Post-Dragon Ash Knight Fix and Moon Ruins Expansion

Goal: apply playtest findings, fix the Ash Knight post-victory spawn blocker, improve Old Tower route guidance, and add more playable map content beyond the current expanded route.

Key work:

* Fixed `updateStoryEvents()` so game over still stops story events, but Red Dragon victory no longer prevents the Old Tower Ash Knight from spawning when its requirements are met.
* Kept normal Guardian/Warden story spawning gated after `victory`, so the fix is targeted to the late optional Ash Knight route.
* Expanded the fixed overworld from `120x96` to `120x112`.
* Added the Moon Ruins / `月影廃墟` as a southern continuation past the Old Tower.
* Added Moon Shade / `月影の亡霊` as a late magic enemy with faster magic projectiles and stamina/slow pressure.
* Added Moon Ruins treasure and discovery content:
  * `moon-ruin-cache`
  * `moon-road-supply`
  * `moon-waystone`
  * `moon-field-cache`
* Added `moonRelic`, `moonSupply`, and `waystone` rewards for late-route supplies, wards, stamina recovery, and star-gear reinforcement.
* Added guidance text that points the player from Ash Hamlet south to the Old Tower and from the Old Tower south to the Moon Ruins.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg` at `120x112`.
* Updated `scripts/generate-map-preview.ps1` so map previews include `SOUTH_GATE_ROW` and `DEEP_SOUTH_EXPANSION`.

Verification:

* JavaScript syntax checks passed for all files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* VM smoke now verifies:
  * `120x112` map size,
  * reachability for Moon Ruins treasure/discovery goals,
  * Moon Ruins region detection,
  * Moon Shade spawn pool membership,
  * Moon rewards and waystone reward behavior,
  * Ash Knight spawning after Red Dragon victory when requirements are met.
* `git diff --check` passed with CRLF warnings only.
* Map previews regenerated successfully at `120x112`.

Known risks:

* In-app Browser QA could not be run because the browser runtime failed with Windows `CreateProcessAsUserW failed: 5`.
* Manual balance for Moon Shade, Moon Ruins reward value, and the Red Dragon -> Ash Knight -> Moon Ruins optional route still needs real playtesting.

### 2026-06-12: 120x96 World Expansion and Equipment Visibility

Goal: answer the player-facing request to make the world larger and make equipment strength/status understandable.

Key work:

* Expanded the fixed overworld definition from `80x72` to `120x96`.
* Kept the original Chapter 1 route intact and added editable fixed-map expansion sections:
  * `BASE_MAP`
  * `EAST_EXPANSION`
  * `SOUTH_EXPANSION`
* Added Ash Road / `灰の街道`, Ash Hamlet / `灰道の宿場`, and Old Tower / `古塔`.
* Added Ash Hamlet as a second remote safe base with a heal point and frontier-style supply NPC.
* Added new one-time rewards:
  * `ash-road-cache`
  * `south-quarry-cache`
  * `old-tower-cache`
  * `ash-spring`
  * `tower-cache`
* Added `灰術師` as a magic/ranged enemy for the expanded road/tower regions.
* Added `古塔の灰騎士` as an optional late midboss after Southeast Warden + level 14.
* Added `星見の杖` and `星織りの衣` as magic-route sidegrade equipment.
* Ash Hamlet sells star gear after the Ash Knight is defeated.
* Inventory weapon/armor rows now show ATK/DEF totals and current-equipment deltas.
* The side status panel now shows equipped weapon/armor bonus values.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.
* Updated preview generation so the PowerShell preview script understands the split fixed-map sections.

Verification:

* Syntax checks passed for changed JavaScript files during the pass.
* `scripts/verify-game-smoke.js` passed.
* VM smoke now verifies:
  * `120x96` map size,
  * reachability for the new chests, discoveries, Ash Hamlet, and Old Tower,
  * Ash Hamlet safe-zone/heal behavior,
  * Ash Sorcerer / Ash Knight definitions and region pools,
  * Ash Knight defeat persistence and not counting as the Guardian,
  * Ash Hamlet post-midboss star-gear sales,
  * inventory ATK/DEF comparison text,
  * `ashGear` chest reward.
* Map previews regenerated successfully at `120x96`.

Known risks:

* Real-browser interactive QA for walking the full new Ash Road / Old Tower route is still pending.
* In-app Browser connection failed with a Windows `CreateProcessAsUserW failed: 5` error in this environment.
* Edge headless browser QA could not be run because the escalation request was rejected by the approval/usage system; do not work around this without user approval.
* Balance for Ash Sorcerer, Ash Knight, and star gear needs manual playtesting.
* The expanded map is much larger, but some new terrain should still be thickened with more NPC hints, rewards, and route landmarks.

### 2026-06-12: Route Preparation Equipment Expansion

Goal: continue aggressive game expansion by making the real `もちもの` inventory matter through actual equipment choices, not only UI structure.

Key work:

* Added new sidegrade weapons:
  * `泡割り槍`: strong against Bubbler / slime-style mine pressure.
  * `火返しの剣`: strong against Wisp and Dragonling fire-route enemies.
  * `竜狩りの刃`: late preparation weapon for Dragonling and Red Dragon pressure.
* Added new sidegrade armor:
  * `鉱夫服`: reduces bubble damage, slow duration, and stamina loss pressure.
  * `耐火マント`: reduces fire damage and burn duration.
  * `巡礼鎧`: late-route defense against bosses, midbosses, dragonlings, and projectiles.
* Southwest frontier camp now sells route-preparation gear after the player obtains the mine charm:
  * mine gear first,
  * fire-route gear from level 8,
  * dragon-route gear from level 12.
* Added a new reachable mine treasure chest, `mine-armory`, that grants `泡割り槍` and `鉱夫服` as an exploration reward.
* Updated reward handling so sidegrade gear is added to inventory without auto-equipping over a higher raw-power current item.
* Unified Southeast Warden readiness through `WARDEN_REQUIREMENTS.level` so spawn logic, guidance, and marker rendering use the same level gate.

Verification:

* Syntax checks passed for all JavaScript files under `src/` and `scripts/`.
* `scripts/verify-game-smoke.js` passed.
* VM smoke now verifies:
  * sidegrade weapon inventory pickup without auto-downgrade,
  * frontier camp sale of mine, fire-route, and dragon-route gear,
  * mine sidegrade weapon damage against Bubbler,
  * mine sidegrade armor bubble damage reduction,
  * Warden gate using the new requirement,
  * the new `mine-armory` chest is reachable.
* `git diff --check` passed with CRLF warnings only.
* Edge headless loaded `index.html` and wrote `docs/browser-qa-equipment-expansion.png`; the captured start screen rendered correctly.

Known risks:

* Interactive browser QA for actually opening `もちもの`, buying camp gear, and switching equipment remains pending.
* New gear prices/effects need manual playtesting against the longer LV15 route.
* The map size is still `80x72`; this pass expanded equipment/content depth, not world dimensions.

---

## Historical milestones

### 2026-06-05: Core route and survival-range foundation

Implemented the first complete village -> Guardian -> Red Dragon -> elder report route.

Key work:

* North Forest Guardian midboss.
* Dragon challenge requirements: 3 scales, level 4, seal crest.
* Red Dragon victory and elder report clear flow.
* Save/load fields for progression.
* Weapon/armor traits tied to facing/contact combat.
* Persistent hidden discoveries: spring, ore, hunter cache.
* Red Dragon enrage, spread shots, and summons.
* Early damage and armor tuning so retreat/equipment matter.
* Mid-game regeneration ring.

Verification included syntax checks and VM simulation for Guardian, dragon, elder report, save/load, and damage-reduction samples.

### 2026-06-05: Region population, village safety, tempo, and UI

Improved survival-range feel and readability.

Key work:

* Region-aware spawn pools and local replenishment.
* `wilds` region so distant grassland is not treated like village outskirts.
* Local monster pruning to prevent stale off-screen monsters from blocking current-region spawns.
* Projectile town-entry blocking.
* Gates close while player is inside town.
* Stronger village boundary and role markers.
* Walkable clearings around static rewards.
* Faster movement, dash, stamina recovery, attack cooldown, dash cooldown, and contact interval.
* Objective guidance and context prompts.
* Strength/info panel for equipment, survival, inventory/progression.

Verification included VM checks for spawns, projectile blocking, gate behavior, reward reachability, prompts, tempo constants, clear flow, and save/load.

### 2026-06-05: Refactor and fixed map foundation

Moved from monolithic `src/game.js` toward the current structure.

Key work:

* Extracted definitions, math, state/context, and systems into `src/data`, `src/core`, and `src/systems`.
* Preserved non-module script loading via `globalThis.DRAGON_HUNTER_*`.
* Replaced pseudo-random map generation with fixed hand-editable map data.
* Expanded map from 64x64 to 80x72.
* Moved terrain to `src/data/maps/world.js`.
* Added `WORLD_OBJECTS`.
* Added map editing docs and map preview generation scripts.
* Added `scripts/verify-game-smoke.js`.

Verification included JS syntax checks, script-order smoke, map reachability, NPC placement, region spawn checks, save/load persistence, and preview generation.

### 2026-06-05: Browser rendering QA

Real browser engine rendering was checked with Microsoft Edge headless.

Result:

* Desktop, mobile portrait, and mobile landscape screenshots were produced.
* Game booted and rendered canvas, player, map, HUD, commands, touch controls, and status panels.
* No fatal script errors were found in captured logs.
* Mobile portrait and landscape had usability/overflow density concerns.
* This was rendering QA, not live manual input QA.

Remaining risk: keyboard/touch movement, combat, save/load UI, and full fresh-save playthrough still need interactive browser/manual QA.

### 2026-06-06: Southeast route content

Made east/southeast expansion a more meaningful optional direction.

Key work:

* `south-outpost` chest.
* `trailCharm` / traveler bell.
* Traveler bell improves movement, stamina capacity, stamina recovery, and dash cost.
* Southeast Warden midboss after traveler bell + level 3.
* Aegis Charm reward from Warden defeat.
* Guidance and UI visibility for Warden/Aegis.
* Start screen with `はじめから` / `つづきから`.
* New Game reset clears opened chests, discoveries, bosses, clear state, equipment, charms, and inventory.
* Ending panel after elder report with `QUEST CLEAR` and `N: はじめから`.

Verification included syntax checks, `verify-game-smoke`, Warden reachability/spawn/defeat, Aegis persistence, start menu behavior, and clear state.

Remaining risk: manual tuning for Warden difficulty, Aegis strength, traveler bell timing, and ending/start screen browser interaction.

### 2026-06-06: Southwest mine and frontier camp

Started real volume expansion beyond the Chapter 1 route.

Key work:

* Southwest mine as distinct `mine` region.
* `泡吐き` / Bubbler enemy.
* Bubble projectiles slow and drain stamina.
* Bubbler contact also applies slow/stamina pressure.
* Southwest frontier camp as first remote safe base.
* Data-driven `SAFE_ZONES` and `HEAL_POINTS`.
* Camp recovery circle and `frontier` supply NPC.
* Camp props and zone/UI text.
* Mine charm / bubble ward sold at camp.
* Mine charm reduces Bubbler contact damage, bubble projectile damage, slow duration, and stamina loss.

Verification included syntax checks, smoke tests for mine region/pool, frontier NPC, safe zone, recovery circle, monster-entry blocking, supply purchase, mine charm persistence, and damage reduction.

Remaining risk: manual tuning for mine charm price/effect strength and camp placement feel.

### 2026-06-06: Real inventory implementation

Implemented `もちもの` as a core RPG system.

Key work:

* Former `強さ` command became `もちもの`.
* Inventory overlay supports item / weapon / armor / accessory categories.
* Consumables can be used and sold.
* Weapons/armor can be equipped; unequipped gear can be sold.
* Accessories are owned and one accessory can be equipped.
* Persistent state: `ownedWeapons`, `ownedArmors`, `ownedAccessories`, `equippedAccessory`.
* Save/load migrates old charm flags into owned accessories.
* Major charm effects became equipped accessory choices:
  * hunter: stamina max.
  * regen: HP regeneration.
  * trail: movement/dash.
  * aegis: fire/projectile defense.
  * mine: bubble/mine resistance.

Verification included syntax checks and smoke checks for inventory open/close, equip/sell guards, accessory switching/effects, save/load fields, and story clear flow.

Remaining risk:

* Real browser/manual QA for overlay fit and usability.
* Accessory selling design: buyback, lock rules, or duplicate sources.
* More sidegrade content is needed so inventory choices matter more.

### 2026-06-06: Documentation cleanup

Active documents were reduced to:

* `AGENTS.md`
* `GAME_DESIGN_NOTES.md`
* `IMPROVEMENT_PLAN.md`
* `DEVELOPMENT_LOG.md`

`TODO.md` and `NEXT_CODEX_TASK.md` were removed from active workflow. The current docs were rewritten to reduce overlap and clarify roles.
