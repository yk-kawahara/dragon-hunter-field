# GAME_DESIGN_NOTES.md

Design truth for the RPG. Use this file to decide **what belongs in the game**.

## Core thesis

The core fun is **survival-range expansion**, not simply completing quests.

At the start, the player should feel safe only near the village. Enemy contact damage should matter. As the player earns gold, buys equipment, levels up, finds rewards, opens shortcuts, and unlocks safe bases, old danger should become manageable.

Target feelings:

* “This enemy used to hurt, but now I can handle it.”
* “I can stay outside longer than before.”
* “I can finally reach that farther area.”
* “Buying better equipment made a visible difference.”
* “I barely made it to the new base.”
* “This new base moved my safe radius outward.”

The strongest emotional beat is not only defeating a boss. It is reaching a new safe place with low resources and realizing the map has become less hostile from that point onward.

## Core loop

1. Leave a safe base.
2. Fight nearby enemies.
3. Take meaningful damage.
4. Return before risk becomes fatal.
5. Recover, restock, and improve equipment.
6. Revisit the same area and feel stronger.
7. Push farther into a more dangerous route.
8. Find a reward, shortcut, dungeon, town, or boss route.
9. Reach a new safe base or unlock a better route.
10. Repeat across a larger world.

## Game identity

Old mobile-style contact-combat action RPG.

Not a button-mashing combo action game.

Core mechanics:

* Enemies roam the field.
* The player moves through compact tile-based maps.
* Contact with enemies creates combat pressure.
* Damage depends on facing, contact direction, equipment, shields, and positioning.
* The village and later safe bases provide relief.
* Growth comes from levels, gold, equipment, items, accessories, route knowledge, and exploration rewards.
* The Red Dragon route is the Chapter 1 endpoint, not the final world endpoint.

## Current design truth from analysis and playtest

The current foundation is strong: Chapters 1-5, shops, safe bases, equipment, shields, accessories, quick slots, NPC guidance, world map, and multiple dungeons exist.

The next quality jump should not be another empty world expansion. The current priority is to make existing chapters feel like **earned expeditions**:

* Required destinations must be readable.
* New bases must feel like hard-earned relief.
* Street-to-street travel should create resource pressure.
* Optional content must not override main-route guidance.
* Chapter 2 needs more sustained expedition volume.
* Chapter 5 needs clearer route guidance and less checklist feeling.

## 2026-07-02 post-expedition audit

Several former structural risks are now implemented rather than merely planned:

* Chapter 1 has a first remote camp, a pressured Dragon Cave approach, and a two-pattern Red Dragon.
* Chapter 2 has Moon Cavern attrition, a named gatekeeper, a one-use spring, Moon Camp arrival payoff, and an action-focused Moon Archive climax.
* Chapter 3 keeps required progression above its many optional routes.
* Chapter 4 distinguishes required Ice Cave preparation from optional Frost Watchtower content, and Ice Cave now has a resource decision plus a multi-phase giant.
* Chapter 5 traces its full main route and Suncrest provides route-specific preparation.

The audit identified **underused existing geography**, not missing world size, as the largest code-visible content gap. 蒼風島 was selected for the first response because it already had ports, roads, ridges, a lighthouse, caches, and a southern outpost. Its lighthouse arc is now implemented; manual route-pressure tuning and selective deepening should follow while Chapter 4's main route remains first in guidance.

## Required route readability

Required bosses, required midbosses, required dungeon entrances, required seals, and required route unlocks should be discoverable by route breadcrumbs.

Required targets should be **traced**, not guessed.

Rules:

* Objective text should name the route and landmark.
* At least one nearby guide, resident, sign, discovery, or field clue should point toward the target.
* The field should include a visible cue: road, ruin, scorched path, light pillar, cave wind, warning sign, military remains, shrine stone, or similar.
* The world map should be able to mark the current required destination when the route text is not enough.
* Hidden optional content can remain vague. Required progress should not depend on blind searching.

Initial priority targets:

* Chapter 1: 竜洞 / Red Dragon.
* Chapter 5: 日輪砲台守.

