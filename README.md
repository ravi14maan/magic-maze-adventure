# Magic Maze Adventure

Magic Maze Adventure is a colourful, child-friendly fantasy **side-scrolling runner/adventure**, created with Ahana Maan's creative direction and developed with adult guidance. Players choose heroes and worlds, run across platforms, avoid hazards, collect rewards and complete challenge-station mini-games.

- Creator / creative director: Ahana Maan
- Project owner / engineering: Ravinder Maan
- Repository: https://github.com/ravi14maan/magic-maze-adventure
- Development branch: `feature/rich-world-environments` (verify branch/PR before contributing)
- Status: playable development alpha; Android debug APKs are testing builds, not production releases.

## Current implementation
- Phaser 3, TypeScript, Vite; Capacitor 8 Android wrapper.
- Side-scrolling scene, movement, scrolling camera, platforms/ground, hazards, collectibles, challenge stations and touch controls.
- 15 worlds configured, 5 levels each; challenge/difficulty data.
- World background atlas and landmarks; environment art needs a major polish pass.
- Character definitions/art loading, unlock/economy, profile/wardrobe data.
- Coins, gems, stars/rewards and challenge mini-game flow.
- Android debug APK workflows in GitHub Actions.

Configured features are not necessarily fully finished or QA-verified. See [Project Status](docs/PROJECT_STATUS.md).

## Worlds (current configuration)
1 Underwater; 2 Candy Kingdom; 3 Enchanted Forest; 4 Scary Cave; 5 Frozen Kingdom; 6 Space; 7 Magic Castle; 8 Ghost World; 9 Fairy World; 10 Crystal Cave; 11 Dragon Valley; 12 Sky Islands; 13 Volcano Realm; 14 Desert Ruins; 15 Rainbow City. Five levels are configured per world. Some worlds share one of 14 backdrop art families.

## Characters
Starting: Normal Girl, Normal Boy, Unicorn. Other definitions: Witch, Princess, Mermaid, Fairy/Moonlit Fairy, Dragon Rider, Star Explorer, Crystal Knight, Prince, Ice Mage. Legacy IDs `male-explorer` and `knight` remain for compatibility. Verify current IDs/mappings in `src/data/characters.ts` and `src/data/characterArt.ts`.

## Run locally
Requirements: Node.js 22 (22.12+ recommended), npm.
```bash
git clone https://github.com/ravi14maan/magic-maze-adventure.git
cd magic-maze-adventure
npm install
npm run dev
```
Checks: `npm run typecheck`, `npm run build`.

## Android debug APK
GitHub Actions is the recommended build path. Open Actions, choose a workflow, and download an APK artifact from a successful run for the intended branch/commit. Extract `app-debug.apk` and test on device. Debug APKs are not production-signed.

## Docs
- [Current status and priorities](docs/PROJECT_STATUS.md)
- [Game design](docs/GAME_DESIGN_DOCUMENT.md)
- [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Development roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Character unlocks](docs/CHARACTER_UNLOCKS.md)
- [AI development workflow](docs/AI_DEVELOPMENT_WORKFLOW.md)
- [Quality/Play Store roadmap](docs/QUALITY_AND_PLAY_STORE_ROADMAP.md)

## Development and priorities
Use feature branches and PRs. Run typecheck/build, test browser/Android as appropriate, and attach screenshots/video for visual/gameplay changes.

Priority order: (1) device QA and gameplay fixes, including current speed/control feel; (2) major world-background/platform/rock overhaul matching supplied rich reference images; (3) approved character art/animation polish; (4) validate 15×5 progression, challenges and economy; (5) automated tests, accessibility and save/profile QA; (6) release assets, privacy review, signing and staged testing.

Initial-release direction is offline-first and child-friendly—no ads, real-money purchases, public chat, photo uploads or unnecessary personal-data collection. Verify actual app/dependencies before release disclosures.
