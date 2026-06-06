# IMPROVEMENT PLAN

## Current Priority

Expand the game from a roughly 20-minute clear route into a larger RPG while preserving survival-range expansion.

Current focus:

* Treat the current village -> Guardian -> Red Dragon route as the first chapter, not the final game size.
* Add meaningful volume: larger maps, remote towns, dungeons, varied monsters, new equipment tiers, inventory decisions, and side routes.
* Prefer content that gives the player a new place to reach, a new threat to learn, a new safe base to unlock, or a new equipment choice to make.
* Dangerous areas must become more rewarding and more populated than safe areas.
* The village must feel safe, readable, and useful.
* Equipment upgrades must visibly expand survivable range.
* Movement and combat tempo should feel fast and responsive.
* Exploration should naturally lead players farther from the village.
* Reward persistence and equipment safety.
* The player must never become weaker because of treasure reopening or save/load behavior.
* Startup flow must support both replay from level 1 and continuing an existing save.
* Build toward a real inventory where items, weapons, armor, and accessories can be inspected, equipped, and sold.
* Accessories should eventually become equipment choices rather than only permanent flags.
---

## Volume Expansion Roadmap

The game should grow through playable content, not architecture work alone.

### Map Scope

* Long-term target: at least 10x the current playable map scope.
* Short-term target: turn current unused or thin areas into named places with danger and reward.
* Mid-term target: add additional map files such as `maps/cave1.js`, `maps/tower1.js`, `maps/castle1.js`, and later remote town maps.
* Continue using human-editable fixed map data. Do not return to random terrain generation.

### Towns And Safe Bases

* Add multiple towns or frontier bases.
* Each later town should provide recovery, supplies, stronger shops, hints, or a survival-route role.
* Remote towns should make the player feel their safe range has moved outward.

### Enemy Variety

* Add enemies with behavior differences, not only new colors or stats.
* Prioritize bubble/projectile enemies, magic enemies, poison/slow/status enemies, territorial enemies, summoners, and enemies with area-specific counterplay.
* Each new region should introduce at least one enemy behavior that changes how the player approaches contact combat.

### Inventory And Equipment

* Add a real `もちもの` menu.
* Let the player inspect consumables, weapons, armor, and accessories.
* Let the player choose weapon/armor/accessory equipment when sidegrades exist.
* Let unwanted gear be sold for gold.
* Convert current permanent charm flags into equipable accessories in a later focused pass.

### First Implementation Direction

* Use the current southwest mine/outpost work as a pilot for bigger-volume content.
* Make the mine a distinct dangerous region with its own monster behavior and reward.
* Then add a second safe base or remote shop so the map expansion creates a new survival anchor.

## Replanning Snapshot - 2026-06-05

Current diagnosis:

* The technical foundation is much healthier than before: gameplay systems are split into `src/data`, `src/core`, and `src/systems`, and the world is now a fixed hand-editable map in `src/data/maps/world.js`.
* Automated VM smoke coverage is useful and repeatable, especially for script order, fixed-map reachability, save/load, one-time rewards, equipment anti-downgrade, Guardian, Red Dragon, and elder report.
* The biggest remaining risk is not another missing subsystem. It is whether the game feels good in a real browser from a fresh save: movement, UI fit, player sprite readability, village relief, gold/EXP pace, enemy pressure, and the final route.
* The biggest design opportunity is turning the new fixed east/southeast map space into a memorable survival-range route instead of empty expansion terrain.

Next development order:

1. **Real Browser QA Checkpoint**
   Verify startup, rendering, input, sprite frames, UI fit, save/load, village safety, and full route flow in desktop and mobile-like viewports. Fix regressions before adding content.

2. **Survival Route Content Pass**
   Use the fixed map to create a clearer 20-30 minute route: village outskirts -> grassland gear farming -> north/river pressure -> east/southeast optional reward -> Guardian -> cave -> dragon -> elder report.

