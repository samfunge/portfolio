'use client';

import { useCallback, useRef } from 'react';
import { DESKTOP_ICONS } from '@/store/useDesktopStore';
import DesktopIcon from './DesktopIcon';
import WindowLayer from './Window';

interface Props {
  children?: React.ReactNode;
}

/**
 * Desktop
 * Renders the checker-board background, the right-column icon grid,
 * and a slot for the draggable window layer above it.
 *
 * Icon grid: icons are pinned to the right edge of the viewport in a
 * single column, spaced 80px apart vertically — exactly like System 1 Finder.
 */
export default function Desktop({ children }: Props) {
  // This ref is passed to WindowLayer so Framer Motion can constrain
  // window drag to the desktop area (prevents dragging under the menu bar
  // or fully off-screen).
  const desktopRef = useRef<HTMLDivElement>(null);

  const handleDesktopClick = useCallback(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  return (
    <div
      ref={desktopRef}
      className="mac-desktop crt-screen"
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={handleDesktopClick}
    >
      {/* ── Draggable window layer ────────────────────────────────────────── */}
      <WindowLayer containerRef={desktopRef} />

      {/* ── Right-column icon grid ────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 84,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 12,
          gap: 8,
          zIndex: 5,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {DESKTOP_ICONS.map((def) => (
          <DesktopIcon key={def.id} def={def} />
        ))}
      </div>

      {children}
    </div>
  );
}
