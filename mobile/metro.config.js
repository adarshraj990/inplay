const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - CRITICAL REWRITE (Log 27 Fix)
 * 1. MANDATORY: unstable_enablePackageExports: true
 * 2. ESM PRIORITY: .mjs first for Better Auth compatibility
 * 3. PURGE: Removed all deprecated server and watcher keys causing validator errors.
 */

const config = getDefaultConfig(__dirname);

const {
  resolver: { sourceExts, assetExts },
} = config;

// 1. SET PRIORITY: .mjs MUST BE FIRST
config.resolver.sourceExts = ['mjs', ...sourceExts];

// 2. ENABLE EXPORTS: Fixes 'better-call/error' resolution
config.resolver.unstable_enablePackageExports = true;

// 3. PRISTINE CONFIG: Kill deprecated keys immediately
// Metro validates these keys even if they are empty objects in some versions
// We remove them entirely from the final exported config object.
delete config.server;
delete config.watcher;

module.exports = config;
