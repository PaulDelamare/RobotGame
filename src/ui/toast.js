export function createToastManager(k) {
  const { add, rect, pos, color, outline, rgb, anchor, text, destroy, wait, width, vec2 } = k;

  const spacing = 12;
  const baseHeight = 56;
  const toasts = [];

  function layout() {
    const centerX = width() / 2;
    const baseY = 56;

    toasts.forEach((entry, index) => {
      const offsetY = baseY + index * (entry.height + spacing);
      const targetPos = vec2(centerX, offsetY);
      entry.bg.pos = targetPos;
      entry.label.pos = targetPos;
    });
  }

  function remove(entry) {
    if (!entry) {
      return;
    }
    const idx = toasts.indexOf(entry);
    if (idx !== -1) {
      toasts.splice(idx, 1);
    }
    if (entry.bg) {
      destroy(entry.bg);
    }
    if (entry.label) {
      destroy(entry.label);
    }
    layout();
  }

  async function show(message, options = {}) {
    const { tone = "info", duration = 2.2 } = options;

    const tones = {
      info: { bg: [60, 110, 200], outline: [120, 160, 240] },
      success: { bg: [60, 150, 110], outline: [100, 190, 150] },
      warning: { bg: [185, 135, 55], outline: [225, 175, 95] },
      danger: { bg: [190, 60, 60], outline: [230, 110, 110] },
    };

    const palette = tones[tone] || tones.info;
    const padding = 48;
    const baseWidth = Math.max(240, Math.min(720, message.length * 12 + padding));
    const approxCharsPerLine = Math.max(20, Math.floor((baseWidth - padding) / 9));
    const lineCount = Math.max(1, Math.ceil(message.length / approxCharsPerLine));
    const boxHeight = baseHeight + (lineCount - 1) * 24;

    const bg = add([
      rect(baseWidth, boxHeight),
      pos(width() / 2, 0),
      color(...palette.bg),
      outline(3, rgb(...palette.outline)),
      anchor("center"),
      { ui: true, z: 10_000 },
    ]);

    const label = add([
      text(message, { size: 18, align: "center", width: baseWidth - padding }),
      pos(width() / 2, 0),
      anchor("center"),
      color(255, 255, 255),
      { ui: true, z: 10_001 },
    ]);

    const entry = { bg, label, height: boxHeight };
    toasts.push(entry);
    layout();

    await wait(duration);

    remove(entry);
  }

  function clear() {
    while (toasts.length) {
      remove(toasts[0]);
    }
  }

  return {
    show,
    clear,
  };
}
