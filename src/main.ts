import Phaser from "phaser";
import { ART_READY_CHARACTER_IDS, CHARACTERS, type CharacterId } from "./data/characters";
import { getCharacterArtUrl } from "./data/characterArt";
import {
  AVATAR_ACCESSORIES, AVATAR_BACKGROUNDS, AVATAR_EMOJIS, HAIRSTYLES, OUTFITS,
  activeProfile, addProfile, loadStore, saveStore, updateProfile,
  type PlayerProfile, type ProfileStore
} from "./data/profiles";
import {
  WORLDS, challengeForLevel, challengeLabel, difficultyForLevel, isLevelUnlocked, isWorldUnlocked, levelKey
} from "./data/worlds";
import { GameScene, type MazeProgress, type MazeReward } from "./game/GameScene";
import type { MazeSession } from "./game/GameScene";
import { gameAudio } from "./audio/SoundManager";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root #app was not found.");

type Screen = "profiles" | "dashboard" | "worlds" | "levels" | "characters" | "avatar" | "settings" | "play" | "result";
let store: ProfileStore = loadStore();
let screen: Screen = store.profiles.length ? "profiles" : "profiles";
let currentWorldIndex = 0;
let currentLevel = 1;
let currentReward: MazeReward | null = null;
let game: Phaser.Game | null = null;
let currentScene: GameScene | null = null;

const profile = (): PlayerProfile | null => activeProfile(store);
const DEFAULT_WARDROBE = { hairstyle: "🌸", outfit: "👗", accessory: "✨" };
const configureAudio = (p: PlayerProfile | null): void => {
  gameAudio.configure(p?.soundEnabled ?? true, p?.musicEnabled ?? false);
};
configureAudio(profile());
const persist = (): void => saveStore(store);
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
const avatarMarkup = (p: PlayerProfile): string =>
  `<span class="avatar-face" style="--avatar-bg:${p.avatar.background}">${p.avatar.emoji}<i>${p.avatar.accessory}</i></span>`;
const progressCount = (p: PlayerProfile): number => p.completedLevels.length;
const currentProfileOrThrow = (): PlayerProfile => {
  const p = profile();
  if (!p) throw new Error("Choose a player profile first.");
  return p;
};

function destroyGame(): void {
  currentScene = null;
  if (game) {
    game.destroy(true);
    game = null;
  }
}

function notify(message: string): void {
  let el = document.querySelector<HTMLElement>("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  if (el) {
    el.textContent = message;
    el.classList.add("show");
    window.setTimeout(() => el.classList.remove("show"), 2300);
  }
}

function renderProfiles(): void {
  app!.innerHTML = `
    <main class="screen screen-center">
      <div class="brand-mark">✨</div>
      <p class="eyebrow">A magical adventure by Ahana</p>
      <h1 class="brand-title">Magic Maze<br><span>Adventure</span></h1>
      <p class="lead">Choose who is going on an adventure today.</p>
      <section class="profile-shell">
        <h2>Who's playing?</h2>
        <div class="profile-list">
          ${store.profiles.map(p => `
            <button class="profile-choice" data-action="select-profile" data-id="${escapeHtml(p.id)}">
              ${avatarMarkup(p)}
              <span><strong>${escapeHtml(p.nickname)}</strong><small>${progressCount(p)} levels complete · 🪙 ${p.coins}</small></span>
              <b>›</b>
            </button>`).join("") || '<p class="muted">No player profiles yet. Create the first adventurer!</p>'}
        </div>
        <form class="create-profile" data-form="create-profile">
          <label for="profile-name">Create a new player</label>
          <div class="inline-form">
            <input id="profile-name" name="nickname" maxlength="18" placeholder="Enter a nickname" required autocomplete="off">
            <button class="primary-button" type="submit">Create <span>✦</span></button>
          </div>
        </form>
      </section>
      <p class="fine-print">Profiles stay on this device. No account, photo upload or chat.</p>
    </main>`;
}

