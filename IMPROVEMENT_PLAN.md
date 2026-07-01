# IMPROVEMENT_PLAN.md

Active roadmap and next work order.

## Current priority

The game already has a broad Chapter 1-5 structure. The next priority is not another world-size expansion.

Current goal:

> Make existing chapters feel like readable, tense expeditions where each new safe base is hard-earned relief.

Main playtest/code-analysis findings:

* Required bosses can be hard to locate if the player misses route landmarks.
* Confirmed playtest concern: 日輪砲台守 is hard to find.
* Similar concern exists for Chapter 1 竜洞 / Red Dragon.
* Some town-to-town routes are short or low-pressure enough that a new safe base does not feel like a breakthrough; 黒市都 -> 黒門砦 now has a first Black Gate approach pass.
* Chapter 2 now has a first 月影洞窟 attrition route between 月影廃墟 and 月見砦; it needs real-browser/manual tuning to confirm pressure, length, and reward feel.
* 月影洞窟 now ends in the named 月門の護将 encounter, with the Moon Seal and east exit locked until victory; manual combat tuning is still needed.
* Chapter 4 now has first-pass role clarity: 白銀宿 first-arrival payoff, main-route travel memo, world-map destination markers, and guide dialogue distinguish 氷窟 / 霜冠城 from optional 霜見塔.
* 白銀宿 now has a dedicated final-approach pressure region and reachable forward supply before first arrival.
* Chapter 5 now has stronger map support through the full main route, but still needs browser/manual checks to confirm the city exits and late-route markers are visually clear.
* Optional content, especially 陽冠闘技場, can appear too prominently compared with the main route.
* Travel memo should become a route plan, not only a treasure/rumor reminder.
* A few low-risk unreachable or duplicated code paths should be cleaned up before more AI-assisted editing.

## Active document set

* `AGENTS.md` — workflow, verification, safety rails, and development rules.
* `GAME_DESIGN_NOTES.md` — design truth and game identity.
* `IMPROVEMENT_PLAN.md` — current roadmap and next work order.
* `DEVELOPMENT_LOG.md` — current status plus historical implementation record.

Do not recreate deleted `TODO.md` or `NEXT_CODEX_TASK.md` unless explicitly requested for a one-off handoff.

---

# Now: recommended implementation sequence

## Completed 2026-07-01: Chapter 3 main/optional route hierarchy pass

Implemented:

* Added a reachable, rereadable `黒市の遠征掲示板` that updates its main-route message with Chapter 3 progress and lists side routes separately.
* Reworked Chapter 3 travel memo ordering so uncleared optional content can no longer replace the required route.
  * Main: 黒門砦 -> 黒陽碑 -> 黒曜巨人 -> 黒陽竜.
  * Optional: 地下墓所 / 密輸道 / 再生洞窟 / 霧灯の祠, with reward roles shown.
* Updated the Black Market guide to repeat the same hierarchy at every required stage.
* Extended the world-map current destination through 黒曜巨人 and 黒陽竜 instead of dropping the marker after the seal.
* The board grants one small preparation package on first read; rereading updates guidance without repeating the reward, and save/load preserves the claim.
* Made the information panel grow with its line count and constrain text to its width, so four-line travel plans and equipment pages no longer draw outside the frame.
* Added smoke coverage for board reachability/reward/reread, guide priority, travel memo hierarchy, destination progression, and persistence.

Next:

1. Manual check whether the longer optional line fits the travel memo panel at desktop and mobile-like widths.
2. Strengthen 陽冠都市 first-arrival services or Chapter 5 preparation payoff without adding duplicate shops.
3. Continue the scoped legacy frontier auto-purchase cleanup before changing frontier shop behavior again.

## Completed 2026-07-01: Moon Cavern decision and action-depth pass

Implemented:

* Added `月泉` beside the central Moon Cavern waterway as a one-time expedition resource.
  * Full HP/stamina recovery, status cleanse, short guard, 活力薬, and a return bell.
  * Travel memo and local guidance explicitly frame it as a use-now-or-save decision.
  * Its used state persists through the existing discovery save system.
* Upgraded `月門の護将` from a stat gate into a readable action encounter.
  * Alternates telegraphed triple piercing moon lances with three persistent moon-snare zones.
  * Existing frontal defense and half-HP reinforcements remain, with a small phase-two speed increase.
  * Moon Gatekeeper projectiles now count as magic/midboss damage so route counter-equipment applies consistently.
