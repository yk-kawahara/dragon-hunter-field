# GAME_DESIGN_NOTES.md

Design truth for the RPG. Use this file to decide **what belongs in the game**.

## Core thesis

The core fun is **survival-range expansion**, not simply completing quests.

At the start, the player should feel safe only near the village. Enemy contact damage should matter. As the player earns gold, buys equipment, levels up, finds rewards, and unlocks safe bases, old danger should become manageable.

Target feelings:

* "This enemy used to hurt, but now I can handle it."
* "I can stay outside longer than before."
* "I can finally reach that farther area."
* "Buying better equipment made a visible difference."
* "This new base moved my safe radius outward."

## Core loop

1. Leave a safe base.
2. Fight nearby enemies.
3. Take meaningful damage.
4. Return before risk becomes fatal.
5. Recover, restock, and improve equipment.
6. Revisit the same area and feel stronger.
7. Push farther into a more dangerous route.
8. Find a new reward, shortcut, dungeon, town, or boss route.
9. Repeat across a larger world.

## Game identity

Old mobile-style contact-combat action RPG.

Not a button-mashing combo action game.

Core mechanics:

* Enemies roam the field.
* The player moves through compact tile-based maps.
* Contact with enemies creates combat pressure.
* Damage depends on facing, contact direction, equipment, and positioning.
* The village and later safe bases provide relief.
* Growth comes from levels, gold, equipment, items, accessories, and exploration rewards.
* The Red Dragon route is the current Chapter 1 endpoint, not the final world endpoint.

## Playtest-derived design truth: adventure and action depth

The June 2026 playtest confirmed that the simple contact-combat foundation is enjoyable, but also exposed where simplicity becomes thinness.

Required direction:

* Contact remains the source of ordinary combat, but weapons must change attack rhythm: quick thrusts, wide sweeps, long magical reach, heavy breaks, and mobile lunges.
* Boss difficulty should increasingly depend on reading and evading piercing lines, multi-wave spreads, persistent zones, and phase combinations, not only level and defense checks.
* Progression weapons may be replaced, but sidegrade weapons must retain a tactical reason to equip them.
* A dungeon is a local encounter space. Its enemy budget, spawn distance, and pressure must not be stolen by enemies outside its walls.
* Adventure volume is measured by distinct places and decisions, not corridor length. Repeated stone-wall lanes do not count as meaningful volume.
* The overworld should evolve toward believable geography: mountain chains, highlands, valleys, coasts, islands, roads, rivers, and settlements arranged as a world rather than one rectangular maze.
* At least one major city should become a dense service hub with multiple shops, specialists, residents, rumors, and optional activities.
* NPCs in the same settlement should not all repeat one line. Dialogue should reveal local life, geography, services, danger, or changing story state.
* All consumable types should be eligible for player-selected quick slots. The field UI must not imply that only three of the six item types matter.
* A whole-world map is a navigation requirement as the geography expands. The current implementation opens with `P`, reads the live fixed terrain, and marks the player, safe bases, and major bosses.
* Bosses now establish distinct movement tests: piercing lanes, delayed rotating volleys, persistent danger zones, and late multi-wave patterns. Future bosses should combine these with terrain rather than only increasing projectile count.

## Chapter 1 role

The current village -> Guardian -> Red Dragon route is **Chapter 1 scale**.

It should remain a complete route, but future development should expand beyond it.

Current target route:

1. Start in the village and learn the dragon route is too dangerous.
2. Farm outskirts enemies, retreat often, and buy first gear.
3. Push into grassland, North Forest, river, mine, and east/southeast routes.
4. Find rewards that extend survivable range.
5. Defeat the North Forest Guardian.
6. Enter the dragon cave, defeat the Red Dragon, and report to the elder.

Ideal feeling: **"I survived farther because I prepared better."**

## Volume expansion rules

Future work should grow the game into a larger RPG.

Long-term direction:

* The editable overworld is now `192x224`; deepen its continents and islands before the next size increase.
* Use hand-authored map data or additional hand-authored map files.
* Add multiple regional arcs, not just one long walk from the starting village.
* Add towns, frontier bases, caves, towers, castles, mines, ruins, roads, bridges, rivers, and dangerous wilderness.
* Add enemy families with different behaviors: bubbles, magic, poison, slow, summons, charge attacks, territorial guarding, ranged pressure, and area denial.
* Add equipment tiers, sidegrades, accessories, shop stock, and inventory decisions.

