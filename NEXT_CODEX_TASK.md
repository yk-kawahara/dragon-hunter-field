# NEXT CODEX TASK

## Current Handoff Status

This handoff assumes the behavior-neutral refactor branch where `src/game.js` has been reduced from the original 3000+ line file into a thin entrypoint/司令塔, with behavior moved into `src/core`, `src/data`, and `src/systems` files.

Expected current structure:

```text
src/data/
  definitions.js  Static constants, tiles, equipment data, monster definitions, treasure/discovery definitions.

src/core/
  math.js         Pure math/geometry helpers.
  state.js        Initial state/player factory.
  context.js      Context factory that wires state/player/helpers into each system.

src/systems/
  map.js          Map generation, tile access, town/gate/collision helpers.
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


Expected script loading order in `index.html`:

```html
<script src="src/data/definitions.js"></script>
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
<script src="src/game.js"></script>
```


Important note:

* Treat `src/systems/monsters.js` as the final large extraction from `src/game.js`.
* Do not continue splitting files just to reduce line count.
* If the local repository differs from this map, first inspect the actual repo and reconcile carefully. Do not guess from stale artifacts.

## Completed Refactor Work

* Extracted static definitions to `src/data/definitions.js`.
* Extracted pure math/geometry helpers to `src/core/math.js`.
* Extracted initial state/player factories to `src/core/state.js`.
* Extracted runtime wiring to `src/core/context.js`.
* Extracted map/collision, spawn/region, rewards/items, effects, text, rendering, projectiles, NPC, controls, save/load, combat stat helpers, player movement/update, actions, UI, and monster AI/contact-combat systems.
* Kept non-module script loading through `globalThis.DRAGON_HUNTER_*` to preserve direct local browser play without a dev server.
* Kept the survival-range expansion game design unchanged.

## Remaining Critical / High Priority

* Run real desktop browser QA.
* Run real mobile-like viewport QA.
* Perform a full manual playthrough from new save to red dragon defeat and elder report.
* Verify that enemy AI, contact combat, projectiles, monster defeat, level-up, Guardian defeat, red dragon defeat, and elder report still work after the `monsters.js` split.
* Verify save/load after opened chests, discovered hidden rewards, equipment upgrades, seal crest, boss defeat, and elder report.
* Verify objective guidance and context prompts fit the small mobile-style screen.
* Verify the refactored script loading order in `index.html` exactly matches the expected order above.

## First Task For Next Codex

Start with verification, not new gameplay content.

1. Read `AGENTS.md`, `GAME_DESIGN_NOTES.md`, `IMPROVEMENT_PLAN.md`, `DEVELOPMENT_LOG.md`, and this file.
2. Inspect the actual repository tree and confirm that all files in the expected architecture exist.
3. Run syntax checks on every JavaScript file under `src/`.
4. Run `git diff --check`.
5. Launch the game in a real browser if available and perform smoke QA.
6. Perform a full manual playthrough if possible.
7. Fix only regressions caused by the refactor, using minimal behavior-neutral changes.
8. Update documentation with exact verification results.
9. Commit with a clear message if changes are made.

## Recommended Prompt

Read `AGENTS.md`, `GAME_DESIGN_NOTES.md`, `IMPROVEMENT_PLAN.md`, `DEVELOPMENT_LOG.md`, and `NEXT_CODEX_TASK.md` first. This repository has just completed a behavior-neutral refactor from a 3000+ line `src/game.js` into `src/data`, `src/core`, and `src/systems`. Do not add gameplay content yet. First verify the refactored architecture, script loading order, syntax, browser startup, save/load, enemy AI, contact combat, projectiles, monster defeat rewards, Guardian defeat, red dragon defeat, and elder report. If something is broken, make the smallest behavior-neutral fix possible. Update the management docs with what was verified and what remains risky.

## Verification Items

* `find src -name "*.js" -print -exec node --check {} \;`
* `git diff --check`
* `index.html` script order matches the handoff order.
* Browser startup does not show a black screen.
* Desktop viewport smoke QA.
* Mobile-like viewport smoke QA.
* Keyboard movement.
* Touch movement.
* Attack / context action.
* NPC talk.
* Chest opening.
* Hidden discovery reveal.
* Gathering.
* Item use: medicine, fire bottle, ward.
* Save/load from localStorage key `dragon-hunter-field-save-v1`.
* Enemy spawn in grassland, Wilds, North Forest, East Forest/River, and Dragon Cave.
* Enemy movement and contact combat.
* Boar charge.
* Wisp / Guardian / Dragon projectiles.
* Slime SLOW, bat stamina reduction, fire BURN.
* Monster defeat EXP/gold/drop behavior.
* Level-up behavior.
* Guardian defeat and seal crest persistence.
* Red dragon enrage, summons, defeat, victory state.
* Elder report and final clear state.
* Objective/guidance/context prompts fit the screen.
