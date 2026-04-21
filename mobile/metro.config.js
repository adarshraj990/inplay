const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - PRISTINE ESM FIX (Log 20)
 * 1. MANDATORY: unstable_enablePackageExports: true (Fixes 'better-call/error')
 * 2. ESM PRIORITY: .mjs first for compatibility.
 * 3. ZERO-MENTION: Aggressive removal of deprecated keys.
 */

const defaultConfig = getDefaultConfig(__dirname);

// PHYSICALLY PURGE DEPRECATED KEYS
if (defaultConfig.server) {
  delete defaultConfig.server.tls;
  delete defaultConfig.server.lazySha1;
}
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


