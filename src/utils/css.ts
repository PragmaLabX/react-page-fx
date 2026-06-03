import type { DurationOptions } from '../types'

export function buildCSS(baseClass: string, d: DurationOptions): string {
  const B = baseClass
  const s = (ms: number) => `${(ms / 1000).toFixed(3)}s`

  const zLayers = Array.from(
    { length: 20 },
    (_, i) => `
      .${B}[data-level="${i}"] { z-index: ${(i + 1) * 100}; }
      .${B}[data-level="${i}"] .${B}__back-btn { z-index: ${(i + 1) * 100 + 50}; }
    `,
  ).join('')

  return `
    .${B} {
      position: absolute;
      inset: 0;
      overflow: hidden;
      transition:
        transform ${s(d.slide)} ease-out,
        opacity ${s(d.fade)} ease-out,
        filter ${s(d.blur)} ease-out;
    }

    /* Preloaded — hidden off-screen, no pointer events */
    .${B}[data-step="offscreen"] {
      transform: translateX(100%);
      visibility: hidden;
      pointer-events: none;
    }

    /* === Slide === */
    .${B}[data-effect="slide"][data-step="entering"] { transform: translateX(100%); }
    .${B}[data-effect="slide"][data-step="active"]   { transform: translateX(0); }
    .${B}[data-effect="slide"][data-step="exiting"]  { transform: translateX(100%); }

    /* === Fade === */
    .${B}[data-effect="fade"][data-step="entering"] { opacity: 0; }
    .${B}[data-effect="fade"][data-step="active"]   { opacity: 1; }
    .${B}[data-effect="fade"][data-step="exiting"]  { opacity: 0; }

    /* === Parent modifiers when a child is active above === */
    .${B}[data-child-effect="slide"] { transform: translateX(-20%); }
    .${B}[data-child-effect="blur"]  { filter: blur(8px); transform: scale(1.05); }

    ${zLayers}

    /* === Back button === */
    .${B}__back-btn {
      position: absolute;
      top: 12px;
      left: 12px;
    }

    .${B}__back-btn-default {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .${B}__back-btn-default::before {
      content: '';
      display: block;
      width: 11px;
      height: 11px;
      border: 2px solid #fff;
      border-right: none;
      border-top: none;
      transform: rotate(45deg) translate(2px, -2px);
    }
  `
}
