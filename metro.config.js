const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

const mergedConfig = mergeConfig(defaultConfig, config);

/**
 * @react-native-firebase v20+ ships ES module (export/import) syntax in its
 * dist files. Metro skips node_modules by default, so it fails on those
 * export statements. Add Firebase (and the standard RN packages) to the
 * Babel-transform allow-list so Metro compiles them to CommonJS.
 */
mergedConfig.transformer.transformIgnorePatterns = [
  'node_modules/(?!(' +
    '@react-native-firebase|' +
    '@react-native|' +
    'react-native' +
  ')/)',
];

module.exports = mergedConfig;
