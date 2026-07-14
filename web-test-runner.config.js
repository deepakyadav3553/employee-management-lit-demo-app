import {esbuildPlugin} from '@web/dev-server-esbuild';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,

  // Mocha is the built-in test framework for @web/test-runner.
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '2000',
    },
  },

  // Code coverage (Istanbul). `npm run test:coverage` writes an HTML
  // report to ./coverage and enforces the thresholds below.
  coverageConfig: {
    include: ['src/**/*.ts'],
    exclude: ['src/**/*.test.ts', 'src/test/**'],
    report: true,
    reportDir: 'coverage',
    threshold: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },

  plugins: [
    esbuildPlugin({ts: true, target: 'es2021', tsconfig: 'tsconfig.json'}),
  ],
};
