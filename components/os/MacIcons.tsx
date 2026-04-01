/**
 * MacIcons.tsx
 * All 1-bit SVG icons used throughout the desktop.
 * Every icon uses viewBox="0 0 32 32", black fill only, no anti-aliasing.
 */

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Happy Mac (boot screen + about window) ───────────────────────────────────
export function HappyMacIcon({ size = 64, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Monitor outer shell */}
      <rect x="2" y="1" width="28" height="24" rx="2" fill="#000" />
      <rect x="3" y="2" width="26" height="22" rx="1" fill="#fff" />

      {/* Screen bezel (dark) */}
      <rect x="5" y="4" width="22" height="16" fill="#000" />
      {/* Screen surface */}
      <rect x="6" y="5" width="20" height="14" fill="#fff" />

      {/* Left eye */}
      <rect x="9"  y="8"  width="3" height="3" fill="#000" />
      {/* Right eye */}
      <rect x="20" y="8"  width="3" height="3" fill="#000" />

      {/* Smile — pixel art curve */}
      <rect x="9"  y="13" width="2" height="2" fill="#000" />
      <rect x="11" y="15" width="2" height="2" fill="#000" />
      <rect x="13" y="16" width="6" height="2" fill="#000" />
      <rect x="19" y="15" width="2" height="2" fill="#000" />
      <rect x="21" y="13" width="2" height="2" fill="#000" />

      {/* Base / neck */}
      <rect x="13" y="25" width="6" height="2" fill="#000" />
      {/* Stand */}
      <rect x="10" y="27" width="12" height="2" fill="#000" />

      {/* Disk slot */}
      <rect x="12" y="21" width="8"  height="1" fill="#000" />
    </svg>
  );
}

// ─── Sad Mac (error / trash content) ─────────────────────────────────────────
export function SadMacIcon({ size = 64, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      <rect x="2" y="1" width="28" height="24" rx="2" fill="#000" />
      <rect x="3" y="2" width="26" height="22" rx="1" fill="#fff" />
      <rect x="5" y="4" width="22" height="16" fill="#000" />
      <rect x="6" y="5" width="20" height="14" fill="#fff" />
      {/* X eyes */}
      <rect x="9"  y="8"  width="2" height="2" fill="#000" />
      <rect x="11" y="10" width="2" height="2" fill="#000" />
      <rect x="11" y="8"  width="2" height="2" fill="#000" />
      <rect x="9"  y="10" width="2" height="2" fill="#000" />
      <rect x="20" y="8"  width="2" height="2" fill="#000" />
      <rect x="22" y="10" width="2" height="2" fill="#000" />
      <rect x="22" y="8"  width="2" height="2" fill="#000" />
      <rect x="20" y="10" width="2" height="2" fill="#000" />
      {/* Frown */}
      <rect x="9"  y="15" width="2" height="2" fill="#000" />
      <rect x="11" y="13" width="2" height="2" fill="#000" />
      <rect x="13" y="12" width="6" height="2" fill="#000" />
      <rect x="19" y="13" width="2" height="2" fill="#000" />
      <rect x="21" y="15" width="2" height="2" fill="#000" />
      <rect x="13" y="25" width="6" height="2" fill="#000" />
      <rect x="10" y="27" width="12" height="2" fill="#000" />
      <rect x="12" y="21" width="8"  height="1" fill="#000" />
    </svg>
  );
}

// ─── Folder ───────────────────────────────────────────────────────────────────
export function FolderIcon({ size = 48, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Folder back */}
      <rect x="1" y="8"  width="30" height="20" fill="#000" />
      <rect x="2" y="9"  width="28" height="18" fill="#fff" />
      {/* Tab */}
      <rect x="1" y="5"  width="12" height="4"  fill="#000" />
      <rect x="2" y="6"  width="10" height="3"  fill="#fff" />
      {/* Folder front outline */}
      <rect x="1" y="12" width="30" height="16" fill="#000" />
      <rect x="2" y="13" width="28" height="14" fill="#fff" />
      {/* Bottom shadow line */}
      <rect x="2" y="27" width="28" height="1"  fill="#000" />
    </svg>
  );
}

// ─── Document / text file ─────────────────────────────────────────────────────
export function FileTextIcon({ size = 48, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Page outline */}
      <rect x="4"  y="1"  width="20" height="30" fill="#000" />
      <rect x="5"  y="2"  width="18" height="28" fill="#fff" />
      {/* Folded corner — top right */}
      <rect x="18" y="1"  width="6"  height="6"  fill="#fff" />
      <rect x="18" y="1"  width="6"  height="1"  fill="#000" />
      <rect x="23" y="1"  width="1"  height="6"  fill="#000" />
      <rect x="18" y="6"  width="6"  height="1"  fill="#000" />
      <rect x="18" y="1"  width="1"  height="6"  fill="#000" />
      {/* Text lines */}
      <rect x="7"  y="10" width="14" height="1"  fill="#000" />
      <rect x="7"  y="13" width="14" height="1"  fill="#000" />
      <rect x="7"  y="16" width="14" height="1"  fill="#000" />
      <rect x="7"  y="19" width="10" height="1"  fill="#000" />
      <rect x="7"  y="22" width="14" height="1"  fill="#000" />
      <rect x="7"  y="25" width="8"  height="1"  fill="#000" />
    </svg>
  );
}

