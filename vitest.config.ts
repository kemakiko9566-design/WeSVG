import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.spec.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
    ],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.DS_Store'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/main.ts'],
    },
  },
})
