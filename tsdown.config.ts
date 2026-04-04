import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
  entry: ['src/index.ts'],
  external: ['react', 'react/jsx-runtime'],
  format: 'esm',
  minify: true,
  outDir: 'dist',
  platform: 'neutral',
  sourcemap: 'hidden',
});
