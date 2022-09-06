import { isEmptyNullUndefined } from "../../util";
import {
    Molecule,
    Method,
    SmilesElement,
    MoleculeFromJson,
    ProcessedMoleculeFromJson,
    RawMolecule,
    Vertex,
} from "../../types/molecule.types"; 
import { Drawer } from "src/types/drawer.interface";

//TODO RENAMING - remove confusion: Smiles, SmilesElements, IndexedSmilesElements
class MoleculeStructureService {
    getCxSmilesWithScores(molecule: Molecule) {
        const notes = this.getAtomsScores(molecule)
            .map(
                (score: number, i: number) =>
                    `${i}.atomNote.${score.toFixed(2)}`
            )
            .join(":");
        const cxsmiles = `${molecule.string} |atomProp:${notes}|`;
        // window.RDKit.get_mol('O=C([O-])c1cncnc1 |atomProp:0.atomNote.-0.24:1.atomNote.0.11:2.atomNote.0.04:3.atomNote.0.04:4.atomNote.0.03:5.atomNote.-0.54:6.atomNote.0.07:7.atomNote.-0.54:8.atomNote.-0.24|')
        return cxsmiles;
    }

    public getAtomsScores(molecule: Molecule): number[] {
        return molecule.smilesElements
            .filter(this.smilesElementIsAtom)
            .map((smilesElement) => smilesElement.score);
    }

    createRawMolecule(
        processedJsonMolecule: ProcessedMoleculeFromJson,
        selectedMethod: Method
    ): import("../../types/molecule.types").RawMolecule {
        return {
            id: processedJsonMolecule.id,
            index: processedJsonMolecule.index,
            string: processedJsonMolecule.string,
            sequence: processedJsonMolecule.sequence, // string[] = molecule.string.split(regex-for-smiles-string) -- if regex fails to recognize the atoms correctly, users can still upload this vector
            method: selectedMethod,
            attributes: processedJsonMolecule.attributes
                ? processedJsonMolecule.attributes
                : {}, // attributes};
        };
    }

    getVerticesFromMolecule(molecule: Molecule): Vertex[] {
        if (isEmptyNullUndefined(molecule.smilesElements))
            throw new Error("indexedSmilesElements is null or empty");
        const vertices = molecule
            .smilesElements!.filter((element) => element.vertex != null)
            .map((element) => element.vertex!);
        // there are repeated vertices
        // console.log("Heatmap vertices:", Array.from(new Set(vertices)).length);
        return Array.from(new Set<Vertex>(vertices));
    }

    getHoveredVerticesFromMolecule(molecule: Molecule): Vertex[] {
        return this.getVerticesFromMolecule(molecule).filter(
            (v) => v.hover === true
        );
    }

    public getHoverStatusFromAtoms(indexedSmilesElements: SmilesElement[]) {
        return indexedSmilesElements.map((element) =>
            element.vertex ? element.vertex.hover : false
        );
    }
    public cloneMoleculeFromJson = (molecule: MoleculeFromJson) => {
        var copy = { ...molecule };
        copy.methods = [
            ...molecule.methods.map((method) => {
                return {
                    ...method,
                    scores: [...method.scores],
                };
            }),
        ];
        if (molecule.attributes) {
            copy.attributes = { ...molecule.attributes };
        }
        return copy;
    };

    public cloneMolecule = (molecule: Molecule) => {
        var copy = { ...molecule };
        if (molecule.attributes) {
            copy.attributes = { ...molecule.attributes };
        }
        return copy;
    };

    public cloneMethod = (method: Method) => {
        var copy = { ...method };
        if (method.attributes) {
            copy.attributes = { ...method.attributes };
        }
        return copy;
    };

    public getElementsIfInAllBranches(
        smilesElements: SmilesElement[],
        branches: number[]
    ) {
        const branch = smilesElements.filter((e) => {
            return branches.every((branchId) => {
                if (isEmptyNullUndefined(e.branchesIds)) return false;
                return e.branchesIds!.includes(branchId);
            });
        });
        return branch;
    }

    public setSmilesElementsBranches = (smilesElements: SmilesElement[]) => {
        var branchId = -1;
        const stack: number[] = [];
        smilesElements.forEach((smilesElement) => {
            if (smilesElement.chars === "(") {
                branchId += 1; // new id
                stack.push(branchId);
            }

            smilesElement.branchesIds = [...stack];
            if (smilesElement.chars === ")") {
                stack.pop();
            }
        });
    };

