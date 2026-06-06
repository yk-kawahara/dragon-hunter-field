\# AGENTS.md



This repository is a browser-based contact-combat action RPG inspired by old Japanese feature-phone action RPGs such as "DRAGON HUNTER."

## Important Implementation Attitude: Do Not Hide Behind Conservatism

When the user explicitly asks for a major gameplay system that improves the game, do not avoid it by saying it is risky, broad, or would touch save data and UI.

Risk must be handled by staged implementation, migration, and verification, not by shrinking the task into a safer but less valuable substitute.

Especially while the game is still far from completion, prioritize bold player-facing progress:

* Real inventory and equipment decisions.
* New regions and towns.
* New enemy behaviors.
* New rewards that change survival range.
* Meaningful systems that make the game feel closer to a complete RPG.

Architecture caution is useful only when it protects an ambitious gameplay implementation. It must not become an excuse for avoiding that implementation.

If a requested feature is large, implement a playable first version and verify it. Do not replace it with a smaller unrelated feature merely because that is safer.



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


\## Volume Expansion Principle



The current game is roughly a 20-minute clear route. Future development must actively expand it into a larger RPG rather than only polishing the existing short route.



Volume expansion must still serve survival range expansion. More content is valuable when it creates new places the player can eventually survive, new threats that change decisions, new towns that extend expeditions, and new equipment choices that alter how far the player can go.



Long-term targets:



\* Expand the hand-authored world substantially. The world should eventually be at least 10x the current playable scope through larger `world.js` data, additional map files, or both.

\* Add distinct place types such as caves, towers, castles, ruins, mines, roads, bridges, and remote settlements.

\* Add multiple towns or safe bases. Later towns should offer healing, restocking, stronger shops, hints, and a feeling that the player's survivable range has truly moved outward.
\* Remote camps and frontier bases should be true survival anchors: safe-zone boundaries, recovery, supplies, and readable landmarks. They should make the player feel that the safe radius has moved outward, not merely decorate the map.

\* Add varied monsters with different behaviors: bubbles, magic, poison, ranged pressure, summons, chase patterns, area denial, and enemies that require different preparation.

\* Build a real inventory. Players should be able to inspect items, weapons, armor, and accessories, choose what to equip, and sell unwanted gear.

\* Treat accessories as equipment slots rather than only permanent flags. Regeneration, movement, resistance, and exploration bonuses should become meaningful equipment choices.

\* Increase total playtime through new areas, enemy families, equipment tiers, side routes, and boss routes rather than through slow travel or grind.



When choosing between small polish and meaningful volume, prefer the change that makes the game feel larger, more explorable, and more replayable.



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


\### Start and Save Flow Rule



The game must not automatically force the latest save on startup.



Startup should allow:



\* New Game / はじめから.

\* Continue / つづきから when save data exists.



After the player clears the game, they must still be able to start again from level 1 without manually clearing browser storage.



New Game must reset persistent progression, including opened chests, discovered rewards, boss flags, clear flags, equipment, charms, and inventory.


The final elder report should clearly communicate that the dragon was defeated and the village is safe.



The clear screen should provide an obvious replay route, currently `N: はじめから`, so a completed save never traps the player in an end state.



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



Player progression must never regress unexpectedly.



Automatic equipment replacement must never downgrade the player's power.



Treasure rewards and one-time discoveries should be persistent across save/load.



## Current Code Architecture Handoff

The project has completed a behavior-neutral extraction phase. Treat the current architecture below as the expected map before making new changes.

```text
src/data/
  definitions.js  Static constants, tiles, equipment data, monster definitions, treasure/discovery definitions.
  maps/world.js   Human-editable fixed world map rows and map object placements.

src/core/
  math.js         Pure math/geometry helpers.
  state.js        Initial state/player factory.
  context.js      Context factory that wires state/player/helpers into each system.

src/systems/
  map.js          Map data loading, validation, tile access, town/gate/collision helpers.
  spawn.js        Region selection, monster spawning, regional replenishment, Guardian spawn story events.
  monsters.js     Enemy AI, contact combat, contact status effects, monster defeat, level-up side effects.
  combat.js       Player combat/stat calculations and equipment multipliers.
  player.js       Player movement, dash, town gate, heal circle, discovery spring updates.
  actions.js      Context action, attack action, chest opening, gathering, hidden discovery reveal.
  rewards.js      Chest/discovery/monster reward grants, item use, equipment anti-downgrade helpers.
  projectiles.js  Enemy projectile firing, movement, collision, damage/status application.
  npc.js          NPC interaction, cave entry, dragon challenge requirement checks.
  save.js         localStorage save/load/reset using SAVE_KEY.
  effects.js      Floaters, slashes, rings, particles, toast expiry.
  text.js         Objective/guidance/context prompt/stage text.
  render.js       Canvas drawing only.
  ui.js           DOM status updates and strength/info panel data.
  controls.js     Keyboard/touch/button event binding.

src/game.js       Entrypoint/司令塔: DOM binding, helper lookup, state/player creation, facades, loop, init.
```


Expected non-module script order in `index.html`:

```html
<script src="src/data/definitions.js"></script>
<script src="src/data/maps/world.js"></script>
<script src="src/core/math.js"></script>
<script src="src/core/state.js"></script>
<script src="src/core/context.js"></script>

<script src="src/systems/combat.js"></script>
<script src="src/systems/player.js"></script>
<script src="src/systems/map.js"></script>
<script src="src/systems/rewards.js"></script>
<script src="src/systems/save.js"></script>
<script src="src/systems/effects.js"></script>
<script src="src/systems/text.js"></script>
<script src="src/systems/spawn.js"></script>
<script src="src/systems/npc.js"></script>
<script src="src/systems/actions.js"></script>
<script src="src/systems/projectiles.js"></script>
<script src="src/systems/monsters.js"></script>
<script src="src/systems/render.js"></script>
<script src="src/systems/ui.js"></script>
<script src="src/systems/controls.js"></script>
<script src="src/data/audio.js"></script>
<script src="src/game.js"></script>
```


Rules for the next Codex session:

* Do not continue splitting files only for line-count reduction.
* Do not convert to ES Modules, Vite, a bundler, or import/export unless explicitly requested.
* Do not change game balance while verifying the refactor.
* First verify that the refactored structure boots and that the survival-range expansion loop still works.
* If a regression is found, make the smallest behavior-neutral fix possible.
* Keep `src/game.js` as the entrypoint/司令塔.
* Keep `src/core/context.js` as the central wiring layer for system contexts.
* Keep `src/systems/monsters.js` as the owner of enemy AI, contact combat, contact status effects, defeat flow, and level-up side effects.
* Update `DEVELOPMENT_LOG.md` and `NEXT_CODEX_TASK.md` with exact verification results.
