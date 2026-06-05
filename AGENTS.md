\# AGENTS.md



This repository is a browser-based contact-combat action RPG inspired by old Japanese feature-phone action RPGs such as "DRAGON HUNTER."



\## Most Important Design Principle



The core fun of this game is not simply completing quests.



The core fun is survival range expansion.



The player should repeatedly experience this loop:



1\. Leave the safe village.

2\. Fight nearby enemies.

3\. Take meaningful contact damage.

4\. Retreat to the village before things become too dangerous.

5\. Fully recover and feel safe.

6\. Earn gold and buy better equipment.

7\. Take less damage from enemies that used to be dangerous.

8\. Travel farther from the village than before.

9\. Find stronger enemies, better rewards, and more dangerous areas.

10\. Repeat.



When adding new content, always ask:



"Does this help the player feel that their survivable range has expanded?"



If the answer is no, reconsider the change.



\## Game Identity



This game is not a button-mashing action game.



The core mechanics are:



\* Enemies roam the field.

\* The player moves around the field.

\* Contact with enemies triggers combat.

\* Damage depends on facing, contact direction, and relative positioning.

\* The village is a safe base.

\* The outside world is dangerous.

\* The player grows through levels, gold, equipment, items, and exploration rewards.

\* The final goal is to survive far enough and become strong enough to defeat the dragon.



Keep the contact-combat system simple, readable, and fast.



Do not turn the game into a complex action game based mainly on attack-button combos.



\## Survival and Growth



The most important growth feeling is not just seeing numbers increase.



The key feeling is a reversal of power.



Early game:



\* Nearby enemies should feel dangerous.

\* Enemy contact damage should hurt.

\* The player should need to return to the village often.

\* The player should feel safest near the village.



Mid game:



\* Better shop equipment should noticeably reduce incoming damage.

\* The player should survive longer outside.

\* Weak HP regeneration may begin to extend exploration time.

\* Previously dangerous areas should become more manageable.



Late game:



\* Treasure, hidden rewards, rare equipment, and strong armor should make old enemies much less threatening.

\* HP regeneration plus defense may offset weak enemy damage.

\* The player should be able to travel far from the village with confidence.

\* Previously dangerous enemies should become easy to defeat.



This power reversal is central to the game.



\## Village Design



The village is not just a quest hub.



The village is a safe recovery point.



The player should feel relief when returning to the village.



The village should provide:



\* Full recovery.

\* Equipment purchases or upgrades.

\* Item restocking.

\* Hints about dangerous areas.

\* A sense of safety from monsters.



Avoid letting ordinary monsters enter the village.



If enemies can enter the village, it should be a meaningful crisis event, not normal behavior.



\## Equipment Design



Early progression should mainly come from shop equipment.



The player should earn gold near the village, buy better weapons and armor, and clearly feel that damage taken has decreased.



Mid-game and late-game progression can shift toward:



\* Treasure.

\* Hidden discoveries.

\* Dangerous-area rewards.

\* Strong enemy rewards.

\* Rare equipment.



Equipment should not only increase numbers.



Whenever possible, equipment should affect survivability, exploration range, or contact-combat behavior.



Examples:



\* Armor that sharply reduces contact damage.

\* Weapons that make old enemies die much faster.

\* Gear that improves survival in specific areas.

\* Equipment that gives weak HP regeneration.

\* Armor that makes fire, poison, or ranged attacks less dangerous.

\* Rare late-game gear that makes old enemies nearly harmless.



\## HP Regeneration



A weak HP regeneration element should exist from the mid-game onward.



It should not make the early game too easy.



The intended curve is:



\* Early game: enemy damage is higher than recovery, so returning to the village matters.

\* Mid game: weak regeneration extends exploration time.

\* Late game: strong defense plus regeneration can offset weak enemy damage.

\* End game: the player feels powerful because old threats become manageable or harmless.



HP regeneration should support survival range expansion.



It should not replace the need for equipment, defense, or careful exploration.



\## Enemy Design



Enemies should differ in gameplay, not only in appearance.



Use differences such as:



\* Contact damage.

\* Movement speed.

\* Chase range.

\* Facing behavior.

\* Ranged attacks.

\* Status effects.

\* Drop rewards.

\* Area placement.

\* How dangerous they are before and after equipment upgrades.



A good enemy design supports the survival range loop.



For example:



\* An enemy that is terrifying early but harmless later.

\* An enemy that forces retreat until the player buys better armor.

\* An enemy that becomes easy after obtaining fire resistance.

\* An enemy that drops useful items for deeper exploration.



\## Exploration Design



Exploration should not be only about seeing new scenery.



Exploration should make the player feel:



\* "I can finally reach this place."

\* "I found something that helps me go farther."

\* "This area used to be too dangerous, but now I can handle it."



Good exploration rewards include:



\* Better equipment.

\* Hidden recovery points.

\* Rare materials.

\* HP regeneration sources.

\* Shortcuts.

