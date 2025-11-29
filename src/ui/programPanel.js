import { MAX_FORWARD_STEPS } from "../config/constants.js";

const PROGRAM_ITEM_HEIGHT = 42;
const PROGRAM_PANEL_MARGIN_BOTTOM = 140;
const PROGRAM_PANEL_WIDTH = 200;
const PROGRAM_BASE_Y = 10;
const PROGRAM_BASE_X_OFFSET = 220;

function normalizeActionDescriptor(action) {
  if (!action) {
    return { type: "forward", steps: 1 };
  }
  if (typeof action === "string") {
    return { type: action, steps: 1 };
  }
  const type = action.type || action.action || "forward";
  const rawSteps = Number(action.steps ?? 1);
  const steps = Number.isFinite(rawSteps) ? Math.max(1, Math.min(rawSteps, MAX_FORWARD_STEPS)) : 1;
  return { type, steps };
}

function formatActionLabel(descriptor) {
  let baseLabel = "Action inconnue";
  if (descriptor.type === "forward") {
    baseLabel = "Avancer";
  } else if (descriptor.type === "right") {
    baseLabel = "Tourner droite";
  } else if (descriptor.type === "left") {
    baseLabel = "Tourner gauche";
  }
  if (descriptor.type === "forward" && descriptor.steps > 1) {
    return `${baseLabel} : ${descriptor.steps}`;
  }
  return baseLabel;
}

