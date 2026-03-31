'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { POSTHOG_HOST, POSTHOG_KEY } from '@/lib/posthog';

// ─── Inner component: fires a pageview on each navigation ───────────────────
function PostHogPageView() {
  const pathname = usePathname();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname) {
      ph.capture('$pageview', { $current_url: window.location.href });
    }
  }, [pathname, ph]);

  return null;
}

// ─── Root provider: initialises PostHog once on mount ───────────────────────
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!POSTHOG_KEY) return; // silently skip if key not configured

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Session Replay — records mouse, clicks, and keystrokes (masked by default)
      session_recording: {
        maskAllInputs: true,
      },
      // Capture pageviews manually via PostHogPageView
      capture_pageview: false,
      // Respect user's Do Not Track header
      respect_dnt: true,
      // Don't capture pageleave — fires confusingly in SPAs
      capture_pageleave: false,
      persistence: 'localStorage+cookie',
      loaded: (ph) => {
        // Mark localhost sessions as test so they don't pollute production data
        if (process.env.NODE_ENV === 'development') {
          ph.opt_out_capturing();
        }
      },
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
