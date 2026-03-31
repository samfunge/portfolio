'use client';

import { create } from 'zustand/react';

// ─── Window IDs ──────────────────────────────────────────────────────────────
// Every openable window in the OS has a stable string ID.
// Add new IDs here as new windows are built in later stages.

export type WindowId =
  | 'about'
  | 'projects'
  | 'resume'
  | 'games'
  | 'snake'
  | 'pong'
  | 'trash';

// ─── Desktop Icon definitions ─────────────────────────────────────────────────
// Stored in the store so Stage 4 can derive the icon list from a single source
// of truth rather than hard-coding it in JSX.

export interface DesktopIconDef {
  id: WindowId;
  label: string;
  /** Which SVG icon variant to render (resolved in DesktopIcon component) */
  icon: 'folder' | 'file-text' | 'file-pdf' | 'games' | 'trash';
  /** Grid position on the desktop (column, row) in 80px units */
  gridCol: number;
  gridRow: number;
}

// ─── Window state ─────────────────────────────────────────────────────────────

export interface WindowState {
  id: WindowId;
  title: string;
  /** Current position — updated as the user drags */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Stack order — higher = on top */
  zIndex: number;
  isMinimised: boolean;
}

// ─── Full OS state ────────────────────────────────────────────────────────────

interface DesktopState {
  /** Map of currently open windows (only open ones are present) */
  windows: Partial<Record<WindowId, WindowState>>;
  /** The window currently receiving focus (for titlebar highlight) */
  activeWindowId: WindowId | null;
  /** Global z-index counter — incremented each time a window is focused */
  topZ: number;
  /** Whether the boot sequence has completed */
  booted: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Open a window, or bring it to front if already open */
  openWindow: (id: WindowId) => void;
  /** Permanently close (remove) a window */
  closeWindow: (id: WindowId) => void;
  /** Bring a window to the top of the z stack and mark it active */
  focusWindow: (id: WindowId) => void;
  /** Update position after a drag gesture */
  moveWindow: (id: WindowId, x: number, y: number) => void;
  /** Resize a window (used by resize handle in later stages) */
  resizeWindow: (id: WindowId, width: number, height: number) => void;
  /** Mark the boot sequence as complete */
  finishBoot: () => void;
}

// ─── Default window configs ───────────────────────────────────────────────────
// Each entry defines the size and initial position for its window type.
// Positions are slightly offset so stacked windows cascade visually.

const WINDOW_DEFAULTS: Record<
  WindowId,
  { title: string; x: number; y: number; width: number; height: number }
> = {
  about: {
    title: 'About.txt',
    x: 80,
    y: 48,
    width: 420,
    height: 320,
  },
  projects: {
    title: 'Projects',
    x: 120,
    y: 64,
    width: 480,
    height: 360,
  },
  resume: {
    title: 'Resume.pdf',
    x: 160,
    y: 80,
    width: 440,
    height: 520,
  },
  games: {
    title: 'Games',
    x: 100,
    y: 56,
    width: 320,
    height: 260,
  },
  snake: {
    title: 'Snake',
    x: 140,
    y: 72,
    width: 320,
    height: 360,
  },
  pong: {
    title: 'Pong',
    x: 160,
    y: 80,
    width: 360,
    height: 300,
  },
  trash: {
    title: 'Trash',
    x: 200,
    y: 100,
    width: 260,
    height: 180,
  },
};

// ─── Desktop icon layout ──────────────────────────────────────────────────────
// Right-side column, top-to-bottom, matching classic Mac finder icon placement.

export const DESKTOP_ICONS: DesktopIconDef[] = [
  { id: 'about',    label: 'About.txt',   icon: 'file-text', gridCol: 1, gridRow: 1 },
  { id: 'projects', label: 'Projects',    icon: 'folder',    gridCol: 1, gridRow: 2 },
  { id: 'resume',   label: 'Resume.pdf',  icon: 'file-pdf',  gridCol: 1, gridRow: 3 },
  { id: 'games',    label: 'Games',       icon: 'games',     gridCol: 1, gridRow: 4 },
  { id: 'trash',    label: 'Trash',       icon: 'trash',     gridCol: 1, gridRow: 5 },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDesktopStore = create<DesktopState>((set, get) => ({
  windows: {},
  activeWindowId: null,
  topZ: 10,
  booted: false,

  openWindow: (id) => {
    const existing = get().windows[id];
    if (existing) {
      get().focusWindow(id);
      return;
    }

    const defaults = WINDOW_DEFAULTS[id];
    const nextZ = get().topZ + 1;

    set((state) => ({
      topZ: nextZ,
      activeWindowId: id,
      windows: {
        ...state.windows,
        [id]: {
          id,
          title: defaults.title,
          x: defaults.x,
          y: defaults.y,
          width: defaults.width,
          height: defaults.height,
          zIndex: nextZ,
          isMinimised: false,
        } satisfies WindowState,
      },
    }));
  },

  closeWindow: (id) => {
    set((state) => {
      const next = { ...state.windows };
      delete next[id];

      const nextActive =
        state.activeWindowId === id
          ? (Object.values(next) as WindowState[]).sort(
              (a, b) => b.zIndex - a.zIndex
            )[0]?.id ?? null
          : state.activeWindowId;

      return { windows: next, activeWindowId: nextActive };
    });
  },

  focusWindow: (id) => {
    const win = get().windows[id];
    if (!win) return;
    const nextZ = get().topZ + 1;
    set((state) => ({
      topZ: nextZ,
      activeWindowId: id,
      windows: {
        ...state.windows,
        [id]: { ...win, zIndex: nextZ },
      },
    }));
  },

  moveWindow: (id, x, y) => {
    const win = get().windows[id];
    if (!win) return;
    set((state) => ({
      windows: { ...state.windows, [id]: { ...win, x, y } },
    }));
  },

  resizeWindow: (id, width, height) => {
    const win = get().windows[id];
    if (!win) return;
    set((state) => ({
      windows: { ...state.windows, [id]: { ...win, width, height } },
    }));
  },

  finishBoot: () => set({ booted: true }),
}));
