// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      "indent": "off", // Disable ESLint indentation to let Prettier handle it
      "@typescript-eslint/indent": "off", // Also disable TypeScript ESLint indentation
      "no-tabs": "error",
      "no-mixed-spaces-and-tabs": "error",
    },
  },
]);
