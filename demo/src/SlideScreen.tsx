import { usePageNavigator } from 'react-page-fx'
import FadeScreen from './FadeScreen'

export default function SlideScreen() {
  const { nextPage, backPage } = usePageNavigator()

  return (
    <div style={screen('#052e16')}>
      <Label color="#4ade80">SLIDE</Label>

      <CodeBlock lines={[
        { key: 'effect',       value: "'slide'" },
        { key: 'parentEffect', value: "'slide'",  highlight: true },
        { key: 'showBackButton', value: 'true' },
      ]} />

      <p style={{ fontSize: 14, color: '#86efac', lineHeight: 1.6, marginBottom: 28 }}>
        The home screen shifted left by 20% as this one slid in —
        the standard iOS/Android navigation depth cue.
      </p>

      <Section title="Nested navigation">
        <p style={{ fontSize: 13, color: '#6ee7b7', marginBottom: 12, lineHeight: 1.5 }}>
          You can push another page from here. Going back unwinds the stack.
        </p>
        <Btn
          label="Open FadeScreen (nested) →"
          color="#4ade80"
          onClick={() =>
            nextPage({
              Component: FadeScreen,
              effect: 'fade',
              showBackButton: true,
            })
          }
        />
      </Section>

      <div style={{ flex: 1 }} />
      <Btn label="← Back to Home" color="#4ade80" outline onClick={backPage} />
    </div>
  )
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────

export function Label({ children, color }: { children: string; color: string }) {
  return (
    <div style={{
      fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em',
      color, marginBottom: 16,
    }}>
      {children}
    </div>
  )
}

export function CodeBlock({ lines }: {
  lines: Array<{ key: string; value: string; highlight?: boolean }>
}) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.25)', borderRadius: 8,
      padding: '12px 16px', marginBottom: 20,
      fontFamily: 'monospace', fontSize: 13,
    }}>
      {lines.map(({ key, value, highlight }) => (
        <div key={key} style={{ color: highlight ? '#fff' : 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{key}: </span>
          {value}
        </div>
      ))}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
        {title.toUpperCase()}
      </p>
      {children}
    </div>
  )
}

export function Btn({
  label, color, outline, onClick,
}: {
  label: string; color: string; outline?: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '13px', borderRadius: 10,
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        background: outline ? 'transparent' : color,
        border: `1.5px solid ${color}`,
        color: outline ? color : '#000',
      }}
    >
      {label}
    </button>
  )
}

function screen(bg: string): React.CSSProperties {
  return {
    height: '100%',
    background: bg,
    padding: '52px 24px 32px',
    display: 'flex',
    flexDirection: 'column',
    color: '#f0fdf4',
    overflow: 'auto',
  }
}
