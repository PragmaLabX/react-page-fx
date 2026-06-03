import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React, { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScreenFX } from '../src/ScreenFX'
import { useScreenNavigator } from '../src/context'
import { resetIdCounter } from '../src/utils/generateId'

beforeEach(() => { resetIdCounter(); vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

// ── Fixtures ──────────────────────────────────────────────────────────────────

const HomeScreen: React.FC = () => {
  const { nextScreen } = useScreenNavigator()
  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => nextScreen({ Component: AboutScreen, pageName: 'about', effect: 'slide', showBackButton: true })}>
        Go to About
      </button>
    </div>
  )
}

const AboutScreen: React.FC = () => {
  const { backScreen } = useScreenNavigator()
  return (
    <div>
      <h1>About</h1>
      <button onClick={backScreen}>Back</button>
    </div>
  )
}

const PropsScreen: React.FC<{ label: string }> = ({ label }) => <div>{label}</div>

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ScreenFX', () => {
  it('renders the initial screen', async () => {
    render(<ScreenFX initScreen={{ Component: HomeScreen }} />)
    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument())
  })

  it('passes props to the initial screen', async () => {
    render(
      <ScreenFX
        initScreen={{ Component: PropsScreen, props: { label: 'hello-world' } }}
      />,
    )
    await waitFor(() => expect(screen.getByText('hello-world')).toBeInTheDocument())
  })

  it('navigates to the next screen on nextScreen call', async () => {
    render(<ScreenFX initScreen={{ Component: HomeScreen }} />)
    await waitFor(() => screen.getByText('Go to About'))

    act(() => { fireEvent.click(screen.getByText('Go to About')) })

    await waitFor(() => expect(screen.getByText('About')).toBeInTheDocument())
  })

  it('goes back on backScreen call and removes the screen after the transition', async () => {
    render(<ScreenFX initScreen={{ Component: HomeScreen }} />)
    await waitFor(() => screen.getByText('Go to About'))

    act(() => { fireEvent.click(screen.getByText('Go to About')) })
    await waitFor(() => screen.getByText('Back'))

    act(() => { fireEvent.click(screen.getByText('Back')) })

    // Screen is in 'exiting' state — still in DOM during transition
    expect(screen.getByText('About')).toBeInTheDocument()

    // After slide duration (300ms) the screen is removed
    act(() => { vi.advanceTimersByTime(300) })
    await waitFor(() => expect(screen.queryByText('About')).not.toBeInTheDocument())
  })

  it('calls onBack when navigating back', async () => {
    const onBack = vi.fn()

    const Opener: React.FC = () => {
      const { nextScreen } = useScreenNavigator()
      return (
        <button
          onClick={() =>
            nextScreen({ Component: AboutScreen, effect: 'slide', showBackButton: true, onBack })
          }
        >
          Open
        </button>
      )
    }

    render(<ScreenFX initScreen={{ Component: Opener }} />)
    await waitFor(() => screen.getByText('Open'))

    act(() => { fireEvent.click(screen.getByText('Open')) })
    await waitFor(() => screen.getByText('Back'))

    act(() => { fireEvent.click(screen.getByText('Back')) })
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('renders a back button when showBackButton is true', async () => {
    render(<ScreenFX initScreen={{ Component: HomeScreen }} />)
    await waitFor(() => screen.getByText('Go to About'))

    act(() => { fireEvent.click(screen.getByText('Go to About')) })

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument(),
    )
  })

  it('accepts a custom back button component', async () => {
    const CustomBack: React.FC<{ onClick: () => void }> = ({ onClick }) => (
      <button onClick={onClick}>custom-back</button>
    )

    render(<ScreenFX initScreen={{ Component: HomeScreen }} BackButton={CustomBack} />)
    await waitFor(() => screen.getByText('Go to About'))

    act(() => { fireEvent.click(screen.getByText('Go to About')) })

    await waitFor(() => expect(screen.getByText('custom-back')).toBeInTheDocument())
  })

  it('supports props update through PreloadHandle.updateProps', async () => {
    const LazyScreen: React.FC<{ value: string }> = ({ value }) => <div>value:{value}</div>

    const PreloadHost: React.FC = () => {
      const { preloadScreen, nextScreen } = useScreenNavigator()
      const [handle] = useState(() =>
        preloadScreen({ Component: LazyScreen, props: { value: 'initial' } }),
      )

      return (
        <div>
          <h1>Host</h1>
          <button onClick={() => handle.updateProps({ value: 'updated' })}>Update</button>
          <button onClick={() => nextScreen(handle)}>Open Lazy</button>
        </div>
      )
    }

    render(<ScreenFX initScreen={{ Component: PreloadHost }} />)
    await waitFor(() => screen.getByText('Host'))

    act(() => { vi.runAllTimers() }) // flush the deferred preload

    act(() => { fireEvent.click(screen.getByText('Update')) })
    act(() => { fireEvent.click(screen.getByText('Open Lazy')) })

    await waitFor(() => expect(screen.getByText('value:updated')).toBeInTheDocument())
  })
})
