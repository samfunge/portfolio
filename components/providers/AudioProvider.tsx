'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { SOUNDS, type SoundKey } from '@/lib/sounds';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AudioContextValue {
  /** Play a registered sound by key. No-ops if muted or file missing. */
  play: (key: SoundKey) => void;
  /** Whether sound is globally enabled. */
  muted: boolean;
  /** Toggle global mute. */
  toggleMute: () => void;
  /** True once the user has interacted — unlocks browser autoplay. */
  unlocked: boolean;
  /** Call once on the first user gesture to unlock audio. */
  unlock: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AudioCtx = createContext<AudioContextValue>({
  play: () => {},
  muted: false,
  toggleMute: () => {},
  unlocked: false,
  unlock: () => {},
});

export function useAudio() {
  return useContext(AudioCtx);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export default function AudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('mac-os-muted') === 'true';
    } catch {
      return false;
    }
  });
  const [unlocked, setUnlocked] = useState(false);

  // Cache one HTMLAudioElement per sound key so we don't re-create them.
  // We use a ref so the cache persists across renders without triggering them.
  const cache = useRef<Partial<Record<SoundKey, HTMLAudioElement>>>({});

  // Pre-load all audio files after unlock so the first click doesn't lag.
  const unlock = useCallback(() => {
    if (unlocked) return;
    setUnlocked(true);

    (Object.entries(SOUNDS) as [SoundKey, string][]).forEach(([key, src]) => {
      const el = new Audio(src);
      el.preload = 'auto';
      cache.current[key] = el;
    });
  }, [unlocked]);

  // Allow external components to toggle mute; persist in localStorage.
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mac-os-muted', String(next));
      } catch {
        // private browsing may block localStorage
      }
      return next;
    });
  }, []);

  const play = useCallback(
    (key: SoundKey) => {
      if (muted || !unlocked) return;

      const el = cache.current[key];
      if (!el) return;

      // Clone the element so rapid overlapping clicks each get their own
      // playback instance (e.g. fast double-clicks on icons).
      const clone = el.cloneNode() as HTMLAudioElement;
      clone.volume = key === 'startup' ? 0.6 : 0.4;
      clone.play().catch(() => {
        // Swallow NotAllowedError — browser may still block before gesture
      });
    },
    [muted, unlocked]
  );

  return (
    <AudioCtx.Provider value={{ play, muted, toggleMute, unlocked, unlock }}>
      {children}
    </AudioCtx.Provider>
  );
}
