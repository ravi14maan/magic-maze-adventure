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
  backdrop: string;
}

export const WORLDS: readonly WorldDefinition[] = [
  { id: "underwater", name: "Underwater", icon: "🫧", description: "Explore glowing reefs and ancient sea ruins", sky: "#087fb3", floor: 0x286675, wall: 0x06466e, accent: 0xff6caa, backdrop: "underwater" },
  { id: "candy-kingdom", name: "Candy Kingdom", icon: "🍭", description: "Bounce through a land of sweets and gumdrop hills", sky: "#ff65c7", floor: 0xffcc57, wall: 0xaa286d, accent: 0xffeb3b, backdrop: "candy" },
  { id: "enchanted-forest", name: "Enchanted Forest", icon: "🌳", description: "Discover glowing trees and hidden fairy trails", sky: "#72e84c", floor: 0x8ad64a, wall: 0x246d38, accent: 0xffdb39, backdrop: "forest" },
  { id: "scary-cave", name: "Scary Cave", icon: "🦇", description: "Explore friendly caves, crystals and hidden monsters", sky: "#5542a8", floor: 0x4b456c, wall: 0x211d46, accent: 0xff6b6b, backdrop: "crystal" },
  { id: "frozen-kingdom", name: "Frozen Kingdom", icon: "❄️", description: "Slide across icy bridges and sparkling snowfields", sky: "#4ec5ff", floor: 0x9be9ff, wall: 0x176d9f, accent: 0xffffff, backdrop: "ice" },
  { id: "space", name: "Space", icon: "🚀", description: "Leap between colourful planets and distant stars", sky: "#15135b", floor: 0x373b88, wall: 0x090b37, accent: 0x45e6ff, backdrop: "space" },
  { id: "magic-castle", name: "Magic Castle", icon: "🏰", description: "Explore royal halls and enchanted gardens", sky: "#ffb83f", floor: 0xffd45a, wall: 0x8b421c, accent: 0xfff05a, backdrop: "castle" },
  { id: "ghost-world", name: "Ghost World", icon: "👻", description: "Meet friendly ghosts in a moonlit mystery land", sky: "#4a4ea8", floor: 0x6b6aa5, wall: 0x24255f, accent: 0xc1c3ff, backdrop: "ghost" },
  { id: "fairy-world", name: "Fairy World", icon: "🧚", description: "Follow fairy lights through a flower garden", sky: "#ff68b1", floor: 0xffc6e7, wall: 0x962f80, accent: 0xfff06a, backdrop: "fairy" },
  { id: "crystal-cave", name: "Crystal Cave", icon: "💎", description: "Explore glittering tunnels and crystal bridges", sky: "#22bbed", floor: 0x8deaff, wall: 0x075c90, accent: 0x6afff4, backdrop: "crystal" },
  { id: "dragon-valley", name: "Dragon Valley", icon: "🐉", description: "Fly past waterfalls and meet friendly baby dragons", sky: "#38a9a1", floor: 0x36765f, wall: 0x174d4b, accent: 0xffc45d, backdrop: "dragon" },
  { id: "sky-islands", name: "Sky Islands", icon: "☁️", description: "Cross floating islands above the clouds", sky: "#59bfff", floor: 0x83d7b8, wall: 0x397eb5, accent: 0xffe58b, backdrop: "sky" },
  { id: "volcano-realm", name: "Volcano Realm", icon: "🌋", description: "Dodge glowing lava flows and volcanic rocks", sky: "#b94c4c", floor: 0x633744, wall: 0x392b3d, accent: 0xffa13b, backdrop: "volcano" },
  { id: "desert-ruins", name: "Desert Ruins", icon: "🏜️", description: "Find lost treasures in sunlit sandstone temples", sky: "#efb76b", floor: 0xc78a57, wall: 0x89543f, accent: 0xffe59a, backdrop: "desert" },
  { id: "rainbow-city", name: "Rainbow City", icon: "🌈", description: "Race across bright rooftops and rainbow bridges", sky: "#8c80e8", floor: 0x64b9a3, wall: 0x6050a1, accent: 0xff87b8, backdrop: "rainbow-city" }
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
 * Difficulty climbs level by level across the full fifteen-world adventure.
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
    memoryPairs: Math.min(8, 4 + Math.floor(progressIndex / 2)),
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
