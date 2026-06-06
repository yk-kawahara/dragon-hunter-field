# TODO

## Current Replan - Next Work Order

This is the recommended order for the next development passes. Do not treat the older TODO sections as a strict top-to-bottom checklist.

### Critical

* Run interactive desktop browser QA and confirm keyboard movement, action/context input, combat, save/load UI, and full route flow.
* Fix mobile layout overflow found in Edge rendering QA: portrait clips the right side of the play/action area, and landscape still requires vertical scrolling to reach touch controls.
* Perform a fresh-save manual route test: village -> outskirts gear farming -> North Forest/river -> Guardian -> dragon cave -> Red Dragon -> elder report.
* Verify that the fixed 80x72 map feels navigable in motion, especially village gates, North Forest access, river/east access, dragon cave access, and east/southeast expansion.

### High

* Tune the new southeast outpost traveler bell through manual playtesting: it should make long-distance exploration feel better without making dangerous areas safe too early.
* Add one more meaningful route reason in the east/southeast area only if the traveler bell alone does not make the expansion feel like a destination.
* Balance gold/EXP/shop prices so the first armor purchase, level 4 timing, Guardian readiness, and dragon readiness feel natural in a normal playthrough.
* Improve equipment/item review only where it helps decisions: current gear, next upgrade value, regeneration, boss requirements, and progression items.
* Add a short elder ending/report sequence after the survival route is verified.

### Medium / Deferred

* Add equipment inventory only if future rewards introduce sidegrade choices rather than simple rank upgrades.
* Add more enemies, quests, or bosses only after browser QA and the core survival route feel good.
* Continue player art polish one frame at a time under `assets/player/`, but do not let sprite polish outrank route/balance fixes.
* Move more map objects into `WORLD_OBJECTS` only when it directly improves hand editing or reduces placement bugs.

## Done This Pass

