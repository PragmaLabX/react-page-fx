import { useState } from 'react'
import { usePageNavigator } from 'react-page-fx'
import SlideScreen from './SlideScreen'
import FadeScreen from './FadeScreen'
import BlurScreen from './BlurScreen'

export default function HomeScreen() {
  const { nextPage } = usePageNavigator()
  const [lastReturn, setLastReturn] = useState<string | null>(null)

  return (
    <div style={bg('#0f172a')}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', color: '#475569', marginBottom: 6 }}>
          NPM PACKAGE DEMO
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>react-page-fx</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
          Tap a button to see the transition.
        </p>
      </div>

      {/* onBack callback badge — appears after returning from a page */}
      <div style={{
        height: 38, marginBottom: 20,
        display: 'flex', alignItems: 'center',
      }}>
        {lastReturn && (
          <div style={{
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 8, padding: '6px 12px',
            fontSize: 13, color: '#94a3b8',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>↩</span>
            <span>
              <code style={{ color: '#f1f5f9' }}>onBack</code>
              {' '}fired from <strong style={{ color: '#cbd5e1' }}>{lastReturn}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Demo cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 1 — Slide */}
        <DemoCard
          accent="#22c55e"
          effect="slide"
          extra="parentEffect: 'slide'"
          description="Slides in from the right. Parent shifts left behind it — the iOS navigation style."
          onClick={() => nextPage({
            Component: SlideScreen,
            effect: 'slide',
            showBackButton: true,
            parentEffect: 'slide',
            onBack: () => setLastReturn('SlideScreen'),
          })}
        />

        {/* 2 — Fade */}
        <DemoCard
          accent="#a855f7"
          effect="fade"
          extra="+ preload demo"
          description="Crossfade transition. Screen is preloaded in the background for instant activation."
          onClick={() => nextPage({
            Component: FadeScreen,
            effect: 'fade',
            showBackButton: true,
            onBack: () => setLastReturn('FadeScreen'),
          })}
        />

        {/* 3 — Blur parent */}
        <DemoCard
          accent="#f59e0b"
          effect="slide"
          extra="parentEffect: 'blur'"
          description="Slides in over a blurred parent. Ideal for overlay and modal-style screens."
          onClick={() => nextPage({
            Component: BlurScreen,
            effect: 'slide',
            showBackButton: true,
            parentEffect: 'blur',
            onBack: () => setLastReturn('BlurScreen'),
          })}
        />

      </div>
    </div>
  )
}

function DemoCard({
  accent, effect, extra, description, onClick,
}: {
  accent: string
  effect: string
  extra: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#1e293b',
        border: `1px solid ${accent}33`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 10,
        padding: '14px 16px',
        textAlign: 'left',
        cursor: 'pointer',
        color: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: accent, fontWeight: 700 }}>
          effect: &apos;{effect}&apos;
        </span>
        <span style={{
          fontSize: 11, background: `${accent}1a`, color: accent,
          padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace',
        }}>
          {extra}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{description}</p>
    </button>
  )
}

function bg(color: string): React.CSSProperties {
  return {
    height: '100%',
    background: color,
    padding: '48px 24px 32px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  }
}
