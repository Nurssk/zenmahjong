export function playTutorialSfx(paths: readonly string[], enabled: boolean, volume = 0.5, assetIndex = 0) {
  if (!enabled || typeof Audio === "undefined") {
    return;
  }

  const src = paths[assetIndex];

  if (!src) {
    return;
  }

  const audio = new Audio(src);
  audio.volume = volume;
  audio.addEventListener(
    "error",
    () => {
      playTutorialSfx(paths, enabled, volume, assetIndex + 1);
    },
    { once: true },
  );

  void audio.play().catch(() => undefined);
}

