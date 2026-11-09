# Development Roadmap

The roadmap is milestone-based. Each milestone should be completed and reviewed before expanding scope. The first deliverable is a small playable browser prototype, not all 50 levels at once.

## M0 — Repository and project foundation

- Confirm repository settings and branch conventions.
- Add documentation, TypeScript/Vite/Phaser scaffold and CI.
- Establish asset licensing and contribution conventions.
- Add a small playable placeholder scene.

**Exit criteria:** clean install, development server starts, production build succeeds, CI runs.

## M1 — Game shell and controls

- Phaser game configuration and responsive canvas.
- Boot, preloader and main-menu scenes.
- Keyboard and touch movement input.
- Pause/resume and basic audio settings.

**Exit criteria:** player can move through a small test maze on desktop and mobile-sized viewport.

## M2 — Profiles and cartoon avatar

- Multiple local profiles with independent save slots.
- Profile creation, selection, switching and safe deletion.
- Nickname and in-game cartoon avatar creator.
- Save/load and corrupted-save fallback.

**Exit criteria:** two profiles can be created and tested without progress or data leakage.

## M3 — Character roster and unlocks

- Nine character definitions.
- Initial roster: Normal Girl, Normal Boy, Unicorn.
- Six coin-unlockable characters.
- Character selection and basic cosmetics.
- Profile-specific ownership and selected appearance.

**Exit criteria:** unlock rules pass unit and integration tests; no duplicate coin deduction.

## M4 — Maze engine

- Grid/tile maze representation and level loading.
- Movement, collision, start and exit.
- Collectibles, keys/doors and switches.
- Monster behavior and obstacle/trap interactions.
- Level completion and results.

**Exit criteria:** one polished vertical-slice level with at least two challenge mechanics.

## M5 — Worlds and level progression

- Ten worlds in approved order.
- Five levels per world, data-driven.
- All five challenge categories.
- Sequential world unlock; replay completed levels.
- Gradual difficulty curve and world themes.

**Exit criteria:** all 50 level records validate; progression rules pass tests.

## M6 — Rewards and economy

- Stars, diamonds, keys, coins, trophies and treasure boxes.
- Reward rules and results summary.
- Configurable character/cosmetic prices.
- Balance and exploit checks.

**Exit criteria:** reward accounting is deterministic and profile-specific.

## M7 — QA, accessibility and polish

- Vitest unit suite and Playwright core-flow suite.
- Responsive and touch-device testing.
- Keyboard support and readable visual states.
- Performance, pause/resume and offline testing.
- Save schema validation and recovery.

**Exit criteria:** release checklist completed with no known blocker defects.

## M8 — Mobile packaging and release preparation

- Add Capacitor only after web build is stable.
- Android build, device testing and app signing managed by the parent.
- iOS build and device testing using the required Apple development environment.
- App icon, launch screen, store screenshots and descriptions.
- Privacy/data-safety disclosures, age/content rating and store policy review.

**Exit criteria:** parent has reviewed the final binary, privacy disclosures and store listing before submission.

## Suggested branching

- `main`: stable, reviewed baseline.
- `develop`: integration branch once the project grows.
- `feature/profile-system`
- `feature/character-system`
- `feature/maze-engine`
- `feature/worlds-and-levels`

For a very small initial team, short-lived feature branches and pull requests into `main` are sufficient; avoid unnecessary process overhead.
