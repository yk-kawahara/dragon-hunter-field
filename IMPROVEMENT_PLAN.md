# IMPROVEMENT PLAN

## Current Priority

Strengthen the survival-range expansion loop through actual gameplay improvements rather than new content volume.

Current focus:

* Dangerous areas must become more rewarding and more populated than safe areas.
* The village must feel safe, readable, and useful.
* Equipment upgrades must visibly expand survivable range.
* Movement and combat tempo should feel fast and responsive.
* Exploration should naturally lead players farther from the village.

---

## Recent Cycle Notes

### Cycle 1

Equipment felt too numeric.

Implemented:

* Weapon/armor traits tied to facing bonuses.
* Guarding and movement traits.
* Fire resistance effects.

### Cycle 2

Exploration felt too shallow.

Implemented:

* Hidden spring.
* Ore discovery.
* Hunter cache.

### Cycle 3

Boss encounters lacked distinction.

Implemented:

* Dragon enrage phase.
* Spread fire attack.
* Dragon summons.

### Survival Range Pass Cycle 1

Problem:

* Early enemies were not dangerous enough.
* Armor purchases did not feel meaningful.

Implemented:

* Increased early enemy threat.
* Increased armor impact.
* Created clearer damage reduction milestones.

### Survival Range Pass Cycle 2

Problem:

* Shop equipment value was unclear.

Implemented:

* Reduced early equipment prices.
* Encouraged early armor purchases.
* Exposed equipment traits through UI messaging.

### Survival Range Pass Cycle 3

Problem:

* Mid-game exploration lacked sustainable progression.

Implemented:

* Added Regeneration Ring.
* Added shrine reward source.
* Disabled regeneration while burning.
* Added save support.

### Survival Range Expansion QA Cycle 4

Problem:

* Distant areas were under-populated, weakening the feeling that the player's survivable range had expanded into more valuable danger.

Implemented:

* Added region-specific enemy pools for grassland, North Forest, East Forest/River, and Dragon Cave.
* Added local regional replenishment so dangerous areas maintain nearby enemy pressure.
* Tuned spawn intervals and caps by danger level.

### Survival Range Expansion QA Cycle 5

Problem:

* The village safety rule was undermined by enemy projectiles and a weak boundary read.

Implemented:

* Blocked enemy projectiles from entering the village while gates are closed.
* Allowed danger through open gate tiles only.
* Improved the village boundary visual from weak fence to stone-wall safe-base treatment.
* Added role markers for elder, smith, healer, recovery point, and gates.

### Survival Range Expansion QA Cycle 6

Problem:

* Some exploration rewards could become difficult to trust if map generation placed them on blocked tiles, and the game tempo still felt a little slow.

Implemented:

* Carved small walkable clearings around static treasure, discoveries, and the Guardian site.
* Increased player movement speed, dash distance, and stamina recovery.
* Expanded the strength command into equipment, survival, and inventory/progression pages.

### Survival Range Expansion QA Cycle 7

Problem:

* The rotating strength messages improved visibility but were still easy to miss and too cramped for equipment and inventory review.

Implemented:

* Added a short-lived in-game info panel for the strength command.
* The panel cycles through equipment, survival stats, and inventory/progression pages.
* Verified panel page cycling with VM simulation.

### Survival Range Expansion QA Cycle 8

Problem:

* Whole-map single-position checks passed, but a real-play scenario could still starve distant spawns: old monsters near the village filled the global monster cap after the player moved far away.

Implemented:

* Added local monster pruning when the player has too few nearby enemies.
* Preserved bosses and midbosses while allowing stale ordinary monsters to be replaced by regional threats near the player.
* Added a `wilds` region for far non-north/non-east areas so distant grassland-like map areas gain mid-danger enemies.
* Prevented late-game dragonlings from appearing in village-adjacent grassland pools.

Verified:

* Whole-map sampled spawn pass with old village enemies pre-filled: 134 passable non-town points, 0 spawn holes.
* Region pools now preserve the intended curve: grassland remains slime/bat/boar, while Wilds/North/East/Cave can carry stronger enemies.

---

## Critical Issues Discovered During Real Playtesting

### Enemy Population

Previous problem:

* Enemy density and placement are incorrect.
* Distant areas may contain few or no enemies.

