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
  name: string;
  token: string;
  colour: number;
  coinCost: number;
  initiallyUnlocked: boolean;
  description: string;
}

export const CHARACTERS: readonly CharacterDefinition[] = [
  { id: "normal-girl", name: "Normal Girl", token: "👧", colour: 0xf28db5, coinCost: 0, initiallyUnlocked: true, description: "A brave everyday explorer" },
  { id: "normal-boy", name: "Normal Boy", token: "🧒", colour: 0x72a9e8, coinCost: 0, initiallyUnlocked: true, description: "A curious maze master" },
  { id: "unicorn", name: "Unicorn", token: "🦄", colour: 0xa88be8, coinCost: 0, initiallyUnlocked: true, description: "A magical friend with sparkle power" },
  { id: "witch", name: "Witch", token: "🧙‍♀️", colour: 0x8465bd, coinCost: 80, initiallyUnlocked: false, description: "A clever spell maker" },
  { id: "princess", name: "Princess", token: "👸", colour: 0xf1a6c7, coinCost: 120, initiallyUnlocked: false, description: "Royal courage and kindness" },
  { id: "prince", name: "Prince", token: "🤴", colour: 0x6c91d8, coinCost: 110, initiallyUnlocked: false, description: "A fearless royal adventurer" },
  { id: "male-explorer", name: "Male Explorer", token: "🧭", colour: 0xc58c56, coinCost: 95, initiallyUnlocked: false, description: "Always ready for a new trail" },
  { id: "knight", name: "Knight", token: "🛡️", colour: 0x91a5b8, coinCost: 150, initiallyUnlocked: false, description: "A guardian of the magic worlds" },
  { id: "mermaid", name: "Mermaid", token: "🧜‍♀️", colour: 0x60c9c4, coinCost: 135, initiallyUnlocked: false, description: "A sea star who loves adventure" }
] as const;

// These six heroes currently have character art supplied by Ahana. More can be added later.
export const ART_READY_CHARACTER_IDS: readonly CharacterId[] = [
  "normal-girl", "normal-boy", "unicorn", "witch", "princess", "mermaid"
];

export const STARTING_CHARACTER_IDS: readonly CharacterId[] = [
  "normal-girl",
  "normal-boy",
  "unicorn"
];

export function getCharacter(id: CharacterId): CharacterDefinition {
  const character = CHARACTERS.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character id: ${id}`);
  return character;
}
