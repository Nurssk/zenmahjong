"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const particles = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  duration: 3 + (index % 5) * 0.45,
  delay: (index % 7) * 0.22,
}));

export function AtmosphericBackground({
  className,
  particlesClassName,
  count = 30,
}: {
  className?: string;
  particlesClassName?: string;
  count?: number;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-zen-radial" />
      {particles.slice(0, count).map((particle) => (
        <motion.div
          key={particle.id}
          className={cn("absolute size-1 rounded-full bg-primary blur-[1px]", particlesClassName)}
          style={{ left: particle.left, top: particle.top }}
          animate={{ opacity: [0.12, 0.55, 0.12], scale: [1, 1.5, 1] }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
