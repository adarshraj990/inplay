const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/** @type {import('metro-config').MetroConfig} */
const config = {
  resolver: {
    // We disable package exports because it causes regressions in @react-navigation/native-stack
    unstable_enablePackageExports: false,
    
    // Add 'mjs' to support modern ESM libraries
    sourceExts: ['js', 'json', 'ts', 'tsx', 'mjs'],

    // Explicitly resolve modern subpaths for Better Auth and its internal core utilities
    resolveRequest: (context, moduleName, platform) => {
      // 1. Handle better-auth subpaths
      if (moduleName.startsWith('better-auth/')) {
        const subpath = moduleName.replace('better-auth/', '');
        if (subpath === 'react') {
          return {
            filePath: path.resolve(__dirname, 'node_modules/better-auth/dist/client/react/index.mjs'),
            type: 'sourceFile',
          };
        }
      }

      // 2. Handle better-call subpaths
      if (moduleName.startsWith('better-call/')) {
        const subpath = moduleName.replace('better-call/', '');
        return {
          filePath: path.resolve(__dirname, 'node_modules/better-call/dist', `${subpath}.mjs`),
          type: 'sourceFile',
        };
      }

      // 3. Handle @better-auth/core subpaths
      if (moduleName.startsWith('@better-auth/core/')) {
        const subpath = moduleName.replace('@better-auth/core/', '');
        const filePath = path.resolve(__dirname, 'node_modules/@better-auth/core/dist', `${subpath}.mjs`);
        return {
          filePath,
          type: 'sourceFile',
        };
      }

      // Default resolution for everything else
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  // Ensure we don't have deprecated watcher/server options that cause SHA-1 issues
  watcher: {
    // Disabling these as they are known to cause SHA-1 computation issues on some CI environments
    unstable_lazySha1: false,
    unstable_autoSaveCache: false,
  },
};

module.exports = mergeConfig(defaultConfig, config);
