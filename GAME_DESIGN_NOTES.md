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

* Keep expanding the editable world beyond the current `120x112` overworld definition.
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
| Ash Hamlet / 灰道の宿場 | Second remote survival anchor: full recovery, supplies, and post-Ash-Knight star gear. |
| Old Tower / 古塔 | Late optional danger pocket with dense magic pressure, Ash Knight midboss, and star-gear preparation. |
| Moon Ruins / 月影廃墟 | Post-Old-Tower southern danger pocket with dense late enemies, moon relic rewards, and another reason to push beyond the Red Dragon route. |
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
| Dragonling | Late stronger enemy; signals dragon-route danger. |
| North Forest Guardian | Midboss gatekeeper for North Forest survivability. |
| Southeast Warden | Optional midboss after traveler bell + level 3; rewards deeper defense. |
| Old Tower Ash Knight | Optional late midboss after Southeast Warden + level 14; unlocks stronger magic-route preparation and tests the expanded-world route. |
| Red Dragon | Chapter 1 final boss: enrage, spread shots, summons, preparation check. |

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
* Accessories are owned, and one accessory can be equipped.
* Only the equipped accessory provides its active survival effect.
* Sidegrade equipment now exists for route preparation:
  * `泡割り槍` and `鉱夫服` help against Bubbler pressure in the southwest mine.
  * `火返しの剣` and `耐火マント` prepare for fire enemies and eastern/dragon-route pressure.
  * `竜狩りの刃` and `巡礼鎧` are late route preparation gear for dragon cave pressure.
  * `星見の杖` and `星織りの衣` prepare for Ash Sorcerer / Ash Knight magic pressure.
* The southwest frontier camp is becoming the first remote equipment hub, not only a healing point.
* The ash hamlet is the second remote equipment hub and sells star gear after the Ash Knight is defeated.
* Inventory and status displays show ATK/DEF totals and per-item comparison deltas so equipment strength is visible.

Future direction:

* Add more sidegrade weapons/armor.
* Add meaningful accessory identities.
* Add additional remote shop stock and later-town stock.
* Expand comparison text into route recommendations and special-effect previews.
* Decide buyback or lock rules for unique accessories.

Equipment should alter survivability, exploration range, route preparation, or contact-combat incentives, not only numbers.

## UI, feedback, and visual direction

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
