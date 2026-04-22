module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Fixes: "export * as ns from '...'" syntax used in modern ESM libraries
    // (replaces deprecated @babel/plugin-proposal-export-namespace-from)
    '@babel/plugin-transform-export-namespace-from',

    // react-native-reanimated MUST be the last plugin
    'react-native-reanimated/plugin',
  ],
};
