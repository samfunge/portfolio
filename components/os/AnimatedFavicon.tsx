'use client';

import { useEffect } from 'react';

/**
 * AnimatedFavicon
 * A utility component that dynamically updates the site favicon to create a winking animation.
 */
export default function AnimatedFavicon() {
  useEffect(() => {
    // We'll cycle through a few "frames" of the Happy Mac winking
    const frames = [
      // Frame 0: Normal Happy Mac
      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="1" width="28" height="24" rx="2" fill="#000" />
        <rect x="3" y="2" width="26" height="22" rx="1" fill="#fff" />
        <rect x="5" y="4" width="22" height="16" fill="#000" />
        <rect x="6" y="5" width="20" height="14" fill="#fff" />
        <rect x="9"  y="8"  width="3" height="3" fill="#000" />
        <rect x="20" y="8"  width="3" height="3" fill="#000" />
        <rect x="9"  y="13" width="2" height="2" fill="#000" />
        <rect x="11" y="15" width="2" height="2" fill="#000" />
        <rect x="13" y="16" width="6" height="2" fill="#000" />
        <rect x="19" y="15" width="2" height="2" fill="#000" />
        <rect x="21" y="13" width="2" height="2" fill="#000" />
        <rect x="13" y="25" width="6" height="2" fill="#000" />
        <rect x="10" y="27" width="12" height="2" fill="#000" />
        <rect x="12" y="21" width="8"  height="1" fill="#000" />
      </svg>`,
      // Frame 1: Winking (one eye closed)
      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="1" width="28" height="24" rx="2" fill="#000" />
        <rect x="3" y="2" width="26" height="22" rx="1" fill="#fff" />
        <rect x="5" y="4" width="22" height="16" fill="#000" />
        <rect x="6" y="5" width="20" height="14" fill="#fff" />
        <rect x="9"  y="8"  width="3" height="1" fill="#000" />
        <rect x="20" y="8"  width="3" height="3" fill="#000" />
        <rect x="9"  y="13" width="2" height="2" fill="#000" />
        <rect x="11" y="15" width="2" height="2" fill="#000" />
        <rect x="13" y="16" width="6" height="2" fill="#000" />
        <rect x="19" y="15" width="2" height="2" fill="#000" />
        <rect x="21" y="13" width="2" height="2" fill="#000" />
        <rect x="13" y="25" width="6" height="2" fill="#000" />
        <rect x="10" y="27" width="12" height="2" fill="#000" />
        <rect x="12" y="21" width="8"  height="1" fill="#000" />
      </svg>`
    ];

    let currentFrame = 0;
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    const updateFavicon = () => {
      const svg = frames[currentFrame];
      const encoded = btoa(svg);
      link.href = `data:image/svg+xml;base64,${encoded}`;
    };

    // Initial set
    updateFavicon();

    const interval = setInterval(() => {
      // Randomly wink every now and then
      if (currentFrame === 0) {
        if (Math.random() > 0.8) {
          currentFrame = 1;
          updateFavicon();
          // Short blink
          setTimeout(() => {
            currentFrame = 0;
            updateFavicon();
          }, 200);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
