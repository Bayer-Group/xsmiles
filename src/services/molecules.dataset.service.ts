import { mean, std } from "../util";
import {
    Method,
    MoleculeFromJson,
    ProcessedMoleculeFromJson,
} from "../types/molecule.types";

import moleculeStructureService from "./molecule/molecule.structure.service";
import moleculeMethodService from "./molecule/molecule.method.service";
import { example } from "./assets/data.example";
import { RankingType } from "src/types/app.types";

import {
    zScore,
    standardDeviation,
} from "simple-statistics";

class MoleculesDatasetService {
    public getVersionControlledData(json: any): MoleculeFromJson[] {
        return json.map((molecule: any) => {
            return {
                string: molecule.string,
                sequence: molecule.sequence
                    ? [...molecule.sequence]
                    : undefined,
                attributes: { ...molecule.attributes },
                index: molecule.index ? molecule.index : undefined,
                methods: molecule.methods.map((method: any) => {
                    if (method.scores) {
                        return { ...method };
                    } else {
                        // if old version, contains "weights"
                        var newMethod = {
                            ...method,
                            scores: [...method.weights],
                        };
                        delete newMethod.weights;
                        return newMethod;
                    }
                }),
            };
        });
    }

    private getScoresFromMolecule(
        molecule: MoleculeFromJson,
        methodName: string
    ) {
        const method: Method | undefined = molecule.methods.find(
            (m) => m.name === methodName
        );
        if (method) {
            return molecule.methods.find((m) => m.name === methodName)!.scores;
        } else {
            return [0, 0, 1];
        }
    }

    private getScoresFromMolecules(
        molecules: MoleculeFromJson[],
        method: string
    ) {
        return molecules
            .map((m) => this.getScoresFromMolecule(m, method))
            .reduce((v1, v2) => {
                return [...v1, ...v2];
            }, []);
    }

    private getSignedMeanScoreFromMoleculesNoOutliers(
        molecules: MoleculeFromJson[],
        method: string
    ) {
        const scores = this.filterOutliers(
            this.getScoresFromMolecules(molecules, method)
        );
        return {
            negative: mean(scores.filter((s) => s < 0)),
            positive: mean(scores.filter((s) => s > 0)),
        };
    }

    private getSignedStdScoreFromMoleculesNoOutliers(
        molecules: MoleculeFromJson[],
        method: string
    ) {
        const scores = this.filterOutliers(
            this.getScoresFromMolecules(molecules, method)
        );
        return {
            negative: standardDeviation(scores.filter((s) => s < 0)),
            positive: standardDeviation(scores.filter((s) => s > 0)),
        };
    }

    private getSignedMinMaxScoreFromMolecules(
        molecules: MoleculeFromJson[],
        method: string
    ) {
        const scores = this.getScoresFromMolecules(molecules, method);
        const negativeScores = this.getNegativeScores(scores);
        const positiveScores = this.getPositiveScores(scores);

        return {
            negative: {
                min: Math.min(...negativeScores),
                max: Math.max(...negativeScores),
            },
            positive: {
                min: Math.min(...positiveScores),
                max: Math.max(...positiveScores),
            },
        };
    }

    private getPositiveScores(scores: number[]) {
        return scores.filter((s) => s > 0);
    }

    private getNegativeScores(scores: number[]) {
        return scores.filter((s) => s < 0);
    }

    private signedZScore(
        score: number,
        sMean: {
            negative: number;
            positive: number;
        },
        sStd: {
            negative: number;
            positive: number;
        }
    ) {
        if (score < 0 && zScore(score, sMean.negative, sStd.negative) > 0) {
        }
        return score > 0
            ? zScore(score, sMean.positive, sStd.positive)
            : score < 0
            ? zScore(score, sMean.negative, sStd.negative)
            : score;
    }

    private normalize(score: number, min: number, max: number) {
        if (max - min === 0)
            throw new Error(
                "Max-Min should not be 0. Please code a logic for this case. E.g., score/scores.length, or 0.5."
            );

        return (score - min) / (max - min);
    }