3. **Survival-Range Reward Pass**
   Current status: first pass implemented with the southeast outpost traveler bell. Continue tuning whether this reward makes distant travel feel better without trivializing danger.

4. **Readable Command/UI Pass**
   Improve how the player checks equipment, items, regeneration, boss requirements, and current objective. Keep the old mobile RPG feel; prioritize readable decisions over decoration.

5. **Polish After Loop Validation**
   Player art, audio, ending text, extra enemies, and extra quests should follow only after the survival route feels coherent.

Planning constraints:

* Do not reintroduce random or noise-based terrain generation.
* Terrain edits belong in `src/data/maps/world.js`; regenerate `docs/world-map-preview.png` / `.svg` after map edits.
* Use `WORLD_OBJECTS` for future map object migration where practical, but do not start a broad data migration unless it directly helps gameplay or editing.
* Do not split architecture further just for tidiness. Verification and gameplay feel now matter more than file-count changes.



## Current Refactor Handoff Status

The behavior-neutral `src/game.js` extraction pass is now considered structurally complete for this phase.

Current architecture:

```text
src/data/
  definitions.js  Static constants, tiles, equipment data, monster definitions, treasure/discovery definitions.
  maps/world.js   Human-editable fixed world map rows and map object placements.

src/core/
  math.js         Pure math/geometry helpers.
  state.js        Initial state/player factory.
  context.js      Context factory that wires state/player/helpers into each system.

src/systems/
  map.js          Map data loading, validation, tile access, town/gate/collision helpers.
  spawn.js        Region selection, monster spawning, regional replenishment, Guardian spawn story events.
  monsters.js     Enemy AI, contact combat, contact status effects, monster defeat, level-up side effects.
  combat.js       Player combat/stat calculations and equipment multipliers.
  player.js       Player movement, dash, town gate, heal circle, discovery spring updates.
  actions.js      Context action, attack action, chest opening, gathering, hidden discovery reveal.
  rewards.js      Chest/discovery/monster reward grants, item use, equipment anti-downgrade helpers.
  projectiles.js  Enemy projectile firing, movement, collision, damage/status application.
  npc.js          NPC interaction, cave entry, dragon challenge requirement checks.
  save.js         localStorage save/load/reset using SAVE_KEY.
  effects.js      Floaters, slashes, rings, particles, toast expiry.
  text.js         Objective/guidance/context prompt/stage text.
  render.js       Canvas drawing only.
  ui.js           DOM status updates and strength/info panel data.
  controls.js     Keyboard/touch/button event binding.

src/game.js       Entrypoint/司令塔: DOM binding, helper lookup, state/player creation, facades, loop, init.
```


Current refactor guidance:

* Do not split more files merely to reduce `src/game.js` line count.
* Do not start ES Modules, Vite, bundling, or import/export migration in the next pass.
* The next priority is verification and regression repair, not new architecture.
* Gameplay content changes should wait until the refactored structure has passed browser QA and a full manual playthrough.
* Player art now supports one-file-per-frame replacement through `assets/player/<direction>_<pose>.png`, so future character design iteration can focus on one 32x32 frame at a time.

Expected `index.html` script order:

```html
<script src="src/data/definitions.js"></script>
<script src="src/data/maps/world.js"></script>
<script src="src/core/math.js"></script>
<script src="src/core/state.js"></script>
<script src="src/core/context.js"></script>

<script src="src/systems/combat.js"></script>
<script src="src/systems/player.js"></script>
<script src="src/systems/map.js"></script>
<script src="src/systems/rewards.js"></script>
<script src="src/systems/save.js"></script>
<script src="src/systems/effects.js"></script>
<script src="src/systems/text.js"></script>
<script src="src/systems/spawn.js"></script>
<script src="src/systems/npc.js"></script>
<script src="src/systems/actions.js"></script>
<script src="src/systems/projectiles.js"></script>
<script src="src/systems/monsters.js"></script>
<script src="src/systems/render.js"></script>
<script src="src/systems/ui.js"></script>
<script src="src/systems/controls.js"></script>
<script src="src/data/audio.js"></script>
<script src="src/game.js"></script>
```


