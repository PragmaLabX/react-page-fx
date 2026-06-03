import { useEffect, useRef, useState } from 'react'
import { type PreloadHandle, useScreenNavigator } from 'react-page-fx'
import PreloadedScreen from './PreloadedScreen'
import { Btn, CodeBlock, Label, Section } from './SlideScreen'

/**
 * Demonstrates: effect: 'fade'
 * Also demonstrates: preloadScreen — mounts PreloadedScreen off-screen on mount,
 * then activates it instantly when the user taps "Open Preloaded".
 */
export default function FadeScreen() {
  const { nextScreen, backScreen, preloadScreen } = useScreenNavigator()

  const handleRef = useRef<PreloadHandle | null>(null)
  const [preloadReady, setPreloadReady] = useState(false)

  // Preload as soon as this screen mounts
  useEffect(() => {
    handleRef.current = preloadScreen({
      Component: PreloadedScreen,
      pageName: 'preloaded',
      effect: 'slide',
      showBackButton: true,
    })

    // The preload is deferred one tick (setTimeout 0 internally), give it a moment
    const t = setTimeout(() => setPreloadReady(true), 80)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={screen('#2e1065')}>
      <Label color="#c084fc">FADE</Label>

      <CodeBlock lines={[
        { key: 'effect',       value: "'fade'",  highlight: true },
        { key: 'showBackButton', value: 'true' },
      ]} />

      <p style={{ fontSize: 14, color: '#d8b4fe', lineHeight: 1.6, marginBottom: 28 }}>
        Crossfades in and out. Useful for modal overlays or content transitions.
      </p>

      {/* Preload demo */}
      <Section title="Preload demo">
        <p style={{ fontSize: 13, color: '#a78bfa', marginBottom: 12, lineHeight: 1.5 }}>
          <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4 }}>
            preloadScreen()
          </code>
          {' '}was called when this screen mounted. The next screen is
          already in the DOM — activation is instant.
        </p>

        <div style={{
          background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '10px 14px',
          marginBottom: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>{preloadReady ? '✅' : '⏳'}</span>
          <span style={{ color: preloadReady ? '#86efac' : '#94a3b8' }}>
            {preloadReady ? 'PreloadedScreen is ready' : 'Preloading…'}
          </span>
        </div>

        <Btn
          label={preloadReady ? 'Open Preloaded Screen →' : 'Waiting for preload…'}
          color="#a855f7"
          onClick={() => {
            if (handleRef.current) nextScreen(handleRef.current)
          }}
        />
      </Section>

      <div style={{ flex: 1 }} />
      <Btn label="← Back" color="#a855f7" outline onClick={backScreen} />
    </div>
  )
}

function screen(bg: string): React.CSSProperties {
  return {
    height: '100%',
    background: bg,
    padding: '52px 24px 32px',
    display: 'flex',
    flexDirection: 'column',
    color: '#faf5ff',
    overflow: 'auto',
  }
}
