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
  initiallyUnlocked: boolean;
}

export const CHARACTERS: readonly CharacterDefinition[] = [
  { id: "normal-girl", name: "Normal Girl", token: "G", colour: 0xf28db5, initiallyUnlocked: true },
  { id: "normal-boy", name: "Normal Boy", token: "B", colour: 0x72a9e8, initiallyUnlocked: true },
  { id: "unicorn", name: "Unicorn", token: "✦", colour: 0xa88be8, initiallyUnlocked: true },
  { id: "witch", name: "Witch", token: "W", colour: 0x8465bd, initiallyUnlocked: false },
  { id: "princess", name: "Princess", token: "P", colour: 0xf1a6c7, initiallyUnlocked: false },
  { id: "prince", name: "Prince", token: "R", colour: 0x6c91d8, initiallyUnlocked: false },
  { id: "male-explorer", name: "Male Explorer", token: "E", colour: 0xc58c56, initiallyUnlocked: false },
  { id: "knight", name: "Knight", token: "K", colour: 0x91a5b8, initiallyUnlocked: false },
  { id: "mermaid", name: "Mermaid", token: "M", colour: 0x60c9c4, initiallyUnlocked: false }
] as const;

export const STARTING_CHARACTER_IDS: readonly CharacterId[] = [
  "normal-girl",
  "normal-boy",
  "unicorn"
];

export function getCharacter(id: CharacterId): CharacterDefinition {
  const character = CHARACTERS.find((item) => item.id === id);
  if (!character) {
    throw new Error(`Unknown character id: ${id}`);
  }
  return character;
}
