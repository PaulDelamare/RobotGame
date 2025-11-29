import { drawBaseGrid, buildStaticMap, clearStaticScene } from "../entities/staticMap.js";
import { spawnDynamicEntities } from "../entities/dynamics.js";
import { spawnAliens } from "../entities/aliens.js";
import { spawnRobot, ensureDirMarker, updateDirMarker } from "../entities/robot.js";

export function createLevelManager(k, state, config, programUI, actionPalette, toast, hooks = {}) {
  const { destroy } = k;
  const { tileSize, levels } = config;
  const { onLevelChange } = hooks;
  let currentLevelIndex = 0;

  function start() {
    loadLevel(0);
  }

  function loadLevel(index) {
    if (index < 0 || index >= levels.length) {
      return;
    }
    currentLevelIndex = index;
    onLevelChange?.(currentLevelIndex);
    const level = levels[currentLevelIndex];

    clearStaticScene(k);
    drawBaseGrid(k, level.map, tileSize);
    buildStaticMap(k, state, level.map, tileSize);

    if (actionPalette) {
      actionPalette.setMode(level.cardMode || "classic", {
        shuffle: Boolean(level.shuffleCards),
        allowToggle: Boolean(level.allowCardToggle),
        forwardMultiplier: Boolean(level.allowForwardMultiplier),
        forwardDefaultSteps: level.forwardDefaultSteps,
      });
    }

    resetLevel({ preserveProgram: false });
    toast?.show(`Niveau ${level.id} • ${level.name}`, { tone: "info" });
    if (level.tip) {
      toast?.show(level.tip, { tone: "info", duration: 3 });
    }
  }

  function resetLevel(options = {}) {
    const { preserveProgram = true } = options;
    const level = levels[currentLevelIndex];

    state.collectedKeys = 0;
    state.doorUnlocked = false;

    if (state.dirMarker) {
      destroy(state.dirMarker);
      state.dirMarker = null;
    }

    spawnDynamicEntities(k, state, level.map, tileSize);
    spawnAliens(k, state, level, tileSize);
    spawnRobot(k, state, level.map, tileSize);
    ensureDirMarker(k, state);
    updateDirMarker(k, state, tileSize, false);

    if (preserveProgram) {
      programUI.clearCurrentAction();
      programUI.render();
    } else {
      programUI.clearProgram();
    }
  }

  function advanceLevel() {
    if (currentLevelIndex < levels.length - 1) {
      loadLevel(currentLevelIndex + 1);
      return true;
    }
    toast?.show("🎉 Tous les niveaux sont terminés !", { tone: "success" });
    return false;
  }

  function getCurrentLevel() {
    return levels[currentLevelIndex];
  }

  function getCurrentMap() {
    return levels[currentLevelIndex].map;
  }

  function getCurrentPatrols() {
    return levels[currentLevelIndex].patrols;
  }

  return {
    start,
    resetLevel,
    loadLevel,
    advanceLevel,
    getCurrentLevel,
    getCurrentMap,
    getCurrentPatrols,
  };
}
