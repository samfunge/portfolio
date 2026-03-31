'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';

const SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

/**
 * useKonamiCode
 *
 * Attaches a global keydown listener and calls `onActivate` once when the
 * full Konami sequence is typed.  Also fires a `konami_code_activated`
 * PostHog event tagged as `easter_egg_found`.
 *
 * The buffer is reset after a successful activation so the user can
 * trigger it multiple times.
 */
export function useKonamiCode(onActivate: () => void) {
  const buffer = useRef<string[]>([]);
  const posthog = usePostHog();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Append the new key, keep only the last N entries
      buffer.current = [...buffer.current, e.key].slice(-SEQUENCE.length);

      if (buffer.current.join(',') === SEQUENCE.join(',')) {
        buffer.current = [];
        onActivate();
        posthog.capture('konami_code_activated', { easter_egg: 'konami' });
        posthog.capture('easter_egg_found',      { type: 'konami_code' });
      }
    },
    [onActivate, posthog]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
