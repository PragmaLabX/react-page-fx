import type { ComponentType } from 'react'

export type EffectName = 'none' | 'fade' | 'slide' | 'blur'

export type TransitionStep = 'offscreen' | 'entering' | 'active' | 'exiting'

export interface DurationOptions {
  none: number
  fade: number
  slide: number
  blur: number
}

export interface ScreenEntry {
  id: string
  pageName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<any>
  props: Record<string, unknown>
  effect: EffectName
  step: TransitionStep
  parentId: string | null
  /** Effect to apply to the parent screen while this screen is active above it */
  parentEffect: EffectName
  /** Derived from the active child — drives the parent's visual modifier */
  activeChildEffect: EffectName | null
  showBackButton: boolean
  onBack: () => void
  className: string
}

export interface NavigateOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<any>
  pageName?: string
  effect?: EffectName
  props?: Record<string, unknown>
  showBackButton?: boolean
  onBack?: () => void
  className?: string
  /** Which effect the parent screen should display while this screen is open */
  parentEffect?: EffectName
}

export interface PreloadHandle {
  id: string
  updateProps(props: Record<string, unknown>): void
}

export interface ScreenNavigator {
  nextScreen(options: NavigateOptions | PreloadHandle): void
  backScreen(): void
  preloadScreen(options: NavigateOptions): PreloadHandle
  deleteScreens(pageNames: string[]): void
}

export interface ScreenFXProps {
  initScreen: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Component: ComponentType<any>
    pageName?: string
    props?: Record<string, unknown>
  }
  durations?: Partial<Omit<DurationOptions, 'none'>>
  BackButton?: ComponentType<{ onClick: () => void }>
  baseClass?: string
}
