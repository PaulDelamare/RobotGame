import { drawBaseGrid, buildStaticMap } from "../entities/staticMap.js";
import { spawnDynamicEntities } from "../entities/dynamics.js";
import { spawnAliens } from "../entities/aliens.js";
import { spawnRobot, ensureDirMarker, updateDirMarker } from "../entities/robot.js";

export function createLevelManager(k, state, config, programUI) {
  const { destroy } = k;
  const { mapLayout, tileSize, patrols } = config;

  function setupStaticScene() {
    drawBaseGrid(k, mapLayout, tileSize);
    buildStaticMap(k, state, mapLayout, tileSize);
  }

  function resetLevel() {
    state.collectedKeys = 0;
    state.doorUnlocked = false;

    if (state.dirMarker) {
      destroy(state.dirMarker);
      state.dirMarker = null;
    }

    spawnDynamicEntities(k, state, mapLayout, tileSize);
    spawnAliens(k, state, patrols, tileSize);
    spawnRobot(k, state, mapLayout, tileSize);
    ensureDirMarker(k, state);
    updateDirMarker(k, state, tileSize, false);

    programUI.clearCurrentAction();
    programUI.render();
  }

  return {
    setupStaticScene,
    resetLevel,
  };
}
