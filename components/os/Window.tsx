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
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useDesktopStore,
  type WindowState,
} from '@/store/useDesktopStore';

// ─── Window content registry ──────────────────────────────────────────────────
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

const RESIZE_HANDLE = 12;
const MIN_W = 220;
const MIN_H = 140;

interface WindowProps {
  win: WindowState;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function Window({ win, containerRef }: WindowProps) {
  const { closeWindow, focusWindow, moveWindow, resizeWindow, activeWindowId } =
    useDesktopStore();
  const { play } = useAudio();
  const posthog = usePostHog();
  const isMobile = useIsMobile();
  const isActive = activeWindowId === win.id;

  const x = useMotionValue(win.x);
  const y = useMotionValue(win.y);
  const w = useMotionValue(win.width);
  const h = useMotionValue(win.height);

  useEffect(() => {
    if (!isMobile) {
      x.set(win.x);
      y.set(win.y);
      w.set(win.width);
      h.set(win.height);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [win.x, win.y, win.width, win.height, isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  const dragControls = useDragControls();

  const handleTitlebarPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return;
      e.preventDefault();
      focusWindow(win.id);
      dragControls.start(e);
    },
    [dragControls, focusWindow, win.id, isMobile]
  );

  const handleDragEnd = useCallback(() => {
    if (isMobile) return;
    moveWindow(win.id, x.get(), y.get());
  }, [moveWindow, win.id, x, y, isMobile]);

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      play('click');
      posthog.capture('window_closed', { window_name: win.title });
      closeWindow(win.id);
    },
    [closeWindow, play, posthog, win]
  );

  const resizeOrigin = useRef<{ mx: number; my: number; w: number; h: number } | null>(null);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizeOrigin.current = {
        mx: e.clientX,
        my: e.clientY,
        w: w.get(),
        h: h.get(),
      };
    },
    [isMobile, w, h]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeOrigin.current || isMobile) return;
      const dw = e.clientX - resizeOrigin.current.mx;
      const dh = e.clientY - resizeOrigin.current.my;
      
      const newW = Math.max(MIN_W, resizeOrigin.current.w + dw);
      const newH = Math.max(MIN_H, resizeOrigin.current.h + dh);
      
      w.set(newW);
      h.set(newH);
    },
    [isMobile, w, h]
  );

  const handleResizePointerUp = useCallback(() => {
    if (!resizeOrigin.current || isMobile) return;
    resizeWindow(win.id, w.get(), h.get());
    resizeOrigin.current = null;
  }, [resizeWindow, win.id, w, h, isMobile]);

  const isFolder = win.id.startsWith('folder-');
  const StaticComp = STATIC_CONTENT[win.id];

  return (
    <motion.div
      layout={false}
      drag={!isMobile}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={containerRef}
      style={{
        x,
        y,
        width: isMobile ? '100%' : w,
        height: isMobile ? '100%' : h,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: win.zIndex,
      }}
      initial={{ opacity: 0, scale: isMobile ? 1 : 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: isMobile ? 1 : 0.88 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      onDragEnd={handleDragEnd}
      onMouseDown={() => focusWindow(win.id)}
      className="mac-window"
      aria-label={`${win.title} window`}
      data-testid={`window-${win.id}`}
    >
      <div
        className="mac-titlebar"
        onPointerDown={handleTitlebarPointerDown}
        style={{
          opacity: isActive ? 1 : 0.4,
          cursor: isMobile ? 'default' : undefined
        }}
      >
        <div
          className="mac-close-box"
          onClick={handleClose}
          role="button"
          aria-label="Close window"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClose(e as unknown as React.MouseEvent)}
          style={{
            width: isMobile ? 20 : 12,
            height: isMobile ? 20 : 12,
          }}
        />
        <span className="mac-titlebar-title">{win.title}</span>
        <div style={{ width: 12, flexShrink: 0 }} />
      </div>

      <div className="mac-window-body">
        {isFolder ? <FolderWindow /> : StaticComp ? <StaticComp /> : null}
      </div>

      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: RESIZE_HANDLE,
            height: RESIZE_HANDLE,
            cursor: 'nwse-resize',
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
      )}
    </motion.div>
  );
}

interface WindowLayerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function WindowLayer({ containerRef }: WindowLayerProps) {
  const windows = useDesktopStore((s) => s.windows);
  const isMobile = useIsMobile();
  const activeWindowId = useDesktopStore((s) => s.activeWindowId);

  const openWindows = Object.values(windows) as WindowState[];

  const visibleWindows = isMobile
    ? openWindows.filter(w => w.id === activeWindowId)
    : openWindows;

  return (
    <AnimatePresence>
      {visibleWindows.map((win) => (
        <Window key={win.id} win={win} containerRef={containerRef} />
      ))}
    </AnimatePresence>
  );
}
