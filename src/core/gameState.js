export function createGameState() {
  return {
    robot: null,
    robotDir: null,
    dirMarker: null,
    program: [],
    aliens: [],
    spikes: [],
  keys: [],
  collectedKeys: 0,
  totalKeys: 0,
    door: null,
    doorPos: null,
  doorUnlocked: false,
    initialRobotGrid: null,
    ui: {
      programCards: [],
      programScroll: 0,
      scrollHandlerRegistered: false,
      currentActionIndex: null,
    },
  };
}
