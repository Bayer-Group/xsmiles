/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src"],
    moduleNameMapper: {
        // Mock CSS/SCSS imports
        "\\.(css|scss|sass)$": "identity-obj-proxy",
        // Handle src/ path aliases (tsconfig baseUrl: ".")
        "^src/(.*)$": "<rootDir>/src/$1",
    },
    setupFiles: [],
    transform: {
        "^.+\\.[jt]sx?$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
            },
        ],
    },
    // Transform ESM-only node_modules packages so Jest can process them
    transformIgnorePatterns: [
        "<rootDir>/node_modules/(?!(d3|d3-.*|internmap|delaunator|robust-predicates|kdbush)/)",
    ],
    testMatch: ["**/__tests__/**/*.{ts,tsx}", "**/*.{test,spec}.{ts,tsx}"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
