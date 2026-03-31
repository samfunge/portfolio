// Central registry of all sound file paths used by the AudioProvider.
// All files live in /public/sounds/ — add the MP3s (see README there).
export const SOUNDS = {
  startup: "/sounds/startup.mp3",
  click:   "/sounds/click.mp3",
  crunch:  "/sounds/crunch.mp3",
  error:   "/sounds/error.mp3",
} as const;

export type SoundKey = keyof typeof SOUNDS;
