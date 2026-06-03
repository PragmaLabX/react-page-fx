# react-page-fx

Lightweight React component for managing screens and transition effects. Wrap your app once, then navigate between screens with `slide`, `fade`, or `blur` effects.

## Installation

```bash
npm install react-page-fx
```

## Quick start

```tsx
import { ScreenFX } from 'react-page-fx'

const App = () => (
  <ScreenFX
    initScreen={{ Component: HomeScreen }}
    durations={{ slide: 300, fade: 200 }}  // optional
  />
)
```

Inside any screen component, import the navigation hook:

```tsx
import { useScreenNavigator } from 'react-page-fx'

const HomeScreen = () => {
  const { nextScreen, backScreen } = useScreenNavigator()

  return (
    <button onClick={() => nextScreen({
      Component: AboutScreen,
      effect: 'slide',
      showBackButton: true,
      pageName: 'about',           // optional — used by deleteScreens
      props: { title: 'Hello' },   // optional — passed to the component
      onBack: () => console.log('went back'), // optional
      parentEffect: 'slide',       // optional — shifts this screen left while child is open
    })}>
      Open About
    </button>
  )
}
```

## API

### `<ScreenFX>`

| Prop          | Type                                    | Description                                    |
|---------------|-----------------------------------------|------------------------------------------------|
| `initScreen`  | `{ Component, pageName?, props? }`      | The first screen to show                       |
| `durations`   | `{ fade?, slide?, blur? }` (ms)         | Override default transition durations          |
| `BackButton`  | `ComponentType<{ onClick: () => void }>` | Custom back button (default: semi-transparent circle) |
| `baseClass`   | `string`                                | CSS class prefix (default: `sfx-screen`)       |

### `useScreenNavigator()`

Returns a `ScreenNavigator` bound to the current screen:

```ts
const {
  nextScreen,      // navigate to a new screen
  backScreen,      // go back (triggers onBack + exit animation)
  preloadScreen,   // mount a screen off-screen for instant later navigation
  deleteScreens,   // remove screens by pageName
} = useScreenNavigator()
```

### `nextScreen(options | PreloadHandle)`

```ts
nextScreen({
  Component: MyScreen,
  pageName?: string,
  effect?: 'none' | 'slide' | 'fade' | 'blur',  // default: 'none'
  props?: Record<string, unknown>,
  showBackButton?: boolean,
  onBack?: () => void,                            // called when this screen is popped
  parentEffect?: 'slide' | 'blur',               // visual effect on the opening screen
})
```

### `preloadScreen(options)` → `PreloadHandle`

Mounts the screen off-screen immediately. Activate it later by passing the handle to `nextScreen`:

```tsx
const handle = preloadScreen({ Component: HeavyScreen, props: { id: 1 } })

// Update props before opening:
handle.updateProps({ id: 2 })

// Open instantly (no render lag):
nextScreen(handle)
```

### Effects

| Effect  | Description                                          |
|---------|------------------------------------------------------|
| `none`  | No animation (instant)                               |
| `slide` | Slide in from the right                              |
| `fade`  | Fade in / out                                        |
| `blur`  | Blur the parent screen (use as `parentEffect`)       |

## Demo

An interactive demo lives in the [`demo/`](demo/) directory. It showcases all transition effects in a phone-frame UI.

```bash
cd demo
npm install
npm run dev      # http://localhost:5173
```

The demo imports the library directly from `../src` via a Vite alias, so it always reflects the current source without a build step.

## Development

```bash
npm install
npm run build         # compile to dist/
npm test              # run tests
npm run test:coverage # coverage report
npm run check         # typecheck + lint + format + tests
```
