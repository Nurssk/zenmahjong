"use client";

import { Bot, Lightbulb, Maximize2, RotateCcw } from "lucide-react";
import { GameActionButton } from "@/components/game/game-action-button";

const actions = [
  { label: "Подсказка", icon: Lightbulb },
  { label: "Отмена", icon: RotateCcw },
  { label: "Сенсей", icon: Bot },
  { label: "Полный экран", icon: Maximize2 },
];

export function GameActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <GameActionButton key={action.label} icon={<Icon />} label={action.label} onClick={() => {}} disabled />
        );
      })}
    </div>
  );
}
