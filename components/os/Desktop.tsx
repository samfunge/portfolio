'use client';

import { useCallback } from 'react';
import { DESKTOP_ICONS } from '@/store/useDesktopStore';
import DesktopIcon from './DesktopIcon';

interface Props {
  /** Slot for the draggable window layer (injected by page.tsx in Stage 5) */
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
  // Deselect all icons when clicking the bare desktop
  const handleDesktopClick = useCallback(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  return (
    <div
      className="mac-desktop crt-screen"
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={handleDesktopClick}
    >
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
          // Slightly raised above the desktop but below windows
          zIndex: 5,
        }}
        // Prevent icon-column clicks from propagating to the desktop deselect handler
        onClick={(e) => e.stopPropagation()}
      >
        {DESKTOP_ICONS.map((def) => (
          <DesktopIcon key={def.id} def={def} />
        ))}
      </div>

      {/* ── Window layer (Stage 5) ────────────────────────────────────────── */}
      {children}
    </div>
  );
}
