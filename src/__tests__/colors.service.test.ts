import colorsService from "../services/colors.service";

describe("ColorsService", () => {
    describe("mid", () => {
        it("returns middle index", () => {
            expect(colorsService.mid(["a", "b", "c", "d", "e"])).toBe(2);
        });

        it("returns floor for even-length arrays", () => {
            expect(colorsService.mid(["a", "b", "c", "d"])).toBe(2);
        });
    });

    describe("setMidColorGray", () => {
        it("replaces middle color with light gray", () => {
            const colors = ["#ff0000", "#00ff00", "#0000ff"];
            const result = colorsService.setMidColorGray(colors);
            expect(result[1]).toBe("#f1f1f1");
            // should not mutate original
            expect(colors[1]).toBe("#00ff00");
        });
    });

    describe("getPaletteByName", () => {
        it("returns a palette for known ColorBrewer name", () => {
            const palette = colorsService.getPaletteByName("PRGn", 5);
            expect(palette.name).toContain("PRGn");
            expect(palette.colors).toHaveLength(5);
        });

        it("returns fallback palette for unknown name", () => {
            const palette = colorsService.getPaletteByName("nonexistent");
            expect(palette).toBeDefined();
            expect(palette.name).toBeDefined();
        });

        it("handles name with size suffix like 'PRGn_5'", () => {
            const palette = colorsService.getPaletteByName("PRGn_5");
            expect(palette.colors).toHaveLength(5);
        });

        it("handles reverse flag", () => {
            const normal = colorsService.getPaletteByName("PRGn", 5, false);
            const reversed = colorsService.getPaletteByName("PRGn", 5, true);
            expect(reversed.colors[0]).toBe(
                normal.colors[normal.colors.length - 1],
            );
        });
    });

    describe("getDivergingColorblindSafePalettes", () => {
        it("returns array of palettes", () => {
            const palettes = colorsService.getDivergingColorblindSafePalettes();
            expect(Array.isArray(palettes)).toBe(true);
            expect(palettes.length).toBeGreaterThan(0);
            palettes.forEach((p) => {
                expect(p.name).toBeDefined();
                expect(Array.isArray(p.colors)).toBe(true);
            });
        });

        it("includes reversed palettes by default", () => {
            const palettes = colorsService.getDivergingColorblindSafePalettes();
            const hasReverse = palettes.some((p) => p.name.includes("reverse"));
            expect(hasReverse).toBe(true);
        });

        it("excludes reversed palettes when requested", () => {
            const palettes = colorsService.getDivergingColorblindSafePalettes(
                [5],
                false,
            );
            const hasReverse = palettes.some((p) => p.name.includes("reverse"));
            expect(hasReverse).toBe(false);
        });
    });

    describe("equalPalettes", () => {
        it("returns true for identical palettes", () => {
            const p = { name: "test", colors: ["#000", "#fff"] };
            expect(colorsService.equalPalettes(p, { ...p })).toBe(true);
        });

        it("returns false for different names", () => {
            const p1 = { name: "a", colors: ["#000"] };
            const p2 = { name: "b", colors: ["#000"] };
            expect(colorsService.equalPalettes(p1, p2)).toBe(false);
        });
    });

    describe("interpolate", () => {
        it("returns a chroma scale function", () => {
            const scale = colorsService.interpolate([
                "#ff0000",
                "#ffffff",
                "#0000ff",
            ]);
            expect(typeof scale).toBe("function");
            // should return a color at 0
            const color = scale(0);
            expect(color).toBeDefined();
        });
    });

    describe("domain3to5", () => {
        it("expands a 3-element domain to 5 elements", () => {
            const result = colorsService.domain3to5([-1, 0, 1]);
            expect(result).toHaveLength(5);
            // should include 0 for diverging
            expect(result).toContain(0);
        });
    });
});
