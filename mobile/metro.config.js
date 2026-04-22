const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - PRISTINE REWRITE
 * 1. MANDATORY: unstable_enablePackageExports: true  → fixes better-call/error
 * 2. ESM PRIORITY: .mjs FIRST in sourceExts
 * 3. conditionNames: supports both ESM import & CommonJS require paths
 * 4. PRISTINE: All deprecated server/watcher keys removed entirely.
 */

const config = getDefaultConfig(__dirname);

// ── RESOLVER ────────────────────────────────────────────────────────────────
config.resolver.sourceExts = ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'];
config.resolver.unstable_enablePackageExports = true;
config.resolver.conditionNames = ['import', 'require', 'react-native'];

// ── NUCLEAR REMOVAL OF DEPRECATED KEYS ──────────────────────────────────────
delete config.server;
delete config.watcher;

module.exports = config;
