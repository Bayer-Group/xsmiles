import moleculeMethodService from "../services/molecule/molecule.method.service";
import { MoleculeFromJson } from "../types/molecule.types";

const testMolecules: MoleculeFromJson[] = [
    {
        string: "CCO",
        methods: [
            { name: "m1", scores: [0.5, -0.3, 0.8], attributes: {} },
            { name: "m2", scores: [-0.1, 0.4, 0.2], attributes: {} },
        ],
    },
    {
        string: "c1ccccc1",
        methods: [
            {
                name: "m1",
                scores: [0.1, -0.9, 0.3, -0.4, 0.5, -0.6, 0.7, -0.8],
                attributes: {},
            },
            {
                name: "m2",
                scores: [0.9, -0.1, 0.8, -0.2, 0.7, -0.3, 0.6, -0.4],
                attributes: {},
            },
        ],
    },
];

describe("MoleculeMethodService", () => {
    describe("scoresFromMethods", () => {
        it("combines all method scores into one vector", () => {
            const scores = moleculeMethodService.scoresFromMethods(
                testMolecules[0],
            );
            // method1 has 3 scores, method2 has 3 scores => 6 total
            expect(scores).toHaveLength(6);
        });
    });

    describe("getDomainFromDataset", () => {
        it("returns symmetric domain [neg, 0, pos]", () => {
            const domain =
                moleculeMethodService.getDomainFromDataset(testMolecules);
            expect(domain).toHaveLength(3);
            expect(domain[1]).toBe(0);
            expect(domain[0]).toBe(-domain[2]); // symmetric
        });

        it("domain covers all scores", () => {
            const domain =
                moleculeMethodService.getDomainFromDataset(testMolecules);
            // min score in dataset is -0.9, max is 0.9 → range = 0.9
            expect(domain[0]).toBeLessThanOrEqual(-0.9);
            expect(domain[2]).toBeGreaterThanOrEqual(0.9);
        });
    });

    describe("getDomainFromMolecule", () => {
        it("returns symmetric domain for a single molecule", () => {
            const domain = moleculeMethodService.getDomainFromMolecule(
                testMolecules[0],
            );
            expect(domain).toHaveLength(3);
            expect(domain[1]).toBe(0);
            expect(Math.abs(domain[0])).toBe(Math.abs(domain[2]));
        });
    });

    describe("getDomainByModelHash", () => {
        it("returns hash with domain per method name", () => {
            const hash =
                moleculeMethodService.getDomainByModelHash(testMolecules);
            expect(hash["m1"]).toBeDefined();
            expect(hash["m2"]).toBeDefined();
            expect(hash["m1"]).toHaveLength(3);
            expect(hash["m1"][1]).toBe(0);
        });
    });

    describe("getDomainFromMoleculeByMethod", () => {
        it("returns domain for specific method", () => {
            const domain = moleculeMethodService.getDomainFromMoleculeByMethod(
                testMolecules[0],
                "m1",
            );
            expect(domain).toHaveLength(3);
            expect(domain[1]).toBe(0);
        });

        it("throws for unknown method", () => {
            expect(() =>
                moleculeMethodService.getDomainFromMoleculeByMethod(
                    testMolecules[0],
                    "nonexistent",
                ),
            ).toThrow();
        });
    });
});
