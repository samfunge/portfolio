'use client';

import { useDesktopStore } from '@/store/useDesktopStore';
import { useAudio } from '@/components/providers/AudioProvider';
import { usePostHog } from 'posthog-js/react';
import { FolderIcon, FileTextIcon } from '@/components/os/MacIcons';

interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  href: string;
}

const PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: 'Mac OS Portfolio',
    description: 'This website — a retro Macintosh 128K simulator built in Next.js.',
    tech: ['Next.js', 'Tailwind', 'Framer Motion', 'Zustand'],
    href: 'https://github.com',
  },
  {
    id: 'project-2',
    name: 'Project Two',
    description: 'Replace this with a real project description.',
    tech: ['React', 'TypeScript', 'Node.js'],
    href: 'https://github.com',
  },
  {
    id: 'project-3',
    name: 'Project Three',
    description: 'Replace this with a real project description.',
    tech: ['Python', 'FastAPI', 'PostgreSQL'],
    href: 'https://github.com',
  },
];

/**
 * ProjectsWindow — icon-grid view of portfolio projects.
 * Double-clicking a project icon opens the external link.
 */
export default function ProjectsWindow() {
  const { play } = useAudio();
  const posthog = usePostHog();

  function handleOpen(project: Project) {
    play('click');
    posthog.capture('project_opened', { project_name: project.name });
    window.open(project.href, '_blank', 'noopener,noreferrer');
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: '1px solid #000',
          fontFamily: 'var(--font-chicago)',
          fontSize: 10,
          color: '#555',
        }}
      >
        <FolderIcon size={16} />
        <span>3 items</span>
      </div>

      {/* Project icons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        {PROJECTS.map((p) => (
          <button
            key={p.id}
            onDoubleClick={() => handleOpen(p)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              width: 90,
              padding: 4,
              fontFamily: 'var(--font-chicago)',
              fontSize: 10,
              outline: 'none',
            }}
            title={`Double-click to open: ${p.name}`}
            aria-label={p.name}
          >
            <FileTextIcon size={40} />
            <span
              style={{
                textAlign: 'center',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {p.name}
            </span>
          </button>
        ))}
      </div>

      {/* Selected project detail — shown below the icons */}
      <div
        style={{
          marginTop: 16,
          borderTop: '1px solid #000',
          paddingTop: 10,
          fontFamily: 'var(--font-chicago)',
          fontSize: 10,
          color: '#444',
          lineHeight: 1.6,
        }}
      >
        <em>Double-click an icon to view the project.</em>
      </div>
    </div>
  );
}
