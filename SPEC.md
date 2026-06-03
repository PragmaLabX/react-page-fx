# react-page-fx — System Specification

> Reusable specification. Paste into a new chat to rebuild the project without access to the source code.

---

## 1. Project Overview

`react-page-fx` is a React npm library that gives any React application a **mobile-style screen stack navigation** with animated transitions.

The user wraps their root component once in `<ScreenFX>`. That component becomes screen zero. From that point, any screen in the tree can navigate to another screen using a hook — pushing it on top of the current one, with a visual transition effect (slide, fade, blur). Screens form a stack; going back pops the top one off with the reverse animation.

The primary target environment is **mobile WebViews** (React apps embedded in iOS/Android), though it works in any React environment.

The library is published as an npm package with dual ESM + CJS output and full TypeScript types. It has **zero runtime dependencies** — only `react` and `react-dom` as peer dependencies.

---

## 2. Core Features

1. **Screen stack navigation** — screens are pushed on top of each other and popped in LIFO order
2. **Transition effects** — `slide` (from right), `fade` (opacity), `blur` (parent gets blurred), `none` (instant)
3. **Back navigation** — any screen can go back; triggers reverse animation + optional callback
4. **`onBack` callback** — the screen that *opens* a child can register a function that fires when the child is closed
5. **Back button** — built-in back button rendered on screens that opt in; fully replaceable with a custom component
6. **Screen preloading** — a screen can be mounted off-screen ahead of time so that activating it later is instantaneous; props can be updated before activation
7. **Parent effect modifiers** — when a child opens, its opener can be made to visually shift (`slide -20%`) or blur, creating a depth illusion
8. **Delete by name** — remove one or more screens from the stack by their `pageName` identifier
9. **Context-based API** — any component anywhere in the screen tree accesses the navigator via a hook, no prop-drilling
10. **Custom CSS class prefix** — all CSS classes are namespaced under a user-supplied base class

---

## 3. Architecture

The system has five logical layers:

```
┌─────────────────────────────────────────────┐
│  ScreenFX                                   │  Root component. Owns the screen stack state,
│  (root component)                           │  injects global CSS, renders one ScreenLayer
│                                             │  per active screen entry.
└──────────────────┬──────────────────────────┘
                   │ renders N of
┌──────────────────▼──────────────────────────┐
│  ScreenLayer                                │  Wrapper for one screen. Manages its own
│  (per-screen component)                     │  transition step via useLayoutEffect + rAF.
│                                             │  Provides a bound ScreenNavigator to
│                                             │  its subtree via React Context.
└───────┬──────────────────────┬──────────────┘
        │ renders               │ provides via Context
┌───────▼───────┐    ┌──────────▼──────────────┐
│ User Component│    │  useScreenNavigator()   │
│ (any React    │    │  (hook used anywhere    │
│  component)   │    │  inside the screen)     │
└───────────────┘    └─────────────────────────┘

Internal modules:
┌────────────────────┐   ┌─────────────────────┐
│  useScreenStack    │   │  buildCSS           │
│  (state machine)   │   │  (CSS string from   │
│                    │   │   durations +        │
│  push / pop /      │   │   base class name)   │
│  preload /         │   └─────────────────────┘
│  deleteByNames /   │
│  advanceStep       │   ┌─────────────────────┐
└────────────────────┘   │  generateId         │
                         │  (monotonic counter  │
                         │   + prefix)          │
                         └─────────────────────┘
```

**Data flow direction:**

```
User interaction
  → useScreenNavigator().nextScreen / backScreen / ...
  → ScreenStackActions (push / pop / preload / ...)
  → setEntries (React state)
  → ScreenFX re-renders
  → ScreenLayer receives updated entry
  → DOM data-attributes change
  → CSS transitions fire
```

---

## 4. Data Models

### `ScreenEntry` (internal runtime record)

| Field              | Type                | Description |
|--------------------|---------------------|-------------|
| `id`               | string              | Unique ID, never changes once created |
| `pageName`         | string              | Optional user label; used by `deleteScreens` |
| `Component`        | React.ComponentType | The component to render |
| `props`            | Record              | Props passed to Component; mutable via `updateProps` |
| `effect`           | EffectName          | How this screen enters and exits |
| `step`             | TransitionStep      | Current position in the state machine |
| `parentId`         | string \| null      | ID of the screen that opened this one |
| `parentEffect`     | EffectName          | Effect to apply to the parent while this screen is open |
| `activeChildEffect`| EffectName \| null  | Set when a child is active; drives the CSS modifier on this screen |
| `showBackButton`   | boolean             | Whether to render the back button overlay |
| `onBack`           | () => void          | Called the moment `pop` is initiated (before animation) |
| `className`        | string              | Extra CSS class on the screen's root div |