## Recent Cycle Notes

### Cycle 1

Equipment felt too numeric.

Implemented:

* Weapon/armor traits tied to facing bonuses.
* Guarding and movement traits.
* Fire resistance effects.

### Cycle 2

Exploration felt too shallow.

Implemented:

* Hidden spring.
* Ore discovery.
* Hunter cache.

### Cycle 3

Boss encounters lacked distinction.

Implemented:

* Dragon enrage phase.
* Spread fire attack.
* Dragon summons.

### Survival Range Pass Cycle 1

Problem:

* Early enemies were not dangerous enough.
* Armor purchases did not feel meaningful.

Implemented:

* Increased early enemy threat.
* Increased armor impact.
* Created clearer damage reduction milestones.

### Survival Range Pass Cycle 2

Problem:

* Shop equipment value was unclear.

Implemented:

* Reduced early equipment prices.
* Encouraged early armor purchases.
* Exposed equipment traits through UI messaging.

### Survival Range Pass Cycle 3

Problem:

* Mid-game exploration lacked sustainable progression.

Implemented:

* Added Regeneration Ring.
* Added shrine reward source.
* Disabled regeneration while burning.
* Added save support.

### Survival Range Expansion QA Cycle 4

Problem:

* Distant areas were under-populated, weakening the feeling that the player's survivable range had expanded into more valuable danger.

Implemented:

* Added region-specific enemy pools for grassland, North Forest, East Forest/River, and Dragon Cave.
* Added local regional replenishment so dangerous areas maintain nearby enemy pressure.
* Tuned spawn intervals and caps by danger level.

### Survival Range Expansion QA Cycle 5

Problem:

* The village safety rule was undermined by enemy projectiles and a weak boundary read.

Implemented:

* Blocked enemy projectiles from entering the village while gates are closed.
* Allowed danger through open gate tiles only.
* Improved the village boundary visual from weak fence to stone-wall safe-base treatment.
* Added role markers for elder, smith, healer, recovery point, and gates.

### Survival Range Expansion QA Cycle 6

Problem:

* Some exploration rewards could become difficult to trust if map generation placed them on blocked tiles, and the game tempo still felt a little slow.

Implemented:

* Carved small walkable clearings around static treasure, discoveries, and the Guardian site.
* Increased player movement speed, dash distance, and stamina recovery.
* Expanded the strength command into equipment, survival, and inventory/progression pages.

### Survival Range Expansion QA Cycle 7

Problem:

* The rotating strength messages improved visibility but were still easy to miss and too cramped for equipment and inventory review.

Implemented:

* Added a short-lived in-game info panel for the strength command.
* The panel cycles through equipment, survival stats, and inventory/progression pages.
* Verified panel page cycling with VM simulation.

### Survival Range Expansion QA Cycle 8

Problem:

* Whole-map single-position checks passed, but a real-play scenario could still starve distant spawns: old monsters near the village filled the global monster cap after the player moved far away.

Implemented:

* Added local monster pruning when the player has too few nearby enemies.
* Preserved bosses and midbosses while allowing stale ordinary monsters to be replaced by regional threats near the player.
* Added a `wilds` region for far non-north/non-east areas so distant grassland-like map areas gain mid-danger enemies.
* Prevented late-game dragonlings from appearing in village-adjacent grassland pools.

Verified:

* Whole-map sampled spawn pass with old village enemies pre-filled: 134 passable non-town points, 0 spawn holes.
* Region pools now preserve the intended curve: grassland remains slime/bat/boar, while Wilds/North/East/Cave can carry stronger enemies.

### Southeast Route Content Pass

Problem:

* The southeast expansion had a valuable movement reward, but it still needed a concrete challenge and follow-up reward so the area felt like a destination rather than a lone chest.

