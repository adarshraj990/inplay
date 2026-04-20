const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/** @type {import('metro-config').MetroConfig} */
const config = {
  resolver: {
    // We disable package exports because it causes regressions in @react-navigation/native-stack (version mismatch/missing src)
    unstable_enablePackageExports: false,
    
    // Add 'mjs' to support modern ESM libraries
    sourceExts: ['js', 'json', 'ts', 'tsx', 'mjs'],

    // Explicitly resolve modern subpaths for Better Auth and its internal core utilities
    resolveRequest: (context, moduleName, platform) => {
      // 1. Handle better-auth subpaths (e.g., better-auth/react)
      if (moduleName.startsWith('better-auth/')) {
        const subpath = moduleName.replace('better-auth/', '');
        // Map common subpaths known to use ESM
        if (subpath === 'react') {
          return {
            filePath: path.resolve(__dirname, 'node_modules/better-auth/dist/client/react/index.mjs'),
            type: 'sourceFile',
          };
        }
        // Add more specific mappings if they continue to fail
      }

      // 2. Handle better-call subpaths (e.g., better-call/error)
      if (moduleName.startsWith('better-call/')) {
        const subpath = moduleName.replace('better-call/', '');
        return {
          filePath: path.resolve(__dirname, 'node_modules/better-call/dist', `${subpath}.mjs`),
          type: 'sourceFile',
        };
      }

      // 3. Handle @better-auth/core subpaths (e.g., @better-auth/core/utils/string)
      if (moduleName.startsWith('@better-auth/core/')) {
        const subpath = moduleName.replace('@better-auth/core/', '');
        // Better Auth core uses a dist structure for subpaths
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
};

module.exports = mergeConfig(defaultConfig, config);
