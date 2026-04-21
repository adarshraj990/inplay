const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - DIRECT ESM FIX (Log 25)
 * 1. MANDATORY: unstable_enablePackageExports: true (Fixes 'better-call/error')
 * 2. ESM PRIORITY: .mjs first in sourceExts.
 * 3. AGGRESSIVE CLEANUP: Physically purged 'watcher.unstable_autoSaveCache' and server keys.
 */

const defaultConfig = getDefaultConfig(__dirname);

// --- AGGRESSIVE SCRUBBING OF DEPRECATED KEYS ---
// Physically remove keys that trigger validation warnings in Log 25
if (defaultConfig.server) {
  delete defaultConfig.server.tls;
  delete defaultConfig.server.lazySha1;
  delete defaultConfig.server.unstable_lazySha1;
}

if (defaultConfig.watcher) {
  // Explicitly delete the key mentioned in the Log 25 warning
  delete defaultConfig.watcher.unstable_autoSaveCache;
}
// Fully remove the watcher block to ensure zero-mention
delete defaultConfig.watcher;

const config = {
  resolver: {
    // REQUIRED for modern ESM libraries with sub-path exports
    unstable_enablePackageExports: true,
    // Priority extensions for module resolution
    sourceExts: ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(defaultConfig, config);







