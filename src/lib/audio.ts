export function playSound(src: string, enabled: boolean, volume = 0.7) {
  if (!enabled || typeof Audio === "undefined") {
    return;
  }

  const audio = new Audio(src);
  audio.volume = volume;

  void audio.play().catch((error) => {
    console.warn("Audio playback failed:", error);
  });
}