* First arrival at every remote safe base now fully restores HP as well as stamina and clears incoming projectiles; repeat visits still use normal recovery facilities.
* Strengthened the 月見砦 first-arrival message as the payoff for clearing Moon Cavern.
* Added smoke coverage for the Moon Spring recovery package, Gatekeeper telegraph/projectile sequence, and full first-arrival recovery.

Next:

1. Manual playtest 月影洞窟 without using the shrine, then with the shrine, and tune whether the choice is meaningful rather than mandatory.
2. Tune Moon Gatekeeper projectile damage/cooldown if the triple-lance and snare overlap leaves too little room for contact positioning.
3. Continue Chapter 3 main/optional guidance separation or strengthen 陽冠都市 first-arrival services after visual QA.

## Completed 2026-06-27: first safe-radius and field guidance pass

Implemented:

* Turned the existing grassland camp into Chapter 1's first explicit safe-radius breakthrough.
  * Added a safe zone, full-heal circle, unique NPC guidance, early equipment/supply shop, camp props, and a village return wagon.
  * Wagon travel unlocks only after the player reaches the camp on foot.
  * New-game objective, travel memo, and current-destination marker all trace the camp before later mandatory progression takes priority.
* Added a compact field objective compass for the current required destination, with direction and tile distance. It yields to nearby interaction prompts and disappears close to the target.
* Clarified all three exits of 陽冠都市 with reachable, rereadable signs and field markers:
  * East = main 日鏡塔 route.
  * West = optional 陽冠闘技場.
  * South = 陽光封印碑 and the final island expedition.
* Removed confirmed unreachable duplicate shield-purchase branches and the unreachable `chapter4cleared` stage branch.
* Extended smoke coverage for safe-base arrival, travel unlock, early shop contents, route UI, gate rewards, NPC placement, and reachability.

Next:

1. Manual playtest village -> grassland camp -> north forest and tune whether the first retreat/recovery lesson happens naturally.
2. Manual visual check the objective compass and Suncrest gate markers at desktop and mobile-like sizes; automated browser access was unavailable in this pass.
3. If Chapter 1 teaching reads well, tune Chapter 2 Moon Cavern combat pressure and Moon Gatekeeper balance from a fresh expedition.
4. Continue removing the large unreachable legacy frontier auto-purchase block before editing frontier shops again.

## Completed 2026-06-27: multi-chapter expedition decision pass

Implemented:

* Added `月門の護将` as the named final gate of 月影洞窟.
  * Strong frontal defense rewards side/back contact.
  * At half HP it calls a 月影 and shield soldier, changing target priority mid-fight.
  * 月洞印 and the east exit remain sealed until victory.
  * Defeat state persists, and existing saves that already own 月洞印 migrate as cleared.
* Split 黒門前哨 into two encounter identities without expanding the map:
  * 北道: shield-heavy, steadier main road.
  * 南道: trap/summoner-heavy, riskier shortcut.
  * Travel memo and local guidance explain the preparation difference.
* Added a 白銀宿 final-approach pressure region, reachable forward supply, and route sign.
  * Before first arrival, frost-beast density rises on the last stretch.
  * After arrival, the extra first-clear pressure is removed.
* Added a distinct pixel design for 月門の護将 and extended smoke coverage for progression locks, save migration, route pools, facing damage, and reachability.

Browser QA completed:

* New-game startup, world map, inventory, touch movement/attack/dash, desktop layout, and 390px-wide layout.
* No JavaScript console errors; only the expected browser audio-autoplay warning appeared.

Next:

1. Manually play 月影洞窟 from the west entrance and tune 月門の護将 HP/projectile/add pressure.
2. Manually compare 黒門北道 and南道 travel time, damage, and supply value.
3. Manually play 黒門砦南門 -> 白銀宿 and tune whether the final frost pressure feels tense rather than crowded.
4. If these routes are sound, return to Chapter 1 first-five-minutes teaching or Chapter 5 city-exit readability.

## Completed 2026-06-27: Chapter 2 Moon Cavern pressure tuning pass

Implemented:

