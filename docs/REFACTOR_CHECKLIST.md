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

* Equipment definitions.
* Enemy definitions.
* Treasure chest definitions.
* Discovery point definitions.
* Region spawn definitions.
* Tile and direction constants.
* Tempo constants.
* Pure math helpers.
* Pure reward ID validation helpers.
* Pure equipment comparison helpers.

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
