import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  injectStyle: false,
  external: ['react', 'react-dom', '@ai-sdk/react', 'ai'],
});
