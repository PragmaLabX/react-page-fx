import React, { useCallback, useLayoutEffect, useMemo } from 'react'
import { BackButton } from './BackButton'
import { PageContext } from './context'
import type { NavigateOptions, PageEntry, PageNavigator, PreloadHandle } from './types'
import type { PageStackActions } from './utils/useScreenStack'

interface PageLayerProps {
  entry: PageEntry
  level: number
  baseClass: string
  actions: PageStackActions
  BackButtonOverride?: React.ComponentType<{ onClick: () => void }>
}

export const ScreenLayer: React.FC<PageLayerProps> = ({
  entry,
  level,
  baseClass,
  actions,
  BackButtonOverride,
}) => {
  // After the first paint, advance 'entering' → 'active' to start the CSS transition.
  // Double rAF guarantees the browser has painted the initial (pre-transition) state.
  useLayoutEffect(() => {
    if (entry.step !== 'entering') return

    let raf2: ReturnType<typeof requestAnimationFrame>
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => actions.advanceStep(entry.id, 'active'))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [entry.id, entry.step, actions])

  // Each PageLayer exposes a navigator bound to its own id so that
  // nextPage/backPage automatically know who the parent is.
  const navigator: PageNavigator = useMemo(
    () => ({
      nextPage: (options: NavigateOptions | PreloadHandle) =>
        actions.push(options, entry.id),
      backPage: () => actions.pop(entry.id),
      preloadPage: (options: NavigateOptions) => actions.preload(options, entry.id),
      deletePages: (pageNames: string[]) => actions.deleteByNames(pageNames),
    }),
    // entry.id never changes for a given entry, but actions are stable callbacks
    [entry.id, actions],
  )

  const handleBack = useCallback(() => actions.pop(entry.id), [entry.id, actions])

  const { Component, props, effect, step, activeChildEffect, showBackButton, className } = entry

  return (
    <PageContext.Provider value={navigator}>
      <div
        className={`${baseClass}${className ? ` ${className}` : ''}`}
        data-level={level}
        data-effect={effect}
        data-step={step}
        data-page-name={entry.pageName || undefined}
        {...(activeChildEffect && activeChildEffect !== 'none'
          ? { 'data-child-effect': activeChildEffect }
          : {})}
      >
        <Component {...props} />
        {showBackButton && (
          <BackButton baseClass={baseClass} onClick={handleBack} Custom={BackButtonOverride} />
        )}
      </div>
    </PageContext.Provider>
  )
}
