const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for InternalBytecode.js errors
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ignore problematic files and test files
config.resolver.blacklistRE = /(InternalBytecode\.js$|__tests__\/.*|.*\.test\.(js|jsx|ts|tsx)$)/;

// Exclude test files from bundling
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Reset cache on errors
config.resetCache = true;

module.exports = config;