'use client';

import { useCallback, useRef, useState } from 'react';
import { useDesktopStore } from '@/store/useDesktopStore';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import BootScreen from '@/components/os/BootScreen';
import MenuBar from '@/components/os/MenuBar';
import Desktop from '@/components/os/Desktop';

/**
 * page.tsx — the Mac OS shell.
 *
 * Layout (top→bottom, 100vh, no scroll):
 *   ┌─────────────────────────────┐
 *   │  MenuBar  (20px)            │
 *   ├─────────────────────────────┤
 *   │  Desktop  (flex: 1)         │
 *   │   WindowLayer (absolute)    │
 *   │   Icon column (absolute)    │
 *   └─────────────────────────────┘
 *   CRT overlay (fixed, z:9999)
 *
 * The Konami code listener fires here (global scope) so it works regardless
 * of which window or component has focus.  When activated it adds the
 * .crt-glitch class to the CRT overlay for the duration of the animation.
 */
export default function Home() {
  const booted = useDesktopStore((s) => s.booted);
  const [glitching, setGlitching] = useState(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKonami = useCallback(() => {
    // Prevent overlapping glitch triggers
    if (glitchTimer.current) clearTimeout(glitchTimer.current);
    setGlitching(true);
    glitchTimer.current = setTimeout(() => {
      setGlitching(false);
      glitchTimer.current = null;
    }, 650); // slightly longer than the 0.6s CSS animation
  }, []);

  useKonamiCode(handleKonami);

  return (
    <>
      {/* Boot sequence — fixed overlay until finishBoot() */}
      <BootScreen />

      {/* CRT scanline / vignette overlay — always on top.
          .crt-glitch fires the @keyframes animation when Konami is activated. */}
      <div
        className={`crt-overlay${glitching ? ' crt-glitch' : ''}`}
        aria-hidden="true"
      />

      {/* OS chrome — invisible until boot completes */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          opacity: booted ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: booted ? 'auto' : 'none',
        }}
      >
        <MenuBar />
        <Desktop />
      </div>
    </>
  );
}
