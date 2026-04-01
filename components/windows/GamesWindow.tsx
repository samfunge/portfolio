'use client';

import { useDesktopStore } from '@/store/useDesktopStore';
import { useAudio } from '@/components/providers/AudioProvider';
import { usePostHog } from 'posthog-js/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { GamesIcon } from '@/components/os/MacIcons';

const GAMES = [
  { id: 'snake'       as const, label: 'Snake',       description: 'Arrow keys to move.' },
  { id: 'pong'        as const, label: 'Pong',         description: 'W/S to move paddle.' },
  { id: 'breakout'    as const, label: 'Breakout',     description: 'Arrow keys or mouse.' },
  { id: 'tetris'      as const, label: 'Tetris',       description: 'Arrow keys to play.' },
  { id: 'minesweeper' as const, label: 'Minesweeper',  description: 'Click to reveal.' },
] as const;

/**
 * GamesWindow — folder containing game icons.
 * Double-click a game icon to launch it in its own window (Stage 6).
 */
export default function GamesWindow() {
  const openWindow = useDesktopStore((s) => s.openWindow);
  const { play } = useAudio();
  const posthog = usePostHog();
  const isMobile = useIsMobile();

  function handleLaunch(id: typeof GAMES[number]['id'], label: string) {
    play('click');
    posthog.capture('window_opened', { window_name: label });
    openWindow(id);
  }

  const launchHandler = (id: typeof GAMES[number]['id'], label: string) => {
    if (isMobile) {
      handleLaunch(id, label);
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-chicago)', fontSize: 10 }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: '1px solid #000',
          color: '#555',
        }}
      >
        <GamesIcon size={16} />
        <span>{(GAMES.length as number)} item{(GAMES.length as number) !== 1 ? 's' : ''}</span>
      </div>

      {/* Game icons */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {GAMES.map((g) => (
          <button
            key={g.id}
            onDoubleClick={() => handleLaunch(g.id, g.label)}
            onClick={() => launchHandler(g.id, g.label)}
            title={`${isMobile ? 'Tap' : 'Double-click'} to play: ${g.label}`}
            aria-label={g.label}
            data-testid={`icon-${g.id}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              width: 80,
              padding: 4,
              outline: 'none',
            }}
          >
            <GamesIcon size={40} />
            <span style={{ textAlign: 'center', lineHeight: 1.3 }}>{g.label}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          borderTop: '1px solid #000',
          paddingTop: 10,
          color: '#444',
          lineHeight: 1.6,
        }}
      >
        <em>{isMobile ? 'Tap' : 'Double-click'} a game icon to play.</em>
      </div>
    </div>
  );
}