Implemented route-readability support:

* 竜洞 now has objective text naming the north-east rock landmark, scorched field breadcrumbs, elder guidance, and a whole-world map required-destination marker once the player has the seal and scales.
* 日輪砲台守 now has objective text naming the 黎明港 -> 北東高原 route, burned highland breadcrumbs, Dawn/Suncrest guide lines, Chapter 5 travel memo support, and a whole-world map required-destination marker.
* The 日輪砲台守 -> 陽冠都市 final approach now has a reachable forward supply and approach sign so the city arrival is preceded by a small continue/retreat decision instead of empty walking.

## Safe-base arrival and expedition tension

A new safe base is a reward.

A required base should ideally feel like:

> I was not sure I could make it, but now this place is mine.

Design rules:

* The player should usually arrive after visible resource pressure.
* The final approach should show the base before it is fully safe.
* The last stretch may contain danger, but it must remain readable and fair.
* First arrival should trigger a clear safe-radius expansion message.
* The base should change future travel or preparation: recovery, shop, travel point, shortcut, local guide, route supplies, or new equipment access.

Avoid creating tension through empty distance. Use enemy pressure, route shape, supplies, discoveries, retreat decisions, and landmarks.

Implemented safe-base payoff support:

* Major safe bases now persist first-arrival state across save/load.
* The first visit to a remote base shows a safe-radius expansion message, clears immediate incoming projectiles, refills stamina, and gives a short guard/invulnerability buffer.
* Repeat visits should stay quiet; the base's normal healing, shops, travel, and NPC guidance carry the ongoing value.
* Manual/browser playtest should still tune whether the arrival text and ring timing feel strong enough during actual expeditions.

## Street-to-street attrition route pattern

Town-to-town routes are often where this game can become most exciting.

Good pattern:

```text
Safe base A
↓
known danger
↓
resource-draining route or dungeon
↓
mid-route supply / shortcut / decision
↓
final approach where base B is visible but not free
↓
Safe base B first-arrival payoff
```

A good attrition route should include:

* An identifiable entrance.
* Early retreat possibility.
* Mid-route pressure and resource decisions.
* Local enemy behavior.
* A supply or discovery that affects the continue/retreat decision.
* Optional fork when space allows: safer/longer vs risky/shorter.
* Persistent change after success: new base, shortcut, travel point, or route reward.

A required attrition dungeon should not demand perfect first-clear. It is good if the player retreats once, buys better gear, and pushes deeper next time.

## Main route vs optional content

Optional content should be attractive because the reward is useful, not because guidance makes it look mandatory.

UI and guidance priority:

1. Main route objective.
2. Survival hint for the current area.
3. Required preparation.
4. Optional activity or side dungeon.
5. Treasure / rumor cleanup.

The travel memo should usually present:

```text
本線: ...
今: ...
準備: ...
任意: ...
```

This is especially important in Chapter 3 and Chapter 5.

## Equipment and reward design

Equipment should expand survivable range or change route decisions.

Good rewards:

* Let the player survive an area that was previously too dangerous.
* Make a route shorter, safer, or more profitable.
* Change combat tempo or movement.
* Make an optional challenge feel worth doing.
* Create a meaningful choice between defense, sustain, movement, and aggression.

Weak rewards:

* Pure number increases with no route meaning.
* Rewards that arrive after the route they counter is already irrelevant.
* One-time rewards that are easy to miss but required for progress without clear hints.

## Weapon sidegrade design

Weapons should not be a simple ladder where every older weapon is dead after the next purchase.

Each weapon should communicate:

* Attack feel: speed, reach, width, lunge, or heavy impact.
* Combat role: frontal poke, crowd clear, back attack, shield breaking, caster hunting, route counter, or boss preparation.
* Survival-range value: which route or enemy it makes safer.

Current first-pass implementation:

* Weapon inventory/shop rows show role text in addition to raw ATK comparison.
* Early weapons now have situational combat bonuses:
  * たけやり rewards lining up a quick frontal thrust against charging enemies.
  * 粘土の剣 is a wide crowd/trap clearer.
  * 木刀 rewards fast back attacks against casters and summoners.
