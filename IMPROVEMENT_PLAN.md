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
* Some town-to-town routes are short or low-pressure enough that a new safe base does not feel like a breakthrough.
* Chapter 2 can still feel short; 灰道の宿場 -> 月見砦 is the strongest candidate for an added attrition route.
* Chapter 5 has strong content but can read like a checklist if route guidance, travel memo, and map support are not unified.
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

### Candidate

Add `月影洞窟` or `月下坑道` as a required attrition route before 月見砦.

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