// ─── PDF file ─────────────────────────────────────────────────────────────────
export function FilePdfIcon({ size = 48, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Same page shape */}
      <rect x="4"  y="1"  width="20" height="30" fill="#000" />
      <rect x="5"  y="2"  width="18" height="28" fill="#fff" />
      <rect x="18" y="1"  width="6"  height="6"  fill="#fff" />
      <rect x="18" y="1"  width="6"  height="1"  fill="#000" />
      <rect x="23" y="1"  width="1"  height="6"  fill="#000" />
      <rect x="18" y="6"  width="6"  height="1"  fill="#000" />
      <rect x="18" y="1"  width="1"  height="6"  fill="#000" />
      {/* "PDF" label band */}
      <rect x="5"  y="12" width="18" height="8"  fill="#000" />
      {/* "P" */}
      <rect x="7"  y="14" width="1"  height="4"  fill="#fff" />
      <rect x="8"  y="14" width="2"  height="1"  fill="#fff" />
      <rect x="10" y="14" width="1"  height="2"  fill="#fff" />
      <rect x="8"  y="16" width="2"  height="1"  fill="#fff" />
      {/* "D" */}
      <rect x="12" y="14" width="1"  height="4"  fill="#fff" />
      <rect x="13" y="14" width="2"  height="1"  fill="#fff" />
      <rect x="15" y="15" width="1"  height="2"  fill="#fff" />
      <rect x="13" y="17" width="2"  height="1"  fill="#fff" />
      {/* "F" */}
      <rect x="17" y="14" width="1"  height="4"  fill="#fff" />
      <rect x="18" y="14" width="3"  height="1"  fill="#fff" />
      <rect x="18" y="16" width="2"  height="1"  fill="#fff" />
      {/* Lines below */}
      <rect x="7"  y="22" width="14" height="1"  fill="#000" />
      <rect x="7"  y="25" width="10" height="1"  fill="#000" />
    </svg>
  );
}

// ─── Games folder (with joystick hint) ───────────────────────────────────────
export function GamesIcon({ size = 48, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Folder base */}
      <rect x="1"  y="8"  width="30" height="20" fill="#000" />
      <rect x="2"  y="9"  width="28" height="18" fill="#fff" />
      <rect x="1"  y="5"  width="12" height="4"  fill="#000" />
      <rect x="2"  y="6"  width="10" height="3"  fill="#fff" />
      <rect x="1"  y="12" width="30" height="16" fill="#000" />
      <rect x="2"  y="13" width="28" height="14" fill="#fff" />
      <rect x="2"  y="27" width="28" height="1"  fill="#000" />
      {/* D-pad cross */}
      <rect x="9"  y="18" width="3"  height="7"  fill="#000" />
      <rect x="7"  y="20" width="7"  height="3"  fill="#000" />
      {/* Buttons A/B */}
      <rect x="19" y="19" width="3"  height="3"  fill="#000" />
      <rect x="23" y="22" width="3"  height="3"  fill="#000" />
    </svg>
  );
}

// ─── Trash can ────────────────────────────────────────────────────────────────
export function TrashIcon({ size = 48, className, style, full = false }: IconProps & { full?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Lid */}
      <rect x="6"  y="4"  width="20" height="2"  fill="#000" />
      <rect x="7"  y="5"  width="18" height="1"  fill="#000" />
      {/* Handle on lid */}
      <rect x="13" y="2"  width="6"  height="3"  fill="#000" />
      <rect x="14" y="3"  width="4"  height="2"  fill="#fff" />
      {/* Body outline */}
      <rect x="7"  y="8"  width="18" height="20" fill="#000" />
      <rect x="8"  y="9"  width="16" height="18" fill="#fff" />
      {/* Bottom */}
      <rect x="8"  y="27" width="16" height="1"  fill="#000" />
      {/* Vertical ribs */}
      <rect x="11" y="10" width="1"  height="16" fill="#000" />
      <rect x="15" y="10" width="1"  height="16" fill="#000" />
      <rect x="19" y="10" width="1"  height="16" fill="#000" />
      {/* If full, show crumpled paper */}
      {full && (
        <>
          <rect x="10" y="13" width="4" height="3" fill="#000" />
          <rect x="16" y="15" width="5" height="4" fill="#000" />
          <rect x="12" y="17" width="3" height="3" fill="#000" />
        </>
      )}
    </svg>
  );
}

// ─── Apple logo (menu bar) ────────────────────────────────────────────────────
export function AppleIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Stylised apple silhouette */}
      <path
        d="M8 2 C6 2 5 4 5 4 C5 4 3 3 3 5 C3 8 4 11 5 12 C6 13 7 13 8 13 C9 13 10 13 11 12 C12 11 13 8 13 5 C13 3 11 4 11 4 C11 4 10 2 8 2 Z"
        fill="#000"
      />
      {/* Leaf */}
      <path d="M8 2 C8 0 10 0 10 1 C9 2 8 2 8 2 Z" fill="#000" />
      {/* Bite */}
      <circle cx="11" cy="6" r="1.5" fill="#fff" />
    </svg>
  );
}

// ─── Speaker / audio toggle ───────────────────────────────────────────────────
export function SpeakerOnIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      <rect x="1" y="4" width="3" height="6" fill="#000" />
      <polygon points="4,4 4,10 9,12 9,2" fill="#000" />
      {/* Wave 1 */}
      <rect x="11" y="5" width="1" height="4" fill="#000" />
      {/* Wave 2 */}
      <rect x="13" y="3" width="1" height="8" fill="#000" />
    </svg>
  );
}

export function SpeakerOffIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      <rect x="1" y="4" width="3" height="6" fill="#000" />
      <polygon points="4,4 4,10 9,12 9,2" fill="#000" />
      {/* X for off */}
      <rect x="11" y="5" width="1" height="1" fill="#000" />
      <rect x="13" y="5" width="1" height="1" fill="#000" />
      <rect x="12" y="6" width="1" height="1" fill="#000" />
      <rect x="11" y="7" width="1" height="1" fill="#000" />
      <rect x="13" y="7" width="1" height="1" fill="#000" />
    </svg>
  );
}
