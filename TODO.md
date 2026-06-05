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

## Critical Playtest Issues

* Fix enemy spawning outside the village-adjacent areas.

  * Current issue: enemies appear near the base, but distant areas such as the north area may have few or no enemies.
  * This is critical because survival range expansion requires stronger enemy populations farther from the village.
  * Farther areas should contain stronger enemies, better rewards, and more danger.
* Prevent enemy projectiles and magic from threatening the player inside the village.

  * Current issue: enemy magic can fly into the base.
  * The village must feel like a safe recovery point.
  * Projectiles should be blocked, removed, or prevented from crossing village walls/gates unless part of a meaningful crisis event.
* Improve the village boundary from a weak fence feeling to a stronger wall/safe-base feeling.

  * The current fence does not strongly communicate safety.
  * Consider stone walls, gates, or clearer collision/visual barriers.
* Fix invalid item or reward placement.

  * Current issue: items can appear inside walls or invalid map tiles.
  * Ensure treasure, drops, hidden rewards, and discoveries spawn only on reachable walkable tiles.
* Verify the full enemy spawn system by area.

  * Grassland: early enemies.
  * North Forest: stronger enemies and Guardian pressure.
  * East Forest/River: ranged or special enemies.
  * Dragon Cave: late enemies and final boss pressure.

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

## Menu, Items, and Equipment UI

* Add a proper menu or command screen for item and equipment review.
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
* Add visible equipment detail panel if the command UI expands.

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
