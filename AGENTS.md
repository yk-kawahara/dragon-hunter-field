# AGENTS.md

Codex / AI workflow rules for this browser-based contact-combat RPG.

## Active documents

Read in this order before meaningful changes:

1. `AGENTS.md` — workflow, verification, and safety rails.
2. `GAME_DESIGN_NOTES.md` — design truth and game identity.
3. `IMPROVEMENT_PLAN.md` — current priority and next work order.
4. `DEVELOPMENT_LOG.md` — current status and historical record.

If documents conflict:

* Workflow / verification: `AGENTS.md`
* Design intent: `GAME_DESIGN_NOTES.md`
* Current priority: `IMPROVEMENT_PLAN.md`
* History only: `DEVELOPMENT_LOG.md`

Deleted handoff files such as `TODO.md` and `NEXT_CODEX_TASK.md` are not active workflow files. Do not recreate them unless the user explicitly asks for a one-off handoff.

## Current mission

The game already has a broad Chapter 1-5 structure. The next quality jump is **not** another world-size expansion.

Current mission:

> Convert the existing 256x256 geography into distinct, rewarding expeditions without expanding the world again.

Highest-value work now:

1. Give underused existing regions a complete local expedition arc, starting with 蒼風島 / 蒼風灯台.
2. Preserve required-route readability while adding optional regional goals.
3. Make regional rewards change movement, defense, sustain, or route choice rather than only adding gold.
4. Continue hands-on balance/readability work for Chapter 1, Moon Cavern/Archive, Ice Cave, and Chapter 5.
5. Improve sidegrade weapon and equipment relevance now that the first regional reward role exists; dead weapons need visible roles and situational matchups.
6. Perform low-risk cleanup only when it protects active gameplay work.

Do not expand the world size again until these issues are improved or intentionally deferred.

## Core attitude

Do not hide behind conservatism.

When the user asks for a major player-facing improvement, do not reject it merely because it touches save data, UI, maps, balance, or broad systems. Handle risk through staged implementation, migration, and verification.

Prefer bold playable progress over unnecessary architecture work:

* Deeper hand-authored expedition routes.
* Stronger town-to-town survival pressure.
* New dungeons that make the next base feel earned.
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
7. Push farther than before.
8. Find stronger enemies, better rewards, new bases, deeper routes, or shortcuts.
9. Feel that the safe radius moved outward.

Before adding enemies, items, UI, terrain, dungeons, towns, or rewards, ask:

> Does this help the player feel that their survivable range has expanded?

If not, reconsider the change.

## Required route readability standard

Mandatory route targets include chapter bosses, required midbosses, required seals, and required dungeon entrances.

Required targets should be **traced**, not guessed.

Rules:

* Objective text names the route and landmark, not only the boss name.
* At least one nearby NPC, sign, discovery, or guide repeats the route.
* The field has a readable landmark: road, cave wind, scorched path, light pillar, ruin marker, shrine stone, military remains, or similar.
* The whole-world map may show the current required destination when the world is large enough that text alone is weak.
* Optional bosses and hidden treasures may be vague. Required progression should not depend on blind searching.

Initial targets:

* Chapter 1: 竜洞 / Red Dragon.
* Chapter 5: 日輪砲台守.
* Then review Chapter 2-4 required dungeon and boss entrances.

## Safe-base arrival standard

A new required base should feel like a survival breakthrough.

When adding or revising a base:

* The player should usually suffer visible pressure before first arrival: HP loss, stamina loss, item use, return-bell temptation, or enemy pressure.
* The final approach should show the base as a readable landmark while still keeping some danger.
* First arrival should clearly communicate that the safe radius moved outward.
* The base should provide recovery, supplies, local guidance, and at least one future travel/preparation benefit.
* Do not create payoff by empty walking. Use terrain beats, enemies, supplies, discoveries, route decisions, and retreat pressure.

Suggested first-arrival message pattern:

```text
<base name>に辿り着いた。
新しい安全圏を確保した。
ここから再出発できる。
```

Tone may vary by area, but the function should stay clear.

## Street-to-street expedition standard

Short town-to-town routes can be improved by adding meaningful routes or attrition dungeons.

A good attrition route is not a long corridor. It should include:

