import { tileCenterPos, signVec } from "../utils/geometry.js";
import { isWallAt, isSpikeAt } from "../utils/collision.js";

export function spawnAliens(k, state, level, tileSize) {
  const { add, text, pos, anchor, area, vec2, destroy } = k;

  for (const alien of state.aliens) {
    if (alien.ent) {
      destroy(alien.ent);
    }
  }
  state.aliens = [];
  state.alienCycle = null;

  const spawnPoints = getAlienSpawns(level);
  const cycleSequence = normalizeCycleSequence(level.alienCycle);

  if (spawnPoints.length > 0 && cycleSequence.length > 0) {
    state.alienCycle = {
      sequence: cycleSequence,
      index: 0,
    };

    spawnPoints.forEach((spawn) => {
      const ent = add([
        text("👾", { size: 18 }),
        pos(tileCenterPos(k, tileSize, spawn.x, spawn.y)),
        anchor("center"),
        area(),
        "alien",
        { gridPos: vec2(spawn.x, spawn.y) },
      ]);

      state.aliens.push({
        type: "cycle",
        ent,
        cur: vec2(spawn.x, spawn.y),
      });
    });
    return;
  }

  const patrols = Array.isArray(level.patrols) ? level.patrols : [];
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
      type: "patrol",
      ent,
      cur: vec2(from.x, from.y),
      from: vec2(from.x, from.y),
      to: vec2(to.x, to.y),
      dirVec: signVec(k, from, to),
    });
  }
}

export function resetAliens(k, state, level, tileSize) {
  spawnAliens(k, state, level, tileSize);
}

export function stepAliens(k, state, mapLayout, tileSize) {
  const { vec2 } = k;

  if (state.alienCycle && state.alienCycle.sequence.length > 0) {
    const dir = state.alienCycle.sequence[state.alienCycle.index];
    const pendingPositions = [];

    for (const alien of state.aliens) {
      const nextX = alien.cur.x + dir.x;
      const nextY = alien.cur.y + dir.y;
      if (isWallAt(k, mapLayout, tileSize, nextX, nextY) || isSpikeAt(state.spikes, nextX, nextY)) {
        pendingPositions.push({ x: alien.cur.x, y: alien.cur.y });
      } else {
        pendingPositions.push({ x: nextX, y: nextY });
      }
    }

    state.aliens.forEach((alien, idx) => {
      const nextPos = pendingPositions[idx];
      alien.cur = vec2(nextPos.x, nextPos.y);
      alien.ent.gridPos = vec2(nextPos.x, nextPos.y);
      alien.ent.moveTo(tileCenterPos(k, tileSize, nextPos.x, nextPos.y));
    });

    state.alienCycle.index = (state.alienCycle.index + 1) % state.alienCycle.sequence.length;
    return;
  }

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

function getAlienSpawns(level) {
  if (Array.isArray(level?.alienSpawns) && level.alienSpawns.length > 0) {
    return level.alienSpawns;
  }

  const spawns = [];
  const map = level?.map || [];
  for (let y = 0; y < map.length; y++) {
    const row = map[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "A") {
        spawns.push({ x, y });
      }
    }
  }
  return spawns;
}

function normalizeCycleSequence(sequence) {
  if (!Array.isArray(sequence)) {
    return [];
  }

  return sequence
    .map((step) => {
      if (typeof step === "string") {
        if (step === "up") return { x: 0, y: -1 };
        if (step === "down") return { x: 0, y: 1 };
        if (step === "left") return { x: -1, y: 0 };
        if (step === "right") return { x: 1, y: 0 };
        return null;
      }
      if (typeof step === "object" && step) {
        const x = Number(step.x);
        const y = Number(step.y);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          return { x, y };
        }
      }
      return null;
    })
    .filter(Boolean);
}
