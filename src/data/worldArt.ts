export const WORLD_ART_ORDER = [
  "underwater", "candy", "forest", "crystal",
  "ice", "space", "castle", "ghost",
  "fairy", "dragon", "sky", "volcano",
  "desert", "rainbow-city"
] as const;

export function getWorldArtPosition(backdrop: string): { column: number; row: number } {
  const index = WORLD_ART_ORDER.indexOf(backdrop as typeof WORLD_ART_ORDER[number]);
  const safeIndex = index >= 0 ? index : 0;
  return { column: safeIndex % 4, row: Math.floor(safeIndex / 4) };
}

export function getWorldArtStyle(backdrop: string): string {
  const { column, row } = getWorldArtPosition(backdrop);
  return [
    "background-image:url(assets/worlds/world-atlas.svg)",
    "background-size:400% 400%",
    `background-position:${(column / 3) * 100}% ${(row / 3) * 100}%`,
    "background-repeat:no-repeat"
  ].join(";");
}
