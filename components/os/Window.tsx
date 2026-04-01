'use client';

import { useRef, useCallback, useEffect } from 'react';
import {
  motion,
  useDragControls,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';
import {
  useDesktopStore,
  type WindowId,
  type WindowState,
} from '@/store/useDesktopStore';

// ─── Window content registry ──────────────────────────────────────────────────
// Lazy imports keep each content module out of the initial bundle.
import dynamic from 'next/dynamic';

const FolderWindow   = dynamic(() => import('@/components/windows/FolderWindow'));
const STATIC_CONTENT: Record<string, React.ComponentType> = {
  about:       dynamic(() => import('@/components/windows/AboutWindow')),
  projects:    dynamic(() => import('@/components/windows/ProjectsWindow')),
  resume:      dynamic(() => import('@/components/windows/ResumeWindow')),
  games:       dynamic(() => import('@/components/windows/GamesWindow')),
  snake:       dynamic(() => import('@/components/games/Snake')),
  pong:        dynamic(() => import('@/components/games/Pong')),
  breakout:    dynamic(() => import('@/components/games/Breakout')),
  tetris:      dynamic(() => import('@/components/games/Tetris')),
  minesweeper: dynamic(() => import('@/components/games/Minesweeper')),
  trash:       dynamic(() => import('@/components/windows/TrashWindow')),
};

function getContent(id: WindowId): React.ComponentType {
  if (id.startsWith('folder-')) return FolderWindow;
  return STATIC_CONTENT[id] ?? (() => null);
}

// ─── Resize handle size ───────────────────────────────────────────────────────
const RESIZE_HANDLE = 12;
const MIN_W = 220;
const MIN_H = 140;

// ─── Single Window ────────────────────────────────────────────────────────────
interface WindowProps {
  win: WindowState;
  /** Bounding rect of the desktop area — used to clamp drag */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function Window({ win, containerRef }: WindowProps) {
  const { closeWindow, focusWindow, moveWindow, resizeWindow, activeWindowId } =
    useDesktopStore();
  const { play } = useAudio();
  const posthog = usePostHog();
  const isActive = activeWindowId === win.id;

  // ── Motion values for position ──────────────────────────────────────────────
  // Initialised once from the store; subsequent store updates (e.g. on
  // re-mount after navigation) reset via the key on WindowLayer.
  const x = useMotionValue(win.x);
  const y = useMotionValue(win.y);

  // Sync motion values if the store position changes externally
  useEffect(() => { x.set(win.x); }, [win.x]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { y.set(win.y); }, [win.y]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag controls — only titlebar starts the drag ──────────────────────────
  const dragControls = useDragControls();

  const handleTitlebarPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault(); // prevent text selection during drag
      focusWindow(win.id);
      dragControls.start(e);
    },
    [dragControls, focusWindow, win.id]
  );

  // ── Save final position to store after drag ────────────────────────────────
  const handleDragEnd = useCallback(() => {
    moveWindow(win.id, x.get(), y.get());
  }, [moveWindow, win.id, x, y]);

  // ── Close ──────────────────────────────────────────────────────────────────
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      play('click');
      posthog.capture('window_closed', { window_name: win.title });
      closeWindow(win.id);
    },
    [closeWindow, play, posthog, win]
  );

  // ── Resize (bottom-right handle) ───────────────────────────────────────────
  const resizeOrigin = useRef<{ mx: number; my: number; w: number; h: number } | null>(null);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizeOrigin.current = {
        mx: e.clientX,
        my: e.clientY,
        w: win.width,
        h: win.height,
      };
    },
    [win.width, win.height]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeOrigin.current) return;
      const dw = e.clientX - resizeOrigin.current.mx;
      const dh = e.clientY - resizeOrigin.current.my;
      resizeWindow(
        win.id,
        Math.max(MIN_W, resizeOrigin.current.w + dw),
        Math.max(MIN_H, resizeOrigin.current.h + dh)
      );
    },
    [resizeWindow, win.id]
  );

  const handleResizePointerUp = useCallback(() => {
    resizeOrigin.current = null;
  }, []);

  // ── Content ────────────────────────────────────────────────────────────────
  const ContentComponent = getContent(win.id);

  return (
    <motion.div
      // Unique key so AnimatePresence tracks identity across open/close
      layout={false}
      drag
      dragControls={dragControls}
      dragListener={false}    // only titlebar triggers drag
      dragMomentum={false}    // no physics — direct 1:1 movement
      dragElastic={0}
      dragConstraints={containerRef}
      style={{
        x,
        y,
        width: win.width,
        height: win.height,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: win.zIndex,
      }}
      // Enter animation — scale up from 90% like System 1 window open
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      onDragEnd={handleDragEnd}
      onMouseDown={() => focusWindow(win.id)}
      className="mac-window"
      aria-label={`${win.title} window`}
    >
      {/* ── Title bar ──────────────────────────────────────────────────────── */}
      <div
        className="mac-titlebar"
        onPointerDown={handleTitlebarPointerDown}
        style={{
          // Active window shows solid stripe; inactive fades to near-invisible
          opacity: isActive ? 1 : 0.4,
        }}
      >
        {/* Close box */}
        <div
          className="mac-close-box"
          onClick={handleClose}
          role="button"
          aria-label="Close window"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClose(e as any)}
        />

        {/* Title */}
        <span className="mac-titlebar-title">{win.title}</span>

        {/* Spacer — mirrors close-box width to keep title centred */}
        <div style={{ width: 12, flexShrink: 0 }} />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="mac-window-body">
        <ContentComponent />
      </div>

      {/* ── Resize handle (bottom-right) ────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: RESIZE_HANDLE,
          height: RESIZE_HANDLE,
          cursor: 'nwse-resize',
          // Classic Mac resize box: three diagonal lines
          backgroundImage: `repeating-linear-gradient(
            135deg,
            #000 0px, #000 1px,
            transparent 1px, transparent 4px
          )`,
        }}
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        aria-hidden="true"
      />
    </motion.div>
  );
}

// ─── Window Layer ─────────────────────────────────────────────────────────────
// Renders all open windows and manages AnimatePresence for enter/exit.

interface WindowLayerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function WindowLayer({ containerRef }: WindowLayerProps) {
  const windows = useDesktopStore((s) => s.windows);
  const openWindows = Object.values(windows) as WindowState[];

  return (
    <AnimatePresence>
      {openWindows.map((win) => (
        <Window key={win.id} win={win} containerRef={containerRef} />
      ))}
    </AnimatePresence>
  );
}