\* Stronger shop access.

\* Special defensive items.

\* Rewards that make old enemies easier.



Prioritize exploration rewards that extend survival range rather than rewards that only give small amounts of gold.



\## Boss Design



Bosses should not merely be high-HP enemies.



Bosses should test whether the player has expanded their survivable range enough.



Good boss design may include:



\* Clear danger.

\* Facing/contact pressure.

\* Ranged attacks.

\* Phase changes.

\* Summons.

\* Area hazards.

\* Preparation requirements.

\* Meaningful rewards.



The final dragon should feel like the endpoint of the survival range loop.



The player should feel that they could not have survived this fight earlier, but now they can.



\## UI and Feedback



The player must understand why they became stronger.



Prioritize clear feedback for:



\* Current objective.

\* HP and damage taken.

\* Equipment effects.

\* Damage reduction.

\* HP regeneration.

\* Boss challenge conditions.

\* Area danger.

\* Save state.

\* Clear state.



If equipment has special traits, show them clearly.



A hidden system that the player cannot understand is less valuable.



\## Visual Direction



Keep the old mobile RPG feeling.



Important traits:



\* Compact screen feeling.

\* Dense tile-based maps.

\* Simple readable sprites.

\* Left command menu.

\* Bottom status display.

\* Clear difference between safe village and dangerous field.

\* Readable danger and reward cues.



Do not over-modernize the UI if it weakens the old mobile RPG feel.



However, usability in a browser should still be maintained.



\## Development Workflow



Before making changes, read:



\* AGENTS.md

\* GAME\_DESIGN\_NOTES.md

\* IMPROVEMENT\_PLAN.md

\* TODO.md

\* DEVELOPMENT\_LOG.md



When making changes, do not add enemies, items, UI, or decorations randomly.



State which design goal the change improves:



\* Survival range expansion.

\* Clearer damage reduction.

\* Better equipment progression.

\* Safer village recovery loop.

\* Better exploration rewards.

\* Stronger power reversal.

\* More meaningful enemy differences.

\* Better full-playthrough balance.



\## Verification



After changes, verify as much as possible:



\* JavaScript syntax check.

\* Main game loop.

\* Contact combat.

\* Damage and defense behavior.

\* Equipment effects.

\* HP regeneration if modified.

\* Enemy behavior.

\* Save/load fields.

\* Boss challenge conditions.

\* Clear flow.

\* Browser visual QA if available.



If something cannot be verified, record the reason and risk in DEVELOPMENT\_LOG.md.



\## Documentation



After each meaningful development pass, update:



\* GAME\_DESIGN\_NOTES.md

\* IMPROVEMENT\_PLAN.md

\* TODO.md

\* DEVELOPMENT\_LOG.md



The next Codex session should be able to continue from the current state without rediscovering the design direction.



\## Git



After meaningful changes:



1\. Check git status.

2\. Commit changes with a clear message.

3\. Push if possible.



Do not leave finished work uncommitted.



\## Real Playtest Rules



When improving the game, prioritize actual gameplay problems discovered through playtesting over adding new content.



Do not assume that adding more enemies, quests, items, or mechanics automatically improves the game.



First verify that the existing gameplay loop feels good.



\### Safe Village Rule



The village must function as a true safe zone.



Ordinary enemies should not enter the village.



Enemy projectiles, magic, and hostile effects should not threaten players inside the village.



If a player returns to the village after dangerous exploration, they should immediately feel safe.



\### World Population Rule



Enemy populations should increase in danger and value as distance from the village increases.



Avoid empty distant areas.



The player should always find meaningful enemies, rewards, or challenges in areas that are farther from the village.



A stronger player should naturally travel farther from the village because the rewards justify the risk.



\### Tempo Rule



Favor responsiveness and fast traversal.



Danger should come from enemy damage, enemy behavior, positioning, and area design.



Danger should not come from slow movement, long waiting times, sluggish controls, or excessive travel time.



When in doubt, prefer a slightly faster game.



\### Readability Rule



Functional readability is more important than decorative graphics.



Players should immediately understand:



\* Where to heal.

\* Where to buy equipment.

\* Where to buy items.

\* Where to receive objectives.

\* Where danger begins.



Use signs, building layouts, props, gates, walls, landmarks, and NPC placement to communicate function.



Do not rely solely on dialogue.



\### Menu and Information Rule



Players should be able to easily understand:



\* Current equipment.

\* Equipment effects.

\* Current items.

\* Progression items.

\* Regeneration effects.

\* Survival-related bonuses.



If a system exists but the player cannot easily see or understand it, improving visibility is often more valuable than adding new mechanics.



\### Playtest Before Expansion Rule



Before adding major new content, verify:



\* Enemy distribution.

\* Village safety.

\* Equipment progression.

\* Inventory usability.

\* Movement speed.

\* Combat pacing.

\* Full-playthrough balance.



Fix major gameplay problems before expanding game scope.

