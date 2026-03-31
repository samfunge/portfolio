'use client';

import { useAudio } from '@/components/providers/AudioProvider';
import { useEffect } from 'react';
import { SadMacIcon } from '@/components/os/MacIcons';

/**
 * TrashWindow — plays a crunch sound on open and shows the classic
 * "The Trash is Empty" message.
 */
export default function TrashWindow() {
  const { play } = useAudio();

  // Play crunch the moment this mounts (i.e. the window opens)
  useEffect(() => {
    play('crunch');
  }, [play]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
        fontFamily: 'var(--font-chicago)',
        fontSize: 11,
        color: '#000',
        minHeight: 100,
      }}
    >
      <SadMacIcon size={40} />
      <span>The Trash is Empty.</span>
    </div>
  );
}
