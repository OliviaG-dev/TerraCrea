module.exports = {
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/setup.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/test-utils/**",
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.{js,jsx,ts,tsx}"],

  // Configuration simplifiée
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
};
