import { createGameState } from "./gameState.js";
import { createProgramPanel } from "../ui/programPanel.js";
import { createActionPalette } from "../ui/actionPalette.js";
import { createPlayButton } from "../ui/playButton.js";
import { createProgramRunner } from "../game/programRunner.js";
import { createLevelManager } from "../game/levelManager.js";
import { createToastManager } from "../ui/toast.js";

export function createGameScene(k, config) {
  const state = createGameState();
  const uiY = k.height() - 80;

  const programPanel = createProgramPanel(k, state, uiY);
  programPanel.render();

  const levelManager = createLevelManager(k, state, config, programPanel);
  const toast = createToastManager(k);
  const runner = createProgramRunner(k, state, config, programPanel, levelManager, toast);

  createActionPalette(k, uiY, (action) => {
    programPanel.addAction(action);
  });

  createPlayButton(k, uiY, () => {
    runner.run();
  });

  levelManager.setupStaticScene();
  levelManager.resetLevel();

  return {
    state,
    runner,
    levelManager,
    programPanel,
    toast,
  };
}
