import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: { // Add this block for Vitest
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Optional setup file
  },
})
