'use client';

import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';

const RESUME_URL = '/samuel-funge-cv.pdf';

const RESUME_SECTIONS = [
  {
    heading: 'Education',
    items: [
      {
        title: 'BSc (Hons) Software Engineering',
        sub: 'Nottingham Trent University · 2023 to 2026',
        bullets: [
          'Predicted First Class Honours.',
          'Key modules: Advanced Analysis and Design, Advanced Software Engineering, Mobile Platform Applications, Service Centric and Cloud Computing.',
        ],
      },
      {
        title: 'A Levels',
        sub: 'Newman Sixth Form College · 2021 to 2023',
        bullets: [
          'Computer Science, Mathematical Studies, Level 3 Certificate in Criminology, Media Studies.',
        ],
      },
      {
        title: 'GCSEs',
        sub: 'Cardinal Newman Catholic School · 2016 to 2021',
        bullets: [
          '8 GCSEs including English (7), Mathematics (6) and Computer Science (7).',
        ],
      },
    ],
  },
  {
    heading: 'Projects',
    items: [
      {
        title: 'Multimodal Recommendation & Identification System',
        sub: 'Final Year Project · Python, ClearML, AWS Lambda, DynamoDB, Flutter',
        bullets: [
          'Multimodal ML pipeline across 1,000 records combining pHash (>95% TPR), Google Vision OCR (<15% CER) and audio fingerprinting (>90% TPR).',
          'Sole developer across cloud infrastructure, API design and mobile UI using a production ready AWS serverless environment with a Flutter frontend.',
          'Full ML experiment lifecycle managed with ClearML covering experiment tracking, model versioning and pipeline orchestration.',
        ],
      },
      {
        title: 'Swarm',
        sub: 'Predictive Behavioural Simulation Platform · Python, FastAPI, Next.js 14, Groq, Docker',
        bullets: [
          'Multi agent swarm engine of 100 concurrent LLMs with a stochastic DNA generator compounding 14 behavioural traits into 1M+ unique psychological agent profiles.',
          'Emergent swarm intelligence and real time peer trust algorithms enabling agents to elect or overthrow group leaders dynamically.',
          'Realistic pathfinding on OpenStreetMap data with a custom physics engine that recalculates routes when simulated buildings collapse.',
        ],
      },
      {
        title: 'Dinos',
        sub: 'Native iOS Social Events Platform · Swift, SwiftUI, Firebase, MapKit',
        bullets: [
          'Custom Trust Score algorithm calculating guest reliability from host ratings, contribution history and peer reports.',
          'Privacy focused MapKit overlay abstracting precise event locations via time based unlocks.',
          'Full Firebase BaaS integration: Auth, Cloud Firestore and Firebase Cloud Messaging.',
        ],
      },
    ],
  },
  {
    heading: 'Work Experience',
    items: [
      {
        title: 'Barista',
        sub: 'Avalon, Luton Airport · July 2025 to December 2025',
        bullets: [
          'Prepared and served high volumes of orders during peak early morning travel hours, starting shifts at 2am, maintaining consistent quality under sustained time pressure.',
        ],
      },
      {
        title: 'Bar Staff and Waiter',
        sub: 'The Round Bush, Luton · 2024 to 2025',
        bullets: [
          'Delivered high volume customer service in a fast paced hospitality environment.',
          'Successfully trained two new hires simultaneously during a maximum capacity event (Euros Final).',
        ],
      },
      {
        title: 'Receptionist and Sales Associate',
        sub: 'TeamSport Karting, Dunstable · 2022 to 2023',
        bullets: [
          'Processed 200 to 300 daily transactions with a high degree of accuracy and achieved top internal sales award through upselling.',
          'Independently diagnosed and repaired a critical system fault, eliminating the requirement for an external IT engineer.',
        ],
      },
    ],
  },
  {
    heading: 'Technical Skills',
    items: [
      {
        title: 'Languages',
        sub: '',
        bullets: ['Python, Swift, Java, C++, Haskell, Bash, JavaScript, TypeScript, SQL'],
      },
      {
        title: 'Cloud and Infrastructure',
        sub: '',
        bullets: ['AWS (Lambda, EC2, S3, DynamoDB, API Gateway, Cognito), Firebase, Docker, Supabase, PostgreSQL, SQLite, Cloudflare, Vercel'],
      },
      {
        title: 'Frameworks and Tools',
        sub: '',
        bullets: ['React, Next.js, TailwindCSS, Flutter, SwiftUI, Express.js, FastAPI, osmnx, Git, GitHub Actions, Docker Compose, Postman'],
      },
      {
        title: 'AI and ML',
        sub: '',
        bullets: ['ClearML, Qdrant, Groq, Google Vision API, Llama 3.1, Ollama, Zep Cloud, Composio, Claude Code'],
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
    <div style={{ fontFamily: 'var(--font-chicago)', fontSize: 10, lineHeight: 1.75 }}>

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
          <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 3 }}>
            Samuel Funge
          </div>
          <div style={{ color: '#555', fontSize: 9, lineHeight: 1.6 }}>
            sam@funge.dev<br />
            github.com/samfunge · linkedin.com/in/samfunge
          </div>
        </div>
        <a
          href={RESUME_URL}
          download
          onClick={handleDownload}
          style={{ textDecoration: 'none', flexShrink: 0 }}
          aria-label="Download CV as PDF"
        >
          <button className="mac-btn" style={{ fontSize: 9, padding: '3px 10px' }}>
            Download CV
          </button>
        </a>
      </div>

      {/* Sections */}
      {RESUME_SECTIONS.map((section) => (
        <div key={section.heading} style={{ marginBottom: 16 }}>
          <div
            style={{
              background: '#000',
              color: '#fff',
              padding: '2px 6px',
              fontSize: 10,
              fontWeight: 'bold',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}
          >
            {section.heading}
          </div>

          {section.items.map((item, i) => (
            <div key={i} style={{ marginBottom: 10, paddingLeft: 6 }}>
              <div style={{ fontWeight: 'bold', fontSize: 11 }}>{item.title}</div>
              {item.sub && (
                <div style={{ color: '#666', marginBottom: 3, fontSize: 9 }}>{item.sub}</div>
              )}
              {item.bullets.map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: 6, paddingLeft: 4, marginBottom: 2 }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>·</span>
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
