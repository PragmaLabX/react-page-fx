# react-page-fx

Lightweight React component for managing pages and transition effects. Wrap your app once, then navigate between pages with `slide`, `fade`, or `blur` effects.

## Installation

```bash
npm install react-page-fx
```

## Quick start

```tsx
import { PageFX } from 'react-page-fx'

const App = () => (
  <PageFX
    initPage={{ Component: HomePage }}
    config={{
      durations: { slide: 300, fade: 200 },  // optional
    }}
  />
)
```

Inside any page component, import the navigation hook:

```tsx
import { usePageNavigator } from 'react-page-fx'

const HomePage = () => {
  const { nextPage, backPage } = usePageNavigator()

  return (
    <button onClick={() => nextPage({
      Component: AboutPage,
      effect: 'slide',
      showBackButton: true,
      pageName: 'about',           // optional — used by deletePages
      props: { title: 'Hello' },   // optional — passed to the component
      onBack: () => console.log('went back'), // optional
      parentEffect: 'slide',       // optional — shifts this page left while child is open
    })}>
      Open About
    </button>
  )
}
```

## API

### `<PageFX>`

| Prop       | Type                               | Description             |
|------------|------------------------------------|-------------------------|
| `initPage` | `{ Component, pageName?, props? }` | The first page to show  |
| `config`   | `PageFXConfig`                     | Shared display settings |

### `PageFXConfig`

| Field        | Type                                     | Description                                   |
|--------------|------------------------------------------|-----------------------------------------------|
| `durations`  | `{ fade?, slide?, blur? }` (ms)          | Override default transition durations         |
| `baseClass`  | `string`                                 | CSS class prefix (default: `pfx-page`)        |
| `BackButton` | `ComponentType<{ onClick: () => void }>` | Custom back button component                  |

### `usePageNavigator()`

Returns a `PageNavigator` bound to the current page:

```ts
const {
  nextPage,    // navigate to a new page
  backPage,    // go back (triggers onBack + exit animation)
  preloadPage, // mount a page off-screen for instant later navigation
  deletePages, // remove pages by pageName
} = usePageNavigator()
```

### `nextPage(options | PreloadHandle)`

```ts
nextPage({
  Component: MyPage,
  pageName?: string,
  effect?: 'none' | 'slide' | 'fade' | 'blur',  // default: 'none'
  props?: Record<string, unknown>,
  showBackButton?: boolean,
  onBack?: () => void,                            // called when this page is popped
  parentEffect?: 'slide' | 'blur',               // visual effect on the opening page
})
```

### `preloadPage(options)` → `PreloadHandle`

Mounts the page off-screen immediately. Activate it later by passing the handle to `nextPage`:

```tsx
const handle = preloadPage({ Component: HeavyPage, props: { id: 1 } })

// Update props before opening:
handle.updateProps({ id: 2 })

// Open instantly (no render lag):
nextPage(handle)
```

### Effects

| Effect  | Description                                   |
|---------|-----------------------------------------------|
| `none`  | No animation (instant)                        |
| `slide` | Slide in from the right                       |
| `fade`  | Fade in / out                                 |
| `blur`  | Blur the parent page (use as `parentEffect`)  |

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
