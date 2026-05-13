"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_ASSET_FALLBACKS } from "@/src/lib/audio/audio-assets";

export type GameAudioMode = "main" | "competition";

type UseGameAudioOptions = {
  mode?: GameAudioMode;
  muted?: boolean;
  musicVolume?: number;
  sfxVolume?: number;
};

type AudioAssetKey = keyof typeof AUDIO_ASSET_FALLBACKS;

export function useGameAudio(options: UseGameAudioOptions = {}) {
  const { mode = "main", muted = false, musicVolume = 0.25, sfxVolume = 0.65 } = options;
  const [mutedState, setMutedState] = useState(muted);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicIndexRef = useRef(0);
  const musicModeRef = useRef<GameAudioMode>(mode);
  const musicRequestedRef = useRef(false);
  const userInteractedRef = useRef(false);
  const mountedRef = useRef(false);

  const createMusicAudio = useCallback(
    (assetMode: GameAudioMode, assetIndex: number) => {
      if (typeof Audio === "undefined") {
        return null;
      }

      const paths = AUDIO_ASSET_FALLBACKS[assetMode];
      const audio = new Audio(paths[assetIndex]);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = musicVolume;
      audio.addEventListener(
        "error",
        () => {
          const nextIndex = assetIndex + 1;

          if (!mountedRef.current || nextIndex >= paths.length || musicRef.current !== audio) {
            return;
          }

          audio.pause();
          musicIndexRef.current = nextIndex;
          musicRef.current = createMusicAudio(assetMode, nextIndex);

          if (musicRequestedRef.current && userInteractedRef.current && !mutedState) {
            void musicRef.current?.play().catch(() => undefined);
          }
        },
        { once: true },
      );

      return audio;
    },
    [musicVolume, mutedState],
  );

  const ensureMusic = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!musicRef.current || musicModeRef.current !== mode) {
      musicRef.current?.pause();
      musicIndexRef.current = 0;
      musicModeRef.current = mode;
      musicRef.current = createMusicAudio(mode, 0);
    }

    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }

    return musicRef.current;
  }, [createMusicAudio, mode, musicVolume]);

  const startMusic = useCallback(() => {
    userInteractedRef.current = true;
    musicRequestedRef.current = true;

    if (mutedState) {
      return;
    }

    const audio = ensureMusic();
    void audio?.play().catch(() => undefined);
  }, [ensureMusic, mutedState]);

  const pauseMusic = useCallback(() => {
    musicRef.current?.pause();
  }, []);

  const resumeMusic = useCallback(() => {
    musicRequestedRef.current = true;

    if (!userInteractedRef.current || mutedState) {
      return;
    }

    const audio = ensureMusic();
    void audio?.play().catch(() => undefined);
  }, [ensureMusic, mutedState]);

  const stopMusic = useCallback(() => {
    musicRequestedRef.current = false;
    musicRef.current?.pause();

    if (musicRef.current) {
      musicRef.current.currentTime = 0;
    }
  }, []);

  const playSfx = useCallback(
    (assetKey: AudioAssetKey, assetIndex = 0) => {
      if (typeof Audio === "undefined" || mutedState) {
        return;
      }

      userInteractedRef.current = true;
      const paths = AUDIO_ASSET_FALLBACKS[assetKey];
      const audio = new Audio(paths[assetIndex]);
      audio.volume = sfxVolume;
      audio.addEventListener(
        "error",
        () => {
          const nextIndex = assetIndex + 1;

          if (nextIndex < paths.length) {
            playSfx(assetKey, nextIndex);
          }
        },
        { once: true },
      );
      void audio.play().catch(() => undefined);
    },
    [mutedState, sfxVolume],
  );

  const playChooseSound = useCallback(() => playSfx("choose"), [playSfx]);
  const playMatchSound = useCallback(() => playSfx("match"), [playSfx]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      musicRef.current?.pause();
      musicRef.current = null;
    };
  }, []);

  useEffect(() => {
    setMutedState(muted);
  }, [muted]);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    if (mutedState) {
      pauseMusic();
      return;
    }

    if (musicRequestedRef.current && userInteractedRef.current) {
      resumeMusic();
    }
  }, [mutedState, pauseMusic, resumeMusic]);

  useEffect(() => {
    if (mutedState || !musicRequestedRef.current || !userInteractedRef.current) {
      return;
    }

    resumeMusic();
  }, [mode, mutedState, resumeMusic]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      startMusic();
    };

    document.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener("pointerdown", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [startMusic]);

  return {
    playChooseSound,
    playMatchSound,
    startMusic,
    pauseMusic,
    resumeMusic,
    stopMusic,
    muted: mutedState,
    setMuted: setMutedState,
  };
}
