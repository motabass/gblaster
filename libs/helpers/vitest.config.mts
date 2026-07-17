import { defineConfig } from 'vitest/config';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/helpers',
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: resolve(__dirname, '*.md').replaceAll('\\', '/'), dest: '.' }]
    })
  ],
  test: {
    name: 'helpers',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/helpers',
      provider: 'v8' as const
    }
  }
}));