    public getRingContext = (
        indexedSmilesElements: SmilesElement[],
        start: number,
        visited: number[]
    ) => {
        if (start + 1 === indexedSmilesElements.length)
            return { visited: visited, lastIndex: start };

        const smiles = indexedSmilesElements;
        const startStr = smiles[start].chars;
        const hereVisited = [...visited];
        // visited numbers/rings signs
        hereVisited.push(start);
        let i = start + 1;
        let inGroup = smiles[i].chars === "[";
        // run through the smiles until finding the end char = start
        while (i < smiles.length && (smiles[i].chars !== startStr || inGroup)) {
            // move to the next smiles part
            i += 1;
            if (smiles[i].chars === "[") inGroup = true;
            if (smiles[i].chars === "]") inGroup = false;
        }

        if (i < smiles.length && smiles[i].chars === startStr) {
            hereVisited.push(i); // add the end sign to the list of numbers to be ignored
            return { visited: hereVisited, lastIndex: i };
        }
        // return null;
        return { visited: visited, lastIndex: i };
    };

    /**
     * Identify if the vector of smiles elements `smilesSequence` exists,
     * otherwise it creates such vector based on the `smilesString` using a regular
     * expression. The vector of scores provided in the method may refer to
     * smiles elements or atoms, e.g. in case only atom attributions were provided.
     * In this case, the function will attribute scores 0.0 to the special
     * characters of the smiles. This happens when the size of the `scores` vector
     * is smaller than the size of the `smilesElements` vector.
     * @returns Object with smiles elements and the method with respective scores.
     */
    //TODO split into 2
    public preprocessSmilesElementsAndMethod = (
        rawMolecule: RawMolecule
    ): Molecule => {
        const {
            string: smilesString,
            sequence: smilesSequence,
            method,
        } = rawMolecule;

        // MUST have valid smilesString **OR** smilesSequence
        if (
            (smilesString == null || smilesString.length === 0) &&
            (smilesSequence == null || smilesSequence.length === 0)
        )
            throw new Error("smilesString or smilesSequence must not be empty");

        let resultSmilesSequence = null;
        let resultSmilesMethod: Method = {
            name: "",
            scores: [],
            attributes: {},
        };
        if (smilesSequence != null) {
            // if smilesSequence (smiles elements) is defined
            // we don't need to extract a vector of smiles elements from the string
            resultSmilesSequence = smilesSequence;
            if (method != null) {
                resultSmilesMethod.name = method!.name;
                resultSmilesMethod.scores = method!.scores;
                if (method!.attributes != null)
                    resultSmilesMethod.attributes = method!.attributes;
            }
        } else {
            // if we must extract the smilesSequence vector from smilesString:
            const result = this.extractSmilesElementsAndMethods(
                smilesString,
                smilesSequence,
                method
            );
            resultSmilesSequence = result.smilesSequence;
            resultSmilesMethod = result.smilesMethod;
        }

        //TODO improve this logic...
        //! if we added Zeros because a smilesSequence was not provided...
        //! BUT the scores were indeed provided, including for special chars... and match the new resultSmilesSequence size, then:
        if (method != null && isEmptyNullUndefined(smilesSequence)) {
            if (method.scores.length === resultSmilesSequence.length) {
                resultSmilesMethod.scores = method!.scores;
            }
        }

        //TODO this is preprocessing... can we move to preprocess?
        const smilesElements = this.createSmilesElements(
            resultSmilesSequence,
            resultSmilesMethod!.scores
        );

        const molecule: Molecule = {
            ...rawMolecule,
            sequence: resultSmilesSequence,
            method: resultSmilesMethod,
            smilesElements,
            vertices: undefined,
        }; // indexed is false because smilesElements does not contain Vertex in its elements

        return molecule;
    };

