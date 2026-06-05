# NEXT CODEX TASK

## Completed This Time

* Hardened one-time treasure persistence across save/load.
* Hardened hidden discovery persistence across save/load.
* Added duplicate guards so already opened chests and already revealed discoveries cannot grant rewards again.
* Added equipment reward safety helpers so weaker or equal weapon/armor rewards never downgrade current gear.
* Verified save/load preservation for opened chests, discoveries, equipment, and reward state with VM smoke tests.
* Updated `GAME_DESIGN_NOTES.md`, `IMPROVEMENT_PLAN.md`, `TODO.md`, and `DEVELOPMENT_LOG.md`.

## Remaining Critical / High Priority

* Run real desktop and mobile browser QA when browser automation is available.
* Perform a full manual playthrough from new save to red dragon defeat and elder report.
* Balance-test gold, EXP, medicines, shop prices, and level 4 timing in a real run.
* Verify that objective guidance and context prompts fit the small mobile-style screen.
* Consider a simple equipment inventory or comparison screen if future rewards become sidegrades instead of rank upgrades.

## First Task For Next Codex

Run a full browser playtest pass focused on whether the survival-range expansion loop feels good from a new save through the first armor purchase, North Forest exploration, dragon scale collection, Guardian defeat, red dragon defeat, and elder report.

## Recommended Prompt

Read `AGENTS.md`, `GAME_DESIGN_NOTES.md`, `TODO.md`, `IMPROVEMENT_PLAN.md`, `DEVELOPMENT_LOG.md`, and `NEXT_CODEX_TASK.md` first. Then run a real browser playtest pass from a new save through as much of the game as possible. Prioritize survival range expansion: early danger, retreating to the village, buying gear, reduced damage, farther exploration, meaningful rewards, Guardian gate, dragon challenge, and elder report. Fix the highest-impact issues you find, update the management files, verify, commit, and push.

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
