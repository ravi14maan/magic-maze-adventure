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

The current prototype includes one sample maze, selection among the three starting characters, keyboard movement (arrow keys or W/A/S/D), touch movement buttons, and restart. Profiles, save data, coin rewards, actual character unlock transactions, the ten worlds and the 50-level campaign remain planned milestones.

## Current status

Planning and documentation baseline. The playable prototype and production implementation are not yet complete.
