# IMPROVEMENT_PLAN.md

Active roadmap and next work order.

## Current priority

Expand the roughly 20-minute Chapter 1 route into a larger RPG while preserving **survival-range expansion**.

Current focus:

* Explicitly expand the map size definition beyond the current `80x72` overworld.
* Preserve content density, regional purpose, and survival-range expansion.
* Treat village -> Guardian -> Red Dragon as Chapter 1, not final scope.
* Add meaningful volume: larger maps, remote towns, dungeons, varied monsters, equipment tiers, inventory decisions, and side routes.
* Dangerous areas should be more rewarding and more populated than safe areas.
* Villages and remote bases must be safe, readable, and useful.
* Equipment upgrades must visibly expand survivable range.
* Movement/combat tempo should remain responsive.
* Reward persistence and equipment safety are hard requirements.
* Expand `もちもの` with sidegrade gear, accessory decisions, shop stock, and comparison text.
* Do not use implementation risk to avoid major requested gameplay systems; manage risk through migration and verification.

## Active document set

* `AGENTS.md` — workflow, verification, AI/Codex development rules.
* `GAME_DESIGN_NOTES.md` — design truth and game identity.
* `IMPROVEMENT_PLAN.md` — current roadmap and next work order.
* `DEVELOPMENT_LOG.md` — current status summary plus historical implementation/verification record.

Do not recreate deleted `TODO.md` or `NEXT_CODEX_TASK.md` unless explicitly requested for a one-off handoff.

## Next development order

### 1. Baseline verification checkpoint

Before major new content, verify the current game still behaves correctly.

Run:

* JS syntax checks for `src/` and `scripts/`.
* `scripts/verify-game-smoke.js`.
* `git diff --check`.
* Browser desktop/mobile smoke QA if available.
* Fresh-save route check if feasible.

Focus:

* Start screen: `はじめから` / `つづきから`.
* Player rendering and frame loading.
* Keyboard/touch input.
* HUD and `もちもの` overlay fit.
* Save/load after chests, discoveries, equipment, accessories, bosses, and clear state.
* Village and remote camp safety.

If browser QA is unavailable, record the limitation in `DEVELOPMENT_LOG.md` and proceed only with high-confidence VM-verifiable work.

### 2. Map size expansion pass

Goal: move beyond the current `80x72` overworld without creating empty terrain.

Implementation direction:

* Increase the map size definition intentionally.
* Expand `src/data/maps/world.js` with hand-authored terrain.
* Keep Chapter 1 route intact.
* Add new space as named regions with routes, landmarks, danger, and rewards.
* Update dependent coordinates: objects, safe zones, heal points, treasure, discoveries, regions, spawns, bosses/routes.
* Regenerate `docs/world-map-preview.png` and `.svg`.
* Verify reachability.

Acceptance:

* Map is visibly larger by definition.
* New terrain has purpose: region identity, route, danger, reward, safe base, dungeon, town, or shortcut.
* Important objects are reachable.
* Existing Chapter 1 flow remains playable.

### 3. New region content pass

Use expanded space to create named routes, not more grass.

Preferred first targets:

* East/southeast continuation after traveler bell and Southeast Warden.
* Southwest mine continuation using Bubbler pressure and mine charm counterplay.
* New remote road/frontier base that moves the safe radius outward.

Each new region should include at least three:

* Named identity.
* Distinct terrain shape.
* Distinct spawn pool.
* Behaviorally distinct enemy.
* Survival-range reward.
* Safe base, shortcut, or restock point.
* Dungeon/tower/cave/castle/ruin entrance.

### 4. Inventory and equipment depth pass

Current inventory exists; next work should make choices matter.

Add:

* Sidegrade weapons/armor.
* More accessory identities.
* Region-specific gear.
* Remote shop stock.
* Clear comparison text.
* Buyback or unique-item sell protection.

Design question: **What route am I preparing for?**

### 5. Full route balance pass

After content expansion, rebalance the game as a playable route.

Check:

* First armor timing.
* Level 4 timing.
* Gold/EXP curve.
* Medicine, fire bottle, ward availability.
* Mine charm / Aegis / traveler bell usefulness.
* Old enemies becoming safer after gear.
* Deeper regions remaining worth visiting.
* Dragon readiness feeling earned, not checklist-like.

## Roadmap

### Map scope

* Short-term: expand current map definition beyond `80x72` with density and purpose.
* Mid-term: add map files for dungeons/interiors such as caves, towers, castles, mines, and towns.
* Long-term: make playable scope at least 10x Chapter 1 through larger `world.js`, additional map files, or both.
* Continue hand-authored fixed map data; do not return to random terrain.

### Towns and safe bases

* Add multiple towns/frontier bases.
* Later towns should provide recovery, supplies, stronger shops, hints, or progression roles.
* Remote towns should make the safe radius feel moved outward.
* Current first step: southwest frontier camp near the mine route.

### Enemy variety

* Add behavior differences, not just colors/stats.
* Prioritize bubbles/projectiles, magic, poison/slow/status, territorial enemies, summoners, and area-specific counterplay.
* Each new region should introduce at least one behavior that changes contact-combat approach.

### Inventory and equipment

Current:

* Real `もちもの` exists.
* Player can inspect consumables, weapons, armor, and accessories.
* Player can equip owned weapons, armor, and one accessory.
* Consumables and unequipped weapons/armor can be sold.
* Former charm flags are moving into equipable accessories.

Next:

* Sidegrade gear.
* More accessories.
* Shop stock and remote-town equipment.
* Comparison text.
* Unique accessory sell protection or buyback.

## Architecture status

Current split is structurally complete for this phase:

```text
src/data/ definitions.js, maps/world.js
src/core/ math.js, state.js, context.js
src/systems/ map.js, spawn.js, monsters.js, combat.js, player.js,
             actions.js, rewards.js, projectiles.js, npc.js, save.js,
             effects.js, text.js, render.js, ui.js, controls.js
src/game.js
```

Guidance:

* Do not split more files merely to reduce line count.
* Do not start ES Modules/Vite/bundling/import-export migration unless asked.
* Verification and gameplay feel matter more than architecture cleanup.
* Pair content changes with smoke verification and log updates.

## Planning constraints

* Terrain edits belong in `src/data/maps/world.js`.
* Regenerate map previews after terrain edits.
* Use `WORLD_OBJECTS` where useful; avoid broad migration unless it helps gameplay/editing.
* Preserve save/load migration and one-time reward safety.
* Keep old mobile RPG feel.
* Do not add empty space just to make the map bigger.

## Definition of done

A pass is complete when:

* Design goal is clear.
* Implementation is playable or VM-verifiable.
* Relevant smoke checks pass.
* Known unverified risks are recorded.
* Map previews are regenerated if terrain changed.
* Only relevant docs are updated.
