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
* Current map size is `120x144`; future work should deepen the expanded world while preserving density, purpose, and reachability.
* Real `もちもの` inventory exists with item, weapon, armor, and accessory handling.
* Accessories are moving from permanent passive flags into equipment choices.
* Southwest mine + southwest frontier camp are the first concrete volume-expansion pilot.
* Southeast outpost + traveler bell + Southeast Warden + Aegis Charm make the southeast route a meaningful optional direction.
* Ash Road + Ash Hamlet + Old Tower are the first larger map-size expansion beyond the old `80x72` footprint.
* Ash Sorcerer and Old Tower Ash Knight add magic-pressure content beyond the Southeast Warden route.
* Moon Ruins extend the Old Tower route southward with Moon Shade pressure, late supplies, and moon relic rewards.
* Moon Camp + Eclipse Castle are the first Chapter 2 boss route beyond Moon Ruins.
* Eclipse Mage, eclipse gear, Eclipse Ring, and Eclipse Dragon add the first post-Red-Dragon major boss arc.
* Black Gate + Black Fort + Black Sun Castle are the first Chapter 3 route beyond Eclipse Castle.
* Void Wraith, Black Sun gear, Void Charm, and Black Sun Dragon add a harder post-Chapter-2 major boss arc.
* Black Market is now a Chapter 3 second town with recovery, selectable shop stock, guide/guards/villagers, and supplies.
* Obsidian Cave + Obsidian Crawler + Obsidian Golem add a Chapter 3 branch dungeon and midboss before the Black Sun Dragon route.
* Shops now use selectable buy menus instead of fixed-order auto-buying.
* Equipment/HUD now exposes ATK/DEF values and inventory comparison deltas.

Current high-priority risks:

* Full real-browser desktop/mobile play QA is still needed.
* Full fresh-save manual playthrough to elder report is still needed.
* Mobile UI and inventory overlay need real-browser confirmation.
* Future map expansion must avoid empty terrain and preserve reachability; the new 120x144 space needs more hand-authored content density.
* Gold/EXP/shop price balance should be checked after route expansion.

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

_Add new entries here._

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
