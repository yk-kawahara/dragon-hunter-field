# IMPROVEMENT_PLAN.md

Active roadmap and next work order.

## Current priority

Expand the roughly 20-minute Chapter 1 route into a larger RPG while preserving **survival-range expansion**.

Current focus:

* Deepen the new `120x160` overworld without creating empty space.
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

### 0. Playtest-driven priority reset (2026-06-21)

The latest hands-on playtest is authoritative player feedback. The game is already enjoyable, but its next quality jump is not another short wall dungeon.

Immediate work order:

1. Fix dungeon-local population so exterior enemies cannot consume an interior's spawn budget; use tighter interior spawn radii and region-aware counting/pruning.
2. Add weapon attack profiles so quick, thrust, sweep, reach, and heavy weapons feel different in the player's hands and dead sidegrades regain a purpose.
3. Replace the fixed herb/bomb/ward dock with three configurable quick slots supporting all consumables and save migration.
4. Expand boss action patterns with piercing lines, delayed multi-wave spreads, persistent hazards, and phase combinations that demand movement. **Initial implementation complete; balance/arena follow-up remains.**
5. Build the next world region as geography rather than corridors: mountain chain, highland, valley/coast route choices, and longer distinct travel beats. **Skyspine Highlands and multi-route crossing complete; coast/island follow-up remains.**
6. Add a major city with multiple shops, specialists, upgrades, residents, rumors, and optional reasons to revisit.
7. Add person/location/progression-specific NPC dialogue and a whole-world map view. **Initial implementation complete.**

Acceptance rules from the playtest:

* Interior enemy pressure is measured only from the current interior region.
* Every weapon family exposes a visible attack-style difference, not only a damage number.
* All six current consumables can be assigned to any of three quick slots.
* New route length must include distinct terrain, encounters, landmarks, or decisions every short interval.
* A future city pass must deliver several services and dialogue identities in one coherent place.

Completed in this playtest-response pass:

* Dungeon spawning now counts and prunes by interior region, uses tighter interior radii, and rapidly fills the current floor without exterior enemies consuming its budget.
* Every weapon now has an attack profile covering cooldown, reach, width, power, lunge, knockback, and visual identity; route multipliers now apply before enemy defense so correct sidegrades genuinely penetrate their intended targets.
* The fixed three-item dock is now three configurable quick slots. All six consumables can be assigned from `もちもの`, used with `1/2/3` or click, cycled with `Q/E`, and preserved through save/load.
* Inventory/status text now names attack styles and quick-slot assignments.
* Villagers and guards now draw from settlement-specific dialogue pools across the village, frontier camp, Ash Hamlet, Moon Camp, Black Market, Black Fort, and Frost Haven.
* Preserved the user's higher late-game enemy-stat tuning and Frost Frontier route openings as the new balance baseline.
* Added distinct advanced boss attacks: piercing fire/ice lanes, delayed rotating Eclipse volleys, persistent Void zones, and Frost multi-wave blizzards with visible warnings.
* Added a live whole-world map (`P` / command button) showing fixed terrain, current position, safe bases, and major boss markers.
* Rebuilt the central expedition geography around Skyspine Highlands: organic mountain ridges, a meandering river, main/valley/ridge routes, new caches, discoveries, and a dedicated mixed-behavior spawn region.
* Expanded Black Market into Black Market City, a much larger safe urban district with streets, residential blocks, market space, eight more residents/guards, and several approaches.

Next player-facing implementation target:

* Playtest the new boss patterns and tune warning time, shield counterplay, minimum damage, and arena density.
* Continue the geography conversion north and south of Skyspine: shape a coast/island frontier and replace remaining rectangular castle approaches with terrain-led routes.
* Turn Black Market City from a larger district into a true multi-service capital with specialist shops, upgrade activities, local errands, and progression-sensitive residents.

### 1. Latest completed player-facing pass

Completed in the latest pass:

* Added Frost Watchtower / `霜見塔` as a substantial optional two-floor Chapter 4 dungeon instead of expanding the overworld again.
* Added explicit entrance, inter-floor stairs, a far-side elevator shortcut, floor-specific regions, dense enemy pressure, expedition supplies, route records, and a guarded reliquary.
* Added Frost Beacon / `凍気灯`, a stationary aura hazard that repeatedly slows and drains stamina, creating target-priority pressure distinct from ordinary pursuit enemies.
* Added the LV32 Frost Watchtower Warden, whose second phase activates three fixed beacons and accelerates the fight.
* Added `天駆けの徽章`, an optional two-slot accessory choice that extends dash distance and shortens dash cooldown.
* Added save/load/reset migration, objective and travel guidance, region rendering, reward locks, portal-aware reachability, combat behavior checks, and map preview generation from the fully assembled terrain.

