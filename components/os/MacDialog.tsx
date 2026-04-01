'use client';

import { useEffect, useRef } from 'react';

export interface DialogButton {
  label:    string;
  onClick:  () => void;
  primary?: boolean;
}

interface MacDialogProps {
  title?:    string;
  icon?:     React.ReactNode;
  children:  React.ReactNode;
  buttons?:  DialogButton[];
  onClose?:  () => void;
  /** z-index — defaults to 9500 so it sits above windows but below the CRT overlay */
  zIndex?:   number;
}

/**
 * MacDialog
 * Renders a classic System 1 alert/modal dialog, centred on screen.
 * Traps focus and closes on Escape.
 */
export default function MacDialog({
  title,
  icon,
  children,
  buttons = [{ label: 'OK', onClick: () => {}, primary: true }],
  onClose,
  zIndex = 9500,
}: MacDialogProps) {
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  // Focus the primary button on mount
  useEffect(() => { firstBtnRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    if (!onClose) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose!();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {/* Dialog box */}
      <div
        className="mac-dialog"
        style={{ minWidth: 260, maxWidth: 360 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Icon + title row */}
        {(icon || title) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            {icon && <div style={{ flexShrink: 0 }}>{icon}</div>}
            {title && (
              <div style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'left' }}>
                {title}
              </div>
            )}
          </div>
        )}

        {(icon || title) && (
          <div style={{ width: '100%', borderTop: '1px solid #000' }} />
        )}

        {/* Body */}
        <div style={{ width: '100%', textAlign: 'left', fontSize: 11, lineHeight: 1.7 }}>
          {children}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
          {buttons.map((btn, i) => (
            <button
              key={btn.label}
              ref={i === 0 ? firstBtnRef : undefined}
              className={`mac-btn${btn.primary ? ' mac-btn-default' : ''}`}
              style={{ fontSize: 11 }}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
