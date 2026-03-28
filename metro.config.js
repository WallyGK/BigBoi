const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

// Speed up rebuilds by enabling the persistent cache
config.cacheStores = [
  new (require("metro-cache").FileStore)({
    root: require("path").join(__dirname, "node_modules/.cache/metro"),
  }),
];

module.exports = config;
