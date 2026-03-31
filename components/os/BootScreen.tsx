'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudio } from '@/components/providers/AudioProvider';
import { useDesktopStore } from '@/store/useDesktopStore';
import { HappyMacIcon } from './MacIcons';

type Phase =
  | 'power'      // Black screen — "click to start"
  | 'booting'    // White screen + Happy Mac + progress bar
  | 'done';      // Fading out

const BOOT_MESSAGES = [
  'Welcome to Macintosh',
  'Checking memory...',
  'Loading Finder...',
  'Mounting disk...',
  'Almost ready...',
];

export default function BootScreen() {
  const { unlock, play } = useAudio();
  const finishBoot = useDesktopStore((s) => s.finishBoot);
  const booted = useDesktopStore((s) => s.booted);

  const [phase, setPhase] = useState<Phase>('power');
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Start the boot sequence on first user click ────────────────────────────
  function handlePowerClick() {
    unlock();            // unblock browser autoplay
    play('startup');     // 🔊 startup chime
    setPhase('booting');
  }

  // ── Progress bar ticker ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'booting') return;

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 4 + Math.random() * 6;  // 4–10% per tick
        if (next >= 100) {
          clearInterval(intervalRef.current!);
          return 100;
        }
        return next;
      });
      setMsgIdx((i) => Math.min(i + 1, BOOT_MESSAGES.length - 1));
    }, 350);

    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  // ── When progress hits 100, finish and fade out ───────────────────────────
  useEffect(() => {
    if (progress < 100) return;

    const t = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setPhase('done');
        finishBoot();
      }, 600);
    }, 400);

    return () => clearTimeout(t);
  }, [progress, finishBoot]);

  // ── Don't render once desktop is live ─────────────────────────────────────
  if (booted && phase === 'done') return null;

  // ── Power screen ──────────────────────────────────────────────────────────
  if (phase === 'power') {
    return (
      <div
        className="boot-screen"
        style={{ background: '#000', cursor: 'pointer' }}
        onClick={handlePowerClick}
        role="button"
        aria-label="Click to start"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handlePowerClick()}
      >
        {/* Power button symbol */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          style={{ opacity: 0.8 }}
        >
          <circle cx="24" cy="24" r="20" stroke="#fff" strokeWidth="3" fill="none" />
          <line x1="24" y1="6" x2="24" y2="26" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span
          style={{
            color: '#fff',
            fontFamily: 'var(--font-chicago)',
            fontSize: 11,
            letterSpacing: 1,
            opacity: 0.7,
          }}
        >
          CLICK TO START
        </span>
      </div>
    );
  }

  // ── Boot animation ─────────────────────────────────────────────────────────
  return (
    <div
      className="boot-screen"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
        background: '#fff',
        gap: 16,
      }}
      aria-hidden="true"
    >
      {/* Happy Mac */}
      <HappyMacIcon size={64} />

      {/* Welcome text */}
      <p
        style={{
          fontFamily: 'var(--font-chicago)',
          fontSize: 12,
          marginTop: 8,
        }}
      >
        {BOOT_MESSAGES[msgIdx]}
      </p>

      {/* Progress bar — System 1 style: segmented blocks */}
      <div
        style={{
          width: 148,
          height: 12,
          border: '1px solid #000',
          padding: 1,
          display: 'flex',
          gap: 1,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: i < Math.floor(progress / 5) ? '#000' : 'transparent',
              transition: 'background 0.1s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