* Later sidegrades have clearer matchups:
  * 星見の杖 now remains useful against mist/lighthouse ranged enemies.
  * 黒曜の槌 has a shield-breaking role against shield soldiers and heavy guards.

Desired tuning target:

> A lower-ATK weapon can still be the correct choice for a specific route if its reach, speed, arc, or enemy matchup keeps the player safer.

## Chapter 1 role: village, north forest, and Red Dragon

Chapter 1 teaches the game grammar.

The player should learn:

* The village is safe.
* Outside hurts.
* Retreat is correct.
* Gold and equipment matter.
* Landmarks and NPC hints point to required destinations.
* A required boss is not hidden content.

Current issue:

* Red Dragon / 竜洞 can be missed if the player does not notice the entrance or map marker.

Desired improvement:

* 草原野営地 is now the first explicit survival-range breakthrough outside the village: recovery, early supplies, local route guidance, and return wagon access unlock only after physical arrival.
* New-game objective text, travel memo, and the field objective compass all trace the village east gate -> grassland camp route before later mandatory targets take priority.
* Objective and NPC text now point to the north-east rock/cave landmark.
* Field breadcrumbs now use heat, scorched stones, and an old sign to lead toward 竜洞.
* 竜洞前の焦げ道 is now a distinct pressure region populated by 小竜 and 火霊. It becomes slightly denser after the North Forest Guardian falls and remains a short final expedition rather than empty approach walking.
* A one-time 竜狩人の前進補給 provides medicine, wards, and a return bell. The player chooses whether to push into the cave or retreat and convert earned gold into better equipment.
* 赤竜 alternates a telegraphed three-volley breath with three persistent fire pools. The first major boss now teaches lateral evasion, safe-floor reading, and side/back contact instead of relying on levels alone.
* Keep Chapter 1 compact; do not overbuild it.
* First remote base/camp arrival should demonstrate “safe radius expanded.”

## Chapter 2 role: moonlit expedition and missing attrition volume

Chapter 2 begins after the Red Dragon report. It should feel like the first real journey away from the original village.

Current structure:

```text
灰道の宿場
↓
古塔 / 灰騎士
↓
月影廃墟
↓
月見砦
↓
月の書庫 / 月書庫の番人
↓
月蝕城
↓
月蝕竜
```

Current issue:

* A first implementation of 月影洞窟 now sits between 月影廃墟 and 月見砦, so the chapter has a real attrition route before the next safe base.
* 月影洞窟 now has both mid-route and exit-route supplies, plus higher first-clear local pressure before 月見砦 is physically reached.
* 中央水路の `月泉` は一度だけHP・スタミナ・状態異常を立て直し、帰還札を与える。今使って護将へ進むか、温存して撤退するかをプレイヤーが選ぶ。
* 月影洞窟の最終区画には名付き関門 `月門の護将` が立ち、正面防御・月影/盾兵の増援・予告付き三連月槍・足場を塞ぐ月影陣で、接触方向と回避を問う。
* 月洞印と東出口は護将撃破まで閉ざされるため、月見砦への初到達は関門突破を伴う安全圏拡大になった。
* 月見砦 should still be manually tuned in browser play to confirm it feels like a hard-earned safe base, not simply the next nearby stop.
* 月の書庫 adds volume, but it can read like an extra checklist step if the route before 月見砦 is not memorable.

The Moon Archive climax now has its own action identity:

* `月書庫の番人` alternates three volleys of four-way piercing quills with four persistent corner seals.
* Quill warnings teach the player to stand between lanes; corner seals create a readable choice between the center and outer edge.
* Below half HP, a summoner and Moon Shade enter while the pattern interval shortens, forcing target-priority decisions before the reliquary reward.
* The travel memo and archive record teach the same counterplay before the player commits to the fight.

Implemented route:

