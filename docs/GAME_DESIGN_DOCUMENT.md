# Magic Maze Adventure — Game Design Document

**Version:** 1.0  
**Status:** Approved design baseline  
**Game Creator / Creative Director:** Ahana Maan  
**Parent / Project Owner:** Ravinder Maan

## 1. Product vision

Magic Maze Adventure is a colourful, cute, pastel-and-kawaii 2D fantasy maze adventure for children and families. Players create a local profile, choose an owned character, explore themed maze worlds, solve friendly challenges, collect rewards, and unlock additional characters and cosmetics.

The first release is browser-playable. Android and iOS packaging follows after the web experience is stable and tested.

## 2. Target experience and visual direction

- Audience: children and families; intended to be approachable for approximately ages 6–12.
- Art direction: pastel colours, rounded shapes, expressive cartoon characters, friendly effects and readable UI.
- Controls: large touch-friendly movement controls, with keyboard support on desktop.
- Layout: responsive for desktop, tablet and mobile screens.
- Audio: gentle world themes, movement/collectible feedback, and optional sound/music settings.
- Difficulty: gradual progression, with clear instructions and forgiving early levels.

## 3. Core gameplay loop

1. Select or create a local player profile.
2. Choose an owned character and optional cosmetic appearance.
3. Select the currently unlocked world and an available level.
4. Navigate the maze, avoid hazards, solve the level's challenge and collect rewards.
5. Reach the exit and receive a completion result.
6. Earn coins and other rewards, unlock characters/cosmetics, and continue.

Completed levels remain replayable. A player must complete all five levels in the current world before the next world becomes available.

## 4. Character roster

There are nine characters in total. The initial three are fixed by the Game Creator:

| Character | Initial state |
|---|---|
| Normal Girl | Available from profile creation |
| Normal Boy | Available from profile creation |
| Unicorn | Available from profile creation |
| Witch | Unlock with earned coins |
| Princess | Unlock with earned coins |
| Prince | Unlock with earned coins |
| Male Explorer | Unlock with earned coins |
| Knight | Unlock with earned coins |
| Mermaid | Unlock with earned coins |

The six locked characters are visible in character selection with a lock indicator and their coin price. Exact prices and any rarity tiers are balancing parameters and must be play-tested before final release. Unlocks are permanent within the owning profile. No character can be unlocked with real money.

### Character customization

Owned characters may support outfits, hairstyles, hair colours, accessories, hats/crowns/wings, and colour variations. Cosmetic ownership and selected appearance are saved independently per profile. The first playable prototype may use placeholder art while final artwork is produced.

## 5. Profiles and avatar creator

Each device may hold multiple independent local profiles. Each profile has:
- A nickname (avoid requiring a real name).
- A custom cartoon avatar assembled from in-game options.
- Selected playable character and cosmetic appearance.
- Current world and level progress.
- Coins, diamonds, trophies, collected rewards and unlocked characters.
- Audio and gameplay settings.

Avatar creation uses selectable face styles, hairstyles, hair colours, outfits, hats/crowns, wings/accessories and backgrounds. **Real-photo upload is not part of v1.**

Profile data must be isolated: one profile must never see or modify another profile's progress, currency, inventory or character ownership. Provide a clear profile switch flow and confirmation before deleting a profile.

## 6. Worlds and progression

Version 1.0 contains ten worlds in this exact order:

1. Underwater
2. Candy Kingdom
3. Enchanted Forest
4. Scary Cave
5. Frozen Kingdom
6. Space
7. Magic Castle
8. Ghost World
9. Fairy World
10. Crystal Cave

Each world contains five levels (50 levels total). A world has its own backgrounds, maze presentation, obstacles/enemies, collectibles, music and visual effects. The next world unlocks only after all five levels in the current world are completed. Completed levels remain replayable.

## 7. Maze challenge categories

The five challenge categories are:
1. **Classic Maze:** navigate from start to exit.
2. **Monster Maze:** avoid or outsmart roaming monsters.
3. **Obstacle Maze:** avoid traps and moving obstacles.
4. **Key & Door Maze:** collect required keys to open locked doors.
5. **Tricky Maze:** solve puzzles involving switches, hidden paths and maze mechanisms.

All five categories should appear across the 50-level campaign. The exact level-by-level distribution is an implementation/balancing plan and must be documented in level data.

## 8. Collectibles and rewards

The six reward categories are:
- Golden stars
- Magical diamonds
- Special keys
- Gold coins
- Trophies
- Surprise treasure boxes

Coins are the primary unlock currency for characters and cosmetics. Stars can represent level performance; diamonds, keys, trophies and treasure boxes provide additional gameplay goals and rewards. Reward rules must be deterministic and understandable. No loot boxes purchased with money, gambling, or real-money transactions in v1.

## 9. Level completion and saving

A level is completed when the player satisfies its objective and reaches the exit. The result screen summarizes completion and earned rewards. Progress should save after important events such as level completion, rewards, character unlocks and profile changes. Save data must be versioned and validated on load; malformed data should not crash the game. Provide a safe default/recovery path where possible.

## 10. Accessibility and child-friendly design

- Large readable text and touch targets.
- High contrast between maze paths, walls, hazards and interactable objects.
- Avoid relying on colour alone to communicate important states.
- Optional music and sound effects.
- Clear pause/resume and exit controls.
- No public chat, direct messaging, public profiles, location tracking, or unrestricted user-generated uploads.
- No ads or in-app purchases in the initial release.

## 11. Platforms and technology direction

- Web first using Phaser 3, TypeScript and Vite.
- Local/offline-first persistence for profiles and progress.
- Capacitor for subsequent Android and iOS packaging.
- Vitest for unit tests and Playwright for browser end-to-end tests.
- GitHub Actions for automated checks.

## 12. Version 1.0 acceptance criteria

- A new profile receives exactly Normal Girl, Normal Boy and Unicorn as unlocked characters.
- The other six characters are visible and unlockable with earned coins.
- Character unlocks, balances and progress are isolated per profile and persist after restart.
- Ten worlds and five levels per world are represented in level/world data.
- Completing all five levels unlocks the next world; completed levels can be replayed.
- All five challenge types and six reward categories are implemented.
- The avatar creator uses in-game cartoon options only.
- The game supports keyboard and touch interaction and works offline after initial loading where the browser permits.
- No ads, real-money purchases, public communication, or real-photo upload are included.

## 13. Out of scope for v1

Online accounts, cloud sync, multiplayer, public leaderboards, chat, social feeds, user photo uploads, advertisements and in-app purchases. Any later proposal for online features requires a separate privacy and child-safety review.

## 14. Open production decisions

These are deliberately left configurable until play-testing:
- Exact coin prices for each of the six unlockable characters.
- Reward amounts and score/star thresholds.
- Final character/world artwork and licensed/original audio assets.
- Detailed 50-level layouts and challenge distribution.
- Save export/backup strategy and store release metadata.