* Added a reachable 月影洞窟出口補給 cache and exit note before the 月見砦 portal.
* Added `moonCavernExitSupply` so a depleted player can choose to push through the final stretch instead of automatically retreating.
* Updated Chapter 2 travel memo and local guidance to name both 中継補給 and 出口補給 before the 月洞印.
* Increased Moon Cavern local target density only before 月見砦 has been physically reached, making the first clear more tense while repeat travel is calmer.
* Extended smoke coverage for reachability, travel memo, and the new supply reward.

Next:

1. Browser/manual playtest 灰道の宿場 -> 月影廃墟 -> 月影洞窟 -> 月見砦 to confirm pressure and retreat timing.
2. If 月影洞窟 still feels flat, add one named gate encounter or clearer fork rather than increasing length.
3. Continue checking Chapter 5 route readability and Suncrest exits in browser/manual QA.

## Completed 2026-06-27: Chapter 5 Suncrest approach tension pass

Implemented:

* Added a reachable 陽冠都市前哨 supply cache and approach sign between 日輪砲台守 and 陽冠都市.
* Added `suncrestApproachSupply` and `suncrestApproachHint` rewards so a depleted player can decide whether to push onward to the city.
* Added late 日出高原 spawn pressure: at the Chapter 5 level gate, the highland pool can include 閃光走者 and 光柱鏡, and city-unreached highland routes target slightly higher local density.
* Extended smoke coverage for reachability, reward behavior, discovery reward behavior, and late highland spawn composition.

Next:

1. Browser/manual playtest 黎明港 -> 日輪砲台守 -> 陽冠都市 to confirm the final approach feels tense but fair.
2. Browser/manual check the whole-world map while advancing through Chapter 5 stages.
3. Browser/manual check 陽冠都市 east/west/south exits against the current marker sequence.
4. If Chapter 5 feels readable and tense enough, continue Chapter 2 月影洞窟 manual pressure tuning.

## Completed 2026-06-27: Chapter 5 full-route world-map marker pass

Implemented:

* Extended the whole-world current-destination marker beyond 日輪砲台守 so it now follows the full Chapter 5 main route:
  * 陽冠都市 after 日輪砲台守.
  * 日鏡塔守主 after first Suncrest arrival.
  * 反射水晶 after 日鏡塔守主.
  * 陽光封印碑 after 反射水晶.
  * 熾火聖域補給箱 after 陽光封印碑.
  * 熾火天竜 after final supplies.
* Kept optional 陽冠闘技場 out of the main current-destination sequence.
* Added smoke coverage for every Chapter 5 map-marker stage.

## Completed 2026-06-26: Pass 8 Chapter 4 arrival and role clarity

Implemented:

* Strengthened 白銀宿 first-arrival text so it reads as a hard-earned warm safe base after the frost frontier.
* Reworked Chapter 4 travel memo into a main-route plan:
  * before first arrival: 黒門砦南門 -> 霜原 -> 白銀宿.
  * after arrival: 白銀宿 -> 東の氷窟 -> 霜心の護符.
  * after 氷窟巨人: 氷窟 -> 霜冠城封印碑 -> 霜冠竜.
* Kept 霜見塔 visible as optional movement/reward content instead of a mandatory route.
* Added current-world-map destination markers for 白銀宿, 氷窟巨人, 霜冠封印碑, and 霜冠竜.
* Reordered Frost Haven guide dialogue so mandatory seal guidance appears before optional tower advice.
* Extended smoke coverage for Chapter 4 objective text, memo priority, and destination-marker progression.

Next:

1. Browser/manual playtest the 黒門砦南門 -> 霜原 -> 白銀宿 route for whether first arrival feels earned.
2. Tune enemy pressure or add a final-approach supply/sign only if the route feels too easy or too unclear.
3. Continue with Pass 4 street-to-street expedition tension review or Pass 2 Chapter 5 guidance polish, depending on playtest findings.

## Completed 2026-06-26: Immediate boss cleanup and rereadable field guidance fix

Implemented:

* Added same-update cleanup for defeated boss/midboss encounter types so duplicate live bosses cannot remain at full HP after the player kills one.
* Changed discovered field guidance points so they remain interactable after first discovery.
* Rereading a discovered guide/sign/seal now shows guidance text again without granting gold/items a second time.
* Extended smoke coverage for duplicate Red Dragon and Ember Dragon cleanup plus discovery reread/no-repeat-reward behavior.

