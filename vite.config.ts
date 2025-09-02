import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  console.log('mode', mode);
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    assetsInclude: ['**/*.png'],
  };
});
