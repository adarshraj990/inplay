const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = {
  resolver: {
    // Enable package exports to resolve modern package paths like 'better-auth/react'
    unstable_enablePackageExports: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
