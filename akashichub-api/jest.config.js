export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middlewares/**/*.js",
    "utils/**/*.js",
    "services/**/*.js",
    "!**/node_modules/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