Implemented:

* Added the `Southeast Warden` midboss at the southeast outpost route.
* The Warden appears only after the player has the traveler bell and reaches level 3, keeping it as a mid-game optional challenge rather than an early trap.
* Added the Aegis Charm reward, which reduces fire and projectile damage and helps later survival against wisps, the Guardian-style projectile pressure, and the Red Dragon.
* Added guidance text and info-panel visibility for the new route reward.

Verified:

* VM smoke now covers Warden reachability, Warden spawn/defeat, Aegis Charm persistence, and confirms Warden defeat does not accidentally count as Guardian defeat.

### Start Flow Pass

Problem:

* The game always loaded the existing save on startup. After clearing the game, the player could not easily replay from level 1 without manually clearing browser storage.

Implemented:

* Added a start screen with `はじめから` and `つづきから`.
* Continue is disabled when no save data exists.
* Startup no longer begins the main loop until the player chooses a start option.
* New Game clears the save and resets opened chests, discoveries, boss flags, clear flags, equipment, charms, and inventory.

Verified:

* VM smoke passes after the new startup flow.
* `resetGame` now clears opened chest state as well as discovered hidden rewards.

### Ending Report Pass

Problem:

* After defeating the Red Dragon and reporting to the elder, the final clear state existed but felt too abrupt.
* Replay was available from the start screen after reload, but the clear screen itself did not clearly tell the player how to begin again.

Implemented:

* Replaced the final elder-reported overlay with a small ending panel that states the dragon was sealed and the village is safe.
* Added `N: はじめから` guidance on the clear screen.
* Added `N` key support after elder report to reset to a fresh New Game state, including save removal and one-time reward reset.

Verified:

* Syntax checks pass for all JavaScript files under `src/` and `scripts/`.
* VM smoke still verifies map reachability, one-time reward persistence, equipment anti-downgrade, start menu behavior, Warden, Guardian, Red Dragon defeat, and elder report clear state.
* `git diff --check` passed with line-ending warnings only.

### Volume Expansion Pass: Southwest Mine

Problem:

* The game is currently closer to a 20-minute first route than a full RPG.
* Existing southwest mine terrain and cache work needed enemy identity so the area would not be only a distant treasure pickup.

Implemented:

* Added a `mine` region for the southwest mine area.
* Added the `泡吐き` monster.
* `泡吐き` fires bubble projectiles that slow the player and reduce stamina.
* Contact with `泡吐き` also applies slow/stamina pressure.
* Added distinct renderer support for the bubble enemy.

Expected design value:

* Starts the broader volume expansion direction with a named optional area.
* Adds a new enemy behavior family for future caves/mines/towers.
* Makes the southwest mine a different survival problem from forest fire pressure or dragon cave pressure.

### Playtest Improvement Pass Cycle 9

Problem:

* After spawn fixes, the next biggest non-spawn weaknesses were village safety clarity, moment-to-moment guidance, and combat tempo.

Implemented:

* Gates now close while the player is inside town, making retreating into the village feel safer.
* The objective display now has a second guidance line for healing, buying the next upgrade, retreating at low HP, and pushing toward the next danger area.
* Added contextual action prompts for nearby NPCs, treasure, hidden discoveries, cave entry, and gathering.
* Shortened attack cooldown, dash cooldown, and contact interval slightly to improve action-RPG tempo without changing the contact-combat core.

Verified:

* VM checks pass for inside-town gate closure, outside gate opening, projectile blocking, monster gate rules, guidance text, action prompts, reward reachability, info panels, tempo constants, clear flow, and save/load persistence.

### Playtest Improvement Pass Cycle 10

Problem:

* One-time treasure and hidden discovery rewards could undermine survival-range progression if they were reacquired after save/load.
* Equipment rewards needed a hard guard against replacing stronger current gear with weaker or equal gear.

Implemented:

