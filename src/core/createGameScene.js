import { createGameState } from "./gameState.js";
import { createProgramPanel } from "../ui/programPanel.js";
import { createActionPalette } from "../ui/actionPalette.js";
import { createPlayButton } from "../ui/playButton.js";
import { createProgramRunner } from "../game/programRunner.js";
import { createLevelManager } from "../game/levelManager.js";
import { createToastManager } from "../ui/toast.js";
import { createLevelSelector } from "../ui/levelSelector.js";

export function createGameScene(k, config) {
  const state = createGameState();
  const uiY = k.height() - 80;

  const programPanel = createProgramPanel(k, state, uiY);
  programPanel.render();

  const toastBaseY = Math.min(k.height() - 70, Math.max(56, uiY - 40));
  const toast = createToastManager(k, {
    baseY: toastBaseY,
    stackDirection: -1,
    textSize: 12,
  });
  const actionPalette = createActionPalette(k, uiY, (action) => {
    programPanel.addAction(action);
  });

  let levelSelector = null;
  const levelManager = createLevelManager(
    k,
    state,
    config,
    programPanel,
    actionPalette,
    toast,
    {
      onLevelChange: (index) => {
        levelSelector?.setActive(index);
      },
    }
  );

  const selectorWidth = config.levels.length * 110 + Math.max(0, config.levels.length - 1) * 12;
  levelSelector = createLevelSelector(
    k,
    config.levels,
    (index) => {
      levelManager.loadLevel(index);
    },
    {
      baseX: 20,
      baseY: Math.max(16, uiY - 160),
      showPanel: true,
      zIndex: 950,
      width: selectorWidth,
    }
  );

  const runner = createProgramRunner(k, state, config, programPanel, levelManager, toast);

  createPlayButton(k, uiY, () => {
    runner.run();
  });

  levelManager.start();

  return {
    state,
    runner,
    levelManager,
    programPanel,
    actionPalette,
    levelSelector,
    toast,
  };
}
