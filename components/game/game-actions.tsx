"use client";

import { Bot, Lightbulb, RotateCcw, Shuffle } from "lucide-react";
import { GameActionButton } from "@/components/game/game-action-button";

const actions = [
  { label: "Отмена x2", icon: RotateCcw },
  { label: "Подсказка x3", icon: Lightbulb },
  { label: "AI-тренер x1", icon: Bot },
  { label: "Перемешать x1", icon: Shuffle },
];

export function GameActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <GameActionButton key={action.label} icon={<Icon />} label={action.label.split(" ")[0]} count={Number(action.label.match(/\d+/)?.[0] ?? 1)} />
        );
      })}
    </div>
  );
}