```text
灰道の宿場
↓
古塔 / 灰騎士
↓
月影廃墟
↓
月影洞窟
  - local moon pressure
  - summons / shield soldiers / traps
  - mid-route and exit-route supplies
  - 月泉: 一度限りの全快と帰還判断
  - 月門の護将: 正面が硬く、増援・三連月槍・月影陣を使う名付き関門
  - 月洞印 reward
↓
月見砦 first-arrival safe-radius payoff
↓
月の書庫
↓
月蝕城
```

Desired tuning target:

```text
灰道の宿場
↓
古塔 / 灰騎士
↓
月影廃墟
↓
月影洞窟 or 月下坑道
  - moon pressure
  - summons / traps
  - mid-route supply
  - route choice or shortcut
  - named guardian or gate
↓
月見砦 first-arrival safe-radius payoff
↓
月の書庫
↓
月蝕城
```

Intended feeling:

> The old tower was only the beginning. I had to cross a dangerous moonlit route to make 月見砦 my new base.

## Chapter 3 role: black routes, market city, and side-route clarity

Chapter 3 is content-rich and can support several optional routes.

Core required route should read as:

```text
黒市都 / 黒門方面
↓
黒曜洞 / 黒曜巨人
↓
黒門砦
↓
黒陽城
↓
黒陽竜
```

Optional or side content includes:

* 黒市地下墓所.
* 密輸道.
* 再生洞窟.
* 霧灯の祠.

Current issue:

* The amount of content is good; the main route now stays visible while side dungeons are explicitly labeled optional.
* A first Black Gate approach pass now makes 黒市都 -> 黒門砦 read as the main Chapter 3 push before optional cleanup.
* 黒門前哨は北の盾兵本道と南の罠近道で敵構成が分かれ、同じ区間でも準備と接触の仕方を選べる。
* 黒市の遠征掲示板、旅メモ、案内人、世界地図マーカーは、黒門砦 -> 黒陽碑 -> 黒曜巨人 -> 黒陽竜の必須順を共有する。
* 地下墓所・密輸道・再生洞窟・霧灯の祠は、報酬を明記した任意ルートとして表示される。

Desired improvement:

* Preserve the shared 本線 / 任意 hierarchy when adding future Chapter 3 content.
* The Black Gate approach should create a small continue/retreat decision through route signs, forward supplies, and shield/trap pressure.
* Black Market City should function as a hub for preparation and rumors, not just a large safe zone.
* If 黒市都 -> 黒門砦 feels too short, consider a compact 黒門関所 / 影道 route.

## Chapter 4 role: frozen frontier and route preparation

Chapter 4 is structurally solid.

Core route:

```text
黒陽城後
↓
霜原
↓
白銀宿
↓
氷窟 / 氷窟巨人 / 霜心の護符
↓
霜冠城
↓
霜冠竜
```

Optional route:

* 霜見塔: movement-focused optional dungeon with Sky Emblem and shortcut value.

Current issue:

* 白銀宿 now has stronger first-arrival payoff text, but the route still needs manual playtest to confirm it feels hard-earned.
* 氷窟 and 霜見塔 are now distinguished in travel memo, guide dialogue, and world-map markers: 氷窟 is main-route preparation, 霜見塔 is optional movement/reward content.

The required Ice Cave now has a complete preparation encounter:

* `氷窟の暖炉` is a one-use partial recovery point before the giant. It restores some HP, all stamina, clears cold pressure, and grants a return bell without erasing the route's accumulated damage.
* The player may preserve the brazier for a deeper attempt, consume it before the boss, or use its return bell to retreat and improve equipment.
* `氷窟巨人` alternates three piercing shard lanes with three persistent quake zones. The safe response is repeated in travel memo and local guidance.
* Below half HP, two frost beacons activate and drain movement/stamina until destroyed, creating a clear target-priority phase before the Frost Heart reward.

Desired improvement:

* If playtest shows the 白銀宿 approach is too easy, strengthen the cold-route pressure with a small final-approach danger or supply decision.
* 白銀宿東側の最終接近区間は、初到達前だけ凍獣圧が高まり、宿の灯の手前に前進補給がある。補給を使って押し切るか、退くかを選ぶ。
* Keep 霜見塔 optional but attractive.
* Preserve the map-marker sequence: 白銀宿 -> 氷窟巨人 -> 霜冠封印碑 -> 霜冠竜.

