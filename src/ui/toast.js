export function createToastManager(k, options = {}) {
  const { add, rect, pos, color, outline, rgb, anchor, text, destroy, wait, width, vec2 } = k;

  const textSize = Math.max(10, options.textSize ?? 12);
  const spacing = Math.max(4, options.spacing ?? 8);
  const paddingX = Math.max(16, options.paddingX ?? 32);
  const paddingY = Math.max(8, options.paddingY ?? 12);
  const lineSpacing = Math.max(4, options.lineSpacing ?? 6);
  const minBoxHeight = Math.max(textSize + paddingY, options.baseHeight ?? textSize + paddingY + 8);
  const approxCharWidth = textSize * 0.65;
  const baseY = Math.max(minBoxHeight / 2 + 8, options.baseY ?? 56);
  const stackDirection = options.stackDirection === -1 ? -1 : 1;
  const toasts = [];

  function layout() {
    const centerX = width() / 2;

    toasts.forEach((entry, index) => {
      const offsetY = baseY + stackDirection * index * (entry.height + spacing);
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
    const baseWidth = Math.max(180, Math.min(560, message.length * approxCharWidth + paddingX));
    const approxCharsPerLine = Math.max(16, Math.floor((baseWidth - paddingX) / approxCharWidth));
    const lineCount = Math.max(1, Math.ceil(message.length / approxCharsPerLine));
    const boxHeight = minBoxHeight + (lineCount - 1) * (textSize + lineSpacing);

    const bg = add([
      rect(baseWidth, boxHeight),
      pos(width() / 2, 0),
      color(...palette.bg),
      outline(3, rgb(...palette.outline)),
      anchor("center"),
      { ui: true, z: 10_000 },
    ]);

    const label = add([
      text(message, { size: textSize, align: "center", width: baseWidth - paddingX }),
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
