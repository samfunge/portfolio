import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for framer-motion or other libraries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock PostHog
vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: vi.fn(),
    identify: vi.fn(),
  }),
  PostHogProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock AudioProvider
vi.mock('@/components/providers/AudioProvider', () => ({
  useAudio: () => ({
    play: vi.fn(),
    muted: false,
    toggleMute: vi.fn(),
  }),
  default: ({ children }: { children: React.ReactNode }) => children,
}));