Volume expansion must not mean empty walking space. Each new region should provide at least one of:

* New survival threat.
* Reward that changes survivable range.
* Safe base or shortcut.
* New enemy behavior.
* Equipment or inventory decision.
* Route toward a boss, dungeon, town, or major treasure.

Density rule:

* Large open regions need visible landmarks every short walk: camp remains, ruined stones, fields, flower patches, shrines, warning signs, caches, or NPC pockets.
* Landmarks should usually pair with a small gameplay reason: chest, discovery reward, shortcut hint, recovery clue, route warning, or enemy pressure.
* Empty terrain is acceptable only when it creates a deliberate feeling of danger, distance, or relief.
* A longer route should cross distinct terrain beats or route decisions; simply extending a wall corridor is not acceptable adventure volume.

## Growth curve

### Early game

* Nearby enemies hurt.
* The player retreats often.
* Shop armor/weapons give obvious value.
* The village feels like relief.

### Mid game

* The player survives longer outside.
* Regeneration or stamina bonuses extend exploration.
* Stronger areas add ranged attacks, status effects, stamina pressure, or region-specific hazards.
* Optional dangerous routes offer rewards that make later routes easier.

### Late game

* Strong defense, regeneration, resistance, and equipment choices make old enemies much less threatening.
* The player can travel far from the original village with confidence.
* Bosses still retain minimum threat.

Most important growth feeling: **reversal of power**.

## Area roles

| Area | Role |
|---|---|
| Village | Starting safe base: recovery, smith, supplies, elder guidance, clear safety boundary. |
| Grassland / Outskirts | First gold loop and retreat training. Weak enemies stay near village even later. |
| Wilds | Farther grassland-like danger beyond the village safe radius. |
| North Forest | First serious survival gate with Guardian pressure and seal crest progression. |
| River / East Route | Mid-game exploration, ranged danger, hidden discoveries, sustain rewards. |
| East / Southeast | Risky expansion route: traveler bell, Southeast Warden, Aegis Charm; should grow into a larger named route. |
| Southwest Mine | Optional route with Bubbler pressure, slow/stamina drain, mine charm counterplay. |
| Southwest Frontier Camp | First remote survival anchor: recovery, supplies, readable camp, outward safe radius. |
| Ash Road / 灰の街道 | First larger eastward volume-expansion route beyond the Chapter 1 footprint; stronger magic pressure, farther rewards, and a route toward the old tower. |
| Skyspine Highlands / 天脊高原 | Three-route mountain crossing toward Old Tower: a readable main road, a longer valley road with sustain rewards, and a dangerous ridge shortcut populated by guards, chargers, and sorcerers. |
| Ash Hamlet / 灰道の宿場 | Second remote survival anchor: full recovery, supplies, and post-Ash-Knight star gear. |
| Old Tower / 古塔 | Late optional danger pocket with dense magic pressure, Ash Knight midboss, and star-gear preparation. |
| Moon Ruins / 月影廃墟 | Post-Old-Tower southern danger pocket with dense late enemies, moon relic rewards, and another reason to push beyond the Red Dragon route. |
| Moon Camp / 月見砦 | Chapter 2 remote survival anchor: recovery, supplies, eclipse gear, and the feeling that the safe radius moved far beyond the village. |
| Eclipse Castle / 月蝕城 | Chapter 2 final danger route: eclipse magic pressure, seal tablet, final supplies, and Eclipse Dragon arena. |
| Black Gate / 黒門 | Chapter 3 transition route south of Eclipse Castle; the map becomes darker, enemy pressure rises, and retreat distance matters again. |
| Black Fort / 黒門砦 | Chapter 3 remote survival anchor: recovery, supplies, Black Sun gear, and a new safe radius before the final southern push. |
| Black Sun Castle / 黒陽城 | Chapter 3 high-danger route: void pressure, Black Sun seal, final cache, and the Black Sun Dragon arena. |
| Western Smuggler Road | Dangerous early-access shortcut toward Black Market. It can be entered before the player is ready, contains named pressure from the Smuggler Captain, and rewards risk with route supplies. |
| Regeneration Cave | Optional side dungeon north of Black Market. Its Greater Regeneration Ring is a major survival-range reward, so it is guarded by the Regen Sentinel rather than being a free pickup. |
| Mist Shrine | Optional shrine route beyond the Black Market north side path. It adds a second side-dungeon layer after Regeneration Cave, mixing trap, summon, magic, and charge pressure before awarding the Mist Charm. |
| Black Market Catacombs / 黒市地下墓所 | Compact interior dungeon entered from Black Market. Its enclosed rooms combine life-drain contact pressure, shields, summons, and a named warden before awarding a route-extending accessory. |
| Black Market City / 黒市都 | Expanded late-game city district with a central market, residential lanes, guards, recovery, merchant stock, wagon access, rumors, and the catacomb entrance. It is the foundation for the future major multi-service city. |
| Frost Frontier / 霜原 | Chapter 4 expedition region beyond Black Sun Castle. Its main road is faster, while the southern ice route is denser and leads to the chapter countermeasure reward. |
| Frost Haven / 白銀宿 | Chapter 4 safe hub: full recovery, wagon travel, premium supplies, and selectable frost weapon/armor/shield stock. It moves the safe radius into the frozen frontier. |
| Ice Cave / 氷窟 | Chapter 4 branch dungeon with Frost Moth ranged pressure, Frost Beast charges, Frost Golem, and the Frost Heart reliquary. |
| Frost Watchtower / 霜見塔 | Optional two-floor Chapter 4 interior. The first floor tests supply management, the second combines frost auras and a named warden, and the far-side elevator permanently shortens repeat expeditions. |
| Frost Crown Citadel / 霜冠城 | Chapter 4 final route: seal discovery, highest regional spawn pressure, final supplies, and Frost Crown Dragon arena. |
| Dragon Cave | Chapter 1 final danger route and Red Dragon arena. |

