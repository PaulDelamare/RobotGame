export function isWallAt(k, mapLayout, tileSize, x, y) {
  if (x < 0 || y < 0 || y >= mapLayout.length || x >= mapLayout[0].length) {
    return true;
  }

  const approx = (pos) => Math.round(pos / tileSize);

  for (const wall of k.get("mur")) {
    if (approx(wall.pos.x) === x && approx(wall.pos.y) === y) {
      return true;
    }
  }

  for (const door of k.get("door")) {
    if (approx(door.pos.x) === x && approx(door.pos.y) === y) {
      return true;
    }
  }

  return false;
}

export function isSpikeAt(spikes, x, y) {
  return spikes.some((spike) => spike.x === x && spike.y === y);
}
