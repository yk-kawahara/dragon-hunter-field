# AGENTS.md

Codex / AI workflow rules for this browser-based contact-combat RPG.

## Active documents

Read in this order before meaningful changes:

1. `AGENTS.md` — workflow, verification, and safety rails.
2. `GAME_DESIGN_NOTES.md` — design truth and game identity.
3. `IMPROVEMENT_PLAN.md` — current priority and next work order.
4. `DEVELOPMENT_LOG.md` — read the current summary and latest entries; read older history only when investigating regressions or past decisions.

If documents conflict:

* Workflow/verification: `AGENTS.md`
* Design intent: `GAME_DESIGN_NOTES.md`
* Current priority: `IMPROVEMENT_PLAN.md`
* History only: `DEVELOPMENT_LOG.md`

Deleted handoff files such as `TODO.md` and `NEXT_CODEX_TASK.md` are not active workflow files. Do not recreate them unless the user explicitly asks for a one-off handoff.

## Core attitude

Do not hide behind conservatism.

When the user asks for a major player-facing improvement, do not reject it merely because it touches save data, UI, maps, balance, or broad systems. Handle risk through staged implementation, migration, and verification.

Prefer bold playable progress over unnecessary architecture work:

* Larger hand-authored maps.
* New regions, towns, frontier bases, and dungeons.
* New enemy behaviors.
* Rewards that change survivable range.
* Real inventory and equipment choices.

Architecture caution is useful only when it protects ambitious gameplay work.

## Non-negotiable design principle

The core fun is **survival-range expansion**.

The player should repeatedly experience:

1. Leave a safe base.
2. Fight nearby enemies.
3. Take meaningful damage.
4. Retreat before risk becomes fatal.
5. Recover, restock, and improve equipment.
6. Take less damage from enemies that used to be dangerous.
7. Travel farther than before.
8. Find stronger enemies, better rewards, new bases, and deeper routes.

Before adding enemies, items, UI, terrain, dungeons, towns, or rewards, ask:

> Does this help the player feel that their survivable range has expanded?

If not, reconsider the change.

## Current direction

The current village -> Guardian -> Red Dragon route is **Chapter 1 scale**, not the final game size.

Expand the game into a larger RPG while preserving density and purpose:

* Expand the map size definition beyond the current `120x160` overworld when new regions justify it.
* Do not create large empty terrain.
* Add named regions, remote towns, dungeons, roads, bridges, caves, towers, castles, mines, ruins, and frontier bases.
* Add monsters with behavior differences, not only stat/color changes.
* Add equipment tiers, sidegrades, accessories, inventory decisions, and route preparation.
* Dangerous areas should be more rewarding and more populated than safe areas.
* When the current map already has empty or wall-corridor space, deepen density and route quality before making the world larger again.

## Implementation rules

### Map work

* Terrain edits belong in `src/data/maps/world.js`.
* Continue using human-editable fixed map data.
* Do not return to random/noise terrain generation.
* If map dimensions change, update map size definitions and dependent placement intentionally.
* After terrain edits, regenerate:
  * `docs/world-map-preview.png`
  * `docs/world-map-preview.svg`
* Verify reachability for important locations.

### Architecture

* Do not split files merely to reduce line count.
* Do not start ES Modules, Vite, bundling, or import/export migration unless explicitly requested.
* Preserve direct local browser play through non-module script loading and `globalThis.DRAGON_HUNTER_*`.
* Treat the current `src/data`, `src/core`, and `src/systems` split as good enough for this phase.
* Prefer gameplay verification and content progress over architecture cleanup.

### Inventory, rewards, and safety

* Inventory is a core RPG system.
* Weapons, armor, items, and accessories should be inspectable where appropriate.
* Accessories should be equipment choices, not only permanent flags.
* Equipment should affect survivability, exploration range, route preparation, or contact combat.
* Shields are a first-class equipment slot for contact combat. Preserve save/load, inventory, shop, and frontal-damage behavior when editing equipment systems.
* One-time rewards must persist across save/load and must never make the player weaker.
* The village and remote bases must be true safe zones: no ordinary enemy/projectile/magic leakage.
* Remote bases should provide recovery, supplies, readable landmarks, and a feeling that the safe radius moved outward.

### Tempo and readability

* Favor responsive movement and fast traversal.
* Danger should come from enemy behavior, damage, positioning, and area design, not sluggish controls or excessive walking.
* Functional readability beats decoration.
* The player should quickly understand where to heal, buy gear/items, get guidance, exit to danger, and check equipment effects.

### Playtest-driven quality bar

* Preserve contact combat, but increase action depth through weapon-specific reach, speed, movement, arcs, boss patterns, and readable evasion demands.
* A weapon is not acceptable as a mere lower number. Sidegrades need a distinct attack profile or route purpose that remains useful after stronger gear appears.
* Dungeon population must be local to the dungeon. Enemies behind unrelated exterior walls must not consume the dungeon's active spawn budget.
* Avoid short box mazes and repeated wall corridors. New geography should read as mountains, highlands, coasts, islands, valleys, rivers, roads, ruins, or settlements with memorable silhouettes.
* Future world expansion should include at least one major city with multiple services and distinct residents, not only small recovery camps.
* NPC dialogue should vary by person, location, and progression where practical. Repeated generic lines across a town are a visible quality defect.
* The quick-access UI must represent the real item system. Players should be able to assign owned consumable types to shortcuts instead of seeing a permanently fixed subset.
* Add a readable whole-world map before geography grows beyond what route text can communicate.

## Verification

After meaningful code/content/map/save/UI changes, run as much as possible:

1. JavaScript syntax checks for changed files, preferably all `src/` and `scripts/`.
2. `scripts/verify-game-smoke.js`.
3. `git diff --check`.
4. Map reachability checks if terrain/object placement changed.
5. Save/load migration checks if state, rewards, inventory, charms, bosses, or clear state changed.
6. Browser visual QA when available, especially desktop and mobile-like viewports.
7. Manual playthrough checks when balance or route structure changed.

If something cannot be verified, record the reason and risk in `DEVELOPMENT_LOG.md`.

## Documentation

After each meaningful pass, update only what changed:

* `GAME_DESIGN_NOTES.md` — design truth, area/enemy/reward roles, progression, identity.
* `IMPROVEMENT_PLAN.md` — priorities, roadmap, next work order.
* `DEVELOPMENT_LOG.md` — implementation, verification, browser QA, playtest, known risk.

## Git

After meaningful changes:

1. Check `git status`.
2. Review the diff.
3. Commit with a clear message when complete and verified enough.
4. Push if possible and appropriate.

Do not leave finished work uncommitted without a reason.