Next:

1. Browser/manual check defeated boss sites immediately after kill to confirm no full-HP duplicate remains visible.
2. Browser/manual check field guide readability, especially route signs and required seal stones.
3. Continue with Pass 8: 逋ｽ驫螳ｿ arrival and Chapter 4 role clarity, unless another progression-breaking bug is found.

## Completed 2026-06-26: Boss persistence and earned wagon travel fix

Implemented:

* Fixed base wagon travel so destinations require both story unlock and first physical arrival, preventing travel to towns the player has never reached.
* Normalized save/load restoration so spawned story encounters are never restored as active after reload; defeated bosses and midbosses stay defeated instead of returning as spawned encounters.
* Added cleanup for defeated story encounters during story event updates, removing stale defeated boss bodies and clearing their spawned flags.
* Added explicit Red Dragon cave handling so a defeated Red Dragon cannot be recreated by cave interaction.
* Extended smoke coverage for unvisited wagon destinations, arrived-base travel, defeated boss cleanup, and save/load spawned-flag migration.

Next:

1. Manual/browser check wagon menus from each base to confirm the reduced destination list feels clear.
2. Manual check several defeated boss sites after save/load, especially Red Dragon, Ember Dragon, and Chapter 5 midbosses.
3. Continue with Pass 8: 逋ｽ驫螳ｿ arrival and Chapter 4 role clarity, unless another progression-breaking bug is found.

## Completed 2026-06-26: Pass 1 required route readability micro-pass

Implemented:

* Revised required-route objective/guidance for Chapter 1 竜洞 and Chapter 5 日輪砲台守 so each route names a landmark, not only the boss.
* Added two 竜洞 breadcrumb discoveries near the north-east scorched rock route and two 日輪砲台守 breadcrumb discoveries on the burned highland approach.
* Added discovery rewards/messages that reinforce route preparation with small ward/tonic support.
* Added a current-required-destination marker to the whole-world map for 竜洞 and 日輪砲台守.
* Reworked Chapter 5 travel memo lines into 本線 / 今 / 準備 / 任意 phases and made 陽冠闘技場 appear below the main 日鏡塔 route.
* Updated Suncrest and Dawn Harbor guide dialogue so main-route guidance comes before optional arena advice.
* Extended smoke coverage for route text, destination map markers, travel memo priority, breadcrumb rewards, and reachability.

Next:

1. Manual/browser route-readability check for 竜洞 and 日輪砲台守.
2. If readability is acceptable, move to Pass 5: Chapter 2 attrition dungeon prototype.
3. Then review Pass 4 street-to-street expedition tension for routes that still feel too short.

## Completed 2026-06-26: Pass 3 safe-base arrival payoff system

Implemented:

* Added persistent first-arrival tracking for major safe bases.
* Added one-time safe-radius expansion messages for remote camps, towns, ports, and Chapter 5 髯ｽ蜀驛ｽ蟶・
* On first arrival, the base clears incoming projectiles, refills stamina, and grants a short guard/invulnerability buffer so the player feels immediate relief.
* Save/load/reset now preserve first-arrival state and never repeat already-seen arrival payoffs.
* Extended smoke coverage for first-arrival recording, repeated-visit suppression, stamina refill, projectile clearing, and save/load persistence.

Next:

1. Manual/browser check that the arrival ring/message reads well in actual play.
2. Tune which safe bases deserve stronger bespoke text after playtest.
3. Proceed to Pass 5: Chapter 2 attrition dungeon prototype, because 譛郁ｦ狗ｦ still needs a more hard-earned approach.

## Completed 2026-06-26: Pass 5 Chapter 2 attrition dungeon prototype

Implemented:

* Added 月影洞窟 as a required embedded interior between 月影廃墟 and 月見砦.
* Added west/east portals so the player can enter from 月影廃墟, retreat, or push through to 月見砦.
* Added local `moonCavern` spawn handling so dungeon monsters are not starved by exterior enemies.
* Added mid-route supply, 月洞印 reliquary reward, and two 月影洞窟 discovery hints.
* Made 月洞印 required before 月の書庫の番人 can spawn, turning the route into progression rather than optional cleanup.
* Updated objective text, field guidance, travel memo, zone name, and whole-world destination marker for the new route.
* Regenerated world map previews and extended smoke coverage for reachability, portal travel, local spawns, rewards, progression gating, and world-map markers.