* Sanitized loaded chest and discovery IDs against known reward definitions.
* Added duplicate guards to hidden discovery reveals so a discovered reward cannot pay out again even if called directly.
* Added weapon and armor reward helpers that only upgrade when the reward is stronger than the current gear.
* Kept rank-based equipment progression instead of adding a larger inventory, because the immediate player-facing risk was reward regression rather than equipment choice depth.

Verified:

* VM checks pass for chest save/reload persistence, hidden discovery save/reload persistence, duplicate reward prevention, weaker equipment reward prevention, and equipment save/load preservation.

### Refactor Preparation Pass Cycle 11

Problem:

* `src/game.js` has grown to about 3180 lines and combines static data, state, map logic, spawning, player update, enemy AI, contact combat, rewards, save/load, UI, drawing, input, and the main loop.
* Splitting behavior hubs too early would risk regressions in survival range expansion, village safety, one-time rewards, and the dragon clear flow.

Implemented:

* Created `REFACTOR_PLAN.md` with a responsibility map, low-risk split targets, high-risk targets, recommended split order, and required VM behavior checks.
* Created `docs/REFACTOR_CHECKLIST.md` for future extraction passes.
* Chose static definitions and pure helpers as the first safe extraction path.
* Deferred all high-coupling behavior splits, including player update, enemy AI, combat, boss flow, save/load, NPCs, draw orchestration, input binding, and the main loop.

Verified:

* No gameplay code was intentionally split in this pass.
* Bundled Node syntax check, `git diff --check`, and VM smoke checks passed before commit.

### Refactor Extraction Pass Cycle 12

Problem:

* `src/game.js` still contained all static definitions, making routine balance/data edits require opening the largest file in the project.

Implemented:

* Extracted static definitions to `src/data/definitions.js`: screen/map constants, save key, town gates, treasure, discoveries, boss requirements, regions, tile/direction constants, tempo constants, equipment data, item order, and monster definitions.
* Loaded `src/data/definitions.js` before `src/game.js` in `index.html`.
* Kept the app as non-module scripts using `globalThis.DRAGON_HUNTER_DEFINITIONS` so local direct browser loading remains viable.
* Left all behavior hubs in `src/game.js`: player update, enemy AI, combat, save/load, NPCs, boss flow, drawing orchestration, input, loop, and init.

Verified:

* Bundled Node syntax checks passed for `src/data/definitions.js` and `src/game.js`.
* `git diff --check` passed.
* VM smoke checks passed for definitions loading, static reward reachability, region spawn pools, chest/discovery persistence, equipment anti-downgrade behavior, and dragon challenge gating.

### Refactor Extraction Pass Cycle 13

Problem:

* `src/game.js` still contained low-risk pure math and geometry helpers, forcing simple helper edits through the main gameplay file.

Implemented:

* Extracted deterministic pure helpers to `src/core/math.js`: `clamp`, `hashNoise`, `rectsOverlap`, `centerOf`, `normalize`, `facingDot`, `directionFromVector`, and `makeRect`.
* Loaded `src/core/math.js` after `src/data/definitions.js` and before `src/game.js`.
* Kept `rand` and `irand` in `src/game.js` to avoid changing random/spawn behavior in this pass.
* Left all behavior hubs in `src/game.js`: player update, enemy AI, combat, save/load, NPCs, boss flow, drawing orchestration, input, loop, and init.

Verified:

* Bundled Node syntax checks passed for `src/core/math.js`, `src/data/definitions.js`, and `src/game.js`.
* `git diff --check` passed.
* VM smoke checks passed for math helper loading, helper behavior, static reward reachability, region spawn pools, chest/discovery persistence, equipment anti-downgrade behavior, and dragon challenge gating.

---

## Critical Issues Discovered During Real Playtesting

### Enemy Population

Previous problem:

* Enemy density and placement are incorrect.
* Distant areas may contain few or no enemies.

Required outcome:

