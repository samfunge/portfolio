'use client';

import { useState, useEffect } from 'react';

/**
 * A simple hook to detect if the screen width is less than a certain threshold.
 * Uses 768px (standard tablet/mobile breakpoint) as default.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check on mount
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();

    // Re-check on resize
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}
