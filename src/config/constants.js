export const TILE_SIZE = 48;
export const MAX_FORWARD_STEPS = 3;

const MAP_LEVEL_1 = [
  "#######################",
  "#R.....#......^......D#",
  "#..^...#..##.....##...#",
  "#..K...#..##..K..##...#",
  "#..^...#..............#",
  "#......#....##........#",
  "#..^...#....##..##....#",
  "#.....................#",
  "#######################",
];

const PATROLS_LEVEL_1 = [
  { from: { x: 8, y: 1 }, to: { x: 14, y: 1 } },
  { from: { x: 16, y: 3 }, to: { x: 16, y: 6 } },
];

const MAP_LEVEL_2 = [
  "####################",
  "#R..^....#....^...D#",
  "#..##.K..#..^..K..##",
  "#......^....#.....##",
  "#..^......^....^..##",
  "#.................##",
  "####################",
];

const PATROLS_LEVEL_2 = [
  { from: { x: 6, y: 1 }, to: { x: 6, y: 4 } },
  { from: { x: 12, y: 2 }, to: { x: 15, y: 2 } },
];

const MAP_LEVEL_3 = [
  "#######################",
  "#.....................#",
  "#........AA...........#",
  "#R..K............K...D#",
  "#........AA...........#",
  "#.....................#",
  "#######################",
];

const PATROLS_LEVEL_3 = [];

const ALIEN_CYCLE_LEVEL_3 = ["up", "down", "down", "up"];

export const LEVELS = [
  {
    id: 1,
    name: "Découverte",
    map: MAP_LEVEL_1,
    patrols: PATROLS_LEVEL_1,
    cardMode: "classic",
  },
  {
    id: 2,
    name: "Code Lab",
    map: MAP_LEVEL_2,
    patrols: PATROLS_LEVEL_2,
    cardMode: "code",
    allowCardToggle: true,
    shuffleCards: true,
  },
  {
    id: 3,
    name: "Sprint final",
    map: MAP_LEVEL_3,
    patrols: PATROLS_LEVEL_3,
    cardMode: "code",
    allowCardToggle: true,
    shuffleCards: true,
    allowForwardMultiplier: true,
    forwardDefaultSteps: 1,
    alienCycle: ALIEN_CYCLE_LEVEL_3,
    tip: "Ajuste moveForward(x) avec les boutons ± pour doubler ta vitesse.",
  },
];
