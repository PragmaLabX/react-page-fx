import { useScreenNavigator } from 'react-page-fx'
import { Btn, CodeBlock, Label, Section } from './SlideScreen'

/**
 * This screen was preloaded by FadeScreen before the user tapped "open".
 * It activated instantly because it was already mounted in the DOM.
 */
export default function PreloadedScreen() {
  const { backScreen } = useScreenNavigator()

  return (
    <div style={screen}>
      <Label color="#fb923c">PRELOADED</Label>

      <CodeBlock lines={[
        { key: 'step (on mount)', value: "'offscreen'" },
        { key: 'step (on open)',  value: "'entering' → 'active'", highlight: true },
      ]} />

      <p style={{ fontSize: 14, color: '#fed7aa', lineHeight: 1.6, marginBottom: 28 }}>
        This screen was mounted off-screen by <code style={code}>preloadScreen()</code>{' '}
        the moment FadeScreen appeared. No render lag when you opened it.
      </p>

      <Section title="How it works">
        <p style={{ fontSize: 13, color: '#fdba74', lineHeight: 1.6 }}>
          <code style={code}>const handle = preloadScreen({'{ Component, ... }'})</code>
          <br /><br />
          The screen sits at <code style={code}>step: &apos;offscreen&apos;</code> — in the DOM
          but invisible. Calling <code style={code}>nextScreen(handle)</code> transitions it
          to <code style={code}>active</code> immediately.
          <br /><br />
          Use <code style={code}>handle.updateProps()</code> to update its props before opening.
        </p>
      </Section>

      <div style={{ flex: 1 }} />
      <Btn label="← Back" color="#f97316" outline onClick={backScreen} />
    </div>
  )
}

const screen: React.CSSProperties = {
  height: '100%',
  background: '#431407',
  padding: '52px 24px 32px',
  display: 'flex',
  flexDirection: 'column',
  color: '#fff7ed',
  overflow: 'auto',
}

const code: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  padding: '1px 5px',
  borderRadius: 4,
  fontFamily: 'monospace',
  fontSize: 12,
}
