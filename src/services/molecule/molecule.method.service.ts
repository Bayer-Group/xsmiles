import { ColorDomainType } from "src/types/app.types";
import { Method, MoleculeFromJson } from "../../types/molecule.types";
import moleculesDatasetService from "../molecules.dataset.service";
class MoleculeMethodService {
    /**
     * Combine scores stored in each method into one vector.
     * @param methods Method objects with scores vector.
     * @returns all scores in one vector
     */
    public scoresFromMethods = (molecule: MoleculeFromJson) =>
        molecule.methods.reduce((prev: number[], current) => [...current.scores, ...prev], []);

    public getDomainByModelHash(molecules: MoleculeFromJson[]) {
        const domainByModel: any = {};
        const methodsNames: Set<string> = moleculesDatasetService.getMethodsNames(molecules);
        Array.from(methodsNames).forEach((name) => {
            domainByModel[name] = [0, 0, 0];
            if (molecules) {
                molecules.forEach(
                    (molecule, i) =>
                        molecule != null &&
                        molecule.methods != null &&
                        molecule.methods
                            .filter((method) => method.name === name)
                            .forEach((method, j) => {
                                let min = Math.min(...method.scores);
                                let max = Math.max(...method.scores);
                                if (domainByModel[name][0] > min) domainByModel[name][0] = min;
                                if (domainByModel[name][2] < max) domainByModel[name][2] = max;
                            })
                );
                let minAbs = Math.abs(domainByModel[name][0]);
                let maxAbs = Math.abs(domainByModel[name][2]);
                let range = minAbs > maxAbs ? minAbs : maxAbs;

                domainByModel[name][0] = -1 * range;
                domainByModel[name][2] = range;
            }
        });
        return domainByModel;
    }

    public getDomainFromDataset(molecules: MoleculeFromJson[]) {
        let globalScoresDomain: number[] = [0, 0, 0];
        molecules &&
            molecules.forEach(
                (molecule, i) =>
                    molecule != null &&
                    molecule.methods != null &&
                    molecule.methods.forEach((method, j) => {
                        let min = Math.min(...method.scores);
                        let max = Math.max(...method.scores);
                        if (globalScoresDomain[0] > min) globalScoresDomain[0] = min;
                        if (globalScoresDomain[2] < max) globalScoresDomain[2] = max;
                    })
            );

        let minAbs = Math.abs(globalScoresDomain[0]);
        let maxAbs = Math.abs(globalScoresDomain[2]);
        let range = minAbs > maxAbs ? minAbs : maxAbs;
        globalScoresDomain[0] = -1 * range;
        globalScoresDomain[2] = range;
        return globalScoresDomain;
    }

    public getDomainFromMolecule(molecule: MoleculeFromJson) {
        let minScore: number = 0;
        let maxScore: number = 0;

        molecule.methods.forEach((method: any) => {
            let min = Math.min(...method.scores);
            let max = Math.max(...method.scores);
            if (minScore > min) minScore = min;
            if (maxScore < max) maxScore = max;
        });

        let minScoreAbs = Math.abs(minScore);
        let maxScoreAbs = Math.abs(maxScore);
        let range = minScoreAbs < maxScoreAbs ? maxScoreAbs : minScoreAbs;

        // return domain [Negative, 0, Positive] - equally spaced
        return [-1 * range, 0, range];
    }

    public getDomainFromMoleculeByMethod(molecule: MoleculeFromJson, methodName: string) {
        const method = molecule.methods.find((m: any) => m.name === methodName);
        if (method == null) throw new Error("Method not defined");

        let minScore: number = 0;
        let maxScore: number = 0;

        let min = Math.min(...method!.scores);
        let max = Math.max(...method!.scores);

        if (minScore > min) minScore = min;
        if (maxScore < max) maxScore = max;

        const minScoreAbs = Math.abs(minScore);
        const maxScoreAbs = Math.abs(maxScore);
        const range = minScoreAbs < maxScoreAbs ? maxScoreAbs : minScoreAbs;

        // return domain [Negative, 0, Positive] - equally spaced
        return [-1 * range, 0, range];
    }

    public getColorDomainByType(
        colorDomainType: ColorDomainType,
        globalScoresDomain: number[],
        domainByModel: any,
        method?: Method,
        molecule?: MoleculeFromJson
    ): number[] {
        let domain: number[] = [];

        if (colorDomainType === "GLOBAL") {
            domain = globalScoresDomain;
        } else if (colorDomainType === "COL" && method) {
            domain = domainByModel[method.name];
        } else if (colorDomainType === "ROW" && molecule) {
            domain = this.getDomainFromMolecule(molecule);
        } else if (colorDomainType === "ROW_COL" && molecule && method) {
            domain = this.getDomainFromMoleculeByMethod(molecule, method.name);
        } else if (colorDomainType === "HALF") {
            domain = [-0.5, 0, 0.5];
        } else if (colorDomainType === "ONE_THIRD") {
            domain = [-0.333, 0, 0.333];
        } else if (colorDomainType === "ONE_TEN") {
            domain = [-0.1, 0, 0.1];
        } else if (colorDomainType === "ONLY_SIGNAL") {
            domain = [-0.00001, 0, 0.00001];
        } else {
            domain = [-1, 0, 1];
        }
        return domain;
    }
}

export default new MoleculeMethodService();