## Chapter 5 role: horizon-fire expedition

Chapter 5 has the strongest late-game structure and should feel like crossing into a hostile continent.

Core route:

```text
黎明港
↓
日出高原
↓
日輪砲台守
↓
陽冠都市
↓
日鏡塔 / 反射水晶
↓
陽光封印碑
↓
熾火聖域補給箱
↓
熾火群島
↓
熾火天竜
```

Optional city activity:

* 陽冠闘技場 / 陽冠闘士の徽章.

Current issues:

* 日輪砲台守 can be hard to locate.
* Optional 陽冠闘技場 can appear too prominent if guidance priority is wrong.
* Chapter 5 can become a checklist if UI and the world map do not present it as one expedition.
* 陽冠都市 should feel like reaching civilization after hostile terrain, not only a shop stop.

Desired improvement:

* Route breadcrumbs and current-objective world-map marker for 日輪砲台守 are now implemented.
* Main route now appears before optional arena advice in Suncrest/Dawn guidance and Chapter 5 travel memo.
* Chapter 5 travel memo lines now use 本線 / 今 / 準備 / 任意.
* The whole-world current-destination marker now follows the main chain from 陽冠都市 through 日鏡塔, 反射水晶, 陽光封印碑, 熾火聖域補給箱, and 熾火天竜.
* The highland approach after 日輪砲台守 now adds final-valley pressure and a forward cache before 陽冠都市, strengthening the feeling that the city is earned.
* Suncrest's three exits now carry distinct readable roles: east gate = main Sunspire route, west gate = optional arena, south gate = final seal/island expedition. Each sign remains rereadable after its one-time reward.
* 陽冠都市の初回到達は全回復と安全圏確保に加え、旅装ギルドの遠征別支度を新しい準備手段として案内する。
* 旅装ギルドは恒久装備の重複店ではなく、次の目的地に合わせた3分間の加護と補給を売る。
  * 日鏡塔支度: 光弾を軽減し、塔向けの活力薬・護符・帰還の鈴を補給する。
  * 闘技場支度: 側面・背後攻撃を強化し、正面接触を少し軽減する。
  * 熾火決戦支度: 反射水晶取得後に解禁され、火炎・光圧を軽減して最終遠征物資を補給する。
* 遠征支度は一度に1つだけ有効で、時間と残り効果は装備情報から確認できる。終盤ゴールドを恒久装備の購入後にも意味ある準備へ使わせる。
* Browser/manual-check the three gate markers and sign placement at real play scale.

Intended feeling:

> The highland was oppressive. The city made survival possible. The tower earned the final countermeasure. The southern islands are the final push.

## 蒼風島 role: optional Chapter 4 regional expedition

蒼風島 already has geography, ports, roads, and route identity.

Current role:

* Broadens the world laterally.
* Offers sea-crossing geography and additional safe anchors.
* Helps the world feel like continents and islands rather than a single corridor.
* Offers an optional Chapter 4 expedition from 蒼風港 to 蒼風灯台 without replacing the western 白銀宿 / 氷窟 main route.
* `蒼嵐の翼` tests long-line evasion, persistent-zone positioning, and add priority rather than only equipment numbers.
* The locked lighthouse reliquary grants `蒼風の羽飾り`, a two-slot accessory choice for movement, stamina, dash efficiency, and ranged/mist resistance.
* This reward is intended to make later long routes safer without trivializing contact damage from unrelated enemies.

Potential future additions:

* One compact interior dungeon or ridge fork if the harbor-to-lighthouse route remains too short in manual play.
* More local discoveries between the lighthouse, central ridge, and southern cape.
* A later south-cape climax only if it adds a new survival decision rather than another isolated boss.

## Area roles

