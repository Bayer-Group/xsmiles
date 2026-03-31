import moleculesDatasetService from "../services/molecules.dataset.service";
import { MoleculeFromJson } from "../types/molecule.types";

// Sample molecule data matching the project's JSON format
const sampleMolecules: MoleculeFromJson[] = [
    {
        string: "CCO",
        methods: [
            {
                name: "method1",
                scores: [0.5, -0.3, 0.8],
                attributes: { pred: 0.9 },
            },
            {
                name: "method2",
                scores: [-0.1, 0.4, 0.2],
                attributes: { pred: 0.7 },
            },
        ],
    },
    {
        string: "c1ccccc1",
        methods: [
            {
                name: "method1",
                scores: [0.1, -0.2, 0.3, -0.4, 0.5, -0.6, 0.7, -0.8],
                attributes: { pred: 0.5 },
            },
            {
                name: "method2",
                scores: [0.9, -0.9, 0.8, -0.8, 0.7, -0.7, 0.6, -0.6],
                attributes: { pred: 0.3 },
            },
        ],
    },
];

// Legacy format with "weights" instead of "scores"
const legacyMolecules = [
    {
        string: "CCO",
        methods: [
            {
                name: "legacy_method",
                weights: [0.1, 0.2, 0.3],
                attributes: {},
            },
        ],
    },
];

describe("MoleculesDatasetService", () => {
    describe("getVersionControlledData", () => {
        it("passes through data with scores", () => {
            const result =
                moleculesDatasetService.getVersionControlledData(
                    sampleMolecules,
                );
            expect(result).toHaveLength(2);
            expect(result[0].string).toBe("CCO");
            expect(result[0].methods[0].scores).toEqual([0.5, -0.3, 0.8]);
        });

        it("converts legacy weights to scores", () => {
            const result =
                moleculesDatasetService.getVersionControlledData(
                    legacyMolecules,
                );
            expect(result[0].methods[0].scores).toEqual([0.1, 0.2, 0.3]);
            expect((result[0].methods[0] as any).weights).toBeUndefined();
        });
    });

    describe("preprocess", () => {
        it("adds id, index, std, mean, maxStd to each molecule", () => {
            const result = moleculesDatasetService.preprocess(sampleMolecules);
            expect(result).toHaveLength(2);
            result.forEach((mol, i) => {
                expect(mol.index).toBe(i);
                expect(mol.id).toBeDefined();
                expect(typeof mol.std).toBe("number");
                expect(typeof mol.mean).toBe("number");
                expect(typeof mol.maxStd).toBe("number");
            });
        });

        it("does not mutate original data", () => {
            const originalScores = [...sampleMolecules[0].methods[0].scores];
            moleculesDatasetService.preprocess(sampleMolecules);
            expect(sampleMolecules[0].methods[0].scores).toEqual(
                originalScores,
            );
        });
    });

    describe("getSmallExample", () => {
        it("returns example dataset", () => {
            const example = moleculesDatasetService.getSmallExample();
            expect(example).toBeDefined();
            expect(Array.isArray(example)).toBe(true);
            expect(example.length).toBeGreaterThan(0);
        });

        it("each molecule has string and methods", () => {
            const example = moleculesDatasetService.getSmallExample();
            example.forEach((mol) => {
                expect(mol.string).toBeDefined();
                expect(Array.isArray(mol.methods)).toBe(true);
                mol.methods.forEach((method) => {
                    expect(method.name).toBeDefined();
                    expect(Array.isArray(method.scores)).toBe(true);
                });
            });
        });
    });

    describe("getMethodsNames", () => {
        it("returns unique method names", () => {
            const names =
                moleculesDatasetService.getMethodsNames(sampleMolecules);
            expect(names).toContain("method1");
            expect(names).toContain("method2");
            expect(names.size).toBe(2);
        });

        it("returns empty set for empty array", () => {
            const names = moleculesDatasetService.getMethodsNames([]);
            expect(names.size).toBe(0);
        });
    });

    describe("cloneData", () => {
        it("returns a deep copy", () => {
            const clone = moleculesDatasetService.cloneData(sampleMolecules);
            expect(clone).not.toBe(sampleMolecules);
            // mutate clone and verify original unchanged
            clone[0].methods[0].scores[0] = 999;
            expect(sampleMolecules[0].methods[0].scores[0]).toBe(0.5);
        });
    });

    describe("filterOutliers", () => {
        it("filters extreme outliers using IQR", () => {
            const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100];
            const filtered = moleculesDatasetService.filterOutliers(data);
            expect(filtered).not.toContain(100);
        });

        it("keeps reasonable values", () => {
            const data = [1, 2, 3, 4, 5];
            const filtered = moleculesDatasetService.filterOutliers(data);
            expect(filtered).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe("sortRowsByRankingType", () => {
        it("sorts by ORIGINAL index", () => {
            const preprocessed =
                moleculesDatasetService.preprocess(sampleMolecules);
            const sorted = moleculesDatasetService.sortRowsByRankingType(
                preprocessed,
                "ORIGINAL",
            );
            expect(sorted[0].index).toBeLessThanOrEqual(sorted[1].index);
        });
    });
});
