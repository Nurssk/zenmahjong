"use client";

import { useCallback, useEffect, useState } from "react";

export const SOUND_ENABLED_STORAGE_KEY = "zen-mahjong-sound-enabled";

function readSoundEnabledPreference() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(SOUND_ENABLED_STORAGE_KEY) !== "false";
}

export function useSoundPreference() {
  const [soundEnabled, setSoundEnabledState] = useState(readSoundEnabledPreference);

  const setSoundEnabled = useCallback((value: boolean | ((current: boolean) => boolean)) => {
    setSoundEnabledState((current) => {
      const nextValue = typeof value === "function" ? value(current) : value;
      window.localStorage.setItem(SOUND_ENABLED_STORAGE_KEY, String(nextValue));
      window.dispatchEvent(new CustomEvent("zen-mahjong-sound-preference-change", { detail: nextValue }));
      return nextValue;
    });
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SOUND_ENABLED_STORAGE_KEY) {
        setSoundEnabledState(event.newValue !== "false");
      }
    };

    const handlePreferenceChange = (event: Event) => {
      setSoundEnabledState(Boolean((event as CustomEvent<boolean>).detail));
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("zen-mahjong-sound-preference-change", handlePreferenceChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("zen-mahjong-sound-preference-change", handlePreferenceChange);
    };
  }, []);

  return { setSoundEnabled, soundEnabled };
}
