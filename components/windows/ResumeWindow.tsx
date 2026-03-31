'use client';

import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';

/**
 * ResumeWindow — pixelated resume preview with download button.
 * Replace the RESUME_URL constant and the content sections with real data.
 */

const RESUME_URL = '/resume.pdf'; // place your PDF at public/resume.pdf

const RESUME_SECTIONS = [
  {
    heading: 'Experience',
    items: [
      {
        title: 'Senior Software Engineer',
        sub: 'Acme Corp · 2022 – Present',
        bullets: [
          'Led migration from CRA to Next.js App Router, cutting TTI by 40%.',
          'Designed component library used across 6 product teams.',
        ],
      },
      {
        title: 'Software Engineer',
        sub: 'Widgets Inc · 2019 – 2022',
        bullets: [
          'Built real-time collaborative editing features in React.',
          'Reduced API response time by 60% via query optimisation.',
        ],
      },
    ],
  },
  {
    heading: 'Education',
    items: [
      {
        title: 'B.Sc. Computer Science',
        sub: 'State University · 2015 – 2019',
        bullets: [],
      },
    ],
  },
  {
    heading: 'Skills',
    items: [
      {
        title: 'TypeScript · React · Next.js · Node.js · PostgreSQL · Tailwind CSS',
        sub: '',
        bullets: [],
      },
    ],
  },
];

export default function ResumeWindow() {
  const posthog = usePostHog();
  const { play } = useAudio();

  function handleDownload() {
    play('click');
    posthog.capture('resume_downloaded');
  }

  return (
    <div style={{ fontFamily: 'var(--font-chicago)', fontSize: 10, lineHeight: 1.7 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: '1px solid #000',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>
            Your Name
          </div>
          <div style={{ color: '#555' }}>your.email@example.com · github.com/you</div>
        </div>
        <a
          href={RESUME_URL}
          download
          onClick={handleDownload}
          style={{ textDecoration: 'none' }}
          aria-label="Download resume PDF"
        >
          <button className="mac-btn" style={{ fontSize: 10, padding: '3px 10px' }}>
            ↓ Download PDF
          </button>
        </a>
      </div>

      {/* Sections */}
      {RESUME_SECTIONS.map((section) => (
        <div key={section.heading} style={{ marginBottom: 14 }}>
          {/* Section heading — dithered band */}
          <div
            style={{
              background: '#000',
              color: '#fff',
              padding: '2px 6px',
              fontSize: 10,
              fontWeight: 'bold',
              marginBottom: 6,
            }}
          >
            {section.heading}
          </div>

          {section.items.map((item, i) => (
            <div key={i} style={{ marginBottom: 8, paddingLeft: 6 }}>
              <div style={{ fontWeight: 'bold', fontSize: 11 }}>{item.title}</div>
              {item.sub && (
                <div style={{ color: '#555', marginBottom: 2 }}>{item.sub}</div>
              )}
              {item.bullets.map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: 6, paddingLeft: 4 }}>
                  <span style={{ flexShrink: 0 }}>·</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
