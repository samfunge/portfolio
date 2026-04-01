import { describe, it, expect, beforeEach } from 'vitest';
import { useDesktopStore } from '@/store/useDesktopStore';

describe('useDesktopStore', () => {
  beforeEach(() => {
    useDesktopStore.setState({
      windows: {},
      activeWindowId: null,
      topZ: 10,
      booted: false,
      trashFull: false,
      userFolders: [],
    });
  });

  it('should initialize with default state', () => {
    const state = useDesktopStore.getState();
    expect(state.booted).toBe(false);
    expect(state.windows).toEqual({});
  });

  it('should open a window', () => {
    const { openWindow } = useDesktopStore.getState();
    openWindow('about');

    const state = useDesktopStore.getState();
    expect(state.windows['about']!.title).toBe('About.txt');
    expect(state.activeWindowId).toBe('about');
  });

  it('should close a window', () => {
    const { openWindow, closeWindow } = useDesktopStore.getState();
    openWindow('about');
    closeWindow('about');

    const state = useDesktopStore.getState();
    expect(state.windows['about']).toBeUndefined();
    expect(state.activeWindowId).toBe(null);
  });

  it('should focus a window and increase zIndex', () => {
    const { openWindow, focusWindow } = useDesktopStore.getState();
    openWindow('about');
    const firstZ = useDesktopStore.getState().windows['about']!.zIndex;

    openWindow('projects');
    focusWindow('about');

    const state = useDesktopStore.getState();
    expect(state.activeWindowId).toBe('about');
    expect(state.windows['about']!.zIndex).toBeGreaterThan(firstZ);
  });

  it('should create a new folder', () => {
    const { createFolder } = useDesktopStore.getState();
    createFolder('My Work');

    const state = useDesktopStore.getState();
    expect(state.userFolders).toHaveLength(1);
    expect(state.userFolders[0].label).toBe('My Work');
  });
});
