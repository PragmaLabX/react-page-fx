import { createRoot } from 'react-dom/client'
import { ScreenFX } from 'react-page-fx'
import HomeScreen from './HomeScreen'

// No StrictMode — avoids double-effect execution that would create duplicate preloads
createRoot(document.getElementById('app-frame')!).render(
  <ScreenFX
    initScreen={{ Component: HomeScreen }}
    durations={{ slide: 350, fade: 280, blur: 200 }}
    baseClass="demo-screen"
  />,
)
