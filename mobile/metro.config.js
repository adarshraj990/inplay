const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - PRISTINE ESM FIX (Log 24)
 * 1. MANDATORY: unstable_enablePackageExports: true (Fixes 'better-call/error')
 * 2. ESM PRIORITY: .mjs first for compatibility.
 * 3. AGGRESSIVE CLEANUP: Physically purged 'watcher.unstable_autoSaveCache' and server keys.
 */

const defaultConfig = getDefaultConfig(__dirname);

// --- AGGRESSIVE SCRUBBING OF DEPRECATED KEYS ---
// Physically remove keys that trigger validation warnings in Log 24
if (defaultConfig.server) {
  delete defaultConfig.server.tls;
  delete defaultConfig.server.lazySha1;
  delete defaultConfig.server.unstable_lazySha1;
}

if (defaultConfig.watcher) {
  // Explicitly delete the key mentioned in the warning
  delete defaultConfig.watcher.unstable_autoSaveCache;
}
// Remove the entire watcher block to be safe
delete defaultConfig.watcher;

const config = {
  resolver: {
    // REQUIRED: Enable package exports for modern ESM sub-path resolution
    unstable_enablePackageExports: true,
    // Priority for .mjs extensions
    sourceExts: ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(defaultConfig, config);






