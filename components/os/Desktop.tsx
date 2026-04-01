'use client';

import { useCallback, useRef } from 'react';
import { DESKTOP_ICONS, useDesktopStore, type DesktopIconDef, type WindowId } from '@/store/useDesktopStore';
import DesktopIcon from './DesktopIcon';
import WindowLayer from './Window';

interface Props {
  children?: React.ReactNode;
}

export default function Desktop({ children }: Props) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const userFolders = useDesktopStore((s) => s.userFolders);

  const handleDesktopClick = useCallback(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  const folderDefs: DesktopIconDef[] = userFolders.map((f, i) => ({
    id: f.id as WindowId,
    label: f.label,
    icon: 'folder',
    gridCol: 2,
    gridRow: i + 1,
  }));

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

      {/* ── Right-column icon grid (static icons) ────────────────────────── */}
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

      {/* ── Left-column icon grid (user folders) ─────────────────────────── */}
      {folderDefs.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
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
          {folderDefs.map((def) => (
            <DesktopIcon key={def.id} def={def} />
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
