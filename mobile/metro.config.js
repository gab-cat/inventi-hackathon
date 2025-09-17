const path = require('path');
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

config.resolver = {
  ...(config.resolver || {}),
  // Support aliasing the external convex folder as "@convex"
  alias: {
    ...(config.resolver?.alias || {}),
    '@convex': path.resolve(__dirname, '../convex'),
  },
  // Fallback for older Metro versions
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules || {}),
    '@convex': path.resolve(__dirname, '../convex'),
  },
};

// Allow Metro to watch files outside the app directory (the monorepo root/convex)
config.watchFolders = Array.from(new Set([
  ...(config.watchFolders || []),
  path.resolve(__dirname, '..'),
  path.resolve(__dirname, '../convex'),
]));

module.exports = withNativeWind(config, { input: './app/globals.css', inlineRem: 16 })