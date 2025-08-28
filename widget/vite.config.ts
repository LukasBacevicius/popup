import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    preact(),
    cssInjectedByJsPlugin()
  ],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'ShopInWidget',
      fileName: 'widget',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: 'widget.js',
        globals: {}
      }
    },
    minify: 'terser'
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})