### `EffectName`
Enumeration: `'none' | 'slide' | 'fade' | 'blur'`

### `TransitionStep`
State machine states: `'offscreen' | 'entering' | 'active' | 'exiting'`

### `DurationOptions`
```
{
  none:  number   // ms, always 0
  fade:  number   // ms
  slide: number   // ms
  blur:  number   // ms
}
```
Defaults: `none=0, fade=300, slide=300, blur=150`

### `PreloadHandle` (returned to caller)
```
{
  id: string                                   // the preloaded entry's ID
  updateProps(props: Record<string, unknown>): void
}
```

---

## 5. Public API / Interfaces

### `<ScreenFX>` props

| Prop          | Type                                       | Required | Default        |
|---------------|--------------------------------------------|----------|----------------|
| `initScreen`  | `{ Component, pageName?, props? }`         | yes      | —              |
| `durations`   | `Partial<{ fade, slide, blur }>` (ms)      | no       | 300 / 300 / 150 |
| `BackButton`  | `ComponentType<{ onClick: () => void }>`   | no       | built-in       |
| `baseClass`   | string                                     | no       | `'sfx-screen'` |

### `useScreenNavigator()` — returns `ScreenNavigator`

Must be called inside a `<ScreenFX>` subtree; throws otherwise.

#### `nextScreen(options | PreloadHandle)`

Opens a new screen. When given a `PreloadHandle`, activates the preloaded entry instead of creating a new one.

Options:
```
{
  Component      — required
  pageName?      — for deleteScreens targeting
  effect?        — default 'none'
  props?         — passed to Component
  showBackButton? — default false
  onBack?        — fired when this screen is popped
  className?     — added to screen's root div
  parentEffect?  — 'slide' shifts opener left; 'blur' blurs opener
}
```

#### `backScreen()`

Starts the exit animation of the calling screen, calls `onBack`, clears `activeChildEffect` on the parent, then removes the entry from the stack after the effect duration.

#### `preloadScreen(options)` → `PreloadHandle`

Mounts the screen off-screen (`step: 'offscreen'`) in the next tick. Returns a handle. Use `handle.updateProps()` to update props before activation. Activate with `nextScreen(handle)`.

#### `deleteScreens(pageNames: string[])`

Immediately removes all stack entries whose `pageName` is in the list. No animation.

---

## 6. Business Logic Rules

### Transition state machine

```
(not in stack)
    ↓  push() / preload()
offscreen          — rendered but invisible; pointer-events none (preloaded only)
    ↓  push() with handle
entering           — CSS start position (e.g. translateX(100%) for slide)
    ↓  useLayoutEffect + double rAF fires
active             — CSS final position; normal interaction
    ↓  pop()
exiting            — CSS returns to start position
    ↓  setTimeout(duration)
(removed from stack)
```

### Transition timing guarantee
The `entering → active` step MUST happen after the browser has painted the `entering` state at least once. This is achieved with `useLayoutEffect` + two nested `requestAnimationFrame` calls. A single rAF is insufficient because the browser may batch the state changes before painting.

### Parent effect lifecycle
- When a child is pushed: if `parentEffect !== 'none'`, the parent entry gains `activeChildEffect = parentEffect`.
- When a child is popped: the parent's `activeChildEffect` is reset to `null` **at the same time** the child's step changes to `exiting`. This causes both animations (child exits + parent restores) to run simultaneously.
- Preloaded screens do NOT apply `activeChildEffect` until they are activated.

### `onBack` is always called exactly once
`onBack` is called inside `pop()` before any state change. It fires regardless of whether the user tapped the back button, called `backScreen()` programmatically, or the back button overlay was clicked.

### Initial screen
The initial screen is pushed in a `useEffect` guarded by a `useRef` boolean. This prevents React StrictMode's double-invocation from creating a duplicate initial entry. The initial screen always uses `effect: 'none'` and `showBackButton: false`.

### Preload deferral
`preload()` schedules the state update with `setTimeout(fn, 0)` to avoid calling `setState` during a parent's render cycle.

### Stale closure prevention
The screen stack hook maintains a `entriesRef` and a `durationsRef` — refs that are kept in sync with state on every render. `pop()` reads these refs synchronously inside `setTimeout` callbacks to guarantee it sees the current values, not a captured closure snapshot.

---

## 7. Folder Structure

```
src/
├── index.ts               Public exports (ScreenFX, useScreenNavigator, types)
├── types.ts               All TypeScript types and interfaces
├── context.tsx            React Context definition + useScreenNavigator hook
├── ScreenFX.tsx           Root component: owns state, renders CSS + ScreenLayers
├── ScreenLayer.tsx        Per-screen wrapper: transition logic, Context provider
├── BackButton.tsx         Default and custom back button wrapper
└── utils/
    ├── generateId.ts      Monotonic ID generator (counter + prefix)
    ├── css.ts             buildCSS(baseClass, durations) → CSS string
    └── useScreenStack.ts  Core state machine hook (push/pop/preload/...)

tests/
├── setup.ts               Vitest + @testing-library/jest-dom bootstrap
├── useScreenStack.test.ts Unit tests for the state machine
└── ScreenFX.test.tsx      Integration tests (render + navigate + animate)
```