* Clear entrance and exit landmarks.
* Early pressure with a safe retreat option.
* Mid-route resource decisions.
* A fork when possible: safer/longer vs risky/shorter.
* Supply, discovery, or shortcut that changes the continue/retreat decision.
* Local enemy behavior that fits the route.
* Final approach where the next base feels close but not free.
* Persistent reward, shortcut, travel unlock, or first-arrival payoff.

For required attrition dungeons, a first attempt may reasonably end in retreat. The ideal feeling is:

> I got deeper this time. Next time I can reach the new base.

## Guidance and UI hierarchy

When several hints compete, use this priority:

1. Main route objective.
2. Current-area survival hint.
3. Required preparation for the next route.
4. Optional activity or side dungeon.
5. Treasure / rumor cleanup.

Optional content may be advertised, but it must not appear more mandatory than the main route.

The travel memo should be a route plan, not only a treasure counter. Prefer:

* 本線.
* 今やること.
* 準備.
* 任意.

Chapter 5 specifically needs travel memo support for:

* 黎明港.
* 日輪砲台守.
* 陽冠都市 preparation.
* 日鏡塔 / 反射水晶.
* 陽光封印碑.
* 熾火聖域 supply cache.
* 熾火天竜.
* Optional 陽冠闘技場.

## Chapter focus

### Chapter 1

Teach the game grammar: safe base, retreat, equipment value, route reading, and required boss tracing.

Priority: make 竜洞 / Red Dragon readable without coordinate knowledge.

### Chapter 2

Leading candidate for the next major content pass.

Priority: add or prototype a required attrition route such as 月影洞窟 / 月下坑道 before 月見砦, so 月見砦 feels like a hard-earned safe base.

### Chapter 3

Content-rich chapter with many optional activities.

Priority: separate main route from optional content in travel memo and guides.

### Chapter 4

Structurally solid frozen expedition.

Priority: preserve the clear 白銀宿 -> 氷窟 -> 霜冠城 route while adding optional regional preparation that never overrides the main objective.

### Chapter 5

Strongest late-game structure, but route readability and checklist feeling are risks.

Priority: fix 日輪砲台守 breadcrumbs, main-route guidance priority, Chapter 5 travel memo, and Suncrest exit readability.

### 蒼風島 regional arc

The island already has 港, ridge roads, lighthouse geography, and a southern safe base, but lacks a memorable local objective.

Priority: build a compact optional lighthouse expedition with a named encounter, readable harbor guidance, and a persistent reward that expands traversal/survivability. Keep Chapter 4 main-route guidance above this optional arc.

## Map work

* Terrain edits belong in `src/data/maps/world.js` unless a staged separate-map implementation has explicitly begun.
* Continue using human-editable fixed map data.
* Do not return to random/noise terrain generation.
* Prefer named fixed geography features over long straight bands or repeated rectangular wall corridors.
* Continental coastlines belong in editable landmass polygons. Do not recreate rectangular map borders or brush-stroke “sausage islands.”
* The whole-world map is cartographic, not a raw debug dump. Embedded interior floors must be represented as mountain, town, cave, tower, or castle landmarks instead of exposing room mazes at overworld scale.
* Major routes should usually offer a readable main road plus at least one safer/longer or riskier/rewarding alternative when space allows.
* If map dimensions change, update map size definitions and dependent placement intentionally.
* After terrain edits, regenerate `docs/world-map-preview.png` and `docs/world-map-preview.svg`.
* Verify reachability for important locations.

## Separate map files: staged rule

Separate hand-authored maps such as `moon_cavern.js` or `black_passage.js` are allowed **only as a staged gameplay improvement**, not as architecture cleanup for its own sake.

Recommended sequence:

1. First prove the gameplay value with one long hand-authored embedded attrition dungeon if that is lower-risk.
2. If it improves play, introduce separate non-module script files that attach map data to `globalThis`.
3. Preserve direct local browser play and non-module script loading.
4. Do not start ES Modules, Vite, bundling, or import/export migration unless explicitly requested.
5. Before separate persistent maps ship, save/load must handle `currentMapId` migration safely.
6. Portal data must support `fromMapId` / `toMapId` or an equivalent explicit transition.
7. Reachability, spawn locality, return-bell behavior, world-map behavior, and save/load migration must be verified per map.

