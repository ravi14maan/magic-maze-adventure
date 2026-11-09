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

The current playable demo includes one sample maze, selection among the three starting characters, keyboard movement (arrow keys or W/A/S/D), touch movement buttons, and restart. Profiles, save data, coin rewards, actual character unlock transactions, the ten worlds and the 50-level campaign remain planned milestones.

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