    //TODO refactor: split into 2
    public extractSmilesElementsAndMethods(
        smilesString: string | undefined,
        smilesSequence: string[] | undefined,
        method: Method | undefined
    ) {
        if (smilesString == null || smilesString.length === 0) {
            smilesString = smilesSequence!.join();
        }
        const methodScores: number[] = [];

        var atoms: { vIndex: number; match: RegExpMatchArray }[] = [];
        atoms = this.parseAtoms(smilesString);

        // otherwise we need to parse the SMILES string and identify the special chars and atoms
        let resultSmilesSequence: string[] = [];
        let taken = new Set<number>();
        atoms.forEach((a: any) => {
            for (let i = 0; i < a.match[0].length; i++) {
                taken.add(a.match.index + i);
            }
        });
        let ss = smilesString.split("");
        ss.forEach((c, i) => {
            if (taken.has(i)) {
                // find element with that index, if it exists, add to the elements
                let atom = atoms.find((a: any) => a.match.index === i);
                if (atom != null) {
                    resultSmilesSequence.push(atom.match[0]);
                    methodScores.push(method!.scores![atom.vIndex]);
                }
            } else {
                resultSmilesSequence.push(c);

                //! if the method.scores vector only contains attributions for atoms (not special chars)
                //! we need to add a scores for the special chars, here score 0
                methodScores.push(0);
            }
        });

        let methodName: string = method ? method.name : "ND";
        let attributes = method ? method.attributes : {};
        return {
            smilesSequence: resultSmilesSequence,
            smilesMethod: {
                name: methodName,
                scores: methodScores,
                attributes,
            },
        };
    }

