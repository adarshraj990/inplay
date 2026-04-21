const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - PRISTINE ESM FIX (Log 23)
 * 1. MANDATORY: unstable_enablePackageExports: true (Fixes 'better-call/error')
 * 2. ESM PRIORITY: .mjs first for Better Auth compatibility
 * 3. AGGRESSIVE CLEANUP: Physically purged 'watcher.unstable_autoSaveCache' and server keys.
 */

const defaultConfig = getDefaultConfig(__dirname);

// --- MANDATORY SCRUBBING ---
// Physically remove deprecated keys that trigger validation warnings in Log 23
if (defaultConfig.server) {
  delete defaultConfig.server.tls;
  delete defaultConfig.server.lazySha1;
  delete defaultConfig.server.unstable_lazySha1;
}

if (defaultConfig.watcher) {
  // Explicitly remove the specific key mentioned in Log 23
  delete defaultConfig.watcher.unstable_autoSaveCache;
}
// Fully remove the watcher block to ensure zero-mention
delete defaultConfig.watcher;

const config = {
  resolver: {
    // REQUIRED: Enable package exports to find sub-modules like better-call/error
    unstable_enablePackageExports: true,
    // Priority extensions for modern ESM library support
    sourceExts: ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(defaultConfig, config);