## Enemy roles

| Enemy | Purpose |
|---|---|
| Slime | Slow early enemy; teaches contact damage. |
| Bat | Fast low-HP enemy; pressures movement/stamina. |
| Boar | Charge enemy; rewards avoiding frontal contact. |
| Wisp | Ranged fire enemy; makes fire/projectile resistance meaningful. |
| Bubbler / 泡吐き | Mine enemy; bubble projectiles slow and drain stamina. |
| Ash Sorcerer / 灰術師 | Farther-road magic enemy; fires faster magic shots and applies slow/stamina pressure. |
| Moon Shade / 月影の亡霊 | Far-south magic enemy; faster magic shots and stamina pressure make star gear and wards matter. |
| Eclipse Mage / 月蝕術師 | Chapter 2 caster; stronger magic shots and stamina pressure make eclipse gear/accessory meaningful. |
| Void Wraith / 黒陽の影 | Chapter 3 high-pressure caster; dark projectiles apply heavier slow/stamina pressure and reward Black Sun gear/accessory preparation. |
| Summoner / 召喚士 | Late-route pressure enemy. If ignored, it calls reinforcements and turns a safe-looking road into a losing fight. The intended answer is to prioritize it, spend a ward/tonic, or retreat before the field fills up. |
| Trap Flower / 地雷花 | Area-denial trap enemy for Moon Ruins / Eclipse / Obsidian / Black Sun routes. It stays still, warns briefly, then explodes for HP/stamina/slow pressure. The intended answer is to cut it before entering, route around it, or prepare wards/return bells for risky shortcuts. |
| Smuggler Captain | Named shortcut midboss on the western smuggler road. It turns the early Black Market route into a real risk/reward challenge and makes the shortcut feel like a dangerous place rather than empty bypass terrain. |
| Regen Sentinel | Named side-dungeon guardian in the regeneration cave. It gates the Greater Regeneration Ring so the strongest sustain reward feels earned through preparation and survival. |
| Mist Lancer | Shrine enemy that winds up, then lunges. It asks the player to read the warning ring and sidestep rather than tank straight contact. |
| Mist Keeper | Named shrine midboss after Regen Sentinel + LV18. It uses midboss magic pressure and gates the Mist Charm so the extra route feels like a real expedition, not a free cache. |
| Vault Leech / 吸命鬼 | Catacomb contact enemy. Successful contact drains stamina, slows the player, and restores its own HP, rewarding clean positioning and timely retreat. |
| Crypt Warden / 地下墓所の番人 | Optional LV22 midboss after Chapter 2 report. It fires grave magic and calls Vault Leeches at half HP, turning the final chamber into a priority and resource check. |
| Frost Moth / 氷晶蛾 | Chapter 4 flying caster. Fast frost shots apply slow and stamina loss, making frost resistance and projectile positioning matter. |
| Frost Beast / 霜牙獣 | Chapter 4 charger with a long readable windup and a forceful lunge. The intended answer is to sidestep or take the safer road rather than absorb the charge. |
| Frost Golem / 氷窟巨人 | Required LV30 Chapter 4 midboss. Its heavy frost pressure gates the Frost Heart reliquary and turns the southern ice route into an earned preparation expedition. |
| Frost Beacon / 凍気灯 | Stationary tower hazard that repeatedly drains stamina and slows nearby players. It changes target priority and rewards frost preparation instead of merely adding another pursuer. |
| Frost Watchtower Warden / 霜見の塔守 | Optional LV32 midboss. At half health it accelerates and activates three fixed Frost Beacons, turning the arena from a duel into a target-priority test. |
| Dragonling | Late stronger enemy; signals dragon-route danger. |
| North Forest Guardian | Midboss gatekeeper for North Forest survivability. |
| Southeast Warden | Optional midboss after traveler bell + level 3; rewards deeper defense. |
| Old Tower Ash Knight | Optional late midboss after Southeast Warden + level 14; unlocks stronger magic-route preparation and tests the expanded-world route. |
| Red Dragon | Chapter 1 final boss: enrage, spread shots, summons, preparation check. |
| Eclipse Dragon / 月蝕竜 | Chapter 2 major boss after Red Dragon report, Ash Knight, moon relic, eclipse seal, and level 20; enrages into wider magic shots and summons late enemies. |
| Black Sun Dragon / 黒陽竜 | Chapter 3 major boss after Chapter 2 report, Eclipse Castle cache, Black Fort armory, Black Sun seal, and level 26; uses heavy void projectiles, wider enraged spreads, and summons. |
| Frost Crown Dragon / 霜冠竜 | Chapter 4 major boss after Chapter 3 report, Frost Golem, frost seal, and level 34. It enrages into five-way frost spreads and summons both ranged and charging reinforcements. |

