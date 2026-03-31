import { test, expect } from "@playwright/test";

// RDKit loads from CDN and initializes async — the app only renders after it's ready
test.describe("XSMILES Visual Regression", () => {
    test("homepage loads and renders molecules", async ({ page }) => {
        await page.goto("/");
        // Wait for any MoleculeView to appear (RDKit load + React render)
        await page.waitForSelector(".MoleculeView", { timeout: 60000 });
        // Extra time for heatmap/canvas rendering
        await page.waitForTimeout(3000);
        // Use viewport screenshot (not fullPage) to avoid >7000px images
        await expect(page).toHaveScreenshot("homepage.png", {
            fullPage: false,
        });
    });

    test("molecule structures are visible", async ({ page }) => {
        await page.goto("/");
        await page.waitForSelector(".MoleculeView", { timeout: 60000 });
        await page.waitForTimeout(2000);
        const firstMolecule = page.locator(".MoleculeView").first();
        await expect(firstMolecule).toHaveScreenshot("first-molecule.png");
    });

    test("SMILES text is visible", async ({ page }) => {
        await page.goto("/");
        await page.waitForSelector(".MoleculeView", { timeout: 60000 });
        await page.waitForTimeout(2000);
        // Check SMILES characters are rendered
        const smilesText = page.locator(".smiles-vis").first();
        await expect(smilesText).toBeVisible();
    });

    test("app bar renders correctly", async ({ page }) => {
        await page.goto("/");
        await page.waitForSelector(".MoleculeView", { timeout: 60000 });
        await page.waitForTimeout(1000);
        const header = page.locator("header").first();
        if (await header.isVisible()) {
            await expect(header).toHaveScreenshot("app-bar.png");
        }
    });
});
