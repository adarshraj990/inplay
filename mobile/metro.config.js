const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * METRO CONFIGURATION - TOTAL REWRITE
 * Physically removing all legacy and unstable options to resolve Indplay build failures.
 */

const defaultConfig = getDefaultConfig(__dirname);

// PHYSICAL DELETION of legacy/unstable keys from the default config object
if (defaultConfig.server) delete defaultConfig.server.tls;
if (defaultConfig.watcher) {
  delete defaultConfig.watcher.unstable_lazySha1;
  delete defaultConfig.watcher.unstable_autoSaveCache;
}

/** @type {import('metro-config').MetroConfig} */
const config = {
  resolver: {
    // Explicitly add 'mjs' for modern ESM libraries like Better Auth
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs'],
    
    // We disable package exports because it causes regressions in @react-navigation/native-stack
    unstable_enablePackageExports: false,

    // Manual resolution for ESM subpaths to ensure SHA-1 computation succeeds
    resolveRequest: (context, moduleName, platform) => {
      // 1. better-auth
      if (moduleName.startsWith('better-auth/')) {
        const subpath = moduleName.replace('better-auth/', '');
        if (subpath === 'react') {
          return {
            filePath: path.resolve(__dirname, 'node_modules/better-auth/dist/client/react/index.mjs'),
            type: 'sourceFile',
          };
        }
      }

      // 2. better-call
      if (moduleName.startsWith('better-call/')) {
        const subpath = moduleName.replace('better-call/', '');
        return {
          filePath: path.resolve(__dirname, 'node_modules/better-call/dist', `${subpath}.mjs`),
          type: 'sourceFile',
        };
      }

      // 3. @better-auth/core
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
};

module.exports = mergeConfig(defaultConfig, config);