Enemies should differ by gameplay, not only appearance or stats.

## Rewards

Rewards should change where the player can safely go.

Good reward types:

* Better equipment.
* Area resistance.
* HP regeneration.
* Stamina or movement improvement.
* Safe base or shortcut access.
* Hidden recovery point.
* Stronger shop access.
* Boss preparation.

Plain gold is useful near the village. Deeper rewards should feel like survivability, route access, sustain, resistance, or preparation.

One-time rewards must persist across save/load and must never downgrade current equipment.

## Equipment and inventory

Inventory is now a core RPG system.

Current direction:

* Weapons and armor are owned as lists.
* The player can choose equipped weapon and armor.
* Consumables can be inspected, used, and sold.
* Accessories are owned, and up to two accessories can be equipped.
* Only equipped accessories provide their active survival effects.
* Sidegrade equipment now exists for route preparation:
  * `泡割り槍` and `鉱夫服` help against Bubbler pressure in the southwest mine.
  * `火返しの剣` and `耐火マント` prepare for fire enemies and eastern/dragon-route pressure.
  * `竜狩りの刃` and `巡礼鎧` are late route preparation gear for dragon cave pressure.
  * `星見の杖` and `星織りの衣` prepare for Ash Sorcerer / Ash Knight magic pressure.
  * `月蝕の刃` and `月蝕の外套` prepare for Eclipse Mage / Eclipse Dragon pressure.
