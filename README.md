# Magic Maze Adventure

A colourful, pastel, kawaii-style 2D fantasy maze adventure designed by **Ahana Maan**.

## Project vision

Build a child-friendly maze adventure with ten themed worlds, five levels per world, collectible rewards, unlockable characters, custom cartoon profile avatars, and independent local player profiles.

## Version 1.0 scope

- 10 worlds × 5 levels = 50 levels.
- Five challenge types: Classic, Monster, Obstacle, Key & Door, and Tricky Maze.
- Nine playable characters.
- Three characters available immediately: **Normal Girl, Normal Boy, Unicorn**.
- Six characters unlockable with earned in-game coins: Witch, Princess, Prince, Male Explorer, Knight, Mermaid.
- Multiple independent profiles on one device.
- Custom cartoon avatars built from in-game options; no photo upload.
- Profile-specific progress, currency, character ownership, and settings.
- Offline-first play; no ads, real-money purchases, public chat, or unrestricted uploads in v1.

## Technology direction

- Phaser 3 + TypeScript for the game.
- Vite for development and web builds.
- Capacitor for later Android and iOS packaging.
- Vitest for unit tests and Playwright for browser end-to-end tests.
- GitHub Actions for continuous integration.

## Documentation

- [Game Design Document](docs/GAME_DESIGN_DOCUMENT.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Character Unlock Configuration](docs/CHARACTER_UNLOCKS.md)
- [AI Development Workflow](docs/AI_DEVELOPMENT_WORKFLOW.md)

## Creative ownership

**Game Creator / Creative Director:** Ahana Maan  
**Parent / Project Owner:** Ravinder Maan

Ahana leads creative decisions. Engineering, testing, privacy, and publishing activities are carried out with adult guidance.

## Run locally

Requirements: Node.js 22.12 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To run the production checks:

```bash
npm run typecheck
npm run build
```

## Current playable version — v0.2

The updated build is designed around a full-screen maze play view. Navigation to the level map is available from the game, and the pause overlay lets the player continue or return to the map.

### Implemented in v0.2

- A 15 × 23-cell long maze generated from a deterministic world/level seed.
- Maze walls, dead ends and branching corridors, with a longer route than v0.1.
- Traps, animated monsters, coins, gems, treasure chests, a golden key and a locked door in the relevant challenge levels.
- Five rotating challenge categories across the 50-stage campaign: Classic, Monster, Obstacle, Key & Door and Tricky.
- Ten themed worlds, each with five playable seeded levels.
- World unlocking after all five levels in the previous world are completed; level-by-level progression and replay.
- Three starting characters: Normal Girl, Normal Boy and Unicorn.
- Six coin-unlockable characters with configurable prices.
- Multiple local player profiles with separate coin balances, character ownership and level progress.
- Cartoon avatar studio with emoji face, background colour and accessory choices.
- Level completion rewards, stars, gems, trophies and a coin wallet.
- Responsive pastel menus, level/world maps, pause/resume and touch D-pad controls.
- Offline-first game assets and local save data; no photo upload, ads, real-money purchases or public chat.

### Prototype limitations

The v0.2 build is a much richer playable alpha, not the final art-polished release. Character/avatar art still uses emoji and simple vector-style game objects. Level layouts are generated procedurally from seeds, not individually hand-authored. The Tricky category currently focuses on key/door and hazard combinations; switches and elaborate hidden-path puzzles are not yet present. Character wardrobe, custom animation sets, music/sound settings, cloud backup, release signing and full physical-device QA remain future work.

### Run locally

Requirements: Node.js 22.12 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To run the production checks:

```bash
npm run typecheck
npm run build
```

## Android demo APK

The Android wrapper uses Capacitor 8. The GitHub Actions workflow builds an installable **debug APK** whenever code is pushed to `main`, and can also be run manually from the Actions tab.

1. Open the repository's **Actions** tab.
2. Select **Android Debug APK** and open the latest successful run.
3. Under **Artifacts**, download `magic-maze-adventure-debug-apk`.
4. Extract the ZIP and copy `app-debug.apk` to the Android phone.
5. Open the APK on the phone and allow installation from that source when Android asks. Only install builds you trust.

This is a development/test build, not a Play Store release. It is unsigned with a production release key and has not completed full device QA.

## Current status

**v0.1 prototype:** one playable sample maze, three selectable starting characters and an Android debug build pipeline.

**Still under development:** independent profiles, cartoon avatar creator, coin earning and character unlock transactions, all ten themed worlds, 50 levels, the remaining challenge mechanics, rewards, save/recovery and release hardening.
