import { trainers } from "@/constants/product";
import type { TrainerId } from "@/types";
import { cn } from "@/lib/utils";

export function CoachPortrait({
  trainerId,
  size = "md",
}: {
  trainerId: TrainerId;
  size?: "sm" | "md" | "lg";
}) {
  const trainer = trainers.find((item) => item.id === trainerId) ?? trainers[0];

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full border border-primary/50 bg-gradient-to-br from-primary/25 to-accent/15",
        size === "sm" && "size-11",
        size === "md" && "size-16",
        size === "lg" && "size-24",
      )}
    >
      <div className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-35 blur-sm", trainer.accent)} />
      <span
        className={cn(
          "relative font-black text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-xl",
          size === "lg" && "text-3xl",
        )}
      >
        {trainer.name.slice(0, 1)}
      </span>
    </div>
  );
}
