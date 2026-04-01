'use client';

import { useState } from 'react';
import { useAudio } from '@/components/providers/AudioProvider';
import { usePostHog } from 'posthog-js/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FolderIcon, FileTextIcon } from '@/components/os/MacIcons';

interface Project {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  tech: string[];
  description: string;
  bullets: string[];
  href: string;
}

const PROJECTS: Project[] = [
  {
    id: 'multimodal',
    name: 'Multimodal Identification System',
    shortName: 'Vinyl ID',
    tag: 'Final Year Project',
    tech: ['Python', 'ClearML', 'AWS Lambda', 'DynamoDB', 'S3', 'Flutter', 'Discogs API'],
    description:
      'A cross platform mobile app that accurately identifies vinyl records using a custom multi layered matching system spanning cloud infrastructure, API design and mobile UI integration.',
    bullets: [
      'Multimodal ML pipeline across 1,000 records combining pHash (>95% TPR), Google Vision OCR (<15% CER) and audio fingerprinting (>90% TPR).',
      'Full ML experiment lifecycle managed in ClearML including experiment tracking, model versioning and pipeline orchestration.',
      'Sole developer: production ready AWS serverless environment (Lambda, DynamoDB, S3, API Gateway, Cognito) with a Flutter mobile frontend.',
    ],
    href: 'https://github.com/samfunge',
  },
  {
    id: 'swarm',
    name: 'Swarm',
    shortName: 'Swarm',
    tag: 'Predictive Behavioural Simulation',
    tech: ['Python', 'FastAPI', 'Next.js 14', 'Groq API', 'Llama 3.1', 'osmnx', 'Docker', 'SQLite'],
    description:
      'A predictive disaster simulation platform that stress tests urban evacuation strategies by modelling irrational human behaviour with 100 concurrent AI agents navigating real world city maps.',
    bullets: [
      'Multi agent swarm engine of 100 concurrent LLMs with a stochastic DNA generator compounding 14 behavioural traits into 1M+ unique psychological agent profiles.',
      'Emergent swarm intelligence and communication when peers are geographically co located, enabling agents to dynamically elect or overthrow group leaders via real time peer trust algorithms.',
      'Realistic pathfinding built on OpenStreetMap data (osmnx, NetworkX) with a custom physics engine that recalculates routes in real time when simulated buildings collapse.',
    ],
    href: 'https://github.com/samfunge',
  },
  {
    id: 'dinos',
    name: 'Dinos',
    shortName: 'Dinos',
    tag: 'Native iOS Social Events Platform',
    tech: ['Swift', 'SwiftUI', 'Firebase Auth', 'Cloud Firestore', 'MapKit', 'AVFoundation'],
    description:
      'A privacy first Native iOS application that solves the safety and coordination flaws of organising private events on WhatsApp or Eventbrite, protecting hosts via time based location reveals and a Trust Score system.',
    bullets: [
      'Custom Trust Score algorithm calculating guest reliability from host ratings, contribution history and peer reports, rewarding high trust individuals with priority access to future events.',
      'Privacy focused MapKit overlay that abstracts precise event locations, providing only a radius until a time based unlock reveals the address to confirmed guests.',
      'Full Firebase BaaS integration covering Auth for secure sessions, Cloud Firestore for real time guest list sync and FCM for in app notifications.',
    ],
    href: 'https://github.com/samfunge',
  },
];

export default function ProjectsWindow() {
  const [selected, setSelected] = useState<Project | null>(null);
  const { play } = useAudio();
  const posthog = usePostHog();
  const isMobile = useIsMobile();

  function handleSingleClick(p: Project) {
    play('click');
    if (isMobile && selected?.id === p.id) {
      handleDoubleClick(p);
      return;
    }
    setSelected(p);
  }

  function handleDoubleClick(p: Project) {
    posthog.capture('project_opened', { project_name: p.name });
    window.open(p.href, '_blank', 'noopener,noreferrer');
  }

  return (
    <div style={{ fontFamily: 'var(--font-chicago)', fontSize: 10 }}>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: '1px solid #000',
          color: '#555',
        }}
      >
        <FolderIcon size={16} />
        <span>{PROJECTS.length} items &nbsp;·&nbsp; {isMobile ? 'Tap to preview, tap again to open' : 'Click to preview · Double click to open on GitHub'}</span>
      </div>

      {/* Icons row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        {PROJECTS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSingleClick(p)}
            onDoubleClick={() => handleDoubleClick(p)}
            title={`Double click to open: ${p.name}`}
            aria-label={p.name}
            style={{
              background: selected?.id === p.id ? '#000' : 'none',
              color:      selected?.id === p.id ? '#fff' : '#000',
              border: 'none',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              width: 84,
              padding: 4,
              outline: 'none',
            }}
          >
            <div style={{ filter: selected?.id === p.id ? 'invert(1)' : 'none' }}>
              <FileTextIcon size={36} />
            </div>
            <span style={{ textAlign: 'center', lineHeight: 1.3, fontSize: 9 }}>
              {p.shortName}
            </span>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selected ? (
        <div
          style={{
            borderTop: '1px solid #000',
            paddingTop: 10,
            lineHeight: 1.7,
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 1 }}>
            {selected.name}
          </div>
          <div style={{ color: '#555', marginBottom: 6, fontSize: 9 }}>
            {selected.tag}
          </div>

          {/* Tech pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {selected.tech.map((t) => (
              <span
                key={t}
                style={{
                  border: '1px solid #000',
                  padding: '1px 5px',
                  fontSize: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <p style={{ marginBottom: 8, fontSize: 10 }}>{selected.description}</p>

          {selected.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, paddingLeft: 4 }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>·</span>
              <span style={{ fontSize: 10 }}>{b}</span>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            borderTop: '1px solid #000',
            paddingTop: 10,
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          Click a project to preview details.
        </div>
      )}
    </div>
  );
}