* The southwest frontier camp is becoming the first remote equipment hub, not only a healing point.
* The ash hamlet is the second remote equipment hub and sells star gear after the Ash Knight is defeated.
* Moon Camp is the third remote equipment hub and sells/grants eclipse preparation after the player reaches the Chapter 2 route.
* Black Fort is the fourth remote equipment hub and sells/grants Black Sun preparation after the player reaches the Chapter 3 route.
* `黒陽の剣`, `黒陽の鎧`, and `黒陽の護符` prepare for Void Wraith / Black Sun Dragon pressure.
* Frost Haven is the fifth remote equipment hub and sells `霜砕きの剣`, `白銀の外套`, and `霜鏡盾` for the Chapter 4 route.
* `霜心の護符` is earned after defeating the Frost Golem. It reduces frost contact/projectile pressure, slow, and stamina loss, and adds stamina capacity.
* Frost Haven has a unique shield-engraving service. One active engraving changes how an equipped shield plays:
  * `城壁の刻印` deepens frontal contact reduction.
  * `疾走の刻印` improves movement and dash economy while carrying a shield.
  * `反撃の刻印` converts frontal contact into a defense-scaled counterattack and unlocks after Frost Golem.
* Re-engraving costs gold, giving late-game wealth a repeatable strategic use instead of making Frost Haven another copy of earlier shops.
* Inventory and status displays show ATK/DEF totals and per-item comparison deltas so equipment strength is visible.
* Accessory pairing is now part of route preparation: e.g. movement bell + resistance charm, or large regeneration + route resistance.
* `大再生の指輪` is a high-value route-extension accessory found in the Black Market north regeneration cave after defeating the Regen Sentinel.
* `霧灯の護符` is an optional route-preparation accessory found in the Mist Shrine after defeating the Mist Keeper. It reduces trap, summon, and magic pressure, making dangerous side routes and late ruins more survivable.
* `深層灯の護符` is earned in the Black Market Catacombs after defeating the Crypt Warden. It reduces slow movement loss and strengthens herb healing, trading broad resistance for longer recovery-based expeditions.
* `天駆けの徽章` is earned at the top of Frost Watchtower after defeating its warden. It lengthens dash distance and shortens dash recovery, changing traversal and escape options rather than only adding defense.
* Accessory ownership and accessory effects are separate: an owned but unequipped accessory must never grant its active effect.
* Weapon identity includes attack behavior as well as ATK and route multipliers. Inventory text should describe reach, speed, arc, or impact so an older sidegrade can remain a deliberate choice.
* The field item dock consists of player-configurable quick slots. Any consumable in `itemOrder` can be assigned, selected, and used from those slots.
* Current weapon profiles now cover fast thrust, wide sweep, rapid slash, long piercing reach, heavy break, and mobile lunge styles. Future weapons must extend these decisions rather than returning to stat-only tiers.
* The three field quick slots accept all six current consumables and persist across save/load.
* Interior spawn budgets are region-local: exterior enemies and other floors do not make a dungeon appear empty.

Future direction:

* Add more sidegrade weapons/armor.
* Add meaningful accessory identities.
* Add additional remote shop stock and later-town stock.
* Expand comparison text into route recommendations and special-effect previews.
* Decide buyback or lock rules for unique accessories.

Equipment should alter survivability, exploration range, route preparation, or contact-combat incentives, not only numbers.

## UI, feedback, and visual direction

## Latest design truth: Chapter 4 Frost Frontier

Chapter 4 is a complete survival-range arc added beyond the reported Chapter 3 route.

Current structure:

* Frost Frontier occupies the southern edge of the western continent inside the current `192x224` fixed overworld; its original 16-row chapter strip remains intentionally dense rather than empty padding.
* Frost Haven is the new safe anchor. It offers full recovery, premium stock, wagon travel, guidance, and visible town life.
* The northern road is the clearer and faster approach to Frost Crown Citadel.
* The southern ice route is more dangerous and leads through Ice Cave to Frost Golem and `霜心の護符`.
* Frost Crown Citadel requires the Frost Golem victory, frost-seal discovery, and LV34 before the Frost Crown Dragon can be challenged.
* The chapter's gear loop is explicit: buy frost weapon/armor/shield at Frost Haven, earn the Frost Heart accessory in Ice Cave, then use both against the final citadel pressure.
* The shield artisan creates a second preparation axis: safer frontal survival, faster expedition travel, or active counter damage.
* Chapter 4 concludes only after defeating Frost Crown Dragon and reporting to the village elder.

