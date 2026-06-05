# TODO

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

## Critical Playtest Issues - Addressed This Pass

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

* Run real desktop and mobile browser visual QA when browser automation is available.
* Perform a full manual playthrough from new save to red dragon clear and elder report.
* Continue balance testing for whether gold, EXP, medicines, and shop prices make the first armor purchase and level 4 timing feel natural.
* Manually verify whether the new local monster pruning feels natural during long-distance travel.
* Manually verify that the new objective guidance and context prompts do not clutter the small mobile-style screen.

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

## Gameplay and Balance

* Browser visual test on desktop and mobile viewport.
* Balance a full playthrough from level 1 to dragon clear.
* Manually verify that first armor purchase timing feels natural in browser play.
* Tune EXP and gold so a normal run reaches level 4 naturally.
* Tune medicine, fire bottle, and ward availability so retreating to the village remains meaningful.
* Check whether dragon scale requirements feel like natural progression or arbitrary checklist collection.
* Verify that the North Forest Guardian feels like a survivability gate, not just a quest flag.
* Verify that the Red Dragon requires preparation, not just high HP.

## Exploration

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

- Analyze `src/game.js` responsibilities before splitting files.
- Do not perform large file splitting until gameplay-critical bugs are fixed.
- Proposed future modules:
  - `src/core/state.js`
  - `src/core/constants.js`
  - `src/world/map.js`
  - `src/world/spawn.js`
  - `src/entities/player.js`
  - `src/entities/enemies.js`
  - `src/systems/combat.js`
  - `src/systems/items.js`
  - `src/systems/save.js`
  - `src/ui/hud.js`
  - `src/ui/menu.js`
- First refactor should extract only constants and pure helper functions.
- Avoid changing behavior during the first split.
- Verify the game after every small extraction.
