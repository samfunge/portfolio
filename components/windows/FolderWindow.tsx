import { FolderIcon } from '@/components/os/MacIcons';

/** Content shown inside a user-created folder window. */
export default function FolderWindow() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 100,
        gap: 10,
        fontFamily: 'var(--font-chicago)',
        fontSize: 11,
        color: '#555',
      }}
    >
      <FolderIcon size={40} />
      <span>This folder is empty.</span>
    </div>
  );
}