* Fixed a concise progression plan.
* Added design and improvement docs.
* Added `AGENTS.md` and aligned future development around survival range expansion rather than quest checklist progression.
* Added a midboss gate and final boss requirements.
* Expanded save/load progression fields.
* Improved objective and hint flow.
* Added the North Forest Guardian as a midboss.
* Added seal crest and stricter dragon cave requirements.
* Added victory reporting flow after the dragon is defeated.
* Added weapon and armor traits that affect contact/facing combat.
* Added persistent hidden discoveries: field spring, ore, hunter cache.
* Added slime slow, bat stamina drain, fire burn, and dragon enrage phase.
* Made HP regeneration intentionally weak at first, then stronger only when combined with late-game defense or rare equipment.
* Added one mid-game treasure or exploration reward that extends exploration range rather than only giving gold.
* Tuned early contact damage and first armor purchase so the player feels safer after buying gear.
* Showed equipment traits and regeneration rate through the strength command.
* Added region-aware enemy spawn pools and local replenishment so north, east, and cave areas are no longer empty.
* Blocked enemy projectiles from entering the village while gates are closed, and limited open-gate projectile entry to gate tiles.
* Verified monster gate rules: closed gates block entry, open gates allow gate entry, and walls still block entry.
* Reworked the village boundary into a stronger stone-wall visual and added role markers for elder, smith, healer, recovery point, and gates.
* Carved walkable clearings around static treasure, discoveries, and the Guardian site; VM verification confirms all are passable.
* Increased player movement speed, dash distance, and stamina recovery to improve old mobile action-RPG tempo.
* Expanded the strength command into rotating equipment, survival, and inventory/progression readouts.
* Upgraded the strength command from toast-only text to a short-lived in-game info panel for equipment, survival stats, and inventory/progression review.
* Fixed a remaining spawn starvation case where old monsters near the village could fill the global cap and prevent enemies from appearing after the player moved far away.
* Added a `wilds` region for far non-north/non-east areas so distant grassland-like map areas are not treated like safe village outskirts.
* Tightened grassland enemy pools so village-adjacent areas stay weak even after the player reaches late game.
* Verified a whole-map sampled spawn pass with pre-filled old enemies: 134 passable non-town sample points, 0 spawn holes.
* Made village gates close while the player is inside town, so returning to town more reliably restores safety.
* Added a second objective line that gives survival-range guidance such as healing, buying the next equipment upgrade, retreating at low HP, or pushing toward the next danger area.
* Added contextual action prompts for NPCs, treasure, discoveries, cave entry, and gathering spots.
* Improved combat tempo with shorter attack, dash, and contact intervals without changing the contact-combat identity.
* Hardened one-time treasure and hidden discovery persistence across save/load.
* Added direct re-entry guards so already opened chests and already revealed discoveries cannot grant rewards again.
* Added equipment reward safety helpers so weaker or equal equipment rewards never downgrade the current weapon or armor.
* Verified treasure persistence, hidden reward persistence, equipment anti-downgrade behavior, and save/load preservation with VM smoke tests.
* Created `REFACTOR_PLAN.md` to classify `src/game.js` responsibilities and define a safe split order.
* Created `docs/REFACTOR_CHECKLIST.md` for future behavior-neutral extraction passes.
* Identified static data and pure helpers as the first low-risk refactor targets.
* Explicitly marked player update, enemy AI, combat, save/load, NPC behavior, draw orchestration, input, and boss flow as high-risk targets to avoid in the first split.
* Extracted static gameplay definitions into `src/data/definitions.js`.
* Kept `index.html` as non-module scripts by loading definitions before `src/game.js`, preserving direct local browser compatibility.
* Left behavior hubs in `src/game.js`; no player, enemy AI, combat, save/load, NPC, boss, draw orchestration, input, loop, or init logic was split.
* Extracted pure math and geometry helpers into `src/core/math.js`.
* Kept `rand` and `irand` in `src/game.js` to avoid changing random/spawn behavior during this pass.
* Recognized the user-led hand refactor that split gameplay behavior into `src/core`, `src/data`, and `src/systems`.
* Recognized new audio/player asset work, including `assets/audio/field.ogg`, `src/data/audio.js`, and `assets/player.png`.
* Split `assets/player.png` into eight independent 32x32 player frames under `assets/player/`.
* Confirmed the generated frame names match the current render loader: `down_idle`, `down_walk`, `left_idle`, `left_walk`, `right_idle`, `right_walk`, `up_idle`, and `up_walk`.
* Moved terrain data into `src/data/maps/world.js` so the world can be edited directly by hand.
* Added `WORLD_OBJECTS` in `src/data/maps/world.js` for NPC placement separate from terrain.
* Added `docs/MAP_EDITING.md` and generated `docs/world-map-preview.png` / `docs/world-map-preview.svg` for fixed-map editing support.
* Updated script-order documentation to include `src/data/maps/world.js` and `src/data/audio.js`.
* Verified `index.html` script order with a VM DOM/canvas/audio smoke test.
* Verified save/load persistence for chests, discoveries, equipment, charms, boss flags, and elder report state with a VM smoke test.
* Added `scripts/verify-game-smoke.js` for repeatable VM checks covering script order, map reachability, save/load, equipment anti-downgrade, Guardian, Red Dragon, and elder report flow.
* Added `scripts/generate-map-preview.js` and `scripts/generate-map-preview.ps1` for regenerating fixed-map previews after terrain edits.
* Added the southeast outpost `south-outpost` chest.
* Added the traveler bell survival reward, which improves movement speed, stamina capacity, stamina regeneration, and dash cost.
* Added save/load persistence and VM smoke verification for the traveler bell.
* Improved mobile browser layout so small portrait uses a stronger single-column layout and small landscape keeps touch controls available near the bottom.

## Critical Playtest Issues - Addressed This Pass

* Fix treasure chest persistence.

  * Save data already included opened chest IDs; this pass sanitizes loaded IDs and verifies reopened chests cannot pay out again after reload.
* Fix exploration reward persistence.

  * Save data already included discovered hidden reward IDs; this pass adds a direct duplicate guard and verifies hidden rewards cannot pay out again after reload.
* Prevent automatic equipment downgrade.

  * Treasure and discovery equipment rewards now go through `grantWeaponAtLeast` / `grantArmorAtLeast`, preserving stronger current gear and showing a better-gear message.
* Design equipment inventory system.

  * Deferred for now. The current game has rank-based weapon/armor progression rather than multiple equippable copies, so anti-downgrade protection is the higher-value fix.

* Fix enemy spawning outside the village-adjacent areas.

  * Implemented region-aware spawn pools and regional replenishment around the player.
  * Verified grassland, North Forest, East Forest/River, and Dragon Cave all spawn region-appropriate enemies.
  * Added local monster pruning so old off-screen enemies cannot block new regional spawns.
  * Added the Wilds region for far areas that were previously classified as grassland.
