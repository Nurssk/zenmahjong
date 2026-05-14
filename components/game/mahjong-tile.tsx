"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MahjongTileModel } from "@/src/lib/game";

export function MahjongTile({
  tile,
  free,
  selected,
  hinted,
  muted,
  visuallyCovered,
  pointerEventsDisabled,
  compact,
  positioned = true,
  style,
  onSelect,
}: {
  tile: MahjongTileModel;
  free: boolean;
  selected?: boolean;
  hinted?: boolean;
  muted?: boolean;
  visuallyCovered?: boolean;
  pointerEventsDisabled?: boolean;
  compact?: boolean;
  positioned?: boolean;
  style?: CSSProperties;
  onSelect: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed ? undefined : tile.imageSrc;

  return (
    <button
      type="button"
      aria-label={`${tile.label}${free ? ", свободная" : ", заблокирована"}`}
      aria-disabled={!free}
      onClick={onSelect}
      style={positioned ? style : undefined}
      className={cn(
        "group touch-manipulation select-none overflow-visible bg-transparent p-0 font-bold opacity-100 transition-transform duration-150 [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        positioned ? "absolute aspect-[7/10]" : "relative h-full w-full",
        compact ? "text-[0.55rem] sm:text-[0.65rem]" : "text-[0.6rem] sm:text-xs md:text-sm",
        free ? "cursor-pointer md:hover:-translate-y-1 md:hover:scale-[1.03]" : "cursor-not-allowed",
        pointerEventsDisabled ? "pointer-events-none" : null,
        selected ? "-translate-y-1 scale-[1.06]" : null,
      )}
    >
      <span
        className={cn(
        "tile-body relative block h-full w-full overflow-hidden rounded-[10px] border border-black/35 bg-[#FFF8E8] opacity-100",
        "shadow-[inset_-5px_-7px_0_rgba(112,92,62,0.26),inset_2px_2px_0_rgba(255,255,255,0.95),0_8px_12px_rgba(0,0,0,0.42)]",
        "before:absolute before:inset-y-[6px] before:-right-[5px] before:w-[7px] before:rounded-r-[9px] before:border before:border-black/35 before:bg-[#B9B2A2] before:content-['']",
        "after:absolute after:-bottom-[5px] after:left-[5px] after:right-[2px] after:h-[7px] after:rounded-b-[9px] after:border after:border-black/35 after:bg-[#A8A193] after:content-['']",
          muted ? "opacity-45 [filter:brightness(0.72)_grayscale(0.15)]" : null,
          visuallyCovered && !muted ? "opacity-[0.58] [filter:brightness(0.78)_saturate(0.85)]" : null,
          selected
            ? "border-2 border-[#FF6B35] shadow-[0_0_26px_rgba(255,107,53,0.85),inset_-5px_-7px_0_rgba(112,92,62,0.2),inset_2px_2px_0_rgba(255,255,255,0.98),0_14px_22px_rgba(0,0,0,0.58)]"
            : null,
          hinted && !selected
            ? "animate-pulse border-2 border-[#6C63FF] shadow-[0_0_24px_rgba(108,99,255,0.88),inset_-5px_-7px_0_rgba(112,92,62,0.2),0_12px_20px_rgba(0,0,0,0.48)]"
            : null,
        )}
      >
        <span className="absolute inset-x-2 top-1 z-10 h-px bg-white/90" />
        <span className="tile-face absolute inset-[7%] z-10 grid place-items-center overflow-hidden rounded-[7px] bg-[#F7F0DE] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={tile.label}
              draggable={false}
              fill
              sizes="(max-width: 640px) 34px, (max-width: 1024px) 48px, 58px"
              onError={() => setImageFailed(true)}
              className={cn(
                "object-contain p-[5px] [filter:none] [mix-blend-mode:normal]",
                visuallyCovered ? "opacity-20" : "opacity-100",
              )}
            />
          ) : (
            <span className={cn("px-1 text-center leading-tight text-background", visuallyCovered ? "opacity-20" : null)}>
              {tile.label}
            </span>
          )}
        </span>
        {muted || visuallyCovered ? (
          <span className={cn("absolute inset-0 z-20 rounded-[10px]", visuallyCovered ? "bg-black/18" : "bg-black/10")} />
        ) : null}
      </span>
    </button>
  );
}
