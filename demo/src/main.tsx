import { createRoot } from 'react-dom/client'
import { PageFX } from 'react-page-fx'
import HomeScreen from './HomeScreen'

// No StrictMode — avoids double-effect execution that would create duplicate preloads
createRoot(document.getElementById('app-frame')!).render(
  <PageFX
    initPage={{ Component: HomeScreen }}
    config={{
      durations: { slide: 350, fade: 280, blur: 200 },
      baseClass: 'demo-page',
    }}
  />,
)