* Village outskirts contain weak enemies.
* North Forest contains stronger enemies.
* East Forest/River contains distinct enemy pressure.
* Dragon Cave contains dangerous late-game enemies.

This is currently the highest gameplay priority.

Current status:

* Addressed with region-aware spawn pools and regional replenishment.
* VM verification confirms enemies spawn in grassland, Wilds, North Forest, East Forest/River, and Dragon Cave.
* VM verification confirms stale old enemies no longer prevent distant local replenishment.

### Village Safety

Previous problem:

* Enemy projectiles can reach the village.

Required outcome:

* Village functions as a true safe zone.
* Enemy projectiles should not threaten players inside the village.
* Walls and gates should clearly separate safety from danger.

Current status:

* Addressed with projectile town-entry blocking and verified gate rules for monsters.
* Improved further: gates close when the player is inside town, so retreating back through a gate restores safety more reliably.
* Browser visual QA is still pending.

### Village Readability

Previous problem:

* Shops and NPC roles are difficult to identify visually.

Required outcome:

Players should immediately recognize:

* Elder
* Smith
* Healer / Item Seller
* Gate
* Recovery Point

through layout, props, signs, and environment design.

Current status:

* Partially addressed with role markers, a stronger wall visual, and contextual prompts for nearby interactions.
* A fuller layout pass can follow after full-playthrough balance.

### Game Tempo

Previous problem:

* Movement and combat pacing feel too slow.

Required outcome:

* Faster movement.
* Faster traversal.
* Faster combat resolution.
* Responsive action-RPG feel.

Danger should come from enemy damage and positioning, not slow movement.

Current status:

* Partially addressed with faster movement, dash distance, stamina recovery, shorter attack cooldown, shorter dash cooldown, and shorter contact interval.
* Manual feel testing remains required.

### Menu and Inventory Visibility

Previous problem:

* Players cannot easily review equipment or inventory.

Required outcome:

* Clear item list.
* Clear equipment list.
* Equipment effect visibility.
* Progress item visibility.
* Better player understanding of growth.

Current status:

* Addressed for current scope with an in-game info panel that shows equipment, survival stats, and inventory/progression items.
* A full interactive menu can be considered later if item-use depth grows.

---

## Next High-Impact Improvements

### Survival Range Expansion

* Verify that stronger equipment visibly reduces damage from previously dangerous enemies.
* Add one dangerous area that later becomes safe through progression.
* Continue tuning armor progression.
* Continue tuning regeneration progression.

### Exploration

* Map terrain is now fixed rather than pseudo-random, with a hand-editable 80x72 layout in `src/data/maps/world.js`.
* `src/systems/map.js` should stay as a loader/validator/collision helper; terrain edits belong in the map data file.
* `WORLD_OBJECTS` in `src/data/maps/world.js` is the first step toward separating NPCs, future bosses, treasure, and landmarks from terrain tiles.
* `docs/MAP_EDITING.md` documents the map editing workflow.
* `docs/world-map-preview.png` and `docs/world-map-preview.svg` provide whole-map previews for quick visual checks after edits.
* Prefer improving the fixed east/southeast expansion with deliberate rewards, shortcuts, or danger gradients instead of reintroducing random terrain generation.
* Current implementation: `south-outpost` chest in the southeast expansion grants the traveler bell, improving movement, stamina, stamina recovery, and dash cost.
* Current implementation: the southeast Warden adds an optional mid-game fight after obtaining the traveler bell, and grants the Aegis Charm for fire/projectile resistance.
* Add additional exploration rewards that increase survivability.
* Add more events to East Forest and River areas.
* Improve hidden discovery placement.
* Ensure exploration rewards never spawn in unreachable locations.

### Village and Readability

* Improve village visual readability.
* Add signs and role-specific props.
* Improve recovery-point visibility.
* Improve shop visibility.
* Improve gate visibility.

### Tempo

