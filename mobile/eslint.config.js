// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      "indent": ["error", 2],
      "no-tabs": "error",
      "no-mixed-spaces-and-tabs": "error",
    },
  },
]);
