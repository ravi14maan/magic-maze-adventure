# Technical Architecture — Magic Maze Adventure

## Current stack
- Phaser 3 game runtime
- TypeScript
- Vite dev server and web bundler
- Capacitor 8 Android wrapper
- GitHub Actions for type-check/web build and Android debug APK workflows
- Node.js 22; Java 21 for Android workflow

## Current source layout
```
src/
  main.ts                 application entry and Phaser setup
  style.css               page/layout styling
  audio/
    SoundManager.ts        audio-related code
  data/
    characters.ts          character IDs/definitions, starting roster and unlock config
    characterArt.ts        character-art URL mapping and legacy ID aliases
    profiles.ts            profile/wardrobe data types and related logic
    worlds.ts              15-world config, challenge types, difficulty/progression helpers
    worldArt.ts             illustrated world-art atlas generation/loading
  game/
    GameScene.ts            active side-scrolling runner/adventure scene
public/
  assets/                 approved artwork and other static assets
docs/                    design, architecture, status, roadmap and release docs
.github/workflows/         CI and Android APK workflows
```

## Current game architecture
The active gameplay is a side-scrolling runner/adventure, not the older top-down maze concept. The scene creates a themed backdrop, landmarks, ground/platform segments, obstacles/hazards, collectibles and challenge station. It handles player movement, camera/world scrolling, collision and challenge flow. World/character metadata is data-driven in `src/data`.

## Build commands
Node 22 (22.12+ recommended):
```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Android
Capacitor 8 wraps the web build. GitHub Actions is the recommended debug APK build path. The generated `app-debug.apk` is a test build and not production signed. For local Android builds, Android SDK/build tools, Java 21 and Gradle are required.

## Current architecture limitations / planned improvements
- Split the large gameplay scene into focused systems/components where it improves maintainability.
- Add unit/integration/E2E tests for movement, collisions, challenge logic, progression, rewards and persistence.
- Validate profile isolation, save migration/recovery and unlock transactions.
- Improve accessibility, screen-size adaptation and input behavior.
- Document exact art/assets and their source/licensing/approval.
- Do not add tracking, ad, chat, photo upload or unnecessary personal-data SDKs to the child-oriented initial release.
- Verify actual implementation before describing a system as complete.
