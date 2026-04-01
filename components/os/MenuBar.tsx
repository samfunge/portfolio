'use client';

import { useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';
import { useDesktopStore } from '@/store/useDesktopStore';
import MacDialog from './MacDialog';
import { HappyMacIcon, AppleIcon, SpeakerOnIcon, SpeakerOffIcon } from './MacIcons';

// ─── Clock ────────────────────────────────────────────────────────────────────
function MenuBarClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    function tick() {
      const now  = new Date();
      const h    = now.getHours() % 12 || 12;
      const m    = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() < 12 ? 'AM' : 'PM';
      setTime(`${h}:${m} ${ampm}`);
    }
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return <span className="mac-menubar-clock">{time}</span>;
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
interface MenuItem {
  label?:    string;
  action?:   () => void;
  disabled?: boolean;
  divider?:  boolean;
}

interface DropdownProps {
  label:    string | React.ReactNode;
  items:    MenuItem[];
  open:     boolean;
  onToggle: () => void;
  onClose:  () => void;
}

function MenuDropdown({ label, items, open, onToggle, onClose }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span
        className={`mac-menubar-item${open ? ' active' : ''}`}
        onMouseDown={e => { e.preventDefault(); onToggle(); }}
      >
        {label}
      </span>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0,
          background: '#fff', border: '1px solid #000',
          boxShadow: '2px 2px 0 #000', minWidth: 180, zIndex: 9998,
        }}>
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} style={{ height: 1, background: '#000', margin: '2px 0' }} />
            ) : (
              <div
                key={i}
                style={{
                  padding: '3px 20px',
                  fontFamily: 'var(--font-chicago)',
                  fontSize: 12,
                  cursor: item.disabled ? 'default' : 'default',
                  color: item.disabled ? '#aaa' : '#000',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!item.disabled) {
                    (e.currentTarget as HTMLElement).style.background = '#000';
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '';
                  (e.currentTarget as HTMLElement).style.color = item.disabled ? '#aaa' : '#000';
                }}
                onMouseDown={e => {
                  e.preventDefault();
                  if (!item.disabled && item.action) {
                    item.action();
                    onClose();
                  }
                }}
              >
                {item.label}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shutdown screen ──────────────────────────────────────────────────────────
function ShutdownScreen({ onCancel }: { onCancel: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#fff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, zIndex: 9600,
      fontFamily: 'var(--font-chicago)', fontSize: 13,
    }}>
      <p style={{ textAlign: 'center', maxWidth: 320, lineHeight: 1.8 }}>
        It is now safe to close your browser.
      </p>
      <button
        className="mac-btn"
        style={{ fontSize: 11 }}
        onClick={onCancel}
      >
        Actually, keep going
      </button>
    </div>
  );
}

// ─── MenuBar ─────────────────────────────────────────────────────────────────
type DialogKind = 'about-computer' | 'get-info' | 'new-folder' | null;

