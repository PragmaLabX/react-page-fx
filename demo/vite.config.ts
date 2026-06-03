import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolves "react-page-fx" to the local source so the demo
      // looks identical to real package usage.
      'react-page-fx': resolve(__dirname, '../src/index.ts'),
    },
  },
})
