const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * METRO CONFIGURATION - PRISTINE REWRITE (Log 29 Emergency Fix)
 * 1. MANDATORY: unstable_enablePackageExports: true
 * 2. ESM PRIORITY: .mjs FIRST
 * 3. PRISTINE: Removed all deprecated server and watcher keys entirely.
 */

const config = getDefaultConfig(__dirname);

// 1. SET EXTENSION PRIORITY (.mjs MUST BE FIRST)
config.resolver.sourceExts = ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'];

// 2. ENABLE PACKAGE EXPORTS
config.resolver.unstable_enablePackageExports = true;

// 3. NUCLEAR REMOVAL OF DEPRECATED KEYS
// We delete the entire blocks to ensure zero presence of 'server.tls', etc.
delete config.server;
delete config.watcher;

module.exports = config;
