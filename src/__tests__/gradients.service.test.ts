import gradientsService from "../services/gradients.service";

describe("GradientService", () => {
    describe("getGradientConfig", () => {
        it("returns default config when called with no arguments", () => {
            const config = gradientsService.getGradientConfig();
            expect(config).toBeDefined();
            expect(config.palette).toBeDefined();
            expect(config.palette.name).toContain("PRGn");
            expect(config.blur).toBeDefined();
            expect(config.opacity).toBeDefined();
            expect(config.radius).toBeDefined();
            expect(config.delta).toBeDefined();
        });

        it("overrides defaults with provided config", () => {
            const config = gradientsService.getGradientConfig({
                blur: 0.9,
                highlight: true,
            });
            expect(config.blur).toBe(0.9);
            expect(config.highlight).toBe(true);
            // default palette still present
            expect(config.palette).toBeDefined();
        });

        it("adjusts radius based on bondLength", () => {
            const config = gradientsService.getGradientConfig({}, 100);
            expect(config.radius.max).toBe(90); // bondLength * 0.9
        });
    });

    describe("getColorDomainWithDefaultIfEmpty", () => {
        it("returns provided domain if length is 3", () => {
            const config = gradientsService.getGradientConfig();
            config.colorDomain = [-1, 0, 1];
            const domain = gradientsService.getColorDomainWithDefaultIfEmpty(
                config,
                [0.5, -0.3, 0.8],
            );
            expect(domain).toEqual([-1, 0, 1]);
        });

        it("calculates default symmetric domain from scores", () => {
            const config = gradientsService.getGradientConfig();
            config.colorDomain = []; // empty → auto
            const domain = gradientsService.getColorDomainWithDefaultIfEmpty(
                config,
                [0.5, -0.3, 0.8],
            );
            // max abs is 0.8, so domain should be [-0.8, 0, 0.8]
            expect(domain).toEqual([-0.8, 0, 0.8]);
        });
    });

    describe("getGradient", () => {
        it("creates a valid gradient object", () => {
            const config = gradientsService.getGradientConfig();
            config.colorDomain = [-1, 0, 1];
            const gradient = gradientsService.getGradient(config);
            expect(gradient.colors).toBeDefined();
            expect(gradient.colors.negative).toBeDefined();
            expect(gradient.colors.positive).toBeDefined();
            expect(gradient.opacity).toBeDefined();
            expect(gradient.radius).toBeDefined();
        });
    });

    describe("getThresholdsList", () => {
        it("returns predefined threshold configurations", () => {
            const list = gradientsService.getThresholdsList();
            expect(Array.isArray(list)).toBe(true);
            expect(list.length).toBeGreaterThan(0);
            // first one should be empty
            expect(list[0]).toEqual([]);
        });
    });

    describe("validation helpers", () => {
        it("validDelta rejects 0 and 1", () => {
            expect(gradientsService.validDelta(0)).toBe(false);
            expect(gradientsService.validDelta(1)).toBe(false);
        });

        it("validDelta accepts values between 0 and 1", () => {
            expect(gradientsService.validDelta(0.05)).toBe(true);
            expect(gradientsService.validDelta(0.5)).toBe(true);
        });

        it("validThresholds accepts empty thresholds", () => {
            expect(gradientsService.validThresholds([], 0.05)).toBe(true);
        });

        it("validThresholds rejects threshold too close to 0", () => {
            expect(gradientsService.validThresholds([0.01], 0.05)).toBe(false);
        });

        it("validColors checks length = thresholds.length + 2", () => {
            expect(gradientsService.validColors(["a", "b", "c"], [0.5])).toBe(
                true,
            );
            expect(gradientsService.validColors(["a", "b"], [0.5])).toBe(false);
        });
    });

    describe("adjustedThresForInterpolator", () => {
        it("maps 0 to 0.5", () => {
            expect(
                gradientsService.adjustedThresForInterpolator(0),
            ).toBeCloseTo(0.5);
        });

        it("maps -1 to 0", () => {
            expect(
                gradientsService.adjustedThresForInterpolator(-1),
            ).toBeCloseTo(0);
        });

        it("maps 1 to 1", () => {
            expect(
                gradientsService.adjustedThresForInterpolator(1),
            ).toBeCloseTo(1);
        });
    });

    describe("cloneGradientConfig", () => {
        it("creates a deep copy", () => {
            const config = gradientsService.getGradientConfig();
            const clone = gradientsService.cloneGradientConfig(config);
            clone.thresholds.push(999);
            expect(config.thresholds).not.toContain(999);
        });
    });
});
