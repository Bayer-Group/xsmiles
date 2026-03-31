import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    timeout: 30000,
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.01,
        },
    },
    use: {
        baseURL: "http://localhost:8080",
        screenshot: "only-on-failure",
        viewport: { width: 1280, height: 720 },
    },
    projects: [
        {
            name: "chromium",
            use: { browserName: "chromium" },
        },
    ],
    webServer: {
        command: "npm start",
        port: 8080,
        reuseExistingServer: true,
        timeout: 60000,
    },
});
