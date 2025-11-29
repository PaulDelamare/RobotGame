export function createPlayButton(k, uiY, onPlay) {
  const { add, rect, pos, color, outline, rgb, area, text, width, anchor } = k;

  const BUTTON_WIDTH = 160;
  const BUTTON_HEIGHT = 64;
  const buttonX = width() - BUTTON_WIDTH - 40;
  const buttonY = uiY - 12;

  const button = add([
    rect(BUTTON_WIDTH, BUTTON_HEIGHT),
    pos(buttonX, buttonY),
    color(80, 180, 80),
    outline(3, rgb(50, 120, 50)),
    area(),
  ]);

  add([
    text("▶️ Exécuter", { size: 20 }),
    pos(buttonX + BUTTON_WIDTH / 2, buttonY + BUTTON_HEIGHT / 2),
    anchor("center"),
  ]);

  button.onClick(() => {
    onPlay();
  });

  return button;
}
