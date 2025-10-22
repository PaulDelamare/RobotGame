export function tileCenterPos(k, tileSize, x, y) {
  const { vec2 } = k;
  return vec2(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
}

export function dirToAngle(dir) {
  if (!dir) return 0;
  if (dir.x === 0 && dir.y === 1) return 0;
  if (dir.x === 1 && dir.y === 0) return -90;
  if (dir.x === 0 && dir.y === -1) return 180;
  if (dir.x === -1 && dir.y === 0) return 90;
  return 0;
}

export function signVec(k, from, to) {
  const { vec2 } = k;
  return vec2(Math.sign(to.x - from.x), Math.sign(to.y - from.y));
}
