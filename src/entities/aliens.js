import { tileCenterPos, signVec } from "../utils/geometry.js";
import { isWallAt, isSpikeAt } from "../utils/collision.js";

export function spawnAliens(k, state, patrols, tileSize) {
  const { add, text, pos, anchor, area, vec2, destroy } = k;

  for (const alien of state.aliens) {
    if (alien.ent) {
      destroy(alien.ent);
    }
  }
  state.aliens = [];

  for (const patrol of patrols) {
    const from = vec2(patrol.from.x, patrol.from.y);
    const to = vec2(patrol.to.x, patrol.to.y);

    const ent = add([
      text("👾", { size: 18 }),
      pos(tileCenterPos(k, tileSize, from.x, from.y)),
      anchor("center"),
      area(),
      "alien",
      { gridPos: vec2(from.x, from.y) },
    ]);

    state.aliens.push({
      ent,
      cur: vec2(from.x, from.y),
      from: vec2(from.x, from.y),
      to: vec2(to.x, to.y),
      dirVec: signVec(k, from, to),
    });
  }
}

export function resetAliens(k, state, patrols, tileSize) {
  spawnAliens(k, state, patrols, tileSize);
}

export function stepAliens(k, state, mapLayout, tileSize) {
  const { vec2 } = k;

  for (const alien of state.aliens) {
    if (alien.cur.x === alien.to.x && alien.cur.y === alien.to.y) {
      const previousFrom = alien.from;
      alien.from = vec2(alien.to.x, alien.to.y);
      alien.to = vec2(previousFrom.x, previousFrom.y);
      alien.dirVec = signVec(k, alien.from, alien.to);
    }

    if (alien.cur.x === alien.to.x && alien.cur.y === alien.to.y) {
      continue;
    }

    const attemptMove = (direction) => {
      const next = alien.cur.add(direction);
      if (isWallAt(k, mapLayout, tileSize, next.x, next.y) || isSpikeAt(state.spikes, next.x, next.y)) {
        return false;
      }
      alien.cur = next;
      return true;
    };

    if (!attemptMove(alien.dirVec)) {
      const previousFrom = alien.from;
      alien.from = vec2(alien.to.x, alien.to.y);
      alien.to = vec2(previousFrom.x, previousFrom.y);
      alien.dirVec = signVec(k, alien.from, alien.to);
      attemptMove(alien.dirVec);
    }

    alien.ent.gridPos = vec2(alien.cur.x, alien.cur.y);
    alien.ent.moveTo(tileCenterPos(k, tileSize, alien.cur.x, alien.cur.y));
  }
}
