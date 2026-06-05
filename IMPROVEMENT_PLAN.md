# IMPROVEMENT PLAN

## Current Priority
Keep increasing the play value of the complete loop: rewards, exploration, enemy variety, and boss drama.

## Cycle Notes
- Cycle 1: Equipment felt too numeric. Added weapon/armor traits tied to facing, dashing, guarding, and fire resistance.
- Cycle 2: Exploration felt too shallow. Added persistent hidden discoveries: spring, ore, and hunter cache.
- Cycle 3: Boss was still close to a high-HP enemy. Added dragon enrage, spread fire, and summon behavior.
- Survival range pass Cycle 1: Early contact damage was too soft. Increased early enemy threat and made armor defense step sharply reduce old enemy damage.
- Survival range pass Cycle 2: Shop equipment value was not visible enough. Lowered early shop costs, made armor purchase first on ties, and exposed equipment traits/cost impact through messages.
- Survival range pass Cycle 3: Mid-game exploration needed weak sustain. Added the regeneration ring as a river shrine reward; it is weak, saved, and disabled while burning.

## Action Items
- [x] Add game stage tracking through objective text and cave gates.
- [x] Add a midboss that gates the dragon cave.
- [x] Expand boss challenge requirements beyond random drops.
- [x] Save progression flags needed to resume the adventure.
- [x] Improve NPC hints so the player knows the next step.
- [x] Verify attack, contact combat, treasure, midboss, boss, and save/load logic.

## Next High-Impact Improvements
- Add more map events in the east forest and river area.
- Add more enemy-specific contact effects, such as poison or item theft.
- Continue tuning EXP/gold through full manual play once browser QA is available.
- Add a small ending message sequence after returning to the elder.
- Add browser visual QA once local browser execution is available.

## Verification Notes
- `node --check src/game.js` passes.
- VM-based progression simulation passes from Guardian spawn through dragon defeat and elder report.
- VM-based reward simulation passes for equipment multipliers, hidden spring, hunter cache, dragon enrage, spread shots, and saved discovery fields.
- VM-based survival-range simulation passes: slime contact sample 6 damage at start and 2 with leather armor; boar sample 11 without armor and 3 with chain armor; regeneration is 0 early, then weakly extends mid/late exploration.
- Browser visual QA is still pending because no browser control tool was available in this run.