## Architecture

* Do not split files merely to reduce line count.
* Do not start ES Modules, Vite, bundling, or import/export migration unless explicitly requested.
* Preserve direct local browser play through non-module script loading and `globalThis.DRAGON_HUNTER_*`.
* Treat the current `src/data`, `src/core`, and `src/systems` split as good enough for this phase.
* Prefer gameplay verification and content progress over architecture cleanup.
* Low-risk cleanup is welcome when it removes misleading unreachable code or prevents AI/developer confusion.

Current cleanup targets:

* Duplicated unreachable `shield` branches in shop confirmation.
* Legacy unreachable frontier auto-purchase logic after shop return.
* Unreachable or inconsistent stage names such as `chapter4cleared` if confirmed.
* Guidance priority that shows optional content above the main route.

## Inventory, rewards, and safety

* Inventory is a core RPG system.
* Weapons, armor, items, shields, and accessories should be inspectable where appropriate.
* Accessories should be equipment choices, not only permanent flags.
* Equipment should affect survivability, exploration range, route preparation, or contact combat.
* Shields are a first-class equipment slot for contact combat. Preserve save/load, inventory, shop, and frontal-damage behavior when editing equipment systems.
* One-time rewards must persist across save/load and must never make the player weaker.
* The village and remote bases must be true safe zones: no ordinary enemy/projectile/magic leakage.
* Remote bases should provide recovery, supplies, readable landmarks, and the feeling that the safe radius moved outward.

## Tempo and readability

* Favor responsive movement and fast traversal.
* Danger should come from enemy behavior, damage, positioning, and area design, not sluggish controls or excessive walking.
* Functional readability beats decoration.
* The player should quickly understand where to heal, buy gear/items, get guidance, exit to danger, and check equipment effects.

## Playtest-driven quality bar

* Preserve contact combat, but increase action depth through weapon-specific reach, speed, movement, arcs, boss patterns, and readable evasion demands.
* A weapon is not acceptable as a mere lower number. Sidegrades need a distinct attack profile, visible role text, and at least one route or enemy matchup that remains useful after stronger gear appears.
* Dungeon population must be local to the dungeon. Enemies behind unrelated exterior walls must not consume the dungeon's active spawn budget.
* Avoid short box mazes and repeated wall corridors. New geography should read as mountains, highlands, coasts, islands, valleys, rivers, roads, ruins, or settlements with memorable silhouettes.
* Future city work should add playable services, route preparation, rumors, or optional activities. Do not add duplicated shops just to make a city larger.
* NPC dialogue should vary by person, location, and progression where practical.
* The quick-access UI must represent the real item system.
* Boss warnings must be readable before damage arrives.

## Verification

After meaningful code/content/map/save/UI changes, run as much as possible:

1. JavaScript syntax checks for changed files, preferably all `src/` and `scripts/`.
2. `scripts/verify-game-smoke.js`.
3. `git diff --check`.
4. Map reachability checks if terrain/object placement changed.
5. Save/load migration checks if state, rewards, inventory, charms, bosses, map id, or clear state changed.
6. Browser visual QA when available, especially desktop and mobile-like viewports.
7. Manual playthrough checks when balance or route structure changed.

Extra checks for current priority work:

* Can the player find 竜洞 without coordinate knowledge?
* Can the player find 日輪砲台守 without coordinate knowledge?
* Does Suncrest guidance show main route before optional arena?
* Does a new safe base create a clear first-arrival payoff?
* If an attrition dungeon is added, can the player retreat, resupply, and make deeper progress later?

If something cannot be verified, record the reason and risk in `DEVELOPMENT_LOG.md`.

## Documentation

After each meaningful pass, update only what changed:

* `GAME_DESIGN_NOTES.md` — design truth, area/enemy/reward roles, progression, identity.
* `IMPROVEMENT_PLAN.md` — priorities, roadmap, next work order.
* `DEVELOPMENT_LOG.md` — implementation, verification, browser QA, playtest, known risk.

Do not turn `DEVELOPMENT_LOG.md` into the active task list.

## Git

After meaningful changes:

1. Check `git status`.
2. Review the diff.
3. Commit with a clear message when complete and verified enough.
4. Push if possible and appropriate.

Do not leave finished work uncommitted without a reason.
