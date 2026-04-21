const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - DIRECT ESM FIX (Log 21)
 * 1. MANDATORY: unstable_enablePackageExports: true (Fixes 'better-call/error')
 * 2. ESM PRIORITY: .mjs first in sourceExts.
 * 3. ZERO-MENTION: Physically deleted all deprecated server and watcher keys.
 */

const config = getDefaultConfig(__dirname);

// 1. Enable Package Exports for sub-path resolution (better-call, socket.io)
config.resolver.unstable_enablePackageExports = true;

// 2. Set ESM Extension Priority
config.resolver.sourceExts = ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'];

// 3. AGGRESSIVE CLEANUP: Explicitly delete deprecated keys to stop validation warnings
if (config.server) {
  delete config.server.tls;
  delete config.server.lazySha1;
}

if (config.watcher) {
  delete config.watcher.unstable_autoSaveCache;
}
// Fully remove watcher block to be safe
delete config.watcher;

module.exports = config;



