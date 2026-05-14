export const AUDIO_ASSETS = {
  main: "/audio/main.wav",
  competition: "/audio/competition.wav",
  choose: "/audio/choose.wav",
  match: "/audio/match.wav",
  lose: "/audio/lose.mp3",
  win: "/audio/win.wav",
} as const;

export const AUDIO_ASSET_FALLBACKS = {
  main: [AUDIO_ASSETS.main],
  competition: [AUDIO_ASSETS.competition],
  choose: [AUDIO_ASSETS.choose],
  match: [AUDIO_ASSETS.match],
  lose: [AUDIO_ASSETS.lose],
  win: [AUDIO_ASSETS.win],
} as const;
