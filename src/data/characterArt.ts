import type { CharacterId } from "./characters";

// The original starters are stored as individual images. The other ten heroes
// use the 5-by-2 atlas built from Ahana's approved character artwork.
const ROSTER: readonly CharacterId[] = [
  "unicorn", "witch", "princess", "mermaid", "fairy",
  "dragon-rider", "star-explorer", "crystal-knight", "prince", "ice-mage"
] as const;

const LEGACY_ALIAS: Partial<Record<CharacterId, CharacterId>> = {
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

export function getCharacterArtUrl(id: CharacterId): string {
  const canonical = canonicalCharacterArtId(id);
  if (canonical === "normal-girl" || canonical === "normal-boy") {
    return "assets/characters/" + canonical + ".webp";
  }
  return "assets/characters/hero-roster.webp";
}

export function getCharacterArtPosition(id: CharacterId): CharacterArtPosition {
  const canonical = canonicalCharacterArtId(id);
  const index = ROSTER.indexOf(canonical);
  const safeIndex = index >= 0 ? index : 0;
  return { column: safeIndex % 5, row: Math.floor(safeIndex / 5), cellWidth: 160, cellHeight: 200 };
}

export function getCharacterArtBackgroundStyle(id: CharacterId): string {
  const canonical = canonicalCharacterArtId(id);
  if (canonical === "normal-girl" || canonical === "normal-boy") {
    return [
      "background-image:url(assets/characters/" + canonical + ".webp)",
      "background-size:contain",
      "background-position:center bottom",
      "background-repeat:no-repeat"
    ].join(";");
  }
  const { column, row } = getCharacterArtPosition(canonical);
  return [
    "background-image:url(assets/characters/hero-roster.webp)",
    "background-size:500% 200%",
    "background-position:" + (column * 25) + "% " + (row * 100) + "%",
    "background-repeat:no-repeat"
  ].join(";");
}
