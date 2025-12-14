module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      },
    ],
    'react-native-reanimated/plugin', // Reanimated 플러그인 추가
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
