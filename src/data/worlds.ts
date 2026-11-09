export type ChallengeType = "classic" | "monster" | "obstacle" | "key-door" | "tricky";

export interface WorldDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  sky: string;
  floor: number;
  wall: number;
  accent: number;
}

export const WORLDS: readonly WorldDefinition[] = [
  { id: "underwater", name: "Underwater", icon: "🫧", description: "Explore a colourful underwater trail", sky: "#087fb3", floor: 0x286675, wall: 0x06466e, accent: 0xff6caa },
  { id: "candy-kingdom", name: "Candy Kingdom", icon: "🍭", description: "Bounce through a playful candy adventure", sky: "#ff65c7", floor: 0xffcc57, wall: 0xaa286d, accent: 0xffeb3b },
  { id: "enchanted-forest", name: "Enchanted Forest", icon: "🌳", description: "Discover glowing paths and forest friends", sky: "#72e84c", floor: 0x8ad64a, wall: 0x246d38, accent: 0xffdb39 },
  { id: "scary-cave", name: "Scary Cave", icon: "🦇", description: "Explore a friendly cave full of surprises", sky: "#5542a8", floor: 0x4b456c, wall: 0x211d46, accent: 0xff6b6b },
  { id: "frozen-kingdom", name: "Frozen Kingdom", icon: "❄️", description: "Slide across a sparkling frozen kingdom", sky: "#4ec5ff", floor: 0x9be9ff, wall: 0x176d9f, accent: 0xffffff },
  { id: "space", name: "Space", icon: "🚀", description: "Leap between colourful planets and stars", sky: "#15135b", floor: 0x373b88, wall: 0x090b37, accent: 0x45e6ff },
  { id: "magic-castle", name: "Magic Castle", icon: "🏰", description: "Explore royal halls and hidden stairways", sky: "#ffb83f", floor: 0xffd45a, wall: 0x8b421c, accent: 0xfff05a },
  { id: "ghost-world", name: "Ghost World", icon: "👻", description: "Meet friendly ghosts and floating platforms", sky: "#4a4ea8", floor: 0x6b6aa5, wall: 0x24255f, accent: 0xc1c3ff },
  { id: "fairy-world", name: "Fairy World", icon: "🧚", description: "Follow fairy lights through a flower garden", sky: "#ff68b1", floor: 0xffc6e7, wall: 0x962f80, accent: 0xfff06a },
  { id: "crystal-cave", name: "Crystal Cave", icon: "💎", description: "Explore glittering tunnels and crystal bridges", sky: "#22bbed", floor: 0x8deaff, wall: 0x075c90, accent: 0x6afff4 }
] as const;

export const CHALLENGES: readonly ChallengeType[] = ["classic", "monster", "obstacle", "key-door", "tricky"];

export interface DifficultyProfile {
  progressIndex: number;
  rank: number;
  label: string;
  shortLabel: string;
  hazardCount: number;
  obstacleSpeed: number;
  memoryPairs: number;
  challengeSeconds: number;
}

const DIFFICULTY_NAMES = [
  "Easy", "Medium", "Hard", "Very Hard", "Extreme",
  "Nightmare", "Master", "Legendary", "Mythic", "Ultimate"
] as const;

/**
 * Difficulty climbs level by level across the full ten-world adventure.
 * The first five levels are Easy → Medium → Hard → Very Hard → Extreme;
 * each new world continues the climb instead of resetting it.
 */
export function difficultyForLevel(levelNumber: number, worldIndex = 0): DifficultyProfile {
  const progressIndex = Math.max(0, worldIndex * 5 + levelNumber - 1);
  const rank = Math.min(DIFFICULTY_NAMES.length - 1, progressIndex);
  const label = progressIndex <= 9 ? DIFFICULTY_NAMES[rank]! : "Ult+" + String(progressIndex - 9);
  return {
    progressIndex,
    rank,
    label,
    shortLabel: label,
    hazardCount: Math.min(17, 4 + Math.floor(progressIndex / 4)),
    obstacleSpeed: 1 + progressIndex * 0.025,
    memoryPairs: Math.min(8, 4 + Math.floor(progressIndex / 6)),
    challengeSeconds: Math.max(28, Math.round(82 - progressIndex * 1.12))
  };
}

export function challengeForLevel(levelNumber: number, worldIndex = 0): ChallengeType {
  // Offset each new world so the same mini-game does not always appear on
  // the same numbered level.
  return CHALLENGES[(worldIndex + levelNumber - 1) % CHALLENGES.length] ?? "classic";
}

export function challengeLabel(challenge: ChallengeType): string {
  const labels: Record<ChallengeType, string> = {
    classic: "Exploration Trail",
    monster: "Monster Pattern",
    obstacle: "Obstacle Course",
    "key-door": "Magic Key Quest",
    tricky: "Secret Passage Quest"
  };
  return labels[challenge];
}

export function levelKey(worldIndex: number, levelNumber: number): string {
  return `${worldIndex + 1}-${levelNumber}`;
}

export function isLevelUnlocked(completed: string[], worldIndex: number, levelNumber: number): boolean {
  if (worldIndex === 0 && levelNumber === 1) return true;
  if (levelNumber > 1) return completed.includes(levelKey(worldIndex, levelNumber - 1));
  return worldIndex > 0 && [1, 2, 3, 4, 5].every((level) => completed.includes(levelKey(worldIndex - 1, level)));
}

export function isWorldUnlocked(completed: string[], worldIndex: number): boolean {
  return worldIndex === 0 || [1, 2, 3, 4, 5].every((level) => completed.includes(levelKey(worldIndex - 1, level)));
}
