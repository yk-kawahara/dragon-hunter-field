# NEXT CODEX TASK

## Completed This Time

* Hardened one-time treasure persistence across save/load.
* Hardened hidden discovery persistence across save/load.
* Added duplicate guards so already opened chests and already revealed discoveries cannot grant rewards again.
* Added equipment reward safety helpers so weaker or equal weapon/armor rewards never downgrade current gear.
* Verified save/load preservation for opened chests, discoveries, equipment, and reward state with VM smoke tests.
* Updated `GAME_DESIGN_NOTES.md`, `IMPROVEMENT_PLAN.md`, `TODO.md`, and `DEVELOPMENT_LOG.md`.
* Created `REFACTOR_PLAN.md` and `docs/REFACTOR_CHECKLIST.md` for safe future `src/game.js` extraction.
* Classified `src/game.js` responsibilities and marked static definitions/pure helpers as the first low-risk split targets.

## Remaining Critical / High Priority

* Run real desktop and mobile browser QA when browser automation is available.
* Perform a full manual playthrough from new save to red dragon defeat and elder report.
* Balance-test gold, EXP, medicines, shop prices, and level 4 timing in a real run.
* Verify that objective guidance and context prompts fit the small mobile-style screen.
* Consider a simple equipment inventory or comparison screen if future rewards become sidegrades instead of rank upgrades.
* Begin behavior-neutral refactoring only with static definitions and pure helpers; do not split behavior hubs yet.

## First Task For Next Codex

If the next task is refactoring, read `REFACTOR_PLAN.md` and `docs/REFACTOR_CHECKLIST.md`, then perform only the first low-risk extraction: move static definitions to `src/data/definitions.js` without changing names, values, save shape, or gameplay behavior. If the next task is playtesting, run a full browser playtest pass focused on whether the survival-range expansion loop feels good from a new save through the first armor purchase, North Forest exploration, dragon scale collection, Guardian defeat, red dragon defeat, and elder report.

## Recommended Prompt

Read `AGENTS.md`, `GAME_DESIGN_NOTES.md`, `TODO.md`, `IMPROVEMENT_PLAN.md`, `DEVELOPMENT_LOG.md`, `NEXT_CODEX_TASK.md`, `REFACTOR_PLAN.md`, and `docs/REFACTOR_CHECKLIST.md` first. This is a behavior-neutral refactor pass. Extract only static definitions from `src/game.js` into a data module, keep names and values unchanged, do not move player update, enemy AI, combat, save/load, NPCs, drawing orchestration, input, boss flow, loop, or init. Run syntax, diff, and VM smoke checks, update management files, commit, and push.

## Verification Items

* `node --check src/game.js`
* `git diff --check`
* Browser QA on desktop viewport
* Browser QA on mobile-like viewport
* New-save playthrough to first armor purchase
* New-save playthrough to level 4
* Dragon scale collection
* Guardian defeat and seal crest persistence
* Red dragon defeat and elder report
* Save/load after opened chests and discovered hidden rewards
* Save/load after equipment upgrades and one-time rewards
* Static definitions extraction keeps all values identical
* Reward ID validation still rejects unknown saved IDs
* Equipment anti-downgrade behavior still passes after imports are introduced
