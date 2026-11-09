# Character Unlock Configuration

**Approved by:** Ahana Maan  
**Specification:** Magic Maze Adventure v1.0

## Roster

| Character | Ownership at new-profile creation | Unlock requirement |
|---|---|---|
| Normal Girl | Unlocked | None |
| Normal Boy | Unlocked | None |
| Unicorn | Unlocked | None |
| Witch | Locked | Earn and spend in-game coins |
| Princess | Locked | Earn and spend in-game coins |
| Prince | Locked | Earn and spend in-game coins |
| Male Explorer | Locked | Earn and spend in-game coins |
| Knight | Locked | Earn and spend in-game coins |
| Mermaid | Locked | Earn and spend in-game coins |

## Rules

1. Every new profile starts with exactly three unlocked characters: Normal Girl, Normal Boy and Unicorn.
2. The other six characters are visible in the selection interface but marked as locked.
3. Coins are earned through gameplay. Character unlocks never require payment with real money.
4. A profile can unlock a character only when its own coin balance is at least the configured price.
5. On successful unlock, deduct the configured price once and record ownership in that profile.
6. Repeated unlock requests for an already-owned character must not deduct coins.
7. An unlock must be atomic: do not deduct coins if the ownership update fails.
8. Ownership is permanent for that profile and persists across game restarts.
9. Character ownership and coin balances must never be shared between profiles.
10. The selected character must always belong to the active profile's unlocked roster.

## Pricing

Prototype v0.2 coin prices are configured in `src/data/characters.ts`: Witch 80, Princess 120, Prince 110, Male Explorer 95, Knight 150 and Mermaid 135 coins. These are initial balancing values for play-testing, not Ahana's final approval. Keep prices in configuration/data rather than hardcoding them into UI logic, and adjust them after observing how quickly players earn coins. Show the price before confirmation and show a clear success message after purchase with coins.

## Suggested data model

```ts
export type CharacterId =
  | "normal-girl"
  | "normal-boy"
  | "unicorn"
  | "witch"
  | "princess"
  | "prince"
  | "male-explorer"
  | "knight"
  | "mermaid";

export interface CharacterDefinition {
  id: CharacterId;
  displayName: string;
  initiallyUnlocked: boolean;
  unlockCostCoins: number | null; // null for starting characters
}

export interface CharacterProgress {
  unlockedCharacterIds: CharacterId[];
  selectedCharacterId: CharacterId;
  coinBalance: number;
}
```

The initial unlock set must be derived from the approved configuration, not from UI order or a random selection.

## Acceptance tests

- New profile contains Normal Girl, Normal Boy and Unicorn and no other unlocked characters.
- Each locked character can be unlocked with sufficient coins.
- Insufficient balance leaves both balance and ownership unchanged.
- A duplicate unlock leaves balance unchanged.
- Unlock state survives reload/restart.
- Two profiles can have different balances and character unlock sets without cross-effects.
- A profile cannot select a character it does not own.
