# Technical Architecture

## 1. Proposed stack

- **Game runtime:** Phaser 3
- **Language:** TypeScript with strict compiler settings
- **Web tooling:** Vite
- **Mobile packaging (later):** Capacitor
- **Unit tests:** Vitest
- **Browser end-to-end tests:** Playwright
- **CI:** GitHub Actions

Use stable package versions and commit the lockfile. Upgrade dependencies deliberately rather than using floating versions in production.

## 2. Architectural principles

- Keep game rules independent from Phaser scenes where practical.
- Keep player/profile data separate from rendering and UI.
- Treat local persistence as a boundary behind a storage interface.
- Make level layouts and world metadata data-driven.
- Make coin costs and reward values configuration, not hardcoded UI behavior.
- Validate save data and support a save schema version.
- Use deterministic gameplay rules so rewards and unlocks can be tested.
- Keep child privacy as a product requirement, not a late release task.

## 3. Suggested source layout

```text
magic-maze-adventure/
├── public/
│   └── assets/                 # Original, approved game assets
├── src/
│   ├── main.ts                 # Browser entry point
│   ├── game/
│   │   ├── config.ts
│   │   ├── scenes/
│   │   ├── entities/
│   │   └── systems/
│   ├── domain/
│   │   ├── characters/
│   │   ├── profiles/
│   │   ├── progression/
│   │   ├── rewards/
│   │   └── levels/
│   ├── data/
│   │   ├── characters.ts
│   │   └── worlds.ts
│   ├── persistence/
│   ├── ui/
│   └── styles/
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 4. Domain model boundaries

- **Profile domain:** create, rename, switch and delete local profiles; isolate each save slot.
- **Avatar domain:** compose cartoon avatars from predefined assets/options. Do not accept real-photo uploads in v1.
- **Character domain:** immutable character definitions plus profile-owned unlock state and selected character.
- **Progression domain:** world/level completion and sequential world unlocking.
- **Reward domain:** award coins, stars, diamonds, keys, trophies and treasure rewards exactly once per defined event.
- **Maze domain:** movement, collision, hazards, keys/doors, switches, enemies and exits.
- **Persistence domain:** versioned load/save, validation, migration and safe recovery.

## 5. Persistence

Start with browser-local storage abstraction. IndexedDB is preferred for structured profile data and future asset/cache needs; a small localStorage-backed adapter may be used for the first prototype if data volume is small. Capacitor's native storage solution can be integrated during mobile packaging.

Every profile record should have a stable internal ID. The save envelope should include a schema version and profile records. Validate loaded records before use. Never use nickname as the primary key. Ensure currency deductions and character unlock writes are handled as one logical operation.

## 6. Data-driven content

World and level definitions should be structured data rather than hand-coded scene branches. Each world definition contains ordered level IDs, theme metadata and unlock conditions. Each level defines its challenge category, maze layout, start/exit, collectibles, obstacles, enemies and completion condition.

## 7. Security and child privacy

Version 1 should avoid collecting personal data. Do not add analytics that identify a child, ad SDKs, third-party chat, public profiles, GPS/location access, contact access or unrestricted uploads. Nicknames should be optional display labels and the app should not ask for email, phone number or birth date. Publishing privacy disclosures must accurately match the final application and its SDKs.

## 8. Quality strategy

- Unit-test domain rules: unlocks, coin transactions, profile isolation, world progression and reward idempotency.
- Integration-test storage: save/load, corrupted data recovery, schema migration and profile switching.
- E2E-test core user journey: create profile → choose character → play level → earn coins → unlock character → reload → verify ownership.
- Test touch and keyboard controls, responsive layout, pause/resume and offline behavior.
- Run type-check, tests and production build in CI on every pull request.
