import { HappyMacIcon } from '@/components/os/MacIcons';

/**
 * AboutWindow — contents of About.txt
 * Pure presentational component; rendered inside the Window shell (Stage 5).
 */
export default function AboutWindow() {
  return (
    <div style={{ fontFamily: 'var(--font-chicago)', fontSize: 11, lineHeight: 1.7 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <HappyMacIcon size={40} />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>About Me</div>
          <div style={{ color: '#555', fontSize: 10 }}>Version 1.0 — Human Edition</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #000', marginBottom: 12 }} />

      <p style={{ marginBottom: 8 }}>
        Hi — I&apos;m a software engineer who builds things for the web.
        I care deeply about developer experience, clean interfaces,
        and systems that feel great to use.
      </p>
      <p style={{ marginBottom: 8 }}>
        Currently working on full-stack projects with React, Next.js,
        TypeScript, and whatever tool is right for the job.
        I have a weakness for retro aesthetics and pixel-perfect UIs.
      </p>
      <p style={{ marginBottom: 12 }}>
        Outside of code: synthesisers, long-distance cycling,
        and collecting dead MacOS versions.
      </p>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #000', marginBottom: 12 }} />

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'GitHub',   href: 'https://github.com' },
          { label: 'LinkedIn', href: 'https://linkedin.com' },
          { label: 'Email',    href: 'mailto:hello@example.com' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#000',
              textDecoration: 'none',
              fontFamily: 'var(--font-chicago)',
              fontSize: 11,
            }}
          >
            <span style={{ width: 8, height: 8, background: '#000', display: 'inline-block', flexShrink: 0 }} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