---

## 8. Tech Stack

| Concern        | Tool                     | Notes |
|----------------|--------------------------|-------|
| Language       | TypeScript 5+            | `strict: true`, `exactOptionalPropertyTypes` |
| UI runtime     | React 18+ (peer dep)     | Uses `useLayoutEffect`, Context, `useRef` |
| Build          | tsup                     | Outputs ESM (`.js`) + CJS (`.cjs`), `.d.ts` + `.d.cts` |
| Tests          | Vitest + jsdom           | `@testing-library/react` for component tests |
| Lint           | ESLint 9 (flat config)   | `typescript-eslint` strict + stylistic ruleset |
| Format         | Prettier                 | single-quote, no semi, trailing commas |
| CSS            | Pure generated CSS string | Injected as inline `<style>` tag inside the component |
| Package fields | `exports` map            | Proper `import`/`require` + `types` per condition |

---

## 9. Key Design Decisions

**Context over prop injection**
The original pattern was to pass a `pageFx` object as a prop to every screen component. The chosen design uses React Context instead. A screen component imports `useScreenNavigator()` and gets navigation functions without any prop-drilling. The context value is created per `ScreenLayer` so `backScreen()` is automatically bound to the correct screen ID.

**Array stack instead of Record**
Storing screens as `ScreenEntry[]` rather than `Record<screenId, ScreenOptions>` makes ordering explicit and deterministic. Array index doubles as the z-index level.

**State machine with explicit steps**
Four named states (`offscreen`, `entering`, `active`, `exiting`) make the component's lifecycle transparent. CSS transitions are driven purely by data-attributes on DOM elements, not by inline styles or class toggling.

**CSS via generated string**
All styling is computed once (memoized) from `durations` + `baseClass` and injected as a `<style>` tag. This avoids any CSS-in-JS dependency, works with server rendering in React 19 (style hoisting), and scopes all rules under the configurable base class.

**Transition timing in the view layer**
The `entering → active` step is managed by `ScreenLayer` via `useLayoutEffect`, not by the state management hook. This ties the animation trigger to the actual DOM update rather than to an arbitrary timeout.

**`onBack` fires in `pop`, not in the UI handler**
Whether the user taps the back button, calls `backScreen()` directly, or the `BackButton` overlay is clicked — all routes go through `pop()`, which is the single place where `onBack` is invoked. This prevents double-calls and missed calls.

**Parent effect is stored on the parent entry**
When a child screen opens with `parentEffect: 'slide'`, the parent's `ScreenEntry.activeChildEffect` is set. This means the parent's visual state is part of its own data, driven by child operations. When the child exits, the parent's field is cleared simultaneously, so both CSS transitions run in parallel.

---

## 10. How to Rebuild From Scratch

### Phase 1 — Package scaffolding

Set up an npm package with:
- `package.json`: dual exports map (`import`/`require`), `peerDependencies` for react + react-dom, `type: "module"`
- `tsconfig.json`: `strict`, `exactOptionalPropertyTypes`, `jsx: react-jsx`, `lib: [ES2020, DOM]`
- `tsup.config.ts`: entry `src/index.ts`, formats `['esm', 'cjs']`, `dts: true`, `external: ['react', 'react-dom']`
- `vitest.config.ts`: `environment: 'jsdom'`, `setupFiles` pointing to `@testing-library/jest-dom`
- ESLint 9 flat config with `typescript-eslint` strict preset
- `.prettierrc`

### Phase 2 — Types (`src/types.ts`)

Define all types first:
- `EffectName` union
- `TransitionStep` union
- `ScreenEntry` interface (all fields described in Data Models)
- `NavigateOptions` interface (public input type for nextScreen)
- `PreloadHandle` interface
- `ScreenNavigator` interface (the 4 navigation methods)
- `DurationOptions` interface
- `ScreenFXProps` interface

### Phase 3 — Utilities

**`generateId(prefix)`** — monotonically incrementing counter. Export a `resetIdCounter()` for tests.

**`buildCSS(baseClass, durations)`** — returns a CSS string. Cover:
- Base `.screen` rule with transitions for transform, opacity, filter
- `[data-step="offscreen"]` — hidden, off-screen, no pointer events
- Per-effect rules for `entering`, `active`, `exiting` steps
- `[data-child-effect="slide"]` — shifts parent left
- `[data-child-effect="blur"]` — blurs parent
- Z-index layering for levels 0–19 using `[data-level="N"]`
- Back button default styles using `${baseClass}__back-btn` and `${baseClass}__back-btn-default`

