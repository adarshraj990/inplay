const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - TOTAL REWRITE (Log 22)
 * 1. MANDATORY: unstable_enablePackageExports: true
 * 2. ESM PRIORITY: .mjs first for Better Auth.
 * 3. AGGRESSIVE PURGE: Physically deleted server.tls, lazySha1, and autoSaveCache.
 */

const defaultConfig = getDefaultConfig(__dirname);

// --- PHYSICAL PURGE OF DEPRECATED KEYS ---
if (defaultConfig.server) {
  delete defaultConfig.server.tls;
  delete defaultConfig.server.lazySha1;
  delete defaultConfig.server.unstable_lazySha1;
}

if (defaultConfig.watcher) {
  delete defaultConfig.watcher.unstable_autoSaveCache;
}
delete defaultConfig.watcher;

// --- FINAL CLEAN CONFIGURATION ---
const config = {
  resolver: {
    // Required to resolve sub-paths like 'better-call/error'
    unstable_enablePackageExports: true,
    // ESM Support
    sourceExts: ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(defaultConfig, config);




