import { STARTING_CHARACTER_IDS, type CharacterId } from "./characters";

const STORAGE_KEY = "magic-maze-adventure.profiles.v2";

export interface AvatarStyle {
  emoji: string;
  background: string;
  accessory: string;
}

export interface PlayerProfile {
  id: string;
  nickname: string;
  avatar: AvatarStyle;
  coins: number;
  gems: number;
  trophies: number;
  completedLevels: string[];
  unlockedCharacters: CharacterId[];
  selectedCharacter: CharacterId;
  createdAt: number;
}

export interface ProfileStore {
  version: 2;
  activeProfileId: string | null;
  profiles: PlayerProfile[];
}

export const AVATAR_EMOJIS = ["🧒", "👧", "🧑", "🧝", "🧚", "🦄", "🐱", "🐼", "🐸", "🐰", "🦊", "🐻"];
export const AVATAR_BACKGROUNDS = ["#ffe0ef", "#dff4ff", "#e7e0ff", "#e6f7dc", "#fff0cf", "#dff8f4", "#f4e2ff", "#e7ecff"];
export const AVATAR_ACCESSORIES = ["✨", "🌸", "⭐", "👑", "🎀", "🪽", "💫", "🍀"];

function makeId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createProfile(nickname: string): PlayerProfile {
  const safeName = nickname.trim().slice(0, 18) || "Adventurer";
  return {
    id: makeId(),
    nickname: safeName,
    avatar: { emoji: "👧", background: "#ffe0ef", accessory: "✨" },
    coins: 0,
    gems: 0,
    trophies: 0,
    completedLevels: [],
    unlockedCharacters: [...STARTING_CHARACTER_IDS],
    selectedCharacter: "normal-girl",
    createdAt: Date.now()
  };
}

function validProfile(value: unknown): value is PlayerProfile {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PlayerProfile>;
  return typeof item.id === "string" &&
    typeof item.nickname === "string" &&
    Array.isArray(item.completedLevels) &&
    Array.isArray(item.unlockedCharacters) &&
    typeof item.coins === "number";
}

export function loadStore(): ProfileStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 2, activeProfileId: null, profiles: [] };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") throw new Error("Invalid save");
    const candidate = value as Partial<ProfileStore>;
    const profiles = Array.isArray(candidate.profiles) ? candidate.profiles.filter(validProfile) : [];
    return {
      version: 2,
      activeProfileId: profiles.some((p) => p.id === candidate.activeProfileId) ? candidate.activeProfileId ?? null : profiles[0]?.id ?? null,
      profiles
    };
  } catch {
    return { version: 2, activeProfileId: null, profiles: [] };
  }
}

export function saveStore(store: ProfileStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // The game remains playable in memory when browser storage is unavailable.
  }
}

export function activeProfile(store: ProfileStore): PlayerProfile | null {
  return store.profiles.find((p) => p.id === store.activeProfileId) ?? null;
}

export function addProfile(store: ProfileStore, nickname: string): PlayerProfile {
  const profile = createProfile(nickname);
  store.profiles.push(profile);
  store.activeProfileId = profile.id;
  saveStore(store);
  return profile;
}

export function updateProfile(store: ProfileStore, profile: PlayerProfile): void {
  const index = store.profiles.findIndex((p) => p.id === profile.id);
  if (index >= 0) store.profiles[index] = profile;
  saveStore(store);
}

export function profileAvatarLabel(profile: PlayerProfile): string {
  return `${profile.avatar.emoji}${profile.avatar.accessory}`;
}
