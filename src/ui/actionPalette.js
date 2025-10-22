export function createActionPalette(k, uiY, onSelect) {
  const { add, rect, pos, color, outline, rgb, area, text } = k;

  const cards = [
    { label: "Avancer", action: "forward", x: 20 },
    { label: "Tourner gauche", action: "right", x: 160 },
    { label: "Tourner droite", action: "left", x: 320 },
  ];

  for (const cardDef of cards) {
    const card = add([
      rect(120, 70),
      pos(cardDef.x, uiY),
      color(50, 50, 80),
      outline(3, rgb(100, 100, 200)),
      area(),
      { action: cardDef.action },
    ]);

    add([
      text(cardDef.label, { size: 14 }),
      pos(cardDef.x + 10, uiY + 22),
    ]);

    card.onClick(() => {
      onSelect(cardDef.action);
    });
  }
}
