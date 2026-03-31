'use client';

import { useDesktopStore } from '@/store/useDesktopStore';
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
 *   │  ┌──────────────────────┐   │
 *   │  │  Window layer        │   │  ← added in Stage 5
 *   │  │  (absolute, z:10+)   │   │
 *   │  └──────────────────────┘   │
 *   │  Icon column (absolute,right)│
 *   └─────────────────────────────┘
 *   CRT overlay (fixed, z:9999)   ← from globals.css
 *
 * The BootScreen is fixed-position and sits above everything until
 * finishBoot() is called via the Zustand store.
 */
export default function Home() {
  const booted = useDesktopStore((s) => s.booted);

  return (
    <>
      {/* Boot sequence — renders until booted === true */}
      <BootScreen />

      {/* CRT scanline / vignette overlay — always on top */}
      <div className="crt-overlay" aria-hidden="true" />

      {/* OS chrome — fades in once booted */}
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

        {/* Desktop fills the remaining height */}
        {/* Stage 5 injects the <WindowLayer /> as a child here */}
        <Desktop />
      </div>
    </>
  );
}
