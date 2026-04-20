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
    sourceExts: [...sourceExts, 'mjs'],

    // Explicitly resolve modern subpaths that Metro normally fails to find without Package Exports
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'better-auth/react') {
        return {
          filePath: path.resolve(__dirname, 'node_modules/better-auth/dist/client/react/index.mjs'),
          type: 'sourceFile',
        };
      }
      if (moduleName === 'better-call/error') {
        return {
          filePath: path.resolve(__dirname, 'node_modules/better-call/dist/error.mjs'),
          type: 'sourceFile',
        };
      }
      // Optionally handle other better-auth subpaths if needed
      if (moduleName.startsWith('better-auth/') && !moduleName.includes('/')) {
         // Add generic mapping if more subpaths fail
      }

      // Default resolution for everything else
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
