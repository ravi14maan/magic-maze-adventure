import Phaser from "phaser";
import { CHARACTERS, type CharacterId } from "./data/characters";
import { GameScene } from "./game/GameScene";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Application root #app was not found.");
}

let selectedCharacter: CharacterId = "normal-girl";

app.innerHTML = `
  <main class="page-shell">
    <header class="hero">
      <div class="sparkle" aria-hidden="true">✦ ✧ ✦</div>
      <p class="eyebrow">A magical maze game by Ahana</p>
      <h1>Magic Maze Adventure</h1>
      <p class="subtitle">Pick your adventurer and find the way to the exit!</p>
    </header>

    <section class="character-panel" aria-labelledby="character-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Your adventure begins</p>
          <h2 id="character-title">Choose your character</h2>
        </div>
        <span class="roster-count">3 ready · 6 to unlock</span>
      </div>
      <div class="character-grid">
        ${CHARACTERS.map((character) => {
          if (character.initiallyUnlocked) {
            return `
              <button class="character-card ${character.id === selectedCharacter ? "is-selected" : ""}" type="button"
                data-character-id="${character.id}"
                aria-pressed="${character.id === selectedCharacter}">
                <span class="character-token" style="--character-colour:#${character.colour.toString(16).padStart(6, "0")}">${character.token}</span>
                <span class="character-name">${character.name}</span>
                <span class="character-state">Available</span>
              </button>`;
          }
          return `
            <div class="character-card is-locked" aria-label="${character.name}, locked">
              <span class="character-token" style="--character-colour:#${character.colour.toString(16).padStart(6, "0")}">🔒</span>
              <span class="character-name">${character.name}</span>
              <span class="character-state">Unlock with coins</span>
            </div>`;
        }).join("")}
      </div>
      <p class="small-note">The six locked characters will become unlockable with coins earned in the full game.</p>
    </section>

    <section class="game-panel" aria-label="Playable maze">
      <div class="game-status" id="game-status" role="status" aria-live="polite">Loading your maze…</div>
      <div class="game-frame"><div id="game-container"></div></div>
      <div class="game-actions">
        <div class="touch-controls" aria-label="Touch movement controls">
          <button type="button" data-move="up" aria-label="Move up">▲</button>
          <div class="horizontal-controls">
            <button type="button" data-move="left" aria-label="Move left">◀</button>
            <button type="button" data-move="down" aria-label="Move down">▼</button>
            <button type="button" data-move="right" aria-label="Move right">▶</button>
          </div>
        </div>
        <button type="button" class="restart-button" id="restart-button">↻ Restart maze</button>
      </div>
    </section>

    <footer>
      <span>Made with imagination ✨</span>
      <span>Prototype 0.1 · More magical worlds coming soon</span>
    </footer>
  </main>
`;

const statusElement = document.querySelector<HTMLDivElement>("#game-status");
const reportStatus = (message: string): void => {
  if (statusElement) statusElement.textContent = message;
};

const scene = new GameScene(() => selectedCharacter, reportStatus);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: 640,
  height: 500,
  backgroundColor: "#fff9fc",
  scene: [scene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true,
    pixelArt: false
  }
});

document.querySelectorAll<HTMLButtonElement>("[data-character-id]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.characterId as CharacterId | undefined;
    if (!id) return;
    selectedCharacter = id;
    document.querySelectorAll("[data-character-id]").forEach((item) => {
      item.classList.toggle("is-selected", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    scene.setCharacter(id);
    reportStatus(`${CHARACTERS.find((character) => character.id === id)?.name ?? "Character"} is ready. Find the exit!`);
  });
});

const movement: Record<string, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0]
};

document.querySelectorAll<HTMLButtonElement>("[data-move]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.move;
    const delta = direction ? movement[direction] : undefined;
    if (delta) scene.move(delta[0], delta[1]);
  });
});

document.querySelector<HTMLButtonElement>("#restart-button")?.addEventListener("click", () => {
  scene.restart();
});
