import { useScreenNavigator } from 'react-page-fx'
import { Btn, CodeBlock, Label, Section } from './SlideScreen'

/**
 * Demonstrates: effect: 'slide' + parentEffect: 'blur'
 *
 * This screen uses a semi-transparent background so you can see
 * the blurred home screen behind it — the intended use case for parentEffect: 'blur'.
 */
export default function BlurScreen() {
  const { backScreen } = useScreenNavigator()

  return (
    <div style={screen}>
      <Label color="#fbbf24">BLUR PARENT</Label>

      <CodeBlock lines={[
        { key: 'effect',       value: "'slide'" },
        { key: 'parentEffect', value: "'blur'",  highlight: true },
        { key: 'showBackButton', value: 'true' },
      ]} />

      <p style={{ fontSize: 14, color: '#fde68a', lineHeight: 1.6, marginBottom: 28 }}>
        The home screen is blurred and scaled up behind this overlay.
        This screen has a semi-transparent background so you can see it.
      </p>

      <Section title="When to use">
        <p style={{ fontSize: 13, color: '#fcd34d', lineHeight: 1.6 }}>
          Use <code style={code}>parentEffect: &apos;blur&apos;</code> for bottom sheets,
          action sheets, and modal overlays where the context screen should
          visually recede without fully disappearing.
        </p>
      </Section>

      <div style={{ flex: 1 }} />
      <Btn label="← Back to Home" color="#f59e0b" outline onClick={backScreen} />
    </div>
  )
}

const screen: React.CSSProperties = {
  height: '100%',
  // Semi-transparent so the blurred parent shows through
  background: 'rgba(10, 6, 28, 0.82)',
  backdropFilter: 'saturate(1.2)',
  padding: '52px 24px 32px',
  display: 'flex',
  flexDirection: 'column',
  color: '#fffbeb',
  overflow: 'auto',
}

const code: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  padding: '1px 5px',
  borderRadius: 4,
  fontFamily: 'monospace',
  fontSize: 12,
}
