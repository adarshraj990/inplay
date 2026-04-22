const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * METRO CONFIGURATION — INDIPLAY RELEASE BUILD FIX (Log 31 — Final)
 *
 * Root cause: Metro cannot resolve "Package Exports" (the `exports` field in
 * package.json) used by better-call, @better-auth/core, and socket.io-client.
 *
 * Fix strategy:
 *  1. unstable_enablePackageExports  → honour `exports` field (ESM libraries)
 *  2. unstable_enableSymlinks        → correctly map all node_modules symlinks
 *  3. sourceExts starts with 'mjs'   → ESM entry points resolved first
 *  4. conditionNames                 → tell Metro which export condition to use
 *  5. resolveRequest (custom)        → explicit fallback map for known ESM paths
 *  6. All deprecated server/watcher keys deleted to keep config pristine
 */

const config = getDefaultConfig(__dirname);

// ── RESOLVER ─────────────────────────────────────────────────────────────────
config.resolver.sourceExts = ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'];

// Core fix: allow Metro to honour the `exports` field in package.json
config.resolver.unstable_enablePackageExports = true;

// Correctly resolve symlinked packages inside node_modules
config.resolver.unstable_enableSymlinks = true;

// Tell Metro which export conditions to evaluate (order matters)
config.resolver.conditionNames = ['import', 'require', 'react-native'];

// ── CUSTOM RESOLVER (Last-Mile Fallback) ────────────────────────────────────
// If Metro still fails to map sub-path exports (e.g. better-call/error),
// this resolveRequest intercepts and manually points to the correct file.
const ESM_SUBPATH_MAP = {
  'better-call/error': 'better-call/dist/error.mjs',
  'better-call/client': 'better-call/dist/client.mjs',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mapped = ESM_SUBPATH_MAP[moduleName];
  if (mapped) {
    const resolvedPath = path.resolve(
      __dirname,
      'node_modules',
      mapped,
    );
    return { filePath: resolvedPath, type: 'sourceFile' };
  }
  // Default Metro resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

// ── TRANSFORMER ───────────────────────────────────────────────────────────────
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// ── PURGE DEPRECATED KEYS ────────────────────────────────────────────────────
delete config.server;
delete config.watcher;

module.exports = config;
