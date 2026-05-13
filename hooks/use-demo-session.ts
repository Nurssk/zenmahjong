"use client";

import { useMemo } from "react";
import { demoInventory, demoProfile, demoStats } from "@/constants/product";

export function useDemoSession() {
  return useMemo(
    () => ({
      profile: demoProfile,
      stats: demoStats,
      inventory: demoInventory,
      isDemo: true,
    }),
    [],
  );
}
