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

### 0. Latest completed player-facing pass

Completed in the latest pass:

* Added Summoner / `召喚士` as a late-route enemy that calls reinforcements if ignored.
* Added Summoners to Moon Ruins, Eclipse, Obsidian, and Black Sun region pressure with level-gated spawning so early-game survival-range pacing is not broken.
* Added Moon/Eclipse/Black Market side caches and route discoveries that provide expedition supplies, return bells, tonics, wards, and route warnings.
* Made route hints, shortcut hints, obsidian waystones, and summoner warnings visible on the field.
* Added `旅メモ` to the status panel so the player can remember the next destination and route preparation without coordinate-style instructions.
* Added Trap Flower / `地雷花` as a late-route area-denial enemy that stays still, warns briefly, then explodes for HP/stamina/slow pressure.
* Added trap-warning discoveries and trap-route caches around Moon Ruins and Black Sun approaches so risky paths give route-extension supplies.
* Updated late-route equipment counters so mine/obsidian preparation helps against trap pressure and stronger weapons can clear traps faster.
* Roughened selected Eclipse Castle and Black Sun Castle walls into broken courts and side routes, preserving `120x144` scope while reducing box-corridor feel.
* Added four more remote-base/city NPCs around Black Market, Moon Camp, Ash Hamlet, and Black Fort.
* Localized remaining visible item detail labels such as return/full/guard into Japanese-facing text.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

Previously completed:

* Added a formal shield equipment slot with save/load, inventory tab, shop purchase, selling rules, and status display.
* Added shield combat value: equipped shields reduce frontal contact damage, creating a clearer "brace from the front vs reposition for the back" choice.
* Added Shield Soldier as a behaviorally distinct enemy: frontal attacks are weak, side/back attacks are rewarded.
* Added Shield Soldiers to old tower, eclipse, obsidian, and void region pressure.
* Added route-extension shield rewards around Ash Watchtower / Old Tower side pocket / Black Gate.
* Added route-hint and shortcut-hint discovery rewards that give travel supplies and teach route preparation.
* Opened and roughened selected old-tower/eastern ruins walls so they read more like broken terrain than sealed corridors.
* Added more NPCs to Black Market, Ash Hamlet, Moon Camp, and Black Fort to reduce remote-base emptiness.
* Replaced newly added English item/travel text such as Tonic, Elixir, Return Bell, and Base Wagon with Japanese-facing names.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

* Obsidian vault no longer grants the strongest weapon/armor directly; it now preserves Black Market gear purchases as the late-game gold sink.
* Added premium consumables: Tonic, Elixir, and Return Bell.
* Shops and inventory now support the expanded item list.
* Black Market and remote bases sell more attractive route-preparation supplies.
* Added Base Wagon travel between unlocked safe bases.
* Added porter NPCs, guards, and villagers across bases so remote bases feel less empty.
* Increased late-region enemy density and opened an extra Black Sun Castle route seam to reduce sparse/over-walled feel.
* Added extra Black Market / Obsidian route rewards and verified they are reachable.

* Shops now open selectable buy menus instead of auto-buying in fixed order.
* Weapon, armor, accessory, and consumable purchases can be chosen directly.
* Weak found equipment is kept in inventory when new and does not auto-equip over stronger current gear.
* Chapter 3 route gained Black Market as a second town / safe base.
* Chapter 3 route gained Obsidian Cave as a branch dungeon with Obsidian Crawler pressure.
* Chapter 3 route gained Obsidian Golem as a required midboss before the final Black Sun Dragon push.
* Black Market offers obsidian gear/accessory after Obsidian Golem defeat.

Next high-value content direction:

* Continue deepening the existing `120x144` overworld before another size jump: reduce wall-maze feel, add natural landmarks, and create side paths with reward reasons.
* Make Black Market feel more like a city with more NPC conversations, stalls, alleys, small discoveries, and optional errands.
* Add at least one more interior-style dungeon or castle segment beyond the overworld-only route.
* Add another behaviorally distinct enemy, preferably heavy-guard pressure or elite patrols, so the long expedition does not rely only on stats.
* Expand `旅メモ` / route-label presentation into a richer rumor log if progression continues to grow.
* Rebalance Chapter 3 gold/EXP after manual playtesting the new shop, wagon travel, premium items, and Obsidian Golem route.
* Continue shield balance after manual playtesting: shield prices, front-reduction strength, and whether heavy shields should trade off movement.

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
* Add more dense landmarks around Black Market / Obsidian Cave / Black Sun Castle now that base travel reduces backtracking.

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
