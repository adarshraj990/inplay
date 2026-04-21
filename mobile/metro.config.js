const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * METRO CONFIGURATION - SELECTIVE EXPORT STRATEGY
 * We bypass mergeConfig to ensure 'server' and 'watcher' blocks are completely purged.
 * This physically prevents 'server.tls' and 'unstable_lazySha1' from existing.
 */
module.exports = {
  // 1. Transformer and Serializer from defaults
  transformer: defaultConfig.transformer,
  serializer: defaultConfig.serializer,

  // 2. Customized Resolver
  resolver: {
    ...defaultConfig.resolver,
    
    // PRIORITY: .mjs is EVALUATED FIRST to ensure Better Auth is indexed early
    sourceExts: ['mjs', 'js', 'json', 'ts', 'tsx'],
    
    // Comprehensive asset support for gaming
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
  
  // 3. PHYSICAL PURGE: We omit 'server' and 'watcher' blocks entirely.
  // They are NOT merged and therefore cannot trigger 'Unknown option' warnings.
};
