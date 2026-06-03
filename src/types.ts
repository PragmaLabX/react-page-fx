import type { ComponentType } from 'react'

export type EffectName = 'none' | 'fade' | 'slide' | 'blur'

export type TransitionStep = 'offscreen' | 'entering' | 'active' | 'exiting'

export interface DurationOptions {
  none: number
  fade: number
  slide: number
  blur: number
}

export interface PageEntry {
  id: string
  pageName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<any>
  props: Record<string, unknown>
  effect: EffectName
  step: TransitionStep
  parentId: string | null
  /** Effect to apply to the parent page while this page is active above it */
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
  /** Which effect the parent page should display while this page is open */
  parentEffect?: EffectName
}

export interface PreloadHandle {
  id: string
  updateProps(props: Record<string, unknown>): void
}

export interface PageNavigator {
  nextPage(options: NavigateOptions | PreloadHandle): void
  backPage(): void
  preloadPage(options: NavigateOptions): PreloadHandle
  deletePages(pageNames: string[]): void
}

export interface PageFXConfig {
  durations?: Partial<Omit<DurationOptions, 'none'>>
  baseClass?: string
  BackButton?: ComponentType<{ onClick: () => void }>
}

export interface PageFXProps {
  initPage: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Component: ComponentType<any>
    pageName?: string
    props?: Record<string, unknown>
  }
  config?: PageFXConfig
}
