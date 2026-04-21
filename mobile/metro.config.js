const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * METRO CONFIGURATION - PRISTINE REWRITE
 * Force .mjs prioritization and purge all legacy artifacts.
 * This file contains NO mentions of deprecated 'server' or 'watcher' keys.
 */
const config = {
  resolver: {
    // 1. .mjs is now the absolute first priority
    sourceExts: ['mjs', 'js', 'json', 'ts', 'tsx'],
    
    // 2. Comprehensive asset support for gaming (glb, gltf, obj, mtl, bin)
    assetExts: [...defaultConfig.resolver.assetExts, 'glb', 'gltf', 'obj', 'mtl', 'bin'],

    unstable_enablePackageExports: false,

    resolveRequest: (context, moduleName, platform) => {
      // Better Auth ESM subpath mapping
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
        return {
          filePath: path.resolve(__dirname, 'node_modules/@better-auth/core/dist', `${subpath}.mjs`),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