function renderDashboard(): void {
  const p = currentProfileOrThrow();
  app!.innerHTML = `
    <main class="screen dashboard-screen">
      <header class="topbar">
        <div class="brand-small"><span>✨</span> Magic Maze</div>
        <button class="profile-switch" data-action="profiles">${avatarMarkup(p)}<span>${escapeHtml(p.nickname)}</span><b>⌄</b></button>
      </header>
      <section class="welcome-banner">
        <div class="welcome-copy">
          <p class="eyebrow">YOUR NEXT ADVENTURE</p>
          <h1>Ready, ${escapeHtml(p.nickname)}?</h1>
          <p>Twisty paths, secret treasures and magical surprises are waiting!</p>
          <button class="primary-button large-button" data-action="worlds">Play Adventure <span>➜</span></button>
        </div>
        <div class="banner-art" aria-hidden="true"><span>🦄</span><i>✦</i><b>🌈</b></div>
      </section>
      <section class="stat-row">
        <div class="stat-card"><span>🪙</span><strong>${p.coins}</strong><small>Magic coins</small></div>
        <div class="stat-card"><span>💎</span><strong>${p.gems}</strong><small>Gems</small></div>
        <div class="stat-card"><span>🏆</span><strong>${p.trophies}</strong><small>Trophies</small></div>
        <div class="stat-card"><span>🗺️</span><strong>${progressCount(p)}/75</strong><small>Levels done</small></div>
      </section>
      <section class="dashboard-grid">
        <button class="feature-card character-feature" data-action="characters"><span class="feature-icon">🧙‍♀️</span><span><strong>Character Closet</strong><small>Choose heroes and unlock friends</small></span><b>›</b></button>
        <button class="feature-card avatar-feature" data-action="avatar"><span class="feature-icon">🎨</span><span><strong>Avatar Studio</strong><small>Make your own cartoon profile</small></span><b>›</b></button>
        <button class="feature-card world-feature" data-action="worlds"><span class="feature-icon">🌍</span><span><strong>World Map</strong><small>15 magical worlds · 75 levels</small></span><b>›</b></button>
        <button class="feature-card settings-feature" data-action="settings"><span class="feature-icon">🎵</span><span><strong>Sound & Settings</strong><small>Music, sound effects and controls</small></span><b>›</b></button>
      </section>
      <footer class="screen-footer">Made with imagination by Ahana ✨</footer>
    </main>`;
}

function renderWorlds(): void {
  const p = currentProfileOrThrow();
  app!.innerHTML = `
    <main class="screen content-screen">
      ${subHeader("World Map", "Complete all five levels to unlock the next world.", "dashboard")}
      <div class="world-grid">
        ${WORLDS.map((world, i) => {
          const unlocked = isWorldUnlocked(p.completedLevels, i);
          const done = [1,2,3,4,5].filter(n => p.completedLevels.includes(levelKey(i,n))).length;
          return `
            <button class="world-card ${unlocked ? "" : "locked"}" data-action="world" data-index="${i}" ${unlocked ? "" : "disabled"}>
              <div class="world-art world-art-${world.backdrop}" style="--world-bg:${world.sky};--world-wall:#${world.wall.toString(16).padStart(6,"0")}"><span>${world.icon}</span><i>${unlocked ? "✦" : "🔒"}</i></div>
              <strong>${world.name}</strong><small>${world.description}</small>
              <span class="world-progress">${unlocked ? `${done}/5 levels complete` : "Complete the world before this one"}</span>
            </button>`;
        }).join("")}
      </div>
    </main>`;
}

function subHeader(title: string, subtitle: string, back: string): string {
  return `
    <header class="content-header">
      <button class="back-button" data-action="${back}" aria-label="Go back">←</button>
      <div><p class="eyebrow">MAGIC MAZE ADVENTURE</p><h1>${title}</h1><p>${subtitle}</p></div>
      <div class="header-coins">🪙 ${profile()?.coins ?? 0}</div>
    </header>`;
}