* Increase movement speed where appropriate.
* Improve combat responsiveness.
* Reduce unnecessary downtime.

### Menu and Equipment UX

* Add item review screen.
* Add equipment review screen.
* Improve equipment comparison.
* Improve visibility of survival-related stats.

### Player Character Art

* Current player source strip: `assets/player.png` at 256x32.
* Split frame output: `assets/player/down_idle.png`, `down_walk.png`, `left_idle.png`, `left_walk.png`, `right_idle.png`, `right_walk.png`, `up_idle.png`, and `up_walk.png`.
* Each frame is 32x32 and matches the primary render loader paths in `src/systems/render.js`.
* Future sprite improvements should replace individual frame PNGs instead of requiring a perfect 8-frame strip.

### Refactoring

* Current major behavior-neutral extraction phase is complete for this pass.
* `src/game.js` should now be treated as the entrypoint/司令塔: DOM binding, helper lookup, state/player creation, thin facades, loop, and init.
* Refactored files now live under `src/data`, `src/core`, and `src/systems`.
* Next refactor priority is not more splitting; it is verification, documentation, and minimal regression repair.
* Avoid ES Modules, bundlers, or import/export migration until browser QA and a full manual playthrough pass.

### Ending

Current status:

* Implemented a final clear overlay after elder report.
* Implemented clear-screen `N` replay guidance and input.

Remaining:

* Real browser/manual QA should verify the ending overlay and direct clear-screen New Game behavior.
* A future content pass may add a richer optional epilogue only after the full route balance feels good.

---

## Verification Notes

Current automated verification:

* node --check src/game.js passes.
* Progression simulation passes.
* Save/load simulation passes.
* Equipment progression simulation passes.
* Regeneration simulation passes.
* Region spawn simulation passes for grassland, North Forest, East Forest/River, and Dragon Cave.
* Whole-map stale-cap spawn simulation passes for 134 passable non-town sample points with 0 holes.
* Reward reachability simulation passes for all static treasure, discoveries, and Guardian site.
* Village projectile safety simulation passes for closed-gate blocking.
* Monster gate simulation passes: closed gates block, open gates allow gate entry, walls still block.
* Gate safety simulation passes: standing inside town lets gates close, standing outside near a gate opens them.
* Guidance and context prompt simulation passes for town safety, next upgrade, retreat warning, smith, chest, and discovery prompts.
* Strength command info-panel cycling simulation passes for equipment, survival, and inventory pages.
* Dragon spawn, defeat, elder report, save/load persistence smoke test passes.
* Balance spot-check supports the intended power reversal: leather sharply reduces early slime damage and chain armor can make weak enemies nearly harmless.
* Script-order VM smoke passes for all 22 `index.html` scripts, including `src/data/maps/world.js` and `src/data/audio.js`.
* Save/load VM smoke passes for opened chests, discoveries, equipment, charms, boss flags, elder report state, and weak-equipment anti-downgrade guards.
* Start-screen VM script-load smoke passes; game initialization renders the initial screen and waits for New Game / Continue selection.
* Ending VM flow reaches `elderReported`; the clear overlay and direct `N` replay path still need real browser/manual visual confirmation.
* Fixed map preview exists at `docs/world-map-preview.png` / `docs/world-map-preview.svg` and was visually inspected for the village, North Forest, river, dragon cave, and east/southeast expansion.
* `scripts/verify-game-smoke.js` now provides repeatable VM verification for script order, map reachability, save/load, equipment anti-downgrade, Guardian, Red Dragon, and elder report flow.
* `scripts/generate-map-preview.ps1` regenerates both PNG and SVG fixed-map previews.

Still required:

* Desktop browser QA.
* Mobile browser QA.
* Full manual playthrough.
* Manual verification of movement and combat tempo.
* Manual verification of inventory and equipment panel usability.
* Manual verification that local monster pruning feels natural during long-distance travel.
* Manual verification that objective guidance/context prompts fit the small screen visually.