Required outcome:

* Village outskirts contain weak enemies.
* North Forest contains stronger enemies.
* East Forest/River contains distinct enemy pressure.
* Dragon Cave contains dangerous late-game enemies.

This is currently the highest gameplay priority.

Current status:

* Addressed with region-aware spawn pools and regional replenishment.
* VM verification confirms enemies spawn in grassland, Wilds, North Forest, East Forest/River, and Dragon Cave.
* VM verification confirms stale old enemies no longer prevent distant local replenishment.

### Village Safety

Previous problem:

* Enemy projectiles can reach the village.

Required outcome:

* Village functions as a true safe zone.
* Enemy projectiles should not threaten players inside the village.
* Walls and gates should clearly separate safety from danger.

Current status:

* Addressed with projectile town-entry blocking and verified gate rules for monsters.
* Browser visual QA is still pending.

### Village Readability

Previous problem:

* Shops and NPC roles are difficult to identify visually.

Required outcome:

Players should immediately recognize:

* Elder
* Smith
* Healer / Item Seller
* Gate
* Recovery Point

through layout, props, signs, and environment design.

Current status:

* Partially addressed with role markers and a stronger wall visual.
* A fuller layout pass can follow after full-playthrough balance.

### Game Tempo

Previous problem:

* Movement and combat pacing feel too slow.

Required outcome:

* Faster movement.
* Faster traversal.
* Faster combat resolution.
* Responsive action-RPG feel.

Danger should come from enemy damage and positioning, not slow movement.

Current status:

* Partially addressed with faster movement, dash distance, and stamina recovery.
* Manual feel testing remains required.

### Menu and Inventory Visibility

Previous problem:

* Players cannot easily review equipment or inventory.

Required outcome:

* Clear item list.
* Clear equipment list.
* Equipment effect visibility.
* Progress item visibility.
* Better player understanding of growth.

Current status:

* Addressed for current scope with an in-game info panel that shows equipment, survival stats, and inventory/progression items.
* A full interactive menu can be considered later if item-use depth grows.

---

## Next High-Impact Improvements

### Survival Range Expansion

* Verify that stronger equipment visibly reduces damage from previously dangerous enemies.
* Add one dangerous area that later becomes safe through progression.
* Continue tuning armor progression.
* Continue tuning regeneration progression.

### Exploration

* Add additional exploration rewards that increase survivability.
* Add more events to East Forest and River areas.
* Improve hidden discovery placement.
* Ensure exploration rewards never spawn in unreachable locations.

### Village and Readability

* Improve village visual readability.
* Add signs and role-specific props.
* Improve recovery-point visibility.
* Improve shop visibility.
* Improve gate visibility.

### Tempo

* Increase movement speed where appropriate.
* Improve combat responsiveness.
* Reduce unnecessary downtime.

### Menu and Equipment UX

* Add item review screen.
* Add equipment review screen.
* Improve equipment comparison.
* Improve visibility of survival-related stats.

### Ending

* Add elder report sequence.
* Add ending dialogue.
* Add clear summary after completion.

---

## Verification Notes

Current automated verification:

* node --check src/game.js passes.
* Progression simulation passes.
* Save/load simulation passes.
* Equipment progression simulation passes.
* Regeneration simulation passes.
* Region spawn simulation passes for grassland, North Forest, East Forest/River, and Dragon Cave.
* Whole-map stale-cap spawn simulation passes for 134 passable non-town sample points with 0 holes.
* Reward reachability simulation passes for all static treasure, discoveries, and Guardian site.
* Village projectile safety simulation passes for closed-gate blocking.
* Monster gate simulation passes: closed gates block, open gates allow gate entry, walls still block.
* Strength command info-panel cycling simulation passes for equipment, survival, and inventory pages.
* Dragon spawn, defeat, elder report, save/load persistence smoke test passes.
* Balance spot-check supports the intended power reversal: leather sharply reduces early slime damage and chain armor can make weak enemies nearly harmless.

Still required:

* Desktop browser QA.
* Mobile browser QA.
* Full manual playthrough.
* Manual verification of movement and combat tempo.
* Manual verification of inventory and equipment panel usability.
* Manual verification that local monster pruning feels natural during long-distance travel.