    private signedNormalize(
        score: number,
        minMax: {
            negative: {
                min: number;
                max: number;
            };
            positive: {
                min: number;
                max: number;
            };
        },
        vectorSize: number
    ) {
        if (score > 0) {
            const { min, max } = minMax.positive;
            return max - min === 0
                ? score / vectorSize
                : this.normalize(score, min, max);
        }
        if (score < 0) {
            const { min, max } = minMax.negative;
            return max - min === 0
                ? score / vectorSize
                : -this.normalize(score, min, max);
        }
        return score;
    }

    private getMinMax(scores: number[]) {
        return { min: Math.min(...scores), max: Math.max(...scores) };
    }

    filterOutliers(someArray: number[]) {
        // Copy the values, rather than operating on references to existing values
        var values = someArray.concat();

        // Then sort
        values.sort(function (a: number, b: number) {
            return a - b;
        });

        /* Then find a generous IQR. This is generous because if (values.length / 4)
         * is not an int, then really you should average the two elements on either
         * side to find q1.
         */
        var q1 = values[Math.floor(values.length / 4)];
        // Likewise for q3.
        var q3 = values[Math.ceil(values.length * (3 / 4))];
        var iqr = q3 - q1;

        // Then find min and max values
        var maxValue = q3 + iqr * 1.5;
        var minValue = q1 - iqr * 1.5;

        // Then filter anything beyond or beneath these values.
        var filteredValues = values.filter(function (x) {
            return x <= maxValue && x >= minValue;
        });

        // Then return
        return filteredValues;
    }

    private standardizeMethodScores(
        molecules: MoleculeFromJson[],
        methodName: string
    ) {

        // First z-score
        const sStd = this.getSignedStdScoreFromMoleculesNoOutliers(
            molecules,
            methodName
        );
        const sMean = this.getSignedMeanScoreFromMoleculesNoOutliers(
            molecules,
            methodName
        );
        const scores = this.filterOutliers(
            this.getScoresFromMolecules(molecules, methodName)
        );
        const negativeScores = this.getNegativeScores(scores);
        const positiveScores = this.getPositiveScores(scores);
        const negativeMinMax = this.getMinMax(
            negativeScores.map((score) => this.signedZScore(score, sMean, sStd))
        );
        const positiveMinMax = this.getMinMax(
            positiveScores.map((score) => this.signedZScore(score, sMean, sStd))
        );

        // console.log("standardizeMethodScores");
        molecules.forEach((molecule) => {
            const method = molecule.methods.find((m) => m.name === methodName)!;
            method.scores = method.scores.map((score) => {
                if (score < 0) {
                    const newScore =
                        this.signedZScore(score, sMean, sStd) -
                        Math.abs(negativeMinMax.max);
     
                    const min =
                        negativeMinMax.min - Math.abs(negativeMinMax.max);
                    return newScore > 0 ? 0 : newScore < min ? min : score;
                }
                if (score > 0) {
                    const newScore =
                        this.signedZScore(score, sMean, sStd) +
                        Math.abs(positiveMinMax.min);
                    const max =
                        positiveMinMax.max + Math.abs(positiveMinMax.min);
                    return newScore < 0 ? 0 : newScore > max ? max : newScore;
                }
                return 0;
            });
        });

        // this.divergingNormalize(molecules, methodName);
    }
    divergingNormalize(molecules: MoleculeFromJson[], methodName: string) {
        const scores = this.getScoresFromMolecules(molecules, methodName);
        const negativeScores = this.getNegativeScores(scores);
        const positiveScores = this.getPositiveScores(scores);
        const negativeMinMax = this.getMinMax(negativeScores);
        const positiveMinMax = this.getMinMax(positiveScores);
        let max = Math.max(
            Math.abs(negativeMinMax.min),
            // Math.abs(negativeMinMax.max),
            positiveMinMax.max
        );

        molecules.forEach((molecule) => {
            const method = molecule.methods.find((m) => m.name === methodName)!;
            method.scores = method.scores.map((score) => {
                if (score < 0) {
                    return -this.normalize(score, -max, 0);
                }
                if (score > 0) {
                    return this.normalize(score, 0, max);
                }
                return 0;
            });
        });
    }

    private standardizeMethodsScores(molecules: MoleculeFromJson[]) {
        molecules = this.cloneData(molecules);
        // console.log("Normalizing", this.getMethodsNames(molecules));
        this.getMethodsNames(molecules).forEach((methodName) => {
            // console.log("Normalizing", methodName);
            this.standardizeMethodScores(molecules, methodName);
        });
        return molecules;
    }

