'use client';

import { useCallback, useRef, useState } from 'react';
import { useDesktopStore } from '@/store/useDesktopStore';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import BootScreen from '@/components/os/BootScreen';
import MenuBar from '@/components/os/MenuBar';
import Desktop from '@/components/os/Desktop';
import MacDialog from '@/components/os/MacDialog';

export default function Home() {
  const booted = useDesktopStore((s) => s.booted);
  const [glitching, setGlitching] = useState(false);
  const [konamiDialog, setKonamiDialog] = useState(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKonami = useCallback(() => {
    if (glitchTimer.current) clearTimeout(glitchTimer.current);
    setGlitching(true);
    glitchTimer.current = setTimeout(() => {
      setGlitching(false);
      glitchTimer.current = null;
      setKonamiDialog(true);
    }, 750);
  }, []);

  useKonamiCode(handleKonami);

  return (
    <>
      <BootScreen />

      <div className="crt-overlay" aria-hidden="true" />

      {/* Konami easter egg dialog */}
      {konamiDialog && (
        <MacDialog
          title="CHEAT CODE ACTIVATED"
          onClose={() => setKonamiDialog(false)}
          buttons={[{ label: 'Radical!', onClick: () => setKonamiDialog(false), primary: true }]}
          zIndex={9600}
        >
          <div style={{ fontSize: 11, lineHeight: 1.9, textAlign: 'center' }}>
            <div style={{ marginBottom: 8 }}>
              <strong>UP UP DOWN DOWN</strong>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>LEFT RIGHT LEFT RIGHT</strong>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>B A</strong>
            </div>
            <div style={{ marginTop: 10, color: '#555' }}>
              You found the secret. Nice moves.
            </div>
          </div>
        </MacDialog>
      )}

      {/* OS chrome — glitch class applied here so the whole UI distorts */}
      <div
        className={glitching ? 'crt-glitch' : undefined}
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
