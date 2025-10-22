export function createPlayButton(k, uiY, onPlay) {
  const { add, rect, pos, color, outline, rgb, area, text, width } = k;

  const button = add([
    rect(140, 60),
    pos(width() - 180, uiY - 10),
    color(80, 180, 80),
    outline(3, rgb(50, 120, 50)),
    area(),
  ]);

  add([
    text("▶️ Exécuter", { size: 18 }),
    pos(width() - 160, uiY + 8),
  ]);

  button.onClick(() => {
    onPlay();
  });

  return button;
}