* Added Frost Haven shield engraving as the town's first unique service instead of another duplicated equipment shop.
* Added three mutually exclusive shield builds: `城壁の刻印` for deeper frontal defense, `疾走の刻印` for traversal/dash efficiency, and post-Frost-Golem `反撃の刻印` for defense-scaled contact retaliation.
* Added a visible shield artisan NPC, selectable engraving menu, late-game gold costs, inventory/status descriptions, save/load/reset migration, and VM effect verification.
* Fixed Frost Haven and Frost Frontier zone labels so the new chapter is no longer mislabeled as the village or Black Sun Castle.

* Added Chapter 4 Frost Frontier / `霜原` as a chapter-sized regional pack beyond the Chapter 3 report.
* Expanded the fixed map from `120x144` to `120x160` with a dense frozen frontier, a main-road approach, a dangerous Ice Cave branch, and Frost Crown Citadel.
* Added Frost Haven / `白銀宿` as a new safe town with recovery, wagon travel, NPC life, premium expedition supplies, and selectable frost weapon/armor/shield stock.
* Added Frost Moth and Frost Beast as behaviorally distinct regular enemies: ranged frost slow/stamina pressure and a long-telegraph charge.
* Added Frost Golem as a required LV30 branch-dungeon midboss and `霜心の護符` as its survival-range reward.
* Added Frost Crown Dragon as the LV34 Chapter 4 major boss with enrage, five-way frost shots, and mixed ranged/charging reinforcements.
* Added Chapter 4 objectives, guidance, discoveries, one-time rewards, elder report, save/load/reset migration, rendering, reachability checks, and VM story-flow coverage.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg` at `120x160`.

* Added Black Market Catacombs / `黒市地下墓所` as the first compact interior-style dungeon reached through an explicit entrance/exit pair.
* Replaced unused upper-map forest space with a dense stone-floor dungeon containing connected rooms, alternative pockets, supplies, a readable retreat point, and a guarded reliquary.
* Added Vault Leech / `吸命鬼`, whose contact drains stamina, slows the player, and restores its HP.
* Added Crypt Warden / `地下墓所の番人`, a LV22 optional midboss after Chapter 2 report that uses magic pressure and summons Vault Leeches at half HP.
* Added Deep Lamp Charm / `深層灯の護符`, which reduces slow movement loss and strengthens herb healing.
* Added Black Market NPC guidance, dungeon atmosphere/props, portal prompts, reward locks, save/load/reset coverage, and portal-aware reachability verification.
* Fixed accessory effect ownership so unequipped accessories no longer remain active through legacy ownership flags.

* Added the Mist Shrine as a second optional side-dungeon layer beyond the Black Market north regeneration route.
* Added Mist Lancer, a shrine patrol enemy with a readable windup and lunge, so the route changes movement decisions rather than only enemy stats.
* Added Mist Keeper, a named LV18 midboss after Regen Sentinel, to gate the Mist Charm and make the shrine reward feel earned.
* Added Mist Charm / `霧灯の護符`, shrine supplies, and shrine discoveries that reduce trap, summon, and magic pressure and extend late-route survivability.
* Added save/load/reset coverage and VM smoke checks for Mist Keeper state, Mist Charm persistence, guarded shrine chest behavior, region detection, spawn pool, and reward handling.
* Added a hand-authored shrine court terrain overlay and regenerated `docs/world-map-preview.png` / `docs/world-map-preview.svg`.

* Added fixed terrain-detail overlays in `src/data/maps/world.js` so small landmarks can be hand-authored without changing map size.
* Added camp remains, shrine markers, thorn fields, old stalls, moss fields, and muster grounds across sparse grassland, river fork, smuggler road, regeneration cave, and Black Sun approaches.
* Added seven additional treasure caches across early, mid, and late routes so optional exploration has more rewards.
* Added seven additional discovery points for route hints, shortcut hints, trap warnings, waystones, and regeneration-cave guidance.
* Added nine more NPCs across Black Market, Ash Hamlet, Moon Camp, and Black Fort so remote bases feel less empty.
* Regenerated `docs/world-map-preview.png` and `docs/world-map-preview.svg`.

* Added Smuggler Captain / `密輸隊長` as a named midboss on the western smuggler road, making the early Black Market shortcut a real risk/reward route.
* Added two smuggler supply caches and an extra route hint on the western shortcut so the path has rewards, not only danger.
* Added Regen Sentinel / `再生洞の守護者` as a named guardian for the Black Market north regeneration cave.
* Locked the `大再生の指輪` chest behind Regen Sentinel defeat so a major survival-range reward is earned through preparation and combat.
* Added save/load coverage for Smuggler Captain and Regen Sentinel defeat state.
* Updated region guidance so the player understands the smuggler road and regeneration cave goals without coordinate-style instructions.

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

* Manually balance the complete Chapter 4 loop from a Chapter 3 clear save: LV30/LV34 pacing, gold income versus rank-12 gear, Ice Cave retreat pressure, Frost Heart value, and Frost Crown Dragon reinforcement timing.
* Manually tune Frost Haven shield engraving costs and effect strength against real Chapter 4 damage, traversal, and gold income.
* Manually playtest Frost Watchtower from Frost Haven: floor-one attrition, beacon pulse strength, warden phase readability, retreat pressure, elevator value, and Sky Emblem build value.
* Deepen Black Market into a city hub with distinctive NPCs, stalls, optional errands, and late-route shop/reward reasons.
* Continue turning optional routes into multi-step expeditions: approach danger, named guardian, route-specific enemy behavior, and reward that changes survivability.
* Continue deepening the existing `120x160` overworld before another size jump: reduce wall-maze feel, add natural landmarks, and create side paths with reward reasons.
* Continue the density pass region by region: every long open stretch should gain either a landmark, route choice, warning, small reward, or distinct enemy pocket.
* Add the next interior with a structure different from both Catacombs and Frost Watchtower, preferably a flooded cave or castle wing linked to a lived-in town objective.
* Add another behaviorally distinct enemy, preferably heavy-guard pressure or elite patrols, so the long expedition does not rely only on stats.
* Expand `旅メモ` / route-label presentation into a richer rumor log if progression continues to grow.
* Rebalance Chapter 3 gold/EXP after manual playtesting the new shop, wagon travel, premium items, and Obsidian Golem route.
* Continue shield balance after manual playtesting: shield prices, front-reduction strength, and whether heavy shields should trade off movement.

### 2. Baseline verification checkpoint

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

### 3. Map size expansion follow-up

Goal: build on the current `120x160` overworld without creating empty terrain.

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

### 4. New region content pass

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

Chapter-sized content-pack acceptance:

* 1 new safe hub that moves the recovery/restock radius.
* 2-3 readable route choices with different danger/reward profiles.
* 1 compact interior dungeon with a retreat decision and persistent reward.
* 2 behaviorally distinct regular enemies.
* 1 named midboss and 1 major boss.
* 3 or more meaningful rewards, including at least one equipment or accessory choice.
* Guidance, save/load, reachability, and smoke coverage delivered in the same pass.

### 5. Inventory and equipment depth pass

Current inventory exists; next work should make choices matter.

Add:

* Sidegrade weapons/armor.
* More accessory identities.
* Region-specific gear.
* Remote shop stock.
* Clear comparison text.
* Buyback or unique-item sell protection.

Design question: **What route am I preparing for?**

### 6. Full route balance pass

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

* Short-term: deepen the current `120x160` world with dense landmarks, rewards, and route goals.
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
* Player can equip owned weapons, armor, and up to two accessories.
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
* Frost Haven now sells `霜砕きの剣`, `白銀の外套`, and `霜鏡盾`; Ice Cave awards `霜心の護符` for the Chapter 4 boss route.
* Inventory and HUD now show ATK/DEF values and comparison deltas.
* The western smuggler road adds an early-risk shortcut toward Black Market.
* Black Market north regeneration cave adds an optional side dungeon and `大再生の指輪`.
* `大再生の指輪` gives a stronger regeneration option, especially when paired with travel or resistance accessories.
* Trap Flower priming time is doubled so the hazard is readable rather than instant-feeling.

Next:

* More sidegrade gear in new routes, with route recommendations.
* More accessories and stronger two-accessory build identity.
* Additional shop stock and remote-town equipment.
* Better comparison text for special effects, resistances, and recommended areas.
* Unique accessory sell protection or buyback.

### Immediate content priorities after the smuggler/regeneration pass

* Add more terrain variety and route choices around the western smuggler road and Black Market north so the new encounters sit in memorable geography, not a narrow lane.
* Add another small interior-style dungeon or tower segment after the regeneration cave so optional route rewards continue beyond one guardian chest.
* Add more alternate east-west connectors between the main road, Moon route, Black Market route, and Black Sun route so the overworld feels less like vertical lanes.
* Improve accessory UI copy so two-slot build planning is clearer: movement, regeneration, magic resistance, bubble resistance, black sun resistance, frontal pressure.

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
