# IMPROVEMENT PLAN

## Current Priority
Make the game playable from start to clear.

## Action Items
- [x] Add game stage tracking through objective text and cave gates.
- [x] Add a midboss that gates the dragon cave.
- [x] Expand boss challenge requirements beyond random drops.
- [x] Save progression flags needed to resume the adventure.
- [x] Improve NPC hints so the player knows the next step.
- [x] Verify attack, contact combat, treasure, midboss, boss, and save/load logic.

## Next High-Impact Improvements
- Add more map events in the east forest and river area.
- Add enemy-specific contact effects, such as slowing or poison.
- Tune EXP/gold so a normal run reaches level 4 naturally.
- Add a small ending message sequence after returning to the elder.
- Add browser visual QA once local browser execution is available.

## Verification Notes
- `node --check src/game.js` passes.
- VM-based progression simulation passes from Guardian spawn through dragon defeat and elder report.
- Browser visual QA is still pending because no browser control tool was available in this run.
