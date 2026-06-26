"use strict";

(() => {
  const definitions = globalThis.DRAGON_HUNTER_DEFINITIONS;
  if (!definitions) {
    throw new Error("DRAGON_HUNTER_DEFINITIONS must be loaded before controls helpers");
  }

  const mathHelpers = globalThis.DRAGON_HUNTER_MATH;
  if (!mathHelpers) {
    throw new Error("DRAGON_HUNTER_MATH must be loaded before controls helpers");
  }

  const { W, H, VIEW_H } = definitions;
  const { clamp } = mathHelpers;

  function requireControlsContext(context) {
    if (!context?.state || !context?.canvas) {
      throw new Error("controls helpers require { state, canvas }");
    }
    const requiredCallbacks = [
      "contextAction",
      "dash",
      "useSelectedItem",
      "useQuickItem",
      "cycleItem",
      "resetGame",
      "interact",
      "searchGround",
      "showStats",
      "toggleInventory",
      "toggleWorldMap",
      "closeInventory",
      "moveInventory",
      "confirmInventory",
      "sellInventorySelection",
      "assignInventoryQuickSlot",
      "closeShop",
      "moveShop",
      "confirmShop",
      "saveGame",
      "selectItem",
    ];
    for (const name of requiredCallbacks) {
      if (typeof context[name] !== "function") {
        throw new Error(`controls helpers require ${name}()`);
      }
    }
    return context;
  }

  function command(context, name) {
    const { interact, searchGround, useSelectedItem, showStats, saveGame, toggleWorldMap } = requireControlsContext(context);
    if (name === "talk") interact();
    if (name === "search") searchGround();
    if (name === "items") useSelectedItem();
    if (name === "stats") showStats();
    if (name === "save") saveGame();
    if (name === "map") toggleWorldMap();
  }

  function bindControls(context) {
    const {
      state,
      canvas,
      contextAction,
      dash,
      useSelectedItem,
      useQuickItem,
      cycleItem,
      resetGame,
      selectItem,
      toggleInventory,
      toggleWorldMap,
      closeInventory,
      moveInventory,
      confirmInventory,
      sellInventorySelection,
      assignInventoryQuickSlot,
      closeShop,
      moveShop,
      confirmShop,
    } = requireControlsContext(context);

    window.addEventListener("keydown", (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight"].includes(event.code)) {
        event.preventDefault();
      }
      if (state.worldMapOpen) {
        if (event.code === "KeyP" || event.code === "Escape") {
          event.preventDefault();
          toggleWorldMap();
        }
        return;
      }
      if (state.shopOpen) {
        if (["ArrowUp", "ArrowDown", "Enter", "Space", "Escape", "KeyS"].includes(event.code)) {
          event.preventDefault();
        }
        if (event.code === "ArrowUp") moveShop(-1);
        if (event.code === "ArrowDown") moveShop(1);
        if (event.code === "Enter" || event.code === "Space") confirmShop();
        if (event.code === "Escape" || event.code === "KeyS") closeShop();
        return;
      }
      if (state.inventoryOpen) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Space", "Escape", "KeyI", "KeyM", "KeyS", "Digit1", "Digit2", "Digit3"].includes(event.code)) {
          event.preventDefault();
        }
        if (event.code === "ArrowUp") moveInventory(0, -1);
        if (event.code === "ArrowDown") moveInventory(0, 1);
        if (event.code === "ArrowLeft") moveInventory(-1, 0);
        if (event.code === "ArrowRight") moveInventory(1, 0);
        if (event.code === "Enter" || event.code === "Space") confirmInventory();
        if (event.code === "KeyS") sellInventorySelection();
        if (["Digit1", "Digit2", "Digit3"].includes(event.code)) assignInventoryQuickSlot(Number(event.code.slice(-1)) - 1);
        if (event.code === "Escape" || event.code === "KeyI" || event.code === "KeyM") closeInventory();
        return;
      }
      state.keys.add(event.code);
      if (event.code === "Enter" || event.code === "Space") contextAction();
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") dash();
      if (event.code === "KeyH") useSelectedItem();
      if (["Digit1", "Digit2", "Digit3"].includes(event.code)) useQuickItem(Number(event.code.slice(-1)) - 1);
      if (event.code === "KeyI" || event.code === "KeyM") toggleInventory();
      if (event.code === "KeyP") toggleWorldMap();
      if (event.code === "KeyQ") cycleItem(-1);
      if (event.code === "KeyE") cycleItem(1);
      if (event.code === "KeyR" && state.gameOver) resetGame();
      if (event.code === "KeyN" && state.clearPanelOpen) resetGame();
    });

    window.addEventListener("keyup", (event) => {
      state.keys.delete(event.code);
    });

    document.querySelectorAll("[data-command]").forEach((button) => {
      button.addEventListener("click", () => command(context, button.dataset.command));
    });

    document.querySelectorAll("[data-quick-slot]").forEach((button) => {
      button.addEventListener("click", () => useQuickItem(Number(button.dataset.quickSlot)));
    });

    document.querySelectorAll("[data-key], [data-keys]").forEach((button) => {
      const codes = (button.dataset.keys || button.dataset.key || "").split(/\s+/).filter(Boolean);
      const start = (event) => {
        event.preventDefault();
        button.classList.add("is-active");
        for (const code of codes) state.virtualKeys.add(code);
        if (codes.includes("Enter")) contextAction();
        if (codes.includes("ShiftLeft") || codes.includes("ShiftRight")) dash();
        if (codes.includes("KeyH")) useSelectedItem();
      };
      const end = () => {
        button.classList.remove("is-active");
        for (const code of codes) state.virtualKeys.delete(code);
      };
      button.addEventListener("pointerdown", start);
      button.addEventListener("pointerup", end);
      button.addEventListener("pointerleave", end);
      button.addEventListener("pointercancel", end);
    });

    const setPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      state.pointerMove = {
        x: clamp(((event.clientX - rect.left) / rect.width) * W, 0, W),
        y: clamp(((event.clientY - rect.top) / rect.height) * H, 0, VIEW_H - 2),
      };
    };
    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      canvas.focus();
      canvas.setPointerCapture?.(event.pointerId);
      setPointerMove(event);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (state.pointerMove) setPointerMove(event);
    });
    const stopPointerMove = (event) => {
      try {
        canvas.releasePointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }
      state.pointerMove = null;
    };
    canvas.addEventListener("pointerup", stopPointerMove);
    canvas.addEventListener("pointercancel", stopPointerMove);
    canvas.addEventListener("lostpointercapture", () => {
      state.pointerMove = null;
    });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  globalThis.DRAGON_HUNTER_CONTROLS = {
    command,
    bindControls,
  };
})();
