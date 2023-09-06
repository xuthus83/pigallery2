import {defineConfig} from 'cypress';

export default defineConfig({

  e2e: {
    'baseUrl': 'http://localhost:8080',
    experimentalStudio: true,
    supportFile: 'cypress/support/e2e.ts',
    specPattern:'cypress/e2e/**/*.cy.ts'
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts'
  }

});
