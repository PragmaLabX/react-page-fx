import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScreenStack } from '../src/utils/useScreenStack'
import { resetIdCounter } from '../src/utils/generateId'

const DURATIONS = { none: 0, fade: 300, slide: 300, blur: 150 }

const FakeComponent = () => null

beforeEach(() => {
  resetIdCounter()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('push — new screen', () => {
  it('adds an entry with step "entering"', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))
    const [, actions] = result.current

    act(() => { actions.push({ Component: FakeComponent, pageName: 'home' }, null) })

    const [entries] = result.current
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ pageName: 'home', step: 'entering', effect: 'none' })
  })

  it('sets activeChildEffect on parent when parentEffect is provided', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))
    const [, actions] = result.current

    act(() => {
      actions.push({ Component: FakeComponent, pageName: 'home' }, null)
    })
    const parentId = result.current[0][0].id

    act(() => {
      actions.push(
        { Component: FakeComponent, pageName: 'about', effect: 'slide', parentEffect: 'slide' },
        parentId,
      )
    })

    const [entries] = result.current
    const parent = entries.find(e => e.id === parentId)
    expect(parent?.activeChildEffect).toBe('slide')
  })

  it('does not set activeChildEffect when parentEffect is "none"', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))
    act(() => { actions.push({ Component: FakeComponent, pageName: 'home' }, null) })
    const [, actions] = result.current
    const parentId = result.current[0][0].id

    act(() => {
      actions.push(
        { Component: FakeComponent, pageName: 'about', effect: 'slide' },
        parentId,
      )
    })

    const parent = result.current[0].find(e => e.id === parentId)
    expect(parent?.activeChildEffect).toBeNull()
  })
})

describe('advanceStep', () => {
  it('updates the step of the target entry', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))
    act(() => { result.current[1].push({ Component: FakeComponent }, null) })
    const id = result.current[0][0].id

    act(() => { result.current[1].advanceStep(id, 'active') })

    expect(result.current[0][0].step).toBe('active')
  })
})

describe('pop', () => {
  it('sets step to "exiting" and removes the entry after the effect duration', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))

    act(() => { result.current[1].push({ Component: FakeComponent, pageName: 'home' }, null) })
    const id = result.current[0][0].id
    act(() => { result.current[1].advanceStep(id, 'active') })

    act(() => { result.current[1].push({ Component: FakeComponent, effect: 'slide' }, id) })
    const childId = result.current[0][1].id

    act(() => { result.current[1].pop(childId) })
    expect(result.current[0].find(e => e.id === childId)?.step).toBe('exiting')

    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current[0].find(e => e.id === childId)).toBeUndefined()
  })

  it('clears activeChildEffect on the parent', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))

    act(() => { result.current[1].push({ Component: FakeComponent, pageName: 'home' }, null) })
    const parentId = result.current[0][0].id

    act(() => {
      result.current[1].push(
        { Component: FakeComponent, effect: 'slide', parentEffect: 'slide' },
        parentId,
      )
    })
    const childId = result.current[0][1].id

    act(() => { result.current[1].pop(childId) })

    const parent = result.current[0].find(e => e.id === parentId)
    expect(parent?.activeChildEffect).toBeNull()
  })

  it('calls onBack when popping', () => {
    const onBack = vi.fn()
    const { result } = renderHook(() => useScreenStack(DURATIONS))

    act(() => {
      result.current[1].push({ Component: FakeComponent, pageName: 'home' }, null)
    })
    const parentId = result.current[0][0].id

    act(() => {
      result.current[1].push({ Component: FakeComponent, onBack }, parentId)
    })
    const childId = result.current[0][1].id

    act(() => { result.current[1].pop(childId) })

    expect(onBack).toHaveBeenCalledOnce()
  })

  it('is a no-op for unknown id', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))
    act(() => { result.current[1].push({ Component: FakeComponent }, null) })

    expect(() => {
      act(() => { result.current[1].pop('nonexistent') })
    }).not.toThrow()

    expect(result.current[0]).toHaveLength(1)
  })
})

describe('preload', () => {
  it('adds an entry with step "offscreen" after a tick', async () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))
    act(() => { result.current[1].preload({ Component: FakeComponent, pageName: 'lazy' }, null) })

    // Not yet — deferred with setTimeout(fn, 0)
    expect(result.current[0]).toHaveLength(0)

    act(() => { vi.runAllTimers() })
    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0]).toMatchObject({ pageName: 'lazy', step: 'offscreen' })
  })

  it('updateProps merges into existing props', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))
    const handle = result.current[1].preload(
      { Component: FakeComponent, props: { a: 1 } },
      null,
    )
    act(() => { vi.runAllTimers() })

    act(() => { handle.updateProps({ b: 2 }) })

    expect(result.current[0][0].props).toEqual({ a: 1, b: 2 })
  })
})

describe('deleteByNames', () => {
  it('removes all entries matching the given pageNames', () => {
    const { result } = renderHook(() => useScreenStack(DURATIONS))

    act(() => {
      result.current[1].push({ Component: FakeComponent, pageName: 'keep' }, null)
      result.current[1].push({ Component: FakeComponent, pageName: 'remove' }, null)
    })

    act(() => { result.current[1].deleteByNames(['remove']) })

    const names = result.current[0].map(e => e.pageName)
    expect(names).toEqual(['keep'])
  })
})
