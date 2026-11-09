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
  { id: "underwater", name: "Underwater", icon: "🫧", description: "Dive into the coral maze", sky: "#dff7ff", floor: 0xe4faff, wall: 0x277b99, accent: 0x42bfd0 },
  { id: "candy-kingdom", name: "Candy Kingdom", icon: "🍭", description: "Sweet paths and sticky surprises", sky: "#fff0fa", floor: 0xffe6f4, wall: 0xb34c8d, accent: 0xf28aba },
  { id: "enchanted-forest", name: "Enchanted Forest", icon: "🌳", description: "Follow the sparkling forest trail", sky: "#e9ffe9", floor: 0xe5f4d8, wall: 0x407a47, accent: 0x8bcf79 },
  { id: "scary-cave", name: "Scary Cave", icon: "🦇", description: "A spooky but friendly cave", sky: "#eee7ff", floor: 0xe9e1f6, wall: 0x55466f, accent: 0x9d83c4 },
  { id: "frozen-kingdom", name: "Frozen Kingdom", icon: "❄️", description: "Slide through icy corridors", sky: "#e9f6ff", floor: 0xe4f2ff, wall: 0x477ba8, accent: 0x8bcef4 },
  { id: "space", name: "Space", icon: "🚀", description: "Explore a galaxy of twisty paths", sky: "#171d46", floor: 0x30345f, wall: 0x11152f, accent: 0xb7a5ff },
  { id: "magic-castle", name: "Magic Castle", icon: "🏰", description: "Find the royal secret passage", sky: "#fff0dc", floor: 0xffe8ca, wall: 0x95613f, accent: 0xe8ae62 },
  { id: "ghost-world", name: "Ghost World", icon: "👻", description: "Meet friendly ghosts in the mist", sky: "#e8eaff", floor: 0xe8e8f8, wall: 0x5c608e, accent: 0xa6a7e7 },
  { id: "fairy-world", name: "Fairy World", icon: "🧚", description: "Wander through the fairy glade", sky: "#fff0f6", floor: 0xfde4f3, wall: 0xa65d9a, accent: 0xf0a2d2 },
  { id: "crystal-cave", name: "Crystal Cave", icon: "💎", description: "Discover the glowing crystal maze", sky: "#e8f9ff", floor: 0xdff3fa, wall: 0x3f718a, accent: 0x70d3dc }
] as const;

export const CHALLENGES: readonly ChallengeType[] = ["classic", "monster", "obstacle", "key-door", "tricky"];

export function challengeForLevel(levelNumber: number): ChallengeType {
  return CHALLENGES[(levelNumber - 1) % CHALLENGES.length] ?? "classic";
}

export function challengeLabel(challenge: ChallengeType): string {
  const labels: Record<ChallengeType, string> = {
    classic: "Classic Maze",
    monster: "Monster Maze",
    obstacle: "Obstacle Maze",
    "key-door": "Key & Door Maze",
    tricky: "Tricky Maze"
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
