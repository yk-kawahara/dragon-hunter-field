# REFACTOR CHECKLIST

Use this checklist before and after every future `src/game.js` split.

## Before Editing

* Read `AGENTS.md`.
* Read `GAME_DESIGN_NOTES.md`.
* Read `TODO.md`.
* Read `IMPROVEMENT_PLAN.md`.
* Read `DEVELOPMENT_LOG.md`.
* Read `NEXT_CODEX_TASK.md`.
* Read `REFACTOR_PLAN.md`.
* Confirm `git status` and identify any user changes.
* Choose exactly one low-risk extraction target.
* Write down whether the change is behavior-neutral.

## Safe First Targets

* Equipment definitions. Done: `src/data/definitions.js`.
* Enemy definitions. Done: `src/data/definitions.js`.
* Treasure chest definitions. Done: `src/data/definitions.js`.
* Discovery point definitions. Done: `src/data/definitions.js`.
* Region spawn definitions. Done: `src/data/definitions.js`.
* Tile and direction constants. Done: `src/data/definitions.js`.
* Tempo constants. Done: `src/data/definitions.js`.
* Pure math helpers. Done: `src/core/math.js`.
* Pure reward ID validation helpers.
* Pure equipment comparison helpers.

## Current Loading Contract

* `index.html` must load `src/data/definitions.js` before `src/game.js`.
* `index.html` must load `src/core/math.js` after definitions and before `src/game.js`.
* `src/data/definitions.js` must define `globalThis.DRAGON_HUNTER_DEFINITIONS`.
* `src/core/math.js` must define `globalThis.DRAGON_HUNTER_MATH`.
* `src/game.js` must keep using the same local constant names after destructuring.
* Do not convert to ES modules unless a local dev-server workflow is introduced and verified.

## Do Not Move Without Stronger Tests

* Player update and movement.
* Enemy AI.
* Contact combat.
* Projectile safety.
* Boss and progression gates.
* NPC/shop behavior.
* Save/load behavior.
* Draw orchestration.
* Input binding.
* Main loop and init.

## Required Checks

* `node --check src/game.js`
* `node --check src/data/definitions.js`
* `node --check src/core/math.js`
* `git diff --check`
* Static reward reachability VM check.
* Region spawn VM check.
* Stale-cap spawn VM check.
* Village projectile safety VM check.
* Monster gate rule VM check.
* Strength/info-panel VM check.
* Chest persistence VM check.
* Hidden discovery persistence VM check.
* Equipment anti-downgrade VM check.
* Dragon clear and elder report VM check.

## Manual QA Before Visual Splits

* Desktop browser viewport.
* Mobile-like browser viewport.
* Objective text fit.
* Context prompt fit.
* HUD readability.
* Village safety readability.
* Combat feel near the village.
* Mid-game exploration feel.

## Commit Rules

* One refactor target per commit.
* No gameplay rebalance in extraction commits.
* Commit message should name the extracted responsibility.
* Push only after syntax and VM smoke checks pass.