Next:

1. Manual/browser playtest from 灰道の宿場 through 月影洞窟 to 月見砦.
2. Tune enemy density, trap timing, and reward strength if the route is too punishing or too flat.
3. Move to Pass 4 street-to-street expedition tension review, especially 黒市都 -> 黒門砦 or 霜原 -> 白銀宿.

## Completed 2026-06-26: Pass 4 Chapter 3 Black Gate approach pass

Implemented:

* Added 黒門前哨 route signs and forward supply caches between 黒市都 and 黒門砦.
* Added `blackGateSupply` and `blackGateHint` rewards to support the continue/retreat decision on the way to 黒門砦.
* Added small visual route landmarks around the Black Gate approach without expanding world size.
* Added a `blackFortRoute` stage so Chapter 3 starts by routing the player from 黒市東門 through 黒門前哨 to 黒門砦 before 黒陽碑 / 黒曜洞 / optional dungeons.
* Updated Chapter 3 travel memo to show 本線 first and list 地下墓所 / 密輸道 / 再生洞窟 as optional.
* Added whole-world destination markers for 黒門砦 and then 黒陽碑.
* Extended smoke coverage for reachability, reward/discovery behavior, travel memo priority, and destination markers.

Next:

1. Manual/browser playtest the 黒市都 -> 黒門砦 approach for enemy pressure and whether the two route options feel distinct.
2. If Chapter 3 readability is acceptable, move to Pass 8: 白銀宿 arrival and Chapter 4 role clarity.
3. If Chapter 3 still feels confusing, add one Black Market guide line or sign that explicitly names 本線 vs 任意.

## Pass 1: required route readability micro-pass

### Goal

Mandatory route targets should be found by breadcrumbs, not coordinate guessing.

Difficulty should come from surviving the route, not figuring out where the required boss or cave is.

### Initial targets

1. Chapter 5: 日輪砲台守.
2. Chapter 1: Red Dragon / 竜洞.

### Tasks

* Revise objective text:
  * `目的: 黎明港から北東高原の日輪砲台へ`.
  * `目的: 北東の岩山にある竜洞へ向かう`.
* Add or revise guidance/NPC lines so one nearby source repeats the same route.
* Add field sign/discovery breadcrumbs.
  * 日輪砲台守: scorched road, light pillar, artillery sound, warning marker, broken solar sign, or guide discovery.
  * 竜洞: heat, cave wind, burned stones, dragon roar, or old sign.
* Add a current-required-destination marker to the world map if implementation cost is reasonable.
* Confirm that the targets can be found without coordinate knowledge.

### Acceptance criteria

* A player can explain where to go next from objective text + one in-world hint.
* The world map or field landmark confirms the direction.
* Required target discovery feels like route reading, not blind searching.
* Hidden optional content remains allowed to be vague.

### Not in scope

* Do not rebalance all of Chapter 5 in this pass.
* Do not add a new region.
* Do not change world size.

---

## Pass 2: Chapter 5 guidance polish

### Goal

Make Chapter 5 feel like one expedition:

```text
黎明港 -> 日輪砲台守 -> 陽冠都市 -> 日鏡塔 -> 熾火群島
```

Not a scattered checklist.

### Problems

* 日輪砲台守 location can be unclear.
* Optional 陽冠闘技場 can appear above the main 日鏡塔 route in guidance.
* Travel memo does not yet present a Chapter 5 expedition plan.
* 陽冠都市 arrival can feel like a shop stop rather than reaching civilization after hostile terrain.

### Tasks

* Fix guidance priority:
  1. Main route.
  2. Survival/preparation hint.
  3. Optional arena note.
* Add Chapter 5 travel memo lines:
  * 本線: 黎明港 -> 日輪砲台守 -> 陽冠都市 -> 日鏡塔 -> 熾火群島.
  * 今: current objective.
  * 準備: 光圧対策装備, 霊薬, 帰還鈴.
  * 任意: 陽冠闘技場.
* Ensure 陽冠闘技場 is always described as optional unless the player is physically in the arena.
* Add first-arrival message for 陽冠都市.
* Browser-check Suncrest east gate / west plaza / south gate readability.

### Acceptance criteria

