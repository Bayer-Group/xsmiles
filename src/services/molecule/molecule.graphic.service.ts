import { SmilesElement } from "../../types/molecule.types";
import moleculeStructureService from "./molecule.structure.service";

class SmilesGraphicService {
    public setHoverOfAllSmilesElements(atomElements: SmilesElement[], hover: boolean = true) {
        atomElements.forEach((sElement) => (sElement.vertex!.hover = hover));
    }

    public setHoverOfBranchGivenElement(smilesElements: SmilesElement[], smilesElement: SmilesElement, hover: boolean = true) {
        let branches = smilesElement.branchesIds;
        let elementsInBranch = moleculeStructureService.getElementsIfInAllBranches(smilesElements, branches || []);
        this.setHoverOfAllSmilesElements(elementsInBranch, hover);
    }

    public setHoverOfAtom(smilesElement: SmilesElement, hover: boolean = true) {
        if (smilesElement.vertex) smilesElement.vertex.hover = hover;
    }

    public setHoverOfRingGivenElement(smilesElements: SmilesElement[], smilesElement: SmilesElement, hover: boolean = true) {
        let smilesElementsInRing = smilesElements.filter(
            (e) => smilesElement.rings && smilesElement.rings.some((c) => e.rings && e.rings.includes(c))
        );
        this.setHoverOfAllSmilesElements(smilesElementsInRing, hover);
    }

    public setVerticesHoverStateBasedOnType(smilesElements: SmilesElement[], hoverElements: SmilesElement[], hover: boolean = true) {
        // special chars/elements also have a vertex associated
        // console.log("TB hover", smilesElements, hoverElements);
        hoverElements.forEach((e) => {
            if (e.vertex) e.vertex.hover = false;
        });
        hoverElements.forEach((hoverSmilesElement) => {
            if (hoverSmilesElement.chars === "(" || hoverSmilesElement.chars === ")") {
                // if a branching element -> highligh entire branch
                this.setHoverOfBranchGivenElement(smilesElements, hoverSmilesElement, hover);
            } else {
                if (!isNaN(Number(hoverSmilesElement.chars))) {
                    // if ring element (number), then highlight entire ring
                    this.setHoverOfRingGivenElement(smilesElements, hoverSmilesElement, hover);
                } else {
                    // if C, Cl, [, ]
                    // then it is an atom or group. [ and ] contains vertex.
                    // mouse-over 1 char will always highlight only 1 atom.
                    // when mouse-over 1 atom in the molecule structure,
                    // then we need to find the chars that represent that atom...
                    // it may be a group, e.g., [N+] has 4 chars and is represented by 1 vertex.
                    // console.log(hoverSmilesElement.chars, hoverSmilesElement.vertex);
                    this.setHoverOfAtom(hoverSmilesElement, hover);
                }
            }
        });
    }
}

export default new SmilesGraphicService();