function renderLevels(): void {
  const p = currentProfileOrThrow();
  const world = WORLDS[currentWorldIndex]!;
  app!.innerHTML = `
    <main class="screen content-screen">
      ${subHeader(world.name, world.description, "worlds")}
      <div class="level-world-banner" style="--world-bg:${world.sky}">
        <span>${world.icon}</span><div><strong>Chapter ${currentWorldIndex + 1}</strong><small>Five paths to master · ${[1,2,3,4,5].filter(n=>p.completedLevels.includes(levelKey(currentWorldIndex,n))).length}/5 completed</small></div>
      </div>
      <div class="level-grid">
        ${[1,2,3,4,5].map(n => {
          const unlocked = isLevelUnlocked(p.completedLevels,currentWorldIndex,n);
          const done = p.completedLevels.includes(levelKey(currentWorldIndex,n));
          const challenge = challengeForLevel(n,currentWorldIndex);
          const difficulty = difficultyForLevel(n,currentWorldIndex);
          const icons: Record<string,string> = {classic:"🧩",monster:"👾",obstacle:"⚡","key-door":"🗝️",tricky:"🔮"};
          return `
            <button class="level-card ${done ? "done" : ""} ${unlocked ? "" : "locked"}" data-action="level" data-level="${n}" ${unlocked ? "" : "disabled"}>
              <span class="level-number">${done ? "✓" : unlocked ? n : "🔒"}</span>
              <strong>Level ${n}</strong>
              <span class="difficulty-chip difficulty-${difficulty.rank}">${difficulty.label}</span>
              <small>${icons[challenge]} ${challengeLabel(challenge)}</small>
              <span class="level-stars">${done ? "★★★" : "☆☆☆"}</span>
            </button>`;
        }).join("")}
      </div>
      <div class="hint-card">💡 <span>Tip: Look for coins and sparkling gems on your way. Watch out for traps and monsters!</span></div>
    </main>`;
}

function renderHeroPortrait(id: CharacterId): string {
  const readableName = id.replaceAll("-", " ");
  return '<img class="hero-art-portrait" src="' + getCharacterArtUrl(id) + '" alt="' + readableName + '" loading="lazy">';
}

function renderCharacters(): void {
  const p = currentProfileOrThrow();
  const wardrobe = p.wardrobe ?? DEFAULT_WARDROBE;
  const selectedHero = CHARACTERS.find(ch => ch.id === p.selectedCharacter) ?? CHARACTERS[0]!;
  app!.innerHTML = `
    <main class="screen content-screen">
      ${subHeader("Character Closet", "Ten magical heroes. Unlock your favourites with coins and collect their power.", "dashboard")}
      <div class="character-grid-v2">
        ${CHARACTERS.filter(ch => ART_READY_CHARACTER_IDS.includes(ch.id)).map(ch => {
          const owned = p.unlockedCharacters.includes(ch.id);
          const selected = p.selectedCharacter === ch.id;
          return `
            <article class="hero-card ${owned ? "" : "locked"} ${selected ? "selected" : ""}">
              <div class="hero-portrait" style="--hero-colour:#${ch.colour.toString(16).padStart(6,"0")}">
                ${renderHeroPortrait(ch.id)}
                ${owned ? "" : '<span class="hero-lock">🔒</span>'}
              </div>
              <strong>${ch.name}</strong>
              <small>${ch.description}</small>
              <div class="hero-power">⭐ Power ${ch.powerPoints.toLocaleString("en-IN")}</div>
              ${owned
                ? `<button class="select-hero" data-action="select-character" data-id="${ch.id}">${selected ? "✓ Selected" : "Choose hero"}</button>`
                : `<button class="unlock-hero" data-action="unlock-character" data-id="${ch.id}">🪙 ${ch.coinCost.toLocaleString("en-IN")} coins</button>`}
            </article>`;
        }).join("")}
      </div>
      <section class="wardrobe-panel">
        <div class="wardrobe-heading">
          <div><p class="eyebrow">COSMETIC CUSTOMISATION</p><h2>Character Wardrobe</h2></div>
          <span class="wardrobe-preview" id="wardrobe-preview">${wardrobe.hairstyle} ${wardrobe.outfit} ${wardrobe.accessory}</span>
        </div>
        <div class="wardrobe-live-preview">
          <div class="wardrobe-live-figure">
            ${renderHeroPortrait(selectedHero.id)}
            <span class="wardrobe-live-item wardrobe-hair">${wardrobe.hairstyle}</span>
            <span class="wardrobe-live-item wardrobe-outfit">${wardrobe.outfit}</span>
            <span class="wardrobe-live-item wardrobe-accessory">${wardrobe.accessory}</span>
          </div>
          <div class="wardrobe-live-copy">
            <strong>${selectedHero.name}'s look</strong>
            <p>Tap any item below to preview it on your selected hero. Your choices are saved to this player profile and appear as decorations while you play.</p>
            <ul>
              <li><b>Hairstyle</b> adds a head decoration.</li>
              <li><b>Outfit</b> adds a costume badge.</li>
              <li><b>Accessory</b> adds a sparkle, bow, wing or charm.</li>
            </ul>
          </div>
        </div>
        <h3>Hairstyle</h3>
        <div class="choice-row">${HAIRSTYLES.map(e=>`<button type="button" class="choice-chip ${wardrobe.hairstyle===e?"active":""}" data-action="wardrobe-hair" data-value="${e}">${e}</button>`).join("")}</div>
        <h3>Outfit</h3>
        <div class="choice-row">${OUTFITS.map(e=>`<button type="button" class="choice-chip ${wardrobe.outfit===e?"active":""}" data-action="wardrobe-outfit" data-value="${e}">${e}</button>`).join("")}</div>
        <h3>Accessory</h3>
        <div class="choice-row">${AVATAR_ACCESSORIES.map(e=>`<button type="button" class="choice-chip ${wardrobe.accessory===e?"active":""}" data-action="wardrobe-accessory" data-value="${e}">${e}</button>`).join("")}</div>
        <p class="fine-print">Wardrobe items are cosmetic, do not change hero power, and are saved separately for each player profile.</p>
      </section>
      <div class="hint-card">🪙 Earn coins by completing levels and collecting treasure. Power points are the hero rating; coins are the unlock price.</div>
    </main>`;
}


