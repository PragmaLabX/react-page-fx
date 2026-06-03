import { useCallback, useRef, useState } from 'react'
import type {
  DurationOptions,
  EffectName,
  NavigateOptions,
  PreloadHandle,
  ScreenEntry,
  TransitionStep,
} from '../types'
import { generateId } from './generateId'

export function isPreloadHandle(value: NavigateOptions | PreloadHandle): value is PreloadHandle {
  return 'id' in value && !('Component' in value)
}

function makeEntry(
  options: NavigateOptions,
  parentId: string | null,
  step: TransitionStep,
): ScreenEntry {
  return {
    id: generateId(options.pageName),
    pageName: options.pageName ?? '',
    Component: options.Component,
    props: options.props ?? {},
    effect: options.effect ?? 'none',
    step,
    parentId,
    parentEffect: options.parentEffect ?? 'none',
    activeChildEffect: null,
    showBackButton: options.showBackButton ?? false,
    onBack: options.onBack ?? (() => {}),
    className: options.className ?? '',
  }
}

export interface ScreenStackActions {
  /** Navigate to a new screen or activate a preloaded one */
  push(options: NavigateOptions | PreloadHandle, parentId: string | null): void
  /** Start the exit animation and remove the screen after it completes */
  pop(id: string): void
  /** Mount a screen off-screen for instant future activation */
  preload(options: NavigateOptions, parentId: string | null): PreloadHandle
  /** Remove screens by pageName */
  deleteByNames(pageNames: string[]): void
  /** Called by ScreenLayer after the first paint to kick off the enter transition */
  advanceStep(id: string, step: TransitionStep): void
}

export function useScreenStack(durations: DurationOptions): [ScreenEntry[], ScreenStackActions] {
  const [entries, setEntries] = useState<ScreenEntry[]>([])

  // Refs keep callbacks stable — no stale-closure bugs when reading inside setTimeout
  const entriesRef = useRef(entries)
  entriesRef.current = entries

  const durationsRef = useRef(durations)
  durationsRef.current = durations

  const advanceStep = useCallback((id: string, step: TransitionStep) => {
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, step } : e)))
  }, [])

  const setParentChildEffect = useCallback(
    (parentId: string | null, effect: EffectName | null) => {
      if (!parentId) return
      setEntries(prev =>
        prev.map(e => (e.id === parentId ? { ...e, activeChildEffect: effect } : e)),
      )
    },
    [],
  )

  const push = useCallback(
    (options: NavigateOptions | PreloadHandle, parentId: string | null) => {
      if (isPreloadHandle(options)) {
        // Activate a previously preloaded screen
        const entry = entriesRef.current.find(e => e.id === options.id)
        if (!entry) return

        setEntries(prev => prev.map(e => (e.id === options.id ? { ...e, step: 'entering' } : e)))

        if (entry.parentEffect !== 'none') {
          setParentChildEffect(parentId, entry.parentEffect)
        }
      } else {
        const entry = makeEntry(options, parentId, 'entering')

        setEntries(prev => [...prev, entry])

        if (entry.parentEffect !== 'none') {
          setParentChildEffect(parentId, entry.parentEffect)
        }
      }
      // ScreenLayer's useLayoutEffect advances 'entering' → 'active' after the first paint
    },
    [setParentChildEffect],
  )

  const pop = useCallback((id: string) => {
    const entry = entriesRef.current.find(e => e.id === id)
    if (!entry) return

    // Invoke the callback registered by the opener (runs before animation starts)
    entry.onBack()

    // Simultaneously: start exit animation + restore the parent
    setEntries(prev =>
      prev.map(e => {
        if (e.id === id) return { ...e, step: 'exiting' as TransitionStep }
        if (e.id === entry.parentId) return { ...e, activeChildEffect: null }
        return e
      }),
    )

    setTimeout(() => {
      setEntries(prev => prev.filter(e => e.id !== id))
    }, durationsRef.current[entry.effect])
  }, [])

  const preload = useCallback((options: NavigateOptions, parentId: string | null): PreloadHandle => {
    const entry = makeEntry(options, parentId, 'offscreen')
    const { id } = entry

    // Defer to avoid updating state during the caller's render cycle
    setTimeout(() => {
      setEntries(prev => [...prev, entry])
    }, 0)

    return {
      id,
      updateProps: props => {
        setEntries(prev =>
          prev.map(e => (e.id === id ? { ...e, props: { ...e.props, ...props } } : e)),
        )
      },
    }
  }, [])

  const deleteByNames = useCallback((pageNames: string[]) => {
    const names = new Set(pageNames)
    setEntries(prev => prev.filter(e => !names.has(e.pageName)))
  }, [])

  return [entries, { push, pop, preload, deleteByNames, advanceStep }]
}
