# NEXT CODEX TASK

## Current Handoff Status

This handoff assumes the behavior-neutral refactor branch where `src/game.js` has been reduced from the original 3000+ line file into a thin entrypoint/司令塔, with behavior moved into `src/core`, `src/data`, and `src/systems` files.

Expected current structure:

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


Expected script loading order in `index.html`:

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


Important note:

* Treat `src/systems/monsters.js` as the final large extraction from `src/game.js`.
* Do not continue splitting files just to reduce line count.
* If the local repository differs from this map, first inspect the actual repo and reconcile carefully. Do not guess from stale artifacts.

## Recommended Next Development Pass

Goal:

Move from "technically complete and VM-verified" to "real-browser playable route verified."

First checkpoint:

1. Run JavaScript syntax checks for all files under `src/` and `scripts/`.
2. Run `scripts/verify-game-smoke.js`.
3. Run `git diff --check`.
4. If a browser tool is available, open `index.html` and do desktop plus mobile-like smoke QA.

If browser QA is possible:

* Prioritize fixing browser-only regressions before adding content.
* Verify player frame rendering, map visibility, input, HUD fit, context prompts, save/load, and a fresh-save route to elder report.

If browser QA is still unavailable:

* Do not guess visual quality.
* Use automated checks, then make only a small high-confidence content/planning pass.
* Best safe implementation target: improve the fixed east/southeast area with one reachable survival-range reward and regenerate map previews.

Design focus for the next gameplay pass:

* The east/southeast expansion should become a real reason to leave the safe village longer.
* Prefer rewards that extend survivable range over plain gold.
* Keep the village safe and readable.
* Keep terrain edits in `src/data/maps/world.js`.
* Regenerate `docs/world-map-preview.png` and `docs/world-map-preview.svg` after terrain changes.

## Completed Refactor Work

* Extracted static definitions to `src/data/definitions.js`.
* Extracted pure math/geometry helpers to `src/core/math.js`.
* Extracted initial state/player factories to `src/core/state.js`.
* Extracted runtime wiring to `src/core/context.js`.
* Extracted map/collision, spawn/region, rewards/items, effects, text, rendering, projectiles, NPC, controls, save/load, combat stat helpers, player movement/update, actions, UI, and monster AI/contact-combat systems.
* Kept non-module script loading through `globalThis.DRAGON_HUNTER_*` to preserve direct local browser play without a dev server.
* Kept the survival-range expansion game design unchanged.
* Added player art support through independent frame files under `assets/player/`.
* Split `assets/player.png` into eight 32x32 frame PNGs matching the render loader paths.
* Converted the terrain from pseudo-random generation to a fixed 80x72 hand-editable map in `src/systems/map.js`.
* Moved the fixed terrain data into `src/data/maps/world.js`; future map edits should change `WORLD_MAP` rows there.
* Added `WORLD_OBJECTS` in `src/data/maps/world.js` for NPC placement separate from terrain tiles.
* Added `docs/MAP_EDITING.md` and whole-map previews at `docs/world-map-preview.png` and `docs/world-map-preview.svg`.
* Added `scripts/verify-game-smoke.js` for repeatable VM verification.
* Added `scripts/generate-map-preview.js` and `scripts/generate-map-preview.ps1` for fixed-map preview regeneration.

## Remaining Critical / High Priority

* Run interactive desktop browser QA.
* Run interactive mobile-like viewport QA.
* Fix mobile layout overflow observed in Edge screenshots: portrait clips the right side of the game/action controls, and landscape still requires vertical scrolling for touch controls.
* Perform a full manual playthrough from new save to red dragon defeat and elder report.
* Verify that enemy AI, contact combat, projectiles, monster defeat, level-up, Guardian defeat, red dragon defeat, and elder report still work after the `monsters.js` split.
* Verify save/load after opened chests, discovered hidden rewards, equipment upgrades, seal crest, boss defeat, and elder report.
* Verify objective guidance and context prompts fit the small mobile-style screen.
* Verify save/load, objective guidance, context prompts, and script loading in a real browser. VM smoke tests already pass, but browser QA is still required.
* Verify `docs/world-map-preview.png` reflects the current `WORLD_MAP` after any terrain edits.
* Verify the new player frame files render correctly in all four directions and both idle/walk poses.
* Verify the fixed 80x72 map in browser, especially North Forest access, river/east access, dragon cave access, and the new east/southeast expansion.

Recent browser rendering result:

* Microsoft Edge headless successfully loaded `index.html` through `file://`.
* Screenshots were captured at `docs/browser-qa-desktop.png`, `docs/browser-qa-mobile.png`, and `docs/browser-qa-landscape.png`.
* Desktop renders correctly enough to continue QA: canvas, player, village, HUD, command buttons, and touch controls are visible.
* Mobile portrait and landscape render, but layout overflow remains a real usability issue.
* This was rendering QA, not interactive play QA.

## First Task For Next Codex

Start with verification, not new gameplay content.

1. Read `AGENTS.md`, `GAME_DESIGN_NOTES.md`, `IMPROVEMENT_PLAN.md`, `DEVELOPMENT_LOG.md`, and this file.
2. Inspect the actual repository tree and confirm that all files in the expected architecture exist.
3. Run syntax checks on every JavaScript file under `src/`.
4. Run `scripts/verify-game-smoke.js`.
5. Run `git diff --check`.
6. Launch the game in a real browser if available and perform smoke QA.
7. Perform a full manual playthrough if possible.
8. Fix only regressions caused by the refactor, using minimal behavior-neutral changes.
9. Update documentation with exact verification results.
10. Commit with a clear message if changes are made.

## Recommended Prompt

Read `AGENTS.md`, `GAME_DESIGN_NOTES.md`, `IMPROVEMENT_PLAN.md`, `TODO.md`, `DEVELOPMENT_LOG.md`, and `NEXT_CODEX_TASK.md` first. The project now has a split `src/data` / `src/core` / `src/systems` architecture and a fixed hand-editable world map in `src/data/maps/world.js`. Start with verification: syntax checks, `scripts/verify-game-smoke.js`, `git diff --check`, and real browser QA if available. If browser QA finds regressions, fix those first. If browser QA is unavailable or passes, improve the survival-range route by making the east/southeast fixed-map expansion a meaningful dangerous destination with one reachable reward that extends survivable range. Regenerate map previews after terrain edits and update the management docs with exact results.

## Verification Items

* `find src -name "*.js" -print -exec node --check {} \;`
* `node scripts/verify-game-smoke.js`
* `git diff --check`
* `index.html` script order matches the handoff order.
* Browser startup does not show a black screen.
* Player sprite loads from `assets/player/<direction>_<pose>.png`.
* Fallback `assets/player.png` still works if individual frame loading fails.
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
* Save/load from localStorage key `dragon-hunter-field-save-v2-32px`.
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
* Player frame animation looks correct for down, left, right, and up movement.
* Fixed map visual QA: no blocked-feeling roads, no confusing river crossings, no unreachable-looking rewards, and no empty-feeling expansion area.
* Future terrain changes should edit `src/data/maps/world.js`, not procedural painters in `src/systems/map.js`.
* Regenerate whole-map previews after terrain edits.
