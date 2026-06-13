# IMPROVEMENT_PLAN.md

Active roadmap and next work order.

## Current priority

Expand the roughly 20-minute Chapter 1 route into a larger RPG while preserving **survival-range expansion**.

Current focus:

* Continue expanding the map beyond the new `120x144` overworld without creating empty space.
* Preserve content density, regional purpose, and survival-range expansion.
* Treat village -> Guardian -> Red Dragon as Chapter 1, not final scope.
* Add meaningful volume: larger maps, remote towns, dungeons, varied monsters, equipment tiers, inventory decisions, and side routes.
* Dangerous areas should be more rewarding and more populated than safe areas.
* Villages and remote bases must be safe, readable, and useful.
* Equipment upgrades must visibly expand survivable range.
* Movement/combat tempo should remain responsive.
* Reward persistence and equipment safety are hard requirements.
* Expand `もちもの` with sidegrade gear, accessory decisions, shop stock, and clearer route-preparation text.
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

### 2. Map size expansion follow-up

Goal: build on the current `120x144` overworld without creating empty terrain.

Implementation direction:

* Use the new BASE_MAP / EAST_EXPANSION / SOUTH_EXPANSION fixed-map structure intentionally.
* Expand `src/data/maps/world.js` with hand-authored terrain.
* Keep Chapter 1 route intact.
* Add new space as named regions with routes, landmarks, danger, rewards, and remote bases.
* Update dependent coordinates: objects, safe zones, heal points, treasure, discoveries, regions, spawns, bosses/routes.
* Regenerate `docs/world-map-preview.png` and `.svg`.
* Verify reachability.

Acceptance:

* Map remains visibly larger by definition.
* New terrain has purpose: region identity, route, danger, reward, safe base, dungeon, town, or shortcut.
* Important objects are reachable.
* Existing Chapter 1 flow remains playable.

### 3. New region content pass

Use expanded space to create named routes, not more grass.

Preferred first targets:

* Deepen Ash Road / Ash Hamlet / Old Tower / Moon Ruins with more treasures, NPC guidance, and a clearer route through the expanded late route.
* Deepen the new Chapter 2 route beyond Moon Ruins: Moon Camp, Eclipse Castle, Eclipse Mage, eclipse gear, and Eclipse Dragon should become a larger arc, not a one-room finale.
* Deepen the new Chapter 3 route beyond Eclipse Castle: Black Gate, Black Fort, Black Sun Castle, Void Wraith, Black Sun gear, and Black Sun Dragon need more landmarks and preparation side rewards.
* Continue southwest mine expansion using Bubbler pressure and mine charm counterplay.
* Add another remote road/frontier base, dungeon entrance, or town that moves the safe radius outward.

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

* Short-term: deepen the current `120x144` world with dense landmarks, rewards, and route goals.
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
* First sidegrade equipment pass exists:
  * Mine gear: `泡割り槍`, `鉱夫服`.
  * Fire route gear: `火返しの剣`, `耐火マント`.
  * Dragon route gear: `竜狩りの刃`, `巡礼鎧`.
* Southwest frontier camp now sells route-preparation gear after the mine charm.
* The southwest mine has an armory chest that grants mine gear as an exploration reward.
* Ash hamlet now sells `星見の杖` / `星織りの衣` after the Ash Knight.
* Moon Camp now sells/grants `月蝕の刃`, `月蝕の外套`, and `月蝕の指輪` for the Chapter 2 boss route.
* Black Fort now sells/grants `黒陽の剣`, `黒陽の鎧`, and `黒陽の護符` for the Chapter 3 boss route.
* Inventory and HUD now show ATK/DEF values and comparison deltas.

Next:

* More sidegrade gear in new routes, with route recommendations.
* More accessories.
* Additional shop stock and remote-town equipment.
* Better comparison text for special effects, resistances, and recommended areas.
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
