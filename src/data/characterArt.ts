import type { CharacterId } from "./characters";

const ROSTER: readonly CharacterId[] = [
  "normal-girl", "normal-boy", "unicorn", "witch", "princess",
  "mermaid", "fairy", "dragon-rider", "star-explorer", "crystal-knight"
] as const;

const LEGACY_ALIAS: Partial<Record<CharacterId, CharacterId>> = {
  prince: "princess",
  "male-explorer": "star-explorer",
  knight: "crystal-knight"
};

export interface CharacterArtPosition {
  column: number;
  row: number;
  cellWidth: number;
  cellHeight: number;
}

export function canonicalCharacterArtId(id: CharacterId): CharacterId {
  return LEGACY_ALIAS[id] ?? id;
}

export function getCharacterArtUrl(_id: CharacterId): string {
  return "assets/characters/hero-roster.webp";
}

export function getCharacterArtPosition(id: CharacterId): CharacterArtPosition {
  const canonical = canonicalCharacterArtId(id);
  const index = ROSTER.indexOf(canonical);
  const safeIndex = index >= 0 ? index : 0;
  return { column: safeIndex % 5, row: Math.floor(safeIndex / 5), cellWidth: 220, cellHeight: 275 };
}

export function getCharacterArtBackgroundStyle(id: CharacterId): string {
  const { column, row } = getCharacterArtPosition(id);
  return [
    "background-image:url(assets/characters/hero-roster.webp)",
    "background-size:500% 200%",
    `background-position:${column * 25}% ${row * 100}%`,
    "background-repeat:no-repeat"
  ].join(";");
}