    public parseAtoms(smilesString: string) {
        const re = /(Cl?|Br?|[NOSPFIbcnosp*]|[[^]]+])/g;
        var atoms: { vIndex: number; match: RegExpMatchArray }[] = Array.from(
            smilesString.matchAll(re),
            (m, i) => {
                return { vIndex: i, match: m };
            }
        );
        return atoms;
    }

    public createSmilesElements(
        smilesSequence: string[],
        smilesScores: number[]
    ) {
        if (
            isEmptyNullUndefined(smilesSequence) ||
            smilesSequence.length !== smilesScores.length
        )
            throw new Error(
                "smilesElements and SmilesScores must have the same size and > 0"
            );

        let currentIndex = 0;
        let smilesElements: SmilesElement[] = [];
        let groupIndex: number = 0;
        let insideGroup: boolean = false;
        smilesSequence.forEach((e, i) => {
            if (e === "[") {
                groupIndex += 1;
                insideGroup = true;
            }
            smilesElements.push({
                smilesIndex: currentIndex,
                chars: e,
                groupIndex: insideGroup ? groupIndex : -1,
                vertex: null,
                branchesIds: undefined,
                rings: undefined,
                score: smilesScores[i],
            });
            currentIndex += 1;
            if (e === "]") {
                insideGroup = false;
            }
        });
        return smilesElements;
    }

    public findNonRingSmilesElements(indexedSmilesElements: SmilesElement[]) {
        return indexedSmilesElements.filter(
            (e) => e.vertex && isNaN(Number(e.chars))
        );
    }

    public getElementsInTheSameGroup(
        indexedSmilesElements: SmilesElement[],
        element: SmilesElement
    ) {
        return indexedSmilesElements.filter(
            (n) => n.groupIndex === element.groupIndex
        );
    }

    public setRingIdOfNumericalSmilesElements = (
        smilesElements: SmilesElement[]
    ) => {
        //each numerical element represents 1 ring
        // for each ring start, find its end and get all elements in the same level
        // get the intersection of the rings vectors
        // set the intersecting ID as the ring id for the starting and ending numbers in the smile
        let visitedElementsIndexes: number[] = [];
        let ringID: number = 0;
        for (let start = 0; start < smilesElements.length; start++) {
            let smileElement = smilesElements[start];
            // if it is a number and not visited yet, find the end of this ring
            if (
                !isNaN(Number(smileElement.chars)) &&
                !visitedElementsIndexes.includes(start) &&
                start < smilesElements.length - 1
            ) {
                const ringContext = this.getRingContext(
                    smilesElements,
                    start,
                    visitedElementsIndexes
                );
                const lastIndex = ringContext.lastIndex;
                visitedElementsIndexes = ringContext.visited;
                if (lastIndex > 0) {
                    // if found an end
                    smileElement.rings = [ringID];
                    let lastSmilesElement = smilesElements[lastIndex];
                    lastSmilesElement.rings = [ringID];
                    ringID += 1;
                } else {
                    console.warn(
                        "Could not find the end of this ring",
                        smilesElements.length,
                        start,
                        visitedElementsIndexes
                    );
                }
            }
        }
    };

    public setRingsIntoSmilesElements = (smilesElements: SmilesElement[]) => {
        // each numerical element represents 1 ring
        // for each ring start, find its end and get all elements in the same level (not branched)
        // adds the ring to the smileElement.rings list
        let visitedElementsIndexes: number[] = [];
        let ringID: number = 0;
        try {
            let inGroup: boolean = false;
            console.log(smilesElements.map((e) => e.chars).join(""));
            for (let start = 0; start < smilesElements.length; start++) {
                let smilesElement = smilesElements[start];
                if (smilesElement.chars === "[") {
                    inGroup = true;
                } else if (smilesElement.chars === "]") {
                    inGroup = false;
                }
                // if we are inside a Group, do not try to find a ring
                if (!inGroup) {
                    // if it is a number and not visited yet, find the end of this ring
                    if (
                        !isNaN(Number(smilesElement.chars)) &&
                        !visitedElementsIndexes.includes(start) &&
                        start < smilesElements.length - 1
                    ) {
                        const ringContext = this.getRingContext(
                            smilesElements,
                            start,
                            visitedElementsIndexes
                        );

                        const lastIndex = ringContext.lastIndex;
                        visitedElementsIndexes = ringContext.visited;
                        console.log(
                            "Ring Context",
                            visitedElementsIndexes,
                            lastIndex,
                            smilesElements[lastIndex],
                            smilesElement
                        );
                        if (lastIndex > 0) {
                            // if found an end
                            // set the ringId to the numerical smilesElement (they can only be in 1 ring because they define a ring)
                            smilesElement.rings = [ringID];
                            let lastSmilesElement = smilesElements[lastIndex];
                            lastSmilesElement.rings = [ringID];

                            this.appendRingToSmilesElements(
                                ringID,
                                start,
                                ringContext.lastIndex,
                                smilesElements
                            );

                            ringID += 1;
                        } else {
                            console.warn(
                                "Could not find the end of this ring",
                                smilesElements.length,
                                start,
                                visitedElementsIndexes
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.log(smilesElements);
            throw error;
        }
    };

    private appendRingToSmilesElements(
        ringID: number,
        start: number,
        end: number,
        smilesElements: SmilesElement[]
    ) {
        let branchStack = 0;
        let ringStack: string[] = [];

        for (let i = start + 1; i < end; i++) {
            let element = smilesElements[i];

            if (element.chars === "(") {
                branchStack += 1;
            } else if (element.chars === ")") {
                branchStack -= 1;
            } else {
                if (!isNaN(Number(element.chars))) {
                    if (ringStack.indexOf(element.chars) === -1) {
                        ringStack.push(element.chars);
                    } else {
                        ringStack = ringStack.filter(
                            (e) => e !== element.chars
                        );
                    }
                } else {
                    if (branchStack === 0) {
                        if (
                            ringStack.length === 0 ||
                            (ringStack.length === 1 &&
                                i + 1 < end &&
                                ringStack.indexOf(
                                    smilesElements[i + 1].chars
                                )) !== -1
                        )
                            if (isEmptyNullUndefined(element.rings)) {
                                element.rings = [ringID];
                            } else {
                                if (element.rings?.indexOf(ringID) === -1) {
                                    element.rings.push(ringID);
                                }
                            }
                    }
                }
            }
        }
    }

    public spreadVerticesToOtherSmilesElements(
        smilesElements: SmilesElement[]
    ) {
        /**
         * Recursively search forwards/backwards in the smiles vector to find the first element
         * that has a vertex .
         * @param i starting position
         * @param fwd true will increment i, false decrement
         * @returns the vertex or null if not found
         */
        const search: any = (i: number, fwd: boolean) => {
            let index: number = fwd ? i + 1 : i - 1;
            if (index >= smilesElements.length || index < 0) {
                return null;
            }
            let smilesElement = smilesElements.find(
                (e) => e.smilesIndex === index
            );
            if (smilesElement && smilesElement.vertex) {
                return smilesElement.vertex;
            } else {
                return search(index, fwd);
            }
        };

        smilesElements.forEach((e, i) => {
            if (e.vertex == null) {
                if (e.chars === ")" || !isNaN(Number(e.chars))) {
                    e.vertex = search(i, false);
                } else {
                    e.vertex = search(i, true);
                }
            }
        });
    }

    public findGVertexFromGroupedElements = (
        vertices: any[],
        groupedElements: SmilesElement[],
        findGVertex: (gVertices: any[], smilesElement: SmilesElement) => any
    ): any | undefined => {
        
        // because instead of the drawer, in the case of [N+] return the gVertex in the N, it returns it in the [... (or maybe in + or ])
       
        let i: number = 0;
        let gVertex = findGVertex(vertices, groupedElements[i]);
        while (!gVertex && i < groupedElements.length) {
            i += 1;
            const local_i = i; //resolve warning
            gVertex = findGVertex(vertices, groupedElements[local_i]);
        }
        return gVertex;
    };

    private setRingsInSmilesElements(
        smilesElements: SmilesElement[],
        gVertices: any[],
        findGVertex: (gVertices: any[], smilesElement: SmilesElement) => any
    ) {
        smilesElements.forEach((smilesElement) => {
            const gVertex = findGVertex(gVertices, smilesElement);
            smilesElement.rings =
                gVertex == null
                    ? []
                    : gVertex.value
                    ? gVertex.value.rings
                    : gVertex.rings;
        });
    }

    public notAtom = new Set([
        "[",
        "]",
        "h",
        "(",
        ")",
        "@",
        "#",
        "+",
        ".",
        "-",
        "=",
        "$",
        ":",
        "/",
        "\\",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
    ]);

    public smilesElementIsAtom = (smilesElement: SmilesElement) => {
        if (this.notAtom.has(smilesElement.chars)) return false;
        if (smilesElement.chars === "h" || smilesElement.chars === "H")
            return false;
        return true;
    };

    public smilesElementIsHydrogen = (smilesElement: SmilesElement) => {
        return smilesElement.chars.toUpperCase() === "H";
    };

    public setWhichElementIsInWhichRing(
        smilesElements: SmilesElement[],
        drawer: Drawer,
        findGVertex: (gVertices: any[], smilesElement: SmilesElement) => any
    ) {
        this.setRingsIntoSmilesElements(smilesElements);
    }

    public setVerticesInSmilesElements(
        smilesElements: SmilesElement[],
        drawer: Drawer,
        findGVertex: (gVertices: any[], smilesElement: SmilesElement) => any,
        createVertex: (
            smilesElement: SmilesElement,
            gVertex: any
        ) => Vertex | null,
        debug: boolean = false
    ) {
        // vertices from withing extendedSmilesDrawer
        let gVertices = drawer.getOriginalVerticesFromExternalDrawer();

        // console.log("Heatmap vertices from sD", gVertices.length);
        // Groups are already set
        debug &&
            console.log(
                "Group",
                smilesElements
                    .filter((e) => e.groupIndex !== -1)
                    .map((e) => e.chars)
            );

        // Reset Vertices, in case the drawer is changed... vertex should be cleaned up
        smilesElements.forEach((smilesElement) => {
            // if we have a [group]
            smilesElement.vertex = null;
        });

        // Set up Vertices, create new vertices for smilesElements that are atoms... (C, Cl, O, ...) the ones that are actually represented in the molecule diagram.
        smilesElements.forEach((smilesElement) => {
            if (
                this.smilesElementIsAtom(smilesElement) &&
                !this.smilesElementIsHydrogen(smilesElement)
            ) {
                let gVertex = findGVertex(gVertices, smilesElement);
                if (gVertex == null) {
               

                    if (smilesElement.groupIndex !== -1) {
                        const groupedElements = this.getElementsInTheSameGroup(
                            smilesElements,
                            smilesElement
                        );
                        gVertex = this.findGVertexFromGroupedElements(
                            gVertices,
                            groupedElements,
                            findGVertex
                        );
                    }
                }
                if (gVertex) {
                    smilesElement.vertex = createVertex(smilesElement, gVertex);
                } else {
                    console.error(
                        "Could not find gVertex for smilesElement",
                        smilesElement.chars,
                        smilesElement
                    );
                }
            }
        });

        //finding the vertex of grouped elements without vertex
        smilesElements.forEach((smilesElement) => {
            if (smilesElement.groupIndex !== -1) {
                const groupedElements = this.getElementsInTheSameGroup(
                    smilesElements,
                    smilesElement
                );
                if (smilesElement.vertex == null) {
                    const elementWithVertex = groupedElements.find(
                        (e) => e.vertex != null
                    );
                    if (elementWithVertex) {
                        smilesElement.vertex = elementWithVertex.vertex;
                    }
                }
            }
        });

        // Set up branches
        this.setSmilesElementsBranches(smilesElements);
        debug &&
            console.log(
                "Branches",
                smilesElements
                    .filter((element) => element.branchesIds!.length > 0)
                    .map((e) => e.chars)
            );

        this.spreadVerticesToOtherSmilesElements(smilesElements);

        debug &&
            console.log(
                "vertices",
                smilesElements.map((e) => e.vertex)
            );

        this.setWhichElementIsInWhichRing(smilesElements, drawer, findGVertex);
    }

    public getNAtomsFromSmilesString(smilesString: string): number {
        return this.parseAtoms(smilesString).length;
    }
}

export default new MoleculeStructureService();
