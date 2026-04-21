const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - TOTAL REWRITE
 * 1. .mjs is set as the VERY FIRST extension to resolve SHA-1 indexing issues.
 * 2. Uses standard @react-native/metro-config defaults.
 * 3. Zero deprecated keys (no server.tls or watcher blocks).
 */

const config = {
  resolver: {
    // Priority extensions: mjs must come first for modern ESM library support
    sourceExts: ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
