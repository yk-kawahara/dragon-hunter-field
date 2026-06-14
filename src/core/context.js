"use strict";

(() => {
  function requireRuntime(runtime) {
    if (!runtime?.state || !runtime?.player) {
      throw new Error("context helpers require { state, player }");
    }
    return runtime;
  }

  function createContextFactory(runtime) {
    const r = requireRuntime(runtime);

    return {
      map() {
        return { state: r.state };
      },

      reward() {
        return {
          player: r.player,
          state: r.state,
          say: r.say,
          burst: r.burst,
          addFloater: r.addFloater,
          addRing: r.addRing,
          refreshDerivedStats: r.refreshDerivedStats,
        };
      },

      effect() {
        return { state: r.state, ui: r.ui, rand: r.rand };
      },

      spawn() {
        return {
          state: r.state,
          player: r.player,
          rand: r.rand,
          irand: r.irand,
          isPassableRect: r.isPassableRect,
          inTown: r.inTown,
          say: r.say,
          addRing: r.addRing,
        };
      },

      text() {
        return {
          state: r.state,
          player: r.player,
          inTown: r.inTown,
          currentRegion: r.currentRegion,
          areaDangerText: r.areaDangerText,
          canChallengeDragon: r.canChallengeDragon,
          guardianReady: r.guardianReady,
          nearestNpc: r.nearestNpc,
          nearestChest: r.nearestChest,
          nearestDiscovery: r.nearestDiscovery,
          playerNearCave: r.playerNearCave,
          tileAt: r.tileAt,
        };
      },

      render() {
        return {
          canvas: r.canvas,
          ctx: r.ctx,
          ui: r.ui,
          state: r.state,
          player: r.player,
          getCamera: r.getCamera,
          tileAt: r.tileAt,
          inTownTile: r.inTownTile,
          inTown: r.inTown,
          currentRegion: r.currentRegion,
          areaDangerText: r.areaDangerText,
          objectiveText: r.objectiveText,
          guidanceText: r.guidanceText,
          contextPromptText: r.contextPromptText,
          selectedItemCount: r.selectedItemCount,
        };
      },

      combat() {
        return { player: r.player };
      },

      player() {
        return {
          state: r.state,
          player: r.player,
          getCamera: r.getCamera,
          isPassableRect: r.isPassableRect,
          inTown: r.inTown,
          playerMoveSpeed: r.playerMoveSpeed,
          regenRate: r.regenRate,
          dashCost: r.dashCost,
          addFloater: r.addFloater,
          addRing: r.addRing,
          burst: r.burst,
          say: r.say,
        };
      },


      monster() {
        return {
          state: r.state,
          player: r.player,
          rand: r.rand,
          moveActor: r.moveActor,
          spawnIfClear: r.spawnIfClear,
          shootProjectile: r.shootProjectile,
          playerAttack: r.playerAttack,
          playerDefense: r.playerDefense,
          weaponDamageMultiplier: r.weaponDamageMultiplier,
          armorDamageMultiplier: r.armorDamageMultiplier,
          grantMonsterDefeatDrops: r.grantMonsterDefeatDrops,
          addFloater: r.addFloater,
          addSlash: r.addSlash,
          addRing: r.addRing,
          burst: r.burst,
          say: r.say,
        };
      },

      projectile() {
        return {
          state: r.state,
          player: r.player,
          tileAt: r.tileAt,
          isBlockedTile: r.isBlockedTile,
          inTownTile: r.inTownTile,
          tileInGate: r.tileInGate,
          playerDefense: r.playerDefense,
          armorDamageMultiplier: r.armorDamageMultiplier,
          addFloater: r.addFloater,
          addSlash: r.addSlash,
          burst: r.burst,
          say: r.say,
        };
      },

      npc() {
        return {
          state: r.state,
          player: r.player,
          say: r.say,
          spawnMonster: r.spawnMonster,
          guardianReady: r.guardianReady,
        };
      },

      action() {
        return {
          state: r.state,
          player: r.player,
          rand: r.rand,
          say: r.say,
          facingVector: r.facingVector,
          moveActor: r.moveActor,
          playerAttack: r.playerAttack,
          weaponDamageMultiplier: r.weaponDamageMultiplier,
          nearestNpc: r.nearestNpc,
          handleNpc: r.handleNpc,
          playerNearCave: r.playerNearCave,
          handleCave: r.handleCave,
          tileAt: r.tileAt,
          setTile: r.setTile,
          addFloater: r.addFloater,
          addSlash: r.addSlash,
          addRing: r.addRing,
          burst: r.burst,
          grantChestReward: r.grantChestReward,
          grantDiscoveryReward: r.grantDiscoveryReward,
          gainFoundItem: r.gainFoundItem,
        };
      },

      save() {
        return {
          state: r.state,
          player: r.player,
          say: r.say,
          refreshDerivedStats: r.refreshDerivedStats,
          gameStage: r.gameStage,
          stageName: r.stageName,
        };
      },

      ui() {
        return {
          ui: r.ui,
          state: r.state,
          player: r.player,
          say: r.say,
          inTown: r.inTown,
          tileAt: r.tileAt,
          distanceFromVillage: r.distanceFromVillage,
          playerAttack: r.playerAttack,
          playerDefense: r.playerDefense,
          dashCost: r.dashCost,
          regenRate: r.regenRate,
          refreshDerivedStats: r.refreshDerivedStats,
          useSelectedItem: r.useSelectedItem,
        };
      },

      controls() {
        return {
          state: r.state,
          canvas: r.canvas,
          contextAction: r.contextAction,
          dash: r.dash,
          useSelectedItem: r.useSelectedItem,
          cycleItem: r.cycleItem,
          resetGame: r.resetGame,
          interact: r.interact,
          searchGround: r.searchGround,
          showStats: r.showStats,
          toggleInventory: r.toggleInventory,
          closeInventory: r.closeInventory,
          moveInventory: r.moveInventory,
          confirmInventory: r.confirmInventory,
          sellInventorySelection: r.sellInventorySelection,
          closeShop: r.closeShop,
          moveShop: r.moveShop,
          confirmShop: r.confirmShop,
          saveGame: r.saveGame,
          selectItem: r.selectItem,
        };
      },
    };
  }

  globalThis.DRAGON_HUNTER_CONTEXT = {
    createContextFactory,
  };
})();
