import type { AiroMood } from "@/src/lib/tutorial/airo-assets";

export type TutorialStepId =
  | "first_match"
  | "same_tiles"
  | "blocked_tiles"
  | "one_side_open"
  | "two_layers"
  | "hint"
  | "undo"
  | "mini_challenge";

export type TutorialTile = {
  id: string;
  type: string;
  label: string;
  image?: string;
  x: number;
  y: number;
  z: number;
  removed?: boolean;
  selected?: boolean;
  locked?: boolean;
  highlighted?: boolean;
};

export type TutorialStep = {
  id: TutorialStepId;
  title: string;
  description: string;
  instruction: string;
  airoMood: AiroMood;
  airoMessage: string;
  successMessage?: string;
  errorMessage?: string;
  tiles: TutorialTile[];
  goal: "match_pair" | "select_free" | "use_hint" | "use_undo" | "clear_board";
};

export type TutorialMove = {
  first: TutorialTile;
  second: TutorialTile;
};

export type TutorialState = {
  tiles: TutorialTile[];
  selectedTileId: string | null;
  highlightedTileIds: string[];
  message: string;
  messageType: "neutral" | "success" | "warning";
  history: TutorialMove[];
  score: number;
  completed: boolean;
};
