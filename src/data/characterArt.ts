import type { CharacterId } from "./characters";

const LEGACY_ALIAS: Partial<Record<CharacterId, CharacterId>> = {
  "male-explorer": "star-explorer",
  knight: "crystal-knight"
};

export function canonicalCharacterArtId(id: CharacterId): CharacterId {
  return LEGACY_ALIAS[id] ?? id;
}

export function getCharacterArtUrl(id: CharacterId): string {
  const canonical = canonicalCharacterArtId(id);
  // Premium portraits are rendered directly from the matching Blender GLB.
  // These same GLBs are shipped alongside the PNGs for future in-game 3D use.
  return "assets/characters3d/previews/" + canonical + ".png";
}

export function getCharacterArtBackgroundStyle(id: CharacterId): string {
  return [
    'background-image:url("' + getCharacterArtUrl(id) + '")',
    "background-size:contain",
    "background-position:center bottom",
    "background-repeat:no-repeat"
  ].join(";");
}