export default function MenuBar() {
  const [openMenu,  setOpenMenu]  = useState<string | null>(null);
  const [dialog,    setDialog]    = useState<DialogKind>(null);
  const [shutdown,  setShutdown]  = useState(false);
  const [newFolderName, setNewFolderName] = useState('Untitled Folder');

  const { muted, toggleMute, play } = useAudio();
  const posthog = usePostHog();

  const {
    activeWindowId,
    windows,
    closeWindow,
    createFolder,
    emptyTrash,
    restart,
    trashFull,
  } = useDesktopStore();

  const activeWin = activeWindowId ? windows[activeWindowId] : null;

  function open(menu: string) {
    play('click');
    setOpenMenu(prev => prev === menu ? null : menu);
  }

  function close() { setOpenMenu(null); }

  // ── Menu definitions with live actions ─────────────────────────────────────

  const appleItems: MenuItem[] = [
    {
      label: 'About This Computer',
      action: () => { play('click'); setDialog('about-computer'); },
    },
    { divider: true },
    { label: 'Desk Accessories', disabled: true },
    { divider: true },
    { label: 'Control Panel',    disabled: true },
    { label: 'Key Caps',         disabled: true },
  ];

  const fileItems: MenuItem[] = [
    {
      label: 'New Folder',
      action: () => { setNewFolderName('Untitled Folder'); setDialog('new-folder'); },
    },
    { divider: true },
    {
      label: 'Close Window',
      disabled: !activeWin,
      action: () => {
        if (activeWindowId) { play('click'); closeWindow(activeWindowId); }
      },
    },
    { divider: true },
    {
      label: 'Get Info',
      disabled: !activeWin,
      action: () => { play('click'); setDialog('get-info'); },
    },
  ];

  const editItems: MenuItem[] = [
    { label: 'Undo',       disabled: true },
    { divider: true },
    { label: 'Cut',        disabled: true },
    { label: 'Copy',       disabled: true },
    { label: 'Paste',      disabled: true },
    { label: 'Clear',      disabled: true },
    { label: 'Select All', disabled: true },
  ];

  const viewItems: MenuItem[] = [
    { label: 'By Icon', disabled: true },
    { label: 'By Name', disabled: true },
    { label: 'By Date', disabled: true },
    { label: 'By Size', disabled: true },
    { label: 'By Kind', disabled: true },
  ];

  const specialItems: MenuItem[] = [
    {
      label: 'Clean Up',
      disabled: true,
    },
    {
      label: trashFull ? 'Empty Trash' : 'Trash is Empty',
      disabled: !trashFull,
      action: () => {
        play('crunch');
        emptyTrash();
        posthog.capture('trash_emptied');
      },
    },
    { divider: true },
    {
      label: 'Restart',
      action: () => {
        play('click');
        setTimeout(() => restart(), 200);
      },
    },
    {
      label: 'Shut Down',
      action: () => { play('click'); setShutdown(true); },
    },
  ];

  // ── Dialogs ─────────────────────────────────────────────────────────────────

  if (shutdown) return <ShutdownScreen onCancel={() => setShutdown(false)} />;

  return (
    <>
      {/* ── About This Computer ──────────────────────────────────────────── */}
      {dialog === 'about-computer' && (
        <MacDialog
          title="About This Computer"
          icon={<HappyMacIcon size={36} />}
          onClose={() => setDialog(null)}
          buttons={[{ label: 'OK', onClick: () => setDialog(null), primary: true }]}
        >
          <div style={{ lineHeight: 1.8, fontSize: 11 }}>
            <div style={{ marginBottom: 6 }}>
              <strong>Mac OS 1.0</strong>
            </div>
            <div>Total Memory: 128K</div>
            <div>Finder: 1.0</div>
            <div>Built with: Next.js 16, React 19</div>
            <div style={{ marginTop: 8, color: '#555', fontSize: 10 }}>
              Crafted by Samuel Funge
            </div>
          </div>
        </MacDialog>
      )}

      {/* ── Get Info ─────────────────────────────────────────────────────── */}
      {dialog === 'get-info' && activeWin && (
        <MacDialog
          title={`Info: ${activeWin.title}`}
          onClose={() => setDialog(null)}
          buttons={[{ label: 'OK', onClick: () => setDialog(null), primary: true }]}
        >
          <div style={{ lineHeight: 1.9, fontSize: 11 }}>
            <div><strong>Name:</strong> {activeWin.title}</div>
            <div><strong>Position:</strong> {Math.round(activeWin.x)}, {Math.round(activeWin.y)}</div>
            <div><strong>Size:</strong> {Math.round(activeWin.width)} x {Math.round(activeWin.height)} px</div>
          </div>
        </MacDialog>
      )}

      {/* ── New Folder ───────────────────────────────────────────────────── */}
      {dialog === 'new-folder' && (
        <MacDialog
          title="New Folder"
          onClose={() => setDialog(null)}
          buttons={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'Create',
              primary: true,
              onClick: () => {
                play('click');
                createFolder(newFolderName.trim() || 'Untitled Folder');
                setDialog(null);
                posthog.capture('folder_created', { name: newFolderName });
              },
            },
          ]}
        >
          <div style={{ fontSize: 11, lineHeight: 1.8 }}>
            <div style={{ marginBottom: 6 }}>Name your new folder:</div>
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  play('click');
                  createFolder(newFolderName.trim() || 'Untitled Folder');
                  setDialog(null);
                }
              }}
              style={{
                width: '100%',
                fontFamily: 'var(--font-chicago)',
                fontSize: 11,
                border: '1px solid #000',
                padding: '3px 6px',
                outline: 'none',
                background: '#fff',
              }}
            />
          </div>
        </MacDialog>
      )}

      {/* ── Menu bar chrome ──────────────────────────────────────────────── */}
      <div className="mac-menubar" style={{ zIndex: 9000 }}>

        <MenuDropdown
          label={<AppleIcon size={14} style={{ marginTop: -1 }} />}
          items={appleItems}
          open={openMenu === 'apple'}
          onToggle={() => open('apple')}
          onClose={close}
        />

        <MenuDropdown label="File"    items={fileItems}    open={openMenu === 'File'}    onToggle={() => open('File')}    onClose={close} />
        <MenuDropdown label="Edit"    items={editItems}    open={openMenu === 'Edit'}    onToggle={() => open('Edit')}    onClose={close} />
        <MenuDropdown label="View"    items={viewItems}    open={openMenu === 'View'}    onToggle={() => open('View')}    onClose={close} />
        <MenuDropdown label="Special" items={specialItems} open={openMenu === 'Special'} onToggle={() => open('Special')} onClose={close} />

        {/* Right controls */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', height: '100%' }}>
          <button
            onClick={() => { toggleMute(); posthog.capture('audio_toggled', { muted: !muted }); }}
            title={muted ? 'Unmute' : 'Mute'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'default',
              padding: '0 10px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#000';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.filter = 'invert(1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.filter = '';
            }}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <SpeakerOffIcon size={14} /> : <SpeakerOnIcon size={14} />}
          </button>
          <div style={{ height: '60%', width: 1, background: '#000', opacity: 0.2, margin: '0 4px' }} />
          <MenuBarClock />
        </div>
      </div>
    </>
  );
}
