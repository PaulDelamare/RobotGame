import { tileCenterPos } from "../utils/geometry.js";

export function drawBaseGrid(k, mapLayout, tileSize) {
  const { add, rect, pos, color, outline, rgb } = k;
  for (let y = 0; y < mapLayout.length; y++) {
    for (let x = 0; x < mapLayout[y].length; x++) {
      add([
        rect(tileSize, tileSize),
        pos(x * tileSize, y * tileSize),
        color(40, 40, 40),
        outline(1, rgb(65, 65, 65)),
      ]);
    }
  }
}

export function buildStaticMap(k, state, mapLayout, tileSize) {
  const { add, rect, pos, color, outline, area, text, anchor, rgb, vec2 } = k;
  state.spikes = [];

  for (let y = 0; y < mapLayout.length; y++) {
    for (let x = 0; x < mapLayout[y].length; x++) {
      const tile = mapLayout[y][x];
      if (tile === "#") {
        add([
          rect(tileSize, tileSize),
          pos(x * tileSize, y * tileSize),
          color(100, 100, 100),
          area({ solid: true }),
          "mur",
        ]);
      } else if (tile === "^") {
        add([
          text("▲", { size: 14 }),
          pos(tileCenterPos(k, tileSize, x, y)),
          anchor("center"),
          "spike_vis",
        ]);
        state.spikes.push(vec2(x, y));
      }
    }
  }
}
