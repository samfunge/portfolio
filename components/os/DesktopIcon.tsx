'use client';

import { useCallback, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';
import { useDesktopStore, type DesktopIconDef } from '@/store/useDesktopStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  FolderIcon,
  FileTextIcon,
  FilePdfIcon,
  GamesIcon,
  TrashIcon,
} from './MacIcons';

// ─── Icon renderer ────────────────────────────────────────────────────────────
function IconImage({ variant, size = 48 }: { variant: DesktopIconDef['icon']; size?: number }) {
  switch (variant) {
    case 'folder':    return <FolderIcon   size={size} />;
    case 'file-text': return <FileTextIcon size={size} />;
    case 'file-pdf':  return <FilePdfIcon  size={size} />;
    case 'games':     return <GamesIcon    size={size} />;
    case 'trash':     return <TrashIcon    size={size} />;
  }
}

// ─── DesktopIcon ──────────────────────────────────────────────────────────────
interface Props {
  def: DesktopIconDef;
}

export default function DesktopIcon({ def }: Props) {
  const [selected, setSelected] = useState(false);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const { play } = useAudio();
  const posthog = usePostHog();
  const isMobile = useIsMobile();

  // Track click timing for double-click detection without relying on
  // the native dblclick event (which fires too slowly on some trackpads).
  const lastClickRef = useRef<number>(0);

  const handleClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation(); // prevent desktop deselect

      if (isMobile) {
        // Single tap to open on mobile
        play('click');
        openWindow(def.id);
        posthog.capture('window_opened_mobile', { window_name: def.label });
        setSelected(false);
        return;
      }

      const now = Date.now();
      const isDouble = now - lastClickRef.current < 400;
      lastClickRef.current = now;

      if (isDouble) {
        play('click');
        openWindow(def.id);
        posthog.capture('window_opened', { window_name: def.label });
        setSelected(false);
      } else {
        setSelected(true);
      }
    },
    [def, openWindow, play, posthog, isMobile]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        play('click');
        openWindow(def.id);
        posthog.capture('window_opened', { window_name: def.label });
      }
    },
    [def, openWindow, play, posthog]
  );

  return (
    <div
      className={`mac-icon${selected ? ' selected' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${def.label} — double-click to open`}
      data-testid={`icon-${def.id}`}
      // Deselect on blur (clicking elsewhere)
      onBlur={() => setSelected(false)}
    >
      <div className="mac-icon-img-wrap">
        <IconImage variant={def.icon} size={48} />
      </div>
      <span className="mac-icon-label">{def.label}</span>
    </div>
  );
}
