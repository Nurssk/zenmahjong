export const AUDIO_ASSETS = {
  main: "/audio/main.mp3",
  competition: "/audio/competition.mp3",
  choose: "/audio/choose.mp3",
  match: "/audio/match.mp3",
  lose: "/audio/lose.mp3",
  win: "/audio/win.wav",
} as const;

export const AUDIO_ASSET_FALLBACKS = {
  main: [AUDIO_ASSETS.main, "/audio/main.wav"],
  competition: [AUDIO_ASSETS.competition, "/audio/competition.wav"],
  choose: [AUDIO_ASSETS.choose, "/audio/choose.wav"],
  match: [AUDIO_ASSETS.match, "/audio/match.wav"],
  lose: [AUDIO_ASSETS.lose],
  win: [AUDIO_ASSETS.win],
} as const;
