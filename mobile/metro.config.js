const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - PRISTINE ESM FIX
 * 1. unstable_enablePackageExports: true (Fixes 'better-call/error' resolution)
 * 2. Priority extensions: .mjs first for Better Auth compatibility
 * 3. EXPLICITLY CLEAN: No 'server.tls', 'server.lazySha1', or 'watcher' blocks.
 */

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Enable package exports to find sub-modules like better-call/error
    unstable_enablePackageExports: true,
    // Priority extensions: mjs must come first for modern ESM library support
    sourceExts: ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'],
  },
};

// Merge configurations
const mergedConfig = mergeConfig(defaultConfig, config);

// CRITICAL CLEANUP: Ensure no invalid/deprecated keys exist in the final config
if (mergedConfig.server) {
  delete mergedConfig.server.tls;
  delete mergedConfig.server.lazySha1; // Some versions use this name
}

// Ensure no watcher blocks are present if they were somehow merged
delete mergedConfig.watcher;

module.exports = mergedConfig;
