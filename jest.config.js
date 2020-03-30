module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./__mocks__/setupFile.js'],
  transformIgnorePatterns: ['react-native-device-info'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts,tsx,jsx}', '!node_modules/*'],
};
