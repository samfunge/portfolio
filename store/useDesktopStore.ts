'use client';

import { create } from 'zustand/react';

// ─── Window IDs ───────────────────────────────────────────────────────────────
// folder-${string} covers any user-created folder window dynamically.

export type WindowId =
  | 'about'
  | 'projects'
  | 'resume'
  | 'games'
  | 'snake'
  | 'pong'
  | 'breakout'
  | 'tetris'
  | 'minesweeper'
  | 'trash'
  | `folder-${string}`;

type StaticWindowId = Exclude<WindowId, `folder-${string}`>;

// ─── Desktop Icon definitions ─────────────────────────────────────────────────

export interface DesktopIconDef {
  id: WindowId;
  label: string;
  icon: 'folder' | 'file-text' | 'file-pdf' | 'games' | 'trash';
  gridCol: number;
  gridRow: number;
}

// ─── Window state ─────────────────────────────────────────────────────────────

export interface WindowState {
  id: WindowId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimised: boolean;
}

// ─── User folder ──────────────────────────────────────────────────────────────

export interface UserFolder {
  id: string;          // e.g. "folder-abc123"
  label: string;
}

// ─── Full OS state ────────────────────────────────────────────────────────────

interface DesktopState {
  windows:        Partial<Record<string, WindowState>>;
  activeWindowId: WindowId | null;
  topZ:           number;
  booted:         boolean;
  trashFull:      boolean;
  userFolders:    UserFolder[];

  openWindow:   (id: WindowId, titleOverride?: string) => void;
  closeWindow:  (id: WindowId) => void;
  focusWindow:  (id: WindowId) => void;
  moveWindow:   (id: WindowId, x: number, y: number) => void;
  resizeWindow: (id: WindowId, width: number, height: number) => void;
  finishBoot:   () => void;
  restart:      () => void;
  createFolder: (label?: string) => void;
  emptyTrash:   () => void;
}

// ─── Static window defaults ───────────────────────────────────────────────────

const STATIC_DEFAULTS: Record<
  StaticWindowId,
  { title: string; x: number; y: number; width: number; height: number }
> = {
  about:    { title: 'About.txt',  x: 80,  y: 48, width: 420, height: 320 },
  projects: { title: 'Projects',   x: 120, y: 64, width: 480, height: 380 },
  resume:   { title: 'Resume.pdf', x: 160, y: 80, width: 440, height: 520 },
  games:    { title: 'Games',      x: 100, y: 56, width: 480, height: 260 },
  snake:       { title: 'Snake',       x: 140, y: 72,  width: 300, height: 370 },
  pong:        { title: 'Pong',        x: 160, y: 60,  width: 380, height: 270 },
  breakout:    { title: 'Breakout',    x: 120, y: 60,  width: 310, height: 400 },
  tetris:      { title: 'Tetris',      x: 150, y: 55,  width: 320, height: 400 },
  minesweeper: { title: 'Minesweeper', x: 130, y: 65,  width: 290, height: 330 },
  trash:       { title: 'Trash',       x: 200, y: 100, width: 260, height: 180 },
};

// ─── Static desktop icons ─────────────────────────────────────────────────────

export const DESKTOP_ICONS: DesktopIconDef[] = [
  { id: 'about',    label: 'About.txt',  icon: 'file-text', gridCol: 1, gridRow: 1 },
  { id: 'projects', label: 'Projects',   icon: 'folder',    gridCol: 1, gridRow: 2 },
  { id: 'resume',   label: 'Resume.pdf', icon: 'file-pdf',  gridCol: 1, gridRow: 3 },
  { id: 'games',    label: 'Games',      icon: 'games',     gridCol: 1, gridRow: 4 },
  { id: 'trash',    label: 'Trash',      icon: 'trash',     gridCol: 1, gridRow: 5 },
];

let folderCounter = 1;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDesktopStore = create<DesktopState>((set, get) => ({
  windows:        {},
  activeWindowId: null,
  topZ:           10,
  booted:         false,
  trashFull:      false,
  userFolders:    [],

  openWindow: (id, titleOverride) => {
    const existing = get().windows[id];
    if (existing) { get().focusWindow(id); return; }

    const isFolder = id.startsWith('folder-');
    const defaults = isFolder
      ? {
          title:  titleOverride
                  ?? get().userFolders.find(f => f.id === id)?.label
                  ?? 'Untitled Folder',
          x:      60 + Math.floor(Math.random() * 140),
          y:      44 + Math.floor(Math.random() * 100),
          width:  300,
          height: 220,
        }
      : STATIC_DEFAULTS[id as StaticWindowId];

    const nextZ = get().topZ + 1;
    set(state => ({
      topZ: nextZ,
      activeWindowId: id,
      windows: {
        ...state.windows,
        [id]: {
          id,
          title:       defaults.title,
          x:           defaults.x,
          y:           defaults.y,
          width:       defaults.width,
          height:      defaults.height,
          zIndex:      nextZ,
          isMinimised: false,
        } satisfies WindowState,
      },
    }));
  },

  closeWindow: (id) => {
    set(state => {
      const next = { ...state.windows };
      delete next[id];
      const nextActive =
        state.activeWindowId === id
          ? (Object.values(next) as WindowState[])
              .sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null
          : state.activeWindowId;
      return { windows: next, activeWindowId: nextActive };
    });
  },

  focusWindow: (id) => {
    const win = get().windows[id];
    if (!win) return;
    const nextZ = get().topZ + 1;
    set(state => ({
      topZ: nextZ,
      activeWindowId: id,
      windows: { ...state.windows, [id]: { ...win, zIndex: nextZ } },
    }));
  },

  moveWindow: (id, x, y) => {
    const win = get().windows[id];
    if (!win) return;
    set(state => ({ windows: { ...state.windows, [id]: { ...win, x, y } } }));
  },

  resizeWindow: (id, width, height) => {
    const win = get().windows[id];
    if (!win) return;
    set(state => ({ windows: { ...state.windows, [id]: { ...win, width, height } } }));
  },

  finishBoot: () => set({ booted: true }),

  restart: () => {
    // Close all windows and re-run the boot sequence
    set({ booted: false, windows: {}, activeWindowId: null, topZ: 10 });
  },

  createFolder: (label) => {
    const id: WindowId = `folder-${Date.now()}-${folderCounter++}`;
    const finalLabel = label ?? `Untitled Folder ${folderCounter - 1}`;
    set(state => ({
      userFolders: [...state.userFolders, { id, label: finalLabel }],
    }));
  },

  emptyTrash: () => set({ trashFull: false }),
}));