* In Suncrest, the player sees the main route before optional arena advice.
* Optional arena remains appealing but not confusingly mandatory.
* 日輪砲台守 can be found from route text and landmarks.
* The route from 黎明港 to 陽冠都市 feels like surviving a hostile continent.

---

## Pass 3: safe-base arrival payoff system

### Goal

New bases should feel like relief and progress.

A safe base should not feel like merely stepping onto another coordinate.

### Tasks

* Add first-arrival messages for major bases.
* Track first arrival persistently where needed.
* Start with only the most important bases to avoid save churn:
  1. 前線キャンプ or first remote safety anchor.
  2. 月見砦.
  3. 白銀宿.
  4. 陽冠都市.
* On first arrival, clear immediate danger if appropriate and communicate safe-radius expansion.
* Ensure repeated visits do not spam the message.

### Acceptance criteria

* First arrival at a new required base produces a clear emotional payoff.
* The message communicates that future travel/preparation has changed.
* The player understands the base is safe and useful.
* Save/load preserves first-arrival state.

---

## Pass 4: street-to-street expedition tension review

### Goal

Town-to-town routes should create “continue or retreat?” decisions.

### Initial route targets

1. 黎明港 -> 日輪砲台守 -> 陽冠都市.
2. 灰道の宿場 -> 月見砦.
3. Village -> first remote safety / Dragon Cave route.
4. 黒市都 -> 黒門砦.
5. 霜原 -> 白銀宿.

### Tasks

* Review whether each route creates resource pressure.
* Add final-approach danger where a base is visible but not free.
* Add mid-route supplies that create continue/retreat decisions.
* Avoid empty walking distance.
* Prefer local enemy pressure and route choices over simply increasing map size.

### Acceptance criteria

* The player has usually taken damage or consumed resources before first arrival.
* The final approach is readable and tense.
* Reaching the base changes future travel or preparation.

---

## Pass 5: Chapter 2 attrition dungeon prototype

### Goal

Make Chapter 2 feel like a real expedition, not a short chain of nearby checks.

### Implemented prototype

`月影洞窟` is now a required attrition route before 月見砦.

Proposed route:

```text
灰道の宿場
↓
古塔 / 灰騎士
↓
月影廃墟
↓
月影洞窟
  - moon enemy pressure
  - summons / traps
  - mid-route supply
  - route choice or shortcut
  - named guardian or gate
↓
月見砦 first-arrival safe-radius message
↓
月の書庫
↓
月蝕城
```

### Implementation approach

Stage safely:

1. Start with one long hand-authored interior using the current embedded-map approach if that is lower-risk.
2. If the play improvement is confirmed, consider separate map files such as `moon_cavern.js`.
3. Preserve non-module script loading and `globalThis.DRAGON_HUNTER_*`.
4. Do not start Vite, ES Modules, bundling, or architecture migration.
5. If separate maps become persistent, add `currentMapId` save/load migration.
6. Verify portal transitions, reachability, spawn locality, return-bell behavior, and map preview behavior.

### Dungeon quality rules

* Not a box maze.
* Not a long empty corridor.
* At least one meaningful fork or routing decision.
* At least one mid-route supply/shortcut decision.
* Local spawn pressure should not be stolen by exterior enemies.
* Retreat should be viable.
* A second attempt should feel easier because of route knowledge or preparation.

### Acceptance criteria

* 月見砦 feels like a hard-earned base.
* The route supports retreat and second-attempt progress.
* The added route makes Chapter 2 feel longer without becoming tedious.
* 月の書庫 feels like a deeper follow-up, not the only source of Chapter 2 volume.

---

## Pass 6: first 5 minutes / Chapter 1 teaching pass

### Goal

Chapter 1 should teach the game’s rules:

* Village is safe.
* Outside hurts.
* Retreat is correct.
* Equipment visibly expands survivable range.
* Required route targets can be traced through guidance.

### Tasks

* Improve Red Dragon / 竜洞 breadcrumbs.
* Add simple signs or discoveries that teach route reading.
* Add first-arrival safe-radius message for the first remote camp/base.
* Keep the chapter compact; do not overbuild it.

### Acceptance criteria

* A new player understands the loop before Chapter 2.
* Dragon Cave is findable without coordinate knowledge.
* The player learns that safe-base expansion is the game’s main reward pattern.

---

