import { tileCenterPos } from "../utils/geometry.js";

export function spawnDynamicEntities(k, state, mapLayout, tileSize) {
  const { add, pos, text, anchor, area, vec2, destroy, get } = k;

  for (const key of state.keys) {
    if (key?.ent) {
      destroy(key.ent);
    }
  }

  state.keys = [];
  state.collectedKeys = 0;
  state.totalKeys = 0;

  if (state.door) {
    destroy(state.door);
    state.door = null;
  }

  state.doorPos = null;
  state.doorUnlocked = false;

  for (const goal of get("arrivee")) {
    destroy(goal);
  }

  for (let y = 0; y < mapLayout.length; y++) {
    for (let x = 0; x < mapLayout[y].length; x++) {
      const tile = mapLayout[y][x];

      if (tile === "K") {
        const ent = add([
          text("🔑", { size: 18 }),
          pos(tileCenterPos(k, tileSize, x, y)),
          anchor("center"),
          area(),
          "key",
          { gridPos: vec2(x, y) },
        ]);

        state.keys.push({ ent, gridPos: vec2(x, y), collected: false });
        continue;
      }

      if (tile === "D") {
        state.doorPos = vec2(x, y);
        state.door = add([
          text("🚪", { size: 22 }),
          pos(tileCenterPos(k, tileSize, x, y)),
          anchor("center"),
          area({ solid: true }),
          "door",
          { gridPos: vec2(x, y), open: false },
        ]);
      }
    }
  }

  state.totalKeys = state.keys.length;
}

export function transformDoorToGoal(k, state, tileSize) {
  const { destroy, add, text, pos, anchor, area, vec2 } = k;

  if (state.doorUnlocked || !state.doorPos) {
    return;
  }

  if (state.door) {
    destroy(state.door);
    state.door = null;
  }

  const { x, y } = state.doorPos;
  state.door = add([
    text("🏁", { size: 22 }),
    pos(tileCenterPos(k, tileSize, x, y)),
    anchor("center"),
    area(),
    "arrivee",
    { gridPos: vec2(x, y) },
  ]);

  state.doorUnlocked = true;
}
