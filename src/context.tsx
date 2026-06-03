import { createContext, useContext } from 'react'
import type { PageNavigator } from './types'

export const PageContext = createContext<PageNavigator | null>(null)

export function usePageNavigator(): PageNavigator {
  const ctx = useContext(PageContext)
  if (!ctx) {
    throw new Error('usePageNavigator must be called inside a <PageFX /> tree')
  }
  return ctx
}