function renderSettings(): void {
  const p = currentProfileOrThrow();
  app!.innerHTML = `
    <main class="screen content-screen">
      ${subHeader("Sound & Settings", "Choose how Magic Maze Adventure sounds and feels.", "dashboard")}
      <section class="settings-panel">
        <div class="setting-row"><div class="setting-icon">🔔</div><div><strong>Sound effects</strong><small>Movement, treasure, traps and level-complete sounds</small></div><button class="toggle-button ${p.soundEnabled !== false ? "enabled" : ""}" data-action="settings-sound">${p.soundEnabled !== false ? "ON" : "OFF"}</button></div>
        <div class="setting-row"><div class="setting-icon">🎵</div><div><strong>Background music</strong><small>Original storybook melody with harmony and bass</small></div><button class="toggle-button ${p.musicEnabled === true ? "enabled" : ""}" data-action="settings-music">${p.musicEnabled === true ? "ON" : "OFF"}</button></div>
        <div class="setting-row"><div class="setting-icon">🎮</div><div><strong>Movement controls</strong><small>Use the on-screen arrows or keyboard arrow keys / W A S D.</small></div></div>
        <div class="setting-row"><div class="setting-icon">💾</div><div><strong>Save progress</strong><small>Profile progress, rewards and unlocked heroes are saved on this device.</small></div></div>
      </section>
      <div class="hint-card">🔒 This game has no chat, ads, real-money purchases or photo uploads.</div>
    </main>`;
}

function renderAvatar(): void {
  const p = currentProfileOrThrow();
  app!.innerHTML = `
    <main class="screen content-screen">
      ${subHeader("Avatar Studio", "Create a fun cartoon look for your player profile.", "dashboard")}
      <form class="avatar-editor" data-form="avatar">
        <div class="avatar-preview" style="--avatar-bg:${p.avatar.background}">
          <span>${p.avatar.emoji}</span><i>${p.avatar.accessory}</i>
        </div>
        <label for="avatar-nickname">Player nickname</label>
        <input id="avatar-nickname" name="nickname" maxlength="18" required value="${escapeHtml(p.nickname)}">
        <h3>Choose your cartoon face</h3>
        <div class="choice-row">
          ${AVATAR_EMOJIS.map(e=>`<button type="button" class="choice-chip ${p.avatar.emoji===e?"active":""}" data-action="avatar-emoji" data-value="${e}">${e}</button>`).join("")}
        </div>
        <h3>Choose a background</h3>
        <div class="choice-row">
          ${AVATAR_BACKGROUNDS.map(c=>`<button type="button" class="colour-chip ${p.avatar.background===c?"active":""}" style="--chip:${c}" data-action="avatar-bg" data-value="${c}" aria-label="Choose background"></button>`).join("")}
        </div>
        <h3>Add a little sparkle</h3>
        <div class="choice-row">
          ${AVATAR_ACCESSORIES.map(e=>`<button type="button" class="choice-chip ${p.avatar.accessory===e?"active":""}" data-action="avatar-accessory" data-value="${e}">${e}</button>`).join("")}
        </div>
        <button class="primary-button wide-button" type="submit">Save my avatar ✨</button>
      </form>
      <p class="fine-print">Avatars use in-game cartoon choices. Real-photo uploads are not supported.</p>
    </main>`;
}

