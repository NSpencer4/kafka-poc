module.exports = {
    verbose: false,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/components/**/*.ts',
        '!src/components/**/*.test.ts'
    ],
    coverageThreshold: {
        global: {
            "branches": 80,
            "functions": 80,
            "lines": 80
        }
    },
    coverageReporters: [
        'text-summary',
        'html'
    ],
    modulePaths: [
        "<rootDir>/src",
    ],
    roots: [
        "<rootDir>/src"
    ],
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    }
};
