import {esbuildPlugin} from '@web/dev-server-esbuild';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  plugins: [
    // Compile TypeScript test files (and imported components) on the fly.
    esbuildPlugin({ts: true, target: 'es2021', tsconfig: 'tsconfig.json'}),
  ],
};
