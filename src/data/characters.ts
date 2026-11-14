export type CharacterId =
  | "normal-girl"
  | "normal-boy"
  | "unicorn"
  | "witch"
  | "princess"
  | "prince"
  | "male-explorer"
  | "knight"
  | "mermaid"
  | "fairy"
  | "dragon-rider"
  | "star-explorer"
  | "crystal-knight";

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  token: string;
  colour: number;
  coinCost: number;
  powerPoints: number;
  initiallyUnlocked: boolean;
  description: string;
}

export const CHARACTERS: readonly CharacterDefinition[] = [
  { id: "normal-girl", name: "Normal Girl", token: "👧", colour: 0xf28db5, coinCost: 0, powerPoints: 200, initiallyUnlocked: true, description: "A brave everyday explorer" },
  { id: "normal-boy", name: "Normal Boy", token: "🧒", colour: 0x72a9e8, coinCost: 0, powerPoints: 250, initiallyUnlocked: true, description: "A curious maze master" },
  { id: "unicorn", name: "Unicorn", token: "🦄", colour: 0xa88be8, coinCost: 0, powerPoints: 500, initiallyUnlocked: true, description: "A magical friend with sparkle power" },
  { id: "witch", name: "Witch", token: "🧙‍♀️", colour: 0x8465bd, coinCost: 200, powerPoints: 650, initiallyUnlocked: false, description: "A clever spell maker with a glowing wand" },
  { id: "princess", name: "Princess", token: "👸", colour: 0xf1a6c7, coinCost: 1000, powerPoints: 1000, initiallyUnlocked: false, description: "Royal courage, kindness and a sparkling gown" },
  { id: "mermaid", name: "Mermaid", token: "🧜‍♀️", colour: 0x60c9c4, coinCost: 500, powerPoints: 700, initiallyUnlocked: false, description: "A sea star who loves underwater adventures" },
  { id: "fairy", name: "Moonlit Fairy", token: "🧚", colour: 0x80d9c4, coinCost: 750, powerPoints: 850, initiallyUnlocked: false, description: "A winged guardian with a sparkle wand" },
  { id: "dragon-rider", name: "Dragon Rider", token: "🐉", colour: 0x3ba99a, coinCost: 900, powerPoints: 950, initiallyUnlocked: false, description: "A fearless explorer and her baby dragon" },
  { id: "star-explorer", name: "Star Explorer", token: "🚀", colour: 0x3f78c4, coinCost: 350, powerPoints: 600, initiallyUnlocked: false, description: "A young space traveller who follows the stars" },
  { id: "crystal-knight", name: "Crystal Knight", token: "🛡️", colour: 0x9877e8, coinCost: 650, powerPoints: 800, initiallyUnlocked: false, description: "A brave protector with a crystal shield" },
  // Legacy IDs remain valid for existing local saves; the closet uses the art-ready roster below.
  { id: "prince", name: "Prince", token: "🤴", colour: 0x6c91d8, coinCost: 500, powerPoints: 700, initiallyUnlocked: false, description: "A fearless royal adventurer" },
  { id: "male-explorer", name: "Male Explorer", token: "🧭", colour: 0xc58c56, coinCost: 350, powerPoints: 550, initiallyUnlocked: false, description: "Always ready for a new trail" },
  { id: "knight", name: "Knight", token: "🛡️", colour: 0x91a5b8, coinCost: 650, powerPoints: 750, initiallyUnlocked: false, description: "A guardian of the magic worlds" }
] as const;

// Ahana's six supplied heroes plus four original new heroes.
export const ART_READY_CHARACTER_IDS: readonly CharacterId[] = [
  "normal-girl", "normal-boy", "unicorn", "witch", "princess", "mermaid",
  "fairy", "dragon-rider", "star-explorer", "crystal-knight"
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
