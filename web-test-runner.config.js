import {esbuildPlugin} from '@web/dev-server-esbuild';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ts: true, target: 'es2021', tsconfig: 'tsconfig.json'}),
  ],
};
