export function createLevelSelector(k, levels, onSelect, options = {}) {
  const { add, rect, pos, color, outline, rgb, area, text, anchor, z } = k;

  const baseX = options.baseX ?? 20;
  const baseY = options.baseY ?? 20;
  const btnWidth = options.buttonWidth ?? 110;
  const btnHeight = options.buttonHeight ?? 32;
  const gap = options.gap ?? 12;
  const idleColor = rgb(35, 40, 80);
  const activeColor = rgb(95, 150, 85);
  const hoverColor = rgb(70, 80, 150);
  const zIndex = options.zIndex ?? 900;
  const showPanel = options.showPanel ?? true;

  const state = {
    items: [],
    activeIndex: 0,
  };

  if (showPanel) {
    const totalWidth = options.width ?? levels.length * btnWidth + (levels.length - 1) * gap;
    add([
      rect(totalWidth + 20, btnHeight + 20, { radius: 10 }),
      pos(baseX - 10, baseY - 10),
      color(15, 15, 30),
      outline(2, rgb(45, 45, 80)),
      z(zIndex - 1),
    ]);
  }

  levels.forEach((level, index) => {
    const x = baseX + index * (btnWidth + gap);

    const button = add([
      rect(btnWidth, btnHeight, { radius: 8 }),
      pos(x, baseY),
      color(idleColor),
      outline(2, rgb(80, 90, 150)),
      area(),
      z(zIndex),
      { index },
    ]);

    const label = add([
      text(`Niveau ${level.id}`, { size: 13 }),
      pos(x + btnWidth / 2, baseY + btnHeight / 2),
      anchor("center"),
      z(zIndex + 1),
    ]);

    button.onHoverUpdate(() => {
      if (state.activeIndex !== index) {
        button.color = hoverColor;
      }
    });

    button.onHoverEnd(() => {
      updateColors();
    });

    button.onClick(() => {
      if (typeof onSelect === "function") {
        onSelect(index);
      }
    });

    state.items.push({ button, label });
  });

  function updateColors() {
    state.items.forEach(({ button }, idx) => {
      button.color = idx === state.activeIndex ? activeColor : idleColor;
    });
  }

  function setActive(index) {
    state.activeIndex = Math.max(0, Math.min(index, levels.length - 1));
    updateColors();
  }

  return {
    setActive,
  };
}