| Area | Role |
|---|---|
| Village | Starting safe base: recovery, smith, supplies, elder guidance, clear safety boundary. |
| Grassland / Outskirts | First gold loop and retreat training. |
| North Forest | First serious survival gate and Guardian route. |
| Dragon Cave approach / 竜洞前焦土 | Short Chapter 1 final expedition with dragonling/fire-spirit pressure and a push-or-retreat supply cache. |
| Dragon Cave | Chapter 1 final boss space; Red Dragon teaches line evasion, persistent hazard avoidance, and side/back contact. |
| Southwest Frontier Camp | Early remote safety anchor; should demonstrate safe-radius expansion. |
| Ash Hamlet / 灰道の宿場 | Chapter 2 launch base. |
| Old Tower / 古塔 | Chapter 2 early danger pocket and Ash Knight step. |
| Moon Ruins / 月影廃墟 | Moon pressure and relic route. |
| Moon Cavern / 月影洞窟 | Required attrition route before 月見砦; local moon spawns, two supplies, and the frontal-guard/summon encounter 月門の護将 before 月洞印. |
| Moon Camp / 月見砦 | Chapter 2 safe base that should feel hard-earned. |
| Moon Archive / 月の書庫 | Deeper Chapter 2 interior after 月見砦. |
| Eclipse Castle / 月蝕城 | Chapter 2 final route and boss. |
| Black Market City / 黒市都 | Chapter 3 hub for main route and optional rumors. |
| Black Gate Approach / 黒門前哨 | Chapter 3 street-to-street attrition route: shield-heavy north main road vs trap/summoner south shortcut before 黒門砦. |
| Black Fort / 黒門砦 | Chapter 3 remote safety anchor before Black Sun pressure. |
| Black Sun Castle / 黒陽城 | Chapter 3 final danger route. |
| Frost Haven / 白銀宿 | Chapter 4 safe base; its first eastern approach adds frost-beast pressure and a final supply decision before relief. |
| Ice Cave / 氷窟 | Chapter 4 main preparation dungeon; one-use warming brazier, shard/quake Giant encounter, and Frost Heart survivability reward. |
| Frost Watchtower / 霜見塔 | Optional Chapter 4 movement/reward dungeon. |
| Bluewind Harbor / 蒼風港 | Optional Chapter 4 island base; clearly separates the western main route from the northern lighthouse side expedition. |
| Bluewind Lighthouse / 蒼風灯台 | Optional regional climax against 蒼嵐の翼; grants the traversal/ranged-defense accessory 蒼風の羽飾り. |
| Frost Crown Citadel / 霜冠城 | Chapter 4 final route. |
| Dawn Harbor / 黎明港 | Chapter 5 arrival hub before hostile highland pressure. |
| Suncrest City / 陽冠都市 | Chapter 5 major preparation city and civilization payoff; route-specific timed expedition kits turn late gold into survivability. |
| Suncrest Arena / 陽冠闘技場 | Optional city combat activity; must not override main-route guidance. |
| Sunspire Tower / 日鏡塔 | Required Chapter 5 expedition for 反射水晶. |
| Ember Isles / 熾火群島 | Chapter 5 final volcanic route. |

## Enemy and encounter principles

Enemy variety should create route decisions, not just color/stat changes.

Use enemies to create:

* Contact pressure.
* Ranged line reading.
* Artillery zone movement.
* Summon priority.
* Trap and area denial.
* Charge evasion.
* Sustain drain.
* Shield/facing decisions.

A route should usually have a local pressure identity. If the route does not change how the player moves, prepares, or retreats, it likely needs stronger encounter design.

## Long-term direction

The editable overworld is already `256x256`. Deepen existing regions before increasing size again.

Future growth should focus on:

* Better route readability.
* More meaningful street-to-street expeditions.
* Stronger safe-base arrival payoff.
* Chapter 2 attrition volume.
* Chapter 5 route polish.
* Manual tuning and selective deepening of existing regional arcs such as 蒼風島.

World expansion must not mean empty walking space. Each new region or dungeon should provide at least one of:

* New survival threat.
* Reward that changes survivable range.
* Safe base or shortcut.
* New enemy behavior.
* Equipment or inventory decision.
* Route toward a boss, dungeon, town, or major treasure.
