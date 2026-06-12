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
* Current map size is `120x96`; future work should deepen the expanded world while preserving density, purpose, and reachability.
* Real `もちもの` inventory exists with item, weapon, armor, and accessory handling.
* Accessories are moving from permanent passive flags into equipment choices.
* Southwest mine + southwest frontier camp are the first concrete volume-expansion pilot.
* Southeast outpost + traveler bell + Southeast Warden + Aegis Charm make the southeast route a meaningful optional direction.
* Ash Road + Ash Hamlet + Old Tower are the first larger map-size expansion beyond the old `80x72` footprint.
* Ash Sorcerer and Old Tower Ash Knight add magic-pressure content beyond the Southeast Warden route.
* Equipment/HUD now exposes ATK/DEF values and inventory comparison deltas.

Current high-priority risks:

* Full real-browser desktop/mobile play QA is still needed.
* Full fresh-save manual playthrough to elder report is still needed.
* Mobile UI and inventory overlay need real-browser confirmation.
* Future map expansion must avoid empty terrain and preserve reachability; the new 120x96 space needs more hand-authored content density.
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