* Prevent enemy projectiles and magic from threatening the player inside the village.

  * Implemented projectile town-entry blocking.
  * Closed gates block projectiles from entering the village.
  * Open gates allow danger through gate tiles only.
* Improve the village boundary from a weak fence feeling to a stronger wall/safe-base feeling.

  * Replaced the weak fence visual with a stronger stone-wall treatment.
  * Added gate markers so the player can read whether danger is entering through an open gate.
* Fix invalid item or reward placement.

  * Static treasure, discoveries, and Guardian site now carve local walkable clearings.
  * VM verification confirms all static reward sites are reachable.
* Verify the full enemy spawn system by area.

  * Grassland: verified early enemies.
  * Wilds: verified mixed mid-danger enemies away from the village.
  * North Forest: verified stronger enemies.
  * East Forest/River: verified ranged/late enemy pressure.
  * Dragon Cave: verified late enemies.

## Remaining High Priority

* Run interactive desktop and mobile browser play QA when browser automation is available.
* Perform a full manual playthrough from new save to red dragon clear and elder report.
* Real-browser verify save/load UI behavior after opened chests, discoveries, equipment upgrades, boss defeat, and elder report.
* Continue balance testing for whether gold, EXP, medicines, and shop prices make the first armor purchase and level 4 timing feel natural.
* Manually verify whether the new local monster pruning feels natural during long-distance travel.
* Manually verify that the new objective guidance and context prompts do not clutter the small mobile-style screen.
* Consider a simple equipment inventory only if future rewards introduce multiple sidegrade items instead of rank upgrades.

## Next Priority: Survival Range Expansion

* Rebalance the full playthrough around the loop: fight near base, return to heal, buy equipment, survive farther, repeat.
* Tune early enemies so their contact damage feels dangerous near the start, while later equipment visibly reduces that threat.
* Add clear shop equipment progression for the early game:

  * Affordable first upgrade.
  * Meaningful mid upgrade.
  * Expensive strong upgrade.
* Improve shop or equipment UI so players can understand how new gear reduces damage or changes survival range.
* Add at least one enemy or area that is initially dangerous but becomes safe after equipment upgrades.
* Add a weak HP regeneration source in the mid game, such as a ring, armor trait, shrine blessing, or rare equipment.
* Add one mid-game treasure or exploration reward that extends exploration range rather than only giving gold.
* Make the village feel like a true safe recovery point, not merely a quest hub.

## Game Tempo and Controls

* Increase overall game tempo slightly.

  * Current issue: movement and combat feel too slow or too relaxed.
  * The game should feel more like a quick old mobile action RPG.
* Tune player movement speed so travel between village, field, and danger zones feels snappy.
* Tune combat/contact pacing so enemies can be defeated quickly once the player is stronger.
* Avoid making the game feel like a slow walking simulator.
* Preserve danger through damage and enemy placement, not through sluggish movement.
* Current state: movement was already faster; this pass also shortened attack cooldown, dash cooldown, and contact interval slightly.

## Village Readability and Function

* Make the village roles readable at a glance.

  * The player should quickly identify where to heal, buy gear, restock, and get guidance.
* Add or improve signs, shop markers, counters, role-specific props, or building layouts.

  * Smith: forge, anvil, weapon rack, or clear sign.
  * Healer / item seller: bottles, herbs, shelves, or clear sign.
  * Elder / objective source: distinct interior, desk, or marker.
  * Gate: visually clear exit to danger.
* Improve the feeling of relief when returning to the village from dangerous areas.
* Keep ordinary monsters out of the village unless it is a meaningful crisis event.
* Current state: returning inside town closes the gate after its short hold, role markers identify key services, and context prompts identify nearby NPCs/facilities.

## Menu, Items, and Equipment UI

* Current state: the strength command opens a temporary info panel with equipment, survival, and inventory/progression pages.
* Future improvement: expand this into an interactive command screen if the game needs deeper item use or comparisons.
* Allow the player to view current items clearly:

  * Medicine.
  * Fire bottles.
  * Wards.
  * Dragon scales or current progression items.
  * Regeneration charm / ring or other key equipment.
* Allow the player to understand equipment effects:

  * Current weapon.
  * Current armor.
  * Damage reduction.
  * Contact/facing traits.
  * HP regeneration rate.
  * Stamina or movement effects.
