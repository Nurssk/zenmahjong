export function calculateScore(removedPairs: number, seconds: number) {
  return Math.max(0, removedPairs * 120 - Math.floor(seconds / 5));
}
