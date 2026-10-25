import {esbuildPlugin} from '@web/dev-server-esbuild';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,

  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '2000',
    },
  },

  coverageConfig: {
    include: ['src/**/*.ts'],
    exclude: ['src/**/*.test.ts', 'src/test/**', 'src/main.ts'],
    report: true,
    reportDir: 'coverage',
    threshold: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },

  plugins: [
    esbuildPlugin({ts: true, target: 'es2021', tsconfig: 'tsconfig.json'}),
  ],
};