### Phase 4 — State machine (`src/utils/useScreenStack.ts`)

Implement `useScreenStack(durations)` returning `[ScreenEntry[], ScreenStackActions]`.

Internal refs needed: `entriesRef` (mirrors state for sync reads in callbacks), `durationsRef` (mirrors durations for same reason).

Implement these actions — all as `useCallback` with stable references:

- **`push(options | PreloadHandle, parentId)`**: if PreloadHandle → find entry, change step to `entering`, set `activeChildEffect` on parent. If NavigateOptions → create entry via `makeEntry(options, parentId, 'entering')`, append to state, set `activeChildEffect` on parent. Do NOT advance `entering → active` here — that's ScreenLayer's job.

- **`pop(id)`**: read entry from ref, call `entry.onBack()`, set `step: 'exiting'` on the entry AND `activeChildEffect: null` on the parent in a single `setEntries` call. Schedule entry removal with `setTimeout(duration)`.

- **`preload(options, parentId)`**: generate an ID immediately, call `setTimeout(() => setEntries(prev => [...prev, makeEntry(...)]), 0)` to defer. Return `PreloadHandle` with the ID and an `updateProps` function.

- **`deleteByNames(pageNames)`**: filter entries, keeping those whose `pageName` is not in the set.

- **`advanceStep(id, step)`**: simple setter — update one entry's step field.

Helper: `makeEntry(options, parentId, step)` — constructs a `ScreenEntry` from `NavigateOptions`, applying all defaults.

### Phase 5 — Context (`src/context.tsx`)

Create a `ScreenContext` (React Context, default `null`). Export `useScreenNavigator()` hook that reads the context and throws a descriptive error if `null`.

### Phase 6 — BackButton (`src/BackButton.tsx`)

A simple presentational component. Props: `baseClass`, `onClick`, optional `Custom` (ComponentType). Renders a wrapper div with `${baseClass}__back-btn` class. Inside: if `Custom` provided, render it; otherwise render the default button div with `${baseClass}__back-btn-default` class and an `aria-label="Go back"`.

### Phase 7 — ScreenLayer (`src/ScreenLayer.tsx`)

Receives: `entry`, `level`, `baseClass`, `actions`, optional `BackButtonOverride`.

1. `useLayoutEffect` watching `entry.step`: when step is `'entering'`, schedule two nested `requestAnimationFrame` calls that call `actions.advanceStep(entry.id, 'active')`. Clean up both rAF IDs on unmount.

2. Create a `navigator` object with `useMemo` bound to `entry.id`. The four methods delegate to `actions`, passing `entry.id` as the parent context.

3. Render:
   ```
   <ScreenContext.Provider value={navigator}>
     <div
       className="{baseClass} {className}"
       data-level={level}
       data-effect={entry.effect}
       data-step={entry.step}
       data-child-effect={activeChildEffect || undefined}
     >
       <Component {...props} />
       {showBackButton && <BackButton ... onClick={() => actions.pop(entry.id)} />}
     </div>
   </ScreenContext.Provider>
   ```

### Phase 8 — ScreenFX (`src/ScreenFX.tsx`)

1. Merge `durationOverrides` with defaults using `useMemo` (memoize on individual values, not the object reference).
2. Build CSS string with `useMemo`.
3. Call `useScreenStack(durations)`.
4. Use a `useRef` boolean guard + `useEffect` to call `actions.push(initScreen, null)` exactly once on mount, with `effect: 'none'`, `showBackButton: false`.
5. Render `<>`, `<style>{css}</style>`, then map `entries` to `<ScreenLayer>` components keyed by `entry.id`.

### Phase 9 — Public exports (`src/index.ts`)

Export `ScreenFX`, `useScreenNavigator`, and all public types.

### Phase 10 — Tests

**Unit tests for `useScreenStack`** (use `renderHook` + `vi.useFakeTimers`):
- `push` creates entry with `step: 'entering'`
- `push` with `parentEffect` sets `activeChildEffect` on parent
- `advanceStep` updates step
- `pop` sets `exiting`, removes after timeout, clears parent's `activeChildEffect`, calls `onBack`
- `preload` defers entry creation, `updateProps` merges
- `deleteByNames` filters correctly

**Integration tests for `ScreenFX`** (use `render` + `fireEvent` + `waitFor`):
- Initial screen renders
- Props passed to initial screen
- `nextScreen` renders the new screen
- `backScreen` removes the screen after transition duration
- `onBack` is called exactly once
- Back button rendered when `showBackButton: true`
- Custom back button rendered
- Preload + `updateProps` + activate delivers updated props