    /**
     * Add `index`, `maxStd`, `std` and `mean` to each element (smiles) of Data.
     * - `id`: the unique ID of this element;
     * - `maxStd`: the maximum standard deviation among all calculated for each method;
     * - `std`: the standard deviation among all methods;
     * - `mean`: the average scores among all methods.
     * @param molecules A Data object with SMILES strings, attributes and scores.
     */
    public preprocess = (
        molecules: MoleculeFromJson[],
        scale: boolean = false
    ): ProcessedMoleculeFromJson[] => {
        const copy = this.cloneData(molecules);

        if (copy) {
            // console.log("Preprocessing");
            const date = Date.now();
            return copy.map((moleculeFromJson: MoleculeFromJson, i: number) => {
                const scores =
                    moleculeMethodService.scoresFromMethods(moleculeFromJson);
                const id = `${i}_${moleculeFromJson.string}_${date}`;
                return {
                    ...moleculeFromJson,
                    index: i,
                    id,
                    maxStd: Math.max(
                        ...moleculeFromJson.methods.map((method: Method) =>
                            std(method.scores)
                        )
                    ),
                    std: std(scores),
                    mean: mean(scores),
                };
            });
        }
        return copy;
    };

    /**
     * Deep clone a Data object.
     * @param molecules
     * @returns
     */
    public cloneData = (molecules: MoleculeFromJson[]): MoleculeFromJson[] => {
        return molecules
            ? molecules.map((molecules) =>
                  moleculeStructureService.cloneMoleculeFromJson(molecules)
              )
            : molecules;
    };

    public getSmallExample = (): MoleculeFromJson[] => {
        return example;
    };

    public getMethodsNames(molecules: MoleculeFromJson[]) {
        let methodsNames: Set<string> = new Set();
        molecules &&
            molecules.forEach(
                (molecule: MoleculeFromJson, i: number) =>
                    molecule != null &&
                    molecule.methods != null &&
                    molecule.methods.forEach((method, j) => {
                        methodsNames.add(method.name);
                    })
            );
        return methodsNames;
    }

    /**
     * Gets attributes names
     * @returns  Vector with attribute's names from the json file.
     */
    public getAttributesNames(molecules: ProcessedMoleculeFromJson[]) {
        if (molecules && molecules.length > 0 && molecules[0].attributes) {
            return Object.keys(molecules[0].attributes);
        } else {
            return [];
        }
    }

    sortRowsByRankingType(
        moleculesDataset: ProcessedMoleculeFromJson[],
        type: RankingType
    ) {
        // const molecules = moleculesDataset.map((molecule) => moleculeStructureService.cloneMolecule(molecule));
        const molecules = [...moleculesDataset];
        switch (type) {
            case "ORIGINAL":
                molecules.sort(
                    (
                        a: ProcessedMoleculeFromJson,
                        b: ProcessedMoleculeFromJson
                    ) => a.index - b.index
                ); // ascending
                break;
            case "AVERAGE":
                molecules.sort(
                    (
                        a: ProcessedMoleculeFromJson,
                        b: ProcessedMoleculeFromJson
                    ) => b.mean - a.mean
                ); // descending
                break;
            case "INNER_STD":
                molecules.sort(
                    (
                        a: ProcessedMoleculeFromJson,
                        b: ProcessedMoleculeFromJson
                    ) => b.maxStd - a.maxStd
                ); // descending
                break;
            case "STD":
                molecules.sort(
                    (
                        a: ProcessedMoleculeFromJson,
                        b: ProcessedMoleculeFromJson
                    ) => b.std - a.std
                ); // descending
                break;
            default: // descending
                molecules.sort(
                    (
                        a: ProcessedMoleculeFromJson,
                        b: ProcessedMoleculeFromJson
                    ) => {
                        if (typeof a.attributes![type] === "number") {
                            let valueA: number = Number(a.attributes![type]);
                            let valueB: number = Number(b.attributes![type]);
                            return valueB - valueA;
                        } else {
                            let valueA: string = String(a.attributes![type]);
                            let valueB: string = String(b.attributes![type]);
                            return valueA.localeCompare(valueB);
                        }
                    }
                );
                break;
        }
        return molecules;
    }
}

export default new MoleculesDatasetService();
