import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React, { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PageFX } from '../src/ScreenFX'
import { usePageNavigator } from '../src/context'
import { resetIdCounter } from '../src/utils/generateId'

beforeEach(() => { resetIdCounter(); vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

// ── Fixtures ──────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const { nextPage } = usePageNavigator()
  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => nextPage({ Component: AboutPage, pageName: 'about', effect: 'slide', showBackButton: true })}>
        Go to About
      </button>
    </div>
  )
}

const AboutPage: React.FC = () => {
  const { backPage } = usePageNavigator()
  return (
    <div>
      <h1>About</h1>
      <button onClick={backPage}>Back</button>
    </div>
  )
}

const PropsPage: React.FC<{ label: string }> = ({ label }) => <div>{label}</div>

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PageFX', () => {
  it('renders the initial page', async () => {
    render(<PageFX initPage={{ Component: HomePage }} />)
    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument())
  })

  it('passes props to the initial page', async () => {
    render(
      <PageFX
        initPage={{ Component: PropsPage, props: { label: 'hello-world' } }}
      />,
    )
    await waitFor(() => expect(screen.getByText('hello-world')).toBeInTheDocument())
  })

  it('navigates to the next page on nextPage call', async () => {
    render(<PageFX initPage={{ Component: HomePage }} />)
    await waitFor(() => screen.getByText('Go to About'))

    act(() => { fireEvent.click(screen.getByText('Go to About')) })

    await waitFor(() => expect(screen.getByText('About')).toBeInTheDocument())
  })

  it('goes back on backPage call and removes the page after the transition', async () => {
    render(<PageFX initPage={{ Component: HomePage }} />)
    await waitFor(() => screen.getByText('Go to About'))

    act(() => { fireEvent.click(screen.getByText('Go to About')) })
    await waitFor(() => screen.getByText('Back'))

    act(() => { fireEvent.click(screen.getByText('Back')) })

    // Page is in 'exiting' state — still in DOM during transition
    expect(screen.getByText('About')).toBeInTheDocument()

    // After slide duration (300ms) the page is removed
    act(() => { vi.advanceTimersByTime(300) })
    await waitFor(() => expect(screen.queryByText('About')).not.toBeInTheDocument())
  })

  it('calls onBack when navigating back', async () => {
    const onBack = vi.fn()

    const Opener: React.FC = () => {
      const { nextPage } = usePageNavigator()
      return (
        <button
          onClick={() =>
            nextPage({ Component: AboutPage, effect: 'slide', showBackButton: true, onBack })
          }
        >
          Open
        </button>
      )
    }

    render(<PageFX initPage={{ Component: Opener }} />)
    await waitFor(() => screen.getByText('Open'))

    act(() => { fireEvent.click(screen.getByText('Open')) })
    await waitFor(() => screen.getByText('Back'))

    act(() => { fireEvent.click(screen.getByText('Back')) })
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('renders a back button when showBackButton is true', async () => {
    render(<PageFX initPage={{ Component: HomePage }} />)
    await waitFor(() => screen.getByText('Go to About'))

    act(() => { fireEvent.click(screen.getByText('Go to About')) })

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument(),
    )
  })

  it('accepts a custom back button via config', async () => {
    const CustomBack: React.FC<{ onClick: () => void }> = ({ onClick }) => (
      <button onClick={onClick}>custom-back</button>
    )

    render(<PageFX initPage={{ Component: HomePage }} config={{ BackButton: CustomBack }} />)
    await waitFor(() => screen.getByText('Go to About'))

    act(() => { fireEvent.click(screen.getByText('Go to About')) })

    await waitFor(() => expect(screen.getByText('custom-back')).toBeInTheDocument())
  })

  it('supports props update through PreloadHandle.updateProps', async () => {
    const LazyPage: React.FC<{ value: string }> = ({ value }) => <div>value:{value}</div>

    const PreloadHost: React.FC = () => {
      const { preloadPage, nextPage } = usePageNavigator()
      const [handle] = useState(() =>
        preloadPage({ Component: LazyPage, props: { value: 'initial' } }),
      )

      return (
        <div>
          <h1>Host</h1>
          <button onClick={() => handle.updateProps({ value: 'updated' })}>Update</button>
          <button onClick={() => nextPage(handle)}>Open Lazy</button>
        </div>
      )
    }

    render(<PageFX initPage={{ Component: PreloadHost }} />)
    await waitFor(() => screen.getByText('Host'))

    act(() => { vi.runAllTimers() }) // flush the deferred preload

    act(() => { fireEvent.click(screen.getByText('Update')) })
    act(() => { fireEvent.click(screen.getByText('Open Lazy')) })

    await waitFor(() => expect(screen.getByText('value:updated')).toBeInTheDocument())
  })
})
