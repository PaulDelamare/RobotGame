import kaboom from "kaboom";
import { createGameScene } from "./src/core/createGameScene.js";
import { TILE_SIZE, LEVELS } from "./src/config/constants.js";

const k = kaboom({
  background: [25, 25, 25],
  scale: 1,
});

createGameScene(k, {
  tileSize: TILE_SIZE,
  levels: LEVELS,
});
