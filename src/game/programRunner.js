import { MAX_FORWARD_STEPS } from "../config/constants.js";
import { moveForward, turnRight, turnLeft } from "../entities/robot.js";
import { stepAliens } from "../entities/aliens.js";
import { transformDoorToGoal } from "../entities/dynamics.js";
import { isSpikeAt } from "../utils/collision.js";

function normalizeProgramAction(action) {
  if (!action) {
    return { type: "forward", steps: 1 };
  }
  if (typeof action === "string") {
    return { type: action, steps: 1 };
  }
  const type = action.type || action.action || "forward";
  const rawSteps = Number(action.steps ?? 1);
  const steps = Number.isFinite(rawSteps) ? Math.max(1, Math.min(rawSteps, MAX_FORWARD_STEPS)) : 1;
  return { type, steps };
}

export function createProgramRunner(k, state, config, programUI, levelManager, toast) {
  const { tileSize } = config;
  const { wait, get, vec2 } = k;

  async function run() {
    if (!state.robot) {
      return;
    }

    if (state.program.length === 0) {
      programUI.clearCurrentAction();
      return;
    }

    for (let i = 0; i < state.program.length; i++) {
      programUI.setCurrentAction(i);
      const action = normalizeProgramAction(state.program[i]);
      const currentMap = levelManager.getCurrentMap();

      stepAliens(k, state, currentMap, tileSize);
      if (await handleLoseIfNeeded()) {
        return;
      }

      if (action.type === "forward") {
        const stepResult = await executeForwardSteps(action.steps, currentMap);
        if (stepResult === "win") {
          return;
        }
        if (!stepResult) {
          return;
        }
      } else if (action.type === "right") {
        turnRight(k, state, tileSize);
      } else if (action.type === "left") {
        turnLeft(k, state, tileSize);
      } else {
        console.warn("Instruction inconnue", action);
        toast?.show("Instruction inconnue ignorée", { tone: "warning" });
        continue;
      }

      if (completeLevelIfNeeded()) {
        return;
      }
      if (await handleLoseIfNeeded()) {
        return;
      }

      await wait(0.28);
    }

    programUI.clearCurrentAction();
    console.log("❌ Fin des actions sans arriver — retour au départ.");
    toast?.show("❌ Programme terminé sans succès", { tone: "warning" });
    await handleReset();
  }

  async function handleReset() {
    programUI.clearCurrentAction();
    programUI.render();
    await wait(0.2);
    levelManager.resetLevel({ preserveProgram: true });
    toast?.show("↺ Niveau réinitialisé", { tone: "info", duration: 1.6 });
  }

  function handleKeyPickup() {
    if (!state.robot || state.keys.length === 0) {
      return;
    }

    let collectedThisStep = false;

    for (const key of state.keys) {
      if (key.collected || !key.gridPos) {
        continue;
      }

      if (state.robot.gridPos.x === key.gridPos.x && state.robot.gridPos.y === key.gridPos.y) {
        const { destroy } = k;
        key.collected = true;
        state.collectedKeys += 1;
        collectedThisStep = true;

        if (key.ent) {
          destroy(key.ent);
          key.ent = null;
        }

        console.log(`🔑 Clé ${state.collectedKeys}/${Math.max(state.totalKeys, 1)} ramassée !`);
        toast?.show(`🔑 Clé ${state.collectedKeys}/${state.totalKeys} collectée`, { tone: "info" });
      }
    }

    if (collectedThisStep && state.collectedKeys >= state.totalKeys && state.totalKeys > 0) {
      console.log("🚪 La porte révèle désormais l'arrivée !");
      toast?.show("🚪 La porte s'ouvre sur l'arrivée", { tone: "success" });
      transformDoorToGoal(k, state, tileSize);
    }
  }

  function checkLoseConditions() {
    if (!state.robot) {
      return { lose: false };
    }

    if (isSpikeAt(state.spikes, state.robot.gridPos.x, state.robot.gridPos.y)) {
      return { lose: true, reason: "spike" };
    }

    for (const alien of state.aliens) {
      if (state.robot.gridPos.x === alien.cur.x && state.robot.gridPos.y === alien.cur.y) {
        return { lose: true, reason: "alien" };
      }
    }

    return { lose: false };
  }

  function reachedGoal() {
    const arrivals = get("arrivee");
    if (!state.robot || arrivals.length === 0) {
      return false;
    }
    const arrival = arrivals[0];
    const grid = arrival.gridPos || vec2(Math.round(arrival.pos.x / tileSize), Math.round(arrival.pos.y / tileSize));
    return state.robot.gridPos.x === grid.x && state.robot.gridPos.y === grid.y;
  }

  function completeLevelIfNeeded() {
    if (!reachedGoal()) {
      return false;
    }
    console.log("🏁 Arrivée atteinte ! Gagné.");
    toast?.show("🏁 Bravo, niveau réussi !", { tone: "success" });
    programUI.clearCurrentAction();
    const advanced = levelManager.advanceLevel();
    if (!advanced) {
      toast?.show("✨ Démo terminée, bravo !", { tone: "success" });
    }
    return true;
  }

  return {
    run,
  };

  async function executeForwardSteps(stepCount, currentMap) {
    const totalSteps = Math.max(1, Math.min(stepCount, MAX_FORWARD_STEPS));
    for (let step = 0; step < totalSteps; step++) {
      const ok = moveForward(k, state, currentMap, tileSize);
      if (!ok) {
        console.log("🚧 Bloqué par un mur : retour au départ.");
        toast?.show("🚧 Bloqué par un obstacle", { tone: "warning" });
        await handleReset();
        return false;
      }
      handleKeyPickup();
      if (await handleLoseIfNeeded()) {
        return false;
      }
      if (completeLevelIfNeeded()) {
        return "win";
      }
      if (totalSteps > 1 && step < totalSteps - 1) {
        await wait(0.12);
      }
    }
    return true;
  }

  async function handleLoseIfNeeded() {
    const loseState = checkLoseConditions();
    if (!loseState.lose) {
      return false;
    }
    console.log(`💥 Perdu (${loseState.reason}) — retour au départ.`);
    toast?.show("💥 Tentative ratée, retour au départ", { tone: "danger" });
    await handleReset();
    return true;
  }
}
