import { createContext, useContext } from 'react'
import type { ScreenNavigator } from './types'

export const ScreenContext = createContext<ScreenNavigator | null>(null)

export function useScreenNavigator(): ScreenNavigator {
  const ctx = useContext(ScreenContext)
  if (!ctx) {
    throw new Error('useScreenNavigator must be called inside a <ScreenFX /> tree')
  }
  return ctx
}
