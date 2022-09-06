export type Method = {
    /**
     * Method's name.
     */
    name: string;
    /**
     * Atomic attributions vector. Each atom and/or special char from SMILES string must have a defined numeric score.
     */
    scores: number[];
    /**
     * Other attributes related to the method.
     */
    attributes: { [id: string]: number | string }; // attributes that are dependent on each method
};

export interface MoleculeFromJson {
    string: string;
    sequence?: string[]; // string[] = molecule.string.split(regex-for-smiles-string) -- if regex fails to recognize the atoms correctly, users can still upload this vector

    methods: Method[];
    attributes?: { [id: string]: number | string }; // attributes for each sequence, independent of method
    // attributes are used for sorting the smiles (rows)
    // attributes can be displayed under each smiles string
    index?: number;
}

export interface ProcessedMoleculeFromJson extends MoleculeFromJson {
    id: string;
    sequence?: string[];
    maxStd: number;
    std: number;
    mean: number;
    index: number;
}

/**
 * Represents a compound/smiles-string and its attributes, methods, etc.
 */
export interface RawMolecule {
    id: string;
    index: number;
    string: string;
    sequence?: string[]; // string[] = molecule.string.split(regex-for-smiles-string) -- if regex fails to recognize the atoms correctly, users can still upload this vector
    method: Method;
    attributes: { [id: string]: number | string }; // attributes for each sequence, independent of method
    // attributes are used for sorting the smiles (rows)
    // attributes can be displayed under each smiles string
}

export interface Molecule extends RawMolecule {
    smilesElements: SmilesElement[];
    sequence: string[];
    vertices: Vertex[] | undefined; // smilesElements is populated, later, each element is changed, a Vertex is attached with x,y coordinates... and vertices should be populated. It can be used as a flag, to know if vertices were already calculated.
}

/**
 * Contains attributes about one element from a SMILES string/object. E.g., "Cl", "(", "C".
 */
export type SmilesElement = {
    smilesIndex: number;
    chars: string;
    groupIndex: number;
    vertex: Vertex | null; //vertex is set only after drawer has drawn the molecule
    branchesIds: number[] | undefined;
    rings: number[] | undefined;
    score: number;
};

export type Vertex = {
    // score: number; // you can get score from tracking back to smilesElement.score
    position: { x: number; y: number };
    atomIndex: number;
    atomSmilesElement: SmilesElement;
    hover: boolean;
};

export type DomainByModelHash = {
    [id: string]: number[];
};

export type MoleculesDataset = MoleculeFromJson[] | null;
