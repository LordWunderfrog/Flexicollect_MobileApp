module.exports = {
  project: {
    ios: {},
    android: {}, // grouped into "project"
  },
  assets: ["./app/assets/fonts"], // stays the same
  dependencies: {
    ...(process.env.NO_FLIPPER // When set, skip flipper includes for iOS archive builds (release buidls)
      ? { 'react-native-flipper': { platforms: { ios: null } } }
      : {}),
  },
};