## Pass 7: Chapter 3 clarity pass

### Goal

Separate main route and optional content in a content-rich chapter.

### Current issue

Chapter 3 has many valid activities:

* 黒曜洞 / 黒曜巨人.
* 黒門砦.
* 黒陽城.
* 黒市地下墓所.
* 密輸道.
* 再生洞窟.
* 霧灯の祠.

This volume is good, but the player should not lose the main route.

### Tasks

* Travel memo:
  * 本線: 黒曜洞 -> 黒門砦 -> 黒陽城.
  * 任意: 地下墓所 / 密輸道 / 再生洞窟 / 霧灯の祠.
* Review Black Market City guide lines.
* Consider a compact 黒門関所 / 影道 route only if 黒市都 -> 黒門砦 feels too short.

### Acceptance criteria

* The player knows what is required and what is optional.
* Optional content remains attractive because of rewards, not because guidance is confusing.

---

## Pass 8: Chapter 4 arrival and role clarity pass

### Goal

Improve the frozen-frontier arrival feeling without overbuilding a chapter that already has a solid structure.

### Tasks

* Strengthen 白銀宿 first-arrival payoff.
* Clarify in travel memo:
  * 本線: 氷窟 -> 霜冠城.
  * 任意: 霜見塔.
* Add route pressure or final-approach danger only if playtest shows 白銀宿 is too easy to reach.

### Acceptance criteria

* 白銀宿 feels like shelter in a hostile frozen frontier.
* 氷窟 and 霜見塔 roles are clear.
* The chapter is not bloated unnecessarily.

---

## Pass 9: low-risk cleanup

### Goal

Remove misleading code paths before more AI-assisted editing.

### Tasks

* Remove duplicated unreachable `shield` branches in shop confirmation if confirmed.
* Remove legacy unreachable frontier auto-purchase logic after shop return if confirmed.
* Clean up unreachable or inconsistent stage names such as `chapter4cleared` if confirmed.
* Keep the cleanup scoped. Do not migrate architecture.

### Acceptance criteria

* Shop responsibility is clear: shop buys/services, inventory equips.
* Stage names are reachable or removed.
* No gameplay behavior regresses.
* Syntax checks and smoke test pass.

---

# Later: new content candidates

## A. 蒼風島 regional arc

Good candidate after current route/readability work.

Reason:

* Geography, port, fort, ferry, and regional identity already exist.
* It can become a full regional expedition with less waste than another world expansion.

Possible future additions:

* Local named midboss.
* One interior dungeon.
* Lighthouse / ridge / south-cape route climax.
* Region-specific reward.

Do not prioritize this before route readability, Chapter 5 guidance, safe-base arrival payoff, and Chapter 2 attrition volume.

## B. Black Market City service/activity expansion

Possible later direction if Chapter 3 still lacks hub identity.

Add only if the service changes route preparation or play choices. Avoid duplicated shops.

## C. Additional city activities

Use only when they create play, preparation, or route planning.

Good: arena, escort, contract board, specialist upgrade, timed supply run.

Weak: more NPCs saying similar lines or shops selling the same items.

---

# Verification targets

For the next implementation pass, run as much as possible:

1. JavaScript syntax checks for changed files.
2. `scripts/verify-game-smoke.js`.
3. `git diff --check`.
4. Reachability checks if terrain/object placement changed.
5. Save/load migration checks if first-arrival flags or separate maps are added.
6. Browser desktop/mobile QA if possible.
7. Manual checks:
   * Can a fresh player find 竜洞?
   * Can a Chapter 5 player find 日輪砲台守?
   * Does Suncrest show main route before optional arena?
   * Does first arrival at a new base feel like progress?
   * If 月影洞窟 is added, can the player retreat and push deeper on a second attempt?

---

# Immediate recommended first implementation package

Start with a small, high-confidence package before the larger Chapter 2 dungeon:

1. Update objective/guidance text for 日輪砲台守 and 竜洞.
2. Add one breadcrumb discovery/sign for each.
3. Fix Chapter 5 guidance priority so 日鏡塔/本線 appears before optional arena.
4. Add Chapter 5 travel memo lines.
5. Add first-arrival message support for 陽冠都市 and one early base.
6. Run syntax + smoke + manual route-readability check.

Then move to the Chapter 2 attrition dungeon prototype.