function renderPlay(): void {
  const p = currentProfileOrThrow();
  const world = WORLDS[currentWorldIndex]!;
  const challenge = challengeForLevel(currentLevel,currentWorldIndex);
  const difficulty = difficultyForLevel(currentLevel,currentWorldIndex);
  app!.innerHTML = `
    <main class="play-screen">
      <header class="play-topbar">
        <button class="play-back" data-action="levels" aria-label="Back to levels">← <span>Map</span></button>
        <div class="play-title"><strong>${world.icon} ${world.name}</strong><small>Level ${currentLevel} · Side-view Adventure</small></div>
        <span class="difficulty-chip difficulty-${difficulty.rank}" id="play-difficulty">${difficulty.label}</span>
        <div class="play-wallet">🪙 <b id="hud-coins">0</b></div>
        <button class="pause-button" data-action="pause">Ⅱ</button>
      </header>
      <div class="play-hud">
        <span id="hud-hearts">❤️❤️❤️❤️❤️</span>
        <span id="hud-gems">💎 0</span>
        <span id="hud-key">🚩 Challenge ahead</span>
        <span class="hud-tip">Tap ▶ once to walk · ▲ to jump · ▼ to duck · tap ▶ again to stop</span>
      </div>
      <div class="maze-stage" id="maze-host"></div>
      <div class="play-controls">
        <div class="dpad">
          <span></span><button data-action="move" data-dir="up" aria-label="Move up">▲</button><span></span>
          <button data-action="move" data-dir="left" aria-label="Move left">◀</button>
          <button data-action="move" data-dir="down" aria-label="Move down">▼</button>
          <button id="dpad-forward" data-action="move" data-dir="right" aria-label="Start or stop walking forward" aria-pressed="false">▶</button>
        </div>
        <div class="control-help"><strong>Walk, jump and duck!</strong><small>Tap ▶ once to walk · ▲ jump · ▼ duck</small></div>
      </div>
    </main>`;
  const session: MazeSession = { characterId: p.selectedCharacter, worldIndex: currentWorldIndex, levelNumber: currentLevel, challenge, world, appearance: p.wardrobe ?? DEFAULT_WARDROBE };
  // Keep a direct reference to the exact scene instance. Phaser's SceneManager
  // lookup can be unavailable while the first frame is booting; the controls
  // must not depend on that lookup returning a scene immediately.
  const scene = new GameScene(session, updateHud, completeLevel);
  currentScene = scene;
  game = new Phaser.Game({
    type: Phaser.AUTO, parent: "maze-host", width: 420, height: 600, backgroundColor: world.sky,
    scene: [scene],
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, pixelArt: false, roundPixels: true }
  });

  // Use pointer events directly on the D-pad. This works for Android touch,
  // mouse and stylus and avoids relying on a delegated click bubbling through
  // the Phaser canvas or its parent.
  const directions: Record<string, [number, number]> = {
    up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]
  };
  document.querySelectorAll<HTMLButtonElement>(".dpad [data-dir]").forEach((control) => {
    const handler = (event: PointerEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      const delta = directions[control.dataset.dir ?? ""];
      if (!delta || !currentScene) {
        if (!currentScene) notify("The adventure is still loading. Please tap again.");
        return;
      }
      gameAudio.unlock();
      gameAudio.play("move");
      if (delta[0] > 0) {
        const walking = currentScene.toggleAutoWalk();
        control.classList.toggle("auto-walking", walking);
        control.setAttribute("aria-pressed", String(walking));
        return;
      }
      currentScene.move(delta[0], delta[1]);
    };
    control.addEventListener("pointerdown", handler, { passive: false });
    control.addEventListener("click", (event) => event.preventDefault());
  });
}

