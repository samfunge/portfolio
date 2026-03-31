import { HappyMacIcon } from '@/components/os/MacIcons';

export default function AboutWindow() {
  return (
    <div style={{ fontFamily: 'var(--font-chicago)', fontSize: 11, lineHeight: 1.8 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <HappyMacIcon size={40} />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>Samuel Funge</div>
          <div style={{ color: '#555', fontSize: 10 }}>Software Engineering Student</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #000', marginBottom: 12 }} />

      <p style={{ marginBottom: 10 }}>
        Final year Software Engineering student at Nottingham Trent University,
        predicted First Class Honours. I have hands on experience building,
        evaluating and deploying machine learning pipelines to live cloud
        environments.
      </p>

      <p style={{ marginBottom: 10 }}>
        I independently engineered a multimodal ML identification system and a
        100 agent predictive behavioural simulation platform. My foundation is
        in Python and system architecture, and I am driven to build world class,
        user centric products.
      </p>

      <p style={{ marginBottom: 12 }}>
        Comfortable across the full stack: from AWS serverless infrastructure
        and FastAPI backends to React frontends and native iOS apps in SwiftUI.
        Currently: building this portfolio instead of revising.
      </p>

      <div style={{ borderTop: '1px solid #000', marginBottom: 12 }} />

      {/* Contact links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[
          { label: 'GitHub',   href: 'https://github.com/samfunge' },
          { label: 'LinkedIn', href: 'https://linkedin.com/in/samfunge' },
          { label: 'Email',    href: 'mailto:samuelfunge@icloud.com' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              color: '#000',
              textDecoration: 'none',
              fontFamily: 'var(--font-chicago)',
              fontSize: 11,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: '#000',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
