'use client';

import { useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';
import { AppleIcon, SpeakerOnIcon, SpeakerOffIcon } from './MacIcons';

// ─── Menu definitions ─────────────────────────────────────────────────────────
const MENUS = [
  {
    label: 'File',
    items: ['New Folder', 'Open', '---', 'Close Window', '---', 'Get Info', '---', 'Eject'],
  },
  {
    label: 'Edit',
    items: ['Undo', '---', 'Cut', 'Copy', 'Paste', 'Clear', 'Select All'],
  },
  {
    label: 'View',
    items: ['By Icon', 'By Name', 'By Date', 'By Size', 'By Kind'],
  },
  {
    label: 'Special',
    items: ['Clean Up', 'Empty Trash', '---', 'Restart', 'Shut Down'],
  },
] as const;

// ─── Clock ────────────────────────────────────────────────────────────────────
function MenuBarClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() < 12 ? 'AM' : 'PM';
      setTime(`${h}:${m} ${ampm}`);
    }
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return <span className="mac-menubar-clock">{time}</span>;
}

// ─── Dropdown menu ────────────────────────────────────────────────────────────
interface DropdownProps {
  label: string;
  items: readonly string[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function MenuDropdown({ label, items, open, onToggle, onClose }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span
        className={`mac-menubar-item${open ? ' active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); onToggle(); }}
      >
        {label}
      </span>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #000',
            boxShadow: '2px 2px 0 #000',
            minWidth: 160,
            zIndex: 9998,
          }}
        >
          {items.map((item, i) =>
            item === '---' ? (
              <div
                key={i}
                style={{
                  height: 1,
                  background: '#000',
                  margin: '2px 0',
                }}
              />
            ) : (
              <div
                key={i}
                style={{
                  padding: '3px 20px',
                  fontFamily: 'var(--font-chicago)',
                  fontSize: 12,
                  cursor: 'default',
                  color: '#888',   // greyed out — items are decorative in this demo
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.cssText +=
                    'background:#000;color:#fff')
                }
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.color = '#888';
                }}
              >
                {item}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── MenuBar ──────────────────────────────────────────────────────────────────
export default function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { muted, toggleMute, play } = useAudio();
  const posthog = usePostHog();

  function handleToggle(label: string) {
    play('click');
    setOpenMenu((prev) => (prev === label ? null : label));
  }

  function handleAudioToggle() {
    toggleMute();
    posthog.capture('audio_toggled', { muted: !muted });
  }

  return (
    <div className="mac-menubar" style={{ zIndex: 9000 }}>
      {/* Apple menu */}
      <MenuDropdown
        label=""
        items={['About This Computer', '---', 'Desk Accessories', '---', 'Control Panel', 'Key Caps', 'Scrapbook']}
        open={openMenu === 'apple'}
        onToggle={() => handleToggle('apple')}
        onClose={() => setOpenMenu(null)}
      />
      {/* Replace the empty label with Apple icon visually */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <AppleIcon size={14} />
      </div>

      {MENUS.map((m) => (
        <MenuDropdown
          key={m.label}
          label={m.label}
          items={m.items}
          open={openMenu === m.label}
          onToggle={() => handleToggle(m.label)}
          onClose={() => setOpenMenu(null)}
        />
      ))}

      {/* Right-side controls */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
        {/* Audio toggle */}
        <button
          onClick={handleAudioToggle}
          title={muted ? 'Unmute' : 'Mute'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 8px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? <SpeakerOffIcon size={14} /> : <SpeakerOnIcon size={14} />}
        </button>

        <MenuBarClock />
      </div>
    </div>
  );
}
