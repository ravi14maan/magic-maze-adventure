# Current Project Status

**Snapshot:** 25 November 2026 | **Branch:** feature/rich-world-environments | **Status:** playable development alpha, not release-ready.

## Game
Magic Maze Adventure is a child-friendly fantasy **side-scrolling runner/adventure**. Select a hero/world, run over platforms, avoid hazards, collect rewards and enter challenge stations for mini-games. This is not currently a finished top-down maze.

## Implemented/configured
- Phaser 3, TypeScript, Vite; Capacitor 8 Android wrapper.
- Side-scrolling scene/camera, movement and touch controls, ground/platforms, hazards and collision/recoil.
- Coins/gems and reward presentation; challenge-station entry/exit and mini-game UI/logic.
- 15 worlds configured, 5 level numbers per world, challenge and difficulty data.
- Illustrated world background atlas and landmarks.
- Character roster/configuration, art-loader, unlock/economy, profile and wardrobe data.
- GitHub Actions Android debug APK build workflows.

Configured features do not necessarily mean all levels or mechanics are fully tested or production quality.

## Characters
Starting roster: Normal Girl, Normal Boy, Unicorn.
Other definitions: Witch, Princess, Mermaid, Fairy/Moonlit Fairy, Dragon Rider, Star Explorer, Crystal Knight, Prince, Ice Mage.
Legacy IDs male-explorer and knight remain in source. Verify IDs and art mappings in src/data/characters.ts and src/data/characterArt.ts.

## Worlds (current source order)
Underwater; Candy Kingdom; Enchanted Forest; Scary Cave; Frozen Kingdom; Space; Magic Castle; Ghost World; Fairy World; Crystal Cave; Dragon Valley; Sky Islands; Volcano Realm; Desert Ruins; Rainbow City.
Five levels are configured per world. The atlas has 14 backdrop families; some worlds share an art family. See src/data/worlds.ts and src/data/worldArt.ts.

## Known work / priorities
**P0 Gameplay QA:** test Android devices; speed, responsiveness, jumping, obstacle timing, collision/recoil, challenge flow, screen sizes and save behavior. Runner speed was changed 150→280 units/sec; animation-cycle value 12→18. Do not slow movement again without tester feedback.
**P1 Environment art overhaul:** backgrounds and environments need a substantial improvement to match the user's reference images. Build layered, richly illustrated scenes with depth/parallax, distinctive landmarks and foreground detail. Improve rocks/platforms—clear silhouette, texture, edge detail, lighting and biome-specific coral/moss/snow/candy/crystal styling. Improve all worlds; small palette/decor changes are not sufficient.
**P2 Character art/animation:** verify exact approved images in gameplay and APK, consistency, animation and scaling. Do not substitute approved artwork without approval.
**P3 Content/balance:** verify 15×5 progression/unlocks/replay; challenges, difficulty, timers, rewards and coin economy.
**P4 Quality:** tests, accessibility/readability, touch targets, save/profile isolation and recovery.
**P5 Release:** icon/splash, privacy disclosures, production signing, Play Console/Families review, closed testing, staged rollout and rollback plan.

## Setup
Node 22 (22.12+ recommended), npm:
```bash
npm install
npm run dev
```
Checks/build: npm run typecheck; npm run build. GitHub Actions is the recommended Android debug APK build path. Debug APKs are not production-signed.

## Next sequence
1. Device QA and gameplay fixes.
2. Major background/platform/rock environment-art upgrade matching supplied reference images.
3. Character artwork and animation polish.
4. Progression/challenge/economy validation.
5. Automated testing, accessibility, privacy and save/profile QA.
6. Release preparation.

Contribute via feature branches and PRs; include screenshots/video, test steps and commit SHA for visual/gameplay work. Never commit secrets, signing keys or child personal information.
