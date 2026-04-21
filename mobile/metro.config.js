const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - PRISTINE ESM FIX (Log 26)
 * 1. MANDATORY: unstable_enablePackageExports: true (Fixes 'better-call/error')
 * 2. ESM PRIORITY: .mjs first for Better Auth compatibility
 * 3. ZERO-MENTION: Physically purged 'unstable_autoSaveCache' and server keys.
 */

const config = getDefaultConfig(__dirname);

// 1. ENABLE PACKAGE EXPORTS (Sub-path resolution)
config.resolver.unstable_enablePackageExports = true;

// 2. SET ESM EXTENSION PRIORITY
config.resolver.sourceExts = ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'];

// 3. AGGRESSIVE CLEANUP: Remove deprecated keys to silence Log 26 warnings
if (config.server) {
  delete config.server.tls;
  delete config.server.lazySha1;
  delete config.server.unstable_lazySha1;
}

if (config.watcher) {
  delete config.watcher.unstable_autoSaveCache;
}
// Remove the entire watcher block to be 100% clean
delete config.watcher;

module.exports = config;








