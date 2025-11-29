import { MAX_FORWARD_STEPS } from "../config/constants.js";

const CARD_WIDTH = 214;
const CARD_HEIGHT = 112;
const GAP = 28;
const baseX = 20;
const CARD_PAD = 20;
const CODE_FONT_SIZE = 14;
const SHADOW_OFFSET = { x: 8, y: 10 };
const CARD_BASE_COLOR = { r: 56, g: 70, b: 140 };
const CARD_HOVER_COLOR = { r: 96, g: 120, b: 210 };
const CARD_SHADOW_COLOR = { r: 18, g: 18, b: 35 };

const CLASSIC_CARDS = [
  { label: "Avancer", action: "forward", emoji: "⬆️" },
  { label: "Tourner gauche", action: "left", emoji: "↩️" },
  { label: "Tourner droite", action: "right", emoji: "↪️" },
];

const CODE_CARDS = [
  { action: "forward", code: "robot.moveForward();" },
  { action: "right", code: "robot.turnRight();" },
  { action: "left", code: "robot.turnLeft();" },
];

export function createActionPalette(k, uiY, onSelect) {
  const { add, rect, pos, color, outline, rgb, area, text, anchor, destroy, opacity } = k;

  const state = {
    entities: [],
    currentMode: "classic",
    allowToggle: false,
    shuffleNext: false,
    toggleBtn: null,
    toggleLabel: null,
    forwardMultiplier: false,
    forwardSteps: 1,
    forwardControls: [],
    forwardLabel: null,
    forwardCodeText: null,
  };

  function getCardY() {
    const minY = 32;
    const maxY = Math.max(minY, k.height() - CARD_HEIGHT - 32);
    return Math.max(minY, Math.min(uiY, maxY));
  }

  function getCardsForMode(mode) {
    const source = mode === "code" ? CODE_CARDS : CLASSIC_CARDS;
    return source.map((card) => ({ ...card }));
  }

  function shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

  function clearCards() {
    for (const ent of state.entities) {
      destroy(ent);
    }
    state.entities = [];
  }

  function renderCards() {
    clearCards();
    state.forwardCodeText = null;
    let cards = getCardsForMode(state.currentMode);
    if (state.shuffleNext) {
      shuffleCards(cards);
      state.shuffleNext = false;
    }

    const cardY = getCardY();

    cards.forEach((cardDef, index) => {
      const x = baseX + index * (CARD_WIDTH + GAP);
      const baseColor = rgb(CARD_BASE_COLOR.r, CARD_BASE_COLOR.g, CARD_BASE_COLOR.b);
      const hoverColor = rgb(CARD_HOVER_COLOR.r, CARD_HOVER_COLOR.g, CARD_HOVER_COLOR.b);

      const shadow = add([
        rect(CARD_WIDTH, CARD_HEIGHT, { radius: 12 }),
        pos(x + SHADOW_OFFSET.x, cardY + SHADOW_OFFSET.y),
        color(CARD_SHADOW_COLOR.r, CARD_SHADOW_COLOR.g, CARD_SHADOW_COLOR.b),
        opacity(0.55),
      ]);

      const card = add([
        rect(CARD_WIDTH, CARD_HEIGHT, { radius: 12 }),
        pos(x, cardY),
        color(baseColor),
        outline(3, rgb(120, 140, 220)),
        area(),
        { action: cardDef.action, baseColor, hoverColor },
      ]);

      if (state.currentMode === "code") {
        let codeString = Array.isArray(cardDef.code) ? cardDef.code.join("\n") : cardDef.code;
        if (state.forwardMultiplier && cardDef.action === "forward") {
          codeString = `robot.moveForward(${state.forwardSteps});`;
        }
        const codeText = add([
          text(codeString, {
            size: CODE_FONT_SIZE,
            align: "center",
            width: CARD_WIDTH - CARD_PAD * 2,
          }),
          pos(x + CARD_WIDTH / 2, cardY + CARD_HEIGHT / 2),
          anchor("center"),
        ]);
        if (cardDef.action === "forward") {
          state.forwardCodeText = codeText;
        }
        state.entities.push(codeText);
      } else {
        const icon = add([
          text(cardDef.emoji, { size: 28 }),
          pos(x + CARD_WIDTH / 2, cardY + 38),
          anchor("center"),
        ]);
        const label = add([
          text(cardDef.label, { size: 15 }),
          pos(x + CARD_WIDTH / 2, cardY + CARD_HEIGHT - 28),
          anchor("center"),
        ]);
        state.entities.push(icon, label);
      }

      card.onHoverUpdate(() => {
        card.color = hoverColor;
      });

      card.onHoverEnd(() => {
        card.color = baseColor;
      });

      card.onClick(() => {
        const payload = buildActionPayload(cardDef.action);
        if (!payload) {
          return;
        }
        onSelect(payload);
      });

      state.entities.push(shadow, card);
    });

    updateToggleButton(cardY);
    updateForwardControls(cardY);
  }

  function updateToggleButton(cardY = getCardY()) {
    if (!state.allowToggle) {
      if (state.toggleBtn) {
        destroy(state.toggleBtn);
        state.toggleBtn = null;
      }
      if (state.toggleLabel) {
        destroy(state.toggleLabel);
        state.toggleLabel = null;
      }
      return;
    }

    const btnWidth = 180;
    const btnHeight = 34;
    const btnX = baseX;
    const btnY = cardY - btnHeight - 10;

    if (!state.toggleBtn) {
      state.toggleBtn = add([
        rect(btnWidth, btnHeight),
        pos(btnX, btnY),
        color(60, 60, 100),
        outline(2, rgb(120, 120, 200)),
        area(),
      ]);

      state.toggleBtn.onClick(() => {
        const nextMode = state.currentMode === "code" ? "classic" : "code";
        setMode(nextMode, {
          allowToggle: true,
          forwardMultiplier: state.forwardMultiplier,
        });
      });
    }

    const labelText = state.currentMode === "code" ? "Mode classique" : "Mode pseudo-code";

    if (state.toggleLabel) {
      destroy(state.toggleLabel);
    }

    state.toggleLabel = add([
      text(labelText, { size: 11 }),
      pos(btnX + btnWidth / 2, btnY + btnHeight / 2),
      anchor("center"),
    ]);
  }

  function updateForwardControls(cardY = getCardY()) {
    destroyForwardControls();
    if (!state.forwardMultiplier) {
      return;
    }

    const panelWidth = 190;
    const panelHeight = 46;
    const cardRowWidth = CARD_WIDTH * 3 + GAP * 2;
    const panelX = baseX + Math.max(0, cardRowWidth - panelWidth);
    const panelY = Math.max(16, cardY - panelHeight - 18);

    const panel = add([
      rect(panelWidth, panelHeight, { radius: 10 }),
      pos(panelX, panelY),
      color(25, 25, 50),
      outline(2, rgb(70, 70, 140)),
      opacity(0.95),
    ]);

    const label = add([
      text(`Pas actuel : ${state.forwardSteps}`, { size: 14 }),
      pos(panelX + 12, panelY + panelHeight / 2),
      anchor("left"),
    ]);

    const controlsY = panelY + panelHeight / 2;
    const minusBtn = add([
      rect(26, 26, { radius: 6 }),
      pos(panelX + panelWidth - 66, controlsY - 13),
      color(50, 50, 90),
      outline(2, rgb(90, 90, 160)),
      area(),
    ]);

    const minusLabel = add([
      text("-", { size: 16 }),
      pos(panelX + panelWidth - 53, controlsY),
      anchor("center"),
    ]);

    const plusBtn = add([
      rect(26, 26, { radius: 6 }),
      pos(panelX + panelWidth - 34, controlsY - 13),
      color(50, 50, 90),
      outline(2, rgb(90, 90, 160)),
      area(),
    ]);

    const plusLabel = add([
      text("+", { size: 16 }),
      pos(panelX + panelWidth - 21, controlsY),
      anchor("center"),
    ]);

    minusBtn.onClick(() => {
      adjustForwardSteps(-1);
    });
    plusBtn.onClick(() => {
      adjustForwardSteps(1);
    });

    state.forwardControls = [panel, label, minusBtn, minusLabel, plusBtn, plusLabel];
    state.forwardLabel = label;
  }

  function destroyForwardControls() {
    for (const ent of state.forwardControls) {
      destroy(ent);
    }
    state.forwardControls = [];
    state.forwardLabel = null;
  }

  function adjustForwardSteps(delta) {
    const next = clampSteps(state.forwardSteps + delta);
    if (next === state.forwardSteps) {
      return;
    }
    state.forwardSteps = next;
    if (state.forwardLabel) {
      state.forwardLabel.text = `Pas actuel : ${state.forwardSteps}`;
    }
    if (state.forwardCodeText) {
      state.forwardCodeText.text = `robot.moveForward(${state.forwardSteps});`;
    }
  }

  function clampSteps(value) {
    return Math.max(1, Math.min(value, MAX_FORWARD_STEPS));
  }

  function setMode(mode, options = {}) {
    state.currentMode = mode === "code" ? "code" : "classic";
    state.allowToggle = Boolean(options.allowToggle);
    const nextForward = Boolean(options.forwardMultiplier);
    if (!nextForward) {
      state.forwardSteps = 1;
      destroyForwardControls();
    } else if (!state.forwardMultiplier || typeof options.forwardDefaultSteps === "number") {
      const defaultSteps = typeof options.forwardDefaultSteps === "number" ? options.forwardDefaultSteps : state.forwardSteps;
      state.forwardSteps = clampSteps(defaultSteps || 1);
    }
    state.forwardMultiplier = nextForward;
    if (options.shuffle) {
      state.shuffleNext = true;
    }
    renderCards();
  }

  renderCards();

  return {
    setMode,
    getMode: () => state.currentMode,
  };

  function buildActionPayload(action) {
    if (action === "forward" && state.forwardMultiplier && state.currentMode === "code") {
      return { type: "forward", steps: state.forwardSteps };
    }
    return { type: action };
  }
}
