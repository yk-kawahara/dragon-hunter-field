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

---

## Critical Issues Discovered During Real Playtesting

### Enemy Population

Current problem:

* Enemy density and placement are incorrect.
* Distant areas may contain few or no enemies.

Required outcome:

* Village outskirts contain weak enemies.
* North Forest contains stronger enemies.
* East Forest/River contains distinct enemy pressure.
* Dragon Cave contains dangerous late-game enemies.

This is currently the highest gameplay priority.

### Village Safety

Current problem:

* Enemy projectiles can reach the village.

Required outcome:

* Village functions as a true safe zone.
* Enemy projectiles should not threaten players inside the village.
* Walls and gates should clearly separate safety from danger.

### Village Readability

Current problem:

* Shops and NPC roles are difficult to identify visually.

Required outcome:

Players should immediately recognize:

* Elder
* Smith
* Healer / Item Seller
* Gate
* Recovery Point

through layout, props, signs, and environment design.

### Game Tempo

Current problem:

* Movement and combat pacing feel too slow.

Required outcome:

* Faster movement.
* Faster traversal.
* Faster combat resolution.
* Responsive action-RPG feel.

Danger should come from enemy damage and positioning, not slow movement.

### Menu and Inventory Visibility

Current problem:

* Players cannot easily review equipment or inventory.

Required outcome:

* Clear item list.
* Clear equipment list.
* Equipment effect visibility.
* Progress item visibility.
* Better player understanding of growth.

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

Still required:

* Desktop browser QA.
* Mobile browser QA.
* Full manual playthrough.
* Verify enemy populations in all major regions.
* Verify village safety.
* Verify movement and combat tempo.
* Verify inventory and equipment usability.
