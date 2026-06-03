import React, { useEffect, useMemo, useRef } from 'react'
import { ScreenLayer } from './ScreenLayer'
import type { DurationOptions, ScreenFXProps } from './types'
import { buildCSS } from './utils/css'
import { useScreenStack } from './utils/useScreenStack'

const DEFAULT_DURATIONS: DurationOptions = {
  none: 0,
  fade: 300,
  slide: 300,
  blur: 150,
}

const DEFAULT_BASE_CLASS = 'sfx-screen'

export const ScreenFX: React.FC<ScreenFXProps> = ({
  initScreen,
  durations: durationOverrides,
  BackButton,
  baseClass = DEFAULT_BASE_CLASS,
}) => {
  const durations: DurationOptions = useMemo(
    () => ({ ...DEFAULT_DURATIONS, ...durationOverrides }),
    // Spread the individual values so the memo only re-runs when a value actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      durationOverrides?.fade,
      durationOverrides?.slide,
      durationOverrides?.blur,
    ],
  )

  const css = useMemo(() => buildCSS(baseClass, durations), [baseClass, durations])

  const [entries, actions] = useScreenStack(durations)
  const initialized = useRef(false)

  // Push the initial screen once. Using a ref guard instead of an empty-deps effect
  // because StrictMode double-invokes effects — the ref prevents a duplicate entry.
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    actions.push(
      {
        Component: initScreen.Component,
        pageName: initScreen.pageName,
        props: initScreen.props,
        effect: 'none',
        showBackButton: false,
      },
      null,
    )
    // Intentionally omitting deps: this must run exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Inline <style> works in React 18+ and is hoisted to <head> in React 19 */}
      <style>{css}</style>
      {entries.map((entry, index) => (
        <ScreenLayer
          key={entry.id}
          entry={entry}
          level={index}
          baseClass={baseClass}
          actions={actions}
          BackButtonOverride={BackButton}
        />
      ))}
    </>
  )
}
