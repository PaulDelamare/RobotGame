import kaboom from "kaboom";
import { createGameScene } from "./src/core/createGameScene.js";
import { TILE_SIZE, MAP_LAYOUT, ALIEN_PATROLS } from "./src/config/constants.js";

const k = kaboom({
  background: [25, 25, 25],
  scale: 1,
});

createGameScene(k, {
  tileSize: TILE_SIZE,
  mapLayout: MAP_LAYOUT,
  patrols: ALIEN_PATROLS,
});