Next design weakness:

* Chapter 4 needs manual balance testing from a real Chapter 3 clear save: gold availability, LV30/LV34 timing, Frost Haven purchase choices, Ice Cave retreat distance, and Frost Crown Dragon reinforcement pacing.
* Frost Watchtower now supplies the first multi-floor destination; the next large destination should use a different structure such as a flooded cave, castle wing, or town-linked quest route.

## Latest design truth: Frost Watchtower

Frost Watchtower is the optional Chapter 4 mastery route rather than another mandatory checklist gate.

* It is a two-floor fixed interior embedded in hand-editable world data and reached from Frost Frontier.
* Floor one offers expedition supplies and route records; floor two raises pressure with stationary Frost Beacons and the Frost Watchtower Warden.
* Defeating the warden opens the reliquary, but the reward remains optional for completing Chapter 4.
* Activating the far-side elevator creates a persistent shortcut from the frontier directly to floor two. The reward is therefore both stronger traversal and a permanently shorter return route.
* `天駆けの徽章` supports a mobile build: it extends dash distance and reduces dash cooldown, pairing naturally with regeneration or frost resistance in the two accessory slots.
* Future interiors should preserve the same expedition shape: readable retreat point, escalating floor identity, behavior climax, persistent shortcut, and a reward that changes travel or survival decisions.

## Latest design truth: selectable shops and Chapter 3 long expedition

The Chapter 3 route should now read as a longer expedition rather than a short final lane.

Current added structure:

* Black Fort remains the first Chapter 3 remote base.
* Black Market City is the Chapter 3 second town: its safe area now spans multiple districts with recovery, late shop, wagon, NPC guidance, residential lanes, and supplies. The next city pass should add specialist services and optional urban activities rather than more empty floor.
* Obsidian Cave is a Chapter 3 branch dungeon between Black Market and Black Sun Castle.
* Obsidian Crawler adds ranged obsidian pressure.
* Obsidian Golem is a Chapter 3 midboss after Chapter 2 report, Black Fort armory, and level 24.
* Obsidian gear and Obsidian Bracelet are rewards that make the final Black Sun push safer.
* Black Sun Dragon remains the Chapter 3 major boss, now after Obsidian Golem preparation.

Shop and reward rules:

* Shops are selectable menus. They must not force fixed weak-to-strong purchase order.
* The player should choose weapons, armor, accessories, and consumables directly.
* Weaker found equipment must be added to inventory when new.
* Weaker found equipment must not auto-equip over stronger current gear.
* Shop UI and inventory UI should make ATK/DEF and special equipment value visible.

Latest balance adjustment:

* The strongest obsidian weapon/armor should be bought at Black Market after Obsidian Golem, not granted directly from a route chest.
* Obsidian route treasure now gives the Obsidian Bracelet and premium expedition supplies instead of bypassing the weapon/armor economy.
* Gold should remain useful deep into the game through high-tier gear, elixirs, return bells, tonics, wards, and wagon travel.
* Remote bases now support wagon travel between unlocked safe bases. This reduces repetitive walking while preserving survival-range expansion.
* Bases should feel inhabited. A base is not only a heal tile; it should have guards, travelers, merchants, porters, and readable role markers.
* Dense late regions are preferred over long empty roads. Farther regions should have higher spawn pressure and more route-extension rewards.

The player must understand why they became stronger.

Prioritize clear feedback for:

* Current objective and area danger.
* HP, damage taken, damage reduction.
* Equipment effects.
* Regeneration, stamina, and movement bonuses.
* Boss requirements.
* Save/clear state.
* Inventory/accessory effects.

Keep the old mobile RPG feel:

* Compact screen.
* Dense tile-based maps.
* Simple readable sprites.
* Left command menu / RPG status feel.
* Clear safe-vs-danger contrast.
* Browser/mobile usability.

## Content acceptance checklist

A content pass is good if it improves at least one:

* Survival-range expansion.
* Clearer damage reduction.
* Better equipment progression.
* Safer village or remote-base recovery loop.
* Better exploration reward.
* Stronger power reversal.
* Meaningful enemy difference.
* Better route balance.
* Larger world with density and purpose.

