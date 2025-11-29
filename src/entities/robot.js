import { tileCenterPos, dirToAngle } from "../utils/geometry.js";
import { isWallAt } from "../utils/collision.js";

export function spawnRobot(k, state, mapLayout, tileSize) {
  const { add, text, pos, anchor, area, vec2, destroy } = k;

  if (state.robot) {
    destroy(state.robot);
    state.robot = null;
  }

  for (let y = 0; y < mapLayout.length; y++) {
    for (let x = 0; x < mapLayout[y].length; x++) {
      if (mapLayout[y][x] !== "R") {
        continue;
      }

      state.robot = add([
        text("🤖", { size: 20 }),
        pos(tileCenterPos(k, tileSize, x, y)),
        anchor("center"),
        area(),
        "robot",
        { gridPos: vec2(x, y) },
      ]);

      state.robotDir = vec2(0, 1);
      state.robot.angle = dirToAngle(state.robotDir);
      state.initialRobotGrid = vec2(x, y);

      ensureDirMarker(k, state);
      updateDirMarker(k, state, tileSize, false);
      return;
    }
  }
}

export function ensureDirMarker(k, state) {
  const { add, text, anchor, pos, rgb } = k;

  if (state.dirMarker) {
    return;
  }

  state.dirMarker = add([
    text("▲", { size: 16 }),
    anchor("center"),
    pos(-100, -100),
  ]);
  state.dirMarker.color = rgb(220, 220, 80);
}

export function updateDirMarker(k, state, tileSize, animate) {
  if (!state.robot || !state.dirMarker) {
    return;
  }

  const { vec2 } = k;
  const offset = state.robotDir.scale(tileSize / 2 - 6);
  const target = tileCenterPos(k, tileSize, state.robot.gridPos.x, state.robot.gridPos.y).add(offset);
  state.dirMarker.angle = state.robot.angle + 180;

  if (animate) {
    state.dirMarker.moveTo(target);
  } else {
    state.dirMarker.pos = target;
  }
}

export function moveForward(k, state, mapLayout, tileSize) {
  if (!state.robot) {
    return false;
  }

  const next = state.robot.gridPos.add(state.robotDir);
  if (isWallAt(k, mapLayout, tileSize, next.x, next.y)) {
    return false;
  }

  state.robot.gridPos = next;
  state.robot.moveTo(tileCenterPos(k, tileSize, next.x, next.y));
  updateDirMarker(k, state, tileSize, true);
  return true;
}

export function turnRight(k, state, tileSize) {
  const { vec2 } = k;
  state.robotDir = vec2(-state.robotDir.y, state.robotDir.x);
  if (state.robot) {
    state.robot.angle = dirToAngle(state.robotDir);
  }
  updateDirMarker(k, state, tileSize, false);
}

export function turnLeft(k, state, tileSize) {
  const { vec2 } = k;
  state.robotDir = vec2(state.robotDir.y, -state.robotDir.x);
  if (state.robot) {
    state.robot.angle = dirToAngle(state.robotDir);
  }
  updateDirMarker(k, state, tileSize, false);
}

export async function returnRobotToStart(k, state, tileSize) {
  const { vec2, wait } = k;

  if (!state.initialRobotGrid || !state.robot) {
    return;
  }

  const start = state.initialRobotGrid;
  state.robot.moveTo(tileCenterPos(k, tileSize, start.x, start.y));
  state.robot.gridPos = vec2(start.x, start.y);
  state.robotDir = vec2(0, 1);
  state.robot.angle = dirToAngle(state.robotDir);
  updateDirMarker(k, state, tileSize, false);

  await wait(0.25);
}