function updateHud(data: MazeProgress): void {
  const hearts = document.querySelector<HTMLElement>("#hud-hearts");
  const coins = document.querySelector<HTMLElement>("#hud-coins");
  const gems = document.querySelector<HTMLElement>("#hud-gems");
  const key = document.querySelector<HTMLElement>("#hud-key");
  if (hearts) hearts.textContent = "❤️".repeat(data.hearts) + "🖤".repeat(5-data.hearts);
  if (coins) coins.textContent = String(data.coins);
  if (gems) gems.textContent = `💎 ${data.gems}`;
  if (key) key.textContent = data.hasKey ? "✨ Challenge cleared" : "🚩 Challenge ahead";
  const forward = document.querySelector<HTMLButtonElement>("#dpad-forward");
  if (forward) {
    forward.classList.toggle("auto-walking", data.walking);
    forward.setAttribute("aria-pressed", String(data.walking));
  }
  if (/collected|Treasure chest|found|activated|complete|portal reached/i.test(data.message)) gameAudio.play("collect");
  else if (/trap|monster|lost/i.test(data.message)) gameAudio.play("hurt");
  else if (/wall blocks|still hidden|locked/i.test(data.message)) gameAudio.play("click");
  notify(data.message);
}

function completeLevel(reward: MazeReward): void {
  const p = currentProfileOrThrow();
  const key = levelKey(currentWorldIndex,currentLevel);
  const alreadyDone = p.completedLevels.includes(key);
  const paidReward = alreadyDone ? { ...reward, coins: 8, gems: 0 } : reward;
  if (!alreadyDone) p.completedLevels.push(key);
  p.coins += paidReward.coins;
  p.gems += paidReward.gems;
  p.trophies += alreadyDone ? 0 : paidReward.stars;
  updateProfile(store,p);
  gameAudio.play("success");
  currentReward = { ...paidReward, stars: alreadyDone ? 1 : reward.stars };
  screen = "result";
  render();
}

function renderResult(): void {
  const r = currentReward ?? {coins:0,gems:0,stars:1,challenge:"classic" as const};
  app!.innerHTML = `
    <main class="screen screen-center result-screen">
      <div class="result-confetti">🎉 ✨ 🌟</div>
      <p class="eyebrow">ADVENTURE COMPLETED</p>
      <h1 class="brand-title">Amazing job!</h1>
      <p class="lead">You completed your magical adventure!</p>
      <div class="result-stars">${"⭐".repeat(r.stars)}${"☆".repeat(3-r.stars)}</div>
      <div class="reward-row"><div><span>🪙</span><strong>+${r.coins}</strong><small>Coins</small></div><div><span>💎</span><strong>+${r.gems}</strong><small>Gems</small></div><div><span>🏆</span><strong>+${r.stars}</strong><small>Trophy stars</small></div></div>
      <p class="result-note">${currentLevel===5 ? "World chapter complete! A new world may now be open." : "A new level is waiting for you."}</p>
      <button class="primary-button large-button" data-action="next-level">${currentLevel===5 ? "Back to World Map" : "Next Level"} ➜</button>
      <button class="secondary-button" data-action="levels">Choose another level</button>
      <button class="text-button" data-action="dashboard">Main menu</button>
    </main>`;
}

function render(): void {
  if (screen !== "play") destroyGame();
  if (screen === "profiles") renderProfiles();
  else if (screen === "dashboard") renderDashboard();
  else if (screen === "worlds") renderWorlds();
  else if (screen === "levels") renderLevels();
  else if (screen === "characters") renderCharacters();
  else if (screen === "avatar") renderAvatar();
  else if (screen === "settings") renderSettings();
  else if (screen === "play") renderPlay();
  else renderResult();
}

function startLevel(level: number): void {
  currentLevel = level;
  screen = "play";
  render();
}