export function createProgramPanel(k, state, uiBaseY) {
  const { add, rect, pos, color, outline, rgb, area, text, anchor, width, onScroll, destroy } = k;

  function getPanelHeight() {
    return Math.max(120, uiBaseY - PROGRAM_BASE_Y - PROGRAM_PANEL_MARGIN_BOTTOM);
  }

  function ensureScrollHandler() {
    if (state.ui.scrollHandlerRegistered) {
      return;
    }

    if (typeof onScroll !== "function") {
      state.ui.scrollHandlerRegistered = true;
      return;
    }

    onScroll((dir) => {
      if (!dir || dir.y === 0) {
        return;
      }

      const panelHeight = getPanelHeight();
      const maxScroll = Math.max(0, state.program.length * PROGRAM_ITEM_HEIGHT - panelHeight);
      if (maxScroll <= 0) {
        return;
      }

      const delta = Math.sign(dir.y) * PROGRAM_ITEM_HEIGHT;
      if (delta === 0) {
        return;
      }

      const nextScroll = state.ui.programScroll + delta;
      state.ui.programScroll = Math.max(0, Math.min(nextScroll, maxScroll));
      render();
    });

    state.ui.scrollHandlerRegistered = true;
  }

  function destroyCards() {
    for (const card of state.ui.programCards) {
      destroy(card);
    }
    state.ui.programCards = [];
  }

  function render() {
    ensureScrollHandler();
    destroyCards();

    if (state.ui.currentActionIndex !== null) {
      if (state.ui.currentActionIndex < 0 || state.ui.currentActionIndex >= state.program.length) {
        state.ui.currentActionIndex = null;
      }
    }

    const baseY = PROGRAM_BASE_Y;
    const baseX = width() - PROGRAM_BASE_X_OFFSET;
    const panelHeight = getPanelHeight();
    const panelTop = baseY + 28;
    const panelBottom = panelTop + panelHeight;

    const maxScroll = Math.max(0, state.program.length * PROGRAM_ITEM_HEIGHT - panelHeight);

    if (state.program.length === 0) {
      state.ui.programScroll = 0;
    } else {
      if (state.ui.currentActionIndex !== null) {
        const actionTop = state.ui.currentActionIndex * PROGRAM_ITEM_HEIGHT;
        const actionBottom = actionTop + PROGRAM_ITEM_HEIGHT;
        if (state.ui.programScroll > actionTop) {
          state.ui.programScroll = actionTop;
        }
        if (state.ui.programScroll + panelHeight < actionBottom) {
          state.ui.programScroll = actionBottom - panelHeight;
        }
      }
      if (state.ui.programScroll > maxScroll) {
        state.ui.programScroll = maxScroll;
      }
      if (state.ui.programScroll < 0) {
        state.ui.programScroll = 0;
      }
    }

    const panel = add([
      rect(PROGRAM_PANEL_WIDTH, panelHeight),
      pos(baseX, panelTop),
      color(30, 30, 60),
      outline(2, rgb(70, 70, 120)),
    ]);
    state.ui.programCards.push(panel);

    const header = add([text("Programme :", { size: 16 }), pos(baseX, baseY)]);
    state.ui.programCards.push(header);

    if (state.program.length === 0) {
      const emptyText = add([
        text("Aucune instruction", { size: 12 }),
        pos(baseX + 12, panelTop + 12),
      ]);
      state.ui.programCards.push(emptyText);
      addScrollButtons(panelTop, panelBottom, baseX, maxScroll);
      return;
    }

    const baseColor = rgb(80, 80, 150);
    const hoverColor = rgb(180, 50, 50);
    const currentColor = rgb(70, 170, 70);

    const startIdx = Math.floor(state.ui.programScroll / PROGRAM_ITEM_HEIGHT);
    const offsetY = -(state.ui.programScroll % PROGRAM_ITEM_HEIGHT);
    const visibleCount = Math.ceil(panelHeight / PROGRAM_ITEM_HEIGHT) + 1;
    const endIdx = Math.min(state.program.length, startIdx + visibleCount);

    const items = [];

    const itemColor = (idx) => (idx === state.ui.currentActionIndex ? currentColor : baseColor);

    const applyHover = (hoverIndex) => {
      for (const item of items) {
        if (item.idx === state.ui.currentActionIndex) {
          item.rect.color = currentColor;
        } else {
          item.rect.color = item.idx >= hoverIndex ? hoverColor : baseColor;
        }
      }
    };

    const clearHover = () => {
      for (const item of items) {
        item.rect.color = itemColor(item.idx);
      }
    };

    for (let i = startIdx; i < endIdx; i++) {
      const actionDescriptor = normalizeActionDescriptor(state.program[i]);
      const itemY = panelTop + 4 + (i - startIdx) * PROGRAM_ITEM_HEIGHT + offsetY;
      const itemBottom = itemY + 36;

      if (itemY < panelTop || itemBottom > panelBottom) {
        continue;
      }

      const label = formatActionLabel(actionDescriptor);

      const btnRect = add([
        rect(PROGRAM_PANEL_WIDTH, 36),
        pos(baseX, itemY),
        color(itemColor(i)),
        outline(2, rgb(100, 100, 200)),
        area(),
        { idx: i },
      ]);

      const btnText = add([
        text(`${i + 1}. ${label}`, { size: 14 }),
        pos(baseX + 8, itemY + 4),
      ]);

      btnRect.onHoverUpdate(() => applyHover(i));
      btnRect.onHoverEnd(() => clearHover());
      btnRect.onClick(() => {
        state.program.splice(i);
        state.ui.currentActionIndex = null;
        render();
      });

      items.push({ rect: btnRect, idx: i });
      state.ui.programCards.push(btnRect, btnText);
    }

    addScrollButtons(panelTop, panelBottom, baseX, maxScroll);
  }

  function addScrollButtons(panelTop, panelBottom, baseX, maxScroll) {
    const { add, rect, pos, color, outline, rgb, area, text } = k;

    const scrollBtnSize = 26;
    const scrollX = baseX + PROGRAM_PANEL_WIDTH + 8;
    const canScrollUp = state.ui.programScroll > 0;
    const canScrollDown = state.ui.programScroll < maxScroll;

    const scrollUpRect = add([
      rect(scrollBtnSize, scrollBtnSize),
      pos(scrollX, panelTop),
      color(canScrollUp ? rgb(90, 90, 160) : rgb(50, 50, 90)),
      outline(2, rgb(70, 70, 120)),
      area(),
    ]);
    const scrollUpText = add([
      text("▲", { size: 12 }),
      pos(scrollX + scrollBtnSize / 2, panelTop + scrollBtnSize / 2),
      anchor("center"),
    ]);

    scrollUpRect.onClick(() => {
      if (!canScrollUp) {
        return;
      }
      state.ui.programScroll = Math.max(0, state.ui.programScroll - PROGRAM_ITEM_HEIGHT);
      render();
    });

    const scrollDownRect = add([
      rect(scrollBtnSize, scrollBtnSize),
      pos(scrollX, panelBottom - scrollBtnSize),
      color(canScrollDown ? rgb(90, 90, 160) : rgb(50, 50, 90)),
      outline(2, rgb(70, 70, 120)),
      area(),
    ]);
    const scrollDownText = add([
      text("▼", { size: 12 }),
      pos(scrollX + scrollBtnSize / 2, panelBottom - scrollBtnSize / 2),
      anchor("center"),
    ]);

    scrollDownRect.onClick(() => {
      if (!canScrollDown) {
        return;
      }
      state.ui.programScroll = Math.min(maxScroll, state.ui.programScroll + PROGRAM_ITEM_HEIGHT);
      render();
    });

    state.ui.programCards.push(scrollUpRect, scrollUpText, scrollDownRect, scrollDownText);
  }

  function addAction(action) {
    state.program.push(normalizeActionDescriptor(action));
    render();
  }

  function setCurrentAction(index) {
    const next = typeof index === "number" ? index : null;
    if (state.ui.currentActionIndex === next) {
      return;
    }
    state.ui.currentActionIndex = next;
    render();
  }

  function clearProgram() {
    state.program.length = 0;
    state.ui.currentActionIndex = null;
    state.ui.programScroll = 0;
    render();
  }

  return {
    render,
    addAction,
    setCurrentAction,
    clearProgram,
    clearCurrentAction: () => setCurrentAction(null),
  };
}
