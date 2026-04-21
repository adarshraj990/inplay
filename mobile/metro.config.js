const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * METRO CONFIGURATION - ABSOLUTE FINAL REWRITE
 * 1. Force 'mjs' to be the FIRST extension evaluated.
 * 2. Physically purge 'watcher.unstable_autoSaveCache' and other unknown options.
 */

const defaultConfig = getDefaultConfig(__dirname);

// PHYSICAL PURGE of unwanted keys from defaultConfig
if (defaultConfig.server) {
  delete defaultConfig.server.tls;
}
if (defaultConfig.watcher) {
  delete defaultConfig.watcher.unstable_lazySha1;
  delete defaultConfig.watcher.unstable_autoSaveCache;
}

/** @type {import('metro-config').MetroConfig} */
const config = {
  resolver: {
    // CRITICAL: .mjs MUST be the first extension to ensure Better Auth is indexed early
    sourceExts: ['mjs', ...defaultConfig.resolver.sourceExts],
    
    unstable_enablePackageExports: false,

    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('better-auth/')) {
        const subpath = moduleName.replace('better-auth/', '');
        if (subpath === 'react') {
          return {
            filePath: path.resolve(__dirname, 'node_modules/better-auth/dist/client/react/index.mjs'),
            type: 'sourceFile',
          };
        }
      }

      if (moduleName.startsWith('better-call/')) {
        const subpath = moduleName.replace('better-call/', '');
        return {
          filePath: path.resolve(__dirname, 'node_modules/better-call/dist', `${subpath}.mjs`),
          type: 'sourceFile',
        };
      }

      if (moduleName.startsWith('@better-auth/core/')) {
        const subpath = moduleName.replace('@better-auth/core/', '');
        const filePath = path.resolve(__dirname, 'node_modules/@better-auth/core/dist', `${subpath}.mjs`);
        return {
          filePath,
          type: 'sourceFile',
        };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
  // Explicitly prevent these keys from being added back during merge
  watcher: {
    unstable_lazySha1: undefined,
    unstable_autoSaveCache: undefined,
  },
  server: {
    tls: undefined,
  }
};

module.exports = mergeConfig(defaultConfig, config);