app.addEventListener("click", (event) => {
  gameAudio.unlock();
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLElement>("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const p = profile();

  if (action === "select-profile") {
    store.activeProfileId = button.dataset.id ?? null; persist(); configureAudio(profile()); screen = "dashboard"; render();
  } else if (action === "profiles") {
    screen = "profiles"; render();
  } else if (action === "create-profile") {
    screen = "profiles"; render();
  } else if (action === "dashboard") {
    screen = "dashboard"; render();
  } else if (action === "worlds") {
    screen = "worlds"; render();
  } else if (action === "world") {
    const index = Number(button.dataset.index);
    if (p && isWorldUnlocked(p.completedLevels,index)) { currentWorldIndex=index; screen="levels"; render(); }
  } else if (action === "levels") {
    screen = "levels"; render();
  } else if (action === "level") {
    const level = Number(button.dataset.level);
    if (p && isLevelUnlocked(p.completedLevels,currentWorldIndex,level)) startLevel(level);
  } else if (action === "characters") {
    screen = "characters"; render();
  } else if (action === "select-character" && p) {
    const id = button.dataset.id as CharacterId;
    if (p.unlockedCharacters.includes(id)) { p.selectedCharacter=id; updateProfile(store,p); render(); }
  } else if (action === "unlock-character" && p) {
    const ch = CHARACTERS.find(c=>c.id===button.dataset.id);
    if (ch && !p.unlockedCharacters.includes(ch.id)) {
      if (p.coins < ch.coinCost) notify(`You need ${ch.coinCost-p.coins} more coins for ${ch.name}.`);
      else { p.coins-=ch.coinCost; p.unlockedCharacters.push(ch.id); p.selectedCharacter=ch.id; updateProfile(store,p); notify(`${ch.name} joined your adventure!`); render(); }
    }
  } else if (action === "avatar") {
    screen="avatar";render();
  } else if (action === "settings") {
    screen="settings";render();
  } else if ((action === "wardrobe-hair" || action === "wardrobe-outfit" || action === "wardrobe-accessory") && p) {
    p.wardrobe = p.wardrobe ?? { ...DEFAULT_WARDROBE };
    const value = button.dataset.value ?? "";
    if (action === "wardrobe-hair") p.wardrobe.hairstyle = value;
    if (action === "wardrobe-outfit") p.wardrobe.outfit = value;
    if (action === "wardrobe-accessory") p.wardrobe.accessory = value;
    updateProfile(store,p);render();
  } else if (action === "settings-sound" && p) {
    p.soundEnabled = p.soundEnabled === false;
    updateProfile(store,p);configureAudio(p);gameAudio.play("click");render();
  } else if (action === "settings-music" && p) {
    p.musicEnabled = p.musicEnabled !== true;
    updateProfile(store,p);configureAudio(p);gameAudio.play("click");render();
  } else if (action === "avatar-emoji" && p) {
    p.avatar.emoji=button.dataset.value??"👧";updateProfile(store,p);render();
  } else if (action === "avatar-bg" && p) {
    p.avatar.background=button.dataset.value??"#ffe0ef";updateProfile(store,p);render();
  } else if (action === "avatar-accessory" && p) {
    p.avatar.accessory=button.dataset.value??"✨";updateProfile(store,p);render();
  } else if (action === "move") {
    // D-pad movement is handled by the direct pointerdown bindings in renderPlay().
  } else if (action === "pause") {
    if (game && !document.querySelector(".pause-overlay")) {
      game.scene.pause("MazeScene");
      const overlay = document.createElement("div");
      overlay.className = "pause-overlay";
      overlay.innerHTML = `<section class="pause-card"><div class="pause-emoji">⏸️</div><h2>Adventure paused</h2><p>Take a little break, explorer.</p><button class="primary-button wide-button" data-action="resume">Continue maze ▶</button><button class="secondary-button wide-button" data-action="paused-map">Back to level map</button></section>`;
      app!.appendChild(overlay);
    }
  } else if (action === "resume") {
    document.querySelector(".pause-overlay")?.remove();
    game?.scene.resume("MazeScene");
  } else if (action === "paused-map") {
    game?.scene.resume("MazeScene");
    screen = "levels";
    render();
  } else if (action === "next-level") {
    if (currentLevel<5) startLevel(currentLevel+1);
    else { currentWorldIndex=Math.min(WORLDS.length-1,currentWorldIndex+1);screen="worlds";render(); }
  }
});

app.addEventListener("submit",(event)=>{
  gameAudio.unlock();
  const form=event.target as HTMLFormElement;
  if(!(form instanceof HTMLFormElement))return;
  event.preventDefault();
  const data=new FormData(form);
  if(form.dataset.form==="create-profile"){
    const nickname=String(data.get("nickname")??"");
    const p=addProfile(store,nickname);store.activeProfileId=p.id;configureAudio(p);screen="dashboard";render();
  }else if(form.dataset.form==="avatar"){
    const p=currentProfileOrThrow();
    p.nickname=String(data.get("nickname")??p.nickname).trim().slice(0,18)||"Adventurer";
    updateProfile(store,p);screen="dashboard";render();
  }
});

app.addEventListener("input",(event)=>{
  const input=event.target as HTMLInputElement;
  if(input.id==="profile-name")return;
});

render();
