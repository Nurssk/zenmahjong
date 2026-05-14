export type SenseiId = "airo" | "ugway";
export type SenseiMood = "normal" | "talk" | "win" | "lose";

export type SenseiCharacter = {
  id: SenseiId;
  name: string;
  normal: string;
  talk: string;
  win: string;
  lose: string;
};

export const DEFAULT_SENSEI_ID: SenseiId = "airo";

export const SENSEI_CHARACTERS: Record<SenseiId, SenseiCharacter> = {
  airo: {
    id: "airo",
    name: "Айро",
    normal: "/characters/airo/airo_normal.png",
    talk: "/characters/airo/airo_talk.png",
    win: "/characters/airo/airo_win.png",
    lose: "/characters/airo/airo_lose.png",
  },
  ugway: {
    id: "ugway",
    name: "Угвей",
    normal: "/characters/ugway/ugway_normal.png",
    talk: "/characters/ugway/ugway_talk.png",
    win: "/characters/ugway/ugway_win.png",
    lose: "/characters/ugway/ugway_lose.png",
  },
};

export function normalizeSenseiId(value: unknown): SenseiId {
  return value === "ugway" ? "ugway" : DEFAULT_SENSEI_ID;
}