A content pass is weak if it only adds empty walking space, cosmetic terrain, stat/color-swap enemies, rewards that do not change decisions, or UI that hides important survival information.

## Latest Design Truth: Dense Routes, Shields, and Landmarks

The next content direction is to deepen the current `192x224` continental overworld before expanding map size again.

Current design additions:

* Rigid wall corridors should become readable terrain: broken walls, side openings, ruined watchtowers, market alleys, old gates, roads, bridges, and landmark caches.
* Major late routes should offer at least a small choice: safer main road, risky shortcut, or side reward pocket.
* The western smuggler road is a dangerous shortcut toward Black Market. It can be entered early, but shield soldiers, wisps, and trap flowers make it a risk/reward route rather than a normal road.
* Black Market north now has a regeneration cave side dungeon. It should feel like a dangerous optional expedition whose reward extends survival range.
* Light side objectives can be implemented through chests, discoveries, NPC hints, and route rumors. They do not need a large quest framework if they teach geography or extend survival range.
* Shields are now a formal equipment slot. They reduce frontal contact damage and make contact direction a preparation choice, not only a stat race.
* Shield soldiers are a contact-combat lesson enemy: attacking their front is inefficient, while side/back attacks are rewarded.
* Deeper route rewards should include route-extension supplies, shields, return bells, tonics, elixirs, and hint discoveries rather than only gold.
* Remote bases and Black Market should continue gaining NPCs, signs, stalls, and small reward pockets so they feel like lived-in survival anchors.
* Summoners are now part of late-route identity. They should be placed where "clear this threat first" matters, especially Moon Ruins, Eclipse, Obsidian, and Black Sun routes.
* Trap Flowers are now part of late-route identity. They should mark dangerous shortcuts, ruined courtyards, and narrow castle approaches where route choice matters. Their warning time should remain readable enough that attentive players can react.
* The western smuggler road now has a named Smuggler Captain encounter and smuggler supply caches. Future route work should keep optional shortcuts dangerous but rewarding, not merely faster.
* The regeneration cave now has the Regen Sentinel as a required guardian for the Greater Regeneration Ring. Future major survival-range rewards should be tied to a clear danger climax.
* The Mist Shrine now extends the Black Market north side route with another optional midboss, Mist Lancer patrols, shrine supplies, and the Mist Charm. Future volume passes should prefer this pattern: side route -> distinctive pressure -> named guardian -> reward that changes route survival.
* The latest density pass added fixed terrain-detail overlays, additional supply caches, route hints, camp remains, shrine markers, thorn fields, and more remote-base NPCs. Continue using these small hand-authored landmarks to reduce sparse walking without bloating map size.
* Route hints, shortcut hints, obsidian waystones, and summoner warning markers should be visibly drawn in the field, not only exist as invisible interaction data.
* `旅メモ` is a status-panel guidance page. Future region, boss, and route additions should update it so the player can understand destinations without coordinate-style instructions.
* Current `192x224` map work should keep converting rigid wall boxes into readable broken ruins, side courts, alleys, and terrain-led shortcuts before another size jump.

## Latest Design Truth: Continental World Geography

The overworld is now large enough to read as a journey across landmasses rather than a stack of boxed corridors.

* World size is `192x224`, approximately 2.24 times the previous map area.
* The original progression occupies the western continent. Existing chapters remain in place and retain their save-compatible coordinates.
* A broad sea channel separates the western continent from 蒼風島. Ferry portals connect the western harbor and 蒼風港 after Chapter 3 progression.
* 蒼風島 is organized around a north lighthouse coast, a central mountain spine, west terraces, a river valley, east-coast roads, and a southern heath/cape.
* 蒼風港 is a full recovery, shop, wagon, and guidance base. 南風岬砦 moves the safe radius toward the southern island routes.
* The southern world includes a western cape, a middle isle, a shrine island, bridges/causeways, and optional high-danger caches.
* Major travel should offer readable choices: safer coast road, central mountain pass, dangerous ridge shortcut, or island detour.
* Sea is intentional negative space that makes the landforms legible; walkable land must remain dense with routes, enemies, landmarks, rewards, or bases.
* The next content pass should turn the new geography into a complete regional arc with local enemy behaviors, a dungeon, a named midboss, equipment decisions, and a major destination.