* Consider allowing item use through the item menu rather than only through quick buttons.
* Add equipment comparison if the command UI expands.

## Character Art Assets

* Current state: the player renderer first looks for independent files in `assets/player/<direction>_<pose>.png`.
* `assets/player.png` remains available as the 256x32 legacy strip fallback.
* The eight split player frames exist in `assets/player/` and are each 32x32.
* Future character sprite updates can replace one frame at a time instead of regenerating the full 8-frame strip.

## Gameplay and Balance

* Browser visual test on desktop and mobile viewport.
* Regenerate `docs/world-map-preview.png` after future terrain edits.
* Run `scripts/verify-game-smoke.js` after future behavior or map edits.
* Balance a full playthrough from level 1 to dragon clear.
* Manually verify that first armor purchase timing feels natural in browser play.
* Tune EXP and gold so a normal run reaches level 4 naturally.
* Tune medicine, fire bottle, and ward availability so retreating to the village remains meaningful.
* Check whether dragon scale requirements feel like natural progression or arbitrary checklist collection.
* Verify that the North Forest Guardian feels like a survivability gate, not just a quest flag.
* Verify that the Red Dragon requires preparation, not just high HP.

## Exploration

* Current map generation is now fixed and hand-editable through `src/data/maps/world.js`; future terrain edits should change `WORLD_MAP` rows there rather than adding random/noise terrain.
* Keep map objects separated from terrain where practical; `WORLD_OBJECTS` in `src/data/maps/world.js` currently owns NPC placements.
* Use the new 80x72 map space to add meaningful east/southeast exploration only after browser QA confirms the fixed expansion feels good.
* Add two more meaningful exploration rewards outside the main path.
* Add more map events in the east forest and river area.
* Add a dangerous optional area that is painful early but rewarding later.
* Add a hidden or semi-hidden reward that improves survival range.
* Add clearer hints for hidden discoveries without making them feel automatic.
* Ensure exploration rewards are placed in reachable and visually sensible locations.

## Equipment and Growth

* Make equipment effects easier to understand from the player perspective.
* Add or tune armor effects that visibly reduce contact damage.
* Add or tune weapon effects that make old enemies die much faster.
* Consider a mid-game regeneration item or armor trait.
* Consider a late-game rare item that makes weak enemies nearly harmless.
* Make shop equipment progression feel like a major survival upgrade, not a minor stat bump.

## Enemy and Area Design

* Ensure enemy populations scale with distance from the village.
* Place weak enemies near the village.
* Place stronger or more dangerous enemies in the North Forest, East Forest/River, and Dragon Cave.
* Add enemy-specific contact effects only where they improve readability and survival-range progression.
* Avoid empty danger zones.
* Avoid spawning enemies or drops inside walls, buildings, or unreachable tiles.

## Ending and Clear State

* Add ending dialogue after victory report.
* Add a small ending message sequence after returning to the elder.
* Add a clear summary or post-clear note after the final report.
* Add ending or post-clear note only after the survival-range loop feels good.

## Save and Settings

* Consider a settings/reset menu for save management.
* Verify save/load for:

  * Equipment traits.
  * Hidden discoveries.
  * HP regeneration source.
  * Guardian defeated state.
  * Dragon defeated state.
  * Elder report / clear state.
  * Item menu state if added.
  * Area spawn or discovery state if added.

## Refactoring Plan

- Current state: `src/game.js` responsibilities are classified in `REFACTOR_PLAN.md`; static definitions now live in `src/data/definitions.js`, and pure math helpers now live in `src/core/math.js`.
- Do not perform large file splitting until static data, pure helpers, and pure reward/equipment helpers are extracted and verified.
- Proposed future modules:
  - `src/core/state.js`
  - `src/core/constants.js`
  - `src/core/math.js`
  - `src/data/definitions.js`
  - `src/world/map.js`
  - `src/world/spawn.js`
  - `src/entities/player.js`
  - `src/entities/enemies.js`
  - `src/systems/combat.js`
  - `src/systems/items.js`
  - `src/systems/save.js`
  - `src/ui/hud.js`
  - `src/ui/menu.js`
- First refactor extracted static definitions. Second refactor extracted pure math helpers. Next refactor should extract only pure reward/equipment helper logic.
- Avoid changing behavior during the first split.
- Verify the game after every small extraction.
- Use `docs/REFACTOR_CHECKLIST.md` before and after each future split.
